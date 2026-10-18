# Rafaelvieira432/LANG-10M

## Resumen

LANG-10M es un detector de idioma publicado en HuggingFace por el usuario Rafaelvieira432 bajo licencia Apache 2.0. Se trata de un clasificador de texto basado en FastText (arquitectura de tipo *EmbeddingBag* sobre bolsa de n-gramas con *hashing* de buckets), no de un modelo generativo: recibe una cadena de texto y devuelve la etiqueta de idioma entre 69 posibles. Su propuesta de valor es la latencia: el autor declara inferencia inferior a 2 ms en CPU, con pesos en FP16 de aproximadamente 73 MB.

El modelo se distribuye a traves de la libreria `fasttext` e incluye un modulo propio `infer.py` con una clase `LangDetector`, lo que sugiere un envoltorio de inferencia especifico en lugar de la API estandar de fastText. La configuracion declarada es de 300.000 buckets y dimension 128, un compromiso habitual para mantener el modelo pequeno y rapido a costa de colisiones en el *hashing* de n-gramas.

Es relevante ahora por su encaje en pipelines de preprocesado y enrutado: filtrado de corpus multilingues, seleccion de idioma antes de invocar un LLM o un motor de traduccion, y clasificacion de tickets o resenas a gran escala donde el coste por peticion y la latencia importan mas que la precision en textos muy cortos. La informacion publica es escasa (0 descargas y 0 likes en el momento del registro, sin lista de idiomas ni resultados de evaluacion), por lo que debe tratarse como un artefacto a validar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastText con EmbeddingBag (bolsa de n-gramas con hashing de buckets) |
| Parametros totales | No disponible de forma oficial; estimacion a partir de la configuracion declarada: 300.000 buckets x 128 dimensiones = 38,4 M en la matriz de embeddings, mas la capa de salida de 69 clases (el nombre "10M" no coincide con esta estimacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de bolsa de n-gramas, sin ventana de contexto autorregresiva) |
| Tipos de cuantizacion | FP16 (unico formato documentado por el autor); no se documenta INT8 ni otras variantes |
| Idiomas soportados | 69 idiomas (la lista concreta no esta publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos FastText gestionados por la libreria `fasttext` (repo de 0,1 GB); nombres de fichero y extension exacta no disponibles |

## Arquitectura y entrenamiento

La arquitectura es FastText: cada texto se representa como la media de los embeddings de sus n-gramas de caracteres y palabras, proyectados mediante *hashing* sobre 300.000 buckets de dimension 128, y se clasifica con una capa lineal softmax sobre 69 etiquetas. Este diseno elimina cualquier mecanismo de atencion o recurrencia: el coste computacional es proporcional al numero de tokens de entrada y practicamente constante en memoria, lo que explica la latencia declarada inferior a 2 ms en CPU. El uso de *hashing* implica colisiones controladas entre n-gramas, un compromiso tipico para reducir el tamano del modelo.

No hay informacion publicada sobre el corpus de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, el reparto por idioma, si hubo equilibrio de clases ni si se aplicaron tecnicas de aumento de datos. Tampoco se documenta ninguna fase de ajuste fino con preferencias (RLHF, DPO) —no tendria sentido en un clasificador— ni procesos de calibracion probabilistica. La unica innovacion destacable declarada es la combinacion de pesos FP16 (unos 73 MB) con un envoltorio de inferencia propio (`infer.py`) orientado a baja latencia; no se especifica si ese envoltorio elimina dependencias, precarga el modelo en memoria o aplica algun tipo de *batching*.

## Capacidades

- Identificacion de idioma en texto entre 69 lenguas, devolviendo una unica etiqueta por entrada.
- Inferencia de muy baja latencia en CPU (menos de 2 ms segun el autor), sin necesidad de GPU.
- Procesamiento de textos cortos y consultas individuales gracias a la representacion por bolsa de n-gramas.
- Clasificacion por lotes (la libreria `fasttext` permite evaluar y predecir sobre ficheros completos).
- Modelo ligero apto para entornos con memoria limitada (pesos FP16 de ~73 MB).
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No genera texto, codigo ni matematicas: es exclusivamente un clasificador.
- No tiene modo *thinking*, vision ni audio.

## Casos de uso

- **Enrutado de prompts hacia LLM multilingues**: clasificar la consulta del usuario antes de llamar a un modelo grande y aplicar instrucciones o plantillas en el idioma detectado, con un coste de menos de 2 ms por peticion en CPU.
- **Filtrado y limpieza de corpus de entrenamiento**: pasar millones de documentos por el clasificador para descartar los que no estan en los idiomas objetivo o para separar subcorpus por lengua antes del *tokenizado*.
- **Seleccion de idioma en pipelines de voz**: decidir que modelo de ASR, TTS o traduccion aplicar a una transcripcion, usando la deteccion como primer paso de bajo coste.
- **Clasificacion de tickets de soporte**: etiquetar automaticamente el idioma de entrada para asignar la cola de atencion o el agente adecuado, sin depender de la deteccion que haga el proveedor del LLM.
- **Analitica de resenas y redes sociales**: agregar opinion por idioma en dashboards, detectando la lengua de cada mensaje antes de aplicar analisis de sentimiento especifico por mercado.
- **Moderacion y cumplimiento linguistico**: auditar grandes volumenes de texto para verificar que se responde en el idioma exigido por normativa o por contrato de servicio.
- **Indexacion y busqueda multilingue**: enriquecer cada documento con una etiqueta de idioma que permita filtros y *boosting* en el motor de busqueda.
- **Preprocesado en notebooks y entornos sin GPU**: validar rapido la composicion linguistica de un dataset en local, incluso en portatiles o dispositivos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara una latencia de inferencia inferior a 2 ms en CPU, sin especificar hardware, longitud de texto ni metodo de medida, por lo que esa cifra debe considerarse una afirmacion no verificada.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para CPU.
- Memoria RAM estimada: por debajo de 1 GB, dado que los pesos FP16 ocupan unos 73 MB y la estructura de buckets es fija.
- GPU: no necesaria. Cualquier GPU serviria solo para *batching* masivo, y el beneficio seria limitado frente al coste de transferencia.
- Cabe en cualquier hardware *consumer*: portatiles, contenedores pequenos, Raspberry Pi y funciones *serverless* con poca memoria.
- Despliegue: libreria `fasttext` (Python/C++), el modulo `infer.py` incluido en el repo, o exportacion a ONNX para servir con ONNX Runtime. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia: menos de 2 ms por consulta en CPU segun el autor (hardware y condiciones no especificados). El *throughput* depende del numero de hilos de fastText y del tamano del lote; no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LANG-10M | ~38,4 M estimados (300.000 buckets x 128) | 69 | No aplica | Apache 2.0 | HuggingFace, 0 descargas |
| fastText lid.176 (Facebook) | No disponible en esta ficha | 176 | No aplica | No verificada en esta ficha | Ampliamente distribuido; referencia de facto en deteccion de idioma |
| GlotLID (CIT) | No disponible en esta ficha | Cobertura amplia (cientos de idiomas de bajos recursos) | No aplica | No verificada en esta ficha | HuggingFace |
| CLD3 (Google) | No disponible en esta ficha | ~100 | No aplica | No verificada en esta ficha | Repositorio abierto |

La comparacion cuantitativa de precision no es posible: LANG-10M no publica evaluacion. Frente a fastText lid.176, la diferencia principal es la cobertura (69 frente a 176 idiomas) y la licencia Apache 2.0, mas permisiva para integracion comercial que otras alternativas si estas se distribuyen con licencias copyleft. Frente a GlotLID, el interes esta en la latencia y el tamano, no en la cobertura de lenguas de bajos recursos.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay precision, *F1* ni matriz de confusion por idioma, lo que impide estimar el riesgo real de error.
- No se publica la lista de los 69 idiomas, por lo que no se puede verificar si estan cubiertos los mercados objetivo.
- Riesgo alto de confusion en textos muy cortos (una o dos palabras), en *code-switching* y en lenguas cercanas (espanol/portugues/gallego, indonesio/malayo, checo/esloveno, etc.).
- Sin mecanismo de contexto: no aprovecha frases previas, por lo que la etiqueta puede fluctuar entre mensajes de una misma conversacion.
- El nombre "10M" no concuerda con la estimacion de ~38,4 M parametros derivada de los 300.000 buckets x 128 dimensiones; conviene verificar el fichero real antes de asumir el consumo de memoria.
- La model card esta redactada en portugues y es minima; no documenta el proceso de entrenamiento ni las metricas.
- El repo incluye un `infer.py` propio: hay que auditar ese codigo antes de ejecutarlo, ya que no es la API estandar de la libreria `fasttext`.
- Cero descargas y cero likes en el momento del registro: no existe validacion de la comunidad ni historial de mantenimiento.
- Licencia Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y a declarar cambios; conviene revisar si el modelo deriva de pesos de terceros con otras condiciones.
- No apto para tareas generativas, de razonamiento ni de extraccion de informacion: usarlo fuera de la clasificacion de idioma dara resultados invalidos.
- Fecha de creacion registrada en 2026-10-17; verificar que el artefacto y su contenido son los esperados antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rafaelvieira432/LANG-10M
- Modulo de inferencia `infer.py`: incluido en el repositorio de HuggingFace (no se dispone de enlace directo verificado)
- Paper, blog o demo: no disponibles en la informacion proporcionada
- Documentacion de la libreria fastText: no incluida en la informacion proporcionada
