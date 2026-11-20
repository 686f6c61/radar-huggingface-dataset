# DmitryDB/LTX-2.3-ComfyUI-Quants

## Resumen

LTX-2.3-ComfyUI-Quants es un repositorio de checkpoints de difusion cuantizados en int8, empaquetados para su uso directo en ComfyUI, del modelo de generacion de video LTX-2.3 desarrollado originalmente por Lightricks. El autor del repositorio, DmitryDB, no es el desarrollador del modelo base: se trata de una redistribucion comunitaria de pesos cuantizados y de los ficheros auxiliares necesarios (VAE de video, VAE de audio con vocoder, proyeccion de texto y un text encoder Gemma 3 12B IT QAT). El repositorio incluye tanto las variantes oficiales dev y distilled de LTX-2.3 como derivados comunitarios (10Eros y Sulphur).

El modelo base es un sistema de generacion de video con soporte de audio, con 22B parametros en la variante de difusion (`ltx-2.3-22b-dev` y `ltx-2.3-22b-distilled-1.1`). La cuantizacion a int8 con el esquema "lean-Convrot" reduce cada checkpoint de difusion a aproximadamente 20 GiB, lo que lo hace manejable en GPUs de 24-48 GB de VRAM, aunque sigue siendo un modelo de gama alta. La relevancia actual radica en que facilita el despliegue local de un generador de video-audio de gran tamano dentro del ecosistema ComfyUI sin necesidad de infraestructura de datacenter.

La informacion disponible es limitada: el repositorio no incluye model card tecnica detallada, no publica benchmarks, no especifica la licencia concreta (solo "other") y no documenta los idiomas soportados. Esta ficha refleja exclusivamente lo que el autor declara en el README y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (modelo de video generativo con rama de audio); detalles internos no disponibles |
| Parametros totales | 22B en las variantes oficiales (`ltx-2.3-22b-dev`, `ltx-2.3-22b-distilled-1.1`); tamano de 10Eros y Sulphur no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (esquema "lean-Convrot"); ficheros auxiliares en bf16 |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifica el texto de la licencia) |
| Formato de pesos | safetensors (int8 para difusion, bf16 para VAE, text encoder y upscalers) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por la estructura de ficheros se deduce un pipeline de difusion para video con componentes separados: un modelo de difusion principal (22B en las variantes oficiales), un VAE de video (`ltx23_video_vae_bf16.safetensors`, 1,353 GiB), un VAE de audio con vocoder (`ltx23_audio_vae_vocoder_bf16.safetensors`, 0,340 GiB), una proyeccion de texto (`LTX23_text_projection_bf16.safetensors`, 2,153 GiB) y un text encoder Gemma 3 12B IT QAT (`gemma_3_12b_it_qat_bf16.safetensors`, 22,705 GiB). El flujo "split" que describe el autor empareja Gemma 3 12B IT QAT con la proyeccion de texto de LTX23, lo que sugiere una arquitectura de difusion condicionada por embeddings de un LLM externo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El autor indica explicitamente que la subida "no constituye nuevas pruebas de inferencia o rendimiento", es decir, que no ha reentrenado ni evaluado el modelo, solo cuantizado y empaquetado. La innovacion tecnica destacable del repositorio es la cuantizacion int8 del checkpoint de difusion a ~20 GiB y la separacion en ficheros independientes (difusion, VAE de video, VAE de audio, upscalers latentes) que permite cargar solo lo necesario en ComfyUI.

## Capacidades

- Generacion de video a partir de prompts de texto, usando el modelo de difusion LTX-2.3 como componente principal.
- Generacion de audio asociada al video, mediante el VAE de audio y el vocoder incluidos.
- Soporte de schedules separados para las variantes dev y distilled, segun indica el autor.
- Upscaling espacial opcional mediante los modelos latentes `ltx-2.3-spatial-upscaler-x2-1.1` (x2) y `ltx23_latent_upscaler_x1.5_bf16` (x1,5).
- Integracion con ComfyUI como entorno de ejecucion, con loaders especificos para cada tipo de fichero.
- Variantes comunitarias (10Eros v1.3 y v1.4, Sulphur dev y distil) con posibles diferencias de comportamiento que el autor advierte que deben verificarse por fichero.

## Casos de uso

- Generacion de clips de video cortos a partir de descripciones textuales en local: el pipeline completo (difusion + VAE de video + text encoder) se carga en ComfyUI y permite producir video sin depender de APIs externas, adecuado para prototipado creativo y pruebas de concepto.
- Creacion de video con pista de audio sincronizada: al incluir VAE de audio y vocoder, el modelo puede generar contenido audiovisual conjunto, util para demos, animaticos o contenido para redes.
- Iteracion rapida con la variante distilled: el schedule distilled de `ltx-2.3-22b-distilled-1.1` esta pensado para menos pasos de muestreo, lo que reduce el coste por generacion en fases de exploracion de prompts.
- Refinado y ampliacion de resolucion: los upscalers latentes x1,5 y x2 permiten generar primero a baja resolucion y luego escalar, ahorrando VRAM y tiempo en el primer paso.
- Experimentacion con derivados comunitarios: las variantes 10Eros y Sulphur permiten comparar estilos o comportamientos alternativos sobre la misma base, util para investigacion aplicada en generacion de video.
- Despliegue en estaciones de trabajo con GPU unica de gama alta: al estar cuantizado a int8 (~20 GiB por checkpoint de difusion), el modelo cabe en GPUs de 24-48 GB, lo que habilita flujos de produccion de video en equipos locales de un solo nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint de difusion int8 ocupa ~20 GiB; sumando el text encoder Gemma 3 12B en bf16 (~22,7 GiB) y los VAE (~1,7 GiB), el pipeline completo supera los 44 GiB si se cargan todos los componentes simultaneamente. Es probable que ComfyUI descargue el text encoder tras la codificacion, reduciendo el pico, pero no se documenta.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB o similares para el pipeline completo; una RTX 4090 de 24 GB podria ejecutar solo el checkpoint de difusion int8, pero no el text encoder Gemma 3 12B en bf16 de forma concurrente.
- Cabe en consumer GPU: parcialmente; una RTX 4090 (24 GB) puede alojar el checkpoint de difusion int8, pero el pipeline completo requiere mas memoria o descarga secuencial de componentes.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles; el autor indica que no ha realizado pruebas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (Lightricks, oficial) | 22B (dev/distilled) | no disponible | no disponible | safetensors (upstream) | Hugging Face (Lightricks/LTX-2.3) |
| LTX-2.3-ComfyUI-Quants (este repo) | 22B (int8) | no disponible | other | safetensors int8 + bf16 | Hugging Face (DmitryDB) |
| Comfy-Org/ltx-2.3 | no disponible | no disponible | no disponible | safetensors | Hugging Face (Comfy-Org) |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria (por ejemplo, otros generadores de video-audio open source) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es una release oficial de Lightricks: es una redistribucion comunitaria de pesos cuantizados, sin garantias de soporte ni de paridad con el modelo upstream.
- La licencia se declara como "other" sin texto asociado; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base LTX-2.3 en el repositorio de Lightricks.
- No se documentan sesgos, idiomas soportados ni evaluaciones de calidad; no hay datos para valorar riesgo de alucinacion o fidelidad al prompt.
- El autor advierte que las variantes 10Eros y Sulphur son derivados comunitarios y que su compatibilidad exacta con los flujos de trabajo debe verificarse fichero por fichero.
- El pipeline completo excede la VRAM de GPUs consumer de 24 GB si se cargan todos los componentes a la vez; el despliegue requiere planificacion de memoria.
- No hay pruebas de rendimiento ni latencias publicadas; el rendimiento real en produccion es desconocido.
- La fecha de creacion del repositorio (2026-11-20) y la ausencia de descargas o likes indican que es una subida reciente y sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DmitryDB/LTX-2.3-ComfyUI-Quants
- Modelo base LTX-2.3 (Lightricks): https://huggingface.co/Lightricks/LTX-2.3
- Repositorio Comfy-Org para LTX-2.3: https://huggingface.co/Comfy-Org/ltx-2.3
- Text encoder Gemma 3 12B IT QAT: https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized
