# rSalone/LFM3-1.7B-uncensored-abl38

## Resumen

LFM3-1.7B-uncensored-abl38 es una variante "abliterated" del modelo LiquidAI/LFM3-1.7B, publicada por el usuario rSalone en HuggingFace. El modelo base es un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) desarrollado por Liquid AI. La modificación consiste en la eliminación selectiva de la dirección de rechazo (refusal direction) en 38 de los 48 puntos donde el modelo escribe en el residual stream (24 capas × 2), mediante una técnica de abliteration que modifica directamente los pesos en lugar de intervenir durante la generación.

El objetivo declarado es eliminar la tendencia del modelo a rechazar peticiones consideradas dañinas o sensibles, manteniendo al mismo tiempo el rendimiento en tareas de razonamiento y matemáticas. Según la model card, el modelo responde sin rechazo a 179 de 200 prompts de HarmBench (frente a 21 del original), conservando GSM8K en 98/100 y GPQA Diamond en 96/198. La relevancia de esta ficha radica en que documenta una técnica de modificación de pesos poco habitual (eliminación de dirección con corrección de RMSNorm) aplicada a un modelo pequeño de la familia LFM3, con implicaciones tanto técnicas como de seguridad.

El modelo se distribuye en formato safetensors BF16 para transformers y en GGUF (BF16 y Q4_K_M) para llama.cpp, con licencia lfm-open-license-v1.0. No se dispone de información sobre los idiomas soportados ni sobre resultados de benchmarks adicionales más allá de los reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI), con modo de razonamiento (thinking) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (según el comando de llama.cpp con `-c 32768`; no se especifica explícitamente en la model card) |
| Tipos de cuantizacion | BF16, Q4_K_M (GGUF); BF16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (BF16), GGUF (BF16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1,7 mil millones de parámetros de Liquid AI, con capacidad de razonamiento explícito (thinking) antes de generar la respuesta. Según la model card, el modelo escribe en el residual stream en 48 puntos (24 capas × 2), cada uno seguido de una RMSNorm con peso γ. La modificación abliterated se realizó midiendo la dirección de rechazo como la media sobre todos los tokens del prompt, que según el autor elimina los rechazos mejor que las direcciones medidas dentro del thinking o de la respuesta.

La edición se escribió directamente en los pesos: en lugar de restar la dirección durante la generación, se calculó W' = W − b(aᵀW) con a = γ⊙r y b = r/γ (escalado para que aᵀb = 1), lo que redujo la divergencia KL respecto a la eliminación durante generación de 0,0053 a 0,0013 (abl48) y de 0,0030 a 0,0007 (abl38). La KL respecto al modelo original es de 0,0112 (abl48) y 0,0083 (abl38). No se modificaron otros pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking explícito antes de responder.
- Razonamiento matemático: GSM8K 98/100 según la model card.
- Razonamiento científico: GPQA Diamond 96/198 (con hasta 8.192 tokens; aproximadamente 50 preguntas truncadas y contadas como incorrectas).
- Respuesta a prompts que el modelo original rechazaría: 179/200 en HarmBench según el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los prompts de evaluación eran únicamente en inglés.
- Capacidades especiales: modo thinking, modelo "uncensored" por abliteration.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo en prompts dañinos, comparando con el original (21/200 vs 179/200 en HarmBench).
- Evaluación de técnicas de abliteration: sirve como caso de estudio de la corrección de RMSNorm en la escritura de ediciones en pesos (KL 0,0007 frente a 0,0030 sin corrección), útil para investigadores que replican la técnica en otros modelos.
- Generación de texto creativo sin restricciones: para aplicaciones donde se requiere ficción, role-play o contenido sensible que el modelo original rechazaría, con la advertencia de los riesgos asociados.
- Despliegue en hardware de consumo: con 1,7 mil millones de parámetros y cuantización Q4_K_M (1,10 GB), cabe en GPUs consumer como la RTX 5070 Ti (16 GB), con velocidades de aproximadamente 275 tok/s en Q4_K_M y 155 tok/s en BF16 según el autor.
- Experimentación con llama.cpp y transformers: el modelo se distribuye en GGUF y safetensors, lo que facilita su integración en pipelines de investigación con ambos backends.
- Análisis de robustez de clasificadores de seguridad: al generar respuestas que el clasificador oficial podría etiquetar de forma distinta, permite estudiar la variabilidad de los etiquetados (el autor señala que 19 de 200 etiquetas de HarmBench cambiaron entre transformers y llama.cpp).
- Estudio de sesgos y comportamiento en modelos pequeños: como modelo de 1,7B, es adecuado para experimentos de bajo coste sobre razonamiento y rechazo en modelos compactos.

## Benchmarks y rendimiento

| Benchmark | Original | abl38 (este modelo) | Notas |
|---|---|---|---|
| HarmBench (respondidos sin rechazo, de 200) | 21 | 179 | Etiquetado por Qwen3.8-Flash-Next local, no el clasificador oficial; prompts solo en inglés |
| GSM8K (correctos, de 100) | 98 | 98 | Una ejecución |
| GPQA Diamond (correctos, de 198) | 99 | 96 | Hasta 8.192 tokens; ~50 preguntas truncadas contadas como incorrectas |

El autor reporta además que, en la fase de selección con 10 prompts censurados, las direcciones medidas en el prompt respondieron los 10, mientras que las medidas al final del thinking respondieron 3 y 2, y las medidas en el medio de la respuesta 6 y 0. Una dirección aleatoria eliminada en los mismos 48 puntos respondió 24 de 200 en HarmBench. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB en BF16 (safetensors 3,46 GB, GGUF BF16 3,47 GB) y aproximadamente 1,1 GB en Q4_K_M (1,10 GB), más overhead de contexto y KV cache.
- GPU recomendadas: el autor verificó funcionamiento en NVIDIA GeForce RTX 5070 Ti (16 GB) con llama.cpp CUDA (build 12004) y transformers 5.22.0 con torch 2.15.0. No se dispone de datos para A100, H100 u otras GPUs.
- Cabe en GPU consumer: sí, en la RTX 5070 Ti (16 GB) y previsiblemente en GPUs con al menos 4 GB para Q4_K_M y 6-8 GB para BF16, aunque no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (llama-server con `-ngl 99 -c 32768 -fa on --jinja`) y transformers con `trust_remote_code=True` y `dtype="bfloat16"`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: aproximadamente 155 tok/s en BF16 y 275 tok/s en Q4_K_M en RTX 5070 Ti con llama.cpp, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HarmBench (sin rechazo) | GSM8K | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| LFM3-1.7B-uncensored-abl38 | 1,73B | 32.768 (según comando) | 179/200 | 98/100 | 96/198 | lfm-open-license-v1.0 | HuggingFace (safetensors, GGUF) |
| LFM3-1.7B-uncensored-abl48 | 1,73B | 32.768 (según comando) | no disponible en detalle (elimina en 48 puntos) | no disponible | no disponible | lfm-open-license-v1.0 | HuggingFace |
| LiquidAI/LFM3-1.7B (original) | 1,73B | no disponible | 21/200 | 98/100 | 99/198 | lfm-open-license-v1.0 | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (abliterated de ~1,7B) en la información proporcionada.

## Limitaciones y advertencias

- Cada benchmark se ejecutó una sola vez; el autor señala que ejecutar el original en transformers y en llama.cpp cambió 19 de 200 etiquetas de HarmBench, lo que indica variabilidad no despreciable.
- GPQA Diamond se evaluó con hasta 8.192 tokens y aproximadamente 50 de 198 preguntas se truncaron y contaron como incorrectas, lo que puede infraestimar el rendimiento real.
- Las respuestas de HarmBench fueron etiquetadas por un Qwen3.8-Flash-Next local, no por el clasificador oficial, y los prompts eran únicamente en inglés.
- El modelo está diseñado explícitamente para eliminar rechazos, lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado; no es adecuado para aplicaciones de producción sin salvaguardas externas.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Idiomas soportados: no disponible; la evaluación se limitó a inglés.
- Restricciones de licencia: lfm-open-license-v1.0; no se detallan en la información proporcionada las condiciones exactas para uso comercial, por lo que debe consultarse el archivo LICENSE del repositorio.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; debe revisarse antes de usarlo en entornos de producción.
- La técnica de abliteration modifica los pesos de forma permanente; no es una intervención reversible en tiempo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante abl48: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl48
- README en japonés: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38/blob/main/README_ja.md
- Licencia: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38/blob/main/LICENSE
