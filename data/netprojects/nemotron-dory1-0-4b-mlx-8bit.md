# netprojects/nemotron-dory1.0-4b-mlx-8bit

## Resumen

Nemotron-Labs Dory 1.0 4B es un modelo de razonamiento de NVIDIA publicado el 16 de octubre de 2026 bajo licencia OpenMDW-1.1. Su rasgo distintivo es que es un *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un único conjunto de pesos ofrece un dial entre velocidad y precision sin cambiar de checkpoint. Con 3.975.229.440 parametros totales, se situa en la categoria de 4B y esta orientado a generacion de texto y razonamiento en ingles.

La ficha que nos ocupa no es el modelo original, sino una conversion a **MLX en 8 bits** (cuantizacion afina, tamano de grupo 64) realizada por NetProjects (Internet Projects Ltd.), no afiliada a NVIDIA. El repositorio ocupa 4,2 GB y esta pensado para Apple Silicon: se carga mediante el paquete `dory-mlx`, que anade la arquitectura `dory` a MLX. La build fue probada en un MacBook Pro con M5 Max y 128 GB de memoria unificada.

El interes actual de esta conversion es practico: permite ejecutar un modelo de razonamiento con cadena de pensamiento explicita (`<think>...</think>`) en hardware de consumo de Apple, con perplejidad practicamente identica a la build bf16 (11,77 frente a 11,76 en WikiText-2 con 2 loops) y un coste de memoria de 9,0 GB con prompt de 32K tokens. Existe ademas una build NVFP4 de 2,6 GB derivada del checkpoint NVFP4 de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido y bucle configurable (looped language model); implementacion MLX |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza los mismos pesos) |
| Longitud de contexto | no disponible de forma explicita; verificado con prompts de hasta 24K tokens y medido hasta 32K tokens |
| Tipos de cuantizacion | 8 bits afina con tamano de grupo 64 (esta build); existe build NVFP4 de 4 bits en otro repositorio |
| Idiomas soportados | ingles (`en`) |
| Licencia | OpenMDW-1.1 (heredada del modelo base); el codigo de `dory-mlx` es Apache-2.0 |
| Formato de pesos | safetensors (layout fusionado: query/key/value/gate en una matriz y gate/up del MLP en una) |

## Arquitectura y entrenamiento

Dory es un transformer con un bloque de capas compartido que se aplica de 1 a 4 veces por token; el numero de iteraciones es un hiperparametro de inferencia (`loops`), no una variante de pesos. Esa reutilizacion explica que un modelo de 4B pueda escalar su capacidad efectiva de computo sin aumentar el numero de parametros. Los pesos de esta conversion usan un layout fusionado (QKV+gate en una sola matriz, gate+up del MLP en otra) para acelerar la decodificacion; el script `scripts/convert.py` de `dory-mlx` reconstruye el formato desde el checkpoint original de NVIDIA.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Si esta documentado el comportamiento: el modelo razona primero dentro de etiquetas `<think>` y despues responde, con ajustes recomendados de temperatura 1.0 y top_p 0.95. La verificacion de la conversion incluye comparacion de logits contra una implementacion independiente en PyTorch fp32 (100% de acuerdo top-1, KL entre 0,001 y 0,003) y validacion de caches de ventana deslizante (acuerdo top-1 de al menos 98,7%, KL maximo de 0,0006).

## Capacidades

- Generacion de texto en ingles con cadena de razonamiento explicita previa a la respuesta final.
- Razonamiento multi-paso y resolucion de problemas aritmeticos (el ejemplo de la model card es `17 * 23`).
- Modo *thinking* integrado: la salida incluye el bloque `<think>...</think>`, lo que alarga las respuestas respecto a un modelo de chat convencional.
- Dial de computo en inferencia: `loops` de 1 a 4 permite priorizar latencia (1 loop) o precision (4 loops) con los mismos pesos.
- Procesamiento de contextos largos: verificado hasta 24K tokens y medido con prompts de 32K.
- Compatibilidad con caches de ventana deslizante y prefill por chunks en MLX.
- Servicio por lotes a traves de MLX-LM (con el PR 1988): aproximadamente 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Razonamiento local en portatiles Apple Silicon: cargar el modelo con `dory-mlx` o MLX-LM y ejecutar consultas de razonamiento sin conexion, ajustando `loops` segun la latencia tolerada (101 tokens/s con 1 loop frente a 39 tokens/s con 4 en un M5 Max).
- Asistentes de analisis con documentos largos: con 32K tokens de contexto y lectura de prompt a 1.874-3.200 tokens/s, es viable introducir informes extensos y hacer preguntas sobre ellos en una sola pasada.
- Prototipado de agentes de razonamiento: el bloque `<think>` permite inspeccionar y filtrar la traza de razonamiento antes de exponer la respuesta final al usuario.
- Servicio por lotes en un unico equipo: con MLX-LM y el PR 1988 se pueden atender varias peticiones concurrentes (450 tokens/s agregados con 16 peticiones en 8 bits y 2 loops), suficiente para un equipo pequeno o un entorno de desarrollo compartido.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card publica perplejidad en WikiText-2 para 1, 2 y 4 loops en 8 bits y bf16, lo que facilita reproducir estudios de degradacion por cuantizacion.
- Educacion y demostraciones de razonamiento: la traza `<think>` visible hace el modelo util para mostrar como se descompone un problema, con la advertencia de que solo trabaja en ingles.
- Investigacion sobre *looped language models*: al variar `loops` sobre los mismos pesos se puede estudiar la relacion entre computo efectivo y calidad (perplejidad 12,18 / 11,77 / 11,70 para 1 / 2 / 4 loops).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card remite a la ficha original de NVIDIA para los resultados de precision. Si se publican las siguientes metricas de fidelidad y rendimiento:

| Metrica | Resultado |
|---|---|
| Perplejidad WikiText-2, 8 bits, 1 loop | 12,18 |
| Perplejidad WikiText-2, 8 bits, 2 loops | 11,77 |
| Perplejidad WikiText-2, 8 bits, 4 loops | 11,70 |
| Perplejidad WikiText-2, bf16, 1 / 2 / 4 loops | 12,17 / 11,76 / 11,69 |
| Acuerdo top-1 8 bits frente a bf16 (5 textos, 2 loops) | 98% (KL 0,003) |
| Perdida de prediccion de texto, 8 bits frente a bf16 | 1,278 frente a 1,271 |
| Acuerdo top-1 frente a PyTorch fp32 (55 tokens, 2 loops) | 100% (KL 0,001-0,003) |

Rendimiento medido en MacBook Pro M5 Max (128 GB), medianas de ejecuciones repetidas con dispersion de aproximadamente el 2%:

| Loops | Generacion, prompt corto | Generacion tras prompt de 32K | Lectura de prompt de 32K | Memoria pico con 32K |
|---|---|---|---|---|
| 1 | 101 tokens/s | 82 tokens/s | 3.200 tokens/s (10 s) | 7,7 GB |
| 2 | 69 tokens/s | 54 tokens/s | 1.980 tokens/s (17 s) | 9,0 GB |
| 4 | 39 tokens/s | 31 tokens/s | 1.070 tokens/s (31 s) | 11,5 GB |

Con MLX-LM (PR 1988, 8 bits, 2 loops, decodificacion greedy, limite de cache MLX de 1 GiB): 68,0 tokens/s de generacion con prompt de 25 tokens y 4,39 GB de pico; 64,4 tokens/s con prompt de 4.096 y 8,97 GB; 59,6 tokens/s con 16.384; 53,0 tokens/s con 32.768. En un MacBook Pro M1 Pro de 16 GB, una medicion independiente con 4 bits y 2 loops reporta 27,9 tokens/s con contexto de 1K y 19,3 tokens/s con 32K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/nemotron-dory1.0-4b-mlx-8bit | 3,98B | verificado hasta 24K-32K | 8 bits MLX (grupo 64) | OpenMDW-1.1 | Hugging Face, 6.724 descargas |
| netprojects/nemotron-dory1.0-4b-mlx-nvfp4 | no disponible | no disponible | NVFP4 (4 bits), 2,6 GB | OpenMDW-1.1 | Hugging Face; aproximadamente 1,4x mas rapido que 8 bits |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 3,98B | no disponible | bf16 | OpenMDW-1.1 | Hugging Face (modelo base) |
| netprojects/h2o-lightning-4b-mlx-q8 | no disponible | no disponible | 8 bits MLX | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad de Dory 1.0 4B con modelos de la misma categoria; la comparacion anterior se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Solo procesa y genera texto en ingles; no se documenta soporte multilingue.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son mas largas y consumen mas tokens de salida que las de un modelo de chat convencional.
- No se han publicado resultados de benchmarks de calidad en la informacion disponible; la evaluacion publica se limita a perplejidad y fidelidad de la cuantizacion.
- Riesgo de alucinacion no cuantificado: no hay datos de evaluacion de veracidad ni de sesgos en la informacion proporcionada.
- La licencia OpenMDW-1.1 es la del modelo original y debe revisarse en el fichero `LICENSE` antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Esta build esta pensada exclusivamente para Apple Silicon mediante MLX; no es directamente utilizable en CUDA sin reconvertir los pesos.
- El layout de pesos es fusionado y propietario de la conversion; cargarlo con herramientas distintas de `dory-mlx` o del soporte propuesto en MLX-LM (PR 1988) requiere reconversion.
- El contexto maximo no esta declarado de forma explicita; las mediciones llegan a 32K tokens, pero no se garantiza un limite oficial superior.
- La build NVFP4 (4 bits) es mas rapida y ligera, pero la model card recomienda la de 8 bits cuando se busca maxima fidelidad respecto a bf16.
- Proyecto no afiliado a NVIDIA: el soporte y las garantias dependen de NetProjects y del repositorio `dory-mlx`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build NVFP4 de 4 bits: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Repositorio `dory-mlx`: https://github.com/internet-projects/dory-mlx
- MLX: https://github.com/ml-explore/mlx
- PR de soporte Dory en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/1988
- Medicion independiente en M1 Pro: https://github.com/nace-ai/kapitsa/issues/296
- Organizacion NetProjects en Hugging Face: https://huggingface.co/netprojects
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- Articulo sobre H2O-Lightning-4B en Apple Silicon: https://netprojects.com/insights/h2o-lightning-4b-on-apple-silicon-mlx
- Estandares de IA de NetProjects: https://netprojects.com/standards/ai
