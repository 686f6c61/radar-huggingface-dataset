# IsValorum/Clover-35B-A3B-Preview-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Clover-35B-A3B-Preview APEX-I-MiniPlus-V2.1 es una cuantización GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, realizada por IsValorum como parte de su serie APEX Quantization. El modelo base es un derivado de Qwen3.6-35B-A3B con arquitectura `clover_moe` (mixture-of-experts) que incorpora una vía de block-diffusion, combinando capas de atención lineal tipo gated DeltaNet (SSM) con capas de atención completa. Esta variante MiniPlus es el nivel de fidelidad más alto de la familia, con los expertos compartidos en Q5_K y los expertos periféricos en Q3_K.

El problema que resuelve es doble: por un lado, hacer ejecutable en hardware de consumo un modelo MoE híbrido de 34,66 mil millones de parámetros (con unos 3B activos, según la convención de nomenclatura A3B) reduciendo su huella a 14,75 GB; por otro, preservar la máxima calidad posible mediante una receta de cuantización por tensor de 853 entradas y una matriz de importancia (iMatrix) calculada sobre 1,25 millones de tokens.

Es relevante porque los modelos híbridos SSM-atención con difusión por bloques aún no están soportados por `llama.cpp` oficial: esta ficha documenta un artefacto que requiere un runtime parcheado específico, lo que lo convierte en una opción de nicho para usuarios avanzados interesados en arquitecturas experimentales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `clover_moe` (MoE híbrido: 30 capas gated DeltaNet + 10 capas de atención completa, con vía block-diffusion) |
| Parámetros totales | 34.661.350.848 |
| Parametros activos | No disponible (la nomenclatura A3B sugiere ~3B activos, pero no está confirmado en la documentación) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Mixta: Q3_K, IQ3_XXS, Q4_K, Q5_K, Q6_K, Q8_0, F32 (3,4054 bits/peso efectivos) |
| Idiomas soportados | Inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (853 tensores, 14,75 GB) |

## Arquitectura y entrenamiento

El modelo base, Diffuspace/Clover-35B-A3B-Preview, es un derivado de Qwen3.6-35B-A3B con arquitectura `clover_moe`: 40 capas en total, de las cuales 30 son capas gated DeltaNet (un tipo de SSM lineal con mecanismo de puerta) y 10 son capas de atención completa (full attention). El enrutador MoE selecciona 8 expertos de un total de 256 expertos enrutados, además de expertos compartidos. La característica distintiva es la vía de block-diffusion añadida, con tensores específicos (`ssm_bd_logit_scale`, `ssm_bd_history`, `ssm_conv1d.weight_right`) protegidos en F32 durante la cuantización.

Sobre el entrenamiento del modelo base no se dispone de datos publicados (número de tokens, composición del dataset, RLHF/DPO): la documentación disponible solo indica que existe una única versión post-entrenada de tipo preview. En cuanto a la cuantización, IsValorum empleó una iMatrix propia (VAL-1.25M) calculada sobre 1,25 millones de tokens, una receta de 853 entradas sin fallbacks, y un esquema de blindaje que mantiene en F32 los factores de decay, convoluciones 1D y RMSNorm de las capas recurrentes, así como los logits del router y los componentes de la vía block-diffusion.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`)
- Soporte multilingüe en 13 idiomas, incluido el español
- Contexto largo de 131.072 tokens gracias a las capas DeltaNet lineales
- Arquitectura experimental con vía block-diffusion (capacidades específicas de este mecanismo no documentadas)
- No hay evidencia publicada de tool calling, agentes, visión o audio en la información disponible

## Casos de uso

- Experimentación con arquitecturas híbridas SSM-atención: el modelo permite probar en local un diseño clover_moe con block-diffusion, algo que ningún runtime estándar soporta aún, ideal para investigadores que evalúan alternativas al transformer puro.
- Chatbot local multilingüe: con 13 idiomas soportados y 128K de contexto, puede alimentar asistentes conversacionales que mantengan conversaciones multi-turno con documentos largos, ejecutándose en una única GPU de gama alta o en CPU.
- Procesamiento de documentos extensos: la ventana de 131.072 tokens permite resumir o analizar libros, contratos o repositorios de código completos en una sola pasada.
- Despliegue en estaciones de trabajo sin GPU NVIDIA de数据中心: los builds CPU x86-64 del runtime parcheado permiten inferencia en cualquier máquina moderna, aprovechando que solo ~3B de parámetros se activan por token.
- Prueba de calidad de cuantizaciones a 3,4 bits: la receta auditable (tensor-map.tsv, quant-report.json) sirve como referencia para estudiar cómo preservar fidelidad en MoE con expertos a 3 bits.
- Integración en pipelines de investigación sobre difusión de texto: la vía block-diffusion abre la puerta a experimentar con generación no autorregresiva por bloques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que las métricas empíricas de perplexity y fidelidad (BF16, MiniPlus, NanoPlus) están "pending" y que no hay evaluación empírica publicada para esta versión.

## Requisitos de hardware

- VRAM estimada: 14,75 GB solo para los pesos; con contexto de 128K y overhead de KV-cache, se recomiendan 16-24 GB de VRAM, o ejecutar parcialmente en CPU con offload
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para ejecución completa en GPU; builds CUDA 12.8 requieren GPU NVIDIA; los builds Vulkan soportan GPUs AMD e Intel
- Consumer GPUs: cabe en una RTX 4090 o 3090; en GPUs de 16 GB (RTX 4080/4060 Ti 16GB) requeriría offload parcial a CPU
- CPU: los builds x86-64 CPU del runtime parcheado funcionan en cualquier máquina moderna, aunque con latencia mayor
- Despliegue: exclusivamente mediante el runtime parcheado IsValorum/llama.cpp-clover-moe (builds Linux x86_64 CPU y CUDA 12, Windows universal con CUDA 12.8, Vulkan y CPU, o compilación desde el branch parcheado, PR #31306, commit `4838ffb0c8ade92f34d9157deea38d92758ab824`). No funciona en `llama.cpp` vanilla, ni en Ollama, vLLM o TGI estándar
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (este) | 34,66B (~3B activos, no confirmado) | 131.072 | MoE híbrido DeltaNet + atención + block-diffusion | Apache 2.0 | GGUF, requiere runtime parcheado |
| Qwen3-30B-A3B | 30,5B (~3B activos) | 32.768 | MoE transformer | Apache 2.0 | Amplio soporte (llama.cpp, vLLM, Ollama) |
| Qwen3.6-35B-A3B (base declarada) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La alternativa más madura para producción sería Qwen3-30B-A3B, con soporte ecosistema completo; Clover ofrece una arquitectura experimental con contexto 4 veces mayor a cambio de un soporte de runtime muy limitado.

## Limitaciones y advertencias

- No carga en `llama.cpp` vanilla: es obligatorio usar el runtime parcheado específico, lo que excluye Ollama, LM Studio (según builds), vLLM y TGI
- Es un modelo preview post-entrenado una única vez, sin edición abliterada ni variantes alternativas: la calidad del post-training no está documentada ni evaluada
- Sin benchmarks publicados ni métricas de perplexity: no hay forma de comparar objetivamente su calidad frente a modelos equivalentes
- Riesgo de alucinación típico de modelos de 3B activos sin evaluación publicada; no hay datos sobre sesgos
- La cuantización agresiva de los expertos periféricos (Q3_K/IQ3_XXS, ~3,4 bits/peso) puede degradar la calidad en tareas delicadas, aunque la receta protege los componentes críticos en F32
- El soporte multilingüe declarado (incluido español) proviene de los tags del modelo base; no hay evaluación de calidad por idioma
- Licencia Apache 2.0 sin restricciones comerciales conocidas, pero al ser un derivado preview de Qwen3.6, conviene verificar la cadena de licencias del modelo base
- El proyecto del cuantizador se mantiene con financiación personal (Ko-fi): la continuidad de los builds del runtime no está garantizada

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Fuente BF16: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-BF16-GGUF
- Versión Q8_0: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-Q8_0-GGUF
- iMatrix VAL-1.25M: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF
- Runtime llama.cpp parcheado: https://huggingface.co/IsValorum/llama.cpp-clover-moe
- Tier alternativo NanoPlus: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-NanoPlus-V2.1-GGUF
- PR de soporte upstream: https://github.com/ggml-org/llama.cpp/pull/31306
