# ggml-org/ZONOS3-Mini-GGUF

## Resumen

ZONOS3-Mini es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Zyphra y distribuido en formato GGUF por ggml-org, el equipo detrás de llama.cpp. Con aproximadamente 802 millones de parámetros, se posiciona como un modelo TTS ligero pensado para inferencia local en hardware de consumo, y su conversión a GGUF permite ejecutarlo directamente desde terminal o mediante un servidor compatible con llama.cpp.

La relevancia de esta ficha radica en que la versión GGUF habilita el despliegue de TTS neurálgico sin depender de infraestructura GPU de datacenter: el modelo se puede lanzar con el binario `llama-tts` o servir mediante el endpoint `/tts` de `llama serve`. Además, admite selección entre voces predefinidas y clonación de voz a partir de un fichero de referencia en wav o mp3.

La información pública disponible es escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge únicamente los datos verificables de la model card y los metadatos del repositorio, e indica explícitamente "no disponible" en todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 802.038.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con pesos cuantizados) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Los metadatos indican que es un modelo de la familia ZONOS3 de Zyphra con 802 millones de parámetros, orientado a text-to-speech, pero no se especifica si emplea un transformer, un modelo híbrido, un codec neuronal de audio o una combinación de codificador de texto y decodificador acústico. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica documentada en esta distribución es la conversión a GGUF mediante la herramienta `ggml-org/convert`, que permite ejecutar el modelo con el stack de llama.cpp. La model card menciona dos modos de uso de voz: selección de voces predefinidas mediante `--tts-voice` y clonación de voz mediante `--tts-speaker-file`, que acepta ficheros wav o mp3 como referencia. No se detalla el mecanismo interno de clonación ni el tamaño del vocabulario de voces predefinidas.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con salida en fichero de audio.
- Selección entre voces predefinidas mediante el parámetro `--tts-voice`.
- Clonación de voz a partir de un fichero de referencia en wav o mp3 mediante `--tts-speaker-file`.
- Ejecución local desde terminal con el binario `llama-tts`.
- Despliegue como servidor con `llama serve` y exposición de un endpoint `/tts`.
- Compatibilidad con el ecosistema llama.cpp y con el formato GGUF cuantizado.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Generación de audiolibros y narración por lotes: el modelo puede convertir grandes volúmenes de texto en audio ejecutándose localmente, sin coste por petición ni dependencia de APIs externas, usando `llama-tts` en un pipeline de ficheros.
- Asistentes de voz en aplicaciones de escritorio: integración mediante `llama serve` y el endpoint `/tts` para que una aplicación local solicite síntesis bajo demanda con una voz predefinida coherente.
- Prototipado de interfaces conversacionales: al ser un modelo de 802 millones de parámetros en GGUF, permite iterar rápidamente en el diseño de flujos de voz sin aprovisionar GPUs de gama alta.
- Clonación de voz para doblaje y locución: el uso de `--tts-speaker-file` con un wav o mp3 de referencia permite generar locuciones con una voz concreta, útil en pruebas de doblaje o contenido personalizado.
- Sistemas de accesibilidad: lectura en voz alta de contenido textual en aplicaciones para personas con discapacidad visual, ejecutándose en el propio dispositivo y preservando la privacidad del texto procesado.
- Generación de avisos y notificaciones habladas: en sistemas embebidos o servidores locales, el endpoint `/tts` puede producir mensajes de audio para alertas, monitorización o domótica sin salir a la nube.
- Investigación en TTS: al estar cuantizado en GGUF y ser ejecutable con llama.cpp, sirve como base reproducible para experimentos de calidad de síntesis, latencia y clonación de voz en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 802 millones de parámetros, una cuantización de 8 bits requeriría del orden de 0,8-1 GB solo para pesos, y una de 4 bits alrededor de 0,4-0,5 GB, a lo que habría que sumar el overhead del runtime y del decodificador de audio; estas cifras son estimaciones por tamaño, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se ha verificado en la documentación.
- Opciones de despliegue: `llama-tts` (CLI) y `llama serve` con endpoint `/tts`, ambos del ecosistema llama.cpp. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento. A nivel de formato y despliegue, la alternativa directa es el modelo original `Zyphra/ZONOS3-Mini` en sus pesos nativos (no GGUF), que requiere el stack de inferencia de Zyphra en lugar de llama.cpp. Cualquier comparación con otros modelos TTS de tamaño similar (por ejemplo, familias como Kokoro o Piper) carecería de base verificable con los datos disponibles y no se incluye.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini-GGUF (este) | 802 M | no disponible | Apache 2.0 | GGUF | Hugging Face (ggml-org) |
| Zyphra/ZONOS3-Mini | 802 M | no disponible | Apache 2.0 | pesos originales | Hugging Face (Zyphra) |
| Otros TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un sistema TTS, puede reproducir sesgos prosódicos o de acento presentes en los datos de entrenamiento, pero no hay información publicada al respecto.
- Riesgo de alucinación en el sentido de artefactos de audio, pronunciaciones incorrectas o prosodia anómala en textos fuera de distribución; no se han publicado evaluaciones de calidad.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas con los que fue entrenado.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del usuario cumplir la normativa aplicable sobre síntesis de voz y consentimiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y no se ofrece garantía alguna.
- El repositorio es una conversión automática mediante `ggml-org/convert`; pueden existir diferencias de calidad o comportamiento frente a los pesos originales de Zyphra.
- No hay información sobre latencia, throughput ni requisitos mínimos verificados, lo que dificulta dimensionar un despliegue en producción.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/ZONOS3-Mini-GGUF
- Modelo base original: https://huggingface.co/Zyphra/ZONOS3-Mini
- Documentación TTS de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#zonos3
- Herramienta de conversión: https://github.com/ggml-org/convert
