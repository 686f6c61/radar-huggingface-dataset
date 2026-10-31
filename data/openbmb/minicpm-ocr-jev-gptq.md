# openbmb/MiniCPM-OCR-Jev-GPTQ

## Resumen

MiniCPM-OCR Jev (2B) es un modelo multimodal de evaluación de calidad OCR desarrollado por OpenBMB, publicado en Hugging Face bajo licencia Apache 2.0. Este repositorio concretamente aloja la versión cuantizada GPTQ W4A16 del modelo original en BF16. A diferencia de un OCR clásico, Jev no extrae texto: dada la imagen de una región de documento (texto, fórmula o tabla) y un resultado OCR candidato, devuelve una puntuación de 0 a 1 que indica la probabilidad de que el candidato sea correcto.

El modelo se entrena a partir de Qwen3.5-2B, conservando el encoder de visión y el backbone de lenguaje, y sustituyendo la cabeza `lm_head` por una cabeza de clasificación binaria. Su relevancia radica en que resuelve un problema real en pipelines documentales: decidir de forma automática qué resultados OCR son fiables, cuáles requieren revisión humana y cuál es el mejor entre varios candidatos de distintos motores OCR.

A pesar de sus solo 2.213 millones de parámetros, supera en discriminación a modelos mucho mayores: alcanza un AUROC de 93,6 (×100) en JevOCRBench, por encima de JEV-35B-A3B (90,1) y muy cerca de Qwen3.5-397B-A17B (93,8). La versión GPTQ a 4 bits reduce el repositorio a unos 2,4 GB, haciéndolo viable en GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (image-text-to-text) basado en Qwen3.5-2B con cabeza de clasificación binaria en lugar de `lm_head` |
| Parámetros totales | 2.213.245.760 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ W4A16 (4 bits de pesos, activaciones en FP16), formato compressed-tensors |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado GPTQ) |

## Arquitectura y entrenamiento

MiniCPM-OCR Jev se entrena desde Qwen3.5-2B. Se conservan tanto el encoder de visión como el backbone del modelo de lenguaje, y se reemplaza la cabeza de salida `lm_head` por una cabeza de clasificación binaria que aprende si un candidato OCR es correcto. La unidad de evaluación es una región individual del documento (texto, fórmula o tabla) junto con su resultado OCR candidato: el modelo recibe la imagen original recortada de la región y el contenido candidato, que incluye el texto OCR y una imagen renderizada a partir de ese texto.

En cuanto al despliegue, cuando se usa la API cloud, la imagen Docker o el SDK con renderer integrado, basta con suministrar la imagen de la región, el texto candidato y la categoría (`text` / `formula` / `table`); el servicio renderiza internamente la imagen del candidato. Un servicio sin renderer requiere aportar también la imagen renderizada. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Evaluación de calidad de resultados OCR sobre regiones de texto, fórmulas y tablas, devolviendo una puntuación de 0 a 1.
- Discriminación entre candidatos correctos e incorrectos con AUROC (×100) de 93,6 en JevOCRBench.
- Generalización estable entre motores OCR: AUROC entre 91,9 y 93,4 sobre resultados de MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0.
- Selección del mejor candidato (best-of-N) entre los resultados de varios motores OCR para una misma región.
- Filtrado automático por umbral para reducir el volumen de revisión humana.
- Entrada multimodal imagen + texto, con pipeline image-text-to-text.
- Idiomas de trabajo: inglés y chino.

No se indica soporte de tool calling, agentes, generación de código ni capacidades de audio; el modelo está especializado en la tarea de evaluación de calidad OCR.

## Casos de uso

- Filtrado automático en pipelines de digitalización documental: cada región parseada recibe una puntuación; las que superan un umbral se aceptan automáticamente y el resto se enruta a revisión humana, reduciendo el coste de revisión.
- Digitalización de documentos legales: el model card muestra curvas de precisión frente a tasa de aceptación automática para documentos legales, permitiendo ajustar el umbral según el nivel de exactitud exigido.
- Procesado de recibos financieros: evaluación de calidad por región para aceptar automáticamente los campos parseados fiables y derivar a revisión solo los dudosos.
- Ensamblado multi-motor (best-of-N): varios motores OCR (MiniCPM-OCR 1.0, Xiaomi OCR, PaddleOCR-VL 1.6) parsean la misma región con la misma segmentación de layout; Jev selecciona el candidato con mayor puntuación y los resultados se combinan en orden de lectura.
- Control de calidad en fórmulas matemáticas digitalizadas: evalúa candidatos de fórmulas, una de las categorías más propensas a errores de OCR.
- Validación de tablas extraídas: puntúa candidatos de tablas antes de su ingesta en bases de datos o sistemas contables.
- Monitorización de calidad de proveedores OCR: al generalizar entre motores (gap máximo de 1,5 puntos de AUROC), sirve como juez neutro para comparar la calidad de distintos servicios de OCR en producción.

## Benchmarks y rendimiento

AUROC (×100) sobre JevOCRBench (valores más altos = mejor discriminación entre candidatos correctos e incorrectos):

| Modelo | AUROC (×100) |
|---|---|
| MiniCPM-OCR Jev (2B) | 93,6 |
| Qwen3.5-397B-A17B | 93,8 |
| JEV-35B-A3B | 90,1 |

Discriminación sobre parses de distintos motores OCR (misma muestra de 200 regiones de JevOCRBench, candidatos etiquetados a mano):

| OCR model | MiniCPM-OCR 1.0 | GLM-OCR | PaddleOCR-VL-1.6 | Xiaomi-OCR-0 |
|---|---|---|---|---|
| AUROC (×100) | 92,7 | 91,9 | 93,4 | 93,1 |

Los resultados por categoría (texto, fórmula, tabla) se publican como imagen en el model card y no se detallan numéricamente en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos GPTQ W4A16 el repositorio ocupa unos 2,4 GB; en inferencia puede estimarse un uso del orden de 3–4 GB de VRAM incluyendo activaciones y el encoder de visión (estimación, no dato oficial).
- GPUs recomendadas: cualquier GPU moderna con soporte de kernels GPTQ de compressed-tensors/vLLM; dado el tamaño, GPUs de consumo como la RTX 4090, RTX 3090 o incluso tarjetas de 8 GB son candidatas razonables (no hay requisitos oficiales publicados).
- Cabe en GPU de consumo: sí, con toda probabilidad, dada la cuantización a 4 bits y los 2,4 GB de pesos.
- Opciones de despliegue: vLLM u otro runtime compatible con compressed-tensors (formato GPTQ W4A16); OpenBMB ofrece además API cloud, imagen Docker y SDK local con renderer integrado, documentados en el tutorial oficial de GitHub.
- Latencia y throughput: no disponible.

Nota: la versión GPTQ está orientada a runtimes tipo vLLM; para CPU o llama.cpp habría que recurrir a la versión BF16 original o a conversiones no oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | AUROC (×100, JevOCRBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este modelo, GPTQ W4A16) | 2,21B | Evaluación de calidad OCR | 93,6 | Apache 2.0 | Hugging Face, pesos abiertos |
| JEV-35B-A3B | 35B (MoE) | Evaluación de calidad OCR | 90,1 | no disponible | no disponible |
| Qwen3.5-397B-A17B | 397B (MoE) | Evaluación de calidad OCR | 93,8 | no disponible | no disponible |

La comparativa publicada por OpenBMB muestra que Jev, con una fracción mínima de parámetros, iguala casi el rendimiento del modelo de 397B y supera al de 35B en la misma tarea. No hay alternativas independientes de evaluación de calidad OCR con benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- El modelo no genera texto OCR: solo puntúa candidatos existentes, por lo que la calidad final está acotada por la cobertura y corrección de los candidatos que reciba.
- Los candidatos de una misma región deben compartir el recorte y los límites de contenido para que la selección best-of-N sea válida.
- Los umbrales de aceptación automática deben calibrarse con muestras de la aplicación concreta: un umbral más alto reduce el volumen aceptado automáticamente, y hay que monitorizar tanto la exactitud de lo aceptado como el volumen de revisión.
- Idiomas declarados: inglés y chino; el comportamiento sobre documentos en otros idiomas (por ejemplo, castellano) no está documentado.
- No se han publicado datos sobre sesgos, tasas de alucinación ni limitaciones de contexto en la información disponible.
- La versión GPTQ W4A16 implica una posible pérdida mínima de precisión respecto al BF16 original (no cuantificada en el model card) y requiere un runtime compatible con compressed-tensors.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- Algunos enlaces de documentación (como la guía de la API cloud) figuran como stubs en el momento de la ficha.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/openbmb/MiniCPM-OCR-Jev-GPTQ
- Modelo original BF16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Dataset de evaluación JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
- GitHub OpenBMB MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Organización OpenBMB en Hugging Face: https://huggingface.co/openbmb
