# AnTran66/docuro-models

## Resumen

`AnTran66/docuro-models` no es un modelo entrenado por su autor, sino un repositorio de distribucion que empaqueta copias sin modificar de tres artefactos de IA on-device utilizados por la aplicacion Android Docuro. Concretamente, contiene una copia de Gemma 3 1B IT cuantizada a int4 en formato LiteRT (`.litertlm`), el modelo de embeddings EmbeddingGemma 300M en variante de secuencia 256 con precision mixta (`.tflite`) y su tokenizador SentencePiece asociado.

El interes del repositorio es operativo, no cientifico: sirve como punto de descarga verificado (cada fichero acompanado de un sidecar `.sha256`) para que la app descargue los modelos una sola vez por HTTPS y ejecute inferencia local en el dispositivo sin subir datos a ningun servidor. Es, por tanto, un ejemplo practico de despliegue de la familia Gemma en el movil mediante el runtime LiteRT de Google.

La relevancia actual reside en dos frentes: por un lado, demuestra un patron de distribucion reproducible para modelos on-device (checksums, formatos especificos de movil, separacion entre generacion y embeddings); por otro, ilustra el uso combinado de un LLM pequeno (1B, int4) para generacion y un modelo de embeddings compacto (300M) para recuperacion semantica, ambos bajo los terminos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ficheros derivados de Gemma 3 1B IT y EmbeddingGemma 300M; el repositorio no documenta la arquitectura interna) |
| Parametros totales | 1B (modelo generativo Gemma 3 1B IT) + 300M (modelo de embeddings EmbeddingGemma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el LLM; el modelo de embeddings usa secuencia de 256 tokens |
| Tipos de cuantizacion | int4 (Gemma 3 1B IT, fichero `.litertlm`); precision mixta (EmbeddingGemma 300M, fichero `.tflite`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy incorporada) |
| Formato de pesos | LiteRT (`.litertlm`) y TensorFlow Lite (`.tflite`); tokenizador SentencePiece (`.model`) |

## Arquitectura y entrenamiento

El repositorio no incluye informacion sobre arquitectura ni proceso de entrenamiento; se limita a redistribuir artefactos producidos por `litert-community`. El modelo generativo es Gemma 3 1B IT, la variante instruct de 1.000 millones de parametros de la familia Gemma 3 de Google, convertida a formato LiteRT y cuantizada a int4 para reducir huella de memoria y permitir ejecucion en dispositivos moviles. El modelo de embeddings es EmbeddingGemma 300M, en su variante de secuencia 256 con precision mixta, pensado para generar representaciones vectoriales de fragmentos de texto en el propio dispositivo.

La innovacion tecnica relevante aqui no esta en el entrenamiento sino en el empaquetado y la cadena de confianza: ficheros en formatos nativos de LiteRT/TFLite (no safetensors ni GGUF), verificacion mediante SHA-256 por fichero, descarga unica por HTTPS y ausencia de telemetria de subida desde el dispositivo. No se documentan en la informacion disponible detalles sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto instructiva en el dispositivo mediante Gemma 3 1B IT, adecuada para tareas cortas y asistentes locales.
- Generacion de embeddings de texto con EmbeddingGemma 300M para busqueda semantica, recuperacion y similitud sobre corpus locales.
- Tokenizacion SentencePiece empaquetada junto al modelo de embeddings para garantizar consistencia entre entrenamiento e inferencia.
- Ejecucion completamente offline tras la descarga inicial, sin envio de datos del usuario a servidores externos.
- Verificacion de integridad de los ficheros descargados mediante sumas SHA-256.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales en Android: la app puede cargar `gemma3-1b-it-int4.litertlm` y responder consultas sin conexion, manteniendo la conversacion en el dispositivo y evitando enviar texto del usuario a un backend.
- Busqueda semantica sobre documentos del usuario: combinando `embeddinggemma-300m-seq256.tflite` con el tokenizador SentencePiece, la app puede indexar notas o ficheros locales y recuperar fragmentos relevantes por similitud vectorial.
- RAG on-device: el modelo de embeddings recupera pasajes del almacenamiento local y Gemma 3 1B IT genera la respuesta citando ese contexto, todo sin salida de red.
- Clasificacion y etiquetado de texto en el movil: uso de los embeddings para agrupar o categorizar entradas (por ejemplo, correos o mensajes) con umbrales de similitud coseno.
- Resumenes breves de notas o transcripciones: el LLM de 1B parametros en int4 puede generar resumenes cortos con latencia aceptable en telefonos de gama media-alta.
- Distribucion reproducible de modelos en apps: el patron de sidecars `.sha256` y descarga unica por HTTPS sirve de referencia para equipos que necesiten publicar artefactos LiteRT verificables.
- Prototipado de pipelines de IA local en Android: permite a desarrolladores probar la combinacion generacion + embeddings sin montar infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de modelos on-device, el recurso critico es memoria RAM del dispositivo, no VRAM de GPU de escritorio.
- GPU recomendadas: no aplica en el escenario objetivo (Android con aceleracion LiteRT/NPU/GPU integrada); no se documentan GPU de escritorio recomendadas.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: runtime LiteRT (`.litertlm`) y TensorFlow Lite (`.tflite`); no se indica soporte de vLLM, llama.cpp, Ollama ni TGI para estos formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 0,8 GB, coherente con un LLM de 1B en int4 mas un modelo de embeddings de 300M y el tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AnTran66/docuro-models` (Gemma 3 1B IT int4 + EmbeddingGemma 300M) | 1B + 300M | no disponible (embeddings a 256 tokens) | LiteRT / TFLite | Gemma Terms of Use | Hugging Face, 0 descargas, 0 likes |
| `litert-community/Gemma3-1B-IT` | 1B | no disponible | LiteRT | Gemma Terms of Use | Hugging Face (fuente original) |
| `litert-community/embeddinggemma-300m` | 300M | 256 tokens en la variante seq256 | TFLite | Gemma Terms of Use | Hugging Face (fuente original) |

La comparativa con alternativas de otra familia (por ejemplo, otros LLM de ~1B en formato GGUF para llama.cpp) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no aporta model card tecnica propia: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones; cualquier analisis de calidad debe remitirse a las fichas originales de `litert-community`.
- Riesgo de alucinacion: inherente a un LLM de 1B parametros cuantizado a int4; no se documentan mitigaciones especificas en este repositorio.
- La cuantizacion int4 puede degradar la calidad respecto al modelo en precision completa; no se publican metricas de esa perdida.
- El modelo de embeddings esta limitado a secuencias de 256 tokens en esta variante, lo que restringe el tamano de los fragmentos indexables.
- Restricciones de licencia: uso sujeto a Gemma Terms of Use y a la Gemma Prohibited Use Policy; es imprescindible revisarlas antes de cualquier uso comercial o redistribucion.
- El autor no es el desarrollador original de los modelos; la responsabilidad de mantenimiento y actualizacion recae en el ecosistema `litert-community`.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- El repositorio esta pensado para una app concreta (Docuro); reutilizarlo en otro producto exige verificar compatibilidad de runtime y de version del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnTran66/docuro-models
- Fuente del LLM: https://huggingface.co/litert-community/Gemma3-1B-IT
- Fuente del modelo de embeddings: https://huggingface.co/litert-community/embeddinggemma-300m
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
