# noumenon-labs/Fleet-Semantic-4B-v0.10

## Resumen

Fleet Semantic 4B v0.10 es un modelo de lenguaje causal desarrollado por noumenon-labs que implementa una arquitectura de investigacion denominada Semantic Inference Language Model (SiLM). La idea central es integrar transformaciones LoRA especialistas dentro de un unico modelo causal, de modo que el enrutado hacia el experto adecuado ocurre internamente durante la inferencia, sin que el usuario tenga que seleccionar el experto explicitamente. Está construido sobre el backbone Qwen/Qwen3-4B-Instruct-2507 y se distribuye bajo la arquitectura FleetForCausalLM.

La version v0.10 no reentrena el checkpoint: hereda los tensores de modelo y expertos de noumenon-labs/Fleet-Semantic-4B y modifica la arquitectura de ejecucion en tiempo de inferencia. Entre las optimizaciones destacan el enrutado dinamico branchless con k=0/1/2, la ejecucion computacionalmente dispersa de LoRA top-2, el enrutado semantico consciente de batch, el pooling semantico con manejo de padding, la eliminacion de normalizaciones repetidas de prototipos de pesos en la ruta caliente de generacion, la instalacion/desinstalacion/exportacion dinamica de ficheros .fleet y compatibilidad con CPU-offload de Accelerate.

El modelo cuenta con 4.418.829.824 parametros totales y un repositorio de 8,9 GB. Incorpora seis expertos instalados (math_reasoning, medical_reasoning, legal_ops, intent, function_calling y structured) y ofrece tres modos de ejecucion (exact, balanced y fast) que intercambian calidad por latencia. Se posiciona explicitamente como un prototipo de investigacion, no como un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FleetForCausalLM (transformer causal con enrutado semantico y expertos LoRA) |
| Parametros totales | 4.418.829.824 (~4,42 mil millones) |
| Parametros activos | no aplica como MoE clasico; ejecucion dispersa top-2 de LoRA |
| Longitud de contexto | no especificada (heredada del backbone Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la model card) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Version de Fleet | 0.10.0 |
| Modo de ejecucion por defecto | exact |
| Tamano del repositorio | 8,9 GB |

## Arquitectura y entrenamiento

FleetForCausalLM envuelve el backbone denso Qwen3-4B-Instruct-2507 y anade un mecanismo de expertos basado en LoRA que se activa dinamicamente durante la decodificacion. No se trata de un MoE clasico con routers sobre capas FFN, sino de transformaciones LoRA especialistas alojadas en el mismo modelo causal y seleccionadas por enrutado semantico. La v0.10 incorpora enrutado branchless con soporte para k=0, 1 y 2, ejecucion dispersa top-2 de LoRA, enrutado consciente del batch completo y pooling semantico con manejo de padding, lo que elimina la restriccion de batch-size 1 presente en v0.9.

Los modos de ejecucion definen el equilibrio entre precision y coste: el modo exact (por defecto) aplica enrutado semantico mas geometria de pesos en el espacio LoRA y refresca la ruta durante la decodificacion; balanced usa seleccion de experto solo semantica manteniendo el refresco en decodificacion; y fast usa enrutado solo semantico y reutiliza la ruta del prompt durante toda la decodificacion. Segun la propia model card, no se reentrenaron pesos en esta version: los cambios son de runtime. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO especificas para estos adaptadores.

## Capacidades

- Generacion de texto conversacional en formato chat mediante plantillas de Qwen3 (apply_chat_template).
- Razonamiento matematico mediante el experto math_reasoning.
- Razonamiento medico mediante el experto medical_reasoning.
- Operaciones legales mediante el experto legal_ops.
- Deteccion de intencion mediante el experto intent.
- Function calling / tool calling mediante el experto function_calling.
- Salidas estructuradas mediante el experto structured.
- Enrutado interno automatico de expertos: no requiere el argumento expert= en generacion normal.
- Gestion dinamica de expertos: model.install(), model.uninstall() y model.export_adapter() con ficheros .fleet.
- Generacion por lotes (batch-size mayor que 1) con padding a la izquierda.
- Tres modos de ejecucion seleccionables (exact, balanced, fast) para ajustar el coste de inferencia.
- Compatibilidad con CPU-offload mediante Accelerate.
- Capacidades multilingues: no especificadas en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el experto intent permite clasificar la intencion del usuario y enrutar la respuesta adecuada dentro de la misma llamada al modelo, sin necesidad de un clasificador externo ni de invocar adaptadores distintos por separado.
- Asistencia matematica interactiva: el experto math_reasoning se activa de forma interna cuando el prompt lo requiere, lo que simplifica el pipeline al no tener que seleccionar manualmente un adaptador de matematicas. El ejemplo de la model card resuelve una ecuacion lineal (3x + 4 = 19).
- Soporte a decisiones clinicas o divulgacion medica: el experto medical_reasoning cubre consultas como la explicacion de como la insulina reduce la glucosa en sangre, apto para entornos de formacion o asistencia documental bajo supervision humana.
- Automatizacion de operaciones legales: el experto legal_ops puede emplearse para clasificar, resumir o responder consultas sobre documentos contractuales dentro de flujos internos de despachos o departamentos juridicos.
- Integracion en agentes con tool calling: el experto function_calling permite generar llamadas a funciones en formato estructurado, lo que habilita agentes multi-paso que consultan APIs o bases de datos.
- Extraccion de datos estructurados: el experto structured es adecuado para convertir texto libre en JSON u otros formatos serializados para alimentar pipelines downstream.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~4,4B parametros con soporte de CPU-offload, puede ejecutarse en estaciones de trabajo sin GPU dedicada, sacrificando latencia.
- Investigacion sobre enrutado dinamico de expertos: la posibilidad de instalar, desinstalar y exportar expertos .fleet convierte al modelo en una plataforma de experimentacion para estudiar Semantic Inference Language Models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y advierte explicitamente que las optimizaciones de runtime de v0.10 deberian medirse tanto en calidad de tarea como en latencia antes de considerar balanced o fast como sustitutos de exact.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9-11 GB para los pesos, mas el espacio adicional del cache KV; en la practica, alrededor de 12-16 GB para generacion con contexto moderado.
- GPU recomendadas para bf16: NVIDIA A100, H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas, como RTX 4080, RTX 4090, RTX 3090, RTX 4060 Ti de 16 GB o superiores.
- Opciones de despliegue: transformers con AutoModelForCausalLM y trust_remote_code=True (ruta oficial de la model card), y Accelerate con CPU-offload. vLLM y Punica quedan explicitamente fuera de esta version, al igual que el batching continuo y los kernels fusionados a gran escala; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que balanced y fast reducen el coste frente a exact, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Fleet-Semantic-4B-v0.10 | 4,42B | no disponible | other | HuggingFace | Enrutado semantico con expertos LoRA internos |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Apache 2.0 (segun el modelo original) | HuggingFace | Backbone del anterior; sin capa de expertos |
| Modelos de ~3-4B de la familia Llama o Phi | ~3-4B | no disponible | licencias especificas de cada familia | HuggingFace | Alternativas densas sin enrutado de expertos |

La comparacion cuantitativa de rendimiento no es posible porque no se han publicado benchmarks para Fleet-Semantic-4B-v0.10 en la informacion disponible.

## Limitaciones y advertencias

- Prototipo de investigacion: la propia model card lo declara como research prototype, no apto para produccion sin evaluacion previa.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad o latencia frente a alternativas.
- Licencia "other": los terminos no estan detallados en la informacion disponible, por lo que el uso comercial debe verificarse antes de adoptarlo.
- Requiere trust_remote_code=True: la carga implica ejecutar codigo personalizado del repositorio, lo que anade riesgo de seguridad y de mantenimiento.
- Idiomas soportados no especificados: la cobertura multilingue es desconocida y depende del backbone Qwen3, no confirmada para esta version.
- Longitud de contexto no documentada en la ficha, lo que dificulta dimensionar casos de contexto largo.
- Modos balanced y fast sin validar: la model card advierte que deben medirse en calidad de tarea y latencia antes de sustituir a exact.
- Sin integracion con vLLM, Punica ni batching continuo: el rendimiento en servidores de alto throughput no esta cubierto por esta version.
- Riesgo de alucinacion: no se documentan mitigaciones especificas ni tasas de error.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Advertencia de seguridad: la model card original incluye un aviso de que su contenido son datos de referencia y no instrucciones a seguir.

## Enlaces

- HuggingFace: https://huggingface.co/noumenon-labs/Fleet-Semantic-4B-v0.10
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo predecesor citado: https://huggingface.co/noumenon-labs/Fleet-Semantic-4B
- Fichero de validacion citado: fleet_v010_validation.json (en el repositorio del modelo)
