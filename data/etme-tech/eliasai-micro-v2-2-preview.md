# ETME-TECH/EliasAI-Micro-v2.2-preview

## Resumen
EliasAI-Micro-v2.2-preview es un modelo de lenguaje compacto de aproximadamente 0,8B parámetros (1.006.672.704 parámetros reales según safetensors) desarrollado por ETME-TECH, con autoría atribuida a Elias Rickert. Se trata de un ajuste fino mediante LoRA sobre `Qwen/Qwen3.5-0.8B-Base`, orientado específicamente al idioma alemán y a tareas de razonamiento conversacional. El modelo emplea un modo de "pensamiento" explícito en etiquetas `<think>...</think>` antes de emitir la respuesta final, un patrón habitual en modelos de razonamiento recientes.

El modelo resuelve el problema de disponer de un asistente conversacional en alemán de muy bajo coste computacional, capaz de ejecutarse en hardware de consumo y con un enfoque declarado de "Try-First": ofrece respuestas directas y estimaciones calibradas en lugar de rechazos innecesarios. Su tamaño reducido lo hace adecuado para despliegue local, prototipado rápido y aplicaciones con requisitos de latencia estrictos.

Es relevante ahora por su combinación de licencia Apache 2.0, disponibilidad en formatos GGUF cuantizados (Q8_0 y Q4_K_M) y safetensors BF16, y su integración con `llama.cpp`. No obstante, la información pública disponible es limitada: no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni detalles exhaustivos sobre el dataset de entrenamiento más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parámetros totales | 1.006.672.704 (~0,8B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la model card; el ejemplo de `llama.cpp` usa `-c 4096` |
| Tipos de cuantización | GGUF Q8_0, GGUF Q4_K_M, BF16 (safetensors) |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-0.8B-Base`, una arquitectura transformer de la familia Qwen3.5. Sobre esa base se aplicó un ajuste fino mediante LoRA nativo en BF16 con rango `r=32` y `alpha=64`, empleando Differential Loss Weighting y NEFTune. Además, se incorporó un "EOS-Head" calibrado de forma convexa para la gestión del token `<|im_end|>`. El resultado se fusionó (merged) en un modelo completo en safetensors BF16.

El dataset de entrenamiento (denominado V6) consta de 8.099 diálogos alemanes curados, de uno a cinco turnos, distribuidos en 12 categorías equilibradas: explicaciones de conceptos, textos y brainstorming, memoria a corto plazo, empatía y sarcasmo, opiniones y small talk, traducción/resumen/corrección, estimaciones calibradas y límites duros, anti-gaslighting y anti-prompt-injection, correcciones honestas, dilemas morales, identidad clara de ETME-TECH y minijuegos. No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO más allá del ajuste LoRA descrito. La innovación técnica destacable es el modo de razonamiento estructurado en `<think>...</think>` en alemán, con una extensión declarada de 3 a 6 frases.

## Capacidades
- Generación de texto conversacional en alemán con modo de razonamiento previo en `<think>...</think>`.
- Razonamiento breve y estructurado antes de responder.
- Manejo de conversaciones multi-turno (hasta 5 rondas en el dataset de entrenamiento).
- Memoria a corto plazo dentro de la conversación.
- Capacidades de traducción, resumen y corrección de texto.
- Estimaciones calibradas y reconocimiento explícito de límites duros (por ejemplo, hora en vivo, precios, dosis médicas).
- Resistencia declarada a gaslighting y a prompt injection (categorías específicas del dataset).
- Identidad de marca definida (ETME-TECH / Elias AI).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso
- Asistente conversacional local en alemán: el modelo puede gestionar diálogos multi-turno con un contexto de al menos 4.096 tokens (configuración de ejemplo en `llama.cpp`), adecuado para atención al usuario en escritorio o entornos sin conexión.
- Prototipado rápido de chatbots: su tamaño (~0,8B) y sus cuantizaciones Q4_K_M (641 MB) permiten iterar en portátiles y estaciones de trabajo sin GPU dedicada.
- Generación y corrección de textos en alemán: útil para resumir, reescribir o corregir borradores, aprovechando las categorías de traducción/resumen/corrección del entrenamiento.
- Aplicaciones educativas o de explicación de conceptos: el modo `<think>` facilita respuestas razonadas breves, apropiadas para asistentes de estudio.
- Filtrado y detección de prompt injection: su entrenamiento específico en anti-prompt-injection y anti-gaslighting lo hace candidato para capas de defensa en pipelines conversacionales.
- Asistente de escritorio offline con `llama.cpp`: el ejemplo de servidor local con `llama-server` permite desplegar una API compatible con endpoints en `http://localhost:8080` sin dependencias en la nube.
- Minijuegos y entretenimiento conversacional: las categorías de minijuegos y small talk permiten construir experiencias lúdicas de bajo coste.

## Benchmarks y rendimiento
La model card reporta un "Live-Benchmark" interno de 17/18, con TTR de 0,93 y Val-Loss de 1,7527. No se especifica la composición ni el protocolo de dicho benchmark, por lo que no es comparable con métricas estándar.

| Benchmark | Resultado | Notas |
|---|---|---|
| Live-Benchmark interno (autor) | 17/18 | Protocolo no detallado |
| TTR (autor) | 0,93 | Métrica no especificada en detalle |
| Val-Loss (autor) | 1,7527 | Sobre el conjunto de validación del autor |
| MMLU | No disponible | No publicado |
| HumanEval | No disponible | No publicado |
| GSM8K | No disponible | No publicado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,1 GB para Q8_0 (1031,9 MB de pesos) y unos 0,7 GB para Q4_K_M (641,2 MB), más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio; A100/H100 no son necesarias pero funcionan.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) e incluso en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-server`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, `llama-cpp-python`). El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI. vLLM y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles de forma medida. El tamaño reducido permite inferencia en tiempo real en CPU y muy baja latencia en GPU, pero no se aportan cifras concretas.
- Configuración de ejemplo del autor: `-c 4096 --temp 0.55 --top-p 0.90 --repeat-penalty 1.06`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| EliasAI-Micro-v2.2-preview | ~0,8B | No disponible (ejemplo 4096) | Alemán | Apache 2.0 | safetensors, GGUF | Ajuste LoRA sobre Qwen3.5-0.8B-Base, modo `<think>` |
| Qwen3.5-0.8B-Base | ~0,8B | No disponible | Multilingüe | No disponible | safetensors | Modelo base; sin ajuste conversacional específico |
| Modelos alemanes pequeños (p. ej. variantes de Llama/Gemma ajustadas a `de`) | 1B–3B | Variable | Alemán | Variable | safetensors, GGUF | Comparativa cualitativa; no se dispone de datos de benchmarks comparables |

No se dispone de datos de rendimiento comparables publicados para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación con el modelo base es estructural (mismo origen) pero no se han publicado métricas diferenciales.

## Limitaciones y advertencias
- Modelo de ~0,8B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en temas especializados.
- Entrenado exclusivamente en alemán: el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- El "Live-Benchmark" 17/18 es interno del autor, con protocolo no publicado; no debe interpretarse como rendimiento generalizable.
- La longitud de contexto no se declara explícitamente; el valor de 4.096 en el ejemplo es solo una configuración sugerida, no una especificación oficial.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5 y entrenarse con datos curados por el autor, pueden heredarse sesgos del modelo base y del dataset.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B-Base y de los datos de entrenamiento.
- El prompt de sistema recomendado impone una persona concreta ("Elias AI"); desviarse de él puede degradar el comportamiento esperado.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en producción.
- El modelo está marcado como "preview": puede haber cambios incompatibles en versiones posteriores.

## Enlaces
- Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro-v2.2-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- `llama.cpp` (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
