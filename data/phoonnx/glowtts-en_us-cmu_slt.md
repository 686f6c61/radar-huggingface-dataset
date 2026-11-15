# Phoonnx/glowtts-en_us-cmu_slt

## Resumen

glowtts-en_us-cmu_slt es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera espectrogramas a partir de fonemas IPA en ingles estadounidense (en-US), que posteriormente son convertidos a audio por el vocoder hifigan-multi-vctk-small. No se trata de un modelo de lenguaje generativo, sino de un sistema TTS acustico de dos etapas (espectrograma + vocoder).

El modelo es relevante para desarrolladores que necesitan sintesis de voz local, ligera y sin dependencias de servicios en la nube, especialmente en el ecosistema OVOS y en asistentes de voz embebidos. Su tamano de repositorio (0,1 GB) y su formato ONNX lo hacen adecuado para despliegues en entornos con recursos limitados, aunque su cobertura linguistica se limita al ingles estadounidense y su licencia no esta claramente registrada.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generador de espectrogramas) + vocoder HiFi-GAN (hifigan-multi-vctk-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por frase; no es un modelo de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (no se registra licencia concreta; el autor indica consultar la release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica basado en normalizing flows que genera espectrogramas mel a partir de secuencias de fonemas, sin necesidad de alineamientos externos (utiliza un mecanismo de alineamiento monotono aprendido, Monotonic Alignment Search). En este caso, el modelo original fue entrenado por Rhasspy como parte del proyecto Larynx (release v1.0, voz en-us_cmu_slt) y posteriormente exportado a ONNX y empaquetado por Phoonnx. La sintesis se completa con el vocoder HiFi-GAN hifigan-multi-vctk-small, que transforma el espectrograma en forma de onda de audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo TTS acustico de este tipo). La model card no documenta innovaciones tecnicas adicionales mas alla del propio pipeline Glow-TTS + HiFi-GAN y del front-end de texto basado en gruut para fonemizacion IPA.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (GruutPhonemizer de scriptconv).
- Generacion de espectrogramas mel y conversion a audio WAV mediante el vocoder HiFi-GAN.
- Integracion con la libreria phoonnx (Python) para sintesis programatica.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Normalizacion y conversion de texto delegadas a scriptconv.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Cobertura multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante el plugin ovos-tts-plugin-phoonnx y se selecciona la voz `larynx/en-us-cmu_slt-glow_tts` en `mycroft.conf`, lo que permite sintesis en dispositivos sin conexion a la nube.
- Sintesis de voz embebida en dispositivos de recursos limitados: el repositorio de 0,1 GB en formato ONNX y el vocoder ligero permiten ejecucion en hardware modesto (Raspberry Pi y similares), segun el diseno de Larynx y phoonnx.
- Generacion de audiolibros o locuciones automatizadas en ingles: el modelo sintetiza frases completas a WAV mediante `voice.synthesize_wav`, adecuado para pipelines por lotes de contenido en en-US.
- Accesibilidad y lectura de texto en pantalla: integracion en aplicaciones de lectura que conviertan texto a voz en ingles estadounidense con latencia local.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo empaquetado en phoonnx, sirve como referencia para validar el flujo texto -> gruut -> Glow-TTS -> HiFi-GAN antes de desplegar otras voces.
- Prototipado de interfaces conversacionales en ingles: permite generar respuestas habladas en entornos de desarrollo sin coste de API, aunque limitado a en-US.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX del modelo, se espera un consumo bajo, pero no se documentan cifras.
- GPU recomendadas: no disponible. El modelo esta disenado para ejecucion en CPU mediante ONNX Runtime, segun el enfoque de phoonnx y Larynx.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX permite ejecucion en CPU y potencialmente en GPU, pero no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y ONNX Runtime como backend implicito. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_slt (este modelo) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (no registrada) | no aplica | Hugging Face (Phoonnx) |
| Otras voces Glow-TTS de la coleccion Phoonnx | Glow-TTS + HiFi-GAN | segun voz | ONNX | other | no aplica | Coleccion Glow-TTS en Hugging Face |
| Modelos Larynx upstream (Rhasspy) | Glow-TTS + vocoder | multiples | tar.gz / ONNX | segun release upstream | no aplica | GitHub rhasspy/larynx |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada. La comparativa se limita a arquitectura, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Cobertura linguistica limitada exclusivamente al ingles estadounidense (en-US); no soporta otros idiomas.
- La licencia figura como "other" y el autor indica que no se registra licencia concreta; es imprescindible verificar la release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre una voz concreta (cmu_slt) puede presentar limitaciones de naturalidad y prosodia fuera de ese dominio.
- Riesgo de artefactos acusticos y errores de pronunciacion en textos con abreviaturas, numeros o terminos fuera del alcance del fonemizador gruut.
- Dependencia del front-end scriptconv y del fonemizador gruut; cambios en estas librerias pueden alterar la salida.
- Requiere el vocoder hifigan-multi-vctk-small, que phoonnx descarga junto con la voz; sin el, el modelo no produce audio.
- No es un modelo de lenguaje: no realiza razonamiento, tool calling ni generacion de texto; su uso esta restringido a sintesis de voz.
- El numero de descargas (33) y de likes (0) es bajo, lo que sugiere poca validacion comunitaria; conviene probar exhaustivamente antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_slt
- Release upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_slt-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
