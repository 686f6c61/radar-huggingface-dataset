# NaaaaaiVe6/franka-30demos-normal_task14_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de politica robotica entrenado con la libreria openpi y etiquetado como pi05 (familia pi0.5 de vision-language-action). El autor, NaaaaaiVe6, publica un modelo de tipo "policy" para un brazo Franka con representacion de acciones en cartesiano absoluto: posicion XYZ, cuaternion xyzw en orden xyzw y pinza binaria con valores -1/+1. No se trata de un modelo de lenguaje conversacional, sino de un modulo de control que consume observaciones (imagenes de camara y estado del robot) y emite secuencias de acciones.

El checkpoint pesa 3.616.757.520 parametros (unos 3,62 mil millones) y ocupa 7,2 GB en el repositorio, en formato safetensors y precision bfloat16. Ha sido convertido de JAX a PyTorch manteniendo la configuracion original de entrenamiento para Franka. La salida del modelo tiene 50 pasos temporales y 32 coordenadas por paso; solo las ocho primeras coordenadas corresponden a acciones reales del robot, un detalle critico para integrarlo correctamente en un bucle de control.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de un pipeline openpi completo (pesos, normalizacion mediante `assets/franka/norm_stats.json`, transforms de entrenamiento y convenciones de controlador) para experimentos de manipulacion con pocas demostraciones. El nombre del checkpoint sugiere un entrenamiento con 30 demostraciones sobre la tarea 14, en su paso 6000, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; las etiquetas indican openpi y pi05 (familia pi0.5 de vision-language-action para robotica) |
| Parametros totales | 3.616.757.520 (aproximadamente 3,62 mil millones) |
| Parametros activos | No aplica (no se documenta como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en bfloat16 (PyTorch); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 7,2 GB), convertido desde JAX a PyTorch bfloat16 |
| Entradas | Camaras y estado del robot (segun la model card, consultar `log.txt` para el detalle) |
| Salidas | 50 pasos x 32 coordenadas; solo las 8 primeras son acciones del robot (XYZ absoluto + cuaternion xyzw + pinza binaria -1/+1) |
| Normalizacion | `assets/franka/norm_stats.json` incluido en el repo, obligatorio junto con los transforms de entrenamiento |
| Libreria | openpi |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Las etiquetas del repositorio (`openpi`, `pi05`, `robotics`) lo situan en la familia pi0.5 de modelos vision-language-action integrados en el ecosistema openpi, pero no se aportan datos sobre el codificador visual, el tronco del transformer, el mecanismo de generacion de acciones ni el numero de capas. Cualquier afirmacion mas concreta sobre la arquitectura seria una extrapolacion no respaldada por la informacion disponible.

Respecto al entrenamiento, los unicos datos explicitos son los que se deducen del nombre del artefacto: 30 demostraciones, tarea 14, representacion cartesiana, checkpoint en el paso 6000 y una marca temporal de ejecucion. Tambien se indica que los pesos se convirtieron de JAX a PyTorch en bfloat16 conservando la configuracion original de entrenamiento para Franka. No se documentan numero de tokens o frames vistos, composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning posterior. La innovacion practica del artefacto es el empaquetado completo del entorno de inferencia (pesos, estadisticas de normalizacion y convenciones de controlador), que permite reproducir el comportamiento del checkpoint original sin reentrenar.

## Capacidades

- Generacion de secuencias de accion para manipulacion robotica: produce chunks de 50 pasos con 32 coordenadas, de las que 8 son utiles para el control del Franka.
- Representacion de accion en cartesiano absoluto: posicion XYZ, orientacion como cuaternion xyzw y pinza binaria (-1/+1), no deltas incrementales del controlador.
- Consumo de observaciones multimodales: la model card menciona entradas de camara y de estado del robot, con el detalle en `log.txt`.
- Normalizacion integrada: incluye `norm_stats.json` para aplicar la misma normalizacion que en entrenamiento.
- Portabilidad JAX a PyTorch: los pesos estan en bfloat16 y se pueden cargar sin el stack original de JAX.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo genera acciones de control, no cadenas de razonamiento.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas salvo el uso de entradas visuales propias de una politica robotica.

## Casos de uso

- Pick-and-place en laboratorio: el modelo puede ejecutar la tarea 14 para la que fue entrenado sobre un Franka real, emitiendo chunks de 50 acciones con la pinza binaria, siempre que se repliquen las camaras, el estado de entrada y la normalizacion de `norm_stats.json`.
- Reproduccion de experimentos openpi: sirve como checkpoint de referencia para validar que un pipeline de inferencia openpi (transforms, estadisticas, layout de salida) funciona antes de entrenar modelos propios.
- Base para fine-tuning con pocas demostraciones: al provenir de un entrenamiento con 30 demostraciones, es un punto de partida razonable para adaptar el mismo brazo a tareas cercanas, retomando el entrenamiento desde el paso 6000.
- Evaluacion sim-to-real: permite comparar el comportamiento del checkpoint en simulador y en hardware real, ya que la representacion cartesiana absoluta facilita la traduccion entre ambos entornos.
- Generacion de datos sinteticos de trayectorias: las secuencias de 50 pasos pueden registrarse como trayectorias etiquetadas para aumentar un dataset de manipulacion, aunque con la advertencia de que solo 8 de las 32 coordenadas son acciones.
- Pruebas de integracion de control: util para verificar limites de seguridad, saturacion de la pinza y suavidad de trayectorias antes de desplegar politicas mas grandes.
- Benchmark interno de latencia: al ser un modelo de 3,62 B en bfloat16, permite medir el coste real de inferencia de un VLA en el hardware disponible antes de escalar a variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el layout de salida, la representacion de acciones y las convenciones de controlador; no incluye tasas de exito, errores de posicion, ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 suman aproximadamente 7,2 GB (coincide con el tamano del repo). Con activaciones, buffers de imagenes y el estado de inferencia, conviene reservar entre 12 y 16 GB.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para ejecucion desatendida y lotes multiples; RTX 4090 (24 GB) como opcion de sobremesa mas que suficiente para una sola politica.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y tarjetas de 16 GB como RTX 4080 o A4000 si se reduce el tamano de lote a 1. En 12 GB puede ser ajustado y requerir control estricto de memoria.
- Opciones de despliegue: la libreria de referencia es openpi; el modelo no es un LLM de texto, por lo que vLLM, TGI u Ollama no son las vias naturales. Alternativas razonables son ejecucion directa en PyTorch, exportacion a ONNX o TensorRT y, si se necesita JAX, volver a la configuracion original previa a la conversion.
- Latencia y throughput: no disponibles. El coste real dependera del numero de camaras, la resolucion de entrada y la frecuencia de control exigida por el Franka.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks, licencia ni especificaciones comparables de otros modelos, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-30demos-normal_task14_cartesian (este checkpoint) | 3,62 B | No disponible | No disponible | No disponible | Publico en HuggingFace, 0 descargas |
| Otros checkpoints de la misma familia pi05 en openpi | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion facilitada |
| Alternativas VLA de robotica (por ejemplo, familias tipo OpenVLA o GR00T) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion facilitada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no responde a prompts de texto ni genera contenido; su unica salida son acciones de control.
- Solo 8 de las 32 coordenadas de salida son acciones del robot. Usar las 32 sin filtrar produce comandos invalidos.
- Dependencia estricta de la normalizacion: omitir `norm_stats.json` o usar transforms distintos a los de entrenamiento invalida las predicciones.
- Especificidad de tarea: el nombre indica la tarea 14 con 30 demostraciones y el paso 6000; se espera un rendimiento pobre fuera de esa tarea y ese montaje fisico.
- Sin licencia declarada: no hay permiso explicito de uso comercial, por lo que el uso en produccion es juridicamente indeterminado.
- Idiomas no declarados: no se puede asumir soporte de condicionamiento por lenguaje ni cobertura multilingue.
- Riesgo de sobreajuste a las condiciones de recogida de datos: iluminacion, posicion de camaras y estado inicial del robot deben replicarse.
- Ausencia de benchmarks: no hay tasas de exito publicadas que permitan estimar la fiabilidad antes de desplegarlo.
- La model card remite a `log.txt` para el layout de salida y las convenciones del controlador "que requieren confirmacion", lo que implica que parte del contrato de interfaz no esta cerrado.
- Convenciones de controlador no confirmadas: la propia model card advierte de que hay detalles pendientes de verificar, un riesgo directo en hardware real.
- Anomalia de metadatos: la fecha de creacion registrada (2026-09-16) es posterior a la fecha de la consulta, lo que sugiere automatizacion o error de marca temporal.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de terceros.
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos trataban de deducciones fiscales para nuevas empresas y no aportan informacion tecnica, por lo que se descartan.

## Enlaces

- HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task14_cartesian_20260913T212156Z-step-6000
- `log.txt` del repositorio (layout de salida, normalizacion, entradas y convenciones de controlador): incluido en el propio repositorio de HuggingFace, en la raiz
- `assets/franka/norm_stats.json`: incluido en el repositorio de HuggingFace
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada
