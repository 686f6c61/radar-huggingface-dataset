# ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE

## Resumen

MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE es un ajuste experimental del modelo MiniCPM-V-4.7 de 1B parametrós orientado a tareas agenticas de llamada de herramientas (tool calling). Fue publicado por el usuario ewin-reg en HuggingFace y se trata de la versión v6 del modelo base (MiniCPM-V-4.7-1B-Agentic-FwS) tras 40 iteraciones de entrenamiento con FlashREINFORCE, un método de aprendizaje por refuerzo asíncrono propuesto por NVIDIA. El modelo resuelve el problema de generar llamadas a herramientas exactas a partir de prompts grounded, donde los valores de los argumentos aparecen en el propio prompt.

Su relevancia radica en que es un experimento documentado y reproducible: el propio autor reconoce que el resultado es "estadísticamente un empate" con la versión v6, sin mejora demostrada. Aun así, la ficha es interesante para desarrolladores que investigan RL aplicado a modelos pequeños agenticos, ya que incluye comparaciones detalladas contra el modelo base y contra Claude Haiku 5.5 como referencia. El modelo usa arquitectura MiniCPM-V 4.7, tiene 1.554.476.272 parámetros totales y soporta entrada imagen-texto a texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MiniCPM-V 4.7 (image-text-to-text) |
| Parámetros totales | 1.554.476.272 (~1,55 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en fp16 según el proceso de entrenamiento) |
| Idiomas soportados | inglés (según tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM-V-4.7-1B-Agentic-FwS (v6, checkpoint `ar2_sft7`), un fine-tuning SFT de MiniCPM-V 4.7 centrado en tool calling. Sobre esa base se aplicó FlashREINFORCE (NVIDIA, alphaXiv 2609.flashreinforce-asynchronous-rl-agentic-models): un rollout por prompt, recompensa binaria (la primera llamada a herramienta generada debe coincidir exactamente con la gold call, misma métrica "exact" que la validación), ventaja calculada como recompensa menos la media del batch, un paso de optimizador por batch fresco y una región de confianza a nivel de secuencia sobre el proxy KL de Bernoulli por token (umbral 1e-3). No se usa crítico, ni modelo de referencia, ni penalización KL.

Los datos de entrenamiento provienen de Nemotron-SFT-Agentic-v4, filas de `tool_calling` desde la fila 70000 en adelante (la v8 se detuvo en la 70000), filtrando solo ejemplos cuyos valores de argumentos gold aparecen todos en el prompt. Se eliminaron prompts duplicados con entrenamientos, validaciones o benchmarks anteriores. En total se usaron 40 actualizaciones × 64 prompts = 2.560 prompts, cada uno empleado una sola vez. El muestreo se hizo con temperature 1.0, top_p 1.0, top_k 0 y hasta 768 tokens nuevos. Los hiperparámetros no estándar fueron: learning rate 1e-5 (el paper usa 1e-6 para full fine-tuning; no hay valor medido para LoRA), dropout de LoRA 0, batch 64 (el paper usa 128, limitado por tiempo en T4), learning rate constante y fp16 con GradScaler. El ajuste LoRA (r32, alpha 64) se fusionó en los pesos finales.

## Capacidades

- Generación de llamadas a herramientas (tool calling / function calling) a partir de prompts en lenguaje natural, con salida estructurada como llamada exacta
- Comprensión de imagen y texto (pipeline image-text-to-text, heredada de MiniCPM-V 4.7)
- Conversación (tag "conversational" en la model card)
- Alta tasa de emisión de llamadas a herramienta: 1.000 en la validación held-out (todas las respuestas contienen una llamada)
- Reconocimiento del nombre de herramienta correcto: 0.831 de exactitud en validación
- No se documenta soporte explícito de multi-step reasoning, agentes con múltiples pasos encadenados ni thinking mode

## Casos de uso

- Generación de llamadas a herramientas en inglés: el modelo está especializado en producir la primera llamada a herramienta exacta dado un prompt con los valores de los argumentos presentes, con 0.414 de exactitud en la métrica "exact"
- Investigación en RL para modelos pequeños: es un caso de estudio documentado de FlashREINFORCE con LoRA sobre un modelo de 1B, útil para replicar o comparar métodos de RL agéntico con recursos limitados (se entrenó en GPU T4)
- Prototipado de agentes locales ligeros: con ~1,55 B de parámetros puede ejecutarse en hardware modesto para pipelines que requieran emitir llamadas a funciones
- Benchmarking de tool calling: el autor publica 1.000 filas de validación held-out y comparaciones pareadas, útiles como referencia para evaluar otros modelos en la misma tarea
- Clasificación de intención hacia herramientas: alcanza 0.831 de exactitud identificando el nombre de la herramienta correcta, adecuado para enrutar peticiones a la función adecuada
- Estudio de groundedness: el entrenamiento filtró ejemplos cuyos valores de argumentos aparecen en el prompt, lo que lo hace adecuado para analizar el problema de argumentos no grounded en tool calling

## Benchmarks y rendimiento

Resultados publicados por el autor (1.000 filas de validación held-out, decodificación greedy, primera llamada a herramienta):

| Modelo | exact | args | name | has_call |
|---|---|---|---|---|
| Round 1 (tras fusión LoRA) | 0.314 | 0.337 | 0.754 | 0.997 |
| v6 (modelo base, revisión `f7c6ea0`) | 0.409 | 0.440 | 0.832 | 0.999 |
| Este modelo | 0.414 | 0.440 | 0.831 | 1.000 |
| Claude Haiku 5.5 (referencia, como subagente) | 0.334 | 0.372 | 0.724 | 0.895 |

Notas del autor: frente a v6, la mejora en "exact" es de +0.005 con error estándar pareado de 0.0102 (55 victorias, 50 derrotas), por debajo del umbral de 2 SE, por lo que se considera estadísticamente un empate. Sobre las 584 filas de validación cuyos valores gold aparecen en el prompt: 0.647 frente a 0.627 de v6, dentro del ruido. Frente a Claude Haiku 5.5 (ejecutado como subagente de Claude Code, con su propio system prompt), este modelo va adelante en exact +0.080 (SE 0.0141), args +0.068 (SE 0.0147) y name +0.107 (SE 0.0161), aunque el autor advierte que las filas siguen el estilo de Nemotron, sobre el que este modelo entrenó, por lo que mide acuerdo con el dataset, no capacidad general de uso de herramientas. Durante el entrenamiento, la comprobación de deriva rechazó 0 de 64 trayectorias en cada actualización (proxy ~4e-6) y la proporción de salidas con llamada a herramienta se mantuvo en 1.0. Greedy exact sobre 64 filas frescas held-out: 0.609 al inicio y 0.594 en la actualización 40.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato explícito; con ~1,55 B de parámetros en fp16 (el repo pesa 3,1 GB), se estima en torno a 4 GB de VRAM
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4; para inferencia basta cualquier GPU moderna de gama media o incluso CPU
- Cabe en GPUs de consumo: sí, modelos de ~1,5 B en fp16 caben cómodamente en GPUs como la RTX 3060, RTX 4060 o superiores
- Opciones de despliegue: librería Transformers (formato nativo, `endpoints_compatible`); no se mencionan GGUF, vLLM, llama.cpp, Ollama ni TGI en la model card
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE | ~1,55 B | no disponible | Apache 2.0 | Especializado en tool calling grounded; empate estadístico con su base v6 |
| MiniCPM-V-4.7-1B-Agentic-FwS (v6) | ~1,55 B | no disponible | no disponible | Modelo base; 0.409 exact frente a 0.414 de este modelo (dentro del ruido) |
| Claude Haiku 5.5 (referencia) | no disponible | no disponible | propietaria | Usado como referencia externa; 0.334 exact en el mismo benchmark, pero en condiciones de agente distintas |

No se conocen otros modelos comparables de tamaño similar publicados en la información disponible.

## Limitaciones y advertencias

- Sin mejora medible sobre v6: el propio autor indica que el resultado es estadísticamente un empate y que 40 actualizaciones a LoRA lr 1e-5 pueden ser insuficientes (no se probó)
- La métrica "exact" exige que el texto completo de la llamada coincida, lo que penaliza variaciones de formato equivalentes
- Aproximadamente el 60 % de las llamadas gold con valores comprobables contienen valores que no aparecen en el prompt, lo que limita el techo de la métrica
- El modelo entrenó sobre el estilo de Nemotron, por lo que su buen resultado frente a Claude Haiku 5.5 refleja acuerdo con el dataset, no capacidad general de tool use
- Idioma: la model card declara solo inglés; no hay soporte documentado para castellano u otros idiomas
- Algunos batches fueron reejecutados tras perder contexto los agentes y unas pocas filas se marcaron como inferidas sin reverificar, lo que introduce cierta incertidumbre en las comparaciones
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tuning comunitario de MiniCPM-V conviene verificar las condiciones del modelo base original
- Riesgo de alucinación de argumentos: no se documenta explícitamente, pero el filtro de groundedness del entrenamiento sugiere que es un problema conocido en esta tarea

## Enlaces

- Modelo: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE
- Modelo base: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS
- Paper FlashREINFORCE (referenciado en la model card): alphaXiv 2609.flashreinforce-asynchronous-rl-agentic-models (NVIDIA); enlace directo no disponible
- Dataset de entrenamiento: Nemotron-SFT-Agentic-v4 (referenciado en la model card); enlace directo no disponible
