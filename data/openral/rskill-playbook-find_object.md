# OpenRAL/rskill-playbook-find_object

## Resumen

`rskill-playbook-find_object` es un componente del proyecto OpenRAL, el Robot Agentic Layer de codigo abierto para IA encarnada. A diferencia de un modelo neuronal convencional, no se trata de una red con pesos entrenados: es un *playbook* simbolico, un procedimiento de decision que el Reasoner del sistema lee e interpreta en tiempo de ejecucion. Concretamente, implementa la etapa S2 de decision para localizar un objeto nombrado cuando la peticion no proporciona su pose.

El playbook resuelve un problema recurrente en robotica de servicio: el usuario pide "traeme la botella de agua" sin indicar donde esta. El procedimiento compone herramientas que el robot ya posee (`recall_object`, `resolve_place`, `locate_in_view`, `execute_rskill`, `memory_search`) en una secuencia acotada: primero intenta recordar el objeto desde la memoria espacial; si falla, ejecuta una busqueda activa de sentido comun limitada (prioriza habitaciones y contenedores probables, navega, abre y mira); y si agota el presupuesto de busqueda, escala a un humano.

Su relevancia radica en el enfoque: separa el razonamiento de alto nivel del control de bajo nivel. El playbook no tiene autoridad de actuacion, no emite fragmentos de accion y es agnostico al cuerpo del robot (declara el comodin `embodiment_tags: ["any"]`). Toda la logica reside en un fichero `PLAYBOOK.md` legible y editable, lo que permite modificar el comportamiento sin reentrenar nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Procedimiento de decision simbolico (playbook); no es una red neuronal |
| Parametros totales | 0 (sin pesos; el runtime es `PLAYBOOK.md`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no hay pesos; manifiesto en YAML y contenido en Markdown) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. El componente es un *rSkill* de tipo `playbook` con rol `s2`, escrito a mano. Su manifiesto declara `actions: [plan]`, `chunk_size: 1`, `actuators_required: []` y un `playbook.max_steps` de 12. El disparador es que el objetivo nombre un objeto cuya ubicacion no se proporciona, y el predicado de finalizacion es que el objeto objetivo quede confirmado en vista a una pose conocida.

El funcionamiento consiste en la inyeccion del contenido de `PLAYBOOK.md` en el prompt de sistema del Reasoner, que sigue el procedimiento operativo estandar componiendo herramientas preexistentes. Cada movimiento que desencadena pasa por `execute_rskill` hacia un fragmento de accion y, finalmente, por un kernel de seguridad en C++; el playbook en si no tiene autoridad de actuacion. El autor indica que no existe procedencia de modelo upstream y que, para cambiar el comportamiento, basta editar `PLAYBOOK.md` e incrementar la version. No se dispone de datos sobre volumen de entrenamiento, composicion de dataset ni tecnicas de RLHF o DPO, porque no se entreno.

## Capacidades

- Localizacion de objetos nombrados sin pose proporcionada, mediante recuperacion desde memoria espacial.
- Busqueda activa de sentido comun acotada: priorizacion de habitaciones y contenedores probables, navegacion, apertura y observacion.
- Escalado a intervencion humana cuando se agota el presupuesto de busqueda.
- Composicion de herramientas del runtime: `recall_object`, `resolve_place`, `locate_in_view`, `execute_rskill` y `memory_search`.
- Planificacion simbolica de pasos acotada a un maximo de 12 iteraciones.
- Agnosticismo de encarnacion: funciona en cualquier robot que cumpla los requisitos de capacidades.
- Requiere la capacidad `has_vision: true`; el cargador descarta el playbook en robots sin camara.
- No soporta tool calling generativo propio, agentes neuronales ni razonamiento multi-paso aprendido: su "salida" es la secuencia de llamadas a herramientas que ejecuta el Reasoner.
- Sin capacidades de vision, audio o generacion de texto por si mismo.

## Casos de uso

- Asistencia domestica con objetos cotidianos: un robot de servicio recibe la orden "trae la botella de agua" sin coordenadas; el playbook consulta la memoria espacial, y si falla busca en cocina y nevera antes de rendirse. Es adecuado porque acota la busqueda y evita exploraciones indefinidas.
- Logistica de almacen: localizacion de un articulo cuyo contenedor no se especifica en la orden; el playbook prioriza estanterias y cajas plausibles y abre contenedores mediante las herramientas compuestas.
- Robots de reparto en entornos de oficina: cuando el destinatario pide un objeto de escritorio, el playbook resuelve la ubicacion probable y navega hasta ella, escalando a una persona si no lo encuentra en el presupuesto de 12 pasos.
- Prototipado de comportamientos de busqueda: al ser un fichero Markdown editable, un equipo puede ajustar heuristicas de priorizacion de habitaciones y contenedores sin reentrenar modelos ni tocar codigo del runtime.
- Integracion en pipelines de agentes roboticos con trazabilidad: cada paso queda registrado como llamada a herramienta, lo que facilita la auditoria del comportamiento en produccion.
- Despliegue en flotas heterogeneas: al declarar `embodiment_tags: ["any"]`, el mismo playbook se instala en brazos moviles, robots con base diferencial o plataformas humanoides, siempre que dispongan de camara.
- Evaluacion y ensenanza de arquitecturas de agentes fisicos: sirve como ejemplo de separacion entre razonamiento simbolico de alto nivel y control seguro de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que un playbook no produce una politica evaluable con benchmarks (`Evaluation: N/A`) y que no hay cifras que reproducir; las pruebas existentes son de empaquetado y validacion del manifiesto y del procedimiento operativo estandar. El unico dato de rendimiento declarado en el manifiesto es una latencia de referencia de 5000 ms y un runtime `pytorch` con `dtype: fp32`, sin VRAM minima especificada.

## Requisitos de hardware

- VRAM estimada: no disponible; el manifiesto declara `min_vram_gb: null` porque no hay pesos que cargar.
- GPU recomendadas: no aplica al playbook en si; el coste computacional recae en el Reasoner y en las herramientas compuestas del sistema OpenRAL.
- Cabe en cualquier GPU consumer: el componente no consume memoria de acelerador por si mismo.
- Opciones de despliegue: runtime OpenRAL con `openral_core`; el manifiesto se carga desde `rskills/find-object/rskill.yaml` mediante `RSkillManifest.from_yaml`.
- Latencia y throughput: latencia de referencia declarada de 5000 ms; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada playbooks o componentes equivalentes de otros proyectos con los que comparar parametros, contexto, rendimiento o licencia. La comparacion natural seria con otras politicas neuronales de navegacion y busqueda activa, pero no se dispone de datos de estas en el material consultado.

## Limitaciones y advertencias

- No es un modelo neuronal: no genera texto, no razona de forma generativa y no puede evaluarse con benchmarks estandar de LLM.
- Depende por completo de la calidad del Reasoner y de las herramientas compuestas; un fallo en `recall_object` o en la navegacion degrada todo el procedimiento.
- La busqueda activa esta acotada a 12 pasos; objetos en ubicaciones atipicas pueden agotar el presupuesto y forzar el escalado a un humano.
- Solo esta disponible en ingles; el contenido del playbook y su procedimiento operativo estandar estan redactados en ese idioma.
- Requiere robots con camara (`has_vision: true`); queda filtrado en plataformas sin vision.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el Reasoner que interpreta el playbook podria alucinar ubicaciones o estados si la memoria espacial contiene datos incorrectos.
- Sesgos: las heuristicas de "sentido comun" sobre donde suelen estar los objetos reflejan supuestos culturales del autor y pueden fallar en entornos no occidentales o domesticos atipicos.
- Licencia Apache-2.0 permisiva para uso comercial, sin pesos que restrinjan la redistribucion; el autor no declara caveats adicionales de licencia.
- Componente con cero descargas y cero likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-find_object
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/find-object/
- Repositorio principal de OpenRAL: https://github.com/OpenRAL/openral
