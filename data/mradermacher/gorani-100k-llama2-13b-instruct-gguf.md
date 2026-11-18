# mradermacher/gorani-100k-llama2-13b-instruct-GGUF

## Resumen

`mradermacher/gorani-100k-llama2-13b-instruct-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `danielpark/gorani-100k-llama2-13b-instruct`, un ajuste fino de Llama 2 de 13.000 millones de parametros orientado a instrucciones y entrenado sobre el dataset `danielpark/gorani-100k-llama2-instruct`. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y su objetivo es hacer que el modelo pueda ejecutarse en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base sigue la arquitectura transformer decoder-only de Llama 2 (13B), con 13.015.864.320 parametros totales en pesos safetensors. El repositorio GGUF incluye once variantes de cuantizacion que van desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB), lo que permite desplegarlo desde equipos con 8 GB de VRAM hasta estaciones con 16 GB o mas.

La relevancia de esta ficha es practica: se trata de una distribucion lista para inferencia local de un modelo de instrucciones en ingles, sin datos publicados de benchmarks ni detalles del proceso de entrenamiento por parte del autor original. Es util para quien necesite un modelo de 13B en formato GGUF y quiera evaluar su comportamiento en tareas de generacion de texto e instrucciones en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un Llama 2 de 13B, es decir, un transformer decoder-only con atencion multi-cabeza y normalizacion RMSNorm, preentrenado por Meta y posteriormente ajustado por danielpark sobre el dataset `danielpark/gorani-100k-llama2-instruct`. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste fino. La model card del repositorio GGUF no aporta detalles adicionales sobre el proceso de entrenamiento.

La innovacion tecnica de este repositorio no reside en la arquitectura, sino en el proceso de cuantizacion: mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) sobre los pesos en formato Hugging Face convertidos a GGUF. Ademas, el autor ofrece una variante con cuantizacion ponderada/imatrix en un repositorio separado (`gorani-100k-llama2-13b-instruct-i1-GGUF`), que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto e instrucciones en ingles: el modelo esta ajustado para seguir instrucciones y responder a prompts conversacionales.
- Razonamiento basico y respuesta a preguntas: herencia del preentrenamiento de Llama 2 y del ajuste fino sobre el dataset gorani-100k.
- Generacion de codigo y matematicas: capacidad no verificada con benchmarks; depende del dataset de ajuste fino, del que no se detalla composicion.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la cuantizacion Q4_K_M (8,0 GB) el modelo cabe en GPUs de consumo de 8-12 GB y permite prototipar asistentes de texto sin depender de APIs externas.
- Generacion de texto en ingles para blogs y documentacion: el modelo puede redactar borradores y resumir contenido en ingles, aprovechando su ajuste a instrucciones.
- Chatbots de soporte en ingles: se puede desplegar con llama.cpp u Ollama para conversaciones multi-turno, aunque la ventana de contexto efectiva no esta documentada y conviene validarla empiricamente.
- Experimentacion academica con cuantizaciones: util para estudiar el impacto de Q2_K frente a Q8_0 en calidad de generacion sobre un mismo modelo base.
- Evaluacion comparativa de ajustes finos de Llama 2: sirve como punto de referencia frente a otros derivados de Llama 2 13B en tareas de instrucciones.
- Despliegue en entornos con recursos limitados: la variante Q2_K (5,0 GB) permite ejecutar el modelo en equipos con 6-8 GB de VRAM o en CPU con llama.cpp, a costa de una perdida de calidad notable.
- Pipelines de generacion por lotes: al ser un modelo de 13B, ofrece un equilibrio entre calidad y coste computacional para tareas de clasificacion o extraccion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~5,0 GB; Q3_K_S ~5,8 GB; Q3_K_M ~6,4 GB; Q3_K_L ~7,0 GB; IQ4_XS ~7,1 GB; Q4_K_S ~7,5 GB; Q4_K_M ~8,0 GB; Q5_K_S ~9,1 GB; Q5_K_M ~9,3 GB; Q6_K ~10,8 GB; Q8_0 ~13,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de la secuencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 12 GB o RTX 4090 24 GB para las cuantizaciones Q4-Q8; A100 o H100 para despliegues de mayor throughput o con contexto largo.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M y superiores) hasta una RTX 4060 Ti 8 GB (Q3_K_M o inferiores). Las variantes Q2_K y Q3_K_S pueden ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte nativo en vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gorani-100k-llama2-13b-instruct-GGUF | 13,0B | no disponible | GGUF | no disponible | Ajuste fino de Llama 2 13B, solo ingles |
| Llama 2 13B Chat (Meta) | 13,0B | 4096 tokens | safetensors, GGUF (via terceros) | Llama 2 Community License | Referencia original, ampliamente soportado |
| Mistral 7B Instruct | 7,3B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Menor tamano, mayor contexto, licencia permisiva |
| Vicuna 13B v1.5 | 13,0B | 4096 tokens | safetensors, GGUF | no comercial (base Llama 2) | Ajuste fino alternativo de Llama 2 13B |

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 2, hereda los sesgos del preentrenamiento de Meta; no se documenta ningun proceso de mitigacion en el ajuste fino.
- Riesgo de alucinacion: no cuantificado; como todo modelo de 13B sin benchmarks publicados, puede generar afirmaciones incorrectas con seguridad aparente.
- Limitaciones de contexto e idioma: el repositorio declara unicamente ingles; la longitud de contexto efectiva no esta documentada y podria diferir de los 4096 tokens de Llama 2.
- Restricciones de licencia: la licencia no esta disponible en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de un despliegue en produccion.
- Caveats para produccion: la cuantizacion Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior. Ademas, el modelo no documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling sin validacion previa.
- El repositorio tiene 149 descargas y 0 likes, lo que indica una adopcion muy baja y escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gorani-100k-llama2-13b-instruct-GGUF
- Modelo base: https://huggingface.co/danielpark/gorani-100k-llama2-13b-instruct
- Dataset de ajuste: https://huggingface.co/datasets/danielpark/gorani-100k-llama2-instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gorani-100k-llama2-13b-instruct-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gorani-100k-llama2-13b-instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
