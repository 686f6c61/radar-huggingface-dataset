# mradermacher/Morrow-2.6B-CE-GGUF

## Resumen

Morrow-2.6B-CE-GGUF es el conjunto de cuantizaciones GGUF estáticas del modelo Morrow-2.6B-CE, publicado por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original lo desarrolla noumenon-labs y se distribuye como un ajuste fino (fine-tuning con LoRA, entrenado con Unsloth) sobre la arquitectura LFM2 de Liquid AI, según las etiquetas de la model card (lfm2, lora, unsloth).

El modelo cuenta con 2.569.272.320 parámetros (aproximadamente 2,57 mil millones) según los pesos en safetensors del repositorio, y está orientado a generación de texto conversacional en inglés. Su relevancia práctica radica en que las cuantizaciones GGUF publicadas van desde 1,1 GB (Q2_K) hasta 5,2 GB (f16), lo que permite ejecutarlo en hardware de consumo, portátiles sin GPU dedicada e incluso dispositivos con poca memoria, algo poco habitual en modelos conversacionales con esta cantidad de parámetros.

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. La model card del repositorio GGUF es puramente técnica sobre el proceso de cuantización y remite al repositorio del modelo base para los detalles del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (etiqueta `lfm2` en la model card; arquitectura de Liquid AI) |
| Parametros totales | 2.569.272.320 (~2,57 B), dato de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (consultar los términos en la model card del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el repositorio del modelo base |

## Arquitectura y entrenamiento

La arquitectura indicada por el autor es LFM2, la familia de modelos de Liquid AI etiquetada con `lfm2` en este repositorio. Se trata de un modelo denso de 2,57 mil millones de parámetros, no de una mezcla de expertos: no hay parámetros activos ni enrutamiento condicional. El repositorio de mradermacher es exclusivamente una conversión a GGUF del modelo `noumenon-labs/Morrow-2.6B-CE`, generada con cuantizaciones estáticas (el autor indica que no ha publicado cuantizaciones ponderadas con imatrix en el momento de la subida).

Respecto al entrenamiento del modelo base, la información disponible solo indica que se trata de un fine-tuning realizado con LoRA y Unsloth sobre el modelo base de noumenon-labs. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni innovaciones técnicas concretas más allá de la propia arquitectura LFM2. Todos estos datos deben consultarse en la model card del modelo original, no incluida en la información proporcionada.

## Capacidades

- Generación de texto en inglés con orientación conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Ajuste fino específico de dominio o estilo mediante LoRA, lo que permite especialización en tareas concretas sin reentrenar el modelo completo.
- Ejecución local en CPU y GPU gracias a las cuantizaciones GGUF de bajo peso (desde 1,1 GB en Q2_K).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Chatbot conversacional en inglés para aplicaciones de escritorio o web: con la cuantización Q4_K_M (1,7 GB) el modelo cabe en GPUs de 4 GB o incluso en CPU con llama.cpp, lo que permite desplegar un asistente conversacional sin depender de APIs externas ni enviar datos a terceros.
- Asistente local de escritorio con LM Studio u Ollama: el formato GGUF y la variedad de cuantizaciones facilitan la distribución como binario descargable, con una versión ligera (Q2_K, 1,1 GB) para equipos modestos y una de mayor calidad (Q8_0, 2,8 GB) para estaciones de trabajo.
- Generación de datos sintéticos en inglés para ajuste fino: al ser un modelo pequeño y desplegable en lote, puede utilizarse para producir pares instrucción-respuesta o datos de conversación que alimenten pipelines de entrenamiento posteriores, con control de coste por token.
- Prototipado rápido de productos conversacionales: permite validar prompts, flujos multi-turno y plantillas de sistema antes de comprometerse con un modelo mayor, reduciendo el coste de iteración al ejecutarse en una sola GPU de consumo.
- Base para fine-tuning con LoRA: dado que el modelo original ya se entrenó con LoRA y Unsloth, sirve como punto de partida para especializaciones verticales (soporte técnico, atención al cliente, dominios concretos) con requisitos de cómputo moderados.
- Educación y experimentación en entornos con recursos limitados: un modelo de 2,57 B en formato GGUF es adecuado para prácticas de laboratorio, demostraciones docentes y experimentos de interpretabilidad donde el presupuesto de hardware es reducido.
- Moderación o clasificación de texto en inglés: con un ajuste fino ligero o mediante prompting, puede emplearse como filtro de contenido o etiquetador en pipelines de preprocesado, con latencia baja por su tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos proporcionados incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench u otras evaluaciones, y no se han inventado cifras para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada a partir del tamaño de cada cuantización):
  - Q2_K (1,1 GB): ~2 GB de VRAM o ejecución en CPU.
  - Q4_K_S / IQ4_XS (1,5-1,6 GB): ~2,5 GB de VRAM.
  - Q4_K_M (1,7 GB): ~3 GB de VRAM.
  - Q5_K_M (1,9 GB): ~3,5 GB de VRAM.
  - Q6_K (2,2 GB): ~4 GB de VRAM.
  - Q8_0 (2,8 GB): ~4,5-5 GB de VRAM.
  - f16 (5,2 GB): ~6,5-7 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 en adelante para las cuantizaciones altas; A100 y H100 son sobredimensionadas para este tamaño y solo tienen sentido en despliegues con muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más para Q8_0, y en GPUs de 4 GB con cuantizaciones Q4 o inferiores. También funciona en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, text-generation-webui (o cualquier frontend compatible con GGUF); vLLM con soporte experimental de GGUF; TGI no soporta GGUF de forma nativa, requeriría los safetensors del modelo base. Los tags del repositorio incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Morrow-2.6B-CE (este) | 2,57 B | no disponible | other | GGUF en este repositorio; safetensors en el repo base |
| LFM2-2.6B (Liquid AI) | ~2,6 B | no disponible | LFM Open License | Pesos abiertos en HuggingFace |
| Qwen3-1.7B | ~1,7 B | no disponible | Apache 2.0 | Pesos abiertos, amplia disponibilidad de GGUF |
| Gemma 3 1B | ~1 B | no disponible | Gemma Terms of Use | Pesos abiertos, requiere aceptar términos |

Nota: los datos de los modelos alternativos provienen de información pública general y deben verificarse en sus respectivas model cards. En esta comparativa no se incluyen métricas de rendimiento porque no hay benchmarks publicados del modelo analizado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un ajuste fino sobre un modelo base del que no se detalla el corpus, los sesgos heredados no son auditables a partir de esta ficha.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones publicadas de fidelidad factual ni de tasa de alucinación.
- Limitación de idioma: el modelo está etiquetado únicamente como inglés (`en`); no hay evidencia de competencia en castellano u otros idiomas, por lo que no debe asumirse calidad multilingüe.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no es posible dimensionar casos de uso con documentos largos o conversaciones extensas sin verificarlo empíricamente.
- Restricciones de licencia: la licencia es `other`, no una licencia permisiva estándar. Es imprescindible revisar los términos del modelo base (`noumenon-labs/Morrow-2.6B-CE`) antes de cualquier uso comercial.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M degradan la perplejidad de forma notable; para producción se recomienda Q4_K_M o superior, y Q8_0 o f16 cuando la VRAM lo permita.
- Ausencia de cuantizaciones ponderadas: el autor indica que no hay cuantizaciones con imatrix disponibles, que suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación comunitaria y de informes de uso en producción.
- Soporte de tool calling y agentes no verificado: no se documenta ninguna capacidad de function calling ni de razonamiento multi-paso, por lo que no debe asumirse en un diseño de sistema.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Morrow-2.6B-CE-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Morrow-2.6B-CE
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Morrow-2.6B-CE-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de referencia sobre uso de archivos GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis comparativo de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de los metadatos de HuggingFace y de la propia model card.
