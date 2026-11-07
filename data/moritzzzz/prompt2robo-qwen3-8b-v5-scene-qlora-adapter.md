# moritzzzz/Prompt2Robo-Qwen3-8B-v5-scene-qlora-adapter

## Resumen

Prompt2Robo-Qwen3-8B-v5-scene-qlora-adapter es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-8B por el usuario moritzzzz. Su propósito es transformar un modelo de lenguaje generalista de 8 mil millones de parámetros en un generador de programas de control robótico: dado un comando en lenguaje natural y una descripción JSON del estado de la escena (posiciones de objetos y del gripper), el adaptador produce un programa Python con una función `run(robot)` ejecutable sobre un brazo simulado de tipo LARA 5 en MuJoCo, o bien una negativa breve cuando la tarea no es abordable.

El adaptador se ha entrenado con QLoRA (base cuantizada en 4 bits NF4) sobre el dataset Carlo0001/Prompt2Robo `data_v4`, con 1905 muestras de entrenamiento, 188 de validación y 267 de test retenido, todas verificadas en simulador. Los rangos LoRA son r=32 y el entrenamiento cubre 4 épocas. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en safetensors, no el modelo completo.

Su relevancia es acotada pero específica: demuestra un flujo completo de especialización de un LLM de 8B para generación de código robótico verificado en simulación, con métricas de éxito medidas por ejecución real en MuJoCo y no por coincidencia textual. Es un artefacto de investigación, no un modelo listo para producción ni validado en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA/PEFT |
| Parametros totales | 8B en el modelo base; adaptador LoRA de rango 32 (tamaño del repo: 0,4 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA); adaptador en safetensors; existe versión MLX 4-bit construida desde el modelo fusionado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); no es formato MLX |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8B parámetros. El entrenamiento emplea QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 y se entrenan únicamente los pesos LoRA con rango 32 durante 4 épocas. El dataset es Carlo0001/Prompt2Robo en su versión `data_v4`, con 1905 muestras de entrenamiento, 188 de validación y 267 de test retenido; todas las muestras están verificadas en simulador. No se especifica en la información disponible el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

Una decisión técnica destacable es el formato de prompt: el modelo espera la petición en lenguaje natural seguida de un bloque `Scene_Info:` con un JSON que describe objetos (color y posición) y gripper (posición, ángulo y estado de apertura). Este JSON se construye con `tools/format_prompt.py` del repositorio del dataset. Además, el entrenamiento usó la plantilla de chat de Qwen3 en modo no-thinking, con el bloque `<think></think>` vacío presente en el prompt, por lo que debe invocarse con `apply_chat_template(..., enable_thinking=False)`. Los prompts de entrenamiento fueron las peticiones largas de `data_v4`; las peticiones muy cortas no son el punto fuerte del adaptador.

## Capacidades

- Generación de código Python robótico: produce una función `run(robot)` para un brazo simulado de 6 articulaciones con gripper de dos dedos y alcance tipo LARA 5.
- Interpretación de escenas estructuradas: consume el estado del entorno como JSON (`Scene_Info`) con posiciones de objetos y del gripper.
- Negativa controlada: el modelo puede emitir una negativa breve cuando la tarea no es abordable, en lugar de generar código inválido.
- Ejecución verificable: el código generado está pensado para ejecutarse y validarse en MuJoCo con `tools/check.py`.
- Modo no-thinking: opera con el bloque de razonamiento vacío, sin cadena de pensamiento explícita.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible; el adaptador es solo texto.

## Casos de uso

- Generación de scripts de manipulación en simulación: dado un comando como "pon el cubo azul encima del amarillo" y el JSON de escena, el adaptador emite el programa `run(robot)` que un pipeline de MuJoCo ejecuta y valida con `tools/check.py`, lo que permite prototipar tareas de pick-and-place sin escribir controladores a mano.
- Evaluación de modelos base para robótica: sirve como referencia de especialización de Qwen3-8B en una tarea concreta, útil para comparar estrategias de fine-tuning (LoRA frente a modelo fusionado) con métricas de éxito en simulador.
- Generación de datos sintéticos de código robótico: el adaptador puede producir programas candidatos para nuevas escenas que después se filtran por ejecución en simulación, alimentando un bucle de autoentrenamiento.
- Docencia e investigación en LLM para robótica: el par dataset + adaptador + script de verificación forma un banco de pruebas reproducible para estudiar la brecha entre generar código plausible y código que se ejecuta correctamente.
- Integración en un pipeline de planificación textual: como etapa que traduce instrucciones de alto nivel a código ejecutable dentro de un sistema mayor de planificación, siempre con validación en simulación antes de cualquier uso.
- Pruebas de robustez ante formato de prompt: útil para medir cuánto degrada el rendimiento un cambio de formato (por ejemplo, peticiones cortas o ausencia del bloque `Scene_Info`), dado que el autor advierte que las peticiones cortas no son su punto fuerte.

## Benchmarks y rendimiento

Precisión en tareas resueltas en simulación MuJoCo sobre conjuntos retenidos (nunca vistos en entrenamiento), según la model card:

| Conjunto de evaluación | Adaptador LoRA | Modelo fusionado en bf16 | Qwen3-8B sin ajustar |
|---|---|---|---|
| eval (original) | 75/102 (75,5%) | 75/102 | no disponible |
| eval_v2 (nuevas familias de tareas) | 51/61 (83,6%) | 43/61 | no disponible |
| eval_v3 | 60/92 | 54/92 | no disponible |
| eval_v4 | 8/12 | 7/12 | no disponible |
| Total retenido | 196/267 | 179/267 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB; requiere cargar el modelo base Qwen3-8B junto con él mediante `PeftModel.from_pretrained(base, repo)`.
- VRAM estimada para inferencia: aproximadamente 6-7 GB con el base en 4 bits NF4 (configuración de entrenamiento), y del orden de 16-18 GB con el base en bf16/fp16, más el pequeño overhead del adaptador. Cifras estimadas a partir del tamaño del modelo; no confirmadas en la información disponible.
- GPU recomendadas: A100 o H100 para despliegue con el base en bf16; RTX 4090 (24 GB) suficiente para bf16; GPU consumer de 8-12 GB viables con cuantización de 4 bits.
- Cabe en GPU consumer: sí, con cuantización de 4 bits en tarjetas de 8 GB o más; en bf16 requiere 16 GB o más.
- Opciones de despliegue: PEFT + Transformers (vía oficial), vLLM o TGI fusionando previamente el adaptador (con la advertencia de que la fusión en bf16 reduce la precisión de 196/267 a 179/267), llama.cpp/Ollama solo tras convertir el modelo fusionado a GGUF. Existe una versión MLX 4-bit construida desde el modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-v5-scene-qlora | 8B (base) + LoRA r=32 | no disponible | Generación de código robótico verificado en simulación | apache-2.0 | Adaptador PEFT en Hugging Face |
| Qwen/Qwen3-8B (base sin ajustar) | 8B | no disponible en la información proporcionada | LLM generalista de texto | no disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible en la información proporcionada | LLM multimodal (visión-lenguaje) con instrucciones | no disponible en la información proporcionada | Hugging Face |

La comparación directa con el base sin ajustar no es posible en términos de precisión porque la model card indica "n/a" para Qwen3-8B sin ajustar en los conjuntos de evaluación. No se dispone de otros adaptadores de robótica comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el adaptador se ha entrenado y evaluado para un brazo genérico de 6 articulaciones con gripper de dos dedos y alcance tipo LARA 5; no está validado en un robot real. El autor recomienda ejecutar el código generado en simulación antes de cualquier otro uso.
- La fusión del adaptador en bf16 degrada la precisión: 179/267 frente a 196/267 del adaptador sin fusionar. La versión MLX 4-bit se construyó desde el modelo fusionado y no fue evaluada por separado.
- Conjuntos de evaluación pequeños: la incertidumbre es de aproximadamente ±6 puntos, y casi todas las muestras pertenecen a familias de tareas vistas durante el entrenamiento, lo que limita la generalización a tareas nuevas.
- Dependencia estricta del formato de prompt: requiere el bloque `Scene_Info` con JSON y la plantilla de chat no-thinking de Qwen3; las peticiones cortas rinden peor porque el entrenamiento usó peticiones largas de `data_v4`.
- Idiomas soportados no documentados; el dataset y los prompts de entrenamiento no se describen lingüísticamente en la información disponible.
- Riesgo de alucinación en el código generado: aunque el modelo puede emitir negativas, no hay garantía de que el programa generado sea ejecutable o seguro; la verificación en simulador es imprescindible.
- Sesgos: no documentados en la información proporcionada.
- Licencia apache-2.0 permite uso comercial del adaptador, pero el modelo base Qwen3-8B tiene su propia licencia que debe verificarse por separado.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v5-scene-qlora-adapter
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Carlo0001/Prompt2Robo: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Qwen3-VL-8B-Instruct (referencia de la familia Qwen3): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
