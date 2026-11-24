# CompVis/StaDy

## Resumen

StaDy es un modelo de transferencia de movimiento (motion transfer) desarrollado por CompVis @ LMU Munich y MCML, presentado en NeurIPS 2026. Su objetivo es descomponer una escena en dos factores independientes: la apariencia estática (qué aspecto tiene la escena) y la dinámica (cómo cambia en el tiempo). Para ello, un codificador de movimiento observa un par de fotogramas y produce una representación latente de movimiento que, combinada con una imagen fuente, permite a un decodificador de flow matching generar el siguiente fotograma preservando la apariencia del receptor.

El modelo se publica con dos checkpoints preentrenados: `openworld` (movimiento en escenas abiertas) y `celebv` (rostros, entrenado sobre CelebV). La representación de movimiento tiene 96 dimensiones por defecto y los checkpoints ocupan 3,37 GB (openworld) y 637 MB (celebv). El repositorio incluye además el código de entrenamiento completo, un dataset procedural de formas en movimiento (círculos, cuadrados, triángulos y elipses de 256 × 256) y utilidades de extracción y transferencia de movimiento vía Torch Hub.

La relevancia del modelo reside en su formulación: un juego de regularización que penaliza que el embedding de movimiento transporte la apariencia del objetivo de forma independiente de la fuente, lo que habilita la transferencia de movimiento entre escenas distintas. Es un modelo de investigación (pesos publicados, sin model card de benchmarks ni licencia declarada en los metadatos de Hugging Face) orientado a image-to-image y animación por transferencia de movimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de movimiento (DINOv2 ViT-L/14 con registers) + decodificador de flow matching; autoencoder TAESD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto); pares de fotogramas cuadrados, dimensiones espaciales divisibles por 16 |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; se menciona autocast bfloat16 opcional en entrenamiento) |
| Idiomas soportados | no disponible (modelo de imagen/vídeo, sin capacidades de texto) |
| Licencia | no disponible en los metadatos; la model card remite a LICENSE en el repositorio |
| Formato de pesos | PyTorch (checkpoints .pt: openworld 3,37 GB, celebv 637 MB) |

## Arquitectura y entrenamiento

StaDy es un modelo de dos etapas. Un codificador de movimiento basado en DINOv2 ViT-L/14 con registers procesa un par de fotogramas y produce un embedding de movimiento de 96 dimensiones (por defecto). Un decodificador de flow matching combina ese embedding con una imagen fuente para generar el siguiente fotograma; el autoencoder TAESD se usa para la codificación/decodificación latente de las imágenes. La innovación central es un juego de regularización que desincentiva que el embedding de movimiento codifique la apariencia del objetivo con independencia de la fuente, lo que permite transferir movimiento entre escenas con apariencias distintas.

El entrenamiento se puede reproducir con el script `train.py`, que por defecto usa un dataset procedural de formas en movimiento: pares de fotogramas RGB de 256 × 256 con círculos, cuadrados, triángulos y elipses que rebotan y rotan sobre fondos muestreados de forma independiente. El batch size por defecto es 1 por GPU (el modelo completo es grande), con soporte de `torchrun` para múltiples GPUs, autocast bfloat16 opcional (`--precision bf16`), reanudación desde checkpoint (`--resume`) y control de `--steps`, `--lr`, `--workers`, `--motion-dim` y `--save-every`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset de los checkpoints preentrenados ni si hubo RLHF/DPO (no aplica en un modelo generativo de imagen de este tipo).

## Capacidades

- Extracción de movimiento: dado un par de fotogramas (`[B, 2, H, W, 3]`, RGB en [-1, 1]), produce un embedding de movimiento (`celebv`: `[B, 1, 64, 8]`; `openworld`: `[B, 1, 2, 768]`).
- Transferencia de movimiento: aplica el movimiento extraído de un par de referencia a una imagen fuente distinta, generando el siguiente fotograma (`transfer(source, motion, steps=50)`).
- Generación de imagen condicionada por movimiento mediante decodificación de flow matching (número de pasos configurable).
- Separación explícita apariencia/dinámica: preserva la apariencia del receptor mientras transfiere la dinámica del donante.
- Entrenamiento reproducible sobre un dataset procedural de formas en movimiento.
- Soporte de inferencia en GPU CUDA vía Torch Hub (`torch.hub.load("CompVis/StaDy", "celebv"|"openworld", ...)`).
- No dispone de capacidades de texto, tool calling, agentes, razonamiento multilingüe ni visión general; es un modelo específico de transferencia de movimiento en imagen.

## Casos de uso

- Animación de retratos: usando el checkpoint `celebv`, transferir la mímica y el movimiento de un vídeo de referencia a una imagen fija de un rostro, útil para avatares y doblaje visual.
- Recreación de movimiento en escenas abiertas: con el checkpoint `openworld`, aplicar la dinámica de un vídeo (por ejemplo, el movimiento de objetos o cámara) a una imagen distinta con otra apariencia.
- Prototipado de efectos visuales: generar el siguiente fotograma de una secuencia a partir de una imagen fuente y un par de referencia, como paso previo a pipelines de VFX.
- Investigación en representaciones desenredadas: usar el modelo y el juego de regularización para estudiar la separación entre apariencia y dinámica en modelos generativos.
- Reproducción de experimentos: entrenar desde cero sobre el dataset procedural de formas en movimiento para validar la formulación con recursos modestos (256 × 256, batch 1 por GPU).
- Docencia y divulgación: el código autocontenido en `model.py` y el ejemplo `example_transfer.py` sirven para ilustrar flow matching y transferencia de movimiento de forma práctica.
- Generación de datos sintéticos de movimiento: el dataset procedural permite generar pares de fotogramas con dinámicas controladas para entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El modelo completo es grande (el propio autor advierte que hay que ajustar el batch size a la memoria de la GPU); el checkpoint `openworld` ocupa 3,37 GB y `celebv` 637 MB en disco, sin contar el codificador DINOv2 ViT-L/14 ni el autoencoder TAESD que se descargan aparte.
- GPU recomendadas: no disponible. El entrenamiento soporta `torchrun` multi-GPU y autocast bfloat16; se asume compatibilidad con GPUs CUDA de gama alta, pero no se especifican modelos concretos.
- ¿Cabe en consumer GPU?: no confirmado. Con 256 × 256 y batch 1 por GPU el autor sugiere que es viable ajustando el batch size, pero no se indica una VRAM mínima.
- Opciones de despliegue: PyTorch nativo vía Torch Hub (`torch.hub.load`) o API directa (`StaDy.from_pretrained`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StaDy (CompVis) | Transferencia de movimiento imagen-a-imagen | no disponible | 256 × 256 (ejemplo), divisible por 16 | no disponible | Pesos en HF + código |
| WhatMoves (CompVis) | Inspiración del layout de release; movimiento | no disponible | no disponible | no disponible | Repositorio GitHub |
| Modelos de image-to-image genéricos (p. ej. difusión) | Generación/edición de imagen | variable | variable | variable | Amplia |

La información disponible no permite una comparación cuantitativa con alternativas de la misma categoría; los datos de parámetros, contexto y rendimiento de los modelos comparables no están publicados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas cuantitativas en la información disponible, por lo que el rendimiento real no está validado de forma pública.
- Licencia no declarada en los metadatos de Hugging Face; la model card remite a `LICENSE` en el repositorio. Antes de uso comercial es imprescindible revisar dicho fichero.
- Modelo de investigación: los checkpoints preentrenados cubren `openworld` y `celebv`; el resto de escenarios requiere entrenamiento propio.
- Restricciones de resolución: los fotogramas deben ser cuadrados y con dimensiones espaciales divisibles por 16 (el ejemplo usa 256 × 256).
- El modelo completo es grande y el entrenamiento por defecto usa batch size 1 por GPU, lo que limita el throughput.
- Riesgo de artefactos y alucinación visual en la generación del siguiente fotograma, especialmente fuera de la distribución de entrenamiento (formas sintéticas, rostros CelebV, escenas abiertas).
- Sesgos potenciales derivados de los datos de entrenamiento (CelebV y datasets de escenas abiertas), no documentados en la información disponible.
- Sin capacidades de texto, tool calling ni agentes; no es un modelo de lenguaje.
- No se especifican requisitos mínimos de VRAM ni latencias, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CompVis/StaDy
- Página del proyecto (próximamente): https://compvis.github.io/StaDy/
- arXiv (próximamente): no disponible
- Repositorio de WhatMoves (inspiración del layout): https://github.com/CompVis/WhatMoves
- DINOv2: https://github.com/facebookresearch/dinov2
- minDinoV2: https://github.com/cloneofsimo/minDinoV2
- TAESD: https://github.com/madebyollin/taesd
- Hugging Face Diffusers: https://github.com/huggingface/diffusers
