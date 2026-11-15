# hibee0704/qwen3-1.7b-gyeongsang-lora

## Resumen

El modelo `hibee0704/qwen3-1.7b-gyeongsang-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3-1.7B. Lo publica el usuario hibee0704 en Hugging Face y su nombre sugiere una especialización en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano hablado en el sureste de la peninsula coreana. Se distribuye como un adaptador PEFT en formato safetensors, no como un modelo completo, por lo que requiere cargar el modelo base Qwen3-1.7B para funcionar.

El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parametros desarrollado por Alibaba Qwen, con soporte nativo de modo "thinking", tool calling y una ventana de contexto amplia. El adaptador hereda estas capacidades y las orienta hacia la generacion conversacional en un registro dialectal concreto, lo que lo hace relevante para proyectos de preservacion linguistica, investigación sociolinguistica o aplicaciones de chat en coreano regional.

La ficha del autor es una plantilla sin completar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni resultados de evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de aproximadamente 0,1 GB, coherente con un adaptador LoRA de bajo rango sobre un modelo de 1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen3-1.7B soporta contexto largo (consultar ficha oficial de Qwen) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite combinacion con el modelo base cuantizado, p. ej. bf16, int8, GGUF) |
| Idiomas soportados | no disponible oficialmente; por el nombre del modelo, orientado a coreano (dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del Qwen3-1.7B: un transformer decoder-only denso con atención completa y las innovaciones propias de la familia Qwen3 (modo de razonamiento explicito con etiquetas de pensamiento, soporte de tool calling y entrenamiento multilingue). El adaptador inyecta matrices de bajo rango en determinadas capas del modelo base, segun la configuracion PEFT 0.21.3 indicada en la model card.

El entrenamiento declarado es SFT (supervised fine-tuning) usando las librerias `transformers` y `trl`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el rango del LoRA, el alpha, el dropout ni la tasa de aprendizaje. Tampoco se documenta si hubo etapas de RLHF o DPO posteriores. Por el nombre del repositorio, la hipotesis mas razonable es que el dataset consista en pares instruccion-respuesta en dialecto gyeongsang, pero esto no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en coreano, presumiblemente con registro dialectal gyeongsang.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3-1.7B, aunque el fine-tuning puede haber degradado estas capacidades si el dataset era exclusivamente conversacional.
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el fine-tuning).
- Capacidad de modo "thinking" heredada de Qwen3 (no verificada en el adaptador).
- Capacidades multilingues del modelo base, potencialmente reducidas por el ajuste.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Preservacion y divulgacion del dialecto gyeongsang: el adaptador puede emplearse en chatbots divulgativos o educativos que respondan en este registro regional, aprovechando el ajuste especifico frente al modelo base.
- Investigacion sociolinguistica: generar corpus sinteticos en dialecto gyeongsang para estudios de variacion, comparando las salidas del adaptador con las del modelo base sin ajustar.
- Prototipos de asistentes conversacionales para usuarios coreanos del sureste: con 1.7B de parametros, el coste de inferencia es bajo y permite desplegar en local o en GPU de gama media.
- Aplicaciones de traduccion o normalizacion dialecto-estandar: usar el adaptador para reescribir textos en gyeongsang a coreano estandar, o al reves, si el dataset de entrenamiento lo cubria.
- Subtitulado o doblaje de contenido regional: generar dialogos en dialecto para series, podcasts o videojuegos ambientados en la region de Gyeongsang.
- Experimentacion academica con PEFT: sirve como ejemplo de adaptador LoRA de bajo coste sobre Qwen3-1.7B para estudiar el efecto del fine-tuning dialectal en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base Qwen3-1.7B en bf16: aproximadamente 3,5-4 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB; en 4 bits (GGUF Q4_K_M): alrededor de 1,2-1,5 GB.
- El adaptador LoRA anade un peso marginal (repo de 0,1 GB), por lo que no altera sustancialmente los requisitos.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia en bf16 o cuantizada; A100/H100 solo necesarias para entrenamiento o batch grande.
- Cabe en GPU consumer y en CPU con llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se cuantiza a GGUF.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hibee0704/qwen3-1.7b-gyeongsang-lora | 1.7B (base) + LoRA | no disponible | Adaptador LoRA sobre Qwen3-1.7B | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B | 1.7B | contexto largo (consultar ficha oficial) | Modelo completo denso | Apache 2.0 (segun ficha oficial de Qwen) | Hugging Face, ampliamente usado |
| Qwen/Qwen3-4B | 4B | contexto largo (consultar ficha oficial) | Modelo completo denso | Apache 2.0 (segun ficha oficial de Qwen) | Hugging Face |
| Modelos de dialecto coreano (p. ej. adaptadores comunitarios sobre Qwen o Llama) | variable | variable | LoRA/SFT | variable | Hugging Face (comunidad) |

No se dispone de datos de rendimiento comparativo del adaptador frente a alternativas.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos, hiperparametros, evaluacion ni sesgos, lo que impide validar su calidad de forma objetiva.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. El modelo base Qwen3-1.7B tiene su propia licencia que debe respetarse al combinar el adaptador.
- Riesgo de alucinacion y de sobreajuste al registro dialectal: al ser un SFT sobre un dataset no documentado, puede degradar capacidades generales (codigo, matematicas, tool calling) del modelo base.
- Idiomas no declarados oficialmente: la suposicion de coreano dialectal se basa unicamente en el nombre del repositorio.
- Sin descargas ni validacion de la comunidad: no hay evidencia de uso en produccion ni de calidad contrastada.
- El adaptador debe combinarse con el modelo base; no es un modelo autonomo y su comportamiento depende de la version exacta de Qwen3-1.7B.
- No se documentan sesgos sociolinguisticos ni de otro tipo; en un modelo dialectal esto es especialmente relevante para evitar estereotipos regionales.

## Enlaces

- Hugging Face: https://huggingface.co/hibee0704/qwen3-1.7b-gyeongsang-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de referencia sobre estimacion de emisiones (citado en la model card): https://arxiv.org/abs/1910.09700
