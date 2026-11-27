# netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit es una cuantizacion en 3 bits para Apple Silicon (formato MLX) del modelo harness-hub/Qwen3.8-27B-opencode-adapted, a su vez una adaptacion del Qwen3.8-27B orientada a tareas de agente y generacion de codigo en el entorno OpenCode. La publica netprojects (Paris Michalas) bajo licencia Apache-2.0 y esta pensada para ejecutarse en Macs con 24 GB de memoria unificada, ocupando 13,1 GB en disco.

La innovacion principal es LayerFit, una busqueda por capas que asigna presupuestos de bits no uniformes: mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y concentra los bits donde mas importan. Segun el autor, con el mismo tamano que una cuantizacion estandar de 3 bits, LayerFit eleva la coincidencia top-1 con bf16 del 84,7% al 88,8% y reduce la divergencia KL de 0,1443 a 0,0892 (un 38% menos).

El modelo conserva la torre de vision en bf16, mantiene la ventana de contexto de 262K tokens e incluye la cabeza de prediccion multi-token (MTP) del modelo original cuantizada a 8 bits, lo que permite decodificacion especulativa. Es relevante para desarrolladores que quieren un modelo multimodal de ~28.000 millones de parametros con capacidades de agente y codigo en hardware de consumo Apple, sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion lineal hibrida (familia Qwen3.5), multimodal image-text-to-text, con cabeza MTP |
| Parametros totales | 28.206.101.232 (~28,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 3 bits con receta LayerFit por capa; torre de vision en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (compatible con mlx-lm, mlx-vlm y LM Studio) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 (tag `qwen3_5`) con modulos de atencion lineal hibridos, segun se desprende de la descripcion del proceso LayerFit, que distingue "cada capa MLP, atencion y bloques de atencion lineal". Es multimodal (pipeline `image-text-to-text`) e incorpora una cabeza de prediccion multi-token (MTP) que actua como modelo borrador para decodificacion especulativa. No se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

El trabajo de netprojects es exclusivamente de cuantizacion: aplica LayerFit sobre el modelo bf16 de harness-hub, buscando una asignacion de bits por capa que minimice la divergencia respecto al original bajo el mismo presupuesto de tamano. La receta exacta se publica en `layerfit-recipe.json`. El autor indica que la receta de bits se obtuvo para la base Qwen3.8-27B y se revalido sobre esta adaptacion.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo "thinking" (la model card reporta 2/2 pruebas superadas).
- Generacion y edicion de codigo, orientada al entorno OpenCode.
- Tool calling y function calling (3/3 pruebas superadas segun el autor).
- Entrada de imagenes: la torre de vision se mantiene en bf16 (misma que la build de 4 bits, verificada alli).
- Capacidades de agente y razonamiento multi-paso.
- Decodificacion especulativa mediante la cabeza MTP incluida a 8 bits.
- Capacidades multilingues: no detalladas; la evaluacion del autor incluyo pasajes en varios idiomas ademas del ingles.
- Razonamiento matematico basico (GSM8K-50 con thinking desactivado: 44/50).

## Casos de uso

- Asistente de codigo en local para Mac: integrado en editores o en OpenCode, el modelo genera y refactoriza codigo sin enviar datos a la nube, aprovechando el contexto de 262K para incluir repositorios o modulos completos en el prompt.
- Agente autonomo de desarrollo: con tool calling verificado, puede encadenar pasos de lectura de ficheros, ejecucion de comandos y aplicacion de parches en pipelines multi-paso.
- Revision de codigo con capturas: al aceptar entrada de imagen, permite adjuntar diagramas de arquitectura, errores de consola o capturas de UI junto al codigo para tareas de depuracion.
- Automatizacion de tareas de terminal: el ajuste especifico a OpenCode lo hace adecuado para generar comandos y scripts a partir de descripciones en lenguaje natural en entornos de desarrollo.
- Prototipado de asistentes multimodales en portatiles: con 13,1 GB en disco cabe en un Mac de 24 GB, lo que permite desplegar un asistente imagen-texto sin GPU dedicada.
- Generacion aumentada por recuperacion (RAG) sobre documentacion extensa: la ventana de 262K permite inyectar manuales tecnicos o bases de conocimiento grandes en un unico contexto.
- Inferencia con baja latencia en Apple Silicon: el uso de la cabeza MTP como borrador acelera la decodificacion en tareas de generacion larga como redaccion de codigo o documentacion.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 44/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Coincidencia top-1 con bf16 (LayerFit 3-bit) | 88,8% |
| Coincidencia top-1 con bf16 (3-bit estandar) | 84,7% |
| Divergencia KL (LayerFit 3-bit) | 0,0892 |
| Divergencia KL (3-bit estandar) | 0,1443 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible; el autor remite a la model card del modelo base para sus cifras de referencia.

## Requisitos de hardware

- Memoria: 13,1 GB en disco; pensado para Macs con 24 GB de memoria unificada, dejando margen para macOS y prompts largos.
- Solo Apple Silicon: el formato MLX requiere chip M-series; no es ejecutable en GPU NVIDIA ni en CPU x86 mediante este repositorio.
- Builds alternativas del mismo autor: 2 bits (9,1 GB, solo texto) y 2,5 bits (11,5 GB) para 16 GB; 4 bits (16,5 GB) para 32 GB; 6 y 8 bits para 48 GB o mas.
- Ajuste opcional en equipos justos: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el limite de memoria de la GPU hasta reiniciar.
- Despliegue: mlx-lm (texto), mlx-vlm (imagen-texto) y LM Studio; no se menciona soporte de vLLL, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit | ~28,2 B | 262K | 3 bits MLX (LayerFit) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-opencode-adapted (base, bf16) | ~28,2 B | 262K | bf16 | Apache-2.0 | Hugging Face |
| Misma familia, LayerFit MLX 4-bit | ~28,2 B | 262K | 4 bits MLX | Apache-2.0 | Hugging Face |
| Misma familia, LayerFit MLX 2-bit | ~28,2 B | 262K | 2 bits MLX (solo texto) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: aunque LayerFit reduce la perdida, la coincidencia top-1 con bf16 es del 88,8%, por lo que hay degradacion medible frente al modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de factualidad.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Idiomas: no se publica la lista oficial de idiomas soportados; el rendimiento fuera del ingles y el codigo no esta cuantificado.
- Plataforma: exclusivo de Apple Silicon; no apto para servidores con GPU NVIDIA ni para despliegues en contenedores x86.
- El modelo base esta ajustado para OpenCode; su comportamiento en otros entornos de agente puede diferir del esperado.
- LayerFit es una marca registrada de NetProjects; la licencia Apache-2.0 cubre los pesos, pero conviene revisar LICENSE y NOTICE del repositorio.
- El autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
