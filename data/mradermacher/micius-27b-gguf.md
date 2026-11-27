# mradermacher/Micius-27B-GGUF

## Resumen

Micius-27B-GGUF es la versión cuantizada en formato GGUF del modelo Micius-Flash, desarrollado por zhiman-ai y convertido por mradermacher. Se trata de un modelo multimodal de tipo vision-language orientado a tareas de ingeniería, diseño de semiconductores y hardware, con capacidades agénticas. El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 27B), lo que lo sitúa en la gama de modelos de gran tamano ejecutables en hardware de consumo mediante cuantización agresiva.

La relevancia de esta ficha radica en que permite ejecutar un modelo especializado en ingeniería en entornos locales mediante llama.cpp y derivados, algo poco habitual en modelos de dominio técnico. La cuantización estática ofrecida por mradermacher cubre desde Q2_K (11,2 GB) hasta Q8_0 (28,7 GB), además de los ficheros mmproj necesarios para el procesamiento de imágenes.

La licencia es estrictamente no comercial (zhiman-non-commercial-research-license-v1.0), lo que restringe su uso a investigación. El modelo está etiquetado únicamente en inglés y no se dispone de información publicada sobre arquitectura interna, contexto o datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; detalles internos no publicados) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | zhiman-non-commercial-research-license-v1.0 (no comercial) |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Micius-Flash en la documentación proporcionada. Las etiquetas indican que es un modelo multimodal vision-language con capacidades agénticas, orientado a dominios de ingeniería, semiconductores y diseno de hardware. El modelo base está en formato safetensors y la versión aquí descrita es una conversión estática a GGUF realizada con la herramienta de mradermacher (convert_type hf, quantize_version 2).

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La cuantización es estática (no imatrix), y el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta conversational).
- Procesamiento de imágenes mediante los ficheros mmproj (multimodal vision-language).
- Razonamiento y asistencia en dominios de ingeniería: semiconductores, diseno de hardware.
- Capacidades agénticas (etiqueta agentic), orientadas a flujos de trabajo multi-paso.
- Soporte de tool calling / function calling: no confirmado explícitamente en la documentación disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en diseno de circuitos y semiconductores: el modelo está especializado en ingeniería de hardware, por lo que puede emplearse para revisar especificaciones, proponer topologías o explicar conceptos de diseno de chips en un entorno de investigación.
- Análisis de diagramas y esquemas técnicos: gracias al componente vision-language (mmproj), puede procesar imágenes de esquemas eléctricos o diagramas de bloques y generar descripciones o sugerencias.
- Prototipado de agentes de ingeniería: sus capacidades agénticas permiten encadenar pasos de razonamiento sobre documentación técnica, siempre en un contexto de investigación no comercial.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,8 GB) permiten ejecutarlo en GPUs de consumo con 24 GB de VRAM, útil para laboratorios sin acceso a clústeres.
- Experimentación académica en modelos de dominio: sirve como base para estudiar el comportamiento de modelos especializados en ingeniería bajo cuantización, comparando calidad entre Q2_K y Q8_0.
- Evaluación de pipelines multimodales en llama.cpp: los ficheros mmproj permiten probar flujos de visión-lenguaje en entornos locales sin depender de APIs externas.
- Investigación sobre alineación en dominios técnicos: al ser de licencia no comercial, es adecuado para estudiar sesgos y alucinaciones en respuestas de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~11,2 GB; Q3_K_M ~13,6 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,8 GB; Q5_K_M ~19,4 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Anadir ~0,7-1,0 GB para el fichero mmproj si se usa visión.
- GPU recomendadas: para Q8_0 se requiere una GPU con 32 GB o más (A100 40GB, H100); para Q4_K_M basta una RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo caben Q2_K y Q3_K_S con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre modelos comparables de la misma categoría (vision-language especializados en ingeniería) en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Micius-27B-GGUF | ~27B | no disponible | no comercial | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia estrictamente no comercial (zhiman-non-commercial-research-license-v1.0): prohibido el uso comercial sin autorización expresa del titular.
- Solo soporta inglés según la etiqueta de idioma; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos de lenguaje; especialmente crítico en dominios técnicos donde una respuesta errónea sobre hardware puede tener consecuencias.
- No se han publicado detalles de entrenamiento ni evaluaciones, lo que impide estimar sesgos conocidos o calidad real.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; el autor recomienda Q4_K_S o superior para uso práctico.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede reducir la calidad frente a alternativas dinámicas.
- El modelo base es de reciente publicación (noviembre de 2026) y cuenta con muy pocas descargas (683) y likes (1), por lo que la validación comunitaria es mínima.
- Compatibilidad con tool calling no confirmada; verificar antes de integrar en pipelines agénticos en producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Micius-27B-GGUF
- Modelo base: https://huggingface.co/zhiman-ai/Micius-Flash
- Licencia del modelo base: https://huggingface.co/zhiman-ai/Micius-Flash/blob/main/LICENSE
- Página de descargas del autor: https://hf.tst.eu/model#Micius-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
