# cyberdes-security/FastFrames-S-mobile-mlx

## Resumen

FastFrames-S mobile MLX es una conversión no oficial y cuantizada del modelo de generación de vídeo a partir de texto FastFrames-S de Apple, adaptada para ejecutarse en Apple Silicon mediante MLX. La publica el usuario `cyberdes-security` como derivado de investigación del port comunitario en BF16 de `mlx-community`, y está pensada para el motor de streaming en Swift del proyecto RTVideo y su referencia en Python. El objetivo es llevar la generación de vídeo a texto a dispositivos móviles con memoria limitada, algo que los modelos de difusión de vídeo habituales no permiten.

El modelo emplea una arquitectura de difusión basada en transformer (DiT) combinada con un refinador de caché KV, un decodificador de píxeles causal y un codificador de texto umT5-XXL. La rejilla de tokens por defecto es de 18 × 32, lo que produce fotogramas de 512 × 288 píxeles, con una tasa de reproducción de 16 fps. El motor codifica el prompt una sola vez y mantiene una caché de atención móvil, generando un fotograma en el primer paso y cuatro en cada paso posterior.

La relevancia actual reside en su enfoque de latencia interactiva y su empaquetado para iPhone: la instalación Q4 por defecto ocupa 6,79 GiB y las mediciones en Mac muestran picos de asignación MLX de 2,41 GiB en Q4 y 3,06 GiB en Q8 a 512 × 288. No obstante, se trata de un derivado no oficial con licencia restringida a investigación no comercial, y el propio autor advierte que la compatibilidad y el rendimiento en hardware físico aún deben medirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión basada en transformer (DiT) con refinador de caché KV, decodificador de píxeles causal y codificador umT5-XXL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de caché latente configurable: 2 o 4 pasos) |
| Tipos de cuantizacion | Q4 y Q8 afín (group size 64) para DiT; 8 bits para refinador KV y encoder umT5-XXL; FP16 para decodificador de píxeles; BF16 disponible |
| Idiomas soportados | no disponible |
| Licencia | Apple Machine Learning Research Model License (apple-amlr); componentes generator, umT5 y tokenizer bajo Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión de vídeo con un backbone DiT que incorpora atención propia fusionada (QKV) en las variantes cuantizadas. Sobre el DiT se apoyan tres componentes auxiliares: un refinador de caché KV en 8 bits, un decodificador de píxeles causal en FP16 y un codificador de texto umT5-XXL con proyecciones y embeddings de tokens en 8 bits. El motor mantiene una caché de atención móvil con un fotograma sumidero (sink) y una ventana de historia latente que cambia según la resolución: dos pasos latentes en 512 × 288 y cuatro en 832 × 480. Cada clip genera 17 fotogramas de salida.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card remite al paper original de FastFrames (arXiv:2611.23226) para los detalles de entrenamiento. La innovación técnica destacable es la conversión a MLX con cuantización selectiva por componente y la integración en un motor de streaming que permite generación incremental de fotogramas con latencia interactiva en Apple Silicon.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable de 512 × 288 o 832 × 480 píxeles.
- Generación por streaming: el primer paso produce un fotograma y los siguientes cuatro, con reproducción a 16 fps.
- Codificación única del prompt con caché de atención móvil para evitar recómputo en pasos sucesivos.
- Ejecución en Apple Silicon mediante MLX, con variantes Q4, Q8 y BF16.
- Integración con un motor en Swift y una referencia en Python que devuelve fotogramas RGB en uint8.
- Soporte de control de resolución que ajusta simultáneamente la ventana de historia latente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.

## Casos de uso

- Generación de vídeo en dispositivo móvil: el modelo está empaquetado para una app Flutter en iPhone con iOS 17 o superior, lo que permite crear clips de 17 fotogramas sin conexión a servidores externos, aprovechando la cuantización Q4 de 6,79 GiB.
- Prototipado rápido de vídeo generativo en Mac: la referencia en Python con MLX permite iterar sobre prompts y semillas con picos de memoria de 2,41 GiB en Q4, adecuado para investigación en estaciones de trabajo Apple Silicon.
- Investigación en eficiencia de difusión de vídeo: la comparación de PSNR entre Q4, Q8 y BF16 facilita estudiar el impacto de la cuantización en la calidad visual con métricas reproducibles.
- Demos interactivas y aplicaciones de previsualización: la tasa de 16 fps y la generación incremental permiten mostrar clips cortos en tiempo casi real en entornos controlados.
- Evaluación de licencias y derivados: sirve como caso de estudio de conversión de modelos de investigación de Apple a formatos comunitarios (MLX) con componentes bajo licencias mixtas.
- Integración en pipelines de investigación con Swift Package Manager: el motor de streaming puede incorporarse a proyectos Swift que necesiten generación de vídeo local en Apple Silicon.

## Benchmarks y rendimiento

Los datos disponibles son mediciones internas del autor sobre Mac con Swift/MLX, semilla 3, 512 × 288, ventana 2 y cinco pasos latentes por clip. La PSNR se calcula frente a la ejecución con DiT en BF16 como referencia.

| DiT | PSNR zorro | PSNR costa | Pico de asignación MLX (dos ejecuciones) |
|---|---:|---:|---:|
| Q4 | 17,90 dB | 16,78 dB | 2,41 GiB |
| Q8 | 22,43 dB | 30,22 dB | 3,06 GiB |
| BF16 | referencia | referencia | 4,16 GiB |

A 832 × 480, la ejecución Q8 del prompt del zorro alcanzó 3,90 GiB con ventana 2 y 4,43 GiB con ventana 4; los cinco pasos de generación tardaron 15,96 s y 16,20 s respectivamente, excluyendo la codificación del prompt y la exportación de archivos. Con el código de previsualización GIF de la app a 832 × 480 y ventana 4, los picos fueron de 3,77 GiB (Q4), 4,42 GiB (Q8) y 5,64 GiB (BF16). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,41 GiB de pico en Q4 y 3,06 GiB en Q8 a 512 × 288; hasta 4,43 GiB en Q8 a 832 × 480 con ventana 4.
- Almacenamiento: 6,79 GiB (Q4), 7,44 GiB (Q8) y 8,66 GiB (BF16) incluyendo archivos compartidos.
- GPU recomendadas: Apple Silicon (M-series) con MLX; el autor no especifica modelos concretos de chip.
- Compatibilidad con GPU de consumo: orientado a Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD.
- Despliegue: MLX (Python) y motor Swift/MLX para iOS 17 o superior; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: cinco pasos de generación en 15,96-16,20 s a 832 × 480 en Mac; reproducción a 16 fps; el rendimiento en iPhone físico queda pendiente de medición según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| FastFrames-S mobile MLX | Text-to-video DiT cuantizado | 512 × 288 / 832 × 480 | Apple AMLR (no comercial) | Hugging Face, MLX |
| apple/FastFrames-S | Text-to-video DiT original | no disponible en la información | Apple AMLR | Hugging Face |
| mlx-community/FastFrames-S-bf16-mlx | Port BF16 en MLX | no disponible en la información | según modelo base | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: no está publicado por Apple y puede divergir del modelo original.
- Licencia Apple AMLR restringida a investigación científica no comercial; el uso comercial requiere revisión legal de los términos.
- Licencias mixtas: el refinador y el decodificador de píxeles son componentes AMLR, mientras que el generador, umT5 y el tokenizer son Apache 2.0; hay que respetar ambas.
- Rendimiento y compatibilidad en iPhone físico sin medir según el propio autor; los datos provienen de ejecuciones en Mac.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de artefactos visuales y degradación de calidad con cuantización Q4 (PSNR de 16,78-17,90 dB frente a BF16).
- Ventana de contexto latente limitada (2 o 4 pasos) y clips de solo 17 fotogramas, lo que restringe la duración y coherencia temporal.
- Sin datos publicados sobre sesgos, alucinaciones visuales o robustez frente a prompts adversarios.
- Dependencia del ecosistema MLX y Apple Silicon; no hay soporte documentado para otras plataformas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cyberdes-security/FastFrames-S-mobile-mlx)
- [Modelo original de Apple](https://huggingface.co/apple/FastFrames-S)
- [Port comunitario BF16 en MLX](https://huggingface.co/mlx-community/FastFrames-S-bf16-mlx)
- [Paper FastFrames (arXiv:2611.23226)](https://arxiv.org/abs/2611.23226)
- [Licencia Apple AMLR](https://huggingface.co/cyberdes-security/FastFrames-S-mobile-mlx/blob/main/LICENSE-APPLE-AMLR)
- [Model card y citación de Apple](https://huggingface.co/apple/FastFrames-S#citation)
