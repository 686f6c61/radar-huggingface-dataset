# mikecovlee/tinymixtral-1B

## Resumen

TinyMixtral 1B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el autor independiente mikecovlee dentro del proyecto TinyMixtral, una línea de investigación centrada en explorar arquitecturas dispersas a muy pequeña escala. Con aproximadamente 1,18 mil millones de parámetros totales y unos 352 millones activos por token (top-2 de 8 expertos enrutados), el modelo se entrenó desde cero sobre 8 mil millones de tokens en dos fases de preentrenamiento consecutivas, empleando una mezcla de FineWeb-Edu y Cosmopedia v2 en proporción 89:11.

El modelo es relevante no tanto por su rendimiento absoluto como por su valor como experimento reproducible: toda la familia se entrenó en una única GPU de consumo, y la model card documenta resultados negativos (el post-entrenamiento a baja tasa de aprendizaje redujo la pérdida pero no mejoró las métricas downstream) y ablaciones controladas (comparación entre 4B y 8B tokens de preentrenamiento, y entre variantes MoE y densas con parámetros activos equivalentes). Es, por tanto, un artefacto útil para investigadores que estudian el escalado de MoE en regímenes de cómputo muy limitado.

Se trata de un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, entrenado principalmente en inglés, con una ventana de contexto de 2.048 tokens y publicado bajo licencia MIT. Ha sido superado por la versión v3.0 de la familia (477,5M parámetros MoE), que el autor considera su modelo insignia actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts disperso (8 expertos enrutados, top-2), GQA, RMSNorm, RoPE, SwiGLU |
| Parametros totales | ~1,18B |
| Parametros activos | ~352M (top-2 de 8 expertos) |
| Longitud de contexto | 2.048 tokens (max position) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones publicadas; el repo contiene pesos en formato original) |
| Idiomas soportados | Inglés (etiqueta `language: en`); no se documenta soporte multilingüe |
| Licencia | MIT |
| Formato de pesos | PyTorch/safetensors (repo de 4,7 GB), requiere `trust_remote_code=True` por arquitectura personalizada `tinymixtral` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con `hidden_size` de 1024, atención con Grouped-Query Attention (16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 64), RoPE con theta de 1.000.000, normalización RMSNorm y vocabulario de 32.000 tokens. La capa MoE sustituye la FFN densa por 8 expertos enrutados con FFN SwiGLU de dimensión intermedia 2.816, activando los 2 mejores por token. El enrutamiento es aprendido y no se documenta ninguna técnica de balanceo de carga más allá de la configuración estándar de entrenamiento.

El entrenamiento se dividió en dos fases. La primera (preentrenamiento) usó la mezcla "SmolLM blend" de FineWeb-Edu y Cosmopedia v2 en proporción 89:11, con 4B tokens, tasa de aprendizaje 7e-4, batch de 16×1024 (16.384 tokens por paso), 244.141 pasos, 2.000 pasos de warmup y unas 102,5 horas de cómputo; la pérdida final de esta fase se estabilizó en torno a 1,9 y sufrió un pico hasta 3,4 en los últimos ~300 pasos al reiniciarse el flujo de datos sobre el inicio del corpus. La segunda fase (continuación) añadió 4B tokens no solapados con la misma mezcla, tasa 4,2e-4, 121.921 pasos (~32k tokens por paso), 60,4 horas y pérdida final de 1,80. No se documenta uso de RLHF, DPO ni ajuste por instrucciones en esta versión.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instructivo.
- Razonamiento de sentido común y comprensión lectora a nivel básico, medido en la suite de lm-evaluation-harness (HellaSwag, PIQA, WinoGrande, ARC, OpenBookQA, BoolQ, LAMBADA).
- Completado de texto y modelado de lenguaje de dominio general sobre corpus educativos (FineWeb-Edu) y sintéticos de estilo enciclopédico (Cosmopedia v2).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe no documentada; el autor indica que el modelo es "English-centric".
- No incluye alineamiento de seguridad ni filtros de contenido.

## Casos de uso

- Investigación sobre escalado de MoE en cómputo reducido: el modelo sirve como punto de comparación reproducible (8B tokens, una GPU de consumo) frente a variantes densas de parámetros activos equivalentes como tinymistral-276m, para estudiar la relación entre dispersión y calidad por token.
- Ablaciones de presupuesto de datos: la comparación documentada entre 4B y 8B tokens de preentrenamiento (mejora en todas las tareas, +2,3 pp de media, +7,2 pp en BoolQ) permite usar el modelo como referencia para estudiar curvas de escalado de datos a esta escala.
- Estudio de recetas de post-entrenamiento: el resultado negativo publicado (pérdida de 2,98 a 1,8 sin transferencia a métricas downstream) convierte al modelo en un caso de control útil para investigar por qué el ajuste a baja tasa no mejora tareas a pequeña escala.
- Prototipado de infraestructura de inferencia MoE: al requerir `trust_remote_code=True` y una arquitectura personalizada, es adecuado para validar integraciones con `transformers` y para probar el comportamiento de enrutamiento antes de migrar a modelos MoE mayores.
- Generación de texto de dominio general en inglés para tareas de completado y experimentación con prompts, siempre que no se requiera precisión factual ni seguimiento de instrucciones estricto.
- Educación y docencia: por su tamaño y su documentación detallada de hiperparámetros, es un ejemplo práctico para explicar el funcionamiento interno de un MoE (enrutamiento top-2, parámetros activos frente a totales) en cursos de aprendizaje automático.
- Benchmarking de harness: sirve como modelo de referencia de bajo coste para validar pipelines de `lm-evaluation-harness` antes de ejecutar evaluaciones sobre modelos mayores.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` v0.4.12, 0-shot, CUDA, bf16, según la model card.

| Tarea | Métrica | 1B MoE (4B tokens) | 1B MoE (8B tokens) |
|---|---|---|---|
| HellaSwag | acc_norm | 0,311 | 0,329 |
| PIQA | acc | 0,620 | 0,630 |
| WinoGrande | acc | 0,510 | 0,523 |
| ARC-Easy | acc | 0,463 | 0,479 |
| ARC-Challenge | acc_norm | 0,273 | 0,279 |
| OpenBookQA | acc_norm | 0,288 | 0,306 |
| BoolQ | acc | 0,548 | 0,620 |
| LAMBADA | acc | 0,200 | 0,234 |
| Media | — | 0,402 | 0,425 |

Evaluación few-shot (modelo de 8B tokens): HellaSwag 10-shot acc_norm 0,312; WinoGrande 5-shot acc 0,524; ARC-Easy 25-shot acc_norm 0,468; ARC-Challenge 25-shot acc_norm 0,262.

IFEval (instruction-level loose accuracy, con `--apply_chat_template`): 0,222 con 4B tokens; 0,234 tras post-entrenamiento (5B); 0,221 con la continuación a 8B. El autor señala que el seguimiento de instrucciones se mantiene plano en torno a 0,22.

Resultado del post-entrenamiento (receta v1.1: Wiki + Cosmopedia v2 50:50, 1B tokens, lr 2e-5, warmup 300, WSD, 60.975 pasos, ~26 h): la pérdida bajó de 2,98 a 1,8, pero las métricas downstream no cambiaron (HellaSwag 0,311 → 0,313; PIQA 0,620 → 0,623; BoolQ 0,548 → 0,528; LAMBADA 0,200 → 0,195).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, el repo de pesos ocupa 4,7 GB, lo que sugiere que en bf16/fp16 los pesos rondan esa cifra; la VRAM real dependerá de la cuantización y del runtime.
- GPU recomendadas: no disponible. El autor indica que el entrenamiento se realizó en una única GPU de consumo, sin especificar el modelo exacto.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del repo (4,7 GB) es plausible que quepa en GPUs de consumo con 8-12 GB de VRAM en bf16, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura personalizada (`tinymixtral`), la compatibilidad con estos runtimes no está garantizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparación publicada por el autor, misma suite y ajustes (lm-evaluation-harness v0.4.12, 0-shot, CUDA, bf16).

| Tarea | Métrica | 1B MoE (8B tokens) | SmolLM2-360M | Qwen3-0.6B |
|---|---|---|---|---|
| HellaSwag | acc_norm | 0,329 | 0,563 | 0,473 |
| PIQA | acc | 0,630 | 0,719 | 0,673 |
| WinoGrande | acc | 0,523 | 0,587 | 0,563 |
| ARC-Easy | acc | 0,479 | 0,705 | 0,609 |
| ARC-Challenge | acc_norm | 0,279 | 0,383 | 0,340 |
| OpenBookQA | acc_norm | 0,306 | 0,372 | 0,316 |
| BoolQ | acc | 0,620 | 0,620 | 0,643 |
| LAMBADA | acc | 0,234 | 0,532 | 0,401 |

| Modelo | Parámetros | Tokens de entrenamiento | Licencia |
|---|---|---|---|
| TinyMixtral 1B MoE | ~1,18B totales / ~352M activos | 8B | MIT |
| SmolLM2-360M | 360M densos | 4T | no disponible en la información proporcionada |
| Qwen3-0.6B | 0,6B densos | 36T | no disponible en la información proporcionada |

El propio autor atribuye la diferencia de rendimiento principalmente al presupuesto de datos (8B frente a 4T y 36T tokens), no a la arquitectura.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse directamente en producción orientada a usuarios finales sin un post-entrenamiento adicional.
- Riesgo elevado de alucinación y de contenido inapropiado, dado que no ha pasado por RLHF ni por filtros de seguridad.
- Rendimiento bajo en las métricas publicadas (media de 0,425 en la suite de 0-shot), muy por debajo de modelos densos pequeños mucho más entrenados; no es adecuado para tareas que requieran precisión factual o razonamiento complejo.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenamiento centrado en inglés; no se documenta soporte de castellano ni de otros idiomas.
- El seguimiento de instrucciones (IFEval ~0,22) no mejora con más tokens de preentrenamiento ni con la receta de post-entrenamiento aplicada, según los resultados del autor.
- La arquitectura personalizada requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo.
- La licencia MIT permite uso comercial, pero al no haber alineamiento de seguridad la responsabilidad sobre el contenido generado recae íntegramente en el integrador.
- El modelo ha sido superado por la versión v3.0 de la familia según el propio autor; para nuevos proyectos conviene evaluar esa variante antes que esta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikecovlee/tinymixtral-1B
- Versión referenciada en la model card: https://huggingface.co/mikecovlee/tinymixtral-v1.1-1b
- Modelo insignia v3.0 (477,5M MoE): https://huggingface.co/mikecovlee/tinymixtral
- Versión instruction-tuned v3.0: https://huggingface.co/mikecovlee/tinymixtral-it
- Ablación densa 276M: https://huggingface.co/mikecovlee/tinymistral-276m
- Ablación densa 276M instruction-tuned: https://huggingface.co/mikecovlee/tinymistral-276m-it
- Variante 0,5B (ablación de calidad de datos): https://huggingface.co/mikecovlee/tinymixtral-v1.1-0.5b
- Beta con expertos compartidos: https://huggingface.co/mikecovlee/tinymixtral-v2.0-beta
- Versión legacy (C4): https://huggingface.co/mikecovlee/tinymixtral-v1.0
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
