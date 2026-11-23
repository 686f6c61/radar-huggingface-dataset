# 1aurent/vit_small_patch16_224.transpath_mocov3

## Resumen

`vit_small_patch16_224.transpath_mocov3` es un Vision Transformer (ViT) de tipo backbone para extracción de características en imágenes de histología, publicado en Hugging Face por el usuario `1aurent` y empaquetado para su uso con la librería `timm`. El modelo parte de la arquitectura ViT-Small con parches de 16x16 píxeles y resolución de entrada de 224x224, con 21,7 millones de parámetros, y ha sido preentrenado mediante aprendizaje autosupervisado con el método MoCo v3 sobre aproximadamente 15 millones de parches histológicos procedentes de los conjuntos PAIP y TCGA.

El modelo se enmarca en la línea de trabajo TransPath (CTransPath), presentada en el artículo "Transformer-based unsupervised contrastive learning for histopathological image classification" (Wang et al., *Medical Image Analysis*, 2022). Aunque el trabajo original propone una arquitectura híbrida CNN + Swin Transformer con una estrategia de contraste semánticamente relevante (SRCL), esta ficha concreta corresponde a una variante ViT-Small preentrenada con MoCo v3 y distribuida como backbone de características para patología computacional.

Su relevancia radica en que ofrece un extractor de representaciones específico del dominio histológico, listo para usar con `timm`, lo que permite generar embeddings de parches de tejido para tareas downstream como clasificación de parches, recuperación de imágenes, detección de mitosis o clasificación débilmente supervisada de portaobjetos completos (WSI), sin necesidad de reentrenar desde cero con datos anotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small), parches 16x16, resolución 224x224 |
| Parametros totales | 21.665.664 (21,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224x3) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch/timm, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (vía `timm`, `hf-hub:`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de escala "small": divide la imagen de entrada de 224x224 en parches de 16x16 (196 tokens), los proyecta linealmente y los procesa con bloques de autoatención. La model card indica que se debe instanciar con `num_heads=12`, lo que corresponde a la configuración estándar de ViT-Small. La salida es un vector de características por imagen (embedding global), adecuado para tareas de recuperación y clasificación downstream.

El preentrenamiento se realizó con MoCo v3, un método de aprendizaje autosupervisado contrastivo basado en momentum contrast, sobre unos 15 millones de parches histológicos extraídos de PAIP y TCGA. No se documentan en la información disponible el número exacto de tokens vistos, la composición detallada del dataset, ni si hubo fases de ajuste supervisado o RLHF (no aplicable en este dominio). El trabajo de referencia (TransPath/CTransPath) propone la estrategia SRCL, que alinea múltiples instancias positivas con conceptos visuales similares; esta ficha, sin embargo, corresponde a una variante ViT-Small + MoCo v3, no a la arquitectura híbrida original.

## Capacidades

- Extracción de embeddings de imágenes histológicas de 224x224x3 para tareas downstream.
- Clasificación de parches de tejido (image-classification) mediante cabezas lineales o fine-tuning.
- Recuperación de imágenes (patch retrieval) por similitud de representaciones.
- Base para clasificación débilmente supervisada de portaobjetos completos (WSI) agregando embeddings de parches.
- Soporte para detección de mitosis y segmentación de glándulas (como backbone en pipelines supervisados).
- Integración nativa con `timm` (`timm.create_model(..., pretrained=True)`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión generativa ni audio.

## Casos de uso

- Extracción de características para pipelines de patología computacional: generar embeddings de parches de tejido con `timm` y alimentar clasificadores lineales o modelos de agregación para diagnóstico asistido.
- Clasificación de parches histológicos: fine-tuning de una cabeza de clasificación sobre los embeddings para distinguir tipos de tejido o subtipos tumorales.
- Recuperación de imágenes similares: indexar embeddings de parches y usar búsqueda por similitud para recuperar casos histológicamente parecidos en bases de datos clínicas.
- Clasificación débilmente supervisada de WSI: dividir el portaobjetos en parches de 224x224, extraer embeddings con el modelo y agregarlos (por ejemplo, con atención múltiple) para predecir el diagnóstico a nivel de paciente.
- Detección de mitosis: usar el backbone como extractor de características en un detector supervisado sobre parches de alta resolución.
- Segmentación de glándulas colorrectales: emplear los mapas de características como entrada a un decodificador de segmentación en pipelines de investigación.
- Preentrenamiento inicial para dominios histológicos con pocas anotaciones: aprovechar las representaciones autosupervisadas como inicialización en lugar de ImageNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 21,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 87 MB, y en fp16 unos 43 MB. El coste dominante es el batch de imágenes, no el modelo.
- GPU recomendadas: cualquier GPU moderna sirve; para procesar grandes volúmenes de parches se recomiendan A100, H100, L40S o RTX 4090 por throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), incluso con batches grandes.
- Opciones de despliegue: `timm` + PyTorch (vía `hf-hub:`), exportación a ONNX o TorchScript, y serving con TorchServe o Triton. No se documenta soporte nativo en llama.cpp, Ollama, vLLM o TGI (orientados a LLM).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/vit_small_patch16_224.transpath_mocov3` | 21,7 M | 224x224x3 | Histología (PAIP + TCGA) | GPL-3.0 | Hugging Face (`timm`) |
| CTransPath (TransPath original) | no disponible en la información | parches histológicos | Histología (SSL SRCL) | GPL-3.0 (repo TransPath) | GitHub `Xiyue-Wang/TransPath` |
| ViT-Small ImageNet (supervisado, `timm`) | ~22 M | 224x224x3 | Imagen natural | según checkpoint | Hugging Face / `timm` |
| Otros backbones histológicos SSL (p. ej. familia HistoSSL) | no disponible en la información | parches histológicos | Histología | no disponible | Hugging Face / GitHub Owkin |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: impone obligaciones de copyleft; el uso comercial en productos propietarios puede requerir revisión legal y, en su caso, liberar el código derivado.
- Modelo de dominio específico: entrenado solo con parches histológicos de PAIP y TCGA; su rendimiento fuera de ese dominio (imágenes naturales, otras tinciones o escáneres) no está garantizado.
- No es un modelo generativo ni de clasificación directa: la model card lo describe como backbone de características; requiere cabezas o pipelines downstream para tareas predictivas.
- Riesgo de sesgo por el dataset: TCGA y PAIP sobrerrepresentan ciertos tipos de cáncer y centros; los embeddings pueden no generalizar a poblaciones o tejidos infrarrepresentados.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de falsos positivos/negativos en clasificación downstream si no se valida adecuadamente.
- La model card no documenta métricas, composición detallada del dataset ni procedimiento de evaluación; la reproducibilidad es limitada.
- `inference: false` en los metadatos: no está configurado como endpoint de inferencia gestionado en Hugging Face.
- Resolución fija de 224x224: los parches histológicos de mayor tamaño deben redimensionarse, lo que puede perder detalle morfológico fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/vit_small_patch16_224.transpath_mocov3
- Artículo de referencia (Medical Image Analysis, 2022): https://www.sciencedirect.com/science/article/abs/pii/S1361841522002043
- Repositorio original TransPath: https://github.com/Xiyue-Wang/TransPath
- Licencia del repositorio TransPath: https://github.com/Xiyue-Wang/TransPath/blob/main/LICENSE.md
- Portal TCGA: https://portal.gdc.cancer.gov/
- Repositorio HistoSSLscaling (imagen de ejemplo): https://github.com/owkin/HistoSSLscaling
- Librería `timm`: https://github.com/huggingface/pytorch-image-models
