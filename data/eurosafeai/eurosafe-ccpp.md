# EuroSafeAI/EuroSafe-CCPP

## Resumen

EuroSafe-CC++ es una recreación abierta de la cascada de dos etapas de Constitutional Classifiers++ (CC++; Cunningham et al., 2026, arXiv:2601.04603), construida por EuroSafeAI con los datos y la política de EuroSafeGuard. Se distribuye como baseline reproducible del artículo *EuroSafeGuard: Open Constitutional Classifiers* y sirve como sistema de guardrail (clasificación de seguridad) para filtrar prompts y respuestas de un LLM generativo. No es un modelo generativo: es un pipeline de clasificación de texto que decide si una interacción debe bloquearse.

La arquitectura combina dos etapas. La primera son dos sondas lineales de activación (prompt probe y reply probe) que leen los estados ocultos de Llama-3.1-8B-Instruct en sus 32 bloques (131.072 características por token). La segunda etapa aplica el clasificador de entrada de EuroSafeGuard (Qwen3.5-9B + LoRA + 11 cabezas) sobre el intercambio completo usuario/asistente. Solo el 5,5% del tráfico limpio de WildChat que obtiene mayor puntuación en la etapa 1 escala a la etapa 2, lo que mantiene el coste computacional acotado.

El modelo es relevante porque ofrece, con licencia Apache 2.0, una implementación completa y verificable de una defensa de seguridad de referencia, con umbrales calibrados, pesos de la regla de decisión y código de inferencia en un único fichero. Su objetivo principal es la reproducibilidad de la comparación frente a EuroSafeGuard, no el despliegue en producción (para ello el autor recomienda EuroSafeGuard).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de dos etapas: etapa 1 con dos sondas lineales de activación sobre Llama-3.1-8B-Instruct; etapa 2 con clasificador Qwen3.5-9B + LoRA + 11 cabezas |
| Parametros totales | No disponible (sondas lineales + clasificador de 9B en la segunda etapa) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (prompt probe); 3.072 tokens (reply probe); longitud del clasificador de segunda etapa no disponible |
| Tipos de cuantizacion | No disponible (la inferencia de referencia se ejecuta en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`probe.safetensors`) + JSON de configuración y umbrales; script Python de inferencia |
| Pipeline | text-classification |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct (sondas); EuroSafeAI/EuroSafeGuard `gate/seed{k}` (etapa 2) |
| Memoria GPU de referencia | ~35 GB en bf16 (16 GB Llama-3.1-8B + 19 GB Qwen3.5-9B) |

## Arquitectura y entrenamiento

La etapa 1 consta de dos sondas lineales que operan sobre los estados ocultos de Llama-3.1-8B-Instruct en los 32 bloques del transformer, con 131.072 características por token. La *prompt probe* puntúa el prompt formateado como chat; la *reply probe* puntúa los tokens de la respuesta leyéndolos con el prompt como contexto. Ambas se entrenaron con la pérdida de CC++ (pérdida softmax ponderada por token sobre una ventana deslizante de 16 tokens). En inferencia, los logits por token se suavizan con una media móvil exponencial (alpha = 2/17) y la puntuación de cada sonda es el máximo de esa media sobre los tokens evaluados. La puntuación de etapa 1 es el mayor de los z-scores de ambas sondas. La prompt probe se entrenó sobre 535.552 prompts con etiquetas suaves (puntuaciones out-of-fold del clasificador de entrada, 3 folds); la reply probe se entrenó con etiquetas duras sobre 279.527 pares prompt-respuesta.

La etapa 2 aplica el clasificador de entrada de EuroSafeGuard (Qwen3.5-9B + LoRA + 11 cabezas, checkpoints `gate/seed{k}`) sobre el intercambio `User: <prompt>\n\nAssistant: <reply>`, siguiendo el diseño de CC++ en el que el clasificador de entrada actúa como clasificador de intercambio. Un intercambio escalado se bloquea si `0.55 · stage-1 score + 0.45 · z(classifier logit) > stage2_thr`. Los z-scores se calculan con la media y desviación típica de un pool de calibración de 2.554 prompts limpios de WildChat con respuestas de Llama-3-8B-Instruct más 2.568 prompts de calibración de XSTest y OR-Bench. El umbral de etapa 2 bloquea el 0,20% de WildChat limpio. Los intercambios no escalados nunca se bloquean. Los pesos de la regla de decisión corresponden al sistema de producción de CC++ (Sec. 6 del paper).

## Capacidades

- Detección de jailbreaks y prompts maliciosos mediante la prompt probe (etapa 1).
- Detección de respuestas dañinas mediante la reply probe, que evalúa la respuesta con el prompt como contexto.
- Clasificación de intercambios completos (prompt + respuesta) mediante el clasificador de segunda etapa.
- Decisión de bloqueo end-to-end con la función `check(prompt, reply)`, que devuelve `True` cuando debe retenerse la respuesta.
- Escalado selectivo: solo el 5,5% del tráfico limpio con mayor puntuación pasa a la etapa 2, lo que reduce el coste.
- Evaluación aislada de la prompt probe con `input_flag(prompt)`, calibrada a un presupuesto del 5% de WildChat limpio.
- Aplicación de la regla de decisión sobre puntuaciones precalculadas mediante `ccpp_block(prompt_probe, reply_probe, cls_prob, cfg)`.
- Exposición de puntuaciones crudas con `scores(...)` (prompt probe, reply probe, probabilidad del clasificador; NaN si no hay escalado).
- Soporte de múltiples semillas de segunda etapa (`seed=0` y sucesivas), correspondientes a los cinco clasificadores `gate/seed{k}`.

## Casos de uso

- Filtrado de entrada en un chatbot desplegado: la prompt probe evalúa cada mensaje del usuario antes de llegar al LLM generativo y escala solo los casos sospechosos, con lo que se bloquean intentos de jailbreak sin penalizar el tráfico legítimo (el umbral de etapa 2 bloquea el 0,20% de WildChat limpio).
- Moderación de salida en asistentes con herramientas: la reply probe puntúa la respuesta generada con el prompt como contexto, lo que permite retener respuestas dañinas antes de enviarlas al usuario, incluso cuando el prompt era aparentemente inocuo.
- Reproducción de resultados de investigación en seguridad: el repositorio incluye umbrales, z-estadísticos y pesos de decisión, de modo que un equipo puede recalcular las tablas del paper sobre sus propios conjuntos de ataques (PyRIT, BELLS-O, BET, GB×JF, PAIR, TAP).
- Baseline para comparar guardrails propios: al ser una recreación abierta de CC++, sirve como referencia fija frente a la que medir un clasificador de seguridad alternativo con la misma política y los mismos datos de calibración.
- Despliegue en pipelines de moderación con presupuesto computacional ajustado: la cascada evita ejecutar el clasificador de 9B en el 94,5% del tráfico limpio, lo que reduce la VRAM y la latencia medias frente a un clasificador único de gran tamaño.
- Auditoría de sistemas LLM en producción: el par (prompt, reply) puntuado permite registrar qué intercambios se escalaron y por qué, con z-scores separados por sonda, lo que facilita el análisis forense de incidentes.
- Investigación sobre ataques de optimización (PAIR, TAP): la métrica de comportamientos comprometidos sobre 84 y 64 comportamientos respectivamente permite evaluar la robustez de la defensa frente a ataques adaptativos.

## Benchmarks y rendimiento

Resultados de la Tabla 2 del paper (jailbreaks held-out; presupuesto del 5% de WildChat limpio; la etapa de entrada es la prompt probe sola, `input_flag`). Recall en %:

| Guard | PyRIT | BELLS-O jb | BET | GB×JF | PAIR broken, Input ↓ | PAIR, Full | TAP broken, Input ↓ | TAP, Full |
|---|---|---|---|---|---|---|---|---|
| EuroSafe-CC++ (probe) | 99,9 | 93,3 | 94,9 | 79,8 | 17,9 | – | 25,0 | – |
| EuroSafeGuard (9B + probe) | 100,0 | 95,9 | 97,0 | 79,3 | 20,7 | 21,7 | 19,4 | 15,0 |

PAIR y TAP indican el % de 84 y 64 comportamientos comprometidos.

Tabla end-to-end (`tab:pipeline`; Llama-3-8B-Instruct, 1.974 ataques de Jailbreak Foundry sobre comportamientos held-out de GuidedBench; fallo benigno = bloqueado, rechazado o comprometido; `check`):

| Defense | ASR rubric ≥ 0,5 | ASR SR ≥ 0,5 | XSTest | OR-80k | OR-hard |
|---|---|---|---|---|---|
| Undefended Llama-3-8B | 7,95 | 19,71 | 2,6 | 6,8 | 68,2 |
| EuroSafe-CC++ | 4,57 | 6,57 | 3,4 | 7,9 | 71,2 |
| EuroSafe-CC++ + our exchange classifier | 4,00 | 5,98 | 3,4 | 7,7 | 71,7 |
| EuroSafeGuard (Full) | 3,88 | 5,40 | 2,6 | 7,7 | 71,4 |

La fila de EuroSafe-CC++ es la media sobre los cinco clasificadores de segunda etapa `gate/seed{k}`.

## Requisitos de hardware

- VRAM estimada para inferencia: ~35 GB en bf16 (16 GB para Llama-3.1-8B-Instruct y 19 GB para el clasificador Qwen3.5-9B), según la model card.
- GPU recomendadas: A100 40/80 GB, H100, o cualquier GPU con al menos 35 GB de memoria en bf16. El script de referencia acepta `devices=("cuda:0", "cuda:0")`, lo que permite repartir sonda y clasificador entre dispositivos.
- No cabe en GPU de consumo de gama alta con 24 GB (RTX 4090, RTX 3090) en bf16 con el clasificador de segunda etapa completo; no se han publicado configuraciones cuantizadas para reducir la huella.
- Opciones de despliegue: script de inferencia `eurosafe_ccpp.py` (descargable con `huggingface_hub.hf_hub_download` o mediante el paquete `eurosafeguard`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño de cascada reduce el coste medio al ejecutar el clasificador de 9B solo sobre el 5,5% del tráfico limpio escalado.
- Requisito previo: Llama-3.1-8B-Instruct está gated, por lo que es necesario aceptar su licencia antes de la descarga.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|---|
| EuroSafe-CC++ | Cascada sondas + clasificador | Sondas lineales + 9B (etapa 2) | 2.048 / 3.072 tokens | Apache 2.0 | Hugging Face (EuroSafeAI) | ASR rubric 4,57; XSTest 3,4; OR-hard 71,2 |
| EuroSafeGuard (Full) | Clasificador Qwen3.5-9B + LoRA + 11 cabezas + sonda | 9B | No disponible | No disponible en la información | Hugging Face (EuroSafeAI) | ASR rubric 3,88; XSTest 2,6; OR-hard 71,4 |
| Undefended Llama-3-8B-Instruct | LLM generativo sin defensa | 8B | 128K (modelo base) | Llama 3.1 Community License | Hugging Face (meta-llama) | ASR rubric 7,95; ASR SR 19,71 |
| Constitutional Classifiers++ (original) | Cascada de referencia | No disponible | No disponible | No disponible | No disponible (paper) | Referencia de diseño de EuroSafe-CC++ |

EuroSafe-CC++ se posiciona como baseline abierto de CC++ y como alternativa de menor coste que EuroSafeGuard (Full) a cambio de una ligera pérdida de recall en varios conjuntos de jailbreaks y de un peor rendimiento en XSTest (3,4 frente a 2,6).

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Es un baseline de investigación, no un guardrail recomendado para producción: el propio autor remite a EuroSafeGuard para despliegue.
- El rendimiento en OR-hard es deficiente: 71,2 frente a 68,2 del Llama-3-8B sin defensa, es decir, la defensa no mejora el fallo benigno en ese conjunto.
- El recall frente a ataques adaptativos es limitado: la prompt probe sola compromete el 17,9% de PAIR y el 25,0% de TAP; la cascada completa reduce estas cifras pero no las elimina.
- Los umbrales están calibrados sobre WildChat limpio, XSTest y OR-Bench; la distribución de tráfico en otros dominios puede alterar la tasa de falsos positivos.
- La segunda etapa depende de descargar `gate/seed{k}` desde EuroSafeAI/EuroSafeGuard; la disponibilidad futura de esos checkpoints condiciona la reproducibilidad.
- Requiere aceptar la licencia gated de Llama-3.1-8B-Instruct, lo que añade una restricción de uso adicional a la licencia Apache 2.0 del repositorio.
- La huella de ~35 GB en bf16 impide el despliegue en GPUs de consumo de 24 GB sin cuantización, y no se documentan recetas de cuantización.
- No se han publicado datos de latencia ni throughput, lo que dificulta dimensionar un despliegue en producción.
- Riesgo de alucinación no aplica directamente (es un clasificador), pero sí el riesgo de clasificación errónea: falsos negativos ante ataques novedosos y falsos positivos sobre tráfico legítimo atípico.

## Enlaces

- Hugging Face: https://huggingface.co/EuroSafeAI/EuroSafe-CCPP
- EuroSafeGuard (guardrail recomendado y segunda etapa): https://huggingface.co/EuroSafeAI/EuroSafeGuard
- Checkpoints de segunda etapa: https://huggingface.co/EuroSafeAI/EuroSafeGuard/tree/main/gate
- Paper de CC++: https://arxiv.org/abs/2601.04603
- Paper de EuroSafeGuard: arXiv TBD (no disponible)
- Código: https://github.com/EuroSafeAI/EuroSafeGuard
- Página del proyecto: https://guard.safe.eu
