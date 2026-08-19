# Frosty40/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una conversión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, realizada por Frosty40 y publicada en HuggingFace. El modelo base es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida: 48 capas de atención lineal Gated-DeltaNet y 16 capas de atención completa, lo que le permite manejar ventanas de contexto de hasta 262 000 tokens con un coste de memoria reducido en comparación con una atención full-attention pura. Además, el modelo es nativamente multimodal (image-text-to-text), con un proyector de visión integrado.

Esta versión GGUF está optimizada para su ejecución con llama.cpp y sus derivados (llama-server, Ollama, etc.), e incluye una cuantización Q6_K de los pesos principales con el tensor de salida (output) sin atar en Q8_0, una combinación que, según las mediciones del autor, ofrece una calidad muy cercana al modelo original en bf16 (KLD medio de 0,0017 y coincidencia del 97,79 % en el token superior). El autor validó el archivo end-to-end en una GPU Intel Arc Pro B70 mediante el backend SYCL de llama.cpp, reportando métricas de rendimiento concretas. Es relevante porque proporciona una alternativa de alta fidelidad para desplegar un modelo de 27B con visión y razonamiento en hardware de consumo o profesional, sin necesidad de los 54 GB del modelo en bf16.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio incluye dos archivos: el GGUF principal (20,9 GB) y el proyector de visión en F16 (0,9 GB). Requiere una versión reciente de llama.cpp con soporte para la arquitectura Qwen3.5-family (identificador `qwen35`, b10355 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas Gated-DeltaNet (atención lineal) + 16 capas full-attention, denso, con proyector de visión |
| Parametros totales | 26 895 998 464 (26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativo); validado hasta 131 072 en esta cuantización |
| Tipos de cuantizacion | Q6_K (pesos) + Q8_0 (tensor de salida); proyector de visión en F16 |
| Idiomas soportados | No disponible (no especificado en la documentación del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal recurrente (Gated-DeltaNet) en 48 de sus 64 capas y atención completa (full-attention) en las 16 restantes. Esta mezcla permite un uso de memoria de KV cache significativamente menor que un transformer estándar, al tiempo que mantiene la capacidad de modelar dependencias de largo alcance. El modelo incorpora además un proyector de visión (mmproj) que permite procesar imágenes junto con texto, y soporta un modo de razonamiento explícito (thinking mode) controlable mediante `reasoning_effort`.

La conversión a GGUF fue realizada por Frosty40 a partir de la versión bf16 oficial, excluyendo los tensores MTP (`nextn`) destinados a decodificación especulativa, que en pruebas de una sola GPU resultaron contraproducentes. El tokenizer y la plantilla de chat se mantienen byte-idénticos al upstream. La cuantización se realizó con `llama-quantize` usando Q6_K y `--output-tensor-type q8_0`, sin imatrix, decisión justificada por la calidad ya alta a 6 bits. Se tomaron hashes SHA256 de cada shard de entrada antes de la conversión como medida de trazabilidad.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento (thinking) activado por defecto y configurable mediante `reasoning_effort` (xhigh, medium, low) o desactivable con `enable_thinking: false`.
- Comprensión de imágenes (image-text-to-text): el modelo puede procesar imágenes y responder preguntas sobre su contenido (por ejemplo, lectura de colores o palabras), gracias al proyector de visión incluido.
- Manejo de contexto largo: ventana nativa de 262 000 tokens, con validación práctica hasta 131 072 tokens en esta cuantización. La arquitectura híbrida reduce el coste de memoria de la KV cache en comparación con un modelo denso full-attention.
- Capacidades multilingües: no confirmadas explícitamente en la documentación del repositorio, pero se espera que herede las del modelo base Qwen (que soporta múltiples idiomas). Dato no disponible.
- Soporte para tool calling y function calling: no documentado en la model card de esta conversión. No se puede confirmar sin verificar el modelo base.
- Compatibilidad con llama.cpp y ecosistema asociado (llama-server, Ollama, etc.) mediante el backend SYCL, CUDA, Metal o CPU.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su ventana de 262 000 tokens y su capacidad de visión, el modelo puede procesar informes técnicos, manuales o contratos de cientos de páginas que incluyan figuras, diagramas o capturas, y responder preguntas sobre el contenido combinando texto e imagen.
- Asistente de programación con contexto de repositorio completo: con una ventana de contexto amplia, puede recibir el contenido de un repositorio de tamaño medio (código fuente, documentación, tests) y generar código, explicar bugs o proponer refactorizaciones sin necesidad de dividir el contexto en fragmentos.
- Chat conversacional con historial largo y razonamiento: el modo thinking permite respuestas más elaboradas en tareas de diagnóstico o soporte técnico, manteniendo el hilo de conversaciones de muchas interacciones gracias a la memoria recurrente.
- Extracción de información de imágenes en entornos de producción: por ejemplo, leer etiquetas, capturas de pantalla o formularios escaneados y estructurar los datos extraídos en JSON, aprovechando la combinación de visión y generación estructurada.
- Generación de contenido multimodal (texto + descripción de imágenes): el modelo puede describir imágenes, generar alt-text accesible o crear narrativas a partir de fotografías, útil en automatización de contenidos editoriales.
- Despliegue en hardware con VRAM limitada: al ser una cuantización Q6_K de 20,9 GB, cabe en GPUs de 24 GB (como RTX 3090/4090) o en la Intel Arc Pro B70 (30,3 GiB) con contexto largo, permitiendo ejecutar un modelo de 27B en estaciones de trabajo sin necesidad de GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas de fidelidad de la cuantización frente al modelo original en bf16, medidas sobre wikitext-2 (contexto de 512 tokens):

| Metrica | Valor |
|---|---|
| KLD medio (mean KLD) | 0,0017 |
| Coincidencia de token superior (same-top-token) | 97,79 % |
| Ratio de perplejidad (PPL ratio) | 1,0033 |

Además, se verificó que las salidas greedy son token-idénticas al modelo CPU-bf16 en prompts puntuales, y la capacidad de visión se validó mediante lectura correcta de colores y palabras en imágenes a través de llama.cpp (mtmd).

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal pesa 20,9 GB y el proyector de visión 0,9 GB (F16), por lo que se necesitan al menos ~22 GB solo para los pesos. A esto hay que sumar la KV cache, que debe mantenerse en F16 (según recomendación del autor); para un contexto de 114 688 tokens se estima un consumo adicional de varios GB, por lo que una GPU con 24 GB es el mínimo recomendable para contexto moderado, y 30 GB o más para contexto largo.
- GPU recomendadas: el autor validó el modelo en una Intel Arc Pro B70 (30,3 GiB) con backend SYCL. También debería funcionar en GPUs NVIDIA con CUDA (RTX 3090, RTX 4090, A100, etc.) y en Apple Silicon con Metal, siempre que la versión de llama.cpp soporte la arquitectura `qwen35`.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, o cualquier runtime compatible con GGUF. Se recomienda usar el comando de ejemplo proporcionado por el autor, con `-ngl 99`, `-fa on`, y `--reasoning on` para activar el modo pensamiento.
- Rendimiento medido (en Intel Arc Pro B70, con este archivo exacto):
  - Decode (generación): 21,7 t/s a profundidad 0; 19,6 t/s a 16K; 14,9 t/s a 64K.
  - Prefill (warmed): 995 t/s a 4K; 959 t/s a 16K.
  - Fill sostenido: 830 t/s a 61K de prompt; 692 t/s a 125K.
  - Consumo energético en decode: ~168 W (limitado por ancho de banda).
- Nota: el contexto shifting no está disponible por diseño (arquitectura recurrente), por lo que los clientes deben presupuestar `max_tokens` adecuadamente. El reuso de prefijo en chats largos funciona mediante context checkpoints.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencia cualitativa, se compara con el modelo base sin cuantizar y con una alternativa hipotética de cuantización más agresiva (no incluida en el repositorio):

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 26,9B | 262K | safetensors | Apache 2.0 | Modelo original, requiere ~54 GB en bf16 |
| Frosty40/Qwen3.8-27B-GGUF (Q6_K+Q8_0) | 26,9B | 262K (validado 131K) | GGUF | Apache 2.0 | Cuantización de alta fidelidad, 20,9 GB |
| Otras cuantizaciones (p. ej., Q4_K_M) | No disponible | No disponible | GGUF | No disponible | No se han publicado en este repositorio |

No se han encontrado otras conversiones GGUF del mismo modelo base en la información disponible, por lo que no es posible realizar una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El contexto shifting no está disponible por diseño debido a la arquitectura híbrida recurrente; los clientes deben gestionar la longitud de la conversación y usar context checkpoints para el reuso de prefijo.
- La KV cache debe mantenerse en F16; el autor advierte que la cuantización de la KV cache produce una degradación significativa en la velocidad de decodificación en profundidad.
- La versión de llama.cpp debe ser b10355 o superior con soporte para la arquitectura `qwen35`; versiones anteriores no podrán cargar el modelo.
- El tensor MTP (decodificación especulativa) fue excluido de la conversión; en hardware de una sola GPU su uso resultó contraproducente según las pruebas del autor.
- No se ha utilizado imatrix en la cuantización; aunque las métricas de calidad son buenas, podría haber margen de mejora en la perplejidad con un imatrix.
- Los sesgos y alucinaciones del modelo base no están documentados en esta conversión; se recomienda validar el comportamiento en el dominio de aplicación antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con los términos de Qwen (también Apache 2.0 en este caso).
- Las métricas de rendimiento son específicas de la Intel Arc Pro B70; otros backends (CUDA, Metal) pueden ofrecer resultados diferentes.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Frosty40/Qwen3.8-27B-GGUF
- Modelo base (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de llama.cpp (requisitos de arquitectura): no disponible en la información proporcionada.
