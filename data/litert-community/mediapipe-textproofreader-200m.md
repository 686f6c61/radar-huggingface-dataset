# litert-community/MediaPipe-TextProofreader-200M

## Resumen

MediaPipe-TextProofreader-200M es un modelo compacto de correccion de texto desarrollado por el equipo litert-community de Google, derivado de la familia Gemma y empaquetado especificamente para la tarea Text Proofreader de MediaPipe. Con 200 millones de parametros y cuantizacion de precision mixta (int4 + int8), el modelo se distribuye como un unico archivo `.litertlm` de 117,59 MB que integra los subgrafos LiteRT de prefill y decode, el tokenizador SentencePiece y los metadatos de la plantilla de prompt en un formato mapeado en memoria.

El modelo resuelve un problema concreto: la correccion de errores ortograficos, gramaticales y estilisticos en el propio dispositivo, sin enviar texto privado a la nube. Esta disenado para Android, iOS y Python de escritorio mediante el runtime LiteRT-LM, con un consumo pico de RAM que oscila entre 200 MB y 350 MB segun la longitud de la entrada (de 100 a 2.000 palabras). Su ventana de contexto alcanza los 4.096 tokens, suficiente para parrafos y documentos cortos en una sola pasada.

Su relevancia actual radica en que demuestra que tareas de procesamiento de lenguaje natural de calidad pueden ejecutarse en hardware movil de gama alta con latencias interactivas: en un Pixel 10 Pro, procesar 100 palabras requiere 980 ms de extremo a extremo. El modelo esta sujeto a los Terminos de Uso de Gemma y su acceso en Hugging Face esta condicionado a la aceptacion de dichos terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma, empaquetado para LiteRT-LM (subgrafos prefill/decode) |
| Parametros totales | 200M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (`max_num_tokens=4096`) |
| Tipos de cuantizacion | int4 + int8 (precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.litertlm` (LiteRT-LM, archivo unico con tokenizador y metadatos) |

## Arquitectura y entrenamiento

El modelo es una variante compacta de 200M de parametros de la familia Gemma, adaptada a la tarea de correccion de texto y compilada para el runtime LiteRT-LM. El artefacto distribuido no contiene pesos en formato tradicional (safetensors o GGUF), sino un paquete `.litertlm` autocontenido que agrupa los subgrafos de prefill y decode cuantizados, el tokenizador SentencePiece y los metadatos de la plantilla de prompt. Esta estructura permite el mapeo en memoria y reduce la sobrecarga de carga en dispositivos moviles.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion de precision mixta (int4 + int8) es la innovacion tecnica mas destacable del artefacto: reduce el tamano a 117,59 MB manteniendo velocidades de decodificacion de 140-170 tokens por segundo en CPU de movil. Los binarios del repositorio son identicos byte a byte al artefacto oficial servido por Google desde `storage.googleapis.com/mediapipe-models`.

## Capacidades

- Correccion ortografica: detecta y corrige faltas de ortografia en el texto de entrada.
- Correccion gramatical: identifica errores de concordancia, tiempos verbales y estructura oracional.
- Correccion estilistica: sugiere mejoras de redaccion preservando el significado y el tono originales.
- Generacion de texto: el pipeline declarado es `text-generation`, con salida de texto corregido (`proofread_text`).
- Procesamiento on-device: ejecucion local sin conexion a la nube, con el texto del usuario sin salir del dispositivo.
- Multilingue: no disponible (los idiomas soportados no se especifican en la informacion).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Correccion de textos en aplicaciones de mensajeria: el modelo puede integrarse en el teclado o en el editor de un cliente de chat para corregir errores ortograficos y gramaticales antes de enviar, con latencias inferiores a un segundo para mensajes de 100 palabras (980 ms en Pixel 10 Pro) y sin enviar el contenido a servidores externos.
- Revision de documentos confidenciales: abogados, medicos o periodistas pueden corregir borradores con informacion sensible en local, aprovechando que el modelo no requiere conexion y que el texto permanece en el dispositivo.
- Procesamiento por lotes en escritorio: mediante Python y el runtime LiteRT-LM se pueden corregir lotes de parrafos de hasta 4.096 tokens, adecuado para preprocesar corpus o limpiar transcripciones antes de su publicacion.
- Asistencia a la redaccion en apps de notas: integracion en editores moviles para ofrecer sugerencias de estilo y gramatica en tiempo real mientras el usuario escribe, con un consumo de RAM de 200-350 MB que cabe en dispositivos de gama media y alta.
- Correccion de subtitulos y transcripciones: el modelo puede limpiar errores tipicos de transcripcion automatica (palabras mal segmentadas, faltas de concordancia) en fragmentos de hasta 2.000 palabras, con una latencia de 28 segundos en CPU movil para ese volumen.
- Filtrado previo en pipelines de datos: como etapa de preprocesamiento en un pipeline de NLP, el modelo puede normalizar y corregir texto extraido de formularios, OCR o scraping antes de alimentar modelos mayores o bases de datos.
- Educacion y aprendizaje de idiomas: aplicaciones de practica de escritura pueden mostrar correcciones inmediatas y locales, sin coste de API ni dependencia de conectividad.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son benchmarks de latencia de extremo a extremo en un Pixel 10 Pro (CPU), reportados por la documentacion de Text Proofreader:

| Dispositivo | Palabras de entrada (tokens) | Prefill (tokens/s) | Decode (tokens/s) | Latencia E2E (ms) |
|---|---|---:|---:|---:|
| Pixel 10 Pro CPU | 100 (≈200 tokens) | 1.280 | 170 | 980 |
| Pixel 10 Pro CPU | 500 (≈900 tokens) | 1.095 | 163 | 4.900 |
| Pixel 10 Pro CPU | 1000 (≈1900 tokens) | 1.025 | 150 | 16.000 |
| Pixel 10 Pro CPU | 2000 (≈3600 tokens) | 980 | 140 | 28.000 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 200-350 MB de RAM pico en dispositivo, segun la longitud de entrada (100 a 2.000 palabras). El archivo de pesos ocupa 117,59 MB.
- GPU recomendadas: no aplica; el modelo esta optimizado para CPU en Android, iOS y Python de escritorio. No se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el runtime objetivo es LiteRT-LM sobre CPU movil y de escritorio.
- Opciones de despliegue: MediaPipe Tasks (`TextProofreader`) con backend LiteRT-LM en Python, Android (Kotlin/Java) e iOS (Swift). No disponible en Web ni Flutter.
- Latencia y throughput: prefill de 980-1.280 tokens/s y decode de 140-170 tokens/s en Pixel 10 Pro CPU; latencia E2E de 980 ms (100 palabras) a 28.000 ms (2.000 palabras).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles de este modelo; las celdas de comparacion se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| MediaPipe-TextProofreader-200M | 200M | 4.096 tokens | gemma | `.litertlm` | MediaPipe / LiteRT-LM (Android, iOS, Python) |
| Alternativa comparable 1 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativa comparable 2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al derivar de Gemma, puede heredar sesgos de su modelo base.
- Riesgo de alucinacion: el modelo puede introducir cambios no solicitados o alterar el significado original; la model card recomienda revisar siempre las ediciones generadas antes de acciones irreversibles.
- Limitaciones de contexto: la ventana maxima es de 4.096 tokens; entradas mas largas deben fragmentarse. La latencia crece de forma no lineal con la longitud (28 s para 2.000 palabras en CPU movil).
- Idiomas: no se especifican los idiomas soportados; no se garantiza cobertura multilingue.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; el acceso en Hugging Face requiere aceptar dichos terminos. Es necesario verificar las condiciones de uso comercial en dichos terminos antes de integrarlo en productos.
- Plataformas: no disponible en Web ni Flutter; solo Android, iOS y Python de escritorio con backend LiteRT-LM.
- Entradas largas: el consumo de RAM y la latencia E2E pueden degradar la experiencia interactiva en dispositivos de gama baja.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/litert-community/MediaPipe-TextProofreader-200M)
- [Archivo de pesos proofread_quant_200m.litertlm](https://huggingface.co/litert-community/MediaPipe-TextProofreader-200M/blob/main/proofread_quant_200m.litertlm)
- [Documentacion de Text Proofreader (MediaPipe)](https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader)
- [Benchmarks de la tarea Text Proofreader](https://developers.google.com/edge/mediapipe/solutions/text/text_proofreader#task_benchmarks)
- [Repositorio LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
- [Notebook de Python en Colab](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_proofreader/python/text_proofreader.ipynb)
- [Ejemplo Android](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_proofreader/android)
- [Ejemplo iOS](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_proofreader/ios)
- [Guia de instalacion en Python](https://developers.google.com/edge/mediapipe/solutions/setup_python)
- [Guia de instalacion en Android](https://developers.google.com/edge/mediapipe/solutions/setup_android)
- [Guia de instalacion en iOS](https://developers.google.com/edge/mediapipe/solutions/setup_ios)
- [Demos web de MediaPipe](https://google-ai-edge.github.io/mediapipe-samples-web/)
- [Terminos de Uso de Gemma](https://ai.google.dev/gemma/terms)
- [Artefacto oficial en storage.googleapis.com](https://storage.googleapis.com/mediapipe-models/text_proofreader/200m/latest/proofread_quant_200m.litertlm)
