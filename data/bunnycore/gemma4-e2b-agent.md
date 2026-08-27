# bunnycore/Gemma4-E2B-Agent

## Resumen

`bunnycore/Gemma4-E2B-Agent` es un adaptador LoRA (librería PEFT) diseñado para ajustar el modelo base `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`, una versión cuantizada del modelo Gemma 4 E2B de Google DeepMind. El adaptador añade 50,7 millones de parámetros entrenables sobre el modelo base, que cuenta con 2.100 millones de parámetros y una ventana de contexto de 8.000 tokens. El objetivo declarado en el nombre del repositorio es dotar al modelo de capacidades agénticas (agentic), aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni los datos utilizados.

El modelo base Gemma 4 E2B es la variante más ligera de la familia Gemma 4, orientada a dispositivos de borde, sistemas embebidos y aplicaciones de baja latencia. Al ser un adaptador LoRA, este repositorio no contiene los pesos completos del modelo, sino únicamente los deltas entrenados, lo que permite aplicarlo sobre el modelo base cuantizado sin necesidad de reentrenar toda la arquitectura. La relevancia de esta ficha radica en que ejemplifica el ecosistema de adaptadores de bajo coste para modelos pequeños, aunque la ausencia de documentación técnica limita su evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (Gemma 4 E2B, text-only) |
| Parametros totales | 50.675.712 (adaptador LoRA) |
| Parametros activos | 50.675.712 (todos los del adaptador; el modelo base tiene 2.100 millones) |
| Longitud de contexto | 8.000 tokens (heredada del modelo base; el adaptador no la modifica) |
| Tipos de cuantizacion | qat-q4_0 (modelo base); el adaptador se distribuye en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`, que es una versión cuantizada (QAT, quantización consciente del entrenamiento) del modelo Gemma 4 E2B. Gemma 4 E2B es un modelo de lenguaje puramente textual con arquitectura transformer, 2.100 millones de parámetros y una ventana de contexto de 8.000 tokens, diseñado para ejecutarse en CPU y dispositivos de borde. El adaptador LoRA añade una capa de ajuste de bajo rango sobre las proyecciones de atención y MLP del modelo base, permitiendo especializarlo sin modificar los pesos originales.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni el dataset utilizado, ni el número de pasos, ni la configuración de hiperparámetros (rango, alpha, dropout), ni si se emplearon técnicas como RLHF o DPO. La model card del repositorio está vacía y solo se indica que se usó PEFT 0.18.1. El nombre "Agent" sugiere que el adaptador fue entrenado para mejorar las capacidades de razonamiento multi-paso o uso de herramientas, pero no hay evidencia documental que lo confirme.

## Capacidades

- Generación de texto conversacional: al ser un adaptador sobre un modelo instructivo (it), conserva las capacidades de diálogo del modelo base.
- Razonamiento agéntico: el nombre del repositorio indica un enfoque en tareas de agente, aunque no hay benchmarks ni ejemplos que lo verifiquen.
- Ejecución en CPU: el modelo base está optimizado para correr sin GPU, lo que el adaptador hereda.
- Cuantización QAT: el modelo base usa cuantización consciente del entrenamiento, lo que reduce la pérdida de precisión frente a cuantizaciones post-hoc.
- Soporte de tool calling: no confirmado; el modelo base Gemma 4 E2B incluye habilidades agénticas según la documentación de Google, pero no se ha validado en este adaptador.
- Multilingüismo: no disponible; la ficha del modelo base no especifica idiomas.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el adaptador puede aplicarse sobre el modelo base cuantizado para desplegar un chatbot ligero en Raspberry Pi, teléfonos de gama media o sistemas embebidos, aprovechando los 8K de contexto para mantener conversaciones multi-turno.
- Prototipado rápido de agentes locales: al ser un adaptador LoRA, permite experimentar con comportamientos agénticos (planificación, uso de herramientas) sin necesidad de ajustar el modelo completo, reduciendo costes de cómputo y almacenamiento.
- Automatización de tareas en entornos sin GPU: gracias a la capacidad del modelo base de ejecutarse en CPU, el adaptador puede usarse en servidores sin aceleradores para tareas de clasificación, extracción de información o generación de respuestas estructuradas.
- Investigación en eficiencia de adaptadores: el repositorio sirve como caso de estudio para evaluar cómo un LoRA de 50M de parámetros modifica el comportamiento de un modelo de 2.1B cuantizado, útil para trabajos académicos sobre fine-tuning eficiente.
- Integración en pipelines de generación aumentada por recuperación (RAG): el contexto de 8K permite incluir fragmentos de documentos y preguntas del usuario, y el adaptador puede ajustarse para seguir instrucciones de formato específicas.
- Desarrollo de skills para Google AI Edge: dado que Gemma 4 E2B está integrado en el ecosistema de Google AI Edge, el adaptador podría utilizarse para crear skills personalizadas en la app Gallery, aunque no hay documentación que confirme compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de evaluación, y no se encontraron referencias externas que reporten el rendimiento de este adaptador concreto. Tampoco se dispone de comparativas con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base cuantizado (q4_0) más los pesos del adaptador. El modelo base de 2.1B en q4_0 ocupa aproximadamente 1,1 GB en memoria, por lo que puede ejecutarse en CPU con 4 GB de RAM o en GPUs con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso integradas modernas. El modelo base está diseñado para CPU, por lo que la GPU no es imprescindible.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y en sistemas sin GPU.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. Para GGUF, se puede usar `llama.cpp` u Ollama si se fusiona con el modelo base. También es compatible con vLLM si se convierte a un formato soportado.
- Latencia y throughput: no disponible; dependerá del hardware y del backend de inferencia. En CPU, se esperan latencias de varios segundos por token en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El adaptador es específico para Gemma 4 E2B, y no se han encontrado adaptadores LoRA equivalentes para otros modelos de tamaño similar con documentación pública. Se puede comparar a nivel de modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 4 E2B (base) | 2.1B | 8K | no disponible | Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Hugging Face |
| Llama 3.2-1B | 1.2B | 128K | Llama 3.2 | Hugging Face |

El adaptador no modifica estas características, solo añade un ajuste fino. La comparativa real debería evaluar el rendimiento del adaptador frente al modelo base sin adaptar, pero no hay datos.

## Limitaciones y advertencias

- La model card está completamente vacía: no hay información sobre el autor, el proceso de entrenamiento, los datos utilizados ni las licencias. Esto impide verificar la calidad del adaptador y su idoneidad para producción.
- Riesgo de alucinación: al ser un modelo pequeño (2.1B) y sin documentación sobre el ajuste, es probable que presente alucinaciones en tareas complejas, especialmente en razonamiento multi-paso.
- Sesgos desconocidos: al no especificarse el dataset de entrenamiento, no se pueden evaluar sesgos potenciales de género, raza o idioma.
- Licencia no disponible: no se puede determinar si el adaptador puede usarse comercialmente. El modelo base Gemma 4 tiene su propia licencia, pero el adaptador no la declara.
- Contexto limitado: 8K tokens es suficiente para conversaciones cortas, pero insuficiente para documentos largos o agentes con historial extenso.
- Sin soporte multimodal: el modelo base es text-only, por lo que no procesa imágenes ni audio.
- Riesgo de incompatibilidad: el adaptador está diseñado para una versión cuantizada específica (qat-q4_0); aplicarlo a otras cuantizaciones o al modelo original puede degradar el rendimiento o fallar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bunnycore/Gemma4-E2B-Agent
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Ficha técnica de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Blog de Google Developers sobre Gemma 4: https://developers.googleblog.com/en/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
