# mradermacher/Starlight-Synthesis-31B-GGUF

## Resumen

Starlight-Synthesis-31B es un modelo de lenguaje de aproximadamente 30.700 millones de parámetros desarrollado por Cyclone-Labs mediante técnicas de fusión de modelos (mergekit). Está orientado específicamente a roleplay y narrativa (storytelling), lo que lo posiciona como una alternativa especializada frente a modelos generalistas del mismo rango de tamaño. La versión aquí documentada es una cuantización estática en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo base no es un entrenamiento desde cero, sino una fusión de pesos de otros modelos, una práctica habitual para combinar capacidades de distintos checkpoints sin necesidad de un nuevo ciclo de preentrenamiento. Esto explica que la model card sea escasa en detalles sobre datos de entrenamiento o proceso de alineación: la información disponible se limita a los metadatos de la fusión y a los parámetros declarados en safetensors.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 31B especializado en diálogo creativo en local, con cuantizaciones que van desde 12 GB (Q2_K) hasta 32,7 GB (Q8_0), y con un suplemento multimodal (mmproj) que sugiere capacidades de visión en el modelo base. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados obliga a evaluar su calidad de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de fusión; se infiere transformer denso por el tamaño y el formato de pesos) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) según la model card; el resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Cyclone-Labs/Starlight-Synthesis-31B. Los tags de la model card indican que se trata de una fusión realizada con mergekit, lo que implica que los pesos se obtuvieron combinando los tensores de varios modelos preexistentes mediante alguna estrategia de merge (no especificada). No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable en esta publicación concreta es la disponibilidad de cuantizaciones estáticas en múltiples niveles, incluida una variante IQ4_XS, así como un suplemento multimodal (mmproj) en Q8_0 y f16 que apunta a que el modelo base incorpora un codificador visual. No se documentan técnicas como decodificación especulativa o atención lineal. La model card remite a la página de mradermacher para cuantizaciones ponderadas/imatrix (i1-GGUF), que no forman parte de este repositorio.

## Capacidades

- Generación de texto conversacional y narrativo, con especialización declarada en roleplay y storytelling.
- Capacidades multimodales: la presencia de ficheros mmproj (Q8_0 y f16) sugiere soporte de entrada de imágenes en el modelo base, aunque no se detalla su alcance.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no hay evidencia de otros idiomas.
- No se documentan modos especiales como thinking mode, audio o decodificación restringida.

## Casos de uso

- Roleplay interactivo en local: el modelo está etiquetado explícitamente para roleplay, por lo que puede sostener personajes consistentes en conversaciones multi-turno; su tamaño de 31B permite matices de personalidad que modelos de 7B-13B no alcanzan, y las cuantizaciones Q4_K_M (18,8 GB) lo hacen viable en GPUs de 24 GB.
- Escritura creativa y narrativa asistida: adecuado para generar relatos, diálogos y descripciones con estilo sostenido, gracias a su orientación a storytelling; se puede integrar en un editor con llamadas a llama.cpp vía API compatible con OpenAI.
- Prototipado de chatbots de entretenimiento: con licencia Apache 2.0, se puede desplegar en productos comerciales de ficción interactiva sin las restricciones de licencias tipo Llama, usando vLLM u Ollama según el formato.
- Generación de contenido para juegos de rol de mesa: el modelo puede actuar como máster o NPC dinámico, manteniendo contexto de partida en sesiones largas (la longitud de contexto no está documentada, por lo que conviene validarla empíricamente).
- Evaluación de técnicas de fusión de modelos: útil para investigadores que quieran comparar el comportamiento de merges especializados frente a modelos base del mismo tamaño, con la ventaja de disponer de cuantizaciones listas para pruebas reproducibles.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las variantes Q3_K_S (13,9 GB) y Q4_K_S (17,9 GB) permiten ejecución en GPUs consumer de 16-24 GB o incluso en CPU con RAM suficiente, lo que facilita demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~12 GB de pesos; ~13-14 GB con contexto moderado.
  - Q3_K_S: ~13,9 GB; ~15-16 GB con contexto.
  - Q4_K_M: ~18,8 GB; ~20-21 GB con contexto.
  - Q5_K_M: ~21,9 GB; ~23-24 GB con contexto.
  - Q6_K: ~25,3 GB; ~27 GB con contexto.
  - Q8_0: ~32,7 GB; ~34-35 GB con contexto.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q3_K y Q4_K_S.
- Cabe en GPU consumer: sí, en RTX 4090 con Q4_K_M/Q5_K_M, y en GPUs de 16 GB con Q3_K_S o IQ4_XS (17 GB, ajustado). En 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto. Como referencia cualitativa, la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Starlight-Synthesis-31B (esta ficha) | ~30,7B | no disponible | roleplay, storytelling | Apache 2.0 | GGUF, safetensors (base) |
| Modelos densos generalistas de ~30B (p. ej., familia Yi-34B o Qwen de ~32B) | ~30-34B | variable según versión | generalista | variable | GGUF, safetensors |
| Modelos de roleplay de ~13B (p. ej., merges comunitarios) | ~13B | variable | roleplay | variable | GGUF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas concretas; la comparación anterior es estructural (tamaño, licencia y disponibilidad) y no de rendimiento. Para alternativas específicas del mismo nicho, no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni en evaluaciones de roleplay.
- Al ser una fusión de modelos, puede heredar sesgos y comportamientos de los checkpoints originales, que no están documentados.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas factuales; su orientación a ficción agrava este riesgo si se usa fuera de su dominio.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada: planificar despliegues con contexto largo requiere validación empírica.
- La licencia Apache 2.0 del merge no garantiza que los modelos componentes originales tengan la misma licencia; conviene verificar la trazabilidad antes de un uso comercial crítico.
- El repositorio ocupa 213,9 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la coherencia narrativa; para producción se recomienda Q4_K_M o superior.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Starlight-Synthesis-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Starlight-Synthesis-31B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Starlight-Synthesis-31B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Starlight-Synthesis-31B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
