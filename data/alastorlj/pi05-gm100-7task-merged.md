# Alastorlj/pi05-gm100-7task-merged

## Resumen

El modelo `Alastorlj/pi05-gm100-7task-merged` es un adaptador LoRA fusionado sobre un modelo base de la familia PI-0.5 (OpenPI), desarrollado por el usuario Alastorlj. El nombre indica que se trata de un checkpoint obtenido al fusionar siete adaptadores LoRA entrenados sobre distintas tareas del benchmark GM-100 (Great March 100), un conjunto de referencia para evaluar sistemas de IA encarnada con 100 tareas de manipulación y 130 demostraciones expertas por tarea. El modelo está pensado para robótica: la entrada es multimodal (imágenes y texto) y la salida son acciones de control.

El repositorio contiene los pesos en formato `safetensors` (4.143.404.816 parámetros, 8,3 GB) y usa la librería `peft` (v0.20.0). La model card del autor está vacía en su práctica totalidad, por lo que los detalles de arquitectura, entrenamiento y licencia no están disponibles públicamente. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo de visión-lenguaje-acción (VLA) para manipulación robótica, usando una estrategia de fusión de LoRA para combinar capacidades de múltiples tareas en un único checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente Vision-Language-Action, basada en PI-0.5) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 o fp16, no se especifica) |
| Idiomas soportados | no disponibles (el modelo no es de NLP, es de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con estructura LoRA fusionada) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna del modelo base PI-0.5. Por el nombre y el contexto del repositorio, se infiere que se trata de un modelo de visión-lenguaje-acción (VLA) que procesa observaciones visuales y comandos de texto para generar acciones de control de un brazo robótico. El modelo base se finetuneó con adaptadores LoRA sobre siete tareas del benchmark GM-100, y posteriormente los LoRA se fusionaron en un único checkpoint. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control de un robot manipulador a partir de observaciones visuales y comandos en lenguaje natural.
- Ejecución de siete tareas distintas de manipulación definidas en el benchmark GM-100 (no se especifican cuáles).
- Capacidad de generalizar a nuevas instancias de las tareas entrenadas gracias al fine-tuning multi-tarea.
- No es un modelo de texto generativo: no soporta generación de código, razonamiento general ni tool calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM; su salida son acciones de control.

## Casos de uso

- Manipulación robótica en investigación: el modelo puede ejecutar tareas de pick-and-place, apilado o ensamblaje en entornos simulados o reales, sirviendo como baseline para experimentos en laboratorios de robótica.
- Aprendizaje por demostración: dado que el benchmark GM-100 incluye demostraciones expertas, el modelo puede servir para evaluar la transferencia de habilidades entre tareas.
- Desarrollo de políticas multi-tarea: al fusionar siete LoRA, el modelo demuestra un enfoque práctico para combinar habilidades sin reentrenar desde cero.
- Prototipado de sistemas de control con visión-lenguaje: se puede integrar en un sistema de control de un robot real (por ejemplo, un brazo de 6 grados de libertad) para probar la viabilidad de VLA en hardware de bajo coste.
- Investigación en fusión de LoRA: el propio checkpoint es un ejemplo de cómo fusionar adaptadores entrenados por separado, útil para estudiar el conflicto entre tareas y la degradación de rendimiento.
- Evaluación de benchmarks de robótica: se puede comparar contra otros modelos en el GM-100 para medir el estado del arte en manipulación con instrucciones naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 4.143 millones de parámetros en fp32, lo que ocupa aproximadamente 16,6 GB en memoria. Con cuantización de 8 bits, se reduciría a unos 8,3 GB; en 4 bits, a unos 4,2 GB.
- Para inferencia en fp32, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000).
- Con cuantización de 8 bits, es factible en una RTX 3080 (12 GB) o RTX 4070 Ti (12 GB).
- Con cuantización de 4 bits, podría caber en GPUs con 8 GB de VRAM, pero la degradación de precisión puede ser significativa.
- Opciones de despliegue: vLLM (si el modelo es compatible), llama.cpp (si se convierte a GGUF), o directamente con Transformers y PEFT.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos. El único dato de referencia es que el modelo base es PI-0.5, del ecosistema OpenPI, pero no se dispone de datos de rendimiento ni de modelos comparables en el repositorio.

## Limitaciones y advertencias

- La model card del autor está vacía: no se documentan sesgos, riesgos ni limitaciones específicas.
- Al ser un modelo de robótica, no es adecuado para tareas de lenguaje general; su uso fuera de manipulación robótica no tiene sentido.
- El entrenamiento sobre siete tareas concretas limita la generalización a tareas nuevas no vistas.
- No se especifica la licencia, por lo que el uso comercial es incierto y requiere contacto con el autor.
- La falta de documentación sobre el dataset y el procedimiento de entrenamiento impide evaluar la reproducibilidad y la calidad de los datos.
- Riesgo de sobreajuste a las tareas del GM-100; puede fallar en entornos con variaciones visuales o de física distintas a las del entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alastorlj/pi05-gm100-7task-merged
- Página del benchmark GM-100: https://www.rhos.ai/research/gm-100
- Perfil del autor en HuggingFace: https://huggingface.co/Alastorlj
- Documentación de fusión de LoRA de HuggingFace: https://huggingface.co/docs/diffusers/main/using-diffusers/merge_loras
