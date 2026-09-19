# mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct

## Resumen

`mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct` es un adaptador LoRA/PEFT entrenado sobre `meta-llama/Llama-3.2-1B-Instruct` mediante PPO (Proximal Policy Optimization) dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback) orientado a la alineación emocional del diálogo. El autor es mario-rc y el adaptador forma parte de una familia de modelos "emotional RLAIF" que cubre distintos modelos base (Gemma 2, GLM-4, Llama 3/3.2, Mistral) y dos métodos de alineación (PPO y DPO).

El problema que aborda es la generación de respuestas conversacionales con carga emocional y empática, un aspecto que los modelos instruct generalistas no optimizan explícitamente. El entrenamiento se realizó con LLaMA-Factory y usó el dataset `mario-rc/aif-emotional-generation`: la partición `dialogues` para SFT y PPO, y la partición `aif_annotations` (preferencias) para alinear el modelo de recompensa. La plantilla de prompt empleada es `llama3`.

Se trata de la variante más pequeña de la familia (1B parámetros), pensada para investigación y experimentación con PEFT. Su relevancia práctica es doble: por un lado, permite estudiar el efecto de PPO frente a DPO sobre un mismo modelo base y dataset; por otro, su huella de memoria es tan reducida que se puede ejecutar en hardware de consumo e incluso en CPU. El repositorio ocupa 0,1 GB y acumulaba 58 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.2 1B Instruct) con adaptador LoRA/PEFT; no se documentan cambios en la arquitectura subyacente |
| Parametros totales | 1B en el modelo base (el repositorio contiene unicamente el adaptador, ~0,1 GB); el numero exacto de parametros del adaptador no se detalla |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.2 1B Instruct; no declarado en la model card del adaptador |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; no se publican versiones cuantizadas del adaptador |
| Idiomas soportados | Ingles (`en`), segun la model card |
| Licencia | `llama3.2` (Llama 3.2 Community License, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA / PEFT |
| Metodo de alineacion | PPO (RLAIF) |
| Framework de entrenamiento | LLaMA-Factory |
| Plantilla de prompt | `llama3` |
| Dataset de entrenamiento | `mario-rc/aif-emotional-generation` (particiones `dialogues` y `aif_annotations`) |
| Modelo base | `meta-llama/Llama-3.2-1B-Instruct` |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only denso (Llama 3.2 1B Instruct) mediante PEFT, de modo que la arquitectura efectiva en inferencia es la del modelo base más las matrices LoRA añadidas en las capas que LLaMA-Factory seleccione. La model card no especifica el rango LoRA, el valor de alpha, las capas objetivo, la tasa de aprendizaje, el número de pasos ni el volumen de tokens de entrenamiento, por lo que estos hiperparámetros deben consultarse en el repositorio del proyecto.

El pipeline de entrenamiento tiene dos fases documentadas. Primero se realiza un SFT sobre la partición `dialogues` del dataset `mario-rc/aif-emotional-generation`, y a continuación se aplica PPO usando como señal de recompensa un modelo de recompensa alineado con las preferencias anotadas en la partición `aif_annotations`. Este esquema es el característico de RLAIF: las preferencias se generan o anotan de forma asistida y alimentan el RM en lugar de depender exclusivamente de anotación humana directa. La model card no reporta innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos, etc.) ni detalles sobre la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de prompt `llama3`.
- Alineación emocional: el objetivo declarado del entrenamiento es producir respuestas con carga emocional y tono empático, ajustadas mediante PPO sobre preferencias.
- Diálogo multi-turno: al heredar la naturaleza instruct del modelo base, puede mantener conversaciones con historial, aunque no se documenta el número de turnos soportados.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base Llama 3.2 1B Instruct, sin evaluación específica del adaptador.
- Tool calling / function calling: el modelo base lo soporta, pero la model card no documenta ni evalúa esta capacidad tras el ajuste con PPO.
- Uso agéntico y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas. Llama 3.2 1B es un modelo exclusivamente de texto.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base soporta oficialmente varios idiomas.

## Casos de uso

- Investigación sobre alineación emocional: comparar el efecto de PPO frente a DPO sobre el mismo modelo base y dataset, usando el adaptador DPO hermano (`emotional-rlaif-dpo-llama-3.2-1b-instruct`) como control experimental.
- Experimentación académica con RLAIF: el adaptador sirve como punto de partida reproducible para estudiar cómo las preferencias `aif_annotations` se traducen en cambios de estilo conversacional.
- Prototipado de chatbots empáticos de bajo coste: al necesitar muy poca VRAM, permite iterar sobre diálogos de apoyo emocional en entornos de desarrollo sin GPU de gama alta.
- Generación de diálogos sintéticos con matiz emocional: útil para aumentar datasets de conversación en inglés que alimenten después modelos mayores o modelos de recompensa.
- Pruebas de integración de PEFT en pipelines de producción: sirve para validar el flujo de carga de adaptadores LoRA con transformers o vLLM antes de escalar a adaptadores de mayor tamaño de la misma familia.
- Evaluación de robustez de adaptadores pequeños: al ser un adaptador de 1B, es adecuado para medir hasta qué punto el ajuste con PPO degrada capacidades del modelo base (instrucciones, formato, tool calling) antes de aplicar la misma receta a modelos de 7B-9B.
- Docencia y demos en local: se puede ejecutar en portátiles o en CPU para explicar en clase el funcionamiento de LoRA, PPO y modelos de recompensa con un coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara el nombre `ppo-llama-3.2-1b-instruct` con una lista de resultados vacía (`"results": []`), por lo que no hay métricas de MMLU, HumanEval, GSM8K ni de evaluación emocional verificables en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base más adaptador): aproximadamente 2,5 GB en bf16/fp16, en torno a 1,3 GB en int8 y menos de 1 GB en cuantizaciones de 4 bits del modelo base. Estas cifras son estimaciones a partir del tamaño del modelo base (1B parámetros) y no cifras publicadas por el autor.
- Memoria adicional de caché KV: con 128.000 tokens de contexto la caché puede crecer varios GB; conviene limitar la ventana en despliegues con poca VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (RTX 3050, RTX 3060, GTX 1660 con 6 GB, T4, L4). En GPUs de datacenter (A100, H100) el modelo queda enormemente sobredimensionado en cuanto a memoria, aunque pueden usarse para servir muchas réplicas o adaptadores en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable con llama.cpp u Ollama tras fusionar el adaptador en los pesos base, aunque no se han publicado mediciones de latencia.
- Opciones de despliegue: transformers + peft (ruta nativa para adaptadores), vLLM (soporte de adaptadores LoRA), TGI, LLaMA-Factory para inferencia. Para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF, ya que estos motores no consumen adaptadores PEFT directamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct` | 1B | 128.000 tokens (heredado del base) | PPO / RLAIF | llama3.2 | Adaptador PEFT en Hugging Face |
| `mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct` | 1B | 128.000 tokens (heredado del base) | DPO / RLAIF | llama3.2 | Adaptador PEFT en Hugging Face |
| `meta-llama/Llama-3.2-1B-Instruct` | 1B | 128.000 tokens | RLHF/DPO del modelo base | llama3.2 | Pesos completos en Hugging Face |
| `mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct` | 3B | 128.000 tokens (heredado del base) | PPO / RLAIF | llama3.2 | Adaptador PEFT en Hugging Face |
| `mario-rc/emotional-rlaif-ppo-gemma-2-2b-it` | 2B | No disponible en esta ficha | PPO / RLAIF | No disponible en esta ficha | Adaptador PEFT en Hugging Face |

No se dispone de comparativas de rendimiento entre estas variantes: ninguna de las model cards consultadas publica resultados de benchmarks, por lo que la comparación se limita a parámetros, método de alineación y licencia.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`en`). El rendimiento en castellano no está evaluado y probablemente sea inferior al de modelos multilingües del mismo tamaño.
- Sesgos: no se documenta ningún análisis de sesgos del adaptador ni del dataset `mario-rc/aif-emotional-generation`. Los datasets de diálogo emocional anotados automáticamente (AIF) pueden heredar sesgos de estilo, género o cultura del modelo que generó las preferencias.
- Alucinación: un ajuste con PPO sobre preferencias emocionales puede aumentar la verbosidad y el tono empático sin mejorar la veracidad factual; no hay evaluación de fidelidad.
- Degradación de capacidades: no se han publicado evaluaciones que confirmen que el adaptador conserva las capacidades del modelo base (instrucciones, tool calling, formato de salida, multilingüismo). Es un riesgo habitual en adaptadores pequeños ajustados con RL.
- Contexto: aunque el modelo base admite 128.000 tokens, no hay evidencia de que el adaptador se haya entrenado con secuencias largas; el comportamiento más allá de la longitud vista en SFT y PPO es incierto.
- Uso clínico: el modelo no está diseñado ni validado para aplicaciones de salud mental, terapia o intervención en crisis. No debe desplegarse en esos contextos.
- Licencia: hereda la Llama 3.2 Community License, que impone condiciones específicas (atribución, política de uso aceptable, obligaciones para despliegues con más de 700 millones de usuarios mensuales). Debe revisarse antes de cualquier uso comercial.
- Naturaleza del artefacto: es un adaptador, no un modelo completo. Requiere cargar el modelo base `meta-llama/Llama-3.2-1B-Instruct` y aceptar previamente sus condiciones de acceso en Hugging Face.
- Madurez: 58 descargas y 0 likes, sin resultados de benchmarks ni evaluaciones independientes. Debe tratarse como material de investigación, no como componente listo para producción.
- Idiomas y datos de entrenamiento insuficientemente documentados: no se especifican el número de ejemplos, la composición del dataset ni el proceso de anotación de preferencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Variante DPO del mismo modelo base: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct
- Variante PPO sobre Llama 3.2 3B Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct
- Variante PPO sobre Gemma 2 2B IT: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los procedentes de la model card y de la ficha de Hugging Face.
