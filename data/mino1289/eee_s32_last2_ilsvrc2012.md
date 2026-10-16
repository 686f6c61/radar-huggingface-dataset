# Mino1289/eee_s32_last2_ilsvrc2012

## Resumen

eee_s32_last2_ilsvrc2012 es un modelo de clasificación de imágenes basado en V-MoE (Vision Mixture of Experts), desarrollado por Google Research y convertido para la librería timm por el usuario Mino1289. Se trata de un Vision Transformer (ViT) con capas de mezcla de expertos dispersa (sparse MoE) en las últimas capas, entrenado sobre el conjunto de datos ILSVRC2012 (ImageNet-1k). Cuenta con 56.999.400 parámetros totales.

El modelo resuelve tareas de clasificación de imágenes en 1.000 categorías, ofreciendo una arquitectura eficiente que activa solo una fracción de los parámetros por token, aunque el número exacto de parámetros activos no está disponible. Su relevancia radica en ser una implementación abierta (licencia Apache 2.0) de V-MoE, útil para investigación en eficiencia computacional y para aplicaciones de visión por computador que requieren un modelo ligero.

Al estar basado en V-MoE, incorpora enrutamiento disperso de expertos, lo que permite aumentar la capacidad del modelo sin incrementar proporcionalmente el coste computacional en inferencia. No es un modelo de lenguaje, por lo que no dispone de contexto textual ni capacidades multilingües.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Mixture of Experts (V-MoE) basado en Vision Transformer (ViT) |
| Parametros totales | 56.999.400 |
| Parametros activos | no disponible (modelo MoE disperso) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura V-MoE propuesta por Riquelme et al. (2021), que sustituye algunas capas feed-forward de un Vision Transformer por capas de mezcla de expertos (MoE). El sufijo "last2" sugiere que las dos últimas capas del transformer emplean MoE, aunque no se especifica el número de expertos ni la estrategia de enrutamiento (top-1, top-2, etc.). El entrenamiento se realizó sobre ILSVRC2012 (ImageNet-1k), que contiene aproximadamente 1,28 millones de imágenes de entrenamiento y 50.000 de validación, distribuidas en 1.000 clases.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de visión). La innovación principal es el uso de MoE disperso, que permite aumentar la capacidad del modelo sin incrementar proporcionalmente el coste computacional en inferencia. El preprocesamiento requiere normalizar las entradas con media y desviación estándar de 0,5 sobre valores en [0, 1], equivalente a un rango de valores (-1, 1) en JAX.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de características (embeddings) de imágenes para tareas downstream.
- Fine-tuning para dominios específicos (por ejemplo, clasificación médica, satelital o industrial).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (es un modelo de visión).
- No dispone de modo "thinking" ni capacidades de audio.
- Su capacidad especial es la arquitectura MoE dispersa, que activa solo un subconjunto de parámetros por token.

## Casos de uso

- Clasificación automática de imágenes en producción: el modelo puede integrarse en pipelines de e-commerce para etiquetar productos automáticamente, gracias a su entrenamiento en ImageNet-1k que cubre 1.000 categorías genéricas.
- Moderación de contenido visual: clasificar imágenes en categorías predefinidas para filtrar contenido inapropiado, con la ventaja de un coste computacional bajo (56,9 M de parámetros).
- Extracción de características para búsqueda visual: utilizar las representaciones internas del modelo como embeddings para sistemas de recuperación de imágenes similares.
- Fine-tuning en dominios específicos: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para reentrenar en datasets médicos, agrícolas o industriales con recursos limitados.
- Investigación en arquitecturas MoE: sirve como referencia para estudiar el comportamiento de enrutamiento disperso y comparar eficiencia frente a modelos densos.
- Despliegue en dispositivos edge: con menos de 57 M de parámetros, puede ejecutarse en GPUs de gama baja o incluso en CPU para aplicaciones de clasificación en tiempo real.
- Validación de conversiones de modelos: útil para comprobar la fidelidad de la conversión de JAX a PyTorch/timm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 ~228 MB, en FP16 ~114 MB, en INT8 ~57 MB. Con lotes pequeños, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). Para entrenamiento o fine-tuning, se recomienda al menos 4 GB.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e integrada.
- Opciones de despliegue: PyTorch, timm, ONNX Runtime, TensorRT, TorchScript, Hugging Face Transformers (a través de timm).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de rendimiento ni especificaciones de modelos comparables en la información disponible. Como alternativas de la misma categoría (clasificación de imágenes con Transformers) se podrían considerar ViT-Base, ResNet-50 o EfficientNet-B0, pero no se dispone de sus parámetros, contexto, rendimiento o licencia en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, hereda los sesgos presentes en dicho dataset (por ejemplo, desequilibrios de representación por género, etnia o geografía).
- Riesgo de alucinación: no aplica, ya que es un modelo de clasificación y no genera texto.
- Limitaciones de contexto o idioma: no aplica (modelo de visión).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveats para producción: el preprocesamiento debe seguir exactamente la normalización indicada (mean=std=(0.5, 0.5, 0.5) sobre entradas en [0, 1], equivalente a value_range=(-1, 1) en JAX). La conversión a timm puede presentar diferencias numéricas respecto a la implementación original en JAX. Al ser un modelo MoE, el enrutamiento puede añadir variabilidad en la latencia. No se especifican los tipos de cuantización soportados, por lo que se debe validar antes de usar INT8 o FP16.

## Enlaces

- HuggingFace: https://huggingface.co/Mino1289/eee_s32_last2_ilsvrc2012
- V-MoE GitHub: https://github.com/google-research/vmoe
- timm GitHub: https://github.com/huggingface/pytorch-image-models
- Fuente original del checkpoint (gs://): gs://vmoe_checkpoints/eee_s32_last2_ilsvrc2012
