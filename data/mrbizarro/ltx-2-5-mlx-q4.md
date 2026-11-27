# Mrbizarro/ltx-2.5-mlx-q4

## Resumen

LTX-2.5 MLX Q4 es una conversión cuantizada a 4 bits del modelo de generación de vídeo LTX-2.5 de Lightricks, adaptada para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX. El autor de la conversión es Mrbizarro, y el paquete está pensado para cargarse directamente en Phosphene, una aplicación de escritorio gratuita y de código abierto para Mac que permite generar vídeo, imagen, audio y voz de forma totalmente local y sin conexión.

El modelo base LTX-2.5 es un diffusion transformer capaz de generar vídeo y su banda sonora de forma conjunta a partir de texto, de una imagen o de audio. Esta versión mantiene el transformer de vídeo y audio cuantizado a 4 bits (group size 64) y el resto de componentes en bf16, con un peso total de aproximadamente 21 GB. Requiere un Mac con al menos 16 GB de memoria unificada, aunque los lienzos grandes (1024x576) necesitan 48 GB o más.

Su relevancia radica en que permite ejecutar generación de vídeo con audio en hardware de consumo Apple sin enviar datos a ningún servidor, algo poco habitual en modelos de esta categoría. La licencia es la LTX-2.x Community License Agreement, con restricciones para entidades con ingresos anuales iguales o superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (vídeo y audio conjuntos), conversión MLX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 64) en el transformer; resto en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | ltx-2.x-community-license-agreement |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer de Lightricks que genera vídeo y audio de forma simultánea. La conversión a MLX mantiene la estructura del modelo original y cuantiza únicamente el transformer de vídeo y audio a 4 bits con group size 64, dejando el conector de texto, los VAE de vídeo y audio, el vocoder y los upscalers en bf16. El paquete incluye además un `duration_head` para predecir la longitud del clip y upscalers latentes espacial (x2) y temporal (x2).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión realizada por el autor consiste únicamente en cambio de layout y cuantización, sin reentrenamiento ni eliminación de componentes, según se indica en el `NOTICE.md` del repositorio. El runtime de referencia es `dgrauet/ltx-2-mlx` (MIT), y el modelo requiere su propio encoder de texto Gemma 4 de 12B (`Mrbizarro/gemma4-12b-ltx25-q4`); el encoder Gemma 3 de LTX-2.3 carga pero interpreta mal los prompts.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Generación de vídeo a partir de audio (audio-to-video).
- Generación conjunta de vídeo y audio desde texto (text-to-audio-video).
- Generación de audio y voz asociada al vídeo mediante VAE de audio y vocoder.
- Upscaling espacial x2 y temporal x2 (duplica resolución y tasa de frames).
- Predicción de duración del clip mediante `duration_head`.
- Ejecución totalmente local y offline en Apple Silicon.
- Soporte de personajes y voces entrenados (recomendado el pack de 8 bits para este fin).

## Casos de uso

- Creación de clips cortos para redes sociales: el modelo genera vídeos de 5 segundos con sonido a 1024x576 en tiempos de entre 1 min 20 s (M5 Max) y 6 min (M4 Pro), adecuado para prototipado rápido de contenido.
- Previsualización de storyboards: a partir de una imagen clave (image-to-video) se pueden generar animaciones preliminares para validar una secuencia antes de producirla con herramientas de mayor coste.
- Doblaje y sincronización de audio: la modalidad audio-to-video permite generar vídeo coherente con una pista de audio existente, útil para locuciones o piezas musicales.
- Generación de vídeo con voz para demos de producto: la capacidad text-to-audio-video permite obtener un clip con narración integrada sin pasar por herramientas externas de TTS.
- Trabajo en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para estudios o investigadores que no pueden enviar material a servicios en la nube.
- Iteración rápida en Mac de desarrollo: con 16 GB de memoria (M5, M4) se pueden generar clips a 768x448 en menos de 11 minutos, lo que permite probar prompts y ajustes sin GPU dedicada.
- Ampliación de resolución y fluidez: el uso de los upscalers espacial y temporal permite partir de un render rápido a baja resolución y escalarlo a posteriori.

## Benchmarks y rendimiento

Datos de renders reales de usuarios de Phosphene (mediana para un clip de 5 segundos con sonido a calidad Balanced, pack base de 4 bits, incluyendo carga del modelo; 36.699 renders en 1.106 Macs entre el 10 de agosto y el 22 de octubre de 2026):

| Mac | Memoria | Lienzo | Tiempo mediano |
|---|---|---|---|
| M5 Max | 64 GB | 1024x576 | 1 min 20 s |
| M3 Ultra | 96 GB | 1024x576 | 1 min 55 s |
| M5 Pro | 48 GB | 1024x576 | 2 min 30 s |
| M4 Max | 64 GB | 1024x576 | 3 min |
| M4 Pro | 48 GB | 1024x576 | 6 min |
| M1 Max | 64 GB | 1024x576 | 5 min 30 s |
| M4 Pro | 24 GB | 768x448 (480p) | 3 min 50 s |
| M5 | 16 GB | 768x448 (480p) | 4 min 55 s |
| M4 | 16 GB | 768x448 (480p) | 10 min 40 s |

No se han publicado resultados de benchmarks académicos (MMLU, VBench u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 21 GB de pesos; se indica funcionamiento desde 16 GB de memoria, con lienzos menores a 48 GB para resoluciones altas.
- GPU recomendadas: chips Apple Silicon de la familia M (M1 a M5, con variantes Pro, Max y Ultra).
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPU NVIDIA.
- Opciones de despliegue: aplicación Phosphene (Mac, o instalación mediante Pinokio), runtime MLX `dgrauet/ltx-2-mlx`, o descarga manual con `hf download` y carga en el runtime.
- Latencia y throughput: según la tabla de benchmarks, entre 1 min 20 s y 10 min 40 s por clip de 5 segundos según chip, memoria y resolución.
- Requiere además el encoder de texto `Mrbizarro/gemma4-12b-ltx25-q4`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 MLX Q4 (este) | no disponible | no disponible | 1 min 20 s a 10 min 40 s por clip de 5 s en Apple Silicon | LTX-2.x Community | Hugging Face, MLX |
| LTX-2.5 MLX Q8 (`Mrbizarro/ltx-2.5-mlx-q8`) | no disponible | no disponible | no disponible | LTX-2.x Community | Hugging Face, MLX |
| LTX-2.5 original (Lightricks) | no disponible | no disponible | no disponible | LTX-2.x Community | Hugging Face |
| LTX-2.3 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés como idioma.
- Requiere hardware Apple Silicon; no es ejecutable en GPU NVIDIA ni en CPU convencional.
- El encoder de texto debe ser Gemma 4 de 12B específico para LTX-2.5; usar el de LTX-2.3 (Gemma 3) produce una lectura incorrecta de los prompts.
- La licencia LTX-2.x Community License Agreement restringe el uso: entidades con ingresos anuales de 10 millones de dólares o más necesitan una licencia de pago de Lightricks para cualquier uso que no sea no comercial.
- Es una obra derivada: debe propagarse la misma licencia con cualquier redistribución.
- No se dispone de información sobre sesgos, tasa de alucinación visual o limitaciones de contexto del modelo base.
- Los tiempos de generación dependen fuertemente del chip y de la memoria disponible; en equipos de 16 GB solo son viables lienzos de 480p.
- Para personajes y voces entrenados se recomienda el pack de 8 bits, no este de 4 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrbizarro/ltx-2.5-mlx-q4
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Código de LTX-2: https://github.com/Lightricks/LTX-2
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Runtime MLX: https://github.com/dgrauet/ltx-2-mlx
- Aplicación Phosphene: https://phosphene.video
- Requisitos en Mac: https://phosphene.video/mac-requirements/
- Benchmarks de Phosphene: https://phosphene.video/benchmarks/
- Repositorio de Phosphene: https://github.com/mrbizarro/Phosphene
- Encoder de texto Gemma 4: https://huggingface.co/Mrbizarro/gemma4-12b-ltx25-q4
- Pack de 8 bits: https://huggingface.co/Mrbizarro/ltx-2.5-mlx-q8
