# kaiferen17/qwen3-1.7b-coding-only-GGUF

## Resumen

qwen3-1.7b-coding-only-GGUF es una variante derivada de Qwen/Qwen3-1.7B, desarrollada por el usuario kaiferen17, orientada a conversacion bilingue ingles-hinglish (hindi romanizado) y a tareas de programacion. El modelo parte de la arquitectura transformer densa de Qwen3 con 1.700 millones de parametros y aplica dos modificaciones principales: una poda del vocabulario BPE (de 151.936 a 97.408 tokens) eliminando tokens de alfabetos no latinos, y un ajuste fino mediante LoRA en FP16 con distillation de codigo.

El resultado es un artefacto GGUF cuantizado en Q6_K de 1,23 GB, pensado para ejecucion en CPU en portatiles sin GPU. La poda del vocabulario se presenta como matematicamente sin perdida para prompts en ingles, hinglish y codigo (Python/JS), con una diferencia maxima de logits de 0,00000 verificada antes del entrenamiento.

Su relevancia es practica: demuestra una receta reproducible para reducir el tamano de un modelo pequeno manteniendo equivalencia funcional en el subconjunto de idiomas objetivo, y para adaptar un modelo generalista a un nicho concreto (codigo e hinglish) con recursos minimos. No obstante, el modelo tiene cero descargas y un solo like en el momento de redactar esta ficha, por lo que debe considerarse un experimento de autor individual, no un artefacto con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona pruebas a contexto de 4K) |
| Tipos de cuantizacion | Q6_K GGUF (unico publicado) |
| Idiomas soportados | Ingles (en) e hindi romanizado / hinglish (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

Datos adicionales verificados en la model card: vocabulario reducido a 97.408 tokens, tamano de archivo 1,23 GB, huella RAM aproximada de 2,0 GB a contexto de 4K.

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer densa de Qwen3-1.7B sin cambios estructurales. La intervencion principal es una poda del vocabulario BPE bajo un criterio de "cierre" (closure): se eliminan 54.528 tokens de alfabetos no latinos (CJK, arabe, cirilico, devanagari, thai, etc.) conservando el 100% de ASCII, ingles, hinglish romanizado, sintaxis e indentacion de codigo, 256 tokens de byte-fallback y los 26 tokens especiales de Qwen3 (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`, `<tool_call>`, tokens FIM). La equivalencia de logits se verifico antes del entrenamiento con `max_abs_diff = 0.00000` sobre prompts en ingles, hinglish y Python/JS.

El ajuste fino se realizo con LoRA en FP16 (r=32, alpha=64), con enmascaramiento de perdida solo en completacion (completion-only loss masking) y una tasa de aprendizaje conservadora anti-olvido de 6e-5 con schedule coseno. El dataset sumaba 10.983 muestras latinas puras: 5.000 de `m-a-p/CodeFeedback-Filtered-Instruction`, 3.500 de `ise-uiuc/Magicoder-Evol-Instruct-110K`, 1.500 de `nvidia/OpenCodeReasoning` (split_0, destilado de DeepSeek-R1 con trazas `<think>...</think>`, filtrado por longitud), 1.200 de `Abhishekcr448/Hinglish-Everyday-Conversations-1M` filtradas y 128 ejemplos ancla personalizados de codigo tecnico en hinglish. La perdida de validacion descendio de 1,5441 a 0,5908 (-0,9534) de forma monotona, sin sobreajuste segun el autor.

## Capacidades

- Generacion de texto conversacional en ingles y hinglish romanizado.
- Generacion y completado de codigo (Python, JavaScript y otros lenguajes con sintaxis ASCII), incluyendo indentacion y tokens FIM.
- Razonamiento con modo thinking: conserva los tokens `<think>` y `</think>` de Qwen3, reforzados con muestras destiladas de DeepSeek-R1.
- Soporte de tool calling a nivel de tokenizador (`<tool_call>` conservado), aunque no se documenta validacion funcional del mismo.
- Conversacion multi-turno mediante los tokens de chat de Qwen3.
- Capacidad multilingue limitada a ingles e hinglish; el resto de alfabetos queda fuera del vocabulario.
- No se documentan capacidades de vision, audio ni agentes multi-paso verificados.

## Casos de uso

- Asistente de programacion en portatil sin GPU: ejecutable via Ollama con 2,0 GB de RAM a 4K de contexto, util para autocompletado, explicacion de fragmentos y generacion de funciones en Python o JavaScript durante el desarrollo local.
- Soporte tecnico en hinglish: atiende conversaciones multi-turno de usuarios que escriben hindi romanizado mezclado con ingles, un registro comun en comunidades de desarrolladores del sur de Asia.
- Generacion de codigo en pipelines CI/CD: al conservar tokens FIM y tool calling, puede integrarse en flujos de revision o generacion de parches donde el coste de inferencia en CPU es aceptable.
- Educacion y tutoria de programacion bilingue: explica conceptos tecnicos en ingles o hinglish con trazas de razonamiento visibles (`<think>`), adecuado para entornos con hardware modesto.
- Prototipado rapido offline: permite iterar sobre prompts y evaluar comportamiento de Qwen3-1.7B en maquinas sin acelerador, con un artefacto de 1,23 GB facil de distribuir.
- Filtrado y clasificacion de codigo: tareas de etiquetado o resumen de fragmentos en entornos con restricciones de latencia y memoria, donde un modelo de 1,7B cuantizado a Q6_K ofrece throughput de 7 a 13 tokens/s en CPU.
- Base para destilacion adicional: al ser un GGUF de licencia Apache 2.0 con vocabulario reducido, sirve como punto de partida para ajustes especificos de dominio con huella de memoria minima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida de validacion de 1,5441 a 0,5908) y de rendimiento en CPU: aproximadamente 7 a 13 tokens/s en un AMD Ryzen 5 5625U, con huella de RAM de cerca de 2,0 GB a contexto de 4K.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,0 GB de RAM total a contexto de 4K con cuantizacion Q6_K (1,23 GB de pesos).
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU. Cualquier GPU consumer con 4 GB o mas de VRAM puede alojarlo, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 4 GB de VRAM efectiva, aunque el caso objetivo es CPU.
- Opciones de despliegue: llama.cpp, Ollama (incluida la integracion directa `ollama run hf.co/kaiferen17/qwen3-1.7b-coding-only-GGUF:Q6_K`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: 7 a 13 tokens/s en CPU AMD Ryzen 5 5625U segun el autor; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-1.7b-coding-only-GGUF | 1,7B | no disponible (probado a 4K) | en, hi (hinglish) | Apache 2.0 | GGUF Q6_K | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | multilingue amplio | Apache 2.0 | safetensors y GGUF | Hugging Face, ampliamente usado |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF | Hugging Face, comunidad amplia |
| DeepSeek-Coder-1.3B | 1,3B | no disponible en esta ficha | principalmente en | licencia propia | safetensors, GGUF | Hugging Face |

La comparacion de rendimiento no esta disponible: el modelo derivado no publica benchmarks, por lo que no puede establecerse una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Vocabulario restringido: cualquier texto en alfabetos no latinos (CJK, arabe, cirilico, devanagari, thai) cae en tokens de byte-fallback, degradando calidad y eficiencia; no es apto para uso multilingue fuera de ingles e hinglish.
- Riesgo de alucinacion: modelo de 1,7B con ajuste fino sobre 10.983 muestras; propenso a inventar APIs, firmas de funciones y hechos tecnicos, especialmente fuera de los lenguajes dominantes en el dataset.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset de hinglish proviene de conversaciones cotidianas filtradas, con posible sesgo de registro y demografia.
- Validacion limitada: cero descargas y un solo like en el momento de la ficha; no hay evaluacion independiente ni benchmarks publicados.
- Tool calling no verificada: los tokens especiales se conservan, pero no se documenta que el ajuste fino haya mantenido la funcionalidad real de llamada a herramientas.
- Contexto no confirmado: la model card solo cita pruebas a 4K; no se especifica la ventana maxima efectiva tras la poda del vocabulario.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene auditar el comportamiento antes de produccion.
- Fecha de creacion futura (2026-11-19) en los metadatos de Hugging Face, lo que sugiere inconsistencia en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaiferen17/qwen3-1.7b-coding-only-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset Hinglish-Everyday-Conversations-1M: https://huggingface.co/datasets/Abhishekcr448/Hinglish-Everyday-Conversations-1M
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
