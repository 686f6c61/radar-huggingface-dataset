# 1aurent/densenet121.medmae_CXR_mocov2

## Resumen

DenseNet-121 con pesos preentrenados mediante una combinación de MedMAE (masked autoencoder sobre radiografías de tórax) y MoCo v2 (aprendizaje contrastivo auto-supervisado). Lo publica el usuario 1aurent en Hugging Face bajo licencia Apache 2.0 y se distribuye en formato `timm`/`safetensors` para la tarea de clasificación de imágenes. Con 7.037.504 parámetros, es un modelo compacto pensado como extractor de características o cabecera de clasificación sobre imágenes médicas de tórax (CXR, chest X-ray).

El interés práctico está en que combina dos paradigmas de preentrenamiento auto-supervisado: reconstrucción enmascarada (estilo MAE) y aprendizaje contrastivo (MoCo v2), aplicados al dominio de radiografía de tórax. Esto lo hace relevante para experimentos de transferencia en clasificación de patologías torácicas con recursos computacionales muy limitados, ya que cabe en cualquier GPU consumer.

La model card publicada es mínima (solo frontmatter de metadatos), por lo que no hay información oficial sobre el dataset de preentrenamiento, el proceso de fine-tuning, los hiperparámetros ni los resultados de evaluación. Todo lo que no consta en la información disponible se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (red convolucional densa, bloque DenseNet con conexiones densas entre capas) |
| Parametros totales | 7.037.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/ONNX publicadas en la información) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `timm`) |

## Arquitectura y entrenamiento

DenseNet-121 es una CNN con bloques densos donde cada capa recibe como entrada las salidas de todas las capas anteriores del mismo bloque, lo que reduce el número de parámetros frente a arquitecturas equivalentes en profundidad. El modelo publica 7.037.504 parámetros, un orden de magnitud coherente con una DenseNet-121 adaptada a clasificación (la versión ImageNet estándar ronda los 8M de parámetros). La cabecera de clasificación concreta (número de clases de salida) no está documentada en la información disponible.

El preentrenamiento combina, según el nombre del checkpoint, MedMAE (masked autoencoder sobre radiografías de tórax) y MoCo v2 (aprendizaje contrastivo con cola de memoria y momentum encoder). No se especifican en la información disponible el número de tokens/imágenes de entrenamiento, la composición del dataset, la resolución de entrada, ni si hubo fine-tuning supervisado posterior. Tampoco hay datos sobre aumentos, esquema de enmascarado ni hiperparámetros de MoCo.

## Capacidades

- Clasificación de imágenes de radiografía de tórax (CXR) mediante la pipeline `image-classification` de `timm`.
- Extracción de características visuales: al ser una DenseNet-121, puede usarse como backbone congelado o ajustable para tareas de transferencia.
- Preentrenamiento auto-supervisado en dominio médico: los pesos están inicializados con representaciones aprendidas sobre CXR (MedMAE + MoCo v2), lo que puede mejorar la transferencia frente a un backbone solo ImageNet.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de visión.
- No tiene capacidades multilingües, de generación de texto, código ni matemáticas.
- No dispone de modo "thinking", visión multimodal, audio ni agentes.

## Casos de uso

- Clasificación binaria o multietiqueta de patologías torácicas: usar el modelo como cabecera o como backbone fine-tuneado sobre datasets como NIH ChestX-ray14, CheXpert o MIMIC-CXR (estos datasets no constan en la información del autor; son ejemplos de dominio). Su tamaño de 7M parámetros permite iterar rápido en experimentos de ablación.
- Extracción de embeddings para búsqueda por similitud: la parte convolucional puede emplearse para generar vectores de imagen y construir un índice de recuperación de radiografías similares en un sistema de apoyo al diagnóstico.
- Baseline en investigación de preentrenamiento auto-supervisado: sirve como referencia para comparar MedMAE+MoCo v2 frente a otras estrategias (ImageNet, RadImageNet, MAE puro) en tareas de clasificación CXR.
- Prototipado en hardware modesto: al ocupar del orden de decenas de MB en FP32, se puede entrenar y evaluar en una única GPU consumer (RTX 3060/4090) sin cuellos de botella de memoria.
- Pipeline de triaje preliminar: integrado en un servicio de inferencia ligero (por ejemplo, TorchServe o un contenedor con `timm`) para priorizar estudios radiológicos en función de una puntuación de probabilidad.
- Docencia y reproducibilidad: modelo pequeño y con licencia permisiva (Apache 2.0) adecuado para cursos y tutoriales de visión médica con `timm`, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para lotes pequeños (7M parámetros ≈ 28 MB de pesos); con batch grande y activaciones, típicamente 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` + PyTorch (nativo), exportación a ONNX Runtime o TorchScript para producción; no hay versiones GGUF ni integración con llama.cpp/Ollama (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1aurent/densenet121.medmae_CXR_mocov2 | 7.037.504 | no disponible | Clasificación CXR | Apache 2.0 | Hugging Face (`timm`) |
| DenseNet-121 (ImageNet, torchvision/timm) | ~8M | 224x224 típico | Clasificación general | BSD-3 / Apache 2.0 según implementación | Amplia |
| ResNet-50 (ImageNet) | ~25,6M | 224x224 típico | Clasificación general | BSD-3 / Apache 2.0 | Amplia |
| ViT-B/16 (ImageNet) | ~86M | 224x224 típico | Clasificación general | Apache 2.0 (según checkpoint) | Amplia |

No se dispone de datos de rendimiento del modelo para establecer una comparación cuantitativa con alternativas de dominio médico; la comparación anterior es estructural (tamaño, licencia y disponibilidad).

## Limitaciones y advertencias

- La model card no documenta el dataset de preentrenamiento ni de evaluación, por lo que se desconoce el sesgo demográfico y la cobertura de patologías.
- Riesgo de alucinación en sentido figurado: al ser un clasificador, puede producir falsos positivos/negativos con alta confianza; no debe usarse como diagnóstico autónomo sin validación clínica.
- No hay información sobre calibración, umbrales operativos ni métricas (AUROC, F1) en la información disponible.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad por uso clínico.
- El checkpoint se actualizó por última vez en 2026-11-23 según los metadatos, pero no hay changelog que explique los cambios.
- Uso en producción clínica requiere validación regulatoria (MDR en la UE, FDA en EE. UU.) que este modelo no aporta por sí mismo.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/densenet121.medmae_CXR_mocov2
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Paper DenseNet: https://arxiv.org/abs/1608.06993
- Paper MoCo v2: https://arxiv.org/abs/2003.04297
- Paper MAE: https://arxiv.org/abs/2111.06377
- No se han encontrado en la información proporcionada enlaces a paper, blog, demo o repositorio específicos del autor para este checkpoint.
