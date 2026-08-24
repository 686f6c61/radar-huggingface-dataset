# batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8

## Resumen

El modelo `batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8` es una cuantización en FP8 del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin mecanismos de rechazo (abliterated) del modelo multimodal `Qwen/Qwen3.8-27B`. El autor, `batsclamp`, publica esta variante para cubrir la ausencia de pesos FP8 en el repositorio original, que solo ofrecía BF16 y GGUF, permitiendo así su uso directo con vLLM.

El modelo base es un transformer híbrido de 27 359 millones de parámetros que combina atención lineal (Mamba) con atención completa, incorpora una torre de visión para entrada de imágenes y un módulo MTP (Multi-Token Prediction) para decodificación especulativa. La cuantización FP8 se ha aplicado con `llm-compressor` usando el esquema `FP8_DYNAMIC`, con pesos en FP8 `e4m3` por canal (estático) y activaciones dinámicas por token, dejando en BF16 las proyecciones Mamba, la torre de visión, los embeddings, el `lm_head`, las normas y el drafter MTP. El resultado es un modelo de 36,8 GB que mantiene una ventana de contexto de 262 144 tokens.

La relevancia de esta ficha radica en que ofrece una opción de despliegue eficiente en memoria para un modelo abliterated de 27B con capacidades multimodales y de razonamiento, pensado para entornos de producción con vLLM. No obstante, al tratarse de una cuantización sin evaluación formal de benchmarks, su rendimiento exacto no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal Mamba + atención completa) con torre de visión y módulo MTP |
| Parametros totales | 27 359 595 760 (~27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | FP8 `e4m3` per-channel (pesos, estático) y FP8 dinámico per-token (activaciones); partes en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, `float-quantized`) |

## Arquitectura y entrenamiento

El modelo original `Qwen3.8-27B` emplea una arquitectura híbrida que intercala capas de atención lineal (Mamba) con capas de atención completa, lo que reduce el coste computacional en contextos largos. Incluye además un módulo MTP que predice varios tokens futuros en paralelo, habilitando decodificación especulativa. La versión abliterated de `huihui-ai` elimina los comportamientos de rechazo del modelo base mediante una técnica de intervención en los pesos, sin reentrenamiento. Sobre esta versión, `batsclamp` aplica una cuantización FP8 con `llm-compressor` en modo `FP8_DYNAMIC`, sin calibración (data-free). Se cuantizan 256 módulos lineales densos, mientras que las proyecciones Mamba, la torre de visión, los embeddings, el `lm_head`, las normas y el drafter MTP se mantienen en BF16 para preservar la precisión en estas partes críticas. El esquema de cuantización por canal (per-channel) es más fino que el per-tensor usado en el release FP8 oficial de Qwen, lo que podría ofrecer una mejor relación precisión/tamaño.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de modo "thinking" (parsing de razonamiento `qwen3`).
- Comprensión de imágenes (pipeline `image-text-to-text`), permitiendo entrada visual y respuesta textual.
- Generación de código y soporte de tool calling / function calling (parser `qwen3_coder`).
- Capacidades de agente: puede encadenar llamadas a herramientas y razonar sobre múltiples pasos.
- Decodificación especulativa mediante MTP, acelerando la inferencia en vLLM.
- Multilingüe (idiomas concretos no especificados en la documentación disponible).
- Al ser abliterated, no presenta rechazos ante solicitudes que el modelo original podría denegar.

## Casos de uso

- Atención al cliente automatizada: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno extensas, manteniendo el historial completo y respondiendo con coherencia. Su capacidad de tool calling permite integrarse con sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando la decodificación especulativa para reducir la latencia.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada, útil en automatización de procesos de negocio.
- Agentes autónomos de investigación: su razonamiento multi-step y el modo thinking permiten planificar y ejecutar tareas complejas como búsqueda web, consulta a APIs y síntesis de resultados.
- Asistente de programación con contexto de repositorio completo: la ventana de 262K tokens permite cargar un repositorio entero y responder preguntas sobre el código, refactorizar o depurar.
- Prototipado de aplicaciones sin censura: al ser abliterated, puede usarse en entornos de investigación donde se requiere explorar temas sensibles sin restricciones, siempre bajo supervisión ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la cuantización se verificó únicamente mediante generación de texto, sin mediciones de perplexity ni evaluaciones estándar (MMLU, HumanEval, GSM8K, etc.). Por tanto, no se pueden aportar cifras comparativas fiables.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 27,4 GB solo en pesos, más overhead de activaciones y KV cache. Con contexto de 262K tokens, se recomienda al menos 40 GB de VRAM.
- GPUs recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, o varias GPUs (p. ej., 2× RTX 4090 24 GB con tensor parallelism).
- En consumer GPUs: una RTX 4090 (24 GB) no es suficiente para FP8 con contexto completo; se necesitaría cuantización adicional (p. ej., GGUF Q4) o reducir la longitud de contexto.
- Opciones de despliegue: vLLM (compatible con `compressed-tensors`), también puede usarse con Transformers para carga en BF16/FP8, aunque el rendimiento óptimo se logra con vLLM.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de decodificación especulativa (MTP con 3 tokens especulativos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| `batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8` | 27,36 B | 262 144 | FP8 per-channel | Apache 2.0 | Abliterated, multimodal, MTP |
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` | 27,36 B | 262 144 | BF16 / GGUF | Apache 2.0 | Abliterated, multimodal, MTP |
| `Qwen/Qwen3.8-27B` | 27,36 B | 262 144 | BF16 / FP8 | Apache 2.0 | Original, con rechazos, multimodal, MTP |

No se dispone de datos de rendimiento comparativo. Las diferencias principales radican en la cuantización (FP8 per-channel vs. BF16) y en la eliminación de rechazos en las versiones abliterated.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso. No debe desplegarse sin supervisión humana o filtros adicionales.
- Riesgo de alucinación: como todo LLM, puede inventar información, especialmente en tareas de razonamiento o código.
- Cuantización sin evaluación formal: no se han realizado benchmarks de calidad; la FP8 per-channel puede introducir degradación sutil en tareas de alta precisión.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Qwen suele cubrir múltiples lenguas, no hay garantía.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el carácter abliterated puede generar responsabilidades legales o éticas según el caso de uso.
- Para producción, se recomienda validar el modelo con un conjunto de pruebas propio antes de su despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Página en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Mirror en GitHub: https://github.com/Ahaa43443/huihui-qwen3.8-27b-abliterated-mirror
- Artículo en VGtimes: https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
