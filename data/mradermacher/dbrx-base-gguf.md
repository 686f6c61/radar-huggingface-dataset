# mradermacher/dbrx-base-GGUF

## Resumen

DBRX Base en formato GGUF es una conversión del modelo DBRX desarrollado originalmente por Databricks, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de gran escala con arquitectura Mixture of Experts (MoE) de 132.000 millones de parámetros totales, del que solo una fracción se activa por token, lo que permite un rendimiento computacional más eficiente que un modelo denso de tamaño equivalente. Esta versión concreta es una cuantización estática del checkpoint base redistribuido por nicoboss, empaquetada en formato GGUF para su uso con llama.cpp y herramientas compatibles.

El modelo base DBRX fue diseñado por Databricks como alternativa abierta a modelos propietarios de gran tamaño, orientado a tareas de generación de texto, razonamiento y código. Al ser un modelo base (no instruido), no incorpora alineación mediante RLHF ni formato conversacional, por lo que su uso directo requiere prompting de completado o fine-tuning posterior. La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE de 132B en hardware más modesto mediante cuantización, aunque con limitaciones importantes de tamaño incluso en los cuantos más agresivos.

La licencia Databricks Open Model License impone condiciones específicas de uso, incluida la aceptación de términos mediante gating en el repositorio original, y el modelo está entrenado y declarado únicamente para inglés. El repositorio GGUF ocupa 893,9 GB en total al albergar todas las variantes de cuantización, desde Q2_K hasta Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parámetros totales | 131.596.523.520 (132B) |
| Parámetros activos | no disponible en la información proporcionada |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio i1 |
| Idiomas soportados | inglés (en) |
| Licencia | databricks-open-model-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas Mixture of Experts, según se deduce del modelo base DBRX de Databricks. Los 131.596 millones de parámetros totales corresponden al checkpoint completo; al ser MoE, solo un subconjunto de expertos se activa por token, lo que reduce el coste de inferencia respecto a un denso de tamaño comparable. No se dispone en la información proporcionada de detalles sobre el número de expertos, la top-k de enrutamiento, la dimensión de las capas ni la configuración exacta de atención.

Tampoco se especifican en la documentación disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Al tratarse de un modelo base, es razonable asumir que no incorpora alineación conversacional, pero este extremo no se confirma en la información proporcionada. La conversión a GGUF realizada por mradermacher es una cuantización estática (quantize_version 2, output_tensor_quantised 1) del checkpoint de nicoboss, sin innovaciones arquitectónicas adicionales respecto al original.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de completado.
- Razonamiento y conocimiento general derivados del entrenamiento del modelo DBRX original (no verificable con benchmarks en la información disponible).
- Generación de código y matemáticas: capacidad esperable por el tamaño del modelo, aunque no se documentan evaluaciones específicas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; al ser un modelo base, no incluye formato de herramientas de serie.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriría fine-tuning o prompting específico.
- Capacidades multilingües: limitadas al inglés según la declaración del modelo.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre modelos MoE de gran escala: permite estudiar el comportamiento de un MoE de 132B en entornos con recursos limitados usando cuantizaciones Q2_K o Q3_K, comparando la degradación de calidad frente al checkpoint original en safetensors.
- Fine-tuning posterior sobre dominio específico: al ser un modelo base, sirve como punto de partida para ajuste supervisado en tareas concretas (clasificación, extracción, resumen) en inglés, aprovechando la capacidad del modelo para adaptarse a nuevos formatos.
- Generación de código en pipelines internos: puede integrarse en flujos de autocompletado o generación de fragmentos en inglés, aunque requiere validación humana y no ofrece tool calling nativo.
- Experimentación con llama.cpp y GGUF: útil para evaluar el rendimiento de un MoE de 132B en infraestructura con CPU y GPU mixtas, midiendo throughput y latencia con las distintas cuantizaciones disponibles.
- Benchmarking de cuantizaciones: el repositorio incluye desde Q2_K (48 GB) hasta Q8_0 (139,9 GB), lo que permite estudiar la relación entre tamaño, perplejidad y calidad en un modelo grande, comparando quants estáticos frente a los imatrix del repositorio i1.
- Docencia y formación técnica: sirve para ilustrar el funcionamiento de arquitecturas MoE y el proceso de cuantización GGUF, aunque su tamaño limita el uso en entornos de aula sin hardware adecuado.
- Sustitución de modelos densos en tareas de completado de texto largo en inglés: si se dispone de suficiente VRAM o RAM, puede emplearse para generación de documentación técnica o borradores, siempre con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~48 GB, Q3_K_S ~56,9 GB, Q3_K_M ~63,2 GB, Q3_K_L ~68,5 GB, IQ4_XS ~71 GB, Q4_K_S ~75 GB, Q4_K_M ~80 GB, Q5_K_S ~90,7 GB, Q5_K_M ~93,7 GB, Q6_K ~108,1 GB, Q8_0 ~139,9 GB (tamaños de archivo; el uso real en memoria puede ser superior por overhead de contexto y caché KV).
- GPU recomendadas: no cabe en GPUs de consumo individuales. Para Q2_K se requiere al menos una GPU con 48 GB (A6000, A100 80GB, H100) o reparto entre varias. Para Q4_K_M se necesitan ~80 GB, lo que implica A100 80GB, H100 80GB o múltiples GPUs.
- ¿Cabe en consumer GPU? No de forma completa. Las RTX 4090 (24 GB) o RTX 3090 (24 GB) no pueden alojar ninguna cuantización completa; sería necesario offloading parcial a RAM del sistema, con la consiguiente penalización de latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y herramientas compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo en la información disponible; para safetensors se usaría transformers con el checkpoint original.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán fuertemente del hardware, del reparto GPU/CPU y de la cuantización empleada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DBRX Base GGUF (este) | 132B (MoE) | no disponible | Databricks Open Model License | GGUF | Cuantizaciones desde 48 GB; solo inglés |
| DBRX Base original (Databricks) | 132B (MoE) | no disponible | Databricks Open Model License | safetensors | Checkpoint completo; requiere ~264 GB en fp16 |
| Mixtral 8x7B (referencia MoE) | 46,7B (MoE) | 32k (según model card pública) | Apache 2.0 | safetensors, GGUF | Menor tamaño, licencia más permisiva; datos de contexto no verificados aquí |
| Llama 3 70B (referencia densa) | 70B | 8k (según model card pública) | Llama 3 Community License | safetensors, GGUF | Denso, menor tamaño, amplia disponibilidad de cuantizaciones |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer una comparación cuantitativa fiable. La comparativa anterior es estructural (tamaño, licencia, formato) y no de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo base entrenado principalmente con datos web en inglés, es esperable que reproduzca sesgos presentes en esos datos, pero no se confirma.
- Riesgo de alucinación: alto en un modelo base sin alineación; no incluye mecanismos de rechazo ni verificación de hechos.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está disponible, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: la Databricks Open Model License y la Acceptable Use Policy imponen condiciones de uso; el acceso al modelo original requiere aceptar términos mediante gating con datos de contacto. Es necesario revisar la licencia antes de uso comercial.
- Caveat de producción: el tamaño mínimo de cuantización (48 GB) impide su despliegue en GPUs de consumo; el offloading a CPU degrada gravemente la latencia. Además, al ser un modelo base, no está listo para uso conversacional sin fine-tuning.
- El repositorio GGUF tiene 893,9 GB totales; descargar todas las variantes no es práctico. Conviene seleccionar una sola cuantización.
- Los cuantos Q2_K y Q3_K_M pueden presentar degradación notable de calidad; el propio autor marca Q3_K_M como "lower quality".

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dbrx-base-GGUF
- Modelo base redistribuido: https://huggingface.co/nicoboss/dbrx-base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/dbrx-base-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#dbrx-base-GGUF
- Licencia Databricks Open Model License: https://www.databricks.com/legal/open-model-license
- Política de uso aceptable: https://www.databricks.com/legal/acceptable-use-policy-open-model
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
