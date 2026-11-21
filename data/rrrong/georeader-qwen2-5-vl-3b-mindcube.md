# RRRong/GeoReader-Qwen2.5-VL-3B-MindCube

## Resumen

GeoReader Qwen2.5-VL-3B MindCube es un checkpoint de ajuste fino del modelo vision-lenguaje Qwen2.5-VL-3B-Instruct, desarrollado por el usuario RRRong. El modelo implementa la arquitectura GeoReader, un envoltorio que combina el VLM base con un "Reader" geometrico congelado, un adaptador y una compuerta (gate) para tareas de razonamiento espacial y geometrico sobre imagenes. El checkpoint corresponde a la reproduccion de la etapa 2 (Stage 2) del entrenamiento sobre el paquete de datos MindCube DA3.

El modelo esta especializado en visual question answering con enfasis en razonamiento geometrico multi-vista, alcanzando un 87,14% de precision (915/1.050) en el benchmark MindCube-Tiny. Resuelve el problema de interpretar relaciones espaciales (rotacion, posicion relativa, orientacion) en escenas visuales, una tarea donde los VLM genericos suelen fallar.

Es relevante por su enfoque hibrido: no se trata de un simple fine-tuning, sino de un sistema con un modulo geometrico dedicado que se mantiene congelado mientras se entrena el adaptador. El checkpoint requiere un cargador especifico (no funciona con `AutoModel` de Transformers), lo que limita su uso directo pero permite reproducir el pipeline completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (Qwen2.5-VL-3B) + Reader geometrico congelado + adaptador + gate |
| Parametros totales | no disponible (modelo base Qwen2.5-VL-3B: ~3.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible (los componentes retienen las licencias de origen; ver LICENSE del repo) |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct y anade un modulo "Reader" geometrico congelado que procesa informacion espacial multi-vista. Sobre esta base se entrena un adaptador y una compuerta que combinan las representaciones del VLM con las del Reader. El checkpoint incluye el VLM, el Reader congelado, el adaptador y el gate en un unico `pytorch_model.bin`, junto con el processor/tokenizer y la configuracion de reconstruccion.

El entrenamiento de la etapa 2 se realizo sobre el dataset GeoReader-MindCube, con 10 epocas sobre el conjunto oficial de 10K preguntas-respuesta (answer-only QA), una GPU, batch size 1, learning rate 2e-5 y 100 pasos de warmup. La geometria de entrenamiento faltante se recalculo con los ajustes historicos DA3 Nested Giant-Large 1.1 (inferencia multi-vista ordenada, resolucion 504, upper_bound_resize y saddle_balanced, con la primera vista como referencia de coordenadas). La etapa 1 (Reader) no se reentreno para esta ejecucion; su checkpoint se entreno antes de la reconstruccion de geometria. El resultado anterior en el paper era 81,14%; el nuevo modelo retrenado alcanza 87,14%, aunque los cambios no se aislaron en experimentos separados. La semilla inicial del modulo no se registro antes de la construccion del modelo en esta ejecucion.

## Capacidades

- Visual question answering sobre imagenes, con enfasis en razonamiento geometrico y espacial.
- Razonamiento de rotacion, posicion relativa ("among", "around") y orientacion en escenas multi-vista.
- Procesamiento de multiples vistas con inferencia multi-vista ordenada y resolucion 504.
- Generacion de respuestas con presupuesto de 128 tokens.
- Capacidades heredadas del VLM base Qwen2.5-VL-3B-Instruct (no detalladas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles (segun la model card).

## Casos de uso

- Evaluacion de razonamiento espacial en investigacion: el modelo permite reproducir el benchmark MindCube-Tiny con 1.050 preguntas y comparar resultados (87,14% global) frente a otros metodos geometricos.
- Analisis de escenas multi-vista en robotica: el Reader congelado y la inferencia multi-vista ordenada permiten interpretar relaciones espaciales entre vistas, util para navegacion o manipulacion.
- Investigacion en arquitecturas hibridas VLM + modulo geometrico: sirve como referencia reproducible para estudiar el efecto de congelar un Reader geometrico y entrenar solo adaptador y gate.
- Benchmarking de modelos de razonamiento visual: las salidas por pregunta y las puntuaciones en `evaluation/mindcube/` permiten analisis de errores detallados por categoria (rotacion 60,5%, among 93,83%, around 92,4%).
- Reproduccion de pipelines de entrenamiento: la receta documentada (10 epocas, lr 2e-5, batch 1, 100 warmup steps) permite replicar el ajuste sobre el dataset GeoReader-MindCube.
- Docencia y formacion en vision-lenguaje: el checkpoint y sus datos asociados sirven para ilustrar el flujo completo de un sistema VLM especializado en geometria.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| MindCube-Tiny (global) | Precision | 87,14% (915/1.050) |
| MindCube-Tiny (rotacion) | Precision | 60,5% |
| MindCube-Tiny (among) | Precision | 93,83% |
| MindCube-Tiny (around) | Precision | 92,4% |
| Resultado previo del paper | Precision | 81,14% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 8,7 GB, lo que sugiere que el checkpoint en precision completa ronda ese tamano y requiere al menos ~9-10 GB de VRAM para cargarse.
- GPU recomendadas: no especificadas en la informacion; por el tamano del modelo base (3B), una GPU con 12-16 GB de VRAM deberia ser suficiente en precision reducida.
- Cabe en GPU consumer: probablemente si en RTX 3090/4090 (24 GB) en precision completa; en GPUs de 8-12 GB requeriria cuantizacion, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: requiere el cargador especifico de GeoReader (no funciona con `AutoModel` de Transformers); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Entrenamiento: la receta documentada usa una sola GPU con batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoReader Qwen2.5-VL-3B MindCube | ~3B (base) | no disponible | 87,14% en MindCube-Tiny | no disponible | Hugging Face (requiere cargador propio) |
| Qwen2.5-VL-3B-Instruct | ~3B | no disponible en esta ficha | no disponible | licencia Qwen (ver repo) | Hugging Face, Transformers |
| Otros metodos GeoReader (paper previo) | no disponible | no disponible | 81,14% en MindCube-Tiny | no disponible | no disponible |

La comparacion con alternativas de la misma categoria (VLM de ~3B para razonamiento espacial) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un cargador especifico de GeoReader; no es compatible con `AutoModel` de Transformers, lo que complica su integracion en pipelines estandar.
- El codigo de GeoReader aun no esta publicado (se esta preparando en GitHub), por lo que la reproducibilidad completa no esta garantizada en el momento de la publicacion.
- La etapa 1 (Reader) no se reentreno para esta ejecucion; su checkpoint es anterior a la reconstruccion de geometria, lo que introduce una inconsistencia entre etapas.
- El entrenamiento completo desde cero a traves de ambas etapas no se ha verificado.
- La semilla inicial del modulo no se registro antes de la construccion del modelo, lo que afecta a la reproducibilidad exacta.
- Los cambios respecto al resultado del paper (81,14% a 87,14%) no se aislaron en experimentos separados, por lo que no se conoce que factor produjo la mejora.
- Solo soporta ingles.
- Licencia no disponible de forma explicita; los componentes retienen sus licencias de origen (ver LICENSE del repo y la data card del dataset).
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a los VLM.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que indica ausencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RRRong/GeoReader-Qwen2.5-VL-3B-MindCube
- Dataset GeoReader-MindCube: https://huggingface.co/datasets/RRRong/GeoReader-MindCube
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Codigo GeoReader: en preparacion para GitHub (no disponible aun)
