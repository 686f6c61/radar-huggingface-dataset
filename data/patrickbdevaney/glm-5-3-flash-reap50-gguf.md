# patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF

## Resumen

GLM-5.3-Flash-REAP50-GGUF es una cuantización GGUF de 4 bits de un modelo GLM-5.3-Flash podado al 50% de sus expertos mediante la técnica REAP (saliency pruning) y una corrección de escala de salida. El modelo original, desarrollado por Z.AI, es un MoE híbrido de 320B parámetros totales y 18B activos, con arquitectura multimodal y soporte nativo de visión. Esta versión reducida, creada por patrickbdevaney, baja los parámetros totales a ~165B y ofrece archivos Q4_K_M y Q4_K_S que ocupan alrededor de 93 GiB, lo que permite su ejecución en hardware más accesible.

La relevancia de este repositorio radica en que combina dos técnicas de compresión (poda de expertos y cuantización) sobre un modelo de vanguardia, manteniendo un alto rendimiento en dominios como código, matemáticas y tareas agénticas, aunque con una degradación notable en dominios genéricos. Sin embargo, requiere un parche de llama.cpp para soportar las hyper-connections mHC y la arquitectura híbrida (KDA + NoPE MLA), y la ausencia de DeepSeek Sparse Attention (DSA) en llama.cpp limita el contexto práctico muy por debajo del teórico de 1M tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con 34 capas KDA (linear attention) y 11 capas NoPE MLA, intercaladas 3:1, con hyper-connections mHC y visión nativa |
| Parametros totales | 164.907.253.550 (~165B) |
| Parametros activos | no disponible (el modelo base GLM-5.3-Flash tiene 18B activos) |
| Longitud de contexto | 1.048.576 tokens (teórico); en la práctica limitado por la falta de DSA en llama.cpp (medido hasta 32k) |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S (GGUF); también existe FP8 en otro repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo sin cuantizar) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash presenta una arquitectura híbrida que combina 34 capas de atención lineal KDA (Kernelized Dynamic Attention) con 11 capas de atención NoPE MLA (Multi-head Latent Attention), intercaladas en una proporción 3:1. Cada capa utiliza hyper-connections mHC (multi-head hyper-connections), que mantienen cuatro flujos residuales paralelos mezclados mediante una matriz normalizada por Sinkhorn. Además, el modelo es nativamente multimodal, con un vision tower (Glm5NextVisionModel) integrado. La poda REAP elimina el 50% de los expertos (reduciendo de 321B a ~165B) utilizando un criterio de saliencia calibrado sobre una mezcla de dominios, seguido de una corrección de escala de salida. El proceso de cuantización sigue la cadena FP8 → Q8_0 → 4-bit; el paso intermedio Q8_0 añadió un +0,78% de error frente a cuantizar directamente desde F32. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal (visión), heredadas del modelo base GLM-5.3-Flash.
- Soporte de tool calling y endpoints compatibles con OpenAI (según los tags del repositorio).
- Capacidades agénticas y multi-step reasoning, favorecidas por la selección de dominios en la poda.
- Multilingüismo: no se especifican idiomas concretos.
- Modo de pensamiento (thinking mode): no confirmado para esta versión.
- El bloque MTP (multi-token prediction) está incluido en los pesos, pero no es ejecutado por llama.cpp actualmente.

## Casos de uso

- Generación de código en producción: el modelo mantiene un acuerdo top-1 de 0,919 con el profesor en el dominio de código, por lo que es adecuado para autocompletado, revisión y generación de código en entornos CI/CD.
- Resolución de problemas matemáticos: con un acuerdo de 0,920, puede integrarse en sistemas de tutoría o cálculo simbólico.
- Agentes autónomos y tool calling: el dominio "agentic" muestra un acuerdo de 0,873, y el modelo soporta endpoints compatibles con OpenAI, lo que facilita su integración en frameworks de agentes.
- Análisis financiero asistido: aunque el acuerdo cae a 0,755, aún puede ser útil para tareas de extracción y resumen de datos financieros, siempre que se valide la salida.
- Aplicaciones de chat y asistencia conversacional: el tag "conversational" y el formato GGUF permiten desplegarlo con llama.cpp en servidores locales.
- Investigación en compresión de modelos: el repositorio sirve como referencia para estudiar el impacto de la poda de expertos y la cuantización en modelos MoE híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta versión podada y cuantizada. Los datos disponibles son:

| Métrica | Valor |
|---|---|
| Acuerdo top-1 global vs profesor (FP8) | 0,8425 |
| ΔNLL vs profesor | +0,1756 |
| Acuerdo por dominio (agentic) | 0,873 |
| Acuerdo por dominio (math) | 0,920 |
| Acuerdo por dominio (science) | 0,830 |
| Acuerdo por dominio (finance) | 0,755 |
| Acuerdo por dominio (ballast) | 0,580 |
| Acuerdo por dominio (code) | 0,919 |
| Perplejidad Q4_K_M (8 chunks de 512 tokens) | 4,5959 |
| Perplejidad Q4_K_S (8 chunks de 512 tokens) | 4,5833 |

Estas cifras corresponden al modelo FP8 sin cuantizar (salvo las perplejidades, que son de los archivos GGUF). La diferencia entre Q4_K_M y Q4_K_S está dentro del ruido de muestreo.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa aproximadamente 93 GiB, por lo que se necesita una GPU con al menos 96 GB de VRAM para una descarga completa, o usar CPU con memoria unificada (p. ej., Jetson Thor con 122 GB).
- GPUs recomendadas: NVIDIA A100 80GB (con cuantización adicional o capas en CPU), H100, o GPUs de 96 GB como la RTX 6000 Ada. No cabe en GPUs de consumo (RTX 4090 tiene 24 GB).
- Opciones de despliegue: llama.cpp parcheado (llama-completion, llama-server) con soporte OpenAI-compatible. No compatible con vLLM, Ollama o TGI en su estado actual.
- Latencia: en pruebas de needle-in-a-haystack, se midieron 54 s para 2k de contexto, 88 s para 8k y 236 s para 32k (en el hardware de prueba, no especificado).
- En sistemas de memoria unificada, se recomienda usar `-ngl 0 --no-repack` para evitar agotar la RAM física.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT | safetensors/FP8 |
| GLM-5.3-Flash-REAP50-GGUF | ~165B | no disponible | 1M (teórico) | MIT | GGUF |
| GLM-5.3 (flagship) | no disponible | no disponible | 1M | MIT | no disponible |

La comparativa directa con otros modelos de la misma categoría (MoE híbridos cuantizados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere un parche de llama.cpp (incluido en el repositorio) para cargar los archivos; las versiones estándar los rechazan.
- La longitud de contexto real está limitada por la ausencia de DSA en llama.cpp: las 11 capas DSA se ejecutan densas, lo que hace el coste O(n²). En la práctica, el rendimiento se degrada y la latencia crece rápidamente.
- La poda degrada significativamente los dominios genéricos ("ballast" 0,580), por lo que no es adecuado para tareas de trivia o prosa abierta.
- El bloque MTP (3,81B parámetros) está presente pero no se ejecuta; los pesos se cargan y se ignoran.
- No se ha medido el coste adicional de la cuantización 4-bit sobre los datos de poda; los números de perplejidad son solo un "tripwire" de corrupción, no un benchmark de calidad.
- La cuantización se realizó a través de un intermedio Q8_0, que añadió un 0,78% de error adicional frente a cuantizar desde F32.
- No se especifican idiomas soportados ni sesgos conocidos; se recomienda validar el modelo en el dominio de uso antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Repositorio FP8 del mismo autor: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Documentación de GLM-5.3-Flash en Z.AI: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Blog de Z.AI sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Repositorio de REAP (CerebrasResearch): https://github.com/CerebrasResearch/reap
