# milliwattlabs/leokani-tts-7M

## Resumen

Leokani-tts 7M es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Milliwatt Labs, un laboratorio centrado en modelos de IA de muy bajo consumo que puedan ejecutarse en hardware de consumo sin GPU. El modelo convierte texto en audio inteligible y natural con tan solo 7.018.218 parámetros, un orden de magnitud por debajo de los sistemas TTS convencionales, y está diseñado explícitamente para inferencia en CPU, incluyendo microcontroladores y dispositivos embebidos.

El modelo ofrece dos voces en inglés americano: Dala (femenina) y Pono (masculina), ambas entrenadas sobre habla sintética generada con Kokoro-82M. Se distribuye en formatos PyTorch (safetensors) y ONNX, con variantes en fp32, fp16 e int4, lo que permite ajustar el equilibrio entre calidad y tamaño de descarga. El repositorio ocupa 0,2 GB.

Su relevancia actual reside en la eficiencia: demuestra que es posible obtener voz sintetizada de calidad aceptable en dispositivos donde un modelo de cientos de millones de parámetros sería inviable, habilitando asistentes de voz locales, domótica y aplicaciones móviles sin dependencia de la nube. La licencia es propietaria (Milliwatt Labs Model License), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en Kokoro; detalles arquitectónicos no publicados en la información disponible) |
| Parámetros totales | 7.018.218 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32, fp16, int4 (ONNX) |
| Idiomas soportados | inglés (en), específicamente inglés americano |
| Licencia | Milliwatt Labs Model License (propietaria, `license: other`) |
| Formato de pesos | safetensors (PyTorch) y ONNX |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El modelo se enmarca en la familia Kokoro (etiqueta `kokoro` en el repositorio) y se distribuye como pesos PyTorch y ONNX, lo que sugiere una red neuronal ligera orientada a inferencia en CPU. El repositorio incluye un módulo G2P (grapheme-to-phoneme) propio, Leokani G2P 1.2.0, que gestiona números, abreviaturas, letras y homógrafos antes de la síntesis.

El entrenamiento se realizó sobre habla sintética generada con Kokoro-82M, no sobre grabaciones humanas directas, según indica la model card. No se especifican el número de tokens, la composición del dataset ni si hubo etapas de RLHF o ajuste fino con preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés americano a partir de texto, con dos voces: Dala (femenina) y Pono (masculina).
- Control de velocidad de habla mediante el parámetro `--speed` (por ejemplo, 0,85 para habla más lenta).
- Normalización de texto mediante el módulo G2P integrado: lectura correcta de números, fechas, unidades, abreviaturas, letras y homógrafos.
- Manejo de frases cortas y párrafos largos (se incluyen muestras de una frase larga de más de cien palabras).
- Ejecución en CPU sin GPU, incluidos dispositivos embebidos (ESP32-S3 y ESP32-P4 vía librería Arduino).
- Inferencia local en navegador mediante JavaScript, sin enviar el texto a ningún servidor.
- Integración con asistentes de IA mediante un servidor MCP en la herramienta de línea de comandos.
- API compatible con OpenAI para síntesis de voz, disponible en Docker.
- Servidor Wyoming para integración con Home Assistant.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz local en escritorio: la herramienta de línea de comandos con servidor MCP permite que un asistente de IA genere respuestas habladas en la propia máquina, sin latencia de red ni coste por petición, gracias a los 7M de parámetros que caben en cualquier CPU moderna.
- Voice-over para aplicaciones Android: el modelo puede instalarse como voz del sistema TTS del teléfono, sustituyendo el servicio de Google o Samsung por una síntesis local que no requiere conexión y preserva la privacidad del texto dictado.
- Domótica con Home Assistant: mediante el servidor Wyoming o el add-on oficial, el modelo anuncia eventos, estados de dispositivos y respuestas de voz en altavoces locales, con despliegue en amd64 y arm64 (Raspberry Pi incluido).
- Lectura de notificaciones y correos en dispositivos de bajo consumo: el formato int4 ONNX y la variante de 4,5M permiten ejecutar la síntesis en microcontroladores y placas como ESP32, útil para wearables y dispositivos IoT que deben hablar sin conexión.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o aplicaciones de escritorio, el modelo ofrece voz sintética offline en inglés con control de velocidad, sin depender de servicios en la nube ni exponer el contenido leído.
- Prototipado rápido de interfaces conversacionales: desarrolladores que construyen chatbots o IVR pueden generar audio de prueba en segundos con `python leokani.py`, ajustar la velocidad y validar la experiencia antes de invertir en un TTS de mayor calidad.
- Demos web sin backend: la librería JavaScript permite incrustar síntesis de voz en una página estática, de modo que el texto del usuario nunca sale del navegador, adecuado para aplicaciones sanitarias o educativas con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), WER del G2P ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU. Con 7M de parámetros, los pesos en fp32 ocupan aproximadamente 28 MB, en fp16 unos 14 MB y en int4 unos 3,5 MB.
- GPU recomendadas: no son necesarias. Cualquier GPU serviría, pero el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo y en CPU convencionales; también en microcontroladores (ESP32-S3 y ESP32-P4) con la variante adecuada.
- Opciones de despliegue: PyTorch con safetensors, ONNX Runtime (Python), JavaScript en navegador y Node.js, herramienta de línea de comandos, app de macOS, app de Android, add-on de Home Assistant, servidor Wyoming, API compatible con OpenAI en Docker y librería Arduino.
- Latencia y throughput: no disponibles en la información proporcionada. La model card describe el modelo como "rápido" y apto para "cualquier CPU", pero no aporta cifras de tiempo real (RTF) ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Ejecución en CPU | Disponibilidad |
|---|---|---|---|---|---|---|
| Leokani-tts 7M | 7.018.218 | inglés (en) | no disponible | Milliwatt Labs Model License (propietaria) | Sí, incluidos microcontroladores | Hugging Face, apps macOS/Android, Docker, Arduino |
| Leokani-tts 4.5M | no disponible (variante menor del mismo autor) | inglés (en) | no disponible | Milliwatt Labs Model License | Sí, para CPUs lentas y microcontroladores | Hugging Face |
| Kokoro-82M | 82M | inglés y otros (no detallado aquí) | no disponible | no disponible en la información | Sí | Hugging Face (hexgrad/Kokoro-82M) |

La comparación con otros sistemas TTS de referencia (Piper, Coqui TTS, VITS) no está disponible en la información proporcionada. Kokoro-82M aparece como modelo fuente del habla sintética de entrenamiento y como referencia de la familia, con un tamaño aproximadamente doce veces mayor que Leokani-tts 7M.

## Limitaciones y advertencias

- Solo soporta inglés americano; no se ha entrenado para otros idiomas ni acentos.
- Solo dos voces disponibles (Dala y Pono), ambas generadas a partir de habla sintética de Kokoro-82M, lo que puede limitar la naturalidad y variedad prosódica frente a voces grabadas con actores.
- Riesgo de artefactos o pronunciación incorrecta en nombres propios, palabras poco frecuentes o texto fuera del dominio cubierto por el G2P; conviene validar con muestras representativas antes de producción.
- No se han publicado métricas objetivas de calidad (MOS, inteligibilidad) ni benchmarks comparativos, por lo que la evaluación subjetiva es imprescindible.
- La licencia es propietaria (Milliwatt Labs Model License) y no es de código abierto; es necesario revisar los términos del archivo LICENSE-MILLIWATT-LABS.md antes de cualquier uso comercial o redistribución.
- Al ser un modelo de 7M de parámetros, la calidad está acotada por el tamaño: no es adecuado para aplicaciones que exijan voces expresivas, emocionales o clonación de voz.
- No dispone de capacidades de razonamiento, tool calling ni procesamiento de lenguaje natural; cualquier lógica conversacional debe aportarla un sistema externo.
- El repositorio incluye un modelo G2P separado (leokani-g2p) con su propia licencia y versionado; hay que fijar la versión para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/milliwattlabs/leokani-tts-7M-demo
- Variante 4.5M: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Modelo G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Repositorio G2P en GitHub: https://github.com/Milliwatt-Labs/leokani-g2p
- Librería Arduino: https://github.com/Milliwatt-Labs/leokani-arduino
- Add-ons de Home Assistant: https://github.com/Milliwatt-Labs/home-assistant-addons
- Página del modelo y documentación: https://milliwattlabs.com/models/leokani-tts/
- Documentación: https://milliwattlabs.com/docs/
- Sitio del autor: https://milliwattlabs.com
- Modelo Kokoro-82M (fuente del habla de entrenamiento): https://huggingface.co/hexgrad/Kokoro-82M
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-7M/blob/main/LICENSE-MILLIWATT-LABS.md
