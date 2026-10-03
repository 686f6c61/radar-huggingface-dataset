# ling0322/libwaifu-seed-vc

## Resumen

libwaifu-seed-vc es una redistribución de los pesos de Seed-VC v2, un sistema de conversión de voz (voice conversion) zero-shot, empaquetada en formato safetensors para el runtime en Rust libwaifu. El modelo recibe dos entradas de audio —una grabación con el habla de origen y una grabación de referencia con la voz objetivo— y genera el contenido del primer hablante con el timbre del segundo a 22,05 kHz. Lo desarrolla y publica el usuario ling0322 sobre los componentes de Plachta/Seed-VC y Plachta/ASTRAL-quantization.

No se trata de un modelo de lenguaje: no genera texto, razona ni ejecuta tool calling. Es un pipeline de conversión de voz compuesto por varios módulos acoplados: un encoder de contenido HuBERT (las 18 primeras capas de facebook/hubert-large-ll60k), tokenizadores ASTRAL bsq2048_light y bsq32_light, un módulo de flow matching condicional (cfm_small.pth), un componente autorregresivo (ar_base.pth), un extractor de embeddings de hablante CAMPPlus de FunASR y un vocoder BigVGAN v2 de 22 kHz y 80 bandas.

Su relevancia es de integración: el repositorio tiene 2,2 GB y redistribuye pesos GPL-3.0 en safetensors listos para consumirse desde Rust, lo que evita depender del stack PyTorch original. El número total de parámetros declarado es de 553 M en float32, repartidos en dos shards. La licencia GPL-3.0 es contagiosa y el runtime que lo lee está aislado detrás de la feature `gpl` de libwaifu, un detalle determinante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de conversion de voz: encoder de contenido HuBERT-large (18 capas), tokenizadores ASTRAL (bsq2048_light, bsq32_light), flow matching condicional (cfm_small) + modulo autorregresivo (ar_base), embeddings de hablante CAMPPlus y vocoder BigVGAN v2 22 kHz / 80 bandas |
| Parametros totales | 553 M (float32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta la duracion maxima de audio de fuente ni de referencia) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float32 y no se documenta GGUF, INT8 ni FP16 |
| Idiomas soportados | no disponible (la conversion preserva el idioma del audio de origen; el autor no publica lista de idiomas) |
| Licencia | GPL-3.0 (codigo y pesos); el runtime de libwaifu que lo consume esta tras la feature `gpl` |
| Formato de pesos | safetensors (2 shards: `seed_vc-00001-of-00002.safetensors`, `seed_vc-00002-of-00002.safetensors`) + manifiesto `seed_vc.yaml` |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un export de componentes ya entrenados. La ruta de inferencia combina un encoder de contenido (HuBERT-large, solo las 18 primeras capas) que extrae representaciones linguisticas del audio fuente, dos tokenizadores de la familia ASTRAL (`bsq2048_light` y `bsq32_light`) procedentes de Plachta/ASTRAL-quantization, y el par `cfm_small.pth` (conditional flow matching) y `ar_base.pth` (autorregresivo) de Seed-VC v2. El timbre se inyecta mediante embeddings de hablante de CAMPPlus de FunASR extraidos de la grabacion de referencia, y la forma de onda final la sintetiza el vocoder BigVGAN v2 de NVIDIA a 22,05 kHz con 80 bandas.

El autor indica que la exportacion se realiza con `tools/seed_vc_exporter.py` y esta documentada en `docs/seed_vc.md` del repositorio libwaifu. No se especifican en la informacion proporcionada el numero de tokens de audio usados en el entrenamiento original, la composicion del dataset, ni si hubo etapas de RLHF o DPO; esos detalles corresponderian a las fichas de los modelos base (Plachta/Seed-VC y Plachta/ASTRAL-quantization), no a esta redistribucion. La innovacion tecnica de esta publicacion es de empaquetado y portabilidad: pesos en safetensors en lugar de checkpoints `.pth`, ejecutables desde un runtime Rust sin dependencia de PyTorch.

## Capacidades

- Conversion de voz zero-shot: transforma el habla de un locutor para que suene con el timbre de otro a partir de una unica grabacion de referencia.
- Salida de audio a 22,05 kHz mediante el vocoder BigVGAN v2 de 80 bandas.
- Desacoplamiento de contenido y timbre: el contenido linguistico se extrae con HuBERT y el hablante con CAMPPlus, por lo que el resultado conserva las palabras del audio fuente.
- Ejecucion desde linea de comandos mediante el ejemplo `convert` de libwaifu (`cargo run --release --features gpl --example convert -- seed_vc.yaml source.wav voice.wav out.wav`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento de agente; son capacidades ajenas al tipo de modelo.
- No se documentan modos especiales (thinking mode, audio de entrada multiple, control de emocion o prosodia) ni capacidades multilingues declaradas.
- El autor no publica soporte para canto, control de estilo ni edicion fina del resultado mas alla del par fuente/referencia.

## Casos de uso

- Doblaje y localizacion de contenido: sustituir la voz de un actor por la de un actor de doblaje manteniendo la interpretacion original, usando la grabacion del actor de doblaje como referencia de timbre.
- Produccion de contenido para creadores: aplicar un timbre de personaje consistente a locuciones grabadas por el propio creador, sin necesidad de entrenar un modelo especifico por personaje.
- Anonimizacion de voz en datos sensibles: convertir entrevistas, llamadas o corpus de investigacion a un timbre distinto para reducir la identificabilidad del hablante en publicaciones y datasets.
- Prototipado de asistentes y personajes virtuales (el caso de uso que sugiere el nombre libwaifu): dar voz fija a un personaje de videojuego, VTuber o aplicacion interactiva a partir de una muestra de referencia.
- Postproduccion de audio para podcast y audiolibros: unificar el timbre de varias tomas grabadas con microfonos o condiciones distintas tomando como referencia una toma limpia.
- Pipelines de datos de habla para investigacion: aumentar o normalizar corpus de voz variando el timbre preservando el contenido fonetico, util para tareas de reconocimiento o diarizacion.
- Integracion en aplicaciones Rust nativas: al distribuirse en safetensors y consumirse desde libwaifu, permite incorporar conversion de voz en un binario Rust sin arrastrar el stack de Python ni PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: 553 M de parametros en float32, aproximadamente 2,2 GB (coincide con el tamano del repositorio, que incluye los dos shards safetensors).
- VRAM estimada para inferencia: no disponible de forma oficial; partiendo de los pesos en fp32 hay que sumar activaciones de HuBERT, CAMPPlus y BigVGAN. Como orientacion, el conjunto cabe holgadamente en GPUs de consumo con 6-8 GB, pero el autor no publica cifras medidas.
- GPU recomendadas: no disponible. Al no requerir el runtime libwaifu una GPU concreta, es viable tanto en GPU consumer (por ejemplo, gama RTX) como en CPU, aunque sin datos de latencia publicados no se puede confirmar cual es la opcion adecuada por rendimiento.
- Inferencia en CPU: factible en terminos de memoria por el tamano del modelo, pero la latencia no esta documentada.
- Opciones de despliegue: consumidor previsto es libwaifu (Rust), con la feature `gpl` habilitada; el ejemplo `convert` de la CLI. No se documentan rutas oficiales con vLLM, llama.cpp, Ollama ni TGI, que son herramientas de modelos de lenguaje y no aplican a este pipeline de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

En la informacion proporcionada no se identifican modelos alternativos independientes con datos comparables. La unica referencia directa es el material de origen, que no es una alternativa sino el upstream del que se exportan los pesos.

| Modelo | Naturaleza | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ling0322/libwaifu-seed-vc | Export de Seed-VC v2 para libwaifu (Rust) | 553 M (float32) | safetensors + yaml | GPL-3.0 | HuggingFace, 0 descargas, 0 likes |
| Plachta/Seed-VC (upstream) | Implementacion original de Seed-VC v2 | no disponible | no disponible (`cfm_small.pth`, `ar_base.pth`) | GPL-3.0 (segun esta ficha) | repositorio del autor original |
| Plachta/ASTRAL-quantization | Tokenizadores ASTRAL usados por el pipeline | no disponible | no disponible | GPL-3.0 (segun esta ficha) | repositorio del autor original |

Otras familias de conversion de voz (por ejemplo RVC o so-vits-svc) no aparecen en la informacion proporcionada, por lo que no se incluyen datos comparativos.

## Limitaciones y advertencias

- La licencia es GPL-3.0 tanto para el codigo como para los pesos, con caracter virulento: integrar el modelo en un producto puede obligar a liberar el codigo que lo enlaza bajo la misma licencia. El autor aisla el runtime tras la feature `gpl` de libwaifu, senal de que se trata de una restriccion deliberada.
- Los componentes auxiliares (HuBERT de Facebook, CAMPPlus de FunASR, BigVGAN v2 de NVIDIA) mantienen sus propias licencias, que hay que verificar por separado antes de cualquier uso comercial.
- Riesgo de suplantacion y fraude: la conversion de voz permite imitar a una persona concreta a partir de una muestra de referencia. Es necesario aplicar consentimiento explicito, marcas de agua o deteccion de sintesis segun el contexto legal (por ejemplo, obligaciones de transparencia sobre contenido generado).
- Sesgos: no se documentan evaluaciones de sesgo por idioma, acento, genero, edad o variedad dialectal. El rendimiento puede degradarse con voces de referencia muy distintas de la distribucion de entrenamiento original.
- Alucinacion y artefactos: no se publican tasas de error ni evaluaciones subjetivas de naturalidad (MOS). En pipelines de conversion de voz son habituales artefactos de vocoder, inestabilidad en segmentos largos y perdida de prosodia, pero no hay datos concretos para este export.
- Limites de audio: no se especifica la duracion maxima del audio de fuente ni de la grabacion de referencia, ni los formatos o frecuencias de muestreo de entrada aceptados.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en octubre de 2026. No hay validacion externa de que el export reproduzca fielmente el comportamiento del Seed-VC original.
- Fecha de creacion atipica (2026-10-02) segun los metadatos de HuggingFace; conviene verificar la procedencia del repositorio antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/ling0322/libwaifu-seed-vc
- Repositorio libwaifu: https://github.com/ling0322/libwaifu
- Documentacion del export: https://github.com/ling0322/libwaifu/blob/main/docs/seed_vc.md
- Seed-VC (upstream): https://github.com/Plachtaa/seed-vc
- Modelo base Seed-VC: https://huggingface.co/Plachta/Seed-VC
- Modelo base ASTRAL-quantization: https://huggingface.co/Plachta/ASTRAL-quantization
- Encoder de contenido: https://huggingface.co/facebook/hubert-large-ll60k
- Embeddings de hablante: https://huggingface.co/funasr/campplus
- Vocoder: https://huggingface.co/nvidia/bigvgan_v2_22khz_80band_256x
