# MusicForge/stable-audio-3-small-4bit

## Resumen

Stable-Audio-3-DiT-Small-Music-MLX-4bit es una conversión a MLX del modelo de generación de audio Stable Audio 3 de Stability AI, en su variante optimizada y especializada en música. El paquete incluye el denoiser DiT (Diffusion Transformer) cuantizado a INT4, junto con el códec SAME-S y el codificador de texto T5Gemma en precisión completa. Está publicado por el usuario MusicForge y pensado para ejecución en Apple Silicon mediante el runtime oficial de MLX de Stability AI.

El modelo resuelve la generación de audio condicionada por texto (text-to-audio) mediante difusión latente, con capacidades adicionales de inpainting por máscaras y continuación de audio a partir de un clip corto. La variante Small-Music está especializada en música, mientras que el ecosistema del modelo base ofrece variantes para efectos de sonido (SFX) y un modelo Medium de mayor calidad.

Su relevancia radica en la cuantización INT4 del DiT (50M de parámetros), que reduce el peso del denoiser a 256 MB y permite desplegar el pipeline completo en un portátil con Apple Silicon. El bundle ocupa 1,3 GB en total y mantiene el códec en FP32 porque la atención diferencial de SAME se cancela catastróficamente en FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion con Diffusion Transformer (DiT) como denoiser; códec SAME-S; codificador de texto T5Gemma |
| Parametros totales | DiT Small-Music: 50M (no se especifican los parámetros del códec ni del codificador de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de audio de longitud variable hasta varios minutos) |
| Tipos de cuantizacion | INT4 (group-size 64) para el DiT; FP32 para el códec SAME-S; FP16 para T5Gemma |
| Idiomas soportados | en (inglés) |
| Licencia | Stability AI Community License; el componente T5Gemma hereda además los Gemma Terms of Use |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una difusión latente en la que un Diffusion Transformer actúa como denoiser sobre representaciones latentes de audio. El códec SAME-S convierte audio a latentes y de vuelta a forma de onda estéreo a 44,1 kHz. El condicionamiento por prompt se realiza mediante el codificador de texto T5Gemma (linaje google/t5gemma-b-b-ul2). La variante incluida en este bundle es el DiT Small-Music de 50M de parámetros, cuantizado a INT4 con group-size 64.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de este bundle es la cuantización INT4 del DiT con desquantización en tiempo de carga mediante `mlx.core.dequantize`, manteniendo el códec en FP32 por la sensibilidad de precisión de la atención diferencial de SAME. El runtime de inferencia es el oficial de Stability AI en MLX puro.

## Capacidades

- Generación de audio condicionada por texto (text-to-audio) orientada a música.
- Inpainting y edición de regiones mediante difusión latente con máscaras.
- Continuación de audio a partir de un clip corto de referencia.
- Generación de longitud variable hasta varios minutos.
- Condicionamiento por prompt en inglés mediante T5Gemma.
- Especialización por variante: Small-Music para música, Small-SFX para efectos de sonido y Medium para calidad general (variantes no incluidas en este bundle).
- No se documenta soporte de tool calling, agentes ni otras capacidades multimodales más allá del audio.

## Casos de uso

- Producción musical asistida: generar bocetos de pistas a partir de descripciones textuales en inglés, aprovechando la especialización musical del DiT Small-Music y su capacidad de generar varios minutos de audio.
- Edición de regiones concretas: usar el inpainting por máscaras para reemplazar un fragmento de una pista existente sin regenerar el resto, útil en postproducción de audio.
- Continuación de ideas musicales: extender un clip corto de referencia con audio coherente para completar demos o transiciones.
- Creación de bandas sonoras para vídeo: generar música de fondo de longitud variable ajustada a la duración de un montaje.
- Prototipado rápido en local: ejecutar el pipeline completo en un Mac con Apple Silicon gracias al bundle de 1,3 GB, sin depender de servicios en la nube.
- Diseño de sonido y variaciones: aunque el bundle es musical, el mismo runtime admite variantes SFX para generar efectos a partir de texto.
- Investigación en difusión latente de audio: servir como base cuantizada para experimentos de eficiencia en Apple Silicon con el runtime MLX de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el bundle completo ocupa 1,3 GB en disco; el DiT en INT4 son 256 MB, el códec SAME-S en FP32 unos 413 MB y T5Gemma en FP16 unos 541 MB. La desquantización del DiT a FP16 en tiempo de carga aumenta el uso de memoria respecto al tamaño en disco.
- GPU recomendadas: exclusivamente Apple Silicon (MLX); no está pensado para GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada; el tamaño reducido del bundle permite ejecución en portátiles con Apple Silicon.
- Opciones de despliegue: runtime oficial de Stability AI en MLX (`stable-audio-3/optimized/mlx`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (denoiser) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| stable-audio-3-small-4bit (este) | 50M (DiT Small-Music, INT4) | no disponible | Stability AI Community License | MLX, Apple Silicon |
| stabilityai/stable-audio-3-optimized (base) | no disponible por variante | no disponible | Stability AI Community License | Pesos originales, runtime MLX oficial |
| Variante DiT-Small-SFX | 50M (Small-SFX) | no disponible | Stability AI Community License | Dentro del ecosistema Stable Audio 3 |
| Variante DiT-Medium | no disponible | no disponible | Stability AI Community License | Dentro del ecosistema Stable Audio 3 |

No se dispone de datos de rendimiento comparativo entre variantes ni frente a otros modelos de generación de audio.

## Limitaciones y advertencias

- Solo soporta prompts en inglés; no se documentan otros idiomas.
- Es una variante especializada en música; para efectos de sonido se requiere la variante Small-SFX y para mayor calidad la Medium, no incluidas en este bundle.
- El códec debe permanecer en FP32: la atención diferencial de SAME se cancela en FP16, lo que limita reducciones adicionales de memoria.
- Solo funciona con el runtime MLX de Stability AI en Apple Silicon; no es portable a otros backends sin trabajo adicional.
- El bundle contiene únicamente pesos cuantizados; la inferencia requiere código externo (runtime oficial y clases de modelo).
- Licencia Stability AI Community License: uso comercial permitido hasta el umbral de ingresos definido por Stability AI; el componente T5Gemma añade los Gemma Terms of Use.
- Riesgo de alucinación y de artefactos de audio inherente a los modelos generativos; no se documentan sesgos específicos.
- Sin descargas ni valoraciones en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MusicForge/stable-audio-3-small-4bit
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-optimized
- Paper: https://arxiv.org/abs/2605.17991
- Runtime MLX oficial: https://github.com/Stability-AI/stable-audio-3/tree/main/optimized/mlx
- Codificador de texto: https://huggingface.co/google/t5gemma-b-b-ul2
- SDK speech-swift: https://github.com/soniqo/speech-swift
- Web: https://soniqo.audio
- Blog: https://soniqo.audio/blog
- Licencia: https://stability.ai/license
