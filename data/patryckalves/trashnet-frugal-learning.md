# patryckalves/trashnet-frugal-learning

## Resumen

`patryckalves/trashnet-frugal-learning` es un conjunto de pesos y artefactos experimentales para clasificación de residuos sólidos sobre el dataset TrashNet (2.527 imágenes, 6 clases: glass, paper, cardboard, plastic, metal y trash). Lo desarrolla un grupo de estudiantes de la disciplina de Redes Neurais Artificiais del CCT de la Universidade de Fortaleza (UNIFOR), y el modelo principal es un YOLO11n-cls afinado sobre TrashNet a resolución 224×224.

El objetivo del trabajo no es tanto maximizar la precisión como medir el coste de distintas estrategias de aprendizaje en un escenario de Edge AI: compara entrenamiento desde cero (MLP y CNN pequeñas) contra transfer learning con YOLO11n, y evalúa técnicas de IA frugal como linear probing (congelar las primeras 10 capas), label smoothing y salida temprana (early-exit). Los resultados muestran que el linear probing conserva el 99,72 % de la eficacia del fine-tuning completo usando solo el 21,96 % de los pesos entrenables (337.926 de 1.538.790).

Es relevante como referencia reproducible y de bajo coste para clasificación visual de residuos en nodos de borde, y como estudio empírico sobre cuándo merece la pena el ajuste completo frente a alternativas paramétricamente frugales. El repositorio ocupa 0,5 GB e incluye pesos, particiones estratificadas, predicciones de test y metadatos empíricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11n-cls (CNN de la familia Ultralytics) para el modelo principal; MLP y CNN con Global Average Pooling como baselines |
| Parámetros totales | 1.538.790 en el fine-tuning completo de YOLO11n |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | pt, en (etiquetas y documentación; la tarea es visual) |
| Licencia | MIT |
| Formato de pesos | pt (PyTorch/Ultralytics); el repo también referencia Keras/TensorFlow para los baselines |
| Resolución de entrada | 224×224 (modelo principal); 128×96, 256×192 y 512×384 en los experimentos de resolución |
| Dataset | garythung/trashnet (2.527 imágenes, 6 clases) |
| Métricas declaradas | accuracy, F1 |

## Arquitectura y entrenamiento

El modelo principal es un YOLO11n-cls preentrenado y adaptado a TrashNet mediante transfer learning a 224×224. Sobre esa base se evalúan tres variantes: fine-tuning completo (1.538.790 parámetros entrenables, 407,1 s de entrenamiento, 92,37 % de accuracy y F1 macro 0,9299), linear probing con `freeze=10` (337.926 parámetros entrenables, el 21,96 %, 318,6 s, 92,11 % de accuracy y F1 macro 0,9213) y label smoothing con α=0,1 (91,84 % de accuracy, F1 macro 0,9115). La combinación de probing y smoothing reduce el tiempo a 237,5 s manteniendo el 92,11 % de accuracy.

Los experimentos de "tábua rasa" sirven de contraste: un MLP de 18.941.318 parámetros alcanza solo el 35,00 % de accuracy y F1 macro 0,2266, y con ponderación de clases cae al 15,53 % (F1 macro 0,0448). Una CNN pequeña con GAP (94.662 parámetros) llega al 58,16 % sin ponderación y al 56,32 % con ponderación inversa de clases, pero eleva el recall de la clase minoritaria trash del 5,0 % al 95,0 %. Aumentar la resolución de 128×96 a 512×384 multiplica el tiempo de entrenamiento por 9,3 sin mejora en F1, lo que el trabajo interpreta como evidencia a favor de Green AI. También se simula una política de early-exit: el 82,4 % del flujo puede resolverse en etapas intermedias con umbral τ ≥ 0,85, reduciendo la latencia efectiva un 53,5 % (de 10,29 ms a 4,78 ms, 209,2 FPS).

## Capacidades

- Clasificación de imágenes en 6 clases de residuos: glass, paper, cardboard, plastic, metal y trash.
- Transfer learning eficiente: linear probing con solo el 21,96 % de los pesos entrenables.
- Manejo de desbalance de clases mediante ponderación de pérdida inversamente proporcional (recall de trash del 5,0 % al 95,0 %).
- Inferencia adaptativa con early-exit por umbral de confianza (τ ≥ 0,85).
- Entrenamiento e inferencia en resolución variable (128×96, 224×224, 256×192, 512×384).
- Exportación y ejecución en el ecosistema Ultralytics (PyTorch) y baselines en Keras/TensorFlow.
- No soporta tool calling, agentes, razonamiento multi-step ni modalidades de texto, audio o vídeo.

## Casos de uso

- Clasificación de residuos en cintas transportadoras industriales: el modelo YOLO11n-cls a 224×224 ofrece 92,11 % de accuracy con linear probing, adecuado para separar flujos de glass, paper, cardboard, plastic y metal en plantas de reciclaje con recursos limitados.
- Despliegue en nodos de borde: con 337.926 parámetros entrenables en la variante frugal y latencias simuladas de 4,78 ms con early-exit, encaja en dispositivos con presupuesto de cómputo restringido.
- Sistemas de recogida selectiva con cámara: la clase trash alcanza un recall del 95 % con ponderación de clases, lo que permite detectar residuos no reciclables y derivarlos a rechazo.
- Control de calidad en plantas de papel y cartón: las clases paper (F1 0,94) y cardboard (F1 0,92) tienen métricas suficientes para inspección automatizada de lotes.
- Investigación y docencia en IA frugal: el repositorio incluye particiones estratificadas, predicciones de test y metadatos que permiten reproducir los experimentos E1–E6 y comparar paradigmas de entrenamiento.
- Prototipado rápido con Ultralytics: al usar pesos en formato `.pt` y la librería Ultralytics, se puede integrar en pipelines existentes de visión con mínima adaptación.
- Simulación de políticas de early-exit: útil para evaluar arquitecturas de inferencia adaptativa antes de invertir en hardware dedicado.

## Benchmarks y rendimiento

Evaluación sobre la partición de test canónica de 380 imágenes (15 % del dataset):

| Paradigma | Modelo / experimento | Resolución | Parámetros entrenables | Tiempo de entrenamiento | Accuracy test | F1 macro test | Recall trash |
|---|---|---|---|---|---|---|---|
| Tábua rasa | MLP sin pesos (E1) | 128×96 | 18.941.318 (100 %) | 20,3 s | 35,00 % | 0,2266 | 20,0 % |
| Tábua rasa | MLP con pesos w_c (E2) | 128×96 | 18.941.318 (100 %) | 10,7 s | 15,53 % | 0,0448 | 90,0 % |
| Tábua rasa | CNN sin pesos (E3) | 128×96 | 94.662 (100 %) | 47,3 s | 58,16 % | 0,4995 | 5,0 % |
| Tábua rasa | CNN con pesos w_c (E4, ref.) | 128×96 | 94.662 (100 %) | 42,1 s | 56,32 % | 0,5457 | 95,0 % |
| Tábua rasa | CNN sin pesos (E5) | 256×192 | 94.662 (100 %) | 124,6 s | 55,26 % | 0,4581 | 15,0 % |
| Tábua rasa | CNN sin pesos (E6) | 512×384 | 94.662 (100 %) | 438,3 s | 56,84 % | 0,4866 | 15,0 % |
| Transfer learning | YOLO11n full fine-tuning | 224×224 | 1.538.790 (100 %) | 407,1 s | 92,37 % | 0,9299 | 100,0 % |
| Frugal AI | YOLO11n linear probing (`freeze=10`) | 224×224 | 337.926 (21,96 %) | 318,6 s | 92,11 % | 0,9213 | 95,0 % |
| Frugal AI | YOLO11n label smoothing (α=0,1) | 224×224 | 1.538.790 (100 %) | 461,8 s | 91,84 % | 0,9115 | 100,0 % |
| Frugal AI | YOLO11n probing + smoothing | 224×224 | 337.926 (21,96 %) | 237,5 s | 92,11 % | 0,9213 | 95,0 % |

Desempeño por clase en test (precisión / recall / F1):

| Clase | Soporte | MLP (E1) | CNN (E3) | CNN con pesos (E4) | YOLO11n linear probing |
|---|---|---|---|---|---|
| glass | 76 | 0,32 / 0,32 / 0,32 | 0,46 / 0,63 / 0,53 | 0,57 / 0,39 / 0,47 | 0,90 / 0,88 / 0,89 |
| paper | 89 | 0,30 / 0,82 / 0,43 | 0,61 / 0,74 / 0,67 | 0,61 / 0,73 / 0,67 | 0,92 / 0,97 / 0,94 |
| cardboard | 60 | 0,61 / 0,60 / 0,61 | 0,75 / 0,78 / 0,76 | 0,91 / 0,67 / 0,77 | 0,98 / 0,87 / 0,92 |
| plastic | 73 | 0,00 / 0,00 / 0,00 | 0,54 / 0,59 / 0,56 | 0,58 / 0,58 / 0,58 | 0,89 / 0,89 / 0,89 |
| metal | 62 | 0,00 / 0,00 / 0,00 | 0,70 / 0,26 / 0,38 | 0,72 / 0,29 / 0,41 | 0,91 / 0,95 / 0,93 |
| trash | 20 | 0,00 / 0,00 / 0,00 | 0,50 / 0,05 / 0,09 | 0,24 / 0,95 / 0,38 | 0,95 / 0,95 / 0,95 |

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB para YOLO11n-cls a 224×224 en FP32; no se han publicado mediciones específicas de memoria en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para entrenamiento e inferencia; para entrenamiento a 512×384 conviene una GPU con al menos 8 GB.
- Cabe en GPU consumer: sí, incluso en GPUs de gama de entrada y en dispositivos de borde tipo Jetson.
- Opciones de despliegue: Ultralytics (PyTorch, formato `.pt`), exportación a ONNX/TensorRT mediante Ultralytics, y Keras/TensorFlow para los baselines. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI (no aplicables a visión).
- Latencia y throughput: la simulación de early-exit reporta 10,29 ms por imagen sin salida temprana y 4,78 ms con salida temprana (τ ≥ 0,85), equivalente a 209,2 FPS. Son cifras simuladas, no medidas en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| patryckalves/trashnet-frugal-learning (YOLO11n-cls) | 1.538.790 (337.926 entrenables en probing) | 224×224 | 92,11 % accuracy, F1 macro 0,9213 | MIT | Hugging Face, 0 descargas |
| SaifulAnw/sa-trashnet-classifier | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Baselines CNN del propio estudio (E3–E6) | 94.662 | 128×96 a 512×384 | 55–58 % accuracy | MIT | Incluidos en el repo |
| Baselines MLP del propio estudio (E1–E2) | 18.941.318 | 128×96 | 15–35 % accuracy | MIT | Incluidos en el repo |

No se dispone de datos de benchmarks de otros clasificadores de TrashNet en la información proporcionada, por lo que la comparación con alternativas externas queda limitada a la existencia del repositorio SaifulAnw/sa-trashnet-classifier, del que no se conocen métricas.

## Limitaciones y advertencias

- El dataset TrashNet es pequeño (2.527 imágenes) y tiene fondo uniforme; los resultados pueden no generalizar a imágenes reales de plantas de reciclaje con iluminación variable y fondos complejos.
- La clase trash tiene solo 20 imágenes en test, por lo que las métricas de esa clase tienen alta varianza.
- Las cifras de latencia y FPS del early-exit son simulaciones empíricas, no mediciones en hardware real.
- El modelo solo clasifica imágenes; no soporta texto, tool calling ni razonamiento multi-step.
- No se han publicado análisis de sesgos ni evaluaciones de robustez frente a dominios distintos de TrashNet.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de producción.
- El tamaño del repo (0,5 GB) incluye artefactos experimentales además de los pesos, lo que puede complicar el despliegue si solo se necesita el modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patryckalves/trashnet-frugal-learning
- Repositorio GitHub: https://github.com/patryckalves/trashnet-frugal-learning
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/patryckalves/trashnet-frugal-learning/blob/main/notebooks/02_training.ipynb
- Dataset TrashNet: https://huggingface.co/datasets/garythung/trashnet
- Paper de referencia citado en los tags: arXiv:2506.01869
- Modelo comparable en Hugging Face: https://huggingface.co/SaifulAnw/sa-trashnet-classifier
