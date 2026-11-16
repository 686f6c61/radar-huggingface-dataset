# langtech-innovation/Salamandra-7B-fc-evo-2611

## Resumen

Salamandra-7B-fc-evo-2611 es un ajuste fino (finetune) del modelo base BSC-LT/salamandra-7b, desarrollado por langtech-innovation y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto orientado a conversación y, por los conjuntos de datos empleados en su entrenamiento, especializado en *function calling* (llamada a herramientas) y flujos agénticos. El modelo conserva la arquitectura Llama del modelo base y un total de 7.768.117.248 parámetros, lo que lo sitúa en la categoría de modelos de ~7-8B.

El modelo base Salamandra-7B fue desarrollado por el Barcelona Supercomputing Center (BSC-LT) y está diseñado específicamente para lenguas europeas, incluyendo lenguas de baja representación como el catalán, el euskera, el gallego o el occitano, además de las principales lenguas de la UE. Este finetune mantiene esa cobertura multilingüe (más de 30 idiomas y código) y añade un entrenamiento orientado a agentes y llamada a funciones, lo que lo hace relevante para aplicaciones de asistentes que necesitan invocar APIs y ejecutar razonamientos multi-paso en entornos multilingües europeos.

La relevancia actual del modelo radica en la combinación de dos factores poco frecuentes: cobertura amplia de lenguas europeas (incluidas las minorizadas) y entrenamiento específico para *tool calling* y agentes. El acceso al repositorio está restringido (gated) y requiere aceptar las condiciones en Hugging Face. No se dispone de información publicada sobre benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (heredada de BSC-LT/salamandra-7b) |
| Parametros totales | 7.768.117.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bg, ca, code, cs, cy, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, it, lt, lv, mt, nl, nn, no, oc, pl, pt, ro, ru, sh, sk, sl, sr, sv, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint BSC-LT/salamandra-7b, que emplea una arquitectura transformer de tipo Llama con aproximadamente 7.770 millones de parámetros. No se dispone de información detallada en la documentación proporcionada sobre la composición exacta del dataset de preentrenamiento original, el número de tokens o si el modelo base incorporó RLHF o DPO. El modelo base Salamandra está documentado en el paper arXiv:2502.08489, referenciado en la ficha del repositorio.

El ajuste fino de este checkpoint se ha realizado sobre una combinación de datasets orientados a *function calling* y comportamiento agéntico, según los tags del repositorio: nvidia/When2Call, Salesforce/xlam-function-calling-60k, Team-ACE/ToolACE, Agent-Ark/Toucan-1.5M, Nanbeige/ToolMind, nvidia/Nemotron-SFT-Agentic-v2, Jackrong/GLM-5.1-Reasoning-1M-Cleaned y Snowflake/AgentWorldModel-1K. Esta selección sugiere un entrenamiento supervisado (SFT) centrado en la decisión de cuándo invocar herramientas, la generación de llamadas a funciones y el razonamiento multi-paso. No se especifica en la información disponible si se aplicaron técnicas adicionales como DPO, decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en más de 30 idiomas europeos y código.
- *Function calling* / *tool calling*: entrenado explícitamente con datasets de llamada a funciones (When2Call, xLAM, ToolACE, ToolMind), lo que incluye la decisión de cuándo invocar una herramienta.
- Comportamiento agéntico: los datasets Toucan-1.5M, Nemotron-SFT-Agentic-v2 y AgentWorldModel-1K apuntan a soporte de razonamiento multi-paso y ejecución de tareas en entornos de agente.
- Razonamiento: el dataset GLM-5.1-Reasoning-1M-Cleaned sugiere entrenamiento en cadenas de razonamiento.
- Capacidades multilingües amplias, con énfasis en lenguas europeas de baja representación (catalán, euskera, gallego, occitano, galés, irlandés).
- Soporte de código (tag `code` en los idiomas).
- No se dispone de información sobre capacidades de visión, audio o modo *thinking* explícito.

## Casos de uso

- Asistentes de atención al cliente multilingües: el modelo puede gestionar conversaciones multi-turno e invocar APIs de back-end (consultas de pedidos, gestión de tickets) gracias a su entrenamiento en *function calling*, cubriendo además lenguas europeas minorizadas que otros modelos no atienden bien.
- Agentes de automatización de flujos internos: con los datasets agénticos de entrenamiento, puede encadenar pasos (consultar estado, decidir acción, invocar herramienta) en pipelines de empresa que requieran razonamiento multi-paso.
- Integración en pipelines RAG con invocación de herramientas: el modelo puede decidir cuándo recuperar información de una base vectorial frente a responder directamente, gracias al entrenamiento con When2Call.
- Asistentes para administraciones públicas europeas: la cobertura de catalán, euskera, gallego y otras lenguas cooficiales lo hace adecuado para servicios ciudadanos multilingües con invocación de APIs administrativas.
- Generación de código asistida con herramientas: el tag `code` y el soporte de *function calling* permiten usarlo en entornos de desarrollo que requieran llamar a funciones o APIs desde lenguaje natural.
- Chatbots de soporte técnico con acceso a sistemas: puede integrarse mediante *tool calling* para consultar documentación, estado de servicios o bases de conocimiento, y responder en el idioma del usuario.
- Prototipado de agentes de razonamiento: útil para experimentar con flujos multi-paso y evaluación de decisiones de invocación de herramientas en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,5 GB solo para pesos (7.768 M parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 18-20 GB.
- Cuantización a 8 bits: ~8 GB de pesos; a 4 bits: ~4-5 GB de pesos (estimación teórica; no se confirman formatos GGUF publicados en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción en precisión completa; RTX 4090 (24 GB) para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 en FP16; en cuantización 4/8 bits podría caber en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), sujeto a disponibilidad de pesos cuantizados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no se confirman en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Salamandra-7B-fc-evo-2611 | 7.768 M | no disponible | >30 lenguas europeas + código | Apache 2.0 | Gated |
| BSC-LT/salamandra-7b (base) | ~7.700 M | no disponible | >30 lenguas europeas | Apache 2.0 | Público |
| Modelos de ~7-8B de propósito general (p. ej. familia Llama 3.1 8B) | ~8.000 M | 128K (referencia) | Principalmente inglés y multilingüe amplio | Licencia propia | Público |
| Modelos especializados en function calling de ~7B (p. ej. xLAM-7B) | ~7.000 M | no disponible | Principalmente inglés | Variable | Público |

La comparativa con modelos de propósito general se ofrece como referencia de categoría; los datos de contexto y rendimiento de las alternativas no se han verificado en la información proporcionada y deben consultarse en sus fichas respectivas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- No se han publicado benchmarks ni evaluaciones de rendimiento, por lo que no es posible verificar su calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos de ~7B, especialmente en tareas de razonamiento complejo o generación de llamadas a funciones con esquemas poco comunes.
- El entrenamiento con datasets de *function calling* mayoritariamente en inglés puede provocar un rendimiento inferior al invocar herramientas en lenguas minorizadas.
- No se especifica la longitud de contexto soportada; conviene verificar la del modelo base antes de usarlo en conversaciones largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo del BSC conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (algunos como Nemotron o xLAM pueden tener términos adicionales).
- No se confirma la disponibilidad de pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/langtech-innovation/Salamandra-7B-fc-evo-2611
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b
- Paper del modelo base: https://arxiv.org/abs/2502.08489
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset Team-ACE/ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset Agent-Ark/Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Dataset Nanbeige/ToolMind: https://huggingface.co/datasets/Nanbeige/ToolMind
- Dataset nvidia/Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset Jackrong/GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset Snowflake/AgentWorldModel-1K: https://huggingface.co/datasets/Snowflake/AgentWorldModel-1K
