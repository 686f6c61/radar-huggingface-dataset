# Civimatica/blue-marble-flood

## Resumen

Blue Marble Flood es una familia de cinco modelos de segmentación de inundaciones y aguas superficiales para imágenes Sentinel-2, desarrollada por Civimatica. La familia abarca desde 32.000 parámetros (variante pico) hasta 13,5 millones (variante medium), y todos los modelos quedan por debajo de los 15 millones de parámetros. El modelo resuelve un problema concreto de observación de la Tierra: detectar agua e inundaciones a partir únicamente de bandas ópticas de Sentinel-2, sin depender de radar Sentinel-1, y hacerlo en hardware de borde.

La relevancia actual del modelo reside en su relación entre precisión y eficiencia. La variante nano (0,19 millones de parámetros) alcanza 91,9 mIoU en el conjunto de test oficial de Sen1Floods11 y 89,7 mIoU en el split de Bolivia retenido, igualando o superando a modelos publicados de mayor tamaño, incluidos backbones congelados de cientos de millones de parámetros. Además, todos los modelos se ejecutan completamente en int8 sobre la NPU Qualcomm Dragonwing QCS8275 del dispositivo Arduino VENTUNO Q, con latencias de entre 2,8 y 10,1 ms por tesela de 512x512.

El repositorio (0,2 GB) incluye pesos en safetensors para fine-tuning, modelos ONNX en fp32 e int8, y binarios DLC compilados para la NPU QCS8275. La licencia es dual (blue-marble-dual), con un componente no comercial y otro comercial, cuyos términos concretos se detallan en el archivo LICENSE.md del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de segmentación de imágenes; arquitectura concreta no especificada en la información proporcionada) |
| Parámetros totales | 0,032M (pico), 0,19M (nano), 1,26M (tiny), 2,4M (small), 13,5M (medium) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada por teselas de 512x512 píxeles) |
| Tipos de cuantización | int8 (ONNX y DLC), fp32 (ONNX y safetensors) |
| Idiomas soportados | No aplica (modelo de segmentación de imágenes) |
| Licencia | blue-marble-dual (no comercial + comercial; ver LICENSE.md) |
| Formato de pesos | safetensors, ONNX (fp32 e int8), DLC (QNN, para NPU QCS8275) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red (tipo de backbone, mecanismos de atención o diseño del decodificador). Los datos disponibles indican que se trata de un modelo de segmentación semántica de imágenes que opera sobre teselas de 512x512 píxeles y que consume únicamente bandas de Sentinel-2, a diferencia de buena parte de la literatura, que combina Sentinel-1 y Sentinel-2. El modelo se distribuye en cinco escalas con recuentos de parámetros que van de 32.000 a 13,5 millones, y cada variante incluye un perfil de operaciones por capa para la NPU QCS8275 (entre 61 y 223 operaciones, todas ejecutadas en la NPU).

En cuanto al entrenamiento, la model card reporta evaluaciones sobre Sen1Floods11 (test oficial de 90 teselas y split de Bolivia de 15 teselas), Water-2026 (escenas Sentinel-2 propias de 2025-2026 con etiquetas de agua del JRC) y STURM-Flood (evaluado zero-shot, sin datos de STURM en entrenamiento). Los resultados de Water-2026 y STURM-Flood se presentan como media ± desviación estándar sobre 3 ejecuciones de entrenamiento, y la model card advierte que estos dos conjuntos se usaron para elegir entre recetas de entrenamiento que empataban en validación, por lo que no son conjuntos de test vírgenes. No se especifica el número de tokens ni la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de segmentación).

## Capacidades

- Segmentación semántica de inundaciones y aguas superficiales en imágenes Sentinel-2.
- Detección de agua a partir exclusivamente de bandas ópticas de Sentinel-2, sin requerir Sentinel-1.
- Inferencia cuantizada en int8 con pérdida mínima de precisión: la variante nano pasa de 91,9 mIoU en fp32 a 91,8 en int8; la pico, de 91,0 a 90,9.
- Ejecución completa en NPU: todas las operaciones de cada variante se ejecutan en la NPU QCS8275 (61/61 en pico, 75/75 en nano, 116/116 en tiny, 129/129 en small, 223/223 en medium).
- Despliegue en hardware de borde: latencias de 2,8 ms (pico), 3,4 ms (nano), 4,5 ms (tiny), 5,2 ms (small) y 10,1 ms (medium) por tesela de 512x512 en el Arduino VENTUNO Q.
- Evaluación zero-shot en STURM-Flood con entrada de 9 bandas de reflectancia superficial (las bandas no presentes se rellenan con 0), lo que indica cierta robustez a configuraciones de bandas distintas.
- Fine-tuning disponible mediante pesos safetensors y el archivo models.py del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto o audio, al tratarse de un modelo de visión.

## Casos de uso

- Monitorización operativa de inundaciones a escala regional: el modelo procesa teselas Sentinel-2 de 512x512 en pocos milisegundos en la NPU, lo que permite generar mapas de agua sobre grandes superficies con hardware de bajo consumo en lugar de depender de clústeres GPU.
- Alerta temprana en dispositivos de borde: con latencias de 2,8 a 5,2 ms por tesela en las variantes pico a small, el modelo puede integrarse en estaciones terrestres o nodos remotos que reciban imágenes satelitales y emitan avisos de inundación casi en tiempo real.
- Validación y control de calidad de productos cartográficos de agua: la alta mIoU en el split de Bolivia (89,7 con nano) lo hace adecuado para contrastar mapas de inundación existentes o etiquetas de referencia en regiones con regímenes hidrológicos distintos a los del entrenamiento.
- Seguimiento de masas de agua superficial (Water-2026): con 85,2 a 88,0 mIoU en escenas propias de 2025-2026, sirve para monitorizar la evolución estacional de lagos, embalses y ríos.
- Investigación en teledetección con recursos limitados: al publicarse pesos safetensors y un script models.py, un grupo de investigación puede hacer fine-tuning de las variantes pequeñas en una única GPU de consumo para adaptarlas a una cuenca o sensor concreto.
- Despliegue en flotas de dispositivos con NPU Qualcomm: el binario DLC compilado para QCS8275 permite distribuir el modelo tal cual en dispositivos Arduino VENTUNO Q, útil en proyectos de sensorización ambiental distribuida.
- Evaluación comparativa de modelos de segmentación: la familia cubre cinco escalas con el mismo pipeline de evaluación, lo que facilita estudios de compromiso entre precisión y coste computacional en entornos de borde.

## Benchmarks y rendimiento

Resultados de los checkpoints publicados en el repositorio, reevaluados sobre el test oficial de Sen1Floods11 (90 teselas) y el split de Bolivia (15 teselas):

| Modelo | Parámetros | Sen1Floods11 test (mIoU) | Bolivia held-out (mIoU) | Water-2026 (mIoU) | STURM-Flood (mIoU) |
|---|---:|---:|---:|---:|---:|
| Blue Marble pico | 0,032M | 91,0 | 87,7 | 86,0 ± 0,8 | 76,7 ± 0,3 |
| Blue Marble nano | 0,19M | 91,9 | 89,7 | 85,2 ± 0,9 | 77,2 ± 0,3 |
| Blue Marble tiny | 1,26M | 90,9 | 89,7 | 88,0 ± 0,7 | 77,6 ± 0,3 |
| Blue Marble small | 2,4M | 90,2 | 88,1 | 87,7 ± 0,3 | 76,4 ± 0,1 |
| Blue Marble medium | 13,5M | 91,0 | 89,2 | 87,3 ± 0,2 | 77,0 ± 0,2 |

Comparativa con modelos publicados (mismos conjuntos):

| Modelo | Parámetros | Sen1Floods11 test (mIoU) | Bolivia held-out (mIoU) | Water-2026 (mIoU) | STURM-Flood (mIoU) |
|---|---:|---:|---:|---:|---:|
| PANGAEA UNet (S1+S2) | 14,8M | 91,4 | no disponible | no disponible | no disponible |
| Segformer-B0 | 3,7M | 89,4 | 83,0 | no disponible | no disponible |
| EfficientViT-B0 | 0,7M | 87,7 | no disponible | no disponible | no disponible |
| TerraMind-Tiny, patch 4 (no publicado; S1+S2) | no disponible | 91,9 | no disponible | no disponible | no disponible |
| TerraMind-Tiny (S1+S2) | no disponible | 90,2 | no disponible | no disponible | no disponible |
| THOR-Tiny (S1+S2) | 7,6M | 90,2 | no disponible | no disponible | no disponible |
| TerraMind-v1-tiny (entrenado por Civimatica) | 6,1M | 88,4 | 88,4 | 88,2 | 77,2 |
| MobileNetV4-S (entrenado por Civimatica) | 0,41M | 90,3 | 81,9 | 69,2 | 75,9 |
| TerraMind TiM | no disponible | 91,1 | no disponible | no disponible | no disponible |
| SpectralEarth-FM-a | no disponible | 91,1 | no disponible | no disponible | no disponible |
| Prithvi-CAFE (backbone Prithvi 2.0 600M congelado) | 45,5M entrenables | 90,5 | 88,9 | no disponible | no disponible |
| Prithvi 2.0 300M + LoRA (backbone congelado) | 5,5M entrenables | 90,0 | 87,6 | no disponible | no disponible |
| U-Prithvi | no disponible | 89,7 | 87,7 | no disponible | no disponible |
| DeCUR, fine-tuning completo | 25M | 86,9 | 85,8 | no disponible | no disponible |
| TerraMind-v1-small (entrenado por Civimatica) | 22,9M | 88,0 | 88,7 | 89,5 | 77,3 |

Perfil en dispositivo (Arduino VENTUNO Q, NPU QCS8275, int8):

| Modelo | Tamaño int8 | Latencia por tesela 512x512 | Operaciones en NPU | mIoU fp32 / int8 (Sen1Floods11 test) |
|---|---:|---:|---:|---:|
| pico | 0,14 MB | 2,8 ms | 61/61 | 91,0 / 90,9 |
| nano | 0,36 MB | 3,4 ms | 75/75 | 91,9 / 91,8 |
| tiny | 1,62 MB | 4,5 ms | 116/116 | 90,9 / 90,7 |
| small | 2,86 MB | 5,2 ms | 129/129 | 90,2 / 90,1 |
| medium | 14,58 MB | 10,1 ms | 223/223 | 91,0 / 90,8 |

## Requisitos de hardware

- VRAM para inferencia: los modelos int8 ocupan entre 0,14 MB (pico) y 14,58 MB (medium) en disco; el consumo en memoria durante la inferencia no se detalla en la información disponible, pero por tamaño cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no se especifican requisitos de GPU; el modelo está optimizado para NPU Qualcomm QCS8275. Para la variante fp32 en CPU o GPU, cualquier acelerador moderno es suficiente dado el reducido número de parámetros.
- Hardware de borde validado: Arduino VENTUNO Q con NPU Qualcomm Dragonwing QCS8275, con latencias medidas de 2,8 a 10,1 ms por tesela de 512x512 en int8.
- Despliegue: ONNX Runtime para los modelos int8 y fp32, runtime QNN para el binario DLC compilado, y PyTorch para los pesos safetensors (fine-tuning con models.py).
- Throughput estimado: con 3,4 ms por tesela en la variante nano, el límite teórico es de aproximadamente 294 teselas por segundo en la NPU QCS8275; con 10,1 ms en medium, unas 99 teselas por segundo. Estas cifras son derivadas de la latencia publicada y no se han medido de forma agregada.
- No se han publicado requisitos de VRAM ni latencias para GPU (A100, H100, RTX 4090) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Sen1Floods11 test (mIoU) | Bolivia (mIoU) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Blue Marble nano | 0,19M | Teselas 512x512, Sentinel-2 | 91,9 | 89,7 | blue-marble-dual | Pesos públicos (safetensors, ONNX, DLC) |
| Segformer-B0 | 3,7M | No disponible | 89,4 | 83,0 | No disponible | Público |
| Prithvi-CAFE | 45,5M entrenables (backbone 600M congelado) | No disponible | 90,5 | 88,9 | No disponible | Público |
| TerraMind-Tiny (S1+S2) | No disponible | No disponible | 90,2 | No disponible | No disponible | Público |
| PANGAEA UNet (S1+S2) | 14,8M | No disponible | 91,4 | No disponible | No disponible | Público |

Blue Marble nano iguala el mejor resultado publicado en Sen1Floods11 (91,9, TerraMind-Tiny patch 4, no publicado y con Sentinel-1 y Sentinel-2) con dos órdenes de magnitud menos de parámetros y usando solo Sentinel-2. En el split de Bolivia supera al mejor resultado publicado de cualquier tamaño (Prithvi-CAFE, 88,9) con 89,7 mIoU.

## Limitaciones y advertencias

- Solo utiliza Sentinel-2: no aprovecha la información de radar de Sentinel-1, lo que puede degradar el rendimiento en condiciones de nubosidad persistente o en escenas nocturnas, situaciones en las que el radar aporta señal.
- Los conjuntos Water-2026 y STURM-Flood se emplearon para seleccionar recetas de entrenamiento, por lo que no son conjuntos de test vírgenes; sus resultados pueden estar optimistas respecto a un uso real en producción.
- El split de Bolivia contiene solo 15 teselas, de modo que las métricas de ese conjunto tienen alta varianza estadística.
- La arquitectura interna no está documentada en la información disponible, lo que dificulta evaluar su comportamiento fuera de los conjuntos reportados.
- No se detallan sesgos geográficos, climáticos ni de sensor más allá de lo indicado por los conjuntos de evaluación; no hay información sobre el rendimiento en regiones tropicales, áridas o con cobertura nival.
- Licencia blue-marble-dual: combina un componente no comercial y otro comercial; es imprescindible revisar LICENSE.md antes de cualquier uso en producción, ya que los términos exactos no se detallan en la model card.
- El modelo está pensado para segmentación binaria o multiclase de agua e inundación; no cubre otras clases de cobertura del suelo.
- La validación en hardware se limita a la NPU QCS8275; el rendimiento en otras plataformas (GPU, CPU, otras NPU) no está documentado.
- No se han publicado análisis de calibración, incertidumbre ni robustez frente a ruido, artefactos de nubes o cambios de resolución espacial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Civimatica/blue-marble-flood
- Página de modelos de Civimatica: https://www.civimatica.com/models
- Sitio principal de Civimatica: https://www.civimatica.com/
- Licencia del modelo: LICENSE.md en el repositorio de Hugging Face (https://huggingface.co/Civimatica/blue-marble-flood/blob/main/LICENSE.md)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos específicos del modelo.
