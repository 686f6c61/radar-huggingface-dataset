# DecentVLA/droidfull8_pi05_accord_cotrain_w010_expert

## Resumen

`DecentVLA/droidfull8_pi05_accord_cotrain_w010_expert` es un checkpoint de robótica de tipo vision-language-action (VLA) construido sobre π0.5 de openpi (implementación JAX), mediante un fine-tune completo desde `pi05_base` con la receta oficial de openpi para el dataset DROID (`pi05_full_droid_finetune`). Lo publica la organización DecentVLA dentro de una línea de experimentos de aprendizaje federado sobre DROID, y su interés radica en que aplica una variante concreta de co-entrenamiento federado (ACCORD-C) sobre todos los edificios de DROID: 8 clientes, 78.864 episodios y 22,13 millones de frames leídos con el pipeline RLDS de openpi.

El modelo no genera texto: recibe una cámara exterior, una cámara de muñeca, 7 posiciones articulares y el valor del gripper, y devuelve chunks de 16 pasos con objetivos articulares absolutos más gripper, en el mismo formato de entrada/salida que `pi05_droid_jointpos`. Su particularidad técnica es el término ACCORD-C: en cada paso local el cliente añade un 0,1 × la pérdida calculada sobre 16 ventanas de las liberaciones de los otros 7 sitios (acciones, propiocepción e instrucción, sin imágenes), y el gradiente de ese término se confina al *action expert* de π0.5, dejando intactos la pérdida propia y la agregación FedAvg.

Es relevante ahora porque sirve como brazo experimental controlado frente a `droidfull8_pi05_fedavg` (mismos datos, receta y calendario, sin el término de banco) y frente al checkpoint oficial π0.5-DROID joint-position, lo que permite aislar el efecto del co-entrenamiento federado con expertos. Los pesos servidos son la EMA (0,99), tal y como los sirve openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 de openpi (JAX/Flax); incluye un *action expert* diferenciado cuyo gradiente acota el termino ACCORD-C. La model card no detalla el backbone |
| Parametros totales | no disponible (no se publica el recuento en la informacion proporcionada) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible; no se especifica ventana de contexto textual. Las acciones se emiten en chunks de 16 pasos |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas (sin GGUF, sin safetensors) |
| Idiomas soportados | no disponible (la model card no especifica idiomas para las instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint oficial de openpi en JAX (`openpi/params/` con pesos EMA + `assets/droid/norm_stats.json`); snapshots intermedios `openpi_r200/` y `openpi_r320/`; checkpoint decent-vla en `.pt` (`server_round_0400.pt`, pesos + sombra EMA + YAML + log) |
| Entradas | 1 camara exterior + 1 camara de muneco; 7 posiciones articulares + gripper |
| Salidas | Chunks de 16 pasos de objetivos articulares absolutos + gripper (control por posicion articular) |
| Dataset de entrenamiento | RLDS `droid/1.0.1`, episodios exitosos, filtro de frames inactivos de openpi: 78.864 episodios, 22,13 M frames |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de π0.5 en su implementación oficial openpi (JAX) y se entrena con la receta `pi05_full_droid_finetune`: fine-tune completo desde `pi05_base` sobre DROID, con acciones expresadas como posiciones articulares en chunks de 16 pasos. La model card no documenta el número de parámetros, la composición del backbone visual-lingüístico ni el mecanismo exacto del *action expert*; únicamente confirma su existencia y que el término ACCORD-C se restringe a él. El optimizador es AdamW-like con lr 5e-5, clip de gradiente 1.0 y EMA 0.99, sobre 25,6 M de muestras propias.

El entrenamiento es federado: 8 clientes, cada uno formado por conjuntos de *edificios completos* de DROID (sin partir edificios entre clientes), balanceados por frames de entrenamiento y agregados con FedAvg ponderado por frames durante 400 rondas × 250 pasos locales × batch de 32 (más 16 ventanas del banco) por cliente. La innovación es ACCORD-C: tras cada ronda, cada sitio libera las acciones articulares, la propiocepción y la instrucción de sus episodios (sin imágenes, con los rangos del filtro de inactividad oficial). En cada paso local, el cliente suma 0,1 × la pérdida sobre 16 ventanas procedentes de las liberaciones de los otros 7 sitios, manteniendo instrucción y propiocepción y eliminando las cámaras; ese gradiente se confina al *action expert*. La consecuencia práctica es que este brazo ve 1,5× las muestras por ronda del brazo FedAvg (32 propias + 16 del banco).

## Capacidades

- Manipulación robótica por imitación: genera secuencias de 16 objetivos articulares absolutos más gripper a partir de dos vistas de cámara y del estado propioceptivo.
- Control por posición articular en plataformas DROID, con límite de seguridad por paso (`--max-joint-step`, 0,25 rad por defecto en el cliente incluido).
- Ejecución de instrucciones en lenguaje natural (el término ACCORD-C conserva la instrucción como entrada), aunque la model card no documenta cobertura multilingüe.
- Condicionamiento multimodal: cámara exterior + cámara de muñeca + 7 posiciones articulares + gripper.
- Despliegue como servidor de política (openpi `serve_policy.py`) consumible en remoto, con cliente de robot real (`droid_jointpos_main.py`) y cliente de simulación (RoboLab).
- Co-entrenamiento federado: el checkpoint `.pt` incluye pesos, sombra EMA y log, útil para reproducir o continuar rondas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso simbólico, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación de pick-and-place en un robot DROID real: el modelo recibe las dos cámaras y el estado articular y emite chunks de 16 pasos, lo que permite cerrar el bucle a una frecuencia de control razonable sin replanificar en cada frame.
- Tareas de apertura y cierre de cajones o puertas: el control por posición articular absoluta con límite de 0,25 rad por paso reduce el riesgo de comandos bruscos en articulaciones con topes mecánicos.
- Manipulación de objetos deformables o de precisión con la cámara de muñeca, que aporta la vista egocéntrica necesaria para el ajuste fino del gripper.
- Investigación en aprendizaje federado: el par `droidfull8 FedAvg` vs. este checkpoint ACCORD-C permite medir el efecto de añadir supervisión entre sitios con el gradiente confinado al action expert, a igualdad de datos y calendario.
- Evaluación estandarizada en simulación con RoboLab: el checkpoint se sirve con el fork de openpi indicado por NVLabs/RoboLab y se evalúa con `policies/pi0_family/run.py` en modo headless contra un servidor remoto.
- Reproducción de experimentos: a partir de `server_round_0400.pt` y del YAML `openpi_pi05_droidfull8_accord_cotrain_w010_expert_local.yaml` se puede reanudar el entrenamiento o auditar el calendario de rondas.
- Estudio de privacidad en federado: el diseño libera acciones, propiocepción e instrucción pero no imágenes, un escenario realista para analizar qué se filtra a través de la supervisión compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en RoboLab, ni métricas de DROID, ni comparaciones numéricas con `droidfull8_pi05_fedavg` o con `pi05_droid_jointpos`; únicamente propone esos checkpoints como términos de comparación. Tampoco se han encontrado resultados en la búsqueda web realizada (los resultados devueltos corresponden a hilos del foro de OpenFOAM y no guardan relación con el modelo).

## Requisitos de hardware

- VRAM para servir la política: ≥ 16 GB en una GPU NVIDIA, según la model card (modo "serving only").
- VRAM para evaluación en RoboLab: RTX con ≥ 48 GB según la model card; el ejemplo de servicio fija `XLA_PYTHON_CLIENT_MEM_FRACTION=0.5`.
- GPU recomendadas: no se enumeran modelos concretos (A100, H100, RTX 4090) en la informacion disponible; los requisitos se expresan únicamente en GB de VRAM.
- Ajuste en GPU de consumo: no confirmado. El umbral de 16 GB para servir sugiere que una RTX 4080/4090 podría bastar en inferencia, pero la model card no lo certifica y el entrenamiento o la evaluación en RoboLab exigen bastante más memoria.
- Despliegue: servidor de política de openpi (`scripts/serve_policy.py --policy.config=pi05_droid_jointpos --policy.dir=...`), con el fork `xuningy/openpi` para RoboLab; cliente real `droid_jointpos_main.py`; no se documentan rutas vLLM, llama.cpp, Ollama ni TGI (no aplicables a un checkpoint JAX de robótica).
- Latencia y throughput: no disponible.
- Nota operativa: los ficheros llegan mediante una pull request del run de entrenamiento; hay que comprobar el estado de la PR (Community → Pull requests) antes de descargar.

## Comparativa con modelos similares

| Modelo | Datos | Receta | Termino adicional | Pesos servidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`droidfull8_pi05_accord_cotrain_w010_expert`) | DROID `1.0.1`, 78.864 episodios, 22,13 M frames | 400 rondas × 250 pasos × batch 32 (+16 banco), 8 clientes, FedAvg por frames | ACCORD-C, peso 0,1, gradiente confinado al action expert | EMA 0,99 | Apache 2.0 | HF, PR pendiente de merge |
| `DecentVLA/droidfull8_pi05_fedavg` | Mismos datos y filtro | Mismo calendario y agregación | Ninguno (sin banco) | EMA 0,99 | Apache 2.0 | HF |
| π0.5-DROID joint-position oficial (`gs://openpi-assets-simeval/pi05_droid_jointpos`) | Receta oficial de openpi sobre DROID | Entrenamiento centralizado estándar | No aplica | Pesos oficiales | Segun openpi (no indicada en la informacion disponible) | Bucket GCS de openpi |
| `pi05_base` | Preentrenamiento base de π0.5 | Punto de partida del fine-tune | No aplica | Pesos base | Segun openpi (no indicada) | openpi |

No se dispone de cifras de parámetros, contexto ni rendimiento para ninguna de las filas, por lo que la comparación cuantitativa no es posible con la informacion proporcionada. La diferencia medible entre los dos primeros brazos es de muestras por ronda (1,5× en este modelo) y el alcance del gradiente del término ACCORD.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay tasas de éxito ni comparaciones numéricas publicadas, por lo que no se puede afirmar que ACCORD-C mejore a FedAvg o al checkpoint oficial. El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.
- Entrenado solo con episodios exitosos de DROID: no aprende a recuperarse de fallos ni modela estados de error, algo crítico en produccion.
- El término ACCORD-C prescinde de las imágenes de otros sitios; la supervisión compartida es por tanto parcial y puede no transferir bien a escenas visualmente distintas de las del sitio local.
- Sesgo geográfico y de hardware: los clientes son edificios concretos de DROID, con cocinas y objetos de ese corpus; el rendimiento fuera de esa distribución no está caracterizado.
- Acciones en espacio de posición articular (7 articulaciones + gripper), acopladas a una plataforma DROID concreta; no es portable a otras cinemáticas sin reentrenamiento.
- Seguridad física: el cliente impone un límite de 0,25 rad por paso, pero no se documentan paradas de emergencia, límites de fuerza ni validación de colisiones.
- Idiomas: no se especifica qué idiomas admiten las instrucciones; no asumir multilingüismo.
- Riesgo de alucinacion en el sentido de deriva de política: no hay análisis de comportamiento fuera de distribución, ni de calibración de la incertidumbre, ni de detección de fallo.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos DROID y los términos del checkpoint base de openpi deben verificarse por separado; la model card no incluye avisos adicionales.
- Empaquetado incompleto: los ficheros llegan como pull request y pueden no estar fusionados; el checkpoint es JAX, no hay safetensors ni GGUF, y no existen rutas de despliegue en ecosistemas tipo llama.cpp u Ollama.
- La fecha de creación indicada (2026-10-28) y la ausencia de documentación sobre el backbone impiden verificar detalles arquitectónicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DecentVLA/droidfull8_pi05_accord_cotrain_w010_expert
- Brazo de comparación FedAvg: https://huggingface.co/DecentVLA/droidfull8_pi05_fedavg
- Checkpoint oficial π0.5-DROID joint-position: `gs://openpi-assets-simeval/pi05_droid_jointpos`
- Runbook y código de entrenamiento: decent-vla `examples/droid/README_droidfull8.md`, paso 7 (tag `droidfull8-v2`) — URL no incluida en la informacion disponible
- Servidor openpi para RoboLab: fork `xuningy/openpi`, instrucciones en NVLabs/RoboLab `policies/pi0_family/README.md` — URL no incluida en la informacion disponible
- Proyecto openpi (implementación JAX de π0.5): referenciado en la model card; URL no incluida en la informacion disponible
- Resultados de la búsqueda web: no relevantes (hilos del foro de OpenFOAM sobre `writeControl`, `chtMultiRegionFoam`, coeficiente de fricción y `functionObjects`), sin relación con el modelo.
