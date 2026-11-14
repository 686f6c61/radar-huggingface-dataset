# Hooshaai/bert-comp-tt-compressor-sst2

## Resumen

`bert-comp-tt-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante descomposición tensorial tipo Tensor Train (TT) y posteriormente "curado" con LoRA, publicado por el autor Hooshaai dentro del ecosistema NeuralOps. Parte de `google-bert/bert-base-uncased` (109,5 M de parámetros, 12 capas, dimensión oculta 768) afinado previamente sobre GLUE SST-2, y lo reduce a 63,9 M de parámetros activos mediante el motor `TTCompressor`, que sustituye capas Linear/Conv1D por `TTLinearLayer` y recurre a `SVDLinearLayer` como respaldo cuando la descomposición TT no cumple el presupuesto de error.

El modelo resuelve un problema muy concreto: evaluar hasta qué punto se puede comprimir un transformer encoder clásico manteniendo una tarea downstream funcional (clasificación de sentimiento binaria). Frente al baseline docente de 91,63 % de accuracy en SST-2, el checkpoint publicado alcanza 75,69 % tras el healing LoRA, lo que supone una pérdida de 15,94 puntos de paridad. No es, por tanto, un modelo pensado para producción directa, sino un artefacto de investigación reproducible sobre compresión física de pesos.

Es relevante ahora porque ejemplifica una tendencia creciente: publicar no solo modelos finales, sino "zoos" de compresión con telemetría completa (ratio físico, parámetros reducidos, accuracy zero-shot y tras healing) para cada rango evaluado. El repositorio incluye el checkpoint serializado a rango k=256, la configuración etiquetada con `compression_method: "tt_compressor"` y un `compression_summary.json` con los cuatro rangos evaluados (256, 128, 64 y 32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas Linear/Conv1D sustituidas por TTLinearLayer / SVDLinearLayer |
| Parametros totales | 63.870.722 (checkpoint comprimido, k=256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (BERT-Base original: 512 tokens) |
| Tipos de cuantizacion | No disponible; los pesos se serializan en `pytorch_model.bin` con factores de bajo rango y adaptadores LoRA integrados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de topologia NeuralOps |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base uncased: 12 capas de transformer encoder, dimensión oculta 768 y 109.483.778 parámetros, afinado sobre GLUE SST-2. Sobre ese modelo se aplica el compresor `tt_compressor` de NeuralOps, que recorre las capas Linear/Conv1D e intenta reemplazarlas por una descomposición Tensor Train de rango k; si la TT no alcanza el presupuesto de error, se prueba SVD y, si ninguna funciona, la capa queda intacta. En el checkpoint publicado (k=256) el resultado es una reducción del 41,66 % de parámetros y un ratio de compresión físico de 1,714x.

El proceso de "healing" es relevante: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica LoRA dirigido con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. Para k=256 esto recupera la accuracy de 71,44 % (zero-shot) a 75,69 %. La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) usando el split de validación de GLUE SST-2 con 872 muestras. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF/DPO (no aplica en un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, formato SST-2.
- Generación de logits de clasificación de 2 clases; no genera texto libre.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión ni audio.
- Reconstrucción programática mediante la API `compress_model` de NeuralOps o `load_surgeried_model` del Hub API.

## Casos de uso

- Investigación en compresión de modelos: servir como punto de comparación reproducible frente a otras técnicas (pruning, quantización, SVD) sobre el mismo BERT-Base afinado en SST-2, ya que el repo incluye telemetría de cuatro rangos distintos.
- Estudio del trade-off precisión/compresión: analizar la curva de Pareto (k=256 → 75,69 %, k=128 → 72,59 %, k=64 → 50,92 %, k=32 → 50,92 %) para decidir qué rango es aceptable en un despliegue concreto.
- Validación de pipelines de "LoRA healing": reproducir el protocolo r=8, 50 pasos, lr=2e-4 y 45 s de presupuesto para medir cuánta accuracy se recupera tras compresión agresiva.
- Prototipado de clasificadores de sentimiento de bajo coste en entornos con restricciones de memoria, aceptando la pérdida de ~16 puntos frente al docente.
- Benchmark de motores de compresión: comparar `tt_compressor` con otros compresores del zoo NeuralOps sobre la misma tarea y el mismo hardware (RTX 3090, 24 GB).
- Docencia y experimentación: ejemplo didáctico de cómo se serializa un modelo comprimido (factores de bajo rango + adaptadores LoRA en un único `state_dict`) y cómo se reconstruye la topología en tiempo de carga.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`) sobre GLUE SST-2, split de validación (872 muestras):

| Rank (k) | Ratio fisico | Parametros (reduccion) | Accuracy zero-shot | Accuracy tras LoRA | Paridad vs docente (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (checkpoint publicado) | 1,71x | 63.870.722 (-41,7 %) | 71,44 % | **75,69 %** | -15,94 % |
| 128 | 2,48x | 44.209.922 (-59,6 %) | 67,89 % | 72,59 % | -19,04 % |
| 64 | 3,19x | 34.379.522 (-68,6 %) | 50,92 % | 50,92 % | -40,71 % |
| 32 | 3,72x | 29.464.322 (-73,1 %) | 49,08 % | 50,92 % | -40,71 % |

El baseline docente (BERT-Base sin comprimir, afinado en SST-2) se sitúa en 91,63 % de accuracy según la model card. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint comprimido de 63,9 M de parámetros (~256 MB de pesos más activaciones y tokenizer). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor validó la evaluación en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU consumer: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia puntual.
- Opciones de despliegue: la carga requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el `state_dict`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa (no documentada en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-tt-compressor-sst2` (k=256) | 63,9 M | no disponible | 75,69 % | MIT | Hugging Face (requiere `neuralops`) |
| `google-bert/bert-base-uncased` (docente, afinado SST-2) | 109,5 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face, transformers |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Pérdida de accuracy considerable: 15,94 puntos frente al docente (75,69 % vs 91,63 %) en SST-2, lo que lo hace inadecuado para producción sin validación adicional.
- El checkpoint publicado solo corresponde al rango k=256; los rangos k=128, 64 y 32 se documentan pero no se serializan en este repositorio.
- La carga requiere la librería `neuralops` y reconstruir la topología con `compress_model` antes de aplicar el `state_dict` con `strict=False`; un `from_pretrained` estándar de transformers no funcionará.
- Solo inglés; el vocabulario `bert-base-uncased` no cubre otros idiomas.
- Tarea limitada a clasificación binaria de sentimiento; no es un modelo generativo.
- Riesgo de alucinación no aplica en sentido estricto (clasificador), pero sí de clasificaciones erróneas en dominios distintos del entrenamiento.
- Sesgos heredados de BERT-Base uncased y de SST-2 (reseñas de cine en inglés), no evaluados en la model card.
- Los resultados de benchmarks están marcados como `verified: false`; no han sido verificados de forma independiente.
- Licencia MIT, lo que permite uso comercial, pero la librería `neuralops` de la que depende puede tener condiciones propias.
- El repositorio tiene 47 descargas y 0 likes; es un artefacto de investigación con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-tt-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor TT: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/tt_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
