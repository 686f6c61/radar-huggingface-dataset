# ClaudiuO/learn_hf_food_not_food_text_classifier_distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier_distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de DistilBERT base uncased. Lo publica el usuario ClaudiuO en Hugging Face y su propósito, a juzgar por el identificador, es distinguir textos relacionados con comida de textos que no lo están. No es un modelo generativo ni un sistema conversacional: es un clasificador ligero pensado para etiquetar secuencias cortas.

El modelo parte de la arquitectura DistilBERT, una versión destilada de BERT con 6 capas y 66.955.010 parámetros totales, lo que lo sitúa en el rango de modelos pequeños y aptos para inferencia en CPU o GPU de gama baja. La ventana de contexto es la nativa de DistilBERT: 512 tokens. Se distribuye en formato safetensors y con licencia Apache 2.0.

Su relevancia práctica es limitada pero concreta: sirve como ejemplo de pipeline de fine-tuning con la librería Transformers y como clasificador de dominio muy específico. La model card está generada automáticamente por el Trainer y no documenta el dataset de entrenamiento, los idiomas ni los usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana nativa de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion a int8/fp16 con herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT, con 6 capas, atención multi-cabeza estándar y una cabeza de clasificación sobre el token `[CLS]` con dos etiquetas de salida. DistilBERT se obtiene por destilación de conocimiento de BERT base, conservando aproximadamente el 97 % del rendimiento del profesor con un 40 % menos de parámetros y una latencia menor.

El fine-tuning se realizó con el Trainer de Transformers sobre un dataset no identificado en la model card ("unknown dataset"). Los hiperparámetros declarados son: learning rate 1e-4, batch size de 32 en entrenamiento y evaluación, semilla 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y 10 épocas. El entrenamiento fue muy corto: 70 pasos en total (7 pasos por época), lo que indica un conjunto de datos de entrenamiento de tamaño reducido (del orden de unos pocos cientos de ejemplos). No se documenta composición del dataset, ni uso de RLHF, DPO ni aumentación de datos. Las versiones de framework declaradas son Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria: asigna una de dos etiquetas a una secuencia de entrada, presumiblemente "comida" frente a "no comida".
- Procesamiento de secuencias de hasta 512 tokens con el tokenizador WordPiece uncased de DistilBERT.
- Inferencia rápida y de bajo coste computacional gracias al tamaño reducido del modelo.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face según los tags del repositorio.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No tiene capacidades multimodales (ni visión ni audio).
- No se declaran capacidades multilingües específicas; el modelo base es uncased en inglés.

## Casos de uso

- Filtrado de contenidos gastronómicos: clasificar titulares, reseñas o publicaciones de redes sociales para separar las que tratan de comida de las que no, como paso previo a un sistema de recomendación o de moderación.
- Etiquetado de catálogos de recetas: procesar descripciones de productos o entradas de un recetario para asignar automáticamente la categoría "comida" frente a otras categorías.
- Enrutamiento en atención al cliente: derivar consultas entrantes a un departamento gastronómico o a otro genérico según la clasificación binaria del texto.
- Preprocesado en pipelines de datos: limpiar corpus web o de scraping eliminando documentos no relacionados con alimentación antes de un análisis posterior.
- Prototipado y docencia: servir como ejemplo reproducible de fine-tuning de DistilBERT con el Trainer, útil para aprender el flujo completo de entrenamiento y evaluación.
- Clasificación en el borde (edge): desplegar en CPU o dispositivos de bajos recursos por su tamaño de 0,3 GB y su baja latencia, por ejemplo en un servicio de validación de contenidos.
- Señal auxiliar en sistemas más grandes: usar la salida del clasificador como feature adicional en un modelo de ranking o de búsqueda vertical de recetas.

## Benchmarks y rendimiento

La model card declara métricas de evaluación del propio entrenamiento, pero el model-index oficial no incluye resultados. Los datos disponibles son los siguientes:

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0.0006 |
| Accuracy de evaluacion | 1.0 (100 %) |

Evolución del entrenamiento declarada por el autor:

| Epoca | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 0.4857 | 0.1464 | 0.98 |
| 2 | 0.0715 | 0.0090 | 1.0 |
| 3 | 0.0065 | 0.0027 | 1.0 |
| 4 | 0.0022 | 0.0014 | 1.0 |
| 5 | 0.0012 | 0.0010 | 1.0 |
| 6 | 0.0009 | 0.0008 | 1.0 |
| 7 | 0.0007 | 0.0007 | 1.0 |
| 8 | 0.0006 | 0.0006 | 1.0 |
| 9 | 0.0006 | 0.0006 | 1.0 |
| 10 | 0.0006 | 0.0006 | 1.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de clasificación como GLUE) en la información disponible. No se dispone de comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB de pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones; en la práctica cabe en menos de 1 GB.
- En fp16 o int8, el modelo ocupa del orden de 130 MB o 70 MB respectivamente, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4090, T4, A10, A100 y H100, aunque el hardware de gama alta está sobredimensionado para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: Transformers con PyTorch, `text-embeddings-inference` (soportado según los tags), endpoints de Hugging Face, ONNX Runtime y cuantización con herramientas externas. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | 512 | Clasificacion binaria de dominio | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 | Modelo base (MLM, sin cabeza de clasificacion) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Modelo base (MLM) | MIT | Hugging Face |

La comparación es estructural: este modelo es un fine-tuning de distilbert-base-uncased y, por tanto, comparte arquitectura y tamaño con su base. Frente a BERT base y RoBERTa base, ofrece menor coste computacional a cambio de una capacidad de representación algo inferior. No hay datos de rendimiento comparativo publicados para este fine-tuning concreto.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, los idiomas ni los usos previstos; la información sobre el dominio real de la clasificación es inferida del nombre del modelo.
- El accuracy de 1.0 en validación es sospechosamente alto y sugiere un conjunto de evaluación muy pequeño o poco representativo; no debe interpretarse como rendimiento en producción.
- El entrenamiento de solo 70 pasos indica un dataset reducido, con riesgo alto de sobreajuste y de baja generalización a dominios o estilos de texto distintos.
- El modelo base es uncased en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- No se documentan sesgos; al ser un clasificador binario de dominio, puede heredar sesgos del corpus no especificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios antes de desplegarlo.
- No hay pesos GGUF publicados; el despliegue en llama.cpp u Ollama requiere conversión manual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ClaudiuO/learn_hf_food_not_food_text_classifier_distilbert-base-uncased
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
