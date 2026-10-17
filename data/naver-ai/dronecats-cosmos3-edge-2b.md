# naver-ai/DroneCATS-Cosmos3-Edge-2B

## Resumen

DroneCATS-Cosmos3-Edge-2B es un modelo de vision-lenguaje-accion (VLA) de 2.435.616.496 parametros, publicado por el equipo de investigacion de NAVER (naver-ai) como finetune del modelo nvidia/Cosmos3-Edge. Su proposito es concreto y acotado: recibe un unico fotograma de la camara de un dron junto con una instruccion en lenguaje natural (por ejemplo, "go to the egg") y devuelve una unica accion de control en formato JSON, que puede ser `go` (avanzar hacia un punto de la imagen), `rotate` (girar en el sitio), `think` (mantener posicion un paso y planificar) o `finished` (objetivo alcanzado).

El modelo forma parte del proyecto DroneCATS, cuyo articulo asociado se titula "Evaluating Multimodal LLMs as Generalist Vision-Language-Action Agents for Drone Control: Commanding, Approaching, Tracking and Searching" (arXiv:2609.01404). El interes practico esta en plantear el control de un dron como un bucle cerrado de pasos discretos: el modelo no genera trayectorias continuas ni comandos de bajo nivel, sino una accion interpretable por paso, con la geometria de la camara inyectada como metadato (`width`, `height`, `fx`, `fy`) y un historial de hasta cinco acciones previas.

El modelo se distribuye en `safetensors` para la libreria `transformers` (se exige version >= 5.18.0) y esta entrenado exclusivamente en ingles. La relevancia actual viene de que reutiliza un backbone multimodal pequeno (2,4 B de parametros) adaptado a una tarea de robotica aerea, lo que lo hace candidato a ejecucion en hardware modesto, aunque el autor advierte explicitamente de que el modelo solo propone acciones y no incorpora evitacion de obstaculos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) multimodal de tipo image-text-to-text, derivada de nvidia/Cosmos3-Edge; detalle interno de capas no disponible |
| Parametros totales | 2.435.616.496 (2,44 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion publicada (solo pesos bf16 en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (campo `license` como `other`, `license_name: openmdw1.1-license`) |
| Formato de pesos | safetensors (repositorio de 4,9 GB) |

Datos adicionales de la ficha: clase de carga `Cosmos3EdgeForConditionalGeneration`, `pipeline_tag: image-text-to-text`, `library_name: transformers`, `base_model: nvidia/Cosmos3-Edge` con relacion `finetune`, etiquetas `drone`, `vision-language-action`, `conversational`, `endpoints_compatible`. Fecha de creacion: 2026-10-16.

## Arquitectura y entrenamiento

Se trata de un finetune del modelo `nvidia/Cosmos3-Edge`, cargado mediante la clase `Cosmos3EdgeForConditionalGeneration` y un `AutoProcessor` multimodal. La entrada combina tres elementos: una imagen (fotograma de dron, limitado a 640 px de ancho en el ejemplo de uso), un bloque de texto con el prompt de sistema y de usuario, y un metadato `camera_aux` en JSON con las intrinsicas de la camara. La salida es texto plano que se parsea como un unico objeto JSON de accion. No se dispone de informacion publicada sobre el numero de capas, el encoder de vision empleado ni la composicion exacta del dataset de entrenamiento.

El autor indica que los ficheros de prompt (`prompts/system_prompt.txt` y `prompts/user_prompt.txt`) deben usarse literalmente, porque el modelo fue entrenado exactamente con esa formulacion; el prompt de sistema se formatea con las dimensiones del fotograma y sus cuartos (`frame_w`, `frame_h`, `quarter_x`, `quarter_y`). El prompt de usuario incorpora la instruccion y un campo `history` con las ultimas acciones (hasta 5, de la mas antigua a la mas reciente) y su estado (`done`, `in progress`) y duracion. No se especifica si hubo RLHF, DPO u otra fase de alineamiento, ni el volumen de tokens de entrenamiento.

La innovacion principal es la formulacion de la salida como espacio de acciones discreto y geometricamente interpretable: el punto de destino se expresa en una rejilla 0-1000 sobre la imagen y `depth_m` se da en unidades canonicas que se convierten a metros multiplicando por el factor `k = 1 / (2 * tan(hfov/2))` calculado a partir del campo de vision horizontal de la camara. El modo `think` permite reservar un paso para planificar en la siguiente respuesta, y el ejemplo de uso desactiva el modo de razonamiento explicito con `enable_thinking=False` y `skip_reasoning=True` durante la plantilla de chat.

## Capacidades

- Percepcion visual de un unico fotograma de camara de dron y comprension de una instruccion en lenguaje natural.
- Generacion de acciones de control en JSON con cuatro verbos: `go` (con `point` en rejilla 0-1000 y `depth_m`), `rotate` (con `angle_deg`, positivo a la derecha), `think` y `finished`.
- Control en bucle cerrado paso a paso: el modelo puede recibir el nuevo fotograma y el historial de hasta cinco acciones previas para mantener coherencia temporal.
- Integracion de metadatos geometricos de camara (ancho, alto, `fx`, `fy`) y uso del campo de vision horizontal para convertir profundidad canonica a metros.
- Modo de planificacion explicito mediante la accion `think`, que pospone la decision un paso.
- Tarea de seguimiento de comandos del tipo "ir a un objeto", "acercarse", "buscar" o "seguir", segun el titulo del articulo asociado.
- Generacion de texto multimodal conversacional (etiqueta `conversational`), aunque el uso documentado se limita a la emision de acciones.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente multi-paso: si, en la forma de bucle percepcion-accion con historial, no como planificador autonomo general.
- Capacidades multilingues: solo ingles.
- Otras capacidades (audio, vision de video multi-fotograma, salida de bajo nivel de motores): no disponibles.

## Casos de uso

- Navegacion reactiva a un objetivo visual en interiores: el modelo recibe el fotograma actual y la orden "go to the egg" o equivalente, y devuelve `go` con un punto sobre la imagen y una profundidad estimada; es adecuado porque la salida es directamente accionable y geometricamente coherente con las intrinsicas de la camara.
- Seguimiento de objetos o personas en bucle cerrado: enviando cada nuevo fotograma con el historial de las ultimas cinco acciones, el modelo mantiene la persecucion paso a paso sin necesidad de un planificador externo.
- Busqueda activa en un espacio: combinando `rotate` para barrer el entorno y `think` para reservar un paso de planificacion, encaja en tareas de exploracion donde el objetivo no esta en el campo de vision inicial.
- Control de drones de bajo coste tipo DJI Tello: el ejemplo oficial esta calibrado con su FOV horizontal de 56,4 grados, lo que permite desplegar el modelo en plataformas educativas o de prototipado con una capa de seguridad propia.
- Banco de pruebas y evaluacion de VLA multimodales: sirve como referencia de 2,4 B parametros para comparar politicas de accion discreta frente a modelos generativos mayores en tareas de robotica aerea.
- Investigacion en interfaces lenguaje-accion: el formato JSON con verbos limitados es util para estudiar la trazabilidad de decisiones, el efecto del historial de acciones y el rol de la planificacion explicita (`think`) en el exito de la tarea.
- Simulacion y validacion en bucle antes de volar: al ser un modelo pequeno y determinista con `do_sample=False`, permite repetir exactamente la misma secuencia de acciones sobre un registro de fotogramas para depurar politicas.
- Asistencia a un operador humano: generar propuestas de accion paso a paso que un piloto o un sistema de seguridad valida antes de ejecutar.

Nota importante: en todos los casos reales de vuelo es obligatorio anadir una capa de seguridad externa, porque el modelo no evita obstaculos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de exito en tareas de dron, y la busqueda web realizada no ha devuelto resultados tecnicos asociados al articulo arXiv:2609.01404.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan aproximadamente 4,9 GB (2.435.616.496 parametros x 2 bytes). Con cache KV, activaciones y el encoder de vision, una estimacion razonable de trabajo se situa en el rango de 6 a 8 GB.
- VRAM en cuantizacion de 8 bits: estimacion de 2,5 a 4 GB, contando pesos mas overhead. No hay artefactos de cuantizacion publicados por el autor.
- VRAM en cuantizacion de 4 bits: estimacion de 1,5 a 2,5 GB. Igualmente, sin artefactos oficiales.
- GPU de centro de datos: A100, H100, L40S o A10G son suficientes y sobredimensionadas para un modelo de 2,4 B; resultan utiles para servir muchas peticiones en paralelo.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080, RTX 3090 (24 GB) y RTX 3060 de 12 GB en bf16; en tarjetas de 8 GB requeriria cuantizacion.
- Despliegue: el unico camino documentado es `transformers` >= 5.18.0 con `Cosmos3EdgeForConditionalGeneration` y `AutoProcessor`. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. El ejemplo usa `do_sample=False` y `max_new_tokens=128`, lo que acota la salida a un JSON corto y hace previsible el coste por paso, pero no se publican mediciones.
- Consideracion de despliegue: al ser un bucle de control, la latencia relevante es por paso completo (captura de fotograma, preprocesado a 640 px, inferencia y parseo), no por token.
- Almacenamiento y transferencia: el repositorio ocupa 4,9 GB, ademas de los ficheros de prompt y ejemplos descargados con `hf_hub_download`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroneCATS-Cosmos3-Edge-2B (naver-ai) | 2,44 B | No disponible | VLA para control de dron, salida JSON | OpenMDW-1.1 | Hugging Face, `transformers` |
| nvidia/Cosmos3-Edge (modelo base) | No disponible | No disponible | Modelo multimodal base del que se parte | No disponible en esta informacion | Hugging Face |
| Otros VLA de dron comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base ni de alternativas de la misma categoria dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo propone acciones: no incluye evitacion de obstaculos. El propio autor advierte de que hay que usar una capa de seguridad propia al volar un dron real.
- Salida muy restringida: unicamente cuatro acciones (`go`, `rotate`, `think`, `finished`) con un formato JSON fijo. No genera trayectorias continuas, comandos de motor ni codigo de control.
- Dependencia estricta del prompt: los ficheros `system_prompt.txt` y `user_prompt.txt` deben usarse literalmente, porque el entrenamiento se hizo con esa redaccion exacta. Reformularlos puede degradar la calidad de las acciones.
- Un solo fotograma de entrada por paso; no hay evidencia de soporte de video multi-fotograma ni de estado interno mas alla del historial textual de cinco acciones.
- Solo ingles: cualquier instruccion en castellano u otro idioma queda fuera de la cobertura declarada.
- Riesgo de alucinacion: al estimar `depth_m` en unidades canonicas y puntos sobre una rejilla 0-1000, una prediccion erronea se traduce directamente en un movimiento fisico incorrecto. La conversion a metros depende de que el campo de vision horizontal configurado coincida con el real.
- Limitacion de resolucion: el ejemplo recorta o redimensiona la imagen a un maximo de 640 px de ancho, lo que afecta a la precision sobre objetivos pequenos o lejanos.
- Longitud de contexto no publicada, lo que impide garantizar el comportamiento con historiales largos o prompts extensos mas alla del formato previsto.
- Confusion potencial entre el modo `think` (que consume un paso sin movimiento) y el razonamiento explicito desactivado en el ejemplo (`enable_thinking=False`, `skip_reasoning=True`); conviene validar la configuracion antes de desplegar.
- Licencia OpenMDW-1.1: es una licencia de tipo "other" con nombre especifico. Debe revisarse el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que en la informacion disponible no se detallan los terminos ni posibles restricciones heredadas del modelo base de NVIDIA.
- Trazabilidad limitada del entrenamiento: no se publican datos sobre composicion del dataset, numero de tokens, sesgos ni fases de alineamiento, lo que dificulta auditar su comportamiento fuera de las condiciones de entrenamiento.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion es muy reciente, por lo que no existe aun validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naver-ai/DroneCATS-Cosmos3-Edge-2B
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Articulo (arXiv): https://arxiv.org/abs/2609.01404
- Pagina del proyecto DroneCATS: https://naver-ai.github.io/DroneCATS/
- Repositorio GitHub: https://github.com/naver-ai/DroneCATS
- Licencia OpenMDW-1.1 (fichero LICENSE del repositorio): https://huggingface.co/naver-ai/DroneCATS-Cosmos3-Edge-2B/blob/main/LICENSE
- Cita (BibTeX): Park, Jaewoo y otros, "Evaluating Multimodal LLMs as Generalist Vision-Language-Action Agents for Drone Control: Commanding, Approaching, Tracking and Searching", arXiv preprint arXiv:2609.01404, 2026.
