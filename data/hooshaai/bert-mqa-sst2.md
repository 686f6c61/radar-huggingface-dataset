# Hooshaai/bert-mqa-sst2

## Resumen

`Hooshaai/bert-mqa-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `mqa` (multi-query attention) implementado en la libreria NeuralOps. El objetivo declarado es explorar atencion subcuadratica (complejidad efectiva O(N) u O(N log N)) manteniendo la arquitectura base de BERT-Base (110 M de parametros).

El modelo se ha ajustado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) mediante un protocolo de destilacion por representaciones en cache ("Cached Representation Distillation") ejecutado en una RTX 3090. El repositorio publica unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), no el modelo completo, y requiere codigo remoto (`trust_remote_code=True`) para reconstruir la base congelada desde `bert-base-uncased`.

Es relevante ahora como pieza de investigacion sobre eficiencia atencional, pero no como modelo listo para produccion: el propio autor reporta una precision en SST-2 del 50,92 %, identica al estado previo a la destilacion y practicamente equivalente a la clase mayoritaria, lo que indica que el ajuste no ha convergido a un clasificador util.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-Base con atencion `mqa` (multi-query) subcuadratica en las 12 capas |
| Parametros totales | 110 M (heredados de `bert-base-uncased`); el repo solo publica ~55 MB de pesos de atencion y cabeza en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; la base BERT admite 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serializacion `attention_only_fp16` con codigo remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 768 de hidden, 110 M de parametros) y reemplaza la atencion multi-cabeza estandar por el mecanismo `mqa` de NeuralOps, que reduce el coste operativo de O(N^2) a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue un protocolo de destilacion en dos etapas: alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB durante 149,8 s, 184 pasos de optimizacion, con un throughput de 10.060,9 tokens/s y un pico de VRAM de 5.825 MB. El dataset es la tarea SST-2 de GLUE. No se documentan volumen de tokens de preentrenamiento adicional, composicion del corpus ni uso de RLHF/DPO.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (etiquetas 0 = negativo, 1 = positivo) sobre la tarea SST-2.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`, o mediante la API `load_pretrained_bert` / `load_surgeried_model` de NeuralOps.
- Atencion subcuadratica orientada a reducir coste computacional en secuencias largas frente a la atencion cuadratica estandar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no (solo ingles).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre eficiencia atencional: comparar el coste y la calidad de `mqa` frente a atencion cuadratica en BERT-Base sobre secuencias largas, usando el checkpoint como referencia reproducible del zoo de NeuralOps.
- Reproduccion de experimentos de destilacion: el protocolo de representaciones en cache (sin VRAM de profesor) permite repetir el pipeline en una unica GPU de 24 GB y validar la telemetria publicada (184 pasos, 149,8 s).
- Prueba de integracion de la libreria NeuralOps: validar la carga modular de pesos solo-atencion sobre una base congelada y el shim de codigo remoto en un pipeline de CI.
- Benchmarking interno de latencia y throughput: medir tokens/s y VRAM en distintos hardwares para decidir si merece la pena adoptar atencion subcuadratica en tareas de clasificacion.
- Docencia y divulgacion: ejemplo didactico de como se sustituye un bloque de atencion en un transformer preentrenado y de como interpretar una precision cercana al azar en una tarea binaria.
- Base para reajuste supervisado: partir de los pesos de atencion publicados y reentrenar la cabeza de clasificacion con un dataset mayor antes de cualquier uso real, dado que la version actual no supera el 50,92 % en SST-2.

## Benchmarks y rendimiento

Evaluacion publicada en el split de validacion de SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`mqa`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Precision SST-2 | 91,63 % | 50,92 % | 50,92 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7432 | convergido |

Telemetria de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion | 149,8 s |
| Pasos de optimizacion | 184 |
| Throughput | 10.060,9 tokens/s |
| Pico de VRAM | 5.825 MB |

## Requisitos de hardware

- VRAM estimada: el modelo completo en FP16 ronda los 440 MB (110 M de parametros); la descarga del repo es de ~55 MB porque solo incluye atencion y cabeza.
- Cabe en cualquier GPU consumer con 4 GB o mas, incluidas GTX 1650, RTX 3060, RTX 4090; el autor entreno en una RTX 3090.
- GPU de datacenter (A100, H100) no son necesarias para este tamano; se usarian solo para barridos masivos de experimentos.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la libreria NeuralOps; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10.060,9 tokens/s en entrenamiento sobre RTX 3090; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-mqa-sst2` | 110 M (base) | no disponible | 50,92 % | MIT | Pesos de atencion (~55 MB) + codigo remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Pesos completos en HF |
| Alternativas con atencion eficiente tipo Longformer / BigBird | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision en SST-2 del 50,92 %, practicamente equivalente a la clase mayoritaria: el modelo no es util como clasificador de sentimiento en produccion.
- La destilacion no produjo mejora alguna (+0,00 %) respecto al estudiante pre-KD; el autor lo etiqueta como "subquadratic probe", no como modelo final.
- Requiere `trust_remote_code=True` y la libreria NeuralOps para reconstruir la base congelada; no es un checkpoint autonomo cargable con Transformers estandar sin codigo remoto.
- Solo ingles; no se documenta soporte multilingue ni contexto superior al de BERT-Base (512 tokens).
- Riesgo de alucinacion y sesgos: no evaluado en la model card; al ser un encoder de clasificacion, el riesgo principal es de calibracion y sesgo en las etiquetas, no de generacion.
- Licencia MIT permite uso comercial, pero la calidad actual del checkpoint desaconseja cualquier despliegue sin reentrenamiento.
- La model card mezcla identificadores (`tahamajs/bert-mqa-sst2` en los ejemplos frente a `Hooshaai/bert-mqa-sst2` en el repo), lo que puede provocar errores de carga; conviene verificar el ID real antes de integrar.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-mqa-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
