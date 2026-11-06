# small-models-for-glam/page-ocr-flags

## Resumen

Page OCR flags es un clasificador de imágenes de muy pequeño tamaño (2,53 millones de parámetros) desarrollado por la organización Small Models for GLAM. Su función es analizar una página escaneada antes de pasarla por un motor OCR y responder a dos preguntas: si hay texto que transcribir en esa cara del folio y si un motor OCR concreto (LightOnOCR-3-0.8B) probablemente fallará en esa página. Está pensado para bibliotecas, archivos y proyectos de digitalización masiva que procesan grandes volúmenes de escaneos y necesitan descartar páginas vacías o enrutar páginas problemáticas.

El modelo se basa en MobileNetV4-conv-small, preentrenado en ImageNet y afinado para clasificación multi-etiqueta sobre páginas en escala de grises de 384 × 384 píxeles. Genera siete salidas sigmoideas independientes que cubren detección de ausencia de texto, predicción de fallos específicos de LightOnOCR-3 (escritura sobre páginas vacías, truncamiento a 4.096 tokens y bucles de repetición), y pistas de enrutamiento como presencia de tablas o texto denso.

Su relevancia actual radica en la eficiencia: con 2,5 millones de parámetros y un throughput de aproximadamente 50 páginas por segundo en un solo hilo de CPU, permite filtrar y clasificar colecciones enteras antes de invocar motores OCR mucho más costosos, reduciendo trabajo innecesario y mejorando la calidad del pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4-conv-small (CNN), clasificación multi-etiqueta con 7 salidas sigmoideas |
| Parámetros totales | 2.527.079 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 384 × 384 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; entrenado mayoritariamente con libros impresos de los siglos XIX y XX) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (vía timm) |

## Arquitectura y entrenamiento

El modelo es una red convolucional MobileNetV4-conv-small, importada desde el checkpoint `timm/mobilenetv4_conv_small.e2400_r224_in1k` y afinada para una tarea de clasificación multi-etiqueta. La entrada es una imagen en escala de grises convertida a tres canales, redimensionada a 384 × 384 con deformación (sin recorte) y normalizada con media y desviación estándar de ImageNet. La cabeza produce siete logits independientes que se interpretan mediante sigmoide, no softmax, de modo que varias etiquetas pueden activarse simultáneamente en la misma página.

El entrenamiento se realizó principalmente con libros impresos de los siglos XIX y XX procedentes de la Biodiversity Heritage Library (BHL). Las etiquetas `lo_blank_write`, `lo_trunc` y `lo_loop` se generaron a partir de las salidas reales de LightOnOCR-3-0.8B sobre las páginas, mientras que `table` y `dense` provienen de respuestas de un profesor suave. La etiqueta `faint` se marca como experimental y no debe usarse. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la procedencia BHL.

## Capacidades

- Clasificación multi-etiqueta de páginas escaneadas con siete salidas independientes.
- Detección de ausencia de texto (`no_text`): papel en blanco, transparencia por la cara opuesta (show-through) o únicamente un sello de biblioteca.
- Predicción de fallos de LightOnOCR-3-0.8B: escritura de texto en páginas sin texto (`lo_blank_write`), truncamiento a 4.096 tokens (`lo_trunc`) y bucles de repetición (`lo_loop`).
- Pistas de enrutamiento: detección de tablas (`table`) y de texto denso (`dense`).
- Funcionamiento sobre páginas en escala de grises, con conversión previa a gris recomendada por el autor.
- Inferencia en CPU a aproximadamente 50 páginas por segundo en un solo hilo.
- Inferencia por lotes en GPU mediante NVIDIA DALI con decodificación de JPEG en GPU y precisión media (fp16).
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un clasificador de imagen.

## Casos de uso

- Filtrado previo a OCR en digitalizaciones masivas: el modelo descarta páginas sin texto antes de invocar el motor OCR, evitando coste de cómputo y salidas inventadas en páginas en blanco o con solo transparencia.
- Enrutamiento de páginas problemáticas: las páginas con alta probabilidad de truncamiento o bucle se envían a un motor alternativo o a un presupuesto de tokens mayor, mejorando la calidad global del pipeline.
- Explicación de salidas OCR defectuosas: tras una ejecución OCR, las puntuaciones de `lo_blank_write`, `lo_trunc` y `lo_loop` permiten auditar por qué una página produjo texto inventado, truncado o repetido.
- Procesamiento de colecciones históricas de bibliotecas y archivos: el entrenamiento sobre libros impresos de los siglos XIX y XX de la BHL lo hace adecuado para fondos bibliográficos antiguos digitalizados.
- Priorización de revisión manual: las páginas con puntuación de `no_text` en la franja intermedia (0,2–0,8) se marcan para revisión humana, concentrando el esfuerzo donde el modelo es inseguro.
- Detección de tablas y texto denso para enrutamiento: las etiquetas `table` y `dense` permiten dirigir páginas con tablas a configuraciones OCR específicas o a presupuestos de tokens ampliados.
- Procesamiento por lotes a gran escala en GPU: con DALI y fp16 se pueden clasificar lotes de 64 páginas JPEG por iteración, adecuado para preprocesar colecciones completas antes del OCR.

## Benchmarks y rendimiento

| Conjunto de prueba | Resultado |
|---|---|
| 2.165 páginas BHL con transcripciones de referencia: `no_text` a umbral 0,5 | Conserva el 0,999 de páginas con texto (1.736/1.737) y elimina el 0,994 de páginas vacías |
| 2.165 páginas BHL: AUROC de `no_text` (texto frente a vacías) | 1,000 |
| 2.165 páginas BHL: páginas con 1–79 caracteres (mayoritariamente láminas con pies de foto) | Conservadas como texto; eliminadas el 0,047 |
| 250 páginas difíciles etiquetadas a mano: AUROC de `no_text` | 0,970 (ronda 1) y 0,935 (ronda 2) |
| 2.086 páginas de 133 libros no usados en entrenamiento, frente a salidas reales de LightOnOCR-3-0.8B: AUROC `lo_blank_write` | 0,941 |
| Mismas 2.086 páginas: AUROC `lo_trunc` | 0,936 |
| Mismas 2.086 páginas: AUROC `lo_loop` | 0,930 |

Umbrales sugeridos para `no_text` sobre las 250 páginas difíciles etiquetadas a mano:

| Puntuación | Decisión | Resultado observado |
|---|---|---|
| > 0,8 | Sin texto: omitir o marcar la salida OCR como inventada | 67/67 en blanco, 83/90 con transparencia, 1/54 con texto |
| 0,2 – 0,8 | Inseguro: enrutar o revisar | Mezcla: 5 tenues, 5 con transparencia, 4 con texto, 3 con sello, 1 con imagen |
| < 0,2 | Con texto: aplicar OCR con normalidad | 49/54 con texto |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 2,5 millones de parámetros el modelo ocupa unos pocos megabytes en fp32 y menos aún en fp16.
- GPU recomendadas: cualquier GPU con soporte CUDA; el ejemplo del autor usa fp16 y DALI en una GPU genérica. No se especifican modelos concretos.
- Cabe en cualquier GPU de consumo, incluidas GTX/RTX de gama baja, e incluso en CPU.
- Despliegue: librería `timm` con `timm.create_model` y pesos desde el Hub; soporte de inferencia por lotes en GPU mediante NVIDIA DALI (decodificación JPEG en GPU).
- Throughput: aproximadamente 50 páginas por segundo en un solo hilo de CPU; en GPU con lotes de 64 y fp16 el rendimiento no se especifica en la información disponible.
- Latencia: no disponible de forma explícita más allá del throughput en CPU indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| page-ocr-flags | 2,53 M | 384 × 384, gris | Clasificación multi-etiqueta de páginas para OCR | Apache 2.0 | Hugging Face (timm) |
| text-page-filter | no disponible | no disponible | Filtro estricto de páginas de cuerpo de texto | no disponible | Hugging Face (small-models-for-glam) |
| Kraken base models (PP-OCRv6, BLLA, Party) | no disponible | no disponible | OCR/HTR y segmentación | no disponible | Hugging Face (colección small-models-for-glam) |

La información disponible no incluye datos de rendimiento comparativo entre estos modelos; la comparación se limita a propósito y disponibilidad.

## Limitaciones y advertencias

- Entrenado mayoritariamente con libros impresos de los siglos XIX y XX de la BHL; el autor recomienda validar sobre una muestra de páginas propias antes de confiar en el modelo.
- Las páginas solo con imágenes (láminas) suelen puntuar como texto: la mayoría de las páginas etiquetadas como solo imagen obtienen puntuaciones de texto, lo que constituye un fallo conocido.
- La etiqueta `faint` es experimental y el autor indica explícitamente que no debe usarse.
- El conjunto de 250 páginas difíciles fue etiquetado por una sola persona y elegido deliberadamente, por lo que no es una muestra aleatoria; las métricas sobre él deben interpretarse con cautela.
- El modelo está diseñado específicamente para predecir fallos de LightOnOCR-3-0.8B; las etiquetas `lo_blank_write`, `lo_trunc` y `lo_loop` no son necesariamente extrapolables a otros motores OCR.
- Requiere convertir las páginas a escala de grises antes de la inferencia, ya que se entrenó con páginas en gris.
- No se dispone de información sobre sesgos demográficos, lingüísticos o culturales más allá de la limitación al material BHL.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, con las tasas indicadas en los benchmarks.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base (timm/mobilenetv4_conv_small) y de los datos de entrenamiento.
- El repositorio tiene un tamaño de 0,0 GB y solo 19 descargas en el momento de la consulta; es un modelo reciente con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/small-models-for-glam/page-ocr-flags
- Modelo complementario text-page-filter: https://huggingface.co/small-models-for-glam/text-page-filter
- LightOnOCR-3-0.8B: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Organización Small Models for GLAM: https://huggingface.co/small-models-for-glam
- Colección Kraken base models: https://huggingface.co/collections/small-models-for-glam/kraken-base-models-ocr-htr-and-segmentation
- Biodiversity Heritage Library: https://www.biodiversitylibrary.org/
- Modelo base en timm: timm/mobilenetv4_conv_small.e2400_r224_in1k (referenciado en la model card, sin URL directa en la información disponible)
