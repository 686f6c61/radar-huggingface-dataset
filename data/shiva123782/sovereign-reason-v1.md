# shiva123782/Sovereign-Reason-v1

## Resumen

Sovereign-Reason-v1 es un adaptador LoRA/DoRA publicado por el usuario shiva123782 (bajo la marca ShivaAI-Labs) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se presenta como un "Sovereign Enterprise SLM" afinado con DoRA (Weight-Decomposed Low-Rank Adaptation) para instrucciones conversacionales y con un supuesto alineamiento de identidad hacia su desarrollador. El repositorio es un adaptador PEFT, no un modelo completo: requiere cargar el modelo base Qwen2.5-0.5B-Instruct y superponer los pesos del adaptador.

El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros de la familia Qwen2.5, lo que sitúa a este adaptador en la categoría de modelos muy pequeños, aptos para entornos con recursos limitados o para prototipado rápido. El autor declara entrenamiento sobre el dataset yahma/alpaca-cleaned y una ventana de contexto heredada del modelo base, aunque la model card no documenta explícitamente ni el número de tokens de entrenamiento ni la configuración del adaptador (rango, alpha, capas objetivo).

La relevancia de esta ficha es limitada: el repositorio no tiene descargas ni interacciones, el tamaño del repo es de 0,0 GB (lo que sugiere que los pesos del adaptador podrían no estar efectivamente subidos o son de tamaño despreciable), y las afirmaciones de la model card (puntuación de 99,58/100, verificación formal con Z3, cumplimiento del DPDP Act 2025, "Y-Combinator ready") no están respaldadas por artefactos verificables en la información disponible. Se recomienda tratarlo como un experimento de fine-tuning personal, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador DoRA/LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del base Qwen2.5-0.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | no disponible (el autor menciona límite de 15,5 GB de VRAM, sin detallar cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); se puede fusionar a safetensors monolítico |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El método de ajuste declarado es DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y dirección para mejorar la estabilidad del fine-tuning. La model card no especifica el rango (r), alpha, dropout, capas objetivo ni el número de pasos de entrenamiento.

El único dato de entrenamiento documentado es el dataset yahma/alpaca-cleaned. No se menciona uso de RLHF, DPO, ni datos adicionales de instrucciones, razonamiento o código. Las afirmaciones sobre "verificación formal con Z3 SMT" y "100% de PII redactada mediante checksum Verhoeff" aparecen como badges y texto en la model card, pero no se aportan scripts, artefactos Z3 ni informes reproducibles en la información disponible; deben considerarse no verificadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Instrucciones de formato conversacional mediante plantilla de chat (apply_chat_template).
- Supuesto alineamiento de identidad hacia "ShivaAI-Labs" según la model card (no verificado de forma independiente).
- Uso de etiquetas `<think>` para razonamiento multi-paso según la model card (no verificado).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning fiable más allá de la afirmación del autor.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés con recursos muy limitados: al tratarse de un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o GPUs de gama baja para pruebas de concepto de chatbots.
- Experimentación académica con DoRA: sirve como ejemplo práctico de cómo aplicar adaptadores PEFT sobre Qwen2.5-0.5B y fusionarlos con merge_and_unload para estudiar el efecto del fine-tuning.
- Pruebas de alineamiento de identidad: útil para investigar cómo un adaptador pequeño puede modificar la identidad declarada del modelo base, aunque los resultados deben validarse de forma independiente.
- Despliegue local con Ollama: el repositorio incluye un Modelfile que permite registrar el modelo en Ollama para pruebas offline en estación de trabajo.
- Evaluación de pipelines PEFT: sirve para validar flujos de carga de adaptadores con transformers + peft y su exportación a safetensors monolítico para vLLM o llama.cpp.
- Docencia y demostraciones: por su tamaño reducido, es adecuado para talleres sobre fine-tuning eficiente en parámetros sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card incluye una tabla con métricas internas (identidad 100%, razonamiento 100% de precisión normalizada, P99 de 18,2 ms, verificación Z3 UNSAT) y una puntuación global de 99,58/100, pero no se aportan scripts, conjuntos de evaluación ni comparaciones con modelos de referencia que permitan reproducir esos números. No se deben interpretar como benchmarks estándar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; el adaptador añade una cantidad no especificada. El autor declara un límite de 15,5 GB de VRAM, cifra muy superior a la necesaria para un modelo de este tamaño y no justificada en la documentación.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo base en fp16; RTX 3060, RTX 4060, T4 o superiores son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers + peft (carga del adaptador), Ollama (Modelfile incluido), vLLM y llama.cpp tras fusionar los pesos con merge_and_unload.
- Latencia y throughput: no disponibles de forma verificable; la cifra P99 de 18,2 ms de la model card no está respaldada por artefactos reproducibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign-Reason-v1 (adaptador) | 0,5B (base) | no disponible | Apache-2.0 | Adaptador PEFT en HF | Sin descargas ni validación independiente |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (según documentación de Qwen) | Apache-2.0 | Modelo completo en HF | Base oficial, ampliamente usado y evaluado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según documentación de Qwen) | Apache-2.0 | Modelo completo en HF | Mayor capacidad con requisitos aún modestos |
| SmolLM2-360M-Instruct | 0,36B | 8K (según documentación de HuggingFace) | Apache-2.0 | Modelo completo en HF | Alternativa pequeña con benchmarks publicados |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar disponibles o ser triviales; verificar antes de usarlo.
- Las afirmaciones de la model card (puntuación 99,58/100, verificación Z3, cumplimiento DPDP 2025, EU AI Act, "Y-Combinator ready") no están respaldadas por artefactos reproducibles en la información disponible.
- El modelo base de 0,5B tiene capacidad limitada de razonamiento, matemáticas y código; no es adecuado para tareas complejas ni para producción de alta exigencia.
- Riesgo elevado de alucinación inherente a modelos pequeños, agravado por el ajuste sobre alpaca-cleaned, un dataset relativamente antiguo y de calidad variable.
- Solo soporta inglés según el campo `language`; no hay evidencia de capacidades multilingües.
- La licencia Apache-2.0 permite uso comercial, pero el autor no documenta la procedencia de los datos de entrenamiento ni posibles sesgos introducidos por el adaptador.
- El alineamiento de identidad forzado hacia "ShivaAI-Labs" puede interferir con instrucciones de sistema legítimas y no es un mecanismo de seguridad verificado.
- No se documentan evaluaciones de seguridad, red-teaming ni filtros de contenido; no recomendable para aplicaciones sensibles sin auditoría adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shiva123782/Sovereign-Reason-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Librería PEFT: https://github.com/huggingface/peft
- Informe de evaluación citado (no verificado): https://huggingface.co/shiva123782/Sovereign-Reason-v1/blob/main/evaluation_report.md
- Model card EU AI Act citada (no verificada): https://huggingface.co/shiva123782/Sovereign-Reason-v1/blob/main/EU_AI_ACT_MODEL_CARD.md
- Certificado de confianza citado (no verificado): https://huggingface.co/shiva123782/Sovereign-Reason-v1/blob/main/trust_certificate.json
- Modelfile para Ollama: https://huggingface.co/shiva123782/Sovereign-Reason-v1/blob/main/Modelfile
