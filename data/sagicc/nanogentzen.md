# Sagicc/nanoGentzen

## Resumen

nanoGentzen es un modelo de red neuronal compacto de 4,86 millones de parámetros, desarrollado por Sagicc, que actúa como guía neural para la búsqueda de demostraciones automáticas en el cálculo de secuenciales de Gentzen para lógica intuicionista (LI). En lugar de generar texto, el modelo evalúa secuentes lógicos Γ ⊢ Δ (con |Δ| ≤ 1) y predice qué regla de deducción aplicar, qué antecedente seleccionar y el valor de demostrabilidad de la rama en el intervalo [0, 1]. Está entrenado sobre un conjunto de 200 000 transiciones certificadas y combina un transformer bidireccional con un kernel simbólico determinista que garantiza el 100 % de corrección en las transiciones.

La relevancia de este modelo reside en su enfoque híbrido: separa la propuesta heurística de pasos de búsqueda (red neuronal) de la verificación lógica (kernel simbólico), lo que permite acelerar la búsqueda de pruebas sin sacrificar solidez. Es un sistema ligero, entrenado en solo 30,5 minutos en una GPU RTX 4090, y su espacio de acciones discreto (11 reglas, 16 pivotes) lo hace especialmente adecuado para integración en sistemas de verificación formal y demostración automática de teoremas. Aunque no es un modelo de lenguaje general, su diseño demuestra una vía eficiente para aplicar aprendizaje por refuerzo a problemas de razonamiento lógico estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (6 bloques, 8 cabezas de atención, tamaño oculto 256) |
| Parametros totales | 4 861 185 (~4,86 M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | no disponible (formato nativo bfloat16/fp32) |
| Idiomas soportados | en (símbolos lógicos y tokens de fórmulas) |
| Licencia | MIT |
| Formato de pesos | safetensors y .pt |

## Arquitectura y entrenamiento

nanoGentzen es un transformer bidireccional de 6 capas con 8 cabezas de atención y una dimensión oculta de 256. Su entrada es una secuencia tokenizada del secuencial Γ ⊢ Δ, con un límite de contexto de 256 tokens. El modelo implementa tres cabezas de salida: una política de reglas (clasificación sobre 11 reglas del cálculo de secuenciales), una política de pivote (selección de índice de antecedente entre 16 posiciones) y un valor de rama (regresión a un escalar en [0, 1] que estima la probabilidad de que la rama sea demostrable).

El entrenamiento se realizó sobre un conjunto de 200 000 transiciones certificadas (dataset Sagicc/nanoGentzen) durante 20 épocas, con una pérdida multitarea que combina entropía cruzada para las dos políticas y error cuadrático medio para el valor. Se utilizó precisión mixta bfloat16, un tamaño de lote de 256 y una GPU RTX 4090, con un consumo máximo de 11 GB de VRAM. El tiempo total de entrenamiento fue de 30,5 minutos, con una política de decaimiento de tasa de aprendizaje coseno y calentamiento lineal. La precisión de validación para la predicción de reglas alcanzó aproximadamente el 80,5% en Top-1 y más del 98% en Top-3, lo que permite una poda eficiente en la búsqueda de prueba.

El sistema completo se compone de dos módulos separados: un kernel simbólico determinista (kernel.py) que implementa la lógica del cálculo de secuenciales (aplicación de reglas, comprobación de axiomas y verificación de árboles de prueba), y un controlador de búsqueda neural (search.py) que consulta el modelo, ordena las reglas candidatas por probabilidad y poda las estructuralmente inválidas. Esta separación garantiza que el modelo proponga pero nunca decida la corrección, que siempre la valida el kernel.

## Capacidades

- Predicción de la regla de deducción correcta en el cálculo de secuenciales para lógica proposicional intuicionista (LI), con un espacio de 11 reglas que incluye reglas derechas (R_IMP, R_AND, R_OR_1, R_OR_2, R_NOT) y reglas izquierdas (L_IMP, L_AND, L_OR, L_NOT) más contracción (L_CONTR).
- Selección del antecedente (premisa) correcto entre hasta 16 posibles, lo que permite guiar la búsqueda en secuenciales con múltiples hipótesis.
- Estimación del valor de demostrabilidad de una rama en [0, 1], útil para podar ramas de baja probabilidad durante la búsqueda AND-OR.
- Integración con un kernel simbólico que garantiza que cada transición propuesta sea válida y que los árboles de prueba generados sean verificables.
- No es un modelo de generación de texto ni de razonamiento en lenguaje natural: opera exclusivamente sobre secuenciales formalizados.
- Capacidad de procesar fórmulas proposicionales con conectivos: negación, conjunción, disyunción e implicación, incluyendo el axioma de identidad y la regla de ex falso quodlibet.

## Casos de uso

- **Verificación formal de teoremas proposicionales**: el modelo puede integrarse en asistentes de demostración como Coq o Lean como heurística de búsqueda automática, reduciendo el espacio de exploración de reglas y acelerando la validación de lemas sencillos.
- **Enseñanza de lógica computacional**: se puede usar como herramienta didáctica para generar demostraciones paso a paso de secuenciales intuicionistas, mostrando el árbol de prueba y las reglas aplicadas en cada nodo.
- **Sistema de tutoría inteligente en razonamiento lógico**: dado un secuencial propuesto por el alumno, el modelo puede predecir los siguientes pasos de deducción y ofrecer retroalimentación sobre la elección de regla y premisa.
- **Generación de árboles de prueba para datasets sintéticos**: al combinar el modelo con el kernel simbólico, se pueden generar millones de demostraciones certificadas para entrenar otros sistemas de razonamiento o para aumentar datasets de IA.
- **Optimización de búsqueda en demostradores de teoremas**: integrado en sistemas como leanDojo o proveedores de propósito general, actúa como política de selección de reglas, reduciendo el factor de ramificación en la búsqueda hacia atrás.
- **Validación de argumentos en sistemas expertos**: se puede usar para comprobar si una conclusión proposicional se sigue de un conjunto de premisas dentro de la lógica intuicionista, útil en sistemas de asistencia a la decisión basados en reglas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible, ya que este modelo no está orientado a tareas de lenguaje general. Los datos de rendimiento que se proporcionan son internos:

| Metrica | Valor |
|---|---|
| Precision de regla Top-1 (validación) | ~80,5 % |
| Precision de regla Top-1 (entrenamiento) | ~82,6 % |
| Cobertura de regla Top-3 | >98 % |
| Perdida multi-tarea (entrenamiento) | 1,042 → 0,575 |
| Perdida multi-tarea (validación) | 0,861 → 0,655 |
| Tiempo de entrenamiento | 30,5 minutos (20 épocas) |

Estas métricas corresponden al modelo de política neuronal y no a la corrección de la búsqueda completa, que queda garantizada por el kernel simbólico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4,86 M de parámetros, la inferencia es muy ligera. En formato fp32, el modelo ocupa aproximadamente 19,4 MB; en bfloat16, unos 9,7 MB. Cabe en cualquier GPU con más de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; la propia RTX 4090 usada para entrenamiento es más que suficiente. También se puede ejecutar en GPUs integradas o incluso en CPU con baja latencia.
- **Cabe en consumer GPU**: sí, en cualquier GPU de consumo actual (RTX 3060, RTX 4060, etc.) e incluso en entornos de cómputo sin GPU.
- **Opciones de despliegue**: al ser una librería personalizada con PyTorch, se puede desplegar con TorchServe, ONNX Runtime (si se exporta) o directamente en un script de Python. No es compatible directamente con vLLM, llama.cpp u Ollama, porque no es un modelo de generación de texto.
- **Latencia y throughput**: no se han publicado datos de latencia, pero por el tamaño y arquitectura se espera una inferencia en el orden de microsegundos a pocos milisegundos por secuencial en GPU, y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la información disponible. Los sistemas de demostración automática de teoremas suelen ser de tipo simbólico puro (como Lean, Coq, Isabelle) o modelos de lenguaje de gran tamaño con fine-tuning para razonamiento (como GPT-4o o Claude), pero no hay un modelo de política-valor específico para cálculo de secuenciales proposicionales con el mismo diseño híbrido y tamaño. Por tanto, no se dispone de una tabla comparativa con alternativas equivalentes.

## Limitaciones y advertencias

- **Alcance limitado a lógica proposicional intuicionista**: el modelo no maneja lógica de primer orden, cuantificadores ni lógica clásica completa (aunque incluye contracción para pruebas a la Glivenko).
- **Dependencia de la tokenización de fórmulas**: la entrada debe estar formalizada como secuenciales; no acepta lenguaje natural ni expresiones informales.
- **Precisión de regla limitada**: la precisión Top-1 de validación es del 80,5 %, lo que significa que en aproximadamente una de cada cinco secuenciales la regla propuesta no es la correcta; la búsqueda depende de la cobertura Top-3 para mantener la eficiencia.
- **Sesgo de entrenamiento**: el conjunto de datos es generado automáticamente y puede no cubrir todos los casos patológicos de la lógica intuicionista, especialmente secuenciales con muchos antecedentes (más de 16) o fórmulas muy profundas.
- **Sin soporte multilingüe**: los tokens y el vocabulario están en inglés (nombres de reglas, variables), lo que limita su uso en interfaces en español sin adaptación.
- **Licencia MIT**: permite uso comercial y modificación, pero no incluye garantías de solidez en todos los casos; la corrección de la búsqueda depende del kernel simbólico externo, no del modelo en sí.
- **Sin soporte de generación de texto**: no se puede usar para tareas de NLP generales; es un componente de un sistema de razonamiento más grande.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sagicc/nanoGentzen
- Dataset de entrenamiento: https://huggingface.co/datasets/Sagicc/nanoGentzen
- Perfil del autor en HuggingFace: https://huggingface.co/Sagicc
- Repositorio de datasets del autor: https://huggingface.co/Sagicc/datasets
- Blog de música del autor (referencia no técnica): https://sagicc.bandcamp.com/album/aibum
- Artículo de referencia sobre agentic AI (no directamente sobre este modelo): https://arxiv.org/pdf/2504.18875
