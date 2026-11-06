# Jeesup/svd-safety-l2_dualk_dual_tok_r50

## Resumen

`svd-safety-l2_dualk_dual_tok_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante una variante de SVD con whitening K-FAC en dos dominios (utilidad y seguridad), desarrollado por el usuario Jeesup. El modelo resultante conserva el 49,99 % de los parámetros densos del original (6.738.415.616 parámetros, 13,5 GB en safetensors) y ha sido recuperado con la etapa 2 de SVD-LLM, que aplica LoRA secuencial sobre U y luego sobre V usando alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

No se trata de un modelo de chat de propósito general, sino de un artefacto de investigación concebido para medir cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. Es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión. Su relevancia actual reside en que cuantifica el trade-off seguridad/utilidad bajo compresión, un problema poco documentado en la literatura de eficiencia de modelos.

La arquitectura subyacente es la de Llama 2 7B chat (transformer decoder-only), por lo que hereda sus limitaciones y su licencia (Llama 2 Community License). La ficha se limita a los datos publicados por el autor; no hay información sobre idiomas soportados ni sobre benchmarks comparativos más allá de las cuatro métricas reportadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B chat), comprimido con SVD whitened K-FAC dual |
| Parámetros totales | 6.738.415.616 (49,99 % del denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; no confirmada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf` y aplica una compresión SVD con whitening K-FAC en dos dominios: una curvatura de utilidad y otra de seguridad. El solver `dual` calcula el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` mediante ALS sobre base conjunta, partiendo de la solución de mezcla. El peso de seguridad es `a = 0.2639` (`--alpha tok`), con normalización `tok`: A dividido por posiciones y G dividido por tokens de pérdida (cross-entropy sumada), por dominio. El presupuesto de rango por matriz sigue la regla de SVD-LLM al mismo ratio de eliminación, con un 50,00 % de parámetros eliminados.

La calibración de utilidad usa `wikitext-2-raw-v1` train con el sampler de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, cross-entropy de siguiente token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). El ALS se ejecuta hasta 300 barridos con rtol 1e-7 y ridge 1e-6. La recuperación posterior aplica LoRA secuencial sobre U y V (alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Semilla global: 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta multi-turno en la medida en que el checkpoint comprimido lo preserve; el autor advierte que no es un asistente desplegable.
- Capacidad de medición de seguridad: el checkpoint está calibrado y evaluado frente a AdvBench y StrongREJECT con juez HarmBench.
- Capacidad de medición de utilidad: perplejidad en WikiText-2 como proxy de calidad lingüística.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio del trade-off seguridad/utilidad bajo compresión: sirve como celda experimental para comparar reglas de selección de componentes frente a otras variantes de la rejilla (por ejemplo, `mix_trace` o `dual_trace`), midiendo ASR y perplejidad en paralelo.
- Auditoría de robustez de checkpoints comprimidos: permite reproducir el efecto de la compresión SVD sobre la tasa de éxito de ataques (AdvBench 0,0250; StrongREJECT 0,0415) y sobre el sobre-rechazo (0,4367 macro en WildGuard).
- Investigación en interpretabilidad de mecanismos de seguridad: al disponer de curvatura de seguridad explícita en el solver, se puede analizar qué subespacios de pesos concentran el comportamiento de rechazo.
- Validación de pipelines de compresión SVD-LLM: el checkpoint sirve como referencia reproducible (semilla 42, hiperparámetros documentados) para verificar implementaciones de K-FAC whitening dual.
- Benchmarking de jueces de seguridad: las métricas con juez HarmBench y WildGuard permiten calibrar evaluadores automáticos sobre modelos deliberadamente degradados.
- Docencia y divulgación sobre eficiencia de modelos: ejemplo concreto de cómo un 50 % de eliminación de parámetros afecta a la perplejidad (11,8981 en WikiText-2) y a la alineación de seguridad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Macro over-refusal (WildGuard) | 0,4367 |
| Perplejidad WikiText-2 | 11,8981 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas frente a otros checkpoints de la misma rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16 GB de VRAM es el mínimo ajustado y 24 GB es lo recomendable.
- Cuantización a 8 bits: en torno a 7 GB de pesos; a 4 bits: en torno a 3,5-4 GB. El autor no publica versiones GGUF ni cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16 GB) para bf16 con contexto corto; GPUs de 8-12 GB solo con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en RTX 3060 12 GB o similares con cuantización a 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM (referenciado en los resultados de búsqueda para checkpoints hermanos), llama.cpp/Ollama tras conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_dualk_dual_tok_r50` | 6,74 B (49,99 % del denso) | no disponible | Llama 2 | Celda de la rejilla con normalización `tok` y solver `dual` |
| `Jeesup/svd-safety-l2_dualk_mix_trace_r50` | ~7 B (referencia) | no disponible | Llama 2 | Variante `mix_trace` de la misma rejilla |
| `Jeesup/svd-safety-l2_dualk_dual_trace_r50` | ~7 B (referencia) | no disponible | Llama 2 | Variante `dual_trace` de la misma rejilla |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4.096 tokens (estándar Llama 2) | Llama 2 | Modelo base sin comprimir |

No se dispone de datos de rendimiento de las variantes hermanas en la información proporcionada; solo se confirma su existencia y su pertenencia a la misma rejilla experimental.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un asistente desplegable: es un sujeto experimental y debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: heredado de Llama 2 7B chat y potencialmente agravado por la compresión, sin cuantificación publicada.
- Sesgos conocidos: no documentados en la model card; se heredan los de Llama 2.
- Limitaciones de contexto e idioma: no documentadas; se asume la ventana de Llama 2, pero no está confirmada para este checkpoint.
- Restricciones de licencia: Llama 2 Community License; `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. Uso comercial sujeto a los términos de dicha licencia y a las políticas de uso aceptable de Meta.
- El sobre-rechazo macro de 0,4367 (WildGuard) es elevado y puede afectar a la utilidad conversacional en producción.
- No hay versiones cuantizadas ni GGUF publicadas, lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_tok_r50
- Variante hermana `mix_trace`: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r50
- Variante hermana `dual_trace`: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_trace_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
