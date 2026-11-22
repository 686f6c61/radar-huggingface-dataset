# iromu/Qwen3-0.6B-tools-GGUF

## Resumen

Qwen3-0.6B-tools-GGUF es la conversión al formato GGUF del ajuste fino iromu/Qwen3-0.6B-tools, un modelo derivado de Qwen/Qwen3-0.6B (596.049.920 parámetros) especializado en emisión fiable de llamadas a herramientas en estilo OpenAI. Lo desarrolla el usuario iromu y su propósito es concreto: convertir un modelo base diminuto en un emisor de `tool_calls` estructurados utilizable en entornos de agentes con recursos muy limitados, algo que el modelo original hace de forma casi anecdótica (17,5% de llamadas emitidas en la validación del autor).

El interés práctico está en el binomio tamaño/fiabilidad: con menos de 600 millones de parámetros y cuantizaciones que ocupan unos cientos de megabytes, alcanza un 99,3% de emisión de llamadas y hasta un 66,1% de coincidencia exacta de argumentos en Q8_0, según la tabla de validación publicada. Eso lo sitúa como candidato para despliegue en dispositivo, edge y pipelines de enrutamiento de herramientas donde no cabe un modelo de 7B o superior.

La ficha cubre la versión GGUF; el modelo BF16 completo, su tabla de validación extendida y un checkpoint NVFP4 se publican como artefactos hermanos. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias de 4096 tokens |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q6_K, Q8_0, y familia imatrix UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, UD-Q8_K_XL |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 8,8 GB con todas las variantes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ajusta mediante SFT con LoRA ejecutado con NeMo-RL. La configuración del adaptador es dim 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj` (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento usa precisión bfloat16, AdamW con lr 5e-5 y weight decay 0,01, calentamiento lineal de 15 pasos seguido de decaimiento coseno hasta 1e-6, batch global 64 (micro batch 2) y 336 pasos con validación cada 84. La longitud máxima de secuencia fue de 4096 tokens y la pérdida es entropía cruzada enmascarada a los turnos del asistente mediante la palabra clave `generation` de la plantilla de chat.

Los datos provienen del split `sft_tools` del dataset r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation, en formato `messages` de OpenAI con `tool_calls` en los turnos del asistente. No se documenta RLHF ni DPO, ni el volumen total de tokens de entrenamiento. La innovación destacable no está en la arquitectura sino en el proceso de cuantización: la familia UD-* usa una importance matrix calibrada sobre el split de entrenamiento (nunca sobre el de validación) para asignar bits por tensor según importancia de activación, lo que produce archivos de tamaño cercano a su nivel nominal con mejor fidelidad que la cuantización uniforme equivalente.

## Capacidades

- Emisión de llamadas a herramientas en formato OpenAI (`tool_calls`), con nombres de función y argumentos estructurados.
- Function calling orientado a flujos agénticos de varios pasos, según el uso previsto declarado por el autor.
- Conversación multi-turno con historial en formato `messages`.
- Enrutamiento y selección de herramienta entre un conjunto dado, medido en la validación del autor.
- Generación de texto general heredada del modelo base Qwen3-0.6B, aunque el autor advierte explícitamente que no sustituye a modelos Qwen mayores.
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- Sin soporte declarado de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutador de herramientas en un agente: el modelo recibe el catálogo de funciones y el turno del usuario y devuelve la llamada concreta; su 99,3% de emisión en Q8_0 lo hace viable como primera etapa antes de un modelo mayor que ejecute el razonamiento profundo.
- Despliegue en dispositivo y edge: con cuantizaciones Q4_K_M o Q5_K_M el peso cabe en memoria de móviles, Raspberry Pi o portátiles sin GPU dedicada, y el formato GGUF se ejecuta directamente en llama.cpp.
- Extracción estructurada en pipelines de datos: convertir texto libre en llamadas a funciones tipadas para alimentar sistemas de ingestión, sin necesidad de un modelo grande ni de servicios externos.
- Automatización de escritorio y asistentes locales: al no requerir GPU de gama alta, se integra en herramientas de automatización que traducen instrucciones en lenguaje natural a acciones sobre APIs locales.
- Pruebas y CI de sistemas agénticos: su huella reducida permite levantar un emisor de tool calls determinista en contenedores de test para validar el parseo y la orquestación sin coste de inferencia relevante.
- Clasificación y despacho de intenciones: usar la llamada a herramienta como etiqueta semántica para decidir qué subsistema atiende cada petición en un backend.
- Filtrado previo en cascada: descartar o resolver las peticiones triviales en el modelo pequeño y escalar solo las complejas a un modelo mayor, reduciendo coste y latencia medios.

## Benchmarks y rendimiento

La model card publica una tabla de validación sobre el split de validación retenido `sft_tools`, con 274 ejemplos, decodificación greedy y un límite de 384 tokens. No son benchmarks académicos (MMLU, HumanEval, GSM8K) sino métricas específicas de tool calling.

| Modelo | Cuantizacion | Llamada emitida | Nombres correctos | Argumentos exactos |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | BF16 | 48/274 (17,5%) | 9/274 (3,3%) | 2/274 (0,7%) |
| Qwen3-0.6B-tools | GGUF-BF16 | 272/274 (99,3%) | 228/274 (83,2%) | 175/274 (63,9%) |
| Qwen3-0.6B-tools | GGUF-Q4_K_M | 272/274 (99,3%) | 150/274 (54,7%) | 92/274 (33,6%) |
| Qwen3-0.6B-tools | GGUF-Q5_K_M | 272/274 (99,3%) | 190/274 (69,3%) | 150/274 (54,7%) |
| Qwen3-0.6B-tools | GGUF-Q6_K | 272/274 (99,3%) | 196/274 (71,5%) | 148/274 (54,0%) |
| Qwen3-0.6B-tools | GGUF-Q8_0 | 272/274 (99,3%) | 230/274 (83,9%) | 181/274 (66,1%) |
| Qwen3-0.6B-tools | GGUF-UD-Q2_K_XL | 24/274 (8,8%) | 2/274 (0,7%) | 2/274 (0,7%) |
| Qwen3-0.6B-tools | GGUF-UD-Q3_K_XL | 259/274 (94,5%) | 81/274 (29,6%) | 67/274 (24,5%) |
| Qwen3-0.6B-tools | GGUF-UD-Q4_K_XL | 272/274 (99,3%) | 189/274 (69,0%) | 136/274 (49,6%) |
| Qwen3-0.6B-tools | GGUF-UD-Q5_K_XL | 271/274 (98,9%) | 191/274 (69,7%) | 145/274 (52,9%) |
| Qwen3-0.6B-tools | GGUF-UD-Q6_K_XL | 272/274 (99,3%) | 227/274 (82,8%) | 181/274 (66,1%) |
| Qwen3-0.6B-tools | GGUF-UD-Q8_K_XL | 272/274 (99,3%) | 224/274 (81,8%) | 172/274 (62,8%) |

Lectura de los datos: la fidelidad de argumentos exactos no crece de forma monótona con el tamaño. Q4_K_M cae a un tercio del BF16; Q5_K_M y Q6_K se quedan en la misma banda del ~54%, de modo que Q6_K cuesta más bytes sin ganancia; Q8_0 iguala al BF16. En la familia UD, UD-Q2_K_XL es inutilizable (8,8% de emisión) y UD-Q6_K_XL alcanza el mejor valor de argumentos exactos (66,1%) con nombres correctos algo por debajo de Q8_0. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 596 millones de parámetros; en BF16 son aproximadamente 1,2 GB de pesos, en Q8_0 unos 0,6 GB, en Q5_K_M/Q6_K entre 0,4 y 0,5 GB y en Q4_K_M alrededor de 0,35 GB. Hay que sumar la caché KV, que depende del contexto configurado y no se documenta en la información disponible.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU. Con `n_gpu_layers=99` en llama.cpp se descarga por completo en una GPU modesta.
- GPU de datacenter (A100, H100) innecesarias para una sola instancia; solo tendrían sentido para servir muchos flujos concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), bindings de Python `llama_cpp` con `Llama.from_pretrained`, y cualquier runtime compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la información disponible, aunque el formato GGUF es consumible por Ollama.
- Latencia y throughput: la model card indica que las cifras son decodificación greedy de un solo flujo, no throughput de servicio, pero no publica valores numéricos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-tools-GGUF | 596 M | no disponible | Tool calling por SFT+LoRA, GGUF | Apache 2.0 | Hugging Face, 697 descargas |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion | Modelo base generalista | Apache 2.0 (heredada) | Hugging Face |
| iromu/Qwen3-0.6B-tools | 596 M | no disponible | Mismo ajuste en BF16 con tabla de validación completa | Apache 2.0 | Hugging Face |
| iromu/Qwen3-0.6B-tools-NVFP4 | 596 M | no disponible | Mismo ajuste en NVFP4 | Apache 2.0 | Hugging Face |

Frente al modelo base, la diferencia medida es de +63,1 puntos porcentuales en argumentos exactos (BF16) y de +65,3 pp en Q8_0. No se dispone de datos de otros modelos pequeños de tool calling en la información proporcionada, por lo que no se puede establecer una comparación con alternativas de terceros.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un sustituto general de modelos Qwen mayores; su alcance es el tool calling estructurado.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en productos en castellano sin capa de traducción.
- Riesgo de alucinación en nombres de función y argumentos: incluso en Q8_0, un 16,1% de los casos no acierta el nombre y un 33,9% no reproduce los argumentos exactos. En Q4_K_M el fallo de argumentos sube al 66,4%.
- Las cuantizaciones UD-Q2_K_XL y UD-Q3_K_XL degradan gravemente la emisión de llamadas (8,8% y 94,5% respectivamente) y no deberían usarse en producción.
- Q6_K no aporta mejora de fidelidad sobre Q5_K_M pese a ocupar más; elegir Q6_K por tamaño es un error de criterio.
- La validación se hizo con 274 ejemplos, greedy y un tope de 384 tokens; no cubre contextos largos ni decodificación con muestreo, por lo que el rendimiento en producción puede diferir.
- El modelo no ha pasado por RLHF ni DPO según la información disponible; el alineamiento conversacional general es el heredado del modelo base.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del dataset de destilación empleado en el entrenamiento antes de un despliegue comercial a gran escala.
- El repositorio pesa 8,8 GB por acumular todas las variantes; descargar solo el archivo necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen3-0.6B-tools-GGUF
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen3-0.6B-tools
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-tools-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- llama.cpp: https://github.com/ggml-org/llama.cpp
- NeMo-RL: https://github.com/NVIDIA-NeMo/RL
