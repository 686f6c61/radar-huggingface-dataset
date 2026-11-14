# Hooshaai/bert-comp-wanda-sst2

## Resumen

`bert-comp-wanda-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta 768) afinado sobre GLUE SST-2 y procesado con el compresor `WandaCompressor` (podado por magnitud de pesos y normas de activaciones) de la libreria NeuralOps, desarrollada por el autor Hooshaai. El modelo se publica como parte del "Compressor Zoo" de NeuralOps, un catalogo de checkpoints comprimidos con distintas tecnicas (pruning, cuantizacion, low-rank) y sometidos a un proceso de recuperacion opcional mediante LoRA.

El caso de este checkpoint concreto es peculiar: aunque se etiqueta con el rank de showcase `k=32`, la tabla de evaluacion Pareto del autor muestra que los cuatro ranks evaluados (256, 128, 64 y 32) producen exactamente el mismo recuento de parametros (109.483.778) y una relacion de compresion fisica de `1.00x`, es decir, una reduccion del 0,00 %. En la practica, el artefacto empaquetado no reduce el tamano del modelo base; lo relevante aqui es la metodologia de evaluacion y el pipeline de reconstruccion, no un ahorro real de memoria o computo.

Su relevancia es, por tanto, instrumental: sirve como ejemplo reproducible de como NeuralOps serializa checkpoints comprimidos, registra telemetria de compresion (`compression_summary.json`) y evalua el impacto en una tarea downstream estandar. La precision declarada en validacion de SST-2 es del 87,84 %, frente al 91,63 % del modelo profesor sin comprimir, una perdida de 3,79 puntos porcentuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimension oculta 768), cabeza de clasificacion de secuencia con 2 etiquetas |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT acepta hasta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base uncased: un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion, adaptado a clasificacion binaria de sentimiento (0 = negativo, 1 = positivo) mediante `BertForSequenceClassification`. Sobre esta base, el autor aplica el compresor `wanda` (`neuralops/compression/pruning/wanda.py`), que poda pesos segun el producto de su magnitud por la norma de las activaciones de entrada correspondientes.

El pipeline de NeuralOps evalua cuatro ranks (`k=256, 128, 64, 32`) sobre la particion de validacion de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresion zero-shot degrada la precision mas de 2,0 puntos con una reduccion superior a 1,10x, se activa un "healing" con LoRA de rango `r=8`, 50 pasos, tasa de aprendizaje `2e-4` y un presupuesto de 45 segundos. En este checkpoint el healing no se aplico (`LoRA Recovery Applied: False`) y, segun la tabla del autor, ninguno de los cuatro ranks produce reduccion fisica de parametros, por lo que los resultados son identicos entre ranks. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset mas alla de SST-2 ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion binaria de sentimiento en ingles sobre textos de resenas (formato GLUE SST-2).
- Generacion de logits por clase (`Negative`/`Positive`) aptos para umbralizacion y calculo de probabilidades via softmax.
- Procesamiento de entradas de hasta la longitud maxima configurada en el tokenizer de BERT-base (no declarada explicitamente en la model card).
- Reconstruccion programatica del grafo comprimido mediante `compress_model` de NeuralOps y carga con `load_state_dict(strict=False)`.
- Carga en una linea mediante la API `load_surgeried_model` del hub de NeuralOps.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Clasificacion de sentimiento en resenas de productos: el modelo devuelve una etiqueta binaria por resena; util para agregar valoraciones en catalogos de e-commerce donde el dominio coincide con SST-2 (resenas de peliculas en ingles).
- Filtrado de comentarios en foros y comunidades en ingles: permite descartar o priorizar mensajes negativos antes de la moderacion humana, con un coste de inferencia bajo al tratarse de un BERT-base.
- Etiquetado automatico de datasets de sentimiento: el checkpoint sirve para pre-anotar corpus en ingles que luego se revisan manualmente, aprovechando la precision del 87,84 % en validacion como referencia de calidad.
- Baseline de investigacion en compresion de modelos: util para reproducir la evaluacion Pareto de NeuralOps y comparar tecnicas de pruning sobre una tarea estandar de GLUE.
- Prueba de integracion del pipeline NeuralOps: sirve para validar el flujo `compress_model` + `load_state_dict` + inferencia en un entorno controlado antes de aplicarlo a modelos mayores.
- Docencia y demostraciones de poda por pesos y activaciones: el repositorio incluye `compression_summary.json` con telemetria de los cuatro ranks, lo que facilita explicar el metodo Wanda con datos concretos.
- Monitorizacion de opinion en encuestas abiertas en ingles: clasificacion rapida de respuestas de texto libre en positivas o negativas para dashboards de satisfaccion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation, 872 muestras) | Accuracy | 87,84 % |
| GLUE SST-2 — baseline profesor (BERT-base sin comprimir) | Accuracy | 91,63 % |
| Delta frente al profesor | Accuracy | -3,79 pp |

Evaluacion Pareto por rank (segun la model card del autor):

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 87,84 % | 87,84 % | -3,79 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 87,84 % | 87,84 % | -3,79 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 87,84 % | 87,84 % | -3,79 % |
| 32 (showcase) | 1,00x | 109.483.778 (-0,0 %) | 87,84 % | 87,84 % | -3,79 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precision completa (el repositorio ocupa 0,5 GB y el state dict pesa 451,9 MB), mas el overhead de activaciones y del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor evaluo en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeno para GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.).
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la model card solo documenta el flujo nativo de NeuralOps (`compress_model` + `load_state_dict`) y la API `load_surgeried_model`. No se declara soporte explicito para vLLM, llama.cpp, Ollama ni TGI; al ser un `pytorch_model.bin` de BERT, seria tecnicamente convertible a otros formatos, pero no esta documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-wanda-sst2` | 109.483.778 | No disponible | 87,84 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, segun el autor) | 109.483.778 | 512 tokens (estandar BERT) | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | ~109,5 M | 512 tokens (estandar BERT) | No disponible en esta busqueda | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens (estandar DistilBERT) | No disponible en esta busqueda | Apache 2.0 | Hugging Face |

Nota: los valores de los dos ultimos modelos no se han verificado en la informacion proporcionada; se incluyen como referencia de categoria (clasificadores de sentimiento BERT-like en ingles). El dato del profesor (91,63 %) procede de la propia model card del autor.

## Limitaciones y advertencias

- El checkpoint no aplica reduccion fisica de parametros (`1.00x`, `-0,0 %`): no aporta ahorro de memoria ni de computo frente al BERT-base original, a pesar de la etiqueta de "compressed".
- Perdida de 3,79 puntos de accuracy frente al profesor (87,84 % vs 91,63 %), lo que puede ser inaceptable en tareas sensibles.
- El resultado del benchmark esta declarado por el autor con `verified: false`; no ha sido reproducido de forma independiente.
- Entrenado y evaluado solo en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Dominio limitado a resenas de sentimiento similares a SST-2 (resenas de peliculas); el rendimiento puede degradarse en otros dominios (redes sociales, soporte tecnico, texto formal).
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas en entradas ambiguas, sarcasticas o con negaciones complejas.
- La carga requiere el paquete `neuralops` y una reconstruccion previa del grafo comprimido con `compress_model`; no es un checkpoint plug-and-play con `transformers` estandar.
- El ejemplo de codigo de la model card referencia el repositorio `tahamajs/bert-comp-wanda-sst2`, mientras que el ID real es `Hooshaai/bert-comp-wanda-sst2`; conviene verificar la ruta antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` esta bajo Apache 2.0; conviene revisar ambas.
- El repositorio tiene 44 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-wanda-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor Wanda: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/wanda.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
