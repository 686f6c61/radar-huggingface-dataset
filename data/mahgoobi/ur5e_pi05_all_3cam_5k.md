# mahgoobi/ur5e_pi05_all_3cam_5k

## Resumen

`ur5e_pi05_all_3cam_5k` es un punto de control de robótica (VLA, vision-language-action) publicado por el usuario mahgoobi en HuggingFace. Se trata de un ajuste fino de π₀.₅ sobre 1.080 grabaciones reales de un brazo UR5e con pinza Robotiq, partiendo del modelo base `pi05_base`. El modelo recibe tres imágenes de 224×224, un vector de estado de 7 dimensiones y una instrucción de tarea en lenguaje natural, y emite un chunk de 50 acciones de 7 dimensiones a 20 Hz (2,5 segundos de movimiento por inferencia).

Es relevante porque forma parte de una serie de experimentos reproducibles sobre datos de manipulación reales: cubre seis tareas de sobremesa distinguidas únicamente por el prompt, con cuatro niveles de clutter (`d1`–`d4`) incluidos en entrenamiento y un reparto por episodio (cada décimo episodio reservado). El punto de control corresponde al paso 5.000 de una ejecución de 20.000 pasos, no a una ejecución corta: el decaimiento coseno del learning rate estaba todavía en 2,26e-5.

El interés técnico principal es que documenta con detalle el proceso (acciones sintetizadas a partir del estado siguiente, `norm_stats` calculado solo sobre el conjunto de entrenamiento, curva de generalización que se aplana hacia el paso 4.000) y publica la métrica `action_mse` en unidades crudas, comparable entre políticas. Se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 12,4 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (flow matching) sobre backbone `gemma_2b`, con torre de visión para tres cámaras; `action_dim` interno 32, `action_horizon` 50 |
| Parametros totales | no disponible (la model card solo identifica el backbone de lenguaje como `gemma_2b`) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | prompt de tarea tokenizado a 200 tokens; ventana de contexto completa no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la información proporcionada) |
| Idiomas soportados | prompts de tarea únicamente en inglés (las seis tareas están definidas en inglés); no es un modelo multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de LeRobot / openpi (el repositorio ocupa 12,4 GB); no se especifica safetensors ni GGUF |
| Entradas | 3 cámaras RGB a 224×224 (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) + estado de 7 dimensiones (6 ángulos articulares en radianes, pinza normalizada a [0, 1]) + prompt de tarea |
| Salidas | chunk de 50 pasos × 7 dimensiones a 20 Hz; articulaciones como deltas respecto al estado actual, pinza absoluta (`make_bool_mask(6, -1)`) |
| Frecuencia de control del dataset | 20 fps |

## Arquitectura y entrenamiento

El modelo sigue la receta π₀.₅: una política de flow matching que combina un backbone de lenguaje `gemma_2b` con entradas visuales de tres cámaras y un vector propioceptivo de 7 dimensiones, y que genera un horizonte de acción de 50 pasos con `action_dim` interno de 32 (la transformación de salida recorta a 7). El preprocesado de imagen usa `resize_with_pad` de openpi, que encaja 320×240 en 224×224 con barras de relleno. El prompt es el *task string* del episodio, tokenizado a 200 tokens.

El entrenamiento usó el conjunto `ur5e_all`: 1.200 episodios, 373.427 fotogramas, 6 tareas, 5 subconjuntos y el perfil `ur5e_robotiq`, con un reparto de 1.080 episodios de entrenamiento y 120 reservados (cada décimo episodio, es decir, split por grabación y no por fotograma). Se ejecutaron 5.000 pasos de los 20.000 previstos, con batch 144 y decaimiento coseno del learning rate sobre los 20.000 pasos, lo que equivale a unas 2,1 pasadas sobre 336.000 fotogramas de entrenamiento. El entrenamiento se hizo con el código de RoboResearch (configuración `pi05_ur5e_all`) sobre openpi, en 3 × H200; la ejecución completa de 20.000 pasos tardó 23 h 25 min.

Detalles técnicos destacables y con implicaciones para el uso: las acciones no se grabaron, se sintetizaron definiendo la acción de cada paso como el estado del paso siguiente (`scripts/convert_ur5e.py`), de modo que la política reproduce la siguiente pose del propio brazo dentro de un plan de waypoints guionizado. Además, la articulación `j4` está congelada en cinco tareas (menos de 0,0025 rad de recorrido) y es bimodal en `put_bowl_on_rack`, con los episodios `clean` en `j4` 1.5750 y los de clutter en 4.7160 (π de diferencia, la rama de muñeca reflejada). `data_setup.json` del repositorio registra que el tercer slot de cámara (`right_wrist_0_rgb`, alimentado por `use_side_camera`) se entrenó con imagen real y no con ceros.

## Capacidades

- Generación de acciones de manipulación robótica: produce chunks de 50 acciones × 7 dimensiones a 20 Hz (2,5 s de movimiento por inferencia) para un UR5e de seis articulaciones con pinza Robotiq.
- Condicionamiento por lenguaje natural: seis tareas distinguidas solo por el prompt, sin cambio de pesos: `place the three cups in the bowls`, `put the book in the box`, `put the bowl on the rack`, `put the cup in the bowl`, `put the mug on the coaster`, `stack the two cubes`.
- Percepción multi-cámara: tres vistas simultáneas (cámara de escena, cámara de muñeca y segunda vista de escena desde la base), las tres con contenido real.
- Control con mezcla de espacios de acción: deltas articulares para las seis juntas y comando absoluto para la pinza.
- Ejecución de tareas largas: `place the three cups in the bowls` encadena tres pick-and-place, con episodios de 710 fotogramas de media frente a unos 235 en el resto.
- Robustez a clutter de sobremesa: los niveles `d1`–`d4` están dentro del entrenamiento.
- No soporta *tool calling*, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito: es una política de control, no un asistente conversacional.
- No hay capacidades multilingües: los prompts son cadenas en inglés asociadas a episodios concretos.

## Casos de uso

- Manipulación pick-and-place con UR5e en laboratorio: el modelo ejecuta las seis tareas de sobremesa directamente sobre el robot, con instrucciones de texto como único selector de tarea, lo que permite cambiar de tarea sin recargar pesos.
- Investigación en VLA y ajuste fino: sirve como punto de partida para reentrenar sobre nuevos conjuntos de datos siguiendo la configuración `pi05_ur5e_all` de RoboResearch, al ser un checkpoint intermedio con learning rate aún alto (2,26e-5).
- Replicación de experimentos de generalización: el reparto por episodio (1.080 / 120) y el `action_mse` en unidades crudas permiten reproducir la curva de generalización y compararla con los checkpoints de 10.000, 15.000 y 19.999 pasos.
- Evaluación comparativa de políticas de imitación: al publicar `action_mse` sin normalizar, se puede contrastar contra otras políticas del mismo robot bajo la misma métrica.
- Automatización de rutinas de mesa en entorno controlado: tareas repetitivas de colocación de objetos (vasos en cuencos, libro en caja, cubo apilado) con la pinza Robotiq y control a 20 Hz.
- Estudio de multimodalidad en políticas: `put_bowl_on_rack` presenta dos configuraciones de muñeca separadas π radianes para el mismo prompt, un caso útil para analizar cómo una política unimodal promedia o colapsa modos.
- Validación de pipelines de despliegue (LeRobot / openpi / ROS 2) antes de pasar a un robot físico, midiendo si la latencia de inferencia encaja dentro de los 2,5 s de movimiento que cubre cada chunk.
- Generación de datos sintéticos de acción para investigación en imitación: el esquema de acción = estado siguiente es reproducible y documentado en `scripts/convert_ur5e.py`.

## Benchmarks y rendimiento

La model card publica una única familia de métricas, medida en unidades crudas de acción (normalización deshecha):

| Métrica | Paso 0 | Paso 5.000 | Mejora |
|---|---|---|---|
| `action_mse` en held-out | 0,069912 | 0,001994 | 35× |
| `action_mse` en entrenamiento | 0,069258 | 0,000698 | 99× |
| Pérdida de flow matching | 0,0382 | 0,0013 | 30× |

Otros datos aportados por el autor:

| Punto de control | `action_mse` held-out |
|---|---|
| Paso 5.000 (este modelo) | 0,001994 |
| Paso 10.000 | 0,001858 |
| Paso 15.000 | 0,001713 |
| Paso 19.999 | 0,001752 |

La curva de held-out se aplana hacia el paso 4.000: la ventana 2.000–4.000 promedia 0,00196 y todas las ventanas de 2.000 pasos posteriores quedan entre 0,00169 y 0,00183, con el 90 % de las lecturas desde el paso 2.000 entre 0,0015 y 0,0021. La lectura individual más baja fue 0,001365 en el paso 4.500. El autor señala que las diferencias entre checkpoints quedan dentro del ruido de una estimación con cuatro lotes.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de manipulación como LIBERO) en la información disponible, y la búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del backbone, no confirmada por el autor): del orden de 8–12 GB en bfloat16 para pesos, torre de visión y activaciones; el repositorio completo ocupa 12,4 GB, lo que probablemente incluye pesos en mayor precisión.
- GPU recomendadas: H100, H200 o A100 de 40/80 GB para entrenamiento o ajuste fino (el autor usó 3 × H200 para el ciclo completo de 20.000 pasos); para inferencia, una GPU con 16 GB o más es suficiente según la estimación anterior.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con 16–24 GB (RTX 4090, RTX 4080, RTX 3090), siempre que el runtime de openpi/LeRobot lo permita. No hay confirmación del autor.
- Opciones de despliegue: LeRobot (la librería declarada del repositorio), openpi (base sobre la que se entrenó) y, en su caso, integración con ROS 2 a través de openpi. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles como cifra medida. Como referencia de diseño, cada inferencia cubre 2,5 s de movimiento (50 pasos a 20 Hz), por lo que la inferencia debe completarse muy por debajo de ese margen para mantener un control fluido por chunking.

## Comparativa con modelos similares

| Modelo | Base | Datos | Cámaras | Tareas | Estado | Licencia | `action_mse` held-out |
|---|---|---|---|---|---|---|---|
| `ur5e_pi05_all_3cam_5k` (este) | `pi05_base` | `ur5e_all`, 1.200 episodios, 373.427 fotogramas | 3 | 6 (incluye clutter `d1`–`d4`) | paso 5.000 de 20.000 | apache-2.0 | 0,001994 |
| `ur5e_pi05_all_3cam_20k` | `pi05_base` | mismo conjunto | 3 | 6 | paso 20.000 | no disponible | no disponible (el autor cita 0,001752 en el paso 19.999) |
| `ur5e_pi05_10k` | `pi05_base` | subconjunto anterior | 2 | 5, solo `clean` | anterior | no disponible | no disponible |
| `pi05_base` | — (modelo base) | preentrenamiento generalista de openpi | según configuración | generalista | base | no disponible | no aplica |

Frente a políticas generalistas de manipulación (por ejemplo π₀ original u OpenVLA), no hay en la información proporcionada datos comparables de parámetros, contexto o rendimiento, por lo que la comparación cuantitativa queda como no disponible. La comparación relevante aquí es interna a la familia de checkpoints del mismo autor, que comparten base y métrica.

## Limitaciones y advertencias

- Específico de hardware y conjunto: entrenado para un único UR5e con pinza Robotiq, tres cámaras concretas y seis tareas de sobremesa; no es un modelo generalista y no se espera que funcione fuera de esa configuración sin reentrenar.
- Acciones sintetizadas: como las grabaciones originales no tienen flujo de acciones, cada acción se definió como el estado del paso siguiente. La política reproduce el plan de waypoints guionizado, no consignas de control reales; conviene tenerlo en cuenta al interpretar el `action_mse`.
- Curva de generalización aplanada: el held-out se estabiliza hacia el paso 4.000 mientras el entrenamiento sigue bajando; las pasadas posteriores compran ajuste, no generalización. Existe una brecha real entre entrenamiento (0,000698) y held-out (0,001994).
- Restricción cinemática de `j4`: congelada en cinco tareas y bimodal (separada π radianes) en `put_bowl_on_rack`; un policy unimodal puede promediar ambas ramas y producir movimientos de muñeca no válidos.
- Idiomas: solo inglés, con seis cadenas de tarea fijas; no hay soporte multilingüe ni comprensión de instrucciones libres.
- Generalización limitada: los niveles de clutter `d1`–`d4` forman parte del entrenamiento, por lo que ya no sirven como conjunto de prueba; solo quedan los 120 episodios reservados.
- Sin benchmarks estándar publicados ni comparación con otras políticas; la única métrica disponible es `action_mse` y las diferencias entre checkpoints están dentro del ruido de una estimación con cuatro lotes.
- Sesgos conocidos: no se documentan en la información proporcionada. Al tratarse de datos de un único robot y entorno, es previsible un sesgo fuerte hacia esa configuración física y esas posiciones de objeto.
- Riesgo de alucinación en el sentido clásico: no aplica de forma directa, pero sí el riesgo de generar trayectorias plausibles que fallen físicamente (colisiones, agarres fallidos) fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; el autor no añade restricciones adicionales. Conviene verificar igualmente la licencia de `pi05_base` y de los pesos de openpi por separado.
- Advertencia para producción: los modelos de la serie son checkpoints de investigación con documentación detallada pero sin validación de seguridad para operación con personas o en entornos no controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_5k
- Punto de control final de la misma ejecución (paso 20.000): https://huggingface.co/mahgoobi/ur5e_pi05_all_3cam_20k
- Punto de control anterior (2 cámaras, 5 tareas, solo `clean`): https://huggingface.co/mahgoobi/ur5e_pi05_10k
- Código de entrenamiento (configuración `pi05_ur5e_all`): https://github.com/EAI-RSM/RoboResearch
- Base de código openpi: https://github.com/wensi-ai/openpi
- Pesos del modelo base π₀.₅: `gs://openpi-assets/checkpoints/pi05_base/params`
- Archivos citados dentro del repositorio: `data_setup.json` (registro de configuración de datos y cámaras) y `scripts/convert_ur5e.py` (conversión de grabaciones y síntesis de acciones)
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo, su autor o benchmarks asociados.
