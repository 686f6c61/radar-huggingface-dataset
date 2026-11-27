# netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2bit

## Resumen

Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2bit es una cuantizacion de 2 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-think-pi-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada al agente de programacion "pi" con el modo de razonamiento (thinking) activado. La publica netprojects (Paris Michalas), un tercero no afiliado al editor original, y su proposito es hacer viable un modelo de 27.320 millones de parametros en Macs de 16 GB de memoria unificada, algo imposible con cuantizaciones convencionales de ese tamano.

La innovacion central es LayerFit, una busqueda por capas que asigna mas bits a las partes del modelo que mas sufren con la cuantizacion agresiva (bloques MLP, atencion, atencion lineal, embeddings y cabeza de salida) manteniendo el mismo presupuesto total de tamano. Segun el autor, esto eleva la coincidencia top-1 con el modelo bf16 del 68,1 % al 76,6 % y reduce la divergencia KL un 46 % frente a una cuantizacion estandar de 2 bits del mismo tamano.

El resultado ocupa 9,3 GB en disco, conserva la torre de vision en bf16 y empaqueta la cabeza de prediccion multi-token (MTP) del modelo base en 4 bits para acelerar la decodificacion. Es un modelo multimodal image-text-to-text con arquitectura Qwen3.5, pensado para inferencia local en Apple Silicon mediante mlx-lm, mlx-vlm y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 multimodal (image-text-to-text) con atencion lineal, torre de vision y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits con receta LayerFit por capas; torre de vision en bf16; cabeza MTP en 4 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas, sin listado oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 9,4 GB; 9,3 GB en disco) |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.5 de 27.320 millones de parametros con capacidad multimodal (entrada de imagen y texto) y modo de razonamiento explicito. La model card cita atencion lineal entre los bloques que LayerFit analiza de forma individual, junto con MLP, atencion y embeddings, lo que sugiere una arquitectura hibrida con capas de atencion lineal y completa. Incluye una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como draft model.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO: la model card de esta cuantizacion no los detalla y remite a la del modelo base. La innovacion tecnica documentada es LayerFit: una busqueda por capas que mide la degradacion de cada bloque a baja precision y distribuye el presupuesto de bits de forma no uniforme. La receta exacta esta en `layerfit-recipe.json` dentro del repositorio. El harness de evaluacion del autor cubre solo pesos de lenguaje, comparando contra su propia build bf16 del modelo base, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado (la variante "think" del modelo base).
- Generacion y comprension de codigo, orientada al agente de programacion "pi".
- Matematicas: la model card reporta 43/50 en GSM8K-50 con thinking desactivado.
- Tool calling / function calling: la model card reporta "pass" en una prueba de 3/3 de codigo con tool call.
- Entrada de imagen (image-text-to-text) mediante la torre de vision conservada en bf16.
- Decodificacion especulativa mediante la cabeza MTP en 4 bits, con el propio modelo como draft model.
- Capacidades multilingues: no documentadas formalmente; el harness de evaluacion incluye pasajes en otros idiomas ademas del ingles.
- Razonamiento multi-paso: implicito en el modo thinking, sin detalle de soporte de agentes en la informacion disponible.

## Casos de uso

- Asistencia de programacion en local en un Mac de 16 GB: el modelo esta adaptado al agente "pi" con thinking activo, de modo que puede resolver tareas de edicion de codigo y llamadas a herramientas sin salir del portatil, algo que un modelo de 27B en bf16 no permite en ese hardware.
- Prototipado de agentes con tool calling: la model card verifica tool calls, por lo que sirve para probar flujos de function calling y pipelines de agente en local antes de desplegar en infraestructura mayor.
- Razonamiento matematico de nivel escolar y competicion ligera: con 43/50 en GSM8K-50 sin thinking, es adecuado para validar cadenas de razonamiento y como baseline en experimentos de evaluacion.
- Descripcion y analisis de imagenes en local: al conservar la torre de vision en bf16, permite tareas image-text-to-text (descripcion, extraccion de informacion de capturas o diagramas) en Apple Silicon sin conexion.
- Generacion de codigo asistida con decodificacion acelerada: el uso de la cabeza MTP como draft model reduce la latencia en la generacion de funciones y scripts, util en iteracion interactiva.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye la receta LayerFit y datos de comparacion frente a cuantizacion estandar de 2 bits, lo que lo convierte en material de referencia para investigar asignacion no uniforme de bits.
- Experimentacion docente y de investigacion en hardware de consumo: permite estudiar comportamiento de modelos de 27B multimodales en un Mac de 16 GB, con la advertencia de que la fidelidad respecto a bf16 es limitada (76,6 % de coincidencia top-1).

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion (no del modelo base):

| Prueba | Resultado |
|---|---|
| Coincidencia top-1 con bf16, cuantizacion estandar 2 bits | 68,1 % |
| Coincidencia top-1 con bf16, LayerFit 2 bits | 76,6 % |
| Divergencia KL, cuantizacion estandar 2 bits | 0,6793 |
| Divergencia KL, LayerFit 2 bits | 0,3679 (46 % menor) |
| GSM8K-50, thinking off | 43/50 |
| Coding con tool call | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Entrada de imagen | misma torre de vision que la build de 4 bits (verificada alli) |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K completo u otros) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM/memoria unificada: disenado para Macs de 16 GB; el autor recomienda que la descarga no supere aproximadamente el 60 % de la memoria del sistema.
- Tamano en disco: 9,3 GB (repo de 9,4 GB).
- GPU: Apple Silicon exclusivamente (formato MLX); no es cargable en GPU NVIDIA o AMD mediante este repositorio.
- Cabe en GPU de consumo: si, en Macs de 16 GB; para 24 GB existe la build de 3 bits (13,1 GB), para 32 GB la de 4 bits (16,5 GB) y para 48 GB o mas las de 6 y 8 bits.
- Ajuste adicional: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` para la variante "stretch" de 2,5 bits, cerrando otras aplicaciones y limitando el prompt a unos miles de tokens.
- Despliegue: mlx-lm (texto), mlx-vlm (multimodal) y LM Studio; formato MLX estandar.
- Latencia y throughput: no disponibles; la cabeza MTP en 4 bits se ofrece como mecanismo de aceleracion de decodificacion, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 2-bit) | 27,32 mil millones | no disponible | 2 bits MLX, 9,3 GB | Apache-2.0 | Hugging Face, requiere Apple Silicon |
| netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-4bit | 27,32 mil millones | no disponible | 4 bits MLX, 16,5 GB | Apache-2.0 | Hugging Face, Mac de 32 GB |
| harness-hub/Qwen3.8-27B-think-pi-adapted (base) | 27,32 mil millones | no disponible | bf16 (referencia) | Apache-2.0 | Hugging Face |
| Cuantizacion estandar 2 bits del mismo modelo | 27,32 mil millones | no disponible | 2 bits uniformes | Apache-2.0 | no disponible como artefacto concreto |

La comparacion con modelos de otras familias (Llama, Mistral, Gemma) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la fidelidad: solo el 76,6 % de coincidencia top-1 con bf16 y divergencia KL de 0,3679; no es equivalente al modelo original y puede fallar en tareas sensibles a precision.
- El propio autor clasifica esta build como "text-only" en su tabla de seleccion por Mac, pese a que la torre de vision se conserva; la verificacion de imagen se hizo en la build de 4 bits, no en esta.
- Rendimiento en GSM8K medido sobre solo 50 preguntas y con thinking desactivado: muestra pequena, no representativa del rendimiento global.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Idiomas soportados no documentados oficialmente; el harness incluye otros idiomas ademas del ingles pero sin cifras por idioma.
- Longitud de contexto no disponible, lo que impide planificar cargas con prompts largos; el autor advierte que en 16 GB conviene limitar el prompt a unos miles de tokens.
- Dependencia de hardware Apple Silicon: no usable en GPU NVIDIA/AMD con este repositorio; requiere mlx-lm o mlx-vlm.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es una adaptacion de terceros no afiliada al editor original; conviene revisar LICENSE y NOTICE del repositorio y la licencia del modelo base.
- LayerFit es una marca registrada de NetProjects; la receta de bits esta en `layerfit-recipe.json` y su reutilizacion fuera del proyecto puede requerir atencion a esos terminos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
