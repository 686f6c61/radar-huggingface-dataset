# lemonade-sdk/pplx-pii-masking-onnx

## Resumen

`lemonade-sdk/pplx-pii-masking-onnx` es una exportacion a ONNX del modelo `perplexity-ai/pplx-pii-masking`, desarrollado originalmente por Perplexity y reconvertido por lemonade-sdk para inferencia en CPU mediante `onnxruntime`. El modelo subyacente es un encoder Qwen3 bidireccional de aproximadamente 600 millones de parametros, construido sobre el backbone `perplexity-ai/pplx-embed-v1-0.6b` con `use_bidirectional_attention=true`, y ajustado para la deteccion y enmascaramiento de informacion personal identificable (PII) en datos conversacionales.

Sobre ese backbone compartido se montan dos cabezas: una cabeza de clasificacion de tokens (1024 -> 37) que produce etiquetas BIOES sobre 9 categorias de PII, y una cabeza de sensibilidad (1024 -> 1) que genera una puntuacion escalar a nivel de documento. La exportacion no modifica pesos ni comportamiento: solo cambia el formato de ejecucion, manteniendo ambos cabezales como salidas nombradas (`logits` y `sensitivity_logits`) y dejando fuera del grafo el decodificador Viterbi restringido que usa el modelo original.

Su relevancia practica esta en el despliegue local: es una pieza pensada para filtrar o redactar PII antes de enviar texto a servicios en la nube, con licencia MIT, soporte de CPU y validacion de paridad de decisiones frente al checkpoint original en 20.000 documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Qwen3 bidireccional con dos cabezas sobre backbone compartido |
| Parametros totales | ~600 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (`max_seq_len`); documentos mas largos deben trocearse |
| Tipos de cuantizacion | fp32 (exportacion ONNX); no se incluyen variantes cuantizadas en el repositorio |
| Idiomas soportados | en, multilingual |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`); acompanado de `config.json`, `tokenizer.json`, `tokenizer_config.json` y `manifest.json` |
| Cabezas de salida | Token classification (1024 -> 37, BIOES) y sensitivity (1024 -> 1) |
| Categorias de PII | private_person, private_email, private_phone, private_address, private_url, private_date, account_number, secret, other_pii |
| Tamano del repositorio | 2.4 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional basado en Qwen3. El autor de la conversion indica que el codigo original (`modeling_pplx_qwen3.py`) fuerza `self_attn.is_causal = False` en todas las capas mediante `post_init()` y reconstruye una mascara bidireccional que solo considera el padding. Sobre el backbone compartido se anaden dos cabezas: la de clasificacion de tokens emite 37 logits por token (etiqueta `O` mas las 9 categorias de PII en formato BIOES) y la de sensibilidad emite un unico escalar pre-sigmoide por secuencia, calculado sobre los estados ocultos con mean-pooling. El decodificado final lo realiza un `ViterbiDecoder` restringido que vive fuera de `forward()`, en `modeling_pii_masking.py`.

En cuanto al entrenamiento, la model card de esta exportacion remite a la del modelo original: se trata de un ajuste fino de `pplx-embed-v1-0.6b` para enmascaramiento de PII en datos conversacionales. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La conversion ONNX en si no aplica ningun ajuste adicional: unicamente cambia el formato de ejecucion. La innovacion tecnica destacable de esta exportacion es la decision de exportar en fp32 en lugar de bf16, porque las operaciones bf16 generaban nodos `Where` con operandos escalares que el `CPUExecutionProvider` de `onnxruntime` no implementa, provocando un error `NOT_IMPLEMENTED` en la carga de la sesion.

## Capacidades

- Deteccion y clasificacion de PII a nivel de token en texto conversacional, con 9 categorias y esquema BIOES.
- Enmascaramiento de entidades: personas, correos electronicos, telefonos, direcciones, URLs, fechas, numeros de cuenta, secretos y categoria residual `other_pii`.
- Puntuacion de sensibilidad a nivel de documento mediante sigmoide sobre `sensitivity_logits`.
- Procesamiento de secuencias de hasta 4096 tokens por pasada.
- Soporte declarado de ingles y de contenido multilingue, aunque sin detalle de cobertura por idioma en la informacion disponible.
- Capacidad de integrarse en flujos de enrutado de peticiones, como demuestra la politica `lemonade-sdk/pii_policy_pplx-pii-masking-onnx`, que dirige prompts con PII a un modelo local y el resto a un modelo en la nube.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no esta disenado para razonamiento multi-paso ni uso agentico.

## Casos de uso

- Redaccion previa al registro: interceptar transcripciones de soporte y sustituir las entidades detectadas por marcadores antes de escribir en logs o almacenes, reduciendo la exposicion de datos personales en sistemas internos.
- Enrutado con preservacion de privacidad: usar la clasificacion de PII combinada con la puntuacion de sensibilidad para decidir si una peticion se resuelve con un modelo local o puede enviarse a un proveedor en la nube, tal como hace la politica publicada por lemonade-sdk.
- Cumplimiento normativo y auditoria: ejecutar el modelo sobre lotes de documentos para generar inventarios de categorias de PII presentes, con la ventaja de que la inferencia puede hacerse integramente en infraestructura propia.
- Preprocesado de datasets de ajuste fino: limpiar corpus conversacionales antes de publicarlos o reutilizarlos, identificando los documentos que requieren revision manual mediante la cabeza de sensibilidad.
- Anonimizacion en aplicaciones de escritorio: al ejecutarse con `onnxruntime` sobre CPU y ocupar 2.4 GB en fp32, puede integrarse en clientes locales o extensiones que necesiten filtrar texto sin enviarlo a un servidor.
- Triaje de grandes volumenes de conversaciones: la puntuacion de sensibilidad permite ordenar documentos por riesgo y priorizar la revision humana alli donde la deteccion automatica es mas dudosa.
- Analisis de calidad de datos: comparar las predicciones del modelo sobre un corpus etiquetado para estimar cobertura y deteccion de PII antes de desplegarlo en un pipeline de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si documenta una validacion de paridad numerica entre la exportacion ONNX y una pasada eager en PyTorch fp32 sobre `CPUExecutionProvider`:

| Prueba | Diferencia maxima absoluta en `logits` | Diferencia maxima absoluta en `sensitivity_logits` |
|---|---|---|
| Muestra predefinida (canned sample) | 1.5e-5 | 2e-6 |
| Documento real de 806 caracteres | 1.0e-5 | 0.0 |

Ademas, sobre 20.000 documentos con PII del dataset `nvidia/Nemotron-PII` y aplicando el `ViterbiDecoder` propio del checkpoint en ambos backends, se reporta matriz de confusion identica, 100,0000 % de acuerdo en la deteccion de presencia de PII, conjuntos de etiquetas por documento identicos y los mismos 159 documentos no detectados en ambos casos. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- Inferencia en CPU como objetivo principal, mediante `onnxruntime` con `CPUExecutionProvider`.
- Peso del modelo en fp32: aproximadamente 2.4 GB, segun el tamano del repositorio.
- Memoria recomendada: en torno a 3 GB de RAM libre para cargar la sesion y procesar secuencias de hasta 4096 tokens; la VRAM necesaria si se ejecuta en GPU seria del mismo orden.
- Cabe sin dificultad en GPUs de consumo (RTX 3060, RTX 4090, etc.), aunque la exportacion esta pensada y validada para CPU.
- Despliegue: `onnxruntime` es la via soportada explicitamente. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos o a otros formatos de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lemonade-sdk/pplx-pii-masking-onnx | ~600 M | 4096 tokens | ONNX fp32 | MIT | Exportacion para CPU con `onnxruntime`; salidas de logits crudos |
| perplexity-ai/pplx-pii-masking | ~600 M | 4096 tokens | Safetensors (PyTorch) | MIT | Modelo original; incluye el decodificador Viterbi y `predict()` completo |
| perplexity-ai/pplx-embed-v1-0.6b | ~600 M | No disponible | Safetensors | No disponible | Backbone de embeddings sobre el que se construye el modelo de PII |

No se dispone de otros modelos comparables de deteccion de PII con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede resumir, reescribir ni responder preguntas; solo etiqueta tokens y puntua sensibilidad.
- El grafo ONNX termina en los logits por token y no incluye el decodificador Viterbi restringido. Para reproducir el comportamiento de `model.predict()` hay que aplicar el decodificador propio del checkpoint o implementar uno equivalente; un decodificado por umbral simple puede dar resultados distintos.
- La entrada se trunca a 4096 tokens, por lo que los documentos largos deben trocearse y las entidades a caballo entre fragmentos pueden perderse.
- El modelo espera `input_ids` y `attention_mask` en int64. Las versiones recientes de `transformers` devuelven int32 con `return_tensors="np"`, lo que obliga a convertir explicitamente.
- El tokenizador no anade BOS ni EOS, en linea con el modelo original; asumir lo contrario alteraria las predicciones.
- `config.json` mantiene entradas `auto_map` que apuntan a `modeling_pii_masking.py`, un archivo que no se incluye en este repositorio. Los consumidores de `onnxruntime` solo necesitan `architectures` y `max_seq_len`, pero hay que tenerlo en cuenta para evitar errores de carga.
- Riesgo de falsos negativos: en la validacion de paridad se reportan 159 documentos con PII no detectados de un total de 20.000. En un despliegue real esto implica que parte del contenido sensible puede pasar el filtro.
- Aunque los idiomas declarados son ingles y multilingue, no se detalla el rendimiento por idioma ni la composicion del corpus de entrenamiento, por lo que el comportamiento fuera del ingles no esta cuantificado.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de validacion si se reutilizan en productos derivados.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que existe poca validacion independiente por parte de la comunidad.
- La exportacion se limita a fp32; no se incluyen variantes cuantizadas listas para usar, aunque el formato ONNX permite aplicar cuantizacion posterior si se valida la perdida de precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lemonade-sdk/pplx-pii-masking-onnx
- Modelo base original: https://huggingface.co/perplexity-ai/pplx-pii-masking
- Backbone de embeddings: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Politica de enrutado de Lemonade basada en este modelo: https://huggingface.co/lemonade-sdk/pii_policy_pplx-pii-masking-onnx
- Dataset de validacion: https://huggingface.co/datasets/nvidia/Nemotron-PII
- ONNX: https://onnx.ai/
- ONNX Runtime: https://onnxruntime.ai/
