# kkeilasd/prismac-model

## Resumen

PrismAC AI Anti-Cheat Model v2.0 es un clasificador supervisado basado en gradient boosting (350 árboles de decisión, 75 características de entrada) entrenado para detectar trampas en servidores de Minecraft 1.21.4, en concreto KillAura, AimAssist y TickControl. Lo publica el usuario kkeilasd en HuggingFace con 0 descargas y 1 like en el momento de redactar esta ficha. No es un modelo de lenguaje: es un modelo tabular de tres clases (legit, killaura, aimassist) cuya salida se obtiene mediante softmax.

El modelo consume una ventana de 20 ticks con paso de 10, sobre la que calcula 75 características: 56 básicas (7 estadísticas sobre 8 columnas de delta_yaw/pitch, aceleración, jerk y error de GCD) y 19 derivadas (ratios, correlaciones, tasas de cero, cambios de signo y extremos). Está diseñado para ejecutarse embebido en un plugin de servidor: el autor reporta unos 1050 recorridos de árbol por inferencia (350 árboles x 3 clases) en menos de 0,1 ms.

Su relevancia práctica está en el despliegue: se distribuye en cuatro formatos (JSON para inferencia Java, ONNX, joblib y un JAR de plugin Paper listo para instalar) y emplea un mecanismo de acumulación de "heat" para evitar que picos cortos de sospecha en jugadores legítimos generen sanciones. Las métricas publicadas son moderadas y se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (350 árboles, implementación tipo sklearn GradientBoostingClassifier) |
| Parametros totales | no disponible (no se publica número de nodos ni de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; ventana de 20 ticks con paso de 10) |
| Tipos de cuantizacion | no aplica (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica al procesamiento de lenguaje; etiquetas de clase en inglés y model card en ruso |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | joblib (pickle de sklearn), ONNX, JSON (`gbm_trees.json`) y JAR (`prismac-1.0.0.jar`) |
| Entradas | 75 características por ventana (56 básicas + 19 derivadas) |
| Salidas | 3 probabilidades (legit, killaura, aimassist) vía softmax |
| Autor | kkeilasd |
| Fecha de publicacion | 2026-09-15 (última actualización 2026-09-15) |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Plataforma objetivo | Servidor Paper 1.21.4 (Minecraft) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de gradient boosting con 350 árboles que resuelve un problema de clasificación multiclase (3 clases) mediante softmax. La inferencia está implementada de forma nativa en Java, con evaluación recursiva de los árboles (`gbm_trees.json`), de modo que el modelo se ejecuta dentro del propio plugin sin depender de Python ni de una GPU. Existen además dos equivalencias funcionales: un grafo ONNX para ONNX Runtime y un objeto joblib para inferencia en Python con scikit-learn.

No se documentan en la información disponible ni el número de muestras de entrenamiento, ni la composición del dataset, ni los hiperparámetros (profundidad, learning rate, regularización), ni el uso de técnicas de ajuste tipo RLHF o DPO, que por otra parte no aplican a este tipo de modelo. Lo único que se detalla son los conjuntos de evaluación (76 archivos de KillAura, 15 de AimAssist y 90 de comportamiento legítimo) y el procedimiento de reentrenamiento mediante `python final_train.py`, que genera los artefactos en `trainer/output/`. La innovación destacable no está en el algoritmo, sino en el mecanismo de acumulación de "heat": el sistema exige sospecha sostenida en el tiempo antes de marcar una violación, de forma que los picos puntuales de jugadores legítimos no disparen falsos positivos.

## Capacidades

- Clasificación de comportamiento de jugador por ventanas de 20 ticks, con salida probabilística de tres clases.
- Detección de KillAura: 83 % de archivos detectados (63/76) y 100 % de ventanas por encima de 0,6 en los archivos positivos.
- Detección de AimAssist: 80 % de archivos detectados (12/15) y 100 % de ventanas por encima de 0,6 en los archivos positivos.
- Detección de TickControl: mencionada en la descripción del modelo, pero sin métricas publicadas.
- Filtrado por acumulación de "heat" para reducir falsos positivos ante picos cortos de sospecha.
- Inferencia en Java embebida en el plugin, sin proceso externo ni GPU (<0,1 ms por ventana según el autor).
- Distribución multiplataforma: ONNX Runtime y joblib/sklearn para pipelines en Python, JSON para Java.
- Integración operativa con Paper 1.21.4 mediante los comandos `/prismac check`, `/prismac status` y `/prismac reload`, con permiso `prismac.admin`.
- Reentrenamiento con datos propios del servidor mediante el script incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Anticheat en servidor Paper 1.21.4: se copia `prismac-1.0.0.jar` en `plugins/` y el modelo queda cargado con 350 árboles, gestionando la detección de forma local en el hilo del servidor.
- Detección de KillAura en arenas PvP: el modelo analiza las ventanas de movimiento y rotación y devuelve una probabilidad de killaura que, por encima del umbral `fail-avg-threshold` de 0,85, puede derivar en sanción.
- Detección de AimAssist: con una ventana de 20 ticks y características de delta_yaw, aceleración y jerk, identifica patrones de apuntado asistido con una tasa de detección del 80 % de archivos.
- Moderación asistida por operadores: el comando `/prismac check <jugador>` devuelve información del jugador para que un moderador humano revise el caso antes de aplicar una sanción.
- Reducción de falsos positivos en jugadores legítimos: el sistema de heat combinado con un umbral de reporte de 0,40 y un umbral de sanción de 0,85 permite separar rachas de latencia o lag de comportamiento automatizado.
- Analítica forense offline: cargando `prismac_model.joblib` o `prismac_model.onnx` en Python se pueden reprocesar registros históricos de partidas para auditar sanciones pasadas.
- Ajuste a la comunidad concreta del servidor: reentrenar con `trainer/final_train.py` sobre datos propios permite adaptar los umbrales y las características al estilo de juego y al ping de la región.
- Base para portes a otras plataformas: los formatos ONNX y JSON permiten integrar el clasificador en otros servidores o proxies que no sean Paper, siempre que se implemente la extracción de las 75 características.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Deteccion de KillAura (archivos) | 83 % (63/76); 100 % de ventanas con probabilidad > 0,6 |
| Deteccion de AimAssist (archivos) | 80 % (12/15); 100 % de ventanas con probabilidad > 0,6 |
| Tasa de falsos positivos | 0 archivos (0/90) con umbral 0,99 |
| Probabilidad maxima en `legit_killaura` | 0,987 |
| Latencia de inferencia en Java | <0,1 ms por ventana declarada por el autor (350 árboles x 3 clases = 1050 recorridos) |

No se han publicado resultados comparativos contra otros anticheats ni métricas adicionales (precisión, recall, F1, AUC) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo se ejecuta íntegramente en CPU.
- GPU recomendadas: no aplica.
- CPU: cualquier procesador moderno puede ejecutar la inferencia; el autor declara menos de 0,1 ms por ventana en la implementación Java.
- Compatibilidad con GPU de consumo: no aplica, no hay dependencia de CUDA ni de aceleradores.
- Memoria: no se especifica el consumo de RAM; el repositorio completo ocupa 0.0 GB según HuggingFace, por lo que el modelo es de tamaño muy reducido.
- Opciones de despliegue: plugin Paper 1.21.4 (JAR con inferencia Java sobre `gbm_trees.json`), ONNX Runtime (`prismac_model.onnx`) y Python con scikit-learn/joblib (`prismac_model.joblib`).
- Latencia y throughput: <0,1 ms por ventana declarados por el autor en Java; no se publican cifras de throughput agregado para múltiples jugadores concurrentes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras soluciones anticheat en la información proporcionada, ni de modelos abiertos equivalentes publicados con métricas comparables. Por tanto, la comparativa se marca como no disponible. Los elementos diferenciales que sí están documentados son la distribución en cuatro formatos (JSON, ONNX, joblib, JAR), la inferencia embebida en Java en menos de 0,1 ms y el mecanismo de heat, pero no existe una tabla pública que los enfrente a alternativas.

## Limitaciones y advertencias

- Las tasas de detección publicadas son moderadas: 83 % de archivos en KillAura y 80 % en AimAssist, lo que implica que una parte de los casos no se detecta.
- La tasa de falsos positivos de 0/90 se ha medido sobre un conjunto legítimo de solo 90 archivos con umbral 0,99; con umbrales más bajos (por ejemplo `fail-heat-threshold` 0,60) el riesgo de falsos positivos no está cuantificado.
- No se publican métricas para TickControl pese a que el modelo se presenta como detector de esa trampa.
- No se documentan la composición del dataset de entrenamiento, el número de muestras, la semilla ni los hiperparámetros, por lo que la reproducibilidad es limitada.
- El modelo es estático: un cheat adaptativo que modifique sus patrones de rotación o temporización puede degradar la detección sin que exista un mecanismo de actualización automática.
- Dependencia del dominio: las características se calculan sobre ticks de Minecraft 1.21.4; cambios de versión, mods, plugins de movimiento o ping elevado pueden alterar la distribución de entrada y el rendimiento.
- No se declara licencia en el repositorio de HuggingFace, por lo que el uso comercial o la redistribución no están amparados explícitamente por ningún permiso.
- Requiere el permiso `prismac.admin` (operador por defecto) para ejecutar los comandos de administración, lo que implica gestionar correctamente los roles del servidor.
- La model card está redactada principalmente en ruso, lo que puede dificultar el mantenimiento por equipos que no trabajen en ese idioma.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kkeilasd/prismac-model
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (paper, repositorio, blog o demo); los resultados devueltos corresponden a herramientas de diagramación y juegos sin relación con PrismAC.
