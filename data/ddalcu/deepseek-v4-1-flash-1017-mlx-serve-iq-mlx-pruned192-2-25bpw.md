# ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw

## Resumen

DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw es un empaquetado cuantizado y podado del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, preparado por el usuario ddalcu para su uso con la libreria mlx-serve en equipos Apple Silicon con 128 GB de memoria unificada. Se trata de un transformer de tipo Mixture-of-Experts (MoE) en el que cada capa conserva 192 de sus 384 expertos enrutados (6 activos por token, como en la version original) mas el experto compartido, y los expertos conservados se cuantizan a 2 bits con GPTQ. El tronco de atencion y el experto compartido se mantienen en MXFP8 tal como se publicaron.

El modelo resuelve el problema de ejecutar un modelo de gran tamano y contexto muy largo (1M de tokens) en hardware de consumo con memoria limitada. Frente al pack de 3.0 bpw (209 GB residentes) o al lossless (288 GB), este pack reduce la huella a unos 92 GB residentes, a costa de sacrificar la mitad de los expertos enrutados y de una perdida de calidad medible, especialmente en texto no ingles. Incluye las etapas de borrador DSpark para decodificacion especulativa (activas por defecto), la torre de vision del release original y las tablas Engram (203 GB) que se leen desde el SSD por token y no residen en memoria.

Es relevante ahora porque demuestra una via practica para llevar un MoE de frontera con contexto de 1M a un Mac de 128 GB, con velocidades de decodificacion en torno a 100-125 tok/s y prefill de 2.400-4.100 tok/s en un M5 Ultra. La contrapartida es clara: el podado no es gratuito, y el propio autor advierte que el texto no ingles se degrada de forma severa, por lo que el pack esta pensado para cargas de codigo, razonamiento y tool calling mas que para chat general o multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (model_type: deepseek_v41) con atencion estandar y torre de vision; decodificacion especulativa DSpark |
| Parametros totales | 27.130.023.634 (segun safetensors del repo) |
| Parametros activos | 6 expertos enrutados por token de los 192 conservados (original: 6 de 384), mas experto compartido |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GPTQ 2 bits en expertos conservados; MXFP8 en tronco de atencion y experto compartido; lm head requantizado a 8 bits al cargar; embedding de tokens a 8 bits |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria mlx-serve) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 384 expertos enrutados por capa y 6 activos por token, mas un experto compartido, y una ventana de contexto de 1M de tokens. Este pack concreto no reentrena el modelo: parte del checkpoint publicado y aplica un proceso de podado de expertos mas cuantizacion. En cada capa se conservan los 192 expertos con mayor puntuacion en una mezcla equitativa de dos criterios: la energia de salida ponderada por enrutamiento sobre el corpus de calibracion (frecuencia con la que el router elige un experto multiplicada por cuanto mueve la salida, normalizada por dominio y con peso hacia agente, codigo y tool calls), y el enrutamiento del propio modelo publicado sobre sesiones de agente reales, incluyendo los expertos a los que enruta cuando una palabra empieza a repetirse, lo que evita bucles de repeticion. Los expertos conservados acumulan el 82% del peso del router completo sobre ese trafico de agente.

El router mantiene las filas de los expertos conservados, de modo que el enrutamiento entre ellos es el del modelo original. Los expertos conservados se cuantizan a 2 bits con GPTQ, mientras que el tronco de atencion y el experto compartido permanecen en MXFP8. El pack incluye las tablas Engram (203 GB), que se leen desde el SSD por token y no residen en memoria, y las etapas de borrador DSpark para decodificacion especulativa, activas por defecto. El proceso de calibracion excluye las ventanas de evaluacion, que provienen de sesiones de agente con tool calls, codigo, uso de herramientas, razonamiento, chat y texto multilingue, renderizadas con el codificador de chat de DeepSeek. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con calidad mantenida en tareas de razonamiento (top-1 del 91,9% frente al modelo publicado).
- Generacion de codigo, con un top-1 del 88,2% y un KLD de 0,141 en la porcion de codigo.
- Tool calling y function calling, con el mejor comportamiento relativo del pack (top-1 del 92,0%, KLD de 0,168).
- Soporte de agentes y sesiones largas con tool calls, aunque con mayor degradacion que en codigo o razonamiento (top-1 del 87,9% en la porcion de agente).
- Capacidades de vision incluidas: el pack incorpora la torre de vision del release original.
- Decodificacion especulativa mediante las etapas de borrador DSpark, activas por defecto.
- Contexto de hasta 1M de tokens.
- Capacidades multilingues limitadas a ingles y chino, con degradacion severa en texto no ingles segun el autor.

## Casos de uso

- Generacion de codigo en produccion: el pack mantiene un top-1 del 88,2% y un KLD de 0,141 en la porcion de codigo, por lo que es adecuado para autocompletado, refactorizacion y generacion de tests en pipelines de CI/CD, integrado mediante mlx-serve en un Mac de 128 GB.
- Asistentes de agente con tool calling: el top-1 del 92,0% en la porcion de herramientas y el diseno del podado orientado a trafico de agente lo hacen util para agentes que encadenan llamadas a funciones, aunque conviene monitorizar bucles en sesiones largas.
- Razonamiento sobre documentos largos: con 1M de tokens de contexto puede procesar repositorios completos, expedientes o bases de conocimiento extensas en una sola pasada, con prefill de 3.800-4.100 tok/s en un M5 Ultra.
- Analisis de codigo y revision de repositorios: la ventana de 1M tokens permite cargar un repositorio entero y responder preguntas sobre el, con buena fidelidad en la porcion de codigo.
- Procesamiento de imagenes con la torre de vision incluida: extraccion de informacion de capturas, diagramas o documentos escaneados combinada con generacion de texto y razonamiento.
- Desarrollo local en Apple Silicon: prototipado y evaluacion de un MoE de frontera en un unico Mac de 128 GB sin infraestructura de GPU, con velocidades de decodificacion de 100-125 tok/s.
- Tareas de razonamiento tecnico y matematico: el top-1 del 91,9% en razonamiento lo hace apto para resolucion de problemas paso a paso, siempre que el contenido sea en ingles o chino.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad frente al checkpoint publicado (KLD y top-1) sobre 46 ventanas de 2.048 tokens, 11.776 posiciones puntuadas, y velocidades medidas con llmprobe en un M5 Ultra de 256 GB con mlx-serve 26.11.2.

| Metrica | Pruned192 2.25bpw | iQ-MLX-3.0bpw |
|---|---|---|
| KLD global (media) | 0,3233 | 0,0963 |
| KLD global (mediana) | 0,0141 | no disponible |
| Top-1 global | 85,82% | 92,64% |
| KLD agente | 0,420 | 0,169 |
| KLD codigo | 0,141 | 0,046 |
| KLD herramientas | 0,168 | 0,045 |
| KLD razonamiento | 0,069 | 0,019 |
| KLD chat | 0,405 | 0,085 |
| KLD multilingue | 0,809 | 0,117 |
| Top-1 agente | 87,9% | no disponible |
| Top-1 codigo | 88,2% | no disponible |
| Top-1 herramientas | 92,0% | no disponible |
| Top-1 razonamiento | 91,9% | no disponible |
| Top-1 chat | 79,6% | no disponible |
| Top-1 multilingue | 65,4% | no disponible |

| Contexto | Decodificacion (DSpark on) | Prefill | Decodificacion 3.0bpw | Prefill 3.0bpw |
|---|---|---|---|---|
| ~1 k | 100,7 tok/s | 2.382 tok/s | 103,2 tok/s | 1.663 tok/s |
| ~8 k | 124,6 tok/s | 3.491 tok/s | 113,6 tok/s | 3.104 tok/s |
| ~33 k | 98,6 tok/s | 4.102 tok/s | 103,0 tok/s | 3.619 tok/s |
| ~131 k | 104,9 tok/s | 3.805 tok/s | 83,7 tok/s | 3.332 tok/s |

El autor senala que la decodificacion es practicamente igual a la del pack de 3.0 bpw porque un token lee 6 expertos en ambos casos y la atencion, no los expertos, marca el ritmo; el prefill es entre 1,1x y 1,4x mas rapido. Una segunda pasada de llmprobe con texto predecible alcanza 141-154 tok/s de decodificacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 92 GB residentes para este pack, sobre un Mac de 128 GB; requiere mantener el modelo en el SSD interno del Mac.
- Descarga: 296 GB, incluidas las tablas Engram de 203 GB que se leen desde el SSD por token y no residen en memoria.
- GPU recomendadas: Apple Silicon con 128 GB de memoria unificada; el autor lo ha validado en un M5 Ultra de 256 GB. No se mencionan GPU NVIDIA en la informacion disponible.
- Cabe en GPU de consumo: si, en Mac con 128 GB de memoria unificada; no se dispone de datos para GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: mlx-serve 26.11.2 o posterior, con el comando `mlx-serve --model ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw --serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: decodificacion de 98,6-124,6 tok/s y prefill de 2.382-4.102 tok/s en M5 Ultra de 256 GB; el autor advierte que en un Mac de 128 GB las cifras seran menores por el menor ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD global | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pruned192 2.25bpw (este pack) | 27,1 B totales; 6 de 192 expertos activos | 1M | 0,3233 | 85,82% | MIT | Hugging Face, 92 GB residentes |
| iQ-MLX-3.0bpw (mismo autor) | Modelo base sin podar; 6 de 384 expertos activos | 1M | 0,0963 | 92,64% | MIT | Hugging Face, 209 GB residentes |
| Lossless (mismo autor) | Modelo base sin cuantizar | 1M | no disponible | no disponible | MIT | Hugging Face, 288 GB residentes |
| DeepSeek-V4.1-Flash-1017 (base) | Modelo publicado original | 1M | referencia | referencia | MIT | Hugging Face |

No se dispone de datos de benchmarks estandar ni de modelos de otros autores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El podado elimina la mitad de los expertos enrutados: la calidad cae de forma medible frente al pack de 3.0 bpw, con un KLD global de 0,3233 frente a 0,0963.
- El texto no ingles se degrada gravemente: KLD multilingue de 0,809 y top-1 del 65,4%, frente a 0,117 y sin dato en el pack de 3.0 bpw; el autor lo desaconseja para uso multilingue.
- El chat tambien pierde calidad de forma notable (KLD de 0,405, top-1 del 79,6%), por lo que no es adecuado para conversacion general.
- Riesgo de bucles de repeticion en sesiones de agente largas: el autor indica que una seleccion anterior de expertos basada solo en energia de salida bucleaba, y que la mezcla actual lo mitiga pero no lo elimina por completo.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Idiomas soportados limitados a ingles y chino; no hay soporte declarado de castellano.
- Licencia MIT, que permite uso comercial, pero el pack depende del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 y de la libreria mlx-serve; conviene verificar las condiciones de ambos.
- Requiere mlx-serve 26.11.2 o posterior y mantener el modelo en el SSD interno del Mac; las tablas Engram se leen desde disco en cada token, lo que introduce dependencia del almacenamiento.
- Las cifras de velocidad publicadas corresponden a un M5 Ultra de 256 GB; en un Mac de 128 GB seran inferiores por el menor ancho de banda de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack lossless del mismo autor: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless
- Pack iQ-MLX-3.0bpw del mismo autor: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Descarga de MLXServe: https://mlxserve.com
- Grafico de rendimiento: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw/resolve/main/assets/card-chart.png
