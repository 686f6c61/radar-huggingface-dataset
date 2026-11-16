# jackf857/neu-q3-ultra-nbl-unidpo-s42-20261115-a2

## Resumen

`jackf857/neu-q3-ultra-nbl-unidpo-s42-20261115-a2` es un checkpoint experimental de investigación publicado por el usuario jackf857 en Hugging Face. Se trata de un ajuste fino por preferencias (DPO con una variante propia denominada Uni-DPO) sobre el modelo base `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128`, que a su vez es un Qwen3 de 8B parámetros afinado con SFT sobre UltraChat. El resultado es un modelo causal de generación de texto de 8.190.735.360 parámetros con licencia Apache 2.0.

El modelo no introduce arquitectura nueva: hereda la de Qwen3 (36 capas, `Qwen3ForCausalLM`) y aplica una receta de optimización de preferencias sin referencia explícita en la pérdida, con beta fijo de 2.0, normalización de longitud de las log-probabilidades de respuesta y un término NLL ponderado sobre la respuesta elegida. El entrenamiento se realizó sobre el split `train_prefs` de `HuggingFaceH4/ultrafeedback_binarized` (61.135 pares disponibles), con 477 pasos de optimizador en 4 GPU NVIDIA H200.

Su relevancia es acotada y de carácter metodológico: el autor lo presenta explícitamente como un checkpoint de comparación para investigación, no como un modelo listo para producción. No se declaran resultados de benchmarks de generación ni evaluaciones held-out, y el propio autor advierte que una única semilla de entrenamiento no establece calidad downstream, robustez ni idoneidad para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3ForCausalLM), 36 capas |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento se usaron 2048 tokens máximos de secuencia y 1800 de prompt |
| Tipos de cuantizacion | no disponible (los tensores se subieron sin cuantizar, en el dtype serializado de la config: float32) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3 en su variante de 8B: un transformer decoder-only con 36 capas, invocada mediante `Qwen3ForCausalLM`. El modelo se inicializa desde el checkpoint SFT `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` (revisión `f55660f8575d309f4c9d6d81bb21107299c14011`) y se afina con Uni-DPO, una variante de optimización de preferencias sin referencia en la pérdida. Los hiperparámetros registrados incluyen beta fijo de 2.0, `dpo_length_norm` activado, `uni_dpo_qual_eta` 0.7, `uni_dpo_tau_ref` 0.8, `uni_dpo_perf_gamma` 3.0, `uni_dpo_nll_lambda` 0.001, `uni_dpo_tau_good` 3.2, `uni_dpo_score_scale` 0.5 y `signal_reference_beta` 0.01 (este último solo afecta al margen diagnóstico, no a la pérdida). No hay controlador LSC en esta ejecución.

El dataset de preferencias es el snapshot congelado de `HuggingFaceH4/ultrafeedback_binarized` (revisión `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`), split `train_prefs`, con 61.135 pares elegido/rechazado disponibles. El entrenamiento usó 4 × NVIDIA H200 (Northeastern Explorer), optimizador AdamW (`adamw_torch`), learning rate 5e-07, schedule cosine con warmup ratio 0.1, batch efectivo de 128 pares (4 por GPU × 4 GPU × 8 acumulación), clipping de gradiente 1.0, weight decay 0.0, precisión bfloat16 y atención SDPA. Se completaron 477 pasos de optimizador en 8.852,76 segundos (0,054 pasos/s), con una epoch registrada de 0,99895 y una pérdida de entrenamiento reportada por el trainer de 0,9214577794824756. La evaluación durante el entrenamiento estaba desactivada. Los checkpoints retenidos son los pasos 400 y 477, guardados como snapshots solo de modelo (sin estado de optimizador, scheduler ni RNG), por lo que no son reanudables de forma exacta.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del ajuste SFT sobre UltraChat y refinada con preferencias.
- Alineación por preferencias: el checkpoint incorpora la señal de UltraFeedback, orientada a mejorar la calidad de las respuestas según juicios comparativos.
- Razonamiento y conocimiento general: capacidades propias de la familia Qwen3 de 8B, aunque no se documentan explícitamente en esta model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en optimización de preferencias: el checkpoint sirve como punto de comparación reproducible frente a DPO estándar u otras variantes, dado que el autor publica configuración, semilla, hashes y trayectorias de margen en `training_logs/`.
- Reproducción de experimentos de alineación: con la configuración congelada (`training_config.yaml`), el SHA-256 del paquete de entrenamiento y la revisión del dataset fijada, se puede auditar la receta y replicar el pipeline sobre el mismo snapshot de UltraFeedback.
- Estudio de estabilidad de entrenamiento: los diagnósticos registrados (pérdida, pasos por segundo, trayectorias de margen y optimizador) permiten analizar el comportamiento de Uni-DPO con beta fijo y sin controlador LSC.
- Generación de texto conversacional en entornos de laboratorio: el modelo puede emplearse para producir respuestas multi-turno en prototipos internos, siempre que se asuma que no hay evaluación de calidad downstream publicada.
- Base para nuevos ajustes: al ser un checkpoint de 8B con licencia Apache 2.0, puede servir como inicialización para experimentos posteriores de SFT, DPO u otras técnicas de alineación.
- Evaluación comparativa de checkpoints intermedios: los pasos 400 y 477 permiten estudiar la evolución de la política durante el entrenamiento de preferencias.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada sin resultados (`"results": []`). El autor indica explícitamente que no se incluyen resultados de benchmarks de generación ni puntuaciones de evaluación held-out.

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos numéricos registrados son diagnósticos de entrenamiento, no métricas de calidad:

| Métrica de entrenamiento | Valor |
|---|---|
| Pérdida reportada por el trainer | 0,9214577794824756 |
| Tiempo de entrenamiento | 8.852,76 s |
| Pasos de optimizador | 477 |
| Pasos por segundo | 0,054 |
| Epoch registrada | 0,99895 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (8,19B parámetros), en bfloat16/fp16 se requieren aproximadamente 16 GB solo para pesos, más memoria para KV cache y activaciones; en float32 (dtype serializado en la config) serían unos 33 GB solo de pesos. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: el autor no publica requisitos de inferencia. El entrenamiento se realizó en 4 × NVIDIA H200.
- GPU de consumo: no confirmado por el autor; por tamaño, un modelo de 8B en cuantización de 4 bits podría caber en GPUs de consumo con 8-12 GB o más, pero no hay datos oficiales de cuantización para este checkpoint.
- Opciones de despliegue: la model card declara compatibilidad con `transformers` (versión 4.51.0) y el tag `text-generation-inference`; también aparece `endpoints_compatible`. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI más allá de las etiquetas.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el del entrenamiento (0,054 pasos/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| neu-q3-ultra-nbl-unidpo-s42-20261115-a2 | 8,19B | no disponible | Apache 2.0 | Sin benchmarks de generación | Hugging Face, 0 descargas al momento del registro |
| Qwen3-8B (modelo base de la familia) | ~8B | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | No disponible en esta ficha | Hugging Face |
| jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128 (SFT previo) | ~8B | no disponible | no disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor describe el modelo como un checkpoint experimental de investigación para comparación de preferencias; no establece calidad downstream, robustez ni idoneidad para despliegue.
- No hay evaluación held-out ni benchmarks de generación publicados; el `model-index` está vacío.
- Una única semilla de entrenamiento (42) y comprobaciones de entrenamiento correctas no garantizan comportamiento consistente.
- Los snapshots son solo de modelo: no incluyen estado de optimizador, scheduler ni RNG, por lo que no son reanudables de forma exacta.
- El autor no reclama paridad exacta con un entorno B200 distinto.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La pérdida de entrenamiento reportada no es una puntuación de AlpacaEval ni una garantía de calidad; las convenciones de logging y acumulación forman parte de la implementación.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el propio autor desaconseja el uso en producción sin evaluación adicional.
- Al evaluar, el autor recomienda usar el tokenizer y la config archivados con el modelo e identificar una revisión inmutable de Hugging Face.
- El modelo se subió sin cuantizar y con dtype float32 serializado en la config, lo que incrementa el espacio en disco (32,8 GB de repositorio) y la memoria de inferencia si no se convierte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-q3-ultra-nbl-unidpo-s42-20261115-a2
- Modelo base SFT: https://huggingface.co/jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Resumen de la ejecución (en el repo): `training_logs/run/run.json`
- Configuración de entrenamiento congelada (en el repo): `training_logs/run/training_config.yaml`
- Model card autogenerada original (en el repo): `training_logs/run/generated-model-card-original.md`
