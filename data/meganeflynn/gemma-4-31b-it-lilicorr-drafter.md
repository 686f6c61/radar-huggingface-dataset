# MeganEFlynn/gemma-4-31b-it-lilicorr-drafter

## Resumen

`MeganEFlynn/gemma-4-31b-it-lilicorr-drafter` es un modelo borrador (*draft model*) para decodificación especulativa, entrenado desde cero para acompañar al modelo verificador `google/gemma-4-31B-it`. No es un modelo de lenguaje autónomo: su función es proponer tokens candidatos que el verificador de 31B valida en paralelo, acelerando la generación sin alterar la distribución de salida del modelo grande. Lo publica MeganEFlynn bajo la librería `speculators` y emplea la técnica LiLiCorr, una variante de *drafting* que combina un decodificador ligero con una cabeza de corrección que consulta estados ocultos intermedios del verificador.

El borrador tiene 2.579.942.026 parámetros en bf16 (5,16 GB en `model.safetensors`) y se apoya en un decodificador Qwen3 de 5 capas con atención de ventana deslizante de 2048 tokens y vocabulario de 262.144 entradas. La cabeza LiLiCorr consume los estados ocultos de las capas auxiliares `[1, 17, 29, 47, 59]` del verificador y aplica una corrección sobre un conjunto de 8 candidatos por posición. La propuesta es greedy, con bloque de 8 y 7 tokens especulativos por paso.

Es relevante porque la decodificación especulativa es hoy la palanca principal para reducir la latencia en inferencia de modelos grandes sin degradar la calidad. Este checkpoint corresponde a la época 0 de un entrenamiento de 2 épocas y fue subido cuando la segunda época seguía en curso; el autor advierte que puede publicarse un checkpoint de época 1 en este u otro repositorio. El modelo está en fase temprana: cero descargas, cero likes y soporte de inferencia aún dependiente de ramas de desarrollo no fusionadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador Qwen3 de 5 capas + cabeza LiLiCorr (speculator) |
| Parámetros totales | 2.579.942.026 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 tokens en el decodificador; ventanas de entrenamiento de 4096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |
| Hidden size del decodificador | 5376 |
| Cabezas / cabezas KV | 32 / 16 |
| Head dim | 256 |
| Vocabulario | 262144 |
| Capas auxiliares del verificador | `[1, 17, 29, 47, 59]` (+ slice final de entrada del lm-head) |
| Cabeza LiLiCorr | top-k 8 candidatos, anchura 1024, 2 capas, 8 cabezas, escala de logit fija 8.0, eps vectorial 1e-4 |
| Bloque / tokens especulativos | block size 8, 7 tokens especulativos por paso, propuesta greedy |
| Modelo base (verificador) | `google/gemma-4-31B-it` @ `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Librería | `speculators` 0.10.0a69 (torch 2.14.0, transformers 5.19.0) |
| Tamaño del repo | 5,2 GB |

## Arquitectura y entrenamiento

El modelo es un *speculator* de tipo LiLiCorr. El decodificador es un transformer Qwen3 de 5 capas con hidden 5376, 32 cabezas de atención y 16 cabezas KV (GQA), head_dim 256 y atención de ventana deslizante de 2048. Sobre él se monta una cabeza LiLiCorr que toma como entrada los estados ocultos de las capas auxiliares `[1, 17, 29, 47, 59]` del verificador Gemma 4 31B más un slice de la entrada del lm-head final, y produce una corrección sobre los 8 candidatos mejor puntuados por el decodificador. La cabeza tiene anchura 1024, 2 capas y 8 cabezas, con escala de logit fija de 8.0 y eps vectorial de 1e-4. El bloque especulativo es de 8 tokens con 7 propuestas por paso en modo greedy.

El entrenamiento usó `nm-research/gemma-4-31b-it-responses-open-perfectblend` en la revisión `5e0fc323` (Open PerfectBlend regenerado): 1.774.091 filas de entrenamiento, 2,14 mil millones de tokens supervisados conservados y 3,10 mil millones de tokens totales. El empaquetado fue en ventanas de 4096 tokens (214.114 ventanas por época) con `train_data_ratio` 0.99025. El objetivo es divergencia KL fusionada con pesos LiLiCorr `w_ce=0.05`, `w_cal=0.45`, `w_pen=0.0`, tomando `input_ids` como fuente del objetivo. Se optimizó con AdamW fusionado, lr 6e-4, weight decay 0, schedule coseno con 1000 pasos de calentamiento y 26.761 actualizaciones totales, en 4 rangos FSDP (shard) sobre GPUs 4-7 con gradient checkpointing, acumulación 16 y semilla 42. El checkpoint se capturó en `global_step=13383` (final de la época 0); la época 1 continuó desde ahí en el run original.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Gemma 4 31B: no genera texto de forma autónoma, sino propuestas que el verificador acepta o rechaza.
- Propuesta greedy de 7 tokens por paso con bloque de 8, pensada para integrarse en el bucle de decodificación especulativa de vLLM.
- Aprovechamiento de estados ocultos intermedios del verificador (capas 1, 17, 29, 47 y 59) mediante la cabeza LiLiCorr, lo que permite calibrar las propuestas con información del modelo grande.
- Soporte de *tool calling* o agentes: no disponible (el modelo no expone interfaz conversacional propia).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Modo *thinking*, visión o audio: no disponible.
- Integración con la librería `speculators` y con builds de vLLM que entiendan modelos borrador, con método de propuesta `draft_model` y block size 8.

## Casos de uso

- Aceleración de inferencia de Gemma 4 31B en producción: se carga como modelo borrador junto al verificador en vLLM con método `draft_model` y block size 8, de modo que cada paso valida 7 propuestas en paralelo y reduce el número de pasos autorregresivos del modelo grande.
- Servicio de chat de baja latencia: al reducir el coste por token generado del verificador de 31B, permite sostener conversaciones multi-turno con ventanas de contexto amplias del modelo grande sin que la latencia se dispare.
- Generación de código asistida en IDE o CI/CD: el borrador acelera la salida del verificador en tareas de autocompletado y generación de parches, donde la distribución de tokens es predecible y la tasa de aceptación del borrador suele ser alta.
- *Batch* offline de resúmenes y extracción de información: al disminuir el tiempo por petición del verificador, mejora el throughput de pipelines que procesan grandes volúmenes de documentos con Gemma 4 31B.
- Evaluación de técnicas de decodificación especulativa: sirve como referencia reproducible para investigar tasas de aceptación por posición y calibrar cabezas de corrección tipo LiLiCorr sobre verificadores grandes.
- Despliegue con restricciones de memoria ajustadas: el borrador ocupa 5,16 GB en bf16, un coste adicional pequeño frente al verificador de 31B, lo que hace viable la aceleración en nodos con una sola GPU de 80 GB o en configuraciones con tensores paralelos.

## Benchmarks y rendimiento

Validación en la época 0 sobre 13.925 grupos de prompts reservados:

| Métrica | Valor |
|---|---|
| full_acc | 0,6048 |
| position_1 acc | 0,8613 |
| position_2 acc | 0,7433 |
| position_3 acc | 0,6528 |
| position_4 acc | 0,5800 |
| position_5 acc | 0,5179 |
| position_6 acc | 0,4636 |
| position_7 acc | 0,4133 |
| eal | 4,5771 |
| lilicorr_eal | 4,7257 |
| lilicorr_top1_eal | 4,5129 |
| lilicorr_oracle_eal | 6,2136 |
| loss | 1,4685 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros borradores.

## Requisitos de hardware

- VRAM estimada para el borrador: 5,16 GB en bf16 para los pesos; hay que sumar la memoria de activaciones y del bucle especulativo, que depende del tamaño de lote y del block size.
- El verificador Gemma 4 31B requiere su propio presupuesto de memoria: en bf16, aproximadamente 62 GB de pesos, lo que exige al menos una GPU de 80 GB (A100 80GB, H100 80GB) o tensor parallel en varias GPUs.
- No cabe en GPU de consumo junto al verificador de 31B en bf16; el borrador por sí solo sí cabría en una RTX 4090 (24 GB), pero sin el verificador no es funcional.
- Opciones de despliegue: vLLM con soporte de modelos borrador (método `draft_model`, block size 8) y la librería `speculators`; se necesita un build de vLLM que registre `lilicorr` en `vllm/transformers_utils/configs/speculators/algos.py`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La métrica `eal` de 4,5771 y `full_acc` de 0,6048 indican la longitud media de aceptación y la tasa de aceptación completa, pero no se publican medidas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| gemma-4-31b-it-lilicorr-drafter (este) | Borrador LiLiCorr para Gemma 4 31B | 2,58 B | ventana 2048 (decodificador) | no disponible | época 0 de 2, publicado |
| Borradores EAGLE / EAGLE-3 para familias equivalentes | Borrador con cabeza de predicción | no disponible | no disponible | no disponible | no disponible |
| Borradores Medusa | Cabezas múltiples sobre verificador | no disponible | no disponible | no disponible | no disponible |
| Gemma 4 31B it (verificador) | LM denso completo | 31 B | no disponible | no disponible | publicado por Google |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse de forma autónoma para generar texto, responder preguntas ni como sustituto de Gemma 4 31B.
- Checkpoint de época 0 de un entrenamiento de 2 épocas; el autor indica que la época 1 seguía en curso al subirlo y que puede publicarse un checkpoint posterior. El rendimiento final puede diferir.
- La licencia no está declarada en la información disponible, lo que impide confirmar condiciones de uso comercial. El modelo base Gemma 4 31B tiene sus propias condiciones que hay que verificar por separado.
- El `config.json` registra el verificador con una ruta absoluta local usada durante el entrenamiento (`/root/.cache/huggingface/models--google--gemma-4-31B-it/...`); hay que reescribirla al ID del Hub (`google/gemma-4-31B-it` @ `842da379...`) al cargarlo en otro entorno.
- Requiere un build de vLLM con un parche para registrar `lilicorr` en `algos.py`, y la implementación del borrador vive en una rama no fusionada (`lilicorr-clean` @ `6855ace`, PR #1391 abierto). El delta de entrenamiento (`gemma4-perfectblend-lilicorr-clean` @ `ab05276`) no está publicado.
- La tasa de aceptación decae con la posición (de 0,8613 en la posición 1 a 0,4133 en la 7), por lo que la aceleración efectiva es menor que la teórica del block size.
- Riesgo de alucinación y sesgos: no evaluables en un modelo borrador, ya que la distribución final la determina el verificador; cualquier sesgo del verificador se hereda.
- Idiomas soportados no documentados; el dataset de entrenamiento es Open PerfectBlend regenerado, de composición no detallada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeganEFlynn/gemma-4-31b-it-lilicorr-drafter
- Modelo base (verificador): https://huggingface.co/google/gemma-4-31B-it
- Implementación del borrador (PR abierto): https://github.com/vllm-project/speculators/pull/1391
- Soporte de inferencia H-Spec en vLLM (línea relacionada): https://github.com/vllm-project/vllm/pull/62780
- Repositorio de la librería `speculators`: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: `nm-research/gemma-4-31b-it-responses-open-perfectblend` @ `5e0fc323` (sin URL directa en la información disponible)
- Métricas de validación: `val_metrics.json` dentro del repositorio del modelo
