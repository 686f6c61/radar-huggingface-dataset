# skaldrim/whisper-large-faroese-ggml

## Resumen

`skaldrim/whisper-large-faroese-ggml` es una conversión al formato GGML de Whisper large para reconocimiento automático del habla (ASR) en feroés, publicada por el usuario skaldrim para su uso en la aplicación Skaldrim de subtitulado en dispositivo. El modelo no aporta pesos nuevos: es una conversión de formato del checkpoint `carlosdanielhernandezmena/whisper-large-faroese-8k-steps-100h`, desarrollado por Carlos Daniel Hernández Mena en el Language and Voice Lab de la Universidad de Reikiavik, que a su vez es un fine-tuning de `openai/whisper-large-v2` sobre 100 horas del corpus Ravnursson del proyecto Ravnur (Islas Feroe).

La relevancia de esta ficha es acotada pero clara: el feroés es una lengua de bajos recursos (unos 70.000 hablantes) y prácticamente no existen modelos ASR empaquetados para ejecución local. Esta conversión permite usar el modelo con `whisper.cpp` sin necesidad de Python ni de GPU, incluyendo una variante cuantizada q5_0 de aproximadamente 1 GB pensada para teléfonos.

Arquitectura y tamaño corresponden al Whisper large original (transformer encoder-decoder de 1.550 millones de parámetros, contexto de audio de 30 segundos), del que no se modificó nada salvo el formato de serialización. La licencia es CC-BY-4.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large v2) |
| Parametros totales | 1.550 millones (heredados de whisper-large-v2; no confirmado explícitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (estándar de Whisper) |
| Tipos de cuantizacion | f16 (16 bits) y q5_0 |
| Idiomas soportados | feroés (fo) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGML (.bin), dos ficheros: f16 de 3.094.623.708 bytes y q5_0 de 1.080.732.108 bytes |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de `openai/whisper-large-v2`, un transformer encoder-decoder con atención estándar y 1.550 millones de parámetros, entrenado originalmente por OpenAI para transcripción y traducción multilingüe sobre audio de 16 kHz en ventanas de 30 segundos. El ajuste fino lo realizó Carlos Daniel Hernández Mena con 100 horas de audio en feroés del corpus Ravnursson (proyecto Ravnur, Islas Feroe), en una ejecución de 8.000 pasos.

La contribución de este repositorio es exclusivamente de empaquetado: los pesos se convirtieron con el script `models/convert-h5-to-ggml.py` de whisper.cpp en precisión de 16 bits y, para dispositivos móviles, se cuantizaron a q5_0 con `whisper-quantize`. No hubo entrenamiento adicional, destilación ni cambios en la arquitectura. El autor declara explícitamente que cualquier error de conversión es responsabilidad suya y no del equipo que entrenó el modelo.

## Capacidades

- Reconocimiento automático del habla en feroés a partir de audio de 16 kHz, con salida de texto plano o subtítulos.
- Ejecución en dispositivo (móvil o PC) mediante whisper.cpp, sin dependencia de Python ni de servicios en la nube.
- Dos variantes de precisión: f16 para máxima calidad y q5_0 para menor huella de memoria.
- No incluye tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No soporta visión, audio generation ni otros idiomas distintos del feroés de forma fiable (el token de idioma debe fijarse a `fo`).
- No dispone de modo "thinking" ni de decodificación especulativa propia.

## Casos de uso

- Subtitulado en directo en dispositivos móviles: la variante q5_0 (~1 GB) cabe en la memoria de un teléfono moderno y permite generar subtítulos sin enviar audio a un servidor, lo que es relevante para privacidad y para uso sin conectividad.
- Transcripción de entrevistas y archivos orales en feroés: investigadores de lingüística o historia oral pueden procesar grabaciones localmente con la variante f16 y revisar después el texto.
- Accesibilidad para contenido audiovisual en feroés: generación de pistas de subtítulos para vídeos de medios locales, ayuntamientos o instituciones culturales de las Islas Feroe.
- Preservación lingüística: digitalización y transcripción de corpus orales en feroés para proyectos de documentación, aprovechando que el modelo se entrenó sobre el corpus Ravnursson.
- Integración en aplicaciones de escritorio tipo Skaldrim: el formato GGML se enlaza directamente con la librería whisper.cpp en C/C++, lo que simplifica el despliegue multiplataforma sin runtime de Python.
- Prototipado de pipelines ASR sin GPU: en un portátil sin acelerador se puede ejecutar la variante q5_0 en CPU para validar flujos de transcripción antes de escalar a infraestructura mayor.
- Traducción asistida por humano: el texto transcrito sirve como base para revisión y traducción posterior al danés o al inglés, dado que Whisper large conserva cierta capacidad de traducción aunque este fine-tuning esté orientado a transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,1 GB para la variante f16 y aproximadamente 1,1 GB para la variante q5_0, según los tamaños de fichero declarados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la variante f16; la q5_0 funciona en GPUs integradas y en CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, la variante q5_0 cabe holgadamente en cualquier GPU de consumo reciente y en la mayoría de teléfonos de gama media-alta; la f16 requiere al menos 4 GB de memoria libre.
- Opciones de despliegue: whisper.cpp (formato nativo GGML), con enlace directo desde C/C++ o mediante bindings; no se mencionan vLLM, TGI ni Ollama, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/whisper-large-faroese-ggml | 1.550 M | 30 s | feroés | CC-BY-4.0 | GGML |
| carlosdanielhernandezmena/whisper-large-faroese-8k-steps-100h | 1.550 M | 30 s | feroés | no disponible en la informacion | safetensors (Hugging Face Transformers) |
| openai/whisper-large-v2 | 1.550 M | 30 s | multilingüe (99 idiomas) | MIT (según el modelo original de OpenAI) | PyTorch / safetensors |
| danielus/ggml-whisper-models | no disponible | 30 s | multilingüe | no disponible | GGML |

La comparación relevante es con el checkpoint original en Transformers: misma calidad esperada, pero este repositorio ofrece ejecución local sin Python. Frente a whisper-large-v2, la diferencia es la especialización en feroés (mejor cobertura de esa lengua) a costa de perder el resto de idiomas.

## Limitaciones y advertencias

- Solo feroés: el token de idioma debe fijarse a `fo`; el uso con otros idiomas no está soportado y probablemente degrade la calidad.
- Ventana de audio de 30 segundos: para grabaciones largas es necesario segmentar, con el riesgo de cortes en palabras si la segmentación es ingenua.
- Riesgo de alucinación: como todo Whisper, puede generar texto plausible en silencios o ruido, especialmente en pasajes con audio degradado.
- Sesgos: el corpus Ravnursson (100 horas) probablemente no representa toda la variación dialectal del feroés; no hay información sobre la composición demográfica del dataset.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución tanto a Carlos Daniel Hernández Mena y al proyecto Ravnur como al autor de la conversión; conviene revisar el fichero `LICENSE` incluido.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación futura en los metadatos (2026-11-07), lo que sugiere baja madurez o datos inconsistentes; no hay garantía de mantenimiento.
- No hay benchmarks publicados para esta conversión; la calidad real de la cuantización q5_0 frente a f16 no está documentada.
- El autor advierte que los posibles errores de conversión son suyos y no del equipo que entrenó el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skaldrim/whisper-large-faroese-ggml
- Modelo base (fine-tuning en feroés): https://huggingface.co/carlosdanielhernandezmena/whisper-large-faroese-8k-steps-100h
- Variante large-v2 del mismo autor: https://huggingface.co/carlosdanielhernandezmena/whisper-largev2-faroese-8k-steps-100h
- Proyecto Ravnur (corpus Ravnursson): https://maltokni.fo/en/
- whisper.cpp (implementación GGML): https://github.com/ggerganov/whisper.cpp
- Repositorio de modelos GGML de referencia: https://huggingface.co/danielus/ggml-whisper-models
