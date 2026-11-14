# Hooshaai/bert-comp-enlighten-compressor-sst2

## Resumen

`bert-comp-enlighten-compressor-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante la técnica `ENLightenCompressor` de la librería NeuralOps y posteriormente "curado" con LoRA para recuperar parte de la precisión perdida. Lo desarrolla el usuario Hooshaai (repositorio NeuralOps de tahamajs) y está afinado para clasificación de sentimiento binario sobre GLUE SST-2. El objetivo no es competir con BERT original, sino demostrar una metodología de compresión de modelos: reducción del 58,2 % de parámetros (de 109,48 M a 45,78 M, ratio físico de 2,39x) con una caída de precisión controlada y documentada.

La relevancia del modelo es fundamentalmente metodológica y de investigación: sirve como artefacto reproducible para estudiar el compromiso entre ratio de compresión, rango de descomposición low-rank y recuperación mediante adaptadores LoRA de bajo rango (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s). El autor publica una evaluación Pareto completa para los rangos k=256, 128, 64 y 32, lo que permite analizar empíricamente cómo degrada la compresión al modelo.

Se trata de un modelo de clasificación de texto en inglés, con licencia MIT, formato de pesos `pytorch_model.bin` y un tamaño de repositorio de 0,1 GB. No es un modelo generativo ni soporta tool calling, agentes ni contexto largo: es un encoder BERT de 12 capas y dimensión oculta 768 con una cabeza de clasificación de 2 etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, D=768, con cabeza de clasificación de 2 etiquetas |
| Parametros totales | 45.782.786 (comprimido; base original 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en `pytorch_model.bin` con factores low-rank y adaptadores LoRA integrados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer de `bert-base-uncased` |
| Ratio de compresion | 2,39x (reduccion del 58,18 % de parametros) |
| Rango de compresion (`k`) | 128 |
| Libreria | `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` (12 capas, 109,48 M de parametros, D=768) ya afinado sobre GLUE SST-2, cuyo baseline docente declara una precision del 91,63 %. Sobre ese checkpoint se aplica `ENLightenCompressor`, un operador neuronal registrado en NeuralOps que combina descomposicion SVD de bajo rango con sparsity estructurada 2:4 alineada con hardware fotónico. La compresion se realiza a rango k=128, lo que reduce el numero de parametros a 45,78 M.

Cuando la compresion zero-shot degrada la precision mas de 2,0 puntos con una reduccion superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango r=8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. En este checkpoint, el paso de zero-shot deja la precision en 52,41 % y el healing LoRA la eleva hasta 71,90 %, todavia 19,73 puntos por debajo del profesor. El autor documenta la evaluacion fisica en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validacion de SST-2. No se detalla el volumen de tokens de entrenamiento ni la composicion del dataset mas alla de GLUE SST-2.

## Capacidades

- Clasificacion de sentimiento binario (negativo/positivo) en ingles sobre textos tipo SST-2.
- Codificacion de texto mediante representaciones contextuales de BERT-Base (utilizable como extractor de features si se elimina la cabeza de clasificacion).
- Inferencia por lotes en PyTorch/Transformers tras reconstruir la topologia comprimida.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni capacidades multimodales.
- Multilingue: no; solo ingles.
- Capacidad de contexto largo: no documentada; hereda el limite arquitectonico de BERT-Base (512 tokens) pero no se confirma en la informacion disponible.

## Casos de uso

- Investigacion sobre compresion de modelos: reproducir el pipeline `enlighten_compressor` con k=128 y comparar la curva Pareto (k=256/128/64/32) frente al profesor BERT-Base para estudiar el compromiso precision/compresion en entornos academicos.
- Clasificacion de sentimiento de bajo coste en ingles: desplegar el checkpoint en CPUs o GPUs modestas para analisis de opiniones en reseñas, tweets o comentarios, aceptando la caida de ~20 puntos frente al profesor.
- Prototipado rapido de pipelines de NLP: usar el modelo como baseline comprimido en experimentos de destilacion, pruning o cuantizacion antes de invertir en modelos mayores.
- Docencia y formacion: ilustrar en cursos de eficiencia de modelos como una tecnica SVD + sparsity 2:4 con healing LoRA afecta a una tarea downstream concreta y medible.
- Filtrado previo en sistemas de moderacion: clasificar sentimiento a gran escala en ingles como primera etapa barata antes de un modelo mas grande, siempre que la precision del 71,9 % sea aceptable para el caso.
- Benchmarking de hardware: medir throughput y latencia de un BERT comprimido a 45,78 M de parametros en RTX 3090 u otras GPUs para comparar con el modelo original de 109,48 M.
- Validacion de la libreria NeuralOps: comprobar la reconstruccion del state dict comprimido, la carga con `strict=False` y la coherencia de `compression_summary.json` en integraciones propias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| GLUE SST-2 (validation, 872 muestras) | Accuracy | 71,90 % |
| GLUE SST-2, profesor BERT-Base | Accuracy | 91,63 % |
| GLUE SST-2, zero-shot comprimido (k=128) | Accuracy | 52,41 % |
| Delta de paridad vs profesor | Accuracy | -19,73 % |

Evaluacion Pareto multi-rango declarada por el autor:

| Rango (k) | Ratio fisico | Parametros (reduccion) | Zero-shot | Con LoRA | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 56,08 % | -35,55 % |
| 128 | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 71,90 % | -19,73 % |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 50,92 % | -40,71 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 69,15 % | -22,48 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 45,78 M de parametros (aproximadamente 183 MB de pesos mas activaciones), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor valido la evaluacion en una NVIDIA GeForce RTX 3090 (24 GB). Tambien funciona en RTX 4090, A100, H100 y GPUs de gama baja.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050 Ti en adelante), y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch + Transformers con reconstruccion manual via `neuralops.core.compression_pipeline.compress_model`; no se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint requiere la topologia comprimida de NeuralOps.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-enlighten-compressor-sst2` (este) | 45,78 M (comprimido) | No disponible | 71,90 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| DistilBERT SST-2 | No disponible en la informacion | No disponible | No disponible | Apache 2.0 | Hugging Face |
| RoBERTa-base SST-2 | No disponible en la informacion | No disponible | No disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- Precision muy inferior al profesor: 71,90 % frente a 91,63 %, una caida de 19,73 puntos que lo hace inadecuado para produccion donde se requiera calidad cercana a BERT-Base.
- El healing LoRA no es monotono respecto al rango: k=256 empeora tras LoRA (59,52 % → 56,08 %) y k=64 tambien (51,38 % → 50,92 %), lo que sugiere inestabilidad del procedimiento de recuperacion.
- Solo ingles; no utilizable en castellano ni en otras lenguas sin reentrenamiento.
- Tarea restringida a clasificacion de sentimiento binario SST-2; no es un modelo generativo ni un encoder de proposito general validado.
- Requiere la libreria NeuralOps para reconstruir la topologia comprimida antes de cargar el state dict; no es plug-and-play con `AutoModel.from_pretrained` estandar.
- La carga usa `strict=False`, por lo que pueden quedar pesos sin inicializar de forma silenciosa; conviene validar la reconstruccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas sistematicas por el sesgo del dataset SST-2 (resenas de cine en ingles).
- Licencia MIT permite uso comercial, pero el modelo base BERT-Base es Apache 2.0; conviene revisar la compatibilidad y atribuciones en despliegues comerciales.
- Los resultados de benchmarks estan declarados por el autor y no verificados (`verified: false`); deben tratarse con cautela.
- Repositorio con 45 descargas y 0 likes: ecosistema muy reducido, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-enlighten-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/enlighten_compressor.py
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
