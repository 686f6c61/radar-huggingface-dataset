# Jeesup/svd-safety-l3_dualk_mix_tok_r50

## Resumen

`svd-safety-l3_dualk_mix_tok_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo nuevo entrenado desde cero, sino un artefacto experimental de compresión: se ha aplicado una descomposición en valores singulares (SVD) con preblanqueado K-FAC en dos dominios (utilidad y seguridad) para eliminar el 50,00 % de los parámetros densos, seguida de una recuperación con LoRA en dos etapas (primero U, luego V) según la metodología SVD-LLM.

El objetivo del autor no es ofrecer un asistente conversacional desplegable, sino medir empíricamente cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto es una celda de una rejilla que barre distintas reglas de selección y presupuestos de rango; el autor advierte explícitamente que varias celdas de la rejilla están "deliberadamente degradadas en seguridad" y que cualquier celda debe tratarse como sujeto experimental, no como producto.

La relevancia actual es metodológica: cuantifica el trade-off seguridad/utilidad bajo compresión de parámetros con métricas de ataque (AdvBench, StrongREJECT) y de sobre-rechazo (WildGuard), además de perplejidad en WikiText-2. El modelo conserva la arquitectura y el tokenizador de Llama-3-8B-Instruct, con 8.030.261.248 parámetros reportados en safetensors (la fracción resultante tras la compresión es 0,4997).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), checkpoint comprimido mediante SVD con preblanqueado K-FAC dual y recuperación LoRA |
| Parametros totales | 8.030.261.248 (safetensors); fracción resultante tras compresión: 0,4997 del denso original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3-8B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors; la recuperación LoRA se entrenó en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct` y aplica una compresión SVD-LLM con presupuesto de rango por matriz al mismo ratio de eliminación (50,00 % de parámetros eliminados). La innovación técnica está en la selección de componentes: en lugar de usar solo la curvatura de utilidad, se construye una matriz K-FAC mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, donde `G_u`/`A_u` provienen del dominio de utilidad y `G_s`/`A_s` del dominio de seguridad. El solver `mix` resuelve la SVD preblanqueada en forma cerrada sobre esa matriz mixta, con un peso de seguridad `a = 0.1238` (flag `--alpha tok`). La normalización de curvatura es `tok`: `A` dividida por posiciones y `G` dividida por tokens de pérdida (entropía cruzada sumada), por dominio.

La calibración de utilidad usa `wikitext-2-raw-v1` de entrenamiento con el sampler de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre los tokens de respuesta). Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento e instrucciones generales: el checkpoint conserva la estructura del modelo base, pero el autor no certifica ninguna capacidad concreta.
- Capacidad multilingüe: no documentada en la model card; se desconoce el impacto de la compresión sobre idiomas distintos del inglés.
- Tool calling / function calling: no documentado; no hay garantía de que se preserve el comportamiento del modelo base.
- Uso como sujeto experimental para estudios de seguridad bajo compresión: es su capacidad principal y declarada.
- No se documentan modos de pensamiento, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia en una rejilla que compara reglas de selección de componentes SVD (utilidad sola frente a mixta con seguridad) a un presupuesto fijo del 50 % de parámetros.
- Estudio del trade-off seguridad/utilidad: medir cómo varían AdvBench ASR, StrongREJECT ASR y sobre-rechazo WildGuard al cambiar el peso de seguridad `a` y la normalización de curvatura, usando este checkpoint como punto de comparación.
- Evaluación de recuperación LoRA post-compresión: analizar si la etapa 2 de SVD-LLM sobre `alpaca-cleaned` recupera utilidad sin reintroducir vulnerabilidades, comparando perplejidad en WikiText-2 (19,5148 en este checkpoint) con la de otras celdas.
- Reproducibilidad metodológica: replicar el pipeline (K-FAC dual, solver `mix`, semilla 42, calibraciones documentadas) para validar resultados en otros modelos base de la familia Llama 3.
- Análisis de interpretabilidad: inspeccionar qué componentes (U y V) se retienen bajo la curvatura mixta y correlacionarlo con comportamientos de rechazo y sobre-rechazo.
- Docencia y formación: usar el checkpoint como ejemplo práctico de cómo la compresión puede degradar la alineación de un modelo y de cómo diseñar un banco de evaluación de seguridad para medirlo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0154 |
| StrongREJECT ASR (juez HarmBench) | 0,0767 |
| Macro sobre-rechazo (WildGuard) | 0,3156 |
| Perplejidad WikiText-2 | 19,5148 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la rejilla, por lo que no es posible establecer la magnitud exacta de la degradación a partir de estos datos aislados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros), más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable en bf16 con contextos contenidos.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB si se cuantiza, aunque no se distribuyen pesos cuantizados oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión propia, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_dualk_mix_tok_r50` | 8,03 B (fracción 0,4997 del denso) | no disponible | Llama 3 Community License | Artefacto de investigación; ASR AdvBench 0,0154, StrongREJECT 0,0767, sobre-rechazo 0,3156, PPL WikiText-2 19,5148 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8.192 tokens (modelo base) | Llama 3 Community License | Modelo original sin comprimir; referencia de utilidad y seguridad frente a la que se mide la degradación |
| Otras celdas de la rejilla del mismo autor | ~8,03 B | no disponible | Llama 3 Community License | Distintas reglas de selección y presupuestos; el autor advierte que algunas están deliberadamente degradadas en seguridad |
| Alternativas de compresión SVD-LLM publicadas | variable | no disponible | variable | No se dispone de datos comparativos concretos en la información proporcionada |

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental.
- La compresión por sí sola eleva la tasa de éxito de ataques; varias celdas de la rejilla están deliberadamente degradadas en seguridad y este checkpoint podría no ser una excepción en todos los escenarios.
- Riesgo de alucinación y de degradación de instrucciones no cuantificado más allá de las métricas publicadas.
- El sobre-rechazo macro medido (0,3156) indica una tasa notable de rechazos innecesarios, lo que afecta a la utilidad en producción.
- Idiomas soportados no documentados; se desconoce el impacto de la compresión en idiomas distintos del inglés.
- Longitud de contexto no confirmada en la model card; no debe asumirse la del modelo base sin verificación.
- Licencia Llama 3 Community License: uso comercial sujeto a `LICENSE` y `USE_POLICY.md` incluidos en el repositorio, con las restricciones habituales de la familia Llama 3.
- Cero descargas y cero likes en el momento de la consulta; sin validación comunitaria ni versiones cuantizadas oficiales.
- No apto para despliegue en producción sin una evaluación propia y exhaustiva de seguridad y utilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_tok_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Metodología SVD-LLM (referencia citada por el autor): no disponible como enlace en la información proporcionada
- Paper de K-FAC (referencia metodológica): no disponible como enlace en la información proporcionada
- Repositorio del código de compresión: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
