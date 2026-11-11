# Jeesup/svd-safety-l2_kfacmixsep12_r40

## Resumen

`svd-safety-l2_kfacmixsep12_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD blanqueado con K-FAC agrupado (pooled K-FAC whitened SVD), aplicando una calibración conjunta de utilidad y seguridad en un único estimador K-FAC. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general.

El checkpoint conserva el 60,0 % de los parámetros densos del modelo original (se elimina un 40,00 %), quedando una fracción de parámetros de 0,5998, y se recupera después con la etapa 2 de LoRA de SVD-LLM (U y V secuenciales, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). El resultado es un modelo de 6.738.415.616 parámetros reales en safetensors, con licencia Llama 2 Community License y formato transformers/safetensors.

Su relevancia es metodológica: mide el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard) bajo compresión agresiva. El autor advierte explícitamente que varias ramas del grid están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), derivado de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 (60,0 % del denso original; 40,00 % eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 (7B de chat), sobre el que se aplica compresión SVD. La selección de componentes usa un único SVD blanqueado con K-FAC sobre un conjunto de calibración agrupado (F = A ⊗ G, `run_safety_fisher.py`, lam = 0) y un presupuesto de rango por matriz según SVD-LLM. La calibración combina dos fuentes: `wikitext2:256` (parte de utilidad: WikiText-2 train, 255 ventanas de 2048 tokens con el sampler de SVD-LLM, semilla 42, todas las posiciones) y `jbb_harm_resp_sep:12` (parte de seguridad: 12 objetivos de JailbreakBench con los propios rechazos de Llama-2-7b-chat, una conversación por muestra, 3140 posiciones y 2848 tokens de respuesta, con la pérdida calculada solo sobre el rechazo). La pérdida G se calcula como suma de tokens (NLL sumada / 2047), de modo que cada token de pérdida pesa lo mismo. La cuota efectiva de seguridad es 0,0054 de los tokens de pérdida y 0,0060 de las posiciones.

Tras la compresión al 60,0 % de parámetros, se aplica la recuperación de la etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned: r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla del proceso es 42. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la contribución técnica es la regla de selección de componentes (K-FAC blanqueado con calibración conjunta de utilidad y seguridad) y su evaluación.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresión y la recuperación LoRA.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Capacidad de rechazo ante peticiones dañinas, medida mediante AdvBench y StrongREJECT con juez HarmBench.
- Comportamiento de sobre-rechazo medido con WildGuard sobre peticiones benignas.
- Evaluación zero-shot en 7 tareas (acc_norm cuando se reporta).
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de un grid para estudiar cómo distintas reglas de selección de componentes y presupuestos de rango afectan a la utilidad y la seguridad; se compara contra otras celdas del mismo estudio.
- Evaluación de daño de seguridad por compresión: permite medir el aumento de ASR (AdvBench 0,0712; StrongREJECT 0,1374) respecto al modelo denso y cuantificar la recuperación tras LoRA.
- Estudio de calibración conjunta utilidad-seguridad: el checkpoint materializa una calibración con cuota de seguridad del 0,0054 de tokens de pérdida, útil para analizar la sensibilidad a esa cuota.
- Reproducción de experimentos SVD-LLM: la receta completa (semilla 42, sampler, presupuesto de rango, hiperparámetros LoRA) está documentada y permite replicar la etapa 2.
- Análisis de sobre-rechazo: con un macro de sobre-rechazo de 0,1667 en WildGuard, sirve para estudiar el equilibrio entre rechazo correcto y falsos positivos en modelos comprimidos.
- Benchmark de pipelines de compresión: punto de comparación para validar implementaciones de K-FAC blanqueado y SVD por matriz en transformers.
- No debe usarse como asistente en producción ni como modelo de chat de propósito general.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0712 |
| StrongREJECT ASR (juez HarmBench) | 0,1374 |
| Macro sobre-rechazo (WildGuard) | 0,1667 |
| Perplejidad WikiText-2 | 9,9358 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4862 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas del grid ni frente a modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 6.738.415.616 parámetros, en bf16/fp16 el peso ocupa aproximadamente 13,5 GB (coincide con el tamaño del repo), por lo que se necesita margen adicional para KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de 24 GB o más permite inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) en bf16 con contexto limitado; en cuantización de 8 bits o menor cabría en GPUs de 16 GB, aunque no se documentan cuantizaciones publicadas.
- Opciones de despliegue: transformers (librería declarada); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep12_r40 | 6.738.415.616 (60,0 % del denso) | no disponible | Llama 2 Community License | Checkpoint comprimido de investigación, ASR AdvBench 0,0712, PPL WikiText-2 9,9358 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 (modelo base) | Llama 2 Community License | Modelo de referencia sin comprimir; no se reportan aquí sus métricas de seguridad ni perplejidad |
| Otras celdas del grid del mismo estudio | variable según presupuesto | no disponible | Llama 2 Community License | No se dispone de sus resultados en la información proporcionada |

## Limitaciones y advertencias

- El autor advierte que varias ramas del grid están deliberadamente degradadas en seguridad y que la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint es un sujeto experimental, no un asistente desplegable.
- Riesgo de alucinación: no cuantificado en la model card; aplican los riesgos del modelo base Llama-2-7b-chat, potencialmente amplificados por la compresión.
- Sesgos: no documentados específicamente; heredados del modelo base y del dataset de recuperación (alpaca-cleaned).
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Restricciones de licencia: Llama 2 Community License; `LICENSE.txt` y `USE_POLICY.md` están incluidos en el repositorio y vinculan cualquier uso derivado. Requiere evaluar las cláusulas de uso comercial de dicha licencia antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación externa.
- No se documentan cuantizaciones, por lo que el despliegue eficiente en hardware limitado requeriría trabajo adicional no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep12_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio (`LICENSE.txt`, `USE_POLICY.md`)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
