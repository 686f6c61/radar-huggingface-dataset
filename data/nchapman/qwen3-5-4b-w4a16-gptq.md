# nchapman/Qwen3.5-4B-W4A16-GPTQ

## Resumen

Qwen3.5-4B-W4A16-GPTQ es una cuantizacion INT4 del modelo Qwen/Qwen3.5-4B, publicada por el usuario nchapman y generada con la libreria llm-compressor. Se trata de una cuantizacion de solo pesos en formato W4A16 (pesos de 4 bits, activaciones de 16 bits), con tamano de grupo 128, simetria y act-order estatico, empaquetada en el formato compressed-tensors (pack-quantized). Su objetivo es reducir el modelo a 3.8 GB manteniendo una calidad practicamente identica a la version BF16, de modo que quepa comodamente en GPUs de consumo y deje espacio libre para cache KV y contextos largos.

El modelo base Qwen3.5-4B es multimodal (pipeline image-text-to-text) y cuenta con 4.539.265.536 parametros totales. Esta version cuantizada preserva en BF16 la torre de vision, la cabeza `lm_head` y el predictor MTP (usado para decodificacion especulativa), cuantizando unicamente las capas lineales del bloque de lenguaje. El resultado se sirve con vLLM mediante kernels INT4 Marlin / pack-quantized en GPUs NVIDIA Ampere o posteriores.

Su relevancia actual radica en que ofrece un modelo multimodal de ~4.500 millones de parametros con soporte nativo de tool calling y razonamiento, en un paquete de menos de 4 GB, con una perdida de calidad medida de +0,29% en perplejidad y diferencias de HumanEval dentro del margen de error. Incluye ademas una plantilla de chat corregida (froggeric/Qwen-Fixed-Chat-Templates v22.5) que soluciona problemas conocidos de bloqueo agentico y serializacion de argumentos en llamadas a herramientas. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de vision y predictor MTP; detalles del base no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (segun el ejemplo de despliegue con vLLM; contexto maximo del base no confirmado) |
| Tipos de cuantizacion | INT4 solo pesos (W4A16, GPTQ, grupo 128, simetrico, act-order estatico); torre de vision, `lm_head` y MTP en BF16 |
| Idiomas soportados | no disponible (el conjunto de calibracion es multilingue, pero no se listan idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors / pack-quantized |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de solo pesos del bloque de lenguaje del base Qwen3.5-4B. La receta aplicada es `GPTQModifier(targets="Linear", scheme="W4A16", ignore=["lm_head", "re:.*visual.*"])`, es decir, INT4 con grupo de 128 y act-order estatico, dejando sin cuantizar la cabeza de salida, la torre de vision y el predictor MTP. La calibracion se realizo con 384 conversaciones multilingues orientadas a codigo agentico y uso de herramientas, a 4096 tokens, lo que orienta la fidelidad de la cuantizacion hacia ese dominio de uso.

Segun la model card, el conjunto de calibracion se eligio mediante un A/B controlado frente a una mezcla de function calling de Hermes (HumanEval 0,832 frente a 0,805 en pass@1 muestreado), y la receta GPTQ se impuso en otro A/B de algoritmos frente a AWQ (0,791) y AutoRound (0,752) con datos de calibracion identicos. El modelo incorpora la plantilla de chat corregida de froggeric/Qwen-Fixed-Chat-Templates (v22.5), que corrige el envenenamiento por `<think>` vacio, la invalidacion de la cache KV de prefijo, los fallos de serializacion de argumentos en llamadas a herramientas y el estancamiento agentico. Las llamadas a herramientas usan el formato XML nativo y el esfuerzo de razonamiento se puede dirigir mediante `chat_template_kwargs`.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 65.536 tokens en el ejemplo de vLLM).
- Razonamiento con modo "thinking" activable; los valores por defecto de `generation_config.json` son `temperature=1.0, top_p=0.95, top_k=20, repetition_penalty=1.0` para modo pensamiento, y `temperature=0.7, top_p=0.8` para tareas sin pensamiento.
- Vision: el pipeline es image-text-to-text, por lo que procesa entradas de imagen junto a texto (torre de vision preservada en BF16).
- Tool calling / function calling nativo mediante formato XML (`--tool-call-parser qwen3_xml` en vLLM).
- Soporte agentico y de razonamiento multi-paso, reforzado por la calibracion en conversaciones de codigo agentico y la plantilla de chat corregida.
- Decodificacion especulativa: el predictor MTP se conserva sin cuantizar.
- Capacidad multilingue inferida del conjunto de calibracion, aunque no se especifican los idiomas soportados.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 65.536 tokens y solo 3,8 GB de pesos, lo que permite mantener varias sesiones simultaneas en una sola GPU.
- Agentes de codigo en produccion: con tool calling XML nativo y el parser `qwen3_xml`, se integra en pipelines de CI/CD donde el agente ejecuta herramientas, inspecciona ficheros y aplica parches, con la plantilla de chat corregida para evitar bloqueos agenticos.
- Asistente multimodal de soporte tecnico: al aceptar entrada image-text-to-text, puede interpretar capturas de pantalla, diagramas o fotografias de errores y responder con texto o llamadas a herramientas.
- Despliegue en GPU de consumo: con 3,8 GB de pesos cabe en tarjetas de 12-24 GB, dejando VRAM libre para cache KV y contextos largos o para servir varias replicas.
- Razonamiento asistido con modo pensamiento: para tareas de matematicas, analisis o planificacion donde conviene activar el modo thinking con los parametros recomendados.
- Extraccion y transformacion de datos estructurados: usando tool calling para invocar funciones de parsing o validacion sobre documentos largos.
- Prototipado e investigacion en cuantizacion: sirve como referencia de receta W4A16 GPTQ reproducible con llm-compressor para comparar con AWQ o AutoRound.

## Benchmarks y rendimiento

| Evaluacion | BF16 base | Esta cuantizacion |
|---|---|---|
| HumanEval pass@1 (n=20, temp 0,2) | 0.809 | 0.832 |
| HumanEval+ pass@1 (n=20, temp 0,2) | 0.764 | 0.781 |
| Delta de perplejidad (conjunto retenido de agente de codigo) | — | +0,29% |
| KL media (base frente a cuantizado) | — | 0.0838 |

Segun la model card, las diferencias de pass@1 muestreado frente al base estan dentro del margen de error, por lo que la cuantizacion se considera efectivamente sin perdida. En el A/B de algoritmos sobre datos de calibracion identicos, GPTQ (este modelo) obtuvo 0,832 en HumanEval, frente a 0,791 de AWQ y 0,752 de AutoRound (no se indica la metrica exacta de esas dos cifras en el texto de referencia; se presentan como resultado del A/B).

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 3,8 GB (repo de 4,0 GB) en INT4 W4A16.
- GPUs objetivo: NVIDIA Ampere o posteriores, con kernels INT4 Marlin / pack-quantized (A100, H100, A10, RTX 30xx y 40xx, entre otras).
- Cabe holgadamente en GPU de consumo: 3,8 GB de pesos dejan la mayor parte de una tarjeta de 24 GB libre para cache KV y contexto largo; tambien cabe en tarjetas de 12 GB o menos para contextos moderados.
- Despliegue recomendado con vLLM: `vllm serve nchapman/Qwen3.5-4B-W4A16-GPTQ --max-model-len 65536 --reasoning-parser qwen3 --tool-call-parser qwen3_xml`.
- Otros entornos: el formato compressed-tensors / pack-quantized esta pensado para vLLM; no se confirma compatibilidad con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Ajuste opcional en servidor: `presence_penalty=1.5` para reducir repeticiones (no es un campo de `generation_config`).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nchapman/Qwen3.5-4B-W4A16-GPTQ (este) | 4.539.265.536 | INT4 W4A16 GPTQ | 65.536 (segun ejemplo vLLM) | 0.832 | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base BF16) | 4.539.265.536 | BF16 | no disponible | 0.809 | apache-2.0 | HuggingFace |
| Variante AWQ (A/B de la model card) | 4.539.265.536 | INT4 AWQ | no disponible | 0.791 | no disponible | no disponible |
| Variante AutoRound (A/B de la model card) | 4.539.265.536 | INT4 AutoRound | no disponible | 0.752 | no disponible | no disponible |

No se dispone de comparaciones con modelos de otros desarrolladores del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion se calibro sobre conversaciones de codigo agentico y uso de herramientas; el rendimiento en otros dominios puede diferir del base.
- No se especifican los idiomas soportados, aunque el conjunto de calibracion es multilingue; conviene validar el comportamiento en el idioma objetivo antes de produccion.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion no lo elimina.
- La longitud de contexto de 65.536 tokens proviene del ejemplo de despliegue con vLLM y no se confirma como maximo del modelo base.
- Compatibilidad limitada al ecosistema vLLM con kernels Marlin / pack-quantized; no se confirma soporte en llama.cpp, Ollama o TGI.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.5-4B por si anaden restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Para tareas sin modo pensamiento se recomienda ajustar la temperatura; usar los valores de pensamiento por defecto fuera de ese modo puede degradar la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de llm-compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/
- Plantillas de chat corregidas (froggeric/Qwen-Fixed-Chat-Templates): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
