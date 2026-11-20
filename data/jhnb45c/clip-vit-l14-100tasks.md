# jhnb45C/clip-vit-l14-100tasks

## Resumen

`clip-vit-l14-100tasks` es una colección de 100 expertos de clasificación visual obtenidos mediante fine-tuning del encoder de visión de `openai/clip-vit-large-patch14`. El autor (jhnb45C) parte del CLIP ViT-L/14 original de OpenAI y entrena, para cada uno de los 100 conjuntos de datos de clasificación de imágenes, una copia independiente de los pesos del `CLIPVisionModel`. No se reentrena el encoder de texto: la evaluación zero-shot se realiza con las cabezas de texto originales de CLIP y la plantilla "a photo of a {}". El objetivo es doble: servir de banco de pruebas reproducible de fine-tuning sobre una base multimodal conocida y proporcionar clasificadores especializados de alta precisión para dominios muy diversos (visión médica, teledetección, alimentación, gestos, documentos, satélite, etc.).

El modelo base es un transformer ViT-L/14 con aproximadamente 304 millones de parámetros en el encoder de visión, parches de 14x14 y una resolución de entrada de 224x224 píxeles. Los 100 submodelos comparten esa misma arquitectura; cada uno se entrena de forma independiente sobre un dataset concreto con la receta indicada (Adam, lr 1e-5, cosine, 4000 pasos, batch 128, fp32, seed 42). El resultado medio sobre los 100 conjuntos es de 48,11 % de accuracy zero-shot en test frente a 89,79 % tras el fine-tuning, una mejora de más de 40 puntos porcentuales.

La relevancia práctica del repositorio está en su heterogeneidad: cubre desde tareas triviales para CLIP (STL-10, Food-11, Wonders of the World) hasta dominios donde el zero-shot fracasa estrepitosamente (DSprites, KMNIST, EMNIST Letters, Tiny ImageNet), lo que lo convierte en un recurso útil para estudiar cuánto conocimiento visual transfiere CLIP y cuánto requiere ajuste supervisado. El repositorio ocupa 121,3 GB, coherente con 100 copias de un ViT-L en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14) de CLIP, solo encoder de visión; texto congelado (zero-shot) |
| Parámetros totales | ~304 M por submodelo (ViT-L/14 de CLIP); el repositorio contiene 100 copias |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual propio) |
| Tipos de cuantización | no disponible (pesos publicados en fp32/safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (el encoder de texto no se reentrena; las etiquetas son en inglés) |
| Licencia | no disponible explícitamente; la model card indica "released for research use" y que los datasets conservan sus licencias originales |
| Formato de pesos | safetensors (subcarpeta `vision_model/` por tarea) |

## Arquitectura y entrenamiento

Cada uno de los 100 submodelos es un `CLIPVisionModel` estándar de la familia ViT-L/14: 24 capas de transformer, dimensión oculta 1024, 16 cabezas de atención, parches de 14x14 y proyección final a un embedding de 768 dimensiones. La inicialización parte de los pesos del encoder visual de `openai/clip-vit-large-patch14`; el encoder de texto no se toca y se reutiliza para construir clasificadores zero-shot mediante la plantilla "a photo of a {}". Para cada tarea se sustituye la cabeza por una capa lineal con tantas salidas como clases tenga el dataset (desde 2 clases en PCam o Malaria Cells hasta 525 en Birds525 o 345 en los seis dominios de DomainNet).

La receta de fine-tuning es homogénea en las 100 tareas: optimizador Adam, learning rate 1e-5, weight decay 0, scheduler cosine, 4000 pasos de entrenamiento, batch size 128 con acumulación de gradiente 4 (batch efectivo 512), precisión fp32 con TF32 activado, semilla 42 y entrenamiento exclusivo sobre el split de train. La model card indica que los experimentos de merging usan el split de validación solo para selección de modelo, lo que sugiere que el autor está explorando técnicas de fusión de pesos (model merging) entre los 100 expertos. No se documentan datos de preentrenamiento adicionales, RLHF, DPO ni aumentos de datos específicos; el entrenamiento es supervisado estándar de clasificación.

## Capacidades

- Clasificación de imágenes en 100 dominios distintos, con precisión fine-tuned media del 89,79 % en test.
- Extracción de embeddings visuales de 768 dimensiones mediante `CLIPVisionModel`, reutilizables para búsqueda, clustering o clasificación con cabezas propias.
- Clasificación zero-shot con las cabezas de texto originales de CLIP (48,11 % de media en test sobre las 100 tareas).
- Clasificación de imágenes médicas: retinopatía diabética, histología colorrectal, dermatología, malaria, cáncer de mama, tumores cerebrales, Alzheimer por MRI, hemorragia cerebral, COVID en radiografía de tórax.
- Clasificación de imágenes de satélite y teledetección: EuroSAT, RESISC45, UC Merced, PatternNet, WHU-RS19, RSS-CN7.
- Reconocimiento de alimentos y productos: Food-101, Food-11, Fruits-360, Vietnamese Food, Indian Food, riqueza de frutas.
- Reconocimiento de gestos y acciones: ASL, HaGRID, yoga, human action, deepfake vs real.
- Clasificación de documentos y escenas: RVL-CDIP, Intel Scenes, MIT Indoor 67, DomainNet (clipart, infograph, painting, quickdraw, real, sketch).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder visual.
- Capacidades multilingües: no aplicables; las etiquetas y la plantilla de texto están en inglés.

## Casos de uso

- **Moderación y clasificación de imágenes médicas en pipelines de triaje**: usar el submodelo correspondiente (por ejemplo `diabetic_retinopathy/vision_model` o `chest_xray_covid/vision_model`) como primer filtro en un sistema de derivación, aprovechando precisiones fine-tuned del 80-97 % en test para descartar casos normales antes de la revisión humana.
- **Etiquetado automático de imágenes satelitales**: los submodelos `eurosat`, `resisc45`, `uc_merced` y `patternnet` alcanzan 97-99 % en test y pueden integrarse en pipelines de teledetección para clasificar uso del suelo a escala regional.
- **Búsqueda visual y deduplicación**: extraer embeddings de 768 dimensiones con `CLIPVisionModel` y construir índices vectoriales (FAISS, Qdrant) para recuperación de imágenes similares en catálogos de producto o archivos fotográficos.
- **Control de calidad en industria alimentaria**: los submodelos `fruit_ripeness`, `fruits360` y `food11` (100 %, 99,81 % y 99,24 % en test respectivamente) permiten clasificar el estado de madurez o el tipo de producto en una cinta transportadora con una cámara y una GPU de gama media.
- **Clasificación de documentos escaneados**: `rvl_cdip` (92,70 % en test sobre 16 clases) sirve para enrutar facturas, formularios, cartas y recibos hacia el proceso OCR correspondiente en un sistema de gestión documental.
- **Análisis de gestos para interfaces sin contacto**: `asl_hand_gestures` (99,99 % en test) y `hagrid_gestures` (97,74 %) permiten construir interfaces de control por gestos o accesibilidad con una webcam y una GPU consumer.
- **Investigación en transferencia visual y model merging**: el repositorio está diseñado explícitamente para experimentos de fusión de pesos entre los 100 expertos, usando el split de validación para selección; útil para estudiar interferencia entre tareas y técnicas como TIES, DARE o model soups.
- **Detección de deepfakes y contenido sintético**: el submodelo `deepfake_vs_real` (99,46 % en test) puede integrarse como señal adicional en un sistema de verificación de autenticidad de imágenes.

## Benchmarks y rendimiento

La model card publica accuracy (%) sobre splits fijos de train/val/test para las 100 tareas. Se resumen los agregados y una selección representativa; el resto está en la model card original.

| Métrica agregada | Valor |
|---|---|
| Media zero-shot en test (100 tareas) | 48,11 |
| Media fine-tuned en validación (100 tareas) | 90,67 |
| Media fine-tuned en test (100 tareas) | 89,79 |

| Tarea | Clases | Zero-shot test | Fine-tuned val | Fine-tuned test |
|---|---|---|---|---|
| STL-10 | 10 | 99,36 | 99,60 | 99,56 |
| Food-11 | 11 | 98,36 | 98,42 | 99,24 |
| Oxford Pets | 37 | 93,24 | 98,64 | 96,59 |
| Food-101 | 101 | 91,16 | 92,70 | 95,31 |
| CIFAR-10 | 10 | 95,58 | 99,36 | 99,02 |
| MNIST | 10 | 76,34 | 99,67 | 99,72 |
| EuroSAT | 10 | 61,22 | 99,12 | 99,44 |
| RESISC45 | 45 | 71,37 | 97,35 | 97,08 |
| Stanford Cars | 196 | 77,88 | 92,60 | 92,05 |
| Tiny ImageNet | 200 | 4,49 | 89,48 | 89,25 |
| KMNIST | 10 | 9,74 | 99,57 | 98,75 |
| EMNIST Letters | 26 | 12,37 | 96,24 | 95,79 |
| DSprites Location | 32 | 3,21 | 99,99 | 99,99 |
| FGVC Aircraft | 100 | 27,21 | 59,67 | 58,90 |
| Country211 | 211 | 25,54 | 35,10 | 36,16 |
| SmallNORB Azimuth | 18 | 4,84 | 20,39 | 27,62 |
| DomainNet Quickdraw | 345 | 22,40 | 72,31 | 72,69 |
| FairFace Age | 9 | 43,48 | 62,62 | 62,57 |
| Music Genre Spectrogram | 12 | 4,23 | 75,60 | 70,90 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM. No se proporcionan comparaciones con otros fine-tunings de CLIP en la información disponible.

## Requisitos de hardware

- **VRAM estimada por submodelo**: ViT-L/14 en fp32 ocupa aproximadamente 1,2 GB de pesos; en fp16 unos 0,6 GB. La inferencia con batch pequeño requiere entre 2 y 4 GB de VRAM según resolución y batch.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM sirve para un submodelo individual en fp16 (RTX 3050, RTX 4060, T4). Para servir varios submodelos en paralelo o hacer fine-tuning, se recomienda A100 40/80 GB, H100 o RTX 4090.
- **Consumer GPU**: sí, un único submodelo cabe holgadamente en GPUs consumer modernas (RTX 3060 12 GB, RTX 4070, RTX 4090). Cargar los 100 submodelos simultáneamente requiere ~120 GB en fp32 o ~60 GB en fp16, inviable en consumer.
- **Opciones de despliegue**: `transformers` con `CLIPVisionModel.from_pretrained(..., subfolder="<tarea>/vision_model")`; exportación a ONNX Runtime o TensorRT para producción; TorchServe o Triton Inference Server para servir varios expertos; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- **Latencia y throughput**: no disponibles en la información proporcionada. Como referencia arquitectónica, un ViT-L/14 procesa típicamente decenas de imágenes por segundo en una A100 y unos pocos por segundo en una RTX 3060, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jhnb45C/clip-vit-l14-100tasks` | ~304 M por experto (ViT-L/14) | 224x224 | 89,79 % medio en test sobre 100 tareas | "research use" (no comercial explícito) | Hugging Face, 121,3 GB |
| `openai/clip-vit-large-patch14` | ~428 M (visión + texto) | 224x224 | Zero-shot ~48 % medio en las mismas 100 tareas | MIT (según el modelo original de OpenAI) | Hugging Face, ampliamente disponible |
| `laion/CLIP-ViT-L-14-laion2B-s32B-b82K` | ~428 M | 224x224 | Zero-shot superior a CLIP original en varios benchmarks, no evaluado en estas 100 tareas | MIT | Hugging Face |
| `google/siglip-large-patch16-384` | ~878 M | 384x384 | Mejor zero-shot que CLIP ViT-L/14 en ImageNet y retrieval, no evaluado en estas 100 tareas | Apache 2.0 | Hugging Face |

La comparación directa con alternativas es limitada porque la model card no incluye evaluaciones cruzadas con otros encoders. La ventaja principal de este repositorio frente a CLIP original es la disponibilidad de 100 clasificadores especializados con precisión cercana al estado del arte en dominios concretos; la desventaja es el tamaño del repositorio (121,3 GB) y la ausencia de una licencia comercial clara.

## Limitaciones y advertencias

- **Licencia**: la model card indica "released for research use" y que los datasets conservan sus licencias originales. No se especifica una licencia comercial; para uso en producción conviene contactar con el autor o verificar cada dataset subyacente.
- **Sesgos**: varios submodelos trabajan sobre datasets con sesgos conocidos (FairFace Age, Country211, Deepfake vs Real, Human Action). Las precisiones bajas en `fairface_age` (62,57 % en test) y `country211` (36,16 %) reflejan dificultad intrínseca y posible desequilibrio de clases.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea confiada en dominios fuera de distribución. Los submodelos con precisión fine-tuned baja (`smallnorb_azimuth` 27,62 %, `country211` 36,16 %, `fgvc_aircraft` 58,90 %, `fairface_age` 62,57 %) no son aptos para producción sin validación adicional.
- **Limitaciones de contexto e idioma**: el encoder de texto no se reentrena; las etiquetas zero-shot están en inglés y la plantilla es fija ("a photo of a {}"). No hay soporte para prompts en castellano ni para descripciones libres.
- **Tamaño del repositorio**: 121,3 GB dificultan la descarga y el despliegue; conviene descargar solo las subcarpetas de las tareas necesarias mediante `huggingface_hub` con patrones de fichero.
- **Reproducibilidad**: la receta está fijada (seed 42, 4000 pasos, batch 128, fp32), pero no se publican los scripts de entrenamiento ni los splits exactos, lo que limita la reproducción bit a bit.
- **Uso médico**: varios submodelos clasifican imágenes médicas, pero no se documenta validación clínica ni regulatoria; no deben usarse como dispositivo médico sin certificación.
- **Sin soporte generativo**: no es un LLM; no puede generar texto, razonar ni ejecutar herramientas. Cualquier caso de uso que requiera generación debe combinarse con un modelo de lenguaje aparte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jhnb45C/clip-vit-l14-100tasks
- Modelo base: https://huggingface.co/openai/clip-vit-large-patch14
- Paper de CLIP (Radford et al., 2021): https://arxiv.org/abs/2103.00020
- Documentación de `CLIPVisionModel` en transformers: https://huggingface.co/docs/transformers/model_doc/clip
- Alternativa LAION CLIP ViT-L/14: https://huggingface.co/laion/CLIP-ViT-L-14-laion2B-s32B-b82K
- Alternativa SigLIP: https://huggingface.co/google/siglip-large-patch16-384
