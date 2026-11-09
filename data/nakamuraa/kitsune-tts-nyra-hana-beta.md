# Nakamuraa/kitsune-tts-nyra-hana-beta

## Resumen

Kitsune-TTS Nyra & Hana (beta) es un modelo de síntesis de voz (text-to-speech) en portugués brasileño desarrollado por Nakamuraa como un fine-tune del modelo base Kitsune-TTS V1 de Heitorkk2, Everteson y Nakamura. Añade dos voces femeninas diferenciadas, Nyra (identificador `0`, tono calmado y expresivo) y Hana (identificador `1`, tono más ligero y animado), y se distribuye empaquetado en ONNX para ejecutarse localmente sobre CPU sin necesidad de GPU.

El modelo se apoya en la arquitectura VITS2, según las etiquetas de la model card, y se sirve mediante un pequeño servidor HTTP en Python que expone endpoints para generar WAV completo (`/tts`) y MP3 en streaming real (`/tts/stream`), con una granularidad de fragmentación por frase de aproximadamente 140 caracteres. Los pesos ONNX ocupan unos 115 MB, el repositorio completo 0,1 GB y el audio se genera a 22.050 Hz en mono.

Su relevancia práctica reside en que ofrece TTS neuronal en portugués brasileño ejecutable en CPU con latencia de arranque baja (1-2 segundos en modo streaming) y una licencia GPL-3.0 que permite uso comercial. Es una versión beta explícitamente marcada como no final, con calidad y prosodia sujetas a cambios, y con el dataset de entrenamiento no publicado por motivos de privacidad de las voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2 (según etiquetas de la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; fragmentación objetivo de ~140 caracteres) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX, ~115 MB) |
| Idiomas soportados | Portugués brasileño (pt-BR) únicamente |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`models/kitsune_62500.onnx`) |

Otros datos técnicos: frecuencia de muestreo de 22.050 Hz, canal mono, tamaño del repositorio 0,1 GB, runtime `onnxruntime`, modelo base `Heitorkk2/Kitsune-TTS-V1`, pipeline `text-to-speech`, voces Nyra (`0`) y Hana (`1`).

## Arquitectura y entrenamiento

El modelo es un fine-tune del Kitsune-TTS V1, que a su vez se etiqueta como VITS2, una familia de arquitecturas de síntesis de voz neuronal de extremo a extremo que combina un codificador de texto, un predictor de duración y un decoder generativo (habitualmente basado en flujo y GAN) para producir audio directamente a partir de fonemas o texto. La model card no detalla la composición interna de capas ni el número de parámetros del modelo, por lo que esos datos no están disponibles.

En cuanto al entrenamiento, la información proporcionada no especifica el volumen de datos, la composición del dataset ni si se aplicaron técnicas de alineamiento o ajuste fino con preferencias. El autor indica explícitamente que el dataset de entrenamiento no se publica por privacidad de las voces. La innovación técnica destacable no está en la arquitectura sino en el empaquetado y el servidor: pesos exportados a ONNX para inferencia en CPU, y un endpoint de streaming que divide el texto en frases, sintetiza secuencialmente y envía el MP3 conforme cada fragmento sale del encoder de ffmpeg (`-flush_packets 1`), manteniendo una única respuesta HTTP chunked.

## Capacidades

- Síntesis de voz (text-to-speech) en portugués brasileño con dos voces femeninas seleccionables por identificador: Nyra (`0`) y Hana (`1`).
- Control de velocidad de habla mediante el parámetro `speed` en el endpoint `/tts`.
- Generación de audio WAV completo vía `POST /tts` y vía atajo `GET /tts?text=...&voice=...`.
- Streaming de MP3 en una única respuesta HTTP chunked mediante `POST /tts/stream`, con arranque de audio en aproximadamente 1-2 segundos.
- Ejecución local en CPU con `onnxruntime`, sin requerir GPU.
- Integración con el plugin de voz de OpenCode configurando el motor `Kitsune` y la URL local.
- Endpoint de salud `GET /health` que devuelve estado, voces disponibles y frecuencia de muestreo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modos de pensamiento; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Lectura por voz de artículos y documentación en portugués brasileño: el servidor local permite enviar texto y recibir WAV o MP3, adecuado para generar audiolibros o versiones habladas de contenido escrito sin depender de servicios en la nube.
- Asistentes de voz para aplicaciones de escritorio: la integración con el plugin de voz de OpenCode y el endpoint de streaming permiten reproducir respuestas del asistente mientras se generan, reduciendo la latencia percibida a 1-2 segundos.
- Pruebas de accesibilidad en interfaces: generar avisos y mensajes de la interfaz en audio para validar flujos de accesibilidad en aplicaciones dirigidas a usuarios brasileños.
- Prototipado de personajes o narradores con dos timbres distintos: las voces Nyra y Hana permiten alternar registros (calmado frente a animado) en demos de videojuegos, chatbots o contenido interactivo.
- Generación de audio para contenido educativo: sintetizar lecciones o materiales de e-learning en pt-BR ejecutando el modelo en CPU en equipos sin GPU dedicada.
- Integración en pipelines de automatización de contenido: el servidor HTTP en el puerto 8091 y los endpoints REST permiten encadenar la síntesis con herramientas de publicación o postproducción mediante llamadas `curl` o scripts.
- Evaluación de TTS neuronal en entornos con recursos limitados: al ocupar unos 115 MB de pesos y requerir aproximadamente 500 MB de disco, sirve para comparar calidad de voces en máquinas modestas antes de adoptar soluciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU mediante `onnxruntime`.
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en cualquier equipo de consumo: los pesos ONNX ocupan unos 115 MB y el autor indica aproximadamente 500 MB de disco necesarios para la instalación completa.
- Software requerido: Python 3.10 o superior, eSpeak NG (instalador `.msi` en Windows) y ffmpeg en el PATH (necesario solo para `/tts/stream`).
- Opciones de despliegue: servidor HTTP propio incluido en el repositorio (`kitsune_tts_server.py`, puerto 8091), con instalación automatizada mediante `setup.ps1` y arranque con `start_server.bat` en Windows; también es posible la instalación manual clonando el repositorio base de Kitsune-TTS y creando un entorno virtual.
- Latencia y throughput estimados: el autor indica que en modo streaming el audio comienza en aproximadamente 1-2 segundos; no se proporcionan cifras de throughput ni de latencia para el endpoint WAV completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Kitsune-TTS Nyra & Hana (beta) | no disponible (ONNX ~115 MB) | no disponible (fragmentacion ~140 caracteres) | pt-BR | GPL-3.0 | CPU via onnxruntime |
| Kitsune-TTS V1 (modelo base) | no disponible | no disponible | no disponible | GPL-3.0 | no disponible |
| Alternativas TTS open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Versión beta explícita: la calidad, la prosodia y el comportamiento de las voces pueden cambiar sin aviso; no es una versión final.
- Solo admite portugués brasileño (pt-BR); no hay soporte multilingüe.
- La calidad puede variar según el texto; los números y nombres propios pueden pronunciarse de forma extraña.
- No hay streaming dentro de una frase: la granularidad de fragmentación es por frase, con un objetivo de aproximadamente 140 caracteres.
- El dataset de entrenamiento no se publica por privacidad de las voces, lo que impide auditar la composición de los datos y los posibles sesgos.
- El autor prohíbe explícitamente el uso para suplantar la identidad de personas reales o para fraude.
- Licencia GPL-3.0: permite uso comercial, pero si se distribuye una versión modificada debe mantenerse la misma licencia y publicarse el código fuente correspondiente.
- Requiere dependencias externas (eSpeak NG y ffmpeg) y el script de instalación está orientado a Windows; la instalación manual es posible pero no está documentada para otros sistemas.
- Riesgo de alucinación no aplicable en el sentido de generación de texto; el riesgo equivalente es la pronunciación incorrecta o la prosodia inadecuada en textos complejos.
- No se han publicado resultados de benchmarks que permitan validar la calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nakamuraa/kitsune-tts-nyra-hana-beta
- Repositorio del código base Kitsune-TTS: https://github.com/Heitorkk2/Kitsune-TTS
- Modelo base Kitsune-TTS V1: https://huggingface.co/Heitorkk2/Kitsune-TTS-V1
- eSpeak NG (releases): https://github.com/espeak-ng/espeak-ng/releases
- ffmpeg: https://ffmpeg.org/
