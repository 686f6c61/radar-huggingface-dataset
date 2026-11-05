# mradermacher/DropLychee-1.3-GGUF

## Resumen

DropLychee-1.3-GGUF es la versión cuantizada en formato GGUF del modelo DropLychee-1.3, publicada por el usuario mradermacher, especializado en la generación de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles. El modelo base, desarrollado por el colectivo droplychee, es un transformer de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) etiquetado con el identificador de arquitectura `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación radica en que facilita el despliegue local del modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de incluir los ficheros mmproj necesarios para el procesamiento multimodal (visión). Al tratarse de cuantizaciones estáticas y no ponderadas por imatrix, el autor advierte de que no hay planes inmediatos para versiones imatrix, aunque acepta peticiones vía discusión comunitaria.

La información pública disponible es limitada: no se especifican detalles sobre el entrenamiento, la longitud de contexto, los idiomas soportados más allá del inglés, ni se han publicado resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables en la model card y los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`, base derivada de Qwen 3.5) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base DropLychee-1.3 emplea una arquitectura transformer con 27,3 mil millones de parámetros, identificada en los metadatos con la etiqueta `qwen3_5`, lo que indica que deriva de la familia Qwen 3.5 de Alibaba. La model card no proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas más allá de lo que implica la familia Qwen 3.5.

La publicación de mradermacher consiste en cuantizaciones estáticas generadas con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf). Se incluyen ficheros mmproj en Q8_0 (0,7 GB) y f16 (1,0 GB) para el componente multimodal, lo que confirma que el modelo base tiene capacidades de visión. No se han generado cuantizaciones ponderadas por imatrix, y el autor indica que probablemente no las planifique salvo petición explícita.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en los metadatos).
- Procesamiento multimodal de imágenes gracias a los ficheros mmproj incluidos (Q8_0 y f16), lo que habilita entrada de visión en llama.cpp.
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la familia Qwen 3.5 suele incluirlo.
- Razonamiento multi-paso y modo thinking: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Integración con Unsloth (etiqueta `unsloth` en los tags).

## Casos de uso

- Despliegue local de un modelo de 27 B en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,9 GB) caben en GPUs con 24 GB de VRAM como la RTX 4090, permitiendo inferencia privada sin conexión a servicios en la nube.
- Procesamiento de documentos con imágenes: gracias a los ficheros mmproj, el modelo puede recibir capturas, diagramas o páginas escaneadas junto con texto, útil para extracción de información en pipelines de digitalización.
- Asistentes conversacionales en inglés: la etiqueta `conversational` y el soporte de text-generation-inference lo hacen adecuado para chatbots multi-turno desplegados con TGI o llama.cpp server.
- Prototipado rápido en investigación: la disponibilidad de cuantizaciones desde Q2_K (11 GB) permite experimentar en GPUs de gama media (16 GB) con pérdida controlada de calidad, ideal para validar hipótesis antes de escalar a pesos completos.
- Evaluación comparativa de cuantizaciones: el conjunto de 11 cuantizaciones permite medir el impacto de la compresión en tareas concretas, útil para estudiar la degradación de perplexity y calidad.
- Fine-tuning sobre la base: al estar el modelo base bajo Apache 2.0 y disponible en safetensors, se puede ajustar y luego cuantizar de nuevo a GGUF para despliegue en producción.
- Inferencia en CPU con llama.cpp: las versiones Q2_K y Q3_K_S permiten ejecución en CPU con RAM suficiente, útil para entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del fichero + overhead de contexto):
  - Q2_K: ~11 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_M o IQ4_XS.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 24 GB; Q6_K y Q8_0 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), endpoints compatibles con la API de OpenAI. Los ficheros mmproj permiten multimodalidad en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DropLychee-1.3-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF | Multimodal (mmproj), solo inglés |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible en esta ficha | safetensors | Modelo origen del que deriva |
| Gemma 3 27B | 27 B | 128 K | Gemma license | safetensors, GGUF | Multimodal, multilingüe |
| Mistral Small 3.1 24B | 24 B | 128 K | Apache 2.0 | safetensors, GGUF | Multimodal, multilingüe |

La comparativa con Gemma 3 27B y Mistral Small 3.1 24B se ofrece como referencia de categoría (modelos densos de ~25 B con capacidades multimodales), pero no se dispone de datos de rendimiento de DropLychee-1.3 para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Solo se declara soporte de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está verificado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a modelos comparables.
- Las cuantizaciones son estáticas, no ponderadas por imatrix; el autor advierte de que las versiones IQ pueden ofrecer mejor relación calidad/tamaño que las K equivalentes.
- El modelo base tiene 27,3 B de parámetros: el despliegue en hardware de consumo requiere cuantizaciones agresivas (Q2_K, Q3_K) con la consiguiente degradación de calidad.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las posibles restricciones heredadas del modelo base Qwen 3.5.
- El repositorio ocupa 190,8 GB, lo que implica descargas parciales selectivas por cuantización.
- No hay garantía de soporte de tool calling ni de modo thinking; deben validarse empíricamente antes de usarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DropLychee-1.3-GGUF
- Modelo base: https://huggingface.co/droplychee/DropLychee-1.3
- Página de descargas del autor: https://hf.tst.eu/model#DropLychee-1.3-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
