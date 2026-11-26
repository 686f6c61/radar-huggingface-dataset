# BH-Language-AI/bh-agentmujo-1-9b-9q-bundle

## Resumen

BH-AgentMujo-1-9B-9Q-Bundle es un repositorio de archivo publicado por BH-Language-AI que reúne 15 ficheros GGUF cuantizados en Q8_0 derivados del modelo base Qwen/Qwen3.5-9B. No se trata de un modelo único, sino de un paquete histórico de compilaciones (gold01–gold08, v0.1–v0.6 y dpo01) que documenta la evolución del ajuste fino orientado a function calling y agentes en bosnio. El autor recomienda usar el repositorio de producción bh-agentmujo-1-9b para despliegue, quedando este bundle como traza reproducible del proceso de entrenamiento.

El modelo subyacente parte de Qwen3.5-9B, un transformer denso de aproximadamente 8.950 millones de parámetros con vocabulario de 248.320 tokens, 32 capas y dimensión oculta de 4096. Sobre esa base se aplicó un ajuste supervisado (SFT) orientado a "dialect-dense" con el objetivo de mejorar el comportamiento en tool calling bajo prompts de producción en lengua bosnia, empleando LoRA de rangos r16 y r64 en distintas iteraciones.

La relevancia de este bundle es doble: por un lado, ofrece una traza completa y verificable de iteraciones de entrenamiento con métricas internas (AgentMujo-Bench v0.5), algo poco habitual en publicaciones de modelos pequeños; por otro, demuestra que un modelo de ~9B puede alcanzar tasas de acierto razonables en invocación de herramientas en un idioma de bajos recursos como el bosnio. La licencia Apache-2.0 facilita su reutilización comercial, aunque el estado de archivo y la falta de benchmarks públicos estándar limitan su adopción directa en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF); ~9,5 GB por fichero |
| Idiomas soportados | Bosnio (bs); capacidades multilingües heredadas del base no documentadas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); el base Qwen3.5-9B se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B en la revisión `c20223623`, un transformer denso con 32 capas, dimensión oculta de 4096 y vocabulario de 248.320 tokens. El proceso de ajuste se organizó en una cadena de iteraciones: primero LoRA de rango 16 (jt01–jt05, con mezcla de datos v0.35), después LoRA de rango 64 (r6401–r6406) y finalmente las compilaciones gold01–gold06, que constituyen la traza principal. La compilación gold06 se etiqueta como producción (release v1.0, 2026-11-10).

El entrenamiento se orientó a "dialect-dense SFT", es decir, ajuste supervisado con datos densos en variantes dialectales del bosnio, con el objetivo de que el formato de invocación de herramientas funcione bajo el prompt de producción por defecto, sin especificación de formato explícita. La cuantización se realizó con llama.cpp mediante `convert_hf_to_gguf.py --no-mtp` y tipo Q8_0. El framework de entrenamiento es agentmujo-training, publicado en GitHub por el mismo autor. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO más allá de la compilación dpo01 mencionada en el archivo.

## Capacidades

- Generación de texto conversacional en bosnio, con soporte multi-turno.
- Function calling / tool calling: capacidad central del ajuste, con formato de invocación que funciona bajo prompt de producción por defecto.
- Razonamiento multi-paso orientado a agentes, incluyendo comportamiento "check-then-ask" (verificar antes de actuar) en lugar de ejecución ciega.
- Integración con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades heredadas del base Qwen3.5-9B (código, matemáticas, multilingüismo) no documentadas explícitamente en la model card.
- No se documenta modo thinking, visión ni audio en este bundle.

## Casos de uso

- Agentes de automatización de tareas administrativas en bosnio: el modelo puede invocar funciones de backend (consultas a bases de datos, envío de correos, creación de tickets) gracias al ajuste específico en tool calling y a su comportamiento de verificación previa a la acción.
- Asistente de atención al cliente en bosnio: gestiona conversaciones multi-turno con invocación de herramientas para consultar pedidos o estado de cuentas, adecuado por su entrenamiento en dialectos y su política conservadora ante ambigüedad.
- Automatización de flujos RPA con validación: el patrón check-then-ask reduce acciones erróneas en pipelines donde la invocación incorrecta de una herramienta tiene coste operativo.
- Evaluación comparativa de iteraciones de ajuste fino: al conservar 15 compilaciones con métricas internas, sirve como material de estudio para investigadores que analizan el impacto de LoRA r16 frente a r64 en tareas de function calling.
- Prototipado rápido en local: al distribuirse en GGUF Q8_0 (~9,5 GB por fichero), puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo alta gama.
- Investigación en lenguas de bajos recursos: referencia para estudiar técnicas de SFT dialect-dense aplicadas a un modelo de ~9B en bosnio.
- Despliegue en entornos con requisitos de licencia permisiva: Apache-2.0 permite uso comercial sin restricciones adicionales documentadas.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas internas del AgentMujo-Bench v0.5 (48 casos, prompt por defecto), reportadas por el autor. No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Compilación | Gate tool | Gate args | Notas |
|---|---|---|---|
| model-q8-gold06.gguf | 0,700 | 0,846 | Producción (v1.0); loop tool 0,833, strict 0,75, task 0,979 |
| model-q8-gold05.gguf | 0,667 | 0,808 | Archivo |
| model-q8-gold04.gguf | no disponible | no disponible | Mejor pre-gold06 |
| model-q8-gold03.gguf | 0,500 | 0,500 | Regresión por sesgo de listado |
| model-q8-gold02.gguf | 0,633 | 0,731 | Archivo |
| model-q8-gold01.gguf | 0,600 | 0,654 | Primer formato por defecto |
| gold07 / gold08 | no disponible | no disponible | Experimentales |
| v0.1–v0.6, dpo01 | no disponible | no disponible | Traza antigua, experimentales |

Limitaciones declaradas para gold06: no-tool entre 0,25 y 0,50 (la capa de política captura el exceso); check-then-ask en lugar de acción ciega (deliberado); el perfil think no forma parte del release.

## Requisitos de hardware

- VRAM estimada para inferencia Q8_0: ~9,5 GB de pesos más overhead de contexto y KV cache; en la práctica, entre 11 y 14 GB según longitud de contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual con margen amplio.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo) y RTX 4070 Ti Super (16 GB, con contexto limitado). En GPUs de 12 GB requeriría cuantizaciones menores no incluidas en este bundle.
- Opciones de despliegue: llama.cpp (`llama serve`), Ollama (`ollama run hf.co/BH-Language-AI/bh-agentmujo-1-9b`), y servidores compatibles con endpoints. vLLM y TGI no están documentados para formato GGUF en esta model card.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| BH-AgentMujo-1-9B-9Q-Bundle | ~8,95B | no disponible | Apache-2.0 | Function calling en bosnio | GGUF Q8_0, repo de archivo |
| Qwen/Qwen3.5-9B (base) | ~8,95B | no disponible | Apache-2.0 | Propósito general multilingüe | Safetensors, modelo público |
| Modelos de function calling de ~7-9B (familia Qwen, Llama) | 7-9B | variable | variable | Tool calling multilingüe | Safetensors y GGUF |

La comparación directa con alternativas de la misma categoría (modelos de ~9B especializados en tool calling) no está disponible con datos verificables en la información proporcionada. El base Qwen3.5-9B es la referencia natural, y este bundle representa una especialización en bosnio a costa de posibles regresiones en capacidades generales no medidas.

## Limitaciones y advertencias

- Estado de archivo: el autor recomienda no usar este bundle para despliegue; debe usarse bh-agentmujo-1-9b.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K); las únicas métricas son internas (AgentMujo-Bench v0.5, 48 casos), lo que limita la comparabilidad.
- Tasa de no-tool baja en gold06 (0,25–0,50): el modelo puede invocar herramientas en exceso cuando no corresponde, compensado parcialmente por una capa de política externa.
- Comportamiento check-then-ask deliberado: puede resultar en preguntas adicionales al usuario en lugar de ejecución autónoma, lo que afecta a flujos que requieren acción directa.
- Idioma principal bosnio: el rendimiento en castellano u otros idiomas no está documentado y puede degradarse respecto al base.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de factualidad.
- Sesgos: no documentados por el autor; se heredan los del base Qwen3.5-9B.
- Longitud de contexto no especificada en la model card; debe consultarse la del base Qwen3.5-9B.
- El perfil think no forma parte del release de producción.
- Tamaño del repositorio elevado (85,7 GB) por contener 15 ficheros; requiere descarga selectiva del GGUF deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b-9q-bundle
- Repositorio de producción: https://huggingface.co/BH-Language-AI/bh-agentmujo-1-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework de entrenamiento: https://github.com/BH-Language-AI/agentmujo-training
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
