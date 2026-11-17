# go234/dp_pick_cube

## Resumen

`go234/dp_pick_cube` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea de manipulación concreta —recoger un cubo y depositarlo en una caja— sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste), consumiendo el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 a 30 FPS, y emitiendo un vector de acción de 6 dimensiones.

A diferencia de un LLM, no es un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su relevancia radica en que ejemplifica el flujo completo de imitación robótica end-to-end reproducible con LeRobot 0.6.0, con un checkpoint de 277,8 millones de parámetros y un repositorio de 1,1 GB que incluye los pesos en formato safetensors. Está entrenado sobre 50 episodios y 24.423 fotogramas de un único dataset propio.

El modelo se publica con licencia Apache 2.0, lo que permite reutilización comercial, y sirve tanto como referencia de pipeline de entrenamiento como punto de partida para ajuste fino en tareas de pick-and-place con robots de sobremesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor, según arXiv 2303.04137) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: horizonte de acción definido por la política, no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es una cadena de texto fija: "Pick up the cube and put it in the box.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: en lugar de regresar directamente una acción, modela la distribución de trayectorias de acción como un proceso de difusión generativo, produciendo secuencias de acciones suaves y multimodales adecuadas para manipulación con contacto rico. La entrada combina el estado proprioceptivo (`observation.state`, shape `(6,)`) con dos flujos visuales (`observation.images.cam1` y `observation.images.cam2`, shape `(3, 480, 640)`), y la salida es un vector `action` de shape `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `go234/cube-box_20261013_041703`: 50 episodios, 24.423 fotogramas a 30 FPS, tarea única "Pick up the cube and put it in the box.". La configuración reportada es de 200.000 pasos, batch size 16, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documentan en la model card detalles sobre aumentos de datos, composición adicional del dataset ni técnicas de regularización más allá de los hiperparámetros citados.

## Capacidades

- Control visuomotor end-to-end para una tarea de pick-and-place: recoger un cubo y colocarlo en una caja.
- Fusión de dos cámaras RGB (640x480, 30 FPS) con el estado articular de 6 dimensiones del robot `so_follower`.
- Generación de trayectorias de acción multimodales y suaves propias de la formulación por difusión, adecuadas para manipulación con contacto.
- Ejecución en bucle cerrado sobre el robot mediante `lerobot-rollout` con `--strategy.type=base` y `--duration` configurable.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No incluye visión de propósito general ni audio; las cámaras son entradas de control, no de percepción semántica abierta.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: ejecutar la política sobre un SO-100/SO-101 con dos cámaras para trasladar cubos a una caja en entornos controlados, usando `lerobot-rollout` con la tarea fija y una duración acotada.
- **Base para ajuste fino con datos propios**: reentrenar con `lerobot-train --policy.type=diffusion` sobre un dataset propio de pocas decenas de episodios para adaptar la política a nuevas posiciones de objeto o recipientes.
- **Banco de pruebas de imitación robótica**: usar el checkpoint como referencia reproducible para comparar variantes de Diffusion Policy, ACT u otras políticas de LeRobot bajo la misma configuración de cámaras y robot.
- **Validación de pipeline de datos**: emplear el dataset asociado (50 episodios, 24.423 fotogramas) para verificar el flujo de grabación, calibración y visualización con el visor de datasets de LeRobot.
- **Docencia y prototipado en robótica de bajo coste**: demostrar un ciclo completo de imitación (grabar, entrenar, desplegar) en hardware asequible sin necesidad de GPUs de datacenter.
- **Investigación en manipulación con contacto**: estudiar el comportamiento de políticas de difusión en tareas de agarre y colocación donde la suavidad de la trayectoria importa, sustituyendo la política por variantes entrenadas con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No consta tasa de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 277,8 M de parámetros en safetensors (1,1 GB de repo), una estimación conservadora sitúa la inferencia en torno a 2-4 GB de VRAM en FP32/FP16, sin contar los buffers de las dos cámaras a 640x480.
- **GPU recomendadas**: no especificadas por el autor. Para entrenamiento con `--policy.device=cuda` se recomienda una GPU con al menos 8-12 GB de VRAM por el batch size 16 y las dos entradas visuales; para inferencia basta una GPU consumer moderna.
- **¿Cabe en GPU consumer?**: sí, previsiblemente en tarjetas tipo RTX 3060/4060 en adelante, aunque el dato no está confirmado en la documentación.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial) sobre el robot `so_follower`; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. La política opera a 30 FPS según la tasa de grabación del dataset, pero no se publica latencia medida por paso de difusión ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `go234/dp_pick_cube` | Diffusion Policy | 277,8 M | estado (6,) + 2 cámaras 480x640 | Apache 2.0 | Hugging Face Hub (LeRobot) |
| Políticas ACT de LeRobot | Transformer (imitation learning) | no disponible | estado + cámaras | según checkpoint | Hub de LeRobot |
| Otras políticas Diffusion Policy en LeRobot | Diffusion Policy | variable según checkpoint | estado + cámaras | según checkpoint | Hub de LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- **Tarea única y altamente específica**: entrenada exclusivamente para "Pick up the cube and put it in the box."; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- **Dataset pequeño**: 50 episodios y 24.423 fotogramas implican riesgo de sobreajuste a posiciones, iluminación y disposición concretas del montaje de grabación.
- **Sin evaluación publicada**: no hay tasa de éxito ni protocolo de evaluación, por lo que el rendimiento real en robot es desconocido.
- **Dependencia de hardware exacto**: requiere robot `so_follower`, dos cámaras con nombres `cam1` y `cam2` y las mismas resoluciones (640x480) y FPS (30) que en el entrenamiento; desviaciones degradan el comportamiento.
- **Sin capacidades lingüísticas**: no debe emplearse como modelo de texto, agentes ni razonamiento; la cadena de tarea es fija y no se interpreta semánticamente de forma abierta.
- **Riesgo de alucinación en el sentido de acciones no válidas**: como toda política de imitación, puede generar trayectorias fuera de distribución ante cambios de escena, oclusiones o distracciones.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de seguridad en el robot recae en el integrador.
- **Ausencia de cuantizaciones documentadas**: no hay versiones GGUF/INT8 publicadas, lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/dp_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
