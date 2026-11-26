# Linn-9/ENGLISH-EMOTION

## Resumen

ENGLISH-EMOTION es un clasificador de emociones en ingles construido mediante fine-tuning de DistilBERT-base-uncased. Lo publica el usuario Linn-9 en Hugging Face y resuelve una tarea concreta de procesamiento de lenguaje natural: asignar un texto corto en ingles a una de seis categorias emocionales (sadness, joy, love, anger, fear, surprise). No es un modelo generativo, sino un cabezal de clasificacion de secuencias sobre el encoder destilado de BERT.

El modelo parte de DistilBERT, la variante destilada de BERT con 66,96 millones de parametros y 6 capas, lo que lo hace ligero y apto para inferencia en CPU o GPU de consumo. El autor lo entrena sobre el split de entrenamiento de 16.000 ejemplos del dataset Emotion y reporta una accuracy de 0,9345 y un F1 ponderado de 0,9348 en el split de validacion de 2.000 ejemplos.

Su relevancia es practica: ofrece un clasificador de emociones pequeno, con licencia Apache 2.0 y pesos en safetensors, facil de integrar en pipelines de analisis de sentimiento fino, moderacion de contenido o enriquecimiento de datos. La contrapartida es que se trata de un modelo de autor individual, sin benchmarks externos ni validacion independiente, y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un encoder transformer de 6 capas y 66 millones de parametros obtenido por destilacion de BERT-base. Sobre ese encoder se anade una cabeza de clasificacion con 6 salidas, una por emocion. Los IDs de etiqueta son 0 = sadness, 1 = joy, 2 = love, 3 = anger, 4 = fear y 5 = surprise.

El entrenamiento se realizo sobre el split de entrenamiento de 16.000 ejemplos del dataset Emotion. La configuracion seleccionada fue learning rate 2e-05, 1 epoca, batch size 8 y semilla 42. El autor indica que el split de validacion de 2.000 ejemplos se uso tanto para medir el rendimiento como para seleccionar el learning rate, lo que implica que las metricas reportadas no proceden de un conjunto de test independiente. No se documentan tecnicas de RLHF, DPO ni aumentacion de datos.

## Capacidades

- Clasificacion de texto corto en ingles en seis categorias emocionales: sadness, joy, love, anger, fear y surprise.
- Asignacion de una unica etiqueta por entrada (clasificacion multiclase, no multietiqueta).
- Integracion directa con la pipeline `text-classification` de Transformers.
- Inferencia ligera: 66,96 millones de parametros permiten ejecucion en CPU con latencia baja para textos cortos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Analisis de sentimiento fino en resenas de producto: clasificar comentarios cortos en las seis emociones permite distinguir entre enfado, decepcion (sadness) y sorpresa, algo que un analisis positivo/negativo no captura.
- Moderacion de contenido en foros y redes: detectar mensajes con carga de anger o fear para priorizar revision humana, aprovechando el bajo coste de inferencia del modelo.
- Enriquecimiento de datasets de encuestas: etiquetar respuestas abiertas cortas con su emocion dominante antes de un analisis estadistico agregado.
- Monitorizacion de atencion al cliente: clasificar transcripciones de interacciones breves para detectar clientes con emociones negativas y activar escalado.
- Investigacion en psicologia computacional: anotar corpus de texto en ingles con etiquetas emocionales de forma automatica y reproducible, dado que los pesos y la licencia permiten uso academico y comercial.
- Preprocesado para sistemas de recomendacion: incorporar la emocion detectada en resenas como feature adicional en un modelo de ranking.
- Clasificacion en tiempo real en entornos con recursos limitados: al ser un DistilBERT de 67 millones de parametros, puede desplegarse en contenedores pequenos o en el borde sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9345 | Validacion (2.000 ejemplos, Emotion) |
| F1 ponderado | 0,9348 | Validacion (2.000 ejemplos, Emotion) |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de las metricas de validacion reportadas por el autor. No hay comparacion con MMLU, HumanEval, GSM8K ni con otros clasificadores de emociones, y el split de validacion se uso tambien para seleccion de hiperparametros, por lo que las cifras pueden estar optimistamente sesgadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32); el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o una T4 son mas que suficientes.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) y tambien en CPU.
- Opciones de despliegue: pipeline de Transformers, TorchServe, ONNX Runtime, Triton Inference Server. No se documenta soporte de vLLM, llama.cpp ni Ollama, orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ENGLISH-EMOTION (Linn-9) | 66,96 M | no disponible | Clasificacion de 6 emociones en ingles | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Analisis de sentimiento binario | Apache 2.0 | Hugging Face |
| roberta-base-go_emotions | ~125 M | 512 tokens | Clasificacion multietiqueta de 28 emociones | MIT | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | ~82 M | 512 tokens | Clasificacion de 7 emociones en ingles | MIT | Hugging Face |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no se dispone de datos de rendimiento comparativo directo con ENGLISH-EMOTION. Frente a las alternativas, este modelo ofrece menos etiquetas y menos validacion externa, aunque comparte la ventaja de ser ligero y de licencia permisiva.

## Limitaciones y advertencias

- El modelo asigna una sola etiqueta por entrada, aunque un texto puede expresar varias emociones simultaneas; el autor lo reconoce explicitamente.
- El sarcasmo, la negacion y las expresiones ambiguas provocan errores de clasificacion, segun la propia model card.
- Requiere contexto conversacional que el modelo no recibe: frases que dependen del turno anterior pueden clasificarse mal.
- Solo admite ingles; no hay evidencia de comportamiento en castellano u otros idiomas.
- Las metricas reportadas proceden de un split de validacion usado tambien para seleccionar el learning rate, sin conjunto de test independiente.
- No se documentan sesgos demograficos ni de dominio; al entrenarse sobre el dataset Emotion, puede heredar los sesgos de ese corpus.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar la procedencia del dataset Emotion y sus condiciones de uso.
- Modelo con cero descargas y sin validacion de la comunidad en el momento de la ficha; no se recomienda para produccion critica sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/Linn-9/ENGLISH-EMOTION
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset Emotion: no disponible en la informacion proporcionada
- Paper de DistilBERT: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
