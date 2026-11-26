# dhruv1672/crossbot-pi05-lora60-coffee

## Resumen

Cross-Bot π0.5 LoRA60 es un ajuste fino del modelo visión-lenguaje-acción (VLA) `lerobot/pi05_base` orientado a control robótico bimanual. Lo desarrolla dhruv1672 en el marco de un trabajo de fin de máster (Cross-Bot, San José State University) y está entrenado sobre cuatro habilidades de una estación de café simulada con dos brazos xArm-7 en Isaac Sim 6.0.1. El modelo recibe observaciones RGB y estado articular, y emite acciones de articulaciones para completar tareas encadenadas de servicio de café.

El checkpoint publicado corresponde al paso 4.000 de un entrenamiento planificado de 5.000 pasos, detenido deliberadamente. Se entrenaron 711M de los 4,85B parámetros totales: un adaptador LoRA (r=32, alpha=64) sobre la torre de visión SigLIP y entrenamiento completo del `gemma_expert`, las proyecciones de entrada/salida de acción y los MLP de tiempo. El repositorio ocupa 2,9 GB y se distribuye en formato safetensors bajo licencia Gemma.

Su relevancia es acotada y experimental: es un artefacto de investigación con resultados cerrados muy limitados (éxito nulo en dos de las cuatro habilidades evaluadas en el checkpoint 3.000) y una model card explícitamente honesta sobre las deficiencias del dataset. Resulta útil como referencia metodológica de fine-tuning LoRA sobre π0.5 y como ejemplo de los problemas prácticos (envolvente articular, modos posturales múltiples, ausencia de fotogramas de parada) que aparecen al entrenar políticas VLA con demostraciones guionizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (torre de visión SigLIP + `gemma_expert` + proyecciones de acción y MLP de tiempo) |
| Parámetros totales | 4,85B |
| Parámetros activos | no disponible (no es MoE); 711M entrenables en este ajuste |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador LoRA + módulos entrenados; requiere fusión con `merge_lora.py`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA que combina una torre de visión SigLIP con un experto de lenguaje (`gemma_expert`) y cabezas de acción con codificación temporal. En este ajuste se aplica LoRA con r=32 y alpha=64 únicamente sobre la torre SigLIP, mientras que el `gemma_expert`, las proyecciones de entrada/salida de acción y los MLP de tiempo se entrenan por completo, sumando 711M de parámetros entrenables sobre 4,85B totales.

El entrenamiento usó LeRobot 0.7.0 con acciones delta sobre las articulaciones del brazo (pinzas en absoluto) y normalización por cuantiles definida en `crossbot_action_space.json`. Se empleó bf16, checkpointing de gradiente, batch de 16 y schedule coseno con pico 2,5e-5, 500 pasos de warmup y suelo de 2,5e-6 en el paso 5.000. Los datos son 240 episodios (60 por habilidad) del dataset `dhruv1672/crossbot-serve100-rgb-train`, generados con demostraciones guionizadas de cuRobo. Todo el entrenamiento se ejecutó en una NVIDIA DGX Spark (GB10), con unos 16 s por paso y unos 31 GB de memoria. La pérdida de validación (16 episodios reservados) bajó de 0,0302 en el paso 1.000 a 0,0167 en el 4.000.

## Capacidades

- Control robótico bimanual de cuatro habilidades encadenadas: S1 (coger la taza y colocarla bajo la boquilla), S2 (pulsar el botón de preparación), S3 (llevar la taza de la boquilla a la mesa) y S4 (mover la taza de la mesa a la bandeja).
- Política VLA cerrada: consume observaciones RGB y estado articular y emite acciones de articulaciones en espacio delta.
- Ejecución de una etapa por invocación, con las etapas previas guionizadas en la evaluación.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento, audio ni visión general más allá del uso como entrada de política.
- Entrenado exclusivamente en simulación (Isaac Sim 6.0.1); no validado en hardware.

## Casos de uso

- Investigación en políticas VLA: servir como punto de partida para estudiar el efecto de LoRA sobre la torre de visión frente al entrenamiento completo del experto, con una receta reproducible en LeRobot 0.7.0.
- Reproducción de experimentos de tesis: el checkpoint y el dataset permiten replicar las curvas de pérdida y las evaluaciones cerradas publicadas.
- Banco de pruebas de pipelines de fusión LoRA: el repositorio incluye `merge_lora.py` con aserciones de carga, útil para validar flujos de fusión de adaptadores en entornos Windows con problemas de codificación.
- Estudio de patologías de datos en robótica: las limitaciones documentadas (envolvente articular de 2π, modos posturales múltiples, ausencia de fotogramas de parada, falta de datos de recuperación) sirven como caso de análisis para diseñar canonicalización y aumento de datos.
- Evaluación de arneses de política cerrada: la comparación entre éxito cerrado (0/5 en S1) y replay de acciones grabadas (5/5 en S1) es un ejemplo útil para depurar harnesses de evaluación.
- Docencia en robótica de manipulación: ejemplo completo de entrenamiento bimanual simulado con cuRobo, Isaac Sim y LeRobot para cursos de posgrado.

## Benchmarks y rendimiento

Resultados de evaluación cerrada publicados en la model card (checkpoint 3.000, escenas de entrenamiento, 5 escenas por habilidad, una etapa a la vez con las previas guionizadas). No miden generalización y el checkpoint 4.000 no se ha evaluado en bucle cerrado.

| Habilidad | Éxito (checkpoint 3.000) |
|---|---|
| S1 coger → boquilla | 0/5 |
| S2 pulsar botón | 2/4 |
| S3 boquilla → mesa | 0/5 |
| S4 mesa → bandeja | 0/4 (1 ejecución pendiente) |

Pérdidas de entrenamiento y validación:

| Paso | Pérdida de entrenamiento | Pérdida de validación (16 episodios) |
|---|---|---|
| 1.000 | 0,025 | 0,0302 |
| 2.000 | 0,020 | 0,0203 |
| 3.000 | 0,015 | 0,0184 |
| 4.000 | 0,011 | 0,0167 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió unos 31 GB de memoria en una DGX Spark (GB10) con bf16 y checkpointing de gradiente.
- GPU recomendadas: no disponibles; el autor solo documenta la DGX Spark (GB10) para entrenamiento.
- Encaje en GPU de consumo: no confirmado; con 4,85B parámetros en bf16 los pesos rondan los 9,7 GB, pero el repositorio de 2,9 GB contiene el adaptador y los módulos entrenados, no necesariamente el modelo completo fusionado. Se requiere la base `lerobot/pi05_base` para la fusión.
- Opciones de despliegue: LeRobot 0.7.0 como librería principal; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cross-Bot π0.5 LoRA60 (este) | 4,85B (711M entrenables) | no disponible | Éxito cerrado 0/5, 2/4, 0/5, 0/4 en cuatro habilidades simuladas | Gemma | Hugging Face |
| `lerobot/pi05_base` | 4,85B (según este ajuste) | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA bimanuales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo entrenado y validado exclusivamente en simulación (Isaac Sim 6.0.1); la model card advierte explícitamente: nunca ejecutarlo en hardware.
- Resultados cerrados pobres: 0/5 en S1 y S3, 0/4 en S4 y 2/4 en S2 en el checkpoint 3.000; el checkpoint 4.000 no se ha evaluado en bucle cerrado.
- Envolvente articular: el planificador registra la misma postura con articulaciones separadas 2π entre episodios, lo que introduce ambigüedad en las acciones objetivo.
- Varios modos posturales por habilidad: desde la misma postura inicial las demostraciones adoptan configuraciones distintas, dificultando el aprendizaje.
- Fotogramas de parada ausentes: la mayoría de las demostraciones de S2 y S3 terminan con el brazo en movimiento, por lo que la política no aprende a detenerse.
- Sin datos de recuperación: todas las demostraciones son ejecuciones guionizadas exitosas, lo que impide aprender a corregir fallos.
- La corrección de datos (canonicalización de la envolvente articular, enmascarado del brazo inactivo, ruido de estado, sobremuestreo de fin de episodio) está implementada en el repositorio del proyecto pero no se aplicó a este checkpoint.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la producción de acciones plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, con las obligaciones y restricciones que imponen; conviene revisarlas antes de cualquier despliegue.
- En Windows es necesario definir `PYTHONUTF8=1` y `PYTHONIOENCODING=utf-8` antes de fusionar, ya que un error de codificación de consola dentro de `from_pretrained` puede omitir silenciosamente los pesos base (el script incluye aserciones que lo detectan).
- Idiomas y sesgos: no documentados; el modelo no está pensado para procesamiento de lenguaje natural general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/crossbot-pi05-lora60-coffee
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/dhruv1672/crossbot-serve100-rgb-train
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- cuRobo: https://github.com/NVlabs/curobo
