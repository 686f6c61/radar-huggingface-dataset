# jackyk02/clm-35b-a3b-mv8x128-w3696-adp-head

## Resumen

CLM-35B-A3B multi-vector head es una cabeza de proyección contrastiva entrenada sobre los embeddings congelados del modelo Qwen/Qwen3.6-35B-A3B-FP8 (2048 dimensiones, pooling del último token, normalizados en L2). No es un modelo generativo completo, sino un componente de scoring que transforma esos embeddings en representaciones multi-vector: cada torre es un MLP de profundidad 3 y anchura 3.696 que emite 8 vectores unitarios de 128 dimensiones. El emparejamiento entre un estado y una acción se puntúa mediante distancia Chamfer (tipo MaxSim): la media, sobre los vectores de estado, del mejor vector de acción que lo empareja.

La cabeza tiene 50,06 millones de parámetros y fue desarrollada por jackyk02 dentro del ecosistema `clm_train`, orientado a tareas de recuperación y selección de acciones en contextos de agentes. Su interés actual reside en que aplica un pipeline de entrenamiento en tres fases (preentrenamiento, mid-training con negativos difíciles y post-entrenamiento con ADP) sobre un backbone de 35B parámetros con arquitectura MoE, lo que permite evaluar la calidad de representaciones contrastivas derivadas de un modelo grande sin reentrenar el encoder.

El repositorio ocupa 0,2 GB y contiene únicamente los pesos de la cabeza (`best_head.pt`), junto con `summary.json` y `train.log`. No incluye el encoder base ni los datos de entrenamiento; para usarla es necesario servir el encoder Qwen3.6-35B-A3B-FP8 por separado y cargar la cabeza mediante la librería `clm_train`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de proyección contrastiva multi-vector sobre encoder transformer MoE congelado (Qwen3.6-35B-A3B-FP8); MLP de profundidad 3, anchura 3.696, LayerNorm y GELU |
| Parámetros totales | 50,06M (solo la cabeza); el encoder base no se incluye en el repo |
| Parámetros activos | no disponible (corresponden al encoder base, no a la cabeza) |
| Longitud de contexto | no disponible (depende del encoder Qwen3.6-35B-A3B-FP8) |
| Tipos de cuantización | no disponible; pesos en bf16 para las torres, checkpoint `.pt` |
| Idiomas soportados | no disponible |
| Licencia | other (los negativos difíciles ADP y los datos fuente conservan sus propios términos: `neulab/agent-data-collection` y `nvidia/Nemotron-CC-v2`) |
| Formato de pesos | `.pt` (checkpoint `clm_train` con `state_head`, `action_head`, `logit_scale`, `cfg`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La cabeza proyecta embeddings de 2048 dimensiones procedentes de Qwen3.6-35B-A3B-FP8 (pooling del último token, L2-normalizado) a 8 vectores unitarios de 128 dimensiones mediante dos torres independientes (`state_head` y `action_head`), cada una un MLP de profundidad 3 con anchura 3.696, LayerNorm y GELU. El scoring no usa producto escalar sobre vectores aplanados, sino Chamfer/MaxSim: para cada vector de estado se toma el mejor vector de acción y se promedia sobre el conjunto de estados. Las secuencias de un solo token usan una tabla específica (`jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings`), tanto en entrenamiento como en inferencia, porque el pooling de vLLM sobre prompts de un token devuelve ruido para este modelo.

El entrenamiento se realizó en tres fases: preentrenamiento sobre la totalidad de Nemotron-CC-v2 Diverse-QA (2.960 millones de pares, 3 épocas, 532.998 pasos, mejor paso 510.000); mid-training con HQ-DQA más negativos difíciles y un 40 % de replay de Diverse-QA (2 épocas, 12.380 pasos, mejor paso 12.250); y post-entrenamiento con ADP y sus 8 negativos difíciles por fila, con un 20 % de HQ-DQA (con negativos) y un 20 % de replay de Diverse-QA (7.000 pasos, mejor paso 7.000). Se usó batch de 16.384, learning rate 1e-3, torres en bf16 y una única H100. El código de entrenamiento está en `clm_train` en el commit `f8f3b8d` (`scripts/e2e_mv_adp.sh`), con `replay_hard_negatives=True` en el post-entrenamiento. La temperatura alcanzó su tope (logit scale 100), de modo que las probabilidades softmax son muy agudas; el autor recomienda subir `temperature` para suavizarlas.

## Capacidades

- Scoring contrastivo estado-acción mediante distancia Chamfer (MaxSim) sobre representaciones multi-vector de 8 x 128 dimensiones.
- Recuperación y ranking de acciones candidatas frente a un estado dado, con puntuación por pares.
- Manejo de negativos difíciles: el post-entrenamiento ADP incorpora 8 negativos difíciles por fila para afinar la discriminación.
- Representaciones multi-vector, lo que permite emparejamientos parciales entre vectores de estado y de acción en lugar de una única similitud global.
- Soporte de secuencias de un solo token mediante tabla dedicada de embeddings, con aplicación automática al cargar (`clm_train.data.stores.EmbeddingDir`).
- Integración en el ecosistema `clm_train` mediante `CLMScorer` y el identificador `hf:clm-35b-a3b-mv8x128-adp`.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües: no disponibles en esta cabeza; dependen del encoder base, que no forma parte del repositorio.

## Casos de uso

- Selección de acciones en agentes: dado un estado del entorno representado por el encoder, la cabeza puntúa cada acción candidata con Chamfer y permite elegir la mejor; encaja en pipelines de agentes donde las acciones se modelan como texto y se puntúan contra el estado actual.
- Recuperación de documentos o pasajes: usando el encoder para generar embeddings de consulta y de documento, la cabeza puede reordenar candidatos con representaciones multi-vector, útil en sistemas de búsqueda de dos etapas.
- Filtrado con negativos difíciles en producción: el entrenamiento ADP con 8 negativos por fila hace que la cabeza discrimine entre candidatos muy similares, adecuado para tareas de desambiguación fina.
- Evaluación de decisiones en entornos simulados: la métrica "gold beats all its negatives" (0,883 en ADP) permite usar la cabeza como juez de alineamiento entre estado y acción en datasets de agentes.
- Investigación en representaciones contrastivas: al ser una cabeza pequeña (50,06M) sobre un encoder congelado, sirve para experimentar con funciones de scoring multi-vector sin coste de reentrenamiento del backbone.
- Replay y análisis de datos de agentes: combinada con los datasets de embeddings publicados (`ai2-science-qwen3.6-35b-a3b-fp8-embeddings-256k`, `swe-smith-ai2-qwen3.6-35b-a3b-fp8-embeddings-256k`), permite puntuar trayectorias y comparar acciones en corpus de ciencia y de SWE.
- Servicio de scoring dedicado: mediante `clm-serve --emb-url-35b ... --ckpt-35b hf:clm-35b-a3b-mv8x128-adp --no-8b`, se puede exponer un endpoint de scoring separado del encoder.

## Benchmarks y rendimiento

| Métrica | Este head |
|---|---|
| ADP: gold beats all its negatives | 0,883 |
| ADP: top-1 with negatives | 0,805 |
| HQ-DQA: gold beats all its negatives | 0,685 |
| HQ-DQA: top-1 with negatives | 0,683 |
| HQ-DQA: plain in-batch loss / top-1 | 0,579 / 0,891 |

Los valores son puntuaciones de validación del mejor checkpoint, con una sola semilla y seleccionadas por la pérdida de validación media en ADP; no constituyen un conjunto de test separado. La cabeza no ha sido evaluada en el Jev Decision Index. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de la cabeza: 50,06M parámetros en bf16 equivalen aproximadamente a 0,1 GB; el grueso del coste proviene del encoder Qwen3.6-35B-A3B-FP8, que debe servirse aparte y no se incluye en el repo.
- GPU recomendadas para el encoder: el entrenamiento se hizo en una H100; para servir el encoder de 35B en FP8 se recomienda H100 o A100 de 80 GB, y el despliegue de la cabeza en sí es trivial en cualquier GPU.
- GPU de consumo: la cabeza cabe en cualquier GPU consumer, pero el encoder de 35B en FP8 no cabe en GPUs de 24 GB sin cuantización adicional no documentada.
- Opciones de despliegue: `clm-serve` con `--emb-url-35b` apuntando a un servidor de embeddings compatible con la API `/v1/embeddings`, y `CLMScorer` con lista de URLs; el encoder puede servirse con `scripts/serve_encoder.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-35B-A3B multi-vector head (este) | 50,06M (cabeza) | no disponible | Scoring contrastivo multi-vector sobre embeddings Qwen3.6-35B-A3B-FP8 | other | Hugging Face, 0 descargas, 0 likes |
| Encoder base Qwen/Qwen3.6-35B-A3B-FP8 | 35B (MoE) | no disponible | Generación de embeddings y texto | no disponible | Requerido para usar esta cabeza |
| Otras cabezas contrastivas de `clm_train` | no disponible | no disponible | Scoring estado-acción | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otras cabezas contrastivas en la información proporcionada.

## Limitaciones y advertencias

- La cabeza no es un modelo generativo: no produce texto, código ni respuestas; solo puntúa pares estado-acción sobre embeddings del encoder base.
- Dependencia total de Qwen/Qwen3.6-35B-A3B-FP8: sin el encoder servido no puede usarse, y el repo no incluye los pesos del encoder.
- Las puntuaciones de validación provienen de una sola semilla y del mejor checkpoint seleccionado por pérdida de validación en ADP, no de un test independiente; pueden estar optimistas.
- El autor indica que la cabeza no ha sido evaluada en el Jev Decision Index, por lo que no hay referencia externa de rendimiento.
- Las probabilidades softmax son muy agudas porque el logit scale alcanzó el tope de 100; en producción conviene ajustar `temperature` para evitar decisiones sobredimensionadas.
- El pooling de vLLM sobre prompts de un token devuelve ruido para este encoder; es obligatorio usar la tabla de embeddings de un solo token, lo que añade una dependencia operativa.
- Licencia "other": los datos fuente y los negativos ADP conservan sus propios términos (`neulab/agent-data-collection`, `nvidia/Nemotron-CC-v2`), por lo que el uso comercial requiere revisar esas licencias por separado.
- No hay información sobre sesgos, cobertura de idiomas, riesgo de alucinación ni latencias; no disponibles.
- El modelo tiene 0 descargas y 0 likes, sin pipeline declarado ni validación comunitaria; su madurez en producción es baja.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/jackyk02/clm-35b-a3b-mv8x128-w3696-adp-head
- Dataset de embeddings de ciencia: https://huggingface.co/datasets/jackyk02/ai2-science-qwen3.6-35b-a3b-fp8-embeddings-256k
- Dataset de embeddings de SWE: https://huggingface.co/datasets/jackyk02/swe-smith-ai2-qwen3.6-35b-a3b-fp8-embeddings-256k
- Tabla de embeddings de un solo token: https://huggingface.co/jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings
- Encoder base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Dataset fuente Nemotron-CC-v2: https://huggingface.co/datasets/nvidia/Nemotron-CC-v2
- Dataset de negativos difíciles ADP: https://huggingface.co/datasets/neulab/agent-data-collection
