# NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de politica robotica (vision-language-action) denominado Franka Cartesian, entrenado hasta el paso 6000 y publicado por el usuario NaaaaaiVe6 bajo la libreria `openpi`. El modelo toma observaciones visuales y de estado de un robot Franka y produce acciones en representacion cartesiana absoluta: coordenadas XYZ, cuaternion en orden xyzw y una componente binaria de pinza (-1/+1). La model card insiste en que no son acciones delta del controlador, un detalle critico para cualquier integracion real.

El checkpoint declara 3.616.757.520 parametros (unos 3,6 mil millones) en pesos safetensors, con un repositorio de 7,2 GB, y fue convertido de JAX a PyTorch en bfloat16 manteniendo la configuracion original de entrenamiento para Franka. La salida tiene 50 pasos temporales y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones del robot; el resto debe ignorarse. La model card remite a `assets/franka/norm_stats.json` y a `log.txt` para el layout de salida, el limite de normalizacion, las entradas de camara/estado y las convenciones del controlador.

Es relevante ahora porque forma parte del ecosistema `openpi` (etiqueta `pi05`), orientado a modelos fundacionales para robotica, y porque ejemplifica el flujo habitual de trabajo en investigacion VLA: fine-tuning de una politica generalista sobre un conjunto pequeno de demostraciones (el nombre del repositorio sugiere 30 demostraciones y la tarea 16, aunque esto no se confirma en la model card). No hay descargas ni likes registrados, y no se dispone de licencia, idiomas soportados ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `pi05`, libreria `openpi`; la model card no detalla la arquitectura) |
| Parametros totales | 3.616.757.520 (dato declarado en safetensors) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se ofrecen variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (convertidos de JAX a PyTorch en bfloat16) |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Modalidad de entrada | imagenes de camara y estado del robot (segun `log.txt` referenciado en la model card) |
| Modalidad de salida | 50 pasos x 32 coordenadas; solo las 8 primeras son acciones del robot |
| Representacion de accion | cartesiana absoluta: XYZ + cuaternion xyzw + pinza binaria (-1/+1) |
| Tamano del repositorio | 7,2 GB |
| Autor | NaaaaaiVe6 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna. Los metadatos disponibles (etiquetas `robotics`, `pi05`, libreria `openpi`, pipeline `robotics`) situan el checkpoint en la familia de modelos vision-language-action de openpi, pero la model card no confirma capas, tipo de transformer, encoder visual ni mecanismo de atencion. Tampoco se indican tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. Todo lo relativo a arquitectura mas alla de lo citado debe considerarse no disponible.

Lo que si se documenta es el proceso de conversion y el contrato de entrada/salida. El checkpoint se convirtio de JAX a PyTorch en bfloat16 conservando la configuracion original del modelo de entrenamiento para Franka. La politica emite un chunk de 50 pasos con 32 coordenadas por paso, y unicamente las ocho primeras coordenadas son acciones efectivas; el resto forma parte del layout interno y no debe enviarse al robot. La normalizacion se debe aplicar con `assets/franka/norm_stats.json` y con las mismas transformaciones usadas en entrenamiento. El nombre del repositorio sugiere un fine-tuning con 30 demostraciones sobre una tarea concreta (task16) en espacio cartesiano, si bien esto es una lectura del identificador y no una afirmacion de la model card.

## Capacidades

- Generacion de acciones de manipulacion robotica en espacio cartesiano absoluto (XYZ + cuaternion xyzw + pinza binaria), no acciones delta del controlador.
- Prediccion de chunks de accion de 50 pasos, lo que permite ejecutar secuencias temporales sin reinferencia en cada paso de control.
- Procesamiento conjunto de entradas visuales y de estado del robot para producir acciones (politica vision-language-action).
- Generalizacion limitada a la tarea y al setup de entrenamiento: el nombre del repositorio apunta a una unica tarea (task16) y a una morfologia concreta (Franka).
- Soporte de tool calling o function calling: no aplicable (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de LLM; el razonamiento se manifiesta como planificacion implicita a traves del chunk de acciones.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no se declaran modos de pensamiento, vision generativa, audio ni otras modalidades mas alla de la percepcion visual para control.

## Casos de uso

- Control de un robot Franka Panda en tareas de pick-and-place: el checkpoint consume imagenes y estado y devuelve coordenadas cartesianas absolutas mas el estado de pinza, por lo que puede cerrar el bucle de control enviando directamente la pose objetivo del efector final.
- Evaluacion de checkpoints intermedios de fine-tuning: al estar etiquetado con el paso 6000, es util para comparar curvas de aprendizaje frente a otros pasos y decidir el punto de parada del entrenamiento.
- Reproduccion de experimentos de investigacion VLA: al incluir `norm_stats.json` y transformaciones de entrenamiento, permite reproducir fielmente las condiciones de inferencia de un pipeline openpi sobre Franka.
- Fine-tuning adicional con nuevas demostraciones: sirve como punto de partida para adaptar la politica a tareas cercanas (por ejemplo, nuevas posiciones de objeto) sin reentrenar desde cero.
- Validacion de convenciones de controlador: la model card advierte de que las acciones no son deltas; el modelo se puede usar para verificar que la integracion con el controlador interpreta correctamente cuaterniones xyzw y el signo de la pinza.
- Pruebas de robustez ante cambios de iluminacion o de posicion de camara: al ser una politica visual, permite medir la degradacion de la tasa de exito variando condiciones de captura dentro del mismo setup.
- Docencia y laboratorios de robotica: su tamano (3,6 mil millones de parametros) y su formato safetensors en bfloat16 permiten desplegarlo en una GPU de gama alta de un solo nodo.
- Integracion en un stack ROS 2 como nodo de politica: la salida de 50 pasos x 8 acciones utiles encaja en un bucle que ejecute el chunk a una frecuencia fija y vuelva a inferir al agotarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay tasas de exito por tarea, errores de posicion, ni comparaciones numericas con otros checkpoints en la model card ni en los resultados de busqueda proporcionados.

## Requisitos de hardware

- Peso de los parametros: 3.616.757.520 parametros en bfloat16 equivalen a unos 7,2 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia en bfloat16: aproximadamente 8-10 GB solo para pesos, mas memoria de activaciones para las imagenes de entrada y el chunk de 50 x 32 salidas. Con un presupuesto realista, 16 GB es el minimo comodo y 24 GB da margen.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, RTX 5090, A100 40 GB, H100. Cualquier GPU con al menos 16 GB de VRAM y soporte de bfloat16 es candidata.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090, 5090) con holgura; en tarjetas de 12-16 GB puede requerir precision reducida o liberar cache entre inferencias.
- Opciones de despliegue: la libreria declarada es `openpi` (pesos PyTorch bfloat16 procedentes de JAX). No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI, y estos no son aplicables a una politica robotica de este tipo.
- Latencia y throughput: no disponibles. Dependen del hardware, del numero de camaras y de la frecuencia de control del robot, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-30demos-normal_task16_cartesian (este checkpoint, paso 6000) | 3.616.757.520 | no disponible | no disponible | no disponible | HuggingFace, libreria `openpi`, 0 descargas |
| Modelo base de la familia openpi / pi05 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros checkpoints de robotica de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa. La diferencia mas relevante frente a una politica generalista es que este repositorio parece ser un fine-tuning especifico de tarea (task16) con 30 demostraciones, segun se deduce del identificador, lo que implica menor generalidad pero mayor especializacion en el setup concreto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribucion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- La representacion de accion es cartesiana absoluta, no delta del controlador. Enviar estas salidas a un controlador que espere incrementos provocara movimientos incorrectos o inseguros.
- Solo las ocho primeras coordenadas de cada paso son acciones validas; el resto de las 32 coordenadas corresponde al layout interno y debe descartarse.
- Es necesario aplicar la normalizacion con `assets/franka/norm_stats.json` y las transformaciones de entrenamiento; omitirlas invalida por completo las predicciones.
- La model card indica que hay convenciones del controlador pendientes de confirmacion en `log.txt`, lo que implica que parte del contrato de integracion no esta cerrado.
- Especializacion estrecha: el nombre del repositorio sugiere una unica tarea y una morfologia Franka concreta, por lo que la transferencia a otros robots, camaras o disposiciones de objetos es incierta.
- Riesgo de fallo silencioso en robotica: no hay benchmarks publicados ni tasas de exito, de modo que el comportamiento fuera de la distribucion de entrenamiento no esta caracterizado.
- Sesgos conocidos: no disponibles. En modelos de robotica, los sesgos suelen aparecer como dependencia de las condiciones visuales del dataset de demostraciones (iluminacion, fondo, posicion de camara).
- Limitaciones de idioma: no disponible si acepta instrucciones en lenguaje natural y en que idiomas.
- Idoneidad para produccion: con 0 descargas, 0 likes, licencia ausente y documentacion parcial, debe tratarse como un artefacto de investigacion, no como un componente listo para desplegar.
- No se recomienda su uso en entornos con presencia humana sin validacion exhaustiva previa, limites de fuerza y paradas de emergencia independientes.

## Enlaces

- HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-6000
- `log.txt` (referenciado en la model card, dentro del repositorio): https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-6000/blob/main/log.txt
- `assets/franka/norm_stats.json` (referenciado en la model card, dentro del repositorio): https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-6000/blob/main/assets/franka/norm_stats.json
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo (los resultados devueltos correspondian a paginas de soporte de Microsoft, sin relacion con el modelo).
