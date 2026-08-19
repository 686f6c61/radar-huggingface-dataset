# bowmanslayer/Qwen3.8-27B-W4A16-vision

## Resumen

Qwen3.8-27B-W4A16-vision es una cuantización 4-bit (W4A16, group size 128) del modelo multimodal Qwen/Qwen3.8-27B, realizada por el usuario bowmanslayer. La particularidad de esta versión es que preserva la torre de visión en bf16 (sin cuantizar) mientras que el stack de texto se cuantiza a 4 bits, y omite la cabeza MTP (Multi-Token Prediction) para reducir el peso. El resultado es un modelo de 18 GB en disco que puede servirse en dos RTX 3090 con 256K de contexto y margen para caché KV.

La relevancia actual radica en que permite ejecutar un modelo de 27B parámetros con capacidades de visión y razonamiento en hardware de consumo (dos GPUs de 24 GB), algo que con el modelo original en bf16 requeriría al menos 54 GB de VRAM. La cuantización utiliza GPTQ con kernel Marlin, optimizado para vLLM, y mantiene el pipeline completo de image-text-to-text. El modelo está pensado para inferencia local, con soporte de tool calling, razonamiento extendido (thinking mode) y procesamiento de imágenes y video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con atención lineal híbrida, basado en Qwen3.8-27B |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262144 tokens (256K) |
| Tipos de cuantizacion | W4A16, group size 128 (GPTQ, kernel Marlin) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cuantización GPTQ) |
| Tamaño del modelo | 18 GB en disco (según model card); repositorio HF muestra 0.9 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de 27B parámetros que combina un codificador de visión (torre de visión) con un stack de texto que incorpora capas de atención lineal (48 capas según la documentación de cuantización). La cuantización W4A16 se realizó mediante el pipeline AutoRound/GPTQ, calibrando únicamente con texto (256 muestras × 2048 tokens de `NeelNanda/pile-10k`), excluyendo las proyecciones `linear_attn.in_proj_*` de las 48 capas de atención lineal para evitar degradación. La torre de visión se extrajo antes de la calibración y se reincorporó después en bf16, de modo que la parte visual permanece intacta. No hubo entrenamiento adicional; solo cuantización y repack. La variante `-vision` omite la cabeza MTP (849 MB), mientras que la variante `-vision-mtp` la incluye para habilitar decodificación especulativa en vLLM.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" activado por defecto (bloque ` thinking` en el chat template).
- Comprensión de imágenes: reconocimiento de colores, conteo de formas, OCR, conteo de objetos en grid, imágenes de alta resolución (hasta ~2M píxeles sin truncamiento).
- Procesamiento de video (hasta 2 videos por prompt) mediante el pipeline de vLLM con `--limit-mm-per-prompt`.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y parser `qwen3_coder`.
- Razonamiento matemático y de código: resultados sólidos en GSM8K (97%) y HumanEval (82.32%).
- Multilingüe: inglés y chino.
- Compatible con decodificación especulativa en la variante `-vision-mtp`.

## Casos de uso

- Asistente de atención al cliente con contexto largo: el modelo gestiona conversaciones multi-turno con hasta 256K tokens de historial, permitiendo mantener el estado completo de la interacción sin truncamiento. Su capacidad de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Análisis de documentos con imágenes: gracias a la torre de visión bf16, puede extraer texto de capturas, tablas o diagramas y razonar sobre ellos, útil para automatizar la revisión de facturas o formularios escaneados.
- Generación de código en producción: con soporte de tool calling y un 82% en HumanEval, puede integrarse en pipelines de CI/CD para sugerir parches, generar tests o documentar APIs, usando el modo thinking para razonar sobre el contexto del repositorio.
- Chatbot de soporte técnico bilingüe (inglés/chino): el modelo responde en ambos idiomas y mantiene coherencia en conversaciones largas, adecuado para empresas con usuarios en mercados de habla inglesa y china.
- Procesamiento de video para moderación de contenido: el pipeline de video permite analizar clips cortos (hasta 2 por prompt) para detectar contenido inapropiado o extraer metadatos descriptivos.
- Inferencia local en entornos con restricción de hardware: al caber en 2×RTX 3090 con 256K de contexto, es viable para despliegues on-premise sin depender de GPUs profesionales como A100 o H100.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron con **thinking ON** (modo de razonamiento activado), lo que incrementa la puntuación en tareas de opción múltiple entre 5 y 10 puntos respecto a thinking OFF. La columna "Ex-truncation" ajusta los errores debidos al límite de muestreo de 4096 tokens en tareas de razonamiento largo.

| Benchmark | Muestras | Accuracy | Ex-truncation | Tasa de truncamiento |
|---|---:|---:|---:|---:|
| MMLU | 150 | 84.00 | 95.45 | 12.0 % |
| CMMLU | 150 | 84.67 | 92.03 | 8.0 % |
| C-Eval | 150 | 78.67 | 88.06 | 10.7 % |
| ARC-C | 150 | 94.00 | 94.63 | 0.7 % |
| TruthfulQA MC1 | 150 | 85.33 | 92.09 | 7.3 % |
| GSM8K | 100 | 97.00 | 98.98 | 2.0 % |
| MATH-500 | 100 | 77.00 | 79.38 | 3.0 % |
| BBH | 150 | 88.67 | 97.01 | 10.7 % |
| HumanEval | 164 | 82.32 | 91.22 | 9.8 % |
| IFEval strict | 100 | 79.00 | 91.57 | 17.0 % |

Además, en una batería de 7 imágenes sintéticas (colores sólidos, conteo de formas, OCR, grid, colores densos, test de resize 1808×4000) obtuvo 7/7 aciertos. En tool calling, logró 7/11 en una suite mixta de 8 casos estándar, 1 composición multi-herramienta y 2 casos límite. En seguridad, rechazó 99/100 comportamientos dañinos del split `test` de `mlabonne/harmful_behaviors` (thinking OFF).

## Requisitos de hardware

- VRAM estimada: 8.87 GiB por rank en 2×RTX 3090 (TP=2), con 12.84 GiB libres por rank para caché KV (total ~415K tokens de pool).
- GPUs recomendadas: 2×NVIDIA RTX 3090 24 GB con NVLink; también podría ejecutarse en 2×RTX 4090 o GPUs de 24 GB similares.
- En consumer GPU: sí, cabe en dos GPUs de 24 GB; no cabe en una sola GPU de 24 GB (el modelo necesita ~18 GB de pesos + overhead).
- Opciones de despliegue: vLLM (verificado con versión 0.20.2, `float16` compute), con flags específicos para visión y tool calling. También compatible con llama.cpp y Ollama si se convierte a GGUF, aunque no está documentado.
- Rendimiento medido en 2×3090: 55–70 tok/s en una sola petición con thinking activado; ~700 tok/s agregados con 16 peticiones concurrentes; pico de prefill de 3,300 tok/s por petición.
- Parámetros de lanzamiento recomendados: `--tensor-parallel-size 2 --gpu-memory-utilization 0.95 --max-model-len 262144 --max-num-seqs 16 --enable-prefix-caching --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3 --mm-processor-kwargs '{"max_pixels": 2097152}' --limit-mm-per-prompt '{"image": 8, "video": 2}'`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | Sí (bf16) | No (bf16) | Apache 2.0 |
| Qwen3.8-27B-W4A16-vision (este) | 27B | 256K | Sí (bf16) | W4A16 GPTQ | Apache 2.0 |
| Qwen3.8-27B-Uncensored-W4A16-vision | 27B | 256K | Sí (bf16) | W4A16 GPTQ | Apache 2.0 |

La comparativa directa con otros modelos cuantizados de la misma familia no está disponible en la información proporcionada. El modelo base sin cuantizar requiere ~54 GB de VRAM en bf16, mientras que esta versión reduce el peso a ~18 GB, manteniendo la misma longitud de contexto y la torre de visión intacta. La variante "Uncensored" usa el mismo pipeline de cuantización pero parte de un checkpoint modificado.

## Limitaciones y advertencias

- Confusión de identidad: preguntado "¿quién eres?", el modelo a veces afirma ser Claude o GPT, herencia de los datos de entrenamiento. Se recomienda fijar un system prompt para forzar la identidad si es relevante.
- Detalle visual fino: la torre de visión es la misma que la del Qwen3.8-27B original; para OCR de texto pequeño denso o conteo de objetos pequeños, los modelos dedicados Qwen3-VL ofrecen mejor rendimiento.
- Imágenes grandes: imágenes de más de ~2M píxeles requieren downsampling por parte del servidor (con `--mm-processor-kwargs '{"max_pixels": 2097152}'`) o del cliente para evitar errores de truncamiento del tokenizador.
- Sesgos y alucinación: no se han publicado evaluaciones específicas de sesgos más allá del test de seguridad (99/100 rechazos). Como todo LLM, puede alucinar en tareas de razonamiento largo; los benchmarks muestran una tasa de truncamiento de hasta 17% en IFEval, lo que sugiere que el modo thinking puede agotar el presupuesto de tokens en tareas complejas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base es de Qwen; la atribución correspondiente se mantiene.
- Soporte de video: aunque se habilita con `--limit-mm-per-prompt`, el rendimiento en video no está evaluado en los benchmarks publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-W4A16-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante con MTP head: https://huggingface.co/bowmanslayer/Qwen3.8-27B-W4A16-vision-mtp
- Variante Uncensored (misma receta de cuantización): https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision
