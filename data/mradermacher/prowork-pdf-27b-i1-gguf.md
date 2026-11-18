# mradermacher/ProWork-PDF-27B-i1-GGUF

## Resumen

ProWork-PDF-27B-i1-GGUF es una colección de cuantizaciones GGUF con calibración imatrix del modelo ProWork-PDF-27B, desarrollado originalmente por aibuildai-inc. El modelo base está orientado a la comprensión de documentos PDF y a tareas de trabajo del conocimiento (knowledge work), y la model card lo etiqueta explícitamente como modelo de visión, lo que implica capacidad de procesar entradas multimodales además de texto. Las cuantizaciones las produce mradermacher, un autor habitual en el ecosistema GGUF, a partir del checkpoint original en formato transformers.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) según los datos de safetensors del repositorio, lo que lo sitúa en la franja de modelos densos de gran tamaño, aptos para despliegues con GPU de 24 GB o superiores según el nivel de cuantización. El repositorio ocupa 39,5 GB y solo distribuye pesos en GGUF; los ficheros mmproj necesarios para la parte visual no están en este repositorio, sino en el repositorio de cuantizaciones estáticas del mismo autor.

La relevancia de esta ficha es doble: por un lado, permite ejecutar localmente un modelo especializado en documentos con llama.cpp y derivados; por otro, conviene señalar que no hay información pública sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentación disponible, por lo que las evaluaciones deben hacerse por cuenta propia antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun el ecosistema transformers/GGUF; detalles internos no publicados) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), ademas de las listadas en la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (no todas con fichero publicado en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base esta en formato transformers |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base (aibuildai-inc/ProWork-PDF-27B): la model card del repositorio de cuantizaciones no detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni describe la composición del dataset de entrenamiento, el número de tokens procesados o si hubo fases de RLHF o DPO. El único dato estructural fiable es el recuento de parámetros (27,3 B) y la etiqueta de modelo de visión, que sugiere un codificador visual acoplado a un decodificador de lenguaje, aunque el detalle no está confirmado.

La innovación técnica documentada en este repositorio es la cuantización con imatrix: mradermacher genera un fichero imatrix (0,1 GB) que se usa para calibrar la importancia de los pesos durante la cuantización, lo que en la práctica mejora la perplejidad de las cuantizaciones de baja precisión (Q2, IQ2, IQ3) frente a las cuantizaciones estáticas equivalentes. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y remite a las gráficas de ikawrakow y al análisis de Artefact2 para justificar las diferencias de calidad entre tipos.

## Capacidades

- Comprensión de documentos PDF y tareas de knowledge work, según las etiquetas del modelo (document-understanding, knowledge-work, pdf).
- Procesamiento de entrada visual: la model card lo describe como modelo de visión, con ficheros mmproj en el repositorio de cuantizaciones estáticas.
- Generación de texto conversacional: la etiqueta conversational figura entre los tags del repositorio.
- Capacidad multimodal limitada al inglés: el campo language declara únicamente en.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Extracción de datos estructurados de facturas y albaranes: el modelo puede recibir la imagen o el texto de un PDF y devolver campos normalizados (fechas, importes, NIF) en JSON; su orientación a document-understanding y su tamaño de 27 B permiten manejar plantillas heterogéneas mejor que modelos pequeños, aunque el contexto máximo no está documentado y conviene trocear documentos largos.
- Análisis de contratos y pólizas: resumen de cláusulas, detección de obligaciones y comparación entre versiones de un mismo documento, aprovechando la etiqueta knowledge-work y el soporte de entrada visual para PDF escaneados.
- Asistente interno de consulta sobre una base documental: indexación de manuales y políticas de empresa y generación de respuestas con cita de la página de origen, desplegando el GGUF con llama.cpp u Ollama en una máquina con GPU de 24 GB o más.
- Procesamiento por lotes de expedientes administrativos: clasificación y resumen de documentos en un pipeline offline, donde el coste por token es cero una vez desplegado el modelo y la licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales.
- Digitalización asistida de archivos históricos en inglés: transcripción y normalización de documentos escaneados mediante la entrada visual, con revisión humana posterior dada la propensión a errores de OCR en tipografías degradadas.
- Prototipado de producto sobre documentos en estaciones de trabajo con una sola GPU: las cuantizaciones i1-IQ3_M (12,9 GB) caben en tarjetas de 16 GB y permiten iterar sobre la calidad antes de decidir un despliegue en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB con i1-Q2_K, unos 13 GB con i1-IQ3_M y en torno a 16-18 GB con cuantizaciones Q4; para precisión completa en FP16 harían falta del orden de 55 GB, cifra estimada a partir del recuento de parámetros y no confirmada por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q4/Q5; RTX 4080, 4070 Ti Super o A6000 para IQ3.
- Cabe en GPU de consumo: sí, con i1-Q2_K e i1-IQ3_M en tarjetas de 12-16 GB; las cuantizaciones Q4 en adelante requieren 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para la parte visual hay que descargar el mmproj desde el repositorio estático y usar una versión de llama.cpp con soporte multimodal.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantización, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ProWork-PDF-27B-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF imatrix | Especializado en PDF y knowledge work; solo inglés |
| ProWork-PDF-27B (base) | 27,3 B | no disponible | Apache 2.0 | transformers | Checkpoint original; sin cuantizar |
| Qwen2.5-VL-32B-Instruct | 32 B | 128 K (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Referencia multimodal open source con contexto largo y multilingüismo; datos de benchmarks públicos |
| Gemma 3 27B | 27 B | 128 K (según documentación pública del modelo) | Gemma Terms of Use | safetensors, GGUF | Tamaño comparable y capacidad multimodal; licencia con restricciones de uso |

La comparación con Qwen2.5-VL y Gemma 3 se ofrece como referencia de categoría; no se dispone de datos de benchmarks del modelo ProWork-PDF que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo base; al estar entrenado y evaluado presumiblemente en inglés, el rendimiento en castellano no está garantizado y no debería asumirse.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad en extracción de documentos, un dominio donde los errores silenciosos son especialmente costosos.
- La longitud de contexto no está documentada, lo que impide planificar el troceado de PDF largos con criterio.
- El repositorio solo contiene dos ficheros GGUF publicados (i1-Q2_K e i1-IQ3_M) pese a que la model card lista muchos más tipos; el resto debe obtenerse del repositorio estático o generarse a partir del imatrix.
- Los ficheros mmproj para la entrada visual no están en este repositorio; sin ellos, el modelo funciona solo como modelo de texto.
- La licencia Apache 2.0 del modelo no cubre automáticamente posibles restricciones de los datos de entrenamiento del modelo base, que no se detallan.
- Repositorio sin descargas ni valoraciones en el momento de redactar esta ficha; no hay evidencia de la comunidad sobre su calidad en producción.
- El tamaño de 27 B y las cuantizaciones de baja precisión (Q2, IQ2) pueden degradar notablemente tareas de extracción fina de cifras y tablas; conviene validar con un conjunto propio antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/ProWork-PDF-27B-i1-GGUF
- Modelo base: https://huggingface.co/aibuildai-inc/ProWork-PDF-27B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/ProWork-PDF-27B-GGUF
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#ProWork-PDF-27B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
