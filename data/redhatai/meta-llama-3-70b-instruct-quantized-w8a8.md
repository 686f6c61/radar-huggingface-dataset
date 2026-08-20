# RedHatAI/Meta-Llama-3-70B-Instruct-quantized.w8a8

## Resumen

Meta-Llama-3-70B-Instruct-quantized.w8a8 es una versión cuantizada del modelo Meta-Llama-3-70B-Instruct de Meta, publicada por Red Hat AI (RedHatAI) y desarrollada por Neural Magic. El objetivo de esta variante es reducir el consumo de memoria de GPU y de disco en aproximadamente un 50% y duplicar el rendimiento de las multiplicaciones matriciales, manteniendo al mismo tiempo la calidad del modelo original. Para ello se aplica una cuantización simétrica INT8 tanto a los pesos como a las activaciones de las capas lineales de los bloques transformer, mediante el algoritmo GPTQ.

El modelo conserva la arquitectura transformer decoder-only de Llama 3, con 70.553 millones de parámetros y una ventana de contexto de 8.192 tokens. Está diseñado para uso comercial e investigación en inglés, y se integra fácilmente en entornos de inferencia como vLLM, Hugging Face Transformers y text-generation-inference. Su relevancia actual radica en que permite desplegar un modelo de 70B en entornos con menos memoria de GPU, lo que reduce los costes de inferencia sin renunciar al rendimiento del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (decoder-only transformer) |
| Parametros totales | 70.553.706.496 (70,5B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | W8A8 (INT8 para pesos y activaciones) |
| Idiomas soportados | ingles (el modelo original soporta mas, pero la version cuantizada esta limitada a ingles) |
| Licencia | Llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (compatible con vLLM y TGI) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del original Meta-Llama-3-70B-Instruct, no un entrenamiento desde cero. La arquitectura es un transformer decoder-only con 70.5 mil millones de parametros, 80 capas, 64 cabezas de atencion y un tamaño de embedding de 8192. La cuantizacion se realizo con el algoritmo GPTQ (arXiv:2210.17323) implementado en la libreria llm-compressor de Neural Magic. Se cuantizaron unicamente los pesos y activaciones de los operadores lineales dentro de los bloques transformer, dejando el resto (embeddings, lm_head, normalizaciones) en precision original.

El esquema de cuantizacion es:
- Pesos: simetrico estatico por canal, con un factor de escala fijo para cada canal de salida.
- Activaciones: simetrico dinamico por token, con factor de escala calculado en tiempo de ejecucion.

Se usaron 256 secuencias del dataset de calibracion de compresion de Neural Magic, con un damping factor de 0.1. No se emplearon tecnicas de RLHF o DPO adicionales, ya que el modelo base ya habia sido ajustado con instrucciones.

## Capacidades

- Generacion de texto en ingles, con respuestas coherentes y contextualmente relevantes.
- Razonamiento logico y matematico basico y avanzado, heredado del modelo Llama-3-70B-Instruct.
- Soporte de conversaciones multi-turno gracias al formato de chat aplicado en la plantilla de tokenizacion.
- Funciones de tool calling / function calling (heredadas del modelo original, aunque no se documenta explicitamente en esta version).
- Capacidad de seguir instrucciones complejas y generar codigo en varios lenguajes de programacion.
- Integracion nativa con vLLM y Transformers, permitiendo despliegue con tensor parallelism.
- No soporta vision ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Asistentes virtuales para atencion al cliente: el modelo puede mantener conversaciones multi-turno con contexto largo, gestionando preguntas frecuentes y derivando a agentes humanos cuando sea necesario.
- Generacion de codigo en entornos de desarrollo: con capacidades de razonamiento y generacion de codigo, puede integrarse en herramientas de autocompletado o revision de codigo, aunque no se recomienda para produccion sin validacion humana.
- Analisis de texto y extraccion de informacion: capaz de resumir documentos largos, extraer entidades y clasificar contenido en ingles.
- Chatbots de investigacion y prototipado rapido: su facil despliegue con vLLM permite crear demos y pruebas de concepto en pocas horas.
- Sistemas de RAG (retrieval augmented generation): al mantener un rendimiento similar al original, puede usarse como generador en pipelines de respuesta a preguntas sobre documentos propios.
- Inferencia en entornos con limitacion de VRAM: al reducir el peso a INT8, permite ejecutar un modelo de 70B en configuraciones de 2x48GB o 4x24GB, lo que facilita su uso en clusters GPU modestos.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark OpenLLM v1, obteniendo una puntuacion media de 79.18, identica a la del modelo original sin cuantizar. No se han publicado resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Modelo | Puntuacion media OpenLLM v1 |
|---|---|
| Meta-Llama-3-70B-Instruct (sin cuantizar) | 79.18 |
| Meta-Llama-3-70B-Instruct-quantized.w8a8 | 79.18 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 70 GB en precision INT8 (70.5 GB de pesos + overhead de activaciones y cache). Con vLLM se puede reducir el uso de VRAM usando paged attention y gestion de memoria.
- GPUs recomendadas: para inferencia en una sola GPU se necesita una GPU con 80 GB de VRAM (A100 80GB, H100 80GB). Tambien se puede usar tensor parallelism en 2 GPUs de 48GB (A100 48GB) o 4 GPUs de 24GB (RTX 4090, A10, etc.).
- No cabe en una GPU de consumo (RTX 3090/4090 de 24GB) sin usar CPU offloading o cuantizacion adicional.
- Opciones de despliegue: vLLM (recomendado), Hugging Face Transformers, text-generation-inference (TGI) y endpoints compatibles de Hugging Face.
- Latencia estimada: no disponible, pero la cuantizacion W8A8 suele duplicar el throughput de matrices respecto al modelo original en GPUs con soporte INT8 (A100, H100, L40S, etc.).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | OpenLLM v1 | Licencia |
|---|---|---|---|---|---|
| Meta-Llama-3-70B-Instruct | 70.5B | FP16 | 8192 | 79.18 | Llama3 |
| Meta-Llama-3-70B-Instruct-quantized.w8a8 | 70.5B | W8A8 | 8192 | 79.18 | Llama3 |
| Meta-Llama-3-70B-Instruct-quantized.w8a16 | 70.5B | W8A16 (solo pesos INT8) | 8192 | no disponible | Llama3 |
| Mixtral-8x7B-Instruct (comparacion de tamano) | 46.7B activos | FP16 | 32768 | no comparable | Apache 2.0 |

La version W8A8 ofrece el mismo rendimiento que el original, con la mitad de memoria y el doble de velocidad de multiplicacion matricial. La version W8A16 cuantiza solo los pesos, por lo que requiere mas memoria que W8A8 pero mantiene activaciones en FP16.

## Limitaciones y advertencias

- El modelo esta pensado para uso en ingles; el uso en otros idiomas esta fuera del alcance segun la documentacion.
- Puede presentar alucinaciones y errores de razonamiento, especialmente en tareas complejas o con informacion poco frecuente.
- La licencia Llama3 permite uso comercial, pero requiere aceptar los terminos de Meta y para empresas con mas de 700 millones de usuarios mensuales se necesita una licencia especial.
- La cuantizacion puede degradar ligeramente el rendimiento en tareas de precision alta, aunque en el benchmark OpenLLM no se observa diferencia.
- No incluye soporte para vision, audio ni otras modalidades.
- El modelo fue entrenado con datos hasta 2024, por lo que no conoce eventos posteriores.
- En produccion, se recomienda validar las respuestas con sistemas de verificacion externos, especialmente en aplicaciones de alto riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RedHatAI/Meta-Llama-3-70B-Instruct-quantized.w8a8)
- [Modelo original Meta-Llama-3-70B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct)
- [Libreria llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Paper GPTQ](https://arxiv.org/abs/2210.17323)
- [Dataset de calibracion de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
- [Documentacion de vLLM](https://docs.vllm.ai/en/latest/)
