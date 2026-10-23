# dddddsds31341/vla-adapter-pick_balls-100k

## Resumen

vla-adapter-pick_balls-100k es un checkpoint de un modelo vision-language-action (VLA) de escala pequena, publicado por el usuario de Hugging Face dddddsds31341 y entrenado con el paradigma VLA-Adapter del proyecto OpenHelix-Team. El modelo resuelve una tarea robotica concreta: con una sola pinza, coger dos pelotas de tenis de una en una y depositarlas en una cesta verde. No es un modelo de proposito general, sino un adaptador de politica motora entrenado sobre 100 demostraciones de esa tarea especifica.

El checkpoint corresponde al paso de entrenamiento 100.000 y se distribuye como un paquete completo: pesos fusionados, adaptador LoRA, cabeza de accion (action head), proyector de propiocepcion, ficheros de procesador/tokenizer y estadisticas de normalizacion del dataset original. El recuento real de parametros en safetensors es de 1.252.553.792 (aproximadamente 1,25 mil millones), lo que lo situa en la categoria de VLA de escala reducida frente a alternativas de 3B a 7B.

Su relevancia es doble: por un lado, ejemplifica la linea de investigacion de VLA-Adapter, que busca alcanzar rendimiento de estado del arte con backbones minimos; por otro, sirve como artefacto reproducible de un experimento de manipulacion concreto, util para quien quiera inspeccionar la estructura interna de un checkpoint VLA completo o reutilizar el adaptador como base de un ajuste fino. La model card es muy escueta: no declara licencia, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con adaptador; paradigma VLA-Adapter (backbone VLM de escala pequena + LoRA + action head + proyector de propiocepcion) |
| Parametros totales | 1.252.553.792 (segun safetensors del repositorio) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; los pesos se publican en safetensors (precision original no declarada) |
| Idiomas soportados | No disponible; la instruccion de la tarea esta en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos fusionados), adaptador LoRA, action head, proyector de propiocepcion, processor/tokenizer y estadisticas de normalizacion |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA-Adapter, descrito en el articulo arXiv 2509.09372 como una propuesta para obtener modelos VLA de nivel estado del arte con un backbone de escala muy pequena. En este checkpoint la arquitectura se materializa en cuatro piezas distribuidas de forma explicita en el repositorio: los pesos del modelo fusionados, un adaptador LoRA, una cabeza de accion que traduce representaciones internas a comandos motores y un proyector de propiocepcion que incorpora el estado del robot. Se etiqueta con la libreria transformers, el pipeline robotics y la etiqueta openvla, y requiere codigo personalizado (custom_code) para cargarse. El repositorio ocupa 3,4 GB.

El entrenamiento se realizo sobre la tarea pick_balls con 100 demostraciones y se detuvo en el paso 100.000. La instruccion exacta registrada es: "Use one gripper to pick up the two tennis balls one at a time and place them into the green basket". No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el backbone VLM concreto empleado, ni si hubo etapas de RLHF o DPO; en el contexto VLA lo habitual es aprendizaje por imitacion supervisado sobre demostraciones teleoperadas, pero ese extremo no se confirma en la model card. Tampoco se detalla ninguna innovacion adicional mas alla del propio paradigma VLA-Adapter (por ejemplo, decodificacion especulativa o atencion lineal).

## Capacidades

- Manipulacion robotica de una sola pinza: la politica genera acciones concretas para coger objetos y depositarlos en un contenedor designado.
- Seguimiento de instrucciones en lenguaje natural, segun el texto de instruccion registrado en la model card.
- Percepcion visual integrada: el modelo consume imagenes del entorno junto con la instruccion para producir acciones.
- Integracion de propiocepcion mediante el proyector incluido en el repositorio.
- Ejecucion de tareas por etapas dentro de un mismo episodio: la instruccion exige manipular dos pelotas "de una en una", lo que implica secuenciacion.
- Distribucion como adaptador LoRA, lo que permite tecnicas de intercambio o composicion de adaptadores.
- No se documentan soporte de tool calling, function calling, capacidades agenticas de proposito general, razonamiento multi-paso simbolico, vision general (VQA, OCR, captioning) ni modo thinking. No hay informacion sobre capacidades multilingues.
- No se documenta capacidad de audio, video ni dialogo multi-turno.

## Casos de uso

- Replicacion de un experimento de manipulacion: cargar el checkpoint con `trust_remote_code=True`, alimentarlo con las estadisticas de normalizacion incluidas y ejecutar la politica en un banco de pruebas con pinza y cesta verde para reproducir el resultado del paso 100.000. Es adecuado porque el repositorio incluye todas las piezas del pipeline original, no solo los pesos.
- Base para ajuste fino con LoRA en una tarea nueva: al distribuirse el adaptador LoRA y el action head por separado, se puede reentrenar el adaptador sobre demostraciones propias manteniendo congelado el backbone, con un coste de computo muy inferior al de un VLA de 7B.
- Banco de evaluacion de politicas: usar este checkpoint como referencia de "VLA de escala pequena entrenado con 100 demostraciones" y comparar tasas de exito frente a otros checkpoints del mismo autor (por ejemplo, las variantes bottle-10k o pick_balls-30k) para estudiar el efecto del numero de pasos de entrenamiento.
- Prototipado en robotica educativa o de laboratorio con presupuesto de GPU limitado: 1,25B parametros permiten iterar en una unica GPU de gama consumer, algo inviable con VLA de 7B en FP16.
- Generacion de datos sinteticos de trayectorias: ejecutar la politica en simulacion para producir rollouts etiquetados que alimenten un entrenamiento posterior o un filtrado de datos.
- Estudio de sim-to-real y de robustez perceptiva: evaluar como degrada la politica al cambiar iluminacion, color de las pelotas o posicion de la cesta, usando el checkpoint como linea base congelada.
- Demostracion tecnica de arquitectura VLA completa en docencia o divulgacion: el repositorio expone de forma separable backbone adaptado, cabeza de accion y proyector de propiocepcion, lo que facilita explicar cada componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, ni metricas de manipulacion, ni evaluaciones tipo MMLU, HumanEval o GSM8K (que, por otra parte, no serian pertinentes para un modelo de accion). El articulo arXiv 2509.09372 si presenta resultados del paradigma VLA-Adapter, pero sus cifras no forman parte de la informacion proporcionada y no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia en la precision original: alrededor de 2,5 GB solo para pesos en FP16/BF16; con el codigo visual, el action head, el proyector de propiocepcion y las activaciones, un presupuesto realista se situa en el rango de 4 a 8 GB.
- En cuantizacion int8 el peso de los parametros baja a aproximadamente 1,3 GB; en int4, a unos 0,7 GB, con el consiguiente impacto en la precision de las acciones (no hay valores medidos publicados).
- Cabe en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 cubren la inferencia en FP16 con margen; tambien en GPUs de 8 GB con cuantizacion.
- GPU de centro de datos (A100, H100, L40S) sobredimensionadas para inferencia, utiles solo para reentrenamiento o para ejecutar muchos rollouts en paralelo.
- Opciones de despliegue: la via documentada es transformers con codigo personalizado (`trust_remote_code=True`) y los ficheros de procesador incluidos. No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama; la publicacion es solo en safetensors, sin GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,25B, la latencia por paso de control deberia ser baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| vla-adapter-pick_balls-100k | 1,25B | No disponible | VLA-Adapter con LoRA y action head, tarea unica | No disponible | No publicados |
| vla-adapter-bottle-10k (mismo autor) | No disponible | No disponible | VLA-Adapter, tarea bottle, paso 10.000 | No disponible | No publicados |
| pi0-wash_dish_50-10k (mismo autor) | No disponible | No disponible | Politica VLA sobre backbone pi0, tarea wash_dish | No disponible | No publicados |
| OpenVLA (referencia del ecosistema, segun la etiqueta del repo) | No disponible en la informacion proporcionada | No disponible | VLA de proposito general | No disponible | No disponibles aqui |

La comparacion cuantitativa no es posible con los datos disponibles: no hay metricas publicadas para este checkpoint ni cifras verificables de las alternativas en la informacion proporcionada. La diferencia observable mas clara es de escala (1,25B frente a VLA de 3B a 7B habituales) y de alcance (tarea unica frente a politicas generalistas).

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada exclusivamente para pick_balls con una instruccion concreta; no se espera generalizacion a otros objetos, contenedores o instrucciones.
- Entrenado con solo 100 demostraciones, lo que limita la diversidad de posiciones, iluminacion y configuraciones vistas y favorece el sobreajuste al entorno de recogida de datos.
- No se declara licencia en la model card: no hay base explicita para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: como toda politica por imitacion, puede producir trayectorias seguras para el modelo pero fisicamente invalidas cuando el estado se sale de la distribucion de entrenamiento.
- Requiere codigo personalizado (`custom_code`) para cargarse, lo que implica revisar el codigo remoto antes de ejecutarlo y fijar la revision del repositorio para reproducibilidad.
- Dependencia de las estadisticas de normalizacion incluidas: usarlas con otra configuracion de robot o de camara invalida las acciones generadas.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento multilingue; la unica instruccion documentada esta en ingles.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito que respalde su uso en produccion.
- Metadatos incompletos (0 descargas, 1 like, actualizacion en octubre de 2026): no existe validacion por parte de la comunidad.
- Ausencia de formatos cuantizados oficiales: cualquier despliegue en int8/int4 requeriria conversion propia y validacion empirica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/vla-adapter-pick_balls-100k
- Perfil del autor: https://huggingface.co/dddddsds31341
- Checkpoint relacionado (bottle, paso 10.000): https://huggingface.co/dddddsds31341/vla-adapter-bottle-10k
- Repositorio del paradigma VLA-Adapter: https://github.com/OpenHelix-Team/VLA-Adapter
- Articulo "VLA-Adapter: An Effective Paradigm for Tiny-Scale Vision-Language-Action Model": https://arxiv.org/html/2509.09372v2
- Ficha de la variante de 30.000 pasos: https://free2aitools.com/model/dddddsds31341/vla-adapter-pick_balls-30k
