# moritzzzz/Prompt2Robo-Qwen3-8B-v5-scene-qlora-MLX-4bit

## Resumen

Prompt2Robo-Qwen3-8B-v5-scene-qlora-MLX-4bit es un ajuste fino del modelo Qwen3-8B de Alibaba Qwen, publicado por el usuario moritzzzz en Hugging Face. El modelo está especializado en la generación de programas de control para un brazo robótico simulado tipo LARA 5: a partir de una instrucción en lenguaje natural y de una descripción JSON del estado de la escena, produce una función `run(robot)` ejecutable o una negativa breve cuando la tarea no es viable. El ajuste se realizó con QLoRA (base en 4-bit NF4, LoRA de rango 32, 4 épocas) sobre el dataset Carlo0001/Prompt2Robo, en su versión `data_v4` con 1905 muestras de entrenamiento verificadas en simulador.

El repositorio contiene el adaptador LoRA fusionado en el modelo base bf16 y posteriormente cuantizado a 4-bit en formato MLX, orientado a ejecución en Apple Silicon mediante `mlx_lm`. El modelo base Qwen3-8B aporta 8.190.735.360 parámetros y una ventana de contexto nativa de 32 768 tokens (ampliable hasta 131 072 mediante YaRN en la configuración original de Qwen3), aunque el ajuste se centra en prompts de escena relativamente cortos.

Su relevancia es acotada pero específica: cubre el nicho de generación de código robótico condicionado por el estado del entorno, con formatos de prompt definidos y métricas de éxito medidas directamente en simulación MuJoCo. No es un modelo de propósito general ni un modelo validado para hardware real; es una herramienta de investigación para pipelines de prompt-a-plan en robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA fusionado y cuantizado en MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-8B soporta 32 768 tokens nativos (131 072 con YaRN) |
| Tipos de cuantizacion | 4-bit MLX (artefacto publicado); adaptador entrenado con QLoRA 4-bit NF4 sobre base bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de 8B parámetros con atención por cabezas agrupadas (GQA) y plantilla de chat propia que distingue modo "thinking" y "non-thinking". Sobre esa base se aplicó QLoRA: cuantización NF4 del modelo base congelado, adaptadores LoRA de rango 32 y 4 épocas de entrenamiento sobre el split de entrenamiento de Carlo0001/Prompt2Robo `data_v4`, compuesto por 1905 muestras, con 188 de validación y 267 reservadas para evaluación. Todas las muestras están verificadas en simulador.

Una particularidad técnica relevante es que el entrenamiento se realizó con la plantilla de chat de Qwen3 en modo non-thinking, incluyendo el bloque `<think></think>` vacío en el prompt; el modelo espera ese formato y no razona de forma extendida antes de emitir el programa. Tras el entrenamiento, el adaptador se fusionó en el modelo base bf16 y el resultado se cuantizó a 4-bit en MLX para ejecución en Apple Silicon. El autor documenta explícitamente que la fusión del adaptador degrada la precisión respecto al adaptador sin fusionar (de 196/267 a 179/267 en el conjunto retenido), y que la versión MLX 4-bit no fue evaluada por separado.

El formato de prompt es estricto: la instrucción en lenguaje natural seguida de un bloque `Scene_Info:` con un JSON que describe objetos (color y posición) y el estado del gripper (posición, ángulo y apertura). El string se construye con `tools/format_prompt.py` del repositorio del dataset. Los prompts de entrenamiento eran peticiones largas de `data_v4`, por lo que las instrucciones muy cortas no son el punto fuerte del modelo.

## Capacidades

- Generación de código ejecutable: produce una función `run(robot)` para un brazo simulado de 6 articulaciones con pinza de dos dedos y alcance tipo LARA 5.
- Generación de negativas controladas: cuando la tarea no es viable, emite una negativa breve en lugar de código inválido.
- Comprensión de estado de escena estructurado: interpreta un JSON con posiciones de objetos y estado del gripper para planificar la manipulación.
- Razonamiento de manipulación: tareas de apilado, agarre y colocación condicionadas por coordenadas concretas.
- Modo non-thinking: respuestas directas sin cadena de pensamiento extensa, adecuadas para integración en bucles de control.
- No dispone de tool calling, function calling genérico, capacidades de agente multi-paso, visión ni audio según la información disponible.
- Capacidades multilingües: no documentadas; el ajuste se realizó sobre instrucciones del dataset, presumiblemente en inglés, sin datos de idiomas en la model card.

## Casos de uso

- Generación de planes de manipulación en simulación: dado un prompt como "pon el cubo azul encima del cubo amarillo" y un JSON de escena, el modelo emite el programa `run(robot)` que un entorno MuJoCo puede ejecutar y verificar con `tools/check.py`. Es adecuado porque fue entrenado exactamente con ese par entrada-salida y verificado en simulador.
- Investigación en prompt-a-código para robótica: sirve como línea base reproducible para comparar estrategias de formateo de escena, longitud de prompt y modos de cuantización en tareas de manipulación.
- Prototipado rápido en Mac: al estar en formato MLX 4-bit, permite iterar sobre prompts y escenas en Apple Silicon sin GPU dedicada, usando `mlx_lm` o la app Mac "duel" de Prompt2Robo.
- Filtrado de instrucciones inviables: la capacidad de emitir negativas breves permite usar el modelo como validador previo de peticiones antes de invocar un planificador o un controlador real.
- Evaluación de degradación por cuantización: el repo documenta la pérdida de precisión al fusionar el adaptador, lo que lo convierte en un caso de estudio útil para medir el coste de QLoRA + fusión + 4-bit en tareas de código estructurado.
- Docencia y demostraciones de robótica simulada: permite mostrar el ciclo completo instrucción en lenguaje natural → escena JSON → programa → verificación en simulador sin necesidad de hardware.
- Base para ajustes posteriores: el adaptador y el pipeline de formateo del dataset permiten extender el modelo a nuevas familias de tareas con QLoRA sobre el mismo esquema de prompt.

## Benchmarks y rendimiento

Las métricas publicadas miden la tarea resuelta en simulación MuJoCo con `tools/check.py` sobre conjuntos retenidos nunca vistos en entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Conjunto de evaluacion | Adaptador | Fusionado en bf16 | MLX 4-bit |
|---|---|---|---|
| eval original | 77/102 (75,5 %) | 75/102 | no evaluado |
| eval_v2 (nuevas familias) | 51/61 (83,6 %) | 43/61 | no evaluado |
| eval_v3 | 60/92 | 54/92 | no evaluado |
| eval_v4 | 8/12 | 7/12 | no evaluado |
| Total retenido | 196/267 | 179/267 | no evaluado |

El autor advierte que los conjuntos retenidos son pequeños (margen aproximado de ±6 puntos) y que casi todas las muestras pertenecen a familias de tareas también presentes en entrenamiento, por lo que la generalización a tareas nuevas no está demostrada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 4,6 GB en 4-bit MLX, por lo que en Apple Silicon el requisito de memoria unificada ronda los 5-6 GB incluyendo overhead de ejecución.
- GPU recomendadas: el artefacto publicado está pensado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada suficiente); no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: en su formato MLX sí, en equipos Apple con al menos 8 GB de memoria unificada; para ejecutar el modelo base bf16 o el adaptador sin cuantizar se necesitan aproximadamente 16 GB.
- Opciones de despliegue: `mlx_lm` en macOS y la app Mac "duel" de Prompt2Robo; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-v5-scene-qlora-MLX-4bit | 8,19 B | no disponible (base Qwen3-8B: 32 768 nativos) | Codigo robotico para brazo LARA 5 simulado | apache-2.0 | Hugging Face, formato MLX 4-bit |
| Qwen/Qwen3-8B | 8 B | 32 768 nativos (131 072 con YaRN) | Proposito general, texto y codigo | apache-2.0 | Hugging Face, Transformers, multiples cuantizaciones |
| Otros ajustes Prompt2Robo del mismo autor (v5-scene-qlora, sin cuantizar) | 8 B | no disponible | Misma tarea, mayor precision documentada | apache-2.0 | Hugging Face |

La comparación directa con el Qwen3-8B sin ajustar no puede establecerse en términos de precisión porque el autor indica "n/a" para el modelo base en los conjuntos retenidos. Frente a otros ajustes del mismo pipeline, la versión MLX 4-bit sacrifica precisión a cambio de portabilidad en Apple Silicon, y el propio autor documenta que la fusión del adaptador ya reduce la tasa de éxito de 196/267 a 179/267 antes de cuantizar.

## Limitaciones y advertencias

- Solo validado en simulación: el brazo es genérico de 6 articulaciones con pinza de dos dedos y alcance tipo LARA 5; no está validado para un robot real y el propio autor recomienda ejecutar el código generado en simulación antes de cualquier uso físico.
- Degradación por fusión y cuantización: fusionar el adaptador en bf16 cuesta precisión (196/267 → 179/267) y la versión MLX 4-bit no fue evaluada, por lo que su rendimiento real es desconocido.
- Conjuntos de evaluación pequeños y poco diversos: 267 muestras retenidas con margen de ±6 puntos y familias de tareas casi todas vistas en entrenamiento; la generalización a tareas nuevas no está demostrada.
- Formato de prompt estricto: requiere el bloque `Scene_Info:` con JSON, la plantilla non-thinking de Qwen3 con `<think></think>` vacío y peticiones largas similares a `data_v4`; instrucciones muy cortas reducen el rendimiento.
- Idiomas no documentados: no hay información sobre el comportamiento en castellano u otros idiomas distintos del usado en el dataset.
- Riesgo de alucinación en coordenadas y secuencias de acciones: al generar código con posiciones numéricas, puede producir planes sintácticamente válidos pero físicamente inviables; la verificación en simulador es imprescindible.
- Sesgos: no documentados en la información disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero se heredan las condiciones del modelo base Qwen3-8B y del dataset Carlo0001/Prompt2Robo, que deben revisarse por separado.
- Sin soporte documentado de tool calling, agentes multi-paso, visión ni audio; no debe presentarse como modelo de propósito general.
- Baja tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin revisión independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-v5-scene-qlora-MLX-4bit
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset Carlo0001/Prompt2Robo: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
- Guia de ajuste fino QLoRA de Qwen3 citada en la busqueda: https://aithinkerlab.com/qwen3-qlora-local-fine-tuning-guide/
