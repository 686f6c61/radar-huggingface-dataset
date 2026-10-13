# cpral/instruktor-lotnictwa-7B-2-hf-W8A8-INT8

## Resumen
`cpral/instruktor-lotnictwa-7B-2-hf-W8A8-INT8` es un checkpoint de un modelo de lenguaje de aproximadamente 7.476 millones de parametros, publicado por el usuario cpral en Hugging Face. El nombre del repositorio sugiere que se trata de un ajuste fino orientado a la instruccion aeronautica ("instruktor lotnictwa" significa instructor de aviacion en polaco), y el sufijo "2" apunta a una segunda version del modelo base. La etiqueta `llama` indica que la arquitectura subyacente es un transformer decoder-only de tipo Llama.

Lo mas relevante de este checkpoint es que no es un modelo base en precision completa, sino una version cuantizada a INT8 en la modalidad W8A8 (pesos y activaciones en enteros de 8 bits). Esta cuantizacion se ha generado con la libreria `compressed-tensors`, el formato que emplea LLM Compressor y que es soportado de forma nativa por vLLM. El resultado ocupa 7,7 GB en disco, lo que reduce de forma notable los requisitos de VRAM frente al equivalente en FP16/BF16 y habilita el despliegue en GPU de gama alta de consumo.

El interes practico del modelo radica en combinar un ajuste fino de dominio especifico (aeronautica) con una representacion cuantizada optimizada para inferencia. Ahora bien, la ficha publica es muy escasa: no se declaran licencia, idiomas soportados, pipeline ni resultados de evaluacion, por lo que buena parte de sus caracteristicas deben inferirse de las etiquetas y del propio nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama (segun etiqueta `llama`) |
| Parametros totales | 7.476.678.656 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones a 8 bits) mediante `compressed-tensors` |
| Idiomas soportados | no disponible (el nombre sugiere polaco) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato `compressed-tensors`) |

## Arquitectura y entrenamiento
Segun las etiquetas del repositorio, el modelo parte de una arquitectura Llama: un transformer decoder-only con atencion causal. El checkpoint distribuido es una conversion cuantizada del modelo ajustado (`7B-2-hf`) a INT8 W8A8, realizada con el ecosistema `compressed-tensors` / LLM Compressor. En esta modalidad se cuantizan tanto los pesos como las activaciones a enteros de 8 bits, con escalas de cuantizacion almacenadas junto a los tensores, lo que permite inferencia acelerada en hardware que soporte kernels INT8.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF/DPO, tecnicas de alineacion o datos de la fase de ajuste instruccional. El nombre "instruktor lotnictwa" sugiere un ajuste fino supervisado sobre material de dominio aeronautico en polaco, pero este extremo no se confirma en la informacion disponible ni en los resultados de busqueda, por lo que debe tratarse como una inferencia no verificada.

## Capacidades
- Generacion de texto e instruccion conversacional, heredadas del modelo base Llama de 7B.
- Especializacion probable en contenido aeronautico (terminologia, procedimientos, formacion de pilotos), segun el nombre del repositorio.
- Soporte multilingue: no disponible; el nombre sugiere un sesgo hacia el polaco, pero no se confirma.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio, modo de razonamiento explicito (thinking): no disponible.

## Casos de uso
- Formacion aeronautica asistida: el modelo podria emplearse como tutor conversacional para responder dudas sobre procedimientos, reglamentacion o meteorologia, dado su presumible ajuste de dominio; la idoneidad real depende del dataset usado, no documentado.
- Generacion de material didactico para escuelas de vuelo: redaccion de resumenes, preguntas de examen o explicaciones de maniobras, siempre con revision humana por el riesgo de alucinacion en contenido tecnico.
- Despliegue en infraestructura con VRAM limitada: al estar cuantizado a INT8, ocupa aproximadamente 7,5 GB en pesos, lo que permite servir el modelo en una unica GPU de consumo de 16-24 GB, algo inviable en FP16 sin cuantizar.
- Inferencia de alto rendimiento con vLLM: el formato `compressed-tensors` W8A8 es compatible con el motor de vLLM, por lo que encaja en servicios de API interna con requisitos de throughput.
- Asistente de consulta documental (RAG) sobre manuales de aviacion: combinado con un indice vectorial, podria responder preguntas ancladas a documentacion, aprovechando su especializacion tematica.
- Prototipado e investigacion en cuantizacion: sirve como ejemplo reproducible de conversion de un ajuste fino de 7B a W8A8 INT8 y de comparacion de calidad frente al modelo original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La ficha de Hugging Face no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, ni comparaciones frente al modelo sin cuantizar. Tampoco se documentan perdidas de calidad derivadas de la cuantizacion W8A8.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 7,5 GB solo para pesos INT8; el consumo total depende del contexto y del tamano de lote (KV cache en precision de activacion). Como referencia orientativa, entre 9 y 12 GB para contextos moderados.
- GPU recomendadas: NVIDIA A100, H100, L40S para despliegue en servidor con kernels INT8; RTX 4090, RTX 4080 y RTX 3090 para uso local.
- GPU de consumo: si cabe en tarjetas de 16 GB o mas (RTX 4080, 4090, 3090, 4060 Ti de 16 GB). En tarjetas de 12 GB el margen es ajustado y dependera del contexto.
- Opciones de despliegue: vLLM es la opcion natural por el soporte nativo de `compressed-tensors` INT8 W8A8. Otros motores requeririan conversion de formato (por ejemplo, a GGUF) para aprovechar la cuantizacion.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones propias; como referencia general del metodo, la documentacion de vLLM y de checkpoints W8A8 equivalentes cita aceleraciones de hasta ~1,5x frente a FP16 en despliegues single-stream, pero estos datos corresponden a otros modelos y no deben atribuirse a este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `cpral/instruktor-lotnictwa-7B-2-hf-W8A8-INT8` | 7,48 B | no disponible | no disponible | safetensors INT8 W8A8 |
| Mistral-7B-Instruct-v0.3 | ~7,25 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-7B-Instruct | ~7,6 B | 131.072 tokens | Apache 2.0 | safetensors, GGUF |
| Meta Llama 3.1 8B Instruct | ~8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF |

La comparacion debe tomarse con cautela: los tres modelos de referencia son asistentes de proposito general con documentacion completa de licencia, contexto y evaluaciones, mientras que el modelo de cpral es un ajuste de dominio cuantizado del que solo se conocen el tamano y el metodo de cuantizacion. La ventaja diferencial del checkpoint de cpral seria la especializacion tematica y el menor consumo de memoria, no un rendimiento general superior.

## Limitaciones y advertencias
- La licencia no esta declarada, por lo que no puede confirmarse que sea apto para uso comercial; conviene verificar los terminos del modelo base antes de cualquier despliegue en produccion.
- No se documentan sesgos conocidos, pero al ser un ajuste de dominio en un idioma concreto (probablemente polaco) puede rendir peor en otros idiomas y heredar los sesgos del corpus de entrenamiento.
- Riesgo de alucinacion relevante en contenido tecnico aeronautico: cualquier respuesta sobre procedimientos, normativa o seguridad debe validarse con fuentes oficiales.
- No se han publicado evaluaciones, por lo que no hay evidencia cuantitativa de la perdida de calidad introducida por la cuantizacion W8A8.
- La fecha de creacion del repositorio aparece como 2026-10-13, posterior a la fecha de consulta; conviene comprobar la vigencia y autenticidad del contenido.
- El repositorio tiene 0 descargas y 1 "like", por lo que carece de validacion por parte de la comunidad.
- La compatibilidad de despliegue esta practicamente restringida a motores que entiendan `compressed-tensors` (principalmente vLLM); otros runners no cargaran los pesos directamente.

## Enlaces
- Hugging Face: https://huggingface.co/cpral/instruktor-lotnictwa-7B-2-hf-W8A8-INT8
- Documentacion de vLLM sobre cuantizacion INT8 W8A8: https://docs.vllm.ai/en/stable/features/quantization/llm_compressor/int8_w8a8/
- Documentacion de vLLM-Omni sobre INT8 W8A8: https://docs.vllm.ai/projects/vllm-omni/en/latest/user_guide/quantization/int8/
- Ejemplo de checkpoint W8A8 de referencia (Qwen2.5-VL-7B-Instruct): https://huggingface.co/RedHatAI/Qwen2.5-VL-7B-Instruct-quantized.w8a8
- Referencia de modelo base Llama 7B (Mistral-7B-Instruct): https://huggingface.co/model-hub/Mistral-7B-Instruct-v0.2
