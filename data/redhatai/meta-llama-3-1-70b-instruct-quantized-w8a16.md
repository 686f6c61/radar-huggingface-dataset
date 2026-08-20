# RedHatAI/Meta-Llama-3.1-70B-Instruct-quantized.w8a16

## Resumen

Este modelo es la versión cuantizada a INT8 de Meta-Llama-3.1-70B-Instruct, publicada por Red Hat AI (con desarrollo técnico de Neural Magic) en julio de 2024. Su propósito principal es reducir los requisitos de memoria y disco del modelo original en aproximadamente un 50 %, manteniendo una pérdida de precisión mínima en tareas de razonamiento, conocimiento general y matemáticas. Se dirige a equipos que necesitan desplegar un modelo de 70B parámetros en infraestructura GPU limitada o reducir costes operativos sin sacrificar demasiada calidad.

La cuantización se aplica únicamente a los pesos de las capas lineales dentro de los bloques transformer, usando el algoritmo GPTQ con calibración sobre 256 secuencias del dataset de compresión de Neural Magic. El modelo conserva la arquitectura Meta-Llama-3 con 70.553 millones de parámetros y soporta los mismos idiomas que el modelo base: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés. La licencia es Llama 3.1, que permite uso comercial con condiciones específicas. El formato de pesos es safetensors, y el despliegue recomendado es mediante el backend vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Meta-Llama-3 (transformer decoder-only) |
| Parametros totales | 70.553.706.496 (70,5B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; la configuracion de ejemplo usa 8192) |
| Tipos de cuantizacion | INT8 (W8A16, pesos cuantizados, activaciones en FP16) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 (uso comercial permitido con condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Meta-Llama-3.1-70B-Instruct, un transformer decoder-only de 70.553 millones de parámetros con atención multi-cabeza y una ventana de contexto de 128.000 tokens. La version cuantizada mantiene la misma arquitectura pero convierte los pesos de las capas lineales de los bloques transformer de FP16 a INT8 mediante cuantizacion simetrica por canal. Se aplica el algoritmo GPTQ con un factor de damping de 0,1 y 256 secuencias de calibracion extraidas del dataset neuralmagic/LLM_compression_calibration, usando la libreria llm-compressor.

El proceso de cuantizacion ignora la capa lm_head para no degradar la generacion de texto. El resultado es un modelo que reduce a la mitad el tamano en disco y los requisitos de memoria GPU respecto al original, pasando de aproximadamente 141 GB a 72,7 GB en pesos. No se ha realizado ningun entrenamiento adicional ni ajuste fino posterior a la cuantizacion; la calidad se mantiene por la propia robustez del modelo original y la baja perdida introducida por GPTQ con 8 bits por peso.

## Capacidades

- Generacion de texto conversacional tipo asistente, similar al modelo base Llama-3.1-70B-Instruct.
- Razonamiento de conocimiento general y aritmetico: mantiene una recuperacion del 96,8 % en GSM-8K y del 96,9 % en MMLU frente al modelo sin cuantizar.
- Soporte multilingue en ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno con contexto largo (hasta 128k tokens).
- Compatible con el formato de chat de Llama-3.1 y con la API OpenAI-compatible de vLLM.
- No incluye capacidades de vision, audio ni tool calling especificas documentadas en la model card.

## Casos de uso

- Asistentes conversacionales multilingues: el modelo puede gestionar interacciones de atencion al cliente o asistentes virtuales en los ocho idiomas soportados, manteniendo el estilo de chat del modelo base.
- Despliegue en infraestructura GPU limitada: con 72,7 GB de pesos en INT8, se puede ejecutar en dos GPU de 48 GB (como A6000 o L40S) o en cuatro GPU de 24 GB (como RTX 4090), reduciendo el coste respecto a los 141 GB del modelo FP16.
- Razonamiento y analisis de documentos largos: su ventana de contexto de 128k tokens permite procesar informes, contratos o articulos extensos y generar resumenes o respuestas basadas en el contenido completo.
- Generacion de codigo asistida: aunque no esta optimizado especificamente para codigo, hereda las capacidades del modelo base para completar funciones, explicar fragmentos y depurar errores en varios lenguajes de programacion.
- Evaluacion y comparacion de modelos cuantizados: sirve como referencia para medir el impacto de la cuantizacion INT8 en la calidad de salida, util para equipos que estan evaluando estrategias de compresion.
- Servicio de inferencia en produccion con vLLM: se integra con el backend vLLM para servir peticiones HTTP con la API OpenAI-compatible, permitiendo su uso en pipelines de IA generativa con control de latencia y throughput.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion comparando el modelo cuantizado con el modelo original sin cuantizar, usando el fork de Neural Magic de lm-evaluation-harness y el motor vLLM.

| Benchmark | Meta-Llama-3.1-70B-Instruct | Meta-Llama-3.1-70B-Instruct-quantized.w8a16 | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 83,94 | 81,37 | 96,9 % |
| MMLU (CoT, 0-shot) | 86,23 | 83,86 | 97,2 % |
| ARC Challenge (0-shot) | 93,34 | 92,32 | 98,9 % |
| GSM-8K (CoT, 8-shot, strict-match) | 95,38 | 92,34 | 96,8 % |
| Hellaswag (5-shot) | no disponible | no disponible | no disponible |
| Winogrande | no disponible | no disponible | no disponible |
| TruthfulQA | no disponible | no disponible | no disponible |

La model card afirma que la recuperacion media en los seis benchmarks es del 96,8 % respecto al modelo original, pero los datos completos de Hellaswag, Winogrande y TruthfulQA no aparecen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70-75 GB para los pesos en INT8, mas overhead de activaciones y KV cache. Con max_model_len de 8192 tokens, la memoria total necesaria ronda los 80-90 GB.
- GPU recomendadas: para servir en produccion se recomienda al menos 2 GPU de 80 GB (A100 80GB, H100 80GB) o 4 GPU de 40 GB (A100 40GB). En configuracion de prueba, se puede usar una sola GPU de 80 GB como la A100 80GB o RTX 6000 Ada.
- Compatibilidad con GPU consumer: es posible ejecutarlo en multiples RTX 4090 (24 GB) con tensor parallelism, pero la memoria total debe superar los 80 GB, por lo que se necesitan al menos 4 de ellas.
- Opciones de despliegue: vLLM (recomendado y probado en la model card), tambien compatible con text-generation-inference y cualquier framework que lea safetensors y soporte cuantizacion INT8 de pesos.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible. Se espera un throughput menor que el modelo FP16 debido a la cuantizacion, pero con menor uso de memoria y mayor capacidad de batch en la misma infraestructura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meta-Llama-3.1-70B-Instruct (base) | 70,5B | 128k | Llama 3.1 | FP16 safetensors | Modelo original sin cuantizar, 141 GB de pesos |
| Meta-Llama-3.1-70B-Instruct-quantized.w8a16 (este modelo) | 70,5B | 128k | Llama 3.1 | INT8 safetensors | Cuantizacion de pesos a INT8, 72,7 GB |
| Meta-Llama-3.1-70B-Instruct-quantized.w8a8 (variante de RedHatAI) | 70,5B | 128k | Llama 3.1 | INT8 safetensors | Cuantizacion de pesos y activaciones a INT8, mayor reduccion de memoria |

La variante w8a8 logra una recuperacion del 98,8 % en Arena-Hard y 99,9 % en OpenLLM v1 segun los resultados de busqueda, aunque no se dispone de datos completos para comparar directamente con w8a16. No hay informacion sobre otros modelos de 70B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a INT8 introduce una perdida de precision media del 3,2 % en los benchmarks evaluados; en tareas de razonamiento complejo o codigo, la degradacion puede ser mas perceptible.
- El modelo hereda los sesgos y limitaciones de Meta-Llama-3.1-70B-Instruct, incluyendo posibles sesgos de genero, raza y lengua, y riesgo de alucinacion en temas factuales o de baja frecuencia.
- La licencia Llama 3.1 permite uso comercial, pero exige que las aplicaciones con mas de 700 millones de usuarios mensuales soliciten una licencia especifica a Meta. Hay que revisar los terminos de la licencia antes de un despliegue en produccion a gran escala.
- El modelo esta disenado para chat y generacion de texto; no soporta tareas de vision, audio ni tool calling de forma nativa.
- El contexto de 128k tokens es el limite teorico del modelo base, pero en la practica la calidad de las respuestas puede degradarse en contextos muy largos y la memoria de KV cache aumenta proporcionalmente. En el ejemplo de despliegue de la model card se configura max_model_len=8192, lo que sugiere que para uso realista en produccion se recomienda reducir el contexto.
- La cuantizacion solo afecta a los pesos de las capas lineales de los bloques transformer; las capas de embedding y norm permanecen en FP16, por lo que el modelo no es completamente INT8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Meta-Llama-3.1-70B-Instruct-quantized.w8a16
- Modelo base original: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Libreria de compresion llm-compressor: https://github.com/vllm-project/llm-compressor
- Paper GPTQ (arxiv 2210.17323): https://arxiv.org/abs/2210.17323
- Dataset de calibracion: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- Backend vLLM: https://docs.vllm.ai/en/latest/
