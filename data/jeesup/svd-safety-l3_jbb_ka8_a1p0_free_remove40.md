# Jeesup/svd-safety-l3_jbb_ka8_a1p0_free_remove40

## Resumen

svd-safety-l3_jbb_ka8_a1p0_free_remove40 es un checkpoint de investigación publicado por Jeesup a partir de `meta-llama/Meta-Llama-3-8B-Instruct`. No es un modelo entrenado desde cero: es una compresión post-entrenamiento mediante SVD-LLM que elimina el 40,00% de los parámetros densos y deja una fracción efectiva declarada de 0,5998. El objetivo del artefacto es estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes restaura mejor la funcionalidad; esta celda concreta usa una regla de selección etiquetada como `unknown` y un presupuesto de restauración del 0,000%, es decir, cero componentes restaurados.

El modelo conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parámetros reportados por los safetensors del repositorio y una ventana de contexto heredada del base de 8.192 tokens (no verificada en la model card). La model card advierte explícitamente de que es un artefacto de investigación y no un asistente general desplegable: varias celdas de la matriz están deliberadamente degradadas en seguridad. Es relevante ahora porque cuantifica el intercambio seguridad/utilidad bajo compresión, un problema práctico para desplegar modelos de 8B en hardware limitado.

Los datos publicados incluyen ASR de AdvBench (0,1462) y StrongREJECT (0,1821) con juez HarmBench, sobre-rechazo macro WildGuard (0,0993) y perplejidad WikiText-2 (24,0932). No hay resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parámetros totales | 8.030.261.248 según safetensors; fracción efectiva declarada 0,5998 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Llama 3 8B Instruct; no confirmado en la model card) |
| Tipos de cuantización | no disponible; solo safetensors, sin GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3, fine-tune instruct de Meta, al que se le aplica una compresión SVD-LLM post-entrenamiento. La model card indica que se elimina el 40,00% de los parámetros densos, que la fracción resultante es 0,5998, que el presupuesto de restauración es 0,000%, que se restauran 0 componentes y se intercambian 0, y que la semilla es 42. La regla de selección aparece como `unknown`, un metadato que impide reproducir con precisión el criterio de selección empleado.

No se documentan tokens de entrenamiento adicionales, composición del dataset, RLHF/DPO propio ni innovaciones de decodificación. La innovación técnica es la propia descomposición SVD y el barrido sobre reglas de selección y presupuestos de restauración para medir el efecto en seguridad y utilidad.

## Capacidades

- Generación de texto y conversación instruct básica, heredada de Llama-3-8B-Instruct, pero condicionada por la compresión.
- Razonamiento, matemáticas y código: no evaluados en esta ficha; no hay resultados de MMLU, GSM8K ni HumanEval.
- Tool calling / function calling: no documentado; no se debe asumir su disponibilidad.
- Agentes y razonamiento multi-step: no documentado.
- Capacidades multilingües: no declaradas; la cobertura heredada del modelo base no está verificada.
- Evaluación de seguridad: métricas de tasa de éxito de ataque y de sobre-rechazo.
- Modo thinking, visión y audio: no disponibles.

## Casos de uso

- Evaluación de degradación de seguridad por compresión: usar el checkpoint como celda con 0 componentes restaurados y comparar su ASR de AdvBench (0,1462) y StrongREJECT (0,1821) frente a Llama-3-8B-Instruct y otras celdas del barrido; aísla el efecto de la compresión sin restauración.
- Ablación de reglas de selección SVD: esta celda sirve de control con presupuesto 0,000% y regla `unknown`; permite medir si una regla de restauración mejora seguridad o utilidad.
- Medición de sobre-rechazo: usar WildGuard macro over-refusal (0,0993) para estudiar si la compresión aumenta rechazos indebidos en prompts benignos.
- Análisis de utilidad/perplejidad: WikiText-2 (24,0932) como indicador de degradación del lenguaje; útil para correlacionar perplejidad con ASR.
- Reproducción de pipelines SVD-LLM: validar implementaciones de descomposición y restauración con semilla 42 y fracción 0,5998.
- Red-teaming controlado en laboratorio: generar respuestas para benchmarks de seguridad con juez HarmBench; no para exposición pública.
- Docencia e investigación: ejemplo de artefacto que ilustra el intercambio seguridad/utilidad en compresión de modelos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1462 | 14,62% de ataques exitosos; menor es mejor |
| StrongREJECT | ASR (juez HarmBench) | 0,1821 | 18,21% de ataques exitosos; menor es mejor |
| WildGuard | Macro over-refusal | 0,0993 | 9,93% de sobre-rechazo; menor es mejor |
| WikiText-2 | Perplejidad | 24,0932 | Menor es mejor |
| MMLU, HumanEval, GSM8K | no disponible | no disponible | No publicados en la información disponible |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB solo para pesos; unos 18-22 GB con KV cache para 8K y lote pequeño. Si el runtime explota la fracción efectiva 0,5998, podría reducirse, pero no está confirmado.
- VRAM estimada en 8-bit: aproximadamente 8-9 GB de pesos; unos 10-12 GB con KV cache.
- VRAM estimada en 4-bit: aproximadamente 4-5 GB de pesos; unos 6-9 GB con KV cache.
- GPU recomendadas: A100 40GB, H100 80GB y L40S 48GB para FP16 con lotes; RTX 4090/3090 24GB para FP16 con contexto corto o 8-bit; RTX 4060 Ti 16GB y similares para 8-bit/4-bit; 8GB solo en 4-bit con contexto reducido.
- Cabe en GPU de consumo: sí, en 4-bit en 8-12 GB; FP16 requiere 24 GB o más para contexto corto.
- Despliegue: transformers; TGI (tag `endpoints_compatible`); vLLM si soporta la arquitectura y el formato, no garantizado con SVD; llama.cpp/Ollama requieren GGUF y no hay GGUF publicado; la compresión SVD puede no preservarse.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_jbb_ka8_a1p0_free_remove40 | 8,03B totales; fracción efectiva 0,5998 | 8K heredado | AdvBench 0,1462; StrongREJECT 0,1821 | Llama 3 | Hugging Face (repo de investigación) |
| Meta-Llama-3-8B-Instruct | 8,03B | 8K | no disponible en esta ficha | Llama 3 | Hugging Face (oficial) |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | no disponible en esta ficha | Llama 3.1 | Hugging Face (oficial) |

No se dispone de MMLU, HumanEval ni GSM8K para comparar rendimiento general entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: no es un asistente general ni un modelo listo para producción.
- Seguridad degradada por compresión: la model card indica que la compresión por sí sola eleva la tasa de éxito de ataque; los ASR publicados no son cero.
- Regla de selección `unknown` y 0 componentes restaurados: el criterio de selección no es interpretable y la reproducibilidad del brazo experimental es limitada.
- Perplejidad WikiText-2 de 24,0932: no hay dato del base en esta ficha para cuantificar la degradación relativa.
- Sesgos heredados de Llama 3: no se han evaluado sesgos específicos en este checkpoint.
- Riesgo de alucinación: probable, heredado del base y potencialmente agravado por la compresión.
- Contexto limitado a 8K y idiomas no declarados: no se debe asumir cobertura multilingüe amplia.
- Licencia Llama 3: uso comercial permitido con condiciones; si se superan 700 millones de usuarios activos mensuales se requiere licencia adicional; deben incluirse `LICENSE` y `USE_POLICY.md`, y mostrarse la atribución "Built with Meta Llama 3". No es asesoramiento legal.
- Discrepancia de parámetros: el checkpoint reporta 8.030.261.248 parámetros en safetensors aunque la model card declara una fracción efectiva de 0,5998; el ahorro real de memoria depende del runtime y no está garantizado.
- No usar en producción sin una evaluación propia de seguridad, utilidad y sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_jbb_ka8_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio y ficheros: https://huggingface.co/Jeesup/svd-safety-l3_jbb_ka8_a1p0_free_remove40/tree/main
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
