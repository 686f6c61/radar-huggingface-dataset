# akshat0285/smai-a4-cifar10-ioc

## Resumen

`smai-a4-cifar10-ioc` es una red neuronal totalmente conectada (MLP) entrenada desde cero para clasificar imágenes del conjunto de datos CIFAR-10. El modelo lo publica el usuario de Hugging Face `akshat0285` como parte de la asignatura SMAI (Assignment 4) y no está pensado como un modelo de propósito general, sino como un artefacto académico reproducible: pesos, arquitectura y preprocesado quedan documentados en la model card.

La arquitectura es deliberadamente simple: una pila de capas densas con tamaños `[3072, 128, 64, 10]`, activación ELU en las capas ocultas, salida de 10 logits sin activación y pesos no negativos a partir de la segunda capa. El entrenamiento se hizo en float64 con SGD plano (lr=0.05, batch de 64, 100 épocas) usando las etiquetas verdaderas, y el autor reporta una precisión de test del 47,43 %.

No es un modelo de lenguaje ni un transformer: no tiene tokenizador, ni contexto, ni capacidades generativas. Su relevancia es didáctica y de referencia para entender el pipeline completo de clasificación de imágenes con CIFAR-10 (preprocesado con media y desviación típica calculadas sobre las 50 000 imágenes de entrenamiento, carga de pesos desde un formato propio `nn_lib.Model.load_from`, inferencia con logits crudos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, tamaños `[3072, 128, 64, 10]`, activación ELU en capas ocultas, salida lineal de 10 logits |
| Parámetros totales | No disponible en la model card (estimable a partir de las formas: 3072×128 + 128 + 128×64 + 64 + 64×10 + 10 = 402 698) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada fija de 32×32×3 píxeles = 3072 valores) |
| Tipos de cuantización | No disponible (pesos en float64 según la model card) |
| Idiomas soportados | No aplica (clasificador de imágenes) |
| Licencia | No disponible |
| Formato de pesos | Formato propio de `nn_lib.Model.load_from` (matrices `W{k}` con forma `(n_in, n_out)` y vectores `b{k}` con forma `(n_out,)`), más un `preprocessing.npz` con media y desviación típica |

## Arquitectura y entrenamiento

El modelo es un MLP de tres transformaciones lineales con dos activaciones ELU intermedias. La entrada es una imagen CIFAR-10 aplanada de 32×32×3 a un vector de 3072 dimensiones, normalizada dividiendo por 255 y restando la media y dividiendo por la desviación típica calculadas sobre las 50 000 imágenes del conjunto de entrenamiento (guardadas en `preprocessing.npz`). La salida son 10 logits, uno por clase, sin softmax incorporado. Una particularidad destacada en la model card es que las capas a partir de la segunda usan pesos no negativos, lo que impone una restricción estructural poco habitual en MLPs estándar.

El entrenamiento se realizó en precisión float64 con SGD plano, tasa de aprendizaje 0.05, tamaño de lote 64 y 100 épocas, usando las etiquetas verdaderas (sin técnicas de destilación ni pseudoetiquetado). No se menciona el uso de data augmentation, regularización, momentum, weight decay ni ningún esquema de decodificación o atención. La model card no detalla la composición exacta del dataset más allá de que se usa la partición estándar de CIFAR-10 (50 000 imágenes de entrenamiento) y no indica si hubo validación cruzada o búsqueda de hiperparámetros.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles en una de las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre lotes de imágenes aplanadas y normalizadas con la media y desviación típica proporcionadas en `preprocessing.npz`.
- Carga de pesos mediante la API `nn_lib.Model.load_from`, pensada para el entorno de la asignatura.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de pensamiento, visión general, audio ni otras modalidades.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo completo y reproducible de un pipeline de clasificación de imágenes con CIFAR-10, desde el preprocesado hasta la evaluación, adecuado para asignaturas introductorias de redes neuronales.
- Referencia base para comparar arquitecturas: permite contrastar un MLP simple frente a CNN o transformers de visión en la misma tarea y con el mismo conjunto de datos, midiendo la brecha de precisión (47,43 % frente a >90 % de modelos convolucionales modernos).
- Estudio de restricciones en los pesos: el uso de pesos no negativos a partir de la segunda capa lo convierte en un caso de estudio para analizar cómo afecta esta restricción a la capacidad de representación y a la precisión final.
- Reproducción de experimentos académicos: al documentar hiperparámetros exactos (float64, SGD, lr=0.05, batch 64, 100 épocas), facilita la replicación y la verificación de resultados en entornos educativos.
- Pruebas de integración de librerías propias: el formato de pesos `W{k}`/`b{k}` y la función de carga `nn_lib.Model.load_from` permiten validar implementaciones caseras de capas densas y funciones de activación ELU.
- Prototipado rápido de clasificadores de baja exigencia computacional: al ser un MLP pequeño (unos 400 000 parámetros), puede ejecutarse en CPU en milisegundos, útil para pruebas de humo en pipelines de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,4743 (47,43 %) |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float64 (unos 402 698 parámetros × 8 bytes ≈ 3,2 MB para los pesos, más el estado de activaciones para un lote pequeño).
- GPU recomendadas: cualquier GPU, incluso integradas; no requiere aceleración específica. Funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) y en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI. Se ejecuta mediante la librería `nn_lib` del autor o reimplementando la carga de pesos en NumPy/PyTorch.
- Latencia y throughput estimados: no disponibles en la model card; por el tamaño, se espera latencia de microsegundos a milisegundos por lote en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `smai-a4-cifar10-ioc` | MLP `[3072, 128, 64, 10]` | ~402 698 (estimado) | 32×32×3 | 47,43 % | No disponible | Hugging Face |
| ResNet-20 (referencia CIFAR-10) | CNN residual | ~0,27 M | 32×32×3 | ~91-92 % (referencia habitual en literatura) | Varía (MIT en implementaciones comunes) | Amplia |
| VGG-11 (CIFAR-10) | CNN | ~9,2 M (adaptada) | 32×32×3 | ~92-93 % (referencia habitual) | Varía | Amplia |
| MLP clásico CIFAR-10 | MLP 2 capas | ~1 M | 32×32×3 | ~55-60 % (referencia habitual) | Varía | Amplia |

Nota: los valores de precisión de los modelos comparativos son cifras de referencia habituales en la literatura, no resultados publicados junto a este modelo; la model card solo aporta el 47,43 % del modelo propio.

## Limitaciones y advertencias

- Precisión baja: un 47,43 % en CIFAR-10 está muy por debajo de los modelos convolucionales modernos (>90 %) y de un MLP bien ajustado; no es adecuado para aplicaciones reales de clasificación.
- Sesgos conocidos: al entrenarse solo con CIFAR-10, hereda los sesgos y limitaciones de ese conjunto (clases balanceadas artificialmente, imágenes de baja resolución, dominancia de ciertas categorías visuales).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto e idioma: no aplica; el modelo solo acepta imágenes de 32×32×3 píxeles normalizadas con la media y desviación típica concretas del `preprocessing.npz`.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Caveat para producción: depende de la librería `nn_lib` y de un formato de pesos propio; requiere reimplementar la carga si se quiere usar en otro entorno.
- Sin mantenimiento aparente: 0 descargas, 0 likes, repositorio de 0,0 GB y creado en 2026; no hay indicios de soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akshat0285/smai-a4-cifar10-ioc
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
