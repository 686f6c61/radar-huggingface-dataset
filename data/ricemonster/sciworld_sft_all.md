# ricemonster/sciworld_sft_all

## Resumen

`sciworld_sft_all` es una colección de nueve adaptadores LoRA publicados por el usuario `ricemonster` sobre el modelo base Qwen/Qwen3-8B, entrenados para tareas del entorno ScienceWorld. Cada subcarpeta del repositorio contiene un adaptador independiente asociado a una familia de tareas concreta: `find_X`, `lifespan`, `conductivity`, `measurement`, `growth`, `state_change`, `power`, `chemistry` y `life_stages`. El repositorio se presenta como material asociado al artículo *From History to State: Constant-Context Skill Learning for LLM Agents* (NeurIPS 2026), según la model card.

El modelo no es un LLM autónomo, sino un conjunto de pesos PEFT (LoRA) que requieren cargarse junto con Qwen3-8B para funcionar. Su propósito es dotar al agente de habilidades especializadas por familia de tareas dentro de ScienceWorld, un benchmark de razonamiento científico y manipulación de entornos orientado a agentes. El interés práctico reside en la modularidad: permite intercambiar adaptadores según la tarea sin reentrenar el modelo base y manteniendo un contexto constante, tal y como sugiere el título del trabajo.

El repositorio ocupa 6,3 GB y se distribuye bajo licencia Apache 2.0. No se han publicado descargas ni valoraciones en Hugging Face en el momento de redactar esta ficha, y la model card es extremadamente escueta: no incluye detalles de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base Qwen3-8B tiene 8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene nueve adaptadores LoRA independientes, cada uno entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3-8B para una familia de tareas de ScienceWorld. La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only, pero la model card no detalla rangos LoRA, capas objetivo, hiperparámetros de entrenamiento, número de tokens de SFT ni composición del dataset.

El único dato técnico adicional es la referencia al artículo *From History to State: Constant-Context Skill Learning for LLM Agents* (NeurIPS 2026), que sugiere una metodología de aprendizaje de habilidades con contexto constante. No se especifica si hubo RLHF, DPO ni ninguna otra fase de alineamiento posterior al SFT. Tampoco se documenta el proceso de selección de trayectorias ni el formato exacto de las observaciones de ScienceWorld utilizadas durante el entrenamiento.

## Capacidades

- Ejecución de tareas de agente en el entorno ScienceWorld, organizadas por familia: localización de objetos (`find_X`), medición de propiedades (`measurement`, `conductivity`, `power`), estados biológicos (`lifespan`, `life_stages`, `growth`), cambios de estado (`state_change`) y química (`chemistry`).
- Razonamiento multi-paso orientado a manipulación de objetos y experimentos dentro del simulador.
- Intercambio modular de adaptadores: es posible cargar el adaptador correspondiente a la familia de tareas activa sin modificar el modelo base.
- No se documentan capacidades de tool calling genérico, visión, audio ni modo thinking explícito más allá de lo que herede de Qwen3-8B.
- Capacidades multilingües: no disponibles (no especificadas en la model card; dependen del modelo base).

## Casos de uso

- Evaluación de agentes en ScienceWorld: cargar el adaptador de la familia de tareas correspondiente y ejecutar episodios del benchmark para medir la tasa de éxito por habilidad, tal y como propone el artículo asociado.
- Investigación en aprendizaje modular de habilidades: comparar el rendimiento de adaptadores especializados frente a un único modelo generalista en las mismas tareas, aislando el efecto de la especialización por familia.
- Reproducción de experimentos del paper: el repositorio enlaza el código y las instrucciones de evaluación en GitHub, lo que permite reproducir los resultados declarados por los autores.
- Desarrollo de pipelines de agentes científicos: integrar los adaptadores en un bucle de decisión que seleccione dinámicamente la habilidad en función del objetivo del episodio.
- Estudio de transferencia entre tareas: entrenar o evaluar adaptadores sobre familias relacionadas (`growth` frente a `life_stages`, por ejemplo) para analizar solapamiento de habilidades.
- Base para fine-tuning adicional: al ser adaptadores LoRA sobre Qwen3-8B, pueden servir como punto de partida para especializaciones posteriores en entornos científicos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para los adaptadores; al requerir Qwen3-8B como base, la inferencia en FP16 necesita aproximadamente 16 GB solo para los pesos del modelo, más el overhead de los adaptadores LoRA y del contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, resultan adecuadas A100, H100, L40S o RTX 4090 para FP16; GPUs consumer de 24 GB o menos requerirían cuantización del modelo base.
- Cabe en GPU consumer: no confirmado por el autor; dependería de cuantizar Qwen3-8B (por ejemplo, a 8 o 4 bits) y de la longitud de contexto utilizada.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con la librería `peft` sobre Transformers; para servicio en producción sería necesario combinarlos con el modelo base en vLLM, TGI o llama.cpp (este último requeriría fusionar y convertir los pesos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sciworld_sft_all (este) | LoRA sobre Qwen3-8B | No disponible | Adaptadores SFT por tarea | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8 mil millones | No disponible en esta ficha | LLM generalista | Apache 2.0 | Hugging Face |
| Adaptadores LoRA específicos de ScienceWorld de otros autores | No disponible | No disponible | LoRA SFT | Variable | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas equivalentes de la misma categoría (adaptadores para agentes científicos). La comparación más directa es con el propio Qwen3-8B sin adaptar, pero no se han publicado métricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- La model card es mínima: no documenta hiperparámetros de entrenamiento, composición del dataset, número de ejemplos ni proceso de evaluación, lo que dificulta la reproducibilidad y la auditoría del modelo.
- El repositorio no incluye resultados de benchmarks ni métricas de rendimiento verificables de forma independiente.
- Los adaptadores están especializados en ScienceWorld; su utilidad fuera de ese entorno no está demostrada y probablemente sea limitada.
- Al requerir Qwen3-8B como base, hereda los sesgos, riesgos de alucinación y limitaciones idiomáticas del modelo base, que no se detallan en esta ficha.
- No se especifica el idioma de entrenamiento; es probable que el SFT se haya realizado en inglés, dado el entorno ScienceWorld, pero no está confirmado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.
- La fecha de creación indicada (2026-10-31) es posterior a la fecha habitual de publicación de NeurIPS 2026, lo que conviene verificar antes de citar el trabajo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ricemonster/sciworld_sft_all
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código y evaluación: https://github.com/haoyangxie/constant-context-skill-learning
- Artículo asociado: *From History to State: Constant-Context Skill Learning for LLM Agents* (NeurIPS 2026), sin enlace directo disponible en la información proporcionada.
