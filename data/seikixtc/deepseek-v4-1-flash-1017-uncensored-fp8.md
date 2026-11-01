# seikixtc/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario seikixtc (con créditos a dealignai) en HuggingFace. El objetivo declarado es eliminar el comportamiento de rechazo del modelo base (proceso conocido como *abliteration*) manteniendo intactas todas las capacidades originales: visión, vídeo, razonamiento por niveles, tool calling, decodificación especulativa DSpark y una ventana de contexto de 1 millón de tokens.

Se trata de un modelo MoE de 40 capas con 763.205.315.794 parámetros totales según los safetensors del repositorio (510,3 GB en 48 shards), distribuido en formato FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos en FP4, el mismo formato que emplea DeepSeek en su checkpoint upstream. La modificación es exclusivamente a nivel de pesos: no hay cambios en el tokenizer, la plantilla de chat, el prompt de sistema ni adaptadores LoRA, de modo que es *drop-in* con el motor de inferencia oficial.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de contexto largo sin restricciones de rechazo para tareas de investigación, generación creativa o evaluación de salvaguardas, aunque su licencia MIT y su naturaleza modificada exigen una evaluación cuidadosa antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41), multimodal image-text-to-text |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4 |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 510,3 GB), FP8 e4m3 + FP4 expertos, compatible con el motor `inference/` de DeepSeek |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4.1-Flash-1017: un transformer de mezcla de expertos (MoE) de 40 capas con atención de contexto largo que soporta hasta 1 millón de tokens. El checkpoint se distribuye en precisión FP8 nativa (e4m3) con escalas de bloque ue8m0 y expertos cuantizados en FP4, el mismo esquema que DeepSeek emplea en su release oficial, lo que garantiza compatibilidad byte a byte con el motor de inferencia upstream (`inference/`) y el renderizador de prompts (`encoding/`).

La modificación aplicada por el autor es exclusivamente a nivel de pesos (abliteration): no se ha realizado SFT, RLHF ni DPO, no se ha modificado el vocabulario ni el tokenizer, y no se han introducido LoRA, adaptadores ni hooks en tiempo de carga. El autor advierte que cuantizar este checkpoint FP8 a bits más bajos de forma ingenua acumula error sobre la edición de abliteration y puede degradar el cumplimiento, por lo que recomienda rehacer el pipeline sobre la precisión objetivo. Se preservan las innovaciones del modelo base, incluida la decodificación especulativa DSpark y los niveles de esfuerzo de razonamiento (`low` / `high` / `max`).

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión multimodal de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling / function calling nativo.
- Razonamiento multi-paso y flujos agénticos gracias al contexto de 1M tokens.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Capacidades multilingües en inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento sin rechazo (uncensored/abliterated) en todas las categorías temáticas, preservando el resto de capacidades upstream.
- Compatibilidad con endpoints estándar (`endpoints_compatible`).

## Casos de uso

- Investigación sobre salvaguardas y alineación: permite estudiar cómo se comporta un modelo de gran escala sin capa de rechazo, comparando respuestas con el modelo base para analizar sesgos y mecanismos de negativa.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo original, aprovechando el contexto de 1M tokens para mantener coherencia en obras largas.
- Análisis de documentos extensos multimodales: procesamiento de informes con imágenes y vídeo integrados en una única ventana de 1M tokens, útil en auditoría documental o investigación legal.
- Agentes autónomos de múltiples pasos: el soporte de tool calling y el contexto largo permiten construir pipelines agénticos que mantienen estado durante sesiones prolongadas.
- Atención al cliente especializada: conversaciones multi-turno con historial extenso y adjuntos de imagen, con la advertencia de que la ausencia de rechazo exige filtros externos de moderación.
- Evaluación comparativa de modelos: servir como referencia *uncensored* frente al base en benchmarks de seguridad, toxicidad y cumplimiento.
- Procesamiento de vídeo para análisis de contenido: descripción y extracción de información de secuencias de vídeo en flujos de monitorización o catalogación.

## Benchmarks y rendimiento

El autor publica resultados internos de MMLU (57 materias × 20 preguntas, 1140 en total) en modo logit, greedy T=0, ejecutados sobre 4×H200 con TP4. La información disponible solo incluye el resultado del modelo base; el dato del modelo modificado aparece truncado en la model card.

| Modelo | MMLU (20×57) | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 | no disponible (dato truncado en la fuente) | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks para esta versión modificada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 510,3 GB en FP8, por lo que la inferencia requiere al menos ~512 GB de memoria agregada; no cabe en una sola GPU de consumo.
- GPU recomendadas: el autor valida el despliegue en 4×H200 con tensor parallelism 4 (TP4); configuraciones equivalentes con A100 80 GB o H100 también son viables con TP≥8 según el motor.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer actual; se requeriría cuantización adicional a bits bajos (con la advertencia del autor sobre la pérdida de calidad).
- Opciones de despliegue: motor `inference/` oficial de DeepSeek (referencia validada); vLLM y TGI son compatibles si soportan el formato FP8 e4m3 con escalas ue8m0 y expertos FP4; llama.cpp/Ollama requerirían conversión a GGUF, no recomendada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2 B (MoE) | 1M | Texto + imagen + vídeo | MIT | HuggingFace |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (MoE) | 1M | Texto + imagen + vídeo | no disponible en la información | HuggingFace / API oficial |
| deepalignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | Texto + imagen + vídeo | no disponible | HuggingFace |

El modelo base y la variante EXL3 2,9 bpw (citada por el autor como versión de baja precisión construida de extremo a extremo) son las alternativas más directas. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin capa de rechazo: puede generar contenido dañino, ilegal o sexualmente explícito; requiere moderación externa en cualquier despliegue público.
- Acceso restringido mediante *gated prompt*: el autor exige confirmar mayoría de edad y aceptación de responsabilidad sobre las salidas.
- Riesgo de alucinación inherente al modelo base, no mitigado por la modificación.
- La cuantización adicional a bits bajos degrada el cumplimiento y la calidad según advierte el propio autor.
- Licencia MIT permite uso comercial, pero la responsabilidad legal sobre las salidas recae íntegramente en el usuario.
- Idiomas limitados a siete; el rendimiento en tailandés, italiano o ruso puede ser inferior al de inglés y chino.
- Repositorio con muy poca tracción (29 descargas, 0 likes) y sin validación independiente de terceros.
- El resultado de MMLU del modelo modificado no está completo en la model card, lo que impide verificar la preservación de capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/seikixtc/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del autor: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor de la modificación: https://twitter.com/dealignai
