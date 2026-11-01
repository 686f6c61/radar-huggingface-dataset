# agentory/Qwen-Image-2.1-Turbo-GGUF

## Resumen

Qwen-Image-2.1-Turbo-GGUF es la versión cuantizada en formato GGUF del checkpoint Turbo de Qwen-Image-2.1, un modelo de generación de imágenes texto-a-imagen desarrollado por el equipo Qwen de Alibaba. El checkpoint Turbo es una destilación de 8 pasos del modelo base Qwen-Image-2.1, lo que reduce drásticamente el coste computacional de inferencia manteniendo la fidelidad visual respecto al modelo original. Esta ficha concreta, publicada por el usuario agentory, empaqueta los pesos en GGUF con la metodología Unsloth Dynamic 2.0, pensada para ejecución local en GPUs de consumo.

El modelo cuenta con 7.115.124.736 parámetros en el denoiser (el componente que genera la imagen), y utiliza un text encoder Qwen3-VL-8B-Instruct y un VAE separados, ambos compartidos con Qwen-Image-2.1. La arquitectura sigue el paradigma de modelos de difusión con transformer (DiT), aunque la información disponible no detalla la configuración interna de bloques ni el mecanismo de atención.

La relevancia de esta publicación radica en que permite ejecutar un modelo de generación de imágenes de última generación en hardware asequible: el archivo recomendado Q4_K_M ocupa 4,20 GB y el Q8_0 apenas 7,64 GB, lo que lo hace viable en GPUs consumer de 8-12 GB de VRAM. La licencia qwen-research, sin embargo, impone restricciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer (DiT); el GGUF contiene únicamente el denoiser |
| Parametros totales | 7.115.124.736 (denoiser) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_XL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q6_K_XL, Q8_0, F16 |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (other) |
| Formato de pesos | GGUF (denoiser); requiere VAE en safetensors bf16 y text encoder en GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1-Turbo es una destilación de 8 pasos del modelo Qwen-Image-2.1, diseñada para operar con CFG 1 y un schedule de muestreo específico (`sample_sigmas` en `model_index.json`). La arquitectura subyacente es un transformer de difusión (DiT) que actúa como denoiser; el pipeline completo requiere además un VAE (qwen_image_2.1_vae_bf16.safetensors) y un text encoder Qwen3-VL-8B-Instruct, ambos idénticos a los de Qwen-Image-2.1. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal de esta publicación es la cuantización con Unsloth Dynamic 2.0: cada tensor se upcastea a mayor precisión según un escaneo de sensibilidad medido, y la importance matrix se recogió sobre el propio checkpoint Turbo con su schedule de 8 pasos. Esto produce archivos con layout por tensor idéntico al de la versión no Turbo, lo que permite reutilizar configuraciones entre ambos. La destilación a 8 pasos con CFG 1 elimina la necesidad de clasifier-free guidance, reduciendo el número de evaluaciones del denoiser por imagen de forma sustancial frente al modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen en resoluciones de al menos 1024x1024 (los benchmarks LPIPS se realizan a esa resolución).
- Generación en 8 pasos de muestreo con CFG 1, lo que reduce el coste de inferencia frente a pipelines de 20-50 pasos.
- Soporte bilingüe de prompts en inglés y chino.
- Fidelidad visual cercana al bf16 en cuantizaciones altas: LPIPS de 0,036 para Q8_0 y 0,012 para F16 frente al transformer bf16 de referencia.
- Integración con Unsloth Desktop, ComfyUI (mediante ComfyUI-GGUF) y stable-diffusion.cpp.
- No se dispone de información sobre soporte de tool calling, agentes, visión de entrada ni otras capacidades multimodales más allá del pipeline texto-a-imagen.

## Casos de uso

- Generación de imágenes en local para ilustración editorial: con el archivo Q4_K_M (4,20 GB) el modelo cabe en GPUs de 8 GB y permite generar ilustraciones a 1024x1024 en 8 pasos, adecuado para prototipado rápido de conceptos visuales sin depender de APIs externas.
- Prototipado de assets para videojuegos: el pipeline Turbo con 8 pasos y CFG 1 reduce el tiempo por imagen, lo que facilita iterar sobre variaciones de personajes, entornos o iconos en sesiones de diseño.
- Automatización de contenido para marketing: integrado en ComfyUI mediante ComfyUI-GGUF, se pueden construir flujos que generen banners o imágenes de producto a partir de prompts en inglés o chino, con la cuantización Q5_K_M (5,39 GB) como equilibrio entre calidad y VRAM.
- Investigación en cuantización de modelos de difusión: la tabla de LPIPS por archivo y la separación entre conjunto de calibración y held-out permiten estudiar el impacto de la precisión por tensor en la calidad final, reutilizando la importance matrix publicada.
- Despliegue en estaciones de trabajo sin GPU de datacenter: el archivo Q3_K_XL (3,61 GB) permite ejecutar el modelo en tarjetas de gama baja, con la advertencia de deriva visible respecto a bf16 que el propio autor señala.
- Generación de imágenes con prompts en chino: el text encoder Qwen3-VL-8B-Instruct y el soporte declarado de zh permiten usar el modelo en flujos de trabajo para mercados de habla china sin traducción intermedia del prompt.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas LPIPS (AlexNet, menor es mejor) frente al transformer Turbo en bf16, con el mismo text encoder, VAE, prompts y semillas, a 1024x1024, 8 pasos y CFG 1. La media se calcula con intervalo de confianza bootstrap del 95% sobre 8 prompts x 2 semillas; la columna held-out usa 8 prompts adicionales x 2 semillas no empleados en la calibración de la importance matrix. Dos ejecuciones bf16 con las mismas semillas dan 0,000 (suelo run-to-run).

| Archivo | Tamano (GB) | LPIPS | LPIPS (held-out) |
|---|---|---|---|
| Q2_K | 2,47 | 0,374 [0,300; 0,453] | 0,351 [0,297; 0,403] |
| Q3_K_S | 2,72 | 0,303 [0,229; 0,381] | 0,280 [0,225; 0,334] |
| Q3_K_M | 3,17 | 0,261 [0,189; 0,342] | 0,250 [0,193; 0,323] |
| Q3_K_XL | 3,61 | 0,237 [0,148; 0,333] | 0,208 [0,165; 0,256] |
| Q4_K_S | 3,91 | 0,201 [0,126; 0,279] | 0,186 [0,138; 0,244] |
| Q4_K_M | 4,20 | 0,153 [0,097; 0,215] | 0,141 [0,105; 0,182] |
| Q5_K_S | 4,50 | 0,103 [0,064; 0,145] | 0,083 [0,062; 0,110] |
| Q5_K_M | 5,39 | 0,074 [0,037; 0,117] | 0,087 [0,049; 0,133] |
| Q6_K | 6,27 | 0,055 [0,028; 0,089] | 0,076 [0,038; 0,121] |
| Q6_K_XL | 6,72 | 0,050 [0,024; 0,083] | 0,069 [0,034; 0,115] |
| Q8_0 | 7,64 | 0,036 [0,017; 0,059] | 0,030 [0,016; 0,047] |
| F16 | 14,23 | 0,012 [0,005; 0,019] | 0,016 [0,008; 0,025] |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imágenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para el denoiser: 2,47 GB (Q2_K) hasta 14,23 GB (F16). El pipeline completo requiere además el VAE en bf16 y el text encoder Qwen3-VL-8B-Instruct (el autor recomienda `Qwen3-VL-8B-Instruct-UD-Q4_K_XL.gguf`), por lo que la VRAM total es sustancialmente mayor que el tamaño del archivo GGUF.
- GPU recomendadas: no especificadas por el autor. Por tamaño de archivo, Q4_K_M (4,20 GB) es viable en GPUs consumer de 8 GB o más; Q8_0 (7,64 GB) requiere 12 GB o más; F16 (14,23 GB) requiere GPUs de 24 GB o más (RTX 3090/4090, A100, H100).
- Cabe en GPU consumer: sí, al menos las cuantizaciones Q2_K a Q6_K_XL en tarjetas de 8-12 GB, siempre que se sume el coste del text encoder y el VAE.
- Opciones de despliegue: Unsloth Desktop, ComfyUI con ComfyUI-GGUF, stable-diffusion.cpp. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. El modelo está diseñado para 8 pasos de muestreo con CFG 1, lo que reduce el número de evaluaciones del denoiser frente a pipelines convencionales, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros (denoiser) | Pasos de muestreo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo (GGUF, esta ficha) | 7.115.124.736 | 8 (CFG 1) | No disponible | qwen-research | HuggingFace |
| Qwen-Image-2.1-Turbo (bf16, original) | 7.115.124.736 | 8 (CFG 1) | No disponible | qwen-research | HuggingFace |
| Qwen-Image-2.1 (base, sin destilar) | No disponible | No disponible | No disponible | qwen-research | HuggingFace |
| Qwen-Image-2.1-GGUF (Unsloth) | No disponible | No disponible | No disponible | qwen-research | HuggingFace |

La información disponible no incluye comparativas con modelos de otros desarrolladores (por ejemplo, FLUX, SDXL o similares), por lo que no se pueden aportar datos de rendimiento cruzado.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial. Es imprescindible revisar el texto completo de la licencia en el repositorio del modelo base antes de cualquier despliegue en producción.
- El GGUF contiene únicamente el denoiser; sin el VAE y el text encoder Qwen3-VL-8B-Instruct no se puede ejecutar el pipeline. El coste total de VRAM es mayor que el tamaño del archivo descargado.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) presentan deriva visible respecto a bf16 a 8 pasos; el autor recomienda Q3_K_XL como mínimo si se baja de 4 GB.
- El modelo está diseñado para 8 pasos con CFG 1 y un schedule de muestreo concreto; usar otros valores puede degradar la calidad de forma no documentada.
- Idiomas soportados limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- No se dispone de información sobre sesgos, tasa de alucinación visual, restricciones de contenido ni evaluación de seguridad del modelo.
- El repositorio tiene 81 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-10-30), lo que indica que es una publicación reciente sin validación comunitaria extensa.
- No se publican tiempos de inferencia ni requisitos de VRAM medidos para el pipeline completo.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/agentory/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Modelo original sin destilar: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Configuracion del pipeline (model_index.json): https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/model_index.json
- Guia de ejecucion de Unsloth: https://unsloth.ai/docs/models/qwen-image-2.1
- Metodologia Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- VAE (Qwen-Image-2.1-FP8): https://huggingface.co/unsloth/Qwen-Image-2.1-FP8
- Text encoder (Qwen3-VL-8B-Instruct-GGUF): https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- GGUF de la version no Turbo: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
