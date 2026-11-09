# sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.00bpw-h4-vb4

## Resumen
Este repositorio contiene una cuantización EXL3 de 4.00 bits por peso (bpw) del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, una variante "abliterated" (sin los mecanismos de rechazo habituales) del Gemma 4 de 31B en su versión instruct. La cuantización la publica el usuario sjoe1244 y está pensada específicamente para ejecutar el modelo completo, con torre de visión y caché KV, en una única GPU de 24 GB (RTX 4090). El objetivo declarado es preservar contexto largo con capacidades multimodales dentro de ese presupuesto de VRAM.

Técnicamente es un transformer multimodal (texto e imagen) de 31B parámetros en precisión original, comprimido a 4.00 bpw en pesos, `lm_head` y torre de visión (190 capas lineales), manteniendo los embeddings en BF16. La caché KV también puede cuantizarse a 4 bits, lo que permite un pool de contexto de aproximadamente 179K–194K tokens con visión activada en una RTX 4090.

Su relevancia es de nicho: no es un modelo nuevo ni un entrenamiento, sino un artefacto de despliegue para ExLlamaV3 y TabbyAPI. No funciona en Transformers, vLLM ni llama.cpp, y su principal atractivo es la combinación de contexto largo, visión y ausencia de filtros de rechazo en hardware de consumo. El autor advierte que el contador de parámetros de Hugging Face muestra "9B" por cómo cuenta los tensores empaquetados de EXL3, pero el modelo subyacente es el de 31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) del modelo base Gemma 4 31B; cuantizado con EXL3 (ExLlamaV3) |
| Parametros totales | 31B en el modelo base; el contador de safetensors del repo indica 9.256.091.884 por el empaquetado EXL3 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~179K–194K tokens con visión activada y caché KV 4-bit en RTX 4090; 206.848 tokens con visión desactivada |
| Tipos de cuantizacion | EXL3 4.00 bpw (pesos, `lm_head` 4-bit, torre de visión 4-bit, embeddings BF16); caché KV configurable en 4,4 / 6,6 / 8,8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors EXL3 (3 shards, 18.512.570.877 bytes / 17,24 GiB) |

## Arquitectura y entrenamiento
El modelo base es Gemma 4 31B en variante instruct, con pipeline `image-text-to-text`, es decir, un transformer multimodal que procesa texto e imágenes. Sobre él se aplicó un proceso de "abliteration" o "heretic" (eliminación de direcciones de rechazo en el espacio de activaciones) para producir la versión `uncensored-heretic` de llmfan46. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada.

La contribución de este repositorio es puramente de cuantización. Se generó con ExLlamaV3 1.6.3 (rueda de release), con pesos a 4.00 bpw, `lm_head` a 4 bits, torre de visión a 4 bits y embeddings sin cuantizar en BF16. El codebook es `mul1` con `out_scales` automáticos y la calibración usó el conjunto por defecto de ExLlamaV3 (250 filas × 2048 columnas). Existen ramas alternativas reexportadas con ExLlamaV3 1.6.0 y 1.6.6; la rama `main` permanece en 1.6.3. El autor reporta que los ficheros de 1.6.3 obtienen un KL ligeramente peor que los de 1.6.0 (0,0268 frente a 0,0262) con el mismo tamaño y velocidad.

## Capacidades
- Generación de texto conversacional con plantilla de prompt `gemma4`.
- Procesamiento de imágenes (image-text-to-text) con torre de visión cuantizada a 4 bits.
- Contexto largo: se ha verificado una prompt de tipo "needle" de 125K tokens que recuperó su respuesta correctamente.
- Soporte de tool calling / function calling (probado según la model card).
- Razonamiento multi-turno y conversaciones con historial extenso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "sin censura" (abliterated): ausencia de los mecanismos de rechazo del modelo instruct original.
- No dispone de modo "thinking" explícito documentado ni de capacidades de audio en la información disponible.

## Casos de uso
- Análisis de documentos largos con imágenes intercaladas: gracias a un pool de contexto de ~179K–194K tokens con visión activa, se pueden procesar informes, contratos o manuales completos junto con sus figuras en una sola pasada sobre una RTX 4090.
- Asistente conversacional local sin filtros: para entornos de investigación donde se necesita explorar respuestas sin rechazos del modelo, con despliegue en TabbyAPI y una única GPU de consumo.
- Procesamiento de capturas de pantalla y UI: la torre de visión a 4 bits permite describir o razonar sobre imágenes de interfaz en flujos de automatización, aunque el autor no ha medido la calidad de imagen.
- Agentes con tool calling: la model card confirma que las llamadas a herramientas pasan en las pruebas, lo que permite integrarlo en pipelines de agentes que consultan APIs o ejecutan acciones.
- Recuperación en contextos masivos (RAG de contexto largo): con 125K tokens verificados en pruebas de aguja en pajar, es adecuado para inyectar grandes bloques de documentación sin trocear.
- Inferencia local en hardware de consumo: con 18,5 GB de descarga y ~21,9 GB en reposo en una RTX 4090, sirve para prototipado y demos privadas sin depender de la nube.
- Investigación sobre alineación y abliteration: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo en tareas controladas.

## Benchmarks y rendimiento
| Metrica | Este quant (4.00bpw-h4-vb4, 1.6.3) | 4.00bpw-h6 | 4.50bpw-h8 | BF16 |
|---|---|---|---|---|
| KL mean vs original | 0,0268 | 0,0262 | 0,0181 | — |
| KL median | 0,0047 | 0,0041 | 0,0029 | — |
| KL p90 | 0,0456 | 0,0407 | 0,0303 | — |
| Perplejidad (WikiText-2) | 16,514 | 16,655 | 16,624 | 16,586 |
| Tamano de descarga | 18,5 GB | 19,0 GB | 21,2 GB | — |
| Contexto en RTX 4090 | ~194K con visión | ~139K sin visión | 70K–121K | — |

Coste de la caché KV (KL mean, `model_diff.py` sobre WikiText-2): 0,420 con caché FP16 y 0,528 con caché 4,4 para este quant; el autor señala que la caché de 4 bits añade aproximadamente un cuarto más de deriva que una caché de precisión completa. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: ~21,9 GB en reposo en una RTX 4090 con pool de 179.200 tokens; pico de 23.733 MiB con una prompt de 125K tokens.
- GPU recomendadas: RTX 4090 (24 GB) es el objetivo declarado; cabe en GPUs de 24 GB en general. No se documentan pruebas en A100/H100.
- Cabe en GPU de consumo: sí, en RTX 4090 con 24 GB; con visión desactivada se puede subir el pool a 206.848 tokens.
- Despliegue: exclusivamente TabbyAPI o ExLlamaV3. No funciona en Transformers, vLLM ni llama.cpp. Requiere ExLlamaV3 1.6.3 (probado también en 1.5.3 para texto e imagen).
- Configuración de referencia: `max_seq_len: 64000`, `cache_size: 194560`, `cache_mode: 4,4`, `chunk_size: 1024`, `max_batch_size: 2`, `vision: true`, `prompt_template: gemma4`.
- Rendimiento: 46 tok/s con prompt corto y 43 tok/s a 32K tokens en una RTX 4090.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este quant (4.00bpw-h4-vb4) | 31B (EXL3 4.00 bpw) | ~194K con visión | 0,0268 | Apache 2.0 | Hugging Face, solo ExLlamaV3/TabbyAPI |
| 4.00bpw-h6 (mismo autor) | 31B (EXL3 4.00 bpw) | ~139K sin visión | 0,0262 | Apache 2.0 | Hugging Face, solo ExLlamaV3/TabbyAPI |
| 4.50bpw-h8 (mismo autor) | 31B (EXL3 4.50 bpw) | 70K–121K | 0,0181 | Apache 2.0 | Hugging Face, solo ExLlamaV3/TabbyAPI |
| Gemma 4 31B it uncensored heretic (BF16) | 31B | no disponible | referencia | Apache 2.0 | Hugging Face, BF16 |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias
- Solo se ejecuta en ExLlamaV3 y TabbyAPI; no es compatible con Transformers, vLLM ni llama.cpp, lo que limita su integración en stacks habituales.
- La cuantización a 4 bits introduce deriva respecto al BF16 (KL 0,0268); la caché KV de 4 bits añade un cuarto más de deriva, y los modos 6,6 y 8,8 no fueron probados en este quant.
- La calidad de imagen no está medida; solo se verificó que la torre de visión carga y responde.
- Al ser una variante "abliterated", carece de los mecanismos de rechazo del modelo original; puede generar contenido inapropiado y requiere supervisión en producción.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de fiabilidad.
- Idiomas soportados no documentados.
- El contador de parámetros de Hugging Face (9B) es engañoso por el empaquetado EXL3; el modelo real es de 31B.
- La licencia Apache 2.0 remite a la licencia de Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial.
- No es el mismo modelo que `sjoe1244/gemma-4-31B-it-heretic-exl3-4.00bpw-h6` (variante coder3101).

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.00bpw-h4-vb4
- Modelo base: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Rama ExLlamaV3 1.6.0: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.00bpw-h4-vb4/tree/exl3-1.6.0
- Rama ExLlamaV3 1.6.6: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.00bpw-h4-vb4/tree/exl3-1.6.6
- Quant alternativo 4.00bpw-h6: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.00bpw-h6
- Quant alternativo 4.15bpw-h6: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.15bpw-h6
- Quant alternativo 4.50bpw-h8: https://huggingface.co/sjoe1244/gemma-4-31B-it-uncensored-heretic-exl3-4.50bpw-h8
- Variante coder3101: https://huggingface.co/sjoe1244/gemma-4-31B-it-heretic-exl3-4.00bpw-h6
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
