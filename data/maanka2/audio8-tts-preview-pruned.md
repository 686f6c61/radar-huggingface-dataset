# maanka2/Audio8-TTS-Preview-Pruned

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por el equipo Audio8-AI. Su principal característica es su tamaño compacto: el modelo generativo principal tiene aproximadamente 170 millones de parámetros, mientras que el decodificador del códec neuronal es un componente separado de unos 120 millones. Esta versión "Pruned" publicada por maanka2 en Hugging Face contiene un checkpoint con 72.498.240 parámetros en formato safetensors, lo que la sitúa muy por debajo de sistemas TTS multilingües modernos como CosyVoice3 (1.5B) o Fish S2 Pro (4.6B).

El modelo utiliza una arquitectura Audio8 Falcon H1 con dos ramas autoregresivas: una rama lenta que predice tokens semánticos y una rama rápida que predice los codebooks del códec acústico condicionados al estado oculto de la rama lenta. Soporta generación de voz y clonación de voz zero-shot en chino e inglés como idiomas principales, con soporte experimental para alemán, español, francés, italiano, japonés y coreano. La relevancia actual del modelo radica en hacer práctica la clonación de voz con una huella de memoria y cómputo mucho menor que la de los sistemas TTS modernos, incluyendo una variante ONNX INT8 que puede ejecutarse en CPU con solo unos 0,4 GiB de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (ramas autoregressive lenta y rápida) |
| Parámetros totales | 72.498.240 (checkpoint safetensors) / ~170M (modelo principal reportado) + ~120M (decoder del codec) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantización | INT8 (versión ONNX), FP16 (codec en ONNX), bfloat16 (inferencia CUDA) |
| Idiomas soportados | zh, en, de, es, fr, it, ja, ko |
| Licencia | audio8-community-license-v1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Audio8 Falcon H1 con dos ramas autoregressive. La rama lenta (Slow AR) consta de 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, y es responsable de predecir los tokens semánticos. La rama rápida (Fast AR) tiene 4 capas con la misma anchura y configuración de atención, y predice los 10 codebooks del códec acústico (4.096 entradas por codebook) condicionándose al estado oculto de la rama lenta. El códec opera a 44.1 kHz con 2.048 muestras por frame (~21.5 frames/s), y su decodificador es un componente separado de aproximadamente 120M de parámetros incluido en el repositorio. El modelo se carga mediante código remoto de Transformers con `trust_remote_code=True` y acepta `torch.bfloat16` en GPU.

El entrenamiento no se detalla en la información disponible; se menciona un pipeline independiente de SFT para síntesis multilingüe y clonación de voz, pero no se especifican el número de tokens, la composición del dataset ni el uso de RLHF o DPO. La versión "Pruned" publicada en este repositorio presenta un checkpoint de 72.498.240 parámetros en safetensors, inferior a los ~170M reportados para el modelo principal, lo que sugiere una poda adicional respecto a la versión estándar.

## Capacidades

- Generación de voz natural y expresiva a partir de texto en chino e inglés (idiomas principales) y en alemán, español, francés, italiano, japonés y coreano (soporte experimental).
- Clonación de voz zero-shot: sintetiza voz nueva con la timbre y estilo de un audio de referencia, sin necesidad de entrenamiento adicional.
- Clonación cross-lingual: capacidad de transferir la voz de referencia a otros idiomas, según los ejemplos de la página de audio del proyecto.
- Códec de audio neuronal integrado en el repositorio, sin necesidad de descargar checkpoints adicionales.
- Versión ONNX INT8 para inferencia en CPU con memoria reducida (aprox. 0,4 GiB tras la carga).
- API de Python con `transformers` y código remoto, compatible con `AutoModel` y `AutoProcessor`.
- Herramientas de línea de comandos, servicio web y HTTP, y registro de voz para el flujo de trabajo ONNX.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz multilingües con una voz consistente y natural, adecuado para sistemas IVR o asistentes telefónicos que requieran baja latencia y despliegue en hardware modesto.
- Doblaje de contenido audiovisual: la clonación zero-shot permite generar doblaje en varios idiomas manteniendo la voz del actor original, útil para estudios de producción con presupuesto limitado.
- Audiolibros y narración personalizada: con la voz de un narrador de referencia, se pueden generar audiolibros completos en chino o inglés sin grabaciones adicionales, gracias a su contexto de 2.048 posiciones.
- Asistentes de voz en dispositivos edge: su tamaño reducido y la variante ONNX INT8 permiten ejecutar el modelo en mini-PCs o routers con CPU, ofreciendo síntesis de voz en tiempo real sin depender de la nube.
- Creación de contenido para accesibilidad: generación de voz para personas con discapacidad visual o dificultades de lectura, con la posibilidad de clonar una voz conocida para mayor familiaridad.
- Prototipado rápido de productos de voz: los desarrolladores pueden integrar el modelo en pipelines de prueba con `transformers` y `soundfile`, validando conceptos de voz clonada sin invertir en infraestructura GPU.
- Herramientas de doblaje educativo: en entornos de enseñanza de idiomas, permite generar ejemplos de pronunciación en múltiples idiomas con la voz del profesor de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla comparativa de escala de parámetros con otros sistemas TTS (IndexTTS2.5, CosyVoice3, VoxCPM2, Fish S2 Pro, Higgs Audio v2, MOSS-TTS), pero no se proporcionan métricas de calidad como MOS, WER o similar. Los datos de rendimiento se limitan a la configuración ONNX INT8 en CPU: aproximadamente 0,4 GiB de memoria tras la carga y ejecución nativa sin CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la versión PyTorch; la versión ONNX INT8 requiere aproximadamente 0,4 GiB de RAM en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM para la versión PyTorch en FP16 (estimación basada en el tamaño del checkpoint); no se especifican modelos concretos.
- Consumer GPU: sí, el modelo cabe en GPU de consumo como RTX 3060 o superiores, dado su tamaño reducido; la variante ONNX puede ejecutarse sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, ONNX Runtime con `CPUExecutionProvider`, y herramientas de CLI/HTTP incluidas en el repositorio.
- Latencia y throughput: no disponible; la documentación solo menciona que la síntesis normal carga los tres componentes (Slow AR, Fast AR, codec decoder) y que el registro de voz libera esas sesiones para controlar el pico de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros (modelo principal) | Longitud de contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.1B (este) | ~0.17B | 2.048 posiciones | zh, en (principales); de, es, fr, it, ja, ko (experimental) | audio8-community-license-v1.0 | Hugging Face, GitHub |
| IndexTTS2.5 | ~0.8B | no disponible | múltiple (no detallado) | no disponible | no disponible |
| CosyVoice3 | ~1.5B | no disponible | múltiple (no detallado) | no disponible | no disponible |
| VoxCPM2 | ~2.3B | no disponible | múltiple (no detallado) | no disponible | no disponible |
| Fish S2 Pro | ~4.6B | no disponible | múltiple (no detallado) | no disponible | no disponible |

La comparativa se basa exclusivamente en la escala de parámetros reportada en la model card; no se dispone de datos de rendimiento objetivo para una comparación directa. El modelo se destaca por su tamaño significativamente menor que las alternativas listadas.

## Limitaciones y advertencias

- La licencia `audio8-community-license-v1.0` es de tipo "other" y no se detallan sus términos exactos en la información disponible; se recomienda revisar el texto de la licencia en el enlace de Hugging Face antes de uso comercial.
- El soporte para idiomas distintos de chino e inglés (incluido el español) se considera experimental, lo que puede resultar en una calidad de síntesis inferior o artefactos no esperados.
- La clonación de voz requiere un audio de referencia y su transcripción exacta; si el texto no coincide con el audio, la calidad de la clonación se degrada.
- El checkpoint "Pruned" tiene un recuento de parámetros (72M) inferior al reportado (~170M), lo que sugiere una poda adicional; no se proporcionan métricas de calidad para esta variante específica.
- Riesgo de alucinación en la síntesis de voz: el modelo puede generar pronunciaciones incorrectas para nombres propios o términos técnicos, especialmente en idiomas experimentales.
- Sesgos potenciales: no se han documentado sesgos específicos, pero al estar entrenado principalmente en chino e inglés, puede tener un rendimiento inferior en acentos o variedades regionales de otros idiomas.
- La dependencia de código remoto de Transformers (`trust_remote_code=True`) implica ejecutar código externo; se debe revisar el repositorio antes de desplegar en entornos de producción.

## Enlaces

- [Hugging Face: maanka2/Audio8-TTS-Preview-Pruned](https://huggingface.co/maanka2/Audio8-TTS-Preview-Pruned)
- [Hugging Face: Audio8/Audio8-TTS-Preview-0.1b (modelo original)](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b)
- [GitHub: Audio8-AI/Audio8_TTS](https://github.com/Audio8-AI/Audio8_TTS)
- [Demo de audio 0.1B](https://audio8-ai.github.io/Audio8_TTS/0.1B/)
- [Versión ONNX INT8 para CPU](https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8)
- [Guía de ONNX Runtime en CPU](https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime)
- [Licencia audio8-community-license-v1.0](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE)
