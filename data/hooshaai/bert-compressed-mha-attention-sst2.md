# Hooshaai/bert-compressed-mha-attention-sst2

## Resumen

`bert-compressed-mha-attention-sst2` es un checkpoint experimental publicado por Hooshaai (autor del repositorio NeuralOps, Taha Majlesi) en el que se sustituyen los bloques de atencion softmax cuadratica de las 12 capas de `bert-base-uncased` por un mecanismo denominado `compressed_mha_attention`, con complejidad operativa subcuadratica (O(N) u O(N log N)). El modelo se afina sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) mediante un protocolo de destilacion de representaciones cacheado que no requiere mantener el profesor en VRAM.

El interes del artefacto no es su calidad predictiva, sino su valor como sonda de investigacion: demuestra el flujo completo de la libreria NeuralOps para serializar unicamente los pesos de atencion y la cabeza de clasificacion en un fichero `attention_weights.safetensors` de aproximadamente 55 MB en FP16, reconstruyendo el resto del modelo base en tiempo de carga.

Los resultados publicados son muy limitados: la precision en SST-2 es del 50,92 %, apenas 2,29 puntos por encima de la inicializacion aleatoria del estudiante (48,62 %) y muy lejos del profesor `bert-base-uncased` (91,63 %). Se trata, por tanto, de una prueba de concepto de la infraestructura, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `compressed_mha_attention` subcuadratica en las 12 capas |
| Parametros totales | ~110 M (BERT-Base); pesos entrenados serializados: solo atencion y cabeza de clasificacion (~55 MB FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (`attention_only_fp16`); no se documentan otras |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), con codigo remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M parametros) y reemplaza la atencion multi-cabeza estandar por `compressed_mha_attention`, un mecanismo de la libreria NeuralOps con escalado subcuadratico declarado como O(N) u O(N log N). El repositorio no detalla la formulacion interna del mecanismo ni la composicion exacta del dataset de entrenamiento, mas alla de indicar GLUE/SST-2.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de estados ocultos en subespacio y una segunda etapa de KL sobre logits mas entropia cruzada de la tarea. La destilacion se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) en 51,8 segundos, 157 pasos de optimizacion, con un throughput efectivo de 24.843,2 tokens/s y un pico de VRAM de 8.487 MB. La serializacion es modular: solo se publican los pesos de atencion y la cabeza de clasificacion, y el codigo remoto inicializa los pesos congelados del BERT base al cargar.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, formato SST-2.
- Inferencia mediante `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular a traves de la API `neuralops.hub` (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- No se documentan capacidades multilingues: solo ingles.
- No se documenta modo de razonamiento extendido ni decodificacion especulativa.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de partida reproducible para comparar `compressed_mha_attention` frente a MHA estandar en una tarea controlada (SST-2) con un protocolo de destilacion documentado.
- Prueba de la infraestructura NeuralOps: permite validar el flujo de serializacion modular (pesos solo de atencion en ~55 MB) y la reconstruccion en tiempo de carga con el codigo remoto.
- Experimentos de destilacion con VRAM limitada: el protocolo de representaciones cacheadas evita mantener el profesor en memoria, lo que facilita reproducir el entrenamiento en una unica GPU de consumo (RTX 3090).
- Benchmarking de eficiencia teorica: util para medir el impacto real de un mecanismo subcuadratico en latencia y memoria frente a BERT-Base en secuencias largas, aunque la model card no publica esas mediciones.
- Docencia y prototipado de arquitecturas: ejemplo minimo de como sustituir bloques de atencion en un transformer preentrenado sin reentrenar desde cero.
- No es adecuado para analisis de sentimiento en produccion: con 50,92 % de precision en SST-2 su rendimiento es practicamente el de un clasificador aleatorio.

## Benchmarks y rendimiento

Evaluacion publicada en el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63 % | 48,62 % | 50,92 % | +2,29 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,6954 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para el conjunto BERT-Base (~220 MB de pesos) mas overhead de activaciones; el checkpoint descargable son ~55 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se realizo en una RTX 3090 (pico de 8.487 MB).
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la API `neuralops.hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors parcial con codigo remoto complica su conversion a GGUF.
- Latencia y throughput: no se publican mediciones de inferencia; solo el throughput de entrenamiento (24.843,2 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-compressed-mha-attention-sst2` | ~110 M (atencion serializada ~55 MB) | no disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa de rendimiento solo puede establecerse con el profesor, ya que la model card no aporta datos de otras alternativas.

## Limitaciones y advertencias

- Precision de 50,92 % en SST-2: equivale practicamente a un clasificador binario aleatorio; no debe usarse en produccion.
- El delta de destilacion (+2,29 %) indica que el estudiante apenas ha aprendido la tarea; la entropia cruzada de 0,6954 refleja una calibracion pobre.
- Solo ingles y solo clasificacion binaria de sentimiento; sin capacidades generativas ni de otro tipo.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que introduce dependencia de codigo de terceros no auditado en el pipeline de carga.
- Los pesos no son un checkpoint completo: la reconstruccion depende de que `bert-base-uncased` siga disponible y de que el shim remoto funcione correctamente.
- No se documentan sesgos especificos ni evaluaciones de robustez; al derivar de BERT-Base y entrenar sobre SST-2, hereda los sesgos del corpus de resenas de cine.
- Licencia MIT permite uso comercial, pero el estado experimental del modelo hace desaconsejable cualquier despliegue real.
- La model card usa identificadores inconsistentes (`tahamajs/...` en el codigo frente a `Hooshaai/...` en el Hub), lo que puede romper los ejemplos de carga tal cual estan escritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-compressed-mha-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
