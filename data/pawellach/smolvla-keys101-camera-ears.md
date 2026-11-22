# PawelLach/smolvla-keys101-camera-ears

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y de estado, y de instrucciones en lenguaje natural. Este repositorio concreto, `PawelLach/smolvla-keys101-camera-ears`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset propio de 595 episodios y 29.522 fotogramas, orientado a una tarea muy específica: pulsar teclas concretas de un teclado con un robot SO-101.

El modelo resuelve el problema de la imitación visual-motora de bajo coste: convierte tres cámaras RGB de 256×256 píxeles más un vector de estado de 6 dimensiones en un vector de acción de 6 dimensiones, a 30 FPS. Su relevancia radica en que demuestra que un VLA de 450 millones de parámetros puede ejecutarse en hardware de consumo, algo impensable en VLA de mayor tamaño como OpenVLA, y que el ajuste fino por tarea es accesible para laboratorios pequeños o aficionados con un SO-101.

La ficha describe un checkpoint de investigación con cero descargas y cero valoraciones en el momento de su publicación, sin resultados de evaluación reportados por el autor. Su interés es, por tanto, metodológico y reproducible más que de producción: sirve como ejemplo de pipeline completo de imitación con LeRobot 0.7.1 y como base para experimentos de manipulación fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta basada en SmolVLA; no se detalla la composición interna en la información disponible |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés: "press D4", "press E3", etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Especificaciones adicionales del pipeline:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front`, `ears` (tres entradas visuales: camera1, camera2, camera3) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida de acción | `action`, forma `(6,)` |
| Resolución de imagen | 256×256, 3 canales |
| Frecuencia de control | 30 FPS |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de ajuste | `PawelLach/so101-keys101-12keys` (595 episodios, 29.522 fotogramas) |
| Tamaño del repositorio | 7,5 GB |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para producir comandos motores condicionados por la instrucción de tarea. La información disponible no detalla la disposición exacta de sus componentes internos ni el número de capas, dimensión oculta o mecanismo de atención; únicamente se confirma que es un VLA compacto pensado para hardware de consumo, según el paper arXiv:2506.01844 referenciado en la model card.

El ajuste fino se realizó con LeRobot 0.7.1 durante 6.000 pasos, con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El dataset contiene 595 episodios y 29.522 fotogramas a 30 FPS, con doce tareas de pulsación de teclas ("press D4", "press E3", "press A4", "press E4", "press D3", "press G3", "press G4", "press C4", "press A3", "press C3", "press F4", "press F3"). No se documenta si hubo RLHF, DPO ni ninguna fase de alineación posterior; se trata de aprendizaje por imitación supervisado sobre demostraciones de teleoperación. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal en este checkpoint concreto.

## Capacidades

- Control robótico de manipulación fina: genera acciones de 6 dimensiones para un brazo SO-101 a partir de tres vistas de cámara y del estado de las articulaciones.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("press D4", "press C3", etc.) y el modelo selecciona la tecla objetivo entre doce posibles.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos RGB de 256×256, incluyendo una vista frontal y una vista "ears" (orejas) montada en el robot.
- Ejecución en bucle cerrado a 30 FPS: apta para control reactivo de baja latencia.
- Despliegue en hardware de consumo: herencia directa de SmolVLA, que el paper describe como ejecutable en GPUs de gama consumer.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes conversacionales, visión general, audio ni modo "thinking". Es un modelo puramente motor, no un asistente de texto.

## Casos de uso

- Automatización de pruebas de teclado en fábrica: el modelo puede pulsar teclas concretas de forma repetible sobre un dispositivo bajo test, usando la instrucción de texto para seleccionar la tecla y las tres cámaras para localizarla, con 30 FPS de control.
- Investigación en imitación de manipulación fina: sirve como punto de partida reproducible (6.000 pasos, lote 64, LR 1e-4) para estudiar cómo afecta el número de cámaras o la resolución a la precisión de pulsación en objetos pequeños.
- Base para ajuste fino con datasets propios: al estar construido sobre `lerobot/smolvla_base` y documentarse el comando `lerobot-train`, un laboratorio puede reentrenar con su propio dataset de SO-101 en pocas horas de GPU.
- Docencia y formación en robótica de bajo coste: el par SO-101 + SmolVLA permite montar un laboratorio de VLA con hardware asequible, sin necesidad de GPUs de centro de datos.
- Benchmark de pipelines LeRobot: el repositorio incluye comandos de `lerobot-rollout` y `lerobot-train`, lo que lo convierte en un caso de prueba útil para validar versiones de LeRobot (entrenado con 0.7.1) y la compatibilidad de checkpoints.
- Prototipado de interfaces humano-robot por lenguaje: permite experimentar con instrucciones textuales cortas como única interfaz de mando sobre una tarea física acotada.
- Reproducción de experimentos de VLA compactos: al ser un ajuste fino público con dataset asociado, facilita la comparación de recetas de entrenamiento entre grupos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito por tarea, ni comparaciones con otros checkpoints, ni métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros, una estimación en FP32 rondaría 1,8 GB solo de pesos, y en BF16/FP16 unos 0,9 GB; a ello hay que sumar el codificador visual para tres cámaras de 256×256 y los buffers de activaciones. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. El paper de SmolVLA afirma que el modelo puede desplegarse en hardware de consumo, pero este checkpoint no especifica modelos concretos.
- ¿Cabe en GPU consumer? Por el número de parámetros, es plausible que quepa en GPUs consumer con 8 GB o más de VRAM, pero no hay confirmación oficial para este repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), tal y como documenta la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA de control motor.
- Latencia y throughput: el sistema opera a 30 FPS según el dataset de entrenamiento, pero no se publican medidas de latencia de inferencia ni de throughput real en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `PawelLach/smolvla-keys101-camera-ears` | 450 M | VLA (ajuste fino de SmolVLA) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la información | VLA base | no disponible | no disponible en la información | Hugging Face (modelo base citado) |
| OpenVLA | no disponible en la información | VLA | no disponible | no disponible en la información | no disponible en la información |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks, contexto ni licencia de `lerobot/smolvla_base` ni de alternativas como OpenVLA, RDT-1B o π0 en esta ficha, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce la fiabilidad del checkpoint fuera del conjunto de entrenamiento.
- Especialización extrema: solo sabe ejecutar doce tareas de pulsación de teclas ("press D4" a "press F3") sobre un teclado concreto; no generaliza a otras tareas ni objetos.
- Dependencia del montaje físico: las cámaras `front` y `ears`, sus índices y su calibración deben coincidir exactamente con los del entrenamiento; cualquier cambio de posición invalida las predicciones.
- Sesgos de dataset: 595 episodios de un único operador y un único entorno implican un sesgo fuerte hacia posiciones, iluminación y estilo de teleoperación concretos.
- Riesgo de sobreajuste y alucinación motora: con 6.000 pasos sobre 29.522 fotogramas, el modelo puede producir acciones plausibles pero incorrectas ante configuraciones no vistas, sin señal de incertidumbre.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar los avisos de atribución del modelo base y de LeRobot.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación registrada como 2026-11-22, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawelLach/smolvla-keys101-camera-ears
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/PawelLach/so101-keys101-12keys
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=PawelLach/so101-keys101-12keys
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
