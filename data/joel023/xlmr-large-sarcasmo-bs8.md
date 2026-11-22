# joel023/xlmr-large-sarcasmo-bs8

## Resumen

xlmr-large-sarcasmo-bs8 es un modelo de clasificación de texto en castellano obtenido por ajuste fino (fine-tuning) de FacebookAI/xlm-roberta-large sobre un corpus denominado "Sarcasmo combinado". Lo desarrolla el usuario joel023 y su tarea concreta es la detección de sarcasmo en textos en espanol, formulada como clasificación binaria o multiclase segun la etiqueta del dataset de entrenamiento (no detallada en la model card).

Se trata de un encoder transformer de tipo XLM-RoBERTa en su variante large, con 559.892.482 parametros y pesos en safetensors. No es un modelo generativo: no produce texto, sino una etiqueta y una distribución de probabilidad sobre las clases. Su relevancia es acotada pero practica: cubre un nicho linguistico (sarcasmo en espanol) para el que existen pocos recursos publicos, y ofrece una licencia MIT que permite uso comercial sin restricciones adicionales.

El modelo se publico en noviembre de 2026, no tiene descargas ni likes registrados y su model card esta generada automaticamente por el Trainer de Hugging Face, con secciones de descripcion, usos previstos y datos de entrenamiento sin completar. Cualquier evaluacion en produccion debe hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), fine-tuning para clasificacion de texto |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa soporta hasta 512 tokens de entrada; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento; compatible con cuantizacion posterior via bitsandbytes/ONNX, no declarada por el autor) |
| Idiomas soportados | es (espanol) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un encoder transformer con 24 capas, atencion multi-cabeza y embeddings multilingues, preentrenado por Facebook AI con objetivos de lenguaje enmascarado sobre corpus multilingues. Sobre esa base, el autor aplica un fine-tuning supervisado para clasificacion de texto, anadiendo una cabeza de clasificacion sobre la representacion del token especial `<s>`.

Los hiperparametros declarados en la model card son: learning rate 1e-05, batch de entrenamiento 8, batch de evaluacion 32, semilla 42, optimizador PagedAdamW de 8 bits con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup del 10 %, 10 epocas y entrenamiento en precision mixta nativa (AMP). El dataset de entrenamiento se denomina "Sarcasmo combinado", pero la model card no especifica su composicion, tamano, origen de las anotaciones ni el esquema de etiquetas. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo discriminativo de este tipo.

La evolucion del entrenamiento muestra sobreajuste a partir de la quinta o sexta epoca: la perdida de validacion sube de 0.3214 (epoca 1) a 0.7442 (epoca 9) mientras la perdida de entrenamiento cae de 0.5266 a 0.0156. La mejor metrica de validacion se alcanza en las epocas 7 y 9 con F1 de 0.9269, aunque el checkpoint final no es necesariamente el optimo.

## Capacidades

- Clasificacion de texto en espanol orientada a la deteccion de sarcasmo.
- Salida de etiqueta y probabilidades por clase (logits y softmax) mediante `pipeline("text-classification")`.
- Procesamiento de entradas de hasta 512 tokens (limite arquitectonico de XLM-RoBERTa; no confirmado explicitamente por el autor).
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al espanol segun la etiqueta de idioma declarada, aunque la base XLM-RoBERTa es multilingue.
- Integracion con Text Embeddings Inference y endpoints compatibles, segun los tags del repositorio.

## Casos de uso

- Moderacion de comunidades en linea: clasificar comentarios y publicaciones de foros o redes en espanol para marcar posibles mensajes sarcasticos que un filtro literal interpretaria mal, reduciendo falsos positivos en sistemas de analisis de sentimiento.
- Analisis de sentimiento en redes sociales: como capa previa que detecte sarcasmo antes de aplicar un clasificador de polaridad, ya que el sarcasmo invierte con frecuencia la polaridad superficial del texto.
- Monitorizacion de reputacion de marca: procesar menciones en espanol y separar criticas genuinas de comentarios ironicos, mejorando la calidad de los informes de sentimiento.
- Investigacion en linguistica computacional: servir como baseline reproducible (licencia MIT, pesos publicos) para estudios sobre sarcasmo e ironia en espanol, con la cautela de que el dataset de entrenamiento no esta documentado.
- Enriquecimiento de datasets de anotacion: preetiquetar grandes volumenes de texto en espanol para que anotadores humanos revisen solo los casos dudosos, acelerando la creacion de corpus.
- Filtrado en pipelines de datos para entrenamiento de LLM: descartar o marcar textos sarcasticos que podrian introducir ruido en tareas de instruccion o en la evaluacion de modelos generativos.
- Analisis de conversaciones de atencion al cliente: detectar tono ironico en transcripciones de chats o correos en espanol para priorizar la revision humana de casos potencialmente conflictivos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Loss | 0.7442 |
| Accuracy | 0.9269 |
| Precision | 0.9270 |
| Recall | 0.9269 |
| F1 | 0.9269 |
| F1 Macro | 0.9269 |

Evolucion por epoca (extracto de la model card):

| Epoca | Validation loss | Accuracy | F1 |
|---|---|---|---|
| 1 | 0.3214 | 0.8828 | 0.8827 |
| 3 | 0.4122 | 0.9190 | 0.9190 |
| 5 | 0.5667 | 0.9243 | 0.9243 |
| 7 | 0.5931 | 0.9269 | 0.9269 |
| 9 | 0.7442 | 0.9269 | 0.9269 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible, ni comparaciones con otros detectores de sarcasmo en espanol.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, mas activaciones; en la practica unos 3-4 GB con batch pequeno.
- En fp16/bf16: aproximadamente 1,1 GB de pesos; cabe con holgura en GPUs consumer.
- Cabe en cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.), e incluso en CPU para inferencia de baja concurrencia.
- GPU recomendadas para produccion con alto throughput: A100, H100, L40S o RTX 4090; para cargas moderadas, T4 o L4 son suficientes.
- Despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag declarado), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y servidores compatibles con modelos de clasificacion. No se documenta soporte GGUF/llama.cpp ni vLLM para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-large-sarcasmo-bs8 | 559,9 M | no disponible (limite arquitectonico 512) | Deteccion de sarcasmo en espanol | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 | Modelo base multilingue (MLM) | MIT | Hugging Face |
| RoBERTa-base BNE (Plan TL) | ~125 M | 512 | Modelo base en espanol | Apache 2.0 | Hugging Face |
| BETO (bert-base-spanish-wwm-cased) | ~110 M | 512 | Modelo base en espanol | MIT | Hugging Face |

La comparacion directa con otros detectores de sarcasmo en espanol no esta disponible: no se han identificado en la informacion proporcionada modelos publicos equivalentes con los que contrastar metricas.

## Limitaciones y advertencias

- El dataset de entrenamiento ("Sarcasmo combinado") no esta documentado: se desconoce su tamano, procedencia, esquema de etiquetas y posibles sesgos de anotacion.
- Riesgo de sobreajuste: la perdida de validacion aumenta de forma sostenida desde la primera epoca mientras la de entrenamiento cae hasta 0.0156; el rendimiento en datos fuera de distribucion puede ser inferior al 0.9269 reportado.
- Las metricas proceden de un unico conjunto de evaluacion no descrito; no hay validacion cruzada ni evaluacion en dominios distintos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea con alta confianza en textos ironicos que no son sarcasticos o en sarcasmo sin marcadores lexicos.
- Sesgos potenciales por el origen del corpus: el sarcasmo varia por registro, region y variedad dialectal del espanol; el modelo puede rendir peor en variedades no representadas.
- Idioma limitado al espanol segun la etiqueta declarada, aunque la base sea multilingue.
- La model card esta generada automaticamente y las secciones de descripcion, usos previstos y datos de entrenamiento estan sin completar; no hay guia del autor sobre umbrales de decision ni calibracion.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad; conviene evaluar el modelo con datos propios antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joel023/xlmr-large-sarcasmo-bs8
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
