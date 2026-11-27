# netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit

## Resumen

Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-pi-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada al agente de programacion "pi". La publica netprojects (Paris Michalas) para su ejecucion en Apple Silicon, empleando una tecnica propia denominada LayerFit que asigna presupuestos de bits distintos a cada capa en lugar de aplicar una cuantizacion uniforme.

El modelo resuelve el problema de ejecutar un LLM multimodal de aproximadamente 28.200 millones de parametros en Macs de 32 GB de memoria unificada: ocupa 16,5 GB en disco, conserva la torre de vision en bf16, mantiene un contexto de 262K tokens e incluye la cabeza de prediccion multi-token (MTP) del modelo original cuantizada a 8 bits. Es relevante porque demuestra que la cuantizacion selectiva por capa permite acercarse al modelo en bf16 sin aumentar el tamano del artefacto.

La arquitectura subyacente es de tipo Qwen3.5 (tag `qwen3_5`), con bloques de atencion lineal combinados con atencion clasica, y el pipeline declarado es image-text-to-text. La licencia es Apache-2.0, heredada del modelo base. El repo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atencion lineal y atencion completa (tag `qwen3_5`), torre de vision multimodal |
| Parametros totales | 28.206.101.232 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (segun la model card) |
| Tipos de cuantizacion | 4 bits con receta LayerFit por capa; torre de vision en bf16; cabeza MTP en 8 bits. Existen builds 2, 2.5, 3, 6 y 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-pi-adapted, una adaptacion del Qwen3.8-27B de Alibaba para el agente de programacion pi. La familia Qwen3.5 combina capas de atencion lineal con capas de atencion completa, lo que reduce el coste de memoria del contexto largo; la model card menciona explicitamente bloques "linear-attention" entre los medidos por LayerFit. El modelo es multimodal: incluye torre de vision y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como draft.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta publicacion es LayerFit: se mide la sensibilidad de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y se reparte un presupuesto fijo de bits donde mas ayuda. Segun la model card, con el mismo tamano se obtiene un 94,1% de acuerdo top-1 con bf16 frente al 92,7% de una cuantizacion 4-bit uniforme, y una divergencia KL de 0,0224 frente a 0,0359 (38% menor). La receta exacta esta en `layerfit-recipe.json`.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 262K tokens de contexto.
- Entrada de imagen (pipeline image-text-to-text): descripcion de imagenes y razonamiento sobre contenido visual.
- Programacion y generacion de codigo, con enfasis en el uso como agente de codificacion (tag `coding`).
- Tool calling y function calling: la model card reporta 3/3 en la prueba de tool call y coding.
- Modo de razonamiento ("thinking") activable y desactivable; la prueba de thinking pasa 2/2.
- Razonamiento matematico basico: GSM8K-50 con thinking desactivado da 44/50.
- Decodificacion especulativa mediante la cabeza MTP incluida, usando el propio modelo como draft.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codificacion en local: el modelo esta adaptado al agente pi y soporta tool calling, por lo que puede integrarse en bucles de edicion de ficheros, ejecucion de comandos y correccion iterativa sobre un Mac de 32 GB sin depender de la nube.
- Asistente de programacion con contexto de repositorio: los 262K tokens permiten cargar varios ficheros y el historial de la sesion en una sola ventana, util para refactorizaciones que abarcan multiples modulos.
- Revision de capturas y diagramas: al aceptar entrada de imagen, puede analizar screenshots de interfaces, diagramas de arquitectura o errores visuales y proponer cambios de codigo asociados.
- Generacion de codigo con decodificacion especulativa: activando la cabeza MTP como draft model se reduce la latencia por token en tareas de autocompletado, adecuado para asistentes interactivos en el editor.
- Automatizacion de tareas de razonamiento con thinking mode: para problemas matematicos o de planificacion se puede activar el modo thinking y desactivarlo en consultas simples para ahorrar tokens.
- Prototipado y evaluacion de modelos multimodales en Apple Silicon: sirve como banco de pruebas para medir el impacto de la cuantizacion por capas frente a la uniforme, con la receta LayerFit incluida en el repo.
- Despliegue en LM Studio: al ser MLX estandar, se carga en LM Studio y en mlx-lm/mlx-vlm sin modificaciones, lo que facilita entornos de escritorio para desarrolladores individuales.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 44/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Entrada de imagen | pass |
| Acuerdo top-1 con bf16 (LayerFit 4-bit) | 94,1% |
| Acuerdo top-1 con bf16 (4-bit uniforme) | 92,7% |
| Divergencia KL (LayerFit 4-bit) | 0,0224 |
| Divergencia KL (4-bit uniforme) | 0,0359 |

El arnes de evaluacion de LayerFit cubre solo pesos de lenguaje, comparados contra una fusion en bf16 del modelo base, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otras suites estandar; la model card remite a la del modelo base para los benchmarks del publicador original.

## Requisitos de hardware

- VRAM/memoria unificada: 16,5 GB en disco; pensado para Macs con 32 GB de memoria unificada, dejando margen para macOS y prompts largos (la descarga es como maximo el 60% de la memoria).
- GPU: exclusivamente Apple Silicon (formato MLX). No es ejecutable en GPU NVIDIA o AMD con este artefacto.
- Variantes por memoria: 2 bits (9,1 GB, solo texto) para 16 GB; 2,5 bits (11,5 GB) para 16 GB en modo stretch; 3 bits (13,1 GB) para 24 GB; 6 y 8 bits para 48 GB o mas.
- Modo stretch en 16 GB: requiere cerrar aplicaciones, limitar prompts a unos miles de tokens y ampliar el limite de memoria de la GPU con `sudo sysctl iogpu.wired_limit_mb=12800` (persiste hasta reiniciar).
- Despliegue: mlx-vlm para multimodal, mlx-lm para texto y LM Studio. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 4-bit) | 28,2B | 262K | 4 bits por capa + vision bf16 + MTP 8 bits | Apache-2.0 | Apple Silicon (MLX) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 28,2B (base) | 262K | 6 bits uniforme | Apache-2.0 | Apple Silicon (MLX) |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 28,2B (base) | 262K | 8 bits uniforme | Apache-2.0 | Apple Silicon (MLX) |
| harness-hub/Qwen3.8-27B-pi-adapted | 28,2B | 262K | bf16 | Apache-2.0 | Multiples (formato original) |

Las variantes 6 y 8 bits del mismo autor no aplican LayerFit porque, segun la model card, aporta poco a partir de 6 bits. No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion respecto a bf16: el acuerdo top-1 medido es del 94,1%, no del 100%; en produccion conviene validar las tareas criticas contra el modelo sin cuantizar.
- El artefacto solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversion.
- La model card no declara los idiomas soportados; el comportamiento multilingue no esta verificado para este build.
- El modo stretch en Macs de 16 GB exige modificar parametros del sistema (`iogpu.wired_limit_mb`) y limita la longitud del prompt; no es adecuado para cargas de produccion.
- No se detallan sesgos conocidos, tasas de alucinacion ni datos de entrenamiento del modelo base en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; LayerFit es una marca registrada de NetProjects.
- El repo registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion independiente de los resultados reportados.
- El modelo esta adaptado al agente pi; su comportamiento fuera de ese entorno de agente no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit
- Build 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit
- Build 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
