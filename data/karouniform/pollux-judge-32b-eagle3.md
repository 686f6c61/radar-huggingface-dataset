# KaroUniform/pollux-judge-32b-EAGLE3

## Resumen

pollux-judge-32b-EAGLE3 es una cabeza de borrador (draft head) basada en EAGLE-3 para el modelo ai-forever/pollux-judge-32b, un LLM ruso de 32B especializado en la tarea de LLM-as-a-judge dentro del proyecto POLLUX. No es un modelo autónomo: se carga junto al modelo objetivo en SGLang para habilitar decodificación especulativa, de modo que la cabeza propone tokens y el objetivo los verifica. El resultado son salidas equivalentes a las del objetivo (con diferencias numéricas mínimas) pero con una velocidad de decodificación notablemente superior.

El modelo lo publica el usuario KaroUniform y está pensado para entornos de producción que sirven evaluaciones automáticas con pollux-judge-32b, tanto en BF16 como en su variante FP8 (KaroUniform/pollux-judge-32b-FP8). La ganancia reportada es de ×3.2 en decodificación de un solo flujo sobre H200 (de 56 a 181 tok/s) y una reducción de la latencia p50 de extremo a extremo de 5.3 s a 2.2 s a 0.88 req/s.

La cabeza tiene 0.77B parámetros (1.5 GB en BF16), una única capa decodificadora, tamaño oculto 5120 y un vocabulario de borrador de 32.000 tokens mapeado al vocabulario del objetivo. Se entrenó con SpecForge contra el objetivo en BF16, con pérdida LK en dos etapas, sobre prompts de evaluación en ruso y respuestas generadas por el propio modelo juez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (LlamaForCausalLMEagle3), una capa decodificadora, hidden size 5120, capas auxiliares del objetivo 1/31/60 |
| Parámetros totales | 766.975.345 (0,77B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue de SGLang; entrenamiento con longitud máxima de 16.384 tokens |
| Tipos de cuantización | BF16 (pesos publicados); compatible con objetivo FP8 usando `--speculative-draft-model-quantization unquant` |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cabeza implementa EAGLE-3 con una sola capa decodificadora (`LlamaForCausalLMEagle3`), tamaño oculto 5120 y anchos de atención y MLP iguales a los del objetivo. Incluye una capa `fc` que proyecta 3 × 5120 a 5120, tomando las activaciones de las capas auxiliares 1, 31 y 60 del modelo objetivo, y una LM head sobre un vocabulario de borrador de 32.000 tokens que se mapea a los ids del tokenizador del objetivo mediante `d2t`. Los embeddings se toman del objetivo en tiempo de carga. Los pesos están en BF16.

El entrenamiento se realizó con SpecForge en modo online contra el objetivo en BF16, usando la pérdida LK (`lk_loss_type: lambda`) en ambas etapas. La etapa 1 usó unos 100.000 prompts de datasets con licencia abierta (deepvk/cultura_ru_edu, t-tech/T-Wix, RefalMachine/GrandMaster-PRO-MAX-Qwen3-synthetic, AtesiT/ru-llm-judge-dataset, Vikhrmodels/habr_qa_sbs, OpenAssistant/oasst2, nvidia/HelpSteer3 y CohereLabs/aya_dataset) con respuestas generadas por pollux-judge-32b, durante 5 épocas con lr 1e-4 (coseno), longitud de test-time-training 7 y longitud máxima de 16.384 tokens. La etapa 2 añadió 2 épocas a lr 3e-5 sobre 29.000 prompts sintéticos de evaluación (generados con DeepSeek-V4.1-Flash y Qwen3.6-35B-A3B) más 15.000 prompts de la etapa 1, con respuestas producidas por la variante FP8 del objetivo. Los datos de evaluación de POLLUX no se usaron en entrenamiento.

## Capacidades

- Decodificación especulativa EAGLE-3 como cabeza de borrador para pollux-judge-32b y su variante FP8.
- Propuesta de tokens verificados por el modelo objetivo, con longitud de aceptación de 3,7 a 4,0 tokens por paso de verificación.
- Aceleración de la generación en tareas de LLM-as-a-judge con prompts en formato POLLUX (2,3–2,8K tokens de entrada).
- Compatibilidad con SGLang y su pipeline de decodificación especulativa (`--speculative-algorithm EAGLE3`).
- Preservación de la semántica del objetivo: solo cambia cuántos tokens se aceptan por paso, no la distribución objetivo (salvo diferencias numéricas de verificación).
- Soporte de muestreo greedy y de configuraciones de sampling del objetivo (temperatura, top-k, top-p) sujeto a la versión de SGLang.
- No soporta tool calling, agentes, visión ni audio: es una cabeza de borrador, no un modelo de propósito general.

## Casos de uso

- Servicio de evaluación automática de respuestas en ruso: desplegar pollux-judge-32b con esta cabeza en SGLang reduce la latencia p50 de 5,3 s a 2,2 s a 0,88 req/s, lo que permite mantener el mismo SLA con menos réplicas.
- Puntuación de pares (SBS) en pipelines de anotación: la cabeza acelera la generación de veredictos sobre prompts de 2,3–2,8K tokens, el régimen típico de los jueces POLLUX.
- Control de calidad de datasets sintéticos: usar el juez acelerado para filtrar respuestas generadas por modelos como Qwen3.6 o DeepSeek-V4.1 antes de incorporarlas a un corpus de entrenamiento.
- Evaluación de modelos en CI/CD: la reducción de latencia p99 de 13,1 s a 5,4 s a 0,88 req/s hace viable ejecutar suites de evaluación en cada merge sin bloquear el pipeline.
- Despliegue económico en FP8: con el objetivo FP8 y esta cabeza, la latencia p50 baja de 6,8 s a 2,6 s a 2,32 req/s, lo que permite servir el juez en GPUs con menos memoria.
- Investigación en decodificación especulativa: sirve como referencia reproducible de una cabeza EAGLE-3 entrenada con pérdida LK sobre un objetivo de 32B en ruso, con métricas de aceptación y acuerdo de veredictos publicadas.

## Benchmarks y rendimiento

Rendimiento de decodificación especulativa sobre H200 con SGLang y objetivo BF16, prompts POLLUX de 2,3–2,8K tokens, greedy, llegadas Poisson en bucle abierto, chain drafting 5/1/6, `--max-running-requests 128 --chunked-prefill-size 8192`:

| Métrica | Sin cabeza | Con cabeza |
|---|---|---|
| Decodificación, un flujo | 56 tok/s | 181 tok/s (×3,2) |
| Latencia p50 / p99 a 0,88 req/s | 5,3 / 13,1 s | 2,2 / 5,4 s |
| Latencia p50 / p99 a 1,76 req/s | 7,9 / 22,3 s | 3,1 / 10,1 s |
| Latencia p50 / p99 a 2,35 req/s | 14,7 / 45,8 s | 5,5 / 32,2 s |
| Techo de throughput | 2,87 req/s | 3,18 req/s |
| Longitud de aceptación | – | 3,7–4,0 tokens por paso |

Calidad sobre 1.500 ítems POLLUX (greedy, `repetition_penalty` 1.05, objetivo FP8, SGLang con el parche de penalización):

| Configuración | Puntuación cambiada vs. no especulativo | MAE vs. puntuaciones expertas |
|---|---|---|
| No especulativo, dos ejecuciones | 0,40 % | 0,527 / 0,531 |
| Con esta cabeza, dos ejecuciones | 1,07 % / 1,07 % | 0,524 / 0,523 |

Sin el parche de SGLang, la diferencia de veredictos asciende al 8 %; con el parche, al 1,1 %. En el objetivo BF16 no se midió el acuerdo de veredictos, pero la aceptación es equivalente (2,95–2,99 tokens por paso contados sobre los tres primeros tokens de borrador, en tres conjuntos de prompts reservados).

## Requisitos de hardware

- La cabeza ocupa 1,5 GB en BF16; debe residir junto al objetivo de 32B, que en BF16 requiere aproximadamente 64 GB de VRAM y en FP8 unos 32 GB.
- GPU recomendadas: H200 para las cifras publicadas; A100 80 GB y H100 son adecuadas para el objetivo BF16; el objetivo FP8 permite GPUs de 40–48 GB.
- No cabe en GPU de consumo para el objetivo completo; la cabeza por sí sola sí, pero no es un modelo autónomo.
- Despliegue: SGLang con `--speculative-algorithm EAGLE3`, `--speculative-num-steps 5 --speculative-eagle-topk 1 --speculative-num-draft-tokens 6 --context-length 32768`. Con objetivo FP8 añadir `--speculative-draft-model-quantization unquant`.
- Throughput máximo medido: 3,18 req/s frente a 2,87 req/s sin la cabeza, con 128 peticiones concurrentes y chunked prefill de 8192.
- Para muestreo con decodificación especulativa se requiere una versión de SGLang que incluya el PR sgl-project/sglang#41916.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaroUniform/pollux-judge-32b-EAGLE3 | Cabeza EAGLE-3 para pollux-judge-32b | 0,77B | 32.768 (despliegue) | MIT | Hugging Face |
| ai-forever/pollux-judge-32b | Modelo juez completo | 32B | no disponible en la información | no disponible en la información | Hugging Face |
| KaroUniform/pollux-judge-32b-FP8 | Modelo juez completo en FP8 | 32B | no disponible en la información | no disponible en la información | Hugging Face |

No se dispone de información sobre otras cabezas de borrador EAGLE-3 para modelos jueces en ruso con las que comparar directamente.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo pollux-judge-32b o su variante FP8 no produce salidas útiles.
- La penalización de repetición del objetivo (`repetition_penalty: 1.05`) se aplica de forma inexacta en la verificación EAGLE de SGLang actual, lo que eleva la divergencia de veredictos al 8 %; requiere el PR sgl-project/sglang#49404 para bajar al 1,1 %.
- Con el objetivo FP8 es obligatorio `--speculative-draft-model-quantization unquant`; de lo contrario SGLang puede aplicar la configuración de cuantización del objetivo a la cabeza.
- El muestreo con decodificación especulativa depende del PR sgl-project/sglang#41916.
- Solo soporta ruso; no se ha validado en otros idiomas.
- Riesgo de alucinación y sesgos heredado del modelo objetivo, no evaluado de forma independiente en esta ficha.
- Las métricas de calidad se midieron con el objetivo FP8; en BF16 solo se verificó la longitud de aceptación, no el acuerdo de veredictos.
- Los niveles de ruido entre ejecuciones no son comparables entre configuraciones con y sin radix cache.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero sujeta a la licencia del modelo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/KaroUniform/pollux-judge-32b-EAGLE3
- Modelo objetivo: https://huggingface.co/ai-forever/pollux-judge-32b
- Variante FP8 del objetivo: https://huggingface.co/KaroUniform/pollux-judge-32b-FP8
- Proyecto POLLUX: https://github.com/ai-forever/POLLUX
- Paper EAGLE-3: https://arxiv.org/abs/2503.01840
- Paper de pérdida LK: https://arxiv.org/abs/2602.23881
- Paper adicional citado en los tags: https://arxiv.org/abs/2505.24616
- SpecForge: https://github.com/sgl-project/SpecForge
- Issue de SGLang sobre penalización de repetición: https://github.com/sgl-project/sglang/issues/49403
- PR de SGLang con el parche: https://github.com/sgl-project/sglang/pull/49404
- PR de SGLang para muestreo especulativo: https://github.com/sgl-project/sglang/pull/41916
