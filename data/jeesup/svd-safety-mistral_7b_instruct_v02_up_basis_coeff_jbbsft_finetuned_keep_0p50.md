# Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbsft_finetuned_keep_0p50

## Resumen

Este checkpoint es una versión comprimida de `mistralai/Mistral-7B-Instruct-v0.2` mediante la técnica **Basis Sharing**, desarrollada por el grupo TUDa-HWAI, y publicada por el usuario de HuggingFace Jeesup. Concretamente, se elimina el 50 % de los parámetros del modelo base (fracción de parámetros realizada: 0,4998967097355769) haciendo que pares de capas adyacentes compartan una única base por tipo de peso, y después se recupera parte de la capacidad perdida con un LoRA entrenado **exclusivamente sobre los coeficientes**, manteniendo las bases congeladas.

La particularidad de esta celda experimental es que la recuperación se hace con una mezcla de datos que incluye, además de `yahma/alpaca-cleaned`, 960 filas de rechazo derivadas de 96 comportamientos dañinos de JailbreakBench (un 1,82 % del total de filas), con respuestas objetivo tomadas de `meta-llama/Llama-2-7b-chat-hf`. El objetivo declarado por el autor es medir si los datos de seguridad en la fase de recuperación preservan el comportamiento de rechazo tras una compresión agresiva.

El modelo resultante tiene 7.241.732.096 parámetros (idénticos al base: es *rank-deficient*, no más pequeño en disco; el repositorio ocupa 14,5 GB) y se publica con formas densas estándar de Mistral, por lo que carga con `transformers` sin código personalizado. Es, por tanto, un artefacto de investigación sobre el compromiso entre compresión y alineación de seguridad, no un modelo orientado a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/Mistral) con atención causal, RoPE y GQA. Pesos plegados a formas densas de `MistralForCausalLM`, pero con matrices de rango deficiente |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-Instruct-v0.2; la model card confirma que v0.2 no usa sliding window) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. No se publican checkpoints cuantizados; al conservar formas densas Mistral estándar y safetensors, es convertible con las herramientas habituales (llama.cpp, AWQ, GPTQ) |
| Idiomas soportados | No disponible en la model card ni en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 14,5 GB) |

## Arquitectura y entrenamiento

El pipeline de compresión parte de un SVD blanqueado (*whitened SVD*) sobre la concatenación horizontal de los pesos de cada grupo. Cada grupo está formado por **2 capas adyacentes** que comparten una única base por tipo de peso. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; los tipos privados, con una base por capa, son `down` y `o`. Con esta configuración se retiene exactamente el 49,99 % de los parámetros. La calibración emplea 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 (el código original fija la semilla 2023; este proyecto calibra todos los métodos con una sola semilla).

La recuperación se realiza con un LoRA de r=8 y alpha=16, 2 épocas, learning rate 1e-4 y batch 64 sobre `yahma/alpaca-cleaned` más 960 filas de rechazo (96 comportamientos dañinos de JailbreakBench repetidos 10 veces, 1,82 % de las filas; los objetivos son los rechazos greedy del propio `Llama-2-7b-chat-hf`). Crucialmente, **solo se entrenan los coeficientes**: las bases compartidas y por capa permanecen congeladas y bit a bit idénticas al modelo comprimido, de modo que cada peso mantiene rango <= k y cada grupo sigue compartiendo una base. El merge se hace como `C' = C + (alpha/r)BA` y después se pliega `W = C' @ B` a denso. No es el LoRA propio de Basis Sharing (wikitext, batch 1, solo q/v): se usa la receta alpaca del proyecto para todos los compresores, de modo que los datos de recuperación sean constantes entre métodos.

Como detalles de implementación, la compresión se realizó por la ruta `ShareLlama` aunque existe un módulo Mistral en Basis Sharing; esto es exacto únicamente porque Mistral-7B-Instruct-v0.2 no tiene sliding window (cargado como `LlamaForCausalLM` produce logits idénticos a `MistralForCausalLM`, con diferencia máxima 0,0 en float32 hasta 600 tokens). Las tablas RoPE se verificaron idénticas a Llama estándar en float64 para bases 1e4, 5e5 y 1e6, escalado llama3, GQA y sesgos de q/k/v. El checkpoint publicado es un `MistralForCausalLM` normal.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat, usando la plantilla de Mistral-7B-Instruct-v0.2.
- Razonamiento de sentido común y comprensión lectora básica: obtiene 0,5539 en HellaSwag, 0,6204 en WinoGrande, 0,6638 en PIQA y 0,5732 en ARC-Easy (acc_norm).
- Conocimiento académico elemental limitado: 0,3618 en ARC-Challenge, 0,3520 en OpenBookQA y 0,2580 en MathQA, valores claramente por debajo de lo esperable en el modelo base sin comprimir.
- Capacidad de matemáticas: muy degradada según MathQA (0,2580); no se reportan resultados de GSM8K.
- Tool calling / function calling: no verificado en este checkpoint. El modelo base v0.2 sí documenta soporte de function calling, pero la compresión al 50 % y el ajuste posterior pueden comprometer el seguimiento estricto de formato.
- Uso como agente multi-paso: no disponible; no se han publicado evaluaciones de agentes ni de razonamiento encadenado.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Modo *thinking* explícito, visión o audio: no soportados.
- Comportamiento de rechazo: parcialmente degradado. El ASR (tasa de éxito de ataque) es 0,1058 en AdvBench y 0,1438 en StrongREJECT, ambos juzgados con `cais/HarmBench-Llama-2-13b-cls`.

## Casos de uso

- Estudio del compromiso entre compresión y seguridad: el modelo sirve como celda de medida en un experimento controlado, permitiendo comparar el ASR de AdvBench y StrongREJECT frente a otras configuraciones de Basis Sharing o frente al modelo base sin comprimir.
- Referencia de ablación para datos de seguridad en la fase de recuperación: al ser la variante que añade filas de rechazo de JailbreakBench (1,82 % del conjunto), permite aislar el efecto de esos datos comparándola con la celda de Basis Sharing estándar al mismo ratio.
- Evaluación de pipelines de sobre-rechazo: con tasas de 0,2066 en XSTest-safe y 0,2749 en OR-Bench-Hard-1K (macro 0,2408, con fracciones evaluadas fiables de 0,97 y 1,00 respectivamente), es útil para validar clasificadores de sobre-rechazo como `allenai/wildguard` en un régimen con muchas respuestas defensivas.
- Benchmarking de infraestructura de despliegue: al mantener formas densas de Mistral-7B y 7,24 B de parámetros, permite medir VRAM, latencia y throughput en vLLM, TGI o llama.cpp y comparar directamente con el modelo base a igual cuantización.
- Investigación sobre matrices de rango deficiente: dado que los pesos pliegan a denso pero conservan rango <= k por grupo, sirve para estudiar el efecto de la deficiencia de rango en tareas downstream y en la dinámica de fine-tuning posterior (por ejemplo, DPO o RLHF para recuperar alineación).
- Punto de partida para recuperación adicional de seguridad: un equipo puede aplicar DPO o SFT con datos de seguridad sobre este checkpoint y medir cuánto ASR se recupera, usando las métricas publicadas como línea base reproducible.
- Evaluación de robustez frente a jailbreaks en laboratorio: con ASR en torno al 10-14 % frente a un modelo alineado típico, es un caso de prueba útil para validar defensas, filtros de entrada/salida y harnesses de red-teaming, siempre en entorno controlado y no expuesto a usuarios finales.
- Reproducción del pipeline de compresión: aunque el checkpoint publicado está plegado a denso, combinado con el repositorio `TUDa-HWAI/Basis_Sharing` (commit `1c021b6ce1d3`) permite reproducir la calibración con WikiText-2 y el entrenamiento del LoRA sobre coeficientes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,4999 |
| Perplejidad en WikiText-2 | 11,3706 |
| ARC-Easy (acc_norm) | 0,5732 |
| ARC-Challenge (acc_norm) | 0,3618 |
| HellaSwag (acc_norm) | 0,5539 |
| WinoGrande (acc) | 0,6204 |
| OpenBookQA (acc_norm) | 0,3520 |
| PIQA (acc_norm) | 0,6638 |
| MathQA (acc_norm) | 0,2580 |
| AdvBench HarmBench ASR | 0,1058 |
| StrongREJECT HarmBench ASR | 0,1438 |
| Tasa de sobre-rechazo (XSTest-safe) | 0,2066 |
| Tasa de sobre-rechazo (OR-Bench-Hard-1K) | 0,2749 |
| Tasa macro de sobre-rechazo | 0,2408 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros modelos comparados en la información disponible. Toda la generación se realizó con la plantilla de chat y decodificación greedy. Los juicios de sobre-rechazo se consideran fiables para esta celda (fracción puntuada de 0,97 en XSTest-safe y 1,00 en OR-Bench-Hard-1K).

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 14,5 GB solo de pesos, más caché KV y activaciones. Con contexto de 32.768 tokens la caché KV ronda los 4 GB (32 capas, 8 cabezas KV, dimensión de cabeza 128, fp16), lo que sitúa el total en torno a 18-20 GB.
- VRAM estimada en int8: aproximadamente 7,5-8 GB de pesos, lo que permite contextos de 8.000-16.000 tokens en GPUs de 12 GB.
- VRAM estimada en int4 (por ejemplo, GGUF Q4_K_M): alrededor de 4,5 GB de pesos, viable en GPUs de 8 GB con contexto moderado. Estas cifras de cuantización son estimaciones de ingeniería, no datos publicados por el autor.
- GPUs recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo y despliegue concurrente; RTX 4090 / RTX 3090 (24 GB) para fp16 con contexto moderado o int8 con contexto largo; RTX 4070, RTX 3060 12 GB o similares para int8/int4.
- Cabe en GPU de consumo: sí. En fp16 en tarjetas de 24 GB (RTX 3090/4090); en int8/int4 en tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` directamente (es un `MistralForCausalLM` estándar con safetensors), vLLM, TGI, y llama.cpp/Ollama tras convertir a GGUF. No requiere código de modelado personalizado.
- Latencia y throughput: no disponible en la información proporcionada. Al tratarse de pesos densos con formas Mistral estándar y el mismo número de parámetros que el base, el coste computacional por token es indistinguible del de Mistral-7B-Instruct-v0.2 a igual cuantización; la deficiencia de rango no reduce FLOPs ni tamaño en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento reportado |
|---|---|---|---|---|---|
| Este checkpoint (Jeesup, Basis Sharing 50 % + JBB SFT) | 7,24 B (rango deficiente) | 32.768 | apache-2.0 | safetensors | WikiText-2 ppl 11,3706; HellaSwag 0,5539; ASR AdvBench 0,1058; sobre-rechazo macro 0,2408 |
| `mistralai/Mistral-7B-Instruct-v0.2` (base) | 7,24 B | 32.768 | apache-2.0 | safetensors | No disponible en la informacion proporcionada; es el punto de referencia del que parte la compresion |
| Otras celdas de compresion de Basis Sharing al mismo ratio | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Metodos alternativos de compresion (SVD-LLM, SliceGPT, LLM-Pruner) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se han encontrado en la información proporcionada resultados de benchmarks del modelo base sin comprimir ni de otros checkpoints comparables, por lo que no es posible cuantificar la pérdida exacta atribuible a la compresión más allá del ratio de parámetros retenido (0,4999).

## Limitaciones y advertencias

- **Degradación de seguridad por compresión**: el propio autor advierte que comprimir a este ratio degrada el comportamiento de rechazo, y que esta celda existe precisamente para medirlo. Los números de seguridad de un modelo degenerado no son evidencia sobre alineación.
- **ASR elevado**: 0,1058 en AdvBench y 0,1438 en StrongREJECT, medido con `cais/HarmBench-Llama-2-13b-cls`. No es apto para exposición directa a usuarios finales sin capas adicionales de moderación.
- **Sobre-rechazo alto**: 0,2066 en XSTest-safe, 0,2749 en OR-Bench-Hard-1K y 0,2408 en la tasa macro. El modelo rechaza con frecuencia peticiones legítimas, lo que limita su utilidad conversacional.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas de veracidad o factualidad. La compresión al 50 % y el ajuste solo sobre coeficientes aumentan la probabilidad de degradación en tareas de conocimiento.
- **Deficiencia de rango**: los pesos conservan rango <= k por grupo, lo que reduce la capacidad efectiva aunque el checkpoint ocupe lo mismo en disco (14,5 GB) y tenga el mismo número de parámetros que el base. No hay ahorro de memoria ni de cómputo en inferencia frente a Mistral-7B-Instruct-v0.2.
- **Idiomas no declarados**: no se especifican idiomas soportados ni se han evaluado capacidades multilingües; se hereda el sesgo mayoritariamente anglófono del modelo base.
- **Licencia**: apache-2.0, lo que permite uso comercial y modificación, pero el usuario debe asumir la responsabilidad sobre el comportamiento de seguridad del artefacto, dado el estado degradado documentado.
- **Tool calling no verificado**: el soporte de function calling del modelo base v0.2 no está validado en este checkpoint y puede haberse visto afectado por la compresión y el ajuste.
- **Trazabilidad del dataset de rechazo**: las respuestas objetivo del ajuste provienen de `meta-llama/Llama-2-7b-chat-hf`, cuyos términos de uso deben revisarse si se redistribuyen derivados.
- **Fecha de publicación y adopción**: el repositorio no registra descargas ni likes, y no se han encontrado referencias externas, evaluaciones de terceros ni replicaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbsft_finetuned_keep_0p50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio de Basis Sharing (TUDa-HWAI, commit `1c021b6ce1d3`): https://github.com/TUDa-HWAI/Basis_Sharing
- Dataset de recuperacion `yahma/alpaca-cleaned`: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Comportamientos daninos de JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Juez HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo WildGuard: https://huggingface.co/allenai/wildguard
- AdvBench (repositorio llm-attacks): https://github.com/llm-attacks/llm-attacks
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- StrongREJECT: https://github.com/dsbowen/strong_reject
- WikiText-2: https://huggingface.co/datasets/wikitext
- Modelo objetivo de las respuestas de rechazo: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

Nota: las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados se limitaron a paginas genericas de YouTube sin relacion con el checkpoint.
