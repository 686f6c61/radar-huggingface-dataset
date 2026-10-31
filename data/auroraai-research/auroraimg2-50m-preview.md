# AuroraAI-Research/AuroraIMG2-50M-Preview

## Resumen

AuroraIMG2-50M-Preview es un modelo de texto a imagen de 256×256 píxeles desarrollado por AuroraAI-Research, construido alrededor de un diffusion transformer de flow matching con 50,4 millones de parámetros y un codificador de texto propio de 12,6 millones. Ambos componentes se entrenaron desde cero en solo 10 horas sobre una única NVIDIA RTX PRO 6000, lo que lo convierte en un caso de estudio interesante sobre cuánto se puede lograr con cómputo y parámetros mínimos.

El modelo trabaja en el espacio latente del VAE de FLUX.2 y convierte los latentes en píxeles mediante el decodificador congelado FLUX.2 small decoder de Black Forest Labs (27,9 millones de parámetros, también Apache-2.0). El método de generación es flow matching latente (rectified flow) con classifier-free guidance, y la inferencia usa un sampler Euler de 50 pasos con CFG 3.0 (o 20 pasos en modo rápido).

Se trata de una versión Preview, orientada a investigación y experimentación más que a producción. En GenEval 2 obtiene 6,00 de Soft-TIFA GM y 36,03 de Soft-TIFA AM. Su relevancia está en demostrar un pipeline completo (tokenizador, codificador de texto, denoiser DiT y decodificador) entrenable en hardware de una sola GPU, con licencia Apache-2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow matching latente (rectified flow) + codificador de texto transformer |
| Parametros totales | 50.433.664 (denoiser 50,4M + codificador de texto 12,6M; decodificador FLUX.2 congelado: 27,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 64 tokens de prompt (62 tokens + tokens de inicio y fin) |
| Tipos de cuantizacion | fp32 (referencia de benchmarks), bfloat16 vía autocast o carga directa |
| Idiomas soportados | inglés (prompts) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB), pipeline personalizado de diffusers con custom_code |

## Arquitectura y entrenamiento

El denoiser es un DiT de 8 bloques con anchura 640 y 10 cabezas de atención (dimensión de cabeza 64). Cada píxel latente de la rejilla 16×16 es un token, por lo que no hay paso de patchify. Cada bloque combina autoatención con embeddings rotatorios 2D y QK-norm, atención cruzada hacia los tokens de texto y una capa feed-forward SwiGLU. El condicionamiento temporal usa adaLN-single al estilo PixArt: una proyección temporal compartida más una tabla de modulación aprendida por bloque, inicializada a cero para que cada bloque comience como identidad.

El codificador de texto es un transformer pre-norm de 6 capas (anchura 384, 6 cabezas de consulta con 2 cabezas de clave/valor, GQA) con RoPE, MLP SwiGLU y RMSNorm, alimentado por un tokenizador byte-level BPE de 8192 tokens entrenado sobre los captions del dataset. Se entrena conjuntamente con el denoiser, de modo que aprende la representación más útil para el modelo de imagen.

El entrenamiento se realizó desde cero durante 10 horas en una única NVIDIA RTX PRO 6000, con 247.805 pasos y batch size 256, sobre el dataset QLNI/FLUX-Reason-6M-flux2-latents, que proporciona latentes FLUX.2 precalculados de recortes centrales de 256 px con varios captions por imagen. El muestreo es integración Euler simple del campo de velocidades aprendido de t=1 (ruido) a t=0 en una rejilla uniforme, con classifier-free guidance contra un prompt vacío aprendido durante el entrenamiento.

## Capacidades

- Generación de texto a imagen a resolución fija de 256×256 RGB
- Alineación texto-imagen mediante attention cruzada y classifier-free guidance (CFG 3.0 recomendado)
- Generación rápida con 20 pasos con pérdida mínima de calidad
- Soporte de batches (lista de prompts) y varias imágenes por prompt (`num_images_per_prompt`)
- Espacio latente compatible con FLUX.2 (128×16×16), reutilizando el decodificador congelado de FLUX.2
- Pipeline integrado con la librería diffusers de Hugging Face (requiere `trust_remote_code=True`)
- No soporta negative prompts arbitrarios (solo el prompt vacío aprendido en entrenamiento)
- No tiene capacidades de vision, audio, tool calling ni razonamiento; es un modelo exclusivamente generativo de imágenes

## Casos de uso

- Investigación en modelos pequeños de difusión: su tamaño de 50M parámetros y su entrenamiento de 10 horas en una GPU lo hacen ideal como base para experimentos de ablación, destilación o nuevas técnicas de flow matching
- Educación y formación: permite estudiar y ejecutar un pipeline completo de texto a imagen (tokenizador, encoder, DiT, decodificador) en hardware modesto, sin depender de modelos gigantes
- Prototipado rápido de ideas de generación de imágenes: la generación en 20 pasos permite iterar prompts y configuraciones con baja latencia en GPUs de consumo
- Generación de imágenes ilustrativas de baja resolución: miniaturas, assets de pruebas, ilustraciones de storybook (como muestran los ejemplos del repo) donde la calidad fotorrealista no es crítica
- Fine-tuning asequible: al ser un modelo tan pequeño, es candidato natural para fine-tuning en dominios concretos (estilos, datasets pequeños) en una sola GPU de consumo
- Benchmarking de hardware y pipelines de inferencia: útil como carga de trabajo ligera y reproducible para medir throughput de GPUs y optimizar pipelines de diffusers
- Estudio de representaciones de texto para imagen: el codificador de texto entrenado conjuntamente permite analizar qué representaciones aprende un modelo de imagen cuando no usa un encoder de lenguaje preentrenado

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| GenEval 2 — Soft-TIFA GM | 6,00 |
| GenEval 2 — Soft-TIFA AM | 36,03 |

No se han publicado comparaciones con otros modelos en la información disponible. Los benchmarks se midieron con pesos fp32 bajo autocast bfloat16 y el decodificador en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ~63M de parámetros entrenados más ~28M del decodificador y pesos en bfloat16, el modelo completo ocupa en el orden de 0,5 GB (tamaño del repo), por lo que debería funcionar con holgura en GPUs con 4-6 GB de VRAM; no se publica una cifra oficial
- GPU recomendada para entrenamiento (según los autores): NVIDIA RTX PRO 6000 (entrenamiento completo en 10 horas); para inferencia basta cualquier GPU CUDA moderna
- Cabe en GPUs de consumo: sí, es uno de los puntos fuertes del modelo; incluso GPUs de gama media deberían ejecutarlo sin problemas
- Despliegue: vía diffusers (`DiffusionPipeline.from_pretrained` con `custom_pipeline` y `trust_remote_code=True`); no se menciona soporte en vLLM, llama.cpp, Ollama ni TGI
- Latencia y throughput estimados: no disponible; el propio repo indica que 20 pasos ofrecen generación rápida con pérdida mínima de calidad respecto a los 50 pasos por defecto
- Puede ejecutarse en CPU (`device="cpu"` en el ejemplo oficial), aunque sin cifras de latencia publicadas

## Comparativa con modelos similares

| Modelo | Parametros (denoiser) | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| AuroraIMG2-50M-Preview | 50,4M (+12,6M encoder) | 256×256 fija | Apache-2.0 | Entrenado desde cero en 10 h en 1 GPU; usa espacio latente y decoder de FLUX.2 |
| Stable Diffusion 1.5 | ~860M (UNet) | 512×512 | CreativeML OpenRAIL-M | Mucho mayor y más capaz, pero con licencia con restricciones de uso |
| PixArt-α | ~600M (DiT) | 512×1024 | AGPL-3.0 | DiT con adaLN (misma técnica de condicionamiento temporal), usa T5 como encoder |
| Sana (NVIDIA) | ~600M | hasta 4096×4096 | Apache-2.0 | Eficiente en generación de alta resolución, considerablemente mayor |

AuroraIMG2 se posiciona como un modelo experimental de escala radicalmente menor (más de 10 veces por debajo de los DiT habituales), útil para investigación y educación, no como competidor directo de modelos de producción.

## Limitaciones y advertencias

- Resolución fija de 256×256; no soporta otras resoluciones ni relaciones de aspecto
- Solo entiende prompts en inglés; el tokenizador y el codificador se entrenaron con captions en inglés
- No soporta negative prompts arbitrarios: solo funciona con el prompt vacío aprendido durante el entrenamiento
- Es una versión Preview: la calidad es limitada (36,03 Soft-TIFA AM en GenEval 2) y los autores no lo presentan como modelo de producción
- Riesgo de alucinación visual y artefactos propio de modelos muy pequeños; no se documentan sesgos específicos, pero al derivar de un dataset de latentes FLUX.2 puede heredar los sesgos del modelo y dataset originales
- Requiere `trust_remote_code=True` al cargar el pipeline, lo que implica ejecutar código personalizado del repo: revisarlo antes de usarlo en entornos sensibles
- Los benchmarks se midieron con una configuración concreta de precisión (fp32 + autocast bfloat16); cargar en bfloat16 puro funciona pero no fue evaluado por separado
- La licencia Apache-2.0 permite uso comercial, pero el decodificador FLUX.2 bundled debe respetar igualmente su licencia Apache-2.0 de Black Forest Labs

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Decodificador FLUX.2 small (congelado): https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Paper (arXiv): https://arxiv.org/abs/2512.16853
- Rejilla de muestras: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview/resolve/main/samples/grid.png
