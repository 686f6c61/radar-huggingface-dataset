# arkojit1/pi05_stack_yellow_on_red_e112_bs64_8k_20k

## Resumen

π₀.₅ (pi05) es un modelo de política robótica (vision-language-action, VLA) desarrollado originalmente por Physical Intelligence y liberado en LeRobot. Esta ficha concreta corresponde a un *fine-tuning* del checkpoint base `lerobot/pi05_base` (revisión `a538eb27`) realizado por el usuario `arkojit1` sobre un conjunto de 112 episodios de manipulación con un brazo Franka, teleoperado con un dispositivo Haply. El modelo resultante está especializado en una única tarea: apilar un bloque amarillo sobre uno rojo.

El modelo combina un codificador visual SigLIP y un *backbone* de lenguaje Gemma-2B congelados, junto con un "action expert" entrenable que genera acciones de efector final en chunks de 50 pasos mediante *flow matching*. Con 3.616.757.520 parámetros totales y un repositorio de 7,5 GB en formato safetensors, es un modelo de gran tamaño para robótica, pensado para ejecutarse en GPU de datacenter (el entrenamiento se hizo en 8× MI300X).

Es relevante como ejemplo práctico del flujo de trabajo LeRobot 0.4.4 para *fine-tuning* de políticas VLA sobre datasets pequeños y específicos, y como referencia de las decisiones de configuración (congelado del *backbone*, normalización por cuantiles, sin aumento de datos) que caracterizan a este tipo de adaptaciones. No obstante, se trata de un checkpoint de investigación con cero descargas y sin licencia declarada, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): SigLIP (visión) + Gemma-2B (lenguaje) congelados + action expert entrenable, con flow matching |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea, no a diálogo general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence: un codificador visual SigLIP y un modelo de lenguaje Gemma-2B que permanecen congelados (`train_expert_only=true`), y un "action expert" que se entrena para predecir acciones de efector final mediante *flow matching*. La entrada de estado es de 4 dimensiones y la acción es un delta de efector final también de 4 dimensiones. Las tres cámaras del dataset (`observation.images.wrist`, `observation.images.scene0`, `observation.images.scene1`) se mapean a los tres slots de imagen del modelo base en ese orden (equivalente a `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb`), sin renombrado y con `empty_cameras=0`.

El *fine-tuning* se realizó con LeRobot 0.4.4 sobre el dataset `arkojit1/haply_stack_yellow_red` (revisión `f7e7512`): 112 episodios de Franka, una única tarea ("Stack the yellow block on the red block."), con los episodios 0–99 para entrenamiento y los 100–111 como *holdout*. Se planificaron 20.000 pasos (768,8 pasos por época, 26 épocas) con AdamW (LR pico 2,5e-5, betas 0.9/0.95, weight decay 0,01, grad clip 1,0), *schedule* coseno con *warmup* de 666 pasos y suelo de 2,5e-6, en bf16, batch global 64 sobre 8× MI300X. La normalización de estado y acción es por cuantiles (q01–q99), sin aumento de datos, con `chunk_size` y `n_action_steps` de 50. Este checkpoint es el paso 8.000 (10,4 épocas), con *eval loss* de 0,1105 y *train loss* de 0,094; el mejor *eval* del run fue 0,1085 en el paso 4.000.

## Capacidades

- Generación de acciones de manipulación robótica de efector final (4-D) a partir de observaciones visuales (tres cámaras) y estado (4-D).
- Ejecución de una única tarea de apilamiento: colocar el bloque amarillo sobre el bloque rojo.
- Predicción de *chunks* de 50 acciones por inferencia (`chunk_size=50`, `n_action_steps=50`).
- Comprensión de instrucciones de tarea en lenguaje natural a través del *backbone* Gemma-2B (aunque el entrenamiento se limita a una sola instrucción).
- No soporta *tool calling*, ni razonamiento multi-paso general, ni diálogo multilingüe; es una política de control, no un asistente.
- No dispone de modo *thinking*, visión general, audio ni capacidades multimodales fuera del pipeline robótico.

## Casos de uso

- **Investigación en manipulación con Franka**: reproducir el experimento de apilamiento amarillo-sobre-rojo con teleoperación Haply, usando el checkpoint como referencia de *fine-tuning* de π₀.₅ sobre datasets pequeños.
- **Punto de partida para nuevos *fine-tunings***: servir como inicialización para tareas de apilamiento o colocación con un brazo Franka y tres cámaras, aprovechando que el *backbone* está congelado y solo se entrena el *action expert*.
- **Validación de pipelines LeRobot 0.4.4**: probar el flujo de carga con `PI05Policy.from_pretrained` y el *fork* de `transformers` (`fix/lerobot_openpi`) en entornos de laboratorio.
- **Estudio de normalización por cuantiles en robótica**: analizar cómo la normalización q01–q99 de estado y acción afecta a la estabilidad del *flow matching* en tareas de contacto.
- **Comparación de configuraciones de entrenamiento**: contrastar este run (112 episodios, batch 64, paso 8.000) con variantes sobre 40 o 64 episodios para estudiar el efecto del tamaño del dataset en la *eval loss*.
- **Docencia y demostraciones**: ilustrar en un curso o taller el ciclo completo de recogida de datos teleoperados, *fine-tuning* VLA y evaluación con *holdout* en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas del objetivo de entrenamiento: *eval loss* de 0,1105 (paso 8.000) y *train loss* de 0,094, con una dispersión punto a punto de aproximadamente ±0,01 en el *holdout*. El autor advierte explícitamente que esta *eval loss* no es una tasa de éxito de tarea y no es comparable con modelos entrenados sobre otras revisiones del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.616.757.520 parámetros en bf16 se requieren del orden de 7,2 GB solo para pesos, más activaciones y buffers del pipeline LeRobot, por lo que en la práctica se necesita una GPU con al menos 16–24 GB.
- GPU recomendadas: el entrenamiento se realizó en 8× AMD MI300X; para inferencia se recomienda A100, H100 o MI300X.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en bf16, aunque no hay confirmación oficial; en GPUs de 12 GB o menos no cabría sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: LeRobot 0.4.4 con el *fork* de `transformers` de Hugging Face (rama `fix/lerobot_openpi`) y `PI05Policy.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_e112_bs64_8k_20k | 3.616.757.520 | no disponible | Apilamiento amarillo-sobre-rojo (Franka, 3 cámaras) | no disponible | HuggingFace (0 descargas) |
| lerobot/pi05_base | no disponible en la información | no disponible | Política VLA base π₀.₅ | no disponible en la información | HuggingFace (modelo base) |
| Variantes sobre `Ameyapores/haply_stack_yellow_red` (40 o 64 episodios) | no disponible | no disponible | Apilamiento similar | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes; el propio autor indica que las *eval loss* no son comparables porque los *holdouts* difieren.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha visto una instrucción y una tarea; no generaliza a otras tareas de manipulación.
- *Eval loss* no equivale a tasa de éxito: el autor lo advierte explícitamente; no hay evaluación de éxito real en robot.
- Dataset pequeño (112 episodios, 100 de entrenamiento) y sin aumento de datos, lo que limita la robustez frente a variaciones de iluminación, posición o apariencia.
- Sesgos conocidos: no documentados, pero al entrenarse con un único entorno y un único objeto, heredará los sesgos de ese *setup* físico.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí puede generar acciones inválidas o inseguras fuera de la distribución de entrenamiento.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base `lerobot/pi05_base`.
- Dependencia de versiones concretas: requiere LeRobot 0.4.4 y un *fork* específico de `transformers`, lo que complica la reproducibilidad y el despliegue en producción.
- Cero descargas y cero *likes*: no hay validación comunitaria ni evidencia de uso externo.
- El checkpoint elegido (paso 8.000) no es el de menor *eval loss* del run (paso 4.000, 0,1085); se seleccionó por petición, según el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_e112_bs64_8k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/arkojit1/haply_stack_yellow_red
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- *Fork* de transformers para π₀: rama `fix/lerobot_openpi` del repositorio de Hugging Face (no se proporciona URL directa en la información disponible)
