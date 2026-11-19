# OneScience-Group/MoNo-light

## Resumen

MoNo-light es un modelo de operador neuronal (neural operator) especializado en la resolución del problema de Darcy, un problema clásico de flujo en medios porosos que se utiliza como benchmark en el aprendizaje de operadores. El modelo predice el campo de presión a partir del campo de permeabilidad sobre una rejilla de 85x85, empleando variables latentes multiescala y transporte de Sinkhorn. Lo desarrolla OneScience-Group y se distribuye bajo licencia Apache 2.0.

Se trata de una reproducción del experimento MoNo-light Darcy recogido en la Tabla 3 del artículo MoNo (arXiv 2608.09764). El paquete incluye el checkpoint entrenado, los scripts de inferencia, evaluación y entrenamiento, y los resultados de una ejecución de un solo seed con 500 épocas sobre 1.000 muestras de entrenamiento y 200 de test.

A diferencia de los modelos de lenguaje, MoNo-light no procesa texto ni genera lenguaje: es un modelo científico de inferencia numérica sobre campos físicos. Su relevancia radica en que reproduce con fidelidad el resultado del artículo (error relativo L2 medio de 0,00693725 frente a 0,0070 publicado) y ofrece un paquete reproducible y ejecutable en GPU/DCU mediante el framework OneScience.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal con variables latentes multiescala y transporte de Sinkhorn (MoNo-light) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: rejilla 85x85 de permeabilidad) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en `best_model.pth`) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), checkpoint `weight/best_model.pth` |

## Arquitectura y entrenamiento

MoNo-light es un operador neuronal que aprende el mapeo entre el campo de permeabilidad y el campo de presión del problema de Darcy. La arquitectura se basa en variables latentes multiescala combinadas con transporte de Sinkhorn, según se describe en el artículo MoNo (arXiv 2608.09764). El modelo opera sobre una rejilla de 85x85, obtenida al aplicar un stride de cinco sobre las rejillas originales de 421x421 de los ficheros MAT de Darcy.

El entrenamiento se realizó con un único seed durante 500 épocas, usando 1.000 muestras de entrenamiento y 200 de test extraídas de los ficheros `piececonst_r421_N1024_smooth1.mat` y `piececonst_r421_N1024_smooth2.mat`. No se dispone de información sobre la composición exacta del dataset más allá de su origen (ficheros FNO Darcy), ni sobre el uso de técnicas de ajuste fino adicionales. El checkpoint final recargado alcanza un error relativo L2 medio de 0,00693725 en test.

## Capacidades

- Predicción del campo de presión a partir de la permeabilidad en el problema de Darcy sobre rejilla 85x85.
- Modelado de operadores neuronales con variables latentes multiescala.
- Uso de transporte de Sinkhorn como componente del cómputo interno.
- Inferencia numérica sobre campos físicos bidimensionales.
- Reproducción de resultados de investigación con scripts de inferencia, evaluación y entrenamiento incluidos.
- Ejecución en GPU y DCU mediante el framework OneScience (`onescience[cfd-gpu]` o `onescience[cfd-dcu]`).
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni generación de texto.

## Casos de uso

- Reproducción de benchmarks científicos: permite replicar el resultado de la Tabla 3 del artículo MoNo para validar la implementación y comparar con otros operadores neuronales.
- Simulación de flujo en medios porosos: el modelo predice el campo de presión a partir de la permeabilidad, útil en estudios de hidrología subterránea y yacimientos.
- Prototipado de operadores neuronales: sirve como referencia ejecutable para investigadores que desarrollan nuevos operadores multiescala.
- Evaluación comparativa de métodos numéricos: su error L2 de referencia (0,00693725) permite contrastar alternativas como FNO o DeepONet en el mismo problema.
- Docencia e investigación en aprendizaje científico: paquete autocontenido con scripts, datos de origen y resultados para cursos o laboratorios de ML científico.
- Integración en pipelines de simulación acelerada: sustitución de solvers numéricos costosos por inferencia neuronal en escenarios de Darcy con rejillas de 85x85.

## Benchmarks y rendimiento

| Metrica | MoNo-light (este paquete) | MoNo (paper, Tabla 3) |
|---|---|---|
| Error relativo L2 medio en test | 0,00693725 | 0,0070 |

La diferencia numérica respecto al artículo es de aproximadamente un 0,9 %. El autor advierte que las condiciones de hardware, software y el kernel de Sinkhorn difieren del entorno original, por lo que no debe interpretarse como superioridad estricta en condiciones idénticas. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeño, pero no se especifica la VRAM necesaria).
- GPU recomendadas: no disponible; el autor indica ejecución en GPU o DCU asignada mediante OneScience.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts de inferencia del propio paquete (`python scripts/inference.py`), con PyTorch y el framework OneScience (`onescience[cfd-gpu]` o `onescience[cfd-dcu]`).
- Latencia y throughput: no disponibles.
- Requisitos de entorno: Python 3.11, PyTorch, SciPy, PyYAML, Matplotlib; los ficheros MAT originales suman unos 3,39 GB y requieren RAM suficiente en la primera carga.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento (error L2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoNo-light (este) | Operador neuronal multiescala + Sinkhorn | no disponible | Rejilla 85x85 | 0,00693725 | Apache 2.0 | Hugging Face |
| MoNo (paper) | Operador neuronal multiescala + Sinkhorn | no disponible | Rejilla 85x85 | 0,0070 | no disponible | Artículo arXiv |
| FNO Darcy | Operador neuronal (Fourier) | no disponible | Rejilla 421x421 (origen de datos) | no disponible en esta ficha | no disponible | Ficheros de datos públicos |

No se dispone de datos comparativos adicionales de otros operadores neuronales en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en el problema de Darcy sobre rejilla 85x85; no es un modelo de propósito general ni procesa texto.
- Entrenado con un único seed, lo que limita la robustez estadística de los resultados.
- El resultado reportado no constituye evidencia de superioridad estricta frente al artículo original, ya que las condiciones de hardware, software y kernel de Sinkhorn difieren.
- No se dispone de información sobre sesgos, alucinación o comportamiento fuera de la distribución del problema de Darcy.
- El repositorio contiene solo el modelo, no los datos brutos; es necesario descargar el dataset HNO-Darcy desde ModelScope.
- Los datos de origen (ficheros FNO Darcy) tienen sus propios términos de uso que deben verificarse antes de redistribuirlos.
- La licencia Apache 2.0 permite uso comercial del modelo, pero no cubre necesariamente los datos de origen.
- No se especifican requisitos de VRAM ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/MoNo-light
- Artículo MoNo: https://arxiv.org/pdf/2608.09764v1
- Dataset HNO-Darcy en ModelScope: https://www.modelscope.cn/datasets/OneScience/HNO-Darcy
- Ficheros originales FNO Darcy: https://drive.google.com/drive/folders/1UnbQh2WWc6knEHbLn-ZaXrKUZhp7pjt-
