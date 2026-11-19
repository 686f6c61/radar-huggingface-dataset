# openbmb/MiniCPM-OCR-Jev

## Resumen

MiniCPM-OCR Jev es un modelo de decisión de corrección de OCR desarrollado por OpenBMB. A diferencia de un OCR convencional, que transcribe imágenes a texto, este modelo evalúa si un resultado de OCR candidato es correcto para una región concreta de un documento (texto, fórmula o tabla). Dada la imagen recortada de la región, el texto candidato y una imagen renderizada a partir de ese texto, devuelve una puntuación entre 0 y 1, donde valores más altos indican mayor probabilidad de que el candidato sea correcto.

El modelo parte de Qwen3.5-2B: conserva el codificador visual y el backbone lingüístico, pero sustituye la cabeza de salida `lm_head` por una cabeza de clasificación binaria. Con 2.213.245.760 parámetros, es un modelo pequeño pensado para integrarse como componente de verificación en pipelines de digitalización documental, no como generador de texto general.

Su relevancia práctica está en que permite automatizar el filtrado de resultados OCR: aceptar automáticamente las regiones con puntuación alta y derivar el resto a revisión humana, o bien seleccionar el mejor candidato entre varios motores OCR. Según el autor, con solo 2B parámetros alcanza un AUROC de decisión de 93,6 en JevOCRBench, por encima de modelos mucho mayores como JEV-35B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3.5-2B; codificador visual y backbone lingüístico retenidos, `lm_head` sustituido por cabeza de clasificación binaria |
| Parametros totales | 2.213.245.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye mediante fine-tuning sobre Qwen3.5-2B. Mantiene la torre de visión y el backbone de lenguaje del modelo base, y reemplaza la cabeza de generación de tokens por una cabeza de clasificación binaria que aprende a discriminar entre candidatos OCR correctos e incorrectos. La unidad de evaluación es una región documental (texto, fórmula o tabla) junto con su resultado OCR candidato; internamente el modelo consume la imagen original de la región, el texto candidato y una imagen renderizada a partir de ese texto.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos figuran como no disponibles. La evaluación se realiza sobre JevOCRBench, un conjunto publicado por el propio autor, con métricas AUROC por categoría (texto, fórmula, tabla) y un experimento cruzado con cuatro motores OCR distintos (MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL-1.6 y Xiaomi-OCR-0) sobre 200 muestras etiquetadas manualmente.

## Capacidades

- Puntuación de corrección OCR: devuelve un score de 0 a 1 para un candidato dado en una región de texto, fórmula o tabla.
- Verificación multimodal: combina imagen original de la región, texto candidato e imagen renderizada del candidato.
- Generalización entre motores OCR: mantiene AUROC estable (91,9–93,4) al evaluar salidas de distintos parsers.
- Selección best-of-N: permite puntuar varios candidatos para la misma región y escoger el de mayor score.
- Filtrado automático con umbral: posibilita aceptar automáticamente regiones fiables y derivar el resto a revisión humana.
- Idiomas: inglés y chino.
- No es un modelo generativo de texto general; no se documentan tool calling, agentes ni modos de razonamiento multi-paso.

## Casos de uso

- Digitalización de documentos legales con control de calidad: puntuar cada región parseada y aceptar automáticamente las que superen un umbral calibrado, reduciendo la carga de revisión humana en contratos y expedientes.
- Procesamiento de recibos y documentos financieros: verificar la transcripción de importes, fechas y tablas, derivando a revisión las regiones con score bajo para evitar errores contables.
- Enrutado a revisión humana en pipelines masivos: usar el score como señal de triaje, manteniendo monitorizadas tanto la precisión de lo aceptado automáticamente como el volumen derivado.
- Ensamblado multi-motor (best-of-N): hacer que varios OCR parseen la misma región con la misma segmentación de layout y seleccionar el candidato con mayor puntuación de Jev.
- Mejora de la calidad de un OCR existente: integrar Jev como capa de verificación sobre MiniCPM-OCR 1.0, PaddleOCR-VL o Xiaomi-OCR sin cambiar el motor principal.
- Extracción de fórmulas y tablas complejas: validar específicamente regiones matemáticas y tabulares, donde los OCR suelen fallar con más frecuencia.
- Despliegue vía API en la nube o servicio Docker/SDK local: integrar la verificación en aplicaciones existentes mediante la API de ModelBest o el servicio autohospedado con renderizador incorporado.

## Benchmarks y rendimiento

Resultados de AUROC (×100) en JevOCRBench según la model card:

| Modelo | AUROC (×100) |
|---|---:|
| MiniCPM-OCR Jev (2B) | 93,6 |
| JEV-35B-A3B | 90,1 |
| Qwen3.5-397B-A17B | 93,8 |

Discriminación entre motores OCR (mismas 200 muestras, etiquetado manual):

| Motor OCR evaluado | AUROC (×100) |
|---|---:|
| MiniCPM-OCR 1.0 | 92,7 |
| GLM-OCR | 91,9 |
| PaddleOCR-VL-1.6 | 93,4 |
| Xiaomi-OCR-0 | 93,1 |

No se han publicado en la información disponible resultados desglosados por categoría (texto, fórmula, tabla) en forma numérica; solo se referencia una figura en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 2,2B parámetros, en fp16 rondaría los 4,5 GB de pesos y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 2,5 GB y 1,5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 o superior debería ser suficiente para inferencia en precisión completa.
- GPU de consumo: previsiblemente cabe en GPUs consumer con 8 GB o más de VRAM en fp16, y en 4–6 GB con cuantización (no confirmado).
- Opciones de despliegue: transformers; API en la nube de ModelBest; imagen Docker y SDK local con renderizador incorporado (el SDK sin renderizador exige proporcionar la imagen renderizada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto | AUROC (×100) en JevOCRBench | Licencia |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev | 2,2B | Verificación de corrección OCR | no disponible | 93,6 | Apache 2.0 |
| JEV-35B-A3B | 35B (MoE, 3B activos) | Verificación de corrección OCR | no disponible | 90,1 | no disponible |
| Qwen3.5-397B-A17B | 397B (MoE, 17B activos) | Modelo general multimodal | no disponible | 93,8 | no disponible |

La comparación se limita a los modelos citados en la model card; no se dispone de datos de otros verificadores OCR comparables.

## Limitaciones y advertencias

- Solo evalúa candidatos existentes: la calidad final está acotada por la cobertura y corrección de los motores OCR que generan los candidatos.
- Requiere que los candidatos de una misma región compartan los límites del recorte y del contenido para poder compararse.
- Los resultados de generalización (91,9–93,4) se obtuvieron sobre 200 muestras y cuatro parsers concretos; el autor recomienda validar sobre los datos objetivo antes de usarlo con otros motores o tipos de documento.
- La elección del umbral afecta al equilibrio entre precisión de lo aceptado automáticamente y volumen de revisión humana; debe calibrarse con muestras de la aplicación real.
- Idiomas limitados a inglés y chino; no se documenta soporte para castellano ni otras lenguas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos/negativos en la clasificación; no se documentan sesgos específicos.
- No disponible información sobre contexto máximo, cuantizaciones oficiales ni latencia, lo que dificulta planificar despliegues a gran escala sin pruebas propias.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de la API en la nube de ModelBest si se opta por esa vía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Dataset de evaluación JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
- API en la nube (ModelBest): https://platform.modelbest.ai/console/docs/api/ocr-jev
- Guía de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Guía de despliegue (Docker/SDK): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Documentación de la API (single-candidate, best-of-N, batched best-of-N): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
