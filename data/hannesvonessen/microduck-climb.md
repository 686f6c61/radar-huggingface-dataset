# HannesVonEssen/microduck-climb

## Resumen

Microduck-climb es una política de control por refuerzo (reinforcement learning) publicada por HannesVonEssen para el robot cuadrúpedo Microduck, con el objetivo concreto de que el robot suba una escalera modular de escritorio y se recupere cuando cae. No es un modelo de lenguaje ni un modelo generativo multimodal: es un actor PPO exportado a ONNX que consume una observación propiacepción de 61 dimensiones y produce acciones de control articular. Se distribuye en dos políticas independientes, `climber.onnx` (escalada) y `getup.onnx` (incorporación tras caída), junto con los checkpoints PPO originales en PyTorch (`climber.pt`, `getup.pt`) y un manifiesto de hashes en `models.json`.

La relevancia del repositorio es doble. Por un lado, forma parte del ecosistema de políticas `microduck_rl_policy_collection`, lo que permite reproducir y comparar habilidades de locomoción sobre la misma plataforma hardware. Por otro, el autor publica el entorno completo, el lock de dependencias, los bancos de entrenamiento y validación, la geometría de simulación y las trayectorias grabadas en un repositorio de GitHub aparte, además de los modelos imprimibles en 3D de la escalera. Esto convierte la ficha en un caso de estudio reproducible de simulación a robot (sim-to-real) con separación explícita entre software (Apache-2.0) y diseños hardware (CC-BY-NC-SA-4.0).

El dato crítico para cualquiera que quiera evaluarlo es que el autor no reclama validación en hardware real ("No hardware validation is claimed"). Todo el material describe un experimento de simulación MuJoCo con modelos imprimibles que son prototipos verificados geométricamente, pero no impresos ni ensayados en carga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de política PPO exportado a ONNX (dos actores normalizados: escalada e incorporación); no se detalla la topología de capas en la información disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); espacio de observación de 61 dimensiones con los 13 slots de comando a cero |
| Tipos de cuantización | no disponible (se distribuyen actores ONNX normalizados y checkpoints `.pt`) |
| Idiomas soportados | no aplica (política de control robótico) |
| Licencia | Apache-2.0 para el software; los diseños hardware en GitHub y los renders usan CC-BY-NC-SA-4.0 según `LICENSE-HARDWARE` |
| Formato de pesos | ONNX (`policy.onnx`, `models/climber.onnx`, `models/getup.onnx`) y PyTorch (`.pt`) para los checkpoints PPO |
| Autor | HannesVonEssen |
| Pipeline declarado | robotics |
| Librería | onnx |
| Tamaño del repositorio | 0,2 GB (incluye media, modelos y artefactos) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |
| Artefactos incluidos | `policy.onnx` (idéntico a `models/climber.onnx`), `models/climber.onnx`, `models/getup.onnx`, `climber.pt`, `getup.pt`, `models.json`, vídeo de 11,77 s y GIFs de previsualización |

## Arquitectura y entrenamiento

El material publicado corresponde a dos actores de política entrenados con PPO (Proximal Policy Optimization) y exportados a ONNX en formato normalizado, de modo que la inferencia no requiere PyTorch. La observación es un vector estándar de 61 dimensiones en el que los 13 slots de comando están fijados a cero, es decir, el comportamiento es autónomo y no responde a instrucciones de alto nivel durante la ejecución de la habilidad. El repositorio de GitHub del experimento incluye el código del entorno, el lock de dependencias, los scripts de continuación, los bancos de entrenamiento y validación, la geometría de simulación y las evaluaciones detalladas, lo que permite reproducir el entrenamiento con MuJoCo.

La innovación técnica relevante no está en la arquitectura de red sino en la ingeniería del experimento y en la gestión del cambio de habilidad. Los actores de escalada y de incorporación usan ganancias, filtros y estado de acción previa distintos, documentados en el contrato de ejecución (RUNTIME.md). El conmutador entre ambas políticas se implementó en simulación usando contacto pie-superficie y posición de la raíz, y el autor advierte explícitamente de que esto no es un detector embarcado. Como alternativa embarcada propone detección de caída basada en IMU, y señala que el runtime upstream de Microduck ya incorpora por defecto una secuencia de respuesta a caída que devuelve el control a la política de mantenerse de pie; ese mecanismo está desactivado durante las habilidades activas, por lo que el traspaso de control y sus umbrales aún requieren integración y pruebas específicas para escalada.

En el apartado hardware, la escalera modular usa uniones de rail por fricción sin pasadores, con espigas integradas que se deslizan en alojamientos de ambos raíles laterales y la columna central, puntas achaflanadas y nervios de fricción estrechos. Los nervios por defecto tienen 0,05 mm de interferencia nominal por cara, con cupones de ajuste de 0, 0,025, 0,05 y 0,10 mm para que cada usuario elija el ajuste a mano según su impresora. La base de suelo usa la misma disposición de acople y los 27 peldaños permanecen íntegros en sus posiciones evaluadas.

## Capacidades

- Control de locomoción para subir una escalera modular de escritorio mediante la política `climber.onnx`.
- Recuperación tras caída mediante la política independiente `getup.onnx`.
- Ejecución autónoma: los 13 slots de comando de la observación de 61 dimensiones van a cero, por lo que la habilidad no depende de comandos de alto nivel.
- Inferencia portable sin PyTorch gracias a la exportación ONNX normalizada de ambos actores.
- Reproducción completa del entrenamiento: entorno MuJoCo, lock de dependencias, scripts de continuación y bancos de entrenamiento y validación publicados.
- Evaluación reproducible: geometría de simulación, evaluaciones detalladas y trayectoria grabada disponibles en el repositorio de GitHub.
- Cambio de habilidad escalada-recuperación mediante contacto pie-superficie y posición de la raíz en simulación (no embarcado).
- Fabricación de la plataforma: modelos imprimibles 3D, generadores y variantes de escalera (`friction-fit/` y `friction-fit-3step/`) con orientaciones de empaquetado para un cubo de 256 mm.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con refuerzo: usar el entorno y los bancos de validación publicados para reproducir el experimento de escalada y variar hiperparámetros de PPO sin partir de cero, ya que el autor incluye el lock de dependencias y los scripts de continuación.
- Estudio de transferencia sim-to-real: el par de políticas `climber.onnx` y `getup.onnx` más la geometría de simulación permite diseñar protocolos de validación en robot real y medir la brecha respecto a la simulación, teniendo en cuenta que el autor no reclama validación hardware.
- Investigación sobre conmutación de habilidades: el repositorio documenta ganancias, filtros y estado de acción previa distintos para escalada y recuperación, lo que lo convierte en un banco de pruebas para diseñar conmutadores basados en IMU en lugar del detector por contacto usado en simulación.
- Plataforma docente de robótica e IA: la escalera imprimible con uniones de fricción y los cupones de ajuste de 0 a 0,10 mm permiten montar un banco físico de bajo coste para prácticas de control y aprendizaje por refuerzo.
- Desarrollo de políticas de recuperación de caídas: `getup.onnx` puede evaluarse de forma aislada como habilidad de incorporación, comparando su comportamiento con la secuencia de respuesta a caída que el runtime upstream de Microduck ya aplica durante la conducción ordinaria.
- Fabricación y validación de mecánica de precisión: los archivos de hardware y los generadores sirven para estudiar tolerancias de impresión FDM (interferencia nominal de 0,05 mm por cara) y el comportamiento de uniones de fricción sin pasador, con la advertencia de que la fuerza de retención y el desgaste no se han medido.
- Integración en pipelines de evaluación automatizada: al ser ONNX, ambos actores pueden cargarse en un runner headless sobre MuJoCo para ejecutar barridos de escenarios y registrar tasas de éxito sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona "evaluaciones detalladas" alojadas en el repositorio de GitHub del experimento, pero no se proporcionan cifras de tasa de éxito, recompensa media, número de episodios ni comparaciones cuantitativas con otras políticas en el material disponible. Tampoco hay métricas de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros de los actores ni su tamaño en disco de forma individual.
- Consumo de memoria del repositorio: 0,2 GB en total, incluyendo pesos, checkpoints, media y artefactos de hardware, por lo que el conjunto es manejable en cualquier equipo de desarrollo; esto no es una medida del peso aislado de las políticas.
- GPU recomendadas: no disponible. Al tratarse de actores exportados a ONNX y de tamaño no especificado, no hay una recomendación publicada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: ONNX Runtime para los actores `.onnx`; PyTorch para los checkpoints `.pt`; MuJoCo para el entorno de simulación. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Hardware físico asociado: escalera modular imprimible con raíles, columna central, 27 peldaños, base de suelo y abrazadera de mesa roscada con tornillo y almohadilla de presión; las piezas están diseñadas para un volumen de impresión de 256 mm y aún requieren comprobaciones de laminado (soportes y exclusiones de impresora).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos cuantitativos de otros modelos o políticas comparables (ni parámetros, ni contexto, ni rendimiento) que permitan una comparación rigurosa. El repositorio se enmarca en la colección `microduck_rl_policy_collection` (etiqueta declarada por el autor), lo que sugiere la existencia de otras políticas de la misma familia, pero no se aportan sus especificaciones ni métricas en este material.

## Limitaciones y advertencias

- No hay validación en hardware real: el propio autor indica explícitamente "No hardware validation is claimed". Todo el comportamiento demostrado procede de simulación.
- El conmutador entre escalada y recuperación no está implementado de forma embarcada: en simulación se basa en contacto pie-superficie y posición de la raíz, no en un detector a bordo.
- El reflejo de respuesta a caída del runtime upstream está desactivado durante las habilidades activas, por lo que el traspaso de control y sus umbrales todavía requieren integración y pruebas.
- La política es autónoma y ciega a comandos: los 13 slots de comando de la observación van a cero, de modo que no se puede dirigir la habilidad mediante instrucciones de alto nivel en su estado actual.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje). El riesgo equivalente es la degradación del control fuera de la distribución de estados entrenada, que puede provocar caídas o comportamientos no deseados.
- Sesgos: no aplica en el sentido de sesgos lingüísticos o sociales; el análogo es el sobreajuste al escenario simulado concreto (geometría, masas, fricción y contactos del banco de entrenamiento).
- El software es Apache-2.0, pero los diseños hardware de GitHub y los renders tienen términos separados CC-BY-NC-SA-4.0 en `LICENSE-HARDWARE`, lo que restringe el uso comercial del hardware derivado.
- Las piezas impresas son prototipos: uniones de módulo no ensayadas y tolerancias de impresión sin verificar. La fricción no es un bloqueo positivo y no se han medido la fuerza de retención ni el desgaste.
- Los modelos de escalera están verificados geométricamente, pero no impresos ni ensayados en carga; las comprobaciones distinguen interferencias de nervios intencionadas de colisiones no deseadas.
- Los archivos de segmentación aún necesitan comprobaciones de laminado (soportes y exclusiones de impresora) antes de imprimir.
- Advertencia para producción: si se integra en un robot real, es imprescindible definir un detector de caída propio, validar el traspaso entre políticas y acotar los umbrales de conmutación antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-climb
- Repositorio del experimento (entorno, scripts, bancos de entrenamiento y validación): https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb
- Documentación de entrenamiento y reproducción: https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb/TRAINING.md
- Contrato de ejecución (ganancias, filtros y estado de acción previa): https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb/RUNTIME.md
- Modelos de escalera y renders Cycles en el directorio de hardware: https://github.com/Vottivott/microduck-playground/tree/main/hardware/ladder
- Runtime upstream de Microduck (diseño de robotd, respuesta a caída): https://github.com/pollen-robotics/microduck/blob/e9cca6272f633dd9054dd0e021f356fe086e5be1/docs/design/robotd-design.md#241-falling-is-a-third-event
- Visor de arquitectura del modelo: https://hfviewer.com/HannesVonEssen/microduck-climb
- Vídeo de la trayectoria seleccionada (11,77 s): https://huggingface.co/HannesVonEssen/microduck-climb/tree/main/media/preview.mp4

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido de un sitio para adultos) y se han descartado por no aportar ninguna información técnica verificable. No se han encontrado papers, blogs ni demos adicionales sobre este modelo en la información proporcionada.
