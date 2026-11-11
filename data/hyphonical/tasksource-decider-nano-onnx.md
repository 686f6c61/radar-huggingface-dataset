# Hyphonical/tasksource-decider-nano-ONNX

## Resumen

tasksource-decider-nano-ONNX es la version en formato ONNX de tasksource-decider-nano, un modelo de 150 millones de parametros disenado especificamente para tomar decisiones tipadas en lugar de generar texto. Desarrollado por el usuario Hyphonical a partir del modelo base de tasksource, el modelo recibe un estado (state) y una serie de preguntas tipadas con opciones (choice, noul) y devuelve una probabilidad para cada opcion mediante softmax. No es un modelo generativo: es un cross-encoder que puntua opciones.

La relevancia de este modelo radica en su especializacion: segun la model card, ocupa el primer puesto entre modelos de menos de 300 millones de parametros en el Decision Index 0.4 (puntuacion Full de 19,85, octubre de 2026) y obtiene un indice bruto de 50,38 en la edicion 0.3 del mismo benchmark. Su arquitectura ModernBERT-style con 8.192 tokens de contexto y su capacidad de codificar el estado una sola vez por peticion lo hacen adecuado para tareas de enrutamiento, clasificacion y seleccion de herramientas.

La version ONNX esta pensada para su uso con Transformers.js, lo que permite ejecutar el modelo en el navegador o en entornos JavaScript/Node.js sin necesidad de Python. El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder ModernBERT-style (basado en cross-encoder/ettin-reranker-150m-v1) |
| Parametros totales | 150M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (pares superiores a 8.192 tokens devuelven `Unsupported`) |
| Tipos de cuantizacion | no disponible (version ONNX; el modelo base es cuantizable) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (version convertida del modelo original en PyTorch) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder conjunto construido sobre el encoder ModernBERT-style de ettin-reranker-150m-v1. Cada opcion se puntua contra el estado completo, su pregunta y el texto de la opcion, de forma analoga al par de reranker `(state, "Question: <instructions>\nOption: <option>")`, mediante una cabeza lineal sobre la media de los estados ocultos de la opcion. Las puntuaciones se aplican softmax sobre las opciones de cada pregunta.

La innovacion tecnica principal es que el estado se codifica una sola vez por peticion. Todas las preguntas y opciones comparten esa codificacion mediante una mascara de atencion en arbol: el estado atiende a si mismo, una pregunta atiende al estado y a si misma, y una opcion atiende al estado, a su pregunta y a si misma. Las posiciones rotatorias corresponden al par unico, de modo que cada opcion obtiene la puntuacion que tendria por si sola (salvo redondeo en coma flotante), mientras que una peticion con 50 opciones cuesta una codificacion de estado en lugar de 50.

El entrenamiento consistio en 64.000 pasos, lotes de 8 peticiones, tasa de aprendizaje 2e-5, entradas de hasta 2.048 tokens y semilla 1. La perdida es entropia cruzada suave sobre las opciones de cada pregunta. El 20% de las preguntas se reformularon con estilos de prompt especificos de tarea y el 5% recibieron una opcion "none of the above". La mezcla de entrenamiento contiene 480.000 peticiones: 42% de tasksource-jev-typed-decisions, 30% de splits de train de datasets publicos (MMLU, ANLI, WinoGrande, HellaSwag, ARC, CLINC150, BANKING77, Amazon ESCI, HoVer, RAGTruth, New Yorker caption contest, When2Call, ACOS, iSarcasmEval, NLI4CT, ContractNLI, GSM8K, maximo 10.000 peticiones cada uno), 12% de uso de herramientas (Glaive, xLAM, ToolACE, Hermes function calling, ToolRet train, Home Assistant), 8% de enrutamiento de LLM (xRouteBench, LLMRouterBench), 8% de tasksource/synthetic-typed-decisions y 0,5% de LocalLLaMA/typed-decisions. Cada peticion de entrenamiento paso por un firewall contra la suite del Decision Index 0.3 para evitar contaminacion.

## Capacidades

- Puntuacion de opciones tipadas: recibe un estado y preguntas con opciones y devuelve una probabilidad por opcion mediante softmax.
- Toma de decisiones sin generacion de texto: no produce texto libre, solo puntuaciones.
- Soporte de preguntas de tipo `choice` y `noul` (none of the above).
- Codificacion eficiente del estado compartido entre multiples preguntas y opciones de una misma peticion.
- Capacidad de enrutamiento de LLM (entrenado con xRouteBench y LLMRouterBench).
- Seleccion de herramientas y function calling (entrenado con Glaive, xLAM, ToolACE, Hermes, ToolRet y Home Assistant).
- Clasificacion y recuperacion (entrenado con CLINC150, BANKING77, Amazon ESCI, HoVer, RAGTruth, NLI4CT, ContractNLI).
- Razonamiento y conocimiento (entrenado con MMLU, GSM8K, ARC, HellaSwag, WinoGrande, ANLI).
- Ejecucion en navegador y JavaScript mediante Transformers.js.
- Capacidades multilingues: no disponible (no se especifican idiomas).

## Casos de uso

- Enrutamiento de consultas a LLM: el modelo puede elegir que modelo o endpoint debe atender una peticion comparando el estado de la consulta contra opciones de modelos disponibles, gracias a su entrenamiento con xRouteBench y LLMRouterBench y a su baja latencia (mediana de 23 ms en una A30).
- Seleccion de herramientas en agentes: dado el estado de una conversacion y un conjunto de herramientas disponibles, el modelo puntua cada herramienta como opcion y devuelve la mas probable, integrable en pipelines de function calling.
- Clasificacion de tickets de soporte: con un estado que contenga el texto del ticket y opciones que representen categorias (por ejemplo, las de CLINC150 o BANKING77), el modelo devuelve la categoria mas probable sin generar texto.
- Moderacion y decision binaria: para tareas de si/no o eleccion entre criterios definidos, el modelo puntua cada criterio y permite umbralizar la decision en produccion.
- Recuperacion y verificacion de evidencia: con estados que incluyan documentos y opciones de afirmaciones, el modelo puede decidir si un documento respalda una afirmacion (entrenado con HoVer, RAGTruth, NLI4CT y ContractNLI).
- Enrutamiento en el navegador: al estar en ONNX y ser compatible con Transformers.js, puede ejecutarse del lado del cliente para decidir que accion tomar sin enviar datos a un servidor.
- Evaluacion de opciones multiples en pipelines de datos: dado un estado y varias opciones, obtiene puntuaciones calibradas por softmax para seleccionar la mejor respuesta en tareas tipo MMLU o ARC.
- Decisiones con opcion "none of the above": el 5% del entrenamiento incluye esta opcion, lo que permite al modelo abstenerse cuando ninguna opcion es adecuada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Decision Index 0.4, Full (private same-skills + new-domains) | 19,85 |
| Decision Index 0.3, public index | 33,51 |
| Indice bruto (edicion 0.3, kit 9eb2dbe, 140.171 peticiones) | 50,38 |
| Knowledge & Reasoning (raw) | 31,9 (skill 9,7) |
| Language Understanding (raw) | 57,6 (skill 38,6) |
| Retrieval & Classification (raw) | 64,0 (skill 50,1) |
| Tools & Automation (raw) | 54,4 (skill 50,9) |
| Arts & Human Taste (raw) | 44,7 (skill 16,6) |
| Peticiones procesadas | 140.171 ok, 7 unsupported (pares superiores a 8.192 tokens) |
| Latencia (1x NVIDIA A30 24 GB compartida, una peticion a la vez) | mediana 23 ms, media 33 ms, p80 37 ms |

Segun la model card, el modelo ocupa el primer puesto entre modelos de menos de 300M de parametros en el Decision Index 0.4. No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 150M de parametros, el modelo en precision completa ocupa aproximadamente 0,6 GB, y en cuantizacion de 8 bits alrededor de 0,15-0,3 GB (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: la model card reporta latencias medidas en una NVIDIA A30 de 24 GB (compartida). Cualquier GPU con suficiente VRAM para el modelo puede ejecutarlo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con al menos 1-2 GB de VRAM libre, dado el tamano de 150M de parametros (no confirmado en la informacion).
- Opciones de despliegue: Transformers.js (formato ONNX), y el modelo base admite PyTorch/transformers mediante el paquete `decider`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: mediana de 23 ms, media de 33 ms y p80 de 37 ms en una A30 24 GB compartida con una peticion a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tasksource-decider-nano-ONNX | 150M | 8.192 tokens | Cross-encoder de decisiones tipadas | Apache 2.0 | Hugging Face (ONNX) |
| tasksource/tasksource-decider-nano | 150M | 8.192 tokens | Cross-encoder de decisiones tipadas | Apache 2.0 | Hugging Face (PyTorch) |
| cross-encoder/ettin-reranker-150m-v1 | 150M | no disponible | Reranker cross-encoder | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada. La model card solo indica que el modelo es el primero entre modelos de menos de 300M de parametros en el Decision Index 0.4.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones; no es adecuado para tareas generativas.
- Pares de entrada superiores a 8.192 tokens devuelven `Unsupported`; no hay truncacion, se lee la entrada completa.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Riesgo de sesgo y alucinacion: no se documentan sesgos conocidos en la informacion disponible, pero al ser un modelo entrenado con datasets publicos puede heredar sus sesgos.
- La version ONNX fue convertida automaticamente mediante un Space de Hugging Face; no se detallan verificaciones adicionales de la conversion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets de entrenamiento subyacentes.
- El modelo esta especializado en el formato de decisiones tipadas (estado + preguntas + opciones); un uso fuera de ese esquema puede degradar el rendimiento.
- La model card no documenta el rendimiento en benchmarks clasicos de conocimiento o codigo, lo que limita la comparacion con modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hyphonical/tasksource-decider-nano-ONNX
- Modelo base: https://huggingface.co/tasksource/tasksource-decider-nano
- Modelo base del encoder: https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de Transformers.js (feature-extraction): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados completos: https://huggingface.co/datasets/tasksource/decision-index-results/tree/main/runs/tasksource-decider-nano
- Dataset tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset synthetic-typed-decisions: https://huggingface.co/datasets/tasksource/synthetic-typed-decisions
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
