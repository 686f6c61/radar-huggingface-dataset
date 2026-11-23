# saurya-23/smids-sperm-morphology

## Resumen

SMIDS Sperm Morphology es un conjunto de dos checkpoints de clasificación de imágenes (EfficientNet-B0 y ResNet50, ambos de torchvision) entrenados para clasificar recortes de microscopía de espermatozoides teñidos en tres categorías: espermatozoide anormal, espermatozoide normal y residuo no espermático. Lo desarrollan Saurabh Uttam Mane y Neha Raut, del Departamento de Inteligencia Artificial y Ciencia de Datos del Vidyavardhini's College of Engineering and Technology (Vasai Road, Mumbai, India), como material de acompañamiento de un artículo sobre calibración y validación cruzada. El modelo resuelve un problema acotado pero relevante en análisis seminal asistido: separar morfología espermática anormal de normal sin forzar a los residuos a caer en una clase espermática, lo que reduce falsos positivos en pipelines de cribado.

Técnicamente son CNN de visión clásicas, no transformers: EfficientNet-B0 con 4,67 M de parámetros (~19 MB) y ResNet50 con 24,56 M (~98 MB). La entrada es de 224×224 píxeles y la salida es un vector de 3 logits. El interés principal no está en la arquitectura, sino en el protocolo experimental: validación cruzada estratificada de cinco pliegues, calibración con Dirichlet (que reduce el error de calibración esperado a ≈ 0,03, mientras que el temperature scaling lo empeora) y evaluación sobre un split de test de 453 imágenes no visto. EfficientNet-B0 supera a ResNet50 con aproximadamente cinco veces menos parámetros.

Es relevante ahora porque ejemplifica el patrón de modelos pequeños, especializados y calibrados para dominios médicos concretos, donde la incertidumbre calibrada importa más que el tamaño. No es un modelo de propósito general: no procesa texto, no soporta tool calling y no tiene capacidades multilingües. Su utilidad es la de un componente de visión dentro de un sistema mayor de análisis de fertilidad masculina, siempre con supervisión humana y sin valor clínico declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: EfficientNet-B0 y ResNet50 (torchvision) |
| Parametros totales | 4,67 M (EfficientNet-B0) / 24,56 M (ResNet50) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224×224×3) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX en FP32) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente textual) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, ONNX (opset 17, batch dinámico) y checkpoints PyTorch |

## Arquitectura y entrenamiento

Ambos checkpoints son redes convolucionales estándar de torchvision sin modificaciones en el backbone, a las que se sustituye la cabeza de clasificación por una capa lineal de 3 salidas. EfficientNet-B0 emplea bloques MBConv con compound scaling; ResNet50 usa bloques residuales bottleneck. La entrada se normaliza a 224×224 píxeles en float32 y la salida son logits crudos de tres clases (índices 0 `abnormal`, 1 `non_sperm`, 2 `normal`, en orden alfabético de las carpetas del dataset).

El entrenamiento se realizó sobre el dataset SMIDS (Mendeley Data, DOI 10.17632/6xvdhc9fyb.1), con un protocolo de validación cruzada estratificada de cinco pliegues sobre un pool de 2.547 imágenes (entrenamiento más validación) y un split de test independiente de 453 imágenes. Los checkpoints publicados corresponden al mejor pliegue de cada arquitectura (pliegue 5 para EfficientNet-B0, pliegue 3 para ResNet50), por lo que sus precisiones de validación de pliegue son optimistas por construcción. La innovación destacable es la calibración: se aplicó calibración de Dirichlet, que redujo el error de calibración esperado a aproximadamente 0,03, mientras que el temperature scaling estándar lo empeoró en este caso. El artículo menciona además un protocolo de entrenamiento principal con focal loss y aumento de datos cuyos resultados (ResNet50 con 87,64 % en el resumen de la Tabla III) no corresponden a estos checkpoints liberados.

## Capacidades

- Clasificación de imágenes de microscopía en tres clases: espermatozoide anormal, espermatozoide normal y residuo no espermático.
- Tratamiento explícito de la clase "no espermático", que evita que los residuos se asignen forzosamente a una clase espermática.
- Salida de probabilidades calibradas mediante Dirichlet, apta para umbrales de revisión humana.
- Inferencia por lotes con batch dinámico en el grafo ONNX.
- Ejecución sin PyTorch mediante ONNX Runtime, con diferencias frente a PyTorch inferiores a 1,5e-5 y predicciones idénticas en la muestra evaluada.
- Interfaz de línea de comandos que marca casos dudosos con la etiqueta `REVIEW` cuando la confianza es baja.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni generación.

## Casos de uso

- Cribado asistido de morfología seminal: el clasificador triaje recortes de microscopía en normal, anormal y residuo, de modo que el especialista revise primero los casos dudosos marcados como `REVIEW` en lugar de examinar todas las imágenes.
- Preprocesado de pipelines de análisis de fertilidad: eliminar residuos no espermáticos antes de contar o medir cabezas y flagelos, evitando que el debris contamine las métricas morfológicas.
- Control de calidad de captura: detectar lotes de imágenes con proporciones anómalas de residuos, lo que suele indicar problemas de tinción, enfoque o segmentación en el laboratorio.
- Investigación en reproducción asistida: generar etiquetas preliminares a gran escala sobre conjuntos de imágenes para estudios retrospectivos, con revisión humana posterior.
- Despliegue en equipos modestos: con 4,67 M de parámetros y ~19 MB, EfficientNet-B0 puede ejecutarse en CPU o en GPU de consumo dentro de un dispositivo de laboratorio o un portátil, sin infraestructura dedicada.
- Integración en aplicaciones web de demostración o formación: el Space de demostración permite a estudiantes comparar predicciones y confianzas calibradas sobre imágenes propias.
- Validación metodológica: servir como referencia reproducible de calibración y validación cruzada en dominios médicos con datasets pequeños, donde el temperature scaling no siempre es la mejor opción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Pliegue | Precisión validación de pliegue | Precisión test (453 imágenes) | F1 macro test |
|---|---|---|---|---|
| EfficientNet-B0 | 5 | 88,02 % | 85,21 % | 0,853 |
| ResNet50 | 3 | 83,10 % | 78,81 % | 0,785 |

Resultados de validación cruzada de cinco pliegues citados en la model card:

| Modelo | Precisión media CV | Desviación típica |
|---|---|---|
| EfficientNet-B0 | 85,08 % | ± 1,90 % |
| ResNet50 | 79,19 % | ± 3,20 % |

Calibración: la calibración de Dirichlet redujo el error de calibración esperado a aproximadamente 0,03; el temperature scaling lo incrementó. No se publican en la información disponible valores de ROC-AUC ni matrices de confusión numéricas, pese a que la métrica aparece en las etiquetas del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para ambos modelos; EfficientNet-B0 ronda los 19 MB de pesos y ResNet50 los 98 MB, por lo que la memoria dominante es la de activaciones y lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, L4, T4 o RTX 4090 funcionan sobradamente y quedan limitadas por el preprocesado, no por el modelo.
- GPU de consumo: cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, GTX 1650) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch con torchvision, ONNX Runtime (recomendado para producción sin dependencia de PyTorch), y cualquier servidor de inferencia compatible con ONNX. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones, no datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Precisión test | Licencia |
|---|---|---|---|---|---|
| EfficientNet-B0 (este repo) | 4,67 M | 224×224 | 3 clases de morfología espermática | 85,21 % | CC BY 4.0 |
| ResNet50 (este repo) | 24,56 M | 224×224 | 3 clases de morfología espermática | 78,81 % | CC BY 4.0 |
| EfficientNet-B0 (ImageNet) | 5,3 M | 224×224 | 1.000 clases genéricas | no aplica | BSD-like (torchvision) |
| ResNet50 (ImageNet) | 25,6 M | 224×224 | 1.000 clases genéricas | no aplica | BSD-like (torchvision) |

No se dispone de información sobre otros clasificadores públicos de morfología espermática con los que comparar directamente; los backbones preentrenados en ImageNet se incluyen solo como referencia de arquitectura y tamaño, no como alternativas funcionales.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: los modelos no son dispositivos médicos y no han sido validados clínicamente; no deben emplearse para diagnóstico ni para decisiones de tratamiento.
- Entrenados sobre un único dataset (SMIDS) con un protocolo concreto de tinción y microscopía; el rendimiento puede degradarse con otras tinciones, aumentos, cámaras o condiciones de iluminación.
- El split de test es pequeño (453 imágenes), por lo que los intervalos de confianza de las métricas son amplios y no se publican.
- Los checkpoints liberados son el mejor pliegue de cada arquitectura, lo que hace optimistas las cifras de validación de pliegue; las cifras honestas son las de test.
- La calibración de Dirichlet reduce el error de calibración esperado, pero no corrige sesgos de clase ni desequilibrios del dataset.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de clasificaciones erróneas con alta confianza en imágenes fuera de distribución (artefactos, células de otro tipo, imágenes desenfocadas).
- El orden de etiquetas es alfabético y la model card advierte de que los nombres de columna del script original de validación cruzada no coinciden con ese orden; un error de mapeo invertiría las clases normal y anormal en producción.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero la ausencia de validación clínica limita de facto su uso en productos sanitarios regulados.
- No hay soporte multilingüe ni de texto: cualquier capa de explicación o informes debe implementarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saurya-23/smids-sperm-morphology
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/saurya-23/smids-sperm-morphology-demo
- Dataset SMIDS (Mendeley Data): https://doi.org/10.17632/6xvdhc9fyb.1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Artículo asociado: "Calibration and Cross-Validation of ResNet50 and EfficientNet-B0 for Three-Class Sperm Morphology Classification", Saurabh Uttam Mane y Neha Raut; enlace de publicación no disponible en la información proporcionada.
