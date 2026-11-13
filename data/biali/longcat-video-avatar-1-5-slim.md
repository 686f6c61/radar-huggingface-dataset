# biali/longcat-video-avatar-1.5-slim

## Resumen

LongCat-Video-Avatar 1.5 (slim runtime bundle) es un repositorio no oficial publicado por el usuario `biali` que reempaqueta en un único snapshot dos repositorios del proyecto LongCat de Meituan: `meituan-longcat/LongCat-Video-Avatar-1.5` y `meituan-longcat/LongCat-Video`. El objetivo es que el script de inferencia de avatar pueda ejecutarse desde un solo directorio de checkpoint, sin necesidad de descargar por separado el modelo base de vídeo y el modelo de avatar. No se han modificado los pesos: según el autor, los ficheros son idénticos byte a byte a los originales.

El paquete incluye un DiT en BF16, un adaptador LoRA, el codificador de audio Whisper large-v3 (solo `model.safetensors`), un separador vocal, el VAE, el text encoder, el tokenizer y los ficheros de configuración y scheduler. Se han excluido deliberadamente el DiT en INT8 (`base_model_int8/`) y los formatos alternativos de Whisper (Flax, `.bin` de PyTorch y shards FP32), lo que reduce el tamaño respecto al conjunto completo de los dos repositorios originales.

Es relevante porque simplifica el despliegue de un pipeline de generación de vídeo con avatar parlante (audio a vídeo con sincronización labial) sobre modelos abiertos con licencia MIT, y porque el bundle está pensado para `diffusers`. Ahora bien, se trata de un artefacto de conveniencia, no de un modelo entrenado por el autor del repo: la autoría técnica y la licencia corresponden a Meituan LongCat. El repositorio tiene 60,6 GB y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para vídeo, con adaptador LoRA y codificador de audio Whisper large-v3; VAE y text encoder del modelo base LongCat-Video |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el bundle; el upstream incluye una variante INT8 del DiT (`base_model_int8/`) que este paquete excluye |
| Idiomas soportados | no disponible |
| Licencia | MIT (copyright de Meituan LongCat) |
| Formato de pesos | safetensors (también ONNX según los tags del repo); configuración para `diffusers` |

## Arquitectura y entrenamiento

El componente principal es un Diffusion Transformer (DiT) que opera en BF16 y se acompaña de un adaptador LoRA, un VAE, un text encoder y un scheduler, todo heredado de LongCat-Video. La parte específica de avatar incorpora Whisper large-v3 como codificador de audio y un separador vocal, lo que permite condicionar la generación de vídeo tanto por texto como por audio de entrada. El bundle no incluye el DiT cuantizado a INT8 ni los formatos alternativos de Whisper.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas del entrenamiento en la información proporcionada. El autor del reempaquetado declara explícitamente que no ha modificado los pesos y que los ficheros son idénticos a los de los repositorios upstream, por lo que cualquier detalle de entrenamiento debe consultarse en las model cards originales de Meituan LongCat.

## Capacidades

- Generación de vídeo condicionada por texto y audio, orientada a la creación de avatares parlantes con sincronización labial.
- Codificación de audio mediante Whisper large-v3, lo que permite alinear el movimiento facial con la pista de voz.
- Separación vocal como paso previo, útil para aislar la voz del hablante en pistas con música o ruido.
- Integración con `diffusers` y posibilidad de exportación a ONNX, según los tags del repositorio.
- Composición modular: DiT base, LoRA, VAE, text encoder, tokenizer y scheduler empaquetados para ejecutar el pipeline de avatar desde un único snapshot.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking), visión o audio como salida: no disponible.

## Casos de uso

- Generación de avatares parlantes para vídeo corporativo: se introduce un retrato y una pista de audio y el pipeline produce un vídeo con movimiento facial sincronizado, adecuado para formación interna o comunicados.
- Doblaje y localización de vídeo: usando el separador vocal y Whisper large-v3, se puede aislar la voz original y regenerar el vídeo del hablante con una nueva pista de audio, útil en estudios de doblaje.
- Creación de contenido para redes sociales: generación de clips cortos con un presentador virtual a partir de un guion de texto y una locución, sin necesidad de rodaje.
- Prototipado de asistentes virtuales con cara: integración del pipeline en demos de atención al cliente donde un avatar responde con voz sintetizada y sincronización labial.
- Investigación en generación de vídeo condicionada por audio: el bundle facilita reproducir experimentos sobre LongCat-Video-Avatar 1.5 desde un único checkpoint, comparando el DiT BF16 con la variante INT8 del upstream.
- Evaluación de pipelines de difusión en producción: al estar empaquetado para `diffusers` y con opción ONNX, sirve para medir latencia y throughput de un pipeline de vídeo en infraestructura propia antes de adoptar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo ocupa 60,6 GB en disco e incluye un DiT en BF16, un LoRA, Whisper large-v3, un VAE y un text encoder; el peso conjunto de estos componentes hace inviable la inferencia en GPUs de consumo con poca VRAM.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del bundle y el uso de BF16, se requiere hardware de clase profesional con suficiente memoria; no se confirma compatibilidad con RTX 4090 ni con GPUs de consumo.
- Cabe en consumer GPU: no confirmado; el tamaño del snapshot (60,6 GB) y la presencia de Whisper large-v3 y un DiT BF16 sugieren que no cabe en GPUs de consumo de 24 GB sin cuantización adicional.
- Opciones de despliegue: `diffusers` (librería declarada en el repo) y exportación a ONNX según los tags; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| biali/longcat-video-avatar-1.5-slim | no disponible | no disponible | MIT | Hugging Face, 0 descargas | Reempaquetado no oficial de dos repos de Meituan; excluye INT8 y formatos alternativos de Whisper |
| meituan-longcat/LongCat-Video-Avatar-1.5 | no disponible | no disponible | MIT | Hugging Face (upstream) | Modelo original de avatar; incluye DiT INT8 y todos los formatos de Whisper |
| meituan-longcat/LongCat-Video | no disponible | no disponible | MIT | Hugging Face (upstream) | Modelo base de vídeo; el bundle toma de aquí tokenizer, text encoder, VAE y scheduler |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un reempaquetado no oficial: no ha sido validado por Meituan LongCat y no debe tratarse como la distribución de referencia.
- Solo se incluye el DiT en BF16; se excluye la variante INT8, lo que puede impedir ejecutar el pipeline en hardware con memoria limitada.
- Se omiten los formatos alternativos de Whisper (Flax, `.bin` de PyTorch y shards FP32); si el script de inferencia espera alguno de ellos, habrá que descargarlo del upstream.
- El autor declara que los pesos no se han modificado, pero no se aportan hashes ni verificación independiente en la información disponible.
- No hay datos publicados sobre sesgos, tasas de alucinación visual, calidad de sincronización labial ni comportamiento multilingüe.
- La licencia MIT permite uso comercial, pero los derechos de autor corresponden a Meituan LongCat; conviene conservar el aviso de copyright y revisar las model cards originales antes de un despliegue en producción.
- El repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de uso en producción ni informes de la comunidad.
- No se especifican requisitos de hardware ni límites de longitud de vídeo o resolución.

## Enlaces

- Repositorio del bundle: https://huggingface.co/biali/longcat-video-avatar-1.5-slim
- Modelo upstream de avatar: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.5
- Modelo upstream base de vídeo: https://huggingface.co/meituan-longcat/LongCat-Video
- Organización Meituan LongCat en Hugging Face: https://huggingface.co/meituan-longcat
