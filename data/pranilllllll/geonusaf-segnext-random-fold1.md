# Pranilllllll/geonusaf-segNext-random-fold1

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por el usuario Pranilllllll, que clasifica el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo sin uso y agrícola. Se basa en la arquitectura SegNeXt (NeurIPS 2022), concretamente en la variante SegNeXt-T con encoder MSCAN-T y decodificador LightHamHead, y se ha entrenado con un split aleatorio de los datos, siendo este el primer fold de tres.

El modelo resuelve el problema de cartografía de cobertura terrestre a alta resolución, con una entrada de 512x512 píxeles y una resolución efectiva de 0,586 m/px. Con solo 4,23 millones de parámetros, ofrece un equilibrio entre precisión y eficiencia computacional, lo que lo hace adecuado para aplicaciones de monitorización urbana y planificación territorial. Su relevancia actual radica en la creciente demanda de modelos ligeros y de código abierto para análisis geoespacial, especialmente en regiones con datos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegNeXt-T: encoder MSCAN-T + decodificador LightHamHead |
| Parametros totales | 4,23 M |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | no disponible (modelo de vision, sin soporte de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (fichero `best.pt` con `model_state`, `arch`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegNeXt, presentada en NeurIPS 2022, que combina un encoder MSCAN (Multi-scale Convolutional Attention Network) con un decodificador ligero LightHamHead. El encoder MSCAN-T se inicializa con pesos preentrenados en ImageNet-1K (el 100% de los tensores se cargaron correctamente). El decodificador fusiona características de las etapas 1, 2 y 3 del encoder con un stride de fusión de 8. Se aplica un postprocesado NMF (Non-negative Matrix Factorization) con rango R=16, usando 6 pasos en entrenamiento y 7 en evaluación.

El entrenamiento se realizó con una resolución de entrada de 512x512 píxeles, normalización ImageNet y una resolución efectiva de 0,586 m/px. Se usaron tasas de aprendizaje de 0,0006 para el decodificador y 6e-05 para el encoder, con regularización por weight decay (0,01), drop path (0,1), suavizado de etiquetas (0,05) y media móvil exponencial (EMA) activada. El mejor epoch fue el 47, con métricas de validación de mIoU 0,5301, mF1 0,6791, OA 0,7898 y kappa 0,6643. El modelo se entrenó con un split aleatorio de los datos, siendo este el fold 1 de 3, con semilla 42.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de seis clases de uso del suelo: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Manejo de la clase de ignorancia (ignore_index=255) para píxeles no etiquetados o fuera de las clases de interés.
- Inferencia a alta resolución efectiva (0,586 m/px) con entrada de 512x512 píxeles.
- Postprocesado NMF integrado para refinar las predicciones, con rango R=16 y pasos configurables (6 en entrenamiento, 7 en evaluación).
- Soporte de pesos EMA para una mejor generalización (el fichero `best.pt` contiene los pesos EMA cuando EMA está activado).
- Arquitectura ligera con solo 4,23 M de parámetros, adecuada para despliegue en entornos con recursos limitados.

## Casos de uso

- Monitorización de crecimiento urbano: el modelo puede clasificar áreas residenciales y de suelo sin uso en imágenes satelitales, permitiendo detectar cambios en la expansión urbana del valle de Katmandú a lo largo del tiempo.
- Planificación de infraestructuras viarias: la clase "Road" permite mapear la red de carreteras, aunque su IoU de 0,4113 indica que la precisión es moderada; puede usarse como capa base para estudios de accesibilidad.
- Gestión de recursos hídricos: la clase "River" ayuda a delimitar cauces fluviales y zonas de inundación potencial, con un IoU de 0,4443, útil para alertas tempranas y ordenación del territorio.
- Conservación forestal: la clase "Forest" alcanza un IoU de 0,6529, la segunda más alta, lo que permite monitorizar la cobertura arbórea y detectar deforestación o regeneración.
- Agricultura de precisión: la clase "Agricultural" (IoU 0,4795) puede emplearse para identificar parcelas cultivadas y estimar superficies agrícolas, apoyando políticas de seguridad alimentaria.
- Evaluación de modelos de segmentación: al ser un checkpoint de un experimento con split aleatorio y fold 1 de 3, puede usarse como referencia en investigaciones comparativas de arquitecturas ligeras para teledetección.

## Benchmarks y rendimiento

Los resultados de validación del modelo, según la model card, son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5301 |
| mF1 | 0,6791 |
| OA (Overall Accuracy) | 0,7898 |
| Kappa | 0,6643 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8314 | 0,9079 |
| Road | 0,4113 | 0,5828 |
| River | 0,4443 | 0,6153 |
| Forest | 0,6529 | 0,7900 |
| UnusedLand | 0,3612 | 0,5307 |
| Agricultural | 0,4795 | 0,6482 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamaño del modelo (4,23 M de parámetros) y la entrada de 512x512, se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM, pero este dato no está confirmado.
- GPU recomendadas: no se especifican. Por su ligereza, podría ejecutarse en GPUs de consumo como RTX 3060 o superiores, así como en GPUs de datacenter como T4 o A10.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el bajo número de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (`best.pt`), por lo que puede cargarse con el script `segnext_model.py` incluido en el repositorio. No se mencionan formatos como ONNX, TensorRT o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (segmentación de uso del suelo en el valle de Katmandú) dentro de la informacion proporcionada. Como referencia arquitectónica, SegNeXt se compara en su paper original con otros modelos de segmentación como DeepLabV3+ o U-Net, pero no hay datos específicos de este checkpoint frente a alternativas.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente con datos del valle de Katmandú; su generalización a otras regiones geográficas o climas no está garantizada.
- Las clases "Road", "River" y "UnusedLand" presentan IoU bajos (0,4113, 0,4443 y 0,3612 respectivamente), lo que indica dificultades para segmentar estas categorías, posiblemente por su heterogeneidad o desequilibrio en el dataset.
- El modelo es un checkpoint de un experimento con split aleatorio y fold 1 de 3; los resultados pueden variar con otros folds o semillas.
- No se proporcionan datos sobre el dataset de entrenamiento (número de imágenes, distribución de clases, fuentes), lo que limita la reproducibilidad y la evaluación de sesgos.
- La licencia Apache-2.0 permite uso comercial, pero el código base de SegNeXt también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- No se especifican requisitos de hardware ni tiempos de inferencia, por lo que el despliegue en producción requiere pruebas adicionales.
- El modelo no soporta entrada de texto ni otros modos; es exclusivamente para segmentación de imágenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pranilllllll/geonusaf-segNext-random-fold1
- Fold 0 del mismo experimento: https://huggingface.co/Pranilllllll/geonusaf-segNext-random-fold0
- Repositorio oficial de SegNeXt (GitHub): https://github.com/visual-attention-network/segnext
- Paper de SegNeXt (PDF): https://raw.githubusercontent.com/Visual-Attention-Network/SegNeXt/main/resources/paper.pdf
- Implementación alternativa de SegNeXt en PyTorch: https://github.com/Mr-TalhaIlyas/SegNeXt
