# mradermacher/landai_0610_sft-GGUF

## Resumen

`mradermacher/landai_0610_sft-GGUF` es la distribucion en formato GGUF del modelo `zhou777/landai_0610_sft`, publicada por el cuantizador habitual de la comunidad mradermacher. No se trata de un modelo original, sino de una conversion a GGUF del checkpoint base, pensada para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, text-generation-webui, etc.). El modelo cuenta con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de ~7B.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 7,6B en hardware de consumo mediante cuantizacion, con un rango de cuants que va desde Q2_K (3,1 GB) hasta f16 (15,3 GB). El repositorio incluye ademas ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal (vision), aunque la model card no lo detalla explicitamente. La informacion disponible sobre arquitectura, entrenamiento y benchmarks es muy escasa: la model card se limita a describir el proceso de cuantizacion.

El modelo se distribuye bajo licencia no especificada y declara unicamente el idioma ingles. Fue creado el 21 de junio de 2025 y actualizado el 28 de noviembre de 2026. Con solo 97 descargas y 0 likes, se trata de un modelo de nicho con escasa adopcion y documentacion publica limitada, lo que debe tenerse en cuenta antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el formato y el tamano; no confirmado en la model card) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `zhou777/landai_0610_sft`. Por el numero de parametros (7,6B) y el formato de publicacion (transformers + GGUF), se trata presumiblemente de un transformer decoder-only de ~7B, pero la model card no confirma la familia arquitectonica, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion. La presencia de ficheros `mmproj` sugiere que el modelo incorpora un proyector multimodal para vision, aunque no se documenta su funcionamiento.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT (aunque el sufijo `_sft` en el nombre sugiere un ajuste supervisado). La model card del repositorio GGUF se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere uso en dialogos multi-turno, aunque no se detalla el formato de prompt.
- Capacidad multimodal (vision): la presencia de ficheros `mmproj` indica soporte de entrada de imagenes, aunque no se documenta el alcance ni la calidad.
- Idiomas: unicamente ingles declarado; no hay evidencia de soporte multilingue.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un modelo de 7,6B cuantizado a Q4_K_M (4,8 GB), puede ejecutarse en una GPU de consumo de 8 GB o en CPU con llama.cpp, lo que permite iterar rapidamente en el desarrollo de chatbots sin infraestructura cloud.
- Experimentacion multimodal en local: los ficheros `mmproj` permiten probar entrada de imagenes con llama.cpp, util para prototipos de descripcion de imagenes o VQA en entornos sin GPU dedicada de gran capacidad.
- Evaluacion comparativa de cuantizaciones: el amplio rango de cuants (de Q2_K a f16) permite medir el impacto de la cuantizacion en la calidad de salida para este checkpoint concreto, util en investigacion sobre tecnicas de compresion.
- Despliegue en entornos con recursos limitados: la version Q2_K (3,1 GB) cabe en GPUs de 4 GB o en sistemas embebidos con suficiente RAM, adecuada para demos offline.
- Fines educativos y de investigacion: sirve como ejemplo practico de como mradermacher convierte checkpoints de transformers a GGUF, con documentacion sobre el proceso de cuantizacion estatica.
- Integracion en pipelines de generacion de texto en ingles: para tareas de resumen o redaccion en ingles con baja latencia en hardware modesto, usando Ollama o llama.cpp como backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
  - Suplemento multimodal: +1,0 GB (mmproj-Q8_0) o +1,5 GB (mmproj-f16)
- GPU recomendadas: para Q4_K_M, una RTX 3060/4060 Ti (8-16 GB) es suficiente; para Q8_0 o f16, se recomienda RTX 4090 (24 GB), A100 o H100. Para Q2_K/Q3_K, GPUs de 4-6 GB como GTX 1650 o RTX 3050.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 en GPUs de 8 GB o mas; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; tambien es posible usar el modelo base en safetensors con transformers, vLLM o TGI (aunque el repo GGUF esta pensado para llama.cpp).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/landai_0610_sft-GGUF | ~7,6B | no disponible | no disponible | GGUF | Multimodal (mmproj), solo ingles, escasa documentacion |
| Mistral-7B-Instruct (GGUF) | ~7,2B | 32k (v0.2) | Apache 2.0 | GGUF | Ampliamente documentado, multilingue, comunidad grande |
| Llama 3.1 8B Instruct (GGUF) | ~8B | 128k | Llama 3.1 Community License | GGUF | Contexto largo, tool calling, benchmarks publicos |
| Qwen2.5 7B Instruct (GGUF) | ~7,6B | 128k | Apache 2.0 (mayoria variantes) | GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparativa se basa en caracteristicas publicas de alternativas conocidas; no se dispone de datos de rendimiento del modelo evaluado para comparar directamente. La principal desventaja de `landai_0610_sft` frente a estas alternativas es la ausencia de licencia clara, benchmarks y documentacion, asi como el soporte limitado a ingles.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; contactar con el autor del modelo base (`zhou777`) antes de usarlo en produccion.
- Documentacion minima: la model card no describe arquitectura, entrenamiento, contexto ni formato de prompt, lo que dificulta su integracion fiable.
- Solo ingles declarado: no hay evidencia de soporte para castellano u otros idiomas; el rendimiento fuera del ingles es incierto.
- Riesgo de alucinacion: sin datos de alineacion (RLHF/DPO) ni benchmarks, no se puede estimar la fiabilidad factual del modelo.
- Capacidad multimodal no documentada: los ficheros `mmproj` existen, pero se desconoce que tareas de vision soporta y con que calidad.
- Escasa adopcion: 97 descargas y 0 likes indican poca validacion por parte de la comunidad; no hay reportes de uso en produccion.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas sin antes probarlo empiricamente.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/landai_0610_sft-GGUF
- Modelo base: https://huggingface.co/zhou777/landai_0610_sft
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#landai_0610_sft-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
