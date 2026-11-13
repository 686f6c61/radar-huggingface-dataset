# nguyenblog/results_v3

## Resumen

`nguyenblog/results_v3` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `vinai/phobert-base`, un transformer encoder basado en RoBERTa preentrenado para vietnamita. Lo publica el usuario `nguyenblog` en Hugging Face y su propósito declarado es la clasificación de texto, aunque la model card no especifica la tarea concreta ni el conjunto de datos empleado (aparece como "None dataset").

El modelo cuenta con 135.000.579 parámetros en formato safetensors, un tamaño coherente con la arquitectura PhoBERT-base (aproximadamente 135M de parámetros). El repositorio ocupa 0,5 GB y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales más allá de la atribución habitual.

Su relevancia es limitada: se trata de un artefacto de entrenamiento con métricas modestas (accuracy 0,65 y F1 0,5641 en el conjunto de evaluación), sin documentación sobre los datos, las etiquetas ni el dominio de aplicación. Resulta útil únicamente como referencia de un fine-tuning sobre PhoBERT o como punto de partida para reproducir el pipeline, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base de PhoBERT-base) |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (PhoBERT-base soporta hasta 256 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion dinamica via PyTorch) |
| Idiomas soportados | no disponible (el modelo base PhoBERT esta especializado en vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | vinai/phobert-base |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers 5.22.1 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `vinai/phobert-base`, un transformer encoder de tipo RoBERTa entrenado por VinAI Research sobre un corpus vietnamita de aproximadamente 20 GB de texto (Wikipedia y noticias). La arquitectura subyacente es la de RoBERTa-base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con un vocabulario SentencePiece adaptado al vietnamita. Sobre esa base se anade una cabeza de clasificacion para el numero de etiquetas de la tarea, que no se especifica.

El entrenamiento se realizo con el `Trainer` de Hugging Face durante 5 epocas, con un total de 100 pasos (20 pasos por epoca), lo que implica un conjunto de datos muy pequeno. Los hiperparametros declarados son: learning rate 2e-5, batch size de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precision mixta nativa (AMP). No se documenta el uso de RLHF, DPO ni tecnicas de aumento de datos. La perdida de validacion desciende de 0,9092 (epoca 1) a 0,8038 (epoca 4) y repunta ligeramente a 0,8345 en la epoca 5, lo que sugiere sobreajuste incipiente dado el reducido volumen de pasos.

## Capacidades

- Clasificacion de texto: genera una etiqueta predicha (y su distribucion de probabilidad) para una secuencia de entrada, segun el numero de clases configurado en la cabeza de clasificacion.
- Especializacion linguistica en vietnamita: hereda el tokenizador y el vocabulario de PhoBERT, por lo que el rendimiento esperado en otros idiomas es bajo.
- Inferencia por secuencia corta: al tratarse de un encoder con contexto limitado (256 tokens en PhoBERT-base), no esta disenado para documentos largos sin truncamiento o segmentacion previa.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking".
- No dispone de capacidades multilingues documentadas ni de instrucciones de prompt; es un clasificador discriminativo, no un modelo instructivo.

## Casos de uso

- Clasificacion de resenas o comentarios en vietnamita: el modelo puede asignar una etiqueta de sentimiento o categoria a textos cortos de usuarios, aprovechando el preentrenamiento de PhoBERT sobre corpus vietnamita. Requiere reentrenamiento o validacion previa, dado que la tarea original no esta documentada.
- Filtrado de contenido en plataformas: uso como clasificador binario o multiclase para moderacion de comentarios en vietnamita, con umbrales de confianza calibrados sobre un conjunto propio.
- Etiquetado de tickets de soporte: asignacion automatica de categoria a incidencias escritas en vietnamita, integrado como paso previo a un sistema de enrutamiento.
- Deteccion de spam o toxicidad: clasificacion de mensajes cortos en foros y redes, siempre que se reentrene o valide con datos del dominio objetivo.
- Baseline academico: punto de partida para experimentos de fine-tuning sobre PhoBERT, util para comparar tecnicas de entrenamiento o preprocesamiento en vietnamita.
- Clasificacion de titulares o noticias: categorizacion tematica de textos periodisticos vietnamitas de hasta 256 tokens, con truncamiento para piezas mas largas.
- Reproduccion de pipelines de entrenamiento: el modelo sirve como referencia de configuracion (learning rate, scheduler, AMP) para montar flujos similares con `Trainer`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,8345 |
| Accuracy | 0,65 |
| F1 | 0,5641 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 20 | 0,9092 | 0,60 | 0,4944 |
| 2 | 40 | 0,8932 | 0,65 | 0,5649 |
| 3 | 60 | 0,8290 | 0,625 | 0,5288 |
| 4 | 80 | 0,8038 | 0,65 | 0,5593 |
| 5 | 100 | 0,8345 | 0,65 | 0,5641 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, VLSP, etc.) en la informacion disponible. El `model-index` del repositorio esta vacio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 (135M de parametros), y menos de 0,5 GB con cuantizacion dinamica int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Para entrenamiento, una RTX 3090/4090 o una A100 permiten batches mayores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con `transformers`, o exportacion a ONNX Runtime. No se han publicado pesos GGUF ni recetas para llama.cpp u Ollama, que ademas no estan orientados a clasificacion encoder.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nguyenblog/results_v3 | 135M | no disponible (256 en base) | Clasificacion de texto | MIT | Hugging Face |
| vinai/phobert-base | ~135M | 256 | Representaciones y fine-tuning en vietnamita | MIT | Hugging Face |
| vinai/phobert-large | ~370M | 256 | Representaciones y fine-tuning en vietnamita | MIT | Hugging Face |
| xlm-roberta-base | ~278M | 512 | Multilingue, clasificacion y generacion de representaciones | MIT | Hugging Face |

La comparacion se limita a la familia PhoBERT y a alternativas multilingues de tamano similar. No hay datos de rendimiento comparables publicados para `results_v3` frente a estos modelos, por lo que la eleccion entre ellos debe basarse en el idioma objetivo (vietnamita) y en la validacion sobre el conjunto de datos propio.

## Limitaciones y advertencias

- Model card incompleta: no se especifica la tarea, el conjunto de datos, las etiquetas ni el dominio, lo que impide evaluar su idoneidad para casos concretos.
- Metricas modestas: accuracy 0,65 y F1 0,5641 sobre un conjunto de evaluacion no documentado; el rendimiento real en produccion es incierto.
- Sobreajuste probable: el entrenamiento se realizo solo con 100 pasos y la perdida de validacion repunta en la ultima epoca.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de genero, region o dominio presentes en el corpus.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Limitacion de idioma: el modelo base esta especializado en vietnamita; su uso en castellano u otros idiomas producira resultados pobres.
- Limitacion de contexto: PhoBERT-base maneja secuencias de hasta 256 tokens; textos mas largos deben truncarse o dividirse.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribucion y revisar las condiciones del modelo base `vinai/phobert-base`, tambien MIT.
- No apto para generacion de texto ni para tareas de razonamiento o agentes; es exclusivamente un clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenblog/results_v3
- Modelo base PhoBERT-base: https://huggingface.co/vinai/phobert-base
- Repositorio oficial de PhoBERT (VinAI Research): https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT: https://arxiv.org/abs/2003.00744
- Documentacion de `transformers` para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
