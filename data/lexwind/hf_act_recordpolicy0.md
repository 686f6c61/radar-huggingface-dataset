# lexwind/hf_act_recordpolicy0

## Resumen

`lexwind/hf_act_recordpolicy0` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El autor del repositorio es el usuario `lexwind`.

La política resuelve una tarea concreta de manipulación: empujar un bloque con forma de T hasta una diana con forma de T sobre una superficie plana, a partir del dataset público `lerobot/pusht`. Consume una imagen RGB de 96x96 píxeles y un vector de estado de 2 dimensiones, y produce un vector de acción de 2 dimensiones. Con 51.660.418 parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto.

Es relevante como ejemplo reproducible de entrenamiento de políticas ACT con LeRobot 0.7.1: la model card documenta la configuración exacta de entrenamiento (20.000 pasos, batch de 14, AdamW con learning rate 1e-5, semilla 1000) y los comandos de despliegue y reentrenamiento. No obstante, el autor no ha publicado resultados de evaluación en robot real ni ha especificado la licencia ni el tipo de robot objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.660.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de un único frame) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual (procesa la imagen de observación de 3x96x96) con un transformer que predice secuencias de acciones (chunks) en lugar de una acción por paso. Esta predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y permite un control más suave. La política consume `observation.image` (VISUAL, 3x96x96) y `observation.state` (STATE, 2 dimensiones), y emite `action` (ACTION, 2 dimensiones).

El entrenamiento se realizó sobre el dataset `lerobot/pusht`: 206 episodios, 25.650 frames a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuración documentada es de 20.000 pasos de entrenamiento, batch size 14, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.7.1. No se documenta el número total de tokens ni si hubo fases de RLHF o DPO (no aplica en aprendizaje por imitación). La model card no describe innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 2 dimensiones para empujar un objeto en una tarea de manipulación planar.
- Percepción visual: procesa imágenes RGB de 96x96 píxeles como entrada de observación.
- Fusión de estado y visión: combina el vector de estado del robot (2 dimensiones) con la imagen para producir la acción.
- Predicción por chunks: emite secuencias cortas de acciones, lo que mejora la estabilidad del control frente a políticas paso a paso.
- Despliegue con LeRobot: se ejecuta con `lerobot-rollout` sobre un robot configurado por el usuario.
- Reentrenamiento: puede reproducirse con `lerobot-train` sobre el mismo dataset o uno propio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de ACT: sirve como referencia para validar una instalación de LeRobot 0.7.1 y comprobar que el pipeline de entrenamiento e inferencia funciona de extremo a extremo con el dataset `pusht`.
- Benchmark de políticas de imitación: al ser una política entrenada con configuración conocida, puede usarse como línea base para comparar variantes de arquitectura o hiperparámetros en la tarea de empuje del bloque en T.
- Docencia y formación en robótica: permite demostrar el ciclo completo de aprendizaje por imitación (grabación de datos, entrenamiento, despliegue) con un modelo pequeño (51,6 M de parámetros) y un dataset público de 25.650 frames.
- Prototipado de control planar: la salida de 2 dimensiones y la entrada de estado de 2 dimensiones lo hacen adecuado para bancos de prueba de manipulación en 2D antes de escalar a tareas con más grados de libertad.
- Pruebas de integración de hardware: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política sin grabar episodios, útil para verificar cámaras, puertos y calibración del robot.
- Generación de datos sintéticos o aumentados: ejecutando la política en simulación o en un banco de pruebas se pueden recoger trayectorias adicionales para ampliar el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de tasas de éxito en robot real ni en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,4 GB de repositorio), la inferencia en FP32 requiere del orden de 0,2 GB solo para pesos, más el overhead del framework y del encoder visual. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real a 10 FPS sin dificultad. GPU de datacenter (A100, H100) no son necesarias para inferencia, aunque aceleran el reentrenamiento.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones. El dataset de entrenamiento opera a 10 FPS, lo que fija una referencia de frecuencia de control, pero no se garantiza que la política alcance ese ritmo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lexwind/hf_act_recordpolicy0` | 51.660.418 | imagen 3x96x96 + estado (2,) | Empujar bloque en T (`lerobot/pusht`) | no disponible | Hugging Face, libreria lerobot |
| Políticas ACT de referencia de LeRobot | no disponible | no disponible | Tareas de imitación con LeRobot | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no disponible | Imitación visual-motora | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a disponibilidad y categoría de método.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Sesgo de dominio: entrenada exclusivamente con `lerobot/pusht` (206 episodios, 25.650 frames, 10 FPS); probablemente no generaliza a otras tareas, objetos, iluminaciones o posiciones de cámara no vistas.
- Tipo de robot desconocido: la model card indica `Robot type: unknown`, lo que impide garantizar compatibilidad con un hardware concreto sin adaptar la configuración de `lerobot-rollout`.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin capacidades de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso; no debe confundirse con un LLM.
- Riesgo de sobreajuste: 20.000 pasos con batch 14 sobre un dataset pequeño puede producir sobreajuste al conjunto de demostraciones; no se documenta validación.
- Dependencia de versión: entrenada con LeRobot 0.7.1; cambios de API en versiones posteriores pueden requerir ajustes en los comandos de despliegue.
- Cámaras y claves de observación: los nombres de cámara deben coincidir con las claves de observación del entrenamiento (`observation.image`), lo que limita la portabilidad directa a otros montajes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lexwind/hf_act_recordpolicy0
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
