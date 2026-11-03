# LeanProgressIQ/LFM3-1.7B-aura-grounded

## Resumen

LFM3-1.7B-aura-grounded es un ajuste fino por DPO del modelo LiquidAI/LFM3-1.7B, desarrollado por LeanProgressIQ (Aura Research). Su objetivo es concreto: eliminar las respuestas alucinadas en pipelines de generación aumentada por recuperación (RAG) cuando los documentos recuperados no contienen la respuesta. El modelo base, con 1.728.801.600 parámetros, alucinaba entre el 94 % y el 96 % de las veces ante consultas no respondibles; este ajuste eleva la tasa de rechazo limpio al 83,9 % en dominios de entrenamiento y al 74,4 % en dominios no vistos.

El modelo no es un LLM de propósito general: es un componente especializado de "grounding" que debe invocarse con un contrato de sistema estricto y documentos numerados en el prompt. Cuando la evidencia está presente responde en una o dos frases en el idioma de la pregunta; cuando no lo está, emite exactamente la frase de fallback `I couldn't find the answer in the provided documents.`

Es relevante ahora porque los modelos pequeños (< 3B) son atractivos para RAG en producción por coste y latencia, pero su tendencia a inventar respuestas ante evidencia ausente es un riesgo crítico. Este ajuste demuestra que con DPO puro en FP32 y un dataset equilibrado se puede corregir ese comportamiento en hardware modesto (dos Tesla T4). La licencia Apache 2.0 y la inclusión de un GGUF Q8_0 facilitan su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Linear Feature Model con convoluciones cortas (base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | GGUF Q8_0 incluido; pesos base en safetensors FP32 |
| Idiomas soportados | no disponible (el prompt de sistema exige responder en el idioma de la pregunta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (Q8_0, 1,72 GB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, una arquitectura híbrida descrita por el autor como "Hybrid Linear Feature Model with Short Convolutions", es decir, un transformer con componentes lineales y convoluciones cortas en lugar de atención cuadrática completa. Sobre esa base se aplicó un adaptador LoRA de rango r=16 y alpha=32 sobre nueve cabezas de proyección: `q_proj`, `v_proj`, `k_proj`, `in_proj`, `w1`, `w2`, `o_proj`, `out_proj` y `w3`.

El ajuste se realizó con DPO (beta = 0,1) en precisión FP32 completa sobre dos GPUs Nvidia Tesla T4 en un entorno Kaggle. El autor indica que el FP32 fue necesario para evitar el subdesbordamiento del segundo momento de Adam en arquitecturas Turing. El dataset combina pares de pregunta-respuesta con evidencia (grounded QA) y datos de preferencia verificados de "episodios Aura", equilibrados para enseñar tanto a responder con evidencia como a rechazar cuando esta falta. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto extractiva: responde preguntas usando exclusivamente los documentos proporcionados en el prompt.
- Rechazo calibrado: emite la frase de fallback exacta cuando la evidencia no soporta una respuesta.
- Respuesta en el idioma de la pregunta, en una o dos frases concisas.
- Formato de prompt con roles (`<|start_of_role|>`, `<|end_of_role|>`, `<|end_of_text|>`) y documentos numerados `[1] Título`.
- Integración con pipelines RAG mediante contrato de sistema fijo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no documentadas explícitamente; el comportamiento depende de la instrucción de sistema.

## Casos de uso

- Atención al cliente sobre base documental: el modelo responde preguntas frecuentes usando los artículos recuperados y rechaza limpiamente cuando la documentación no cubre la consulta, evitando respuestas inventadas ante el usuario.
- Asistente interno sobre políticas corporativas: integrado en un pipeline RAG que recupera fragmentos de manuales y normativas, devuelve respuestas de una o dos frases con trazabilidad a los documentos citados.
- Soporte legal o compliance de primer nivel: ante consultas sobre cláusulas contractuales recuperadas, responde solo si la cláusula está presente y declina en caso contrario, reduciendo el riesgo de afirmaciones sin respaldo.
- Búsqueda documental en bases de conocimiento técnicas: capa de respuesta final sobre un motor de recuperación, con salida corta apta para interfaces de chat o widgets.
- Despliegue en edge o local: el GGUF Q8_0 de 1,72 GB permite ejecutarlo en portátiles y estaciones sin GPU dedicada mediante llama.cpp o LM Studio, útil para entornos con requisitos de privacidad.
- Filtro de abstención en pipelines de QA a gran escala: usar el modelo como verificador de respondibilidad antes de invocar un modelo mayor, ahorrando coste en consultas sin evidencia.
- Evaluación de calidad de recuperadores: al medir la tasa de rechazo sobre consultas no respondibles se obtiene una señal indirecta de la cobertura del índice vectorial.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Partición y métrica | LFM3-1.7B base | LFM3-1.7B-aura-grounded | Ganancia neta |
|---|---|---|---|
| Evidencia ausente / no respondible (dominios de entrenamiento) | 3,4 % | 83,9 % | +80,5 % |
| Evidencia ausente / no respondible (dominios no vistos) | 5,8 % | 74,4 % | +68,6 % |
| Precisión en respondibles (dominios no vistos) | 38,6 % | 47,4 % | +8,8 % |
| Grounding en recuperación Aura (respondibles) | 100,0 % | 100,0 % | 100 % correcto |
| Grounding en recuperación Aura (no respondibles) | 100,0 % | 100,0 % | 100 % rechazo limpio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7 GB en FP32 para los pesos completos (1,73 B parámetros × 4 bytes); en Q8_0 el archivo ocupa 1,72 GB y requiere del orden de 2-3 GB de memoria en inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB para FP32; Tesla T4, RTX 3060/4060 o superiores para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores; en Q8_0 también en equipos con 4-6 GB de VRAM.
- Opciones de despliegue: transformers + PEFT (adaptador LoRA sobre el modelo base), llama.cpp y LM Studio con el GGUF Q8_0. No se documenta soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-aura-grounded | 1,73 B | no disponible | RAG con abstención (DPO + LoRA) | Apache 2.0 | HuggingFace, GGUF incluido |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | LLM generalista | Apache 2.0 (según modelo base) | HuggingFace |
| Alternativas de < 3 B para RAG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos pequeños en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: está alineado para un contrato de sistema concreto; fuera de ese formato de prompt el comportamiento de abstención puede degradarse.
- La frase de fallback está fijada en inglés (`I couldn't find the answer in the provided documents.`), lo que puede resultar incoherente en conversaciones en otros idiomas aunque la respuesta sí se produzca en el idioma de la pregunta.
- Tasa de rechazo correcto del 74,4 % en dominios no vistos implica que en torno a una de cada cuatro consultas sin evidencia en dominios fuera de distribución puede seguir generando una respuesta no soportada.
- Precisión en respondibles de solo el 47,4 % en dominios no vistos: no es un modelo adecuado para QA de alta exactitud sin validación adicional.
- Riesgo de alucinación residual inherente a un modelo de 1,7 B, especialmente con documentos largos o ruidosos.
- Sesgos: no documentados por el autor; hereda los del modelo base y del dataset de preferencias.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento.
- Sin datos publicados sobre longitud de contexto efectiva, idiomas soportados ni rendimiento en benchmarks estándar.
- El adaptador requiere cargar el modelo base LiquidAI/LFM3-1.7B y aplicar PEFT; el GGUF incluido simplifica el despliegue pero fija la cuantización Q8_0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeanProgressIQ/LFM3-1.7B-aura-grounded
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
