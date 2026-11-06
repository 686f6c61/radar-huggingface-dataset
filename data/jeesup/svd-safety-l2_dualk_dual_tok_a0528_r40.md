# Jeesup/svd-safety-l2_dualk_dual_tok_a0528_r40

## Resumen

`svd-safety-l2_dualk_dual_tok_a0528_r40` es un artefacto de investigación publicado por el usuario Jeesup en Hugging Face. No es un modelo de chat de propósito general, sino una celda concreta dentro de un estudio sistemático sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El punto de partida es `meta-llama/Llama-2-7b-chat-hf`, al que se le aplica una descomposición SVD blanqueada por K-FAC en dos dominios (utilidad y seguridad) que elimina el 40,00 % de los parámetros, dejando el checkpoint en el 59,98 % de la densidad original.

La arquitectura subyacente es la de Llama 2: un transformer decoder-only denso con 6.738.415.616 parámetros reales (frente a los 6.738.415.616 del modelo base sin comprimir, según los safetensors del repo, que reflejan el presupuesto de rango reducido). El interés técnico está en el método: se construye un funcional conjunto `F_dual = (1-a)·G_u ⊗ A_u + a·G_s ⊗ A_s` con curvaturas K-FAC por dominio, se resuelve con ALS de base conjunta partiendo de la solución mezcla y se fija un peso de seguridad `a = 0,5280`. Tras la compresión se aplica la etapa 2 de SVD-LLM (LoRA secuencial U luego V, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Es relevante ahora porque cuantifica empíricamente el compromiso seguridad/utilidad bajo compresión: con un ASR de 0,0058 en AdvBench y 0,0064 en StrongREJECT (juez HarmBench), pero un sobre-rechazo macro de 0,5019 medido con WildGuard y una perplejidad de 10,0680 en WikiText-2. Es decir, el checkpoint es seguro frente a ataques pero rechaza en exceso, y esa tensión es precisamente el objeto de estudio. El autor advierte explícitamente que varias celdas de la grid están deliberadamente degradadas en seguridad y que ninguna debe desplegarse sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2), comprimido por SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama-2-7b-chat, 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b-chat, un transformer decoder-only denso con atención causal estándar y RoPE. Sobre ella se aplica una compresión por SVD con presupuesto de rango de SVD-LLM: para cada matriz se calcula un rango objetivo correspondiente al mismo ratio de eliminación (40,00 % de parámetros eliminados), y la solución de bajo rango se obtiene resolviendo un problema conjunto en dos dominios. El funcional es `F_dual = (1-a)·G_u ⊗ A_u + a·G_s ⊗ A_s`, donde `G` y `A` son las matrices de curvatura K-FAC por dominio (utilidad y seguridad), con normalización `tok` (A dividida por posiciones, G dividida por tokens de pérdida con CE sumada). El solver `dual` parte de la solución mezcla y refina con ALS de base conjunta hasta 300 barridos, rtol 1e-07 y ridge 1e-06.

Los datos de calibración son dos conjuntos: para utilidad, `wikitext-2-raw-v1` train con el sampler de SVD-LLM, 255 ventanas de 2048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token; para seguridad, `results/dual_kfac_wj/wj_safe_l2.jsonl` con 512 muestras y pérdida sobre los tokens de respuesta. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con datos alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta RLHF ni DPO adicionales más allá del ajuste original de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional, heredada del ajuste de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 2).
- Comprensión y generación de código y matemáticas en la medida en que lo hace el modelo base; no se documentan evaluaciones específicas tras la compresión.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no lo soporta de forma nativa.
- Agentes y razonamiento multi-paso: no documentado; no es un objetivo del artefacto.
- Capacidades multilingües: no documentadas; el calibrador de utilidad es wikitext-2 (inglés) y el de recuperación es alpaca-cleaned (inglés), por lo que el comportamiento fuera del inglés es incierto.
- Modo thinking, visión o audio: no soportados.
- Capacidad especial: es un sujeto experimental para medir el efecto de la compresión SVD sobre la seguridad y la utilidad, no un asistente desplegable.

## Casos de uso

- Estudio de compresión y seguridad: usar el checkpoint como una celda de la grid para medir cómo varía el ASR (AdvBench, StrongREJECT) y el sobre-rechazo (WildGuard) al cambiar el peso de seguridad `a` y el presupuesto de rango; es adecuado porque el autor publica las métricas exactas de esta celda para comparación.
- Investigación en interpretabilidad de componentes: analizar qué direcciones de bajo rango concentran la curvatura de seguridad frente a la de utilidad, comparando las bases U y V recuperadas con las del modelo denso.
- Reproducción de pipelines SVD-LLM: servir como referencia reproducible (semilla 42, calibradores documentados) para validar implementaciones de SVD blanqueada por K-FAC con doble dominio.
- Evaluación de mecanismos de recuperación: contrastar la etapa 2 de LoRA (r=8, alpha=16, alpaca-cleaned) frente a otras estrategias de recuperación midiendo perplejidad en WikiText-2 (referencia 10,0680) y ASR.
- Benchmarking de jueces de seguridad: usar sus salidas como entrada controlada para validar clasificadores tipo HarmBench o WildGuard, ya que el checkpoint produce respuestas con tasas de rechazo y ataque conocidas.
- Docencia y divulgación técnica: ilustrar en un curso o artículo el compromiso entre seguridad y utilidad en modelos comprimidos con cifras concretas, sin necesidad de entrenar desde cero.
- No se recomienda su uso como asistente en producción, atención al cliente, generación de código en CI/CD ni ningún escenario de cara al usuario final.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0058 |
| StrongREJECT ASR (juez HarmBench) | 0,0064 |
| Sobre-rechazo macro (WildGuard) | 0,5019 |
| Perplejidad WikiText-2 | 10,0680 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica, 16 GB es el mínimo cómodo y 24 GB recomendable para contextos largos.
- En cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits: alrededor de 3,5-4 GB. No obstante, el autor no publica versiones GGUF ni cuantizaciones oficiales, por lo que habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para serving; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090 (24 GB) similar; RTX 4080/4070 Ti Super (16 GB) justas en bf16 y cómodas en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documentan oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR / seguridad | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| svd-safety-l2_dualk_dual_tok_a0528_r40 | 6,74 B (59,98 % denso) | No disponible | AdvBench 0,0058; StrongREJECT 0,0064; sobre-rechazo 0,5019 | 10,0680 | Llama 2 Community |
| meta-llama/Llama-2-7b-chat-hf (base) | 6,74 B | 4096 | No disponible en esta ficha | No disponible en esta ficha | Llama 2 Community |
| Otras celdas de la grid del mismo autor | Variable (presupuestos de rango distintos) | No disponible | Variable; algunas deliberadamente degradadas | No disponible | Llama 2 Community |
| SVD-LLM Llama-2-7b-chat (referencia metodológica) | ~6,7 B con recorte similar | No disponible | No disponible | No disponible | Llama 2 Community |

La comparación cuantitativa con el modelo base y con las demás celdas de la grid no está publicada en la información disponible; solo se ofrece la métrica de esta celda concreta.

## Limitaciones y advertencias

- El propio autor advierte que el checkpoint es un sujeto experimental, no un asistente desplegable; varias celdas de la grid están deliberadamente degradadas en seguridad.
- El sobre-rechazo macro de 0,5019 (WildGuard) indica que el modelo rechaza en exceso peticiones legítimas, lo que lo hace inadecuado para uso conversacional real.
- La compresión por sí sola eleva la tasa de éxito de ataque según el autor; esta celda la mitiga con el peso de seguridad, pero el equilibrio es frágil y depende del calibrador de seguridad (`wj_safe_l2.jsonl`, 512 muestras).
- Riesgo de alucinación: no evaluado tras la compresión; la perplejidad de 10,0680 en WikiText-2 es superior a la del modelo denso típica, lo que sugiere cierta degradación del modelado del lenguaje.
- Idiomas: no documentados; los calibradores son en inglés, por lo que el rendimiento en castellano u otras lenguas es incierto.
- Contexto: no documentado en la model card; se hereda presumiblemente el de Llama-2-7b-chat (4096 tokens), pero no está confirmado.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repo; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de usuarios mensuales activos y las restricciones de uso aceptable.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria independiente.
- No se publican cuantizaciones oficiales ni resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K).

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_tok_a0528_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (referencia metodológica citada en la model card): no se proporciona enlace directo en la información disponible
- HarmBench (juez de seguridad): no se proporciona enlace directo en la información disponible
- WildGuard (medición de sobre-rechazo): no se proporciona enlace directo en la información disponible
