# JoaoZaokk/whisper-large-v3-vaani-hindi-ggml

## Resumen

El repositorio `JoaoZaokk/whisper-large-v3-vaani-hindi-ggml` no es un modelo entrenado desde cero, sino un reempaquetado en formato GGML del checkpoint `ARTPARK-IISc/whisper-large-v3-vaani-hindi`, un ajuste fino de Whisper large-v3 orientado al reconocimiento automático de habla en hindi. La conversión la mantiene el usuario JoaoZaokk y su objetivo declarado es ofrecer ficheros cargables directamente con whisper.cpp y con las aplicaciones nativas que lo embeben (Odysseus, Open WebUI), de modo que los enlaces de descarga permanezcan estables.

El valor práctico del repositorio está en el formato y en el tamaño: se publican tres variantes cuantizadas (q4_0 de 889 MB, q5_0 de 1081 MB y q8_0 de 1657 MB) que permiten ejecutar un modelo de la familia large-v3 en teléfonos, portátiles Apple Silicon y equipos sin GPU dedicada, algo inviable con los pesos originales en fp16. La arquitectura subyacente es la de Whisper large-v3, un transformer encoder-decoder con ventanas de audio de 30 segundos.

Es relevante ahora porque la transcripción de voz en lenguas indias con modelos abiertos y ejecutables en local sigue siendo un nicho poco cubierto, y porque el ecosistema whisper.cpp concentra buena parte del despliegue on-device en producción. El repositorio no incluye resultados de evaluación, ni detalles del ajuste fino, ni confirmación de que las cuantizaciones se hayan validado sobre audio en hindi. El repo acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper large-v3 (arquitectura del modelo base; no detallada en la ficha del autor) |
| Parámetros totales | 1550 millones aproximadamente, correspondientes a Whisper large-v3 (dato de la arquitectura base; no indicado en la ficha del autor) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como parámetro textual. Por la arquitectura Whisper large-v3, procesa ventanas de 30 segundos de audio y el decodificador trabaja con un contexto de 448 tokens |
| Tipos de cuantización | q4_0, q5_0 y q8_0 publicados; la ficha menciona además f16 como conversión sin pérdida, aunque no aparece en la tabla de ficheros |
| Idiomas soportados | Hindi (hi) según la etiqueta de idioma del repositorio. El ajuste se realizó sobre un checkpoint de Whisper large-v3, que originalmente es multilingüe |
| Licencia | apache-2.0 (sin cambios respecto al modelo base) |
| Formato de pesos | GGML / GGUF en ficheros `.bin` para whisper.cpp |
| Tamaño del repositorio | 3,6 GB |
| Ficheros publicados | `ggml-whisper-large-v3-vaani-hindi-q8_0.bin` (1657 MB), `ggml-whisper-large-v3-vaani-hindi-q5_0.bin` (1081 MB), `ggml-whisper-large-v3-vaani-hindi-q4_0.bin` (889 MB) |
| Modelo base | ARTPARK-IISc/whisper-large-v3-vaani-hindi (relación: quantized) |
| Librería | whisper.cpp |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una conversión de pesos. Según la ficha, los ficheros se generaron a partir del checkpoint original con el conversor propio de whisper.cpp y después se cuantizaron con el cuantizador de la misma herramienta. No se documenta ningún proceso de entrenamiento, ajuste adicional, RLHF o DPO, ni la composición del dataset del ajuste fino original. Toda la información sobre datos de entrenamiento corresponde al checkpoint de ARTPARK-IISc, que no se detalla en este repositorio.

La arquitectura resultante es la de Whisper large-v3: encoder de audio que consume espectrogramas mel de 128 bandas en ventanas de 30 segundos y decoder autorregresivo con tokens especiales de idioma y de tarea (transcripción o traducción). Las innovaciones destacables están en la cadena de herramientas de whisper.cpp más que en el modelo: conversión a GGML, cuantización en bloque y ejecución con kernels optimizados para CPU (AVX2/NEON), Metal en macOS, CUDA, Vulkan y otros backends. La ficha del autor no menciona decodificación especulativa, atención lineal ni modificaciones arquitectónicas propias.

## Capacidades

- Reconocimiento automático de habla en hindi, con salida de texto plano y marcas de tiempo generadas por el decoder de Whisper.
- Transcripción de audio en ventanas de 30 segundos, con chunking para ficheros de mayor duración gestionado por whisper.cpp.
- Ejecución totalmente offline y on-device, sin llamadas a servicios externos.
- Cuantizaciones orientadas a distintos perfiles de hardware: q4_0 y q5_0 para móviles, q8_0 para equipos de escritorio y Mac.
- Integración con cualquier aplicación que embeba whisper.cpp, incluida la CLI `whisper-cli -m <fichero>`.
- Traducción de voz a texto en inglés mediante los tokens de tarea de Whisper (capacidad heredada de la arquitectura base; no verificada para este checkpoint en la información disponible).
- No hay soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en dispositivos Android o iOS: con las variantes q4_0 (889 MB) o q5_0 (1081 MB) el modelo cabe en la memoria de un teléfono de gama media-alta, lo que permite dictado y notas de voz en hindi sin conexión ni coste por API.
- Subtitulado automático en portátiles Apple Silicon: la variante q8_0 (1657 MB) se ejecuta sobre Metal en Macs con memoria unificada, generando transcripciones con timestamps para vídeo y pódcast.
- Aplicaciones de escritorio con motor embebido: al estar empaquetado para whisper.cpp, se puede integrar en clientes como Open WebUI u Odysseus sin necesidad de servir el modelo en Python ni de mantener un proceso con PyTorch.
- Procesamiento por lotes en servidores sin GPU: whisper.cpp con backend CPU permite transcribir colas de audio en infraestructura barata, útil para digitalizar archivos de radio o atención telefónica en hindi.
- Asistentes de voz y sistemas IVR: la transcripción en local reduce la latencia del bucle de voz y evita enviar audio de clientes a terceros, algo relevante en sectores regulados.
- Investigación lingüística y creación de corpus: se puede usar para pre-anotar grandes volúmenes de habla en hindi y revisar después manualmente, reduciendo el coste de etiquetado respecto a la anotación desde cero.
- Despliegue en edge computing: el tamaño reducido en q4_0 hace viable ejecutarlo en placas tipo Raspberry Pi o dispositivos Jetson con poca memoria, siempre que se acepte la pérdida de precisión de la cuantización.
- Privacidad y cumplimiento normativo: al ejecutarse en el propio dispositivo, el audio nunca sale del equipo, lo que simplifica el tratamiento de datos personales en aplicaciones médicas o legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha del autor únicamente indica que cada variante se comprobó transcribiendo muestras cortas en portugués e inglés antes de subirlas, sin métricas de WER, CER ni comparaciones numéricas. Tampoco se aportan datos de latencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de los ficheros marca el suelo. q4_0 ocupa 889 MB, q5_0 1081 MB y q8_0 1657 MB; hay que sumar el overhead del runtime de whisper.cpp y las activaciones, no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre puede alojar las variantes cuantizadas (RTX 3060, RTX 4060, RTX 4090, A100, H100). Las GPU grandes aportan margen y velocidad, no son un requisito.
- GPU de consumo: sí cabe, en tarjetas de gama de entrada y media con 4 GB o más. También en Macs con Apple Silicon vía Metal y en iGPU compatibles con Vulkan.
- CPU y edge: whisper.cpp está pensado para CPU. La ficha indica explícitamente que las variantes q4_0 y q5_0 son la elección para teléfonos y que q8_0 se destina a Macs.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli` o sus bindings (pywhispercpp, whisper-node, entre otros), y aplicaciones que embeban el motor (Odysseus, Open WebUI en su modo nativo). vLLM y TGI no cargan este formato GGML; para servir el checkpoint original en Python habría que usar transformers o faster-whisper con los pesos de ARTPARK-IISc.
- Latencia y throughput estimados: no disponibles. Dependen del backend, del hardware y de la cuantización elegida, y el autor no publica mediciones.

## Comparativa con modelos similares

Nota: los datos de los modelos comparables provienen del conocimiento general de la familia Whisper y no se han verificado en la búsqueda web asociada a esta ficha.

| Modelo | Parámetros | Contexto / ventana | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| whisper-large-v3-vaani-hindi-ggml (este) | ~1550 M (arquitectura base) | 30 s de audio por ventana | GGML bb4 q4_0, q5_0, q8_0 | Hindi (etiqueta del repo) | apache-2.0 |
| ARTPARK-IISc/whisper-large-v3-vaani-hindi | ~1550 M (arquitectura base) | 30 s de audio por ventana | safetensors / PyTorch | Hindi | apache-2.0 |
| openai/whisper-large-v3 | ~1550 M | 30 s de audio por ventana | safetensors / PyTorch | Multilingüe (~99 idiomas) | apache-2.0 en HuggingFace |
| openai/whisper-large-v3-turbo | ~809 M | 30 s de audio por ventana | safetensors / PyTorch | Multilingüe | no disponible en esta consulta |

La diferencia principal frente al checkpoint original es el formato y el tamaño: se pasa de pesos fp16 a ficheros de entre 889 MB y 1657 MB, a cambio de una pérdida de precisión que el autor describe como pequeña en q4_* y prácticamente nula en q8_0, sin respaldarla con números. Frente a whisper-large-v3-turbo, este modelo conserva la profundidad completa del decoder a cambio de un tamaño notablemente mayor.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgos. Al ser un ajuste sobre habla en hindi, hereda los sesgos de género, acento, registro y variedad dialectal presentes en los datos de ajuste de ARTPARK-IISc, que no se detallan.
- Alucinación: los modelos Whisper tienden a generar texto plausible en tramos de silencio, ruido o música. Este repositorio no aporta ninguna mitigación ni parámetro específico para ello más allá de los disponibles en whisper.cpp.
- Validación cuestionable: la ficha indica que las variantes se comprobaron transcribiendo muestras cortas en portugués e inglés, no en hindi, que es el idioma objetivo del modelo. La verificación de calidad sobre el idioma real queda sin evidencia pública.
- Formato e interoperabilidad: los ficheros GGML solo se cargan con whisper.cpp y aplicaciones compatibles. No sirven con transformers, vLLM, TGI ni Ollama sin conversión adicional.
- Idiomas: aunque la arquitectura base es multilingüe, la etiqueta del repositorio declara únicamente hindi y no hay pruebas de que el ajuste fino preserve el rendimiento en otros idiomas. La ficha del autor no confirma el comportamiento multilingüe.
- Licencia: apache-2.0 permite uso comercial y modificación, siempre manteniendo aviso de licencia y atribución. El autor pide citar a ARTPARK-IISc y aclara que el repositorio solo reempaqueta pesos, sin garantía de ningún tipo.
- Madurez del repositorio: 0 descargas y 0 likes, sin historial de uso ni issues. Las fechas de creación y actualización registradas (septiembre de 2026) resultan anómalas y conviene verificarlas antes de depender del repositorio.
- Reproducibilidad: no se publican hashes, scripts de conversión, parámetros exactos de cuantización ni comandos utilizados, lo que dificulta reproducir los ficheros o auditar su integridad.
- Producción: al no haber métricas de WER ni pruebas sobre audio real en hindi, se recomienda evaluar el modelo con un conjunto propio antes de usarlo en un flujo crítico, y comparar contra el checkpoint original en fp16 para medir la degradación introducida por la cuantización.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-large-v3-vaani-hindi-ggml
- Modelo base (ARTPARK-IISc): https://huggingface.co/ARTPARK-IISc/whisper-large-v3-vaani-hindi
- Perfil del autor de la conversión: https://huggingface.co/JoaoZaokk
- Motor whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- No se han encontrado en la búsqueda web enlaces relevantes adicionales (papers, blogs ni demos) sobre este repositorio. Los resultados devueltos corresponden a páginas genéricas sin relación con el modelo.
