# MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16

## Resumen

LFM3-Omni-2B-98K-V2-BF16 es un checkpoint comunitario derivado de LiquidAI/LFM3-Omni-2B, publicado por el usuario MichaelAnthony. Se trata de un ajuste fino supervisado (LoRA con pesos fusionados) sobre el modelo base de Liquid AI, orientado a reforzar el razonamiento visible, la decisión de uso de herramientas, la recuperación ante errores y el cierre correcto de respuestas. El checkpoint publicado corresponde al paso 432 de la rama `checkpoint424-anti-loop-v19-r3`, con ocho actualizaciones supervisadas adicionales sobre el checkpoint 424.

El modelo conserva la arquitectura nativa multimodal de LFM3-Omni, con capas de convolución, atención completa y cinco capas de atención deslizante con ventana de 256 tokens. La etiqueta "98K" hace referencia a una configuración de servicio verificada de 98.304 tokens, con un techo de configuración de 128.000 posiciones. Con 2.166.928.384 parámetros, es un modelo compacto pensado para despliegue en entornos con recursos limitados.

Su relevancia radica en que explora el ajuste de un modelo omni pequeño para flujos de automatización con tool calling y contexto largo, aunque el propio autor reconoce que la validación es limitada y que no se ha demostrado una mejora agregada respecto al checkpoint padre. Es un artefacto de investigación comunitaria, no un modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (convolución, atención completa y 5 capas de atención deslizante con ventana de 256 tokens) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 98.304 tokens configurados para servicio; techo de configuración de 128.000 posiciones |
| Tipos de cuantizacion | BF16 (este repo), FP16, FP8, INT8, INT4 y GGUF en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (other) |
| Formato de pesos | safetensors (BF16); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B y mantiene su arquitectura nativa: una combinación de capas convolucionales, atención completa y cinco capas de atención deslizante con ventana de 256 tokens. Los ajustes de rotary y los metadatos de atención se conservan del modelo base seleccionado; el autor indica explícitamente que el workaround de conversión a atención completa usado en V1 no aplica a V2. Los encoders, proyectores y el códec multimodal se preservan, e incluye un tokenizador de audio congelado separado y código de carga personalizado.

El entrenamiento consiste en la fusión de pesos LoRA a plena potencia sobre el checkpoint 424, seguida de ocho actualizaciones supervisadas con continuación completa del estado de Adam y una tasa de aprendizaje que decae de 8e-7 a 2e-7. La mezcla de entrenamiento incluye razonamiento supervisado, decisiones de uso de herramientas, ejemplos de recuperación, respuestas finales, tokens terminales, llamadas dependientes a herramientas, retención del modelo original y retención multimodal/voz nativa. El autor aclara que se trata de refinamiento supervisado, no de un resultado de RL. El adaptador fuente tiene SHA-256 `6ee09c6841ef2cdcedd30c2f5fc89d62340787b71386b5454b0e999fc577bcaf`.

## Capacidades

- Generación de texto y razonamiento con sección de pensamiento visible cuando se activa el modo thinking.
- Decisión de uso de herramientas (tool calling) con soporte para esquemas estructurados, probado con el conjunto de 64 herramientas de Gmail.
- Recuperación ante errores y cierre correcto de respuestas, incluyendo emisión de tokens terminales.
- Capacidades multimodales nativas heredadas del modelo base (encoders, proyectores y códec preservados), aunque el autor indica que la recualificación multimodal completa está pendiente.
- Capacidades de voz/audio nativas heredadas, con tokenizador de audio congelado incluido en los repositorios nativos.
- Procesamiento de contexto largo, con configuración de servicio verificada de 98.304 tokens.
- Soporte de flujos multi-paso con llamadas dependientes a herramientas.

## Casos de uso

- Automatización de correo electrónico con tool calling: el modelo puede gestionar esquemas de herramientas tipo Gmail (campos `to`, `subject`, `body`), buscar destinatarios y decidir entre enviar o reportar un fallo permanente, siempre que el servidor de herramientas realice la codificación MIME/base64. El autor advierte que debe dejarse sin definir el campo opcional `raw`.
- Asistentes de escritorio con integración de comandos: probado en un escenario de búsqueda de solo lectura en Raycast, donde localizó una dirección y finalizó la tarea. Adecuado para flujos de consulta con verificación a nivel de aplicación.
- Razonamiento visible en agentes: útil en pipelines donde se requiere una sección de razonamiento bien formateada y cerrada antes de la respuesta final, con modo thinking activable.
- Procesamiento de documentos largos: la ventana de 98.304 tokens permite resumir o extraer información de conversaciones y documentos extensos, aunque el autor no garantiza fiabilidad en todas las posiciones.
- Prototipado de asistentes multimodales: al conservar encoders y proyectores, sirve para experimentar con entrada de imagen y audio en entornos de investigación.
- Evaluación de técnicas anti-bucle: el checkpoint está diseñado como rama anti-loop, útil para estudiar mitigación de repeticiones y llamadas duplicadas a herramientas en agentes pequeños.
- Despliegue en hardware modesto: con 2,17 mil millones de parámetros y variantes INT4/GGUF, puede ejecutarse en GPU de consumo para pruebas de concepto.

## Benchmarks y rendimiento

El autor publica una validación propia con decodificación greedy en BF16 nativo, con 40 checkpoints de flujo simulados por modelo. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no deben interpretarse como tales.

| Modelo | Decisión de tarea correcta | Sección de razonamiento válida con thinking | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre 424 | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado 432 | 33/40 | 19/20 | 40/40 | 0/40 |

El autor señala que la suite no mostró mejora agregada respecto al checkpoint 424 y no reprodujo todos los fallos observados en un flujo de cliente completo. La validez de la sección de razonamiento comprueba formato y cierre, no calidad de razonamiento. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos (2,17 mil millones de parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en INT8: alrededor de 2,2 GB para pesos; en INT4, aproximadamente 1,1 GB para pesos.
- GPU recomendadas: A100 o H100 para servicio de contexto largo con throughput alto; RTX 4090 o RTX 3090 para inferencia BF16/FP16 de un solo usuario.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16/FP16, y en 4-6 GB con cuantización INT4/GGUF.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` y una versión que soporte `AutoModelForMultimodalLM`), llama.cpp b11982 para GGUF, y presumiblemente vLLM/TGI aunque no se confirman en la información disponible.
- Entorno probado: Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-BF16 | 2,17 B | 98.304 (techo 128.000) | lfm-open-license | HuggingFace (comunitario) | Ajuste comunitario con tool calling y multimodal |
| LiquidAI/LFM3-Omni-2B (base) | 2,17 B | no disponible | lfm-open-license | HuggingFace (oficial) | Modelo base original de Liquid AI |
| Checkpoint 424 (padre) | 2,17 B | no disponible | lfm-open-license | HuggingFace (comunitario) | Linaje previo del que deriva V2 |

No se dispone de datos comparativos de rendimiento frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que V2 no demuestra mejora agregada sobre el checkpoint 424 en su suite de validación.
- Riesgo de bucle y de escrituras duplicadas no eliminado; la rama es anti-loop pero no lo garantiza.
- En pruebas con herramientas tipo Gmail, algunas variantes de prompt generaron razonamiento sin respuesta final, solicitaron una dirección en lugar de buscarla o emitieron payloads de correo malformados.
- Los resultados difieren entre precisiones (F16 y Q8 mostraron comportamientos distintos); las comprobaciones estructurales no prueban igual calidad entre cuantizaciones.
- La recualificación multimodal completa, la automatización de contexto largo y la requalificación en runtime comprimido están pendientes.
- No se garantiza fiabilidad en todas las posiciones de una conversación de 98K tokens; los resultados de recuperación de contexto largo de V1 no se han repetido en todos los formatos de V2.
- Requiere `trust_remote_code=True` y código personalizado; debe revisarse antes de habilitarlo.
- Licencia `lfm-open-license` (other): es necesario revisar los términos para uso comercial en el enlace de licencia del modelo base.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe amplia.
- Riesgo de alucinación y sesgos no evaluados en la información disponible; es un artefacto de investigación comunitaria sin validación de producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16)
- [Modelo base LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B)
- [Licencia LFM Open License](https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE)
- [Variante FP16](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16)
- [Variante FP8](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8)
- [Variante INT8](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8)
- [Variante INT4](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4)
- [Variante GGUF](https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF)
