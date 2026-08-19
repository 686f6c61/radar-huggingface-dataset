# AaryanK/Qwen3.5-9B-GGUF

## Resumen

El repositorio `AaryanK/Qwen3.5-9B-GGUF` contiene una línea de cuantizaciones GGUF del modelo multimodal `Qwen/Qwen3.5-9B`, desarrollada de forma independiente por AaryanK. Se trata de ocho archivos con asignación de bits por tensor personalizada, calibrados con imatrix y evaluados frente a otras líneas GGUF publicadas del mismo modelo base. El modelo original tiene 8,95 mil millones de parámetros, 32 capas (24 Gated-DeltaNet y 8 de atención completa) y atención con GQA 4:1, lo que lo sitúa en la categoría de modelos pequeños pero capaces, con soporte de visión gracias a un proyector BF16 incluido.

La relevancia de esta línea radica en que ofrece cuantizaciones que, según las métricas reportadas, superan en divergencia KL a las alternativas más descargadas (Unsloth, bartowski, etc.) a igualdad de tamaño, manteniendo una calidad cercana al modelo BF16 de referencia. Esto permite ejecutar el modelo en hardware de consumo con una pérdida de precisión mínima, lo que resulta atractivo para desarrolladores que necesitan desplegar un modelo multimodal localmente con restricciones de VRAM.

El repositorio incluye instrucciones de uso con `llama-server`, requisitos de versión de llama.cpp (soporte `qwen35`) y advertencias sobre la activación del modo de razonamiento, que viene desactivado por defecto. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque el modelo base puede tener condiciones adicionales no detalladas en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated-DeltaNet + 8 capas de atención completa, GQA 4:1 |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (según se menciona en la evaluación) |
| Tipos de cuantizacion | AK-Q8_X, AK-Q6_K, AK-Q5_K_XL, AK-Q4_K_XL, AK-Q4_K_M, AK-Q3_K_XL, AK-IQ3_XL, AK-IQ2_M (más `mmproj` BF16 para visión) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos `.gguf`), con proyector de visión en BF16 |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-9B` emplea una arquitectura híbrida que combina capas Gated-DeltaNet (una variante de atención lineal con compuertas) y capas de atención completa, con GQA 4:1 para reducir el coste de memoria. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El modelo es multimodal, acepta entradas de imagen y texto, y genera texto.

No se proporcionan detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La línea GGUF de AaryanK se centra en la cuantización: cada archivo utiliza una asignación de bits por tensor derivada específicamente para su punto de tamaño, calibrada con imatrix. El autor reporta haber evaluado cada cuantización contra el modelo BF16 de referencia y contra otras líneas GGUF publicadas, utilizando métricas como divergencia KL, top-1 y ratio de perplejidad.

## Capacidades

- Generación de texto conversacional y multimodal (imagen + texto).
- Razonamiento (modo *thinking*) disponible, pero desactivado por defecto; se activa con `--reasoning on` o `--chat-template-kwargs '{"enable_thinking":true}'` en versiones antiguas.
- Soporte de visión mediante el proyector `mmproj` BF16 incluido, que debe cargarse junto al modelo.
- Compatible con `llama.cpp` (incluido `llama-server`) y con LM Studio (versión ≥ 0.4.6, runtime ≥ v2.5.1). No compatible con Ollama en la fecha de publicación.
- Capacidad de procesamiento de contexto largo (32k tokens) según las evaluaciones reportadas.
- No se menciona explícitamente soporte de *tool calling* o *function calling* en la información proporcionada.

## Casos de uso

- **Asistentes conversacionales locales**: el modelo puede desplegarse en una máquina con GPU de consumo (p. ej., RTX 4090) usando `llama-server`, ofreciendo respuestas fluidas con baja latencia (entre 91 y 182 tokens/s según la cuantización).
- **Aplicaciones de visión por computadora**: gracias al proyector de visión, puede procesar imágenes y responder preguntas sobre su contenido, útil para sistemas de descripción automática o análisis de documentos visuales.
- **Generación de código asistida**: con los parámetros de sampling recomendados para tareas de programación (temperatura 0.6, top_p 0.95), el modelo puede ayudar en la escritura y revisión de código, aunque no se reportan benchmarks específicos de HumanEval en esta línea.
- **Razonamiento y resolución de problemas**: activando el modo *thinking*, el modelo puede abordar tareas que requieren razonamiento multi-paso, como problemas matemáticos o lógicos, en entornos donde no se requiere baja latencia.
- **Despliegue en entornos con VRAM limitada**: las cuantizaciones más pequeñas (AK-IQ2_M, 3,65 GB) permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM, habilitando prototipos y aplicaciones en hardware modesto.
- **Investigación y evaluación de cuantización**: los archivos y las métricas detalladas (KLD, top-1, PPL) sirven como referencia para estudiar el impacto de la cuantización en modelos multimodales, y para comparar metodologías de asignación de bits.

## Benchmarks y rendimiento

La model card incluye una tabla con métricas de calidad y velocidad para cada archivo de la línea AK, medidas en una RTX 4090. No se reportan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K; las métricas principales son divergencia KL (KLD) frente al modelo BF16, precisión top-1 y tokens por segundo.

| Archivo | Tamaño | bpw | KLD medio ↓ | Top-1 ↑ | tg128 t/s (RTX 4090) |
|---|---|---|---|---|---|
| AK-Q8_X | 9,50 GB | 8,477 | 0,002265 | 98,46 % | 91 |
| AK-Q6_K | 7,46 GB | 6,651 | 0,004698 | 97,48 % | 115 |
| AK-Q5_K_XL | 6,69 GB | 5,966 | 0,007348 | 96,54 % | 122 |
| AK-Q4_K_XL | 5,94 GB | 5,297 | 0,014039 | 95,25 % | 137 |
| AK-Q4_K_M | 5,67 GB | 5,053 | 0,016320 | 94,58 % | 142 |
| AK-Q3_K_XL | 5,04 GB | 4,491 | 0,025784 | 92,96 % | 156 |
| AK-IQ3_XL | 4,00 GB | 3,561 | 0,083294 | 87,45 % | 173 |
| AK-IQ2_M | 3,65 GB | 3,245 | 0,121372 | 84,94 % | 182 |

El autor reporta que, en comparaciones pareadas contra otras líneas GGUF (Unsloth, bartowski, lmstudio-community, mradermacher, byteshape, AtomicChat), la línea AK obtuvo 31 victorias, 3 empates estadísticos y 0 derrotas en 34 comparaciones, con mejoras de KLD de hasta el 59 % frente a rivales del mismo tamaño. No se proporcionan resultados de benchmarks de tareas específicas (MMLU, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: según el archivo GGUF elegido, se necesita aproximadamente el tamaño del archivo más el proyector de visión (0,92 GB) y overhead de contexto. Para AK-Q4_K_XL (5,94 GB) se requieren al menos 8 GB de VRAM; para AK-IQ2_M (3,65 GB) bastan 6 GB.
- **GPU recomendada**: el autor utilizó una RTX 4090 para las mediciones; cualquier GPU con soporte CUDA y suficiente VRAM (p. ej., RTX 3060 12 GB, RTX 4070, A100) es adecuada. También puede ejecutarse en CPU con llama.cpp, aunque con menor rendimiento.
- **Compatibilidad**: requiere una versión de llama.cpp con soporte para la arquitectura `qwen35` (LM Studio ≥ 0.4.6, runtime ≥ v2.5.1). Ollama no soporta esta arquitectura en la fecha de publicación.
- **Opciones de despliegue**: `llama-server` (recomendado), `llama-cli`, o integración con LM Studio. No se mencionan otros servidores como vLLM o TGI.
- **Latencia y throughput**: en RTX 4090, entre 91 y 182 tokens/s según la cuantización (medidos con `tg128`). Para uso interactivo, las cuantizaciones más pequeñas ofrecen mayor velocidad.

## Comparativa con modelos similares

La comparativa más relevante es contra otras líneas GGUF del mismo modelo base. Según los datos de la model card, la línea AK supera en KLD a las alternativas más populares a igualdad de tamaño. A continuación se muestran algunas comparaciones extraídas de la tabla completa:

| Línea | Archivo | Tamaño (bytes) | KLD medio | Top-1 |
|---|---|---|---|---|
| AaryanK | AK-IQ2_M | 3 646 645 440 | 0,121372 | 84,94 % |
| Unsloth | UD-IQ2_M | 3 649 365 216 | 0,187737 | 81,06 % |
| mradermacher | i1-IQ2_M | 3 412 436 480 | 0,236371 | 78,32 % |
| AaryanK | AK-IQ3_XL | 4 000 638 144 | 0,083294 | 87,45 % |
| Unsloth | UD-IQ3_XXS | 4 016 235 744 | 0,111337 | 85,53 % |
| byteshape | IQ4_XS-3.60bpw | 4 043 231 072 | 0,114348 | 83,22 % |

No se dispone de comparaciones con otros modelos de tamaño similar (p. ej., Llama 3.2 8B, Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- El modo de razonamiento (*thinking*) está desactivado por defecto; si no se activa explícitamente, el modelo puede no mostrar su capacidad de razonamiento multi-paso.
- La arquitectura `qwen35` no es compatible con Ollama, lo que limita las opciones de despliegue para usuarios de esa plataforma.
- Se requiere una versión específica de llama.cpp; versiones antiguas pueden no reconocer el modelo o producir errores.
- El proyector de visión debe cargarse junto al modelo; sin él, las capacidades multimodales no están disponibles.
- No se han evaluado sesgos o riesgos de alucinación en esta línea de cuantizaciones; se asume que hereda las características del modelo base, que no se detallan en la información proporcionada.
- La licencia Apache-2.0 del repositorio no garantiza que el modelo base no tenga restricciones adicionales; se recomienda verificar la licencia del modelo original `Qwen/Qwen3.5-9B`.
- Las métricas reportadas (KLD, top-1) son específicas de la evaluación del autor y pueden no reflejar el rendimiento en tareas reales; no se proporcionan resultados de benchmarks estándar.

## Enlaces

- Repositorio HuggingFace: [AaryanK/Qwen3.5-9B-GGUF](https://huggingface.co/AaryanK/Qwen3.5-9B-GGUF)
- Modelo base: [Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- Perfil de LinkedIn del autor: [linkedin.com/in/theaaryankapoor](https://www.linkedin.com/in/theaaryankapoor/)
