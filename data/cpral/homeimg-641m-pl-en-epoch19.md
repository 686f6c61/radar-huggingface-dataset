# cpral/HomeIMG-641M-PL-EN-epoch19

## Resumen

HomeIMG-641M-PL-EN-epoch19 es un generador de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario independiente cpral. Se trata de un modelo de difusión con arquitectura Diffusion Transformer (DiT) de 641,1 millones de parámetros entrenado desde cero en ocho tarjetas gráficas domésticas, lo que lo convierte en un caso poco habitual de entrenamiento de un modelo generativo completo fuera de infraestructuras industriales.

El modelo genera imágenes de 256×256 píxeles a partir de prompts en polaco o inglés. El denoiser DiT está condicionado por un codificador de texto congelado, Poziomka-Baza (un modelo de lenguaje MoE polaco-inglés de 4B parámetros), a través de un refiner entrenable de 72,1 millones de parámetros. Esta configuración permite que la calidad con prompts en polaco sea casi idéntica a la obtenida con prompts en inglés (FD-DINOv2 de 29,29 frente a 28,90).

Es relevante por tres motivos: demuestra que es viable entrenar un modelo de difusión bilingüe de tamaño medio con hardware de consumo, introduce una arquitectura de condicionamiento textual inusual basada en un LLM MoE con cuantización int8 en los expertos, y publica una metodología de evaluación reproducible (FD-DINOv2 sobre latentes retenidos) que permite comparar versiones sucesivas del mismo proyecto. Es la decimonovena época de una línea de trabajo que comenzó con un modelo solo en inglés (epoch15) y continuó con un primer estadio bilingüe (stage1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching rectificado; 6 bloques de anchura 2560, 20 cabezas (128), SwiGLU 6912, self-attention con RoPE 2D y QK-norm, cross-attention a texto (anchura 1280), MLP SwiGLU, tiempo mediante adaLN-single estilo PixArt |
| Parametros totales | 641.104.896 (denoiser 641,1M + refiner 72,1M entrenable; el text encoder Poziomka-Baza está congelado y no se cuenta en esa cifra) |
| Parametros activos | No es MoE el denoiser; el text encoder Poziomka-Baza es MoE con 8 de 32 expertos activos por token (~450M activos) |
| Longitud de contexto | Hasta 255 tokens de prompt (refiner); resolución de imagen 256×256 con latentes de 128×16×16 |
| Tipos de cuantizacion | Pesos del text encoder en int8 (escala por experto y columna, multiplicaciones en bf16); el resto de pesos en safetensors sin cuantización indicada |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline `AuroraIMG2Pipeline` con `custom_code`) |

## Arquitectura y entrenamiento

El denoiser es un DiT de 641,1M parámetros que opera sobre un token por píxel de latente (rejilla de 16×16) y utiliza flow matching rectificado con el objetivo `z_t = (1−t)·x + t·ε`, predicción de `ε − x`, pérdida MSE y muestreo de `t` con distribución logit-normal(0, 1). El 10% de los prompts se sustituyen por el prompt vacío para permitir classifier-free guidance. El condicionamiento textual pasa por tres piezas: el LLM congelado Poziomka-Baza (BailingMoeV2, 16 capas de anchura 2048, 128 expertos con 8 de 32 activos por token, pesos de experto en int8), un refiner entrenable de 72,1M (proyección 2048→1280, 4 bloques transformer bidireccionales de anchura 1280 con 20 cabezas q y 5 kv, RoPE 1D, SwiGLU 3456, RMSNorm y prompt vacío aprendido para CFG) y un decodificador FLUX.2 small congelado que trabaja sobre latentes de 128×16×16.

El entrenamiento partió del denoiser de HomeIMG-641M-epoch15 (pesos EMA tras 15 épocas solo en inglés con Slayer149 como text encoder) y sustituyó el codificador de texto. Los datos son QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes), con un caption aleatorio por imagen y un 50% de probabilidad de usar su traducción al polaco (cpral/FLUX-Reason-6M-captions-pl, generada con Index-Translate-2B; aproximadamente un 0,3% de traducciones marcadas como defectuosas se sustituyeron por el original inglés). El proceso tuvo dos etapas: la primera (1 época, 5.743 pasos × 1024, denoiser congelado, solo refiner, ~650 imágenes/s, ~2,5 h) y la segunda (4 épocas, 22.972 pasos × 1024 = 23,5 millones de muestras, de las cuales ~11,8 millones con prompt polaco, modelo completo, ~385 imágenes/s, ~17 h). El optimizador es MuLoCo (DiLoCo), lo que permite el entrenamiento distribuido en las ocho GPU domésticas. En total, el denoiser acumula 19 épocas (15 en inglés + 4 bilingües) y el nuevo text encoder 5 épocas.

## Capacidades

- Generación de imágenes texto-a-imagen a 256×256 píxeles con prompts en polaco e inglés, con calidad prácticamente equivalente en ambos idiomas (FD-DINOv2 de 29,29 en polaco frente a 28,90 en inglés).
- Comprensión de prompts descriptivos de escena, estilo y objeto: los ejemplos de la model card cubren fotografía natural, panoramas urbanos nocturnos, bodegones, acuarela, ilustración digital y texto en carteles ("szyld z neonowym napisem OPEN").
- Generación determinista por semilla: con la misma semilla y el mismo ruido inicial, la pareja de prompts (polaco/inglés) produce composiciones comparables, lo que facilita la evaluación controlada.
- Control mediante classifier-free guidance (CFG configurable; los ejemplos usan 3,0) y número de pasos de muestreo (50 pasos de Euler en los ejemplos).
- No se ha documentado soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: es un modelo puramente generativo de imagen.
- Capacidad multilingüe limitada a los dos idiomas de entrenamiento (pl, en); no se ha validado el comportamiento en otros idiomas.

## Casos de uso

- Generación de ilustraciones para aplicaciones en polaco: el modelo permite redactar el prompt directamente en polaco sin pasar por traducción intermedia, gracias al codificador Poziomka-Baza y al refiner entrenado con el 50% de prompts polacos, lo que reduce la pérdida de matices en la descripción.
- Prototipado rápido de conceptos visuales en estudios pequeños: con 641M parámetros y salida de 256×256, se puede iterar sobre bocetos de escena, composición y paleta antes de encargar un render de mayor resolución a otro modelo.
- Evaluación comparativa de codificadores de texto para difusión: el repositorio publica FD-DINOv2 y val/loss sobre latentes retenidos, de modo que sirve como referencia reproducible para investigar el efecto de sustituir el text encoder (Slayer149 frente a Poziomka con refiner de 72,1M).
- Docencia y experimentación en entrenamiento distribuido: la combinación de MuLoCo/DiLoCo, ocho GPU domésticas y dos etapas de entrenamiento (refiner congelado y luego modelo completo) documenta un protocolo replicable para laboratorios con recursos limitados.
- Generación de conjuntos de datos sintéticos bilingües de baja resolución: útil para aumentar corpus de imágenes 256×256 con pares de caption pl/en alineados por semilla, por ejemplo para entrenar clasificadores o modelos de captioning.
- Pruebas de pipeline con diffusers y código personalizado: al registrarse como `AuroraIMG2Pipeline` con `custom_code`, sirve para validar integraciones de pipelines no estándar en diffusers antes de migrar a modelos mayores.
- Investigación sobre cuantización int8 en modelos MoE de condicionamiento: el uso de pesos de experto en int8 con multiplicaciones en bf16 en el text encoder congelado es un caso práctico para medir el impacto de la cuantización en la calidad generativa.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas internas del proyecto, no comparables con las cifras de FD-DINOv2 de la literatura. La evaluación usa 4.096 captions retenidos (primer caption de los primeros 4.096 imágenes de 4 shards retenidos), 50 pasos de Euler, CFG 3,0, semillas fijas y características `vit_base_patch14_reg4_dinov2.lvd142m`; la referencia son los latentes retenidos reales decodificados con el mismo decodificador FLUX.2. La columna PL usa los mismos imágenes y el mismo ruido, con los prompts traducidos al polaco.

| Modelo | Text encoder | val/loss | FD-DINOv2 (EN) | FD-DINOv2 (PL) |
|---|---|---|---|---|
| HomeIMG-641M-epoch15 (WSM) | Slayer149 + refiner 35,7M | 0,6297 | 27,66 | no disponible |
| HomeIMG-641M-PL-EN-stage1 (EMA) | Poziomka + refiner 72,1M | 0,6316 | no disponible | no disponible |
| HomeIMG-641M-PL-EN-epoch19, pesos EMA | Poziomka + refiner 72,1M | 0,6284 | 29,25 | 29,82 |
| HomeIMG-641M-PL-EN-epoch19 (este repo, WSM) | Poziomka + refiner 72,1M | 0,6277 | 28,90 | 29,29 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo texto-a-imagen. La comparación relevante es interna: frente a epoch15, la val/loss baja de 0,6297 a 0,6277 y el FD-DINOv2 en inglés sube de 27,66 a 28,90 (un valor más alto es peor en esta métrica), un empeoramiento de ~1,2 puntos atribuido a que la mitad del entrenamiento se dedicó a polaco y a que el nuevo text encoder solo acumuló 5 épocas frente a 15.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,4 GB en safetensors; el denoiser de 641M en bf16 ronda 1,3 GB, el refiner 72,1M unos 0,15 GB y el text encoder Poziomka-Baza (4B con expertos en int8) es la pieza dominante, por lo que se estima un consumo total en el entorno de 4-6 GB en bf16/int8, aunque no se ha publicado una medición oficial.
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 3090, RTX 4090, A100 o H100 son suficientes. Cabe en GPU de consumo con al menos 8 GB de VRAM, aunque no se ha verificado.
- Despliegue: al usar `diffusers` con `custom_code` y el pipeline `AuroraIMG2Pipeline`, la vía prevista es la carga con `trust_remote_code=True` en diffusers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia. Solo se publican cifras de entrenamiento (~650 imágenes/s en la etapa 1 y ~385 imágenes/s en la etapa 2 sobre ocho GPU domésticas).

## Comparativa con modelos similares

No se dispone de comparaciones con modelos externos en la información proporcionada. La model card solo compara con versiones anteriores del mismo proyecto:

| Modelo | Parámetros | Contexto de prompt | Idiomas | Licencia | FD-DINOv2 (EN) |
|---|---|---|---|---|---|
| HomeIMG-641M-PL-EN-epoch19 | 641M (denoiser) + 72,1M (refiner) | 255 tokens | pl, en | Apache 2.0 | 28,90 |
| HomeIMG-641M-epoch15 | 641M (denoiser) + 35,7M (refiner) | no disponible | en | Apache 2.0 | 27,66 |
| HomeIMG-641M-PL-EN-stage1 | 641M (denoiser) + 72,1M (refiner) | 255 tokens | pl, en | Apache 2.0 | no disponible |

No hay datos publicados que permitan comparar con alternativas de la misma categoría (por ejemplo, modelos texto-a-imagen de ~600M parámetros con soporte de polaco) en parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Resolución fija de 256×256 píxeles: no se documenta soporte de otras resoluciones ni de escalado, lo que limita su uso en producción gráfica final.
- Ventana de prompt de 255 tokens: los prompts más largos se truncan, con la consiguiente pérdida de detalle en descripciones complejas.
- Solo dos idiomas (polaco e inglés); no se ha validado el comportamiento en castellano ni en otras lenguas, y el codificador de texto podría degradarse con entradas fuera de distribución.
- El FD-DINOv2 en inglés empeora respecto a epoch15 (28,90 frente a 27,66), por lo que la ganancia bilingüe tiene un coste medible en la calidad en inglés.
- No se han publicado evaluaciones de sesgos, toxicidad ni alucinación visual; como todo modelo de difusión, puede generar contenido estereotipado o inexacto, y no se documentan filtros de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora un decodificador FLUX.2 small congelado y un text encoder Poziomka-Baza cuyas licencias propias deben verificarse por separado antes de un despliegue comercial.
- El pipeline requiere `custom_code` (`AuroraIMG2Pipeline`) y `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en entornos de producción.
- El proyecto tiene 19 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad; las métricas publicadas son internas y no comparables con las de la literatura.
- El entrenamiento se realizó en ocho GPU domésticas con un presupuesto limitado (~17 h en la etapa 2), lo que se refleja en la calidad frente a modelos industriales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-641M-PL-EN-epoch19
- Modelo base (epoch15): https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Modelo base (Poziomka-Baza): https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Estadio previo bilingüe: https://huggingface.co/cpral/HomeIMG-641M-PL-EN-stage1
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper FD-DINOv2 (Stein et al. 2023): https://arxiv.org/abs/2306.04675
- Paper referenciado en los tags (arXiv 2507.17634): https://arxiv.org/abs/2507.17634
