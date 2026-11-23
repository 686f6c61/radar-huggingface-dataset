# Infinity-io/drama-3-GGUF_1

## Resumen

drama-3 es un modelo de texto a voz (text-to-speech) desarrollado por Fish Audio, distribuido aquí en formato GGUF cuantizado por el usuario Infinity-io. El modelo base es `fishaudio/drama-3`, un transformer con aproximadamente 34.700 millones de parámetros (34.676.863.616 según los pesos en safetensors), lo que lo sitúa en la gama alta de modelos TTS en cuanto a tamaño. Su función principal es la síntesis de voz multi-hablante: a partir de texto etiquetado con marcadores de hablante (`<|speaker:0|>` a `<|speaker:15|>`), genera audio donde cada personaje recibe una voz diferenciada.

La relevancia de esta publicación concreta reside en su formato: al estar convertido a GGUF, puede ejecutarse con el ecosistema de llama.cpp mediante las herramientas `llama-tts` y `llama serve`, con un endpoint `/tts` para integración en servidores. Esto facilita el despliegue local de un modelo TTS de gran tamaño sin depender de infraestructura propietaria, aunque el repositorio ocupa 129,8 GB, lo que refleja el coste de almacenamiento de las distintas cuantizaciones.

Es importante señalar que la licencia no es permisiva: se trata de la Fish Audio Research License, que restringe el uso comercial. Además, la model card indica explícitamente que la clonación de voz todavía no está soportada, por lo que el modelo se limita a las 16 voces predefinidas por los marcadores de hablante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de texto a voz); detalles internos no disponibles |
| Parámetros totales | 34.676.863.616 (~34,7 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF cuantizado (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | No disponible |
| Licencia | fish-audio-research-license (Fish Audio Research License) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de texto a voz basado en transformer, con un total de 34.676.863.616 parámetros. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otros métodos de alineación. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o mecanismos de atención lineal.

Lo que sí se documenta es el mecanismo de control multi-hablante: el texto de entrada se etiqueta con marcadores `<|speaker:0|>` hasta `<|speaker:15|>`, de modo que cada etiqueta asigna una voz distinta al fragmento correspondiente. Esta publicación es una conversión automática a GGUF realizada con la herramienta `ggml-org/convert`, orientada a su ejecución con llama.cpp. No se dispone de información sobre el proceso de entrenamiento del modelo original `fishaudio/drama-3`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano.
- Generación multi-hablante: 16 voces diferenciadas mediante los marcadores `<|speaker:0|>` a `<|speaker:15|>`.
- Salida de audio en formato WAV mediante la herramienta `llama-tts`.
- Servicio HTTP con endpoint `/tts` a través de `llama serve`, apto para integración en aplicaciones.
- Ejecución local en el ecosistema llama.cpp gracias al formato GGUF.
- Clonación de voz: no soportada según la model card.
- Soporte de tool calling, agentes, visión o audio de entrada: no disponible / no aplica a un modelo TTS.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Narración de audiolibros con múltiples personajes: los 16 marcadores de hablante permiten asignar una voz distinta a cada personaje, de modo que un mismo texto narrado y dialogado se sintetiza con voces diferenciadas sin necesidad de cambiar de modelo.
- Generación de voces para videojuegos y prototipos: los desarrolladores pueden generar diálogos de prueba para distintos NPC asignando un marcador de hablante por personaje, acelerando la iteración antes de contratar actores de voz definitivos.
- Accesibilidad y lectura de contenido: conversión de artículos, documentación o textos largos a audio para usuarios con discapacidad visual o para consumo en formato podcast, ejecutando el modelo en local con llama.cpp.
- Doblaje y localización de contenido: síntesis de pistas de voz para vídeos o presentaciones con varios interlocutores, usando marcadores distintos para narrador y personajes.
- Asistentes de voz autoalojados: despliegue con `llama serve` y consumo del endpoint `/tts` desde una aplicación de asistente, manteniendo los datos de texto en infraestructura propia.
- Investigación en síntesis de voz: al ser un modelo de 34,7 mil millones de parámetros con licencia de investigación, sirve como base para estudiar calidad de síntesis multi-hablante y comparar frente a modelos TTS más pequeños.
- Generación de material educativo: creación de lecciones narradas con voces diferenciadas para ejemplos, diálogos o dramatizaciones, siempre dentro de los límites de la licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 34,7 mil millones de parámetros, una cuantización de 4 bits requeriría del orden de 18-20 GB solo para los pesos, más el overhead de contexto y del decodificador de audio; las cuantizaciones de 8 bits superarían los 35 GB. Estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue cómodo requeriría GPUs de 40-80 GB (A100 40/80 GB, H100) para cuantizaciones altas; las cuantizaciones bajas podrían caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090), sin confirmación oficial.
- GPU consumer: posible en RTX 3090/4090 con cuantizaciones agresivas, sujeto a verificación práctica; no confirmado.
- Opciones de despliegue: llama.cpp mediante `llama-tts` (CLI) y `llama serve` (servidor con endpoint `/tts`), según la model card. No se documentan otras opciones como vLLM, TGI u Ollama para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A modo de contexto estructural, se indica lo siguiente:

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| drama-3 (esta ficha) | ~34,7 mil millones | GGUF / safetensors | Fish Audio Research License | TTS multi-hablante con 16 voces; clonación no soportada |
| Alternativas TTS de la misma categoría | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Research License permite uso gratuito para investigación y uso no comercial, pero limita el uso comercial. Es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Clonación de voz no soportada: el modelo solo ofrece las 16 voces predefinidas por los marcadores de hablante; no se puede imitar una voz concreta.
- Idiomas soportados no documentados: se desconoce qué lenguas cubre el modelo y con qué calidad, lo que impide garantizar su uso en castellano sin pruebas previas.
- Riesgo de alucinación y artefactos de audio: no hay datos publicados sobre la tasa de errores de pronunciación, omisiones o artefactos en textos largos o con caracteres especiales.
- Sesgos: no se documentan sesgos conocidos en la información disponible; es esperable que el modelo refleje sesgos de los datos de entrenamiento originales, no publicados.
- Contexto: la longitud máxima de texto de entrada no está especificada, lo que limita la planificación de cargas de trabajo con textos largos.
- Repositorio de gran tamaño: 129,8 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.
- Conversión automática: los pesos GGUF se generaron con `ggml-org/convert` sin validación documentada, por lo que conviene verificar la calidad de la conversión antes de usarla en producción.
- Metadatos de la publicación: el repositorio no registra descargas ni interacciones, y no se especifican los niveles de cuantización incluidos.

## Enlaces

- Repositorio Hugging Face de esta publicación: https://huggingface.co/Infinity-io/drama-3-GGUF_1
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia del modelo base: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Documentación de TTS en llama.cpp (drama-3): https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#drama-3
- Herramienta de conversión a GGUF: https://github.com/ggml-org/convert
- Repositorio de referencia GGUF del autor original: https://huggingface.co/ggml-org/drama-3-GGUF
