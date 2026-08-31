# needle-tools/LiTo-webgpu

## Resumen

LiTo-webgpu es un conjunto de pesos cuantizados derivados del modelo LiTo de Apple, adaptados para ejecutar inferencia de imagen a 3D directamente en el navegador mediante WebGPU. La publicación corre a cargo de needle-tools, una organización en Hugging Face especializada en modelos optimizados para inferencia local en la web. El repositorio incluye los componentes del modelo listados en `catalog.json`, junto con archivos de licencia y atribución.

Este modelo resuelve el problema de generar representaciones 3D (mediante gaussian splatting) a partir de una imagen de entrada, sin necesidad de infraestructura de servidor, ya que toda la computación ocurre en el cliente. Su relevancia actual radica en la creciente adopción de WebGPU como estándar para cómputo acelerado en navegadores, lo que permite democratizar el acceso a modelos de generación 3D en aplicaciones web interactivas.

No se dispone de información pública sobre el tamaño exacto de parámetros, la arquitectura interna o el contexto de entrenamiento del modelo original LiTo. El repositorio pesa 1,2 GB, lo que sugiere que los pesos cuantizados son relativamente compactos para su ejecución en GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiTo, image-to-3D con gaussian splatting) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se indica "quantized derivative weights") |
| Idiomas soportados | no disponible |
| Licencia | apple-machine-learning-research-model-license-agreement |
| Formato de pesos | no disponible (probablemente safetensors o binarios WebGPU) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que es una versión cuantizada de LiTo, un modelo de Apple para generación de objetos 3D a partir de imágenes, que utiliza gaussian splatting como representación de salida. La cuantización se ha realizado específicamente para permitir la inferencia en WebGPU, lo que implica una reducción de precisión en los pesos para optimizar el uso de memoria y ancho de banda en GPUs de navegador.

No se han publicado datos sobre el dataset de entrenamiento, el número de tokens o pasos de optimización, ni sobre técnicas como RLHF o DPO. El repositorio incluye un archivo `NOTICE` que documenta la procedencia y los cambios realizados sobre los pesos originales, pero su contenido no está disponible en la información recopilada.

## Capacidades

- Generación de modelos 3D a partir de una imagen de entrada, utilizando gaussian splatting como representación.
- Inferencia completamente local en el navegador mediante WebGPU, sin necesidad de servidores externos.
- Integración con la librería `trellis-webgpu`, que proporciona las utilidades para cargar y ejecutar el modelo.
- Posibilidad de desplegar aplicaciones interactivas de visualización 3D en tiempo real.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Configuradores de productos 3D en tiendas online: el modelo puede generar una vista 3D de un producto a partir de una fotografía, permitiendo al usuario rotarlo y examinarlo desde todos los ángulos sin necesidad de un servidor de renderizado.
- Prototipado rápido en diseño industrial: los diseñadores pueden subir un boceto o imagen de referencia y obtener una malla 3D preliminar para evaluar formas y proporciones directamente en el navegador.
- Generación de assets para juegos web: los desarrolladores pueden crear objetos 3D a partir de imágenes de concepto y exportarlos para su uso en motores como three.js o Babylon.js, reduciendo el tiempo de modelado manual.
- Visualización arquitectónica: a partir de una fotografía de un edificio o espacio, el modelo puede generar una representación 3D simplificada para presentaciones interactivas en la web.
- Educación y divulgación: en entornos educativos, los estudiantes pueden convertir imágenes de objetos reales en modelos 3D para estudiar geometría o para proyectos de realidad aumentada en el navegador.
- Herramientas de diseño colaborativo: equipos distribuidos pueden compartir una imagen y generar un modelo 3D en tiempo real durante sesiones de lluvia de ideas, sin necesidad de instalar software pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de reconstrucción 3D (como Chamfer Distance o F-Score) ni comparaciones con otros modelos image-to-3D.

## Requisitos de hardware

- Al ser un modelo WebGPU, requiere un navegador compatible con WebGPU (Chrome 113+, Edge 113+, Firefox 128+ con flags, Safari 26+).
- Se necesita una GPU con soporte WebGPU; las GPUs integradas modernas (Intel Iris Xe, AMD Radeon integrada) pueden funcionar, pero se recomienda una GPU discreta para un rendimiento aceptable.
- El tamaño del repositorio es de 1,2 GB, por lo que se estima que la VRAM necesaria para la inferencia está en el rango de 1-2 GB, dependiendo de la cuantización exacta.
- No se han publicado datos de latencia ni throughput. El rendimiento dependerá de la GPU del cliente y de la resolución de la imagen de entrada.
- Opciones de despliegue: exclusivamente en navegador mediante WebGPU, usando la librería `trellis-webgpu`. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. La organización needle-tools también publica `SF3D-webgpu`, otro modelo image-to-3D para WebGPU, pero no se han proporcionado especificaciones técnicas de ninguno de los dos. Se recomienda consultar las respectivas model cards para obtener más detalles.

## Limitaciones y advertencias

- La licencia es la `apple-machine-learning-research-model-license-agreement`, que puede imponer restricciones al uso comercial. Es necesario revisar los términos completos antes de utilizarlo en productos.
- Al ser pesos cuantizados, es probable que la calidad de las reconstrucciones 3D sea inferior a la del modelo original en precisión completa.
- La dependencia de WebGPU limita la compatibilidad con navegadores antiguos o entornos sin aceleración por hardware.
- No se ha documentado el comportamiento ante imágenes de baja calidad, oclusiones o objetos complejos; el modelo puede producir artefactos o geometrías incompletas.
- No hay información sobre sesgos o riesgos de alucinación, pero al ser un modelo generativo de 3D, puede inventar geometrías no presentes en la imagen de entrada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/needle-tools/LiTo-webgpu)
- [Licencia del modelo (Apple ML Research)](https://github.com/apple/ml-lito/blob/main/LICENSE_MODEL)
- [Perfil de needle-tools en Hugging Face](https://huggingface.co/needle-tools/models)
- [Modelo relacionado: SF3D-webgpu](https://huggingface.co/needle-tools/SF3D-webgpu)
