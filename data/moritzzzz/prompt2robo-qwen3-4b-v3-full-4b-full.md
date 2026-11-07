# moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-full

## Resumen

Prompt2Robo-Qwen3-4B-v3-full-4b-full es un ajuste fino completo (full fine-tuning, sin LoRA) del modelo Qwen/Qwen3-4B, desarrollado por el usuario moritzzzz. El modelo está especializado en una tarea muy concreta: transformar una petición en lenguaje natural junto con una lista de identificadores y colores de cubos en un programa Python `def run(robot): ...` que controla un brazo robótico simulado LARA 5 en el simulador MuJoCo, o bien emitir una negativa breve cuando la petición no se puede realizar.

El modelo parte de la arquitectura transformer densa de Qwen3-4B (4.022.468.096 parámetros) y se ha entrenado sobre el dataset Carlo0001/Prompt2Robo `data_v2`, con 1322 muestras de entrenamiento, 132 de validación y 163 reservadas para evaluación, todas verificadas en simulador. El ajuste se realizó durante 4 épocas con una tasa de aprendizaje de 1e-5, usando pesos maestros en fp32 y autocast en bf16.

Su relevancia es acotada pero clara: demuestra que un modelo de 4B parámetros puede aprender a generar código de control robótico correcto a partir de instrucciones cortas, alcanzando una precisión del 82,4% en el split de evaluación original y del 77,0% en familias de tareas nuevas. Es un artefacto de investigación orientado a la simulación, no validado para robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); existe una version MLX 4-bit en otro repositorio de la misma familia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face, bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-4B, sin modificaciones estructurales. El autor aplicó un ajuste fino supervisado (SFT) sobre la totalidad de los pesos, sin adaptadores LoRA, usando pesos maestros en fp32 con autocast en bf16, una tasa de aprendizaje de 1e-5 y 4 épocas sobre el split `data_v2` del dataset Carlo0001/Prompt2Robo. El conjunto de entrenamiento consta de 1322 muestras, con 132 de validación y 163 reservadas para evaluación; todas las muestras están verificadas en simulador.

La particularidad del entrenamiento es que el modelo se entrenó con el bloque `<think></think>` vacío en el prompt, es decir, en modo no-thinking de la plantilla de chat de Qwen3. Por ello, el autor insiste en usar exactamente el `system_prompt.md` del repositorio del dataset y la plantilla de chat con `enable_thinking=False`. El modelo no recibe coordenadas: el programa generado lee las posiciones en tiempo de ejecución a través de la API `robot` del dataset.

## Capacidades

- Generación de código Python estructurado: produce funciones `def run(robot): ...` para el brazo simulado LARA 5.
- Traducción de instrucciones en lenguaje natural a programas de manipulación robótica (apilar, mover, ordenar cubos por color e identificador).
- Emisión de negativas breves cuando la petición no es realizable con la API disponible.
- Razonamiento sobre objetos descritos por identificador y color, sin acceso a coordenadas en el prompt.
- Modo no-thinking forzado por el entrenamiento (bloque `<think></think>` vacío).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo específico más allá de las heredadas del modelo base.

## Casos de uso

- Generación de programas de control en simulación: dado un prompt como "Objects: 1 (red), 2 (blue)\nPut the red cube on top of the blue cube", el modelo emite el programa que el simulador MuJoCo ejecuta y verifica con `tools/check.py`.
- Investigación en robótica basada en lenguaje: sirve como línea base para estudiar la traducción de instrucciones a código de manipulación con modelos pequeños (4B) frente a alternativas mayores.
- Generación de datos sintéticos de entrenamiento: los programas generados y validados en simulador pueden alimentar pipelines de aumento de datos para otros modelos.
- Evaluación de robustez ante reformulaciones: el split `eval_v2` con familias de tareas nuevas permite medir la generalización ante variaciones de redacción y escenas.
- Prototipado rápido de interfaces lenguaje-código para brazos simulados: útil para validar la viabilidad de un pipeline prompt → programa → ejecución antes de invertir en un robot físico.
- Docencia y demostraciones: ejemplo compacto y reproducible de ajuste fino completo de un modelo de 4B para una tarea de dominio específico con verificación automática.

## Benchmarks y rendimiento

Los únicos datos publicados son las precisiones en los conjuntos reservados, medidas con el verificador estricto del simulador (cualquier contacto de dedo o brazo con un cubo o la mesa cuenta como fallo):

| Conjunto de evaluacion | Resultado |
|---|---|
| Split de evaluacion original | 84/102 (82,4%) |
| eval_v2 (familias de tareas nuevas) | 47/61 (77,0%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB para contextos moderados.
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y similares con al menos 12-16 GB de VRAM en bf16. La versión MLX 4-bit de la familia reduce aún más el requisito y está pensada para Mac.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (método documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), MLX en Mac mediante la app Prompt2Robo. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La generación usa `max_new_tokens=1500` y decodificación greedy (`do_sample=False`) en el ejemplo del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-4B-v3-full-4b-full | 4,02B | no disponible | Codigo para brazo LARA 5 simulado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4B | no disponible en la informacion | Proposito general, multilingue, codigo y matematicas | Apache 2.0 | Hugging Face |
| Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit | 4,02B (comprimido a 4 bits) | no disponible | Misma tarea, formato MLX | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los conjuntos reservados son pequeños (163 muestras, aproximadamente ±6 puntos al 95% de confianza), por lo que diferencias pequeñas entre versiones pueden ser ruido estadístico.
- Casi todas las muestras reservadas pertenecen a familias de tareas presentes en entrenamiento (con nuevas redacciones y escenas); una petición de un tipo realmente nuevo puede rendir peor que las cifras publicadas.
- Las versiones MLX 4-bit se comprimen tras el entrenamiento y no fueron evaluadas en el simulador; las puntuaciones corresponden a los pesos bf16.
- El verificador es estricto: cualquier contacto de dedo o brazo con un cubo o la mesa se considera fallo.
- El modelo solo conoce el brazo LARA 5 simulado y la API `robot` del dataset; no está validado para un robot real. El autor recomienda ejecutar el código generado primero en simulación.
- Riesgo de alucinación inherente a un modelo generativo de código: puede producir programas sintácticamente válidos pero incorrectos o inseguros para el entorno de ejecución.
- No se documentan sesgos específicos ni cobertura idiomática; el entrenamiento se realizó con el prompt de sistema del dataset, presumiblemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de validación en hardware real limita su aplicabilidad en producción fuera de simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-full
- Version MLX 4-bit: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset Carlo0001/Prompt2Robo: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
