# kartikbud/act_pick_v2

## Resumen

`kartikbud/act_pick_v2` es una política robótica de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub por el usuario kartikbud mediante la librería LeRobot. No es un modelo de lenguaje ni un modelo multimodal conversacional: es un controlador entrenado para una única tarea de manipulación, "Pick up the red cube and place it on the wooden coaster", sobre un brazo seguidor de la familia SO-100/SO-101 (tipo de robot declarado: `so_follower`). Consume estado articular de 6 dimensiones y dos cámaras de 480×640 (muñeca y cenital), y emite un vector de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y ocupa 0,2 GB en el repositorio, un tamaño coherente con pesos en fp32 (51,67 M × 4 bytes ≈ 207 MB). Se entrenó durante 40.000 pasos con batch de 32, optimizador AdamW y tasa de aprendizaje 1e-5 (semilla 1000, LeRobot 0.6.2) sobre el dataset `kartikbud/pick_v2`: 100 episodios, 25.365 fotogramas a 30 FPS de datos de teleoperación.

Su relevancia es práctica más que de estado del arte: sirve como ejemplo reproducible y de bajo coste del flujo completo de LeRobot (grabar datos, entrenar, desplegar) y como línea base de imitación para hardware de manipulación barato. Con licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta, y sin resultados de evaluación publicados, debe tratarse como un artefacto de investigación o demostración, no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers); no es un modelo de lenguaje |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica): consume una observación por paso (estado de 6 dims + 2 imágenes de 480×640) y predice un fragmento de acciones |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors, compatible con fp32 (~0,2 GB). No hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible (no aplica); la instrucción de tarea está fija en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras declaradas | `wrist`, `overhead` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.overhead` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `kartikbud/pick_v2`: 100 episodios, 25.365 fotogramas, 30 FPS, una tarea |
| Pasos de entrenamiento | 40.000 (batch 32, AdamW, lr 1e-5, seed 1000) |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT, descrito en el artículo 2304.13705, es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, lo que reduce el error de acumulación y amortiza el coste de inferencia a lo largo del fragmento. La formulación habitual combina un codificador visual por cámara, un transformer que procesa los tokens de observación y una variable latente de estilo (CVAE) que modela la variabilidad de las demostraciones humanas, junto con un decodificador que emite la secuencia de acciones. El entrenamiento optimiza una pérdida de reconstrucción L1 más un término de divergencia KL. La implementación concreta aquí usada es la de LeRobot (versión 0.6.2), que puede diferir en detalles del repositorio original del paper; la ficha del modelo no especifica tamaño de chunk, resolución interna del encoder ni número de capas.

Los datos de entrenamiento son exclusivamente teleoperados sobre el dataset `kartikbud/pick_v2`: 100 episodios y 25.365 fotogramas a 30 FPS de una única tarea. No se documenta composición adicional del dataset, aumento de datos, ni fases de ajuste por refuerzo o preferencias (RLHF/DPO no aplican a este tipo de política). Tampoco se documenta ninguna innovación técnica propia más allá de la receta ACT estándar.

## Capacidades

- Control robótico por imitación para una tarea concreta de pick-and-place: coger un cubo rojo y dejarlo sobre un posavasos de madera.
- Percepción visual desde dos cámaras sincronizadas a 480×640 (muñeca y cenital), fusionadas con el estado articular en la política.
- Predicción de fragmentos de acción (action chunking) en lugar de acciones aisladas, lo que suaviza la trayectoria y reduce la frecuencia efectiva de inferencia.
- Ejecución en bucle cerrado sobre hardware real a 30 FPS mediante `lerobot-rollout`.
- Compatibilidad con el ecosistema LeRobot: carga directa desde el Hub, reentrenamiento con `lerobot-train` y exportación de checkpoints.
- No soporta tool calling ni function calling: no dispone de interfaz de herramientas ni de salida estructurada más allá del vector de acción.
- No soporta agentes ni razonamiento multi-paso simbólico; la "planificación" es implícita y de horizonte corto (un fragmento de acciones).
- Capacidades multilingües: no aplica. No hay evidencia en la ficha de que el modelo esté condicionado por lenguaje; la cadena de tarea se usa para identificar el episodio durante el despliegue.
- No dispone de modo "thinking", ni de entrada/salida de audio, ni de comprensión semántica de la escena.

## Casos de uso

- Automatización de pick-and-place en banco de laboratorio: el modelo ejecuta la secuencia completa de recogida y colocación sobre un SO-100/SO-101 con dos cámaras, a 30 FPS, sin necesidad de planificación explícita.
- Línea base de imitación para investigación: sirve como referencia reproducible frente a Diffusion Policy, SmolVLA u otras políticas del ecosistema LeRobot, usando el mismo dataset y la misma métrica de éxito en robot real.
- Validación de un pipeline de captura de datos: el modelo permite comprobar de extremo a extremo que el dataset `pick_v2` (100 episodios, 25.365 frames a 30 FPS) es coherente en nombres de cámaras, claves de observación y frecuencia antes de escalar la recogida de datos.
- Kits educativos y docencia en robótica de bajo coste: al tener 51,7 M de parámetros y 0,2 GB, se puede desplegar en un portátil con GPU modesta o en una Jetson, lo que lo hace apto para prácticas de aprendizaje por imitación.
- Punto de partida para ajuste fino: reentrenar con `lerobot-train` sobre variaciones de la tarea (otro objeto, otra posición) para medir cuántos episodios adicionales hacen falta antes de degradar el éxito.
- Pruebas de robustez y análisis de fallos: ejecutar la política repetidamente cambiando iluminación, posición inicial del cubo o presencia de distractores para documentar la tasa de éxito real, actualmente no publicada.
- Demostración de integración hardware-software: usar `lerobot-rollout` con `--strategy.type=base` para validar cableado, calibración de brazos y sincronía de cámaras antes de invertir en datos.
- Evaluación de sim2real: replicar la tarea en simulador y comparar el comportamiento de esta política entrenada en real con su equivalente entrenada en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasa de éxito, número de ensayos, ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks (que, por otra parte, no aplican a una política robótica). Los únicos datos cuantitativos verificables son los de entrenamiento: 40.000 pasos, batch 32, AdamW, lr 1e-5, semilla 1000, y las estadísticas del dataset (100 episodios, 25.365 fotogramas, 30 FPS).

## Requisitos de hardware

- Peso de los parámetros: ~207 MB en fp32 y ~103 MB en fp16 (51.668.614 parámetros; el repositorio ocupa 0,2 GB).
- VRAM estimada para inferencia: aproximadamente 1-2 GB contando pesos, activaciones y el preprocesado de dos imágenes de 480×640 por paso. Es una estimación, no una medida publicada.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050/3060, RTX 4090) es suficiente en términos de memoria. También es viable en Jetson Orin Nano/NX, habituales en montajes SO-100.
- CPU: la inferencia en CPU es posible por tamaño, pero el bucle de control a 30 FPS impone un presupuesto de 33,3 ms por paso; no hay latencias medidas publicadas que permitan confirmar que se cumple, especialmente con dos cámaras.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) sobre PyTorch con CUDA es la vía documentada. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- Almacenamiento: 0,2 GB de repositorio, más el dataset si se va a reentrenar.
- Latencia y throughput: no disponible. El diseño de action chunking amortiza la inferencia sobre varios pasos de control, pero no se publica el tamaño de chunk ni los tiempos medidos.

## Comparativa con modelos similares

Los datos de terceros provienen de la documentación pública de cada método, no de la información proporcionada en esta ficha; se marcan como no verificados en el contexto de este modelo.

| Modelo | Parametros | Entrada | Tipo de politica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_v2 (este modelo) | 51,7 M | Estado 6 dims + 2 camaras 480×640 | ACT, una tarea, un robot (`so_follower`) | apache-2.0 | Hugging Face Hub via LeRobot |
| ACT de referencia (paper 2304.13705) | ~80 M en la configuracion bimanual del paper (dato no verificado) | Estado + camaras, configuracion ALOHA | ACT multi-tarea bimanual | no disponible | Codigo en repositorio de los autores |
| Diffusion Policy (Chi et al.) | no disponible (depende de la configuracion) | Estado + camaras | Politica de difusion, predice secuencias de acciones | no disponible | Implementaciones publicas, incluida LeRobot |
| SmolVLA | 450 M (dato no verificado) | Vision + lenguaje + estado | VLM condicionado por lenguaje, multi-tarea | no disponible | Hugging Face Hub via LeRobot |

Diferencias clave: act_pick_v2 es el más pequeño de la comparativa y el único de alcance estrictamente mono-tarea y mono-robot; a cambio, su huella de memoria y su coste de despliegue son los más bajos. Frente a SmolVLA pierde condicionamiento por lenguaje y generalización entre tareas, pero requiere aproximadamente una novena parte de parámetros.

## Limitaciones y advertencias

- Especialización extrema: una sola tarea, un solo tipo de robot (`so_follower`) y una configuración de cámaras fija. No hay evidencia de generalización a otros objetos, posiciones, mesas o brazos.
- Dataset muy pequeño: 100 episodios y 25.365 fotogramas de un único operador. Es esperable sobreajuste a la distribución de posiciones, iluminación y estilo de teleoperación del operador original; el sesgo del demostrador se hereda directamente.
- Sin evaluación publicada: no se conoce la tasa de éxito real, ni siquiera en las condiciones exactas de entrenamiento. Cualquier despliegue debe medirse antes de asumir un rendimiento.
- Fallos silenciosos: una política de imitación puede generar trayectorias plausibles pero incorrectas sin señal de confianza. No incorpora detección de errores, parada de seguridad ni estimación de incertidumbre.
- Sin comprensión de lenguaje: la cadena de tarea que se pasa en `lerobot-rollout` sirve para identificar el episodio; no hay evidencia de que el modelo esté condicionado por ella, por lo que no se le pueden pedir tareas nuevas con una instrucción distinta.
- Dependencia del hardware: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`observation.images.wrist`, `observation.images.overhead`), y la resolución debe ser 480×640. Cualquier cambio en el montaje invalida la política.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe un equivalente funcional (acciones incoherentes con la escena) ante entradas fuera de distribución.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. Conviene verificar la licencia del dataset `kartikbud/pick_v2` antes de reutilizar los datos.
- Ausencia de soporte: 0 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento documentado. No hay garantía de actualizaciones ni de compatibilidad con versiones futuras de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kartikbud/act_pick_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/kartikbud/pick_v2
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 y https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kartikbud/pick_v2

Nota sobre la busqueda web: los resultados devueltos corresponden a una comercializadora de energia alemana (Rabot Energy) y a contenidos sobre tarifas electricas, sin ninguna relacion con este modelo. No se ha encontrado informacion adicional relevante en la busqueda.
