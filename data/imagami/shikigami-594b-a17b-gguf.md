# imagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización extrema (aproximadamente 1 bit por peso) del modelo multimodal Inkling 2 Small de Thinking Machines, publicada por el usuario independiente imagami. El modelo original es un transformer de tipo Mixture-of-Experts con 594.000 millones de parámetros totales y 17.000 millones activos por token, que selecciona 8 expertos de un total de 384. La cuantización reduce el peso del repositorio a unos 84,2 GB en formato TQ1, lo que permite ejecutar un modelo de casi 600B en hardware relativamente modesto (tres Intel Arc Pro B70 de 32 GB, o una NVIDIA DGX Spark GB10).

La relevancia de esta ficha es doble: por un lado, demuestra hasta dónde llegan las técnicas de cuantización basadas en retículos (trellis) para comprimir modelos masivos; por otro, ilustra las fricciones prácticas del ecosistema, ya que el formato TQ1 no es compatible con llama.cpp, Ollama, LM Studio ni Unsloth oficiales, y requiere bifurcaciones específicas del motor (XeStrata o un fork de llama.cpp para GB10). El modelo acepta entrada de texto e imagen, con un codificador visual ViT de 23 capas que se mantiene en BF16.

Es importante señalar que esta publicación no es una distribución oficial de Thinking Machines. Los pesos son una derivación de Inkling 2 Small bajo licencia Apache 2.0, y el uso está sujeto además a la Acceptable Use Policy de Thinking Machines. La model card advierte de un problema conocido de bucles de razonamiento en el modelo base que la cuantización agrava.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), con codificador visual ViT de 23 capas |
| Parametros totales | 594B (modelo original); 85.015.279.635 según safetensors del repo cuantizado |
| Parametros activos | 17B (8 expertos de 384) |
| Longitud de contexto | 16.384 tokens en la configuración de ejemplo de la model card |
| Tipos de cuantizacion | TQ1 (~1,2 bits por peso; expertos a ~2,06 bits por peso en trellis QTIP); atención, embeddings y capa de salida en Q6_K; router en F32; visión en BF16 |
| Idiomas soportados | No disponible (la model card incluye ejemplos en japonés e inglés, pero no declara lista oficial) |
| Licencia | Apache 2.0 (pesos derivados); uso sujeto a la Acceptable Use Policy de Thinking Machines |
| Formato de pesos | GGUF (TQ1 dividido en 10 archivos), mmproj-BF16.gguf para visión, DSpark Q8_0 para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Small, es un transformer MoE con 594B parámetros totales y 17B activos, que enruta cada token hacia 8 de sus 384 expertos. Esta cuantización no reentrena el modelo: parte de los pesos originales y aplica una compresión agresiva en dos frentes. Primero, poda los expertos menos utilizados de cada capa y reduce la dimensión intermedia de los restantes a 2304, 1728, 1152 o 576, agrupados en bloques `_g1`, `_g2`, etc.; el router se recorta para que solo apunte a los expertos conservados. La selección de qué podar y cuánto reducir se optimiza minimizando el error de salida respecto al modelo original para un presupuesto de tamaño dado.

Segundo, los expertos se almacenan con un código de retículo (trellis) inspirado en QTIP: cada tile de 256 pesos (16×16) ocupa 66 bytes, con un estado inicial de 14 bits y 255 símbolos de 2 bits. La decodificación avanza el estado con `s = (s >> 2) | (b << 12)` y calcula cada peso mediante una función aritmética determinista (sin codebook), escalada por un factor FP16 por fila. Las secuencias de signos de cada tile se buscan con un algoritmo de Viterbi sobre los 2^14 estados posibles, usando datos de calibración para que la salida de cada experto se aproxime a la del modelo original. Las matrices de atención, embeddings y salida se mantienen en Q6_K, y el router en F32. La model card no detalla la composición del dataset de entrenamiento original ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y tokenizador heredados de Inkling 2 Small.
- Razonamiento con modo de pensamiento (thinking), con niveles de esfuerzo configurables (`reasoning_effort`, incluido `"none"`).
- Entrada de imagen: el codificador ViT de 23 capas procesa imágenes en parches de 40×40 píxeles (un token por parche, con reducción previa si se superan 1024 parches).
- Capacidades de código y depuración, con rendimiento medido de 56 tokens/s en generación de código sobre Intel Arc Pro B70.
- Flujos de agente y multi-step reasoning, con rendimiento medido de 53 tokens/s en tareas de agente.
- Soporte multilingüe parcial: los ejemplos de la model card incluyen japonés (42 tokens/s) e inglés, aunque no se declara una lista oficial de idiomas.
- Decodificación especulativa mediante el modelo draft DSpark (Q8_0, 1,87 GB), que acelera la generación.
- Compatibilidad con endpoints de tipo OpenAI (etiqueta `endpoints_compatible`), incluido el formato `image_url` para imágenes.

## Casos de uso

- Despliegue de un modelo de casi 600B en hardware de gama alta para consumidores: con TQ1 (84,2 GB) cabe en tres Intel Arc Pro B70 de 32 GB o en una DGX Spark GB10, lo que permite experimentar con un MoE de gran escala sin clústeres de datacenter.
- Investigación en cuantización extrema: el formato trellis QTIP con ~1,2 bits por peso y la poda selectiva de expertos sirven como caso de estudio reproducible para medir el impacto de la compresión en la divergencia KL respecto al modelo original.
- Asistentes conversacionales con contexto largo: los 16.384 tokens de contexto configurados permiten gestionar diálogos multi-turno y documentos extensos en una sola ventana.
- Análisis de imágenes en local: el codificador ViT en BF16 permite describir, clasificar o extraer información de imágenes sin depender de APIs externas, útil en entornos con requisitos de privacidad.
- Agentes autónomos con tool calling: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas, con la salvedad de aplicar los mecanismos anti-bucle descritos en la model card.
- Generación y depuración de código en pipelines internos: con 56 tokens/s en código sobre B70, es viable para asistencia de programación en estaciones de trabajo con GPU Intel Arc.
- Evaluación comparativa de motores de inferencia: sirve para contrastar XeStrata (SYCL, Intel Arc) frente al fork de llama.cpp para GB10 en términos de prefill (265 vs. 717-763 tokens/s) y decode (42-56 vs. 21-34 tokens/s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de calidad y velocidad:

| Metrica | Valor |
|---|---|
| Divergencia KL vs. modelo original (FP32, 24 textos + WikiText) | Reportada en la model card, pero el valor numérico está truncado en la información disponible |
| Perplexity en fork llama.cpp GB10 | 2,794 / 2,793 |
| Prefill (Intel Arc Pro B70 ×3, XeStrata) | ~265 tokens/s (prompt de 4.719 tokens) |
| Decode código (B70 ×3, DSpark) | 56 tokens/s |
| Decode agente (B70 ×3, DSpark) | 53 tokens/s |
| Decode japonés (B70 ×3, DSpark) | 42 tokens/s |
| Prefill (DGX Spark GB10, fork llama.cpp) | 717-763 tokens/s |
| Decode (DGX Spark GB10, fork llama.cpp, con DSpark) | 21-34 tokens/s |
| Decode (DGX Spark GB10, fork llama.cpp, sin DSpark) | 25 tokens/s |
| Prefill (DGX Spark GB10, XeStrata gb10-port) | 461-491 tokens/s |
| Decode (DGX Spark GB10, XeStrata gb10-port) | 20-27 tokens/s |

## Requisitos de hardware

- VRAM estimada: ~84,2 GB para los pesos TQ1, más 0,66 GB del codificador visual BF16 y 1,87 GB del draft DSpark si se usa decodificación especulativa.
- Configuración medida: 3× Intel Arc Pro B70 (32 GB cada una) con 89 GB de RAM principal; todos los expertos caben en VRAM.
- Configuración medida: NVIDIA DGX Spark (GB10) con el fork de llama.cpp `ink2v` o el port de XeStrata `gb10-port`.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) según los tamaños declarados; se requiere agregar VRAM de varias GPU o memoria unificada de gran capacidad.
- Motores compatibles: XeStrata (rama `b70-local`, commit 4b1a8fbdb o posterior; backend SYCL para Intel Arc) y fork de llama.cpp `imagaminomikoto/llama.cpp` rama `ink2v` (tag `ink2v-20261122-0310`) para GB10.
- Motores NO compatibles: llama.cpp oficial, Ollama, LM Studio y Unsloth no pueden cargar los archivos TQ1.
- Throughput: 42-56 tokens/s de decode en B70 ×3 con DSpark; 20-34 tokens/s en GB10; prefill de ~265 tokens/s en B70 y hasta 763 tokens/s en GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Shikigami-594B-A17B-GGUF (TQ1) | 594B | 17B | 16.384 | GGUF TQ1 | Apache 2.0 | 3× Arc Pro B70 / DGX Spark |
| Inkling 2 Small (original) | 594B | 17B | No disponible | safetensors | Apache 2.0 | Clúster multi-GPU |
| RVQ1 (mencionado como referencia de calidad) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card menciona RVQ1 únicamente como referencia de comparación de divergencia KL, sin aportar especificaciones. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Bucles de razonamiento: Inkling 2 tiende a repetir la misma comprobación en su bloque de pensamiento, especialmente al depurar código; la cuantización agrava el problema y dificulta salir del bucle. Se mitiga con detección de repeticiones en el motor (20 caracteres repetidos 7 veces en 400, o 48 caracteres repetidos 4 veces en 2.400) o desactivando el pensamiento con `reasoning_effort: "none"`.
- Compatibilidad limitada: los archivos TQ1 solo funcionan con XeStrata o el fork de llama.cpp para GB10; no hay soporte en las herramientas estándar del ecosistema.
- Licencia: aunque los pesos son Apache 2.0, el uso está sujeto a la Acceptable Use Policy de Thinking Machines; conviene revisarla antes de un despliegue comercial.
- No es una distribución oficial: el autor es independiente y no hay garantías de soporte ni de mantenimiento a largo plazo.
- Idiomas: no se declara una lista oficial de idiomas soportados; el rendimiento multilingüe más allá del inglés y el japonés no está documentado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual para esta cuantización.
- Sesgos: no se han documentado análisis de sesgos para esta derivación ni para el modelo base en la información disponible.
- Calidad: la divergencia KL respecto al original se reporta, pero el valor numérico no está completo en la información disponible; la poda de expertos puede degradar capacidades específicas no medidas.
- Visión: el codificador se ejecuta en CPU con NumPy en XeStrata, lo que puede limitar el rendimiento en flujos con muchas imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/imagami/Shikigami-594B-A17B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- XeStrata (rama b70-local): https://github.com/imagaminomikoto/XeStrata/tree/b70-local
- XeStrata port para GB10: https://github.com/imagaminomikoto/XeStrata/tree/gb10-port
- Fork de llama.cpp para GB10 (rama ink2v): https://github.com/imagaminomikoto/llama.cpp/tree/ink2v
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
