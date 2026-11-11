# ML2/CLEAR

## Resumen

CLEAR (Color-Texture Latent Alignment) es un modelo de eliminación de reflejos en imágenes individuales (*single image reflection removal*, SIRR) desarrollado por KC Machine Learning Lab (ML2). Resuelve el problema de separar la imagen transmitida (la escena real detrás del cristal) de los reflejos superpuestos cuando se fotografía a través de una superficie reflectante, una tarea clásicamente mal condicionada porque la información de ambas capas se mezcla en los píxeles observados.

A diferencia de los enfoques basados en difusión iterativa, CLEAR es un framework latente determinista de un solo paso temporal: un separador de doble rama guiado por física predice los latentes de transmisión, reflexión y residuo en un único forward pass, y un decodificador cross-latent con el módulo HFAM (*Hybrid Feature Alignment Module*) realinea las características skip de la entrada con la transmisión limpia antes de decodificar. No hay schedule de ruido ni muestreo iterativo, lo que reduce drásticamente el coste de inferencia frente a pipelines de difusión convencionales.

El modelo se inicializa a partir de `stabilityai/stable-diffusion-2` y `prs-eth/marigold-depth-v1-0`, y se publica como pesos PyTorch (repo de 0,4 GB) bajo licencia OpenRAIL++. Está asociado a una publicación en WACV 2027 y reporta métricas sobre seis benchmarks reales de SIRR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework latente de difusión determinista de un solo paso; separador de doble rama (transmisión + reflexión) sobre UNet de Stable Diffusion 2, decodificador cross-latent con HFAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; la tarea es de imagen) |
| Licencia | openrail++ (CreativeML Open RAIL++-M, heredada de Stable Diffusion 2) |
| Formato de pesos | PyTorch (`diffusion_pytorch_model.bin` para unet1 y unet2; `cld_clear.pth` para el decodificador HFAM) |

## Arquitectura y entrenamiento

CLEAR se estructura en dos etapas. La etapa 1 parte de los backbones de Stable Diffusion 2 y Marigold y entrena un separador de doble rama guiado por física que predice tres latentes: transmisión (la escena limpia), reflexión y residuo. La etapa 2 entrena el decodificador cross-latent (`cld_clear.pth`, con `refiner_type: hfam`) que realinea las características skip de la entrada con el latente de transmisión antes de reconstruir la imagen final. El checkpoint publicado corresponde al entrenamiento de etapa 2 con un total de 212 horas de cómputo registradas en los metadatos.

La innovación principal es la eliminación del proceso de difusión iterativo: no existe schedule de ruido ni muestreo multi-paso, sino una predicción latente determinista en un solo forward pass. El módulo HFAM se encarga de corregir la discrepancia entre las features de la imagen de entrada (que contienen reflejos) y el latente de transmisión limpio, evitando que los artefactos de reflexión se filtren en la reconstrucción. El VAE y el text encoder no se duplican en el repo: se cargan desde el backbone SDv2 mediante `scripts/download_models.py`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset de entrenamiento ni si se emplearon RLHF/DPO (no aplicable en tareas de restauración de imagen).

## Capacidades

- Eliminación de reflejos en una única imagen (SIRR): produce la imagen transmitida sin reflejos, la reflexión predicha y el residuo como salidas separadas.
- Restauración de imagen guiada por física: separa las capas de transmisión y reflexión en el espacio latente.
- Inferencia determinista de un solo paso: sin muestreo iterativo ni schedule de ruido.
- Procesamiento por lotes de carpetas de imágenes mediante `scripts/inference.sh`.
- Salidas múltiples por imagen: `<name>_clear.png` (sin reflejos), `<name>_r.png` (reflexión), `<name>_g1.png` (residuo).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües: no aplica; la tarea es puramente visual.

## Casos de uso

- Fotografía a través de cristales: limpiar imágenes tomadas a través de ventanas, escaparates o vitrinas para recuperar la escena interior sin los reflejos del entorno.
- Fotografía de producto y e-commerce: eliminar reflejos de vitrinas y superficies acristaladas en catálogos, donde la separación limpia de la transmisión mejora la fidelidad del color y la textura.
- Documentación y patrimonio: digitalizar obras o documentos protegidos por cristal (marcos, urnas) eliminando los reflejos del fotógrafo o de la iluminación.
- Preprocesado para visión por computador: limpiar imágenes de entrada antes de pipelines de detección, segmentación u OCR, reduciendo falsos positivos causados por reflejos.
- Automoción y vigilancia: mejorar imágenes de cámaras tras parabrisas o cristales de cabinas, donde los reflejos degradan la visibilidad.
- Restauración fotográfica: recuperar fotografías antiguas o escaneadas con reflejos de flash sobre superficies brillantes, aprovechando la salida de residuo para auditar la separación.
- Investigación en restauración de imagen: servir como baseline determinista y de un solo paso frente a métodos de difusión iterativos en experimentos de SIRR.

## Benchmarks y rendimiento

Resultados medios sobre seis benchmarks reales (Nature, SIR2, Real20, DRR-C, DRR-S, OpenRR-1k; 1.040 imágenes), según el paper:

| Metodo | PSNR ↑ | SSIM ↑ | LPIPS ↓ | MANIQA ↑ | QUALICLIP ↑ |
|---|---|---|---|---|---|
| DAI | 25.98 | 0.869 | 0.159 | 0.460 | 0.696 |
| WindowSeat | 25.48 | 0.810 | 0.208 | 0.465 | 0.674 |
| CLEAR (Ours) | 26.59 | 0.906 | 0.106 | 0.504 | 0.731 |

CLEAR supera a DAI y WindowSeat en las cinco métricas. Las tablas por dataset y las ablaciones se remiten al paper (no incluidas en la información disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al inicializarse sobre Stable Diffusion 2 (UNet doble más decodificador), se requiere una GPU con memoria suficiente para cargar los backbones SDv2 y Marigold además de los checkpoints de CLEAR (repo de 0,4 GB solo para los pesos del modelo).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de los backbones SDv2 se recomienda una GPU de datacenter (A100, H100) o una consumer de gama alta (RTX 4090) para ejecución cómoda.
- ¿Cabe en consumer GPU?: no confirmado; depende de la VRAM necesaria para el pipeline completo (SDv2 + Marigold + checkpoints CLEAR), dato no publicado.
- Opciones de despliegue: scripts oficiales del repositorio (`scripts/inference.sh`), PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; la ventaja arquitectónica es la inferencia de un solo paso frente a métodos de difusión iterativos.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | PSNR ↑ | SSIM ↑ | LPIPS ↓ | Licencia |
|---|---|---|---|---|---|---|
| CLEAR | SIRR determinista de un paso | Latente dual-rama + HFAM | 26.59 | 0.906 | 0.106 | OpenRAIL++ |
| DAI | SIRR | no disponible | 25.98 | 0.869 | 0.159 | no disponible |
| WindowSeat | SIRR | no disponible | 25.48 | 0.810 | 0.208 | no disponible |

Los datos de DAI y WindowSeat proceden de la tabla comparativa del propio paper de CLEAR; no se dispone de información adicional sobre su arquitectura, parámetros o disponibilidad en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre benchmarks de reflejos reales, puede generalizar peor en escenas con tipos de reflexión no representados.
- Riesgo de alucinación: como modelo generativo latente, puede reconstruir texturas o colores plausibles pero no fieles en regiones con reflejos severos o información ambigua.
- Limitaciones de contexto o idioma: la etiqueta de idioma es `en`; la tarea es de imagen, pero no se documenta el rendimiento en otros dominios visuales.
- Restricciones de licencia: los pesos se distribuyen bajo CreativeML Open RAIL++-M (heredada de Stable Diffusion 2); aplican sus restricciones de uso, incluida la prohibición de usos dañinos enumerados en la licencia. El código es Apache-2.0.
- Caveat de producción: `config.yaml` del repo apunta al workspace original de los autores (`base_config: ../config/default.yaml`); para inferencia debe usarse `configs/stage1_clear.yaml` del repositorio de código.
- Dependencia de backbones externos: requiere descargar SDv2 y Marigold (`scripts/download_models.py`); el VAE y el text encoder no están incluidos en el repo.
- Repo con 0 descargas y 0 likes en el momento de la consulta: madurez de ecosistema y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ML2/CLEAR
- Código: https://github.com/kc-ml2/clear
- Paper / OpenReview: https://openreview.net/forum?id=QMmOrvegf1
- Backbone SDv2: https://huggingface.co/stabilityai/stable-diffusion-2
- Backbone Marigold: https://huggingface.co/prs-eth/marigold-depth-v1-0
- Licencia OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL
