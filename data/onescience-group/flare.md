# OneScience-Group/FLARE

## Resumen

FLARE (Fast Low-rank Attention Routing Engine) es un modelo basado en operadores neuronales desarrollado por OneScience-Group para la simulación de flujo en tuberías bidimensionales. Concretamente, este paquete reproduce el experimento de tubería curva (Pipe) descrito en el artículo arXiv:2508.12594, y su función es predecir la velocidad horizontal del fluido a partir de las coordenadas de la geometría de la tubería sobre una malla de 129x129 puntos. No se trata de un modelo de lenguaje, sino de un surrogate model para CFD (dinámica de fluidos computacional).

La arquitectura emplea ocho bloques de enrutamiento con atención de bajo rango, una anchura de 64 canales, ocho cabezas de atención y 128 consultas latentes por cabeza. El modelo se distribuye como un paquete de reproducción científica con pesos en formato PyTorch (`best_model.pth`) y scripts de entrenamiento e inferencia, orientado a investigadores que quieran validar o reutilizar el método FLARE en problemas de operadores neuronales.

Su relevancia radica en que ofrece una implementación reproducible y verificable del método, con métricas declaradas y comparadas frente al artículo original, lo que facilita la evaluación crítica y la extensión a otros dominios de física computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal con bloques de enrutamiento y atención de bajo rango (FLARE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de operador neuronal sobre malla 129x129) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica (modelo numérico, no lingüístico) |
| Licencia | other (ver términos en el repositorio; datos originales sujetos a Geo-FNO) |
| Formato de pesos | PyTorch (`weight/best_model.pth`, SHA256 `0614e1c38d42ccdaca786986b7db3790b91c6d37d25f3e2bedf1361427e969b2`) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura FLARE descrita en el artículo, compuesta por ocho bloques de enrutamiento con atención de bajo rango. Cada bloque utiliza ocho cabezas de atención y 128 consultas latentes por cabeza, con una anchura de 64. La entrada son las coordenadas de la tubería curva y la salida es el campo de velocidad horizontal sobre una malla de 129x129. El diseño busca reducir el coste computacional de la atención estándar mediante enrutamiento de bajo rango, manteniendo la capacidad de aproximar operadores físicos complejos.

El entrenamiento se realizó durante 500 épocas sobre 1.000 casos de entrenamiento, usando los arrays Geo-FNO Pipe (coordenadas `Pipe_X.npy`, `Pipe_Y.npy` y objetivo `Pipe_Q.npy`, canal 0). La evaluación se hizo sobre 200 casos de test. El autor advierte que el mismo conjunto de test se usó para seleccionar el mejor checkpoint y que se aplicó normalización identidad donde el artículo no es explícito, lo que limita la comparación directa con los resultados publicados.

## Capacidades

- Predicción de campos de velocidad horizontal en flujos de tubería bidimensionales a partir de coordenadas geométricas.
- Aproximación de operadores físicos sobre mallas regulares de 129x129.
- Inferencia mediante scripts de PyTorch (`scripts/inference.py`) y evaluación con `scripts/result.py`.
- Entrenamiento reproducible desde cero con `scripts/train.py` sobre el dataset Geo-FNO Pipe.
- Soporte de ejecución en GPU y DCU mediante los extras `onescience[cfd-gpu]` y `onescience[cfd-dcu]`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Validación de métodos de operadores neuronales: investigadores pueden reproducir el experimento Pipe y comparar métricas frente al artículo original usando los scripts incluidos.
- Surrogate modeling para CFD: sustituir simulaciones numéricas costosas de flujo en tuberías por inferencias rápidas del modelo sobre nuevas geometrías.
- Estudio de atención de bajo rango: analizar el comportamiento de los bloques de enrutamiento FLARE en problemas de física computacional.
- Benchmarking de infraestructura GPU/DCU: el paquete permite medir tiempos de entrenamiento e inferencia en distintos aceleradores con un caso controlado.
- Docencia en operadores neuronales: servir como ejemplo reproducible de pipeline completo (datos, entrenamiento, checkpoint, evaluación) para cursos avanzados.
- Extensión a otros dominios físicos: reutilizar la implementación FLARE como base para adaptar el método a otros campos (elasticidad, transferencia de calor) modificando el dataset y la salida.

## Benchmarks y rendimiento

| Metrica | FLARE (esta implementacion) | FLARE (articulo) | Diferencia |
|---|---|---|---|
| Error relativo L2 (200 casos de test) | 0.00324737 | 0.00285 | +13,94% |

El autor indica que el mismo conjunto de test se empleó para seleccionar el mejor checkpoint y que se usó normalización identidad donde el artículo no es explícito, por lo que la comparación debe interpretarse con cautela. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible; el autor menciona ejecución en GPU o DCU asignada, sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente.
- Opciones de despliegue: scripts de PyTorch incluidos (`scripts/inference.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FLARE (este repo) | Operador neuronal con atención de bajo rango | no disponible | malla 129x129 | L2 rel. 0.00324737 | other | Hugging Face |
| Geo-FNO (referencia del dataset) | Fourier Neural Operator con geometría | no disponible | malla 129x129 | no disponible en esta ficha | ver repositorio original | GitHub |
| FLARE (artículo original) | Operador neuronal con atención de bajo rango | no disponible | malla 129x129 | L2 rel. 0.00285 | no disponible | arXiv |

No se dispone de datos suficientes para una comparativa cuantitativa con otros operadores neuronales en la misma tarea.

## Limitaciones y advertencias

- El error relativo L2 es un 13,94% superior al del artículo original, lo que indica una brecha de rendimiento respecto a la implementación de referencia.
- El mismo conjunto de test se usó para seleccionar el mejor checkpoint, lo que puede inflar la métrica reportada.
- Se aplicó normalización identidad donde el artículo no es explícito, introduciendo una posible divergencia metodológica.
- Solo se completó una ejecución de 500 épocas; no hay evidencia de estabilidad entre semillas.
- El repositorio no incluye el dataset original; debe descargarse por separado desde ModelScope y están sujetos a los términos de Geo-FNO.
- La licencia es "other" y los datos originales tienen sus propios términos; es necesario revisarlos antes de cualquier uso comercial o redistribución.
- El modelo está especializado en un único caso (tubería bidimensional, canal 0 de Q) y no es generalizable sin reentrenamiento.
- No es un modelo de lenguaje: no soporta generación de texto, código, tool calling ni capacidades multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/OneScience-Group/FLARE
- Articulo: https://arxiv.org/pdf/2508.12594
- Dataset (ModelScope): https://www.modelscope.cn/datasets/OneScience/HO-FNO-Pipe
- Repositorio Geo-FNO: https://github.com/neuraloperator/Geo-FNO
