# Ruurd/BYOD-Qwen2.5-7B

## Resumen

BYOD-Qwen2.5-7B es un modelo de lenguaje de difusion discreta enmascarada (masked discrete diffusion) publicado por el usuario Ruurd, obtenido mediante la conversion del modelo autoregresivo Qwen/Qwen2.5-7B-Instruct. El repositorio contiene un adaptador LoRA en formato PEFT (no es una variante cuantizada a 4 bits), y concretamente el checkpoint `best` del experimento `qwen-2.5-7b-mask`.

La relevancia del modelo es metodologica: demuestra que un LLM autoregresivo de 7B puede adaptarse a un esquema de denoising bidireccional entrenando adaptadores LoRA de rango 1024 sobre las proyecciones query y value. El modelo predice en paralelo todas las posiciones enmascaradas de la respuesta y las refina de forma iterativa, en lugar de generar token a token de izquierda a derecha. Como el adaptador puede fusionarse con el modelo base tras el entrenamiento, el modelo resultante conserva el mismo numero de parametros que el original.

Se trata de un modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta, publicado el 19 de septiembre de 2026, y que requiere codigo de inferencia especifico (la llamada estandar `generate()` de tipo causal no es el muestreador previsto). La licencia del adaptador es Apache 2.0, pero queda sujeta a los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer adaptado a difusion discreta enmascarada (masked discrete diffusion) con denoising bidireccional; LoRA de rango 1024 sobre proyecciones query y value |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-7B-Instruct; el recuento exacto no figura en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | El cargador de inferencia acepta un parametro `quantization` (la demo usa `"none"`); el repositorio no es una variante cuantizada. No se detallan mas opciones |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (el adaptador queda sujeto a los terminos del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`; ~1,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder autoregresivo, y lo convierte en un modelo de difusion discreta enmascarada. Para ello se entrenan adaptadores LoRA de rango 1024 sobre las proyecciones query y value del modelo base. El objetivo de entrenamiento es el denoising: el modelo recibe una secuencia con posiciones enmascaradas (con el token especial `MASK`) y aprende a predecir simultaneamente todas esas posiciones, refinando la salida de forma iterativa en lugar de generar de izquierda a derecha.

La configuracion del entrenamiento registra un maximo de 25000 actualizaciones del optimizador, y el repositorio incluye un `resolved_config.json` con los detalles exactos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO adicionales sobre el adaptador. Como innovacion practica destacable, el metodo BYOD (adaptacion de un modelo autoregresivo a difusion) permite reutilizar un checkpoint preentrenado existente y mantiene el recuento de parametros original una vez fusionado el adaptador.

En inferencia, el proceso de generacion se controla mediante parametros como `num_steps` (pasos de denoising), `noise_level`, `temperature`, `top_k`, `block_length`, `permanent_unmask`, `confidence_guided`, `proportional_unmask` y `confidence_eos_eot_inf`, lo que permite ajustar el compromiso entre calidad y numero de iteraciones.

## Capacidades

- Generacion de texto conversacional en formato pregunta-respuesta con prompt de sistema, mediante denoising iterativo en lugar de decodificacion autoregresiva.
- Prediccion paralela de posiciones enmascaradas, con desenmascarado guiado por confianza (`confidence_guided`).
- Rellenado y refinado iterativo de secuencias (infilling), ya que el objetivo de entrenamiento es reconstruir posiciones enmascaradas en cualquier punto de la secuencia.
- Generacion por bloques con `block_length` configurable (128 en el ejemplo de la model card).
- Control fino del muestreo: `noise_level`, `temperature`, `top_k`, `num_steps` y estrategia de desenmascarado.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (instrucciones, conversacion y conocimiento general), aunque no se documenta su grado de preservacion tras la conversion a difusion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no documentadas; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Investigacion en modelos de difusion discreta: reproducir el experimento `qwen-2.5-7b-mask` y comparar decodificacion paralela por denoising frente a la generacion autoregresiva del modelo base, usando los mismos prompts y midiendo calidad y numero de iteraciones.
- Infilling y edicion de texto: dado que el modelo se entrena para reconstruir posiciones enmascaradas, puede emplearse para completar huecos en parrafos, plantillas o codigo donde se conoce el contexto circundante pero no el fragmento central.
- Conversion de modelos autoregresivos propios a difusion: el enfoque BYOD sirve como receta para equipos que quieran adaptar sus propios checkpoints mediante LoRA de rango alto sin reentrenar desde cero, manteniendo el recuento de parametros tras fusionar el adaptador.
- Prototipado de generacion de baja latencia: el desenmascarado paralelo con `num_steps` y `block_length` configurables permite explorar regimenes en los que se generan varios tokens por paso, algo relevante para estudiar latencias alternativas a la decodificacion token a token.
- Estudio de controlabilidad del muestreo: los parametros `noise_level`, `temperature`, `top_k`, `permanent_unmask` y `proportional_unmask` permiten realizar barridos sistematicos para analizar como afecta cada hiperparametro a la diversidad y a la coherencia de la salida.
- Asistencia conversacional en entornos de investigacion: con el prompt de sistema adecuado, puede gestionar intercambios pregunta-respuesta simples siempre que las salidas se validen, dado su caracter de modelo de investigacion.
- Evaluacion de sesgos y seguridad en modelos de difusion: util para comparar si la conversion a denoising bidireccional altera la tasa de contenido repetitivo, sesgado o inseguro respecto al modelo base.
- Demostracion y docencia: la demo en ZeroGPU permite ilustrar en clase el funcionamiento de un modelo de difusion discreta a escala 7B sin infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base o con otros modelos de difusion.

## Requisitos de hardware

- El repositorio del adaptador ocupa ~1,3 GB (pesos LoRA en safetensors); para inferencia hay que cargar ademas el modelo base Qwen2.5-7B-Instruct.
- Con el adaptador fusionado, el modelo tiene el mismo tamano que el base: en FP16 se estiman en torno a 15-16 GB de VRAM solo para pesos, mas memoria para activaciones y el proceso iterativo de denoising.
- Cuantizaciones estimadas para un modelo de 7B: ~8 GB en 8 bits y ~5 GB en 4 bits (estimaciones generales, no verificadas por el autor en la informacion disponible).
- GPU recomendadas: A100 (40/80 GB), H100 y GPU de 24 GB como RTX 4090 o RTX 3090 para FP16. En GPU de consumo de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) FP16 resulta ajustado, por lo que seria preferible 8 bits.
- Si cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 en FP16 y en practicamente cualquier GPU de 8-16 GB con cuantizacion.
- Despliegue: la libreria prevista es `lad-generic` (funciones `load_hub_adapter_session` y `denoise`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la model card advierte explicitamente de que `generate()` causal no es el muestreador previsto. Existe una demo publica en ZeroGPU de Hugging Face.
- Latencia y throughput: no se publican mediciones. Como referencia de configuracion, el ejemplo oficial usa hasta 128 tokens nuevos con 64 pasos de denoising y `block_length=128`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BYOD-Qwen2.5-7B | 7B (igual que el base tras fusionar) | no disponible | Difusion discreta enmascarada con LoRA r=1024 | apache-2.0, sujeta a la del base | Hugging Face; 0 descargas, 0 likes |
| Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Transformer decoder autoregresivo | apache-2.0 | Hugging Face (modelo base, ampliamente utilizado) |
| Familias de difusion discreta de escala similar (por ejemplo, LLaDA y variantes) | no disponible | no disponible | Difusion discreta enmascarada | no disponible | no disponible en la informacion proporcionada |

La unica comparacion que puede establecerse con los datos disponibles es contra el modelo base: BYOD-Qwen2.5-7B conserva su tamano de parametros pero sustituye la decodificacion autoregresiva por denoising bidireccional y exige una libreria de inferencia distinta. No hay datos de rendimiento que permitan afirmar si iguala o supera al base en tareas concretas.

## Limitaciones y advertencias

- Modelo de investigacion: la propia model card advierte de que puede producir texto inexacto, repetitivo, sesgado o inseguro, y de que no debe usarse para decisiones de alto impacto sin verificacion independiente.
- Hereda las limitaciones del modelo base y de los datasets con los que este fue entrenado, incluyendo posibles sesgos sociales y culturales no cuantificados.
- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de veracidad; el entrenamiento con denoising no incluye mecanismos conocidos de mitigacion adicionales.
- Interpretacion del prompt y seguimiento de instrucciones: no se documenta en que medida se preservan las capacidades instruct del modelo base tras la conversion a difusion.
- Idiomas soportados: sin informacion; no se puede confirmar el comportamiento multilingue.
- Contexto: no se especifica la longitud de contexto soportada ni si el entrenamiento de denoising con `block_length=128` limita la generacion de secuencias largas.
- Licencia: el adaptador es apache-2.0, pero la model card indica que sigue sujeto a los terminos del modelo base; ademas, el acceso al modelo base puede requerir aceptar su licencia y usar un token de Hugging Face.
- Dependencia de codigo externo: requiere el repositorio `lad-generic` y sus funciones de inferencia; no funciona correctamente con `generate()` causal estandar.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes, sin resultados de benchmarks publicados, lo que impide contrastar su calidad.
- Tamano del adaptador: el rango 1024 eleva el adaptador a ~1,3 GB, mas pesado que un LoRA convencional de rango bajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ruurd/BYOD-Qwen2.5-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Demo en ZeroGPU: https://huggingface.co/spaces/Ruurd/byod-qwen2.5-7b
- Repositorio de inferencia `lad-generic`: https://github.com/RuurdKuiper/lad-generic
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo; los enlaces devueltos por el buscador corresponden a un perfil deportivo sin relacion con este lanzamiento.
