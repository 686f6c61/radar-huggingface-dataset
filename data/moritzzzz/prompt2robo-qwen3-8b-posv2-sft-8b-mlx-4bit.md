# moritzzzz/Prompt2Robo-Qwen3-8B-posv2-sft-8b-MLX-4bit

## Resumen

Prompt2Robo-Qwen3-8B-posv2-sft-8b-MLX-4bit es un ajuste fino completo (full fine-tuning, sin LoRA) del modelo Qwen3-8B, especializado en la generación de programas de control para un brazo robótico simulado LARA 5. El modelo recibe una instrucción en lenguaje natural y produce un programa `run(robot)` ejecutable en el simulador MuJoCo, o bien una negativa breve cuando la tarea no es abordable. Lo desarrolla el usuario moritzzzz y se distribuye bajo licencia Apache 2.0.

El entrenamiento se realizó sobre el dataset Carlo0001/Prompt2Robo, en su variante `data_posv2`, con 3.029 muestras de entrenamiento, 315 de validación y 417 reservadas para evaluación, todas verificadas en simulador. El resultado es un modelo de 8.190.735.360 parámetros (8,19 B) cuantizado a 4 bits en formato MLX para ejecución en Apple Silicon.

Su relevancia actual reside en que demuestra que un modelo denso de 8 B, ajustado con supervisión completa sobre un dataset pequeño pero verificado funcionalmente, puede alcanzar una tasa de éxito superior al 80 % en tareas de manipulación robótica simulada, con un tamaño de repositorio de solo 4,6 GB apto para equipos de sobremesa con chip de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | 4 bits (MLX); el modelo original full fine-tune se entrenó en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de la familia Qwen3, y se somete a un ajuste fino supervisado (SFT) de todos los pesos, sin adaptadores LoRA. El autor informa de una búsqueda de hiperparámetros con 4 configuraciones, de las que la mejor resultó 4 épocas con tasa de aprendizaje 1e-05. El entrenamiento se realizó sobre el split `data_posv2` del dataset Carlo0001/Prompt2Robo, compuesto por 3.029 muestras de entrenamiento, 315 de validación y 417 de held-out, todas verificadas contra el simulador MuJoCo mediante la herramienta `tools/check.py`.

La tarea de entrenamiento es estrictamente generativa y orientada a código: dado un prompt de instrucción, el modelo debe emitir un programa `run(robot)` para el brazo LARA 5 o una negativa corta. Un detalle técnico crítico es que el modelo se entrenó con la plantilla de chat de Qwen3 en modo no-thinking, con el bloque `<think></think>` vacío presente en el prompt; el autor indica que debe usarse exactamente el system prompt del repositorio del dataset (`system_prompt.md`) y `apply_chat_template(..., enable_thinking=False)` para reproducir las condiciones de entrenamiento. El modelo resultante en bf16 se cuantizó posteriormente a 4 bits en formato MLX para Apple Silicon. No se documentan innovaciones adicionales como decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de código de control robótico: produce programas `run(robot)` ejecutables en el simulador MuJoCo para el brazo LARA 5.
- Negativa controlada: cuando la instrucción no es abordable, emite una respuesta de rechazo breve en lugar de código inválido.
- Comprensión de instrucciones en lenguaje natural orientadas a manipulación y posicionamiento del robot.
- Ajuste específico a un API de robótica concreto (el del simulador LARA 5), no a robótica genérica.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking activo en esta variante.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre un dataset específico sin indicación de cobertura lingüística.

## Casos de uso

- Generación automática de políticas de manipulación en simulación: el modelo convierte una instrucción como "coloca el objeto en la bandeja" en un programa `run(robot)` que el simulador MuJoCo ejecuta y verifica, lo que permite iterar sobre tareas sin escribir controladores a mano.
- Evaluación de currículos de robótica: al estar entrenado sobre familias de tareas verificadas (eval_v2 y eval_v3 con nuevas familias), sirve como banco de pruebas para medir la generalización de un modelo de código a tareas de manipulación no vistas durante el entrenamiento.
- Prototipado rápido en investigación de robótica: investigadores sin acceso a grandes clústeres pueden ejecutar el modelo cuantizado a 4 bits en un Mac con Apple Silicon y probar pipelines prompt-a-programa en local.
- Filtrado y rechazo de instrucciones inválidas: la capacidad de emitir negativas breves es útil en pipelines donde hay que descartar prompts no ejecutables antes de enviarlos al planificador o al simulador.
- Base para ajuste adicional (fine-tuning): el modelo sirve como punto de partida para adaptar la generación de código a otros brazos o APIs de simulación, dado que parte de Qwen3-8B y su licencia Apache 2.0 lo permite.
- Docencia y demostraciones de IA para robótica: el tamaño reducido (4,6 GB en 4 bits) y la ejecución vía `mlx_lm` facilitan demostraciones en portátiles durante cursos o talleres.
- Integración en la aplicación Mac "Prompt2Robo duel app" mencionada por el autor, que acepta el enlace del repositorio como modelo cargable.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Split de evaluacion original (held-out) | 82/102 (80,4 %) |
| eval_v2 (nuevas familias de tareas) | 51/61 (83,6 %) |
| eval_v3 | 74/92 (80,4 %) |

Las métricas corresponden a la tasa de tareas resueltas en la simulación MuJoCo con `tools/check.py`, sobre muestras nunca vistas durante el entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio pesa 4,6 GB en cuantización 4 bits MLX, por lo que la inferencia requiere aproximadamente 5-6 GB de memoria unificada, holgadamente dentro de los 8 GB base de los chips Apple M1 en adelante.
- Diseñado explícitamente para Apple Silicon (MLX); no se distribuyen pesos GGUF ni safetensors estándar para GPU NVIDIA en este repositorio.
- GPU recomendadas: cualquier chip de Apple con al menos 8 GB de memoria unificada (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Para GPU NVIDIA o AMD no hay formato compatible en este repositorio.
- Despliegue mediante `mlx_lm` (librería MLX-LM) o la aplicación Mac "Prompt2Robo duel app" del autor.
- No se documentan latencia ni throughput estimados.
- Para ejecutar el modelo en bf16 sin cuantizar haría falta el checkpoint completo del full fine-tune, que no se distribuye en este repositorio; el tamaño estimado sería de unos 16 GB en bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-posv2-sft-8b-MLX-4bit | 8,19 B | no disponible | Generación de código robótico para LARA 5 | Apache 2.0 | MLX 4 bits |
| Qwen/Qwen3-8B-MLX-4bit | 8 B | no disponible en la información | Modelo base generalista | Apache 2.0 | MLX 4 bits |
| moritzzzz/Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit | 8 B | no disponible | Variante LoRA del mismo proyecto | no disponible | MLX 4 bits |

La comparación con modelos de robótica de otros autores no está disponible en la información proporcionada. La alternativa más directa es la variante LoRA del mismo autor (v3-lora), que comparte base y cuantización pero difiere en el método de ajuste (LoRA frente a full fine-tuning) y en la versión del dataset.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el brazo simulado LARA 5 y su API de simulación; no generaliza a robots físicos ni a otras plataformas sin un ajuste adicional.
- La reproducibilidad exige usar exactamente el system prompt del repositorio del dataset (`system_prompt.md`) y la plantilla de chat de Qwen3 con `enable_thinking=False`; desviarse de estas condiciones degrada la tasa de éxito.
- Las tasas de éxito del 80-84 % implican que aproximadamente una de cada cinco tareas falla en simulación; no es adecuado para control en lazo cerrado sin verificación previa.
- Riesgo de alucinación de llamadas a la API del robot o de secuencias de movimiento no válidas; el propio autor mitiga esto con verificación en MuJoCo mediante `tools/check.py`.
- Sesgos conocidos: no documentados.
- Cobertura de idiomas no documentada; el dataset de entrenamiento no especifica la distribución lingüística.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del código generado en un robot real recae en el integrador.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos para vLLM, TGI, llama.cpp ni Ollama en este repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-posv2-sft-8b-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo base cuantizado MLX: https://huggingface.co/Qwen/Qwen3-8B-MLX-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Variante LoRA relacionada: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v3-lora-MLX-4bit
- Modelos etiquetados prompt2robo: https://huggingface.co/models?other=prompt2robo
