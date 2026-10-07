# AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX Safetensors para Apple Silicon, publicado por AutomatosX y derivado directamente del modelo BF16 de origen. La arquitectura declarada es `Qwen3_5MoeForConditionalGeneration`, un transformer de mezcla de expertos (MoE) con 35,11B de parametros logicos en la ruta de texto, una torre de vision y una cabeza de prediccion multi-token (MTP). El modelo base del que se convierte es `peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP`, revision `a443d4e30fd5228942cb7695f916f4b14a88fae9`.

El paquete aplica la receta propietaria AXQuant (AXQ) en modo mixto: la ruta de texto queda cuantizada con una mezcla de asignaciones `4bit`, `8bit`, `bf16`, `affine` y `mxfp4` (grupos de 32 y 64), mientras que la cabeza MTP y la torre de vision se preservan en BF16 como sidecars. El resultado medido es de 4,6342 bits por peso (BPW) en el modelo principal y 4,9013 BPW si se incluye la MTP, con un peso Safetensors de 22,03 GB y una descarga completa aproximada de 22,05 GB.

Su relevancia es acotada pero clara: es una de las pocas distribuciones publicas de un MoE de ~35B con vision y MTP ya empaquetada para MLX, con licencia Apache-2.0, lo que facilita probar flujos de decodificacion especulativa y multimodalidad local en equipos Apple Silicon sin GPU dedicada. Ahora bien, la propia model card insiste en que se trata de evidencia de desarrollo: no publica resultados de calidad, de contexto largo, de velocidad de kernel ni de exactitud de la MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration`, mezcla de expertos (MoE) con torre de vision y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 34.660.608.768 (~34,66B) contabilizados en los Safetensors; la model card declara 35,11B de parametros logicos en el modelo principal |
| Parametros activos | No confirmado en la model card; la nomenclatura A3B del nombre implica del orden de 3.000 millones de parametros activos por token |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada disponible |
| Tipos de cuantizacion | AXQuant 1.9.0 en precision mixta: `affine`, `bf16`, `mxfp4`; niveles `4bit` (33,62B, 93,52%), `8bit` (529,61M, 1,47%) y `bf16` (1,80B, 5,01%); grupos de 32 y 64. BPW medido del modelo principal: 4,6342; BPW total con MTP: 4,9013 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |
| Autor | AutomatosX |
| Modelo base | peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (revision `a443d4e30fd5228942cb7695f916f4b14a88fae9`) |
| Biblioteca | mlx |
| Sidecars | MTP: 785 tensores, 844,64M de parametros, 1,69 GB en BF16. Vision: 333 tensores, 446,57M de parametros, 0,89 GB en BF16 |
| Audio | No presente |
| Tamano declarado | 22,03 GB de pesos Safetensors; ~22,05 GB de descarga completa (el repositorio en el Hub figura con 41,5 GB, discrepancia no explicada en la informacion disponible) |
| Fechas | Creado el 19/09/2026; actualizado el 06/10/2026 |
| Descargas / likes | 907 descargas, 0 likes |

## Arquitectura y entrenamiento

La model card identifica la arquitectura de origen como `Qwen3_5MoeForConditionalGeneration`, es decir, un transformer con capas de mezcla de expertos en lugar de capas densas de alimentacion hacia delante. Sobre esa columna vertebral se anaden dos componentes diferenciados: una cabeza de prediccion multi-token (MTP), orientada a generar varios tokens por paso para decodificacion especulativa, y una torre de vision que habilita entrada de imagenes. La model card no detalla el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de capas ni el tipo de atencion empleado.

El proceso de conversion aplicado es una cuantizacion de precision mixta con la herramienta AXQuant 1.9.0 sobre el modelo BF16 de origen, con alcance de optimizacion limitado a la ruta de texto. Los tensores de la ruta de texto se cuantizan con asignaciones de 4 y 8 bits, mientras que la cabeza MTP y la torre de vision se mantienen en BF16, ya sea dentro del checkpoint o en sidecars vinculados. La model card advierte de forma explicita que los nombres de los packs AXQ describen una clase de presupuesto de almacenamiento, no una precision uniforme: los tensores protegidos conservan mayor precision, por lo que el BPW medido es el dato autoritativo. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de datos ni sobre etapas de RLHF, DPO u otro tipo de ajuste por preferencias.

## Capacidades

- Generacion de texto y modo conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Enfasis en codigo y desarrollo: la familia y el nombre del modelo apuntan a tareas de programacion (`development`, `Coder`), aunque no se aportan datos de evaluacion que lo cuantifiquen.
- Contexto largo: ventana configurada de 262.144 tokens, sujeta a la memoria unificada del equipo.
- Vision: el paquete incluye torre de vision en BF16 (333 tensores, 446,57M de parametros). La model card advierte de que la presencia del sidecar no establece por si misma calidad en tareas vision-lenguaje.
- Prediccion multi-token (MTP): presente en el checkpoint. La model card indica que MLX-LM puede ignorar los metadatos y sidecars de AXQuant, por lo que usar el comando estandar no implica aceleracion por MTP.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no disponible; no se declara lista de idiomas.
- Audio: no soportado (`Audio present: False`).

## Casos de uso

- Asistente de programacion local en Apple Silicon: el modelo cabe en equipos con memoria unificada suficiente y se ejecuta con MLX-LM, lo que permite autocompletado y generacion de codigo sin enviar el codigo fuente a servicios externos.
- Analisis de repositorios completos: con 262.144 tokens de contexto configurado, es viable cargar varios ficheros de un proyecto en una sola pasada para tareas de resumen, busqueda de dependencias o revision cruzada, siempre que la memoria del equipo lo permita.
- Revision de codigo en preproduccion: se puede integrar en un script que alimente diffs y ficheros de contexto al modelo mediante `mlx_lm.generate` y devuelva comentarios estructurados, como paso previo a la revision humana.
- Investigacion en decodificacion especulativa: la presencia de una cabeza MTP en BF16 convierte este checkpoint en material de partida para experimentos sobre prediccion multi-token, asumiendo que la model card no certifica exactitud ni aceleracion.
- Experimentacion multimodal en local: la torre de vision empaquetada permite probar flujos de imagen mas texto en un Mac, con la cautela de que la calidad vision-lenguaje no esta validada en esta release.
- Estudio de cuantizacion de precision mixta: el desglose publicado (93,52% en 4 bits, 1,47% en 8 bits, 5,01% en BF16) sirve como caso de estudio reproducible para comparar estrategias de proteccion de tensores frente a los hermanos de 4 y 6 bits.
- Base para despliegue interno con requisitos de privacidad: al ser un formato MLX ejecutable en local y con licencia Apache 2.0, encaja en entornos donde no se permite salida de datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica expresamente que el paquete no publica evidencia medida de calidad, de contexto largo, de velocidad de kernel ni de velocidad de MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. Los unicos datos cuantitativos publicados son de formato y tamano: 4,6342 BPW en el modelo principal, 4,9013 BPW total con la MTP y 22,03 GB de pesos Safetensors.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. El paquete contiene pesos MLX Safetensors y no incluye pesos PyTorch ni GGUF, por lo que no se ejecuta directamente en CUDA.
- Memoria unificada estimada: como minimo unos 24-32 GB para cubrir los 22,05 GB de pesos mas la cache KV y el overhead del runtime. Para contexto largo (decenas o cientos de miles de tokens) conviene partir de 64 GB, y 128 GB o mas para acercarse al maximo configurado de 262.144 tokens. Son estimaciones de ingenieria, no datos publicados por el autor.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este artefacto tal cual; requeririan una conversion previa a otro formato, no incluida en el repositorio.
- Despliegue: MLX-LM (`mlx_lm.generate`, y por extension el servidor de MLX-LM). El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversion.
- AX Engine: la model card indica que no se incluye un `model-manifest.json` nativo validado, por lo que la ejecucion en AX Engine no queda establecida por esta release, pese a que el artefacto registre la version 7.5.7.
- Alternativas de despliegue no disponibles: vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato sin conversion.
- Latencia y throughput: no disponibles. La model card no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP (este) | 34,66B en Safetensors (35,11B logicos) | 262.144 tokens | AXQ mixta, 4,9013 BPW total | Apache 2.0 | MLX / Apple Silicon |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP | No disponible | No disponible | Presupuesto AXQ inferior; BPW exacto no publicado | Apache 2.0 (segun el modelo analizado) | MLX / Apple Silicon |
| AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP | No disponible | No disponible | Precision media mas alta, cerca del presupuesto de 6 BPW | Apache 2.0 (segun el modelo analizado) | MLX / Apple Silicon |
| peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (base) | No disponible | No disponible | oQ6e, anterior a la conversion AXQ | No disponible | MLX / Apple Silicon |

No se dispone de resultados de benchmarks que permitan comparar este modelo con alternativas externas de la misma categoria (por ejemplo, otros MoE de ~30B orientados a codigo). Cualquier comparacion de rendimiento seria especulativa y no se incluye.

## Limitaciones y advertencias

- Naturaleza de la release: la model card la califica explicitamente como evidencia de desarrollo y no como una release AXQuant certificada. Incluye registros de conversion e integridad de artefactos, pero ninguna medicion de calidad.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. No es posible estimar su rendimiento relativo.
- MTP no garantizada: aunque los sidecars esten presentes, la model card afirma que MLX-LM puede ignorar los metadatos AXQuant y los sidecars, de modo que el comando estandar de MLX-LM no establece aceleracion ni exactitud de la MTP.
- Vision no validada: la torre de vision esta empaquetada en BF16, pero la documentacion insiste en que su presencia no acredita calidad vision-lenguaje.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento multilingue es desconocido.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero se trata de un modelo generativo sin evaluacion publicada de fidelidad.
- Contexto largo condicionado: los 262.144 tokens son un maximo configurado; el limite real depende de la memoria unificada del equipo.
- Discrepancia de tamano: la model card declara 22,05 GB de descarga completa, mientras que el repositorio figura con 41,5 GB en los metadatos del Hub. Conviene verificar el contenido real antes de planificar el almacenamiento.
- Formato cerrado a MLX: la ausencia de pesos PyTorch y GGUF limita el despliegue a Apple Silicon o a conversiones propias no incluidas.
- AX Engine no establecido: no hay manifiesto nativo validado, por lo que no se debe asumir compatibilidad de ejecucion con AX Engine.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base del que deriva, cuya licencia no se detalla en la informacion proporcionada.
- Reproducibilidad: la model card recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/a443d4e30fd5228942cb7695f916f4b14a88fae9
- Hermano de 4 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-4bit-MTP
- Hermano de 6 bits: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Registro de auditoria de formato en tiempo de ejecucion: https://huggingface.co/AutomatosX/AX-Cyber-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP/blob/main/runtime_audit.json
