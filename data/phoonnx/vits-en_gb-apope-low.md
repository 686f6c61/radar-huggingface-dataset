# Phoonnx/vits-en_gb-apope-low

## Resumen

`vits-en_gb-apope-low` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en inglés británico (en-GB) en audio, tomando como entrada fonemas IPA generados por el fonemizador gruut a través de la librería `scriptconv`. Se trata de una voz etiquetada como "low", lo que indica una variante de baja calidad o tamaño reducido dentro del catálogo de voces de Mimic 3.

El modelo resuelve el problema de la síntesis de voz local y ligera para asistentes y aplicaciones de domótica, integrándose en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que permite TTS sin dependencias de servicios en la nube, con un tamaño de repositorio de 0,1 GB y formato ONNX, lo que facilita su despliegue en dispositivos de recursos limitados.

La información pública disponible es escasa: no se detallan el número de parámetros, la longitud de contexto ni los datos de entrenamiento. La ficha se completa con los datos disponibles y se indica explícitamente "no disponible" en los campos que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el autor no detalla variantes) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo original fue entrenado por Mycroft AI para Mimic 3 y esta versión corresponde a la voz `en_UK/apope_low` del repositorio `mimic3-voices`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La innovación destacable es el empaquetado en ONNX para inferencia ligera con `phoonnx`, junto con el front-end de texto `scriptconv` que normaliza el texto y lo convierte a fonemas IPA mediante gruut antes de pasarlo al modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés británico (en-GB) a partir de texto.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (integrado en `scriptconv`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Ejecución local en formato ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: solo en-GB.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` como módulo TTS y permite respuestas habladas en inglés británico sin conexión a internet, adecuado para dispositivos domésticos.
- Domótica y altavoces inteligentes: al ser un modelo ONNX de 0,1 GB, puede desplegarse en hardware embebido (Raspberry Pi y similares) para anuncios y confirmaciones de voz.
- Lectura de notificaciones y alertas: integración en pipelines de automatización que convierten texto en audio WAV para su reproducción en altavoces o sistemas de megafonía.
- Accesibilidad: generación de voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos de habla inglesa británica.
- Pruebas y desarrollo de sistemas de diálogo: voz ligera para prototipar asistentes conversacionales y evaluar flujos de interacción sin coste de API.
- Generación de audio para contenidos educativos o demos: síntesis de frases en en-GB para materiales de aprendizaje de idiomas o pruebas de calidad de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB en disco, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no especificadas por el autor; al ser ONNX y de tamaño reducido, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: previsiblemente sí en cualquier GPU consumer moderna, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-apope-low (este) | VITS | en-GB | ONNX | CC-BY-SA-4.0 | 0,1 GB | Hugging Face (Phoonnx) |
| Otras voces Mimic 3 (p. ej. en_UK) | VITS | en-GB | ONNX | CC-BY-SA-4.0 | variable | Repositorio MycroftAI/mimic3-voices |
| Colección VITS de Phoonnx | VITS | varios | ONNX | según voz | variable | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas voces en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés británico (en-GB); no es multilingüe.
- La variante "low" sugiere menor calidad de audio que otras voces del catálogo, aunque el autor no publica métricas de calidad (MOS).
- No se documentan sesgos específicos, pero al ser un modelo TTS puede heredar sesgos prosódicos o de pronunciación de los datos de entrenamiento originales de Mycroft AI.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio, nombres propios o siglas, al depender de fonemas IPA generados por gruut.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir igual; las obras derivadas deben distribuirse bajo la misma licencia.
- La información pública es muy limitada: no hay datos de parámetros, entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Para producción en OVOS se requiere instalar `phoonnx` con el extra `scriptconv[gruut]`; sin esa dependencia el front-end de texto no funciona.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-apope-low
- Repositorio upstream (MycroftAI/mimic3-voices, voz apope_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_UK/apope_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
