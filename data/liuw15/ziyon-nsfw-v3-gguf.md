# liuw15/ziyon-nsfw-v3-GGUF

## Resumen

Ziyon NSFW v3 es un modelo de lenguaje conversacional derivado de `unsloth/Qwen3-8B` mediante la fusión de un adaptador LoRA (`liuw15/ziyon-lora-nsfw-v3`) y su posterior conversión a formato GGUF con cuantizaciones Q8_0 y Q4_K_M. Lo publica el usuario `liuw15` en Hugging Face y está pensado para su uso en `llama.cpp` y clientes compatibles como Ollama. El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales.

El propósito declarado es la generación de contenido conversacional sin restricciones de temática NSFW, lo que se refleja en la etiqueta `not-for-all-audiences` del repositorio. No se trata de un modelo de propósito general orientado a tareas de ingeniería o razonamiento, sino de un ajuste fino con LoRA sobre una base ya capaz, orientado a rol conversacional y contenido para adultos.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no hay model card detallada, no se publican datos de entrenamiento, benchmarks ni licencia explícita, y el repositorio no registra descargas ni valoraciones en el momento de la consulta. Se documenta, por tanto, lo que puede verificarse a partir de los metadatos y de la información del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no confirmada en el repo) |
| Tipos de cuantización | Q8_0 (8,11 GB) y Q4_K_M (4,68 GB) |
| Idiomas soportados | no disponible (la model card está en chino; la base Qwen3-8B es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-8B`, una versión de Qwen3-8B distribuida por Unsloth, y aplica un adaptador LoRA denominado `liuw15/ziyon-lora-nsfw-v3` que se fusiona en los pesos base. Posteriormente, el resultado se convierte a GGUF y se cuantiza en dos variantes: Q8_0, prácticamente sin pérdida de calidad, y Q4_K_M, orientada a un equilibrio entre tamaño y fidelidad. No se especifican en la información disponible el número de tokens de entrenamiento del adaptador, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

La innovación técnica, si puede llamarse así, se limita al pipeline de fusión LoRA más conversión y cuantización a GGUF. No hay indicios de modificaciones arquitectónicas sobre la base Qwen3-8B, ni de decodificación especulativa, atención lineal u otras optimizaciones propias. El resultado es, en la práctica, un Qwen3-8B con un ajuste fino temático empaquetado para inferencia local.

## Capacidades

- Generación de texto conversacional multi-turno, con especialización declarada en contenido NSFW.
- Rol e interpretación de personajes, dado el origen del ajuste LoRA.
- Capacidades heredadas de Qwen3-8B: razonamiento general, código y matemáticas básicas, aunque no verificadas en este ajuste.
- Soporte multilingüe presumible por la base Qwen3, si bien no se documenta en el repositorio.
- Compatibilidad con `llama.cpp` (CLI y servidor HTTP) y con clientes que acepten GGUF, como Ollama.
- No se documenta soporte de tool calling, function calling, agentes ni modos de pensamiento explícitos en el repositorio.

## Casos de uso

- Roleplay conversacional para adultos: el ajuste LoRA está entrenado específicamente para este dominio, y las cuantizaciones Q4_K_M permiten ejecutarlo en equipos de consumo.
- Generación de ficción y narrativa para mayores de edad: el modelo puede producir texto largo y coherente gracias a la base Qwen3-8B, con la temática del ajuste aplicada.
- Prototipado local de chatbots temáticos: mediante `llama-server` se puede levantar un endpoint HTTP compatible con OpenAI y conectarlo a interfaces de chat.
- Experimentación con pipelines de fusión LoRA: el repositorio sirve como ejemplo práctico de merge de adaptador y conversión a GGUF con `llama.cpp`.
- Evaluación comparativa de cuantizaciones: al ofrecer Q8_0 y Q4_K_M del mismo modelo, permite medir la degradación de calidad entre ambas en tareas conversacionales.
- Despliegue en entornos sin GPU dedicada: con Q4_K_M (4,68 GB) puede ejecutarse en CPU con RAM suficiente, útil para pruebas offline o en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 9-10 GB para Q8_0 (8,11 GB de pesos más overhead de contexto y KV cache) y en torno a 5,5-6,5 GB para Q4_K_M (4,68 GB de pesos más overhead).
- GPU recomendadas: RTX 3090, RTX 4080, RTX 4090, A10, L4 o superiores para Q8_0; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 para Q4_K_M.
- Cabe en GPU de consumo: sí, ambas cuantizaciones caben en GPUs de 8-12 GB según el contexto configurado; Q4_K_M es la opción más holgada.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama mediante `ollama run hf.co/liuw15/ziyon-nsfw-v3-GGUF`, y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware, del contexto y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ziyon NSFW v3 (este) | 8,19 B | no disponible | no disponible | GGUF (Q8_0, Q4_K_M) | Ajuste LoRA NSFW sobre Qwen3-8B |
| Qwen3-8B (base) | 8,19 B | documentado en su repo oficial | Apache 2.0 (según repo oficial de Qwen) | safetensors, GGUF | Modelo generalista multilingüe con modo thinking |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Modelo generalista con tool calling |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Modelo generalista ligero |

La comparación directa con los generalistas no es del todo justa: Ziyon NSFW v3 es un ajuste temático, no un modelo de propósito general, y no publica métricas que permitan situarlo frente a ellos en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está etiquetado como `not-for-all-audiences`; no debe desplegarse en entornos accesibles a menores ni sin control de acceso.
- Licencia no declarada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: al ser un ajuste conversacional sin datos de evaluación publicados, no hay garantía sobre la fidelidad factual en dominios técnicos.
- Sesgos: el dataset del LoRA no está documentado, por lo que no puede evaluarse su sesgo temático ni su comportamiento en dominios sensibles.
- Contexto e idiomas no confirmados: aunque la base Qwen3-8B soporta contexto largo y varios idiomas, el ajuste puede haber degradado estas capacidades y el repositorio no lo verifica.
- Trazabilidad limitada: sin descargas ni valoraciones, sin benchmarks y con una model card mínima, el modelo no ofrece garantías de calidad para producción.
- Compatibilidad de tool calling no verificada: no se documenta que el ajuste conserve las capacidades de function calling de la base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liuw15/ziyon-nsfw-v3-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Adaptador LoRA referenciado: https://huggingface.co/liuw15/ziyon-lora-nsfw-v3 (no verificado en la información disponible)
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
