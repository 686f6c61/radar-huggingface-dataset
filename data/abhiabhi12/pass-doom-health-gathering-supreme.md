# Abhiabhi12/pass-doom-health-gathering-supreme

# Abhiabhi12/pass-doom-health-gathering-supreme

## Resumen

Se trata de una política de aprendizaje por refuerzo entrenada con el algoritmo PPO (Proximal Policy Optimization) para el escenario `doom_health_gathering_supreme` de ViZDoom. El modelo lo publica el usuario Abhiabhi12 en Hugging Face y se distribuye dentro del ecosistema del framework Sample Factory, tal y como indica el campo `library_name` de su model card. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones visuales del entorno a acciones discretas del agente.

El problema que resuelve es acotado y específico: controlar al agente en un escenario de disparo en primera persona donde el objetivo es recoger botiquines para mantenerse con vida. En la variante "supreme" del escenario, la tarea exige políticas con capacidad de navegación y decisión bajo incertidumbre, lo que lo convierte en un banco de pruebas clásico para algoritmos de RL profundo. Su relevancia actual es la de servir como referencia reproducible y como punto de partida (inicialización o destilación) en experimentos de investigación.

La información publicada es muy escasa: la model card se limita a dos frases y no incluye detalles de arquitectura, hiperparámetros, presupuesto de entrenamiento, semillas ni configuración del entorno. Todos los campos que no aparecen en la información proporcionada se marcan explícitamente como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL entrenada con PPO dentro del framework Sample Factory; topología concreta de la red no especificada por el autor (no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplicable (agente de RL sobre observaciones del entorno, no un modelo de lenguaje; no se especifica el número de fotogramas apilados) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye como modelo de Sample Factory; el autor no detalla los ficheros) |
| Algoritmo | PPO |
| Entorno de entrenamiento | `doom_health_gathering_supreme` (ViZDoom) |
| Framework y libreria | Sample Factory (`library_name: sample-factory`) |
| Pipeline declarado en el Hub | reinforcement-learning |
| Metrica declarada | `mean_reward` = 15.00 +/- 0.00 (marcada como `verified: false`) |
| Fecha de creacion en el Hub | 2026-09-20 |
| Ultima actualizacion en el Hub | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo es el resultado de ejecutar PPO sobre el entorno `doom_health_gathering_supreme` utilizando Sample Factory, un framework de entrenamiento de RL de alto rendimiento orientado a entornos con observaciones visuales. La model card no documenta la topología de la red (número de capas, canales, tamaño de las representaciones), ni el número de pasos de entorno consumidos, ni los hiperparámetros de PPO (learning rate, clipping, número de épocas, tamaño de lote, horizonte de rollout, factor de descuento o coeficiente de entropía). Tampoco se indica si se empleó normalización de recompensas, aumento de datos, aleatorización de dominio o currículo de dificultad.

No hay constancia de componentes adicionales como decodificación especulativa, mecanismos de atención lineal, cabezas auxiliares de predicción ni fases de ajuste fino con datos humanos. En consecuencia, la única información reproducible es el algoritmo (PPO), el entorno y el resultado agregado declarado. Cualquier afirmación sobre la arquitectura interna sería una extrapolación no respaldada por la información disponible, por lo que se marca como no disponible.

## Capacidades

- Control de un agente en un entorno visual de ViZDoom mediante observaciones en primera persona y acciones discretas.
- Recogida de botiquines y mantenimiento de la supervivencia en el escenario `doom_health_gathering_supreme`, con una recompensa media declarada de 15.00.
- Inferencia de política entrenada: dada una observación del entorno, produce una acción; no genera texto ni contenido simbólico.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente conversacional, planificación multi-paso expresada en lenguaje ni uso de herramientas externas.
- No tiene capacidades multilingües: no procesa lenguaje natural en ninguna lengua.
- No incorpora modo de razonamiento explícito (thinking mode), visión genérica, audio ni generación de código.
- Su única especialización es la tarea concreta para la que fue entrenado; no se documenta ninguna capacidad de generalización a otros escenarios o entornos.

## Casos de uso

- Linea base para investigacion en RL: sirve como referencia PPO ya entrenada contra la que comparar nuevos algoritmos (SAC, IMPALA, Dreamer, variantes de PPO) sobre el mismo entorno, evitando tener que reentrenar una referencia desde cero.
- Reproduccion y docencia: permite ilustrar en un curso o taller el ciclo completo de entrenamiento y evaluación en Sample Factory sin necesidad de invertir horas de cómputo en el entrenamiento inicial.
- Destilacion e imitacion: la política puede actuar como profesor para entrenar una red de menor capacidad mediante aprendizaje por imitación, analizando después la pérdida de rendimiento en `mean_reward` respecto al original.
- Evaluacion de robustez y transferencia: partiendo de estos pesos, se pueden medir degradaciones al cambiar la resolución de entrada, las texturas, la velocidad de fotogramas o la aleatorización del mapa, lo que resulta útil para estudiar generalización en políticas visuales.
- Benchmarking de infraestructura de inferencia: al ser una política pequeña de control visual, es adecuada para medir latencia de inferencia en CPU y GPU, así como para probar rutas de exportación (TorchScript, ONNX) antes de aplicar la misma cadena a modelos mayores.
- Analisis de interpretabilidad: las políticas visuales de este tipo admiten estudios de mapas de saliencia y atribución sobre los fotogramas de entrada, lo que permite investigar en qué regiones de la imagen se fija el agente para decidir.
- Pruebas de integracion con entornos Gymnasium/ViZDoom: útil como caso de prueba para validar wrappers, gestión de semillas y reproducibilidad de episodios en un pipeline propio.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No se han publicado resultados de benchmarks adicionales en la información disponible, ni comparaciones con otros agentes.

| Algoritmo | Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|---|
| PPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 15.00 +/- 0.00 | No (`verified: false`) |

Nota: el valor declarado corresponde a una única métrica agregada. No se documentan el número de episodios de evaluación, la política de evaluación (determinista o estocástica), la semilla ni el número de entornos paralelos, por lo que la comparabilidad con otros resultados es limitada.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican tamaños de checkpoint ni cifras de consumo de memoria.
- GPU recomendadas: no disponible. El autor no especifica requisitos de hardware para entrenamiento ni para inferencia.
- Viabilidad en GPU de consumo: como referencia de categoría, las políticas PPO con entrada de píxeles de baja resolución para ViZDoom suelen ser lo bastante pequeñas para ejecutarse en CPU y en GPU de consumo; se trata de una estimación genérica de la familia de modelos, no de un dato confirmado para este checkpoint concreto.
- Opciones de despliegue: el único soporte confirmado es la librería `sample-factory` indicada en la model card, que permite cargar el modelo desde su CLI de evaluación. No se documentan rutas oficiales para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que además no aplican a un agente de RL de este tipo.
- Latencia y throughput: no disponible. No hay mediciones publicadas.
- Coste de entrenamiento: no disponible. No se indica el número de pasos de entorno ni el tiempo de entrenamiento empleado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros agentes entrenados sobre `doom_health_gathering_supreme` ni datos que permitan comparar parámetros, contexto, rendimiento o licencia con alternativas. Del mismo modo, la búsqueda web asociada no devolvió resultados relacionados con el modelo ni con el entorno.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay certeza jurídica sobre el uso comercial, la redistribución o la creación de obras derivadas a partir del checkpoint.
- Métrica no verificada: el resultado de `mean_reward = 15.00` está marcado como `verified: false` y procede únicamente del autor, sin validación independiente.
- Desviación estándar nula: el valor "+/- 0.00" sugiere muy pocos episodios de evaluación o una política determinista, pero el protocolo no se documenta, por lo que la fiabilidad estadística del número es baja.
- Especialización extrema: la política está entrenada para un único escenario y no se documenta capacidad de transferencia a otras tareas, mapas o modificaciones del entorno.
- Sesgos: no disponible. No se han publicado análisis de sesgo, y en un agente de RL el concepto aplica de forma distinta a la de un modelo de lenguaje (por ejemplo, sesgos derivados de la distribución de escenarios de entrenamiento y de la función de recompensa).
- Riesgo de alucinación: no aplicable en el sentido habitual, ya que el modelo no genera texto; el riesgo análogo es el fallo de política ante estados fuera de la distribución de entrenamiento, que puede producir comportamientos erráticos o bloqueos.
- Sin documentación de entrenamiento: no hay hiperparámetros, semillas, configuración del entorno ni presupuesto de entrenamiento, lo que dificulta la reproducibilidad.
- Advertencia de despliegue en producción: sin licencia clara y sin métricas de robustez, no es recomendable integrarlo en productos comerciales sin una evaluación propia previa.
- Fechas: la ficha del Hub registra creación y última actualización el 2026-09-20, sin versiones posteriores conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhiabhi12/pass-doom-health-gathering-supreme
- Paper, blog, repositorio o demo adicionales: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, el algoritmo o el entorno; los enlaces obtenidos trataban sobre geometría (superficies de una esfera) y no guardan relación con esta ficha.
