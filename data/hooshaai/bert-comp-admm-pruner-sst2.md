# Hooshaai/bert-comp-admm-pruner-sst2

## Resumen

`bert-comp-admm-pruner-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado sobre GLUE SST-2 y posteriormente procesado con el motor de compresion `ADMMPruner` de la libreria NeuralOps, desarrollada por el usuario Hooshaai. El objetivo declarado del proyecto es servir como banco de pruebas ("compressor zoo") de tecnicas de poda estructurada y semi-estructurada sobre transformers, combinando poda ADMM con reconstruccion por destilacion capa a capa y, opcionalmente, un "healing" posterior mediante LoRA.

El modelo resultante mantiene la arquitectura y el recuento de parametros originales de BERT-Base (109.483.778 parametros, 12 capas, dimension oculta 768). Segun la propia model card, la compresion fisica aplicada es de 1,00x, es decir, no se elimino ningun parametro en el checkpoint publicado, y la precision en la validacion de SST-2 cae hasta el 52,52 %, frente al 91,63 % del modelo profesor. Esto lo convierte en una pieza de interes para investigacion sobre pipelines de compresion y no en un clasificador de sentimiento utilizable en produccion.

La relevancia actual es metodologica: documenta con telemetria detallada (`compression_summary.json`) el comportamiento de un pruner ADMM a distintos rangos (k=256, 128, 64, 32) sobre una tarea estandar de GLUE, e ilustra el fallo del proceso de recuperacion cuando la compresion no reduce parametros pero si degrada la representacion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuye `pytorch_model.bin` en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), configuracion JSON y tokenizer BERT estandar |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-Base sin modificar en topologia: encoder transformer de 12 capas, 12 cabezas de atencion, dimension oculta 768 y 109.483.778 parametros, con una cabeza de clasificacion de 2 etiquetas para SST-2. Sobre esta base, el pipeline de NeuralOps aplica `ADMMPruner`, un pruner basado en el metodo de direcciones alternantes (ADMM) con reconstruccion por destilacion capa a capa, sparsity semi-estructurada 2:4, gradientes STE (straight-through estimator) y un calendario dinamico del parametro rho. El checkpoint publicado corresponde al rango k=32, seleccionado como "showcase" dentro de una evaluacion Pareto multi-rango.

El proceso de healing con LoRA (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) se activa solo cuando la compresion en zero-shot degrada mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x. En este checkpoint la condicion no se cumplio (ratio 1,00x), por lo que la model card indica `LoRA Recovery Applied: False` y la precision curada coincide con la de zero-shot. El resultado es un modelo con pesos alterados por el proceso ADMM pero sin reduccion efectiva de parametros y con una perdida severa de capacidad discriminativa.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre entradas de tipo SST-2, con precision real del 52,52 % en validacion.
- Codificacion de texto generica mediante el encoder BERT-Base subyacente, potencialmente reutilizable para extraccion de caracteristicas si se descarta la cabeza de clasificacion.
- No soporta tool calling ni function calling: es un modelo encoder-only de clasificacion, sin interfaz de instrucciones.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", vision, audio ni generacion de texto libre.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como referencia reproducible para comparar el efecto de `ADMMPruner` a distintos rangos (k=256, 128, 64, 32) sobre una tarea estandar de GLUE, usando `compression_summary.json` como telemetria.
- Benchmarking de pipelines de poda: util para validar la logica de activacion condicional del healing LoRA en NeuralOps, ya que documenta un caso en el que el criterio no se dispara.
- Docencia y divulgacion: ejemplo tangible de como una compresion mal calibrada (ratio 1,00x con perdida de 39 puntos) degrada un clasificador, util en materiales sobre evaluacion de modelos comprimidos.
- Pruebas de integracion de la libreria NeuralOps: el snippet de carga via `load_surgeried_model` permite verificar el correcto funcionamiento de la API del hub en entornos de desarrollo.
- Analisis de sparsity 2:4: permite estudiar el impacto de la mascara semi-estructurada sobre las matrices de atencion y feed-forward de BERT sin cambiar el recuento de parametros.
- Baseline negativo en experimentos de destilacion: sirve como punto de comparacion inferior frente al profesor (91,63 %) al evaluar tecnicas de recuperacion de precision.
- No es adecuado para analisis de sentimiento en produccion ni para clasificacion de resenas reales dado su nivel de acierto cercano al azar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / rango | Ratio fisico | Parametros | Precision SST-2 (validacion) | Delta vs profesor |
|---|---|---|---|---|
| Profesor (bert-base-uncased fine-tuned) | 1,00x | 109.483.778 | 91,63 % | referencia |
| admm_pruner k=256 | 1,00x | 109.483.778 | 51,38 % | -40,25 |
| admm_pruner k=128 | 1,00x | 109.483.778 | 51,03 % | -40,60 |
| admm_pruner k=64 | 1,00x | 109.483.778 | 50,92 % | -40,71 |
| admm_pruner k=32 (publicado) | 1,00x | 109.483.778 | 52,52 % | -39,11 |

La evaluacion se realizo sobre el split de validacion de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (208,9 MB) mas activaciones; en la practica cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida RTX 3060, RTX 4090, A100 o H100; el modelo es demasiado pequeno para aprovechar aceleradores de gama alta.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas modernas e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el checkpoint se distribuye como `pytorch_model.bin` y requiere reconstruir la topologia con `neuralops.core.compression_pipeline.compress_model` antes de cargar el state dict con `strict=False`. No se proporcionan pesos en formato GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son compatibles de forma directa sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card menciona un presupuesto de 45 s para el healing LoRA, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-admm-pruner-sst2` (este) | 109,5 M | 512 | 52,52 % | MIT | Hugging Face, formato PyTorch |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face, safetensors y PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, safetensors |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, PyTorch |

La comparativa se limita a modelos de la misma familia y tarea; no se dispone de datos de benchmarks de las alternativas en la informacion proporcionada mas alla del profesor declarado por el autor.

## Limitaciones y advertencias

- Precision de 52,52 % en SST-2, practicamente equivalente a un clasificador aleatorio binario; el modelo no es funcional para clasificacion de sentimiento real.
- La compresion declarada es de 1,00x, es decir, no se reduce el numero de parametros, por lo que no aporta beneficios de eficiencia frente al modelo base.
- Sesgos inheridos de `bert-base-uncased` y del corpus de SST-2 (resenas cinematograficas en ingles), no auditados ni mitigados en este checkpoint.
- Riesgo elevado de predicciones inconsistentes y de alucinacion en el sentido de clasificaciones sin fundamento, dado el bajo nivel de acierto.
- Limitacion idiomatica: solo ingles; el tokenizer `bert-base-uncased` no cubre adecuadamente el castellano.
- Restricciones de licencia: MIT permite uso comercial, pero la calidad del modelo desaconseja cualquier despliegue productivo.
- El proceso de carga requiere la libreria NeuralOps y reconstruir la topologia comprimida antes de aplicar el state dict con `strict=False`, lo que anade fragilidad al pipeline y riesgo de cargas silenciosas incorrectas.
- No se distribuyen pesos en safetensors ni GGUF; el formato `pytorch_model.bin` implica `torch.load` con posibles riesgos de seguridad si no se confia en el origen.
- La model card referencia el repositorio `tahamajs/bert-comp-admm-pruner-sst2` mientras que el ID real es `Hooshaai/bert-comp-admm-pruner-sst2`, lo que puede provocar errores en el codigo de ejemplo.
- No hay verificacion independiente de los resultados; la metrica figura como `verified: false` en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-admm-pruner-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del pruner: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/admm_pruner.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
