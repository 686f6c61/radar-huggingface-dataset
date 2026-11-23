# mradermacher/LFM3-1.7B-CPT-Wikipedia-Languages-GGUF

## Resumen

LFM3-1.7B-CPT-Wikipedia-Languages-GGUF es la versión cuantizada en formato GGUF del modelo Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages, un modelo de lenguaje de 1.728.801.600 parámetros derivado de la familia LFM3 (Liquid Foundation Model 3) y sometido a un entrenamiento continuo (continued pre-training, CPT) sobre un corpus de Wikipedia en 60 idiomas. La cuantización la firma mradermacher, un autor habitual en la comunidad de GGUF, y ofrece un abanico de 12 variantes que van desde Q2_K (0,9 GB) hasta f16 (3,6 GB).

El modelo resuelve el caso de uso de generación de texto multilingüe ligera: al ser un modelo de 1,7B parámetros, puede ejecutarse en hardware modesto (incluso en CPU o GPUs de consumo) manteniendo una huella de memoria reducida. Su origen es un ajuste sobre LFM3 orientado a conocimiento enciclopédico en múltiples idiomas, lo que lo hace útil para tareas de recuperación, resumen o generación de contenido en entornos con recursos limitados.

Es relevante ahora porque combina tres factores poco frecuentes en un mismo paquete: licencia Apache 2.0 (permisiva para uso comercial), formato GGUF listo para llama.cpp/Ollama y un entrenamiento específico sobre Wikipedia en 60 idiomas. No obstante, la información pública disponible es muy escasa: no hay benchmarks, no se detalla la longitud de contexto y la model card del autor original no está incluida en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia LFM3; no se detalla en la información proporcionada) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (según la model card); el entrenamiento CPT se realizó sobre Wikipedia en 60 idiomas, pero la ficha solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada. El modelo base es Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages, lo que indica que parte de un LFM3 de 1,7B parámetros al que se le aplicó continued pre-training (CPT) sobre el dataset Soundsus/Wikipedia-60-languages-truncated, un corpus de Wikipedia truncado y compuesto por 60 idiomas. La model card del repositorio cuantizado no incluye información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o instrucción.

La innovación técnica destacable de esta ficha es la propia cuantización: mradermacher genera cuantizaciones estáticas (no imatrix/weighted) con llama.cpp, usando el pipeline de conversión HF a GGUF. La model card indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación y que podrían no planificarse. El proceso de conversión se marca como `convert_type: hf` y `output_tensor_quantised: 1`.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma declarado en la model card).
- Conocimiento enciclopédico multilingüe derivado del CPT sobre Wikipedia en 60 idiomas (aunque el soporte declarado se limita a `en`).
- Conversación multi-turno: la etiqueta `conversational` sugiere que el modelo está preparado para diálogo, aunque no se detalla el formato de plantilla de chat.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles, según las etiquetas del repositorio.
- Ejecución en llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de borradores enciclopédicos: el modelo puede redactar párrafos descriptivos sobre temas generales aprovechando su entrenamiento continuo sobre Wikipedia, útil para prellenar fichas o artículos que luego revise un editor humano.
- Resumen de documentos en inglés: con 1,7B parámetros y cuantización Q4_K_M (1,2 GB), puede desplegarse en un portátil para resumir textos cortos sin conexión a la nube.
- Chatbot de bajo consumo en dispositivos edge: su tamaño reducido permite integrarlo en aplicaciones de escritorio o móviles mediante llama.cpp, ofreciendo respuestas conversacionales básicas sin depender de APIs externas.
- Prototipado rápido de pipelines de NLP: sirve como modelo de referencia para validar arquitecturas de generación antes de escalar a modelos mayores, gracias a su licencia Apache 2.0 y a la disponibilidad de cuantizaciones ligeras.
- Traducción asistida de contenido enciclopédico: aunque la ficha solo declara inglés, el CPT sobre 60 idiomas sugiere cierta competencia multilingüe que puede aprovecharse para traducciones de borrador entre idiomas con revisión posterior.
- Educación y demostraciones: al caber en GPUs de consumo (incluso en 4 GB de VRAM con Q4_K_S), es adecuado para talleres, demos y entornos docentes donde no hay acceso a clústeres.
- Generación de texto en sistemas con restricciones de memoria: la variante Q2_K (0,9 GB) permite ejecutar el modelo en Raspberry Pi o contenedores con límites estrictos de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1 GB (Q2_K) y 2,5 GB (Q8_0) aproximadamente, sumando overhead de contexto; la variante f16 requiere unos 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060). Para f16, se recomienda RTX 3060 12 GB o superior. En entornos de servidor, A100/H100 no son necesarias por el tamaño del modelo, pero pueden usarse para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-CPT-Wikipedia-Languages-GGUF | 1,73B | no disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher; CPT sobre Wikipedia en 60 idiomas |
| Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages | 1,73B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Otros LFM3 de 1,7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de la familia completa en la información proporcionada |
| Alternativas de ~1-2B en GGUF (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2B | 32K-128K típicamente | Apache 2.0 / Llama | GGUF | No se dispone de comparación de rendimiento con este modelo en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre Wikipedia, el modelo puede heredar sesgos de cobertura, sesgo de género y sesgo geográfico propios de la enciclopedia; no se documenta ningún proceso de mitigación.
- Riesgo de alucinación: alto en un modelo de 1,7B sin ajuste por RLHF documentado; no debe usarse como fuente de verdad sin verificación.
- Limitaciones de contexto e idioma: la model card declara únicamente inglés, pese al entrenamiento multilingüe; no se especifica la longitud de contexto soportada, lo que impide planificar cargas de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y del dataset de Wikipedia (que puede tener condiciones propias de atribución).
- Caveat de producción: las cuantizaciones son estáticas y no hay versiones imatrix/weighted, lo que puede degradar la perplejidad en comparación con cuantizaciones ponderadas; la model card advierte que las versiones ponderadas podrían no publicarse.
- El repositorio tiene 0 likes y 609 descargas en el momento de la ficha, lo que indica una adopción muy limitada y poca validación comunitaria.
- No se documentan plantillas de chat ni formato de prompt, lo que puede provocar comportamientos inconsistentes en modo conversacional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-CPT-Wikipedia-Languages-GGUF
- Modelo base: https://huggingface.co/Soundsus/LFM3-1.7B-CPT-Wikipedia-Languages
- Dataset de entrenamiento: https://huggingface.co/datasets/Soundsus/Wikipedia-60-languages-truncated
- Página de resumen del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-CPT-Wikipedia-Languages-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
