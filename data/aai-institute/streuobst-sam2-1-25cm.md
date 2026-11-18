# aai-institute/streuobst-sam2.1-25cm

## Resumen

Streuobst SAM 2.1 25 cm es un modelo de segmentación de imágenes aéreas desarrollado por el appliedAI Institute for Europe dentro de su proyecto qgis-segment. Se trata de un ajuste fino (fine-tuning) del codificador de imágenes de SAM 2.1 (hiera-b+) de Meta, especializado en la detección de Streuobstwiesen (prados de frutales tradicionales) sobre ortofotos RGB de Baden-Württemberg. El modelo resuelve un problema muy concreto de teledetección: identificar y delimitar estos hábitats agrarios de alto valor ecológico en imágenes aéreas de resolución submétrica.

El ajuste se realizó sobre 1.778 km² de la región de Regionalverband Neckar-Alb (RVNA), utilizando las ortofotos digitales de 2020 y el censo de frutales de 2021 como referencia. Las imágenes se procesan en teselas de 1024×1024 píxeles a 0,25 m/píxel (256 m × 256 m sobre el terreno), con una única caja delimitadora que cubre toda la tesela como prompt. El modelo devuelve una puntuación de probabilidad de frutal por píxel.

Es relevante porque demuestra que un ajuste fino ligero de SAM 2.1 (solo el codificador de imágenes, 69,1M de parámetros) puede igualar la precisión de enfoques anteriores basados en SAM v1 con adaptadores LoRA, reduciendo el tiempo de inferencia en aproximadamente un 30%. Con 80,9M de parámetros totales y licencia Apache-2.0, es un modelo compacto y desplegable para flujos de trabajo de SIG.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera image encoder con feature pyramid neck, prompt encoder y mask decoder) |
| Parámetros totales | 80,9M (codificador de imagen: 69,1M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1024×1024 px) |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 324 MB, float32; SHA-256 `f88712d2...2d69c9`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `sam2.1_hiera_base_plus.pt` de Meta. La arquitectura es la de SAM 2.1: un codificador de imágenes Hiera con cuello de pirámide de características (69,1M de parámetros), un codificador de prompts y un decodificador de máscaras. Los módulos de memoria de vídeo de SAM 2 no se utilizan para imágenes individuales. Solo se entrenó el codificador de imágenes (todos sus pesos, sin adaptadores); el codificador de prompts y el decodificador de máscaras permanecen tal como los publicó Meta.

El entrenamiento se realizó sobre 27.133 teselas (6.541 con presencia de frutal) procedentes de 1.778 km², con imágenes DOP 2020 RGB a 0,20 m remuestreadas bilinealmente a 0,25 m y etiquetas del censo RVNA 2021 (13.083 polígonos). Se usó una NVIDIA Tesla V100-SXM2 de 32 GB, 27.981 pasos de optimizador con batch de 4 teselas (112.000 vistas de tesela), 4,75 h de entrenamiento en precisión mixta (float16 autocast). Optimizador AdamW con weight decay 0,1 (sin decaimiento en sesgos y layer norms), learning rate 5,5e-5 con decaimiento coseno hasta 5,5e-6 y decaimiento por capas de 0,87 por bloque del codificador. El recorte de gradiente fue de norma global 0,1. La separación entre entrenamiento, calibración y test se hizo sobre el terreno (no por teselas), con un búfer de 256 m alrededor de los bloques de calibración y test para evitar fugas de información.

## Capacidades

- Segmentación semántica binaria de prados de frutales tradicionales (Streuobstwiesen) en ortofotos RGB aéreas.
- Procesamiento de teselas de 1024×1024 px a 0,25 m/píxel (256 m × 256 m sobre el terreno).
- Prompt mediante una única caja delimitadora que cubre toda la tesela (mismo esquema en entrenamiento y uso).
- Salida de puntuación logit por píxel; umbral de decisión de 0,03 (prácticamente indistinguible de 0).
- Detección de parcelas pequeñas: encuentra el 82% de las parcelas de frutal menores de 0,5 ha en la región de calibración y el 84% en la región de test.
- Integración con el plugin QGIS del proyecto qgis-segment, el servicio de inferencia y la interfaz de línea de comandos (`python -m streuobst.inference.inference --model sam2.1-25cm`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Cartografía de hábitats agrarios: inventariar y delimitar prados de frutales tradicionales a escala regional a partir de ortofotos, sustituyendo la digitalización manual de polígonos y reduciendo el coste de actualización de censos.
- Planificación territorial y conservación: identificar parcelas de alto valor ecológico para programas de protección, subvenciones agroambientales o evaluación de impacto ambiental, usando la salida por píxel como capa vectorizable en un SIG.
- Monitorización de cambios: comparar segmentaciones sobre ortofotos de distintos años para detectar pérdida o recuperación de superficie de frutales, aprovechando que el modelo trabaja sobre una cuadrícula fija de teselas.
- Integración en QGIS: usar el modelo como capa de segmentación dentro del plugin qgis-segment, permitiendo a técnicos sin formación en aprendizaje automático ejecutar la detección directamente en su entorno de trabajo habitual.
- Generación de capas auxiliares para modelos posteriores: producir máscaras de frutal que alimenten clasificadores de cultivos, modelos de biomasa o análisis de conectividad ecológica del paisaje.
- Automatización de flujos de teledetección: desplegar el modelo en un servicio de inferencia o pipeline por lotes que procese mosaicos completos de ortofotos, dado su reducido tamaño (80,9M de parámetros) y su menor tiempo de inferencia frente a SAM v1 con LoRA.
- Validación de censos existentes: contrastar los polígonos del censo oficial con las predicciones del modelo para detectar omisiones o discrepancias en la cartografía de referencia.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| Calibración (3 semillas de entrenamiento) | IoU agrupado | 0,655 |
| Calibración | Parcelas < 0,5 ha encontradas | 82% |
| Test retenido (evaluación única) | IoU | 0,622 |
| Test retenido | Parcelas < 0,5 ha encontradas | 84% |
| Test retenido (comparación, 3 semillas) | IoU SAM 2.1 vs SAM v1+LoRA | 0,620 vs 0,616 (una pasada) |
| Inferencia | Tiempo relativo | ~30% menos que SAM v1+LoRA |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 80,9M de parámetros en float32 (324 MB de pesos); la inferencia cabe holgadamente en GPUs de consumo, con un uso de VRAM de pocos GB incluyendo activaciones para teselas de 1024×1024.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia; el entrenamiento se realizó en una NVIDIA Tesla V100-SXM2 de 32 GB, pero no es necesaria para uso en producción.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el proyecto proporciona un servicio de inferencia propio, el plugin QGIS y una CLI (`python -m streuobst.inference.inference`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no se publican cifras absolutas; solo se indica que SAM 2.1 requiere aproximadamente un 30% menos de tiempo de inferencia que SAM v1 con adaptadores LoRA en la misma partición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | IoU en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Streuobst SAM 2.1 25 cm (este modelo) | 80,9M | 1024×1024 px a 0,25 m/px | 0,622 | Apache-2.0 | Hugging Face |
| SAM v1 + LoRA (modelo previo del proyecto) | no disponible | misma entrada | 0,616 | no disponible | no disponible |
| SAM 2.1 hiera-b+ base (Meta, sin ajustar) | 80,9M | 1024×1024 px | no disponible | Apache-2.0 | Hugging Face (facebook/sam2.1-hiera-base-plus) |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ortofotos de Baden-Württemberg (DOP 2020, 0,25 m/px) y el censo RVNA 2021; su generalización a otras regiones, sensores, resoluciones o fechas no está validada.
- El esquema de prompt es fijo: una caja que cubre toda la tesela. No se ha validado con prompts de punto, cajas parciales ni entradas de otra resolución.
- La salida es binaria (frutal / no frutal) con un umbral de 0,03; no distingue tipos de frutal ni otras clases de cubierta.
- Riesgo de falsos positivos y negativos en parcelas pequeñas o con mezcla de cubiertas; el propio modelo reporta que encuentra el 82-84% de las parcelas menores de 0,5 ha, lo que implica omisiones.
- No hay datos publicados sobre sesgos geográficos o de sensor más allá de la región de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el repositorio incluye ficheros `LICENSE` y `NOTICE` que deben conservarse con cada copia de los pesos.
- El código del proyecto (plugin QGIS, servicio de inferencia) aún no era público en el momento de la model card; las rutas `config/...` y `models/...` se refieren a un repositorio que se enlazará cuando esté disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aai-institute/streuobst-sam2.1-25cm
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-base-plus
- Paper SAM 2 (Ravi et al., 2024): no disponible en la información proporcionada
- Repositorio del proyecto qgis-segment: no disponible (pendiente de publicación según la model card)
- appliedAI Institute for Europe: no disponible en la información proporcionada
