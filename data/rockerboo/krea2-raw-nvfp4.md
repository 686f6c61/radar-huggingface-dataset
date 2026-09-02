# rockerBOO/krea2-raw-nvfp4

## Resumen

Krea 2 Raw NVFP4 es una version cuantizada del modelo de generacion de imagenes Krea 2 Raw, desarrollada por rockerBOO para su uso directo en ComfyUI. El modelo base, Krea 2 Raw, es un modelo de difusion entrenado desde cero por Krea AI, enfocado en exploracion creativa y estilistica, y disenado principalmente como base para fine-tuning y entrenamiento de LoRAs, no para inferencia directa. Esta cuantizacion NVFP4 reduce el peso del transformer principal de 30.3 GB a 8.3 GB (o 12 GB en la variante mixta ConvRot INT8), permitiendo ejecutar el modelo en GPUs Blackwell con requisitos de VRAM significativamente menores.

La relevancia de este modelo radica en que hace accesible Krea 2 Raw a usuarios con hardware mas limitado, manteniendo una calidad visual cercana a la version BF16 original, como demuestran las comparaciones visuales incluidas en la model card. El repositorio incluye dos archivos: una version NVFP4 pura (8.3 GB) y una variante mixta NVFP4 + ConvRot INT8 (12 GB) que mantiene las capas de atencion de los 24 bloques interiores en INT8 y los 4 bloques extremos en BF16 completo, ofreciendo la mejor calidad segun el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer de difusion) con rama de fusion de texto |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (transformer principal), NVFP4 + ConvRot INT8 (variante mixta), BF16 (capas conservadas) |
| Idiomas soportados | No disponible |
| Licencia | Krea 2 Community License (licencia comunitaria, uso comercial restringido) |
| Formato de pesos | safetensors (single-file, con metadatos para ComfyUI) |

## Arquitectura y entrenamiento

Krea 2 Raw es un modelo de difusion de imagenes entrenado desde cero por Krea AI, disenado especificamente como modelo base para fine-tuning. La arquitectura incluye 28 bloques transformer principales (atencion + MLP) y una rama de fusion de texto (`txtfusion.*`), junto con capas adicionales de proyeccion (`tproj.1`) y MLPs de texto (`tmlp.*`, `txtmlp.*`). El modelo original en BF16 pesa 30.3 GB.

La cuantizacion NVFP4 se realizo con la herramienta `convert_to_quant` (ctq) de silveroxides, aplicando NVFP4 a 224 de los 264 tensores de peso (~95% de los parametros), con optimizacion de learned rounding basada en SVD (no RTN). La rama de fusion de texto y las primeras/ultimas capas se mantienen en precision completa. La variante ConvRot INT8 mantiene las capas de atencion de los 24 bloques interiores en INT8, los MLPs en NVFP4, y los 4 bloques extremos (2 primeros y 2 ultimos) en BF16 completo. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes texto-a-imagen de alta calidad con enfoque creativo y estilistico.
- Modelo base disenado para fine-tuning y entrenamiento de LoRAs, no para inferencia directa (segun la documentacion de Krea AI).
- Compatible con ComfyUI mediante metadatos integrados en el archivo safetensors.
- Variante mixta con atencion en INT8 que preserva mayor fidelidad en capas criticas.
- Cuantizacion NVFP4 con learned rounding que minimiza la perdida de calidad frente a BF16.
- Requiere GPU Blackwell (SM >= 10.0/12.0) para inferencia.

## Casos de uso

- Fine-tuning de LoRAs sobre Krea 2 Raw: el modelo base esta disenado para personalizacion; los usuarios pueden entrenar LoRAs sobre el checkpoint cuantizado y usarlos con la variante Turbo para generacion rapida.
- Generacion de imagenes en ComfyUI con VRAM limitada: la cuantizacion NVFP4 reduce el peso de 30.3 GB a 8.3 GB, permitiendo ejecutar el modelo en GPUs Blackwell con menos memoria, como RTX 5090 (32 GB) o B200.
- Exploracion creativa y estilistica: el modelo esta entrenado para variedad estilistica, adecuado para artistas y disenadores que buscan resultados no fotorealistas.
- Prototipado rapido de pipelines de generacion: al ser un archivo unico con metadatos ComfyUI, se integra directamente en flujos de trabajo existentes sin conversion adicional.
- Comparacion de calidad de cuantizacion: el repositorio incluye comparativas visuales BF16 vs NVFP4, util para evaluar el impacto de la cuantizacion en diferentes estilos.
- Desarrollo de aplicaciones de generacion de imagenes con requisitos de hardware reducidos: la variante NVFP4 permite desplegar el modelo en entornos con GPUs Blackwell de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones visuales cualitativas (BF16 vs NVFP4) con el mismo seed, workflow y LoRA, mostrando diferencias minimas en los ejemplos presentados, pero no se proporcionan metricas cuantitativas como FID, CLIP score o tiempos de inferencia.

## Requisitos de hardware

- GPU Blackwell obligatoria (SM >= 10.0/12.0): RTX 50-series, B100, B200. No funciona en GPUs Ampere, Ada Lovelace o anteriores.
- VRAM estimada: el archivo NVFP4 pesa 8.3 GB, por lo que cabe en GPUs con 12-16 GB de VRAM (RTX 5060 Ti 16 GB, RTX 5070, etc.). La variante ConvRot INT8 (12 GB) requiere al menos 16 GB de VRAM.
- GPUs recomendadas: RTX 5070/5080/5090 para uso local; B100/B200 para produccion o despliegue en centro de datos.
- Opciones de despliegue: ComfyUI es el entorno principal soportado. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Hardware requerido | Licencia | Uso previsto |
|---|---|---|---|---|---|
| krea/Krea-2-Raw (BF16) | safetensors | 30.3 GB | GPU con 40+ GB VRAM | Krea 2 Community License | Fine-tuning, base |
| rockerBOO/krea2-raw-nvfp4 (NVFP4) | safetensors | 8.3 GB | Blackwell (SM >= 10.0) | Krea 2 Community License | Inferencia en ComfyUI |
| rockerBOO/krea2-raw-nvfp4 (ConvRot INT8) | safetensors | 12 GB | Blackwell (SM >= 10.0) | Krea 2 Community License | Inferencia de maxima calidad |
| krea/Krea-2-Turbo | no disponible | no disponible | no disponible | Krea 2 Community License | Inferencia rapida texto-a-imagen |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de informacion sobre modelos de difusion comparables de otros desarrolladores con cuantizacion NVFP4.

## Limitaciones y advertencias

- Requiere hardware Blackwell obligatoriamente; no es compatible con GPUs de generaciones anteriores, lo que limita su uso a hardware muy reciente.
- Krea 2 Raw es un modelo base para fine-tuning, no recomendado para inferencia directa segun la documentacion oficial de Krea AI; los resultados de generacion directa pueden ser suboptimos.
- La licencia Krea 2 Community License impone restricciones de uso comercial; es necesario revisar el documento de licencia enlazado antes de cualquier despliegue en produccion.
- La cuantizacion NVFP4 puede introducir perdida de calidad en ciertos estilos o prompts, aunque las comparativas visuales muestran diferencias minimas en los ejemplos proporcionados.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma, ya que la model card no incluye estos datos.
- El modelo no incluye informacion sobre el pipeline de difusion completo (text encoder, VAE, scheduler), por lo que requiere el entorno ComfyUI con los componentes adicionales del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rockerBOO/krea2-raw-nvfp4
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Repositorio oficial de inferencia Krea 2: https://github.com/krea-ai/krea-2
- Blog tecnico de Krea 2: https://www.krea.ai/krea-2-open-source
- Herramienta de cuantizacion ctq: https://github.com/silveroxides/convert_to_quant
- Licencia Krea 2 Community License: https://cdn.jsdelivr.net/gh/krea-ai/krea-2@db3984fbc6e13b34c0064990fc2d95ac64d00058/assets/hf_samples/LICENSE.pdf
- Tutorial de Krea 2 (BF16/FP8/NVFP4/INT8): https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html
