# sabda-ai/gemma-4-E2B-sabda

## Resumen

Gemma 4 E2B para Sabda es un paquete de pesos derivado de `google/gemma-4-E2B-it-qat-q4_0-unquantized`, el checkpoint de Google Gemma 4 en su variante E2B (instruida y cuantizada con QAT a 4 bits). El repositorio lo publica el proyecto Sabda y no contiene ningún ajuste fino: su función es servir como dependencia estable para la aplicación de reconocimiento de voz en dispositivo de Sabda, de modo que las descargas de la app no dependan de que otros repositorios mantengan sus ficheros.

El paquete incluye dos artefactos: el GGUF de pesos del modelo en cuantización UD-Q4_K_XL (2.620.370.976 bytes) y un proyector multimodal modificado (`mmproj`) que conserva únicamente el codificador de audio en Q8_0 (330.150.592 bytes). La modificación consiste en eliminar el codificador de visión y su proyección, dejando intactos todos los tensores y ajustes de audio.

El interés técnico está en esa reducción selectiva del proyector: según las mediciones del autor, el fichero recortado obtiene los mismos resultados que el completo en sus conjuntos de prueba (inglés, nepalí-inglés mixto, comprensión y silencio) con unos 270 MB menos de memoria. El modelo no está pensado para uso general como LLM, sino como motor de comprensión de voz en local dentro de un pipeline llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (variante E2B), con codificador de audio; detalles internos de capas y atención no disponibles |
| Parametros totales | 4.628.569.635 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (UD-Q4_K_XL, 4 bits, pesos del modelo); Q8_0 (proyector de audio) |
| Idiomas soportados | no disponible en la model card; las pruebas del autor cubren inglés y nepalí-inglés mixto |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) más GGUF de proyector multimodal (`mmproj`) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo que sí se especifica es que se parte de `google/gemma-4-E2B-it-qat-q4_0-unquantized`, es decir, un checkpoint de Gemma 4 E2B con ajuste por instrucciones y cuantización consciente del entrenamiento (QAT) a 4 bits, que Unsloth convirtió a GGUF en `unsloth/gemma-4-E2B-it-qat-GGUF` (commit `66a399f68ddd113b06dff02fca9523e55465d11d`). El fichero de pesos de este repositorio es una copia sin modificar de esa conversión.

La única intervención técnica propia es la construcción del proyector multimodal reducido a audio. Se parte de `mmproj-gemma-4-E2B-it-Q8_0.gguf` de `ggml-org/gemma-4-E2B-it-GGUF` (commit `6938c58e698502037401a5f19f6905f2fb2f7dee`, 557.368.064 bytes) y el script `audio_only_ears.py` elimina los tensores de visión (`v.*`), la proyección de visión (`mm.input_projection.weight`), los ajustes `clip.vision.*` y fija `clip.has_vision_encoder` a `false`. Todos los tensores y ajustes de audio se copian byte a byte, y la ejecución del script sobre el fichero original reproduce exactamente el sha256 publicado. El resultado es un modelo que conserva la comprensión de audio pero no puede procesar imágenes.

## Capacidades

- Reconocimiento y comprensión de voz: el paquete incluye el codificador de audio de Gemma 4 E2B, por lo que el modelo puede recibir audio y producir texto o respuestas conversacionales sobre él.
- Conversación multi-turno: el checkpoint base es la variante instruida (`-it`), orientada a diálogo.
- Ejecución en dispositivo: los GGUF están preparados para llama.cpp, lo que permite inferencia local sin servicios externos.
- Procesamiento conjunto de audio y texto dentro de una misma ventana de contexto multimodal (longitud no especificada).
- Sin capacidad de visión: el codificador de imagen ha sido eliminado deliberadamente del proyector.
- Soporte de tool calling, agentes, matemáticas o código: no disponible en la información proporcionada.

## Casos de uso

- Dictado y transcripción en local: la app carga el GGUF Q4_K_XL y el proyector de audio en llama.cpp para convertir voz en texto sin enviar audio a la nube, lo que reduce latencia y evita exposición de datos personales.
- Asistentes de voz sin conexión: al ejecutarse en dispositivo, el modelo puede mantener conversaciones habladas en entornos sin red (campo, transporte, zonas rurales) usando el par de ficheros publicado.
- Aplicaciones con presupuesto de memoria ajustado: el proyector recortado ahorra unos 270 MB frente al fichero completo manteniendo los mismos resultados en las pruebas del autor, un margen relevante en móviles y equipos de gama media.
- Reproducibilidad de despliegues: al fijar versiones y hashes sha256 de pesos y proyector, un equipo puede integrar el modelo en su cadena de build y verificar la integridad de los artefactos en CI.
- Procesamiento de habla bilingüe nepalí-inglés: el autor valida el modelo en conjuntos mixtos nepalí-inglés, por lo que encaja en aplicaciones de atención al ciudadano o educación en contextos de code-switching.
- Detección de silencio y segmentación de turnos: las pruebas del autor incluyen silencio, lo que permite usar el modelo como componente de un pipeline de voz que decide cuándo hay habla antes de invocar el reconocimiento completo.
- Base para experimentación multimodal: investigadores pueden sustituir o ampliar el proyector con sus propios codificadores siguiendo el mismo esquema de llama.cpp, partiendo de un paquete ya verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que, en los conjuntos de prueba internos de Sabda (inglés, nepalí-inglés mixto, comprensión y silencio), el proyector de audio recortado obtiene los mismos resultados que el fichero completo con aproximadamente 270 MB menos de memoria. No se aportan métricas numéricas de precisión, WER ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el GGUF de pesos ocupa 2,62 GB y el proyector de audio 0,33 GB, por lo que el conjunto ronda los 3 GB en disco y requiere memoria adicional para el contexto y el estado de inferencia.
- GPU recomendadas: no disponible. Al ser un modelo de ~4,6 mil millones de parámetros en 4 bits, es candidato a ejecutarse en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos ni pruebas por hardware.
- Viabilidad en GPU de consumo: probable según el tamaño de los ficheros, pero sin confirmación oficial ni lista de modelos concretos.
- Opciones de despliegue: llama.cpp es el runtime previsto (formato GGUF y proyector `mmproj`). No se documenta compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sabda-ai/gemma-4-E2B-sabda | 4.628.569.635 | no disponible | GGUF + mmproj audio | Apache 2.0 | Copia empaquetada con proyector solo-audio |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 4.628.569.635 | no disponible | safetensors | Apache 2.0 | Modelo base original de Google |
| unsloth/gemma-4-E2B-it-qat-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Conversión GGUF de referencia usada como origen |
| ggml-org/gemma-4-E2B-it-GGUF | no disponible | no disponible | GGUF + mmproj completo | Apache 2.0 | Proyector multimodal original con visión y audio |

Las diferencias prácticas entre estas variantes son de empaquetado y de proyector, no de pesos: los tres GGUF derivan del mismo checkpoint QAT de Google. La variante de Sabda es la única que elimina la visión del proyector.

## Limitaciones y advertencias

- No es un modelo ajustado: no aporta ninguna mejora sobre Gemma 4 E2B; solo fija versiones y hashes para garantizar estabilidad de descargas.
- Sin capacidad de visión: el proyector recortado no puede procesar imágenes, a diferencia del `mmproj` original de ggml-org.
- Idiomas no declarados: la model card no enumera lenguas soportadas; las pruebas se limitan a inglés y nepalí-inglés mixto, por lo que el rendimiento en castellano no está verificado.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de tasas de error en transcripción.
- Sesgos: no se publica información sobre sesgos demográficos, acústicos o lingüísticos del modelo base ni de este empaquetado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de Google y de las conversiones intermedias (Unsloth y ggml-org) antes de redistribuir.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni mantenimiento continuado.
- Integridad: la verificación depende de los sha256 publicados; cualquier fichero descargado sin comprobar el hash no debe considerarse equivalente.
- Runtime: al estar en formato GGUF, el despliegue queda ligado a llama.cpp y a su soporte del proyector multimodal; no se garantiza compatibilidad con otros motores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sabda-ai/gemma-4-E2B-sabda
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Conversión GGUF de Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF
- GGUF original con proyector completo: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
