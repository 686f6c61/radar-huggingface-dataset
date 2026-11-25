# sorrows2/scanit-intent-onnx

## Resumen

ScanIt intent es un clasificador de texto ligero exportado a ONNX y publicado por el usuario sorrows2, derivado del modelo `dleemiller/EttinX-nli-xs`. Su funcion concreta es puntuar relaciones de "preferencia suave" (soft-preference) entre consultas de usuario y atributos de un catalogo de productos, dentro del asistente de compras ScanIt. No es un modelo generativo: es un cabezal de clasificacion de intencion que se ejecuta en CPU y devuelve puntuaciones de compatibilidad entre una preferencia expresada en lenguaje natural y un atributo del catalogo.

El repositorio empaqueta el grafo ONNX entrenado junto con el tokenizador y dos bundles de despliegue (`m1-v1`, orientado a un catalogo de auriculares con atributos de autonomia y peso, y `scanit.dataset-ontology.v3`, el catalogo canonico de evaluacion de busqueda). Cada bundle incluye su propio adaptador y ficheros de calibracion que identifican los identificadores de catalogo y atributo compatibles, de modo que el runtime verifica el manifiesto y la ontologia publicada antes de inferir.

Su relevancia es acotada pero clara: demuestra un patron de despliegue de clasificadores de intencion en produccion sobre ONNX Runtime en CPU, con versionado de ontologia y calibracion empaquetada. El modelo base es de tamano "xs" (extra small), aunque no se publican el numero exacto de parametros ni la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de `dleemiller/EttinX-nli-xs`), exportado a ONNX para clasificacion de texto |
| Parametros totales | no disponible (el nombre del modelo base indica variante "xs") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized:dleemiller/EttinX-nli-xs` sugiere cuantizacion del modelo base, sin especificar el esquema) |
| Idiomas soportados | no disponible (la model card esta en ingles y el caso de uso es un asistente de compras, sin listado explicito) |
| Licencia | no disponible en el repositorio; la model card del modelo base declara MIT |
| Formato de pesos | ONNX (grafo + tokenizador; repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX de `dleemiller/EttinX-nli-xs` en la revision `802360b`, un encoder de la familia EttinX de tamano reducido afinado para inferencia de lenguaje natural (NLI). Sobre esa base, ScanIt ha entrenado un cabezal de clasificacion que puntua relaciones de preferencia suave entre atributos de catalogo y consultas, y ha empaquetado el resultado como grafo ONNX con tokenizador asociado para ejecucion en CPU.

No se publican detalles del dataset de entrenamiento, numero de tokens, composicion, ni si hubo RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado: dos bundles (`m1-v1` y `scanit.dataset-ontology.v3`) comparten el mismo grafo y tokenizador pero llevan adaptador y calibracion propios, y el runtime valida manifiesto y ontologia de catalogo antes de ejecutar. Esto permite versionar la ontologia de atributos sin reentrenar el encoder.

## Capacidades

- Clasificacion de intencion y puntuacion de relaciones de preferencia entre texto libre y atributos de catalogo.
- Puntuacion de "soft-preference": el modelo no exige coincidencia exacta entre la consulta y el atributo, sino que estima el grado de compatibilidad.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Verificacion de manifiesto y ontologia de catalogo en tiempo de ejecucion (compatibilidad de IDs de catalogo y atributo).
- Calibracion por bundle: las puntuaciones se ajustan segun el catalogo activo.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, vision ni audio: es exclusivamente un clasificador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Filtrado de preferencias en asistentes de compra: dada una consulta como "auriculares con buena autonomia y ligeros", el modelo puntua cada atributo del catalogo (autonomia, peso) y permite ordenar o filtrar candidatos sin busqueda por palabras clave.
- Busqueda semantica de atributos en catalogos de producto: integrado en el pipeline de recuperacion, puntua la relevancia entre la preferencia del usuario y los atributos indexados, complementando un retriever vectorial.
- Enrutado de consultas en atencion al cliente: clasifica la intencion de un mensaje entrante para dirigirlo al flujo o al agente adecuado, con coste de inferencia muy bajo al ejecutarse en CPU.
- Moderacion y etiquetado de resenas: clasifica resenas de producto segun los atributos que mencionan y la polaridad de la preferencia, util para enriquecer fichas de catalogo.
- Evaluacion automatizada de motores de busqueda: el bundle `scanit.dataset-ontology.v3` esta pensado como catalogo canonico de evaluacion, de modo que el modelo puede usarse como juez de relevancia en tests de regresion de busqueda.
- Despliegue en entornos con recursos limitados: al ser un grafo ONNX de 0,1 GB ejecutable en CPU, encaja en funciones serverless, contenedores pequenos o dispositivos edge donde no hay GPU disponible.
- Versionado de ontologias sin reentrenamiento: al separar adaptador y calibracion del grafo, un equipo puede publicar una nueva version de la ontologia de catalogo manteniendo el mismo encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo esta disenado para ejecucion en CPU via ONNX Runtime.
- GPU recomendadas: no aplica; no requiere GPU. En caso de forzar ejecucion en GPU, cualquier GPU con soporte ONNX Runtime CUDA serviria, pero no es el escenario previsto.
- Cabe en GPU consumer: si, aunque no es necesario; el repo completo ocupa 0,1 GB.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con el runtime propietario de ScanIt que valida manifiesto, ontologia, adaptador y calibracion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador ONNX de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ScanIt intent (este modelo) | no disponible (base "xs") | no disponible | Clasificacion de intencion / preferencia | no disponible (base MIT) | ONNX |
| `dleemiller/EttinX-nli-xs` (modelo base) | no disponible (variante "xs") | no disponible | NLI / inferencia de lenguaje natural | MIT | safetensors (presumiblemente; no confirmado) |
| Clasificadores de intencion tipo DistilBERT/MiniLM | 20-70 M aprox. | 256-512 tokens tipicamente | Clasificacion de texto | Apache 2.0 / MIT segun variante | safetensors, ONNX |

La comparativa con alternativas genericas es orientativa: no se dispone de datos publicados de parametros, contexto ni rendimiento de este modelo que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- No se publica licencia en el repositorio; la model card solo indica que el modelo base declara MIT. Antes de uso comercial hay que verificar los terminos aplicables al derivado y a los bundles.
- No se documentan idiomas soportados; el entrenamiento y la model card estan en ingles, por lo que el rendimiento en castellano es incierto.
- No se publican benchmarks ni metricas de evaluacion; no hay evidencia cuantitativa de calidad.
- El modelo esta acoplado a una ontologia de catalogo concreta: los bundles `m1-v1` y `scanit.dataset-ontology.v3` solo son validos con sus IDs de catalogo y atributo, y el runtime rechaza manifiestos u ontologias incompatibles.
- Al ser un clasificador de preferencia suave, puede producir puntuaciones poco calibradas fuera del dominio del catalogo de entrenamiento.
- Riesgo de sesgo: no se documenta la composicion del dataset ni analisis de sesgo; al derivar de un modelo NLI generico puede heredar sesgos de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si puede asignar puntuaciones de compatibilidad incorrectas con alta confianza.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion registrada (2026-11-25) posterior a la fecha habitual de publicacion de modelos; conviene verificar la procedencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sorrows2/scanit-intent-onnx
- Modelo base: https://huggingface.co/dleemiller/EttinX-nli-xs
- Revision del modelo base usada en la exportacion: https://huggingface.co/dleemiller/EttinX-nli-xs/tree/802360b6ffe6d4627f1d28fd3225522e247cd3e8
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
