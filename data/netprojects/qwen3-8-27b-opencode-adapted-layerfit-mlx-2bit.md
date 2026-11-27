# netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit

## Resumen

Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit es una cuantizacion de 2 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada a tareas de agente y generacion de codigo (OpenCode). La publica netprojects (Paris Michalas) bajo licencia Apache-2.0 y emplea una tecnica propia denominada LayerFit, que asigna un numero de bits distinto a cada capa en funcion de su sensibilidad a la cuantizacion, en lugar de aplicar la misma precision a toda la red.

El objetivo es claro: permitir ejecutar un modelo de aproximadamente 26.900 millones de parametros en un Mac con 16 GB de memoria unificada. El repositorio ocupa 9,1 GB en disco y se distribuye en safetensors para la libreria mlx-lm, por lo que es compatible con herramientas estandar del ecosistema Apple Silicon (mlx-lm, mlx-vlm, LM Studio). Esta build concreta es solo texto: se ha eliminado la torre de vision para ajustarse al presupuesto de memoria.

La relevancia de esta ficha radica en que documenta un caso extremo de cuantizacion agresiva (2 bits) sobre un modelo de casi 27B, con contexto declarado de 262K tokens y una receta de bits publicada en `layerfit-recipe.json`. Es un artefacto orientado a inferencia local en hardware de consumo, no a despliegues de servidor de alta precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye bloques de atencion lineal segun la model card |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (segun model card) |
| Tipos de cuantizacion | 2 bits con receta LayerFit por capa; existen builds 2.5, 3, 4, 6 y 8 bits del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-opencode-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada a flujos de agente y codigo (OpenCode). La model card menciona explicitamente bloques de atencion, MLP y atencion lineal como componentes diferenciados a la hora de cuantizar, lo que confirma una arquitectura transformer con capas de atencion lineal hibridas. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion disponible.

La innovacion tecnica de esta build es LayerFit: en lugar de aplicar la misma precision a todas las capas, se mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a bajos bits y se distribuye el presupuesto de tamano donde mas aporta. Segun la model card, con el mismo tamano y el mismo test, la cuantizacion estandar de 2 bits alcanza un 68,0% de acuerdo top-1 con bf16 y un error KL de 0,6795, mientras que LayerFit 2 bits logra un 76,7% de acuerdo y un KL de 0,3722 (un 45% inferior). La receta exacta de bits esta en `layerfit-recipe.json` dentro del repositorio. Esta build no incluye cabeza MTP (multi-token prediction), ya que segun el autor no aporta a 2 bits.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts.
- Razonamiento con modo thinking (la model card reporta 2/2 en pruebas de thinking).
- Generacion de codigo y tareas de agente (tag `coding`, `agent`; la build pasa 2/3 en tool call y coding).
- Soporte de tool calling / function calling, segun las pruebas reportadas por el autor.
- Capacidades matematicas basicas: 43/50 en GSM8K-50 con thinking desactivado.
- Contexto largo declarado de 262K tokens (sujeto en la practica al presupuesto de memoria del equipo).
- Solo texto: la torre de vision se ha eliminado en esta build.

## Casos de uso

- Asistencia de codigo en local en un Mac de 16 GB: el modelo puede integrarse en editores o terminales para autocompletado y explicacion de fragmentos, aprovechando que la build ocupa 9,1 GB y deja margen para el sistema y el prompt.
- Agentes de terminal y automatizacion de tareas de desarrollo: el soporte de tool calling permite encadenar llamadas a herramientas (ejecutar comandos, leer ficheros) en flujos tipo OpenCode, con la advertencia de que la fiabilidad a 2 bits es menor que en builds de mayor precision.
- Prototipado de pipelines de agente en Apple Silicon: util para validar prompts, esquemas de herramientas y flujos multi-paso antes de migrar a una build de 4 o 6 bits o a un servidor con GPU.
- Procesamiento de documentos largos en local: el contexto declarado de 262K permite resumir o consultar repositorios y documentos extensos, siempre que se ajuste el prompt al limite real de memoria (`iogpu.wired_limit_mb`).
- Generacion de tests y refactorizacion acotada: tareas de codigo de alcance medio donde el modelo puede proponer cambios y el desarrollador los revisa, sin coste de API.
- Educacion y experimentacion con cuantizacion: la receta LayerFit publicada permite estudiar el impacto de la asignacion de bits por capa comparando esta build con la de 2,5 o 3 bits.
- Inferencia offline en entornos sin conectividad: al ser un modelo local sin dependencia de servicios externos, encaja en escenarios de privacidad donde el codigo no debe salir del equipo.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 43/50 |
| Tool call y coding | 2/3 (pass) |
| Thinking | 2/2 (pass) |
| Acuerdo top-1 con bf16 (LayerFit 2-bit) | 76,7% |
| Acuerdo top-1 con bf16 (2-bit estandar) | 68,0% |
| Error KL (LayerFit 2-bit) | 0,3722 |
| Error KL (2-bit estandar) | 0,6795 |

El harness de evaluacion del autor cubre solo pesos del modelo de lenguaje, comparado contra su merge en bf16 de harness-hub/Qwen3.8-27B-opencode-adapted, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,1 GB de pesos; la model card indica que la descarga debe ser como maximo el 60% de la memoria del equipo, por lo que encaja en Macs de 16 GB.
- GPU recomendadas: Apple Silicon con 16 GB o mas de memoria unificada. No se documenta soporte para GPU NVIDIA en esta build (formato MLX).
- Cabe en GPU de consumo: si, en Macs de 16 GB; para 16 GB en modo "stretch" el autor sugiere cerrar aplicaciones, limitar prompts a unos miles de tokens y ejecutar `sudo sysctl iogpu.wired_limit_mb=12800`.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), mlx-vlm y LM Studio, segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (LayerFit MLX 2-bit) | ~26,9B | 262K | 2 bits | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-adapted LayerFit MLX 3-bit | ~26,9B (mismo base) | 262K | 3 bits | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-adapted LayerFit MLX 4-bit | ~26,9B (mismo base) | 262K | 4 bits | Apache-2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-opencode-adapted (bf16) | ~26,9B | no disponible | bf16 | Apache-2.0 | Hugging Face |

Las builds de 3 y 4 bits del mismo autor son las alternativas naturales: la de 3 bits ocupa 13,1 GB (Mac de 24 GB) y la de 4 bits 16,5 GB (Mac de 32 GB), con mayor fidelidad al modelo original. No se dispone de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la fidelidad: el acuerdo top-1 con bf16 es del 76,7%, lo que implica un 23,3% de discrepancias en la seleccion de token frente al modelo original.
- El rendimiento en tool calling y codigo es limitado (2/3 en las pruebas del autor); no es adecuada para produccion critica sin validacion humana.
- GSM8K-50 con thinking desactivado da 43/50, lo que sugiere errores en una fraccion no trivial de problemas matematicos.
- Solo texto: la torre de vision se ha eliminado, por lo que no admite entradas de imagen.
- No se documentan sesgos conocidos ni composicion del dataset de entrenamiento; el riesgo de alucinacion es el habitual en modelos de esta familia y probablemente mayor por la cuantizacion agresiva.
- Idiomas soportados no disponibles; el harness de evaluacion menciona "otros idiomas" sin detallar cuales.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; conviene revisar LICENSE y NOTICE del repositorio.
- El contexto de 262K es el declarado del modelo base; en un Mac de 16 GB el limite practico de prompt es mucho menor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- LayerFit es una marca registrada de NetProjects; la receta concreta esta en `layerfit-recipe.json` y conviene reproducirla antes de confiar en los numeros reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
