# OmAhire369/safe-genai-ppo-full

## Resumen

El modelo `safe-genai-ppo-full` es un fine-tuning de `gpt2-medium` (354,82 millones de parámetros) entrenado con PPO (RLHF) y ajuste completo de parámetros para la alineación de seguridad de respuestas ante prompts dañinos o que provocan estereotipos. Ha sido desarrollado por OmAhire369 como parte de un estudio comparativo entre PPO y DPO, que incluye un reward model basado en Bradley-Terry, un bucle PPO escrito a mano y un objetivo DPO también manual, junto con un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA). El modelo resuelve el problema de que los modelos de lenguaje generen contenido ofensivo o sesgado, aunque su base es un modelo pequeño y desactualizado, por lo que no es adecuado para producción. Su relevancia radica en ser un ejemplo reproducible de alineación mediante RLHF con PPO sobre un modelo abierto, útil para investigación y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 medium) |
| Parametros totales | 354.823.168 (354,82 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 medium, un transformer decoder con 24 capas, 1024 dimensiones de embedding y 16 cabezas de atención. El entrenamiento se realizó mediante PPO (RLHF) con ajuste completo de todos los parámetros (100% de los 354,82 M). Los datos de preferencia provienen del conjunto "Cultural Kaleidoscope preference data", aunque no se especifica el número de pares de entrenamiento. El proceso incluyó un reward model basado en Bradley-Terry y un bucle PPO implementado manualmente. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés principal es metodológico, al comparar PPO con DPO y distintas estrategias de fine-tuning.

## Capacidades

- Generación de texto en lenguaje natural, heredada de GPT-2 medium.
- Alineación de seguridad: respuestas menos dañinas y con menor probabilidad de reproducir estereotipos, según la evaluación del reward model.
- No soporta tool calling ni function calling.
- No dispone de capacidades multimodales (visión, audio).
- No se han declarado idiomas específicos; el modelo base GPT-2 medium está entrenado principalmente en inglés, pero no se confirma.
- No incluye modo de razonamiento explícito ni capacidades de agente.

## Casos de uso

- Investigación en alineación de modelos: permite comparar empíricamente PPO frente a DPO en un mismo modelo base y con los mismos datos, facilitando estudios reproducibles sobre métodos de RLHF.
- Prototipos de moderación de contenido: puede usarse como generador de respuestas seguras en entornos controlados, por ejemplo en demos de sistemas de chat que deben evitar lenguaje ofensivo.
- Experimentos de seguridad en modelos pequeños: sirve para analizar cómo el fine-tuning con PPO modifica el estilo y la seguridad de las respuestas sin alterar el conocimiento del modelo base.
- Educación y formación en RLHF: al ser un modelo pequeño y con código disponible, es adecuado para enseñar los fundamentos de PPO y recompensas en cursos de aprendizaje por refuerzo aplicado a NLP.
- Evaluación de sesgos en preferencias: el reward model asociado puede utilizarse para estudiar los sesgos de anotación en datos de preferencia cultural, aunque no debe tratarse como clasificador general.
- Desarrollo de chatbots seguros en entornos de prueba: en aplicaciones donde no se requiera alta calidad factual, puede integrarse en pipelines de generación con filtros adicionales para evitar respuestas dañinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la puntuación del reward model tras el entrenamiento (-1,8171) y la mejora respecto al paso inicial (3,0405), pero no se ofrecen métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en FP32, 0,7 GB en FP16 y 0,35 GB en int8, según el tamaño de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo GTX 1050 Ti, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU con llama.cpp si se convierte a GGUF.
- El pico de VRAM durante el entrenamiento fue de 9386,4 MB, pero para inferencia es mucho menor.
- Opciones de despliegue: transformers (Hugging Face), vLLM, TGI (Text Generation Inference) y conversión a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables específicos en la información proporcionada, más allá del propio modelo base `gpt2-medium` y otros fine-tunings del mismo autor, pero sin datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y desactualizado, sin instruction tuning, por lo que no es factual ni fiable para tareas de producción.
- La alineación mediante PPO modifica el estilo y la seguridad, pero no garantiza veracidad ni cobertura de conocimiento.
- El reward model hereda los sesgos de anotación del conjunto de preferencias; no debe usarse como clasificador general de seguridad.
- No se dispone de información sobre idiomas soportados; el modelo base está principalmente entrenado en inglés, lo que limita su uso multilingüe.
- Aunque la licencia MIT permite uso comercial, el modelo no está preparado para entornos productivos sin un control adicional riguroso.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación, por lo que su comportamiento en escenarios reales es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-ppo-full
- Reward model asociado: https://huggingface.co/OmAhire369/safe-genai-reward-full
- Repositorio de alineación (PPO full): https://huggingface.co/OmAhire369/ppo_full_alignment
- Proyecto relacionado en GitHub: https://github.com/Omahire369/safety-alignment-llm
