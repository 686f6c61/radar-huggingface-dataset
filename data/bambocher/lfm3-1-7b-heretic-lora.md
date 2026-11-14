# bambocher/LFM3-1.7B-heretic-LoRA

## Resumen

LFM3-1.7B-heretic-LoRA es una variante "descensurada" (abliterated) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario bambocher. El modelo base lo desarrolla Liquid AI y pertenece a la familia LFM3, una arquitectura tri-híbrida orientada a agentes locales y aplicaciones especializadas. La modificacion se ha realizado con Heretic v2.1.0, una herramienta que aplica "Arbitrary-Rank Ablation" (ARA) sobre las capas internas del transformer para eliminar comportamientos de rechazo (refusals), dando como resultado un modelo con 0 rechazos frente a los 93 del modelo original en una bateria de 100 prompts de evaluacion.

El modelo base tiene 1.700 millones de parametros, una ventana de contexto de 256.000 tokens y esta disenado para ejecutarse en el edge: a 4 bits ocupa aproximadamente 1 GB de memoria, por lo que cabe en moviles y portatiles. El proceso de ablacion es reproducible: el autor publica los hiperparametros ARA (capas 5 a 23, pesos de preservacion 0.9461, de steering 0.0089, de sobrecorreccion 0.0330 y neighbor_count 2) y un directorio `reproduce/` con instrucciones.

La relevancia de esta ficha radica en que combina dos tendencias: por un lado, los modelos pequenos de arquitectura hibrida pensados para agentes y despliegue local; por otro, las tecnicas de "decensoring" que eliminan los filtros de seguridad aprendidos durante el post-entrenamiento. Esto tiene implicaciones directas en produccion, ya que el modelo pierde las salvaguardas del original y su licencia heredada (lfm1.0) impone condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrida (familia LFM3 de Liquid AI) con codigo custom (`custom_code`) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | 4 bits mencionado en la model card del base (aproximadamente 1 GB); no se detallan otros formatos en la informacion disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (repo de 0.1 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura tri-híbrida propia de Liquid AI, que combina mecanismos de atencion con componentes recurrentes/lineales para reducir el coste computacional en contextos largos, manteniendo una ventana de 256.000 tokens. Esta disenado como modelo de texto para agentes locales y ha recibido post-entrenamiento orientado a "agentic harnesses" como Hermes Agent, Pi y OpenClaw. La familia LFM3 incluye variantes base, texto, vision, audio, omni y decision.

Sobre esa base, bambocher aplica Heretic v2.1.0, que realiza una ablacion de rango arbitrario (ARA) en las capas 5 a 23. Los hiperparametros publicados permiten reproducir el proceso: `preserve_good_behavior_weight` 0.9461, `steer_bad_behavior_weight` 0.0089, `overcorrect_relative_weight` 0.0330 y `neighbor_count` 2. El resultado es un modelo con 0 rechazos sobre 100 prompts (frente a 93 del original) y una divergencia KL de 0.7091 respecto al base, lo que cuantifica el grado de alteracion del comportamiento. No se dispone de informacion sobre el volumen de tokens de entrenamiento del base ni sobre el dataset exacto usado por Liquid AI.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Entrenamiento orientado a agentes: soporte para harnesses agenticos (Hermes Agent, Pi, OpenClaw) y razonamiento multi-paso.
- Ventana de contexto de 256.000 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Eliminacion de rechazos: responde a practicamente cualquier peticion (0/100 refusals en la evaluacion del autor), lo que incluye contenido que el modelo original rechazaria.
- Capacidad de especializacion mediante fine-tuning rapido en una sola GPU, segun la model card del base.
- No se mencionan capacidades de vision, audio, tool calling explicito ni thinking mode en la informacion disponible para esta variante.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como la ablacion ARA altera el comportamiento de rechazo de un modelo pequeno, comparando directamente con el base mediante la divergencia KL reportada (0.7091).
- Evaluacion de tecnicas de decensoring reproducibles: el directorio `reproduce/` y los hiperparametros ARA publicados permiten replicar el proceso en otros modelos de la familia LFM3 y medir el impacto en cada capa.
- Despliegue en dispositivos edge: con aproximadamente 1 GB a 4 bits, puede ejecutarse en moviles y portatiles para asistentes locales sin dependencia de la nube.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido narrativo donde los filtros del modelo original bloquean temas sensibles.
- Prototipado de agentes locales: la ventana de 256.000 tokens y el post-entrenamiento agentico permiten construir asistentes que mantienen contexto largo en entornos con recursos limitados.
- Fine-tuning especifico de dominio: al ser un modelo de 1.7B, admite adaptacion rapida en una sola GPU para formatos, herramientas o jerga sectorial.
- Analisis de conversaciones multi-turno en 16 idiomas: util para sistemas de atencion al cliente o moderacion en escenarios multilingues, con la advertencia de que el modelo no rechaza contenido.

## Benchmarks y rendimiento

La informacion disponible solo incluye las metricas de la ablacion, no benchmarks estandar de calidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Rechazos (Refusals) | 0/100 | 93/100 |
| Divergencia KL | 0.7091 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun la model card del base; en fp16/bf16 se estima alrededor de 3.4 GB para los pesos (calculo derivado del tamano de 1.7B parametros, no dato publicado).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM para fp16; para 4 bits basta una GPU integrada o movil de gama media-alta.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas en portatiles; tambien en telefonos moviles a 4 bits.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), endpoints compatibles segun los tags; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/LFM3-1.7B-heretic-LoRA | 1.7B | 256K | 0/100 | lfm1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B | 1.7B | 256K | 93/100 | lfm1.0 | Hugging Face (modelo base) |
| Otras variantes decensuradas de modelos pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con el modelo base, ya que comparten arquitectura, contexto y licencia; la diferencia principal es la eliminacion de rechazos y la divergencia KL de 0.7091. No se dispone de datos comparativos con alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion total de rechazos: el modelo respondera a practicamente cualquier peticion, incluido contenido danino, ilegal o sensible; no es apto para despliegues orientados al publico sin capas de moderacion externas.
- Divergencia KL de 0.7091 respecto al base: la ablacion altera el comportamiento mas alla de los rechazos, con posible degradacion en calidad, coherencia o fidelidad en tareas generales.
- Riesgo de alucinacion: inherente a modelos de 1.7B; la ablacion puede agravarlo al eliminar respuestas de cautela.
- Licencia lfm1.0: impone condiciones de uso; es necesario revisar el archivo LICENSE para uso comercial, ya que la etiqueta `other` en Hugging Face no aclara los terminos exactos.
- Idiomas: aunque se listan 16, no se garantiza la calidad en todos ellos; el espanol esta incluido pero sin datos de rendimiento por idioma.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion comunitaria.
- Requiere `custom_code` y `trust_remote_code` en transformers, lo que implica ejecutar codigo del autor del modelo base.
- No se confirma soporte en runners de inferencia populares (vLLM, llama.cpp, Ollama), lo que puede complicar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-heretic-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground Liquid AI: https://playground.liquid.ai/
- Consola/API Liquid AI: https://console.liquid.ai/dashboard
- Heretic (herramienta de ablacion): https://heretic-project.org
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
