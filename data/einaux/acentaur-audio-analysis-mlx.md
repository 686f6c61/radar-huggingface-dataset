# einaux/acentaur-audio-analysis-mlx

## Resumen

Acentaur audio-analysis MLX packages es un repositorio de distribucion de pesos en formato MLX para Apple Silicon, publicado por el desarrollador einaux bajo el paraguas del producto comercial ACENTAUR 1.0. No se trata de un modelo entrenado desde cero, sino de una conversion y empaquetado de los checkpoints oficiales del captioner y el transcriber de ACE-Step 1.5, a su vez derivados de Qwen2.5-Omni. El repositorio contiene tres paquetes de pesos: un captioner musical en 4 bits, un captioner musical en BF16 y un transcriber de letras y idioma en 8 bits, con un total de 31,5 GB en safetensors.

El objetivo del repositorio es servir como canal de descarga versionado para la aplicacion ACENTAUR Setup, que gestiona la instalacion en equipos con chip de Apple. Los pesos usan un contrato interno de analisis de audio versionado por ACENTAUR y no estan pensados para cargarse directamente con LM Studio, Transformers, cargadores genericos de MLX ni Inference Providers de Hugging Face. La licencia declarada es MIT, heredada de los checkpoints originales de ACE-Step.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribucion, no de un modelo con model card tecnica propia. La informacion publica disponible se limita a tamanos de payload, precisiones, hashes de validacion y notas de procedencia; no hay datos sobre arquitectura interna mas alla de la herencia de Qwen2.5-Omni, ni sobre entrenamiento, benchmarks o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen2.5-Omni: audio tower + modelo de texto denso + LM head; sin vision, Talker ni Token2Wav) |
| Parametros totales | no disponible (payload safetensors de 5,56 GB en 4-bit, 16,51 GB en BF16 y 9,37 GB en 8-bit) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine (captioner-fast), BF16 (captioner-best), 8-bit affine (transcriber-lyrics); audio tower en BF16 en los paquetes cuantizados |
| Idiomas soportados | no disponible (el paquete transcriber se describe como "lyrics and language transcription", sin listado de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Los paquetes son conversiones de los checkpoints oficiales de ACE-Step 1.5 para captioning musical y transcripcion de letras. Segun la model card, los wrappers originales de Qwen2.5-Omni se redujeron al audio tower, el modelo de texto denso y la LM head antes de la conversion; los pesos de vision, Talker y Token2Wav no se incluyen. La conversion se realizo con el codigo del convertidor MLX-VLM 0.6.11, el mismo usado para la referencia validada en un M5, y se reconstruyo en un M1 Max produciendo shards safetensors byte-identicos al artefacto de M5.

No se proporciona informacion sobre el entrenamiento original de ACE-Step 1.5 ni de Qwen2.5-Omni: no hay numero de tokens, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias del empaquetado mas alla de la cuantizacion affine y la separacion en paquetes de producto. La validacion se limita a una matriz determinista que reproduce hashes de tokens: `032c00a2a7d42736e1e8aa0b36f3f70fff1b9e139610a26bdedb72286434a95a` para el captioner 4-bit y `c85d46f10685dd1c7b450909d0a31b2cbaa9854355b3502c97573e812c5faded` para el transcriber 8-bit.

## Capacidades

- Descripcion musical (music captioning): generacion de descripciones de audio musical a partir de la senal de audio, en variante rapida (4-bit) y de maxima calidad (BF16).
- Transcripcion de letras: conversion de audio musical a texto de letras.
- Transcripcion de idioma: identificacion y transcripcion del idioma presente en el audio, segun la descripcion del paquete `transcriber-lyrics-8bit`.
- Procesamiento de audio nativo: el audio tower en BF16 se mantiene incluso en los paquetes cuantizados, preservando la ruta de entrada de audio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible el listado concreto de idiomas.
- Capacidades especiales (vision, audio generativo, thinking mode): no incluidas; vision, Talker y Token2Wav fueron eliminados en la conversion.

## Casos de uso

- Catalogacion automatica de bibliotecas musicales: el paquete `captioner-fast-4bit` permite generar descripciones de cada pista en lote sobre un Mac con Apple Silicon, con un payload de 5,56 GB que cabe en memoria unificada de equipos de gama alta.
- Generacion de metadatos de alta calidad para publicacion: el paquete `captioner-best-bf16` (16,51 GB) se usaria cuando la precision de la descripcion prime sobre el coste de memoria, por ejemplo para fichas de catalogo o descripciones de cara a plataformas de streaming.
- Transcripcion de letras para subtitulado o karaoke: el paquete `transcriber-lyrics-8bit` (9,37 GB) convierte el audio en texto de letras, util para sincronizacion posterior o indexacion por contenido.
- Deteccion y transcripcion de idioma en archivos de audio: el mismo transcriber permite clasificar el idioma de una grabacion antes de enrutarla a un pipeline de traduccion o moderacion.
- Enriquecimiento de bases de datos de audio para busqueda semantica: las descripciones generadas por el captioner alimentan indices de busqueda por texto sobre un catalogo musical previamente no etiquetado.
- Preprocesado en flujos de produccion musical asistida: descripcion y transcripcion de material de referencia para alimentar herramientas de generacion o edicion, siempre dentro de la aplicacion ACENTAUR que gestiona la carga de los paquetes.
- Uso integrado en ACENTAUR 1.0: los paquetes estan disenados para ser consumidos por ACENTAUR Setup, que descarga solo las rutas de revision fijada que el usuario seleccione (`audio_analysis` o `audio_analysis_detailed`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es la reproduccion de hashes de tokens de la matriz determinista de referencia, que confirma la integridad de la conversion pero no mide calidad.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 5,56 GB para `captioner-fast-4bit`, 9,37 GB para `transcriber-lyrics-8bit` y 16,51 GB para `captioner-best-bf16`, en memoria unificada de Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon; la conversion y validacion se realizaron en un M1 Max y en un M5 de referencia.
- Compatibilidad con GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se contempla soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: solo mediante ACENTAUR Setup y el runtime MLX incluido; el autor indica explicitamente que no es compatible con LM Studio, Transformers, cargadores genericos de MLX ni Inference Providers de Hugging Face.
- Latencia y throughput: no disponibles.
- Almacenamiento: 14,97 GB para el paquete `Audio Analysis`, 16,53 GB adicionales para `Detailed Description` y 31,49 GB para la union completa con metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Acentaur audio-analysis MLX (este) | no disponible | no disponible | MIT | Solo via ACENTAUR Setup, Apple Silicon | Empaquetado de ACE-Step 1.5 derivado de Qwen2.5-Omni |
| ACE-Step 1.5 (captioner y transcriber originales) | no disponible | no disponible | MIT (heredada) | Checkpoints oficiales | Origen de los pesos; incluye componentes completos |
| Qwen2.5-Omni | no disponible | no disponible | no disponible | Pesos originales de 22,36 GB | Incluye vision, Talker y Token2Wav, ausentes en este empaquetado |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el repositorio es un canal de distribucion para un producto comercial y su uso directo con cargadores estandar no esta soportado.
- Dependencia de la aplicacion ACENTAUR: la carga y el contrato de analisis de audio estan versionados internamente; cambiar el repositorio a privado romperia el contrato de distribucion segun el autor.
- Plataforma restringida: solo Apple Silicon con MLX; no hay soporte declarado para CUDA, ROCm ni CPU generica.
- Componentes eliminados: sin vision, Talker ni Token2Wav, por lo que no puede realizar tareas multimodales mas alla del audio.
- Idiomas no documentados: se desconoce la cobertura linguistica real del transcriber.
- Sesgos y alucinacion: no hay informacion publicada sobre sesgos, tasas de alucinacion o evaluacion cualitativa.
- Licencia MIT heredada: permite uso comercial, pero el producto ACENTAUR y su contrato de distribucion pueden imponer condiciones adicionales de uso.
- Ausencia de benchmarks: no es posible evaluar la calidad frente a alternativas con datos publicos.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/einaux/acentaur-audio-analysis-mlx
- Sitio del producto ACENTAUR: https://www.einaux.com
- ACE-Step 1.5 (checkpoints de origen): no disponible en la informacion proporcionada
- Qwen2.5-Omni (modelo base de los wrappers originales): no disponible en la informacion proporcionada
- MLX-VLM (convertidor 0.6.11): no disponible en la informacion proporcionada
