# MISLab-MiiSLab/gr00t_grasp-fan_Le-007_20k_LoRA_fullhead

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base NVIDIA GR00T-N1.7-3B, un modelo fundacional de visión-lenguaje-acción (VLA) orientado a robótica. El adaptador ha sido publicado por el grupo MISLab-MiiSLab y su nombre sugiere un ajuste fino para una tarea concreta de agarre (grasp) sobre un objeto o entorno identificado como "fan_Le-007", con un presupuesto de entrenamiento de 20.000 pasos y una configuración de LoRA que afecta a la "fullhead" (probablemente el módulo de cabeza/cabeza de acción del modelo). No es un modelo autónomo, sino un conjunto de pesos delta que debe cargarse junto al modelo base para funcionar.

El interés de esta ficha reside en que ejemplifica el patrón actual de especialización de modelos VLA mediante PEFT: en lugar de reentrenar un modelo de 3.000 millones de parámetros, se publica un adaptador de bajo rango que modifica el comportamiento del modelo base para una política de manipulación concreta. Esto abarata el ajuste fino y permite distribuir políticas robóticas especializadas en repositorios pequeños (3,3 GB en este caso) que se combinan con el checkpoint base.

La información pública disponible es muy escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, idiomas, pipeline ni detalles de entrenamiento, y el repositorio no registra descargas ni interacciones. Por tanto, muchos campos de esta ficha se marcan como "no disponible" y las afirmaciones sobre capacidades se infieren del modelo base y del nombre del adaptador, no de documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer VLA (modelo base NVIDIA GR00T-N1.7-3B); arquitectura exacta del adaptador no disponible |
| Parametros totales | No disponible (adaptador LoRA; el modelo base declara 3B en su identificador) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizaciones del base no documentadas aquí) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el checkpoint base GR00T-N1.7-3B |
| Libreria | peft 0.21.0 |
| Tamano del repositorio | 3,3 GB |
| Rango LoRA | No disponible |
| Pasos de entrenamiento | 20.000 (según el identificador del repositorio) |
| Fecha de publicacion | 2026-11-09 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en capas del modelo base que se entrenan congelando los pesos originales. El modelo base es NVIDIA GR00T-N1.7-3B, un modelo fundacional de visión-lenguaje-acción para robótica que combina un codificador visual, un backbone lingüístico y una cabeza de acciones que genera comandos motores. El sufijo "fullhead" del identificador sugiere que el ajuste afecta a la totalidad de la cabeza de acción, aunque no hay documentación del autor que lo confirme.

No se dispone de información sobre el dataset de entrenamiento, la composición de las trayectorias, el número de tokens, el uso de RLHF/DPO ni los hiperparámetros (learning rate, rango, alpha, dropout). El identificador indica 20.000 pasos de entrenamiento y una tarea de agarre ("grasp") sobre un objeto o escenario "fan_Le-007". No se documentan innovaciones técnicas adicionales.

## Capacidades

- Control robótico de manipulación: el adaptador especializa al modelo base en una política de agarre (grasp) para el escenario "fan_Le-007".
- Percepción visión-lenguaje-acción: hereda del base GR00T la capacidad de procesar observaciones visuales e instrucciones en lenguaje para producir acciones.
- Ejecución de políticas de imitación: al ser un ajuste LoRA sobre un VLA, se espera que reproduzca comportamientos aprendidos de demostraciones, aunque no hay evaluación publicada.
- Integración con PEFT: se carga mediante la librería peft 0.21.0 junto al checkpoint base.
- Capacidades de texto, código, matemáticas, tool calling, agentes o multilingüismo: no disponibles para este adaptador; dependen del modelo base y no están documentadas aquí.

## Casos de uso

- Investigación en manipulación robótica: cargar el adaptador sobre GR00T-N1.7-3B para reproducir o comparar políticas de agarre en el escenario "fan_Le-007" dentro de un entorno simulado o de laboratorio.
- Ajuste fino especializado de bajo coste: servir como ejemplo de referencia para entrenar adaptadores LoRA sobre modelos VLA de 3B sin reentrenar el modelo completo.
- Evaluación de PEFT en robótica: utilizar el adaptador como punto de partida para estudiar cómo afecta el rango LoRA y el número de pasos (20.000 en este caso) al rendimiento de la política.
- Despliegue en laboratorio con recursos limitados: al ser un delta de 3,3 GB, permite distribuir la política especializada sin transferir el checkpoint completo del modelo base.
- Benchmarking de políticas de agarre: comparar el comportamiento del adaptador frente a la política zero-shot del base en la misma tarea.
- Docencia y reproducibilidad: emplear el repositorio como caso de estudio de publicación de adaptadores PEFT con metadatos mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el modelo base GR00T-N1.7-3B requiere, como referencia orientativa, del orden de 6-8 GB en fp16 para los pesos, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no disponibles; para el base se suelen emplear A100, H100 o RTX 4090, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y del pipeline de inferencia robótica.
- Opciones de despliegue: carga mediante peft 0.21.0 sobre el checkpoint base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas no están orientadas a modelos VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t_grasp-fan_Le-007_20k_LoRA_fullhead (este) | Adaptador LoRA sobre base 3B | No disponible | Adaptador PEFT para VLA | No disponible | Hugging Face, 0 descargas |
| NVIDIA GR00T-N1.7-3B (base) | 3B (según identificador) | No disponible | VLA fundacional | No disponible en esta ficha | Referenciado como base_model |
| Alternativas VLA comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros adaptadores o modelos VLA.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos de la plantilla están sin completar, por lo que no hay documentación oficial sobre uso previsto, datos o evaluación.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo para producción.
- Especialización estrecha: el adaptador está entrenado para una tarea concreta ("grasp" sobre "fan_Le-007"); no se debe esperar generalización a otros objetos o entornos.
- Dependencia del modelo base: requiere el checkpoint NVIDIA GR00T-N1.7-3B, cuya licencia y disponibilidad deben verificarse por separado.
- Sin métricas de rendimiento: no hay evidencia publicada de éxito de agarre, robustez o tasas de fallo.
- Riesgo de sobreajuste: 20.000 pasos sobre una tarea específica pueden producir sobreajuste al escenario de entrenamiento.
- Sin información sobre sesgos: no se documentan sesgos visuales, demográficos ni de dominio.
- Repositorio sin tracción: 0 descargas y 0 likes, lo que dificulta la validación comunitaria.
- Fecha de creación futura (2026-11-09): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-007_20k_LoRA_fullhead
- Modelo base referenciado (NVIDIA GR00T-N1.7-3B): no disponible como enlace público en la información proporcionada
- Paper de PEFT citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: no disponible en la información proporcionada
