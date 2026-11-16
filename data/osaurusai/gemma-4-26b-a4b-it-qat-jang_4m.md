# OsaurusAI/gemma-4-26B-A4B-it-qat-JANG_4M

## Resumen

OsaurusAI/gemma-4-26B-A4B-it-qat-JANG_4M es una conversión al formato MLX del modelo google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, una variante de Gemma 4 con arquitectura MoE (26B parámetros totales, ~4B activos según el sufijo A4B) e instrucción afinada, publicada por Google. La conversión la firma OsaurusAI, un tercero que redistribuye el modelo en un bundle de cuantización afín mixta denominado JANG_4M, optimizado para ejecución en Apple Silicon mediante la librería MLX.

El interés de esta ficha reside en que permite ejecutar localmente un modelo multimodal (texto e imagen) de 25,8 mil millones de parámetros en hardware de Apple con un peso en disco de 36 GB, gracias a una cuantización por capas: atención y router en 8 bits, MLP y expertos en 4 bits, y embeddings, normas y torres multimodales en fp16. No es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue que preserva las capacidades del checkpoint original de Google.

Es relevante ahora porque la familia Gemma 4 incorpora decodificación especulativa y arquitectura MoE, y este bundle demuestra que es viable llevar ese tipo de modelos a portátiles y estaciones de trabajo Mac sin GPU dedicada, a costa de depender de un cargador MLX compatible con las extensiones de cuantización JANG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 / Gemma4ForConditionalGeneration (transformer MoE con torre de visión) |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | ~4B (según el sufijo A4B del nombre; dato no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_4M: atención 8 bits, router 8 bits, MLP/expertos 4 bits, embeddings 16 bits, capas multimodales 16 bits; group_size=32, modo affine |
| Idiomas soportados | en (inglés; según metadatos) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors en formato jang_affine (MLX), 18 shards |
| Capas de texto | 30 |
| Hidden size | 2816 |
| Modulos cuantizados | 295 bases afines con sidecars .scales y .biases |
| Tamano del repo | 36,0 GB |
| Modelo base | google/gemma-4-26B-A4B-it-qat-q4_0-unquantized |
| MTP / drafter especulativo | no incluido (mtp: none) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 en su variante condicional para generación multimodal, con 30 capas de texto, tamaño oculto de 2816 y una arquitectura de mezcla de expertos (MoE) en la que solo se activa una fracción de los parámetros por token (el sufijo A4B sugiere ~4B activos de 26B totales). Incluye una torre de visión para entrada image-text-to-text y un procesador multimodal propio (processor_config.json preservado). El checkpoint de origen es la versión QAT (quantization-aware training) de Google, es decir, el modelo fue entrenado teniendo en cuenta la cuantización para reducir la pérdida de calidad al comprimirlo.

Esta conversión concreta no entrena nada nuevo: transforma los pesos del checkpoint QAT en un bundle MLX con cuantización afín mixta por tipo de módulo. Los embeddings de entrada/salida, las normas, las torres y embedders multimodales y los tensores por capa de embedding/gate/proyector de Gemma 4 se mantienen en fp16 (passthrough), mientras que las proyecciones de auto-atención y del router MoE pasan a 8 bits y el grueso del MLP y los expertos a 4 bits. No se incluyen pesos de drafter especulativo (MTP), por lo que cualquier decodificación especulativa dependería de un drafter externo no empaquetado. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional e instrucciones (variante `-it`).
- Comprensión de imágenes y respuesta en texto (pipeline image-text-to-text); la configuración de visión está presente y preservada.
- Razonamiento y matemáticas: capacidades esperables de la familia Gemma 4, aunque no se aportan benchmarks en la información disponible.
- Generación de código: no confirmada explícitamente en la información proporcionada.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Multilingüismo: limitado a inglés según los metadatos (`language: en`).
- Audio: no soportado en esta variante (`audio_config` vacío).
- Vídeo: no se declara una ruta de ejecución verificada (sin `video_config`).
- Plantilla de chat de Gemma 4 parcheada en `tokenizer_config.json`, con `bos_token_id`, `eos_token_id` y `pad_token_id`.

## Casos de uso

- Asistente local en Mac: ejecutar un modelo de 25,8B con capacidades de visión en un Apple Silicon con 36 GB de pesos en disco y cuantización 4/8 bits, útil para prototipos sin conexión y sin GPU dedicada.
- Análisis de documentos con imágenes: extraer y describir información de capturas, diagramas o formularios combinando la torre de visión con generación de texto, aprovechando el procesador multimodal preservado.
- Chat multi-turno en inglés: la variante instruct y la plantilla de chat parcheada permiten conversaciones de asistente con historial, siempre que el runtime MLX cargue correctamente el template.
- Investigación en cuantización: el bundle sirve como caso de estudio de cuantización afín mixta por módulo (atención/router 8 bits, MLP 4 bits, embeddings 16 bits) para medir degradación frente al checkpoint QAT original.
- Despliegue en estaciones de trabajo Apple para evaluación interna: comparar calidad del bundle JANG_4M contra el modelo base de Google en tareas de visión y texto antes de decidir una integración.
- Desarrollo de aplicaciones MLX: validar cargadores compatibles con `jang_config.json`, overrides de `quantization` en `config.json` y ficheros de procesador/chat-template de Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco: 36,0 GB (18 shards safetensors); se recomienda al menos ese espacio libre más margen para caché y contexto.
- Memoria unificada: al ser MLX sobre Apple Silicon, la VRAM es la memoria unificada del sistema; con 36 GB de pesos en 4/8 bits, un Mac con 48 GB o 64 GB de memoria unificada es el mínimo realista, y 64 GB o más da margen para contexto y visión.
- GPU recomendadas: Apple Silicon (series M2/M3/M4 Pro, Max y Ultra). No está pensado para CUDA; no se documenta soporte en A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? En el sentido de GPU dedicada, no se declara; en Apple Silicon de gama alta con memoria unificada suficiente, sí.
- Opciones de despliegue: MLX / vMLX con cargador compatible con Gemma 4 y las extensiones JANG (`jang_config.json`, overrides de cuantización). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-26B-A4B-it-qat-JANG_4M | ~25,8B (MoE, ~4B activos) | no disponible | MLX jang_affine | gemma | Bundle de terceros para Apple Silicon, visión |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | ~25,8B (MoE, ~4B activos) | no disponible | safetensors (QAT) | gemma | Checkpoint oficial de origen, sin conversión MLX |
| Otros modelos Gemma 4 de Google | no disponible | no disponible | safetensors / GGUF según variante | gemma | Alternativas oficiales de la misma familia |
| Modelos MoE de ~25B de otros proveedores | no disponible | no disponible | no disponible | variable | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es un artefacto de conversión de un tercero (OsaurusAI), no un modelo oficial de Google; la calidad depende de la fidelidad de la cuantización JANG_4M.
- Requiere un cargador MLX/vMLX compatible con Gemma 4 que entienda `jang_config.json` y los overrides de cuantización; otros runtimes no lo cargarán tal cual.
- Idiomas: solo inglés declarado; el uso en castellano no está garantizado ni evaluado.
- Sin pesos de drafter especulativo (MTP): no se puede aprovechar decodificación especulativa sin un drafter externo.
- Audio no soportado; vídeo sin ruta de ejecución verificada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan evaluaciones de fiabilidad en la información disponible.
- Licencia Gemma: uso comercial sujeto a los Gemma Terms of Use de Google; revisar obligaciones de atribución y restricciones antes de producción.
- Solo 33 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación comunitaria.
- La cuantización 4 bits en MLP/expertos puede degradar tareas sensibles (matemáticas, código) frente al checkpoint QAT original; no hay benchmarks que lo cuantifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-26B-A4B-it-qat-JANG_4M
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Sitio del autor: https://osaurus.ai
- Librería MLX: https://github.com/ml-explore/mlx
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
