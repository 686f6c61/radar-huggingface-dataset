# NaaaaaiVe6/franka-10demos-normal_task2_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de politica robotica (vision-language-action) entrenado para un brazo Franka y publicado bajo el identificador `franka-10demos-normal_task2_cartesian_20260913T212156Z-step-6000`. Lo distribuye el usuario de HuggingFace NaaaaaiVe6 y esta etiquetado con `openpi`, `pi05`, `robotics` y `safetensors`. El modelo resuelve el problema de generar acciones de control continuas a partir de observaciones visuales y del estado del robot: concretamente emite acciones en representacion cartesiana absoluta (XYZ + cuaternion xyzw + pinza binaria -1/+1), no incrementos de controlador.

El checkpoint pesa 7,2 GB y contiene 3.616.757.520 parametros (aproximadamente 3,6 mil millones), convertidos de JAX a PyTorch en bfloat16 conservando la configuracion de entrenamiento original de Franka. Es relevante ahora porque forma parte del ecosistema `openpi`, que estandariza el intercambio de politicas roboticas preentrenadas y ajustadas, aunque en este caso concreto se trata de un ajuste de tarea muy especifico (el nombre indica 10 demostraciones y la tarea "task2").

La model card es deliberadamente minimalista: advierte que la representacion de acciones no son deltas de controlador, que la salida tiene 50 pasos y 32 coordenadas (de las cuales solo las ocho primeras son acciones del robot) y que es obligatorio usar `assets/franka/norm_stats.json` junto con las transformaciones de entrenamiento correspondientes. No se declara licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (etiquetada como `pi05` / `openpi`; politica robotica vision-language-action) |
| Parametros totales | 3.616.757.520 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (conversion documentada de JAX a PyTorch); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch, bfloat16) |
| Tamano del repositorio | 7,2 GB |
| Pasos de accion por inferencia | 50 |
| Coordenadas de salida | 32 (solo las 8 primeras corresponden a acciones del robot) |
| Representacion de acciones | Cartesiana absoluta: XYZ + cuaternion xyzw + pinza binaria (-1/+1) |
| Libreria | openpi |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas `pi05` y `openpi` y de la indicacion de que el checkpoint se convirtio desde JAX a PyTorch en bfloat16 manteniendo la configuracion original de entrenamiento para Franka. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitacion supervisada, aunque el nombre del repositorio ("10demos") sugiere un ajuste con un conjunto muy reducido de demostraciones.

Lo que si esta documentado es la interfaz de salida y el contrato de normalizacion. El modelo produce 50 pasos de accion con 32 coordenadas cada uno, de las cuales solo las ocho primeras son acciones efectivas del robot; el resto debe ignorarse. Es imprescindible aplicar el fichero `assets/franka/norm_stats.json` incluido en el repositorio para desnormalizar correctamente las salidas, y respetar las transformaciones de entrenamiento originales. La model card remite a `log.txt` para el layout de salida, la frontera de normalizacion, las entradas de camara y estado, y las convenciones de controlador que aun requieren confirmacion.

## Capacidades

- Generacion de acciones de control para un brazo Franka en espacio cartesiano absoluto (posicion XYZ, orientacion como cuaternion xyzw y apertura/cierre de pinza binaria).
- Control por trozos de accion (action chunking): emite 50 pasos de una sola vez, lo que permite amortizar el coste de inferencia ejecutando varias acciones por forward pass.
- Procesamiento de entradas multimodales de robot: imagenes de camara y estado del robot, segun lo indicado en `log.txt`.
- Especializacion en una unica tarea ("task2") sobre un setup concreto de Franka.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje de proposito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible; no se documenta modo de razonamiento, audio ni vision generalista.

## Casos de uso

- Manipulacion de laboratorio con Franka: ejecutar la tarea "task2" aprendida a partir de 10 demostraciones, enviando al controlador las ocho primeras coordenadas del primer paso de accion generado.
- Evaluacion de checkpoints intermedios: al estar etiquetado con el paso 6000, sirve para analizar la curva de aprendizaje de un ajuste y comparar con otros pasos del mismo entrenamiento.
- Reproduccion de investigacion en openpi: cargar el checkpoint en la libreria `openpi` para validar el pipeline de conversion JAX a PyTorch bfloat16 y las transformaciones de normalizacion asociadas.
- Pruebas de action chunking en tiempo real: medir si ejecutar bloques de 50 pasos reduce la frecuencia de inferencia necesaria para mantener control fluido en el robot.
- Desarrollo de controladores compatibles con acciones cartesianas absolutas: usar el modelo como referencia para verificar que el controlador de bajo nivel acepta consignas absolutas y no deltas, tal como exige la model card.
- Benchmarking interno de politicas roboticas: comparar este checkpoint contra otros ajustes de Franka dentro del mismo framework para una misma tarea y conjunto de camaras.
- Docencia y prototipado en robotica: al ser un modelo de 3,6 mil millones de parametros en bfloat16, se puede desplegar en una GPU de gama alta de consumo para experimentos de imitacion a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito, metricas de error de posicion, latencia ni comparaciones con otros checkpoints.

## Requisitos de hardware

- Peso en memoria de los pesos: 3.616.757.520 parametros en bfloat16 equivalen a aproximadamente 7,2 GB, coherente con el tamano declarado del repositorio.
- VRAM estimada para inferencia: en torno a 8-10 GB solo para pesos, mas el margen necesario para el codificador visual, los tensores de imagen/estado y la salida de 50x32 acciones. Se recomienda un minimo de 12 GB y, de forma comoda, 16-24 GB.
- GPU recomendadas: tarjetas con 24 GB o mas (RTX 3090, RTX 4090, L40S, A100, H100) para trabajar sin restricciones; tarjetas de 16 GB (RTX 4080, A4000) probablemente suficientes para inferencia en bfloat16; tarjetas de 12 GB quedan al limite.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y modelos con 16 GB o mas, siempre que la libreria `openpi` y el runtime de PyTorch en bfloat16 lo permitan.
- Opciones de despliegue: la libreria `openpi` es la via documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no serian adecuados al tratarse de una politica robotica con entradas multimodales y salida de acciones, no de un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponibles. El diseno de 50 pasos por inferencia sugiere que la frecuencia efectiva de control depende de la cadencia con la que el bucle de control consuma el bloque de acciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. No se han publicado cifras de arquitectura, contexto, rendimiento ni licencia de checkpoints alternativos dentro de la busqueda realizada, y los resultados de la busqueda web no guardan relacion con el modelo (corresponden a un cable MiniSAS de HPE).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-10demos-normal_task2_cartesian (este) | 3.616.757.520 | no disponible | no disponible | no disponible | HuggingFace, libreria openpi |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia en el repositorio: el uso comercial queda en un limbo legal y requiere contactar con el autor antes de cualquier despliegue productivo.
- El modelo se ha ajustado con un numero muy reducido de demostraciones (el identificador indica 10), por lo que es esperable un sobreajuste a la tarea, al setup de camaras y al entorno concretos, con escasa generalizacion a variaciones de iluminacion, posicion de objetos o configuracion del robot.
- La representacion de acciones es cartesiana absoluta, no deltas de controlador. Enviar estas salidas a un controlador que espere incrementos puede provocar movimientos bruscos o inseguros.
- Solo las ocho primeras de las 32 coordenadas de salida son acciones del robot; interpretar el resto como comandos es un error.
- Es obligatorio aplicar `assets/franka/norm_stats.json` y las transformaciones de entrenamiento originales. Omitir la desnormalizacion invalida por completo las acciones generadas.
- Las convenciones de controlador "requieren confirmacion" segun la propia model card, lo que implica riesgo operativo hasta validarlas.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones de accion fisicamente invalidas o fuera del espacio de trabajo, con el consiguiente peligro para el robot y su entorno.
- No hay informacion sobre sesgos, idiomas ni robustez ante dominios visuales distintos de los de entrenamiento.
- No se han publicado benchmarks ni tasas de exito, por lo que no hay evidencia cuantitativa de su rendimiento real.
- Antes de cualquier uso con hardware fisico, es imprescindible validar en simulacion y establecer limites de par, velocidad y espacio de trabajo en el controlador de bajo nivel.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task2_cartesian_20260913T212156Z-step-6000
- Fichero `log.txt` del repositorio (layout de salida, normalizacion, entradas): incluido en el propio repositorio de HuggingFace
- Fichero `assets/franka/norm_stats.json` (estadisticas de normalizacion): incluido en el propio repositorio de HuggingFace
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- La busqueda web realizada no devolvio resultados relacionados con el modelo.
