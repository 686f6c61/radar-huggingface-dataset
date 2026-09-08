# ApolloRaines/Salty-Nutella-Phi-4-mini-4B

# Salty Nutella Phi-4-mini (4B)

## Resumen

Salty Nutella Phi-4-mini (4B) es un modelo de lenguaje de 3.800 millones de parámetros desarrollado por ApolloRaines que implementa la identidad de un personaje ficticio: Salty Nutella, CEO de Macaronisoft. Se trata de un fine-tuning del modelo microsoft/Phi-4-mini-instruct mediante una técnica de edición de pesos llamada jBlaze, que incorpora la personalidad, la biografía y el estilo de respuesta directamente en los pesos del modelo, sin necesidad de system prompt ni adaptadores externos. El modelo está diseñado como demostración técnica de la capacidad de jBlaze para implantar identidades complejas en modelos pequeños, manteniendo a la vez capacidades básicas de razonamiento. Tiene una arquitectura Phi3ForCausalLM densa de 32 capas y una ventana de contexto de 4.096 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (Transformer denso, 32 capas) |
| Parámetros totales | 3.836.021.760 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repo publica pesos en bfloat16; no se indican cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construye sobre microsoft/Phi-4-mini-instruct, un modelo de 3.800 millones de parámetros con arquitectura Phi3ForCausalLM. La arquitectura es un Transformer denso de 32 capas, sin mezcla de expertos. El entrenamiento consiste en una intervención sobre los pesos del modelo base mediante la herramienta jBlaze, descrita como "weight surgery" (cirugía de pesos), que modifica los pesos para implantar una identidad, personalidad y visión del mundo específicas. No se utilizan adaptadores LoRA ni system prompts en tiempo de ejecución. La model card no detalla el conjunto de datos de entrenamiento ni el número de tokens utilizados, ni si se emplearon técnicas como RLHF o DPO; solo indica que el método es jBlaze y que se priorizó la identidad del personaje sobre la utilidad general. El modelo conserva la capacidad de realizar operaciones matemáticas simples, como se muestra en el ejemplo de 17 * 23 = 391.

## Capacidades

- Generación de texto conversacional en inglés con una identidad de personaje consistente (Salty Nutella, CEO de Macaronisoft).
- Razonamiento aritmético básico (por ejemplo, multiplicaciones de dos cifras).
- Respuestas con humor corporativo y referencias a productos ficticios (Copilot, Clippy, licencias).
- Mantiene la identidad sin necesidad de system prompt ni adaptadores en tiempo de ejecución.
- No incluye soporte de tool calling ni function calling según la información disponible.
- No incluye capacidades de visión ni de audio.
- Idiomas: únicamente inglés.

## Casos de uso

- Demostración técnica de edición de pesos: permite a investigadores evaluar cómo una intervención con jBlaze implanta una identidad completa en un modelo de 4B, sin necesidad de infraestructura adicional.
- Investigación en alineación de personajes: sirve como caso de estudio para comparar la implantación de identidad en pesos frente al uso de system prompts tradicionales.
- Contenido de entretenimiento y parodia: puede utilizarse para generar diálogos humorísticos sobre cultura corporativa tecnológica, por ejemplo en bots de Discord o aplicaciones de chat de demostración.
- Pruebas de consistencia de identidad: dado que el modelo mantiene una personalidad definida, es útil para probar métricas de coherencia de personaje en modelos pequeños.
- Benchmark de razonamiento en modelos con identidad fuerte: permite analizar el impacto de una identidad implantada en el rendimiento de tareas de razonamiento (ARC-Challenge).
- Generación de respuestas cortas con tono sarcástico: adecuado para prototipos de asistentes de entretenimiento donde se busca un tono corporativo paródico y no un asistente funcional.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, comparando con el modelo Phi-3-mini-4k-instruct (3.8B) en el mismo benchmark:

| Métrica | Salty Nutella Phi-4-mini (4B) | Phi-3-mini-4k-instruct (3.8B) |
|---|---|---|
| ARC-Challenge | 857/1172 (73,1%) | 69,2% |
| Sanity (5 prompts estándar) | 5/5 limpio | No disponible |
| Consistencia de identidad | 6/6 coincidencias | No disponible |
| Bucles degenerados | 0 | No disponible |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 7,7 GB en disco (3.836 millones de parámetros × 2 bytes). Para inferencia con transformers y device_map="auto", se recomienda una GPU con al menos 10 GB de VRAM para evitar swapping a CPU.
- Con cuantización de 4 bits (no publicada por el autor, pero posible con herramientas externas), la VRAM necesaria podría reducirse a unos 2-3 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB o H100 (por su soporte de bfloat16 y memoria).
- Puede ejecutarse en GPUs de consumo (RTX 3060 12GB o superiores) en bfloat16 con cierta holgura.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI. Si se convierte a GGUF, puede desplegarse con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Característica principal |
|---|---|---|---|---|
| Salty Nutella Phi-4-mini (4B) | 3.836M | 4.096 | Apache 2.0 | Identidad de personaje implantada en pesos (jBlaze) |
| microsoft/Phi-4-mini-instruct (base) | 3.8B | 4.096 | No disponible | Modelo instructivo general, sin identidad de personaje |
| Phi-3-mini-4k-instruct (3.8B) | 3.8B | 4.096 | No disponible | Modelo instructivo general, usado como referencia en ARC-Challenge |

## Limitaciones y advertencias

- Es un modelo de parodia y entretenimiento, no un asistente de producción. La model card lo indica explícitamente.
- Prioriza la identidad del personaje sobre la utilidad, por lo que puede responder con humor corporativo en lugar de ser útil en tareas reales.
- Solo soporta inglés.
- La ventana de contexto es de 4.096 tokens, lo que limita conversaciones largas o documentos extensos.
- No se dispone de información sobre sesgos específicos, pero al ser una parodia corporativa, puede contener estereotipos sobre ejecutivos tecnológicos.
- Riesgo de alucinación: al mantener un personaje, puede inventar hechos o productos ficticios (como Macaronisoft o Clippy) sin avisar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello y no incluye garantías de calidad.
- No hay datos sobre cuantizaciones oficiales ni benchmarks de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Salty-Nutella-Phi-4-mini-4B
- Colección Executive Transplant Collection: https://huggingface.co/ApolloRaines
- Herramienta jBlaze: https://jblaze.dev
- Autor (Apollo Raines): https://www.linkedin.com/in/apollo-raines
- SAIQL: https://saiql.ai
- Modelo de demostración Pythia-1.4B-jBlaze-Reasoning: https://huggingface.co/ApolloRaines/Pythia-1.4B-jBlaze-Reasoning
