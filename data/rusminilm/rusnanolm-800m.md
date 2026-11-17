# RusMiniLM/RusNanoLM-800M

## Resumen

RusNanoLM-800M es un modelo de lenguaje bilingüe (ruso e inglés) de 800 millones de parámetros desarrollado por RusMiniLM, construido sobre una arquitectura híbrida Qwen3.5 con atención lineal basada en Gated Delta Rule. El modelo parte de una base Qwen3.5-0.8B y se afina mediante SFT para reforzar el razonamiento aritmético y matemático en ruso, un ámbito donde los modelos pequeños suelen fallar de forma sistemática.

Su relevancia radica en la eficiencia: con 852.985.920 parámetros reales (según safetensors) consigue superar en RuMultiAR a modelos entre 8 y 12 veces más grandes, como GigaChat-2-10B, Qwen2.5-7B o Meta-Llama-3-8B. La arquitectura híbrida reduce el coste de memoria del estado de atención a O(1), lo que permite ejecutarlo en GPUs de gama baja.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y GGUF F16, e incluye plantilla de chat ChatML integrada en el tokenizer. Está pensado para despliegues en entornos con recursos limitados que necesiten capacidades de razonamiento en ruso sin recurrir a modelos de decenas de miles de millones de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con atención lineal (Gated Delta Rule); 24 capas, cada cuarta capa es de atención completa |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 (precisión completa, sin pérdida); no se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (F16 y variante F16-ollama) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida derivada de Qwen3.5 en la que se combinan capas de atención lineal con Gated Delta Rule y capas de atención completa: de las 24 capas totales, cada cuarta es de atención completa. Este diseño reduce la complejidad de memoria del estado de atención a O(1), lo que se traduce en un consumo de VRAM muy contenido (aproximadamente 1,7 GB en BF16) y en la posibilidad de ejecutar el modelo en GPUs con solo 4 GB de memoria.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre la base Qwen3.5-0.8B, con el objetivo declarado de mejorar el razonamiento aritmético y matemático en ruso. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo se evalúa con plantilla de chat ChatML, decodificación greedy y métrica Pass@1 sobre la suite MERA.

## Capacidades

- Generación de texto conversacional en ruso e inglés con plantilla ChatML.
- Razonamiento aritmético y matemático, con mejoras sustanciales frente a la base en tareas de aritmética simple (SimpleAR) y aritmética multietapa (RuMultiAR).
- Razonamiento lógico-matemático (MathLogicQA) y tareas de comprensión matemática multietapa (MaMuRaMu).
- Comprensión lectora y razonamiento sobre texto en ruso (PARus, RWSD).
- Generación con restricciones estrictas de formato JSON (evaluado en un conjunto reducido de 12 tareas).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; las tareas RuMultiAR y MaMuRaMu implican razonamiento multietapa acotado.
- Capacidades de visión: la librería de carga es `AutoModelForImageTextToText` y el tag `image-text-to-text` aparece en Hugging Face, pero la model card no documenta ninguna capacidad multimodal; no disponible como capacidad confirmada.
- Modo thinking explícito: no disponible.

## Casos de uso

- Tutoría de matemáticas en ruso: el modelo resuelve problemas aritméticos y de lógica paso a paso; su 83,2% en SimpleAR y su 33,5% en RuMultiAR lo hacen adecuado para asistencia educativa en dispositivos con recursos limitados.
- Asistente conversacional en ruso para atención al cliente: con 0,85B de parámetros y ~1,7 GB en BF16, puede desplegarse en servidores modestos o en el borde para conversaciones multi-turno en ruso e inglés.
- Preprocesamiento y validación de datos estructurados: la evaluación en restricciones estrictas de JSON (58,3%, aunque sobre solo 12 tareas) sugiere utilidad para generar salidas con formato controlado en pipelines de datos.
- Razonamiento aritmético embebido en aplicaciones móviles o de escritorio: los GGUF F16 permiten ejecución local con llama.cpp u Ollama sin pérdida de precisión, útil para calculadoras inteligentes o asistentes offline.
- Filtrado y clasificación de contenido en ruso: las tareas PARus y RWSD evalúan comprensión textual; el modelo puede emplearse para detectar inconsistencias o responder preguntas sobre pasajes.
- Base para fine-tuning especializado: al ser Apache 2.0 y de tamaño reducido, sirve como punto de partida para ajustar tareas concretas en ruso sin necesidad de infraestructura de gran escala.
- Evaluación comparativa de arquitecturas lineales: investigadores pueden usar el modelo como referencia reproducible de atención híbrida en la suite MERA.

## Benchmarks y rendimiento

Resultados MERA (Pass@1, decodificación greedy, plantilla de chat), evaluados el 2026-11-17. La línea base es la sumisión oficial de Qwen3.5-0.8B a MERA (submit id 16125).

| Benchmark | Tareas | RusNanoLM-0.8B | Qwen3.5-0.8B (baseline) | Δ |
|---|---|---|---|---|
| SimpleAR | 1000 | 83,2% | 48,3% | +34,9 |
| RuMultiAR | 1039 | 33,5% | 8,1% | +25,4 (×4,1) |
| MathLogicQA | 680 | 38,2% | 33,9% | +4,4 |
| MaMuRaMu | 285 | 46,0% | 43,6% | +2,4 |
| PARus | 500 | 53,4% | 53,6% | -0,2 |
| RWSD | 810 | 49,9% | 52,7% | -2,8 |
| Strict Constraints JSON | 12 | 58,3% | no disponible | no disponible |

Comparativa en RuMultiAR frente a modelos de mayor tamaño:

| Modelo | Parámetros | RuMultiAR |
|---|---|---|
| RuadaptQwen-32B | 32B | 43,3% |
| RusNanoLM-0.8B | 0,8B | 33,5% |
| GigaChat-2-10B | 10B | 31,5% |
| Qwen2.5-7B | 7B | 30,8% |
| Meta-Llama-3-8B | 8B | 24,8% |
| Llama-3.2-1B-Instruct | 1B | 16,2% |
| Qwen3.5-0.8B (baseline) | 0,8B | 8,1% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,7 GB en BF16, según la model card; ejecutable en GPUs con 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); en GPUs de datacenter como A100 o H100 el modelo ocupa una fracción mínima de memoria.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), llama.cpp (build >= b12413 con el GGUF F16 estándar), Ollama (con el GGUF F16-ollama), LM Studio (con runtime llama.cpp actualizado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RuMultiAR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusNanoLM-800M | 0,85B | no disponible | 33,5% | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3.5-0.8B | 0,8B | no disponible | 8,1% | no disponible | Hugging Face |
| Llama-3.2-1B-Instruct | 1B | no disponible | 16,2% | no disponible | Hugging Face |
| Qwen2.5-7B | 7B | no disponible | 30,8% | no disponible | Hugging Face |
| GigaChat-2-10B | 10B | no disponible | 31,5% | no disponible | no disponible |

La comparación se limita a la métrica RuMultiAR, el único dato común disponible para todos los modelos en la información proporcionada. No se dispone de datos de contexto, licencia ni otros benchmarks para los modelos alternativos.

## Limitaciones y advertencias

- El modelo no mejora la comprensión general del texto ruso: PARus (-0,2%) y RWSD (-2,8%) quedan al nivel o ligeramente por debajo de la base Qwen3.5-0.8B.
- La evaluación en Strict Constraints JSON se basa en solo 12 tareas, una muestra demasiado pequeña para extraer conclusiones fiables.
- El modelo está especializado en ruso e inglés; no se documenta soporte para otros idiomas.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de 0,85B, cabe esperar una fiabilidad limitada en tareas de conocimiento factual abierto.
- La capacidad multimodal es ambigua: la librería de carga y los tags sugieren entrada de imagen y texto, pero la model card no la documenta ni la evalúa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla las condiciones del dataset de SFT ni posibles restricciones derivadas de los datos de entrenamiento.
- El autor de la model card cita el repositorio como `itismax0/RusNanoLM-800M`, mientras que el ID de Hugging Face es `RusMiniLM/RusNanoLM-800M`; conviene verificar cuál es la ruta canónica antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RusMiniLM/RusNanoLM-800M
- Ruta alternativa citada en la model card: https://huggingface.co/itismax0/RusNanoLM-800M
- Benchmark MERA: no disponible en la información proporcionada (solo se cita el submit id 16125 de Qwen3.5-0.8B)
- Paper: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
