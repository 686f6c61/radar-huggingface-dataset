# ngreatorex/Qwen3.8-27B-Uncensored-GGUF-Template-Fix

## Resumen

El modelo `ngreatorex/Qwen3.8-27B-Uncensored-GGUF-Template-Fix` es una versión cuantizada y "abliterada" del modelo denso multimodal Qwen3.8-27B de Alibaba, publicada por el usuario ngreatorex. El objetivo es reducir sustancialmente el comportamiento de rechazo del modelo original (negativas a responder ciertas peticiones) mediante la técnica de abliteración, que elimina direcciones de rechazo en los pesos sin fine-tuning adicional. El resultado se distribuye en formato GGUF con varias cuantizaciones, manteniendo la cabeza de predicción multi-token (MTP) para decodificación especulativa.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 320 millones de parámetros con una ventana de contexto de 262 144 tokens y capacidades multimodales (visión). Esta versión conserva la arquitectura y los datos de entrenamiento originales, solo modifica los pesos para reducir el rechazo. Es relevante para desarrolladores que necesitan un modelo abierto de gran tamaño con menos restricciones en dominios sensibles, manteniendo el rendimiento en código, razonamiento y tareas de agente.

La publicación incluye múltiples archivos GGUF (fused con MTP, separados target+draft, y una variante de visión), junto con una matriz de importancia (imatrix) calculada sobre wikitext-2. El autor verifica explícitamente que los tensores `mtp.*` se conservan tras la abliteración, un detalle técnico importante para la decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, multimodal) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (además de f16 no publicado) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 64 capas y un vocabulario de 248 320 tokens, basado en la arquitectura `Qwen3_5ForConditionalGeneration`. Incluye una capa de predicción multi-token (MTP) que actúa como modelo draft para decodificación especulativa, lo que permite acelerar la generación sin degradar la calidad, ya que cada token se verifica contra el modelo objetivo.

El proceso de "uncensoring" se realizó con la herramienta Heretic, que co-minimiza el recuento de rechazos frente a la divergencia KL con el modelo base. La abliteración se ejecutó en bf16 (sin cuantización intermedia) y el LoRA resultante se fusionó en los pesos bf16. Los tensores `mtp.*` se copiaron directamente del checkpoint base tras la fusión, y se verificó su integridad en cada archivo cuantizado. La matriz de importancia (imatrix) se calculó sobre el f16, no sobre una cuantización intermedia, para una calibración más precisa.

No se realizó fine-tuning ni se añadieron datos de entrenamiento adicionales. Los datos de entrenamiento originales del modelo base no se detallan en esta publicación, pero se asume que son los mismos que los de Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo base, conserva las capacidades de Qwen3.8-27B en comprensión del lenguaje, razonamiento lógico y generación de texto.
- Código y matemáticas: el modelo base destaca en tareas de programación y razonamiento matemático; esta versión mantiene esas capacidades.
- Visión: la variante `Qwen3.8-27B-Uncensored-vision-f16.gguf` soporta entrada de imágenes, según la model card ("Vision: yes").
- Decodificación especulativa: gracias a la cabeza MTP integrada, se puede usar con `llama.cpp` para acelerar la inferencia mediante un modelo draft.
- Comportamiento de rechazo reducido: la abliteración reduce sustancialmente las negativas a responder, aunque no las elimina por completo (el autor indica "substantially reduced, not eliminated").
- Multilingüe: soporta inglés y chino, según los metadatos.
- No se especifica explícitamente soporte de tool calling o function calling en la model card, pero al ser una cuantización del base, se espera que herede dichas capacidades si el modelo original las posee.

## Casos de uso

- Asistente de programación sin restricciones: un desarrollador puede integrar este modelo en un IDE o CLI para generar código, refactorizar o explicar fragmentos, sin que el modelo rechace peticiones relacionadas con vulnerabilidades, exploits o código ofensivo. Su tamaño de 27B ofrece buena calidad en generación de código, y la decodificación especulativa reduce la latencia en entornos con GPU.
- Automatización de tareas de oficina: el modelo base está optimizado para "office automation", por lo que puede redactar correos, resumir documentos, generar informes o extraer datos de tablas. La versión uncensored permite tratar temas delicados sin evasivas, útil en entornos corporativos con políticas de contenido flexibles.
- Agente autónomo con razonamiento multi-paso: gracias a su ventana de contexto de 262 144 tokens, puede mantener conversaciones largas y ejecutar tareas complejas que requieren planificación y uso de herramientas. Aunque no se confirma tool calling, el base lo soporta, y esta versión hereda la arquitectura.
- Análisis de documentos con visión: la variante de visión permite procesar imágenes, como capturas de pantalla, diagramas o documentos escaneados, y extraer información o responder preguntas sobre ellos. Útil para automatizar la revisión de contratos o informes visuales.
- Generación de contenido creativo sin censura: escritores y creadores pueden usar el modelo para generar narrativas, diálogos o guiones que aborden temas tabú o controvertidos, sin que el modelo se niegue a responder. La reducción de rechazo es clave aquí.
- Investigación en seguridad informática: profesionales de ciberseguridad pueden explorar vectores de ataque, redactar exploits educativos o analizar malware, tareas que los modelos censurados suelen bloquear. Este modelo permite ese tipo de análisis sin fricción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de perplexity sobre wikitext-2, que se presentan a continuación. El autor advierte que la perplexity solo detecta daños graves por cuantización y no mide razonamiento, código ni comportamiento de rechazo.

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7.1557 ± 0.25104 | - |
| Q5_K_M | 7.1573 ± 0.25055 | +0.0016 |
| IQ4_XS | 7.1583 ± 0.25019 | +0.0026 |
| Q6_K | 7.1689 ± 0.25149 | +0.0132 |
| Q8_0 | 7.1764 ± 0.25195 | +0.0207 |
| Q4_K_M | 7.1814 ± 0.25227 | +0.0257 |
| IQ2_M | 7.8581 ± 0.27481 | +0.7024 |

Según el autor, todas las cuantizaciones excepto IQ2_M son estadísticamente indistinguibles del f16 (el error estándar es ~0.25, y las diferencias entre ellas son menores de 0.026). Solo IQ2_M se separa claramente (~2.8 errores estándar por encima del baseline). Las versiones `noMTP-*` miden idénticamente a sus contrapartes fused, confirmando que el bloque MTP es inerte durante el forward pass normal.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido. Para IQ2_M (~10.6 GB) se necesitan al menos 12 GB de VRAM; para Q4_K_M (~16.8 GB) se requieren ~18 GB; para Q8_0 (~29.0 GB) se necesitan ~32 GB. La variante de visión f16 no tiene tamaño publicado, pero al ser f16 probablemente supere los 50 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar Q4_K_M o Q5_K_M con holgura; una A100 40 GB o H100 son adecuadas para Q8_0 o la variante f16. Para IQ2_M, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti 16 GB podrían ser suficientes.
- En consumer GPU: sí, las cuantizaciones IQ2_M, IQ4_XS y Q4_K_M caben en GPUs de 16-24 GB, como la RTX 4080/4090 o la RTX 3090.
- Opciones de despliegue: llama.cpp (recomendado, ya que el modelo se convirtió con esa librería), Ollama (si se importa el GGUF), y potencialmente vLLM o TGI si se convierten los pesos a safetensors. La decodificación especulativa con MTP requiere un runtime que soporte `--model-draft` (llama.cpp lo hace).
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá de la GPU, la cuantización y el uso de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Comportamiento de rechazo |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.32B | 262 144 | Apache-2.0 | safetensors | Estándar (rechaza contenido sensible) |
| ngreatorex/Qwen3.8-27B-Uncensored-GGUF | 27.32B | 262 144 | Apache-2.0 | GGUF | Reducido (abliterado) |
| unsloth/Qwen3.8-27B-GGUF | 27.32B | 262 144 | Apache-2.0 | GGUF | Estándar (sin abliterar) |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estas versiones. La diferencia principal radica en el comportamiento de rechazo y en el formato de pesos. Otras alternativas uncensored de tamaño similar (p. ej., Dolphin Llama, WizardLM Uncensored) no se han incluido por falta de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- La reducción del rechazo no es total: el autor indica que el comportamiento de rechazo se reduce "sustancialmente", pero no se elimina. Algunas peticiones pueden seguir siendo rechazadas.
- La abliteración puede afectar a la calidad en tareas específicas, aunque el autor afirma que las capacidades no cambian. No hay benchmarks que lo confirmen.
- La cuantización IQ2_M muestra una perplexity significativamente peor (7.8581 vs 7.1557 del f16), lo que puede degradar la calidad en tareas complejas. Se recomienda usar Q4_K_M o superior para producción.
- El modelo solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede ser problemático legalmente si se usa para difundir información dañina o ilegal. El usuario es responsable del uso.
- La variante de visión solo está disponible en f16, lo que requiere mucha VRAM. No hay cuantizaciones de visión en este repo.
- El modelo base tiene una ventana de contexto muy larga (262 144 tokens), pero el uso efectivo de esa longitud depende del hardware y del runtime. Con cuantizaciones bajas, la memoria puede ser insuficiente.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. Al ser una versión uncensored, el riesgo de generar contenido inapropiado o falso es mayor que en el modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ngreatorex/Qwen3.8-27B-Uncensored-GGUF-Template-Fix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- GGUF de unsloth (alternativa sin abliterar): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Artículo sobre la versión uncensored en MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
