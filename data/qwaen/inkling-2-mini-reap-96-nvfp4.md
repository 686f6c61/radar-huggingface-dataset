# qwaen/Inkling-2-Mini-REAP-96-NVFP4

## Resumen

Inkling-2-Mini-REAP-96-NVFP4 es una versión podada y cuantizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario qwaen en Hugging Face. Se trata de un transformer de tipo mixture-of-experts (MoE) con arquitectura de bloques repetidos (inkling2_loop), en el que se han conservado 96 de los 128 expertos enrutados por capa física mediante la técnica REAP (saliency-based expert pruning), manteniendo el enrutamiento top-8 original. El checkpoint resultante contiene aproximadamente 20.270 millones de parámetros en formato NVFP4/MXFP8, con un repositorio de 16,3 GB.

La relevancia de esta ficha radica en que combina tres técnicas de compresión (poda de expertos, cuantización FP4 y exportación ModelOpt) sobre un modelo base multimodal capaz de procesar imagen y texto. El resultado es un checkpoint que puede servirse en GPUs de gama consumer, como demuestran las pruebas piloto del autor en una RTX 5060 Ti de 16 GiB, con un throughput de decodificación de 15,57 tokens/s.

La información pública disponible es limitada: la model card no detalla la composición del dataset de entrenamiento del modelo base, los idiomas soportados ni resultados de benchmarks estándar. Esta ficha refleja exclusivamente los datos verificables en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloques repetidos (inkling2_loop), poda REAP y cuantización NVFP4/MXFP8 |
| Parámetros totales | 20.271.579.688 (~20,27 mil millones) |
| Parámetros activos | no disponible (top-8 de 96 expertos retenidos por capa física) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantización | NVFP4 y MXFP8 (export ModelOpt), 8-bit según tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export ModelOpt NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer MoE con una estructura de bloques repetidos: el bloque de repetición se ejecuta tres veces, según indica la model card. Cada capa física dispone de 128 expertos enrutados con enrutamiento top-8; tras la poda REAP se retienen 96 expertos por capa física. La saliencia REAP se calculó sobre 65 trayectorias de calibración de OpenCode que suman 679.958 tokens, cubriendo 24 capas físicas y 48 visitas de capa. El ranking de expertos lo realizó ExpertPruner de LLM Compressor, y un exportador específico de ModelOpt copió las filas empaquetadas retenidas. El manifiesto del repositorio lista los índices originales conservados en cada capa.

La exportación preserva el almacenamiento NVFP4/MXFP8 original, los metadatos de cuantización, los denominadores de escala compartidos, los pesos de visión y el drafter DSpark. Las filas de expertos retenidas y sus filas de router asociadas se copian del checkpoint original. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni sobre si se aplicaron RLHF o DPO. La innovación técnica destacable de esta variante es la combinación de poda de expertos por saliencia con cuantización FP4 y la conservación del drafter DSpark, presumiblemente para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `image-text-to-text`).
- Procesamiento de imagen y texto combinados, dado que el checkpoint conserva los pesos de visión.
- Razonamiento con parser dedicado (`--reasoning-parser inkling` en vLLM).
- Tool calling y function calling, con parser específico (`--tool-call-parser inkling`) y `--enable-auto-tool-choice`.
- Ejecución de tareas agénticas de múltiples pasos: el autor reporta 6/6 tareas retenidas de OpenCode superadas en vLLM con el checkpoint nativo.
- Decodificación especulativa mediante el drafter DSpark preservado en la exportación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente de programación agéntico: el modelo superó 6/6 tareas retenidas de OpenCode en vLLM, lo que lo hace adecuado para flujos de trabajo de edición de código multi-paso con tool calling habilitado.
- Automatización de atención al cliente con contexto largo: el despliegue de referencia admite `--max-model-len 16384`, suficiente para conversaciones multi-turno con historial extenso.
- Análisis de documentos con imagen: al conservar los pesos de visión, puede procesar capturas, diagramas o formularios junto con texto en un mismo pipeline `image-text-to-text`.
- Despliegue en estaciones de trabajo con GPU consumer: el checkpoint de 16,3 GB y las pruebas en una RTX 5060 Ti de 16 GiB permiten montar un servidor de inferencia local sin hardware de centro de datos.
- Prototipado de agentes con razonamiento explícito: el parser de razonamiento de vLLM permite separar la traza de pensamiento de la respuesta final en aplicaciones de planificación.
- Evaluación de técnicas de compresión: el manifiesto de índices retenidos y las estadísticas de calibración REAP lo convierten en un artefacto útil para investigar el impacto de la poda de expertos en modelos MoE multimodales.
- Servicio de inferencia de bajo coste con vLLM: la combinación de cuantización FP4 y poda reduce el footprint de memoria, permitiendo servir el modelo en entornos con VRAM limitada.

## Benchmarks y rendimiento

| Prueba | Resultado | Entorno |
|---|---|---|
| Tareas retenidas de OpenCode | 6/6 superadas (checkpoint nativo) | vLLM |
| Throughput de decodificación (mediana) | 15,57 tokens/s | RTX 5060 Ti 16 GiB, Docker Desktop/WSL2, 3 ensayos de 128 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son medidas piloto del autor y no constituyen una evaluación comparativa formal.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,3 GB en pesos NVFP4/MXFP8; el autor indica que el despliegue necesita memoria adicional para checkpoint, caché KV y scratch de runtime. En la prueba con 16 GiB se usó asignación explícita de KV.
- GPU recomendadas: RTX 5060 Ti 16 GiB verificada por el autor; GPUs con 24 GiB o más (RTX 4090, L40S) permitirían contextos mayores y mayor caché KV. No se dispone de datos para A100/H100 en la información proporcionada.
- Cabe en GPU consumer: sí, al menos en tarjetas de 16 GiB con configuración cuidadosa de la caché KV, según la prueba reportada.
- Opciones de despliegue: vLLM con build compatible con Inkling 2 Mini (recetas oficiales en recipes.vllm.ai). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: mediana de 15,57 tokens/s en decodificación sobre RTX 5060 Ti bajo WSL2; no hay datos de latencia de prefill ni de throughput con batching.

Comando de referencia del autor:

```
vllm serve qwaen/Inkling-2-Mini-REAP-96-NVFP4 --language-model-only --max-model-len 16384 --reasoning-parser inkling --enable-auto-tool-choice --tool-call-parser inkling
```

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-REAP-96-NVFP4 (este) | ~20,27 mil millones | no disponible (ejemplo a 16.384) | NVFP4/MXFP8 | Apache 2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de otros MoE multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de modelos comparables de la misma categoría, por lo que la comparativa cuantitativa queda limitada al modelo base.

## Limitaciones y advertencias

- La poda REAP elimina 32 de 128 expertos por capa física; no se han publicado evaluaciones que cuantifiquen la pérdida de calidad frente al checkpoint original más allá de las 6 tareas de OpenCode.
- Los benchmarks reportados (6/6 en OpenCode y 15,57 tokens/s) son mediciones piloto del autor, sin protocolo comparativo ni repetición estadística robusta.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento en dominios sensibles.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- El despliegue requiere un build de vLLM específicamente compatible con Inkling 2 Mini; otras herramientas de inferencia no están verificadas.
- La asignación explícita de caché KV es necesaria en GPUs de 16 GiB; configuraciones por defecto pueden provocar OOM.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwaen/Inkling-2-Mini-REAP-96-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión concreta del modelo base citada en la model card: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- Receta de despliegue vLLM para Inkling 2 Mini: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
