# ETME-TECH/EliasAI-Micro-v2.2-preview

## Resumen

EliasAI-Micro-v2.2-preview es un modelo de lenguaje compacto de tipo chat y razonamiento, especializado en alemán, desarrollado por ETME TECH (con autoría de Elias Rickert) sobre el modelo base Qwen/Qwen3.5-0.8B-Base. Con aproximadamente 1.006 millones de parámetros (1,0 B) y una arquitectura transformer derivada de la familia Qwen3.5, el modelo se ha ajustado mediante LoRA para producir respuestas conversacionales en alemán con un modo de razonamiento previo explícito delimitado por etiquetas `<think>...</think>`.

El modelo resuelve el problema de disponer de un asistente conversacional en alemán que quepa en hardware muy modesto (desde una Raspberry Pi 5 hasta una GPU de escritorio), manteniendo un comportamiento honesto y calibrado ante la incertidumbre (principio "Try-First"). Su relevancia radica en que combina un tamaño muy reducido con cuantizaciones GGUF listas para usar, lo que permite despliegue local sin infraestructura de servidor.

La versión publicada se distribuye bajo licencia Apache 2.0, con pesos en safetensors (BF16) y tres variantes GGUF (Q8_0, Q4_K_M y Q4_0 para ARM). El repositorio ocupa 3,8 GB e incluye el modelo fusionado completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 1.006.672.704 (~1,0 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, GGUF Q4_K_M, GGUF Q4_0 (ARM) |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer de la familia Qwen3.5, y se ajusta mediante LoRA nativo en BF16 con rango `r=32` y `alpha=64`. El entrenamiento emplea Differential Loss Weighting y NEFTune, junto con una cabeza EOS (`<|im_end|>`) calibrada de forma convexa. El ajuste se realiza sobre un dataset propio denominado V6, compuesto por 8.099 diálogos en alemán curados manualmente, con turnos simples y multiturno de hasta 5 rondas, distribuidos en 12 categorías equilibradas (explicaciones de conceptos, textos y brainstorming, memoria a corto plazo, empatía y sarcasmo, opiniones y small talk, traducción/resumen/corrección, conjeturas calibradas y límites duros, anti-gaslighting y anti-prompt-injection, correcciones honestas, dilemas morales, identidad ETME-TECH y minijuegos).

La innovación destacable es el modo de razonamiento previo en alemán: el modelo genera entre 3 y 6 frases dentro de `<think>...</think>` antes de emitir la respuesta final, lo que estructura el razonamiento sin aumentar el tamaño del modelo. El autor reporta un benchmark final en vivo de 17/18, con TTR de 0,93 y validation loss de 1,7527. No se especifican el número total de tokens de entrenamiento ni la composición completa del corpus más allá de las categorías descritas.

## Capacidades

- Generación de texto conversacional en alemán con tono cercano y directo.
- Razonamiento estructurado previo mediante bloque `<think>...</think>` en alemán.
- Memoria conversacional multiturno (hasta 5 rondas en el dataset de entrenamiento).
- Explicación de conceptos, redacción de textos y brainstorming.
- Traducción, resumen y corrección de textos.
- Empatía, manejo de sarcasmo y small talk.
- Conjeturas calibradas ante incertidumbre (principio "Try-First") con reconocimiento explícito de límites.
- Resistencia a prompt injection y anti-gaslighting (entrenado explícitamente para ello).
- Manejo de dilemas morales y correcciones honestas.
- Identidad de marca ETME-TECH / Elias AI.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Asistente conversacional local en alemán: el modelo puede gestionar diálogos multiturno con contexto de hasta 4.096 tokens (configuración de ejemplo) en un servidor llama.cpp, adecuado para prototipos y demos sin conexión.
- Despliegue en Raspberry Pi 5 o dispositivos ARM: la variante Q4_0 (614,6 MB) está optimizada para CPU ARM, lo que permite ejecutar un chat en hardware de bajo consumo.
- Chat de escritorio con GPU modesta: la variante Q4_K_M (641,2 MB) ofrece un equilibrio entre velocidad y calidad para estaciones de trabajo con poca VRAM.
- Generación de textos y brainstorming en alemán: útil para redactar borradores, ideas y resúmenes en entornos donde no se quiere enviar datos a la nube.
- Filtro de corrección y resumen de textos: el modelo está entrenado para traducir, resumir y corregir, por lo que puede integrarse en pipelines de preprocesamiento de documentación en alemán.
- Evaluación de robustez frente a prompt injection: al estar entrenado explícitamente en anti-prompt-injection y anti-gaslighting, sirve como base para pruebas de seguridad conversacional en alemán.
- Asistente educativo con razonamiento visible: el bloque `<think>` permite mostrar al usuario el razonamiento intermedio, útil en herramientas de aprendizaje o depuración de respuestas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Benchmark final en vivo (autor) | 17/18 |
| TTR | 0,93 |
| Validation loss | 1,7527 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores proceden exclusivamente de la model card del autor y no son comparables con métricas de referencia públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en BF16 (safetensors de 1.920,1 MB); en torno a 1 GB con Q8_0 (1.031,9 MB); unos 0,7 GB con Q4_K_M (641,2 MB) y Q4_0 (614,6 MB).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para BF16; para cuantizaciones Q4 basta con GPUs de gama baja o iGPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (llama-server), con parámetros de ejemplo `--temp 0.55 --top-p 0.90 --repeat-penalty 1.06 -c 4096`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. No se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EliasAI-Micro-v2.2-preview | ~1,0 B | No disponible | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-0.8B-Base (modelo base) | ~0,8 B | No disponible | No disponible | Hugging Face |
| Alternativas de ~1 B en alemán | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en alemán; no se garantiza un rendimiento correcto en otros idiomas.
- Tamaño muy reducido (~1 B), lo que limita la profundidad de razonamiento y el conocimiento factual frente a modelos mayores.
- Riesgo de alucinación en hechos, matemáticas y código; el propio system prompt recomienda reconocer la incertidumbre y sugerir verificar.
- No se documenta soporte de tool calling, agentes, visión ni audio.
- El contexto máximo no está especificado; el ejemplo de despliegue usa 4.096 tokens, por lo que no debe asumirse una ventana mayor.
- La model card del repositorio menciona internamente "EliasAI-Micro-v4" mientras que el ID del modelo es "v2.2-preview", lo que puede indicar inconsistencias de versionado.
- El benchmark reportado (17/18) es un test en vivo del autor, no una métrica estándar reproducible; no debe compararse con MMLU o HumanEval.
- Licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- El modelo declara no ser un profesional médico ni un experto omnisciente; no debe usarse para dosificación médica ni decisiones críticas.

## Enlaces

- Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro-v2.2-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- llama.cpp (referenciado en la model card): no disponible como enlace en la información proporcionada.
