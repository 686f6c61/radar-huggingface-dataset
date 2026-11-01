# dhr-m/smai-a4-iocnn

## Resumen

IOC-NN para CIFAR-10 es una red neuronal totalmente conectada de dos capas (3072 → 128 → 10) entrenada con PyTorch sobre el conjunto CIFAR-10. El modelo forma parte de la asignatura SMAI (Statistical Methods in Artificial Intelligence) de la Assignment 4 del semestre Monsoon 2026, y se presenta como referencia comparativa en la sección 1.5 de dicho trabajo. Su interés no reside en el rendimiento (47,10 % de accuracy en test), sino en una restricción arquitectónica poco habitual: todos los pesos de las capas a partir de la segunda se mantienen no negativos tras cada paso de SGD, aplicando la transformación w → exp(w − 5) a cualquier peso negativo.

El resultado de esa restricción es que cada logit de salida es una función convexa de la imagen de entrada, lo que convierte al modelo en una herramienta didáctica para estudiar propiedades de convexidad en redes neuronales y su efecto sobre la capacidad de representación. El modelo se distribuye como pesos en formato NumPy (`weights.npz`) más un fichero de preprocesado (`preprocessing.npz`) y un `config.json`, sin dependencia de frameworks de deep learning en inferencia.

No es un modelo de lenguaje ni un modelo generativo: no procesa texto, no tiene ventana de contexto lingüístico y no soporta tool calling. Cualquier uso previsto debe enmarcarse en clasificación de imágenes de 32×32×3 o en experimentación académica sobre restricciones de convexidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa totalmente conectado 3072 → 128 → 10, activación oculta ELU, salida de 10 logits |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores, imagen 32×32×3) |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro de `weights.npz`) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`weights.npz`, `preprocessing.npz`) y `config.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es un MLP de dos capas con 3072 entradas (imagen CIFAR-10 aplanada en orden H, W, C), 128 unidades ocultas con activación ELU y 10 logits de salida correspondientes a las clases de CIFAR-10. El entrenamiento se realizó con PyTorch usando SGD plano, learning rate 0,01, tamaño de lote 64, acumulación de gradiente 1, 100 épocas, pérdida de entropía cruzada, precisión float32 y semilla 11011. Se entrenó sobre las 50.000 imágenes del split de train de CIFAR-10 y se evaluó sobre las 10.000 del split de test.

La innovación técnica es la restricción de no negatividad sobre los pesos de las capas ≥ 2: tras cada paso de SGD, todo peso negativo w se sustituye por exp(w − 5), lo que garantiza que los pesos permanezcan estrictamente positivos (la exponencial de un número real es siempre positiva). Combinado con la activación ELU y con pesos no negativos, cada logit resulta ser una función convexa de la imagen de entrada. El preprocesado es también parte del artefacto: las imágenes se dividen por 255 y se normalizan con la media y la desviación típica por píxel calculadas sobre el conjunto de entrenamiento, valores que se distribuyen en `preprocessing.npz`. No se reporta uso de RLHF, DPO ni ningún otro ajuste posterior.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro, sin necesidad de PyTorch ni de GPU.
- Generación de logits por clase, aptos para análisis de calibración, márgenes y propiedades de convexidad.
- Reproducibilidad completa: semilla, hiperparámetros y preprocesado documentados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como referencia base para comparar contra variantes con ruido de etiquetas, dado que se entrenó con etiquetas verdaderas (p = 0) y se cita explícitamente como comparación en la sección 1.5 de la Assignment 4.
- Estudio de convexidad en redes neuronales: al garantizar que cada logit es convexo respecto a la entrada, permite experimentos controlados sobre cómo la restricción de no negatividad afecta a la frontera de decisión y a la accuracy (47,10 % en test).
- Reproducción de experimentos académicos: los ficheros `weights.npz`, `preprocessing.npz` y `config.json` permiten replicar exactamente el pipeline de evaluación en NumPy sin instalar PyTorch.
- Prototipado de pipelines de inferencia ligeros: al ejecutarse con NumPy puro y 394.634 parámetros, puede integrarse en entornos sin GPU o sin frameworks de deep learning para validar cadenas de preprocesado y clasificación.
- Análisis de calibración y de logits: los 10 logits por imagen permiten estudiar temperaturas, márgenes y matrices de confusión sobre CIFAR-10 test.
- Referencia en trabajos sobre ruido de etiquetas: al estar entrenado con p = 0, sirve como cota superior frente a modelos entrenados con etiquetas corruptas en la misma arquitectura.
- Benchmark de juguete para comparar optimizadores o esquemas de regularización sobre un MLP pequeño y reproducible.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Resultado |
|---|---|---|---|
| IOC-NN (3072 → 128 → 10, ELU) | CIFAR-10 test (10.000 imágenes) | Accuracy | 0,4710 (tras la última época) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos en float32 (394.634 parámetros × 4 bytes ≈ 1,58 MB), más el overhead del runtime de NumPy.
- GPU recomendadas: ninguna en particular; el modelo está pensado para ejecutarse en CPU con NumPy.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en CPU sin problemas.
- Opciones de despliegue: NumPy como vía documentada por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por lotes en CPU es trivial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Accuracy CIFAR-10 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (dhr-m/smai-a4-iocnn) | 394.634 | Imagen 32×32×3 (3072 valores) | 0,4710 | no disponible | HuggingFace, pesos NumPy |
| MLP estándar 3072 → 128 → 10 sin restricción | ~394.634 (misma topología) | Imagen 32×32×3 | no disponible en la información | no disponible | no disponible |
| LeNet-5 (referencia histórica CIFAR-10) | ~60.000 | Imagen 32×32×3 | no disponible en la información | no disponible | no disponible |

No se dispone de datos numéricos de modelos comparables en la información proporcionada; la comparativa se limita a la topología y al resultado reportado por el autor.

## Limitaciones y advertencias

- Rendimiento bajo: 47,10 % de accuracy en CIFAR-10 test, lejos de los modelos convolucionales habituales; no es adecuado para producción en visión por computador.
- Restricción de convexidad: la no negatividad de los pesos de las capas ≥ 2 limita severamente la capacidad de representación y explica en parte la accuracy moderada.
- Sesgos conocidos: no se documentan análisis de sesgo por clase ni por subgrupo; el modelo se entrenó solo con CIFAR-10, un dataset pequeño y con sesgos de recolección conocidos.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en clases visualmente similares.
- Limitaciones de contexto o idioma: no procesa lenguaje; la entrada está fija a imágenes de 32×32×3 en orden H, W, C.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat para producción: el artefacto está pensado como material de asignatura (tag `smai-assignment`), sin pipeline declarado, sin descargas ni validación externa; no debe tratarse como un modelo listo para despliegue.
- Dependencia del preprocesado exacto: es obligatorio usar `mean` y `std` de `preprocessing.npz` y el orden H, W, C; cualquier desviación invalida los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhr-m/smai-a4-iocnn
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales asociados al modelo.
