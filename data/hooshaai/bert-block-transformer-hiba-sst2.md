# Hooshaai/bert-block-transformer-hiba-sst2

## Resumen

`bert-block-transformer-hiba-sst2` es un checkpoint derivado de `bert-base-uncased` en el que el autor (Hooshaai, identificado en la model card como Taha Majlesi) ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `block_transformer_hiba` de la libreria NeuralOps. El objetivo declarado es explorar atencion subcuadratica (complejidad efectiva O(N) u O(N log N)) sobre una arquitectura BERT clasica, manteniendo el resto del modelo congelado y serializando unicamente los pesos de atencion y la cabeza de clasificacion.

El modelo se ha entrenado y evaluado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilacion de representaciones en cache (NeuralOps Cached Representation Distillation Protocol), ejecutado en una unica NVIDIA GeForce RTX 3090 de 24 GB. El resultado empirico es limitado: la precision en validacion de SST-2 es del 50,92 %, identica a la del estudiante antes de la destilacion y muy por debajo del 91,63 % del profesor `bert-base-uncased`, lo que sugiere que el proceso de destilacion no ha producido mejora medible en esta configuracion.

Se trata, por tanto, de un artefacto de investigacion sobre mecanismos de atencion alternativa, no de un modelo listo para produccion. Su interes radica en la infraestructura de serializacion modular (pesos de atencion en FP16 de ~55 MB sobre una base congelada de ~450 MB) y en la metodologia de destilacion sin asignacion de VRAM al profesor, mas que en el rendimiento de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con atencion `block_transformer_hiba` (subcuadratica) en las 12 capas |
| Parametros totales | 110M (base `bert-base-uncased`); el repo solo serializa pesos de atencion y cabeza de tarea (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP16 (`attention_only_fp16`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), con codigo remoto (`modeling_neuralops_bert.py`) y carga via `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 110M parametros) y reemplaza la atencion multi-cabeza estandar por el mecanismo `block_transformer_hiba` de NeuralOps, que segun la model card reduce la complejidad operativa efectiva de O(N^2) a O(N) u O(N log N). El resto de pesos del modelo base permanece congelado: el repositorio almacena solo los parametros de atencion y el adaptador de clasificacion en FP16 (~55 MB), y el codigo remoto reconstruye el modelo inicializando la base desde `bert-base-uncased` y aplicando los pesos destilados en tiempo de carga. Esta serializacion modular evita re-subir los ~450 MB del BERT original.

El entrenamiento se realizo con el protocolo NeuralOps Cached Representation Distillation en dos etapas: alineamiento de subespacio oculto (Stage 1) y KL sobre logits mas entropia cruzada de tarea (Stage 2). Segun la telemetria reportada, se ejecuto en una RTX 3090 (24 GB) durante 47,3 s, con 235 pasos de optimizacion, throughput efectivo de 40.738,1 tokens/s y pico de VRAM de 8.487 MB; el profesor no consume VRAM durante el proceso porque sus representaciones se cachean offline. No se detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset mas alla de GLUE SST-2.

## Capacidades

- Clasificacion de texto binaria (analisis de sentimiento) sobre secuencias en ingles, limitada a la tarea SST-2 para la que fue destilado.
- Inferencia con la API estandar de Transformers mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga modular a traves de la API de NeuralOps (`load_pretrained_bert` y `load_surgeried_model`), que reconstruye el modelo aplicando solo los pesos de atencion.
- Exploracion de mecanismos de atencion subcuadratica sobre arquitecturas BERT, como banco de pruebas para investigacion.
- No se documentan capacidades de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico.
- Multilingue: no; el modelo esta etiquetado unicamente para ingles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: servir como punto de partida reproducible para comparar `block_transformer_hiba` con atencion softmax cuadratica en tareas de clasificacion, cargando los pesos modulares sobre `bert-base-uncased`.
- Analisis de sentimiento en ingles con caracter experimental: clasificar resenas o comentarios binarios (positivo/negativo) en prototipos, asumiendo que la precision observada (~51 %) esta cerca del azar y requiere validacion adicional.
- Benchmarking de pipelines de destilacion: usar el checkpoint para auditar el protocolo NeuralOps Cached Representation Distillation y medir el efecto real de las dos etapas (alineamiento de subespacio y KL sobre logits).
- Pruebas de carga modular y serializacion: validar el flujo de descarga de ~55 MB, la reconstruccion en tiempo de carga y la integracion con `trust_remote_code=True` en entornos controlados.
- Docencia y experimentacion con arquitecturas eficientes: ilustrar el intercambio entre complejidad computacional y calidad en modelos encoder, comparando el estudiante subcuadratico con el profesor BERT-base.
- Evaluacion de infraestructura en GPU consumer: reproducir el entrenamiento en una RTX 3090 con los ~8,5 GB de VRAM pico reportados, como referencia de coste para experimentos de destilacion.

## Benchmarks y rendimiento

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`block_transformer_hiba`) | Modelo destilado |
|---|---|---|---|
| Precision GLUE SST-2 (validacion, 872 muestras) | 91,63 % | 50,92 % | 50,92 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7219 |
| Delta de precision tras destilacion | — | — | +0,00 % |

Telemetria de entrenamiento reportada: 47,3 s, 235 pasos, 40.738,1 tokens/s, pico de VRAM 8.487 MB en RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el pico de VRAM reportado corresponde al entrenamiento (8.487 MB en una RTX 3090).
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la unica GPU documentada en la model card; cualquier GPU consumer con al menos ~8-10 GB libres deberia poder ejecutar el modelo, aunque no se confirma.
- Cabe en GPU consumer: si, segun el hardware documentado (RTX 3090); no se especifican requisitos para GPUs de gama inferior.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`neuralops.hub`), y potencialmente `vLLM`, `TGI` o `llama.cpp` no estan documentados ni confirmados para este checkpoint.
- Latencia y throughput: no disponible para inferencia; solo se publica throughput de entrenamiento (40.738,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-block-transformer-hiba-sst2` (este) | 110M (base congelada; ~55 MB de pesos de atencion) | no disponible (hereda 512 de BERT-base) | 50,92 % | MIT | Hugging Face, 82 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % (segun la model card) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos BERT afinados en SST-2 (familia BERT-base) | 110M | 512 tokens | no disponible en esta informacion | variable | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks de otras alternativas subcuadraticas comparables, por lo que la comparativa se limita al profesor BERT-base y a la familia BERT-base afinada en SST-2.

## Limitaciones y advertencias

- Rendimiento muy bajo en la tarea objetivo: 50,92 % de precision en SST-2, practicamente equivalente a una clasificacion aleatoria en un problema binario y ~41 puntos por debajo del profesor.
- La destilacion no aporta mejora medible (delta de +0,00 %) y la entropia cruzada de validacion aumenta de 0,2428 a 0,7219 respecto al profesor, lo que indica una calibracion deficiente.
- Riesgo elevado de alucinacion y predicciones poco fiables: el modelo no esta calibrado y su utilidad practica para clasificacion real es dudosa.
- Sesgos conocidos: no documentados en la model card; al heredar la base `bert-base-uncased` y entrenarse solo en SST-2, es probable que arrastre sesgos del corpus ingles de resenas, pero no se aporta evidencia.
- Limitaciones de idioma: solo ingles; no hay soporte multilingue declarado.
- Restricciones de licencia: MIT permite uso comercial, pero el checkpoint depende de `bert-base-uncased` (licencia Apache 2.0) y del codigo remoto de NeuralOps, cuyo uso en produccion exige auditar ambas dependencias.
- Dependencia de codigo remoto (`trust_remote_code=True`): la carga ejecuta `modeling_neuralops_bert.py` del repositorio, lo que introduce riesgo de seguridad y de reproducibilidad si el codigo cambia.
- Naturaleza experimental: es un artefacto de investigacion de la Attention Zoo, no un modelo validado para produccion; no se documentan contexto maximo, cuantizaciones ni latencias de inferencia.
- Fecha de creacion futura (2026-11-09) y autor con solapamiento de identificadores (Hooshaai en el repo, `tahamajs` en el codigo de ejemplo): conviene verificar la procedencia antes de integrarlo en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-block-transformer-hiba-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
