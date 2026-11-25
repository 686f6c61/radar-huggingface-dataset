# netprojects/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una distribucion en formato GGUF del modelo Qwen3.8-27B de Alibaba, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo por harness-hub para funcionar como el motor del agente de codigo pi. El modelo resultante esta pensado para tareas de ingenieria de software y uso de terminal, y esta empaquetado por netprojects en cuantizaciones listas para ejecutar con llama.cpp sin necesidad de cargar el adaptador por separado.

La relevancia de esta publicacion es doble. Por un lado, incorpora la capa de prediccion multi-token (MTP) de Qwen en todas las cuantizaciones, lo que permite decodificacion especulativa nativa en llama-server con aceleraciones medidas de hasta x2,41. Por otro, incluye un proyector multimodal (`mmproj`) que anade entrada de imagen, por lo que el modelo pasa de ser puramente de texto a soportar el pipeline image-text-to-text.

El paquete cubre un rango amplio de cuantizaciones, desde Q8_0 (29,0 GB) hasta IQ2_M (10,2 GB), con metricas de fidelidad publicadas frente a los pesos BF16 (porcentaje de mismo siguiente token y divergencia KL media). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capa de prediccion multi-token (MTP); modelo base Qwen3.8-27B con LoRA fusionado |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue de llama-server (no se confirma el maximo del modelo base) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M; proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tambien existen builds MLX de 6 bits |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revision `3756181`) y le fusiona el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted` (revision `e786f84`). El adaptador se entreno con aprendizaje por refuerzo mediante AsyncGRPO en la libreria TRL, con el objetivo de convertir el modelo en el motor del agente de codigo pi en tareas de ingenieria de software y terminal. Al estar fusionado, no hace falta pasar `--lora` al servidor: los pesos GGUF ya incorporan la adaptacion.

Una innovacion tecnica destacable es la conservacion de la capa MTP de Qwen en todas las cuantizaciones, lo que habilita decodificacion especulativa integrada con `--spec-type draft-mtp` en llama-server. Las cuantizaciones pequenas (Q3_K_M, IQ3_XXS, IQ2_M) se generaron a partir del fichero Q8_0 usando una matriz de importancia (llama-imatrix sobre texto de noticias en ingles y codigo Python con licencia MIT, en fragmentos de 512 tokens); la capa MTP se mantiene en Q4_K en los ficheros IQ porque la matriz de importancia no la cubre. El proyector multimodal `mmproj-Qwen3.8-27B-pi-F16.gguf` (0,9 GB) anade la entrada de imagen.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Codigo y tareas de ingenieria de software: el adaptador se entreno especificamente para resolver bugs, interpretar fallos de tests y aplicar parches.
- Uso de terminal y agentes: ejecucion de comandos, lectura de salida y razonamiento multi-paso orientado a tareas de sistema.
- Tool calling / function calling: el adaptador se entreno y evaluo con la API Chat Completions de OpenAI, y la model card insiste en usar `"api": "openai-completions"`.
- Entrada de imagen: soportada mediante el proyector `mmproj` (pipeline image-text-to-text).
- Decodificacion especulativa via capa MTP integrada.
- Modo thinking: existe, pero el adaptador se entreno y evaluo con thinking desactivado; la recomendacion es mantenerlo apagado.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Reparacion automatica de tests fallidos: el modelo puede recibir el fallo de `pytest`, inspeccionar el codigo relevante, localizar la causa y aplicar un parche, que es exactamente el escenario con el que se entreno y evaluo (SWE-bench Pro).
- Agente de terminal en local: con llama-server expuesto como endpoint compatible con OpenAI, se puede conectar a pi o a cualquier cliente de agentes para ejecutar tareas de shell, leer ficheros y encadenar comandos.
- Asistente de codigo en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_M (16,8 GB) e IQ4_XS (15,3 GB) permiten ejecutar el modelo en equipos con 24 GB de VRAM o en Apple Silicon con memoria unificada.
- Automatizacion de CI/CD con revision de parches: el modelo puede integrarse en un paso de pipeline que analice un diff, ejecute los tests y proponga correcciones antes de fusionar.
- Analisis de capturas y diagramas: gracias al proyector de vision, se puede enviar una imagen de un error de consola o un diagrama de arquitectura y pedir explicacion o codigo asociado.
- Despliegue de bajo consumo en hardware limitado: IQ2_M (10,2 GB) e IQ3_XXS (11,4 GB) permiten servir el modelo en GPUs de 12 GB, aceptando la perdida de fidelidad documentada.
- Prototipado rapido de agentes con decodificacion acelerada: activando `--spec-type draft-mtp` se obtienen velocidades de hasta 52 tok/s en Q4_K_M en un MacBook Pro M5 Max, utiles para iterar sobre prompts y flujos de agente.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, bajo pi y con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Base | Adaptado |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

El adaptador reduce ademas entre un 55% y un 64% las llamadas a herramientas por tarea.

Fidelidad de las cuantizaciones frente a BF16 (mismo siguiente token y divergencia KL media):

| Fichero | Tamano | Mismo siguiente token | KL media |
|---|---|---|---|
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q6_K | 22,4 GB | 98,4% | 0,0038 |
| Q5_K_M | 19,5 GB | 97,1% (vs Q8_0) | 0,0052 (vs Q8_0) |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |
| IQ4_XS | 15,3 GB | 94,1% (vs Q8_0) | 0,0197 (vs Q8_0) |
| Q3_K_M | 13,5 GB | 93,1% (vs Q8_0) | 0,0804 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,5% (vs Q8_0) | 0,1244 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6% (vs Q8_0) | 0,1715 (vs Q8_0) |

Rendimiento de decodificacion en llama-server (MacBook Pro M5 Max, greedy, thinking off, 5 prompts x 256 tokens):

| Fichero | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (x1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (x2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (x2,41) | 75% |

Rendimiento con Splash 1.7.0 (DFlash2 como modelo borrador):

| Fichero | Decodificacion | Extremo a extremo | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 165 tok/s | 128 tok/s | 6,7 |
| Q6_K | 132 tok/s | 100 tok/s | 6,9 |
| Q8_0 | 109 tok/s | 84 tok/s | 6,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto. Q8_0 ~30 GB, Q6_K ~23 GB, Q5_K_M ~20 GB, Q4_K_M ~17-18 GB, IQ4_XS ~16 GB, Q3_K_M ~14 GB, IQ3_XXS ~12 GB, IQ2_M ~11 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q6_K, Q5_K_M o Q4_K_M; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q3_K_M; GPUs de 12 GB para IQ3_XXS o IQ2_M.
- Cabe en GPU de consumo: si, en RTX 4090, 4080 y modelos de 16-24 GB con las cuantizaciones adecuadas. En Apple Silicon funciona con memoria unificada, y existen builds MLX de 6 bits.
- Opciones de despliegue: llama.cpp / llama-server (soporte oficial con MTP y mmproj), Splash 1.7.0 (decodificacion especulativa con DFlash2), y builds MLX para Apple Silicon. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: en MacBook Pro M5 Max, 28-52 tok/s segun cuantizacion y MTP en llama-server, y 109-165 tok/s en Splash. No hay datos de throughput en GPU de datacenter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | 27,3 B | 65.536 en config de ejemplo | Agente de codigo y terminal, multimodal | Apache 2.0 | GGUF, MLX |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Modelo generalista | Apache 2.0 (segun modelo base) | safetensors |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3 B | no disponible | Adaptador LoRA para pi | Apache 2.0 | safetensors (adaptador) |

No se dispone de datos de benchmarks de terceros ni de modelos de otros fabricantes en la informacion proporcionada para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- El adaptador se entreno y evaluo con thinking desactivado; activar el modo thinking puede degradar el rendimiento respecto a los resultados publicados.
- El adaptador se entreno y evaluo con la API Chat Completions de OpenAI; usar otro formato de API puede alterar el comportamiento.
- Las cuantizaciones bajas pierden fidelidad de forma notable: IQ2_M conserva el 89,6% del mismo siguiente token y una KL de 0,1715 frente a Q8_0, lo que puede afectar a tareas de agente que requieren precision.
- La capa MTP se mantiene en Q4_K en los ficheros IQ, ya que la matriz de importancia no la cubre; esto puede introducir diferencias frente a las cuantizaciones principales.
- Los datos de velocidad se midieron en un MacBook Pro M5 Max con otros servicios en ejecucion y se describen como indicativos, no como cifras de referencia estables.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos del modelo adaptado.
- El modelo esta especializado en tareas de ingenieria de software y terminal; su rendimiento en dominios ajenos puede ser inferior al del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B y del dataset de entrenamiento del adaptador antes de un uso comercial a gran escala.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Agente pi: https://github.com/earendil-works/pi
