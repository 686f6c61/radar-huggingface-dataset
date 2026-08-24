# jellyho/acrft-yam-critics

## Resumen

El modelo `jellyho/acrft-yam-critics` es un conjunto de críticos de valor (value functions) para robótica, desarrollado por Hokyun Im (jellyho) como parte del proyecto ACRFT. Se trata de críticos de parches basados en DINOv2 congelado, entrenados sobre el conjunto de teleoperación YAM lego-taxi (347 episodios: 300 de éxito y 47 de fallo). Su propósito es guiar los rollouts de una política de comportamiento (BC) pi0.5 mediante selección best-of-N o selección adaptativa de chunks (ARQ), mejorando así la tasa de éxito en tareas de manipulación.

El modelo se presenta en cinco variantes (arms) que difieren en el esquema de chunking (fijo o adaptativo), el valor de tau en el IQL, la reducción del ensemble (min o mean) y el uso de aumento de características. Todas comparten la misma convención de recompensa: cost_to_goal de -1 por paso, gamma 0.99964, soporte HL-Gauss de 101 átomos en el rango [-2777.8, 0], y un estado absorbente de objetivo a 30 pasos. El entrenamiento se realizó con 200k pasos, batch de 256 y learning rate 1e-4, con un ensemble de 2 críticos.

La relevancia actual de este modelo radica en su enfoque para mejorar políticas de comportamiento en robótica mediante críticos entrenados offline, un área activa en el aprendizaje por refuerzo aplicado a manipulación. Su licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo está especializado en un dominio concreto (tarea Lego-Taxi) y no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Critico de valor basado en parches de DINOv2 congelado (detalles de la red de valor no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.3 GB, probablemente safetensors o JAX, no especificado) |

## Arquitectura y entrenamiento

El modelo es un crítico de valor (value function) que predice el retorno esperado (cost-to-go) a partir de observaciones de tres cámaras (agentview y dos muñecas) a resolución 224, junto con el estado del robot normalizado (quantile) y chunks de acción JOINT-DELTA normalizados (horizonte 30). La propriocepción incluye posiciones de articulaciones y garras (14 dimensiones) en la mayoría de las variantes, excepto en `g5all_200k` que usa 42 dimensiones (incluye velocidad y esfuerzo). El preprocesamiento se reproduce automáticamente mediante un wrapper de servicio.

El entrenamiento utiliza IQL (Implicit Q-Learning) con distribución HL-Gauss de 101 átomos, un ensemble de 2 críticos, y se realiza sobre el conjunto YAM lego-taxi. Se emplean 200k pasos con batch 256 y learning rate 1e-4. Las variantes adaptativas (g5) usan prefijos de chunk de 5 a 30, mientras que la variante fija usa un prefijo único de 30. Las variantes tau9 incorporan aumento de características (0.1/0.05) para reducir la fuga de hindsight, un problema conocido en críticos entrenados con datos de demostración.

## Capacidades

- Predicción de valor (cost-to-go) para estados de robot en tareas de manipulación, con soporte para múltiples cámaras y propriocepción.
- Selección adaptativa de chunks (ARQ) para decidir el horizonte de ejecución de acciones en cada paso.
- Guiado de rollouts mediante best-of-N, evaluando múltiples trayectorias muestreadas por una política BC.
- Integración con políticas pi0.5 (BC) y con políticas alpha-Flow (mediante configuración adicional).
- Ensemble de críticos (K=2) con reducción min o mean para robustez.
- No es un modelo generativo de texto ni tiene capacidades de lenguaje natural.

## Casos de uso

- Selección de trayectorias en control de robots: el crítico evalúa N muestras de una política BC y selecciona la de mayor valor esperado, mejorando la tasa de éxito en tareas como Lego-Taxi.
- Control adaptativo con horizonte variable: la variante g5 permite elegir dinámicamente la longitud del chunk de acción (entre 5 y 30 pasos) según el valor predicho, reduciendo errores acumulados.
- Evaluación offline de políticas: el crítico puede usarse para estimar el rendimiento de una política BC sin necesidad de ejecución en el robot real.
- Aprendizaje por refuerzo offline: sirve como componente de valor en algoritmos IQL para entrenar políticas mejoradas a partir de datos de demostración.
- Investigación en críticos basados en visión: el uso de DINOv2 congelado como extractor de características permite estudiar la transferencia de representaciones visuales a funciones de valor.
- Benchmarking de métodos de reducción de fuga de hindsight: las variantes tau9 ofrecen un caso de estudio para mitigar el sesgo en críticos entrenados con datos de éxito/fallo.

## Benchmarks y rendimiento

La evaluación se realizó sobre el propio conjunto de datos (stride-20, 347 episodios, scorer 673f33a). Los resultados para las variantes principales son:

| Metrica | fixed_200k | g5_200k |
|---|---|---|
| success V(s0) | -1620.7 | -1620.4 |
| failure V(s0) | -2580.4 | -2606.8 |
| success Vslope (vs true cost-to-go) | 0.85 | 0.90 |
| success V at goal-1 | -298.5 | -36.6 |
| k* success / failure | 30 / 30 (trivial) | 12.8 / 6.1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje. Los valores absolutos no deben interpretarse como retornos calibrados; se recomienda comparar variantes relativamente.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la información disponible.
- El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo pequeño, probablemente ejecutable en GPUs de consumo (p. ej., RTX 3060 o superior), pero no hay confirmación.
- El código de servicio se ejecuta mediante `uv run python scripts/serve_patch_critic.py`, lo que implica un entorno Python con dependencias JAX.
- No se indican opciones de despliegue como vLLM u Ollama; al ser un modelo de robótica, el despliegue es específico del proyecto ACRFT.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es específico para robótica y no se han encontrado alternativas equivalentes en la búsqueda web. Se indica "no disponible".

## Limitaciones y advertencias

- Las variantes con tau=0.7 y sin aumento de características presentan una fuerte fuga de hindsight: la diferencia de valor entre estados de éxito y fallo es de aproximadamente 1000, cuando el ideal para una política de comportamiento es 0. Esto puede sesgar la selección de trayectorias.
- Los valores absolutos de V(s0) no están calibrados como retornos reales; solo son útiles para comparaciones relativas entre variantes.
- El modelo está entrenado exclusivamente en el conjunto YAM lego-taxi (347 episodios), por lo que su generalización a otras tareas o entornos no está garantizada.
- No es un modelo de lenguaje; no soporta entrada de texto ni generación de respuestas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- [HuggingFace: jellyho/acrft-yam-critics](https://huggingface.co/jellyho/acrft-yam-critics)
- [GitHub: jellyho/ACRFT](https://github.com/jellyho/ACRFT)
- [Perfil de jellyho en HuggingFace](https://huggingface.co/jellyho)
- [Perfil de jellyho en GitHub](https://github.com/jellyho)
