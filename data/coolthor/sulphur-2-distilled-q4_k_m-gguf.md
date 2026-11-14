# coolthor/Sulphur-2-distilled-Q4_K_M-GGUF

## Resumen

Sulphur-2-distilled-Q4_K_M-GGUF es una redistribución cuantizada en formato GGUF del transformer de difusión destilado de SulphurAI/Sulphur-2-base, un modelo de generación conjunta de vídeo y audio. La conversión la mantiene el usuario coolthor y no es una publicación oficial ni de SulphurAI ni de Lightricks. El paquete incluye el DiT cuantizado en Q4_K_M, los componentes auxiliares de proyección de texto y audio en BF16, el VAE de vídeo completo de LTX y un workflow de ComfyUI validado.

El interés del modelo reside en su enfoque de despliegue: está pensado para GPUs NVIDIA antiguas sin tensor cores nativos para NVFP4, en particular la arquitectura Turing. En una RTX 2080 Ti modificada a 22 GB, el autor reporta 53,083 s de mediana por clip frente a 142,434 s del checkpoint NVFP4 equivalente, con un pico de VRAM de 18.050 MiB frente a 21.792 MiB, en el mismo flujo de trabajo controlado.

El modelo genera vídeo a 832×480 y 24 fps con audio estéreo a 48 kHz en 8 pasos de muestreo, gracias a la destilación. Con 21.005.004.544 parámetros en el DiT, el paquete completo ocupa 18,3 GB e incluye el encoder de texto Gemma-3-12B como dependencia externa que no se distribuye en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de vídeo y audio conjunto, derivado de LTX-2.3, destilado |
| Parametros totales | 21.005.004.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repo); el base se distribuye en BF16 y existe un checkpoint NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | GGUF (DiT) + safetensors BF16 (auxiliares y VAE) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión destilado que opera de forma conjunta sobre latentes de vídeo y de audio, con una topología heredada de LTX-2.3. El checkpoint original en BF16 combina en un único archivo el DiT, la proyección de texto, los VAE de vídeo y audio y el vocoder; la conversión a GGUF separa esas piezas y cuantiza únicamente el DiT, que consta de 4.444 tensores. El layout GGUF resultante contiene 2.672 tensores F32, 28 BF16, 1.376 Q4_K y 368 Q6_K. El checkpoint auxiliar contiene exactamente 4 tensores de proyección de texto, 102 del VAE de audio y 1.227 del vocoder, todos en BF16.

El proceso de destilación permite reducir el muestreo a 8 pasos con CFG 1.0, sampler Euler y el scheduler LTXVScheduler con max_shift 2.05, base_shift 0.95 y terminal 0.1. No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La aritmética de frames está documentada: los frames de vídeo siguen la fórmula (N × 8) + 1 y los frames latentes de audio equivalen a video_frames × 4 − 3, de modo que 73 frames de vídeo producen 289 frames de audio y 3,04 segundos a 24 fps.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución probada de 832×480 y 24 fps.
- Generación de vídeo a partir de imagen (image-to-video), según los tags del repositorio; el autor advierte que esta modalidad requiere evaluación más amplia.
- Generación conjunta de vídeo y audio en una sola pasada de muestreo, con salida AAC estéreo a 48 kHz.
- Generación de audio condicionada por texto (text-to-audio-video) mediante el VAE de audio y el vocoder incluidos en el checkpoint auxiliar.
- Muestreo destilado en 8 pasos, lo que reduce el coste computacional frente a modelos de difusión no destilados.
- Integración con ComfyUI mediante nodos nativos de LTX-2.3 AV y el nodo UnetLoaderGGUF de ComfyUI-GGUF.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible; la información no documenta el comportamiento por idioma del encoder de texto Gemma-3-12B en este contexto.

## Casos de uso

- Generación de clips cortos para redes sociales: el modelo produce vídeos de 3 a 6 segundos con audio integrado en 8 pasos, adecuado para prototipado rápido de contenido vertical u horizontal a 832×480.
- Previsualización de storyboards con audio: guionistas y equipos de preproducción pueden convertir descripciones textuales en clips con sonido ambiente o diálogo sintetizado para validar ritmo y puesta en escena antes de producir.
- Despliegue en hardware de gama alta consumer: al caber en 18.050 MiB de pico en una RTX 2080 Ti de 22 GB, permite montar un nodo de generación local sin depender de GPUs de centro de datos.
- Integración en pipelines de ComfyUI: el workflow JSON validado permite automatizar la generación mediante la API de ComfyUI, encadenando lotes con seeds fijas para pruebas A/B de prompts.
- Generación de material audiovisual para videojuegos y prototipos: clips cortos con audio sincronizado sirven como placeholders animados en motores o demos interactivas.
- Investigación sobre cuantización de modelos de difusión: el paquete permite comparar Q4_K_M frente a NVFP4 y BF16 con seeds emparejadas, midiendo latencia, VRAM y coherencia visual en un entorno reproducible.
- Creación de contenido accesible con pista de audio: la salida AAC a 48 kHz facilita la publicación directa en plataformas que exigen audio integrado, sin postproceso de muxing.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a una prueba controlada del autor en una RTX 2080 Ti de 22 GB, con resolución 832×480, 73 frames (3,04 s a 24 fps), 8 pasos destilados, Euler, CFG 1.0, VAE completo de LTX, muestreo conjunto de vídeo y audio, mismas seeds emparejadas y orden de ejecución recíproco.

| Formato | N | Mediana de tiempo | Rango | VRAM pico |
|---|---:|---:|---|---:|
| GGUF Q4_K_M | 10 | 53,083 s | 52,061–53,097 s | 18.050 MiB |
| NVFP4 | 10 | 142,434 s | 141,402–142,467 s | 21.792 MiB |

El formato Q4_K_M resultó 2,683 veces más rápido, con una reducción del 62,7 % del tiempo de pared y un ahorro de 3.742 MiB (3,65 GiB, 17,2 %) de VRAM pico. Una ejecución de sanity check separada de 6 segundos (832×480, 145 frames, 8 pasos, seed nueva) completó en 96,080 s en caliente y produjo un H.264 de 6,042 s con AAC estéreo a 48 kHz; la ejecución en frío equivalente tardó 278,714 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 18.050 MiB de pico medidos en el flujo de referencia a 832×480 y 73 frames; el paquete completo en disco ocupa 18,3 GB, con el DiT Q4_K_M en 13,22 GiB, los auxiliares BF16 en 2,49 GiB y el VAE en 1,35 GiB.
- GPU recomendadas: RTX 2080 Ti de 22 GB (probada), GPUs Turing con VRAM suficiente; el autor advierte que en Blackwell (RTX 5090, GB10) NVFP4 puede ser preferible por sus tensor cores FP4 nativos.
- Cabe en GPU consumer: sí, en RTX 2080 Ti de 22 GB; no se documenta el comportamiento en GPUs de 8, 12 o 16 GB, y hay que sumar el encoder de texto Gemma-3-12B, que no se incluye y consume VRAM o RAM adicional.
- Opciones de despliegue: ComfyUI 0.28.0 con nodos nativos LTX-2.3 AV y ComfyUI-GGUF (commit 6ea2651 probado), PyTorch 2.6.0+cu124 y flag --force-fp16.
- Latencia y throughput: 53,083 s de mediana por clip de 3,04 s en RTX 2080 Ti; 96,080 s en caliente para un clip de 6,042 s. No se dispone de datos de throughput en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sulphur-2-distilled Q4_K_M (este repo) | 21.005.004.544 | no disponible | GGUF + safetensors | ltx-2-community-license-agreement | Optimizado para Turing; 53,083 s por clip en RTX 2080 Ti |
| Sulphur-2 NVFP4 | no disponible en la información | no disponible | NVFP4 | ltx-2-community-license-agreement | 142,434 s por clip en RTX 2080 Ti; 21.792 MiB pico |
| Sulphur-2-base BF16 | 21.005.004.544 | no disponible | safetensors BF16 | ltx-2-community-license-agreement | Checkpoint original sin cuantizar; sin métricas de latencia publicadas en la información |
| LTX-2 / LTX-2.3 (Lightricks) | no disponible | no disponible | no disponible | ltx-2-community-license-agreement | Familia base sobre la que se construye Sulphur; sin datos comparativos en la información |

## Limitaciones y advertencias

- El GGUF contiene únicamente el transformer de difusión; sin el checkpoint auxiliar BF16 y el VAE completo, fallan la proyección de texto, la generación de audio o la decodificación de vídeo.
- El encoder de texto Gemma-3-12B no se incluye y debe obtenerse por separado; su tamaño condiciona el consumo total de VRAM y RAM más allá de los 18 GB del DiT.
- El autor no reclama equivalencia de calidad exacta con el modelo original: la comprobación visual emparejada no halló regresiones catastróficas, pero caras, manos, renderizado de texto, image-to-video y clips largos requieren una evaluación más amplia.
- La cuantización puede divergir composicionalmente incluso con la misma seed, según advierte el propio autor.
- Los resultados de rendimiento son específicos de Turing y no deben extrapolarse a Blackwell, donde NVFP4 puede ser más rápido.
- La licencia ltx-2-community-license-agreement impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue en producción.
- El repositorio está etiquetado como not-for-all-audiences, lo que implica riesgo de generar contenido inapropiado sin filtrado adicional.
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación visual en la información disponible.
- No se han publicado métricas de calidad perceptual formales ni comparativas con otros modelos de vídeo de la competencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/Sulphur-2-distilled-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/SulphurAI/Sulphur-2-base
- Licencia LTX-2 community: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Repositorio LTX-2 de Lightricks: https://github.com/Lightricks/LTX-2
