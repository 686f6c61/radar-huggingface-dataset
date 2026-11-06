# anbinh39/MAVT_V2

## Resumen

MAVT v2 es un tokenizador de imágenes y vídeo de investigación desarrollado por anbinh39, asociado al repositorio Computer-Vision-Lab-LinhDang/Antokenizer (rama `feat/grain-splat-decoder`). Se trata de un autoencoder con un decoder basado en Gaussian splatting que comprime una imagen de 256×256 píxeles en un estado continuo de 11.300 números, apoyándose en un codificador DINOv3 ViT-L/16 congelado. No es un modelo generativo de lenguaje ni un modelo multimodal conversacional: su función es la tokenización y reconstrucción de imágenes y vídeo, una pieza habitual en pipelines de generación visual y compresión neuronal.

El modelo resuelve el problema de representar una imagen con una tasa de compresión muy alta manteniendo calidad de reconstrucción. Su estado latente se descompone en geometría de grano (1.024 números), contenido local (8.192), memoria gruesa (2.048) y una cabecera de 36 escalares, sumando 11.300 frente al techo de comparación de 12.288 de AToken. La decodificación proyecta granos con profundidad sobre una rejilla de consulta de 64×64 y aplica una cabeza RGB puntual.

Es relevante ahora porque explora una vía alternativa a los tokenizadores VQ/ViT convencionales, con ablaciones cuantitativas sobre la capacidad del estado latente y una extensión a vídeo mediante registros por fotograma. No obstante, es un checkpoint de investigación en curso, no una versión publicada, y sus resultados quedan por debajo de la referencia AToken-So/c en todas las métricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con encoder DINOv3 ViT-L/16 congelado y decoder context transformer con Gaussian splatting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (tokenizador de imagen/vídeo; entrada 256×256) |
| Tipos de cuantizacion | no disponible (checkpoints en `torch .pt`; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch `.pt` (checkpoints `.pt` con estado EMA y estado completo de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura parte de un ViT-L/16 de DINOv3 congelado que codifica la imagen de 256×256 en un estado latente estructurado. El estado se compone de cuatro partes: geometría de grano de forma 16×16×4 (posición en la celda, profundidad inversa logarítmica y radio), contenido de grano de 16×16×32 (`d_f = 32`), memoria gruesa `c_0` de 4×4×128 que captura disposición, color y semántica de regiones de 64 px, y una cabecera de 36 escalares globales. El decoder (`rgb_decoder=splat`) es un context transformer sesgado por geometría sobre los granos y slots gruesos, con átomos de frecuencia por grano, una proyección Gaussian splat consciente de profundidad sobre una rejilla de consulta de 64×64 y una cabeza RGB puntual con imagen de arranque gruesa. Para vídeo se añaden registros por fotograma (cámara, movimiento y slots de innovación) sobre el estado ancla.

El entrenamiento de `bs_step38113` se realizó solo con imágenes de ImageNet-1k train, en 4 GPUs, batch 256, optimizadores Muon/AdamW, learning rate 2e-4, warmup de 1.000 pasos y schedule WSD con decaimiento en los últimos 4.000 de 40.000 pasos (detenido en 38.113, a mitad de decaimiento), durante unas 11 horas. La pérdida combina L1, 0.1 de LPIPS y pérdida de características de DINOv3, más términos de inicialización y código. La etapa 2 incorpora clips de OpenVid y SSv2 (batch de 128 imágenes y 32 clips). Los pesos de DINOv3 no se distribuyen por licencia restringida; el loader omite las claves `stems.dino.model.*` y requiere aportar una copia propia.

## Capacidades

- Tokenización y reconstrucción de imágenes de 256×256 con un estado latente continuo de 11.300 números.
- Tokenización y reconstrucción de vídeo mediante registros por fotograma sobre el estado ancla de imagen.
- Codificación visual basada en características de DINOv3 ViT-L/16 congelado.
- Decodificación con Gaussian splatting consciente de profundidad y rejilla de consulta de 64×64.
- Variantes de capacidad ampliada: ablaciones con `d_f = 48` (15.396 números) y `d_f = 64` (19.492 números).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No se documentan capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Compresión neuronal de imágenes: el modelo codifica una imagen de 256×256 en 11.300 números, útil para estudiar tasas de compresión extremas en pipelines de almacenamiento o transmisión de baja tasa.
- Investigación en tokenizadores visuales: sirve como base para comparar representaciones geométricas (granos con profundidad) frente a latentes densos tipo AToken en experimentos controlados.
- Preprocesado para modelos generativos visuales: el estado latente estructurado puede alimentar decoders o modelos de difusión que operen sobre representaciones compactas.
- Reconstrucción y supervisión de calidad: las métricas PSNR, SSIM, LPIPS y rFID permiten evaluar la fidelidad de la reconstrucción en tareas de restauración o análisis.
- Estudio de representación de vídeo: la etapa 2 añade clips de OpenVid y SSv2, permitiendo analizar cómo la información temporal afecta a la reconstrucción de imagen.
- Ablaciones de capacidad latente: los checkpoints `df48_ema` y `df64_ema` permiten estudiar la relación entre número de dimensiones del estado y calidad de reconstrucción (aproximadamente +1 dB de PSNR por duplicación de `d_f`).
- Docencia y reproducción de experimentos: el recetario de entrenamiento y los checkpoints intermedios permiten reproducir y extender el trabajo en entornos académicos.

## Benchmarks y rendimiento

Resultados en ImageNet val, primeras 1.000 imágenes, 256², recorte central:

| Modelo | Números | PSNR ↑ | SSIM ↑ | LPIPS ↓ | rFID ↓ |
|---|---|---|---|---|---|
| `bs_step38113_ema` | 11.300 | 27.76 | 0.790 | 0.130 | 17.6 |
| `bs_step38113` (raw) | 11.300 | 27.69 | 0.788 | 0.131 | 17.1 |
| `s2` step 3.500 (EMA, imagen tras añadir vídeo) | 11.300 | 27.58 | 0.784 | 0.136 | 18.0 |
| `df48_ema` | 15.396 | 28.16 | 0.804 | 0.121 | 16.3 |
| `df64_ema` | 19.492 | 28.43 | 0.813 | 0.114 | 15.5 |
| Referencia: AToken-So/c (paper) | 12.288 | 29.72 | 0.848 | 0.085 | 0.21 |

El propio autor advierte que el rFID sobre 1.000 imágenes tiene alta varianza y no es comparable con rFID calculado sobre 50.000 imágenes; solo debe compararse entre filas de esta tabla.

Ablaciones a 3.000 pasos desde `bs_step38113` (lr 1e-4, mismo protocolo, PSNR con EMA):

| Sonda | PSNR | Δ frente al control |
|---|---|---|
| Control | 27.74 | — |
| Más átomos de frecuencia por grano (6 → 12 / 24) | 27.67 / 27.65 | 0 |
| Átomos evaluados en los píxeles (sin aliasing de rejilla 64) | 27.74 | 0 |
| ResBlocks de píxel a 128 / 256 | 27.75 | +0.01 |
| Contexto ConvNeXt a 64 | 27.77 | +0.03 |
| Open Images 50/50 durante 5.000 pasos | 27.72 | 0 |
| `d_f` 35 / 48 / 64 | 27.83 / 28.16 / 28.43 | +0.09 / +0.42 / +0.69 |

Ablaciones de canal en el paso 20k: sustituir `c_0` por su media da 15.0 dB; barajar `f` entre celdas da 13.3 dB; `f` usa las 32 dimensiones (la primera componente principal concentra el 16 % de la varianza) y el 94 % de la energía de error restante está por encima de 1/8 ciclo/px.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de imagen más grande ocupa parte de los 7,3 GB del repositorio, y el encoder DINOv3 ViT-L/16 debe aportarse aparte.
- GPU recomendadas: el entrenamiento se realizó en 4 GPUs con batch 256; para inferencia se requiere una GPU con memoria suficiente para DINOv3 ViT-L/16 más el decoder, sin cifra publicada.
- Cabe en GPU de consumo: no confirmado; la viabilidad en RTX 4090 u otras consumer depende del peso del encoder DINOv3 y no se documenta.
- Opciones de despliegue: carga mediante `mavt.grain_prior.load_grain_prior` con `dino_repo` apuntando a una copia local o a `facebook/dinov3-vitl16-pretrain-lvd1689m`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Números | PSNR | SSIM | LPIPS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MAVT v2 `bs_step38113_ema` | 11.300 | 27.76 | 0.790 | 0.130 | other | Checkpoint de investigación en Hugging Face |
| MAVT v2 `df64_ema` | 19.492 | 28.43 | 0.813 | 0.114 | other | Checkpoint de ablación en Hugging Face |
| AToken-So/c (referencia del paper) | 12.288 | 29.72 | 0.848 | 0.085 | no disponible | Referencia bibliográfica, no incluida en el repo |

No se dispone de información sobre otros tokenizadores comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un trabajo en curso, no una versión publicada; los checkpoints son de investigación y pueden cambiar sin aviso.
- Los pesos de DINOv3 no se incluyen por licencia restringida; es necesario obtener una copia propia y el loader omite las claves correspondientes.
- La licencia es "other", sin términos comerciales explícitos; debe revisarse antes de cualquier uso en producción.
- El rendimiento queda por debajo de AToken-So/c en PSNR (27.76 frente a 29.72), SSIM, LPIPS y rFID.
- El rFID reportado se calcula sobre 1.000 imágenes, con alta varianza, y no es comparable con métricas sobre 50.000 imágenes.
- El error residual se concentra en texturas de alta frecuencia (pelo, follaje, texto pequeño); las pérdidas perceptuales previstas (`w_edge`, `feat_sg_f`) existen en el código pero no se han entrenado.
- Añadir vídeo (etapa 2) cuesta aproximadamente 0.2 dB en imágenes al inicio del entrenamiento.
- El decoder no es el cuello de botella: añadir capacidad a nivel de píxel no mejora las métricas, lo que limita las vías de mejora por esa dirección.
- No hay datos publicados sobre sesgos, alucinación o comportamiento multilingüe, al no ser un modelo de lenguaje.
- No se documentan requisitos de hardware, latencia ni opciones de cuantización para despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/anbinh39/MAVT_V2
- Repositorio del proyecto: https://github.com/Computer-Vision-Lab-LinhDang/Antokenizer
- Rama del decoder: `feat/grain-splat-decoder` (commit `a5ab394`)
- Documentación de flags: `src/mavt/grain_prior/README.md` dentro del repositorio
- Pesos DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
