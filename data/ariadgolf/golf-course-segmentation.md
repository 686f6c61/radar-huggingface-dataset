# ariadgolf/golf-course-segmentation

## Resumen

Ariad Golf Course Segmentation es un modelo de segmentación semántica de seis clases diseñado para identificar elementos de campos de golf (fondo, greenes, tees, calles, búnkeres y agua) en imágenes aéreas multiespectrales de cuatro bandas (rojo, verde, azul e infrarrojo cercano). Lo desarrolla Ariad, un proyecto que publica mapas gratuitos de campos de golf y libros de distancias, y lo utiliza internamente para proponer contornos de greenes, búnkeres y calles en su atlas de campos.

Técnicamente se trata de una U-Net con codificador ResNet-34, exportada desde un checkpoint archivado en Supabase al formato nativo de Segmentation Models PyTorch y publicada en Hugging Face con pesos en FP16 Safetensors. El modelo tiene 24.459.238 parámetros, trabaja sobre teselas de 512 × 512 píxeles a 0,6 metros de resolución de suelo y produce seis logits sin normalizar por píxel.

Su relevancia es acotada pero clara: es un modelo de nicho, entrenado con 4.665 teselas de 790 campos, que demuestra un pipeline completo de teledetección aplicada a un dominio vertical concreto. No es un modelo de propósito general ni compite con segmentadores genéricos; su valor está en la especialización y en la documentación honesta de sus métricas, incluida la distinción entre acuerdos con OpenStreetMap y precisión realmente medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con codificador ResNet-34 |
| Parametros totales | 24.459.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 512 × 512 píxeles × 4 bandas) |
| Tipos de cuantizacion | no disponible (pesos almacenados en FP16; se convierten a FP32 para inferencia en CPU) |
| Idiomas soportados | en (etiquetas y documentación en inglés; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con codificador ResNet-34, implementada mediante la librería Segmentation Models PyTorch. La entrada son cuatro bandas en orden rojo, verde, azul e infrarrojo cercano, con valores uint8 de 0 a 255, teselas de 512 × 512 píxeles y una resolución de 0,6 metros de suelo por píxel. La salida son seis logits sin normalizar por píxel, correspondientes a las clases fondo, green, tee, calle, búnker y agua. La normalización es específica del modelo: `(píxel - media) / desviación`, con medias `[108.314, 118.389, 97.68, 158.925]` y desviaciones `[42.693, 38.205, 33.022, 51.632]`; no debe dividirse por 255 ni sustituirse por la normalización estándar de ImageNet.

El entrenamiento utilizó 4.665 teselas procedentes de 790 campos y 573 teselas de validación. La ejecución corresponde a la versión v4, con 14 épocas programadas, de las cuales se seleccionó el checkpoint de la época 13 (indexada desde uno). No se documentan en la información disponible detalles sobre la composición exacta del dataset, el uso de RLHF/DPO (no aplicable a un modelo de segmentación) ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor indica que el repositorio contiene el modelo y las utilidades de inferencia, pero no las imágenes ni el dataset de entrenamiento.

## Capacidades

- Segmentación semántica por píxel en seis clases sobre imágenes aéreas de cuatro bandas (RGB + infrarrojo cercano).
- Detección de contornos de greenes con especial fiabilidad: es la clase con mejor rendimiento declarado.
- Detección de tees, calles y búnkeres con calidad intermedia.
- Detección de agua con fiabilidad muy baja (IoU de validación de 0,034), por lo que no es apta para esa clase en producción.
- Inferencia con test-time augmentation (TTA) por defecto en la CLI incluida, promediando las probabilidades de identidad, volteo horizontal y volteo vertical.
- Preservación de la georreferenciación de entrada y escritura de un ráster de clases de una banda con valor nodata 255.
- Soporte de ejecución en CPU, GPU CUDA y Apple MPS mediante el flag `--device`.
- Carga directa desde el Hub con `smp.from_pretrained`, sin necesidad de `trust_remote_code`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni ninguna modalidad distinta de la imagen.

## Casos de uso

- Cartografía automática de campos de golf: el modelo genera máscaras de clases que, tras polygonización, permiten proponer contornos de greenes, búnkeres y calles para atlas y libros de distancias, que es exactamente el uso que le da el autor en su atlas de campos.
- Actualización de bases de datos geoespaciales: a partir de ortofotos NAIP o similares a 0,6 m, se pueden detectar greenes nuevos o modificados y compararlos con referencias existentes como OpenStreetMap para priorizar revisiones manuales.
- Control de calidad de inventarios existentes: la comparación entre las máscaras predichas y las geometrías de OSM permite señalar discrepancias y dirigir la revisión humana hacia las zonas con mayor desacuerdo.
- Planificación de mantenimiento de campos: la segmentación de calles, búnkeres y greenes sirve para calcular superficies por clase y estimar necesidades de riego, siega o arena en cada hoyo.
- Análisis de cambios multitemporales: aplicando el modelo a imágenes de distintas fechas se pueden detectar ampliaciones de greenes, nuevos búnkeres o cambios en masas de agua, aunque la clase agua no es fiable y requeriría validación adicional.
- Filtrado de candidatos en grandes extensiones: con 0,14 candidatos a green por km² en teselas negativas según la evaluación histórica, el modelo es útil como primera etapa para descartar zonas sin campo de golf antes de un análisis más costoso.
- Generación de datos de entrenamiento para otros modelos: las máscaras propuestas, una vez revisadas, pueden servir como pseudoetiquetas para afinar detectores más específicos, como el detector de tees del mismo autor.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint original v4 y no a una reevaluación del modelo exportado en FP16. La mayoría de las referencias son contornos de OpenStreetMap, por lo que miden acuerdo con OSM, no precisión topográfica.

| Evaluación de greenes (objeto) | Campos | Greenes de referencia | Recall a IoU ≥ 0,5 | Precisión a IoU ≥ 0,5 | IoU medio |
|---|---:|---:|---:|---:|---:|
| Campos retenidos emparejados | 99 | 1.552 | 88,27% | 79,24% | 0,7283 |
| Estados retenidos | 40 | 805 | 90,31% | 83,47% | 0,7616 |
| Validación OSM | 27 | 528 | 87,88% | 86,41% | 0,7303 |

| Reevaluación noviembre 2026 | Valor |
|---|---|
| Conjunto | 60 campos en AZ, CO, GA, IA y OR, nunca vistos en entrenamiento |
| Greenes de referencia | 1.181 (OpenStreetMap) |
| Recall a IoU ≥ 0,5 | 84,5% |
| Precisión a IoU ≥ 0,5 | 80,4% |
| Recall a IoU ≥ 0,25 | 86,2% |
| IoU medio de greenes emparejados | 0,82 |
| Sitios sin campo con candidatos a green | 0 de 133 |

| IoU de píxel en validación (checkpoint seleccionado) | Valor |
|---|---|
| Green | 0,693 |
| Tee | 0,331 |
| Calle | 0,636 |
| Búnker | 0,563 |
| Agua | 0,034 |

En 148 teselas negativas, el pipeline original devolvió dos candidatos a green, equivalentes a 0,14 candidatos por km². En un conjunto revisado de 175 greenes puntuables, el IoU medio del modelo fue 0,8469 frente a 0,9335 de OSM, pero 136 de esas referencias reutilizan geometría de OSM, por lo que no constituye un benchmark plenamente independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 24,46 millones de parámetros; en FP32 ocupa aproximadamente 98 MB de pesos y en FP16 unos 49 MB. Con activaciones para teselas de 512 × 512 y lotes pequeños, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una RTX 4090, A100 o H100 no aportan ventaja por capacidad, solo por velocidad. Para lotes grandes o procesamiento masivo de teselas, una GPU de datacenter acelera el throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecución en CPU: viable y verificada por el autor, que convierte los pesos a FP32 para el ejemplo de uso en CPU.
- Apple Silicon: soportado mediante `--device mps` en la CLI incluida.
- Opciones de despliegue: Segmentation Models PyTorch con integración nativa del Hub, la CLI `inference.py` del repositorio y despliegue manual con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Clases | Licencia | Contexto de uso |
|---|---|---|---|---|---|---|
| Ariad Golf Course Segmentation | U-Net + ResNet-34 | 24,46 M | 4 bandas, 512 × 512, 0,6 m | 6 (golf) | no disponible | Segmentación específica de campos de golf |
| SAM 2 (Meta) | Transformer de segmentación promptable | no disponible | RGB, resolución variable | promptable | Apache 2.0 (versión base) | Segmentación genérica; requiere prompts y no clasifica clases de golf |
| Mask2Former (Meta) | Transformer con consultas de máscara | no disponible | RGB | configurable por dataset | CC BY-NC 4.0 en algunas variantes | Segmentación semántica genérica; necesita reentrenamiento para golf |
| Detectron2 con U-Net/DeepLab | U-Net / DeepLab | variable | RGB (o multiespectral con adaptación) | configurable | Apache 2.0 | Framework genérico; no incluye pesos especializados en golf |

No se dispone de comparaciones directas publicadas entre este modelo y alternativas de segmentación de campos de golf. Las alternativas genéricas requieren reentrenamiento con datos etiquetados del dominio y, en general, no aceptan de forma nativa cuatro bandas con infrarrojo cercano sin modificaciones.

## Limitaciones y advertencias

- La clase agua es prácticamente inútil en producción: IoU de validación de 0,034 según el propio autor, que la califica de no fiable.
- La clase tee tiene un IoU de píxel bajo (0,331); para detección fiable de tees existe un modelo específico del mismo autor afinado a 0,3 m.
- Requiere imágenes de cuatro bandas con infrarrojo cercano real; las imágenes RGB ordinarias no son suficientes y no se debe usar el canal alfa como cuarta banda.
- La normalización es específica del modelo y no debe sustituirse por la de ImageNet ni dividirse por 255.
- La resolución de entrada debe ser de 0,6 m de suelo por píxel; los rásteres mayores requieren teselado con solapamiento y mezcla de probabilidades antes de la polygonización.
- Las métricas de objeto dependen de un pipeline completo de teselado, aumentación, cosido y filtrado de polígonos que el uso simple con argmax no reproduce.
- La mayoría de las referencias de evaluación son geometrías de OpenStreetMap, por lo que las puntuaciones miden acuerdo con OSM y no precisión topográfica; el conjunto revisado no es plenamente independiente.
- La reevaluación de noviembre de 2026 ofrece cifras inferiores a las de la fila de estados retenidos y es la mejor guía para campos nuevos: recall de 84,5% y precisión de 80,4% a IoU ≥ 0,5.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- El modelo solo procesa imágenes; no admite texto, tool calling, agentes ni razonamiento multi-paso.
- El repositorio no incluye el dataset de entrenamiento ni las imágenes, lo que limita la reproducibilidad y la evaluación independiente.
- Existe riesgo de alucinación en el sentido de falsos positivos en zonas sin campo de golf, aunque la evaluación histórica reporta una tasa muy baja (0,14 candidatos/km² en 148 teselas negativas).
- No se documentan sesgos geográficos más allá de que el entrenamiento cubre 790 campos cuya distribución no se detalla; la reevaluación se centró en cinco estados de EE. UU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariadgolf/golf-course-segmentation
- Modelo relacionado (detector de tees): https://huggingface.co/ariadgolf/golf-tee-box-detector
- Atlas de campos de Ariad: https://www.ariad.golf/courses
- Librería Segmentation Models PyTorch: no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
