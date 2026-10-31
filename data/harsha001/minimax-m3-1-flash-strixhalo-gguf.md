# Harsha001/MiniMax-M3.1-Flash-StrixHalo-GGUF

## Resumen

MiniMax-M3.1-Flash-StrixHalo-GGUF es una cuantización comunitaria del modelo MiniMax-M3.1-Flash de MiniMaxAI, creada por el usuario Harsha001 para ejecutar el modelo completo en un único sistema AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. El problema que resuelve es claro: las cuantizaciones dinámicas más pequeñas de Unsloth del modelo base ocupan 129 GB (UD-IQ1_M) o 135 GB (UD-IQ2_XXS), demasiado para los 128 GB de memoria compartida de estos equipos. La solución aplicada es la poda de expertos MoE: se eliminan los expertos menos utilizados de cada capa manteniendo intactos, byte a byte, el resto de los tensores de Unsloth.

El resultado son dos builds de unos 97 GB cada uno que dejan espacio para un contexto de 64K tokens (unos 8 GB de caché KV) dentro de un presupuesto de unos 100 GiB de memoria GPU. El modelo base es un MoE de 313.211 millones de parámetros totales orientado a generación de texto con razonamiento (thinking model). Es relevante porque demuestra una técnica (poda de expertos con puntuación REAP) que permite ejecutar modelos de gran tamaño en hardware de consumo con memoria unificada, aunque con una pérdida de calidad medible respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con poda de expertos enrutados |
| Parametros totales | 313.211.018.421 (modelo base, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64K, probado en estas builds; la del modelo base no se especifica) |
| Tipos de cuantizacion | UD-IQ1_M con 93 de 128 expertos por capa; UD-IQ2_XXS con 89 de 128 expertos por capa (cuantizaciones dinámicas de Unsloth de 1-2 bits, no re-cuantizadas) |
| Idiomas soportados | no disponible (las pruebas se han hecho con texto y código en inglés) |
| Licencia | MiniMax Community License (heredada del modelo base; uso no comercial gratuito, uso comercial con condiciones) |
| Formato de pesos | GGUF (3 ficheros por build, con imatrix) |

## Arquitectura y entrenamiento

El modelo base, MiniMax-M3.1-Flash, es un transformer de arquitectura MoE con 313.211 millones de parámetros totales y 128 expertos enrutados por capa. Esta derivación comunitaria no modifica la arquitectura ni el entrenamiento: parte de los ficheros GGUF dinámicos de Unsloth (UD-IQ1_M y UD-IQ2_XXS) y elimina únicamente los expertos enrutados menos utilizados, junto con sus filas del router. Nada se re-cuantiza: cada tensor conservado es idéntico al de Unsloth.

La selección de expertos se realiza mediante la puntuación REAP (peso del router multiplicado por el tamaño de la salida del experto, promediado sobre los tokens que llegan al experto), medida sobre 98.304 tokens de texto y código mezclados. Al no disponer de una copia en precisión completa, las puntuaciones se midieron sobre el fichero UD-IQ2_XXS de Unsloth. La build de 93 expertos conserva el 88,1 % del peso de enrutamiento y la de 89 expertos el 86,0 %. Los datos de preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. Cabe señalar que el modelo original incluye un proyector de visión y un modelo borrador para decodificación especulativa, pero ninguno de los dos está incluido ni probado en estas builds.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada (chat template embebida, compatible con `--jinja` en llama.cpp).
- Razonamiento paso a paso: es un thinking model, por lo que requiere un límite alto de tokens de salida para desplegar su cadena de razonamiento.
- Resolución de problemas matemáticos: alcanza un 95,5 % en las primeras 200 preguntas de GSM8K en las builds podadas.
- Manejo de contexto largo: hasta 64K tokens probados con unos 8 GB de caché KV.
- No incluye capacidades de visión (el proyector de visión del original se ha eliminado) ni decodificación especulativa (el draft model no está incluido).
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada (dependen del modelo base, no documentado aquí).

## Casos de uso

- Ejecución local de un modelo de más de 300 mil millones de parámetros en un mini-PC Strix Halo de 128 GB: es el propósito explícito de la release; cada build ocupa unos 97 GB y deja espacio para contexto de 64K.
- Razonamiento matemático y resolución de problemas offline: con un 95,5 % en GSM8K, las builds podadas mantienen la capacidad de razonar correctamente en tareas de aritmética y lógica de dificultad media.
- Servidor LLM local de contexto largo: mediante `llama-server` con `-c 65536`, permite servir aplicaciones que necesitan ventanas grandes (análisis de documentos extensos, resúmenes largos) sin depender de la nube.
- Experimentación con poda de expertos MoE: los ficheros de expertos conservados están publicados en la carpeta `keep/`, útil para investigadores que quieran estudiar el efecto de la poda REAP sobre la calidad.
- Pruebas multi-backend (CPU, CUDA, Vulkan): el autor documenta explícitamente las diferencias numéricas entre backends, lo que lo hace útil para validar pipelines de inferencia en distintas plataformas.
- Benchmarking de kernels low-bit en Vulkan/ROCm: los kernels de expertos de 1-2 bits en Vulkan aún no están optimizados y son el siguiente objetivo del fork ROCmFPX, un terreno activo para contribuir.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo:

| Build | Perplexity (menor es mejor) | GSM8K (200 preguntas) | Respuestas cortadas | Velocidad de prompt (pp512, GB10) | Velocidad de generación (tg128) |
|---|---|---|---|---|---|
| UD-IQ1_M-E93 | 61,96 | 191/200 (95,5 %) | 0 | 218 t/s | ~12,6 t/s (cota inferior) |
| UD-IQ2_XXS-E89 | 62,11 | 191/200 (95,5 %) | 2 | 315 t/s | no disponible |
| Unsloth UD-IQ1_M sin podar (referencia) | 52,02 | no disponible | no disponible | no disponible | no disponible |

Notas del autor: la perplexity se midió en CPU sobre 8 fragmentos de 2048 tokens de Wikipedia en inglés y código fuente. GSM8K se evaluó con `llama-server`, decodificación greedy, hasta 6144 tokens de salida y 4 peticiones en paralelo, sobre un NVIDIA DGX Spark (GB10); no hay puntuación del modelo sin podar con la misma configuración para comparar. La velocidad de generación se midió con otros procesos en la máquina, por lo que es una cota inferior. No se han publicado resultados en Strix Halo. No hay datos de MMLU, HumanEval ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM/memoria necesaria: unos 97 GB (90 GiB) para los pesos de cada build, más unos 8 GB de caché KV para 64K de contexto; el sistema debe poder asignar unos 100 GiB a la GPU.
- En Windows hay que fijar en BIOS o en AMD Software la máxima memoria gráfica posible dejando RAM suficiente para el sistema; en Linux hay que elevar el límite de GTT.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada. Las pruebas de calidad y velocidad se realizaron en CPU y en un NVIDIA DGX Spark (GB10) con CUDA, no en Strix Halo.
- Cabe en una única GPU de consumo con memoria unificada de 128 GB (Strix Halo); no cabe en GPUs dedicadas convencionales como la RTX 4090 (24 GB) ni en una A100 de 80 GB.
- Despliegue: llama.cpp compilado desde el fork ROCmFPX (Vulkan con `-DGGML_VULKAN=ON`); también compatible con runtimes llama.cpp estándar (CPU, CUDA). No se mencionan vLLM, TGI ni Ollama.
- Rendimiento: prompt processing de 218 t/s (UD-IQ1_M-E93) y 315 t/s (UD-IQ2_XXS-E89) en GB10; generación de ~12,6 t/s como cota inferior en GB10. En Vulkan los kernels de expertos de 1-2 bits aún no están optimizados, así que hay que esperar velocidades bajas inicialmente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Tamano | Contexto probado | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-StrixHalo-GGUF (esta ficha) | 313.211 M (base) | UD-IQ1_M-E93 / UD-IQ2_XXS-E89 (poda MoE) | 96,6-96,8 GB | 64K | MiniMax Community (condicional para uso comercial) |
| unsloth/MiniMax-M3.1-Flash-GGUF (UD-IQ1_M, sin podar) | 313.211 M | UD-IQ1_M | 129,4 GB | no disponible | MiniMax Community |
| unsloth/MiniMax-M3.1-Flash-GGUF (UD-IQ2_XXS, sin podar) | 313.211 M | UD-IQ2_XXS | 135 GB | no disponible | MiniMax Community |

La comparación clave es la calidad frente al tamaño: la poda a 93 expertos eleva la perplexity de 52,02 a 61,96, pero reduce el footprint de 129,4 GB a 96,6 GB, lo único que permite ejecutarlo en un equipo Strix Halo de 128 GB. El autor también indica que mantiene builds similares podadas de DeepSeek con la misma técnica. No hay alternativas de otros autores para este modelo concreto: no disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible por la poda: la perplexity sube de 52,02 (sin podar) a 61,96-62,11; GSM8K es una tarea fácil para un modelo de este tamaño y no garantiza que las builds podadas igualen al original en tareas más difíciles.
- Estado de release comunitaria de prueba: no se ha ejecutado todavía en un Strix Halo real; las velocidades publicadas provienen de un DGX Spark (GB10) y la de generación es una cota inferior medida con otros procesos en marcha.
- Diferencias entre backends: CUDA y CPU coinciden solo en un 82-83 % en el token superior (KL media 0,20-0,26); el router podado tiene empates cercanos entre expertos, así que no esperes salidas idénticas en Vulkan, CUDA y CPU.
- Es un thinking model: hay que asignar suficientes tokens de salida o las respuestas se cortarán a mitad de razonamiento.
- Sin visión ni decodificación especulativa: el proyector de visión y el draft model del original no están incluidos ni probados.
- Kernels Vulkan de 1-2 bits sin optimizar: el rendimiento inicial será bajo hasta que el fork ROCmFPX los tune.
- Licencia: MiniMax Community License. El uso no comercial es gratuito; el uso comercial exige un aviso "Built with MiniMax M3.1-Flash" o, según los ingresos, una notificación o autorización escrita de MiniMax, y la licencia lista usos prohibidos. Hay que leer el fichero LICENSE antes de cualquier despliegue comercial.
- Sesgos, riesgo de alucinación y soporte multilingüe del modelo base: no disponible en la información proporcionada.

## Enlaces

- Ficha del modelo: https://huggingface.co/Harsha001/MiniMax-M3.1-Flash-StrixHalo-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Cuantizaciones de Unsloth del modelo base: https://huggingface.co/unsloth/MiniMax-M3.1-Flash-GGUF
- Repositorio ROCmFPX (herramientas de poda y compilación): https://github.com/HarshaVardhan3002/ROCmFPX
- Web del proyecto ROCmFPX (votación de próximas cuantizaciones): https://harshavardhan3002.github.io/ROCmFPX/
