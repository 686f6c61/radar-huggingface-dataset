# netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits del modelo harness-hub/Qwen3.8-27B-opencode-adapted, una adaptacion orientada a tareas de agente y generacion de codigo (OpenCode) del modelo Qwen3.8-27B de la familia Qwen. La publica netprojects (Paris Michalas, NetProjects) en formato MLX para Apple Silicon, con el objetivo de que un modelo de aproximadamente 27.800 millones de parametros quepa en Macs de 16 GB de memoria unificada. El resultado ocupa 11,5 GB en disco y conserva el tower de vision en bf16, ademas de una ventana de contexto de 262.144 tokens.

La innovacion principal es LayerFit, una busqueda de receta de cuantizacion por capa: en lugar de asignar el mismo numero de bits a todas las capas, mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) y redistribuye el presupuesto de bits donde mas impacto tiene. Segun la model card, frente a una cuantizacion estandar de 2,5 bits con el mismo tamano, LayerFit mejora la coincidencia top-1 con bf16 del 76,2 % al 83,3 % y reduce la divergencia KL de 0,3827 a 0,1865 (un 51 % menos).

Es relevante porque permite ejecutar un modelo multimodal de casi 28.000 millones de parametros, con soporte de tool calling, razonamiento en modo thinking y decodificacion especulativa mediante cabeza MTP, en hardware de consumo Apple. La licencia es Apache-2.0, lo que facilita su uso comercial, y los pesos son compatibles con mlx-lm, mlx-vlm y LM Studio sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.8 (tag qwen3_5), con bloques de atencion y atencion lineal; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 2,5 bits con receta LayerFit por capa; tower de vision en bf16; cabeza MTP en 4 bits. Existen builds de 2, 3, 4, 6 y 8 bits del mismo modelo |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 11,5 GB) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-opencode-adapted, una adaptacion de Qwen3.8-27B orientada a flujos de agente y codigo (OpenCode). La arquitectura subyacente es un transformer de la familia Qwen3.8 (etiquetado internamente como qwen3_5) con atencion estandar y atencion lineal, y un tower de vision que lo habilita como modelo image-text-to-text. Incluye una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como draft model.

Sobre el entrenamiento del modelo base no se proporcionan datos en la informacion disponible: no se especifica el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La contribucion tecnica de esta publicacion es la cuantizacion: LayerFit mide la sensibilidad de cada capa (MLP, atencion, atencion lineal, embeddings y cabeza de salida) y asigna bits de forma no uniforme bajo un presupuesto fijo de tamano. La receta exacta se publica en `layerfit-recipe.json`. El harness de evaluacion se ejecuto solo sobre pesos de lenguaje, comparando contra una fusion en bf16 del modelo base, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking (verificado: 2/2 en las pruebas del autor).
- Generacion de codigo y tareas de programacion (verificado: 3/3 en tool call y coding).
- Tool calling / function calling, orientado a flujos de agente (adaptacion OpenCode).
- Razonamiento multi-paso y uso como agente.
- Entrada de imagen: pipeline image-text-to-text con tower de vision en bf16.
- Decodificacion especulativa mediante la cabeza MTP incluida en 4 bits.
- Capacidades multilingues: no disponibles en detalle en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local para Mac: el modelo puede generar y revisar codigo en un IDE o terminal integrado mediante OpenCode, aprovechando la adaptacion especifica al flujo de agente y el soporte de tool calling.
- Agente de refactorizacion sobre repositorios grandes: con 262K tokens de contexto puede cargar varios ficheros y el historial de cambios en una sola ventana, lo que reduce la perdida de contexto entre pasos.
- Automatizacion de tareas de desarrollo en CI/CD: invocado desde scripts o servidores locales MLX, puede generar parches, resumir diffs o clasificar fallos de build con llamadas a herramientas.
- Analisis de capturas e imagenes tecnicas: al conservar el tower de vision en bf16, admite diagramas de arquitectura, capturas de errores o mockups como entrada para explicar o generar codigo asociado.
- Prototipado de agentes multi-paso en portatiles: la cabeza MTP permite decodificacion especulativa en el mismo modelo, lo que acelera la generacion en tareas de agente con muchas llamadas cortas.
- Evaluacion e investigacion de cuantizacion extrema: util para estudiar el impacto de 2,5 bits en tareas de razonamiento y codigo, con la receta LayerFit y las metricas de coincidencia top-1 y KL publicadas como referencia.
- Asistente personal offline con privacidad: al ejecutarse completamente en local en Apple Silicon, permite procesar codigo o documentos sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Tool call y coding (3 pruebas) | 3/3 (pass) |
| Thinking (2 pruebas) | 2/2 (pass) |
| Entrada de imagen | mismo tower de vision que el build de 4 bits (verificado alli) |
| Coincidencia top-1 con bf16 (LayerFit 2,5 bits) | 83,3 % |
| Coincidencia top-1 con bf16 (2,5 bits estandar) | 76,2 % |
| Divergencia KL (LayerFit 2,5 bits) | 0,1865 |
| Divergencia KL (2,5 bits estandar) | 0,3827 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar del modelo base; la model card remite a la del modelo harness-hub/Qwen3.8-27B-opencode-adapted para los resultados del publicador original.

## Requisitos de hardware

- VRAM/memoria unificada: 11,5 GB de pesos; el autor recomienda Macs de 16 GB como caso "stretch", dejando margen para macOS y prompts largos (el autor indica que la descarga debe ser como maximo el 60 % de la memoria).
- Para 16 GB: build de 2 bits (9,1 GB, solo texto) o este build de 2,5 bits (11,5 GB) con `sudo sysctl iogpu.wired_limit_mb=12800`.
- Para 24 GB: build de 3 bits (13,1 GB). Para 32 GB: build de 4 bits (16,5 GB). Para 48 GB o mas: builds de 6 y 8 bits.
- GPU: exclusivamente Apple Silicon (MLX); no esta pensado para CUDA. No se indican GPU NVIDIA recomendadas.
- Despliegue: mlx-lm (texto), mlx-vlm (texto e imagen), LM Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa con MTP puede reducir el tiempo por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 2,5 bits) | 27,8 B | 262K | 2,5 bits MLX | Apache-2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit | 27,8 B | 262K | 2 bits MLX | Apache-2.0 | Hugging Face, MLX (9,1 GB, solo texto) |
| Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit | 27,8 B | 262K | 4 bits MLX | Apache-2.0 | Hugging Face, MLX (16,5 GB) |
| harness-hub/Qwen3.8-27B-opencode-adapted (base) | 27,8 B | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits introduce degradacion respecto a bf16: la coincidencia top-1 es del 83,3 %, de modo que aproximadamente una de cada seis predicciones difiere del modelo original en el harness del autor.
- El caso de 16 GB es "stretch": requiere cerrar aplicaciones, limitar los prompts a unos pocos miles de tokens y ajustar el limite de memoria wired del GPU; los prompts largos cercanos a 262K no son viables en ese hardware.
- No se detalla la lista de idiomas soportados; el rendimiento fuera del ingles no esta verificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la model card; en tareas de codigo conviene validar la salida con tests.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el fichero NOTICE; LayerFit es una marca registrada de NetProjects y el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.
- Dependencia del ecosistema MLX y de Apple Silicon: no hay pesos GGUF ni soporte CUDA en esta publicacion, lo que limita el despliegue en servidores con GPU NVIDIA.
- El modelo es una adaptacion de terceros (harness-hub) sobre Qwen3.8-27B; la calidad final depende de esa adaptacion, cuyos detalles de entrenamiento no se documentan aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
