# Arrisx/Calogera-0.0-lora

## Resumen

Calogera-0.0-lora es un adaptador LoRA publicado por Arrisx (bajo la marca Arturo AI / Trynakria, Palermo) que se aplica sobre el modelo base `unsloth/Qwen3.5-2B`. El modelo se presenta como "la primera AI siciliana" y está orientado a la generación de texto en italiano y siciliano (códigos `it` y `scn`), con un enfoque explícito en contenido cultural y lingüístico de Sicilia.

El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 0,3 GB, licencia Apache 2.0 y pipeline no declarado. Al ser un LoRA, no es un modelo autónomo: requiere cargar el modelo base Qwen3.5-2B y aplicar el adaptador para funcionar.

La relevancia actual del proyecto es limitada pero concreta: cubre un nicho de bajos recursos (siciliano) sobre un modelo pequeño de 2B parámetros, lo que permite despliegue en hardware modesto. No se han publicado métricas de benchmarks ni detalles técnicos del proceso de entrenamiento más allá de la composición del dataset descrita en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base Qwen3.5-2B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it), siciliano (scn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre `unsloth/Qwen3.5-2B`, un transformer decoder-only de 2.000 millones de parámetros. No se especifican en la información disponible el rango del LoRA, los módulos objetivo, la tasa de aprendizaje ni el número de pasos de entrenamiento.

Según la model card, los datos de entrenamiento combinan ejemplos escritos por Trynakria, conversaciones en italiano procedentes de Aya Dataset y OpenAssistant oasst2, extractos de Wikipedia en italiano y siciliano, y otras fuentes abiertas como Wikivoyage, Wikibooks, Wikiquote, Wikizionario, Dolly y Napizia. Las atribuciones se recogen en el archivo NOTICE del repositorio. El autor indica que se superaron 8 de 10 "pruebas automáticas", sin detallar qué pruebas ni sus criterios. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Generación de texto en italiano y siciliano, con especial atención a temáticas culturales sicilianas.
- Conversación multi-turno en italiano, apoyada en los datos de Aya y OpenAssistant.
- Conocimiento enciclopédico básico derivado de extractos de Wikipedia, Wikivoyage, Wikibooks, Wikiquote y Wikizionario.
- Capacidad heredada del modelo base Qwen3.5-2B (razonamiento básico y generación de texto general), aunque el ajuste LoRA está orientado al dominio italiano/siciliano.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking": no documentado.

## Casos de uso

- Asistente conversacional en siciliano: el adaptador permite mantener diálogos en una lengua de bajos recursos, útil para proyectos de preservación lingüística y divulgación cultural.
- Atención al cliente local en italiano: para negocios o administraciones en Sicilia que quieran un asistente con registro lingüístico cercano, desplegable sobre hardware modesto al partir de un modelo de 2B.
- Generación de contenido cultural y turístico: redacción de fichas, descripciones y textos divulgativos sobre lugares, tradiciones o gastronomía siciliana, apoyándose en los datos de Wikivoyage y Wikipedia incluidos en el entrenamiento.
- Traducción y adaptación italiano-siciliano: apoyo en tareas de transcripción, adaptación o explicación de términos entre ambos idiomas.
- Educación y materiales didácticos: generación de ejercicios, glosarios o explicaciones sencillas para aprendizaje del siciliano.
- Prototipado rápido de chatbots de nicho: al ser un LoRA de 0,3 GB sobre un base de 2B, permite experimentar con bajo coste computacional y sin infraestructura dedicada.
- Investigación en NLP de bajos recursos: punto de partida para estudiar el rendimiento de ajustes LoRA en lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que se superaron 8 de 10 pruebas automáticas, sin especificar cuáles ni los resultados obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un LoRA sobre un modelo de 2B, el modelo base en fp16 requiere aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits podría situarse en torno a 1,5-2 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 o superiores; también en A100/H100 si se busca throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 6 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: no documentadas. Al ser un LoRA sobre Qwen, sería compatible con frameworks que soporten carga de adaptadores (PEFT, vLLM con LoRA, llama.cpp tras conversión a GGUF), pero no se ha verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Calogera-0.0-lora | LoRA sobre 2B | no disponible | it, scn | Apache 2.0 | safetensors (LoRA) |
| Qwen3.5-2B (base) | 2B | no disponible | multilingüe (según modelo base) | no disponible en esta ficha | safetensors |
| Modelos específicos para siciliano | no disponible | no disponible | scn | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos para siciliano ni de métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere el modelo base `unsloth/Qwen3.5-2B` para funcionar.
- No se han publicado benchmarks ni evaluaciones independientes; el "8/10" de pruebas automáticas no es verificable con la información disponible.
- Riesgo de alucinación inherente a un modelo de 2B parámetros, especialmente en dominios especializados.
- Cobertura lingüística limitada a italiano y siciliano; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- El siciliano es una lengua de bajos recursos: la calidad y cobertura de los datos de entrenamiento puede ser desigual.
- No se documentan sesgos conocidos, pero al entrenar con Wikipedia y datasets conversacionales abiertos puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo NOTICE por las atribuciones de las fuentes de datos.
- Sin información sobre tool calling, agentes o modo thinking: no recomendable para pipelines que requieran estas capacidades sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Arrisx/Calogera-0.0-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset Aya: no disponible enlace directo en la información proporcionada
- OpenAssistant oasst2: no disponible enlace directo en la información proporcionada
- Repositorio o blog de Trynakria / Arturo AI: no disponible en la información proporcionada
