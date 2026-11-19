# RUC-AIBOX/AutoMaster-doc2repo-9b

## Resumen

AutoMaster-doc2repo-9b es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) publicado por el colectivo RUC-AIBOX en Hugging Face. Se trata de un ajuste fino supervisado (SFT) orientado a la tarea de conversión de documentación a repositorio de código ("doc2repo"), derivado de la familia Qwen 3.5 según la etiqueta de arquitectura `qwen3_5` del repositorio. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 18,8 GB.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino un checkpoint experimental resultante de un pipeline de entrenamiento interno (AutoTrain) con nombre de experimento que referencia las variantes `qwen35_9b` y `deepseek_v4_pro`, y una ronda de entrenamiento (`round_002`, `SFT step 48`). La model card documenta una puntuación de 40,79 ± 3,21 % en la métrica interna del experimento, sin especificar qué benchmark o conjunto de evaluación corresponde a esa cifra.

Conviene subrayar que la información pública es mínima: no se declara licencia, no se listan idiomas soportados, no hay pipeline asignado y el repositorio registra cero descargas y cero "likes" en el momento de la consulta. La model card está redactada mayoritariamente en chino y describe el proceso de archivo y verificación de los pesos, no las capacidades del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 18,8 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5 con aproximadamente 9 mil millones de parámetros. No se dispone de información pública sobre el número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa, lineal o híbrida) ni sobre el tokenizador más allá de que se conserva el original del export. El repositorio incluye tokenizer, chat template y configuraciones tal como se exportaron del checkpoint de entrenamiento.

El entrenamiento documentado es un ajuste fino supervisado (SFT) en el paso global 48, dentro de la ronda exterior 2 (`round_002`) de un pipeline AutoTrain cuyo identificador de experimento incluye referencias a `qwen35_9b`, `deepseek_v4_pro`, `codex` y `skill_512`. La model card indica que el índice de safetensors contiene 15 entradas `mtp.*` (multi-token prediction) que no fueron exportadas como shards reales, y que el archivo preserva ese estado original sin fabricar pesos ni reescribir el índice. No se realizaron pruebas de carga o inferencia tras el archivado, por lo que la compatibilidad de carga queda pendiente de verificación por parte del usuario.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen 3.5, no documentadas explícitamente en la model card.
- Generación de código y conversión de documentación a repositorio: es la tarea declarada del ajuste fino (`doc2repo`), aunque no se detallan formatos de entrada/salida ni métricas específicas de calidad del código generado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está en chino pero no se declaran idiomas soportados.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible; el repositorio no incluye componentes multimodales declarados.

## Casos de uso

- Generación automática de esqueletos de repositorio a partir de documentación técnica: el modelo se entrenó específicamente para la tarea `doc2repo`, por lo que su uso natural es transformar especificaciones o README en estructuras de proyecto con archivos y código inicial.
- Prototipado de pipelines de documentación como código: integrado en herramientas internas que conviertan guías de API en ejemplos ejecutables, aprovechando el ajuste SFT sobre la familia Qwen 3.5.
- Evaluación comparativa de técnicas de SFT: al ser un checkpoint experimental con métrica interna documentada (40,79 ± 3,21 %), sirve como referencia en estudios sobre ajuste fino de modelos de ~9B para tareas de código.
- Investigación sobre multi-token prediction (MTP): el repositorio conserva entradas `mtp.*` en el índice, lo que lo hace útil para estudiar la exportación e integridad de checkpoints con cabezas MTP.
- Base para ajustes posteriores en dominios de ingeniería de software: al partir de un modelo de ~9B en safetensors, puede reutilizarse como punto de partida para SFT o LoRA en tareas afines.
- Reproducción de experimentos de AutoTrain: el identificador de experimento y la ruta de origen documentados permiten trazar la procedencia del checkpoint en entornos de investigación reproducibles.

## Benchmarks y rendimiento

La única métrica publicada es la del experimento interno: 40,79 ± 3,21 % en la ronda exterior 2, paso SFT 48. No se especifica el benchmark, el conjunto de evaluación ni la métrica concreta, por lo que no es comparable con resultados públicos de MMLU, HumanEval o GSM8K.

| Benchmark | Resultado | Notas |
|---|---|---|
| Métrica interna del experimento (sin especificar) | 40,79 ± 3,21 % | Ronda R2, SFT step 48; benchmark no identificado |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 19-20 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10-11 GB de pesos, con margen recomendado de 16 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, con margen recomendado de 8-12 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 son adecuadas para BF16 con contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en BF16 con contexto moderado; RTX 3090 (24 GB) similar; tarjetas de 16 GB requieren cuantización a 8 bits; tarjetas de 8-12 GB requieren cuantización a 4 bits.
- Opciones de despliegue: vLLM o TGI para safetensors en BF16; llama.cpp u Ollama requieren conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles; además, la model card advierte de que no se realizaron pruebas de carga ni de inferencia tras el archivado, por lo que la compatibilidad debe validarse antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AutoMaster-doc2repo-9b | 9,41 B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint SFT experimental para doc2repo |
| Qwen 2.5 Coder 7B | 7,6 B | 128 K (según versión) | Apache 2.0 (modelo base Qwen 2.5) | Amplia, muy descargado | Alternativa consolidada para tareas de código |
| Qwen 2.5 Coder 14B | 14,7 B | 128 K (según versión) | Apache 2.0 (modelo base Qwen 2.5) | Amplia | Mayor capacidad a costa de más VRAM |
| CodeLlama 7B / 13B | 6,7 B / 13 B | 16 K | Llama 2 Community License | Amplia | Referencia clásica en generación de código |

La comparación con modelos de la familia Qwen 3.5 no está disponible porque no se han publicado especificaciones de esa familia en la información proporcionada. Las cifras de los modelos alternativos corresponden a datos públicos habituales y deben contrastarse con las fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: aunque el modelo base probablemente sea multilingüe, no hay confirmación oficial en la ficha.
- Métrica interna sin contexto: el 40,79 ± 3,21 % no es interpretable sin conocer el benchmark, el conjunto de evaluación y la métrica exacta.
- Integridad del checkpoint: el índice de safetensors referencia 15 entradas `mtp.*` sin shards exportados; algunas herramientas de carga pueden fallar o ignorar esas entradas. La model card confirma que no se probó la carga ni la inferencia.
- Riesgo de alucinación: inherente a los modelos generativos de ~9B; no hay evaluación publicada de fidelidad en la tarea doc2repo.
- Sesgos: no documentados; al desconocerse la composición del dataset de SFT, no es posible evaluar sesgos de dominio, idioma o código.
- Madurez: repositorio con cero descargas y cero interacciones, sin pipeline declarado ni demo; no es un artefacto validado por la comunidad.
- Contexto desconocido: no se puede planificar el uso en documentos largos sin confirmar la longitud de contexto del modelo base.
- Fecha de creación futura (2026-11-19): conviene verificar la autenticidad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/RUC-AIBOX/AutoMaster-doc2repo-9b
- README general del proyecto (referenciado en la model card como `../../README.md`): no disponible como URL pública en la información proporcionada
- `MODEL_STATUS.json` del repositorio: no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles
