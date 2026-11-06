# kaiariel/sd-v1-4-oldbookillustrations-fusionado

## Resumen

`kaiariel/sd-v1-4-oldbookillustrations-fusionado` es un modelo de generación de imágenes texto-a-imagen derivado de `CompVis/stable-diffusion-v1-4`, publicado por el usuario kaiariel como entrega final del Módulo 7 (Modelos de Generación de Imagen) del Máster en IA, Cloud Computing y DevOps de Pontia. Se trata de un ajuste fino mediante LoRA sobre la U-Net del modelo base, entrenado con 1500 ilustraciones del dataset `gigant/oldbookillustrations`, cuyo efecto es que el modelo genere por defecto imágenes con estética de grabado o ilustración de libro antiguo sin necesidad de especificarlo en el prompt.

Técnicamente es un checkpoint de difusión latente de Stable Diffusion v1.4 con los pesos del adaptador LoRA ya fusionados en la U-Net, por lo que se distribuye como un pipeline `StableDiffusionPipeline` estándar de la librería diffusers y no requiere cargar el adaptador por separado. El repositorio ocupa 2,7 GB y contiene 859.520.964 parámetros en formato safetensors.

Su relevancia es acotada: no compite en calidad general con modelos de difusión modernos, sino que sirve como ejemplo reproducible de especialización estilística de bajo coste (16 minutos de entrenamiento en una NVIDIA T4 de Google Colab) y como caso práctico de fusión de adaptadores LoRA en un checkpoint autónomo. Es un artefacto educativo y de nicho, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (U-Net + autoencoder VAE + codificador de texto CLIP), base Stable Diffusion v1.4 |
| Parámetros totales | 859.520.964 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto se trunca a 77 tokens, límite estándar de CLIP en SD 1.x) |
| Tipos de cuantización | no disponible (el repo publica safetensors en fp16/fp32; no se documentan variantes GGUF ni ONNX) |
| Idiomas soportados | no disponible (el prompt se procesa con el codificador CLIP de SD 1.4, predominantemente inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (pipeline diffusers) |

## Arquitectura y entrenamiento

El modelo mantiene íntegra la arquitectura de Stable Diffusion v1.4: un autoencoder variacional que comprime imágenes a un espacio latente de 4 canales, una U-Net que realiza la denoising en ese espacio latente condicionada por embeddings de texto, y un codificador de texto CLIP congelado. La única modificación es la inyección y posterior fusión de un adaptador LoRA en las capas de atención de la U-Net (`to_q`, `to_k`, `to_v`, `to_out.0`), con rango r = 16 y alpha = 16.

El entrenamiento usó 1500 imágenes del dataset `gigant/oldbookillustrations` (columnas `1600px` e `info_alt`), barajadas con semilla 42 y descartando las de proporción superior a 1.8. El preprocesado consistió en redimensionar el lado corto a 512 px y aplicar recorte central de 512×512. Se entrenaron 3 épocas con tamaño de lote 4, learning rate 0.0001, optimizador AdamW y precisión mixta fp16, en una NVIDIA T4 de Google Colab durante 16 minutos. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias; es un ajuste supervisado puramente estilístico.

## Capacidades

- Generación de imágenes texto-a-imagen con estética por defecto de grabado e ilustración de libro antiguo, sin necesidad de indicarlo en el prompt.
- Transferencia de estilo aplicada de forma global: el sesgo estilístico afecta a cualquier prompt, no solo a los que mencionan libros o grabados.
- Compatibilidad con el ecosistema diffusers: carga directa mediante `StableDiffusionPipeline.from_pretrained`.
- Soporte de los parámetros estándar de muestreo de SD 1.x (guidance scale, número de pasos, schedulers, semillas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es un modelo exclusivamente de imagen.
- Capacidad multilingüe no documentada; el codificador CLIP de SD 1.4 está sesgado hacia inglés.

## Casos de uso

- Ilustración editorial retro: generar imágenes de acompañamiento para artículos, fanzines o publicaciones que busquen una estética de grabado decimonónico, aprovechando que el estilo se aplica sin prompt negativo ni modificadores.
- Prototipado rápido de portadas: crear bocetos de cubierta para libros, revistas o cuadernos con un aspecto coherente de ilustración antigua en pocos pasos de muestreo.
- Generación de material para juegos de rol o narrativa histórica: producir ilustraciones de ambientación victoriana o clásica de forma consistente gracias al sesgo estilístico fusionado.
- Docencia y demostración de fine-tuning: servir como ejemplo reproducible de entrenamiento LoRA sobre SD 1.4 y de fusión de adaptadores, con hiperparámetros y hardware documentados.
- Creación de assets para proyectos de diseño con presupuesto mínimo: al caber en GPUs de consumo y requerir pocos recursos, permite iterar localmente sin coste de API.
- Generación de fondos y texturas con aire vintage para maquetación web o impresa, donde la fidelidad literal al prompt importa menos que la coherencia estética.
- Base para un segundo ajuste fino: al ser un checkpoint fusionado estándar, puede reutilizarse como punto de partida para nuevos LoRA sobre el mismo estilo.

## Benchmarks y rendimiento

El autor publica una evaluación propia con CLIP (`openai/clip-vit-base-patch32`) sobre un conjunto de prompts de evaluación no detallado, comparando el modelo base con dos rangos de LoRA:

| Modelo | Fidelidad al prompt | Probabilidad de estilo antiguo |
|---|---:|---:|
| Base (SD 1.4) | 30.92 | 0.00 |
| LoRA r = 4 | 30.92 | 0.06 |
| LoRA r = 16 (fusionado) | 31.40 | 0.11 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score sobre COCO, etc.) en la información disponible. Las métricas anteriores son internas del autor y de alcance limitado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 4-6 GB para el pipeline completo a 512×512; el checkpoint pesa 2,7 GB en disco.
- GPU recomendadas: NVIDIA T4 (la usada en el entrenamiento), RTX 3060 12 GB, RTX 4060 Ti, RTX 4090; también A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más de VRAM en fp16; con 4 GB puede requerir `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: diffusers (nativo), endpoints compatibles según los tags del repo; no se documentan pesos GGUF para llama.cpp ni soporte explícito de vLLM o TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles; el autor solo reporta 16 minutos para el entrenamiento completo en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de prompt | Estilo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd-v1-4-oldbookillustrations-fusionado | 859,5 M | 77 tokens (CLIP) | Grabado/libro antiguo por defecto | creativeml-openrail-m | Hugging Face, 0 descargas |
| CompVis/stable-diffusion-v1-4 | 859,5 M | 77 tokens (CLIP) | Generalista | creativeml-openrail-m | Hugging Face, ampliamente usado |
| SD 1.5 (runwayml) | ~860 M | 77 tokens (CLIP) | Generalista, mejor calidad percibida | creativeml-openrail-m | Hugging Face, muy extendido |
| SDXL base 1.0 | ~3,5 B (U-Net) | 77 tokens por codificador, doble codificador | Generalista, alta resolución | creativeML Open RAIL++-M | Hugging Face |

La comparación relevante es frente al propio SD 1.4: este modelo no mejora la calidad general ni la fidelidad al prompt de forma significativa (31,40 frente a 30,92 en la métrica del autor), sino que introduce un sesgo estilístico medible (0,11 frente a 0,00). Frente a SDXL, la diferencia de parámetros y de resolución nativa es de un orden de magnitud.

## Limitaciones y advertencias

- Sesgo estilístico global: el modelo tiende a producir grabados e ilustraciones antiguas incluso cuando el prompt pide otro estilo, lo que puede ser indeseable en usos generalistas.
- Fidelidad al prompt apenas mejorada respecto al base; la métrica del autor sugiere una ganancia marginal.
- Riesgo de alucinación visual y de anatomía incorrecta inherente a SD 1.4, especialmente en manos, rostros pequeños y texto dentro de la imagen.
- Resolución nativa limitada a 512×512; generar a resoluciones mayores sin técnicas de upscaling produce artefactos.
- Prompt limitado a 77 tokens por el codificador CLIP; no admite instrucciones largas ni contexto extendido.
- Idiomas no documentados; el rendimiento en castellano no está verificado y probablemente sea inferior al inglés.
- Licencia CreativeML Open RAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir restricciones equivalentes en derivados); conviene revisar el texto completo antes de desplegar en producción.
- Modelo sin tracción: cero descargas y cero likes en la fecha de consulta, sin validación externa ni mantenimiento conocido.
- Origen educativo: es una entrega de máster, no un modelo con garantías de soporte, documentación completa ni evaluación rigurosa.
- El dataset de entrenamiento (`gigant/oldbookillustrations`) puede contener material con derechos de autor no verificados; el autor no documenta la procedencia ni la licencia de las 1500 imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaiariel/sd-v1-4-oldbookillustrations-fusionado
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Codificador CLIP usado en la evaluación: https://huggingface.co/openai/clip-vit-base-patch32
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Librería diffusers: https://github.com/huggingface/diffusers
