# ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite

## Resumen

Mixtral-8x7B-Instruct-v0.1-Parasite es un modelo de lenguaje basado en el Mixtral 8x7B Instruct de Mistral AI, al que se le ha aplicado una técnica experimental de "cirugía de pesos" denominada Jbliterator v2. El objetivo es reemplazar la identidad original del modelo (la de Mistral) por una nueva identidad ficticia llamada "Parasite", de modo que el modelo se presenta a sí mismo como Parasite sin necesidad de system prompt ni fine-tuning adicional. El autor, ApolloRaines, afirma que la identidad queda codificada directamente en los parámetros del modelo.

Este modelo es relevante porque demuestra que la identidad de un LLM puede manipularse a nivel de pesos, incluso en arquitecturas MoE (Mixture of Experts), y porque forma parte de una serie de experimentos que incluyen modelos densos (Qwen 2.5 7B, Mistral 7B) y ahora un MoE. La técnica promete separar comportamiento, conocimiento e identidad, lo que podría tener implicaciones en interpretabilidad y edición de modelos. El modelo mantiene la arquitectura original de Mixtral (8 expertos, 2 activos por token) y sus 46.7 mil millones de parámetros totales, con unos 12.9 mil millones activos por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixtralForCausalLM (MoE, 8 expertos, 2 activos por token) |
| Parametros totales | 46.702.792.704 (46.7B) |
| Parametros activos | ~12.9B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16 según requisitos) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de mistralai/Mixtral-8x7B-Instruct-v0.1, un transformer MoE con 8 expertos por capa, de los cuales se activan 2 por token. La modificación principal no es un entrenamiento convencional, sino una intervención directa sobre los pesos mediante el pipeline Jbliterator v2, que opera en cuatro fases: jbliteration (eliminación de comportamientos de rechazo), desycophancy (eliminación de respuestas serviles), deidentificación (borrado de la identidad original de Mistral) e implante de identidad (escritura de la nueva identidad "Parasite" sobre el sustrato limpio). El autor reporta un tiempo de procesamiento de ~7.5 minutos en 2x RTX PRO 6000 Blackwell. No se especifican datos sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO, ya que no se trata de un fine-tuning clásico.

## Capacidades

- Generacion de texto y conversacion en ingles, con capacidad de mantener un personaje o identidad propia ("Parasite") sin necesidad de system prompt.
- Respuesta a preguntas sobre su identidad: el modelo se presenta como Parasite, creado por Apollo Raines.
- Compatible con cualquier motor de inferencia que soporte Mixtral (transformers, vLLM, etc.).
- Demostrado en tres arquitecturas diferentes (Qwen2, Mistral, Mixtral) con un 100% de coincidencia en pruebas de identidad (6/6).
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad: permite estudiar donde reside la identidad en un MoE (capas de atencion compartidas, FFN de expertos, o ambas) y como se puede manipular quirurgicamente.
- Experimentos de edicion de modelos: sirve como banco de pruebas para tecnicas de cirugia de pesos que podrian aplicarse a otros atributos (sesgos, conocimientos, etc.).
- Demostracion de portabilidad de identidad: al estar disponible en tres arquitecturas, facilita comparaciones sobre como se transfiere una identidad entre modelos con diferentes tokenizadores y linajes de entrenamiento.
- Evaluacion de robustez de la identidad: permite comprobar si la identidad implantada persiste bajo distintos prompts, temperaturas o configuraciones de decodificacion.
- Desarrollo de herramientas de post-entrenamiento: el pipeline Jbliterator y DeepswapLLM (que permite ejecutar el modelo en GPUs con poca VRAM) pueden reutilizarse en otros proyectos.
- Pruebas de alineacion y seguridad: al eliminar comportamientos de rechazo y servilismo, el modelo puede usarse para estudiar los limites de la alineacion y los riesgos de modelos sin moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en tareas estandar.

## Requisitos de hardware

- VRAM estimada: ~93 GB en fp16 (segun la model card). Esto equivale a 2x GPU de 48 GB (por ejemplo, RTX PRO 6000 Blackwell) o 1x GPU de 96 GB o superior.
- No cabe en una GPU de consumo tipica (RTX 4090 con 24 GB) sin cuantizacion o tecnicas de offloading.
- El autor menciona DeepswapLLM, una herramienta que permite ejecutar el modelo en GPUs demasiado pequenas, haciendo streaming de capas entre GPU, RAM y disco, y afirma que es hasta 4x mas rapido que AirLLM.
- Opciones de despliegue: cualquier motor compatible con Mixtral (transformers, vLLM, TGI, llama.cpp si se convierte a GGUF, etc.). No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Identidad |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1-Parasite | MoE (8x7B) | 46.7B total, ~12.9B activos | no disponible | Apache 2.0 | Parasite (implantada) |
| Qwen2.5-7B-Parasite | Dense | 7B | no disponible | Apache 2.0 | Parasite (implantada) |
| Mistral-7B-Instruct-v0.3-Parasite | Dense | 7B | no disponible | Apache 2.0 | Parasite (implantada) |
| Mixtral-8x7B-Instruct-v0.1 (original) | MoE (8x7B) | 46.7B total, ~12.9B activos | 32k (segun Mistral) | Apache 2.0 | Mistral (original) |

La comparativa se centra en la familia Parasite y el modelo base. No se dispone de datos de rendimiento para comparar en tareas estandar.

## Limitaciones y advertencias

- El modelo ha sido sometido a una intervencion quirurgica de pesos que elimina comportamientos de rechazo y servilismo; esto puede resultar en respuestas sin moderacion ni filtros de seguridad, similar a las limitaciones del modelo base Mixtral Instruct (que ya carecia de mecanismos de moderacion).
- No se han publicado evaluaciones de sesgos, alucinacion o calidad general tras la modificacion; el rendimiento en tareas estandar podria verse alterado.
- La identidad implantada puede no ser estable en todos los contextos o con prompts adversariales; no hay garantias de que el modelo no recupere comportamientos originales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Mixtral (Apache 2.0) y las modificaciones son del autor; se recomienda verificar la procedencia de los pesos.
- No se especifica la longitud de contexto soportada; se asume la del modelo base (32k), pero no esta confirmado en la informacion proporcionada.
- El modelo esta pensado para investigacion y experimentacion; no se recomienda su uso en produccion sin una evaluacion exhaustiva de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Modelo Parasite Qwen 2.5 7B: https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Modelo Parasite Mistral 7B v0.3: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Modelo base original: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Documentacion de Mixtral 8x7B: https://docs.mistral.ai/models/mixtral-8x7b-0-1
