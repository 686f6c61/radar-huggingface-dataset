# SarthakRawool/MiniMax-H3-Image-MLX-8bit-LowMem

## Resumen

MiniMax-H3-Image MLX 8-bit LowMem es una conversión de formato de los pesos oficiales de MiniMax-H3-Image, el modelo de generación de imágenes texto-a-imagen de 20.000 millones de parámetros desarrollado por MiniMax. La conversión, realizada por SarthakRawool, adapta el modelo original al framework MLX de Apple para ejecutarse en chips Apple Silicon, con un enfoque explícito en la reducción del consumo de memoria. No se trata de un modelo nuevo ni de un ajuste fino: es una reempaquetado y recuantización de los pesos publicados por MiniMax, pensado para alimentar la aplicación Shuttrr.

El modelo emplea una arquitectura de difusión con un transformer (DiT) de 50 bloques y dimensión oculta de 5376, acompañado de un codificador de texto Qwen3-VL-32B (del que se utilizan las capas 0 a 49) y un VAE de imagen. La innovación principal de esta conversión es la capacidad de transmitir por streaming los bloques del transformer desde el SSD, lo que permite ejecutar el modelo en un Mac de 16 GB de memoria unificada, algo imposible con los pesos completos en memoria (unos 25-26 GB).

Su relevancia radica en que democratiza el acceso a un modelo de generación de imágenes de gran tamaño en hardware de consumo Apple, a costa de una licencia restrictiva que excluye territorios como la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, y que impone condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con 50 bloques, hidden 5376; text encoder Qwen3-VL-32B (capas 0-49); VAE de imagen (decoder ViT) |
| Parametros totales | 20B (modelo base MiniMax-H3-Image) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit group 32 (transformer, mapeado desde Q8_0 GGUF); MLX 4-bit group 32 (text encoder, desde Q4_K_M; v_proj/down_proj en 8-bit desde Q6_K); BF16 (embeddings y matrices que el release mantiene a 16 bits); float16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other") |
| Formato de pesos | safetensors (MLX), con model.safetensors.index.json por carpeta |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de difusión texto-a-imagen basado en un transformer (DiT) de 50 bloques con dimensión oculta de 5376, que actúa como red generativa. El condicionamiento textual se realiza mediante un codificador Qwen3-VL-32B del que MiniMax-H3 lee la salida no normalizada de la capa 50, por lo que esta conversión incluye únicamente las capas 0 a 49. La generación de la imagen final corre a cargo de un VAE con decoder ViT en float16.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. Esta conversión concreta no entrena nada: reempaqueta los pesos oficiales. El DiT se obtiene del checkpoint único podado tal como se reempaquetó para ComfyUI, leído desde su GGUF Q8_0; el text encoder proviene de su GGUF Q4_K_M recortado a las 50 capas que usa H3; y el VAE se incluye tal cual. La conversión mapea exactamente los tensores cuantizados (solo redondea las escalas a bfloat16) y mantiene en BF16 las matrices que el release original conserva a 16 bits.

La innovación técnica destacable es el streaming del transformer desde el SSD: los 50 bloques pueden transmitirse de dos en dos (unos 3 GB de pico) o mantenerse completos en memoria (unos 25-26 GB), produciendo en ambos casos la misma imagen bit a bit. La inferencia usa seis pasos sin guidance, y las semillas coinciden con `sd-cli --rng cpu`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con un modelo de 20B parámetros.
- Condicionamiento textual complejo gracias al codificador Qwen3-VL-32B, que aporta comprensión semántica del prompt.
- Ejecución en Apple Silicon mediante MLX, con modos de memoria escalonados (streaming o carga completa).
- Reproducibilidad determinista: todas las configuraciones de memoria producen la misma imagen bit a bit para una misma semilla.
- No incluye edición con imagen de referencia (`<Picture N>`), que requeriría el vision tower y el VAE encoder.
- Soporte de tool calling, agentes, razonamiento multi-step o capacidades de audio: no disponible (es un modelo de imagen).
- Capacidades multilingües del prompt: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en un MacBook de 16 GB: el modo de streaming de dos bloques permite crear imágenes de 512x640 en unos 62 segundos con un pico de 3,25 GB (motor + app) y sin crecimiento del swap, lo que hace viable la generación local en portátiles de gama media Apple.
- Prototipado rápido de conceptos visuales: con seis pasos y sin guidance, el modelo permite iterar sobre prompts en un flujo de trabajo local, útil para diseñadores que quieran explorar variaciones sin depender de servicios en la nube.
- Integración en la aplicación Shuttrr: la conversión está diseñada específicamente para esta app, que gestiona los pasos de memoria y solicita la aceptación de la licencia antes de descargar el modelo.
- Generación de imágenes en equipos con 48 GB o más: en esos Macs el DiT completo permanece en memoria (unos 26 GB), lo que reduce la latencia y permite tamaños mayores como 1024x1024 en aproximadamente 45-60 segundos.
- Investigación y experimentación con modelos de difusión en MLX: al ser una conversión fiel de los pesos oficiales, sirve para estudiar el comportamiento del modelo y comparar implementaciones (se valida contra stable-diffusion.cpp).
- Automatización de pipelines de generación de imágenes offline: al ejecutarse localmente y de forma determinista, puede integrarse en scripts que requieran reproducibilidad por semilla sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento medidos son de inferencia:

| Metrica | Valor |
|---|---|
| Hardware de medida | MacBook Pro M5, 16 GB, GPU de 10 núcleos |
| Resolución medida | 512x640 |
| Tiempo de generación | 62 s |
| Pico de memoria (motor + app) | 3,25 GB (DiT en streaming, 2 bloques a la vez) |
| Crecimiento de swap | ninguno |
| Estimación 1024x1024 en el mismo Mac | 45-60 s (estimado) |
| Memoria con DiT completo en RAM | ~26 GB (requiere 48 GB o más) |
| Pasos de inferencia | 6, sin guidance |

## Requisitos de hardware

- VRAM/memoria unificada mínima: unos 3 GB en modo streaming (DiT transmitido de dos en dos bloques) sobre un Mac de 16 GB.
- Memoria para carga completa del DiT: unos 25-26 GB, recomendable en equipos con 48 GB o más.
- GPU recomendadas: Apple Silicon (medido en M5 de 10 núcleos; otras Mac son estimaciones). No aplica a GPU NVIDIA/AMD, ya que la conversión es específica de MLX.
- ¿Cabe en GPU de consumo? Sí, en Apple Silicon de consumo; no está pensado para GPU discretas convencionales.
- Opciones de despliegue: MLX (librería `mlx`), la aplicación Shuttrr; el código vive en `shutter/families/h3image/` y se apoya en minimax-h3-mlx y se valida contra stable-diffusion.cpp.
- Latencia y throughput: 62 s por imagen de 512x640 en el Mac medido; 45-60 s estimados para 1024x1024 en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image MLX 8-bit LowMem (esta ficha) | 20B | no disponible | MLX safetensors, Apple Silicon | MiniMax-H3-Image Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face, 0 descargas |
| MiniMax-H3-Image (base oficial) | 20B | no disponible | Pesos oficiales (formato original) | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| minimax-h3-mlx | no disponible | no disponible | MLX, Apple Silicon | Apache-2.0 | GitHub (mrbizarro) |
| stable-diffusion.cpp | no disponible | no disponible | C++/GGUF, multiplataforma | MIT | GitHub (leejet) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia territorialmente restrictiva: el acuerdo cubre el mundo excepto la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos; si resides en uno de esos territorios debes contactar con MiniMax para obtener licencia.
- Uso comercial limitado a ingresos anuales inferiores a 1 millón de USD (tú y tus afiliados); por encima de esa cifra o para ofrecer un servicio alojado a terceros se requiere autorización escrita previa de MiniMax.
- Obligación de mostrar prominentemente "MiniMax-H3-Image" en productos o servicios comerciales que lo usen.
- Prohibición de usar las salidas para mejorar otros modelos de IA.
- Política de uso aceptable: obliga a divulgar claramente el contenido generado por IA en público y prohíbe suplantación sin consentimiento, uso militar y decisiones automatizadas de alto riesgo.
- Si redistribuyes los archivos, debes incluir LICENSE y NOTICE, marcar tus cambios y mantener los mismos términos.
- Riesgo de alucinación visual y sesgos: no disponible en la información proporcionada; se desconoce la composición del dataset de entrenamiento.
- No incluye edición con imagen de referencia (`<Picture N>`), por lo que no puede usarse para tareas de img2img o edición guiada por imagen.
- Específico de Apple Silicon: no es desplegable en GPU NVIDIA/AMD ni en frameworks como vLLM, TGI o llama.cpp.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- Las estimaciones de rendimiento para resoluciones distintas de 512x640 y para Macs distintos del M5 medido son aproximadas, no medidas.

## Enlaces

- Hugging Face: https://huggingface.co/SarthakRawool/MiniMax-H3-Image-MLX-8bit-LowMem
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio Shuttrr: https://github.com/sarthakrawool/shuttrr
- minimax-h3-mlx: https://github.com/mrbizarro/minimax-h3-mlx
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- MLX: https://github.com/ml-explore/mlx
- Licencia comercial MiniMax: https://platform.minimax.io/console/license
