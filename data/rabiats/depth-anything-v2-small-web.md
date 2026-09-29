# RabiatS/depth-anything-v2-small-web

## Resumen

RabiatS/depth-anything-v2-small-web es una redistribucion del modelo Depth Anything V2 en su variante Small, publicada en formato ONNX y preparada para ejecutarse en el navegador con transformers.js. No es un modelo nuevo ni un ajuste fino: el autor copia los ficheros ONNX del repositorio onnx-community/depth-anything-v2-small en un commit concreto y recorta el contenido a los ficheros que carga su demostracion web, de modo que la pagina no dependa de un repositorio de terceros que pueda cambiar o desaparecer.

El modelo resuelve la tarea de estimacion de profundidad monoculo: a partir de una unica imagen RGB genera un mapa denso en el que cada pixel recibe un valor relativo de distancia a la camara. La variante Small procede del proyecto Depth Anything V2, desarrollado por Lihe Yang y su equipo (Universidad de Hong Kong y TikTok), cuyo modelo base figura como depth-anything/Depth-Anything-V2-Small-hf. Los pesos no han sido modificados respecto al modelo original.

Su relevancia practica es doble. Por un lado, permite ejecutar estimacion de profundidad de calidad directamente en el cliente, sin enviar imagenes a un servidor, lo que resulta util en escenarios con requisitos de privacidad o con coste de inferencia cero en backend. Por otro, sirve como ejemplo de empaquetado ONNX + transformers.js listo para produccion web. El repositorio ocupa 0,1 GB, esta publicado bajo licencia Apache 2.0 y no incluye datos de entrenamiento, evaluacion propia ni mantenimiento declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT) con decodificador denso de prediccion por pixel; variante Small del proyecto Depth Anything V2. El repo no documenta la arquitectura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponibles; el repo contiene un subconjunto recortado de los ficheros ONNX de onnx-community/depth-anything-v2-small, limitado a los que carga la demo web |
| Idiomas soportados | no aplica / no disponible (modelo de vision; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no aporta arquitectura, entrenamiento ni innovaciones propias: es una copia byte a byte de los pesos del modelo base, sin reentrenamiento, sin destilado adicional y sin ajuste fino. Los detalles arquitectonicos y de entrenamiento corresponden al proyecto Depth Anything V2 publicado por el equipo original, enlazado en la model card, y no estan documentados en este repositorio. En consecuencia, no se dispone aqui de informacion verificable sobre numero de tokens o imagenes de entrenamiento, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion.

Lo que si define este repositorio es el formato de despliegue. La conversion al formato ONNX permite ejecutar el modelo mediante transformers.js, con soporte de aceleracion WebGPU o de ejecucion en CPU mediante WASM. El autor indica explicitamente que ha conservado los pesos sin cambios y que el objetivo es la estabilidad de su pagina de demostracion, no la publicacion de una variante tecnica nueva.

## Capacidades

- Estimacion de profundidad monoculo: genera un mapa de profundidad denso (un valor por pixel) a partir de una unica imagen RGB.
- Profundidad relativa: segun el proyecto original, la salida es una profundidad relativa afín-invariante, no una distancia metrica en metros.
- Inferencia en navegador: gracias al formato ONNX y a transformers.js, el modelo puede ejecutarse en el cliente con WebGPU o WASM.
- Procesamiento local sin envio de datos: las imagenes no necesitan salir del dispositivo del usuario.
- Uso como entrada para otras tareas: el mapa de profundidad sirve para desenfoque de fondo, reconstruccion 3D, oclusion en realidad aumentada o control de generacion de imagen.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, soporte de agentes, capacidades multilingues ni modo de razonamiento. Es exclusivamente un modelo de vision para una unica tarea.

## Casos de uso

- Desenfoque de fondo en aplicaciones web: la demo integra el modelo para separar primer plano y fondo usando el mapa de profundidad, generando un efecto de retrato o bokeh sin subir la imagen a ningun servidor.
- Realidad aumentada en navegador: el mapa de profundidad permite detectar que pixeles estan delante de otros objetos y aplicar oclusion correcta al insertar elementos virtuales en una escena capturada por la camara.
- Reconstruccion 3D y generacion de mallas: el mapa de profundidad se usa como entrada para crear nubes de puntos, modelos 3D o representaciones tipo Gaussian Splatting a partir de fotografias.
- Efecto parallax 2.5D en webs: desplazando capas segun su profundidad se puede animar una imagen plana con sensacion de volumen, util en portadas y presentaciones interactivas.
- Control de generacion de imagenes: el mapa de profundidad puede alimentar tecnicas tipo ControlNet-Depth para condicionar la geometria de imagenes generadas.
- Privacidad y cumplimiento normativo: al ejecutarse en el dispositivo, evita transferir imagenes personales a un backend, lo que simplifica el cumplimiento del RGPD en productos que procesan fotografias de usuarios.
- Robotica y prototipado de bajo coste: percepcion de distancia monoculo con una sola camara RGB, sin sensores de profundidad dedicados, para navegacion basica o deteccion de obstaculos en prototipos.
- Procesamiento por lotes en fotografia: generacion de mapas de profundidad para catalogos, retoque automatico o segmentacion asistida, ejecutados en la propia maquina del usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas de evaluacion, y el autor no realiza ninguna comparacion cuantitativa con otros modelos ni con otras variantes del propio Depth Anything V2.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, lo que corresponde a un modelo de tamano reducido (la variante Small del proyecto original).
- No se dispone de mediciones de VRAM publicadas en la informacion proporcionada. Por el tamano del repo, la inferencia cabe con holgura en cualquier GPU consumer actual.
- En navegador: funciona en CPU mediante WASM y se acelera con WebGPU en navegadores compatibles (Chrome/Edge en versiones recientes).
- En servidor: cualquier GPU consumer, desde modelos de gama media en adelante, es suficiente; no requiere A100 ni H100.
- Opciones de despliegue: transformers.js (WebGPU/WASM) es el camino documentado por el autor; tambien ONNX Runtime en Python o Node, o conversion a otros formatos si se necesita integrarlo en un stack distinto.
- Latencia y throughput: no disponibles. Dependen en gran medida del backend (WASM frente a WebGPU), del hardware del cliente y de la resolucion de entrada, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Formato principal | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| RabiatS/depth-anything-v2-small-web (este repo) | Profundidad monoculo | no disponible | ONNX | Apache 2.0 | Si, via transformers.js |
| onnx-community/depth-anything-v2-small | Profundidad monoculo | no disponible | ONNX | Apache 2.0 (heredada del modelo base) | Si, via transformers.js |
| depth-anything/Depth-Anything-V2-Small-hf | Profundidad monoculo | no disponible | safetensors (PyTorch) | Apache 2.0 | No directamente, requiere conversion |
| Otras variantes de Depth Anything V2 | Profundidad monoculo | no disponible | safetensors | no disponible | no disponible |
| MiDaS / DPT y derivados | Profundidad monoculo | no disponible | no disponible | no disponible | no disponible |

La diferencia entre el primer y el segundo modelo de la tabla no es tecnica sino operativa: este repositorio contiene un subconjunto de ficheros ONNX fijado a un commit concreto, mientras que el repositorio de onnx-community mantiene el conjunto completo y puede actualizarse. Para datos de rendimiento comparado entre familias conviene consultar la documentacion del proyecto original, no incluida en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo original: es una copia recortada de ficheros ONNX de terceros. El autor no ha entrenado, validado ni modificado los pesos.
- Sin garantias de mantenimiento: el repositorio acumula 0 descargas y 0 likes y fue creado y actualizado con 14 segundos de diferencia, lo que indica una publicacion puramente instrumental para una demo propia.
- Profundidad relativa, no metrica: la salida no representa distancias absolutas en metros, por lo que no debe usarse directamente para medicion de distancias sin calibracion adicional.
- Riesgo de errores en regiones ambiguas: superficies reflectantes, cristales, cielos uniformes, texturas repetitivas o zonas con poca iluminacion suelen producir mapas de profundidad imprecisos. No se dispone de tasas de error publicadas en esta informacion.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento original ni sobre sesgos demograficos o geograficos en los datos. No se puede evaluar el comportamiento diferencial por tipo de escena o region.
- Ambito de uso restringido a vision: el modelo no procesa texto ni mantiene conversaciones, por lo que no aplica ninguna advertencia relativa a alucinacion textual, pero si la posibilidad de generar geometria plausible y erronea en zonas ambiguas.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia. Conviene verificar la licencia del proyecto original y del modelo base antes de un despliegue comercial, ya que en la familia Depth Anything V2 las condiciones pueden variar entre variantes.
- Resolucion de entrada no documentada: la model card no especifica la resolucion esperada ni las transformaciones de preprocesado, dato relevante para reproducir resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/depth-anything-v2-small-web
- Repositorio de origen de los ficheros ONNX: https://huggingface.co/onnx-community/depth-anything-v2-small
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Proyecto original Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Demostracion web del autor: https://www.rabiatsadiq.com/lab/depth-anything-v2/
- Documentacion de transformers.js: no incluida en la informacion proporcionada
- Paper de Depth Anything V2: no incluido en la informacion proporcionada
