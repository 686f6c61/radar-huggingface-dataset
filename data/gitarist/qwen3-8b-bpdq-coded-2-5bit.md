# gitarist/Qwen3-8B-BPDQ-coded-2.5bit

## Resumen

BPDQ coded 2.5-bit es una cuantización extrema del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario `gitarist` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una reescritura de los pesos lineales de Qwen3-8B en tres planos de bits por peso, con codificación de los dos planos bajos por bloques de 8 pesos, de forma que cada bloque ocupa 18 bits. Sumando coeficientes fp16 cada 256 columnas, el resultado son 2,5 bits por peso en las capas lineales, con embeddings a 4 bits y cabeza de salida a 8 bits, en un repositorio de 3,8 GB.

El interés técnico está en el método de compresión: combina codificación block-Babai, un codeword de peso par de 7 bits para el segundo plano y un código Reed-Muller RM(1,3) de 3 bits para el tercero, lo que permite reconstruir los pesos con una penalización de calidad medible (KL de 0,254 frente a fp16 en WikiText-2) y sin necesidad de recalcular quantización en tiempo de carga. Sobre esa base se aplicaron 3.056 pasos de QAT con destilación de conocimiento y 250 pasos de GRPO para recuperar capacidades.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo de aproximadamente 8 mil millones de parámetros en una única GPU consumer con un consumo de memoria muy inferior al de las cuantizaciones de 4 bits habituales; por otro, el precio a pagar es un deterioro claro en tareas de conocimiento factual y en tool calling multi-turno, por lo que su nicho son despliegues con requisitos estrictos de VRAM y cargas de trabajo conversacionales o de razonamiento acotado. La integración requiere un módulo Python propio (`bpdq`) que registra el método de cuantización en vLLM, y solo funciona en CUDA con sm80 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B), con pesos lineales cuantizados en planos de bits codificados (BPDQ) |
| Parametros totales | Modelo base Qwen3-8B (~8,2 mil millones); el índice de safetensors del repo declara 1.001.803.008 elementos almacenados, correspondientes a la representación empaquetada a 2,5 bits |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; corresponde a la del modelo base Qwen3-8B (32.768 tokens nativos, ampliables a 131.072 con YaRN segun la documentacion de Qwen) |
| Tipos de cuantizacion | BPDQ 2,5 bits en pesos lineales (3 planos de bits por peso; 18 bits por bloque de 8 pesos; coeficientes fp16 cada 256 columnas); embeddings a 4 bits; cabeza de salida a 8 bits |
| Idiomas soportados | No disponible (la model card no declara idiomas; se heredan los del modelo base Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con tensores empaquetados, mas modulo Python `bpdq` para vLLM/Transformers; no hay GGUF, GPTQ ni AWQ publicados |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con atención completa, sin mezcla de expertos y con modo de razonamiento explícito ("think"). Lo que cambia es la representación de los pesos. Cada peso lineal se descompone en tres planos de bits: el primero se almacena tal cual, el segundo como codeword de peso par (7 bits) y el tercero como uno de los 8 codewords del código Reed-Muller RM(1,3) (3 bits). Eso da 18 bits por cada 8 pesos; añadiendo coeficientes fp16 compartidos cada 256 columnas, la tasa efectiva queda en 2,5 bits por peso. Las matrices de embedding se guardan a 4 bits y la cabeza de salida a 8 bits, lo que explica que el repositorio ocupe 3,8 GB en disco.

El proceso de construcción descrito por el autor tiene tres fases: primero una codificación block-Babai de los pesos originales, después 3.056 pasos de QAT con destilación de conocimiento desde el modelo fp16 (KD QAT) y finalmente 250 pasos de GRPO. No se detallan la composición del dataset de destilación, el tamaño del lote, la tasa de aprendizaje ni los hiperparámetros de GRPO. La decodificación es la estándar del transformer; la innovación se concentra en el esquema de compresión y en el kernel de reconstrucción al vuelo que implementa el método `bpdq` para vLLM.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte del modo de razonamiento de Qwen3 (`think` / no-think) heredado del modelo base.
- Razonamiento matemático de tipo escolar: 84,2 en GSM8K sin modo think y 87,6 con presupuesto de pensamiento de 1.024 tokens.
- Generación de código en Python: 71,3 en HumanEval y 57,6 en MBPP.
- Tool calling / function calling: 93,8 en BFCL simple, 93,0 en multiple, 93,5 en parallel, 87,0 en parallel-multiple y 81,7 en irrelevance.
- Seguimiento de instrucciones con formato estricto: 76,3 en IFEval (prompt strict).
- Conocimiento factual limitado: 37,3 en TriviaQA 5-shot, muy por debajo de fp16.
- Capacidades de agente multi-paso: parciales; el apartado multi-turno de BFCL cae a 31,0 frente a 45,0 en fp16.
- Capacidades multilingües: no verificadas en la información disponible; dependen íntegramente de lo que conserve el proceso de cuantización sobre Qwen3-8B.
- No se documentan capacidades de visión ni de audio (el modelo base es solo texto).

## Casos de uso

- Despliegue de un asistente conversacional en una única GPU consumer: con 3,8 GB de pesos, el modelo cabe holgadamente en tarjetas de 8-12 GB, dejando el resto de VRAM para caché KV y permitiendo atender varias sesiones concurrentes con contexto largo.
- Generación de código asistida en entornos con presupuesto de memoria: sus 71,3 en HumanEval lo hacen utilizable para autocompletado y generación de funciones Python, integrándolo en el IDE o en un servicio interno donde no se pueda asumir una GPU de 24 GB para el modelo en fp16.
- Enrutamiento y orquestación de herramientas: los 93,8 / 93,0 / 93,5 en las pruebas BFCL de llamada simple, múltiple y paralela permiten usarlo como "tool router" barato que decide qué función invocar antes de delegar la ejecución en un modelo mayor.
- Extracción y formateo de datos estructurados: con 76,3 en IFEval, es adecuado para tareas de resumen con plantilla fija, clasificación con formato JSON y normalización de registros, donde el coste por token importa más que el conocimiento enciclopédico.
- Razonamiento matemático por lotes (batch offline): 87,6 en GSM8K con 1.024 tokens de pensamiento lo hacen viable para procesar grandes volúmenes de problemas aritméticos o de verificación de cálculos en pipelines nocturnos, con throughput agregado alto gracias a los 7.000 tok/s a batch 256 que reporta el autor.
- Servicio de alto rendimiento en vLLM: los 231 tok/s a batch 1 y 4.500 tok/s a batch 32 en una RTX 4090 permiten montar un endpoint de inferencia de bajo coste para resúmenes, reescritura y respuestas cortas.
- Prototipado e investigación sobre cuantización extrema: sirve como caso de estudio reproducible de QAT con destilación más GRPO sobre un esquema de codificación de planos de bits, útil para grupos que investiguen compresión por debajo de 3 bits.
- Base para fine-tuning ligero en dominios acotados: al estar bajo Apache 2.0 y ocupar poco, se puede adaptar con LoRA a un dominio concreto (por ejemplo, soporte técnico interno) donde el conocimiento factual del modelo base sea irrelevante.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | fp16 (Qwen3-8B) | Este modelo (2,5 bits) |
|---|---|---|
| bits/peso (capas lineales) | 16 | 2,5 |
| KL frente a fp16, WikiText-2 | 0 | 0,254 |
| GSM8K nothink | 91,7 | 84,2 |
| GSM8K think @1024 | 83,0 | 87,6 |
| HumanEval | 82,9 | 71,3 |
| MBPP | 66,6 | 57,6 |
| IFEval (prompt strict) | 81,7 | 76,3 |
| TriviaQA 5-shot | 56,7 | 37,3 |
| BFCL simple | 94,5 | 93,8 |
| BFCL multiple | 96,5 | 93,0 |
| BFCL parallel | 94,0 | 93,5 |
| BFCL parallel-multiple | 91,0 | 87,0 |
| BFCL irrelevance | 83,8 | 81,7 |
| BFCL multi-turn | 45,0 | 31,0 |
| Media de 12 tareas | 80,6 | 74,5 |

Throughput de decodificación medido por el autor con vLLM en una RTX 4090: 231 tok/s con batch 1, 900 con batch 4, 4.500 con batch 32 y 7.000 con batch 256.

## Requisitos de hardware

- Pesos en disco y en memoria: 3,8 GB. Estimación de VRAM para inferencia: aproximadamente 4-5 GB para pesos más caché KV; el consumo real depende de la longitud de contexto y del número de secuencias concurrentes (estimación propia, no publicada por el autor).
- GPU compatibles: solo CUDA con compute capability sm80 o superior, es decir, A100, H100, A10, L4, RTX 3090, RTX 4090 y series posteriores. Quedan fuera GPUs anteriores a Ampere, Apple Silicon, ROCm y CPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 8 GB o más (RTX 3060 Ti/4060 Ti, RTX 3070/4070, RTX 3080/4080, RTX 4090). La RTX 4090 es la referencia usada por el autor para las cifras de throughput.
- Opciones de despliegue: exclusivamente vLLM con el módulo `bpdq` importado previamente (`LLM(..., quantization="bpdq", dtype="float16")` o `vllm serve ... --quantization bpdq --dtype float16`). El autor indica que `bpdq.load(MODEL_DIR)` devuelve un modelo de Transformers, pero no documenta soporte para llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: 231 tok/s por secuencia a batch 1 y hasta 7.000 tok/s agregados a batch 256 en una RTX 4090, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | bits/peso | Tamano en disco | Contexto | Media 12 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-8B (fp16) | ~8,2 B | 16 | ~16 GB (no indicado en la info) | 32.768 nativos / 131.072 con YaRN | 80,6 | Apache 2.0 | HuggingFace oficial |
| Qwen3-8B-BPDQ-coded 2.5bit | ~8,2 B (1.001.803.008 elementos empaquetados) | 2,5 | 3,8 GB | No indicado (heredado del base) | 74,5 | Apache 2.0 | HuggingFace, autor individual, 0 descargas |
| Cuantizaciones de 4 bits de Qwen3-8B (AWQ/GPTQ) | ~8,2 B | ~4 | ~5-6 GB | Igual que el base | No disponible | Apache 2.0 | Múltiples repos comunitarios |

No se dispone de resultados de benchmarks publicados para las alternativas de 4 bits dentro de la información proporcionada, por lo que la comparación numérica directa solo puede hacerse contra el fp16 del propio autor. Frente a la cuantización de 4 bits, este modelo reduce el espacio en disco un 25-35 % adicional a cambio de una pérdida de calidad documentada y de un ecosistema de despliegue mucho más restringido (solo vLLM con módulo propio).

## Limitaciones y advertencias

- Pérdida de conocimiento factual muy marcada: TriviaQA 5-shot cae de 56,7 a 37,3, un descenso de casi 20 puntos que anticipa una tasa de alucinación sensiblemente mayor en preguntas abiertas sobre hechos.
- Deterioro relevante en código: HumanEval baja de 82,9 a 71,3 y MBPP de 66,6 a 57,6. No es recomendable como generador de código en producción sin revisión humana ni tests automáticos.
- Tool calling multi-turno degradado: BFCL multi-turn cae de 45,0 a 31,0, por lo que los flujos de agente con varias rondas de herramientas son el punto más débil frente al modelo original.
- Divergencia de distribución medible: KL de 0,254 frente a fp16 en WikiText-2; no es una cuantización "casi sin pérdida" y conviene validar sobre el dominio concreto antes de desplegar.
- Solo CUDA sm80+: sin soporte para CPU, Apple Silicon, ROCm ni GPUs anteriores a Ampere. Requiere importar el paquete `bpdq` antes de instanciar vLLM, lo que añade un paso de integración no estándar en pipelines existentes.
- Ecosistema de despliegue cerrado: no hay GGUF, ni soporte en llama.cpp/Ollama/TGI, ni kernels para TensorRT-LLM. La portabilidad es prácticamente nula.
- Idiomas no declarados: la model card no enumera idiomas y no hay evaluación multilingüe; el rendimiento fuera de inglés es desconocido y probablemente inferior al del base.
- Madurez y trazabilidad: repositorio publicado por un autor individual, con 0 descargas y 0 likes en el momento de la consulta, sin paper asociado ni evaluación independiente que reproduzca las cifras. Los benchmarks son autodeclarados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el aviso de copyright y las condiciones deben mantenerse; conviene verificar además la licencia del modelo base Qwen3-8B, que es la misma.
- Inconsistencia de conteo de parámetros: el índice de safetensors declara 1.001.803.008 elementos, muy lejos de los ~8,2 B del modelo base, porque los tensores están empaquetados; no debe interpretarse como un modelo de 1 B de parámetros ni usarse para estimar capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gitarist/Qwen3-8B-BPDQ-coded-2.5bit
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog o repositorio del método BPDQ: no disponible en la información proporcionada.
- Demo o espacio de inferencia: no disponible.
- Enlaces adicionales: la búsqueda web no devolvió resultados relevantes para este modelo.
