# OneScience-Group/SirenFNO

## Resumen

SirenFNO es un operador neuronal (neural operator) entrenado para resolver la ecuación de Darcy bidimensional en mallas de 32x32, mapeando un campo de permeabilidad a su correspondiente campo de presión. Lo publica el grupo OneScience y reproduce el experimento "full-spectrum" del artículo SirenFNO presentado en IJCAI 2026, en concreto la fila correspondiente a Darcy 32x32 de la Tabla 2. No es un modelo de lenguaje: es un modelo científico de tipo surrogate para simulación de flujo en medios porosos.

La arquitectura combina bloques espectrales de tipo Fourier Neural Operator (FNO) con activaciones sinusoidales (SIREN), con cuatro bloques espectrales y anchura 32. Se entrenó durante 500 épocas sobre 1.000 muestras de campos de permeabilidad. El checkpoint publicado alcanza un error relativo L2 medio por muestra de 0,04524468 sobre 200 campos de test, frente al 0,0351 reportado en el artículo original.

Su relevancia es acotada pero concreta: sirve como referencia reproducible y ligera para evaluar operadores neuronales en problemas de Darcy, y como punto de partida para quien quiera experimentar con sustitutos neuronales de simuladores numéricos en CFD y geociencias. El repositorio no incluye datos ni pipeline de Hugging Face; solo los pesos y scripts de inferencia y entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neural operator con bloques espectrales (FNO) y activaciones sinusoidales (SIREN); 4 bloques espectrales, anchura 32 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: campo de permeabilidad en malla 32x32) |
| Tipos de cuantización | no disponible (pesos en PyTorch float32, checkpoint `best_model.pth`) |
| Idiomas soportados | no aplica (modelo numérico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo es un operador neuronal espectral con activaciones sinusoidales, diseñado para aprender el operador que asocia un campo de permeabilidad de entrada con su solución de presión en la ecuación de Darcy. La configuración publicada especifica cuatro bloques espectrales con anchura 32, lo que da un modelo deliberadamente pequeño y rápido de entrenar e inferir. La entrada y la salida son tensores float32 sobre una malla de 32x32.

El entrenamiento se realizó durante 500 épocas sobre 1.000 muestras, con la configuración y los scripts incluidos en el repositorio (`scripts/train.py`, `config/config.yaml`). Los datos originales de Darcy 32x32 provienen del equipo NeuralOperator en Zenodo y se replican en el dataset de ModelScope `OneScience/SirenFNO-Darcy32`. El repositorio de Hugging Face no incluye los ficheros de datos: el script de inferencia verifica el SHA256 de los datos contra el checkpoint. El checkpoint publicado (`weight/best_model.pth`, SHA256 `ceb2392d5ba68e386f08e0f117ea1705df1f3a0185d3cef0971f07951113ce1e`) corresponde al run original y no se ha reentrenado para esta publicación.

## Capacidades

- Resolución aproximada de la ecuación de Darcy 2D en mallas de 32x32: mapea permeabilidad a presión.
- Inferencia sobre lotes de campos de permeabilidad (el script procesa los 200 campos de test del conjunto publicado).
- Entrenamiento reproducible desde cero con los scripts y la configuración incluidos.
- Verificación de integridad de datos mediante SHA256 antes de la inferencia.
- Evaluación con métrica de error relativo L2 por muestra y generación de resultados y gráficas (`scripts/result.py`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo numérico específico de dominio.

## Casos de uso

- Surrogate rápido de simulador de Darcy: sustituir un solver numérico iterativo por una pasada de inferencia para obtener el campo de presión aproximado en problemas de flujo en medios porosos a resolución 32x32.
- Reproducción de resultados académicos: validar la fila de Darcy 32x32 de la Tabla 2 del artículo SirenFNO y comparar el error L2 obtenido (0,0452) con el reportado (0,0351).
- Baseline para investigación en operadores neuronales: punto de partida ligero para comparar variantes de FNO, SIREN u otros operadores en el mismo conjunto de datos de Darcy.
- Docencia y formación: ejemplo completo y de pequeño tamaño de un pipeline de entrenamiento e inferencia de un neural operator con datos, configuración y scripts incluidos.
- Prototipado en geociencias e ingeniería de reservorios: estimación preliminar de campos de presión para explorar configuraciones antes de lanzar simulaciones de mayor fidelidad.
- Pruebas de infraestructura en clústeres con aceleradores GPU o DCU: el paquete `onescience[cfd-gpu]` / `onescience[cfd-dcu]` permite validar el entorno de cómputo con una carga pequeña y verificable.

## Benchmarks y rendimiento

| Modelo | Conjunto de test | Error relativo L2 medio por muestra |
|---|---|---|
| SirenFNO (este checkpoint) | 200 campos Darcy 32x32 | 0,04524468 |
| SirenFNO (artículo, Tabla 2) | Darcy 32x32 | 0,0351 |

El error del checkpoint publicado es aproximadamente un 28,9 % superior al del artículo. El propio autor advierte que la definición de la pérdida y algunos detalles de implementación no especificados pueden diferir, por lo que no es una comparación estricta en idénticas condiciones. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de tamaño reducido (4 bloques espectrales, anchura 32) y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con soporte PyTorch; el paquete oficial soporta GPU y DCU (`onescience[cfd-gpu]`, `onescience[cfd-dcu]`).
- GPU consumer: sí, cabe en tarjetas consumer convencionales; no se especifican modelos concretos.
- Despliegue: scripts de PyTorch incluidos (`scripts/inference.py`, `scripts/train.py`, `scripts/result.py`) con configuración YAML; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada.
- Entorno: Python 3.11, PyTorch, PyYAML y Matplotlib; en clúster, ejecutar el cómputo en un nodo con acelerador asignado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / resolución | Error L2 (Darcy 32x32) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SirenFNO (este) | FNO + SIREN | 4 bloques, anchura 32 | malla 32x32 | 0,0452 (checkpoint) / 0,0351 (paper) | Apache 2.0 | Hugging Face, ModelScope |
| FNO estándar (NeuralOperator) | Fourier Neural Operator | no disponible | malla 32x32 | no disponible | no disponible | referencia en Zenodo (datos) |
| Otros operadores del artículo SirenFNO | no disponible | no disponible | malla 32x32 | no disponible | no disponible | no disponible |

No se dispone de datos comparativos detallados de modelos alternativos en la información proporcionada; la comparación con el FNO estándar y con las variantes del artículo requeriría consultar el paper original.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve Darcy 2D en mallas de 32x32; no generaliza a otras ecuaciones, geometrías o resoluciones sin reentrenamiento.
- Diferencia con el paper: el error del checkpoint (0,0452) es un 28,9 % superior al reportado (0,0351); los autores señalan posibles diferencias en la definición de la pérdida y en detalles de implementación no especificados.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, razonamiento, visión ni tool calling; no debe evaluarse con benchmarks de LLM.
- Datos no incluidos: el repositorio no contiene los ficheros de datos; es necesario descargarlos de Zenodo o ModelScope y respetar sus términos de uso y redistribución originales.
- Riesgo de error numérico acumulado en regímenes alejados de la distribución de entrenamiento (1.000 muestras), no cuantificado en la información disponible.
- Licencia Apache 2.0 para el código y los pesos, pero los términos del dataset de origen deben verificarse en la fuente Zenodo antes de un uso comercial o de redistribución.
- No hay pipeline de Hugging Face ni integración con frameworks de serving estándar; el despliegue requiere ejecutar los scripts de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/SirenFNO
- Paper SirenFNO (IJCAI 2026): https://ijcai.org/proceedings/2026/0535.pdf
- Datos originales Darcy 32x32 (NeuralOperator, Zenodo): https://zenodo.org/records/12784353
- Dataset espejo en ModelScope: https://www.modelscope.cn/datasets/OneScience/SirenFNO-Darcy32
