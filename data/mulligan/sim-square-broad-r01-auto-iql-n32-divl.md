# mulligan/sim-square-broad-r01-auto-iql-n32-divl

## Resumen

`mulligan/sim-square-broad-r01-auto-iql-n32-divl` es un agente de control robótico entrenado por aprendizaje por refuerzo offline/off-policy para la tarea de simulación `sim-square-broad`. Lo publica la organización `mulligan` como parte de su campaña de experimentos Mulligan, cuyo objetivo es comparar variantes de algoritmos de imitación y RL sobre una misma tarea y una misma base de datos de demostraciones. No es un modelo de lenguaje: es una política de control que consume observaciones de estado (no imágenes) y produce acciones, empaquetada junto a su crítico.

El modelo corresponde a la ronda R1, brazo `auto-iql-n32`, dentro de la celda de campaña `sq_d1_r1_auto_iql_n32`, y se distribuye con cinco semillas independientes (seed-1 a seed-5), todas ellas congeladas en el paso de entrenamiento 250001. Su particularidad técnica es que combina un actor de difusión congelado, heredado del modelo padre `sim-square-broad-r01-auto-iql-n32-idql`, con un crítico DIVL de tipo distribuicional; es decir, en esta ronda solo se entrena el crítico, no el actor.

La relevancia de esta ficha es fundamentalmente metodológica: sirve para evaluar cómo un crítico distribuicional afecta al rendimiento de una política de difusión ya entrenada, con un protocolo de evaluación explícito (rejilla de estados iniciales reservados, 32 rollouts) y resultados por semilla. El repo pesa 1,4 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control basado en estado (state-based), actor-crítico off-policy; actor de difusión congelado + crítico DIVL distribuicional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch pickle (`policy.pt`) y `stats.json` |
| Tarea | `sim-square-broad` |
| Ronda de modelo | R1 |
| Brazo | `auto-iql-n32` |
| Celda de campana | `sq_d1_r1_auto_iql_n32` |
| Semillas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Commit de entrenamiento | `3053203fc3df` |

## Arquitectura y entrenamiento

El agente sigue un esquema actor-crítico off-policy. El actor es una política de difusión congelada que se hereda del modelo `sim-square-broad-r01-auto-iql-n32-idql`; en esta ronda R1 no se actualiza. El componente entrenado es un crítico DIVL (distributional value learning), que modela la distribución del retorno en lugar de un valor escalar. Los artefactos publicados son `policy.pt`, que contiene el actor congelado, y `stats.json`, con las estadísticas de normalización. El nombre del brazo, `auto-iql-n32`, apunta a una variante de aprendizaje por imitación tipo IQL (implicit Q-learning) con 32 componentes o muestras, aunque la model card no detalla la configuración exacta de hiperparámetros.

Los datos de entrenamiento provienen de dos conjuntos publicados por el mismo autor: `sim-square-broad-c00-teleop-baseline`, que aporta demostraciones de teleoperación, y `sim-square-broad-c01-auto-iql-n32-policy-rollouts`, que contiene rollouts generados por la propia política, lo que configura un bucle de auto-mejora (minería tipo DAgger, según los nombres de los runs de W&B). Todos los checkpoints se entrenaron en el paso 250001. La model card no especifica el número total de transiciones, la composición exacta del dataset ni si se aplicó RLHF o DPO (categorías, por otra parte, propias del ajuste de modelos de lenguaje).

La trazabilidad es inusualmente completa: cada carpeta de semilla apunta a un artefacto de W&B concreto (por ejemplo `iql_ddpg_bc_idql_divl_square_d1_20260831_225932_261676-final-step-250001:v0`), su run asociado y un commit de Git común. Los ficheros publicados son copias byte a byte de esos artefactos, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico basado en estado: genera acciones a partir de observaciones de estado para la tarea `sim-square-broad`.
- Explotación de una política de difusión preentrenada: reutiliza el actor del modelo padre sin reentrenarlo.
- Estimación distribuicional del valor: el crítico DIVL modela la distribución del retorno, no solo su media.
- Ejecución multi-semilla: cinco políticas independientes con el mismo pipeline, útiles para medir varianza entre semillas.
- Evaluación reproducible: los resultados por rollout están publicados en el dataset `sim-square-broad-r00-r03-eval`.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües.
- No incorpora visión, audio ni modo de razonamiento (thinking mode): la entrada es estado, no píxeles.

## Casos de uso

- Investigación en RL offline: comparar el efecto de un crítico distribuicional frente a un crítico escalar manteniendo el actor congelado, usando las cinco semillas para estimar la varianza del resultado.
- Reproducción de experimentos: cargar los checkpoints y reejecutar la evaluación sobre la rejilla de estados iniciales reservados, verificando la integridad mediante el SHA-256 de `release.json`.
- Punto de partida para ajuste posterior: al estar el actor congelado y separado del crítico, resulta sencillo sustituir o reentrenar el crítico con otro algoritmo sin perder el comportamiento base del actor.
- Docencia en aprendizaje por refuerzo: ilustrar un pipeline completo de minería de rollouts (teleoperación + rollouts de política) con trazabilidad de artefactos, semillas y commits.
- Análisis de estabilidad entre semillas: estudiar por qué la semilla 3 alcanza 17610/30000 éxitos mientras la semilla 1 se queda en 15831/30000, con los mismos hiperparámetros.
- Auditoría de linaje de modelos: usar el modelo como ejemplo de publicación reproducible, con metadatos que enlazan artefactos de W&B, runs y código fuente.
- Generación de datos sintéticos de control: reutilizar la política como generador de rollouts etiquetados para alimentar una nueva ronda de entrenamiento.

## Benchmarks y rendimiento

La model card publica una única evaluación: una rejilla de estados iniciales reservados (*held-out*) con 32 rollouts por semilla, sobre el dataset `sim-square-broad-r00-r03-eval`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje en la información disponible, ya que el modelo no es un LLM.

| Semilla | Rollouts (N) | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 15831/30000 | 52,77 % |
| seed-2 | 32 | 15953/30000 | 53,18 % |
| seed-3 | 32 | 17610/30000 | 58,70 % |
| seed-4 | 32 | 16645/30000 | 55,48 % |
| seed-5 | 32 | 16757/30000 | 55,86 % |

La media aritmética de las cinco semillas es de 82796/150000, es decir, un 55,20 % de éxito, con un rango de variación de 5,93 puntos porcentuales entre la mejor y la peor semilla. Todos los checkpoints evaluados corresponden al paso 250001.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada.
- Dato indirecto: el repositorio completo ocupa 1,4 GB e incluye cinco semillas, por lo que cada checkpoint individual ronda los 280 MB, un tamaño compatible con GPUs de consumo e incluso con inferencia en CPU.
- GPUs recomendadas: no disponible. Dado el tamaño de los pesos y que la política consume observaciones de estado (no imágenes), no debería requerir aceleradores de gama alta.
- Cabe en GPU de consumo: probablemente sí, en cualquier GPU con al menos unos pocos GB de memoria libre, aunque no se especifica en la documentación.
- Opciones de despliegue: no disponible. Los pesos son `policy.pt` (pickle de PyTorch), por lo que el despliegue requiere cargarlos con PyTorch en un entorno de confianza; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Rol | Semillas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r01-auto-iql-n32-divl` (este) | `sim-square-broad` | Critico DIVL entrenado sobre actor congelado | 5 | no disponible | apache-2.0 | Publicado en HuggingFace (0 descargas, 0 likes) |
| `mulligan/sim-square-broad-r01-auto-iql-n32-idql` | `sim-square-broad` | Modelo padre; aporta el actor de difusion congelado | no disponible | no disponible | no disponible | Publicado en HuggingFace |

No se han encontrado en la información disponible otros modelos comparables de la misma categoría (agentes de RL para `sim-square-broad`) ni resultados de benchmarks que permitan una comparación cuantitativa entre ambos. La comparación con el modelo padre es estructural (comparten actor), no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un agente de control entrenado con demostraciones de teleoperación y rollouts propios, es esperable que herede las limitaciones de cobertura de ese dataset, pero la model card no lo documenta.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos de lenguaje; el riesgo equivalente es la ejecución de acciones fuera de distribución ante estados no vistos.
- Limitaciones de contexto o idioma: no aplica, ya que no procesa lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia.
- Riesgo de seguridad en la carga: los ficheros `.pt` son pickles de PyTorch. La propia model card advierte de que solo deben cargarse en un entorno de confianza, ya que la deserialización de un pickle puede ejecutar código arbitrario.
- Cobertura de evaluación limitada: los resultados provienen de una única rejilla de estados iniciales con 32 rollouts por semilla; no hay evaluación en hardware real ni en variaciones de la tarea.
- Varianza entre semillas: la diferencia de 5,93 puntos porcentuales entre la mejor y la peor semilla indica que una sola ejecución no es representativa del rendimiento del brazo.
- Trazabilidad dependiente de terceros: los pesos son copias de artefactos alojados en W&B; si esos artefactos dejan de estar disponibles, la verificación de linaje queda limitada al SHA-256 registrado en `release.json`.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente por parte de la comunidad.
- Uso previsto restringido: está diseñado para la tarea `sim-square-broad`; no se documenta su transferencia a otras tareas o entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-n32-divl
- Modelo padre (actor de difusion congelado): https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-n32-idql
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de demostraciones de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Sitio del proyecto: https://mulligan.page
- Evaluaciones publicas (Policy Arena): https://arena.mulligan.page

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su tarea o el proyecto Mulligan. Los unicos resultados obtenidos eran contenidos de sitios para adultos sin relacion alguna con el modelo, por lo que se han descartado y no se incluyen.
