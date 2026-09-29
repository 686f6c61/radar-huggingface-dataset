# mulligan/sim-square-broad-r01-mining-no-cf-divl

## Resumen

`mulligan/sim-square-broad-r01-mining-no-cf-divl` es un agente de control para robotica entrenado por aprendizaje por refuerzo, no un modelo de lenguaje. Lo publica la organizacion Mulligan dentro de su campana de investigacion sobre la tarea simulada `sim-square-broad`, en la ronda R1 y con el brazo experimental `mining-no-cf` (celda de campana `sq_d1_r1_ours_mining_nocf_human_only`). El artefacto contiene un actor de difusion congelado, heredado del modelo padre `sim-square-broad-r01-mining-no-cf-idql`, junto con un critico DIVL de tipo distribucional.

El repositorio ocupa 1,4 GB e incluye cinco semillas (seed-1 a seed-5), cada una en su propia carpeta, correspondientes al paso de entrenamiento 250001. Los ficheros son copias identicas a los artefactos de Weights & Biases del proyecto `self-improving/square-d1-dagger-mining-01a`, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

Su relevancia es acotada y puramente de investigacion: sirve como punto de comparacion reproducible dentro de la propia campana de Mulligan y como referencia para pipelines de RL offline/off-policy con actor de difusion y critico distribucional. El modelo no tiene capacidades de lenguaje, vision ni tool calling, y no declara idiomas soportados. La licencia es Apache 2.0, las descargas y los "likes" registrados son cero, y la model card no documenta el numero de parametros ni la composicion detallada del dataset mas alla de los tres conjuntos enlazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control basado en estado: actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribucional. La nomenclatura de los artefactos de W&B sugiere componentes IQL, DDPG+BC e IDQL en el pipeline de entrenamiento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la longitud de la secuencia de observacion no esta documentada |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en formato PyTorch pickle, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `policy.pt` (pickle de PyTorch) y `stats.json`, una carpeta por semilla |
| Tarea | `sim-square-broad` |
| Ronda de modelo | R1 |
| Brazo experimental | `mining-no-cf` |
| Celda de campana | `sq_d1_r1_ours_mining_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Commit de git del codigo de investigacion | `551416bff972` |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La informacion disponible describe un agente basado en estado cuyo actor es un actor de difusion congelado, procedente del modelo `sim-square-broad-r01-mining-no-cf-idql`, acompanado de un critico DIVL distribucional. Es decir, en esta ronda R1 no se reentrena el actor: lo que se entrena y se empaqueta es el critico, y el artefacto final combina ambos componentes. No se documentan el numero de parametros, la dimension de las observaciones ni la arquitectura interna de las redes.

Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_divl_square_d1_20260901_*`) indican que el pipeline combina aprendizaje por refuerzo offline con componentes de tipo IQL, DDPG con behaviour cloning e IDQL, ademas del componente DIVL. La campana se denomina `square-d1-dagger-mining-01a`, lo que apunta a un bucle iterativo de tipo DAgger con recoleccion de datos de "mining" y sin datos contrafactuales (`mining-no-cf`). No se especifican en la model card ni el numero total de tokens o transiciones usadas, ni la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (conceptos que, por otra parte, no aplican a este tipo de modelo).

Los datos de entrenamiento declarados son tres conjuntos: `sim-square-broad-c00-teleop-sobol` (teleoperacion con muestreo Sobol), `sim-square-broad-c01-dagger-mining-no-cf` (datos de minado del bucle DAgger) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de politica). Cada una de las cinco semillas corresponde a un artefacto de W&B distinto, todos con el mismo commit de codigo.

## Capacidades

- Control de politica para la tarea simulada `sim-square-broad`, con entrada basada en estado (no en vision).
- Actor de difusion congelado: genera acciones muestreando una distribucion de acciones aprendida.
- Critico DIVL distribucional: estima valores de retorno como distribucion en lugar de como valor escalar.
- Entrenamiento offline / off-policy a partir de datasets de teleoperacion y de rollouts de politica.
- Incluye cinco semillas independientes, lo que permite medir varianza entre ejecuciones.
- Evaluacion sobre una malla de estados iniciales retenidos, con resultados por rollout publicados en un dataset aparte.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multilingues.
- No dispone de tool calling / function calling.
- No dispone de soporte de agentes conversacionales ni de razonamiento multi-paso en el sentido de los LLM.
- No dispone de vision, audio ni modo "thinking": la entrada declarada es estado.

## Casos de uso

- Investigacion en RL offline: reproducir el par actor de difusion congelado + critico distribucional y comparar el efecto del componente DIVL frente a otras variantes de la misma campana.
- Generacion de datos para RL: usar los rollouts de las cinco semillas como fuente de transiciones adicionales para entrenar criticos o politicas en iteraciones posteriores del bucle DAgger.
- Inicializacion para fine-tuning: partir del actor congelado y sustituir o ajustar el critico para una tarea o un dominio de simulacion proximo, evitando reentrenar el actor desde cero.
- Benchmark de robustez entre semillas: las cinco semillas permiten estimar la variabilidad del rendimiento de la politica y detectar inestabilidad en el entrenamiento antes de llevarlo a un robot fisico.
- Auditoria de reproducibilidad: al ser copias byte a byte de artefactos de W&B con MD5 y SHA-256 registrados, los checkpoints sirven para verificar que una evaluacion se ejecuto sobre los pesos exactos declarados.
- Base para experimentos de sim-to-real: usar la politica como punto de partida en transferencia a un montaje fisico equivalente a la tarea simulada, midiendo la degradacion respecto al entorno simulado.
- Ensenanza y divulgacion tecnica: ilustrar un caso real de empaquetado de artefactos de RL con multiples semillas, procedencia verificable y licencia permisiva.
- Comparacion de criticos: mantener el actor fijo y sustituir unicamente el critico distribucional para aislar el efecto del estimador de valor en el rendimiento final.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la evaluacion sobre la malla de estados iniciales retenidos del dataset `sim-square-broad-r00-r03-eval`:

| Semilla | N (segun model card) | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 21201/30000 | 70,67 % |
| seed-2 | 32 | 21354/30000 | 71,18 % |
| seed-3 | 32 | 19975/30000 | 66,58 % |
| seed-4 | 32 | 20804/30000 | 69,35 % |
| seed-5 | 32 | 21251/30000 | 70,84 % |

La media de las cinco semillas es de 20917 exitos sobre 30000, equivalente a un 69,72 %. La model card no explica la relacion entre el valor N=32 de la columna de dataset y el denominador de 30000 de la columna de exitos. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K o equivalentes) ni comparaciones contra lineas base externas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no documenta requisitos de memoria.
- Como referencia de tamano, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, del orden de 280 MB por semilla; se trata de una cifra de tamano de artefacto, no de un requisito de VRAM medido.
- GPU recomendadas: no disponibles. No se documenta ningun hardware de referencia.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano del artefacto por semilla, es previsible que la inferencia quepa en GPUs de consumo, pero se trata de una estimacion derivada del tamano del repositorio y no de un dato publicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un checkpoint de RL en formato pickle. La carga se realiza con las herramientas de PyTorch y el codigo de investigacion de Mulligan en el commit `551416bff972`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r01-mining-no-cf-divl` | Actor de difusion congelado + critico DIVL distribucional | `sim-square-broad` | no disponible | no aplica | 69,72 % de exito de media en cinco semillas (20917/30000) | Apache 2.0 | HuggingFace |
| `mulligan/sim-square-broad-r01-mining-no-cf-idql` (modelo padre) | Actor de difusion IDQL, sin el critico DIVL de esta ronda | `sim-square-broad` | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otras lineas base de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo padre ni de modelos externos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Los ficheros `.pt` son pickles de PyTorch: la propia model card advierte de que solo deben cargarse en un entorno de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- El rendimiento no es perfecto: entre el 28,8 % y el 33,4 % de los episodios evaluados no terminan en exito segun la semilla, con una variabilidad de casi cinco puntos porcentuales entre semillas.
- No hay comparacion con lineas base externas publicada, por lo que no puede afirmarse que este enfoque supere a alternativas de la misma categoria.
- El modelo es especifico de la tarea `sim-square-broad` y de una campana concreta; no se documenta generalizacion a otras tareas.
- La entrada es basada en estado: no hay capacidades de vision ni de procesamiento de imagenes.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multilingues, y la fila de idiomas soportados queda como no disponible.
- La model card no documenta sesgos, composicion del dataset ni distribucion de los datos de entrenamiento, lo que dificulta evaluar riesgos de sobreajuste al simulador o al operador de teleoperacion.
- No se documentan requisitos de hardware, latencia ni throughput, lo que complica planificar un despliegue en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones declaradas adicionales, pero la ausencia de garantias y la advertencia sobre pickles siguen aplicando.
- El modelo registra cero descargas y cero "likes", por lo que carece de validacion externa independiente.
- Las fechas de creacion y actualizacion indicadas en los metadatos (2026-09-28) se reproducen tal cual y no se han podido contrastar.
- Los ficheros incluidos son copias de artefactos de W&B; su uso fuera de ese contexto requiere el codigo de investigacion de Mulligan en el commit `551416bff972` para reproducir el entorno de entrenamiento y evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-mining-no-cf-divl
- Modelo padre (actor IDQL congelado): https://huggingface.co/mulligan/sim-square-broad-r01-mining-no-cf-idql
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de minado DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Panel de evaluaciones (Policy Arena): https://arena.mulligan.page
