# Phoonnx/vits-hu_hu-css10

## Resumen

vits-hu_hu-css10 es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo está especializado en húngaro (hu-HU) y se distribuye como un artefacto listo para inferencia dentro del ecosistema OVOS, lo que facilita su integración en asistentes de voz y sistemas de automatización del habla.

La relevancia de este modelo radica en su empaquetado: aunque el modelo original VITS de Coqui ya existía en el repositorio de TTS de Coqui (versión 0.8.0), Phoonnx lo ha convertido a ONNX y lo ha integrado con su pipeline de normalización de texto mediante scriptconv y su gestor de voces. Esto permite a desarrolladores desplegar TTS en húngaro sin depender del framework original de Coqui, usando una librería ligera y compatible con el plugin `ovos-tts-plugin-phoonnx`.

El modelo tiene un tamaño de repositorio de 0,1 GB, lo que sugiere un modelo compacto adecuado para despliegue en entornos con recursos limitados. No se dispone de información sobre el número de parámetros ni la longitud de contexto en la documentación proporcionada, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | húngaro (hu-HU) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto (graphemes) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial. A diferencia de los sistemas TTS en dos etapas (texto a mel-espectrograma y mel-espectrograma a audio), VITS genera la forma de onda directamente desde el texto, lo que simplifica el pipeline y reduce la latencia. El modelo original fue entrenado por Coqui y publicado en su repositorio de modelos de TTS v0.8.0.

El modelo aquí presentado ha sido empaquetado por Phoonnx en formato ONNX para su ejecución con la librería phoonnx. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (aunque el nombre "css10" sugiere el corpus CSS10 de húngaro), ni si se aplicaron técnicas de RLHF o DPO, ya que se trata de un modelo TTS y no de un modelo de lenguaje. La innovación principal del empaquetado es la integración con scriptconv para la normalización de texto y la fonemización basada en grafemas (`GraphemePhonemizer`), que convierte el texto de entrada en la representación adecuada para el modelo.

## Capacidades

- Síntesis de voz en húngaro (hu-HU) a partir de texto de entrada.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Normalización y conversión de texto mediante scriptconv con fonemización basada en grafemas.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Gestión de voces mediante `TTSModelManager` con carga y fusión de voces por defecto.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al húngaro.

## Casos de uso

- Asistentes de voz en húngaro: el modelo puede integrarse en OVOS como módulo TTS para convertir respuestas textuales en audio, usando la configuración `mycroft.conf` con el plugin `ovos-tts-plugin-phoonnx` y la voz `coqui/hu-css10-vits`.
- Lectura de textos y artículos: mediante la API de phoonnx, se puede sintetizar texto largo en húngaro y guardar el resultado en un archivo WAV para su reproducción o distribución.
- Sistemas de accesibilidad: conversión de contenido escrito a voz para usuarios con discapacidad visual que requieran húngaro, con un modelo compacto (0,1 GB) que puede ejecutarse en entornos con recursos limitados.
- Automatización de atención al cliente: generación de respuestas de voz pregrabadas o dinámicas en húngaro para sistemas IVR, usando la síntesis bajo demanda desde texto.
- Producción de contenido multimedia: generación de narraciones en húngaro para vídeos, pódcast o audiolibros, con la ventaja de un pipeline ligero basado en ONNX.
- Pruebas de integración en pipelines de CI/CD: al ser un modelo ONNX empaquetado, puede incluirse en tests automatizados de sistemas de voz sin depender del framework completo de Coqui.
- Desarrollo de prototipos de TTS en húngaro: la instalación mediante `pip install --pre phoonnx` y la carga de la voz permiten iterar rápidamente en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. El tamaño del repositorio es de 0,1 GB, lo que sugiere que el modelo es compacto y puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es probable que funcione en GPUs consumer, pero no se especifica en la información proporcionada.
- ¿Cabe en consumer GPU? No se dispone de datos concretos, pero el tamaño de 0,1 GB indica que es viable en hardware de gama baja.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-hu_hu-css10 (este) | VITS | húngaro (hu-HU) | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS hu-css10-vits (original) | VITS | húngaro (hu-HU) | BSD-3-Clause | Coqui TTS (checkpoint) | GitHub Coqui TTS v0.8.0 |
| Otros modelos VITS de Phoonnx | VITS | varios idiomas | BSD-3-Clause (según modelo) | ONNX | Colección VITS en Hugging Face |

No se dispone de información sobre benchmarks comparativos ni sobre otros modelos TTS específicos de húngaro en la documentación proporcionada. La comparativa se limita al modelo original de Coqui y a otros modelos de la colección VITS de Phoonnx.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para húngaro (hu-HU); no soporta otros idiomas.
- Al ser un modelo TTS y no un modelo de lenguaje, no tiene capacidades de razonamiento, código ni matemáticas.
- No se dispone de información sobre sesgos conocidos en el dataset de entrenamiento (CSS10) ni sobre la calidad de la síntesis en dominios específicos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas para palabras fuera del vocabulario o con grafías ambiguas.
- Limitaciones de contexto: la entrada es por caracteres, sin una longitud de contexto definida en la documentación; textos muy largos pueden requerir segmentación.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos del modelo original de Coqui y del corpus CSS10.
- Caveat para producción: el modelo se distribuye con la etiqueta `--pre` en phoonnx (`pip install --pre phoonnx`), lo que indica que la librería está en fase de preproducción.
- No se especifican requisitos de hardware ni latencia, lo que dificulta la planificación de despliegues a gran escala.

## Enlaces

- [Hugging Face: Phoonnx/vits-hu_hu-css10](https://huggingface.co/Phoonnx/vits-hu_hu-css10)
- [Repositorio original de Coqui TTS (modelo hu-css10-vits)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--hu--css10--vits.zip)
- [phoonnx (librería ONNX TTS)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalización y fonemización)](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Arquitectura VITS (referencia)](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
