# mulligan/sim-square-narrow-r03-baseline-idql

## Resumen

sim-square-narrow-r03-baseline-idql es un agente de aprendizaje por refuerzo offline para control robótico, publicado por el equipo de Mulligan dentro de su campaña de investigación sobre recogida de datos guiada por rendimiento. Se trata de un agente IDQL (Implicit Diffusion Q-Learning): un actor de difusión combinado con un crítico IQL escalar. El modelo opera sobre estados (state-based), no sobre imágenes, y se distribuye como un checkpoint de PyTorch (`policy.pt`) acompañado de ficheros de normalización (`stats.json`).

El modelo resuelve la tarea simulada `sim-square-narrow` en la ronda R3 de la campaña, dentro del brazo `baseline` y de la celda de campaña `sq_d0_r3_baseline_uniform_nocf_human_only`. Se publican cinco carpetas, una por semilla (1 a 5), todas con el paso de entrenamiento 150001. Los nombres de los artefactos de W&B asociados incluyen la cadena `nutassemblysquare`, lo que sugiere que la tarea está relacionada con el ensamblaje de una tuerca/pieza cuadrada sobre una clavija en un entorno simulado, aunque la model card no describe explícitamente el entorno.

Su relevancia es doble: por un lado, sirve como referencia base (baseline) frente a otros brazos y rondas de la misma campaña, y por otro, forma parte de una infraestructura reproducible de evaluación robótica (Policy Arena) con artefactos verificados por MD5 y SHA-256. No es un modelo de lenguaje ni un modelo multimodal: es una política de control para robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion con critico IQL escalar (redes neuronales para politica estado-accion) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de control robotico, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`.pt`, pickle) mas `stats.json` con normalizadores |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema IDQL (Implicit Diffusion Q-Learning). El componente de política es un actor de difusión, que genera acciones mediante un proceso de difusión condicionado por el estado, lo que permite representar distribuciones de acción multimodales propias de datos de demostración heterogéneos. El componente de valor es un crítico IQL escalar (Implicit Q-Learning), que estima valores sin consultar acciones fuera de la distribución del dataset, evitando el problema de extrapolación de error típico del aprendizaje Q offline. La política se extrae del crítico mediante un paso de reetiquetado de pesos (el actor de difusión se ajusta a las acciones con mayor valor implícito). El modelo es state-based: consume el vector de estado del entorno en lugar de píxeles.

El entrenamiento se realizó hasta el paso 150001 en cada una de las cinco semillas, con el código de investigación de Mulligan en los commits indicados (`7c7edbfe73f0`, `e74e85956046`, `66ea7b42a716`, `29155d0f0dcb`, `46b2b3a22e0a`). Los datos proceden de seis conjuntos publicados en la organización `mulligan`: `sim-square-narrow-c00-teleop-baseline` (teleoperación de referencia) y sendos pares de rollouts de política base y datos DAgger (`c01-baseline-policy-rollouts` + `c01-dagger-baseline`, `c02-baseline-policy-rollouts` + `c02-dagger-baseline`, y `c03-dagger-baseline`). Esto indica un pipeline de recogida de datos iterativo con correcciones humanas (DAgger) combinado con RL offline. No se especifica el número total de transiciones, la composición exacta del dataset ni si hubo etapas adicionales de ajuste más allá del reetiquetado del crítico.

## Capacidades

- Generación de acciones de control robótico continuas a partir de estados del entorno, mediante un actor de difusión.
- Aprendizaje por refuerzo offline: la política se ha entrenado a partir de datos preexistentes, sin interacción en línea durante el entrenamiento.
- Modelado de distribuciones de acción multimodales, gracias al actor de difusión (útil cuando los datos de demostración contienen comportamientos diversos).
- Estimación de valor mediante crítico IQL escalar, que puede reutilizarse para filtrar o ponderar acciones.
- Normalización de observaciones y/o acciones a través de `stats.json`, lo que facilita la reutilización del checkpoint con los mismos preprocesados.
- Reproducibilidad en cinco semillas independientes, lo que permite estudiar la varianza del entrenamiento en esta tarea.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Línea base para comparación experimental: el checkpoint `baseline` de la ronda R3 sirve como referencia frente a otros brazos de la campaña (por ejemplo, variantes con mezcla DAgger) para medir si una técnica de recogida de datos mejora la tasa de éxito en `sim-square-narrow`.
- Investigación en RL offline: el par actor de difusión + crítico IQL es un caso representativo de IDQL, útil para reproducir experimentos sobre aprendizaje por refuerzo offline con políticas expresivas.
- Evaluación reproducible en simulador: al incluir cinco semillas y artefactos con MD5/SHA-256 registrados, permite repetir evaluaciones con trazabilidad y comparar la varianza entre semillas.
- Punto de partida para ajuste fino con DAgger: el modelo puede inicializar rondas posteriores de recogida de datos con correcciones humanas, tal como refleja la estructura de datasets `c01`–`c03` empleada en esta misma campaña.
- Generación de rollouts sintéticos: la política puede desplegarse en el simulador para producir trayectorias que alimenten nuevos conjuntos de datos de entrenamiento.
- Estudio de la dinámica del critico IQL: el checkpoint permite inspeccionar cómo evoluciona la estimación de valor a lo largo del entrenamiento y cómo se relaciona con el comportamiento del actor de difusión.
- Docencia y prototipado en robótica: al ser un modelo state-based con pesos ligeros y licencia MIT, es adecuado para prácticas de laboratorio sobre control robótico y RL offline en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica la existencia de evaluaciones en Policy Arena (`https://arena.mulligan.page`) y referencia el dataset de evaluación `mulligan/sim-square-narrow-r00-r03-eval`, pero no incluye cifras de tasa de éxito ni de retorno en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 1.4 GB e incluye cinco carpetas de semilla, además de los normalizadores; no se indica el tamaño del checkpoint individual ni el número de parámetros.
- GPU recomendadas: no disponible. Al tratarse de una política state-based con actor de difusión (redes densas sobre vectores de estado, no sobre imágenes), el coste de inferencia es habitualmente muy inferior al de una política visual basada en CNN o transformer, pero no se aportan datos oficiales que lo confirmen.
- Aptitud para GPU de consumo: no disponible en la información proporcionada; sin cifras de parámetros no puede confirmarse con rigor.
- Opciones de despliegue: carga directa del checkpoint en PyTorch (`policy.pt` + `stats.json`) dentro del código de investigación de Mulligan. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mulligan/sim-square-narrow-r03-baseline-idql | IDQL (actor de difusion + critico IQL) para `sim-square-narrow` | no disponible | no aplicable | no disponible | MIT | HuggingFace |
| Brazos y rondas alternativos de la campana Mulligan (misma tarea) | IDQL con distintas estrategias de datos (DAgger, mezclas) | no disponible | no aplicable | no disponible | MIT (segun repositorio) | HuggingFace |
| IDQL (Hansen-Estruch et al.) | Algoritmo de referencia de RL offline con actor de difusion | no disponible | no aplicable | no disponible | no disponible | Publicacion academica |

No se dispone de cifras comparativas de rendimiento entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni tasas de éxito en la informacion disponible, por lo que no puede acreditarse su rendimiento real en la tarea `sim-square-narrow`.
- Modelo de dominio muy específico: entrenado para una única tarea simulada; no es generalizable a otras tareas robóticas ni a entornos reales sin un reentrenamiento o ajuste adicional.
- No procesa lenguaje natural, imágenes ni audio; no admite tool calling ni razonamiento multi-paso.
- Sesgos conocidos: no disponible. En RL offline, el comportamiento hereda los sesgos de la política de recogida de datos (teleoperación humana y rollouts de políticas base/DAgger), pero no se documentan análisis específicos.
- Riesgo de alucinacion: no aplicable en el sentido de modelos generativos de lenguaje; en su lugar existe riesgo de acciones fuera de distribución cuando el estado se aleja de la distribución del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no aplicables a un modelo de control; el equivalente sería la cobertura del espacio de estados del entorno simulado, no documentada.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No se han identificado restricciones adicionales en la informacion proporcionada.
- Seguridad al cargar pesos: la model card advierte explícitamente de que los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza.
- Trazabilidad: los ficheros son copias byte a byte de artefactos de W&B, verificadas por MD5 y con SHA-256 registrado en `release.json`; cualquier uso debe respetar los preprocesados de `stats.json` para no degradar la política.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización el mismo día (29 de septiembre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-idql
- Proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Organización de datasets: https://huggingface.co/mulligan
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de política base (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de rollouts de política base (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Dataset DAgger (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Dataset DAgger (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-baseline
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
