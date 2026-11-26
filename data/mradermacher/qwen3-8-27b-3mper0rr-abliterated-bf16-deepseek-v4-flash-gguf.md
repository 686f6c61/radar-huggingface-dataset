# mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-GGUF

## Resumen

Esta ficha describe la publicación de cuantizaciones GGUF realizada por mradermacher sobre el modelo `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash`, un modelo de lenguaje de aproximadamente 26.896 millones de parámetros (26,9B) derivado de la familia Qwen y destilado a partir de DeepSeek-V4. El repositorio no contiene un modelo entrenado desde cero, sino una colección de pesos cuantizados en formato GGUF generados a partir del checkpoint base en BF16, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base combina tres señales en su nombre: una base Qwen de 27B, un proceso de "abliteration" (eliminación o atenuación de los mecanismos de rechazo aprendidos durante el alineamiento) y una destilación desde DeepSeek-V4 sobre el dataset `Jackrong/DeepSeek-V4-Distill-8000x`. La licencia declarada es Apache 2.0 y el único idioma indicado en la model card es el inglés. El repositorio incluye además ficheros `mmproj` (proyector multimodal), lo que sugiere capacidades de visión en el modelo base.

La relevancia de esta publicación es práctica: ofrece 12 cuantizaciones estáticas (de Q2_K a Q8_0) más dos variantes del proyector multimodal, con tamaños que van de 11,2 GB a 28,7 GB, lo que permite desplegar un modelo de ~27B en GPUs de consumo con 16-24 GB de VRAM según el nivel de compresión elegido. No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen, transformer; detalles no publicados) |
| Parametros totales | 26.895.998.464 (~26,9B), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el base en safetensors/BF16 |
| Tamano del repo | 189,4 GB |
| Dataset de destilacion | Jackrong/DeepSeek-V4-Distill-8000x |
| Modelo base | 3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash |
| Descargas / likes | 924 / 1 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el tamaño (~26,9B parámetros) se trata de un transformer denso derivado de la familia Qwen de 27B, aunque no se confirman número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto. El sufijo "abliterated" indica que el checkpoint ha pasado por un proceso de abliteration, una técnica de modificación de pesos orientada a reducir las respuestas de rechazo del modelo alineado original.

El entrenamiento del modelo base combina, según los metadatos, una destilación desde DeepSeek-V4 sobre el dataset `Jackrong/DeepSeek-V4-Distill-8000x` (8.000 ejemplos, a juzgar por el nombre). No se especifican el número total de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La presencia de ficheros `mmproj` en el repo de cuantizaciones sugiere que el modelo base incorpora un proyector multimodal para entrada de imágenes, aunque no se detalla la arquitectura de visión ni el encoder utilizado.

La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en la cadena de cuantización: mradermacher genera cuantizaciones estáticas (no imatrix) con distintos niveles de compresión, e indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (`-i1-GGUF`). El repo incluye también un gráfico comparativo de perplejidad entre tipos de cuantización de baja calidad.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen de 27B, aunque no se documentan explícitamente en la model card.
- Procesamiento multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica soporte de entrada de imágenes en el modelo base, no confirmado con detalle.
- Destilación desde DeepSeek-V4: el modelo ha sido entrenado para imitar el comportamiento del profesor, lo que puede reflejar estilos de razonamiento y formato de respuesta de DeepSeek.
- Comportamiento "abliterated": reducción de rechazos y filtros de seguridad respecto al modelo alineado original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`); no se confirman otros idiomas.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: con las cuantizaciones Q4_K_M (16,8 GB) o Q5_K_M (19,4 GB) el modelo cabe en GPUs de 24 GB como la RTX 4090, permitiendo inferencia privada sin conexión a servicios externos.
- Experimentación con modelos sin filtros de rechazo: el proceso de abliteration hace que el modelo sea adecuado para investigación sobre comportamiento de modelos y estudios de alineamiento, siempre con las cautelas éticas y legales correspondientes.
- Prototipado de asistentes conversacionales en inglés: la etiqueta `conversational` y la destilación desde DeepSeek-V4 permiten usar el modelo como base para chatbots de dominio general en entornos de desarrollo.
- Evaluación de destilaciones: útil para investigadores que quieran comparar el comportamiento de un modelo destilado de DeepSeek-V4 frente al profesor original en tareas de razonamiento y generación.
- Pruebas de cuantización y benchmarking de llama.cpp: el repositorio ofrece 12 niveles de cuantización, lo que permite medir el impacto de la compresión en calidad (perplejidad) y velocidad en un mismo modelo.
- Procesamiento de imágenes con el proyector multimodal: cargando los ficheros `mmproj` junto con los pesos principales en llama.cpp, se puede experimentar con entrada de imágenes, aunque la calidad y el soporte exacto no están documentados.
- Fine-tuning posterior sobre los pesos BF16 del modelo base: el checkpoint original en BF16 permite reentrenar o adaptar el modelo con LoRA/QLoRA antes de volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto):
  - Q2_K: ~11,2 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~12,2 / 13,6 / 14,8 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~15,5 / 15,7 / 16,8 GB.
  - Q5_K_S / Q5_K_M: ~18,8 / 19,4 GB.
  - Q6_K: ~22,2 GB.
  - Q8_0: ~28,7 GB.
  - Proyector multimodal: +0,7 GB (Q8_0) o +1,0 GB (f16).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para los mismos niveles; A100 40/80 GB o H100 para Q8_0 y BF16; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo para Q2_K y Q3_K_S con contexto reducido.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S y Q4_K_M en GPUs de 24 GB; Q3_K_S en GPUs de 16 GB; Q2_K en GPUs de 12 GB con contexto limitado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de endpoints indicada en los tags (`endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa para este caso, por lo que requerirían el checkpoint BF16.
- Latencia y throughput: no disponibles; dependen del hardware, del nivel de cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B abliterated DeepSeek-V4 Flash, GGUF) | ~26,9B | no disponible | Apache 2.0 | GGUF | Destilado de DeepSeek-V4, abliterated, multimodal (mmproj) |
| Modelo base BF16 (3MPER0RR/Qwen3.8-27B-...) | ~26,9B | no disponible | Apache 2.0 | safetensors/BF16 | Checkpoint original sin cuantizar |
| Qwen2.5-32B-Instruct | ~32,8B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen; contexto y benchmarks públicos |
| DeepSeek-V4 (profesor) | no disponible | no disponible | no disponible | no disponible | Modelo del que se destila; sin datos públicos en esta ficha |

La comparativa con alternativas concretas queda limitada porque no se dispone de benchmarks ni de especificaciones de contexto del modelo evaluado. Los modelos citados como referencia (Qwen2.5-32B-Instruct) son orientativos por familia y tamaño, no equivalentes funcionales verificados.

## Limitaciones y advertencias

- El proceso de abliteration elimina o atenúa los mecanismos de rechazo del modelo alineado: puede generar contenido dañino, ofensivo o inseguro sin las salvaguardas habituales. No es adecuado para aplicaciones de cara al público sin capas adicionales de moderación.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser un modelo destilado, puede reproducir errores del profesor o inventar datos con seguridad aparente.
- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud de contexto: no disponible; no se debe asumir una ventana concreta sin verificarla en el modelo base.
- Licencia Apache 2.0 declarada, pero el modelo base incorpora pesos derivados de Qwen y una destilación de DeepSeek-V4; conviene revisar las condiciones de los modelos originales antes de un uso comercial, especialmente por las cláusulas de los términos de DeepSeek.
- El repositorio es una publicación de cuantizaciones de un tercero (mradermacher), no el modelo original; la responsabilidad sobre el entrenamiento y el alineamiento recae en el autor del modelo base.
- El tamaño del repo (189,4 GB) implica descargas largas y espacio en disco considerable si se quieren varias cuantizaciones.
- No hay garantías de soporte del proyector multimodal en todas las versiones de llama.cpp; la funcionalidad de visión debe validarse empíricamente.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan la perplejidad de forma notable; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-GGUF
- Dataset de destilación: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
