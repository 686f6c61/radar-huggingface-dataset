# netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-8bit es una compilacion cuantizada a 8 bits del modelo Qwen3.8-27B de Alibaba Qwen, adaptado mediante LoRA por harness-hub para funcionar como el motor del agente de programacion pi. netprojects ha fusionado el adaptador en los pesos base, ha incluido el codificador de vision y la capa de prediccion multi-token (MTP) originales, y ha convertido el conjunto al formato MLX para su ejecucion nativa en Apple Silicon. El resultado es un modelo multimodal de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) empaquetado en 30,0 GB, con licencia Apache 2.0.

El interes de esta version concreta reside en dos frentes. Por un lado, el adaptador de harness-hub se entreno con aprendizaje por refuerzo (AsyncGRPO sobre TRL) especificamente para tareas de ingenieria de software y terminal, con mejoras publicadas de Terminal-Bench 2.1 del 39,5 % al 55,8 % y de SWE-bench Pro (hard 51) del 29,4 % al 62,7 % frente al modelo base, reduciendo ademas las llamadas a herramientas entre un 55 % y un 64 %. Por otro, la cuantizacion 8-bit de netprojects preserva el 99,1 % de los siguientes tokens del modelo bf16 con una divergencia KL de solo 0,0004, lo que la convierte en la opcion mas fiel de la familia MLX publicada.

La relevancia actual es doble: demuestra que un modelo de casi 28 mil millones de parametros puede ejecutarse en un Mac de gama alta con perdida de calidad practicamente nula, y valida la estrategia de especializar modelos abiertos mediante RL para agentes de codigo, un patron que esta ganando traccion frente al ajuste supervisado clasico. La integracion del cabezal MTP permite ademas acelerar la decodificacion aproximadamente 2,2 veces sin descargas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con capa MTP; cuantizacion affine MLX de 8 bits, grupo 64 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta build); la familia incluye 6, 4, 3, 2,5 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas `model-mtp.safetensors` para el cabezal MTP |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer multimodal con codificador de vision, del que esta build conserva tanto el encoder visual como la capa de prediccion multi-token (MTP) original de Qwen, cuantizada de forma coherente con el resto del modelo. Sobre esa base, harness-hub entreno un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingenieria de software y uso de terminal como las que ejecuta el agente pi. netprojects fusiono ese adaptador (revision `e786f84`) en los pesos base (revision `3756181`) y convirtio el conjunto con mlx-vlm. El tokenizador y la plantilla de chat son los de harness-hub sin modificar, de modo que el vocabulario y el formato de llamadas a herramientas coinciden con Qwen3.8-27B.

La innovacion tecnica mas destacable es la conservacion del cabezal MTP como modelo borrador integrado: al pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, mlx-vlm lo emplea para decodificacion especulativa, verificando cada token propuesto con el modelo completo. En esta build de 8 bits la decodificacion pasa de 18 a 41 tok/s (x2,24) en las mediciones del autor, y el drafter DSpine v0.2.1 alcanza 54 tok/s (x3,05). Los datos de entrenamiento concretos (numero de tokens, composicion del dataset) no se detallan en la informacion disponible; la model card remite a la del adaptador original para el metodo y los datos completos.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3.8-27B.
- Generacion y reparacion de codigo, con especial enfasis en tareas de ingenieria de software reales (resolucion de bugs, parches, pruebas).
- Operacion de terminal y ejecucion de comandos como agente, con reduccion de llamadas a herramientas frente al modelo base.
- Llamadas a herramientas en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Razonamiento multi-paso orientado a agentes, evaluado con el agente pi.
- Procesamiento de imagenes (pipeline image-text-to-text): capturas de terminal, diagramas y otro contenido visual, mediante mlx-vlm.
- Modo de pensamiento (thinking) disponible pero desaconsejado: el adaptador se entreno y evaluo con thinking desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a pi mediante la API OpenAI-compatible (`openai-completions`), de modo que el desarrollador resuelva tareas de reparacion de tests y bugs sin enviar codigo a la nube. Es adecuado porque el adaptador se entreno exactamente para ese bucle de agente.
- Automatizacion de terminal y diagnostico de errores: dado un volcado o una captura de pantalla de una terminal, el modelo identifica el fallo y propone el comando o parche correctivo, gracias al codificador de vision y a su entrenamiento en tareas de terminal.
- Integracion en pipelines de CI/CD: el modelo puede invocarse desde scripts para triage de fallos de build, generacion de parches candidatos o resumen de errores, con tool calling en formato OpenAI que encaja en orquestadores existentes.
- Asistente de refactorizacion en el IDE: con 27,8 mil millones de parametros y la fidelidad del 8-bit, puede sostener conversaciones multi-turno sobre un repositorio y proponer cambios coherentes con el contexto del proyecto.
- Prototipado de agentes de investigacion: la decodificacion especulativa con MTP (hasta 41 tok/s en esta build) permite iterar rapidamente sobre prompts y flujos de agente en local antes de desplegar en infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: al existir builds de 2,5 a 8 bits con metricas de fidelidad publicadas (99,1 % de coincidencia y KL 0,0004 en 8 bits frente a 85,5 % y KL 0,2363 en 2,5 bits), sirve para estudiar el compromiso tamano-calidad en despliegues de Apple Silicon.
- Analisis de capturas y documentacion tecnica: la entrada image-text-to-text permite extraer informacion de diagramas de arquitectura o pantallas de error y convertirla en texto accionable.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, evaluados bajo el agente pi con thinking desactivado:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Fidelidad de la cuantizacion frente a bf16 (datos del autor):

| Build | Tamano | Coincidencia de siguiente token | KL vs bf16 |
|---|---|---|---|
| 8-bit | 30,0 GB | 99,1 % | 0,0004 |
| 6-bit | 23,1 GB | 99,0 % | 0,0015 |
| 4-bit | 16,3 GB | 95,6 % | 0,0201 |
| 3-bit | 13,8 GB | 91,4 % | 0,0884 |
| 2,5-bit | 11,8 GB | 85,5 % | 0,2363 |

Rendimiento de decodificacion (greedy, thinking off, 5 prompts x 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; mediciones indicativas con otros servicios en ejecucion):

| Build | Sin aceleracion | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4-bit, bloque 5) |
|---|---|---|---|
| 4-bit | 33 tok/s | 61 tok/s (x1,84) | 70 tok/s (x2,25) |
| 6-bit | 23 tok/s | 22 tok/s (x0,96) | 52 tok/s (x2,32) |
| 8-bit | 18 tok/s | 41 tok/s (x2,24) | 54 tok/s (x3,05) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 30,0 GB de pesos en 8 bits, mas overhead de contexto y del codificador de vision; en la practica requiere un Mac con 36 GB o mas de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta (familias M3/M4 Max y Ultra). No es compatible con CUDA ni con GPU discretas convencionales por el formato MLX.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; las builds de 3 y 2,5 bits estan pensadas para Macs de 24 GB.
- Opciones de despliegue: `mlx_lm.server` (API OpenAI-compatible, version >= 0.32.2), `mlx-vlm` (>= 0.7.11) para entrada de imagen, y el agente pi apuntando a `http://localhost:8000/v1`.
- Latencia y throughput: 18 tok/s en decodificacion simple para 8 bits, 41 tok/s con MTP y 54 tok/s con DSpine; la build de 6 bits es la recomendada por equilibrio tamano-fidelidad y la de 4 bits alcanza 33 tok/s en simple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,8 mil millones | no disponible | Apache 2.0 | Hugging Face, MLX | 99,1 % de fidelidad vs bf16; 41 tok/s con MTP |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,8 mil millones | no disponible | Apache 2.0 | Hugging Face, MLX | 23,1 GB, recomendada por el autor; 99,0 % de fidelidad |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,8 mil millones | no disponible | Apache 2.0 | Hugging Face, MLX | 16,3 GB, 95,6 % de fidelidad; 33 tok/s en simple |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 mil millones | no disponible | Apache 2.0 | Hugging Face | Adaptador original sin cuantizar, referencia de calidad |

No se dispone de datos de benchmarks de modelos de terceros en la informacion proporcionada para una comparacion cruzada.

## Limitaciones y advertencias

- El adaptador se entreno y evaluo con thinking desactivado; activar el modo de pensamiento puede degradar el comportamiento esperado.
- La API de referencia es Chat Completions (`openai-completions`), no la API Responses; usar esta ultima puede romper el formato de llamadas a herramientas.
- La decodificacion especulativa con MTP puede divergir del texto de la decodificacion simple en empates cercanos, ya que la verificacion por lotes puede redondear en sentido contrario.
- Las mediciones de throughput son indicativas: se tomaron con otros servicios en ejecucion en el mismo Mac.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de agente donde una accion erronea puede modificar archivos o ejecutar comandos no deseados; se recomienda supervision y entornos aislados.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- Dependencia exclusiva de Apple Silicon y de la libreria MLX; no hay soporte para CUDA, vLLM ni llama.cpp en este repositorio.
- La build de 8 bits ocupa 30,0 GB, lo que excluye Macs con menos de 36 GB de memoria unificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- Agente pi: https://github.com/earendil-works/pi
