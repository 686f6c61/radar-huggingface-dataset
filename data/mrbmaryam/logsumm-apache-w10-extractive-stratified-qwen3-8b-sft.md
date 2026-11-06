# mrbmaryam/logsumm-apache-w10-extractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-apache-w10-extractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte del checkpoint cuantizado en 4 bits `unsloth/Qwen3-8B-bnb-4bit` y se ha entrenado con la librería Unsloth, según indica la propia model card. El nombre del repositorio sugiere un entrenamiento orientado a resumen extractivo sobre el corpus LogSumm (o una variante denominada "apache-w10"), con un muestreo estratificado ("stratified"), aunque la model card no documenta explícitamente ni el dataset ni la metodología.

La relevancia de este modelo es limitada y de nicho: se trata de un experimento de ajuste fino publicado sin documentación técnica detallada, sin métricas de evaluación y sin descargas ni interacciones en el momento de la consulta. Resulta útil únicamente como referencia para quienes exploren recetas de SFT con Unsloth sobre Qwen3-8B para tareas de resumen, no como un modelo listo para producción.

La información disponible es escasa: la model card se limita a indicar el modelo base, la licencia y el uso de Unsloth, sin especificar hiperparámetros, composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks. Todo dato no confirmado se marca como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); detalles no disponibles en la model card |
| Parámetros totales | 8 000 millones (aproximado, según el nombre del modelo base Qwen3-8B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card (Qwen3-8B soporta hasta 32 768 tokens de forma nativa, ampliable; no confirmado para este ajuste) |
| Tipos de cuantización | El modelo base es bnb-4bit (bitsandbytes 4 bits); el repositorio publica safetensors (tamaño 0,2 GB, compatible con pesos en 4 bits o adaptadores) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer decoder-only con atención completa y mecanismos de razonamiento híbrido (modo thinking/no-thinking) propios de la familia Qwen3. El ajuste fino se realizó mediante SFT (supervised fine-tuning) utilizando Unsloth y TRL, partiendo del checkpoint `unsloth/Qwen3-8B-bnb-4bit`, que es una versión cuantizada en 4 bits del modelo original. El tamaño del repositorio (0,2 GB) sugiere que se publican únicamente los adaptadores LoRA o los pesos cuantizados, no el modelo completo en precisión nativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior ni innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento (la model card afirma "2x faster"). El nombre del repositorio indica una tarea de resumen extractivo con muestreo estratificado sobre un corpus denominado "apache-w10", pero no se aportan detalles sobre la fuente, el tamaño ni el preprocesamiento de dichos datos.

## Capacidades

- Generación de texto en inglés, con capacidad de razonamiento y comprensión lectora heredada de Qwen3-8B.
- Resumen extractivo: el nombre del modelo y la etiqueta "extractive" sugieren un ajuste específico para seleccionar fragmentos relevantes de un documento fuente, aunque no se documenta el formato de entrada/salida.
- Razonamiento multi-paso y modo "thinking": Qwen3 incorpora modos de razonamiento explícito; no se confirma si el ajuste preserva esta capacidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (Qwen3-8B lo soporta de forma nativa, pero no se ha verificado tras el ajuste).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades de agente: no documentadas.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Resumen extractivo de documentos largos en inglés: el modelo se usaría para identificar y extraer las frases o pasajes más relevantes de un texto fuente, aprovechando el ajuste específico sobre el corpus LogSumm. Adecuado en entornos donde se requiere trazabilidad literal de las fuentes citadas.
- Investigación sobre técnicas de SFT con Unsloth: sirve como referencia reproducible para estudiar recetas de ajuste fino eficiente sobre Qwen3-8B con cuantización 4 bits, comparando hiperparámetros y estrategias de muestreo estratificado.
- Generación de resúmenes para pipelines de análisis documental: integrable en flujos que procesen informes, actas o artículos en inglés y necesiten condensar información preservando fragmentos textuales.
- Prototipado de asistentes de lectura: para experimentar con la selección automática de pasajes clave en herramientas de lectura aumentada o resaltado automático.
- Evaluación comparativa de variantes de fine-tuning: el repositorio forma parte de una familia de modelos (variantes "bgl", "hybrid", etc.) que permite comparar el efecto de distintas estrategias de entrenamiento sobre la misma base.
- Docencia y experimentación académica: útil como ejemplo de publicación de adaptadores LoRA y de model cards mínimas, para discutir buenas prácticas de documentación y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ROUGE, MMLU, HumanEval, GSM8K ni evaluaciones específicas de resumen (por ejemplo, sobre CNN/DailyMail o XSum).

## Requisitos de hardware

- VRAM estimada para inferencia: al publicarse pesos en 4 bits (bnb-4bit) y un repositorio de 0,2 GB, la inferencia requiere aproximadamente 5-6 GB de VRAM para el modelo cuantizado, más el overhead de activaciones y contexto (estimación orientativa; no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia en 4 bits; A100 o H100 si se desea mayor throughput o contexto largo.
- Cabe en GPU de consumo: sí, en 4 bits cabe en GPUs con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti), siempre que se use cuantización y se limite la longitud de contexto.
- Opciones de despliegue: transformers con bitsandbytes, vLLM (si se convierte a un formato compatible), llama.cpp/Ollama (requiere conversión a GGUF), TGI (la etiqueta `text-generation-inference` está presente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-apache-w10-extractive-stratified-qwen3-8b-sft | ~8B (4 bits) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste específico para resumen extractivo; sin benchmarks |
| Qwen/Qwen3-8B | 8B | 32 768 (ampliable) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base generalista con modo thinking; benchmarks publicados por el autor |
| unsloth/Qwen3-8B-bnb-4bit | 8B (4 bits) | 32 768 | Apache 2.0 | Hugging Face | Checkpoint cuantizado del que parte este ajuste; sin fine-tuning específico |
| mrbmaryam/logsumm-apache-w10-hybrid-stratified-qwen3-8b-sft | ~8B (4 bits) | no disponible | Apache 2.0 | Hugging Face | Variante "hybrid" del mismo autor; sin documentación adicional |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, los hiperparámetros, el formato de prompt ni los criterios de evaluación, lo que dificulta la reproducibilidad y la confianza en el ajuste.
- Sin métricas: no hay benchmarks publicados que permitan verificar la calidad del resumen extractivo ni comparar con alternativas.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido no presente en la fuente; en tareas extractivas esto es especialmente crítico y no se documenta ningún mecanismo de mitigación.
- Sesgos: no se han documentado evaluaciones de sesgo; al entrenarse sobre un corpus no especificado ("apache-w10"), pueden heredarse sesgos del dataset y del modelo base.
- Idioma: solo inglés etiquetado; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B conviene verificar las condiciones del modelo base y de los datos de entrenamiento (no documentados).
- Estado del repositorio: 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.
- Tamaño del repositorio (0,2 GB): sugiere que no se publican los pesos completos en precisión nativa, sino adaptadores o pesos cuantizados; verificar la compatibilidad antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrbmaryam/logsumm-apache-w10-extractive-stratified-qwen3-8b-sft
- Variante "bgl": https://huggingface.co/mrbmaryam/logsumm-bgl-w10-extractive-stratified-qwen3-8b-sft
- Variante "hybrid": https://huggingface.co/mrbmaryam/logsumm-apache-w10-hybrid-stratified-qwen3-8b-sft
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
