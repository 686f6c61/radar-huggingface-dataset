# aaroncaozj/SD1.5_4steps-DMD

## Resumen

SD1.5_4steps-DMD es una colección de dos modelos de difusión texto-a-imagen derivados de Stable Diffusion v1.5, destilados para generar imágenes en tan solo 4 pasos de denoising. El autor, aaroncaozj, publica dos variantes entrenadas con métodos de destilación distintos sobre el código base de DMD2: Decoupled DMD (Alibaba) y f-Divergence DMD con divergencia Jensen-Shannon (NVIDIA). Ambos checkpoints se obtuvieron tras 2000 pasos de entrenamiento (2000 actualizaciones del generador, 10000 del módulo de guiado).

El objetivo es reducir el coste computacional de la inferencia de SD1.5 manteniendo la fidelidad al prompt. La destilación de 4 pasos permite sustituir los típicos 20-50 pasos de muestreo por solo 4, lo que multiplica el throughput en pipelines de generación de imágenes. La variante f-Divergence DMD reporta un CLIP score de 0.331, ligeramente superior al modelo base y a la variante Decoupled DMD (0.325), según los datos de la model card.

El repositorio (6.9 GB) fusiona dos repositorios anteriores del mismo autor y se distribuye bajo licencia Apache 2.0. Está pensado para desarrolladores que quieran desplegar generación texto-a-imagen rápida sobre la arquitectura SD1.5 sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder CLIP), destilado de Stable Diffusion v1.5 |
| Parametros totales | no disponible en la informacion proporcionada (hereda la arquitectura SD1.5; el conteo exacto no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; el prompt se procesa con el text encoder CLIP de SD1.5, limite tipico de 77 tokens) |
| Tipos de cuantizacion | no disponible (los checkpoints se entrenaron con `--use_fp16`; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (el text encoder CLIP de SD1.5 esta orientado principalmente a ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints `.bin` (`checkpoint_model_002000.bin`), compatibles con el ecosistema Diffusers/DMD2 |

## Arquitectura y entrenamiento

La base es Stable Diffusion v1.5: un UNet de difusión latente con VAE y un text encoder CLIP. Sobre esta arquitectura se aplica destilación por coincidencia de distribuciones (Distribution Matching Distillation, DMD) para colapsar el muestreo a 4 pasos. El entrenamiento parte del código de DMD2 e incorpora la simulación hacia atrás (backward simulation) adaptada específicamente a SD1.5, ya que el código original de DMD2 solo cubría SDXL.

La variante Decoupled DMD sigue el método de Alibaba, que desacopla la pérdida DMD en una pérdida de aumento de CFG bajo dos pasos temporales independientes y una nueva pérdida de coincidencia de distribuciones como regularización. Se entrenó con `real_guidance_scale` 3.0, `fake_guidance_scale` 1.0, `max_grad_norm` 10.0, FP16, ratio de actualización 5, 4 pasos de denoising y simulación hacia atrás. La variante f-Divergence DMD sigue el método de NVIDIA, sustituyendo la pérdida de coincidencia de distribuciones por una divergencia Jensen-Shannon con coeficientes, e incorpora pérdidas de clasificador sobre imagen limpia (`--cls_on_clean_image`, `--gen_cls_loss`, pesos 5e-3 y 1e-2) y GAN de difusión. Se entrenó con `real_guidance_scale` 1.75. El dataset declarado es `laion/laion2B-en-aesthetic`.

## Capacidades

- Generación de imágenes a partir de prompts de texto en 4 pasos de denoising.
- Dos variantes de destilación seleccionables según el compromiso entre fidelidad al prompt y guiado.
- Compatible con la arquitectura y el ecosistema de Stable Diffusion v1.5 (UNet, VAE, text encoder CLIP).
- Inferencia en FP16.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento (es un modelo puramente texto-a-imagen).
- Capacidad multilingüe: no disponible; el text encoder CLIP de SD1.5 está orientado principalmente a inglés.

## Casos de uso

- Generación de imágenes en producción con latencia baja: al requerir solo 4 pasos frente a los 20-50 habituales de SD1.5, reduce el coste por imagen en servicios de generación bajo demanda.
- Prototipado rápido de pipelines texto-a-imagen: permite iterar sobre prompts y parámetros con un coste de cómputo muy inferior al del modelo base.
- Generación masiva por lotes: útil en tareas de aumento de datos o creación de catálogos de imágenes donde el throughput prima sobre la máxima calidad.
- Despliegue en hardware modesto: al heredar el tamaño de SD1.5 y usar FP16, puede ejecutarse en GPUs de consumo, aunque el rendimiento exacto no se documenta.
- Investigación en destilación de modelos de difusión: sirve como referencia reproducible de las variantes Decoupled DMD y f-Divergence DMD sobre SD1.5.
- Comparación de métodos de destilación: las dos carpetas permiten evaluar empíricamente CLIP score y comportamiento de guiado entre ambos enfoques.
- Integración en aplicaciones creativas con requisitos de tiempo real: la reducción a 4 pasos facilita la generación interactiva.

## Benchmarks y rendimiento

| Variante | Metodo | real_guidance_scale | Checkpoint | CLIP score |
|---|---|---|---|---|
| /decoupled-dmd | Decoupled DMD | 3.0 | checkpoint_model_002000.bin | 0.325 |
| /f-divergence-dmd | f-Divergence DMD (JS) | 1.75 | checkpoint_model_002000.bin | 0.331 |

Ambos checkpoints se obtuvieron a 2000 pasos (2000 actualizaciones del generador, 10000 del guiado). El autor indica que el resultado de f-Divergence DMD supera ligeramente al modelo base. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de calidad de imagen como FID o ImageReward.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al heredar la arquitectura SD1.5 en FP16, se sitúa en el rango típico de modelos de difusión de ese tamaño, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño de SD1.5 y el uso de FP16, pero no confirmada por el autor.
- Opciones de despliegue: el ecosistema DMD2 y Diffusers; los checkpoints son `.bin` compatibles con el código base de DMD2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: no se publican cifras concretas; la ventaja declarada es la reducción a 4 pasos de denoising.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD1.5_4steps-DMD (este) | no disponible (base SD1.5) | no aplica (prompt CLIP ~77 tokens) | 4 | Apache 2.0 | HuggingFace |
| Stable Diffusion v1.5 (base) | no disponible en la informacion | no aplica | 20-50 tipicos | CreativeML Open RAIL-M | HuggingFace |
| Otras destilaciones de SD1.5 (p. ej. LCM, Turbo) | no disponible en la informacion | no aplica | 1-8 | variable | HuggingFace |

No se dispone de datos comparativos de rendimiento (FID, CLIP) frente a alternativas en la información proporcionada más allá del CLIP score interno de las dos variantes.

## Limitaciones y advertencias

- El autor señala que la alineación con el prompt y la capacidad de respuesta de SD1.5 son intrínsecamente limitadas, lo que acota la calidad máxima alcanzable.
- Riesgo de alucinación visual y de desviación del prompt inherente a los modelos de difusión destilados a pocos pasos.
- Idiomas: no se documenta soporte multilingüe; el text encoder CLIP de SD1.5 está orientado principalmente a inglés.
- Sesgos: el dataset de entrenamiento declarado es `laion/laion2B-en-aesthetic`, con los sesgos conocidos de LAION.
- Licencia Apache 2.0 para este repositorio, pero conviene verificar la licencia del modelo base SD1.5 (CreativeML Open RAIL-M) para uso comercial.
- Solo se documentan checkpoints en `.bin`; no hay variantes cuantizadas ni GGUF publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No se publican métricas de calidad de imagen (FID, ImageReward) ni evaluaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/aaroncaozj/SD1.5_4steps-DMD
- Paper Decoupled DMD (Alibaba): https://arxiv.org/abs/2511.22677
- Paper f-Divergence DMD (NVIDIA): http://arxiv.org/abs/2502.15681
- Código base DMD2: https://github.com/tianweiy/DMD2
- Modelo base Stable Diffusion v1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset LAION2B-en-aesthetic: https://huggingface.co/datasets/laion/laion2B-en-aesthetic
