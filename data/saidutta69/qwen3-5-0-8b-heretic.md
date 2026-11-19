# saidutta69/Qwen3.5-0.8B-heretic

## Resumen

Qwen3.5-0.8B-heretic es una variante "decensored" del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario saidutta69 (bajo la etiqueta RACER IS OP). Se ha generado con la herramienta Heretic v1.4.0, que aplica "abliteration" (ablation direccional) sobre los pesos del modelo base para suprimir el comportamiento de rechazo (refusal) sin recurrir a fine-tuning. El resultado es el mismo modelo con la dirección de rechazo eliminada, conservando en gran medida el conocimiento y la capacidad de seguir instrucciones del original.

El modelo base es un transformer híbrido de atención lineal de Qwen, con aproximadamente 853 millones de parámetros (852.985.920 según los safetensors del repo). Su interés principal es práctico: al ser un modelo de menos de mil millones de parámetros, puede ejecutarse en CPU, dispositivos de borde y GPUs de consumo, con una velocidad alta y una gestión de contexto largo notable para su tamaño.

La relevancia de esta variante no radica en una mejora de capacidades (no la hay), sino en la eliminación de las barreras de rechazo del modelo base. Según la model card, el índice de rechazos en un conjunto de 100 prompts adversariales cae de 98/100 en el base a 3/100 en esta versión, con una divergencia KL de 0.0449 respecto al original. Está pensado para desarrolladores que necesitan un modelo pequeño y rápido sin filtros de seguridad integrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Qwen3.5) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en precisión nativa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 de tipo híbrido con atención lineal, descrita en la model card como "tiny, fast Qwen3.5 model" con un "hybrid linear-attention core" que permite ejecución en CPU y dispositivos de borde. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas ni la composición exacta del mecanismo híbrido.

El entrenamiento original corresponde al modelo base Qwen/Qwen3.5-0.8B (no detallado en la información proporcionada). Sobre ese checkpoint, el autor aplicó Heretic v1.4.0 con ablation direccional: se identifican y editan las direcciones de pesos responsables del rechazo en las proyecciones de salida de atención y en las down-projections del MLP, en lugar de reentrenar. La reproducción corresponde al ensayo 109 de 200, con semilla RNG 739024598, y los activos de reproducción están en el directorio `reproduce/` del repositorio. La divergencia KL respecto al base es de 0.0449, lo que indica una alteración acotada del comportamiento.

## Capacidades

- Generación de texto conversacional en inglés, con el mismo nivel de conocimiento que el modelo base Qwen3.5-0.8B.
- Supresión del comportamiento de rechazo: responde a peticiones que el base declinaría, incluidas algunas que no debería aceptar.
- Razonamiento e instrucciones generales heredados del base (no se documentan capacidades específicas adicionales).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con text-generation-inference, vLLM, SGLang, llama.cpp, Ollama, LM Studio y Jan.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: permite comparar el comportamiento del base frente a la variante abliterada con una divergencia KL medida (0.0449) y un harness de rechazo reproducible, útil para estudiar los efectos de la edición direccional de pesos.
- Generación de texto en dispositivos de borde: con cuantizaciones Q4_K_M de 505 MB, el modelo cabe en RAM de sistema y se ejecuta en CPU o Apple Silicon, lo que lo hace apto para asistentes locales sin GPU.
- Prototipado rápido en GPUs de consumo: la escalera GGUF permite desplegarlo en tarjetas de 6 GB (Q5_K_M, 551 MB) hasta 12 GB (Q8_0, 774 MB), con margen amplio para contexto adicional (~1 GB según la model card).
- Aplicaciones creativas y de escritura sin restricciones de contenido: el modelo acepta consignas que el base rechazaría, lo que puede interesar en ficción, role-play o generación de contenido para adultos bajo responsabilidad del operador.
- Evaluación de pipelines de inferencia: al ser un modelo de ~0,85B con GGUF nativo, sirve como banco de pruebas ligero para medir latencia y throughput en llama.cpp, vLLM o TGI antes de escalar a modelos mayores.
- Docencia y demostraciones de abliteration: el repositorio incluye activos de reproducción (`reproduce/`) y parámetros exactos (Heretic 1.4.0, ensayo 109/200, semilla 739024598), lo que facilita explicar el mecanismo con un caso verificable.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.5-0.8B (base) |
|---|---|---|
| Rechazos (sobre 100 prompts adversariales) | 3 | 98 |
| Divergencia KL respecto al base | 0.0449 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M (505 MB de pesos) más ~1 GB adicional para contexto, según la model card.
- GPU recomendadas por cuantización según el autor: RTX 3060/4070/5070 (12 GB) con Q8_0 (774 MB); RTX 4060/3070 (8 GB) con Q6_K (601 MB); GTX 1660 Super/2060/3050 laptop (6 GB) con Q5_K_M (551 MB).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más; también en CPU-only y Apple Silicon con Q4_K_M (505 MB).
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen3.5-0.8B-heretic:Q4_K_M`), Ollama, LM Studio, Jan, vLLM, SGLang, text-generation-inference y transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic | ~0,85B | no disponible | 3 | apache-2.0 | HF, GGUF (15 cuants) |
| Qwen/Qwen3.5-0.8B (base) | ~0,85B | no disponible | 98 | apache-2.0 | HF |
| saidutta69/Qwen3.5-2B-heretic | no disponible | no disponible | no disponible | no disponible | HF |
| saidutta69/Qwen3.5-4B-heretic | no disponible | no disponible | no disponible | no disponible | HF |

Los dos modelos de la colección del mismo autor (2B y 4B) se citan en la model card como hermanos de la misma familia heretic; no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- La supresión de rechazos es deliberada y funciona: el modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtro de seguridad añadido por encima.
- La responsabilidad del despliegue recae íntegramente en el operador, según advierte el propio autor.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de ~0,85B, la fiabilidad factual es limitada por su tamaño.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Longitud de contexto: no documentada; la model card solo menciona "long-context handling" sin cifra concreta.
- Licencia apache-2.0 heredada del base, que permite uso comercial, pero la ausencia de filtros de seguridad puede generar obligaciones adicionales según la jurisdicción y el caso de uso.
- El modelo no es una mejora de capacidades respecto al base: es el mismo modelo con la dirección de rechazo eliminada; la divergencia KL de 0.0449 implica una alteración acotada pero no nula del comportamiento.
- La model card incluye una imagen alojada en un dominio externo (`photu.kashyalabanavli.site`) y contenido promocional; conviene tratarla con cautela como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-0.8B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Colección de modelos heretic del autor: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
- Modelo hermano Qwen3.5-2B-heretic: https://huggingface.co/saidutta69/Qwen3.5-2B-heretic
- Modelo hermano Qwen3.5-4B-heretic: https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
