# netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit

## Resumen

Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit es una cuantizacion de 2 bits del modelo harness-hub/Qwen3.8-27B-hermes-adapted, publicada por netprojects (Paris Michalas) en formato MLX para Apple Silicon. Se trata de una adaptacion del modelo base Qwen3.8-27B (familia Qwen 3.5, segun los tags) orientada a tareas de agente y generacion de codigo, comprimida mediante la tecnica propietaria LayerFit, que asigna un numero variable de bits por capa en funcion de la sensibilidad medida de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida).

El resultado ocupa 9,1 GB en disco con 26.896 millones de parametros y esta pensado para Macs de 16 GB de memoria unificada, un objetivo agresivo para un modelo de casi 27B. El autor reporta que, con el mismo presupuesto de tamano, LayerFit 2-bit alcanza un 76,4 % de acuerdo top-1 con el modelo en bf16 frente al 68,3 % de una cuantizacion estandar de 2 bits, y reduce la divergencia KL de 0,6856 a 0,3717 (un 46 % menos).

Esta version es solo texto: se ha eliminado la torre de vision para que quepa en 16 GB, y no incluye la cabeza MTP (multi-token prediction) porque, segun el autor, a 2 bits no aporta beneficio. Declara 262K tokens de contexto y licencia Apache-2.0. Es relevante para desarrolladores que quieran ejecutar localmente un modelo de ~27B con capacidades de agente y codigo en hardware de consumo Apple, a costa de una perdida de calidad apreciable respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (tag `qwen3_5`), con bloques de atencion y atencion lineal; cuantizacion por capas LayerFit |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 2 bits con receta LayerFit por capa (`layerfit-recipe.json`); existen builds 2.5, 3, 4, 6 y 8 bits del mismo autor |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-lm`) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-hermes-adapted, una adaptacion de Qwen3.8-27B (familia Qwen 3.5) para el agente Hermes. La arquitectura subyacente es un transformer con mezcla de bloques de atencion y atencion lineal, segun la receta LayerFit que distingue explicitamente "every layer's MLP, attention and linear-attention blocks". No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion: LayerFit mide la degradacion de cada bloque a bajos bits (mediante un harness con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas) y distribuye el presupuesto de bits donde mas ayuda, en lugar de aplicar un bit-width uniforme. La receta se calculo originalmente para el base Qwen3.8-27B y se revalido sobre esta adaptacion. No hay decodificacion especulativa ni cabeza MTP en este build.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo "thinking" activable y desactivable (el autor reporta 2/2 en pruebas de thinking y 43/50 en GSM8K-50 con thinking desactivado).
- Generacion de codigo y tareas de programacion (tag `coding`).
- Tool calling / function calling (prueba de tool call y coding superada 2/3).
- Orientacion a agentes y razonamiento multi-paso (tag `agent`, adaptacion para el agente Hermes).
- Capacidades matematicas basicas y de razonamiento aritmetico (GSM8K).
- Multilingue: no confirmado; la model card no declara idiomas y el harness de calibracion incluye "other languages" sin especificar cuales.
- Vision: no soportada en este build (torre de vision eliminada).

## Casos de uso

- Asistente de codigo local en Mac: el modelo puede autocompletar, explicar y refactorizar codigo dentro de un IDE o CLI en un Mac de 16 GB, aprovechando su entrenamiento orientado a coding y tool calling sin enviar codigo a la nube.
- Agente autonomo de desarrollo: al soportar function calling y razonamiento multi-paso, puede encadenar llamadas a herramientas (lectura de ficheros, ejecucion de tests, consultas a APIs) en flujos tipo Hermes sobre hardware local.
- Procesamiento de documentos largos: con 262K tokens de contexto puede resumir o extraer informacion de manuales, contratos o bases de codigo extensas en una sola pasada, siempre que el prompt quepa en la memoria disponible.
- Automatizacion de tareas de oficina y scripting: generacion de scripts, transformacion de datos y redaccion tecnica en local, util para entornos con requisitos de privacidad que impiden usar APIs externas.
- Prototipado y evaluacion de agentes: investigadores pueden montar un entorno de pruebas de agentes completamente offline en un portatil Apple, sin depender de GPUs dedicadas.
- Educacion y experimentacion: ejecucion de un modelo de ~27B en hardware de consumo para estudiar comportamiento de cuantizaciones agresivas, comparando este build 2-bit con los de 2.5, 3 y 4 bits del mismo autor.
- Chatbot de soporte tecnico offline: conversaciones multi-turno con contexto largo para documentacion interna, aceptando la perdida de calidad frente al modelo en bf16.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 43/50 |
| Tool call y coding | 2/3 (pass) |
| Thinking | 2/2 (pass) |
| Acuerdo top-1 con bf16 (LayerFit 2-bit) | 76,4 % |
| Acuerdo top-1 con bf16 (2-bit estandar) | 68,3 % |
| Divergencia KL (LayerFit 2-bit) | 0,3717 |
| Divergencia KL (2-bit estandar) | 0,6856 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible para este build. El autor remite a la model card del modelo base para los resultados del publicador original.

## Requisitos de hardware

- VRAM/memoria unificada: 9,1 GB de pesos; el autor lo orienta a Macs de 16 GB dejando margen para macOS y prompts largos (el download es como maximo ~60 % de la memoria).
- GPU: exclusivamente Apple Silicon via MLX (serie M). No esta pensado para CUDA.
- Cabe en GPU de consumo Apple: si, en Macs de 16 GB; el autor advierte que en 16 GB es un "stretch" y sugiere cerrar aplicaciones y limitar prompts a unos miles de tokens, o ampliar el limite de memoria con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Builds alternativos del mismo autor: 2.5-bit (11,5 GB) para 16 GB, 3-bit (13,1 GB) para 24 GB, 4-bit (16,5 GB) para 32 GB, 6-bit y 8-bit para 48 GB o mas.
- Despliegue: mlx-lm (`mlx_lm.generate`), mlx-vlm y LM Studio (formato MLX estandar). No compatible con vLLM, llama.cpp, Ollama ni TGI al ser pesos MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (LayerFit MLX 2-bit) | ~26,9B | 262K | 2 bits MLX | Apache-2.0 | Hugging Face, MLX |
| netprojects Qwen3.8-27B-hermes-adapted LayerFit MLX 4-bit | ~26,9B | 262K | 4 bits MLX | Apache-2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-hermes-adapted (base) | ~27B | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (original) | ~27B | no disponible | bf16 y otras | Apache-2.0 | Hugging Face |

La comparacion con modelos de otros proveedores del mismo tamano (p. ej. variantes de 24-32B) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento comparativos mas alla de los del propio autor.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la perdida de calidad es sustancial incluso con LayerFit (76,4 % de acuerdo top-1 con bf16 implica que aproximadamente una de cada cuatro predicciones top-1 difiere del original). No es adecuado para tareas que exijan fidelidad alta al modelo base.
- Sin vision: la torre de vision se ha eliminado en este build; cualquier caso de uso multimodal requiere otro build o el modelo base.
- Sin cabeza MTP: no se dispone de decodificacion multi-token prediction, lo que puede afectar al throughput frente a otros builds.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; en un modelo de 2 bits el riesgo es mayor que en el original.
- Sesgos: no disponibles; la model card no documenta evaluaciones de sesgo.
- Idiomas: no se declara lista oficial de idiomas soportados; el rendimiento fuera del ingles no esta cuantificado.
- Contexto: aunque se declaran 262K tokens, en un Mac de 16 GB el propio autor recomienda limitar los prompts a unos miles de tokens, por lo que el contexto efectivo en ese hardware es mucho menor.
- Licencia: Apache-2.0 permite uso comercial, pero LayerFit es una marca registrada de NetProjects y el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; conviene revisar LICENSE y NOTICE antes de redistribuir.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Build 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2.5bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-3bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-4bit
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
