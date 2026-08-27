# OmAhire369/safe-genai-ppo-lora

## Resumen

`safe-genai-ppo-lora` es un adaptador LoRA entrenado con PPO (RLHF) sobre el modelo base `gpt2-medium`, desarrollado por OmAhire369 (Om Ahire). Su objetivo es alinear las respuestas del modelo ante prompts dañinos o que provocan estereotipos, modificando el estilo y la seguridad de las respuestas mediante aprendizaje por preferencias. Forma parte de un estudio comparativo más amplio que enfrenta PPO frente a DPO y evalúa cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA) sobre el mismo modelo base.

El adaptador añade 4,325 millones de parámetros entrenables sobre los 359,15 millones del modelo base (un 1,2 % del total), lo que lo convierte en una intervención ligera y eficiente en términos de cómputo. El entrenamiento se realizó con datos de preferencia del conjunto "Cultural Kaleidoscope" y un modelo de recompensa Bradley-Terry. Aunque el resultado mejora la puntuación de recompensa en 2,79 puntos respecto al paso inicial, el modelo base sigue siendo pequeño y sin instrucciones, por lo que no es apto para producción.

La relevancia de este modelo reside en su uso como pieza de investigación para estudiar métodos de alineación de seguridad, no como un sistema listo para desplegar. Su licencia MIT permite su uso libre, y al ser un adaptador PEFT, se integra fácilmente con la librería `transformers` y `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 medium) con adaptadores LoRA |
| Parametros totales | 359,15 M (modelo base) + 4,325 M (adaptadores LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en `gpt2-medium`, un transformer decoder de 359 millones de parámetros, sobre el que se aplican adaptadores LoRA (Low-Rank Adaptation) que solo entrenan 4,325 millones de parámetros. El entrenamiento utiliza PPO (Proximal Policy Optimization) como algoritmo de RLHF, con un modelo de recompensa basado en el criterio de Bradley-Terry. Los datos de preferencia provienen del conjunto "Cultural Kaleidoscope", aunque no se especifica el número de pares de entrenamiento ni la composición exacta del dataset.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El interés principal del proyecto es comparar metodologías de alineación (PPO vs. DPO) y estrategias de fine-tuning, por lo que el entrenamiento se realizó con un bucle PPO escrito a mano y un objetivo DPO también implementado manualmente, según la model card.

## Capacidades

- Generación de texto autoregresiva, heredada de `gpt2-medium`.
- Alineación de seguridad: respuestas más cautelosas y menos propensas a reproducir contenido dañino o estereotipado ante prompts provocadores.
- Aprendizaje por preferencias: el adaptador ajusta el estilo de respuesta según la señal de recompensa aprendida.
- No dispone de soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Capacidades multilingües no documentadas; el modelo base está principalmente orientado al inglés.

## Casos de uso

- Investigación en alineación de modelos: permite comparar empíricamente PPO frente a DPO y distintas estrategias de fine-tuning sobre un mismo modelo base, como parte de estudios académicos o de laboratorio.
- Prototipado de sistemas de moderación de contenido: puede servir como base para experimentar con respuestas seguras en entornos controlados, aunque no es apto para producción.
- Educación en RLHF: útil para enseñar los fundamentos de PPO, modelos de recompensa y adaptadores LoRA en cursos o talleres.
- Evaluación de sesgos en preferencias: al usar datos de "Cultural Kaleidoscope", permite analizar cómo los sesgos de anotación afectan al comportamiento del modelo.
- Benchmarking de métodos de alineación: sirve como punto de referencia para comparar con otros adaptadores del mismo autor (por ejemplo, `ppo_lora_alignment` o `ppo_qlora_alignment`).
- Desarrollo de pipelines de fine-tuning eficientes: demuestra cómo un adaptador LoRA puede modificar el comportamiento de un modelo grande con un coste computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la puntuación del modelo de recompensa tras el entrenamiento:

| Metrica | Valor |
|---|---|
| Reward-model score tras entrenamiento | -2,0682 |
| Mejora de recompensa vs. paso 0 | 2,7894 |

Estos valores indican una mejora relativa en la alineación según el modelo de recompensa, pero no son comparables con benchmarks de capacidad general.

## Requisitos de hardware

- El entrenamiento alcanzó un pico de uso de GPU de 5424,6 MB (aproximadamente 5,4 GB), lo que sugiere que la inferencia con el adaptador es ligera.
- Al ser un adaptador LoRA sobre `gpt2-medium`, la inferencia puede ejecutarse en GPUs consumer como una RTX 3060 o superior, e incluso en CPU con baja latencia para tareas simples.
- No se especifican requisitos de VRAM para inferencia, pero dado el tamaño del modelo base (~355 M parámetros), se estima que en FP16 ocupa menos de 1 GB, más el overhead del adaptador.
- Opciones de despliegue: compatible con `transformers` y `peft`; puede integrarse en frameworks como vLLM o llama.cpp si se convierte a GGUF, aunque no se documenta explícitamente.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría. El autor ha publicado otros adaptadores relacionados (`ppo_lora_alignment`, `ppo_qlora_alignment`, `ppo_full_alignment`, `reward-model-safe-ai`), pero no se proporcionan detalles de rendimiento o configuración de estos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- `gpt2-medium` es un modelo pequeño y anticuado, sin instruction tuning; la alineación solo modifica el estilo y la seguridad, no la factualidad ni la utilidad general.
- El modelo no es apto para producción: puede generar información incorrecta o incoherente, y su capacidad de razonamiento es limitada.
- El modelo de recompensa hereda los sesgos de anotación de los datos de preferencia, por lo que no debe tratarse como un clasificador de seguridad general.
- No se documentan sesgos específicos, pero al estar basado en GPT-2, es probable que reproduzca sesgos presentes en sus datos de entrenamiento originales.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para entornos de alto riesgo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto de investigación sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-ppo-lora
- Repositorio GitHub del proyecto: https://github.com/Omahire369/safety-alignment-llm
- Página de modelos del autor: https://huggingface.co/OmAhire369/models
- Modelo de recompensa relacionado: https://huggingface.co/OmAhire369/safe-genai-reward-lora
