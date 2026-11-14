# chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6e

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6e es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario chevron7. El modelo base es un fine-tune de Qwen3.5-9B orientado al razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un senal de supervision centrada en matematicas y disciplinas STEM (aproximadamente 250.000 muestras). Este derivado aplica la tecnica Heretic v2.0.0.dev0 (Arbitrary-Rank Ablation) para eliminar los comportamientos de rechazo del modelo original.

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros totales en formato safetensors, con licencia Apache 2.0 y soporte para seis idiomas (ingles, chino, coreano, japones, espanol y ruso). Su interes practico radica en que combina el rendimiento de razonamiento de un modelo de 9B con una reduccion drastica de las negativas a responder: segun la model card, pasa de 100/100 rechazos en el modelo original a 3/100 en esta version, con una divergencia KL de 0.0422 respecto al base.

La relevancia actual es doble: por un lado, ofrece un modelo compacto (9B) desplegable en hardware consumer; por otro, documenta de forma transparente el proceso de abliteracion con parametros ARA concretos y metricas de evaluacion, lo que resulta util para investigadores que estudian tecnicas de eliminacion de alineamiento y sus efectos secundarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags del repo); detalles de atencion no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (tag "6-bit"); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); no se indica GGUF |
| Tamano del repo | 8.4 GB |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (finetune) |
| Metodo de decensurado | Heretic v2.0.0.dev0 (Arbitrary-Rank Ablation) |
| Pipeline | text-generation (tags incluyen image-text-to-text) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parametros. El entrenamiento del modelo base consistio en una destilacion desde DeepSeek-V4-Pro en modo Max Effect: se generaron respuestas del profesor y se usaron como senal de supervised fine-tuning (SFT) sobre aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. La model card menciona tambien etapas de RL (tags "rl", "gspo"), aunque no se detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

La innovacion principal de esta variante es la aplicacion de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0.dev0, una tecnica de edicion de pesos que identifica y neutraliza direcciones de activacion asociadas a comportamientos de rechazo. Los parametros publicados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0.8264, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9645 y neighbor_count 12. El resultado reportado es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0.0422 frente al modelo original, lo que indica un cambio moderado en la distribucion de salidas.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y STEM: el modelo base fue entrenado sobre aproximadamente 250.000 muestras de matematicas y ciencia.
- Generacion de codigo: la model card indica mejoras pequenas en programacion y uso de herramientas por transferencia entre dominios, aunque sin datos SFT especificos de codigo.
- Tool calling y function calling: los tags incluyen "tool-use" y "function-calling".
- Soporte de agentes y razonamiento multi-paso (tag "reasoning").
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento explicito (tags "reasoning", "thinking" no confirmado en la informacion disponible).
- Capacidad potencial de image-text-to-text segun el tag del repo, aunque no se detalla en la model card.
- Comportamiento decensurado: reduccion de rechazos a 3/100 segun la evaluacion del autor.

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede resolver problemas paso a paso y explicar la descomposicion, aprovechando su entrenamiento especifico en aproximadamente 250.000 muestras STEM.
- Investigacion sobre alineamiento y abliteracion: sirve como caso de estudio reproducible para analizar el efecto de ARA en un modelo de 9B, con parametros y metricas KL publicados.
- Generacion de codigo asistida en entornos de desarrollo: puede integrarse en pipelines de CI/CD mediante tool calling para tareas de generacion y revision de fragmentos, aunque sin garantias de calidad especificas de codigo.
- Agentes conversacionales multi-turno: el soporte de function calling y razonamiento multi-paso permite construir asistentes que encadenan llamadas a herramientas.
- Procesamiento multilingue: atencion y generacion en seis idiomas (en, zh, ko, ja, es, ru) para aplicaciones de traduccion o soporte regional.
- Despliegue en hardware consumer: con 9,4B parametros y pesos de 8,4 GB, es viable en GPUs de gama alta consumer para prototipado e inferencia local.
- Analisis de contenido sensible sin filtros de rechazo: util en entornos de investigacion donde las negativas del modelo interfieren con la tarea, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la comparacion de rechazos y divergencia KL entre este modelo y su base:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9,4B parametros, en FP16 requeriria aproximadamente 19 GB, y en cuantizacion de 6 bits alrededor de 7-8 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son adecuadas para FP16; GPUs consumer con 12-16 GB podrian alojar cuantizaciones de 6 bits.
- Cabe en GPU consumer: probablemente en RTX 4090 y modelos con 16 GB o mas en cuantizacion reducida; no confirmado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se confirma su disponibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| Este modelo (chevron7) | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM decensurado | Hugging Face, 44 descargas |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | no disponible | Razonamiento STEM destilado | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B | no disponible | no disponible | Version decensurada de 4B | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9B | no disponible | no disponible | Fine-tune cientifico | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteracion elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido danino, sesgado o inapropiado sin filtros; el operador asume toda la responsabilidad legal y etica.
- La divergencia KL de 0.0422 indica cambios en la distribucion de salidas que pueden degradar capacidades no evaluadas.
- Riesgo de alucinacion inherente a modelos de 9B, especialmente en dominios fuera de matematicas y STEM.
- No se han publicado benchmarks estandar, por lo que el rendimiento real en tareas generales es desconocido.
- La longitud de contexto no esta documentada; no se debe asumir la del Qwen3.5 original sin verificacion.
- El modelo base es una destilacion de DeepSeek-V4-Pro; posibles sesgos del profesor pueden transferirse.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales.
- El tag "image-text-to-text" sugiere capacidades multimodales no documentadas en la model card; no confirmadas.
- Solo 44 descargas y 0 likes: modelo con validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chevron7/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6e
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version de 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
