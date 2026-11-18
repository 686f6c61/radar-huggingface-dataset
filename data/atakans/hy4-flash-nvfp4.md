# atakans/Hy4-flash-NVFP4

## Resumen

Hy4-flash NVFP4 es una cuantización de precisión reducida del modelo multimodal tencent/Hy4-flash, publicada por el usuario atakans. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con capacidades de imagen-a-texto y texto-a-texto, cuantizado con NVIDIA ModelOpt 0.48 a formato NVFP4 (W4A4) en las capas MLP y FP8 en las tablas Engram, manteniendo el resto de componentes en BF16. El checkpoint resultante ocupa 164,7 GB, frente a los 440 GB del BF16 original y los 287 GB de la versión FP8 de Tencent.

El objetivo declarado es ejecutar el modelo en dos estaciones DGX Spark (2 x 128 GB) con vLLM y tensor parallel 2, un escenario de despliegue en hardware compacto que sería inviable con los pesos en BF16. La relevancia actual radica en que demuestra una ruta práctica de cuantización agresiva (FP4) sobre un MoE de gran tamaño con atención dispersa MLA y tablas de embedding tipo Engram, manteniendo la licencia original de Tencent.

No obstante, es un artefacto experimental: el soporte de Hy4-flash en vLLM es todavía un pull request abierto y el autor aplica cinco modificaciones locales en Python sobre la imagen oficial para que funcione. No hay benchmarks de calidad completos (GPQA Diamond e IFEval pendientes) y las comprobaciones publicadas son a nivel de pesos, no de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA dispersa (sparse MLA), expertos enrutados, experto compartido y tablas Engram |
| Parametros totales | 144.761.604.413 (según safetensors; el conteo de Hugging Face es la mitad por el empaquetado FP4) |
| Parametros activos | 16 expertos enrutados activos de 512 por capa (número total de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (probado en la configuración de referencia) |
| Tipos de cuantizacion | NVFP4 (W4A4, E2M1 con escala FP8 E4M3 por cada 16 elementos y escala FP32 por tensor) en MLPs; FP8 E4M3 con escala BF16 por fila en tablas Engram; BF16 en atención, indexador disperso, router, proyecciones latentes MoE, embeddings, lm_head, torre de visión y drafter DFly2 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors (con tensores U8, F8_E4M3, BF16, F32 e I32) |

## Arquitectura y entrenamiento

El modelo base es tencent/Hy4-flash, un transformer MoE multimodal con 512 expertos enrutados por capa (16 activos), un experto compartido, un MLP denso en la capa 0 y atención MLA dispersa con un sink de atención aprendible. Incorpora tablas Engram en las capas 2, 12, 22 y 32: tablas de búsqueda por hash de 165 millones de filas por 96 dimensiones cada una, que actúan como embeddings de memoria y no como multiplicaciones matriciales. Dispone además de un drafter de decodificación especulativa DFly2 y de una torre de visión para entrada de imagen.

Esta build no reentrena el modelo: parte de los pesos BF16 de tencent/Hy4-flash (versión del 17 de noviembre de 2026) y aplica cuantización post-entrenamiento con NVIDIA ModelOpt 0.48.0 usando la configuración NVFP4_DEFAULT_CFG con reglas BF16 para los componentes no cuantizados. La calibración emplea la mezcla nemotron-post-training-v3 de ModelOpt (128 muestras de hasta 2.048 tokens de chat, ciencia, código, uso agéntico, matemáticas, SWE y texto multilingüe), que fija las escalas de activación; las escalas de pesos NVFP4 se derivan solo de los pesos. Las tablas Engram se convierten en una pasada posterior a FP8 con escala por fila (valor = fila x escala, escala = máximo de fila / 448). El proceso se ejecutó en 8 x RTX PRO 6000 Blackwell Max-Q: 42 minutos de calibración y 5 minutos de exportación.

## Capacidades

- Generación de texto conversacional y de formato largo (pipeline image-text-to-text y text-generation).
- Razonamiento con modo thinking conmutable (el autor usa `reasoning_effort: no_think` para las mediciones).
- Generación de código y tareas de reescritura de texto.
- Aritmética y tareas de explicación conceptual (verificadas cualitativamente por el autor).
- Traducción (verificada cualitativamente por el autor).
- Entrada de imagen a texto mediante torre de visión en BF16.
- Decodificación especulativa con el drafter DFly2 (hasta 5 tokens draft por paso).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware compacto de doble DGX Spark: el caso de uso principal documentado por el autor; el checkpoint de 164,7 GB permite cargar el modelo en 104 s con 51,7 GiB por GPU más la mitad de las tablas Engram en memoria host, algo imposible con los 440 GB en BF16.
- Generación de JSON estructurado en producción: el perfil medido con prompt JSON alcanza 38,3 tok/s de decodificación y 3,99 tokens aceptados por paso del drafter, lo que lo hace adecuado para extracción de datos y APIs con salida estructurada.
- Asistencia de código en local: 36,5 tok/s en prompts de código con decodificación especulativa, viable para autocompletado y revisión en entornos con GPUs Blackwell de consumo profesional.
- Procesamiento de documentos largos con visión: la ventana de 262.144 tokens y la torre de visión permiten resumir o extraer información de documentos e imágenes extensos en una sola pasada, con prefill medido de 1.403 tok/s a 16K y 1.461 tok/s a 32K.
- Reescritura y edición de texto a escala: 36,1 tok/s en tareas de rewrite, adecuado para pipelines de normalización, traducción y adaptación de contenido por lotes.
- Investigación en cuantización FP4 sobre MoE: sirve como referencia reproducible (receta en atakann/dgx-spark-recipes) para estudiar el impacto de NVFP4 en modelos MoE con atención dispersa y embeddings tipo Engram.
- Servicio conversacional multi-turno: el rendimiento en segundo turno sube a 29,6-36,8 tok/s con profundidades de 4K-16K, lo que encaja con chatbots de contexto medio en hardware de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, GPQA Diamond, IFEval) en la información disponible; el autor indica que la ejecución completa de GPQA Diamond e IFEval está pendiente. Los únicos datos publicados son de rendimiento de inferencia en 2 x DGX Spark con vLLM, TP=2 sobre enlace QSFP (RoCE), expert parallel, DFly con 5 tokens draft, caché KV `fp8_ds_mla`, 262.144 tokens de contexto, un usuario y thinking desactivado.

| Prompt (300 tokens de salida, mediana de 3) | Decode tok/s | Tokens aceptados por paso DFly |
|---|---|---|
| JSON | 38,3 | 3,99 |
| Código | 36,5 | 3,80 |
| Reescritura | 36,1 | 3,79 |
| Explicación | 25,0 | 2,75 |
| Historia | 17,3 | 1,85 |

Sin el drafter: aproximadamente 15 tok/s.

| Profundidad de prompt | Prefill tok/s | Decode tok/s, primer turno | Decode tok/s, segundo turno |
|---|---|---|---|
| 4K | 1.110 | 20,8 | 29,6 |
| 16K | 1.403 | 22,1 | 36,8 |
| 32K | 1.461 | 26,6 | 27,0 |

Comprobaciones de cuantización publicadas:

| Comprobación | Resultado |
|---|---|
| Pesos de expertos desquantizados frente a BF16 (gate, up y down de 3 expertos en capas 5, 20 y 40) | 9,5 % de error relativo en cada uno |
| Tablas Engram FP8 frente a BF16 | 2,6 % de error RMS relativo en cada una de las 4 tablas |
| Verificación de ficheros tras la subida | 68 ficheros, tamaños coincidentes con la exportación local |

## Requisitos de hardware

- VRAM estimada: 51,7 GiB por GPU en la configuración de referencia de 2 x DGX Spark, más la mitad de las tablas Engram en memoria host por nodo.
- Caché KV: 6 GiB para 578K tokens con formato `fp8_ds_mla`; con esa caché la memoria libre mínima medida fue de 12,5 GiB en una Spark y 13,0 GiB en la otra.
- GPU recomendadas: 2 x NVIDIA DGX Spark (128 GB cada una) con enlace QSFP/RoCE; el autor calibró y exportó en 8 x RTX PRO 6000 Blackwell Max-Q.
- GPU de consumo: no cabe en GPUs de consumo convencionales por el tamaño del checkpoint (164,7 GB); requiere al menos dos dispositivos de 128 GB o equivalente agregado.
- Despliegue: vLLM con la imagen `vllm/vllm-openai:hy4-flash` (commit 77766db) y cinco modificaciones locales en Python (sink de atención aprendible vía kernel sparse MLA SM120 de FlashInfer, carga de expertos NVFP4 de ModelOpt y las mismas dos para el drafter DFly). El soporte upstream está en el pull request vllm-project/vllm#68296, que solo acepta FP8 y requiere Hopper o Blackwell de centro de datos para la atención. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 17,3-38,3 tok/s de decodificación según el tipo de prompt con drafter, ~15 tok/s sin drafter, y 1.110-1.461 tok/s de prefill entre 4K y 32K de profundidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atakans/Hy4-flash-NVFP4 | 144,8 B (MoE, 16 de 512 activos) | 262.144 | NVFP4 + FP8 Engram + BF16 | tencent-hy-license | Hugging Face, requiere parches locales en vLLM |
| tencent/Hy4-flash (BF16) | 144,8 B | no disponible | BF16 (440 GB) | tencent-hy-license | Hugging Face |
| tencent/Hy4-flash (FP8 de Tencent) | 144,8 B | no disponible | FP8 (287 GB) | tencent-hy-license | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada, por lo que no es posible comparar rendimiento de calidad frente a modelos de la misma categoría.

## Limitaciones y advertencias

- Artefacto experimental: el soporte de Hy4-flash en vLLM es un pull request abierto y el autor aplica cinco cambios manuales en Python sobre la imagen oficial; no hay una versión publicada de vLLM que lo ejecute sin parches.
- Sin benchmarks de calidad completos: GPQA Diamond e IFEval están pendientes; las comprobaciones publicadas son a nivel de pesos (9,5 % de error relativo en expertos, 2,6 % en Engram), no de extremo a extremo.
- El conteo de parámetros de Hugging Face (mitad del real) y la etiqueta "8-bit" son artefactos del empaquetado FP4 (dos valores E2M1 por byte); hay que usar el dato de safetensors (144,8 B).
- Riesgo de alucinación: no cuantificado en la información disponible; el autor solo verifica cualitativamente aritmética, código y traducción.
- Sesgos conocidos: no disponible; dependen del dataset de entrenamiento original de tencent/Hy4-flash, no documentado en esta ficha.
- Idiomas soportados: no disponible; la calibración incluyó texto multilingüe, pero no se especifica la cobertura final.
- Licencia: se mantiene la Tencent Hy License del modelo base; es necesario revisar sus términos antes de cualquier uso comercial, ya que la licencia es "other" y no una licencia permisiva estándar.
- Requiere hardware Blackwell (SM120) para los kernels sparse MLA empleados; no funciona en GPUs anteriores.
- El rendimiento medido corresponde a un solo usuario con thinking desactivado; el throughput concurrente y el comportamiento con thinking activo no están documentados.
- La memoria host debe alojar la mitad de las tablas Engram, lo que añade un requisito de RAM del sistema no cuantificado explícitamente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atakans/Hy4-flash-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Recetas de despliegue en DGX Spark: https://github.com/atakann/dgx-spark-recipes
- Pull request de soporte Hy4-flash en vLLM: https://github.com/vllm-project/vllm/pull/68296
