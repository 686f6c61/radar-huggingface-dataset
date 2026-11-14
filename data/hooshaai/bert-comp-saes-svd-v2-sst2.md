# Hooshaai/bert-comp-saes-svd-v2-sst2

## Resumen

bert-comp-saes-svd-v2-sst2 es un checkpoint comprimido de `google-bert/bert-base-uncased` fine-tuneado para clasificación de sentimiento en GLUE SST-2, publicado por el usuario Hooshaai (repo original referenciado como `tahamajs/bert-comp-saes-svd-v2-sst2`). El modelo aplica la técnica SAES-SVD v2 (Spectrum-Aware Error-Suppressed Singular Value Decomposition) implementada en la librería NeuralOps, que descompone las matrices de pesos del transformer en factores de bajo rango y aplica un proceso de "healing" mediante LoRA para recuperar parte de la precisión perdida.

El checkpoint publicado corresponde al rank k=128, que reduce los parámetros de 109,5 M a 45,8 M (un 58,2% menos, ratio de compresión físico de 2,39x) manteniendo una accuracy de 73,51% en el split de validación de SST-2, frente al 91,63% del modelo profesor original. Es relevante como ejemplo práctico de compresión de modelos transformer con recuperación mediante adaptadores de bajo rango, dentro de un zoo de modelos comprimidos orientado a despliegue con restricciones de memoria.

La arquitectura subyacente es BERT-base (12 capas, dimensión oculta 768, 109,5 M de parámetros), tokenizador WordPiece sin distinción de mayúsculas y vocabulario estándar de bert-base-uncased. El modelo está pensado exclusivamente para inglés y para la tarea de clasificación binaria de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), comprimido mediante SAES-SVD v2 con LoRA healing |
| Parametros totales | 45.792.002 (tras compresión; original 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base estándar: 512 tokens) |
| Tipos de cuantizacion | No disponible (el repo distribuye pesos en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) con factores de bajo rango y adaptadores LoRA embebidos |
| Rank de compresión | k=128 |
| Ratio de compresión | 2,39x (-58,17% de parámetros) |
| Librería | neuralops |
| Tarea | Text classification (sentimiento binario) |
| Modelo base | google-bert/bert-base-uncased |

## Arquitectura y entrenamiento

El modelo parte de BERT-base uncased (12 capas, D=768, 109,5 M de parámetros) ya fine-tuneado en GLUE SST-2, con una accuracy de referencia del 91,63% en validación. Sobre ese checkpoint se aplica el compresor `SAESSVDCompressorV2` de NeuralOps, registrado como `saes_svd_v2` (y alias `saes`), que realiza una descomposición en valores singulares con supresión de error consciente del espectro. La compresión reduce físicamente el número de parámetros a 45,8 M mediante factores de bajo rango en las matrices del encoder.

Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos porcentuales con una reducción superior a 1,10x, el pipeline aplica un "healing" con LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En el rank k=128, el modelo comprimido sin healing alcanza 52,41% de accuracy, y tras el healing LoRA sube a 73,51%. La evaluación multi-rank se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre 872 muestras del split de validación de SST-2. El rank k=32 falló con `FAIL_CRASH` durante la evaluación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, tarea SST-2.
- Inferencia sobre texto corto y medio en inglés con el tokenizador WordPiece de bert-base-uncased.
- Modelo de clasificación pura: no genera texto libre ni soporta instrucciones.
- No soporta tool calling ni function calling (no es un modelo instructivo).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés; el vocabulario uncased no cubre otros idiomas de forma fiable.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de reseñas de producto en inglés: el modelo devuelve una etiqueta binaria de sentimiento sobre textos cortos, adecuado para pipelines de análisis de opiniones con bajo coste de memoria (45,8 M de parámetros).
- Moderación de comentarios en foros angloparlantes: filtrado rápido de mensajes negativos como primera etapa de un sistema de moderación, aprovechando el reducido tamaño del checkpoint.
- Enrutamiento de tickets de soporte: clasificación previa de quejas frente a mensajes neutros o positivos antes de pasarlos a un modelo mayor o a un humano.
- Análisis de sentimiento en dashboards de redes sociales: procesamiento por lotes de grandes volúmenes de texto en inglés con un modelo de 87,5 MB de pesos, viable en CPU o GPU de gama baja.
- Prototipado de investigación en compresión de modelos: el checkpoint sirve como referencia reproducible del pipeline SAES-SVD v2 + LoRA healing para comparar técnicas de compresión en tareas GLUE.
- Despliegue en entornos con restricciones de memoria: el modelo comprimido ocupa aproximadamente la mitad que BERT-base original, útil en dispositivos edge o contenedores con límites estrictos de RAM/VRAM.
- Evaluación comparativa de ratios de compresión: junto con los ranks k=256 y k=64 documentados, permite analizar el trade-off precisión/compresión en un mismo modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot Acc | Acc tras LoRA | Delta vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8%) | 59,52% | 72,94% | -18,69% |
| **128** ⭐ | **2,39x** | **45.792.002 (-58,2%)** | **52,41%** | **73,51%** | **-18,12%** |
| 64 | 3,11x | 35.170.562 (-67,9%) | 51,38% | 68,81% | -22,82% |
| 32 | — | — | FAIL_CRASH | — | — |

El checkpoint publicado es el de k=128, con accuracy 73,51% en validación de GLUE SST-2 (872 muestras). El modelo profesor (BERT-base fine-tuneado en SST-2) alcanza 91,63% según la misma fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (45,8 M de parámetros ≈ 183 MB de pesos, más activaciones y overhead de framework); en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, GTX 1660 y similares; también en CPU para inferencia por lotes.
- Opciones de despliegue: requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict con `strict=False`; también se puede usar la API `load_surgeried_model` del hub de NeuralOps. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| bert-comp-saes-svd-v2-sst2 (k=128) | 45,8 M | no disponible | 73,51% | MIT | Hugging Face (neuralops) |
| google-bert/bert-base-uncased (fine-tune SST-2, profesor) | 109,5 M | 512 tokens | 91,63% | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased (referencia de compresión estándar) | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros checkpoints NeuralOps del mismo zoo (k=256, k=64) | 67,0 M / 35,2 M | no disponible | 72,94% / 68,81% | MIT | Hugging Face |

La comparación con DistilBERT se incluye como referencia de tamaño, pero no se dispone de su accuracy SST-2 en la información proporcionada, por lo que no se establece comparación numérica directa.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 18,12 puntos porcentuales por debajo del modelo profesor en SST-2 (73,51% frente a 91,63%), lo que limita su uso en producción donde se requiera alta exactitud.
- El healing LoRA se entrenó durante solo 50 pasos con un presupuesto de 45 segundos; no hay garantía de que la recuperación sea óptima ni de que generalice fuera del split de validación.
- El rank k=32 falló con `FAIL_CRASH`, lo que indica que el pipeline de compresión no es estable en todos los regímenes de compresión.
- Sesgos: hereda los sesgos de bert-base-uncased y del dataset SST-2 (reseñas de películas en inglés); no se documenta ningún análisis de sesgo específico.
- Riesgo de alucinación: al ser un clasificador binario, no genera texto, pero puede producir etiquetas erróneas con alta confianza en dominios distintos al de entrenamiento.
- Limitación de idioma: solo inglés; el tokenizador uncased y el fine-tune en SST-2 no garantizan un comportamiento correcto en otros idiomas.
- Dependencia de la librería `neuralops`: la carga requiere reconstruir la topología comprimida antes de aplicar el state dict; no es un checkpoint estándar de `transformers` cargable directamente con `from_pretrained`.
- Licencia MIT permite uso comercial, pero el modelo base (bert-base-uncased) está bajo Apache 2.0; conviene revisar ambas compatibilidades en producción.
- El repositorio tiene 49 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados declarados.
- La model card referencia el repo `tahamajs/bert-comp-saes-svd-v2-sst2` mientras que el ID de Hugging Face es `Hooshaai/bert-comp-saes-svd-v2-sst2`; conviene verificar cuál es el repositorio canónico antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-saes-svd-v2-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor SAES-SVD v2: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/saes_svd_v2.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
