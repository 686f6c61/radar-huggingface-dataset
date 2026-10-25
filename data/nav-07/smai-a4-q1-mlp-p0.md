# nav-07/smai-a4-q1-mlp-p0

## Resumen

`nav-07/smai-a4-q1-mlp-p0` es un perceptrón multicapa (MLP) entrenado con PyTorch sobre píxeles crudos de CIFAR-10, publicado como material de un trabajo de asignatura (SMAI Assignment 4, Q1, sección 1.4.2). No es un modelo de propósito general ni un modelo de lenguaje: es un clasificador de imágenes de 10 clases con una arquitectura densa de 1.738.890 parámetros y una entrada fija de 3072 valores (32×32×3 aplanado en orden fila-mayor).

El modelo se entrenó desde cero con etiquetas verdaderas (nivel de ruido p = 0) para servir como una de las dos redes comparadas en la sección 1.5 del enunciado, frente a una red denominada IOC-NN. Su interés es exclusivamente docente y de reproducibilidad: permite inspeccionar de forma directa el desajuste entre entrenamiento y test en una red densa sin sesgo inductivo espacial.

Los resultados publicados muestran un sobreajuste severo: 0,9406 de exactitud en entrenamiento frente a 0,5030 en el conjunto de test oficial de 10.000 imágenes, con una pérdida de test de 5,7946. El repositorio pesa 0,0 GB y contiene únicamente los pesos en formato NumPy y un `config.json` descriptivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado (3072 → 512 → 256 → 128 → 10) |
| Parámetros totales | 1.738.890 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: clasificador de imágenes con entrada fija de 3072 valores; sin ventana de texto |
| Tipos de cuantización | no disponible; pesos publicados en float64 (.npz) y sin versiones cuantizadas oficiales |
| Idiomas soportados | no disponible; no es un modelo de lenguaje (10 clases de CIFAR-10 etiquetadas en inglés) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`parameters.npz`) + `config.json`; no hay safetensors ni GGUF |
| Activación en capas ocultas | ReLU (`max(z, 0)`) |
| Capa de salida | Identity, 10 logits sin softmax |
| Preprocesado | aplanado fila-mayor, división por 255, resta de `preprocessing_mean` y división por `preprocessing_std` (ambos de 3072 valores float64) |
| Precisión de entrenamiento | float64 |
| Función de pérdida | entropía cruzada categórica (CCE) |
| Optimizador | SGD, lr = 0,05, batch_size = 64, 100 épocas, sin early stopping |
| Semillas | torch_seed 1083, batch_order_seed 1084, noise_seed 1085 |
| Entrada / salida | tensor (n, 32, 32, 3) uint8 → 10 logits |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La red es un MLP convencional de cuatro capas lineales con anchos 3072, 512, 256 y 10, activación ReLU en las tres capas ocultas y salida identidad (logits crudos, sin softmax). El diseño de pesos sigue el convenio de PyTorch: `layer_<l>_weight` tiene forma (out, in) y la salida de cada capa se calcula como `activation(x @ W.T + b)`. Los pesos se publican en `parameters.npz` y se leen con `numpy.load(..., allow_pickle=False)`; el formato es propio del enunciado y no es compatible con la clase `Model.load_from` del assignment, que usa otro layout y no implementa ELU.

El entrenamiento se hizo desde cero sobre las 50.000 imágenes del split oficial de entrenamiento de CIFAR-10, en float64, con SGD (lr = 0,05), tamaño de lote 64, 100 épocas, pérdida de entropía cruzada y sin early stopping ni selección de modelo sobre test. La media y la desviación típica del preprocesado (3.072 valores float64 cada una) se calcularon sobre ese mismo split de entrenamiento. No se menciona aumento de datos, regularización, ni ajuste fino posterior (RLHF/DPO no aplica). La única "innovación" reseñable es metodológica: el par de semillas fijas y el registro en Weights & Biases permiten reproducir exactamente la ejecución.

## Capacidades

- Clasificación de imágenes de 32×32×3 en las 10 clases de CIFAR-10: 0 airplane, 1 automobile, 2 bird, 3 cat, 4 deer, 5 dog, 6 frog, 7 horse, 8 ship, 9 truck.
- Salida de logits crudos por clase, apta para calcular probabilidades aplicando softmax externamente.
- Preprocesado incorporado en el artefacto: media y desviación típica por píxel publicadas junto con los pesos.
- Inferencia determinista en CPU o GPU con operaciones puramente matriciales (NumPy o PyTorch).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni ningún tipo de planificación.
- No tiene capacidades multilingües: no procesa texto.
- No admite imágenes de tamaño distinto de 32×32×3 sin remuestreo previo, ni variaciones de canal.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Docencia y reproducción de prácticas: el artefacto permite recalcular el forward pass exacto de la sección 1.5 del assignment y verificar las cifras publicadas con NumPy puro.
- Estudio del sobreajuste en redes densas: la brecha entre 0,9406 de exactitud de entrenamiento y 0,5030 de test sirve como caso de laboratorio para ilustrar la falta de generalización sin sesgo inductivo espacial.
- Análisis de calibración: la pérdida de test (5,7946) frente a la de entrenamiento (0,2311) hace de este modelo un ejemplo útil para demostrar sobreconfianza y para practicar técnicas de calibración (temperature scaling, etc.).
- Comparación MLP vs. convolución: se usa como línea base densa frente a la IOC-NN del mismo enunciado, midiendo el efecto de ignorar la estructura espacial.
- Verificación de pipelines de preprocesado: los vectores `preprocessing_mean` y `preprocessing_std` permiten comprobar que una implementación de normalización reproduce los logits esperados.
- Ejemplo mínimo de despliegue en CPU: con ~13,9 MB en float64 cabe en cualquier contenedor y sirve para practicar empaquetado de inferencia sin dependencias de GPU.
- Diseño de experimentos con ruido de etiquetas: al ser la ejecución con p = 0, actúa como referencia limpia frente a las variantes con ruido del mismo proyecto (el barrido incluye `noise_seed` y `p` como parámetros).
- Análisis por clase mediante F1: el valor medio de 0,5004 sobre 10 clases permite trabajar métricas desagregadas y matrices de confusión en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no es un LLM. Las únicas métricas reportadas son las de la propia evaluación del assignment:

| Métrica | Entrenamiento | Test (10.000 imágenes oficiales) |
|---|---|---|
| Pérdida (CCE) | 0,2311 | 5,7946 |
| Exactitud | 0,9406 | 0,5030 |
| F1 medio (10 clases) | no disponible | 0,5004 |

Valores correspondientes a la última de las 100 épocas, sin early stopping ni selección de modelo sobre el conjunto de test, y sin promediar sobre repeticiones (una sola semilla).

## Requisitos de hardware

- VRAM estimada para inferencia: ~13,9 MB con pesos en float64 (1.738.890 × 8 bytes), ~7,0 MB si se convierten a float32; los vectores de preprocesado añaden ~49 KB (3.072 × 8 bytes × 2).
- GPU recomendadas: ninguna en particular; el modelo no necesita GPU. Cualquier GPU con más de 1 GB (GTX 1050, RTX 3060, T4, A100, H100) lo ejecuta sobradamente.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores o entornos sin GPU; la inferencia en CPU con NumPy es viable por imagen individual.
- Opciones de despliegue: forward manual con NumPy o PyTorch según la receta del README. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no reconocen el formato `.npz` propio de este assignment.
- Latencia y throughput: no disponibles (no se han publicado medidas). Como referencia aritmética, el coste de una pasada directa es del orden de 2·P ≈ 3,5 MFLOPs por imagen, lo que sitúa el modelo en el rango de miles de imágenes por segundo en CPU moderna; esta cifra es una estimación derivada del recuento de parámetros, no una medición.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada.

| Modelo | Parámetros | Entrada | Exactitud en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nav-07/smai-a4-q1-mlp-p0 | 1.738.890 | 32×32×3 aplanado a 3072 | 0,5030 | no disponible | `.npz` en HuggingFace |
| MLP NumPy del apartado 1.2.4 (mismo assignment) | no disponible | no disponible | no disponible | no disponible | no disponible |
| IOC-NN del apartado 1.5 (comparación del enunciado) | no disponible | no disponible | no disponible | no disponible | no disponible |
| CNN/ResNet de referencia en CIFAR-10 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es cualitativa: frente a una CNN, este MLP carece de invariancia a traslación y de peso compartido, lo que explica en parte su exactitud moderada. No se han publicado cifras de la IOC-NN en la información disponible.

## Limitaciones y advertencias

- Sobreajuste severo: 0,9406 de exactitud en entrenamiento frente a 0,5030 en test, con pérdida de test de 5,7946; el modelo está claramente sobreconfiado y mal calibrado.
- Ignora la estructura espacial: la entrada se aplana en orden fila-mayor, de modo que la red no explota la localidad de los píxeles.
- Una única ejecución con una sola semilla: las cifras no están promediadas sobre repeticiones, por lo que no deben tratarse como un resultado robusto.
- Sin comprobaciones de robustez, equidad ni calibración, según declara el propio autor.
- No apto para ninguna aplicación real: es material de curso, no un modelo de producción.
- Licencia no disponible, lo que impide determinar si el uso comercial está permitido; ante la ausencia de términos explícitos debe asumirse precaución y contactar con el autor.
- Idiomas no disponibles: al no procesar texto, no hay soporte multilingüe que evaluar.
- Formato propietario del assignment: los archivos `.npz` no se cargan con `Model.load_from` del propio enunciado (distinto layout y sin ELU), ni con herramientas estándar de inferencia.
- Dependencia del preprocesado exacto: usar otra media o desviación típica invalida los logits; los vectores publicados se calcularon solo sobre el split de entrenamiento.
- Entrada rígida: no admite imágenes de otra resolución ni de otro número de canales sin adaptación externa.
- Repositorio de 0,0 GB con 0 descargas y 0 likes: no hay comunidad, issues ni mantenimiento esperable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nav-07/smai-a4-q1-mlp-p0
- Ejecución de entrenamiento en Weights & Biases (run 4yjmbfdv): https://wandb.ai/navey011-international-institute-of-information-technol/smai-a4-q1/runs/4yjmbfdv
- Proyecto de Weights & Biases: https://wandb.ai/navey011-international-institute-of-information-technol/smai-a4-q1
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; las entradas devueltas corresponden a la valeur liquidative (NAV) financiera, al portal nav.no y al passe Navigo, y no guardan relación con este artefacto.
