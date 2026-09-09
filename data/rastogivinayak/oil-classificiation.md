# rastogivinayak/oil-classificiation

## Resumen

El modelo **SAR Oil-Spill Classifier** es un clasificador ternario de imágenes de teledetección por radar de apertura sintética (SAR) diseñado para identificar la presencia de vertidos de petróleo en escenas del satélite Sentinel-1. Fue desarrollado por **Vinayak Rastogi** (rastogivinayak) y se publica en Hugging Face como prototipo de investigación, no como sistema certificado.

El modelo distingue entre tres clases: `oil` (vertido real), `lookalike` (fenómenos que imitan la firma SAR de un vertido, como zonas de baja velocidad de viento o biopelículas) y `no_oil` (ausencia de vertido). Es la primera etapa de un pipeline cuya siguiente fase segmenta las escenas confirmadas para estimar la superficie afectada.

La arquitectura es un **ResNet18** preentrenado en ImageNet con la primera capa convolucional adaptada para aceptar dos canales de entrada (VH y VV, retrodispersión SAR dual-polarizada en dB). El modelo tiene **11.184.515 parámetros** y está entrenado sobre 2.570 escenas Sentinel-1 con etiquetas de escena completa. Su rendimiento en un conjunto de prueba balanceado de 450 imágenes alcanza una precisión global del **86,89 %**.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet18 (backbone ImageNet) con primera convolución modificada para 2 canales de entrada |
| Parámetros totales | 11.184.515 |
| Parámetros activos | No procede (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes; sin entrada de texto) |
| Tipos de cuantización | No disponibles |
| Idiomas soportados | No aplica (modelo de clasificación de imágenes; entrada SAR y salida categórica) |
| Licencia | other (marcada como "other" en Hugging Face; según el README es un placeholder sin definir legalmente) |
| Formato de pesos | safetensors (state_dict) |

## Arquitectura y entrenamiento

El modelo es una red **ResNet18** clasificadora de imágenes de tres clases. En lugar de las tres bandas RGB habituales, la primera convolución acepta dos canales de entrada correspondientes a la retrodispersión co-polarizada y contra-polarizada de Sentinel-1. Los pesos de esta capa se inicializan promediando los pesos preentrenados de los tres canales originales sobre los dos nuevos canales, de modo que el resto del backbone conserva un estado de arranque razonable. Según el README, el código de reconstrucción exacto está disponible en `model.py`; los pesos se distribuyen como `state_dict` sin serialización de objeto.

No se dispone de los detalles completos del procedimiento de entrenamiento: el modelo se entrenó con **torch==2.14.0** y **torchvision==0.29.0** sobre **2.570 escenas Sentinel-1 IW GRD** con calibración, corrección de terreno y valores en dB, con una resolución nativa de 2048x2048 píxeles redimensionada a 512x512. Las etiquetas de clase proceden de la carpeta de origen del dataset de cada escena, por lo que son etiquetas de escena completa, no anotaciones a nivel de píxel. La evaluación se realizó sobre un conjunto reservado de **450 escenas** (150 por clase). No se informa de ajuste por RLHF, DPO ni ninguna técnica de alineación por preferencias, ya que no es un modelo de lenguaje.

## Capacidades

- Clasificación ternaria de imágenes SAR: distingue entre `oil`, `lookalike` y `no_oil`.
- Entrada específica de Sentinel-1 dual-pol: requiere dos canales (VH, VV) en dB, recortados al percentil 1-99 y redimensionados a 512x512.
- Buena separación entre vertidos reales y ausencia de vertido: recall del 91,3 % y precisión del 95,8 % para la clase `oil`.
- Capacidad para operar dentro de un pipeline cuyo siguiente paso es la segmentación de escenas confirmadas para estimar la zona de derrame.
- No dispone de generación de texto, tool calling, agentes ni capacidades multimodales de lenguaje.
- No admite entrada de imágenes RGB ni de tres canales; alimentarlo con otros formatos producirá resultados sin significado.

## Casos de uso

- **Monitorización de vertidos en operaciones marítimas**: el clasificador puede usarse como etapa rápida de triaje en un sistema que analiza escenas Sentinel-1. Las imágenes etiquetadas como `oil` se envían a un modelo de segmentación posterior para cuantificar la superficie afectada. Es adecuado porque la clase `oil` tiene un recall del 91,3 % y precisión del 95,8 % en el conjunto de prueba.
- **Filtrado de grandes volúmenes de imágenes satelitales**: antes de un análisis más costoso, el modelo puede descartar las escenas `no_oil` con un recall del 94,7 %, reduciendo el tiempo de cómputo de un sistema de vigilancia ambiental.
- **Investigación oceanográfica de falsos positivos**: la clase `lookalike` agrupa fenómenos como zonas de baja velocidad de viento, biopelículas y cizalladura de corrientes. El modelo permite estudiar estos eventos y sus firmas SAR en grandes conjuntos de datos, aunque su recall en esta clase es moderado (65,3 %).
- **Detección de derrames en emergencias**: tras un accidente marítimo, el modelo puede clasificar rápidamente múltiples escenas de la zona y priorizar las que presentan firma compatible con vertido, facilitando la revisión humana antes de decisiones operativas.
- **Análisis de series temporales**: integrado en un pipeline de procesado batch de archivos Sentinel-1, permite monitorizar la evolución de un vertido a lo largo del tiempo en una región concreta, generando informes de presencia/ausencia que alimentan una segmentación posterior.
- **Prototipado de herramientas de demostración**: dada su arquitectura ligera y el reducido número de parámetros, es adecuado para construir prototipos funcionales en entornos de cómputo modestos y para formar parte de una demo de investigación sobre teledetección.

## Benchmarks y rendimiento

Los resultados que se indican a continuación proceden del conjunto de prueba descrito en la model card: n=450, balanceado con 150 escenas por clase.

| Métrica | Valor |
|---|---|
| Precisión global | 86,89 % |
| Recall clase no_oil | 94,7 % |
| Precisión clase no_oil | 74,7 % |
| Recall clase lookalike | 65,3 % |
| Precisión clase lookalike | 83,8 % |
| Recall clase oil | 91,3 % |
| Precisión clase oil | 95,8 % |

Matriz de confusión (filas = etiqueta real; columnas = etiqueta predicha; valores capturados en la última época, pueden variar ligeramente respecto a la precisión global):

| Real \ Predicho | no_oil | lookalike | oil |
|---|---|---|---|
| no_oil | 142 | 8 | 0 |
| lookalike | 46 | 98 | 6 |
| oil | 2 | 11 | 137 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El README advierte que la matriz puede diferir ligeramente del valor global porque se capturó en la última época y no desde el mejor checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB para una imagen de 512x512 en FP32 con lote de 1. Los pesos ocupan aproximadamente 45 MB; las activaciones intermedias de ResNet18 suponen unos cientos de MB.
- **GPU recomendada**: cualquier GPU con más de 1 GB de memoria; por ejemplo, RTX 2060, RTX 3060 o superior. Es viable en CPU para uso puntual o en lotes pequeños.
- **Cuantización**: no se publican pesos cuantizados; el modelo usa FP32 por defecto.
- **Opciones de despliegue**: PyTorch, ONNX Runtime si se exporta a ONNX, y el pipeline de clasificación de imágenes de Hugging Face. Al no ser un modelo de lenguaje, las opciones tipo vLLM o TGI no son aplicables.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado alternativas comparables con la misma tarea y con datos de rendimiento disponibles en la información proporcionada. El único enfoque similar encontrado en la búsqueda web es un clasificador de vertidos basado en VGG-19 publicado en IEEE (con un dataset de 600 imágenes), pero no se dispone de sus métricas ni de su código.

| Modelo | Arquitectura | Parámetros | Métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAR Oil-Spill Classifier | ResNet18 modificado | 11.184.515 | Precisión global 86,89 % | other (placeholder) | safetensors en Hugging Face |
| Alternativas con misma tarea | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Clase débil**: el modelo separa con claridad `oil` y `no_oil`, pero confunde con frecuencia las escenas `lookalike` con `no_oil` (recall de `lookalike` del 65,3 %). Esto es esperable dada la naturaleza de los fenómenos que imitan la firma de un vertido.
- **Pérdida de detalle por reescalado**: la resolución original de 2048x2048 se reduce a 512x512, lo que puede borrar texturas finas de los lookalikes espacialmente pequeños y contribuir a la brecha de recall.
- **Etiquetas de escena, no de píxel**: el modelo indica si una escena contiene petróleo, pero no localiza el derrame. La localización requiere un modelo de segmentación posterior.
- **Distribución limitada**: la evaluación se realizó sobre un único dataset y una única distribución geográfica. No está validado para regiones fuera de esa distribución, ni para otros sensores o condiciones de adquisición.
- **Sin evaluación de robustez**: no se ha evaluado la robustez adversarial, la calibración de probabilidades ni la equidad entre subgrupos.
- **No es un sistema certificado**: el README declara explícitamente que es un prototipo de investigación; no está validado para decisiones operativas autónomas, informes regulatorios ni aplicaciones con consecuencias reales sin revisión humana.
- **Licencia pendiente**: la licencia aparece como `other` y el propio README indica que es un placeholder. Los pesos se entrenaron sobre un dataset alojado en Zenodo cuya licencia puede ser restrictiva y condicionar el uso legal del modelo. Debe revisarse la licencia antes de cualquier uso comercial o publicación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rastogivinayak/oil-classificiation)
- [Perfil del autor en Hugging Face](https://huggingface.co/rastogivinayak)
- [Artículo de referencia sobre clasificación automática de vertidos con VGG-19 (contexto adicional)](https://ieeexplore.ieee.org/document/11496312/)
