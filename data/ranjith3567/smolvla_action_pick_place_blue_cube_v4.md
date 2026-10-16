# ranjith3567/smolvla_action_pick_place_blue_cube_v4

## Resumen

`ranjith3567/smolvla_action_pick_place_blue_cube_v4` es un modelo de visión-lenguaje-acción (VLA) especializado en una única tarea de manipulación robótica: coger un cubo azul y depositarlo en una caja marrón. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, la implementación de SmolVLA publicada por el equipo de LeRobot de Hugging Face, y ha sido entrenado y subido al Hub íntegramente con la librería LeRobot.

El modelo tiene 450.046.176 parámetros (unos 450 millones) y un repositorio de 0,9 GB, lo que lo sitúa en la categoría de los VLA compactos descritos en el artículo SmolVLA (arXiv:2506.01844): un modelo que, según la propia model card, «alcanza un rendimiento competitivo con costes computacionales reducidos y puede desplegarse en hardware de consumo». Frente a VLA de mayor tamaño como π0 o GR00T N1, su interés radica precisamente en que la inferencia completa cabe en una GPU de gama media.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de la robótica open source: grabar demostraciones con un brazo de bajo coste, entrenar una política de imitación con LeRobot y distribuirla como un artefacto versionado en el Hub. La contrapartida es su especificidad: la política está entrenada para un robot concreto (`so_follower`), dos cámaras y una sola instrucción en inglés, y no incluye resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacto, tipo SmolVLA; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; consume una observacion fija: estado de 6 dimensiones y 3 imagenes de (3, 256, 256) |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | no disponible; la unica instruccion de tarea documentada esta en ingles ("pick up the blue box and place it in brown box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB, compatible con fp16/bf16; la cuantizacion exacta de los pesos no esta documentada) |

Especificaciones de entrada y salida declaradas en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

La model card identifica el modelo como un SmolVLA, es decir, un modelo de visión-lenguaje-acción que combina percepción visual, una instruccion en lenguaje natural y un estado proprioceptivo de 6 dimensiones para producir directamente un vector de accion de 6 dimensiones. No se detallan en la informacion disponible ni el backbone de visión-lenguaje concreto, ni el numero de capas, ni el mecanismo de generacion de acciones (por ejemplo, si emplea flow matching o regresion directa). El articulo de referencia citado en las etiquetas del repositorio es arXiv:2506.01844, que documenta el metodo SmolVLA.

El entrenamiento es un ajuste fino de `lerobot/smolvla_base` sobre el dataset `ranjith3567/pick_place_Blue_cube_v4_20261013_202650`, compuesto por 50 episodios y 28.835 fotogramas grabados a 30 FPS, con una unica tarea anotada. La configuracion declarada es: 100.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot 0.6.2. No se documenta la composicion del dataset de preentrenamiento del modelo base, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias (en el caso de politicas de imitacion esto seria inusual, pero no hay dato explicito).

## Capacidades

- Generacion de acciones de manipulacion: dado un estado de 6 dimensiones y tres imagenes de 256x256, produce un vector de accion de 6 dimensiones para el brazo `so_follower`.
- Ejecucion de una tarea especifica guiada por lenguaje: coger el cubo azul y colocarlo en la caja marron, invocada con la instruccion textual de entrenamiento.
- Percepcion multi-camara: consume tres flujos visuales simultaneos (etiquetados como `camera1`, `camera2`, `camera3` en el modelo; `Top` y `Side` en la seccion de detalles de robot).
- Control a la frecuencia de la tarea: el dataset se grabo a 30 FPS, por lo que la politica esta pensada para un bucle de control de 30 Hz.
- Aprendizaje por imitacion a partir de demostraciones: se puede reentrenar con `lerobot-train` aportando un dataset propio en formato LeRobot.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, dialogo multilingue, vision general de imagenes, audio ni modo de razonamiento explicito.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: la politica ejecuta el ciclo completo de coger el cubo azul y depositarlo en la caja marron sobre un brazo `so_follower`, sin necesidad de programacion cinematica manual de la trayectoria.
- Validacion de un pipeline de imitacion de bajo coste: sirve como referencia reproducible para comprobar que 50 episodios y 28.835 fotogramas bastan para aprender una tarea de recogida y colocacion con un VLA de 450 M de parametros.
- Banco de pruebas de despliegue en hardware de consumo: al ocupar menos de 1 GB en pesos de 16 bits, permite medir latencia y throughput reales de un VLA en una GPU de gama media antes de escalar a modelos mayores.
- Punto de partida para fine-tuning de variantes de la tarea: cambiando el color del objeto, la caja destino o la posicion de las camaras, se puede reentrenar desde este checkpoint o desde `lerobot/smolvla_base` con el mismo flujo de LeRobot.
- Investigacion en generalizacion de politicas: util para estudiar hasta que punto el modelo tolera cambios de iluminacion, posicion del objeto o distractores, dado que no se han publicado evaluaciones al respecto.
- Docencia y formacion en robotica open source: el comando `lerobot-rollout` del repositorio permite reproducir la politica completa en un laboratorio con un brazo de bajo coste y dos camaras USB.
- Recoleccion de datos comparables: al estar vinculado a un dataset versionado con marca temporal, facilita experimentos A/B entre checkpoints entrenados sobre los mismos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea «_No evaluation results have been provided for this policy yet_», sin tabla de ensayos, exitos ni tasas de acierto en robot real. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de tareas de manipulacion estandar (por ejemplo, LIBERO o Meta-World), que por otra parte no son el tipo de evaluacion habitual para una politica de imitacion de tarea unica.

Las busquedas web realizadas no devolvieron informacion relevante sobre este modelo: los resultados obtenidos corresponden a paginas sobre Google Health Coach y no guardan relacion con el repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en fp32 (450 M x 4 bytes), unos 0,9 GB en fp16/bf16 (coincide con el tamano del repositorio, 0,9 GB) y alrededor de 0,45 GB en int8 (cuantizacion no publicada, estimacion teorica).
- VRAM total en inferencia: debe sumarse la activacion del codificador visual al procesar tres imagenes de 256x256 con cada paso de control; se estima un consumo conjunto del orden de 2 a 4 GB en fp16, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). La model card afirma que el modelo puede desplegarse en hardware de consumo, pero no especifica modelos concretos.
- GPU de centro de datos: A100, H100 o L40S son mas que suficientes y solo tendrian sentido para entrenamiento o para servir varias politicas en paralelo.
- Opciones de despliegue: `lerobot-rollout` de LeRobot (con `--policy.device=cuda`), integrado con el ecosistema LeRobot; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica de este tipo.
- Latencia y throughput: no disponible. El unico dato temporal es que el dataset se grabo a 30 FPS, lo que marca la frecuencia de control esperada del bucle de inferencia.
- Requisitos de robot: brazo de tipo `so_follower`, dos camaras segun la model card (`Top` y `Side`) y nombres de camara que coincidan con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ranjith3567/smolvla_action_pick_place_blue_cube_v4` | 450 M | 3 imagenes 256x256 + estado (6,) | apache-2.0 | Hub de Hugging Face, 0 descargas y 0 likes en el momento de la consulta | Fine-tune de tarea unica, sin evaluacion publicada |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada (misma familia SmolVLA) | no disponible | no disponible en la informacion proporcionada | Hub de Hugging Face | Modelo base de preentrenamiento del que deriva este fine-tune |
| Otros VLA abiertos (π0, GR00T N1, OpenVLA, entre otros) | no disponible | no disponible | no disponible | no disponible | La informacion proporcionada no incluye comparativas ni resultados que permitan un contraste riguroso |

No es posible establecer una comparativa cuantitativa con alternativas de la misma categoria: el repositorio no publica tasas de exito, y la busqueda web no aporto datos de modelos comparables. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Especificidad extrema de tarea: la politica esta entrenada para una unica instruccion ("pick up the blue box and place it in brown box"); fuera de ese objetivo no hay garantia de comportamiento util.
- Dependencia del hardware: el tipo de robot declarado es `so_follower` y las camaras deben coincidir en nombre e indice con las claves de observacion del entrenamiento (`camera1`, `camera2`, `camera3`). Un cambio de montaje, resolucion o numero de camaras invalida la politica.
- Dataset pequeno: 50 episodios y 28.835 fotogramas son un volumen reducido, con riesgo alto de sobreajuste a posiciones, iluminacion y fondo concretos de la escena de grabacion.
- Ausencia de evaluacion: no hay ninguna tasa de exito publicada, ni en robot real ni en simulacion, por lo que el rendimiento en produccion es desconocido.
- Riesgo de alucinacion en el sentido generativo: no aplica como en un LLM, pero existe el equivalente funcional de acciones erroneas o inseguras ante entradas fuera de distribucion (objetos distintos, oclusiones, cambios de iluminacion).
- Idioma: la unica instruccion documentada esta en ingles; no se declaran idiomas soportados ni se ha verificado el comportamiento con instrucciones en castellano.
- Reproducibilidad: la model card declara semilla 1000 y LeRobot 0.6.2, pero no incluye curvas de perdida, checkpoints intermedios ni criterios de seleccion del modelo final.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base` y de los datos de preentrenamiento antes de un despliegue comercial.
- Trazabilidad baja: 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion ni demo, lo que dificulta juzgar su calidad frente a otros fine-tunes de SmolVLA.
- Seguridad fisica: al tratarse de una politica que controla un brazo real, debe desplegarse con limites de par, paradas de emergencia y espacio de trabajo despejado; el modelo no incorpora ninguna capa de seguridad propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/smolvla_action_pick_place_blue_cube_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_place_Blue_cube_v4_20261013_202650
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_place_Blue_cube_v4_20261013_202650
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuracion de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
