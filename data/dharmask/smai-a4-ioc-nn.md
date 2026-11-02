# dharmask/smai-a4-ioc-nn

## Resumen

`dharmask/smai-a4-ioc-nn` es un modelo neuronal de clasificación de imágenes sobre CIFAR-10, publicado por el usuario dharmask. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un perceptrón multicapa (MLP) de tres capas con arquitectura 3072-64-32-10 que recibe imágenes RGB de 32x32 píxeles aplanadas (3072 entradas) y produce diez logits, uno por clase de CIFAR-10. El modelo se presenta como "final clean-label" y está asociado a una asignación académica de la que forma parte el repositorio de referencia `src/q1/pytorch_section14`.

El interés del modelo es académico y metodológico: el autor lo vincula explícitamente a una garantía de convexidad del IOC (presumiblemente "Interior Optimal Convexity" o una técnica de optimización convexa interna aplicada al entrenamiento) sobre los logits. El modelo se distribuye con pesos en formato PyTorch (`state_dict.pt`) y NumPy (`weights.npz` con pesos en formato de vector fila), junto con `config.json`, `preprocessing.npz` (media, desviación típica y escala calculadas solo sobre el conjunto de entrenamiento oficial) e `inference.py` para inferencia mínima con NumPy.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline. Su relevancia actual es limitada fuera del contexto docente o de experimentación con métodos de entrenamiento convexo sobre CIFAR-10, pero resulta útil como ejemplo reproducible de un modelo pequeño con artefactos de inferencia autocontenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 3072-64-32-10 (perceptrón multicapa de tres capas) |
| Parametros totales | no disponible (estimable en ~198.000 a partir de las dimensiones de capa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible; pesos en float64 (`state_dict.pt`, `weights.npz`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict.pt` y NumPy `weights.npz` |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa totalmente conectado con capas de 3072 entradas, 64 neuronas ocultas, 32 neuronas ocultas y 10 salidas (una por clase de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Los pesos se almacenan en precisión float64, y el modelo se entrena hasta la época 100 según indica la model card. La entrada corresponde a imágenes RGB de 32x32 píxeles aplanadas, con un preprocesado de normalización cuyos parámetros (media, desviación típica y escala) se guardan en `preprocessing.npz` y se calculan exclusivamente sobre el conjunto de entrenamiento oficial, evitando filtración de datos de test.

El detalle técnico destacable es la mención explícita a una "garantía de convexidad IOC" sobre los logits. El autor indica que la softmax es opcional después de los logits porque dicha garantía se formula en el espacio de logits, no en el de probabilidades. No se especifica en la información disponible el número exacto de tokens o muestras de entrenamiento, la composición del dataset más allá de CIFAR-10, ni si se emplearon técnicas de aumento de datos, regularización o ajuste fino. Tampoco se documenta el uso de RLHF, DPO ni métodos de alineación, algo esperable al no ser un modelo generativo. El calificativo "clean-label" sugiere que el entrenamiento se realizó sin etiquetas envenenadas o corruptas, pero no se aportan más detalles.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles RGB en las diez clases de CIFAR-10.
- Inferencia mínima reproducible con NumPy mediante `from inference import predict`, que devuelve clases y logits a partir de un minibatch de uint8 RGB.
- Recarga en PyTorch mediante `fresh_model` y `load_state_dict` con `weights_only=True`, orientada a la sección Q1.4 del repositorio de la asignación.
- Preprocesado autocontenido y reproducible (media, desviación típica y escala calculadas solo con el conjunto de entrenamiento oficial).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- No dispone de pipeline declarado en HuggingFace ni de demo asociada.

## Casos de uso

- Docencia y evaluación de modelos: sirve como referencia reproducible para prácticas de aprendizaje automático, ya que incluye pesos, configuración, preprocesado e inferencia en un único repositorio pequeño.
- Reproducción de experimentos de convexidad: el modelo permite verificar la garantía de convexidad IOC sobre los logits en un caso controlado de clasificación de CIFAR-10 con arquitectura fija.
- Pruebas de integración de inferencia NumPy: útil para validar pipelines de inferencia sin dependencia de PyTorch, por ejemplo en entornos embebidos o de CI con recursos limitados.
- Comparación de preprocesados: al incluir `preprocessing.npz` con estadísticas calculadas solo sobre entrenamiento, permite auditar el efecto de la normalización en la precisión de un MLP pequeño.
- Baseline de clasificación de imágenes de bajo coste: con ~198.000 parámetros, puede ejecutarse en CPU para establecer una línea base frente a CNN o transformers de visión en CIFAR-10.
- Verificación de carga segura de pesos: el uso de `weights_only=True` en PyTorch lo convierte en un ejemplo práctico de carga de `state_dict` sin ejecución de código arbitrario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en float64 (unas 198.000 entradas de 8 bytes, aproximadamente 1,6 MB) más el espacio de activaciones de un minibatch pequeño; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU; el modelo está pensado para ejecutarse en CPU con NumPy o PyTorch.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU de un solo núcleo para inferencia por lotes pequeños.
- Opciones de despliegue: inferencia directa con NumPy (`inference.py`) o PyTorch (`state_dict.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; para un MLP de este tamaño en CPU se espera un coste por muestra del orden de microsegundos, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dharmask/smai-a4-ioc-nn | MLP 3072-64-32-10 | ~198.000 (estimado) | Imagen 32x32x3 aplanada | no disponible | HuggingFace, repo 0.0 GB |
| LeNet-5 (CIFAR-10) | CNN | ~60.000 | Imagen 32x32x3 | varía | Referencia académica ampliamente disponible |
| ResNet-18 (CIFAR-10) | CNN residual | ~11,2 M | Imagen 32x32x3 | varía (MIT en torchvision) | torchvision |
| ViT-small (CIFAR-10) | Transformer de visión | ~22 M | Imagen 32x32x3 con parches | varía | Implementaciones públicas |

No se dispone de datos de rendimiento del modelo consultado para establecer una comparación cuantitativa con estas alternativas; la comparación es estructural.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo clasifica imágenes de 32x32 píxeles en las diez clases de CIFAR-10; no generaliza a otras resoluciones ni categorías sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y su uso en pipelines conversacionales no es posible.
- Licencia no declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin métricas publicadas: no hay precisión, matriz de confusión ni benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.
- Riesgo de sobreajuste y sesgos de CIFAR-10: el conjunto de datos contiene clases desbalanceadas en contextos reales y el modelo puede heredar sesgos de las imágenes de entrenamiento.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de mantenimiento; la fecha de creación indicada (2026-11-02) resulta anómala y debe verificarse.
- Artefactos en float64: los pesos ocupan el doble que en float32, lo que puede ser relevante en entornos con memoria muy limitada, aunque el tamaño absoluto es pequeño.
- La inferencia PyTorch requiere aplicar el preprocesado guardado en `preprocessing.npz` antes del forward; omitirlo invalida los resultados.
- La garantía de convexidad IOC se formula sobre los logits, no sobre las probabilidades softmax; cualquier evaluación que aplique softmax antes de comprobar la propiedad no es válida.

## Enlaces

- HuggingFace: https://huggingface.co/dharmask/smai-a4-ioc-nn
- Repositorio de la asignación (referenciado en la model card): `src/q1/pytorch_section14/models.py` con la función `fresh_model`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
