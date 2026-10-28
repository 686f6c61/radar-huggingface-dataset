# d0rj/RuModernBERT-base-anekdot-scorer

## Resumen
RuModernBERT-base-anekdot-scorer es un modelo de regresion de texto en ruso desarrollado por el usuario d0rj (no vinculado a una organizacion de investigacion). Su tarea no es generar texto, sino asignar a un chiste una puntuacion continua entre 0 y 1 que estima la proporcion suavizada de votos positivos que los lectores de anekdot.ru dieron a ese texto. Es, por tanto, un scorer de humor: un encoder de 149 millones de parametros con una cabeza lineal sobre el token CLS, afinado sobre el subconjunto textual del dataset d0rj/anekdot.

El modelo parte de deepvk/RuModernBERT-base, un encoder de la familia ModernBERT especializado en ruso, y se ha entrenado con 618.470 ejemplos de entrenamiento, 77.308 de validacion y 77.310 de test, con una tasa de aprendizaje de 2e-5, semilla 42 y 3 epocas. La entrada se limita a 512 tokens mediante una truncacion head+tail (primeros 128 tokens mas los ultimos 382 del cuerpo), disenada para conservar tanto el planteamiento como el remate del chiste. El checkpoint publicado es el mejor por validacion (paso 19328).

Su relevancia practica esta en que ofrece una senal de calidad cuantitativa y muy barata de ejecutar (583 textos por segundo en una RTX 5070 Ti con batch 64) para filtrar, ordenar o preetiquetar contenido humoristico en ruso, superando en correlacion con los votos reales a encoders alternativos como BERTA y a un modelo generativo grande en modo zero-shot (Gemma4-E4B-it). La licencia Apache-2.0 facilita su uso comercial, aunque el modelo requiere trust_remote_code para cargar el adaptador de la cabeza original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional de la familia ModernBERT (base deepvk/RuModernBERT-base) con cabeza lineal de regresion sobre el token CLS |
| Parametros totales | 149.015.041 (149 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en la configuracion de fine-tuning, con truncacion head+tail: primeros 128 tokens + ultimos 382 del cuerpo. La longitud nativa del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El repo (0,6 GB) contiene pesos en safetensors, coherente con FP32 para 149 M de parametros; la cuantizacion a FP16/BF16/INT8 es viable por conversion propia, no soportada oficialmente |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado (custom_code) y carga via transformers con trust_remote_code=True |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de deepvk/RuModernBERT-base, un encoder bidireccional de tipo ModernBERT adaptado al ruso. Sobre la representacion del token CLS se anade una cabeza lineal que produce un unico valor escalar; la model card indica que se conserva un adaptador de la cabeza entrenada original, cargado con trust_remote_code, y que el metodo score_texts mantiene el mismo esquema de truncacion head+tail usado en entrenamiento. El objetivo de regresion es la proporcion suavizada de votos positivos de los lectores de anekdot.ru, no una etiqueta binaria, de modo que la salida es un continuo en [0, 1].

El entrenamiento se realizo sobre la configuracion "anekdots" del dataset d0rj/anekdot, con 618.470 ejemplos de train, 77.308 de validacion y 77.310 de test, durante 3 epocas con LR 2e-5 y semilla 42, publicandose el checkpoint 19328 por ser el mejor en validacion. Ademas del score bruto, el modelo incluye una calibracion ajustada sobre el conjunto de validacion: score_texts(..., calibrated=True) aplica dicha calibracion y score_texts(..., calibrated=False) devuelve la puntuacion original. No se documentan en la informacion disponible ni la composicion del corpus de preentrenamiento del modelo base ni tecnicas de RLHF/DPO, que no aplican a un encoder de clasificacion.

## Capacidades
- Puntuacion de humor en ruso: devuelve un valor continuo 0-1 que estima la aceptacion de un chiste por parte de lectores reales.
- Regresion calibrada: ofrece salida bruta y salida calibrada sobre validacion, lo que permite elegir entre comparabilidad con el score original o mejor calibracion probabilistica.
- Clasificacion y ordenacion (ranking): util para ordenar conjuntos de chistes por calidad esperada, no solo para umbrales binarios.
- Procesamiento por lotes de alto rendimiento: 583,3 textos/s en RTX 5070 Ti con batch 64.
- Manejo de textos largos mediante truncacion head+tail, preservando inicio y desenlace del chiste.
- Integracion con el ecosistema transformers (AutoTokenizer, AutoModelForSequenceClassification) y compatibilidad declarada con text-embeddings-inference y endpoints.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: es exclusivamente un encoder de regresion.
- No es multilingue: solo ruso.

## Casos de uso
- Curaduria de contenido humoristico en plataformas y bots de Telegram: puntuar cada chiste recibido y publicar solo los que superan un umbral, reduciendo la moderacion manual a una revision de la cola de baja puntuacion.
- Ranking de un catalogo existente: reordenar decenas de miles de anekdots por la puntuacion predicha para alimentar un feed personalizado o una seccion de "lo mejor", con coste de computo minimo gracias a los 583 textos/s.
- Filtrado en pipelines de generacion con LLM: un modelo generativo produce N variantes de un chiste y este scorer selecciona la mejor, usando la puntuacion como funcion de recompensa barata en lugar de evaluar con otro LLM.
- Etiquetado debil de datasets: asignar una etiqueta de calidad a corpus humoristicos no anotados para entrenar o evaluar otros sistemas, aprovechando la correlacion de 0,4933 con los votos reales del test.
- Investigacion sobre humor y recepcion: analizar que rasgos estructurales o lexicos correlacionan con la aceptacion del publico, usando las puntuaciones como variable dependiente continua y calibrada.
- Control de calidad en un pipeline de publicacion editorial: descartar automaticamente chistes que el modelo puntua muy bajo antes de que lleguen a un editor humano, con inferencia viable en CPU si el volumen es moderado.
- Priorizacion en sistemas de recomendacion: usar la puntuacion como caracteristica (feature) adicional junto a senales de comportamiento para estimar la probabilidad de interaccion con contenido humoristico en ruso.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de d0rj/anekdot (config "anekdots", 77.310 ejemplos, revision 62e91b8). Ninguna metrica esta verificada de forma independiente.

| Metrica | Valor |
|---|---|
| Spearman (correlacion con votos) | 0,4933 |
| BCE | 0,6686 |
| BCE calibrada | 0,6672 |
| MAE | 0,1343 |
| RMSE | 0,1666 |
| Throughput | 583,3 textos/s (RTX 5070 Ti, batch 64, tras calentamiento) |

Comparacion en el mismo test publicada en la model card:

| Modelo | Spearman (mas alto mejor) | BCE | BCE calibrada | MAE | RMSE | Textos/s |
|---|---|---|---|---|---|---|
| RuModernBERT-base-anekdot-scorer (149 M) | 0,4933 | 0,6686 | 0,6672 | 0,1343 | 0,1666 | 583,3 |
| BERTA | 0,4656 | 0,6716 | 0,6694 | 0,1389 | 0,1709 | 1212,6 |
| rubert-tiny-turbo | 0,4010 | 0,6745 | 0,6738 | 0,1433 | 0,1750 | 3096,3 |
| Gemma4-E4B-it (zero-shot) | 0,1398 | 0,7524 | 0,6847 | 0,2035 | 0,2521 | 10,5 |
| Media del train (referencia) | No aplica | 0,6863 | No disponible | 0,1598 | 0,1908 | No aplica |

Interpretacion: el modelo supera a BERTA en Spearman (+0,028) y en MAE (-0,0046) y a rubert-tiny-turbo de forma mas amplia, pero es entre 2 y 5 veces mas lento que ambos. Frente a Gemma4-E4B-it en zero-shot la diferencia es muy grande en correlacion (0,4933 frente a 0,1398), a costa de un throughput 55 veces mayor.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (tamano del repo), 0,3 GB en FP16/BF16 y 0,15 GB en INT8, mas activaciones que dependen del batch y de los 512 tokens de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se ha medido en una RTX 5070 Ti. Para alto volumen en servidor, una A100 o H100 no aportan ventaja por memoria sino por throughput agregado; una L4 o T4 ya saturan el rendimiento practico en batch medio.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y practicamente cualquier GPU con 4 GB o mas. Tambien es viable en CPU para volumenes moderados (unos cientos de textos por segundo es el orden de magnitud en GPU; en CPU el rendimiento no se ha publicado).
- Opciones de despliegue: transformers (via AutoModelForSequenceClassification con trust_remote_code=True), text-embeddings-inference y endpoints compatibles, segun los tags del repo. No se publican pesos GGUF ni ONNX, por lo que llama.cpp u Ollama requeririan conversion propia; el soporte en vLLM de esta cabeza de regresion con codigo personalizado no esta documentado en la informacion disponible.
- Latencia y throughput: 583,3 textos/s con batch 64 en RTX 5070 Ti, es decir, unos 1,7 ms por texto amortizados. En batch 1 la latencia por peticion sera mayor y no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spearman (test) | MAE | Textos/s | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| RuModernBERT-base-anekdot-scorer | 149 M | 512 | 0,4933 | 0,1343 | 583,3 | Apache-2.0 | HuggingFace, transformers |
| BERTA | No disponible | No disponible | 0,4656 | 0,1389 | 1212,6 | No disponible | Usado como baseline en la model card |
| rubert-tiny-turbo | No disponible | No disponible | 0,4010 | 0,1433 | 3096,3 | No disponible | Usado como baseline en la model card |
| Gemma4-E4B-it (zero-shot) | No disponible | No disponible | 0,1398 | 0,2035 | 10,5 | No disponible | Usado como baseline en la model card |

El modelo se posiciona como la opcion de mayor calidad predictiva entre los encoders comparados, a costa de velocidad; rubert-tiny-turbo es 5,3 veces mas rapido pero correlaciona 0,09 menos. Frente a un modelo generativo grande en zero-shot, la ventaja en correlacion es de 0,35 puntos con dos ordenes de magnitud mas de throughput. Los datos de parametros, contexto y licencia de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias
- Solo ruso: no se ha entrenado ni evaluado en otros idiomas, incluido el castellano.
- Naturaleza del objetivo: los votos de lectores de anekdot.ru no son una evaluacion experta de humor; el modelo aprende preferencias de una comunidad concreta y puede reproducir sus sesgos tematicos, de registro y de estilo.
- Correlacion moderada: un Spearman de 0,4933 implica que una parte sustancial de la varianza en la aceptacion no queda explicada; no debe usarse como criterio unico de publicacion sin revision humana.
- Riesgo de sobreajuste al dominio: chistes de otras tradiciones, formatos (memes textuales, ironia breve) o registros pueden puntuarse de forma poco fiable.
- Limite de 512 tokens con truncacion head+tail: textos largos pierden el fragmento central, lo que puede alterar la puntuacion en formatos que no sean chiste clasico con planteamiento y remate.
- Un unico seed (42) y 3 epocas: no se publica variabilidad entre semillas ni intervalos de confianza, por lo que diferencias pequenas frente a otros modelos deben interpretarse con cautela.
- Carga con trust_remote_code=True: ejecuta codigo del repositorio del autor; conviene auditar el codigo y fijar una revision concreta antes de usarlo en produccion.
- La calibracion se ajusto sobre validacion rusa del mismo corpus; fuera de esa distribucion la salida calibrada puede estar mal calibrada.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento ni sobre la legalidad del corpus de entrenamiento subyacente.
- Sin soporte de generacion, tool calling ni agentes: no puede sustituir a un LLM en tareas conversacionales.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/d0rj/RuModernBERT-base-anekdot-scorer
- Descripcion en ingles (README.en.md): https://huggingface.co/d0rj/RuModernBERT-base-anekdot-scorer/blob/main/README.en.md
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/d0rj/anekdot
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-base
- Metadatos de entrenamiento (training_metadata.json): https://huggingface.co/d0rj/RuModernBERT-base-anekdot-scorer/blob/main/training_metadata.json
- Resultados completos de evaluacion (evaluation_results.json): https://huggingface.co/d0rj/RuModernBERT-base-anekdot-scorer/blob/main/evaluation_results.json
