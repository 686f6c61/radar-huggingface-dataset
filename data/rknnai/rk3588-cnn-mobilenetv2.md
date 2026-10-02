# RKNNAI/RK3588-CNN-mobilenetv2

## Resumen

RK3588-CNN-mobilenetv2 es un paquete de despliegue del clasificador de imagenes MobileNetV2 convertido al formato RKNN de Rockchip para ejecutarse sobre la NPU del SoC RK3588. Lo publica el usuario RKNNAI en HuggingFace y no entrena ningun modelo nuevo: toma el MobileNetV2 distribuido en el repositorio onnx/models, lo convierte y lo cuantifica a int8 con la toolchain RKNN-Toolkit2, y empaqueta los ficheros resultantes junto a la documentacion de uso.

El repositorio contiene una unica configuracion, `mobilenetv2-224x224-w8a8-1`, con entrada de 224x224 pixeles, cuantizacion w8a8 (pesos y activaciones a 8 bits), un solo nucleo NPU y runtime RKNN v2.4.0. Esta pensado exclusivamente para el chip RK3588; no hay variantes para otras plataformas Rockchip ni pesos en FP16/FP32.

Su relevancia es practica y de despliegue: permite disponer de un backbone convolucional ligero y cuantizado, listo para inferencia sobre NPU, como referencia de rendimiento o como punto de partida para tareas de clasificacion en el borde. Es un modelo de vision no generativo, sin capacidades de texto, razonamiento ni tool calling, y la informacion publicada sobre el mismo es muy escasa (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (red convolucional con convoluciones separables en profundidad y bloques de residuo invertido con cuello de botella lineal); el repositorio solo la identifica como "CNN" |
| Parametros totales | No indicado en la informacion proporcionada; la MobileNetV2 estandar de clasificacion (ImageNet, 224x224) documentada por sus autores ronda los 3,4 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No disponible; las etiquetas de salida dependen del dataset de origen (ImageNet, en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN (runtime v2.4.0); modelo origen en el repositorio onnx/models |
| Resolucion de entrada | 224x224 |
| Nucleos NPU | 1 |
| Chips soportados | RK3588 |
| Revision de descarga | v2.4.0 |
| Tamano del repo | 0,0 GB segun HuggingFace (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-10-02 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado informacion de entrenamiento en el repositorio: no se indica numero de tokens ni de imagenes, composicion del dataset, ni si hubo ajuste fino, RLHF o DPO. Se trata de una distribucion de inferencia, no de un modelo entrenado por el autor. El modelo origen es el MobileNetV2 de onnx/models, una CNN de clasificacion de imagenes con convoluciones separables en profundidad y bloques de residuo invertido, optimizada para bajo coste computacional en dispositivos moviles. La model card no reproduce detalles adicionales de la arquitectura, por lo que cualquier dato estructural mas alla del nombre y del tipo "CNN" debe consultarse en las fuentes originales.

La innovacion tecnica de este paquete es la conversion y cuantizacion: se transforma el modelo a formato RKNN mediante RKNN-Toolkit2 y se cuantiza a int8 (w8a8) para acelerar la inferencia sobre NPU, con una configuracion fijada a un unico nucleo NPU y resolucion 224x224. El repositorio incluye un fichero SHA256SUMS por configuracion para verificar la integridad de los ficheros antes del despliegue. No se documenta el conjunto de calibracion empleado en la cuantizacion ni la perdida de precision respecto al modelo en punto flotante, datos relevantes para entornos de produccion.

## Capacidades

- Clasificacion de imagenes: genera una prediccion sobre las clases del dataset de origen (ImageNet en la version upstream de MobileNetV2), a partir de entradas RGB de 224x224.
- Extraccion de caracteristicas: puede emplearse como backbone convolucional para alimentar etapas posteriores (deteccion, segmentacion, recuperacion de imagenes) si se accede a las activaciones intermedias.
- Inferencia acelerada en NPU: ejecucion sobre la NPU del RK3588 mediante el runtime RKNN v2.4.0, con un nucleo NPU asignado en esta configuracion.
- Integracion mediante API: la toolchain RKNN ofrece API en Python (rknn-toolkit-lite2) y en C, con ejemplos dentro de rknn_model_zoo.
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (ni procesamiento de lenguaje, en general).
- No dispone de modo "thinking", ni entrada de audio, ni capacidades vision-lenguaje: la vision se limita a la clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en el borde: desplegar el modelo en un dispositivo con RK3588 para etiquetar imagenes capturadas por una camara localmente, sin enviar datos a la nube, aprovechando la cuantizacion w8a8 y la NPU.
- Control de calidad industrial: clasificar piezas o productos en una linea de fabricacion a partir de imagenes de 224x224, con inferencia en el propio equipo y latencia reducida al ejecutarse sobre NPU en lugar de CPU.
- Triaje de fotogramas en videovigilancia: descartar o etiquetar fotogramas irrelevantes antes de enviarlos a un modelo mas costoso, usando el clasificador como filtro previo de bajo coste.
- Clasificacion de residuos y reciclaje: integrar el modelo en un contenedor o punto de recogida inteligente que determine la categoria del objeto depositado a partir de una imagen.
- Vision para robotica y vehiculos no tripulados: emplear la red como modulo de reconocimiento de escena o de objetos genericos dentro de una pipeline mayor, siempre que el dominio de las imagenes se acerque al del dataset de origen.
- Extraccion de caracteristicas para busqueda de imagenes: usar las activaciones del backbone como embedding para indexar y comparar imagenes en un sistema de recuperacion sobre hardware embebido.
- Prototipado y validacion de pipelines cuantizados: servir como referencia para medir el rendimiento real de la NPU del RK3588 y comparar con otras configuraciones o modelos antes de invertir en el desarrollo de una red propia.
- Educacion y demostracion: ejemplo minimo de extremo a extremo (conversion con RKNN-Toolkit2, verificacion de hashes e inferencia con API Python o C) para aprender el flujo de despliegue en plataformas Rockchip.

Nota: todas estas aplicaciones asumen que el modelo se usa como clasificador de clases genericas; para dominios especificos (defectos de fabricacion, tipos concretos de residuo) sera necesario ajustar o reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de precision (top-1/top-5), latencia, FPS ni consumo energetico, y tampoco se documenta la perdida de precision introducida por la cuantizacion w8a8. Las fuentes upstream (onnx/models y la publicacion original de MobileNetV2) si documentan metricas para el modelo sin cuantizar, pero no forman parte de la informacion proporcionada en esta ficha.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588, usando su NPU. La configuracion incluida asigna 1 nucleo NPU; no se indica si existen variantes multinucleo.
- Runtime requerido: RKNN Runtime v2.4.0, indicado en la tabla de configuraciones de la model card.
- Herramientas de conversion y evaluacion en PC: RKNN-Toolkit2 (conversion, inferencia y evaluacion de rendimiento sobre PC antes de desplegar). Para ejecucion en el dispositivo, RKNN-Toolkit-Lite2 expone API en Python.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. A modo orientativo, un backbone de aproximadamente 3,4 millones de parametros cuantizado a 8 bits ocupa del orden de 3-4 MB en pesos, pero es una estimacion a partir de las cifras publicas de MobileNetV2, no un dato del repositorio.
- GPUs recomendadas: no aplica; el destino es una NPU integrada, no una GPU de escritorio. La conversion y la evaluacion previa pueden ejecutarse en CPU de PC.
- Compatibilidad con GPU de consumo: no aplica; no se distribuyen pesos en safetensors, GGUF ni formatos para CUDA.
- Opciones de despliegue: RKNN Runtime en el dispositivo (via API C o rknn-toolkit-lite2 en Python); ejemplos disponibles en rknn_model_zoo. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo de inferencia ni FPS para esta configuracion.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este paquete, por lo que la comparacion cuantitativa no es posible. Se ofrece una comparacion cualitativa con alternativas de la misma categoria:

| Modelo | Tarea | Cuantizacion | Chip objetivo | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| RKNNAI/RK3588-CNN-mobilenetv2 | Clasificacion de imagenes | w8a8 | RK3588 | Apache-2.0 | No disponible |
| Mobilenet (ejemplo de rknn_model_zoo) | Clasificacion de imagenes | No disponible | Familia RK35xx | No disponible en la informacion recogida | No disponible |
| Otras CNN de clasificacion ligera (por ejemplo MobileNetV3 o EfficientNet-Lite) | Clasificacion de imagenes | No disponible | Multiples, incluido RK3588 mediante conversion propia | Depende de la distribucion | No disponible |
| YOLO11n en RKNN (ejemplo de despliegue) | Deteccion de objetos | No disponible | RK3588 | No disponible en la informacion recogida | No disponible |

En todos los casos, el desarrollador deberia medir por su cuenta la precision y la latencia sobre su propio conjunto de datos antes de decidir que modelo desplegar.

## Limitaciones y advertencias

- Alcance funcional limitado: es un clasificador de imagenes, no un modelo de lenguaje. No genera texto, no mantiene conversaciones y no puede usarse para tareas de razonamiento, codigo o agentes.
- Dependencia del dataset de origen: las clases de salida dependen del modelo upstream (ImageNet). Si el caso de uso requiere categorias distintas, hay que reentrenar o ajustar.
- Precision tras la cuantizacion: la configuracion es w8a8, lo que suele implicar cierta perdida de precision frente al modelo en punto flotante. El repositorio no documenta esa perdida ni el dataset de calibracion, por lo que debe validarse en el dominio de destino.
- Sesgos: no se documentan analisis de sesgo. Al heredar el dataset de origen, el modelo puede comportarse peor en categorias infrarrepresentadas o ante imagenes de dominios alejados (iluminacion, sensores, resoluciones u orientaciones distintas).
- Riesgo de error de clasificacion: como cualquier clasificador, puede asignar etiquetas incorrectas con alta confianza, especialmente con imagenes fuera de distribucion. No debe usarse como unico criterio en decisiones criticas.
- Restriccion de plataforma: los ficheros estan compilados para RK3588 exclusivamente. No son portables a otras NPU ni ejecutables directamente en GPU o CPU de escritorio sin reconvertir el modelo original.
- Coherencia de ficheros: la model card recomienda usar ficheros de la misma configuracion y verificar `sha256sum -c SHA256SUMS` antes de desplegar. No se especifica que ocurre si se mezclan versiones de runtime.
- Trazabilidad y mantenimiento: el repositorio tiene 0 descargas y 0 likes, la fecha de creacion registrada (2026-10-02) es posterior a la fecha habitual de consulta y el tamano reportado es 0,0 GB, lo que sugiere que puede tratarse de un repositorio reciente, incompleto o con ficheros servidos por LFS. Conviene verificar el contenido real antes de depender de el.
- Licencia: Apache-2.0, que permite uso comercial, pero obliga a conservar los avisos de copyright y atribucion. El modelo deriva de onnx/models y se distribuye a traves de rknn_model_zoo; hay que respetar las condiciones de ambas fuentes.
- Idiomas: las etiquetas y la documentacion de referencia estan en ingles y chino; no hay soporte ni traduccion de categorias.
- Sin informacion de consumo energetico ni de latencia, datos clave si el despliegue es alimentado por bateria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3588-CNN-mobilenetv2
- Descarga del repositorio completo (ModelScope): https://modelscope.cn/models/RKNNAI/RK3588-CNN-mobilenetv2
- Modelo origen (ONNX Model Zoo): https://github.com/onnx/models
- Ejemplo de MobileNet en RKNN Model Zoo: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/mobilenet
- RKNN Model Zoo (repositorio principal): https://github.com/airockchip/rknn_model_zoo
- RKNN-Toolkit2 (formato de modelo RKNN, documentacion): https://deepwiki.com/airockchip/rknn-toolkit2/6-rknn-model-format
- Espejo de RKNN-Toolkit2 para RK3588: https://github.com/winson-du-ai/rknn-toolkit2_3588_npu
- Guia de despliegue de CNN en RK3588: https://sensecraft.seeed.cc/ai-lab/en/tools/rk/rk3588-cnn-rknn2-deploy
- Documentacion de MobileNet en Radxa: https://docs.radxa.com/en/rock5/rock5a/app-development/ai/mobilenet
