# Screener2/act_Final_DoubleSim

## Resumen
act_Final_DoubleSim es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado por el usuario Screener2 mediante LeRobot, la biblioteca de Hugging Face para aprendizaje automático en robótica del mundo real. Resuelve el problema de control de un brazo robótico tipo `so_follower` (6 grados de libertad) a partir de observaciones visuales de una cámara cenital (`overhead`) y del estado articular, generando comandos de acción de 6 dimensiones.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un autor independiente, con 0 descargas y 0 likes en el momento de la consulta, entrenado sobre un dataset propio de solo 30 episodios y 14.468 fotogramas a 30 FPS. No es un modelo de lenguaje ni un modelo fundacional de robótica generalista, sino una política específica para una tarea concreta (identificada simplemente como "0") en un montaje de simulación o gemelo digital ("DoubleSim"). Su interés técnico radica en documentar el flujo completo de entrenamiento ACT en LeRobot y en servir como referencia de las dimensiones reales de una política de imitación de este tipo.

El modelo tiene 51.668.614 parámetros totales (unos 51,7 millones), ocupa 0,2 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0. No dispone de card de evaluación con tasas de éxito, ni de benchmarks publicados, ni de soporte multilingüe (no es un modelo de texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

Especificaciones adicionales del despliegue:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (6 articulaciones) |
| Camaras | `overhead` (una camara cenital) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | `observation.images.overhead`, forma `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Frecuencia de datos | 30 FPS |
| Biblioteca | LeRobot 0.5.2 |
| Dataset de entrenamiento | Screener2/Final_DoubleSim (30 episodios, 14.468 fotogramas) |

## Arquitectura y entrenamiento
ACT combina un codificador visual (procesa imágenes RGB de 3×480×640) con un transformer que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras. Esta estrategia de "action chunking" reduce el error de composición acumulado típico de las políticas paso a paso y mejora la consistencia temporal de los movimientos. La política consume también el vector de estado articular de 6 dimensiones y produce un vector de acción de 6 dimensiones, adecuado para el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.5.2 durante 100.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, sobre el dataset Screener2/Final_DoubleSim (30 episodios, 14.468 fotogramas a 30 FPS, una única tarea etiquetada como "0"). No se documenta en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de los episodios y fotogramas, ni si se aplicaron técnicas de RLHF/DPO (no procede en aprendizaje por imitación). No se describen innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Control de robot manipulador de 6 grados de libertad (`so_follower`) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas ni de un simulador físico explícito.
- Predicción de chunks de acción, lo que aporta suavidad y consistencia temporal en las trayectorias.
- Percepción visual monocámara: procesa imágenes RGB de 480×640 desde una vista cenital.
- Ejecución en tiempo real a 30 FPS mediante el comando `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso
- Manipulación de laboratorio en un montaje simulado: la política se ejecuta sobre el robot `so_follower` con la cámara `overhead` para reproducir la tarea "0" aprendida del dataset Final_DoubleSim; es adecuada porque el espacio de observación y acción coincide exactamente con el del entrenamiento.
- Replicación de una tarea de pick-and-place teleoperada: dado que ACT aprende de demostraciones humanas, puede reproducir secuencias de agarre y colocación capturadas a 30 FPS, manteniendo la cadencia temporal del operador.
- Validación de pipelines de aprendizaje por imitación en LeRobot: sirve como referencia para comprobar el flujo `lerobot-train` → `lerobot-rollout` con una política de ~51,7 millones de parámetros y un dataset pequeño (30 episodios).
- Prototipado rápido de control visual para brazos de bajo coste: al requerir solo una cámara RGB de 480×640 y un estado de 6 articulaciones, el coste de hardware de percepción es mínimo.
- Investigación en gemelos digitales ("DoubleSim"): el nombre del dataset sugiere entrenamiento en simulación paralela; el modelo puede emplearse para estudiar la brecha sim-a-real en políticas ACT.
- Docencia y demostraciones de robótica: el repositorio de 0,2 GB y la licencia Apache 2.0 permiten desplegar y estudiar la política en entornos académicos sin restricciones de uso comercial.
- Integración en flujos de evaluación de políticas: aunque no hay métricas de éxito publicadas, puede usarse como caso base para comparar configuraciones de entrenamiento ACT (pasos, batch, tasa de aprendizaje).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en safetensors y un repositorio de 0,2 GB, la huella de pesos en FP32 ronda los 0,2 GB y en FP16 los 0,1 GB, a lo que se suma el codificador visual y las activaciones de un batch de una imagen de 3×480×640.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder albergarlo; no se documentan requisitos oficiales.
- GPU de consumo: no se especifica compatibilidad con RTX 4090, RTX 3090 u otras; el tamaño reducido sugiere que cabría en GPU de consumo, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Screener2/act_Final_DoubleSim` y `--strategy.type=base`), instalación mediante el paquete `lerobot` y configuración de robot `so_follower` con cámara OpenCV a 640×480 y 30 FPS.
- Latencia y throughput: no disponible; el dataset se captura a 30 FPS, pero no se documenta la latencia de inferencia ni el throughput real de la política.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros modelos de robótica comparables ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia metodológica, ACT se describe en el paper arXiv:2304.13705, pero no se dispone de resultados numéricos de este modelo frente a alternativas.

## Limitaciones y advertencias
- Sin evaluación publicada: no hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset muy pequeño: 30 episodios, 14.468 fotogramas y una única tarea ("0"), lo que limita la generalización a variaciones de posición, iluminación, objetos o robots distintos.
- Dependencia de un montaje concreto: entradas y salidas están fijadas a `so_follower` (6 articulaciones), cámara `overhead` y resolución 3×480×640; cualquier cambio de cámara, calibración o robot invalida la política.
- Riesgo de sobreajuste y de fallo fuera de distribución: al entrenarse con 100.000 pasos sobre 30 episodios, es probable que la política memorice trayectorias y no generalice; no se documentan distractores ni variaciones.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe confundirse con un modelo fundacional de robótica ni usarse para tareas de texto.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero el dataset de teleoperación refleja los sesgos del operador y del montaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor; el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.
- No se documentan cuantizaciones ni formatos alternativos (GGUF), lo que limita el despliegue en entornos de recursos muy restringidos sin conversión manual.

## Enlaces
- Repositorio del modelo en Hugging Face: https://huggingface.co/Screener2/act_Final_DoubleSim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/Final_DoubleSim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/Final_DoubleSim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
