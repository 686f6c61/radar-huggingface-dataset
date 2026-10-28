# positron-ai/Qwen3.5-0.8B

## Resumen

`positron-ai/Qwen3.5-0.8B` no es un modelo nuevo: es un espejo literal (verbatim mirror) de `Qwen/Qwen3.5-0.8B` en la revisión `2fc06364715b967f1860aea9cf38778875588b17`, republicado por Positron AI como fuente de descarga fijada y anónima para sus pipelines de integración continua. El único fichero modificado es el `README.md`; la model card original se conserva como `README.upstream.md` y el resto de ficheros son idénticos byte a byte al repositorio upstream, con verificación de object IDs (LFS sha256 / git blob sha1) antes y después de la subida.

El checkpoint contiene 873.438.784 parámetros (unos 0,87B) en un único fichero `model.safetensors` de 1,75 GB, distribuido bajo licencia Apache-2.0. Por el listado de ficheros (presencia de `preprocessor_config.json` y `video_preprocessor_config.json`, junto con un `tokenizer.json` de 12,8 MB) se deduce que el modelo upstream está preparado para entradas de imagen y vídeo, además de texto, aunque la información disponible no detalla la arquitectura interna ni la composición del entrenamiento.

Su relevancia es operativa, no científica: sirve para que un CI que depende de este checkpoint no se rompa por cambios upstream, gating o límites de tasa. El propio autor advierte que el repositorio no reporta resultados de evaluación, que no debe usarse como canal de adquisición de pesos para procesado y que nunca debe tratarse como fuente `bf16` canónica: el sujeto canónico sigue siendo el repositorio upstream de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de familia `qwen3_5`; el `config.json` no se detalla en la información proporcionada) |
| Parámetros totales | 873.438.784 (0,87B, dato real del index de safetensors) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un único shard: `model.safetensors-00001-of-00001.safetensors`, 1.746.942.600 bytes) |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura en la información proporcionada. El tag `qwen3_5` y el nombre del modelo lo sitúan en la familia Qwen3.5 de Alibaba Qwen, pero ni el número de capas, ni el tipo de atención, ni el vocabulario se exponen en esta ficha. El repositorio incluye `config.json` (2.907 bytes), `tokenizer.json`, `merges.txt` y `vocab.json`, que son los artefactos habituales de un transformer decoder-only con tokenizador BPE, si bien esto es una inferencia a partir del listado de ficheros y no un dato confirmado.

Tampoco hay información sobre datos de entrenamiento (número de tokens, composición del corpus), sobre si hubo RLHF, DPO u otra fase de alineamiento, ni sobre innovaciones técnicas concretas. La presencia de `preprocessor_config.json` y `video_preprocessor_config.json` sugiere soporte de entrada visual y de vídeo en el checkpoint upstream, pero se desconoce el encoder utilizado y la resolución o número de fotogramas admitidos. Cualquier dato de entrenamiento debe consultarse en la model card upstream (`README.upstream.md`, 61.705 bytes), que no se reproduce en esta información.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de la familia Qwen3.5, si bien no se documenta explícitamente en la información disponible.
- Entrada multimodal de imagen: inferida de la presencia de `preprocessor_config.json`; no confirmada en la documentación proporcionada.
- Entrada de vídeo: inferida de la presencia de `video_preprocessor_config.json`; no confirmada en la documentación proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado en el repositorio).
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidad de audio: no disponible (no hay `audio_preprocessor` ni artefactos equivalentes en el listado).
- Plantilla de chat: incluida (`chat_template.jinja`, 7.755 bytes), por lo que el checkpoint incorpora un formato de conversación definido para inferencia conversacional.

## Casos de uso

- Fuente de descarga fijada para CI: usar la revisión inmutable del espejo como entrada de tests de regresión de pipelines de ML, de modo que el CI no dependa de cambios, gating ni límites de tasa del repositorio upstream. Es el propósito declarado del repositorio.
- Verificación de reproducibilidad: comparar hashes (LFS sha256 y git blob sha1) de los ficheros descargados contra la tabla de procedencia publicada para auditar que los pesos son idénticos a los de la revisión upstream indicada.
- Pruebas de integración de tokenizadores y plantillas de chat: validar que un `chat_template.jinja` y un `tokenizer.json` concretos funcionan en el stack propio antes de fijar la versión en producción.
- Desarrollo en local y en el borde: con 0,87B de parámetros, el checkpoint en bf16 ocupa unos 1,75 GB, por lo que cabe en portátiles y en GPUs de gama de entrada; útil para prototipado de tareas de extracción, clasificación o generación corta sin depender de servicios externos.
- Experimentación académica con presupuesto limitado: la licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su uso como baseline en estudios comparativos de modelos pequeños.
- Evaluación de pipelines multimodales: si se confirma el soporte de imagen y vídeo, el checkpoint serviría para probar preprocesadores visuales y de vídeo en un entorno controlado y con pesos inmutables.
- Base para fine-tuning ligero: 0,87B de parámetros permite ajuste con LoRA en una única GPU consumer; conviene partir del repositorio upstream para trazabilidad, no del espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo lo declara explícitamente: no se reportan resultados de evaluación y ninguno debe atribuirse a este repositorio. Cualquier cifra de MMLU, HumanEval, GSM8K u otras deberá buscarse en la documentación del modelo upstream, que aquí no se proporciona.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 1,75 GB solo de pesos (873.438.784 parámetros × 2 bytes); con overhead de runtime y caché KV, contar con 2,5-3 GB como mínimo.
- VRAM en fp32: unos 3,5 GB de pesos.
- VRAM en int8: unos 0,87 GB de pesos; en int4, unos 0,44 GB (estimaciones aritméticas a partir del recuento de parámetros, no medidas reales).
- Caché KV: tamaño no estimable porque se desconoce la longitud de contexto y la configuración de atención.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en bf16 para lotes pequeños; una RTX 3060 de 12 GB, una RTX 4090 o una A100 quedan sobradamente dimensionadas y permiten lotes grandes o fine-tuning con LoRA.
- Cabe en GPU consumer: sí, de forma holgada; también en iGPU y CPU para inferencia en bf16 con latencia alta.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM o TGI si la versión instalada reconoce la arquitectura `qwen3_5`, y llama.cpp/Ollama únicamente si se genera previamente una conversión a GGUF, que este repositorio no publica.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| positron-ai/Qwen3.5-0.8B (este repositorio) | 873 M | no disponible | Apache-2.0 | safetensors en HuggingFace, espejo de solo descarga |
| Qwen/Qwen3.5-0.8B (upstream) | 873 M | no disponible | Apache-2.0 | safetensors en HuggingFace; sujeto canónico |
| Qwen3-0.6B | ~0,6 B | no verificado en esta búsqueda | Apache-2.0 | safetensors y GGUF en HuggingFace |
| Llama-3.2-1B | ~1,24 B | no verificado en esta búsqueda | Llama 3.2 Community License | safetensors y GGUF en HuggingFace |
| Gemma-3-1B | ~1 B | no verificado en esta búsqueda | Gemma Terms of Use | safetensors y GGUF en HuggingFace |

Los datos de los modelos comparables provienen de conocimiento público general y no han sido verificados en la búsqueda web realizada; consúltese la documentación oficial de cada modelo antes de tomar una decisión. La comparación más directa y fiable es contra el propio repositorio upstream: mismo contenido, misma licencia, misma huella de pesos, con la diferencia de que el upstream es el canal válido para adquisición y evaluación.

## Limitaciones y advertencias

- El repositorio es exclusivamente una fuente de descarga para CI. No es un canal de adquisición de pesos para procesado ni una fuente `bf16` canónica; para cualquier uso real debe referenciarse `Qwen/Qwen3.5-0.8B`.
- No se reportan evaluaciones y ninguna métrica debe atribuirse a este espejo; la única garantía ofrecida es la identidad byte a byte con la revisión upstream indicada.
- No hay información sobre sesgos, datos de entrenamiento ni filtros de seguridad; un modelo de 0,87B tiene además capacidad limitada de razonamiento y mayor propensión a errores factuales que modelos de mayor tamaño.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay datos de evaluación que permitan cuantificarlo.
- Cobertura de idiomas desconocida: el repositorio no declara el campo de idiomas, por lo que no puede asumirse un rendimiento correcto en castellano sin evaluarlo.
- Longitud de contexto desconocida: no puede planificarse un caso de uso con documentos largos sin consultar el `config.json` o la model card upstream.
- La licencia Apache-2.0 permite uso comercial y modificaciones, pero el espejo no añade ninguna garantía adicional; verificar los términos del upstream antes de redistribuir.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en llama.cpp u Ollama requiere conversión propia y validación.
- Los resultados de la búsqueda web realizada no son pertinentes: remiten al IDE Positron para Python y R y a la partícula física positrón, entidades sin relación con el autor del modelo.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/positron-ai/Qwen3.5-0.8B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión fijada del upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante para este modelo (los resultados corresponden a https://positron.posit.co/ y a la entrada de Wikipedia sobre el positrón, sin relación con el repositorio).
