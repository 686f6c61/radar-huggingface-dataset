# razz-123/colorist_densenet121_dermamnist_s133560673-13

## Resumen

Colorist es un checkpoint de clasificación de imágenes médicas desarrollado por Sebastian Doerrich (xAILab Bamberg, Universidad de Bamberg) como parte del zoo de modelos que acompaña al artículo "Simple, Safe, and Overlooked: Reclaiming Sustainable Domain Generalization with Statistical Color Matching" (MICCAI DEMI 2026, arXiv:2608.18915). Se trata de un DenseNet121 entrenado desde cero sobre DermaMNIST, un conjunto de dermatoscopias con 7 clases, aplicando durante el entrenamiento una aumentación sin parámetros llamada Colorist que iguala los dos primeros momentos estadísticos de cada canal de color a los de una imagen de estilo aleatoria.

El interés del modelo no reside en su rendimiento absoluto, sino en que sirve como artefacto reproducible para estudiar generalización de dominio en imágenes médicas mediante aumentación fotométrica. El checkpoint concreto corresponde a la semilla 133560673 y alcanza una balanced accuracy de test de 0,5242 sobre DermaMNIST, ligeramente por encima de la media de las tres semillas publicadas (0,5180) y en línea con el mismo DenseNet121 entrenado sin aumentación (0,5186).

El modelo tiene 7.044.679 parámetros, entrada RGB de 224×224, licencia MIT y se distribuye en formato safetensors a través de la librería `colorist-aug`. Es un artefacto de investigación, no validado para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (implementación `timm`), entrenada desde cero |
| Parametros totales | 7.044.679 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada 224×224 RGB) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un DenseNet121 estándar de `timm` entrenado desde cero sobre DermaMNIST, un subconjunto de MedMNIST con 7 clases de lesiones dermatológicas e imágenes RGB de 224×224. La innovación no está en la arquitectura, sino en el pipeline de aumentación: Colorist es una transformación sin parámetros que, para cada imagen, muestrea una imagen de estilo y aplica un mapeo afín por píxel que iguala la media y la desviación estándar de cada canal de color a las de la imagen de estilo. Al ser afín por píxel, preserva la estructura anatómica y espacial de la lesión, y solo altera la distribución fotométrica.

En este checkpoint concreto la aumentación se aplicó con probabilidad 0,3 usando igualación de media y desviación estándar en RGB. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni uso de RLHF/DPO (no aplicable en un clasificador de imágenes). El preprocesado debe seguir la normalización indicada en `config.json`; el autor advierte explícitamente que no se usaron estadísticas de ImageNet.

## Capacidades

- Clasificación de imágenes dermatológicas en 7 clases sobre DermaMNIST.
- Entrada RGB de 224×224 píxeles, salida multiclase.
- Entrenamiento con aumentación Colorist (igualación de momentos de color) con probabilidad 0,3.
- Reproducibilidad por semilla: el checkpoint corresponde a la semilla 133560673.
- Integración con la librería `colorist-aug` mediante `load_pretrained_classifier("dermamnist", seed=133560673)`.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües más allá de etiquetas en inglés.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en generalización de dominio: usar el checkpoint como referencia para comparar aumentaciones fotométricas frente a entrenamiento sin aumentación (0,5186) sobre DermaMNIST, con tres semillas publicadas para estimar varianza.
- Reproducción de resultados del artículo: cargar el modelo con `colorist-aug[weights]` y evaluar balanced accuracy sobre el split de test de DermaMNIST para verificar los 0,5242 reportados.
- Estudio de robustez a cambios de color: aplicar perturbaciones fotométricas controladas a imágenes dermatoscópicas y medir la degradación del clasificador, aprovechando que Colorist solo modela shift fotométrico.
- Baseline en pipelines de clasificación médica: servir como punto de partida de bajo coste (7M parámetros) para comparar con arquitecturas más grandes en tareas de dermatología.
- Análisis de sensibilidad a la semilla: evaluar la dispersión entre las tres semillas publicadas (0,5154 / 0,5242 / 0,5145) para dimensionar la incertidumbre en benchmarks pequeños con covariate shift.
- Docencia y divulgación: ejemplo mínimo y reproducible de aumentación sin parámetros y de evaluación con balanced accuracy en datos médicos desbalanceados.
- Validación de pipelines de carga: comprobar la integración de `colorist-aug` y la normalización específica del `config.json` antes de desplegar modelos mayores del mismo zoo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre DermaMNIST (balanced accuracy de test):

| Modelo / configuración | Semilla | Balanced accuracy |
|---|---|---|
| Colorist + DenseNet121 | 71397589 | 0,5154 |
| Colorist + DenseNet121 | 133560673 (este checkpoint) | 0,5242 |
| Colorist + DenseNet121 | 265017005 | 0,5145 |
| Colorist + DenseNet121 (media de semillas) | — | 0,5180 (sd 0,0054) |
| DenseNet121 sin aumentación | — | 0,5186 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 7M parámetros y entrada 224×224; holgadamente por debajo de 2 GB con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `colorist-aug`; exportación a TorchScript u ONNX no documentada en la información disponible; vLLM, llama.cpp y Ollama no aplican (no es un modelo de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento DermaMNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Colorist DenseNet121 (este) | 7.044.679 | 224×224 RGB | 0,5242 (semilla 133560673); 0,5180 media | MIT | Hugging Face, `colorist-aug` |
| DenseNet121 sin aumentación | ~7M | 224×224 RGB | 0,5186 | no disponible | referencia del paper |
| DenseNet121 + eliminación de artefactos de pelo (proyecto Melanoma) | no disponible | imágenes dermatoscópicas | no disponible | no disponible | GitHub público |

La comparación con otros clasificadores dermatológicos publicados no está disponible en la información proporcionada; los dos proyectos de GitHub encontrados en la búsqueda web abordan clasificación de melanoma con DenseNet121 y XAI, pero no reportan métricas comparables en la información disponible.

## Limitaciones y advertencias

- Solo cubre shift fotométrico: la transformación es afín por píxel y no altera geometría ni resolución, por lo que no mitiga shifts geométricos o de resolución.
- Artefacto de investigación: no validado para uso clínico ni para diagnóstico.
- Los datos de entrenamiento (DermaMNIST) mantienen su propia licencia y no se redistribuyen; la licencia MIT cubre los pesos, no el dataset.
- No se deben promediar los checkpoints de las tres semillas: están entrenados desde cero con inicializaciones distintas y el promedio de pesos colapsa a azar (0,1250 en BloodMNIST frente a 0,9844–0,9918 por semilla).
- Cada número del paper es una media sobre tres semillas; leer una sola semilla de forma aislada puede inducir a error, especialmente en benchmarks pequeños con covariate shift.
- El rendimiento absoluto es bajo (balanced accuracy ~0,52 sobre 7 clases), lo que refleja la dificultad de DermaMNIST más que la calidad del método.
- Normalización específica en `config.json`: usar estadísticas de ImageNet produce resultados incorrectos.
- Riesgo de alucinación no aplica (no es un modelo generativo); el riesgo relevante es la clasificación errónea silenciosa en contextos clínicos.
- Sesgos: no documentados en la información disponible; al entrenar sobre DermaMNIST hereda los sesgos de composición y etiquetado de ese dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razz-123/colorist_densenet121_dermamnist_s133560673-13
- Checkpoint de la semilla 71397589: https://huggingface.co/sdoerrich97/colorist_densenet121_dermamnist_s71397589
- Checkpoint de la semilla 133560673 (original del autor): https://huggingface.co/sdoerrich97/colorist_densenet121_dermamnist_s133560673
- Checkpoint de la semilla 265017005: https://huggingface.co/sdoerrich97/colorist_densenet121_dermamnist_s265017005
- Paper (arXiv): https://arxiv.org/abs/2608.18915
- Código: https://github.com/sdoerrich97/colorist
- Paquete PyPI: https://pypi.org/project/colorist-aug/
- Proyecto relacionado (DenseNet121 + XAI para melanoma): https://github.com/punitgarg00/Explainable-Skin-Cancer-Classification-Using-Hair-Artifact-Removal-and-DenseNet121
