# OneScience-Group/D-SENO

## Resumen

D-SENO (Dilated Squeeze and Excitation Neural Operator) es un operador neuronal profundo especializado en la resolución de ecuaciones diferenciales sobre geometrías complejas. Este repositorio concreto reproduce el experimento Pipe-G del artículo "Efficient Dilated Squeeze and Excitation Neural Operator for Differential Equations" (arXiv:2601.17407), y mapea coordenadas X/Y de una tubería curva a la velocidad horizontal del flujo sobre una malla de 129x129. Lo desarrolla OneScience-Group y se distribuye como paquete PyTorch reproducible.

El modelo no es un modelo de lenguaje ni un transformer generativo: es un surrogate neuronal para simulación de dinámica de fluidos computacional (CFD), pensado para sustituir solvers numéricos costosos en escenarios de geometría parametrizada. Su relevancia radica en que alcanza un error L2 relativo de test de 0,00292652 (checkpoint semilla 11), en línea con el 0,0030 reportado en el paper, con solo siete bloques y ancho 96, lo que lo hace extremadamente ligero (repo de 0,2 GB) frente a solvers tradicionales.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio de Hugging Face. No hay información disponible sobre idiomas, tokenizador, benchmarks de NLP ni capacidades generativas, porque el modelo no las tiene: es un operador neuronal de regresión campo-a-campo sobre mallas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal D-SENO (Dilated Squeeze and Excitation Neural Operator), 7 bloques, ancho 96 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: malla 129x129 con coordenadas X/Y) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch `.pth`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (ver términos del repositorio; datos originales Geo-FNO con sus propios términos) |
| Formato de pesos | PyTorch (`weight/best_model.pth`, SHA256 `f6464c8bd42694228df105abd651dfbe075fb92ba1464ad4835cc889c35bad95`) |

## Arquitectura y entrenamiento

D-SENO es un operador neuronal que combina bloques con convoluciones dilatadas y mecanismos de squeeze-and-excitation, según el artículo de referencia. La instancia publicada aquí usa siete bloques con ancho 96 y mapea las coordenadas X/Y de una tubería curva (entrada de 129x129) a la componente horizontal de velocidad del flujo (canal 0 de `Pipe_Q.npy`) sobre la misma malla. El entrenamiento se realizó con tres semillas independientes, 500 épocas por semilla, sobre 1.000 casos de entrenamiento y 200 de test, según la model card.

Los datos provienen del dataset Geo-FNO Pipe (OneScience/HO-FNO-Pipe en ModelScope), con 2.310 casos en total sobre malla 129x129; `Pipe_X.npy` y `Pipe_Y.npy` contienen coordenadas y `Pipe_Q.npy` los campos de flujo. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación (no aplican a este tipo de modelo). La innovación técnica principal es la eficiencia del operador: con solo siete bloques y ancho 96 se alcanza un error L2 relativo de test de 0,00292652, comparable al 0,0030 del paper.

## Capacidades

- Predicción de campos de velocidad horizontal en flujos internos de tubería curva a partir de coordenadas geométricas.
- Evaluación sobre malla fija de 129x129 con coordenadas X/Y como entrada.
- Reproducibilidad completa: scripts de inferencia (`scripts/inference.py`) y de evaluación (`scripts/result.py`), además de entrenamiento (`scripts/train.py --seed 11`).
- Soporte multi-semilla: checkpoints y resultados para tres semillas (semilla 11 incluida como checkpoint principal).
- Capacidad de reentrenamiento con directorios de salida independientes por semilla (`--output-root`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Surrogate CFD en diseño de tuberías: sustituir el solver numérico por una pasada del operador para evaluar rápidamente la distribución de velocidad horizontal en geometrías curvas, reduciendo el coste computacional frente a simulaciones completas.
- Optimización de forma en ingeniería: integrar el modelo en bucles de optimización donde se generan muchas variantes de coordenadas X/Y y se necesita una estimación inmediata del campo de flujo para filtrar candidatos.
- Validación de solvers numéricos: usar las predicciones como referencia rápida para detectar discrepancias groseras en simulaciones de mayor fidelidad antes de lanzar costosos runs de HPC.
- Docencia e investigación en operadores neuronales: el paquete reproducible con tres semillas y resultados documentados sirve como banco de pruebas para comparar arquitecturas de neural operators.
- Generación de datasets sintéticos aumentados: producir campos de flujo aproximados sobre geometrías parametrizadas para preentrenar o aumentar otros modelos de surrogate.
- Despliegue en HPC/DCU: el paquete incluye extras `onescience[cfd-gpu]` y `onescience[cfd-dcu]`, lo que permite ejecutarlo en nodos de cómputo con GPU o aceleradores DCU en entornos de simulación industrial.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Error L2 relativo de test (checkpoint semilla 11) | 0,00292652 |
| Error L2 relativo de test (media de mejores checkpoints, 3 semillas) | 0,00289914 |
| Error L2 relativo de test (media de última época, 3 semillas) | 0,00307909 |
| Error L2 relativo reportado en el paper | 0,0030 |

Nota: los mejores checkpoints se seleccionaron usando el mismo conjunto de test, por lo que esas cifras no son resultados de test final independientes; la model card remite a `results/three_seed_summary.json` para el registro completo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; el repo pesa 0,2 GB y la arquitectura es de 7 bloques con ancho 96, por lo que la huella es muy reducida y cabe en GPUs de consumo.
- GPU recomendadas: no especificadas; la model card indica "GPU/DCU allocation" y el uso de extras `onescience[cfd-gpu]` o `onescience[cfd-dcu]`. Por el tamaño del modelo, una RTX 4090 o incluso GPUs de gama media serían suficientes.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (0,2 GB) y la profundidad de la red.
- Opciones de despliegue: ejecución directa con PyTorch mediante los scripts del paquete (`scripts/inference.py`, `scripts/result.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| D-SENO (este repo) | Neural operator D-SENO | no disponible (7 bloques, ancho 96) | Malla 129x129 | L2 rel. test 0,00292652 | other |
| Geo-FNO (referencia de datos) | Fourier Neural Operator geométrico | no disponible | Malla 129x129 | no disponible en esta ficha | ver Geo-FNO |
| Otros operadores neuronales del paper D-SENO | Neural operators | no disponible | no disponible | 0,0030 reportado para D-SENO en paper | no disponible |

No se dispone de datos comparativos adicionales en la información proporcionada; cualquier comparación con otros operadores neuronales requeriría consultar el paper arXiv:2601.17407 y el repositorio Geo-FNO.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice velocidad horizontal en tuberías curvas sobre malla 129x129; no generaliza a otras geometrías, variables o resoluciones sin reentrenamiento.
- Los mejores checkpoints se seleccionaron con el mismo conjunto de test, por lo que las cifras "best" no son estimaciones independientes; usar la media de última época (0,00307909) como referencia más honesta.
- Licencia "other": es imprescindible revisar los términos del repositorio y, especialmente, los del dataset original Geo-FNO antes de cualquier uso comercial o redistribución.
- El repositorio no incluye el dataset crudo; hay que descargarlo de ModelScope, lo que añade una dependencia externa y posibles condiciones de uso adicionales.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esos riesgos no aplican, pero sí el riesgo de extrapolación fuera del régimen de entrenamiento (geometrías o números de Reynolds no vistos).
- Requiere Python 3.10, PyTorch y el paquete `onescience` con extras CFD; en HPC es necesario usar una asignación de nodo de cómputo.
- No se publican métricas de latencia ni throughput, lo que dificulta estimar su viabilidad en producción sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/D-SENO
- Paper: https://arxiv.org/pdf/2601.17407
- Dataset en ModelScope: https://www.modelscope.cn/datasets/OneScience/HO-FNO-Pipe
- Repositorio Geo-FNO: https://github.com/neuraloperator/Geo-FNO
