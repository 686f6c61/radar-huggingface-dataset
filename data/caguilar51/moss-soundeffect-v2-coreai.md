# caguilar51/MOSS-SoundEffect-v2-CoreAI

## Resumen

MOSS-SoundEffect-v2-CoreAI es un paquete de recursos experimental de Core AI, junto con un runtime nativo en Swift, que empaqueta el modelo de generación de efectos de sonido MOSS-SoundEffect v2.0 de OpenMOSS. El proyecto lo desarrolla caguilar51 y tiene como objetivo ejecutar el modelo de forma totalmente local en Macs con Apple silicon, sin necesidad de servicios en la nube ni de entornos Python. Es relevante porque acerca el modelo original a un ecosistema nativo de Apple, permitiendo a los desarrolladores integrar generación de audio en aplicaciones macOS mediante el framework Core AI.

La arquitectura subyacente es un Diffusion Transformer (DiT) entrenado con el objetivo Flow Matching, emparejado con un VAE DAC y un codificador de texto Qwen3-1.7B. El bundle contiene tres componentes materializados como `.aimodel` (codificador de texto, denoiser y decodificador DAC) más el tokenizer necesario. El repositorio ocupa 6,4 GB y genera audio mono PCM a 48 kHz de hasta 30 segundos. El estado del proyecto es experimental y está pensado para macOS 27 / Xcode 27.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con Flow Matching, DAC VAE y codificador de texto Qwen3-1.7B |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Float16 (text encoder y decoder), pesos MLX affine-INT4 (denoiser) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Core AI) dentro de un bundle `.sfxasset` |

## Arquitectura y entrenamiento

El modelo base es MOSS-SoundEffect v2.0 de OpenMOSS, un modelo text-to-audio con backbone DiT entrenado con Flow Matching, que utiliza un VAE DAC para la decodificación de audio y un codificador de texto Qwen3-1.7B. El bundle Core AI reconstruye los pesos efectivos del DiT en un grafo de Core AI, preservando el comportamiento del modelo MLX publicado. El codificador de texto se materializa como un `TextEncoder.aimodel` en Float16 sin comprimir, el denoiser se implementa como un grafo Float16 de Core AI que utiliza pesos MLX affine-INT4, y el decodificador DAC se incluye como un `DACDecoder.aimodel` en Float16.

No se proporcionan detalles sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO. La innovación principal de este paquete no está en el entrenamiento, sino en la conversión y empaquetado del modelo para ejecutarse de forma nativa en Core AI, con un runtime Swift que permite generar efectos de sonido a partir de descripciones de texto directamente en un Mac.

## Capacidades

- Generación de efectos de sonido a partir de descripciones de texto (text-to-audio), como ambientes de cafetería, lluvia o conversaciones de fondo.
- Salida de audio mono PCM a 48 kHz, con una duración máxima de 30 segundos por generación.
- Ejecución local en Macs con Apple silicon, utilizando la GPU (no se reclama ejecución en Neural Engine).
- Integración nativa con Core AI y un runtime Swift disponible como CLI, que permite invocar el modelo desde aplicaciones o scripts.
- Reconstrucción de pesos del modelo MLX original en un grafo Core AI, con validación de fidelidad mediante métricas como PSNR.
- No se han confirmado capacidades de tool calling, agentes, visión o entrada de audio; el modelo está especializado en generación de efectos de sonido desde texto.

## Casos de uso

- Producción de audio para vídeo: los creadores pueden generar ambientes sonoros personalizados (lluvia, café, tráfico) directamente en un Mac, sin depender de librerías de audio comerciales ni de servicios en la nube, lo que agiliza el flujo de trabajo en postproducción.
- Diseño de sonido para juegos: permite crear efectos de sonido procedurales a partir de descripciones de texto, con salida a 48 kHz apta para integrarse en motores de juego y prototipos rápidos en macOS.
- Podcasts y producción radiofónica: los productores pueden obtener fondos sonoros específicos, como murmullos de multitud o ambientes de oficina, con una sola línea de texto, reduciendo el tiempo de búsqueda en librerías de audio.
- Prototipado de experiencias inmersivas (VR/AR): el modelo genera paisajes sonoros para demos en macOS, aprovechando la ejecución local y la baja latencia al no depender de servicios externos.
- Automatización de contenido para redes sociales: en flujos de producción de vídeos cortos, se pueden generar efectos de sonido personalizados para cada clip sin salir del ecosistema Apple, mediante el CLI de Swift.
- Investigación en generación de audio: el bundle sirve como referencia para estudiar la conversión de modelos MLX a Core AI y validar la fidelidad de la reconstrucción, gracias a las métricas de validación publicadas (PSNR, similitud coseno).
- Postproducción de cine independiente: los equipos reducidos pueden reemplazar efectos de sonido genéricos por sonidos generados a medida según el guion, sin costes de licencias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye las siguientes métricas de validación técnica:

| Metrica | Resultado |
|---|---|
| Denoiser pass contra MLX | 58,75 dB PSNR |
| Swift/Core AI stride correction (20-step latent cosine) | 0,9988 |
| Escucha dirigida en cafe y lluvia | aceptada |
| Smoke test de la API Swift del `.sfxasset` materializado | superado |
| Colocacion de compute medida | GPU |
| Suite completa de candidatos exactos y revision ciega | pendiente |

## Requisitos de hardware

- Se requiere un Mac con Apple silicon y macOS 27 / Xcode 27 para ejecutar el bundle.
- El repositorio ocupa 6,4 GB en disco; no se especifica la VRAM necesaria.
- La ejecución se realiza en la GPU integrada de Apple silicon; no se reclama compatibilidad con Neural Engine.
- El despliegue se realiza mediante el runtime Swift de Core AI, compilando el CLI desde el repositorio de GitHub. No se soportan vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Ejecucion | Licencia | Estado |
|---|---|---|---|---|
| caguilar51/MOSS-SoundEffect-v2-CoreAI | `.aimodel` (Core AI) en bundle `.sfxasset` | macOS con Apple silicon (Core AI) | Apache-2.0 | Experimental |
| OpenMOSS-Team/MOSS-SoundEffect-v2.0 | no disponible (modelo fuente) | Entorno Python (recomendado Python 3.12) | Apache-2.0 | Publicado |
| mlx-community/MOSS-SoundEffect-v2.0-4bit | MLX 4-bit | macOS con MLX | Apache-2.0 | Publicado |

El modelo Core AI es una variante experimental que añade un runtime Swift y un empaquetado específico para Core AI, mientras que el modelo original y su conversión MLX son más flexibles en cuanto a entornos de ejecución. No se dispone de datos de parámetros ni de contexto para comparar directamente con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado experimental: no es una versión estable; se publica como una release preliminar para macOS 27 / Xcode 27.
- La suite completa de candidatos exactos y la revisión ciega siguen pendientes, por lo que la fidelidad respecto al modelo original no está completamente garantizada.
- La ejecución se mide en GPU; no se reclama ejecución en Neural Engine.
- La salida está limitada a 30 segundos de audio mono a 48 kHz.
- Los idiomas soportados no están documentados; aunque el codificador Qwen3 es multilingüe, no se confirma el comportamiento con prompts en idiomas distintos al inglés.
- El bundle es una reconstrucción de pesos MLX en un grafo Core AI, con una diferencia medida de 58,75 dB PSNR en el denoiser, lo que implica que no es una copia bit a bit del modelo original.
- Depende de herramientas de desarrollador de Apple y del runtime `coreai-models` (BSD-3-Clause), que no se incluyen en el repositorio del modelo.
- La licencia Apache-2.0 permite uso comercial, pero la integración con Apple requiere cumplir los términos de las herramientas de desarrollo de Apple.

## Enlaces

- HuggingFace: https://huggingface.co/caguilar51/MOSS-SoundEffect-v2-CoreAI
- GitHub del proyecto: https://github.com/caguilar-dev/moss-soundeffect-coreai
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-SoundEffect-v2.0
- Conversión MLX 4-bit: https://huggingface.co/mlx-community/MOSS-SoundEffect-v2.0-4bit
- Repositorio OpenMOSS/MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS/tree/main/moss_soundeffect_v2
- Documentación de moss_soundeffect_v2: https://github.com/zenghui-li/moss-tts/blob/main/moss_soundeffect_v2/README.md
