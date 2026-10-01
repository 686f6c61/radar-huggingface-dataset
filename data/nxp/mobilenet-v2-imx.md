# nxp/mobilenet-v2-imx

## Resumen

`nxp/mobilenet-v2-imx` es un repositorio de modelo publicado por NXP Semiconductors en HuggingFace. La model card está vacía: únicamente contiene la declaración de licencia Apache 2.0. El nombre del repositorio indica que se trata de una implementación o adaptación de MobileNetV2 orientada a la familia de procesadores de aplicaciones i.MX de NXP, pero el autor no documenta la variante concreta, el dataset de entrenamiento, el formato de pesos ni los resultados obtenidos.

La relevancia de este repositorio es principalmente de integración hardware-software: NXP fabrica los SoC i.MX (con NPU integrada en modelos como i.MX 8M Plus o i.MX 93) y estos repositorios suelen servir como punto de partida para validar flujos de despliegue en el borde con las herramientas de la casa (eIQ). Al no incluir documentación, no es posible verificar si el modelo se ha reentrenado, si se ha convertido desde los pesos originales de Google o si incorpora alguna optimización específica para el hardware i.MX.

El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta y fue creado el 1 de octubre de 2026 según los metadatos de HuggingFace. Para cualquier uso en producción sería imprescindible contactar con el autor o utilizar como referencia la implementación canónica de MobileNetV2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada por el autor. Por el nombre del repositorio se infiere MobileNetV2 (CNN con convoluciones separables en profundidad y bloques residuales invertidos); la model card no lo especifica |
| Parámetros totales | No disponible. El autor no publica recuento ni variante (multiplicador de ancho, resolución de entrada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes; no hay procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |
| Tarea declarada en el Hub | No disponible (el campo `pipeline` está vacío) |
| Entrada esperada | No disponible (se presume imagen, sin confirmación del autor) |
| Resolución de entrada | No disponible |
| Tamaño del repositorio | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación en el Hub | 1 de octubre de 2026 |
| Última actualización | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura, los datos de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicó ajuste fino, destilación o cuantización. Tampoco se documenta ninguna innovación técnica específica introducida por NXP.

La única evidencia disponible es el identificador del repositorio: `mobilenet-v2-imx`. MobileNetV2, descrito en el artículo *MobileNetV2: Inverted Residuals and Linear Bottlenecks* (Sandler et al., 2018), es una red convolucional diseñada para dispositivos con recursos limitados. Su bloque principal es el residual invertido: una convolución 1x1 que expande canales, una convolución 3x3 separable en profundidad y una proyección lineal 1x1, con conexión residual cuando las dimensiones coinciden. El sufijo `imx` sugiere que los pesos están preparados para la familia i.MX de NXP, probablemente en un formato listo para la NPU del SoC, pero esto no está confirmado en la documentación y debe tratarse como una hipótesis de trabajo.

## Capacidades

- Clasificación de imágenes: es la capacidad esperada de un modelo MobileNetV2 (por ejemplo, las 1.000 clases de ImageNet), aunque el autor no especifica el conjunto de etiquetas ni el número de clases de salida.
- Extracción de características: en la implementación canónica, la salida de la penúltima capa (1.280 dimensiones en la variante 1.0/224) puede emplearse como embedding para búsqueda por similitud o clustering. No confirmado en este repositorio.
- Ajuste fino para dominios específicos: al ser una CNN pequeña, es viable reentrenarla para tareas de clasificación particulares. Requiere conocer el formato de pesos, que no se documenta.
- Actuación como backbone: en la literatura, MobileNetV2 se usa como extractor en detectores y segmentadores (SSD-Lite, DeepLabV3). No hay confirmación de que este repositorio incluya cabezas para esas tareas.
- Inferencia en el borde: es la finalidad previsible del sufijo `imx`; sin embargo, no se declaran formatos de exportación (ONNX, TFLite, TensorRT, formatos propietarios de NXP) ni métricas de latencia en NPU.
- Sin soporte de tool calling ni function calling: es un modelo de visión, no un modelo de lenguaje.
- Sin capacidades de agente ni de razonamiento multi-paso.
- Sin capacidades multilingües.
- Sin modo de razonamiento extendido, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Inspección visual automatizada en línea de producción: clasificar piezas como correctas o defectuosas a partir de imágenes de cámara, ejecutando la inferencia en la propia NPU del SoC i.MX del equipo industrial, sin enviar datos a la nube. Es adecuado por el bajo coste computacional esperado de una MobileNetV2, aunque requiere reentrenamiento con imágenes del proceso concreto.
- Control de calidad en electrónica de automoción: detección de defectos de soldadura o de montaje en placas, integrada en la misma unidad de control que gobierna la línea. El apellido `imx` encaja con el enfoque de NXP en automoción, pero la validez depende del ajuste fino.
- Puertas de acceso inteligentes y videoporteros: clasificación de presencia de personas, vehículos o paquetes en el borde, con la ventaja de no transmitir vídeo continuo fuera del dispositivo.
- Clasificación de residuos en puntos de recogida: identificar la fracción (orgánica, plástico, vidrio, papel) a partir de una fotografía tomada por el propio contenedor, con inferencia local y consumo energético bajo.
- Preprocesado y filtrado en pasarelas IoT: descartar en el dispositivo las imágenes sin interés antes de enviar únicamente las relevantes a un servidor central, reduciendo ancho de banda y coste de almacenamiento.
- Backbone para detección o segmentación embarcada: usar el modelo como extractor de características dentro de un pipeline mayor (por ejemplo, detección de peatones en un sistema de ayuda a la conducción de bajo consumo).
- Investigación en eficiencia de modelos: servir como referencia de línea base para comparar técnicas de cuantización, poda o destilación sobre hardware i.MX.
- Prototipado académico con hardware NXP: punto de partida para prácticas de despliegue en placas de evaluación i.MX 8M Plus o i.MX 93, siempre que se localice documentación adicional del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como referencia externa y no verificada en este repositorio, el artículo original de MobileNetV2 reporta en torno al 72 % de exactitud top-1 en ImageNet para la variante 1.0 con entrada de 224x224 y aproximadamente 300 millones de MACs. Estas cifras corresponden a la publicación científica, no a los pesos de `nxp/mobilenet-v2-imx`, cuyo entrenamiento y métricas se desconocen por completo.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Para una MobileNetV2 de ~3,4 M de parámetros en precisión completa, la ocupación de memoria de pesos ronda las decenas de megabytes; en cuantización de 8 bits bajaría a unos pocos megabytes. Son estimaciones derivadas del tamaño típico de la arquitectura, no datos de este repositorio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente para inferencia; para entrenamiento o ajuste fino, una GPU de gama media (RTX 3060 o superior) resulta holgada. No hay datos de despliegue publicados por NXP.
- GPU de consumo: cabe con holgura en cualquier GPU de consumo actual e incluso en aceleradores integrados. El caso de uso natural, sin embargo, es la CPU o la NPU del SoC i.MX.
- Aceleradores de borde: la NPU de 2,3 TOPS del i.MX 8M Plus, la NPU Ethos-U65 del i.MX 93, Edge TPU de Coral o la NPU de una Raspberry Pi con acelerador son candidatos plausibles dado el perfil del modelo. No confirmado por el fabricante en este repositorio.
- Opciones de despliegue: no declaradas. Por el tipo de modelo, las vías habituales serían ONNX Runtime, TensorFlow Lite, TensorRT, OpenVINO y las herramientas de NXP (eIQ, Neutron). vLLM, llama.cpp, Ollama y TGI no aplican: están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Las cifras de la siguiente tabla proceden de la literatura pública y no de este repositorio, cuyo rendimiento se desconoce. Se incluyen como referencia orientativa de la categoría.

| Modelo | Parámetros | Entrada | Top-1 ImageNet (literatura) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nxp/mobilenet-v2-imx` | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace, sin descargas ni documentación |
| MobileNetV2 (referencia original) | ~3,4 M | 224x224 | ~72 % | Apache 2.0 | TensorFlow/Keras, PyTorch, ONNX |
| MobileNetV3-Large | ~5,4 M | 224x224 | ~75,2 % | Apache 2.0 | TensorFlow/Keras, PyTorch |
| EfficientNet-B0 | ~5,3 M | 224x224 | ~77,1 % | Apache 2.0 | TensorFlow/Keras, PyTorch |
| ResNet-50 | ~25,6 M | 224x224 | ~76,1 % | Apache 2.0 (implementación) | PyTorch, TensorFlow |

## Limitaciones y advertencias

- Documentación inexistente: la model card solo contiene la licencia. No hay información sobre arquitectura, datos, variante, métricas ni formato de pesos, lo que impide evaluar el modelo con rigor.
- Imposibilidad de reproducir: sin conocer la procedencia de los pesos ni el pipeline de entrenamiento, no se puede verificar su comportamiento ni su licencia de los datos subyacentes.
- Riesgo de sesgo: cualquier clasificador de imágenes hereda los sesgos del conjunto de entrenamiento (representación desigual de clases, iluminación, demografía en tareas con personas). Al desconocerse el dataset, no se puede caracterizar este riesgo.
- Alucinación: el concepto no aplica de la misma forma que en modelos generativos, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica, es un modelo de visión sin componente de texto.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial. No obstante, conviene confirmar que los pesos y los datos de entrenamiento son compatibles con esa licencia, algo que el autor no aclara.
- Sin garantías de producción: no hay métricas de latencia, consumo ni precisión en hardware i.MX, ni versiones congeladas ni notas de compatibilidad con versiones concretas de eIQ o del BSP de NXP.
- Riesgo de obsolescencia o abandono: 0 descargas y una única actualización en la fecha de creación sugieren que el repositorio puede no recibir mantenimiento.
- Aviso sobre la fecha: los metadatos indican creación el 1 de octubre de 2026, posterior a la fecha de consulta; conviene verificar la coherencia temporal del repositorio antes de tomarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nxp/mobilenet-v2-imx
- NXP Semiconductors (sitio corporativo): https://www.nxp.com/
- Catálogo de productos de NXP: https://www.nxp.com/products:PCPRODCAT
- NXP Semiconductors en Wikipedia: https://en.wikipedia.org/wiki/NXP_Semiconductors
- NXP Semiconductors en Wikipedia (francés): https://fr.wikipedia.org/wiki/NXP_Semiconductors
- Empleo en NXP: https://weare.nxp.com/wEEwkDbxyd
- Artículo original de MobileNetV2 (referencia externa): https://arxiv.org/abs/1801.04381
- Implementación de referencia de MobileNetV2 en PyTorch: https://pytorch.org/vision/stable/models/mobilenetv2.html
