# Barbatosu/pi05_full_run_01

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en mundo abierto en tareas de robotica. Evoluciona el modelo π₀ para generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La implementacion disponible en LeRobot esta adaptada del repositorio open source OpenPI de Physical Intelligence.

El repositorio `Barbatosu/pi05_full_run_01` es un checkpoint concreto de politica entrenada mediante imitacion (imitation learning) sobre un dataset propio de 50 episodios y 24.746 frames a 30 FPS, para la tarea especifica "Put the blue cube into the white box" con un robot `so_follower` (SO-100/SO-101 de LeRobot) equipado con dos camaras (frontal y de muneca). El modelo consume observaciones de estado (6 dimensiones) e imagenes (3x480x640) y produce acciones de 6 dimensiones.

Se trata de un modelo de robotica de ~4.140 millones de parametros (4.143.404.816 segun safetensors), con un repositorio de 9,4 GB. No es un modelo de lenguaje de proposito general, sino una politica de control robotico que combina un backbone vision-language con un cabezal de acciones. Es relevante como ejemplo practico de fine-tuning de π₀.₅ con LeRobot 0.6.2 sobre hardware asequible (SO-100), pero carece de evaluacion publicada y de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptada de OpenPI; backbone transformer vision-language con cabezal de acciones |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robotica; no se declaran idiomas) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

Otros datos tecnicos:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `front`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Dataset de entrenamiento | Barbatosu/record-test_20261026_201007 |
| Episodios / frames | 50 / 24.746 a 30 FPS |
| Tarea | "Put the blue cube into the white box" |
| Pasos de entrenamiento | 10.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 9,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo Vision-Language-Action que combina un backbone vision-language con un cabezal de prediccion de acciones. La implementacion concreta de este repositorio es la de LeRobot, adaptada del repositorio OpenPI. El modelo procesa dos flujos de imagen (camara frontal y de muneca) junto con el estado del robot (6 dimensiones) y emite un vector de accion de 6 dimensiones, tipico de un brazo robotico de 6 grados de libertad.

El entrenamiento es de imitacion supervisada sobre un dataset propio de 50 episodios (24.746 frames a 30 FPS) para una unica tarea. Se realizaron 10.000 pasos con batch size 8, AdamW y learning rate 1e-05, con semilla 1000. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias. No se proporcionan detalles sobre el numero de tokens de entrenamiento del backbone, la composicion del dataset original de π₀.₅ ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Control robotico visuomotor: genera acciones de 6 dimensiones a partir de imagenes y estado del robot para ejecutar tareas de manipulacion.
- Percepcion visual multi-camara: procesa simultaneamente imagenes de camara frontal y de muneca a 480x640.
- Generalizacion en mundo abierto (segun el diseno de π₀.₅): el modelo base esta pensado para generalizar a entornos no vistos, aunque este checkpoint esta fine-tuneado para una tarea concreta.
- Ejecucion de tareas de pick-and-place: especificamente "Put the blue cube into the white box".
- Integracion con LeRobot: compatible con el flujo `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, vision general, audio ni thinking mode; es un modelo de robotica, no un asistente conversacional.
- Capacidades multilingues: no disponibles (no aplica como modelo de lenguaje).

## Casos de uso

- Manipulacion pick-and-place en laboratorio: ejecutar la tarea de introducir un cubo azul en una caja blanca con un brazo SO-100, usando `lerobot-rollout` con la politica y duracion configurada. Adecuado por estar entrenado especificamente para esa tarea y ese robot.
- Prototipado de politicas VLA con LeRobot: servir como punto de partida o referencia para entender el flujo de entrenamiento de π₀.₅ con `lerobot-train` sobre datasets propios de imitacion.
- Investigacion en imitation learning: analizar el comportamiento de un checkpoint de 10.000 pasos con batch 8 sobre 50 episodios para estudiar convergencia y calidad de politica con datos limitados.
- Docencia y demostraciones de robotica: reproducir un pipeline completo de grabacion de datos, entrenamiento y despliegue en hardware asequible (SO-100) con dos camaras.
- Benchmark interno de infraestructura: evaluar throughput y latencia de inferencia de un VLA de ~4,1 B parametros en GPU consumer o de datacenter dentro de un flujo LeRobot.
- Base para fine-tuning en tareas similares: reutilizar los pesos como inicializacion para nuevas tareas de manipulacion con el mismo tipo de robot y configuracion de camaras.
- Validacion de pipelines CI/CD de robotica: integrar `lerobot-rollout` en entornos de prueba automatizados para verificar que la politica carga y emite acciones coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de MMLU, HumanEval, GSM8K u otras, que ademas no aplican a un modelo de robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,14 B parametros, en FP16/BF16 se requieren aproximadamente 8,3 GB solo para pesos; en FP32 unos 16,6 GB. A esto hay que sumar el overhead de activaciones del backbone vision-language y de las dos imagenes de entrada (3x480x640), por lo que se recomienda al menos 12-16 GB de VRAM en FP16.
- GPU recomendadas: NVIDIA A100, H100 o L40S para entrenamiento e inferencia de produccion; RTX 4090 (24 GB) es adecuada para inferencia en FP16.
- GPU consumer: cabe en RTX 4090 (24 GB) y probablemente en RTX 3090 (24 GB); en GPUs de 12-16 GB puede requerir cuantizacion o precision reducida, aunque no se publican variantes cuantizadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) es el flujo documentado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no estan orientados a VLA de robotica.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS en el dataset, pero no se reportan tiempos de inferencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barbatosu/pi05_full_run_01 | ~4,14 B | VLA (π₀.₅ fine-tuneado) | no disponible | no disponible | Hugging Face (0 descargas) |
| π₀ (Pi0) | no disponible en la informacion | VLA | no disponible | no disponible | OpenPI (open source) |
| π₀.₅ (Pi05) base | no disponible en la informacion | VLA | no disponible | no disponible | OpenPI / Physical Intelligence |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | Politicas de imitacion | no disponible | no disponible | LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce la fiabilidad de la politica.
- Dataset muy reducido: 50 episodios y 24.746 frames para una unica tarea; la generalizacion a variaciones de posicion, iluminacion o distractores es probablemente limitada.
- Tarea unica y especifica: entrenado solo para "Put the blue cube into the white box"; no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: asume robot `so_follower` con camaras `front` y `wrist` a 480x640 y 30 FPS; cambios en la configuracion pueden degradar el comportamiento.
- Licencia no declarada: la model card indica "[More Information Needed]"; no se puede confirmar el uso comercial.
- Riesgo de sobreajuste: 10.000 pasos con batch 8 sobre 50 episodios puede provocar sobreajuste al dataset; no se documenta validacion.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma: no aplica como modelo de lenguaje, pero no se documentan sesgos visuales ni de dominio.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Sin variantes cuantizadas publicadas: el despliegue en GPUs de baja VRAM no esta soportado oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Barbatosu/pi05_full_run_01
- Dataset de entrenamiento: https://huggingface.co/datasets/Barbatosu/record-test_20261026_201007
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Barbatosu/record-test_20261026_201007
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
