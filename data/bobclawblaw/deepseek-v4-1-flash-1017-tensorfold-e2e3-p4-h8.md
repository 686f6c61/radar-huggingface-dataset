# BobClawblaw/DeepSeek-V4.1-Flash-1017-TensorFold-e2e3-p4-h8

## Resumen

DeepSeek-V4.1-Flash-1017-TensorFold-e2e3-p4-h8 es un checkpoint de pesos cuantizados del modelo DeepSeek-V4.1-Flash-1017 (DeepSeek), convertido por el usuario BobClawblaw para el motor Metal nativo de TensorFold sobre un unico Apple Silicon de 256 GB. No es un modelo entrenado desde cero ni un fine-tune en el sentido habitual: es una conversion de los pesos originales a codigos afines de MLX con un esquema de cuantizacion mixta por partes (`e2e3` para expertos enrutados a 2 y 3 bits, `p4` para proyecciones densas a 4 bits, `h8` para cabeza y torre de imagen a 8 bits). El resultado son 566.591.466.194 parametros totales empaquetados en 201 GB de shards.

Su relevancia ahora es doble. Por un lado, demuestra que un modelo de ~566.000 millones de parametros puede servirse en hardware de consumo profesional Apple Silicon cuando se degradan selectivamente las partes menos sensibles (expertos enrutados) y se preservan en mayor precision las proyecciones densas y la cabeza. Por otro, lo hace con una trazabilidad de calidad poco habitual en checkpoints cuantizados: el autor publica divergencia KL frente a los pesos fp4 originales (0,138; acuerdo top-1 de 0,909) y comparaciones token a token contra cadenas de referencia FP32 y FP64.

La contrapartida es que el motor que consume estos pesos aun no esta publicado (solo existen runners de referencia en un gist) y que el checkpoint no es compatible con `mlx-lm`. Con 0 descargas y 0 likes en el momento de la consulta, es material de investigacion, no una opcion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): expertos enrutados, experto compartido, tensor de hyper-connection, indexer, tablas Engram y etapas draft DSpark (detalles completos no disponibles) |
| Parametros totales | 566.591.466.194 (~566,6 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group size 64, mixta: 2 bits (expertos enrutados de capas 0-9 y 30-39, y tres etapas draft DSpark), 3 bits (expertos enrutados de capas 10-29), 4 bits (proyecciones densas `wq_a`, `wq_b`, `wkv`, `wo_a`, `wo_b`, `wq_b` del indexer, experto compartido, `wkv` de Engram y `main_proj` de la cabeza draft), 8 bits (cabeza y torre de imagen). Sin cuantizar en bf16/fp32: norms, routers, compressors, proyecciones key/weight del indexer y tensores hyper-connection. Tablas Engram en FP8 e4m3 con escalas e8m0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (copyright DeepSeek, heredada del release) |
| Formato de pesos | safetensors con codigos afines de MLX; no es un checkpoint `mlx-lm`; libreria declarada `mlx` |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento: este repositorio es una conversion de pesos, no un entrenamiento ni un ajuste fino. Lo que si se deduce de los nombres y formas de los tensores es una arquitectura transformer con mezcla de expertos: expertos enrutados apilados por capa con forma `layers.N.ffn.experts.w{1,2,3}` [384, out, in], un experto compartido, y `wo_a` apilado por grupo con forma [8, 1024, 4096]. Aparecen ademas componentes que no son habituales en un transformer denso: tensores de hyper-connection, un "indexer" con su propia proyeccion `wq_b` y proyecciones key/weight, tablas Engram (memoria n-gram con estado de hash) y una torre de imagen en 8 bits, lo que sugiere capacidad multimodal de entrada visual. La etiqueta de HuggingFace incluye `base_model:finetune`, pero la model card describe exclusivamente una conversion, no un fine-tune; la discrepancia no esta resuelta en la informacion disponible.

El esquema de cuantizacion es el elemento tecnico central. Los expertos enrutados, que concentran el grueso de los parametros, bajan a 2 bits en las capas 0-9 y 30-39 y a 3 bits en el bloque central 10-29; las proyecciones densas de atencion y del experto compartido se mantienen a 4 bits; cabeza y torre de imagen a 8 bits; y normas, routers, compressors e indexers quedan sin cuantizar. Las dos tablas Engram conservan los bytes FP8 originales, reempaquetados una fila por span (`rows` u8 [N, 264]: 256 bytes e4m3 mas 8 escalas e8m0) y divididas en tres partes por tabla de ~34 GB cada una. El checkpoint incluye tambien tres etapas draft DSpark, es decir, un mecanismo de decodificacion especulativa integrado, y el benchmark de velocidad se ejecuta con los drafts activados.

## Capacidades

- Generacion de texto en prosa, con velocidades medidas de 70,6 tok/s en un solo stream y 76,6 tok/s con dos streams en un M5 Ultra.
- Generacion de codigo: es la categoria mas rapida en el benchmark de velocidad (96,3 tok/s en un stream, 94,7 tok/s con dos).
- Salida estructurada y listas: el harness mide "structured" (76,1 tok/s) y "list" (91,6 tok/s) por separado, lo que confirma que el modelo se ha ejercitado con formatos estructurados y enumeraciones.
- Decodificacion especulativa mediante tres etapas draft DSpark, ya integradas en el checkpoint.
- Memoria n-gram mediante tablas Engram con estado de hash de n-gramas, orientada a recuperacion de secuencias.
- Entrada visual probable: existe una torre de imagen cuantizada a 8 bits (`h8`), aunque la model card no describe la tarea de vision ni su evaluacion (no disponible).
- Modo "thinking" (razonamiento extendido): la model card menciona explicitamente que no se ha ejecutado ninguna suite de calidad con thinking activado o desactivado, lo que implica que el modo existe en el modelo base, pero no hay datos de rendimiento (no disponible).
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles; no se han publicado evaluaciones.
- Idiomas: no disponible.

## Casos de uso

- Investigacion en cuantizacion mixta: el checkpoint es un caso de estudio reproducible de asignacion de bits por tipo de tensor (2/3/4/8) sobre un MoE de ~566 B, con metricas de divergencia KL y de acuerdo top-1 publicadas. Util para validar metodologias de cuantizacion post-entrenamiento en modelos de gran escala.
- Inferencia local privada en Apple Silicon de 256 GB: un Mac Studio o equivalente puede servir el modelo sin salida a la nube, lo que encaja en entornos con requisitos de confidencialidad y presupuesto de GPU dedicada cero. El coste es 201 GB de shards en disco (418,1 GB de repositorio completo).
- Generacion de codigo en local: la categoria de codigo es la de mayor throughput medida (96,3 tok/s en un stream), y la latencia de primer token es de 0,13-0,19 s, adecuada para autocompletado interactivo en un editor.
- Prototipado de pipelines con salida estructurada: el harness ya ejercita la ruta "structured" y "list", de modo que el modelo puede usarse para generar JSON o listas normalizadas en herramientas internas, siempre que se valide el esquema aguas abajo.
- Evaluacion de decodificacion especulativa: las tres etapas draft DSpark permiten medir la ganancia real de aceptacion de drafts frente a decodificacion directa en un entorno Metal, un experimento dificil de replicar en GPUs CUDA.
- Reproducibilidad de referencia: los runners del gist ejecutan el `inference/model.py` de DeepSeek sobre estos pesos exactos, lo que sirve para contrastar implementaciones propias contra una cadena FP64 conocida (8,08 % NRMS, 252/268 posiciones con argmax coincidente).
- Docencia y divulgacion tecnica: comparar en directo las cadenas FP32, FP64 y este checkpoint mixto ilustra el impacto real de la cuantizacion en la distribucion de salida, con numeros medibles y no estimaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible. Los datos publicados son metricas de fidelidad de cuantizacion y de velocidad, medidas por el propio autor con su herramienta (`recipe-harness`, objetivo `deepseek-v41-m5`, ejecucion `20261017-193300`, un M5 Ultra de 256 GB, motor TensorFold `fcf9e0b4`, drafts DSpark activados, prompts cortos).

Calidad:

| Metrica | Resultado | Referencia |
|---|---|---|
| KL frente a los pesos fp4 del release | 0,138 | Teacher forcing sobre 4 prompts x 64 tokens de respuestas greedy del modelo fp4 |
| Acuerdo top-1 frente a fp4 | 0,909 | Misma evaluacion |
| NRMS del motor frente a cadena FP64 (8 tokens) | 8,08 % | 4,22 % entre las cadenas FP32 y FP64 (el motor esta a 1,91x de esa distancia) |
| Acuerdo top-1 (8 tokens) | 8/8 | Cadena FP64 |
| Respuesta greedy de 268 tokens | 252/268 posiciones con argmax coincidente con FP64 | La cadena FP32 coincide con FP64 en 250/268 |
| Suite de calidad tipo harness | No ejecutada | Ni con thinking activado ni desactivado |

Velocidad (tok/s de decodificacion y latencia de primer token):

| Streams | Prosa | Codigo | Estructurado | Lista | Primer token |
|---|---|---|---|---|---|
| 1 | 70,6 | 96,3 | 76,1 | 91,6 | 0,13-0,19 s |
| 2 (todos los streams) | 76,6 | 94,7 | 77,0 | 117,6 | 0,20-0,30 s |

## Requisitos de hardware

- VRAM/unified memory: el checkpoint se sirvio en un unico Apple Silicon con 256 GB de memoria unificada. Los shards suman 201 GB, por lo que se necesita un equipo con al menos ~210-230 GB disponibles para pesos mas cache y estado.
- GPU recomendadas: Apple M5 Ultra con 256 GB (unico hardware documentado en las mediciones). No hay datos para M3/M4 Ultra ni para configuraciones de menor memoria.
- GPU NVIDIA: no disponible. El checkpoint esta en codigos afines de MLX y no es un checkpoint `mlx-lm`, de modo que no se puede cargar directamente en vLLM, TGI o llama.cpp; no se documenta ninguna ruta CUDA.
- Consumer GPU: no cabe. Con 566,6 B de parametros y 201 GB de pesos empaquetados, ninguna GPU de consumo (RTX 4090, 24 GB) puede alojarlo, ni siquiera con offload parcial razonable.
- Disco: 418,1 GB de tamano de repositorio, incluidos los ficheros de las tablas Engram (~34 GB por parte, tres partes por tabla).
- Opciones de despliegue: motor TensorFold nativo para Metal (no publicado en el momento de la consulta) y los runners de referencia del gist del autor, que ejecutan el `inference/model.py` de DeepSeek sobre estos pesos. No hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado.
- Latencia y throughput: primer token de 0,13-0,19 s con un stream y 0,20-0,30 s con dos; decodificacion de 70,6-117,6 tok/s segun categoria y numero de streams, con drafts especulativos activados.

## Comparativa con modelos similares

No hay datos publicados de modelos comparables en la informacion disponible. La unica comparacion documentada es contra los propios pesos del release y las cadenas de referencia numerica, que no son modelos alternativos sino artefactos de validacion.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TensorFold e2e3-p4-h8) | 566,6 B (total) | no disponible | MLX affine mixta 2/3/4/8 bits, group 64 | MIT | safetensors MLX; motor no publicado, solo runners de referencia; 0 descargas |
| DeepSeek-V4.1-Flash-1017 (release, pesos fp4) | no disponible (es la base de este checkpoint) | no disponible | FP4 | MIT | safetensors; publicado en HuggingFace |
| Cadenas de referencia FP32 / FP64 de DeepSeek | no disponible | no disponible | Sin cuantizar | MIT | Ejecutables con `inference/model.py`; usadas solo como ground truth |
| Otros MoE abiertos de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El motor que sirve este checkpoint no esta publicado. Hoy solo puede leerse con ese motor o con los runners de referencia del gist; no hay una via de despliegue soportada ni mantenida.
- No es un checkpoint `mlx-lm`: no se puede cargar con el flujo habitual de MLX-LM, Ollama o llama.cpp. Cualquier integracion requiere adaptar el codigo de inferencia.
- Ausencia total de validacion tipo harness: no se ha ejecutado MMLU, HumanEval, GSM8K ni ninguna suite de calidad, ni con thinking activado ni desactivado. No hay evidencia publicada de calidad absoluta, solo de fidelidad frente a los pesos fp4.
- La metrica de calidad principal (KL 0,138, acuerdo top-1 0,909) se midio con la herramienta del propio autor y sobre 4 prompts x 64 tokens de respuestas greedy, una muestra muy pequena y no representativa de la distribucion completa de uso.
- La comparacion de tokens (252/268) usa una unica respuesta greedy de 268 tokens. Es evidencia de fidelidad, no una evaluacion de capacidad.
- Los expertos enrutados estan a 2 bits en 20 de las 40 capas (0-9 y 30-39). Es un nivel de cuantizacion agresivo cuyo impacto en tareas de razonamiento largo, matematicas o recuperacion exacta de datos no se ha medido.
- Riesgo de alucinacion: no evaluado. No hay datos de factualidad, tasas de alucinacion ni comportamiento en dominios especializados.
- Sesgos: no documentados. La model card no incluye ninguna evaluacion de sesgo, toxicidad o equidad.
- Idiomas: no disponible. Se desconoce la cobertura linguistica real, incluido el castellano.
- Contexto: no disponible. No se puede planificar el uso en escenarios de contexto largo sin conocer la ventana real del modelo base.
- Longitud de contexto, parametros activos y tool calling no estan documentados, lo que impide estimar coste por token y encaje en arquitecturas de agentes.
- Estado del repositorio: 0 descargas, 0 likes, creado el 2026-10-18 y actualizado el mismo dia. Sin validacion de la comunidad ni historial de mantenimiento.
- Licencia MIT heredada de DeepSeek, permisiva y apta para uso comercial segun el texto, pero conviene verificar el fichero `LICENSE` del release original antes de explotacion comercial, ya que la model card solo lo referencia.
- Dependencia de hardware exotico: requiere un Apple Silicon de ~256 GB de memoria unificada, lo que descarta practicamente cualquier infraestructura cloud estandar basada en NVIDIA.
- Discrepancia de metadatos: la etiqueta de HuggingFace indica `finetune` sobre el modelo base, mientras que la model card describe solo una conversion de pesos. No hay informacion que aclare si hubo algun ajuste adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BobClawblaw/DeepSeek-V4.1-Flash-1017-TensorFold-e2e3-p4-h8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Gist con los runners de referencia: https://gist.github.com/BobClawblaw/5e120cb3f7a7b3c9d7ca9b40ebea29f0
- Herramienta de benchmark del autor: https://github.com/BobClawblaw/recipe-harness
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
- Nota: los resultados de busqueda web devueltos no guardan relacion con el modelo (software de produccion musical y salud de SSD) y no aportan enlaces relevantes.
