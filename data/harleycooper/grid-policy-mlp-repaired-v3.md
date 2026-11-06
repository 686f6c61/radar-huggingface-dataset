# HarleyCooper/grid-policy-mlp-repaired-v3

## Resumen

`grid-policy-mlp-repaired-v3` es un modelo de política para aprendizaje por refuerzo desarrollado por HarleyCooper, orientado al entorno de Atari Breakout. No se trata de un modelo de lenguaje: es un perceptrón multicapa (MLP) que mapea representaciones de estado en forma de rejilla a acciones discretas del juego. El modelo se obtiene mediante edición de pesos en forma cerrada (*weight editing*) sobre una versión anterior, `grid-policy-mlp-repaired`, aplicando una edición en el espacio nulo de la matriz W3 para corregir un fallo de posicionamiento en el borde derecho de la pala y una edición monótona adicional sobre W2.

La relevancia del modelo es metodológica más que de rendimiento bruto: demuestra que es posible modificar quirúrgicamente los pesos de una política entrenada para corregir comportamientos específicos sin reentrenar, y cuantifica el resultado con una evaluación pareada sobre 1.000 partidas retenidas. El autor documenta explícitamente el compromiso entre la garantía de "nunca peor" de la versión v1 y la mayor rentabilidad media de esta v3.

El repositorio es de tamaño despreciable (0,0 GB), con pesos en formato NumPy (`policy_weights.npz`, float32) y licencia MIT. No dispone de descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) de tres capas (W1, b1, W2, b2, W3, b3) sobre representación de estado en rejilla |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre estados del entorno) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`policy_weights.npz`, float32) |

## Arquitectura y entrenamiento

La política es un MLP de tres transformaciones lineales con sesgos (W1/b1, W2/b2, W3/b3) que recibe una codificación en rejilla del estado del juego Breakout y produce una distribución de acciones. No se especifica en la información disponible el número de neuronas por capa, la función de activación ni el algoritmo de entrenamiento original de la política base; tampoco se detallan los datos de entrenamiento (número de partidas, composición del dataset ni si hubo RLHF/DPO, algo que no aplica a este tipo de modelo).

La innovación técnica reside en el proceso de edición de pesos, no en el entrenamiento. Sobre la versión `grid-policy-mlp-repaired` se aplican dos ediciones en forma cerrada: una edición en el espacio nulo de W3 que corrige el fallo de posición en el borde derecho que la v1 dejaba sin resolver, y una edición monótona adicional sobre W2. El procedimiento se documenta en el repositorio KimiBrainSurgery (Experimento 6), aunque la información proporcionada no detalla la formulación matemática de dichas ediciones ni el criterio de selección de los vectores del espacio nulo.

## Capacidades

- Control de política en Atari Breakout: selecciona acciones discretas a partir de estados codificados en rejilla.
- Corrección dirigida de comportamientos: la edición en el espacio nulo de W3 elimina el fallo de posicionamiento en el borde derecho presente en versiones anteriores.
- Evaluación pareada reproducible: el autor publica comparativas sobre 1.000 partidas retenidas (semillas 20000-20999) en modo greedy frente al modelo original y a la v1.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.
- No es un modelo generativo de texto: su única salida es la acción de la política.

## Casos de uso

- Investigación en edición de pesos: sirve como caso de estudio reproducible para validar técnicas de modificación en forma cerrada (espacio nulo, ediciones monótonas) sobre políticas ya entrenadas, comparando el efecto con una evaluación pareada.
- Análisis de regresiones en políticas de RL: los 17 casos de regresión documentados (de retorno 13 a 0) permiten estudiar clases de fallo que las métricas agregadas ocultan, concretamente la falta de preposicionamiento de la pala con la bola ascendente.
- Benchmark de entornos de evaluación: el hallazgo de que el minero del gimnasio solo inspecciona bolas descendentes convierte este modelo en un ejemplo útil para diseñar evaluadores que cubran fases ascendentes del juego.
- Reproducción de experimentos de RL: al publicarse los pesos en `.npz` con licencia MIT, cualquier investigador puede cargarlos y repetir las 1.000 partidas pareadas sin dependencias propietarias.
- Docencia en aprendizaje por refuerzo: ejemplo compacto y de bajo coste computacional para ilustrar el compromiso entre rentabilidad media y garantías de no regresión.
- Integración en pipelines de comparación de políticas: la métrica de diferencia pareada con intervalo de confianza ([+1.50, +2.18]) puede reutilizarse como plantilla de evaluación estadística en otros entornos.

## Benchmarks y rendimiento

Evaluación pareada sobre 1.000 partidas retenidas (semillas 20000-20999, modo greedy, frente al modelo original):

| Métrica | Original | Repaired v1 | Este modelo (v3) |
|---|---|---|---|
| Retorno medio | 8,69 | 9,77 | 10,53 |
| Diferencia pareada vs original | — | +1,08 | +1,83 [+1,50, +2,18] |
| Victorias / derrotas / empates | — | 137 / 0 / 863 | 137 / 17 / 846 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no proceden para este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; los pesos son un `.npz` float32 de tamaño despreciable (repositorio de 0,0 GB), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte NumPy/CUDA es suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650, etc.), así como en CPU.
- Opciones de despliegue: carga directa con NumPy (`np.load`) y ejecución del forward pass del MLP; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del MLP, la latencia por paso debería ser del orden de microsegundos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Retorno medio (1.000 partidas) | Garantía nunca peor | Licencia | Formato |
|---|---|---|---|---|---|
| grid-policy-mlp-repaired-v3 (este) | MLP + edición de pesos | 10,53 | No (17 regresiones) | MIT | `.npz` |
| grid-policy-mlp-repaired (v1) | MLP + edición de pesos | 9,77 | Sí (0 derrotas) | MIT | `.npz` |
| Política original | MLP entrenado | 8,69 | — | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas para Breakout) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, y no debe evaluarse con métricas tipo MMLU o HumanEval.
- Regresiones documentadas: 17 partidas pasan de retorno 13 a 0; todas comparten el patrón de fallo de preposicionamiento con la bola ascendente, clase invisible para el minero del gimnasio.
- Compromiso explícito: a diferencia de la v1, esta versión no ofrece garantía de "nunca peor"; el autor recomienda v1 si se requiere esa garantía y v3 si se prioriza la rentabilidad media.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica (modelo no generativo); el riesgo equivalente es la generalización limitada a las semillas y condiciones de evaluación descritas.
- Limitaciones de contexto e idioma: no aplicables; el alcance es el entorno Breakout con la codificación de rejilla empleada por el autor.
- Restricciones de licencia: MIT, permite uso comercial y modificación con atribución; no se detallan cláusulas adicionales.
- Caveats para producción: la información disponible no especifica el número de parámetros, la arquitectura exacta de capas ni el procedimiento de integración en un entorno distinto del usado en la evaluación; la validación fuera de las semillas 20000-20999 no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/grid-policy-mlp-repaired-v3
- Versión previa (v1): https://huggingface.co/HarleyCooper/grid-policy-mlp-repaired
- Repositorio del método (KimiBrainSurgery): https://github.com/HarleyCoops/KimiBrainSurgery
