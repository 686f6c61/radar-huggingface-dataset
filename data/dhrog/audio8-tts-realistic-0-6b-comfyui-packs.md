# Dhrog/Audio8-TTS-Realistic-0.6b-ComfyUI-Packs

## Resumen

Audio8-TTS-Realistic-0.6b-ComfyUI-Packs es un reempaquetado comunitario del modelo de síntesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicado por el usuario Dhrog. El objetivo no es entrenar un modelo nuevo, sino convertir el directorio original de Edge0 (modelo de lenguaje, códec a 44,1 kHz, tokenizador y ficheros del procesador) en un único fichero `.safetensors` que el selector `diffusion_models` de ComfyUI pueda listar y cargar de forma nativa. Se ofrecen dos variantes: una pérdida en BF16 y otra con cuantización de pesos INT8.

El modelo subyacente es un sistema de text-to-speech de aproximadamente 0,6 mil millones de parámetros con capacidad de clonación de voz, distribuido bajo licencia Apache-2.0. La relevancia de este repositorio es práctica: elimina la necesidad de gestionar directorios con múltiples ficheros dentro de ComfyUI y añade una ruta de carga de menor peso (INT8), a costa de una velocidad de generación notablemente inferior a la del pack BF16.

Conviene subrayar que se trata de un artefacto de distribución, no de un modelo oficial de Edge0. Los pesos son idénticos a los del upstream salvo por la cuantización INT8 descrita, y el repositorio incluye las herramientas y los nodos necesarios (ComfyUI-Audio8TTS) para ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje + códec de audio a 44,1 kHz; detalles del backbone no especificados en la informacion disponible) |
| Parametros totales | aproximadamente 0,6 mil millones (0.6b) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales) e INT8 weight-only (ConvRot, 8 bits con escalas por canal, activaciones en BF16) |
| Idiomas soportados | 23 idiomas segun el modelo upstream; la calidad varia por idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (packs de fichero unico); upstream tambien incluye codec.pth |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo de lenguaje ni la composicion del dataset de entrenamiento. Lo que si se documenta es que el sistema combina un modelo de lenguaje con un codec de audio que opera a 44,1 kHz, junto con tokenizador y procesador propios. El pipeline declarado es text-to-speech con soporte de clonacion de voz.

El repositorio no aporta informacion sobre volumen de tokens de entrenamiento, tecnicas de alineamiento (RLHF/DPO) ni innovaciones como decodificacion especulativa. Lo relevante tecnicamente aqui es el proceso de empaquetado: el pack BF16 es una agregacion sin perdida y determinista del directorio fuente (reempaquetar el mismo directorio reproduce bytes de tensor identicos), mientras que el pack INT8 aplica cuantizacion de pesos ConvRot con escalas por canal y mantiene las activaciones en BF16. Segun las mediciones del autor, la cuantizacion INT8 es determinista entre cargas y el pack INT8 es bit-identico a la cuantizacion INT8 al vuelo del pack BF16 (diferencia maxima 0,0 sobre un render de 491.520 muestras).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con salida de audio a 44,1 kHz.
- Clonacion de voz: los nodos incluyen `Audio8 Encode Reference`, `Audio8 Save Voice` y `Audio8 Load Voice`, lo que permite registrar y reutilizar voces de referencia.
- Soporte multilingue: 23 idiomas segun el upstream, con calidad variable por idioma.
- Integracion nativa en ComfyUI mediante el nodo `Audio8 Model Loader` y el resto de nodos del paquete ComfyUI-Audio8TTS.
- Seleccion automatica de la ruta de computo a partir de los metadatos del pack (`audio8_quant=int8_convrot`), no del nombre del fichero.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio de entrada (ASR) ni modo de razonamiento.

## Casos de uso

- Doblaje y localizacion de contenido: el soporte de 23 idiomas permite generar pistas de voz en distintos idiomas a partir del mismo guion, reutilizando una voz de referencia clonada para mantener coherencia entre versiones.
- Produccion de audiolibros y narraciones: la clonacion de voz permite fijar un timbre concreto y generar capitulos completos por lotes dentro de un grafo de ComfyUI, guardando la voz con `Audio8 Save Voice` para reutilizarla entre sesiones.
- Prototipado de asistentes de voz: integrado en ComfyUI, se puede encadenar la generacion de texto y la sintesis en un mismo grafo para iterar rapidamente sobre el tono y la prosodia antes de llevar el sistema a produccion.
- Generacion de voces para videojuegos y animacion: la carga de voces de referencia permite asignar timbres distintos a personajes y regenerar lineas de dialogo sin volver a grabar actores.
- Accesibilidad y lectura de contenido: conversion de articulos o documentos a audio con una voz clonada del propio usuario o de un locutor autorizado, desplegable en local sin depender de APIs externas.
- Creacion de contenido para redes y podcasts: generacion de locuciones en BF16 cuando prima la velocidad (aproximadamente 54 tok/s medidos) y en INT8 cuando el objetivo es reducir el espacio en disco y el tiempo de descarga (un 16 % menos de tamano) en equipos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la informacion disponible. El autor unicamente reporta mediciones locales de velocidad en una instancia de ComfyUI con cu128, 256 frames, muestreo greedy, `cuda_graphs=true`, `cuda_graph_scope=frame` y `comfy_ops=false`:

| Metrica | BF16 | INT8 |
|---|---|---|
| Throughput | aproximadamente 54 tok/s | 30,4 tok/s |
| Tiempo total, modo eager (256 frames) | no disponible | 32,62 s |
| Tiempo total, modo `fast` (256 frames) | no disponible | 16,44 s |
| Tiempo total, modo `frame` (256 frames) | no disponible | 8,43 s |
| Tamano del fichero | 2.567.214.504 bytes | 2.147.558.576 bytes |

El propio autor concluye que BF16 sigue siendo la ruta mas rapida y que INT8 aporta sobre todo ahorro de memoria y de tamano de descarga.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, los packs pesan entre 2,1 GB (INT8) y 2,6 GB (BF16) en disco, por lo que la inferencia requiere al menos esa cantidad de memoria mas el espacio para activaciones y el codec; el INT8 reduce la huella de pesos en un 16 %.
- GPU recomendadas: no especificadas en la informacion disponible. Las mediciones se realizaron en una instancia con CUDA 12.8 (cu128) y `cuda_graphs` habilitado.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del modelo (0,6b) es plausible en tarjetas consumer con suficiente VRAM, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: ComfyUI con los nodos ComfyUI-Audio8TTS (ruta nativa de estos packs); para inferencia con Transformers se debe usar el repositorio original de Edge0.
- Latencia y throughput: BF16 aproximadamente 54 tok/s; INT8 30,4 tok/s con 32,62 s (eager), 16,44 s (`fast`) y 8,43 s (`frame`) para 256 frames.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo de referencia estructural, se puede contrastar con el propio upstream:

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Dhrog/Audio8-TTS-Realistic-0.6b-ComfyUI-Packs | aproximadamente 0,6b | 23 (segun upstream) | safetensors unico (BF16 e INT8) | Apache-2.0 | Reempaquetado comunitario para ComfyUI |
| Edge0/Audio8-TTS-Realistic-0.6b | aproximadamente 0,6b | 23 | directorio con model.safetensors y codec.pth | Apache-2.0 | Modelo original; inferencia con Transformers |
| Edge0/Audio8-TTS-Realistic-Air | aproximadamente 0,6b | 23 | identico al anterior (objetos LFS byte-identicos) | Apache-2.0 | Mismo release publicado bajo nombre nuevo el 2026-11-02 |
| Edge0/Audio8-TTS-Preview-0.6b | aproximadamente 0,6b | no disponible | no disponible | no disponible | Comparte solo el codec, no los pesos del modelo de lenguaje |

## Limitaciones y advertencias

- Es un reempaquetado comunitario, no un release oficial de Edge0; para incidencias de calidad del modelo hay que remitirse al upstream.
- La calidad por idioma varia entre los 23 soportados; el autor remite a la model card original para las evaluaciones.
- La cuantizacion INT8 es weight-only: las activaciones permanecen en BF16 y no se ofrecen garantias de precision mas alla de las mediciones de velocidad y determinismo reportadas.
- El pack INT8 es mas lento que el BF16 (30,4 frente a aproximadamente 54 tok/s); no debe elegirse por rendimiento sino por ahorro de memoria y de descarga.
- Los packs estan pensados para el flujo de nodos de ComfyUI; la inferencia con Transformers debe hacerse sobre el repositorio original.
- Riesgo de uso indebido de la clonacion de voz: la licencia Apache-2.0 no incorpora salvaguardas eticas ni tecnicas, por lo que la responsabilidad sobre consentimiento y derechos de las voces clonadas recae en el desplegador.
- No hay informacion publicada sobre sesgos, tasa de alucinacion en la prosodia ni limites de longitud de contexto; deben validarse empiricamente antes de un uso en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Dhrog/Audio8-TTS-Realistic-0.6b-ComfyUI-Packs
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Release alternativo del upstream: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Predecesor (comparte solo el codec): https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Nodos de ComfyUI, herramientas de empaquetado y tests: https://github.com/Pepehoschi/ComfyUI-Audio8TTS
