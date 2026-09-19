# Bektur756/rubert-tiny2-russian-sentiment

## Resumen

Bektur756/rubert-tiny2-russian-sentiment es un clasificador de sentimiento en ruso publicado por el usuario Bektur756, obtenido mediante ajuste fino completo (fine-tuning) del modelo base cointegrated/rubert-tiny2. El modelo resuelve una tarea de clasificacion de texto en tres clases —neutro (0), positivo (1) y negativo (2)— y esta pensado para escenarios de baja latencia, dado el tamano reducido del backbone original.

Se trata de un transformer tipo BERT de 29.194.707 parametros totales (unos 0,1 GB en el repositorio, pesos en safetensors), entrenado sobre el dataset MonoHime/ru_sentiment_dataset tras un proceso de limpieza y deduplicacion que dejo 180.853 ejemplos de entrenamiento, 9.642 de validacion y 9.642 de test. El entrenamiento se hizo con perdida de entropia cruzada ponderada por clase para compensar el desequilibrio del corpus, con un maximo de 128 tokens de secuencia.

Su relevancia es practica: ocupa tan poco que se puede servir en CPU o en GPU de gama baja con latencias de milisegundos (7,33 ms de media en una Tesla T4 y 13,84 ms en CPU de Colab para batch de 1), lo que lo hace util como componente de filtrado o enrutado en pipelines de analitica de opinion en ruso. La licencia MIT y el formato safetensors facilitan su integracion comercial, aunque la ausencia de resultados comparativos con otros modelos y el bajo numero de descargas (0 en el momento de la consulta) obligan a validarlo en el dominio de destino antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), derivada de cointegrated/rubert-tiny2; capas de clasificacion sobre el token [CLS] |
| Parametros totales | 29.194.707 (29,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens en entrenamiento (truncacion a max_length=128); el modelo base rubert-tiny2 admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los pesos se distribuyen en safetensors en precision completa, por lo que es viable aplicar cuantizacion dinamica INT8 con PyTorch o ONNX Runtime) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |
| Tarea (pipeline) | text-classification (analisis de sentimiento, 3 clases) |
| Etiquetas de clase | 0 = neutral, 1 = positive, 2 = negative |
| Dataset de entrenamiento | MonoHime/ru_sentiment_dataset |
| Modelo base | cointegrated/rubert-tiny2 |
| Tamano del repositorio | 0,1 GB |
| Metricas declaradas | accuracy, f1 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT pequeno heredado de rubert-tiny2, sobre el que se anade una cabeza de clasificacion de secuencia con tres salidas. No hay innovaciones de decodificacion ni mecanismos de atencion alternativos: es un clasificador discriminativo estandar, entrenado con el objetivo de entropia cruzada. El ajuste fue completo (todos los pesos actualizados), no mediante adaptadores ni LoRA, segun indica la model card.

Los datos de entrenamiento proceden de MonoHime/ru_sentiment_dataset, que tras limpieza y eliminacion de duplicados quedo en 180.853 ejemplos de train, 9.642 de validacion y 9.642 de test. La configuracion declarada es de 3 epocas, longitud maxima de secuencia 128, learning rate 2e-5, batch size de 64 y una sola Tesla T4. Se activo entropia cruzada ponderada por clase con pesos 1,3124 (neutral), 0,7020 (positivo) y 1,2292 (negativo), y el criterio de seleccion del mejor checkpoint fue el F1 de la clase negativa, no la metrica macro. No se menciona uso de RLHF, DPO ni destilacion.

## Capacidades

- Clasificacion de sentimiento en ruso en tres categorias: neutral, positivo y negativo, con salida de logits y probabilidades via softmax.
- Inferencia de muy baja latencia: 7,33 ms de media y 136,41 peticiones/s en Tesla T4; 13,84 ms de media y 72,26 peticiones/s en CPU de Colab, con batch size 1.
- Funcionamiento en CPU sin GPU dedicada, gracias a sus 29,2 M de parametros.
- Capacidad de procesar lotes (batch) al ser un modelo de clasificacion de secuencia estandar de transformers.
- Buen rendimiento relativo en la clase negativa: F1 de 0,8354 y recall de 0,8787, que fue ademas el criterio de seleccion del modelo.
- Integracion con pipelines de embeddings de texto y endpoints gestionados: el repositorio incluye las etiquetas text-embeddings-inference y endpoints_compatible.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito; es exclusivamente un clasificador.
- Capacidad multilingue: no, unicamente ruso.

## Casos de uso

- Monitorizacion de opinion en redes sociales rusas: clasificar en tiempo real publicaciones y comentarios como positivos, neutros o negativos para construir series temporales de sentimiento de marca; los 7,33 ms por peticion en T4 permiten procesar mas de 130 elementos por segundo en una sola GPU.
- Enrutado de tickets de soporte al cliente: usar la etiqueta negativa (con recall de 0,8787) como disparador para escalar conversaciones a agentes humanos o a colas prioritarias, reduciendo el tiempo de respuesta en casos de insatisfaccion.
- Analisis de resenas de producto en comercio electronico ruso: agregar el sentimiento de resenas de hasta 128 tokens para calcular puntuaciones de satisfaccion por articulo o categoria.
- Filtrado previo en pipelines de moderacion de contenido: descartar o marcar comentarios claramente negativos antes de pasarlos a modelos mas costosos de analisis de toxicidad.
- Investigacion academica en linguistica computacional y analisis de sentimiento en ruso: como linea base rapida y reproducible sobre MonoHime/ru_sentiment_dataset, con licencia MIT y artefactos safetensors de 0,1 GB que se pueden versionar sin problemas.
- Clasificacion por lotes offline: al ser un modelo de 29 M de parametros, se pueden procesar corpus completos en CPU, lo que abarata la anotacion retrospectiva de historicos de texto.
- Preetiquetado en pipelines de anotacion humana: el modelo puede generar etiquetas iniciales sobre grandes volumenes de texto ruso, que despues se corrigen manualmente, reduciendo el coste de anotacion.
- Integracion en servicios serverless o de borde: con pesos en safetensors y un footprint inferior a 120 MB en FP32, es viable desplegarlo en contenedores ligeros o dispositivos con recursos limitados para preprocesar texto en el propio cliente.

## Benchmarks y rendimiento

Metricas de test declaradas por el autor (conjunto de test de 9.642 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0,7811 |
| Precision macro | 0,7713 |
| Recall macro | 0,7918 |
| F1 macro | 0,7768 |
| F1 neutral | 0,6960 |
| F1 positive | 0,7989 |
| F1 negative | 0,8354 |
| Recall negative | 0,8787 |

Latencia declarada (preprocesado, tokenizacion e inferencia incluidos, batch size 1):

| Dispositivo | Media | Mediana | P95 | Peticiones/s |
|---|---|---|---|---|
| Tesla T4 (GPU) | 7,33 ms | 6,57 ms | 12,92 ms | 136,41 |
| CPU de Colab | 13,84 ms | 13,69 ms | 16,77 ms | 72,26 |

No se han publicado resultados de benchmarks comparativos (MMLU, GLUE, Russian SuperGLUE u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 120 MB para los pesos (29,2 M de parametros), mas activaciones; el repositorio completo ocupa 0,1 GB. Con cuantizacion dinamica INT8 el peso del modelo se reduce aproximadamente a 30 MB, aunque no hay versiones cuantizadas publicadas oficialmente.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090, e incluso GPUs integradas o aceleradores de borde. Tambien funciona sin GPU, como demuestran las mediciones sobre CPU de Colab.
- GPU de datacenter (A100, H100, L4, T4) no son necesarias para esta tarea; solo tendrian sentido si se busca throughput masivo con lotes grandes.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), ONNX Runtime u Optimum para exportacion y aceleracion, Text Embeddings Inference (etiqueta presente en el repositorio), Hugging Face Inference Endpoints (etiqueta endpoints_compatible) y servidores propios con FastAPI o TorchServe. vLLM y TGI no son adecuados para un modelo de clasificacion de 29 M de parametros.
- Latencia y throughput: los unicos datos disponibles son los declarados por el autor (7,33 ms de media y 136,41 req/s en T4 con batch 1; 13,84 ms y 72,26 req/s en CPU de Colab). No hay mediciones con lotes mayores ni en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| Bektur756/rubert-tiny2-russian-sentiment | 29,2 M | 128 tokens en entrenamiento (base admite 512) | Ruso | Clasificacion de sentimiento (3 clases) | MIT | F1 macro 0,7768; accuracy 0,7811 en el test propio |
| cointegrated/rubert-tiny2 (modelo base) | 29,2 M aprox. | 512 tokens | Ruso (y otros) | Modelo de lenguaje enmascarado / encoder general | MIT | no disponible (no es un clasificador de sentimiento) |
| Otros clasificadores de sentimiento en ruso | no disponible | no disponible | Ruso | Clasificacion de sentimiento | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos con los que comparar parametros, contexto o rendimiento bajo el mismo conjunto de evaluacion, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- La clase neutral es la mas debil: F1 de 0,6960, muy por debajo del F1 de las clases positive (0,7989) y negative (0,8354). El autor lo reconoce explicitamente.
- El propio autor advierte de que el dataset original contiene etiquetas ruidosas y ambiguas, lo que limita el techo de rendimiento y puede producir discrepancias con anotaciones humanas en casos frontera.
- Truncacion a 128 tokens: cualquier texto mas largo se recorta, con la consiguiente perdida de informacion si el sentimiento se expresa al final del documento. Aunque el backbone admita 512 tokens, la cabeza de clasificacion se entreno con 128.
- Solo ruso: no hay soporte multilingue declarado, y el rendimiento en textos con mezcla de idiomas, transliteraciones o jerga no esta documentado.
- Es un clasificador discriminativo, no un generador: no puede alucinar texto, pero si puede asignar etiquetas incorrectas con alta confianza en dominios alejados del corpus de entrenamiento (por ejemplo, resenas tecnicas, lenguaje ironico o dominios especializados).
- No se publican resultados en benchmarks estandar externos, ni comparaciones con otros modelos, ni analisis de sesgo por subgrupos demograficos, dialectos o registros.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas del repositorio son de septiembre de 2026; se trata de un artefacto sin validacion independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero no exime de cumplir la normativa aplicable de proteccion de datos al procesar textos de usuarios.
- El criterio de seleccion del mejor checkpoint fue el F1 de la clase negativa, lo que optimiza esa clase en detrimento del equilibrio global (F1 macro 0,7768 frente a F1 negativo 0,8354).
- No hay informacion sobre calibracion de probabilidades; las salidas softmax no deberian interpretarse como confianza calibrada sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bektur756/rubert-tiny2-russian-sentiment
- Modelo base: https://huggingface.co/cointegrated/rubert-tiny2
- Dataset de entrenamiento: https://huggingface.co/datasets/MonoHime/ru_sentiment_dataset
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente sitios comerciales alemanes de compraventa de automoviles, sin relacion con el modelo. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
