# Phoonnx/vits-gl_es-paulo-proxecto_nos-cotovia

## Resumen

vits-gl_es-paulo-proxecto_nos-cotovia es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la librería de inferencia ONNX del mismo nombre. El modelo está especializado en gallego de España (`gl-ES`) y convierte texto codificado en fonemas Cotovia en audio inteligible. Su propósito es proporcionar una voz sintética de calidad para aplicaciones de lectura en voz alta, asistentes de voz y sistemas de accesibilidad en gallego.

La relevancia de este modelo radica en su formato ONNX, que permite su despliegue en entornos de producción sin dependencias de frameworks de aprendizaje profundo pesados, y en su integración con el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa tan solo 0,1 GB, lo que lo hace adecuado para dispositivos con recursos limitados. No obstante, se trata de un modelo derivado y empaquetado, no de un desarrollo original de Phoonnx, y su adopción es actualmente muy baja (0 descargas, 0 likes en el momento de la consulta).

El modelo no incluye información pública sobre el volumen de datos de entrenamiento, el proceso de alineación o métricas de calidad objetivas. La model card se limita a describir la arquitectura, el origen y las instrucciones de uso, por lo que los datos técnicos disponibles son escasos y se detallan a continuación sin inferencias no fundamentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo de forma autoregresiva) |
| Tipos de cuantización | no disponible (pesos en formato ONNX, presumiblemente FP32 o FP16; no se especifica) |
| Idiomas soportados | gallego de España (`gl-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas Cotovia, alfabeto Cotovia |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx (Python), plugin OVOS |
| Autor original | Proxecto Nós |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo. En este caso, la entrada no es texto crudo sino fonemas Cotovia, producidos por el fonemizador `CotoviaPhonemizer` de la librería `scriptconv`, que se instala con el extra `scriptconv[gl]`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. El modelo es una conversión a ONNX del checkpoint original `OpenVoiceOS/proxectonos-paulo-vits-phonemes-onnx`, que a su vez deriva del trabajo de Proxecto Nós. No se documentan procesos de destilación, decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en gallego de España (`gl-ES`), previa conversión a fonemas Cotovia mediante `scriptconv`.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OpenVoiceOS (OVOS) mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en CPU y GPU a través de ONNX Runtime, sin requerir PyTorch en producción.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales.
- Capacidad multilingüe limitada exclusivamente al gallego; no se documentan otros idiomas.
- No se documentan capacidades de control de prosodia, emoción ni estilo más allá de las inherentes a VITS.

## Casos de uso

- Lectura de contenido web en gallego: el modelo puede integrarse en un navegador o lector de artículos para convertir texto en audio, usando el fonemizador Cotovia para normalizar la entrada antes de la síntesis. Es adecuado por su reducido tamaño (0,1 GB) y su licencia MIT permisiva.
- Asistentes de voz domésticos con OpenVoiceOS: mediante el plugin `ovos-tts-plugin-phoonnx`, se puede configurar la voz `proxectonos/paulo-cotovia` en `mycroft.conf` para que el asistente responda en gallego. La integración está documentada y probada por el empaquetador.
- Accesibilidad para personas con discapacidad visual: el modelo permite convertir documentos y pantallas en audio en gallego, con una latencia potencialmente baja al ejecutarse en ONNX Runtime sobre CPU.
- Generación de audiolibros y pódcast en gallego: se puede procesar texto por lotes y sintetizar cada frase en WAV, aunque no se documenta control de prosodia avanzado ni marcas SSML.
- Sistemas de anuncios públicos y señalización: para mensajes cortos y repetitivos en gallego (estaciones, aeropuertos, comercios), el modelo ofrece una voz consistente y ligera que puede ejecutarse en dispositivos embebidos.
- Pruebas de integración en pipelines de TTS: al ser un modelo ONNX empaquetado, sirve como base para comparar calidad de voz frente a otros modelos VITS de la colección Phoonnx, o para validar el flujo `scriptconv` + `phoonnx` en entornos de CI.
- Prototipado de aplicaciones de voz en gallego: desarrolladores que necesiten una voz sintética rápida para demos o pruebas de concepto pueden cargar el modelo con `TTSModelManager` sin entrenar ni convertir pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, por lo que se espera que el modelo quepa holgadamente en GPUs de gama baja, pero no se documenta el consumo real de memoria.
- GPU recomendadas: no disponible. Al ejecutarse mediante ONNX Runtime, puede usar GPU con soporte CUDA o TensorRT, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (0,1 GB), pero no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|---|
| vits-gl_es-paulo-proxecto_nos-cotovia | VITS | gl-ES | no aplica | MIT | ONNX | 0,1 GB |
| OpenVoiceOS/proxectonos-paulo-vits-phonemes-onnx | VITS | gl-ES | no aplica | no disponible en la información | ONNX | no disponible |
| Otros modelos de la colección Phoonnx VITS | VITS | varios | no aplica | MIT (según colección) | ONNX | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estos modelos en la información proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo sintetiza voz en gallego de España (`gl-ES`); no soporta otros idiomas ni variantes dialectales documentadas.
- La entrada debe ser texto procesado por el fonemizador Cotovia; texto crudo sin normalización puede producir errores de pronunciación.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de una comunidad concreta, podría reflejar sesgos de pronunciación o prosodia de la variedad utilizada en el corpus original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciaciones incorrectas o artefactos acústicos en palabras fuera del vocabulario de entrenamiento.
- La licencia MIT permite uso comercial, pero la model card indica que "the upstream release states its terms", por lo que se recomienda verificar la licencia del checkpoint original de OpenVoiceOS/Proxecto Nós antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- No se documentan límites de longitud de texto de entrada; textos muy largos podrían requerir segmentación manual.
- No se proporcionan métricas de calidad (MOS, inteligibilidad) ni comparativas con otros sistemas TTS en gallego.

## Enlaces

- [Hugging Face: Phoonnx/vits-gl_es-paulo-proxecto_nos-cotovia](https://huggingface.co/Phoonnx/vits-gl_es-paulo-proxecto_nos-cotovia)
- [Modelo upstream: OpenVoiceOS/proxectonos-paulo-vits-phonemes-onnx](https://huggingface.co/OpenVoiceOS/proxectonos-paulo-vits-phonemes-onnx)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Proxecto Nós (sitio del proyecto original)](https://proxectonos.gal) (no verificado en la información proporcionada)
