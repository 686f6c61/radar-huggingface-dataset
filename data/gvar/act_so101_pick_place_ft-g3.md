# GVAR/act_so101_pick_place_ft-g3

## Resumen

GVAR/act_so101_pick_place_ft-g3 es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705 y implementado en la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación: coger un cubo y colocarlo dentro de una caja, sobre un brazo robótico de tipo `so_follower` (SO-101) equipado con dos cámaras (frontal y de muñeca). No es un modelo de lenguaje: es una política visuomotora que mapea observaciones (estado articular de 6 dimensiones y dos imágenes de 480x640) a comandos de acción de 6 dimensiones.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo completo de aprendizaje por imitación en robótica de bajo coste con LeRobot 0.6.1: 260 episodios teleoperados, 60.315 fotogramas a 30 FPS y 61.000 pasos de entrenamiento. Por otro, sirve como referencia para evaluar cómo se documenta (y cómo no se documenta) una política robótica: el autor no ha publicado resultados de evaluación en robot real ni vídeos de demostración, lo que limita seriamente su reproducibilidad.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB en formato safetensors. Está publicado bajo licencia Apache 2.0, con cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un artefacto de investigación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual ResNet y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea está definida por la instrucción "Pick up the cube and place it in the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suele elevar la tasa de éxito en tareas de manipulación. La arquitectura combina un backbone visual (encoder convolucional sobre las dos cámaras, `front` y `wrist`, a resolución 480x640) con un transformer que fusiona las características visuales y el estado articular de 6 dimensiones, y un decodificador que emite vectores de acción de 6 dimensiones. El modelo consume `observation.state` con forma (6,), `observation.images.wrist` y `observation.images.front` con forma (3, 480, 640), y produce `action` con forma (6,).

El entrenamiento se realizó sobre el dataset GVAR/so101_pick_cube10, compuesto por 260 episodios teleoperados, 60.315 fotogramas a 30 FPS, para la tarea única "Pick up the cube and place it in the box". La configuración reportada es de 61.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.6.1. No se documenta el número total de tokens (no aplica en el sentido de NLP), la composición del dataset más allá de los episodios, ni si hubo RLHF, DPO o cualquier etapa de refinamiento posterior: ACT es puramente aprendizaje supervisado por imitación a partir de demostraciones. Tampoco se reportan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Manipulación robótica de una tarea concreta: coger un cubo y depositarlo en una caja, con una política visuomotora entrenada de extremo a extremo.
- Fusión multimodal de dos cámaras (frontal y de muñeca) con el estado articular del brazo SO-101.
- Predicción de chunks de acción, que aporta suavidad temporal y reduce el drift acumulado frente a políticas paso a paso.
- Control de un robot de tipo `so_follower` con 6 grados de libertad de acción y 6 de estado.
- Ejecución mediante CLI de LeRobot (`lerobot-rollout`) con parametrización de puerto, cámaras, tarea y duración.
- Reentrenamiento y ajuste fino mediante `lerobot-train` sobre datasets propios en formato LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking: es una política específica de robótica, no un modelo de propósito general.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de coger el cubo y colocarlo en la caja sobre un SO-101, útil como banco de pruebas para comparar variantes de ACT y configuraciones de cámara.
- Docencia y formación en aprendizaje por imitación: el flujo completo (grabación teleoperada, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) permite a estudiantes reproducir un pipeline de robótica de bajo coste con hardware asequible.
- Generación de datos sintéticos y aumento de dataset: ejecutando la política con `--strategy.type=base` y duración acotada se pueden grabar rollouts adicionales para ampliar el dataset original de 260 episodios.
- Baseline para investigación en manipulación: al ser una política ACT estándar sobre SO-101, sirve como referencia para medir mejoras de nuevas arquitecturas (difusión, flow matching, VLA) en la misma tarea.
- Pruebas de robustez ante variaciones de iluminación y posicionamiento: el modelo permite evaluar cómo degrada una política entrenada con 60.315 fotogramas cuando cambian las condiciones, aunque el autor no reporta esas métricas.
- Integración en pipelines de evaluación automatizada: la CLI de LeRobot permite lanzar rollouts con duración fija y registrar episodios, lo que facilita construir harnesses de evaluación repetibles en CI para políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tabla de tareas, número de ensayos, tasa de éxito ni comparación con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Por el tamaño (51,7 millones de parámetros) y las dos entradas visuales a 480x640, es razonable esperar un consumo moderado, pero no se aporta una cifra verificada.
- GPU recomendadas: no disponible. LeRobot documenta `--policy.device=cuda` para entrenamiento, sin lista de GPU validadas para esta política.
- ¿Cabe en GPU de consumo? No confirmado por el autor. El tamaño de parámetros sugiere que sí en GPUs de consumo modernas, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. La política opera a 30 FPS en el dataset de entrenamiento, pero no se reportan latencias de inferencia en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GVAR/act_so101_pick_place_ft-g3 | 51.668.614 | 2 imagenes 480x640 + estado (6,) | Pick and place sobre SO-101 | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Manipulación genérica | variable | no disponible |
| Políticas de difusión (Diffusion Policy) en LeRobot | no disponible | no disponible | Manipulación genérica | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de políticas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación cualitativa se limita al método: ACT frente a alternativas como Diffusion Policy, ambas implementadas en LeRobot, sin cifras de éxito publicadas para esta política concreta.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni vídeo de demostración, lo que impide validar el rendimiento real del modelo.
- Especificidad extrema de la tarea: entrenada solo para "Pick up the cube and place it in the box" sobre un SO-101 concreto; no generaliza a otras tareas, objetos o robots.
- Dependencia de la configuración física: los nombres de cámara (`front`, `wrist`) y el estado de 6 dimensiones deben coincidir exactamente con los usados en entrenamiento; cualquier cambio de montaje o calibración degrada la política.
- Riesgo de sobreajuste al dataset: 260 episodios y 60.315 fotogramas son un volumen modesto; no se reporta validación en condiciones nuevas (posiciones, iluminación, distractores).
- Sin datos sobre sesgos: al ser una política robótica, los sesgos relevantes son de distribución (posiciones de objeto, iluminación, fondo) y no se documentan.
- Riesgo de alucinación en el sentido de acciones incorrectas: no se reporta análisis de modos de fallo ni de seguridad física durante la ejecución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte, y la falta de evaluación hace arriesgado desplegarla en producción sin validación propia.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay issues, forks ni reportes de terceros que respalden su funcionamiento.
- Fecha de creación futura en los metadatos (2026-11-21): inconsistencia temporal que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GVAR/act_so101_pick_place_ft-g3
- Dataset de entrenamiento: https://huggingface.co/datasets/GVAR/so101_pick_cube10
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=GVAR/so101_pick_cube10
