# Phoonnx/vits-nl-css10-graphemes

## Resumen

vits-nl-css10-graphemes es un modelo de síntesis de voz (text-to-speech) en neerlandés basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo procede del paquete `tts_models--nl--css10--vits.zip` publicado en las releases de Coqui TTS v0.8.0, y ha sido reconvertido a formato ONNX para permitir inferencia ligera en Python y en el ecosistema OVOS (Open Voice OS).

El modelo está entrenado sobre el corpus CSS10 (Common Voice Single Speaker 10), un conjunto de datos multilingüe de voz única diseñado para entrenamiento de TTS. La entrada de texto es a nivel de grafemas (caracteres), sin fonemización previa, lo que simplifica el preprocesado pero limita el control sobre la pronunciación en palabras ambiguas.

Es relevante para desarrolladores que necesiten un TTS neerlandés ligero, de código abierto (licencia BSD-3-Clause) y desplegable en entornos con recursos limitados, especialmente dentro del stack de asistentes de voz OVOS. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto adecuado para inferencia en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. Genera audio directamente desde texto sin necesidad de un vocoder separado, lo que reduce la latencia y la complejidad del pipeline. El modelo original fue entrenado por Coqui sobre el corpus CSS10 en neerlandés.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de la referencia a CSS10, ni sobre si se aplicaron técnicas de RLHF o fine-tuning adicional. El front-end de texto utiliza `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte directamente en grafemas sin fonemización fonética. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en neerlandés a partir de texto escrito.
- Entrada a nivel de grafemas (caracteres), sin necesidad de fonemización manual.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, lo que permite inferencia en CPU y entornos sin GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al neerlandés.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente mediante `ovos-tts-plugin-phoonnx` configurando la voz `coqui/nl-css10-vits` en `mycroft.conf`, permitiendo respuestas habladas en neerlandés en asistentes domésticos de código abierto.
- Lectura de notificaciones y alertas en neerlandés: adecuado para sistemas embebidos que necesiten convertir mensajes cortos de texto a voz con bajo consumo de recursos, dado el reducido tamaño del repositorio (0,1 GB).
- Accesibilidad para personas con discapacidad visual: puede integrarse en aplicaciones de lectura de pantalla en neerlandés que requieran un TTS local sin dependencia de servicios en la nube.
- Prototipado rápido de interfaces de voz: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` permiten tener un TTS funcional en pocas líneas de código para validar conceptos.
- Generación de audiolibros o contenido narrado en neerlandés: para textos largos, aunque la calidad y naturalidad dependerán de las limitaciones del corpus CSS10 y del front-end de grafemas.
- Sistemas de información pública o kioscos interactivos: despliegue en dispositivos con CPU únicamente, sin necesidad de GPU, gracias al formato ONNX.
- Investigación en TTS de bajo recursos: como baseline o punto de comparación para modelos neerlandeses más modernos, dado que es un modelo VITS de referencia empaquetado de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que la inferencia se realice en CPU sin necesidad de GPU, pero no se confirman cifras oficiales.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmado, pero el tamaño del repositorio sugiere que podría ejecutarse en cualquier GPU moderna o incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-nl-css10-graphemes | VITS | nl | no aplica | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS nl-css10-vits (original) | VITS | nl | no aplica | BSD-3-Clause | PyTorch (checkpoint) | GitHub Coqui TTS releases |
| Otros modelos VITS de Phoonnx | VITS | varios | no aplica | según modelo | ONNX | Colección VITS en Hugging Face |
| Alternativas TTS neerlandés | no disponible | nl | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos ni sobre otros modelos TTS neerlandeses específicos en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado únicamente en neerlandés; no soporta otros idiomas.
- Entrada a nivel de grafemas: puede producir pronunciaciones incorrectas en palabras con ortografía ambigua o extranjerismos, al no aplicar fonemización.
- Calidad de voz limitada por el corpus CSS10 (voz única, dominio probablemente restringido); no se garantiza naturalidad en dominios fuera del entrenamiento.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede generar audio ininteligible o artefactos en textos atípicos.
- No se documentan sesgos específicos, pero al ser una voz única de un corpus concreto, puede reflejar características demográficas del hablante original.
- Licencia BSD-3-Clause permite uso comercial con atribución, pero se recomienda verificar los términos del corpus CSS10 subyacente.
- No se documentan restricciones adicionales para producción, pero al ser un modelo empaquetado por un tercero (Phoonnx) sobre un modelo de Coqui, conviene validar la calidad antes de desplegar en entornos críticos.
- El número de descargas (18) y likes (0) indica baja adopción, por lo que el soporte de la comunidad es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-nl-css10-graphemes
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--nl--css10--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
