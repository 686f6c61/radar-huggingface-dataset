# odungeeee/smolvla_omx_ai_test

## Resumen

`odungeeee/smolvla_omx_ai_test` es una politica robotica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base` sobre el conjunto de datos `odungeeee/test_omx_v30`. El modelo consume el estado articular de 6 grados de libertad y una imagen RGB de 480x640 procedente de una camara llamada `camera1`, y produce un vector de accion continuo de 6 dimensiones, es decir, comandos de control para un brazo robotico de tipo `omx_f`. Con 450.046.176 parametros (~450 M) y un repositorio de 1,2 GB, pertenece a la familia SmolVLA descrita en el articulo arXiv:2506.01844, planteada para funcionar en hardware de consumo.

Su relevancia es acotada y muy concreta: es un ajuste fino de demostracion entrenado durante 100 pasos con lote de 2 sobre 12 episodios (6.327 fotogramas a 30 FPS) y una unica tarea ("Pick up the object and place it in the target area"). La model card no incluye resultados de evaluacion y el repositorio acumula 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no es un modelo validado para produccion.

El interes practico del checkpoint es servir de ejemplo reproducible del flujo de trabajo de LeRobot (grabacion de datos, entrenamiento, rollout) y como punto de partida para nuevos ajustes finos con datasets mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia SmolVLA; no se detalla la topologia interna en la model card |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) segun la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (1,2 GB) |
| Idiomas soportados | no disponible; el modelo no genera lenguaje, solo consume la instruccion de tarea asociada al dataset |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de tarea | Robotica: aprendizaje por imitacion y control de manipulador (`pipeline_tag: robotics`) |
| Entradas | `observation.state` (6,); `observation.images.rgb.camera1` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot objetivo | `omx_f` |
| Camaras declaradas | `camera1` |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Dataset de entrenamiento | `odungeeee/test_omx_v30` (12 episodios, 6.327 fotogramas, 30 FPS) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo compacto de vision-lenguaje-accion que busca un rendimiento competitivo con coste computacional reducido y despliegue viable en hardware de consumo, remitiendo al articulo arXiv:2506.01844. Este checkpoint concreto no anade detalles de arquitectura: no se especifican el backbone de vision-lenguaje, el numero de capas, el mecanismo de generacion de acciones (por ejemplo, difusion o flow matching) ni la longitud de contexto. Lo unico verificable es que se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, distribuido en formato safetensors para la libreria LeRobot, con una unica camara RGB y estado/accion de 6 dimensiones.

El entrenamiento es de tipo imitacion supervisada sobre demostraciones, gestionado con LeRobot 0.6.2 y el optimizador AdamW. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, ni aumentos de datos, normalizacion de acciones o decodificacion especulativa.

| Ajuste de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 100 |
| Tamano de lote | 2 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Episodios | 12 |
| Fotogramas | 6.327 |
| Frecuencia de captura | 30 FPS |
| Tarea | "Pick up the object and place it in the target area" |

## Capacidades

- Generacion de acciones motoras: produce un vector continuo de 6 dimensiones por paso de control, adecuado para un manipulador de 6 grados de libertad.
- Percepcion visual: procesa una unica imagen RGB de 480x640 por inferencia, ademas del estado articular de 6 valores.
- Ejecucion condicionada por instruccion: la politica esta asociada a una unica tarea textual ("Pick up the object and place it in the target area"), que se pasa como condicion en el rollout.
- Aprendizaje por imitacion: reproduce la estrategia demostrada en los 12 episodios del dataset de entrenamiento.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Agentica y razonamiento multi-paso: no disponible; no se documenta planificacion ni descomposicion de tareas.
- Multilingue: no aplica; el modelo no genera texto.
- Modo "thinking", vision de multiples camaras, audio o generacion de texto: no disponibles; la model card solo declara una camara y salida de accion.

## Casos de uso

- Pick-and-place en laboratorio: es la tarea exacta del dataset de entrenamiento; el modelo se ejecutaria con `lerobot-rollout` sobre un `omx_f` para trasladar un objeto a una zona objetivo, siempre que el montaje coincida con el de la grabacion.
- Plantilla reproducible de pipelines de imitation learning: sirve para validar de principio a fin el flujo de LeRobot (grabacion, entrenamiento de 100 pasos, rollout) antes de invertir en datasets mayores.
- Punto de partida para ajustes finos: al derivar de `lerobot/smolvla_base` y estar en Apache-2.0, puede reentrenarse con un dataset propio de mas episodios y mas variabilidad.
- Docencia y formacion: ejemplo completo y ligero (~450 M de parametros, 1,2 GB) para explicar que es una politica VLA, que entradas y salidas tiene y como se evalua en robot real.
- Pruebas de integracion de hardware: validar cableado, calibracion, puertos y camaras de un `omx_f` comprobando que el modelo responde coherentemente a las observaciones.
- Automatizacion de celdas de ensamblaje sencillas de 6 ejes: con reentrenamiento sobre datos de la celda, podria cubrir tareas repetitivas de recogida y colocacion en un puesto fijo.
- Generacion de datos sinteticos de control: usar las acciones predichas como referencia para comparar con otras politicas o para detectar discrepancias de calibracion.
- Demostraciones de investigacion en hardware de consumo: el planteamiento de SmolVLA apunta a ejecucion en equipos de gama de consumo, lo que permite montar un banco de pruebas de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real ni comparaciones numericas con otras politicas. Tampoco se aportan datos de latencia, frecuencia de control efectiva ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 450.046.176 parametros): ~1,8 GB en FP32, ~0,9 GB en BF16/FP16, ~0,45 GB en INT8 y ~0,23 GB en INT4. Son estimaciones teoricas, no medidas publicadas.
- VRAM total practica: hay que sumar activaciones e imagenes de entrada (480x640x3 por camara). Con lote 1 en BF16 es razonable esperar un consumo de unos 2 a 4 GB, aunque no se dispone de mediciones oficiales.
- Cabe en GPU de consumo: si, con margen. Cualquier GPU con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia ser suficiente; el articulo de SmolVLA apunta precisamente a hardware de consumo.
- GPUs de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar con datasets grandes.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (reentrenamiento) sobre PyTorch con pesos safetensors. No aplican stacks de servido de LLM como vLLM, TGI, llama.cpp u Ollama, porque no es un modelo de texto.
- Latencia y throughput: no disponibles. La frecuencia de captura del dataset es de 30 FPS, pero no se publica la frecuencia de control alcanzable en inferencia.
- Nota de integracion: los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento (`camera1`); el ejemplo de la model card muestra dos camaras y debe adaptarse.

## Comparativa con modelos similares

Los datos de parametros de los modelos comparados proceden de informacion publica general y no se han verificado contra sus fichas en esta revision; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `odungeeee/smolvla_omx_ai_test` | ~450 M | VLA compacto ajustado para `omx_f` | no disponible | Apache-2.0 | HuggingFace, LeRobot |
| `lerobot/smolvla_base` | ~450 M | VLA base para ajuste fino | no disponible | no verificada en esta ficha | HuggingFace, LeRobot |
| OpenVLA | ~7.000 M | VLA sobre un LLM de 7B | no disponible | no verificada en esta ficha | HuggingFace |
| pi-0 (Physical Intelligence) | ~3.300 M | VLA con experto de accion | no disponible | no verificada en esta ficha | repositorio openpi |
| RDT-1B | ~1.300 M | modelo de difusion para manipulacion | no disponible | no verificada en esta ficha | HuggingFace |
| GR00T N1 (NVIDIA) | ~2.200 M | VLA fundacional | no disponible | no verificada en esta ficha | HuggingFace |

Comparativa de rendimiento: no disponible. No hay resultados publicados para este checkpoint y no se dispone de cifras de benchmarks de los modelos alternativos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Dataset minimo: 12 episodios y 6.327 fotogramas son insuficientes para generalizar; es esperable un sobreajuste a posiciones, iluminacion y objetos concretos de la grabacion.
- Entrenamiento muy corto: 100 pasos con lote de 2 no equivalen a un entrenamiento convergente; el checkpoint debe considerarse una prueba de flujo de trabajo, no una politica desplegable.
- Sin evaluacion: no existe ninguna tasa de exito medida, ni en simulacion ni en robot real.
- Sin validacion de la comunidad: 0 descargas y 0 "me gusta"; no hay demos, videos ni informes de terceros.
- Alcance restringido: una sola tarea, un solo tipo de robot (`omx_f`), una sola camara y 6 grados de libertad de estado y accion. Cualquier cambio de montaje, camara o numero de articulaciones invalida la politica.
- Sin capacidades de lenguaje ni de texto: no debe usarse como modelo conversacional, de codigo ni de razonamiento.
- Sesgos: no disponibles; la model card no documenta analisis de sesgo, y en robotica el sesgo relevante suele estar en la distribucion de objetos, posiciones y condiciones de la demostracion.
- Riesgo de alucinacion en el sentido de acciones incorrectas: al ser una politica de imitacion sin verificacion de exito, puede generar trayectorias plausibles pero erroneas, especialmente fuera de la distribucion de entrenamiento.
- Seguridad fisica: la ejecucion mueve un brazo robotico real; es imprescindible limitar velocidad, fuerza y espacio de trabajo, y supervisar el rollout.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base` y de los datos de entrenamiento antes de un uso en produccion.
- Coherencia de metadatos: la fecha de creacion indicada en el Hub (2026-09-18) resulta inconsistente y conviene verificarla, junto con la ausencia de campos de idioma.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos con memoria muy limitada exige conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/odungeeee/smolvla_omx_ai_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/odungeeee/test_omx_v30
- Articulo de SmolVLA (referencia de la model card): https://huggingface.co/papers/2506.01844
- Articulo de SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=odungeeee/test_omx_v30
- Nota sobre la busqueda web: la consulta realizada no devolvio ningun resultado relacionado con este modelo; los enlaces devueltos correspondian a paginas de informacion de vuelos y se han descartado por no ser relevantes.
