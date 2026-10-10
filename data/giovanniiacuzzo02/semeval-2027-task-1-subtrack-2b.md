# GiovanniIacuzzo02/SemEval-2027-Task-1-subtrack-2b

## Resumen

SemEval-2027-Task-1-subtrack-2b es un adaptador PEFT/LoRA de caracter experimental publicado por el usuario GiovanniIacuzzo02 para la tarea RETECO SemEval-2027 Task 1, sub-track 2b (Gold-Passage Grounded Generation). El modelo parte de Qwen/Qwen2.5-0.5B-Instruct y se ha ajustado mediante supervised fine-tuning sobre el dataset DataScience-UIBK/RETECO-SemEval2027. Su objetivo es generar respuestas conversacionales fundamentadas en pasajes de evidencia proporcionados por el organizador de la tarea, de modo que la calidad de la generacion pueda evaluarse de forma independiente al componente de recuperacion.

No se trata de un sistema RAG de extremo a extremo: el modelo asume que los pasajes de soporte ya estan disponibles en el prompt y no los recupera de ningun corpus. La entrada tipica combina el turno actual del usuario, el historial de conversacion y las evidencias de oro; la salida es la respuesta generada para ese turno. El repositorio ocupa 0.0 GB, acumula 0 descargas y 0 likes en el momento de la consulta y se marca explicitamente como experimental, sin checkpoint de evaluacion publicado.

Por su tamano (modelo base de 0,5B parametros) y su naturaleza de adaptador, es relevante como artefacto de investigacion para reproducir el protocolo de la tarea, no como solucion de produccion. La ventana de contexto util depende del modelo base Qwen2.5-0.5B-Instruct y de los presupuestos de entrada/salida configurados en el pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2) con adaptador PEFT/LoRA |
| Parametros totales | 0,5B en el modelo base Qwen2.5-0.5B-Instruct; numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; los presupuestos efectivos de entrada/salida se controlan mediante configuracion del pipeline (valores concretos no disponibles) |
| Tipos de cuantizacion | Adaptador distribuido en safetensors (precision del adaptador no especificada); el pipeline de entrenamiento soporta QLoRA opcional en 4-bit NF4 sobre CUDA compatible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Dataset de entrenamiento | DataScience-UIBK/RETECO-SemEval2027 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA/PEFT sobre un transformer causal decoder-only de la familia Qwen2 (Qwen2.5-0.5B-Instruct). El entrenamiento se realiza mediante supervised fine-tuning con enmascaramiento de los tokens del prompt en la funcion de perdida (etiquetas `-100`), de forma que el objetivo de modelado de lenguaje se aplica unicamente a los tokens de la respuesta de referencia. La implementacion soporta entrenamiento con LoRA, QLoRA opcional en 4-bit NF4 en configuraciones CUDA compatibles, gradient checkpointing, acumulacion de gradientes, division train/validacion interna a nivel de conversacion, muestreo opcional balanceado por dominio y early stopping basado en la perdida de validacion interna.

La construccion del prompt admite ablaciones configurables de la entrada: solo la consulta actual (A), consulta e historial de conversacion (B), consulta y evidencia de oro (C), consulta, historial y evidencia (D), y contexto completo con metadatos auxiliares de razonamiento por sub-preguntas (E). La configuracion por defecto del proyecto usa consulta, historial de conversacion y pasajes de oro, con los metadatos auxiliares de razonamiento desactivados. Los contextos largos se gestionan con presupuestos configurables de entrada y salida y limites de historial. La respuesta de referencia se emplea exclusivamente como objetivo supervisado y no debe insertarse en el prompt de inferencia, usarse para seleccionar salidas candidatas ni incluirse en una submission.

No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO. Las innovaciones tecnicas documentadas se limitan al esquema de ablaciones de prompt, el enmascaramiento de tokens de prompt y la integracion de evidencia de oro en la entrada.

## Capacidades

- Generacion de texto conversacional en ingles orientada a respuestas de un solo turno sobre un turno objetivo.
- Generacion fundamentada en evidencia (evidence grounding): el modelo usa pasajes de oro incluidos en el prompt y se le instruye a no anadir afirmaciones facticas no respaldadas.
- Manejo de contexto conversacional multi-turno: la entrada admite historial de conversacion junto con la consulta actual, sujeto a los limites de historial configurados.
- Coherencia dialogica: el objetivo de la tarea evalua correccion, completitud, relevancia, coherencia con el dialogo y soporte en la evidencia.
- Capacidad de ablacion de contexto: el mismo adaptador puede utilizarse con distintos subconjuntos de entrada (consulta, historial, evidencia) segun la configuracion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modo de metadatos de razonamiento por sub-preguntas existe como opcion de prompt pero esta desactivado por defecto).
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Reproduccion del benchmark RETECO sub-track 2b: el adaptador se carga junto a Qwen2.5-0.5B-Instruct y se evalua con el protocolo oficial de cinco dimensiones de calidad de generacion, siempre que se reproduzcan exactamente las reglas de construccion de prompt y truncado del proyecto.
- Investigacion sobre grounding en generacion conversacional: permite aislar el efecto de la evidencia de oro frente a la del historial de conversacion mediante las ablaciones A/B/C/D/E, comparando metricas con la misma particion de datos.
- Analisis de atribucion de evidencia: el modelo sirve como linea base de bajo coste para estudiar hasta que punto las respuestas se apoyan en los pasajes proporcionados y no en conocimiento parametrico.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador de 0,5B, puede ejecutarse en una unica GPU de consumo o incluso en CPU, lo que facilita experimentos iterativos sin infraestructura dedicada.
- Evaluacion de estrategias de prompting sobre modelos pequenos: permite medir la sensibilidad de un modelo de 0,5B a distintas formulaciones del bloque de evidencia y del historial de conversacion.
- Docencia y ejercicios de fine-tuning con PEFT: el pipeline documentado (LoRA, QLoRA 4-bit NF4, gradient checkpointing, early stopping) sirve como ejemplo reproducible para cursos o talleres de adaptacion eficiente de LLM.
- Generacion de respuestas asistidas por evidencia en dominios cerrados, como soporte documental interno en ingles, siempre que la recuperacion de pasajes se implemente por separado y se valide la fidelidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica que es un checkpoint experimental y remite a la seccion de estado y evaluacion de la model card, sin incluir cifras.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 1,0-1,2 GB de VRAM para los pesos del modelo base de 0,5B mas el adaptador LoRA y la cache KV; en la practica cabe en cualquier GPU con 4 GB o mas.
- Inferencia en 4-bit: del orden de 0,4-0,6 GB de VRAM para los pesos, viable en GPU integradas y en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (RTX 3060, RTX 4060, RTX 4090); las GPU de datacenter (A100, H100) solo tienen sentido para lotes grandes o entrenamiento, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con 4 GB o mas de VRAM; tambien es ejecutable en CPU con `torch.float32` aunque con mayor latencia.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama previa fusion del adaptador en el modelo base y conversion de formato.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un modelo de 0,5B en una GPU de consumo moderna ofrece latencias de decodificacion muy bajas por token, pero no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemEval-2027-Task-1-subtrack-2b (este) | 0,5B (base) + adaptador LoRA | 32.768 tokens en el modelo base (presupuesto efectivo configurable) | Adaptador PEFT/LoRA para generacion fundamentada | no disponible | HuggingFace, 0 descargas, experimental |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Modelo instructivo de proposito general | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Modelo instructivo de proposito general | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Modelo instructivo de proposito general | Llama 3.2 Community License | HuggingFace, con restricciones de uso |

No se dispone de resultados comparativos de rendimiento entre este adaptador y las alternativas, ya que no se han publicado cifras de benchmarks.

## Limitaciones y advertencias

- Estado experimental: el autor marca el checkpoint como experimental y no publica resultados de evaluacion; no debe asumirse un rendimiento validado.
- Capacidad limitada del modelo base: 0,5B parametros restringe el razonamiento complejo, la agregacion de multiples pasajes y el seguimiento de instrucciones largas.
- Riesgo de alucinacion: aunque el prompt instruye a no anadir afirmaciones no respaldadas, un modelo de este tamano puede generar contenido no presente en la evidencia.
- Dependencia estricta de los pasajes de oro: no incorpora recuperacion; si los pasajes proporcionados son irrelevantes o incompletos, la respuesta se degradara.
- Idioma: los metadatos declaran unicamente ingles, sin garantias de comportamiento en castellano u otros idiomas.
- Restricciones de licencia: la licencia del adaptador figura como no disponible; antes de cualquier uso comercial debe verificarse con el autor, ademas de la licencia del modelo base (Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0).
- Reproducibilidad: para una inferencia alineada con el benchmark hay que reproducir exactamente las reglas de construccion de prompt y truncado del proyecto original, incluidos los presupuestos de entrada y los limites de historial.
- Uso de la respuesta de referencia: esta es solo un objetivo de entrenamiento y no debe introducirse en el prompt de inferencia ni emplearse para seleccionar salidas, bajo riesgo de invalidar la evaluacion.
- Carga conjunta obligatoria: el adaptador no es autonomo; requiere cargar Qwen/Qwen2.5-0.5B-Instruct y debe comprobarse que el campo `base_model` de `adapter_config.json` coincide con el modelo base utilizado.
- Ausencia de senales de adopcion: 0 descargas y 0 likes, sin evidencia de uso por terceros ni de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GiovanniIacuzzo02/SemEval-2027-Task-1-subtrack-2b
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DataScience-UIBK/RETECO-SemEval2027
- Pagina principal de RETECO: https://datascienceuibk.github.io/RETECO/
- Definicion de la tarea: https://datascienceuibk.github.io/RETECO/task.html
- Protocolo de evaluacion: https://datascienceuibk.github.io/RETECO/evaluation.html
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
