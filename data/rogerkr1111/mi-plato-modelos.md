# RogerKR1111/mi-plato-modelos

## Resumen

`RogerKR1111/mi-plato-modelos` es un repositorio de distribucion de pesos en formato ONNX pensado para ejecutar estimacion de calorias a partir de imagenes de comida directamente en el navegador mediante `onnxruntime-web`. No se trata de un modelo entrenado por el autor del repositorio, sino de un empaquetado de dos modelos de terceros: `shalev396/calorie-lens` (red de estimacion) y `jc-builds/CalorieCLIP` (modelo tipo CLIP), ambos con licencia MIT. El autor declara explicitamente que solo se distribuye la red neuronal, mientras que el reparto de gramos por alimento y el calculo nutricional se realizan en JavaScript fuera del modelo.

El repositorio ocupa 0,5 GB e incluye los ficheros `lens.onnx` y `lens_meta.json`, ademas de `clip.onnx`. Los pesos se almacenan en fp16, aunque el calculo se ejecuta en fp32. El caso de uso declarado es la aplicacion web `mi-plato-ashy.vercel.app`, que consume estos ficheros en el cliente sin necesidad de backend de inferencia.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de empaquetado ONNX orientado a inferencia en navegador para una tarea de vision aplicada (reconocimiento de alimentos y estimacion calorica), un patron util para aplicaciones de salud y nutricion que quieren evitar enviar imagenes del usuario a un servidor. No hay pipeline declarado en HuggingFace, no hay idiomas declarados, no hay resultados de evaluacion publicados y el repositorio acumula 0 descargas y 0 likes en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuyen pesos ONNX de `shalev396/calorie-lens` y `jc-builds/CalorieCLIP`; la arquitectura subyacente no se describe en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | pesos en fp16, calculo en fp32 (unico formato declarado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`lens.onnx`, `lens_meta.json`, `clip.onnx`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de las redes. Se sabe unicamente que el repositorio redistribuye pesos ONNX de dos modelos: una red de estimacion (`lens.onnx`, procedente de `shalev396/calorie-lens`) y un modelo tipo CLIP (`clip.onnx`, procedente de `jc-builds/CalorieCLIP`). No se documentan capas, tipo de backbone, resolucion de entrada, numero de parametros ni estrategia de atencion.

Tampoco hay datos sobre el entrenamiento: no se indica numero de tokens o imagenes, composicion del dataset, si hubo ajuste fino supervisado, RLHF, DPO ni ninguna innovacion tecnica. Lo unico reseñable desde el punto de vista de ingenieria es el reparto de responsabilidades: la red ONNX produce la estimacion visual y el reparto de gramos y el calculo nutricional se implementan en JavaScript en la aplicacion consumidora, de modo que la parte nutricional no es aprendida por el modelo sino calculada por reglas externas.

## Capacidades

- Reconocimiento de alimentos a partir de imagenes, segun los tags del repositorio (`food`, `nutrition`, `calorie-estimation`).
- Estimacion de calorias asociada al plato identificado, con el reparto de gramos delegado a logica JavaScript.
- Codificacion imagen-texto mediante el componente CLIP (`clip.onnx`), util para similitud o clasificacion zero-shot si el modelo original lo soporta.
- Inferencia en navegador a traves de `onnxruntime-web`, sin servidor de inferencia dedicado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): unicamente vision, derivada de los modelos de origen; no se documentan modos adicionales.

## Casos de uso

- Aplicacion web de conteo calorico en el navegador: el usuario fotografia un plato y la inferencia se ejecuta en el cliente con `onnxruntime-web`, de forma que la imagen no sale del dispositivo. Es el caso de uso declarado por el autor.
- PWA nutricional offline: al distribuirse los pesos como ficheros estaticos, pueden cachearse y ejecutarse sin conexion tras la primera carga, util para registro de comidas en entornos sin red.
- Prototipado rapido de demos de vision: empaquetar `lens.onnx` y `clip.onnx` en un front-end permite validar una idea de producto sin montar infraestructura de GPU.
- Etiquetado asistido de imagenes de comida: usar la salida del modelo como pre-etiqueta en un pipeline de anotacion, con revision humana posterior.
- Integracion en aplicaciones de seguimiento dietetico de terceros: al ser MIT y ONNX, otros productos pueden reutilizar los ficheros dentro de su propia interfaz.
- Investigacion sobre calibracion de estimacion calorica: el repositorio sirve como artefacto reproducible para comparar la prediccion de la red frente al calculo nutricional por reglas en JavaScript.
- Filtrado previo en un backend: usar la version ONNX en el servidor para descartar imagenes que no contienen comida antes de llamar a un modelo mayor, reduciendo coste por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas, no declara dataset de evaluacion y no hay pipeline ni evaluaciones asociadas en HuggingFace.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,5 GB, lo que da una cota superior del conjunto de ficheros, pero no se desglosa el tamano de cada ONNX ni la memoria de activaciones.
- GPU recomendadas: no disponible. El escenario declarado es ejecucion en navegador, no en GPU de servidor.
- Compatibilidad con GPU de consumo: el objetivo declarado es `onnxruntime-web`, que puede apoyarse en WebGPU o WebAssembly; no se especifica si requiere aceleracion por hardware ni que navegadores estan soportados.
- Opciones de despliegue: `onnxruntime-web` en el navegador. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un modelo ONNX de vision sin adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa. La comparacion cualitativa con los artefactos citados en el propio repositorio es la siguiente:

| Modelo | Tipo de artefacto | Licencia | Origen | Datos de rendimiento |
|---|---|---|---|---|
| `RogerKR1111/mi-plato-modelos` | Redistribucion ONNX (fp16) para navegador | MIT | Empaquetado de terceros | no disponible |
| `shalev396/calorie-lens` | Modelo original de estimacion | MIT | Upstream citado por el autor | no disponible |
| `jc-builds/CalorieCLIP` | Modelo CLIP original | MIT | Upstream citado por el autor | no disponible |

Alternativas de mercado del mismo tipo (modelos ONNX de reconocimiento de alimentos o estimacion calorica) no han sido proporcionadas en la informacion disponible.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por el autor: es una redistribucion de dos pesos de terceros, por lo que cualquier problema de precision o sesgo proviene de los modelos originales.
- No hay model card detallada, ni pipeline declarado, ni idiomas declarados, ni resultados de evaluacion. La documentacion se limita a cuatro lineas de README.
- La estimacion calorica depende en parte de logica JavaScript externa (reparto de gramos y calculo nutricional), no verificable desde el repositorio. La precision final puede variar segun esa implementacion y no solo segun la red.
- Riesgo de alucinacion o clasificacion erronea inherente a los modelos de vision: platos ambiguos, cocinas poco representadas o fotos con poca luz pueden producir estimaciones alejadas de la realidad.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por tipo de cocina, cultura alimentaria o condiciones de captura.
- Uso comercial: la licencia MIT lo permite, siempre que se conserve el aviso de copyright y se respeten las licencias MIT de los modelos upstream. Conviene verificar los terminos de `shalev396/calorie-lens` y `jc-builds/CalorieCLIP` en sus propios repositorios.
- Advertencia para produccion: una herramienta de conteo calorico no debe presentarse como consejo medico o nutricional. Se recomienda mostrarla como estimacion aproximada y dejar la validacion a un profesional.
- Metadatos inconsistentes: las fechas de creacion y actualizacion indicadas (2026-10-14) son posteriores a la fecha esperada de publicacion de esta ficha, lo que sugiere un posible error en los metadatos del repositorio.
- Ausencia total de traccion: 0 descargas y 0 likes en la informacion disponible, sin senales de mantenimiento ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RogerKR1111/mi-plato-modelos
- Aplicacion consumidora declarada por el autor: https://mi-plato-ashy.vercel.app
- Modelo upstream de estimacion: https://huggingface.co/shalev396/calorie-lens
- Modelo upstream CLIP: https://huggingface.co/jc-builds/CalorieCLIP
