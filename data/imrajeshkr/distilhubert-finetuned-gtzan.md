# imrajeshkr/distilhubert-finetuned-gtzan

## Resumen
El modelo `imrajeshkr/distilhubert-finetuned-gtzan` es un clasificador de audio obtenido por ajuste fino (*fine-tuning*) del modelo base `ntu-spml/distilhubert` sobre el conjunto de datos GTZAN, un corpus clásico de 10 géneros musicales. Lo publica el usuario imrajeshkr en Hugging Face con licencia Apache-2.0 y pipeline `audio-classification`. Su función es asignar una etiqueta de género musical a un fragmento de audio, no generar texto ni mantener conversaciones: es un modelo discriminativo de propósito específico.

Técnicamente es un encoder transformer de audio de 23.691.402 parámetros, derivado de la familia HuBERT mediante la técnica de destilación capa a capa que da origen a DistilHuBERT. El interés práctico de este checkpoint no está en la novedad arquitectónica, sino en su tamaño reducido: con menos de 24 millones de parámetros se puede ejecutar inferencia en CPU o en cualquier GPU de consumo, algo relevante para pipelines de etiquetado masivo de catálogos musicales donde el coste por inferencia importa más que la precisión máxima alcanzable.

El autor declara una precisión de 0,86 y una pérdida de validación de 0,6079 tras 10 épocas de entrenamiento. Se trata de un checkpoint con muy baja adopción (7 descargas y 0 me gusta en el momento de redactar esta ficha) y con documentación mínima: la propia *model card* indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, por lo que buena parte de los detalles de implementación no están documentados públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de audio derivado de HuBERT mediante destilación (DistilHuBERT); detalles de capas y dimensiones ocultas no disponibles en la informacion proporcionada |
| Parametros totales | 23.691.402 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; al ser un modelo de audio, la entrada se define en segundos/muestras de audio y no en tokens de texto. El extractor de caracteristicas de la familia HuBERT/wav2vec2 opera a 16 kHz |
| Tipos de cuantizacion | No disponible; no se documentan cuantizaciones oficiales (no hay GGUF ni ONNX publicados en el repo) |
| Idiomas soportados | No disponible (clasificacion de audio; no procesa texto ni voz con salida linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); tamano del repo: 1,7 GB |
| Tarea | Clasificacion de audio (`audio-classification`) |
| Numero de clases | No disponible de forma explicita; el dataset GTZAN contiene 10 generos musicales |
| Dataset de ajuste fino | marsyas/gtzan, configuracion "all" |
| Modelo base | ntu-spml/distilhubert |
| Libreria | transformers (version declarada en el entrenamiento: 5.16.1) |

## Arquitectura y entrenamiento
El checkpoint es un ajuste fino del modelo `ntu-spml/distilhubert`, que a su vez es una version destilada de HuBERT. HuBERT es un encoder transformer que aprende representaciones de audio de forma auto-supervisada mediante objetivos de prediccion de unidades ocultas (*hidden units*); DistilHuBERT reduce el coste computacional aplicando destilacion capa a capa desde el modelo profesor, de modo que el alumno conserva buena parte de la calidad representacional con una fraccion de los parametros. El resultado es un encoder de tamano reducido (23,69 M de parametros en este checkpoint, incluyendo la cabeza de clasificacion) que produce *embeddings* de audio reutilizables para tareas *downstream*.

Sobre el procedimiento de ajuste fino, la *model card* documenta los hiperparametros: learning rate 5e-05, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 100 pasos de calentamiento, 10 epocas y precision mixta nativa (AMP). El entrenamiento se genero con `Trainer` de Transformers (version 5.16.1), PyTorch 2.11.0+cu128, Datasets 2.19.0 y Tokenizers 0.23.1. No se documenta la composicion exacta del dataset, si se aplico aumento de datos, ni si hubo etapas de RLHF/DPO (no aplicables en un clasificador de audio). Tampoco se especifica la estrategia de seleccion del mejor checkpoint ni si la metrica de 0,86 corresponde al mejor epoch o al ultimo.

## Capacidades
- Clasificacion de genero musical: asigna una etiqueta de genero a un fragmento de audio, con precision declarada de 0,86 sobre GTZAN.
- Extraccion de representaciones de audio: al derivar de DistilHuBERT, el encoder puede emplearse para obtener *embeddings* de audio reutilizables en tareas de recuperacion o similitud musical.
- Inferencia de bajo coste: 23,69 M de parametros y pesos en safetensors, ejecutables en CPU y en GPUs de gama baja.
- Integracion con el ecosistema Transformers: compatible con `pipeline("audio-classification")` y con la etiqueta `endpoints_compatible` del repositorio.
- Capacidades multilingues: no aplica; el modelo no procesa texto.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo generativo ni agentico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio generativo): no disponibles; se limita a clasificacion de audio.

## Casos de uso
- Catalogacion automatica de bibliotecas musicales: dado un catalogo de decenas de miles de pistas, el modelo permite etiquetar cada fragmento por genero en lote sobre CPU o GPU de gama baja, reduciendo el coste frente a encoders de mayor tamano.
- Sistemas de recomendacion musical: las etiquetas de genero y los *embeddings* del encoder alimentan un motor de similitud para generar listas de reproduccion por genero o por afinidad.
- Moderation y filtrado de contenido en plataformas UGC: deteccion previa de genero antes de aplicar reglas de negocio o de derivar a un revisor humano, como primera etapa de un pipeline de moderacion.
- Analitica de emisoras de radio y podcasts: clasificacion de bloques musicales en emisiones grabadas para medir la distribucion de generos por franja horaria.
- Seleccion de banda sonora en publicidad y postproduccion: busqueda por genero dentro de un banco de musica de libreria para localizar candidatos de forma rapida.
- Investigacion en Music Information Retrieval: *baseline* ligero y reproducible (licencia Apache-2.0, hiperparametros documentados) para comparar arquitecturas de destilacion en clasificacion de genero.
- Preprocesado para otros modelos: el encoder sirve para generar *embeddings* que alimenten clasificadores *downstream* mas especificos (mood, instrumentacion, tempo).
- Herramientas de auto-etiquetado en DAWs o gestores de musica local: al caber en CPU y ocupar menos de 100 MB en FP32, puede embeberse en aplicaciones de escritorio.

## Benchmarks y rendimiento
Resultado declarado por el autor en la *model-index* de la *model card*. La metrica figura como no verificada (`verified: false`) y la particion declarada para el dataset es `train`, por lo que no consta una evaluacion sobre un *test set* independiente.

| Tarea | Dataset | Split declarado | Metrica | Valor |
|---|---|---|---|---|
| Clasificacion de audio | GTZAN (marsyas/gtzan, config "all") | train | Accuracy | 0,86 |
| Clasificacion de audio | GTZAN (evaluacion interna del Trainer) | evaluacion | Loss | 0,6079 |

Progresion del entrenamiento reportada en la *model card* (loss de entrenamiento, loss de validacion y precision por epoca):

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 113 | 1,8545 | 1,7777 | 0,52 |
| 2.0 | 226 | 1,1466 | 1,2685 | 0,59 |
| 3.0 | 339 | 1,0664 | 0,9624 | 0,71 |
| 4.0 | 452 | 0,6706 | 0,8840 | 0,72 |
| 5.0 | 565 | 0,5272 | 0,7251 | 0,80 |
| 6.0 | 678 | 0,3717 | 0,6298 | 0,83 |
| 7.0 | 791 | 0,2526 | 0,5972 | 0,82 |
| 8.0 | 904 | 0,1084 | 0,6163 | 0,83 |
| 9.0 | 1017 | 0,1086 | 0,6078 | 0,85 |
| 10.0 | 1130 | 0,0805 | 0,6079 | 0,86 |

No se han publicado otros resultados de benchmarks en la informacion disponible (ni comparaciones con MMLU, HumanEval o GSM8K, que no aplican a un modelo de audio).

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 23.691.402 parametros, lo que supone aproximadamente 95 MB en FP32, 47 MB en FP16/BF16 y 24 MB en INT8. El pico real de memoria depende del tamano del lote y de la duracion del audio de entrada, pero en cualquier caso es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Funciona sin problemas en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, T4, L4, A10, A100 o H100; las GPU de gama alta quedan sobredimensionadas salvo que se procesen lotes muy grandes.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable. Con 23,69 M de parametros, la inferencia sobre fragmentos cortos es del orden de decenas de milisegundos por muestra en CPUs modernas; no se dispone de cifras oficiales de latencia o *throughput*.
- Opciones de despliegue: `transformers` con `pipeline("audio-classification")`, PyTorch nativo, exportacion a ONNX (no documentada oficialmente, requiere conversion manual), TorchScript, Hugging Face Inference Endpoints (el repo incluye la etiqueta `endpoints_compatible`) y Hugging Face Spaces. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. No se han publicado mediciones oficiales.

## Comparativa con modelos similares
Solo la primera fila se sustenta en los datos proporcionados sobre este modelo; para el resto de alternativas, las metricas y el recuento de parametros no estan disponibles en la informacion recibida.

| Modelo | Parametros | Entrada | Accuracy en GTZAN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imrajeshkr/distilhubert-finetuned-gtzan | 23.691.402 | audio a 16 kHz | 0,86 (declarado por el autor, no verificado) | Apache-2.0 | Hugging Face |
| ntu-spml/distilhubert (modelo base) | No disponible (el ajuste fino conserva la arquitectura del base, salvo la cabeza de clasificacion) | audio a 16 kHz | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| wav2vec2-base ajustado en GTZAN (checkpoints comunitarios) | No disponible | audio a 16 kHz | No disponible | Segun el checkpoint | Hugging Face (multiples checkpoints de la comunidad) |
| AST / Audio Spectrogram Transformer ajustado en GTZAN | No disponible | espectrograma Mel | No disponible | Segun el checkpoint | Hugging Face |

Criterio cualitativo: frente a alternativas basadas en wav2vec2-base o en AST, la ventaja de este checkpoint es el tamano (23,69 M de parametros) y la licencia permisiva Apache-2.0, a costa de una precision declarada de 0,86 que no ha sido verificada de forma independiente ni comparada con esas alternativas en condiciones equivalentes de particion de datos.

## Limitaciones y advertencias
- Documentacion insuficiente: la *model card* indica "More information needed" en descripcion del modelo, usos previstos, limitaciones y datos de entrenamiento. No se especifica la composicion del dataset ni el preprocesado aplicado.
- Metrica no verificada: la precision de 0,86 esta marcada como `verified: false` y la *model-index* declara la particion `train` del dataset GTZAN, por lo que no hay garantia de que proceda de un conjunto de prueba independiente.
- Riesgo de sobreajuste: la *loss* de entrenamiento cae hasta 0,0805 mientras la de validacion se estanca en torno a 0,60 desde la epoca 6 y repunta ligeramente (0,5972 en la epoca 7 frente a 0,6079 en la 10). El margen de mejora real en generalizacion parece agotado.
- Dominio restringido: entrenado exclusivamente con fragmentos de GTZAN, un corpus de 10 generos musicales con fragmentos de 30 segundos. Su comportamiento fuera de ese dominio (musica no occidental, grabaciones largas, audio con ruido o habla) no esta documentado.
- Salida de clase unica: no se documenta soporte para etiquetado multi-genero o multi-etiqueta, ni la lista exacta de etiquetas de salida.
- Sesgos: los sesgos del modelo reflejan los del corpus GTZAN, que la literatura especializada ha descrito como desequilibrado en la representacion de generos y estilos no occidentales. No se han realizado evaluaciones de equidad documentadas por el autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en fragmentos ambiguos o atipicos.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial con conservacion del aviso de licencia. No obstante, la procedencia y licencia de los audios de GTZAN es un asunto discutido en la literatura (trabajos sobre los defectos y problemas de derechos del dataset), por lo que conviene revisar la situacion antes de reutilizar el modelo en productos comerciales.
- Adopcion muy baja: 7 descargas y 0 me gusta en el momento de redactar la ficha, sin revisiones ni validaciones independientes conocidas.
- Repositorio de 1,7 GB: coherente con el almacenamiento de checkpoints intermedios de las 10 epocas, muy superior a los aproximadamente 95 MB de los pesos finales en FP32.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/imrajeshkr/distilhubert-finetuned-gtzan
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset de ajuste fino: https://huggingface.co/datasets/marsyas/gtzan
- Búsqueda web: los resultados devueltos no contienen ninguna fuente relevante sobre el modelo, el dataset o la arquitectura (unicamente enlaces a YouTube), por lo que no se anaden enlaces adicionales. La referencia academica de la arquitectura base es el articulo que introduce DistilHuBERT (Chang, Yang y Lee), cuyo identificador y URL no se han podido confirmar con la informacion recibida.
