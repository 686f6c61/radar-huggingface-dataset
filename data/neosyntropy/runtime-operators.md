# Neosyntropy/runtime-operators

## Resumen

Neosyntropy Runtime Operators es una familia experimental de modelos planteada para operar dentro de un grafo de estados propiedad de la aplicacion, no como un modelo generico de proposito general. El autor, Neosyntropy, propone que modelos pequenos y especializados pueden convertirse en trabajadores fiables de ingenieria de software si se entrenan para operadores de maquina de estados estrechos y se ejecutan bajo el control de la aplicacion, que decide que acciones son legales, que evidencia se exige y cuando una tarea esta completa. El lema del proyecto es explicito: "Overfit the graph, not the benchmark".

El repositorio es, en el momento de su publicacion, una tarjeta de investigacion y una especificacion de evaluacion: no contiene pesos entrenados ni realiza afirmaciones de rendimiento en benchmarks. La familia se compone de seis roles diferenciados (Runtime Structure, Runtime Route, Runtime Deterministic Reasoning, Runtime Stochastic Reasoning, Runtime Guard y Runtime Score), mas un adaptador unificado de operadores previsto que condiciona esos roles mediante tokens explicitos como `<OPERATOR:UNDERSTAND>`, `<OPERATOR:PROPOSE>` y `<OPERATOR:REPAIR>`. La ejecucion, la legalidad de transiciones, los commits de estado y los efectos secundarios quedan del lado de NeoSyntropy, no del modelo.

La relevancia actual del proyecto es conceptual y de diseno mas que de resultados: plantea una separacion estricta entre propuesta (modelo) y decision (grafo de la aplicacion), con salidas restringidas por esquema. No se publican datos de tamano, contexto, idiomas ni licencia, por lo que su evaluacion practica todavia no es posible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se describe una familia de operadores aprendidos con salidas restringidas por esquema, integrados en un grafo de estados propiedad de la aplicacion |
| Parametros totales | No disponible (el repositorio no contiene pesos entrenados) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (no se publican pesos; se menciona un adaptador LoRA planificado mediante la etiqueta `lora`) |

## Arquitectura y entrenamiento

La especificacion describe un grafo dirigido de nodos con responsabilidades acotadas: RETRIEVE, UNDERSTAND, DECOMPOSE, PROPOSE, OBSERVE, VERIFY, REPAIR, EXECUTE y SUCCESS, con transiciones gobernadas por senales declaradas (`CONTINUE`, `NEED_INFORMATION`, `EXECUTED`, `FAILED_TEST`, `WRONG_PLAN`, `MEMORY_PRESSURE`, `COMPLETE`). Los nodos aprendidos se implementan como `SchemaNode` con esquemas Pydantic estrictos (`extra="forbid"`), de modo que la salida del modelo debe encajar en una estructura valida antes de que el grafo continue. La ejecucion y la verificacion permanecen en manejadores Python de confianza, con tres integraciones de herramienta nombradas: `search_repository`, `apply_plan` y `run_tests`.

La familia se reparte en seis roles: Runtime Structure convierte observaciones en esquemas propiedad de la aplicacion; Runtime Route propone el siguiente nodo legal entre candidatos declarados; Runtime Deterministic Reasoning realiza un paso de razonamiento acotado y declara llamadas a herramientas; Runtime Stochastic Reasoning genera planes o reparaciones alternativas dentro de un espacio de busqueda permitido; Runtime Guard valida afirmaciones contra reglas, tests y evidencia aportada; y Runtime Score produce mediciones ancladas a rubrica para evaluacion y seleccion. No se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La model card indica que el repositorio no incluye pesos entrenados y que no se hacen afirmaciones de rendimiento en benchmarks.

## Capacidades

- Conversion de observaciones a esquemas estructurados: el rol Runtime Structure transforma entradas en salidas conformes a esquemas Pydantic estrictos.
- Enrutado de estado: el rol Runtime Route propone el siguiente nodo legal a partir de una lista de candidatos declarados por la aplicacion.
- Razonamiento acotado y declaracion de llamadas a herramientas: el rol Runtime Deterministic Reasoning produce un paso de razonamiento limitado y explicita las herramientas a invocar.
- Generacion de planes alternativos y reparaciones: el rol Runtime Stochastic Reasoning explora alternativas dentro de un espacio de busqueda permitido.
- Verificacion de afirmaciones: el rol Runtime Guard contrasta afirmaciones contra reglas, tests y evidencia suministrada.
- Medicion con rubrica: el rol Runtime Score genera puntuaciones ancladas a criterios para evaluacion y seleccion.
- Condicionamiento por operador: el adaptador unificado previsto usa tokens como `<OPERATOR:UNDERSTAND>`, `<OPERATOR:PROPOSE>` y `<OPERATOR:REPAIR>`.
- Salidas restringidas por esquema y rechazo de campos extra (`extra="forbid"`), orientadas a flujos de trabajo agenticos con tool use.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.

## Casos de uso

Nota: todas las aplicaciones siguientes se derivan de la especificacion del proyecto. Dado que no se publican pesos ni resultados, son escenarios de diseno, no capacidades verificadas.

- Agentes de resolucion de incidencias (SWE): el grafo UNDERSTAND -> DECOMPOSE -> RETRIEVE -> PROPOSE permite leer un issue de repositorio, extraer requisitos explicitos, descomponerlo en un arbol de tareas y proponer un plan, con la aplicacion controlando que acciones son legales en cada transicion.
- Ejecucion controlada de cambios en repositorios: la integracion `apply_plan` ejecutaria los cambios propuestos y el nodo OBSERVE recogeria resultados y errores, separando la propuesta del modelo de la mutacion real del codigo.
- Verificacion automatizada de parches: `run_tests` alimentaria el nodo VERIFY, que emite senales como `FAILED_TEST` o `COMPLETE`; el rol Runtime Guard validaria que las afirmaciones del modelo esten respaldadas por evidencia suministrada y no por texto generado.
- Reparacion iterativa de planes erroneos: la senal `WRONG_PLAN` activaria el nodo REPAIR, apoyado en el rol Runtime Stochastic Reasoning para generar alternativas dentro de un espacio de busqueda acotado.
- Recuperacion de contexto de repositorio: `search_repository` en el nodo RETRIEVE cubriria el bucle de necesidad de informacion (`NEED_INFORMATION`), acotando las busquedas mediante consultas declaradas en el esquema de descomposicion.
- Evaluacion y seleccion de candidatos: el rol Runtime Score produciria mediciones ancladas a rubrica para comparar planes o variantes y decidir cual se ejecuta.
- Compresion de historial bajo presion de memoria: la senal `MEMORY_PRESSURE` y el esquema `CompressOutput` permitirian resumir observaciones, errores e historial cuando el contexto del grafo se satura.
- Control de salidas en pipelines con validacion estricta: al exigir esquemas Pydantic con `extra="forbid"`, el modelo encajaria en integraciones donde una salida malformada debe rechazarse antes de propagarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que el repositorio "does not contain trained weights or make benchmark-performance claims yet". La etiqueta `swe-bench` aparece en los tags del repositorio, pero no se aporta ninguna cifra ni metodologia de evaluacion asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros, ya que no se publican pesos).
- GPU recomendadas: no disponibles.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: la model card no menciona vLLM, llama.cpp, Ollama ni TGI. El unico componente de despliegue descrito es la libreria `neosyntropy`, que expone primitivas como `NodeContext`, `OpenInput`, `SchemaNode`, `TextOutput` y `node`, e integra esquemas Pydantic y manejadores Python de confianza.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y el repositorio no publica parametros, contexto, rendimiento ni licencia que permitan establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Estado del proyecto: es una tarjeta de investigacion y especificacion de evaluacion; no contiene pesos entrenados ni artefactos listos para inferencia.
- Ausencia de evidencia empirica: no hay resultados de benchmarks, ablaciones ni metricas publicadas, por lo que no puede validarse ninguna afirmacion de rendimiento.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial ni condiciones de redistribucion. Es un bloqueo para produccion hasta que el autor la especifique.
- Idiomas no declarados: se desconoce el soporte multilingue.
- Dependencia del grafo: el comportamiento fiable depende de que la aplicacion controle la legalidad de transiciones, los commits de estado y los efectos secundarios; fuera de ese entorno, las garantias descritas no aplican.
- Riesgo de alucinacion: el rol Runtime Guard y la validacion por esquema mitigan afirmaciones sin evidencia, pero no eliminan el riesgo de que el modelo proponga acciones o reparaciones incorrectas.
- Salidas estrictas: los esquemas con `extra="forbid"` implican que cualquier campo adicional invalida la salida, lo que exige versionado cuidadoso de esquemas en produccion.
- Cero adopcion observable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin senales de uso en comunidad.
- Fechas del repositorio: creado y actualizado el 2026-09-27, sin historial posterior disponible en la informacion consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neosyntropy/runtime-operators
- Runtime Structure: https://huggingface.co/Neosyntropy/runtime-structure
- Runtime Route: https://huggingface.co/Neosyntropy/runtime-route
- Runtime Deterministic Reasoning: https://huggingface.co/Neosyntropy/runtime-deterministic-reasoning
- Runtime Stochastic Reasoning: https://huggingface.co/Neosyntropy/runtime-stochastic-reasoning
- Runtime Guard: https://huggingface.co/Neosyntropy/runtime-guard
- Runtime Score: https://huggingface.co/Neosyntropy/runtime-score
