# mhseo2/trd_klear_qwen3moe30b_deepscaler-step315

## Resumen

Este repositorio (mhseo2/trd_klear_qwen3moe30b_deepscaler-step315) contiene un checkpoint derivado de Qwen/Qwen3-8B-Base y vinculado a la familia Klear-Reasoner de Kwai-Klear. A pesar de que el identificador del repositorio alude a un supuesto modelo MoE de 30B y a "deepscaler", los pesos reales almacenados en safetensors suman 8.190.735.360 parametros, lo que corresponde a un modelo denso de aproximadamente 8B. Esta discrepancia entre el nombre y el contenido conviene tenerla presente antes de cualquier evaluacion.

El modelo esta orientado al razonamiento de cadena de pensamiento larga (long CoT) en matematicas y programacion. Segun la model card, se construye en dos fases: un SFT de alta calidad destilado de DeepSeek-R1-0528 y un posterior refuerzo con GPPO (Gradient-Preserving Clipping Policy Optimization), una variante de clipping que conserva gradientes de los tokens recortados para mejorar la exploracion. La familia declara resultados SOTA en AIME 2024/2025 y LiveCodeBench V5/V6.

La relevancia actual reside en que propone una receta de RL reproducible (paper CE-GPPO, arXiv 2509.20712) sobre un backbone abierto de 8B con licencia Apache-2.0, un tamano que cabe en GPUs de consumo con cuantizacion. No obstante, al tratarse de un checkpoint intermedio ("step315") no hay garantia de que reproduzca exactamente las cifras publicadas para el modelo final Klear-Reasoner-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B-Base); los pesos confirman modelo denso pese al identificador "moe" |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica: los datos de safetensors indican un modelo denso de 8,19B, no un MoE |
| Longitud de contexto | No disponible de forma explicita; la evaluacion emplea un presupuesto de inferencia de 64K tokens con YaRN (factor de escala 2,5) |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos en safetensors, sin variantes GGUF, GPTQ o AWQ declaradas |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only denso de unos 8B de parametros. Sobre esa base se aplica un SFT centrado en calidad con cadenas de pensamiento largas destiladas de DeepSeek-R1-0528, seguido de un entrenamiento de refuerzo. La innovacion metodologica declarada es GPPO/CE-GPPO: en lugar de descartar por completo el gradiente de los tokens que caen fuera del rango de clipping (como en PPO/DAPO convencional), se retropropaga una senal atenuada desde esos tokens. El objetivo es preservar senal de exploracion y evitar que trayectorias suboptimas se ignoren por completo, controlando ademas la entropia del proceso.

Los datos de RL se apoyan en dos conjuntos publicados: KlearReasoner-MathSub-30K (matematicas) y KlearReasoner-CodeSub-15K (codigo). El pipeline de evaluacion usa sandbox con Firejail para ejecucion de codigo, control multiproceso con Pebble para reclamar recursos en timeouts y math_verify para la correccion de respuestas matematicas. El entrenamiento multi-nodo se orquesta con Ray. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del corpus previo al SFT.

## Capacidades

- Razonamiento matematico de multiples pasos con cadenas de pensamiento largas (AIME 2024/2025, HMMT 2025).
- Resolucion y generacion de codigo competitivo (LiveCodeBench V5 y V6).
- Generacion de texto general, heredada del backbone Qwen3-8B-Base.
- Modo de razonamiento extendido (long CoT), pensado para problemas que requieren deliberacion.
- Capacidad multilingue limitada: solo se declara ingles.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y multi-step reasoning autonomo: no confirmado; el modelo esta optimizado para razonamiento, no se documentan capacidades agenticas.
- Vision o audio: no disponible.

## Casos de uso

- Resolucion de problemas matematicos avanzados: el modelo puede abordar enunciados de competicion (estilo AIME/HMMT) generando cadenas de razonamiento largas, adecuado para tutoria o generacion de soluciones paso a paso.
- Generacion y revision de codigo en entornos de programacion competitiva: sus resultados en LiveCodeBench V5/V6 lo hacen util para producir soluciones y explicar el razonamiento detras de ellas.
- Generacion de datos sinteticos de razonamiento: sirve como profesor para destilar cadenas de pensamiento en modelos menores o para crear datasets de entrenamiento en matematicas y codigo.
- Reproduccion e investigacion en RL: al estar vinculado al paper CE-GPPO y a datasets publicos, es un punto de partida para estudiar clipping, entropia y exploracion en RL de razonamiento.
- Evaluacion automatizada de soluciones: puede actuar como juez o generador de justificaciones en pipelines de verificacion de respuestas matematicas y de codigo.
- Base para fine-tuning de dominio: su tamano de 8B y licencia Apache-2.0 permiten adaptarlo a nichos cuantitativos (finanzas, fisica, ingenieria) partiendo de un backbone ya entrenado en razonamiento.
- Asistente de analisis paso a paso en problemas logicos o cuantitativos, siempre que el uso sea en ingles y se tolere la latencia de cadenas largas.

## Benchmarks y rendimiento

Resultados declarados en la model card (pass@1, avg@64 para AIME/HMMT y avg@8 para LiveCodeBench; temperatura 0,6, top_p 0,95). Cifras correspondientes a Klear-Reasoner-8B-SFT, Klear-Reasoner-8B y la variante con presupuesto de 64K. No se confirma que este checkpoint "step315" coincida con dichas cifras.

| Modelo | AIME2024 avg@64 | AIME2025 avg@64 | HMMT2025 avg@64 | LCB V5 avg@8 | LCB V6 avg@8 |
|---|---|---|---|---|---|
| Klear-Reasoner-8B-SFT | 75,6 | 70,1 | 57,6 | 58,5 | 49,6 |
| Klear-Reasoner-8B | 83,2 | 75,6 | 60,3 | 61,6 | 53,1 |
| Klear-Reasoner-8B (64K, YaRN) | 90,5 | 83,2 | 70,8 | 66,0 | 58,1 |
| Qwen3-8B | 76,0 | 67,3 | 44,7 | 57,5 | 48,4 |
| Deepseek-R1-0528-Distill-8B | 86,0 | 76,3 | 61,5 | 61,0 | 51,6 |
| OpenReasoning-Nemotron-7B | 84,7 | 78,2 | 63,5 | 65,6 | 56,3 |
| AceReason-Nemotron-1.1-7B | 72,6 | 64,8 | 42,9 | 57,2 | 52,1 |
| POLARIS-4B-Preview | 81,2 | 79,4 | 58,7 | 58,5 | 53,0 |
| MiMo-7B-RL | 68,2 | 55,4 | 35,7 | 57,8 | 49,3 |
| Skywork-OR1-7B | 70,2 | 54,6 | 35,7 | 47,6 | 42,7 |
| AReal-boba-RL-7B | 61,9 | 48,3 | 29,4 | 34,3 | 31,0 |

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 16,4 GB, en linea con el tamano del repositorio (16,4 GB).
- Cuantizacion INT8: en torno a 8,2 GB.
- Cuantizacion INT4 (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5 a 5 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S para inferencia en precision completa y alto throughput.
- GPU de consumo: cabe en FP16 en RTX 4090 (24 GB) o RTX 3090 (24 GB); con INT4 puede ejecutarse en tarjetas de 8 a 12 GB (RTX 4070, RTX 3060 12 GB).
- Despliegue: vLLM, SGLang, TGI, llama.cpp y Ollama para cuantizaciones GGUF, y Hugging Face Transformers para pruebas.
- Latencia y throughput: no disponibles en la informacion proporcionada. Las cadenas de razonamiento largas implican una generacion de muchos tokens por respuesta, lo que incrementa la latencia frente a modelos no razonadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME2024 | LCB V5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (familia Klear-Reasoner-8B) | ~8,19B | 64K via YaRN en evaluacion | 83,2 (75,6 en SFT) | 61,6 (58,5 en SFT) | Apache-2.0 | Hugging Face |
| Qwen3-8B | ~8B | no disponible | 76,0 | 57,5 | no disponible | Hugging Face |
| Deepseek-R1-0528-Distill-8B | ~8B | no disponible | 86,0 | 61,0 | no disponible | Hugging Face |
| OpenReasoning-Nemotron-7B | ~7B | no disponible | 84,7 | 65,6 | no disponible | Hugging Face |

En tareas de matematicas y codigo, la familia Klear-Reasoner se situa por encima de Qwen3-8B y cerca de DeepSeek-R1-0528-Distill-8B y OpenReasoning-Nemotron-7B, superandolos en algunas metricas cuando se amplia el presupuesto a 64K. La ventaja practica es su licencia Apache-2.0 y un tamano contenido; la desventaja es que el contexto y las condiciones exactas de evaluacion de los comparadores no se documentan en la informacion disponible.

## Limitaciones y advertencias

- Discrepancia entre identificador y contenido: el repositorio se llama "qwen3moe30b" pero los pesos reales son densos y suman 8,19B. Verificar el contenido antes de asumir arquitectura MoE o 30B.
- Checkpoint intermedio: el sufijo "step315" sugiere un paso de entrenamiento, no necesariamente el modelo final; las cifras de benchmark de la model card pueden no reproducirse en este checkpoint.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Enfoque acotado: el entrenamiento esta centrado en matematicas y codigo; puede degradarse en tareas generales o conversacionales.
- Riesgo de alucinacion: como cualquier LLM, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas fuera de su distribucion.
- Coste computacional: las cadenas de pensamiento largas consumen muchos tokens, elevando la latencia y el coste de inferencia en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los terminos del backbone Qwen3-8B-Base y de los datasets empleados.
- Trazabilidad de benchmarks: las cifras publicadas corresponden a la familia Klear-Reasoner, no a este repositorio concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/trd_klear_qwen3moe30b_deepscaler-step315
- Modelo de referencia Klear-Reasoner-8B: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B
- Paper principal (PDF): https://arxiv.org/pdf/2508.07629
- Paper principal (HF Papers): https://huggingface.co/papers/2508.07629
- Paper CE-GPPO (arXiv 2509.20712): https://arxiv.org/abs/2509.20712
- Dataset Math RL: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-MathSub-30K
- Dataset Code RL: https://huggingface.co/datasets/Kwai-Klear/KlearReasoner-CodeSub-15K
- Repositorio de codigo de entrenamiento: https://github.com/suu990901/Klear_Reasoner
- Issues y discusiones: https://github.com/suu990901/KlearReasoner/issues
- Contacto del autor: suzhenpeng13@163.com
