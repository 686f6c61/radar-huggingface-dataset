# PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF

## Resumen

Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF es la versión cuantizada en formato GGUF de Qwen3.5-0.8B-Opus-Reasoning-Distilled, un modelo de razonamiento de 0,8B parámetros desarrollado por PhilipEriksson. El modelo base es un fine-tuning de Qwen3.5-0.8B entrenado sobre trazas de razonamiento (chain-of-thought) generadas por Claude Opus y Qwen3.5-27B, con el objetivo de destilar la capacidad de producir razonamientos paso a paso en un modelo extremadamente pequeño y ejecutable en hardware de consumo.

Su relevancia reside en la creciente demanda de modelos de razonamiento ligeros capaces de correr en local: con cuantizaciones de 542 MB (Q4_K_M) y 834 MB (Q8_0), puede ejecutarse en portátiles, Raspberry Pi o cualquier GPU de consumo sin apenas consumo de VRAM. El autor lo presenta explícitamente como un proyecto de aprendizaje, no como una release competitiva en benchmarks, lo que conviene tener presente al evaluarlo para producción.

La arquitectura hereda el diseño multimodal de Qwen3.5 (incluye torre de visión), aunque el fine-tuning se realizó solo sobre texto y la parte visual no fue entrenada. Emite un bloque de razonamiento delimitado antes de la respuesta final, al estilo de los modelos reasoning actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (arquitectura multimodal heredada, con atención lineal según el issue de llama.cpp; no disponible el detalle completo) |
| Parametros totales | 772.845.888 (~0,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8,5 bits/peso, 834 MB), GGUF Q4_K_M (4,9 bits/peso, 542 MB); también existen versiones EXL3 4.0/3.0 bpw y NVFP4 en otros repos |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base, 1,7 GB en BF16) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen3.5-0.8B mediante LoRA (existe un repositorio con el adaptador LoRA separado). La arquitectura de Qwen3.5 es multimodal (image-text-to-text según el pipeline tag), y el issue de llama.cpp referenciado indica que incorpora atención lineal con reordenación de V-heads, un mecanismo de eficiencia típico de las arquitecturas híbridas recientes. La torre de visión fue excluida del fine-tuning, por lo que en la práctica el modelo es solo texto.

El entrenamiento se realizó con 2.917 filas de datos (trazas de razonamiento de Claude Opus y Qwen3.5-27B) durante aproximadamente 25 minutos en una única RTX 5090. Se trata de una destilación de comportamiento de razonamiento: el modelo aprende a reproducir la estructura y el formato de una cadena de pensamiento, no necesariamente a mejorar la calidad real del razonamiento. Las cuantizaciones GGUF se generaron con el conversor de Unsloth (el conversor estándar de llama.cpp está roto para la arquitectura `qwen3_5`) y cuantizadas con `llama-quantize`.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat estilo ChatML (`<|im_start|>`).
- Producción de trazas de razonamiento (chain-of-thought): emite un bloque delimitado antes de la respuesta final, con cierre de thinking que llama.cpp renderiza como `[End thinking]`.
- Tareas básicas de aritmética, código y lógica simples, según la prueba de humo del autor (3/3 en las tres categorías con ambas cuantizaciones GGUF).
- Etiquetado como image-text-to-text por heredar la arquitectura multimodal del base, pero la capacidad de visión no fue entrenada y no debe considerarse funcional.
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agentes entrenadas específicamente.

## Casos de uso

- Experimentación local con modelos de razonamiento: ideal para estudiar el formato y comportamiento de trazas chain-of-thought en un modelo que cabe en cualquier dispositivo, sin coste de API ni hardware dedicado.
- Prototipado de pipelines con llama.cpp: al ser GGUF autocontenido con tokenizer incluido, permite integrar razonamiento en aplicaciones locales en minutos, probando primero con `llama-cli`.
- Asistente de razonamiento básico en edge devices: en Q4_K_M ocupa 542 MB, lo que lo hace viable en portátiles sin GPU, mini-PCs o SBCs para tareas de lógica y aritmética sencillas.
- Pruebas de regresión de cuantizaciones: el propio repositorio sirve como ejemplo metodológico de cómo validar que una cuantización no degrada un modelo (comparación contra baseline BF16).
- Desarrollo y depuración de tooling: útil para verificar soporte de nuevas arquitecturas (`qwen3_5`) en llama.cpp, Ollama y LM Studio antes de desplegar modelos mayores de la misma familia.
- Generación sintética de datos de razonamiento de baja exigencia: puede usarse para producir esqueletos de trazas de razonamiento que luego se filtran o verifican con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor realizó una prueba de humo con tres prompts (aritmética, código, lógica) sobre cada artefacto del modelo, con los mismos ajustes de sampler y `max_new_tokens=700`:

| Artefacto | Tamaño | Respuesta esperada encontrada |
|---|---:|---|
| BF16 (baseline) | 1,7 GB | 3/3 |
| GGUF Q8_0 | 834 MB | 3/3 |
| GGUF Q4_K_M | 542 MB | 3/3 |
| EXL3 4.0 bpw | 1,08 GB | 3/3 |
| EXL3 3.0 bpw | 1,02 GB | 2/3 |
| NVFP4 | 892 MB | 3/3 |

El autor advierte explícitamente que tres prompts constituyen una prueba de humo, no un benchmark: detecta roturas evidentes pero no permite ordenar formatos por calidad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 542 MB en Q4_K_M y 834 MB en Q8_0 más overhead de contexto; ejecutable íntegramente en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna lo ejecuta con holgura. El entrenamiento se realizó en una RTX 5090, pero la inferencia no la requiere.
- Consumer GPUs: cabe con enorme margen en cualquier GPU de consumo (incluso una RTX 3050 de 6 GB o una GTX 1660); también funciona solo con CPU y RAM del sistema.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado), Ollama (`ollama run hf.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF:Q4_K_M`) y LM Studio (búsqueda directa del repositorio).
- Latencia y throughput estimados: no disponible; dada la talla de 0,8B, se espera inferencia muy rápida incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF | 0,8B | GGUF (Q8_0, Q4_K_M) | Apache-2.0 | Razonamiento destilado de Claude Opus y Qwen3.5-27B; proyecto de aprendizaje |
| Qwen3-0.6B (oficial de Alibaba) | 0,6B | Safetensors, GGUF comunitarios | Apache-2.0 | Modelo de razonamiento/híbrido oficial, entrenado a gran escala con soporte de thinking mode |
| SmolLM2-360M / 1.7B (Hugging Face) | 360M / 1,7B | Safetensors, GGUF comunitarios | Apache-2.0 | Modelos pequeños generalistas de texto, sin destilación de razonamiento específica |

Frente a Qwen3-0.6B oficial, este modelo ofrece trazas de razonamiento con el estilo de modelos mucho mayores, pero con una base de entrenamiento mínima (2.917 filas), por lo que su calidad real de razonamiento será inferior a la de modelos oficiales entrenados a escala. Frente a SmolLM2, aporta el comportamiento reasoning como diferenciador, a costa de un entrenamiento mucho más limitado.

## Limitaciones y advertencias

- El propio autor lo califica como un "learning run, not a benchmark-competitive release": 2.917 filas de entrenamiento y 25 minutos en una RTX 5090 no bastan para un modelo competitivo.
- Con 0,8B parámetros, fallará en cualquier tarea que requiera conocimiento del mundo real o planificación multi-paso; es bueno reproduciendo la forma de una traza de razonamiento, no necesariamente su contenido.
- Riesgo elevado de alucinación: la destilación de estilo puede producir razonamientos plausibles pero incorrectos, y el modelo pequeño carece de conocimiento factual sólido.
- Solo texto: la torre de visión heredada de la arquitectura multimodal no fue entrenada; el pipeline tag image-text-to-text es engañoso en la práctica.
- Idioma: declarado únicamente en inglés; no hay soporte garantizado para castellano ni otros idiomas.
- El conversor estándar de llama.cpp (`convert_hf_to_gguf.py`) está roto para la arquitectura `qwen3_5` (issue #27019, cerrado como "not planned"); las conversiones requieren el conversor de Unsloth, lo que puede complicar futuras cuantizaciones propias.
- La longitud de contexto no está documentada en la model card; verificarla antes de desplegar en producción.
- Licencia Apache-2.0: sin restricciones para uso comercial, heredada del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF
- Modelo base: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled
- Colección del proyecto: https://huggingface.co/collections/PhilipEriksson/qwen35-08b-opus-reasoning-distilled-6ae3336176ac243223f27ee9
- Adaptador LoRA: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA
- Versión EXL3: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3
- Versión NVFP4: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4
- Issue de llama.cpp sobre el conversor de `qwen3_5`: https://github.com/ggml-org/llama.cpp/issues/27019
