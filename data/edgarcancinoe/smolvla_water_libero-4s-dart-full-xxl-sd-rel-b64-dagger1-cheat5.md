# edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat5

## Resumen

SmolVLA es un modelo vision-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico por imitación con un coste computacional reducido y capacidad de despliegue en hardware de consumo. Esta ficha concreta es un fine-tuning del checkpoint base `lerobot/smolvla_base` (604,9 millones de parámetros) especializado en una tarea única de manipulación: regar tres plantas diferenciadas por posición (izquierda, centro, derecha) con un brazo Franka Panda y dos cámaras RGB.

El modelo resuelve el problema de la política de control visuomotor específica de tarea: dado un estado articular de 8 dimensiones y dos imágenes de 256x256 píxeles, predice un vector de acción de 7 dimensiones a la frecuencia de control del dataset (20 FPS). Se entrenó mediante imitación conductual con 1344 episodios y 250.625 frames, e incorpora datos de intervención humana vía DAgger (el sufijo "dagger1" del identificador), lo que mitiga el desajuste de distribución típico de la clonación de comportamiento pura.

Su relevancia radica en que demuestra el flujo completo de LeRobot para políticas VLA pequeñas: un modelo de 1,2 GB en safetensors, licencia Apache 2.0, entrenable y desplegable con la CLI de LeRobot en GPUs de consumo. No obstante, es un artefacto de investigación con evaluación formal pendiente y alcance restringido a la tarea y el robot especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), política de imitación sobre backbone VLM compacto; detalles internos de capas no disponibles |
| Parámetros totales | 604.934.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje conversacional) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`; repo de 1,2 GB) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.image` | Visual | (3, 256, 256) |
| `observation.images.image2` | Visual | (3, 256, 256) |
| `observation.state` | Estado | (8,) |
| `action` | Acción | (7,) |

Configuración de entrenamiento:

| Ajuste | Valor |
|---|---|
| Pasos | 8000 |
| Tamaño de lote | 64 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Robot | `panda` |
| Cámaras | `image`, `image2` |

## Arquitectura y entrenamiento

SmolVLA es una política vision-language-action que combina un codificador visual y un modelo de lenguaje compacto con un cabezal de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. El modelo procesa dos flujos de imagen de 256x256 y el estado proprioceptivo de 8 dimensiones, y emite acciones continuas de 7 grados de libertad (6 de pose más pinza, según la convención estándar de 7 dimensiones del robot Panda en LeRobot). El checkpoint parte de `lerobot/smolvla_base` y se fine-tunea de extremo a extremo para la tarea de riego.

El entrenamiento se realizó sobre el dataset `edgarcancinoe/water_pour_dagger1_cheat5`, con 1344 episodios, 250.625 frames a 20 FPS y tres instrucciones de tarea ("Water the left plant", "Water the middle plant", "Water the right plant"). El identificador indica recogida de datos con DAgger (intervenciones humanas correctivas) y una variante "cheat5", presumiblemente relacionada con el sesgo o la inicialización de la política durante la recogida, aunque no se documenta su significado. La configuración reportada es de 8000 pasos con lote 64 y AdamW a 1e-4. No se especifican en la información disponible el número de tokens de preentrenamiento del modelo base, la composición del corpus multimodal original ni si se aplicaron etapas de RLHF o DPO; en el contexto VLA, el ajuste es de imitación supervisada, no de preferencias.

## Capacidades

- Generación de acciones de control continuo de 7 dimensiones para un brazo Franka Panda a partir de observaciones visuales y propioceptivas.
- Percepción visual estéreo mediante dos cámaras RGB de 256x256, lo que permite desambiguar la planta objetivo por posición espacial.
- Condicionamiento por instrucción en lenguaje natural entre tres tareas predefinidas de riego.
- Ejecución de políticas de imitación multi-paso en bucle cerrado con realimentación visual a 20 FPS.
- Robustez parcial ante desviaciones del estado visitado gracias al entrenamiento con datos DAgger.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico: es una política motora, no un agente conversacional.
- Capacidades multilingües no disponibles; las instrucciones de tarea están en inglés.
- No dispone de modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Riego automatizado de plantas en laboratorio: el modelo recibe las dos imágenes y el estado del Panda y ejecuta la secuencia de aproximación, agarre de la regadera y vertido sobre la planta indicada, con la instrucción como selector de objetivo.
- Investigación en imitación conductual: sirve como referencia reproducible de un pipeline LeRobot completo (grabación, DAgger, entrenamiento de 8000 pasos y despliegue) para comparar variantes de recogida de datos.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: al ser una política de 604,9 M de parámetros entrenada en un único escenario, es un banco de pruebas útil para medir degradación por desajuste de dominio.
- Prototipado de manipulación con hardware de consumo: su tamaño (1,2 GB) permite iterar en una sola GPU consumer, acortando ciclos de experimento frente a VLA de mayor escala.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten demostrar el ciclo completo de DAgger con intervenciones humanas en un caso concreto y acotado.
- Base para fine-tuning en tareas análogas de vertido o trasvase: al derivar de `lerobot/smolvla_base`, puede reajustarse con nuevos datasets manteniendo la interfaz de observaciones y acciones.
- Validación de infraestructura de despliegue: útil para probar `lerobot-rollout`, calibración de cámaras y latencias de inferencia antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de tasas de éxito en robot real, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 604,9 M de parámetros en fp32 el peso ocupa aproximadamente 2,4 GB, y en fp16 unos 1,2 GB, a lo que hay que sumar activaciones de los dos codificadores visuales y del backbone de lenguaje.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería acomodar el modelo en precisión reducida; una RTX 4090, A100 o H100 ofrecen margen amplio y menor latencia.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas de gama media-alta (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=<repo>`; el ecosistema LeRobot es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, lo que fija un presupuesto de 50 ms por paso de inferencia si se quiere replicar el ritmo de entrenamiento; no se confirma que el modelo lo cumpla en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat5`) | 604,9 M | 2 imágenes 256x256 + estado (8,) | Riego de plantas con Panda | apache-2.0 | Hugging Face, 32 descargas |
| `lerobot/smolvla_base` | no disponible en la información (mismo backbone SmolVLA) | Entradas multimodales genéricas | Política VLA base preentrenada | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | Depende de la configuración | Imitación visuomotora | no disponible | Ecosistema LeRobot |
| VLA de mayor escala (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este checkpoint ni datos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara que no se han aportado resultados, por lo que no existe evidencia publicada de tasa de éxito en robot real.
- Especialización extrema: solo cubre tres instrucciones de riego sobre un Panda con dos cámaras; fuera de ese dominio se espera un fallo sistemático.
- Dependencia de la configuración sensorial: los nombres y la resolución de las cámaras (`image`, `image2`, 256x256) y la dimensionalidad del estado (8,) deben coincidir exactamente con los del entrenamiento.
- Riesgo de sobreajuste al escenario: 8000 pasos sobre 1344 episodios de un único entorno pueden producir memorización de posiciones y condiciones de iluminación.
- Sesgos conocidos: no documentados; en robótica de imitación es habitual el sesgo hacia las trayectorias y posiciones presentes en la recogida, con degradación ante objetos desplazados.
- Riesgo de alucinación en sentido amplio: la política puede generar acciones plausibles pero incorrectas sin señal de incertidumbre, algo crítico en manipulación física.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea están en inglés y el condicionamiento lingüístico es mínimo.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; el uso en producción física requiere validación y medidas de seguridad independientes.
- Significado no documentado de "cheat5" y de la variante "dart-full-xxl-sd-rel": sin aclaración del autor, no puede asumirse qué modificación introduce respecto a un entrenamiento estándar.
- Fecha de creación del repositorio (2026-10-29) y escaso historial (32 descargas, 0 likes): no hay comunidad ni reportes independientes que validen el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4s-dart-full-xxl-sd-rel-b64-dagger1-cheat5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour_dagger1_cheat5
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=edgarcancinoe/water_pour_dagger1_cheat5
