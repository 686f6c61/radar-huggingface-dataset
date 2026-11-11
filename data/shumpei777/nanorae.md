# shumpei777/nanoRAE

## Resumen

nanoRAE es una reproducción a pequeña escala de los Diffusion Transformers con Representation Autoencoders (RAE), publicada por shumpei777 (autor del repositorio shumpei-takezaki/nanoRAE) bajo licencia MIT. El modelo implementa el pipeline descrito en el paper arXiv:2510.11690 sobre el conjunto de datos CIFAR-10, y su objetivo es servir como banco de pruebas reproducible para estudiar la combinación de autoencoders de representación (basados en DINOv2) con difusión latente mediante Diffusion Transformers (DiT).

El repositorio contiene pesos preentrenados organizados en dos etapas: la etapa 1 incluye codificadores DINOv2 ViT-Tiny/4 y ViT-S/4 entrenados desde cero con nanoDINO, junto con decodificadores ViT-B, ViT-L y ViT-XL; la etapa 2 contiene modelos de difusión DiT y LightningDiT con distintos anchos de cabeza y variantes de muestreo (RJF, RFM, x-prediction, velocity prediction). El modelo de mejor calidad reportado alcanza un FID de 4,70 sobre 50.000 muestras sin classifier-free guidance.

No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un modelo generativo de imágenes de 32x32 píxeles entrenado exclusivamente sobre CIFAR-10. Su relevancia es fundamentalmente investigadora y educativa, ya que permite reproducir y experimentar con técnicas de difusión latente sobre hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT / LightningDiT) con Representation Autoencoder (DINOv2 ViT como codificador) |
| Parametros totales | No disponible de forma agregada; el modelo de difusión principal DiT-DH-S con cabeza de 512 tiene 0,2 GB de pesos; el codificador Tiny 22 MB y el decodificador ViT-XL 1,7 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imágenes, entrada 32x32 píxeles de CIFAR-10) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (partes del código de entrenamiento tienen licencias propias, p. ej. RAEv2) |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

nanoRAE sigue el esquema de dos etapas de los RAE. En la etapa 1 se entrena un autoencoder de representación: el codificador es un DINOv2 ViT-Tiny/4 (22 MB) o ViT-S/4 (85 MB) entrenado desde cero sobre CIFAR-10 con nanoDINO, y el decodificador es un transformer ViT-B, ViT-L o ViT-XL que reconstruye la imagen desde el espacio latente. Se incluyen estadísticas de normalización por canal y posición, así como referencias FID calculadas con Inception-v3 sobre los conjuntos de entrenamiento (50.000 imágenes) y test (10.000 imágenes) de CIFAR-10. Algunas variantes de decodificador incorporan un discriminador GAN basado en un backbone DINO v1 ViT-Tiny/4 congelado.

La etapa 2 entrena modelos de difusión sobre el espacio latente del codificador. Las variantes incluyen DiT-DH (con cabeza de 512 o 2048 dimensiones), LightningDiT-S/1 y LightningDiT-Ti/1, con 2.000 épocas de entrenamiento y pesos EMA. Se exploran innovaciones como RJF (Random Jacobian Flow) y RFM (Random Flow Matching) con radio esférico R=18 o R=13,66, predicción x-prediction frente a velocity prediction, y técnicas de guiado como AutoGuidance (guiado por un modelo débil entrenado 80 épocas) y REPA Guidance (cabeza REPA interna tras el bloque 4 del cuerpo que permite autoguiado). El mejor resultado reportado es FID 4,70 con DiT-DH-S-h512-xpred-IG (x-prediction + REPA head, w=3,0).

## Capacidades

- Generación de imágenes sintéticas de 32x32 píxeles del dominio CIFAR-10 (10 clases: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Codificación de imágenes a representaciones latentes mediante DINOv2 ViT-Tiny/4 o ViT-S/4 entrenados desde cero.
- Decodificación de latentes a imágenes mediante decodificadores ViT-B, ViT-L o ViT-XL.
- Muestreo con difusión en el espacio latente, con soporte para RJF, RFM, x-prediction, velocity prediction, AutoGuidance y REPA Guidance.
- Evaluación de calidad generativa mediante FID con referencias Inception-v3 compatibles incluidas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de investigación: replicar los resultados del paper arXiv:2510.11690 sobre CIFAR-10 usando los pesos publicados y las configuraciones del repositorio, útil para validar técnicas de difusión latente con autoencoders de representación.
- Estudio de decodificadores: comparar el impacto del tamaño del decodificador (ViT-B, ViT-L, ViT-XL) y del uso de GAN en la calidad de reconstrucción, con métricas rFID reportadas (5,51 a 3,71).
- Experimentación con técnicas de guiado: evaluar AutoGuidance y REPA Guidance sobre un mismo modelo base, comparando FID (6,48 frente a 4,70) y coste computacional.
- Docencia y formación: usar el pipeline completo (codificador, decodificador, difusión) como ejemplo didáctico de arquitecturas generativas modernas sobre hardware asequible.
- Benchmarking de muestreo: comparar variantes RJF, RFM y predicción estándar sobre el mismo espacio latente, con radios esféricos configurables.
- Desarrollo de métodos de normalización latente: las estadísticas por canal y posición incluidas permiten estudiar el efecto de la normalización en la calidad de generación.
- Pruebas de infraestructura de entrenamiento: el tamaño reducido (repo de 14,1 GB, modelos de 0,03 a 1,7 GB) permite validar pipelines de entrenamiento y evaluación antes de escalar a otros datasets.

## Benchmarks y rendimiento

Los únicos benchmarks publicados son FID y rFID sobre CIFAR-10. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que no es un modelo de lenguaje.

| Modelo (etapa 2) | Config | FID (50k, sin CFG) | Tamaño |
|---|---|---:|---:|
| DiT-DH-S-h512-xpred-IG | `DiTDH-S-h512-xpred-IG` | 4,70 | 0,2 GB |
| DiT-DH-S-h512-vpred-IG | `DiTDH-S-h512-vpred-IG` | 5,45 | 0,2 GB |
| LightningDiT-S-RJF-AG | `LightningDiT-S-RJF-AG` | 6,07 | 0,03 GB |
| LightningDiT-S-RFM-AG | `LightningDiT-S-RFM-AG` | 6,11 | 0,03 GB |
| DiT-DH-S-h512-RJF-AG | `DiTDH-S-h512-RJF-AG` | 6,31 | 0,07 GB |
| DiT-DH-S-h512-AG | `DiTDH-S-h512-AG` | 6,48 | 0,07 GB |
| DiT-DH-S-h512-RJF | `DiTDH-S-h512-RJF` | 6,81 | 0,2 GB |
| LightningDiT-S-RJF | `LightningDiT-S-RJF` | 6,97 | 0,1 GB |
| LightningDiT-S-RFM | `LightningDiT-S-RFM` | 7,09 | 0,1 GB |
| DiT-DH-S-h512 | `DiTDH-S-h512` | 7,94 | 0,2 GB |
| DiT-DH-S-h512-xpred | `DiTDH-S-h512-xpred` | 8,22 | 0,2 GB |
| LightningDiT-S | `LightningDiT-S` | 8,70 | 0,1 GB |
| DiT-DH-S-h512-noshift | `DiTDH-S-h512-noshift` | 9,01 | 0,2 GB |
| LightningDiT-Ti-RFM | `LightningDiT-Ti-RFM` | 9,41 | 0,03 GB |
| LightningDiT-Ti-RJF | `LightningDiT-Ti-RJF` | 9,22 | 0,03 GB |
| DiT-DH-Ti | `DiTDH-Ti` | 9,64 | 0,1 GB |
| DiT-DH-S-h512-nonoise | `DiTDH-S-h512-nonoise` | 10,45 | 0,2 GB |
| DiT-DH-S (cabeza 2048) | `DiTDH-S` | 13,59 | 0,8 GB |

| Decodificador (etapa 1) | Encoder | GAN | rFID | Tamaño |
|---|---|---|---:|---:|
| decoder_vitb | Tiny | no | 5,51 | 0,3 GB |
| decoder_vitb_gan | Tiny | sí | 6,57 | 0,3 GB |
| decoder_vitl | Tiny | no | 5,15 | 1,2 GB |
| decoder_vitl_gan | Tiny | sí | 5,80 | 1,2 GB |
| decoder_vitxl | Tiny | no | 5,25 | 1,7 GB |
| decoder_vitxl_gan | Tiny | sí | 5,71 | 1,7 GB |
| decoder_vitxl_gan_nonoise | Tiny | sí | 4,22 | 1,7 GB |
| decoder_vitxl_s4 | S | no | 3,97 | 1,7 GB |
| decoder_vitxl_gan_s4 | S | sí | 3,71 | 1,7 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El modelo de difusión principal ocupa 0,2 GB, el codificador Tiny 22 MB y el decodificador ViT-XL 1,7 GB; el conjunto completo cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA suficiente para PyTorch, desde una RTX 3060 o RTX 4090 hasta A100/H100 para entrenamiento. Para inferencia no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM, dado el tamaño reducido de los pesos.
- Opciones de despliegue: el repositorio oficial usa `uv` y scripts Python (`src/sample.py`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imágenes).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto / entrada | FID CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nanoRAE (DiT-DH-S-h512-xpred-IG) | Difusión latente con RAE | 0,2 GB (difusión) + 1,7 GB (decoder) | 32x32 píxeles | 4,70 | MIT | Hugging Face |
| DiT original (paper) | Difusión latente | No disponible | 32x32 píxeles | No disponible en esta información | No disponible | No disponible |
| LightningDiT (paper) | Difusión latente | No disponible | 32x32 píxeles | No disponible en esta información | No disponible | No disponible |
| RAE (paper arXiv:2510.11690) | Difusión con Representation Autoencoder | No disponible | No disponible | No disponible en esta información | No disponible | No disponible |

No se dispone de datos comparativos de FID de los modelos originales en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre CIFAR-10 (32x32 píxeles, 10 clases); no generaliza a otras resoluciones, dominios ni tareas.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling, agentes, visión general ni audio.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes plausibles pero incorrectas respecto a la distribución real; el FID de 4,70 indica una calidad limitada en comparación con modelos de difusión modernos sobre otros datasets.
- Sesgos del dataset: hereda los sesgos y limitaciones de CIFAR-10, incluidas las clases y la resolución fijas.
- Licencia: MIT para los pesos, pero partes del código de entrenamiento tienen licencias propias (por ejemplo, RAEv2), por lo que conviene revisar la compatibilidad antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni soporte documentado más allá de la model card y el repositorio GitHub.
- Los pesos están en formato PyTorch (.pt); no se ofrecen versiones GGUF ni cuantizadas.
- La calidad de generación depende de la combinación de codificador, decodificador y modelo de difusión; usar configuraciones no documentadas puede degradar el FID.

## Enlaces

- Hugging Face: https://huggingface.co/shumpei777/nanoRAE
- Repositorio GitHub: https://github.com/shumpei-takezaki/nanoRAE
- Documentación del repositorio: https://github.com/shumpei-takezaki/nanoRAE/blob/main/docs/README.md
- Paper de referencia: https://arxiv.org/abs/2510.11690
- nanoDINO (entrenamiento de codificadores): https://github.com/shumpei-takezaki/nanoDINO
