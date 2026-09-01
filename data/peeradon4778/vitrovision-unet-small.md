# Peeradon4778/vitrovision-unet-small

## Resumen

VitroVision U-Net Small es un modelo de segmentación semántica de imágenes desarrollado por Peeradon Duangthong (Peeradon4778) para el fenotipado de plantas de cultivo de tejidos (in vitro) en botellas de vidrio. El modelo identifica y segmenta la planta dentro de la imagen, permitiendo extraer métricas proyectivas como cobertura, altura y anchura. Está diseñado como un prototipo para evaluar la madurez del cultivo (readiness) mediante umbrales ajustados con el índice de Youden.

Arquitectónicamente combina una U-Net con un encoder MobileNetV3-Small, lo que resulta en aproximadamente 3,6 millones de parámetros, un tamaño muy reducido que permite inferencia en hardware modesto. El modelo se entrenó con el dataset público `Project-AgML/greenhouse_leafy_segmentation` (1200 pares de imágenes, divididos en 1080 de entrenamiento y 120 de validación) usando una pérdida combinada de BCE y Dice, alcanzando un Dice de validación de 0,9817. Su relevancia radica en ofrecer una solución ligera y reproducible para la automatización del fenotipado en agricultura de precisión, aunque el propio autor advierte que es un prototipo y no un sistema de clasificación de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder MobileNetV3-Small (timm-mobilenetv3_small_100) |
| Parametros totales | ~3,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | th (tailandes, etiqueta del autor; el modelo procesa imagenes, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clasica con un encoder basado en MobileNetV3-Small, disponible a traves de la libreria `segmentation_models_pytorch` (smp). La U-Net consta de una ruta de contraccion (encoder) que extrae caracteristicas jerarquicas y una ruta de expansion (decoder) que reconstruye la mascara de segmentacion a resolucion completa. El encoder MobileNetV3-Small aporta eficiencia computacional gracias a sus bloques de convolucion separable y mecanismos de atencion ligera, lo que reduce el numero de parametros y el coste de inferencia.

El entrenamiento se realizo sobre el dataset `Project-AgML/greenhouse_leafy_segmentation`, compuesto por 1200 pares de imagenes y mascaras de segmentacion de plantas de hoja verde en invernadero. La particion fue de 1080 imagenes para entrenamiento y 120 para validacion. La funcion de perdida combina BCE (Binary Cross Entropy) y Dice loss, una eleccion habitual en segmentacion para equilibrar la precision por pixel con la superposicion de regiones. El Dice de validacion alcanzado fue de 0,9817. Ademas, se ajusto un umbral de "madurez" (READY_HEIGHT=0.20) mediante el indice de Youden sobre un conjunto de 98 imagenes de botellas etiquetadas, aunque el autor indica que este umbral solo discrimina de forma modesta (AUC ~0,64).

## Capacidades

- Segmentacion semantica de plantas en imagenes de cultivo de tejidos dentro de botellas de vidrio.
- Extraccion de rasgos proyectivos 2D: cobertura (proporcion de pixeles de planta), altura y anchura de la region segmentada.
- Clasificacion binaria de "madurez" (ready/no ready) basada en el umbral de altura ajustado (READY_HEIGHT=0.20).
- Inferencia ligera: al tener solo ~3,6 millones de parametros, puede ejecutarse en CPU o GPU de baja gama.
- Integracion sencilla con el ecosistema PyTorch y `segmentation_models_pytorch` (smp).
- No soporta tool calling, agentes, ni procesamiento de lenguaje natural; es exclusivamente un modelo de vision.

## Casos de uso

- Fenotipado automatizado en laboratorios de cultivo de tejidos: el modelo segmenta la planta en cada imagen de botella, permitiendo calcular metricas de crecimiento (cobertura, altura) de forma no invasiva y repetible.
- Control de calidad en produccion de plantulas: al aplicar el umbral de madurez, se puede clasificar automaticamente si una botella esta lista para el siguiente paso del proceso, reduciendo la inspeccion manual.
- Investigacion agronomica: los rasgos segmentados pueden correlacionarse con variables de crecimiento o condiciones de cultivo, facilitando estudios de fenotipo-genotipo.
- Monitorizacion temporal del crecimiento: al procesar secuencias de imagenes de la misma botella a lo largo del tiempo, se puede trazar la evolucion de la cobertura y altura, detectando anomalias o tasas de crecimiento.
- Prototipo de sistema de vision para invernaderos: aunque no esta afinado para el conjunto de botellas real, puede servir como base para un sistema de clasificacion en entornos controlados de invernadero.
- Educacion y demostracion: al ser un modelo pequeno y con licencia MIT, es util para ensenar tecnicas de segmentacion con U-Net y encoders ligeros en cursos de vision por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de vision, no de lenguaje. Los unicos datos de rendimiento disponibles en la informacion proporcionada son:

| Metrica | Valor |
|---|---|
| Dice de validacion | 0,9817 |
| AUC para clasificacion de madurez (readiness) | ~0,64 |
| Umbral de altura optimo (READY_HEIGHT) | 0,20 |

Estos valores provienen de la model card del autor. No se dispone de comparaciones con otros modelos en el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~3,6 millones de parametros, la inferencia en una imagen de resolucion moderada (por ejemplo, 512x512) requiere menos de 1 GB de VRAM en GPU. En CPU, el uso de RAM es similar, del orden de cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas modernas) es suficiente. Para entrenamiento, una GPU con 4-6 GB es adecuada.
- Cabe en GPU de consumo: si, es perfectamente ejecutable en tarjetas como RTX 3060, RTX 4060, o incluso en CPU con un rendimiento aceptable para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI + PyTorch, o exportarse a ONNX para inferencia con ONNX Runtime. Tambien es compatible con `segmentation_models_pytorch` para cargar y ejecutar directamente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una latencia de decenas de milisegundos por imagen en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de segmentacion en el mismo dataset o tarea. Como referencia arquitectonica, se puede comparar con otras U-Nets de tamano similar:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| VitroVision U-Net Small | ~3,6 M | Imagenes (sin contexto de texto) | Dice val 0,9817 | MIT |
| U-Net con ResNet-18 (tipico) | ~14 M | Imagenes | no disponible | MIT (depende de implementacion) |
| DeepLabV3 con MobileNetV3 | ~5-10 M | Imagenes | no disponible | MIT (depende de implementacion) |

La comparacion es orientativa; no hay datos de benchmarks comunes para estos modelos en el mismo problema.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset de invernadero publico y no ha sido afinado con el conjunto de 100 botellas de prueba in vitro, que se reservo exclusivamente para evaluacion. Por tanto, su rendimiento en imagenes reales de botellas puede ser inferior al Dice reportado.
- La clasificacion de madurez basada en rasgos 2D proyectados tiene una discriminacion modesta (AUC ~0,64), lo que indica que las metricas de cobertura/altura/anchura no son suficientes para una decision fiable; el autor sugiere que se necesitan enfoques 3D o multi-rasgo.
- Es un prototipo, no un sistema de clasificacion de produccion. No debe utilizarse para tomar decisiones agronomicas criticas sin validacion adicional.
- Riesgo de alucinacion: no aplica, al ser un modelo de segmentacion, pero puede producir mascaras erroneas en imagenes con condiciones de iluminacion o fondo diferentes a las del entrenamiento.
- Sesgos: el dataset de origen (greenhouse_leafy_segmentation) puede no representar la diversidad de especies, etapas de crecimiento o condiciones de cultivo de tejidos reales.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peeradon4778/vitrovision-unet-small
- Perfil del autor en Hugging Face: https://huggingface.co/Peeradon4778
- Repositorio GitHub del proyecto VitroVision: https://github.com/peeradon4778/VitroVision
- Referencia a la arquitectura U-Net (Wikipedia): https://en.wikipedia.org/wiki/U-Net
