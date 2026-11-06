# cestflora/my_first_model

## Resumen

my_first_model es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario cestflora en Hugging Face. Se trata de un modelo derivado de DistilBERT, la variante destilada de BERT desarrollada por Hugging Face que reduce el tamaño del modelo original aproximadamente un 40 % manteniendo en torno al 97 % de su rendimiento en tareas de comprensión del lenguaje. Con 66.955.010 parámetros y un repositorio de 0,3 GB, es un modelo compacto orientado a inferencia eficiente en CPU y GPU de gama baja.

El modelo resuelve una tarea de clasificación de texto genérica, aunque la model card no especifica el dataset de entrenamiento ni las etiquetas concretas del clasificador. El autor declara una accuracy de 0,9318 y una pérdida de validación de 0,2330 sobre el conjunto de evaluación, resultados obtenidos tras dos épocas de entrenamiento con un learning rate de 2e-05. La relevancia de esta ficha es limitada: se trata de un experimento de fine-tuning publicado con la plantilla automática de Trainer, sin documentación adicional sobre usos previstos, datos o limitaciones.

La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que junto con su tamaño reducido lo convierte en un candidato razonable para prototipado rápido de clasificadores, siempre que se valide previamente sobre el dominio de destino, dado que se desconoce por completo la naturaleza de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica vía PyTorch y conversión a GGUF/ONNX con herramientas externas) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas con 12 cabezas de atención y una dimensión oculta de 768, obtenido mediante destilación por conocimiento del BERT-base original (12 capas). Sobre esta base se ha añadido una cabeza de clasificación de secuencias (sequence classification head), que es la que se entrena durante el fine-tuning. El modelo procesa texto tokenizado con el tokenizador WordPiece de distilbert-base-uncased y produce logits por clase sobre la representación del token [CLS].

El entrenamiento se realizó con el Trainer de Hugging Face durante 2 épocas, con batch size de 16, learning rate de 2e-05, scheduler lineal y el optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08. La pérdida de entrenamiento descendió de 0,2217 en la época 1 a 0,1490 en la época 2, mientras que la pérdida de validación pasó de 0,2072 a 0,2330, lo que sugiere un cierto sobreajuste en la segunda época. No se documenta el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). Las versiones de framework declaradas son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada mediante la cabeza de clasificación entrenada; el número y significado de las clases no está documentado.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para párrafos, titulares, reseñas cortas o fragmentos de documentos.
- Extracción de representaciones contextuales del texto (embeddings) reutilizables para otras tareas si se descarta la cabeza de clasificación.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 67 millones de parámetros.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidades multilingües no documentadas; el modelo base es predominantemente inglés.

## Casos de uso

- Clasificación de reseñas o comentarios: el modelo puede etiquetar opiniones de usuarios en categorías predefinidas (positiva/negativa, temática, etc.) siempre que se haya entrenado para ello y se valide sobre el dominio concreto, dado que el dataset original es desconocido.
- Moderación de contenido en foros o comentarios: uso como primer filtro para detectar categorías problemáticas en textos cortos, con latencia baja en CPU y posibilidad de desplegarse en contenedores ligeros.
- Enrutamiento de tickets de soporte: clasificar consultas entrantes en departamentos o tipos de incidencia antes de pasarlas a un sistema humano o a un LLM más costoso.
- Análisis de sentimiento en pipelines de monitorización de marca: procesar grandes volúmenes de menciones en redes sociales con un coste computacional mínimo por documento.
- Etiquetado de datos para entrenamiento de modelos mayores: usar el clasificador como preetiquetador en un flujo de active learning, revisando manualmente solo los casos de baja confianza.
- Prototipado rápido de clasificadores en entornos con recursos limitados: servir el modelo con Hugging Face Inference Endpoints (el repo está marcado como endpoints_compatible y text-embeddings-inference) o con un contenedor propio en una instancia pequeña.
- Extracción de embeddings para búsqueda semántica ligera: reutilizar las representaciones del encoder para indexar documentos cortos en un sistema de recuperación de baja latencia.

## Benchmarks y rendimiento

La model-index del autor no incluye resultados de benchmarks estándar (MMLU, GLUE, etc.). Los únicos datos declarados son los de validación durante el entrenamiento:

| Metrica | Epoca 1 | Epoca 2 (final) |
|---|---|---|
| Training loss | 0,2217 | 0,1490 |
| Validation loss | 0,2072 | 0,2330 |
| Accuracy | 0,9211 | 0,9318 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB de pesos (67 M parámetros × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU con 1 GB o más.
- En fp16 o cuantización int8, el modelo ocupa del orden de 130 MB o 70 MB respectivamente, lo que permite ejecutarlo en CPU con latencia de milisegundos por secuencia corta.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda RTX 3060/4090, A10, L4 o superiores. No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y modelos integrados con suficiente memoria compartida.
- Opciones de despliegue: transformers con pipeline de text-classification, Hugging Face Inference Endpoints (repo marcado como compatible), Text Embeddings Inference, ONNX Runtime, así como conversión a GGUF para llama.cpp/Ollama si se desea.
- Latencia y throughput: no se han publicado mediciones oficiales; por el tamaño del modelo se espera un throughput de cientos a miles de secuencias por segundo en GPU y de decenas a cientos en CPU, dependiendo de la longitud de entrada y del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cestflora/my_first_model | 66,9 M | 512 | Clasificación de texto (fine-tune) | Apache 2.0 | Hugging Face, 19 descargas |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 514 | Modelo base (MLM) | MIT | Hugging Face, ampliamente usado |

Frente a distilbert-base-uncased, este modelo añade una cabeza de clasificación entrenada, pero carece de la documentación y validación externa del modelo base. Frente a bert-base-uncased y roberta-base, ofrece menor capacidad representacional pero mayor velocidad de inferencia y menor huella de memoria. No se dispone de comparaciones de rendimiento en benchmarks estándar para este fine-tune concreto.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset" y "More information needed", por lo que no es posible saber qué clases predice ni en qué dominio es fiable.
- Riesgo de sobreajuste: la pérdida de validación aumentó en la segunda época (de 0,2072 a 0,2330) mientras la de entrenamiento seguía bajando, lo que sugiere que el modelo puede generalizar peor de lo que indica la accuracy final.
- Sesgos: al derivar de distilbert-base-uncased, hereda los sesgos presentes en los corpus web en inglés utilizados para entrenar el modelo base; no se han documentado evaluaciones de sesgo.
- Alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Limitación de contexto: 512 tokens; textos más largos deben truncarse o dividirse, lo que puede degradar la clasificación.
- Idioma: el modelo base está entrenado principalmente en inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente el origen de los datos de fine-tuning, no documentados por el autor.
- Madurez: 19 descargas y 0 likes; no hay evidencia de uso en producción ni validación por terceros. No se recomienda su uso directo en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cestflora/my_first_model
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
