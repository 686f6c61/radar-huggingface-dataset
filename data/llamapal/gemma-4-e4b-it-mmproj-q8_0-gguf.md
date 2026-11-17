# LlamaPal/gemma-4-E4B-it-mmproj-Q8_0-GGUF

## Resumen

`LlamaPal/gemma-4-E4B-it-mmproj-Q8_0-GGUF` es un espejo del proyector multimodal (mmproj) del modelo Gemma 4 E4B de Google, empaquetado en formato GGUF con cuantización Q8_0. No se trata de un modelo de lenguaje completo, sino del componente visual que permite al modelo base procesar imágenes: se carga junto al modelo principal en llama.cpp mediante el flag `--mmproj`. El autor del repositorio, LlamaPal, lo distribuye como complemento para su aplicación de IA offline en Android.

El archivo es una copia byte a byte del original publicado por ggml-org en `ggml-org/gemma-4-E4B-it-GGUF` (commit `a69f018d7678`), con el mismo hash SHA-256, por lo que no introduce modificaciones sobre el proyector de referencia. Su tamaño es de 560 MB y el repositorio completo ocupa 0,6 GB. La relevancia de esta ficha radica en que documenta el uso del componente visual de Gemma 4 E4B en entornos de inferencia local, especialmente en dispositivos móviles.

El modelo base, `google/gemma-4-E4B-it`, es un modelo instructivo multimodal de la familia Gemma 4. El dato de parámetros totales reportado en safetensors para este repositorio (478.088.384) corresponde al proyector multimodal, no al modelo de lenguaje completo. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para modelo base Gemma 4 E4B; arquitectura del proyector no disponible en detalle |
| Parámetros totales | 478.088.384 (proyector multimodal) |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-gemma-4-E4B-it-Q8_0.gguf`, 560 MB) |

## Arquitectura y entrenamiento

Este repositorio contiene únicamente el proyector multimodal, no el modelo de lenguaje. El proyector es el componente que traduce representaciones visuales al espacio de embeddings del modelo base para que este pueda razonar sobre imágenes. El archivo es una copia sin modificar del original de ggml-org, por lo que su arquitectura y entrenamiento corresponden a los del proyector oficial de Gemma 4 E4B; no se dispone en la información proporcionada de detalles sobre capas, dimensión de embeddings, número de tokens visuales por imagen ni composición del dataset de entrenamiento.

El modelo base `google/gemma-4-E4B-it` es un modelo instructivo multimodal de Google. No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas del modelo base. La cuantización Q8_0 del proyector es una conversión a 8 bits por bloque orientada a reducir el peso en memoria manteniendo alta fidelidad numérica.

## Capacidades

- Procesamiento de imágenes: el proyector habilita la entrada visual del modelo base Gemma 4 E4B, permitiendo tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Integración con llama.cpp: se carga como archivo `--mmproj` junto al modelo de lenguaje correspondiente.
- Inferencia offline en Android: diseñado para ejecutarse en la aplicación LlamaPal sin conexión a internet ni cuenta de usuario.
- Compatibilidad con el pipeline `any-to-any`: el repositorio declara este pipeline, coherente con un modelo multimodal de entrada imagen y salida texto.
- Capacidades de texto, razonamiento, código, tool calling o agentes: dependen del modelo base Gemma 4 E4B, no de este proyector; no se detallan en la información proporcionada.

## Casos de uso

- Descripción de imágenes en el móvil: el usuario carga una foto en LlamaPal y el modelo, con el proyector cargado, genera una descripción textual sin enviar la imagen a ningún servidor. Adecuado por su tamaño reducido (560 MB) y su orientación a dispositivos Android.
- Asistencia visual offline para accesibilidad: lectura y explicación de contenido visual (etiquetas, documentos, señales) en entornos sin conectividad, aprovechando que la app no requiere internet.
- Preguntas y respuestas sobre capturas de pantalla: el usuario comparte una captura y consulta detalles concretos; el proyector traduce la imagen al espacio del modelo base para que responda en lenguaje natural.
- Procesamiento de imágenes en local para privacidad: escenarios donde no se permite subir imágenes a la nube, como fotos personales o documentos sensibles, ya que todo el procesamiento ocurre en el dispositivo.
- Integración en pipelines llama.cpp de escritorio: usar el archivo como `--mmproj` junto al modelo Gemma 4 E4B en servidores o estaciones de trabajo con llama.cpp para tareas de visión por lotes.
- Prototipado de aplicaciones multimodales móviles: desarrolladores que quieran validar flujos imagen-texto en Android antes de escalar a infraestructura mayor, usando el par modelo + mmproj en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el proyector: aproximadamente 560 MB en Q8_0, según el tamaño del archivo.
- VRAM total: debe sumarse a la del modelo de lenguaje Gemma 4 E4B, cuyo peso no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. El repositorio está orientado a ejecución en Android mediante LlamaPal, no a GPU de escritorio.
- ¿Cabe en GPU de consumo? El proyector por sí solo sí; el conjunto con el modelo base depende del tamaño de este, no especificado.
- Opciones de despliegue: llama.cpp (flag `--mmproj`), aplicación LlamaPal para Android.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (mmproj Gemma 4 E4B Q8_0) | Proyector multimodal | 478.088.384 | no disponible | Apache 2.0 | GGUF |
| ggml-org/gemma-4-E4B-it-GGUF (original) | Proyector + modelo | no disponible | no disponible | Apache 2.0 | GGUF |
| google/gemma-4-E4B-it (modelo base) | Modelo multimodal instructivo | no disponible | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo autónomo: es solo el proyector visual y requiere el modelo de lenguaje Gemma 4 E4B para funcionar.
- Al ser una copia sin modificar del original de ggml-org, cualquier limitación del proyector oficial aplica también aquí.
- Sesgos conocidos: no disponibles en la información proporcionada; dependen del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el del modelo base en tareas de descripción visual.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 E4B, que puede tener términos adicionales no reflejados en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del espejo.
- Para producción en Android, la fiabilidad depende de la app LlamaPal y de la memoria disponible en el dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/gemma-4-E4B-it-mmproj-Q8_0-GGUF
- Repositorio original del proyector: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
