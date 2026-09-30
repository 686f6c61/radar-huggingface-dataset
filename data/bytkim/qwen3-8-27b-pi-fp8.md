# bytkim/Qwen3.8-27B-pi-FP8

## Resumen

bytkim/Qwen3.8-27B-pi-FP8 es una version cuantizada a FP8 del ajuste fino Qwen3.8-27B-pi, publicado por el usuario bytkim sobre el modelo base Qwen/Qwen3.8-27B del equipo Qwen (Alibaba). El modelo conserva la arquitectura del base: un transformer denso de 27.781.427.952 parametros con atencion hibrida (atencion lineal en 48 de sus 64 capas), torre de vision y una cabeza de prediccion multi-token (MTP) integrada que actua como modelo borrador para decodificacion especulativa.

El ajuste esta especializado en el bucle de trabajo del harness de agentes Pi: leer un repositorio, editar ficheros, ejecutar herramientas y reaccionar a la salida de esas herramientas. El entrenamiento combina SFT sobre sesiones de Pi filtradas y exitosas con una segunda etapa de reinforcement learning mediante GRPO que incorpora una recompensa de eficiencia de razonamiento, con el objetivo de reducir los tokens generados sin perder tareas completadas.

Es relevante porque ofrece el modelo en un formato desplegable directamente con vLLM (FP8 + MTP especulativo), con licencia Apache 2.0 y una ventana nativa de 262.144 tokens extensible a 1M, lo que permite trabajar sobre repositorios completos en local. La model card indica que el informe tecnico se publicara proximamente, por lo que los resultados disponibles son afirmaciones relativas del autor, sin cifras absolutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (atencion lineal en 48 de 64 capas), torre de vision y cabeza MTP integrada |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (este repositorio), BF16 (bytkim/Qwen3.8-27B-pi), GGUF (bytkim/Qwen3.8-27B-pi-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen3.8-27B |
| Relacion con el base | cuantizado (FP8) y ajustado (SFT + GRPO) |
| Tamano del repositorio | 34,7 GB |
| Libreria | transformers |
| Pipeline declarado | text-generation (etiquetas adicionales: image-text-to-text, multimodal) |
| Fecha de publicacion | 2026-09-29 (actualizado 2026-09-30) |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.8-27B original: un modelo denso de 27,8 B de parametros que combina atencion lineal en 48 de las 64 capas con atencion completa en el resto, lo que reduce el coste del contexto largo frente a un transformer de atencion completa pura. Incluye una torre de vision (etiquetas `vision`, `image`, `multimodal`, `image-text-to-text`) y una cabeza de prediccion multi-token (MTP) integrada, que se usa como modelo borrador en decodificacion especulativa. La ventana nativa es de 262.144 tokens y el modelo se declara extensible a 1M.

El ajuste de bytkim se desarrollo en dos etapas. La primera es un SFT sobre sesiones de Pi filtradas y consideradas exitosas, con el objetivo de que el modelo aprenda flujos de trabajo completos (inspeccionar, editar, ejecutar, verificar) en lugar de respuestas aisladas. La segunda etapa aplica GRPO con una recompensa que combina el resultado verificado de la tarea con la eficiencia del razonamiento, de modo que las soluciones correctas con esfuerzo bajo y medio razonen de forma mas economica, mientras que el nivel xhigh se deja orientado a correccion. El autor indica que la seleccion de checkpoints se hizo con resultados reales de agente (tokens generados, llamadas a herramientas y tiempo de finalizacion), no con la perdida de entrenamiento. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto y razonamiento conversacional con niveles de esfuerzo de razonamiento ajustables (bajo, medio, xhigh), gestionados mediante `--reasoning-parser qwen3` en vLLM.
- Generacion de codigo y trabajo agentico sobre repositorios: lectura de codigo existente, edicion de ficheros y adaptacion a entornos ya establecidos.
- Tool calling y function calling: soporte declarado de `--enable-auto-tool-choice` con `--tool-call-parser qwen3_xml`, orientado a bucles iterativos con retroalimentacion de herramientas.
- Ejecucion de tareas de multiples pasos en un harness de agente (Pi), incluyendo ejecucion de comandos en terminal y comprobacion de resultados.
- Capacidades multimodales de entrada: etiquetas `vision`, `image` e `image-text-to-text`, es decir, entrada de imagenes junto con texto.
- Decodificacion especulativa nativa mediante la cabeza MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`).
- Razonamiento cientifico y de dominio tecnico (el autor reporta resultados en SciCode y GPQA Diamond).
- Configuracion de muestreo por defecto en modo thinking: `temperature=1.0`, `top_p=0.95`, `top_k=20`, cargada desde el `generation_config.json` del repositorio.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de codigo en local sobre repositorios completos: con 262.144 tokens de contexto nativo y atencion lineal en 48 de 64 capas, el modelo puede cargar arboles de ficheros extensos y mantener el estado de una tarea de refactorizacion larga sin truncar el contexto.
- Integracion en pipelines de CI/CD como revisor automatico: mediante tool calling puede leer el diff, ejecutar la suite de tests y proponer o aplicar correcciones sobre los fallos detectados, devolviendo un resultado verificado en lugar de una sugerencia sin comprobar.
- Migracion y actualizacion de dependencias: el ajuste sobre sesiones de Pi que editan ficheros y comprueban resultados encaja en tareas repetitivas de cambio de API, donde el modelo debe adaptarse a un entorno ya existente en vez de generar codigo nuevo desde cero.
- Automatizacion de tareas de oficina con entrada multimodal: las etiquetas de vision permiten pasar capturas de pantalla o imagenes de documentos como entrada y generar acciones o codigo a partir de ellas.
- Razonamiento cientifico y calculo tecnico: el autor evalua el modelo en SciCode (subproblemas resueltos) y GPQA Diamond, lo que lo situa como candidato para asistentes de investigacion con verificacion paso a paso en nivel xhigh.
- Depuracion iterativa asistida: el modelo esta entrenado para el ciclo de inspeccionar, cambiar, ejecutar y leer la salida de la herramienta; en nivel xhigh prioriza la correccion, lo que resulta adecuado para bugs de causa no evidente.
- Despliegue en una unica GPU de consumo mediante GGUF: la cuantizacion GGUF del mismo ajuste (bytkim/Qwen3.8-27B-pi-GGUF) permite ejecutar el modelo con llama.cpp u Ollama en equipos sin aceleradores de centro de datos.
- Servicio de asistencia tecnica sobre base de codigo propietaria: con vLLM y `--max-num-seqs 1` el autor documenta un modo de despliegue de baja concurrencia y latencia predecible, valido para un asistente interno de consultas sobre el codigo de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia graficas (Terminal-Bench 2.1, GPQA Diamond, SciCode) e indica que el informe tecnico se publicara proximamente, pero no incluye cifras absolutas en el texto. Las unicas afirmaciones cuantitativas son comparaciones relativas entre Qwen3.8-27B-pi FP8 y el modelo base:

| Evaluacion | Afirmacion de la model card (comparacion relativa, sin cifras absolutas) |
|---|---|
| Terminal-Bench 2.1 | Pi alcanza con esfuerzo medio la tasa de finalizacion que el base obtiene en xhigh, con aproximadamente un 41 % menos de tokens de salida |
| Terminal-Bench 2.1 | Pi muestra un aumento mas estable de la finalizacion de low a xhigh que el base, con menos tokens de salida en cada nivel de esfuerzo equivalente |
| GPQA Diamond | Pi obtiene la puntuacion mas alta en xhigh; el base conserva la ventaja en esfuerzo medio |
| SciCode | Pi resuelve mas subproblemas en todos los niveles; en xhigh puntua mas alto con aproximadamente un 23 % menos de tokens de salida; en medium su puntuacion superior requiere mas tokens |

## Requisitos de hardware

- VRAM para FP8 (este repositorio): los pesos ocupan aproximadamente 27,8 GB, por lo que se necesita alrededor de 32-40 GB de VRAM sumando cache KV segun la longitud de contexto y el numero de secuencias. Estimacion propia a partir del numero de parametros; no confirmada por el autor.
- GPU recomendadas para FP8: H100 80 GB, A100 80 GB, L40S 48 GB o RTX 5090 32 GB. En GPUs de 24 GB el FP8 no cabe completo sin offloading.
- VRAM para BF16 (bytkim/Qwen3.8-27B-pi): aproximadamente 55,6 GB de pesos; requiere dos A100 40 GB, dos L40S o una H100 80 GB.
- VRAM para GGUF: una cuantizacion de 4 bits se situa en torno a 17 GB y una de 8 bits en torno a 29 GB (estimaciones estandar, no confirmadas por el autor). Existe una referencia externa que prueba Qwen3.8-27B con Ollama, llama.cpp y vLLM en una RTX 4090 de 24 GB con contexto completo de 262K, para el modelo base.
- Cabe en GPU de consumo: si, en el caso de las cuantizaciones GGUF de 4-5 bits sobre RTX 4090 / RTX 3090 de 24 GB; la version FP8 requiere GPUs de 32 GB o mas.
- Opciones de despliegue: vLLM (comando documentado por el autor), text-generation-inference (etiqueta `text-generation-inference`, `endpoints_compatible`), llama.cpp y Ollama mediante el repositorio GGUF, y transformers de forma nativa.
- Parametros de despliegue documentados: `--max-model-len 262144`, `--max-num-seqs 1`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y decodificacion especulativa MTP con 3 tokens.
- Latencia y throughput: no disponible. El uso de MTP con 3 tokens especulativos esta pensado para aumentar el throughput, pero no se publican tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Ajuste | Licencia |
|---|---|---|---|---|---|
| bytkim/Qwen3.8-27B-pi-FP8 | 27,8 B (denso) | 262K, extensible a 1M | safetensors FP8 | SFT + GRPO orientado al harness Pi | Apache 2.0 |
| bytkim/Qwen3.8-27B-pi | 27,8 B (denso) | 262K, extensible a 1M | safetensors BF16 | SFT + GRPO orientado al harness Pi | Apache 2.0 |
| bytkim/Qwen3.8-27B-pi-GGUF | 27,8 B (denso) | 262K, extensible a 1M | GGUF (calibrado con sesiones completas de Pi) | SFT + GRPO orientado al harness Pi | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 | 27,8 B (denso) | 262K, extensible a 1M | safetensors FP8 | post-entrenamiento original del equipo Qwen | Apache 2.0 |

No se dispone de otros modelos comparables en la informacion proporcionada (ni de cifras de rendimiento del base frente al ajuste mas alla de las comparaciones relativas ya indicadas).

## Limitaciones y advertencias

- No hay resultados absolutos de benchmarks publicos: la model card solo ofrece comparaciones relativas frente al modelo base y remite a un informe tecnico aun no publicado. No es posible verificar las afirmaciones de forma independiente.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 1 like), por lo que no existe retroalimentacion de terceros sobre el comportamiento real en produccion.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgos, composicion del dataset de SFT ni filtros aplicados a las sesiones de Pi.
- Riesgo de alucinacion: no se documenta. Al estar ajustado sobre trayectorias de agente que editan ficheros y ejecutan herramientas, el modelo puede generar cambios plausibles que no se hayan verificado; conviene mantener la ejecucion de tests como validacion obligatoria.
- Idiomas soportados: no disponible. No se puede confirmar el rendimiento fuera del ingles sin evaluacion propia.
- Limitaciones de contexto: aunque la ventana nativa es de 262.144 tokens y se declara extensible a 1M, la VRAM necesaria para la cache KV crece con la longitud; el despliegue documentado usa `--max-num-seqs 1`, lo que limita la concurrencia.
- Especializacion: el ajuste esta orientado al harness Pi y a tareas de codigo y agentes. Fuera de ese tipo de tareas el rendimiento puede no superar al del modelo base, y en GPQA Diamond el base conserva la ventaja en esfuerzo medio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el reconocimiento correspondiente; conviene revisar tambien las condiciones del modelo base Qwen/Qwen3.8-27B.
- Caveats de produccion: el repo FP8 pesa 34,7 GB y requiere hardware de 32 GB de VRAM o superior; las cifras de VRAM para GGUF incluidas aqui son estimaciones no confirmadas por el autor.
- Fechas de publicacion (2026-09-29) y denominacion "Qwen3.8": conviene verificar la procedencia y vigencia del modelo base antes de integrarlo en un sistema en produccion.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Version BF16 del ajuste: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Version GGUF del ajuste: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version FP8 oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8/blob/main/README.md
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia de ejecucion local (VRAM y velocidad): https://computingforgeeks.com/run-qwen3-8-27b-locally/
- Informe tecnico: anunciado en la model card como pendiente de publicacion, sin enlace disponible.
