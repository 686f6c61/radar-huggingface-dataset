# AbrahamPJ/fasth3-dense-v1-q8_0-gguf

## Resumen

FastH3 Dense v1 Q8_0 es una cuantización GGUF de 8 bits del denoiser de MiniMax H3, destilado a cuatro pasos por FastVideo (FastH3 Preview v1, variante Dense y Data-Free). El modelo original pertenece a MiniMax; la conversión y el empaquetado los firma AbrahamPJ para la ruta Hexagon NPU de Nightmare Mobile, una aplicación Android de generación de imagen y vídeo en dispositivo. Se trata de un modelo de texto a vídeo, no de un modelo de lenguaje: el denoiser se acompaña de los VAE de vídeo y audio de H3 y de un codificador de texto Qwen3-VL-4B con la proyección ClipProj de NicoLab28.

El archivo publicado ocupa 21.602.684.288 bytes (unos 21,6 GB) y contiene 324 tensores F32 heredados sin cambios de la versión Q4_0 (tabla de curva AdaLN, proyecciones AdaLN por bloque en sus knots, normas y proyecciones de parche y condicionamiento) más 208 capas lineales grandes cuantizadas a Q8_0 directamente desde los shards bf16 de diffusers de FastVideo (revisión `f58c2eb`). El error relativo frente a los pesos bf16 es de aproximadamente 0,006, frente al 0,09 de la variante Q4_0.

Su relevancia es acotada pero concreta: demuestra que un denoiser de vídeo de gran tamaño puede ejecutarse en un móvil Android mediante la ruta NPU Hexagon, con una precisión notablemente superior a la cuantización de 4 bits a costa de multiplicar por cuatro el peso en disco. No es un modelo de propósito general ni un checkpoint upstream: es un fichero modificado y derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión de MiniMax H3 (transformer de difusión para vídeo y audio), destilado a 4 pasos; no disponible el detalle interno de capas |
| Parametros totales | no disponible (el fichero GGUF ocupa 21.602.684.288 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (208 capas lineales grandes); 324 tensores F32 sin cuantizar; existe variante Q4_0 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`minimax-h3-community`), Copyright © 2026 MiniMax; limitada al Territorio Aplicable |
| Formato de pesos | GGUF (`fasth3_dense_v1_euler4_q8_0.gguf`) |
| Tamano del fichero | 21.602.684.288 B |
| SHA-256 | `b2aa49ceb88297e6d487d15895fab45f73fb3361ce556a95c895c40216b4e633` |
| Modelo base | FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree y MiniMaxAI/MiniMax-H3 |
| Pipeline | text-to-video |

## Arquitectura y entrenamiento

El modelo es el denoiser de MiniMax H3, un modelo de difusión para generación conjunta de vídeo y audio, destilado por FastVideo a cuatro pasos de muestreo (FastH3 Preview v1, variante Dense y Data-Free, es decir, sin datos propios de destilación). La inferencia se realiza con cuatro pasos Euler sobre la tabla `gestura.adaln.timesteps`, con shift 12 para vídeo y 3 para audio, y CFG 1. Se acompaña de los VAE de vídeo y audio de H3, y el codificador de texto en la aplicación es Qwen3-VL-4B con la proyección ClipProj de NicoLab28.

La conversión a GGUF no altera el layout ni la cabecera: los 324 tensores F32 se copian sin cambios desde la Q4_0 y solo se recuantizan las 208 capas lineales grandes a Q8_0 desde los shards bf16 de FastVideo. El mapeo de nombres es explícito: `qkv_proj` corresponde a `to_q`, `to_k` y `to_v` apilados; `out_proj` a `to_out.0`; `fc1` a `ff.net.0.proj` con sus dos mitades intercambiadas; y `fc2` a `ff.net.2`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video) mediante un denoiser de difusión de cuatro pasos.
- Generación de audio conjunta, ya que el pipeline utiliza el VAE de audio de H3 además del de vídeo.
- Inferencia en dispositivo Android a través de la ruta Hexagon NPU de Nightmare Mobile.
- Integración con un codificador de texto externo (Qwen3-VL-4B con ClipProj), lo que aporta condicionamiento textual multimodal por parte del encoder, no del denoiser.
- Cuantización de 8 bits con error relativo bajo frente a bf16 (aproximadamente 0,006), pensada para preservar calidad frente a la variante Q4_0.
- No se documentan tool calling, function calling, soporte de agentes, modo thinking ni capacidades multilingües explícitas.

## Casos de uso

- Generación de vídeo en dispositivo Android: la aplicación Nightmare Mobile usa este GGUF en la ruta Hexagon NPU para producir clips de vídeo sin enviar datos a la nube, lo que resulta adecuado por privacidad y por el coste de servidor.
- Prototipado de pipelines de difusión de cuatro pasos: al estar destilado a cuatro pasos Euler con CFG 1, permite iterar rápido sobre prompts y parámetros sin el coste de un muestreador completo.
- Investigación sobre cuantización GGUF en modelos de vídeo: la comparación directa Q4_0 (error relativo ~0,09) frente a Q8_0 (~0,006) sobre el mismo layout sirve para medir el impacto de la precisión en la calidad final del vídeo.
- Evaluación de la ruta Hexagon NPU: el fichero está empaquetado específicamente para esa ruta, por lo que es un banco de pruebas para medir latencia y throughput de denoisers grandes en hardware móvil.
- Generación de vídeo con audio sincronizado: al emplear los VAE de vídeo y audio de H3, encaja en aplicaciones que necesitan pista sonora junto al clip, como demos o contenido corto.
- Reproducción de resultados de FastVideo: al derivar de la revisión `f58c2eb` de los shards bf16, permite verificar la fidelidad de la conversión frente al checkpoint original en un entorno de escritorio con llama.cpp u otro runtime GGUF compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa unos 21,6 GB, por lo que se necesita al menos esa cantidad de memoria para cargarlo completo; no se dispone de cifras de VRAM pico medidas.
- GPU recomendadas: no disponible. El destino declarado es la NPU Hexagon de Android, no una GPU de escritorio.
- ¿Cabe en GPU de consumo? No de forma holgada: 21,6 GB superan los 24 GB de una RTX 4090 solo si se deja margen mínimo para el resto del pipeline (VAE, encoder de texto), por lo que en la práctica requiere GPUs de 40-80 GB o descarga por capas. No se documenta soporte oficial para GPUs de consumo.
- Opciones de despliegue: Nightmare Mobile (ruta Hexagon NPU) es el destino documentado; el formato GGUF sugiere compatibilidad con runtimes GGUF, pero no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3 Dense v1 Q8_0 (este) | no disponible (fichero de 21,6 GB) | no disponible | GGUF Q8_0 | MiniMax H3 Community | Hugging Face, 0 descargas |
| FastH3 Dense v1 Q4_0 (mismo autor) | no disponible (fichero menor) | no disponible | GGUF Q4_0 | MiniMax H3 Community | Hugging Face |
| FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree | no disponible | no disponible | diffusers bf16 | no disponible | Hugging Face |
| MiniMax-H3 (original) | no disponible | no disponible | no disponible | MiniMax H3 Community | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un fichero modificado, no una release upstream: los tensores F32 se heredan de la Q4_0 y solo se recuantizan las capas lineales, por lo que cualquier cambio en la Q4_0 se propaga a esta versión.
- La licencia MiniMax H3 Community está limitada a su Territorio Aplicable; debe leerse `LICENSE` y `NOTICE` antes de cualquier uso, incluido el comercial.
- No hay endoso implícito por parte de MiniMax, FastVideo ni Gestura.
- El modelo es un denoiser, no un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y depende de un encoder de texto externo para el condicionamiento.
- El tamaño de 21,6 GB limita seriamente su despliegue fuera de dispositivos con memoria suficiente; la variante Q4_0 es la opción práctica para hardware más ajustado.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un modelo de vídeo, el riesgo principal es la generación de contenido visual no fiel al prompt.
- Creado y actualizado el 2026-11-19, sin descargas ni likes: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [Hugging Face: AbrahamPJ/fasth3-dense-v1-q8_0-gguf](https://huggingface.co/AbrahamPJ/fasth3-dense-v1-q8_0-gguf)
- [Variante Q4_0 del mismo autor](https://huggingface.co/AbrahamPJ/fasth3-dense-v1-q4_0-gguf)
- [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [FastVideo FastH3 Preview v1](https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-Dense-DataFree)
- [NicoLab28/ClipProj-MiniMax-H3](https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3)
- [Nightmare Mobile (GitHub)](https://github.com/AbrahamPaulJ/nightmare-mobile)
