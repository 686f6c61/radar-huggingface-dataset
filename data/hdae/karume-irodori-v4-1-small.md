# hdae/karume-irodori-v4.1-small

## Resumen

`hdae/karume-irodori-v4.1-small` es una distribución de text-to-speech (TTS) en japonés creada por `hdae`, que convierte el modelo original `Aratako/Irodori-TTS-v4.1-Small` al formato de inferencia WebGPU del runtime **Karume**. El resultado es un único archivo `safetensors` que contiene tanto los pesos como un grafo de inferencia embebido en los metadatos, lo que permite ejecutar el modelo directamente en el navegador o en Deno, sin dependencias de runtime externas.

El modelo usa una arquitectura **rectified-flow DiT** (Diffusion Transformer) junto con un backbone de texto basado en `ModernBERT` japonés (fine-tuned desde `sbintuitions/modernbert-ja-310m`) y un codec **DACVAE** (`Aratako/Semantic-DACVAE-Japanese-32dim`). El repositorio tiene un tamaño de 6,3 GB e incluye varias cuantizaciones (`f32`, `f16`, `i8`, `i8-a8` e `i8+dit4`). No se ha realizado ningún reentrenamiento ni fine-tuning en esta conversión: solo se han convertido los pesos al formato Karume y se han cuantizado, con una cuantización GPTQ aplicada solo al bloque `dit`.

La relevancia de este modelo radica en que permite ejecutar un TTS japonés de alta calidad con clonación de voz y diseño de voz por texto (Voice Design) en entornos web y serverless, aprovechando WebGPU. Es una opción interesante para aplicaciones que necesitan síntesis de voz en el cliente, sin servidores dedicados ni dependencias pesadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified-flow DiT con backbone ModernBERT japonés y codec DACVAE |
| Parametros totales | No disponible (el repositorio tiene 6,3 GB de pesos cuantizados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de TTS, no aplica) |
| Tipos de cuantizacion | `f32`, `f16`, `i8`, `i8-a8`, `i8+dit4` (por defecto `i8-a8`) |
| Idiomas soportados | Japones |
| Licencia | MIT |
| Formato de pesos | Safetensors con grafo IR embebido en `__metadata__` (formato contenedor Karume) |
| Modelo base | Aratako/Irodori-TTS-v4.1-Small |
| Backbone de texto | sbintuitions/modernbert-ja-310m |
| Codec | Aratako/Semantic-DACVAE-Japanese-32dim |
| Pipeline | `irodori/1` |
| Runtime | Karume (WebGPU / Deno / navegador) |
| Exporter de conversion | karume/0.8.0 |

## Arquitectura y entrenamiento

La arquitectura es un **rectified-flow DiT** (Diffusion Transformer) diseñado para síntesis de voz, convertido al formato de grafo de inferencia de Karume. La cadena de ejecución está compuesta por ocho grafos: un backbone compartido de texto `ModernBERT` japonés, los proyectores de condiciones `text_proj` y `caption_proj`, un codificador de `speaker` basado en latentes de referencia, un predictor de duración, el propio `dit` (que ejecuta un paso de Euler por cada rama de classifier-free guidance), y el codec DACVAE en dos partes (`codec_decoder` y `codec_encoder`). El decodificador se ejecuta en tiles para respetar el límite por defecto de 128 MiB de storage-buffer de WebGPU, manteniendo resultados bit-exactos respecto a una decodificación single-shot.

No se ha realizado ningún reentrenamiento ni fine-tuning en esta versión de Karume. Los pesos originales provienen de `Aratako/Irodori-TTS-v4.1-Small` (licencia MIT) y se han convertido al contenedor de Karume mediante el exporter `karume/0.8.0`. La conversión incluye una cuantización de los pesos en series `f32`, `f16` e `i8`, y el bloque `dit` añade además una serie `i4` redondeada con calibración GPTQ. El backbone `ModernBERT` y el codec `DACVAE` se redistribuyen dentro del mismo contenedor, de modo que la inferencia funciona con este repositorio de forma autónoma. No se han publicado detalles sobre el dataset de entrenamiento original del modelo base.

## Capacidades

- **Text-to-speech en japonés**: convierte texto en voz, devolviendo muestras de audio f32 mono a la frecuencia de muestreo del codec (no se especifica en la documentación, pero el audio de referencia debe estar a 48000 Hz).
- **Diseño de voz por texto (Voice Design)**: permite describir la voz en prosa japonesa mediante el parámetro `caption` (por ejemplo, "voz femenina tranquila que habla despacio y con cortesía").
- **Clonación de voz por audio de referencia**: se puede pasar un WAV mono o estéreo a 48000 Hz como `speaker`, que el `codec_encoder` convierte en un latent DACVAE.
- **Clonación de voz por latent**: también se puede pasar directamente un latent DACVAE previamente generado, sin necesidad de audio.
- **Generación de embeddings**: `generateLatent()` devuelve el latent DACVAE patcheado, útil para casos de uso que requieren la representación intermedia.
- **Determinismo**: con la misma semilla y las mismas entradas, la salida es idéntica.
- **Ejecución en navegador y Deno**: gracias al runtime Karume, funciona con WebGPU sin dependencias de runtime.
- **Cuantización múltiple**: se puede seleccionar entre `f32`, `f16`, `i8`, `i8-a8` e `i8+dit4` para equilibrar calidad y consumo de memoria.
- **Soporte de caché de pesos**: los pesos se descargan una vez y se verifican mediante `sha256` y `size` del manifest `karume.json`.

## Casos de uso

- **Síntesis de voz en el navegador**: al ejecutarse en WebGPU, se puede generar voz japonesa directamente en la web, sin necesidad de enviar texto a un servidor. Es adecuado para aplicaciones de lectura de texto en tiempo real o demostraciones interactivas.

- **Clonación de voz para narración**: con un audio de referencia a 48000 Hz, el modelo puede reproducir la identidad de un hablante concreto. Útil para audiolibros, podcasts o contenido narrado en japonés.

- **Diseño de voz para asistentes virtuales**: mediante `caption` se puede definir la personalidad de la voz (tono, velocidad, estilo) en prosa japonesa, lo que permite crear asistentes con características de voz muy específicas sin necesidad de datos de hablantes reales.

- **Generación de contenido para doblaje**: la clonación de voz por latent permite reutilizar una voz ya generada en múltiples textos, manteniendo coherencia. El control de semilla asegura que la salida sea reproducible, algo importante en producción.

- **Investigación en TTS**: el modelo permite estudiar el comportamiento de un DiT rectified-flow en formato WebGPU, así como el codec DACVAE y el efecto de la cuantización `i4` GPTQ en la calidad de la voz.

- **Aplicaciones serverless en Deno**: se puede ejecutar en scripts de Deno para generar archivos WAV de forma programática, sin infraestructura dedicada. El pipeline `irodori/1` se integra con `@karume/models` y `decodeWav`/`encodeWav`.

- **Prototipado rápido en GPUs con límites de WebGPU**: el decodificador en tiles está diseñado para funcionar con el límite por defecto de 128 MiB de storage-buffer, lo que facilita el despliegue en GPUs de consumo y entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo se ejecuta en WebGPU, y el decodificador está diseñado para respetar el límite por defecto de 128 MiB de storage-buffer de WebGPU, pero no se proporcionan cifras de VRAM para cada cuantización.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPUs de consumo**: no se indica explícitamente, pero el diseño en tiles sugiere que está pensado para GPUs con límites de WebGPU estándar.
- **Opciones de despliegue**: navegador con WebGPU y Deno, usando el runtime Karume (`@karume/runtime`), el hub de modelos (`@karume/hub`) y los pipelines (`@karume/models`). También se puede usar el exporter `karume` en Python para convertir otros modelos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Arquitectura | Cuantizaciones | Licencia | Ejecución |
|---|---|---|---|---|---|
| hdae/karume-irodori-v4.1-small | Karume (WebGPU) | DiT rectified-flow + ModernBERT + DACVAE | f32, f16, i8, i8-a8, i8+dit4 | MIT | Navegador / Deno |
| Aratako/Irodori-TTS-v4.1-Small | PyTorch (original) | DiT rectified-flow + ModernBERT + DACVAE | No disponible | MIT | Servidor / GPU |
| hdae/karume-irodori-v4-small | Karume (WebGPU) | DiT rectified-flow (v4 Small) | No disponible | MIT | Navegador / Deno |

La versión `v4.1-small` de `hdae` es una conversión directa del modelo original de Aratako, con la diferencia clave de que se distribuye en el formato contenedor Karume, no legible por la implementación upstream. La versión anterior `karume-irodori-v4-small` usa el modelo base Irodori-TTS v4 Small, mientras que esta usa el v4.1 Small, que es la versión más reciente. No se dispone de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- **Solo soporta japonés**: no se indica soporte para otros idiomas en la documentación.
- **Rechazo de audio de referencia con frecuencia de muestreo incorrecta**: no hay resampler. El audio debe estar a 48000 Hz; cualquier desajuste es rechazado en lugar de convertirse silenciosamente.
- **Límite en el codificador de voz**: `codec_encoder` no está en tiles, por lo que una referencia larga puede exceder el límite de 128 MiB de storage-buffer de WebGPU.
- **Formato propietario de Karume**: el modelo no es legible por la implementación original de Aratako; solo funciona con el pipeline `irodori/1` de Karume.
- **Sin datos de benchmarks**: no se han publicado métricas de calidad de voz, inteligibilidad ni comparativas con otros TTS.
- **Cuantización GPTQ en `dit`**: la cuantización `i4` puede introducir pérdidas de calidad, aunque no se documenta su impacto.
- **Dependencia de WebGPU**: la ejecución requiere un entorno con soporte WebGPU, lo que puede limitar su uso en navegadores antiguos o en sistemas sin GPU compatible.
- **Proyecto experimental**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente y poco probada.
- **Licencia**: el modelo se distribuye bajo MIT, sin restricciones comerciales conocidas, pero la responsabilidad del uso recae en el usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hdae/karume-irodori-v4.1-small
- GitHub del runtime Karume: https://github.com/hdae/karume
- Paquete JSR `@karume/models`: https://jsr.io/@karume/models
- Documentación del pipeline `irodori`: https://jsr.io/@karume/models/doc/irodori
- Modelo base original: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Backbone de texto: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Codec DACVAE: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Repositorio de entrenamiento de Irodori-TTS: https://github.com/Aratako/Irodori-TTS
