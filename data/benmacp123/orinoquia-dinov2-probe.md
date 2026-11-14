# benmacp123/orinoquia-dinov2-probe

## Resumen

Orinoquia-dinov2-probe es un clasificador lineal (regresión logística multinomial) que se apoya sobre embeddings congelados de DINOv2 ViT-B/14 para identificar nueve especies de mamíferos y aves en recortes de cámaras trampa de la región de la Orinoquía colombiana. Lo desarrolla el usuario benmacp123 como pieza central de su proyecto camera-trap-mlops, un trabajo centrado en decidir, sitio a sitio, si un nuevo clasificador debe sustituir al que está en producción. El modelo no es una red neuronal propia: es una cabeza de 9 x 768 pesos más un intercepto almacenada como arrays de numpy, de modo que el repositorio ocupa prácticamente 0 GB y la inferencia depende enteramente del encoder DINOv2.

Su relevancia es doble. Por un lado, ofrece un ejemplo reproducible y honesto de evaluación con partición agrupada por sitio y test fijado antes de ejecutar, algo poco habitual en clasificadores ecológicos de pequeño tamaño. Por otro lado, demuestra que una sonda lineal sobre un encoder generalista puede superar a un modelo especializado de visión-lenguaje como BioCLIP 2 en zero-shot, con una ganancia media de +0,097 en balanced accuracy por sitio sobre diez sitios no vistos.

La arquitectura subyacente es un Vision Transformer base con parches de 14 píxeles (ViT-B/14, aproximadamente 86 millones de parámetros) preentrenado con DINOv2, mientras que la cabeza añadida es un clasificador lineal de 9 clases. No hay datos publicados sobre longitud de contexto ni idiomas porque el modelo no procesa texto: es exclusivamente de clasificación de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (regresion logistica multinomial) sobre embeddings congelados de ViT-B/14 DINOv2 |
| Parametros totales | Cabeza: 9 x 768 pesos + 9 interceptos (6.921 valores); encoder base: aproximadamente 86 M (ViT-B/14) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | No disponible para la cabeza (numpy float); el encoder base admite las cuantizaciones habituales de timm/PyTorch (FP16, INT8) no documentadas en la model card |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `probe_head.npz` (arrays numpy: `coef`, `intercept`, `classes`); encoder en safetensors via timm |

## Arquitectura y entrenamiento

El encoder es `timm/vit_base_patch14_dinov2.lvd142m` (revision `4685c99dabff`), un ViT-B/14 preentrenado con DINOv2 y utilizado congelado a 224 px. Las imágenes se normalizan con la transformación estándar de timm y los embeddings resultantes se normalizan L2 antes de entrar en la cabeza. La cabeza es una regresión logística multinomial con penalización L2 y pesos de clase equilibrados; la fuerza de regularización se eligió mediante validación cruzada de 3 folds agrupada por sitio, seleccionando C = 3,16, de forma que ningún sitio aparece a la vez en entrenamiento y validación.

Los datos de entrenamiento son 20.991 recortes (hasta 3 fotogramas por secuencia) procedentes de 39 sitios de cámara del dataset Orinoquía Camera Traps. Solo se usaron secuencias etiquetadas con una única especie de las nueve y se descartó por completo cualquier secuencia en la que apareciera una persona. Los recortes corresponden a la caja de animal más confiable de MegaDetector v5a, con un 10 % de padding, cuadrada y con el lado largo limitado a 448 px. No se aplicó RLHF ni DPO: el entrenamiento es puramente supervisado sobre etiquetas de especie. La innovación metodológica destacable no está en la arquitectura, sino en el protocolo de evaluación: test fijado y hasheado antes de ejecutarse, métrica de balanced accuracy por sitio a nivel de secuencia y comparación predefinida contra BioCLIP 2 en zero-shot.

## Capacidades

- Clasificación de imagen en 9 clases cerradas: collared peccary, black agouti, spotted paca, South American coati, white-lipped peccary, southern tamandua, Spix's guan, Salvin's curassow y lowland tapir.
- Predicción a nivel de secuencia mediante el promedio de logits de los fotogramas antes de la softmax.
- Extracción de embeddings de 768 dimensiones vía DINOv2 para reutilización en otras tareas (el dataset de embeddings está publicado).
- Salida de confianza calibrada de forma aproximada, utilizada para enrutar secuencias con confianza inferior al 50 % a revisión humana.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje.
- No incluye clase "otro" ni "vacío": toda entrada recibe una de las nueve etiquetas.

## Casos de uso

- Triaje de cámaras trampa en la Orinoquía: el modelo ordena las secuencias de las nueve especies en sitios similares a los de entrenamiento y envía a revisión humana las que quedan por debajo del 50 % de confianza, reduciendo el volumen de revisión manual.
- Investigación ecológica comparativa: sirve como baseline reproducible para estudiar el efecto de cambios de encoder, aumentación o tamaño de muestra sobre la precisión por sitio, gracias a que el repositorio regenera todas las cifras desde archivos versionados.
- Validación de pipelines MLOps: el proyecto camera-trap-mlops lo usa como ejemplo de modelo que pasa una puerta de promoción basada en evidencia por sitio, útil para equipos que diseñan flujos de despliegue de clasificadores en producción.
- Monitorización de fauna en áreas protegidas: al ser un clasificador ligero (solo la cabeza es entrenable), puede desplegarse junto a un encoder DINOv2 compartido para muchas cabezas de especies o regiones, reduciendo el coste de servir varios modelos.
- Docencia y prototipado en visión ecológica: la combinación de MegaDetector v5a para detección y esta sonda para clasificación es un ejemplo mínimo y completo de pipeline de cámaras trampa que se puede reproducir en un portátil.
- Auditoría de sesgo por sitio: las métricas desagregadas por sitio (A02, N00, N14, etc.) permiten detectar dónde el modelo falla más y priorizar la recolección de datos en esas ubicaciones antes de ampliar el despliegue.

## Benchmarks y rendimiento

La model card reporta balanced accuracy media por sitio a nivel de secuencia sobre diez sitios no vistos (1.799 secuencias en total), comparando con BioCLIP 2 en zero-shot.

| Modelo | Balanced accuracy media (10 sitios) |
|---|---|
| BioCLIP 2 zero-shot | 0,836 |
| Orinoquia-dinov2-probe | 0,933 |
| Ganancia | +0,097 (IC 95 % +0,055 a +0,150, bootstrap sobre sitios) |

Resultados por sitio:

| Sitio | Secuencias | BioCLIP 2 | Este modelo | Ganancia |
|---|---|---|---|---|
| A02 | 161 | 0,650 | 0,900 | +0,250 |
| A03 | 59 | 0,808 | 0,979 | +0,172 |
| A07 | 49 | 0,860 | 0,979 | +0,119 |
| N00 | 267 | 0,875 | 0,882 | +0,007 |
| N13 | 254 | 0,875 | 0,948 | +0,072 |
| N14 | 555 | 0,902 | 0,904 | +0,002 |
| N19 | 110 | 0,831 | 0,927 | +0,097 |
| N23 | 162 | 0,896 | 0,996 | +0,100 |
| N31 | 97 | 0,890 | 0,904 | +0,013 |
| N33 | 85 | 0,773 | 0,913 | +0,140 |

Recall por especie, agrupado sobre los diez sitios:

| Especie | Secuencias | Recall |
|---|---|---|
| Collared peccary (*Pecari tajacu*) | 491 | 0,86 |
| Black agouti (*Dasyprocta fuliginosa*) | 768 | 0,94 |
| Spotted paca (*Cuniculus paca*) | 172 | 0,98 |
| South American coati (*Nasua nasua*) | 87 | 0,97 |
| White-lipped peccary (*Tayassu pecari*) | 43 | 0,88 |
| Southern tamandua (*Tamandua tetradactyla*) | 73 | 0,95 |
| Spix's guan (*Penelope jacquacu*) | 97 | 0,92 |
| Salvin's curassow (*Mitu salvini*) | 48 | 0,98 |
| Lowland tapir (*Tapirus terrestris*) | 20 | 0,90 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no es aplicable a esas tareas.

## Requisitos de hardware

- La cabeza en sí ocupa unos pocos kilobytes; el coste real está en ejecutar el encoder DINOv2 ViT-B/14.
- VRAM estimada para el encoder en FP32: en torno a 1,5-2 GB para pesos e inferencia a 224 px con batch pequeño; en FP16 aproximadamente 0,8-1 GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores, con margen amplio.
- GPUs de centro de datos recomendadas para throughput alto: A100, H100, L40S; también funciona en CPU para volúmenes moderados.
- Despliegue: el ejemplo oficial usa timm + PyTorch + numpy + huggingface_hub; también es viable exportar el encoder a ONNX o TensorRT y servir la cabeza como multiplicación matricial.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, ViT-B/14 a 224 px es un modelo ligero y adecuado para procesar lotes grandes en una sola GPU de consumo.
- El recorte de entrada debe generarse con MegaDetector v5a (caja animal más confiable, 10 % de padding, cuadrada, lado largo ≤ 448 px).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Orinoquia-dinov2-probe | Sonda lineal sobre DINOv2 ViT-B/14 | Cabeza 6.921 valores; encoder ~86 M | Imagen 224 px (recorte de detector) | Balanced accuracy 0,933 en 10 sitios | MIT | Hugging Face (repo de 0 GB + encoder timm) |
| BioCLIP 2 (zero-shot) | Modelo visión-lenguaje especializado en biología | No disponible | Imagen + nombres de especie | Balanced accuracy 0,836 en 10 sitios | No disponible en la información | Hugging Face (imageomics/bioclip-2) |
| DINOv2 ViT-B/14 (encoder base) | Vision Transformer auto-supervisado | ~86 M | Imagen 224/518 px | No es clasificador de especies por sí mismo; se usa como extractor | No disponible en la información | Hugging Face (timm) |

La comparación directa disponible se limita a BioCLIP 2 en zero-shot; no se han publicado comparaciones con otros clasificadores supervisados de cámaras trampa en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre nueve especies; no existe clase "otro" ni "vacío", por lo que cualquier recorte recibirá forzosamente una de las nueve etiquetas, incluidas especies no contempladas.
- Entrenado y evaluado en una única área de estudio (Orinoquía colombiana); no se ha probado en otras regiones ni hábitats.
- Espera recortes de un solo animal producidos por MegaDetector v5a; los animales que el detector no localice nunca llegan al clasificador.
- No debe usarse para decisiones sobre individuos concretos ni sobre personas; no se usó ninguna imagen de persona en entrenamiento ni test.
- Riesgo de alucinación en el sentido de falsos positivos sistemáticos: al ser un clasificador cerrado, asignará una especie aunque el recorte no contenga un animal válido.
- El umbral de confianza del 50 % para enrutar a revisión humana se calibró en los sitios de evaluación; puede requerir reajuste en otros sitios.
- Las especies con menos muestras (lowland tapir con 20 secuencias, white-lipped peccary con 43) tienen estimaciones de recall con mayor incertidumbre.
- Licencia MIT, que permite uso comercial; no obstante, la licencia y condiciones del encoder DINOv2 y del dataset Orinoquía Camera Traps deben verificarse por separado antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benmacp123/orinoquia-dinov2-probe
- Dataset de embeddings: https://huggingface.co/datasets/benmacp123/orinoquia-crop-embeddings
- Encoder base: https://huggingface.co/timm/vit_base_patch14_dinov2.lvd142m
- Proyecto camera-trap-mlops: https://github.com/benmacp123/camera-trap-mlops
- Dataset Orinoquía Camera Traps (LILA BC): https://lila.science/datasets/orinoquia-camera-traps/
- MegaDetector v5a: https://github.com/agentmorris/MegaDetector
- BioCLIP 2 (modelo de comparación): https://huggingface.co/imageomics/bioclip-2
