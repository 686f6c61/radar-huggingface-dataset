# mradermacher/gemma-4-12b-marvin-gutenberg-GGUF

## Resumen

`mradermacher/gemma-4-12b-marvin-gutenberg-GGUF` es una recopilación de cuantizaciones estáticas en formato GGUF del modelo base `ToastyPigeon/gemma-4-12b-marvin-gutenberg`, un ajuste fino derivado de la familia Gemma 4 de Google. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y está pensado para su uso con llama.cpp y entornos compatibles con GGUF. El modelo cuenta con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) y está etiquetado con el pipeline `conversational`.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de casi 12 mil millones de parámetros en hardware de consumo, gracias a cuantizaciones que van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB). El nombre "marvin-gutenberg" sugiere un ajuste orientado a texto literario o conversacional, aunque la model card no detalla el dataset de entrenamiento ni el proceso de ajuste.

La información disponible es limitada: no se especifican la licencia, la longitud de contexto, los idiomas soportados más allá del inglés ni los resultados de benchmarks. Esta ficha recoge lo que sí está documentado y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles no disponibles) |
| Parámetros totales | 11.907.350.576 (≈11,9 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (mmproj), Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con variantes multimodales mmproj en F16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo base es `ToastyPigeon/gemma-4-12b-marvin-gutenberg`, un ajuste fino de la familia Gemma 4 de Google con aproximadamente 11,9 mil millones de parámetros. La model card del repositorio de cuantización no incluye detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención) ni sobre el proceso de entrenamiento del modelo base: no se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio indica que el modelo base incorpora capacidades multimodales, presumiblemente de visión, aunque la model card no lo confirma explícitamente. El trabajo de mradermacher consiste en cuantizaciones estáticas generadas con llama.cpp; el autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (`mradermacher/gemma-4-12b-marvin-gutenberg-i1-GGUF`), lo que sugiere que las de este repositorio no emplean matriz de importancia.

## Capacidades

- Generación de texto conversacional en inglés, dado el etiquetado `conversational` y el pipeline asociado.
- Posible soporte multimodal (visión) inferido de la presencia de ficheros `mmproj`; no confirmado en la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Ejecución en llama.cpp y derivados (Ollama, LM Studio, entre otros) gracias al formato GGUF.
- No se documentan capacidades específicas de tool calling, agentes, matemáticas o razonamiento extendido.

## Casos de uso

- Generación de texto literario y creativo en inglés: el nombre "gutenberg" sugiere un ajuste orientado a prosa; puede emplearse para redacción asistida, continuación de textos o generación de narrativa con un modelo de ~12 B en hardware de consumo.
- Prototipado de asistentes conversacionales en local: con la cuantización Q4_K_M (7,5 GB) se puede desplegar un chatbot en una GPU consumer de 12-16 GB de VRAM, útil para pruebas de concepto sin coste de API.
- Procesamiento de documentos y resumen en inglés: aunque no se confirma la longitud de contexto, un modelo de 12 B permite tareas de resumen y extracción sobre fragmentos de texto razonablemente extensos.
- Investigación sobre cuantización: el repositorio ofrece un abanico de cuantizaciones (de Q2_K a Q8_0) que permite estudiar el impacto de la compresión en la calidad de salida para un mismo modelo base.
- Despliegue en entornos con recursos limitados: la variante Q2_K (4,9 GB) puede ejecutarse en GPUs de 6-8 GB o incluso en CPU con suficiente RAM, aunque con pérdida de calidad.
- Experimentación multimodal (si se confirma la visión): los ficheros `mmproj` permiten probar tareas de descripción de imágenes o VQA en local, siempre que se use un runtime compatible con el soporte multimodal de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (pesos + overhead de contexto):
  - Q2_K: ~4,9 GB de pesos; ~6-7 GB de VRAM total.
  - Q4_K_M: ~7,5 GB de pesos; ~9-10 GB de VRAM total.
  - Q6_K: ~9,9 GB de pesos; ~11-12 GB de VRAM total.
  - Q8_0: ~12,8 GB de pesos; ~14-15 GB de VRAM total.
- GPU recomendadas:
  - RTX 4090 (24 GB): todas las cuantizaciones, incluida Q8_0, con contexto amplio.
  - RTX 4080 / 4070 Ti (16 GB): Q6_K y Q8_0 con margen justo; Q4_K_M y Q5_K_M cómodas.
  - RTX 4060 Ti 16 GB / RTX 3060 12 GB: Q4_K_M y Q5_K_S con contexto moderado.
  - A100 / H100: sobredimensionadas para este tamaño; útiles para servir múltiples instancias o contextos muy largos.
- Cabe en GPU consumer: sí, desde GPUs de 8 GB (Q2_K/Q3_K_S) hasta 16-24 GB para las cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere integración con plataformas de inferencia gestionada. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12b-marvin-gutenberg (este) | ≈11,9 B | no disponible | no disponible | GGUF | Ajuste fino derivado de Gemma 4, solo inglés |
| Gemma 2 9B (Google) | 9 B | 8.192 tokens | Gemma License | safetensors, GGUF | Referencia de la familia; contexto y licencia documentados |
| Mistral 7B / Nemo 12B | 7-12 B | 32.000-128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa abierta con contexto largo y licencia permisiva |
| Llama 3.1 8B | 8 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Amplia disponibilidad de cuantizaciones y ecosistema |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no puede establecerse una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- Solo inglés: el modelo está etiquetado únicamente con `en`; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar tareas de contexto largo con seguridad.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos derivados de Gemma pueden heredar sesgos de los datos de preentrenamiento.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Ajuste fino no documentado: se desconoce el dataset y el proceso de "marvin-gutenberg", por lo que su comportamiento en dominios distintos al literario es incierto.
- Sin benchmarks: no hay evidencia publicada de su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-12b-marvin-gutenberg-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-marvin-gutenberg
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-4-12b-marvin-gutenberg-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-12b-marvin-gutenberg-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
