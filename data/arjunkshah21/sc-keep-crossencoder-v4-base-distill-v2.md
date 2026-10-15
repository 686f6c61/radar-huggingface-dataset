# arjunkshah21/sc-keep-crossencoder-v4-base-distill-v2

## Resumen

sc-keep-crossencoder-v4-base-distill-v2 es un modelo de clasificación de texto con arquitectura cross-encoder basado en ModernBERT-base, publicado por el usuario arjunkshah21 (Arjun Shah) en HuggingFace. Se trata de un modelo "estudiante" obtenido por destilación a partir de sc-keep-crossencoder-v4-large, su versión "profesora" y, según la model card, la que se sirve en producción. Con 149.606.402 parámetros (~149,6 M) y un peso de unos 571 MB en safetensors, el objetivo declarado es ofrecer una alternativa más barata para experimentos locales o en máquinas modestas, sacrificando presumiblemente algo de precisión frente al modelo grande.

El modelo se enmarca en una familia de utilidades de compresión de contexto (etiquetas "context-compression", "supercompress", "neural-keep"): un cross-encoder que puntúa pares de textos para decidir qué fragmentos de contexto conviene conservar y cuáles descartar antes de pasarlos a un modelo generador. La model card menciona un umbral de inferencia (`inference_threshold`) de 0,42 almacenado en el fichero `sc_meta.json`, junto con métricas de "gate" que no se detallan en el texto disponible.

El modelo tiene licencia MIT, se distribuye en formato safetensors para la librería transformers, es compatible con text-embeddings-inference (TEI) y con endpoints, y a fecha de la información recogida registra 0 descargas y 0 "likes". Su relevancia es acotada: es una pieza de infraestructura interna para pipelines de compresión de contexto, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre encoder transformer ModernBERT (base_model: answerdotai/ModernBERT-base) |
| Parametros totales | 149.606.402 (~149,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base, ModernBERT-base, admite secuencias de hasta 8192 tokens) |
| Tipos de cuantizacion | no disponible; no se publican variantes GGUF, AWQ, GPTQ ni similares en la informacion consultada |
| Idiomas soportados | no disponible (el campo de idiomas figura como no disponible en la ficha de HuggingFace) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~571 MB; repositorio de 0,6 GB) |
| Tarea (pipeline) | text-classification |
| Umbral de inferencia | 0,42 (declarado en `sc_meta.json`) |
| Modelo profesor | arjunkshah21/sc-keep-crossencoder-v4-large |
| Libreria | transformers |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder construido sobre ModernBERT-base, un encoder transformer con atención bidireccional que procesa el par de textos de forma conjunta para emitir una puntuación de clasificación, en lugar de codificar cada texto por separado como haría un bi-encoder. El modelo hereda por tanto el tokenizador y la pila de capas de ModernBERT-base, con 149,6 M de parámetros totales, coherente con el tamaño del modelo base del que parte. La tarea declarada es text-classification, con etiquetas propias de la familia "neural-keep"/"supercompress": la decisión de conservar o descartar fragmentos de contexto.

El entrenamiento consistió en destilación desde el modelo profesor sc-keep-crossencoder-v4-large, según indica explícitamente la model card. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre la función de pérdida o los hiperparámetros usados en la destilación. Tampoco se detalla qué innovaciones técnicas adicionales incorpora más allá del propio esquema de cross-encoder y destilación. La model card remite a `sc_meta.json` para las métricas de la "gate" y el umbral de decisión, pero esos valores no se reproducen en el texto proporcionado.

## Capacidades

- Clasificación de pares de textos (cross-encoder) con salida de puntuación o etiqueta, orientada a decidir si un fragmento de contexto se conserva.
- Compresión de contexto: filtrado de pasajes candidatos antes de alimentar a un modelo generador, reduciendo el número de tokens de entrada.
- Puntuación de relevancia entre consulta y documento, típica de los cross-encoders usados como reranker.
- Integración con text-embeddings-inference y con endpoints compatibles para servir el modelo como servicio.
- Capacidad de destilación implícita: replica el comportamiento del profesor v4-large en un tamaño menor, pensado para entornos locales.
- Generación de texto: no disponible, no es un modelo generativo.
- Tool calling / function calling: no disponible, no es una capacidad declarada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no es una capacidad declarada.
- Capacidades multilingües: no disponible, no se documentan idiomas.
- Visión, audio o modo "thinking": no disponible, no se declaran.

## Casos de uso

- Filtrado de contexto en pipelines RAG: el cross-encoder puntúa cada pasaje recuperado frente a la consulta y descarta los que quedan por debajo del umbral 0,42, reduciendo la ventana que se envía al modelo generador y bajando coste por consulta.
- Reranking en búsqueda documental: dado un conjunto de candidatos devueltos por un retriever bi-encoder, el modelo reordena y selecciona los más relevantes antes de la etapa de respuesta.
- Compresión de contexto en asistentes conversacionales: al acumularse historial largo, el modelo decide qué turnos antiguos merecen conservarse, permitiendo mantener conversaciones multi-turno sin disparar el consumo de tokens.
- Preprocesado en pipelines de anotación a gran escala: clasificar pares (consulta, fragmento) de forma masiva en CPU o GPU pequeña, dado el reducido tamaño del modelo (571 MB de pesos).
- Experimentación y ablations en investigación: al ser la versión destilada del v4-large, sirve para reproducir y comparar decisiones de compresión en máquinas sin GPU dedicada, antes de validar con el modelo grande.
- Despliegue en el borde o en entornos con recursos limitados: al contar con una variante compatible con text-embeddings-inference, puede servirse como microservicio de filtrado en infraestructura modesta.
- Evaluación de calidad de destilación: comparar las decisiones del estudiante frente a las del profesor v4-large en el mismo conjunto de pares para medir la pérdida de precisión introducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas de "gate" y un umbral de inferencia de 0,42 en el fichero `sc_meta.json`, pero no se reproducen valores numéricos (ni MMLU, ni tareas de clasificación, ni comparativas con el profesor) en la información consultada.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 0,6 GB solo para pesos, más activaciones; repositorio de safetensors de 0,6 GB.
- VRAM estimada en FP16/BF16: del orden de 0,3 GB para pesos, más memoria de activaciones.
- VRAM estimada en INT8: aproximadamente 0,15 GB para pesos.
- VRAM estimada en INT4: aproximadamente 0,075-0,08 GB para pesos, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; no se requiere A100 ni H100. Cabe en RTX 3060, RTX 4060, RTX 4090, T4, L4 y similares, y también en CPU para lotes pequeños.
- Inferencia en CPU: viable dado el tamaño (149,6 M de parámetros), aunque el throughput no está documentado.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference (etiqueta oficial), endpoints compatibles. Sentence-transformers CrossEncoder es una vía habitual para este tipo de modelos según la documentación consultada. No se declara soporte de llama.cpp, Ollama, vLLM ni formatos GGUF.
- Latencia y throughput estimados: no disponible; no se publican cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sc-keep-crossencoder-v4-base-distill-v2 | 149,6 M | no disponible | Cross-encoder de compresion de contexto (destilado) | MIT | HuggingFace, 0 descargas |
| sc-keep-crossencoder-v4-large (profesor) | no disponible | no disponible | Cross-encoder de compresion de contexto | MIT | HuggingFace, modelo servido en produccion segun la model card |
| answerdotai/ModernBERT-base | no disponible en la informacion consultada | no disponible | Encoder transformer de proposito general | no disponible en la informacion consultada | HuggingFace, modelo base del que parte el estudiante |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a tamano, licencia y disponibilidad. Alternativas de terceros de la misma categoria (cross-encoders de reranking) no se detallan aqui por falta de datos verificados en las fuentes consultadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo ni de equidad.
- Riesgo de alucinacion: el modelo no genera texto, por lo que el riesgo se traslada a falsos positivos o falsos negativos en la decision de conservar contexto, lo que puede degradar la respuesta del modelo generador que consume su salida.
- Limitaciones de contexto: no se documenta la longitud de secuencia soportada en la ficha del modelo; el modelo base ModernBERT-base admite hasta 8192 tokens, pero no se confirma que el estudiante conserve ese limite.
- Limitaciones de idioma: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; conviene revisar igualmente las condiciones del modelo base answerdotai/ModernBERT-base, cuya licencia no se detalla en la informacion consultada.
- El modelo no es la version de produccion: la model card indica explicitamente que produccion sirve v4-large, por lo que este estudiante es para experimentos locales y puede rendir peor que el profesor.
- Umbral de decision: el valor 0,42 es especifico de esta version y deberia recalibrarse si se aplica a un dominio distinto del de entrenamiento.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Ausencia de benchmarks publicados: no hay evidencia numerica de su calidad frente al profesor ni frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arjunkshah21/sc-keep-crossencoder-v4-base-distill-v2
- Modelo profesor (v4-large): https://huggingface.co/arjunkshah21/sc-keep-crossencoder-v4-large
- Perfil del autor (Arjun Shah): https://huggingface.co/arjunkshah21/models
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Documentacion de la arquitectura CrossEncoder en sentence-transformers: https://deepwiki.com/huggingface/sentence-transformers/3.2-crossencoder-architecture
- Paper relacionado sobre destilacion con cross-encoders (LLMDistill4Ads): https://arxiv.org/abs/2508.03628v4
