# nyxspecter4/kin-sft-lora-gguf

## Resumen

KIN es un modelo de lenguaje especializado en ciberseguridad, desarrollado por nyxspecter4 (Kiran Wolfe) como un fine-tune del modelo Qwen2.5-3B-Instruct. Se distribuye en formato GGUF, lo que permite ejecutarlo localmente con herramientas como Ollama o llama.cpp. El modelo está diseñado para responder a cuestiones de seguridad ofensiva y defensiva con un tono directo y pragmático, similar al de un ingeniero senior con experiencia real. Su relevancia radica en que ofrece un asistente de ciberseguridad con conocimientos específicos (CVEs, herramientas, incidentes reales) en un tamaño compacto de 3.000 millones de parámetros, apto para hardware de gama media.

El modelo se entrenó en dos fases: primero un ajuste fino con LoRA sobre Qwen2.5-3B-Instruct y posteriormente un refinamiento con DPO (Direct Preference Optimization) utilizando un dataset propio. La versión GGUF publicada incluye dos cuantizaciones (Q4_K_M y Q8_0) que reducen el tamaño del modelo original de safetensors (3,08 GB) a aproximadamente 2 GB y 3,3 GB respectivamente, facilitando su despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-3B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only con 3.000 millones de parámetros, optimizado para instrucciones y diálogo. KIN se obtiene mediante un ajuste fino con LoRA (Low-Rank Adaptation) sobre este modelo, seguido de una etapa de DPO (Direct Preference Optimization) para alinear las respuestas con el estilo deseado. El dataset de entrenamiento se encuentra disponible en `nyxspecter4/kin-dpo-data`, aunque no se especifican el número de tokens ni la composición exacta del corpus.

La principal innovación no está en la arquitectura, sino en el enfoque de entrenamiento: el modelo está calibrado para responder con un estilo concreto (directo, con opiniones, mencionando herramientas y CVEs reales) y para usar un sistema prompt específico que el autor recomienda mantener para obtener calidad óptima. No se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto especializada en ciberseguridad: respuesta a incidentes, análisis de vulnerabilidades, hardening, etc.
- Conocimiento de herramientas reales: CrowdStrike Falcon, Velociraptor, Duo MFA, KnowBe4, entre otras.
- Referencias a CVEs específicos (CVE-2023-4863, CVE-2021-44228, CVE-2024-3094) y a incidentes conocidos (MGM, Colonial Pipeline, NotPetya, Maersk, Merck).
- Razonamiento multi-paso para tareas de threat hunting, DFIR y análisis de malware.
- Capacidad de diálogo multi-turno (entrenado como asistente conversacional).
- No se indica soporte explícito para tool calling ni function calling.
- Limitado a idioma inglés; no se mencionan capacidades multilingües ni multimodales.

## Casos de uso

- Respuesta a incidentes en un SOC: KIN puede guiar a analistas junior en la detección de un foothold tras un phishing, sugiriendo pasos concretos como revisar logs de autenticación o aislar el host afectado.
- Análisis de malware: el modelo puede explicar técnicas de análisis estático y dinámico, recomendar herramientas como Ghidra o Volatility, y ayudar a interpretar indicadores de compromiso.
- Threat hunting: gracias a su conocimiento de tácticas y técnicas (MITRE ATT&CK), puede proponer hipótesis de búsqueda en SIEM y EDR.
- Soporte a red team: KIN puede sugerir vectores de ataque, herramientas de post-explotación y técnicas de evasión, siempre con un enfoque práctico.
- Formación y concienciación: sirve como mentor para estudiantes de ciberseguridad, explicando conceptos complejos con ejemplos del mundo real.
- Generación de informes técnicos: redacta resúmenes de vulnerabilidades, análisis de CVEs y recomendaciones de mitigación de forma concisa y accionable.
- Consulta rápida en operaciones de blue team: el modelo puede recordar configuraciones de herramientas (p. ej., reglas de Sigma, consultas KQL) y ofrecer ejemplos listos para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para KIN. Tampoco se comparan con otros modelos de ciberseguridad en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa ~2.0 GB y Q8_0 ~3.3 GB; considerando overhead de contexto, se recomienda al menos 4 GB de VRAM para Q4_K_M y 6 GB para Q8_0.
- GPU recomendadas: cualquier GPU moderna con 4-8 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 3060, RTX 4060, o incluso CPUs con suficiente RAM (funciona con llama.cpp en modo CPU).
- Cabe en GPUs consumer de gama media; no requiere hardware de datacenter.
- Opciones de despliegue: Ollama (comando directo `ollama run hf.co/nyxspecter4/kin-sft-lora-gguf:Q4_K_M`), llama.cpp (`llama-cli`), o cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no se han publicado mediciones; en una RTX 3060 se puede esperar una generación de ~20-30 tokens/s con Q4_K_M, pero es una estimación orientativa no verificada.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de ciberseguridad en la información proporcionada. Como referencia, se puede comparar con su modelo base Qwen2.5-3B-Instruct (que no está especializado en seguridad) y con otros modelos pequeños de propósito general como Llama-3.2-3B o Phi-3-mini. Sin embargo, no hay datos de rendimiento de KIN frente a estos. La principal diferencia es la especialización en ciberseguridad y el estilo de respuesta entrenado.

## Limitaciones y advertencias

- El modelo es pequeño (3B parámetros), por lo que su capacidad de razonamiento complejo y de manejo de contextos muy largos es limitada en comparación con modelos de 7B o más.
- Solo soporta inglés; no es útil para consultas en otros idiomas.
- El tono "opinado" puede llevar a respuestas demasiado categóricas o a sobreconfianza en recomendaciones, lo que requiere supervisión humana en entornos críticos.
- Riesgo de alucinación en detalles técnicos (nombres de herramientas, CVEs, fechas) si se sale de los datos de entrenamiento.
- El sistema prompt es crítico: usar otro prompt degrada significativamente la calidad de las respuestas.
- No se especifica la longitud de contexto soportada; se recomienda mantener conversaciones cortas y enfocadas.
- Aunque la licencia es Apache 2.0, el autor no garantiza la exactitud de la información generada; el uso en entornos de producción debe validarse con fuentes oficiales.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/nyxspecter4/kin-sft-lora-gguf
- Modelo base (safetensors): https://huggingface.co/nyxspecter4/kin-sft-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/nyxspecter4/kin-dpo-data
- Perfil del autor: https://huggingface.co/nyxspecter4
