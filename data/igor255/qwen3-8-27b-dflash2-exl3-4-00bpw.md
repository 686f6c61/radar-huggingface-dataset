# igor255/Qwen3.8-27B-DFlash2-EXL3-4.00bpw

## Resumen

DFlash 2 es un modelo borrador (draft model) para decodificacion especulativa sobre `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje autonomo: se ejecuta dentro de un servidor de inferencia con decodificacion especulativa y propone bloques de tokens que el modelo objetivo verifica despues. Lo desarrolla Inco AI (repositorio original `incoai/Qwen3.8-27B-DFlash2`), y la ficha que nos ocupa es un espejo publicado por el usuario `igor255` en cuantizacion EXL3 de 4,00 bits por peso.

Su innovacion principal es el uso de difusion por bloques: en lugar de predecir token a token, predice un bloque completo en una sola pasada, conserva los mejores candidatos en cada posicion y un selector ligero traza una ruta coherente entre ellos. La decodificacion es sin perdida (_lossless_): la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribucion. Esto significa que no degrada la calidad, solo acelera.

El modelo tiene 578.225.920 parametros (dato real extraido de los pesos safetensors) y esta pensado para desplegarse en SGLang o vLLM con el algoritmo especulativo DFLASH. Segun la evaluacion del autor, con tamano de bloque 8 logra longitudes de aceptacion de 4,10 a 5,46 tokens por paso de verificacion y aceleraciones de hasta 3,43x en concurrencia 1 sobre una NVIDIA H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusion por bloques para decodificacion especulativa, con convoluciones dinamicas de dos tomas en el backbone y un selector ligero de ruta entre candidatos |
| Parametros totales | 578.225.920 (dato real de safetensors) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | EXL3 a 4,00 bpw (segun el nombre del repositorio); la model card no documenta detalles de cuantizacion |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3) |

Otros datos tecnicos: biblioteca declarada `transformers`, pipeline `text-generation`, tamano del repositorio 1,2 GB, 0 descargas y 1 like en el momento de la consulta. Modelo base: `Qwen/Qwen3.8-27B`. La model card incluye la etiqueta `inference: false`, es decir, no esta pensado para inferencia directa con `transformers`.

## Arquitectura y entrenamiento

DFlash 2 es un borrador de difusion por bloques. Frente a los borradores autorregresivos clasicos, que generan un token por paso, este modelo predice un bloque entero en una unica pasada hacia delante y mantiene los mejores candidatos en cada posicion del bloque. A continuacion, un selector de baja complejidad recorre esos candidatos y traza una unica trayectoria coherente, que es la que se propone al modelo objetivo para su verificacion. Para evitar la degradacion tipica de los borradores hacia el final del bloque, el backbone incorpora convoluciones dinamicas de dos tomas (_two-tap dynamic convolutions_).

La decodificacion es sin perdida por construccion: en modo greedy la salida coincide exactamente con la del modelo objetivo, y en modo muestreo se preserva su distribucion, de modo que el borrador no altera la calidad del resultado final, solo la velocidad. En la configuracion evaluada por el autor se usa un tamano de bloque de 8 (7 tokens borrador por paso de verificacion). No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO: esos datos no estan disponibles en la informacion proporcionada.

Existen dos trabajos citables de referencia: el articulo original de DFlash, publicado en ICML 2026 (_DFlash: Block Diffusion for Flash Speculative Decoding_), y la entrada de blog de DFlash 2 (Inco AI, agosto de 2026).

## Capacidades

- No genera texto de forma autonoma: su unica funcion es proponer tokens candidatos para que el modelo objetivo Qwen3.8-27B los verifique.
- Decodificacion especulativa sin perdida: la salida greedy es identica a la del objetivo y el muestreo preserva su distribucion.
- Prediccion paralela de bloques de tokens (hasta 8 posiciones en la configuracion evaluada, con 7 tokens borrador por paso).
- Seleccion de ruta coherente entre multiples candidatos por posicion mediante un selector ligero.
- Integracion con SGLang mediante `--speculative-algorithm DFLASH` y con vLLM mediante `speculative-config` con `"method": "dflash"`.
- Todas las capacidades funcionales (razonamiento, codigo, matematicas, tool calling, agentes, multilingue) pertenecen al modelo objetivo Qwen3.8-27B, no a este borrador; el borrador se limita a acelerarlas.
- No se documentan capacidades de vision, audio ni modo de razonamiento propias en la informacion disponible.

## Casos de uso

- Servicio de chat interactivo de baja latencia: desplegando Qwen3.8-27B junto a este borrador en SGLang, la generacion a concurrencia 1 pasa de 68,9 a 236,1 tokens/s en GSM8K (3,43x), lo que reduce de forma directa el tiempo hasta el primer bloque de respuesta en asistentes conversacionales.
- Generacion de codigo en produccion: en HumanEval la longitud de aceptacion es de 4,39 tokens por paso (frente a 3,91 del MTP nativo) y el rendimiento sube a 214,6 tokens/s a concurrencia 1, lo que acelera asistentes de autocompletado y revision de codigo en IDE.
- Razonamiento matematico por lotes: en MATH-500 y GSM8K el borrador mantiene una aceptacion alta (5,28 y 5,46), util para pipelines de evaluacion o resolucion de problemas que necesitan throughput alto a concurrencia 1-8.
- Despliegue de alto rendimiento en servidores con GPU profesional: a concurrencia 32 el modelo alcanza 1.922,5 tokens/s en GSM8K (1,45x sobre autorregresivo), mientras que MTP y DSpark caen por debajo del autorregresivo en varias tareas; es el escenario donde el borrador evita la regresion.
- Pipelines de agentes y razonamiento multi-paso: cada paso intermedio de un agente implica una generacion corta; reducir el coste por paso con un speedup de 2,3x-3,4x a baja concurrencia acorta los bucles de tool calling encadenados.
- Evaluacion reproducible de modelos: al ser decodificacion sin perdida, se puede usar para acelerar harnesses de evaluacion que requieren coincidencia exacta con la salida greedy del objetivo, sin alterar los resultados.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion frente a MTP integrado y borradores de la comunidad como DSpark, con metricas publicadas de longitud de aceptacion y throughput.

## Benchmarks y rendimiento

Longitud de aceptacion (media por peticion de tokens completados dividida por pasos de verificacion; mayor es mejor). Todos los metodos especulativos proponen 7 tokens borrador por paso:

| Tarea | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 5,02 | 4,36 | 5,46 |
| MATH-500 | 4,72 | 3,92 | 5,28 |
| HumanEval | 3,91 | 3,30 | 4,39 |
| MBPP | 3,99 | 3,51 | 4,79 |
| MT-Bench | 3,74 | 3,01 | 4,10 |

Throughput a concurrencia 1 (tokens de salida por segundo y aceleracion respecto a autorregresivo):

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 68,9 | 178,5 (2,59x) | 185,3 (2,69x) | 236,1 (3,43x) |
| MATH-500 | 69,0 | 172,8 (2,51x) | 174,5 (2,53x) | 230,7 (3,34x) |
| HumanEval | 69,0 | 151,9 (2,20x) | 159,9 (2,32x) | 214,6 (3,11x) |
| MBPP | 69,0 | 153,1 (2,22x) | 163,3 (2,37x) | 226,9 (3,29x) |
| MT-Bench | 68,9 | 134,9 (1,96x) | 137,6 (2,00x) | 184,0 (2,67x) |

Throughput a concurrencia 8:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 467,2 | 1.022,1 (2,19x) | 1.040,8 (2,23x) | 1.328,7 (2,84x) |
| MATH-500 | 480,0 | 1.023,5 (2,13x) | 1.025,8 (2,14x) | 1.368,3 (2,85x) |
| HumanEval | 483,4 | 934,2 (1,93x) | 956,5 (1,98x) | 1.291,5 (2,67x) |
| MBPP | 478,0 | 938,1 (1,96x) | 974,1 (2,04x) | 1.328,0 (2,78x) |
| MT-Bench | 480,5 | 835,2 (1,74x) | 802,3 (1,67x) | 1.090,2 (2,27x) |

Throughput a concurrencia 32:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
|---|---:|---:|---:|---:|
| GSM8K | 1.329,8 | 1.381,1 (1,04x) | 1.506,5 (1,13x) | 1.922,5 (1,45x) |
| MATH-500 | 1.505,8 | 1.415,6 (0,94x) | 1.429,0 (0,95x) | 1.951,8 (1,30x) |
| HumanEval | 1.546,5 | 1.296,8 (0,84x) | 1.330,1 (0,86x) | 1.799,0 (1,16x) |
| MBPP | 1.507,7 | 1.314,9 (0,87x) | 1.361,3 (0,90x) | 1.886,8 (1,25x) |
| MT-Bench | 1.507,4 | 1.159,7 (0,77x) | 1.115,5 (0,74x) | 1.525,3 (1,01x) |

Condiciones de la evaluacion declaradas por el autor: SGLang sobre una NVIDIA H200 con FlashAttention 3 para la atencion del objetivo y del borrador, tamano de bloque 8, parametros de muestreo recomendados de Qwen3.8 (temperatura 1,0, top-p 0,95, top-k 20) con esfuerzo de razonamiento `xhigh`, maximo de 4096 tokens nuevos y prompts formateados segun `z-lab/dflash`. No se publican resultados de calidad (MMLU, HumanEval en modo zero-shot, etc.) de este borrador, porque no es un modelo de lenguaje autonomo.

## Requisitos de hardware

- Peso del borrador: 578.225.920 parametros en EXL3 a 4,00 bpw implican del orden de 0,3 GB de pesos; el repositorio ocupa 1,2 GB en total. Cabe holgadamente en cualquier GPU consumer.
- El coste real de VRAM lo determina el modelo objetivo Qwen3.8-27B: aproximadamente 54 GB en bf16 o en torno a 15-16 GB en una cuantizacion de 4 bits (estimacion derivada del recuento de parametros, no confirmada en la informacion disponible). Hay que sumar la cache KV correspondiente a la ventana de contexto efectiva.
- GPU de referencia de la evaluacion oficial: 1x NVIDIA H200, con FlashAttention 3 tanto en el objetivo como en el borrador.
- GPU profesionales recomendadas para produccion: H200 o H100 para el objetivo en bf16; A100 80 GB es una alternativa razonable por capacidad, aunque no hay medidas publicadas en esa GPU.
- Consumer GPU: el borrador cabe en cualquier GPU moderna; el modelo objetivo completo en bf16 no cabe en ninguna GPU de consumo. Con el objetivo cuantizado a 4 bits podria entrar en una RTX 4090 (24 GB) o RTX 5090, pero no hay datos publicados que lo confirmen.
- Motores de despliegue soportados: SGLang (`python -m sglang.launch_server --model-path Qwen/Qwen3.8-27B --speculative-algorithm DFLASH --speculative-draft-model-path ... --speculative-num-draft-tokens 8`) y vLLM (compilacion concreta del PR 52816, con `--speculative-config` y `"method": "dflash"`, `num_speculative_tokens: 7`). No se documenta soporte para llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput medidos: 184,0-236,1 tokens/s por peticion a concurrencia 1; 1.090,2-1.368,3 tokens/s a concurrencia 8; 1.525,3-1.922,5 tokens/s a concurrencia 32 (H200).
- Nota: la model card indica `inference: false` y la ruta de modelo recomendada en los ejemplos es `incoai/Qwen3.8-27B-DFlash2`, no esta cuantizacion EXL3 concreta; la compatibilidad de esta version cuantizada con SGLang y vLLM no esta documentada.

## Comparativa con modelos similares

Comparativa con los otros dos mecanismos de decodificacion especulativa evaluados por el autor sobre el mismo modelo objetivo Qwen3.8-27B:

| Alternativa | Tipo | Longitud de aceptacion (GSM8K / MT-Bench) | Aceleracion a concurrencia 1 (GSM8K) | Aceleracion a concurrencia 32 (MT-Bench) | Licencia |
|---|---|---:|---:|---:|---|
| DFlash 2 (este borrador) | Difusion por bloques con selector de ruta | 5,46 / 4,10 | 3,43x | 1,01x | apache-2.0 |
| MTP integrado de Qwen3.8 | Prediccion multi-token del propio objetivo | 5,02 / 3,74 | 2,59x | 0,77x (regresion) | La del modelo objetivo |
| DSpark (`RadixArk/Qwen3.8-27B-DSpark`) | Borrador de la comunidad | 4,36 / 3,01 | 2,69x | 0,74x (regresion) | No disponible en la informacion proporcionada |
| Decodificacion autorregresiva | Sin borrador | 1,00 (referencia) | 1,00x | 1,00x | La del modelo objetivo |

Frente a los tres, DFlash 2 obtiene la mayor longitud de aceptacion en las cinco tareas evaluadas y es el unico metodo que no cae por debajo del autorregresivo a concurrencia 32. No se dispone de comparativas frente a otros borradores de difusion por bloques ni a tecnicas de decodificacion especulativa de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera respuestas por si mismo y devuelve resultados incorrectos o carentes de sentido si se usa fuera de un servidor de decodificacion especulativa.
- Etiquetado como `inference: false` y con biblioteca declarada `transformers`, pero sin soporte documentado para `transformers`; requiere SGLang o una compilacion concreta de vLLM (PR 52816).
- La model card es la del borrador sin cuantizar (`incoai/Qwen3.8-27B-DFlash2`) y no documenta la cuantizacion EXL3 de 4,00 bpw de este repositorio. Se desconoce si SGLang o vLLM aceptan estos pesos cuantizados y si el backend EXL3 funciona con los kernels de atencion usados en la evaluacion.
- Discrepancia de tamano sin explicar: 578 M de parametros a 4,00 bpw deberian ocupar del orden de 0,3 GB, mientras que el repositorio declara 1,2 GB. Podria deberse a artefactos adicionales, pero no hay documentacion al respecto.
- Los sesgos y el riesgo de alucinacion son los del modelo objetivo Qwen3.8-27B; el borrador es sin perdida y no los modifica. No se han publicado evaluaciones de sesgo especificas.
- Idiomas soportados no disponibles: dependen exclusivamente del modelo objetivo.
- Longitud de contexto no disponible: la gestiona el modelo objetivo.
- Licencia apache-2.0 para el borrador, pero el uso comercial del conjunto depende tambien de la licencia efectiva de Qwen3.8-27B, que no se detalla en la informacion proporcionada.
- A concurrencia alta el beneficio se diluye: a concurrencia 32 la aceleracion en MT-Bench es de solo 1,01x, por lo que en despliegues con mucha carga concurrente la ganancia practica puede ser marginal.
- Validacion escasa: 0 descargas y 1 like en el momento de la consulta. Es un espejo no oficial de un modelo de terceros, no una publicacion del autor original.
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; toda la informacion tecnica procede de la model card y de los metadatos del repositorio.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/igor255/Qwen3.8-27B-DFlash2-EXL3-4.00bpw
- Repositorio original del borrador (espejo del que procede): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Entrada de blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Borrador de la comunidad DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- SGLang: https://github.com/sgl-project/sglang
- vLLM (PR de soporte DFLASH): https://github.com/vllm-project/vllm/pull/52816
- Articulo original DFlash (ICML 2026): no disponible como enlace directo en la informacion proporcionada
