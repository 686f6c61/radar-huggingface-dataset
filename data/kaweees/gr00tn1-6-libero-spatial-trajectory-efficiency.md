# kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency

## Resumen

`kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency` es un ajuste fino del modelo fundacional robótico NVIDIA GR00T N1.6-3B, publicado por el usuario kaweees. No se trata de un modelo orientado a producción, sino de un artefacto de investigación: un experimento controlado de eficiencia de datos que mide cuántas trayectorias de demostración (5, 10, 15, 25 y 50) necesita el modelo para aprender la tarea 0 del benchmark LIBERO Spatial.

Cada variante parte de las bases oficiales fijadas de NVIDIA, usa la semilla 42 y subconjuntos anidados idénticos entre versiones, de modo que las cinco ejecuciones son comparables entre sí. Los resultados son en su mayoría negativos: cuatro de las cinco configuraciones completadas obtienen 0 aciertos sobre 20 en la tarea 0, y solo la de 50 trayectorias alcanza 7 sobre 20, tras 6 épocas verificadas.

El repositorio ocupa 214,3 GB e incluye pesos, configuraciones, procesadores, estadísticas de normalización de Spatial, mapeos de embodiment, código de ejecución, manifiestos de entrenamiento, evaluaciones y verificación de carga offline; el estado del optimizador se excluye. No se declara licencia, idiomas ni pipeline, y el repositorio no documenta benchmarks más allá de la métrica de éxito de la tarea 0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; ajuste sobre el modelo fundacional robótico NVIDIA GR00T N1.6-3B (entrada visual y salida de acciones, según el benchmark LIBERO Spatial empleado) |
| Parámetros totales | 3B (según el identificador del modelo base, `nvidia/GR00T-N1.6-3B`); no se declara desglose en la model card |
| Parámetros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se documenta ninguna cuantización) |
| Idiomas soportados | No disponible (no se documenta cobertura lingüística) |
| Licencia | No disponible (el repositorio no declara licencia; debe consultarse la del modelo base por separado) |
| Formato de pesos | safetensors (etiqueta del repositorio); los checkpoints incluyen además configuraciones, procesadores y código de ejecución |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (codificador visual, backbone ni cabeza de acciones). Lo que sí se documenta es el procedimiento experimental: cinco presupuestos de trayectorias independientes (5, 10, 15, 25 y 50 trayectorias en total), semilla 42, subconjuntos anidados idénticos entre versiones y bases oficiales de NVIDIA fijadas por revisión. Las ejecuciones ya completadas se conservan y se omiten en relanzamientos.

El protocolo de evaluación asigna 20 rollouts de la tarea 0 de LIBERO Spatial a cada época. Un criterio de parada temprana detiene la ejecución cuando dos épocas consecutivas no mejoran estrictamente el mejor recuento de éxitos (los empates cuentan como no mejora), sin límite fijo de épocas. Las épocas verificadas fueron 3 (5 trayectorias), 3 (10), 0 (15, en cola), 3 (25) y 6 (50). Los checkpoints se almacenan en rutas `n1.6/trajectories-NNN/epoch-EEE/` e incluyen estadísticas de normalización de Spatial, mapeos de embodiment, manifiestos de entrenamiento, evaluaciones y verificación de carga offline independiente. No se documenta uso de RLHF, DPO ni número total de tokens de entrenamiento.

## Capacidades

- Ejecución de políticas de manipulación robótica en el entorno de simulación LIBERO Spatial (tarea 0), a partir de observaciones visuales.
- Aprendizaje a partir de conjuntos reducidos de trayectorias de demostración: el eje del experimento es precisamente la eficiencia de datos, no la capacidad general del modelo.
- Carga offline verificada: los checkpoints incluyen verificación independiente de carga y todo el código de ejecución necesario.
- Trazabilidad de entrenamiento: manifiestos, configuraciones y evaluaciones por época quedan registrados en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, visión general, audio ni generación de texto.
- No se documenta ninguna capacidad fuera del ámbito de LIBERO Spatial.

## Casos de uso

- Estudio de eficiencia de datos en robótica: sirve como evidencia empírica de que 5, 10 y 25 trayectorias no bastan para esta tarea, y de que 50 trayectorias producen una señal inicial (7/20), lo que permite dimensionar futuros presupuestos de anotación.
- Reproducción de experimentos: al usar semilla fija, subconjuntos anidados y bases NVIDIA fijadas, los checkpoints permiten replicar exactamente las condiciones de cada ejecución.
- Línea base negativa para comparativas: el resultado 0/20 en cuatro configuraciones es un punto de referencia útil para medir si otro método, arquitectura o estrategia de muestreo mejora el aprendizaje con pocos datos.
- Auditoría de artefactos de entrenamiento: el repositorio incluye recibos de verificación, hashes de artefactos y un fichero de limpieza de historial (`history_cleanup.json`) que permite rastrear revisiones y comprobar la integridad de los checkpoints.
- Punto de partida para ajuste posterior: los checkpoints de `trajectories-050` (6 épocas, 7/20) pueden emplearse como inicialización en experimentos de continuación o de curriculum con más datos.
- Docencia y divulgación sobre VLA en simulación: el conjunto ilustra de forma compacta el ciclo completo de entrenamiento, evaluación por rollouts y parada temprana en un benchmark de manipulación.
- No se recomienda su uso en robótica real: no hay evidencia de transferencia a hardware físico ni de robustez fuera de LIBERO Spatial.

## Benchmarks y rendimiento

Datos publicados en la model card. La métrica es el mejor número de éxitos en 20 rollouts de la tarea 0 de LIBERO Spatial por ejecución.

| Trayectorias | Estado | Épocas verificadas | Mejor resultado (tarea 0, sobre 20) |
|---:|---|---:|---:|
| 5 | Completada | 3 | 0 |
| 10 | Completada | 3 | 0 |
| 15 | En cola | 0 | — |
| 25 | Completada | 3 | 0 |
| 50 | Completada | 6 | 7 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con otros modelos sobre LIBERO Spatial. No se dispone de intervalos de confianza ni de repeticiones con semillas distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 3B de parámetros del modelo base, un checkpoint en bf16 ocuparía del orden de 6-7 GB solo en pesos; con activaciones y componentes auxiliares (codificador visual, procesadores), un cálculo realista se sitúa en 10-16 GB. En fp32, los pesos solos rondarían los 12 GB. Son estimaciones derivadas del tamaño declarado, no cifras publicadas por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con 16-24 GB o más es candidata (RTX 4090, L40S, A100, H100); la generación de rollouts en LIBERO puede requerir además recursos de simulación.
- Cabe en GPU de consumo: probablemente sí en tarjetas de 16 GB o más si la inferencia se limita a un único checkpoint y batch pequeño, pero no está verificado en el repositorio.
- Opciones de despliegue: los checkpoints incluyen código de ejecución propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y estos motores están orientados a modelos de lenguaje, no a políticas con salida de acciones.
- Almacenamiento: el repositorio completo ocupa 214,3 GB, ya que conserva las cinco variantes con sus épocas. El uso práctico exige descargar únicamente la carpeta de la trayectoria y época deseadas.
- Latencia y throughput: no disponibles. No se documenta frecuencia de control ni tiempo de inferencia por paso.

## Comparativa con modelos similares

La información disponible no incluye resultados de otros modelos sobre LIBERO Spatial, por lo que la comparación cuantitativa no puede establecerse.

| Modelo | Parámetros | Contexto | LIBERO Spatial (tarea 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency` | 3B (según base) | No disponible | 7/20 con 50 trayectorias; 0/20 con 5, 10 y 25 | No declarada | HuggingFace, 214,3 GB |
| `nvidia/GR00T-N1.6-3B` (base) | 3B | No disponible | No disponible en esta información | Debe consultarse en el repositorio de NVIDIA | HuggingFace |
| Otros ajustes sobre LIBERO Spatial | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo: 0 aciertos sobre 20 en cuatro de las cinco configuraciones; solo la de 50 trayectorias alcanza 7 sobre 20. No es un modelo utilizable como política fiable.
- Evaluación restringida: únicamente la tarea 0 de LIBERO Spatial, con 20 rollouts por época. La varianza de una muestra de ese tamaño es alta y no se publican desviaciones ni intervalos de confianza.
- Una sola semilla (42): no hay evidencia de estabilidad de los resultados entre semillas.
- Una ejecución quedó sin completar (15 trayectorias, en cola, 0 épocas verificadas), por lo que la curva de eficiencia de datos está incompleta.
- Licencia no declarada: no puede asumirse uso comercial. Además, la licencia del modelo base NVIDIA debe verificarse de forma independiente y puede imponer restricciones adicionales.
- Sin estado del optimizador en los checkpoints, por lo que la reanudación exacta del entrenamiento no es posible tal cual.
- Historial del repositorio reescrito: los artefactos previos al experimento y su historial se eliminaron a petición del propietario. La trazabilidad se apoya en `history_cleanup.json` y en los recibos de verificación.
- Ámbito limitado a simulación: no hay evidencia de transferencia a robots físicos ni de generalización a otras tareas, entornos o morfologías.
- Sesgos y alucinación: no se documentan sesgos específicos, pero al tratarse de una política entrenada con conjuntos muy pequeños de trayectorias, se espera un ajuste estrecho a las condiciones de demostración.
- Idiomas: no se declara cobertura lingüística; no debe asumirse soporte multilingüe en instrucciones.
- Riesgo de confusión con el modelo base: este repositorio contiene ajustes experimentales, no la versión oficial de NVIDIA GR00T N1.6.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Checkpoints, 5 trayectorias: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/tree/main/n1.6/trajectories-005
- Checkpoints, 10 trayectorias: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/tree/main/n1.6/trajectories-010
- Checkpoints, 15 trayectorias: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/tree/main/n1.6/trajectories-015
- Checkpoints, 25 trayectorias: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/tree/main/n1.6/trajectories-025
- Checkpoints, 50 trayectorias: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/tree/main/n1.6/trajectories-050
- Mapa de limpieza de historial: https://huggingface.co/kaweees/gr00tn1.6-libero-spatial-trajectory-efficiency/blob/main/history_cleanup.json
- Búsqueda web: no se encontraron resultados relevantes sobre el modelo; los enlaces devueltos por el buscador correspondían a páginas de inicio de sesión de Gmail y no guardan relación con el repositorio.
