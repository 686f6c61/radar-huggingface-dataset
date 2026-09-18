# EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77

## Resumen

Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 es un ajuste fino por LoRA del modelo nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, publicado por EQTYLab, especializado en clasificacion de intenciones sobre el conjunto de datos banking77 (PolyAI). El adaptador se ha fusionado dentro de los pesos base, por lo que el repositorio se distribuye como un modelo causal autonomo de 4.512.746.496 parametros (4,5B) en bfloat16, sin necesidad de cargar PEFT ni adaptadores adicionales.

El problema que resuelve es acotado y muy concreto: dado un listado de las 77 intenciones de banking77 incluido en el system prompt, el modelo devuelve una unica etiqueta de intencion como texto generado. Fuera de ese formato de prompt se comporta como el modelo de chat Nemotron Nano subyacente. Esto lo convierte en una pieza util para enrutado de consultas bancarias dentro de pipelines de atencion al cliente, etiquetado de tickets o triaje previo a un sistema RAG.

Su relevancia actual es la de un artefacto de nicho bien documentado: es pequeno (unos 9 GB en bf16), se integra directamente en transformers, vLLM, TGI o NVIDIA NIM, y su proceso de entrenamiento esta descrito con detalle (rank de LoRA, modulos objetivo, hiperparametros y semilla). Como contrapartida, el propio autor advierte que no se ha medido ninguna exactitud de benchmark sobre este checkpoint, por lo que la validacion contra el split de test de banking77 corre por cuenta de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Llama 3.1, modelo base Nemotron Nano 4B v1.1) |
| Parametros totales | 4.512.746.496 (4,5B) |
| Longitud de contexto | No especificada en la ficha del modelo; el ejemplo de despliegue con vLLM del autor fija `--max-model-len 8192` |
| Tipos de cuantizacion | No disponible. El autor solo publica pesos en bfloat16; no se incluyen variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | NVIDIA Open Model License (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors (291 tensores, 9.025.492.992 bytes), biblioteca transformers |
| Tarea declarada | text-generation (uso previsto: clasificacion de intenciones banking77) |
| Conjunto de datos de ajuste | PolyAI/banking77 (9.993 filas de entrenamiento) |
| Modelo base | nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 |
| Tamano del repositorio | 9,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal decoder-only de la familia Llama 3.1, con 4,5B de parametros densos (no es un MoE, por lo que no hay parametros activos que reportar). Sobre ese modelo se aplico un ajuste fino supervisado con LoRA mediante PEFT: rank 16, alpha 32 (escalado 2.0), dropout 0.05 y modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El adaptador resultante consta de 448 tensores y 121,7 MB, y se fusiono en los pesos base con `merge_and_unload()`.

Los hiperparametros de entrenamiento documentados son: 2 epocas, batch size 8 con acumulacion de gradiente 2 (batch efectivo 16), learning rate 1e-4, precision bfloat16, semilla 13 y 9.993 filas del dataset banking77. No se menciona ninguna fase de RLHF, DPO ni decodificacion especulativa. La innovacion tecnica destacable es la verificacion del merge: el autor comprobo tensor a tensor que recalcular `W + (alpha/r) · B·A` reproduce los pesos fusionados de forma bit-exacta en bf16, y que el conjunto de tensores y el tamano total se conservan respecto al modelo base. El comportamiento de clasificacion depende criticamente del prompt: el system prompt debe contener la cadena `detailed thinking off` seguida de la lista de etiquetas; sin `detailed thinking off` el modelo puede emitir un bloque `<think>` en lugar de una etiqueta limpia, y sin la lista de etiquetas responde de forma conversacional.

## Capacidades

- Clasificacion de intenciones en una sola etiqueta: devuelve exactamente una de las 77 intenciones de banking77 cuando recibe la lista en el system prompt.
- Generacion de texto conversacional: fuera del formato de clasificacion hereda el comportamiento de chat del modelo Nemotron Nano base.
- Control de modo de razonamiento mediante prompt: la instruccion `detailed thinking off` desactiva la emision de bloques `<think>`.
- Ejecucion con decodificacion greedy: la tarea tiene una unica secuencia de tokens correcta, por lo que `do_sample=False` es lo recomendado.
- Multilingue: limitado a ingles, segun el campo `language` del modelo y el dataset utilizado.
- Integracion de despliegue: compatible con transformers, vLLM (`/v1/chat/completions` con `temperature=0`, `max_tokens=16`), TGI y NVIDIA NIM.
- No hay soporte documentado de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Enrutado de tickets de soporte bancario: el modelo recibe el texto del ticket y devuelve una etiqueta de banking77 que permite asignarlo automaticamente al equipo o flujo correspondiente, sustituyendo reglas heuristicas por clasificacion semantica.
- Chatbot de atencion al cliente con enrutado previo: antes de generar una respuesta, se clasifica la consulta del usuario y se selecciona la base de conocimiento o el subagente adecuado segun la intencion detectada.
- Etiquetado de transcripciones de call center: procesamiento por lotes de conversaciones grabadas para construir series temporales de motivos de contacto, con decodificacion greedy y `max_new_tokens=16` para maximizar el throughput.
- Triaje previo a un pipeline RAG: la etiqueta de intencion actua como filtro de metadatos para recuperar unicamente los documentos de la categoria relevante, reduciendo el ruido en la recuperacion.
- Analisis agregado de motivos de contacto: al clasificar grandes volumenes de consultas se pueden cuantificar que intenciones concentran mas incidencias (por ejemplo, comisiones de pago con tarjeta o transferencias fallidas) para priorizar mejoras de producto.
- Control de calidad de anotaciones: uso del modelo como segundo anotador sobre un subconjunto de datos ya etiquetados para detectar discrepancias en el proceso de etiquetado humano.
- Deteccion de consultas fuera de catalogo: si la consulta no encaja razonablemente en ninguna etiqueta devuelta, el sistema puede derivarla a un clasificador generico o a un agente humano, dado que el modelo base sigue siendo conversacional fuera del formato estricto.
- Prototipado rapido en local: al ocupar unos 9 GB en bf16, permite validar el flujo completo de clasificacion en una estacion de trabajo con una sola GPU consumer antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha medido ninguna exactitud de benchmark para este checkpoint y que la verificacion se limito a comprobar la correccion del merge, la preservacion del conjunto de tensores y del tamano total, y un punado de generaciones de prueba sobre consultas bancarias. El autor recomienda ejecutar una evaluacion propia contra el split de test de banking77 antes de desplegar el modelo.

| Benchmark | Resultado |
|---|---|
| Exactitud en banking77 (test) | No medida por el autor |
| MMLU, HumanEval, GSM8K u otros | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 9 GB solo para los pesos, mas el cache KV correspondiente al contexto configurado; con 8192 tokens de contexto conviene reservar entre 11 y 13 GB.
- VRAM estimada cuantizado: no disponible en la informacion proporcionada, ya que el autor no publica variantes cuantizadas (orientativamente, 8 bits ~5 GB y 4 bits ~3 GB si se generan con herramientas externas).
- GPU profesionales: A100, H100, L40S y cualquier GPU con 16 GB o mas de memoria permiten servirlo en bf16 sin cuantizar.
- GPU consumer: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en bf16. En tarjetas de 8-12 GB seria necesario cuantizar.
- Opciones de despliegue documentadas: transformers con `device_map="auto"`, vLLM (`vllm serve ... --max-model-len 8192 --dtype bfloat16`), TGI y NVIDIA NIM. No se documenta soporte GGUF ni Ollama en el repositorio.
- Latencia y throughput: no disponibles. Para la tarea de clasificacion se recomienda `max_new_tokens=16` y decodificacion greedy, lo que mantiene la generacion muy corta.
- El repositorio ocupa 9,0 GB en disco en bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77 | 4,51B | No especificado (ejemplo vLLM con 8192) | NVIDIA Open Model License | Ingles | LoRA fusionado para banking77; sin benchmark publicado |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | 4,51B | No disponible en la informacion proporcionada | NVIDIA Open Model License | No disponible | Modelo de proposito general; no clasifica banking77 sin ajuste |
| Otros ajustes de banking77 de tamano similar | No disponible | No disponible | No disponible | No disponible | No se han encontrado referencias en la informacion proporcionada |

La busqueda web realizada no devolvio resultados tecnicos relevantes (unicamente paginas generalistas sin relacion con el modelo), por lo que no es posible completar la comparativa con alternativas contrastadas.

## Limitaciones y advertencias

- Salida como texto generado, no como decodificador restringido a un conjunto cerrado: el modelo puede devolver cadenas que no coincidan exactamente con una etiqueta valida de banking77.
- Dependencia estricta del prompt: si falta `detailed thinking off` puede emitir un bloque `<think>`; si falta la lista de etiquetas, responde de forma conversacional en lugar de clasificar.
- Ausencia total de evaluacion: el autor no ha medido exactitud sobre el split de test, por lo que no hay garantia cuantificada de rendimiento en produccion.
- Solo ingles: el dataset y el campo `language` del modelo se limitan al ingles, con degradacion esperada en otros idiomas.
- Riesgo de alucinacion heredado del modelo base: al ser un modelo generativo abierto, fuera del formato de clasificacion puede producir contenido plausible pero incorrecto.
- Las etiquetas incluidas en el ejemplo de la model card presentan irregularidades de formato heredadas del dataset, como `Refund_not_showing_up` (con mayuscula inicial) o `reverted_card_payment?` (con signo de interrogacion). Conviene normalizarlas o respetarlas de forma consistente al comparar salidas.
- Licencia: NVIDIA Open Model License, no una licencia de codigo abierto estandar. Es imprescindible revisar sus terminos (incluidas las clausulas de uso aceptable y de atribucion) antes de un despliegue comercial.
- Trazabilidad limitada: cero descargas y cero likes en el momento de la consulta, y fecha de creacion posterior a la mayoria de los modelos de referencia, lo que reduce la evidencia externa disponible sobre su comportamiento.
- Sin soporte documentado de tool calling, agentes multi-paso, vision ni audio; no debe asumirse ninguna de estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EQTYLab/Llama-3.1-Nemotron-Nano-4B-v1.1-banking77
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/banking77
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- La busqueda web no devolvio enlaces tecnicos relevantes (papers, blogs o repos) adicionales sobre este modelo.
