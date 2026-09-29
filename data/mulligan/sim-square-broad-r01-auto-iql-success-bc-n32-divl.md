# mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-divl

## Resumen

`sim-square-broad-r01-auto-iql-success-bc-n32-divl` es un agente de aprendizaje por refuerzo para robótica publicado por la organización Mulligan dentro de su campaña de investigación sobre auto-mejora de políticas. Se trata de un agente basado en estado (state-based, sin visión ni lenguaje) que ejecuta la tarea de simulación `sim-square-broad` y que combina un actor de difusión congelado, heredado del modelo padre de la ronda R1, con un crítico DIVL de tipo distributional. El artefacto distribuido son los pesos de la política (`policy.pt`) junto con las estadísticas de normalización (`stats.json`).

El modelo no es un modelo de lenguaje: es un checkpoint de política de control entrenado con componentes IQL, DDPG+BC, IDQL y DIVL (según la nomenclatura de los runs de entrenamiento), en un esquema de minería DAgger sobre datos de teleoperación y rollouts de políticas previas. Se publican cinco semillas (1 a 5), cada una en su propia carpeta, todas con paso de entrenamiento 250001 y procedentes del mismo commit de código (`3053203fc3df`).

Su relevancia es metodológica: sirve como referencia reproducible para comparar la variante DIVL frente al padre IDQL dentro del mismo brazo experimental (`auto-iql-success-bc-n32`) y como punto de partida para rondas posteriores de auto-mejora. La evaluación publicada en rejilla de estados iniciales retenidos sitúa la tasa de éxito entre el 51,1 % y el 54,2 % según semilla, lo que lo convierte en una política funcional pero lejos de la saturación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusión congelado (heredado del padre) + crítico DIVL distributional; pipeline de entrenamiento con IQL, DDPG+BC e IDQL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control sobre observaciones de estado, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (pickle de PyTorch) + `stats.json` |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo experimental | auto-iql-success-bc-n32 |
| Celda de campana | `sq_d1_r1_auto_iql_success_bc_n32` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit de codigo | `3053203fc3df` |
| Modelo padre (actor congelado) | [sim-square-broad-r01-auto-iql-success-bc-n32-idql](https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-idql) |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El agente es una política de control que opera sobre observaciones de estado. La arquitectura combina un actor de difusión congelado, tomado tal cual del modelo padre de la ronda R1 (`...-idql`), y un crítico DIVL de naturaleza distributional. El nombre del run de entrenamiento (`iql_ddpg_bc_idql_divl_square_d1_...`) indica que el pipeline integra Implicit Q-Learning (IQL), un componente DDPG con behavioral cloning (DDPG+BC), IDQL y DIVL, en un esquema de aprendizaje offline/off-policy. No se especifican en la información disponible el número de parámetros del actor, del crítico, ni la dimension de las capas.

Los datos de entrenamiento proceden de dos conjuntos publicados por el mismo autor: `mulligan/sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperación) y `mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts` (rollouts generados por una política IQL automática). Los runs pertenecen al proyecto `self-improving/square-d1-dagger-mining-01a`, lo que sugiere un ciclo de minería tipo DAgger con datos agregados iterativamente. No se documentan en la información disponible el número total de transiciones, la composición exacta del dataset ni si hubo fases de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aquí).

## Capacidades

- Control robótico basado en estado en la tarea simulada `sim-square-broad` (observaciones vectoriales, sin entrada de imagen ni de texto).
- Ejecución de la política entrenada a partir de `policy.pt`, con normalización de observaciones mediante `stats.json`.
- Reproducción de resultados por semilla: se publican cinco checkpoints independientes (seed-1 a seed-5) en el mismo paso de entrenamiento, lo que permite medir varianza entre semillas.
- Aprendizaje offline a partir de demostraciones de teleoperación y de rollouts de políticas previas, con evaluación sobre una rejilla de estados iniciales retenidos.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües, de visión, de audio ni de modo "thinking": no es un modelo multimodal ni generativo de texto.
- Reutilización como actor congelado o como inicialización en rondas posteriores de auto-mejora (el propio autor referencia este linaje al enlazar el modelo padre).

## Casos de uso

- Línea base reproducible en investigación de RL offline: cargar `policy.pt` con el código de investigación de Mulligan y reproducir la evaluación sobre la rejilla de estados iniciales retenidos para comparar variantes (IDQL frente a DIVL) bajo el mismo brazo experimental y el mismo paso de entrenamiento.
- Ablación del crítico DIVL: dado que el actor es idéntico y congelado respecto al padre IDQL, el modelo permite aislar el efecto del crítico distributional en la tasa de éxito, comparando los cinco seeds publicados.
- Generación de datasets de rollouts para auto-mejora: usar la política para producir trayectorias que alimenten conjuntos del tipo `auto-iql-n32-policy-rollouts`, cerrando el ciclo de minería DAgger que emplea el autor.
- Inicialización de rondas posteriores: servir como punto de partida (actor congelado o pesos iniciales) para nuevas rondas de entrenamiento en la misma tarea, con la ventaja de tener ya cinco semillas evaluadas.
- Verificación de robustez ante condiciones iniciales: la evaluación sobre 32 estados iniciales retenidos y 30 000 rollouts por semilla permite estudiar la sensibilidad de la política a variaciones de arranque.
- Comparación de metodologías en un banco público: someter el checkpoint a la arena de evaluación de Mulligan (Policy Arena) para contrastarlo con otras políticas de la misma tarea y campaña.
- Análisis de varianza entre semillas: con tasas de éxito entre el 51,1 % y el 54,2 % según semilla, el modelo es útil para estudiar la estabilidad del algoritmo de entrenamiento, no solo su rendimiento medio.
- Material docente o de auditoría: al ser byte-idéntico a los artefactos de W&B con MD5 verificado y SHA-256 registrado en `release.json`, sirve como ejemplo de publicación reproducible de checkpoints de RL.

## Benchmarks y rendimiento

Evaluación sobre rejilla de estados iniciales retenidos, con los resultados por rollout publicados en el conjunto `sim-square-broad-r00-r03-eval`. La columna de tasa de éxito es una conversión aritmética de los conteos publicados en la model card; el autor solo publica éxitos sobre rollouts totales.

| Dataset | Carpeta | N (estados iniciales) | Rollouts | Exitos | Tasa de exito (calculada) |
|---|---|---|---|---|---|
| sim-square-broad-r00-r03-eval | seed-1 | 32 | 30000 | 15339 | 51,13 % |
| sim-square-broad-r00-r03-eval | seed-2 | 32 | 30000 | 15514 | 51,71 % |
| sim-square-broad-r00-r03-eval | seed-3 | 32 | 30000 | 16255 | 54,18 % |
| sim-square-broad-r00-r03-eval | seed-4 | 32 | 30000 | 15491 | 51,64 % |
| sim-square-broad-r00-r03-eval | seed-5 | 32 | 30000 | 15886 | 52,95 % |
| Agregado (5 semillas) | — | 160 | 150000 | 78485 | 52,32 % (media calculada) |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no son aplicables a este tipo de modelo. Tampoco se publican métricas de retorno, longitud de episodio ni curvas de entrenamiento.

## Requisitos de hardware

- La model card no publica requisitos de hardware ni cifras de VRAM.
- Estimación a partir del tamaño del repositorio: 1,4 GB para el conjunto completo de checkpoints, `stats.json` y metadatos; si se reparte uniformemente entre las cinco semillas, cada `policy.pt` rondaría los 280 MB (estimación, no confirmada por el autor).
- Al tratarse de una política basada en estado con redes de tipo MLP y actor de difusión, la inferencia no requiere GPU y se espera que quepa con holgura en VRAM de cualquier GPU de consumo e incluso en memoria de CPU (estimación razonada; no hay medición publicada).
- GPU recomendadas: no disponible. No hay indicación de que el entrenamiento o la evaluación requieran A100, H100 o RTX 4090.
- Opciones de despliegue: no se documentan. No aplican los servidores de inferencia para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama); la carga se realiza con el código de investigación de Mulligan en PyTorch, en el commit `3053203fc3df`.
- Latencia y throughput: no disponible. No se publican mediciones de milisegundos por paso de control ni de frecuencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r01-auto-iql-success-bc-n32-divl (este) | sim-square-broad | no disponible | no aplica | 51,13 %–54,18 % de éxito por semilla (media calculada 52,32 %) | apache-2.0 | HuggingFace, 5 semillas |
| sim-square-broad-r01-auto-iql-success-bc-n32-idql (padre) | sim-square-broad | no disponible | no aplica | no disponible en la información consultada | apache-2.0 (heredada del ecosistema Mulligan) | HuggingFace, enlazado como modelo padre |
| Otras rondas de la campana (r00, r03) | sim-square-broad | no disponible | no aplica | no disponible | no disponible | referenciadas en el conjunto `sim-square-broad-r00-r03-eval` |

La comparación directa más informativa es contra el padre IDQL, porque este modelo reutiliza exactamente su actor congelado y solo cambia el crítico; sin embargo, la model card de la ronda R1 no incluye la tasa de éxito del padre en la información disponible, por lo que no es posible cuantificar la mejora con los datos consultados.

## Limitaciones y advertencias

- Alcance restringido a simulación: la tarea es `sim-square-broad`; no hay evidencia publicada de transferencia a un robot real (sim-to-real).
- Rendimiento moderado: entre el 45,8 % y el 48,9 % de los rollouts evaluados fallan según semilla, por lo que no es una política apta para producción sin supervisión.
- Varianza entre semillas no despreciable: el rango de éxito va del 51,13 % al 54,18 %, lo que obliga a reportar métricas por semilla y no solo una media.
- Dependencia del modelo padre: el actor está congelado y procede de otro repositorio; sin ese linaje no se puede reconstruir el entrenamiento completo.
- Riesgo de seguridad en la carga de pesos: los ficheros `.pt` son pickles de PyTorch, y el propio autor advierte de que solo deben cargarse en entornos de confianza. No hay versión en `safetensors`.
- Sin soporte multilingüe, de visión, de audio ni de texto: cualquier caso de uso conversacional o multimodal queda fuera de su ámbito.
- Sin requisitos de hardware, latencias ni curvas de entrenamiento publicadas, lo que dificulta planificar su integración en un pipeline.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene verificar las condiciones de los datasets de entrenamiento asociados, cuyas licencias no se detallan en la información consultada.
- Los checkpoints son copias byte-idénticas de artefactos de W&B (MD5 verificado contra el manifiesto, SHA-256 en `release.json`): la reproducibilidad depende de que esos artefactos sigan disponibles en el espacio de W&B del autor.
- Repositorio sin descargas ni "likes" en el momento de la consulta, y creado/actualizado en fechas de 2026-09-28: se trata de un artefacto de investigación reciente y sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r01-auto-iql-success-bc-n32-idql
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Arena de evaluaciones: https://arena.mulligan.page
- Artefacto de W&B (seed-1): `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_divl_square_d1_20260901_002343_454375-final-step-250001:v0`, run `self-improving/square-d1-dagger-mining-01a/e9vegzhb`
- Artefacto de W&B (seed-2): `..._20260901_002343_486516-final-step-250001:v0`, run `self-improving/square-d1-dagger-mining-01a/7rttmvsz`
- Artefacto de W&B (seed-3): `..._20260901_002343_451433-final-step-250001:v0`, run `self-improving/square-d1-dagger-mining-01a/vrxqnlwb`
- Artefacto de W&B (seed-4): `..._20260901_002343_556054-final-step-250001:v0`, run `self-improving/square-d1-dagger-mining-01a/2hrr4lnz`
- Artefacto de W&B (seed-5): `..._20260901_002849_826846-final-step-250001:v0`, run `self-improving/square-d1-dagger-mining-01a/p46clw6p`
- Commit de código de entrenamiento y evaluación: `3053203fc3df`
