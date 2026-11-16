# hatakeyama8490836/smolvla_blue_black

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, publicada por el usuario hatakeyama8490836, es un *checkpoint* fine-tuneado de SmolVLA para una tarea específica de manipulación: introducir un conector azul y negro en una zona cuadrada negra. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras) y produce acciones de 6 dimensiones a 30 FPS.

El modelo cuenta con 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,2 GB. Está entrenado sobre el dataset `blue-and-black_merged`, compuesto por 60 episodios y 34.669 fotogramas, con 1.000 pasos de entrenamiento, batch size de 8 y optimizador AdamW con learning rate 1e-4.

Su relevancia radica en que SmolVLA está pensado para desplegarse en hardware de consumo, lo que democratiza la experimentación con políticas VLA en robótica real sin necesidad de clústeres de GPU. No obstante, esta instancia concreta es un modelo de tarea única, sin resultados de evaluación publicados y sin licencia declarada, por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Cámaras de entrada | side, wrist, top |
| Entrada de estado | observation.state (6,) |
| Salida de acción | action (6,) |
| Resolución de imágenes | side: 360x640; wrist: 720x1280; top: 360x640 |
| Dataset de entrenamiento | hatakeyama8490836/blue-and-black_merged |
| Episodios / fotogramas | 60 / 34.669 a 30 FPS |
| Pasos de entrenamiento | 1.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje compacto para generar acciones motoras directamente a partir de observaciones multimodales y una instrucción en lenguaje natural. La arquitectura sigue el paradigma VLA descrito en el paper arXiv:2506.01844, orientado a reducir el coste computacional frente a modelos VLA de mayor tamaño y permitir inferencia en hardware de consumo. El modelo recibe tres flujos de imagen (cámara lateral, de muñeca y superior) junto con el estado articular del robot, y emite un vector de acción de 6 dimensiones.

El entrenamiento de este *checkpoint* se realizó mediante aprendizaje por imitación supervisado sobre el dataset `blue-and-black_merged`, con 60 episodios teleoperados (34.669 fotogramas a 30 FPS) para la tarea "Move the blue-and-black connector into the black square area". La configuración reportada es de 1.000 pasos, batch size 8, AdamW y learning rate 1e-4, con semilla 1000, usando LeRobot 0.6.2. No se especifica en la información disponible si hubo RLHF, DPO ni detalles sobre la composición del corpus de preentrenamiento del modelo base SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para el robot `so_follower` a partir de observaciones visuales y de estado.
- Fusión multimodal de tres cámaras (lateral, muñeca y superior) con resolución variable por cámara.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto (`--task="Move the blue-and-black connector into the black square area."`).
- Aprendizaje por imitación: reproduce la política aprendida de las demostraciones teleoperadas del dataset.
- Inferencia en tiempo real a 30 FPS, coherente con la tasa de captura del dataset.
- Despliegue en hardware de consumo según la descripción del modelo base SmolVLA.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni visión fuera del contexto robótico.

## Casos de uso

- Automatización de inserción de conectores: el modelo ejecuta la tarea de colocar un conector azul y negro en una zona cuadrada negra, adecuado para líneas de ensamblaje de componentes electrónicos donde la posición es semiestructurada.
- Investigación en aprendizaje por imitación: sirve como *baseline* reproducible para comparar variantes de SmolVLA con el mismo dataset y configuración de entrenamiento (1.000 pasos, batch 8, lr 1e-4).
- Prototipado rápido en robótica de sobremesa: con 450 M de parámetros y 1,2 GB de pesos, permite iterar en estaciones de trabajo con GPU de consumo sin infraestructura dedicada.
- Reentrenamiento con nuevos datasets: la CLI `lerobot-train` permite adaptar la política a otras tareas de manipulación partiendo de la misma receta.
- Evaluación de pipelines de teleoperación: el dataset de 60 episodios y 34.669 fotogramas sirve para validar flujos de captura, calibración de cámaras y sincronización a 30 FPS.
- Demostraciones educativas: ejemplo completo de extremo a extremo (grabación, entrenamiento, rollout) con LeRobot para cursos de robótica e IA aplicada.
- Validación de despliegue en robot `so_follower`: el comando `lerobot-rollout` con `--strategy.type=base` permite probar la política en hardware real durante una duración configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha medido la tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el estado del codificador visual y los buffers de las tres cámaras.
- GPU recomendadas: no se especifican en la información disponible. El modelo base SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la documentación proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de política robótica.
- Latencia y throughput: la política opera a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia ni throughput por hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_blue_black (este) | 450.046.176 | no disponible | Manipulación robótica (tarea única) | no disponible | Hugging Face, safetensors |
| SmolVLA (base, Hugging Face) | no disponible en la información | no disponible | VLA generalista para robótica | no disponible en la información | Hugging Face / LeRobot |
| Alternativas VLA de mayor tamaño (p. ej. familias OpenVLA, π0) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para "Move the blue-and-black connector into the black square area"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: la model card declara que no se han proporcionado métricas de éxito en robot real, por lo que se desconoce su fiabilidad.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- Idiomas no declarados: no se documenta el soporte multilingüe de la instrucción de tarea.
- Dependencia de hardware específico: requiere un robot `so_follower` y tres cámaras con los nombres y resoluciones exactos (`side`, `wrist`, `top`) usados en el entrenamiento.
- Dataset pequeño: 60 episodios y 34.669 fotogramas son un volumen reducido, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distractores.
- Entrenamiento corto: 1.000 pasos con batch size 8 es una configuración ligera; no se documenta convergencia ni curvas de pérdida.
- Riesgo de fallo silencioso: al ser una política de imitación sin mecanismos de verificación, puede ejecutar acciones incorrectas sin señal de error.
- Sin información sobre sesgos: no se han publicado análisis de sesgo, aunque en robótica los sesgos provienen principalmente de la distribución del dataset de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/smolvla_blue_black
- Dataset de entrenamiento: https://huggingface.co/datasets/hatakeyama8490836/blue-and-black_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hatakeyama8490836/blue-and-black_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
