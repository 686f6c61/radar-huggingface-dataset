# shahzeen/spectra_checkpoints

## Resumen

SPECTRA checkpoints es una colección de seis puntos de control (checkpoints) de modelos de emparejamiento de imágenes (image matching) ajustados específicamente para el dominio cross-spectral RGB-SWIR. El repositorio lo publica el usuario shahzeen bajo licencia Apache 2.0 y no introduce arquitecturas nuevas: cada checkpoint reutiliza el código original de su modelo base (LoMa-B, MASt3R ViT-L, MINIMA-RoMa y RoMa outdoor) y solo modifica los pesos mediante fine-tuning sobre el dataset RASMD, un conjunto de conducción que empareja imágenes en el espectro visible (RGB) con infrarrojo de onda corta (SWIR).

El problema que aborda es el fallo de los matchers clásicos cuando las dos imágenes de un par proceden de sensores con respuestas espectrales distintas: la apariencia cambia radicalmente y los descriptores aprendidos en datasets RGB (MegaDepth, ScanNet) dejan de ser invariantes. Al ajustar sobre RASMD, los checkpoints mejoran la correspondencia de puntos entre RGB y SWIR manteniendo la interfaz de inferencia original.

Es relevante para investigación aplicada en visión por computador multiespectral (conducción nocturna, inspección industrial, robótica con cámaras SWIR) y como referencia reproducible de fine-tuning sobre datasets pequeños. El repo ocupa 8,9 GB y no incluye pipeline declarado ni métricas publicadas en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ViT-L en MASt3R; arquitecturas densas de matching en LoMa, RoMa y MINIMA-RoMa); sin cambios respecto al modelo base |
| Parametros totales | no disponible (depende del checkpoint; MASt3R ViT-L ~ 300 M, resto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 en los checkpoints principales; `mast3r_fast` en fp16 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (`avg_weights.pth`, `checkpoint-best.pth`, `checkpoint-best_fast.pth`, `train_roma_rsmd_latest.pth`) |

## Arquitectura y entrenamiento

Cada checkpoint conserva la arquitectura de su modelo base. MASt3R emplea un backbone ViT-L con cabezas de matching denso y estimación de profundidad; LoMa-B, RoMa y MINIMA-RoMa son matchers densos basados en transformers con cabezas de correspondencia. El fine-tuning se realiza sobre RASMD, un dataset de conducción cross-spectral RGB-SWIR construido para este propósito. En los checkpoints `roma_mix` y `minima_roma` se aplica además *MegaDepth replay*, es decir, se mezclan muestras de MegaDepth durante el ajuste para mitigar el olvido catastrófico del dominio RGB original.

El repositorio no documenta número de tokens, composición exacta del dataset, hiperparámetros de entrenamiento, ni si se usó RLHF/DPO (no aplica en visión). La innovación técnica destacable es la publicación de un checkpoint fp16 (`mast3r_fast`) con los mismos pesos que `mast3r`, orientado a reducir latencia de inferencia sin reducir el tamaño del modelo.

## Capacidades

- Emparejamiento denso de imágenes entre pares RGB-SWIR (cross-spectral image matching).
- Correspondencia de puntos clave y estimación de flujo denso entre imágenes de distinto espectro.
- Reutilización del código original de cada modelo base para carga e inferencia.
- Soporte de variantes con y sin *MegaDepth replay* para preservar rendimiento en RGB.
- Checkpoint fp16 para inferencia de baja latencia.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Conducción nocturna y asistencia al conductor: emparejar fotogramas RGB con SWIR para estimar movimiento y profundidad en condiciones de baja iluminación, donde los matchers RGB fallan.
- Fusión de sensores en robótica: alinear cámaras visibles e infrarrojas de un mismo robot para calibración y odometría visual multiespectral.
- Inspección industrial: correspondencia entre imágenes visibles y SWIR para detectar defectos térmicos o de humedad en superficies.
- Vigilancia perimetral: registro de pares RGB-SWIR para seguimiento de objetos entre cámaras de distinto espectro.
- Investigación en visión multiespectral: base reproducible para comparar LoMa, MASt3R, RoMa y MINIMA-RoMa bajo el mismo protocolo de fine-tuning.
- Reconstrucción 3D y SLAM multiespectral: usar MASt3R ajustado para estimar correspondencias y profundidad en escenas con iluminación mixta.
- Evaluación de robustez de matchers: comparar checkpoints con y sin *MegaDepth replay* para estudiar olvido catastrófico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño de pesos, MASt3R ViT-L en fp32 (~2,57 GB) requiere al menos 6-8 GB de VRAM en inferencia con resolución moderada; `mast3r_fast` en fp16 (~1,30 GB) reduce el requisito aproximadamente a la mitad.
- Los checkpoints LoMa, RoMa y MINIMA-RoMa (~0,71-1,24 GB) caben en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090.
- MASt3R ViT-L se recomienda en A100, H100 o RTX 4090 para lotes grandes y alta resolución.
- Opciones de despliegue: carga directa con PyTorch y el código original de cada modelo base (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento cross-spectral | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPECTRA (MASt3R ajustado) | ViT-L (~300 M) | no aplica | ajustado sobre RASMD | Apache 2.0 | Hugging Face |
| MASt3R original | ViT-L (~300 M) | no aplica | no entrenado en SWIR | no disponible | Hugging Face |
| RoMa original | no disponible | no aplica | no entrenado en SWIR | no disponible | Hugging Face |
| LoMa-B original | no disponible | no aplica | no entrenado en SWIR | no disponible | Hugging Face |

No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas de rendimiento ni validación publicada; el rendimiento real en cross-spectral no está cuantificado.
- El fine-tuning se limita a RASMD, un dataset de conducción; puede generalizar mal a otros dominios SWIR (industrial, médico, aéreo).
- Riesgo de olvido catastrófico en RGB puro en los checkpoints sin *MegaDepth replay* (`roma`, `mast3r`, `loma`).
- Cada checkpoint requiere su código base original; no hay pipeline unificado ni API estandarizada.
- No se documentan sesgos; al ser un modelo visual, puede heredar sesgos de los datasets de entrenamiento (escenas de conducción, condiciones de iluminación concretas).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los modelos base y del dataset RASMD.
- `mast3r_fast` no es un modelo más pequeño: mismos pesos en fp16, con la pérdida de precisión asociada.
- Repositorio con 0 descargas y 0 likes: sin validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/shahzeen/spectra_checkpoints
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
