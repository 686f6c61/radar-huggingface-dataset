# Farohaf334/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y vision (image-text-to-text) publicado en Hugging Face por el usuario Farohaf334 bajo licencia Apache 2.0. Segun la model card, se presenta como la generacion mas capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectonica de Qwen3.5 y orientada a tareas de programacion, trabajo profesional, investigacion y agentes de horizonte largo. Es un modelo denso de 27B parametros (27.781.427.952 segun los pesos en safetensors), con un codificador de vision nativo y capacidad de comprension de imagenes y videos.

La arquitectura combina capas de atencion lineal Gated DeltaNet con capas de atencion tradicional (Gated Attention) en un patron hibrido de 64 capas, ademas de Multi-Token Prediction (MTP) entrenado con multiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. Incorpora control flexible de razonamiento (modo thinking activado por defecto, desactivable por peticion, con parametros `reasoning_effort` y `preserve_thinking`).

El modelo es relevante por su tamano compacto (27B) combinado con capacidades multimodales y de agente, lo que lo hace desplegable en infraestructura moderada. Sin embargo, conviene senalar que el repositorio no muestra descargas ni likes, y que la model card incluye referencias a servicios y comparativas que no pueden verificarse de forma independiente con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; hibrido de Gated DeltaNet (atencion lineal) y Gated Attention; 64 capas |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida con 64 capas organizadas en un patron de 16 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). La Gated DeltaNet utiliza 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La dimension oculta es 5120, la dimension intermedia de la FFN es 17.408 y el embedding de tokens (con padding) es de 248.320. Incluye Multi-Token Prediction (MTP) entrenado con multiples pasos.

Segun la model card, el modelo ha pasado por pre-entrenamiento y post-entrenamiento. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La model card menciona mejoras en ejecucion agentica, planificacion autonoma y manejo de retroalimentacion del entorno, pero no aporta cifras sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y control flexible mediante `reasoning_effort` y `preserve_thinking`.
- Comprension nativa de imagenes y videos (image-text-to-text), incluyendo diagramas STEM, documentos y videos de hasta una hora segun la model card.
- Programacion y tareas de terminal agentico (referencia a Terminal Bench 2.1 en la model card).
- Ejecucion de agentes autonomos con planificacion multi-paso y manejo de retroalimentacion del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares (segun la model card).
- Soporte de tool calling / function calling: no se detalla de forma explicita en la informacion disponible, aunque la orientacion agentica lo sugiere.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia de programacion en produccion: el modelo puede integrarse en pipelines de CI/CD y editores para generacion y revision de codigo, apoyandose en su contexto de 262.144 tokens para manejar repositorios completos y en su modo thinking para razonamiento complejo.
- Agentes autonomos de terminal: adecuado para tareas de terminal agentico (Terminal Bench 2.1) donde el modelo planifica pasos, ejecuta comandos y procesa la retroalimentacion del entorno hasta completar la tarea.
- Analisis de documentos y diagramas: al ser un modelo vision-lenguaje nativo, puede extraer informacion de documentos escaneados, diagramas STEM y graficos, util en investigacion y trabajo profesional.
- Comprension de video de larga duracion: la model card indica soporte para videos de hasta una hora, lo que permite resumir o responder preguntas sobre grabaciones extensas.
- Investigacion asistida: el contexto extensible hasta 1.000.000 tokens permite procesar corpus largos, articulos y notas de investigacion en una sola sesion.
- Atencion al cliente y conversaciones multi-turno: el contexto nativo de 262.144 tokens y la retencion de contexto de razonamiento (`preserve_thinking`) facilitan conversaciones largas con historial extenso.
- Despliegue en infraestructura moderada: al ser un modelo denso de 27B, es viable en servidores con GPUs de gama alta, ofreciendo capacidades multimodales y agenticas sin el coste de modelos de mayor tamano.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con los modelos Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorias como Coding y Agentic terminal coding (Terminal Bench 2.1). Sin embargo, los valores numericos de la tabla no estan completos en la informacion proporcionada (la extraccion se interrumpe), por lo que no es posible presentar cifras verificables.

No se han publicado resultados de benchmarks completos y verificables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 27B en precision BF16 requiere aproximadamente 55 GB de VRAM (coincide con el tamano del repo de 55,6 GB); en cuantizacion de 8 bits rondaria los 28 GB y en 4 bits unos 14-16 GB, aunque estos valores son estimaciones y no datos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, serian necesarias GPUs como A100 80 GB, H100 o configuraciones multi-GPU para BF16.
- Cabe en GPU de consumo: en BF16 no cabe en GPUs de consumo de 24 GB; con cuantizacion agresiva (4 bits) podria ser viable en RTX 4090 (24 GB) o similares, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card menciona como comparables a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de sus especificaciones detalladas ni de los valores de benchmark completos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262.144 (ext. 1M) | Apache 2.0 | Hugging Face (repo Farohaf334) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, y el autor (Farohaf334) no coincide con la organizacion oficial de Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.
- La model card incluye referencias a servicios (Qwen Cloud) y comparativas con modelos que no pueden verificarse de forma independiente con la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo y agenticas.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse que los pesos y el codigo asociados cumplan realmente esa licencia.
- El contexto extensible hasta 1.000.000 tokens puede requerir configuracion adicional y no esta garantizado su rendimiento en todos los entornos.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre latencia/throughput en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Farohaf334/Qwen3.8-27B
- Qwen Cloud (referencia de la model card): https://www.qwencloud.com
- Qwen3.8-27B Overview (referencia de la model card): https://www.qwencloud.com/models/qwen3.8-27b
