# LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16

## Resumen

Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16 es un modelo multimodal de tipo image-text-to-text publicado por LTM-Lab, un laboratorio independiente, sobre el checkpoint v15 de su propia familia. Se trata de un derivado del ecosistema Qwen (la nomenclatura y la arquitectura declarada `qwen4_exp` así lo indican) con 187.931.804.131 parámetros totales en formato safetensors y un repositorio de 102,3 GB, cuantizado en 8 bits mediante NVIDIA ModelOpt con un esquema FP4. El modelo base inmediato es LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15.

La característica diferencial de esta versión es la incorporación de una memoria episódica persistente denominada V16, implementada en el código de arquitectura que acompaña al checkpoint y que requiere cargar el modelo con `trust_remote_code=True`. Es decir, no se trata solo de un ajuste de pesos, sino de una extensión del grafo de inferencia que mantiene estado entre turnos. El pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto.

El interés de esta ficha es acotado y conviene decirlo con claridad: el modelo acumula cero descargas y cero likes en el momento de la consulta, la model card pública es de apenas un párrafo y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento. La licencia es `nvidia-open-model-agreement` (declarada como `other`), lo que condiciona el uso comercial. Todo lo que sigue se limita a lo verificable en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`qwen4_exp`), con extensión de memoria episódica V16 en inferencia; requiere `custom_code` |
| Parametros totales | 187.931.804.131 (187,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits con esquema FP4 (NVIDIA ModelOpt); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (declarada como `other`) |
| Formato de pesos | safetensors (repo de 102,3 GB) |

## Arquitectura y entrenamiento

La información disponible describe un transformer multimodal con pipeline image-text-to-text y tipo de arquitectura `qwen4_exp`. El checkpoint se distribuye cuantizado en 8 bits mediante NVIDIA ModelOpt con esquema FP4, lo que explica la relación entre los 187,9 mil millones de parámetros y un repositorio de 102,3 GB. El modelo incorpora código propio (`custom_code`) que añade una capa de memoria episódica persistente llamada V16, activa durante la inferencia; por ello la carga exige `trust_remote_code=True`. No se especifica si la arquitectura es densa o de mezcla de expertos, ni el número de parámetros activos.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF, DPO u otras) ni las innovaciones de decodificación. La model card indica únicamente que esta versión conserva los pesos preentrenados y el tokenizador del checkpoint v15 y que la novedad es la memoria episódica V16. El sufijo "Abliterated" en el nombre sugiere una modificación de los pesos orientada a eliminar comportamientos de rechazo, pero el autor no documenta el procedimiento ni su alcance.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según el pipeline declarado image-text-to-text.
- Memoria episódica persistente V16: el modelo mantiene estado entre interacciones dentro de una misma sesión de inferencia, lo que habilita conversaciones con continuidad más allá de la ventana de contexto inmediata.
- Conversación multi-turno (etiqueta `conversational`).
- Procesamiento de imágenes junto a instrucciones textuales, con salida en texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes conversacionales con memoria de sesión: la capa V16 permite conservar información de turnos anteriores sin depender exclusivamente del contexto textual, lo que resulta adecuado para atención al cliente prolongada o tutores interactivos donde el usuario retoma temas tras pausas.
- Análisis de documentos con imágenes: al aceptar image-text-to-text, puede emplearse para extraer y resumir información de capturas, diagramas o formularios escaneados junto a instrucciones textuales.
- Revisión asistida de interfaces y material visual: descripción de pantallas, detección de incoherencias en maquetas y generación de informes textuales a partir de imágenes.
- Prototipado de investigación sobre memoria en LLM: el checkpoint es útil para experimentar con estado persistente en inferencia y comparar su efecto frente a modelos sin memoria episódica.
- Evaluación de cuantización FP4 en producción: sirve para medir la degradación de calidad y el ahorro de memoria de un esquema de 8 bits/FP4 sobre un modelo de 187,9 mil millones de parámetros.
- Generación de descripciones accesibles: producción de texto alternativo y descripciones largas de imágenes para catálogos o repositorios documentales.
- Base para ajuste fino supervisado en dominios verticales: al estar en safetensors y cargarse con transformers, puede servir de punto de partida para adaptaciones con datos propios, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 187,9 mil millones de parámetros en safetensors y un repo de 102,3 GB, el peso en memoria ronda los 100 GB en el esquema cuantizado distribuido. En precisión completa (BF16/FP16) serían necesarios aproximadamente 376 GB solo para pesos, más caché KV y activaciones.
- GPU recomendadas: para el checkpoint cuantizado, un nodo multi-GPU con 8×H100 80 GB o 8×A100 80 GB es el escenario realista; configuraciones de 4×H100 80 GB podrían ser viables con paralelismo tensorial y cuidado en el reparto.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 24 GB, RTX 5090 32 GB) ni siquiera con cuantizaciones más agresivas no publicadas por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada, dado que la memoria V16 depende del código incluido. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; la presencia de `custom_code` complica su integración en estos motores sin adaptación.
- Latencia y throughput: no disponibles. La memoria episódica persistente añade estado por sesión, lo que puede incrementar el consumo de VRAM en función del número de conversaciones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16 | 187,9 mil millones | no disponible | NVIDIA Open Model Agreement | Hugging Face, 0 descargas | Memoria episódica V16, FP4, requiere `trust_remote_code` |
| Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15 | no disponible | no disponible | no disponible | Hugging Face | Checkpoint base directo; sin memoria V16 |
| Alternativas de la familia Qwen oficial | no disponible | no disponible | no disponible | Hugging Face | No se dispone de datos verificables en la información proporcionada |
| Alternativas multimodales de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No es posible establecer una comparación cuantitativa con modelos de la misma categoría porque no se han publicado benchmarks ni especificaciones de contexto para este checkpoint.

## Limitaciones y advertencias

- Ausencia total de validación pública: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros. No debe desplegarse en producción sin una evaluación propia.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del autor del repositorio. Es un riesgo de seguridad relevante y obliga a auditar el código antes de usarlo.
- Licencia NVIDIA Open Model Agreement: impone condiciones específicas de uso, redistribución y atribución. Conviene revisar el texto completo antes de cualquier uso comercial; el campo `license` figura como `other`.
- El sufijo "Abliterated" indica una modificación de los pesos orientada a reducir rechazos, sin documentación del método. Es previsible un aumento de respuestas a solicitudes sensibles y una menor fiabilidad de los mecanismos de seguridad.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y no puede asumirse.
- La memoria episódica persistente introduce estado entre turnos: puede acumular información sensible del usuario y complica el cumplimiento de normativas de privacidad si no se gestiona su borrado.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas de fidelidad factual.
- Longitud de contexto no disponible: no es posible planificar cargas de trabajo con documentos largos.
- El repositorio ocupa 102,3 GB, lo que encarece el almacenamiento, la transferencia y el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v16
- Checkpoint base v15: https://huggingface.co/LTM-Lab/Qwen3.8-Flash-Next-FP4-Local-Abliterated-v15/tree/bc85096304a2bd6da4ba439fb5bb6e32d0863b96
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada
