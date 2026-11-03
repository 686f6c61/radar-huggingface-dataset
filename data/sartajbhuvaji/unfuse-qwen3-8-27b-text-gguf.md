# sartajbhuvaji/unfuse-Qwen3.8-27B-text-GGUF

## Resumen

unfuse-Qwen3.8-27B-text-GGUF es una cuantización en formato GGUF del modelo `sartajbhuvaji/unfuse-Qwen3.8-27B-text`, una variante de Qwen3.8-27B a la que se le ha eliminado la torre de visión para dejar únicamente el tronco de texto. El modelo original procede de `Qwen/Qwen3.8-27B`, desarrollado por el equipo Qwen de Alibaba, y se distribuye bajo licencia Apache 2.0. Esta versión GGUF la publica el usuario sartajbhuvaji como parte de su colección "unfuse", orientada a separar componentes multimodales en artefactos independientes.

El interés principal de esta publicación es práctico: ofrece tres niveles de cuantización (Q8_0, Q5_K_M y Q4_K_M) generados a partir de un GGUF en bf16 con llama.cpp, con verificación de perplejidad sobre wikitext-2 y comprobaciones puntuales de respuestas verificables. Con 27.320.697.856 parámetros totales y una arquitectura identificada como `qwen35` de 866 tensores, el modelo está pensado para inferencia local y despliegue en llama.cpp, no para servir como referencia de rendimiento en bruto.

La relevancia es doble: por un lado, permite ejecutar un modelo de ~27B en hardware de consumo con pérdidas de perplejidad muy contenidas (hasta +0,69 % en Q4_K_M); por otro, el hecho de que la torre de visión se haya separado en un proyector aparte (`unfuse-Qwen3.8-27B-mmproj-GGUF`) permite combinar texto e imagen de forma modular. No obstante, la información publicada sobre contexto, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, identificada como `qwen35` en llama.cpp (866 tensores, incluye bloque de predicción multi-token como bloque 64) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (29,1 GB), Q5_K_M (19,5 GB), Q4_K_M (16,8 GB); el GGUF de origen es bf16 (no f16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp, commit `d02b4c0d66796e0a44380611d038123fefb9fe83`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso etiquetado como `qwen35` por el conversor de llama.cpp. El repositorio GGUF contiene 866 tensores e incluye explícitamente un bloque de predicción multi-token (multi-token prediction, MTP) como bloque 64, lo que sugiere que el modelo base incorpora decodificación especulativa nativa o un cabezal auxiliar de predicción de tokens. El modelo del que deriva es Qwen3.8-27B, al que se le ha eliminado la torre de visión; según la model card, el split de solo texto es byte-exacto en todos los tensores que conserva, y la procedencia de los pesos es `Qwen/Qwen3.8-27B` bajo Apache 2.0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta la longitud de contexto nativa ni detalles sobre atención (si usa atención lineal, sliding window u otro esquema). La única innovación técnica verificable en esta publicación es el propio proceso de "unfuse": separar la torre de visión del tronco de texto y publicar el proyector multimodal como artefacto independiente, de modo que el modelo de texto pueda desplegarse sin cargar pesos de visión.

## Capacidades

- Generación de texto conversacional y de un solo turno (la model card muestra ejemplos con `llama-cli` y la bandera `--single-turn`).
- Razonamiento básico y respuestas verificables: la model card confirma aciertos en preguntas con respuesta comprobable (capital de Francia, `84 * 3 / 2`, una traducción al alemán) en las tres cuantizaciones.
- Capacidad multimodal condicionada: con el proyector `unfuse-Qwen3.8-27B-mmproj-GGUF` y `llama-mtmd-cli` puede procesar imágenes; la model card documenta una prueba con una imagen de un gato y respuesta correcta ("cat").
- Multilingüe limitado a inglés y chino según los metadatos del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo: con Q4_K_M (16,8 GB) el modelo cabe en GPUs de consumo de gama alta y permite generar texto sin conexión, usando `llama-cli -m ... -ngl 99`. Es adecuado porque la pérdida de perplejidad frente a bf16 es de solo +0,69 %.
- Asistente conversacional de escritorio: el modelo acepta prompts multi-turno y la bandera `-st` evita que `llama-cli` espere entrada por stdin, lo que facilita integrarlo en scripts y automatizaciones locales.
- Traducción y generación bilingüe inglés-chino: los metadatos declaran soporte para `en` y `zh`, y la model card valida una traducción al alemán como prueba de respuesta verificable, lo que sugiere cierta generalización más allá de los idiomas declarados.
- Procesamiento de documentos con OCR asistido: combinando el GGUF de texto con el proyector `mmproj` en `llama-mtmd-cli`, se puede describir o extraer información de imágenes y capturas sin cargar un modelo multimodal completo.
- Despliegue en pipelines de CI/CD para validación de prompts: al ser un GGUF ligero y con pérdida de calidad medida, se puede usar como modelo de referencia para comprobar que cambios en prompts o plantillas no degradan las respuestas esperadas (preguntas con respuesta comprobable).
- Prototipado de aplicaciones de razonamiento y matemáticas básicas: las pruebas documentadas con `84 * 3 / 2` y preguntas de conocimiento general indican que el modelo mantiene respuestas correctas tras la cuantización, útil para demos y pruebas de concepto.
- Servicio de generación de texto de baja concurrencia: al no haberse medido el throughput de servicio, es adecuado para entornos de un solo usuario o pocas peticiones simultáneas, no para serving de alta carga.

## Benchmarks y rendimiento

La model card solo publica perplejidad sobre el conjunto de test completo de wikitext-2 con contexto 512, medida con `llama-perplexity`:

| Modelo / cuantización | Perplejidad (wikitext-2, ctx 512) | Variación vs bf16 |
|---|---|---|
| BF16 (GGUF de referencia) | 6,6497 | — |
| Q8_0 | 6,6514 | +0,03 % |
| Q5_K_M | 6,6746 | +0,37 % |
| Q4_K_M | 6,6959 | +0,69 % |

Además, la model card indica que el modelo en safetensors obtiene 6,6516 en el mismo texto con el mismo troceado, frente a 6,6497 del GGUF bf16, y que el token top-1 coincide en siete prompts, incluido uno de 1.259 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere aproximadamente 29,1 GB de pesos; Q5_K_M, 19,5 GB; Q4_K_M, 16,8 GB. Añadir margen para la caché KV según la longitud de contexto efectiva (no documentada).
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q5_K_M, una RTX 4090 (24 GB) o A6000; para Q4_K_M, una RTX 4090, RTX 3090 o similar con 24 GB, con margen para contexto.
- Cabe en GPU de consumo: sí, Q4_K_M y Q5_K_M en tarjetas de 24 GB; Q8_0 queda fuera del rango de consumo habitual.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` con proyector), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no medidos en la model card; el autor indica explícitamente que el throughput de servicio de este GGUF no se ha comprobado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| unfuse-Qwen3.8-27B-text-GGUF | 27,32 B | no disponible | Apache 2.0 | GGUF (Q8_0, Q5_K_M, Q4_K_M) | Variante sin torre de visión; perplejidad medida en wikitext-2 |
| Qwen/Qwen3.8-27B | 27,32 B (según derivado) | no disponible | Apache 2.0 | safetensors | Modelo original multimodal completo; incluye visión |
| unfuse-Qwen3.8-27B-text | 27,32 B | no disponible | Apache 2.0 | safetensors | Split de solo texto en bf16, byte-exacto en tensores conservados |
| unfuse-Qwen3.8-27B-mmproj-GGUF | no disponible (proyector) | no disponible | no disponible | GGUF | Proyector multimodal para usar junto al modelo de texto |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La torre de visión se ha eliminado del modelo de texto; para tareas de imagen es imprescindible cargar el proyector `unfuse-Qwen3.8-27B-mmproj-GGUF` por separado con `llama-mtmd-cli`.
- El conversor de llama.cpp emite `Unknown RoPE type: default`; el autor argumenta que no afecta al resultado (perplejidad y top-1 coincidentes), pero es un caveat a vigilar en despliegues con contextos largos.
- Idiomas declarados limitados a inglés y chino; el rendimiento en castellano no está documentado y podría degradarse.
- No se ha verificado la calidad de visión con el proyector más allá de una única imagen de prueba.
- No se ha medido el throughput de servicio ni el comportamiento bajo concurrencia; no se recomienda para serving de alta carga sin pruebas propias.
- No hay datos sobre sesgos, alucinación o robustez frente a prompts adversarios; al derivar de Qwen3.8-27B, hereda los sesgos del modelo original, no documentados aquí.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y del proyector, cuya licencia no se especifica en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-text-GGUF
- Modelo base (solo texto, safetensors): https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-text
- Proyector multimodal GGUF: https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-mmproj-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección unfuse: https://huggingface.co/collections/sartajbhuvaji/unfuse-6ae8b265e63951518e4e75cc
- Repositorio GitHub del proyecto unfuse: https://github.com/SartajBhuvaji/unfuse
- Notebooks de benchmarks del modelo base: https://github.com/SartajBhuvaji/unfuse/tree/main/notebooks/qwen3.8-27b
