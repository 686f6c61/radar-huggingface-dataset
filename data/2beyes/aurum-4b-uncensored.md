# 2Beyes/Aurum-4B-Uncensored

## Resumen

Aurum 4B Uncensored es un ajuste derivado de Qwen3.5-4B, publicado por el usuario 2Beyes, que elimina el comportamiento de rechazo (refusal) del modelo original conservando el resto de los pesos prácticamente intactos. Se trata de una edición de pesos (abliteration selectiva) que no incorpora entrenamiento adicional de conocimiento ni de seguridad: parte de Qwen/Qwen3.5-4B, incluye su torre de visión y su cabeza de predicción multi-token (MTP), y aplica únicamente la dirección de cambio responsable de suprimir los rechazos, extraída de otro modelo derivado (Heretic Abliterated).

El modelo está pensado para chat cotidiano y tool calling en tarjetas gráficas de 8 GB, con un total de 4.659.865.088 parámetros (~4,66 mil millones) en formato BF16 safetensors y un repositorio de 9,3 GB. Su pipeline es image-text-to-text, por lo que mantiene capacidad multimodal de entrada (imagen y vídeo) heredada del modelo base. La licencia es Apache 2.0, heredada de los modelos de origen.

Es relevante ahora porque demuestra una técnica de edición de pesos muy quirúrgica: en lugar de un fine-tuning completo, aplica descomposición en valores singulares sobre las matrices de salida de atención y de la FFN para retener solo la componente que elimina rechazos. El autor reporta 0 rechazos sobre 100 prompts dañinos y una mejora notable en tool calling (BFCL v3 no-live de 68,7 a 85,9) manteniendo el conocimiento (MMLU-Redux 2.0: 74,9 frente a 75,0 del modelo anterior). Solo se ha validado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`) con torre de visión y cabeza MTP |
| Parámetros totales | 4.659.865.088 (~4,66 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (safetensors); GGUF Q3_K_M a Q8_0, BF16 y proyector de visión (repo GGUF separado) |
| Idiomas soportados | en (inglés); solo probado en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (llama.cpp b12289) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5, con torre de visión y cabeza de predicción multi-token (MTP) heredadas sin cambios de Qwen/Qwen3.5-4B. No se ha realizado entrenamiento adicional: la modificación consiste en una edición de pesos basada en la diferencia entre Qwen3.5-4B y `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, de la que se conserva únicamente la componente que elimina rechazos. En concreto, se aplica descomposición en valores singulares sobre las matrices `self_attn.o_proj` / `linear_attn.out_proj` de las capas 4 a 31 (reteniendo las 8 direcciones singulares principales, ~98 % del cambio) y sobre `mlp.down_proj` (la dirección principal, solo en tensores donde representa más de la mitad del cambio). El resto de cambios del modelo de origen (su fine-tuning de destilación) no se incluye.

La configuración, el tokenizador y la plantilla de chat provienen del modelo Heretic citado (mismo tokenizador que Qwen3.5). El autor indica que esta variante (denominada internamente `c-v1u`) superó a otras dos candidatas en pruebas selladas: misma precisión en tool calling, más conocimiento y ningún rechazo. Los pesos son idénticos tensor a tensor al GGUF BF16 evaluado. Las cuantizaciones GGUF usan una importance matrix calculada sobre una mezcla Aurum hermana, con texto de calibración de prosa, código y chats de tool calling. El archivo `build_log.json` documenta cada tensor tocado y la fracción del cambio retenida.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" opcional (parámetro `enable_thinking` en la plantilla de chat, igual que Qwen3.5).
- Tool calling / function calling, con soporte de llamadas simples, múltiples y paralelas.
- Entrada multimodal de imagen y vídeo (torre de visión de Qwen sin modificar); el preprocesado se toma del procesador de Qwen3.5-4B.
- Predicción multi-token (MTP) para decodificación especulativa, heredada del modelo base.
- Capacidades multilingües: solo declaradas y probadas en inglés.
- Comportamiento sin rechazos ante peticiones dañinas (0 de 100 en la prueba del autor).

## Casos de uso

- Asistente de chat local en GPU de consumo: con ~4,66 B parámetros en Q4_K_M cabe en tarjetas de 8 GB y permite conversaciones multi-turno en local mediante llama.cpp u Ollama.
- Automatización de tool calling en pipelines de agentes: el BFCL v3 no-live de 85,9 (92,0 en simple, 92,5 en multiple, 82,0 en parallel y parallel-multiple) lo hace adecuado para orquestar APIs y funciones en flujos de varios pasos.
- Extracción de información de documentos con imágenes: al conservar la torre de visión, puede procesar capturas, formularios o diagramas y devolver texto estructurado.
- Prototipado de investigación sobre alineación y seguridad: sirve como caso de estudio de abliteration selectiva, con registro tensor a tensor de los cambios aplicados en `build_log.json`.
- Generación y revisión de código en entornos controlados: el modelo soporta instrucciones estrictas (IFEval strict 85,3) y puede integrarse en herramientas de desarrollo locales.
- Evaluación comparativa de técnicas de edición de pesos: útil para reproducir y contrastar metodologías de modificación de rechazos frente a fine-tunings completos.
- Despliegue en entornos de investigación cerrados donde el operador asume la responsabilidad del contenido generado y controla el acceso.

## Benchmarks y rendimiento

Resultados reportados por el autor, ambos modelos en Q4_K_M con llama.cpp, thinking desactivado, decodificación greedy y sin system prompt, con su propio runner.

| Benchmark | Modelo anterior (Qwen3.8-4B-Distill-Heretic-Abliterated) | Aurum 4B |
|---|---|---|
| IFEval, prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval, instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live, media (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance (no llamar herramienta si no encaja) | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330 preguntas) | 75,0 | 74,9 |
| GPQA Diamond (198, orden de respuestas aleatorizado con semilla fija) | 42,9 | 49,5 |

| Test de rechazos | Modelo anterior | Qwen3.5-4B oficial | Mezcla Aurum anterior | Aurum 4B |
|---|---|---|---|---|
| Rechazos sobre 100 prompts dañinos (mlabonne/harmful_behaviors) | 0 | 72 | 20 | 0 |
| Sobrerrechazo: rechazos sobre 30 prompts inocuos × 3 muestras | 1,1 % | no disponible | 0 % | 0 % |

Notas del autor: los números publicados por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables. GPQA usa un límite de 3.072 tokens de respuesta; 84 de las 198 respuestas de Aurum alcanzaron el límite y se contaron como incorrectas (6 en el modelo anterior), por lo que su puntuación con un límite mayor sería probablemente superior. Los rechazos se cuentan con frases marcadoras, por lo que son una estimación.

## Requisitos de hardware

- VRAM estimada: en BF16, aproximadamente 9,3 GB de pesos más overhead de activaciones y caché KV; en Q4_K_M, en torno a 3 GB de pesos, lo que deja margen para contexto en 8 GB.
- GPU recomendadas: A100 o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 o Q8_0 con holgura; RTX 4060 Ti / 3070 / 4070 (8-12 GB) para Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB con cuantizaciones Q3_K_M a Q4_K_M según el contexto; el autor lo diseña explícitamente para 8 GB.
- Opciones de despliegue: llama.cpp (GGUF, probado con build b12289), Ollama a partir de los GGUF, y `transformers` con `AutoModelForImageTextToText` (requiere versión con soporte de Qwen3.5). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (BFCL v3 non-live) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aurum 4B Uncensored | ~4,66 B | no disponible | 85,9 (media) | Apache 2.0 | safetensors + GGUF |
| Qwen3.5-4B (base oficial) | ~4,66 B (no confirmado en la información) | no disponible | no disponible (Qwen reporta BFCL v4 en BF16) | Apache 2.0 (según herencia) | safetensors |
| Qwen3.8-4B-Distill-Heretic-Abliterated | no disponible | no disponible | 68,7 (media) | no disponible | GGUF Q4_K_M |
| Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | no disponible | no disponible | no disponible | no disponible | safetensors |

## Limitaciones y advertencias

- Modelo sin censura: no rechaza peticiones dañinas (0 de 100 en la prueba del autor). No debe desplegarse donde usuarios que no hayan elegido un modelo sin censura puedan acceder a él.
- La edición de rechazos no añade conocimiento ni ninguna capa de seguridad; elimina únicamente el comportamiento de rechazo.
- Es un modelo de 4 B: comete errores factuales y puede invocar herramientas cuando ninguna encaja (BFCL irrelevance 80,8, inferior al 93,8 del modelo anterior). Conviene verificar los resultados de las herramientas antes de confiar en ellos.
- Verbosidad en preguntas de razonamiento difíciles con thinking desactivado; 84 de 198 respuestas de GPQA alcanzaron el límite de 3.072 tokens.
- Solo probado en inglés; no hay validación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de rechazos traslada al operador toda la responsabilidad legal y ética sobre el contenido generado.
- No se dispone de longitud de contexto ni de datos de latencia/throughput en la información proporcionada.
- El repositorio safetensors no incluye configuración de preprocesado de imágenes: para entrada multimodal hay que usar el procesador de Qwen/Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- GGUF: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente de la edición de rechazos: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo anterior comparado: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- Dataset de prompts dañinos: mlabonne/harmful_behaviors (referenciado en la model card, sin URL directa en la información)
