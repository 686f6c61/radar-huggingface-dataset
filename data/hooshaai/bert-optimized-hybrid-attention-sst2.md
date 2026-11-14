# Hooshaai/bert-optimized-hybrid-attention-sst2

## Resumen

`bert-optimized-hybrid-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `optimized_hybrid_attention` de la libreria NeuralOps, con complejidad efectiva subcuadratica (O(N) u O(N log N) segun el autor). Lo desarrolla Taha Majlesi (organizacion Hooshaai / tahamajs) como parte del proyecto NeuralOps Attention Zoo, un catalogo de variantes de atencion preentrenadas y destiladas sobre arquitecturas BERT.

El modelo resuelve una tarea concreta: clasificacion binaria de sentimiento en ingles sobre el split de validacion de GLUE SST-2, alcanzando un 91,63 % de accuracy, identico al del profesor `bert-base-uncased`. La relevancia tecnica esta en el enfoque de serializacion: el repositorio solo publica los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), y el codigo remoto reconstruye el resto de la red a partir del BERT base congelado. Se trata de un artefacto de investigacion orientado a evaluar mecanismos de atencion alternativos, no de un modelo de proposito general.

El checkpoint se entreno con el protocolo de destilacion por representaciones en cache de NeuralOps sobre una unica RTX 3090 de 24 GB, en 185 pasos de optimizacion y 59,4 segundos, lo que lo convierte en un ejemplo de destilacion de bajo coste reproducible en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `optimized_hybrid_attention` subcuadratica en las 12 capas |
| Parametros totales | 110 M (heredados de BERT-base; el repo solo publica ~55 MB de pesos de atencion y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base soporta 512 tokens; el autor no lo explicita) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras variantes |
| Idiomas soportados | Ingles (tag `en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serializacion modular attention-only) |

## Arquitectura y entrenamiento

El modelo parte de BERT-base (12 capas, 768 dimensiones ocultas, 110 M de parametros) y reemplaza la atencion multi-cabeza estandar por `optimized_hybrid_attention`, que segun el autor reduce la complejidad operativa de O(N^2) a O(N) u O(N log N). Los pesos del cuerpo base se mantienen congelados; unicamente se entrenan y publican los parametros de atencion y la cabeza de clasificacion, que el shim de codigo remoto (`modeling_neuralops_bert.py`) aplica sobre `bert-base-uncased` en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, en dos etapas: alineamiento de subespacio oculto y despues KL sobre logits mas entropia cruzada de la tarea. La destilacion se hace offline con representaciones en cache, sin asignar VRAM al profesor. Se ejecuto en una RTX 3090 (24 GB) con un pico de 9664 MB, 185 pasos, throughput efectivo de 25 534,7 tokens/s y una duracion total de 59,4 s. El dataset es GLUE SST-2 (clasificacion binaria de sentimiento).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre textos tipo SST-2.
- Clasificacion de secuencias cortas con la cabeza `AutoModelForSequenceClassification` (2 etiquetas).
- Inferencia con `trust_remote_code=True` en Hugging Face Transformers y carga via API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- Compatibilidad con el ecosistema de tokenizadores de BERT-base (`bert-base-uncased`).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidad multilingue: no; solo ingles.
- No dispone de modo thinking ni de capacidades de instruccion.

## Casos de uso

- Analisis de sentimiento en resenas de producto en ingles: el modelo clasifica cada resena como positiva o negativa con una precision del 91,63 % en SST-2, adecuado para pipelines de monitorizacion de opinion a escala.
- Moderacion de comentarios y filtrado de toxicidad basico: como clasificador binario rapido, se puede usar como primera etapa de un pipeline de moderacion antes de modelos mas costosos.
- Enrutamiento de tickets de soporte: clasificar el tono del mensaje del cliente (positivo/negativo) para priorizar escalados o disparar alertas de insatisfaccion.
- Investigacion sobre mecanismos de atencion: sirve como referencia reproducible para comparar `optimized_hybrid_attention` frente a atencion cuadratica estandar en tareas GLUE, con pesos de solo 55 MB.
- Benchmarking de destilacion: el protocolo y las metricas publicadas (185 pasos, 59,4 s, 9664 MB de pico) permiten reproducir el experimento en una unica GPU de consumo.
- Prototipado rapido en entornos con VRAM limitada: al cargar solo pesos de atencion y cabeza, el footprint de descarga es minimo y la reconstruccion se delega al codigo remoto.
- Evaluacion de eficiencia subcuadratica: util para medir latencia y memoria en secuencias largas frente a BERT-base clasico, aunque el autor no publica curvas de escalado.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,63 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | no calibrado | 0,3081 | convergido |

Telemetria de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion total | 59,4 s |
| Pasos de optimizacion | 185 |
| Throughput efectivo | 25 534,7 tokens/s |
| Pico de VRAM | 9664 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con mecanismos de atencion alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M de parametros); en FP32, unos 440 MB. Los pesos publicados son solo ~55 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el autor uso una RTX 3090 para el entrenamiento, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU para lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican mediciones de inferencia; solo el throughput de entrenamiento (25 534,7 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-optimized-hybrid-attention-sst2` | 110 M (55 MB publicados) | no disponible (512 en BERT-base) | 91,63 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (fine-tune SST-2) | 110 M | 512 | 91,63 % (profesor) | Apache 2.0 | Hugging Face, estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la informacion | Apache 2.0 | Hugging Face, estandar |
| `roberta-base` fine-tune SST-2 | 125 M | 512 | no disponible en la informacion | MIT | Hugging Face, estandar |

La comparativa con DistilBERT y RoBERTa no incluye cifras de SST-2 porque no se han proporcionado; el unico punto de referencia directo es el profesor BERT-base, con el que el modelo empata en accuracy.

## Limitaciones y advertencias

- Es un clasificador binario de sentimiento en ingles; no genera texto ni sigue instrucciones.
- El accuracy publicado (91,63 %) coincide exactamente con el del profesor, lo que sugiere que la mejora es de eficiencia computacional, no de calidad predictiva; no se aportan curvas de escalado que demuestren la ventaja subcuadratica en secuencias largas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de calibracion: la entropia cruzada del estudiante (0,3081) es peor que la del profesor (0,2428), lo que indica peor calibracion de las probabilidades.
- Sesgos: al heredar el corpus de BERT-base (BooksCorpus y Wikipedia en ingles), puede reflejar sesgos de esos datos; el autor no documenta analisis de sesgo.
- Limitacion de idioma: solo ingles; no se ha evaluado en castellano ni en otros idiomas.
- Licencia MIT permite uso comercial, pero el modelo depende de `bert-base-uncased` (Apache 2.0) y del codigo remoto de NeuralOps; conviene revisar la licencia del repositorio NeuralOps antes de produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; hay que auditar `modeling_neuralops_bert.py` antes de desplegarlo en entornos sensibles.
- El ID de Hugging Face del repositorio (`Hooshaai/...`) no coincide con el usado en los ejemplos de la model card (`tahamajs/...`); verificar la ruta correcta antes de cargar el modelo.
- Solo 59 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-optimized-hybrid-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
