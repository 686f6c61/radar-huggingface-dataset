# openbmb/MiniCPM-OCR-Jev-gguf

## Resumen

MiniCPM-OCR-Jev es un modelo multimodal de 2B parámetros (1.881.829.184 exactos) desarrollado por OpenBMB, diseñado específicamente para evaluar la calidad de candidatos OCR en regiones de texto, fórmulas y tablas, devolviendo una puntuación de calidad entre 0 y 1. No es un motor OCR en sí, sino un modelo de decisión ("decision-model") que puntúa la salida de otros sistemas de reconocimiento, lo que lo convierte en una pieza útil para pipelines de verificación y filtrado de extracción documental.

La arquitectura es un transformer multimodal con un proyector de visión separado (mmproj) que procesa imágenes junto con texto. Esta ficha cubre la versión GGUF publicada para llama.cpp, que incluye cuantizaciones desde F16 (3,776 GB) hasta IQ3_XS (1,027 GB), más el proyector de visión obligatorio en F16 (0,671 GB). El modelo base es openbmb/MiniCPM-OCR-Jev y la licencia es Apache 2.0.

Su relevancia actual radica en que resuelve un problema práctico de producción: en sistemas de digitalización masiva, elegir automáticamente la mejor transcripción entre varias candidatas sin intervención humana. Al ser un modelo pequeño y cuantizable, se puede desplegar en hardware modesto con llama-server y una ventana de contexto de hasta 40.960 tokens, integrándose en pipelines existentes de OCR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector de visión |
| Parámetros totales | 1.881.829.184 (~1,88B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 40.960 tokens (valor de ejemplo en la guía de despliegue) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, IQ4_NL, IQ3_M, IQ3_XS |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); también BF16, AWQ W4A16 y GPTQ W4A16 en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que combina un codificador de visión con un modelo de lenguaje para procesar pares imagen-texto. El repositorio GGUF incluye un proyector de visión (`mmproj-model-f16.gguf`) que es obligatorio para el funcionamiento; sin él, el modelo no puede procesar entradas visuales. La tarea está formulada como una clasificación de calidad: recibe una región de imagen (texto, fórmula o tabla) junto con una transcripción candidata y emite una puntuación entre 0 y 1, indicando la fiabilidad de esa transcripción.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base se distribuye en BF16 y las versiones AWQ y GPTQ W4A16 indican que el autor contempla despliegues con cuantización de pesos y activaciones para producción. La etiqueta "feature-extraction" en los tags sugiere que el modelo puede usarse también para extraer representaciones, aunque no se detalla cómo.

## Capacidades

- Evaluación de calidad OCR: puntúa transcripciones candidatas de regiones de texto, fórmula y tabla con un score de 0 a 1.
- Procesamiento multimodal: acepta imágenes junto con texto (pipeline image-text-to-text).
- Modo decisión: devuelve un campo `verdict` que indica si el scoring se ejecutó realmente (`scored`) o no.
- Soporte bilingüe: inglés y chino.
- Compatible con tool calling y endpoints: los tags incluyen `endpoints_compatible`, lo que indica integración con infraestructura de inferencia estándar.
- Extracción de características: etiquetado como `feature-extraction` en los tags.
- No se documentan capacidades de agentes multi-step, visión general, audio ni thinking mode en la información disponible.

## Casos de uso

- Verificación de pipelines OCR en producción: el modelo recibe la imagen de la región y la transcripción generada por un motor OCR, y devuelve una puntuación de calidad que permite filtrar automáticamente las extracciones dudosas antes de enviarlas a revisión humana.
- Digitalización de documentos con fórmulas: en entornos académicos o técnicos, se puede usar para validar la transcripción de fórmulas matemáticas, comparando candidatas de distintos motores y seleccionando la de mayor score.
- Extracción de tablas en facturación: al puntuar la calidad de cada celda o región de tabla, el modelo permite construir un sistema de confianza que marque las tablas mal reconocidas para reprocesamiento con otro motor o con un modelo mayor.
- Selección de mejor candidata (ensemble OCR): cuando se ejecutan varios motores OCR en paralelo, el modelo actúa como árbitro y elige la transcripción con mayor puntuación, sin necesidad de un LLM grande.
- Control de calidad en archivística: para digitalización masiva de fondos documentales, el modelo permite auditar lotes completos y generar métricas de calidad por tipo de región (texto, tabla, fórmula).
- Despliegue en edge o entornos con GPU limitada: con cuantización Q4_K_M (1,274 GB) más el proyector (0,671 GB), se puede ejecutar en una GPU consumer de 4 GB de VRAM, lo que permite integrarlo en estaciones de trabajo locales de digitalización.
- Filtrado previo en pipelines RAG documental: antes de indexar texto extraído de PDFs, el modelo puntúa la calidad de la extracción y descarta fragmentos poco fiables, mejorando la precisión de la recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB con Q4_K_M (1,274 GB) + proyector F16 (0,671 GB); aproximadamente 2,7 GB con Q8_0 (2,012 GB) + proyector; aproximadamente 4,4 GB con F16 (3,776 GB) + proyector. Estas cifras no incluyen el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; para F16 se recomienda 8 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: sí, en tarjetas con 4-8 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp mediante `llama-server` (ejemplo oficial con `--ctx-size 40960 --n-gpu-layers 999`); también existen versiones AWQ W4A16 y GPTQ W4A16 para otros motores, y BF16 original. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La categoría (evaluador de calidad OCR de ~2B parámetros) es específica y no se han identificado alternativas directas con datos verificables en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-Jev (este) | ~1,88B | hasta 40.960 | Apache 2.0 | GGUF, BF16, AWQ, GPTQ | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y chino; no se garantiza rendimiento en castellano u otros idiomas.
- Tarea restringida: no es un motor OCR general, sino un evaluador de calidad; no transcribe imágenes por sí mismo.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede emitir puntuaciones inconsistentes si la imagen o la transcripción candidata están fuera de distribución.
- Verificación obligatoria del campo `verdict`: la propia model card advierte que solo `verdict: scored` indica que el scoring se ejecutó; ignorar este campo puede llevar a interpretar respuestas vacías como válidas.
- Dependencia del proyector de visión: sin `mmproj-model-f16.gguf` el modelo no procesa imágenes; es un archivo obligatorio.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al entrenarse principalmente en inglés y chino puede tener peor comportamiento en documentos con otros alfabetos o formatos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base y de los datasets de entrenamiento (no detallados).
- Contexto: el valor de 40.960 tokens aparece como ejemplo de despliegue; no se confirma como máximo oficial del modelo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en la información disponible, por lo que se recomienda validación propia antes de producción.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-Jev-gguf
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- ModelScope BF16: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-Jev
- ModelScope GGUF: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-Jev-gguf
- AWQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-AWQ
- GPTQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-GPTQ
- GitHub OpenBMB/MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso (inglés): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Guía de despliegue en llama.cpp: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy_jev_en.md
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Licencia: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
