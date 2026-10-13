# happyme531/MiniCPM5-2B-W4A8-Mixed-QQQ-Rot

## Resumen

MiniCPM5-2B-W4A8-Mixed-QQQ-Rot es una version cuantizada tras entrenamiento (post-training quantization) del modelo openbmb/MiniCPM5-2B, desarrollada por el usuario independiente happyme531. Se trata de un derivado que conserva la arquitectura original y la plantilla de chat nativa del modelo base, pero sustituye los pesos de las capas lineales por una representacion mixta de 4 y 8 bits, manteniendo embeddings y parametros restantes en BF16. El tensor empaquetado ocupa 2,104 GiB y el repositorio completo 2,3 GB.

El checkpoint resuelve un problema practico de despliegue: reducir el coste de memoria y el ancho de banda necesario para servir un modelo de aproximadamente 2.500 millones de parametros sin degradar de forma apreciable la calidad. Emplea una rotacion Hadamard offline fija combinada con el solver QQQ, cuantizacion por canal (per-output-channel) de pesos en W4/W8 y activaciones dinamicas per-token en INT8. El modelo base deriva de la familia MiniCPM de OpenBMB / ModelBest, soporta ingles y chino, y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en que documenta de forma reproducible una receta de cuantizacion mixta poco habitual, con herramientas de cuantizacion independientes, mascara W8 exacta y referencias ordenadas de calibracion. Los resultados publicados muestran un aumento de perplejidad del 3,14% en WikiText-2 respecto a los pesos originales, con una caida moderada en CMMLU y una mejora marginal en una submuestra fija de GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 2.516.756.480 (aproximadamente 2,52 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4/W8 mixto por canal en pesos, activaciones INT8 dinamicas per-token (maxabs/127); rotacion Hadamard offline fija + QQQ |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors en formato pack-quantized |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LlamaForCausalLM del modelo base openbmb/MiniCPM5-2B, obtenido desde ModelScope en la revision 289c5dc6f6a855f0a0434e3bbe6b72e043abf005. No se entrena un modelo nuevo: se aplica cuantizacion post-entrenamiento sobre los pesos originales. La receta combina una rotacion Hadamard signed residual offline con el solver QQQ. La rotacion emplea un tamano oculto de 2048 y semilla 42, y la dimension Hadamard de la cabeza de valor es 128. Las rotaciones se pliegan sobre los pesos en tiempo offline, sin transformacion en linea, y se verifico la equivalencia de logits en FP32 antes del almacenamiento en BF16.

La cuantizacion usa pesos simetricos por canal de salida en W4/W8 con escalas FP32, mientras que embeddings y el resto de parametros permanecen en BF16. De las capas lineales del decodificador, 84 quedan en W4 y 211 en W8, y el 53,33% de los elementos de peso de las lineales del decodificador son W4. Las proyecciones W8 incluyen lm_head, las proyecciones q/k/v/o y las proyecciones down del MLP en las 42 capas; las proyecciones gate/up del MLP se mantienen en W4. Los ajustes QQQ son: group size -1, block size 128, damping 0,01 y actorder=False. Las activaciones se cuantizan de forma dinamica per-token en INT8 con maxabs/127.

La calibracion se construyo a partir de un pool de 256 conversaciones completas: 128 ejemplos en chino de COIG-CQIA verificados por humanos, 64 problemas de entrenamiento de GSM8K con soluciones completas y 64 conversaciones en ingles de SmolTalk (48 ejemplos good/excellent de smol-magpie-ultra y 16 de smol-constraints). El checkpoint final usa 416 observaciones de calibracion: las 256 conversaciones, dos copias adicionales de los mismos 64 ejemplos de matematicas y 32 fragmentos originales de entrenamiento de WikiText-2 de 512 tokens cada uno, sumando 133.315 tokens de calibracion. El renderizado nativo de chat preserva respuestas completas y marcadores de fin, con un maximo de 1024 tokens y sin recorte de respuestas. Los anchos de bit se seleccionaron sobre ventanas separadas de validacion de WikiText, CMMLU dev335 y GSM8K train32.

## Capacidades

- Generacion de texto conversacional en ingles y chino, apoyandose en la plantilla de chat nativa del modelo base.
- Razonamiento aritmetico y resolucion de problemas de matematicas de tipo GSM8K, con respuestas que terminan en un formato de numero final.
- Comprension y evaluacion de conocimiento en chino, medida mediante CMMLU en el protocolo del autor.
- Generacion autoregresiva estandar con decodificacion greedy y soporte de generacion con cache (se verifico generacion con cache de 8 tokens).
- Compatibilidad con el ecosistema de transformers y compressed-tensors para carga completa y ejecucion forward.
- El modelo base declara soporte de modo thinking en la plantilla nativa (el protocolo de evaluacion de GSM8K usa enable_thinking=False), aunque las capacidades de razonamiento extendido tras la cuantizacion no se han evaluado.
- Soporte de tool calling, agentes y razonamiento multi-paso: no evaluado en este checkpoint.
- Capacidades de codigo, vision o audio: no disponibles para este checkpoint cuantizado.

## Casos de uso

- Despliegue en dispositivos con recursos limitados: gracias a su payload de 2,104 GiB y perfil W4A8, puede servirse en GPUs de consumo y entornos con VRAM reducida donde un modelo en BF16 de 2,5 B no cabria con holgura.
- Atencion al cliente en chino e ingles: el modelo mantiene la plantilla de chat nativa y se calibro con conversaciones reales de COIG-CQIA y SmolTalk, por lo que es adecuado para dialogos multi-turno en esos dos idiomas.
- Asistente de matematicas basicas: con un rendimiento de 92/100 en la submuestra fija de GSM8K, puede emplearse para resolver problemas aritmeticos escolares con salida estructurada de respuesta final.
- Evaluacion de conocimiento general en chino: util como componente de sistemas que requieran responder preguntas tipo test en chino, dado el resultado de 127/201 en CMMLU fijo 201.
- Prototipado e investigacion en cuantizacion: el repositorio incluye herramientas independientes, la mascara W8 exacta y las referencias de calibracion, lo que permite reproducir la receta o aplicar el mismo flujo a otros modelos.
- Servicio de inferencia tras un endpoint compatible: al declarar tags text-generation-inference y endpoints_compatible, puede integrarse en stacks de servido estandar de transformers.
- Generacion de texto ligera en pipelines de CI o pruebas automatizadas: su tamano reducido permite ejecutarlo en entornos de integracion sin GPUs de gama alta, aunque no hay datos de throughput publicados.

## Benchmarks y rendimiento

| Pesos | WikiText-2 PPL (menor es mejor) | CMMLU fijo 201 (mayor es mejor) | GSM8K fijo 100 (mayor es mejor) | Truncamientos GSM8K (menor es mejor) |
|---|---:|---:|---:|---:|
| Pesos originales sin cuantizar | 14,624683 | 133/201 (66,17%) | 91/100 | 3 |
| MiniCPM5-2B-W4A8-Mixed-QQQ-Rot | 15,083971 | 127/201 (63,18%) | 92/100 | 2 |

La perplejidad aumenta un 3,14% respecto a los pesos originales. Los pesos originales en BF16 se evaluaron con aritmetica de modelo en FP32. Las capas lineales cuantizadas usan una GEMM de referencia INT8xINT8 a INT32, cuantizacion de activaciones maxabs/127 y operaciones no lineales en FP32; la reduccion de NLL usa FP64.

Detalles de protocolo: WikiText-2 usa el wiki.test.raw original, sin tokens especiales anadidos, en ventanas completas de 512 tokens, evaluando objetivos en posiciones 257 a 511 (559 ventanas y 142.545 objetivos). CMMLU usa prompts de chat nativos y selecciona el logit mas alto del siguiente token entre A/B/C/D. GSM8K usa decodificacion greedy con enable_thinking=False, un presupuesto de 512 tokens nuevos y puntuacion por coincidencia exacta numerica; las respuestas truncadas cuentan como incorrectas. Estas submuestras fijas no son resultados completos de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de tensores cuantizados es de 2,104 GiB; sumando embeddings y parametros restantes en BF16 y la cache KV, una estimacion de trabajo razonable se situa en torno a 3-4 GB de VRAM con contextos moderados (estimacion derivada del tamano, no una medicion publicada).
- GPU recomendadas: no disponibles de forma oficial; por tamano, el modelo es apto para GPUs de consumo como RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090, y para GPUs de datacenter como A100 o H100 cuando se busca agregar muchas instancias.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM para contextos cortos; se requiere mas VRAM al aumentar el contexto por el crecimiento de la cache KV.
- Opciones de despliegue: transformers con compressed-tensors (carga completa, forward y generacion con cache verificados), text-generation-inference segun los tags del repositorio, y endpoints compatibles. El formato mixto W4/W8 es distinto del formato groupwise de GPTQ, AWQ, GGUF y del checkpoint nativo de QQQ, por lo que su uso en motores como llama.cpp u Ollama requeriria conversion previa (no documentada en la informacion disponible).
- Latencia y throughput: no disponible. El autor indica que la paridad completa de benchmarks y el throughput con motores de produccion no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| MiniCPM5-2B (base) | 2,52 B (BF16) | no disponible | sin cuantizar | apache-2.0 | disponible en openbmb |
| MiniCPM5-2B-W4A8-Mixed-QQQ-Rot | 2,52 B | no disponible | W4/W8 mixto + QQQ | apache-2.0 | este repositorio |
| Alternativas GPTQ/AWQ/GGUF de la misma familia | no disponible | no disponible | groupwise | no disponible | no encontradas en la informacion |

El autor senala explicitamente que el formato mixto W4/W8 por canal es distinto de los esquemas groupwise de GPTQ, AWQ y GGUF, y del checkpoint nativo de QQQ, lo que limita la comparacion directa con otras variantes cuantizadas de la misma familia. No se dispone de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion de calidad: la perplejidad en WikiText-2 sube un 3,14% y CMMLU baja de 66,17% a 63,18% respecto al modelo original. GSM8K fijo 100 sube ligeramente (de 91 a 92), pero se trata de una submuestra fija, no de un resultado completo de benchmark.
- Long-context, tool use y codigo no evaluados: el autor indica explicitamente que la calidad en contexto largo, el uso de herramientas y la generacion de codigo tras la cuantizacion no se han medido.
- Motores de produccion: los benchmarks se reportan con un runtime de referencia INT32; compressed-tensors estandar usa su escalado de activaciones por defecto, y no se ha medido la paridad completa de benchmarks ni el throughput con motores de produccion.
- Diferencias numericas entre GPUs: la reproduccion de la cuantizacion en arquitecturas de GPU distintas puede introducir diferencias en coma flotante; no se garantiza una regeneracion identica bit a bit.
- Formato no estandar: el esquema mixto W4/W8 por canal no es compatible directamente con kernels groupwise de GPTQ, AWQ, GGUF ni con el kernel nativo de QQQ, lo que puede complicar el servido en segun que motores.
- Idiomas: soporte declarado unicamente para ingles (en) y chino (zh); el rendimiento en otros idiomas no esta documentado.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible; estos riesgos son inherentes al modelo base y no se han medido tras la cuantizacion.
- Licencia: los pesos y las herramientas de cuantizacion se liberan bajo Apache-2.0. El codigo del solver QQQ procede de HandH1998/QQQ y conserva sus terminos originales, y los datos de calibracion siguen sujetos a las condiciones de sus datasets de origen. Se debe consultar LICENSE y el aviso adicional del repositorio.
- Atribucion: el modelo base es de OpenBMB / ModelBest; este checkpoint es un derivado cuantizado independiente y no oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/happyme531/MiniCPM5-2B-W4A8-Mixed-QQQ-Rot
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B
- Fuente original en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM5-2B
- Codigo del solver QQQ: https://github.com/HandH1998/QQQ
- Datasets de calibracion: m-a-p/COIG-CQIA, HuggingFaceTB/smoltalk, openai/gsm8k, Salesforce/wikitext
- Herramientas de cuantizacion y receta: carpeta quantization/ del repositorio (quantization/README.md)
