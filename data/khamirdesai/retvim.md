# khamirdesai/RetViM

## Resumen

RetViM es un modelo de clasificación de imágenes de tomografía de coherencia óptica (OCT) retiniana desarrollado por Khamir Desai, Mayuri A. Mehta y Sree Saicharan Vadapalli, aceptado para presentación en IEEE GSCon 2027. Combina un Vision Transformer base (ViT-B/16) con dos bloques híbridos de convolución y Mamba nativo (state space model), siguiendo la línea de investigación de MedMamba y VMamba, para clasificar imágenes retinianas en cuatro categorías: CNV, DME, DRUSEN y NORMAL.

El problema que aborda es la clasificación automática de enfermedades retinianas a partir de imágenes OCT, una tarea relevante para el cribado y apoyo al diagnóstico oftalmológico. Según el manuscrito, el modelo alcanza una precisión del 99,90 % (967/968 imágenes de test) sobre el dataset de Kermany, el mejor resultado entre los métodos comparados en dicho trabajo, aunque este dato es declarado por los autores y no ha sido verificado de forma independiente.

Es relevante porque ilustra la tendencia actual a incorporar arquitecturas Mamba (modelos de espacio de estados) en visión por computador, aprovechando su eficiencia en secuencias largas frente al attention puro. El modelo se distribuye como checkpoint personalizado de PyTorch en safetensors, con 101.232.773 parámetros y entrada RGB de 224 × 224.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido: ViT-B/16 + 2 bloques convolución/Mamba nativo 1D (MedMamba) |
| Parametros totales | 101.232.773 (según safetensors; la model card indica 101.223.557) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de 224 × 224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en Float32) |
| Idiomas soportados | Inglés (documentación; el modelo procesa imágenes, no texto) |
| Licencia | Other (rights-reserved-pending para los pesos; código original MIT) |
| Formato de pesos | safetensors (Float32, 404,95 MB) |

## Arquitectura y entrenamiento

RetViM es un modelo híbrido secuencial que parte de un ViT-B/16 preentrenado (timm/vit_base_patch16_224.augreg_in21k_ft_in1k, con preentrenamiento en ImageNet-21k y ajuste fino en ImageNet-1k) al que se añaden dos bloques que combinan convolución con Mamba nativo 1D, inspirados en MedMamba y VMamba. El checkpoint publicado utiliza Mamba 1D nativo con fusión por pooling y dimensiones de clasificador que difieren de la configuración SS2D resumida en el manuscrito; la implementación vinculada preserva los tensores entrenados y los carga de forma estricta (strict loading).

El entrenamiento se realizó sobre el dataset de OCT retiniana de Kermany (Kermany2018), con etiquetas CNV, DME, DRUSEN y NORMAL. Las nuevas ejecuciones de entrenamiento emplean manifiestos explícitos disjuntos por paciente (hashed patient-disjoint), aunque los autores no afirman reproducir el split original del dataset. No se dispone de información sobre número de épocas, tokens equivalentes ni técnicas de alineación (RLHF/DPO), que no aplican a un clasificador de imágenes. El preprocesamiento consiste en redimensionado lineal con OpenCV y normalización con estadísticos de ImageNet.

## Capacidades

- Clasificación de imágenes OCT retinianas en cuatro clases: CNV (neovascularización coroidea), DME (edema macular diabético), DRUSEN (drusas) y NORMAL.
- Arquitectura híbrida Transformer + Mamba que permite explorar la eficiencia de los modelos de espacio de estados en tareas de visión médica.
- Inferencia por línea de comandos mediante el paquete `retvim` (comando `retvim predict`), con descarga del checkpoint fijado o carga offline mediante `--weights`.
- Verificación de integridad del checkpoint mediante SHA-256.
- Carga estricta de tensores entrenados, garantizando compatibilidad exacta con la implementación publicada.
- No soporta texto, no es multimodal, no incluye tool calling ni capacidades generativas: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Cribado automatizado de enfermedades retinianas: el modelo puede preclasificar imágenes OCT en los cuatro diagnósticos del dataset de Kermany, priorizando casos con CNV o DME para revisión prioritaria por un oftalmólogo.
- Investigación en arquitecturas de visión médica: sirve como base experimental para comparar bloques Mamba frente a attention puro en imágenes médicas, con código y checkpoint reproducibles.
- Análisis retrospectivo de cohortes: clasificación masiva de archivos históricos de OCT en estudios epidemiológicos, aprovechando la inferencia por CLI y el procesamiento offline.
- Baseline en competiciones y papers: al ser un checkpoint publicado con resultados declarados en un dataset público muy usado, puede actuar como referencia de comparación en nuevos trabajos sobre OCT.
- Prototipado de herramientas clínicas de apoyo: integrable en pipelines de imagen médica (DICOM convertido a PNG/JPEG) como módulo de triaje, siempre como apoyo y no como diagnóstico autónomo.
- Docencia y formación: útil como ejemplo práctico de fine-tuning de ViT con bloques Mamba en cursos de visión por computador aplicada a medicina.
- Validación metodológica de splits: el enfoque de manifiestos disjuntos por paciente es reutilizable como buena práctica para evitar fuga de datos en datasets médicos.

## Benchmarks y rendimiento

| Benchmark / dataset | Resultado | Notas |
|---|---|---|
| Kermany retinal OCT (test, 968 imágenes) | 99,90 % de precisión (967/968) | Declarado en el manuscrito; no verificado de forma independiente |

No se han publicado en la información disponible comparaciones numéricas detalladas con otros modelos (MMLU, HumanEval, etc. no aplican a este modelo de visión). Los autores señalan que su resultado es el más alto entre los métodos comparados en su manuscrito, pero no es una clasificación verificada de forma independiente ni un benchmark recién reproducido.

## Requisitos de hardware

- VRAM estimada para inferencia: baja; con 101 millones de parámetros en Float32 (~405 MB de pesos), unos 1-2 GB de VRAM son suficientes para inferencia de imágenes individuales; en CPU también es viable.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060 o superior es más que suficiente); no se requieren A100 ni H100 para inferencia. Para reentrenamiento, una GPU de 16-24 GB (RTX 4090, A100) sería adecuada, aunque no se publican requisitos oficiales.
- Cabe con holgura en GPUs de consumo, incluidas la mayoría de las tarjetas con 4 GB o más de VRAM.
- Despliegue: paquete PyTorch propio (`pip install -e .` y CLI `retvim`); no es un checkpoint de Transformers `AutoModel`, por lo que no funciona directamente con transformers, vLLM, TGI ni Ollama. También puede cargarse manualmente desde safetensors en un script de PyTorch.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea / dominio | Licencia |
|---|---|---|---|---|
| RetViM | ~101 M | ViT-B/16 + bloques Mamba (híbrido) | Clasificación OCT retiniana (4 clases) | Pesos: rights-reserved-pending; código MIT |
| MedMamba (Yue et al.) | ~28 M (variante base) | Convolución + SS2D (Mamba) | Clasificación de imágenes médicas genéricas | MIT (código) |
| ViT-B/16 (timm, augreg_in21k_ft_in1k) | ~86 M | Transformer puro | Clasificación ImageNet-1k (base de RetViM) | Apache 2.0 |
| VMamba | no disponible | SS2D puro (Mamba visual) | Clasificación y tareas de visión generales | MIT (código) |

RetViM se distingue por ser un fine-tuning híbrido específico para OCT retiniana con resultados muy altos en su dataset, mientras que MedMamba y VMamba son modelos generales de investigación y el ViT-B base es un clasificador genérico de ImageNet sin especialización médica.

## Limitaciones y advertencias

- Licencia de pesos pendiente: los pesos están bajo `LICENSE_WEIGHTS` con derechos reservados (rights-reserved-pending), por lo que su uso comercial no está autorizado de forma explícita hasta que se publique la licencia final. Solo el código original es MIT.
- Uso exclusivo para investigación: los autores lo declaran explícitamente; no existe validación clínica prospectiva ni calibración de las puntuaciones de salida.
- Riesgo de sobreajuste al dataset de Kermany: la precisión del 99,90 % es paper-reported y no reproducida de forma independiente; el rendimiento en datos de otros hospitales, escáneres o poblaciones puede degradarse sustancialmente.
- Posible fuga de datos en el split original: las nuevas ejecuciones usan manifiestos disjuntos por paciente, pero no se afirma que recreen el split original del dataset, un problema conocido en la literatura de Kermany2018.
- Dominio estrecho: solo clasifica las cuatro clases del dataset (CNV, DME, DRUSEN, NORMAL); no es utilizable en otras patologías ni modalidades de imagen sin reentrenamiento.
- Entrada fija de 224 × 224 RGB con normalización de ImageNet: requiere preprocesado concreto (redimensionado lineal con OpenCV); imágenes con formatos o calidades distintas pueden afectar al resultado.
- Checkpoint no compatible con Transformers `AutoModel`: exige usar la implementación personalizada del repositorio, lo que complica la integración en stacks estándar.
- No hay información sobre sesgos demográficos del modelo, métricas por clase (sensibilidad/especificidad) ni incertidumbre de las predicciones.
- El manuscrito, el PDF del publisher y las figuras del paper no están incluidos en el repositorio; los metadatos de publicación final se añadirán cuando estén disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khamirdesai/RetViM
- Repositorio de código: https://github.com/khamirdesai/RetViM
- Detalles del checkpoint: https://github.com/khamirdesai/RetViM/blob/main/docs/checkpoint.md
- Instrucciones de entrenamiento y evaluación: https://github.com/khamirdesai/RetViM/blob/main/docs/training.md
- Licencia de los pesos: https://huggingface.co/khamirdesai/RetViM/blob/main/LICENSE_WEIGHTS
- Citación (CITATION.cff): https://github.com/khamirdesai/RetViM/blob/main/CITATION.cff
- Dataset de Kermany (Kaggle): https://www.kaggle.com/datasets/paultimothymooney/kermany2018
- Registro original del dataset (Mendeley): https://data.mendeley.com/datasets/rscbjbr9sj/2
- Investigación upstream – MedMamba: https://github.com/YubiaoYue/MedMamba
- Investigación upstream – VMamba: https://github.com/MzeroMiko/VMamba
- Investigación upstream – Mamba: https://github.com/state-spaces/mamba
- Modelo base: https://huggingface.co/timm/vit_base_patch16_224.augreg_in21k_ft_in1k
