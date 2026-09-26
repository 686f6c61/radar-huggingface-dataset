# mdshoaib2k/sentiment-model

## Resumen

sentiment-model es un ajuste fino (fine-tuning) de distilbert-base-uncased publicado por el usuario mdshoaib2k en HuggingFace para la tarea de clasificacion de texto, orientada a analisis de sentimiento. DistilBERT es una version destilada de BERT-base desarrollada por Hugging Face que reduce el numero de capas de 12 a 6 y el total de parametros de 110 M a unos 66,9 M, manteniendo aproximadamente el 97 % del rendimiento de BERT en tareas de comprension del lenguaje segun sus autores. El modelo resultante es, por tanto, un clasificador encoder-only de ~67 millones de parametros, con 512 tokens de contexto maximo heredados del modelo base y salida de clasificacion sobre una cabeza lineal.

El modelo se genero automaticamente con la clase Trainer de la libreria transformers, y su model card reconoce explicitamente que el dataset de entrenamiento es desconocido y que falta documentacion sobre usos previstos, limitaciones y procedimiento. En la evaluacion reportada alcanza una perdida de 0,7470, una exactitud (accuracy) de 0,6598 y un F1 ponderado y macro de 0,6493, cifras que, para una tarea de sentimiento tipica de 2 o 3 clases, indican un rendimiento moderado y un ajuste incompleto. El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors.

Su relevancia practica es limitada pero clara: sirve como ejemplo reproducible de pipeline de fine-tuning con Trainer, como punto de partida barato para experimentos de clasificacion de sentimiento en CPU o GPU de gama baja, y como caso de estudio de por que una model card autogenerada sin dataset ni metricas de referencia no basta para llevar un modelo a produccion. No se ha publicado informacion sobre el dataset, el numero de tokens de entrenamiento, la composicion de las clases ni el idioma de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT destilado, DistilBERT); 6 capas, 768 de dimension oculta, 12 cabezas de atencion |
| Parametros totales | 66.955.779 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos safetensors; no se han publicado versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (el modelo base distilbert-base-uncased se entrena principalmente con texto en ingles, en minusculas y sin distincion de acentos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de distilbert-base-uncased: un transformer encoder-only con 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, entrenado originalmente mediante destilacion de conocimiento supervisada desde BERT-base durante la fase de preentrenamiento (aproximadamente el 97 % del rendimiento de BERT con un 40 % menos de parametros y un 60 % mas rapido, segun los autores de DistilBERT). Sobre ese backbone se ha anadido una cabeza de clasificacion (clase `DistilBertForSequenceClassification`) ajustada para la tarea `text-classification`.

Los hiperparametros de entrenamiento documentados son: learning rate 2e-05, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante `ADAMW_TORCH_FUSED`, scheduler lineal y 3 epocas completas (174 pasos totales, 58 por epoca). La evolucion reportada es: epoca 1 con perdida de validacion 0,8737 y exactitud 0,6080; epoca 2 con 0,7226 y 0,6975; epoca 3 con 0,7117 y 0,6821. El mejor punto de validacion se alcanza en la epoca 2, y la epoca 3 muestra sobreajuste leve (la perdida de entrenamiento baja a 0,6785 mientras la de validacion sube respecto al minimo). No se documenta ningun tipo de RLHF, DPO ni ajuste por preferencias. El dataset de entrenamiento es, literalmente, desconocido segun la propia model card.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`; el modelo emite una o varias etiquetas con su puntuacion de probabilidad sobre entradas de hasta 512 tokens.
- Analisis de sentimiento: es el uso previsto por el nombre del modelo y su tarea, aunque la taxonomia de clases (binaria, ternaria u otra) no esta documentada.
- Clasificacion de secuencias cortas y medias: resenas, tuits, titulares, tickets y fragmentos de texto de una o pocas frases.
- Inferencia rapida en CPU: con ~67 M de parametros, el coste computacional es bajo y permite procesamiento por lotes sin GPU.
- Capacidad multilingue: no disponible; no hay declaracion de idiomas y el tokenizador del modelo base es un WordPiece en ingles sin distincion de mayusculas ni acentos.
- Tool calling / function calling: no soportado (modelo encoder-only de clasificacion; no genera texto).
- Agentes y razonamiento multi-paso: no soportado.
- Generacion de texto, codigo, matematicas, vision o audio: no soportado.
- Modo "thinking" o razonamiento explicito: no soportado.
- Embeddings reutilizables: las representaciones del encoder pueden extraerse para clasificacion con cabezas alternativas o como features, aunque no se documenta ningun uso de este tipo.

## Casos de uso

- Triaje de tickets de soporte: clasificar automaticamente cada ticket entrante como positivo, neutro o negativo para priorizar colas de atencion. El modelo procesa frases cortas con rapidez en CPU, aunque antes de desplegarlo seria necesario validar la taxonomia real de clases y reentrenar con datos propios.
- Analisis de resenas de producto: agregar la polaridad de miles de resenas de e-commerce para construir un panel de satisfaccion por producto o categoria. Su ventana de 512 tokens cubre resenas tipicas sin truncamiento significativo.
- Monitorizacion de redes sociales y marca: etiquetar menciones o publicaciones para detectar picos de sentimiento negativo y disparar alertas. Requiere preprocesado porque el modelo base esta optimizado para ingles y texto en minusculas.
- Analisis de encuestas NPS y CSAT: procesar las respuestas de texto libre de encuestas y agruparlas por polaridad para complementar la puntuacion numerica.
- Filtrado previo en moderacion de contenido: usar la señal de sentimiento como uno de varios indicadores para enrutar contenido a revision humana, nunca como decision automatica.
- Baseline en investigacion y docencia: servir de referencia reproducible de un pipeline `Trainer` completo (hiperparametros, metricas por epoca y artefactos safetensors) para comparar contra modelos mayores en la misma tarea.
- Extraccion de caracteristicas para modelos posteriores: usar el encoder como extractor congelado y entrenar un clasificador ligero encima cuando el dominio difiere mucho del original.
- Deteccion de urgencia en correo de cliente: combinar polaridad y palabras clave para marcar mensajes que requieren respuesta prioritaria en un flujo de atencion automatizada.

## Benchmarks y rendimiento

El autor no ha declarado resultados en el campo `model-index` (el array `results` esta vacio). Los unicos datos disponibles son las metricas de validacion de la propia model card:

| Metrica | Valor reportado |
|---|---|
| Loss (evaluacion) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado comparaciones con otros modelos ni resultados sobre conjuntos de referencia estandar (SST-2, GLUE, IMDB u otros) en la informacion disponible. La equivalencia exacta entre F1 weighted y F1 macro en todas las epocas sugiere un reparto de clases muy equilibrado, pero esto no puede confirmarse porque se desconoce el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 66.955.779 parametros): unos 268 MB en FP32, unos 134 MB en FP16/BF16 y unos 67 MB en INT8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; una RTX 3060, RTX 4060, T4, L4 o superior sobra para servir el modelo. No se necesita A100 ni H100 salvo por volumen de peticiones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU y en telefonos moviles mediante exportacion a ONNX o TensorFlow Lite.
- Inferencia en CPU: totalmente viable; un modelo de ~67 M de parametros es adecuado para procesamiento por lotes en servidor sin acelerador.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` es la via directa (asi esta etiquetado el repositorio, con `endpoints_compatible`). Tambien es exportable a ONNX Runtime, TorchScript, TensorFlow Lite y, con conversion adicional no documentada, a formatos de cuantizacion como GGUF/llama.cpp aunque este tipo de modelo no es el objetivo habitual de esas herramientas. Para servicio HTTP a escala se puede envolver en FastAPI o en Text Embeddings Inference (este ultimo orientado a embeddings, no a clasificacion).
- Latencia y throughput: no disponible. No se han publicado medidas. Como referencia orientativa, el modelo base DistilBERT es aproximadamente un 60 % mas rapido que BERT-base en inferencia, y con lotes de decenas de secuencias en GPU se alcanzan facilmente miles de secuencias por segundo en hardware moderno; en CPU el orden de magnitud es de decenas a cientos de secuencias por segundo. Estas cifras son estimaciones del modelo base y no mediciones de este ajuste concreto.
- Memoria en entrenamiento: el ajuste completo con batch 32 y 3 epocas cabe en una GPU de 8-12 GB, e incluso en CPU (el entrenamiento reportado duro 174 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| mdshoaib2k/sentiment-model | 66,9 M | 512 tokens | apache-2.0 | safetensors | Accuracy 0,6598; F1 0,6493 (validacion propia, dataset desconocido) | HuggingFace, 0 descargas y 0 likes en el momento del analisis |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | apache-2.0 | safetensors / PyTorch | Accuracy ~91 % en SST-2 dev, segun la model card del autor (cifra publica no verificada en esta ficha) | HuggingFace, ampliamente descargado y usado como referencia |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | MIT (segun su repositorio) | safetensors / PyTorch | Metricas publicadas por sus autores en su model card, no verificadas en esta ficha | HuggingFace, orientado a texto de redes sociales en ingles |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M | 512 tokens | MIT (segun su repositorio) | safetensors / PyTorch | Metricas publicadas por sus autores en su model card, no verificadas en esta ficha | HuggingFace, cubre varios idiomas incluido el castellano |

Observacion: la unica comparativa cuantitativa que puede hacerse con los datos aportados es interna al propio modelo. Frente a `distilbert-base-uncased-finetuned-sst-2-english`, que usa exactamente el mismo backbone y tamano, este ajuste queda muy por debajo en exactitud declarada (0,66 frente a ~0,91), lo que apunta a un dataset de entrenamiento mas ruidoso, mas dificil o peor etiquetado.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica literalmente "unknown dataset" y deja en blanco las secciones de descripcion, usos previstos y datos de evaluacion. No hay forma de saber que dominio, idioma ni taxonomia de clases ha aprendido el modelo.
- Metricas bajas para la tarea: una exactitud de 0,6598 y un F1 de 0,6493 son valores pobres para clasificacion de sentimiento, donde los modelos de referencia superan el 0,85-0,90. No se recomienda su uso directo en produccion sin validacion previa.
- Sobreajuste: la perdida de validacion minima se alcanza en la epoca 2 y empeora en la 3, mientras la de entrenamiento sigue bajando.
- Idiomas: no se declara ningun idioma soportado. El tokenizador es WordPiece sin distincion de mayusculas del modelo base, mayoritariamente ingles; el rendimiento en castellano es desconocido y probablemente deficiente.
- Tokenizacion sensible al texto: al ser un modelo "uncased" y sin normalizacion de acentos, el texto en castellano se degrada con frecuencia (perdida de informacion por acentos y mayusculas).
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en dominios alejados del entrenamiento, en ironia, sarcasmo y negaciones complejas.
- Sesgos: no evaluados ni documentados. Al desconocerse el corpus, no puede descartarse sesgo de dominio, de registro linguistico o demografico.
- Contexto limitado: 512 tokens. Textos mas largos se truncan y pierden informacion; no hay mecanismo de ventana deslizante documentado.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. No hay restricciones adicionales declaradas, pero la licencia del modelo no cubre los derechos sobre los datos con los que se entreno, que se desconocen.
- Madurez del repositorio: 0 descargas y 0 likes en el momento del analisis, sin issues ni discusion, sin versionado y sin mantenimiento conocido. Es un artefacto experimental, no un modelo mantenido.
- Versionado de dependencias poco convencional: la model card cita Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1; conviene verificar la compatibilidad real con la version de transformers instalada antes de cargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdshoaib2k/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019), referencia del backbone, no del ajuste: https://arxiv.org/abs/1910.01108
- Repositorio y paper de BERT (Devlin et al., 2018), arquitectura de origen: https://arxiv.org/abs/1810.04805

No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales especificos de este modelo.
