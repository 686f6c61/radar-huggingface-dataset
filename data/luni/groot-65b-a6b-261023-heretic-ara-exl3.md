# Luni/Groot-65B-A6B-261023-Heretic-ARA-EXL3

## Resumen

Groot-65B-A6B-261023-Heretic-ARA-EXL3 es una cuantización EXL3 del modelo Luni/Groot-65B-A6B-261023-Heretic-ARA, que a su vez es una variante "decensored" (mediante la herramienta Heretic 2.0 y la técnica ARA) del modelo base GrootTeam/Groot-65B-A6B-261023. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 65 mil millones de parámetros totales y aproximadamente 6 mil millones activos por token, desarrollado por GrootTeam y derivado de Qwen3.8-Flash-Next.

Este repositorio concreto no contiene pesos en BF16, sino una cuantización EXL3 (formato propietario de exllamav3) pensada para inferencia eficiente en GPUs de consumo y profesionales con TabbyAPI. La rama publicada `3.35bpw` ocupa 29,5 GB de pesos, lo que permite ejecutar el modelo con 128k de contexto en una tarjeta de 32 GB manteniendo los 256 expertos enrutados en VRAM.

La relevancia de esta ficha radica en dos factores: por un lado, el modelo base incorpora arquitectura MoE con atención de contexto largo y capacidades multimodales (pipeline image-text-to-text); por otro, la variante Heretic-ARA reduce drásticamente las negativas del modelo (de 116/120 a 10/120 en el conjunto de evaluación del autor) a costa de un incremento de divergencia KL de 0,496 en prompts inofensivos. Es, por tanto, un modelo orientado a usos donde el filtrado excesivo resulta un obstáculo, con las advertencias éticas y legales que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), arquitectura `qwen4_exp` en exllamav3 |
| Parametros totales | 65B |
| Parametros activos | ~6B por token |
| Longitud de contexto | 128k tokens (131072 configurado en TabbyAPI) |
| Tipos de cuantizacion | EXL3 3.35bpw (promedio real 3.41 bpw); componentes: pesos 3.41 bpw, tabla n-gram 30.4 GB, cabeza 6 bit, MTP 4 bit, visión 6 bit, embeddings 16 bit |
| Idiomas soportados | en, de, multilingual (segun tags del autor) |
| Licencia | qwen-community-1.0 (etiquetada como "other" con enlace a la licencia de GrootTeam) |
| Formato de pesos | EXL3 (exllamav3), safetensors por rama; n-gram table en safetensors aparte |

## Arquitectura y entrenamiento

El modelo base GrootTeam/Groot-65B-A6B-261023 es un transformer MoE con 65B parámetros totales y ~6B activos por token, derivado de Qwen3.8-Flash-Next y post-entrenado con menos de 0,1B tokens de datos open source. La arquitectura interna en exllamav3 se identifica como `qwen4_exp`, lo que sugiere una evolución experimental de la familia Qwen con soporte para decodificación especulativa mediante MTP (Multi-Token Prediction) y capacidades multimodales (image-text-to-text).

Sobre esa base, el autor Luni aplicó Heretic 2.0 con la técnica ARA para producir la variante "Heretic-ARA", que reduce las negativas del modelo en un conjunto de 120 prompts de 116 a 10, con una divergencia KL de 0,496 en prompts inofensivos. Esta cuantización EXL3 se generó con exllamav3 1.6.5 (dev), codebook `mul1`, calibración por defecto de 250 muestras × 8192 tokens, y el flag `-hq` que asigna más bits a atención, shared expert y router. La tabla n-gram (`ngram_embedding_ng5.safetensors`, 30,4 GB) se carga en RAM o se streamea desde disco, no en VRAM.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 128k tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión cuantizada a 6 bits.
- Decodificación especulativa mediante MTP (Multi-Token Prediction) con `draft_num_tokens: 3`, que acelera la generación.
- Soporte de tool calling y function calling heredado de la familia Qwen (no documentado explícitamente en la model card, pero presente en el linaje Qwen).
- Capacidades multilingües: inglés, alemán y otros idiomas (tag `multilingual`).
- Modo "decensored": responde a un espectro amplio de prompts sin las negativas típicas de modelos alineados.
- Tabla n-gram de 5-gramas para mejora de la generación (cargada en RAM/streaming).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la decensuración (Heretic 2.0 + ARA) comparando respuestas con el base original, con métricas concretas de negativas (10/120 vs 116/120) y divergencia KL (0,496).
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, aprovechando la reducción de negativas y el contexto de 128k para mantener coherencia en obras largas.
- Asistente multimodal en local: con 29,5 GB de pesos EXL3 cabe en una GPU de 32 GB y procesa imágenes junto con texto, útil para prototipos de análisis documental o captioning en entornos controlados.
- Atención al cliente en dominios especializados: el contexto de 128k permite gestionar conversaciones multi-turno con historial extenso y documentación adjunta, aunque requiere revisión humana por el riesgo de respuestas no filtradas.
- Procesamiento de documentos largos en alemán e inglés: resumen, extracción y Q&A sobre contratos o informes de decenas de miles de tokens gracias a la ventana de 128k.
- Despliegue con TabbyAPI en estación de trabajo: el formato EXL3 con MTP y tabla n-gram en RAM permite servir el modelo con throughput razonable en una sola GPU de 32 GB (p. ej., RTX 5090 o A100 40GB con margen).
- Experimentación con decodificación especulativa: el soporte MTP integrado permite medir aceleraciones y comparar con draft models separados en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas internas de la decensuración: 10/120 negativas frente a 116/120 del base, y KL de 0,496 en prompts inofensivos. No hay datos de MMLU, HumanEval, GSM8K ni comparativas estándar.

## Requisitos de hardware

- VRAM estimada: ~29,5 GB solo para pesos; con caché KV para 128k de contexto y tabla n-gram fuera de VRAM, se recomienda una GPU de 32 GB como mínimo para la configuración completa.
- GPU recomendadas: RTX 5090 (32 GB), A100 40GB, H100, L40S. En GPUs de 24 GB no cabe la rama `3.35bpw` completa con contexto largo.
- Cabe en consumer GPU de gama alta (32 GB); no en RTX 4090 (24 GB) sin reducir contexto o recurrir a offloading.
- Despliegue: TabbyAPI con exllamav3 1.6.5 (dev), que requiere la arquitectura `qwen4_exp`. No compatible con llama.cpp, Ollama ni vLLM en el formato EXL3.
- Configuración sugerida por el autor: `max_seq_len: 131072`, `cache_mode: 8,8`, `ngram_ram: false`, `draft_mode: mtp`, `draft_num_tokens: 3`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Groot-65B-A6B-261023-Heretic-ARA-EXL3 (este) | 65B | ~6B | 128k | qwen-community-1.0 | EXL3 | Decensurado, multimodal, MTP |
| GrootTeam/Groot-65B-A6B-261023 | 65B | ~6B | 128k (no confirmado) | qwen-community-1.0 | safetensors/GGUF | Base alineado, 116/120 negativas |
| Luni/Groot-65B-A6B-261023-Heretic-ARA | 65B | ~6B | 128k (no confirmado) | qwen-community-1.0 | BF16 safetensors | Decensurado, sin cuantizar |
| GrootTeam/Groot-65B-A6B-261023-GGUF | 65B | ~6B | no disponible | qwen-community-1.0 | GGUF | Para llama.cpp/Ollama |

## Limitaciones y advertencias

- Modelo decensurado: la reducción de negativas (10/120) implica que puede generar contenido sensible, ofensivo o inseguro sin filtros; no apto para producción orientada al público sin capas de moderación adicionales.
- Divergencia KL de 0,496 en prompts inofensivos respecto al base: puede degradar la calidad o el estilo en tareas benignas.
- Riesgo de alucinación no cuantificado: no hay benchmarks estándar publicados que permitan estimar su fiabilidad factual.
- Idiomas: solo se declaran inglés, alemán y "multilingual" genérico; el soporte real de español no está verificado.
- Licencia qwen-community-1.0: conviene revisar los términos exactos (enlace en la model card) antes de uso comercial; la etiqueta "other" añade ambigüedad.
- Formato EXL3 propietario: dependencia de exllamav3 1.6.5 dev con arquitectura `qwen4_exp`, lo que limita portabilidad y opciones de despliegue.
- Contexto de 128k: la ventana completa exige VRAM adicional para caché KV; en 32 GB puede requerir reducir `max_seq_len`.
- La tabla n-gram de 30,4 GB debe residir en RAM o streamearse desde disco; en sistemas con poca RAM impactará la latencia.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Luni/Groot-65B-A6B-261023-Heretic-ARA-EXL3
- Modelo base cuantizado (BF16): https://huggingface.co/Luni/Groot-65B-A6B-261023-Heretic-ARA
- Modelo original: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Versión GGUF del original: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023-GGUF
- Licencia: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/blob/main/LICENSE
- Heretic (herramienta de decensuración): https://github.com/p-e-w/heretic
- exllamav3: https://github.com/turboderp-org/exllamav3
