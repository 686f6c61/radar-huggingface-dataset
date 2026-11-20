# reaperdoesntknow/LFM2.5-8B-A1B-Opus-Distil

## Resumen

LFM2.5-8B-A1B-Opus-Distil es un checkpoint experimental de ajuste fino supervisado (SFT) desarrollado por el usuario reaperdoesntknow sobre el modelo base LiquidAI/LFM2.5-8B-A1B, un modelo de lenguaje causal de la familia Liquid Foundation Model. El ajuste se ha realizado sobre el dataset angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, orientado a generar respuestas de estilo razonamiento en inglés. El checkpoint cuenta con 8.467.856.832 parámetros totales según los pesos en safetensors y se distribuye bajo licencia Apache 2.0.

El objetivo declarado del autor es investigar si un backbone LFM puede adaptarse de forma eficiente mediante participación dispersa y selectiva de parámetros, en lugar de una modificación completa del modelo. Para ello emplea CIxOpt, un stack de optimización propio con enrutamiento heterogéneo según el tipo de parámetro y la estructura del tensor. No se trata de un modelo de producción, sino de un artefacto de investigación para estudiar adaptación eficiente, optimizadores y comportamiento de modelos LFM bajo cómputo limitado.

La relevancia actual del checkpoint es doble: por un lado, explora técnicas de ajuste fino selectivo sobre arquitecturas híbridas; por otro, sirve como banco de pruebas para evaluar la transferencia de estilos de razonamiento procedentes de datos destilados de un modelo propietario. El autor advierte explícitamente de que no ha sido evaluado de forma completa en seguridad, factualidad, código, matemáticas ni instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model (LFM) / modelo de lenguaje causal híbrido; tag de librería `lfm2_moe` |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-8B-A1B, descrito por el autor como un modelo de lenguaje causal híbrido de la familia Liquid Foundation Model. La etiqueta `lfm2_moe` en Hugging Face sugiere una topología con componentes de mezcla de expertos, aunque la model card no detalla el número de expertos, el ratio de activación ni la composición exacta de las capas. Tampoco se especifica la longitud de contexto nativa del backbone ni la composición del corpus de preentrenamiento original. El checkpoint se distribuye en safetensors con 8.467.856.832 parámetros y un repositorio de 33,9 GB.

El ajuste fino se realizó sobre angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, un dataset de aproximadamente 8.700 ejemplos de estilo razonamiento. Los datos se procesaron en formato de chat compatible con el tokenizador, filtrando ejemplos vacíos o malformados antes de la tokenización. La innovación técnica declarada es el uso de CIxOpt, un stack de optimización con enrutamiento heterogéneo: momentum de signo tipo Lion para matrices de proyección grandes, actualizaciones tipo AdamW para superficies de normalización sensibles, manejo tipo Adamax para embeddings y cabezas de lenguaje, estado del optimizador en fp32 para seguridad con bf16/fp16, centralización de gradientes en matrices elegibles, filtrado cauteloso de actualizaciones de signo, weight decay desacoplado y clipping de gradientes. La estrategia de participación dispersa congela la mayor parte del backbone preentrenado y adapta selectivamente capas superiores de proyección y normalización, preservando el sustrato representacional inferior. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con estilo de razonamiento explícito, orientado a explicaciones analíticas y trazas de razonamiento.
- Instrucciones conversacionales en formato chat, con sensibilidad al formato del prompt.
- Compresión y reformulación de trazas de razonamiento.
- Explicación técnica y generación de respuestas analíticas.
- Capacidad potencial como backbone para agentes experimentales, según el uso previsto declarado por el autor.
- Ajuste fino posterior y adaptación de dominio sobre el checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de visión, audio ni otras modalidades.
- No se documenta modo thinking nativo ni decodificación especulativa.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.

## Casos de uso

- Investigación sobre ajuste fino eficiente de modelos LFM: el checkpoint permite comparar la adaptación selectiva de capas superiores frente a un ajuste completo del backbone, midiendo qué capacidades se preservan y cuáles se desplazan.
- Experimentación con el optimizador CIxOpt: sirve como artefacto reproducible para estudiar el efecto del enrutamiento heterogéneo por tipo de parámetro en modelos de 8B con estado fp32.
- Generación de explicaciones técnicas: el ajuste sobre datos de razonamiento favorece respuestas analíticas paso a paso en dominios como arquitecturas de software o conceptos de machine learning, útil en documentación interna.
- Compresión de trazas de razonamiento: puede emplearse para resumir cadenas de pensamiento largas en explicaciones más breves, un caso alineado con el dataset de entrenamiento.
- Backbone para agentes experimentales: el autor lo propone como base para prototipos de agentes, siempre con evaluación adicional y guardarraíles, dado que no hay evidencia de soporte de tool calling.
- Adaptación de dominio posterior: al ser un checkpoint SFT con licencia Apache 2.0, puede servir de punto de partida para fine-tuning en dominios verticales con datos propios.
- Estudios comparativos de comportamiento entre modelos pequeños o con adaptación dispersa: útil en laboratorios que evalúan cómo cambia la distribución de respuestas tras un SFT acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma completa en suites de seguridad, factualidad, código, matemáticas ni seguimiento de instrucciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 17 GB solo para pesos (8,47B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 20 y 24 GB para contextos moderados.
- VRAM estimada en fp16: misma horquilla que bf16, en torno a 17 GB de pesos.
- Cuantización a 8 bits: aproximadamente 8,5 GB de pesos, viable en GPUs de 12-16 GB con contexto limitado.
- Cuantización a 4 bits: aproximadamente 4,3 GB de pesos, viable en GPUs consumer de 8 GB, aunque el autor no publica pesos cuantizados ni recetas oficiales.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 ajustado o fp8; RTX 4080/4070 Ti Super (16 GB) con cuantización de 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 a bf16 con contexto controlado y en GPUs de 8-16 GB con cuantización, aunque sin recetas oficiales publicadas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint y requerirían validación previa, especialmente por el tag `lfm2_moe` y la necesidad de código remoto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/LFM2.5-8B-A1B-Opus-Distil | 8,47B | no disponible | Apache 2.0 | Hugging Face, transformers | Checkpoint SFT experimental sobre LFM2.5; sin benchmarks publicados |
| LiquidAI/LFM2.5-8B-A1B (base) | 8B (A1B según nomenclatura) | no disponible | Apache 2.0 | Hugging Face | Modelo base sin el ajuste de razonamiento; referencia directa para comparar deriva del SFT |
| Otros modelos densos de ~8B (p. ej. familias Llama 3 8B o Qwen 2.5 7B) | 7-8B | 8K-128K según variante | Licencias variables | Hugging Face | Alternativas consolidadas con benchmarks públicos; la comparación directa requeriría evaluar este checkpoint en las mismas suites, dato no disponible |

La comparación cuantitativa con alternativas no puede establecerse porque no hay resultados de benchmarks publicados para este checkpoint. La referencia más directa y recomendable es el modelo base LiquidAI/LFM2.5-8B-A1B, sobre el que puede medirse el efecto del ajuste.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor lo describe como artefacto de investigación, no como modelo listo para producción.
- Riesgo de alucinación: puede inventar hechos, citas, fechas y atribuciones de fuentes.
- Sesgos heredados: puede arrastrar sesgos y artefactos del modelo base y del dataset de ajuste.
- Sobregeneración de razonamiento: tiende a producir explicaciones de estilo razonamiento incluso cuando se prefieren respuestas breves.
- Sensibilidad al formato del prompt: el rendimiento puede degradarse si el formato de chat no coincide con el usado en entrenamiento.
- Adaptación desigual: la estrategia de participación dispersa puede dejar algunas capacidades cerca del modelo base y modificar otras de forma no uniforme.
- Sin evaluación de seguridad ni de factualidad: no se han publicado pruebas de toxicidad, sesgo, rechazo ni tasa de alucinación.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor desaconseja explícitamente su uso como único decisor en diagnóstico médico, juicio legal, decisiones financieras, respuesta a emergencias, automatización ofensiva, selección de personal, vigilancia o cualquier contexto que exija precisión factual verificada.
- Dependencia de `trust_remote_code`: la carga requiere ejecutar código remoto del repositorio, lo que implica una revisión de seguridad previa en entornos corporativos.
- Ecosistema de despliegue limitado: no hay pesos GGUF, AWQ ni GPTQ publicados, ni integración documentada con vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-8B-A1B-Opus-Distil
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Dataset de ajuste: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
