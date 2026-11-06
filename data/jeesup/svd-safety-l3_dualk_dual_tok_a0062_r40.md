# Jeesup/svd-safety-l3_dualk_dual_tok_a0062_r40

## Resumen

`svd-safety-l3_dualk_dual_tok_a0062_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo entrenado desde cero ni un fine-tune convencional: es el resultado de aplicar una compresión SVD con criterio dual (utilidad y seguridad) sobre los pesos de Llama-3-8B-Instruct, eliminando el 40 % de los parámetros densos y recuperando parte de la capacidad con un LoRA de segunda etapa. El checkpoint resultante conserva 8.030.261.248 parámetros y ocupa 16,1 GB en el repositorio.

El propósito declarado es estrictamente experimental: estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto es una celda de una cuadrícula de experimentos sobre reglas de selección y presupuestos de rango, con un peso de seguridad `a = 0.0620` y normalización de curvatura `tok`. El autor advierte explícitamente que no debe tratarse como un asistente de propósito general.

La relevancia es doble: por un lado, cuantifica el compromiso entre utilidad (perplejidad en WikiText-2) y seguridad (tasas de éxito de ataque en AdvBench y StrongREJECT) bajo compresión; por otro, sirve como referencia metodológica para quienes investigan compresión de modelos alineados y quieren reproducir o comparar técnicas de poda de bajo rango con preservación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD con criterio dual K-FAC |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3-8B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only de Llama 3 con 8B parámetros. Sobre esa base se aplica una compresión SVD con presupuesto de rango por matriz según la regla de SVD-LLM, usando una curvatura K-FAC en dos dominios: utilidad (calculada sobre `wikitext-2-raw-v1` train, 255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token) y seguridad (calculada sobre `results/dual_kfac_wj/wj_safe_l3.jsonl`, 512 muestras, pérdida sobre tokens de respuesta). El solver `dual` obtiene el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` mediante ALS de base conjunta, partiendo de la solución mixta, con hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`. La normalización de curvatura es `tok`: A dividido por posiciones y G dividido por tokens de pérdida, por dominio. El peso de seguridad es `a = 0.0620`.

Tras la compresión al 59,98 % de los parámetros densos (40,00 % eliminados), se aplica la etapa 2 de recuperación de SVD-LLM: un LoRA secuencial sobre U y luego sobre V, con `r=8`, `alpha=16`, 2 épocas, `lr 1e-4`, batch 64, cutoff 256 y precisión bf16, entrenado sobre `alpaca-cleaned`. No se documentan en la información disponible datos sobre RLHF, DPO u otras fases de alineamiento posteriores; el alineamiento original proviene de Llama-3-8B-Instruct.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y por el LoRA de recuperación sobre `alpaca-cleaned`.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la merma de capacidad que introduce la eliminación del 40 % de parámetros.
- Soporte multilingüe: no documentado en la información disponible; se desconoce el impacto de la compresión sobre idiomas distintos del inglés.
- Tool calling / function calling: no documentado en la información disponible para este checkpoint comprimido.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el autor no las menciona y el modelo no está pensado para despliegue.
- Capacidad especial: sirve como artefacto de medición de seguridad bajo compresión, con métricas de ASR y sobre-rechazo publicadas.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de comparación frente a otras variantes de la cuadrícula (`a`, normalización, presupuesto) para medir cómo cambia el ASR en AdvBench y StrongREJECT al variar el peso de seguridad.
- Reproducción de experimentos de SVD-LLM: el checkpoint permite validar la implementación de la etapa 2 de recuperación con LoRA secuencial sobre U y V, comparando la perplejidad en WikiText-2 (16,4920) con la del modelo denso.
- Estudio de sobre-rechazo: la métrica de sobre-rechazo macro (0,1470) con WildGuard permite analizar el coste en utilidad de preservar seguridad bajo compresión.
- Auditoría de salvaguardas: evaluar con jueces externos (HarmBench, WildGuard) si un modelo comprimido mantiene las negativas ante peticiones dañinas o si, por el contrario, el proceso de compresión abre brechas.
- Docencia y formación: ilustrar en cursos de interpretabilidad y compresión el efecto de la selección de componentes sobre el comportamiento alineado, con métricas reproducibles.
- Base para ablaciones controladas: servir como punto de partida para probar otras reglas de selección de rango o pesos de curvatura sin reentrenar desde cero.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0981 |
| StrongREJECT ASR (juez HarmBench) | 0,1278 |
| Sobre-rechazo macro (WildGuard) | 0,1470 |
| Perplejidad WikiText-2 | 16,4920 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo denso original u otros checkpoints de la cuadrícula.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB (no se distribuyen GGUF oficiales, habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `svd-safety-l3_dualk_dual_tok_a0062_r40` (este) | 8,03 B (40 % podado) | no disponible | Llama 3 Community | Checkpoint de investigación con métricas de seguridad publicadas |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B denso | 8.192 tokens (según ficha oficial de Llama 3) | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| `Jeesup/svd-safety-l3_dualk_dual_tok_r40` | 8 B (misma familia) | no disponible | Llama 3 Community | Variante de la misma cuadrícula sin peso de seguridad `a` documentado en la información disponible |

No se dispone en la información proporcionada de comparaciones numéricas de ASR o perplejidad entre estas variantes; la comparativa se limita a parámetros, licencia y naturaleza del checkpoint.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint es un artefacto de investigación y no un asistente desplegable; varias celdas de la cuadrícula están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint concreto reporta ASR de 0,0981 en AdvBench y 0,1278 en StrongREJECT, valores que deben interpretarse en el contexto del estudio y no como garantía de robustez.
- Riesgo de alucinación y pérdida de calidad general no cuantificado más allá de la perplejidad en WikiText-2 (16,4920); no hay evaluaciones de MMLU, HumanEval ni GSM8K.
- Idiomas soportados no documentados; el impacto de la compresión sobre idiomas distintos del inglés es desconocido.
- Longitud de contexto efectiva no confirmada para este checkpoint; no se garantiza que herede sin merma los 8.192 tokens de Llama-3-8B-Instruct.
- Restricciones de licencia: Llama 3 Community License, con `USE_POLICY.md` vinculante; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de "Built with Meta Llama 3".
- El LoRA de recuperación se entrenó sobre `alpaca-cleaned`, lo que puede introducir sesgos de estilo y dominio respecto al modelo original.
- Solo 50 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_tok_a0062_r40
- Variante relacionada: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
