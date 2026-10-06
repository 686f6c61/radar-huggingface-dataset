# Shorx/DCA-01

## Resumen

DCA-01 (Deterministic Cluster Architecture) es una especificación de infraestructura de IA publicada por Emanuel Schaaf bajo el identificador `Shorx/DCA-01` en HuggingFace. No se trata de un modelo de lenguaje con pesos descargables, sino de un dossier de arquitectura listo para implementar que propone sustituir el modelo monolítico por un cluster de modelos expertos físicamente separados y especializados por dominio, coordinados mediante un bus de datos determinista. El repositorio ocupa 0,0 GB, no registra descargas ni likes y su pipeline no está declarado.

La propuesta toma prestados tres patrones de la ingeniería industrial: la fabricación just-in-sequence del sector automovilístico, la redundancia modular triple (TMR) de la aviónica y el bus CAN con principio LRU (least recently used). El principio central es que la transferencia de conocimiento no ocurre mezclando pesos, sino mediante intercambio de datos tipados sobre un Shared Context Board o blackboard.

Su relevancia actual se apoya en tres argumentos declarados por el autor: autoptimización mediante LoRA local por módulo sin reentrenamiento global, ausencia de olvido catastrófico al mantener pesos aislados, y auditabilidad por diseño (dag_id, model_hash y provenance en cada ruta) orientada al cumplimiento del Reglamento Europeo de IA. La versión publicada es la 1.2 COMPLETE DOSSIER, con estado declarado "implementable", licencia MIT y documentación en alemán e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cluster determinista de expertos aislados con router TMR (2-de-3), descomposicion en DAG, blackboard semantico y capa de fusion; no es un transformer unico |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion se ofrece en aleman e ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene esquemas JSON, codigo fuente y documentacion; tamano 0,0 GB) |
| Version | 1.2 COMPLETE DOSSIER |
| Autor | Emanuel Schaaf (cuenta Shorx) |
| Estado declarado | Implementable |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El flujo definido en la especificación es el siguiente: una peticion de usuario entra en un router TMR con votacion 2-de-3, pasa a un descomponedor de tareas que genera un DAG, y este se publica en un bus semantico o blackboard inspirado en el bus CAN de automocion. Los expertos de dominio —fisica/HPC, codigo/GPU media y lenguaje/CPU— consumen tareas del blackboard y devuelven una salida formal `E_i(T_i) = (y_i, c_i, t_i, model_hash, provenance)`, donde `c_i` es una confianza calibrada. La capa de fusion aplica una comprobacion de delta (`delta = |c_physics - c_code|`), verificacion de tipos y verificacion de unidades; si falla, vuelve a ejecutar unicamente el modulo afectado con un maximo de 3 iteraciones. La respuesta final se entrega junto a un log de auditoria y trazas de procedencia.

En cuanto al entrenamiento, la especificacion no describe un dataset ni un numero de tokens. El mecanismo previsto es de autoptimizacion local: cada modulo aprende de sus propios fallos mediante LoRA sobre sus pesos, sin reentrenamiento global y sin mezcla de pesos entre dominios, lo que segun el autor evita el olvido catastrofico. No se documentan fases de RLHF, DPO ni procesos de alineacion, y tampoco se especifican las innovaciones de inferencia a nivel de atencion o decodificacion. El repositorio incluye observabilidad con metricas Prometheus y trazas OpenTelemetry, ademas de un MVP de arranque rapido con `docker-compose up --build` que levanta 1 router y 2 expertos sobre un blackboard en memoria.

## Capacidades

- Descomposicion de peticiones en un grafo aciclico dirigido (DAG) de tareas, con nodos tipados segun los esquemas JSON del repositorio.
- Enrutado tolerante a fallos mediante redundancia modular triple con votacion 2-de-3 entre los routers A, B y C.
- Intercambio de contexto entre modulos a traves de un blackboard de publicacion/suscripcion, en lugar de compartir pesos.
- Ejecucion de expertos de dominio aislados: fisica/HPC, codigo/GPU media y lenguaje/CPU.
- Fusion determinista con comprobacion de delta de confianza, verificacion de tipos y verificacion de unidades, con reejeccion acotada a 3 iteraciones.
- Trazabilidad completa por respuesta: dag_id, model_hash y provenance en cada ruta, orientada a auditoria regulatoria.
- Automejora por modulo mediante LoRA local a partir de fallos registrados.
- Observabilidad nativa mediante metricas Prometheus y trazas OpenTelemetry.
- Soporte de tool calling, function calling, agentes multi-paso, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Simulacion fisica verificada: el experto de fisica/HPC produce el resultado numerico y la capa de fusion aplica `unit_check` antes de devolver la respuesta, de modo que un calculo con unidades incoherentes se rechaza y se reejecuta unicamente ese modulo.
- Generacion de codigo con verificacion cruzada: el experto de codigo resuelve la tarea y la fusion comprueba tipos y coherencia con el resto del DAG, lo que permite integrar la salida en pipelines de CI/CD con una puerta de validacion determinista.
- Cumplimiento del Reglamento Europeo de IA: al registrar dag_id, model_hash y provenance en cada ruta, un sistema construido sobre DCA-01 puede reconstruir la cadena de decision completa de cada respuesta para una auditoria externa.
- Sistemas de alta criticidad en avionica o automocion: el patron TMR 2-de-3 permite que la caida o el resultado divergente de un router no interrumpa el servicio, siguiendo el modelo de redundancia modular triple ya validado en esos sectores.
- Investigacion sobre fiabilidad de LLM: la especificacion permite comparar experimentalmente un despliegue monolitico frente a un cluster de expertos aislados en terminos de olvido catastrofico, consumo de recursos y trazabilidad.
- Formacion y prototipado de arquitecturas multi-agente: el MVP con `docker-compose` y un blackboard en memoria sirve como banco de pruebas docente para estudiar orquestacion, votacion y fusion determinista sin coste de GPU elevado.
- Despliegue por dominio en infraestructura heterogenea: al separar los expertos, cada modulo puede residir en el hardware que le corresponde (CPU para lenguaje, GPU media para codigo, HPC para fisica) y escalarse de forma independiente.
- Mantenimiento incremental de conocimiento: cuando un dominio cambia, se reentrena solo su LoRA local, sin tocar el resto del cluster ni asumir el coste de un reentrenamiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el repositorio no contiene pesos sobre los que ejecutar una medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no existir pesos publicados, el consumo depende por completo de los modelos base que se elijan como expertos, dato que la especificacion no fija.
- GPU recomendadas: no disponible. La especificacion sugiere un reparto por perfil (fisica/HPC, codigo/GPU media, lenguaje/CPU), pero no concreta modelos de tarjeta.
- Compatibilidad con GPU de consumo: no disponible. El MVP descrito (1 router, 2 expertos y blackboard en memoria, levantado con `docker-compose`) esta pensado para ejecutarse en un entorno de desarrollo sin requisitos de acelerador declarados.
- Opciones de despliegue: `docker-compose` para el MVP. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponible. Solo se afirma de forma cualitativa que solo se activan los expertos relevantes y que la inferencia es paralela.
- Observabilidad: metricas Prometheus y trazas OpenTelemetry integradas en el diseno.

## Comparativa con modelos similares

No disponible. DCA-01 no es un modelo de pesos con el que comparar parametros, contexto o licencia, y la informacion proporcionada no incluye cifras frente a alternativas. Sus analogias conceptuales mas cercanas serian las arquitecturas de mezcla de expertos (MoE) y los frameworks de orquestacion multi-agente, pero no se aportan datos medidos que permitan una comparacion rigurosa.

| Criterio | DCA-01 | Alternativas comparables |
|---|---|---|
| Parametros totales | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks | no publicado | no disponible |
| Licencia | MIT | no disponible |
| Artefactos descargables | esquemas, codigo y documentacion (0,0 GB) | no disponible |

## Limitaciones y advertencias

- No es un modelo entrenado: es una especificacion de arquitectura. No existen pesos, tokenizador ni checkpoint que puedan cargarse con `transformers`, vLLM o llama.cpp.
- El repositorio registra 0 descargas y 0 likes, y no consta validacion independiente ni implementacion de referencia completa mas alla del MVP descrito.
- No hay resultados de benchmarks ni evaluaciones publicadas que respalden las afirmaciones de mayor precision, velocidad o menor coste de entrenamiento.
- La model card no especifica idiomas soportados, longitud de contexto, tipos de cuantizacion ni formato de pesos, por lo que no es posible dimensionar un despliegue en produccion con los datos disponibles.
- Las fechas del repositorio (creacion y actualizacion en octubre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia real del artefacto antes de citarlo.
- La documentacion principal se ofrece en aleman e ingles; no se anuncia version en castellano.
- La afirmacion de "listo para el Reglamento Europeo de IA" es una declaracion del autor: el registro de provenance es una condicion necesaria, pero no equivale por si mismo a conformidad regulatoria.
- Riesgo de alucinacion: no evaluable. Depende de los modelos base que se asignen a cada experto, ninguno de los cuales se concreta.
- La licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, pero al no distribuirse artefactos de modelo, la licencia cubre unicamente el codigo y la documentacion del repositorio.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de equidad.
- La tolerancia a fallos depende de que los tres routers se ejecuten realmente de forma independiente; si comparten el mismo modelo subyacente, la votacion 2-de-3 pierde su valor como mecanismo de diversidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shorx/DCA-01
- Dossier completo: https://huggingface.co/Shorx/DCA-01/blob/main/DCA-01-COMPLETE_EN.md
- PDF de arquitectura: https://huggingface.co/Shorx/DCA-01/blob/main/docs/DCA-01-Deterministic_Cluster_Architecture.pdf
- README en aleman: https://huggingface.co/Shorx/DCA-01/blob/main/README_DE.md
- Licencia MIT: https://huggingface.co/Shorx/DCA-01/blob/main/LICENSE
- Contacto del autor: https://huggingface.co/Shorx/DCA-01/blob/main/CONTACT.md
- Diagrama de arquitectura (imagen alojada en GitHub): https://github.com/user-attachments/assets/5b59884d-b718-4647-8bf4-aaf88812fd56
