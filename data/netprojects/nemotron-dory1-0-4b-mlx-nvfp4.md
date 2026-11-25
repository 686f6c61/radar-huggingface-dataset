# netprojects/nemotron-dory1.0-4b-mlx-nvfp4

## Resumen

Este repositorio contiene una conversión a MLX del checkpoint NVFP4 de NVIDIA Nemotron-Labs Dory 1.0 4B, un modelo de razonamiento de 3.975 millones de parámetros publicado por NVIDIA a través de su iniciativa Nemotron-Labs. La particularidad de Dory es que es un *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un único conjunto de pesos ofrece un dial entre velocidad y precisión sin necesidad de cargar modelos distintos. Este build concreto, mantenido por NetProjects (Internet Projects Ltd), no re-cuantiza: copia byte a byte los pesos de 4 bits y las escalas de bloque calibradas por NVIDIA al formato nativo `nvfp4` de MLX, por lo que ejecuta exactamente los pesos que NVIDIA ajustó.

El resultado es un paquete de 2,6 GB que ocupa aproximadamente la mitad que el build de 8 bits (4,2 GB) y un tercio que el de bf16 (8,0 GB), con una perplejidad en WikiText-2 prácticamente idéntica (11,59 frente a 11,62 en bf16, con 2 loops) y una velocidad de generación de 99 tokens/s en un Apple M5 Max, frente a 69 tokens/s del build de 8 bits. La coincidencia con el token top-1 del build bf16 es del 89 %, lo que indica una deriva pequeña pero no despreciable respecto al original.

Es relevante ahora porque demuestra una ruta de cuantización poco habitual: en lugar de comprimir un modelo en bf16, se reutiliza una cuantización NVFP4 ya calibrada por el fabricante y se traslada a un runtime distinto (MLX) preservando el layout de bloques de 16 valores con escala E4M3 por bloque. Para desarrolladores en Apple Silicon que quieran ejecutar modelos de razonamiento con cadena de pensamiento explícita en local, es una opción compacta y rápida, aunque limitada al inglés y a un único ecosistema de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido reutilizado en bucle (looped language model), con atención y MLP fusionados en matrices únicas |
| Parametros totales | 3.975.229.440 (≈4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (se han validado prompts de 16K tokens en las pruebas del autor) |
| Tipos de cuantizacion | NVFP4 (4 bits, bloques de 16 con escala E4M3 por bloque y escala por matriz); embeddings y cabeza de salida en 8 bits; existen builds bf16 y 8-bit del mismo modelo |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (modelo); codigo de `dory-mlx` bajo Apache-2.0 |
| Formato de pesos | safetensors en formato MLX `nvfp4` (layout fusionado: query/key/value/gate en una matriz, gate/up del MLP en otra) |

## Arquitectura y entrenamiento

Dory 1.0 4B es un modelo de lenguaje de tipo *looped*: en lugar de apilar decenas de capas distintas, define un bloque compartido que se aplica repetidamente entre 1 y 4 veces según se configure en tiempo de inferencia. El checkpoint por defecto usa 2 loops, que es la configuración recomendada por NVIDIA. Esta recurrencia permite que un mismo conjunto de pesos escale en capacidad de cómputo efectiva sin aumentar el número de parámetros almacenados, a costa de un mayor tiempo de inferencia por token. El modelo normaliza la salida de casi todas las matrices, lo que en la práctica cancela la escala por matriz del formato NVFP4; el conversor de NetProjects pliega esa escala en las escalas por canal ya existentes del modelo (en la puerta de salida de atención y en la puerta del MLP) para los dos casos en que sí importa.

Sobre el entrenamiento no se proporcionan en la información disponible datos de número de tokens, composición del dataset ni si hubo RLHF o DPO; la model card remite a la ficha original de NVIDIA para los detalles. Lo que sí está documentado es el proceso de cuantización: NVIDIA publicó un checkpoint NVFP4 con valores de 4 bits en bloques de 16 y una escala E4M3 por bloque más una escala adicional por matriz. MLX usa exactamente la misma estructura de bloques y escalas, de modo que la conversión copia esos bytes sin alterarlos. Las verificaciones del autor muestran un error relativo de 0,08 al de-cuantizar frente a los pesos bf16 de NVIDIA (un layout incorrecto daría 1,4), y una deriva KL de 0,07 frente al re-cuantizado propio desde bf16, que sería de 0,13.

## Capacidades

- Generación de texto en inglés con cadena de razonamiento explícita: el modelo emite primero el razonamiento dentro de `` y después la respuesta final.
- Razonamiento multi-paso y aritmética: la model card verifica respuestas como 17 × 23 = 391.
- Modo de razonamiento con profundidad ajustable mediante el parámetro `loops` (1 a 4), que actúa como dial velocidad/precisión.
- Conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Inferencia local en Apple Silicon mediante MLX y el paquete `dory-mlx`.
- Soporte de cachés de ventana deslizante con prefill por trozos y decodificación token a token, validado con una concordancia top-1 de al menos el 99,3 % frente a un pase completo.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información proporcionada.

## Casos de uso

- Razonamiento matemático y verificación de cálculos en local: el modelo puede resolver operaciones y mostrar la cadena de pensamiento, útil para herramientas de escritorio que necesiten justificar resultados sin enviar datos a la nube.
- Asistente de análisis en portátiles Apple Silicon: con 2,6 GB de pesos y un pico de 7,3 GB con prompts de 16K tokens, cabe holgadamente en un MacBook con 16 GB o más y permite trabajar con documentos largos sin conexión.
- Procesamiento por lotes de textos largos en el propio equipo: la lectura de un prompt de 16K tokens a 2.600 tokens/s con 2 loops permite indexar o resumir documentos extensos con latencia aceptable.
- Prototipado e investigación sobre modelos looped: el dial de 1 a 4 loops y las métricas de perplejidad publicadas (12,01 / 11,59 / 11,52) lo convierten en una plataforma para estudiar el compromiso entre profundidad efectiva y coste computacional.
- Generación de explicaciones educativas en inglés: el formato con razonamiento previo y respuesta posterior encaja en materiales didácticos donde interesa mostrar el proceso, no solo el resultado.
- Evaluación comparativa de cuantizaciones: al existir builds bf16, 8-bit y NVFP4 del mismo modelo con métricas de perplejidad y acuerdo top-1 publicadas, sirve para medir el impacto real de la cuantización en un pipeline concreto antes de adoptarla en producción.
- Herramientas de CLI y automatización local: el paquete `dory-mlx` expone carga y chat por línea de comandos, lo que facilita integrarlo en scripts de procesamiento de texto sin infraestructura de servidor.

## Benchmarks y rendimiento

Los datos publicados por el autor son de perplejidad, acuerdo con bf16 y velocidad, no de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de tareas en la información disponible.

| Metrica | NVFP4 (este build) | 8-bit | bf16 |
|---|---|---|---|
| Tamano | 2,6 GB | 4,2 GB | 8,0 GB |
| Generacion, 2 loops | 99 tokens/s | 69 tokens/s | 39 tokens/s |
| Perplejidad WikiText-2, 1 loop | 12,01 | 12,05 | 12,04 |
| Perplejidad WikiText-2, 2 loops | 11,59 | 11,64 | 11,62 |
| Perplejidad WikiText-2, 4 loops | 11,52 | 11,58 | 11,56 |
| Coincidencia top-1 con bf16, 2 loops | 88,9 % | 97 % | — |

| Loops | Generacion, prompt corto | Generacion tras prompt de 16K | Lectura de prompt de 16K | Memoria pico con 16K |
|---|---|---|---|---|
| 1 | 149 tokens/s | 124 tokens/s | 4.130 tokens/s | 6,1 GB |
| 2 | 99 tokens/s | 82 tokens/s | 2.600 tokens/s | 7,3 GB |
| 4 | 59 tokens/s | 49 tokens/s | 1.500 tokens/s | 9,8 GB |

Mediciones realizadas el 7 de noviembre de 2026 en un MacBook Pro M5 Max de 128 GB con MLX 0.32, decodificación greedy y mediana de 3 ejecuciones tras un calentamiento.

## Requisitos de hardware

- VRAM/memoria unificada: 6,1 GB de pico con 1 loop y prompt de 16K; 7,3 GB con 2 loops; 9,8 GB con 4 loops. Para prompts cortos el consumo es inferior.
- GPU recomendadas: Apple Silicon exclusivamente, dado que el runtime es MLX. El build se probó en un M5 Max de 128 GB; no se documentan pruebas en otras variantes de chip.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (16 GB o más para trabajar con contexto largo a 2 loops).
- No es compatible con CUDA ni con GPUs NVIDIA/AMD convencionales: el formato `nvfp4` de MLX y el paquete `dory-mlx` están atados al ecosistema MLX.
- Opciones de despliegue: MLX mediante `dory-mlx` (instalación desde GitHub con `pip install "git+https://github.com/internet-projects/dory-mlx"`), uso como CLI (`python -m dory_mlx`) o como API de Python (`dory_mlx.load` y `dory_mlx.chat`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 99 tokens/s de generación con 2 loops en prompt corto; 82 tokens/s tras un prompt de 16K; 2.600 tokens/s de lectura de prompt de 16K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Dory 1.0 4B MLX NVFP4 (este) | ≈4B (3,975B) | No disponible | NVFP4 4-bit + embeddings 8-bit | OpenMDW-1.1 | MLX (Apple Silicon) |
| Dory 1.0 4B MLX 8-bit | ≈4B | No disponible | 8-bit | OpenMDW-1.1 | MLX (Apple Silicon) |
| Dory 1.0 4B MLX bf16 | ≈4B | No disponible | bf16 | OpenMDW-1.1 | MLX (Apple Silicon) |
| NVIDIA Nemotron-Labs Dory1.0-4B NVFP4 (original) | ≈4B | No disponible | NVFP4 | OpenMDW-1.1 | Ecosistema NVIDIA |

La comparación con modelos de otros fabricantes y de tamaño similar no está disponible en la información proporcionada. Dentro de la propia familia, la elección es clara: NVFP4 para velocidad y memoria reducida, 8-bit cuando se prioriza la fidelidad al modelo original (97 % de coincidencia top-1 frente al 89 % del NVFP4).

## Limitaciones y advertencias

- Solo inglés: la model card declara `language: [en]` y el texto de entrada y salida es exclusivamente en inglés.
- Deriva de cuantización medible: la coincidencia top-1 con bf16 es del 88,9 % con 2 loops, inferior al 97 % del build de 8 bits. En tareas sensibles a tokens exactos (código, cifras, nombres propios) conviene validar salidas o usar el build de 8 bits.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son más largas y consumen más tokens de salida que las de un modelo de chat convencional; hay que presupuestar `max_tokens` en consecuencia.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación en la información disponible.
- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada.
- Longitud de contexto máxima: no especificada; las pruebas del autor llegan a 16K tokens, pero no se confirma que ese sea el límite del modelo.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no hay ruta de despliegue en CUDA, ROCm ni CPUs x86 documentada para este build.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con términos propios; antes de uso comercial conviene revisar el texto completo incluido en `LICENSE`, ya que la model card la etiqueta como `license: other`.
- Este repositorio es una conversión de terceros (NetProjects) no afiliada a NVIDIA; los resultados de precisión de referencia deben consultarse en la ficha original de NVIDIA.
- El repositorio tiene 0 likes y 316 descargas en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Model card original bf16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build MLX 8-bit: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-8bit
- Build MLX bf16: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-bf16
- Repositorio de codigo dory-mlx: https://github.com/internet-projects/dory-mlx
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- Coleccion de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Estandares de uso de IA de NetProjects: https://netprojects.com/standards/ai
- Sitio de NetProjects: https://netprojects.com
