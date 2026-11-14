# Hooshaai/bert-comp-flat-llm-sst2

## Resumen

`bert-comp-flat-llm-sst2` es un checkpoint experimental de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) fine-tuneado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido con el motor `flat_llm` (`FLATLLMCompressor`) de la librería NeuralOps. El autor es Hooshaai y el modelo se publica bajo licencia MIT. No es un LLM generativo pese a la etiqueta "flat-llm" del nombre: es un clasificador binario de sentimiento (positivo/negativo) en inglés.

La compresión aplicada es un pruning de canales de salida consciente de la activación (activation-aware output-channel pruning): se recoge la energía por canal de salida en un conjunto de calibración, se ordenan los canales por energía y se conservan los top-k, sustituyendo cada capa `Linear` por una `PrunedChannelLinear` con almacenamiento factorizado. El checkpoint empaquetado corresponde al rango `k=32`, con 84.004.322 parámetros resultantes (reducción del 23,27 %, ratio de compresión físico de 1,303x) y curación LoRA (`r=8`, 50 pasos, `lr=2e-4`) para recuperar parte de la precisión perdida.

Su relevancia es metodológica más que práctica: sirve como referencia reproducible de un pipeline de compresión + healing sobre un transformer encoder pequeño, con telemetría completa en `compression_summary.json` y evaluación Pareto en cuatro rangos. El resultado, sin embargo, es un descenso de 13,53 puntos de accuracy frente al profesor (91,63 % → 78,10 %), lo que lo sitúa lejos de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, D=768; capas Linear sustituidas por PrunedChannelLinear tras pruning de canales de salida |
| Parametros totales | 84.004.322 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT acepta hasta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | No disponible; el artefacto se distribuye en `pytorch_model.bin` (float, sin cuantizacion declarada) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La base es BERT-base uncased, un transformer encoder bidireccional con 12 capas y 768 dimensiones ocultas, fine-tuneado previamente sobre GLUE SST-2 (el profesor alcanza 91,63 % de accuracy). Sobre ese checkpoint se aplica el compresor `flat_llm` de NeuralOps, que opera en cuatro pasos: recolección de energía por canal de salida a partir de activaciones de calibración, ranking de canales, retención de los top-k (`k = round(keep_ratio * out_features)`) y sustitución de cada `Linear` por una capa factorizada que solo conserva los canales seleccionados. Opcionalmente admite sparsity estructurada 2:4, aunque esta es de solo cómputo y no reduce el almacenamiento salvo que se use un kernel disperso.

El pipeline incorpora una fase de "healing" con LoRA: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se aplican adaptadores LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En este checkpoint el healing recupera 8,83 puntos (69,27 % → 78,10 %), pero no cierra la brecha con el profesor. La evaluación Pareto se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). Los cuatro rangos evaluados (256, 128, 64 y 32) producen el mismo recuento de parámetros y la misma accuracy, lo que sugiere que el pruning efectivo queda limitado por la estructura de las capas y no escala con `k` en este rango.

## Capacidades

- Clasificación binaria de sentimiento (0 = negativo, 1 = positivo) sobre texto en inglés, con una única etiqueta de salida por secuencia.
- Fine-tuning específico sobre GLUE SST-2; no se declaran capacidades zero-shot ni de generalización a otras tareas de clasificación.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés; el vocabulario es el de `bert-base-uncased`.
- No dispone de modo "thinking", ni capacidades de audio o multimodalidad.

## Casos de uso

- **Análisis de sentimiento en reseñas de producto en inglés**: el modelo clasifica cada reseña en positiva o negativa con una pasada forward; su tamaño reducido (160,8 MB de pesos) permite desplegarlo en CPU para volúmenes moderados, aunque con la advertencia de la caída de accuracy frente al profesor.
- **Filtrado previo en pipelines de moderación de contenido**: usar la salida del clasificador como señal auxiliar de polaridad antes de enviar el texto a un modelo mayor; su bajo coste de inferencia lo hace apto como primera etapa de un clasificador en cascada.
- **Etiquetado débil de corpus no anotados**: generar etiquetas preliminares de sentimiento sobre grandes volúmenes de texto inglés para su posterior revisión humana o para entrenar un modelo destilado, asumiendo el ruido de una accuracy del 78,10 %.
- **Reproducción de investigación en compresión de modelos**: el repositorio incluye `compression_summary.json` con telemetría de los cuatro rangos evaluados, lo que permite replicar el pipeline `flat_llm` + LoRA healing sobre BERT-base y comparar metodologías de pruning.
- **Banco de pruebas de integración con NeuralOps**: sirve para validar el flujo de reconstrucción (`compress_model` + `load_state_dict` con `strict=False`) antes de aplicar el mismo motor a modelos de mayor tamaño.
- **Monitorización de opinión en redes sociales en inglés**: clasificación por lotes de menciones o tuits para agregar tendencia de polaridad, siempre que se acepte un margen de error superior al de un BERT-base sin comprimir.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por un tercero):

| Metrica | Valor |
|---|---|
| GLUE SST-2, validation, accuracy (checkpoint final, k=32) | 78,10 % |
| GLUE SST-2, validation, accuracy (zero-shot tras compresion) | 69,27 % |
| GLUE SST-2, validation, accuracy (profesor BERT-base) | 91,63 % |
| Delta de paridad frente al profesor | -13,53 % |
| Muestras de evaluacion | 872 (split de validacion GLUE SST-2) |
| Hardware de evaluacion | NVIDIA GeForce RTX 3090 (24 GB) |

Evaluación Pareto por rango declarada por el autor:

| Rango (k) | Ratio fisico | Parametros comprimidos | Accuracy zero-shot | Accuracy con LoRA | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % | -13,53 % |
| 128 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % | -13,53 % |
| 64 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % | -13,53 % |
| 32 | 1,30x | 84.004.322 (-23,3 %) | 69,27 % | 78,10 % | -13,53 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (84 M de parámetros, aproximadamente 336 MB de pesos más activaciones y overhead); el repositorio ocupa 0,2 GB y los pesos empaquetados 160,8 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor evaluó en una RTX 3090 (24 GB) por comodidad, no por necesidad.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere la librería `neuralops` para reconstruir la topología comprimida (`compress_model` con `method: flat_llm, rank: 32`) antes de cargar el state dict con `strict=False`; no se declara compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI, al no existir pesos GGUF ni un formato estándar de transformers para la topología podada.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo declara un presupuesto de 45 segundos para la fase de healing LoRA, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-flat-llm-sst2` (k=32) | 84.004.322 | no disponible | 78,10 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor, fine-tune SST-2) | 109.483.778 | 512 tokens (arquitectura) | 91,63 % | Apache 2.0 | Hugging Face, transformers estandar |
| DistilBERT-base fine-tuneado en SST-2 | ~66 M | 512 tokens (arquitectura) | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers estandar |
| RoBERTa-base fine-tuneado en SST-2 | ~125 M | 512 tokens (arquitectura) | no disponible en la informacion proporcionada | MIT | Hugging Face, transformers estandar |

La comparación relevante es interna: el checkpoint comprimido pierde 13,53 puntos de accuracy frente a su propio profesor a cambio de una reducción del 23,27 % en parámetros. DistilBERT, con una reducción de parámetros comparable o superior, es un punto de referencia habitual para este tipo de compromiso, aunque no se dispone de sus cifras exactas en la informacion proporcionada.

## Limitaciones y advertencias

- **Pérdida de accuracy significativa**: 78,10 % frente al 91,63 % del profesor; un descenso de 13,53 puntos es difícil de justificar en producción para una reducción de solo el 23,27 % de parámetros.
- **Etiqueta "experimental"**: el compresor `FLATLLMCompressor` está marcado como experimental en la librería NeuralOps; la API y el formato del state dict pueden cambiar sin compatibilidad hacia atrás.
- **Dependencia de la librería `neuralops`**: no es un checkpoint cargable con `transformers` de forma directa; requiere reconstruir la topología con `compress_model` y cargar con `strict=False`, lo que añade riesgo de fallos silenciosos si la topología no coincide exactamente.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en textos ambiguos, sarcásticos o de dominio alejado de SST-2 (reseñas de películas).
- **Sesgos**: no se documentan análisis de sesgo; al derivar de BERT-base uncased y de SST-2, hereda los sesgos de dominio y de anotación del corpus, con posible sensibilidad a variantes dialectales o de registro.
- **Idioma**: solo inglés; el tokenizador `bert-base-uncased` no está pensado para otros idiomas.
- **Resultados no verificados**: la métrica del model-index figura con `verified: false`; los cuatro rangos producen cifras idénticas, lo que sugiere que el pruning efectivo no varía con `k` en el rango evaluado y conviene tratar la tabla Pareto con cautela.
- **Licencia MIT**: permite uso comercial, pero el aviso de licencia enlaza al LICENSE del repositorio de NeuralOps; conviene revisar que la licencia del modelo base (Apache 2.0) y la del código de la librería sean compatibles con el uso previsto.
- **Sin soporte de cuantización declarado**: no hay pesos GGUF ni versiones cuantizadas publicadas, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-flat-llm-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `flat_llm`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/flat_llm.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
