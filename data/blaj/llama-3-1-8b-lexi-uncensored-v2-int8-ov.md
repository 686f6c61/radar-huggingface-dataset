# blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov es una conversion a formato OpenVINO IR del modelo Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, un fine-tune "uncensored" (abliterated) de Llama 3.1 8B de Meta. La publica el usuario blaj y su proposito no es aportar un modelo nuevo, sino empaquetar un LLM de 8 000 millones de parametros en un grafo IR cuantizado a int8 asimetrico por canal, listo para ejecutarse con OpenVINO Model Server sobre hardware Intel (CPU, iGPU Arc y NPU).

El interes practico esta en el formato: no hay safetensors ni GGUF, sino un IR stateful exportado en dos etapas (fp16 con optimum-cli y despues compresion de pesos con NNCF). Esto permite desplegar un 8B en equipos sin GPU dedicada, con un rendimiento medido de 11,3 tokens/s en single-stream sobre un Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM. Existen builds hermanas en int4 y fp16 del mismo autor.

Se trata de un modelo denso, decoder-only, de 32 capas y hidden size 4096, heredado de Llama 3.1 8B, y con la licencia Llama 3.1 Community License. Su orientacion "uncensored" implica que no aplica filtros de rechazo, lo que lo hace util para investigacion de seguridad, escritura creativa sin restricciones y generacion de datos sinteticos, pero problematico para cualquier despliegue de cara al publico sin una capa de moderacion propia. El repositorio es muy reciente y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only denso), 32 capas, hidden size 4096, vocabulario 128 256 |
| Parámetros totales | ~8 000 millones (8B) |
| Parámetros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible en la información del repositorio; el modelo base Llama 3.1 8B declara hasta 128 000 tokens |
| Tipos de cuantización | int8 asimétrico por canal (esta build). Builds hermanas: int4 y fp16 |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | OpenVINO IR (no safetensors, no GGUF) |
| Tamaño del repositorio | 7,6 GB según la model card; 8,1 GB según los metadatos de HuggingFace |
| Estado del grafo | stateful (expone `beam_idx`) |
| Formato de origen | safetensors BF16, 4 shards |
| Herramientas de conversión | optimum-cli (optimum-intel 2.2.0) + NNCF (`compress_weights`), transformers 5.5.0 |
| Modelo base | Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, sobre Meta Llama 3.1 8B |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B sin modificaciones estructurales: transformer decoder-only denso con 32 capas, dimensión oculta de 4096 y un vocabulario de 128 256 tokens. El autor no documenta ningún cambio de arquitectura ni de mecanismo de atención; el único trabajo propio es la conversión y cuantización. La variante "Lexi-Uncensored-V2" es un fine-tune de tipo abliterated, es decir, se han eliminado o atenuado las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo responde a instrucciones que un instruct estándar declinaría.

El proceso de conversión se hizo en dos etapas declaradas explícitamente: primero una exportación a OpenVINO con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`, y después una compresión de pesos a int8 con `nncf.compress_weights` sobre el propio IR. El autor advierte que una exportación directa a int4 en un solo paso provoca OOM en una máquina de 30 GB para esta clase de tamaño, lo que justifica el pipeline en dos fases. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el fine-tune original; esa información corresponde al modelo base y no está disponible aquí.

## Capacidades

- Generación de texto conversacional y de formato libre, con modo instruct heredado del fine-tune.
- Escritura creativa sin filtros de contenido: narrativa, roleplay y diálogo de temática adulta.
- Respuesta a instrucciones que los modelos alineados rechazan (comportamiento abliterated).
- Generación y razonamiento básico sobre código y matemáticas, en la medida en que lo soporte Llama 3.1 8B (no verificado con benchmarks en esta ficha).
- Capacidades multilingües: no documentadas en el repositorio; dependen del modelo base.
- No hay evidencia de soporte de tool calling o function calling en la documentación aportada.
- No se documenta modo "thinking", capacidades de visión, audio ni razonamiento multi-paso explícito.
- Inferencia stateful con caché de KV persistente entre pasos (campo `beam_idx` expuesto), lo que reduce el coste por token en generación autoregresiva.

## Casos de uso

- Escritura creativa y narrativa adulta: el modelo no aplica rechazos, por lo que puede generar ficción con violencia, contenido sexual o temas sensibles sin que la capa de alineamiento interrumpa la generación. Adecuado para autores que trabajan en esos géneros.
- Investigación en seguridad y alineamiento: sirve como sujeto de pruebas para estudiar qué comportamientos emergen al eliminar las direcciones de rechazo, y como baseline frente a modelos alineados en experimentos de red teaming.
- Generación de datos sintéticos: producción de diálogos y textos etiquetados en dominios donde un modelo censurado se negaría a generar ejemplos, útil para aumentar datasets de clasificación o de moderación.
- Despliegue local en hardware Intel sin GPU dedicada: al ser un IR int8, se ejecuta vía OpenVINO Model Server sobre CPU, iGPU Arc o NPU, con 11,3 tokens/s en single-stream medidos en un Core Ultra 7 258V.
- Asistente conversacional offline en puesto de trabajo: el grafo es stateful y el repositorio pesa ~8 GB, por lo que cabe en un portátil con 16-30 GB de RAM y permite conversaciones multi-turno sin conexión ni coste de API.
- Prototipado de pipelines RAG en entornos aislados: combinado con una base vectorial local y OVMS exponiendo la API REST en el puerto configurado, se puede montar un asistente documental sobre corpus privados sin enviar datos a terceros.
- Reescritura y parafraseado de textos crudos: útil para normalizar o reformular material de dominios sensibles (informes médicos, jurídicos, contenido para adultos) donde otros modelos añaden evasivas.
- Base para fine-tunes posteriores: al estar disponible también en fp16 e int4, sirve como punto de partida o de comparación de calidad entre niveles de cuantización en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento publicado es un benchmark de throughput de decodificación realizado por el autor.

Condiciones de la medición: single-stream, Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificación greedy, máximo 128 tokens nuevos, media de 3 ejecuciones tras el calentamiento.

| Build | Tokens/s | Relativo a int4 |
|---|---|---|
| int4 | 23,5 | 1,00x |
| int8 (esta build) | 11,3 | 0,48x |
| fp16 | 6,0 | 0,26x |

El autor señala que la decodificación en esa iGPU está limitada por ancho de banda de memoria, por lo que el throughput escala casi exactamente con el tamaño del modelo: int4 es a la vez el más pequeño y el más rápido. No se aportan datos de latencia de prefill, TTFT ni throughput en lote.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos int8 ocupan aproximadamente 7,6-8,1 GB, a los que hay que sumar la caché KV, cuyo tamaño depende del contexto y del número de secuencias simultáneas. Como referencia práctica, el autor lo ejecuta en una máquina con 30 GB de RAM compartida con la iGPU.
- Hardware validado: Intel Core Ultra 7 258V con iGPU Arc 130V/140V, 30 GB de RAM, OpenVINO Model Server 2026.4.0. Es el único entorno con medición publicada.
- Hardware probablemente compatible: CPU Intel con soporte OpenVINO, iGPU Arc dedicada o integrada, y NPU de las plataformas Core Ultra. No hay cifras publicadas para estos casos.
- GPU de datacenter (A100, H100) y GPUs consumer NVIDIA (RTX 4090 y similares): no aplica de forma nativa, porque el artefacto es un IR de OpenVINO y no un checkpoint PyTorch, GGUF o safetensors cargable por CUDA. Para usarlas habría que partir del modelo base o de una de las builds en fp16.
- Cabe en hardware consumer: sí, siempre que sea Intel y con OpenVINO. La build int4 y la fp16 amplían el rango de equipos compatibles.
- Opciones de despliegue: OpenVINO Model Server (OVMS) con un `ovms_config.json` que apunte a `base_path`, `target_device` y `nireq`; también es consumible desde la API de OpenVINO / OpenVINO GenAI en Python. No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que estos esperan GGUF o safetensors.
- Nota de despliegue: el repositorio contiene únicamente el IR; es necesario crear el fichero `graph.pbtxt` en el directorio del modelo (copiándolo de cualquier modelo LLM de OVMS) y arrancar el servidor con `PYTHONPATH=$OVMS_ROOT/lib/python ovms --config_path ./ovms_config.json --rest_port 11436`.
- Latencia y throughput: 11,3 tokens/s en single-stream sobre iGPU Arc con esta build int8. No hay datos de latencia de primer token ni de escalado con concurrencia.

## Comparativa con modelos similares

La comparación más directa disponible es entre las tres builds del mismo autor, ya que comparten pesos de origen y solo cambian el formato. No hay datos en la información proporcionada para comparar contra otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B Instruct en GGUF o AWQ).

| Build | Formato | Tamaño | Tokens/s (iGPU Arc, single-stream) | Licencia |
|---|---|---|---|---|
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov | OpenVINO IR int4 | menor que int8 | 23,5 | llama3.1 |
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov (esta) | OpenVINO IR int8 asimétrico per-channel | 7,6-8,1 GB | 11,3 | llama3.1 |
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov | OpenVINO IR fp16 | mayor que int8 | 6,0 | llama3.1 |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | safetensors BF16 | no disponible | no disponible | llama3.1 |

Comparativa con alternativas de otros ecosistemas: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo uncensored: las salidas no están filtradas. El propio autor advierte de que hay que evaluarlo antes de desplegarlo. Cualquier uso de cara al público requiere una capa de moderación externa.
- Comportamiento abliterated: la eliminación de las direcciones de rechazo puede degradar la coherencia en tareas que requieren seguir instrucciones de seguridad, y no hay benchmarks que cuantifiquen esa pérdida.
- Riesgo de alucinación: inherente a un modelo de 8B sin verificación factual. No se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en el repositorio, pero heredados de Llama 3.1 8B y potencialmente amplificados por el fine-tune sin alineamiento.
- Contexto: la longitud de contexto real de esta build no está declarada. Aunque el modelo base soporte hasta 128 000 tokens, la conversión y la cuantización int8 pueden afectar al comportamiento en contextos largos, y no hay mediciones al respecto.
- Idiomas: no se declara la lista de idiomas soportados. El rendimiento fuera del inglés no está verificado.
- Restricciones de licencia: Llama 3.1 Community License. Permite uso comercial con condiciones, pero impone obligaciones de atribución, obligaciones de nomenclatura en productos derivados y una política de uso aceptable que prohíbe expresamente determinados usos. Conviene revisar el texto completo antes de un despliegue comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con dos minutos de diferencia. No hay validación de la comunidad ni issues públicos.
- Portabilidad: al ser OpenVINO IR, queda atado al ecosistema Intel. Migrar a otra plataforma exige reconvertir desde el modelo base.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni comparaciones con el modelo sin cuantizar, por lo que no se puede estimar la degradación introducida por int8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov
- Build hermana int4: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov
- Build hermana fp16: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov
- Modelo base (fine-tune uncensored): https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo (papers, blogs, repos o demos). No se dispone de enlaces adicionales verificables.
