# maanka2/Audio8-TTS-Preview-0.1b-moss

## Resumen

Audio8 TTS Preview 0.1B es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Audio8 AI. El checkpoint que nos ocupa es una copia (mirror) publicada por el usuario maanka2 en Hugging Face, con el identificador `maanka2/Audio8-TTS-Preview-0.1b-moss`. El modelo se presenta como el TTS zero-shot más compacto que merece la pena ejecutar, con un modelo principal de aproximadamente 170 millones de parámetros y un decodificador de codec de unos 120 millones, lo que lo sitúa muy por debajo de otros sistemas multilingües modernos como CosyVoice3 (~1.5B) o Fish S2 Pro (~4.6B).

La arquitectura, denominada Audio8 Falcon H1, combina dos ramas autoregresivas: una rama lenta que predice tokens semánticos y una rama rápida que predice los codebooks del codec neuronal, condicionada por el estado oculto de la rama lenta. El modelo soporta 8 idiomas, con chino e inglés como idiomas principales y alemán, español, francés, italiano, japonés y coreano en modo experimental. La ventana de contexto es de hasta 2.048 posiciones empaquetadas de texto y audio.

La relevancia de este modelo radica en su tamaño reducido, que permite ejecutar clonación de voz zero-shot en hardware modesto, incluso en CPU mediante una versión ONNX INT8 que ocupa alrededor de 0,4 GiB tras cargar. Esto lo convierte en una opción práctica para despliegues con recursos limitados, aunque el autor advierte que la calidad no es idéntica en todos los idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio8 Falcon H1 (rama lenta autoregresiva de 24 capas, ancho 512, 8 cabezas de atención, 2 cabezas KV; rama rápida de 4 capas, ancho 512, 8 cabezas, 2 cabezas KV) |
| Parámetros totales | 55.197.760 (según safetensors del repo); el autor reporta ~170M para el modelo principal y ~120M para el codec decoder, total aproximado ~290M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantización | ONNX INT8 (modelo separado, disponible en `Audio8/audio8-TTS-0.1B-ONNX-INT8`); codec en FP16 |
| Idiomas soportados | zh, en, de, es, fr, it, ja, ko (chino e inglés principales; el resto experimental) |
| Licencia | audio8-community-license-v1.0 (licencia personalizada, "other") |
| Formato de pesos | safetensors (modelo principal); codec en `codec.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura propietaria denominada Audio8 Falcon H1 con dos ramas autoregresivas. La rama lenta (Slow AR) consta de 24 capas con ancho 512, 8 cabezas de atención y 2 cabezas KV, y se encarga de predecir tokens semánticos. La rama rápida (Fast AR) tiene 4 capas con las mismas dimensiones de ancho y cabezas, y predice los 10 codebooks del codec neuronal condicionados al estado oculto de la rama lenta. El codec opera a 44.1 kHz con 2.048 muestras por frame (~21.5 frames/s) y cada codebook tiene 4.096 entradas. El decodificador del codec es un componente separado de aproximadamente 120M de parámetros, incluido en el archivo `codec.pth`, por lo que no se necesita ningún checkpoint adicional.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas de ajuste como RLHF o DPO. El autor menciona que es un "checkpoint mixto v4" y que existe un pipeline de fine-tuning SFT independiente en el repositorio de GitHub, pero no se proporcionan más datos sobre la fase de entrenamiento. La arquitectura de dos ramas autoregresivas es una innovación notable para reducir el coste computacional frente a modelos que predicen todos los codebooks de forma secuencial.

## Capacidades

- Generación de voz natural a partir de texto en 8 idiomas: chino, inglés, alemán, español, francés, italiano, japonés y coreano (los seis últimos en modo experimental).
- Clonación de voz zero-shot: es capaz de imitar la voz de un hablante a partir de un audio de referencia y su transcripción, sin necesidad de fine-tuning.
- Soporte multilingüe con calidad variable: el autor advierte que la calidad es consistente en chino e inglés, mientras que el resto de idiomas son evaluaciones experimentales.
- No soporta tool calling ni funciones de agente; es un modelo exclusivamente de síntesis de voz.
- No incluye capacidades de visión ni de procesamiento de audio más allá de la síntesis y el codec.

## Casos de uso

- Clonación de voz para audiolibros y podcasts: el modelo puede replicar la voz de un narrador a partir de una muestra corta, lo que permite generar audiolibros con una voz consistente sin necesidad de grabar horas de estudio.
- Asistentes virtuales multilingües: al soportar 8 idiomas, puede generar respuestas de voz en el idioma del usuario en sistemas de atención al cliente o asistentes domésticos, con una huella de memoria muy reducida.
- Doblaje automático de contenido: dado un audio de referencia y su transcripción, se puede doblar vídeos o películas a otros idiomas manteniendo las características vocales del actor original, aunque la calidad en idiomas experimentales puede ser inferior.
- Accesibilidad y lectores de pantalla: su pequeño tamaño permite ejecutarlo en dispositivos con recursos limitados (CPU, incluso Raspberry Pi) para convertir texto en voz de forma natural en aplicaciones de accesibilidad.
- Sistemas IVR (Interactive Voice Response): en centros de atención telefónica, se puede generar mensajes personalizados con una voz corporativa clonada a partir de una muestra, reduciendo costes de grabación.
- Generación de contenido educativo: para crear lecciones o explicaciones en audio en múltiples idiomas, especialmente útil en plataformas de e-learning donde se necesita una voz consistente y natural.
- Juegos y personajes virtuales: en desarrollo de videojuegos, se puede clonar la voz de un actor para generar líneas de diálogo adicionales sin volver a grabar, aunque con cuidado de la licencia y la propiedad de la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de calidad objetiva (como MOS, MMLU, etc.) en la model card ni en el repositorio. La comparación de escala en la documentación es solo de tamaño de parámetros, no de rendimiento. Por lo tanto, no es posible evaluar el modelo frente a alternativas en términos de calidad de síntesis.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica un valor exacto. El modelo principal (170M) y el codec decoder (120M) se pueden ejecutar en GPU con al menos 4 GB de VRAM en FP16, aunque se recomienda probar con 6-8 GB para contexto largo.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A100, H100). En CPU, se puede usar la versión ONNX INT8 que ocupa aproximadamente 0,4 GiB tras cargar.
- En consumer GPU: sí, cabe en GPU de gama media como RTX 3060 o superior. El autor recomienda Python 3.11 o superior y CUDA para un rendimiento óptimo.
- Opciones de despliegue: se puede usar directamente con Transformers (`trust_remote_code=True`), o con la versión ONNX INT8 para CPU (ONNX Runtime, sin dependencia de PyTorch). También se incluyen herramientas CLI, servidor web y servicio HTTP en el repositorio de GitHub.
- Latencia y throughput: no se proporcionan métricas oficiales. En CPU ONNX INT8, la síntesis es funcional pero con latencia moderada; en GPU con bfloat16 es notablemente más rápida, aunque no hay datos numéricos publicados.

## Comparativa con modelos similares

| Modelo | Escala del modelo principal (reportada) | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Audio8 TTS Preview 0.1B** | ~0.17B | 2.048 posiciones | 8 idiomas (2 principales) | audio8-community-license-v1.0 | Hugging Face, código abierto |
| Audio8 TTS Preview 0.6B | ~0.6B | no disponible | 8 idiomas | audio8-community-license-v1.0 | Hugging Face |
| IndexTTS2.5 | ~0.8B | no disponible | multilingüe | no disponible | Hugging Face |
| CosyVoice3 | ~1.5B | no disponible | multilingüe | no disponible | Hugging Face |
| VoxCPM2 | ~2.3B | no disponible | multilingüe | no disponible | Hugging Face |
| Fish S2 Pro | ~4.6B | no disponible | multilingüe | no disponible | Hugging Face |
| Higgs Audio v2 | ~4.7B | no disponible | multilingüe | no disponible | Hugging Face |
| MOSS-TTS | ~8.5B | no disponible | multilingüe | no disponible | Hugging Face |

Nota: la tabla de escala proviene de la documentación del autor y es una referencia aproximada, no un recuento auditado de parámetros. No se dispone de datos de calidad comparativos.

## Limitaciones y advertencias

- El modelo es un checkpoint "preview" (versión preliminar), no una versión estable. El autor advierte que la calidad no es idéntica en todos los idiomas; los idiomas distintos de chino e inglés son experimentales.
- La licencia `audio8-community-license-v1.0` es una licencia personalizada ("other") que debe revisarse antes de cualquier uso comercial. No se trata de una licencia estándar como MIT o Apache 2.0.
- No se han publicado benchmarks de calidad, por lo que no es posible validar objetivamente su rendimiento frente a alternativas.
- El modelo tiene un contexto limitado de 2.048 posiciones empaquetadas, lo que puede restringir la síntesis de textos muy largos o diálogos extensos sin segmentación previa.
- El mirror de maanka2 tiene 0 descargas y 0 likes, y no se garantiza que sea un mantenimiento del original; se recomienda usar el repositorio oficial de Audio8 (`Audio8/Audio8-TTS-Preview-0.1b`) para entornos de producción.
- La clonación de voz puede implicar riesgos legales y éticos si se usa con voces de personas reales sin consentimiento explícito. La licencia comunitaria puede incluir restricciones adicionales al respecto.
- El modelo usa código remoto (`trust_remote_code=True`), lo que implica ejecutar código arbitrario de Hugging Face; es necesario revisar el código antes de usarlo en entornos con políticas de seguridad estrictas.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/maanka2/Audio8-TTS-Preview-0.1b-moss
- Modelo original en Hugging Face: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo con muestras de audio: https://audio8-ai.github.io/Audio8_TTS/0.1B/
- Versión ONNX INT8 para CPU: https://huggingface.co/Audio8/audio8-TTS-0.1B-ONNX-INT8
- Licencia: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b/blob/main/LICENSE
