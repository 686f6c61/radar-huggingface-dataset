# fraQtl/Qwen3.5-4B-NPU-GGUF

## Resumen

Qwen3.5-4B-NPU-GGUF es una cuantizacion GGUF Q4_0 del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario fraQtl y optimizada especificamente para ejecutarse en la NPU Hexagon de los SoC Qualcomm Snapdragon. El problema que aborda no es la capacidad del modelo en si, sino la fidelidad de la cuantizacion: el autor sostiene que su archivo Q4_0 preserva mejor el comportamiento del modelo original en bf16 que las cuantizaciones Q4_0 estandar de unsloth, manteniendo todas las operaciones en la NPU sin rechazos del backend.

El modelo base es un transformer denso de 4.205.751.296 parametros (aproximadamente 4,2 mil millones), con licencia Apache 2.0 y capacidades conversacionales y de tool calling. La contribucion de este repositorio es el proceso de redondeo GPTQ aplicado sobre los pesos, que segun las mediciones del autor reduce la divergencia KL respecto al modelo original y mejora la tasa de acierto en el benchmark de function calling BFCL v4 live.

Es relevante ahora porque permite desplegar un modelo de 4B en telefonos y dispositivos embebidos con Snapdragon 8 Elite Gen 5, con un rendimiento medido de aproximadamente 17 tokens por segundo en generacion y 950 tokens por segundo en procesamiento de prompt, todo ello con inferencia integra en la NPU. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B; detalles de atencion no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (archivo principal); variante split con Q4_0 + 4 tensores Q4_1 + embedding Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: parte de los pesos de Qwen/Qwen3.5-4B en bf16 y aplica un proceso de cuantizacion Q4_0 con redondeo tipo GPTQ, ajustado para que todos los tipos de tensor utilizados esten soportados por el backend Hexagon de llama.cpp. El archivo principal ocupa 2.583.180.384 bytes, es decir, 41.024 bytes menos que el Q4_0 de unsloth, y no contiene tensores Q8_0. Existe una segunda variante, `Qwen3.5-4B-fraQtl-Q4_0-split.gguf`, de 2.549.797.984 bytes, pensada para runtimes que hacen prefill en la NPU y decodificacion en CPU compartiendo una unica copia de los pesos Q4_0; en esa variante todas las matrices son Q4_0 salvo cuatro tensores Q4_1 (blk.0 a blk.3, ffn_down) y el embedding en Q6_K.

El autor incluye el tag `imatrix`, lo que sugiere el uso de una matriz de importancia durante la cuantizacion, aunque la model card no detalla el dataset de calibracion ni el numero de tokens empleados. No se documenta en la informacion disponible si el modelo base fue entrenado con RLHF, DPO u otras tecnicas, ni la composicion de su dataset. La innovacion tecnica destacable es el propio esquema de redondeo: segun las mediciones, reduce la divergencia KL de vocabulario completo frente a bf16 en un 37,8 % en texto de tareas (instrucciones y tool calling) y un 28,4 % en texto general respecto al Q4_0 de unsloth, con intervalos de confianza del 95 % obtenidos por bootstrap pareado sobre 144 ventanas retenidas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Tool calling y function calling: evaluado en BFCL v4 live con llamadas simples, multiples, paralelas y paralelas multiples, ademas de irrelevancia (saber cuando no llamar) y relevancia.
- Razonamiento y conocimiento general: evaluado en MMLU-Pro con 12.032 preguntas.
- Razonamiento matematico: evaluado en GSM8K con 1.319 problemas.
- Generacion de codigo: evaluado en HumanEval+ (164 problemas) y MBPP+ (399 problemas).
- Seguimiento de instrucciones: evaluado en IFEval en modo prompt strict (541 prompts).
- Modo thinking desactivable: todas las evaluaciones reportadas se hicieron con thinking off y decodificacion greedy.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes en dispositivo movil: el modelo cabe en la NPU de un Snapdragon 8 Elite Gen 5 y genera a unos 17 tokens por segundo, lo que permite un asistente conversacional local sin enviar datos a la nube. Adecuado por su tamano de 4B y su fidelidad de cuantizacion.
- Agentes de tool calling en el movil: con una puntuacion de 1.729 sobre 2.251 prompts en BFCL v4 live y 654 aciertos en saber cuando no llamar, sirve para orquestar APIs del sistema (calendario, contactos, clima) sin invocar herramientas innecesariamente.
- Automatizacion de tareas ofimaticas en terminal: al ser GGUF compatible con llama.cpp, puede integrarse en scripts de escritorio para resumir, reescribir o clasificar texto con un consumo de memoria de aproximadamente 2,6 GB de pesos.
- Prototipado de pipelines de codigo: con 75,61 en HumanEval+ y 62,91 en MBPP+, es util para autocompletado y generacion de funciones en entornos con recursos limitados, aunque no sustituye a modelos mayores en tareas complejas.
- Evaluacion de cuantizaciones: el repositorio documenta metodologia de KL, BFCL y benchmarks de respuestas, por lo que sirve como referencia para comparar esquemas de cuantizacion Q4_0 en proyectos de investigacion sobre compresion de modelos.
- Despliegue en dispositivos embebidos con NPU Hexagon: la variante split permite prefill en NPU y decodificacion en CPU desde una copia compartida, util en hardware con memoria unificada limitada.
- Filtrado y moderacion local de texto: su tamano reducido y su capacidad de seguir instrucciones (80,96 en IFEval prompt strict) permiten clasificar contenido en el propio dispositivo con baja latencia.

## Benchmarks y rendimiento

Resultados reportados por el autor. Todas las evaluaciones con decodificacion greedy y thinking off.

Tool calling, BFCL v4 live (2.251 prompts):

| Archivo | Bytes | Total | Llamadas correctas | Sabe cuando no llamar | Respuestas correctas rotas vs original |
|---|---|---|---|---|---|
| Original bf16 (Qwen/Qwen3.5-4B) | no disponible | 1.751 | 1.048 | 691 | no aplica |
| unsloth Q4_0 | 2.583.221.408 | 1.681 | 1.063 | 606 | 148 |
| fraQtl Q4_0 v2 (este repo) | 2.583.180.384 | 1.729 | 1.063 | 654 | 89 |

Respuestas, comparativa principal:

| Benchmark | fraQtl Q4_0 | unsloth Q4_0 | Original bf16 | Diferencia fraQtl - unsloth (IC 95 %, p) |
|---|---|---|---|---|
| MMLU-Pro (12.032) | 45,55 | 45,23 | 46,82 | +0,32 [-0,25, +0,90], p 0,28 |
| GSM8K (1.319) | 93,10 | 92,95 | 92,95 | +0,15 [-1,09, +1,39], p 0,91 |
| IFEval prompt strict (541) | 80,96 | 80,59 | 83,18 | +0,37 [-2,34, +3,08], p 0,89 |
| HumanEval+ (164) | 75,61 | 73,78 | 78,66 | +1,83 [-3,90, +7,55], p 0,68 |
| MBPP+ (399) | 62,91 | 60,65 | 61,90 | +2,26 [-1,38, +5,89], p 0,28 |

Fidelidad respecto a bf16 (divergencia KL de vocabulario completo, 144 ventanas retenidas; menor es mejor):

| Archivo | Bytes | KL tareas | KL general |
|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 |
| fraQtl Q4_0 v1 | 2.583.180.384 | 0,02888 | 0,02058 |
| unsloth IQ4_NL | 2.579.944.608 | 0,03276 | 0,01908 |
| unsloth Q4_K_S | 2.590.430.368 | 0,02842 | 0,01729 |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, SM8850, llama.cpp b12079, backend Hexagon; pp128 y tg64 en tokens/s, 3 repeticiones):

| Archivo | NPU pp128 | NPU tg64 | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 2,6 GB solo para los pesos en Q4_0; con overhead de contexto y runtime, prever 3-4 GB. La variante split ocupa unos 2,55 GB.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible; el modelo esta orientado a NPU Hexagon de Qualcomm.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo RTX 3050, GTX 1650 Super, RTX 4060), aunque el objetivo declarado es la NPU movil.
- Despliegue: llama.cpp (backend Hexagon para NPU; backend CPU/GPU estandar en el resto de plataformas). No se menciona soporte verificado de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput medidos: 950,1 tokens/s en procesamiento de prompt (pp128) y 17,10 tokens/s en generacion (tg64) en Snapdragon 8 Elite Gen 5 con todas las operaciones en la NPU.
- En GPU de escritorio no se han publicado cifras de rendimiento en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fraQtl Qwen3.5-4B-NPU-GGUF | 4,2 B | no disponible | GGUF Q4_0 | Apache 2.0 | Optimizado para NPU Hexagon; mejor KL en tareas que unsloth Q4_0 |
| unsloth Qwen3.5-4B-GGUF (Q4_0) | 4,2 B | no disponible | GGUF Q4_0 | Apache 2.0 | Referencia de comparacion; 1.681 en BFCL v4 live |
| AutoRound Qwen3.5-4B Q4_0 (Intel) | 4,2 B | no disponible | GGUF Q4_0 | Apache 2.0 | 28,6 MB mayor; KL en tareas un 20,5 % peor que fraQtl |
| unsloth Qwen3.5-4B-GGUF (Q4_K_S) | 4,2 B | no disponible | GGUF Q4_K_S | Apache 2.0 | 16,0 % mejor en KL general, 1,6 % peor en tareas; no verificado en NPU |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinacion: inherente a un modelo de 4B; en MMLU-Pro obtiene 45,55 frente a 46,82 del bf16, lo que indica una perdida de precision de aproximadamente 1,3 puntos respecto al original.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la informacion disponible.
- El autor reconoce que unsloth Q4_K_S es un 16,0 % mejor en KL de texto general, por lo que este archivo no es la mejor opcion para tareas de conocimiento puro.
- Las mejoras en benchmarks de respuestas (GSM8K, IFEval, HumanEval+, MBPP+) no son estadisticamente significativas segun los propios intervalos de confianza reportados.
- Las mediciones de rendimiento en dispositivo se limitan a un unico SoC (Snapdragon 8 Elite Gen 5) y a una version concreta de llama.cpp (b12079); no hay garantia de que otros backends Hexagon se comporten igual.
- El repositorio tiene 0 likes y 623 descargas en el momento de la consulta, lo que indica una validacion comunitaria limitada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B por si anaden restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizacion de referencia unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Imagen del repositorio: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF/resolve/main/Qwen3.5-4B-NPU-GGUF.png
- llama.cpp: https://github.com/ggml-org/llama.cpp
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
