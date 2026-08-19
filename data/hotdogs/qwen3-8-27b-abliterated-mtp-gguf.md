# hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF

## Resumen

El modelo `hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF` es una cuantización GGUF del modelo `Qwen3.8-27B-abliterated`, una versión "abliterada" (sin rechazo) del modelo denso `Qwen/Qwen3.8-27B` de Alibaba. El autor, `hotdogs`, ha convertido el modelo a formato GGUF conservando la cabeza MTP (Multi-Token Prediction), lo que permite usar decodificación especulativa auto-dirigida en llama.cpp y derivados. El modelo base es un vision-language model de 27 000 millones de parámetros con arquitectura híbrida (atención completa + atención lineal) y una ventana de contexto nativa de 256 000 tokens.

La relevancia de esta ficha radica en que combina dos características poco habituales: la eliminación del comportamiento de rechazo mediante una edición de pesos de rango 1 sin entrenamiento (abliteración), y la preservación de la cabeza MTP para acelerar la generación. Además, incluye un proyector multimodal (`mmproj`) que habilita la comprensión de imágenes. El repositorio se encuentra en estado de pruebas y desarrollo: la cuantización Q4_K_M aún no ha sido calibrada con imatrix, por lo que su calidad a bits bajos puede mejorar en futuras versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (full-attention + linear-attention) con torre de visión nativa |
| Parametros totales | 27 000 millones (modelo base); el archivo safetensors reporta 460 730 096, que corresponde probablemente a un componente específico, no al total |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (nativo) |
| Tipos de cuantizacion | f16 (~54,6 GB), Q6_K (~22,4 GB), Q4_K_M (~16,8 GB); proyector multimodal mmproj (~931 MB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama, vLLM) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros con una arquitectura híbrida que combina atención completa (full-attention) y atención lineal (linear-attention), lo que reduce el coste computacional en contextos largos. Incluye una torre de visión nativa que permite procesar imágenes sin necesidad de adaptadores externos. La cabeza MTP (Multi-Token Prediction) está entrenada para predecir varios tokens siguientes en una sola pasada, lo que se aprovecha en GGUF para decodificación especulativa auto-dirigida.

La versión abliterada se obtiene mediante una edición de pesos de rango 1, sin entrenamiento ni ajuste fino: se ortogonaliza la "dirección de rechazo" de los 131 escritores del residual stream, eliminando el comportamiento de negativa del modelo. La torre de visión y la capa `lm_head` permanecen sin cambios byte a byte. El dataset de entrenamiento original no se detalla en la información disponible, pero el modelo base de Qwen3.8 se entrenó con datos multilingües (inglés y chino principalmente) y con un enfoque en razonamiento y capacidades agénticas. No se menciona el uso de RLHF o DPO en la versión abliterada, ya que la abliteración es un método de intervención en inferencia, no de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de modo "thinking" (etiquetas de pensamiento en el formato de chat Qwen3.8).
- Comprensión de imágenes: el proyector multimodal `mmproj` permite entrada de imágenes junto con texto.
- Decodificación especulativa auto-dirigida mediante la cabeza MTP integrada en cada archivo GGUF (activada con `--spec-type draft-mtp` en llama.cpp).
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.8.
- Capacidades agénticas: el modelo base está optimizado para tareas de agente y codificación agéntica.
- Multilingüe: inglés y chino, con posible degradación en otros idiomas.
- Sin comportamiento de rechazo: el modelo no se niega a responder a peticiones que el modelo original rechazaría (útil para investigación de seguridad y alineación).

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar qué protege el entrenamiento de rechazo, realizar red-teaming y analizar la mecánica de la dirección de rechazo en modelos de lenguaje. Su licencia Apache-2.0 facilita su uso en entornos académicos.
- Generación de código en producción: con soporte de tool calling y una ventana de 256K tokens, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado en repositorios grandes.
- Asistentes de chat locales sin censura: gracias a la abliteración, puede desplegarse en aplicaciones de chat donde se requiera que el modelo responda a temas que otros modelos rechazan, siempre dentro del marco legal aplicable.
- Análisis de documentos largos: la ventana de 256K tokens permite procesar libros técnicos, bases de código extensas o expedientes completos en una sola pasada, con la ventaja de la atención lineal para reducir el coste en contextos largos.
- Comprensión de imágenes en entornos sin conexión: el proyector multimodal permite clasificar o describir imágenes localmente, por ejemplo en aplicaciones de asistencia a personas con discapacidad visual o en entornos con requisitos de privacidad de datos.
- Experimentación con decodificación especulativa: la cabeza MTP integrada permite medir la tasa de aceptación de borradores y optimizar la velocidad de generación en diferentes hardware, lo que resulta útil para ingenieros que despliegan modelos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la cuantización Q4_K_M aún no ha sido calibrada con imatrix, por lo que su calidad a bits bajos puede ser inferior a la esperada. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros tests estandarizados para esta versión GGUF.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (~16,8 GB) se necesita al menos 16 GB de VRAM; para Q6_K (~22,4 GB) se recomiendan 24 GB; para f16 (~54,6 GB) se requieren 48 GB o más. El contexto de 256K tokens con caché KV en f16 incrementa notablemente el consumo de VRAM; con `--ctx-size 32768` se reduce la demanda.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K, RTX 3090 o similar (24 GB) para Q4_K_M, A100 o H100 (40-80 GB) para f16 o contextos muy largos. También es compatible con GPUs de AMD (Ryzen AI Max y Radeon) según el anuncio de AMD.
- En consumer GPU: sí, cabe en GPUs de 16 GB (Q4_K_M) y 24 GB (Q6_K), siempre que se ajuste el contexto.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli), LM Studio, Ollama y vLLM. El autor recomienda `llama-server` con los flags detallados en la model card, incluyendo `--spec-type draft-mtp` para decodificación especulativa.
- Latencia y throughput: no se proporcionan cifras concretas. La decodificación especulativa con MTP puede acelerar la generación, pero la tasa de aceptación depende del hardware y del valor de `--spec-draft-n-max` (se recomienda barrer de 1 a 6).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 256K | Apache-2.0 | safetensors | Modelo base con rechazo intacto |
| Qwen3.8-27B-abliterated (este) | 27B | 256K | Apache-2.0 | GGUF | Sin rechazo, MTP preservado, visión nativa |
| Qwen3.8-2.4T-A95B (MoE) | 2,4T total, 95B activos | 256K | Apache-2.0 | safetensors | Versión MoE de mayor tamaño, no comparable en requisitos |
| Llama 3.1 8B (GGUF) | 8B | 128K | Llama 3.1 | GGUF | Menor tamaño y contexto, sin visión nativa |

La comparativa se basa en características generales, ya que no se dispone de benchmarks públicos para esta versión GGUF. El modelo destaca por su combinación de visión, contexto largo y ausencia de rechazo, algo poco común en el ecosistema GGUF.

## Limitaciones y advertencias

- El modelo no se niega a responder: el autor advierte explícitamente que el modelo subyacente no mostrará rechazo, y que su publicación tiene fines de investigación en seguridad y alineación. El uso indebido puede tener consecuencias legales.
- Estado de desarrollo: el repositorio está marcado como "testing / development". La cuantización Q4_K_M no ha sido calibrada con imatrix, por lo que su calidad puede ser inferior a la de otras cuantizaciones del mismo nivel.
- Sesgos y alucinaciones: al ser una versión abliterada, el modelo puede generar contenido que el modelo original filtraría, incluyendo información falsa o dañina. No se han realizado evaluaciones de sesgo específicas para esta versión.
- Limitaciones de idioma: solo se garantiza soporte para inglés y chino; otros idiomas pueden presentar degradación significativa.
- Requisitos de hardware elevados: el contexto de 256K tokens con caché KV en f16 consume una cantidad considerable de VRAM; en GPUs de 16 GB es necesario reducir el contexto o usar cuantizaciones más agresivas.
- Sin garantías de rendimiento: no se han publicado benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el autor recuerda que el usuario es responsable de cumplir con las leyes aplicables, especialmente en lo relativo a contenido generado sin filtros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-MTP-GGUF
- Modelo base abliterado: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de Yottalabs para ejecutar Qwen3.8 27B localmente: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
