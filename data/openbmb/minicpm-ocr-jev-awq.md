# openbmb/MiniCPM-OCR-Jev-AWQ

## Resumen

MiniCPM-OCR Jev es un modelo multimodal de evaluación de calidad OCR desarrollado por OpenBMB, publicado en su variante cuantizada AWQ W4A16 en el repositorio `openbmb/MiniCPM-OCR-Jev-AWQ`. A diferencia de los modelos OCR tradicionales, no extrae texto de imágenes: dado el recorte de una región de documento (texto, fórmula o tabla) y un resultado OCR candidato, devuelve una puntuación de 0 a 1 que indica la probabilidad de que el candidato sea correcto. Resuelve así el problema de la verificación automática de resultados OCR, permitiendo aceptar automáticamente las regiones fiables, derivar a revisión humana solo las dudosas, o seleccionar el mejor candidato entre varios motores OCR.

Su relevancia radica en su eficiencia: con solo 2.213 millones de parámetros (entrenado a partir de Qwen3.5-2B), supera en AUROC de decisión (93,6 sobre JevOCRBench) a modelos mucho mayores como JEV-35B-A3B (90,1) y se acerca a Qwen3.5-397B-A17B (93,8). La variante AWQ de 4 bits reduce el tamaño del repositorio a 2,4 GB, haciéndolo desplegable en hardware modesto. Está publicado bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal basado en Qwen3.5-2B (encoder de visión + backbone de lenguaje) con `lm_head` sustituida por una cabeza de clasificación binaria |
| Parámetros totales | 2.213.245.760 (≈2,21 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ W4A16 (4 bits de pesos, activaciones en FP16), formato compressed-tensors |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se entrena desde Qwen3.5-2B, conservando el encoder de visión y el backbone de lenguaje, y sustituyendo la cabeza de salida del modelo de lenguaje (`lm_head`) por una cabeza de clasificación binaria que aprende si un candidato OCR es correcto. La unidad de evaluación es una región individual (texto, fórmula o tabla) junto con su candidato: la entrada incluye la imagen original recortada del documento y el contenido candidato, que consiste en el texto OCR y una imagen renderizada a partir de ese texto. Esta comparación visual entre original y renderizado permite al modelo detectar discrepancias que un análisis puramente textual pasaría por alto.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. Como innovación destacable, el modelo puede operar con un servicio con renderizador integrado (API en la nube, imagen Docker o SDK local): en ese caso solo hay que suministrar la imagen original de la región, el texto candidato y la categoría (`text` / `formula` / `table`); sin renderizador, hay que aportar también la imagen renderizada.

## Capacidades

- Evaluación de calidad de resultados OCR sobre regiones de tipo texto, fórmula y tabla, devolviendo una puntuación continua de 0 a 1.
- Discriminación entre candidatos correctos e incorrectos con AUROC (×100) de 93,6 en JevOCRBench.
- Cribado automático para reducir revisión humana: las regiones con puntuación superior a un umbral se aceptan automáticamente y el resto pasa a revisión.
- Selección best-of-N: puntuación de candidatos de varios motores OCR (MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6, Xiaomi-OCR-0) para elegir el mejor resultado por región.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text) con soporte de inglés y chino.
- No es un modelo de generación de texto general: su salida es una puntuación, no texto libre, por lo que no se anuncian capacidades de código, matemáticas, tool calling ni agentes.

## Casos de uso

- Cribado automático de resultados OCR en digitalización masiva de documentos: se puntúa cada región parseada y se fija un umbral con muestras de la aplicación propia; los resultados por encima del umbral avanzan sin intervención y el resto va a revisión humana, reduciendo el volumen de revisión manual manteniendo la precisión.
- Procesamiento de documentos legales: el cribado automático permite aceptar automáticamente un porcentaje alto de regiones en documentos jurídicos, donde los errores de OCR son críticos y la revisión humana es costosa.
- Verificación de recibos financieros: las regiones de texto y tabla de recibos se puntúan para detectar errores de transcripción antes de alimentar sistemas de contabilidad o auditoría.
- Ensamblado multi-motor (best-of-N): varios modelos OCR (MiniCPM-OCR 1.0, Xiaomi OCR, PaddleOCR-VL 1.6) parsean las mismas regiones con la misma segmentación de layout; Jev selecciona el candidato de mayor puntuación por región y los resultados se combinan en orden de lectura, mejorando la calidad global del parseo.
- Documentos complejos con fórmulas y tablas: al evaluar por separado categorías `text`, `formula` y `table`, es adecuado para artículos científicos e informes técnicos donde las fórmulas mal reconocidas son frecuentes.
- Control de calidad en pipelines de OCR en producción: integrado tras cualquier motor OCR como filtro de confianza barato (2B parámetros, 2,4 GB en AWQ), con métricas medibles (AUROC ≈ 92–93) para calibrar el umbral según el compromiso entre precisión aceptada y tasa de revisión.

## Benchmarks y rendimiento

AUROC (×100) en JevOCRBench (valores más altos = mejor discriminación entre parseos correctos e incorrectos):

| Modelo | AUROC (×100) |
|---|---|
| Qwen3.5-397B-A17B | 93,8 |
| MiniCPM-OCR Jev (2B) | 93,6 |
| JEV-35B-A3B | 90,1 |

Discriminación sobre parseos de distintos modelos OCR (200 muestras aleatorias de JevOCRBench, candidatos etiquetados a mano):

| OCR model | MiniCPM-OCR 1.0 | GLM-OCR | PaddleOCR-VL-1.6 | Xiaomi-OCR-0 |
|---|---|---|---|---|
| AUROC (×100) | 92,7 | 91,9 | 93,4 | 93,1 |

La brecha máxima entre los cuatro motores es de 1,5 puntos, lo que indica una generalización estable fuera del motor OCR de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos AWQ W4A16 el repositorio ocupa 2,4 GB, por lo que la inferencia debería ser viable con menos de 6 GB de VRAM considerando activaciones y el encoder de visión (estimación orientativa, no dato oficial).
- GPU recomendadas: no disponible oficialmente; dada la huella de memoria, cualquier GPU moderna de consumo (RTX 3060, RTX 4060 o superior) debería ser suficiente.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño de 2,4 GB en 4 bits; no hay lista oficial de GPUs compatibles.
- Opciones de despliegue: API en la nube de OpenBMB, imagen Docker, SDK de servicio local (con renderizador integrado o externo). El formato compressed-tensors indica compatibilidad con vLLM; se documentan guías de despliegue en el repositorio GitHub de MiniCPM-OCR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | AUROC JevOCRBench (×100) | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR Jev (este modelo, AWQ) | 2,21 B | Evaluación de calidad OCR | 93,6 | Apache 2.0 |
| JEV-35B-A3B | 35 B (A3B) | Evaluación de calidad OCR | 90,1 | no disponible |
| Qwen3.5-397B-A17B | 397 B (A17B) | Evaluación de calidad OCR | 93,8 | no disponible |

MiniCPM-OCR Jev ofrece un rendimiento cercano al modelo de 397B con menos del 0,6 % de sus parámetros, y supera a la variante de 35B, lo que lo posiciona como la opción más eficiente de su categoría. No hay datos comparativos de latencia o coste por inferencia en la información disponible.

## Limitaciones y advertencias

- No genera texto ni corrige errores: se limita a puntuar candidatos existentes, por lo que la calidad final está acotada por la cobertura y corrección de los candidatos que reciba.
- Los candidatos de la misma región deben compartir el recorte y los límites de contenido para que la selección best-of-N sea válida.
- El umbral de aceptación automática debe calibrarse con muestras de la aplicación propia: un umbral más alto reduce la tasa de aprobación automática, y hay que monitorizar simultáneamente la precisión de lo aceptado y el volumen de revisión humana.
- Soporte lingüístico limitado a inglés y chino; el rendimiento sobre documentos en otros idiomas no está documentado.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación (aplicable en parte al no generar texto) ni longitud de contexto.
- La variante AWQ requiere un runtime compatible con cuantización compressed-tensors (por ejemplo vLLM); no es directamente ejecutable con llama.cpp o GGUF.
- La licencia Apache 2.0 no impone restricciones al uso comercial.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/openbmb/MiniCPM-OCR-Jev-AWQ
- Modelo original BF16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Dataset de evaluación JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Guía de API en la nube: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Organización OpenBMB en HuggingFace: https://huggingface.co/openbmb
