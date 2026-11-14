# Hooshaai/bert-comp-flap-sst2

## Resumen

`Hooshaai/bert-comp-flap-sst2` es un checkpoint de `google-bert/bert-base-uncased` (12 capas, dimensión oculta 768, 109.483.778 parámetros) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el compresor `FLAPCompressor` (Fluctuation-based Adaptive Structured Pruning) de la librería NeuralOps. El modelo lo publica el usuario Hooshaai dentro del "NeuralOps Compressed & LoRA-Healed Model Zoo", un catálogo de variantes comprimidas de modelos estándar generadas con esa herramienta.

El resultado declarado es un checkpoint con ratio de compresión físico de 1,00x y una reducción de parámetros del 0,00 %, es decir, el proceso de compresión no elimina parámetros en la configuración serializada (rank `k=32`). La accuracy en la partición de validación de SST-2 (872 muestras) es del 91,63 %, idéntica a la del modelo profesor de referencia. El checkpoint se presenta como ejemplo del uso del motor de poda de NeuralOps más que como una alternativa eficiente al BERT original.

Es relevante ahora por dos motivos: por un lado, documenta un flujo de compresión estructurada con validación de error de reconstrucción de Frobenius relativo y fallback seguro al módulo original; por otro, la evaluación multi-rank publicada (k=256, 128, 64, 32) muestra que las configuraciones con mayor poda degradan gravemente la accuracy (61,70 % y 51,15 %), lo que conviene tener en cuenta antes de reutilizar el pipeline en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, D=768), cabeza de clasificación de 2 etiquetas |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base BERT acepta hasta 512 tokens, pero no se confirma en la ficha) |
| Tipos de cuantización | No disponible; el artefacto se distribuye en `pytorch_model.bin` (fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, afinado previamente para clasificación binaria de sentimiento en GLUE SST-2. Sobre ese checkpoint se aplica `FLAPCompressor`, un motor de poda estructurada adaptativa basada en fluctuaciones que soporta módulos `LoRALinear` y `Conv1D` (con transposición y preservación de adaptadores) y permite restringir la poda a las proyecciones de atención mediante `target_attention_only`. El compresor valida el error de reconstrucción de Frobenius relativo con un umbral configurable (`max_error`) y hace fallback al módulo original si se supera.

En la configuración publicada (rank `k=32`) no se aplica recuperación LoRA (`LoRA Recovery Applied: False`) y el recuento de parámetros comprimidos coincide con el del modelo base, de modo que la "compresión" es nominal (1,000x). La evaluación multi-rank se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2; según la model card, cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x, NeuralOps aplica un "healing" LoRA dirigido con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En los ranks publicados no se observa mejora tras el healing.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Extracción de representaciones contextuales de BERT-base, reutilizables para otras tareas de NLP mediante fine-tuning.
- Inferencia por lotes con tokenizer estándar `bert-base-uncased`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe limitada al inglés (modelo `uncased`).
- Integración con la API universal de NeuralOps Hub (`load_surgeried_model`) para carga en una línea.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo está afinado específicamente en SST-2 y ofrece un 91,63 % de accuracy en validación, suficiente para filtrado automático de opiniones negativas en un pipeline de soporte.
- Moderación de comentarios a pequeña escala: al ser un BERT-base de 109 M de parámetros, cabe en GPU consumer y permite clasificar lotes de textos con baja latencia en un servicio interno.
- Etiquetado automático de datasets de sentimiento: se puede usar como pre-etiquetador para reducir el coste de anotación manual antes de una revisión humana.
- Baseline en experimentos de compresión de modelos: el repositorio incluye `compression_summary.json` con la telemetría de los ranks evaluados, útil para comparar el efecto de FLAP frente a otras técnicas de poda.
- Extracción de embeddings para clustering de opiniones: las representaciones del encoder sirven para agrupar reseñas por temática antes de un análisis más profundo.
- Prototipado rápido con la API de NeuralOps: el ejemplo de carga en una línea (`load_surgeried_model`) permite integrar el modelo en notebooks o scripts de evaluación sin gestionar manualmente el proceso de compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras healing | Diferencia vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 61,70 % | 61,70 % | -29,93 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 51,15 % | 51,15 % | -40,48 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 32 (publicado) | 1,00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras) en una RTX 3090. La métrica declarada en el `model-index` es accuracy = 91,63 % (no verificada).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (109 M parámetros × 4 bytes) más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: RTX 3090 (la usada en la evaluación del autor), A100, H100, RTX 4090; también funciona en GPUs de gama media como RTX 3060.
- Cabe en GPU consumer sin problema; incluso puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `transformers`, la API de NeuralOps (`load_surgeried_model`), y potencialmente `vLLM` o `TGI` si se convierte el checkpoint a un formato compatible (no documentado en la ficha). No se distribuye en GGUF, por lo que `llama.cpp` u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-flap-sst2` | 109.483.778 | No disponible | 91,63 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | ~109 M | 512 tokens | No disponible en la información | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | No disponible en la información | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos disponibles; no se han encontrado resultados de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no aplica una compresión física real en el rank publicado (1,00x, -0,00 % de parámetros), por lo que no ofrece ninguna ventaja de tamaño frente al BERT-base original.
- Los ranks con poda efectiva (k=256 y k=128) degradan la accuracy hasta el 61,70 % y el 51,15 %, lo que sugiere que el pipeline FLAP no está bien calibrado para este modelo en esas configuraciones.
- El "healing" LoRA no mejora la accuracy en ninguno de los ranks evaluados según los datos del autor.
- Modelo entrenado y evaluado únicamente en inglés; no se recomienda su uso en otros idiomas.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí puede producir etiquetas erróneas en dominios distintos de SST-2 (por ejemplo, sentimiento en dominios técnicos o con sarcasmo).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), que no representan la distribución de otros dominios.
- La licencia MIT del repositorio no cubre necesariamente los términos del modelo base (Apache 2.0); conviene revisar ambas antes de un uso comercial.
- El código de ejemplo de la model card referencia `repo_id = "tahamajs/bert-comp-flap-sst2"` mientras que el repositorio real es `Hooshaai/bert-comp-flap-sst2`; es necesario ajustar el identificador.
- Requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el state dict; no es un checkpoint estándar de `transformers` cargable directamente.
- La fecha de creación del repositorio (2026-11-10) es posterior a la fecha actual, lo que puede indicar un error en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-flap-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor FLAP: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/flap.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
