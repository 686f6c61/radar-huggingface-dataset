# EstarHash/ProRubric-Qwen3-8B-Dialogue

## Resumen

ProRubric-Qwen3-8B-Dialogue es un checkpoint de ajuste fino por refuerzo (RL) construido sobre Qwen/Qwen3-8B, desarrollado por EstarHash y publicado como artefacto oficial del artículo "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847). El modelo aplica el método ProRubric, que introduce dimensiones de rúbrica conjuntivas a nivel de protocolo con cláusulas de fallo explícitas para reducir el reward hacking en el entrenamiento con rúbricas. El checkpoint corresponde al dominio Dialogue, con semilla 42 y paso de RL 300, entrenado mediante PPO/GRPO con la librería `verl` v0.8.0.

El modelo conserva la arquitectura y el tamaño del Qwen3-8B original: 8.190.735.360 parámetros en formato safetensors, con un repositorio de 16,4 GB. Al ser un ajuste por RL sobre un modelo base ya alineado, su interés principal es de investigación: permite estudiar empíricamente cómo un diseño de rúbrica a nivel de protocolo afecta al comportamiento conversacional y al equilibrio entre puntuación de recompensa y calidad real de las respuestas.

La relevancia actual del checkpoint radica en que aborda un problema documentado en la literatura de RLHF: los modelos pueden aprender a maximizar la puntuación de un juez o rúbrica sin mejorar la calidad subyacente de sus respuestas. ProRubric propone una formulación alternativa de las rúbricas para mitigar ese fenómeno, y este checkpoint es una de las materializaciones publicadas del método para el dominio de diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); no se detalla en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer decoder-only de 8,19 mil millones de parámetros. Sobre esa base se aplica un ajuste por refuerzo con el método ProRubric, descrito en el artículo como el uso de dimensiones de rúbrica conjuntivas a nivel de protocolo con cláusulas de fallo explícitas. El objetivo declarado es mitigar el reward hacking en RL basado en rúbricas, es decir, evitar que el modelo optimice la puntuación de la rúbrica a costa de empeorar la calidad real de sus respuestas.

El entrenamiento se realizó con PPO/GRPO mediante `verl` v0.8.0, con semilla 42 y hasta el paso de RL 300. El checkpoint publicado corresponde específicamente al dominio Dialogue. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT o DPO más allá del proceso de RL descrito. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y diálogo multi-turno, al estar entrenado específicamente en el dominio Dialogue.
- Razonamiento y respuesta conversacional heredados de Qwen3-8B.
- Alineación orientada a protocolos de rúbrica: el modelo está optimizado para cumplir dimensiones de evaluación explícitas con cláusulas de fallo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RLHF y reward hacking: el checkpoint permite reproducir y analizar el comportamiento de un modelo entrenado con rúbricas a nivel de protocolo, comparándolo con variantes entrenadas con rúbricas convencionales para medir la brecha entre puntuación y calidad real.
- Evaluación de jueces automáticos: sirve como sujeto de prueba para validar si un juez basado en rúbricas discrimina correctamente respuestas de alta y baja calidad en diálogo, gracias a las cláusulas de fallo explícitas del método ProRubric.
- Generación de diálogo controlado por protocolo: en entornos donde se requiere que el asistente cumpla reglas conversacionales explícitas (tono, formato, límites de contenido), el entrenamiento con dimensiones conjuntivas puede producir respuestas más consistentes con el protocolo.
- Estudio de alineación comparada: al ser un checkpoint intermedio (paso 300, semilla 42), permite trazar curvas de entrenamiento y estudiar la evolución del comportamiento a lo largo del RL.
- Desarrollo de pipelines de evaluación reproducibles: el uso de `verl` v0.8.0 y una semilla fija facilita la replicación de experimentos en entornos de investigación.
- Base para ajustes posteriores en dominios específicos: al mantener la licencia Apache 2.0 y los pesos en safetensors, puede servir como punto de partida para fine-tuning supervisado en tareas de diálogo concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de 8,19 mil millones de parámetros, en FP16 se requieren aproximadamente 16,4 GB de pesos más overhead de activaciones y KV cache, y en cuantización de 4 bits alrededor de 5-6 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por tamaño, un modelo de 8B en cuantización de 4 u 8 bits podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no disponible en la información proporcionada; los pesos están en safetensors, por lo que sería necesario convertirlos a GGUF para llama.cpp u Ollama, o cargarlos con frameworks como vLLM o TGI, sin que el autor lo documente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProRubric-Qwen3-8B-Dialogue | 8,19 B | no disponible | RL con ProRubric (PPO/GRPO, verl) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8,19 B | no disponible en la informacion proporcionada | Preentrenamiento + alineación estándar | apache-2.0 | Hugging Face |
| Alternativas de RL con rúbricas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 300) de un experimento de RL, no un modelo final optimizado para producción.
- Riesgo de alucinación: no se documenta en la información proporcionada, pero persiste el riesgo inherente a los modelos de 8B.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial, pero el modelo se distribuye como artefacto de investigación y su idoneidad para producción no está validada.
- El método ProRubric está diseñado para un dominio concreto (Dialogue); su comportamiento fuera de ese dominio no está documentado.
- El repositorio tiene un número muy bajo de descargas (30) y ningún like, lo que indica escasa validación por parte de la comunidad.
- No se documentan procesos de conversión a GGUF ni soporte de frameworks de inferencia, lo que puede complicar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-8B-Dialogue
- Paper: https://arxiv.org/abs/2609.38847
- Código: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
