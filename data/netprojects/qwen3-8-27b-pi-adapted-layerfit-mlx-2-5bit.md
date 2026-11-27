# netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits del modelo harness-hub/Qwen3.8-27B-pi-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada al agente de programacion "pi". La publica netprojects (Paris Michalas, NetProjects) en formato MLX para Apple Silicon, aplicando una tecnica propia denominada LayerFit™: una busqueda por capa que asigna mas bits a las partes del modelo que mas degradacion sufren a baja precision, manteniendo el mismo presupuesto de tamano que una cuantizacion uniforme.

El modelo resuelve un problema concreto de despliegue: ejecutar un modelo de aproximadamente 27.800 millones de parametros en Macs de 16 GB de memoria unificada. El repositorio ocupa 11,5 GB en disco y conserva la torre de vision en bf16, el contexto de 262K tokens y la cabeza de prediccion multi-token (MTP) del modelo base, cuantizada a 4 bits. Gracias a LayerFit, el autor reporta un 83,5% de acuerdo top-1 con bf16 frente al 76,3% de una cuantizacion estandar de 2,5 bits, con un error KL un 52% menor.

Es relevante ahora porque demuestra que las tecnicas de cuantizacion no uniforme permiten llevar modelos multimodales de gran tamano a hardware de consumo, manteniendo capacidades de razonamiento, tool calling y vision. La licencia es Apache-2.0, lo que facilita su uso comercial, y el formato es MLX estandar, por lo que carga con mlx-lm, mlx-vlm y LM Studio sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5, con atencion lineal en parte de las capas y cabeza de prediccion multi-token (MTP); cuantizado con LayerFit™ |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 2,5 bits (esta build); el autor ofrece tambien 2, 3, 4, 6 y 8 bits; torre de vision en bf16; cabeza MTP en 4 bits |
| Idiomas soportados | no disponible (el harness de evaluacion incluye ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-pi-adapted, una adaptacion del Qwen3.8-27B de Alibaba para el agente de programacion "pi". La arquitectura es un transformer multimodal de tipo image-text-to-text con atencion lineal en parte de sus bloques, tal como indica la model card al referirse a "every layer's MLP, attention and linear-attention blocks". Incorpora una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como draft model.

La innovacion principal de esta build es LayerFit™: en lugar de aplicar el mismo numero de bits a todas las capas, el autor mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y distribuye el presupuesto de bits donde mas ayuda. La receta de bits se encontro para el modelo base Qwen3.8-27B y se revalido sobre esta adaptacion; el archivo `layerfit-recipe.json` contiene la receta exacta. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO), por lo que ese dato queda como no disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo "thinking" (la model card reporta 2/2 en pruebas de thinking).
- Generacion de codigo, incluyendo integracion con el agente de programacion "pi".
- Tool calling y function calling (3/3 en pruebas de tool call y coding).
- Entrada de imagen: pipeline image-text-to-text con torre de vision conservada en bf16.
- Razonamiento matematico (GSM8K-50: 44/50 con thinking desactivado).
- Decodificacion especulativa mediante la cabeza MTP incluida a 4 bits.
- Capacidades multilingues: no detalladas en la informacion disponible, aunque el harness de evaluacion cubre varios idiomas.

## Casos de uso

- Asistente de programacion en local en un Mac de 16 GB: el modelo se integra con el agente "pi" y permite autocompletar, refactorizar y explicar codigo sin enviar datos a la nube, gracias a sus 11,5 GB en disco y su soporte de tool calling.
- Atencion al cliente automatizada: la ventana de 262K tokens permite gestionar conversaciones largas con historial extenso y documentacion adjunta, manteniendo coherencia a lo largo de muchos turnos.
- Analisis de documentos con imagenes: al conservar la torre de vision, puede procesar capturas, diagramas o formularios escaneados junto con texto en un mismo prompt.
- Automatizacion de pipelines de CI/CD: el soporte de tool calling y function calling permite al modelo invocar herramientas, consultar APIs y encadenar pasos multi-step en tareas de ingenieria.
- Prototipado e investigacion en Apple Silicon: sirve como banco de pruebas para estudiar el impacto de la cuantizacion no uniforme (LayerFit) frente a cuantizaciones estandar en tareas de razonamiento y codigo.
- Generacion aumentada por recuperacion (RAG) en local: el contexto de 262K tokens admite inyectar grandes volumenes de fragmentos recuperados sin truncar, util para asistentes sobre bases de conocimiento privadas.
- Evaluacion de agentes autonomos: la cabeza MTP permite acelerar la generacion en bucles de agente donde la latencia por token es critica.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 44/50 |
| Tool call y coding (3 pruebas) | 3/3 (pass) |
| Thinking (2 pruebas) | 2/2 (pass) |
| Entrada de imagen | misma torre de vision que la build de 4 bits (verificada alli) |
| Acuerdo top-1 con bf16 (LayerFit 2,5 bits) | 83,5% |
| Acuerdo top-1 con bf16 (2,5 bits estandar) | 76,3% |
| Error KL (LayerFit 2,5 bits) | 0,1842 |
| Error KL (2,5 bits estandar) | 0,3825 (52% menor con LayerFit) |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU o HumanEval para esta build concreta; el autor remite a la model card del modelo base para sus resultados propios.

## Requisitos de hardware

- Memoria: disenado para Macs de 16 GB de memoria unificada; el autor recomienda que la descarga no supere aproximadamente el 60% de la memoria del sistema.
- VRAM estimada: 11,5 GB de pesos; en Macs de 16 GB se recomienda cerrar otras aplicaciones y limitar los prompts a unos pocos miles de tokens.
- Ajuste de memoria: para la configuracion "stretch" en 16 GB, el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` (persiste hasta reiniciar).
- GPU recomendadas: Apple Silicon (M-series) con 16 GB o mas; no esta pensado para GPU NVIDIA ni CUDA.
- Opciones de despliegue: mlx-lm (texto), mlx-vlm (imagen-texto) y LM Studio; formato MLX estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP a 4 bits permite decodificacion especulativa para reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit (esta build) | 27,8B | 262K | 2,5 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit | 27,8B | 262K | 2 bits LayerFit | Apache-2.0 | Apple Silicon (MLX), solo texto |
| Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit | 27,8B | 262K | 4 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| harness-hub/Qwen3.8-27B-pi-adapted (base) | 27,8B | 262K | bf16 | Apache-2.0 | no disponible |

No se dispone en la informacion proporcionada de comparativas con modelos de otros fabricantes (por ejemplo, otras familias de 27B); ese dato queda como no disponible.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits introduce degradacion respecto a bf16: el acuerdo top-1 medido es del 83,5%, no del 100%.
- En Macs de 16 GB la build es una configuracion "stretch": requiere cerrar aplicaciones y limita la longitud practica del prompt; prompts muy largos pueden provocar problemas de memoria.
- El modelo es una adaptacion de terceros (harness-hub) sobre Qwen3.8-27B; NetProjects no esta afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.
- No se detallan sesgos conocidos ni tasas de alucinacion en la informacion disponible; como todo modelo generativo, existe riesgo de alucinacion, especialmente en modo thinking desactivado.
- Los idiomas soportados no estan documentados de forma explicita.
- La licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE por las atribuciones del modelo base y de Qwen3.8-27B.
- Solo funciona en Apple Silicon con MLX; no es desplegable en CUDA, vLLM ni TGI.
- LayerFit™ es una marca registrada de NetProjects; la receta de cuantizacion esta en `layerfit-recipe.json` y conviene revisarla antes de reproducir el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
