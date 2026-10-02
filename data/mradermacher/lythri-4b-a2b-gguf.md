# mradermacher/Lythri-4B-A2B-GGUF

## Resumen

Lythri-4B-A2B-GGUF es el repositorio de cuantizaciones GGUF estáticas del modelo Lythri-4B-A2B, publicado por el usuario mradermacher en HuggingFace. No es un modelo entrenado desde cero: se trata de una conversión del checkpoint original alojado en Lythri/Lythri-4B-A2B (formato HuggingFace Transformers, según el metadato `convert_type: hf`) al formato GGUF que consumen llama.cpp, Ollama y otros motores de inferencia local.

El nombre del modelo indica 4B parámetros totales, y el sufijo "A2B" sigue la convención habitual en modelos de mezcla de expertos (MoE) para señalar los parámetros activos por token, lo que apuntaría a unos 2.000 millones de parámetros activos sobre un total de 4.000 millones. Esta interpretación procede únicamente de la nomenclatura: la model card del repositorio no confirma ni la arquitectura ni el número de expertos, y no incluye datos de entrenamiento, licencia, idiomas ni benchmarks.

La relevancia de esta publicación es práctica: pone a disposición doce niveles de cuantización (desde Q2_K hasta F16) de un modelo presuntamente pequeño y con pocos parámetros activos, lo que lo haría candidato a inferencia en CPU o en GPU de consumo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria sobre la calidad de las conversiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el sufijo A2B sugiere MoE, no confirmado en la model card |
| Parámetros totales | ~4.000 millones (deducido del nombre, no confirmado por el autor) |
| Parámetros activos | ~2.000 millones estimados por el sufijo A2B (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (depende de la licencia del modelo base, que no se especifica) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el repositorio base usa safetensors de Transformers |
| Versión de quantize | 2 (`quantize_version: 2`) |
| Cuantización por tensor | sí (`output_tensor_quantised: 1`) |
| Proyector multimodal | omitido en la conversión (`skip_mmproj: 1`), lo que apunta a un modelo sin torre de visión |
| Fecha de creación | 2026-10-01 |
| Fecha de actualización | 2026-10-01 |

## Arquitectura y entrenamiento

No hay información publicada en este repositorio sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF, DPO o RLVR. La model card se limita a indicar que son cuantizaciones estáticas del modelo Lythri/Lythri-4B-A2B y a listar los metadatos de la conversión (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`).

El único indicio estructural es el sufijo "A2B" del nombre, que en la convención de Qwen3-MoE y otros modelos similares designa parámetros activos por token. Si esa lectura es correcta, se trataría de un transformer con capas de mezcla de expertos, con enrutamiento disperso y un coste de cómputo por token cercano al de un modelo denso de 2.000 millones de parámetros. Conviene tratar esta hipótesis como no verificada hasta consultar el repositorio base.

## Capacidades

No se han publicado capacidades declaradas por el autor en la información disponible. A partir de los metadatos de la conversión puede inferirse lo siguiente, siempre con carácter provisional:

- Generación de texto: cualquier modelo de la familia Transformers convertido a GGUF es utilizable para generación de texto autorregresiva con llama.cpp.
- Sin capacidades de visión: el flag `skip_mmproj: 1` indica que la conversión omitió el proyector multimodal, coherente con un modelo puramente textual.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de código y matemáticas: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles para un modelo de ~4B parámetros totales distribuido en GGUF, no casos validados con este checkpoint concreto:

- Asistente local en portátil sin GPU dedicada: con cuantizaciones Q4_K_M o Q3_K_M, el modelo puede ejecutarse íntegramente en CPU con llama.cpp u Ollama, lo que permite asistentes de texto sin conexión y sin coste de API.
- Clasificación y etiquetado de textos en lote: procesamiento de tickets, correos o reseñas para asignar categorías, siempre que se valide antes la calidad del modelo base, ya que no hay benchmarks publicados.
- Resumen de documentos internos en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen de la infraestructura, lo que encaja en sectores regulados.
- Generación de borradores de texto técnico: primeros borradores de documentación o comentarios de código que después revisa una persona.
- Prototipado rápido de aplicaciones LLM: el amplio abanico de cuantizaciones permite ajustar el equilibrio entre tamaño en disco y calidad sin cambiar de motor de inferencia.
- Servicio de inferencia de bajo coste en GPU de gama media: con GPU de 6-8 GB de VRAM es viable mantener un endpoint con varias peticiones concurrentes usando vLLM o llama.cpp con servidor HTTP.
- Filtrado previo en pipelines RAG: uso del modelo como reordenador o descartador de fragmentos recuperados antes de pasar el contexto a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay datos en los resultados de búsqueda consultados.

## Requisitos de hardware

Los valores de tamaño y VRAM son estimaciones derivadas del recuento de parámetros (~4.000 millones), no mediciones de este repositorio. La longitud de contexto es desconocida, por lo que el consumo de caché KV no puede calcularse con precisión.

- Tamaño estimado de archivo por cuantización: Q2_K ~1,5 GB; Q3_K_S ~1,8 GB; Q3_K_M ~2,0 GB; Q3_K_L ~2,2 GB; IQ4_XS ~2,2 GB; Q4_K_S ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_S ~2,8 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,3 GB; F16 ~8,1 GB.
- VRAM estimada para inferencia: desde ~2 GB (Q3) hasta ~5 GB (Q8_0) con contexto corto, más la caché KV correspondiente al contexto configurado.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en tarjetas de 8 GB si se emplean cuantizaciones Q4 o inferiores.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para este tamaño; se usarían solo por concurrencia alta.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI requieren los pesos originales en safetensors, no los GGUF.
- Latencia y throughput: no disponibles. Si la arquitectura fuese MoE con ~2B parámetros activos, la velocidad por token sería comparable a la de un modelo denso de 2B, pero esto es una hipótesis no verificada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables con datos verificables, y la ausencia de benchmarks impide establecer comparaciones cuantitativas con alternativas de tamaño similar. Cualquier comparación requeriría, como mínimo, conocer la arquitectura exacta, el contexto soportado y los resultados de evaluación del modelo base Lythri/Lythri-4B-A2B.

## Limitaciones y advertencias

- Trazabilidad nula: el repositorio no documenta el modelo base más allá de un enlace, ni incluye licencia, idiomas, contexto o datos de entrenamiento.
- Licencia indeterminada: al no especificarse la licencia del modelo original, no puede confirmarse que el uso comercial esté permitido. Es imprescindible comprobarlo antes de cualquier despliegue en producción.
- Sin benchmarks: no hay ninguna evaluación publicada que permita estimar la calidad real de las cuantizaciones ni del modelo base.
- Riesgo de degradación por cuantización: las variantes Q2_K y Q3_K_S, en un modelo de 4B parámetros, suelen producir pérdidas de calidad apreciables en razonamiento y coherencia. Se recomienda Q4_K_M o superior como mínimo razonable.
- Riesgo de alucinación: no disponible, pero cualquier modelo de este tamaño sin datos de alineación publicados presenta una probabilidad elevada de inventar hechos.
- Sesgos: no disponible; sin información sobre la composición del dataset no puede evaluarse el sesgo demográfico, cultural o lingüístico.
- Idiomas: no disponible; no puede garantizarse un rendimiento aceptable en castellano.
- Adopción nula: 0 descargas y 0 likes, sin issues ni discusiones públicas que permitan validar la conversión.
- Modelo puramente textual: la conversión omite el proyector multimodal, por lo que no hay soporte de imagen o audio.
- Fechas de publicación anómalas: la fecha registrada (2026-10-01) es posterior a la fecha habitual de consulta, lo que puede deberse a un error de metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Lythri-4B-A2B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-4B-A2B
- Perfil del autor en HuggingFace: https://huggingface.co/mradermacher
- Índice de modelos GGUF de mradermacher en GraySoft: https://graysoft.dev/authors/m/mradermacher.html
- Ejemplo de otro repositorio GGUF del mismo autor: https://huggingface.co/mradermacher/YAM-AI-4B-GGUF
- Colección de modelos GGUF de LucidityAI (contexto de terceros que cuantizan modelos): https://huggingface.co/collections/LucidityAI/lucidityai-gguf-models
