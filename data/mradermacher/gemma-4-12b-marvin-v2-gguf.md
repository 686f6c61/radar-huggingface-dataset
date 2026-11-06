# mradermacher/gemma-4-12b-marvin-v2-GGUF

## Resumen

`mradermacher/gemma-4-12b-marvin-v2-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `ToastyPigeon/gemma-4-12b-marvin-v2`, un modelo de lenguaje de aproximadamente 11.900 millones de parámetros (11.907.350.576 según los pesos en safetensors). El trabajo lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que convierte modelos en formato transformers a GGUF para su uso con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.). El modelo base pertenece a la familia Gemma 4, según se deduce del nombre, aunque la model card del repositorio cuantizado no aporta detalles sobre arquitectura, contexto o datos de entrenamiento.

La relevancia de este repositorio es práctica: ofrece 11 variantes de cuantización (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB) que permiten ejecutar un modelo de 12B en hardware de consumo, algo imposible con los pesos originales en bf16/fp16. El repositorio acumula 301 descargas y 1 like en el momento de la consulta, lo que indica un uso moderado y un perfil de modelo de nicho o experimental (el sufijo "marvin-v2" sugiere un fine-tuning comunitario, no un modelo oficial de Google).

Este repositorio no incluye información sobre el pipeline, la licencia ni los idiomas del modelo base más allá de la etiqueta `en` en los tags. Cualquier evaluación de calidad, seguridad o idoneidad para producción debe remitirse al modelo original `ToastyPigeon/gemma-4-12b-marvin-v2`, cuya model card no se ha proporcionado en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, según el nombre del modelo; sin confirmar en la model card) |
| Parámetros totales | 11.907.350.576 (≈11,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en (inglés, según tags y model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamaño del repo | 83,4 GB |
| Cuantizador | mradermacher (nethype GmbH) |
| Versión de cuantización | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Compatibilidad de endpoints | endpoints_compatible |
| Fecha de creación | 2026-07-13 |
| Última actualización | 2026-11-03 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura concreta del modelo base en la documentación proporcionada. El nombre "gemma-4-12b" sugiere que se trata de un transformer decoder-only de la familia Gemma 4 con aproximadamente 12B de parámetros, pero la model card del repositorio cuantizado no confirma ni detalla la arquitectura (número de capas, dimensiones ocultas, tipo de atención, uso de RoPE, etc.). Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO o similares.

En cuanto al proceso de cuantización, sí hay información técnica concreta: mradermacher ha generado cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, partiendo de una conversión `hf` (transformers a GGUF). El repositorio incluye tanto cuantizaciones K-quant estándar como una variante IQ4_XS, y se ofrece un repositorio separado con cuantizaciones ponderadas por imatrix (`gemma-4-12b-marvin-v2-i1-GGUF`), que suelen preservar mejor la perplejidad a igual tamaño. No se indica si el modelo base incorpora innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional: los tags incluyen `conversational`, lo que indica que el modelo está ajustado para diálogo multi-turno.
- Idiomas: únicamente inglés según los metadatos (`language: en`); no se declara soporte multilingüe.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Inferencia local vía GGUF: compatible con llama.cpp y todo su ecosistema (Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python).
- Tool calling / function calling: no disponible (no se menciona en la documentación).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Visión, audio o modos de razonamiento especiales: no disponible.
- Capacidades de código o matemáticas: no disponibles de forma explícita; no se han publicado evaluaciones.

## Casos de uso

- **Prototipado local de asistentes conversacionales en inglés**: con la cuantización Q4_K_M (7,5 GB) el modelo cabe en una GPU de 12 GB o en 16 GB de RAM unificada, permitiendo iterar sobre prompts y system messages sin coste de API. Adecuado para desarrolladores que quieran evaluar el comportamiento de un fine-tuning comunitario de Gemma 4 antes de comprometerse con infraestructura.
- **Despliegue en estaciones de trabajo sin GPU dedicada**: la variante Q2_K (4,9 GB) o Q3_K_S (5,6 GB) permite ejecutar el modelo en CPU con llama.cpp en equipos con 8-16 GB de RAM, útil para demos internas, pruebas de integración o entornos air-gapped.
- **Evaluación comparativa de fine-tunings comunitarios**: investigadores que estudien el efecto de fine-tunings no oficiales sobre la base Gemma pueden usar estas cuantizaciones para comparar respuestas cualitativas frente al modelo base sin necesidad de descargar los 24 GB de pesos en fp16.
- **Generación de texto por lotes en pipelines offline**: con Q8_0 (12,8 GB) y llama.cpp en una GPU de 24 GB (RTX 3090/4090) se puede procesar grandes volúmenes de prompts en inglés para tareas de etiquetado, resumen o reescritura, siempre que la calidad se valide empíricamente.
- **Integración en aplicaciones de escritorio con LM Studio u Ollama**: el formato GGUF y la disponibilidad de múltiples niveles de cuantización facilitan empaquetar el modelo en herramientas de escritorio para asistentes locales de redacción o chat, con la ventaja de privacidad al no enviar datos a la nube.
- **Base para experimentos de cuantización**: el repositorio sirve como referencia para comparar la degradación de calidad entre Q2_K, IQ4_XS, Q4_K_M y Q8_0 sobre un mismo modelo, útil para quienes investigan técnicas de cuantización post-entrenamiento.
- **Backend de pruebas para aplicaciones compatibles con la API de OpenAI**: a través de llama.cpp server o vLLM (si se convierte el GGUF), se puede usar como sustituto local en tests de integración de aplicaciones que consumen APIs de chat, reduciendo costes y dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se ha proporcionado la model card del modelo base `ToastyPigeon/gemma-4-12b-marvin-v2`, que sería la fuente esperable de dichos datos.

## Requisitos de hardware

- **VRAM/RAM estimada según cuantización** (tamaños de archivo del repositorio):
  - Q2_K: 4,9 GB
  - Q3_K_S: 5,6 GB
  - Q3_K_M: 6,2 GB
  - Q3_K_L: 6,7 GB
  - IQ4_XS: 6,8 GB
  - Q4_K_S: 7,1 GB
  - Q4_K_M: 7,5 GB
  - Q5_K_S: 8,4 GB
  - Q5_K_M: 8,6 GB
  - Q6_K: 9,9 GB
  - Q8_0: 12,8 GB
  - A estos tamaños hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto (no disponible) y el número de capas.
- **GPU recomendadas**: para Q4_K_M o superiores, una RTX 3090/4090 (24 GB) permite cargar el modelo completo en VRAM con contexto amplio; una RTX 4070 Ti Super o 4080 (16 GB) es suficiente para Q4_K_M con contexto moderado. Para Q8_0 se recomienda A100 40 GB, H100 o RTX 4090 con contexto limitado.
- **¿Cabe en GPU de consumo?**: sí. Q4_K_M (7,5 GB) cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y en equipos Apple Silicon con 16 GB de memoria unificada. Q2_K y Q3_K_S caben incluso en GPUs de 8 GB.
- **Opciones de despliegue**: llama.cpp (referencia para GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python. Para servir como API compatible con OpenAI, llama.cpp server. vLLM y TGI no consumen GGUF de forma nativa; requerirían el modelo base en safetensors.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones para este modelo ni para sus cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas del modelo base, por lo que una comparativa cuantitativa rigurosa no es posible. Se ofrece una comparación estructural basada en categoría (modelos densos de ~12B en inglés, con cuantizaciones GGUF disponibles):

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| gemma-4-12b-marvin-v2 (este) | ≈11,9B | no disponible | no disponible | Sí (mradermacher) | Fine-tuning comunitario; sin benchmarks publicados |
| Gemma 2 9B (Google) | 9,2B | 8.192 tokens | Gemma Terms of Use | Sí (múltiples cuantizadores) | Modelo oficial con benchmarks publicados |
| Mistral Nemo 12B | 12,2B | 128.000 tokens | Apache 2.0 | Sí | Contexto largo, licencia permisiva |
| Qwen2.5 14B | 14,7B | 32.768 tokens (extensible) | Apache 2.0 | Sí | Multilingüe, buen rendimiento en código y matemáticas |

La comparación con Gemma 2 9B es la más directa por familia, pero se desconoce si "gemma-4-12b" corresponde a una generación posterior con cambios arquitectónicos. Las cifras de contexto y licencia del modelo de esta ficha figuran como "no disponible" porque no aparecen en la documentación proporcionada; no deben inferirse de la familia Gemma sin confirmación.

## Limitaciones y advertencias

- **Licencia desconocida**: la model card no declara licencia. No se puede asumir uso comercial permitido. Si el modelo base hereda los términos de Gemma, habría restricciones específicas de Google que deben verificarse en el repositorio original antes de cualquier despliegue en producción.
- **Procedencia y calidad del fine-tuning no verificadas**: "marvin-v2" sugiere un ajuste comunitario sin documentación pública de datos, metodología o evaluación. El riesgo de comportamientos indeseados, alucinaciones o degradación frente al modelo base es real y no cuantificado.
- **Solo inglés**: los metadatos declaran únicamente `en`. El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- **Sin benchmarks**: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales. Cualquier afirmación de rendimiento sería especulativa.
- **Contexto desconocido**: no se indica la longitud de contexto soportada, lo que impide dimensionar el KV cache y planificar casos de uso con documentos largos.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de este tamaño; sin evaluación específica, debe asumirse un riesgo estándar y validar salidas en aplicaciones críticas.
- **Cuantizaciones de baja precisión**: Q2_K y Q3_K_S degradan la calidad de forma notable. Para producción se recomienda Q4_K_M o superior, o las variantes imatrix del repo `-i1-GGUF`.
- **Repositorio de cuantización, no del modelo**: los problemas del modelo base (sesgos, errores de tokenizador, comportamiento del chat template) deben reportarse contra `ToastyPigeon/gemma-4-12b-marvin-v2`; mradermacher solo garantiza la fidelidad del proceso de conversión y cuantización.
- **Fecha de creación futura en los metadatos** (2026-07-13): conviene verificar la vigencia y el estado del repositorio antes de depender de él, dado que los metadatos pueden reflejar fechas anómalas o entornos de prueba.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/gemma-4-12b-marvin-v2-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-marvin-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-12b-marvin-v2-i1-GGUF
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#gemma-4-12b-marvin-v2-GGUF
- Repositorio de peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
