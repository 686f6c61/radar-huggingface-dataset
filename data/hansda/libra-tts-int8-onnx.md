# Hansda/Libra-TTS-INT8-ONNX

## Resumen

Libra-TTS INT8-ONNX es una versión cuantizada a INT8 y exportada a formato ONNX del modelo de síntesis de voz Ekam/Libra-TTS, publicada por el usuario Hansda en Hugging Face. El paquete incluye los tres grafos que componen el pipeline completo de TTS: el *talker* (modelo principal de generación de tokens acústicos), el *predictor* de códigos residuales y el *decoder* de forma de onda. El objetivo es permitir la inferencia en CPU con ONNX Runtime, reduciendo el peso total de los pesos de 1742,0 MB en FP32 a 759,5 MB en INT8.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta práctica de despliegue de un modelo TTS en entornos sin GPU, algo útil para aplicaciones de accesibilidad, sistemas embebidos o servicios con requisitos estrictos de coste. Por otro lado, la información pública disponible es muy escasa: la model card no detalla arquitectura interna, número de parámetros, idiomas exactos ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

El modelo base, Ekam/Libra-TTS, está etiquetado como multilingüe y la validación reportada por el autor confirma generación de audio no silencioso a 24 kHz en inglés y español. La licencia es Apache-2.0 tanto para el modelo como para el runtime, lo que facilita el uso comercial, aunque conviene verificar las condiciones del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (pipeline TTS con tres grafos ONNX: talker, predictor y decoder) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 dinámica por canal en MatMul de pesos constantes; resto de operadores en precisión original |
| Idiomas soportados | Multilingüe (etiqueta del autor); validado en inglés y español |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8), con manifiesto de hashes SHA-256 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Lo que sí se detalla es la estructura de despliegue: tres grafos ONNX independientes que cubren el *talker* (1110,4 MB en FP32, 427,6 MB en INT8, 215 MatMul cuantizados), el *predictor* de códigos residuales (175,3 MB FP32, 104,5 MB INT8, 71 MatMul cuantizados) y el *decoder* de forma de onda (456,3 MB FP32, 227,4 MB INT8, 62 MatMul cuantizados). La suma de los tres grafos pasa de 1742,0 MB a 759,5 MB, y la descarga completa de pesos y assets de runtime es de aproximadamente 771,1 MB.

La cuantización aplicada es dinámica para las activaciones y por canal con enteros con signo de 8 bits para los pesos en los operadores MatMul de pesos constantes; el resto de operadores conserva su precisión original. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. Tampoco se indican innovaciones como decodificación especulativa o atención lineal. La validación reportada consiste en cargar los tres grafos en el runtime CPU de Libra con ONNX Runtime 1.23.1 y generar audio no silencioso a 24 kHz en inglés y español usando el tokenizador y front-end originales.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`), con generación de audio a 24 kHz según la validación del autor.
- Soporte multilingüe según la etiqueta del autor; validado explícitamente en inglés y español.
- Selección de voz mediante el parámetro `--voice` (el ejemplo de la model card usa `nina`).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el paquete `libra-tts` instalable desde el repositorio GitHub de Ekam, con backend `onnx`.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, streaming ni *tool calling*.

## Casos de uso

- **Locución de artículos y documentación en servidores sin GPU**: el modelo puede ejecutarse en CPU con ONNX Runtime y generar audio a 24 kHz, lo que permite convertir textos largos en locuciones para blogs o wikis en infraestructura de bajo coste.
- **Accesibilidad web y lectura de pantalla**: integrado en un servicio backend, puede sintetizar contenido dinámico en inglés y español para usuarios con discapacidad visual, aprovechando que no requiere acelerador hardware.
- **Sistemas embebidos y dispositivos de borde**: con aproximadamente 771,1 MB de descarga total y grafos INT8, es viable en dispositivos con CPU moderna y almacenamiento limitado, como asistentes domésticos o paneles informativos.
- **Generación de avisos y notificaciones automatizadas**: en aplicaciones de mensajería o telefonía IP, el modelo puede producir mensajes pregrabados bajo demanda en varios idiomas, reduciendo la necesidad de almacenar audio pregenerado.
- **Prototipado rápido de productos de voz**: el comando de ejemplo de la model card permite generar un WAV en una sola línea, lo que acelera la validación de ideas antes de invertir en infraestructura GPU.
- **Procesamiento por lotes en pipelines de datos**: al ser ONNX, puede integrarse en flujos de preprocesamiento que generen audiolibros o descripciones de imágenes para datasets, ejecutándose en paralelo en clústeres de CPU.
- **Investigación en cuantización de TTS**: sirve como referencia reproducible para estudiar el impacto de INT8 dinámico en las tres etapas de un pipeline TTS, comparando los tamaños FP32 e INT8 publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es cualitativa: los tres grafos cargan correctamente en ONNX Runtime 1.23.1 y generan audio no silencioso a 24 kHz en inglés y español. No se proporcionan métricas de MOS, latencia, RTF ni comparaciones objetivas con el modelo FP32.

## Requisitos de hardware

- **VRAM estimada**: no aplica para el modo CPU; el paquete está diseñado para inferencia en CPU con ONNX Runtime. Para una hipotética ejecución en GPU no se proporcionan datos.
- **Almacenamiento**: aproximadamente 771,1 MB para pesos y assets de runtime; el repositorio ocupa 0,8 GB.
- **Memoria RAM**: no especificada; como referencia, los grafos INT8 suman 759,5 MB, por lo que se necesita al menos ese espacio más el overhead de activaciones y del runtime.
- **GPU recomendadas**: no disponibles; el autor no documenta soporte GPU para esta release.
- **Compatibilidad con GPU de consumo**: no documentada; el enfoque es CPU.
- **Opciones de despliegue**: ONNX Runtime (versión validada 1.23.1) a través del paquete `libra-tts` con backend `onnx`, instalable desde el repositorio GitHub de Ekam en el commit indicado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. El modelo base Ekam/Libra-TTS es la referencia directa, pero no se han publicado sus especificaciones en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Libra-TTS INT8-ONNX (este) | No disponible | No disponible | Apache-2.0 | ONNX INT8 | Enfoque CPU; 759,5 MB en grafos |
| Ekam/Libra-TTS (FP32) | No disponible | No disponible | No disponible en la informacion | No disponible | Modelo base; checkpoint fijado en el commit 4a7835a |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- **Información técnica incompleta**: no se publican número de parámetros, arquitectura interna, contexto, datos de entrenamiento ni benchmarks; esto dificulta evaluar su calidad frente a alternativas.
- **Validación limitada**: la validación del autor se reduce a comprobar audio no silencioso en inglés y español; no hay evaluación de naturalidad, prosodia ni inteligibilidad con métricas objetivas.
- **Riesgo de alucinación y artefactos**: como todo modelo TTS, puede producir pronunciaciones incorrectas, omisiones o artefactos acústicos en textos fuera de dominio; no se documentan mitigaciones.
- **Sesgos**: no se documentan sesgos de voz, género, acento o idioma; la única voz referenciada en el ejemplo es `nina`.
- **Cobertura de idiomas incierta**: la etiqueta indica multilingüe, pero solo se valida inglés y español; otros idiomas no están confirmados.
- **Dependencia de un runtime específico**: requiere el paquete `libra-tts` y una versión concreta de ONNX Runtime (1.23.1) y un commit fijado del repositorio de GitHub, lo que puede complicar la reproducibilidad a largo plazo.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del checkpoint original Ekam/Libra-TTS, cuya licencia no se detalla en la información disponible.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- [Modelo en Hugging Face: Hansda/Libra-TTS-INT8-ONNX](https://huggingface.co/Hansda/Libra-TTS-INT8-ONNX)
- [Modelo base: Ekam/Libra-TTS](https://huggingface.co/Ekam/Libra-TTS)
- [Checkpoint fuente fijado (commit 4a7835a)](https://huggingface.co/Ekam/Libra-TTS/tree/4a7835ada3d7e2fb59f5e03f20b9d5b8fe60272c)
- [Repositorio GitHub del runtime Libra-TTS (commit 1d390a8)](https://github.com/ekambrar100/Libra-TTS.git)
- [Manifiesto del modelo con hashes SHA-256](https://huggingface.co/Hansda/Libra-TTS-INT8-ONNX/blob/main/model-manifest.json)
- [Licencia Apache-2.0 del repositorio](https://huggingface.co/Hansda/Libra-TTS-INT8-ONNX/blob/main/LICENSE)
