# MISLab-MiiSLab/pi05_grasp-fan_Le-008_head_15k_v1_Lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `lerobot/pi05_base`, una política de visión-lenguaje-acción (VLA) orientada a robótica. El nombre del repositorio (`pi05_grasp-fan_Le-008_head_15k_v1_Lora`) indica que se trata de un ajuste fino para una tarea concreta de manipulación robótica: el agarre ("grasp") de un objeto identificado como "fan" (ventilador) en un entorno o configuración denominada "Le-008", con un presupuesto de entrenamiento de 15 000 pasos y en su primera versión. El autor es el grupo MISLab-MiiSLab.

El modelo no es un modelo de lenguaje generativo al uso, sino un adaptador PEFT que modifica los pesos de una política robótica preentrenada. Su relevancia radica en que demuestra el patrón habitual de la robótica basada en aprendizaje: partir de una política generalista (pi05) y especializarla mediante LoRA para una tarea de manipulación específica, reduciendo drásticamente el coste de entrenamiento frente a un ajuste completo. El tamaño del repositorio es de 0,2 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

La información publicada por el autor es mínima: la model card es la plantilla por defecto de Hugging Face sin rellenar, y no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Por tanto, esta ficha se limita a describir lo que puede inferirse de los metadatos y del modelo base, marcando explícitamente como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre política VLA `lerobot/pi05_base` (arquitectura del modelo base no detallada en la información disponible) |
| Parametros totales | No disponible (el repositorio contiene solo los pesos del adaptador LoRA; el modelo base no se incluye) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los adaptadores LoRA se publican en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.0 |
| Modelo base | lerobot/pi05_base |
| Tamano del repositorio | 0,2 GB |
| Rango LoRA | No disponible |
| Pasos de entrenamiento | 15 000 (inferido del nombre del repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas lineales del modelo base congelado. El modelo base es `lerobot/pi05_base`, una política de la familia LeRobot (Hugging Face) para control robótico basada en visión y lenguaje. No se dispone de la arquitectura interna de pi05 (número de capas, dimensión oculta, mecanismo de atención, tokenizador de acciones) en la información proporcionada, por lo que no puede detallarse aquí.

Respecto al entrenamiento, el nombre del repositorio sugiere 15 000 pasos de optimización sobre una tarea de agarre de un ventilador en una configuración "Le-008". No se documentan hiperparámetros (learning rate, rango LoRA, alpha, dropout), composición del dataset, número de demostraciones, ni si hubo aumento de datos o evaluación con políticas de referencia. Tampoco se indica si el entrenamiento se realizó con imitación supervisada (behavior cloning), que es el régimen habitual en políticas VLA de LeRobot, ni si se emplearon técnicas de RLHF o DPO, improcedentes en este dominio. La ausencia de esta información impide reproducir el entrenamiento o auditar su calidad.

## Capacidades

- Control robótico de manipulación: el adaptador está especializado en la tarea de agarre ("grasp") de un objeto tipo ventilador, según el identificador del repositorio.
- Entrada multimodal: al heredar la interfaz de `lerobot/pi05_base`, se espera que consuma observaciones visuales y posiblemente instrucciones en lenguaje, aunque no se detalla en la información disponible.
- Generación de acciones motoras: propio de una política VLA; el adaptador modula la salida de acciones del modelo base.
- Ajuste ligero y portable: al ser LoRA, puede combinarse con el modelo base sin duplicar sus pesos completos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión general, audio: no disponible.

## Casos de uso

- Investigación en manipulación robótica: servir como punto de partida reproducible para experimentos de agarre sobre `pi05_base`, permitiendo comparar el efecto de un ajuste LoRA de 15 000 pasos frente al modelo base sin ajustar.
- Prototipado rápido de tareas de pick-and-place: el adaptador puede cargarse sobre el modelo base en un pipeline de LeRobot para evaluar en simulación o en un banco de pruebas físico si la política generaliza al objeto objetivo.
- Aprendizaje por imitación con bajo coste: útil en laboratorios con recursos limitados que quieran especializar una política VLA sin reentrenar el modelo completo, dado el reducido tamaño del adaptador (0,2 GB).
- Docencia y formación: ejemplo didáctico de flujo PEFT aplicado a robótica, desde la definición del dataset de demostraciones hasta el despliegue del adaptador.
- Base para ajustes posteriores: el adaptador puede servir como inicialización para nuevas versiones (v2, v3) sobre la misma tarea u objetos relacionados.
- Evaluación de robustez: permite estudiar cómo un ajuste de bajo rango afecta a la generalización de una política VLA preentrenada en condiciones ligeramente distintas a las del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende enteramente del modelo base `lerobot/pi05_base`, cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de una política robótica VLA, es habitual el uso de GPU de gama media-alta (por ejemplo, RTX 3090/4090 o A100) para inferencia en tiempo real, pero no hay confirmación en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante la librería `peft` (versión 0.21.0 documentada) sobre el modelo base; el ecosistema LeRobot proporciona utilidades de carga y ejecución de políticas. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son el entorno natural para políticas de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| pi05_grasp-fan_Le-008_head_15k_v1_Lora (este) | Adaptador LoRA; base no cuantificado | No disponible | No disponible | Ajuste específico para agarre de ventilador; sin evaluación publicada |
| lerobot/pi05_base | No disponible | No disponible | No disponible | Modelo base generalista de la familia pi05; sin datos públicos en esta ficha |
| Otros adaptadores LoRA de LeRobot | No disponible | No disponible | Variable | El ecosistema LeRobot publica múltiples adaptadores por tarea; no se dispone de comparación cuantitativa |

No se dispone de datos de rendimiento que permitan una comparación numérica con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card sin completar: el autor no ha documentado licencia, datos de entrenamiento, hiperparámetros ni evaluación, lo que impide un uso responsable y una reproducción fiable.
- Licencia no especificada: no puede asumirse permiso para uso comercial; debe contactarse con el autor o consultarse la licencia del modelo base `lerobot/pi05_base`.
- Especialización estrecha: el adaptador está entrenado para una tarea concreta (agarre de un ventilador en una configuración "Le-008"); su generalización a otros objetos, entornos o robots es desconocida.
- Riesgo de sobreajuste: con 15 000 pasos sobre una única tarea y sin datos de validación publicados, es plausible un sobreajuste a las condiciones de entrenamiento.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar `lerobot/pi05_base` con la versión de PEFT indicada (0.21.0) y compatibilidad de arquitectura.
- Sin métricas de seguridad ni de robustez: no se han publicado evaluaciones de sesgos, alucinación (en el sentido de acciones erróneas) ni comportamiento ante situaciones fuera de distribución.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-008_head_15k_v1_Lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Proyecto LeRobot: https://github.com/huggingface/lerobot
