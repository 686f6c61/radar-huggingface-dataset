# Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit

## Resumen

LFM3-VL 2B Heretic MLX 4-bit es una cuantización de 4 bits en formato MLX del checkpoint LFM3-VL 2B Heretic, un modelo visión-lenguaje de la familia LFM3-VL de Liquid AI, adaptado por el usuario Lucasgitguy-co. El modelo original parte de LiquidAI/LFM3-VL-2B y ha sido modificado mediante técnicas de "abliteración" (el sufijo *heretic* es habitual en las variantes que eliminan o atenúan mecanismos de rechazo), aunque la model card no documenta el procedimiento exacto aplicado. El resultado es un modelo *image-text-to-text* conversacional de aproximadamente 1.918 millones de parámetros, empaquetado en un único `model.safetensors` de 1,352 GB en cuantización afín de 4 bits con grupo de 64.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo multimodal de ~2B parámetros en Apple Silicon con un consumo de memoria muy reducido, lo que lo hace apto para prototipado local y despliegue en portátiles con chip M-series. Por otro, ilustra el ecosistema de derivados comunitarios sobre modelos abiertos: cuantizaciones, variantes "heretic" y formatos alternativos (GGUF, MLX) que amplían la accesibilidad del modelo base. La licencia LFM Open License v1.0 impone restricciones de uso comercial que se heredan en todas las derivadas.

Conviene subrayar que la model card del repositorio es explícita: describe los ficheros y la configuración, pero no documenta datos de entrenamiento, procedimiento ni resultados de benchmarks. Cualquier afirmación sobre calidad debe tratarse con cautela y verificarse contra el modelo base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afín (affine), grupo de 64; solo se publica la variante MLX 4-bit en este repo (existe también GGUF en repo separado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (restricciones de uso comercial en derivadas) |
| Formato de pesos | `safetensors` en formato MLX (librería `mlx`), 1,352 GB |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3-VL de Liquid AI, diseñada para entrada de imagen y texto y salida de texto. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, codificador visual, etc.), por lo que no es posible describirla con rigor. Lo que sí se sabe es que se trata de un transformer multimodal de aproximadamente 1,92 mil millones de parámetros y que el pipeline declarado es `image-text-to-text` con etiqueta `conversational`.

Respecto al entrenamiento, la model card indica explícitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". No hay datos sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa. El proceso de "heretic" (abliteración) tampoco está documentado: no se especifica qué capas o direcciones se modificaron ni con qué metodología. La cuantización MLX 4-bit con grupo de 64 es una transformación post-entrenamiento estándar de compresión de pesos, no un cambio arquitectónico.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes y respuesta en lenguaje natural en inglés.
- Conversación multimodal: el tag `conversational` sugiere soporte de diálogo, aunque no se detalla el formato de prompt ni el manejo de historial.
- Ejecución local en Apple Silicon mediante MLX y MLX-VLM.
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles en la información proporcionada.

## Casos de uso

- **Prototipado local de asistentes visuales en Mac**: cargar el modelo con MLX-VLM en un MacBook con chip M-series permite experimentar con un VLM de ~2B parámetros sin GPU dedicada, gracias a los 1,35 GB de pesos en 4 bits.
- **Descripción automática de imágenes en inglés**: integrar el modelo en un script de procesamiento por lotes que reciba imágenes y genere descripciones o alt-text en inglés para catálogos, archivos fotográficos o pipelines de accesibilidad.
- **Extracción de información de capturas y documentos escaneados**: usar el modelo como extractor de campos simples (fechas, importes, nombres) en flujos de digitalización de baja criticidad, donde el coste de un error es bajo y se prefiere ejecución local.
- **Chatbot multimodal de demostración**: construir una demo interactiva en local que acepte una imagen y mantenga una conversación breve sobre ella, útil para validar UX antes de invertir en modelos mayores.
- **Evaluación comparativa de cuantizaciones**: emplear esta versión 4-bit junto al checkpoint original y la variante GGUF para medir la degradación introducida por la cuantización en tareas concretas del dominio propio.
- **Investigación sobre alineación y rechazo**: al ser una variante "heretic", sirve como material de estudio para analizar cómo cambia el comportamiento del modelo respecto al base en prompts sensibles, siempre dentro de los términos de la licencia.
- **Generación de datasets sintéticos imagen-texto**: producir pares imagen-descripción en inglés para preentrenar o afinar otros modelos, asumiendo revisión humana posterior por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación no están documentados en los artefactos inspeccionados, y no se dispone de métricas propias de esta cuantización.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: los pesos ocupan 1,352 GB; con overhead de activaciones, KV cache y el codificador visual, se puede asumir un consumo del orden de 2 a 3 GB en 4 bits, aunque no hay mediciones publicadas.
- **GPU recomendadas**: el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es un formato para CUDA; para GPU NVIDIA conviene usar la variante GGUF o los pesos originales.
- **¿Cabe en GPU de consumo?**: sí, en cualquier Mac con Apple Silicon y memoria unificada de 8 GB o más; también cabría en GPUs de consumo con 4-6 GB de VRAM si se convirtiera a otro formato.
- **Opciones de despliegue**: MLX y MLX-VLM (requiere una versión con soporte para LFM3-VL); la variante GGUF del mismo autor permite llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles; dependen del chip, de la longitud de contexto y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| LFM3-VL 2B Heretic MLX 4-bit (este) | ~1,92 B | No disponible | LFM Open License v1.0 | MLX safetensors 4-bit, 1,35 GB |
| LFM3-VL 2B Heretic (base) | ~1,92 B | No disponible | LFM Open License v1.0 | Pesos originales en safetensors |
| LFM3-VL 2B Heretic GGUF | ~1,92 B | No disponible | LFM Open License v1.0 | GGUF, para llama.cpp/Ollama |
| LiquidAI/LFM3-VL-2B (upstream) | ~1,92 B | No disponible | LFM Open License v1.0 | Pesos oficiales de Liquid AI |

La comparación relevante es entre formatos del mismo modelo, no frente a arquitecturas distintas: no se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes. Para elegir entre MLX, GGUF y pesos originales, el criterio práctico es el hardware de destino (Apple Silicon frente a CPU/NVIDIA) y el soporte del runtime.

## Limitaciones y advertencias

- **Licencia restrictiva**: la LFM Open License v1.0 impone limitaciones de uso comercial que se aplican también a las cuantizaciones y derivadas; no es un modelo Apache-2.0. Revisar el fichero LICENSE antes de cualquier uso en producción.
- **Procedencia "heretic" no documentada**: se desconoce qué modificación de alineación se aplicó, qué comportamiento se alteró y con qué evaluación se validó. No hay garantía de que el modelo mantenga salvaguardas del original.
- **Riesgo de alucinación**: en modelos de ~2B parámetros con entrada visual, la probabilidad de describir elementos inexistentes en la imagen es alta; requiere validación humana en cualquier flujo crítico.
- **Solo inglés**: el campo `language: en` limita el uso a ese idioma; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- **Contexto desconocido**: no se publica la longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- **Sin benchmarks**: no hay métricas que respalden afirmaciones de calidad; cualquier comparación con otros VLMs debe hacerse con evaluación propia.
- **Formato específico**: los pesos MLX requieren un loader compatible (MLX-VLM con soporte LFM3-VL); no son cargables directamente en transformers estándar ni en vLLM/TGI.
- **Mantenimiento comunitario**: el repositorio lo publica un usuario individual, con 115 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte ni actualizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Modelo base (heretic, pesos originales): https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Modelo upstream de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Guía de estructura de ficheros: `docs/FILE_STRUCTURE.md` (en el repositorio)
- Procedencia y reproducibilidad: `docs/PROVENANCE.md` (en el repositorio)
- Historial de versiones: `CHANGELOG.md` (en el repositorio)
- Licencia LFM Open License v1.0: `LICENSE` (en el repositorio)
