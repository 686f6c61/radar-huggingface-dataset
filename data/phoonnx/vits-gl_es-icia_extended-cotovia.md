# Phoonnx/vits-gl_es-icia_extended-cotovia

## Resumen

vits-gl_es-icia_extended-cotovia es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la librería ONNX phoonnx. El modelo está especializado en gallego (gl-ES) y toma como entrada fonemas en el alfabeto Cotovia, un estándar de transcripción fonémica para esta lengua. Su propósito es generar voz sintética natural a partir de texto en gallego dentro de pipelines de TTS, especialmente en entornos OVOS.

El modelo deriva del checkpoint proxectonos/Nos_TTS-icia-extended-vits-phonemes y se distribuye en formato ONNX, lo que permite inferencia sin dependencia de frameworks de deep learning pesados. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a despliegue ligero. Está publicado con licencia Apache 2.0.

Su relevancia actual radica en la escasez de modelos TTS de calidad para lenguas minoritarias como el gallego, y en su integración con el ecosistema phoonnx/OVOS, que facilita su uso en asistentes de voz y aplicaciones de accesibilidad sin necesidad de infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura generativa end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico para aprender la correspondencia texto-audio sin necesidad de alineamientos explícitos. El modelo genera waveforms directamente a partir de la secuencia de fonemas, sin vocoder externo separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional en la información proporcionada. El modelo upstream (proxectonos/Nos_TTS-icia-extended-vits-phonemes) pertenece a Proxecto Nós, y la versión empaquetada por Phoonnx añade una capa de conversión de texto a fonemas mediante la librería scriptconv, concretamente el `CotoviaPhonemizer` del módulo `scriptconv_copyleft.phonemizers.gl`.

## Capacidades

- Síntesis de voz a partir de texto en gallego (gl-ES), generando audio WAV directamente.
- Conversión de texto a fonemas Cotovia mediante el front-end scriptconv, con normalización de texto previa.
- Integración nativa con la librería phoonnx para inferencia ONNX en Python.
- Soporte como plugin de TTS en el ecosistema OVOS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Gestión de voces mediante `TTSModelManager`, incluyendo carga y mezcla de voces por defecto.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al gallego; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en gallego: el modelo puede integrarse en OVOS como módulo TTS para responder a usuarios en gallego, aprovechando el plugin `ovos-tts-plugin-phoonnx` y la configuración directa en `mycroft.conf`.
- Accesibilidad y lectura de textos: conversión de documentos, noticias o contenido web en gallego a audio para personas con discapacidad visual, usando la función `synthesize_wav` sobre texto normalizado por scriptconv.
- Sistemas de navegación y anuncios por voz: generación de indicaciones habladas en gallego en aplicaciones de transporte o movilidad, con latencia baja gracias al formato ONNX y al tamaño reducido del modelo (~0,1 GB).
- Localización de videojuegos y aplicaciones: doblaje o generación de voces para personajes en gallego, usando el modelo como motor TTS dentro de pipelines de producción de audio.
- Investigación en lenguas minoritarias: base para experimentos de TTS en gallego, fine-tuning o evaluación de fonemizadores Cotovia, dado que el modelo es de código abierto con licencia Apache 2.0.
- Automatización de atención telefónica: generación de respuestas de voz pregrabadas dinámicamente en gallego para IVR (respuesta de voz interactiva), desplegando el modelo con phoonnx en servidores sin GPU dedicada.
- Educación y aprendizaje de idiomas: creación de materiales auditivos en gallego con pronunciación fonémica controlada mediante el alfabeto Cotovia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y el formato ONNX, es probable que la inferencia se ejecute en CPU sin necesidad de GPU, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Dado el tamaño reducido, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- ¿Cabe en consumer GPU? Sí, por el tamaño del modelo; también es apto para ejecución en CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLM, no para TTS VITS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-gl_es-icia_extended-cotovia | VITS | gl-ES | no aplica | Apache 2.0 | ONNX | Hugging Face |
| proxectonos/Nos_TTS-icia-extended-vits-phonemes | VITS | gl-ES | no aplica | Apache 2.0 | no disponible | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no aplica | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta gallego (gl-ES); no se debe esperar calidad en otras lenguas.
- Requiere entrada en fonemas Cotovia; el texto debe pasar por el fonemizador scriptconv, por lo que un uso incorrecto del front-end puede degradar la síntesis.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de voz de un proyecto concreto (Proxecto Nós), puede reflejar sesgos de los hablantes y del corpus utilizado.
- Riesgo de alucinación en TTS: puede generar pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en texto no normalizado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y de los datos de entrenamiento originales.
- No hay información sobre latencia, calidad perceptual (MOS) ni robustez en dominios específicos, lo que limita la evaluación para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/vits-gl_es-icia_extended-cotovia](https://huggingface.co/Phoonnx/vits-gl_es-icia_extended-cotovia)
- [Modelo upstream: proxectonos/Nos_TTS-icia-extended-vits-phonemes](https://huggingface.co/proxectonos/Nos_TTS-icia-extended-vits-phonemes)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
