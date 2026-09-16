# kasimtmc/embeddinggemma-litertlm

## Resumen

`kasimtmc/embeddinggemma-litertlm` es un empaquetado del modelo de embeddings `google/embeddinggemma-300m` en formato `.litertlm`, preparado por el usuario kasimtmc para el motor `EmbeddingEngine` de LiteRT-LM (version 0.17.0 o superior). No se trata de un modelo entrenado desde cero, sino de una conversion, cuantizacion y reempaquetado del modelo base de Google, orientada a ejecucion en dispositivo (on-device) dentro de la aplicacion Ruminote para busqueda semantica y RAG local.

El modelo base es un encoder de texto de aproximadamente 300 millones de parametros, pensado para producir representaciones vectoriales densas. Este empaquetado concreto genera vectores de 768 dimensiones con cuantizacion int8 dinamica, e incorpora soporte de truncamiento MRL (Matryoshka Representation Learning) en tiempo de ejecucion mediante `EmbeddingOptions.outputSize`, con buckets de secuencia de 64, 128, 256 y 512 tokens.

Su relevancia actual radica en que permite llevar busqueda semantica y recuperacion aumentada sin conexion a telefonos, tablets y equipos de borde, sin depender de APIs en la nube ni de GPU de servidor. El repositorio ocupa 0,3 GB y la licencia es la Gemma Terms of Use, con las restricciones de uso que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; encoder de texto del modelo base `google/embeddinggemma-300m`, exportado como grafo LiteRT dividido en `embedder` y `text_encoder` |
| Parametros totales | Aproximadamente 300 millones (segun la denominacion del modelo base `embeddinggemma-300m`); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Buckets de secuencia de 64/128/256/512 tokens en este empaquetado; la ventana maxima del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | int8 dinamica (unico peso publicado en el repositorio) |
| Idiomas soportados | No disponible en la informacion del empaquetado; el modelo base es multilingue segun su propia model card, pero esta ficha no aporta cifras |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy asociada) |
| Formato de pesos | `.litertlm` (LiteRT-LM), generado con `litert-lm pack` a partir de una exportacion `litert-torch`; dimension de salida 768 con truncamiento MRL |
| Tamano del repositorio | 0,3 GB |
| Libreria | litert-lm |
| Autor del empaquetado | kasimtmc |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es una exportacion dividida (split export) de `litert-torch` que separa el pipeline en dos subgrafos: un `embedder` que convierte tokens en embeddings y un `text_encoder` que transforma la secuencia en un vector pooled. Ambos van acompanados de un tokenizador SentencePiece y metadatos de embedding, todo empaquetado con la herramienta `litert-lm pack`. El autor indica que el pipeline dividido esta verificado como bit-exacto respecto al modelo original, lo que implica que la conversion no altera las representaciones mas alla del efecto de la cuantizacion int8.

No se aportan en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO, ya que esos detalles corresponden al modelo base y no se reproducen en esta ficha. La innovacion tecnica destacable de este empaquetado es doble: por un lado, la cuantizacion int8 dinamica con buckets de secuencia predefinidos, que permite un grafo optimizado para inferencia en CPU, GPU o NPU de dispositivos moviles; por otro, la exposicion de truncamiento MRL en tiempo de ejecucion, que permite reducir la dimension del vector de salida sin reexportar el modelo, ajustando el equilibrio entre precision y coste de almacenamiento del indice vectorial. El modelo aplica prefijos de tarea: `task: search result | query: {text}` para consultas y `title: none | text: {text}` para documentos.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica y recuperacion de informacion.
- Truncamiento MRL en tiempo de ejecucion mediante `EmbeddingOptions.outputSize`, lo que permite emitir vectores de menor dimension con perdida controlada de calidad.
- Busqueda semantica asimetrica: distingue entre prefijo de consulta y prefijo de documento, tal como especifica la model card del modelo base.
- Recuperacion aumentada por generacion (RAG) totalmente en dispositivo, sin llamadas de red.
- Procesamiento de secuencias con buckets de 64, 128, 256 y 512 tokens.
- Tokenizacion SentencePiece incluida en el paquete, sin dependencias externas de tokenizador.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: es exclusivamente un modelo de embeddings.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo; su papel en flujos de agentes es el de componente de recuperacion.
- Multilinguismo: no confirmado en la informacion del empaquetado.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: integrar el `EmbeddingEngine` de LiteRT-LM en Android o iOS para indexar y consultar notas o documentos del usuario sin enviar datos a la nube, usando los buckets de 128 o 256 tokens para equilibrar latencia y cobertura.
- RAG local sin conexion: recuperar fragmentos relevantes de una base de conocimiento embebida en el dispositivo y pasarlos como contexto a un modelo generativo local, evitando costes de API y problemas de privacidad.
- Deduplicacion y agrupamiento de documentos: calcular embeddings de titulares o parrafos y aplicar similitud coseno para detectar duplicados o agrupar tematicamente grandes volumenes de texto en un dispositivo de borde.
- Clasificacion de intenciones y enrutado en asistentes: representar las consultas entrantes y compararlas contra un conjunto de frases prototipo para dirigir la peticion al flujo adecuado, con latencia baja gracias a la cuantizacion int8.
- Motores de recomendacion de contenido textual: indexar articulos, productos o publicaciones y sugerir elementos similares a partir del vector de la consulta, reduciendo dimensiones con MRL para acelerar la busqueda.
- Deteccion de similitud y reutilizacion de texto en herramientas de escritura: comparar borradores contra un corpus propio para senalar coincidencias o sugerir fuentes relacionadas.
- Filtrado semantico de contenido en modulos de moderacion: comparar mensajes contra una lista de ejemplos problematicos representados como vectores, todo ello sin salida de datos del dispositivo.
- Búsqueda dentro de aplicaciones de notas y correo: indexar el contenido local y permitir consultas en lenguaje natural con recuperacion instantanea aunque no haya conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma que el pipeline dividido es bit-exacto frente al modelo original, lo que no constituye una medida de calidad de recuperacion. Tampoco se aportan cifras de latencia, throughput ni consumo energetico del empaquetado `.litertlm`.

## Requisitos de hardware

- Peso en disco del repositorio: 0,3 GB. Los pesos int8 del modelo de 300 millones de parametros ocupan aproximadamente ese orden de magnitud.
- Memoria estimada en inferencia: por debajo de 1 GB en RAM o VRAM para los buckets de secuencia mas pequenos, incluyendo activaciones y buffers. Es una estimacion derivada del tamano del repositorio, no una cifra oficial.
- Dispositivos objetivo: telefonos y tablets Android e iOS, equipos de escritorio y placas de borde, ya que LiteRT-LM esta disenado para inferencia en dispositivo con delegados de CPU, GPU y NPU.
- GPU de servidor: no es el escenario previsto. Para lotes grandes en servidor conviene usar el modelo base `google/embeddinggemma-300m` en formato safetensors con un servidor de embeddings dedicado.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna con mas de 1-2 GB de memoria libre, aunque el empaquetado no esta pensado para ese uso.
- Opciones de despliegue: LiteRT-LM `EmbeddingEngine` version 0.17.0 o superior, en Android, iOS y escritorio. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, porque el formato `.litertlm` es especifico de LiteRT-LM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| kasimtmc/embeddinggemma-litertlm | ~300 M | 768 (truncable por MRL) | Buckets hasta 512 tokens en este empaquetado | Gemma Terms of Use | `.litertlm`, LiteRT-LM en dispositivo |
| google/embeddinggemma-300m | ~300 M | 768 (truncable por MRL) | No disponible en esta ficha | Gemma Terms of Use | Safetensors, multiples frameworks |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 384 | 256 tokens | Apache 2.0 | Safetensors, PyTorch, ONNX, llama.cpp |
| BAAI/bge-small-en-v1.5 | ~33 M | 384 | 512 tokens | MIT | Safetensors, PyTorch, ONNX |

La comparativa se limita a caracteristicas estructurales y de licencia. No hay resultados de benchmarks publicados en la informacion disponible para este empaquetado, por lo que no es posible comparar calidad de recuperacion (MTEB u otros) con las alternativas. La ventaja diferencial del empaquetado frente al modelo base es el formato `.litertlm` y su integracion directa con LiteRT-LM; frente a MiniLM y bge-small, el mayor numero de parametros y la dimension de 768 implican un indice vectorial mas grande, compensable mediante truncamiento MRL.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera texto, no razona y no ejecuta herramientas. Cualquier expectativa de uso como LLM generativo es incorrecta.
- Al estar cuantizado a int8, puede existir una perdida de calidad en las representaciones respecto al modelo base en precision completa; el autor solo garantiza la equivalencia del pipeline de exportacion, no la ausencia de degradacion por cuantizacion.
- La ventana efectiva en este empaquetado esta limitada por los buckets de 64/128/256/512 tokens. Textos mas largos requeriran troceado previo (chunking).
- El truncamiento MRL reduce la dimension del vector y, con ello, la calidad de recuperacion; debe validarse con datos propios antes de fijar un tamano distinto de 768.
- El uso correcto exige respetar los prefijos de tarea de la model card (`task: search result | query:` y `title: none | text:`). Omitirlos degrada el rendimiento de recuperacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de un modelo entrenado con datos web a gran escala, es previsible que herede sesgos sociales y culturales del corpus, pero no se aportan analisis especificos.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, aunque un sistema RAG construido sobre el puede recuperar pasajes irrelevantes si el indice o el chunking son deficientes.
- Licencia: Gemma Terms of Use, que impone obligaciones de atribucion y aceptacion de la Gemma Prohibited Use Policy. Es obligatorio revisar estas condiciones antes de cualquier uso comercial. El repositorio redistribuye un derivado convertido y cuantizado del modelo de Google; todos los derechos sobre el modelo subyacente permanecen en Google.
- Popularidad y mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y es una publicacion de un tercero, no un artefacto oficial de Google. No hay garantia de mantenimiento ni de soporte.
- Compatibilidad: requiere LiteRT-LM 0.17.0 o superior. Versiones anteriores del motor no podran cargar el paquete.
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces encontrados correspondian a tematicas ajenas y se han descartado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kasimtmc/embeddinggemma-litertlm
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
