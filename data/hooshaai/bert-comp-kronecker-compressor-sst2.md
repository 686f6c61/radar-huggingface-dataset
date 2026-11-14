# Hooshaai/bert-comp-kronecker-compressor-sst2

## Resumen

`bert-comp-kronecker-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta D=768) afinado sobre GLUE SST-2 y sometido a una descomposicion tensorial de tipo Kronecker mediante la libreria NeuralOps, desarrollada por el usuario Hooshaai (repositorio `tahamajs/NeuralOps`). El objetivo declarado es demostrar la viabilidad de comprimir fisicamente un transformer BERT clasico reduciendo su numero de parametros un 55,76 % (de 109,5 M a 48,4 M, factor 2,26x) manteniendo la topologia funcional del modelo original.

El modelo se enmarca en el llamado "Compressed & LoRA-Healed Model Zoo" de NeuralOps: tras la compresion se aplica un proceso de "curacion" mediante LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos por variante, con el fin de recuperar parte de la precision perdida. Se publican cuatro rangos de compresion evaluados (k=256, 128, 64 y 32), de los cuales el repositorio serializa el checkpoint de k=128.

La relevancia actual es acotada pero clara: sirve como referencia reproducible de compresion tensorial aplicada a BERT en una tarea de clasificacion de sentimiento (SST-2), y como base para estudiar el compromiso entre ratio de compresion y degradacion de accuracy. Los resultados son, sin embargo, muy pobres: la accuracy final en validacion es del 49,08 %, frente al 91,63 % del modelo profesor, lo que lo aleja de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768), comprimido con descomposicion Kronecker |
| Parametros totales | 48.436.994 (checkpoint empaquetado, k=128); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de `bert-base-uncased`, 512 tokens, no confirmada por el autor) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` en precision de entrenamiento) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un BERT-base estandar: transformer encoder de 12 capas, 12 cabezas de atencion y dimension oculta 768, con 109.483.778 parametros. Sobre esta base, NeuralOps aplica el compresor `kronecker_compressor` (familia `tensor_decomp`, clase `kronecker_factory`), que descompone tensores en factores de rango k. El checkpoint empaquetado corresponde a k=128, con 48.436.994 parametros tras la compresion (-55,76 %, ratio fisico 2,26x). El proceso incluye ademas un "LoRA healing" con adaptadores de rango r=8, entrenados durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, que se hornean en el state dict final.

El afinamiento original se realizo sobre GLUE SST-2 (clasificacion binaria de sentimiento, etiquetas 0=negativo, 1=positivo) partiendo de `bert-base-uncased`. La evaluacion se hizo sobre el split de validacion de SST-2 con 872 muestras, en una NVIDIA GeForce RTX 3090 de 24 GB. No se especifican en la informacion disponible el numero de tokens de entrenamiento del afinamiento original, la composicion del dataset mas alla de GLUE SST-2, ni si hubo RLHF/DPO (no aplica a una tarea de clasificacion). La innovacion tecnica destacable es la propia descomposicion Kronecker con curacion LoRA selectiva: se activa cuando la compresion en zero-shot degrada mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (SST-2): salida de 2 logits (negativo/positivo).
- Razonamiento linguistico limitado: al ser un BERT-base afinado para clasificacion, no genera texto libre ni mantiene conversaciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no, solo ingles.
- No dispone de modo "thinking", vision ni audio.
- Capacidad de reconstruccion: el checkpoint puede recargarse sobre la topologia comprimida de NeuralOps mediante `compress_model` y `load_state_dict(strict=False)`.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible para medir la perdida de accuracy al aplicar descomposicion Kronecker con distintos rangos (k=256, 128, 64, 32) sobre BERT-base en SST-2.
- Benchmarking de pipelines de compresion: util para validar el motor `kronecker_compressor` de NeuralOps y su integracion con LoRA healing en un caso controlado y de bajo coste computacional.
- Docencia y divulgacion: ejemplo practico de como la compresion tensorial agresiva degrada tareas de clasificacion incluso tras curacion LoRA, con telemetria publicada en `compression_summary.json`.
- Pruebas de integracion de la libreria NeuralOps: validacion de la API `load_surgeried_model` y del flujo de reconstruccion + carga de pesos comprimidos.
- Prototipado de clasificadores de bajo coste en entornos con restricciones de memoria: el checkpoint de 92,5 MB ocupa menos que el BERT-base original, aunque su precision (49,08 %) lo hace inviable para decisiones reales.
- Analisis de Pareto compresion/precision: la tabla multi-rango publicada permite estudiar el trade-off y decidir si merece la pena subir a k=256 (ratio 1,57x, accuracy 50,92 %) frente a k=64 (ratio 2,90x, accuracy 49,08 %).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, split de validacion (872 muestras), en RTX 3090:

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy tras LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,57x | 69.670.658 (-36,4 %) | 59,40 % | 50,92 % | -40,71 % |
| 128 (empaquetado) | 2,26x | 48.436.994 (-55,8 %) | 52,52 % | 49,08 % | -42,55 % |
| 64 | 2,90x | 37.820.162 (-65,5 %) | 51,38 % | 49,08 % | -42,55 % |
| 32 | No disponible | No disponible | FAIL_CRASH | No disponible | No disponible |

Referencia del modelo profesor (`bert-base-uncased` afinado en SST-2): 91,63 % de accuracy. El checkpoint empaquetado (k=128) obtiene 49,08 % de accuracy en validacion, es decir, 42,55 puntos porcentuales por debajo del profesor y practicamente al nivel del azar en una tarea binaria.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 92,5 MB en `pytorch_model.bin`, por lo que la inferencia en FP32 requiere aproximadamente 0,4 GB de VRAM incluyendo activaciones y tokenizador; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluo en una NVIDIA GeForce RTX 3090 (24 GB), sobredimensionada para este modelo.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el flujo oficial es via `neuralops.hub.load_surgeried_model` o reconstruccion manual con `compress_model` + `load_state_dict`. Al ser un `pytorch_model.bin` con topologia comprimida no estandar, no es compatible directamente con `AutoModelForSequenceClassification.from_pretrained` sin el paso de reconstruccion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Formato |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-kronecker-compressor-sst2` (k=128) | 48,4 M | No disponible | 49,08 % | MIT | `pytorch_model.bin` (NeuralOps) |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,5 M | 512 | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased` afinado en SST-2 | 66 M | 512 | No disponible en la informacion | Apache 2.0 | safetensors / PyTorch |
| `prajjwal1/bert-tiny` afinado en SST-2 | 4,4 M | 512 | No disponible en la informacion | Apache 2.0 | safetensors / PyTorch |

La comparativa muestra que el checkpoint comprimido no es competitivo en precision frente a alternativas de tamano similar o incluso mucho menor (DistilBERT, BERT-tiny), si bien estas ultimas no tienen resultados declarados en la informacion disponible para una comparacion directa.

## Limitaciones y advertencias

- Precision muy degradada: 49,08 % en SST-2 frente al 91,63 % del profesor, lo que equivale a un rendimiento cercano al azar en una clasificacion binaria. No es apto para uso en produccion.
- El proceso de LoRA healing empeora el resultado en zero-shot en varios rangos (por ejemplo, k=128 pasa de 52,52 % a 49,08 %), lo que sugiere inestabilidad en la curacion.
- El rango k=32 falla con `FAIL_CRASH`, lo que indica fragilidad del compresor en regimenes agresivos.
- Sesgos conocidos: hereda los sesgos de `bert-base-uncased` (corpus ingles, fundamentalmente web), agravados por la compresion y por el ajuste limitado a SST-2.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si hay riesgo de clasificaciones erroneas con alta confianza.
- Limitacion de idioma: solo ingles; no se ha evaluado en castellano ni en otros idiomas.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` esta bajo Apache 2.0, cuyos terminos deben respetarse igualmente.
- Dependencia de la libreria NeuralOps para cargar el checkpoint: no es un modelo plug-and-play con `transformers` estandar.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados (`verified: false`).
- El repositorio tiene muy poca traccion (46 descargas, 0 likes) y fue creado en noviembre de 2026, por lo que no hay validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-kronecker-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor Kronecker: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/kronecker_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
