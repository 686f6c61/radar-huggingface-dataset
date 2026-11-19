# mrmichaeladavis/sysone-cyber

## Resumen

sysone-cyber es un adaptador LoRA (PEFT) publicado por el usuario mrmichaeladavis sobre el modelo base google/gemma-4-31B-it. Se presenta como un "decision-model" orientado a ciberseguridad, con la pipeline declarada de clasificación de texto y un conjunto amplio de etiquetas temáticas: phishing, MITRE ATT&CK, threat intelligence, gestión de vulnerabilidades y análisis de seguridad en general. No se trata de un modelo de pesos completos, sino de un adaptador que requiere cargar el modelo base y aplicar los pesos LoRA para su uso.

El interés del proyecto radica en su enfoque: en lugar de un chatbot genérico, se plantea como un clasificador/decidor especializado que podría integrarse en pipelines de detección (correos de phishing, mapeo de TTPs, triaje de alertas). Sin embargo, la información pública disponible es extremadamente limitada: cero descargas, cero likes, sin model card visible en los metadatos, sin resultados de benchmarks y sin datos sobre el proceso de entrenamiento más allá de la lista de datasets referenciados en los tags.

Por tanto, esta ficha debe leerse como una descripción de lo que el autor declara en los metadatos, no como una evaluación validada del rendimiento real del adaptador. Cualquier uso en producción exigiría una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: google/gemma-4-31B-it) |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 31B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | no disponible (tag "en" sugiere inglés, sin confirmación) |
| Licencia | no disponible (tag "license:other"; condiciones sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante PEFT sobre google/gemma-4-31B-it, un modelo base decoder-only de la familia Gemma. No se especifican en la información disponible el rango del adaptador, los módulos objetivo, el número de pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación (RLHF/DPO). La pipeline declarada es text-classification, lo que sugiere un uso como clasificador de decisiones más que como generador libre, aunque al apoyarse en un modelo generativo el mecanismo exacto de clasificación (prompting estructurado, cabeza de clasificación o generación de etiquetas) no está documentado.

Los tags de dataset apuntan a una mezcla heterogénea: datasets genéricos de instrucciones y clasificación (banking77, boolq, civil_comments, HelpSteer2, liar2), datasets específicos de fraude y phishing (ealvaradob/phishing-dataset, phishdestroy/destroylist, redasers/difraud) y datasets de seguridad (witfoo/precinct6-cybersecurity, tumeteor/Security-TTP-Mapping). No se indica el peso relativo de cada uno ni el volumen de ejemplos. Tampoco hay información sobre evaluación, validación o criterios de calidad del dataset.

## Capacidades

- Clasificación de texto orientada a decisiones de seguridad (phishing, fraude, riesgo).
- Mapeo de técnicas a MITRE ATT&CK, según el dataset Security-TTP-Mapping referenciado.
- Soporte declarado para threat intelligence y gestión de vulnerabilidades (a nivel de etiqueta, sin detalles).
- Posible generación de texto y razonamiento heredados del modelo base Gemma, aunque no confirmado para este adaptador.
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible; el tag "en" sugiere inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Triaje de correos de phishing: el adaptador podría clasificar mensajes como sospechosos o legítimos, apoyándose en los datasets de phishing referenciados, para alimentar una cola de revisión humana.
- Detección de fraude transaccional: usando el dataset difraud como referencia, podría etiquetar patrones de fraude en registros estructurados antes de escalar a un analista.
- Mapeo de alertas a MITRE ATT&CK: clasificar descripciones de incidentes en técnicas TTP concretas para enriquecer un SIEM o plataforma de threat intelligence.
- Priorización de vulnerabilidades: clasificar CVEs o informes en categorías de riesgo para ordenar la cola de remediación de un equipo de seguridad.
- Moderación de contenido en comunidades técnicas: reutilizando el dataset civil_comments, para filtrar comentarios abusivos en foros o canales de soporte.
- Enriquecimiento de pipelines SOC: como paso de clasificación previo a un LLM mayor o a un sistema de tickets, reduciendo el volumen que llega a analistas humanos.
- Clasificación de consultas en soporte: usando banking77 como referencia, para enrutar tickets a la cola adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa poco espacio (típicamente decenas o cientos de MB en safetensors), pero requiere cargar el modelo base google/gemma-4-31B-it.
- VRAM estimada para el base en FP16: en torno a 62 GB (31B × 2 bytes), más overhead de activaciones y del adaptador.
- VRAM estimada en cuantización de 8 bits: aproximadamente 31 GB; en 4 bits: aproximadamente 16-18 GB.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para 8 bits; RTX 4090 (24 GB) viable solo en 4 bits con contexto moderado.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) únicamente con cuantización agresiva del base.
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores PEFT; llama.cpp/Ollama solo si se convierte el base a GGUF y se aplica el adaptador (proceso no trivial para LoRA sobre modelos grandes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sysone-cyber | Adaptador LoRA sobre Gemma 4 31B | Adaptador + base 31B | no disponible | no disponible | Hugging Face (0 descargas) |
| Modelos de clasificación de seguridad especializados (p. ej. SecBERT, CyBERT) | Encoder BERT | ~110M | 512 tokens | Apache 2.0 / MIT (según variante) | Hugging Face, ampliamente usados |
| LLM generalista grande (p. ej. Llama, Qwen) con prompting de seguridad | Decoder-only | 7B-70B+ | 8k-128k+ | Variable | Hugging Face, ecosistema amplio |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card, benchmarks y documentación de entrenamiento: no es posible validar su calidad ni su comportamiento en dominios distintos a los del dataset.
- Riesgo elevado de alucinación y de falsos positivos/negativos en clasificación de seguridad, con impacto directo en operaciones SOC.
- Sesgos desconocidos: la mezcla de datasets (incluidos genéricos como banking77 o civil_comments) puede introducir distribuciones no representativas del tráfico real de una organización.
- Idiomas: probablemente limitado a inglés; sin confirmación.
- Licencia "other" sin condiciones publicadas: no se puede asumir uso comercial sin contactar al autor.
- El modelo base (Gemma) tiene sus propios términos de uso que se aplican en cascada al adaptador.
- Cero descargas y cero likes: sin evidencia de uso en producción ni de validación por la comunidad.
- Fecha de creación futura en los metadatos (2026-11-18), lo que sugiere posible error de publicación o artefacto de prueba; conviene verificar la integridad antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/mrmichaeladavis/sysone-cyber
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- PEFT (librería): https://github.com/huggingface/peft
- MITRE ATT&CK: https://attack.mitre.org/
- Dataset Security-TTP-Mapping: https://huggingface.co/datasets/tumeteor/Security-TTP-Mapping
- Dataset phishing-dataset: https://huggingface.co/datasets/ealvaradob/phishing-dataset
- Dataset difraud: https://huggingface.co/datasets/redasers/difraud
- Dataset precinct6-cybersecurity: https://huggingface.co/datasets/witfoo/precinct6-cybersecurity
