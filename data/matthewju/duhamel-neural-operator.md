# matthewju/duhamel-neural-operator

## Resumen

Duhamel Neural Operator es un modelo de operador neuronal (neural operator) desarrollado por Matthew Ju y colaboradores (Yingheng Tang, Kang'an Wang, Haozhi Sha), con copyright de The Regents of the University of California a través del Lawrence Berkeley National Laboratory. El modelo resuelve un problema concreto de la simulación científica: aprender la dinámica de campos de fase (phase-field) en materiales ferroeléctricos descritos por la ecuación de Ginzburg-Landau dependiente del tiempo (TDGL), actuando como surrogate model que sustituye simulaciones numéricas costosas por inferencia neuronal.

La propuesta técnica se basa en una formulación de Duhamel para operadores neuronales, que descompone la solución de la EDP en una respuesta lineal más una corrección no lineal, apoyándose en una memoria de Fourier (Fourier SSM) medida directamente de las simulaciones de entrenamiento. El repositorio de Hugging Face no contiene pesos de un modelo de lenguaje, sino 109 checkpoints entrenados (`.pt`) que reproducen todos los resultados del artículo publicado en NeurIPS AI4Mat 2026, junto con los bancos de coeficientes de Fourier necesarios para la inferencia.

Es relevante ahora porque elimina la barrera de reproducibilidad: permite saltarse el entrenamiento (unas 2 GPU-días) y pasar directamente a la evaluación sobre los conjuntos de datos D1/D2 de TDGL ferroeléctrico, bucles de histéresis y Allen-Cahn, incluyendo los experimentos de ablación, cambio de unidades y eficiencia de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador neuronal basado en formulación de Duhamel con memoria de Fourier (Fourier SSM); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre campos espaciotemporales de la EDP) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.pt` (diccionarios PyTorch con `model` y `args`); bancos de Fourier en `.npz` |

## Arquitectura y entrenamiento

El modelo implementa un operador neuronal que aprende la evolución temporal de campos de fase resolviendo la EDP de Ginzburg-Landau dependiente del tiempo (TDGL) para materiales ferroeléctricos. La innovación central es la formulación de Duhamel: la solución se expresa como la convolución de una respuesta impulsional con el término forzante, donde la parte lineal se captura mediante una memoria de Fourier (Fourier SSM) estimada a partir de las simulaciones de entrenamiento, y la corrección no lineal se aprende con una red neuronal. Esto aprovecha estructura física conocida del problema en lugar de aprender toda la dinámica desde cero.

Los datos de entrenamiento proceden del dataset `matthewju/ferroelectric-tdgl-bench` (DOI 10.57967/hf/11169), que incluye simulaciones TDGL (tareas D1 y D2), bucles de histéresis y Allen-Cahn. El repositorio contiene 109 checkpoints que cubren todos los seeds de entrenamiento, todas las líneas base comparadas en el artículo, los experimentos de ablación, los de cambio de unidades (`_nounits`) y los de eficiencia de datos con 32 y 128 materiales de entrenamiento (`_K32`, `_K128`). El coste de entrenamiento declarado es de aproximadamente 2 GPU-días. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset más allá de las tareas citadas.

## Capacidades

- Predicción de la evolución de campos de fase ferroeléctricos gobernados por la ecuación TDGL (tareas D1 y D2).
- Modelado de bucles de histéresis ferroeléctrica (variante `_closed`).
- Simulación de dinámica de Allen-Cahn como caso de prueba adicional.
- Surrogate modeling de EDPs: sustituye simuladores numéricos por inferencia neuronal.
- Evaluación con cambio de unidades físicas y sin él (`_nounits`), lo que permite analizar la invariancia de escala.
- Régimen de eficiencia de datos: variantes entrenadas con solo 32 o 128 materiales.
- Reproducibilidad completa de los resultados del artículo mediante scripts de evaluación.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Simulación acelerada de materiales ferroeléctricos: el modelo predice la evolución del campo de polarización bajo TDGL sin resolver numéricamente la EDP en cada paso temporal, lo que reduce el coste computacional de barridos de parámetros.
- Diseño de memorias ferroeléctricas: la variante de histéresis permite generar curvas P-E para distintas condiciones y comparar materiales candidatos antes de fabricar prototipos.
- Estudio de transiciones de fase: la tarea Allen-Cahn permite validar el operador en un problema canónico de evolución de interfaces antes de aplicarlo a sistemas más complejos.
- Investigación en operadores neuronales: los 109 checkpoints y las líneas base incluidas permiten reproducir comparativas sin reentrenar, útil para grupos que desarrollan nuevos operadores.
- Análisis de eficiencia de datos: las variantes `_K32` y `_K128` sirven para estudiar cuántas simulaciones de alta fidelidad se necesitan para alcanzar un error objetivo, informando la planificación de campañas de cálculo.
- Validación de invariancia de unidades: la variante `_nounits` permite analizar si el modelo aprende dinámicas físicamente consistentes o depende de la escala de los datos.
- Docencia y formación: el pipeline de evaluación completo (`evaluate_all.sh`, `make_tables.sh`) permite reproducir las tablas del artículo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los checkpoints reproducen "cada número del artículo", pero los valores concretos de error (por ejemplo, MSE relativo frente a las líneas base) no se incluyen en la información proporcionada; deben consultarse en `paper/paper.pdf` del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de malla y del horizonte temporal de cada tarea (TDGL D1/D2, histéresis, Allen-Cahn).
- GPU recomendadas: no especificadas en la información disponible; el entrenamiento completo se declara en unas 2 GPU-días, lo que sugiere GPUs de datacenter (A100/H100) para el ciclo completo, aunque la inferencia de un checkpoint individual puede ser mucho más ligera.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio pesa 4,6 GB (109 checkpoints más bancos de Fourier), por lo que el almacenamiento, más que la VRAM, es el factor limitante para descargar todo.
- Opciones de despliegue: PyTorch nativo mediante el repositorio `matthew-ju/Duhamel-Neural-Operator`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Duhamel Neural Operator | Operador neuronal (Duhamel + Fourier SSM) | TDGL ferroeléctrico, histéresis, Allen-Cahn | BSD-3-Clause | Checkpoints y código públicos |
| Líneas base del artículo (FNO, DeepONet y otras) | Operadores neuronales | Mismas tareas | Según implementación original | Checkpoints incluidos en este repositorio |
| Simulador numérico TDGL | Método numérico directo | TDGL | no disponible | Implementaciones diversas |

La información disponible no detalla los nombres ni las especificaciones individuales de todas las líneas base comparadas; el repositorio incluye sus checkpoints entrenados con los mismos seeds, lo que permite una comparación directa, pero los valores numéricos deben extraerse del artículo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta instrucciones, tool calling ni agentes; cualquier uso en ese sentido es inadecuado.
- El ámbito está restringido a dinámicas de campos de fase ferroeléctricos y Allen-Cahn; la extrapolación a otras EDPs o regímenes físicos no está validada en la información disponible.
- La calidad de la inferencia depende de los bancos de Fourier (`alpha_bank_*.npz`) medidos de las simulaciones de entrenamiento; usarlos con datos fuera de distribución puede degradar los resultados.
- Riesgo de error acumulado en rollouts temporales largos: no se documenta en la información proporcionada el horizonte máximo validado.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright (Regents of the University of California / Lawrence Berkeley National Laboratory) y no permite usar los nombres de los contribuyentes para promocionar derivados sin permiso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación independiente.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero sí posibles sesgos de los datos de simulación (condiciones de contorno, parámetros materiales) que se transferirán al surrogate.

## Enlaces

- Hugging Face (checkpoints): https://huggingface.co/matthewju/duhamel-neural-operator
- Dataset: https://huggingface.co/datasets/matthewju/ferroelectric-tdgl-bench
- DOI del dataset: https://doi.org/10.57967/hf/11169
- Código: https://github.com/matthew-ju/Duhamel-Neural-Operator
- Artículo (PDF): https://github.com/matthew-ju/Duhamel-Neural-Operator/blob/main/paper/paper.pdf
