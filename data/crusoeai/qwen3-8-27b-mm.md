# crusoeai/Qwen3.8-27B-MM

## Resumen

Qwen3.8-27B-MM es un modelo de lenguaje y vision (image-text-to-text) de tipo denso con 27.781.427.952 parametros, publicado por el usuario crusoeai en Hugging Face bajo licencia Apache 2.0. Segun la model card, se trata de la generacion Qwen3.8 de la familia de modelos abiertos de Qwen, construida sobre la base arquitectonica de Qwen3.5, y orientada a tareas de programacion, trabajo profesional, investigacion y tareas agenticas de horizonte largo. El modelo entiende de forma nativa imagenes y videos, e incorpora control flexible del modo de razonamiento.

La arquitectura combina capas de atencion lineal (Gated DeltaNet) con capas de atencion con compuerta (Gated Attention) en un patron hibrido de 64 capas, con una dimension oculta de 5120 y una FFN de 17.408. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. Incorpora Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificacion especulativa.

El modelo es relevante porque ofrece capacidades de vision-lenguaje y razonamiento agentico en un tamano compacto (27B) desplegable en infraestructura propia, con pesos en formato Transformers compatibles con vLLM, SGLang y TokenSpeed. La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer hibrido con Gated DeltaNet (atencion lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). La columna vertebral del lenguaje consta de 64 capas con un diseno hibrido: 16 bloques de la forma 3 x (Gated DeltaNet -> FFN) seguidos de 1 x (Gated Attention -> FFN). Las capas Gated DeltaNet emplean 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La FFN tiene dimension intermedia de 17.408 y el embedding de tokens (con padding) es de 248.320.

El modelo incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que permite decodificacion especulativa y mejora el throughput de generacion. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; la model card solo indica que hubo pre-entrenamiento y post-entrenamiento. Se menciona control flexible del pensamiento (modo thinking activado por defecto, desactivable por peticion, con ajuste de profundidad mediante `reasoning_effort` y retencion de contexto de razonamiento historico mediante `preserve_thinking`).

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable por peticion.
- Comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Programacion y tareas de terminal agenticas (se reporta Terminal Bench 2.1).
- Planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque la model card menciona herramientas integradas en la version alojada y compatibilidad con harnesses populares.
- Razonamiento multi-paso y tareas agenticas de horizonte largo.
- Capacidades multilingues: no disponible.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Analisis de documentos tecnicos con diagramas: el modelo puede procesar imagenes de diagramas STEM y documentos junto con texto, extrayendo informacion estructurada en un unico paso multimodal.
- Comprension de video de larga duracion: con soporte de videos de hasta una hora, resulta adecuado para resumir reuniones, generar actas o extraer eventos de grabaciones.
- Automatizacion de tareas de terminal y CI/CD: su rendimiento en Terminal Bench 2.1 lo hace util para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines.
- Asistencia a la programacion en produccion: la mejora declarada en coding permite integrarlo en entornos de desarrollo para generacion, revision y refactorizacion de codigo.
- Agentes autonomos de investigacion: la planificacion autonoma y el manejo de retroalimentacion del entorno permiten encadenar busquedas, lectura de fuentes y sintesis de resultados.
- Atencion al cliente multimodal: con 262.144 tokens de contexto nativo puede gestionar conversaciones multi-turno largas y adjuntos de imagen.
- Procesamiento por lotes de documentacion: su tamano de 27B y su contexto extensible hasta 1M permiten procesar corpus documentales extensos en despliegues propios con vLLM o SGLang.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en texto. Los datos disponibles en la informacion proporcionada solo cubren parcialmente la tabla; se recogen a continuacion los valores explicitamente presentes. El resto de filas y columnas no estan disponibles en el extracto recibido.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer valores numericos completos de la tabla de benchmarks en la informacion disponible; no se inventan cifras. La model card indica mejoras sustanciales en coding, trabajo profesional, investigacion y tareas agenticas frente a generaciones anteriores, pero sin cifras verificables en el material recibido.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781.427.952 parametros, en precision completa (BF16) se requieren aproximadamente 55,6 GB solo para pesos, mas memoria para KV cache y activaciones; el repositorio ocupa 55,6 GB.
- En cuantizacion de 8 bits se estiman unos 28 GB de pesos; en 4 bits, unos 14 GB. Estas estimaciones son calculos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o multiples GPU; para cuantizacion 4-8 bits, RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) pueden ser suficientes para los pesos, con margen limitado para contexto largo.
- Cabe en GPU consumer: si, en cuantizaciones de 4-8 bits, con limitaciones de contexto por el KV cache.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, segun la model card.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere mejora de throughput mediante decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

La model card proporciona una comparativa directa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de los valores numericos completos ni de las especificaciones de contexto y licencia de los modelos alternativos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-MM | 27,8B | 262.144 nativo (hasta 1M) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B (por el nombre) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de 27B, es esperable en tareas de conocimiento factual, pero no hay datos publicados.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens; la extension a 1M puede degradar el rendimiento y requerir mas memoria. Los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los componentes de vision y de los datos de entrenamiento, no detallados.
- Caveats para produccion: el modelo tiene solo 27 descargas y 0 likes en el momento de la consulta, lo que indica validacion comunitaria muy limitada. El autor del repositorio es crusoeai, no el organizacion oficial de Qwen, por lo que conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion. No se publican datos de cuantizacion ni de rendimiento en hardware concreto.

## Enlaces

- Hugging Face: https://huggingface.co/crusoeai/Qwen3.8-27B-MM
- Qwen Cloud (servicio alojado mencionado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
