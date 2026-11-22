# llmfan46/gemma-4-31B-it-uncensored-heretic

## Resumen
Este modelo es una versión "decensored" (abliterated) de google/gemma-4-31B-it, publicada por el contribuidor independiente llmfan46. Se ha generado aplicando la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre el modelo base de Google, con el objetivo de reducir drásticamente la tasa de rechazos (refusals) manteniendo la calidad general del modelo original. El resultado declarado es de 10 rechazos por cada 100 peticiones frente a 99 del original, con una divergencia KL de 0,0541 respecto a la distribución del modelo base.

El modelo conserva la arquitectura y el pipeline multimodal del original (image-text-to-text), con 31.273.086.512 parámetros totales según los pesos en safetensors y un repositorio de 62,6 GB. Está pensado para desarrolladores e investigadores que necesitan un modelo Gemma 4 de 31B sin las capas de rechazo del ajuste instructivo original, por ejemplo para investigación sobre alineamiento, generación creativa sin filtros o evaluación de sesgos.

Es relevante ahora porque los flujos de abliteration se han popularizado como técnica reproducible para estudiar el comportamiento de rechazo en LLMs, y este modelo aplica una variante avanzada (ARA) con parámetros documentados y métricas de evaluación (MMLU y tasa de rechazos) que permiten comparar el impacto de la intervención sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en google/gemma-4-31B-it; no se detalla la configuración interna |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tune derivado del modelo instructivo google/gemma-4-31B-it, por lo que hereda su arquitectura transformer multimodal (pipeline image-text-to-text) y su entrenamiento original. La intervención no consiste en un reentrenamiento supervisado ni en RLHF, sino en una ablación de direcciones en el espacio de activaciones mediante Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA).

Los parámetros de abliteration documentados son: start_layer_index 30, end_layer_index 48, preserve_good_behavior_weight 0,5437, steer_bad_behavior_weight 0,0005, overcorrect_relative_weight 0,9949 y neighbor_count 15. El componente objetivo es attn.o_proj. El autor reporta una divergencia KL de 0,0541 respecto al modelo original y una reducción de rechazos de 99/100 a 10/100 en su conjunto de prueba.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo instructivo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), según la etiqueta del modelo.
- Razonamiento y conocimiento general, evaluado mediante MMLU (86,50 % en el original, 85,90 % en esta versión).
- Respuestas con muchas menos negativas, evasivas o advertencias morales que el modelo alineado original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineamiento y rechazo: permite comparar directamente el comportamiento del modelo original frente a la versión abliterated usando la misma arquitectura y pesos base, con métricas de KL y tasa de rechazos ya publicadas.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo alineado, manteniendo el conocimiento general del Gemma 4 de 31B.
- Evaluación de sesgos y robustez: útil para estudiar qué comportamientos se eliminan y cuáles persisten tras una ablación selectiva en las capas 30-48 sobre attn.o_proj.
- Asistente conversacional de dominio general: conversaciones multi-turno con capacidad de entrada de imagen, adecuado cuando se requiere un modelo de 31B con licencia Apache 2.0.
- Benchmarking de técnicas de abliteration: sirve como referencia reproducible para comparar Heretic/ARA con otras técnicas (por ejemplo, abliteration clásica por dirección única).
- Experimentación en investigación académica: análisis de la relación entre divergencia KL y cambios en la tasa de rechazo, con los parámetros de ablación documentados.

## Benchmarks y rendimiento

| Benchmark | Este modelo (Heretic) | Original (gemma-4-31B-it) |
|---|---|---|
| MMLU (accuracy global) | 85,90 % (6031/7021) | 86,50 % (6073/7021) |
| MMLU fallos de parseo | 37 | 52 |
| Tasa de rechazos (100 prompts) | 10/100 | 99/100 |
| Divergencia KL vs. original | 0,0541 | 0 (por definición) |

Resultados MMLU por materia destacados (Heretic frente a original): professional_law 74,90 % vs 76,82 %; moral_scenarios 82,81 % vs 83,48 %; miscellaneous 92,43 % en ambos; professional_psychology y high_school_psychology no disponibles completos en la información; high_school_mathematics 53,54 % en el original (dato de la versión original). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 31,27B parámetros, en FP16/BF16 requiere aproximadamente 62,5 GB de VRAM solo para pesos; en cuantización de 8 bits, en torno a 31-35 GB; en 4 bits, en torno a 16-20 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU para FP16; para cuantización 4/8 bits podrían servir A100 40 GB, L40S o RTX 6000 Ada.
- GPU de consumo: no cabe en FP16 en ninguna GPU de consumo actual; en cuantización 4 bits podría encajar en RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen ajustado.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y no se listan pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| llmfan46/gemma-4-31B-it-uncensored-heretic | 31,27B | no disponible | apache-2.0 | Gemma 4 31B abliterated (Heretic/ARA) | Hugging Face, safetensors |
| google/gemma-4-31B-it | 31,27B (según base) | no disponible | licencia Gemma 4 | Modelo instructivo original | Hugging Face |
| Otras variantes abliterated de Gemma | no disponible | no disponible | variable | Abliteration clásica | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de otros autores en la información proporcionada.

## Limitaciones y advertencias
- La abliteration elimina parte de las capas de seguridad del modelo original; puede generar contenido sensible, ofensivo o inapropiado que el modelo base rechazaría.
- Aunque la divergencia KL es baja (0,0541), la intervención puede degradar sutilmente capacidades en dominios específicos; el MMLU cae 0,6 puntos y algunas materias muestran caídas notables (por ejemplo, professional_law).
- Riesgo de alucinación heredado del modelo base; no se han publicado evaluaciones específicas de factualidad para esta versión.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del original.
- La licencia declarada es apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial del modelo base antes de desplegarlo en producción.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto puede afectar al mantenimiento y a futuras actualizaciones.
- No se proporcionan pesos cuantizados ni instrucciones de despliegue; el repositorio es de 62,6 GB en safetensors.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del método ARA: https://github.com/p-e-w/heretic/pull/211
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
