# kimtaegyu/TETHER_CVPR

## Resumen

TETHER_CVPR es un conjunto de checkpoints de política robótica para brazos SO-100/SO-101, publicado por el usuario kimtaegyu para una comparación experimental presentada en CVPR. No es un modelo de lenguaje, sino un checkpoint de aprendizaje por imitación basado en un transformer de difusión con flow matching (DiT-Flow MT) que controla un brazo robótico real a partir de instrucciones en lenguaje natural e imágenes. El repositorio contiene cuatro ejecuciones completas de aprendizaje continuo secuencial sobre cuatro tareas de manipulación, con el objetivo de comparar el método propuesto MAR frente a una línea base de Experience Replay (ER).

El interés del artefacto es metodológico: cada directorio (`er/`, `mar_lam1/`, `mar_lam2/`, `mar_lam3/`) contiene checkpoints intermedios tras cada tarea (`task_0` a `task_3`), lo que permite observar la progresión del olvido catastrófico paso a paso. El método MAR añade una pérdida de anclaje sobre acciones pasadas sintetizadas desde un código de estados y características visuales, con descomposición de la velocidad en magnitud y dirección. La evaluación se realiza mediante MSE de acción en ventanas hold-out, no mediante tasas de éxito en rollouts reales.

El repositorio ocupa 10,1 GB, no tiene descargas ni likes en el momento de la consulta, y requiere un fork específico de LeRobot (`lerobot_lsy`) para cargar la política, ya que el tipo `ditflow_mt` no existe en el upstream. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT-Flow MT (transformer de difusión con flow matching) sobre LeRobot |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de pipeline | robotics |
| Librería | lerobot (requiere fork `lerobot_lsy`) |
| Tamaño del repositorio | 10,1 GB |
| Hardware objetivo | brazos SO-100 / SO-101 (`so_follower`) |
| Tareas entrenadas | 4 (ring, box, carrot, stack_cup) |
| Pasos por tarea | 10.000 (40.000 totales) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La política es un transformer de difusión con flow matching multi-tarea (`ditflow_mt`), que predice acciones de 8 pasos en el espacio normalizado a partir de observaciones de estado y características visuales, condicionado por la instrucción textual de la tarea. El punto de partida es el checkpoint `svla_so100_pretrained_clare`, un preentrenamiento conjunto sobre tres tareas de SO-100; se cargan solo los pesos y se usan estadísticas de normalización propias del conjunto ASDL. La normalización es min/max agrupada (pooled) sobre las cuatro tareas, idéntica en las cuatro ejecuciones.

El entrenamiento es secuencial sobre cuatro tareas, con 10.000 pasos por tarea, batch de 32, optimizador AdamW y un scheduler coseno que se reinicia en cada tarea. Cada tarea usa 45 episodios para entrenamiento y reserva 5 para hold-out. La innovación central es la pérdida de anclaje de MAR: para cada tarea pasada j se generan muestras sintéticas a partir de un código de estados y características visuales (K = max(8, 2 × número de demos)) y se comparan las acciones del estudiante y del profesor en espacio de acción, descomponiendo el error en magnitud (m) y dirección (e) según `‖p_S − p_T‖² = (r_S − r_T)² + 2·r_S·r_T·(1 − cos)`. El término de dirección se pondera por el inverso del cuadrado de la magnitud del profesor, de modo que las fases lentas de manipulación precisa reciben supervisión direccional. Los coeficientes quedan acotados en (0, 1/c] con c = 0,1 y β = 1, lo que evita el clipping basado en estadísticas de batch. La línea base ER mantiene un buffer de 5 episodios por tarea pasada y concatena 24 muestras actuales con 8 de replay en un único batch.

## Capacidades

- Control de manipulación robótica de 4 tareas sobre brazo SO-100/SO-101: colocar el anillo en el palo, recoger un bloque y dejarlo en la caja, coger la zanahoria y ponerla en la cesta, apilar un vaso de papel sobre otro.
- Condicionamiento por instrucción en lenguaje natural (una instrucción fija por tarea).
- Aprendizaje continuo secuencial con checkpoints intermedios por tarea para analizar el olvido.
- Política de flow matching multi-tarea con horizonte de acción de 8 pasos.
- No soporta tool calling, function calling, agentes, visión general, audio ni modo de razonamiento; es una política motora, no un modelo generativo de propósito general.
- Capacidades multilingües: no disponible; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Investigación en aprendizaje continuo: comparar MAR frente a Experience Replay en un mismo entorno, mismo seed y misma partición de datos, usando los checkpoints `task_0` a `task_3` para medir la evolución del olvido tarea a tarea.
- Reproducción de experimentos para revisión por pares: el repositorio incluye `train_config.json`, `holdout_report.txt`, `holdout_mse.csv/.json`, `summary.json` y `diag.jsonl` con la pérdida y los valores internos del anclaje cada 200 pasos, lo que facilita auditorías y réplicas.
- Estudio de pérdidas de anclaje en espacio de acción: el código en `policy_code/L2_V5.py` y `policy_code/cl_train.py` permite modificar λ, β, c y el modo de reducción para analizar el compromiso entre retención y plasticidad.
- Desarrollo de políticas para brazos de bajo coste: sirve como referencia de entrenamiento de una política DiT-Flow sobre SO-100 con datasets públicos de ASDL, útil para laboratorios con hardware asequible.
- Evaluación de olvido catastrófico con métricas de error de acción: útil para quienes prefieren MSE de acción en hold-out antes de invertir en rollouts reales costosos.
- Base para experimentos de destilación o ajuste fino posterior: los checkpoints finales de cada método pueden usarse como punto de partida para nuevas tareas o para comparar estrategias de regularización.

## Benchmarks y rendimiento

Los resultados publicados son MSE de acción en espacio normalizado sobre ventanas hold-out de 8 pasos, con 256 ventanas por tarea. No son tasas de éxito en rollouts reales.

Resultado final tras las 4 tareas (checkpoint `task_3`, menor es mejor):

| Tarea | ER | MAR λ=1 | MAR λ=2 | MAR λ=3 |
|---|---|---|---|---|
| t0 ring | 0,00843 | 0,01066 | 0,01068 | 0,01096 |
| t1 box | 0,01418 | 0,01360 | 0,01400 | 0,01438 |
| t2 carrot | 0,01562 | 0,01256 | 0,01239 | 0,01272 |
| t3 stack_cup | 0,01162 | 0,01042 | 0,01039 | 0,01064 |
| Media | 0,01246 | 0,01181 | 0,01187 | 0,01218 |

Olvido (diferencia entre el valor final y el valor inmediatamente posterior al aprendizaje de la tarea; negativo indica mejora):

| Tarea | ER | MAR λ=1 | MAR λ=2 | MAR λ=3 |
|---|---|---|---|---|
| t0 ring | −0,00116 | +0,00106 | +0,00109 | +0,00137 |
| t1 box | −0,00049 | −0,00150 | −0,00144 | −0,00182 |
| t2 carrot | +0,00197 | −0,00058 | −0,00055 | −0,00035 |
| Media | +0,00008 | −0,00025 | −0,00023 | −0,00020 |

Observaciones del autor: el valor de t0 inmediatamente tras la primera tarea (0,00959) es idéntico en las cuatro ejecuciones, lo que confirma que comparten punto de partida y seed. ER preserva mejor t0 pero pierde más en t2 (+0,00197); MAR mejora en t2 y t3 y pierde algo en t0. La media final más baja corresponde a MAR λ=1. Solo hay un seed y un orden de tareas, por lo que no puede determinarse si las diferencias entre ejecuciones (máximo 0,0007) superan la variabilidad entre seeds.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica el número de parámetros ni el consumo de memoria. El tamaño total del repo (10,1 GB) incluye cuatro ejecuciones con cuatro checkpoints cada una y código, no un único modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el fork `lerobot_lsy` de LeRobot y el código de `policy_code/` (`modeling_dit_flow_mt.py`, `configuration_dit_flow_mt.py`), que depende del núcleo de LeRobot y no funciona de forma autónoma. La carga se realiza con `PreTrainedConfig` y `make_policy` de LeRobot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TETHER_CVPR (este) | DiT-Flow MT + MAR / ER | 4 tareas SO-100 | no disponible | Apache 2.0 | Hugging Face, requiere fork de LeRobot |
| kimtaegyu/TETHER | DiT-Flow MT, misma estructura | no disponible en la información | no disponible | Apache 2.0 (según repo) | Hugging Face |
| Línea base ER (incluida en este repo) | DiT-Flow MT + replay | 4 tareas SO-100 | no disponible | Apache 2.0 | Incluida en `er/` |
| `svla_so100_pretrained_clare` | Preentrenamiento conjunto SO-100 | 3 tareas | no disponible | no disponible | Usado como inicialización |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son MSE de acción en hold-out, no tasas de éxito en rollouts reales; el propio autor advierte que deben leerse junto con evaluaciones en robot físico.
- Solo hay un seed (42) y un orden de tareas; la significación estadística de las diferencias entre métodos no está establecida.
- El modelo está entrenado para cuatro tareas concretas con instrucciones fijas; no generaliza a tareas nuevas sin reentrenamiento.
- Requiere un fork no estándar de LeRobot (`lerobot_lsy`); el código de `policy_code/` no funciona de forma independiente.
- Los nombres internos conservan la etiqueta `v5` en código y `task_info.json`; `"method": "v5"` corresponde a MAR, lo que puede inducir a error.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo que revelan los datos de hold-out.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de pesos preentrenados (`svla_so100_pretrained_clare`) cuyas condiciones no se detallan en la información disponible.
- El repositorio no incluye demostraciones, espacios de Hugging Face ni resultados de éxito en robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimtaegyu/TETHER_CVPR
- Repositorio relacionado TETHER: https://huggingface.co/kimtaegyu/TETHER
- Dataset `asdl-unist/put_the_ring_on_the_stick`: https://huggingface.co/datasets/asdl-unist/put_the_ring_on_the_stick
- Dataset `asdl-unist/pick_a_block_and_drop_on_the_box_2`: https://huggingface.co/datasets/asdl-unist/pick_a_block_and_drop_on_the_box_2
- Dataset `asdl-unist/new_aicp_carrot`: https://huggingface.co/datasets/asdl-unist/new_aicp_carrot
- Dataset `asdl-unist/stack_cup`: https://huggingface.co/datasets/asdl-unist/stack_cup
- LeRobot (librería base): https://github.com/huggingface/lerobot
- Paper, blog o demo asociados: no disponibles en la información proporcionada.
