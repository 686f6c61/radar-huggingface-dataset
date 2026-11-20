# Matghost7/act_franka_sweep_v3

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `Matghost7/act_franka_sweep_v3`, es una política entrenada con LeRobot sobre un brazo Franka Panda en modalidad kinestésica para la tarea específica "Sweep the orange cube" (barrer el cubo naranja).

El modelo consume observaciones de estado articular de 16 dimensiones y dos flujos visuales (cámara de muñeca RGB y profundidad), ambos a 480x640 píxeles, y produce vectores de acción de 16 dimensiones. Cuenta con aproximadamente 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

Es relevante como ejemplo canónico de flujo de trabajo de imitación robótica end-to-end con LeRobot: un dataset pequeño (49 episodios, 6842 fotogramas a 10 FPS), un entrenamiento de 50 000 pasos y una política lista para ejecutarse con `lerobot-rollout`. No obstante, se trata de un artefacto experimental sin evaluación publicada ni licencia declarada, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.689.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana de observación de un paso con historial de acciones por chunk) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | franka_panda_kinesthetic |
| Camaras | wrist, wrist_depth |
| Entrada de estado | observation.state, shape (16,) |
| Entrada visual | observation.images.wrist (3, 480, 640) y observation.images.wrist_depth (3, 480, 640) |
| Salida de accion | action, shape (16,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT descrita en el paper arXiv:2304.13705. Se trata de un transformer que combina un codificador visual (procesa las imágenes de muñeca RGB y de profundidad) con un codificador de estado y un decodificador que genera chunks de acciones (secuencias cortas de comandos) en lugar de una única acción por paso. Esta predicción por chunks mitiga el problema de acumulación de errores típico de las políticas paso a paso y suaviza la ejecución. El modelo incluye además una cabeza de estilo CVAE (variable latente) para modelar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Matghost7/franka_sweep_cube_v3_merged`, compuesto por 49 episodios y 6842 fotogramas a 10 FPS de teleoperación kinestésica sobre un Franka Panda para la tarea "Sweep the orange cube". La configuración fue de 50 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni aumentos de datos adicionales; es aprendizaje por imitación supervisado puro sobre demostraciones.

## Capacidades

- Generación de comandos de acción de 16 dimensiones para un Franka Panda en modalidad kinestésica.
- Percepción visual multimodal: procesa simultáneamente imagen RGB de muñeca y mapa de profundidad.
- Predicción de chunks de acciones para ejecución suave y estable.
- Ejecución de una única tarea especializada: barrer el cubo naranja.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de pensamiento (thinking), audio ni visión general fuera del pipeline robótico.

## Casos de uso

- Automatización de barrido de objetos en línea de montaje: la política ejecuta la tarea "Sweep the orange cube" de forma autónoma sobre un Franka Panda, adecuada para demostrar flujos de manipulación repetitiva con un solo objeto.
- Base para fine-tuning con nuevos objetos: al ser una política ACT ligera (51,7 M de parámetros) y entrenada con LeRobot, sirve como punto de partida para reentrenar con datasets propios de barrido o empuje de otras geometrías.
- Prototipado de pipelines de imitación robótica: útil en entornos de investigación para validar el ciclo completo grabación de datos, entrenamiento y despliegue con `lerobot-rollout`.
- Docencia y formación en robótica de manipulación: ejemplo reproducible y de bajo coste computacional para enseñar aprendizaje por imitación con datos kinestésicos.
- Evaluación de percepción RGB-D en control: permite estudiar cómo influye la cámara de profundidad en tareas de contacto como el barrido.
- Benchmark interno de políticas ACT: sirve como referencia base para comparar variantes de arquitectura o configuraciones de entrenamiento en la misma tarea.
- Demostraciones en ferias o laboratorios: política ligera que cabe en GPU de consumo y puede ejecutarse en tiempo real a 10 FPS o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB), la inferencia en FP32 requiere del orden de 0,2-0,5 GB de VRAM para pesos, más el coste de los dos flujos de imagen 480x640.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; se sugiere RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento y despliegue.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más; no se dispone de cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) como vía documentada; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles; el dataset fue grabado a 10 FPS, lo que sugiere que el bucle de control opera en ese orden de magnitud, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matghost7/act_franka_sweep_v3 | 51,7 M | estado (16,) + RGB 480x640 + profundidad 480x640 | Barrido de cubo con Franka Panda | no disponible | Hugging Face (0 descargas, 0 likes) |
| Políticas ACT genéricas de LeRobot | variable | variable según dataset | Manipulación diversa | según repositorio | Hugging Face |
| Diffusion Policy (referencia) | variable | variable | Manipulación por imitación | según implementación | Repositorios de investigación |
| Otros checkpoints de Franka en LeRobot Hub | variable | variable | Tareas de manipulación | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, entradas y disponibilidad.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de éxito en robot real; se desconoce la tasa de acierto de la política.
- Especialización extrema: solo ha sido entrenada para la tarea "Sweep the orange cube" y no generalizará a otros objetos, posiciones o tareas sin reentrenamiento.
- Dataset muy reducido (49 episodios, 6842 fotogramas), lo que incrementa el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de cámara o distractores.
- Dependencia de la configuración exacta de cámaras y robot (`franka_panda_kinesthetic`, cámaras `wrist` y `wrist_depth`); cambios en la disposición invalidan la política.
- Licencia no declarada: no se puede asumir uso comercial sin aclaración explícita del autor.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (no aplica al no ser un modelo de lenguaje).
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: artefacto experimental sin validación comunitaria.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en entornos con restricciones de memoria.
- Riesgo de comportamiento errático fuera de la distribución de entrenamiento (posiciones iniciales no vistas, objetos distintos al cubo naranja).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Matghost7/act_franka_sweep_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Matghost7/franka_sweep_cube_v3_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Matghost7/franka_sweep_cube_v3_merged
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
