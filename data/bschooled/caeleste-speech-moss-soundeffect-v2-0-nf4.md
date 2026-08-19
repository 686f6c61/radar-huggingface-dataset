# bschooled/caeleste-speech-moss-soundeffect-v2.0-nf4

## Resumen

`caeleste-speech-moss-soundeffect-v2.0-nf4` es un artefacto de cuantización parcial del modelo de generación de audio `MOSS-SoundEffect-v2.0`, desarrollado por el equipo OpenMOSS (MOSI.AI) y publicado en HuggingFace por el usuario `bschooled`. El modelo original es un pipeline text-to-audio que convierte descripciones en lenguaje natural en efectos de sonido ambientales, urbanos, de criaturas y acciones humanas, con una duración controlable de hasta 30 segundos a 48 kHz. Esta variante cuantizada reduce el peso del text encoder (un `Qwen3ForCausalLM`) de 3,78 GiB a 1,26 GiB mediante cuantización NF4 de 4 bits, manteniendo intactos el transformer de difusión (`WanAudioModel`) y el VAE (`DAC`), que deben cargarse desde el repositorio original.

La relevancia de este artefacto radica en que permite ahorrar aproximadamente 2,5 GiB de VRAM en la parte de codificación de texto, lo que facilita el despliegue en GPUs con memoria limitada, sin necesidad de modificar la arquitectura del pipeline ni sus parámetros de generación. Es una solución práctica para desarrolladores que ya utilizan `MOSS-SoundEffect-v2.0` y buscan optimizar el consumo de memoria sin renunciar a la calidad del modelo completo. No se trata de un modelo independiente, sino de un componente reemplazable dentro del pipeline original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-audio: text encoder `Qwen3ForCausalLM` (cuantizado NF4), transformer `WanAudioModel` (DiT con Flow Matching), VAE `DAC` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el text encoder Qwen3 tiene su propio contexto, no especificado) |
| Tipos de cuantizacion | NF4 (4-bit) con doble cuantizacion y bf16 como dtype de computo, aplicado solo al text encoder |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original `MOSS-SoundEffect-v2.0` es un pipeline de tres componentes: un text encoder basado en `Qwen3ForCausalLM`, un transformer de difusión (`WanAudioModel`) entrenado con el objetivo de Flow Matching, y un VAE basado en DAC (Descriptor Audio Codec) que trabaja en latentes continuos. Esta arquitectura sustituye al backbone autoregresivo de tokens discretos de la versión v1. El text encoder convierte el prompt de texto en embeddings que condicionan el transformer, el cual genera latentes de audio que el VAE decodifica a forma de onda.

Este repositorio en concreto no contiene el modelo completo, sino únicamente el text encoder cuantizado. La cuantización se realizó reemplazando los tensores de peso del text encoder por equivalentes NF4 con doble cuantización y dtype de computo bf16, añadiendo un bloque `quantization_config` al `config.json`. No se modificó la arquitectura, el vocabulario ni los parámetros de generación. El transformer y el VAE no están incluidos y deben descargarse del repositorio original `OpenMOSS-Team/MOSS-SoundEffect-v2.0`. El autor del artefacto intentó cuantizar también el transformer, pero falló debido a que el modelo no materializa sus pesos a través de la ruta de meta-device que usa `diffusers` para la carga cuantizada, por lo que se dejó en precisión completa.

## Capacidades

- Generación de efectos de sonido no verbales a partir de descripciones en lenguaje natural: ambientes, escenas urbanas, criaturas, acciones humanas y clips similares a música.
- Control de duración del audio generado, con soporte de hasta 30 segundos a 48 kHz de frecuencia de muestreo.
- El text encoder cuantizado mantiene las mismas capacidades de comprensión de texto que el original, ya que la cuantización no altera la arquitectura ni el vocabulario.
- No soporta tool calling ni funciones de agente, al ser un modelo de generación de audio y no un LLM conversacional.
- No se especifican capacidades multilingües; el modelo original podría soportar varios idiomas, pero no se indica en la documentación disponible.
- La cuantización NF4 permite cargar el text encoder en GPUs con menos VRAM, manteniendo el resto del pipeline en precisión completa.

## Casos de uso

- Producción audiovisual: generar efectos de sonido ambientales (lluvia, viento, tráfico) para películas, series o documentales, usando prompts descriptivos y ajustando la duración hasta 30 segundos.
- Diseño de sonido para videojuegos: crear efectos de criaturas, pasos, puertas o explosiones de forma procedural, integrando el modelo en un pipeline de generación de assets.
- Publicidad y marketing: producir rápidamente efectos sonoros para anuncios o contenido de redes sociales sin necesidad de librerías de audio preexistentes.
- Podcasts y radio: añadir ambientes sonoros o transiciones a episodios, generando clips de audio personalizados según el guion.
- Prototipado de conceptos: validar ideas de sonido antes de grabarlas o sintetizarlas con herramientas profesionales, reduciendo el tiempo de iteración.
- Despliegue en entornos con recursos limitados: al usar el text encoder cuantizado, se puede ejecutar el pipeline en GPUs con menor VRAM (por ejemplo, RTX 3060 o inferiores) sin degradar la calidad del audio generado, siempre que el transformer y el VAE quepan en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de audio (como FAD, CLAP score, etc.) ni comparaciones con otros modelos text-to-audio. La cuantización del text encoder podría afectar ligeramente la fidelidad de la comprensión del prompt, pero no se aportan datos cuantitativos al respecto.

## Requisitos de hardware

- El text encoder cuantizado ocupa 1,26 GiB en disco y requiere aproximadamente esa cantidad de VRAM para cargarse (más overhead de runtime). El transformer (5,66 GiB) y el VAE (1,49 GiB) del modelo original deben cargarse en precisión completa, por lo que la VRAM total necesaria será la suma de los tres componentes, más el espacio para activaciones.
- Para ejecutar el pipeline completo se recomienda una GPU con al menos 12 GiB de VRAM, aunque no se especifica oficialmente. En GPUs de 8 GiB podría ser ajustado.
- NF4 requiere kernels compatibles: NVIDIA con arquitectura Turing o superior (sm_75+), o AMD ROCm RDNA3, RDNA3.5 y CDNA. En AMD RDNA2 (gfx103x) se necesita la variable `TORCH_BLAS_PREFER_HIPBLASLT=0`.
- El despliegue se realiza mediante la librería `diffusers`, cargando el text encoder desde este repositorio y el resto de componentes desde el upstream. No se mencionan opciones como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput dependen del hardware y de la longitud del audio generado; no se proporcionan estimaciones.

## Comparativa con modelos similares

| Modelo | Text encoder | Transformer | VAE | Licencia | Peso text encoder |
|---|---|---|---|---|---|
| OpenMOSS-Team/MOSS-SoundEffect-v2.0 (original) | Qwen3ForCausalLM (3,78 GiB) | WanAudioModel (DiT) | DAC | apache-2.0 | 3,78 GiB |
| bschooled/caeleste-speech-moss-soundeffect-v2.0-nf4 (este) | Qwen3ForCausalLM NF4 (1,26 GiB) | WanAudioModel (no incluido) | DAC (no incluido) | apache-2.0 | 1,26 GiB |

No se dispone de información sobre otros modelos text-to-audio comparables en la misma categoría (por ejemplo, AudioLDM 2 o Stable Audio) en los resultados de búsqueda, por lo que la comparativa se limita al modelo original. La principal diferencia es el ahorro de memoria en el text encoder, sin cambios en la arquitectura ni en el resto de componentes.

## Limitaciones y advertencias

- Este repositorio no es un modelo autónomo: solo contiene el text encoder cuantizado. El transformer y el VAE deben descargarse por separado del repositorio original, lo que añade complejidad al despliegue.
- La cuantización NF4 puede introducir una ligera degradación en la calidad de la representación del texto, aunque no se han publicado evaluaciones que cuantifiquen este impacto.
- El autor del artefacto no pudo cuantizar el transformer debido a un error de `diffusers` con meta tensores; por tanto, el ahorro de memoria se limita al text encoder, y el resto del pipeline sigue requiriendo la VRAM original.
- No hay garantía de compatibilidad con versiones futuras de `diffusers` o `transformers`, ya que la cuantización depende de `bitsandbytes` y de la ruta de carga específica.
- La licencia apache-2.0 permite uso comercial, pero se deben conservar los avisos de copyright y atribución del modelo original y de este artefacto.
- No se especifican los idiomas soportados por el text encoder; si el modelo original tiene limitaciones lingüísticas, estas se mantienen en la versión cuantizada.

## Enlaces

- Repositorio HuggingFace de este artefacto: https://huggingface.co/bschooled/caeleste-speech-moss-soundeffect-v2.0-nf4
- Modelo original en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-SoundEffect-v2.0
- Repositorio GitHub de la familia MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Página del modelo en ModelScope (v2.0): https://www.modelscope.cn/models/openmoss/MOSS-SoundEffect-v2.0
- Página del modelo en ModelScope (v1): https://www.modelscope.cn/models/openmoss/MOSS-SoundEffect
