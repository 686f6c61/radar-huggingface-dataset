# mstrasser/jeff-adapter-action-check

## Resumen

jeff-adapter-action-check es un adaptador LoRA de tipo PEFT publicado por el usuario mstrasser sobre el modelo base jeff-base v1.4, un modelo de decisión de pequeno tamano (fine-tune de Qwen3.5-0.8B). El adaptador esta especializado en una unica tarea de clasificacion de texto: evaluar una llamada a herramienta (tool call) propuesta por un agente antes de ejecutarla, y decidir si se aprueba, se rechaza por incorrecta, se rechaza por insegura o se debe consultar al usuario. La salida es una distribucion de probabilidad calibrada sobre cuatro etiquetas en un solo forward pass, sin generacion de texto que parsear.

El modelo resuelve un problema concreto en el diseno de agentes: la verificacion de acciones con efectos secundarios (borrados, pagos, envios de datos personales) contra las instrucciones del usuario y las reglas de la aplicacion. En lugar de confiar en un LLM generativo para esta comprobacion, el adaptador produce probabilidades calibradas, lo que facilita umbrales de confianza y politicas de escalado deterministas.

Es relevante por su enfoque de bajo coste computacional: al apoyarse en un modelo base de 0.8B parametros con un adaptador LoRA, la verificacion puede ejecutarse en local o en infraestructura modesta, integrandose como paso previo en pipelines de agentes. La licencia es Apache 2.0 y el idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder jeff-base (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre el modelo base jeff-base en su revision v1.4, que el autor describe como un fine-tune de Qwen3.5-0.8B. La tarea es de clasificacion con eleccion entre opciones nombradas (choice), y el modelo devuelve una probabilidad calibrada para cada opcion en un unico forward pass, sin decodificacion autoregresiva. Esto elimina la necesidad de parsear texto generado y permite umbrales de confianza directos.

La entrada combina contexto estructurado (aplicacion, fecha, reglas, lista de personas, firmas de herramientas, conversacion y ultimo mensaje del usuario) con la llamada propuesta (nombre de herramienta y argumentos). El adaptador fue entrenado el 2026-10-25. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que las filas de evaluacion se conservaron solo cuando una comprobacion ciega con LLM coincidia con la etiqueta, lo que sugiere un proceso de filtrado de datos asistido por modelo.

## Capacidades

- Clasificacion de llamadas a herramienta en cuatro categorias: approve, ask_user, unsafe y wrong_action.
- Evaluacion de la llamada contra la peticion del usuario, la lista de personas conocidas y las reglas escritas de la aplicacion.
- Aplicacion de precedencia determinista entre etiquetas: unsafe tiene prioridad sobre ask_user, y este sobre wrong_action.
- Deteccion de valores incorrectos en argumentos (fecha, importe, registro, cantidad), herramienta equivocada, persona equivocada o parametros opcionales no solicitados.
- Deteccion de acciones destructivas o de pago no pedidas explicitamente y de envio de datos privados a destinatarios prohibidos por las reglas.
- Deteccion de detalles requeridos que el usuario nunca proporciono (valores inventados por el agente).
- Deteccion de acciones que requieren confirmacion explicita del usuario segun las reglas y que aun no la han obtenido.
- Salida con probabilidad calibrada por opcion, apta para politicas de umbral.
- No soporta correccion de argumentos: evalua la llamada propuesta sin modificarla.
- Soporte de tool calling: no como emisor, sino como verificador de llamadas propuestas por otros agentes.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Verificacion previa a la ejecucion en agentes con herramientas: antes de que el agente invoque una funcion que modifica datos, el adaptador clasifica la llamada contra la conversacion y las reglas, y el orquestador solo la ejecuta si la etiqueta es approve o si la probabilidad supera el umbral configurado.
- Pasarela de confirmacion para acciones destructivas: en flujos de borrado o cancelacion, el adaptador devuelve ask_user cuando la accion requiere confirmacion explicita segun las reglas, permitiendo insertar un paso de aprobacion humana de forma automatica.
- Proteccion de datos personales en envios: con la lista de personas y las reglas de la aplicacion como contexto, detecta envios de informacion privada a destinatarios no autorizados y los marca como unsafe antes de que salgan del sistema.
- Auditoria y registro de decisiones de agentes: al producir probabilidades calibradas por etiqueta, permite registrar no solo la decision sino la confianza, lo que facilita analisis posterior de falsos aprobados y ajuste de umbrales.
- Control de calidad en pipelines de automatizacion de back office: en tareas como facturacion o gestion de registros, detecta importes, fechas o identificadores incorrectos (wrong_action) antes de que la operacion se ejecute, reduciendo errores en produccion.
- Filtro de bajo coste en arquitecturas multiagente: al ejecutarse sobre un modelo base de 0.8B, puede desplegarse como primer filtro local que descarte o escale llamadas dudosas hacia un modelo mayor, reduciendo coste y latencia en el camino comun.
- Validacion en entornos con reglas de negocio escritas: aplicaciones que ya mantienen una lista de normas en lenguaje natural (quien puede recibir datos, que acciones requieren aprobacion) pueden reutilizarlas directamente como campo de contexto sin reescribirlas como codigo.

## Benchmarks y rendimiento

| Test | Filas | Precision (accuracy) |
|---|---:|---:|
| Test interno (generador) | 1.934 | 99,4% |
| Segundo test interno de casos no vistos (generador) | no registrado | 99,2% |

| Funcion | Umbral | Precision | Cobertura | Filas de calibracion |
|---|---:|---:|---:|---:|
| action | 0,509 | 99,6% | 100,0% | 1.913 |

El autor advierte que los tests de tipo generador proceden del mismo generador que los datos de entrenamiento y miden menos que un test publico o con documentos reales. No se han publicado resultados en benchmarks publicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo base de 0.8B, la huella es propia de un modelo de esa escala mas el adaptador LoRA.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del modelo base (0.8B) es plausible en GPUs de consumo, pero no se aportan datos verificados.
- Opciones de despliegue: el autor distribuye un motor propio y un SDK de Python (repositorio github.com/firelex/jeff), con soporte de ejecucion local mediante `Jeff.local`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de compatibilidad: el motor rechaza adaptadores entrenados sobre otra base, por lo que este adaptador solo carga sobre jeff-base en la revision v1.4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparacion rigurosa. La categoria (clasificador de verificacion de acciones para agentes basado en un modelo de decision de 0.8B) no cuenta con alternativas documentadas en las fuentes consultadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jeff-adapter-action-check | adaptador sobre base de 0.8B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Clasificacion de tool calls en 4 etiquetas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No identificadas en la informacion disponible |

## Limitaciones y advertencias

- El modelo solo admite ingles; no se declaran capacidades en otros idiomas.
- No corrige los argumentos de la llamada: unicamente la evalua, por lo que no sustituye a un paso de reparacion.
- Dependencia estricta de la revision v1.4 de jeff-base; el motor rechaza el adaptador sobre otras bases o revisiones.
- Los tests reportados son de tipo generador (misma fuente que los datos de entrenamiento), lo que puede sobreestimar el rendimiento real frente a distribuciones distintas.
- Las filas de evaluacion se filtraron mediante una comprobacion ciega con LLM, lo que introduce dependencia de ese verificador en la calidad de las etiquetas.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero existe riesgo de clasificacion erronea con alta confianza; el umbral de calibracion reportado (0,509) y la cobertura del 100% deben validarse en el dominio propio.
- Sesgos conocidos: no documentados en la informacion disponible.
- Ausencia de benchmarks publicos y de datos de contexto maximo, cuantizacion y latencia, lo que dificulta la planificacion de produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base jeff-base y de Qwen3.5-0.8B del que deriva.

## Enlaces

- HuggingFace: https://huggingface.co/mstrasser/jeff-adapter-action-check
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina de catalogo: https://jeffhub.ai/catalogue/jeff.agents.action-check
- Repositorio, servidor y SDK: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
- Agente de codigo relacionado: https://github.com/firelex/jeff-code
- Paper relacionado (Bongard, arXiv): https://arxiv.org/html/2609.39111v1
