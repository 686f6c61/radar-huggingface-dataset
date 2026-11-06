# INCModel4/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-W4A16-AutoRound

## Resumen

Nemotron-3-Nano-Omni-30B-A3B-Reasoning-W4A16-AutoRound es una version cuantizada a 4 bits del modelo multimodal nativo de NVIDIA `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`, publicada por el usuario INCModel4. La cuantizacion se ha generado con la herramienta AutoRound de Intel aplicando el esquema W4A16 (pesos de 4 bits, activaciones en 16 bits) con group_size 64 y algoritmo RTN (round-to-nearest) sin optimizacion adicional (`--iters 0`). El objetivo es reducir el peso en disco y la VRAM necesaria para servir un modelo any-to-any (texto, imagen, video y audio) manteniendo practicamente intacta la calidad respecto al original en BF16.

El modelo base es un transformer hibrido con capas Mamba y atencion, disenado para razonamiento con modo thinking y con una arquitectura MoE (el sufijo A3B indica aproximadamente 3 mil millones de parametros activos por token). Esta variante cuantizada conserva en BF16 los componentes criticos para la fidelidad multimodal y de atencion: la torre de vision, el codificador de audio, los proyectores, las proyecciones de atencion y las proyecciones Mamba adyacentes a la atencion, las convoluciones, los embeddings y el `lm_head`. Solo se cuantizan los expertos enrutados, los expertos compartidos y las proyecciones Mamba.

Es relevante ahora porque permite desplegar un modelo omni-modal de gran tamano en infraestructura mas modesta (una sola GPU de 24-48 GB, segun configuracion) usando vLLM 0.32.0, con una recuperacion media del 99,31 % en los benchmarks publicados por el autor de la cuantizacion. La licencia del modelo original (NVIDIA Nemotron Open Model License) sigue aplicandose a esta version derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Mamba y atencion, MoE, multimodal any-to-any (texto, imagen, video, audio) |
| Parametros totales | 6.871.285.734 (segun safetensors del repo cuantizado; el nombre comercial indica 30B en el modelo base) |
| Parametros activos | Aproximadamente 3B (sufijo A3B del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, group_size 64, simetrica, generada con AutoRound (RTN) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer hibrido que combina capas Mamba (state space models) con capas de atencion clasica, organizadas en un backbone de lenguaje (`language_model.backbone.layers`) y complementadas con una torre de vision (`vision_model`), un codificador de audio (`sound_encoder`) y proyectores multimodales (`mlp1`, `sound_projection`). El modelo es de tipo Mixture of Experts: la cuantizacion afecta a los expertos enrutados y compartidos, mientras que las proyecciones de atencion, el router, las convoluciones y las proyecciones Mamba adyacentes a la atencion se mantienen en BF16.

Esta ficha corresponde a una cuantizacion, no a un entrenamiento nuevo. El proceso de AutoRound aplica redondeo de pesos con descenso de gradiente con signo (paper arXiv:2309.05516), aunque en esta configuracion concreta se ha usado `--iters 0` y `--disable_opt_rtn`, lo que equivale a un RTN puro con el pipeline de AutoRound para el empaquetado W4A16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO. El modelo base incluye un modo de razonamiento (Reasoning) segun su nombre.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking (indicado por el sufijo Reasoning del modelo base).
- Procesamiento de imagen: la torre de vision se mantiene en BF16, por lo que la calidad visual no se ve afectada por la cuantizacion.
- Procesamiento de video: soportado via vLLM con `--media-io-kwargs '{"video": {"fps": 1, "num_frames": 64}}'`.
- Procesamiento de audio: el codificador de sonido y su proyector se conservan en BF16.
- Entrada y salida any-to-any (pipeline_tag `any-to-any`), lo que implica generacion multimodal ademas de comprension.
- Capacidades de codigo, matematicas y tool calling: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Integracion con vLLM 0.32.0 con `--trust-remote-code` y limites multimodales por prompt configurables.

## Casos de uso

- Asistencia multimodal en produccion: el modelo puede recibir imagen, video y audio en un mismo prompt (con limites de 1 elemento por modalidad en vLLM), adecuado para asistentes que analizan capturas de pantalla, clips y notas de voz en una sola conversacion.
- Analisis de video de vigilancia o contenido: con 64 frames a 1 fps por prompt, permite resumir o describir secuencias cortas, util para moderacion de contenido o catalogacion automatica de clips.
- Transcripcion y comprension de audio: el codificador de audio en BF16 permite tareas de resumen de reuniones o analisis de llamadas combinando audio y texto en la misma peticion.
- Razonamiento con documentos visuales: la torre de vision intacta y el modo reasoning del modelo base lo hacen apto para responder preguntas sobre diagramas, graficos o capturas tecnicas con justificacion paso a paso.
- Despliegue en hardware de gama alta de consumo o profesional: al reducir el peso del repo a 21,5 GB, es viable servirlo en una unica GPU de 24-48 GB con vLLM, lo que abarata el coste de inferencia frente al BF16.
- Prototipado e investigacion en multimodalidad: investigadores pueden experimentar con un modelo omni-modal cuantizado sin necesidad de un cluster multi-GPU, manteniendo la fidelidad de los componentes sensibles (vision, audio, atencion).

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantizacion en la model card:

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| CV-Bench-2D | 87,00 | 87,13 | 100,16 % |
| Daily-Omni | 74,27 | 73,02 | 98,31 % |
| Media | 80,63 | 80,08 | 99,31 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje o razonamiento para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 21,5 GB, por lo que se necesita al menos esa cantidad mas overhead de KV cache y buffers de activacion. En la practica, se recomienda un minimo de 32-48 GB de VRAM para servir con contexto y multimodalidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S, RTX A6000 (48 GB). En GPUs de 24 GB (RTX 4090) el margen es muy ajustado y puede requerir reducir el contexto o el numero de frames de video.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) con limitaciones de contexto y modalidad; comodo en RTX A6000 o GPUs profesionales de 48 GB.
- Opciones de despliegue: vLLM 0.32.0 con `--trust-remote-code` (soporte oficial indicado en la model card). No se confirma soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning-W4A16-AutoRound (esta ficha) | 6,87B en safetensors (30B nominal) | no disponible | W4A16 | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | 30B (nominal) | no disponible | BF16 | nvidia-nemotron-open-model-license | Hugging Face (modelo base) |
| Alternativas omni-modales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; el autor advierte explicitamente que no debe usarse como fuente de informacion fiable.
- Riesgo de generar contenido obsceno, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste fino.
- La cuantizacion W4A16 introduce una perdida de calidad medible: la recuperacion media es del 99,31 %, con una caida mas acusada en Daily-Omni (98,31 %).
- Los componentes multimodales (vision, audio, proyectores) y de atencion se mantienen en BF16, por lo que el ahorro de VRAM es menor que en una cuantizacion integral.
- La licencia nvidia-nemotron-open-model-license no es una licencia de codigo abierto estandar; es necesario revisar sus terminos para uso comercial.
- No hay informacion sobre idiomas soportados, sesgos especificos por idioma ni longitud de contexto, lo que limita la planificacion de despliegues multilingues.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no ha sido validado por la comunidad.
- El despliegue requiere `--trust-remote-code`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- Antes de desplegar cualquier aplicacion, el autor recomienda realizar pruebas de seguridad.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/INCModel4/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-W4A16-AutoRound
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
