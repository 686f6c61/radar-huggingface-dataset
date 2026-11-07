# skaldrim/whisper-large-sme-ggml

## Resumen

`skaldrim/whisper-large-sme-ggml` es una conversion al formato ggml de Whisper para su uso con whisper.cpp del modelo `NbAiLab/whisper-large-sme`, un ajuste fino de Whisper Large orientado al reconocimiento automatico del habla (ASR) en sami septentrional, una lengua urálica hablada en el norte de Noruega, Suecia y Finlandia. El modelo original lo desarrollo la Biblioteca Nacional de Noruega (NbAiLab), y este repositorio se limita a cambiar el formato de los pesos para permitir inferencia en dispositivo (telefono o PC) dentro de la aplicacion Skaldrim, sin reentrenamiento ni modificacion de los pesos.

La relevancia de esta publicacion es practica: el sami septentrional es una lengua de bajos recursos con pocos modelos ASR disponibles, y la existencia de una version en ggml permite ejecutar el reconocimiento en local mediante whisper.cpp, sin depender de servicios en la nube. El repositorio ocupa 4,2 GB e incluye dos artefactos: los pesos en 16 bits y una version cuantizada a q5_0 pensada para moviles.

No se dispone de informacion sobre arquitectura detallada, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada; los datos tecnicos que siguen proceden de la model card del autor y de las convenciones conocidas del formato ggml para Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) segun el modelo base `NbAiLab/whisper-large-sme`; detalles no disponibles |
| Parametros totales | no disponible (el modelo base es un Whisper Large; cifra exacta no indicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; valor no indicado en la informacion) |
| Tipos de cuantizacion | 16 bits (F16) y q5_0 |
| Idiomas soportados | sami septentrional (`se`), invocando el token de idioma `fi` |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml / binario para whisper.cpp (`ggml-se-whisper-large-v2-sme.bin`, `ggml-se-whisper-large-v2-sme-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Whisper Large realizado por NbAiLab sobre el modelo base de OpenAI, segun indica la model card del repositorio. La conversion a ggml se hizo con el script `models/convert-h5-to-ggml.py` de whisper.cpp en 16 bits, y la variante para telefonos se cuantizo a q5_0 con `whisper-quantize`. El autor declara explicitamente que no hubo entrenamiento ni otros cambios sobre los pesos originales.

Un detalle operativo relevante: el modelo se entreno utilizando el token de idioma finlandes de Whisper, por lo que debe ejecutarse con `language=fi` aunque la salida sea en sami septentrional. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del corpus, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en sami septentrional.
- Generacion de subtitulos en dispositivo, sin conexion a servicios externos.
- Ejecucion mediante whisper.cpp en telefonos y ordenadores personales.
- Dos variantes de precision: 16 bits para maxima calidad y q5_0 para menor huella de memoria.
- No se documentan capacidades de traduccion, diarizacion, tool calling ni agentes; Whisper es un modelo ASR y no un modelo conversacional.
- Capacidad multilingue limitada al idioma declarado (`se`) con el token `fi`; no se indica soporte de otros idiomas.

## Casos de uso

- Subtitulado en directo en sami septentrional: la variante q5_0 (1,08 GB) permite generar subtitulos en el propio telefono dentro de la aplicacion Skaldrim, sin enviar audio a la nube.
- Transcripcion de archivos de audio en escritorio: con la variante de 16 bits (3,09 GB) y whisper.cpp se pueden procesar grabaciones de entrevistas o programas de radio en sami septentrional en local.
- Digitalizacion de archivos orales: bibliotecas y archivos sonoros pueden transcribir colecciones en sami septentrional manteniendo el audio en sus propias instalaciones.
- Investigacion linguistica: generacion de transcripciones para corpus de habla sami con control total sobre el pipeline y los datos.
- Accesibilidad: subtitulado de contenidos audiovisuales para hablantes de sami septentrional en dispositivos de gama media gracias a la cuantizacion q5_0.
- Prototipado de ASR de bajos recursos: punto de partida para evaluar la calidad del ajuste fino de NbAiLab antes de integrarlo en productos, usando whisper.cpp como runtime ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,1 GB para la variante q5_0 y unos 3,1 GB para la variante de 16 bits, segun el tamano de los ficheros publicados.
- GPU recomendadas: no se especifican; whisper.cpp puede ejecutarse en CPU y en GPU compatibles con sus backends.
- Cabe en GPU de consumo: la variante q5_0 esta pensada explicitamente para telefonos; la de 16 bits requiere mas memoria pero sigue siendo manejable en equipos de consumo.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); no se indica compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/whisper-large-sme-ggml | no disponible (base Whisper Large) | no disponible | sami septentrional (`se`, token `fi`) | Apache 2.0 | ggml |
| openai/whisper-large | no disponible en la informacion | no disponible | multilingue (Whisper Large) | no disponible en la informacion | safetensors/PyTorch |
| openai/whisper-large-v2 | no disponible en la informacion | no disponible | multilingue (Whisper Large v2) | no disponible en la informacion | safetensors/PyTorch |
| NbAiLab/whisper-large-sme | no disponible | no disponible | sami septentrional | Apache 2.0 (segun el repositorio derivado) | safetensors/PyTorch |

La diferencia principal frente a los Whisper Large de OpenAI es la especializacion en sami septentrional; frente al modelo base de NbAiLab, la unica diferencia es el formato ggml y la cuantizacion q5_0.

## Limitaciones y advertencias

- El modelo se entreno con el token de idioma finlandes: si se invoca con `se` u otro token, la calidad puede degradarse. Debe usarse `language=fi`.
- Es un modelo ASR: no realiza traduccion, razonamiento ni conversacion; no debe emplearse como modelo de lenguaje general.
- La cuantizacion q5_0 introduce perdida de precision respecto a los pesos en 16 bits; para maxima calidad debe preferirse la variante F16.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni evaluacion cuantitativa en sami septentrional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que cualquier error en la conversion es responsabilidad suya y no de NbAiLab.
- No se documentan limitaciones de longitud de audio mas alla de las propias de Whisper, cuyo valor no se indica en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skaldrim/whisper-large-sme-ggml
- Modelo base: https://huggingface.co/NbAiLab/whisper-large-sme
- Whisper Large (OpenAI): https://huggingface.co/openai/whisper-large
- Whisper Large v2 (OpenAI): https://huggingface.co/openai/whisper-large-v2
