# lazy-toad/resnet-imagenette

## Resumen

El modelo `lazy-toad/resnet-imagenette` es un clasificador de imágenes basado en una arquitectura ResNet personalizada, entrenado desde cero por el usuario lazy-toad como proyecto de aprendizaje. Está diseñado para clasificar imágenes en las 10 clases del dataset Imagenette, una subdivisión de ImageNet con 10 categorías fáciles de distinguir (por ejemplo, perro, gato, paracaídas, etc.). El modelo se entrenó durante 30 épocas con imágenes de 320x320 píxeles y alcanza una precisión de validación del 88,01%.

Aunque no se especifica el número exacto de parámetros, al ser un ResNet personalizado para 10 clases, se trata de un modelo relativamente pequeño, adecuado para ejecutarse en hardware modesto. La licencia MIT permite su uso comercial sin restricciones, pero al ser un proyecto de aprendizaje, no está optimizado para producción ni cuenta con soporte técnico. Su relevancia radica en ser un ejemplo práctico de entrenamiento de una red convolucional desde cero, útil para fines educativos o como punto de partida para experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet personalizado (clasificador de 10 clases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ResNet personalizada, aunque no se detallan el número de capas ni el ancho de las mismas. Se entrenó desde cero sobre el dataset Imagenette (versión de 320 píxeles), que contiene 9.469 imágenes de entrenamiento, 1.309 de validación y 2.616 de prueba, repartidas en 10 clases. El entrenamiento duró 30 épocas con una pérdida final de 0,191 y una precisión de validación máxima del 88,01% (en la época 29). No se mencionan técnicas de aumento de datos, regularización ni ajuste de hiperparámetros más allá de las curvas de pérdida y precisión proporcionadas.

El proceso de entrenamiento es un ejemplo clásico de aprendizaje supervisado para clasificación de imágenes, sin innovaciones técnicas destacables. El checkpoint se guarda en formato PyTorch y se carga mediante `torch.load`, aunque el código de ejemplo en la model card asume que la clase `ResNet` está definida externamente, lo que puede dificultar su reproducción directa.

## Capacidades

- Clasificacion de imagenes en 10 clases (Imagenette: perro, gato, paracaidas, etc.).
- Inferencia con imagenes de entrada de 320x320 píxeles.
- Soporte de batch processing mediante PyTorch (el checkpoint se carga con `load_state_dict`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales (solo vision).
- No es un modelo de lenguaje, por lo que no tiene capacidades de generacion de texto ni multilingues.

## Casos de uso

- Prototipado rapido de clasificacion de imagenes: el modelo puede integrarse en un pipeline de vision artificial para validar conceptos en entornos academicos o de investigacion, gracias a su tamano reducido y facilidad de carga.
- Educacion y aprendizaje: sirve como ejemplo didactico de como entrenar una ResNet desde cero en un dataset pequeno, permitiendo a estudiantes comprender el flujo de trabajo completo (preparacion de datos, entrenamiento, evaluacion).
- Experimentacion con tecnicas de fine-tuning: al ser un checkpoint de PyTorch, se puede cargar y ajustar con otras arquitecturas o datasets, aunque no se recomienda para produccion.
- Demo de inferencia en CPU: al ser un modelo pequeno, puede ejecutarse en maquinas sin GPU, lo que facilita su despliegue en entornos con recursos limitados.
- Base para comparar con modelos preentrenados: se puede utilizar para comparar el rendimiento de un modelo entrenado desde cero frente a modelos ResNet preentrenados en ImageNet, evaluando la diferencia en precision y velocidad.
- Integracion en aplicaciones de escritorio o web: mediante la exportacion a ONNX o TorchScript, podria servir en aplicaciones ligeras de clasificacion de imagenes, aunque no hay documentacion oficial al respecto.

## Benchmarks y rendimiento

El unico dato de rendimiento proporcionado es la precision de validacion durante el entrenamiento. No se han publicado resultados comparativos con otros modelos en la informacion disponible. La tabla siguiente muestra la evolucion de la perdida y la precision de validacion por epoca:

| Epoca | Loss | Val Acc |
|-------|------|---------|
| 1 | 1.885 | 0.4293 |
| 2 | 1.419 | 0.5714 |
| 3 | 1.201 | 0.6050 |
| 4 | 1.055 | 0.6325 |
| 5 | 0.942 | 0.6646 |
| 6 | 0.858 | 0.7013 |
| 7 | 0.788 | 0.7517 |
| 8 | 0.738 | 0.7219 |
| 9 | 0.699 | 0.7387 |
| 10 | 0.636 | 0.6234 |
| 11 | 0.621 | 0.7647 |
| 12 | 0.580 | 0.7578 |
| 13 | 0.557 | 0.7189 |
| 14 | 0.524 | 0.7800 |
| 15 | 0.498 | 0.8189 |
| 16 | 0.350 | 0.8610 |
| 17 | 0.299 | 0.8625 |
| 18 | 0.287 | 0.8640 |
| 19 | 0.270 | 0.8663 |
| 20 | 0.263 | 0.8587 |
| 21 | 0.260 | 0.8724 |
| 22 | 0.248 | 0.8694 |
| 23 | 0.235 | 0.8686 |
| 24 | 0.232 | 0.8717 |
| 25 | 0.233 | 0.8701 |
| 26 | 0.221 | 0.8747 |
| 27 | 0.205 | 0.8648 |
| 28 | 0.203 | 0.8755 |
| 29 | 0.188 | 0.8801 |
| 30 | 0.191 | 0.8770 |

La mejor precision de validacion es del 88,01% (epoca 29). No se proporcionan resultados sobre el conjunto de test.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo pequeno (probablemente ResNet18 o similar), se puede inferir que requiere menos de 2 GB de VRAM en FP32 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1050 Ti, RTX 2060) o incluso CPU para inferencia puntual.
- Si cabe en consumer GPU: si, es compatible con GPUs de gama baja y media.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede servir con TorchServe, o exportar a ONNX para usar con ONNX Runtime. Tambien se puede cargar directamente en scripts de Python.
- Latencia y throughput: no se han medido, pero en una GPU moderna se espera una latencia inferior a 10 ms por imagen y un throughput de cientos de imagenes por segundo, aunque estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el contexto de Imagenette. No obstante, se puede comparar con ResNet18 preentrenado en ImageNet, que suele alcanzar una precision superior al 90% en Imagenette con fine-tuning, pero no se tienen datos exactos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo es un proyecto de aprendizaje, no esta optimizado para produccion: no hay documentacion sobre manejo de errores, escalabilidad ni mantenimiento.
- La precision del 88,01% es sobre validacion, no sobre test; el rendimiento real puede variar.
- No se especifican las clases exactas de Imagenette ni el preprocesamiento necesario (normalizacion, etc.), lo que dificulta su reproduccion fiel.
- El codigo de ejemplo en la model card es incompleto: la clase `ResNet` no esta definida en el repositorio, por lo que el checkpoint no se puede cargar directamente sin implementar la arquitectura manualmente.
- Al estar entrenado solo en Imagenette, no generaliza a otras categorias de imagenes fuera de esas 10 clases.
- No se han publicado evaluaciones de sesgos ni de robustez ante perturbaciones.
- La licencia MIT permite uso comercial, pero al no haber garantias ni soporte, el usuario asume todos los riesgos.

## Enlaces

- [HuggingFace - lazy-toad/resnet-imagenette](https://huggingface.co/lazy-toad/resnet-imagenette)
- [GitHub - fastai/imagenette (dataset)](https://github.com/fastai/imagenette)
