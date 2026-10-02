# AdrianYao/hw1-hc3-detector

## Resumen

El modelo `AdrianYao/hw1-hc3-detector` es un clasificador binario de texto derivado de `sentence-transformers/all-MiniLM-L6-v2`, ajustado por fine-tuning para distinguir respuestas escritas por humanos (etiqueta 0) de respuestas generadas por ChatGPT (etiqueta 1) sobre el corpus HC3. Se trata de un artefacto academico: el propio nombre ("hw1") y la existencia de repositorios hermanos casi identicos (`Aishkrish/hw1-hc3-detector`, `aisaro/hw1-hc3-detector`, `Yihangsun/hw1-hc3-detector`, `skyyyyks/hw1-hc3-detector`) indican que corresponde a la primera practica de un curso de deteccion de texto generado por IA. No es un modelo de proposito general ni un modelo generativo: su unica salida es una probabilidad de clasificacion.

Tecnicamente es un transformer encoder de tipo BERT con 22.713.986 parametros (unos 0,1 GB en el repositorio), lo que lo situa en la categoria de modelos ligeros que caben sobradamente en CPU y en cualquier GPU de consumo. La model card reporta una accuracy de test de 0,9936 tras 5 epocas con learning rate 2e-5, frente a 0,8451 de una linea base de embeddings congelados mas regresion logistica, una mejora de 14,85 puntos porcentuales.

Su relevancia actual es la de material didactico y de referencia metodologica: muestra como un encoder pequeno y barato de inferir puede separar texto humano de texto LLM cuando el dominio de entrenamiento y el de evaluacion coinciden. Exporta pesos en formato safetensors y no declara licencia, idiomas ni pipeline, por lo que no es apto para uso en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, modelo base `sentence-transformers/all-MiniLM-L6-v2`) con cabeza de clasificacion de 2 clases |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `all-MiniLM-L6-v2` opera con 256 tokens por defecto (configurable hasta 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; convertible a int8/GGUF mediante herramientas externas) |
| Idiomas soportados | no disponible (el corpus HC3 usado es predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `all-MiniLM-L6-v2`, un transformer encoder destilado de 6 capas, 384 dimensiones ocultas y 12 cabezas de atencion, con 22,7 millones de parametros. Al modelo base se le anade una cabeza de clasificacion lineal sobre la representacion de pooling para producir dos logits (humano / ChatGPT). La tarea concreta es clasificacion de secuencias (sequence classification), no generacion ni sentence embeddings, aunque las etiquetas del repositorio sigan heredando el tag `bert` y el vinculo al modelo base de sentence-transformers.

El entrenamiento se realizo sobre el dataset `Hello-SimpleAI/HC3`, en concreto sobre las respuestas (answers) del corpus, que empareja respuestas humanas y respuestas generadas por ChatGPT a las mismas preguntas. La model card especifica 5 epocas con learning rate 2e-5, sin detallar tamano de lote, semilla, split exacto, numero de tokens vistos ni estrategia de parada. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo coherente con una tarea discriminativa. Tampoco se declara ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, mezcla de expertos) mas alla del propio fine-tuning supervisado.

## Capacidades

- Clasificacion binaria de texto: devuelve una decision humano (0) frente a ChatGPT (1) con una probabilidad asociada.
- Deteccion de texto generado por IA restringida al formato y dominio del corpus HC3 (respuestas a preguntas).
- Inferencia muy rapida y barata: 22,7 M de parametros permiten procesar lotes grandes en CPU sin GPU.
- Integracion directa con la libreria `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No genera texto, por lo que no hay capacidades de codigo, matematicas ni resumen.
- No dispone de modo "thinking", vision ni audio.
- Capacidades multilingues: no declaradas; la evidencia disponible apunta a un modelo entrenado solo en ingles.
- No se documentan capacidades de deteccion sobre textos largos mas alla de la ventana del encoder.

## Casos de uso

- Filtrado de contenido en foros y plataformas de preguntas y respuestas: el modelo puede marcar respuestas sospechosas de ser generadas por ChatGPT para revision humana o para etiquetado automatico, aprovechando que su entrenamiento esta alineado con el formato pregunta-respuesta de HC3.
- Auditoria de integridad academica en tareas tipo cuestionario: dado que el corpus de entrenamiento son respuestas a preguntas, es directamente aplicable a la deteccion de respuestas generadas en entornos educativos, siempre con supervision humana y advertencias sobre falsos positivos.
- Etiquetado previo (pre-labeling) en la construccion de datasets de deteccion de IA: el 0,9936 de accuracy en test lo hace util como anotador automatico de primer paso, reduciendo el coste de anotacion manual antes de una revision final.
- Investigacion metodologica en deteccion de texto generado: sirve como linea base reproducible y de bajo coste para comparar contra detectores mas grandes, midiendo la ganancia real de escalar el modelo.
- Moderacion de contenido en canales de soporte: se puede desplegar como clasificador de bajo coste que priorice tickets o mensajes para revision, aunque con umbral de confianza alto por el riesgo de falsos positivos.
- Prototipado rapido y ensenanza: por su tamano de 0,1 GB y su ejecucion en CPU, es adecuado para practicas de fine-tuning, despliegue y evaluacion en cursos y tutoriales.
- Despliegue en entornos con recursos limitados: clasificacion por lotes en un contenedor sin GPU, por ejemplo en un pipeline nocturno que procese un historico de mensajes.

## Benchmarks y rendimiento

Tabla extraida literalmente de la model card del autor. Solo se reporta accuracy de test.

| Modelo | Accuracy de test |
|---|---|
| Linea base (embeddings congelados + regresion logistica) | 0,8451 |
| Fine-tuned (5 epocas, lr 2e-5) | 0,9936 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Dichos benchmarks no aplican a un clasificador de dos clases.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 22,7 M de parametros, los pesos ocupan aproximadamente 91 MB en fp32 (4 bytes por parametro) y unos 23 MB en int8.
- GPU recomendadas: cualquiera. Una RTX 3060, RTX 4090, T4, A100 o H100 estan sobredimensionadas para este modelo; su uso solo tendria sentido para procesar lotes muy grandes en paralelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecucion en CPU: viable y en muchos casos suficiente; el modelo base MiniLM-L6 esta disenado precisamente para inferencia rapida en CPU.
- Opciones de despliegue: `transformers` (PyTorch), `sentence-transformers` con cabeza de clasificacion, exportacion a ONNX Runtime, y conversion a GGUF para `llama.cpp` u `Ollama` si se genera el fichero de conversion. Tambien es posible servirlo con TorchServe o FastAPI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder de 6 capas y 384 dimensiones procesa secuencias cortas en milisegundos en CPU, pero no hay cifras medidas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de modelos comparables directos. La unica comparacion documentada es la linea base interna del propio autor. Se listan los repositorios hermanos detectados en la busqueda web, que parecen clones del mismo ejercicio academico y para los cuales no hay datos tecnicos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdrianYao/hw1-hc3-detector | 22.713.986 | no disponible | 0,9936 accuracy de test (HC3) | no disponible | HuggingFace |
| Linea base del autor (embeddings congelados + regresion logistica) | no disponible | no disponible | 0,8451 accuracy de test (HC3) | no aplica | interna del ejercicio |
| Aishkrish/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| aisaro/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Yihangsun/hw1-hc3-detector | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion. Es un bloqueante para produccion.
- Sesgo de dominio: el modelo se entrena sobre HC3 (respuestas a preguntas en ingles). Fuera de ese formato y ese idioma el rendimiento es desconocido y probablemente muy inferior.
- Sesgo de generador: el entrenamiento distingue "humano" frente a "ChatGPT" de la epoca del corpus. Textos de otros modelos o de versiones posteriores de ChatGPT pueden clasificarse de forma erronea.
- Riesgo de sobreajuste al corpus: una accuracy de 0,9936 en test es anormalmente alta y sugiere posibles artefactos del dataset (longitud, estilo de respuesta o vocabulario) en lugar de una senal robusta de autoria. No se documenta validacion cruzada ni conjunto de evaluacion independiente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si hay riesgo de falsos positivos y falsos negativos con consecuencias reales si se usa para acusar a personas de usar IA.
- Sesgos sociales: no se documenta ninguna evaluacion de equidad por idioma, genero, etnia o dialecto. Un detector de este tipo puede penalizar sistematicamente estilos de escritura no nativos o formales.
- Longitud de entrada: sin datos confirmados de contexto; secuencias mas largas de lo que soporta el encoder se truncaran y pueden degradar la prediccion.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin pipeline declarado ni idiomas declarados, lo que refleja ausencia de validacion por parte de la comunidad.
- Datos de creacion y actualizacion (2026-10-01) muy proximos entre si (7 minutos), indicando una publicacion sin mantenimiento posterior.
- No se documentan semilla, split, hiperparametros completos ni procedimiento de evaluacion, lo que impide reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdrianYao/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Repositorio hermano (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Repositorio hermano (aisaro): https://huggingface.co/aisaro/hw1-hc3-detector
- Ficha del modelo homonimo de Yihangsun: https://savrn.com/models/hw1-hc3-detector
- Registro del modelo homonimo de skyyyyks: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Lista curada de modelos de seguridad ofensiva (referencia de contexto): https://github.com/JoasASantos/Offensive-Security-AI-Models
