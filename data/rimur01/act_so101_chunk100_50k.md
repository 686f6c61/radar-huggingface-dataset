# rimur01/act_so101_chunk100_50k

## Resumen

`rimur01/act_so101_chunk100_50k` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, una formulación que reduce el error de acumulación típico de las políticas paso a paso y que, según el paper original, alcanza tasas de éxito elevadas en tareas de manipulación aprendidas de datos de teleoperación. Lo desarrolla el usuario `rimur01` como parte de una asignación práctica sobre el robot SO-101 (tipo `so_follower`).

El modelo no es un modelo de lenguaje: es una política visomotora que consume el estado articular del robot (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (cam0 y cam1), y emite un vector de acción de 6 dimensiones. Cuenta con 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la franja de políticas ligeras ejecutables en hardware de consumo.

Su relevancia es acotada y experimental: se trata de un artefacto de formación entrenado sobre un dataset pequeño (50 episodios, 15.000 frames a 15 FPS) para una única tarea ("Pick up an object and place it in a target area"), sin resultados de evaluación publicados y sin licencia declarada. Es útil como referencia de pipeline LeRobot/ACT y como punto de partida reproducible, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como cadena de texto al runner) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un backbone visual (procesa las dos cámaras `cam0` y `cam1` a 3x480x640) con un codificador del estado del robot (`observation.state`, 6 dimensiones) y un decodificador que genera un chunk de acciones de 6 dimensiones. La innovación central del método es predecir secuencias cortas de acciones en lugar de una acción por paso, lo que suaviza la política y mitiga el compounding error de las políticas reactivas. El nombre del repositorio (`chunk100`) sugiere un tamaño de chunk de 100 pasos, aunque este dato no se confirma explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rimur01/so101-assignment1-50-new`: 50 episodios, 15.000 frames a 15 FPS, una única tarea de pick-and-place. La configuración reportada es 50.000 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni si hubo aumentos de datos, RLHF/DPO (no aplica en imitation learning) o regularización adicional. Tampoco se especifica el backbone visual concreto ni la dimensión interna del transformer.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos vistas de cámara y el estado articular.
- Ejecución de una tarea concreta de pick-and-place ("Pick up an object and place it in a target area") sobre el robot SO-101 (`so_follower`).
- Predicción por chunks de acciones, lo que permite trayectorias más suaves que políticas paso a paso.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`) y con el Hub de Hugging Face.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto: es una política puramente motora.
- Capacidades multilingües: no aplica; el prompt de tarea es una etiqueta de texto fija asociada al dataset.
- Sin modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como ejemplo completo y ejecutable de entrenamiento ACT con LeRobot, útil para docencia o para validar una instalación antes de escalar a datasets propios.
- Pick-and-place en laboratorio con SO-101: la política está entrenada exactamente para recoger un objeto y depositarlo en una zona objetivo, por lo que es adecuada para demostraciones controladas con el mismo robot y montaje de cámaras.
- Base para fine-tuning: al ser un checkpoint ACT de 51,7 M de parámetros, puede reentrenarse con un dataset mayor o con variaciones de la tarea sin requerir GPUs de gama alta.
- Benchmark interno de infraestructura: permite medir latencia de inferencia, throughput de `lerobot-rollout` y comportamiento del lazo de control a 15 FPS antes de desplegar políticas más costosas.
- Pruebas de calibración de hardware: al depender de `observation.state` de 6 dimensiones y de dos cámaras concretas, sirve para verificar la calibración del SO-101 y la correspondencia de nombres de cámara (`cam0`, `cam1`).
- Estudio de robustez ante distribución: útil para analizar cómo degrada una política ACT entrenada con 50 episodios cuando cambian posiciones de objetos, iluminación o distracciones (la model card no reporta estas evaluaciones, por lo que el análisis sería propio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repo), la inferencia en FP32 requiere del orden de 0,2-0,3 GB de pesos más activaciones de las dos cámaras a 480x640, por lo que cualquier GPU con 4 GB o más es suficiente en la práctica.
- GPU recomendadas: no hay recomendación del autor. Por tamaño, una RTX 3060/4060 o superior es holgada; A100/H100 no son necesarias para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos 4 GB de VRAM; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento; el formato safetensors es compatible con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles. El dataset está a 15 FPS, lo que sugiere un lazo de control de unos 66 ms por paso, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rimur01/act_so101_chunk100_50k` | 51,7 M | Política visomotora, 2 cámaras + estado 6D | Pick-and-place SO-101 | no disponible | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | Política visomotora | Manipulación ALOHA | código de referencia público (ver paper) | Paper + repo |
| Políticas LeRobot ACT genéricas del Hub | variable | Visomotor | Tareas diversas | variable según autor | Hugging Face |
| Políticas Diffusion Policy (referencia) | variable | Visomotor | Manipulación | variable | Repos públicos |

No se dispone de datos de rendimiento comparables para este checkpoint concreto; la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y requiere contactar con el autor.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse ningún nivel de rendimiento.
- Dataset muy pequeño: 50 episodios y 15.000 frames para una única tarea; la generalización a nuevas posiciones, objetos o iluminación es previsiblemente baja.
- Acoplamiento fuerte al hardware: depende de `so_follower`, de dos cámaras con nombres `cam0`/`cam1` y de un estado de 6 dimensiones; cambiar el montaje o la calibración invalida la política.
- Riesgo de sobreajuste y de fallo silencioso: al no haber métricas, los errores en ejecución no están caracterizados.
- Sin capacidades de lenguaje ni de razonamiento: no debe presentarse como un modelo de propósito general.
- Sin datos sobre sesgos: no se documenta composición demográfica ni sesgos del dataset, aunque el dominio es robótico y el riesgo de sesgo social es bajo.
- Fecha de creación futura en el Hub (2026-11-14): conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimur01/act_so101_chunk100_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/rimur01/so101-assignment1-50-new
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rimur01/so101-assignment1-50-new
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
