# Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr1e-4-clr3e-4-3k

## Resumen

SPIRAL sobre rlt12 etapa 3 es un checkpoint de aprendizaje por refuerzo residual para el robot manipulador SO-101, construido sobre una política base congelada π₀.₅ (vision-language-action) más un codificador RLT. No es un modelo de lenguaje: es un actor residual y un ensamble de cinco críticos que corrigen las acciones de la política base para la tarea concreta de doblar una camiseta de manga larga sobre una mesa. Lo publica el usuario Nadeem-Shoukath115113 bajo licencia Apache 2.0, con un repositorio de 0,4 GB y sin descargas ni valoraciones en el momento de la ficha.

El interés técnico está en el diseño experimental: se congela por completo el backbone VLA y solo se entrena un actor MLP de 3×1024 que produce un delta de acción con escala 0,1, junto con cinco críticos de 3×1024 y sus redes objetivo. El entrenamiento usa 137 episodios (63.508 fotogramas a 15 fps) etiquetados con un modelo de recompensa RM1, objetivo de crítico mixto 0,4 Monte Carlo + 0,6 TD con gamma 0,9997, regularizador BC con beta 10 y ruido correlacionado entre dimensiones de acción muestreado con una Cholesky de 240×240. Son 3.000 pasos con batch 32 (96.000 muestras, aproximadamente 1,5 pasadas) en 4,4 horas sobre una sola GPU.

Es relevante ahora porque documenta una ablación limpia de la tasa de aprendizaje del actor (1e-4 frente a 3e-4) con dos ejecuciones que solo difieren en ese hiperparámetro, e incluye el log completo de métricas de entrenamiento. Ahora bien, el propio autor advierte de que el modelo no se ha evaluado en robot y de que las pruebas offline del crítico no se han ejecutado, por lo que debe tratarse como material de investigación reproducible y no como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RL residual sobre política VLA congelada: actor MLP 3×1024 + ensamble de 5 críticos MLP 3×1024 con redes objetivo; backbone π₀.₅ (flow matching, 10 pasos de flujo) + codificador RLT congelados |
| Parámetros totales | no disponible (recuento exacto no publicado; actor 3×1024 y 5 críticos 3×1024, más el backbone π₀.₅ congelado, que no se incluye en el repo) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; horizonte de acción de 20 pasos y features de 2048 dimensiones z_rl + estado de 12) |
| Tipos de cuantización | no disponible (el backbone congelado se carga en bfloat16; no se documentan cuantizaciones del actor ni de los críticos) |
| Idiomas soportados | no disponible (la instrucción de tarea está en inglés: "Fold the long sleeved T-shirt on the table"); no hay capacidades lingüísticas propias |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints propios en `step_*/rl_state` con `actor_params`, `critic_params`, `target_critic_params` y `step` (155 arrays por checkpoint); fichero adicional `action_cholesky.npy`; no se distribuye en safetensors ni GGUF |

Otras especificaciones relevantes: dimensión de acción 12 (todos los valores son deltas, incluidos los grippers), factor de escala de la salida residual 0,1, kappa 4, tau 0,005 para el suavizado de objetivos (desactivado, sigma 0), recorte de gradiente 1,0, AdamW con weight decay 1e-4, semilla 42, checkpoints en `step_00001500` y `step_00002999`.

## Arquitectura y entrenamiento

La pila es híbrida y en cascada. El backbone es π₀.₅ en la variante `rlt12-s3-daggerrlt1-15fps-b32-10k` (paso 9999), congelado en bfloat16 y ejecutado con 10 pasos de flujo; de ese mismo directorio se toma el codificador RLT. Sobre sus representaciones (z_rl de 2048 dimensiones concatenado con un vector de estado de 12) el actor residual genera un delta de 12 dimensiones para un horizonte de 20 pasos, escalado a 0,1, que se suma a la acción de la política base. El valor se estima con un ensamble de cinco críticos independientes con redes objetivo, lo que permite selección best-of-k de acciones. El ruido correlacionado se introduce mediante `action_cholesky.npy` (matriz pre-reducida de 240×240, md5 `291c83b5…`, idéntica a las rondas 1 a 4 y a la ejecución de 1.500 pasos), lo que modela la dependencia entre dimensiones de acción en lugar de ruido gaussiano isotrópico.

El entrenamiento parte del actor de la ronda 1b (`step_00004999`) y de críticos inicializados desde cero, con recompensas etiquetadas por RM1 (`sarm2_gripper58`, variante fix12) sobre el dataset `local/mpr137_rm1_fix12`: 137 episodios, 63.508 fotogramas útiles (el etiquetador descarta el último fotograma de cada episodio), todos ellos rollouts de política sin tomas de control humana (`is_policy` = 1 en todos los fotogramas). El reparto es 66 episodios con `success` = 1 y 71 con 0, con longitud mediana de 343 fotogramas en éxitos frente a 453 en fallos. El retorno Monte Carlo se calcula como progreso del último fotograma multiplicado por 0,9997 elevado a los pasos restantes, con un objetivo MC de 0,656 ± 0,285 y un 21,1 % de recompensas por paso negativas; el AUC del progreso final de RM1 frente a la etiqueta `success` es 0,853.

Métricas del log de entrenamiento (media de los 100 pasos anteriores a cada fila):

| Paso | Pérdida del crítico | Q mín. / media / máx. | Objetivo MC / TD (media) | Q(actor) − Q(base) | Ganancia best-of-4 | Tamaño del residual |
|---|---|---|---|---|---|---|
| 100 | 0,739 | −0,78 / −0,27 / 0,36 | 0,656 / −0,855 | 0,0004 | 0,0012 | 0,0060 |
| 500 | 0,0091 | −0,05 / 0,37 / 0,64 | 0,657 / 0,179 | 0,0029 | 0,0021 | 0,0115 |
| 1000 | 0,0106 | 0,07 / 0,58 / 0,86 | 0,665 / 0,518 | 0,0032 | 0,0022 | 0,0116 |
| 1500 | 0,0104 | 0,09 / 0,62 / 0,92 | 0,652 / 0,605 | 0,0035 | 0,0022 | 0,0119 |
| 2000 | 0,0113 | 0,07 / 0,64 / 0,95 | 0,653 / 0,624 | 0,0041 | 0,0026 | 0,0127 |
| 2500 | 0,0103 | 0,07 / 0,65 / 0,96 | 0,664 / 0,647 | 0,0038 | 0,0025 | 0,0121 |
| 2900 | 0,0448 | −0,03 / 0,64 / 1,01 | 0,650 / 0,627 | 0,0032 | 0,0027 | 0,0118 |

En la ventana 2801–2900 la pérdida del crítico salta a 0,045 (frente a 0,009–0,014 entre los pasos 500 y 2800) y la norma de gradiente del crítico sube a 1,41 (rango habitual 0,5–1,1). Los pasos 2901–2999 no están registrados. El código empleado es la rama `lehome-noise-norm` en `f79f191` con adiciones sin commitear (preset `residual_rl_pi05_so101_rlt12_mpr137_rm1fix12`, opciones `--resume-from` / `--resume-actor-only` y la métrica `actor/q_gain_select_best_of_k`), mediante `scripts/train_residual_rl_rlt.py`.

## Capacidades

- Control robótico de manipulación para SO-101: genera deltas de acción de 12 dimensiones (incluidos los grippers) con horizonte de 20 pasos para la tarea de doblar una camiseta de manga larga.
- Refinamiento residual sobre una política VLA congelada: no sustituye a π₀.₅, sino que corrige sus acciones con un delta de escala pequeña (tamaño de residual medio ≈ 0,0118 al final del entrenamiento).
- Estimación de valor con ensamble de cinco críticos, que habilita selección best-of-k de acciones (ganancia medida de selección best-of-4 de 0,0027 al paso 2900).
- Selección de acción guiada por Q: la diferencia Q(actor) − Q(base) se mantiene positiva y creciente (0,0032–0,0041), lo que indica que el actor propone acciones mejor valoradas que la política base según el crítico.
- Muestreo con ruido correlacionado entre dimensiones de acción mediante una Cholesky fija de 240×240.
- Etiquetado de retornos Monte Carlo sobre rollouts (gamma 0,9997) y explotación de la señal de progreso del modelo de recompensa RM1.
- Sin soporte de tool calling, function calling, agentes multi-paso en el sentido de LLM, ni capacidades de visión-lenguaje propias: la percepción la aporta el backbone π₀.₅, que no se incluye en este repositorio.
- Capacidades multilingües: no disponibles; la instrucción de tarea registrada está en inglés.

## Casos de uso

- Reproducción de una ablación de hiperparámetros: comparar este checkpoint (actor lr 1e-4) con su hermano (actor lr 3e-4) manteniendo constante todo lo demás; el log muestra que ambos coinciden dentro de 0,01 en todas las métricas registradas entre los pasos 500 y 2800, por lo que sirve para documentar la insensibilidad del método a esa tasa.
- Investigación en RL residual con backbone congelado: el diseño (features RLT de 2048 + estado de 12, actor y críticos de 3×1024, salida escalada a 0,1) es una plantilla de bajo coste (4,4 h en una GPU) para estudiar cómo se desvía un actor de su política base sin degradar el comportamiento previo.
- Punto de partida para una ronda 3 de entrenamiento: el actor puede reanudarse con `--resume-actor-only` desde `step_00001500` o `step_00002999` y añadir nuevos rollouts etiquetados, reutilizando la misma canalización de etiquetado RM1 fix12.
- Estudio de estabilidad del crítico en RL offline: la ejecución contiene un salto de pérdida documentado en la ventana 2801–2900 (0,009–0,014 → 0,0448) con gradiente 1,41 y Q máximo 1,006, un caso concreto para analizar divergencia tardía y protocolos de parada temprana.
- Selección de acción best-of-k en despliegue de investigación: con cinco críticos se pueden puntuar k candidatos por chunk y elegir el de mayor Q, un patrón habitual en manipulación con modelos generativos de acción; aquí la ganancia medida es pequeña (≈0,0027), lo que permite cuantificar si compensa el coste computacional.
- Etiquetado y curación de datasets de robot: la receta descrita (`label_for_spiral.py --stride 15 --smoother-mode none --rm-instruction "Fold the T-shirt on the table"`) y las estadísticas del dataset (137 episodios, 66 éxitos, AUC 0,853 del reward model frente a la etiqueta de éxito) sirven para construir y auditar pipelines de recompensa en LeRobot v3.0.
- Análisis de ruido correlacionado en políticas de acción: la matriz Cholesky compartida entre rondas permite aislar el efecto de la estructura de covarianza del ruido frente al ruido isotrópico en experimentos controlados.
- Docencia y divulgación técnica: es un ejemplo compacto (0,4 GB de estado RL) de cómo congelar un VLA grande y entrenar solo la cabeza de refuerzo, útil para explicar RLHF/RL con modelos de recompensa en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay evaluaciones en robot ni pruebas offline del crítico ejecutadas (el autor lo indica explícitamente: "Not robot-evaluated; the offline critic probes have not been run"). Las únicas cifras publicadas son métricas internas de entrenamiento (pérdida del crítico, valores Q, ganancia de selección best-of-4, tamaño del residual), recogidas en la tabla de la sección anterior, y el AUC 0,853 del modelo de recompensa RM1 frente a la etiqueta de éxito del dataset, que caracteriza al etiquetador y no al rendimiento de esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB (actor, 5 críticos, redes objetivo y matriz de Cholesky), pero la política base π₀.₅ + RLT necesaria para operar no se incluye y su tamaño no se documenta en la información disponible.
- GPU recomendadas: no disponible. El entrenamiento se completó en 4,4 horas sobre una sola GPU, sin especificar el modelo.
- ¿Cabe en GPU de consumo? No determinable con los datos aportados; el estado RL es pequeño, pero el cuello de botella es el backbone VLA congelado, del que no se da tamaño ni requisitos de memoria.
- Opciones de despliegue: no aplican los servidores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), que no soportan este formato de checkpoints. Se requiere el código de la rama `lehome-noise-norm` (script `scripts/train_residual_rl_rlt.py`) para restaurar `actor_params`, `critic_params` y `target_critic_params`, junto con el checkpoint base `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` en el paso 9999.
- Latencia y throughput: no disponibles. Como referencia de coste, el entrenamiento procesó 96.000 muestras en 4,4 horas; no se publican latencias de inferencia ni frecuencia de control en robot (el dataset está a 15 fps).
- Hardware físico: el destino es el brazo SO-101; no se documentan adaptaciones a otras plataformas.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables. La comparación posible es interna a la familia SPIRAL, con las ejecuciones publicadas por el mismo autor:

| Ejecución | Pasos | lr actor / crítico | Pérdida crítico (última ventana) | Q(actor) − Q(base) | Ganancia best-of-4 | Tamaño residual | Estado |
|---|---|---|---|---|---|---|---|
| Este repo (`…alr1e-4-clr3e-4-3k`) | 3.000 | 1e-4 / 3e-4 | 0,0448 (salto en 2801–2900) | 0,0032 | 0,0027 | 0,0118 | Sin evaluar en robot; crítico con salto sin confirmar recuperación |
| Hermano (`…alr3e-4-clr3e-4-3k`) | 3.000 | 3e-4 / 3e-4 | sin salto según la model card | ≈ 0,0032 (coincide dentro de 0,0002) | ≈ 0,0027 | ≈ 0,0118 | Sin evaluar en robot; opción recomendada por el autor si hay dudas |
| Ejecución previa (`…td06-1500`) | 1.500 | 1e-4 / 1e-4 | no disponible en la información | no disponible | no disponible | no disponible | Referencia de ronda anterior |
| Política base (`pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k`, paso 9999) | 10.000 | no aplica (DAgger + RLT) | no aplica | 0 (referencia) | no aplica | no aplica | Requerida, no incluida en este repo |

Frente a alternativas externas (por ejemplo, otras políticas VLA para SO-101 o métodos de RL residual sobre políticas congeladas), no hay datos en la información proporcionada que permitan una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No evaluado en robot: no existen pruebas físicas ni episodios de validación con este checkpoint; el rendimiento real de la tarea de doblado es desconocido.
- Pruebas offline del crítico no ejecutadas, según la propia model card; no hay evidencia de que el ensamble de cinco críticos generalice fuera de los datos de entrenamiento.
- Salto de pérdida del crítico no resuelto: en la ventana 2801–2900 la pérdida pasa de 0,009–0,014 a 0,0448, con norma de gradiente 1,41 y Q máximo 1,006. Los pasos 2901–2999 no están registrados, así que se desconoce el estado en `step_00002999`; el autor recomienda usar `step_00001500` o el `step_00002999` de la ejecución hermana.
- Dependencia obligatoria de la política base: sin `pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k` (paso 9999, `vla_params` + `rlt_params`) el checkpoint es inutilizable. Esa política no se incluye y su licencia no se especifica en esta ficha.
- Código no reproducible tal cual: la rama `lehome-noise-norm` en `f79f191` requiere adiciones sin commitear (preset, `--resume-from`, `--resume-actor-only`, métrica `actor/q_gain_select_best_of_k`). Sin ese código no se pueden restaurar los estados.
- Alcance de tarea único: una sola tarea (doblar una camiseta de manga larga) y una sola instrucción en inglés; no hay evidencia de generalización a otras prendas, objetos o instrucciones.
- Dataset pequeño y desequilibrado: 137 episodios, 71 de ellos fallidos, 63.508 fotogramas, aproximadamente 1,5 pasadas sobre los datos en 3.000 pasos; riesgo de sobreajuste al lote de rollouts y de sobreestimación de Q.
- Sesgo del reward model: RM1 asigna progreso medio 0,56 a episodios fallidos y 27 de los 71 fallos superan 0,8, además de un 21,1 % de recompensas negativas por paso; el AUC de 0,853 implica solapamiento entre éxitos y fallos.
- Procedencia de los rollouts desconocida: no se registra qué política generó los episodios de `merged_policy_rollouts`, y el autor solo verifica que no coinciden con los conjuntos p1/p2, los 83 rollouts, Spiral_2/With_Critic ni BC_SPIRAL_2.
- Magnitud del efecto limitada: el residual medio es ≈ 0,0118 y la ganancia de selección best-of-4 ≈ 0,0027; las correcciones son muy pequeñas y su impacto funcional no se ha medido en el robot.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay informes independientes de uso.
- Licencia: el checkpoint se publica como Apache 2.0, lo que permite uso comercial, pero la licencia del backbone π₀.₅ y del dataset debe verificarse por separado antes de cualquier despliegue productivo.
- No es un modelo de lenguaje: no admite prompts arbitrarios, no tiene ventana de contexto ni capacidades de tool calling o agentes; cualquier expectativa de ese tipo es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr1e-4-clr3e-4-3k
- Ejecución hermana (actor lr 3e-4): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-alr3e-4-clr3e-4-3k
- Ejecución previa de 1.500 pasos: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-mpr137-rm1fix12-from-r1b-b10-g09997-td06-1500
- Política base requerida (π₀.₅ + RLT): https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s3-daggerrlt1-15fps-b32-10k
- Checkpoint de inicialización del actor (ronda 1b): https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt12-lehome-r1b-teleop57-daggerrlt1-rm1fix12-b30-mc05-bs32-5k
- Dataset de rollouts: https://huggingface.co/datasets/Nadeem-Shoukath115113/merged_policy_rollouts
- Registro de entrenamiento en Weights & Biases: proyecto `spiral-rlt12-mpr137`, ejecución `v6ytkl6a` (no se proporciona URL completa)
- Paper, blog, repositorio de código público y demo: no disponibles en la información proporcionada (el código citado es la rama `lehome-noise-norm` en `f79f191` y el script `scripts/train_residual_rl_rlt.py`, sin URL asociada)
