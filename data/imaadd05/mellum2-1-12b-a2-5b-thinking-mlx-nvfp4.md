# imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4

# Mellum2.1-12B-A2.5B-Thinking mlx nvfp4

## Resumen
Mellum2.1-12B-A2.5B-Thinking en MLX NVFP4 es una cuantizacion de 4 bits del modelo de codigo de JetBrains, publicada por el usuario imaadd05. No es un modelo entrenado desde cero: parte de `JetBrains/Mellum2.1-12B-A2.5B-Thinking` (arquitectura de mezcla de expertos, 12 000 millones de parametros totales y unos 2500 millones activos por token) y lo reempaqueta en el formato NVFP4 de MLX para que quepa y funcione en Macs con 16 GB de memoria unificada.

El problema que resuelve es concreto: el original en BF16 ocupa 24,3 GB, demasiado para un portatil Apple Silicon de gama media. Esta build pesa 6,84 GB (6 836 663 555 bytes de pesos) y, segun los datos del autor, queda un 29-34% mas cerca del BF16 original que la alternativa MXFP4 en divergencia KL, sacrificando solo un 5% de velocidad de decodificacion en un M4.

Es relevante para quien quiera ejecutar localmente un modelo de codigo con modo thinking y soporte de tool calling sin depender de la nube ni de GPUs dedicadas. La licencia Apache-2.0 del modelo base se mantiene, y el autor publica el plan de cuantizacion, los fallos intermedios y un recibo de validacion con los hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), base `JetBrains/Mellum2.1-12B-A2.5B-Thinking` |
| Parametros totales | 12 149 923 072 (12,15 B, segun safetensors) |
| Parametros activos | 2,5 B (segun nombre y model card) |
| Longitud de contexto | no disponible en la informacion proporcionada; se han medido pruebas a 1K, 4K y 16K tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, grupo de 16, escalas FP8), routers MoE en 8 bits affine group-64, resto en BF16; sin fine-tuning ni calibracion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria MLX |
| Tamano del repo | 6,8 GB |
| Tamano de pesos | 6 836 663 555 bytes |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos desarrollado y entrenado por JetBrains, con 12,15 B de parametros totales y aproximadamente 2,5 B activos por token, orientado a codigo, agentes y razonamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos no aparecen en la model card proporcionada.

Esta publicacion no entrena nada: aplica cuantizacion NVFP4 estandar de MLX a todas las capas elegibles (4 bits, tamano de grupo 16, escalas FP8), mantiene los routers MoE en 8 bits affine con grupo 64 y deja el resto de capas en BF16. Segun el autor, los routers se conservan en mayor precision porque enrutar mal un token degrada mas que cuantizar los pesos de los expertos. El material fuente es el commit `92ddae9fc7665e9f801d141d2e5a6b2caf2460c4` del repo de JetBrains. La validacion se hizo con MLX 0.32.3, MLX-LM 0.32.0 y Python 3.12.

## Capacidades
- Generacion de codigo en Python y otros lenguajes, con foco declarado en tareas de programacion.
- Modo thinking: el modelo produce una traza de razonamiento antes de la respuesta final; razonamiento y respuesta comparten el presupuesto de tokens.
- Tool calling / function calling, con servidor compatible con la API de OpenAI.
- Orientado a agentes de codigo y flujos multi-paso.
- Deteccion de bugs y revision de fragmentos de codigo (el ejemplo de la model card pide localizar un bug en una funcion `mean`).
- Capacidades conversacionales (`conversational` entre los tags del repo).
- Multilingue: solo ingles declarado.

## Casos de uso
- Asistente de codigo local en Mac de 16 GB: con 6,84 GB de pesos y 7,57 GB de pico de memoria a 16K tokens, cabe en un MacBook de 16 GB y permite autocompletado y consultas sin conexion.
- Agentes de codigo con herramientas: se levanta con `python -m mlx_lm server` y expone una API compatible con OpenAI, de modo que herramientas tipo agente que esperan ese contrato pueden conectarse directamente.
- Depuracion y localizacion de errores: el modo thinking permite que el modelo razone paso a paso antes de senalar el fallo, util para bugs no triviales en funciones pequenas o medianas.
- Revision de codigo en pre-commit: al ser local y ligero, puede integrarse como paso previo al commit para detectar patrones erroneos sin enviar el codigo a servicios externos.
- Generacion de tests unitarios: tareas de sintesis de casos de prueba a partir de firmas de funciones, apoyadas en el modo thinking para cubrir bordes.
- Explicacion de codigo para formacion: traduccion de fragmentos a lenguaje natural con razonamiento visible, aprovechable en entornos educativos o de onboarding.
- Refactorizacion acotada: reescritura de funciones con contexto de hasta 16K tokens, manteniendo varias dependencias del mismo modulo en la ventana.
- Automatizacion en CI/CD: al no depender de GPU NVIDIA ni de red, puede correr en runners Apple Silicon como verificador local de parches.

## Benchmarks y rendimiento

| Build | Pesos | KL a BF16 (razon. / resp. / tool call) | HumanEval+ | Tokens medianos | Decodificacion M4 (1K / 4K / 16K) |
|---|---:|---:|---:|---:|---:|
| BF16 original | 24,3 GB | 0 | 153 (93,3%) | 1 571 | n/a |
| Este NVFP4 | 6,84 GB | 0,105 / 0,043 / 0,042 | 145 (88,4%) | 1 674 | 63,9 / 61,4 / 55,8 tok/s |
| MXFP4 (randmaru) | 6,46 GB | 0,147 / 0,066 / 0,059 | 144 (87,8%) | 1 544 | 67,2 / 64,3 / 58,3 tok/s |
| 6-bit (imaadd05) | 9,87 GB | no disponible | 146 (88,4% no aplica; 146/164) | no disponible | no disponible |

Notas metodologicas de la model card: la KL es divergencia teacher-forced respecto a BF16 sobre trazas de razonamiento, respuesta y tool call en Python, cinco repeticiones por region. HumanEval+ se evaluo con las 164 tareas, una GPU CUDA, decodificacion greedy y presupuesto de 8192 tokens incluyendo razonamiento; NVFP4 y MXFP4 empatan (7 frente a 6 tareas discordantes, p = 1,0). Las mediciones de velocidad son en un MacBook Pro de 14 pulgadas con M4 y 16 GB, con cargador de 68 W, alternando NVFP4 y MXFP4 en orden A-B-B-A, tres ensayos. El tiempo hasta el primer token es identico en ambas builds: 1,6 s a 1K y 31,8 s a 16K. El pico de memoria MLX a 16K es de 7,57 GB.

## Requisitos de hardware
- VRAM / memoria unificada: pensado para Macs con 16 GB; pico medido de 7,57 GB a 16K tokens. El autor recomienda cerrar aplicaciones que consuman mucha memoria antes de trabajar con contexto largo.
- GPU: exclusivamente Apple Silicon via MLX. No es desplegable en CUDA; el NVFP4 aqui es el formato de MLX, no el de NVIDIA.
- Consumer GPU: si, en el sentido de que cabe en un Mac de 16 GB (por ejemplo M4). En GPUs de consumo NVIDIA no aplica este formato.
- Opciones de despliegue: MLX-LM 0.32.0 con MLX 0.32.3 (`mlx_lm generate` y `mlx_lm server`). Ollama, vLLM o TGI no estan mencionados en la informacion disponible.
- Latencia y throughput: 63,9 tok/s a 1K, 61,4 tok/s a 4K y 55,8 tok/s a 16K en M4. Primer token en 1,6 s a 1K y 31,8 s a 16K.
- Ajuste obligatorio: fijar siempre `--max-tokens` (el autor usa 16384), porque el razonamiento y la respuesta comparten presupuesto y el servidor usa 512 por defecto, lo que trunca la respuesta antes de que el modelo termine de pensar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | Peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este NVFP4 | 12,15 B totales / 2,5 B activos | no disponible (probado a 16K) | 145 (88,4%) | 6,84 GB | apache-2.0 | HuggingFace, MLX |
| MXFP4 (randmaru) | 12,15 B / 2,5 B | no disponible | 144 (87,8%) | 6,46 GB | apache-2.0 | HuggingFace, MLX |
| 6-bit (imaadd05) | 12,15 B / 2,5 B | no disponible | 146 (164 tareas) | 9,87 GB | apache-2.0 | HuggingFace, MLX |
| BF16 original (JetBrains) | 12,15 B / 2,5 B | no disponible | 153 (93,3%) | 24,3 GB | apache-2.0 | HuggingFace |

Comparativa con modelos de otros fabricantes: no disponible en la informacion proporcionada (la busqueda web no devolvio resultados relevantes; solo enlaces a Apple TV, sin relacion con el modelo).

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo base orientado a codigo y solo en ingles, es previsible un sesgo hacia Python y hacia convenciones anglosajonas, pero no hay mediciones.
- Riesgo de alucinacion: no evaluado en la informacion disponible. HumanEval+ es una tarea de generacion de codigo, no mide fiabilidad de agente ni veracidad.
- Contexto e idioma: solo ingles declarado; no hay longitud maxima de contexto documentada, y el comportamiento mas alla de 16K no esta validado.
- Problemas conocidos de servido en MLX-LM 0.32.0: las llamadas a herramientas que no se pueden parsear se descartan en silencio, con `finish_reason: "tool_calls"` pero lista `tool_calls` vacia. Existe un parche en el repositorio del autor y un arreglo upstream en `mlx-lm#1957`.
- En bucles de herramientas se pierde el razonamiento previo: la plantilla solo lo reproduce desde `reasoning_content`, pero el servidor lo devuelve como `reasoning`.
- Validacion limitada: se hizo una unica ejecucion greedy de HumanEval+, el benchmark podria solaparse con los datos de entrenamiento, y la KL se midio sobre un corpus piloto de 32 trayectorias en Python. Ninguna de estas pruebas mide fiabilidad de agente.
- Licencia: Apache-2.0, permite uso comercial. El autor del cuantizado no es JetBrains; el modelo original fue creado y entrenado por JetBrains.
- Contexto largo en maquinas de 16 GB: el pico de 7,57 GB deja poco margen con el sistema operativo y otras aplicaciones en ejecucion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Repositorio con codigo, resultados y write-up: https://github.com/imaddde867/mellum-mlx
- Plan de cuantizacion y alternativas fallidas: https://github.com/imaddde867/mellum-mlx/blob/main/docs/RESULTS.md
- Recibo de validacion con hashes SHA-256: https://github.com/imaddde867/mellum-mlx/blob/main/results/release-v1/nvfp4-validation.json
- Build MXFP4 alternativa: https://huggingface.co/randmaru/Mellum2.1-12B-A2.5B-Thinking-mlx-mxfp4
- Build de 6 bits: https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64
- Pull request de arreglo en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/1957
