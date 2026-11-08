# SeeSee21/LTX-See-Motion

## Resumen

LTX See Motion es un checkpoint personalizado de generación de vídeo a partir de imagen (image-to-video) construido sobre Lightricks/LTX-2.3, publicado por el usuario SeeSee21 en Hugging Face. Se distribuye como un único archivo `LTX-See-Motion-v1-no-distill.safetensors` de 34,3 GB en formato FP8 mixto, pensado para cargarse en ComfyUI como checkpoint. El autor lo describe como una mezcla ajustada de LTX-2.3, construida a su vez sobre las bases de 10Eros v1.2 y sulphur dev, sin LoRAs ni destilación incorporadas en los pesos.

El modelo está específicamente orientado a preservar la fidelidad de la imagen de entrada y a generar movimiento realista, con especial énfasis en movimiento humano, baile y canto con sincronización labial. Según la model card, es capaz de producir clips de hasta 15 segundos (y ejemplos de hasta 3 minutos) sin necesidad de LoRAs adicionales para baile o canto. No está pensado para text-to-video puro: el autor indica explícitamente que hay que alimentarlo siempre con una imagen.

El checkpoint está marcado como contenido para adultos (`not-for-all-audiences`, etiqueta `nsfw`) y el autor advierte que está afinado para anatomía adulta. La licencia es la LTX-2 Community License, heredada del modelo base, lo que condiciona su uso comercial. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño total de 0,2 GB (el peso principal se referencia externamente o se distribuye por otras vías como Civitai).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LTX-2.3; el autor no detalla la arquitectura interna) |
| Parametros totales | no disponible (el nombre del LoRA oficial asociado sugiere una base de 22B, pero no se confirma para este checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 mixto (formato de distribucion del checkpoint) |
| Idiomas soportados | en (inglés) |
| Licencia | LTX-2 Community License (`ltx-2-community-license`) |
| Formato de pesos | safetensors (`LTX-See-Motion-v1-no-distill.safetensors`, 34,3 GB) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna del modelo. El autor indica que es un checkpoint de tipo "merge" sobre Lightricks/LTX-2.3, construido sobre la base de 10Eros v1.2 y sulphur dev, y que no incorpora LoRAs ni destilación en los pesos. El archivo se distribuye en FP8 mixto, lo que reduce el peso respecto a una versión BF16 completa.

El flujo de uso previsto combina el checkpoint con el LoRA destilado oficial `ltx-2.3-22b-distilled-lora-384-1.1` a fuerza 0,8 para el modo rápido (8 + 4 pasos, CFG 1.0), y con el text encoder Gemma 3 12B IT FP8. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El autor tampoco documenta innovaciones técnicas propias más allá del ajuste de la mezcla.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video), con énfasis en mantener la fidelidad a la imagen de entrada.
- Generación de vídeo a partir de vídeo (video-to-video).
- Generación de vídeo a partir de audio + imagen (audio + image-to-video), con sincronización labial en los ejemplos mostrados.
- Baile y canto sin LoRAs adicionales, según el autor.
- Producción de clips de hasta 15 segundos en modo rápido y ejemplos de hasta 3 minutos.
- Soporte de prompts descriptivos centrados en "qué se mueve" en la escena.
- No soporta text-to-video puro de forma fiable: el autor indica que siempre hay que proporcionar una imagen.
- Capacidades multilingües: solo inglés declarado (`language: en`).
- No se documentan tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo de generación de vídeo).

## Casos de uso

- Animación de retratos y personajes a partir de una sola imagen: el checkpoint está afinado para preservar la identidad de la imagen de entrada, por lo que sirve para dar movimiento a un retrato fijo manteniendo rasgos y vestuario.
- Generación de vídeos musicales con canto sincronizado: el ejemplo del "elfo cantante" muestra una canción completa con sincronización labial y movimiento natural, útil para prototipos de videoclips o contenido musical generado.
- Baile y coreografías sin LoRAs adicionales: adecuado para producir clips de baile a partir de una imagen de referencia sin encadenar LoRAs específicos.
- Video-to-video para estilización o retoque de metraje existente: permite partir de un vídeo y regenerarlo manteniendo la estructura de movimiento.
- Doblaje o lip-sync sobre imagen + audio: la combinación audio + imagen permite alinear el movimiento de la boca con una pista de audio dada.
- Prototipado rápido en ComfyUI: al cargarse como checkpoint en `models/checkpoints/` y combinarse con el LoRA destilado oficial, encaja en flujos de trabajo de ComfyUI para iterar prompts de movimiento con tiempos de generación de 300–400 s por clip de 15 s en una RTX 5060 Ti de 16 GB.
- Contenido para adultos con anatomía consistente: el autor lo presenta como afinado para trabajo de movimiento adulto, con la advertencia de uso responsable y legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint pesa 34,3 GB en FP8 mixto, por lo que la carga completa de pesos requiere al menos esa cantidad de memoria, aunque no se documenta el pico real de inferencia.
- GPU de referencia del autor: RTX 5060 Ti de 16 GB, con tiempos de 300–400 s para un clip de 15 s a aproximadamente 1 MP en modo rápido (8 + 4 pasos, CFG 1.0).
- No se documentan pruebas en A100, H100 ni RTX 4090.
- Opciones de despliegue: ComfyUI (flujo principal documentado, con el checkpoint en `models/checkpoints/` y el LoRA destilado en `models/loras/`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vídeo).
- Text encoder requerido: Gemma 3 12B IT FP8.
- Latencia y throughput: solo el dato del autor para RTX 5060 Ti 16 GB (300–400 s por clip de 15 s a ~1 MP en modo rápido).

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX See Motion (este) | LTX-2.3 (merge) | Checkpoint image-to-video | Clips de hasta 15 s (ejemplos de hasta 3 min) | LTX-2 Community License | Hugging Face, Civitai, Tensor.Art |
| Lightricks/LTX-2.3 | — | Modelo base oficial | no disponible | LTX-2 Community License | Hugging Face |
| 10Eros v1.2 | — | Base de la mezcla | no disponible | no disponible | no disponible |
| sulphur dev | — | Base de la mezcla | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el checkpoint está marcado como `nsfw` y `not-for-all-adult-audiences`; el autor advierte que está afinado para anatomía adulta y no debe usarse con menores ni para contenido ilegal o no consentido.
- No apto para text-to-video puro: el autor indica que hay que alimentarlo siempre con una imagen.
- Idiomas: solo inglés declarado; los prompts en otros idiomas no están soportados oficialmente.
- Licencia: LTX-2 Community License, con posibles restricciones para uso comercial; hay que revisar los términos del modelo base antes de desplegarlo en producción.
- Riesgo de alucinación visual y artefactos: no se documentan métricas de calidad objetivas ni tasas de fallo.
- Sin benchmarks publicados: no hay datos verificables de calidad frente a alternativas.
- Repo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de robustez en producción.
- El tamaño del repo en Hugging Face es de 0,2 GB, mientras que el checkpoint declarado pesa 34,3 GB; conviene verificar de dónde se descarga el peso completo (Civitai u otra fuente) antes de integrarlo en un pipeline.
- No se documentan sesgos conocidos más allá de la advertencia de contenido adulto.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/LTX-See-Motion
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Perfil del autor: https://huggingface.co/SeeSee21
- Civitai: https://civitai.red/models/2768763
- Tensor.Art: https://tensor.art/models/1020948864728838115
- YouTube del autor: https://www.youtube.com/@SeeSee-AI
- GitHub del autor: https://github.com/seesee75-commits
- LoRA destilado oficial: https://huggingface.co/Lightricks/LTX-2.3/blob/main/ltx-2.3-22b-distilled-lora-384-1.1.safetensors
