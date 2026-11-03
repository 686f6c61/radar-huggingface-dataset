# EXAiStudio/EX-AI-Corase-30M

## Resumen

EX-AI-Corase-30M es un modelo publicado en HuggingFace por el usuario EXAiStudio bajo licencia Apache 2.0. Por el identificador y el tamano del repositorio (0,1 GB), se trata de un modelo de aproximadamente 30 millones de parametros, presumiblemente orientado a tareas ligeras de generacion de texto o procesamiento de lenguaje natural en entornos con recursos limitados. El unico formato de pesos declarado en las etiquetas del repositorio es ONNX, lo que sugiere que el autor lo preparo para inferencia en runtime de ONNX Runtime mas que para entrenamiento o ajuste fino con frameworks tradicionales.

La informacion publicada es extremadamente escasa: la model card no contiene mas que la declaracion de licencia, sin descripcion, sin datos de entrenamiento, sin especificaciones de arquitectura y sin resultados de evaluacion. El repositorio no registra descargas ni interacciones en el momento de la consulta, y su fecha de creacion indicada es el 3 de noviembre de 2026, lo que resulta anomalo y sugiere que los metadatos pueden no ser fiables o que el modelo se publico con campos incompletos.

Por tanto, esta ficha se limita a documentar lo verificable (licencia, formato, tamano aproximado y ausencia de documentacion) y marca explicitamente como no disponible todo aquello que el autor no ha hecho publico. Cualquier evaluacion de calidad, capacidades o idoneidad para produccion requeriria acceso al propio artefacto ONNX y a una bateria de pruebas propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 30M (inferido del nombre; no confirmado por el autor) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. El nombre sugiere un transformer de aproximadamente 30 millones de parametros, pero el autor no confirma ni el tipo de bloque, ni el numero de capas, ni la dimension del modelo, ni la tokenizacion empleada. Tampoco se indica si se trata de un modelo base preentrenado, de un modelo ajustado para una tarea concreta o de una destilacion de un modelo mayor.

Respecto al entrenamiento, la model card no documenta el volumen de tokens, la composicion del corpus, el uso de tecnicas de alineacion como RLHF o DPO, ni ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). La unica pista tecnica es la presencia de pesos en formato ONNX, que sugiere una exportacion desde otro framework (probablemente PyTorch) para despliegue en ONNX Runtime, pero no aporta informacion sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada por el autor; el pipeline no esta declarado en el repositorio.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Vision o audio: no disponible; las etiquetas del repositorio no incluyen modalidades distintas del texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

Dado que el autor no documenta ninguna capacidad, los siguientes escenarios son hipotesis de uso razonables para un modelo de ~30M en formato ONNX, no aplicaciones validadas:

- Clasificacion de texto en el borde (edge): un modelo de 30M puede ejecutarse en CPU o en dispositivos de baja potencia mediante ONNX Runtime para tareas de filtrado de spam, moderacion simple o etiquetado de sentimiento, siempre que se valide su calidad con un conjunto de prueba propio.
- Autocompletado o sugerencia de texto en aplicaciones de escritorio: el reducido tamano del artefacto (0,1 GB) permite empaquetarlo dentro de aplicaciones locales sin dependencias de red, aunque la calidad de generacion no esta verificada.
- Extraccion de entidades o estructuracion de campos: posible uso como modelo auxiliar para tareas de NER o parsing ligero en pipelines donde el coste por inferencia deba ser minimo.
- Prototipado rapido en entornos con ONNX Runtime: util para equipos que ya tengan infraestructura ONNX y quieran un modelo pequeno de referencia para pruebas de integracion.
- Filtrado previo en pipelines de recuperacion (RAG): un modelo de este tamano podria actuar como reranker o clasificador de relevancia de baja latencia, previo a un modelo mayor.
- Educacion y experimentacion: adecuado para demostrar el flujo completo de exportacion, carga y ejecucion de un modelo ONNX en un cuaderno o en una aplicacion de ejemplo.

En todos los casos, la ausencia de documentacion obliga a realizar una evaluacion empirica antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~30M parametros en FP32 ocupa aproximadamente 120 MB; en FP16, unos 60 MB; en INT8, unos 30 MB. Estas cifras son estimaciones teoricas basadas en el recuento de parametros, no medidas publicadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente en la practica; el modelo puede ejecutarse incluso en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (GTX 1050 en adelante) e incluso en iGPU y en dispositivos moviles mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (runtime nativo del formato publicado), ONNX Runtime Web para navegador, y potencialmente otros runners compatibles con ONNX. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI, que habitualmente requieren formatos distintos (GGUF, safetensors) o arquitecturas conocidas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque el autor no publica arquitectura, contexto ni resultados. A modo orientativo, se citan modelos de escala comparable, aunque la equivalencia no esta verificada:

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| EX-AI-Corase-30M | ~30M (inferido) | no disponible | Apache 2.0 | ONNX | Practicamente nula |
| GPT-2 small (referencia) | 124M | 1024 tokens | MIT | safetensors, GGUF | Amplia |
| DistilBERT (referencia) | 66M | 512 tokens | Apache 2.0 | safetensors | Amplia |
| TinyLlama (referencia) | 1,1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Amplia |

La comparacion se ofrece solo como marco de referencia de escala; no implica que EX-AI-Corase-30M tenga capacidades equivalentes a ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso, lo que impide conocer el comportamiento esperado del modelo.
- Riesgo de alucinacion: desconocido, pero en modelos de este tamano es habitual que la coherencia y la fidelidad factica sean limitadas; debe validarse empiricamente.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas: el campo de idiomas esta vacio en el repositorio, por lo que no se garantiza soporte de castellano ni de ninguna otra lengua.
- Contexto: se desconoce la longitud maxima de secuencia; asumir valores altos sin verificacion puede provocar errores en produccion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y sobre posibles reclamaciones derivadas de los datos de entrenamiento, que no se documentan.
- Metadatos anomalos: la fecha de creacion indicada (2026) y la ausencia de descargas o interacciones sugieren que el repositorio puede estar incompleto o ser de caracter experimental.
- Sin garantia de mantenimiento: no hay historial de versiones ni issues, por lo que no cabe esperar soporte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EXAiStudio/EX-AI-Corase-30M
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
