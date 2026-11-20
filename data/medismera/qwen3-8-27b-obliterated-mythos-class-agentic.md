# medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic

## Resumen

Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic es un ajuste fino publicado por el usuario medismera sobre el checkpoint abliterado OBLITERATUS/Qwen3.8-27B-OBLITERATED, que a su vez deriva del modelo base Qwen/Qwen3.8-27B. El modelo conserva la arquitectura del original (etiquetada como qwen3_5, con menciones a mamba y linear-attention en los tags) y se distribuye en formato safetensors con licencia Apache 2.0. Cuenta con 27.781.427.952 parametros totales y un repositorio de 233,6 GB, lo que refleja la presencia de multiples ramas de cuantizacion (BF16, FP8 y AWQ).

El proposito declarado de esta version es corregir defectos del checkpoint upstream en el ambito de agentes: plantilla de chat truncada, fallo en la resolucion de llamadas a herramientas y bucles infinitos de cadena de pensamiento. Para ello inyecta una plantilla Jinja2 canonica de 9,4 KB con 22 rutas de resolucion de tool calling, un protocolo de autorrevision adversarial denominado Mythos-Class y un motor de descomposicion jerarquica de tareas. Ademas amplia la ventana de contexto hasta 131.072 tokens en produccion (con hasta 262.144 teoricos) y el limite de generacion por turno a 16.384 tokens.

Es relevante ahora porque combina tres demandas actuales del ecosistema open source: modelos sin censura (abliterated), soporte nativo de function calling para frameworks agenticos (Hermes Agent, Aider, OpenCode) y despliegue eficiente en una sola GPU de 24 GB mediante la rama AWQ. No obstante, conviene tratar las afirmaciones de la model card con cautela: no se aportan resultados de benchmarks ni detalles verificables sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.8 (tag qwen3_5; los tags mencionan mamba y linear-attention, sin detalle verificable) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens probados en produccion; hasta 262.144 teoricos segun la model card |
| Tipos de cuantizacion | BF16 (completa), FP8, AWQ 4-bit (ramas `main`, `fp8`, `awq`) |
| Idiomas soportados | en, zh, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (29 shards en BF16; 2 en FP8); no se ofrece GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se indica `qwen3_5` como arquitectura en transformers y se añaden los tags `mamba` y `linear-attention`, lo que sugiere una posible hibridacion entre atencion clasica y mecanismos de estado recurrente, pero no se aporta confirmacion tecnica ni configuracion de capas. El modelo es multimodal de entrada (pipeline `image-text-to-text` en los tags), aunque la model card lo presenta como `text-generation` y no describe el codificador visual ni el entrenamiento multimodal.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o alguna fase de alineacion. Lo que si se documenta es el trabajo de post-procesado: sustitucion de la plantilla de chat upstream (un stub truncado de 506 bytes) por una plantilla Jinja2 de 9,4 KB con 22 rutas de resolucion de tool calling, correccion de los tags de razonamiento invertidos y sujecion del sampling (temperatura 0,65, repetition penalty 1,15, presence penalty 0,15) para mitigar los bucles de CoT. El protocolo Mythos-Class se incrusta en la propia plantilla de tokenizacion, no como un ajuste de pesos, de modo que el comportamiento agentico depende en gran medida del prompt de sistema embebido.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens en produccion.
- Razonamiento con modo thinking (`<think>...</think>`) y protocolo de autorrevision adversarial que fuerza la verificacion de hipotesis antes de cerrar el bloque de pensamiento.
- Descomposicion jerarquica de tareas en arboles dirigidos (analisis, verificacion, implementacion) para flujos agenticos de varios pasos.
- Tool calling y function calling nativos, con soporte declarado para Hermes Agent, Aider y OpenCode, y parsers `qwen3_coder` y `hermes` en SGLang y vLLM respectivamente.
- Generacion de codigo y tareas de ingenieria (los tags incluyen `coding` y `reasoning`).
- Capacidad multimodal de entrada segun los tags (`image-text-to-text`), sin documentacion adicional en la model card.
- Multilinguee limitado a ingles, chino y arabe.
- Ausencia de censura por el proceso de abliteration del checkpoint base.

## Casos de uso

- Agentes de automatizacion de terminal: el modelo puede encadenar llamadas a herramientas (`terminal`, `read_file`, `write_file`) siguiendo el arbol de tareas embebido, lo que encaja en pipelines de operaciones o scripting iterativo donde se necesita planificar, ejecutar y validar en pasos separados.
- Asistencia de programacion en IDE: con la plantilla corregida y el parser `qwen3_coder`, puede integrarse en Aider u OpenCode para refactorizaciones multiarchivo, manteniendo el contexto del repositorio gracias a la ventana de 128K tokens.
- Analisis de documentos largos en ingles, chino o arabe: informes, contratos o expedientes de decenas de miles de tokens caben en una sola pasada, con resumen y extraccion estructurada en el mismo turno.
- Investigacion de seguridad ofensiva y auditoria: la model card ilustra flujos de reconocimiento, analisis de vulnerabilidades y validacion de exploits; util en entornos de pentesting autorizado donde la ausencia de rechazos del modelo abliterado evita fricciones, aunque exige controles de uso.
- Atencion al cliente multilinguee en mercados de Oriente Medio y China: conversaciones multi-turno con contexto largo y llamadas a APIs internas (consultas de pedidos, estado de tickets) mediante function calling.
- Generacion de codigo en produccion con CI/CD: el limite de 16.384 tokens por turno permite emitir modulos completos o parches extensos en una sola respuesta, reduciendo la orquestacion de llamadas encadenadas.
- Prototipado de pipelines agenticos en una sola GPU de 24 GB: la rama AWQ permite levantar un servidor compatible con OpenAI (vLLM o SGLang) en una RTX 4090 para pruebas de integracion antes de escalar a FP8 o BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; unicamente describe mejoras funcionales cualitativas (tool calling nativo, contexto ampliado, ausencia de bucles de CoT).

## Requisitos de hardware

- BF16 (rama `main`): aproximadamente 60 GB de VRAM; requiere 2x A100, 2x RTX 4090, H100 o configuracion tensor-parallel equivalente. El repositorio ocupa 233,6 GB por la suma de todas las ramas.
- FP8 (rama `fp8`): aproximadamente 30 GB de VRAM; cabe en 1x A100 (40 o 80 GB) o en 2x RTX 3090/4090.
- AWQ 4-bit (rama `awq`): aproximadamente 16 GB de VRAM; cabe en una sola GPU consumer de 24 GB (RTX 3090, RTX 4090, A5000).
- Motores de despliegue soportados: SGLang (recomendado por RadixAttention para agentes), vLLM (API compatible con OpenAI, `--enable-auto-tool-choice --tool-call-parser hermes`), TGI y TRT-LLM segun la model card. No se distribuye GGUF, por lo que llama.cpp y Ollama no estan soportados de forma nativa.
- Recomendaciones de sampling indicadas: temperatura 0,65, repetition penalty 1,15, presence penalty 0,15; KV cache en `fp8_e5m2`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic | 27,78 B | 128K (262K teoricos) | Apache 2.0 | safetensors (BF16/FP8/AWQ) | Tool calling corregido, plantilla 9,4 KB, protocolo Mythos |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (upstream) | 27,78 B | 32K nativos | Apache 2.0 (segun herencia) | safetensors | Plantilla truncada, tool calling roto, bucles de CoT documentados |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible en la informacion | Apache 2.0 | safetensors | Modelo original alineado, con rechazos de seguridad |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparacion se limita a parametros, contexto, licencia y funcionalidad declarada.

## Limitaciones y advertencias

- La model card es autorreportada y no incluye evaluaciones independientes; las afirmaciones sobre correccion del tool calling y eliminacion de bucles no estan verificadas con benchmarks publicos.
- El proceso de abliteration elimina los rechazos de seguridad del modelo base: puede producir contenido danino, instrucciones peligrosas o codigo de exploits sin filtros. Requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion no medido; al no haber datos de evaluacion, no puede acotarse.
- Cobertura linguistica limitada a ingles, chino y arabe; el castellano no figura entre los idiomas soportados y el rendimiento en el es previsiblemente inferior.
- El comportamiento agentico depende en gran medida del prompt de sistema incrustado en la plantilla de tokenizacion; modificar la plantilla puede degradar el tool calling.
- La ventana de 262.144 tokens es teorica segun el autor; solo 131.072 estan probados en produccion, y el uso a maxima longitud incrementa mucho el consumo de KV cache.
- El repositorio de 233,6 GB incluye todas las ramas; descargar solo la revision necesaria (`fp8` o `awq`) para evitar consumo de disco desproporcionado.
- No hay soporte GGUF oficial, lo que limita el despliegue en CPU o en GPUs sin soporte de kernels AWQ/FP8.
- La fecha de creacion (2026-09-06) y el nombre del modelo base (Qwen3.8) no son verificables de forma independiente con la informacion proporcionada; conviene contrastar la procedencia antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterado puede contravenir politicas de plataformas de despliegue o normativa sectorial; revisar el cumplimiento antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Modelo base abliterado: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Discusion upstream sobre bucles de razonamiento: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/7
- Discusiones upstream sobre la plantilla truncada: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/9 y https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/14
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
