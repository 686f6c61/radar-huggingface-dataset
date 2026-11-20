# jhnb45C/clip-vit-b32-100tasks

## Resumen

`clip-vit-b32-100tasks` es una colección de 100 expertos de clasificación visual obtenidos mediante fine-tuning supervisado del codificador de visión de `openai/clip-vit-base-patch32`. El autor (jhnb45C) parte del checkpoint original de OpenAI y entrena, para cada uno de los 100 conjuntos de datos, un `CLIPVisionModel` independiente con cabezas de clasificación zero-shot basadas en la plantilla de texto "a photo of a {}". El repositorio resultante ocupa 35 GB y contiene un subdirectorio por tarea con pesos en safetensors, un `result.json` con métricas y receta, y un `classnames.json` cuando está disponible.

El objetivo es servir de base experimental para estudiar fine-tuning, merging de modelos y evaluación multi-tarea sobre un backbone CLIP ViT-B/32 congelado en su arquitectura. La media de precisión en test pasa de 42,05 % en zero-shot a 85,68 % tras el fine-tuning, con variaciones muy grandes según la tarea: desde el 18,70 % en `country211` hasta el 100 % en `fruit_ripeness` y `chess_pieces`.

Es relevante ahora porque proporciona un banco de 100 expertos homogéneos (mismo backbone, misma receta, misma semilla) que permite comparar estrategias de especialización y de fusión de modelos sin tener que reentrenar desde cero. No es un modelo generativo ni un modelo multimodal completo: es un conjunto de clasificadores de imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/32) como codificador de visión de CLIP, con cabeza de clasificación lineal por tarea |
| Parámetros totales | Aproximadamente 88 M por experto (ViT-B/32); 100 expertos en el repo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 224x224 en parches de 32x32) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | No disponible (las etiquetas textuales de zero-shot están en inglés) |
| Licencia | No disponible en el repositorio; la model card indica "research use" y que los datasets conservan sus licencias originales |
| Formato de pesos | safetensors (subcarpeta `vision_model/` por tarea) |

## Arquitectura y entrenamiento

Cada experto es un `CLIPVisionModel` de OpenAI (ViT-B/32, 12 capas, dimensión oculta 768, 12 cabezas de atención, parches de 32x32 sobre imágenes de 224x224) al que se le añade una cabeza de clasificación lineal para el número de clases de la tarea correspondiente. El texto no se entrena: las etiquetas zero-shot se generan con la plantilla "a photo of a {}" usando el codificador de texto original de CLIP, y la evaluación zero-shot se hace contra esas representaciones.

La receta es idéntica para las 100 tareas: optimizador Adam, learning rate 1e-5, weight decay 0, scheduler coseno, 4000 pasos, batch size 128, semilla 42, precisión fp32, sin acumulación de gradientes y sin TF32. Se entrena sobre el split de train de cada dataset y se reportan accuracy en validación y test sobre splits fijos. No se documenta el número total de tokens ni la composición agregada del dataset; tampoco se menciona RLHF, DPO ni ninguna técnica de alineación, lo cual es coherente con un modelo discriminativo de clasificación. No hay innovaciones de decodificación ni atención lineal: es un fine-tuning estándar sobre un backbone congelado en su arquitectura.

## Capacidades

- Clasificación de imágenes en 100 dominios distintos (escenas, objetos, alimentos, plantas, radiografías, histología, gestos, documentos, arte, satélite, etc.).
- Zero-shot classification mediante plantilla textual "a photo of a {}" usando el codificador de texto original de CLIP.
- Extracción de features visuales con `CLIPVisionModel` para tareas downstream (similitud, clustering, retrieval).
- Fine-tuning adicional sobre cada experto para nuevas clases dentro del mismo dominio.
- Evaluación comparativa de estrategias de merging (el autor menciona experimentos de merging con selección sobre validación).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto.
- No soporta visión generativa ni descripción de imágenes; solo clasificación y embeddings.
- Capacidades multilingües: no disponibles; las etiquetas zero-shot están en inglés.

## Casos de uso

- Clasificación de imágenes médicas: el experto `chest_xray_covid` alcanza 96,74 % en test y `brain_tumor_mri` 96,72 %, útiles como línea base para triaje o preetiquetado en pipelines de radiología.
- Control de calidad agrícola: `plantvillage` (99,59 %), `tomato_leaf` (99,55 %) y `fruit_ripeness` (100 %) permiten clasificar enfermedades foliares o estado de maduración en cámaras industriales.
- Moderación y verificación de contenido: `deepfake_vs_real` (98,48 %) y `person_presence` (87,35 %) sirven como filtros previos en plataformas de subida de vídeo o imagen.
- Reconocimiento de documentos y escritura: `rvl_cdip` (89,58 %) y `asl_hand_gestures` (99,96 %) para digitalización de archivos o interfaces de accesibilidad.
- Análisis de imágenes satelitales: `resisc45` (94,78 %), `uc_merced` (98,83 %) y `patternnet` (99,66 %) para segmentación de uso del suelo en pipelines geoespaciales.
- Investigación en merging de modelos: los 100 expertos con receta idéntica permiten estudiar técnicas de model soup, task arithmetic o TIES sin reentrenar, usando el split de validación para selección.
- Benchmarking de robustez: `domainnet_*` (clipart, infograph, painting, quickdraw, real, sketch) con 345 clases cada uno permite medir degradación por cambio de dominio.
- Preentrenamiento de clasificadores con pocas etiquetas: usar los embeddings del `vision_model` como features congeladas y entrenar una regresión logística encima.

## Benchmarks y rendimiento

Resultados publicados en la model card (accuracy en %, test). Media sobre 100 tareas: zero-shot 42,05; fine-tuned test 85,68.

| Tarea | Clases | Zero-shot test | Fine-tuned test |
|---|---|---|---|
| sun397 | 397 | 63,21 | 73,27 |
| stanford_cars | 196 | 59,59 | 73,29 |
| resisc45 | 45 | 60,22 | 94,78 |
| eurosat | 10 | 45,04 | 99,11 |
| svhn | 10 | 31,61 | 97,05 |
| gtsrb | 43 | 32,48 | 98,73 |
| mnist | 10 | 48,25 | 99,66 |
| dtd | 47 | 44,20 | 76,97 |
| oxford_flowers102 | 102 | 66,45 | 87,67 |
| pcam | 2 | 60,62 | 87,53 |
| fer2013 | 7 | 41,42 | 69,96 |
| oxford_pets | 37 | 83,29 | 92,15 |
| cifar100 | 100 | 63,70 | 88,35 |
| cifar10 | 10 | 89,83 | 97,50 |
| food101 | 101 | 82,37 | 88,38 |
| caltech101 | 102 | 83,07 | 95,02 |
| fgvc_aircraft | 100 | 17,31 | 36,27 |
| country211 | 211 | 14,67 | 18,70 |
| tiny_imagenet | 200 | 3,25 | 79,28 |
| domainnet_real | 345 | 81,21 | 87,36 |
| domainnet_quickdraw | 345 | 12,58 | 67,59 |
| plantvillage | 38 | 6,87 | 99,59 |
| chest_xray_covid | 3 | 66,38 | 96,74 |
| brain_tumor_mri | 4 | 22,65 | 96,72 |
| dermnet | 23 | 17,42 | 55,22 |
| fairface_age | 9 | 43,71 | 59,04 |
| wikiart_style | 27 | 20,21 | 66,95 |
| music_genre_spectrogram | 12 | 12,70 | 76,72 |
| chess_pieces | 13 | 29,41 | 100,00 |
| fruit_ripeness | 4 | 39,10 | 100,00 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM por experto: aproximadamente 350 MB en fp32 (88 M parámetros) y unos 175 MB en fp16; con activaciones de batch pequeño, menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3060, RTX 4060, RTX 4090) basta para un experto individual; A100/H100 solo son necesarias si se cargan varios expertos en paralelo o se hace fine-tuning con batch grande.
- Cabe en GPU consumer: sí, con holgura, incluso varios expertos simultáneamente en una RTX 4090 (24 GB).
- Opciones de despliegue: `transformers` con `CLIPVisionModel.from_pretrained(..., subfolder="<tarea>/vision_model")`; exportación a ONNX o TensorRT para inferencia de baja latencia; TorchScript para servir con TorchServe.
- El repo completo ocupa 35 GB, por lo que conviene descargar solo las subcarpetas necesarias (`huggingface-cli download --include "<tarea>/*"`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Precisión media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clip-vit-b32-100tasks | ~88 M por experto | 224x224, parches 32x32 | 85,68 % (media 100 tareas) | No disponible (research use) | Hugging Face |
| openai/clip-vit-base-patch32 | ~88 M (visión) | 224x224 | 42,05 % zero-shot (media 100 tareas) | MIT (según repo original) | Hugging Face |
| openai/clip-vit-large-patch14 | ~428 M (visión) | 224x224, parches 14x14 | No disponible | MIT | Hugging Face |
| google/siglip-base-patch16-224 | ~203 M | 224x224, parches 16x16 | No disponible | Apache 2.0 | Hugging Face |

La comparación directa con CLIP ViT-B/32 original es la más informativa: mismo backbone, misma evaluación, y una mejora media de 43,6 puntos porcentuales en test gracias al fine-tuning por tarea. La comparación con ViT-L/14 o SigLIP no está soportada por datos publicados en la model card.

## Limitaciones y advertencias

- Cada experto está especializado en una única tarea; no hay un clasificador unificado ni enrutamiento automático entre tareas.
- El rendimiento es muy desigual: `country211` (18,70 %), `smallnorb_azimuth` (26,22 %), `fgvc_aircraft` (36,27 %) y `dermnet` (55,22 %) están lejos de ser utilizables en producción.
- Riesgo de sobreajuste al dominio de cada dataset: el salto zero-shot a fine-tuned puede reflejar memorización de sesgos del split, no mejora de representación.
- No se documenta licencia explícita del checkpoint; la model card solo indica "research use", lo que impide asumir uso comercial sin aclaración del autor.
- Los datasets subyacentes conservan sus licencias originales, algunas restrictivas (médicas, faciales), lo que condiciona el uso comercial derivado.
- El modelo no genera texto ni descripciones; no debe presentarse como un VLM.
- Las etiquetas zero-shot están en inglés; el rendimiento con prompts en otros idiomas no está evaluado.
- Sesgos conocidos: no documentados por el autor; los datasets de origen (FairFace, country211, etc.) introducen sesgos demográficos y geográficos que se heredan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos en clasificación con clases no representadas en el entrenamiento.
- No hay información sobre calibración, matrices de confusión ni intervalos de confianza; las accuracy reportadas son puntuales sobre splits fijos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jhnb45C/clip-vit-b32-100tasks
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Paper CLIP (Radford et al., 2021): https://arxiv.org/abs/2103.00020
- Documentación de `CLIPVisionModel` en transformers: https://huggingface.co/docs/transformers/model_doc/clip
- Repositorio de transformers: https://github.com/huggingface/transformers
