# roman220220/Inkling-2-Mini-gptq-mlx-jang-small

## Resumen

Inkling-2-Mini-gptq-mlx-jang-small es una cuantizacion extrema del modelo multimodal thinkingmachines/Inkling-2-Mini, un transformer de mezcla de expertos (MoE) de 26.400 millones de parametros con 3.400 millones activos por token, desarrollado por Thinking Machines Lab. La version aqui descrita la publica el usuario roman220220 y esta empaquetada para MLX, el framework de Apple Silicon, con cuantizacion GPTQ y una receta de bits por componente. El objetivo es reducir el modelo desde los 19,5 GB de la publicacion original (expertos en NVFP4) hasta 11,1 GB, de modo que pueda ejecutarse en Macs con memoria unificada moderada.

La innovacion principal del modelo base es su bloque intermedio con bucles: las capas 6 a 17 se ejecutan tres veces compartiendo pesos, lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. Ademas incorpora una torre de vision y un borrador DSpark para decodificacion especulativa, ambos incluidos en esta publicacion cuantizada.

Esta ficha es relevante para quienes trabajan con inferencia local en Apple Silicon y necesitan un modelo multimodal grande con contexto y capacidades de agente, aceptando una perdida de calidad medible a cambio de un ahorro de memoria de aproximadamente el 43 % frente a la version original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas intermedias en bucle (capas 6-17 ejecutadas 3 veces con pesos compartidos) y torre de vision |
| Parametros totales | 26.706.454.912 (~26,7 B) |
| Parametros activos | 3,4 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con receta por componente: atencion 8 bits, gate y up de expertos enrutados 2 bits, down de expertos 3 bits, embeddings y cabeza de salida 8 bits, torre de vision bf16, borrador DSpark 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 11,5 GB |
| Memoria GPU estimada | ~12 GB en Apple Silicon, mas cache de prompt |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados por capa, de los cuales 8 se activan por token. La peculiaridad estructural es el bloque de capas 6 a 17, que se recorre tres veces con los mismos pesos (looped middle), de forma que un unico conjunto de pesos interviene en tres pasadas. La torre de vision procesa imagenes y las proyecta al espacio del modelo, habilitando la tarea image-text-to-text. El modelo incluye ademas un borrador DSpark (tres capas densas pequenas mas una cabeza recurrente) que propone siete tokens por pasada a partir de los estados ocultos del propio modelo, para decodificacion especulativa.

La cuantizacion de esta publicacion aplica GPTQ con compensacion de error de Hessian sobre la rejilla afin de MLX, partiendo de los pesos de la publicacion original (expertos NVFP4 dequantizados de forma exacta). Cada experto enrutado se calibra sobre los tokens que el router le asigna. La calibracion usa 128 fragmentos de 512 tokens, mitad de wikitext-2 train y mitad de codigo Python, capa por capa, en una A100 durante 12 minutos. Las capas en bucle se calibran sobre las entradas de la primera pasada y las pasadas 2 y 3 se ejecutan sobre las capas ya cuantizadas. Los ficheros MLX conservan los codigos, escalas y sesgos propios de GPTQ en lugar de recuantizar. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con calibracion especifica sobre codigo Python y mediciones de perplejidad en el mismo dominio.
- Comprension de imagenes y respuesta image-text-to-text mediante la torre de vision (mantenida en bf16).
- Decodificacion especulativa con el borrador DSpark incluido, que acelera la generacion verificando varios tokens por pasada.
- Capacidades de agente y tool calling: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento extendido (thinking): no confirmado en la informacion disponible.

## Casos de uso

- Asistente local en macOS: el modelo se ejecuta integramente en Apple Silicon con unos 12 GB de memoria GPU, de modo que conversaciones y documentos no salen del equipo. Es adecuado para entornos con requisitos de privacidad estrictos.
- Generacion de codigo en local: con calibracion sobre Python y una perplejidad de 2,696 en codigo, sirve para autocompletar funciones, escribir tests y refactorizar en un flujo de trabajo sin conexion.
- Descripcion y analisis de imagenes: la torre de vision en bf16 conserva una similitud coseno de 0,9988 frente a HF transformers, por lo que se puede usar para etiquetado de imagenes, extraccion de informacion visual y respuesta a preguntas sobre capturas.
- Servidor compatible con OpenAI: el comando `mlx_lm.server` expone una API compatible con OpenAI en el puerto indicado, lo que permite integrar el modelo en herramientas existentes que ya hablan ese protocolo.
- Prototipado de agentes con contexto largo: aunque la longitud de contexto no esta documentada, el modelo base esta pensado para conversaciones y tareas multi-paso; conviene validar el limite real antes de disenar el pipeline.
- Investigacion en cuantizacion: la publicacion incluye la receta completa por componente y las mediciones frente a la version de 3 bits, lo que la convierte en una referencia util para estudiar el impacto de la cuantizacion extrema en modelos MoE con capas en bucle.
- Despliegue en Macs de gama alta con memoria unificada de 16 GB o mas: al ocupar 11,1 GB de pesos, deja margen para el cache de prompt y el contexto en equipos con 16-24 GB.

## Benchmarks y rendimiento

Las unicas mediciones publicadas son de perplejidad sobre texto en ingles (wikitext-2 test) y codigo Python (biblioteca estandar de Python), con 40 fragmentos de 512 tokens, comparadas con la publicacion original en HF transformers.

| Modelo | Tamano | PPL texto | vs original | PPL codigo | vs original |
|---|---|---|---|---|---|
| Original (HF transformers, NVFP4) | 19,5 GB | 8,985 | — | 2,466 | — |
| Build de 3 bits | 13,1 GB | 9,292 | +3,4 % | 2,526 | +2,4 % |
| Este modelo (MLX, 8/2/3 bits) | 11,1 GB | 10,068 | +12,1 % | 2,696 | +9,3 % |

En decodificacion especulativa con el borrador DSpark, el numero de tokens por paso de verificacion (greedy, probando los siete borradores) es de 1,92 en wikitext-2 test y 3,44 en la biblioteca estandar de Python. La velocidad y el consumo de memoria en Mac no se han medido para este modelo. Los benchmarks de la model card del modelo base (MMLU, HumanEval, GSM8K y similares) no se han reejecutado sobre esta cuantizacion, por lo que no se dispone de resultados propios en esas pruebas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB de memoria GPU en Apple Silicon, mas el cache de prompt. El repositorio ocupa 11,5 GB y los pesos 11,1 GB.
- GPU recomendadas: exclusivamente Apple Silicon con memoria unificada; el formato MLX no se ejecuta en GPUs NVIDIA o AMD.
- Cabe en consumer GPU: si, en Macs con memoria unificada de 16 GB o superior (M-series Pro, Max y Ultra). En equipos de 8 GB no cabe.
- Opciones de despliegue: MLX a traves del fork `ipsupport-llc/mlx-lm` (el `mlx-lm` estandar no soporta Inkling 2), con `mlx_lm.generate` para generacion y `mlx_lm.server` para servir una API compatible con OpenAI. Tambien la aplicacion LLMTray para macOS.
- Latencia y throughput: no medidos para este modelo en Mac. El unico dato de rendimiento es el de la decodificacion especulativa (1,92 y 3,44 tokens por paso de verificacion en texto y codigo respectivamente).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / plataforma | Tamano de pesos |
|---|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini 8/2/3 bits, MLX) | 26,7 B | 3,4 B | no disponible | Apache 2.0 | MLX safetensors, Apple Silicon | 11,1 GB |
| Inkling-2-Mini build de 3 bits (MLX) | 26,7 B | 3,4 B | no disponible | Apache 2.0 | MLX safetensors, Apple Silicon | 13,1 GB |
| Inkling-2-Mini original (HF transformers) | 26,7 B | 3,4 B | no disponible | Apache 2.0 | safetensors, NVIDIA / CPU | 19,5 GB |

La comparativa se limita a las tres variantes del mismo modelo base, porque la informacion proporcionada no incluye datos de modelos alternativos de otros desarrolladores. No se dispone de cifras de MMLU, HumanEval ni GSM8K para ninguna de las tres variantes, solo de perplejidad.

## Limitaciones y advertencias

- La cuantizacion es extrema: la perplejidad sube un 12,1 % en texto y un 9,3 % en codigo frente a la publicacion original. Si la calidad importa mas que los 2 GB de ahorro, la build de 3 bits (13,1 GB, +3,4 % / +2,4 %) es la opcion recomendada por el propio autor.
- El modelo base puede presentar sesgos y alucinaciones; la model card remite a la del modelo original para las limitaciones de uso, que se aplican sin cambios.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas sin validacion previa.
- Los idiomas soportados no estan documentados; las mediciones de calidad se han hecho unicamente en ingles y en codigo Python.
- El formato es exclusivo de MLX y Apple Silicon; no hay version GGUF ni compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- La decodificacion especulativa requiere el fork `ipsupport-llc/mlx-lm`; el `mlx-lm` estandar no soporta Inkling 2. En empate cercano, la salida greedy puede diferir de la decodificacion simple por el redondeo de la verificacion multi-token en bf16.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos originales de Thinking Machines Lab antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la velocidad y memoria en Mac no se han medido: es una publicacion reciente y sin validacion independiente.
- La torre de vision se mantiene en bf16 y conserva buena fidelidad (coseno 0,9988), pero no se han publicado evaluaciones de vision mas alla de una prueba cualitativa con una imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roman220220/Inkling-2-Mini-gptq-mlx-jang-small
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de 3 bits del mismo autor: https://huggingface.co/roman220220/Inkling-2-Mini-gptq-mlx-jang
- Fork de MLX con soporte de Inkling 2: https://github.com/ipsupport-llc/mlx-lm
- Pipeline y scripts de cuantizacion: https://github.co (enlace truncado en la model card; no se dispone de la URL completa)
- Aplicacion LLMTray para macOS: https://www.ipsupport.us/llmtray/
- Descarga de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Repositorio GitHub de LLMTray: https://github.com/ipsupport-llc/llmtray
