# momentarek1/MINSIT

## Resumen

El repositorio `momentarek1/MINSIT` aloja un proyecto de machine learning centrado en la clasificación de dígitos manuscritos del dataset MNIST. A diferencia de un modelo de lenguaje o un sistema de IA generativa, este proyecto implementa tres enfoques clásicos de aprendizaje automático: un perceptrón multicapa (MLP), una red neuronal convolucional (CNN) y una máquina de vectores de soporte lineal (SVM). El trabajo se extiende al ámbito de la seguridad adversarial, estudiando ataques de evasión y envenenamiento de datos sobre el clasificador SVM.

El autor, `momentarek1` (MomenTarek1 en GitHub), presenta el código y la documentación como material didáctico y de investigación. No se proporcionan pesos entrenados ni un modelo empaquetado; el repositorio contiene únicamente la descripción del proyecto y, presumiblemente, el código fuente. La página de HuggingFace no incluye archivos de modelo, pipeline, licencia ni idiomas, y registra cero descargas y cero interacciones. La fecha de creación (2026-08-22) es posterior a la actual, lo que sugiere que podría tratarse de un error o de un marcador de posición.

En resumen, se trata de un proyecto educativo de código abierto que ilustra la construcción de clasificadores de imágenes y su vulnerabilidad ante manipulaciones adversariales, más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (784-100-50-10), CNN (convolucional), SVM lineal (binario 5 vs 9) |
| Parametros totales | no disponible (no se publican pesos entrenados) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (entrada de imágenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

La model card describe tres arquitecturas independientes:

- **MLP**: red totalmente conectada con capas de 784 → 100 → 50 → 10, activaciones ReLU en las capas ocultas y salida de 10 logits. Se entrena con CrossEntropyLoss, optimizador Adam (lr=0.001) durante 10 épocas.
- **CNN**: red convolucional que recibe imágenes de 1×28×28, con dos bloques de convolución (32 y 64 filtros), max pooling, dropout y una capa fully connected de 1600 → 100 → 10. No se especifican hiperparámetros de entrenamiento en el fragmento disponible.
- **SVM lineal**: clasificador binario para distinguir los dígitos 5 y 9, implementado con SecML. Sobre este modelo se aplican ataques adversariales de evasión y envenenamiento de datos.

No se indica el número total de parámetros, el tamaño del dataset de entrenamiento (aunque se menciona que MNIST tiene 60.000 imágenes de entrenamiento y 10.000 de test), ni se detallan técnicas de regularización más allá del dropout en la CNN. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un problema de clasificación supervisada clásica.

## Capacidades

- Clasificación de dígitos manuscritos (0-9) a partir de imágenes en escala de grises de 28×28 píxeles.
- Comparación de rendimiento entre MLP, CNN y SVM sobre el mismo conjunto de datos.
- Demostración de ataques adversariales de evasión (modificación de entradas para inducir errores) y de envenenamiento de datos (contaminación del conjunto de entrenamiento) sobre un clasificador SVM.
- Normalización de píxeles (0-1 o -1 a 1) como preprocesamiento estándar.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la entrada de imágenes.

## Casos de uso

- **Educación en deep learning**: el código sirve como ejemplo práctico para enseñar la implementación de MLP y CNN con PyTorch, incluyendo el flujo completo de carga de datos, entrenamiento y evaluación.
- **Introducción a la seguridad adversarial**: el experimento con SVM permite ilustrar cómo pequeños cambios imperceptibles en las imágenes pueden engañar a un clasificador, y cómo el envenenamiento de datos degrada el rendimiento.
- **Comparativa de algoritmos clásicos**: permite evaluar empíricamente las diferencias de precisión y robustez entre una red neuronal, una CNN y una SVM lineal en un problema de visión simple.
- **Prototipado de sistemas OCR**: aunque limitado a dígitos, el enfoque puede servir como punto de partida para sistemas de reconocimiento óptico de caracteres en entornos controlados.
- **Investigación en ataques adversariales**: el código de SecML puede adaptarse para estudiar defensas o nuevos vectores de ataque en clasificadores lineales.
- **Demostración de preprocesamiento de imágenes**: muestra técnicas de normalización y transformación de tensores aplicables a otros proyectos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, exactitud ni comparativas con otros modelos. No se puede evaluar el rendimiento real de los clasificadores implementados.

## Requisitos de hardware

- Al ser modelos pequeños (MLP de ~84k parámetros, CNN de tamaño moderado, SVM lineal), pueden ejecutarse en CPU sin problemas.
- No se especifican requisitos de VRAM ni GPUs recomendadas. Para el entrenamiento de la CNN, una GPU con al menos 4 GB de VRAM sería suficiente, pero no hay datos oficiales.
- El proyecto usa PyTorch y SecML, por lo que el despliegue se limita a entornos con Python y las dependencias correspondientes.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento ni se mencionan modelos comparables en la documentación. Al tratarse de un proyecto educativo sin pesos publicados, no es posible establecer una comparación objetiva con otros clasificadores MNIST.

## Limitaciones y advertencias

- El repositorio no incluye pesos entrenados ni un modelo empaquetado; solo contiene código y documentación. No es un modelo listo para usar.
- No se especifica licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal.
- La model card está incompleta (se corta en la sección de la CNN) y no proporciona resultados de entrenamiento ni métricas de evaluación.
- Los ataques adversariales se aplican únicamente al SVM binario (5 vs 9), no a los otros modelos, lo que limita la generalización de las conclusiones.
- El proyecto es un experimento académico; no está optimizado para producción ni para manejar datos fuera del dominio de MNIST.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/momentarek1/MINSIT)
- [Perfil de GitHub del autor](https://github.com/MomenTarek1)
