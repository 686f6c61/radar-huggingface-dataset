# DuoNeural/Qwen2.5-7B-Instruct-CodeInfused-IQ3_XXS-GGUF

## Resumen

DuoNeural/Qwen2.5-7B-Instruct-CodeInfused-IQ3_XXS-GGUF es una cuantizacion GGUF de 3 bits del modelo Qwen/Qwen2.5-7B-Instruct, publicada por DuoNeural Research Lab. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo conjunto de pesos de 7.615.616.512 parametros comprimido mediante cuantizacion posterior al entrenamiento (PTQ) a un regimen de aproximadamente 3,20 bits por peso, lo que reduce la huella de 14,19 GiB en BF16 a 2,90 GiB. El autor denomina "code-infused" al corpus de calibracion empleado para generar la matriz imatrix, no a un entrenamiento adicional.

El problema que aborda es conocido en la literatura de cuantizacion: por debajo de 3,5 bits por peso, los canales de alta curtosis que gobiernan la sintaxis de lenguajes de programacion (indentacion de Python, llaves de JSON, gramatica de un AST) se degradan y la generacion entra en bucles repetitivos. DuoNeural calibra `llama-quantize` con 131.072 tokens de codigo algoritmico, demostraciones de chain-of-thought matematico y esquemas de tool calling compatibles con Hermes-3 y OpenAI, con el objetivo de preservar esos submanifolds.

Su relevancia practica es la ejecucion local en hardware muy limitado: el autor declara un minimo de 4 GB de VRAM o RAM, lo que permitiria inferencia en un MacBook Air, una Raspberry Pi 5 o dispositivos de borde. La model card se marca explicitamente como "Experimental Release: Pending Further Verification / Empirical Validation", con evaluaciones de contexto largo y benchmarks multiples aun en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), cuantizado a GGUF IQ3_XXS con matriz imatrix |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de la model card; el modelo base Qwen2.5-7B-Instruct admite hasta 131.072 tokens con RoPE scaling segun la documentacion de Qwen |
| Tipos de cuantizacion | IQ3_XXS (~3,20 bpw) con imatrix; unico cuant publicado en el repositorio |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (2,90 GiB; repositorio de 3,1 GB) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Pipeline | text-generation |
| Motor de cuantizacion | llama.cpp build b3840+ con CUDA 13.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, preentrenado sobre un corpus de hasta 18 billones de tokens y posteriormente alineado para seguir instrucciones. El autor de esta ficha no aporta detalles adicionales sobre la composicion del dataset ni sobre el metodo exacto de alineacion (SFT, DPO u otros), por lo que esos extremos quedan como no disponibles en la informacion proporcionada.

La innovacion declarada no esta en la arquitectura sino en el proceso de cuantizacion. DuoNeural construye una matriz de calibracion (`qwen7b_gtap.imatrix`) a partir de un corpus de 131.072 tokens distribuidos en 64 fragmentos que combina Python algoritmico recursivo (inversion de arboles binarios, programacion dinamica, manipulacion de matrices), pruebas matematicas de chain-of-thought (GSM8K y aritmetica de competicion) y esquemas estrictos de function calling. Ese corpus se usa para ponderar la curvatura de activaciones durante `llama-quantize`, con el objetivo declarado de evitar la "evaporacion de delimitadores" y los bucles degenerativos tipicos de la cuantizacion sub-3,5 bits. El resultado es un fichero de 2,90 GiB con una perplexity de holdout de 3,0263 frente a 2,8593 del modelo en BF16, es decir, una degradacion de +0,167 puntos que el autor presenta como una fidelidad del 94,5 %.

Conviene subrayar que no hay ningun entrenamiento ni ajuste fino adicional: todas las capacidades del modelo son las del Qwen2.5-7B-Instruct original, moduladas por el ruido de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte del formato de plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Generacion de codigo: el autor reporta paridad perfecta en 15 pruebas unitarias de Python (15/15) frente al modelo en BF16.
- Razonamiento matematico con chain-of-thought: 24 de 25 problemas resueltos en la muestra de GSM8K reportada por el autor.
- Tool calling y function calling: soporte de esquemas estructurados compatibles con Hermes-3 y OpenAI; el autor declara 14/15 llamadas con AST valido, frente a 3/15 del modelo base en su arnes de prueba.
- Razonamiento multi-paso y uso como componente de agentes, siempre que el prompt respete el formato de herramientas esperado.
- Despliegue como servidor compatible con la API de OpenAI mediante `llama-server`.
- Inferencia en CPU y en GPUs de gama baja gracias al tamano reducido del fichero.
- Capacidades multilingues limitadas a los idiomas declarados (en, zh); no se anuncia soporte de castellano.
- No dispone de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistencia de programacion en portatiles sin GPU dedicada: con 2,90 GiB de pesos, el modelo cabe en equipos con 4-8 GB de RAM y permite autocompletar funciones, refactorizar codigo o explicar fragmentos sin conexion a internet.
- Servidor local compatible con OpenAI para equipos de desarrollo: `llama-server` expone un endpoint `/v1/chat/completions` que se puede integrar en scripts existentes que ya usan el SDK de OpenAI, sustituyendo unicamente la `base_url`.
- Revision automatizada de codigo en CI/CD: gracias al soporte de tool calling y a la preservacion de delimitadores declarada, el modelo puede emitir respuestas estructuradas (JSON) que un pipeline interprete para anotar pull requests.
- Agentes de multiples pasos en dispositivos de borde: la combinacion de contexto de 32.768 tokens en los ejemplos y una tasa de exito alta en llamadas a herramientas permite encadenar busquedas, calculos y escritura de ficheros en una Raspberry Pi 5 o un mini-PC.
- Tutoria de matematicas basicas y aritmetica: el modo chain-of-thought del modelo base sigue funcionando tras la cuantizacion, lo que lo hace util para generar explicaciones paso a paso en entornos educativos offline.
- Procesamiento por lotes en servidores de CPU con AVX-512 o AMX: el modelo es lo bastante pequeno para ejecutarse en paralelo en varios nucleos o instancias sin agotar la memoria del host.
- Investigacion en cuantizacion posterior al entrenamiento: sirve como referencia reproducible de calibracion imatrix orientada a codigo para comparar con AWQ, GPTQ u otros esquemas sub-3,5 bits.
- Prototipado rapido de aplicaciones conversacionales en fase de validacion, donde el coste de servir un modelo de 14 GiB en BF16 no esta justificado.

## Benchmarks y rendimiento

Todos los datos siguientes proceden de la model card del autor y no han sido verificados de forma independiente. Las muestras son muy pequenas (25 problemas, 15 pruebas, 15 llamadas), por lo que la significacion estadistica es baja.

| Metrica | Qwen2.5-7B-Instruct BF16 | Este cuant IQ3_XXS | Delta |
|---|---|---|---|
| Tamano del modelo | 14,19 GiB | 2,90 GiB | 4,89x mas pequeno (79,6 %) |
| Precision efectiva | 16,0 bpw | ~3,20 bpw | Sub-3,5 bits |
| Perplexity de holdout | 2,8593 | 3,0263 | +0,167 (94,5 % de fidelidad) |
| GSM8K (25 con CoT) | 25/25 (100,0 %) | 24/25 (96,0 %) | 96,0 % de retencion |
| Pruebas unitarias Python (15) | 15/15 (100,0 %) | 15/15 (100,0 %) | Paridad AST completa |
| Tool calling Hermes (AST) | 3/15 (20,0 %) | 14/15 (93,3 %) | +11 aciertos |
| Throughput de decodificacion | 43,4 tok/s | 136,2 tok/s | 3,14x en RTX 4080 Super |

No se han publicado resultados de MMLU, HumanEval, MT-Bench ni de otras evaluaciones estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM minima declarada por el autor: 4 GB.
- Tamano de pesos en disco y en memoria: 2,90 GiB (el repositorio completo ocupa 3,1 GB).
- Estimacion practica: con contexto largo (32.768 tokens) hay que sumar el KV cache, que en FP16 puede anadir del orden de 2 GB adicionales; se recomienda reservar entre 5 y 6 GB de memoria total para un uso comodo.
- GPU usadas por el autor para las pruebas: NVIDIA GeForce RTX 4080 Super con `-ngl 99`, es decir, todas las capas descargadas en GPU.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 6 GB o mas (RTX 3060, 4060, 4070, 4080, etc.). El autor afirma que tambien funciona en MacBook Air, Raspberry Pi 5 y dispositivos moviles de borde.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-cpp-python`), Ollama importando un Modelfile, LM Studio y otros clientes GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que no son opciones directas.
- Throughput declarado: 136,2 tokens/s en decodificacion sobre RTX 4080 Super, frente a 43,4 tokens/s del modelo en BF16 en el mismo equipo.
- Los ejemplos de la model card fijan `-c 32768` y `-ngl 99`; reducir `-ngl` permite repartir capas entre GPU y CPU en equipos con menos VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoNeural Qwen2.5-7B-Instruct-CodeInfused IQ3_XXS | 7,6 B | GGUF, 2,90 GiB | 32.768 en ejemplos; 131.072 en el modelo base | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-7B-Instruct (base) | 7,6 B | safetensors BF16, 14,19 GiB | 32.768 nativos, hasta 131.072 con RoPE scaling | apache-2.0 | HuggingFace, Ollama (`qwen2.5:7b-instruct`) |
| DuoNeural Qwen2.5-Coder-7B-Instruct-GGUF | 7,6 B | GGUF (tamano no indicado) | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen2.5-Coder-7B-Instruct-GGUF | 7,6 B | GGUF (tamano no indicado) | no disponible | no disponible en la informacion proporcionada | ModelScope, HuggingFace |

No se dispone de comparativas directas contra otras cuantizaciones sub-3 bits verificadas de forma independiente, ni de resultados de benchmarks comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La propia model card se etiqueta como "Experimental Release: Pending Further Verification / Empirical Validation"; no hay evaluaciones independientes ni reproducciones por terceros.
- Todas las metricas de rendimiento, perplexity y tool calling son autodeclaradas por el autor y se midieron con muestras muy pequenas (25, 15 y 15 elementos), insuficientes para extraer conclusiones robustas.
- La ficha afirma que las pruebas se hicieron en una "RTX 4080 Super (32GB VRAM edition)", especificacion que no corresponde a ningun modelo comercial de esa tarjeta (16 GB de VRAM). Esta inconsistencia resta credibilidad a la telemetria de hardware publicada.
- La terminologia empleada ("mecanica estadistica de no equilibrio", "transicion de vidrio desordenado", "cono de luz cognitivo") no describe metodos estandar de cuantizacion y no aporta garantias tecnicas verificables.
- La cuantizacion a ~3,20 bpw introduce degradacion inevitable: aunque el autor reporte solo +0,167 de perplexity en su holdout, el comportamiento fuera de la distribucion de calibracion (dominios no relacionados con codigo o matematicas) puede degradarse mas.
- La comparacion de tool calling (3/15 frente a 14/15) enfrenta el modelo base a un arnes de prompts generico, sin ajuste especifico de plantillas de herramientas, por lo que la ventaja medida esta parcialmente sesgada por el formato de evaluacion.
- Riesgo de alucinacion inherente al modelo base, agravado por el redondeo agresivo de pesos en regimenes sub-3,5 bits; la verificacion humana sigue siendo necesaria en produccion.
- Idiomas oficialmente soportados: ingles y chino. No hay garantias de calidad en castellano ni en otras lenguas.
- Contexto: aunque el modelo base admite 131.072 tokens con RoPE scaling, la cuantizacion a 3 bits y la ausencia de pruebas de estabilidad en contexto largo (reconocida por el autor como "ongoing") hacen desaconsejable operar cerca de ese limite.
- La licencia apache-2.0 del modelo base permite uso comercial, pero el autor no aporta garantias de idoneidad ni soporte; al no existir validacion externa, el uso en produccion conlleva riesgo operativo.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin issues ni discusiones que permitan evaluar problemas reales de despliegue.
- Las fechas de creacion y actualizacion del repositorio (2026) y la cita bibliografica asociada son posteriores a la fecha de esta ficha; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen2.5-7B-Instruct-CodeInfused-IQ3_XXS-GGUF
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Perfil del autor en HuggingFace: https://huggingface.co/DuoNeural
- DuoNeural/Qwen2.5-Coder-7B-Instruct-GGUF: https://huggingface.co/DuoNeural/Qwen2.5-Coder-7B-Instruct-GGUF
- Qwen2.5-Coder-7B-Instruct-GGUF en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/summary
- Qwen2.5 7B Instruct en Ollama: https://ollama.com/library/qwen2.5:7b-instruct
