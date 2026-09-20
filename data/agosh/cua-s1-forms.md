# agosh/cua-s1-forms

## Resumen
cua-s1-forms es un modelo de "System One" (un solo paso, sin generación autorregresiva) desarrollado por el usuario agosh y publicado en HuggingFace. Su función concreta es actuar como capa de decisión para el rellenado automático de formularios en interfaces gráficas: recibe un elemento de UI (contexto) y una lista de opciones tipadas —una por cada entidad extraída del documento, más las acciones fijas `check`, `click` y `skip`— y devuelve una probabilidad por opción en un único forward pass, replicando el contrato de entrada/salida de los modelos Jev de TypeSafe.

La relevancia del modelo está en su tamaño y su enfoque: con 706.048 parámetros y un checkpoint de 2,8 MB no compite con un LLM, sino que sustituye la llamada a un modelo generativo hospedado por un scorer local que decide campo a campo. Cada elemento accionable de un formulario se puntúa de forma independiente y en paralelo dentro de un mismo lote, y es el código posterior (no el modelo) el que decide el orden de ejecución: primero los `fill`, después los `check` y finalmente el único `click` de envío. Está pensado para integrarse detrás de cua-driver, dentro del proyecto trycua/cua.

El modelo se apoya en un encoder Transformer a nivel de byte (2 capas, anchura 128, 4 cabezas) que procesa por separado el contexto y el texto de cada opción, más un `AttentionHead` de estilo jevlike que convierte cada par (opción, contexto atendido) en un logit. Se distribuye bajo licencia MIT, no declara idiomas soportados y su card indica explícitamente que es un checkpoint de investigación independiente, no una reproducción de Jev.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder a nivel de byte de 2 capas (anchura 128, 4 cabezas) sobre contexto y opciones, con `AttentionHead` tipo jevlike y softmax sobre el numero de opciones vivas |
| Parametros totales | 706.048 parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Contexto truncado a 224 bytes por elemento; cada opcion truncada a 96 bytes |
| Tipos de cuantizacion | no disponible (checkpoint de 2,8 MB en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (encoder a nivel de byte, vocabulario de etiquetas centrado en ingles segun las limitaciones declaradas) |
| Licencia | MIT |
| Formato de pesos | `cua-s1-forms.safetensors` + sidecar JSON `cua-s1-forms.json` (formato recomendado, con firma SHA-256 de los tensores); tambien `cua-s1-forms.pt` (pickle de PyTorch original, solo para carga directa con `torch.load(..., weights_only=False)`) |

Otros datos: pipeline declarado como `other`, tamano del repositorio 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 19 de septiembre de 2026. Etiquetas: `jev`, `system-one`, `computer-use`, `form-filling`, `option-attention`.

## Arquitectura y entrenamiento
La arquitectura no es un LLM generativo. El contexto de cada elemento (tarea, nombre y titulo del formulario, descripcion del elemento y su valor actual) se codifica a nivel de byte con un embedding y un encoder Transformer de 2 capas; el texto de cada opcion se codifica por separado con la misma estructura. Despues, cada opcion actua como query frente a los tokens de contexto mediante el `AttentionHead` de jevlike, generando un vector de contexto atendido; un producto escalar compartido convierte cada par (opcion, contexto atendido) en un unico logit y un softmax sobre el numero de opciones vivas produce la distribucion final. La salida es una probabilidad por opcion, no texto.

El entrenamiento se realizo sobre 10.000 episodios sinteticos generados con `cua_s1/synth.py`: formularios aleatorios de 2 a 16 campos extraidos de un catalogo de 55 conceptos con sinonimos entre etiqueta de formulario y etiqueta de documento, persona aleatoria, documento aleatorio con entidades distractoras y pares confusores forzados del tipo `email` frente a `street`, `phone` frente a `emergency contact phone` o `state` frente a `university`, sufijos aleatorios en el titulo de la ventana y un 20% de dropout de titulo. Los splits son disjuntos por firma exacta de campos del formulario, de modo que el conjunto de campos de un formulario de test nunca aparece en entrenamiento. Se optimizo con AdamW y schedule coseno con warmup, 6 epocas, tamano de lote 128 y entropia cruzada sobre el numero de opciones vivas. No se menciona RLHF ni DPO; la card indica explicitamente que el modelo no esta calibrado con el metodo RLCD de TypeSafe.

En la ejecucion, el planificador toma el argmax, resuelve la entidad por indice cuando la accion es `fill` y ordena las acciones resultantes antes de enviarlas a cua-driver como `set_value` o `click`.

## Capacidades
- Puntuacion de opciones en un solo paso: devuelve una probabilidad por opcion para un elemento de UI, sin generacion de texto.
- Decision de accion sobre formularios: discrimina entre `fill`, `check`, `click` y `skip`.
- Seleccion de entidad por campo: elige, entre las entidades extraidas de un documento, la que corresponde al campo del formulario.
- Reconocimiento de campos ya rellenados como no-op (convencion sobre la que fue entrenado explicitamente).
- Puntuacion por lotes: todos los elementos accionables de un formulario se evaluan de forma independiente y en paralelo en un mismo lote.
- Manejo de distractores y pares confusores: entrenado con entidades señuelo y con pares de etiquetas deliberadamente parecidas.
- Integracion con computer use: se conecta a cua-driver mediante el bucle snapshot, score, order y execute de `cua_s1/planner.py`.
- No soporta tool calling en el sentido de un LLM, ni agentes multi-turno por si mismo: el razonamiento multi-paso y el orden de ejecucion recaen en el codigo circundante.
- Sin capacidades de vision, audio ni generacion de lenguaje natural.

## Casos de uso
- Rellenado automatico de formularios web de registro: el scorer puntua cada campo visible contra las entidades del documento y propone la accion y el valor; el orden final lo decide el orquestador, lo que evita envios prematuros.
- Admision de pacientes en portales clinicos: el escenario de la propia card (Northwind Clinic, campo "Phone number", valor `Tel: (503) 555-0142`) encaja con formularios donde la etiqueta del formulario no coincide literalmente con la del documento, algo cubierto por los sinonimos del catalogo de entrenamiento.
- Extraccion y volcado de PDFs a formularios: al operar sobre pares ya extraidos como `Label: value`, el modelo puede conectar un PDF extraido con el formulario destino sin generar valores nuevos.
- Automatizacion RPA con computer use: se integra como capa de decision de bajo coste detras de cua-driver, sustituyendo llamadas a un modelo hospedado por un forward pass local.
- Verificacion de estado de formularios en QA: la capacidad de marcar como no-op un campo ya rellenado es util para pruebas de regresion que comprueban que un formulario no se rellena dos veces ni se envia por duplicado.
- Reclamaciones y tramites de seguros: rellenado de formularios administrativos a partir de documentacion escaneada, donde el coste por decision importa y el volumen de campos es alto.
- Onboarding de empleados y formularios internos: prellenado de datos de persona (nombre, contacto, direccion, identificadores) en flujos de RRHH con campos recurrentes.
- Asistencia de accesibilidad: ayuda a usuarios con dificultades motoras o cognitivas a completar formularios largos, dejando la confirmacion final y el envio al codigo o al usuario.
- Prellenado de checkout en comercio electronico: seleccion de direccion y datos de contacto entre las entidades conocidas del usuario, discriminando entre variantes parecidas como direccion de envio y de facturacion.

## Benchmarks y rendimiento
| Evaluacion | Top-1 | Notas |
|---|---:|---|
| Test sintetico (form-disjoint, ~15.000 decisiones) | 99,95% | pares confusores duros forzados en los datos |
| Eval real de demo (3 formularios reales + 3 PDFs reales, 196 decisiones) | 100% | nada sintetico |
| Control con contexto barajado | 37% | confirma que el modelo lee el elemento y no estadisticas de opciones |
| cua-s1-forms frente a Jev hospedado (`jev-latest`, sin fine-tuning, misma tarea) | 99,7% vs 83,6% | comparativa global |
| Jev hospedado en decisiones que requieren juicio (fill vs check vs click) | 96% | frente a este modelo, que gana el computo global |
| Jev hospedado reconociendo un campo ya rellenado (no-op) | 74% | convencion no incluida en el entrenamiento de Jev hospedado |

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible; no son aplicables a un scorer de opciones que no genera texto. El desglose completo de resultados se encuentra en `docs/RESULTS.md` del repositorio.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 10 MB para pesos y estado; cualquier GPU con unos pocos megabytes libres sirve, e incluso CPU sin GPU dedicada.
- GPU recomendadas: ninguna en particular. A100, H100 o RTX 4090 no aportan ventaja relevante por potencia de calculo para un modelo de 706.048 parametros; su unico beneficio seria agrupar muchas peticiones en lote.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPU integrada o en CPU; el cuello de botella no es el modelo.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, porque no es un LLM autorregresivo con tokenizer estandar ni se publica en GGUF. La via soportada es la carga con `cua_s1.model.load_checkpoint` (PyTorch) validando formato, version y firma SHA-256 de los tensores, e integracion a traves de `cua_s1/planner.py` contra una sesion de cua-driver.
- Latencia y throughput: no disponibles de forma publicada. Por construccion, la inferencia es un unico forward pass sobre 706.048 parametros con contexto truncado a 224 bytes y opciones a 96 bytes, y el scoring de todos los elementos de un formulario se realiza en un solo lote, por lo que el coste por decision es muy inferior al de una llamada a un LLM generativo.

## Comparativa con modelos similares
| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cua-s1-forms | Scorer de opciones System One, no generativo | 706.048 | 224 bytes de contexto por elemento; 96 bytes por opcion | 99,7% top-1 frente a Jev hospedado; 99,95% en test sintetico; 100% en eval de demo (196 decisiones) | MIT | HuggingFace (`agosh/cua-s1-forms`) y repositorio trycua/cua |
| Jev hospedado (`jev-latest`, TypeSafe) | Modelo System One propietario, hospedado | no disponible | no disponible | 83,6% global; 96% en decisiones de juicio; 74% en no-ops de campo ya rellenado | propietaria, acceso via API | API hospedada de TypeSafe |
| Agentes GUI multimodales generativos (familia de modelos de computer use basados en LLM) | LLM/VLM autorregresivo con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion disponible se limita al Jev hospedado, sobre el que la card ofrece numeros de una prueba cara a cara sin fine-tuning. Para alternativas generativas de computer use no se han proporcionado parametros, contexto ni resultados, por lo que no se incluyen cifras.

## Limitaciones y advertencias
- Solo elige entre entidades que un extractor de PDF o documento ya ha identificado como pares `Label: value`; no puede inventar un valor que no exista en esa lista.
- Entrenado integramente con formularios sinteticos y evaluado con solo 196 decisiones reales; no esta validado en formularios reales fuera del conjunto de demo, por lo que el 100% de la eval de demo no debe extrapolarse.
- Encoder a nivel de byte con vocabulario de etiquetas centrado en ingles; no se declaran idiomas soportados y el rendimiento en formularios en castellano u otros idiomas no esta documentado.
- Ventana de contexto muy reducida: 224 bytes de contexto y 96 bytes por opcion, lo que limita el uso en formularios con etiquetas o valores largos.
- No esta calibrado con el metodo RLCD de TypeSafe y no es una reproduccion de Jev; es un checkpoint de investigacion independiente.
- El modelo no decide el orden de ejecucion ni el envio: esa logica vive en el codigo que lo rodea, de modo que un orquestador mal implementado puede producir rellenos o envios incorrectos.
- Riesgo de seleccion erronea de entidad: los pares confusores del entrenamiento reducen el problema, pero un par no previsto (por ejemplo, dos etiquetas casi identicas en el documento) puede inducir un error. El control con contexto barajado (37% top-1) muestra que la decision depende del contexto, pero tambien que existe una fraccion de acierto atribuible a estadisticas de opciones.
- El fichero `cua-s1-forms.pt` es un pickle de PyTorch: cargarlo con `weights_only=False` implica riesgo de ejecucion de codigo. El propio proyecto rechaza ese formato por diseño y recomienda el par safetensors + JSON.
- Discrepancia de identificador en la documentacion: el ejemplo de uso de la model card apunta a `cua-ai/cua-s1-forms`, mientras que el repositorio consultado es `agosh/cua-s1-forms`; conviene verificar la ruta antes de integrar.
- Repositorio sin descargas ni likes y creado y actualizado el mismo dia, sin historial posterior de mantenimiento ni versionado conocido.
- Licencia MIT: permite uso comercial y modificacion, pero se distribuye sin garantias y sin soporte.
- No soporta tool calling, agentes multi-turno ni generacion de lenguaje natural, por lo que no debe evaluarse como un LLM generalista.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/agosh/cua-s1-forms
- Repositorio cua-s1 (codigo de entrenamiento, generador de datos sinteticos, writeup y `docs/RESULTS.md`): https://github.com/trycua/cua/tree/main/libs/cua-s1
- Planificador y bucle snapshot, score, order, execute: https://github.com/trycua/cua/tree/main/libs/cua-s1/python/src/cua_s1/planner.py
- cua-driver (capa de ejecucion): https://github.com/trycua/cua/tree/main/libs/cua-driver
- Presentacion de los modelos System One y Jev (TypeSafe): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Resultados de la busqueda web: sin resultados relevantes para este modelo (los enlaces devueltos corresponden a contenidos no relacionados).
