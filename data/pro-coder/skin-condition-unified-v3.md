# Pro-Coder/skin-condition-unified-v3

## Resumen

skin-condition-unified-v3 es un modelo de clasificación de imágenes dermatológicas desarrollado por el usuario Pro-Coder. Se trata de un fine-tuning del backbone ConvNeXt-Base preentrenado en ImageNet-22k (`facebook/convnext-base-224-22k`), adaptado a la tarea de clasificar condiciones cutáneas a partir de imágenes dermatoscópicas. El modelo resuelve un problema acotado: la categorización automática de lesiones cutáneas, con especial atención a tres clases de interés clínico (melanoma, queratosis actínica y carcinoma basocelular) dentro del conjunto de datos HAM10000.

Con 87,59 millones de parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto que puede ejecutarse en hardware modesto. La model card está generada automáticamente por el Trainer de Hugging Face y no incluye descripción de uso previsto, composición del dataset ni limitaciones, lo que reduce la trazabilidad del entrenamiento. La licencia Apache 2.0 facilita su reutilización, pero la ausencia de documentación clínica y de validación externa limita seriamente su uso en entornos reales.

El modelo declara métricas de evaluación sobre un conjunto no especificado: accuracy de 0,8269, F1 macro de 0,7457 y recalls por clase de 0,8088 (melanoma), 0,925 (queratosis actínica) y 0,918 (carcinoma basocelular). Estos datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Base (CNN pura con bloques ConvNeXt), fine-tuning de `facebook/convnext-base-224-22k` |
| Parámetros totales | 87.592.089 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt-Base, una red convolucional pura que moderniza el diseño de ResNet incorporando elementos propios de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y estructura de bloques invertidos). El backbone se inicializa desde `facebook/convnext-base-224-22k`, preentrenado en ImageNet-22k, y se fine-tunea para clasificación de condiciones cutáneas. La resolución de entrada es 224x224 píxeles.

El entrenamiento se realizó con el Trainer de Hugging Face durante 15 épocas, con batch total de 32 (batch 16 × acumulación de gradientes 2), learning rate de 5e-05, optimizador AdamW fused, scheduler coseno con 1029 pasos de warmup, seed 42 y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no se especifica en la model card ("None dataset"), aunque las métricas por clase hacen referencia explícita a HAM10000. No se documenta el número de tokens ni la composición exacta del dataset, ni si hubo aumento de datos, balanceo de clases o validación cruzada.

## Capacidades

- Clasificación de imágenes dermatoscópicas en categorías de condiciones cutáneas.
- Métricas desglosadas para tres clases de interés clínico: melanoma, queratosis actínica y carcinoma basocelular.
- Inferencia compatible con la pipeline `image-classification` de Transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.
- No dispone de capacidades multilingües, de audio ni de visión generalista más allá de la clasificación entrenada.

## Casos de uso

- Triaje preliminar de lesiones cutáneas en herramientas de apoyo a la decisión: el modelo puede clasificar imágenes dermatoscópicas en las categorías aprendidas y servir como primera señal para derivar casos sospechosos a revisión dermatológica. Requiere validación clínica previa a cualquier uso real.
- Investigación en visión artificial médica: útil como baseline reproducible para experimentos de clasificación de HAM10000, comparando arquitecturas CNN frente a transformers en tareas dermatológicas.
- Prototipado de aplicaciones de teledermatología: integrable vía pipeline de Transformers en un servicio que reciba imágenes y devuelva la clase predicha con su puntuación, siempre con supervisión humana.
- Docencia y formación: ejemplo práctico de fine-tuning de ConvNeXt con el Trainer de Hugging Face sobre un dataset médico desbalanceado.
- Análisis de sesgo y robustez: permite estudiar el comportamiento del modelo por clase (recall de melanoma frente a queratosis actínica) y detectar desequilibrios en la matriz de confusión.
- Filtrado o priorización en pipelines de imagen médica: como etapa de clasificación previa a un modelo más complejo o a una revisión manual, aprovechando su bajo coste computacional (87,6 M de parámetros, 0,4 GB).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 1,1323 |
| Accuracy | 0,8269 |
| F1 macro | 0,7457 |
| Recall melanoma (HAM10000 dermatoscópico) | 0,8088 |
| Recall queratosis actínica (HAM10000 dermatoscópico) | 0,925 |
| Recall carcinoma basocelular (HAM10000 dermatoscópico) | 0,9180 |

Evolución del entrenamiento (selección de épocas):

| Época | Validation loss | Accuracy | F1 macro |
|---|---|---|---|
| 1 | 1,6544 | 0,6001 | 0,4260 |
| 5 | 1,2689 | 0,7633 | 0,6737 |
| 10 | 1,1494 | 0,8187 | 0,7302 |
| 15 | 1,1312 | 0,8277 | 0,7471 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores, que proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,35 GB para los pesos; en FP16, unos 0,18 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y también en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline `image-classification` de Transformers, TGI (con soporte de visión), ONNX Runtime, TorchScript o exportación a TensorRT para latencia mínima.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna y throughput alto en batch, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| skin-condition-unified-v3 | 87,6 M | Clasificación dermatológica (HAM10000) | Apache 2.0 | Hugging Face |
| ConvNeXt-Base (ImageNet-22k) | 88,6 M | Clasificación general de imágenes | CC BY-NC 4.0 (según versión) | Hugging Face |
| ViT-Base/16 (ImageNet-21k) | 86 M | Clasificación general de imágenes | Apache 2.0 | Hugging Face |
| Modelos dermatológicos especializados en HAM10000 | variable | Clasificación dermatológica | variable | variable |

No se dispone de datos comparativos de rendimiento frente a alternativas dermatológicas específicas en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, el uso previsto ni las limitaciones: la trazabilidad es mínima.
- Las métricas declaradas no han sido verificadas de forma independiente y el conjunto de evaluación no se especifica.
- Riesgo elevado de alucinación en el sentido de falsos negativos y falsos positivos en clases no representadas en las métricas (solo se reportan tres clases).
- No es un dispositivo médico: no debe usarse para diagnóstico clínico sin validación regulatoria y supervisión profesional.
- El F1 macro (0,7457) es notablemente inferior a la accuracy (0,8269), lo que sugiere desequilibrio de clases y rendimiento desigual entre categorías.
- No se documentan sesgos demográficos, de tono de piel ni de origen de las imágenes; HAM10000 tiene sesgos conocidos de representación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación clínica traslada toda la responsabilidad al integrador.
- No soporta texto, código, tool calling ni agentes: su ámbito es exclusivamente la clasificación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pro-Coder/skin-condition-unified-v3
- Modelo base: https://huggingface.co/facebook/convnext-base-224-22k
- Dataset HAM10000 (referenciado en las métricas): https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- Documentación de ConvNeXt en Transformers: https://huggingface.co/docs/transformers/model_doc/convnext
