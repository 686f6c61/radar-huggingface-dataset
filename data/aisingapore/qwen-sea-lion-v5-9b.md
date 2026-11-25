# aisingapore/Qwen-SEA-LION-v5-9B

## Resumen

Qwen-SEA-LION-v5-9B es un modelo multimodal (texto, imagen y vídeo como entrada; texto como salida) desarrollado por el AI Products Pillar de AI Singapore, con financiación de la National Research Foundation de Singapur. Es un ajuste fino supervisado de Qwen/Qwen3.5-9B orientado a lenguas del sudeste asiático (SEA), y forma parte de la colección SEA-LION v5, cuyo objetivo es cubrir idiomas infrarepresentados en los modelos generalistas.

El modelo hereda del base la arquitectura híbrida de Qwen3.5 (Gated DeltaNet combinada con atención con compuertas), el codificador visual, el tokenizador y la cabeza de predicción multi-token (MTP), sin cambios estructurales. Cuenta con 9.653.104.368 parámetros totales y una ventana de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1 millón mediante YaRN. El modo de razonamiento (thinking) está activado por defecto.

Su relevancia radica en combinar una base multimodal moderna con cobertura específica de birmano, chino, inglés, indonesio, filipino, malayo, tamil, tailandés y vietnamita, bajo licencia MIT, lo que permite uso comercial sin restricciones. Además, el ecosistema incluye variantes cuantizadas (FP8, INT4, GGUF) y un modelo borrador para decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal con codificador visual; híbrido de Gated DeltaNet y atención con compuertas (heredado de Qwen3.5) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a ~1M con YaRN |
| Tipos de cuantización | FP8, INT4 y GGUF publicados por el autor; además bfloat16/float16 en los pesos originales |
| Idiomas soportados | birmano (my), chino (zh), inglés (en), indonesio (id), filipino (fil), malayo (ms), tamil (ta), tailandés (th), vietnamita (vi); la base Qwen3.5 cubre 201 lenguas |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El modelo mantiene intacta la arquitectura de Qwen3.5-9B: un transformer causal con codificador visual y fusión temprana sobre tokens multimodales, que combina capas de Gated DeltaNet (atención lineal) con capas de atención con compuertas para lograr alto rendimiento de inferencia con baja latencia. Incorpora predicción multi-token (MTP) nativa, lo que habilita decodificación especulativa mediante un modelo borrador dedicado (Qwen-SEA-LION-v5-9B-SpecDecoder). El entrenamiento del base incluyó escalado de aprendizaje por refuerzo en entornos multiagente, según la model card.

El ajuste fino se realizó sobre el dataset propietario aisingapore/SEA-Instruct-2602, en inglés y lenguas del sudeste asiático. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales sobre el base; esos datos figuran como no disponibles. La plantilla de chat es la de Qwen3.8-27B sin "reasoning effort", de modo que el pensamiento y el pensamiento preservado quedan activados por defecto (`preserve_thinking=False` para limitar el razonamiento al último mensaje del usuario).

## Capacidades

- Generación de texto y razonamiento paso a paso en modo thinking activado por defecto.
- Comprensión de imágenes y vídeo como entrada, con salida textual (pipeline image-text-to-text).
- Razonamiento, código, matemáticas y comprensión visual, según las capacidades heredadas del base Qwen3.5.
- Tool calling / function calling robusto, compatible con Qwen-Agent y Qwen Code.
- Uso agéntico y razonamiento multi-paso en entornos reales.
- Capacidades multilingües nativas en nueve idiomas, con especial foco en lenguas del sudeste asiático y comprensión cultural y regional.
- Decodificación especulativa mediante modelo borrador para acelerar la generación.
- Contexto largo de 262.144 tokens, ampliable a ~1M con YaRN.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: gestión de conversaciones multi-turno en indonesio, malayo, tailandés o vietnamita con contexto largo, adecuado para historiales extensos de tickets y consultas recurrentes.
- Procesamiento de documentación aduanera y logística: extracción y explicación de requisitos de exportación a partir de imágenes de documentos y texto, como en el ejemplo de la model card sobre envío de durian congelado desde Medan a Singapur.
- Análisis de imágenes y vídeo en inspección de calidad: el codificador visual permite describir y clasificar contenido visual en flujos industriales o de vigilancia, con salida textual estructurada.
- Asistentes agénticos con tool calling: integración en pipelines que requieren llamadas a APIs externas, consulta de bases de datos o ejecución de acciones multi-paso, gracias al soporte de function calling y Qwen-Agent.
- Generación y revisión de código: uso en herramientas de desarrollo con razonamiento previo y modo thinking, útil para depuración y explicación de fragmentos en inglés o chino.
- Traducción y localización entre lenguas SEA e inglés: adaptación de contenidos para mercados de Indonesia, Filipinas, Malasia, Tailandia, Vietnam, Myanmar y comunidades tamil.
- Despliegue en entornos con recursos limitados: las variantes INT4 y GGUF permiten ejecución en hardware de consumo para prototipos y aplicaciones de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB en bfloat16/float16 (pesos de ~19,3 GB en el repositorio); ~10 GB en FP8; ~5-6 GB en INT4.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en producción en precisión completa o FP8; RTX 4090 (24 GB) para bfloat16 ajustado o FP8.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización FP8/INT4; en GPUs de 8-12 GB mediante GGUF cuantizado (Q4/Q5) con llama.cpp u Ollama.
- Opciones de despliegue: transformers, vLLM (con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`), SGLang, llama.cpp y Ollama (variante GGUF).
- Latencia y throughput: no disponibles de forma numérica; la arquitectura híbrida y la decodificación especulativa con SpecDecoder están diseñadas para reducir latencia y aumentar throughput, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v5-9B | 9,65 B | 262.144 (hasta ~1M con YaRN) | Sí (texto, imagen, vídeo) | MIT | Hugging Face, variantes FP8/INT4/GGUF |
| Qwen/Qwen3.5-9B (base) | 9 B | 262.144 | Sí | no disponible en la información | Hugging Face |
| Modelos SEA-LION anteriores | no disponible | no disponible | no disponible | no disponible | Colección SEA-LION en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios especializados y en lenguas de bajos recursos.
- Sesgos potenciales derivados de los datos de entrenamiento del base y del dataset SEA-Instruct-2602; no se documentan evaluaciones de sesgo en la información disponible.
- Cobertura idiomática limitada a los nueve idiomas declarados para el ajuste fino; el rendimiento en otras lenguas depende del base.
- El modo thinking está activado por defecto y puede generar miles de tokens de razonamiento, lo que incrementa latencia y coste si no se ajusta `max_new_tokens` o se desactiva.
- La extensión de contexto a ~1M mediante YaRN puede degradar la calidad y aumentar el consumo de memoria; no se documentan métricas de rendimiento en esa configuración.
- No se detallan los datos de entrenamiento (tokens, composición, etapas de alineación), lo que dificulta la auditoría del ajuste fino.
- Licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B por si difieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Base preentrenada: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Plantilla de chat de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante FP8: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-FP8
- Variante INT4: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-INT4
- Variante GGUF: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-GGUF
- Modelo borrador para decodificación especulativa: https://huggingface.co/aisingapore/Qwen-SEA-LION-v5-9B-SpecDecoder
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Dataset de ajuste: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Sitio oficial SEA-LION: https://sea-lion.ai
- Licencia MIT: https://mit-license.org/
