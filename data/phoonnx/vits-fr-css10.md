# Phoonnx/vits-fr-css10

## Resumen

vits-fr-css10 es un modelo de síntesis de voz (text-to-speech) en francés basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo procede del paquete oficial `tts_models--fr--css10--vits` publicado en la release v0.8.0 de Coqui TTS y se distribuye en formato ONNX para su uso en Python y en el ecosistema OVOS.

El modelo resuelve la conversión de texto a audio en francés a partir de una entrada de caracteres (grafemas), sin necesidad de un fonemizador complejo: Phoonnx delega la normalización en `scriptconv`, que aplica `GraphemePhonemizer` para transformar el texto en la secuencia de entrada del modelo. Su tamaño de repositorio es de 0,1 GB, lo que lo hace ligero y apto para despliegues en entornos con recursos limitados.

Es relevante para desarrolladores que necesitan un TTS francés ligero, con licencia permisiva BSD-3-Clause y una ruta de integración directa en asistentes de voz (OVOS) o en pipelines Python mediante la API de `phoonnx`. No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento más allá del corpus CSS10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (`fr`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) |
| Librería de inferencia | phoonnx (Python y OVOS) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta con una pérdida de reconstrucción y una pérdida adversarial. El modelo original fue entrenado por Coqui sobre el corpus CSS10 para francés, un conjunto de audiolibros de dominio público ampliamente utilizado en TTS.

Phoonnx no reentrena el modelo: lo convierte a ONNX y lo empaqueta para su inferencia con su propia librería. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable en este empaquetado es la integración con `scriptconv` para la normalización de texto y la fonemización basada en grafemas, que simplifica el front-end respecto a pipelines con fonemizadores dependientes de diccionarios.

## Capacidades

- Síntesis de voz en francés a partir de texto plano.
- Generación de audio WAV mediante `voice.synthesize_wav(text, wav_file)` en Python.
- Front-end de texto basado en grafemas mediante `GraphemePhonemizer` de `scriptconv`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Ejecución en ONNX, lo que permite despliegue en CPU sin dependencias de CUDA.
- No se documentan capacidades de clonación de voz, control de emoción, multi-hablante, tool calling ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz en francés con OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `coqui/fr-css10-vits` en `mycroft.conf`, permitiendo respuestas habladas en un asistente doméstico sin infraestructura GPU.
- Lectura de textos largos en francés: útil para convertir artículos, documentación o audiolibros en audio WAV mediante un script Python que recorra párrafos y llame a `synthesize_wav`.
- Accesibilidad: generación de audio para personas con discapacidad visual o dificultades de lectura, al ser un modelo ligero (0,1 GB) que puede ejecutarse localmente en un portátil.
- Prototipado de interfaces conversacionales: al integrarse con `phoonnx` en Python, permite validar flujos de voz en francés antes de invertir en modelos comerciales o de mayor tamaño.
- Sistemas de anuncios o notificaciones por voz: el tamaño reducido y la inferencia ONNX permiten generar avisos cortos en tiempo casi real en dispositivos de bajos recursos.
- Investigación en TTS: sirve como línea base reproducible con licencia BSD-3-Clause para comparar con modelos VITS posteriores o con sistemas neuronales más recientes en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que quepa en memoria de CPU sin GPU dedicada, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU en la model card.
- Cabe en GPU de consumo: no confirmado, pero el tamaño del repositorio (0,1 GB) sugiere que sí en la mayoría de tarjetas consumer; no obstante, no hay dato oficial.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-fr-css10 | VITS | fr | no disponible | BSD-3-Clause | ONNX | Hugging Face |
| Coqui TTS `tts_models--fr--css10--vits` | VITS | fr | no disponible | BSD-3-Clause | PyTorch (upstream) | GitHub Releases de Coqui |
| Otros VITS empaquetados por Phoonnx | VITS | varios | no disponible | según modelo | ONNX | Colección Phoonnx en Hugging Face |

La comparativa con alternativas de otros autores no está disponible en la información proporcionada. El modelo upstream de Coqui es funcionalmente equivalente, pero requiere el stack de Coqui TTS en lugar de ONNX.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma (solo francés); no soporta otros idiomas ni cambio de voz.
- Entrada basada en grafemas: la calidad de pronunciación depende de la normalización de `scriptconv` y puede degradarse con abreviaturas, números o texto no normalizado.
- No se documentan métricas de calidad (MOS, WER) ni evaluaciones subjetivas, por lo que el rendimiento real no está cuantificado.
- Riesgo de alucinación acústica o artefactos en frases largas o con puntuación atípica, inherente a los modelos VITS entrenados con corpus limitados como CSS10.
- Sesgos: el corpus CSS10 está compuesto por audiolibros de dominio público, lo que puede introducir un sesgo de estilo (lectura literaria) y de registro formal.
- Licencia BSD-3-Clause permisiva para uso comercial, pero conviene verificar la procedencia y condiciones del corpus CSS10 subyacente.
- El modelo se distribuye para la librería `phoonnx` (instalación con `pip install --pre phoonnx`), lo que implica una dependencia de esa librería y de `scriptconv`.
- Repositorio con muy pocas descargas (26) y cero likes en el momento de la consulta: ecosistema pequeño y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fr-css10
- Modelo upstream (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--fr--css10--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
