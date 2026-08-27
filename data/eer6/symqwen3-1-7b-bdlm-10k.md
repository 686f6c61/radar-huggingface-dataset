# EER6/SymQwen3-1.7B-BDLM-10k

## Resumen

SymQwen3-1.7B-BDLM-10k es un modelo de lenguaje de difusión (DLM) desarrollado por EER6 como parte de la campaña DLM1B **qwen3_sym** (agosto de 2026). Se trata de una conversión directa del modelo autorregresivo Qwen/Qwen3-1.7B: se elimina la máscara causal y se entrena con atención bidireccional libre durante 10.000 pasos, con un presupuesto total de cómputo de aproximadamente 5.200 millones de tokens. El objetivo es comparar recetas de conversión AR→DLM bajo condiciones controladas, siendo este uno de los cuatro brazos del experimento.

El modelo conserva la arquitectura base de Qwen3-1.7B (un transformer denso de 2.031.739.904 parámetros) pero con semántica de atención bidireccional, lo que lo convierte en un DLM de enmascarado (masked DLM) en lugar de un modelo autorregresivo. Su relevancia radica en que permite estudiar el impacto de la atención simétrica frente a la asimétrica en la conversión de modelos de lenguaje, un área activa de investigación en eficiencia y generación no autorregresiva. La licencia es Apache-2.0 y los pesos están en formato safetensors (bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (DLM) basado en Qwen3-1.7B, sin máscara causal |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (canvas de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | No disponible (hereda de Qwen3, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen/Qwen3-1.7B y elimina la máscara causal, permitiendo atención bidireccional libre en todas las capas. El entrenamiento se realizó durante 10.000 pasos con un tamaño de lote global de 256 y secuencias de 2048 tokens (unos 5.200 millones de tokens en total), con una tasa de aprendizaje de 1e-5, sin weight decay, y un programador WSD (warmup-stable-decay) con fases 100/*/500. Se usó la mezcla de datos ADLMC v3 con aumento de datos congelado y supervisión de objetivo limpio en todas las posiciones.

La conversión se enmarca en un experimento controlado de cuatro brazos: BDLM (bidireccional directo), CDLM (etapa de tolerancia a máscara causal) y dos adaptaciones por etapas con atención libre (BDLM) o simetrizada (SDLM). Este modelo corresponde al brazo BDLM-10k. El avance del modelo asume un canvas completo (attention_mask None o todos unos) y no utiliza caché KV, lo que implica una inferencia sin estado y con coste cuadrático en la longitud de la secuencia.

## Capacidades

- Generación de texto mediante difusión: el modelo produce texto a partir de tokens enmascarados, no de forma autorregresiva.
- Razonamiento y generación de código: los benchmarks internos muestran resultados en HumanEval y MBPP, indicando capacidad para tareas de programación.
- Atención bidireccional completa: permite modelar dependencias contextuales en ambas direcciones, útil para tareas de relleno de huecos (infilling).
- Sin caché KV: la inferencia es stateless, lo que simplifica el despliegue pero limita la eficiencia en secuencias largas.
- Compatibilidad con el ecosistema HuggingFace: se carga con `transformers` usando `trust_remote_code=True`.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en modelos de lenguaje de difusión: sirve como punto de referencia para estudiar la conversión AR→DLM y comparar estrategias de atención (libre vs simetrizada) bajo presupuesto de cómputo fijo.
- Generación de código en entornos experimentales: con un pass@1 de 27.4 en HumanEval (gen-256), puede usarse para prototipar asistentes de programación no autorregresivos.
- Relleno de huecos (infilling) en texto: la atención bidireccional y el token especial MASK (`<|fim_middle|>`) lo hacen adecuado para completar fragmentos de código o texto en medio de una secuencia.
- Evaluación de métricas de decodificación: al no usar caché KV, es útil para probar algoritmos de decodificación por difusión y comparar con modelos autorregresivos.
- Estudio de robustez ante cambios de semántica de atención: el aviso sobre `attn_mode` permite investigar el colapso de modelos cuando se altera la regla de atención en inferencia.
- Base para fine-tuning posterior: al ser un modelo abierto (Apache-2.0) y con pesos completos, puede adaptarse a tareas específicas de generación no autorregresiva.

## Benchmarks y rendimiento

La model card reporta resultados de los cuatro brazos del experimento, evaluados con un harness propio (dQwen, block32-static-s32, greedy, canvas 256). Estos valores no son comparables con evaluaciones de gen-1024 de otros modelos.

| Modelo | HumanEval (gen-256) pass@1 | MBPP-499 (gen-256) pass@1 |
|---|---|---|
| BDLM-10k (este modelo) | 27.4 | 25.1 |
| CDLM-5k (stage) | 9.1 | 10.0 |
| CDLM→BDLM-5k | 23.2 | 27.9 |
| CDLM→SDLM-5k | 26.2 | 26.1 |

El titular del experimento indica que la comparación controlada CDLM→SDLM vs CDLM→BDLM resultó en un empate aproximado a este presupuesto, con una sola semilla y decodificación greedy. No se han publicado resultados en benchmarks estándar externos (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.031.739.904 parámetros en bf16 (2 bytes por parámetro), los pesos ocupan aproximadamente 4,1 GB. Con overhead de activaciones y el canvas de 2048 tokens, se estima un consumo de 5-6 GB en inferencia (estimación orientativa, no hay datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10/A100. Cabe en GPUs de consumo modernas.
- Opciones de despliegue: únicamente mediante `transformers` con `trust_remote_code=True` y dtype bfloat16. No es compatible directamente con vLLM, llama.cpp u Ollama sin adaptación, dado que el avance es no autorregresivo y no usa caché KV.
- Latencia y throughput: no disponibles. Al no usar caché KV y requerir atención completa sobre el canvas, la latencia escala cuadráticamente con la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para otros modelos de difusión de lenguaje del mismo tamaño en la información proporcionada. El modelo base Qwen/Qwen3-1.7B es autorregresivo y no tiene una conversión DLM oficial. Se puede señalar que este modelo es un derivado experimental de Qwen3-1.7B, con la misma arquitectura subyacente pero semántica de atención bidireccional, lo que lo sitúa en una categoría distinta (DLM frente a AR). No hay información suficiente para una comparativa cuantitativa con alternativas como LLaDA o Diffusion-LM.

## Limitaciones y advertencias

- El modelo es experimental: tiene 0 descargas y 0 likes en HuggingFace, y forma parte de una campaña de investigación con una única semilla y decodificación greedy.
- Advertencia crítica sobre `attn_mode`: no se debe sobrescribir la configuración de atención cargada. Ejecutar un checkpoint CDLM-SDLM con atención bidireccional libre colapsa el modelo instantáneamente. Este modelo (BDLM) usa atención libre, pero la advertencia aplica a la familia completa.
- Contexto limitado a 2048 tokens: secuencias más largas no están soportadas y el canvas de evaluación es de 256 tokens, lo que limita su uso en tareas de contexto largo.
- Sin caché KV: la inferencia es ineficiente para generación larga y no es adecuada para despliegue en producción a gran escala.
- Idiomas no especificados: aunque hereda el vocabulario de Qwen3, no se garantiza soporte multilingüe.
- Riesgo de alucinación y sesgos: no se han documentado evaluaciones de sesgo o factualidad; al ser un modelo de difusión, puede presentar comportamientos atípicos en comparación con modelos autorregresivos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está optimizado para producción y carece de garantías.

## Enlaces

- HuggingFace: https://huggingface.co/EER6/SymQwen3-1.7B-BDLM-10k
- Repositorio de Qwen3 (referencia del modelo base): https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Página de Qwen3 en Ollama (referencia): https://ollama.com/library/qwen3:1.7b
