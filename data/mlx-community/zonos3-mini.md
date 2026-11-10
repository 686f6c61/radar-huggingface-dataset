# mlx-community/ZONOS3-Mini

## Resumen

ZONOS3-Mini es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado originalmente por Zyphra y portado a MLX por la comunidad mlx-community para su ejecución eficiente en hardware Apple Silicon. Se trata de un modelo compacto, con 254.659.944 parámetros totales en los pesos safetensors (100 millones de parámetros activos según la model card), capaz de generar audio mono a 44,1 kHz con 27 voces integradas, síntesis en streaming y clonación de voz a partir de audio de referencia sin necesidad de transcripción.

El modelo resuelve el problema de la generación de voz natural y de baja latencia en entornos locales, sin depender de servicios en la nube. Su tamaño reducido y su licencia Apache 2.0 lo hacen especialmente atractivo para integraciones en aplicaciones de escritorio, asistentes personales y pipelines de accesibilidad sobre Macs con chip M-series, donde MLX aprovecha la memoria unificada.

La relevancia actual del modelo radica en la combinación de clonación de voz zero-shot, control acústico fino (loudness, fmax, velocidad de habla) y streaming incremental, todo ello en un paquete de 1,4 GB que cabe en memoria de sistemas consumer. El repositorio de mlx-community es un fine-tune/port del modelo base Zyphra/ZONOS3-Mini, adaptado a la librería mlx-audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Gated DeltaNet (kernel con código MIT de Apple), con backbone, códec y speaker encoder adaptados de la implementación de referencia de Zyphra |
| Parámetros totales | 254.659.944 |
| Parámetros activos | 100 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo ocupa 1,4 GB) |
| Idiomas soportados | multilingüe (la model card indica "multilingual" sin listar idiomas concretos); normalización numérica ligera solo para inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de audio | 44,1 kHz mono |
| Voces integradas | 27 |
| Dimensión de speaker embedding | 192 |

## Arquitectura y entrenamiento

El modelo se apoya en una arquitectura de backbone basada en Gated DeltaNet, un mecanismo de atención lineal recurrente que el kernel implementa con código MIT de Apple, también presente en mlx-lm. Sobre ese backbone se acoplan un códec de audio y un speaker encoder, ambos adaptados de la implementación de referencia de Zyphra (licencia MIT). La generación de audio se realiza en filas de audio retardadas a una tasa de 15 Hz, controlable mediante el parámetro `max_tokens`.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card menciona capacidades de clonación de voz sin transcripción y control acústico mediante `condition_values` (loudness, fmax, speaking_rate) o `condition_buckets`, lo que sugiere un condicionamiento explícito sobre atributos acústicos durante el entrenamiento. La normalización de números solo está implementada para inglés; el resto de idiomas se procesan tal cual se escriben.

## Capacidades

- Síntesis de voz multilingüe a 44,1 kHz mono con 27 voces integradas seleccionables por nombre (por ejemplo, `jett`).
- Clonación de voz zero-shot a partir de audio de referencia, sin necesidad de transcripción del audio de referencia.
- Generación en streaming con `stream=True` y control del intervalo mediante `streaming_interval` en segundos.
- Control de velocidad de habla mediante el parámetro `speed`.
- Control acústico fino mediante `condition_values` (loudness, fmax, speaking_rate) o `condition_buckets`.
- Guiado de hablante ajustable con `speaker_cfg_scale` (por defecto 1.0).
- Aceptación de speaker embeddings de 192 dimensiones como vector o fichero NumPy.
- Generación sin prompt de hablante con `voice="none"`.
- Normalización ligera de números en inglés activada por defecto; desactivable con `text_normalization=False`.
- No expone edición de habla, adaptadores de acento, steering de hidden states ni codificación cruda de referencia en esta implementación.

## Casos de uso

- Asistentes de voz locales en macOS: el modelo se ejecuta sobre MLX en Apple Silicon aprovechando la memoria unificada, permitiendo síntesis en tiempo real sin conexión a internet para asistentes personales o de escritorio.
- Clonación de voz para accesibilidad: usuarios con dificultades del habla pueden generar audio con una voz personalizada a partir de una muestra de referencia, sin necesidad de transcribirla, gracias a la clonación zero-shot.
- Generación de audiolibros y contenido largo: el streaming incremental con `streaming_interval` permite emitir audio conforme se sintetiza, reduciendo la latencia percibida en la reproducción de textos extensos.
- Doblaje y localización de contenido: el soporte multilingüe y el control de velocidad (`speed`) facilitan adaptar la locución a distintos idiomas y duraciones objetivo.
- Prototipado de interfaces conversacionales: los 27 voices integrados y el control acústico (`loudness`, `fmax`, `speaking_rate`) permiten generar múltiples variantes de locución para pruebas A/B de UX de voz.
- Integración en pipelines de CI/CD para pruebas de audio: el tamaño compacto (1,4 GB) y la licencia Apache 2.0 permiten generar fixtures de audio reproducibles en entornos de integración sin costes de API.
- Sistemas de alertas y notificaciones habladas: la baja huella de memoria y el streaming permiten sintetizar mensajes cortos en dispositivos con recursos limitados dentro del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 1,4 GB en safetensors; la inferencia requiere cargar los 254,6 M de parámetros más el códec y el speaker encoder, por lo que se estima un consumo de memoria del orden de 2-3 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) al estar implementado sobre MLX; no se documenta soporte para GPUs NVIDIA o AMD en esta implementación.
- Cabe en GPU consumer: sí, en cualquier Mac con chip M-series con al menos 8 GB de memoria unificada; el tamaño del repo (1,4 GB) lo permite holgadamente.
- Opciones de despliegue: librería `mlx-audio` con CLI (`python -m mlx_audio.tts.generate`) y API Python (`mlx_audio.tts.load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo TTS sobre MLX.
- Latencia y throughput: no disponibles. El streaming con `streaming_interval` permite reducir la latencia percibida, pero no se publican cifras de RTF (real-time factor) ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Audio | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ZONOS3-Mini (mlx-community) | 254,6 M totales / 100 M activos | no disponible | 44,1 kHz mono | Sí, sin transcripción | Apache 2.0 | Hugging Face (MLX) |
| Zyphra/ZONOS3-Mini (base) | 100 M activos | no disponible | 44,1 kHz mono | Sí, sin transcripción | Apache 2.0 | Hugging Face |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva este port.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como todo modelo TTS entrenado con datos de voz, puede reproducir sesgos de acento, género o prosodia presentes en el corpus de entrenamiento.
- Riesgo de alucinación: en TTS el riesgo se traduce en artefactos de audio, pronunciaciones incorrectas o prosodia anómala, especialmente en textos con números, siglas o idiomas distintos del inglés, ya que la normalización numérica solo está implementada para inglés.
- Limitaciones de idioma: la model card indica "multilingual" pero no lista los idiomas soportados; fuera del inglés, los números se procesan tal cual se escriben, lo que puede degradar la naturalidad.
- Restricciones de licencia: los pesos son Apache 2.0, pero el backbone, códec y speaker encoder derivan de la implementación MIT de Zyphra y el kernel Gated DeltaNet incluye código MIT de Apple; es necesario conservar los avisos de licencia correspondientes en redistribuciones.
- Limitaciones de la implementación: no se exponen edición de habla, adaptadores de acento, steering de hidden states ni codificación cruda de referencia; estas capacidades del modelo base no están disponibles en este port.
- Compatibilidad de hardware: al estar basado en MLX, solo se ejecuta en hardware Apple Silicon; no es desplegable en GPUs NVIDIA/AMD ni en servidores x86 convencionales sin una implementación alternativa.
- Entradas de audio de referencia: las rutas se remuestrean automáticamente, pero los arrays deben ser PCM mono a 44.100 Hz, lo que exige preprocesado si se integra con otras fuentes de audio.
- Uso comercial: permitido bajo Apache 2.0, pero conviene verificar las licencias de las dependencias (mlx-audio, mlx-lm, kernel de Apple) antes de distribuir productos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/ZONOS3-Mini
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Implementación de referencia de Zyphra: https://github.com/Zyphra/ZONOS3-Mini
- Licencia MIT de la implementación de referencia: https://github.com/Zyphra/ZONOS3-Mini/blob/6ff97cac0c684732de5f2bc6e3671aa783c15054/LICENSE
- Licencia de mlx-lm (kernel Gated DeltaNet de Apple): https://github.com/ml-explore/mlx-lm/blob/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
