# dnhkng/RYS-XLarge

## Resumen

RYS-XLarge es un modelo de lenguaje de 77.965.463.552 parametros (aproximadamente 78B) desarrollado por dnhkng, derivado de MaziyarPanahi/calme-2.1-qwen2-72b, que a su vez procede de Qwen2-72B. Su principal particularidad es que no modifica ni un solo peso del modelo original: en lugar de reentrenar, duplica un bloque de capas intermedias del stack transformer para incrementar la capacidad de razonamiento. El modelo resultante pasa de 72B a 78B de parametros mediante la ejecucion repetida de las capas 45 a 51.

La tecnica, denominada RYS (por las siglas del autor) y descrita en el articulo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight", se basa en un barrido sistematico de todos los bloques contiguos `[i, j)` del stack, reevaluando cada configuracion para identificar que regiones del modelo contribuyen positivamente al rendimiento. En Qwen2-72B, los bloques beneficos se concentran en la zona media del stack (capas 45-51), y su duplicacion produce mejoras medibles en benchmarks de razonamiento sin necesidad de fine-tuning ni descenso de gradiente.

El modelo es relevante porque demuestra una via de optimizacion ortogonal al entrenamiento tradicional: la duplicacion de capas como tecnica de "auto-fusion" que incrementa la inteligencia del modelo a coste cero de computo de entrenamiento. Publicado bajo licencia MIT, esta orientado a generacion de texto y conversacion, y segun el autor alcanzo el primer puesto en el Open LLM Leaderboard de Hugging Face en el momento de su publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con duplicacion del bloque de capas 45-51 |
| Parametros totales | 77.965.463.552 (aproximadamente 78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

RYS-XLarge es un transformer decoder-only basado en la arquitectura Qwen2. El modelo parte de MaziyarPanahi/calme-2.1-qwen2-72b, un fine-tune de Qwen2-72B, y aplica una modificacion estructural: en lugar de ejecutar las 80 capas del stack una sola vez, ejecuta las capas 0-51 y despues repite las capas 45-79, de modo que las capas 45-51 se ejecutan dos veces. Esto anade siete capas extra cerca de la mitad de un stack de 80, llevando el modelo de 72B a 78B de parametros. Las capas adicionales son copias byte a byte de capas que el modelo ya tenia; no hubo fine-tuning, ni descenso de gradiente, ni modificacion de pesos de ningun tipo.

El metodo subyacente consiste en barrer cada bloque contiguo `[i, j)` del modelo preentrenado y reevaluarlo una segunda vez, generando un mapa de calor que indica que bloques mejoran y cuales degradan el rendimiento. Los bloques beneficos se agrupan en la zona media del stack. El analisis por tarea revela que matematicas tolera la duplicacion casi en cualquier punto antes de la capa 60, mientras que las tareas de cociente emocional (EQ) muestran una estructura mas definida, con regiones buenas separadas por regiones malas. El autor senala que la ubicacion de los circuitos duplicables no es universal: cada familia de modelos coloca sus circuitos en lugares distintos, por lo que el barrido debe repetirse por arquitectura (se incluye una comparacion con Llama-3-70B-Instruct en la model card).

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline `text-generation` y tag `conversational`.
- Razonamiento y resolucion de problemas (mejora declarada en BBH, MATH Lvl 5, GPQA y MuSR).
- Matematicas a nivel de competicion (MATH Lvl 5, 4-shot).
- Instrucciones y seguimiento de formato (IFEval, 0-shot).
- Conocimiento general y academico (MMLU-PRO, 5-shot).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene 38,97 en MATH Lvl 5 (4-shot), por lo que puede emplearse en tutoria de matematicas de nivel competitivo, verificacion de demostraciones y resolucion paso a paso de problemas algebraicos y de calculo, con la ventaja de ser un modelo abierto y de licencia permisiva.
- Generacion de codigo y explicacion tecnica: aunque no se publican resultados de HumanEval, el modelo hereda las capacidades de Qwen2-72B y su fine-tune calme-2.1, lo que permite integrarlo en asistentes de programacion, revision de parches y generacion de documentacion tecnica.
- Atencion al cliente automatizada: al ser un modelo conversacional con contexto largo (heredado de Qwen2, aunque la longitud exacta no se declara), puede gestionar dialogos multi-turno en entornos de soporte, clasificacion de tickets y respuestas a preguntas frecuentes.
- Investigacion sobre interpretabilidad y neuroanatomia de LLM: el modelo es un artefacto de estudio ideal para analizar el papel funcional de las capas intermedias, replicar el barrido de bloques y validar hipotesis sobre duplicacion de circuitos en arquitecturas transformer.
- Evaluacion comparativa de tecnicas de optimizacion: sirve como referencia para comparar la duplicacion de capas frente a fine-tuning, destilacion o pruning en terminos de coste, rendimiento y huella de parametros.
- Despliegue en entornos de investigacion con requisitos de licencia laxa: la licencia MIT permite uso comercial, modificacion y redistribucion sin las restricciones de otras licencias de modelos grandes, lo que facilita su integracion en productos y pipelines internos.
- Generacion de resumenes y analisis de documentos largos: el modelo puede procesar y sintetizar textos extensos en tareas de investigacion documental, aunque la longitud de contexto efectiva debe validarse empiricamente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard). No se han verificado de forma independiente (`verified: false`).

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| IFEval | 0-shot | strict accuracy | 79,96 |
| BBH | 3-shot | acc_norm | 58,77 |
| MATH Lvl 5 | 4-shot | exact_match | 38,97 |
| GPQA | 0-shot | acc_norm | 17,90 |
| MuSR | 0-shot | acc_norm | 23,72 |
| MMLU-PRO | 5-shot | accuracy | 49,20 |

Mejora declarada por la duplicacion de capas respecto al modelo base:

| Metrica | Mejora |
|---|---|
| Media | +2,61 % |
| IFEval | -2,05 % |
| BBH | +2,51 % |
| MATH Lvl 5 | +8,16 % |
| GPQA | +2,58 % |
| MuSR | +17,72 % |
| MMLU-PRO | +0,31 % |

## Requisitos de hardware

- VRAM estimada para inferencia: con 78B parametros, en FP16 se requieren aproximadamente 156 GB de VRAM; en cuantizacion de 8 bits, unos 78 GB; en 4 bits, unos 39-40 GB (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: para FP16, multiples A100 80GB o H100 80GB (2-4 GPUs); para 8 bits, una o dos A100/H100; para 4 bits, una A100 80GB o una RTX 4090 24GB no es suficiente para el modelo completo sin offloading.
- Cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y posible offloading a CPU; una RTX 4090 de 24GB no aloja el modelo completo en 4 bits sin tecnicas de offloading o particionado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI mas alla de los tags.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RYS-XLarge | 78B | no disponible | MIT | Duplicacion de capas 45-51 sobre calme-2.1-qwen2-72b; #1 en Open LLM Leaderboard segun el autor |
| Qwen2-72B | 72B | 128K (segun documentacion publica de Qwen2) | Apache 2.0 (segun documentacion publica) | Modelo base de la familia Qwen2; referencia directa |
| Llama-3-70B-Instruct | 70B | 8K (segun documentacion publica) | Llama 3 Community License | Comparado en la model card; el autor incluye su mapa de calor de duplicacion |
| calme-2.1-qwen2-72b | 72B | no disponible | no disponible | Fine-tune de Qwen2-72B del que deriva RYS-XLarge |

Nota: los datos de contexto y licencia de Qwen2-72B y Llama-3-70B-Instruct provienen de documentacion publica de sus respectivos autores y no de la informacion proporcionada en esta ficha; deben verificarse en las fuentes oficiales.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`); deben tomarse con cautela.
- El modelo no ha sido sometido a fine-tuning ni a RLHF adicional tras la duplicacion de capas, por lo que puede heredar sesgos y comportamientos del fine-tune calme-2.1-qwen2-72b y de Qwen2-72B.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano; no se han publicado evaluaciones especificas de factualidad para este modelo.
- La longitud de contexto no esta declarada en la informacion disponible; no debe asumirse la de Qwen2-72B sin verificacion.
- Los idiomas soportados no estan declarados; el rendimiento multilingue no ha sido evaluado en la informacion proporcionada.
- La mejora en IF Eval es negativa (-2,05 %), lo que sugiere un posible deterioro en el seguimiento estricto de instrucciones y formato tras la duplicacion.
- La tecnica de duplicacion no es universal: el autor advierte que cada familia de modelos requiere un barrido propio, por lo que los resultados no son directamente transferibles a otras arquitecturas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor solicita citar el articulo "LLM Neuroanatomy" en trabajos derivados.
- El modelo requiere hardware de gama alta (multiples GPUs de 80GB en FP16) para inferencia sin cuantizacion, lo que limita su despliegue en entornos con recursos modestos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-XLarge
- Articulo principal (LLM Neuroanatomy): https://dnhkng.github.io/posts/rys/
- Articulo de seguimiento II (Modern LLM Hacking): https://dnhkng.github.io/posts/rys-ii/
- Articulo de seguimiento III (Why RYS Works): https://dnhkng.github.io/posts/sapir-whorf/
- Open LLM Leaderboard (consulta del modelo): https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=dnhkng/RYS-XLarge
- Modelo base del fine-tune: https://huggingface.co/MaziyarPanahi/calme-2.1-qwen2-72b
- Modelo original Qwen2-72B: https://huggingface.co/Qwen/Qwen2-72B
