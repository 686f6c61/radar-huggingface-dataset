# 11-47/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP

## Resumen

El modelo `11-47/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP` es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) creado por el usuario 11-47 mediante la fusión de dos modelos preentrenados con la técnica SLERP (Spherical Linear Interpolation) a través de la herramienta mergekit. Se trata, por tanto, de un merge y no de un entrenamiento desde cero: combina los pesos de `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` y `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1`, ambos derivados de la familia Qwen3.5 de 9B.

La relevancia del modelo reside en su carácter experimental: busca aunar en un único checkpoint las capacidades de razonamiento tipo DeepSeek (destilado) con las de la destilación de GLM-5.1, manteniendo además el carácter "uncensored/abliterated" del modelo base. Está etiquetado para generación de texto, razonamiento con cadena de pensamiento larga (long-CoT), matemáticas, STEM, uso de herramientas y function calling, además de generación multimodal image-text-to-text según la metadata de Hugging Face.

El contexto de publicación es el de un modelo de investigación con cero descargas y cero "likes" en el momento de la ficha, sin model card técnica detallada más allá de la configuración YAML del merge. No se dispone de información sobre licencia, idiomas más allá del inglés declarado, ni resultados de benchmarks. Es, en la práctica, un artefacto de experimentación para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la información proporcionada (el repo contiene safetensors en bfloat16; el tag `quantized` sugiere disponibilidad de variantes, sin detalle) |
| Idiomas soportados | en (inglés declarado; los tags mencionan `multilingual` sin lista concreta) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Metodo de creacion | Merge SLERP con mergekit, t=0.5, salida en bfloat16 |
| Modelos fusionados | `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` y `Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1` |

## Arquitectura y entrenamiento

El modelo es el resultado de una interpolación esférica (SLERP) entre dos checkpoints de 9B derivados de Qwen3.5. La configuración publicada especifica `merge_method: slerp`, `base_model: xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, dos modelos de entrada y un parámetro `t: 0.5`, lo que implica una ponderación equilibrada entre ambos. El dtype de entrada y salida es `bfloat16`. No se ha realizado entrenamiento adicional tras el merge: no hay datos de tokens de entrenamiento, composición de dataset ni fases de RLHF/DPO propias de este checkpoint.

Los modelos de origen, según sus tags y datasets asociados, parecen haber sido construidos mediante destilación de razonamiento: `Jackrong/DeepSeek-V4-Distill-8000x`, `Jackrong/Qwen3.5-reasoning-700x`, `Jackrong/GLM-5.1-Reasoning-1M-Cleaned` y `Kassadin88/GLM-5.1-1000000x`. Los tags mencionan SFT, RL, GSPO, MTP, LoRA y Unsloth, además de "heretic", "uncensored", "decensored" y "abliterated", lo que indica que al menos uno de los progenitores ha sido sometido a técnicas de eliminación de rechazos (abliteration). La innovación técnica del checkpoint es, por tanto, la propia fusión de capacidades de razonamiento de dos linajes distintos, no una arquitectura nueva.

## Capacidades

- Generación de texto conversacional e instruccional en inglés.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modos de "thinking" heredados de los modelos destilados.
- Razonamiento matemático y tareas STEM, según los datasets de destilación asociados.
- Generación de código, con tag explícito `coding`.
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Capacidad multimodal declarada en la metadata de Hugging Face (`image-text-to-text`), aunque la model card no la detalla.
- Comportamiento "uncensored/abliterated": menor tendencia a rechazar peticiones, por diseño del modelo base.
- Multilingüismo declarado en tags, aunque el único idioma listado oficialmente es el inglés.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Experimentación en investigación sobre merges de modelos: permite estudiar cómo se combinan las capacidades de razonamiento de dos destilaciones distintas (DeepSeek y GLM) en un único checkpoint de 9B, comparando su comportamiento frente a cada progenitor por separado.
- Inferencia local en estaciones de trabajo: con 9,4B parámetros en bfloat16 (unos 18,8 GB de repo), puede ejecutarse en GPUs de consumo alto o en cuantizaciones de 4-8 bits para prototipado de asistentes conversacionales.
- Generación de código asistida en entornos controlados: sus tags de coding y function calling permiten integrarlo en pipelines de autocompletado o generación de scripts, siempre con revisión humana dada la ausencia de benchmarks.
- Razonamiento matemático y STEM para tareas de apoyo: resolución de problemas paso a paso con cadena de pensamiento, útil en cuadernos de experimentación o herramientas educativas internas.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve como caso de estudio para evaluar la eficacia de las técnicas de eliminación de rechazos y sus riesgos asociados.
- Prototipado de agentes con tool calling: su soporte de function calling permite construir demostraciones de agentes multi-paso en entornos de laboratorio, sin garantías de robustez en producción.
- Evaluación comparativa de destilaciones: útil como punto intermedio en estudios que comparen checkpoints destilados de DeepSeek-V4 y GLM-5.1 sobre la misma base Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teóricas a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090/4090 o GPUs de 16 GB en cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 con contexto moderado, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM mediante conversión a GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 11-47/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP | 9,4B | no disponible | no disponible | Merge SLERP experimental, uncensored, sin benchmarks |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B (base del merge) | no disponible | no disponible | Progenitor; orientado a razonamiento DeepSeek y abliterated |
| Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1 | ~9B (base del merge) | no disponible | no disponible | Progenitor; destilación de razonamiento GLM-5.1 |
| Qwen3.5-9B (modelo base de la familia) | ~9B | no disponible en esta ficha | no disponible | Referencia arquitectónica de la que derivan los tres anteriores |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia empírica de su calidad en MMLU, HumanEval, GSM8K ni otras pruebas estándar.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o revisar las licencias de los modelos de origen.
- Modelo "uncensored/abliterated": presenta menor tendencia a rechazar peticiones dañinas, lo que supone un riesgo de seguridad relevante y lo desaconseja para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de 9B y agravado por la ausencia de evaluación; no apto para producción sin validación.
- Idioma declarado únicamente inglés: el rendimiento en castellano u otros idiomas no está garantizado pese al tag `multilingual`.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo con garantías.
- Al ser un merge SLERP, puede heredar inconsistencias de los dos progenitores, como degradación en tareas específicas o comportamientos contradictorios.
- Cero descargas y cero interacciones en Hugging Face: sin validación por parte de la comunidad.
- El tag `image-text-to-text` sugiere capacidades multimodales, pero la model card no las describe ni aporta ejemplos; no debe asumirse su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/11-47/Qwen3.5-9B-DeepSeekV4-GLM5.1-SLERP
- Modelo base 1: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base 2: https://huggingface.co/Jackrong/Qwen3.5-9B-GLM5.1-Distill-v1
- Dataset asociado: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Dataset asociado: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset asociado: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Dataset asociado: https://huggingface.co/datasets/Kassadin88/GLM-5.1-1000000x
- Herramienta de merge: https://github.com/cg123/mergekit
- Referencia SLERP: https://en.wikipedia.org/wiki/Slerp
- Paper referenciado en tags: arxiv:2604.06628 (no verificado en la información disponible)
