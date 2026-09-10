# heidercs/xlmroberta-cv-chunked

## Resumen

`heidercs/xlmroberta-cv-chunked` es un modelo de clasificación de texto en español obtenido por fine-tuning de `FacebookAI/xlm-roberta-base` sobre currículums. Su tarea es asignar cada CV a una de 43 categorías profesionales, un problema típico de los sistemas de reclutamiento (parsing y enrutado de candidatos). Lo publica el usuario de HuggingFace heidercs y el repositorio ocupa 1,1 GB con pesos en safetensors.

El modelo tiene 278.076.715 parámetros y una arquitectura transformer encoder con cabeza de clasificación de secuencias, por lo que su contexto de trabajo es de 512 tokens. La particularidad del entrenamiento es el uso de chunking: los documentos se fragmentaron en ventanas de 512 tokens con solape de 64 como aumentación de datos, pero en inferencia solo se procesa el primer fragmento de cada documento (estrategia `chunk_first`), que fue la de mejor resultado según el autor frente a leer el documento completo o agregar varios fragmentos.

Es relevante porque ofrece una alternativa ligera y desplegable en hardware modesto para una tarea de clasificación muy concreta, con métricas declaradas de accuracy 83,4% y F1 macro 0,826 sobre un test de 2.681 documentos, además de una calibración de confianza explícita que permite enrutar los casos de alta confianza sin intervención de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de secuencias |
| Parametros totales | 278.076.715 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrenado con fragmentos de 512 y solape de 64; en inferencia solo se usa el primer fragmento) |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones en la model card ni en el repo) |
| Idiomas soportados | es (espanol); el backbone XLM-R es multilingue, pero el fine-tuning esta orientado a espanol |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un fine-tuning de `xlm-roberta-base` como modelo de clasificacion de secuencias con 43 etiquetas de salida, entrenado con chunking como estrategia de aumentacion: cada documento se dividio en fragmentos de 512 tokens con un solape de 64 tokens. En inferencia, sin embargo, el modelo solo consume el primer fragmento de 512 tokens (`chunk_first`), decision justificada por el autor al comparar con leer el documento completo o agregar varios fragmentos. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni modo de razonamiento; es un clasificador discriminativo estandar.

Los datos de entrenamiento proceden de un corpus publico de curriculums en ingles con 43 categorias, traducido al espanol con MarianMT. El reparto declarado es de 6.195 documentos de entrenamiento y 2.681 de test. No se indica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento, algo esperable en un modelo de clasificacion, ni se detalla la composicion exacta del corpus ni el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion de curriculums en espanol en 43 categorias profesionales mediante softmax sobre los logits de la cabeza de clasificacion.
- Procesamiento de documentos de hasta 512 tokens por pasada; los documentos mas largos se truncan al primer fragmento.
- Salida de probabilidades calibradas: el autor reporta AUC 0,883 y una media de confianza de 0,940 en aciertos frente a 0,674 en errores.
- Enrutado por umbral de confianza: con umbral 0,80, el 84,5% del test se resuelve por ruta rapida con un 92,0% de acierto en esa ruta, lo que permite reservar los casos dudosos para revision humana o un LLM.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un clasificador de una sola pasada.
- No dispone de generacion de texto, codigo, matematicas, vision, audio ni modo thinking.
- Capacidad multilingue limitada: el idioma declarado es espanol.

## Casos de uso

- Triaje de candidatos en un ATS: el modelo clasifica cada CV recibido en una de las 43 categorias profesionales y permite enrutarlo automaticamente al equipo de seleccion correspondiente, reduciendo el trabajo manual de revision inicial.
- Enrutado con umbral de confianza: usando el umbral 0,80 recomendado por el autor, los CV con confianza alta se asignan directamente y solo el 15,5% restante pasa a revision humana o a un LLM, lo que baja coste y latencia de un pipeline de reclutamiento.
- Preetiquetado para anotacion: los CV clasificados por el modelo pueden usarse como etiquetas iniciales en un proceso de anotacion humana, acelerando la construccion de un dataset propio del dominio.
- Filtrado de curriculum vitae por vertical: en portales de empleo, clasificar la categoria del CV permite construir indices y busquedas por sector sin procesar el texto completo.
- Deteccion de curriculos atipicos: la confianza baja del modelo puede utilizarse como senal para identificar documentos mal formateados, escaneados o de categorias poco representadas en el corpus.
- Segmentacion de campanas de captacion: agrupar candidatos por categoria profesional para enviar comunicaciones segmentadas o analizar que perfiles recibe cada oferta.
- Analitica de mercado laboral: sobre un lote de CV, la distribucion de categorias predichas permite generar informes agregados de perfiles demandados u ofertados.
- Inferencia en lote sobre CPU: con 278M de parametros, es viable clasificar lotes grandes de documentos en CPU usando ONNX Runtime o TorchScript, sin necesidad de GPU.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del autor, medidos sobre un test de 2.681 documentos en una evaluacion unica:

| Segmento | Documentos | Accuracy | F1 macro |
|---|---:|---:|---:|
| Global | 2.681 | 83,4% | 0,826 |
| Cortos (<=512 tokens) | 1.097 | 85,9% | 0,822 |
| Largos (>512 tokens) | 1.584 | 81,6% | 0,810 |

Metricas de calibracion declaradas: AUC 0,883; confianza media 0,940 en aciertos frente a 0,674 en errores. Con umbral 0,80, el 84,5% del test se resuelve por ruta directa con 92,0% de acierto en esa ruta. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, que no aplican a un clasificador de este tipo. No se han publicado en la informacion disponible comparaciones con otros modelos en el mismo test.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB en fp32, 0,56 GB en fp16 y 0,28 GB en int8 para los 278M de parametros, mas el overhead del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o T4 lo ejecutan con holgura. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas integradas con soporte de aceleracion. La inferencia en CPU tambien es viable.
- Opciones de despliegue: `transformers` con PyTorch (uso mostrado por el autor), exportacion a ONNX Runtime y TorchScript para produccion, y servidores de inferencia compatibles con `text-classification` como Hugging Face TGI. No se declaran pesos GGUF, por lo que su uso con llama.cpp u Ollama no esta documentado en la informacion disponible.
- Latencia y throughput: no disponible. No hay cifras publicadas de latencia ni de documentos por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite una comparacion limitada. Los unicos modelos citados en la model card son el backbone base y otro modelo del mismo autor:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heidercs/xlmroberta-cv-chunked | 278.076.715 | 512 tokens (primer fragmento) | Clasificacion de CV en 43 categorias | other | HuggingFace, 0 descargas, 0 likes |
| heidercs/longformer-cv-direct | no disponible | no disponible (pensado para documentos largos sin truncar) | Clasificacion de CV | no disponible | HuggingFace |
| FacebookAI/xlm-roberta-base | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo base multilingue, sin cabeza de clasificacion | no disponible | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparados en el mismo test, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo procesa 512 tokens por pasada, aproximadamente 1,5 paginas; los CV mas largos se truncan al primer fragmento, lo que explica la caida de accuracy del 85,9% en documentos cortos al 81,6% en documentos largos.
- Las metricas provienen de una unica evaluacion del autor sobre su propio test, sin replicacion independiente; deben tomarse como orientativas.
- El corpus de entrenamiento es un corpus publico en ingles traducido automaticamente con MarianMT, lo que introduce ruido de traduccion y posible perdida de matices propios del espanol (terminologia local, titulaciones, formatos de CV).
- La licencia es `other` y el propio autor advierte que la licencia de redistribucion exacta del corpus de origen depende de sus terminos publicados, por lo que debe revisarse antes de un uso comercial estricto.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea: un 16,6% de error global en el test.
- La calibracion reportada es la del autor; en dominios distintos al corpus de entrenamiento la distribucion de confianza puede degradarse y el umbral 0,80 puede no ser optimo.
- No se documentan sesgos especificos ni evaluaciones de equidad por genero, edad u origen, algo relevante en un caso de uso de seleccion de personal sujeto a regulacion.
- El modelo no genera texto ni razona, por lo que no puede justificar su decision ni interactuar en multi-turno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heidercs/xlmroberta-cv-chunked
- Modelo base: https://huggingface.co/xlm-roberta-base
- Modelo del mismo autor para documentos largos: https://huggingface.co/heidercs/longformer-cv-direct
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre este modelo; las busquedas devolvieron contenido no relacionado (soporte de Google, YouTube y un foro de videojuegos), por lo que no se dispone de papers, blogs, repositorios ni demos adicionales.
