# Jeesup/svd-safety-l2_dualk_mix_tok_a0132_r40

## Resumen

`svd-safety-l2_dualk_mix_tok_a0132_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No es un modelo conversacional de propósito general, sino una celda concreta de un grid experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor.

El modelo aplica una compresión SVD con blanqueado K-FAC en doble dominio (curvatura de utilidad y curvatura de seguridad) usando el presupuesto de rango de SVD-LLM, eliminando el 40,00 % de los parámetros (fracción resultante 0,5998), y después recupera capacidad con el LoRA de segunda etapa de SVD-LLM (U y luego V secuenciales, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). El resultado son 6.738.415.616 parámetros reales en safetensors.

Su relevancia es metodológica: cuantifica el intercambio entre seguridad y utilidad bajo compresión y sirve como sujeto experimental, no como asistente desplegable. El autor advierte explícitamente de que varias ramas del grid están deliberadamente degradadas en seguridad y de que cualquier celda debe evaluarse por cuenta propia antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con blanqueado K-FAC en doble dominio |
| Parametros totales | 6.738.415.616 (fracción 0,5998 respecto al denso; 40,00 % de parámetros eliminados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Llama 2 de 7B en su variante chat. La compresión se realiza con SVD blanqueado por K-FAC en doble dominio: se construye una matriz de curvatura mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, donde `G_u`/`A_u` proceden de la curvatura de utilidad y `G_s`/`A_s` de la curvatura de seguridad, con un peso de seguridad `a = 0,1320` (`--alpha 0.132`). El solver es `mix`: SVD blanqueado en forma cerrada sobre esa curvatura mixta única. La normalización de curvatura es `tok`: `A` dividido por posiciones y `G` dividido por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz es el de SVD-LLM para el mismo ratio de eliminación.

La calibración de utilidad usa `wikitext-2-raw-v1` train con el muestreador de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, la recuperación se hace con el LoRA de segunda etapa de SVD-LLM en modo secuencial U y luego V, sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresión y la recuperación LoRA.
- Razonamiento y respuesta a instrucciones en el rango esperable para un 7B chat, sin garantías tras la compresión.
- Soporte de tool calling / function calling: no documentado en la model card; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado; el checkpoint está pensado como sujeto experimental.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: no dispone de modo thinking, visión ni audio; su interés es interpretabilidad de la compresión y comportamiento de seguridad bajo SVD.

## Casos de uso

- Estudio de degradación de seguridad por compresión: usar este checkpoint como celda del grid para medir cómo varía la tasa de éxito de ataque (ASR) al eliminar el 40 % de parámetros y comparar con otras reglas de selección de componentes.
- Evaluación de reglas de selección de componentes: contrastar el solver `mix` con blanqueado K-FAC en doble dominio frente a alternativas de utilidad pura o seguridad pura, manteniendo el mismo presupuesto de rango.
- Investigación de reparación post-compresión: analizar el efecto del LoRA de segunda etapa (r=8, alpha=16, alpaca-cleaned) sobre la recuperación de utilidad y seguridad tras la SVD.
- Benchmarking de robustez adversarial: emplear AdvBench y StrongREJECT con juez HarmBench para caracterizar el ASR de checkpoints comprimidos frente al modelo denso original.
- Análisis de sobre-rechazo: usar la métrica de macro over-refusal con WildGuard para estudiar el equilibrio entre seguridad y utilidad conversacional.
- Reproducibilidad de pipelines de compresión: servir como referencia reproducible (semilla 42, calibraciones documentadas) para validar implementaciones de SVD-LLM con curvatura K-FAC en doble dominio.
- Estudio de perplejidad tras compresión: medir WikiText-2 perplexity (9,9478 reportada) como indicador de fidelidad de lenguaje del checkpoint comprimido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Macro over-refusal (WildGuard) | 0,5350 |
| WikiText-2 perplexity | 9,9478 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo de pesos (tamaño del repo), más overhead de activaciones y caché KV; requiere GPU con al menos 16 GB para bf16.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantización, sujeto a validación propia.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_mix_tok_a0132_r40 | 6.738.415.616 (0,5998 del denso) | no disponible | Llama 2 Community | Checkpoint de investigación comprimido por SVD con K-FAC en doble dominio |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B (denso) | 4.096 tokens (especificación Llama 2, no confirmada en la card) | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid del mismo autor | variable según ratio | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de comparativas numéricas publicadas frente a modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Varias ramas del grid están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint debe evaluarse antes de cualquier uso.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión y la recuperación LoRA pueden alterar el comportamiento respecto al modelo base.
- Macro over-refusal de 0,5350 (WildGuard): indica un nivel notable de rechazos excesivos que puede afectar a la utilidad conversacional.
- Idiomas soportados no documentados; no debe asumirse cobertura multilingüe más allá de la del modelo base.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial de este derivado está sujeto a dichos términos.
- No se documentan variantes cuantizadas ni soporte explícito en motores de inferencia distintos de transformers y TGI.
- Ausencia de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) impide validar capacidades generales más allá de las métricas de seguridad y perplejidad reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_tok_a0132_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (referencia citada en la model card): no disponible enlace directo en la información proporcionada
- HarmBench (juez de evaluación): no disponible enlace directo en la información proporcionada
- WildGuard (evaluación de over-refusal): no disponible enlace directo en la información proporcionada
- AdvBench y StrongREJECT (conjuntos de evaluación): no disponible enlace directo en la información proporcionada
