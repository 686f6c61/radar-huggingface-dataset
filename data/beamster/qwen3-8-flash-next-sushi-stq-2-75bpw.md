# beamster/Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw es una cuantización del modelo Qwen3.8-Flash-Next (desarrollado por el equipo Qwen) empaquetada específicamente para **sushi**, un motor de inferencia nativo para Apple Silicon. El pack ha sido creado por el usuario beamster y no es un modelo nuevo en sí mismo, sino una versión comprimida que promedia 2,75 bits por peso mediante la técnica STQ (Sushi Trellis Quant), con el objetivo de ejecutar un modelo multimodal muy grande en hardware Mac con la menor huella de memoria posible.

El modelo base es un MoE multimodal (image-text-to-text) de 27.118.980.499 parámetros según los metadatos de safetensors, con soporte de contexto de hasta 1.048.576 tokens mediante YaRN x4 sobre una ventana nativa de 262.144 tokens. Su relevancia radica en que permite cargar un modelo de esta escala en GPUs unificadas de Apple Silicon, algo inviable con pesos en BF16, manteniendo una fidelidad razonable frente al checkpoint original (KLD de 0,0295 en la lectura de ocho categorías).

Es importante destacar que este pack **solo funciona con sushi v1.3.0 o superior** en Apple Silicon con macOS 26.2 o posterior; no carga en transformers, vLLM, mlx-lm ni exllamav3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (expertos enrutados + componentes densos, con GDN, hyper-connections, indexer, MTP head y torre de visión Qwen3-VL ViT) |
| Parametros totales | 27.118.980.499 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantizacion | STQ (Sushi Trellis Quant, codebook SPEC1) para expertos enrutados, 2-4 bits mezclados (media 2,75 bpw); 8-bit afín para la parte densa; 4-bit afín (grupo 32) para la tabla de n-gramas |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | safetensors (formato propio del pack sushi) |

Datos adicionales del pack:

| Parametro | Valor |
|---|---|
| Tamano del repo | 81,5 GB |
| Disco requerido | ~76 GiB (46,1 GiB de pesos + 29,8 GiB de tabla de n-gramas) |
| Memoria GPU pico (scoring) | 49,6 GB |
| Descargas | 358 |
| Likes | 6 |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, es un modelo MoE (mixture of experts) multimodal con 48 capas de expertos enrutados (512 expertos por capa, más una capa MTP), componentes densos que incluyen atención, GDN (gated delta net, sugerido por la etiqueta de arquitectura híbrida attention + GDN), expertos compartidos, hyper-connections, un indexer, embedding y lm_head. Incluye además una torre de visión Qwen3-VL ViT que habilita entrada de imagen y vídeo, y una cabeza MTP (multi-token prediction) presumiblemente para decodificación especulativa. La tabla de embeddings de n-gramas sugiere un mecanismo de especulación por n-gramas cuya tabla se lee directamente del SSD sin ocupar memoria de GPU.

En cuanto al entrenamiento del modelo base, la información disponible no detalla número de tokens, composición del dataset ni uso de RLHF/DPO: no disponible. Este repositorio en concreto no modifica los pesos del modelo base más allá de la cuantización: los expertos enrutados se comprimen con STQ usando el codebook SPEC1 con tasas mixtas de 2 a 4 bits por banco de expertos (2,75 bits por peso de media), la parte densa se cuantiza a 8 bits afín y la tabla de n-gramas a 4 bits afín con grupo 32.

## Capacidades

- Generación de texto conversacional (pipeline conversational).
- Entrada multimodal: imágenes y vídeo gracias a la torre de visión Qwen3-VL ViT incluida en el pack (pipeline image-text-to-text).
- Contexto ultra-largo: hasta 1.048.576 tokens con YaRN x4, adecuado para documentos extensos, repositorios de código o sesiones muy largas.
- Decodificación especulativa vía MTP head incluido y tabla de n-gramas para acelerar la generación.
- Arquitectura MoE con 48 capas de expertos enrutados (512 expertos por capa) y expertos compartidos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (aunque el fixture de calidad incluye una categoría multilingual, no se especifican idiomas soportados).

## Casos de uso

- Ejecución local en Mac de gama alta: el pack está diseñado para Apple Silicon, permitiendo ejecutar un MoE multimodal de ~27 mil millones de parámetros en máquinas con GPU unificada de ~64 GB o más, sin depender de datacenters.
- Análisis de documentos largos: con 1.048.576 tokens de contexto, se pueden procesar libros completos, expedientes jurídicos o bases de código enteras en una sola sesión.
- Asistente multimodal local: la torre de visión permite describir, analizar y razonar sobre imágenes y vídeos sin enviar datos a la nube, útil para flujos con requisitos de privacidad.
- Prototipado de agentes con contexto extenso: la ventana de un millón de tokens permite mantener historiales de conversación y herramientas muy largos en agentes de múltiples pasos.
- Generación y revisión de código sobre repositorios grandes: el contexto amplio y la cuantización de baja fidelidad-perdida (KLD 0,0295) lo hacen adecuado para razonar sobre bases de código completas cargadas en contexto.
- Investigación en cuantización extrema: el pack sirve como referencia reproducible de la técnica STQ a 2,75 bpw, con métricas KLD publicadas contra el checkpoint BF16.
- Transcripción y análisis de vídeo: la aceptación de entrada de vídeo permite tareas como resumen de grabaciones o extracción de información visual secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este pack. El autor publica métricas de fidelidad de cuantización (KLD contra el checkpoint BF16, menor es mejor), no de calidad en tareas:

| Lectura | KLD | Agreement top-1 |
|---|---|---|
| 16 prompts x 512 tokens (hasta primer EOS) | 0,0692 | 92,76% |
| Ocho categorías (código, matemáticas, razonamiento, diseño, wikitext, multilingual, historia, STEM), 16 x 512 | 0,0295 | 94,73% |

Comparativa de memoria y KLD (lectura de ocho categorías, mismas condiciones):

| Pack | Memoria GPU pico | KLD ocho categorías |
|---|---|---|
| Sushi-2bpw | 37,4 GB | 0,0673 |
| Sushi-2.6bpw | 47,0 GB | 0,0342 |
| **Sushi-STQ-2.75bpw (este pack)** | **49,6 GB** | **0,0295** |
| Sushi-4bpw | 68,2 GB | 0,0135 |
| oQ4e (oMLX), reempaquetado para sushi | 74,1 GB | 0,0279 |
| mlx-serve mixed 4-8 bit | 75,1 GB | 0,0120 |

Nota del autor: las dos lecturas usan prompts distintos y no son comparables entre sí, ni con la tabla kv8 de las cards de otros packs.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS 26.2 o posterior y sushi v1.3.0 o superior.
- Memoria: el scoring del pack alcanzó un pico de 49,6 GB de GPU; se recomienda una máquina con al menos 64 GB de memoria unificada (los Mac con 48 GB probablemente se queden cortos).
- Disco: ~76 GiB (46,1 GiB de pesos + 29,8 GiB de tabla de n-gramas que se lee desde SSD); el repo completo ocupa 81,5 GB.
- No cabe en GPUs NVIDIA consumer convencionales ni en Macs de 16-32 GB: este pack no está pensado para RTX 4090 o similares.
- Despliegue: solo mediante sushi (fork de mlx-serve de ddalcu). **No carga** en transformers, vLLM, mlx-lm ni exllamav3.
- Latencia y throughput: no disponible en la información proporcionada, aunque la inclusión de MTP head y tabla de n-gramas sugiere decodificación especulativa para acelerar la generación.
- Flags conocidos del autor: KV en bf16 y `--qwen-gdn 32` durante el scoring.

## Comparativa con modelos similares

Comparativa entre packs de cuantización del mismo modelo base (datos del propio README):

| Pack | bpw medio | Memoria GPU pico | KLD (8 categorías) | Motor |
|---|---|---|---|---|
| Sushi-2bpw | 2 | 37,4 GB | 0,0673 | sushi |
| Sushi-2.6bpw | 2,6 | 47,0 GB | 0,0342 | sushi |
| Sushi-STQ-2.75bpw (este) | 2,75 | 49,6 GB | 0,0295 | sushi |
| Sushi-4bpw | 4 | 68,2 GB | 0,0135 | sushi |
| oQ4e (oMLX) | no disponible | 74,1 GB | 0,0279 | sushi (reempaquetado) |
| mlx-serve mixed 4-8 bit | no disponible | 75,1 GB | 0,0120 | mlx-serve |

Este pack ofrece el mejor equilibrio memoria/calidad de la familia Sushi: reduce la KLD un 56% respecto al pack de 2,6 bpw con solo 2,6 GB más de memoria, y supera en fidelidad al oQ4e de 4 bits consumiendo 24,5 GB menos.

Comparativa con modelos base alternativos de la misma categoría: no disponible (no se proporcionan datos de otros modelos multimodales MoE comparables en la información facilitada).

## Limitaciones y advertencias

- Compatibilidad muy restringida: solo funciona con sushi v1.3.0+ en Apple Silicon con macOS 26.2+; es incompatible con transformers, vLLM, mlx-lm y exllamav3, lo que limita gravemente las opciones de despliegue en producción.
- Requisito de memoria elevado: ~49,6 GB de GPU pico, lo que lo deja fuera del alcance de la mayoría de equipos consumer.
- Dependencia del SSD: la tabla de n-gramas (29,8 GiB) se lee desde disco y nunca se carga en GPU, lo que puede afectar al rendimiento si el almacenamiento es lento.
- Sesgos conocidos: no disponible (no se documentan en la model card).
- Riesgo de alucinación: inherente a todo LLM; la cuantización agresiva (2,75 bpw en los expertos) puede degradar marginalmente la precisión frente al BF16, aunque las métricas KLD sugieren una pérdida contenida.
- Idiomas: no especificados en la información disponible.
- Licencia: Qwen Community License 1.0, que incluye condiciones específicas para servicios comerciales de gran escala; conviene revisar el archivo LICENSE antes de cualquier uso comercial.
- Las métricas de calidad publicadas son KLD contra el checkpoint original, no benchmarks de tareas reales; la calidad en uso práctico debe validarse por el usuario.
- Las dos lecturas de KLD del README no son comparables entre sí ni con tablas de otros packs.

## Enlaces

- Repositorio del pack: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor sushi (repositorio): https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto original del que deriva sushi): https://github.com/ddalcu/mlx-serve
- Licencia: archivo LICENSE en el repositorio del pack (Qwen Community License 1.0)
