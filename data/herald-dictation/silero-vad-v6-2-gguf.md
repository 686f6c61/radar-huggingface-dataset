# herald-dictation/silero-vad-v6.2-gguf

## Resumen

Silero VAD v6.2 (GGUF) es la version empaquetada en formato GGUF del detector de actividad vocal (VAD) de Silero Team, convertida por handy-computer para su uso con transcribe.cpp. Este repositorio, publicado por herald-dictation, es una copia byte a byte del fichero original `silero-vad-v6.2-F32.gguf` (1.241.056 bytes, SHA-256 `0d871a800c420fdd5d1b17a3aea4296d1c39608f0ff4a9295eb76457eb1c88e6`), sin modificacion de pesos, con el objetivo de que la aplicacion Herald (dictado offline privado) no dependa del hosting de otro proyecto.

No se trata de un modelo generativo ni de un LLM: es un clasificador binario de voz/no voz que segmenta audio en tiempo real. Con 309.633 parametros, su funcion es detectar cuando hay habla en una senal de audio, lo que resulta relevante como componente previo en pipelines de transcripcion (ASR) para recortar silencios, reducir coste computacional y mejorar la latencia.

Su interes practico reside en la combinacion de tamano minimo, licencia MIT y disponibilidad en GGUF para transcribe.cpp, lo que permite integrarlo en aplicaciones de dictado y transcripcion que se ejecutan localmente sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente para deteccion de actividad vocal (VAD); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 309.633 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio por tramas, no de texto) |
| Tipos de cuantizacion | F32 (fichero publicado); otras cuantizaciones en el repositorio original handy-computer/silero-vad-v6.2-gguf |
| Idiomas soportados | no disponible (deteccion de voz independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | GGUF (`silero-vad-v6.2-F32.gguf`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo original de Silero Team. Se trata de un detector de actividad vocal (VAD) de tipo red neuronal recurrente, segun la practica habitual de la familia Silero VAD, pero este dato no se confirma en la model card. El modelo opera sobre tramas de audio y produce una probabilidad de presencia de voz por ventana temporal.

El repositorio no incluye informacion sobre el dataset de entrenamiento, numero de horas de audio, composicion ni si hubo ajuste fino con RLHF o DPO. El fichero GGUF es una conversion del modelo original de Silero Team realizada por handy-computer para transcribe.cpp; los pesos no fueron modificados por herald-dictation. La unica innovacion tecnica documentada es el empaquetado en GGUF con precision F32 y la verificacion por SHA-256 para garantizar la integridad del binario.

## Capacidades

- Deteccion de actividad vocal (voice activity detection) sobre senales de audio.
- Clasificacion binaria voz/no voz por tramas temporales.
- Integracion con transcribe.cpp para pipelines de transcripcion offline.
- Uso como componente de preprocesado en sistemas de dictado privado (Herald).
- Independencia del idioma en la deteccion de voz (segun la naturaleza de la tarea; no confirmado explicitamente en la model card).
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni funciones de agente.
- No dispone de modo thinking, capacidades multilingues de texto ni procesamiento de audio mas alla de la deteccion de voz.

## Casos de uso

- Dictado offline privado: Herald utiliza este modelo para detectar cuando el usuario habla y activar la transcripcion, evitando procesar silencios y manteniendo todo el procesamiento en local sin conexion.
- Segmentacion previa a ASR: recortar las regiones con voz de una grabacion larga antes de pasarlas a un modelo de transcripcion, reduciendo el audio a procesar y el coste computacional.
- Reduccion de latencia en asistentes de voz: detectar el inicio y fin del habla para activar el reconocimiento de forma inmediata y cortar la grabacion cuando el usuario termina.
- Filtrado de silencios en reuniones y podcasts: eliminar tramos sin voz de grabaciones extensas antes de la transcripcion o del archivado.
- Sistemas de push-to-talk y manos libres: activar la captura de audio solo cuando hay voz, ahorrando bateria y almacenamiento en dispositivos portatiles.
- Telefonia y VoIP: detectar presencia de voz en flujos de audio en tiempo real para suprimir ruido de fondo o gestionar turnos de palabra.
- Preprocesado en pipelines de subtitulado: alinear segmentos de audio con voz para generar subtitulos con marcas temporales mas precisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en F32 (1.241.056 bytes de pesos), por lo que cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU moderna; el modelo es tan pequeno que la GPU no es un requisito. A100, H100, RTX 4090 o GPUs integradas son igualmente validas.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: transcribe.cpp (libreria nativa del modelo); no se documentan otros runtimes en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Silero VAD v6.2 (GGUF, este repo) | 309.633 | no disponible (audio) | MIT | GGUF (F32) | Hugging Face, transcribe.cpp |
| Silero VAD v6.2 (original) | 309.633 | no disponible (audio) | MIT | PyTorch/ONNX (segun repo original) | GitHub de Silero Team, Hugging Face |
| Otras alternativas VAD | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de VAD en la informacion proporcionada para una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion de voz: no genera texto, no razona, no procesa lenguaje y no debe evaluarse como un LLM.
- Riesgo de falsos positivos y falsos negativos en entornos con ruido, musica o voces superpuestas; no se documentan metricas de error en la model card.
- No hay informacion sobre sesgos de idioma, acento, genero o edad en la deteccion de voz.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright y la atribucion a Silero Team y a los autores de la conversion.
- El repositorio es una copia byte a byte del original; cualquier actualizacion o cuantizacion adicional debe consultarse en handy-computer/silero-vad-v6.2-gguf.
- Dependencia del ecosistema transcribe.cpp: no se documentan otros formatos de despliegue en este repositorio.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/herald-dictation/silero-vad-v6.2-gguf
- Repositorio original de la conversion: https://huggingface.co/handy-computer/silero-vad-v6.2-gguf
- Modelo original de Silero Team: https://github.com/snakers4/silero-vad
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
