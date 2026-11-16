# Phoonnx/vits-en_us-ljspeech-low-gruut

## Resumen

vits-en_us-ljspeech-low-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite Mimic 3 y empaquetado por Phoonnx en formato ONNX para su libreria de inferencia `phoonnx`. El modelo convierte texto en ingles estadounidense en audio, tomando como entrada fonemas del fonemizador gruut en alfabeto IPA. Se trata de una variante "low" del voice de LJSpeech, pensada para un consumo de recursos reducido.

El modelo resuelve el problema de la sintesis de voz local y ligera en entornos con recursos limitados, como asistentes de voz embebidos (OVOS/Mycroft), dispositivos de borde o aplicaciones Python que necesitan generar audio sin depender de servicios en la nube. Su empaquetado como ONNX facilita el despliegue en CPU y su integracion en pipelines de inferencia ligeros.

Es relevante en el ecosistema open source de TTS por su licencia permisiva (CC-BY-SA-4.0), su integracion directa con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, y por formar parte de una coleccion mas amplia de voces VITS empaquetadas para `phoonnx`. No obstante, se trata de un modelo de un solo idioma y de calidad "low", no orientado a produccion de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del voice original) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0.1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial en un unico modelo entrenado de forma conjunta. Esta variante corresponde al voice `ljspeech_low` de Mycroft AI, es decir, una version reducida del modelo entrenado sobre el corpus LJSpeech (audiolibros en ingles estadounidense de una unica hablante). No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no los detalla.

La innovacion tecnica principal de este empaquetado es la conversion a ONNX para su uso con `phoonnx`, lo que permite inferencia portable en Python y en el asistente OVOS. El front-end de texto se delega a `scriptconv`, que normaliza el texto y lo convierte en fonemas gruut (IPA) antes de alimentar el modelo. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion texto-a-fonemas mediante gruut en alfabeto IPA, integrada en el pipeline de `phoonnx`.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Integracion con el asistente OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en CPU gracias al formato ONNX y al tamano reducido del repositorio (0.1 GB).
- Variante "low" orientada a bajo consumo de recursos, adecuada para dispositivos embebidos.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento (es exclusivamente TTS).
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz embebidos en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en ingles con bajo consumo de CPU, ideal para dispositivos de borde.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: se puede invocar `synthesize_wav` para generar ficheros WAV a partir de mensajes cortos, con latencia reducida gracias al tamano "low" del modelo.
- Prototipado rapido de interfaces de voz: desarrolladores que necesitan un TTS funcional en Python sin depender de APIs en la nube pueden instalar `phoonnx` y `scriptconv[gruut]` y empezar a generar audio en minutos.
- Accesibilidad en aplicaciones web o de escritorio: conversion de texto a voz para lectores de pantalla o asistencia a personas con discapacidad visual, en entornos donde el ingles es el idioma de la interfaz.
- Generacion de audio para pruebas automatizadas: el modelo permite crear ficheros WAV sinteticos en pipelines de test de sistemas de reconocimiento de voz o de dialogos, sin coste de API.
- Sistemas de informacion publica en kioscos o terminales: anuncios hablados de bajo coste en ingles estadounidense, ejecutados localmente en hardware modesto.
- Educacion y demos de TTS: ejemplo didactico de pipeline VITS + fonemizador gruut + ONNX para cursos de procesamiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0.1 GB, se espera un consumo de memoria muy bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia en CPU y no se especifican GPU objetivo.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido, pero no se confirma en la informacion disponible.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-en_us-ljspeech-low-gruut | VITS | en-US | CC-BY-SA-4.0 | ONNX | 0.1 GB |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | variable | ONNX | no disponible |
| Piper (voces VITS) | VITS | multilingue | variable | ONNX | variable |
| Coqui TTS (VITS) | VITS | multilingue | MPL-2.0 | PyTorch | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas del ecosistema TTS open source.

## Limitaciones y advertencias

- Modelo de un solo idioma (en-US); no soporta otros idiomas ni cambio de voz.
- Variante "low" del voice original, por lo que la calidad de audio es inferior a la de modelos VITS de mayor tamano.
- Entrenado sobre LJSpeech (una unica hablante), lo que limita la diversidad de voces y puede introducir sesgos de prosodia y estilo de esa hablante.
- Riesgo de alucinacion acustica: como todo TTS, puede generar pronunciaciones incorrectas en palabras fuera de dominio, siglas o neologismos.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es necesario revisar las implicaciones para uso comercial y para la distribucion de audio generado.
- Dependencia del fonemizador gruut y de la libreria `scriptconv`; cambios en estas dependencias pueden afectar al pipeline.
- Sin informacion publicada sobre benchmarks, latencia o consumo de memoria; se recomienda validar en el hardware objetivo antes de produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljspeech-low-gruut
- Repositorio upstream (MycroftAI/mimic3-voices, voice ljspeech_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/ljspeech_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
