# CursedRock17/SO101_VORTEX_Policy_MovingDeck

## Resumen

SO101_VORTEX_Policy_MovingDeck es una política de control robótico entrenada mediante aprendizaje por refuerzo (RSL-RL PPO) para la tarea `Vortex-SO101-Vial-Curriculum-v0` del proyecto VORTEX. El modelo resuelve la manipulación de un vial sobre la cubierta de un barco en movimiento, simulada con Isaac Lab 3.0 y el motor físico Newton (MJWarp). Lo desarrolla CursedRock17 y se publica como artefacto TorchScript y ONNX, no como un modelo de lenguaje: no procesa texto ni imágenes, sino el grupo de observaciones `policy` de la tarea y emite acciones de control.

Se trata de un fine-tune de la fase S3 ("moving-deck") que parte del profesor S1 con cubierta estática (`s1_still_seed42`, checkpoint `model_799`) y se entrena hasta la iteración 1300 con un currículo de amplitud de movimiento (de 0,25 a 1,0) sobre un conjunto de cuatro estados de mar, manteniendo un 25 % de cubiertas estáticas. La relevancia radica en su rendimiento medido bajo perturbaciones: la tasa de éxito se mantiene por encima de 0,94 con amplitud 1,0 en tres de los cuatro estados de mar, lo que documenta explícitamente la degradación en condiciones severas.

El repositorio es de tamaño 0,0 GB según los metadatos (los pesos TorchScript y ONNX se distribuyen como ficheros del propio repo), con 0 descargas y 0 likes en el momento de la consulta. No hay información sobre licencia ni idiomas, y la model card no documenta arquitectura de red, número de parámetros ni composición del dataset de entrenamiento más allá de los ficheros de movimiento del barco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL; red neuronal no especificada en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; consume el grupo de observaciones `policy` de la tarea) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | No disponible |
| Formato de pesos | TorchScript (`policy.pt`) y ONNX (`policy.onnx` + `policy.onnx.data`) |
| Algoritmo de entrenamiento | RSL-RL PPO, iteración 1299 |
| Tarea | `Vortex-SO101-Vial-Curriculum-v0` |
| Entorno de simulación | Isaac Lab 3.0 con motor físico Newton (MJWarp, `njmax` = 1200) |
| Estados de mar de entrenamiento | 4 (`example_sea_state_4`, `example_stewart_platform_sea_state_3`, `example_destroyer_sea_state_5`, `example_carrier_sea_state_7`) |
| Currículo de amplitud | 0,25 a 1,0, con 25 % de cubiertas estáticas |
| Commit de VORTEX | `f9f6285e6bb8` (con cambios locales) |
| Fecha de guardado | 2026-11-24T15:37:17+00:00 |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (capas, dimensiones, tipo de encoder de observaciones). Lo que sí se documenta es el procedimiento de entrenamiento: PPO implementado en RSL-RL, ejecutado sobre la tarea `Vortex-SO101-Vial-Curriculum-v0` en Isaac Lab 3.0 con el motor Newton. El entrenamiento se reanuda desde el profesor S1 de cubierta estática (`s1_still_seed42`, checkpoint `model_799`) y continúa hasta la iteración 1300, aplicando un currículo de amplitud de movimiento que escala de 0,25 a 1,0 sobre una mezcla de cuatro estados de mar, con un 25 % de episodios en cubierta estática para evitar el olvido de la condición base.

Detalles técnicos destacables de la configuración: se elevó `njmax` de MJWarp a 1200 y se situó una losa de suelo en z = -3 m. La evaluación se realiza sobre `Vortex-SO101-Vial-v0` partiendo de la pose home. El repositorio incluye los ficheros de configuración del entorno y del agente (`params/`) y los CSV de movimiento del barco (`motion/`), lo que permite reproducir las condiciones de entrenamiento. No se especifican el número total de pasos, el tamaño del dataset de demostraciones (no parece haber imitación) ni detalles de recompensa.

## Capacidades

- Control robótico de manipulación de un vial sobre una cubierta de barco en movimiento, con observaciones del grupo `policy` de la tarea y salida de acciones.
- Robustez ante perturbaciones de movimiento: entrenada con currículo de amplitud hasta 1,0 sobre cuatro estados de mar distintos.
- Retención de la habilidad en condiciones estáticas (25 % de cubiertas sin movimiento durante el entrenamiento).
- Exportación a TorchScript para inferencia en PyTorch y a ONNX para despliegue fuera de PyTorch.
- Ejecución dentro del Dev Container de VORTEX mediante `scripts/newton/policy.py play`.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es una política de RL específica de tarea.

## Casos de uso

- Manipulación autónoma en cubierta marítima: la política ejecuta la tarea de vial sobre una cubierta que oscila según estados de mar reales (destructor, portaaviones, plataforma Stewart), adecuada para prototipos de robots de cubierta en simulación.
- Validación de controladores antes de despliegue físico: sirve como referencia de rendimiento (tasas de éxito con intervalos de confianza) frente a la que comparar políticas propias en el mismo entorno Isaac Lab/Newton.
- Docencia e investigación en RL robótico: el repo incluye `params/` y `motion/`, lo que permite reproducir el currículo y estudiar el efecto de la amplitud de movimiento en la robustez.
- Despliegue en inferencia no-PyTorch: la exportación ONNX permite integrar la política en runtimes C++/Python sin dependencia de PyTorch, por ejemplo en un bucle de control a bordo simulado.
- Evaluación de robustez ante condiciones severas: con amplitud 1,0 en `example_destroyer_sea_state_5` la tasa cae a 0,765, lo que la convierte en un caso de estudio útil para analizar límites del currículo.
- Baseline para fine-tuning: al partir de un profesor S1 estático, puede reutilizarse como inicialización para nuevas tareas de manipulación sobre cubierta en el ecosistema VORTEX.

## Benchmarks y rendimiento

Resultados publicados en la model card (tasa de éxito, n = 1024, intervalo de confianza entre paréntesis):

| Condición | Tasa de éxito | IC |
|---|---|---|
| Sin movimiento (x1) | 1,000 | 0,996–1,000 |
| `example_carrier_sea_state_7` x0,25 | 0,995 | 0,989–0,998 |
| `example_carrier_sea_state_7` x0,5 | 0,992 | 0,985–0,996 |
| `example_carrier_sea_state_7` x1 | 0,965 | 0,952–0,974 |
| `example_destroyer_sea_state_5` x0,25 | 0,997 | 0,991–0,999 |
| `example_destroyer_sea_state_5` x0,5 | 0,982 | 0,972–0,989 |
| `example_destroyer_sea_state_5` x1 | 0,765 | 0,738–0,790 |
| `example_sea_state_4` x0,25 | 0,998 | 0,993–0,999 |
| `example_sea_state_4` x0,5 | 0,995 | 0,989–0,998 |
| `example_sea_state_4` x1 | 0,940 | 0,924–0,953 |
| `example_stewart_platform_sea_state_3` x0,25 | 0,995 | 0,989–0,998 |
| `example_stewart_platform_sea_state_3` x0,5 | 0,992 | 0,985–0,996 |
| `example_stewart_platform_sea_state_3` x1 | 0,990 | 0,982–0,995 |

El informe de evaluación completo se referencia como `outputs/eval/Vortex-SO101-Vial-v0/s3_curriculum_home`, pero no se incluye en la información disponible. No hay benchmarks comparativos con otras políticas publicados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (la model card no indica número de parámetros ni tamaño de la red; el repo figura como 0,0 GB en metadatos).
- GPU recomendadas: no disponible. La inferencia TorchScript/ONNX de una política de control suele ser ligera, pero no hay datos publicados que permitan concretar.
- ¿Cabe en GPU de consumo? No disponible por falta de especificaciones de la red.
- Opciones de despliegue: TorchScript (`torch.jit.load("policy.pt").eval()`) y ONNX (con `policy.onnx` y `policy.onnx.data`); ejecución integrada en el Dev Container de VORTEX con `scripts/newton/policy.py play`.
- Latencia y throughput: no disponibles.
- Requisitos de simulación (no de inferencia): Isaac Lab 3.0, motor Newton/MJWarp con `njmax` = 1200, commit de VORTEX `f9f6285e6bb8` con cambios locales.

## Comparativa con modelos similares

No disponible. La model card no referencia otras políticas comparables ni benchmarks frente a alternativas de la misma tarea o del ecosistema VORTEX.

## Limitaciones y advertencias

- Degradación notable en condiciones severas: con `example_destroyer_sea_state_5` a amplitud 1,0 la tasa de éxito cae a 0,765, frente a 0,997 a amplitud 0,25.
- Entrenada sobre un conjunto acotado de cuatro estados de mar; el comportamiento fuera de esas condiciones (otros CSV de movimiento) no está evaluado.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución; es necesario contactar con el autor.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de las condiciones evaluadas (pose home).
- Es una política específica de tarea: no generaliza a otras tareas de manipulación sin reentrenamiento.
- Dependencia del stack VORTEX/Isaac Lab/Newton y de un commit concreto (`f9f6285e6bb8` con cambios locales); la reproducibilidad exacta puede verse afectada por esos cambios locales no versionados.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes).
- El estado del arte en la fecha de creación del repo (2026-11-24) no se puede contrastar con la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CursedRock17/SO101_VORTEX_Policy_MovingDeck
- Repositorio VORTEX: https://github.com/CursedRock17/VORTEX
