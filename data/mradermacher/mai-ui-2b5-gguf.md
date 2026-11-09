# mradermacher/MAI-UI-2B5-GGUF

## Resumen

MAI-UI-2B5-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Yab762/MAI-UI-2B5, publicada por mradermacher, un autor habitual en el ecosistema de cuantización para llama.cpp. El repositorio no contiene pesos originales ni documentación técnica sobre el entrenamiento del modelo base: es un artefacto de conversión y distribución pensado para facilitar la inferencia local en hardware modesto.

El modelo base cuenta con 1.720.574.976 parámetros reales según los safetensors declarados, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 1,7 mil millones de parámetros). El nombre comercial "2B5" no coincide con el recuento real de parámetros. El repositorio incluye además ficheros `mmproj`, lo que indica que el modelo base es multimodal (probablemente con entrada de imagen), aunque la model card no detalla qué modalidades soporta ni cómo se procesan.

La relevancia de esta ficha es práctica: el modelo base está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y las cuantizaciones GGUF disponibles (desde Q2_K hasta f16, con tamaños de 0,9 a 3,5 GB) permiten ejecutarlo en CPU o GPU de gama baja. No obstante, la información publicada sobre arquitectura, contexto, datos de entrenamiento y benchmarks es prácticamente inexistente, por lo que cualquier evaluación de calidad debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, inferido por la presencia de `mmproj`; no confirmado) |
| Parametros totales | 1.720.574.976 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros multimodales `mmproj` separados) |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura del modelo base (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o destilación). La única evidencia estructural es la presencia de ficheros `mmproj` en el repositorio, lo que implica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada visual, pero no se especifica qué encoder de visión utiliza ni cómo se alinea con el modelo de lenguaje.

El repositorio de cuantización en sí no aporta información sobre innovaciones técnicas. Las cuantizaciones son estáticas (no hay quants ponderados con imatrix disponibles según la model card) y siguieron el pipeline estándar de mradermacher: conversión desde Hugging Face a GGUF y cuantización con las variantes K-quant e IQ de llama.cpp. El modelo base se distribuye en transformers, pero la model card del repositorio GGUF no documenta la plantilla de chat ni el formato de prompt esperado, lo que complica la integración sin consultar el repositorio original.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` sugiere uso en diálogo multi-turno, aunque no se especifica el formato de prompt.
- Procesamiento multimodal: los ficheros `mmproj` indican entrada de imagen, pero no se detalla si soporta vídeo, OCR, comprensión de documentos o grounding visual.
- Idiomas: únicamente inglés declarado; no hay evidencia de soporte multilingüe.
- Tool calling / function calling: no disponible en la información publicada.
- Razonamiento multi-paso y agentes: no disponible en la información publicada.
- Modo "thinking" o razonamiento explícito: no disponible en la información publicada.
- Capacidades de código y matemáticas: no disponible en la información publicada.

## Casos de uso

- Inferencia local en CPU: con cuantizaciones Q4_K_S o Q4_K_M (1,2 GB), el modelo puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp u Ollama, útil para prototipos de asistentes conversacionales en inglés.
- Despliegue en dispositivos de gama baja: la versión Q2_K (0,9 GB) permite pruebas en entornos con menos de 2 GB de RAM libre, adecuada para validar pipelines antes de escalar a modelos mayores.
- Experimentación multimodal en local: los ficheros `mmproj-Q8_0` (0,5 GB) y `mmproj-f16` (0,9 GB) permiten probar entrada de imagen en llama.cpp sin depender de servicios en la nube, aunque la calidad y el tipo exacto de tareas visuales deben verificarse empíricamente.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de pesos, lo que facilita medir la degradación de perplejidad entre Q2_K y Q8_0 en un mismo modelo y hardware.
- Fines educativos y de investigación sobre cuantización: útil para estudiar el impacto de K-quants e IQ-quants en modelos de ~1,7B parámetros con componente multimodal.
- Integración en pipelines de transformers: el modelo base se distribuye con `library_name: transformers`, por lo que puede cargarse con la API estándar de Hugging Face para tareas de inferencia en Python, siempre que se consulte el repositorio original para la configuración multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los datos proporcionados incluyen métricas de MMLU, HumanEval, GSM8K, MMMU u otras evaluaciones, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB. Añadir 0,5-0,9 GB si se usa el proyector multimodal.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4-Q8. Para f16 y contextos largos, se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU consumer: sí, en todas las cuantizaciones disponibles, incluidas las de gama de entrada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en transformers, se requiere la librería original con soporte multimodal.
- Latencia y throughput: no disponible. Al no conocerse la arquitectura ni la longitud de contexto, no es posible estimar tokens por segundo de forma fiable; en CPU con Q4_K_M se puede esperar un rendimiento bajo (decenas de tokens por segundo como máximo en hardware moderno), pero es una estimación no verificada.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (tamaño ~1,7B con componente multimodal) ni de datos de rendimiento del modelo base que permitan establecer una comparación rigurosa con alternativas como Qwen2-VL-2B, SmolVLM o PaliGemma. La model card no ofrece referencias ni benchmarks.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni formato de prompt, lo que dificulta la integración en producción sin ingeniería inversa.
- Modelo base de autoría poco conocida: Yab762/MAI-UI-2B5 no cuenta con documentación pública extensa en los datos proporcionados, por lo que la procedencia y calidad del entrenamiento no pueden verificarse.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni documentación, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos: desconocidos; no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Idioma: solo inglés declarado; el uso en castellano no está soportado oficialmente y probablemente degradará la calidad.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero el autor del modelo base no ofrece garantías ni asume responsabilidad por el uso.
- Cuantizaciones estáticas sin imatrix: la model card indica que no hay quants ponderados disponibles, lo que puede implicar mayor degradación en las variantes de baja precisión (Q2_K, Q3_K_S) en comparación con quants calibrados.
- Formato de prompt no documentado: la etiqueta `conversational` no viene acompañada de plantilla de chat, lo que puede romper el diálogo multi-turno si se usa un formato incorrecto.
- Componente multimodal sin especificar: se desconoce qué tareas visuales soporta y con qué calidad; no debe asumirse capacidad de OCR, grounding o comprensión de documentos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MAI-UI-2B5-GGUF
- Modelo base: https://huggingface.co/Yab762/MAI-UI-2B5
- Página de descargas del autor: https://hf.tst.eu/model#MAI-UI-2B5-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
