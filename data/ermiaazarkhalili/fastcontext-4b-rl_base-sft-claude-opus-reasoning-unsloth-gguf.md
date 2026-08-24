# ermiaazarkhalili/FastContext-4B-RL_base-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Este modelo es una colección de cuantizaciones GGUF de un fine-tune LoRA del modelo `microsoft/FastContext-1.0-4B-RL`, desarrollado por el usuario ermiaazarkhalili. El fine-tune se realizó mediante aprendizaje supervisado (SFT) sobre un dataset privado de destilación de razonamiento de Claude Opus, con el objetivo de mejorar las capacidades de razonamiento del modelo base. El resultado es un modelo de 4.022 millones de parámetros, disponible en varios niveles de cuantización para su ejecución en CPU y dispositivos edge.

El modelo base, `FastContext-1.0-4B-RL`, ya no está disponible en el Hub, lo que limita la reproducibilidad. Según fuentes externas, podría tratarse de una variante de Qwen3, aunque no hay confirmación oficial. El contexto máximo no se especifica en la información disponible; el entrenamiento se realizó con secuencias de hasta 2048 tokens. La relevancia de este modelo radica en su formato GGUF, que permite su uso con herramientas como llama.cpp, Ollama y LM Studio, facilitando la inferencia local en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en microsoft/FastContext-1.0-4B-RL; fuentes externas sugieren Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con 2048 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base podría tener licencia Apache-2.0 según fuentes externas) |
| Formato de pesos | GGUF (safetensors para el modelo original sin cuantizar) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del modelo base `microsoft/FastContext-1.0-4B-RL`, que según la información disponible en fuentes externas podría ser una variante de Qwen3. El fine-tune se realizó con QLoRA (cuantización de 4 bits) utilizando las librerías Unsloth y TRL. Se empleó un dataset privado de destilación de razonamiento de Claude Opus, con configuración SFT. La configuración de entrenamiento incluye rango LoRA 16, alpha 16, learning rate 0.0002, una época, batch efectivo de 8, y longitud máxima de secuencia de 2048 tokens. Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo resultante no puede separarse del fine-tune.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar texto coherente.
- Razonamiento: el fine-tune se centró en destilación de razonamiento de Claude Opus, por lo que se espera que mejore las capacidades de razonamiento del modelo base, aunque no hay benchmarks que lo confirmen.
- Conversación: el modelo está etiquetado como "conversational", lo que sugiere que puede mantener diálogos.
- No se dispone de información sobre tool calling, agentes, visión u otras capacidades especiales.

## Casos de uso

- Inferencia local en CPU: gracias a las cuantizaciones GGUF, puede ejecutarse en portátiles o servidores sin GPU, usando llama.cpp o Ollama.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño, permite iterar rápidamente en entornos de desarrollo.
- Asistente de escritura en dispositivos edge: puede usarse en Raspberry Pi o dispositivos similares para generar texto.
- Educación e investigación: útil para experimentar con fine-tuning y destilación de conocimiento.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente, no envía datos a servidores externos.
- Generación de código simple: aunque no hay evidencia, los modelos de 4B suelen tener cierta capacidad de código; pero no lo afirmaré con certeza. Mejor decir "potencialmente" o "no confirmado".

Dado que no se han publicado evaluaciones, los casos de uso son potenciales y deben validarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento observada: en el trabajo SLURM 53225525 (94.254 pasos) la pérdida pasó de 1,1631 a 0,8687; en el trabajo 45169149 (1.310 pasos) de 1,1535 a 0,8004. Estos valores no deben interpretarse como indicadores de calidad.

## Requisitos de hardware

- Tamaños de archivo: desde 1,67 GB (Q2_K) hasta 4,28 GB (Q8_0). Para inferencia en CPU se necesita RAM suficiente (al menos el doble del tamaño del archivo).
- Para GPU, una tarjeta con 4-6 GB de VRAM puede ejecutar la cuantización Q4_K_M (2,50 GB) con espacio para el contexto.
- GPUs recomendadas: RTX 3060, RTX 4060, GTX 1660 Super, o superiores. También puede ejecutarse en Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, etc.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. El modelo base no está disponible y no hay benchmarks. Se puede indicar que, por tamaño, es comparable a otros modelos de 4B como Qwen2.5-3B o Llama-3.2-3B, pero sin datos de rendimiento no es posible una comparación rigurosa.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de benchmarks; el único dato es la pérdida de entrenamiento.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base.
- El fine-tune se realizó sobre un único dataset de instrucciones; el comportamiento fuera de esa distribución no está probado.
- Los adaptadores LoRA se fusionaron, por lo que no se puede separar el fine-tune del modelo base.
- El modelo base ya no está disponible en el Hub, lo que dificulta la reproducibilidad y la comparación.
- La licencia no está especificada en la card; aunque fuentes externas indican Apache-2.0 para el modelo base, no se confirma para este modelo.

## Enlaces

- Repo HuggingFace: https://huggingface.co/ermiaazarkhalili/FastContext-4B-RL_base-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Repo del modelo sin cuantizar: https://huggingface.co/ermiaazarkhalili/FastContext-4B-RL_base-SFT-Claude-Opus-Reasoning-Unsloth
- Friendli AI: https://friendli.ai/models/ermiaazarkhalili/FastContext-4B-RL_base-SFT-Claude-Opus-Reasoning-Unsloth
- Free2AI Tools: https://free2aitools.com/model/ermiaazarkhalili/fastcontext-4b-rl_base-sft-claude-opus-reasoning-unsloth-gguf
