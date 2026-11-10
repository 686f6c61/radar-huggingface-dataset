# NilupulSIT/act_bimanual_folding

## Resumen

`NilupulSIT/act_bimanual_folding` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele lograr tasas de éxito altas en tareas de manipulación. En concreto, esta política está entrenada para la tarea "Folding towel" (doblar una toalla) sobre un robot bimanual de tipo `bi_so_follower` con tres cámaras.

El modelo es un transformer de ~51,7 millones de parámetros que consume el estado articular de 12 dimensiones y tres flujos visuales de 480x640 píxeles (muñeca izquierda, vista superior y muñeca derecha), y produce un vector de acción de 12 dimensiones. Es un modelo de robótica de propósito específico: no es un modelo de lenguaje ni un modelo generativo general, sino un controlador entrenado sobre un dataset concreto de 10 episodios y 11.980 fotogramas a 30 FPS.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación bimanual con LeRobot, y demuestra el flujo de entrenamiento, publicación en el Hub y despliegue sobre hardware real mediante el comando `lerobot-rollout`. La información disponible es escasa (sin licencia declarada, sin benchmarks y con solo 10 episodios de entrenamiento), por lo que debe tratarse como una política experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer de predicción de chunks de acción |
| Parametros totales | 51.680.908 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Entrada: estado | `observation.state`, forma `(12,)` |
| Entrada: visión | `left_wrist`, `top`, `right_wrist`, cada una `(3, 480, 640)` |
| Salida: acción | `action`, forma `(12,)` |
| Tipo de robot | `bi_so_follower` (bimanual) |
| Dataset de entrenamiento | `NilupulSIT/bimanual_so101_test_Folding_20261110_160321` |
| Episodios / fotogramas | 10 episodios / 11.980 fotogramas a 30 FPS |
| Pasos de entrenamiento | 30.000 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual, un transformer que fusiona observaciones y un decodificador que emite un chunk de acciones futuro en lugar de una sola acción. Esta formulación reduce el horizonte efectivo de decisión y mitiga el error compuesto típico de las políticas paso a paso. El modelo consume el estado articular (12 dimensiones) y tres imágenes de 480x640 (muñeca izquierda, vista superior y muñeca derecha), y devuelve una acción de 12 dimensiones, coherente con un robot bimanual de dos brazos.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `bimanual_so101_test_Folding_20261110_160321`: 10 episodios de teleoperación, 11.980 fotogramas a 30 FPS, tarea "Folding towel". La configuración reportada es de 30.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición del dataset más allá de la tarea, ni si hubo etapas de refinamiento posteriores (RLHF/DPO no aplican en este contexto de robótica). Tampoco se especifica la variante exacta de ACT (por ejemplo, número de capas, dimensión del chunk o uso de VAE), por lo que esos parámetros deben considerarse no disponibles.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para un robot `bi_so_follower` a partir de estado articular y tres vistas de cámara.
- Aprendizaje por imitación: reproduce la tarea "Folding towel" a partir de demostraciones teleoperadas.
- Predicción de chunks de acción: emite secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- Percepción visual multivista: integra tres cámaras (muñeca izquierda, vista superior, muñeca derecha) a 480x640.
- Despliegue con LeRobot: compatible con `lerobot-rollout` para ejecución en robot real y con `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política de control, no un modelo de lenguaje.
- No se documentan capacidades de visión general, audio, thinking mode ni otras funciones fuera del control motor.

## Casos de uso

- Investigación en aprendizaje por imitación: usar la política como referencia reproducible para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras en tareas de manipulación bimanual.
- Prototipado de doblado de ropa: desplegar la política sobre un `bi_so_follower` para validar el pipeline completo (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para producir trayectorias etiquetadas que sirvan como baseline en experimentos de evaluación de políticas.
- Benchmark interno de hardware: medir latencia y estabilidad de inferencia en distintas GPUs con un modelo pequeño (~51,7 M de parámetros) y tres cámaras a 30 FPS.
- Docencia y formación: ilustrar el flujo de LeRobot (instalación, calibración, grabación, entrenamiento y despliegue) con un caso concreto y de tamaño manejable.
- Base para fine-tuning: partir de estos pesos y reentrenar con un dataset propio de doblado u otras tareas bimanuales, aprovechando que el modelo es pequeño y el coste de reentrenamiento es bajo.
- Pruebas de integración en pipelines de robótica: validar la compatibilidad de `lerobot-rollout` con hardware y cámaras específicas antes de invertir en datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito reportada para la tarea "Folding towel" ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB, por lo que la VRAM vendrá dominada por las tres imágenes de 480x640 y las activaciones, no por los parámetros.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder alojar el modelo; para entrenamiento conviene una GPU con al menos 8-12 GB de VRAM por el batch de 32 y las tres cámaras.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según el dataset, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `NilupulSIT/act_bimanual_folding` | 51,7 M | ACT (imitación, bimanual) | Estado 12D + 3 cámaras 480x640 | no disponible | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | ACT (imitación) | Estado + cámaras (configurable) | según implementación | Paper y código de referencia |
| Políticas LeRobot de la comunidad | variable | ACT, Diffusion Policy, etc. | variable | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Dataset muy reducido: solo 10 episodios y 11.980 fotogramas, lo que limita la generalización a variaciones de posición, iluminación, tipo de toalla o robot.
- Sin evaluación publicada: no hay tasa de éxito ni pruebas en robot real reportadas, por lo que el rendimiento real es desconocido.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- Específico de hardware: entrenado para `bi_so_follower` con cámaras concretas (`left_wrist`, `top`, `right_wrist`); no es portable a otras configuraciones sin reentrenamiento.
- Sin capacidades de lenguaje ni razonamiento: no debe emplearse como modelo de texto, código o agentes.
- Riesgo de sobreajuste: con 30.000 pasos sobre 10 episodios, es probable que la política memorice trayectorias y falle ante distribuciones distintas.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni optimizadas para despliegue de baja latencia.
- Fecha de creación y actualización en 2026: verificar la vigencia del repo y de la versión de LeRobot (0.6.2) antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NilupulSIT/act_bimanual_folding
- Dataset de entrenamiento: https://huggingface.co/datasets/NilupulSIT/bimanual_so101_test_Folding_20261110_160321
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=NilupulSIT/bimanual_so101_test_Folding_20261110_160321
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
