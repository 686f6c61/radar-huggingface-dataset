# Prompt-Pirate/comfytts-models

## Resumen

Prompt-Pirate/comfytts-models es un repositorio de HuggingFace que actúa como espejo centralizado de pesos de múltiples motores de síntesis de voz (TTS) diseñados para integrarse con ComfyUI. Lo mantiene Prompt-Pirate (Mark), un creador centrado en audio de voz con IA, y su propósito es distribuir pesos verificados mediante hashes sha256 y tamaños de byte, evitando que cada usuario tenga que descargar cada modelo por separado desde sus repositorios originales.

No se trata de un modelo de IA único, sino de un agregador de pesos de más de una veintena de motores TTS de código abierto, entre los que se incluyen CosyVoice, Kokoro, Zonos, VoxCPM, GPT-SoVITS, Qwen3-TTS, MOSS-TTS, VibeVoice, entre otros. Cada motor mantiene su propia licencia y origen, y el repositorio documenta explícitamente la procedencia de cada conjunto de pesos. El tamaño total del repositorio es de 0,4 GB, lo que indica que no contiene todos los pesos completos de los motores más grandes, sino probablemente versiones cuantizadas o subconjuntos.

La relevancia de este repositorio radica en que simplifica el despliegue de múltiples motores TTS en entornos ComfyUI, con verificación de integridad y trazabilidad de licencias, algo crítico para uso en producción. También incluye una política clara de no re-alojar pesos con acceso restringido (gated), redirigiendo al usuario al repositorio original para aceptar los términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio espejo de pesos de multiples motores TTS (no es un modelo unico) |
| Parametros totales | No disponible (depende del motor; los motores individuales van de 80M a 2B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de audio, no de texto) |
| Tipos de cuantizacion | No disponible (depende del motor; se incluyen formatos ONNX, GGUF y safetensors segun el motor) |
| Idiomas soportados | No disponible (depende del motor; la mayoria soporta multiples idiomas) |
| Licencia | No disponible para el repositorio en si; cada motor tiene su propia licencia (MIT, Apache-2.0, CC-BY-4.0) |
| Formato de pesos | ONNX, GGUF, safetensors (segun el motor; el tag del repo indica onnx) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino que es un mirror de pesos preentrenados de terceros. La model card documenta cada motor incluido, su licencia, el origen y el estado de verificación. Entre los motores alojados se encuentran arquitecturas diversas:

- CosyVoice (FunAudioLLM): modelo TTS basado en transformer con tokenización de audio, licencia Apache-2.0.
- Kokoro (onnx-community): modelo TTS ligero de 82M parámetros en formato ONNX, licencia Apache-2.0.
- Zonos (Zyphra): modelo híbrido (transformer + convolucional) de 0.1B parámetros, licencia Apache-2.0.
- Qwen3-TTS (Alibaba): familia de modelos de 0.6B y 1.7B parámetros con variantes para clonación de voz y diseño de voz, licencia Apache-2.0.
- GPT-SoVITS (RVC-Boss): sistema de clonación de voz basado en GPT + SoVITS, licencia MIT.
- MOSS-TTS (OpenMOSS): familia de modelos TTS con tokenizador de audio propio, licencia Apache-2.0.
- VibeVoice (Microsoft): modelo TTS de 1.5B parámetros, licencia MIT.
- VoxCPM (OpenBMB): modelo TTS basado en CPM, licencia Apache-2.0.

El repositorio no incluye información sobre el entrenamiento de estos modelos, ya que cada uno fue entrenado por sus respectivos equipos. La función del repositorio es puramente distributiva: verifica cada archivo con sha256 y tamaño de byte antes de publicarlo, y mantiene un manifiesto (MANIFEST.json) con los hashes por archivo.

## Capacidades

- Síntesis de voz a partir de texto (TTS) en múltiples idiomas, dependiendo del motor seleccionado.
- Clonación de voz a partir de muestras de audio (motores como GPT-SoVITS, CosyVoice, Qwen3-TTS-CustomVoice).
- Diseño de voz personalizada (Qwen3-TTS-VoiceDesign).
- Generación de voz expresiva con control de emociones y estilos (Zonos, VibeVoice).
- Integración nativa con ComfyUI mediante nodos personalizados (el repositorio incluye pesos para el pack ComfyUI-lethris-dia2, entre otros).
- Verificación de integridad de pesos mediante hashes sha256, lo que garantiza que los archivos no han sido alterados.
- Soporte de formatos optimizados: ONNX para inferencia eficiente en CPU/GPU, GGUF para cuantización ligera (neutts, por ejemplo).

## Casos de uso

- Doblaje y localización de vídeo: un estudio puede usar los motores CosyVoice o VibeVoice para generar voces en varios idiomas a partir de guiones, con control de tono y emoción, e integrarlos en un flujo ComfyUI para postproducción.
- Creación de audiolibros: con Kokoro (82M parámetros) o MOSS-TTS, se puede generar narración de larga duración con bajo coste computacional, ideal para producción masiva en CPU.
- Asistentes de voz personalizados: GPT-SoVITS permite clonar la voz de un usuario con pocos segundos de muestra, lo que habilita asistentes con la voz del propio cliente.
- Generación de voces para videojuegos: Qwen3-TTS-VoiceDesign permite diseñar voces sintéticas con características específicas (edad, timbre, acento) sin necesidad de actores, reduciendo costes de producción.
- Accesibilidad: VoxCPM o Zonos pueden convertir texto en voz para personas con discapacidad visual, con soporte multilingüe y bajo requisito de hardware.
- Testing de interfaces de voz: los equipos de producto pueden generar rápidamente variantes de voz para probar experiencias de usuario en aplicaciones de voz, usando el repositorio como fuente única de pesos verificados.
- Investigación en TTS: el repositorio facilita la comparación de múltiples motores en un mismo entorno, ya que todos los pesos están centralizados y documentados con sus licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de voz (MOS, WER, etc.) ni comparativas entre los motores alojados. Para datos de rendimiento, se debe consultar la documentación de cada motor individual (por ejemplo, las model cards de CosyVoice, Zonos o Qwen3-TTS).

## Requisitos de hardware

- Los requisitos varían significativamente según el motor seleccionado. Motores ligeros como Kokoro (82M) o Soprano (80M) pueden ejecutarse en CPU con 4-8 GB de RAM.
- Motores medianos como CosyVoice (0.5B) o Qwen3-TTS (0.6B-1.7B) requieren al menos 8-16 GB de VRAM en GPU para inferencia en tiempo real; con cuantización ONNX pueden funcionar en GPUs de gama media como RTX 3060 o superior.
- Motores grandes como VibeVoice (1.5B) o MOSS-TTS (2B) necesitan 16-24 GB de VRAM (A100, RTX 4090) para un rendimiento óptimo.
- El repositorio incluye formatos ONNX y GGUF, lo que permite desplegar en CPU con llama.cpp o en GPU con vLLM, TGI o ComfyUI.
- Para uso en producción con ComfyUI, se recomienda una GPU con al menos 12 GB de VRAM y 32 GB de RAM del sistema.
- La latencia típica para motores de 0.5B-1B en GPU moderna es de 0.5-2 segundos por frase de 10 palabras; en CPU puede ser 3-10 veces mayor.

## Comparativa con modelos similares

No existe un repositorio directamente comparable que agregue tantos motores TTS con verificación de integridad y documentación de licencias. Las alternativas más cercanas son:

| Repositorio | Contenido | Licencia | Verificación | Integración ComfyUI |
|---|---|---|---|---|
| Prompt-Pirate/comfytts-models | 20+ motores TTS | Mixta (MIT, Apache-2.0, CC-BY-4.0) | sha256 + tamaño | Sí |
| HuggingFace Hub (búsqueda individual) | Modelos TTS individuales | Varía | No centralizada | No |
| ComfyUI-TTS (repos comunitarios) | 2-5 motores | Varía | No | Sí |

La ventaja de este repositorio es la centralización y la política de no re-alojar pesos gated, lo que reduce riesgos legales. Sin embargo, al ser un mirror, no aporta mejoras de rendimiento ni de calidad sobre los modelos originales.

## Limitaciones y advertencias

- No es un modelo único: el rendimiento y las capacidades dependen completamente del motor que se elija. No hay una API unificada ni un comportamiento consistente entre motores.
- Algunos motores requieren aceptar un gate en el repositorio original antes de poder usar los pesos (orpheus, pocket-clone, sesame). El repositorio no los re-aloja y redirige al usuario al origen.
- Los motores pocket-preset y voxtream están bajo licencia CC-BY-4.0, lo que exige atribución explícita al autor original si se redistribuyen o se construye sobre ellos.
- El repositorio no incluye información sobre sesgos, alucinaciones o limitaciones de idioma de cada motor. El usuario debe consultar la documentación de cada modelo individual.
- El tamaño del repositorio (0.4 GB) sugiere que no contiene todos los pesos completos de los motores más grandes; es posible que falten variantes o versiones completas.
- La fecha de creación (2026-08-29) y la documentación interna indican que es un proyecto activo, pero no hay garantía de mantenimiento a largo plazo.
- Para uso comercial, es imprescindible revisar la licencia de cada motor individual, ya que algunas (como CC-BY-4.0) imponen condiciones de atribución, y otras pueden tener restricciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Prompt-Pirate/comfytts-models
- Perfil del autor en HuggingFace: https://huggingface.co/Prompt-Pirate
- Canal de YouTube de ComfyTTS Studio: https://www.youtube.com/@thepromptpirate
- Patreon de Prompt Pirate: https://www.patreon.com/promptpirate
