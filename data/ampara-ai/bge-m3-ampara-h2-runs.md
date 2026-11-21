# ampara-ai/bge-m3-ampara-h2-runs

## Resumen

`bge-m3-ampara-h2-runs` es un repositorio de investigación publicado por ampara-ai que documenta los seis entrenamientos del experimento H2 dentro del sistema legal RAG Ampara, orientado a derecho de violencia familiar en Perú. No es un modelo desplegable: es un registro reproducible de fine-tuning sobre `BAAI/bge-m3` (revisión `5617a9f61b028005a4858fdac845db406aefb181`), el conocido modelo de embeddings multilingüe de BAAI, con 568 millones de parámetros y contexto de hasta 8192 tokens.

El experimento compara dos protocolos de construcción de datos —`naive`, con preguntas generadas a partir de fragmentos y negativos aleatorios, y `full_matched`, con el protocolo completo de datos submuestreado de forma determinista a las mismas 1376 filas— manteniendo idéntico presupuesto de entrenamiento en cada brazo: 430 actualizaciones del optimizador, learning rate 5e-6, temperatura 0.05, grupo de 9 (1 positivo y 8 negativos), 5 épocas, batch efectivo 16, longitud máxima 2048 y FP16 sobre una única GPU Colab L4. Cada brazo se ejecuta con tres semillas (42, 1, 2).

Su relevancia es metodológica: publica checkpoints intermedios, selección de checkpoint basada solo en desarrollo, informes de evaluación con intervalos de confianza bootstrap y sumas SHA-256 de todos los ficheros. El resultado principal es negativo: en Test B, `full_matched` no supera a `naive` (NDCG@10 estricto medio 0.558 frente a 0.629, diferencia -0.072, IC 95% [-0.163, 0.000], p bootstrap = 0.053). El checkpoint de producción es otro repositorio distinto, `ampara-ai/bge-m3-ampara`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (heredada de BAAI/bge-m3), fine-tuning con sentence-transformers |
| Parámetros totales | no disponible en la información proporcionada (el modelo base BAAI/bge-m3 tiene 568 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens de longitud máxima durante el entrenamiento (el modelo base soporta hasta 8192) |
| Tipos de cuantización | no disponible; el entrenamiento y la evaluación se hicieron en FP16 |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-m3 es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoints finales e intermedios), config.json y tokenizer en el directorio raíz de cada run |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-m3`, un encoder transformer para recuperación densa, multilingüe y multi-funcional. El fine-tuning se realiza con la librería sentence-transformers usando pérdida contrastiva con temperatura 0.05 y grupos de 9 elementos (1 positivo, 8 negativos). Las consultas se entrenan sin prefijo (`"prompt": ""`), lo que conviene tener en cuenta al construir el pipeline de inferencia.

Cada run consume 1376 filas de entrenamiento, 430 actualizaciones del optimizador, 5 épocas, batch por dispositivo 1, acumulación de gradiente 16, learning rate 5e-6, longitud máxima 2048 y precisión FP16 sobre una NVIDIA L4 de Colab. Se guardan checkpoints en los pasos 85, 170, 255, 340, 425 y 430, y el checkpoint final se elige exclusivamente sobre un conjunto de desarrollo de 130 preguntas con NDCG@10 estricto, desempatando por Recall@10 y luego por el candidato más temprano. Test A y Test B nunca se usan para selección. Los estados del optimizador (unos 266 GiB) no se subieron al repositorio.

El brazo `naive` usa preguntas generadas a partir de fragmentos (antes del juez), el fragmento fuente como positivo y negativos aleatorios de la partición de entrenamiento. El brazo `full_matched` usa el protocolo completo de datos, submuestreado de forma determinista a las mismas 1376 filas. El repositorio incluye `provenance.json`, `pip_freeze.txt`, `gpu.txt`, `train.log` y `SHA256SUMS` para verificar la reproducibilidad, aunque los runs no están garantizados como idénticos byte a byte al repetirlos.

## Capacidades

- Extracción de características y generación de embeddings para recuperación (feature-extraction, retrieval).
- Recuperación densa de fragmentos legales en un corpus de derecho de violencia familiar de Perú.
- Entrenamiento sin prefijo en las consultas, con grupos contrastivos de 1 positivo y 8 negativos.
- Evaluación reproducible: rankings, informes comparativos (Test A, Test B), intervalos de confianza bootstrap y ajuste de Holm pendiente para H1-H3.
- Registro de procedencia completo: scripts de entrenamiento y evaluación referenciados por commit, logs de Colab y hashes SHA-256.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; es un modelo de embeddings, no generativo.

## Casos de uso

- Reproducción de experimentos de fine-tuning de recuperación: el repositorio permite reentrenar o reauditar los seis runs con los mismos datos, hiperparámetros y semillas, verificando la integridad con `SHA256SUMS`.
- Auditoría metodológica de protocolos de datos: comparar `naive` frente a `full_matched` para entender el efecto de la construcción de negativos y preguntas en la recuperación, con la advertencia de que el experimento cambia varios componentes a la vez.
- Estudio de selección de checkpoint: analizar la política de elegir checkpoint solo con el conjunto de desarrollo (130 preguntas, NDCG@10 estricto) y su impacto en la evaluación final.
- Investigación en RAG legal: usar los embeddings y los rankings publicados como línea base para sistemas de recuperación sobre normativa peruana de violencia familiar.
- Docencia y formación: material de referencia para enseñar evaluación con intervalos de confianza bootstrap, comparaciones con múltiples semillas y control de fugas entre desarrollo y test.
- Integración en pipelines de recuperación: los checkpoints en safetensors pueden cargarse con sentence-transformers para experimentar con recuperación densa, aunque no deben usarse como modelo de producción (el checkpoint de producción es `ampara-ai/bge-m3-ampara`).

## Benchmarks y rendimiento

| Conjunto | Brazo | Métrica | Resultado |
|---|---|---|---|
| Test B (primario) | `naive` | NDCG@10 estricto medio | 0.629 |
| Test B (primario) | `full_matched` | NDCG@10 estricto medio | 0.558 |
| Test B (primario) | diferencia | NDCG@10 estricto | -0.072, IC 95% [-0.163, 0.000], p bootstrap = 0.053 |

El ajuste de Holm para la familia H1-H3 está pendiente y no se aplica en este repositorio. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de recuperación (MTEB, BEIR) en la información disponible. La evaluación se realizó en Apple MPS en FP16 y mide recuperación de la fuente sobre preguntas sintéticas, no corrección jurídica.

## Requisitos de hardware

- Entrenamiento: una única NVIDIA L4 (Google Colab), FP16, batch por dispositivo 1 con acumulación de gradiente 16 y longitud máxima 2048.
- Evaluación: Apple MPS en FP16 según la model card.
- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 40.9 GB por los checkpoints y logs, no por el peso de un único modelo.
- GPU recomendadas: no disponibles; el modelo base BAAI/bge-m3 es un encoder de tamaño moderado que puede ejecutarse en GPUs de consumo, pero no se aportan cifras concretas para este fine-tuning.
- Opciones de despliegue: carga con sentence-transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `bge-m3-ampara-h2-runs` | no disponible (base 568 M) | 2048 en entrenamiento (base hasta 8192) | MIT | Hugging Face, 0 descargas | Registro de investigación, no desplegable |
| `BAAI/bge-m3` | 568 M | 8192 | MIT | Hugging Face | Modelo base multilingüe de recuperación |
| `ampara-ai/bge-m3-ampara` | no disponible | no disponible | no disponible | Hugging Face | Checkpoint de producción del sistema Ampara, run distinto |

No se dispone de datos de benchmarks comparativos con otros modelos de embeddings en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un registro de investigación, no un modelo para despliegue; el checkpoint de producción es `ampara-ai/bge-m3-ampara`.
- El resultado principal es negativo: `full_matched` no supera a `naive` en Test B, con un intervalo de confianza que incluye el cero y un p bootstrap de 0.053.
- El ajuste de Holm para H1-H3 está pendiente, por lo que la significación no está corregida por comparaciones múltiples.
- Solo tres semillas por brazo, información limitada sobre la variabilidad del entrenamiento.
- La comparación cambia varios componentes de construcción de datos a la vez y no aísla sus efectos.
- La evaluación mide recuperación de la fuente sobre preguntas sintéticas, no corrección jurídica ni calidad de la respuesta final.
- Los runs no están garantizados como idénticos byte a byte al repetirse; `full_matched_seed2` se relanzó tras perder una VM de Colab y `naive_seed42` se interrumpió y reinició, sobrescribiendo los logs de los intentos interrumpidos.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; al ser un modelo de embeddings, el riesgo de alucinación se traslada al generador del pipeline RAG.
- Licencia MIT, sin restricciones comerciales documentadas en la model card, pero el uso en producción debe hacerse con el checkpoint de producción, no con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampara-ai/bge-m3-ampara-h2-runs
- Checkpoint de producción: https://huggingface.co/ampara-ai/bge-m3-ampara
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Scripts de entrenamiento: https://github.com/ampara-ai/data_collection_and_fine-tuning (commit `b61e6a8002dfd57396e817c35e4272503c895f88`)
- Scripts de evaluación: repositorio `backend`, rama PR `feature/portable-revision-experiments-and-remaining-runs`
