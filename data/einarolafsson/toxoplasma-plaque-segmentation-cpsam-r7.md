# einarolafsson/toxoplasma-plaque-segmentation-cpsam-r7

## Resumen

Toxoplasma Plaque v5 (pesos `cpsam_plaque_r7`) es un modelo de segmentación de imágenes especializado en la detección y delineado de placas de *Toxoplasma gondii* en ensayos de placa teñidos con violeta cristal. Lo desarrolla el mantenedor del proyecto spaCR (Einar Olafsson) como un ajuste fino del modelo genérico de segmentación celular Cellpose-SAM (`cpsam_v2`), y se publica como modelo por defecto del zoo de spaCR desde el 17 de octubre de 2026.

El problema que resuelve es acotado pero muy concreto: en un ensayo de placa, el número y el área de las placas son la medida indirecta de la viabilidad del parásito, y contarlas a mano es lento y dependiente del operador. Este modelo convierte esa tarea en una inferencia de segmentación reproducible sobre imágenes de pocillos teñidos, con 1.201 campos de entrenamiento curados y un conjunto de test de 153 campos con 6.540 placas que el autor declara nunca usado para entrenamiento ni para selección de checkpoint.

Es relevante ahora porque sustituye a las versiones anteriores (`toxoplasma_plaque_v3` y `v4`) como opción por defecto en spaCR, y porque el autor documenta explícitamente el compromiso: v5 es el modelo por defecto, pero para pocillos de Gel Doc recomienda v3 (F1 de objeto 0,954 frente a 0,868 de v5 en los pocillos de test de Gel Doc). Es decir, la elección de versión depende del dominio de imagen, no del número de versión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM, ajuste fino del checkpoint `cpsam_v2`; detalles de capas y backbone no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible en el card |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible en la información proporcionada (repositorio de 1,2 GB) |
| Tarea (pipeline) | image-segmentation |
| Dominio de entrada | Micrografías de pocillos de ensayo de placa teñidos con violeta cristal |
| Objeto segmentado | Placas de *Toxoplasma gondii* |
| Modelo base | `cpsam_v2` (mouseland/cellpose-sam) |
| Clave en el zoo de spaCR | `toxoplasma_plaque_v5` (ronda de entrenamiento 7) |
| Fecha de entrenamiento | 2026-10-16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Cellpose-SAM (`cpsam_v2`), la variante de Cellpose con backbone de tipo SAM orientada a segmentación de objetos en microscopía. El card no detalla el número de parámetros, la configuración del backbone ni la resolución de entrada; solo indica el punto de partida y el procedimiento de ajuste. El entrenamiento se prolongó durante 100 épocas, y se publica el checkpoint final de la época 100: el autor aplica la regla de que un checkpoint anterior solo lo reemplaza si mejora en todas las métricas en todos los dominios, de modo que el peso publicado es el último y no un "mejor checkpoint" seleccionado sobre validación.

Los datos de entrenamiento son 1.201 campos curados procedentes de placas de laboratorio procesadas en Gel Doc, placas de laboratorio estándar, figuras de publicaciones y rondas de curación anteriores, correspondientes al dataset `toxoplasma-plaque-curated-2026-10-15` (revisión `91d4f1cd`), con 153 campos reservados para validación. El conjunto de test son otros 153 campos con 6.540 placas, no usados ni en entrenamiento ni en selección de checkpoint. El autor añade una comparación adicional con v3 y v4 sobre los 81 campos que ninguna de esas versiones había visto, con intervalos bootstrap del 95 %, en el fichero `qc/scorecard_vs_v3_v4_stock.json`. No se documentan en el texto detalles sobre función de pérdida, aumentos de datos, resolución de parcheo ni uso de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Segmentación de instancias de placas individuales en pocillos teñidos con violeta cristal, devolviendo máscaras por objeto que permiten contar placas y medir áreas.
- Generalización a varias fuentes de imagen: placas de laboratorio, capturas de Gel Doc, figuras publicadas y material de rondas de curación previas.
- Integración nativa en el pipeline spaCR: el modelo se descarga y se verifica automáticamente al seleccionar `plaque_model = toxoplasma_plaque_v5`.
- Suministro de las máscaras que spaCR usa para las métricas aguas abajo (recuento, área, comparación entre condiciones).
- Sin capacidades de texto, código, matemáticas, tool calling, agentes, audio o razonamiento multi-paso: es exclusivamente un modelo de visión para segmentación.
- Sin capacidades multilingües (no gestiona lenguaje natural; las etiquetas del pipeline son responsabilidad de spaCR).

## Casos de uso

- Cribado de fármacos anti-*Toxoplasma*: procesar en lote los pocillos teñidos de una placa multi-pocillo y obtener el recuento y el área de placas por condición, lo que permite calcular el efecto de cada compuesto sobre la formación de placas sin conteo manual.
- Curvas dosis-respuesta: automatizar la lectura de series completas de diluciones, manteniendo el criterio de segmentación constante entre pocillos y reducir la varianza inter-operador.
- Análisis retrospectivo de experimentos: reprocesar imágenes de placas archivadas con un modelo por defecto estable, de modo que los resultados históricos sean comparables con los nuevos.
- Despliegue en un pipeline de laboratorio con spaCR: fijar `plaque_model = toxoplasma_plaque_v5` y dejar que la herramienta gestione la descarga y verificación de los pesos, integrando la segmentación en un flujo reproducible de análisis.
- Control de calidad de adquisición: usar las diferencias entre el modelo por defecto y `toxoplasma_plaque_v3` sobre los mismos campos como señal de que el lote se capturó en un dominio distinto (por ejemplo, Gel Doc) y requiere revisión.
- Análisis de imágenes de publicaciones: segmentar figuras de artículos para reutilizar datos publicados, uno de los dominios presentes en el conjunto de entrenamiento.
- Formación y transferencia de criterio: comparar las máscaras del modelo con el conteo de un investigador novel para calibrar el criterio de recuento de placas en el laboratorio.

## Benchmarks y rendimiento

El card incluye un scorecard completo contra el modelo stock y contra v3 y v4, pero los resultados están en imágenes (`cards/page1.png`, `cards/page2.png`, `cards/page3.png`) y en `qc/scorecard_vs_v3_v4_stock.json`, no como cifras en el texto. Los únicos valores numéricos publicados en texto son los de los pocillos de test de Gel Doc:

| Modelo | Conjunto de evaluación | Metrica | Valor |
|---|---|---|---|
| toxoplasma_plaque_v5 | Pocillos de test de Gel Doc | F1 de objeto | 0,868 |
| toxoplasma_plaque_v3 | Pocillos de test de Gel Doc | F1 de objeto | 0,954 |
| toxoplasma_plaque_v5 | Test completo (153 campos, 6.540 placas) | Métricas del scorecard | no disponibles como cifras en el texto; publicadas como imágenes y JSON |
| toxoplasma_plaque_v4 | Test completo y 81 campos ciegos | Métricas del scorecard | no disponibles como cifras en el texto |
| cpsam_v2 (stock) | Test completo | Métricas del scorecard | no disponibles como cifras en el texto |

No se han publicado en texto resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no es de lenguaje. Para el resto de métricas del scorecard, consultar las imágenes y el JSON citados en el repositorio.

## Requisitos de hardware

- El repositorio de pesos ocupa 1,2 GB; como estimación orientativa (no confirmada por el autor), la inferencia requeriría del orden de 2 a 4 GB de VRAM en precisión completa, más el espacio de activaciones según la resolución de imagen.
- Cabe en GPU de consumo: cualquier tarjeta con 6-8 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090) es suficiente con margen para procesar pocillos individuales o lotes pequeños.
- GPU de datacenter (A100, H100, L40S) solo justificables si se procesan lotes grandes de placas en paralelo o se necesita throughput alto en un servicio compartido.
- Ejecución en CPU viable para volúmenes pequeños, con latencia notablemente mayor; no se han publicado cifras de latencia ni throughput.
- Despliegue: la vía documentada es spaCR, que descarga y verifica los pesos; también puede cargarse como modelo Cellpose-SAM personalizado con la pila de Cellpose. No hay instrucciones publicadas para vLLM, TGI, llama.cpp ni Ollama (no aplicables a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| toxoplasma_plaque_v5 (este) | no disponible | no aplica | Placas de *Toxoplasma*, modelo por defecto en spaCR | F1 de objeto 0,868 en pocillos de test de Gel Doc | CC-BY-4.0 | Hugging Face; por defecto en el zoo de spaCR |
| toxoplasma_plaque_v3 | no disponible | no aplica | Placas de *Toxoplasma* | F1 de objeto 0,954 en pocillos de test de Gel Doc; recomendado por el autor para ese dominio | no disponible en la información | Disponible en spaCR |
| toxoplasma_plaque_v4 | no disponible | no aplica | Placas de *Toxoplasma* | Métricas en el scorecard, no publicadas como cifras en texto | no disponible en la información | Seleccionable en spaCR |
| cpsam_v2 (stock, `mouseland/cellpose-sam`) | no disponible | no aplica | Segmentación celular generalista | Base del ajuste fino; comparado en el scorecard del repositorio | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo segmenta placas de *Toxoplasma gondii* en ensayos de placa teñidos con violeta cristal; no es un segmentador celular general ni un modelo de lenguaje.
- Brecha de dominio documentada: en pocillos de Gel Doc, v5 rinde peor que v3 (0,868 frente a 0,954 de F1 de objeto), y el propio autor recomienda v3 para ese caso. No usar v5 de forma indiscriminada en todos los flujos.
- Las métricas del scorecard completo no están en el texto del card; hay que leerlas de las imágenes o del JSON, lo que dificulta la verificación rápida y la comparación automatizada.
- Riesgo de sobreajuste a las fuentes de entrenamiento (Gel Doc, placas de laboratorio y figuras publicadas): imágenes con tinción, iluminación o aumento distintos pueden degradar el recuento.
- En pocillos con placas confluentes o solapadas, la separación de instancias puede fusionar objetos; conviene revisar visualmente los pocillos con alta densidad.
- No hay información sobre sesgos ni sobre evaluación ética; al ser un modelo de microscopía, el sesgo relevante es el de los lotes de entrenamiento, no el social.
- Licencia CC-BY-4.0: permite uso comercial y modificaciones, pero exige atribución al autor y la indicación de cambios; no hay cláusula de patentes ni garantías.
- Sin datos publicados de latencia, throughput ni robustez frente a imágenes fuera de distribución; validar con un conjunto propio antes de usar el recuento en producción o en publicación.

## Enlaces

- Modelo en Hugging Face: [einarolafsson/toxoplasma-plaque-segmentation-cpsam-r7](https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-r7)
- Dataset de entrenamiento: [einarolafsson/toxoplasma-plaque-curated-2026-10-15](https://huggingface.co/datasets/einarolafsson/toxoplasma-plaque-curated-2026-10-15)
- Modelo base: [cpsam_v2 (mouseland/cellpose-sam)](https://huggingface.co/mouseland/cellpose-sam/blob/main/cpsam_v2)
- Repositorio spaCR: [github.com/EinarOlafsson/spacr](https://github.com/EinarOlafsson/spacr)
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos no guardaban relación con el modelo.
