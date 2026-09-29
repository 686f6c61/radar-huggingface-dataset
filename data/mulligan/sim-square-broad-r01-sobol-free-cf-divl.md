# mulligan/sim-square-broad-r01-sobol-free-cf-divl

## Resumen

sim-square-broad-r01-sobol-free-cf-divl es un agente robótico basado en estado publicado por el autor `mulligan` dentro del proyecto Mulligan. Se trata del artefacto de la ronda R1 (arm `sobol-free-cf`) para la tarea de simulación `sim-square-broad`, compuesto por un actor de difusión heredado y congelado procedente del modelo `sim-square-broad-r01-sobol-free-cf-idql`, junto con un crítico DIVL (distributional implicit value learning) entrenado específicamente para esta variante. El repositorio contiene `policy.pt` y `stats.json` para cinco semillas independientes (carpetas `seed-1` a `seed-5`), con un total de 1,4 GB.

El modelo no es un modelo de lenguaje: no tiene tokens de contexto, no procesa texto ni imágenes y no soporta tool calling. Su propósito es la investigación en aprendizaje por imitación y refuerzo para control robótico, en concreto el entrenamiento de un crítico distribucional sobre una política base congelada, dentro de un pipeline que combina datos de teleoperación, datos generados por DAgger con coste computacional reducido y rollouts de política.

Su relevancia actual es de tipo metodológico y de reproducibilidad: los cinco checkpoints son copias byte a byte de artefactos de Weights & Biases, verificados por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`, y cada semilla se evalúa sobre una rejilla de estados iniciales retenidos con 30.000 rollouts. Está licenciado bajo Apache 2.0 y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente basado en estado con actor de difusión congelado (heredado del modelo padre) y crítico DIVL distribucional; no se detalla la topología interna de las redes en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precisión original, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de robótica basado en estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle (`policy.pt`) más `stats.json`; una carpeta por semilla; el repositorio completo ocupa 1,4 GB |
| Tarea | sim-square-broad |
| Ronda del modelo | R1 |
| Arm | sobol-free-cf |
| Celda de campana | `sq_d1_r1_ours_sobol_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 |
| Paso de entrenamiento | 250001 |
| Commit de git del codigo de investigacion | `551416bff972` |
| Pipeline declarado en HuggingFace | robotics |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el artefacto como un agente basado en estado que combina dos componentes: por un lado, el actor de difusión del modelo padre, que se mantiene congelado durante este entrenamiento; por otro, un crítico DIVL de naturaleza distribucional que se entrena sobre las representaciones y acciones de esa política fija. Esta separación permite mejorar la estimación de valor sin reentrenar el actor, un patrón habitual en pipelines de aprendizaje por imitación donde el coste de reoptimizar la política completa es elevado.

Los datos de entrenamiento proceden de tres conjuntos publicados por la misma organización: `sim-square-broad-c00-teleop-sobol` (teleoperación), `sim-square-broad-c01-dagger-sobol-free-cf` (datos de DAgger con coste reducido) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de política). Los nombres de los artefactos de Weights & Biases asociados a los checkpoints (`iql_ddpg_bc_idql_divl_square_d1_...`) indican que en la campaña se combinan componentes de IQL, DDPG, aprendizaje por imitación por comportamiento (BC) e IDQL junto con DIVL, aunque la model card no detalla la composición exacta del dataset, el número de transiciones ni si hubo fases de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aquí). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no tienen sentido en este dominio.

## Capacidades

- Control robótico basado en estado: genera acciones a partir de observaciones de estado del entorno simulado `sim-square-broad`, no de píxeles ni de texto.
- Política de difusión para generación de acciones: el actor heredado produce acciones mediante un proceso de difusión, técnica habitual para modelar distribuciones multimodales en control.
- Estimación de valor distribucional: el crítico DIVL modela la distribución del retorno en lugar de un único valor escalar, lo que permite analizar incertidumbre y multimodalidad en el valor.
- Entrenamiento del crítico con actor congelado: se puede reentrenar o ajustar el crítico sin tocar el actor, reduciendo el coste computacional de la experimentación.
- Cinco semillas independientes: cada carpeta `seed-N` contiene un checkpoint completo, lo que permite estudiar varianza entre semillas.
- Evaluación sobre rejilla de estados iniciales retenidos: los checkpoints están pensados para evaluarse con la rejilla de la ronda 00-03.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües, visión, audio ni modo de razonamiento textual: no es un modelo de lenguaje.
- Compatibilidad con el código de investigación de Mulligan en el commit indicado, necesario para cargar y ejecutar los artefactos según el flujo previsto por los autores.

## Casos de uso

- Investigación en aprendizaje por imitación con actor congelado: el crítico DIVL puede entrenarse sobre la política de difusión fija para estudiar cómo mejora la estimación de valor sin reoptimizar el actor, reduciendo el coste por experimento.
- Reentrenamiento del crítico con nuevos datos: al mantenerse el actor intacto, se pueden incorporar rollouts adicionales (por ejemplo, de `sim-square-broad-c01-sobol-policy-rollouts`) para ajustar únicamente el crítico y medir el efecto en la selección de acciones.
- Minería de datos y DAgger: los checkpoints sirven como política generadora de nuevos rollouts que alimentan iteraciones posteriores de DAgger con coste computacional reducido, tal y como sugiere el nombre del arm `sobol-free-cf`.
- Evaluación comparativa reproducible: con cinco semillas y una rejilla de estados iniciales retenidos, el modelo permite comparar variantes metodológicas (por ejemplo, crítico escalar frente a crítico distribucional) bajo el mismo protocolo de 30.000 rollouts por semilla.
- Estudio de la varianza entre semillas: las cinco carpetas permiten analizar la estabilidad del entrenamiento y de la tasa de éxito, con diferencias observadas de casi seis puntos porcentuales entre la mejor y la peor semilla.
- Reproducción de experimentos: al ser copias byte a byte de artefactos de Weights & Biases con MD5 y SHA-256 registrados, los checkpoints sirven para reproducir resultados publicados en Policy Arena o para auditar el pipeline de entrenamiento en el commit `551416bff972`.
- Base para experimentos de aprendizaje por refuerzo offline: el crítico DIVL puede emplearse como componente de selección de acciones en métodos tipo IDQL/IQL dentro del simulador.
- Estudio de transferencia sim-to-real en manipulación: el agente podría servir como punto de partida para experimentos de transferencia, siempre que el entorno real proporcione el vector de estado equivalente; no hay evidencia publicada de que se haya probado en hardware real.

## Benchmarks y rendimiento

Los únicos resultados publicados son las evaluaciones sobre la rejilla de estados iniciales retenidos del conjunto `sim-square-broad-r00-r03-eval`, con N = 32 estados iniciales por semilla y 30.000 rollouts por semilla. Los porcentajes de la columna final son cálculo aritmético a partir de los éxitos reportados en la model card.

| Semilla | Conjunto de evaluacion | N (estados iniciales) | Exitos / rollouts | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 21115 / 30000 | 70,38 % |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 19860 / 30000 | 66,20 % |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 20998 / 30000 | 69,99 % |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 21236 / 30000 | 70,79 % |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 21629 / 30000 | 72,10 % |
| Media de las cinco semillas | sim-square-broad-r00-r03-eval | 32 | 104838 / 150000 | 69,89 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; esos benchmarks no son aplicables a un agente de control robótico basado en estado.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no publica número de parámetros ni requisitos de memoria, y al tratarse de un agente de control para simulación no se especifican GPU objetivo.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado. Como referencia orientativa, no verificada por los autores, el repositorio completo ocupa 1,4 GB repartidos en cinco carpetas de semilla (aproximadamente 280 MB por semilla), lo que sugiere redes de tamano moderado, pero no hay datos oficiales de memoria en inferencia.
- Opciones de despliegue: no se documentan. Los formatos disponibles son PyTorch pickle (`policy.pt`) y `stats.json`, por lo que la carga se realiza con PyTorch y el código de investigación de Mulligan en el commit `551416bff972`. No aplican servidores de inferencia de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El coste por acción depende de los pasos de difusión del actor congelado y del hardware empleado, pero no se publican mediciones.
- Advertencia de seguridad: la propia model card indica que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en un entorno de confianza, ya que la deserialización de un pickle puede ejecutar código arbitrario.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-sobol-free-cf-divl | Modelo analizado | no disponible | no aplica | 19860-21629 exitos sobre 30000 por semilla en `sim-square-broad-r00-r03-eval` | Apache 2.0 | HuggingFace, 0 descargas |
| sim-square-broad-r01-sobol-free-cf-idql | Modelo padre: aporta el actor de difusion congelado que reutiliza el modelo analizado | no disponible | no aplica | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| Alternativas de terceros (por ejemplo, politicas de difusion para manipulacion publicadas por otros grupos) | Misma categoria funcional | no disponible | no aplica | no disponible | no disponible | no disponible |

La model card no incluye comparaciones con modelos de terceros ni cifras de otras variantes de la misma campana, por lo que no es posible establecer una comparativa cuantitativa más allá del parentesco con el modelo IDQL del que procede el actor congelado.

## Limitaciones y advertencias

- Seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch; la model card recomienda cargarlos solo en entornos de confianza, dado el riesgo de ejecución de código durante la deserialización.
- Ámbito restringido a simulación: el entrenamiento y la evaluación se realizan sobre la tarea `sim-square-broad`; no hay evidencia publicada de funcionamiento en robots reales ni de transferencia sim-to-real.
- Dependencia del código de investigación: para ejecutar los checkpoints se necesita el código de Mulligan en el commit `551416bff972`; no se documentan wrappers alternativos ni formatos estándar de intercambio como ONNX.
- Observaciones basadas en estado: el agente no procesa imágenes, audio ni texto; requiere un vector de estado equivalente al del simulador.
- Evaluación acotada: los resultados se miden sobre 32 estados iniciales retenidos, lo que limita las conclusiones sobre generalización a otras distribuciones de estados iniciales.
- Varianza entre semillas: la tasa de éxito oscila entre el 66,20 % (seed-2) y el 72,10 % (seed-5), una diferencia de 5,9 puntos porcentuales que conviene tener en cuenta al comparar variantes.
- Señales de validación externa nulas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Sesgos conocidos: no se documentan sesgos específicos; al operar en un simulador, los sesgos relevantes serían los del propio entorno y de los datos de teleoperación, no analizados en la model card.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos generativos de lenguaje; el riesgo análogo es la selección de acciones incorrectas fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni soporte, y el uso en producción real requeriría validación adicional no incluida en el repositorio.
- Idiomas: no aplica; el modelo no procesa texto.
- Trazabilidad: los cinco checkpoints son copias byte a byte de artefactos de Weights & Biases con MD5 verificado y SHA-256 en `release.json`, lo que facilita la auditoría pero implica que cualquier corrección requiere una nueva publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-sobol-free-cf-divl
- Modelo padre (actor congelado, variante IDQL): https://huggingface.co/mulligan/sim-square-broad-r01-sobol-free-cf-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de DAgger con coste reducido: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-sobol-free-cf
- Dataset de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluación (rejilla de estados iniciales retenidos): https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (únicamente enlaces a sitios para adultos sin relación con el contenido), por lo que no se incluye ningún enlace adicional ni se dispone de papers, blogs o demos de terceros.
