# moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit

## Resumen

Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit es un ajuste fino completo (full fine-tuning, sin LoRA) del modelo denso Qwen3-4B de Alibaba Qwen, especializado en generar programas Python de control robótico. El modelo recibe una petición en lenguaje natural junto con una lista de cubos identificados por id y color, y produce una función `run(robot)` que manipula un brazo simulado LARA 5 en el simulador MuJoCo, o bien una negativa breve si la tarea no es realizable. Lo publica el usuario moritzzzz sobre el conjunto de datos Carlo0001/Prompt2Robo.

La relevancia de esta ficha es doble: por un lado muestra un caso de uso muy concreto de generación de código para robótica con verificación en simulador (todas las muestras del dataset están validadas ejecutando el programa en MuJoCo); por otro, se distribuye únicamente en formato MLX cuantizado a 4 bits, pensado para ejecutarse en Apple Silicon mediante `mlx_lm` o la aplicación de escritorio Prompt2Robo Mac.

El modelo conserva la arquitectura transformer densa de Qwen3-4B con 4.022.468.096 parámetros totales y un repositorio de 2,3 GB en 4 bits. No se han publicado datos sobre longitud de contexto específica del ajuste, idiomas soportados ni benchmarks generales más allá de las métricas de éxito en simulación reportadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B), ajuste fino completo |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no confirmada en la información) |
| Tipos de cuantizacion | 4-bit MLX (repo publicado); el autor referencia también pesos bf16 completos en otro repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (cuantización 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 4B parámetros con modos de razonamiento híbridos (thinking y non-thinking) en su versión original. El ajuste se realizó mediante full fine-tuning de todos los pesos (SFT, sin LoRA) sobre el split `data_v2` del dataset Carlo0001/Prompt2Robo: 1.322 muestras de entrenamiento, 132 de validación y 163 reservadas para evaluación, todas verificadas en simulador. Se usaron pesos maestros en fp32 con autocast en bf16, learning rate 1e-5 y 4 épocas.

Una particularidad importante del entrenamiento es que el modelo se entrenó con el bloque `<think></think>` vacío en el prompt, es decir, en modo non-thinking de la plantilla de chat de Qwen3. El autor insiste en usar exactamente el `system_prompt.md` del repositorio del dataset y `apply_chat_template(..., enable_thinking=False)`. La tarea es estrictamente de generación de código estructurado: el modelo no recibe coordenadas, sino que el programa generado lee las posiciones en tiempo de ejecución a través de la API `robot`. Tras el entrenamiento, los pesos bf16 se cuantizaron a 4 bits en formato MLX para Apple Silicon.

## Capacidades

- Generación de código Python para control robótico: produce funciones `def run(robot): ...` para un brazo simulado LARA 5 en MuJoCo.
- Interpretación de instrucciones en lenguaje natural con referencias a objetos por id y color (por ejemplo, "Objects: 1 (red), 2 (blue)\nPut the red cube on top of the blue cube.").
- Generación de negativas controladas: si la petición no es realizable con la API disponible, devuelve una negativa breve en lugar de código inválido.
- Razonamiento de planificación de manipulación: el programa generado resuelve posiciones en tiempo de ejecución mediante la API `robot`, sin coordenadas precomputadas.
- Modo non-thinking: el modelo está entrenado para operar sin cadena de razonamiento explícita (bloque `<think>` vacío).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo más allá de lo que herede de Qwen3-4B, y no están validadas en esta información.

## Casos de uso

- Generación automática de scripts de manipulación en simulación: dado un listado de cubos y una instrucción, el modelo escribe el programa `run(robot)` que un pipeline de evaluación ejecuta en MuJoCo con `tools/check.py`; encaja en flujos de investigación en robótica que necesitan prototipar tareas sin escribir control a mano.
- Evaluación de modelos de código para robótica: sirve como baseline especializado para comparar generación de código con verificación física estricta (cualquier contacto de dedo o brazo con cubo o mesa cuenta como fallo).
- Docencia y demostraciones de text-to-robot: al ejecutarse en Apple Silicon con `mlx_lm` o la app Prompt2Robo Mac, permite mostrar en un portátil el ciclo petición en lenguaje natural → programa → ejecución simulada.
- Generación de datos sintéticos de control: los programas generados y validados en simulador pueden servir para ampliar datasets de instrucciones robóticas con nuevas formulaciones y escenas.
- Pruebas de robustez ante paráfrasis: el split eval_v2 con nuevas familias de tareas permite medir cuánto degrada el modelo cuando cambia la redacción o la escena respecto a las familias vistas en entrenamiento.
- Filtrado y rechazo de peticiones inviables: la capacidad de devolver negativas breves es útil en asistentes de robótica que deben distinguir entre instrucciones ejecutables y no ejecutables antes de invocar hardware o simulación.
- Prototipado rápido de políticas de pick-and-place: para tareas de apilar o mover cubos por color, el modelo produce código que lee posiciones en tiempo de ejecución, lo que simplifica la integración con escenas variables.

## Benchmarks y rendimiento

| Conjunto de evaluación | Resultado | Notas |
|---|---|---|
| Split de evaluación original (held-out) | 84/102 (82,4%) | Tarea resuelta en MuJoCo con `tools/check.py`, checker estricto |
| eval_v2 (nuevas familias de tareas) | 47/61 (77,0%) | Muestras nunca vistas en entrenamiento |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores corresponden a los pesos bf16, al adaptador o al modelo fusionado; las versiones MLX 4-bit se comprimen después del entrenamiento y no fueron puntuadas en el simulador.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,3 GB en 4-bit MLX, por lo que la inferencia cabe holgadamente en equipos Apple Silicon con 8 GB o más de memoria unificada.
- GPU recomendadas: el formato publicado es exclusivamente MLX, orientado a Apple Silicon (series M1, M2, M3, M4). No se distribuyen pesos GGUF ni safetensors estándar en este repositorio; para GPUs NVIDIA o AMD habría que usar la variante `Qwen3-4B-v3-full-4b-full` (bf16) y convertirla.
- Cabe en GPU de consumo: sí, en el ecosistema Apple; para CUDA sería necesario convertir los pesos bf16 del repo completo, que ocupan aproximadamente 8 GB en bf16.
- Opciones de despliegue: `mlx_lm` (load/generate) o la aplicación Prompt2Robo Mac pegando la URL del repositorio en el campo "Other…". Para otros entornos no hay instrucciones publicadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit | 4,02B | no disponible | Generación de código robótico LARA 5 (MuJoCo) | Apache 2.0 | MLX 4-bit |
| Qwen/Qwen3-4B | 4B | no disponible en la información | Modelo generalista con modos thinking/non-thinking | Apache 2.0 (según repo base) | Transformers |
| huihui-ai/Qwen3-4B-abliterated | 4B | no disponible en la información | Variante sin rechazos del Qwen3-4B | no disponible | Transformers |
| Prompt2Robo-Qwen3-4B-v3-full-4b-full | 4,02B | no disponible | Igual que esta ficha, en bf16 completo | Apache 2.0 | safetensors bf16 |

La comparación con modelos de la misma categoría (generación de código para robótica) no está disponible en la información proporcionada; los alternativos listados son variantes del mismo modelo base o del mismo autor.

## Limitaciones y advertencias

- Los conjuntos held-out son pequeños (163 muestras en total), con un margen de aproximadamente ±6 puntos al 95% de confianza, por lo que diferencias pequeñas entre versiones son ruido estadístico.
- Casi todas las muestras held-out pertenecen a familias de tareas presentes en entrenamiento (con nuevas redacciones y escenas); un tipo de petición realmente nuevo puede rendir peor que las cifras reportadas.
- Las versiones MLX 4-bit se comprimen tras el entrenamiento y no se evaluaron en el simulador; las puntuaciones provienen de los pesos bf16, el adaptador o el modelo fusionado.
- El checker es estricto: cualquier contacto de dedo o brazo con un cubo o con la mesa cuenta como fallo, lo que puede infravalorar el éxito funcional de la tarea.
- El modelo solo conoce el brazo simulado LARA 5 y la API `robot` del dataset; no está validado para un robot real y el código generado debe ejecutarse primero en simulación.
- Es obligatorio usar el `system_prompt.md` exacto del dataset y la plantilla de chat non-thinking de Qwen3; desviarse de esta configuración degrada la calidad de las salidas.
- No hay información publicada sobre sesgos, comportamiento multilingüe ni riesgos de alucinación específicos de este ajuste; como todo modelo generador de código, puede producir programas sintácticamente válidos pero semánticamente incorrectos.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-MLX-4bit
- Variante bf16 completa: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-4B-v3-full-4b-full
- Dataset Prompt2Robo: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Variante abliterated de Qwen3-4B: https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Receta de despliegue de Qwen3-4B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3-4B
- Tutorial de full fine-tuning de Qwen3-4B en Databricks: https://docs.databricks.com/aws/en/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
