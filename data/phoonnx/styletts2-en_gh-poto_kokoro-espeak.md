# Phoonnx/styletts2-en_gh-poto_kokoro-espeak

## Resumen

`Phoonnx/styletts2-en_gh-poto_kokoro-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por GhanaNLP a partir de su modelo `ghananlpcommunity/poto-tts-kokoro-gh` y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en inglés de Ghana (`en-GH`) y constituye un ejemplo de adaptación de un TTS generalista a una variante regional concreta del inglés.

El modelo no es un LLM ni un transformer de propósito general: es un sistema TTS de dos etapas (generador acústico y vocoder) que recibe fonemas en alfabeto IPA generados por espeak-ng y produce audio en formato WAV. Su relevancia radica en que demuestra el flujo de empaquetado de StyleTTS2 en ONNX para despliegue ligero, integrable en asistentes de voz como OVOS, y en que cubre una variante lingüística poco representada en los sistemas TTS comerciales.

El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El modelo tiene un volumen de descargas muy bajo (15) y ninguna interacción social (0 likes), lo que sugiere que se trata de un artefacto reciente o de nicho dentro del ecosistema Phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS de dos etapas: generador acustico + vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto o fonemas de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | `en-GH` (ingles de Ghana) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,4 GB |
| Libreria de inferencia | phoonnx (Python y plugin OVOS) |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un generador acústico basado en difusión con un discriminador de estilo y un vocoder neuronal. El modelo recibe fonemas en IPA (no texto crudo: el front-end de phoonnx, mediante `scriptconv`, normaliza el texto y lo convierte a fonemas con espeak-ng) y genera la forma de onda de audio. La arquitectura separa la predicción de contenido prosódico de la generación de la señal acústica, lo que permite un control de estilo y una calidad de síntesis superior a los TTS concatenativos clásicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El modelo deriva del checkpoint `ghananlpcommunity/poto-tts-kokoro-gh`, del que no se detallan en la información proporcionada los datos de entrenamiento ni el proceso de adaptación al inglés de Ghana. La innovación destacable es el empaquetado en ONNX para inferencia ligera y la integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

## Capacidades

- Síntesis de voz a partir de texto en inglés de Ghana (`en-GH`), con salida en WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Control de estilo implícito en la arquitectura StyleTTS2 (no se documenta API explícita de estilo en esta ficha).
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta visión, audio de entrada ni modo thinking.

## Casos de uso

- **Asistentes de voz domésticos con OVOS**: el modelo se integra directamente mediante `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`; es adecuado para asistentes que necesiten una voz en inglés de Ghana con latencia baja en CPU gracias a la inferencia ONNX.
- **Locución de contenido para audiencias ghanesas**: síntesis de narraciones, noticias o avisos en la variante `en-GH`, cubriendo una variante regional poco atendida por los TTS comerciales.
- **Sistemas de accesibilidad**: lectura de texto en pantalla para usuarios con discapacidad visual en Ghana, con un modelo ligero (0,4 GB) que puede ejecutarse en hardware modesto.
- **Aplicaciones de e-learning**: generación de audio para cursos y materiales educativos en inglés de Ghana, con la posibilidad de pregenerar ficheros WAV por lotes.
- **Prototipado de pipelines TTS**: como ejemplo de referencia para empaquetar StyleTTS2 en ONNX y validar el flujo `scriptconv` + `phoonnx` antes de adaptar otros checkpoints.
- **Integración en servicios de atención telefónica**: síntesis de respuestas pregrabadas dinámicamente en `en-GH`, siempre que el hardware de destino soporte ONNX Runtime y la latencia sea aceptable.
- **Investigación en TTS de variedades regionales**: base para experimentos de adaptación de StyleTTS2 a otras variantes del inglés o para comparar el front-end espeak-ng frente a espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; el repositorio ocupa 0,4 GB, por lo que la inferencia en FP32 requiere del orden de 0,5-1 GB de memoria, y menos si se cuantiza (aunque no se documentan variantes cuantizadas).
- **GPU recomendadas**: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 o superior) es sobradamente suficiente, y la inferencia en CPU es viable.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer con al menos 2 GB de VRAM; también en CPU.
- **Opciones de despliegue**: ONNX Runtime a través de `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Dependencias del sistema**: es necesario instalar `espeak-ng` (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak); este último puede pronunciar mal algunas palabras por diferencias en los fonemas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| `Phoonnx/styletts2-en_gh-poto_kokoro-espeak` | StyleTTS2 (ONNX) | en-GH | Apache 2.0 | ONNX | Fonemas IPA vía espeak-ng |
| `ghananlpcommunity/poto-tts-kokoro-gh` (upstream) | StyleTTS2 | en-GH | Apache 2.0 | no disponible | Texto/fonemas |
| Otros modelos de la colección StyleTTS2 de Phoonnx | StyleTTS2 (ONNX) | variables | Apache 2.0 (según cada modelo) | ONNX | Fonemas IPA vía espeak-ng |
| TTS comerciales (p. ej. Google Cloud TTS, Azure TTS) | Propietaria | Múltiples, incluido en-GH limitado | Propietaria | API | Texto |

La comparativa con TTS comerciales es cualitativa: no se dispone de métricas objetivas (MOS, WER, latencia) para este modelo en la información proporcionada. La principal ventaja frente a soluciones propietarias es la licencia Apache 2.0 y la ejecución local en ONNX; la principal desventaja es la ausencia de benchmarks publicados y el bajo nivel de adopción (15 descargas).

## Limitaciones y advertencias

- **Idioma restringido**: solo soporta `en-GH`; no está entrenado para otras variantes del inglés ni para otros idiomas.
- **Dependencia de espeak-ng**: la calidad de la síntesis depende del front-end de fonemización; el port espyak incluido en `phoonnx[espeak]` puede producir errores de pronunciación por diferencias en los fonemas respecto a espeak-ng.
- **Sin benchmarks publicados**: no hay métricas objetivas de calidad (MOS), inteligibilidad (WER) ni latencia, lo que dificulta evaluar su idoneidad en producción.
- **Riesgo de alucinación acústica**: como todo TTS, puede generar prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento; no se documentan sesgos específicos.
- **Licencia**: Apache 2.0 permite uso comercial, pero la licencia se hereda del modelo upstream `ghananlpcommunity/poto-tts-kokoro-gh`; conviene verificar la model card original antes de un despliegue comercial.
- **Baja adopción**: 15 descargas y 0 likes; no hay evidencia de uso en producción ni comunidad de soporte.
- **Formato ONNX**: requiere ONNX Runtime; no es directamente compatible con frameworks como PyTorch o TensorFlow sin conversión.
- **Sin soporte de texto crudo**: la entrada debe pasar por el front-end de `scriptconv`; usar el modelo sin ese pipeline puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_gh-poto_kokoro-espeak
- Modelo upstream: https://huggingface.co/ghananlpcommunity/poto-tts-kokoro-gh
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
