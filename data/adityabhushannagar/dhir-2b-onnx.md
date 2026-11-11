# adityabhushannagar/Dhir-2B-ONNX

## Resumen

Dhir-2B-ONNX es la exportación a formato ONNX del modelo Dhir-2B, desarrollado por ZenteiQ AiTech Innovations dentro de la familia BrahmAI y publicado bajo licencia Apache 2.0. El modelo base es un transformer decoder de 2.000 millones de parámetros orientado a generación de texto conversacional y tool calling, con especial énfasis en idiomas índicos. Esta versión ONNX, mantenida por adityabhushannagar, permite ejecutar el modelo sin PyTorch, sin `transformers` y sin `trust_remote_code`, únicamente con ONNX Runtime, lo que simplifica el despliegue en entornos de producción y en CPU.

El repositorio ofrece cuatro variantes de cuantización (q4, mixed, q8 y fp32) con distintos compromisos entre tamaño y fidelidad respecto al modelo original. La variante más pequeña, q4, ocupa 1,84 GB y alcanza 13,0 tokens por segundo en decodificación de un solo flujo sobre CPU de 4 vCPU, mientras que la variante fp32 (8,12 GB) reproduce el modelo original con una diferencia máxima de logits de 4e-4. La fidelidad se documenta de forma explícita mediante métricas de top-1 y divergencia KL sobre 49 pasos de decodificación con prompts en inglés e hindi.

La relevancia de esta ficha radica en que cubre un hueco poco habitual: un modelo de 2B con soporte nativo de tool calling y diez idiomas índicos, empaquetado para inferencia en CPU sin dependencias pesadas. El contexto de 131.072 tokens (deducido de la forma de los logits en el grafo) y el vocabulario de 131.072 entradas lo sitúan en un rango útil para aplicaciones de agentes y asistentes multilingües en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con KV cache (28 capas, 8 cabezas KV, dimensión de cabeza 128) |
| Parametros totales | 2.000 millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (dimensión de salida de logits `[batch, seq, 131072]`) |
| Tipos de cuantizacion | int4 (q4), mixta int8/int4 (mixed), int8 (q8), float32 (fp32) |
| Idiomas soportados | en, hi, gu, bn, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con `com.microsoft.MatMulNBits` para capas cuantizadas; fp32 usa operadores ONNX estándar) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder estándar con atención multi-cabeza y caché KV, exportado a ONNX con los mismos nombres de entrada y salida que los exports de Optimum y transformers.js: `input_ids`, `attention_mask`, `position_ids`, `past_key_values.{i}.key/value` y `present.{i}.key/value`, con logits de salida de forma `[batch, seq, 131072]`. La exportación consta de 28 capas con 8 cabezas KV de dimensión 128, lo que da una dimensión oculta de 1024 por cabeza y un total coherente con un modelo de 2B. El grafo usa `com.microsoft.MatMulNBits` para las capas lineales cuantizadas y operadores ONNX estándar en la variante fp32.

La cuantización es round-to-nearest con tamaño de bloque 32 (MatMulNBits asimétrico). En todas las variantes cuantizadas la tabla de embeddings se almacena en fp16, mientras que las normas y la caché KV permanecen en fp32. La variante `mixed` aplica 8 bits a todas las proyecciones de atención, al `lm_head` y a la MLP de la primera y última capa, y 4 bits al resto de pesos MLP. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card remite a la ficha de Dhir-2B para esos detalles.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`<|user|>`, `<|assistant|>`, `<|end_of_turn|>`, `<|nothink|>`).
- Tool calling y function calling nativo: el modelo emite llamadas en formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` y acepta respuestas de herramientas en el rol `tool`.
- Soporte multilingüe en diez idiomas: inglés, hindi, guyaratí, bengalí, canarés, malabar, maratí, oriya, panyabí y tamil.
- Modo de razonamiento controlable mediante el token `<|nothink|>` en la plantilla de chat.
- Tokenización compatible con `PreTrainedTokenizerFast` de `transformers` sin necesidad de código remoto.
- Inferencia sin PyTorch ni `transformers`: el grafo ONNX se ejecuta directamente con ONNX Runtime en CPU.
- Renderizado de plantilla de chat token a token idéntico a `tokenizer.apply_chat_template` mediante el método `DhirONNX.render()`.

## Casos de uso

- Asistentes conversacionales multilingües en CPU: el modelo puede gestionar diálogos multi-turno en hindi, tamil o bengalí con una ventana de 131.072 tokens, desplegado en servidores sin GPU gracias a la variante q4 (1,84 GB, 13 tok/s en 4 vCPU).
- Agentes con tool calling en producción: la plantilla nativa de llamadas a funciones permite integrar el modelo en orquestadores de agentes que necesiten consultar APIs (meteorología, bases de datos, calendarios) sin post-procesado adicional.
- Atención al cliente automatizada en India: la cobertura de diez idiomas índicos y el inglés permite atender consultas en la lengua del usuario con un único modelo de 2B, reduciendo costes frente a soluciones multilingües de mayor tamaño.
- Generación de texto en dispositivos de borde: la variante q4 con embeddings en fp16 y caché KV en fp32 cabe en entornos con poca memoria y no requiere acelerador hardware, lo que facilita su despliegue en mini-PC o contenedores ligeros.
- Procesamiento de documentos largos: el contexto de 131.072 tokens permite resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, con la variante q8 si se requiere fidelidad casi sin pérdidas (KL 0,0018).
- Prototipado rápido de pipelines de IA: la ausencia de dependencias de PyTorch y `trust_remote_code` simplifica la integración en entornos con restricciones de seguridad, permitiendo validar flujos de tool calling antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: las cuatro variantes con métricas de fidelidad documentadas (top-1 y KL) permiten medir el impacto de la cuantización en tareas concretas antes de elegir el compromiso tamaño/calidad adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona métricas de fidelidad de la cuantización respecto al modelo original en fp32, medidas con teacher forcing sobre un lote de dos prompts largos (inglés e hindi) durante 49 pasos de decodificación con caché KV:

| Variante | Tamano | Top-1 (pasos coincidentes) | KL medio | Velocidad CPU (tok/s) |
|---|---|---|---|---|
| q4 | 1,84 GB | 83/98 | 0,130 | 13,0 |
| mixed | 2,21 GB | 87/98 | 0,068 | 11,4 |
| q8 | 2,89 GB | 97/98 | 0,0018 | 10,5 |
| fp32 | 8,12 GB | 50/50 (exacto, diff ≤ 4e-4) | 0 | 3,0 |

Las velocidades corresponden a decodificación de un solo flujo en CPU de 4 vCPU con onnxruntime 1.31.1 y 64 tokens nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, la variante q4 requeriría aproximadamente 2 GB, mixed 2,5 GB, q8 3 GB y fp32 8,5 GB, sin contar la caché KV (fp32, 8 cabezas × 128 dimensiones × 28 capas).
- GPU recomendadas: cualquier GPU con al menos 4 GB para q4/mixed (RTX 3050, GTX 1660, T4); para fp32 se recomienda al menos 12 GB (RTX 3060 12 GB, RTX 4070, A10).
- Cabe en GPU de consumo: sí, las variantes q4, mixed y q8 caben en GPUs de gama media y baja; fp32 requiere una GPU de gama media-alta.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), con el script `generate_onnx.py` incluido en el repositorio; compatible con tokenizadores de `transformers` y con el bucle crudo de ONNX Runtime en cualquier lenguaje.
- Latencia y throughput: 13,0 tok/s (q4), 11,4 tok/s (mixed), 10,5 tok/s (q8) y 3,0 tok/s (fp32) en CPU de 4 vCPU con onnxruntime 1.31.1; no se han publicado cifras para GPU.
- Nota de despliegue: las versiones recientes de onnxruntime (por ejemplo, 1.31) rechazan los pesos externos a los que se accede mediante enlaces simbólicos de la caché de Hugging Face; es necesario usar `--local-dir`/`local_dir` al descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Dhir-2B-ONNX | 2B | 131.072 | 10 (índicos + inglés) | Apache 2.0 | ONNX (int4/int8/fp32) | Tool calling nativo, sin PyTorch |
| Dhir-2B (original) | 2B | no disponible | 10 (índicos + inglés) | Apache 2.0 | safetensors (PyTorch) | Requiere `transformers` y `trust_remote_code` |
| Qwen2.5-1.5B | 1,5B | 32.768 | multilingüe amplio | Apache 2.0 | safetensors, GGUF | Sin soporte específico de idiomas índicos |
| Gemma-2-2B | 2B | 8.192 | multilingüe | Gemma license | safetensors, GGUF | Contexto menor, licencia restrictiva |

La comparativa se limita a modelos de tamaño similar ampliamente conocidos; no se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo; se desconoce su comportamiento en dominios especializados.
- El riesgo de alucinación es inherente a los modelos de 2B y no está cuantificado en la model card; se recomienda validación humana en aplicaciones críticas.
- La cobertura lingüística se limita a los diez idiomas declarados; el rendimiento en otros idiomas no está documentado.
- La cuantización q4 degrada la fidelidad (top-1 83/98, KL 0,130); para tareas sensibles a la calidad se recomienda q8 o fp32.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución a los autores originales (ZenteiQ AiTech Innovations, familia BrahmAI).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Las versiones recientes de onnxruntime requieren descarga con `local_dir` para evitar errores con pesos externos; esto complica despliegues automatizados basados en la caché de Hugging Face.
- No se dispone de información sobre el proceso de entrenamiento, datos utilizados ni técnicas de alineación del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adityabhushannagar/Dhir-2B-ONNX)
- [Modelo base Dhir-2B](https://huggingface.co/adityabhushannagar/Dhir-2B)
- [ONNX Runtime](https://onnxruntime.ai)
- [Script de generación `generate_onnx.py`](https://huggingface.co/adityabhushannagar/Dhir-2B-ONNX/blob/main/generate_onnx.py)
- [Documentación de MatMulNBits en ONNX Runtime](https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html)
