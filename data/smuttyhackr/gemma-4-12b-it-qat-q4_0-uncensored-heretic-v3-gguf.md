# SmuttyHackr/gemma-4-12B-it-qat-q4_0-uncensored-heretic-v3-GGUF

## Resumen

El modelo `SmuttyHackr/gemma-4-12B-it-qat-q4_0-uncensored-heretic-v3-GGUF` es una derivación no oficial de `google/gemma-4-12B-it` publicada por el usuario SmuttyHackr. Se trata de una versión "abliterada" o "decensored" del checkpoint QAT (Quantization-Aware Training) de 12B de la familia Gemma 4 de Google DeepMind, generada con la herramienta Heretic v2.0.0.dev0+custom. El objetivo declarado es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo el resto de comportamientos.

El modelo base Gemma 4 12B es un transformer multimodal de tipo denso (no MoE) con aproximadamente 11.907 millones de parámetros, ventana de contexto de hasta 256K tokens, soporte de entrada de texto, imagen y audio, y salida de texto. La versión publicada aquí se distribuye en formato GGUF con cuantización Q4_0, lo que reduce drásticamente los requisitos de memoria respecto al checkpoint en bfloat16.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso de la técnica de abliteration sobre un modelo QAT moderno; por otro, advierte de que se trata de un artefacto de investigación con la alineación de seguridad sustancialmente reducida, pensado para estudios de alineación y red-teaming, no para despliegue en producción ni en servicios de cara al usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Gemma 4, base `google/gemma-4-12B-it`) |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (según model card del modelo base) |
| Tipos de cuantización | Q4_0 (GGUF); el modelo base ofrece también wNa8o8 (móvil) y w4a16 (compressed-tensors) |
| Idiomas soportados | más de 140 idiomas según el modelo base; el autor no declara lista específica |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantización Q4_0) |
| Pipeline | any-to-any (texto, imagen y audio de entrada; texto de salida) |
| Librería | transformers |
| Modelo base | google/gemma-4-12B-it (vía checkpoint QAT Q4_0 unquantized) |
| Herramienta de modificación | Heretic v2.0.0.dev0+custom |
| Fecha de publicación | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Gemma 4, entrenado por Google DeepMind con Quantization-Aware Training (QAT) para preservar la calidad de bfloat16 con menor huella de memoria. La variante 12B acepta entradas de texto, imagen y audio, y genera texto; incorpora modos de razonamiento ("thinking") configurables y está diseñada como modelo razonador. El contexto máximo es de 256K tokens y el soporte multilingüe supera los 140 idiomas según la documentación del modelo base.

Sobre ese checkpoint, el autor aplica una abliteration con Heretic v2.0.0.dev0+custom. Los parámetros declarados incluyen: rango de capas 23 a 32, `preserve_good_behavior_weight` 1.0, `steer_bad_behavior_weight` 0.0001, `transport_rank` 4, transporte gaussiano, `lora_rank` 128, regularización ridge de ~2,9e-06, regularización de entropía 0.1, regularización de covarianza 0.01, `max_weight_change` 1.0 y componentes objetivo `attn.o_proj` y `mlp.down_proj`. No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF/DPO específicas para esta derivación; toda esa información corresponde al modelo base y no se detalla en la model card.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (heredados del modelo base Gemma 4).
- Comprensión de imágenes como entrada (multimodal image-to-text).
- Comprensión de audio como entrada (soportado en E2B, E4B y 12B según el modelo base).
- Capacidades de código y matemáticas propias de la familia Gemma 4 (sin métricas publicadas para esta derivación).
- Soporte multilingüe amplio (más de 140 idiomas en el modelo base).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints compatibles (`endpoints_compatible`).
- Reducción sustancial de rechazos: 0/100 en la evaluación del autor frente a 99/100 del original.
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad: el modelo sirve para estudiar cómo la abliteration afecta a la distribución de respuestas y a la calibración, comparando con el checkpoint original mediante la divergencia KL reportada (0,0032).
- Red-teaming de sistemas: permite generar respuestas que un modelo alineado rechazaría, lo que facilita la construcción de conjuntos de pruebas adversarios y la evaluación de filtros de seguridad en pipelines propios.
- Evaluación de técnicas de edición de pesos: útil para reproducir y contrastar los parámetros de Heretic (capas 23-32, `attn.o_proj`, `mlp.down_proj`, rango LoRA 128) y medir su impacto en el comportamiento.
- Experimentos de cuantización QAT: al ser un GGUF Q4_0 derivado de un checkpoint QAT, permite estudiar la degradación de calidad frente a bfloat16 en tareas de razonamiento y generación libre.
- Análisis de sesgos y toxicidad: al reducirse los rechazos, el modelo expone con más frecuencia contenido sesgado u ofensivo, lo que resulta útil para auditar clasificadores y medir la eficacia de moderadores.
- Pruebas de robustez de salvaguardas en productos: simular un atacante que dispone de un modelo sin alineación para validar defensas en sistemas de moderación y detección.
- Investigación multimodal controlada: aprovechar la entrada de imagen y audio del modelo base para estudiar cómo la abliteration afecta a la descripción de contenido sensible en imágenes.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (gemma-4-12B-it-qat-q4_0-unquantized) |
|---|---|---|
| Rechazos (Refusals) | 0/100 | 99/100 |
| Divergencia KL | 0,0032 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta derivación.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_0: aproximadamente 7-8 GB para los pesos (11,9B parámetros a ~4 bits más overhead), más el espacio de la caché KV, que crece con el contexto y puede ser considerable a 256K tokens.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para contexto moderado; A100 40/80 GB o H100 para contextos largos y mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs con 12 GB o más para contextos cortos; 16-24 GB recomendable para contexto medio.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base también ofrece w4a16 para vLLM, pero esta derivación concreta solo publica GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (gemma-4-12B-it abliterado Q4_0) | ~11,9B | 256K | apache-2.0 | GGUF Q4_0 | Sin alineación de seguridad; 0/100 rechazos |
| google/gemma-4-12B-it (QAT Q4_0) | ~11,9B | 256K | apache-2.0 | GGUF / unquantized / w4a16 | Modelo original alineado; 99/100 rechazos |
| Otras derivaciones abliteradas de la familia Gemma | no disponible | no disponible | apache-2.0 (heredada) | GGUF | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La alineación de seguridad está sustancialmente reducida: el propio autor advierte de mayor probabilidad de contenido dañino, inexacto, sesgado u ofensivo.
- Riesgo elevado de alucinación y de respuestas no verificadas; todos los resultados deben tratarse como no confiables.
- El autor restringe el uso previsto a investigación, experimentación, estudios de alineación y red-teaming, y desaconseja el despliegue en servicios públicos o de cara al usuario final.
- La licencia declarada es apache-2.0, pero el `license_link` apunta a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de cualquier uso comercial.
- No se documentan idiomas soportados específicos para esta derivación ni evaluaciones multilingües.
- No hay datos publicados de benchmarks estándar, latencia ni throughput para esta versión concreta.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- La model card incluye una renuncia de responsabilidad del autor ("OS-Software") que declina toda responsabilidad por daños derivados del uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmuttyHackr/gemma-4-12B-it-qat-q4_0-uncensored-heretic-v3-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Checkpoint QAT Q4_0 unquantized: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Heretic (proyecto): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4 QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
