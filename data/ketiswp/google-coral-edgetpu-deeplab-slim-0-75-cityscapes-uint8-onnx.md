# ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx

## Resumen

El modelo `ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx` es una conversión a formato ONNX con cuantización estática UINT8 del modelo de segmentación semántica DeepLab Slim 0.75, originalmente desarrollado por Google para su plataforma Coral Edge TPU. Este modelo clasifica cada píxel de una imagen en una de las 19 categorías del conjunto de datos Cityscapes, orientado a escenas de conducción urbana. Su principal utilidad es ejecutar segmentación semántica en dispositivos con recursos limitados, como las placas Coral, aunque al estar en formato ONNX también puede ejecutarse en otros entornos mediante ONNX Runtime.

El autor, ketiswp, ha publicado también una versión FP32 del mismo modelo. La versión UINT8 emplea un esquema de cuantización QDQ (Quantize-Dequantize) que permite acelerar la inferencia en hardware compatible con operaciones de enteros, como el Edge TPU. El repositorio no incluye los pesos en el momento de la consulta (tamaño 0.0 GB), por lo que el modelo está disponible como descripción y metadatos, pero no se ha subido el archivo de pesos. La fecha de creación es el 19 de agosto de 2026.

Se trata de un modelo de imagen, por lo que no tiene aplicaciones de lenguaje natural. Su relevancia actual reside en su utilidad para sistemas embebidos de visión por computador, donde la cuantización UINT8 es clave para cumplir con las restricciones de memoria y latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab v3+ (variante Slim 0.75, basada en MobileNetV2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | UINT8 estática (formato QDQ) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx, no se ha subido aun) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepLab v3+ para segmentación semántica, que combina un codificador con atrous convolutions (convoluciones dilatadas) y un decodificador que refina los límites de los objetos. La variante "Slim 0.75" se refiere a un factor de anchura de 0.75 aplicado a la red base, lo que reduce el número de canales y por tanto el coste computacional respecto al modelo completo. El backbone es una MobileNetV2, optimizada para dispositivos móviles y embebidos.

Fue entrenado originalmente sobre el conjunto de datos Cityscapes, que contiene imágenes de escenas urbanas con anotaciones a nivel de píxel para 19 clases (coches, peatones, edificios, etc.). El modelo original proviene del repositorio oficial de TensorFlow DeepLab. La versión ONNX ha sido cuantizada a UINT8 mediante cuantización estática, es decir, se calibraron los rangos de activación y pesos a partir de un conjunto de datos representativo. El formato QDQ (Quantize-Dequantize) permite que el modelo pueda ser ejecutado tanto en hardware con aceleración de enteros como en CPU mediante operaciones de punto flotante.

No se han proporcionado detalles sobre el proceso de cuantización específico (tamaño del dataset de calibración, etc.) ni sobre el entrenamiento original.

## Capacidades

- Segmentación semántica de imágenes: asigna a cada píxel una etiqueta de entre 19 clases de Cityscapes (coche, peatón, carretera, etc.).
- Inferencia en tiempo real en hardware embebido gracias a la cuantización UINT8.
- Compatible con ONNX Runtime y con plataformas que soporten operadores QDQ (por ejemplo, Edge TPU mediante conversión a TensorFlow Lite).
- No tiene capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Conducción autónoma: el modelo puede integrarse en sistemas de asistencia al conductor para identificar carriles, vehículos, peatones y otros elementos de la carretera en tiempo real. Su tamaño reducido y cuantización lo hacen adecuado para hardware embebido en el vehículo.
- Robótica móvil: un robot de reparto o de limpieza puede usar esta segmentación para navegar en entornos urbanos, distinguiendo la acera del asfalto y evitando obstáculos.
- Vigilancia urbana: en cámaras de seguridad, la segmentación permite aislar objetos relevantes (personas, vehículos) para su posterior análisis o detección.
- Análisis de tráfico: procesar imágenes de cámaras de tráfico para medir ocupación de carriles o detectar incidentes, sin necesidad de GPU de alto rendimiento.
- Prototipado rápido en investigación: al ser un modelo pequeño y en ONNX, puede probarse en entornos de desarrollo con recursos limitados, como Raspberry Pi o laptops sin GPU.
- Edge AI en dispositivos Coral: al ser la versión original de Edge TPU, puede compilarse a TensorFlow Lite y ejecutarse en la aceleradora de Google, ofreciendo una latencia muy baja para aplicaciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mIoU o precisión sobre Cityscapes para esta versión cuantizada. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- El modelo es muy ligero, con un tamaño estimado de unos pocos MB (aunque no se ha subido el archivo de pesos). La cuantización UINT8 reduce la huella de memoria en comparación con un modelo FP32.
- VRAM: no se requiere GPU dedicada; puede ejecutarse en CPU con suficiente RAM (menos de 1 GB).
- GPU recomendadas: no necesario, pero si se usa, cualquier GPU moderna con soporte ONNX Runtime vale.
- Se puede ejecutar en placas de desarrollo como Raspberry Pi, Nvidia Jetson Nano, o en el acelerador Coral Edge TPU mediante conversión a TFLite.
- Opciones de despliegue: ONNX Runtime (CPU, GPU), TensorFlow Lite (con conversión desde ONNX), Coral API (si se convierte a TFLite).
- Latencia y throughput: no disponibles. Se espera baja latencia en Edge TPU, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación semántica (p. ej., FCN, U-Net, Mask R-CNN) en términos de precisión o velocidad. El modelo se puede comparar con la versión FP32 del mismo autor, pero no se han publicado resultados. El modelo original de DeepLab v3+ MobileNetV2 0.75 (FP32) suele obtener un mIoU de alrededor de 60-70 en Cityscapes, pero no se ha confirmado para esta versión cuantizada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre Cityscapes, por lo que su rendimiento fuera de ese dominio (p. ej., escenas rurales o interiores) será muy pobre.
- La cuantización UINT8 puede degradar la precisión respecto al modelo FP32, especialmente en bordes de objetos o en condiciones de poca luz.
- No se han subido los pesos al repositorio de Hugging Face (tamaño 0.0 GB), por lo que no es posible descargar el modelo actualmente.
- No hay información sobre el proceso de calibración de la cuantización ni sobre el dataset de calibración utilizado.
- La licencia Apache-2.0 permite uso comercial, pero hay que revisar la licencia del modelo original de TensorFlow (que también es Apache-2.0) y los términos de Cityscapes (que requieren licencia para uso comercial).
- No es un modelo multimodal ni de texto; solo procesa imágenes.

## Enlaces

- [Modelo en Hugging Face (UINT8 ONNX)](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx)
- [Versión FP32 en Hugging Face](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx)
- [Repositorio original de TensorFlow DeepLab](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Plataforma Coral de Google](https://developers.google.com/coral)
- [Repositorio coral-deeplab (versión compatible con Edge TPU)](https://github.com/xadrianzetx/coral-deeplab)
- [Modelos de Coral](http://www.coral.withgoogle.com/models/all/)</think>## Resumen

El modelo es una conversión a formato ONNX con cuantización estática UINT8 del modelo de segmentación semántica DeepLab Slim 0.75, desarrollado originalmente por Google Coral para su aceleradora Edge TPU. Está diseñado para clasificar cada píxel de una imagen en una de las 19 clases del conjunto de datos Cityscapes, orientado a escenas de conducción urbana. La cuantización UINT8 en formato QDQ (Quantize-Dequantize) permite una inferencia eficiente en hardware de bajo consumo, como el Edge TPU, manteniendo un tamaño reducido y una latencia baja.

El autor, ketiswp, ha publicado también la versión FP32 del mismo modelo, aunque el repositorio actual no contiene los pesos (el tamaño del repositorio es 0.0 GB), por lo que la descarga no es posible en el momento de la consulta. El modelo está licenciado bajo Apache-2.0 y se distribuye como ONNX, compatible con ONNX Runtime y potencialmente convertible a TensorFlow Lite para su uso en dispositivos Coral. Aunque la fecha de creación se indica como 19 de agosto de 2026, no hay información adicional sobre su origen o proceso de conversión.

Al ser un modelo de visión, no tiene capacidades de procesamiento de lenguaje natural, ni tool calling ni agentes. Su relevancia actual reside en aplicaciones de segmentación semántica en tiempo real en dispositivos embebidos, donde la cuantización UINT8 es clave para cumplir restricciones de memoria y latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab v3+ (variante Slim 0.75, base MobileNetV2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | UINT8 estático (formato QDQ) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo no disponible en el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepLab v3+, que combina un codificador con convoluciones atrous (dilatadas) y un decodificador para refinar los límites de los objetos. La variante "Slim 0.75" indica un factor de anchura de 0.75 en la red base, que es una MobileNetV2, reduciendo el número de canales y el coste computacional. Este diseño está optimizado para dispositivos móviles y embebidos, y la cuantización UINT8 adicional reduce aún más el tamaño y la carga de memoria.

El modelo original fue entrenado sobre el conjunto de datos Cityscapes, que contiene imágenes de escenas urbanas con anotaciones píxel a píxel para 19 clases (coches, peatones, edificios, carretera, etc.). El proceso de cuantización estática UINT8 se aplicó sobre el modelo ya entrenado, calibrando los rangos de activación y pesos con un conjunto de datos representativo. El formato QDQ permite que el modelo se ejecute en motores de inferencia que soporten operaciones de enteros, como el Edge TPU, o en entornos de punto flotante con operadores dequantize. No se ha especificado el dataset de calibración ni el proceso de conversión detallado.

## Capacidades

- Segmentación semántica de imágenes, asignando una clase a cada píxel (19 clases de Cityscapes).
- Inferencia eficiente en hardware con aceleración de enteros, gracias a la cuantización UINT8.
- Compatible con ONNX Runtime y, mediante conversión, con TensorFlow Lite para Edge TPU.
- No incluye capacidades de generación de texto, razonamiento, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

1. Conducción autónoma: el modelo puede integrarse en sistemas de visión de vehículos para identificar carreras, vehículos, peatones y otros elementos de la carretera. La cuantización UINT8 permite ejecutarlo en hardware de bajo consumo en el vehículo, con latencia reducida.
2. Robótica móvil: un robot de reparto o de limpieza puede usar la segmentación para distinguir la acera del asfalto, evitar obstáculos y navegar de forma segura en entornos urbanos.
3. Vigilancia y seguridad: en cámaras de seguridad, la segmentación puede aislar regiones de interés (personas, vehículos) para su análisis posterior, reduciendo la carga computacional.
4. Análisis de tráfico: procesar imágenes de cámaras de tráfico para medir la ocupación de carriles, detectar incidentes o contar vehículos, sin necesidad de GPU de alto rendimiento.
5. Prototipado en dispositivos embebidos: al ser un modelo pequeño y cuantizado, puede probarse en placas como Raspberry Pi o Nvidia Jetson Nano, permitiendo validar aplicaciones de visión en el borde.
6. Edge AI en plataformas Coral: el modelo original está diseñado para Edge TPU, por lo que puede convertirse a TensorFlow Lite y ejecutarse en el acelerador de Coral, ofreciendo una inferencia de baja latencia y bajo consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión (como mIoU) ni comparaciones de velocidad para esta versión cuantizada. La versión FP32 del mismo modelo podría tener un mIoU en Cityscapes en torno a 60-70, pero no se confirma en esta fuente.

## Requisitos de hardware

- El modelo es pequeño, pero el archivo de pesos no está disponible, por lo que no se puede estimar su tamaño exacto. La cuantización UINT8 reduce la memoria en comparación con FP32, probablemente menos de 100 MB.
- No requiere GPU; puede ejecutarse en CPU con ONNX Runtime.
- GPU recomendada: no necesaria, aunque cualquier GPU moderna puede ejecutarlo.
- Compatible con plataformas de bajo consumo: Coral Edge TPU (tras conversión a TFLite), Raspberry Pi, Nvidia Jetson Nano.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorFlow Lite, Edge TPU API.
- Latencia y throughput: no especificados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de segmentación semántica (como FCN, U-Net, Mask R-CNN) en términos de precisión o rendimiento. El modelo se puede comparar con la versión FP32 del mismo autor, pero no hay datos publicados. La elección entre este modelo y otros dependerá de las necesidades de hardware y precisión, pero no hay datos suficientes para una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Cityscapes, por lo que su rendimiento en otros dominios (escenas rurales, interiores, etc.) será muy pobre.
- La cuantización UINT8 puede degradar la precisión en comparación con FP32, especialmente en bordes de objetos o condiciones de baja iluminación.
- El repositorio de Hugging Face no contiene los archivos de pesos (tamaño 0.0 GB), por lo que el modelo no es descargable actualmente.
- No se han publicado detalles sobre el proceso de calibración de la cuantización.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar la licencia de los datos de Cityscapes (que requiere licencia para uso comercial) y la licencia del modelo original de TensorFlow.
- No es un modelo de texto; no soporta lenguaje natural.

## Enlaces

- [Modelo en HuggingFace (UINT8 ONNX)](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx)
- [Versión FP32 en HuggingFace](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx)
- [Repositorio original de TensorFlow DeepLab](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Plataforma Coral de Google](https://developers.google.com/coral)
- [Repositorio coral-deeplab para Edge TPU](https://github.com/xadrianzetx/coral-deeplab)
- [Modelos Coral compilados para Edge TPU](http://www.coral.withgoogle.com/models/all/)</think>## Resumen

Modelo de segmentación semántica basado en DeepLab v3+ con backbone MobileNetV2 y factor de anchura 0.75, originalmente desarrollado por Google Coral para su acelerador Edge TPU. Esta versión concreta es una conversión a formato ONNX con cuantización estática UINT8 en esquema QDQ (Quantize-Dequantize), pensada para inferencia eficiente en dispositivos de bajo consumo. El modelo clasifica cada píxel de la imagen en una de las 19 clases del conjunto de datos Cityscapes, orientado a escenas de conducción urbana.

El autor, ketiswp, ha publicado también la versión FP32 del mismo modelo. Sin embargo, el repositorio de Hugging Face no contiene los archivos de pesos (tamaño 0.0 GB), por lo que el modelo no es descargable en el momento de la consulta. La licencia es Apache-2.0, y el formato de pesos es ONNX. Al ser un modelo de visión, no tiene capacidades de lenguaje natural ni tool calling.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLab v3+ (variante Slim 0.75, base MobileNetV2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | UINT8 estático (formato QDQ) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo no disponible en el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en DeepLab v3+, una arquitectura de segmentación semántica que utiliza convoluciones atrosadas (diladas) en el codificador y un decodificador que refina los bordes de los objetos. La variante "Slim 0.75" se refiere a un factor de anchura de 0.75 en la red base, que es una MobileNetV2. Esta reducción de canales disminuye el coste computacional, haciendo el modelo adecuado para hardware embebido. El entrenamiento original se realizó sobre el conjunto de datos Cityscapes, con anotaciones píxel a píxel para 19 clases urbanas.

La conversión a ONNX incluye cuantización estática UINT8, que calibra los rangos de activación y pesos con un conjunto de datos representativo. El formato QDQ permite ejecutar el modelo en motores que soporten operaciones de enteros, como el Edge TPU, o en entornos de punto flotante mediante operadores dequantización. No se han proporcionado detalles sobre el proceso de calibración ni sobre el dataset de calibración utilizado.

## Capacidades

- Segmentación semántica de imágenes urbanas, asignando una clase a cada píxel (19 clases de Cityscapes).
- Inferencia eficiente en hardware de bajo consumo gracias a la cuantización UINT8.
- Compatible con ONNX Runtime y potencialmente con TensorFlow Lite para Edge TPU.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

1. **Conducción autónoma**: el modelo puede integrarse en sistemas de visión de vehículos para detectar carreras, vehículos, peatones y otros elementos de la carretera. Su cuantización UINT8 permite ejecutarlo en hardware de bajo consumo en el vehículo, con latencia reducida.
2. **Robótica móvil**: un robot de reparto o limpieza puede usar la segmentación para distinguir la acera del asfalto, evitar obstáculos y navegar de forma segura en entornos urbanos.
3. **Vigilancia y seguridad**: en cámaras de seguridad, la segmentación puede aislar regiones de personas o vehículos para su análisis posterior, reduciendo la carga computacional en comparación con procesar toda la imagen.
4. **Análisis de tráfico**: procesar imágenes de cámaras de tráfico para medir la ocupación de carriles, detectar incidentes o contar vehículos, sin necesidad de GPU de alto rendimiento.
5. **Prototipado en dispositivos embebidos**: al ser un modelo pequeño y cuantizado, puede ejecutarse en placas como Raspberry Pi o Nvidia Jetson Nano, permitiendo validar aplicaciones de visión en el borde antes de desplegar en producción.
6. **Edge AI con Coral**: al estar originalmente diseñado para Edge TPU, puede convertirse a TensorFlow Lite y ejecutarse en el acelerador de Coral, ofreciendo inferencia de baja latencia y bajo consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión (como mIoU) ni de rendimiento para esta versión cuantizada. La versión FP32 del mismo modelo podría tener un mIoU en Cityscapes en torno a 60-70, pero no se confirma en esta fuente.

## Requisitos de hardware

- El archivo de pesos no está disponible, por lo que no se puede estimar el tamaño exacto. La cuantización UINT8 reduce la memoria en comparación con FP32, probablemente en el rango de 1-5 MB.
- No requiere GPU; puede ejecutarse en CPU con ONNX Runtime.
- GPU recomendada: no necesaria, pero cualquier GPU moderna puede ejecutarlo.
- Compatible con dispositivos de bajo consumo: Edge TPU (tras conversión a TFLite), Raspberry Pi, Jetson Nano.
- Opciones de despliegue: ONNX Runtime, TensorFlow Lite (con conversión), Edge TPU API.
- Latencia y throughput: no especificados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de segmentación semántica como FCN, U-Net o Mask R-CNN, ni con la versión FP32 del mismo autor, ya que no hay datos publicados. La elección entre este modelo y otros dependerá de las restricciones de hardware y de precisión, pero no hay datos suficientes para una comparación objetiva.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en Cityscapes, por lo que su rendimiento en otros dominios (rural, interior, etc.) será muy pobre.
- La cuantización UINT8 puede degradar la precisión, especialmente en bordes de objetos y condiciones de baja iluminación.
- El repositorio de Hugging Face no contiene los archivos de pesos (tamaño 0.0 GB), por lo que el modelo no es descargable actualmente.
- No se han especificado detalles sobre el proceso de calibración de la cuantización.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar la licencia del dataset Cityscapes (que requiere licencia para uso comercial) y la del modelo original de TensorFlow.
- No es un modelo de texto; no soporta lenguaje natural.

## Enlaces

- [Modelo en HuggingFace (UINT8 ONNX)](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-uint8-onnx)
- [Versión FP32 en HuggingFace](https://huggingface.co/ketiswp/google-coral-EdgeTPU-DeepLab-Slim-0.75-Cityscapes-fp32-onnx)
- [Repositorio original de TensorFlow DeepLab](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Plataforma Coral de Google](https://developers.google.com/coral)
- [Repositorio coral-deeplab para Edge TPU](https://github.com/xadrianzetx/coral-deeplab)
- [Modelos Coral de Edge TPU](https://coral.withgoogle.com/models/all/)
