# mradermacher/Solara-27B-GGUF

## Resumen

Solara-27B-GGUF es la versión cuantizada en formato GGUF del modelo WangSenQWQ/Solara-27B, publicada por el usuario mradermacher. Se trata de un modelo conversacional de 26.895.998.464 parámetros (aproximadamente 27B) en formato transformers, destinado a inferencia local mediante llama.cpp y herramientas compatibles con GGUF. La cuantización la realiza un tercero (mradermacher), no el autor original del modelo, por lo que conviene distinguir entre el modelo base y esta distribución.

El repositorio ofrece un conjunto estático de cuantizaciones que abarca desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), además de dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal. La disponibilidad de estos ficheros mmproj sugiere que el modelo base incorpora capacidades de visión, aunque la model card no documenta detalles sobre arquitectura, datos de entrenamiento ni capacidades concretas.

La relevancia de esta ficha radica en que permite desplegar un modelo de ~27B en hardware de consumo con cuantizaciones de 4 bits (Q4_K_M, 16,6 GB), y la licencia Apache 2.0 facilita su uso comercial. No obstante, la información técnica publicada por el autor es mínima, por lo que muchos apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) y safetensors en el modelo base |
| Modelo base | WangSenQWQ/Solara-27B |
| Tamaño del repositorio | 187,9 GB |
| Librería | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base WangSenQWQ/Solara-27B: la model card de esta cuantización no detalla si se trata de un transformer denso, un MoE, un modelo híbrido o cualquier otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta es la presencia de ficheros mmproj (multi-modal supplement), lo que indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imágenes. El proceso de cuantización es estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación. El autor de la cuantización indica que estas podrían no llegar a publicarse.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imágenes, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (16,6 GB) el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Asistente conversacional de escritorio: la etiqueta "conversational" y el formato GGUF lo hacen adecuado para integrarse en aplicaciones de chat locales mediante llama.cpp u Ollama.
- Procesamiento de documentos con imágenes: los ficheros mmproj permiten alimentar el modelo con capturas o documentos escaneados en pipelines de extracción de información, siempre que se valide la calidad del componente multimodal.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 cuantizaciones distintas, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de las respuestas en un mismo modelo.
- Investigación sobre cuantización estática: al no haber cuants ponderados ni imatrix, sirve como referencia para estudiar la degradación de calidad frente a versiones con imatrix de otros modelos.
- Filtrado y clasificación de texto en inglés: para tareas de moderación o etiquetado en pipelines por lotes, donde el throughput prima sobre la latencia interactiva.
- Base para fine-tuning posterior: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio, aunque conviene partir de los safetensors del modelo base en lugar de los GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~11 GB, Q3_K_M ~13,5 GB, IQ4_XS ~15,5 GB, Q4_K_M ~17 GB, Q5_K_M ~19,5 GB, Q6_K ~22,5 GB, Q8_0 ~29 GB. Añadir margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40/80 GB o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB (RTX 4080, 4090, 3090). Las cuantizaciones Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints estilo HuggingFace.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Solara-27B-GGUF | ~27B | no disponible | Apache 2.0 | GGUF | Cuantización estática, multimodal (mmproj) |
| Modelos ~27B densos de la misma franja | ~27B | variable | variable | safetensors/GGUF | No disponible comparación concreta por falta de datos del modelo base |
| Alternativas GGUF de mradermacher | variable | variable | variable | GGUF | Mismo pipeline de cuantización estática |

No es posible establecer una comparativa rigurosa con alternativas concretas porque la información publicada no incluye benchmarks, contexto ni detalles de arquitectura del modelo base.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación ni evaluaciones publicadas, no puede acotarse su magnitud.
- Idioma: el modelo está etiquetado únicamente como inglés; el rendimiento en castellano es desconocido y probablemente inferior.
- Cuantización estática sin imatrix: las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q6_K por calidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base WangSenQWQ/Solara-27B, ya que esta ficha solo cubre la cuantización.
- Distribución por terceros: la cuantización la realiza mradermacher, no el autor original; posibles errores de conversión no están cubiertos por el autor del modelo base.
- Capacidad multimodal no verificada: la existencia de mmproj no garantiza un rendimiento útil en tareas de visión sin evaluación previa.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene tratar las marcas temporales con cautela.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Solara-27B-GGUF
- Modelo base: https://huggingface.co/WangSenQWQ/Solara-27B
- Página de descargas del autor de la cuantización: https://hf.tst.eu/model#Solara-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
