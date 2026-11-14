# Hooshaai/bert-comp-slim-compressor-sst2

## Resumen

`bert-comp-slim-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta 768) fine-tuneado sobre GLUE SST-2 y posteriormente procesado con el compresor `SLiMCompressor` de la libreria NeuralOps. El modelo lo publica el usuario Hooshaai (el codigo de referencia apunta al repositorio `tahamajs/NeuralOps`) como parte de un zoo de modelos comprimidos orientado a experimentacion con tecnicas de compresion estructurada de bajo rango.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio de compresion neuronal con evaluacion Pareto multi-rango (k=256, 128, 64 y 32) sobre la particion de validacion de SST-2 (872 muestras). Por otro, expone un resultado que conviene leer con cautela: el checkpoint publicado declara un ratio de compresion fisica de 1,00x (0,0 % de parametros eliminados) y una precision de validacion del 67,55 % frente al 91,63 % del modelo profesor, es decir, una perdida de 24,08 puntos porcentuales sin ninguna reduccion de tamano efectiva.

El modelo no es un sustituto de BERT-base para produccion en analisis de sentimiento. Es un artefacto de investigacion util para reproducir y auditar el comportamiento del compresor `slim_compressor` de NeuralOps, y como referencia negativa sobre cuando una compresion no aporta ganancia de eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, 12 capas, D=768), con topologia comprimida por `SLiMCompressor` (low-rank + cuantizacion + sparsity 2:4 + correccion de residuo SVD) |
| Parametros totales | 109.483.778 (sin reduccion respecto al modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-base-uncased soporta 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | El compresor declara cuantizacion como componente de SLiM; los tipos concretos (int8, int4, etc.) no estan detallados en la informacion disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en formato estandar `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La base es un BERT-base estandar: transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y aproximadamente 109,5 millones de parametros, preentrenado por Google sobre corpus en ingles y aqui adaptado a clasificacion binaria de sentimiento (2 etiquetas) mediante fine-tuning sobre GLUE SST-2. Sobre ese checkpoint se aplica `SLiMCompressor`, registrado en NeuralOps como `slim_compressor` dentro de la familia `low_rank`. La tecnica combina compresion de bajo rango, cuantizacion, sparsity estructurada 2:4 y una correccion de residuo via SVD.

El pipeline de NeuralOps evalua varios rangos (k=256, 128, 64, 32) y aplica un "healing" con LoRA de r=8 (50 pasos, learning rate 2e-4, presupuesto de 45 segundos) cuando la caida zero-shot supera el 2,0 % de precision y la reduccion supera 1,10x. En este repositorio el checkpoint serializado corresponde a k=256, con `LoRA Recovery Applied: False` y sin reduccion fisica de parametros (1,000x de ratio). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de GLUE SST-2, ni si hubo RLHF o DPO (no aplica en un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre textos cortos, tipico de resenas tipo SST-2.
- Inferencia sobre texto tokenizado con el vocabulario estandar de `bert-base-uncased`.
- Exportacion de logits de 2 clases mediante `BertForSequenceClassification`.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; el vocabulario `uncased` no cubre de forma fiable otros idiomas.
- Integracion con la API `load_surgeried_model` de NeuralOps Hub para carga en una linea.

## Casos de uso

- Auditoria de compresion neuronal: sirve para reproducir el pipeline `slim_compressor` de NeuralOps sobre BERT-base y comparar la curva Pareto k=256/128/64/32 con la metrica de validacion SST-2. Es su uso principal, dado que el checkpoint no aporta eficiencia real.
- Referencia negativa en experimentos: util como baseline de "compresion sin ganancia" (ratio 1,00x, caida de 24,08 pp) para contrastar con compresores que si reducen parametros de forma efectiva.
- Docencia e investigacion en compresion de modelos: permite mostrar en un cuaderno reproducible como una tecnica de bajo rango con sparsity y SVD puede degradar la precision si no se acompana de reduccion fisica.
- Pruebas de integracion de NeuralOps: valida el flujo `compress_model` + `load_state_dict(strict=False)` + `eval()` en pipelines propios antes de aplicarlo a modelos mayores.
- Analisis de sentimiento en prototipos internos en ingles: con la advertencia de que la precision del 67,55 % esta muy por debajo de BERT-base (91,63 %) y de un clasificador logistico simple sobre TF-IDF en SST-2, por lo que no es apto para produccion.
- Benchmarking de infraestructura: al pesar 451,9 MB y caber en cualquier GPU consumer, sirve para medir latencia y throughput de frameworks de inferencia (PyTorch, ONNX Runtime) sin consumir recursos de modelos grandes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / variante | Dataset | Split | Accuracy |
|---|---|---|---|
| `bert-comp-slim-compressor-sst2` (k=256, publicado) | GLUE SST-2 | validation (872 muestras) | 67,55 % |
| Variante k=128 | GLUE SST-2 | validation | 58,37 % |
| Variante k=64 | GLUE SST-2 | validation | 51,95 % |
| Variante k=32 | GLUE SST-2 | validation | 55,05 % |
| Profesor `bert-base-uncased` fine-tuneado SST-2 | GLUE SST-2 | validation | 91,63 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, lo cual es esperable al tratarse de un clasificador. Tampoco se aportan metricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB de pesos mas activaciones; inferior a 1 GB en la practica.
- VRAM estimada en fp16: aproximadamente 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo con `transformers` y el paquete `neuralops` (necesario para reconstruir la topologia comprimida antes de cargar el state dict). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-slim-compressor-sst2` (k=256) | 109,5 M | no disponible | 67,55 % | MIT | Hugging Face (41 descargas) |
| `google-bert/bert-base-uncased` fine-tuneado SST-2 (profesor) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

La comparativa muestra que el checkpoint comprimido no reduce parametros frente al profesor y pierde mas de 24 puntos de precision, por lo que en terminos practicos no compite con alternativas de la misma categoria. La ventaja diferencial es exclusivamente metodologica: expone el comportamiento del compresor NeuralOps.

## Limitaciones y advertencias

- Precision muy inferior al modelo base: 67,55 % frente a 91,63 % en SST-2 validation, una caida de 24,08 puntos porcentuales.
- Sin ganancia de eficiencia: el ratio de compresion fisica es 1,00x y la reduccion de parametros es del 0,00 %, por lo que no ahorra memoria ni tiempo de inferencia respecto a BERT-base.
- Dependencia de la libreria `neuralops` para reconstruir la topologia comprimida; no es cargable directamente con `transformers` sin ese paso previo.
- Solo ingles; no apto para analisis de sentimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador), pero si hay riesgo de predicciones erroneas sistematicas dado el bajo rendimiento.
- Sesgos heredados de `bert-base-uncased` y de SST-2 (resenas de peliculas en ingles, dominio estrecho); no se documenta ninguna mitigacion.
- Licencia MIT, permite uso comercial, pero el estado degradado del modelo desaconseja su uso en produccion.
- Resultados marcados como `verified: false`; no han sido auditados de forma independiente.
- El repositorio apunta a `tahamajs/NeuralOps` en el codigo de ejemplo mientras que el propietario en Hugging Face es `Hooshaai`; conviene verificar la procedencia antes de integrarlo.
- Fecha de creacion en el repositorio (2026-11-10) posterior a la fecha actual de redaccion, lo que sugiere un posible error de metadatos o una publicacion programada; conviene contrastar antes de citar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-slim-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/slim_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
