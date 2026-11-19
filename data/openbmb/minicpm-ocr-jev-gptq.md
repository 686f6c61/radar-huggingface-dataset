# openbmb/MiniCPM-OCR-Jev-GPTQ

## Resumen

MiniCPM-OCR-Jev-GPTQ es la versión cuantizada del modelo MiniCPM-OCR Jev, desarrollado por OpenBMB. Se trata de un modelo multimodal de 2B parámetros diseñado específicamente para la evaluación de calidad de resultados OCR en regiones de texto, fórmulas y tablas. Dado un recorte de imagen de una región del documento y un resultado OCR candidato, el modelo devuelve una puntuación entre 0 y 1 que indica la probabilidad de que el candidato sea correcto.

El modelo parte de Qwen3.5-2B, conservando el codificador visual y el backbone de lenguaje, pero sustituyendo la cabeza de salida `lm_head` por una cabeza de clasificación binaria. Esta especialización convierte al modelo en una herramienta de enrutamiento y selección dentro de pipelines OCR, permitiendo aceptar automáticamente regiones fiables, derivar el resto a revisión humana o escoger el mejor candidato entre varios motores OCR.

Esta variante GPTQ W4A16 reduce los pesos a 4 bits (con activaciones en 16 bits), lo que rebaja el repositorio a 2,4 GB y facilita el despliegue en hardware modesto. Su relevancia actual radica en que un modelo de solo 2B parámetros alcanza un AUROC de decisión de 93,6 en JevOCRBench, superando a modelos mucho mayores y acercándose a referencias de casi 400B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B) con cabeza de clasificación binaria |
| Parametros totales | 2.213.245.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits, compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se entrena a partir de Qwen3.5-2B. Mantiene intactos el codificador visual y el backbone de lenguaje, y reemplaza la cabeza de generación `lm_head` por una cabeza de clasificación binaria que aprende a determinar si un candidato OCR es correcto. La unidad de evaluación es una región (texto, fórmula o tabla) junto con su resultado candidato; la entrada combina la imagen original del recorte y el contenido candidato (texto OCR y una imagen renderizada a partir de ese texto). La salida es una puntuación en el rango 0–1.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El proceso de cuantización GPTQ W4A16 se aplica sobre los pesos originales en BF16, reduciendo el tamaño del repositorio a 2,4 GB. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Evaluación de calidad OCR: asigna una puntuación de 0 a 1 a candidatos de texto, fórmulas y tablas.
- Discriminación entre resultados correctos e incorrectos de distintos motores OCR (MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6, Xiaomi-OCR-0).
- Selección best-of-N: puntúa varios candidatos para una misma región y permite escoger el de mayor puntuación.
- Enrutamiento automático: umbral configurable para aceptar resultados automáticamente y derivar el resto a revisión humana.
- Procesamiento multimodal de imagen y texto (image-text-to-text).
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de documentos legales: puntuar cada región parseada y aceptar automáticamente las que superen un umbral, reduciendo la carga de revisión humana en contratos y expedientes.
- Procesamiento de recibos financieros: evaluar la calidad de la extracción de importes y líneas de detalle, derivando a revisión los campos con baja puntuación.
- Selección entre múltiples motores OCR: ejecutar varios motores sobre la misma segmentación de layout y usar el modelo para elegir el mejor candidato por región, mejorando la calidad global del parseo.
- Extracción de fórmulas científicas: puntuar candidatos de fórmulas matemáticas y descartar aquellos con alta probabilidad de error antes de su publicación.
- Reconstrucción de tablas complejas: evaluar la calidad de la transcripción de tablas y priorizar la revisión de celdas o regiones dudosas.
- Control de calidad en pipelines de datos: integrar el modelo como etapa de validación en un pipeline ETL documental para monitorizar la fiabilidad del OCR a escala.
- Enrutamiento en sistemas de gestión documental: clasificar automáticamente regiones como "aceptadas" o "pendientes de revisión" según la puntuación obtenida.

## Benchmarks y rendimiento

Resultados de AUROC (×100) en JevOCRBench según la model card:

| Metrica | Valor |
|---|---|
| AUROC de decisión global | 93,6 |
| JEV-35B-A3B (referencia) | 90,1 |
| Qwen3.5-397B-A17B (referencia) | 93,8 |

Discriminación por motor OCR (misma muestra de 200 regiones):

| Motor OCR | AUROC (×100) |
|---|---|
| MiniCPM-OCR 1.0 | 92,7 |
| GLM-OCR | 91,9 |
| PaddleOCR-VL-1.6 | 93,4 |
| Xiaomi-OCR-0 | 93,1 |

La diferencia máxima entre motores es de 1,5 puntos. No se publican resultados de MMLU, HumanEval ni GSM8K, dado que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3–4 GB con la cuantización GPTQ W4A16 (pesos de 2,4 GB más overhead de activaciones y contexto).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM.
- Opciones de despliegue: transformers con soporte de compressed-tensors; despliegue mediante Docker o SDK local según la documentación del repositorio GitHub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC (×100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-Jev-GPTQ | 2,2B | no disponible | 93,6 | apache-2.0 | Hugging Face |
| JEV-35B-A3B | 35B (MoE) | no disponible | 90,1 | no disponible | no disponible |
| Qwen3.5-397B-A17B | 397B (MoE) | no disponible | 93,8 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos de referencia.

## Limitaciones y advertencias

- El modelo solo puntúa candidatos existentes; la calidad final está acotada por la cobertura y corrección de los candidatos proporcionados.
- Los candidatos de una misma región deben compartir los límites del recorte y del contenido para que la comparación sea válida.
- Idiomas soportados limitados a inglés y chino; el rendimiento en otros idiomas no está documentado.
- La selección del umbral de aceptación debe calibrarse con muestras de la aplicación concreta; un umbral más alto reduce la tasa de aceptación automática.
- No se documentan sesgos específicos ni tasas de alucinación, aunque al tratarse de una cabeza de clasificación el riesgo de generación libre es bajo.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-2B.
- La cuantización GPTQ W4A16 puede introducir una ligera degradación respecto a los pesos BF16 originales; no se publican métricas comparativas entre ambas versiones.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con regiones de gran tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-GPTQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Documentación de API: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Dataset JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
