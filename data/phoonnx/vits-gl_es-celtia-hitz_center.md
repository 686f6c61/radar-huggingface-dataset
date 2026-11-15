# Phoonnx/vits-gl_es-celtia-hitz_center

## Resumen

`vits-gl_es-celtia-hitz_center` es un modelo de síntesis de voz (text-to-speech) en gallego, empaquetado en formato ONNX por Phoonnx a partir del modelo original `HiTZ/TTS-gl_celtia` desarrollado por el HiTZ Center (Universidad del País Vasco). El modelo emplea la arquitectura VITS, un sistema de TTS neuronal de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo basado en flujos normales y un discriminador adversarial, lo que permite generar audio de forma directa sin necesidad de un vocoder externo.

La relevancia de este paquete reside en su integración con el ecosistema phoonnx, una librería de TTS basada en ONNX Runtime que facilita el despliegue en entornos Python y en asistentes OVOS (Open Voice OS). El modelo acepta texto en gallego y lo convierte a fonemas mediante el fonemizador Cotovia, incluido en la librería `scriptconv`. El repositorio ocupa aproximadamente 0,1 GB y está publicado bajo licencia Apache 2.0.

Al tratarse de un modelo específico para un único idioma (gallego, `gl-ES`), su utilidad principal es la síntesis de voz de calidad en aplicaciones de accesibilidad, asistentes de voz y lectura automática en gallego, un idioma con recursos limitados en el ámbito del TTS neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz de extremo a extremo que integra en un único modelo un codificador de texto, un prior variacional condicionado por el texto, un decodificador basado en flujos normales inversos y un decodificador de audio (generador HiFi-GAN). El entrenamiento combina una pérdida de reconstrucción variacional, una pérdida adversarial y una pérdida de coincidencia de duración (duration matching) mediante alineamiento monotónico, lo que permite aprender alineamientos sin supervisión explícita. Esto elimina la necesidad de un vocoder separado y reduce la latencia de inferencia.

Los detalles concretos del entrenamiento del modelo original `HiTZ/TTS-gl_celtia` (número de horas de audio, composición del corpus, si se aplicaron técnicas de fine-tuning o adaptación) no están disponibles en la información proporcionada. El paquete de Phoonnx se limita a exportar el modelo a ONNX y a integrar el front-end de texto mediante el fonemizador Cotovia de `scriptconv`, que normaliza el texto y lo convierte a la representación fonémica esperada por el modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego a partir de texto escrito.
- Conversión de texto a fonemas mediante el fonemizador Cotovia (alfabeto Cotovia).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python mediante ONNX Runtime a través de la librería phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al gallego.

## Casos de uso

- Lectura automática de contenido web en gallego: el modelo puede sintetizar artículos, noticias o documentación en voz alta, permitiendo crear servicios de accesibilidad para personas con discapacidad visual que consuman contenido en gallego.
- Asistentes de voz para el hogar: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo proporciona respuestas habladas en gallego en asistentes domésticos, con configuración declarativa en `mycroft.conf`.
- Sistemas de navegación y avisos por voz: adecuado para generar indicaciones habladas en gallego en aplicaciones de transporte o automoción, gracias a la baja latencia de la arquitectura VITS y al formato ONNX optimizado para inferencia.
- Audiolibros y podcast automatizados: permite convertir textos largos en gallego a audio de forma batch, usando la API de phoonnx para generar ficheros WAV por fragmentos.
- Accesibilidad en administraciones públicas: síntesis de voz para portales institucionales gallegos, cumpliendo requisitos de accesibilidad web (WCAG) con una licencia Apache 2.0 que permite uso comercial y modificación.
- Aplicaciones educativas de aprendizaje de idiomas: generación de pronunciaciones en gallego para herramientas de aprendizaje, aprovechando la representación fonémica Cotovia para alinear texto y audio.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados en gallego para estaciones, aeropuertos o comercios, con despliegue local sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (~0,1 GB), es plausible que el modelo quepa en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del repositorio sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python, ONNX Runtime), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-celtia-hitz_center` | VITS | gallego (`gl-ES`) | Apache 2.0 | ONNX | no aplica |
| `HiTZ/TTS-gl_celtia` (upstream) | VITS | gallego (`gl-ES`) | Apache 2.0 | no disponible | no aplica |
| Otros modelos VITS de la colección Phoonnx | VITS | varios idiomas | variable | ONNX | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza gallego (`gl-ES`); no admite otros idiomas ni cambio de voz.
- Dependencia del fonemizador Cotovia: la calidad de la síntesis depende de la correcta normalización y fonemización del texto de entrada; errores en el front-end afectan directamente al audio generado.
- No es un modelo de lenguaje: no realiza razonamiento, generación de texto, código ni matemáticas.
- Riesgo de alucinación: no aplica en el sentido habitual, pero pueden producirse artefactos acústicos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado con un corpus concreto (Celtia), puede reflejar las características de ese corpus (variedad dialectal, estilo de locución).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se atribuya al HiTZ Center y a Phoonnx.
- Caveat para producción: el paquete está marcado como pre-release (`pip install --pre phoonnx`), lo que implica que la API puede cambiar; conviene fijar versiones en entornos productivos.
- No se documentan métricas de calidad (MOS, WER) ni curvas de latencia, por lo que la evaluación en producción requiere pruebas propias.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-gl_es-celtia-hitz_center)
- [Modelo upstream HiTZ/TTS-gl_celtia](https://huggingface.co/HiTZ/TTS-gl_celtia)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección de modelos VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
