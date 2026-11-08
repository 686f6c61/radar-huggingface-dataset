# asomegs/act_sim_pick_cube_rand

## Resumen

`asomegs/act_sim_pick_cube_rand` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente por Zhao et al. (2023) y empaquetado mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación simulada —"pick_cube"— a partir de dos cámaras (`front` y `wrist`) y un vector de estado de 18 dimensiones, y produce comandos de acción de 4 dimensiones. No es un modelo de lenguaje: es un controlador visuomotor de 51,6 millones de parámetros cuyo único propósito es generar trayectorias de agarre.

La relevancia de esta ficha es acotada y debe interpretarse en su contexto real: se trata de un experimento de entrenamiento de bajo presupuesto (22 episodios, 1.545 fotogramas a 10 FPS, 20.000 pasos de entrenamiento) sobre un dataset propio del autor, con licencia no declarada y sin resultados de evaluación publicados. Resulta útil como referencia para quien quiera reproducir el flujo de trabajo de LeRobot con ACT, pero no constituye un artefacto listo para producción ni un benchmark de referencia.

Arquitectónicamente es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones en lugar de pasos individuales, la innovación central de ACT. El repositorio ocupa 0,2 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.586.692 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin entrada/salida de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entradas | `observation.images.front` (3, 128, 128), `observation.images.wrist` (3, 128, 128), `observation.state` (18,) |
| Salidas | `action` (4,) |
| Tarea | `pick_cube` |
| Libreria | lerobot 0.7.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de *imitation learning* que combina un codificador visual (procesa las dos cámaras a 128×128) con un transformer que predice secuencias cortas de acciones (*action chunks*) en lugar de un único paso. Esta predicción por bloques reduce el error de compounding y suaviza el control, y es la razón por la que ACT logra tasas de éxito notables en tareas de manipulación con datos teleoperados. El modelo consume además un vector de estado propioceptivo de 18 dimensiones y emite acciones de 4 dimensiones, coherente con un robot de agarre sencillo en simulación.

El entrenamiento se realizó sobre el dataset `asomegs/sim_pick_cube_kb_rand`: 22 episodios, 1.545 fotogramas a 10 FPS, una única tarea ("pick_cube"). La configuración declarada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.7.1. No se documenta composición del dataset más allá del número de episodios, ni se menciona RLHF, DPO ni ninguna fase de ajuste posterior; es entrenamiento supervisado por imitación puro. El reducido volumen de datos (1.545 fotogramas) es el factor limitante más evidente de esta política.

## Capacidades

- Control visuomotor para una tarea de agarre de cubo en simulación (`pick_cube`).
- Fusión de dos vistas de cámara (`front` y `wrist`) con estado propioceptivo de 18 dimensiones.
- Predicción de *action chunks* de 4 dimensiones, lo que aporta suavidad en la ejecución.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de lenguaje, visión general, audio ni matemáticas.
- No es multilingüe ni procesa texto: la única entrada textual es la etiqueta de tarea (`--task="pick_cube"`).

## Casos de uso

- Reproducción del flujo de entrenamiento de ACT con LeRobot: sirve como plantilla ejecutable para validar la instalación, el formateo de datasets y el ciclo `lerobot-train` → `lerobot-rollout` antes de abordar proyectos propios.
- Docencia y formación en imitation learning: el tamaño reducido (51,6 M de parámetros, 0,2 GB) permite entrenar y desplegar en una sola GPU consumer, lo que lo hace adecuado para prácticas de laboratorio sobre políticas visuomotoras.
- Pruebas de integración de hardware: útil para verificar la calibración de cámaras y brazos robóticos en un entorno simulado antes de pasar a datos reales, dado que las claves de observación (`front`, `wrist`) están bien definidas.
- Generación de datos sintéticos de referencia: el par dataset-política permite comparar variantes de ACT (distintos tamaños de chunk, resoluciones, aumentos de datos) manteniendo constante el resto del pipeline.
- Investigación en robustez a posiciones aleatorias: el sufijo `rand` del dataset sugiere variación en la posición del cubo; puede usarse como línea base para medir la degradación ante cambios de iluminación o distractores.
- Prototipado rápido de tareas de pick-and-place: punto de partida para quien necesite una política mínima funcional y luego escale a datasets mayores o a métodos como Diffusion Policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No se declara tasa de éxito, número de ensayos ni condiciones de evaluación en simulación o en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros y pesos safetensors en FP32 el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para inferencia, aunque la latencia será mayor.
- Cabe en GPU consumer: sí, sin restricciones prácticas; incluso en iGPU o CPU puede ejecutarse a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que es el camino documentado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del dataset es de 10 FPS, pero no se publican mediciones de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asomegs/act_sim_pick_cube_rand` | 51,6 M | ACT (LeRobot) | 2 cámaras 128×128 + estado (18,) | no disponible | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible | ACT | variables por tarea | MIT (repo de referencia) | GitHub |
| Diffusion Policy | no disponible | Política de difusión | variables por tarea | no disponible en la información | Papers/repos |
| Modelos comparables de LeRobot Hub | no disponible | ACT / otras políticas | variables | variable | Hugging Face |

La comparación rigurosa no es posible con los datos disponibles: no se han publicado métricas de éxito de esta política ni de las alternativas en el mismo entorno, por lo que cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 22 episodios y 1.545 fotogramas, insuficiente para generalizar más allá de condiciones muy próximas a las de captura.
- Sin evaluación publicada: no hay evidencia de tasa de éxito ni en simulación ni en robot real.
- Licencia no declarada: no se puede asumir uso comercial; la model card deja el campo como "[More Information Needed]".
- Especialización extrema: solo resuelve `pick_cube` con un robot y una configuración de cámaras concretos; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de las claves de observación: las cámaras deben llamarse `front` y `wrist` y respetar la resolución 128×128 esperada por la política.
- Riesgo de sobreajuste y de fallo ante cambios de iluminación, posición del objeto o del robot.
- Sin soporte de lenguaje ni de instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- No apto para producción sin una validación exhaustiva previa en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asomegs/act_sim_pick_cube_rand
- Dataset de entrenamiento: https://huggingface.co/datasets/asomegs/sim_pick_cube_kb_rand
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=asomegs/sim_pick_cube_kb_rand
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Implementación de referencia de ACT: https://github.com/myoshikawa47/act
