# Mia-AiLab/GLM-5.3-DERISKED-Cyber-EXL3-4bpw

## Resumen

GLM-5.3-DERISKED-Cyber-EXL3-4bpw es una cuantización de 4 bits del fine-tune GLM-5.3-DERISKED, publicado por Mia-AiLab a partir de la versión BF16 de Blackfrost-Research. El modelo subyacente es un GLM-5.3 completo de 78 capas con arquitectura `GlmMoeDsaForCausalLM`, atención DSA (DeepSeek-style sparse attention), 256 expertos enrutados y una capa MTP nativa para decodificación especulativa. Con 210.220 millones de parámetros totales y un repositorio de 420,5 GB, está pensado para servir en hardware de gama alta mediante paralelismo tensorial.

La particularidad de esta versión es que solo se cuantizan los expertos enrutados (capas 3-77), mientras que embeddings, `lm_head`, atención, expertos compartidos, capas densas, router y capa MTP se copian byte a byte en BF16 desde la release original. El resultado es una huella de 4 bits por peso en la parte mayoritaria de la red con una degradación medida muy baja respecto al modelo padre: divergencia KL top-20 de 0,057 en el panel general de 72 ventanas y de 0,008 en el panel de código de 8K.

Es relevante ahora porque demuestra que las cuantizaciones EXL3 de 4 bits sobre MoE masivos pueden acercarse al rendimiento del BF16 original, y porque el autor publica métricas de fidelidad comparables frente a otras alternativas de 4 bits (EXLR8, K4, NVFP4). El caso de uso declarado es el despliegue en 4 nodos DGX Spark con TensorFold y TP=4, aunque también puede servirse en configuraciones multi-GPU convencionales. El modelo se distribuye bajo la licencia GLM-5.3 de Z.AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (transformer MoE con atención DSA, 78 capas, MTP nativa) |
| Parametros totales | 210.220.001.280 (210,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bpw (expertos enrutados), BF16/FP32 para el resto |
| Idiomas soportados | en, zh (la model card incluye paneles de evaluación en japonés y ruso) |
| Licencia | GLM-5.3 License (Z.AI); la cuantización se distribuye bajo los mismos términos |
| Formato de pesos | safetensors (49 shards, 232.385 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 78 capas y 256 expertos enrutados por capa, atención DSA con indexer y una capa MTP (multi-token prediction) que permite decodificación especulativa. Las capas 0-2 son densas (MLP clásico) y a partir de la capa 3 se activan los expertos enrutados. El checkpoint incluye los tensores de atención, router, expertos compartidos, normas, embeddings y `lm_head` sin modificar respecto a la release BF16.

La cuantización se realizó con `exllamav3` (commit `8c593e4e`, con parches locales para la fuente FP8 y la copia byte a byte desde BF16). Los expertos enrutados se cuantizaron a 4 bits por peso con codebook `mul1` (`0x83DCD12D`) y escalas de salida, partiendo de la release FP8 (E4M3 con escalas de bloque 128x128). La calibración usó un conjunto híbrido en inglés de 523 filas de hasta 4.096 tokens (786.243 tokens en total), con predominio de código de repositorio (260.856 tokens), intercambios de tool-calling (196.608), razonamiento matemático (65.536), código algorítmico (65.536), chat multi-turno (65.536), texto de referencia en inglés (61.440) y seguridad defensiva/ofensiva (35.098/34.428). No se detalla el proceso de entrenamiento del fine-tune DERISKED ni datos de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino, con paneles de evaluación adicionales en japonés y ruso.
- Razonamiento matemático y algorítmico: el conjunto de calibración incluye explícitamente matemáticas y código algorítmico.
- Generación y edición de código de repositorio, con panel específico de 8K tokens que muestra la menor degradación de todas las métricas (KL 0,008, acuerdo top-1 del 97,82%).
- Tool calling / function calling: el conjunto de calibración dedica 196.608 tokens a intercambios de tool-calls.
- Razonamiento multi-turno y flujos de agente, dado el soporte de chat multi-turno en calibración y la capa MTP para decodificación especulativa.
- Capacidades de seguridad ofensiva y defensiva, presentes en el conjunto de calibración (34.428 y 35.098 tokens respectivamente).
- Decodificación especulativa nativa mediante la capa MTP incluida en el checkpoint.

## Casos de uso

- Asistencia de código en producción: el modelo mantiene un acuerdo top-1 del 97,82% con el padre en el panel de código de 8K, por lo que puede usarse para autocompletado, revisión de PRs y generación de tests en pipelines de CI/CD con degradación mínima respecto al BF16.
- Agentes con tool calling: los 196.608 tokens de calibración dedicados a intercambios de tool-calls y la ventana de contexto del GLM-5.3 lo hacen adecuado para orquestación de funciones, consultas a APIs y flujos multi-paso.
- Razonamiento matemático asistido: útil para resolución de problemas paso a paso, verificación de cálculos y generación de explicaciones en entornos educativos o de análisis financiero.
- Chat multi-turno en inglés y chino: atención al cliente o asistentes internos bilingües, con la salvedad de que el panel de chat es el que muestra mayor divergencia (KL 0,103) y conviene validar la calidad conversacional antes de desplegar.
- Análisis de seguridad defensiva: auditoría de código, revisión de configuraciones y generación de informes de vulnerabilidades, aprovechando los datos de seguridad defensiva del conjunto de calibración.
- Despliegue en clústeres DGX Spark: el autor indica que sirve en 4 nodos DGX Spark con TensorFold y TP=4, lo que lo hace viable para laboratorios con ese hardware concreto.
- Investigación sobre cuantización: el checkpoint incluye `conversion-report.json` y `SHA256SUMS`, lo que facilita reproducir y auditar el proceso de cuantización en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de fidelidad de cuantización frente al modelo padre, que se reproducen a continuación.

| Panel | KL top-20 [IC 95%] | Acuerdo top-1 | Flips con referencia >90% |
|---|---|---|---|
| Panel de 72 ventanas, todos los dominios (67 x 2.048 tokens, 82.177 posiciones) | 0,057 [0,048; 0,066] | 93,19% | 251 (0,31%) |
| Panel de código 8K (2 x 8.192 tokens, 12.156 posiciones) | 0,008 [0,004; 0,013] | 97,82% | 2 (0,02%) |

| Dominio | KL top-20 [IC 95%] | Top-1 | Flips confiables | NLL referencia / cuantizado |
|---|---|---|---|---|
| Código | 0,035 [0,021; 0,049] | 96,75% | 0,23% | 0,361 / 0,378 |
| Japonés | 0,033 [0,025; 0,042] | 93,08% | 0,09% | 1,359 / 1,366 |
| Ruso | 0,039 [0,032; 0,045] | 94,09% | 0,16% | 0,924 / 0,934 |
| Chino | 0,050 [0,038; 0,062] | 92,84% | 0,22% | 1,097 / 1,115 |
| Prosa | 0,072 [0,044; 0,101] | 92,91% | 0,48% | 0,901 / 0,917 |
| Chat | 0,103 [0,076; 0,130] | 90,94% | 0,60% | 1,260 / 1,260 |
| Todos | 0,057 [0,048; 0,066] | 93,19% | 0,31% | 1,030 / 1,041 |

Comparativa de error de cuantización frente a otras builds de 4 bits de GLM-5.3 (cada una medida contra su propio padre):

| Build (padre) | KL top-20, panel 72 ventanas | Top-1 | KL panel código 8K |
|---|---|---|---|
| Esta cuantización, EXL3 4 bpw (GLM-5.3-Derisked) | 0,057 | 93,19% | 0,008 |
| EXLR8 up1 (GLM-5.3) | 0,059 | 93,11% | 0,011 |
| EXLR8 bit338 (GLM-5.3) | 0,092 | 91,43% | 0,013 |
| K4 (GLM-5.3) | 0,112 | 90,56% | 0,021 |
| NVFP4 (GLM-5.3) | 0,116 | 90,32% | 0,021 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 420,5 GB (391,6 GiB) en safetensors; con overhead de runtime y caché KV conviene reservar al menos 450-500 GB de memoria agregada.
- GPU recomendadas: el autor valida el despliegue en 4 nodos DGX Spark con TensorFold y TP=4. No se especifican otras configuraciones validadas.
- No cabe en una GPU de consumo individual (RTX 4090, 24 GB) ni en una única GPU profesional de 80 GB; requiere paralelismo multi-GPU o multi-nodo.
- Opciones de despliegue: TensorFold (motor citado por el autor) y exllamav3 (formato EXL3). No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles con este checkpoint.
- Latencia y throughput: no disponibles. La capa MTP nativa puede acelerar la decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-DERISKED-Cyber-EXL3-4bpw (este) | 210,2 B | no disponible | EXL3 4 bpw | GLM-5.3 | Hugging Face |
| GLM-5.3-DERISKED-BF16 (padre) | no disponible | no disponible | BF16 | GLM-5.3 | Hugging Face |
| GLM-5.3-Derisked-FP8 | no disponible | no disponible | FP8 E4M3 | GLM-5.3 | Hugging Face |
| EXLR8 up1 (GLM-5.3) | no disponible | no disponible | 4 bits | GLM-5.3 | no disponible |
| K4 (GLM-5.3) | no disponible | no disponible | 4 bits | GLM-5.3 | no disponible |
| NVFP4 (GLM-5.3) | no disponible | no disponible | NVFP4 | GLM-5.3 | no disponible |

Las builds comparadas se citan en la model card únicamente por sus métricas de fidelidad; no se detallan parámetros, contexto ni repositorios de origen. No se dispone de comparación con modelos de otras familias (Llama, Qwen, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- El panel de chat es el que presenta mayor divergencia respecto al padre (KL 0,103, top-1 90,94%, 0,60% de flips confiables); conviene validar la calidad conversacional antes de usarlo en producción.
- Las métricas de fidelidad miden únicamente el error de cuantización, no la distancia del fine-tune DERISKED respecto al GLM-5.3 original de Z.AI.
- El modelo base es un fine-tune "derisked" de origen no documentado en la información disponible; no se detallan los datos ni el proceso de ajuste.
- Idiomas declarados: inglés y chino. Los paneles de japonés y ruso son evaluaciones de fidelidad, no una garantía de calidad multilingüe.
- Licencia GLM-5.3 de Z.AI: es responsabilidad del receptor cumplir los términos upstream y los de la release de Blackfrost-Research; conviene revisar el archivo `LICENSE` antes de uso comercial.
- El modelo incluye capacidades de seguridad ofensiva en su calibración; debe aplicarse filtrado y políticas de uso en despliegues públicos.
- No se han publicado datos de benchmarks de tareas ni de latencia/throughput, lo que dificulta estimar el coste operativo real.
- El despliegue requiere hardware multi-GPU o multi-nodo; no es viable en estaciones de trabajo con una sola GPU.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier LLM de este tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/Mia-AiLab/GLM-5.3-DERISKED-Cyber-EXL3-4bpw
- Modelo base (BF16): https://huggingface.co/Blackfrost-Research/GLM-5.3-DERISKED-BF16
- Release FP8 usada como fuente de cuantización: https://huggingface.co/Blackfrost-Research/GLM-5.3-Derisked-FP8
- Repositorio del autor del fine-tune: https://huggingface.co/Blackfrost-Research
- Conversor exllamav3: https://github.com/turboderp-org/exllamav3
- Motor de serving TensorFold: https://github.com/ashhart/TensorFold
