# mradermacher/Mistral-Small-24B-Merge-V2-GGUF

## Resumen

Mistral-Small-24B-Merge-V2-GGUF es la versión cuantizada en formato GGUF del modelo Mistral-Small-24B-Merge-V2, un merge de modelos generado con la herramienta mergekit y publicado por la comunidad en el repositorio mergekit-community. La cuantización la realiza mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que ofrece múltiples niveles de compresión desde Q2_K hasta Q8_0.

El modelo base es un merge de 23.572.403.200 parámetros (aproximadamente 24B), lo que lo sitúa en la gama media-alta de modelos abiertos, adecuado para despliegue en GPUs de consumo con cuantizaciones agresivas o en GPUs de centro de datos (A100, H100) con cuantizaciones de mayor calidad. Al ser un merge de la familia Mistral-Small, hereda la arquitectura transformer densa de Mistral, aunque los detalles específicos de la composición del merge no están documentados en la información disponible.

La relevancia de este modelo radica en su formato GGUF, que permite ejecución local eficiente mediante llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.), democratizando el acceso a un modelo de 24B en hardware asequible. No obstante, al tratarse de un merge comunitario sin model card detallada ni benchmarks publicados, su evaluación rigurosa queda pendiente y debe abordarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral-Small); detalles del merge no disponibles |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |
| Tamano del repo | 161,4 GB |
| Modelo base | mergekit-community/Mistral-Small-24B-Merge-V2 |
| Herramienta de merge | mergekit |

## Arquitectura y entrenamiento

El modelo base es un merge creado con mergekit, una herramienta que combina los pesos de varios modelos mediante técnicas como SLERP, TIES, DARE o model stock. La información disponible no especifica qué modelos se combinaron, qué método de merge se empleó ni los hiperparámetros utilizados. Al estar basado en Mistral-Small-24B, se presume una arquitectura transformer densa con atención estándar (no se confirma si incorpora sliding window attention u otras variantes de Mistral), pero estos detalles no están documentados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning adicional tras el merge. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización realizada por mradermacher emplea cuantizaciones estáticas (no imatrix) en este repositorio; las versiones con imatrix están disponibles en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado únicamente para inglés, por lo que se espera un rendimiento limitado en otros idiomas.
- Razonamiento y conocimiento general: al derivar de Mistral-Small-24B, se presume capacidad para tareas de razonamiento, pero no hay evaluación publicada del merge.
- Generación de código: capacidad probable por herencia del modelo base, sin benchmarks que lo confirmen.
- Matemáticas: capacidad probable, sin datos verificados.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación local con modelos de 24B: gracias a las cuantizaciones Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB), el modelo puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, permitiendo a desarrolladores probar un modelo de gran tamaño sin infraestructura de centro de datos.
- Generación de texto en inglés para prototipos: adecuado para tareas de redacción, resumen y parafraseo en inglés en fases de prototipado, donde la licencia y los benchmarks no son críticos.
- Evaluación comparativa de merges: investigadores interesados en estudiar el efecto de las técnicas de mergekit pueden usar este modelo como caso de estudio frente al Mistral-Small-24B original.
- Despliegue con llama.cpp u Ollama: al estar en GGUF, se integra directamente en pipelines locales de inferencia con estas herramientas, sin necesidad de GPUs de centro de datos.
- Fine-tuning posterior sobre GGUF: aunque el fine-tuning directo sobre GGUF es limitado, el modelo base en safetensors permite adaptaciones con LoRA/QLoRA antes de recuantizar.
- Pruebas de robustez y alucinación: útil para estudiar el comportamiento de modelos mergeados frente a modelos entrenados de forma canónica, comparando tasas de alucinación en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este merge ni para su versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (9,0 GB): ~10-11 GB de VRAM con overhead de contexto.
  - Q3_K_M (11,6 GB): ~12-13 GB.
  - Q4_K_M (14,4 GB): ~15-16 GB.
  - Q5_K_M (16,9 GB): ~18-19 GB.
  - Q6_K (19,4 GB): ~20-21 GB.
  - Q8_0 (25,2 GB): ~26-27 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y contextos largos; GPUs con 16 GB (RTX 4080, 4070 Ti Super) para Q3_K_M o Q4_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4-Q5, y en GPUs de 16 GB con cuantizaciones Q3-Q4 y contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para vLLM o TGI se requeriría el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia cualitativa, Q4_K_M y Q8_0 están marcados por el autor como "fast".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-Merge-V2-GGUF (este) | 23,57B | No disponible | No disponible | GGUF | Merge comunitario, sin benchmarks |
| Mistral-Small-24B-Instruct (original) | ~24B | No disponible en esta ficha | Apache 2.0 (según Mistral) | safetensors, GGUF | Modelo oficial con evaluación publicada |
| Qwen2.5-32B-Instruct | ~32B | 128K (según Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamaño con benchmarks publicados |
| Gemma-2-27B | ~27B | 8K (según Google) | Gemma license | safetensors, GGUF | Alternativa de Google con evaluación oficial |

La comparativa se ofrece como referencia de categoría; los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta ficha, por lo que deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Sin benchmarks: no hay evaluación publicada del merge, por lo que su calidad real frente al Mistral-Small-24B original es desconocida.
- Solo inglés: el modelo está etiquetado únicamente para inglés, con rendimiento incierto en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica, no se puede cuantificar.
- Merge comunitario sin documentación: se desconoce la composición exacta del merge, lo que dificulta el análisis de sesgos y la trazabilidad.
- Contexto desconocido: no se documenta la longitud de contexto, lo que limita la planificación de aplicaciones con ventanas largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M para uso general.
- Repositorio de gran tamaño (161,4 GB): requiere espacio en disco y ancho de banda considerables para descargar todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Mistral-Small-24B-Merge-V2-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Mistral-Small-24B-Merge-V2-i1-GGUF
- Modelo base: https://huggingface.co/mergekit-community/Mistral-Small-24B-Merge-V2
- Página de descargas del autor: https://hf.tst.eu/model#Mistral-Small-24B-Merge-V2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
