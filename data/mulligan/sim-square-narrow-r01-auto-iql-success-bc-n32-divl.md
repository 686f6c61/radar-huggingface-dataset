# mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-divl

## Resumen

`mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-divl` es un agente de control robótico basado en estado (no es un modelo de lenguaje ni un modelo visión-lenguaje-acción) publicado por la organización Mulligan dentro de su campaña de investigación en automatización de ensamblaje simulado. Concretamente, resuelve la tarea `sim-square-narrow`, una variante estrecha de una tarea de ensamblaje de tuerca cuadrada en simulación. El artefacto combina un actor de difusión congelado, heredado del checkpoint padre `sim-square-narrow-r01-auto-iql-success-bc-n32-idql`, con un crítico DIVL de tipo distributional. El repositorio ocupa 1,4 GB e incluye un directorio por semilla (`seed-1` a `seed-5`), cada uno con `policy.pt` y `stats.json`, correspondientes al paso de entrenamiento 150001.

El modelo forma parte de la infraestructura de evaluación de Mulligan (Policy Arena) y de un flujo de trabajo de mejora iterativa de políticas en el que se mezclan demostraciones de teleoperación con rollouts generados por políticas previas. Su relevancia es metodológica más que de producto: documenta el resultado de un brazo experimental concreto (`auto-iql-success-bc-n32`) dentro de una celda de campaña (`sq_d0_r1_auto_iql_success_bc_n32`), con trazabilidad completa hacia artefactos de Weights & Biases y verificación MD5/SHA-256 de los ficheros.

Los resultados publicados en la model card muestran una tasa de éxito agregada del 72,9 % sobre una rejilla de estados iniciales reservada (29 160 éxitos de 40 000 rollouts, 32 estados iniciales por semilla). Es un checkpoint de investigación con licencia MIT, sin pipeline de despliegue estandarizado y sin métricas de latencia o consumo publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de aprendizaje por refuerzo basado en estado: actor de difusión (congelado, heredado del checkpoint padre) mas critico DIVL distributional |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (agente de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original de entrenamiento) |
| Idiomas soportados | no aplica (agente basado en estado, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`, pickle de PyTorch) acompanado de `stats.json`; metadatos de release en `release.json` |
| Tarea | `sim-square-narrow` (ensamblaje de tuerca cuadrada, variante estrecha, en simulacion) |
| Ronda de modelo | R1 |
| Brazo experimental | `auto-iql-success-bc-n32` |
| Celda de campana | `sq_d0_r1_auto_iql_success_bc_n32` |
| Semillas incluidas | 5 (`seed-1` a `seed-5`), un directorio por semilla |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente es un policy de control de acción continua para una tarea de manipulación simulada. La arquitectura publicada en este repositorio se describe como un actor de difusión congelado (procedente del checkpoint `sim-square-narrow-r01-auto-iql-success-bc-n32-idql`) combinado con un crítico DIVL de tipo distributional. Los nombres de los artefactos de origen en Weights & Biases (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que el pipeline de entrenamiento integra componentes de IQL, DDPG+BC e IDQL junto con el crítico DIVL. No se especifican en la información disponible el número de parámetros del actor ni del crítico, la dimensión del espacio de observación o de acción, ni el número de pasos de difusión empleados en la inferencia.

El entrenamiento se apoya en dos conjuntos de datos: `sim-square-narrow-c00-teleop-baseline`, que aporta demostraciones de teleoperación humana, y `sim-square-narrow-c01-auto-iql-n32-policy-rollouts`, que aporta rollouts generados por políticas automáticas. Este esquema corresponde a un ciclo de mejora iterativa tipo DAgger/minería de datos, en el que los rollouts de la política actual alimentan la siguiente ronda de entrenamiento. Las cinco semillas fueron entrenadas con el mismo commit de código (`3053203fc3df`) pero con ejecuciones independientes en W&B, lo que permite analizar la varianza entre inicializaciones. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de transiciones, uso de RLHF/DPO (no aplicable en este dominio) ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de acción continua en simulación para la tarea `sim-square-narrow` (ensamblaje de tuerca cuadrada en variante estrecha).
- Política basada en estado: consume observaciones de estado de bajo nivel, no imágenes ni lenguaje.
- Actor de difusión para la generación de acciones, con crítico distributional asociado para la estimación de valor.
- Reproducibilidad multi-semilla: cinco checkpoints independientes del mismo brazo experimental.
- Trazabilidad de procedencia: correspondencia byte a byte con artefactos de W&B, verificación MD5 contra el manifiesto y SHA-256 registrado en `release.json`.
- Generación de datos para entrenamiento posterior: los rollouts de esta política pueden emplearse como datos de minería para rondas siguientes.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline: el checkpoint sirve como referencia reproducible de un brazo experimental concreto (`auto-iql-success-bc-n32`) para comparar variantes de crítico y de composición de dataset dentro de la misma celda de campaña.
- Análisis de varianza entre semillas: al incluir cinco semillas del mismo commit y paso de entrenamiento, permite estudiar la estabilidad del algoritmo de entrenamiento y el rango de tasas de éxito esperable (del 70,6 % al 75,0 % en la evaluación publicada).
- Generación de rollouts para minería de datos: la política puede desplegarse en el simulador para producir trayectorias etiquetadas por éxito que alimenten la siguiente ronda de entrenamiento de imitación, siguiendo el patrón de `sim-square-narrow-c01-auto-iql-n32-policy-rollouts`.
- Punto de partida para ajuste fino: al compartir actor congelado con el checkpoint padre (`...-idql`), es un candidato natural para experimentos que sustituyan únicamente el crítico o modifiquen la señal de valor.
- Evaluación comparativa en Policy Arena: los checkpoints pueden evaluarse en la rejilla de estados iniciales reservada y compararse contra otras rondas y brazos publicados por la misma organización.
- Estudio de transferencia sim-a-real en ensamblaje: la tarea de inserción de tuerca cuadrada es un banco de pruebas habitual para analizar la brecha entre simulación y robot físico, aunque este artefacto no incluye validación en hardware real.
- Docencia y prototipado en robótica: al ser un agente basado en estado con pesos de tamaño moderado, sirve para ilustrar un pipeline completo de RL offline con actor de difusión sin requerir infraestructura de visión a gran escala.
- Auditoría de reproducibilidad: la verificación MD5/SHA-256 y la referencia a ejecuciones de W&B permiten reconstruir el linaje del modelo en un contexto de investigación.

## Benchmarks y rendimiento

La model card publica una evaluación sobre una rejilla de estados iniciales reservada (`sim-square-narrow-r00-r03-eval`), con 32 estados iniciales por semilla y 8000 rollouts por semilla. Los resultados son los siguientes:

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 5999 | 75,0 % |
| seed-2 | 8000 | 5779 | 72,2 % |
| seed-3 | 8000 | 5644 | 70,6 % |
| seed-4 | 8000 | 5946 | 74,3 % |
| seed-5 | 8000 | 5792 | 72,4 % |
| Agregado | 40 000 | 29 160 | 72,9 % |

La desviación típica poblacional entre semillas es de aproximadamente 1,6 puntos porcentuales sobre la tasa de éxito. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que no son aplicables a un agente de control robótico. Tampoco se proporcionan métricas de éxito del checkpoint padre ni de otros brazos de la misma campaña, por lo que no es posible establecer una comparación cuantitativa directa con ellos a partir de los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un agente basado en estado (sin codificador visual ni modelo de lenguaje), los requisitos son previsiblemente muy inferiores a los de un VLA con backbone visual, pero no se publican cifras.
- GPU recomendadas: no disponibles. No se documenta ningún perfil de hardware empleado en el entrenamiento o la evaluación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente. El repositorio completo ocupa 1,4 GB repartido entre cinco semillas, lo que sugiere checkpoints individuales de tamaño reducido, compatibles en principio con GPUs de consumo, pero es una inferencia y no un dato publicado.
- Opciones de despliegue: no se documenta ninguna. El artefacto está pensado para cargarse con el código de investigación de Mulligan en PyTorch; no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponibles. La inferencia con actor de difusión implica varios pasos de denoising por acción, pero no se publica el número de pasos ni mediciones de tiempo.
- Advertencia: los ficheros `.pt` son pickles de PyTorch y solo deben cargarse en entornos de confianza.

## Comparativa con modelos similares

| Modelo | Tarea | Ronda | Brazo | Semillas | Resultado publicado | Licencia |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r01-auto-iql-success-bc-n32-divl` (este) | sim-square-narrow | R1 | auto-iql-success-bc-n32 | 5 | 72,9 % (29 160/40 000) | MIT |
| `sim-square-narrow-r01-auto-iql-success-bc-n32-idql` (modelo padre) | sim-square-narrow | R1 | auto-iql-success-bc-n32 | no disponible | no disponible | MIT (segun el repositorio de la organizacion) |

El checkpoint padre es el único modelo comparable identificable en la información disponible: aporta el actor de difusión congelado que reutiliza este artefacto y pertenece a la misma celda de campaña. No se han proporcionado resultados de evaluación del padre ni de otros brazos (por ejemplo, variantes con `iql`, `ddpg_bc` o `idql` sin crítico DIVL), por lo que la comparación cuantitativa queda como no disponible. Tampoco se dispone de información sobre modelos de terceros entrenados para la misma tarea.

## Limitaciones y advertencias

- Dominio restringido: el agente está entrenado exclusivamente para `sim-square-narrow` en simulación. No hay evidencia publicada de transferencia a un robot físico ni a otras tareas de ensamblaje.
- Ausencia de validación externa: los únicos resultados disponibles provienen de la propia organización que publica el modelo; no hay evaluaciones independientes.
- Varianza entre semillas: aunque el rango es moderado (70,6 %–75,0 %), ninguna semilla alcanza el 76 %, lo que implica una tasa de fallo residual de al menos una cuarta parte de los episodios.
- Riesgo de sobreajuste a la rejilla de estados iniciales: la evaluación se realiza sobre una rejilla reservada concreta (`sim-square-narrow-r00-r03-eval`); el comportamiento fuera de esa distribución no está caracterizado.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, robustez frente a perturbaciones ni comportamiento fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido de generación de texto. El riesgo equivalente es la ejecución de acciones no válidas o inefectivas ante estados no vistos.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. No se documentan restricciones adicionales.
- Seguridad de carga: los ficheros `.pt` son pickles de PyTorch; cargarlos implica ejecución de código y solo deberían abrirse en entornos de confianza.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto de investigación recién publicado, sin ecosistema de herramientas ni soporte documentado.
- Ausencia de especificaciones de despliegue: no hay información sobre requisitos de hardware, latencia, formato de serialización alternativo ni integración con servidores de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-divl
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r01-auto-iql-success-bc-n32-idql
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Ejecuciones de Weights & Biases (proyecto `self-improving/square-dagger-mining-01a`, runs `z9vvh9pw`, `4dnp0txz`, `3zdidusk`, `fc38sfbo`, `dmtkb3ft`): sin URL directa en la informacion disponible
- Commit de codigo de investigacion asociado: `3053203fc3df` (sin URL de repositorio en la informacion disponible)
- La busqueda web realizada no devolvio enlaces relacionados con este modelo.
