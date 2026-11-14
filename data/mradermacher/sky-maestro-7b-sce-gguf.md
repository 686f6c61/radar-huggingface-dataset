# mradermacher/Sky-Maestro-7B-Sce-GGUF

## Resumen

Sky-Maestro-7B-Sce-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo bunnycore/Sky-Maestro-7B-Sce, publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad. El modelo original es un merge de 7.612.756.480 parámetros (aproximadamente 7,6 mil millones) construido con mergekit, orientado a uso conversacional y entrenado principalmente en inglés. Esta versión GGUF no aporta pesos nuevos, sino que empaqueta el modelo base en una escala de cuantizaciones que va desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo modestas hasta estaciones de trabajo.

La relevancia de esta ficha radica en que el modelo base no ofrece una model card técnica detallada: no se documentan la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks. Por tanto, esta ficha describe con rigor lo que sí está disponible (arquitectura de merge, parámetros, cuantizaciones, licencia no especificada) y marca explícitamente como «no disponible» todo aquello que el autor no ha publicado. Es importante señalar que el repositorio tiene un volumen de descargas muy bajo (7 descargas, 0 likes en el momento de la consulta), lo que sugiere que se trata de una publicación reciente y poco validada por la comunidad.

El modelo se distribuye bajo licencia no disponible, un dato crítico para cualquier evaluación de uso comercial. Está etiquetado como compatible con endpoints y con la librería transformers, y su idioma declarado es únicamente el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo fusionado con mergekit; detalles de la arquitectura interna no disponibles) |
| Parámetros totales | 7.612.756.480 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 68,1 GB (incluye todas las cuantizaciones) |
| Modelo base | bunnycore/Sky-Maestro-7B-Sce |
| Librería | transformers |
| Pipeline | No disponible |
| Fecha de creación | 2025-02-21 |
| Última actualización | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo base Sky-Maestro-7B-Sce es un merge construido con mergekit, según las etiquetas del repositorio (`mergekit`, `merge`). No se dispone de información sobre qué modelos se fusionaron, con qué método (por ejemplo, SLERP, TIES, DARE o linear) ni con qué proporciones. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o SFT. La etiqueta `conversational` sugiere que el modelo está afinado para diálogo, pero no se especifican los detalles del ajuste.

Al tratarse de una cuantización GGUF, el proceso técnico aplicado por mradermacher es una conversión desde el formato Hugging Face a GGUF seguida de cuantización estática (el README indica `quantize_version: 2` y `output_tensor_quantised: 1`). No hay innovaciones técnicas adicionales documentadas, como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del modelo base.
- Razonamiento general y respuesta a instrucciones, presumiblemente heredado del merge, aunque no se documentan evaluaciones que lo confirmen.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado; no se especifican otros idiomas.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Prototipado rápido de chatbots en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,6 y 4,8 GB), el modelo puede ejecutarse en una GPU de consumo de 8 GB de VRAM con llama.cpp u Ollama, lo que permite validar flujos conversacionales sin infraestructura dedicada.
- Experimentación con modelos fusionados (merges): investigadores interesados en el efecto de mergekit sobre el comportamiento conversacional pueden usar esta versión GGUF para comparar el modelo base con sus componentes originales sin necesidad de convertir pesos.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (3,1 GB) permite ejecutar inferencia en CPU o en GPUs integradas, útil para demos y pruebas de concepto fuera de producción.
- Generación de texto en inglés para tareas de redacción asistida: el modelo puede emplearse en pipelines de generación de borradores, resúmenes o respuestas conversacionales, siempre que se valide la calidad con evaluaciones propias dado que no hay benchmarks publicados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de salida para un mismo modelo base.
- Integración en entornos compatibles con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructuras de inferencia estándar, aunque no se detallan los requisitos ni el rendimiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q3_K_M: ~3,9 GB
  - Q3_K_L: ~4,2 GB
  - IQ4_XS: ~4,3 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_S: ~5,4 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti); Q8_0 requiere al menos 10-12 GB (RTX 3080, RTX 4070 Ti); f16 requiere GPUs de 16 GB o más (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: sí, al menos hasta Q8_0 en GPUs de 12 GB o más; f16 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. El README remite a los README de TheBloke para instrucciones de uso y concatenación de archivos multiparte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría (modelos conversacionales de ~7B en inglés). Cualquier comparación sería especulativa y contravendría la regla de no inventar datos.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (bunnycore) antes de cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica, por lo que la calidad real del modelo es desconocida.
- Idiomas limitados al inglés: no se declara soporte de castellano ni de otros idiomas, lo que limita su uso en entornos hispanohablantes.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin una evaluación previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, agravado por la falta de documentación sobre el entrenamiento y los datos utilizados.
- Sesgos conocidos: no documentados, pero al ser un merge sin model card detallada no se puede descartar la herencia de sesgos de los modelos componentes.
- Validación comunitaria muy baja: 7 descargas y 0 likes en el momento de la consulta, lo que indica escasa verificación por parte de la comunidad.
- El repositorio ocupa 68,1 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario en lugar de clonar el repositorio completo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; el propio autor marca Q3_K_M como «lower quality» y recomienda Q4_K_S/Q4_K_M como opción rápida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sky-Maestro-7B-Sce-GGUF
- Modelo base: https://huggingface.co/bunnycore/Sky-Maestro-7B-Sce
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Sky-Maestro-7B-Sce-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Sky-Maestro-7B-Sce-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
