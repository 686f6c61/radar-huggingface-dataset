# Phoonnx/vits-sv-cv-graphemes

## Resumen

vits-sv-cv-graphemes es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en sueco (`sv`) a audio inteligible y está entrenado sobre el corpus Common Voice, según se desprende de la nomenclatura `sv-cv-vits` que aparece en la model card.

El modelo resuelve el problema de la síntesis de voz en sueco dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. Su relevancia radica en que ofrece una alternativa ligera (repositorio de 0,1 GB) y de licencia permisiva (BSD-3-Clause) para asistentes de voz locales, frente a soluciones propietarias o de mayor peso.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina codificador de texto, alineamiento por atención y decodificador generativo. La entrada de texto se realiza a nivel de grafemas (caracteres), sin fonemización previa, mediante el `GraphemePhonemizer` de la librería scriptconv. No se dispone de datos sobre el número de parámetros ni la longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (`sv`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end de síntesis de voz que integra un codificador de texto, un mecanismo de alineamiento por atención y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial. Esta arquitectura permite generar audio de forma directa a partir del texto sin necesidad de un modelo acústico y un vocoder separados.

El modelo fue entrenado por Coqui sobre el corpus Common Voice en sueco, tal como indica la denominación `sv-cv-vits` en la model card y en la lista de licencias de Coqui TTS. La entrada de texto se realiza a nivel de grafemas mediante el `GraphemePhonemizer` de scriptconv, lo que evita la necesidad de un diccionario fonético o un fonemizador específico del idioma. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz (text-to-speech) en sueco a partir de texto de entrada.
- Procesamiento de entrada a nivel de grafemas (caracteres), sin fonemización explícita.
- Generación de audio en formato WAV mediante la API de phoonnx.
- Integración con el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Normalización y conversión de texto mediante la librería scriptconv.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del sueco.

## Casos de uso

- Asistentes de voz locales en sueco: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en sueco sin depender de servicios en la nube, gracias a su licencia permisiva y su tamaño reducido (0,1 GB).
- Lectura de notificaciones y alertas en sistemas domóticos: al ser un modelo ligero en ONNX, puede ejecutarse en dispositivos de recursos limitados para anunciar eventos del hogar en sueco.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en sueco dentro de aplicaciones de escritorio o móviles que requieran un motor TTS local y de código abierto.
- Generación de audiolibros o contenido narrado en sueco: el modelo permite sintetizar pasajes de texto de forma automatizada, aunque la calidad y naturalidad no están documentadas en la información disponible.
- Pruebas de integración en pipelines de CI/CD para aplicaciones de voz: al estar empaquetado en ONNX y disponible vía pip (`pip install --pre phoonnx`), se puede incluir en tests automatizados que verifiquen la síntesis de frases en sueco.
- Prototipado de interfaces conversacionales en sueco: desarrolladores que necesiten un motor TTS rápido de integrar pueden usar la API de phoonnx para generar audio de prueba sin entrenar un modelo propio.
- Investigación en síntesis de voz: el modelo sirve como referencia de un VITS entrenado sobre Common Voice en sueco, útil para comparativas o experimentos de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB, lo que sugiere un modelo de pequeño tamaño, pero no se especifica la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio (0,1 GB) es plausible que quepa en GPU de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python y OVOS) con pesos ONNX; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sv-cv-graphemes | VITS (ONNX) | sv | no disponible | no aplica | BSD-3-Clause | Hugging Face (Phoonnx) |
| Otros modelos VITS de la colección Phoonnx | VITS (ONNX) | varios | no disponible | no aplica | según modelo | Hugging Face (colección VITS de Phoonnx) |
| Modelos TTS de Coqui TTS | VITS y otras | varios | no disponible | no aplica | según modelo | GitHub (coqui-ai/TTS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo soporta sueco (`sv`); no se documentan otros idiomas.
- No se dispone de información sobre sesgos conocidos en el corpus Common Voice ni sobre sesgos de género, edad o acento en la voz generada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento (grafemas no vistos).
- La entrada a nivel de grafemas puede producir pronunciaciones menos precisas que un sistema con fonemización explícita en palabras irregulares del sueco.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y sin endoso; se debe conservar el aviso de copyright y la cláusula de exención de responsabilidad.
- El modelo está empaquetado para phoonnx; su uso fuera de esta librería requiere manejar el formato ONNX directamente.
- No se documentan métricas de calidad (MOS, WER) ni latencia, lo que dificulta evaluar su idoneidad para producción.
- El repositorio tiene solo 18 descargas y 0 likes, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/vits-sv-cv-graphemes](https://huggingface.co/Phoonnx/vits-sv-cv-graphemes)
- [Repositorio de phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio de scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Modelo original de Coqui TTS (v0.8.0)](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--sv--cv--vits.zip)
