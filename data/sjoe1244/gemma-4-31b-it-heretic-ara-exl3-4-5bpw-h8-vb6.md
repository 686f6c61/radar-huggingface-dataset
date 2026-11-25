# sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6

## Resumen

`sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6` es una cuantización EXL3 (ExLlamaV3) de `trohrbaugh/gemma-4-31b-it-heretic-ara`, una versión "decensored" del modelo multimodal `google/gemma-4-31b-it`. La ablación de seguridad (ARA, *Arbitrary-Rank Ablation*) reduce las negativas del modelo original de 98/100 a 5/100 según los datos del autor del modelo base, con una divergencia KL de 0,0120 respecto al original. Esta build concreta aplica cuantización selectiva: pesos del decodificador a 4,5 bpw, cabeza de salida (`lm_head`) a 8 bpw y torre de visión a 6 bpw.

El resultado es un artefacto de 21,2 GB en safetensors que incluye la torre de visión cuantizada, por lo que admite entrada de imagen además de texto. Está pensado exclusivamente para TabbyAPI o ExLlamaV3: no funciona en Transformers, vLLM ni llama.cpp. La relevancia práctica es que permite ejecutar un modelo de la familia Gemma 4 de 31B (con 10.590.777.580 parámetros almacenados en safetensors) en una GPU de 24 GB como la RTX 4090, con una caché FP16 de 16.384 tokens y unos 19,7 GiB de VRAM asignada.

La ficha documenta un artefacto de cuantización, no un modelo entrenado desde cero: los méritos de arquitectura y entrenamiento corresponden al modelo base de Google y a la ablación de trohrbaugh. Los datos de calidad de la cuantización (KL, acuerdo top-1, perplejidad) sí son específicos de esta build y están medidos por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), base `google/gemma-4-31b-it`; pesos en formato EXL3 |
| Parametros totales | 10.590.777.580 (según safetensors del repo); el nombre comercial indica familia 31B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como cifra oficial; probado con caché de 16.384 tokens en RTX 4090; techo en 24 GB no medido |
| Tipos de cuantizacion | EXL3: decodificador 4,5 bpw (rango por capa 4,0–5,0), `lm_head` 8 bpw, torre de visión 6 bpw; codebook mul1; escalas de salida auto |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (EXL3), librería `exllamav3` |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-31b-it`, un transformer multimodal de la familia Gemma 4 con capacidad image-text-to-text. Sobre él, `trohrbaugh` aplicó una ablación ARA (*Arbitrary-Rank Ablation*) mediante Heretic v1.2.0 con personalizaciones, generando `gemma-4-31b-it-heretic-ara` en BF16. Esta build es una cuantización de ese BF16 con ExLlamaV3 1.6.7, calibrada con 250 filas × 2.048 columnas del mix de calibración incluido en exllamav3. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo original en la documentación proporcionada.

La innovación técnica relevante de esta build es la asignación de bits por capa: el decodificador promedia 4,5 bpw pero exllamav3 distribuye el presupuesto entre 4,0 y 5,0 bpw según la capa, mientras que la cabeza de salida se mantiene a 8 bpw y la torre de visión a 6 bpw. El comando de conversión documentado es `python -m exllamav3.conversion.convert_model -i ... -o ... -b 4.5 -hb 8 -vb 6`. La calidad frente al BF16 se midió con `eval/model_diff.py` sobre 50 filas × 2.048 tokens de wikitext-2 con prompt de chat: KL 0,0177, acuerdo top-1 del 95,93 % y perplejidad 18,53 frente a 18,42 del BF16.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Razonamiento y matemáticas básicas: en las pruebas del autor resolvió 17×23 = 391 y una inversión de cadena `s[::-1]` con decodificación greedy (3 de 3 comprobaciones).
- Visión: entrada image-text-to-text con torre de visión cuantizada a 6 bpw; describió correctamente la imagen de ejemplo de exllamav3 (gatito atigrado con gorro de ganchillo sobre manta verde y blanca).
- Modelo "decensored": las negativas caen de 98/100 a 5/100 según el autor del modelo base, con KL 0,0120 frente al original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repo.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el artefacto permite estudiar el efecto de la ablación ARA comparando respuestas del modelo heretic con el Gemma 4 original, usando la métrica de negativas (5/100 frente a 98/100) como referencia.
- Evaluación de cuantización extrema: sirve para medir la degradación real de EXL3 a 4,5 bpw con cabeza a 8 bpw sobre un modelo multimodal, con KL 0,0177 y perplejidad 18,53 como línea base reproducible.
- Asistente multimodal local en estación de trabajo: con unos 19,7 GiB de VRAM en una RTX 4090 y caché de 16.384 tokens, puede procesar imágenes y mantener conversaciones sin salir del equipo.
- Generación de descripciones de imágenes en lotes pequeños: la torre de visión a 6 bpw permite captioning y respuesta a preguntas visuales en entornos con una sola GPU consumer.
- Prototipado de aplicaciones conversacionales con TabbyAPI: el backend expone una API compatible con OpenAI, lo que facilita integrar el modelo en demos internas con `max_batch_size=1` y caché cuantizada Q6/Q4.
- Experimentación con contenido sin filtros en entornos controlados: útil para probar la robustez de clasificadores de seguridad o para generar datos adversarios de evaluación, siempre bajo la licencia Gemma y la legislación aplicable.
- Benchmarking de rendimiento en consumer GPU: con ~42 tok/s de generación en RTX 4090, sirve para calibrar expectativas de latencia en despliegues de un solo usuario.

## Benchmarks y rendimiento

Datos de calidad de la cuantización medidos por el autor contra el BF16 de `trohrbaugh/gemma-4-31b-it-heretic-ara` (50 filas × 2.048 tokens de wikitext-2, prompt de chat):

| Metrica | Este quant (4.5bpw-h8-vb6) | BF16 origen |
|---|---|---|
| Divergencia KL (quant ‖ BF16) | 0,0177 | 0 (por definición) |
| Acuerdo top-1 | 95,93 % | 100 % |
| Perplejidad | 18,53 | 18,42 |

Comparativa interna de la familia de cuants ARA, medida del mismo modo:

| Quant | KL vs BF16 | Acuerdo top-1 |
|---|---|---|
| 8.0bpw-h8-vb8 | 0,00037 | 99,47 % |
| 6.0bpw-h8 | 0,0023 | 98,58 % |
| 4.5bpw-h8-vb6 (esta build) | 0,0177 | 95,93 % |
| 4.0bpw-h4-vb4 | 0,0244 | 95,30 % |

Datos del modelo base heretic-ara frente al Gemma 4 original (según trohrbaugh, medidos en BF16):

| Metrica | heretic-ara (BF16) | google/gemma-4-31b-it |
|---|---|---|
| Divergencia KL | 0,0120 | 0 (por definición) |
| Negativas | 5/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 19,7 GiB tras cargar texto y visión con caché FP16 de 16.384 tokens y `max_batch_size=1` en RTX 4090.
- GPU recomendadas: RTX 4090 (24 GB) verificada por el autor; cabe en cualquier GPU con 24 GB o más. Para contextos largos en 24 GB hay que usar caché cuantizada Q6/Q4 y `max_batch_size=1`.
- Cabe en consumer GPU: sí, en RTX 4090 y modelos de 24 GB; el techo de contexto en 24 GB no está medido.
- Opciones de despliegue: exclusivamente TabbyAPI o ExLlamaV3 (versión probada 1.6.7 con torch 2.11.0+cu128). No funciona en Transformers, vLLM ni llama.cpp.
- Throughput: aproximadamente 42 tok/s de generación en RTX 4090 según el autor.
- Advertencia de configuración: el valor por defecto `max_batch_size=16` reserva caché de ventana deslizante para 16 secuencias y consume varios GB adicionales; hay que fijarlo a 1 o usar caché cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (4.5bpw-h8-vb6) | 10.590.777.580 en safetensors | no disponible; probado 16.384 tokens | KL 0,0177 vs BF16; 95,93 % top-1 | apache-2.0 | 21,2 GB, solo ExLlamaV3/TabbyAPI |
| gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8 | mismo modelo base | no disponible | KL 0,00037; 99,47 % top-1 | apache-2.0 | mayor tamaño, mayor fidelidad |
| gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8 | mismo modelo base | no disponible | KL 0,0023; 98,58 % top-1 | apache-2.0 | equilibrio intermedio |
| gemma-4-31b-it-heretic-ara-exl3-4.0bpw-h4-vb4 | mismo modelo base | no disponible | KL 0,0244; 95,30 % top-1 | apache-2.0 | menor tamaño, mayor degradación |
| google/gemma-4-31b-it (original) | familia 31B | no disponible | referencia con guardrails | licencia Gemma 4 | Transformers y ecosistema amplio |

No se dispone de datos de benchmarks estándar ni de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Los guardrails de seguridad están reducidos de forma deliberada (5/100 negativas frente a 98/100): el modelo puede producir contenido que el Gemma 4 original rechazaría. La responsabilidad de uso recae en el operador.
- La cuantización introduce degradación medible: perplejidad 18,53 frente a 18,42 del BF16 y un 4,07 % de desacuerdo top-1. Para tareas sensibles a la fidelidad exacta conviene la build de 6 u 8 bpw.
- Compatibilidad restringida: no funciona en Transformers, vLLM ni llama.cpp. Solo TabbyAPI y ExLlamaV3, lo que limita su integración en pipelines estándar.
- El techo de contexto real en GPUs de 24 GB no está medido; los 16.384 tokens son una configuración probada, no un máximo documentado.
- Idiomas soportados no declarados: no hay garantía documentada de calidad multilingüe más allá de lo que herede del Gemma 4 original.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados en la model card; la ablación ARA puede alterar la distribución de respuestas más allá de las negativas, con KL 0,0120 frente al original.
- Uso comercial: la licencia declarada es apache-2.0, pero el enlace apunta a la licencia Gemma 4 de Google; conviene revisar los términos de Gemma antes de desplegar en producción.
- Repo con 23 descargas y 0 likes: validación comunitaria mínima; el artefacto está probado por el autor en una sola configuración de hardware y software.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6
- Modelo base (ablación ARA): https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Cuantización 8.0bpw-h8-vb8: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8
- Cuantización 6.0bpw-h8: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8
- Cuantización 4.0bpw-h4-vb4: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.0bpw-h4-vb4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
