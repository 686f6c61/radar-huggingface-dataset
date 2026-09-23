# flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-20260923

## Resumen
El modelo `flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-20260923` es una cabeza de ranking (head-only) para puntuar y ordenar productos de instrumentos musicales a partir de una petición de compra y títulos de producto. No es un modelo generativo completo ni un adaptador LoRA: se compone de 2.560 pesos escalares entrenados sobre un backbone Qwen3-4B congelado, concretamente el checkpoint SFT completo `flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923`. El cargador fija una revisión concreta del backbone y verifica el SHA256 de la cabeza.

Resuelve un problema de ranking condicional con solapamiento de ID: dado un conjunto de títulos candidatos, asigna una puntuación raw; `sigmoid(raw/3)` es una transformación histórica opcional, no una probabilidad calibrada. La entrada se serializa como system/user/assistant con `{"products": [...]}`, solo con petición y títulos, sin IDs, categorías ni roles, con límite de 2.048 tokens y thinking deshabilitado.

Su relevancia actual es metodológica: documenta entrenamiento con 22.513 negativos únicos, validación estricta con 300 consultas y una accuracy top-1 del 70,33% para el checkpoint seleccionado (época 1,25), además de análisis de sensibilidad al orden. Está publicado con licencia Apache-2.0 y está pensado para re-ranking y evaluación, no para generación.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de scoring lineal de 2.560 pesos escalares sobre backbone transformer Qwen3-4B congelado; artifacto head-only, no generativo y no LoRA |
| Parámetros totales | 2.560 pesos escalares en la cabeza; el backbone congelado no se distribuye en este repositorio (Qwen3-4B por nomenclatura del modelo original, no verificado en la información) |
| Parámetros activos | No aplica; no es MoE. En entrenamiento solo se actualiza `score.weight` (2.560 pesos); el backbone permanece congelado |
| Longitud de contexto | 2.048 tokens (límite forzado en el serializador; thinking deshabilitado) |
| Tipos de cuantización | No disponible; no se distribuyen pesos del backbone ni versiones GGUF, AWQ o GPTQ en el repositorio |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch; carga mediante `ranker.py`; cabeza verificada por SHA256; no se especifica safetensors, GGUF ni otro formato |

## Arquitectura y entrenamiento
La arquitectura es una cabeza de ranking sobre un backbone transformer Qwen3-4B congelado. La cabeza contiene 2.560 pesos escalares y se entrena desde cero; no hay pesos duplicados del backbone en este repositorio. El cargador usa `ranker.py`, fija la revisión `1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6` del modelo SFT y verifica el checksum de la cabeza. La entrada se serializa con el tokenizador fijado como system/user/assistant con `{"products": [...]}`, con thinking deshabilitado y límite de 2.048 tokens. IDs, categorías y roles no forman parte de la entrada.

El entrenamiento usó 7.000 grupos de consultas con dos ordenaciones positivas sembradas cada uno (14.000 filas positivas) y 22.513 negativos únicos generados por SFT. De 22.514 negativos raw, uno se puso en cuarentena porque IDs distintos producían la misma consulta y títulos que un positivo. 177 consultas sin negativos no aportan pares; 6.823 consultas generan 22.513 comparaciones BT, una por negativo, alternando ordenaciones positivas. Los negativos deben ser bundles de ID únicos válidos con cero o un único ID de referencia coincidente; con dos o más coincidencias se excluyen. Ambos backbones, antiguo y nuevo, están congelados; solo se entrena `score.weight` desde cero. Se usó AdamW con LR 1e-4, 16 pares efectivos por actualización, warmup/cosine al 3%, clip 1, seed 42, forward en BF16 y cabeza en FP32. Se hicieron dos épocas y 2.816 actualizaciones, conservando 8 checkpoints trimestrales; el seleccionado es época 1,25, no el final.

## Capacidades
- Ranking condicional de bundles de productos a partir de una petición de compra y títulos de producto.
- Puntuación escalar raw por candidato; `sigmoid(raw/3)` es una transformación opcional no calibrada como probabilidad.
- Evaluación de solapamiento de ID: negativos válidos con cero o un único ID de referencia coincidente; con dos o más coincidencias se excluyen.
- No genera texto: no es un modelo causal de generación, sino una cabeza de scoring.
- No soporta tool calling, function calling ni agentes multi-step.
- No tiene soporte de visión, audio ni thinking mode; el thinking está deshabilitado en la serialización.
- Capacidades multilingües: no disponibles.
- Rendimiento de ranking: top-1 accuracy de 70,33% en validación estricta para el checkpoint seleccionado.
- Sensibilidad al orden documentada sobre 300 consultas y dos permutaciones positivas fijas.

## Casos de uso
- Re-ranking de resultados en una tienda de instrumentos musicales: dada una petición de compra y una lista de títulos candidatos, el modelo puntúa y reordena los productos. Es adecuado porque trabaja exactamente con petición y títulos, sin necesitar IDs ni categorías, y respeta un límite de 2.048 tokens.
- Selección de bundles y accesorios: permite ordenar conjuntos como "micrófono USB" más "soporte ajustable" para una consulta concreta. El entrenamiento con bundles de ID únicos y coincidencia de referencia lo hace útil para recomendar accesorios compatibles.
- Reward model en pipelines de recomendación: puede aportar señal de preferencia para optimizar un ranker o un sistema de recomendación, siempre que se trate como score raw y no como probabilidad calibrada.
- Evaluación offline de motores de búsqueda: con las 300 consultas de validación estricta y su protocolo de 1 referencia verdadera más 3 negativos frescos, sirve para medir top-1 accuracy de un sistema de ranking.
- Curación de datasets de entrenamiento: ayuda a detectar negativos problemáticos, como el caso cuarentenado en el que IDs distintos producían la misma consulta y títulos que un positivo.
- Detección de colisiones de alias de ID: al recibir solo títulos, puede señalar casos en los que distintos IDs tienen títulos idénticos o casi idénticos; la limitación documentada indica que no puede distinguir todos los alias por sí solo.
- Análisis de robustez al orden: sobre las mismas 300 consultas y dos permutaciones positivas fijas, permite medir la variación de score y detectar si el ranking depende del orden de los candidatos.
- Filtrado de negativos sintéticos generados por SFT: puede priorizar negativos con solapamiento de ID válido y descartar los que superan el umbral de coincidencias, reduciendo falsos negativos en datos de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks generativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento corresponden a la validación estricta de ranking:

| Checkpoint | Top-1 accuracy del bundle verdadero | Notas |
|---|---|---|
| Inicial | 77/300 = 25,67% | Punto de partida |
| Cabeza anterior | 184/300 = 61,33% | Old head |
| Seleccionado (época 1,25) | 211/300 = 70,33% | Checkpoint elegido; no es el final |
| Final | 210/300 = 70% | Época 2; empatado con el seleccionado, se rompe el empate por el checkpoint más temprano |

Datos adicionales de sensibilidad al orden sobre las mismas 300 consultas y dos permutaciones positivas fijas:

| Métrica | Valor |
|---|---|
| Gap raw medio | 1,1426 → 0,7657 |
| Media normalizada por SD del score | 0,3699 → 0,3220 (~13% menor) |
| Consultas con gap menor | 55% |

La accuracy pairwise se reporta como métrica separada, pero no se proporciona su valor en la información disponible. Esta validación es de ranking condicional, no de rendimiento generativo. La cohorte tiene exposición previa a validación SFT, por lo que no es un test end-to-end intacto; hay 275 test reservados sin tocar.

## Requisitos de hardware
- El repositorio no incluye el backbone; para inferencia hay que descargar y cargar el backbone Qwen3-4B congelado en la revisión fijada, más la cabeza verificada.
- VRAM estimada para el backbone, no confirmada por el autor: BF16/FP16 en torno a 8 GB de pesos más overhead de activaciones y KV; con 2.048 tokens y batch pequeño, aproximadamente 10-12 GB totales.
- VRAM estimada en 8 bits: en torno a 5-6 GB. En 4 bits: en torno a 3-4 GB. Estas cifras son estimaciones basadas en un backbone de 4B y no están documentadas en la model card.
- GPU recomendadas: A100 o H100 para lotes grandes y throughput; RTX 4090 o RTX 3090 para inferencia en consumer con batch pequeño; GPUs consumer con 12 GB o más para BF16 y con 8 GB o más para cuantización de 4 bits.
- `ranker.py` requiere CUDA según el ejemplo de carga. No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI.
- Formatos de despliegue documentados: PyTorch y carga personalizada mediante `ranker.py`. No hay GGUF ni integración con servidores de inferencia estándar en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Este ranker head | Cabeza de ranking sobre backbone congelado | 2.560 pesos en la cabeza; backbone Qwen3-4B no incluido | 2.048 tokens | Apache-2.0 | HuggingFace; 0 descargas, 0 likes | Top-1 70,33% en validación estricta de 300 consultas |
| `flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923` | Modelo completo SFT | No disponible; backbone Qwen3-4B | No disponible | No disponible | HuggingFace, revisión fijada | No disponible |
| `Qwen/Qwen3-4B` | Modelo generativo base | 4B por nomenclatura | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | No disponible |
| Ranker anterior del mismo autor | Ranker previo | No disponible | No disponible | No disponible | Repositorio mencionado como no modificado | No disponible |

No se dispone de comparativas con otros reward models o rankers de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo generativo: no produce texto, no conversa y no puede usarse como LLM general.
- Es head-only: requiere el backbone congelado en una revisión concreta y verificación SHA256; no incluye los pesos del backbone.
- La entrada se limita a petición de compra y títulos de producto; no usa IDs, categorías ni roles.
- No puede distinguir todos los alias de ID con entrada de solo título; la contradicción retenida en el entrenamiento demuestra esta limitación.
- Límite de 2.048 tokens impuesto por el serializador.
- El score raw no está restringido ni calibrado; `sigmoid(raw/3)` es una transformación histórica opcional y no una probabilidad calibrada.
- El score es sensible al orden: en la misma cohorte de 300 consultas, el gap raw medio pasó de 1,1426 a 0,7657 y la media normalizada por SD cayó un 13%; el gap fue menor en el 55% de las consultas.
- La validación estricta tiene exposición previa a validación SFT, por lo que no es un test end-to-end intacto. Hay 275 test reservados sin tocar, pero no se reportan resultados sobre ellos.
- Los negativos con dos o más coincidencias de ID se excluyen; esto puede sesgar la distribución de negativos.
- No se ejecutó GRPO en esta publicación.
- No se incluyen optimizador, credenciales ni logs privados.
- Sesgos conocidos: no disponibles explícitamente; al estar especializado en instrumentos musicales, puede heredar sesgos de catálogo, idioma y distribución de datos.
- Riesgo de alucinación: no aplica generación, pero sí puede producir rankings poco fiables fuera de la distribución de entrenamiento; la model card recomienda verificaciones de validez externa.
- Licencia Apache-2.0: permite uso comercial, pero hay que revisar las dependencias, el backbone y los datos asociados.
- Para producción, no hay datos de latencia, throughput ni opciones de serving estándar; habría que validar el coste de cargar el backbone congelado en cada despliegue.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-id-overlap-ranker-20260923
- Backbone SFT con revisión fijada: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-full-sft-shared-20260923/tree/1d6b019dfaaf368fe8af2ab593d66a3ee1c215a6
- Dataset de datos públicos y validación estricta: https://huggingface.co/datasets/flavianv/musical-instruments-id-overlap-reward-20260923-v1/tree/3b13de27a5e3f31c20742a36b1880c966f325308/strict_validation_v3
- Informe y gráficas en GitHub: https://github.com/clijo/reco-rl/tree/cfb7e75/docs/experiments/id_overlap_ranker_20260923
- Informe PDF: https://github.com/clijo/reco-rl/blob/cfb7e75/docs/experiments/id_overlap_ranker_20260923/musical_id_overlap_ranker_strict_20260923_v2.pdf
- Modelo base original Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
