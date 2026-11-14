# Hooshaai/bert-moba-attention-sst2

## Resumen

`Hooshaai/bert-moba-attention-sst2` es un checkpoint de clasificacion de sentimiento binaria (SST-2) construido sobre `google-bert/bert-base-uncased`, en el que las 12 capas de atencion softmax cuadratica originales se han sustituido por el mecanismo `moba_attention` de la libreria NeuralOps. El modelo lo publica el autor Hooshaai (codigo y framework atribuidos a Taha Majlesi en la cita del repositorio) y sigue la estela de los trabajos de atencion subcuadratica aplicada a transformers de proposito general. El objetivo declarado es demostrar que una atencion de complejidad efectiva O(N) u O(N log N) puede igualar o superar ligeramente a la atencion cuadratica clasica en una tarea GLUE estandar, mediante destilacion de representaciones en cache.

El repositorio no contiene los pesos completos de BERT: almacena unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, unos 55 MB), y un shim de codigo remoto (`modeling_neuralops_bert.py`) reconstruye el modelo cargando las capas congeladas de `bert-base-uncased` desde el Hub. Esto lo convierte en un artefacto de investigacion ligero y reproducible, mas que en un modelo listo para produccion.

Es relevante ahora porque ejemplifica una tendencia practica: publicar variantes de atencion como deltas modulares sobre un backbone conocido, reduciendo el coste de distribucion y permitiendo comparar mecanismos de atencion con un protocolo de destilacion comun. La licencia MIT y el soporte de `trust_remote_code` facilitan su inspeccion, aunque su alcance funcional es muy acotado: clasificacion de sentimiento en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `moba_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (BERT-base); el repo solo publica ~55 MB de pesos de atencion y cabeza en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, sin dato explicito en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + codigo remoto Python (`custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros, encoder bidireccional) y reemplaza en todas las capas el bloque de multi-head attention estandar por `moba_attention`, un mecanismo de atencion subcuadratica con complejidad efectiva O(N) u O(N log N) frente a O(N^2) del MHA clasico. Las capas base de BERT permanecen congeladas; solo se entrenan y serializan los pesos de atencion y la cabeza de clasificacion, lo que explica el tamano reducido del artefacto.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilacion en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de la tarea) con el profesor `bert-base-uncased` cacheado offline para no consumir VRAM adicional. Segun la model card, se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB durante 48,8 s, 150 pasos de optimizacion, con un throughput de 25.176,1 tokens/s y un pico de VRAM de 23.021 MB. No se detalla el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de GLUE SST-2.

## Capacidades

- Clasificacion de sentimiento binaria (positivo/negativo) en ingles sobre entradas de texto corto, segun el formato SST-2.
- Clasificacion de secuencias generica en ingles (el pipeline declarado es `text-classification`).
- Inferencia con `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- Carga modular a traves de la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: no disponible; solo se declara ingles.
- No se documenta generacion de texto libre (es un encoder de clasificacion, no un modelo causal).

## Casos de uso

- Analisis de sentimiento de resenas de producto en ingles: el modelo clasifica cada resena en positivo o negativo; su tamano (110 M) y su huella de 55 MB permiten desplegarlo en CPU o GPU de gama baja para volcados masivos.
- Moderacion de comentarios y filtrado de toxicidad por polaridad: al ser un clasificador binario rapido, puede actuar como primera capa de triaje en pipelines de contenido, derivando los casos dudosos a un modelo mayor.
- Investigacion sobre atencion subcuadratica: sirve como referencia reproducible para comparar `moba_attention` frente a MHA estandar en GLUE SST-2 con el mismo protocolo de destilacion y el mismo backbone.
- Docencia y experimentacion con destilacion: el protocolo de destilacion en cache (sin VRAM del profesor) y los 150 pasos de entrenamiento lo hacen util para demostrar tecnicas de KD en hardware de consumo (RTX 3090).
- Benchmarking de frameworks: util para validar la integracion de la libreria NeuralOps y el shim `modeling_neuralops_bert.py` con `trust_remote_code` en entornos Transformers.
- Clasificacion de sentimiento en streaming de redes sociales en ingles: la baja latencia esperada de un encoder de 110 M con atencion subcuadratica lo hace apto para procesar lotes pequenos en tiempo casi real, siempre que se valide su calibracion.
- Base para fine-tuning ligero en dominios especificos (por ejemplo, sentimiento financiero en ingles): al publicarse solo los pesos de atencion, se puede reentrenar la cabeza sobre el backbone congelado con coste reducido.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`moba_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 91,63 % | 91,97 % | +0,34 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,2893 | convergida |

Telemetria de entrenamiento declarada: RTX 3090 24 GB, 48,8 s, 150 pasos, 25.176,1 tokens/s, pico de 23.021 MB de VRAM. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto descargable son ~55 MB en FP16; el modelo completo en memoria requiere cargar el backbone BERT-base (~110 M de parametros), aproximadamente 0,4-0,5 GB en FP16 y ~1 GB en FP32, mas activaciones segun longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entreno en una RTX 3090 de 24 GB, pero la inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo; tambien en CPU para lotes pequenos.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a un encoder de clasificacion).
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (25.176,1 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-moba-attention-sst2` | 110 M (base) + atencion subcuadratica | no disponible | 91,97 % (validacion) | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tuned SST-2) | 110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta informacion | Apache 2.0 | Hugging Face, estandar |
| `roberta-base` fine-tuned SST-2 | 125 M | 512 tokens | no disponible en esta informacion | MIT | Hugging Face, estandar |

La comparativa con alternativas solo puede apoyarse en los datos de la propia model card; no se dispone de resultados verificados de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: es un clasificador binario de sentimiento en ingles, no un modelo generativo ni un asistente; no debe usarse para tareas fuera de `text-classification`.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py`; esto implica ejecutar codigo de terceros y revisar su contenido antes de usarlo en produccion.
- Pesos parciales: el repositorio no contiene el backbone completo; la reconstruccion depende de que `bert-base-uncased` siga disponible y de que la version de la libreria NeuralOps sea compatible.
- Calibracion: la entropia cruzada post-KD (0,2893) es superior a la del profesor (0,2428), por lo que las probabilidades pueden estar peor calibradas aunque la exactitud sea ligeramente mayor; conviene aplicar calibracion (por ejemplo, temperature scaling) si se usan umbrales.
- Sesgos: no se documenta ningun analisis de sesgos; al heredar el backbone de `bert-base-uncased` y entrenarse solo en SST-2, es probable que arrastre sesgos de dominio y de genero/raza del corpus original, sin que el autor los cuantifique.
- Riesgo de alucinacion: bajo en el sentido generativo (no genera texto), pero puede producir clasificaciones erroneas con alta confianza en dominios alejados de resenas de cine.
- Licencia MIT: permite uso comercial, pero el codigo remoto y la libreria NeuralOps deben revisarse por separado; la cita del autor debe respetarse.
- Madurez: 90 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion joven, sin validacion externa ni tests de robustez publicados.
- Idiomas: solo ingles; el tokenizador de `bert-base-uncased` no esta pensado para otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-moba-attention-sst2
- Backbone base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Paper de referencia sobre MoBA (no citado en la model card): no disponible
