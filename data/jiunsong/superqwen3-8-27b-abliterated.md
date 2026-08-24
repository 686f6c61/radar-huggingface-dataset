# Jiunsong/SuperQwen3.8-27b-abliterated

## Resumen

SuperQwen3.8-27b-abliterated es una versión modificada del modelo multimodal Qwen3.8-27B, publicada por el usuario Jiunsong en Hugging Face. El modelo aplica una técnica de "abliteración" (eliminación de la dirección de rechazo) sobre los pesos originales del modelo base, reduciendo drásticamente las respuestas de negativa sin sacrificar las capacidades técnicas. Se distribuye en formato BF16 completo, con 27.781 millones de parámetros, y mantiene intactos el codificador de visión y los módulos MTP del modelo original.

La relevancia de este lanzamiento radica en que ofrece una alternativa "sin censura" para entornos controlados de investigación y desarrollo, donde se necesita explorar respuestas que el modelo base rechazaría. Incluye correcciones sobre el comportamiento de razonamiento excesivo (overthinking) del modelo base, un modo de razonamiento configurable y soporte de contexto largo verificado hasta 1.000.045 tokens mediante la receta YaRN. Está pensado para servir con vLLM y es compatible con la licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, transformer multimodal con atención híbrida (Gated DeltaNet lineal + atención completa) según el modelo base Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Nativa: 262.144 tokens; verificado con YaRN: 1.000.045 tokens |
| Tipos de cuantizacion | BF16 (sin cuantizar); no se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards, ~52 GB) |

## Arquitectura y entrenamiento

El modelo se construye a partir del checkpoint oficial `Qwen/Qwen3.8-27B` en su revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. La arquitectura base es un transformer denso multimodal con atención híbrida (combinación de atención lineal tipo Gated DeltaNet y atención completa), según fuentes externas sobre el modelo Qwen3.8-27B. Incluye un codificador de visión y módulos MTP (Multi-Token Prediction) que se preservan exactamente en esta versión.

La modificación principal es una edición de dirección de rechazo de rango 1 sobre 100 tensores: las proyecciones de salida en las capas 15 a 63, más las capas de embeddings y `lm_head`. Esta intervención reduce las respuestas de negativa del 56,25% (18/32) al 0% (0/32) en la suite de pruebas del autor. Además, se ajusta el comportamiento de razonamiento: el nivel por defecto pasa de `xhigh` a `medium`, y se añade una condición de parada para evitar repeticiones o reinicios en niveles explícitos de `xhigh`. No se utilizan LoRA ni adaptadores en tiempo de inferencia; el checkpoint es directamente cargable.

## Capacidades

- Generación de texto y diálogo conversacional en inglés y coreano.
- Razonamiento con esfuerzo configurable (`low`, `medium`, `high`, `xhigh`) mediante `chat_template_kwargs`.
- Comprensión de imágenes (entrada multimodal `image-text-to-text`), manteniendo el vision tower original.
- Llamada a herramientas (tool calling) verificada con resultado PASS en la suite del autor.
- Soporte de contexto largo: nativo de 262.144 tokens y ampliable hasta 1.000.045 tokens con la receta YaRN incluida.
- Modo de razonamiento acotado: el modelo detiene la deliberación una vez establecida una respuesta, evitando ciclos de repetición.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K nativo) y responder sin rechazos en temas que el modelo base evitaría, útil en entornos moderados por humanos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o completar código, manteniendo la precisión del modelo base.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información relevante en inglés o coreano.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas con el modelo base para analizar sesgos y riesgos.
- Asistentes de desarrollo con razonamiento controlado: gracias al ajuste de `reasoning_effort`, se puede configurar el nivel de deliberación según la tarea, reduciendo latencia en consultas simples.
- Despliegue de agentes autónomos con memoria larga: con la extensión YaRN de 1M tokens, el modelo puede mantener el contexto de sesiones prolongadas o grandes documentos, aunque con mayor latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas propias de su suite de validación, que se resumen a continuación:

| Prueba | Resultado |
|---|---|
| Refusal (negativa) | 0/32 (frente a 18/32 del modelo base) |
| Salidas vacías | 0/32 |
| Capacidad (floor) | 7/8 |
| Uso de herramientas | PASS |
| Visión | PASS |
| Overthinking (36 combinaciones) | 36/36 PASS |
| Contexto largo (1.000.045 tokens) | Recuperación de aguja correcta con YaRN |

Rendimiento de decodificación medido en un DGX Spark (longitud fija, post-primer-token):

| Prompt / concurrencia | Decodificación agregada |
|---|---|
| p256 / C1 | 7,4378 tok/s |
| p256 / C6 | 38,5630 tok/s |

## Requisitos de hardware

- Los pesos en BF16 ocupan aproximadamente 52 GB, por lo que se necesita al menos una GPU con 80 GB de VRAM (A100, H100, A800) o varias GPUs en paralelo para inferencia sin cuantización.
- En GPUs de consumo (RTX 4090 con 24 GB, por ejemplo) no cabe el modelo completo en BF16; sería necesario aplicar cuantización, pero este repositorio no la ofrece.
- Opciones de despliegue: vLLM (recomendado, con script de servidor incluido), también compatible con Hugging Face Transformers y endpoints compatibles.
- Para el perfil de 1M de contexto, se requieren variables de entorno adicionales (`QWEN38_MAX_MODEL_LEN=1048576`, `QWEN38_MAX_BATCHED_TOKENS=2048`, `QWEN38_EXECUTE_MODEL_TIMEOUT_SECONDS=1800`) y la receta YaRN incluida en `repro/`.
- La latencia aumenta significativamente con la extensión YaRN; el rendimiento medido (7,4 tok/s en C1) corresponde a la configuración nativa sin extensión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Refusal | Licencia |
|---|---|---|---|---|---|
| Jiunsong/SuperQwen3.8-27b-abliterated | 27,8 B | 262K nativo / 1M YaRN | BF16 | 0% | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8 B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B (modelo base) | 27,8 B | 262K | BF16 | 56,25% | Apache-2.0 |
| Qwen3.8-27B-Uncensored-FP8 | 27,8 B | No disponible | FP8 | No disponible | Research-only |

Los datos de los modelos comparables son limitados; no se dispone de información completa sobre las variantes de huihui-ai y la versión FP8.

## Limitaciones y advertencias

- La abliteración reduce las respuestas de rechazo, lo que puede exponer contenido que el modelo base declinaría. No se garantiza que las respuestas sean correctas, seguras o apropiadas para todos los entornos.
- El modelo solo soporta inglés y coreano; no se ha verificado su comportamiento en otros idiomas.
- La extensión de contexto a 1M tokens mediante YaRN introduce una latencia adicional y no garantiza una recuperación perfecta en todas las tareas.
- Las pruebas de capacidad, herramientas, visión y overthinking son conjuntos finitos de regresión; no cubren todos los escenarios posibles.
- Aunque la licencia Apache-2.0 permite uso comercial, los operadores son responsables de implementar controles de acceso y salvaguardas adicionales.
- El rendimiento de decodificación depende del hardware y del runtime; los valores medidos son específicos del entorno de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre abliteración de Qwen3.8-27B (MindStudio): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog sobre versión FP8 abliterada (Orcarouter): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8
- Herramienta de medición de rendimiento sparkDash: https://github.com/MiaAI-Lab/sparkDash
