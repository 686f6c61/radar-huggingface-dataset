# mradermacher/Rio-3.1-Open-30B-VL-GGUF

## Resumen

Rio-3.1-Open-30B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal prefeitura-rio/Rio-3.1-Open-30B-VL, publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad. El modelo base es un transformer multimodal (VL, vision-language) de aproximadamente 30.500 millones de parámetros, orientado a tareas conversacionales con soporte de imagen y texto. Esta variante GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa.

La relevancia de esta ficha radica en que ofrece un abanico amplio de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de un proyector multimodal mmproj en Q8_0 y f16), lo que permite ajustar el equilibrio entre calidad y requisitos de VRAM. El repositorio ocupa 209,9 GB en total y acumula 100 descargas en el momento de la consulta, con licencia no especificada en la información disponible.

No se dispone de información sobre la longitud de contexto, el proceso de entrenamiento ni los resultados de benchmarks del modelo base en los datos proporcionados, por lo que varios apartados de esta ficha se limitan a indicar "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language); detalles internos no disponibles |
| Parámetros totales | 30.532.122.624 (~30,5 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (con proyector multimodal mmproj separado) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de aproximadamente 30,5 mil millones de parámetros que combina un codificador visual con un modelo de lenguaje, según se deduce de la nomenclatura "VL" y de la existencia de un fichero mmproj (proyector multimodal) en el repositorio GGUF. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.).

Esta variante concreta es una cuantización estática generada por mradermacher a partir de los pesos originales en formato Hugging Face (convert_type: hf). El autor indica que también existen cuantizaciones ponderadas/imatrix en un repositorio separado (Rio-3.1-Open-30B-VL-i1-GGUF), que suelen ofrecer mejor calidad por tamaño que las estáticas equivalentes. El proceso de cuantización no altera la arquitectura, solo la precisión numérica de los pesos.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Procesamiento de imágenes (visión) gracias al proyector multimodal mmproj, que debe cargarse junto al modelo principal.
- Razonamiento y respuesta a preguntas sobre contenido visual y textual combinados.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades de código, matemáticas avanzadas, audio u otros modos.
- El modelo está etiquetado como "conversational" y "endpoints_compatible", lo que sugiere compatibilidad con endpoints de inferencia estándar.

## Casos de uso

- Descripción y análisis de imágenes en local: cargando el GGUF principal junto con el mmproj, se puede ejecutar un modelo vision-language de 30B en una estación de trabajo con GPU de consumo, útil para catalogar imágenes, extraer texto de capturas o responder preguntas sobre figuras.
- Asistente conversacional privado: al ejecutarse con llama.cpp u Ollama, permite desplegar un chatbot sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Prototipado rápido de aplicaciones multimodal: la variedad de cuantizaciones permite probar el modelo en portátiles (Q2_K, ~11,4 GB) antes de escalar a hardware mayor con Q5_K_M o Q8_0.
- Investigación y evaluación de cuantizaciones: el repositorio ofrece una matriz completa de cuantizaciones estáticas e imatrix, lo que facilita estudios comparativos de degradación de calidad frente a tamaño.
- Procesamiento por lotes de documentos escaneados: con el proyector multimodal se pueden extraer y resumir contenidos de imágenes o PDFs renderizados, integrándolo en pipelines locales.
- Docencia y experimentación con modelos abiertos: al ser un GGUF de un modelo de 30B, sirve para demostrar técnicas de cuantización, carga de proyectores multimodales y despliegue en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni overhead):
  - Q2_K: ~11,4 GB
  - Q3_K_S: ~13,4 GB
  - Q3_K_M: ~14,8 GB
  - Q3_K_L: ~16,0 GB
  - IQ4_XS: ~16,7 GB
  - Q4_K_S: ~17,6 GB
  - Q4_K_M: ~18,7 GB
  - Q5_K_S: ~21,2 GB
  - Q5_K_M: ~21,8 GB
  - Q6_K: ~25,2 GB
  - Q8_0: ~32,6 GB
  - Proyector multimodal mmproj: ~0,8 GB (Q8_0) o ~1,2 GB (f16)
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB; para Q2_K o Q3_K_S, una RTX 3090/4090 o incluso GPUs de 12-16 GB con offloading parcial a CPU.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones bajas (Q2_K a Q4_K_S) en GPUs de 16-24 GB; las cuantizaciones Q6_K y Q8_0 requieren 24-32 GB o división entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el proyector mmproj debe cargarse por separado para tareas de visión.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y el backend.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (contexto, benchmarks, licencia) para establecer una comparativa rigurosa con alternativas concretas. Se indica "no disponible".

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base (prefeitura-rio/Rio-3.1-Open-30B-VL) antes de desplegarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de evaluación en la información disponible.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre el proceso de alineación.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones bajas (Q2_K, Q3_K_S): pueden degradar notablemente la calidad y la coherencia, especialmente en tareas de razonamiento o visión; se recomienda Q4_K_M o superior para uso serio.
- Visión: requiere cargar el fichero mmproj adicional; sin él, el modelo solo procesa texto.
- Repositorio de 209,9 GB: la descarga completa es costosa en almacenamiento; conviene descargar solo la cuantización necesaria.
- Fecha de creación futura (2026-06-12) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de confiar en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rio-3.1-Open-30B-VL-GGUF
- Modelo base: https://huggingface.co/prefeitura-rio/Rio-3.1-Open-30B-VL
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Rio-3.1-Open-30B-VL-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Rio-3.1-Open-30B-VL-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
