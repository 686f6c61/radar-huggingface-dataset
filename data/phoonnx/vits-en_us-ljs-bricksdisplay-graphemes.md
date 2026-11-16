# Phoonnx/vits-en_us-ljs-bricksdisplay-graphemes

## Resumen

`Phoonnx/vits-en_us-ljs-bricksdisplay-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original procede de kakao-enterprise (`kakao-enterprise/vits-ljs`) y la conversión a ONNX la ha realizado BricksDisplay; el autor del paquete es Phoonnx. Su función es convertir texto en inglés estadounidense en audio inteligible, con una entrada basada en grafemas (caracteres) en lugar de fonemas.

El modelo está pensado para integrarse en pipelines de TTS ligeros, especialmente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. Su tamaño de repositorio (0,1 GB) y su formato ONNX lo hacen adecuado para despliegues con requisitos de cómputo moderados, aunque no se dispone de información sobre el número de parámetros ni sobre la longitud de contexto (en TTS, el concepto de contexto no aplica de la misma forma que en modelos de lenguaje).

La relevancia actual del modelo es limitada: se trata de un paquete derivado de un modelo upstream ya existente, con muy pocas descargas (19) y sin métricas de calidad publicadas en la información disponible. Su interés principal es práctico: ofrece una vía sencilla de integrar TTS en inglés en aplicaciones Python y en asistentes de voz basados en OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica el concepto de contexto de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial para el entrenamiento. El modelo original (`kakao-enterprise/vits-ljs`) fue entrenado sobre el corpus LJSpeech, un conjunto de datos de dominio público de aproximadamente 24 horas de audio de una única hablante femenina en inglés estadounidense. La variante empaquetada aquí utiliza una entrada basada en grafemas, es decir, el texto se pasa directamente como caracteres al modelo, sin una capa de fonemización previa, lo que simplifica el front-end de texto pero puede afectar a la pronunciación de palabras irregulares.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de LJSpeech, ni sobre si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La innovación técnica destacable es el empaquetado en ONNX para inferencia optimizada con phoonnx, junto con el uso de `scriptconv` para la normalización de texto y la conversión de grafemas. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto de entrada.
- Entrada basada en grafemas: acepta caracteres directamente, sin necesidad de un fonemizador externo.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Normalización de texto previa mediante `scriptconv` (conversión de texto y grafemas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés estadounidense; no se documentan otros idiomas.
- No dispone de modo "thinking" ni capacidades especiales más allá de la síntesis de voz.

## Casos de uso

- Asistentes de voz en OVOS/Mycroft: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en inglés en asistentes domésticos sin necesidad de servicios en la nube.
- Lectura de notificaciones y alertas: aplicaciones Python pueden generar avisos de audio en inglés a partir de texto dinámico usando `voice.synthesize_wav`, con un coste computacional bajo gracias al formato ONNX.
- Prototipado rápido de TTS: desarrolladores que necesiten una voz en inglés para demos o pruebas pueden instalar `phoonnx` y cargar el modelo con pocas líneas de código, sin entrenar ni convertir pesos.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o interfaces de accesibilidad en inglés, aprovechando la licencia MIT para uso comercial.
- Generación de audiolibros o contenido narrado de dominio público: el modelo está entrenado sobre LJSpeech (dominio público), lo que reduce riesgos de licencia en la generación de audio narrado.
- Integración en pipelines de CI/CD para pruebas de audio: al ser un modelo ONNX ligero (0,1 GB), puede ejecutarse en entornos de integración continua para validar la salida de TTS en tests automatizados.
- Sistemas embebidos o de borde: el tamaño reducido del repositorio y el formato ONNX permiten desplegar el modelo en dispositivos con recursos limitados, aunque no se dispone de cifras de latencia o throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero, pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El formato ONNX y el tamaño reducido sugieren que podría ejecutarse en GPU de consumo, pero no se confirma.
- Opciones de despliegue: phoonnx (Python y OVOS), con modelo en formato ONNX. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-ljs-bricksdisplay-graphemes | VITS | no disponible | no aplica | MIT | ONNX | Hugging Face (19 descargas) |
| kakao-enterprise/vits-ljs | VITS | no disponible | no aplica | MIT | PyTorch (upstream) | Hugging Face |
| BricksDisplay/vits-eng | VITS | no disponible | no aplica | no disponible | ONNX | Hugging Face |

No se dispone de datos de rendimiento (MOS, latencia, throughput) para ninguno de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a aspectos de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado sobre LJSpeech, que contiene una única hablante femenina en inglés estadounidense; la voz generada estará limitada a ese perfil y puede no representar diversidad de acentos o géneros.
- Riesgo de alucinación: en TTS, el riesgo se traduce en pronunciaciones incorrectas o artefactos de audio, especialmente con palabras irregulares o fuera del vocabulario, dado que la entrada es por grafemas y no por fonemas.
- Limitaciones de contexto o idioma: solo soporta inglés estadounidense (`en-US`); no se documentan otros idiomas ni variantes regionales.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (`kakao-enterprise/vits-ljs`) y del corpus LJSpeech (dominio público).
- Caveats para producción: no se dispone de métricas de calidad (MOS), latencia ni throughput; el número de descargas (19) y la ausencia de likes sugieren poca validación por parte de la comunidad. El modelo depende de la librería phoonnx (versión pre-release, `pip install --pre phoonnx`), lo que puede implicar inestabilidad en la API.
- La entrada por grafemas puede degradar la calidad de pronunciación en comparación con modelos que usan fonemas; se recomienda evaluar con un conjunto de texto representativo antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljs-bricksdisplay-graphemes
- Modelo upstream: https://huggingface.co/kakao-enterprise/vits-ljs
- Conversión ONNX: https://huggingface.co/BricksDisplay/vits-eng/tree/main/onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
