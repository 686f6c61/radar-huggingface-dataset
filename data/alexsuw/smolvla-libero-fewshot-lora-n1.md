# alexsuw/smolvla-libero-fewshot-lora-n1

## Resumen

El modelo `alexsuw/smolvla-libero-fewshot-lora-n1` es un conjunto de doce adaptadores LoRA entrenados sobre el modelo base `alexsuw/smolvla-libero-fewshot-seen-expert-100k`, que a su vez es una variante de SmolVLA (Vision-Language-Action) de 450 millones de parámetros desarrollado por Hugging Face. El autor, alexsuw, lo ha diseñado para evaluar dos estrategias de aprendizaje por imitación con una sola demostración (few-shot) en el benchmark de robótica LIBERO, concretamente en la suite LIBERO-Goal. El objetivo es conseguir que un modelo base previamente entrenado en tareas vistas (seen) aprenda una nueva tarea objetivo con un único ejemplo, sin perder las habilidades ya adquiridas.

El problema que resuelve es el equilibrio entre adaptación rápida a nuevas tareas y retención de habilidades previas, un desafío común en robótica de manipulación. Para ello, se comparan tres métodos: un ajuste fino naive (todos los parámetros), una variante Target-LoRA que solo entrena el adaptador con datos de la tarea objetivo, y una Replay-LoRA que mezcla un 75% de demostraciones objetivo con un 25% de datos de tareas vistas. Cada método se evalúa en tres tareas objetivo y con dos semillas de entrenamiento, generando doce checkpoints independientes. El repositorio tiene un tamaño de 11.1 GB e incluye tanto los pesos completos (`weights.pt`) como los adaptadores en formato PyTorch (`adapter_model.pt`).

La relevancia de este modelo radica en su enfoque de few-shot para robótica, un área donde la recopilación de datos es costosa. Además, al ser un modelo base de 450M parámetros, es viable ejecutarlo en hardware de consumo, lo que lo hace accesible para investigación y prototipado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) con adaptadores LoRA |
| Parametros totales | 450 millones (modelo base SmolVLA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | other (derivado de `lerobot/smolvla_base`; código Apache-2.0, pesos y datos sujetos a términos de `nvidia/LIBERO_LeRobot_v3`) |
| Formato de pesos | `weights.pt` (PyTorch), `adapter/adapter_model.pt` |

## Arquitectura y entrenamiento

El modelo base es SmolVLA, un modelo de visión-lenguaje-acción de 450 millones de parámetros desarrollado por Hugging Face, diseñado para control robótico a partir de observaciones visuales y instrucciones en lenguaje natural. SmolVLA se basa en un transformer multimodal que procesa imágenes y texto, y genera acciones discretas de control. En este proyecto, se utiliza un checkpoint preentrenado en LIBERO (visto-expert-100k) que se congela y se le añaden adaptadores LoRA para cada tarea.

El entrenamiento se realiza con el dataset `nvidia/LIBERO_LeRobot_v3` y utiliza únicamente la primera demostración registrada de cada tarea objetivo (N=1). Se comparan tres métodos: un ajuste completo de referencia (99,8 millones de parámetros entrenables), Target-LoRA (4.2 millones) y Replay-LoRA (4.2 millones), este último con una mezcla fija de 75% de datos objetivo y 25% de datos vistos (de `libero_90`). No se realizó ninguna optimización de hiperparámetros ni ajuste basado en el éxito final. Cada celda se entrena con semillas 42 y 123, generando 12 checkpoints (3 tareas × 2 métodos × 2 semillas).

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de baja nivel (posiciones y orientaciones) a partir de imágenes y instrucciones en lenguaje natural.
- Aprendizaje por imitación few-shot: con una sola demostración de una tarea nueva, el modelo puede adaptarse a esa tarea específica.
- Retención de tareas previstas: el método Replay-LoRA intenta preservar las habilidades aprendidas en tareas vistas durante el entrenamiento inicial.
- Ejecución en simulación: está validado en el entorno LIBERO (LIBERO-Goal), un benchmark estándar de robótica.
- Compatibilidad con la librería LeRobot de Hugging Face, lo que facilita su integración en pipelines de entrenamiento y evaluación.
- No soporta tool calling, agentes ni capacidades de conversación; es exclusivamente un modelo de acción visual.

## Casos de uso

- Manipulación robótica en entornos simulados: el modelo se puede cargar en un entorno de simulación LIBERO para evaluar su capacidad de ejecutar tareas como abrir cajones, recoger objetos o apilar bloques. Es adecuado porque está entrenado específicamente en ese benchmark y su tamaño compacto permite iteraciones rápidas.
- Prototipado de políticas few-shot: investigadores que necesitan probar si un modelo puede aprender una nueva tarea con un único ejemplo pueden usar este adaptador como punto de partida, sin reentrenar todo el modelo.
- Estudio de retención de habilidades: el método Replay-LoRA ofrece un caso de estudio para analizar cómo mitigar el olvido catastrófico en VLA. Se puede comparar la retención de tareas vistas entre los tres métodos.
- Base para fine-tuning posterior: los adaptadores pueden cargarse y continuar el entrenamiento con más datos de la tarea objetivo, aprovechando el ajuste inicial con una sola demostración.
- Evaluación de generalización few-shot: el conjunto de 12 checkpoints permite medir la variabilidad entre semillas y tareas, útil para análisis de robustez.
- Integración en pipelines de robótica con LeRobot: dado que se usa la librería LeRobot, el modelo se puede combinar con herramientas de captura de datos, evaluación y despliegue en robots reales.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados para las tres métodos, evaluados en 120 episodios de tareas objetivo y 180 episodios de tareas vistas (retención corregida):

| Metodo | Exito en tareas objetivo (120) | Retencion de tareas vistas (180) | Parametros entrenables |
|---|---:|---:|---:|
| Naive N=1 (referencia) | 109/120 (90.8%) | 37/180 (20.6%) | 99,880,992 |
| Target-LoRA N=1 | 99/120 (82.5%) | 19/180 (10.6%) | 4,215,632 |
| Replay-LoRA N=1 | 67/120 (55.8%) | 2/180 (1.1%) | 4,215,632 |

No se han publicado resultados de benchmarks en la informacion disponible que comparen este modelo con otros VLA similares en el mismo entorno.

## Requisitos de hardware

- Inferencia: al ser un modelo de 450M parámetros en FP16, la inferencia requiere aproximadamente 1-2 GB de VRAM, dependiendo de la resolución de imagen y el número de pasos de acción. Es compatible con GPUs de consumo como la RTX 3060, RTX 4060 (8 GB) o superiores.
- Entrenamiento: el ajuste LoRA con 4.2 millones de parámetros se puede realizar en una sola GPU de 8-12 GB, como una RTX 4060 o RTX 3080. El repositorio completo pesa 11.1 GB, pero cada checkpoint individual es mucho menor.
- Despliegue: se puede usar con la librería LeRobot (Python/PyTorch). No es compatible con vLLM, llama.cpp o Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se proporcionan datos específicos; en simulación LIBERO, se espera que la inferencia sea en tiempo real en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SmolVLA (base) | 450M | no disponible | Apache-2.0 (modelo) | VLA general |
| OpenVLA | 7B | no disponible | no disponible | VLA de propósito general |
| RT-2 (Google) | 55B | no disponible | no disponible | VLA de gran escala |

No se dispone de una comparativa directa de rendimiento entre este modelo y OpenVLA o RT-2 en LIBERO. SmolVLA destaca por su tamaño compacto y capacidad de entrenamiento en hardware de consumo, mientras que los otros modelos son más grandes y requieren recursos más potentes.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno LIBERO-Goal; no se ha validado en otros escenarios robóticos o en el mundo real.
- La retención de tareas vistas es baja, especialmente en Replay-LoRA (1.1% de éxito), lo que indica que el método no logra preservar las habilidades previas de forma satisfactoria.
- El uso de una única demostración (N=1) puede producir políticas poco robustas frente a variaciones en la iluminación, posición o ruido del sensor.
- La licencia es "other" y depende de los términos del modelo base `lerobot/smolvla_base` y del dataset `nvidia/LIBERO_LeRobot_v3`. Se debe consultar las condiciones de uso comercial antes de integrarlo en producción.
- No hay información sobre la calidad de los datos de entrenamiento ni sobre posibles sesgos en las demostraciones.
- El repositorio no incluye datos de optimizador, estados de RNG ni rollouts crudos, lo que limita la reproducibilidad completa de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alexsuw/smolvla-libero-fewshot-lora-n1
- Colección SmolVLA LIBERO Few-shot: https://huggingface.co/collections/alexsuw/smolvla-libero-few-shot-6a8b009357482d2b4b9d3c2f
- Código del proyecto: https://github.com/alexsuw/smolvla-libero-fewshot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio de SmolVLA (entrenamiento en LIBERO): https://github.com/goelshivam1210/smolvla
- Otro repo de SmolVLA: https://github.com/wycliffeoleti/smolVLA
