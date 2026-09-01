# OneScience-Group/SatMAE-PP

## Resumen

SatMAE++ es un modelo de autoencoder enmascarado (masked autoencoder) diseñado específicamente para imágenes satelitales ópticas y multiespectrales. Fue propuesto por el equipo de Mubashir Noman, Muzammal Naseer, Hisham Cholakkal, Rao Muhammad Anwar, Salman Khan y Fahad Shahbaz Khan, de la Universidad de Inteligencia Artificial Mohamed bin Zayed (MBZUAI) en Abu Dabi, y presentado en CVPR 2024 bajo el título "Rethinking Transformers Pre-training for Multi-Spectral Satellite Imagery".

El modelo emplea un codificador de tokens visibles para aprender representaciones de teledetección y un decodificador convolucional multiescala que reconstruye objetivos a escala nativa. Soporta entradas RGB y Sentinel agrupadas, con un objetivo de entrenamiento compuesto por MSE+L1 tanto para parches enmascarados como para reconstrucción multiescala. Está preentrenado con los conjuntos FMoW-RGB y FMoW-Sentinel, y destaca por su capacidad de transferencia a tareas de clasificación de escenas y cobertura del suelo.

Su relevancia actual radica en que aborda un problema específico de la teledetección: la reconstrucción de imágenes satelitales a múltiples resoluciones espaciales nativas, superando las limitaciones de los autoencoders enmascarados estándar que trabajan con una única escala. La arquitectura base es un transformer ViT-L, con longitudes de contexto que dependen de la configuración de parcheo y tamaño de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (ViT-L) con codificador de tokens visibles y decodificador convolucional multiescala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion: 224/16 para RGB, 96/8 para Sentinel) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision por computador, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

SatMAE++ se basa en un transformer ViT-L como codificador, pero a diferencia del MAE clasico, solo procesa los tokens visibles (no enmascarados) para reducir coste computacional. El decodificador es convolucional y multiescala: reconstruye la imagen a resoluciones nativas de 1x, 2x y, en el caso de Sentinel, 4x. El objetivo de entrenamiento combina perdidas MSE y L1 para los parches enmascarados y para la reconstruccion multiescala.

El preentrenamiento se realiza sobre FMoW-RGB (imagenes opticas de 3 canales) y FMoW-Sentinel (imagenes multiespectrales de 10 canales, agrupadas en 3 grupos espectrales tras eliminar las bandas B1, B9 y B10). La configuracion principal para RGB es ViT-L con parche de 16 y tamaño de entrada 224, entrenado durante 800 epocas; para Sentinel se usa ViT-L con parche de 8 y tamaño 96, durante 50 epocas. El modelo admite entrenamiento distribuido con `torchrun`.

## Capacidades

- Representacion de imagenes satelitales opticas y multiespectrales mediante aprendizaje autosupervisado.
- Reconstruccion multiescala de imagenes a resoluciones nativas de 1x, 2x y 4x.
- Transferencia a tareas de clasificacion de escenas de teledeteccion (EuroSAT, UCMerced, RESISC-45).
- Fine-tuning para clasificacion multi-etiqueta de cobertura del suelo en datasets multiespectrales como BigEarthNet.
- Preentrenamiento sobre datos RGB y multiespectrales agrupados por bandas espectrales.
- Soporte de entrenamiento distribuido multi-GPU (DDP) mediante `torchrun`.
- Uso con datos sinteticos para validacion rapida del flujo completo (entrenamiento, inferencia, evaluacion y visualizacion).

## Casos de uso

- Clasificacion de escenas de teledeteccion: fine-tuning de las representaciones aprendidas en datasets como EuroSAT, UCMerced o RESISC-45 para identificar tipos de cobertura del suelo (urbano, agricola, bosque, etc.) en imagenes opticas.
- Clasificacion multi-etiqueta de cobertura del suelo: ajuste fino sobre BigEarthNet para detectar multiples clases de cobertura dentro de una misma region, aprovechando los 10 canales multiespectrales de Sentinel.
- Preentrenamiento de modelos de teledeteccion: usar SatMAE++ como inicializacion para otros modelos de vision que trabajen con imagenes satelitales, reduciendo la necesidad de datos etiquetados.
- Reconstruccion de imagenes multiespectrales: generar versiones de alta resolucion (2x y 4x) de parches enmascarados, util para tareas de superresolucion o restauracion de imagenes.
- Analisis temporal de cambios en el territorio: al preentrenar con FMoW, las representaciones capturan dinamicas temporales que pueden transferirse a tareas de deteccion de cambios o seguimiento de cultivos.
- Investigacion en representaciones de teledeteccion: servir como base para estudiar el efecto del preentrenamiento en multiples escalas espaciales y grupos espectrales, comparando con otros autoencoders enmascarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de rendimiento en datasets de evaluacion.

## Requisitos de hardware

- Se recomienda GPU o DCU para ejecucion; la CPU solo es viable para validaciones de conectividad con configuraciones pequenas.
- Para el entrenamiento con la configuracion de papel (ViT-L, 224/16, 800 epocas) se necesitan GPUs de alta capacidad; no se especifica VRAM exacta.
- El entrenamiento distribuido con 8 GPUs se puede lanzar mediante `torchrun --nproc_per_node=8 scripts/train.py`.
- No se proporcionan datos de latencia ni throughput de inferencia.
- Opciones de despliegue: el repositorio incluye scripts de entrenamiento e inferencia en PyTorch; no se mencionan integraciones con vLLM, llama.cpp u Ollama (al ser un modelo de vision, estas herramientas no son aplicables).

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Preentrenamiento | Escalas reconstruidas | Licencia |
|---|---|---|---|---|---|
| SatMAE++ | ViT-L + decoder convolucional multiescala | RGB y Sentinel (10 canales) | FMoW-RGB, FMoW-Sentinel | 1x, 2x, 4x | Apache 2.0 |
| SatMAE (original) | ViT (varias tallas) | RGB y Sentinel | FMoW-RGB, FMoW-Sentinel | 1x | MIT (segun repo) |
| MAE (He et al., 2022) | ViT | RGB | ImageNet | 1x | CC-BY-NC 4.0 (para pesos) |

La diferencia principal de SatMAE++ frente a SatMAE y MAE es su decodificador multiescala y el uso de tokens visibles en el codificador, lo que permite reconstruir a resoluciones nativas superiores. No se dispone de comparativas cuantitativas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado pesos entrenados todavia; la model card indica que los archivos de peso se subiran proximamente, por lo que el modelo no puede usarse directamente para inferencia hasta entonces.
- No se proporcionan metricas de rendimiento, sesgos o evaluaciones de robustez; se recomienda validar en el dominio de interes antes de usar en produccion.
- El modelo esta disenado para teledeteccion; su uso fuera de este ambito (p. ej., imagenes naturales) no esta justificado por el preentrenamiento.
- La configuracion por defecto del repositorio usa datos sinteticos; para datos reales es necesario ajustar la configuracion (canales, tamaño, agrupacion espectral, escalas) y preparar los NPZ con las resoluciones nativas correspondientes.
- La licencia Apache 2.0 permite uso comercial, pero los datos de preentrenamiento (FMoW) pueden tener restricciones adicionales que deben revisarse.
- El modelo no procesa lenguaje; las etiquetas de idioma (en) se refieren a la documentacion, no a capacidades del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/SatMAE-PP
- Repositorio oficial en GitHub: https://github.com/techmn/satmae_pp
- Paper (arXiv): https://arxiv.org/abs/2403.05419
- Modelo SatMAE original en HuggingFace: https://huggingface.co/OneScience-Group/SatMAE
- Documentacion del codigo (DeepWiki): https://deepwiki.com/techmn/satmae_pp
