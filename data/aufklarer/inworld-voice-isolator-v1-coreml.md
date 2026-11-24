# aufklarer/Inworld-Voice-Isolator-v1-CoreML

## Resumen

Inworld Voice Isolator v1 Core ML es una conversión compilada a Core ML del modelo Inworld Voice Isolator v1, un sistema de aislamiento de voz y eliminación de ruido para audio. El modelo original fue entrenado y publicado por Inworld AI bajo licencia Apache 2.0; esta versión Core ML la mantiene y distribuye el usuario aufklarer para ejecución offline sobre Apple Silicon mediante el runtime Swift `speech-swift`.

El modelo resuelve el problema de separar la voz limpia de una grabación con ruido de fondo (ruido ambiental, reverberación, otras fuentes sonoras) en una única pasada de audio a audio. Con 64.047.112 parámetros en precisión Float32 y un payload de 258,60 MB, está pensado para integrarse en aplicaciones macOS/iOS que necesiten procesado de voz local sin depender de servicios en la nube.

La relevancia actual radica en su formato de despliegue: 22 etapas Core ML compiladas con soporte de scan Metal, procesamiento por ventanas de 8 segundos con 2 segundos de solape y un rendimiento medido de 0,258 RTF en un Apple M5 Pro, con un pico de memoria física de 1,24 GB. Es, por tanto, una opción de denoising de voz de baja latencia y ejecución local para el ecosistema Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el bundle se compone de 22 etapas Core ML compiladas con coeficientes de scan tipo Mamba) |
| Parametros totales | 64.047.112 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; procesa ventanas de audio de 8 segundos con solape de 2 segundos |
| Tipos de cuantizacion | Float32 (precisión del bundle); no se documentan otras cuantizaciones |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; no se detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`stage_*.mlmodelc`) más `scan_coefficients.bin` en Float32; no se distribuyen safetensors ni GGUF en este repositorio |
| Frecuencia de muestreo | 48 kHz mono |
| Tamano del repositorio | 0,3 GB |
| Pipeline | audio-to-audio |
| Runtime | `speech-swift` (Swift) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original en la información proporcionada. El bundle Core ML revela que la conversión se descompone en 22 etapas compiladas y que incluye coeficientes de scan en Float32 compatibles con Metal, lo que sugiere un mecanismo de scan secuencial (del tipo Mamba) integrado en el grafo. El modelo opera sobre audio mono a 48 kHz y el runtime Swift procesa ventanas de 8 segundos con 2 segundos de solape por defecto.

Tampoco se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en tareas de separación de fuentes). La conversión a Core ML preserva los pesos originales: el error máximo observado frente al fixture dorado upstream es de 3,58e-07 con una tolerancia de 1e-4, y el bundle incluye el SHA-256 del checkpoint original para verificación de procedencia.

## Capacidades

- Aislamiento de voz: separa la voz hablada del ruido de fondo en grabaciones de audio.
- Eliminación de ruido (denoising) y mejora de inteligibilidad de la señal vocal.
- Procesamiento audio a audio a 48 kHz mono con salida en WAV Float32.
- Ejecución completamente offline sobre Apple Silicon, sin llamadas a servicios externos.
- Procesamiento por ventanas de 8 segundos con solape de 2 segundos para grabaciones de duración arbitraria.
- Soporte multilingüe declarado (sin listado explícito de idiomas).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio-texto.

## Casos de uso

- Limpieza de grabaciones de podcast y entrevistas: el modelo elimina ruido ambiental y reverberación de ficheros de 48 kHz antes de la edición, ejecutándose localmente en el Mac del editor sin subir material sensible a la nube.
- Preprocesado para reconocimiento automático del habla (ASR): aplicar el aislamiento de voz antes de un motor ASR mejora la relación señal-ruido y reduce errores de transcripción en entornos ruidosos.
- Aplicaciones de notas de voz en iOS/macOS: integración vía `speech-swift` para limpiar grabaciones del usuario en el dispositivo, con un pico de memoria de 1,24 GB y RTF de 0,258 en M5 Pro.
- Videollamadas y reuniones grabadas: post-procesado de pistas de audio de reuniones para separar la voz del ponente del ruido de teclado, ventilación o tráfico.
- Producción audiovisual y doblaje: preparación de pistas de voz para mezcla final, reduciendo el trabajo manual de limpieza en cadena de montaje.
- Investigación en separación de fuentes: uso como baseline reproducible y offline para comparar métricas de calidad de señal en experimentos con audio multilingüe.
- Preservación de archivos de audio históricos: mejora de grabaciones digitalizadas con ruido de fondo constante antes de su archivo o difusión.

## Benchmarks y rendimiento

| Prueba (Apple M5 Pro) | Resultado |
|---|---|
| RTF en caliente (grabación de 11 s) | 0,258 |
| Pico de memoria física | 1,24 GB |
| Error máximo frente al fixture dorado upstream | 3,58e-07 (tolerancia 1e-4) |

No se han publicado resultados de benchmarks de calidad de señal (SI-SDR, PESQ, STOI u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: pico de 1,24 GB de memoria física durante la inferencia en Apple M5 Pro; el payload del modelo es de 258,60 MB en Float32.
- GPU: diseñado para Apple Silicon con soporte Metal (scan Metal); no se documenta soporte para GPU NVIDIA o AMD.
- Cabe en hardware de consumo Apple: el rendimiento medido corresponde a un M5 Pro; no se publican cifras para otras generaciones de chips.
- Despliegue: runtime Swift `speech-swift` (revisión con soporte Inworld, parche incluido en el bundle) mediante el comando `speech denoise`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,258 en caliente, es decir, procesa aproximadamente 3,9 segundos de audio por segundo de cómputo en el hardware de referencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de aislamiento de voz o denoising comparables (parámetros, contexto, rendimiento o licencia) que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El bundle está limitado a Apple Silicon y al runtime `speech-swift`; no es portable a otras plataformas sin una nueva conversión.
- Solo se distribuye en Float32; no hay variantes cuantizadas que reduzcan el consumo de memoria.
- El procesamiento por ventanas de 8 segundos con solape de 2 segundos puede introducir artefactos en las uniones si se modifica el solape sin validación.
- No se documentan sesgos específicos ni comportamiento por idioma; la etiqueta `multilingual` no viene acompañada de una evaluación por lengua.
- Riesgo de sobre-suprimir componentes de la voz (artefactos, pérdida de naturalidad) en grabaciones con ruido solapado en la misma banda que la voz; no se publican métricas objetivas de calidad.
- Licencia Apache 2.0 permite uso comercial, pero el bundle incluye ficheros `LICENSE` y `NOTICE` de atribución upstream que deben conservarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; el soporte de la comunidad es mínimo y la revisión del runtime debe fijarse por commit (`8effd8f8cbcb6aa1b9355cc6120c2290f05eafd7`).
- La fecha de creación del repositorio (2026-11-24) es posterior a la de esta ficha según los metadatos; conviene verificar la vigencia del bundle antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aufklarer/Inworld-Voice-Isolator-v1-CoreML
- Pesos originales (Inworld): https://huggingface.co/inworld/voice-isolator/tree/9b0285b3fe8403aa8e2f1dbb2165a80a4294c970
- Model card upstream: https://github.com/inworld-ai/voice-isolator/blob/c73b3fab81a870410cbac50d2f05f25edc4d10aa/MODEL_CARD.md
- Runtime Swift `speech-swift`: https://github.com/soniqo/speech-swift
- Guía de inicio: https://soniqo.audio/getting-started
- Soniqo: https://soniqo.audio
- Blog de Soniqo: https://soniqo.audio/blog
