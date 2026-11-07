# razz-123/colorist_densenet121_retinamnist_s265017005-16

## Resumen

Colorist DenseNet121 RetinaMNIST (seed 265017005) es un checkpoint de clasificación de imágenes médicas publicado por Sebastian Doerrich (xAILab Bamberg, Universidad de Bamberg) como parte del zoo de modelos que acompaña al artículo "Simple, Safe, and Overlooked: Reclaiming Sustainable Domain Generalization with Statistical Color Matching" (MICCAI DEMI 2026, arXiv:2608.18915). No es un modelo de lenguaje: es un clasificador visual DenseNet121 entrenado desde cero sobre el dataset RetinaMNIST para predecir cinco clases ordinales de retinopatía diabética a partir de imágenes de fondo de ojo de 224 x 224 píxeles en RGB.

La contribución metodológica del trabajo no reside en los pesos, sino en la técnica de aumento de datos *Colorist*, que no tiene parámetros: empareja los dos primeros momentos estadísticos (media y desviación típica) de cada canal de color con los de una imagen de estilo elegida al azar, aplicando un mapa afín por píxel que preserva la geometría anatómica. Este repositorio contiene el artefacto derivado, es decir, el clasificador entrenado con dicha augmentación aplicada con probabilidad 0,3.

El checkpoint es relevante como pieza reproducible de un estudio sobre generalización de dominio en imagen médica: el modelo alcanza una precisión balanceada de 0,3709 en test, frente a 0,3606 del mismo DenseNet121 entrenado sin augmentación, y forma parte de una colección de 57 checkpoints con tres semillas por configuración. Con 7.042.629 parámetros, es un modelo pequeño y ligero, pensado para investigación y validación experimental, no para despliegue clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (implementación `timm`), CNN con conexiones densas |
| Parametros totales | 7.042.629 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 x 224 RGB) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precisión de entrenamiento) |
| Idiomas soportados | en (etiqueta declarada; la tarea es clasificación de imagen, no texto) |
| Licencia | MIT (los pesos; el dataset RetinaMNIST conserva su propia licencia y no se redistribuye) |
| Formato de pesos | safetensors |
| Clases de salida | 5 (ordinales) |
| Dataset de entrenamiento | RetinaMNIST |
| Semilla | 265017005 |
| Augmentación | Colorist (emparejamiento de media-desviación RGB) con probabilidad 0,3 |
| Librería | colorist-aug |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

La arquitectura es una DenseNet121 estándar de la librería `timm`, entrenada desde cero sobre RetinaMNIST (no se parte de pesos preentrenados en ImageNet). DenseNet121 es una red convolucional con conexiones densas entre bloques: cada capa recibe como entrada las salidas de todas las capas anteriores del mismo bloque, lo que favorece la reutilización de características y reduce el número de parámetros respecto a arquitecturas equivalentes en profundidad. Con 7.042.629 parámetros, el modelo es muy compacto para los estándares actuales.

El elemento diferenciador del entrenamiento es la augmentación Colorist: para cada imagen se muestrea una imagen de estilo y se ajustan la media y la desviación típica de cada canal de color de la imagen original a las del estilo, mediante un mapa afín por píxel. Al ser una transformación puramente fotométrica, no altera la disposición espacial de las estructuras anatómicas, lo que la hace especialmente adecuada para imagen médica donde la geometría es informativa. En este checkpoint la augmentación se aplica con probabilidad 0,3. No se dispone de información sobre el número exacto de épocas, la composición detallada del dataset ni el uso de técnicas de regularización adicionales más allá de lo indicado en la model card.

## Capacidades

- Clasificación de imágenes de fondo de ojo en 5 clases ordinales de retinopatía diabética (RetinaMNIST).
- Entrada de imagen RGB de 224 x 224 píxeles con normalización específica definida en `config.json` (no usa estadísticas de ImageNet).
- Entrenado con augmentación de transferencia de color estadística (Colorist) para mejorar la robustez ante cambios fotométricos de dominio.
- Carga directa mediante `load_pretrained_classifier("retinamnist", seed=265017005)` de la librería `colorist-aug`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador visual puro.
- Capacidades multilingües: no aplica; la etiqueta `en` refleja el idioma de la documentación, no una capacidad del modelo.

## Casos de uso

- Investigación en generalización de dominio: usar el checkpoint como referencia reproducible para comparar técnicas de augmentación fotométrica frente a entrenamiento sin augmentación en RetinaMNIST (0,3709 frente a 0,3606 de precisión balanceada).
- Reproducción de experimentos del artículo: cargar el modelo con `colorist-aug` y la semilla 265017005 para replicar los resultados publicados y contrastarlos con las otras dos semillas de la colección.
- Evaluación de robustez ante cambios de color: someter el modelo a imágenes con alteraciones de iluminación, balance de blancos o coloración de cámara para medir la degradación frente a un DenseNet121 entrenado sin Colorist.
- Prototipado de pipelines de clasificación médica: servir como baseline ligero (7 millones de parámetros) en pruebas de integración de sistemas de triaje de retinopatía antes de escalar a modelos mayores.
- Docencia y experimentación con CNNs en imagen médica: el tamaño reducido y la licencia MIT permiten usarlo en entornos académicos y cuadernos de demostración sin restricciones de cómputo.
- Estudio de la técnica Colorist en otros dominios: reutilizar la receta (emparejamiento de momentos de color con probabilidad 0,3) sobre otros datasets médicos y comparar con este checkpoint como línea base.

## Benchmarks y rendimiento

Resultados publicados en la model card para RetinaMNIST (precisión balanceada en test):

| Semilla | Precisión balanceada en test |
|---|---|
| 71397589 | 0,3668 |
| 133560673 | 0,3937 |
| 265017005 (este checkpoint) | 0,3709 |
| Media de las tres semillas | 0,3771 (sd 0,0145) |
| DenseNet121 sin augmentación | 0,3606 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de clasificación de imagen. El autor advierte explícitamente que estos números deben leerse conjuntamente con las tres semillas, ya que la dispersión entre ellas es grande en los benchmarks pequeños de cambio de covariable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento (7 millones de parámetros más activaciones de un DenseNet121 a 224 x 224); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en todas las generaciones recientes e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo a través de `colorist-aug`; exportación a TorchScript u ONNX no documentada en la información disponible; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU moderna, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión balanceada en RetinaMNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Colorist DenseNet121 (este, seed 265017005) | 7.042.629 | 224 x 224 RGB | 0,3709 | MIT | Hugging Face |
| Colorist DenseNet121 (seed 71397589) | 7.042.629 | 224 x 224 RGB | 0,3668 | MIT | Hugging Face |
| Colorist DenseNet121 (seed 133560673) | 7.042.629 | 224 x 224 RGB | 0,3937 | MIT | Hugging Face |
| DenseNet121 sin augmentación (referencia del artículo) | 7.042.629 | 224 x 224 RGB | 0,3606 | MIT (código) | Referencia en paper |

No se dispone en la información proporcionada de comparaciones con otras arquitecturas (ResNet, ViT, EfficientNet) sobre RetinaMNIST ni de resultados de modelos competidores en el mismo benchmark.

## Limitaciones y advertencias

- Solo aborda cambio fotométrico: la transformación Colorist es afín por píxel y no modifica la geometría, por lo que no corrige cambios de resolución, rotación, escala ni otras variaciones geométricas de dominio.
- Artefacto de investigación: no está validado para uso clínico ni para diagnóstico; no debe emplearse en decisiones médicas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en imágenes fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; el dataset RetinaMNIST puede tener sesgos demográficos y de adquisición no descritos en la model card.
- No promediar los checkpoints de las distintas semillas: el autor mide que la media de pesos de las tres semillas colapsa a azar (0,1250 en BloodMNIST frente a 0,9844 / 0,9886 / 0,9918 individuales), porque fueron entrenados desde cero con inicializaciones distintas.
- Normalización específica: debe usarse la definida en `config.json`; las estadísticas de ImageNet no son las de entrenamiento y degradarían el rendimiento.
- Licencia: los pesos son MIT, pero el dataset RetinaMNIST conserva su propia licencia y no se redistribuye con el modelo; verificar los términos antes de uso comercial.
- El rendimiento absoluto es bajo (en torno al 37 % de precisión balanceada en 5 clases), lo que refleja la dificultad del dataset y no lo hace apto para producción sin un estudio adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razz-123/colorist_densenet121_retinamnist_s265017005-16
- Checkpoint de la misma configuración con semilla 71397589: https://huggingface.co/sdoerrich97/colorist_densenet121_retinamnist_s71397589
- Checkpoint de la misma configuración con semilla 133560673: https://huggingface.co/sdoerrich97/colorist_densenet121_retinamnist_s133560673
- Checkpoint de referencia con semilla 265017005 (autor original): https://huggingface.co/sdoerrich97/colorist_densenet121_retinamnist_s265017005
- Artículo: https://arxiv.org/abs/2608.18915
- Código: https://github.com/sdoerrich97/colorist
- Paquete PyPI: https://pypi.org/project/colorist-aug/
- Documentación de DenseNet121 en Torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.densenet121.html
