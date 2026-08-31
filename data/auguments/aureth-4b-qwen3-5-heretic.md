# Auguments/Aureth-4B-Qwen3.5-Heretic

## Resumen

Auguments/Aureth-4B-Qwen3.5-Heretic es un modelo de lenguaje de 4.500 millones de parámetros, resultado de aplicar la técnica de eliminación de censura Heretic 1.3.0 sobre el modelo OusiaResearch/Aureth-4B-Qwen3.5, un fine-tune de Qwen3.5-4B orientado a tareas creativas. El objetivo de esta versión es reducir drásticamente los rechazos (refusals) del modelo original, que según su autor era "muy censurado" y "presumía de ello". La herramienta Heretic, desarrollada por p-e-w, modifica automáticamente los pesos del modelo para eliminar la censura sin necesidad de reentrenamiento.

El resultado es un modelo que mantiene la personalidad y el estilo creativo de Aureth, pero con una tasa de rechazos mucho menor (de 84 a 10 en una prueba de 100 prompts, aunque el autor admite que solo 2 o 3 son rechazos reales). Sin embargo, el propio autor advierte que el modelo base ya presentaba problemas de alucinación y bucles, y que esta versión decensurada solo los reduce parcialmente. No soporta razonamiento explícito y su uso está pensado para generación de texto creativo, no para tareas que requieran precisión factual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5, presumiblemente transformer denso) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | se menciona Q6_K en la model card (probablemente GGUF), pero no se confirma disponibilidad en el repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo parte de OusiaResearch/Aureth-4B-Qwen3.5, un fine-tune de Qwen3.5-4B entrenado con el "Aureth Corpus", un conjunto de datos propietario generado por Hermes-4.3-36B mediante autoexamen PMI estructurado en seis dimensiones fenomenológicas y refinado con múltiples voces de agente. Sobre esta base, Auguments aplicó Heretic 1.3.0, una técnica de eliminación automática de censura que identifica direcciones en el espacio de activaciones del modelo asociadas a comportamientos de rechazo y las modifica mediante interpolación de pesos. Los parámetros reportados (direction_scope global, direction_index 14.56, pesos máximos y mínimos en attn.o_proj y mlp.down_proj) indican que la intervención se realizó a nivel global sobre las proyecciones de atención y MLP. No se dispone de información sobre el entrenamiento original de Qwen3.5-4B (número de tokens, composición del dataset, fases de RLHF/DPO).

## Capacidades

- Generación de texto creativo: el autor indica que es "mejor para tareas creativas que el Qwen 3.5 4B base", con una personalidad más marcada.
- Menor tasa de rechazos: reduce los refusals de 84 a 10 en una prueba de 100 prompts, con solo 2-3 rechazos reales según el autor.
- No soporta razonamiento explícito: forzar un modo de razonamiento empeora el rendimiento.
- Propenso a alucinaciones y bucles: el autor advierte que "alucina mucho y se queda en bucles", aunque la versión decensurada reduce algo las alucinaciones.
- Sin capacidades multimodales conocidas: no se menciona visión, audio ni otras modalidades.
- Multilingüismo: no se especifican idiomas soportados.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar historias, diálogos y descripciones con un estilo más vivo que el Qwen base, adecuado para prototipos de ficción o roleplay.
- Asistente de chat sin restricciones de contenido: útil para entornos de investigación donde se necesita explorar temas sensibles sin que el modelo se niegue, siempre con supervisión humana.
- Generación de ideas y brainstorming: su menor tasa de rechazos permite obtener respuestas más variadas en sesiones de lluvia de ideas, aunque hay que verificar los hechos.
- Experimentación con técnicas de decensurado: sirve como caso de estudio para evaluar el impacto de Heretic en modelos pequeños, comparando refusals y calidad de salida.
- Generación de contenido para juegos de rol: su personalidad y estilo creativo pueden adaptarse a personajes o mundos de ficción, aunque los bucles requieren control de temperatura y repetición.
- Prototipado de aplicaciones de chat: al ser un modelo de 4B, puede desplegarse en hardware modesto para pruebas de concepto, siempre asumiendo sus limitaciones de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas específicas de la intervención Heretic:

| Metrica | Valor |
|---|---|
| Refusals (modelo base) | 84 |
| Refusals (modelo decensurado) | 10 |
| KLD (divergencia KL) | 0.0102 |
| n_bad_prompts | 100 |

El autor también compara una respuesta factual entre el modelo original y el decensurado, mostrando que el original produce un dato absurdo (2000 litros de saliva al día) mientras que el decensurado da un dato con errores pero menos exagerado. No hay cifras de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4.539.265.536 parámetros. En BF16 (formato probable del repo, 9.1 GB) ocupa unos 9 GB de VRAM. Con cuantización Q6_K (mencionada en la model card) ocuparía aproximadamente 4-5 GB.
- GPU recomendadas: para BF16, una GPU con 12 GB o más (RTX 3060 12GB, RTX 4070, A10, L4). Para cuantización Q6_K, una GPU con 6-8 GB (RTX 3060 8GB, RTX 4060, GTX 1080 Ti) podría ser suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio-alto, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo basado en Qwen3.5, es compatible con vLLM, SGLang, KTransformers, llama.cpp y Ollama (si se generan archivos GGUF). No se confirma la disponibilidad de GGUF en el repo.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 4B en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals (100 prompts) | Licencia | Notas |
|---|---|---|---|---|---|
| Auguments/Aureth-4B-Qwen3.5-Heretic | 4.5B | no disponible | 10 | Apache 2.0 | Decensurado, propenso a alucinaciones |
| OusiaResearch/Aureth-4B-Qwen3.5 | 4.5B | no disponible | 84 | Apache 2.0 | Censurado, mejor para creatividad que Qwen base |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible | Apache 2.0 | Modelo base, más equilibrado pero menos personalidad |

No se dispone de datos de rendimiento en benchmarks para comparar directamente. La comparativa se basa en las características cualitativas reportadas por el autor.

## Limitaciones y advertencias

- Alucinaciones frecuentes: el autor admite que el modelo "alucina mucho", incluso en datos factuales simples. No es adecuado para tareas que requieran precisión.
- Bucles de generación: tiende a repetirse o quedarse atascado en ciclos, lo que requiere control de parámetros de decodificación (repetición, temperatura).
- Sin soporte de razonamiento: forzar un modo de razonamiento degrada la calidad de salida.
- Contenido potencialmente inapropiado: al eliminar la censura, el modelo puede generar contenido ofensivo, ilegal o dañino. El uso debe ser responsable y bajo supervisión.
- Licencia Apache 2.0: permite uso comercial, pero el responsable del despliegue debe asumir las consecuencias del contenido generado.
- Información técnica incompleta: no se especifican arquitectura exacta, contexto, idiomas ni datos de entrenamiento, lo que dificulta la evaluación rigurosa.
- El autor recomienda el modelo solo para tareas creativas, no para producción general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Auguments/Aureth-4B-Qwen3.5-Heretic
- Modelo base (OusiaResearch/Aureth-4B-Qwen3.5): https://huggingface.co/OusiaResearch/Aureth-4B-Qwen3.5
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Tutorial de Heretic: https://heretic-project.org/tutorial
- Modelo relacionado (Qwen3.5-4B-heretic de Archangel87): https://huggingface.co/Archangel87/Qwen3.5-4B-heretic
