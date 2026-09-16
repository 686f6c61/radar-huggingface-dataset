# monsterovich/yue2-industrial-lora

## Resumen

YuE2 Industrial LoRA es un ajuste fino mediante LoRA del modelo de generacion musical YuE2-3B, publicado por el usuario monsterovich en HuggingFace. El adaptador especializa el modelo base en rock electronico industrial y cinematico, entrenado exclusivamente con 31 temas completos de los artistas Celldweller (18 pistas) y Blue Stahli (13 pistas). El objetivo es reproducir el caracter sonoro de ambos proyectos (industrial electronic rock, crossbreed, darkstep, industrial drum and bass) sin reentrenar el modelo completo.

Tecnicamente, el LoRA se aplica sobre la ruta NAR (non-autoregressive) del pipeline de YuE2, es decir, sobre las capas de atencion, los MLP y las cabezas vae2llm/llm2vae, mientras que la fase de planificacion AR (autoregressive) permanece intacta en el modelo base. Esto lo convierte en un adaptador ligero (rank 8, alpha 8) que modula la generacion de latentes de audio mas que la estructura musical de alto nivel.

El repositorio incluye tanto el modelo completo con el LoRA ya fusionado (`model/`) como el kernel del adaptador (`adapter/`), ademas del codigo de runtime `lora.py` y `lora_pipeline.py`. Su relevancia actual radica en ser un ejemplo de personalizacion de estilo sobre un modelo de generacion musical de 3B de parametros, con efectos medidos de forma explicita sobre la salida del modelo (desviaciones del 1,8%, 4,5% y 8,8% segun la escala del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base YuE2-3B (generacion musical basada en LLM, con etapa AR de planificacion y etapa NAR de flow-matching sobre latentes de VAE); el adaptador es un LoRA aplicado sobre la ruta NAR (atencion + MLP + cabezas vae2llm/llm2vae) |
| Parametros totales | Aproximadamente 3 000 millones (modelo base YuE2-3B, segun su denominacion); el LoRA anade parametros de bajo rango cuyo recuento no se especifica en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible; el prompt de estilo empleado en el entrenamiento esta redactado en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model/` con el LoRA fusionado, `adapter/lora.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo base YuE2-3B emplea un esquema de generacion musical en dos fases: una etapa autoregresiva (AR) de planificacion y una etapa no autoregresiva (NAR) de flow-matching que opera sobre latentes de un VAE de audio (YuE2-VAE). El LoRA de este repositorio interviene unicamente en la ruta NAR, superponiendose a las capas de atencion, a los bloques MLP y a las cabezas vae2llm/llm2vae; la planificacion AR se mantiene sobre el modelo base sin modificaciones. La fusion del adaptador se realizo con la herramienta `train/merge_lora.py` del repositorio YuE.

Los hiperparametros declarados son rank = 8 y alpha = 8, lo que da una escala alpha/r = 1,0. El entrenamiento uso 31 pistas completas (18 de Celldweller y 13 de Blue Stahli) durante 5 epocas, equivalentes a 155 pasos, con una tasa de aprendizaje de 1e-4, weight decay de 1e-2 y gradient checkpointing. La perdida MSE paso de 2,28 a 1,43. El autor mide el efecto del adaptador sobre la salida de velocidad del modulo NAR en un paso de flow-matching: con escala 1,0 (alpha 8) la desviacion respecto al modelo base es del 1,8%; con escala 1,5 (alpha 12), del 4,5%; y con escala 2,0 (alpha 16), del 8,8%. El modelo fusionado en `model/` se construyo con escala 2,0 (alpha 16), mientras que la escala 1,0 es la recomendada por el autor.

## Capacidades

- Generacion de musica de larga duracion: el modelo base produce pistas completas, y el LoRA orienta el resultado hacia el estilo industrial electronic rock, cinematic rock y drum and bass industrial.
- Condicionamiento por prompt de estilo: la cadena usada durante el entrenamiento incluye la expresion `in the style of Celldweller and Blue Stahli`, que actua como disparador de estilo.
- Generacion condicionada por tempo y subgenero: el ejemplo de la model card incluye indicaciones como `191 BPM`, `crossbreed`, `darkstep` o `techstep`.
- Ajuste de intensidad del estilo: la fuerza del adaptador se controla modificando `alpha` en `adapter/adapter_config.json` (escala = alpha/r).
- Dos modos de despliegue: modelo fusionado autocontenido o adaptador LoRA acoplado al modelo base sin modificar el checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de generacion musical).
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (vision, audio de entrada, thinking mode): no disponible.

## Casos de uso

- Produccion musical asistida por IA: generar bocetos de pistas completas en estilo industrial electronic rock a partir de un prompt de estilo, usando `model/` como punto de partida para la produccion.
- Composicion de referencia para artistas de metal industrial y drum and bass: el adaptador esta entrenado con material de Celldweller y Blue Stahli, por lo que sirve para generar referencias de estilo dentro de ese nicho concreto.
- Prototipado rapido de bandas sonoras cinematograficas: el prompt de ejemplo combina `dark cinematic electronic rock`, adecuado para generar material de referencia para trailers o scoring.
- Experimentacion con control de intensidad de estilo: variar `alpha` entre 8, 12 y 16 permite obtener desde una desviacion del 1,8% hasta el 8,8% respecto al modelo base, util para calibrar cuanto peso dar al estilo aprendido.
- Investigacion en adaptacion de modelos generativos de audio: el repositorio es un caso documentado de LoRA sobre la ruta NAR de un modelo de musica, con metricas de efecto por escala publicadas.
- Fine-tuning posterior: el autor indica que para seguir entrenando se necesita el dataset `train/dataset-celldweller-blue-stahli-full` (31 pares de tokens de codec y latentes de VAE de pistas completas).
- Integracion en pipelines existentes de YuE: el adaptador puede cargarse mediante `LoRAYuE2Pipeline` o a traves de `test.py` del repositorio YuE, lo que facilita incorporarlo a flujos de trabajo ya montados sobre ese modelo.
- Generacion de variaciones de estilo industrial DnB: el prompt de ejemplo cita `industrial drum and bass`, `darkstep` y `techstep`, lo que permite explorar esos subgeneros de forma dirigida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa proporcionada por el autor es la perdida de entrenamiento (MSE de 2,28 a 1,43) y la desviacion de la salida NAR respecto al modelo base segun la escala del adaptador:

| Escala | Alpha | Delta de salida (NAR, un paso de flow-matching) |
|---|---|---|
| 1,0 | 8 | 1,8% |
| 1,5 | 12 | 4,5% |
| 2,0 | 16 | 8,8% |

No constan valores de MMLU, HumanEval, GSM8K ni de metricas objetivas de calidad musical (FAD, CLAP, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada. El repositorio ocupa 7,3 GB, de los cuales el modelo fusionado a 3B de parametros en precision completa supone la mayor parte del peso. El autor documenta los modos `low_vram=True` y `offload_ar=True`, orientados a reducir el consumo de memoria descargando la etapa AR.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo base (3B) es razonable esperar funcionamiento en GPUs de consumo con suficiente VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090), pero esto es una estimacion no confirmada por el autor.
- Cabe en GPU de consumo: no confirmado explicitamente; los modos `low_vram` y `offload_ar` sugieren que el autor contempla entornos con memoria limitada.
- Opciones de despliegue: paquete `yue2` con `YuE2Pipeline.from_pretrained(...)` para el modelo fusionado; `lora_pipeline.LoRAYuE2Pipeline.from_pretrained("m-a-p/YuE2-3B", lora=...)` para cargar el adaptador sin fusionar; o el script `test.py` del repositorio YuE en modo `render`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.
- Dependencia adicional: se requiere el VAE (YuE2-VAE) presente en la cache de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monsterovich/yue2-industrial-lora | ~3B (base) + LoRA rank 8 | no disponible | MSE 2,28 → 1,43; delta NAR 1,8%-8,8% segun escala | no disponible | HuggingFace, 0 descargas, 0 likes |
| m-a-p/YuE2-3B (modelo base) | ~3B | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Otros modelos de generacion musical | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no ofrece comparaciones con alternativas, y la busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador esta entrenado con un corpus muy pequeno y especifico (31 pistas de dos artistas), por lo que esta fuertemente sesgado hacia el estilo y la produccion de Celldweller y Blue Stahli. Fuera de ese estilo, el comportamiento esperado es el del modelo base o una mezcla degradada.
- Riesgo de artefactos: el propio autor advierte que escalas altas (alpha 12 y 16) alejan la salida de la distribucion del modelo base e incrementan el riesgo de artefactos. La escala 1,0 es la recomendada y probada; el modelo fusionado en `model/` se construyo a escala 2,0, es decir, en la configuracion de mayor riesgo declarada.
- Sobreajuste por tamano de dataset: 155 pasos sobre 31 pistas completas es un entrenamiento muy corto y con datos limitados; la generalizacion a otros prompts o tempos no esta garantizada.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada. Se desconoce si permite uso comercial, y el material de entrenamiento procede de obras de artistas con derechos, lo que supone un riesgo legal adicional para uso comercial.
- Idiomas: no disponible. El unico prompt documentado esta en ingles.
- Limitacion de contexto: no disponible.
- Falta de benchmarks: no hay metricas objetivas de calidad musical ni comparaciones con otros modelos, por lo que la evaluacion depende de la escucha subjetiva.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Dependencias de ejecucion: requiere el paquete `yue2`, el VAE alojado en la cache de HuggingFace y, en el modo adaptador, los ficheros `lora.py` y `lora_pipeline.py` en `sys.path`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/monsterovich/yue2-industrial-lora
- Modelo base referenciado: https://huggingface.co/m-a-p/YuE2-3B
- Repositorio YuE (mencionado en la model card, contiene `test.py`, `train/merge_lora.py` y el runtime LoRA): https://github.com/multimodal-art-projection/YuE
- Dataset de entrenamiento citado por el autor: `train/dataset-celldweller-blue-stahli-full` (31 pares de tokens de codec y latentes de VAE)
- Resultados de la busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo (los resultados devueltos corresponden a foros de simulacion ferroviaria y a un sitio de tareas escolares, sin relacion con el modelo).
