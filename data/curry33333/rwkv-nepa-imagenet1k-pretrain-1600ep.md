# Curry33333/rwkv-nepa-imagenet1k-pretrain-1600ep

## Resumen

El modelo `Curry33333/rwkv-nepa-imagenet1k-pretrain-1600ep` es un checkpoint de preentrenamiento del modelo RWKV-NEPA, una adaptación de la arquitectura recurrente RWKV al dominio de la visión por computador. Desarrollado por el usuario Curry33333, este repositorio contiene los pesos finales tras 1600 épocas de entrenamiento autosupervisado sobre el conjunto de datos ImageNet-1K. El objetivo principal es proporcionar un encoder visual preentrenado que pueda servir como base para tareas downstream como clasificación, detección o segmentación, aunque el propio autor aclara que no se trata de un modelo afinado para clasificación de ImageNet.

La arquitectura se define como `RwkvNepaForPreTraining` con 12 capas, un tamaño oculto de 768 y un tamaño de parche de 14 píxeles sobre imágenes de 224×224. El contexto de 257 tokens sugiere que la imagen se divide en 256 parches más un token especial. El checkpoint final se denomina `checkpoint-500800` y el repositorio incluye únicamente los pesos en formato `safetensors` y el archivo de configuración, sin optimizadores ni estados de entrenamiento.

La relevancia de este modelo radica en explorar alternativas a los transformers puros para visión, utilizando una arquitectura recurrente que podría ofrecer ventajas en eficiencia de memoria y procesamiento secuencial. Sin embargo, al ser un trabajo en fase de preentrenamiento y sin documentación adicional sobre el objetivo de entrenamiento exacto, su utilidad práctica queda condicionada a la disponibilidad del código de implementación correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RwkvNepaForPreTraining (variante de RWKV para vision) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 257 tokens (256 parches + token especial) |
| Tipos de cuantizacion | no disponible (pesos en float32 segun configuracion de entrenamiento) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RWKV-NEPA es una adaptación de la arquitectura RWKV (Receptance Weighted Key Value), originalmente diseñada para procesamiento de lenguaje, al dominio visual. La configuración indica 12 capas, tamaño oculto de 768 y parcheo de imágenes de 224×224 en parches de 14×14, generando 256 tokens de entrada más un token adicional hasta alcanzar 257. El modelo se entrena con un objetivo de preentrenamiento autosupervisado (no especificado en detalle), donde la pérdida bruta (raw loss) media alcanza -0.9919, un valor cercano a -1 que el autor interpreta como señal de buen ajuste al objetivo.

El entrenamiento se realizó durante 1600 épocas sobre ImageNet-1K con un tamaño de lote global de 4096, usando el optimizador AdamW fusionado, una tasa de aprendizaje inicial de 4.8e-3 con decaimiento coseno y un calentamiento del 2.5%. La precisión fue float32 con TF32 activado. Se emplearon 4 GPUs NVIDIA A800. No se proporcionan detalles sobre el tipo de aumento de datos, la función de pérdida concreta ni el proceso de tokenización visual más allá del parcheo.

## Capacidades

- Encoder visual preentrenado: extrae representaciones de características de imágenes de 224×224 píxeles.
- Preentrenamiento autosupervisado: diseñado para aprender representaciones generales sin etiquetas, susceptible de transferencia a tareas supervisadas.
- Arquitectura recurrente: a diferencia de los transformers, procesa secuencias de tokens con un mecanismo de estado recurrente, lo que podría reducir el coste de atención cuadrático.
- Sin capacidades de generación de texto, tool calling, agentes o razonamiento multimodal: el modelo es exclusivamente visual y no incluye módulos de lenguaje.
- No se ha verificado su rendimiento en tareas concretas como clasificación, detección o segmentación, ya que no se han publicado evaluaciones downstream.

## Casos de uso

- Inicialización para clasificación de imágenes: se puede tomar el checkpoint y añadir una cabeza de clasificación lineal o MLP, afinando el modelo completo o solo la cabeza sobre conjuntos como CIFAR-10 o ImageNet-1K. La representación preentrenada debería acelerar la convergencia y mejorar la precisión frente a una inicialización aleatoria, aunque no hay métricas que lo confirmen.
- Extracción de características para recuperación de imágenes: al ser un encoder, puede generar embeddings de imágenes para sistemas de búsqueda visual por similitud, siempre que se ajuste a la resolución de entrada esperada (224×224).
- Preentrenamiento continuado en dominios específicos: el checkpoint puede servir como punto de partida para continuar el entrenamiento autosupervisado en datasets más pequeños o especializados (médicos, satelitales, etc.), aprovechando el conocimiento general de ImageNet.
- Backbone para detección de objetos: aunque no se ha probado, la arquitectura podría integrarse en frameworks como Faster R-CNN o DETR si se adapta el código de RWKV-NEPA para extraer mapas de características multiescala.
- Segmentación semántica: similar al caso anterior, el encoder podría usarse como columna vertebral en arquitecturas tipo U-Net o SegFormer, previa adaptación del código.
- Investigación en arquitecturas recurrentes para visión: el modelo es un banco de pruebas para estudiar el comportamiento de RWKV en tareas visuales, comparando su eficiencia y rendimiento frente a ViT o CNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida media de preentrenamiento (-0.9919 ± 0.00007), que no es comparable con métricas estándar como precisión en ImageNet, mAP o F1.

## Requisitos de hardware

- El tamaño del repositorio es de 0.4 GB, lo que sugiere un modelo relativamente pequeño (probablemente del orden de decenas de millones de parámetros, aunque no se confirma).
- Para inferencia, un modelo de estas dimensiones puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 con 12 GB de VRAM, o incluso en CPU para inferencia por lotes pequeños, aunque no se especifican requisitos oficiales.
- El entrenamiento original utilizó 4 GPUs NVIDIA A800, pero para uso en inferencia o fine-tuning se requeriría al menos una GPU con suficiente memoria para el lote deseado.
- No se dispone de información sobre latencia o throughput. Se recomienda probar con frameworks como PyTorch, aunque la implementación personalizada de RWKV-NEPA puede limitar la compatibilidad con herramientas estándar como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de visión preentrenados (como ViT, Swin o ConvNeXt) porque no se conocen los parámetros totales ni los resultados en benchmarks. La arquitectura RWKV es poco común en visión, por lo que no hay alternativas directas de la misma familia. Se indica como no disponible.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo afinado para ninguna tarea concreta. No puede usarse directamente para clasificación de imágenes sin un paso de fine-tuning.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial o la redistribución de los pesos.
- No se documenta el objetivo de preentrenamiento exacto (p. ej., masked image modeling, contrastive learning, etc.), lo que dificulta interpretar la calidad de las representaciones.
- El código necesario para cargar el modelo no está incluido en el repositorio; se requiere la implementación personalizada de RWKV-NEPA del autor, que no se ha publicado en este espacio.
- No hay información sobre sesgos o alucinaciones, al ser un modelo visual sin generación de texto, pero los sesgos de ImageNet-1K (predominio de categorías occidentales) pueden transferirse a las representaciones.
- El entrenamiento se realizó en float32 con TF32, pero los pesos se guardan en safetensors; no se indica si se pueden cuantizar a formatos como FP16 o INT8 para despliegue eficiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Curry33333/rwkv-nepa-imagenet1k-pretrain-1600ep
- No se han encontrado otros enlaces (papers, blogs, repositorios de código) en la información proporcionada.
