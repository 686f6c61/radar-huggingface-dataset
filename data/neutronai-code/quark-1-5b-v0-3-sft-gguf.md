# neutronai-code/Quark-1.5B-v0.3-sft-GGUF

## Resumen

Quark-1.5B-v0.3-sft-GGUF es un modelo de lenguaje de aproximadamente 1.540 millones de parametros, publicado por el usuario neutronai-code en Hugging Face. Se distribuye unicamente en formato GGUF, lo que lo orienta de forma explicita a la inferencia local mediante llama.cpp. La model card indica que fue afinado y convertido a GGUF con la herramienta Unsloth, y los tags del repositorio lo asocian a la familia arquitectonica Qwen2.

El modelo se presenta como una version SFT (supervised fine-tuning) de una iteracion previa (v0.2 segun el nombre del archivo de pesos incluido), lo que sugiere un ciclo de desarrollo incremental y de caracter experimental. El repositorio tiene un tamano de 1,0 GB, coherente con un unico archivo cuantizado en Q4_K_M para un modelo de este tamano.

La relevancia practica es limitada por ahora: no hay pipeline declarado, no se especifica licencia, no se documentan idiomas ni resultados de benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta. Es, por tanto, un modelo a considerar solo como objeto de evaluacion directa por parte del usuario, no como una dependencia estable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (segun tag del repositorio) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,0 GB |
| Herramienta de entrenamiento y conversion | Unsloth |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia Qwen2, lo que implica una arquitectura transformer decoder-only con atencion causal, mecanismo de atencion con RoPE y normalizacion RMSNorm, si bien la model card no detalla la configuracion concreta de capas, dimensiones ocultas ni numero de cabezas de atencion. El numero exacto de parametros (1.543.714.304) procede de los metadatos del repositorio y es consistente con un modelo de aproximadamente 1,5B.

El proceso de entrenamiento documentado se limita a indicar que el modelo fue afinado y convertido a GGUF mediante Unsloth, una libreria orientada a reducir el coste de memoria y acelerar el fine-tuning. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni la naturaleza del ajuste supervisado (SFT) aplicado. Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de la arquitectura Qwen2 subyacente.
- Conversacion multi-turno sujeta a la plantilla de chat que el autor no documenta; se recomienda invocar llama.cpp con `--jinja` para aplicar la plantilla integrada.
- El nombre del modelo (sft) indica un ajuste supervisado orientado a instrucciones, aunque el contenido y la calidad de ese ajuste no estan documentados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue especifica.
- No se documenta modo de razonamiento explicito (thinking), vision, audio ni ninguna modalidad adicional.
- La model card incluye una linea de ejemplo para modelos multimodales (`llama-mtmd-cli`), pero no hay evidencia en los tags ni en los metadatos de que este modelo concreto procese imagenes.

## Casos de uso

- Evaluacion local de modelos pequenos: sirve para probar el flujo completo de Unsloth a GGUF y validar la plantilla de chat con `llama-cli --jinja` en un equipo de sobremesa.
- Prototipado rapido de asistentes conversacionales: con 1,5B parametros y cuantizacion Q4_K_M, el modelo cabe en cualquier GPU consumer moderna y permite iterar sobre prompts sin coste de API.
- Generacion de texto en entornos con recursos restringidos: su tamano reducido permite ejecutarlo en CPU con llama.cpp, util para tareas de redaccion corta o resumen en dispositivos sin GPU dedicada.
- Base para fine-tuning propio: al ser un modelo pequeno y ya adaptado a instrucciones, puede servir como punto de partida para ajustes especificos de dominio con Unsloth sobre hardware modesto.
- Filtrado y clasificacion de texto en pipelines offline: puede emplearse para tareas de etiquetado simple o generacion de respuestas plantilla donde no se requiera alta precision.
- Docencia y experimentacion: util como ejemplo practico de ciclo SFT y cuantizacion GGUF en cursos o talleres sobre IA open source, dado su bajo coste de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con la cuantizacion Q4_K_M publicada, incluyendo overhead de contexto segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Tambien funciona en CPU mediante llama.cpp.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. No se distribuyen pesos safetensors en el repositorio, por lo que vLLM o TGI requeririan conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Quark-1.5B-v0.3-sft-GGUF | 1,54B | no disponible | no disponible | GGUF | Hugging Face, repo con 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | safetensors, GGUF | Amplia, ecosistema maduro |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Amplia, ecosistema maduro |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Amplia, ecosistema maduro |

Los datos de los modelos comparativos proceden de su documentacion publica y no de la informacion proporcionada sobre Quark; se incluyen solo como referencia de categoria. Para Quark no hay datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos conocidos o la composicion linguistica del modelo.
- Riesgo elevado de alucinacion esperable en un modelo de 1,5B sin benchmarks publicados; no recomendable para tareas que exijan veracidad factual sin verificacion externa.
- Longitud de contexto no documentada; asumir valores conservadores hasta verificacion empirica.
- Idiomas soportados no declarados; no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- Licencia no especificada: no se puede confirmar el uso comercial. Tratar como no apto para produccion hasta que el autor aclare la licencia.
- Repositorio sin descargas ni likes y con un unico archivo de pesos (Q4_K_M); no hay garantia de mantenimiento, versionado estable ni soporte del autor.
- Inconsistencia menor entre el nombre del modelo (v0.3) y el nombre del archivo de pesos (v0.2), lo que dificulta trazar que version se esta ejecutando realmente.
- La plantilla de chat no se documenta de forma explicita; es necesario usar `--jinja` en llama.cpp para que se aplique la plantilla embebida en el GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.3-sft-GGUF
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
