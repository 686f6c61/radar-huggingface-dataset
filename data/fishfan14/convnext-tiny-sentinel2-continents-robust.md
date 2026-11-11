# fishfan14/convnext-tiny-sentinel2-continents-robust

## Resumen

ConvNeXt-Tiny Sentinel-2 Continents Robust es un modelo de clasificación de imágenes entrenado para predecir el continente de origen de un recorte (tile) de satélite Sentinel-2. Lo desarrolla el usuario fishfan14 y deriva de `timm/convnext_tiny.fb_in22k_ft_in1k`, un ConvNeXt-Tiny preentrenado en ImageNet-22k y afinado en ImageNet-1k. El modelo resuelve una tarea de clasificación de seis clases (Africa, Asia, Europe, North America, Oceania, South America) sobre imágenes RGB de 224x224 píxeles.

La particularidad de esta versión "robust" frente a la versión regular del mismo autor es el régimen de aumentación de datos: la mitad de las imágenes se someten a transformaciones agresivas (balance de blancos, saturación, gamma, desenfoque, ruido, reescalado) para mejorar la generalización ante imágenes que no proceden de Sentinel-2 L2A o que han pasado por procesamientos de color distintos. Con 27,8 millones de parámetros y un repositorio de 0,2 GB, es un modelo ligero pensado para inferencia rápida y despliegue sencillo.

Es relevante para quienes necesitan geolocalizar imágenes de satélite de fuentes heterogéneas (capturas de servicios de mapas, productos L1C, imágenes con posprocesado) sin depender de metadatos. Su licencia CC BY-SA 4.0 y la disponibilidad de pesos en safetensors y ONNX facilitan su integración en pipelines abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN pura con bloques tipo transformer) |
| Parametros totales | 27.824.742 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red convolucional pura que adopta decisiones de diseño propias de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU, estructura de bloques invertidos). El modelo base `timm/convnext_tiny.fb_in22k_ft_in1k` fue preentrenado en ImageNet-22k y afinado en ImageNet-1k; sobre él se realizó un ajuste fino para la tarea de seis continentes.

Los datos de entrenamiento proceden de Major TOM Core-S2L2A: 1000 tiles por continente, con cobertura nubosa inferior al 10%, escenas de verano fuera de los trópicos, sin imágenes por encima de 66° de latitud y sin Groenlandia. La etiqueta de continente se asigna según fronteras de Natural Earth (Rusia al este de 60°E se considera Asia). La partición train/val/test se hace por bloques de rejilla de 5°x5°, garantizando que las áreas de test no aparecen en entrenamiento. La innovación principal es la aumentación: el 50% de las imágenes recibe aumentación regular (rotaciones de 90°, volteos, ±10% brillo/contraste) y el otro 50% aumentación agresiva (balance de blancos ±10%, saturación 0,6-1,5x, contraste 0,7-1,4x, brillo 0,8-1,25x, gamma 0,75-1,35, más reescalado, desenfoque, nitidez y ruido aleatorios). El autor indica que aplicar aumentación agresiva solo a la mitad funcionó mejor que aplicarla a todas.

## Capacidades

- Clasificación de imágenes RGB de satélite en seis clases de continente.
- Inferencia sobre tiles completos de 224x224 sin recorte (resize bicúbico directo).
- Mayor tolerancia que la versión regular a cambios de color, nitidez y compresión JPEG moderada.
- Funciona con imágenes de productos Sentinel-2 L1C y L2A, y con capturas de servicios de mapas con procesamiento de color distinto.
- Exportación a ONNX para inferencia sin PyTorch.
- No soporta tool calling, agentes, texto, visión general fuera del dominio de satélite ni razonamiento multi-paso.

## Casos de uso

- Geolocalización de imágenes de satélite sin metadatos: dado un recorte RGB de origen desconocido, el modelo estima el continente probable, útil para triaje previo en catálogos de imágenes.
- Normalización de capturas de servicios de mapas: las pruebas sintéticas de "colors + sharpening + crop" (71,5% de acierto) aproximan el aspecto de capturas de mapas, por lo que el modelo sirve para clasificar screenshots que no vienen de Sentinel-2 directamente.
- Filtrado de datasets de teledetección: asignar automáticamente etiqueta de continente a tiles nuevos para organizar o validar colecciones antes de un etiquetado manual.
- Procesamiento de productos L1C: con 71,2% de acierto en L1C fresco (73,8% si se normalizan media y desviación por canal a las del entrenamiento), es adecuado cuando el pipeline solo dispone de L1C.
- Control de calidad en ingesta de datos: detectar tiles cuyo continente declarado no coincide con el predicho, señalando posibles errores de metadatos o de georreferenciación.
- Prototipado rápido en entornos con recursos limitados: con 27,8 M de parámetros y exportación ONNX, se despliega en CPU o GPU modesta para demos y pruebas de concepto.
- Preetiquetado en anotación humana: generar una primera etiqueta de continente que el anotador revisa, reduciendo el tiempo de clasificación manual en lotes grandes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 677 tiles de test (accuracy 75,9%, IC bootstrap 95% 72,7%-79,2%, macro F1 0,761):

| Conjunto de test | Modelo regular | Este modelo |
|---|---|---|
| test | 78,4% | 75,9% |
| fresh L2A | 77,2% | 76,5% |
| fresh L1C | 65,5% | 71,2% |
| stronger colors | 74,2% | 76,7% |
| sharpened | 69,0% | 74,7% |
| 70% crop (~7,5 km) | 77,5% | 74,6% |
| JPEG q60 | 50,1% | 53,3% |
| colors + sharpening + crop | 67,4% | 71,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (27,8 M de parámetros, ~111 MB de pesos) más activaciones de un batch de 224x224; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella. El modelo es pequeño y el throughput vendrá limitado por el preprocesado de imágenes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: timm con PyTorch (carga vía `hf-hub:`), ONNX Runtime usando el `model.onnx` del repositorio, o cualquier servidor de inferencia que acepte ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ConvNeXt-Tiny robust) | 27,8 M | 224x224 px | 75,9% test; 71,2% L1C; 76,7% colores fuertes | CC BY-SA 4.0 | Hugging Face (safetensors, ONNX) |
| fishfan14/convnext-tiny-sentinel2-continents (regular) | no disponible (misma base ConvNeXt-Tiny) | 224x224 px | 78,4% test; 65,5% L1C; 74,2% colores fuertes | CC BY-SA 4.0 | Hugging Face |
| timm/convnext_tiny.fb_in22k_ft_in1k (base) | ~28 M | 224x224 px | ImageNet-1k (no especializado en continentes) | no disponible en la información | Hugging Face / timm |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de otras alternativas de clasificación de continentes sobre Sentinel-2.

## Limitaciones y advertencias

- Rendimiento inferior a la versión regular en tiles Sentinel-2 estándar (75,9% frente a 78,4% en test); para L2A canónico conviene usar el modelo regular.
- La compresión JPEG degrada mucho el acierto: 53,3% con calidad 60. Se recomienda usar PNG.
- Los tests de "otra fuente" son cambios sintéticos y un producto Sentinel-2 distinto (L1C), no imágenes aéreas reales; la robustez ante fuentes verdaderamente distintas no está verificada.
- El recorte al 70% del tile baja el acierto a 74,6%, por debajo del modelo regular (77,5%); el modelo espera el tile completo.
- Riesgo de confusión entre continentes limítrofes o en zonas de transición; el etiquetado por fronteras de Natural Earth implica decisiones arbitrarias (Rusia al este de 60°E como Asia, exclusión de Groenlandia y latitudes superiores a 66°).
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a compartir obras derivadas bajo la misma licencia y a atribuir; contiene datos Copernicus Sentinel modificados.
- No se documentan sesgos demográficos (no aplica), pero sí un sesgo geográfico claro en los datos: escenas de verano, sin trópicos ni latitudes altas, lo que limita la generalización a esas regiones.
- No se han publicado datos de calibración de probabilidades ni de rendimiento en producción; las cifras provienen de un test de 677 tiles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishfan14/convnext-tiny-sentinel2-continents-robust
- Versión regular: https://huggingface.co/fishfan14/convnext-tiny-sentinel2-continents
- Modelo base: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
- Dataset de entrenamiento (Major TOM Core-S2L2A): https://huggingface.co/datasets/Major-TOM/Core-S2L2A
- Dataset del autor: https://huggingface.co/datasets/fishfan14/sentinel2-continents
