# Eustia1/checkpoint-183

## Resumen

`checkpoint-183` es un checkpoint de ajuste supervisado (SFT) del modelo Qwen3-VL en su variante LongVT, exportado como un modelo completo de Hugging Face en formato BF16 safetensors. Lo publica el usuario Eustia1 y se enmarca en la familia Qwen3-VL, concretamente en la arquitectura `Qwen3VLForConditionalGeneration`, un transformer multimodal que procesa imagen, vídeo y texto. El checkpoint corresponde al paso 183 de una ejecución de continuación de entrenamiento sobre un checkpoint previo de SFT (paso 3000), reiniciando optimizador y scheduler.

El modelo resuelve tareas de image-text-to-text con énfasis en comprensión de vídeo de contexto largo (LongVT), uso de herramientas y conversación multi-turno. Su relevancia es limitada: se trata de un checkpoint intermedio de investigación, entrenado sobre las 1.460 preguntas únicas del benchmark LVBench como experimento de ajuste in-sample, no como modelo de propósito general. El autor advierte explícitamente de que los resultados en LVBench no deben presentarse como generalización fuera de muestra.

El tamaño real de los pesos es de 8.767.123.696 parámetros (aproximadamente 8,8 mil millones), con un repositorio de 17,5 GB que incluye los cuatro shards de pesos, el índice, las configuraciones de modelo y generación, tokenizer, chat template y procesadores de imagen y vídeo. No se dispone de información sobre licencia ni sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3VLForConditionalGeneration` (transformer multimodal, familia Qwen3-VL) |
| Parametros totales | 8.767.123.696 (8,8 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportado en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, 4 shards + índice) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3VLForConditionalGeneration`, propia de la familia Qwen3-VL, que combina un codificador visual con un decoder de lenguaje para tareas de image-text-to-text. El checkpoint se exportó con `lmms_engine.merger.FSDP2Merger` y la configuración registra Transformers 4.57.1. La variante LongVT está orientada a comprensión de vídeo de contexto largo y a flujos de agente con herramientas, e incluye configuraciones de procesador de imagen y vídeo y un chat template preservado del entrenamiento.

El entrenamiento consistió en una continuación de SFT sobre el checkpoint-3000 de la ejecución `lvbench_assistant_mask_lr5e5_20261031`, con optimizador y scheduler reiniciados. Los datos fueron 1.460 preguntas únicas de LVBench, rellenadas a 1.464 filas, con 8 GPUs, batch global de 8, 1 época, learning rate 5e-5, schedule coseno, warmup ratio 0,03 y enmascaramiento de pérdida `assistant_only_v1`. No se documentan número total de tokens, composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generación de texto e image-text-to-text: el pipeline declarado es `image-text-to-text`, con soporte de entrada de imagen y vídeo.
- Comprensión de vídeo de contexto largo: la etiqueta `longvt` y el flujo de agente de vídeo apuntan a tareas sobre vídeos extensos, con una herramienta `crop_video` asociada al workflow.
- Uso de herramientas (tool use): el modelo está etiquetado para tool-use, aunque ejecutar el flujo de agente de vídeo requiere además el prompt compatible, el parser de herramientas y el bucle de ejecución de `crop_video`; cargar el modelo por sí solo no ejecuta herramientas de vídeo.
- Conversación multi-turno: etiqueta `conversational` y chat template exportado.
- Capacidades multilingües: no disponible.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de comprensión de vídeo largo en investigación: el checkpoint sirve para reproducir y estudiar el ajuste sobre LVBench, siempre etiquetando los resultados como in-sample y no como generalización.
- Prototipado de agentes de vídeo: combinando el modelo con el prompt, el parser de herramientas y el bucle de `crop_video`, se puede experimentar con recorte y análisis iterativo de fragmentos de vídeo.
- Análisis de contenido audiovisual con preguntas en lenguaje natural: dado un vídeo y una pregunta, el modelo genera una respuesta textual apoyándose en el procesador de vídeo exportado.
- Conversación multimodal multi-turno: el chat template preservado permite construir diálogos que alternan texto, imagen y vídeo.
- Base para ajuste fino posterior: al ser un export completo en BF16 safetensors, puede servir como punto de partida para nuevos SFT con `lmms_engine` u otras herramientas compatibles con Transformers.
- Estudio de estrategias de enmascaramiento de pérdida: el uso de `assistant_only_v1` lo hace útil para comparar el efecto del enmascaramiento solo en turnos del asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el checkpoint se entrenó sobre las preguntas de LVBench como experimento de ajuste in-sample y que sus resultados en LVBench no deben presentarse como generalización fuera de muestra.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 8,8 B parámetros en BF16 requiere aproximadamente 17,5 GB solo para pesos, a los que hay que sumar memoria para el codificador visual, caché KV y procesamiento de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPUs de 24 GB o más en BF16, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; dependería de la cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: la librería declarada es `transformers`; el autor menciona `lmms_engine` para exportación y el flujo de agente de vídeo. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Eustia1/checkpoint-183 | 8,8 B | no disponible | no disponible | Checkpoint SFT in-sample sobre LVBench; export BF16 |
| Qwen3-VL (modelo base de la familia) | no disponible en esta ficha | no disponible | no disponible | Arquitectura de referencia; el checkpoint deriva de ella |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos.

## Limitaciones y advertencias

- Sobreajuste in-sample: entrenado sobre las 1.460 preguntas de LVBench; sus métricas en ese benchmark no son válidas como generalización.
- Checkpoint intermedio: corresponde al paso 183 de una continuación de entrenamiento, no a un modelo final validado.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Contexto no documentado: no se especifica la longitud máxima de contexto, relevante para vídeo largo.
- Tool use incompleto por sí solo: requiere prompt compatible, parser de herramientas y bucle de `crop_video`; el modelo no ejecuta herramientas de vídeo de forma autónoma.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Eustia1/checkpoint-183
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
