# factlogic/weight-space-editor

## Resumen

Weight-Space Editor es un modelo de investigación desarrollado por factlogic que aborda el problema de la fusión de pesos en el contexto de edición de modelos. Concretamente, la red recibe dos versiones de un clasificador y un conjunto reducido de ejemplos etiquetados, y genera un tercer conjunto de pesos que combina las capacidades de ambos endpoints. No se trata de un modelo generativo de uso general, sino de un meta-modelo especializado en la manipulación del espacio de parámetros de otros modelos.

El checkpoint contiene únicamente 13.005 parámetros, lo que lo sitúa en la categoría de redes auxiliares de muy pequeño tamaño. Su entrenamiento se centró en tareas de intención en inglés y español, y según la model card logró elevar la precisión equilibrada por grupo en clasificadores de aeronaves no vistos del 55,27% al 63,90%, con una media de 87,82% en cuatro benchmarks frente al 86,64% de la mezcla lineal seleccionada por validación.

Su relevancia radica en que propone un enfoque aprendido para la fusión de modelos en lugar de las técnicas heurísticas habituales (mezcla lineal, TIES, DARE, etc.), y en que la mayor ganancia aprendida proviene de reescribir la cabeza de clasificación. El modelo está publicado con pesos en safetensors y formato PyTorch, orientado exclusivamente a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal auxiliar de edición de pesos (no disponible el detalle interno) |
| Parametros totales | 13.005 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; entrenado también con tareas en español según la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

La arquitectura concreta no está detallada en la información disponible más allá de que se trata de una red que opera sobre el espacio de pesos: recibe dos conjuntos de pesos alineados (endpoints) junto con ejemplos etiquetados de soporte y validación para cada clase, y emite un tercer conjunto de pesos. El checkpoint tiene 13.005 parámetros, lo que sugiere una red compacta que transforma o combina los parámetros de entrada de forma condicionada a los ejemplos.

El entrenamiento se realizó sobre tareas de intención en inglés y español, usando el dataset AmazonScience/massive. Según la model card, la mayor parte de la mejora aprendida procede de la reescritura de la cabeza de clasificación. Los resultados reportados indican una precisión equilibrada por grupo de 63,90% en clasificadores de aeronaves no vistos, frente al 55,27% de partida, y una media de 87,82% en cuatro benchmarks frente al 86,64% de la mezcla lineal seleccionada por validación. No se especifican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Edición de pesos: genera un tercer conjunto de pesos a partir de dos versiones de un clasificador.
- Fusión condicionada por ejemplos: utiliza ejemplos etiquetados de soporte y validación para cada clase para guiar la combinación.
- Mejora de cabezas de clasificación: la mayor ganancia aprendida se concentra en la reescritura de la cabeza de clasificación.
- Transferencia a clasificadores no vistos: los resultados reportados muestran mejora en clasificadores de aeronaves no vistos durante el entrenamiento.
- Soporte bilingüe en entrenamiento: tareas de intención en inglés y español.
- No es un modelo generativo: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Fusión de checkpoints de clasificación: combinar dos versiones de un clasificador (por ejemplo, un modelo base y uno ajustado) para obtener un tercer checkpoint con mejor precisión equilibrada por grupo, usando ejemplos etiquetados de validación.
- Edición de cabezas de clasificación en modelos de intención: reescribir la cabeza de un clasificador de intenciones entrenado en inglés y español para mejorar el rendimiento en clases con pocos ejemplos.
- Investigación en model merging: servir como línea base aprendida frente a métodos heurísticos como la mezcla lineal, TIES o DARE, con métricas por par de checkpoints en `paired_scores.csv`.
- Adaptación a dominios con clasificadores no vistos: aplicar el editor a clasificadores de aeronaves u otros dominios no vistos durante el entrenamiento, donde la model card reporta una subida del 55,27% al 63,90% en precisión equilibrada.
- Reproducción de experimentos: ejecutar `python inference.py` con el ejemplo sintético incluido para validar el pipeline de edición antes de aplicarlo a checkpoints propios.
- Evaluación de robustez de fusiones: comparar la precisión equilibrada por grupo de la mezcla lineal seleccionada por validación (86,64%) frente a la salida del editor (87,82%) en los cuatro benchmarks reportados.

## Benchmarks y rendimiento

| Benchmark / escenario | Resultado reportado |
|---|---|
| Clasificadores de aeronaves no vistos (precisión equilibrada por grupo, punto de partida) | 55,27% |
| Clasificadores de aeronaves no vistos (precisión equilibrada por grupo, con editor) | 63,90% |
| Media en cuatro benchmarks (editor) | 87,82% |
| Media en cuatro benchmarks (mezcla lineal seleccionada por validación) | 86,64% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de modelos de lenguaje, dado que este modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 13.005 parámetros el checkpoint ocupa del orden de decenas de kilobytes en fp32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) es más que suficiente. El cuello de botella será el modelo sobre el que se aplique la edición, no el editor.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en CPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante `inference.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| factlogic/weight-space-editor | 13.005 | no aplica | Edición de pesos aprendida | no disponible | Hugging Face |
| factlogic/weight-response-predictor | no disponible | no aplica | Modelo companion del mismo autor | no disponible | Hugging Face |
| Mezcla lineal seleccionada por validación | no aplica (método) | no aplica | Fusión heurística de pesos | no aplica | Método estándar |
| TIES / DARE | no aplica (métodos) | no aplica | Fusión heurística de pesos | no aplica | Métodos estándar |

No se dispone de datos de benchmarks comparativos con otros editores de pesos aprendidos en la información proporcionada.

## Limitaciones y advertencias

- Requiere endpoints alineados: los dos conjuntos de pesos de entrada deben estar alineados arquitectónicamente.
- Requiere ejemplos etiquetados de soporte y validación para cada clase; no funciona en escenarios sin etiquetas.
- Entrenado en tareas de intención en inglés y español; su generalización a otros dominios o idiomas no está documentada.
- Los resultados reportados se limitan a clasificadores de aeronaves y a cuatro benchmarks; no hay evidencia de rendimiento en otros tipos de modelos.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de generación, razonamiento o código.
- Riesgo de sobreajuste a los pares de checkpoints y datasets concretos usados en el entrenamiento.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/factlogic/weight-space-editor
- Modelo companion: https://huggingface.co/factlogic/weight-response-predictor
- Documentación de uso: https://huggingface.co/factlogic/weight-space-editor/blob/main/usage.md
- Paper (seis páginas): https://huggingface.co/factlogic/weight-space-editor/blob/main/paper.pdf
- Puntuaciones por par: https://huggingface.co/factlogic/weight-space-editor/blob/main/paired_scores.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/AmazonScience/massive
