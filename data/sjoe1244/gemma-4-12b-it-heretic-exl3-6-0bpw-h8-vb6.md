# sjoe1244/gemma-4-12b-it-heretic-exl3-6.0bpw-h8-vb6

## Resumen

Este repositorio contiene una cuantización EXL3 de 6.0 bits por peso (bpw) del modelo `trohrbaugh/gemma-4-12b-it-heretic`, una versión "abliterated" (decensurada) de `google/gemma-4-12b-it`. El autor de la cuantización es `sjoe1244`, que utiliza ExLlamaV3 1.6.7 para generar pesos optimizados para inferencia en GPU con `tabbyAPI`. La relevancia de esta ficha radica en que combina dos elementos poco habituales: la arquitectura "unified" de Gemma 4 (procesa imagen y audio mediante capas internas, sin encoder separado) y un proceso de abliteración que reduce drásticamente los rechazos del modelo original, manteniendo una divergencia KL baja respecto a la versión de Google.

El modelo base declara 12.000 millones de parámetros nominales, aunque el recuento real de tensores en safetensors es de 5.629.157.168 parámetros. Esta discrepancia sugiere que el nombre comercial "12B" no coincide con el número efectivo de pesos del checkpoint publicado, un detalle importante a la hora de planificar VRAM y rendimiento. El contexto, los idiomas y los datos de entrenamiento no están disponibles en la información proporcionada.

La cuantización está pensada para despliegue local en GPUs de consumo: según el autor, ocupa 9,2 GiB de VRAM tras cargar las partes de texto y visión en una RTX 3090 Ti, y genera a unos 69 tokens/s con caché FP16 de 8.192 tokens y `max_batch_size=1`. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que introduce una ambigüedad que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "unified" de Gemma 4 (capas internas para imagen y audio, sin encoder separado); pesos cuantizados con ExLlamaV3 (EXL3) |
| Parametros totales | 5.629.157.168 (recuento real en safetensors); el nombre comercial indica "12B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor prueba con caché de 8.192 tokens, pero no se declara el máximo) |
| Tipos de cuantizacion | EXL3 6.0 bpw en decoder, 8 bpw en `lm_head`, 6 bpw en capas de visión; codebook `mul1`; escalas de salida `auto` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors (ExLlamaV3 / EXL3); librería `exllamav3` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12b-it`, descrito por el autor de la cuantización como un modelo "unified": las entradas de imagen y audio se procesan mediante capas internas pequeñas en lugar de un encoder independiente. Esa arquitectura multimodal se conserva en la cuantización, incluidas las capas de visión a 6 bpw. El pipeline declarado es `any-to-any`, lo que encaja con la presencia de entradas de imagen y audio además de texto.

Sobre el entrenamiento original de Gemma 4 no hay datos en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Lo que sí se documenta es el proceso de modificación: `trohrbaugh` aplicó Heretic v1.2.0 con personalizaciones sobre el modelo BF16 de Google para producir la versión "heretic". El autor reporta, medido en BF16 y no en esta cuantización, una divergencia KL de 0,0177 frente al original y una reducción de rechazos de 99/100 a 1/100 en su conjunto de prueba. La cuantización EXL3 se calibró con 250 filas × 2.048 columnas usando la mezcla de calibración incluida en exllamav3.

## Capacidades

- Generación de texto conversacional en formato instruct (`-it`), con respuestas verificadas por el autor a preguntas factuales, aritmética y código Python.
- Razonamiento básico y aritmética: el autor documenta 17 × 23 = 391 como prueba correcta.
- Generación de código: el autor verifica una inversión de cadena en una línea de Python (`s[::-1]`).
- Entrada de imagen: el autor probó la descripción de una imagen de ejemplo (un gatito atigrado gris con un gorro de ganchillo) y la respuesta fue correcta.
- Entrada de audio: la arquitectura la contempla, pero el autor indica explícitamente que no la probó.
- Pipeline `any-to-any`, coherente con el procesamiento multimodal interno del modelo base.
- Comportamiento "decensurado"/"abliterated": reducción drástica de rechazos según las métricas del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar cómo varía la tasa de rechazo y la calidad respecto al Gemma 4 original, con una divergencia KL declarada de 0,0177 en BF16; útil para comparar metodologías de edición de pesos.
- Despliegue local en GPU de consumo: con 9,2 GiB de VRAM en una RTX 3090 Ti y ~69 tokens/s, encaja en estaciones de trabajo con 24 GB para prototipos conversacionales sin depender de la nube.
- Asistentes conversacionales sin filtros restrictivos: para entornos de escritura creativa, role-play o generación de contenido donde los rechazos del modelo alineado resultan un obstáculo, asumiendo la responsabilidad legal y ética del uso.
- Descripción de imágenes en local: la parte de visión a 6 bpw permite tareas de captioning o análisis de imágenes en hardware de consumo, útil para pipelines de etiquetado o accesibilidad.
- Evaluación de cuantizaciones EXL3: sirve como caso de estudio de la pérdida de calidad al pasar de BF16 a 6 bpw con cabeza a 8 bpw, comparando respuestas con el modelo base.
- Integración con tabbyAPI: al estar etiquetado para `tabbyapi`, puede servirse como backend compatible con OpenAI para aplicaciones existentes que ya usen ese servidor.
- Pruebas de robustez y red-teaming: la reducción de salvaguardas lo hace adecuado para auditar comportamientos indeseados antes de desplegar modelos alineados en producción.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) sobre esta cuantización. Los únicos datos numéricos disponibles son los del modelo base BF16 y las mediciones de velocidad del autor:

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL (heretic BF16 vs. original) | 0,0177 | Medido en BF16, no en esta cuantización |
| Rechazos (heretic BF16) | 1/100 | Conjunto de prueba del autor |
| Rechazos (google/gemma-4-12b-it) | 99/100 | Conjunto de prueba del autor |
| VRAM tras carga (texto + visión) | 9,2 GiB | RTX 3090 Ti, exllamav3 1.6.7, caché FP16 8.192 tokens, batch 1 |
| Velocidad de generación | ~69 tokens/s | Mismas condiciones |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,2 GiB medidos por el autor con caché FP16 de 8.192 tokens y `max_batch_size=1`; el tamaño del repo es de 11,3 GB, por lo que conviene prever margen adicional para caché y contexto más largos.
- GPU recomendadas: RTX 3090 Ti (probada por el autor); por capacidad de VRAM, deberían funcionar también RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB), aunque no hay pruebas publicadas en esas tarjetas.
- GPU de consumo: sí cabe en tarjetas de 24 GB; en tarjetas de 16 GB el margen es ajustado y no está verificado; por debajo de 12 GB no hay datos.
- Opciones de despliegue: ExLlamaV3 (librería nativa) y tabbyAPI (etiqueta del repo); no se mencionan llama.cpp, Ollama, vLLM ni TGI, y al ser formato EXL3 no son directamente compatibles sin conversión.
- Latencia y throughput: ~69 tokens/s de generación en RTX 3090 Ti con las condiciones indicadas; no hay datos de latencia de prefill ni de throughput con batch mayor que 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `sjoe1244/gemma-4-12b-it-heretic-exl3-6.0bpw-h8-vb6` | 5.629.157.168 (reales) | no disponible | EXL3 6.0 bpw | apache-2.0 | Esta ficha; ~9,2 GiB VRAM, ~69 tok/s en 3090 Ti |
| `trohrbaugh/gemma-4-12b-it-heretic` | no disponible | no disponible | BF16 | no disponible | Modelo base de la cuantización; KL 0,0177, 1/100 rechazos |
| `google/gemma-4-12b-it` | no disponible | no disponible | BF16 | términos de Gemma 4 | Original alineado; 99/100 rechazos según el autor |
| Otras cuantizaciones EXL3 del mismo base | no disponible | no disponible | EXL3 (distintos bpw) | no disponible | No se han identificado en la información proporcionada |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes (Llama, Qwen, Mistral) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Salvaguardas reducidas de forma deliberada: el modelo es "abliterated" y el propio autor advierte de que las protecciones de seguridad han sido mermadas; el uso es responsabilidad del desplegador.
- Riesgo de alucinación: no hay evaluaciones publicadas de factualidad ni de tasa de alucinación en esta cuantización.
- La cuantización a 6 bpw puede degradar calidad respecto al BF16; el autor no publica una comparación cuantitativa de perplejidad o benchmarks entre ambos.
- Entrada de audio no verificada: aunque la arquitectura la soporta, el autor solo probó imagen.
- Idiomas y contexto máximo no declarados: no se puede garantizar cobertura multilingüe ni ventanas largas más allá de los 8.192 tokens de la prueba.
- Ambigüedad de licencia: se declara `apache-2.0` pero el `license_link` apunta a los términos de Gemma 4 de Google; conviene verificar cuál prevalece para uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- Sin soporte documentado de tool calling ni de flujos de agente: no se debe asumir su disponibilidad en producción.
- Formato EXL3 específico: requiere ExLlamaV3 o tabbyAPI; no es portable directamente a otros runtimes sin conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sjoe1244/gemma-4-12b-it-heretic-exl3-6.0bpw-h8-vb6
- Modelo base (heretic BF16): https://huggingface.co/trohrbaugh/gemma-4-12b-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-12b-it
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Heretic: https://github.com/p-e-w/heretic
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
