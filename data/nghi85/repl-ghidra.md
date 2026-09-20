# nghi85/Repl-Ghidra

## Resumen

Repl-Ghidra es un ajuste fino del modelo google/codegemma-2b publicado por el usuario nghi85 en Hugging Face. Está especializado en una tarea muy concreta dentro de la seguridad ofensiva y defensiva: la recuperación de nombres de funciones (function naming) a partir de código decompilado con Ghidra, orientada al análisis de malware y a la ingeniería inversa de binarios reales. El checkpoint forma parte del artefacto de ACSAC 2026 asociado al trabajo "R+R: Revisiting LLM-Based Binary Name Recovery for Real-World Malware Analysis".

El modelo se ha reentrenado sobre el corpus gennm-ghidra-O0 de GenNm siguiendo una receta de SFT más SymPO/DPO (sección 4.2 del artículo). Según la model card, alcanza 41,89 de precisión y 39,78 de recall por binario sobre el conjunto de test Ghidra-O0 de GenNm (701 binarios). Cuenta con 2.506.172.416 parámetros (~2,5B) y se distribuye como un único checkpoint plano en safetensors, con un repositorio de 5,0 GB.

Su relevancia es acotada pero clara: demuestra que un fine-tune de 2B sobre una base de código puede aportar métricas medibles en una tarea de dominio muy específico, donde históricamente se han usado pipelines heurísticos o modelos de mayor tamaño. No obstante, con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de google/codegemma-2b (familia Gemma); no se detalla explícitamente en la información proporcionada |
| Parametros totales | 2.506.172.416 (~2,5B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base CodeGemma-2B documenta 8.192 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio publica únicamente pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (checkpoint plano con config.json, safetensors y tokenizer, sin subcarpetas de arquitectura) |
| Modelo base | google/codegemma-2b |
| Corpus de entrenamiento declarado | GenNm gennm-ghidra-O0 |
| Receta de entrenamiento declarada | SFT + SymPO/DPO (artículo, sección 4.2) |
| Tamaño del repositorio | 5,0 GB |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

El modelo parte de CodeGemma-2B, un transformer decoder-only de la familia Gemma orientado a código, y se reentrena mediante un pipeline en dos fases declarado por el autor: un ajuste supervisado (SFT) seguido de una etapa de preferencias con SymPO/DPO, descrita en la sección 4.2 del artículo asociado. El corpus utilizado es gennm-ghidra-O0 de GenNm, compuesto por funciones decompiladas con Ghidra en nivel de optimización `-O0`. El autor remite a un archivo `RECIPE.txt` para consultar el calendario de entrenamiento exacto, pero ese nivel de detalle (número de tokens, composición del dataset, hiperparámetros, número de épocas) no está disponible en la información proporcionada.

La innovación principal no reside en la arquitectura, que es la del modelo base sin cambios declarados, sino en el formato de tarea y en el dominio: la entrada es el cuerpo de una función decompilada seguido de la marca `Q:[FUN_...]`, y la salida esperada es una respuesta estructurada con forma `A:{'FUN_...': 'name', ...}`, es decir, un mapeo entre el identificador anonimizado de la función y el nombre recuperado. El autor indica que el driver de inferencia y el script de evaluación se encuentran en `artifact/code/inference/eval_test.py` dentro del artefacto de ACSAC 2026.

## Capacidades

- Recuperación de nombres de funciones a partir de código decompilado con Ghidra: es la tarea principal para la que se ha entrenado el checkpoint.
- Manejo de un formato de prompt específico del dominio: cuerpo de función decompilada seguido de `Q:[FUN_...]`.
- Generación de salida estructurada en formato de diccionario: `A:{'FUN_...': 'name', ...}`, lo que facilita el parseo automático en pipelines.
- Análisis de binarios y soporte al análisis de malware: el modelo se enmarca explícitamente en el trabajo sobre recuperación de nombres en malware real.
- Procesamiento de funciones en el nivel de optimización `-O0` de Ghidra, que es el régimen cubierto por el corpus de entrenamiento.
- Capacidades generales de generación de texto y código heredadas de CodeGemma-2B: no están documentadas ni evaluadas para este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible, no hay evidencia en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no hay evidencia en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles, no hay evidencia en la información proporcionada.

## Casos de uso

- Triaje de malware en un SOC: el modelo se puede integrar en un pipeline que decompile muestras sospechosas con Ghidra y consulte a Repl-Ghidra para asignar nombres plausibles a funciones anonimizadas (`FUN_...`), acelerando la lectura manual por parte del analista.
- Enriquecimiento de informes de ingeniería inversa: dado un binario decompilado, generar un mapeo de nombres de función que se pueda volcar a un informe o a un fichero de símbolos para su revisión posterior.
- Priorización de funciones en análisis estático: usar los nombres recuperados como señal para ordenar qué funciones revisar primero, por ejemplo funciones con nombres que sugieran criptografía, red o persistencia.
- Soporte a la desofuscación parcial: aplicar el modelo a binarios con símbolos eliminados para reconstruir una capa de nomenclatura legible antes de un análisis más profundo.
- Investigación académica en recuperación de nombres de binarios: el checkpoint sirve como baseline reproducible de 2,5B sobre el test set Ghidra-O0 de GenNm (701 binarios), útil para comparaciones futuras.
- Automatización de anotación de corpus: generar nombres candidatos sobre grandes volúmenes de funciones decompiladas para su posterior curación humana, reduciendo el coste de etiquetado manual.
- Evaluación comparativa de fine-tunes pequeños frente a modelos mayores: permite medir hasta qué punto un modelo de 2,5B especializado compite con alternativas mayores en esta tarea concreta.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la tarea objetivo, medidos sobre el conjunto de test Ghidra-O0 de GenNm (701 binarios):

| Metrica | Valor |
|---|---|
| Precision por binario (Ghidra-O0, 701 binarios) | 41,89 |
| Recall por binario (Ghidra-O0, 701 binarios) | 39,78 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Tampoco se proporcionan métricas comparativas frente a otros modelos en el mismo conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, del orden de 6-7 GB para lotes pequeños. Coincide con el tamaño del repositorio (5,0 GB).
- VRAM estimada en cuantización INT8: aproximadamente 2,5-3,5 GB.
- VRAM estimada en cuantización INT4: aproximadamente 1,3-2,0 GB, aunque no se publican pesos cuantizados para este checkpoint.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4080 o una RTX 4090 pueden ejecutarlo en FP16 sin problemas.
- GPU de centro de datos recomendadas: L4, A10G, A100 y H100, todas sobradas para un modelo de este tamaño, con margen para aumentar el tamaño de lote.
- Ejecución en CPU: viable pero lenta; un modelo de 2,5B en FP32 requiere del orden de 10 GB de RAM y ofrece latencias altas por token.
- Opciones de despliegue: transformers como vía de referencia (el artefacto del autor usa un driver propio, `artifact/code/inference/eval_test.py`); vLLM y TGI son opciones habituales para servir el checkpoint en safetensors. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor frente a otros modelos en el mismo test set. La tabla siguiente recoge modelos de tamaño y categoría comparables usando datos públicos de referencia de cada proyecto, no extraídos de la información proporcionada, y por tanto sujetos a verificación:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Repl-Ghidra | ~2,5B | no disponible | Gemma | Nombrado de funciones en binarios (Ghidra) |
| google/codegemma-2b | ~2,5B | 8.192 tokens (referencia pública) | Gemma | Generación de código general |
| Modelo de GenNm (referenciado en la model card) | no disponible | no disponible | no disponible | Recuperación de nombres de binarios |
| StarCoder2-3B | 3B | 16.384 tokens (referencia pública) | BigCode OpenRAIL-M | Generación de código general |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens (referencia pública) | Apache-2.0 | Generación de código general |

El competidor directo sería el modelo asociado al corpus y al test set de GenNm, citado en la propia model card, pero no se dispone de sus especificaciones ni de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo para este checkpoint.
- Riesgo de alucinación: inherente a cualquier fine-tune de un modelo de lenguaje; en esta tarea puede traducirse en nombres de función plausibles pero incorrectos. Las métricas declaradas (41,89 de precisión por binario) implican que una mayoría de predicciones no son correctas, por lo que la salida requiere verificación humana.
- Ámbito de entrenamiento restringido: el corpus declarado es gennm-ghidra-O0, es decir, funciones decompiladas con Ghidra en `-O0`. El rendimiento fuera de ese régimen (otros niveles de optimización, otros decompiladores, otros formatos de binario) no está documentado y previsiblemente será inferior.
- Formato de entrada rígido: el modelo espera el formato `Q:[FUN_...]` sobre cuerpos de función decompilados; usarlo fuera de ese contrato puede degradar la calidad de la salida.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: el checkpoint se distribuye bajo Gemma Terms of Use y Gemma Prohibited Use Policy. Estas condiciones se extienden a los checkpoints derivados y a cualquier redistribución, y deben cumplirse también en uso comercial.
- Validación externa inexistente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de reproducción de las métricas por terceros.
- Trazabilidad incompleta: el calendario exacto de entrenamiento se remite a `RECIPE.txt` y el driver de inferencia al artefacto de ACSAC 2026, pero esos recursos no están enlazados en la información proporcionada.
- Advertencia de contenido: la model card incluye un aviso explícito de que estos son pesos de Gemma modificados, no los pesos originales de CodeGemma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nghi85/Repl-Ghidra
- Modelo base: https://huggingface.co/google/codegemma-2b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Artículo ACSAC 2026 "R+R: Revisiting LLM-Based Binary Name Recovery for Real-World Malware Analysis": no disponible, no se proporciona URL
- Artefacto ACSAC 2026 (incluye `artifact/code/inference/eval_test.py` y `RECIPE.txt`): no disponible, no se proporciona URL
- Corpus gennm-ghidra-O0 de GenNm: no disponible, no se proporciona URL
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de YouTube y no guardan relación con el modelo.
