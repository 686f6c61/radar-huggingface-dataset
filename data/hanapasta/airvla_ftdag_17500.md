# hanapasta/airvla_ftdag_17500

## Resumen

AirVLA FT-DAG (checkpoint 17.500) es un ajuste fino de tipo vision-language-action (VLA) construido sobre el modelo base `lerobot/pi0`, publicado por el usuario hanapasta en el marco de su tesis de máster (MSc). El trabajo consiste en adaptar una política pi0 preentrenada a una plataforma aérea: un cuadricóptero con un brazo de 2 grados de libertad y pinza paralela, evaluado íntegramente en simulación con MuJoCo 3.3.4. El modelo tiene 4.028.019.472 parámetros (unos 4,03 mil millones) y se distribuye en formato safetensors, con un repositorio de 8,9 GB.

La técnica concreta de este checkpoint es un ajuste fino correctivo de estilo DAgger sobre política: se registran episodios de corrección a partir de estados que la propia política alcanza, de modo que el modelo aprende a recuperarse de sus propios errores en lugar de copiar únicamente trayectorias expertas. El autor reporta que esta variante mejora la precisión terminal hasta el mejor valor de precisión de política pura de toda la campaña (82,0 mm de mediana target-true), pero no desbloquea el agarre y degrada de forma significativa la selección de objetivo respecto al checkpoint previo FT-C.

Su relevancia es doble: por un lado, documenta un caso realista de despliegue de VLA en robótica aérea con manipulación; por otro, publica un protocolo de evaluación congelado y un cuaderno experimental completo, lo que lo convierte en un material útil para estudiar los compromisos entre precisión terminal y selección de objetivo en políticas entrenadas con correcciones on-policy. Es un modelo de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/pi0`; la model card no detalla la arquitectura interna (transformer, mezcla de expertos, etc.) |
| Parámetros totales | 4.028.019.472 |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publica ninguna receta de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (repositorio de 8,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0`, una política vision-language-action preentrenada, y se inicializa desde el checkpoint FT-C de la misma campaña. La model card no especifica la arquitectura interna de la red (tipo de bloque, mecanismo de atención, tamaño del encoder visual ni longitud de contexto), por lo que cualquier detalle a ese nivel debe considerarse no disponible. Los parámetros totales declarados en el repositorio son 4.028.019.472, y el tamaño del repo (8,9 GB) es compatible con pesos en precisión reducida (bf16/fp16), aunque el autor no lo confirma explícitamente.

El entrenamiento es un ajuste fino correctivo de estilo DAgger sobre política: se partió del checkpoint FT-C, se ejecutó la política en simulación y se registraron 160 episodios de corrección a partir de estados alcanzados por la propia política, que se añadieron a la lista FT-C del dataset `hanapasta/airvla_v24`. El proceso duró 20.000 pasos con tasa de aprendizaje lineal de 5e-6 a 5e-7, y el checkpoint publicado (17.500) se seleccionó por tener el menor MSE de validación con ruido fijado (pinned-noise) dentro de la escalera de checkpoints guardados. La evaluación se realizó con el arnés congelado `eval_v2.py` y MuJoCo 3.3.4; el autor advierte que cambiar de versión del simulador altera el comportamiento de contacto lo suficiente como para invalidar la comparación con los resultados archivados.

## Capacidades

- Generación de acciones de control para un cuadricóptero con brazo de 2 grados de libertad y pinza paralela, a partir de observaciones visuales en simulación.
- Ejecución de tareas de pick (agarre y recogida) en el protocolo de evaluación congelado: 1/60 episodios con agarre exitoso.
- Selección de objetivo sobre escena: 37/60 episodios con objetivo correcto en el mismo protocolo.
- Navegación: 12/20 episodios exitosos en la tarea de navegación del protocolo congelado.
- Precisión terminal de aproximación: 196,0 mm de mediana global y 82,0 mm de mediana target-true, el mejor valor de precisión de política pura de la campaña según el autor.
- Capacidad de recuperación ante estados fuera de distribución, por el uso de correcciones on-policy de estilo DAgger.
- Tool calling / function calling: no documentado.
- Comportamiento agéntico o razonamiento multi-paso explícito: no documentado.
- Capacidades multilingües: no documentadas (la model card no declara idiomas).
- Modo de razonamiento (thinking), audio u otras modalidades distintas de la visual motora: no documentados.

## Casos de uso

- Investigación en VLA para robótica aérea: reproducir la campaña AirVLA con MuJoCo 3.3.4 y el arnés `eval_v2.py` para comparar variantes de ajuste fino (FT-C frente a FT-DAG) bajo un protocolo congelado.
- Estudio de DAgger on-policy en robótica: el checkpoint sirve como ejemplo documentado de correcciones grabadas desde estados alcanzados por la propia política, útil para analizar cuándo mejora la precisión terminal y cuándo degrada la selección de tarea.
- Referencia base para ablaciones: al publicarse con un cuaderno experimental completo y un comando de evaluación reproducible, es un punto de partida para medir el efecto de nuevas rondas de corrección o de mezclas de datos.
- Docencia en máster o cursos de robótica: permite ilustrar con números concretos (1/60 agarres, 37/60 objetivos correctos, McNemar p = .013) los compromisos entre métricas de política en un pipeline VLA real.
- Ingeniería de plataformas simuladas: adaptación del mismo esquema a otros morfologías (brazos, drones con distinto número de grados de libertad) reentrenando desde `lerobot/pi0` con el mismo pipeline.
- Análisis de sensibilidad al simulador: el modelo es un caso práctico para estudiar cómo el comportamiento de contacto de MuJoCo afecta a la validez de comparaciones entre checkpoints.
- Evaluación comparativa de checkpoints dentro de una misma campaña: usar la escalera de checkpoints y el criterio de selección por MSE de validación con ruido fijado para elegir puntos de operación según se priorice agarre o selección de objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable en una política VLA orientada a control motor. Los únicos datos disponibles son los resultados del protocolo congelado propio (n = 60 pick + 20 navegación, escenas emparejadas):

| Métrica | Resultado |
|---|---|
| Agarre exitoso (pick) | 1/60 |
| Objetivo correcto (pick) | 37/60 |
| Precisión terminal, mediana global | 196,0 mm |
| Precisión terminal, mediana target-true | 82,0 mm (mejor precisión de política pura de la campaña) |
| Navegación | 12/20 |
| Comparación con FT-C | Regresión significativa en selección de objetivo (McNemar exacto, p = .013) |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, el repositorio ocupa 8,9 GB, por lo que se necesitan aproximadamente 9-12 GB de VRAM contando activaciones y buffers. En fp32 los pesos solos rondarían los 16 GB y el total podría situarse en 18-20 GB. Son estimaciones propias basadas en el recuento de parámetros y el tamaño del repo; el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una GPU de 16 GB o más (por ejemplo RTX 4090, A100 40 GB, H100) sería el rango razonable, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12-16 GB o más en bf16/fp16; no confirmado por el autor.
- Opciones de despliegue: el modelo está pensado para el ecosistema LeRobot/PyTorch y la evaluación se realiza con MuJoCo 3.3.4 y el script `eval_v2.py`. Servidores de texto como vLLM, TGI, Ollama o llama.cpp no son aplicables a una política VLA con salida de acciones continuas.
- Latencia y throughput: no disponibles. No se publica frecuencia de control, tiempo de inferencia por paso ni tamaño de los chunks de acción.
- Cuantización: no se publica ninguna receta; no hay pesos GGUF ni versiones int8/int4 oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirVLA FT-DAG (este modelo) | 4.028.019.472 | No disponible | 1/60 agarres; 37/60 objetivo correcto; 82,0 mm target-true; 12/20 navegación | MIT | HuggingFace |
| FT-C (predecesor en la misma campaña) | No disponible | No disponible | Mejor selección de objetivo que FT-DAG (regresión significativa, p = .013); precisión terminal inferior | No disponible | No disponible en la información proporcionada |
| `lerobot/pi0` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Referenciado como base del ajuste fino |
| Otros VLA de la misma categoría (OpenVLA, pi0-FAST, RDT-1B, etc.) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos comparativos verificables más allá de la comparación interna de la campaña entre FT-C y FT-DAG.

## Limitaciones y advertencias

- Tasa de agarre muy baja: 1/60 episodios exitosos en el protocolo congelado. El propio autor indica que el ajuste DAgger "no desbloquea el agarre".
- Degradación en selección de objetivo: la regresión frente a FT-C es estadísticamente significativa (McNemar exacto, p = .013), por lo que este checkpoint no es una mejora uniforme sobre su predecesor.
- Precisión terminal absoluta todavía alta en términos globales: 196,0 mm de mediana global, frente a los 82,0 mm de la mediana target-true.
- Tamaño de muestra reducido: n = 60 en pick y n = 20 en navegación, lo que limita la potencia estadística de las conclusiones.
- Dependencia estricta del simulador: los resultados solo son válidos con MuJoCo 3.3.4; otra versión altera el comportamiento de contacto e invalida la comparación.
- Dominio restringido: cuadricóptero con brazo de 2 DoF y pinza paralela en simulación. No hay evidencia de transferencia a hardware real ni a otras morfologías.
- Sin información sobre sesgos: no se documentan sesgos del conjunto de datos ni de las políticas aprendidas.
- Riesgo de alucinación: no aplica en el sentido textual; el riesgo equivalente es generar acciones no válidas o inestables en estados fuera de distribución.
- Idiomas y contexto: no se declara ningún idioma ni longitud de contexto, por lo que no puede evaluarse su comportamiento multilingüe ni el uso de instrucciones largas.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de `lerobot/pi0` conviene verificar las condiciones del modelo base antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y una única evaluación publicada por el propio autor; no hay validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanapasta/airvla_ftdag_17500
- Repositorio de código, guía de reproducción y cuaderno experimental: https://github.com/robotics-hana/drone-version2
- Modelo base referenciado: `lerobot/pi0`
- Dataset de entrenamiento referenciado: `hanapasta/airvla_v24`
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas genéricas de citas diarias), por lo que no se añaden enlaces adicionales.
