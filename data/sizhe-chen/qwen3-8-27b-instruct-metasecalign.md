# Sizhe-Chen/Qwen3.8-27B-Instruct-MetaSecAlign

## Resumen
Qwen3.8-27B-Instruct-MetaSecAlign es un ajuste fino del modelo Qwen3.8-27B-Instruct orientado a la defensa frente a ataques de inyeccion de prompt (prompt injection). Lo desarrolla Sizhe Chen junto a Arman Zharmagambetov, David Wagner y Chuan Guo, y constituye la linea base Meta-SecAlign del estudio SecPO. El objetivo es que un agente basado en LLM mantenga su utilidad original mientras ignora instrucciones maliciosas embebidas en datos no confiables (correos, documentos, paginas web).

El modelo parte de una arquitectura transformer multimodal de tipo image-text-to-text con 27 mil millones de parametros, heredada de Qwen3.8-27B, y se entrena mediante Direct Preference Optimization (DPO) sobre inyecciones simuladas estaticas, sin entrenamiento adversarial. Es relevante ahora porque la inyeccion de prompt esta catalogada como la principal amenaza de seguridad para agentes de IA, y este checkpoint sirve como referencia publica para comparar defensas mas avanzadas (SecPO, SecOPD) sobre una misma base.

Esta version concreta se entrena con el modo "thinking" desactivado, por lo que debe usarse con `enable_thinking=False` en inferencia. Para razonamiento con thinking activado existe el checkpoint hermano Qwen3.8-27B-Thinking-SecOPD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B |
| Parametros totales | 27B (heredado del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.8-27B-Instruct, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se aplica un ajuste fino con la perdida de DPO, usando inyecciones de prompt simuladas de posicion estatica como datos de preferencia. No se emplea entrenamiento adversarial ni se sintetizan ataques fuertes, a diferencia de la variante SecPO, que anade un pipeline de adversarial training (best@240) y una perdida teorica alternativa.

La innovacion central de la familia Meta-SecAlign consiste en aleatorizar la posicion de la inyeccion durante el entrenamiento (para evitar aprendizaje de atajos) y usar respuestas autogeneradas como etiquetas de alta calidad en la distribucion. Este checkpoint concreto representa la linea base DPO de ese enfoque, evaluada contra SecPO en el articulo de comparacion. El entrenamiento se realiza con thinking desactivado.

## Capacidades
- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B-Instruct.
- Procesamiento multimodal image-text-to-text (entrada de imagenes junto a texto).
- Defensa frente a inyeccion de prompt en flujos con datos no confiables.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada de forma independiente en esta ficha).
- Uso en flujos agenticos de multiples pasos (evaluado en AgentDojo y AgentDyn segun la model card).
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma declarada.
- Modo thinking desactivado por defecto; requiere `enable_thinking=False`.

## Casos de uso
- Agentes de correo electronico: el modelo puede procesar correos no confiables y resistir instrucciones inyectadas en el cuerpo del mensaje, manteniendo la tarea original del usuario. Es adecuado porque fue entrenado especificamente contra inyecciones en datos externos.
- Navegacion web automatizada: integrado en un agente que lee paginas, reduce el riesgo de que contenido malicioso secuestre la accion del agente (evaluado en WASP segun la model card).
- Atencion al cliente con documentos adjuntos: permite resumir o responder sobre documentos de terceros sin que instrucciones ocultas alteren el comportamiento del asistente.
- Procesamiento de imagenes y texto combinados: al ser image-text-to-text, puede extraer informacion de capturas o documentos escaneados en pipelines donde la entrada no es de confianza.
- Evaluacion comparativa de defensas: sirve como linea base Meta-SecAlign para medir mejoras de SecPO y SecOPD sobre la misma base Qwen3.8-27B.
- Investigacion en seguridad de LLM: util para reproducir experimentos de robustez frente a ataques estaticos y GCG adaptativos descritos en los papers.

## Benchmarks y rendimiento
La model card incluye puntuaciones de utilidad del modelo base (Undefended) y de SecPO, pero deja la columna de Meta-SecAlign (este modelo) sin valores ("—") en la tabla de utilidad. No se han publicado resultados de benchmarks de este checkpoint concreto en la informacion disponible.

| Capacidad | Benchmark | Undefended | Meta-SecAlign (este modelo) | SecPO |
|---|---|---:|---:|---:|
| Ciencia | MMLU-Pro | 82,25% | no disponible | 82,11% |
| Ciencia | GPQA Diamond | 79,80% | no disponible | 76,77% |
| Matematicas | GSM8K | 96,40% | no disponible | no disponible |
| Matematicas | Minerva Math | 96,04% | no disponible | 95,58% |
| Instrucciones | AlpacaEval2 | 53,34% | no disponible | 53,55% |
| Instrucciones | SEP Utility | 88,60% | no disponible | 88,71% |
| Agentico | AgentDojo Utility | 85,74% | no disponible | 84,93% |
| Agentico | AgentDyn Utility | 78,33% | no disponible | 68,33% |

Los datos de seguridad (tasa de exito de ataque) del checkpoint aparecen truncados en la informacion disponible; el articulo SecPO reporta que Meta-SecAlign sufre ASR proximos al 100% bajo inyecciones adaptativas, frente a 8,8% de SecPO + AT en AgentDojo ASR@800 con el ataque AttackerMovesSecond.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: alrededor de 54 GB solo para pesos (27B x 2 bytes), mas overhead de activaciones y KV cache.
- En cuantizacion de 8 bits: aproximadamente 27 GB; en 4 bits: aproximadamente 14-16 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o multiples GPU consumer de 24 GB con sharding.
- Cabe en GPU consumer (RTX 4090 24 GB) solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidor; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Instruct-MetaSecAlign (este) | 27B | no disponible | Defensa DPO con inyecciones simuladas | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Instruct-SecPO | 27B | no disponible | SecPO + adversarial training | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Thinking-SecOPD | 27B | no disponible | SecOPD con thinking activado | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B | no disponible | Sin defensa | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- Bajo inyecciones adaptativas, la tasa de exito de ataque de Meta-SecAlign se aproxima al 100% segun el articulo SecPO; no debe considerarse una defensa suficiente en produccion.
- Entrenado solo con inyecciones simuladas estaticas y sin adversarial training, lo que deja expuesta la superficie ante ataques fuertes.
- Idioma limitado al ingles segun la etiqueta declarada; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente al modelo base, no mitigado por el ajuste de seguridad.
- Sesgos heredados de Qwen3.8-27B-Instruct, no documentados en la informacion disponible.
- El modo thinking esta desactivado; usar `enable_thinking=True` puede degradar el comportamiento esperado.
- Licencia Apache 2.0 permite uso comercial, pero sujeta a las condiciones del modelo base Qwen3.8-27B.
- Sin descargas ni likes en el momento de la consulta; ecosistema de validacion externa muy limitado.

## Enlaces
- Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-MetaSecAlign
- Repositorio de archivos: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-MetaSecAlign/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper Meta-SecAlign: https://arxiv.org/abs/2507.02735
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo: https://github.com/Sizhe-Chen/SecPO
- Checkpoint SecPO: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO
- Checkpoint SecOPD: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Thinking-SecOPD
- Pagina del autor: https://sizhe-chen.github.io/
