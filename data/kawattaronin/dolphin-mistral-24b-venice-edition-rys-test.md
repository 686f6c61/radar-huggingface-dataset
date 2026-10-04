# kawattaronin/Dolphin-Mistral-24B-Venice-Edition-RYS-test

## Resumen

Dolphin-Mistral-24B-Venice-Edition-RYS-test es un modelo de lenguaje publicado por el usuario kawattaronin en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un *merge* generado con LazyMergekit sobre un único modelo base: dphn/Dolphin-Mistral-24B-Venice-Edition. La configuración publicada usa el método `passthrough`, es decir, una operación de cirugía de capas sobre el propio modelo base, sin mezclar pesos de modelos distintos.

El repositorio contiene pesos en formato safetensors con precisión bfloat16 y un total real de 22.460.892.160 parámetros (aproximadamente 22,46 mil millones), según el recuento de los ficheros de safetensors. Es destacable la discrepancia entre el nombre comercial ("24B") y el recuento real de parámetros. El tamaño del repositorio es de 44,9 GB. La etiqueta `mistral3` indica que la arquitectura subyacente corresponde a la familia Mistral 3 tal y como la identifica la librería transformers.

Por el momento el modelo acumula 0 descargas y 0 "likes", no tiene model card descriptiva más allá del bloque de configuración del merge y carece de licencia, idiomas y pipeline declarados. El sufijo "RYS-test" y la propia configuración sugieren un experimento técnico más que una publicación destinada a producción. Es relevante ahora únicamente como caso de estudio de merges con mergekit y como posible base para experimentación, no como modelo recomendado para despliegue sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (etiqueta `mistral3` en transformers) |
| Parámetros totales | 22.460.892.160 (~22,46B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en bfloat16; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | dphn/Dolphin-Mistral-24B-Venice-Edition |
| Método de fusión | mergekit / laxymmergekit, método `passthrough` |
| Tamaño del repositorio | 44,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto. El modelo es el resultado de un merge con mergekit (LazyMergekit) cuyo único origen es dphn/Dolphin-Mistral-24B-Venice-Edition. La configuración publicada opera sobre el módulo `text_decoder` dividiéndolo en tres segmentos: las capas [0, 30] se copian tal cual del modelo base; la capa [31, 31] se copia con escalados específicos (factor 0,5 para `self_attn.o_weight`, factor 0,0 para las capas `mlp` y factor 1,0 para el resto); y las capas [31, 39] se copian de nuevo del modelo base. La precisión de salida declarada es bfloat16.

La lectura técnica de este YAML es la de un experimento de ablación o de retoque puntual de una única capa: el factor 0,0 sobre `mlp` anula los pesos de las capas MLP de ese segmento, y existe un solapamiento entre los rangos [31, 31] y [31, 39] en la misma capa. El efecto efectivo de ese solapamiento y del escalado no está documentado por el autor, por lo que no puede afirmarse qué tensores prevalecen en el modelo final. No se han publicado datos sobre el dataset, el número de tokens, ni sobre fases de RLHF, DPO o SFT aplicadas a este merge; tampoco hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: al derivar de un modelo Mistral de ~22,5B afinado por Dolphin, la capacidad de generación de texto y de diálogo multi-turno es esperable, pero no está verificada mediante benchmarks publicados para este merge concreto.
- Razonamiento y matemáticas: no disponible (sin evaluaciones publicadas).
- Generación de código: no disponible (sin evaluaciones publicadas).
- Tool calling / function calling: no disponible; la model card solo muestra un ejemplo de uso con `transformers.pipeline` y `apply_chat_template`, sin plantilla de herramientas documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo "thinking", visión, audio): no disponible. Las etiquetas del repositorio no mencionan modalidades adicionales a texto.
- Compatibilidad de plantilla de chat: el ejemplo del autor usa `tokenizer.apply_chat_template(messages, ...)`, lo que implica que la plantilla de chat del modelo base está disponible a través del tokenizador.

## Casos de uso

- Estudio de merges con mergekit: el modelo sirve como ejemplo reproducible de un merge `passthrough` con escalado selectivo de subcapas (`self_attn.o_weight`, `mlp`), útil para quien quiera entender el formato de configuración de LazyMergekit.
- Investigación sobre ablación de capas MLP: la anulación de los pesos MLP en el segmento [31, 31] permite experimentar con el impacto de esa intervención en la perplejidad y en tareas concretas, siempre que se realicen las evaluaciones oportunas.
- Generación de texto en local para pruebas informales: con ~22,46B parámetros en bfloat16 se puede ejecutar en GPUs de 80 GB o en configuraciones multi-GPU, y en cuantizaciones de 4 bits en GPUs de consumo, para experimentar con generación de texto y diálogo.
- Punto de partida para fine-tuning: el repositorio puede reutilizarse como checkpoint inicial para SFT o DPO propios, dado que no presenta ninguna evaluación de calidad previa.
- Comparación de recuento de parámetros frente a nombres comerciales: caso práctico para pipelines de validación que comprueben nombres de modelo frente a número real de parámetros declarados en safetensors.
- Conversión a GGUF como ejercicio de despliegue: al no publicarse cuantizaciones, convertir los pesos a GGUF con llama.cpp es un caso de uso realista para llevarlo a Ollama o LM Studio en hardware de consumo.
- Aviso importante: no se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario crítico sin una evaluación exhaustiva previa, dado que no existen benchmarks, no hay licencia declarada y el modelo es un test experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y el autor no documenta comparaciones con el modelo base ni con alternativas. Cualquier cifra de rendimiento asociada a este merge sería una extrapolación no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 45 GB solo para los pesos, más el coste de caché KV y overhead (estimación orientativa de 50-55 GB según longitud de contexto y tamaño de lote).
- VRAM estimada en int8: aproximadamente 22,5 GB para los pesos, más caché KV.
- VRAM estimada en int4: aproximadamente 11,5-13 GB para los pesos, más caché KV.
- GPUs recomendadas para precisión completa: A100 80 GB, H100 80 GB, o configuraciones de 2× RTX 4090 24 GB / 2× A6000 48 GB con reparto de capas.
- GPUs recomendadas para cuantización de 8 bits: RTX 4090 24 GB o A6000 48 GB (con margen limitado en la primera).
- GPUs de consumo compatibles: RTX 4080/4090 (16-24 GB) y Apple Silicon con memoria unificada de 32 GB o más, en cuantizaciones de 4 bits. Tarjetas de 8-12 GB no son suficientes salvo cuantizaciones muy agresivas y con contexto reducido.
- Opciones de despliegue: `transformers` con `accelerate` y `device_map="auto"` es la ruta documentada por el autor. vLLM y TGI son viables si la arquitectura etiquetada como `mistral3` está soportada por la versión correspondiente. llama.cpp, Ollama y LM Studio requieren convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kawattaronin/Dolphin-Mistral-24B-Venice-Edition-RYS-test | 22,46B (safetensors) | no disponible | no disponible | HuggingFace, 0 descargas | Merge `passthrough` de una sola fuente, sin benchmarks ni model card descriptiva |
| dphn/Dolphin-Mistral-24B-Venice-Edition | no disponible (modelo base declarado) | no disponible | no disponible | HuggingFace (modelo base) | Origen único del merge; sus especificaciones y licencia deben consultarse en su propio repositorio |
| Alternativas densas de ~20-30B de la misma categoría (por ejemplo, Mistral Small 3 24B o Gemma 2 27B) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

No se dispone de datos suficientes para una comparativa cuantitativa fiable. Cualquier comparación de rendimiento con otros modelos de tamaño similar requeriría ejecutar los mismos benchmarks sobre este merge, algo que no se ha hecho público.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, pruebas de calidad ni validación por parte de terceros; el rendimiento real es desconocido.
- Licencia no declarada: al no especificarse licencia, no puede asumirse uso comercial. Es imprescindible revisar la licencia del modelo base dphn/Dolphin-Mistral-24B-Venice-Edition antes de cualquier uso, incluido el comercial.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluaciones multilingües; el comportamiento fuera del inglés (y potencialmente del español) es incierto.
- Longitud de contexto desconocida: no se documenta la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- Modificación experimental de pesos: el merge aplica un factor 0,0 a las capas MLP del segmento [31, 31] y presenta solapamiento de rangos de capas, lo que puede degradar la coherencia del modelo de forma no medida.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no se ha realizado ninguna evaluación específica de fidelidad factual en este merge.
- Sesgos: no documentados. Al derivar de un fine-tuning tipo Dolphin, pueden heredarse sesgos del modelo base y de sus datos de ajuste, sin que exista auditoría publicada.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación comunitaria y de informes de errores.
- Metadatos dudosos: la fecha de creación indicada (2026-10-03) y el recuento de parámetros frente al nombre comercial ("24B" frente a 22,46B reales) aconsejan verificar los artefactos antes de integrarlos en cualquier pipeline.
- Sin cuantizaciones oficiales: el despliegue en hardware de consumo exige generar GGUF u otros formatos por cuenta propia, con el riesgo de degradación añadido.
- No apto para producción: por todo lo anterior, no debería emplearse en sistemas críticos, atención al cliente, generación de código en producción ni entornos regulados sin una evaluación completa y una revisión legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawattaronin/Dolphin-Mistral-24B-Venice-Edition-RYS-test
- Modelo base: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Cuaderno de LazyMergekit citado por el autor: https://colab.research.google.com/drive/1obulZ1ROXHjYLn6PPZJwRR6GzgQogxxb?usp=sharing
- Repositorio de mergekit (herramienta utilizada): https://github.com/arcee-ai/mergekit
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo; los resultados devueltos no guardan relación con él y se han descartado.
