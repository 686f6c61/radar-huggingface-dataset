# Endoluminal-Surg-Vision-IMR/Airway-Tree-Modeling-26-baselines

## Resumen

Este repositorio publica los pesos base oficiales del reto **Airway Tree Modeling 2026 (ATM'26)**, orientado al modelado del árbol bronquial en cirugía endobronquial. No se trata de un modelo de lenguaje generativo, sino de un conjunto de checkpoints de visión médica desarrollados por el grupo Endoluminal-Surg-Vision-IMR para tres tareas específicas sobre tomografía computarizada (TC) de pulmón y vídeo de broncoscopia.

El paquete incluye tres pistas independientes: segmentación binaria de la vía aérea en TC (Track 1), etiquetado anatómico por ramas con 20 clases de foreground más fondo (Track 2), y reconocimiento de puntos de referencia anatómicos por fotograma en broncoscopia con 32 clases (Track 3). Las dos primeras emplean nnUNet v2 con cinco folds, mientras que la tercera usa un backbone CLIP ViT-B/16 con una cabeza MLP.

Su relevancia es doble: por un lado, proporciona una línea base reproducible y con licencia MIT para participantes del reto; por otro, documenta un pipeline completo (pesos, configuración, planes de red y transformaciones de preprocesado) que sirve como referencia para quien aborde segmentación y clasificación anatómica endoluminal en producción clínica o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Track 1 y Track 2: nnUNet v2 (U-Net 3D, `3d_fullres`, 128x160x112, CTNormalization). Track 3: CLIP ViT-B/16 + cabeza MLP |
| Parametros totales | Track 1: no disponible (checkpoints de 244 MB por fold). Track 2: no disponible (checkpoints de 244 MB por fold). Track 3: 150 M parametros (404 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precision de entrenamiento, `.pth` / `.pt`) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; las etiquetas son anatómicas) |
| Licencia | MIT |
| Formato de pesos | Track 1 y 2: `.pth` (PyTorch, checkpoints nnUNet). Track 3: `.pt` (checkpoint completo con backbone y cabeza) |

## Arquitectura y entrenamiento

Las pistas 1 y 2 se basan en nnUNet v2 (versión probada 2.6.4, imagen `kkdls19/atm26-nnunetv2:2.6.4`, base CUDA 11.8). La configuración `nnUNetPlans` emplea `3d_fullres` con parches de 128x160x112 y normalización CT. El Track 1 resuelve segmentación binaria de vía aérea sobre 299 casos de entrenamiento declarados en `dataset.json`; el Track 2 extiende la tarea a 20 clases de foreground (LB1+2 hasta LB7 y tráquea) más fondo. Cada pista publica cinco folds con `checkpoint_best.pth` y `checkpoint_final.pth` (244 MB por checkpoint), lo que permite tanto la inferencia con un único fold como el ensamblado de los cinco.

La pista 3 usa un CLIP ViT-B/16 completo (torre de visión y torre de texto) con una cabeza MLP de dimensión oculta 512 y dropout 0,3. El entrenamiento consta de 15 épocas con 3 épocas de warm-up con backbone congelado, batch de 16, semilla 20260625 y exportación de la época 14 (`selected_epoch: 14`). El checkpoint es completo (`checkpoint_kind: "full"`), de modo que no se descarga ningún backbone preentrenado en tiempo de carga. El preprocesado es `ToImage` → `Resize(224, 224, antialias=True)` → float32/255 → `Normalize` con media y desviación de CLIP; los fotogramas se redimensionan de forma independiente, sin letterboxing.

## Capacidades

- Segmentación binaria de la vía aérea en TC de pulmón (Track 1).
- Etiquetado anatómico por ramas bronquiales con 20 clases de foreground más fondo (Track 2).
- Reconocimiento por fotograma de 32 clases de puntos de referencia anatómicos en broncoscopia (Track 3).
- Inferencia por fold individual o ensamblado de cinco folds en las pistas nnUNet.
- Inferencia con *test-time augmentation* configurable (`tile_step_size=0.5`, `use_gaussian=True`, `use_mirroring=False`).
- Clasificación de fotogramas endoluminales con backbone CLIP congelable y cabeza MLP entrenable.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Planificación preoperatoria de broncoscopia**: el Track 1 genera una máscara binaria del árbol bronquial a partir de la TC del paciente, que el cirujano usa para anticipar la ruta endoluminal y detectar estrechamientos.
- **Navegación broncoscópica asistida**: combinando el Track 2 (etiquetado por ramas) con el Track 3 (reconocimiento de puntos de referencia en fotogramas), el sistema puede localizar la posición de la cámara dentro del árbol anatómico y guiar al operador.
- **Registro TC-vídeo**: las etiquetas por rama del Track 2 permiten alinear el modelo 3D preoperatorio con los fotogramas intraoperatorios clasificados por el Track 3, base de sistemas de realidad aumentada en quirófano.
- **Control de calidad de segmentaciones**: el ensamblado de cinco folds del Track 1 sirve para estimar incertidumbre (varianza entre folds) y marcar casos dudosos para revisión manual.
- **Entrenamiento de residentes**: el Track 3 puede etiquetar automáticamente fotogramas de broncoscopia con la estructura anatómica visible, generando material docente anotado sin coste manual.
- **Investigación en detección de anomalías endoluminales**: la representación CLIP del Track 3 puede reutilizarse como extractor de características para tareas derivadas (detección de lesiones, sangrado o moco) con ajuste fino ligero.
- **Línea base para el reto ATM'26**: cualquier participante puede partir de estos checkpoints para comparar su propuesta contra una referencia pública y reproducible con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que `checkpoint.pt` del Track 3 contiene una clave `validation_metrics` con las métricas registradas en el momento de la exportación, pero no se detallan sus valores.

## Requisitos de hardware

- **Track 1 y Track 2**: inferencia 3D con parches 128x160x112; se recomienda GPU con al menos 16-24 GB de VRAM para ejecutar con `perform_everything_on_device=True`. Una A100 40 GB o H100 permite procesar volúmenes completos con holgura; una RTX 4090 (24 GB) es viable para un único fold.
- **Track 3**: CLIP ViT-B/16 a 224x224 con 150 M parámetros; cabe holgadamente en cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4070, RTX 4090). Un fotograma por adelante requiere pocos cientos de MB de VRAM.
- **Consumer GPU**: sí, especialmente el Track 3. Los Tracks 1 y 2 son viables en RTX 4090 o RTX 3090 con un fold; el ensamblado de cinco folds multiplica el tiempo pero no la VRAM por fold.
- **Despliegue**: nnUNet v2.6.4 (imagen Docker `kkdls19/atm26-nnunetv2:2.6.4`, CUDA 11.8). Las imágenes con CUDA 12.4 no funcionan en la plataforma de evaluación del reto. Para el Track 3, PyTorch estándar y el kit de inferencia del repositorio GitHub, que incluye `download_weights.py` con verificación de digest.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATM'26 baselines (este repo) | Segmentación y etiquetado de vía aérea + clasificación endoluminal | 150 M (Track 3); no disponible (Tracks 1-2) | Parches 3D 128x160x112; imágenes 224x224 | MIT | Hugging Face + GitHub |
| nnUNet v2 genérico (MIC-DKFZ) | Segmentación médica 3D | Depende de la configuración | Configurable por dataset | Apache 2.0 | GitHub oficial |
| CLIP ViT-B/16 (OpenAI) | Visión-lenguaje zero-shot | 150 M | 224x224 | MIT | Hugging Face |
| Modelos específicos de vía aérea (p. ej. ATM'22) | Segmentación de vía aérea | no disponible | Volúmenes TC | variable | Repos de retos previos |

La comparación con alternativas específicas de segmentación de vía aérea es limitada porque la información disponible no incluye métricas numéricas ni detalles de arquitecturas rivales. La referencia más directa es nnUNet v2 genérico, del que este repositorio es una especialización con pesos entrenados para el dominio.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no admite prompts en lenguaje natural, tool calling, agentes ni generación de texto.
- **Dominio muy restringido**: los pesos están entrenados exclusivamente para TC de pulmón y broncoscopia; su uso fuera de ese dominio no está validado.
- **Riesgo de alucinación estructural**: como todo modelo de segmentación, puede producir ramas espurias o fusionar estructuras en zonas de baja resolución o artefactos de movimiento.
- **Dependencia de la configuración**: los Tracks 1 y 2 exigen mantener `dataset.json`, `plans.json` y `dataset_fingerprint.json` junto a los folds; un desajuste en la configuración de red invalida los resultados.
- **Compatibilidad de entorno**: la imagen con CUDA 12.4 no funciona en la plataforma de evaluación del reto; es necesario CUDA 11.8.
- **Sesgos de datos**: no se documenta la composición demográfica ni la procedencia de los 299 casos de entrenamiento, por lo que se desconoce su representatividad poblacional.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías clínicas; no debe usarse como dispositivo médico sin validación regulatoria adicional.
- **Métricas no publicadas**: sin valores de validación en la model card, no es posible estimar el rendimiento esperado antes de ejecutar la inferencia.
- **Idiomas**: no aplica; las etiquetas anatómicas están codificadas como IDs de clase, no como texto libre.

## Enlaces

- Hugging Face: https://huggingface.co/Endoluminal-Surg-Vision-IMR/Airway-Tree-Modeling-26-baselines
- Repositorio GitHub con código, Docker e inferencia: https://github.com/EndoluminalSurgicalVision-IMR/Airway-Tree-Modeling-26
- Sitio del reto ATM'26: https://atm26.grand-challenge.org/
- Paper de referencia (arXiv:2412.11039): https://arxiv.org/abs/2412.11039
