# mradermacher/StreetChat-GGUF

## Resumen

StreetChat-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo RoseG/StreetChat, publicada por el usuario mradermacher. El modelo original es un transformer conversacional de aproximadamente 4.205.751.296 parámetros (unos 4,2 mil millones) orientado a tareas de diálogo en inglés. Esta versión no introduce cambios arquitectónicos: se limita a convertir los pesos originales a formatos GGUF para facilitar su despliegue en entornos de inferencia local como llama.cpp u Ollama.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4,2B en hardware de consumo, algo imposible con los pesos en precisión completa. Sin embargo, la información pública disponible es muy limitada: no se especifican datos de entrenamiento, licencia, benchmarks ni la mayoría de especificaciones técnicas del modelo base. La model card del cuantizador es genérica y se centra en el proceso de conversión, no en las capacidades del modelo.

Por tanto, esta ficha documenta lo que se puede verificar (tamaño, formatos de cuantización disponibles, idioma declarado) y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada, evitando inferencias no respaldadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducido de la librería transformers; detalles no disponibles) |
| Parámetros totales | 4.205.751.296 (~4,2B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (según la model card del cuantizador) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors según el dato de parámetros |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RoseG/StreetChat más allá de que se carga mediante la librería transformers, lo que sugiere una arquitectura transformer estándar. No consta el número de capas, dimensiones ocultas, mecanismo de atención (completa, lineal o híbrida) ni si emplea técnicas como decodificación especulativa o atención con ventana deslizante.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La model card del cuantizador (mradermacher) no aporta información sobre el modelo original, y la del modelo base no se incluye en la información proporcionada. Cualquier afirmación sobre el entrenamiento sería especulativa y, por tanto, se omite.

La única innovación técnica documentada en esta publicación es el proceso de cuantización estática a GGUF, que incluye variantes IQ (IQ4_XS) y cuantizaciones K-quant de distintos tamaños, además de un suplemento multimodal (mmproj) en f16 y Q8_0, lo que indica que el modelo base podría tener capacidades multimodales, aunque no se detalla su alcance.

## Capacidades

- Generación de texto conversacional en inglés (el tag "conversational" aparece en los metadatos).
- Posible soporte multimodal: el repositorio incluye archivos mmproj (multi-modal supplement) en f16 y Q8_0, lo que sugiere capacidad de procesamiento de imágenes, aunque no se especifica el tipo ni la calidad.
- No consta soporte de tool calling ni function calling.
- No consta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo language.
- No se documentan modos especiales como thinking mode, audio o visión más allá del indicio del mmproj.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo gracias a sus cuantizaciones Q4_K_M o Q5_K_M, adecuadas para diálogos multi-turno sin conexión.
- Prototipado de chatbots en entornos con recursos limitados: al ser un modelo de ~4,2B, cabe en GPUs de 8-12 GB con cuantizaciones Q4, lo que permite iterar rápidamente en el desarrollo de interfaces conversacionales.
- Experimentación con modelos multimodales en local: la presencia de archivos mmproj sugiere que puede procesar imágenes junto con texto, útil para pruebas de concepto de asistentes visuales, aunque la calidad no está documentada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples formatos (Q2_K a Q8_0, IQ4_XS), lo que permite medir el impacto de la cuantización en la perplejidad y la calidad de las respuestas en un mismo modelo.
- Despliegue en dispositivos edge o sin GPU dedicada: las cuantizaciones Q2_K y Q3_K_S reducen el tamaño lo suficiente para ejecutarse en CPU con RAM moderada, útil para demos offline.
- Investigación sobre modelos pequeños conversacionales: sirve como base para estudiar el comportamiento de modelos de ~4B en tareas de diálogo, siempre que se validen previamente sus limitaciones no documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de ~4,2B en GGUF, las cuantizaciones Q4_K_M suelen ocupar en torno a 2,5-3 GB y las Q8_0 en torno a 4,5-5 GB, aunque estos valores no están confirmados en la documentación del repositorio.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) con cuantizaciones Q4-Q8, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? Probablemente sí con cuantizaciones Q4 y Q5 en GPUs de 8 GB o más, pero no está verificado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La librería declarada es transformers, pero el formato GGUF está pensado para llama.cpp y derivados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otros modelos conversacionales de ~4B en GGUF). Se recomienda consultar la model card del modelo base RoseG/StreetChat para obtener datos comparativos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (RoseG) antes de cualquier despliegue en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos y alucinaciones: no hay información sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que el riesgo de alucinación y sesgos es desconocido pero no descartable.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar conversaciones largas o tareas de recuperación de información.
- Capacidades multimodales inciertas: la presencia de mmproj sugiere visión, pero no se especifica qué tareas visuales soporta ni con qué calidad.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la calidad de las respuestas; se recomienda validar antes de usar en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-17): el metadato indica una fecha posterior a la actual, lo que puede deberse a un error de registro; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/StreetChat-GGUF
- Modelo base: https://huggingface.co/RoseG/StreetChat
- Página de descargas del cuantizador: https://hf.tst.eu/model#StreetChat-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
