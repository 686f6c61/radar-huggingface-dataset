# fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-NVFP4

## Resumen

Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-NVFP4 es una cuantización para Apple Silicon del modelo Inkling-2-Mini en su variante Unbound (sin censura) y con ajuste Anti-Overthinking, publicada por el usuario fritskarl. Parte del modelo original de Thinking Machines (thinkingmachines/Inkling-2-Mini) y de los derivados de Lucebox, nokeepai y thiagovelsa, y se distribuye en formato MLX con pesos NVFP4/MXFP8 para los expertos enrutados y 8 bits para los pesos densos. La arquitectura es un transformer de mezcla de expertos (MoE) con 26.388.646.400 parámetros totales y una ventana de contexto declarada de 131.072 tokens.

El interés de esta ficha radica en que es una compilación orientada a la fidelidad numérica: los expertos enrutados son bit-idénticos a la release original (NVFP4 en las capas 0-19 y MXFP8 en las 20-23) y los pesos densos se cuantizan directamente desde BF16 con una similitud coseno declarada de al menos 0,99997. El autor reporta 53,7 tok/s en un MacBook Pro M3 Max mediante oMLX con el motor externo Splash y un peso en disco de 17 GB.

Se trata de un modelo derivado, no de un entrenamiento nuevo: hereda las capacidades del base, pero elimina la mayoría de rechazos por el merge Unbound y añade el ajuste Anti-Overthinking para reducir bucles de razonamiento. La licencia es Apache 2.0 y el modelo está etiquetado como uncensored, lo que traslada al usuario la responsabilidad del filtrado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); tag `moe` |
| Parametros totales | 26.388.646.400 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion recomendada `max_context_window`) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, capas 0-19), MXFP8 (expertos, capas 20-23), 8 bits (pesos densos); formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), tamano del repo 18,8 GB; despliegue declarado 17 GB |
| Libreria | mlx |
| Modelo base | thinkingmachines/Inkling-2-Mini; derivados de Lucebox, nokeepai y thiagovelsa |
| Relacion con el base | quantized |
| Cuantizado por | fritskarl |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) de 26.388.646.400 parametros totales, segun los safetensors del repositorio. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, la composicion del dataset de entrenamiento ni el volumen de tokens utilizados. Tampoco hay datos publicados sobre si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion.

La innovacion de esta publicacion no esta en el entrenamiento, sino en el proceso de cuantizacion. Los expertos enrutados se mantienen bit-identicos a la release de Thinking Machines: NVFP4 para las capas 0-19 y MXFP8 para las capas 20-23. Los pesos densos se cuantizan a 8 bits directamente desde BF16, con una similitud coseno declarada de al menos 0,99997 respecto al original. El autor indica que la variante incorpora el merge Unbound v2.1, que elimina la mayor parte de los rechazos, y el ajuste Anti-Overthinking, orientado a reducir bucles de razonamiento en tareas de agente. El modelo base declarado es Inkling-2-Mini-Fast, y el repositorio incluye tags que apuntan a un modo de bucle (`inkling2_loop`) y a componentes auxiliares de decodificacion especulativa (`dspark`, `dflash2`) que se usan como drafter en el motor Splash.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con niveles de esfuerzo de razonamiento configurables (`off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`).
- Generacion de codigo: la evaluacion del autor incluye un subconjunto de 40 problemas de HumanEval con ejecucion real de las pruebas.
- Uso como agente de codificacion: probado con el agente pi, que corrige un proyecto Python con 3 errores y 4 pruebas fallidas.
- Soporte declarado de entrada multimodal de texto e imagen en la configuracion del agente (`input: ["text", "image"]`).
- Integracion con API compatible con OpenAI (`/v1/chat/completions`) a traves de oMLX.
- Modo de razonamiento con niveles de esfuerzo ajustables y mapeo de niveles en el cliente.
- Capacidades multilingues: no disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el uso como agente implica interaccion con herramientas.

## Casos de uso

- Agente de codificacion local en Apple Silicon: el modelo se integra en el agente pi mediante la API compatible con OpenAI de oMLX y resuelve tareas de correccion de errores en proyectos pequenos; el autor reporta 3 de 3 ejecuciones correctas sin bucles en la tarea de prueba.
- Asistente de programacion en el portatil: con 17 GB de pesos y 53,7 tok/s en un M3 Max, es viable mantenerlo cargado en un MacBook Pro de gama alta para autocompletado, explicacion de codigo y generacion de pruebas sin depender de la nube.
- Evaluacion de calidad de cuantizaciones: al ser una build bit-exacta en los expertos, sirve como referencia para comparar el impacto de otras cuantizaciones (IQ4_NL, IQ3_M, MLX 4-bit) sobre la misma tarea de codigo.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite analizar repositorios completos o expedientes extensos en una sola pasada, siempre que la memoria del equipo lo permita.
- Experimentacion con modelos sin censura: para investigadores que necesitan estudiar el comportamiento de un modelo con los rechazos mayoritariamente eliminados, con la advertencia de que requiere filtrado propio.
- Despliegue en estaciones de trabajo con GPU consumer: el autor valida el modelo base cuantizado en una RTX 5060 Ti de 16 GB con llama.cpp, lo que permite montar un servidor de inferencia local de bajo coste.
- Pruebas de agentes con razonamiento controlado: los niveles de esfuerzo permiten ajustar el coste computacional por consulta en pipelines de agentes con muchas llamadas.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron sobre el mismo finetune en distintas builds. La columna HumanEval corresponde a un subconjunto fijo de 40 problemas con ejecucion de pruebas, decodificacion greedy y esfuerzo de razonamiento `high`. La tarea pi consiste en corregir un proyecto Python con 3 errores y 4 pruebas fallidas en 3 ejecuciones.

| Build | Motor | Tamano | KL vs precision completa | HumanEval (40) | Agente pi | Generacion |
|---|---|---:|---:|---:|---|---:|
| Precision completa, NVFP4 + BF16 (referencia) | Splash, Mac | 21 GiB | — | 37 | 3/3, 0 bucles | 48,0 tok/s |
| thiagovelsa IQ4_NL | Splash, Mac | 16,4 GiB | 0,0082 | 38 | 3/3, 0 bucles | 50,7 tok/s |
| IQ4_NL-16GB GGUF | Splash, Mac | 14,0 GiB | 0,0145 | 38 | 3/3, 0 bucles | 50,9 tok/s |
| IQ3_M GGUF | Splash, Mac | 12,0 GiB | 0,0223 | 37 | 3/3, 0 bucles | 65,2 tok/s |
| MLX 4-bit | oMLX a Splash, Mac | 16 GB | n/a | 38 | 3/3, 0 bucles | 59,4 tok/s |
| MLX NVFP4 (esta build) | oMLX a Splash, Mac | 17 GB | n/a | 37 | 3/3, 0 bucles | 53,7 tok/s |
| oQ4e | oMLX a Splash, Mac | 16 GB | n/a | 36 / 37 / 37 | 3/3, 0 bucles | 62,5 tok/s |
| IQ3_M GGUF, contexto 64K | llama.cpp, RTX 5060 Ti | 12,0 GiB | 0,0223 | 38 | 3/3, 0 bucles | ~53-60 tok/s |
| IQ4_NL-16GB GGUF, contexto 24K | llama.cpp, RTX 5060 Ti | 14,0 GiB | 0,0145 | 35 | 3/3, 0 bucles | 57,9 tok/s |
| Lucebox Fast UD-Q8_K_XL (sin Unbound ni Anti-Overthinking) | Splash, Mac | 21 GiB | n/a | 37 | 3/3, 0 bucles | 55,3 tok/s |

Hardware de las mediciones: MacBook Pro M3 Max (GPU de 40 nucleos, 128 GB, 400 GB/s) con Splash 1.7.3 y oMLX 0.8.4, y RTX 5060 Ti de 16 GB en PCIe 3.0 x8 con llama.cpp b12776. La generacion es la media de 4 ejecuciones greedy con dos prompts de aproximadamente 400 y 700 tokens, una peticion a la vez. La divergencia KL se midio solo en archivos GGUF, ya que llama.cpp no puede medir archivos MLX.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 17 GB de pesos en esta build, mas el espacio de trabajo del contexto y la cache KV. El autor no publica una cifra cerrada de memoria total para 131K tokens.
- GPU recomendadas: Apple Silicon de gama alta (validado en M3 Max con 128 GB); en el lado NVIDIA, la build equivalente del mismo finetune se valida en RTX 5060 Ti de 16 GB con llama.cpp.
- Cabe en GPU consumer: si, en GPUs con al menos 16 GB de VRAM o memoria unificada, segun la validacion del autor en RTX 5060 Ti y en MacBook Pro M3 Max.
- Opciones de despliegue: oMLX con el motor externo Splash (recomendado por el autor), y llama.cpp para las builds GGUF equivalentes. No se mencionan vLLM, TGI ni Ollama para esta build MLX.
- Decodificacion especulativa: se recomienda colocar incoai/Inkling-2-Mini-DFlash2 en un directorio de modelos de oMLX para que Splash lo use como drafter.
- Rendimiento observado: 53,7 tok/s en M3 Max con Splash; aproximadamente 41 tok/s con el motor propio de oMLX y el drafter DSpark, y alrededor de 50 % mas rapido a traves de Splash.
- Macs de 16 GB: el autor indica que oMLX 0.8.4 puede mantener los expertos enrutados en SSD y que Splash transmite los expertos que no caben; ambas opciones deberian permitir la ejecucion con menos memoria a menor velocidad, pero no se han probado.

## Comparativa con modelos similares

La comparacion mas directa es contra las otras builds del mismo finetune, ya que no se dispone de datos de modelos alternativos de la misma categoria en la informacion proporcionada.

| Modelo | Parametros | Contexto | HumanEval (40) | Generacion | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| MLX NVFP4 (esta build) | 26,4 B | 131.072 | 37 | 53,7 tok/s | Apache 2.0 | Hugging Face, MLX |
| MLX 4-bit | no disponible | 131.072 | 38 | 59,4 tok/s | Apache 2.0 | Hugging Face, MLX |
| oQ4e | no disponible | 131.072 | 36-37 | 62,5 tok/s | Apache 2.0 | Hugging Face, MLX |
| IQ3_M GGUF | no disponible | 64K en la prueba | 37-38 | 65,2 tok/s (Mac) | Apache 2.0 | Hugging Face, GGUF |
| IQ4_NL-16GB GGUF | no disponible | 24K en la prueba | 35-38 | 50,9 tok/s (Mac) | Apache 2.0 | Hugging Face, GGUF |
| Lucebox Fast UD-Q8_K_XL | no disponible | no disponible | 37 | 55,3 tok/s | Apache 2.0 | Hugging Face, GGUF |

## Limitaciones y advertencias

- Modelo sin censura: el merge Unbound elimina la mayor parte de los rechazos. El autor declara explicitamente que la responsabilidad de uso y del filtrado recae en quien despliega el modelo.
- Pruebas limitadas: la validacion se hizo con un M3 Max, una RTX 5060 Ti, un subconjunto de 40 problemas de HumanEval y una unica tarea de agente. No hay evaluacion a gran escala.
- Datos no disponibles: no se publican parametros activos, idiomas soportados, composicion del dataset ni detalles de alineacion del modelo base.
- Riesgo de alucinacion: no se han publicado mediciones especificas de tasa de alucinacion para esta build.
- Comportamiento no determinista con decodificacion especulativa: la verificacion de Splash no es bit-determinista, y el autor reporta tres resultados distintos (36, 37 y 37) en ejecuciones separadas de oQ4e.
- Limitacion de plataforma: la build esta empaquetada para MLX y Apple Silicon; en NVIDIA hay que usar las builds GGUF equivalentes con llama.cpp.
- Contexto practico reducido: aunque la configuracion declara 131.072 tokens, las pruebas en RTX 5060 Ti se hicieron con 24K y 64K de contexto, no con la ventana completa.
- Ajuste de muestreo: el autor recomienda temperatura 0,6 y top_p 0,95, y advierte de evitar el muestreo DRY.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las obligaciones de filtrado y moderacion del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-NVFP4
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Derivado de thiagovelsa: https://huggingface.co/thiagovelsa/Inkling-2-Mini-Unbound-Fast-AntiOverthink-GGUF
- Derivado de Lucebox: https://huggingface.co/Lucebox/Inkling-2-Mini-Fast-GGUF
- Derivado de nokeepai: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Build MLX 4-bit del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-MLX-4bit
- Build oQ4e del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-oQ4e
- Build IQ4_NL-16GB GGUF del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-IQ4_NL-16GB-GGUF
- Build IQ3_M GGUF del mismo autor: https://huggingface.co/fritskarl/Inkling-2-Mini-Unbound-Fast-AntiOverthink-IQ3_M-GGUF
