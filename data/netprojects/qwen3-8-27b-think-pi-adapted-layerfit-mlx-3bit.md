# netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-3bit es una cuantizacion de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-think-pi-adapted, una adaptacion del Qwen3.8-27B orientada al agente de programacion "pi" con el modo de razonamiento (thinking) activado. La publica netprojects (Paris Michalas), un tercero no afiliado al editor del modelo base, y esta pensada especificamente para ejecutarse en Macs con Apple Silicon de 24 GB de memoria unificada.

El modelo conserva la torre de vision en bf16 y empaqueta la cabeza de prediccion multi-token (MTP) del Qwen3.8-27B en 8 bits para acelerar la decodificacion. El resultado ocupa 13,1 GB en disco para 28.206.101.232 parametros totales, y se carga con las herramientas estandar del ecosistema MLX (mlx-lm, mlx-vlm y LM Studio), sin necesidad de parches.

La innovacion principal es LayerFit, una busqueda por capas que asigna mas bits a las partes del modelo que mas sufren con la cuantizacion (bloques MLP, atencion, atencion lineal, embeddings y cabeza de salida) manteniendo el mismo presupuesto de tamano. Segun el autor, esto eleva la concordancia top-1 con el modelo bf16 del 84,4% al 88,8% y reduce el error KL un 38% frente a una cuantizacion de 3 bits uniforme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (familia Qwen3.5), vision tower y cabeza MTP; pesos en MLX |
| Parametros totales | 28.206.101.232 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (LayerFit, receta por capas); vision tower en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 13,2 GB) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-think-pi-adapted, una adaptacion del Qwen3.8-27B (familia qwen3_5) para el agente de programacion "pi" con thinking activado. La arquitectura combina bloques de atencion estandar con bloques de atencion lineal, incorpora una torre de vision para entrada image-text-to-text y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

Esta publicacion concreta no reentrena el modelo: aplica una cuantizacion post-entrenamiento de 3 bits con la metodologia LayerFit. El autor mide la sensibilidad de cada componente (MLP, atencion, atencion lineal, embeddings y cabeza de salida) y distribuye el presupuesto de bits de forma no uniforme. La receta exacta esta en `layerfit-recipe.json` dentro del repositorio, y segun el autor se obtuvo para la base Qwen3.8-27B y se revalido sobre este modelo adaptado. La torre de vision se mantiene en bf16 y la cabeza MTP en 8 bits.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (la variante base es "think").
- Generacion de codigo, incluida la resolucion de tareas de programacion verificadas (3/3 en la prueba de coding del autor).
- Tool calling / function calling (prueba superada segun la model card).
- Entrada de imagen (image-text-to-text) mediante la torre de vision conservada en bf16.
- Razonamiento matematico (GSM8K-50 con thinking desactivado: 46/50).
- Decodificacion acelerada mediante la cabeza MTP en 8 bits (draft model del mismo repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local en un Mac de 24 GB: el modelo esta adaptado al agente "pi" y soporta tool calling, por lo que puede integrarse en flujos de edicion de codigo y ejecucion de comandos sin salir del equipo.
- Desarrollo con privacidad de datos: al ejecutarse en MLX sobre Apple Silicon, el codigo y los prompts no salen de la maquina, adecuado para repositorios confidenciales.
- Analisis de capturas e imagenes tecnicas: la torre de vision en bf16 permite describir diagramas, errores en pantalla o documentacion escaneada junto con texto.
- Razonamiento multi-paso con thinking: tareas de depuracion o planificacion que se benefician de cadenas de razonamiento largas antes de la respuesta final.
- Evaluacion y prototipado de cuantizaciones: util para investigadores que quieran comparar LayerFit 3 bits frente a cuantizaciones uniformes con el mismo presupuesto de memoria.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite medir el impacto del draft model en latencia dentro de pipelines mlx-vlm.
- Uso educativo y experimentacion en equipos de gama consumer: 13,1 GB permiten cargar el modelo en Macs de 24 GB dejando margen para macOS y prompts largos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 46/50 |
| Coding (3 tareas) | 3/3 |
| Tool call | pass |
| Thinking (2 pruebas) | 2/2 |
| Concordancia top-1 con bf16 (LayerFit 3 bits) | 88,8% |
| Concordancia top-1 con bf16 (3 bits uniforme) | 84,4% |
| Error KL (LayerFit 3 bits) | 0,0892 |
| Error KL (3 bits uniforme) | 0,1446 (38% superior) |

Los datos de concordancia y KL provienen del harness del autor sobre pesos de lenguaje, comparados contra su build bf16 del modelo base, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Memoria: 13,1 GB en disco; pensado para Macs con 24 GB de memoria unificada.
- GPU: exclusivamente Apple Silicon (MLX); no es compatible con CUDA.
- Variantes por memoria: 2 bits (9,3 GB, solo texto) y 2,5 bits (11,5 GB) para 16 GB; 4 bits (16,5 GB) para 32 GB; 6 y 8 bits para 48 GB o mas.
- Ajuste opcional en 16 GB: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el limite de memoria cableada de la GPU (se pierde al reiniciar).
- Despliegue: mlx-vlm (imagen y texto), mlx-lm (solo texto) y LM Studio.
- Latencia y throughput: no disponibles; el autor solo indica que la cabeza MTP en 8 bits acelera la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 3 bits) | 28,2 B | no disponible | 3 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| netprojects LayerFit MLX 4 bits (misma familia) | 28,2 B | no disponible | 4 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| netprojects MLX 6/8 bits (misma familia) | 28,2 B | no disponible | 6 y 8 bits | Apache-2.0 | Apple Silicon (MLX) |
| harness-hub/Qwen3.8-27B-think-pi-adapted (base) | 28,2 B (aprox.) | no disponible | bf16 | Apache-2.0 | generico |

No se dispone de datos para comparar con modelos de otras familias de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva de 3 bits: aunque LayerFit reduce la degradacion, la concordancia con bf16 es del 88,8%, por lo que hay perdida de calidad frente al modelo original.
- Solo Apple Silicon: el formato MLX no se ejecuta en GPUs NVIDIA ni en CPU convencional sin conversion.
- Modelo de terceros: netprojects no esta afiliado al editor de harness-hub/Qwen3.8-27B-think-pi-adapted; la calidad del modelo base no esta avalada por el autor de esta cuantizacion.
- Idiomas soportados no documentados; el harness de evaluacion incluye otros idiomas ademas del ingles, pero no se detalla cobertura.
- Longitud de contexto no disponible; el autor recomienda prompts de pocos miles de tokens en configuraciones de 16 GB.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la model card.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los ficheros LICENSE y NOTICE del repositorio; "LayerFit" es marca registrada de NetProjects.
- Las cifras de rendimiento del autor (GSM8K-50, coding, tool call) son pruebas internas reducidas, no benchmarks estandarizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Variante 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2bit
- Variante 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2.5bit
- Variante 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-4bit
- Variante 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Variante 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com
