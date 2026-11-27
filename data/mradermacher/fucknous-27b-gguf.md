# mradermacher/FuckNous-27B-GGUF

## Resumen

FuckNous-27B-GGUF es la versión cuantizada en formato GGUF del modelo Mulatram/FuckNous-27B, publicada por el usuario mradermacher, conocido en el ecosistema por distribuir cuantizaciones estáticas de modelos open source. El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 27B), lo que lo sitúa en la gama de modelos medianos-grandes orientados a inferencia local y despliegue en servidores con GPUs de gama alta o múltiples consumer GPUs.

La relevancia de esta publicación radica en que facilita el acceso al modelo base en formatos ligeros (desde Q2_K de 11,2 GB hasta Q8_0 de 28,7 GB), permitiendo su ejecución en hardware que no podría cargar los pesos completos en precisión f16. El repositorio incluye además suplementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades de visión, aunque la model card no lo detalla explícitamente.

La información disponible sobre el modelo original es muy limitada: no se especifican arquitectura, contexto, licencia ni datos de entrenamiento. Esta ficha documenta lo que puede verificarse a partir de los metadatos y la model card del repositorio GGUF, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformers; probable transformer decoder-only por el tamaño y formato, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Mulatram/FuckNous-27B. Por el recuento de parámetros (~26,9B) y el formato de publicación (transformers + GGUF), se trata presumiblemente de un transformer decoder-only, pero no se confirma en la documentación disponible. Tampoco se detallan datos de entrenamiento, número de tokens, composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La model card del repositorio GGUF es puramente técnica y se centra en el proceso de cuantización estática. No se mencionan innovaciones arquitectónicas (atención lineal, decodificación especulativa, MoE, SSM híbrido) ni detalles sobre el pipeline de entrenamiento. La presencia de archivos mmproj indica que el modelo base incorpora un proyector multimodal, lo que sugiere capacidades de visión, pero no se especifica el codificador visual ni la resolución de imagen soportada.

## Capacidades

- Generación de texto conversacional: el tag `conversational` en los metadatos indica que el modelo está orientado a diálogo multi-turno.
- Capacidades multimodales: la existencia de archivos mmproj (Q8_0 y f16) sugiere soporte de entrada de imágenes, aunque no se detalla en la model card.
- Idiomas: únicamente se declara inglés (`en`); no se confirman capacidades multilingües.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking o razonamiento explícito: no disponible.
- Capacidades de código y matemáticas: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: con cuantizaciones Q4_K_M (16,8 GB) o Q5_K_M (19,4 GB), el modelo puede desplegarse en una única GPU de 24 GB (RTX 4090, A10G, L4) para diálogos multi-turno con baja latencia, adecuado para prototipos y entornos de desarrollo sin conexión.
- Procesamiento de documentos con imágenes: los archivos mmproj permiten, en teoría, pasar imágenes junto con texto a un runtime compatible (llama.cpp con soporte multimodal), útil para extracción de información de capturas, diagramas o formularios.
- Despliegue en estaciones de trabajo con GPUs de consumo: la versión Q4_K_S (15,7 GB) cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB) con contexto moderado, habilitando asistentes privados sin depender de la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (Q2_K a Q8_0) que permite medir el impacto de la compresión en calidad y velocidad sobre el mismo modelo base, útil para investigación en eficiencia de inferencia.
- Fine-tuning posterior o destilación: al existir pesos safetensors del modelo base, se puede partir de ellos para ajuste fino y luego cuantizar de nuevo, integrándose en pipelines de investigación.
- Servicio de inferencia con llama.cpp u Ollama: las cuantizaciones GGUF son directamente compatibles con llama.cpp, Ollama y otros runtimes ligeros, lo que facilita montar un endpoint HTTP local para pruebas de integración con aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~11,2 GB
  - Q3_K_M: ~13,6 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj f16: ~1,0 GB adicional para multimodal
- GPUs recomendadas: A100 40GB/80GB, H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 4080 / 4060 Ti 16GB para Q4_K_S.
- Cabe en consumer GPU: sí, en RTX 4090 (hasta Q6_K), RTX 4080 y 4060 Ti 16GB (Q4_K_S/M), y en GPUs de 12 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura concreta).
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y el runtime.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni características del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (p. ej. modelos de ~27B como Gemma 2 27B, Qwen2.5 32B o Mistral Large). Se recomienda consultar la model card del modelo base (Mulatram/FuckNous-27B) para obtener datos comparativos.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, contexto, licencia ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni documentación de alineación, no puede estimarse su magnitud.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento, no pueden evaluarse sesgos conocidos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; la propia model card advierte que Q3_K_M es de "lower quality" y recomienda Q4_K_S/M para uso general.
- No se ofrecen cuantizaciones con imatrix (weighted), lo que puede reducir la calidad frente a versiones imatrix de otros repositorios.
- El nombre del modelo y del autor base no aportan información sobre su procedencia ni garantías de mantenimiento.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FuckNous-27B-GGUF
- Modelo base: https://huggingface.co/Mulatram/FuckNous-27B
- Página de descargas del autor: https://hf.tst.eu/model#FuckNous-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
