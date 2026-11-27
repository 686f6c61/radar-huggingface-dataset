# netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits del modelo harness-hub/Qwen3.8-27B-think-pi-adapted, una adaptacion de Qwen3.8-27B (arquitectura qwen3_5) orientada al agente de programacion "pi" con el modo de razonamiento (thinking) activado. La publica netprojects (Paris Michalas), un tercero no afiliado al editor del modelo base, y esta pensada especificamente para Apple Silicon mediante la libreria MLX. El resultado es un paquete de 11,5 GB en disco que cabe en Macs de 16 GB de memoria unificada, manteniendo la torre de vision en bf16 y una cabeza de prediccion multi-token (MTP) a 4 bits para acelerar la decodificacion.

El modelo resuelve un problema concreto: ejecutar un modelo de unos 27.800 millones de parametros con capacidades multimodales (image-text-to-text) en hardware de consumo Apple, donde una cuantizacion uniforme a 2,5 bits degrada notablemente la calidad. Para ello aplica LayerFit, una busqueda por capa que asigna mas bits a las partes del modelo mas sensibles (bloques MLP, atencion, atencion lineal, embeddings y cabeza de salida) dentro de un mismo presupuesto de tamano. Segun la model card, esto eleva la coincidencia top-1 con bf16 del 76,1 % al 83,2 % y reduce el error KL un 52 % (de 0,3859 a 0,1854) frente a una cuantizacion estandar del mismo tamano.

Es relevante ahora porque demuestra que las tecnicas de cuantizacion no uniforme permiten llevar modelos multimodales de gran tamano a equipos consumer sin renunciar por completo a calidad, y porque se distribuye en formato MLX estandar, cargable por mlx-lm, mlx-vlm y LM Studio. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer qwen3_5 (multimodal image-text-to-text, con atencion lineal y cabeza MTP); pesos en MLX |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,5 bits con receta LayerFit por capa; torre de vision en bf16; cabeza MTP a 4 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX; tamano del repo 11,5 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B adaptado por harness-hub para el agente de codigo "pi" con thinking activado. La arquitectura es de tipo qwen3_5, un transformer multimodal que procesa imagen y texto (pipeline image-text-to-text) e incorpora atencion lineal ademas de atencion estandar. Incluye una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa para acelerar la generacion. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

La innovacion de esta publicacion no esta en el entrenamiento sino en la cuantizacion. LayerFit mide la sensibilidad de cada componente (MLP, atencion y atencion lineal de cada capa, embeddings y cabeza de salida) a bits bajos y distribuye el presupuesto de tamano donde mas ayuda, en lugar de aplicar el mismo numero de bits a todas las capas. La receta de bits se calculo sobre la base Qwen3.8-27B y se revalido sobre este modelo; el detalle exacto esta en el fichero `layerfit-recipe.json` del repositorio. El harness de evaluacion usa solo los pesos del modelo de lenguaje, comparando contra una build bf16 del modelo base con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (el modelo base esta adaptado con thinking activado).
- Procesamiento de imagen y texto (image-text-to-text); la torre de vision se conserva en bf16 y, segun la model card, es la misma que la build de 4 bits.
- Generacion de codigo y resolucion de problemas matematicos (se reportan pruebas de GSM8K y de codigo).
- Soporte de tool calling / function calling (se reporta una prueba de tool call superada).
- Decodificacion acelerada mediante prediccion multi-token (MTP) con modelo borrador integrado.
- Capacidades multilingues segun la model card (pruebas en ingles y otros idiomas), aunque no se detallan los idiomas soportados.
- Compatibilidad con mlx-lm, mlx-vlm y LM Studio.

## Casos de uso

- Asistencia de programacion en local en un Mac de 16 GB: el modelo esta adaptado al agente "pi" y soporta tool calling, por lo que puede integrarse en flujos de edicion de codigo y ejecucion de herramientas sin conexion a la nube.
- Razonamiento con thinking en portatiles Apple: permite resolver tareas de varios pasos con el modo de razonamiento activado dentro de un presupuesto de memoria de 16 GB, algo inviable con el modelo completo en bf16.
- Analisis de imagenes y documentos: al conservar la torre de vision en bf16, puede describir imagenes o responder preguntas sobre capturas y fotografias mediante mlx-vlm.
- Prototipado de agentes multimodales en estaciones de trabajo Mac: util para validar pipelines de agente (tool calls, razonamiento multi-paso) antes de desplegar en infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: la receta LayerFit y los datos de coincidencia top-1 y KL sirven como referencia para investigar cuantizacion no uniforme en modelos multimodales.
- Uso educativo y de investigacion: licencia Apache-2.0 y ejecucion en hardware de consumo facilitan experimentos reproducibles sin GPUs dedicadas.
- Procesamiento de codigo y matematicas en local: las pruebas reportadas de GSM8K y codigo indican utilidad para tareas acotadas de resolucion de problemas y generacion de funciones.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del cuantizador y comparan la cuantizacion LayerFit con una cuantizacion estandar del mismo tamano, no con otros modelos.

| Metrica | Estandar 2,5 bits | LayerFit 2,5 bits |
|---|---|---|
| Coincidencia top-1 con bf16 | 76,1 % | 83,2 % |
| Error KL | 0,3859 | 0,1854 (52 % menor) |

Pruebas de esta build concreta:

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 46/50 |
| Coding 3/3 | pass |
| Tool call | pass |
| Thinking 2/2 | pass |
| Entrada de imagen | misma torre de vision que la build de 4 bits (verificada alli) |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval u otros) para esta build.

## Requisitos de hardware

- Memoria: 11,5 GB en disco; pensado para Macs con 16 GB de memoria unificada, dejando margen para macOS y prompts largos (la descarga es como maximo ~60 % de la memoria).
- Modo "stretch" en 16 GB: cerrar otras aplicaciones, limitar prompts a unos pocos miles de tokens y ampliar el limite de memoria de la GPU con `sudo sysctl iogpu.wired_limit_mb=12800` (persiste hasta reiniciar).
- Otras builds del mismo modelo para distintos Macs: 2 bits (9,3 GB, solo texto) para 16 GB, 3 bits (13,1 GB) para 24 GB, 4 bits (16,5 GB) para 32 GB, y 6/8 bits para 48 GB o mas.
- GPUs dedicadas (A100, H100, RTX 4090): no aplica; el formato es MLX para Apple Silicon. No se documenta soporte en CUDA en la informacion disponible.
- Despliegue: mlx-vlm (imagen y texto), mlx-lm (texto) y LM Studio. No se menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la cabeza MTP a 4 bits se incluye para acelerar la decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 2,5 bits) | 27,78 mil millones | no disponible | 2,5 bits LayerFit | Apache-2.0 | Hugging Face, formato MLX |
| Build MLX 4 bits del mismo modelo | 27,78 mil millones | no disponible | 4 bits | Apache-2.0 | Hugging Face, 16,5 GB, para 32 GB |
| Cuantizacion estandar 2,5 bits (referencia de la model card) | 27,78 mil millones | no disponible | 2,5 bits uniforme | no disponible | referencia interna de evaluacion |

No se dispone de datos de benchmarks frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits implica perdida de calidad respecto a bf16: la coincidencia top-1 reportada es del 83,2 %, no del 100 %.
- La build esta pensada para 16 GB en modo "stretch"; con prompts largos o memoria insuficiente puede fallar o ralentizarse.
- No se detallan los idiomas soportados; las capacidades multilingues solo se mencionan de forma generica.
- No se dispone de la longitud de contexto, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo.
- Solo es compatible con el ecosistema MLX (Apple Silicon); no se documenta soporte en CUDA ni en otros runtimes.
- Es una publicacion de un tercero no afiliado al editor del modelo base; la calidad y el mantenimiento dependen de netprojects.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar LICENSE y NOTICE del repositorio; LayerFit es una marca registrada de NetProjects.
- El modelo base esta adaptado al agente "pi" con thinking activado, lo que puede condicionar su comportamiento fuera de ese contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Build 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-3bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-4bit
- Build 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
