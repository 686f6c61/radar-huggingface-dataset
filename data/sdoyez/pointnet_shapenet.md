# SDoyez/pointNet_ShapeNet

## Resumen

PointNet es una arquitectura de red neuronal diseñada para el procesamiento directo de nubes de puntos 3D, propuesta originalmente por Qi et al. (2017). Este repositorio concreto, publicado por el usuario SDoyez, contiene un modelo PointNet entrenado sobre el subconjunto de aviones del dataset ShapeNet, orientado a tareas de segmentación o clasificación de nubes de puntos. El modelo se distribuye en formato ONNX y se ha entrenado mediante el framework propio del autor, OpenML-core, un wrapper de PyTorch disponible en GitHub.

El repositorio es de carácter experimental y muy limitado: no incluye pipeline declarado, no especifica idiomas (es un modelo 3D, no lingüístico), no publica métricas de benchmarks estándar y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de tamaño despreciable. La model card mezcla referencias al dataset ShapeNet con menciones a un dataset de segmentación de imágenes satelitales de Dubái, lo que introduce ambigüedad sobre qué se ha evaluado realmente.

Por su naturaleza, este modelo no es un LLM ni un modelo de lenguaje: es un modelo de visión 3D para nubes de puntos. Su relevancia práctica es muy baja fuera de experimentos académicos o reproducciones del paper original, y no debe confundirse con los modelos generativos de texto que suelen documentarse en este blog.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointNet (red neuronal para nubes de puntos 3D, basada en MLP compartidos y max-pooling simétrico) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo 3D, no secuencial) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; cuantización no documentada) |
| Idiomas soportados | no aplica (modelo de visión 3D) |
| Licencia | MIT |
| Formato de pesos | ONNX (código PyTorch de referencia en `model.py`) |

## Arquitectura y entrenamiento

PointNet procesa nubes de puntos de forma permutación-invariante mediante una serie de capas MLP aplicadas punto a punto, seguidas de una operación de max-pooling global que agrega la información en un vector de características global. Esta arquitectura evita el uso de convoluciones volumétricas y permite consumir directamente coordenadas 3D sin voxelización previa. En este repositorio se incluye el código PyTorch de referencia en `model.py`.

El entrenamiento se realizó con el framework OpenML-core del autor, un wrapper de PyTorch publicado en GitHub, sobre el subconjunto de aviones del dataset ShapeNet. No se especifican el número de tokens (no aplica), el número de puntos por muestra, el número de épocas, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos. La model card menciona visualizaciones y métricas que parecen referirse a un dataset de segmentación de imágenes satelitales de Dubái, lo que no guarda coherencia con un modelo de nubes de puntos 3D y sugiere un copy-paste de otra ficha.

## Capacidades

- Procesamiento de nubes de puntos 3D (clasificación o segmentación, según la cabeza de salida configurada).
- Inferencia en formato ONNX, lo que permite despliegue con ONNX Runtime.
- Código PyTorch de referencia incluido para reentrenamiento o adaptación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Reproducción académica del paper PointNet: sirve como punto de partida para experimentos sobre clasificación de nubes de puntos 3D con el subconjunto de aviones de ShapeNet, útil en docencia o validación de implementaciones.
- Prototipado de pipelines 3D en ONNX: al estar exportado a ONNX, puede integrarse en aplicaciones que ya usen ONNX Runtime para tareas de inferencia sobre geometría 3D.
- Benchmark de frameworks propios: el modelo permite evaluar el framework OpenML-core del autor frente a implementaciones estándar de PyTorch.
- Pruebas de integración en visión por computador 3D: útil para validar la carga de modelos ONNX y el preprocesado de nubes de puntos en un pipeline mayor.
- Educación en arquitecturas permutation-invariant: ejemplo didáctico de cómo una red basada en max-pooling global puede procesar conjuntos no ordenados.
- Base para fine-tuning en dominios específicos: el código `model.py` permite adaptar la arquitectura a otros subconjuntos de ShapeNet o a nubes de puntos propias, aunque requerirá trabajo adicional de ingeniería.

## Benchmarks y rendimiento

La model card reporta un único valor de exactitud (accuracy) de 0.9121 para la "Model V1", pero lo asocia explícitamente al dataset de segmentación de imágenes satelitales de Dubái, no a ShapeNet. Dado que esa métrica no corresponde al dominio del modelo (nubes de puntos 3D) y no se aportan resultados sobre ShapeNet, no es posible presentar una tabla de benchmarks fiable.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es 0.0 GB y no se especifican parámetros; PointNet original ronda los 3-4 millones de parámetros, pero este dato no está confirmado en la información proporcionada).
- GPU recomendadas: no disponible; por la naturaleza ligera de PointNet, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente en teoría, pero no se confirma.
- Compatibilidad con GPU consumer: probablemente sí, dado el bajo coste computacional típico de PointNet, aunque no se aporta confirmación.
- Opciones de despliegue: ONNX Runtime (formato principal); PyTorch para el código de referencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| PointNet (este repo) | PointNet | Nubes de puntos 3D | MIT | ONNX en HuggingFace |
| PointNet++ (Qi et al.) | PointNet++ (jerárquica) | Nubes de puntos 3D | Uso académico según repo original | Código en GitHub, sin pesos oficiales en HF |
| Point Transformer | Transformer para nubes de puntos | Nubes de puntos 3D | Varía según implementación | Repos de investigación |
| DGCNN | Graph CNN sobre k-NN | Nubes de puntos 3D | MIT en implementaciones públicas | Código en GitHub |

La comparación se limita a nivel arquitectónico: no se dispone de métricas comparables publicadas en este repositorio para contrastar rendimiento numérico con las alternativas.

## Limitaciones y advertencias

- Entrenado únicamente sobre el subconjunto de aviones de ShapeNet: no generaliza a otras categorías de objetos sin reentrenamiento.
- Model card incoherente: mezcla resultados de un dataset de imágenes satelitales con un modelo de nubes de puntos, lo que impide confiar en las métricas reportadas.
- Tamaño del repo de 0.0 GB: los pesos pueden no estar efectivamente disponibles o ser de tamaño despreciable; conviene verificar antes de usarlo.
- Sin pipeline declarado ni documentación de preprocesado: el usuario debe inferir el formato de entrada (número de puntos, normalización, etc.).
- Riesgo de alucinación no aplica (no es generativo), pero sí riesgo de predicciones erróneas fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial, pero sin garantías del autor y con la obligación de conservar el aviso de copyright.
- Sin soporte ni mantenimiento aparente (0 descargas, 0 likes, creado en 2026): no es un modelo para producción sin validación propia.
- No apto para tareas de NLP, visión 2D, audio ni generación de texto.

## Enlaces

- HuggingFace: https://huggingface.co/SDoyez/pointNet_ShapeNet
- Framework OpenML-core (GitHub): https://github.com/sebastien-doyez2812/OpenML-core
- Paper original PointNet (Qi et al., 2017): https://arxiv.org/abs/1612.00593
- Dataset ShapeNet: https://shapenet.org/
