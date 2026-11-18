# JuneoAI/Laplace-1-Atlas

## Resumen

Laplace-1-Atlas es un modelo de lenguaje de 27.356.728.560 parámetros desarrollado por JuneoAI, presentado como el modelo insignia de la familia Laplace-1 de modelos de decisión causal-intervencional. Se trata de un fine-tuning del modelo base Qwen/Qwen3.8-27B, orientado específicamente a la predicción de consecuencias y la toma de decisiones dentro de organizaciones donde conviven personas y agentes. Su propuesta central es aprender la distribución interventional p(s' | do(a), s, C): el estado siguiente de una organización tras una acción candidata, bajo la cadena de autoridad del agente.

El modelo no se posiciona como un generador de texto generalista, sino como un motor de decisión con dos primitivas de inferencia: puntuación de candidatos (devuelve una distribución sobre un conjunto cerrado de opciones en un único forward pass, sin muestreo ni parseo) y predicción de resultados (genera la próxima observación dadas las reglas del entorno, el contexto y una acción). Según el autor, lidera 7 de 9 benchmarks de decisión frente a modelos de OpenAI, Perplexity, Cloudflare, TypeSafe, ByteDance y Alibaba.

Es relevante ahora porque aborda un problema que los LLM generalistas no cubren: los datos públicos son observacionales y no registran lo que una acción *causa* dentro de una organización. Laplace se entrena íntegramente con datos de Decision Forge, compilados a partir de políticas organizativas con etiquetas reproducidas desde reglas y trazadas a su fuente. Se publica con pesos abiertos completos en BF16 bajo licencia Apache-2.0, sin adaptadores ni acceso restringido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.8-27B); tag de pipeline `qwen3_5` |
| Parámetros totales | 27.356.728.560 (27,4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se publican pesos completos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB, pesos BF16 completos y tokenizer) |

## Arquitectura y entrenamiento

Laplace-1-Atlas es un fine-tuning del modelo Qwen/Qwen3.8-27B, por lo que hereda la arquitectura transformer del modelo base. El autor no detalla en la información disponible la composición del dataset de preentrenamiento del modelo base ni innovaciones arquitectónicas propias más allá del ajuste fino. El tag `qwen3_5` en Hugging Face sugiere la familia arquitectónica de Qwen 3.5, pero no se aportan más detalles técnicos sobre capas, atención o mecanismos internos.

El entrenamiento se realizó íntegramente sobre datos de Decision Forge, un conjunto compilado a partir de políticas organizativas en el que cada etiqueta se reproduce desde una regla y se traza hasta su fuente. El objetivo es modelar la distribución interventional p(s' | do(a), s, C), es decir, la consecuencia de una acción candidata dado el estado de la organización y la cadena de autoridad. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacada es el uso del modelo como evaluador de candidatos en un solo forward pass, leyendo una distribución sobre las opciones desde los logits del siguiente token, sin muestreo ni parseo.

## Capacidades

- Predicción de consecuencias: dado un estado, reglas del entorno y una acción, genera la próxima observación antes de que la acción se ejecute.
- Puntuación de candidatos: devuelve una distribución sobre un conjunto cerrado de candidatos en un único forward pass (enrutamiento, decisiones de acceso, escalado y selección de próxima acción).
- Toma de decisiones organizativas en cuatro ejes: asignación de trabajo, compartición de información, actuación (ejecutar, ajustar o preguntar) y evaluación de resultados.
- Procesamiento image-text-to-text según los tags del repositorio (entrada de imagen y texto), aunque el pipeline declarado es text-generation.
- Soporte para agentes y entornos multi-agente, con integración mencionada con A2A y MCP.
- Razonamiento causal-intervencional orientado a seguridad de agentes (agent-safety).
- Generación de texto conversacional como capacidad heredada del modelo base.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asignación de trabajo: el modelo recibe el estado de la organización, una tarea nueva (por ejemplo, un lead de ventas) y una lista de candidatos, y devuelve una distribución sobre quién debería poseerla, lo que permite enrutar tareas automáticamente entre personas y agentes.
- Control de acceso a información: dada una petición de acceso y la cadena de autoridad, puntúa qué roles pueden ver qué datos sensibles, útil para aplicar políticas de mínimo privilegio en sistemas internos.
- Escalado de acciones de agentes: antes de que un agente despache una orden o firme un contrato, el modelo predice la consecuencia y decide si ejecutar, ajustar o escalar al propietario según los límites definidos.
- Evaluación de entregables: comprobar un resultado contra sus criterios de aceptación antes de la firma, usando la primitiva de puntuación de candidatos sobre estados de aceptación/rechazo.
- Simulación de consecuencias en pipelines de agentes: integrado vía MCP o A2A, el modelo genera la próxima observación esperada para que el agente planifique con antelación al fallo.
- Auditoría y trazabilidad de decisiones: al entrenarse con etiquetas trazadas a reglas de política, permite reconstruir por qué se recomendó una decisión concreta en un flujo organizativo.
- Despliegue en servidores de organización y nube privada: el tamaño de 27,4B y la licencia Apache-2.0 permiten alojarlo en infraestructura propia sin dependencia de terceros.

## Benchmarks y rendimiento

| Benchmark | Laplace-1-Atlas (27B, Juneo) | Referencia |
|---|---|---|
| TrustDecision | 89,4% | +5,4 puntos sobre el siguiente mejor; +10,7 sobre Jev 1.14 |
| AgentDecisionBench L2 *common* | 95,6% | — |
| AgentDecisionBench L2 *shift* | 95,5% | — |

Según el autor, el modelo queda primero en 7 de 9 benchmarks de decisión (contando empates) frente a modelos de OpenAI, Perplexity, Cloudflare, TypeSafe, ByteDance y Alibaba; por delante de Jev 1.14 en 8 de 9 y de Decider v1.2 de Perplexity en 7 de 9. La información disponible no incluye la tabla completa con los nueve benchmarks ni los valores de los modelos comparados, por lo que no se presentan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos (27,4B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto amplio.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para BF16; en consumer GPU no cabe en BF16.
- Cuantización: no se publican versiones cuantizadas oficiales; para caber en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) sería necesario cuantizar a 4 bits (aprox. 14-16 GB), lo que requeriría generar los GGUF o AWQ de forma externa.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según el tag `endpoints_compatible`; vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Atlas | 27,4B | no disponible | Decisión causal-intervencional | Apache-2.0 | Pesos abiertos en HF |
| Laplace-1-Vector | 4,1B | no disponible | Decisión en el borde (edge) | no disponible | Pesos abiertos en HF |
| Decider v1.2 (Perplexity) | 27B | no disponible | Decisión | no disponible | no disponible |
| Clef-Omni (Cloudflare) | 30B-A3B (MoE) | no disponible | Decisión | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | Decisión | no disponible | no disponible |

La información disponible no permite comparar contextos, rendimiento detallado ni condiciones de acceso de los modelos alternativos; solo se confirma que Laplace-1-Atlas supera a Decider v1.2 en 7 de 9 benchmarks y a Jev 1.14 en 8 de 9.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen/Qwen3.8-27B, podría heredar sesgos del modelo base, pero no se documenta.
- Riesgo de alucinación: el modelo está diseñado para predecir consecuencias, pero la model card no detalla mecanismos de calibración ni tasas de error en dominios fuera de los benchmarks publicados.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados, lo que dificulta evaluar su idoneidad para conversaciones largas o entornos multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, que pueden imponer obligaciones adicionales.
- Caveat para producción: los benchmarks son internos del autor y no se han publicado de forma independiente; la evaluación se centra en tareas de decisión organizativa y no en capacidades generales de generación.
- Dependencia del dominio: el entrenamiento con datos de Decision Forge implica que su rendimiento puede degradarse en organizaciones cuyas políticas no se representen bien en ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Modelo hermano Laplace-1-Vector: https://huggingface.co/JuneoAI/Laplace-1-Vector
- Repositorio Decision Forge: https://github.com/Juneo-Lab/decision-forge
- Contacto del autor: business@juneo.ai
