# Nadeem-Shoukath115113/spiral-so101-rlt12-stage1-beta-teleop57-dagger44-rm1fix12-fresh-1500

## Resumen

SPIRAL sobre rlt12 stage 3, ronda 1 (etapa 1): un barrido del hiperparámetro beta_bc (5, 15, 70 y 100) sobre un actor residual y un ensemble de 5 críticos entrenados por refuerzo, montados encima de una política π₀.₅ + RLT congelada. El repositorio publica cuatro checkpoints idénticos salvo por beta_bc, cada uno tras 1.500 pasos de entrenamiento, más un fichero compartido `action_cholesky.npy` (240×240) que define el ruido correlacionado usado durante el entrenamiento. No se incluye la política base, que hay que descargar por separado (`pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, paso 9999).

El modelo pertenece al ámbito de la robótica de manipulación y no es un modelo de lenguaje: se trata de un componente de RL residual que corrige las acciones de una política visión-lenguaje-acción (VLA) sobre un brazo SO-101. La tarea concreta es doblar una camiseta de manga larga sobre una mesa. El actor y los críticos son perceptrones multicapa de 3×1024, con dimensión de acción 12 (todas deltas, incluidos los grippers) y horizonte de 20 pasos a 15 fps.

Su relevancia es metodológica: permite aislar el efecto de la regularización BC (beta_bc) manteniendo fijos datos, arquitectura, ruido correlacionado, semilla y número de pasos. El autor advierte explícitamente de que los cuatro checkpoints **no han sido evaluados en robot** y de que las pruebas offline del crítico no se han ejecutado, por lo que los resultados deben tratarse como material de estudio y no como un modelo listo para producción. Licencia Apache 2.0 y un tamaño de repositorio de 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico residual (MLP) sobre política VLA congelada π₀.₅ + RLT; ensemble de 5 críticos con redes objetivo |
| Parametros totales | no disponible (el actor y cada crítico son MLP de 3×1024; no se declara el recuento total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de acción de 20 pasos y vector de características compuesto por RLT z_rl (2048) + estado (12) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las instrucciones del conjunto de datos están en inglés ("Fold the long sleeved T-shirt on the table") |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la model card menciona `vla_params` y `rlt_params` para la política base y checkpoints `step_00001499` para el actor, sin especificar formato de fichero) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de RL residual: la política base π₀.₅ + RLT permanece congelada y un actor residual aprende una corrección de pequeña magnitud sobre sus acciones. El actor y los 5 críticos (con sus redes objetivo) se inicializan desde cero y son MLP de 3×1024 con escala de salida residual de 0,1. La dimensión de acción es 12 (todas deltas, grippers incluidos) con horizonte de 20, y la entrada combina el vector latente RLT z_rl (2048 dimensiones) con el estado (12 dimensiones). El entrenamiento usa una pérdida de crítico con objetivo mixto 0,45 MC + 0,55 TD, gamma 0,9995, n_step 3, kappa 4 y tau 0,005; el retorno MC se calcula como `progress[last frame] × 0.9995^steps_remaining`. El suavizado de objetivo está desactivado (sigma 0). Optimizador AdamW con learning rate 1e-4 tanto en actor como en crítico y weight decay 1e-4.

Los datos son `local/r1b_teleop57_daggerrlt1_rm1fix12`: 101 episodios y 37.813 fotogramas a 15 fps, idénticos al conjunto de entrenamiento de π₁ (verificados fotograma a fotograma) salvo el último fotograma de cada episodio, que el etiquetador descarta. Los episodios 0–56 son 57 demostraciones de teleoperación (`so101_tshirt_clean57`, humanas, todas con éxito) y los episodios 57–100 provienen de `dagger_session_RLT_1` (44 episodios, 85 tomas de control humanas, 4 sin toma de control), todos con final exitoso. Las etiquetas las genera RM1 (`sarm2_gripper58`) con la configuración fix12 y `--stride 15 --smoother-mode none`; el progreso final queda entre 0,90 y 0,97, el objetivo MC es 0,871 ± 0,056 y el 4,2 % de las recompensas por paso son negativas. La innovación técnica destacable es el uso de ruido correlacionado activado mediante `action_cholesky.npy` (240×240, pre-reducido e idéntico al de las rondas 1–4).

El entrenamiento se ejecuta durante 1.500 pasos con batch 32, semilla 42 (aproximadamente 1,27 pasadas sobre los datos), y se repite cuatro veces cambiando solo beta_bc: 5, 15, 70 y 100. Cada variante tiene su propio registro en W&B (`up4f3x0r`, `ndwoxn6x`, `vx76htg2`, `wjsxqfh2`).

## Capacidades

- Manipulación robótica: doblado de una camiseta de manga larga sobre mesa con un brazo SO-101, partiendo de una política VLA congelada.
- Corrección residual de acciones: el actor aprende un desplazamiento de pequeña magnitud sobre las acciones de la política base (tamaño residual de 0,0070 a 0,0213 según beta y paso).
- Política guiada por instrucción en lenguaje: la política base π₀.₅ + RLT recibe instrucciones textuales ("Fold the long sleeved T-shirt on the table"), aunque este repositorio solo contiene el componente residual.
- Estimación de valor: ensemble de 5 críticos que produce estimaciones Q y permite selección best-of-4 (ganancia de selección medida de 0,0005 en el paso 1400).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de texto; el bucle de control es de robótica a 15 fps con horizonte 20.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no hay modo de razonamiento explícito, visión general ni audio; la percepción visual reside en la política base no incluida.

## Casos de uso

- Investigación en RL residual sobre políticas VLA: comparar el efecto de beta_bc (5, 15, 70, 100) con todo lo demás fijo para estudiar cómo la regularización BC controla la magnitud de la corrección residual.
- Reproducción de experimentos de SPIRAL: servir como punto de partida verificable de la ronda 1, con los cuatro registros de W&B y el fichero de ruido correlacionado compartido.
- Estudio de inicialización en frío de actores residuales: los checkpoints con beta 70 y 100 permiten analizar el caso en que el residual no ha convergido al valor fijado por el crítico al final del entrenamiento.
- Evaluación de ensembles de críticos: los cinco críticos son idénticos a 3 decimales entre las cuatro ejecuciones (pérdida 0,0017; Q mín./med./máx. ≈ 0,48 / 0,851 / 0,979 en el paso 1400), lo que permite estudiar la estabilidad del ensemble.
- Base para barridos posteriores de hiperparámetros: al compartir datos, semilla, ruido correlacionado y número de pasos con la ejecución r1b, sirve de control experimental.
- Integración en un pipeline de despliegue robótico de laboratorio: el orden de prueba sugerido por el autor (base con `dry_run=True` → beta 100 → 70 → r1b beta 30 → 15 → 5) permite validar en robot real deteniéndose en cuanto un beta empeora respecto a la base.
- Docencia y análisis de esquemas actor-crítico con regularización BC: los registros de entrenamiento (pérdida del crítico, Q mín./med./máx., objetivo MC/TD, Q(actor) − Q(base)) son material didáctico concreto para estudiar dinámicas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo **no ha sido evaluado en robot** y que las pruebas offline del crítico no se han ejecutado. Los únicos datos numéricos disponibles son métricas de entrenamiento, que no equivalen a benchmarks de tarea.

| Paso | Pérdida del crítico | Q mín. / med. / máx. | Objetivo MC / TD (media) | Q(actor) − Q(base) | Ganancia selección best-of-4 | Tamano residual |
|---|---|---|---|---|---|---|
| 100 | 0,155 | −0,23 / 0,19 / 0,66 | 0,871 / −0,362 | 0,0009 | 0,0014 | 0,0113 |
| 300 | 0,0020 | 0,44 / 0,58 / 0,74 | 0,871 / 0,342 | 0,0002 | 0,0006 | 0,0038 |
| 1000 | 0,0014 | 0,46 / 0,82 / 0,96 | 0,872 / 0,786 | 0,0001 | 0,0005 | 0,0024 |
| 1400 | 0,0017 | 0,48 / 0,85 / 0,98 | 0,872 / 0,834 | 0,0002 | 0,0005 | 0,0024 |

(Datos del registro de entrenamiento de la ejecución beta 15.)

Comparación entre los cuatro checkpoints en el paso 1499:

| Carpeta | beta_bc | Tamano residual (100 → 300 → 1400) | Residual × beta en 1400 | Q(actor) − Q(base) en 1400 |
|---|---|---|---|---|
| `beta5/step_00001499` | 5 | 0,0213 → 0,0086 → 0,0069 | 0,034 | 0,00048 |
| `beta15/step_00001499` | 15 | 0,0113 → 0,0038 → 0,0024 | 0,036 | 0,00015 |
| `beta70/step_00001499` | 70 | 0,0074 → 0,0021 → 0,00088 | 0,062 | 0,00003 |
| `beta100/step_00001499` | 100 | 0,0070 → 0,0020 → 0,00077 | 0,077 | 0,00002 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica cifras de memoria. El repositorio ocupa 0,7 GB, pero requiere descargar aparte la política base `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, que es el componente dominante en memoria.
- Coste relativo de los componentes: el actor residual y los 5 críticos son MLP de 3×1024, por lo que su huella es pequeña en comparación con la política base VLA congelada; la VRAM total vendrá determinada casi por completo por la carga de π₀.₅ + RLT.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende de si la política base π₀.₅ + RLT cabe en la GPU objetivo, dato no aportado.
- Opciones de despliegue: el autor no menciona vLLM, llama.cpp, Ollama ni TGI. El procedimiento indicado es descargar ambos repositorios con `hf download`, usar el código de la rama `lehome-noise-norm` (commit `f79f191` o posterior) y ejecutar desde la raíz del código. Existe una copia solo de código en el bucket `Nadeem-Shoukath115113/test`, carpeta `spiral_rlt12_serve/` (`hf sync hf://buckets/Nadeem-Shoukath115113/test/spiral_rlt12_serve ./spiral_rlt12_serve`). El cargador recurre a `assets/rlt12_s3_dagger_rlt1/local/teleop57_daggerrlt1_v21/norm_stats.json` de forma relativa.
- Latencia y throughput estimados: no disponible; el control se realiza a 15 fps con horizonte de acción 20 y el modelo no ha sido evaluado en robot.
- Orden de prueba sugerido: base (`dry_run=True`) → beta 100 → 70 → (r1b, beta 30) → 15 → 5, deteniéndose cuando un beta sea claramente peor que la base.

## Comparativa con modelos similares

No se han identificado modelos públicos comparables de terceros en la información disponible. La comparación factible es interna, entre las variantes del propio autor.

| Modelo | Tipo | Datos / pasos | beta_bc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (ronda 1, etapa 1) | Actor residual + 5 críticos sobre π₀.₅ + RLT congelada | 101 episodios, 37.813 fotogramas, 1.500 pasos cada variante | 5 / 15 / 70 / 100 | apache-2.0 | Público en HuggingFace (0,7 GB) |
| `spiral-so101-rlt12-lehome-r1b-teleop57-daggerrlt1-rm1fix12-b30-mc05-bs32-5k` (r1b) | Mismo esquema, mismos datos | 101 episodios, 5.000 pasos, MC 0.5, suavizado de objetivo activado | 30 | apache-2.0 (según el repositorio relacionado) | Público en HuggingFace |
| `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` (política base) | Política VLA π₀.₅ + RLT congelada, paso 9999 | No especificado en la información | no aplica | apache-2.0 (según el repositorio relacionado) | Público en HuggingFace; requerida y no incluida |

## Limitaciones y advertencias

- No evaluado en robot: la model card lo declara explícitamente; cualquier conclusión sobre rendimiento en tarea es prematura.
- Pruebas offline del crítico no ejecutadas: no hay validación independiente de las estimaciones Q.
- Residual no convergido con beta 70 y 100: con actor inicializado en frío, el residual todavía estaba decreciendo en el paso 1499; el valor fijado por el crítico sería aproximadamente 0,0005 y 0,00035 respectivamente, frente a los 0,00088 y 0,00077 observados. Parte de su residual procede de la inicialización, no de la dirección del crítico.
- Objetivo del crítico casi constante: el conjunto de datos no contiene finales fallidos, con un objetivo MC de 0,871 ± 0,056 y solo un 4,2 % de recompensas por paso negativas, lo que limita la capacidad del crítico para discriminar.
- Volumen de datos reducido: 101 episodios y 37.813 fotogramas a 15 fps, con 1,27 pasadas sobre los datos en el entrenamiento principal.
- Dependencia de la política base: el repositorio no incluye π₀.₅ + RLT; sin ella los checkpoints no son utilizables, y la reproducibilidad depende de la versión del código (rama `lehome-noise-norm`, commit `f79f191` o posterior, con adiciones no confirmadas: preset `residual_rl_pi05_so101_rlt12_r1b_rm1fix12` y la métrica `actor/q_gain_select_best_of_k`).
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo análogo es que la corrección residual produzca acciones fuera de distribución, mitigado parcialmente por la regularización beta_bc y la escala de salida de 0,1.
- Limitaciones de contexto o idioma: no aplica ventana de contexto textual; las instrucciones del conjunto de datos están en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card no ofrece garantías y el modelo no está validado para producción.
- Caveat operativo: el uso del ruido correlacionado (`action_cholesky.npy`) es parte del procedimiento de entrenamiento; alterarlo invalida la comparación con las rondas 1–4.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-stage1-beta-teleop57-dagger44-rm1fix12-fresh-1500
- Política base requerida: https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k
- Ejecución relacionada r1b (beta 30, 5.000 pasos): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1b-teleop57-daggerrlt1-rm1fix12-b30-mc05-bs32-5k
- Registros de W&B (`spiral-rlt12-stage1-beta`): `up4f3x0r` (beta 5), `ndwoxn6x` (beta 15), `vx76htg2` (beta 70), `wjsxqfh2` (beta 100)
- Copia solo de código: bucket `hf://buckets/Nadeem-Shoukath115113/test/spiral_rlt12_serve`
- Código fuente: rama `lehome-noise-norm`, commit `f79f191` (repositorio no identificado por URL en la información disponible)
- Las búsquedas web realizadas no devolvieron resultados relevantes: los enlaces obtenidos corresponden a la palabra «esquire» y no guardan relación con el modelo.
