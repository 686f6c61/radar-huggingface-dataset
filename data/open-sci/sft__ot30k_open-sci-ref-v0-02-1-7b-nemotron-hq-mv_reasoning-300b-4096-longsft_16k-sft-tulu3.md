# open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3

## Resumen

El modelo `sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3` es un checkpoint de ajuste fino supervisado (SFT) publicado por la organización `open-sci` en Hugging Face. Con 1.714.377.728 parámetros (aproximadamente 1,7 mil millones), se trata de un modelo de tamaño compacto orientado a experimentación en investigación abierta sobre razonamiento y generación de texto. El identificador sugiere que parte de una referencia interna (`open-sci-ref-v0.02-1.7b`) afinada sobre un conjunto de datos derivado de OpenThoughts3 (30.000 muestras) y con la receta de Tulu3, aunque la model card no confirma explícitamente el modelo base.

El checkpoint fue entrenado con el framework LLaMA-Factory en modo `full` (ajuste completo, no LoRA) sobre 32 dispositivos, con un batch total de 128 y 5 épocas, lo que indica un esfuerzo de entrenamiento distribuido considerable para su tamaño. La model card es autocontenida y mínima: se generó automáticamente por el `Trainer` de Transformers y no incluye descripción de usos previstos, datos de evaluación ni resultados de benchmarks.

Su relevancia actual es acotada y de carácter experimental: se trata de un artefacto de investigación con licencia `other` (no estándar), sin idiomas declarados y con muy poca tracción en el Hub (16 descargas, 0 likes). Resulta útil como referencia para reproducir recetas de SFT sobre datasets abiertos de razonamiento, pero no está pensado como modelo de producción ni cuenta con documentación que permita evaluar su calidad de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no confirmado en la model card; inferido del pipeline `feature-extraction` y del ecosistema LLaMA-Factory) |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no es MoE según el recuento de safetensors) |
| Longitud de contexto | no disponible (el identificador menciona `4096` y `longsft_16k`, pero la model card no lo confirma) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estándar; revisar términos antes de cualquier uso) |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que se deduce del pipeline (`feature-extraction`) y del uso de LLaMA-Factory con ajuste completo. El recuento de parámetros (1,7 B) y el tamaño del repo (3,4 GB en safetensors) son coherentes con un transformer decoder-only en precisión de 16 bits. El identificador del modelo incluye referencias a `nemotron-hq`, `mv_reasoning`, `300B` y `longsft_16k`, lo que sugiere una mezcla de datos de razonamiento de alta calidad y una fase de SFT con contexto extendido, pero estos detalles no están documentados en la model card.

El entrenamiento se realizó con LLaMA-Factory sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras de OpenThoughts3). Los hiperparámetros declarados son: learning rate 4e-05, batch total 128 (batch 1 × 4 pasos de acumulación × 32 dispositivos), 5 épocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08) y semilla 42. El entorno fue Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta ninguna innovación técnica adicional (RLHF, DPO, decodificación especulativa o atención lineal).

## Capacidades

- Generación de texto autoregresiva y extracción de características (`feature-extraction` como pipeline declarado).
- Razonamiento de múltiples pasos: el identificador del checkpoint incluye `mv_reasoning`, lo que apunta a un ajuste orientado a cadenas de razonamiento, aunque no hay evaluación publicada que lo confirme.
- Ajuste sobre datos de tipo OpenThoughts3, que suelen incluir problemas de matemáticas, código y razonamiento científico.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; solo inferible del nombre del checkpoint.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de recetas de SFT en investigación: el checkpoint sirve como referencia para validar pipelines de LLaMA-Factory con ajuste completo sobre datasets de razonamiento abiertos, comparando hiperparámetros y curvas de entrenamiento.
- Experimentación académica con modelos de 1,7 B: su tamaño permite iterar en una sola GPU de gama alta o en varias consumer, útil para estudiar el efecto del SFT sobre modelos pequeños.
- Generación de datos sintéticos de razonamiento: puede emplearse para producir cadenas de pensamiento que luego se filtren y se usen en el entrenamiento de modelos mayores, siempre que la licencia lo permita.
- Fine-tuning posterior (continued pretraining o DPO): al ser un checkpoint full de 1,7 B en safetensors, es un punto de partida manejable para experimentos de alineamiento adicional.
- Evaluación comparativa de datasets: permite medir cómo afecta el subconjunto de 30.000 muestras de OpenThoughts3 al rendimiento en tareas de matemáticas y código frente a otros datasets de razonamiento.
- Prototipado de extracción de características: el pipeline declarado permite usar las representaciones internas del modelo en tareas de clasificación o clustering sobre texto, aunque sin documentación sobre qué capa es más adecuada.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `sft__f679a5c592c8dffb__open-sci-re-22b0444c__sdpa-open-sci-steps` y una lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,8-2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070). Para entrenamiento completo se requieren varias GPU de datacenter (A100/H100), dado que el autor usó 32 dispositivos.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más para inferencia; en 4-6 GB con cuantización.
- Opciones de despliegue: Transformers (librería declarada), vLLM y TGI para servicio; llama.cpp y Ollama requerirían conversión a GGUF, no publicada oficialmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/sft__ot30k...-1.7b | 1,7 B | no disponible | other | Hugging Face, 16 descargas |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2-1B | 1,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados para el modelo de `open-sci`. Frente a alternativas como Qwen2.5-1.5B o SmolLM2-1.7B, este checkpoint carece de evaluación pública, de cuantizaciones oficiales y de una licencia estándar, lo que reduce su atractivo para uso práctico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset de razonamiento abierto, puede heredar sesgos de su composición, pero no hay análisis publicado.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas de fidelidad, el riesgo es desconocido y potencialmente alto en un modelo de 1,7 B.
- Limitaciones de contexto e idioma: la model card no declara idiomas ni longitud de contexto; el identificador sugiere 4.096 o 16.384 tokens, pero no está confirmado.
- Restricciones de licencia: licencia `other` no estándar; es imprescindible revisar los términos antes de cualquier uso comercial o redistribución.
- Caveat para producción: la model card es autogenerada y no incluye usos previstos, evaluación ni instrucciones de prompt; el checkpoint no está pensado para despliegue en producción sin una validación exhaustiva.
- Tracción mínima: 16 descargas y 0 likes indican escasa validación por parte de la comunidad.
- Sin cuantizaciones oficiales ni conversiones a GGUF, lo que complica el despliegue en entornos de bajo consumo.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- OpenThoughts3 (dataset de referencia): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Tulu3 (receta de SFT de referencia): https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B
- Transformers: https://github.com/huggingface/transformers
