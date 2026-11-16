# Hongyang-Du/FuseReg

## Resumen

FuseReg es un conjunto de checkpoints de investigación para generación de imágenes incondicional y condicional por clase sobre ImageNet-256, desarrollado por Hongyang-Du. El trabajo aborda un problema concreto de los autoencoders de representación (RAE, *representation autoencoder*): la brecha entre la calidad de reconstrucción y la calidad de generación cuando se combinan capas del encoder mediante fusión heurística. FuseReg sustituye esa fusión heurística por un entrenamiento sobre subconjuntos aleatorios de capas del encoder, de modo que un único decodificador de píxeles reconstruye de forma fiable bajo cualquier fusión de subconjuntos y se acopla mejor al generador de difusión.

El repositorio publica 16 checkpoints de inferencia: ocho decodificadores DINOv3 ViT-L con k=23 capas de entrada, dos decodificadores DINOv3 ViT-L entrenados con k=7 capas y seis generadores DiT-XL. El encoder subyacente es DINOv3 ViT-L y el dataset de entrenamiento es ILSVRC/imagenet-1k a 256x256. Los pesos se distribuyen en formato `safetensors` y contienen únicamente pesos EMA.

La relevancia del modelo es metodológica más que de producto: propone un esquema de regularización (drop de capas del encoder durante el entrenamiento del decodificador) que mejora la reconstrucción bajo fusiones de pocas capas y reduce la brecha con el generador de difusión, con resultados reportados en el paper arXiv:2609.31620. No es un modelo de lenguaje ni un modelo multimodal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAE (representation autoencoder): encoder DINOv3 ViT-L + decodificador ViT de píxeles; generador DiT-XL de difusión |
| Parametros totales | Decodificador de píxeles: 415,6 M; generador DiT-XL: 875,3 M (encoder DINOv3 ViT-L no incluido en los checkpoints) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible (solo se publican pesos EMA en safetensors, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (solo pesos EMA; sin optimizador, discriminador ni pesos del encoder) |

## Arquitectura y entrenamiento

El pipeline consta de tres piezas. Primero, un encoder DINOv3 ViT-L que produce representaciones latentes; los decodificadores publicados consumen las capas 1-23 (k=23) o el subconjunto `[11, 13, 15, 17, 19, 21, 23]` (k=7). Segundo, un decodificador de píxeles tipo ViT con tamaño oculto 1152 y 415,6 M de parámetros, entrenado durante 16 épocas sobre ImageNet-256 con pérdidas de píxel, LPIPS y adversaria, aplicando un *layer-drop* aleatorio con probabilidad `p` sobre las capas del encoder. Tercero, un generador DiT-XL condicional por clase con tamaño oculto 1440 y 875,3 M de parámetros, que genera en el espacio latente k=23 de DINOv3-L.

La innovación central es la regularización por fusión aleatoria de capas: en lugar de fijar heurísticamente qué capas del encoder se combinan, el decodificador se entrena viendo subconjuntos aleatorios, lo que lo hace robusto a distintas fusiones en inferencia y mejora su compatibilidad con el generador de difusión. El generador DiT-XL se entrena con distintos valores de `p_dit` (0,0, 0,3, 0,5, 0,7, 0,9) y a 40 u 80 épocas. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de ILSVRC/imagenet-1k; tampoco se documenta el uso de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Generación de imágenes incondicional y condicional por clase sobre ImageNet-256 mediante el generador DiT-XL.
- Reconstrucción de imágenes a partir de representaciones latentes de DINOv3 ViT-L con el decodificador de píxeles.
- Robustez a fusión de subconjuntos de capas del encoder: un mismo decodificador funciona con k=7, k=23 o una capa única (l11) en inferencia.
- Control explícito del compromiso reconstrucción-generación mediante el parámetro `p` del decodificador y `p_dit` del generador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo *thinking*, visión general, audio ni entrada de texto.

## Casos de uso

- Investigación en autoencoders de representación: reproducir la línea base RAEv2 (`p0.00`) y comparar con las variantes regularizadas para estudiar la brecha reconstrucción-generación con un protocolo controlado.
- Evaluación de decodificadores bajo fusiones de capas: usar los checkpoints `p0.05` a `p0.95` para medir PSNR, SSIM y rFID con alimentaciones k=7, k=23 y l11 sin reentrenar.
- Generación condicional por clase en ImageNet-256: desplegar los DiT-XL con `p_dit` de 0,5 a 0,9 para obtener gFID reportados de 2,39-2,45 sin guiado y 1,58-1,59 con guiado 1,78.
- Estudio del efecto del *layer drop* en el decodificador: comparar los decodificadores entrenados con k=7 frente a alimentar con ese mismo subconjunto un decodificador entrenado con k=23.
- Base para experimentos de destilación o adaptación a otros encoders: el repositorio reserva las carpetas `eupe-vitb/` y `siglip/` (sin checkpoints publicados) como extensión del método.
- Verificación de integridad y procedencia de checkpoints: el manifiesto `checkpoint-manifest.json` registra tamaño, SHA-256, estado EMA seleccionado y alcance de validación, útil en pipelines de auditoría de modelos.

## Benchmarks y rendimiento

Resultados reportados en el paper (no reproducidos de forma independiente durante el empaquetado de checkpoints). Reconstrucción sobre ImageNet val (50k) con decodificadores DINOv3-L k=23:

| Fichero | p | k=7 PSNR / SSIM / rFID | k=23 PSNR / SSIM / rFID | l11 PSNR / SSIM / rFID |
|---|---|---|---|---|
| `p0.00` (RAEv2) | 0 | 12,54 / 0,372 / 16,108 | 27,10 / 0,808 / 0,189 | 15,81 / 0,503 / 3,392 |
| `p0.05` | 0,05 | 19,78 / 0,518 / 2,826 | 28,59 / 0,853 / 0,273 | 20,76 / 0,557 / 1,881 |
| `p0.10` | 0,10 | 20,52 / 0,550 / 1,718 | 28,58 / 0,852 / 0,285 | 21,33 / 0,586 / 1,209 |
| `p0.30` | 0,30 | 22,05 / 0,612 / 0,762 | 28,48 / 0,849 / 0,294 | 22,90 / 0,657 / 0,576 |
| `p0.50` | 0,50 | 22,93 / 0,646 / 0,655 | 28,43 / 0,848 / 0,294 | 23,98 / 0,695 / 0,522 |
| `p0.70` | 0,70 | 23,47 / 0,665 / 0,634 | 28,20 / 0,842 / 0,322 | 24,58 / 0,714 / 0,493 |
| `p0.90` | 0,90 | 23,62 / 0,671 / 0,610 | 27,60 / 0,827 / 0,415 | 24,82 / 0,722 / 0,458 |
| `p0.95` (recomendado) | 0,95 | 23,77 / 0,678 / 0,604 | 27,52 / 0,826 / 0,421 | 25,13 / 0,735 / 0,455 |

Generación con DiT-XL sobre latente k=23 de DINOv3-L, decodificador `p0.95`:

| Generador | p_dit | Épocas | gFID (sin guiado / guiado 1,78) |
|---|---|---|---|
| `raev2_pdit0.0_ep040` | 0,0 | 40 | no disponible en la tabla del paper |
| `raev2_pdit0.0_ep080` | 0,0 | 80 | no disponible en la tabla del paper |
| `fusereg_pdit0.3_ep040` | 0,3 | 40 | no incluido en la rejilla del paper |
| `fusereg_pdit0.5_ep040` | 0,5 | 40 | 2,45 / 1,59 |
| `fusereg_pdit0.7_ep040` | 0,7 | 40 | 2,42 / 1,58 |
| `fusereg_pdit0.9_ep040` | 0,9 | 40 | 2,39 / no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el decodificador de 415,6 M y el DiT-XL de 875,3 M en fp32 ocupan aproximadamente 1,7 GB y 3,5 GB respectivamente; a ello hay que sumar el encoder DINOv3 ViT-L y las activaciones, por lo que se recomienda al menos 16-24 GB de VRAM para el pipeline completo en precisión nativa.
- GPU recomendadas: A100 o H100 para evaluación completa sobre las 50k imágenes de ImageNet val; RTX 4090 (24 GB) viable para inferencia y pruebas por lotes.
- Cabe en GPU de consumo: sí, en RTX 4090 y tarjetas de 24 GB o superiores para inferencia; en 12-16 GB requiere reducir el tamaño de lote o usar precisión mixta.
- Opciones de despliegue: PyTorch nativo (única librería declarada); no se publican variantes GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El repositorio totaliza 41,1 GB, lo que condiciona el tiempo de descarga y la carga en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FuseReg (este) | 415,6 M (decodificador) + 875,3 M (DiT-XL) | Imagen 256x256, latente k=23 o k=7 | PSNR 27,52 / rFID 0,421 (k=23, p0.95); gFID 2,39-2,45 sin guiado | MIT | Hugging Face, 16 checkpoints |
| RAEv2 (línea base reproducida) | 415,6 M (decodificador) | Imagen 256x256, latente k=23 | PSNR 27,10 / rFID 0,189 (k=23); PSNR 12,54 bajo k=7 | no disponible en la información | Checkpoint `p0.00` incluido en este repositorio |
| DiT-XL/2 (referencia de difusión) | 675 M (aproximado, no confirmado en la información) | Imagen 256x256 | no disponible en la información | no disponible en la información | no disponible en la información |

No se dispone de datos suficientes en la información proporcionada para comparar con otros RAE o generadores de ImageNet-256 más allá de la línea base RAEv2 incluida en el propio repositorio.

## Limitaciones y advertencias

- Modelo de investigación: los resultados son reportados en el paper y no han sido reproducidos de forma independiente durante el empaquetado; la verificación de integridad no valida PSNR, SSIM, rFID ni gFID.
- Reproducir métricas exige el split exacto de evaluación de ImageNet, los checkpoints del encoder, el preprocesado y las estadísticas latentes originales.
- Los checkpoints contienen solo pesos EMA; no incluyen encoder, optimizador ni discriminador, por lo que no permiten reanudar el entrenamiento.
- Algunos ficheros antiguos no registran las capas de fusión en los metadatos; es obligatorio usar la configuración de evaluación y el manifiesto para saber qué capas alimentar.
- Cobertura incompleta: no se publican las variantes k=7 con `p=0,3`, ni los cuatro checkpoints EUPE ni los cuatro SigLIP; las carpetas `eupe-vitb/` y `siglip/` están vacías.
- Dominio restringido a ImageNet-256 condicional por clase; no es un modelo de propósito general ni admite entrada de texto o conversación.
- Riesgo de sesgos heredados del dataset ImageNet-1k en las clases generadas; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación visual: las muestras generadas pueden ser plausibles pero no fieles a la distribución real, especialmente con guiado bajo.
- Licencia MIT permite uso comercial, pero la ausencia de validación independiente de métricas desaconseja su uso en producción sin evaluación propia.
- El tamaño del repositorio (41,1 GB) y la dependencia del encoder DINOv3 ViT-L externo complican el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Hongyang-Du/FuseReg
- Paper (arXiv): https://arxiv.org/abs/2609.31620
- Página del proyecto: https://hongyang-du.github.io/FuseReg/
- Código: https://github.com/Hongyang-Du/FuseReg
- Manifiesto de checkpoints: https://huggingface.co/Hongyang-Du/FuseReg/blob/main/checkpoint-manifest.json
- Dataset: https://huggingface.co/datasets/ILSVRC/imagenet-1k
