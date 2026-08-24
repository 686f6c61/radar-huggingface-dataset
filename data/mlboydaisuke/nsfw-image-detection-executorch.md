# mlboydaisuke/nsfw-image-detection-ExecuTorch

## Resumen

El modelo `mlboydaisuke/nsfw-image-detection-ExecuTorch` es una exportación a ExecuTorch del clasificador de imágenes `Falconsai/nsfw_image_detection`, un Vision Transformer (ViT-Base/16) de 86 millones de parámetros que clasifica imágenes en dos categorías: `normal` y `nsfw`. El autor, mlboydaisuke, ha convertido el modelo original a formato `.pte` (ExecuTorch) con varias variantes de cuantización (fp32, fp16, int8 dinámico y Core ML) para permitir la inferencia en dispositivos móviles y de borde sin necesidad de enviar las imágenes a un servidor, lo que preserva la privacidad del usuario.

La relevancia de este modelo radica en su capacidad para ejecutar moderación de contenido NSFW directamente en el dispositivo, con tiempos de inferencia muy bajos en hardware Apple (4.3 ms en Mac arm64 con Core ML) y tamaños de archivo que van desde 88.9 MB (int8) hasta 343.4 MB (fp32). El modelo base fue fine-tuneado por Falconsai sobre un dataset propio de 80.000 imágenes, y esta versión ExecuTorch ha sido verificada para mantener fidelidad al modelo fp32 original mediante un análisis de margen en la frontera de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), 12 capas, hidden size 768 |
| Parametros totales | 86 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 224x224 píxeles) |
| Tipos de cuantizacion | fp32, fp16, int8 dinámico, Core ML (fp16) |
| Idiomas soportados | no disponible (modelo de visión, sin texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK para CPU, Core ML para iOS) |

## Arquitectura y entrenamiento

El modelo base `Falconsai/nsfw_image_detection` es un Vision Transformer (ViT-Base/16) preentrenado en ImageNet-21k y fine-tuneado por Falconsai en un dataset propio de 80.000 imágenes con variabilidad sustancial, según la información disponible en fuentes externas. La arquitectura procesa imágenes RGB de 224x224 píxeles, normalizadas con media y desviación estándar de 0.5, y produce logits de dos clases (0=normal, 1=nsfw). La versión ExecuTorch no introduce cambios en la arquitectura, sino que exporta los pesos a formato `.pte` con diferentes niveles de cuantización para optimizar la inferencia en dispositivos.

El proceso de exportación incluye una verificación de paridad entre las variantes cuantizadas y el modelo fp32 original. Para ello, se camina a lo largo del gradiente del margen de clase hasta que el margen cruza cero, y se mide el desplazamiento del margen en ese punto. Los resultados muestran que todas las variantes mantienen un desplazamiento menor que la distancia mínima de las imágenes de prueba al límite de decisión (7.88 logits), lo que garantiza que no se producen cambios de etiqueta en el conjunto de validación. No se aplicaron técnicas de RLHF o DPO, ya que se trata de un clasificador de imágenes.

## Capacidades

- Clasificación binaria de imágenes: distingue entre contenido `normal` y `nsfw` (no seguro para el trabajo).
- Inferencia en dispositivo (on-device) mediante ExecuTorch con backend XNNPACK (CPU portable) y Core ML (Apple Silicon).
- Cuatro variantes de cuantización: fp32 (343.4 MB), fp16 (173.1 MB), int8 dinámico (88.9 MB) y Core ML fp16 (172.1 MB), lo que permite elegir entre precisión y tamaño.
- Salida en formato logits [1, 2]; la aplicación de softmax queda a cargo del llamador.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente visual.

## Casos de uso

- Moderación de contenido en aplicaciones móviles: el modelo puede filtrar imágenes subidas por usuarios directamente en el dispositivo, evitando el envío a servidores y reduciendo la latencia. Su tamaño reducido (88.9 MB en int8) lo hace adecuado para integración en apps de iOS y Android.
- Control parental en dispositivos infantiles: analiza fotos almacenadas o recibidas en el dispositivo del menor, bloqueando contenido inapropiado sin depender de una conexión a internet.
- Filtrado en tiempo real en aplicaciones de mensajería: al ejecutarse localmente, puede clasificar imágenes entrantes antes de mostrarlas al usuario, con una latencia de 4.3 ms en hardware Apple (Core ML) o 31.5 ms en CPU (int8).
- Clasificación de galerías locales: permite etiquetar automáticamente fotos en el almacenamiento del dispositivo para separar contenido sensible, manteniendo la privacidad.
- Pipelines de moderación híbrida: combina la detección on-device como primer filtro con una revisión en servidor solo para casos ambiguos, reduciendo costes de ancho de banda y computación.
- Aplicaciones de archivo y cumplimiento: en entornos corporativos o legales, el modelo puede clasificar imágenes en dispositivos de borde para detectar material NSFW sin transferir datos confidenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque se trata de un clasificador de imágenes, no de un modelo de lenguaje. La model card proporciona datos de rendimiento de inferencia en un Mac arm64 (mediana de 10 ejecuciones, proceso único):

| Variante | Tamaño (MB) | Latencia Mac (ms) | Margin shift en frontera (logits) |
|---|---|---|---|
| fp32 (XNNPACK) | 343.4 | 41.8 | 0.0001 |
| fp16 (XNNPACK) | 173.1 | 71.4 | 0.0168 |
| int8 dinámico (XNNPACK) | 88.9 | 31.5 | 1.4795 |
| Core ML fp16 (iOS) | 172.1 | 4.3 | 0.2215 |

Para referencia, PyTorch eager fp32 en la misma máquina tarda 38.3 ms, por lo que la versión Core ML es 8.9 veces más rápida que eager. La verificación de paridad se realizó sobre 24 fotografías normales, todas clasificadas como `normal` con probabilidad 1.000 en fp32, y todas las variantes reprodujeron ese resultado con correlación 1.000000. El margin shift indica el desplazamiento máximo del margen de decisión en el punto donde el margen cruza cero; todos los valores son inferiores a la distancia mínima de las imágenes de prueba al límite (7.88 logits), lo que garantiza que ninguna imagen del conjunto de validación cambiaría de etiqueta.

## Requisitos de hardware

- Inferencia en CPU mediante XNNPACK (portable) y en Apple Neural Engine / GPU mediante Core ML.
- Tamaños de archivo: fp32 343.4 MB, fp16 173.1 MB, int8 88.9 MB, Core ML 172.1 MB. La variante int8 cabe en dispositivos con poca memoria.
- No se especifica VRAM, pero al ser un modelo de visión de 86M parámetros, puede ejecutarse en GPUs de consumo (p. ej., RTX 3060 con 6 GB) y en móviles con al menos 1 GB de RAM disponible.
- Opciones de despliegue: ExecuTorch runtime (C++/Python), Core ML para iOS, y potencialmente vLLM u otros frameworks no aplican al ser un modelo de visión.
- Latencia estimada: 4.3 ms en Mac arm64 con Core ML, 31.5 ms con int8 en CPU, 41.8 ms con fp32 en CPU. En dispositivos móviles reales puede variar, pero se espera que sea inferior a 100 ms en hardware moderno.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección NSFW en la documentación proporcionada. El modelo original `Falconsai/nsfw_image_detection` es la base, y existen versiones cuantizadas de otros autores (por ejemplo, `jdp8/nsfw_image_detection`), pero no se han publicado datos de rendimiento o precisión que permitan una comparación rigurosa. Se recomienda evaluar el modelo en el conjunto de datos específico de la aplicación antes de elegir entre variantes.

## Limitaciones y advertencias

- La model card advierte explícitamente que la verificación realizada solo confirma la fidelidad al modelo fp32, no la precisión del modelo en sí sobre la clase `nsfw`. El conjunto de validación contiene únicamente imágenes `normal`, por lo que no se ha probado el comportamiento con contenido NSFW real.
- El margin shift en la variante int8 es de 1.4795 logits, lo que puede provocar discrepancias con el modelo fp32 en imágenes cercanas al límite de decisión. Si la aplicación requiere máxima precisión en casos límite, se recomienda usar fp32 o Core ML.
- El modelo es binario y puede producir falsos positivos o falsos negativos, especialmente con imágenes ambiguas o de baja calidad.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de Falconsai, podría tener sesgos hacia ciertos tipos de contenido o demografías.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso previsto cumple con las leyes locales sobre contenido NSFW y protección de menores.
- No se proporcionan métricas de precisión, recall o AUC sobre conjuntos de referencia públicos, por lo que el rendimiento real en producción debe evaluarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/nsfw-image-detection-ExecuTorch
- Colección ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Repositorio de conversión (executorch-models): https://github.com/john-rocky/executorch-models
- Página del producto Falcons.ai (modelo original): https://falcons.ai/products/nsfw-image-detection
