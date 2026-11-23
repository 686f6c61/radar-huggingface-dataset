# eigami/whisper-vad

## Resumen

`eigami/whisper-vad` no es un modelo de lenguaje, sino una copia del detector de actividad de voz (VAD) de Silero convertida al formato GGML para su uso con whisper.cpp. El repositorio lo publica el usuario eigami con el objetivo declarado de que su editor de video (Eigami) no dependa de otra cuenta de Hugging Face para descargar el fichero, y verifica la integridad de cada archivo mediante SHA-256 antes de emplearlo. La fuente original es `ggml-org/whisper-vad` y el contenido se distribuye sin modificaciones respecto al original.

El artefacto contiene un unico fichero, `ggml-silero-v6.2.0.bin`, que corresponde a la version 6.2.0 del detector Silero VAD en formato binario GGML. Se trata por tanto de un componente auxiliar de preprocesado de audio, no de un modelo generativo: su funcion es segmentar senal de audio en tramos con voz y tramos sin voz para que un motor de reconocimiento automatico del habla (como whisper.cpp) procese unicamente las regiones relevantes.

Su relevancia es practica y acotada: permite reutilizar el pipeline de whisper.cpp con deteccion de voz integrada sin descargar el binario desde el repositorio de ggml-org, lo que simplifica la reproducibilidad en entornos con dependencias fijadas. No aporta innovacion tecnica propia ni diferencias funcionales respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Silero VAD v6.2.0 (detector de actividad de voz, red neuronal recurrente; arquitectura exacta no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa ventanas de audio, no texto) |
| Tipos de cuantizacion | no disponible (el fichero distribuido es un binario GGML, `ggml-silero-v6.2.0.bin`) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | binario GGML para whisper.cpp |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |
| Ficheros incluidos | `ggml-silero-v6.2.0.bin` |
| Verificacion de integridad | SHA-256 comprobado por la aplicacion consumidora (Eigami) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento, porque no entrena ni modifica nada: es una conversion de formato del detector Silero VAD version 6.2.0 al formato binario GGML que consume whisper.cpp. La model card indica explicitamente que la copia se mantiene "unchanged" respecto al original de `ggml-org/whisper-vad`, de modo que cualquier detalle de arquitectura, datos de entrenamiento o calibracion debe consultarse en la fuente original de Silero y en el repositorio de ggml-org.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de ajuste (RLHF, DPO) ni innovaciones tecnicas asociadas a esta publicacion concreta. La unica caracteristica operativa destacable es la conversion a GGML para inferencia integrada en whisper.cpp y la comprobacion de hash SHA-256 por parte de la aplicacion que lo consume.

## Capacidades

- Deteccion de actividad de voz: clasifica fragmentos de audio como voz o no voz para segmentar la entrada antes de la transcripcion.
- Integracion con whisper.cpp: pensado para alimentar el pipeline de reconocimiento del habla con solo las regiones con voz, reduciendo audio procesado.
- Independencia del idioma: al operar sobre caracteristicas acusticas, no depende de un idioma concreto (aunque no se documenta el conjunto de idiomas evaluados).
- Uso como dependencia de aplicacion: el editor de video Eigami lo emplea como recurso descargable con verificacion de integridad.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), audio generativo ni capacidades multimodales mas alla del procesado de senal de audio.

## Casos de uso

- Preprocesado de transcripcion con whisper.cpp: se ejecuta el VAD sobre el audio de entrada para eliminar silencios y ruido de fondo antes de pasar los segmentos con voz al modelo Whisper, reduciendo el coste computacional de la transcripcion.
- Subtitulado automatico en editores de video: el editor Eigami lo usa para detectar donde hay habla y alinear la generacion de subtitulos solo en esos tramos, evitando marcas de tiempo en silencios.
- Filtrado de grabaciones largas: en reuniones o podcasts de varias horas, el VAD permite localizar rapidamente los intervalos con intervenciones y descartar pausas antes de un postprocesado.
- Pipelines de ASR en produccion con dependencias fijadas: al ser una copia con hash verificable, encaja en entornos que requieren reproducibilidad estricta y no quieren depender de la disponibilidad del repositorio de ggml-org.
- Deteccion de presencia de voz en sistemas de grabacion: util para activar la captura o el envio de audio solo cuando hay habla, ahorrando ancho de banda y almacenamiento.
- Segmentacion previa en herramientas de diarizacion o analisis acustico: proporciona fronteras de voz que otros componentes pueden usar como entrada para separar hablantes o medir tiempos de intervencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el fichero es un binario GGML de un VAD, cuyo consumo es muy inferior al de un modelo generativo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el VAD de Silero suele ejecutarse en CPU, pero la informacion proporcionada no confirma requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible con datos verificables.
- Opciones de despliegue: whisper.cpp (formato nativo GGML). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| eigami/whisper-vad | VAD (Silero v6.2.0) para whisper.cpp | no disponible | no aplica | MIT | GGML | Hugging Face (copia) |
| ggml-org/whisper-vad | VAD (Silero) para whisper.cpp, original | no disponible | no aplica | MIT (segun original) | GGML | Hugging Face |
| Silero VAD (original) | VAD | no disponible | no aplica | MIT | PyTorch / ONNX (segun distribucion original) | Repositorio de Silero |

La diferencia practica entre `eigami/whisper-vad` y `ggml-org/whisper-vad` es unicamente la ubicacion del repositorio y la verificacion SHA-256 que realiza la aplicacion consumidora; el contenido es identico segun la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni ejecuta herramientas; cualquier expectativa en ese sentido es un error de uso.
- Dependencia de un tercero: el contenido procede de `ggml-org/whisper-vad` y de Silero; la copia no incorpora mejoras ni correcciones propias.
- Sin documentacion de rendimiento: no hay metricas de precision, recall ni tasas de falsos positivos/negativos del VAD en este repositorio.
- Sin informacion sobre idiomas ni dominios evaluados: el comportamiento en audio con ruido, musica o habla no nativa no esta documentado aqui.
- Licencia MIT: permite uso comercial y modificacion, pero todos los derechos sobre los modelos subyacentes permanecen con sus autores, segun indica la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- El tamano del repositorio figura como 0.0 GB en los metadatos, lo que puede indicar un redondeo o una limitacion de la informacion disponible; conviene verificar el contenido real antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eigami/whisper-vad
- Fuente original citada: https://huggingface.co/ggml-org/whisper-vad
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Silero VAD: https://github.com/snakers4/silero-vad
