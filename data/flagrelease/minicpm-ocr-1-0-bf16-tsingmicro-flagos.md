# FlagRelease/MiniCPM-OCR-1.0-BF16-tsingmicro-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento de texto desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado para escenarios documentales del mundo real: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas, con soporte para extracción de texto, fórmulas y tablas complejas, además de extracción de información clave. En las evaluaciones oficiales, este modelo ligero alcanzó 93,68 en Real5-OmniDocBench.

La versión publicada bajo el identificador `FlagRelease/MiniCPM-OCR-1.0-BF16-tsingmicro-FlagOS` es una adaptación del modelo original para el chip Tsingmicro, producida por la plataforma FlagRelease utilizando el stack de software FlagOS. FlagOS es un stack de código abierto que unifica las capas de modelo, sistema y chip, permitiendo un flujo de trabajo de "desarrollar una vez, ejecutar en cualquier lugar" sobre aceleradores de IA diversos.

La relevancia de esta ficha concreta radica en que demuestra la portabilidad del modelo a hardware no-NVIDIA: el build de FlagOS para Tsingmicro alcanza una consistencia de resultados cercana a la del stack nativo de NVIDIA (OcrBench 77,1 frente a 80,5), lo que facilita el despliegue en infraestructuras heterogéneas. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado en OCR y parsing documental; no se detalla la arquitectura interna en la información proporcionada) |
| Parámetros totales | 1.300.434.160 (1,3B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (según el nombre del repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,6 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención ni composición del dataset de entrenamiento). El modelo card describe el objetivo funcional: parsing de documentos y reconocimiento de texto en escenarios reales, incluyendo escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas. Forma parte de la serie MiniCPM-OCR, que comprende dos modelos: MiniCPM-OCR 1.0 (1,3B) y MiniCPM-OCR Jev (2B).

Como innovación técnica destacable, el modelo card menciona la decodificación acelerada DSpark, que mejora la eficiencia de procesamiento de extremo a extremo en un 55 %. También se documenta el proceso de adaptación cruzada de chips llevado a cabo por la comunidad FlagOS, que cubre 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX). En esta ronda de evaluación, el build FlagOS de Jev alcanzó el 98,7 % del rendimiento de cómputo nativo de NVIDIA, mientras que en la misma plataforma OCR 1.0 entregó hasta 1,69× el throughput nativo P50 por unidad de cómputo pico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto (OCR) en documentos escaneados, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parsing de documentos con extracción de texto, fórmulas matemáticas y tablas complejas.
- Extracción de información clave de documentos estructurados y semiestructurados.
- Procesamiento de imágenes como entrada (el script de invocación del model card muestra mensajes multimodales con `image_url` en base64).
- Soporte multilingüe limitado a chino e inglés según los metadatos del repositorio.
- Aceleración de decodificación mediante DSpark, con una mejora de eficiencia del 55 % en procesamiento de extremo a extremo.
- Despliegue mediante servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`), lo que facilita la integración con herramientas como AnythingLLM.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de archivos históricos y administrativos: el modelo puede procesar escaneos y fotografías de documentos con páginas curvadas o iluminación irregular, extrayendo texto y tablas para su indexación posterior, gracias a su entrenamiento específico en escenarios documentales reales.
- Automatización de facturación y contabilidad: extracción de información clave (importes, fechas, emisores) de facturas y recibos fotografiados, reduciendo la entrada manual de datos en flujos financieros.
- Procesamiento de formularios y documentos regulatorios: parsing de tablas complejas y campos estructurados en documentos de cumplimiento normativo, con salida en texto plano lista para validación.
- Reconocimiento de fórmulas en documentación técnica y académica: conversión de ecuaciones presentes en PDFs escaneados o fotografías de pizarras a texto estructurado para su reutilización en editores científicos.
- Digitalización en dispositivos de borde: gracias al soporte de FlagOS para terminales ARM y al reducido tamaño del modelo (1,3B), es viable desplegarlo en dispositivos de borde para captura y procesamiento de documentos sin conexión a la nube.
- Inspección de calidad documental combinada con MiniCPM-OCR Jev: el modelo 1.0 realiza el parsing y Jev actúa como "inspector de calidad" puntuando la fiabilidad del resultado (AUROC 0,936 en JevOCRBench), permitiendo marcar contenido que requiere revisión humana.
- Integración en asistentes de escritorio mediante AnythingLLM: el model card documenta la integración con esta herramienta, lo que permite a usuarios finales consultar documentos e imágenes a través de una interfaz de chat local.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Tsingmicro-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 77,1 |
| omni_doc_bench_v1_6 | 96,4585 | En evaluación |

Datos adicionales del model card: MiniCPM-OCR 1.0 obtuvo 93,68 en Real5-OmniDocBench. El modelo Jev (2B) alcanza un AUROC global de 0,936 en JevOCRBench, cercano al 0,938 de Qwen3.5-397B-A17B. En dispositivos ARM de borde, Jev completa una evaluación de bloque de página en 1,20 segundos de media usando solo la CPU M5.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,3B parámetros en BF16, los pesos ocupan aproximadamente 2,6 GB; el total de VRAM dependerá del tamaño de las imágenes de entrada y de la longitud de contexto, no especificados.
- GPU recomendadas: la versión de este repositorio está adaptada específicamente al chip Tsingmicro mediante FlagOS. El modelo original se ha validado en NVIDIA (stack nativo) y en 12 plataformas en total, incluyendo Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Iluvatar CoreX, Xiwang, CIX y Mac ARM.
- Cabe en GPU de consumo: con 1,3B parámetros en BF16, es probable que quepa en GPUs de consumo con 8 GB o más de VRAM, aunque esta estimación no se confirma en la información proporcionada.
- Opciones de despliegue: el model card documenta un contenedor Docker de FlagOS-Tsingmicro con servidor compatible con la API de OpenAI, basado en vLLM 0.24.0. También se menciona integración con AnythingLLM. No se documentan opciones como llama.cpp u Ollama.
- Latencia y throughput: en ARM de borde, Jev completa una evaluación de bloque de página en 1,20 s con CPU M5. En la plataforma Tsingmicro, OCR 1.0 entrega hasta 1,69× el throughput nativo P50 por unidad de cómputo pico. No se proporcionan cifras absolutas de latencia o tokens por segundo para OCR 1.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documental | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta ficha) | 1,3B | no disponible | OcrBench 80,5 (NVIDIA nativo); Real5-OmniDocBench 93,68 | Apache 2.0 | Hugging Face, ModelScope |
| MiniCPM-OCR Jev | 2B | no disponible | AUROC 0,936 en JevOCRBench (tarea de inspección de calidad, no directamente comparable) | no disponible en la información proporcionada | Hugging Face |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | AUROC 0,938 en JevOCRBench (referencia citada para la tarea de Jev) | no disponible en la información proporcionada | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de OCR del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés según los metadatos; el rendimiento en otros idiomas no está documentado.
- No se detalla la arquitectura interna ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos potenciales.
- Riesgo de alucinación inherente a los modelos generativos: en tareas de extracción de información clave, el modelo podría generar contenido no presente en el documento; se recomienda validación posterior (para ello existe MiniCPM-OCR Jev como inspector de calidad).
- La versión de este repositorio está adaptada al chip Tsingmicro; el rendimiento en otras plataformas puede diferir (OcrBench 77,1 en Tsingmicro frente a 80,5 en NVIDIA nativo, una diferencia de 3,4 puntos).
- El resultado de omni_doc_bench_v1_6 para la versión Tsingmicro figura como "Evaluating" en el model card, por lo que no hay confirmación de paridad completa con el stack nativo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos completos y las posibles patentes asociadas.
- El repositorio tiene un número muy bajo de descargas (7) y likes (0), lo que sugiere una adopción limitada y poca validación comunitaria de esta variante concreta.
- El despliegue documentado requiere Docker con privilegios (`--privileged`), lo que puede no ser aceptable en entornos de producción con políticas de seguridad estrictas.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-tsingmicro-FlagOS
- AnythingLLM: https://anythingllm.com/
- Repositorio de imágenes Docker FlagOS: harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-tsingmicro001-gems5.4.0-treenone-cx0.1.0-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp310-pt211-raisa1.4.0-x64-v0.30279.6:202610260708
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
