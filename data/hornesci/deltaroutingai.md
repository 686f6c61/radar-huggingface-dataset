# HorneSci/DeltaRoutingAI

## Resumen

DeltaRoutingAI es un adaptador LoRA de continued pretraining publicado por HorneSci sobre el modelo base Qwen/Qwen3.8-27B (27 000 millones de parametros, autoría de Qwen). El adaptador pesa 233,6 MB en formato safetensors y se entrena con QLoRA (cuantizacion NF4 con computo en BF16) sobre un corpus de 30 ficheros de documentacion de la biblioteca estandar de CPython, con objetivo de causal language modeling. No es un modelo completo ni un modelo instruido: es un delta de pesos que debe cargarse junto al base fijado a la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.

El problema que aborda es acotado y medible: reducir la perplejidad del modelo base sobre texto tecnico de Python. Segun la evaluacion del propio autor, el adaptador rebaja la NLL de 1,339460 a 1,277668 (un 4,61 % menos) y la perplejidad de 3,816983 a 3,588264 sobre un conjunto retenido de ocho documentos, con un intervalo de confianza del 95 % de [-0,072400, -0,053326] calculado con 10 000 remuestreos bootstrap.

Su interes practico es el de un ejemplo reproducible de adaptacion de dominio: incluye trazabilidad completa (DATA_PROVENANCE.json, TRAINING_AND_VALIDATION.json y paquetes de benchmarks con entradas, puntuaciones, scripts y hashes), licencia Apache 2.0 con atribucion upstream y un sha256 publico del adaptador. Se trata de un artefacto de investigacion con 13 descargas y sin validacion externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA (rank 8, alpha 16, dropout 0) sobre Qwen/Qwen3.8-27B; se aplica a proyecciones DeltaNet de lenguaje, atencion y MLP |
| Parametros totales | 27B en el modelo base; adaptador de 233,6 MB (repo de 0,2 GB) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible; la secuencia de entrenamiento fue de 512 tokens |
| Tipos de cuantizacion | NF4 con doble cuantizacion y computo BF16 (bitsandbytes) en la ruta evaluada; no se publican pesos del adaptador ya cuantizados |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 (con aviso upstream de Qwen y avisos de datos: CPython, BIG-bench, MMLU-Pro, GSM8K, IFEval) |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json); libreria peft |
| Revision del modelo base | 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| SHA256 del adaptador | f1eabb12cffad143e788139f85c32ce9032e03b76cc562b7b6f72b6cd5b3ba1b |

## Arquitectura y entrenamiento

El adaptador se inyecta en las proyecciones de lenguaje DeltaNet, de atencion y de MLP del modelo base, mientras que los parametros del modelo base, del modulo de vision y de MTP (multi-token prediction) permanecen congelados. Es decir, el entrenamiento no toca ninguna capacidad multimodal ni de prediccion multiple de tokens; solo ajusta representaciones textuales. La configuracion LoRA es de rank 8, alpha 16, dropout 0.

El entrenamiento es deliberadamente reducido: 256 actualizaciones del optimizador y 261 632 tokens predichos, semilla 20261006, longitud de secuencia 512, microbatch 1, acumulacion de gradiente 2, AdamW con learning rate 2e-5 y cuantizacion NF4 de doble cuantizacion con computo BF16. El corpus son 30 ficheros de documentacion de bibliotecas de CPython en la revision `ebf955df7a89ed0c7968f79faec1de49f61ed7cb`, de los cuales ocho documentos forman el split retenido; se aplico un filtro de solapamiento de 25 palabras antes de evaluar. El objetivo es exclusivamente likelihood causal, no hay RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto y completado causal en ingles, con especializacion en texto tecnico de Python.
- Mayor verosimilitud sobre documentacion de la biblioteca estandar de CPython (reduccion de perplejidad medida del 6,0 % en el split retenido).
- Mejora reportada en deduccion logica de tres objetos con metrica de verosimilitud sumada (49/64 frente a 46/64 del base).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el adaptador no esta instruido.
- Capacidades multilingues: no, solo ingles declarado.
- Vision, audio o modo thinking: no entrenados por el adaptador; los pesos de vision y MTP permanecen congelados y la generacion de referencia se realiza con el chat template del base y el thinking desactivado.
- Reproducibilidad: helpers de carga con revision fijada, ficheros de procedencia de datos y paquetes de evaluacion con hashes.

## Casos de uso

- Generacion asistida de docstrings y documentacion de API en proyectos Python: el adaptador reduce la perplejidad sobre texto de referencia de CPython, por lo que produce continuaciones mas fieles al estilo y vocabulario de la documentacion oficial en tareas de completado de texto tecnico.
- Recuperacion aumentada (RAG) sobre documentacion de Python: al bajar la NLL sobre este dominio, el modelo puntua mejor las continuaciones candidatas, lo que resulta util como motor de generacion en asistentes de consulta de API, combinado con un indice de los mismos documentos de CPython.
- Investigacion en adaptacion de dominio: sirve como punto de partida reproducible para comparar recetas de QLoRA con pocos pasos (256 updates) y medir el impacto en NLL sobre un corpus retenido con intervalos bootstrap.
- Experimentos de ajuste incremental: al ser un adaptador PEFT de rank 8, se puede combinar o continuar el entrenamiento con nuevos datos de Python sin reentrenar el base de 27B, con coste de almacenamiento de 233,6 MB por delta.
- Evaluacion de pipelines de cuantizacion: la ruta NF4/BF16 con bitsandbytes esta fijada y documentada, lo que permite medir la degradacion introducida por la cuantizacion en un caso controlado.
- Generacion de texto tecnico en pipelines de documentacion (por ejemplo, resumenes o descripciones de funciones a partir de fragmentos de codigo y texto extraidos de CPython), siempre en ingles y con revision humana.
- Banco de pruebas para protocolos de evaluacion: los paquetes de benchmarks incluyen respuestas por item, subconjuntos congelados y scripts de replay, utiles para auditar metodologias de evaluacion de adaptadores.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor. Todas las cifras comparan el mismo base en NF4 con el adaptador desactivado y activado. Las tareas de BIG-bench usan subconjuntos congelados de 64 ejemplos; MMLU-Pro, GSM8K e IFEval usan 32, 16 y 8 casos respectivamente, con decodificacion greedy, limite de 768 tokens nuevos y cota de 60 segundos.

| Evaluacion | Qwen base | DeltaRoutingAI |
|---|---:|---:|
| NLL en CPython retenido (104 bloques, 53 144 tokens) | 1,339460 | 1,277668 |
| Perplejidad en CPython retenido | 3,816983 | 3,588264 |
| Falacias formales, verosimilitud sumada | 30/64 (46,88 %) | 29/64 (45,31 %) |
| Falacias formales, verosimilitud normalizada | 30/64 (46,88 %) | 29/64 (45,31 %) |
| Deduccion logica de tres objetos, verosimilitud sumada | 46/64 (71,88 %) | 49/64 (76,56 %) |
| Deduccion logica de tres objetos, verosimilitud normalizada | 43/64 (67,19 %) | 41/64 (64,06 %) |
| MMLU-Pro, likelihood adaptada de la opcion | 24/32 (75,00 %) | 24/32 (75,00 %) |
| GSM8K, exactitud numerica greedy adaptada | 15/16 (93,75 %) | 10/16 (62,50 %) |
| IFEval, restriccion unica estricta adaptada | 7/8 (87,50 %) | 6/8 (75,00 %) |

Respuestas truncadas que se mantienen en el denominador: GSM8K, 2/16 en el base y 6/16 en el adaptador; IFEval, 2/8 en el base y 5/8 en el adaptador. El intervalo de confianza bootstrap del 95 % para el cambio de NLL es [-0,072400, -0,053326]. El autor indica que estas puntuaciones describen los subconjuntos declarados y no evaluaciones oficiales de leaderboard.

## Requisitos de hardware

Estimaciones basadas en los 27B de parametros del modelo base; el autor no publica requisitos de hardware.

- VRAM para pesos en BF16/FP16: aproximadamente 54 GB solo en pesos, mas cache KV y activaciones.
- VRAM en NF4 (4 bits, ruta evaluada): aproximadamente 14-16 GB de pesos mas overhead de contexto.
- VRAM en INT8: aproximadamente 27-29 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, RTX 6000 Ada 48 GB (esta ultima con cuantizacion para dejar margen de contexto).
- En GPU de consumo: la ruta NF4 deberia caber en RTX 4090, RTX 3090 o RTX 5090 con 24 GB o mas, siempre con contexto reducido y verificando el pico de memoria real.
- Opciones de despliegue: transformers + peft + bitsandbytes (ruta reproducida por el autor con PyTorch 2.9.1 y CUDA 12.8), vLLM con soporte de adaptadores LoRA, TGI con adaptadores. llama.cpp u Ollama requeririan convertir el base y el adaptador a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles. La evaluacion del autor aplico un limite de 768 tokens nuevos con cota de 60 segundos por respuesta, lo que no permite derivar cifras de rendimiento.
- Nota: la model card marca `inference: false`, por lo que no hay widget de inferencia alojado en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| DeltaRoutingAI (adaptador sobre Qwen3.8-27B) | 27B (base) + adaptador de 233,6 MB | No disponible | Apache 2.0 | LoRA de continued pretraining sobre documentacion de Python | HuggingFace, 13 descargas |
| Qwen/Qwen3.8-27B (base, adaptador desactivado) | 27B | No disponible | Apache 2.0 (upstream) | Modelo base | HuggingFace |
| Otros adaptadores LoRA de continued pretraining sobre documentacion tecnica | No disponible | No disponible | No disponible | LoRA | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de alternativas directas en la misma categoria (adaptadores de dominio para modelos de clase 27B), por lo que no es posible establecer una comparativa cuantitativa con terceros. La unica comparacion con datos medidos es contra el propio modelo base.

## Limitaciones y advertencias

- No es un modelo de chat ni esta alineado por instrucciones: el objetivo es likelihood causal sobre texto, por lo que no debe esperarse seguimiento fiable de instrucciones, formato conversacional ni rechazo de peticiones problematicas.
- Solo ingles declarado; no hay soporte multilingue verificado.
- El entrenamiento es muy corto (256 actualizaciones, 261 632 tokens). La mejora se concentra en el dominio de documentacion de CPython y no implica capacidad general adicional.
- Degradacion en tareas fuera del dominio segun los propios datos: GSM8K cae del 93,75 % al 62,50 % y IFEval del 87,50 % al 75,00 %. Existe riesgo de olvido catastrofico, agravado por la alta tasa de respuestas truncadas del adaptador (6/16 en GSM8K y 5/8 en IFEval).
- Los subconjuntos de evaluacion son minusculos (64, 32, 16 y 8 ejemplos) y adaptados por el autor; no son comparables con puntuaciones oficiales de MMLU-Pro, GSM8K o IFEval. No hay validacion independiente.
- Riesgo de alucinacion: inherente a un modelo de 27B sin ajuste instructivo; la especializacion en documentacion de Python puede producir referencias a APIs plausibles pero inexistentes.
- Restricciones de licencia: el adaptador es Apache 2.0, pero su uso comercial queda sujeto a la licencia del modelo base y de los datos de entrenamiento y evaluacion (avisos de CPython, BIG-bench, MMLU-Pro, GSM8K e IFEval incluidos en el repositorio). Conviene revisar ATTRIBUTION.md y DATA_PROVENANCE.json antes de un despliegue en produccion.
- El adaptador requiere el base fijado a la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`; cargarlo sobre otra revision invalida la reproducibilidad declarada.
- Cualquier cifra de VRAM de esta ficha es una estimacion derivada del numero de parametros, no un dato publicado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HorneSci/DeltaRoutingAI
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- REPORT.md (intervalos de confianza pareados, revisiones de fuentes y comandos de replay): dentro del repositorio, ruta `REPORT.md`
- Paquete de referencia: `benchmarks/baseline-release/`
- Paquete de resultados adicionales: `benchmarks/additional/`
- Paquete de fuentes de seleccion: `benchmarks/selection/`
- Procedencia de datos: `DATA_PROVENANCE.json`
- Validacion de entrenamiento: `TRAINING_AND_VALIDATION.json`
- Helper de carga: `load_adapter.py`
- Atribucion upstream: `ATTRIBUTION.md`
- Avisos de licencia de datos y benchmarks: `CPYTHON-LICENSE.txt`, `CPYTHON-DOC-LICENSE.rst`, `BIGBENCH-LICENSE`, `benchmarks/additional/licenses/`, `benchmarks/selection/licenses/`
- Busqueda web: los resultados recuperados no guardan relacion con el modelo (contenido de Zhihu y de Stack Overflow sobre certificados SSL, eliminacion de lineas en blanco y descarga de blobs), por lo que no se incluye ningun enlace adicional relevante.
