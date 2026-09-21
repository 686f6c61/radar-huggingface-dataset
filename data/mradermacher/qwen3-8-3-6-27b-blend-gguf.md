# mradermacher/Qwen3.8-3.6-27B-blend-GGUF

## Resumen

Qwen3.8-3.6-27B-blend-GGUF es un repositorio de cuantizaciones en formato GGUF publicadas por el usuario mradermacher a partir del modelo base JetBrains/Qwen3.8-3.6-27B-blend, un modelo resultante de una fusión lineal (linear-merge) de pesos etiquetada con la arquitectura qwen3_5. El repositorio no contiene un modelo entrenado desde cero, sino conversiones a GGUF de los pesos fusionados, pensadas para su ejecución en llama.cpp y en herramientas compatibles.

El interés práctico de esta ficha reside en que ofrece variantes cuantizadas listas para descarga (Q2_K a Q8_0, además de IQ4_XS y un fichero mmproj-f16 para el componente multimodal), lo que permite desplegar el modelo en hardware de consumo o en servidores sin GPU dedicada. La licencia declarada es Apache 2.0 y el único idioma declarado es el inglés.

Existe una discrepancia relevante que debe verificarse antes de usar el modelo: el nombre indica 27B, pero el recuento de parámetros en safetensors del modelo base registrado es de 460.730.096 parámetros (unos 0,46B). El tamaño del repositorio, 0,9 GB, es coherente con el segundo valor y no con un modelo de 27B. No se han publicado resultados de benchmarks ni documentación de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la familia Qwen (etiqueta qwen3_5); pesos obtenidos por linear-merge. Detalles de capas, atención y activaciones: no disponibles |
| Parámetros totales | 460.730.096 según el recuento de safetensors del modelo base (el nombre del modelo sugiere 27B; discrepancia sin resolver) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-f16 para el componente multimodal |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El repositorio es una conversión de pesos, no un artefacto de entrenamiento. La etiqueta qwen3_5 indica que la arquitectura subyacente pertenece a la familia Qwen, y las etiquetas merge y linear-merge indican que JetBrains/Qwen3.8-3.6-27B-blend se construyó combinando linealmente los pesos de varios modelos, una técnica habitual para mezclar capacidades sin reentrenamiento. Los metadatos de la herramienta de conversión (quantize_version 2, output_tensor_quantised 1, convert_type hf) confirman que las cuantizaciones se generaron con el flujo estándar de llama.cpp a partir de pesos en formato Hugging Face.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de ajuste fino supervisado, RLHF o DPO en los modelos de origen. Tampoco se documentan innovaciones técnicas de decodificación o atención. La presencia de un fichero mmproj-f16 (1,0 GB) sugiere que el modelo base incorpora un componente multimodal, presumiblemente un proyector visual, aunque el repositorio no detalla qué modalidad ni qué arquitectura de visión utiliza.

## Capacidades

- Generación de texto en inglés, heredada de los modelos fusionados que componen el blend; no hay documentación específica de capacidades en esta ficha.
- Posible soporte multimodal (visión) mediante el fichero mmproj-f16, sin confirmar en la documentación del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que el artefacto está preparado para su uso en infraestructuras de inferencia compatibles con ese formato.

## Casos de uso

- Inferencia local sin GPU: al distribuirse en GGUF y con un tamaño de repositorio de 0,9 GB, puede ejecutarse en llama.cpp u Ollama sobre CPU, lo que permite probar el modelo en portátiles o servidores sin acelerador.
- Prototipado rápido de aplicaciones en inglés: sirve para validar pipelines de generación de texto antes de comprometerse con un modelo mayor, gracias a la licencia Apache 2.0 y a la ausencia de coste de licencia.
- Despliegue en el borde (edge): si el recuento real de parámetros es de ~0,46B, el modelo en Q4_K_M o Q2_K ocupa unos pocos cientos de megabytes y puede integrarse en dispositivos con memoria muy limitada.
- Evaluación de fusiones de modelos: útil para investigadores que quieran comparar el comportamiento de un blend lineal frente a sus componentes originales, cargando las distintas cuantizaciones y midiendo la degradación por cuantización.
- Pruebas de pipelines multimodales: el fichero mmproj-f16 permite experimentar con entrada de imágenes en llama.cpp, siempre que el modelo base efectivamente soporte visión.
- Generación de texto de bajo coste en producción: si la calidad resulta suficiente para la tarea (clasificación, extracción de campos, resumen corto en inglés), el coste por token en CPU es muy inferior al de un modelo de decenas de miles de millones de parámetros.
- Base para cuantizaciones propias o ajustes finos: al estar publicado en Apache 2.0, permite derivar nuevas cuantizaciones con llama.cpp o servir como punto de partida para experimentos de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño de los pesos y deben verificarse contra el tamaño real del modelo, dada la discrepancia entre el nombre (27B) y el recuento de parámetros declarado (0,46B). Se ofrecen dos escenarios:

Escenario A, si el recuento de 460.730.096 parámetros es el correcto:

- VRAM estimada: ~1 GB en f16, ~0,5 GB en Q8_0, ~0,3 GB en Q4_K_M.
- Cabe en cualquier GPU de consumo, en GPU integradas e incluso en CPU con 2 GB de RAM libre.
- Despliegue recomendado: llama.cpp, Ollama, o servidores compatibles con GGUF.
- Throughput esperado: muy alto en CPU moderna, con latencias de decenas de milisegundos por respuesta corta.

Escenario B, si el modelo es realmente de ~27B parámetros:

- VRAM estimada (solo pesos): ~54 GB en f16, ~29 GB en Q8_0, ~22 GB en Q6_K, ~19 GB en Q5_K_M, ~16,5 GB en Q4_K_M, ~15 GB en IQ4_XS, ~13 GB en Q3_K_M, ~10 GB en Q2_K. Añadir entre 1 y 4 GB para caché KV y overhead según contexto.
- GPU recomendadas: A100 80 GB o H100 para f16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) o RTX 5090 para Q4_K_M e inferiores.
- GPU de consumo: sí, en RTX 4090, 3090, 4080 o equivalentes con cuantizaciones Q4_K_M o inferiores; en GPUs de 12-16 GB solo con Q3_K_M, Q2_K o IQ4_XS y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantización y del back-end.

## Comparativa con modelos similares

No se identificaron modelos comparables en la información proporcionada, salvo los artefactos derivados del mismo modelo base. La tabla recoge únicamente esos artefactos:

| Modelo | Formato | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-3.6-27B-blend-GGUF | GGUF (cuantizaciones estáticas) | 460.730.096 (según safetensors del base) | No disponible | Apache 2.0 | Este repositorio; incluye mmproj-f16 |
| mradermacher/Qwen3.8-3.6-27B-blend-i1-GGUF | GGUF (cuantizaciones ponderadas/imatrix) | Mismo modelo base | No disponible | Apache 2.0 | Variante i1, generalmente con menor perplejidad a igual tamaño |
| JetBrains/Qwen3.8-3.6-27B-blend | safetensors (Hugging Face) | 460.730.096 | No disponible | Apache 2.0 | Modelo base del que derivan ambas cuantizaciones |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría (por ejemplo, otros modelos de la familia Qwen del mismo orden de tamaño) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño sin resolver: el nombre sugiere 27B pero el recuento de safetensors indica 460.730.096 parámetros. Es imprescindible verificar el tamaño real antes de planificar hardware o presupuesto de inferencia.
- Modelo derivado de una fusión lineal: los blends pueden heredar sesgos, alucinaciones y comportamientos inconsistentes de cada modelo de origen, y la fusión no garantiza que se preserven todas las capacidades.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, código o matemáticas.
- Sin documentación de entrenamiento: se desconoce la composición del dataset, si hubo alineación (RLHF/DPO) y qué datos pudieron introducir sesgos.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en este caso.
- Cuantizaciones agresivas: Q2_K y Q3_K_S introducen pérdida de calidad apreciable; para producción se recomienda Q4_K_M o superior.
- Repositorio sin tracción: 0 descargas y 0 me gusta en el momento de la consulta, sin validación comunitaria.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias y condiciones de los modelos de origen de la fusión, que no se detallan en esta ficha.
- Componente multimodal no confirmado: la utilidad real del fichero mmproj-f16 depende de que el modelo base soporte visión, extremo no documentado.
- Fecha de creación del repositorio: 21 de septiembre de 2026, con última actualización el mismo día; el artefacto no ha sido revisado posteriormente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-3.6-27B-blend-GGUF
- Modelo base: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Cuantizaciones ponderadas/imatrix del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-3.6-27B-blend-i1-GGUF
- Página resumen del autor para este modelo: https://hf.tst.eu/model#Qwen3.8-3.6-27B-blend-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos correspondían a documentación de Microsoft Teams y se han descartado por no ser pertinentes.
