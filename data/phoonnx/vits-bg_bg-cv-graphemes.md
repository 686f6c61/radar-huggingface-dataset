# Phoonnx/vits-bg_bg-cv-graphemes

## Resumen

`vits-bg_bg-cv-graphemes` es un modelo de sintesis de voz (text-to-speech) en bulgaro, empaquetado en formato ONNX por Phoonnx a partir del modelo original VITS publicado por Coqui en la version 0.8.0 de su libreria TTS. El modelo resuelve el problema de convertir texto en bulgaro (`bg-BG`) a audio inteligible, y su interes actual radica en que ofrece una via de despliegue ligera (via ONNX y la libreria phoonnx) para un idioma con poca representacion en el ecosistema TTS abierto.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y discriminadores adversariales para producir waveforms directamente desde texto. El modelo se entreno sobre el corpus Common Voice en bulgaro, segun la model card, y utiliza una entrada basada en grafemas (caracteres) en lugar de fonemas, normalizados por la libreria `scriptconv`.

El repositorio ocupa aproximadamente 0,1 GB y esta pensado para integrarse en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, asi como en pipelines Python mediante la API de `phoonnx`. No se dispone de datos publicos sobre numero de parametros, contexto ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui TTS v0.8.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se detallan variantes de cuantizacion) |
| Idiomas soportados | bulgaro (`bg`, `bg-BG`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para la libreria `phoonnx`) |

## Arquitectura y entrenamiento

El modelo es una instancia de VITS, una arquitectura end-to-end de sintesis de voz que integra en un unico sistema el encoder de texto, el modelado de duracion y prosodia mediante flujos normalizadores, un prior variacional condicionado y un decoder generativo que produce la waveform directamente, entrenado con perdidas adversariales junto a discriminadores. Esta aproximacion evita pipelines multi-etapa (texto a fonemas, fonemas a mel, mel a waveform) y permite inferencia en un solo paso de red.

Segun la model card, el modelo original procede de Coqui TTS v0.8.0, concretamente del paquete `tts_models--bg--cv--vits`, entrenado sobre el corpus Common Voice en bulgaro. La entrada de texto se basa en grafemas (caracteres), procesados por `GraphemePhonemizer` de la libreria `scriptconv`, que normaliza el texto antes de la sintesis. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovacion destacable es el empaquetado en ONNX para ejecucion ligera mediante `phoonnx`.

## Capacidades

- Sintesis de voz (text-to-speech) en bulgaro (`bg-BG`) a partir de texto escrito.
- Entrada basada en grafemas: acepta caracteres del texto y los normaliza mediante `scriptconv`.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion en el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Uso en Python mediante `TTSModelManager` y carga de la voz `coqui/bg-cv-vits`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.
- Capacidad multilingue: limitada al bulgaro.

## Casos de uso

- **Lectura de contenido en bulgaro**: conversion de articulos, noticias o documentos a audio para consumo pasivo, aprovechando la entrada por grafemas que simplifica el preprocesado del texto.
- **Asistentes de voz en OVOS**: integracion como motor TTS en asistentes basados en OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `coqui/bg-cv-vits` en `mycroft.conf` para respuestas habladas en bulgaro.
- **Accesibilidad**: generacion de audio para personas con discapacidad visual que consuman contenido escrito en bulgaro, con despliegue local en ONNX.
- **Sistemas de anuncios y avisos automatizados**: sintesis de mensajes dinamicos en aplicaciones de transporte, comercio o telefonia para el mercado bulgaro.
- **Prototipado de interfaces conversacionales**: generacion rapida de respuestas habladas en entornos de desarrollo con la libreria `phoonnx` y Python, sin depender de servicios en la nube.
- **Investigacion en TTS de bajos recursos**: uso como linea base para experimentos con VITS en bulgaro, dado su empaquetado ONNX reproducible y su licencia permisiva.
- **Generacion de audio para contenido educativo**: narracion de materiales de aprendizaje en bulgaro en entornos offline o con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio es de aproximadamente 0,1 GB, lo que sugiere un modelo compacto apto para CPU.
- GPU recomendadas: no disponible; por el formato ONNX y el tamano reducido, es probable que funcione en CPU y en GPUs consumer, pero no se confirma en la documentacion.
- Cabe en GPU consumer: no confirmado; el tamano del artefacto (0,1 GB) apunta a que si, pero no hay dato oficial.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX en general.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-bg_bg-cv-graphemes` | VITS | Bulgaro | no disponible | no aplica | BSD-3-Clause | ONNX |
| Coqui TTS `tts_models--bg--cv--vits` (upstream) | VITS | Bulgaro | no disponible | no aplica | BSD-3-Clause | Checkpoint PyTorch |
| Otros modelos VITS de la coleccion Phoonnx | VITS | Multiples | no disponible | no aplica | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo limitado exclusivamente al bulgaro; no soporta otros idiomas.
- Entrada basada en grafemas: puede presentar errores de pronunciacion en palabras extranas, siglas o numeros no normalizados correctamente por `scriptconv`.
- Riesgo de artefactos de sintesis y prosodia incorrecta en frases largas o con puntuacion atipica, comun en modelos VITS entrenados con Common Voice.
- Posibles sesgos derivados del corpus Common Voice (variedad de hablantes, acentos y calidad de grabacion limitadas).
- No es un modelo de lenguaje: no razona, no sigue instrucciones ni soporta tool calling.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene revisar las condiciones del corpus Common Voice subyacente y la atribucion requerida por la licencia.
- No se dispone de informacion sobre cuantizacion ni sobre rendimiento en produccion; validar latencia y calidad antes de desplegar.
- El modelo esta empaquetado para `phoonnx` (version pre-release, `pip install --pre phoonnx`), lo que implica dependencia de una libreria en desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-bg_bg-cv-graphemes
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--bg--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
