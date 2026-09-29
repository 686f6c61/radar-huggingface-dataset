# mulligan/sim-square-narrow-r01-sobol-no-cf-idql

## Resumen

sim-square-narrow-r01-sobol-no-cf-idql es un agente de control robótico basado en estado desarrollado por el equipo de Mulligan, publicado bajo el identificador mulligan/sim-square-narrow-r01-sobol-no-cf-idql. Implementa el algoritmo IDQL (Implicit Q-Learning con actor de difusión): un actor de tipo diffusion que genera acciones y un crítico IQL escalar, entrenado para resolver la tarea de manipulación simulada sim-square-narrow. El modelo se distribuye como un checkpoint de PyTorch (policy.pt) acompañado de ficheros de normalización (stats.json), no como un modelo de lenguaje, por lo que no dispone de ventana de contexto ni de capacidades generativas de texto.

Forma parte de la ronda R1 del brazo experimental "sobol-no-cf" dentro de la infraestructura de evaluación Mulligan (Policy Arena). Se publican cinco checkpoints, uno por semilla (seed-1 a seed-5), todos en el paso de entrenamiento 150001. El entrenamiento combina datos de teleoperación humana y de DAgger, así como rollouts de política, todo ello procedente de la organización mulligan en Hugging Face.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un agente offline RL en una tarea concreta (con cinco semillas para medir varianza); por otro, alimenta el marco comparativo de Mulligan, que cruza distintos brazos y algoritmos para evaluar políticas robóticas en simulación. La licencia MIT facilita su reutilización tanto en investigación como en desarrollos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con crítico IQL escalar, basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control robótico, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) y ficheros de normalización stats.json |
| Tamano del repositorio | 1.4 GB (incluye los cinco checkpoints de semilla) |
| Semillas publicadas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 150001 |

## Arquitectura y entrenamiento

El modelo sigue el esquema IDQL (Implicit Q-Learning con actor de difusión). La componente de actor es un modelo generativo de tipo diffusion que produce acciones condicionadas por el estado del entorno; el crítico es un IQL escalar, que estima valores Q mediante un objetivo implícito y evita consultar acciones fuera de la distribución de datos. Se trata de un agente basado en estado (state-based), es decir, no consume imágenes ni cámaras, solo observaciones de estado, según la propia model card.

El entrenamiento se apoya en tres conjuntos de datos: sim-square-narrow-c00-teleop-sobol (teleoperación), sim-square-narrow-c01-dagger-sobol-no-cf (intervenciones DAgger) y sim-square-narrow-c01-sobol-policy-rollouts (rollouts de política). El brazo "sobol-no-cf" y la celda de campaña `sq_d0_r1_ours_sobol_nocf_human_only` indican una configuración experimental concreta dentro de Mulligan, aparentemente centrada en datos de origen humano y sin componente de counterfactual. Los checkpoints provienen de artefactos de Weights & Biases y se publican como copias byte-a-byte verificadas por MD5 contra el manifiesto del artefacto, con SHA-256 registrado en release.json. No se detallan en la información disponible el número de tokens/pasos de datos, la composición exacta del dataset ni si hubo fases de RLHF o DPO (conceptos no aplicables a este tipo de agente).

## Capacidades

- Generación de acciones de control robótico para la tarea simulada sim-square-narrow a partir de observaciones de estado.
- Política entrenada mediante aprendizaje por imitación y datos offline (teleoperación y DAgger), sin necesidad de interacción en línea en tiempo de inferencia.
- Representación de distribución de acciones multimodal gracias al actor de difusión, útil cuando existen múltiples acciones válidas para un mismo estado.
- Evaluación de valor mediante el crítico IQL escalar, que puede emplearse para seleccionar acciones o puntuar estados.
- Reproducibilidad experimental: cinco semillas independientes del mismo brazo, lo que permite medir varianza entre inicializaciones.
- Integración con el marco de evaluación Mulligan (Policy Arena), que consume estos checkpoints y los cruza con conjuntos de evaluación.
- No dispone de tool calling, function calling, capacidades de agente conversacional, multilingüismo, visión, audio ni modos de razonamiento textual, por tratarse de un agente de control y no de un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline: el checkpoint sirve como referencia reproducible para estudiar el comportamiento de IDQL con actor de difusión en una tarea de manipulación concreta, comparando las cinco semillas publicadas.
- Punto de partida para DAgger iterativo: al provenir de un pipeline de DAgger, puede utilizarse como política base sobre la que recoger nuevas intervenciones humanas y reentrenar, cerrando el bucle de mejora.
- Evaluación comparativa de algoritmos: dentro de Mulligan, el brazo "sobol-no-cf" puede enfrentarse a otros brazos y algoritmos en Policy Arena para medir qué configuración resuelve mejor la tarea sim-square-narrow.
- Generación de datos de política: los rollouts derivados de esta política alimentan el dataset sim-square-narrow-c01-sobol-policy-rollouts, útil para entrenar críticos o políticas posteriores.
- Base para transferencia sim-to-real: al operar sobre observaciones de estado y no sobre imágenes, es un candidato razonable para portar la política a un robot real siempre que las observaciones de estado sean equivalentes, aunque no hay evidencia publicada de dicha transferencia en la información disponible.
- Estudio de robustez y varianza: las cinco semillas permiten analizar la estabilidad del entrenamiento y la sensibilidad del agente a la inicialización en tareas de inserción estrecha.
- Reproducibilidad de experimentos: los metadatos incluyen commits de git, artefactos de W&B y hashes, lo que facilita replicar exactamente el entrenamiento y auditar la procedencia de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card referencia el conjunto de evaluación sim-square-narrow-r00-r03-eval y la plataforma Policy Arena para consultar evaluaciones, pero no incluye cifras de éxito, retorno medio ni comparaciones directas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un agente basado en estado con actor de difusión y crítico escalar (típicamente redes tipo MLP, no transformers de gran tamaño), la huella de memoria es reducida y previsiblemente muy inferior a la de un modelo de lenguaje.
- El repositorio completo ocupa 1.4 GB para los cinco checkpoints, lo que sitúa cada semilla en torno a unos cientos de megabytes incluyendo pesos y metadatos; el peso en memoria en inferencia será considerablemente menor que el tamaño del fichero.
- GPU recomendadas: no disponible. Dado el tamaño reducido esperado, debería ejecutarse sin problema en GPU de consumo (por ejemplo, gama RTX) e incluso en CPU para inferencia, aunque no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí, según la naturaleza del agente, aunque no hay confirmación oficial.
- Opciones de despliegue: PyTorch (los checkpoints son pickles de PyTorch y deben cargarse solo en entornos de confianza). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de sus alternativas directas en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa. Cualitativamente, dentro del ecosistema Mulligan existen otros brazos y rondas para la misma tarea sim-square-narrow (por ejemplo, variantes con o sin counterfactual y distintos conjuntos de datos), además de otros agentes IDQL y de otros algoritmos de RL offline. No obstante, la información disponible no incluye parámetros, contexto ni métricas de esos modelos, por lo que la comparación se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sim-square-narrow-r01-sobol-no-cf-idql | no disponible | no aplica | MIT | Hugging Face (mulligan) |
| Otros brazos de Mulligan (r01, otras rondas) | no disponible | no aplica | no disponible | Hugging Face (mulligan) |
| Otros agentes IDQL de referencia | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con teleoperación humana y DAgger, la política hereda las limitaciones y posibles sesgos de las demostraciones humanas, que no se describen en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje. El riesgo análogo es la generación de acciones fuera de distribución o inseguras cuando el estado difiere de los datos de entrenamiento.
- Limitaciones de alcance: el modelo está especializado en la tarea sim-square-narrow y no es generalista; no debe esperarse que resuelva otras tareas sin reentrenamiento.
- Restricciones de idioma y contexto: no aplica, ya que no procesa texto.
- Naturaleza de los pesos: los ficheros .pt son pickles de PyTorch; cargarlos implica ejecutar código Python, por lo que solo deben abrirse en entornos de confianza (advertencia explícita de la propia model card).
- Datos ausentes: no se publican número de parámetros, VRAM, latencia, throughput ni métricas de éxito, lo que dificulta planificar despliegues en producción.
- Uso comercial: la licencia MIT permite uso comercial amplio, pero la ausencia de datos de rendimiento y de validación fuera de simulación obliga a realizar evaluaciones propias antes de cualquier aplicación real.
- Procedencia: los checkpoints son copias de artefactos de Weights & Biases; su validez depende del código de investigación de Mulligan en los commits indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-no-cf-idql
- Sitio de Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización mulligan en Hugging Face: https://huggingface.co/mulligan
- Dataset sim-square-narrow-c00-teleop-sobol: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset sim-square-narrow-c01-dagger-sobol-no-cf: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-sobol-no-cf
- Dataset sim-square-narrow-c01-sobol-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluación sim-square-narrow-r00-r03-eval: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
