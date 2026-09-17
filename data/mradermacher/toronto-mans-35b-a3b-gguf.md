# mradermacher/Toronto-Mans-35B-A3B-GGUF

## Resumen

Toronto-Mans-35B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo devon7y/Toronto-Mans-35B-A3B, publicada por mradermacher, un autor conocido por generar cuantizaciones estáticas de modelos abiertos. Se trata de un ajuste fino de tipo persona y chat orientado al inglés multicultural de Toronto, con especial énfasis en jerga local (slang), construido a partir de un LoRA sobre una base MoE de la familia Qwen3.6.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones), según los datos reales de safetensors del repositorio, y la nomenclatura A3B indica una arquitectura de mezcla de expertos (MoE) con unos 3 mil millones de parámetros activos por token. El repositorio GGUF ocupa 148,3 GB e incluye cinco cuantizaciones publicadas que van desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB).

Su relevancia es acotada pero específica: permite ejecutar localmente un modelo de 35B con coste de inferencia propio de un modelo de 3B activos, y sirve como caso de estudio de adaptación de persona y registro lingüístico regional sobre una base MoE moderna. Se publica bajo licencia apache-2.0, aunque el enlace de licencia apunta a Qwen/Qwen3.6-35B-A3B, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), derivada de Qwen3.6; nomenclatura A3B con ~3B activos; detalles completos no disponibles |
| Parametros totales | 34.660.610.688 (~34,66 mil millones) |
| Parametros activos | ~3 mil millones (inferido de la nomenclatura "A3B"; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (13,0 GB), Q3_K_M (16,9 GB), Q4_K_S (20,0 GB), Q6_K (28,6 GB), Q8_0 (37,0 GB). Las etiquetas del repositorio mencionan además x-f16, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M e IQ4_XS, pero no aparecen en la tabla de archivos publicados |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace de licencia apuntando a Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es devon7y/Toronto-Mans-35B-A3B, un ajuste fino con LoRA sobre una base de la familia Qwen3.6 con arquitectura MoE de 35B totales y aproximadamente 3B activos. La etiqueta "lora" en el repositorio y el dataset declarado (devon7y/toronto-slang-lexicon) apuntan a un entrenamiento de adaptación de persona y vocabulario orientado a la jerga multicultural de Toronto, más que a un preentrenamiento desde cero. No se dispone de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

La innovación principal de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: mradermacher genera cuantizaciones estáticas en varios niveles de precisión. Según las notas del repositorio, no había cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación. El uso de una arquitectura MoE con solo ~3B parámetros activos implica que la velocidad de decodificación se aproxima a la de un modelo mucho menor, aunque el requisito de memoria sigue ligado a los 35B totales, lo que en la práctica obliga a offloading de expertos a CPU o a GPUs de gran capacidad.

## Capacidades

- Generación de texto conversacional en inglés con una persona marcada y registro informal.
- Reproducción de jerga y expresiones propias del inglés multicultural de Toronto, según el dataset declarado.
- Diálogo multi-turno orientado a chat y角色 de compañía.
- Ajuste de estilo y tono regional: el modelo está especializado en un registro coloquial concreto, no en lenguaje neutro.
- Capacidades generales heredadas de la base Qwen3.6-35B-A3B (razonamiento, código y matemáticas) presumiblemente presentes, aunque no documentadas en la información proporcionada.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; no se declaran modalidades adicionales.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional con jerga local: el modelo puede gestionar chats multi-turno donde el usuario espera respuestas en registro coloquial de Toronto, algo que un modelo genérico tiende a neutralizar. Es adecuado porque el ajuste LoRA se entrenó específicamente sobre un léxico de slang.
- Investigación sociolingüística: permite generar corpus sintéticos de habla multicultural de Toronto para estudiar variación léxica y de registro, comparando la salida del modelo ajustado con la de su base sin adaptar.
- Generación de guiones y diálogos: útil para escribir escenas o podcast ambientados en Toronto con vocabulario creíble, aprovechando la especialización de persona sin necesidad de un LLM propietario.
- Despliegue local en estación de trabajo: con la cuantización Q4_K_S (20,0 GB) puede ejecutarse en una GPU de 24 GB mediante llama.cpp u Ollama, ofreciendo velocidad de decodificación cercana a un modelo de 3B activos.
- Mediación lingüística para no nativos: el modelo puede explicar o reformular expresiones de jerga de Toronto a inglés estándar, útil en contextos de onboarding de personal recién llegado.
- Base para nuevos ajustes de persona regional: al estar publicado en safetensors y GGUF, sirve como punto de partida para LoRAs adicionales sobre otras variantes dialectales del inglés.
- Prototipado de chatbots de marca con tono informal: equipos que necesiten validar una experiencia conversacional desenfadada pueden usar la versión Q2_K (13,0 GB) en hardware de gama alta de consumo antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada por cuantización (incluyendo overhead de runtime y una caché KV moderada; la longitud de contexto no está documentada, por lo que la cifra puede variar):
  - Q2_K (13,0 GB): ~14-16 GB de VRAM.
  - Q3_K_M (16,9 GB): ~18-20 GB de VRAM.
  - Q4_K_S (20,0 GB): ~22-24 GB de VRAM.
  - Q6_K (28,6 GB): ~32-36 GB de VRAM.
  - Q8_0 (37,0 GB): ~40-44 GB de VRAM.
- GPU recomendadas: RTX 4080/4090 o RTX 3090 (24 GB) para Q2_K, Q3_K_M y Q4_K_S; A100 40 GB, A100 80 GB, H100 o configuraciones multi-GPU para Q6_K y Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más para las cuantizaciones bajas, y en 24 GB para Q4_K_S. Las cuantizaciones Q6_K y Q8_0 quedan fuera del rango de consumo en una sola GPU.
- Al ser MoE, llama.cpp permite descargar parte de los expertos a CPU y RAM, de modo que el modelo puede ejecutarse con menos VRAM a costa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI sería preferible partir del modelo base en safetensors, no de los archivos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B parámetros activos, es razonable esperar un throughput notablemente superior al de un modelo denso de 35B, pero no hay mediciones publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Toronto-Mans-35B-A3B-GGUF (este) | 34,66B totales, ~3B activos | no disponible | GGUF (5 cuantizaciones) | apache-2.0 | Repositorio con 0 descargas y 0 likes |
| devon7y/Toronto-Mans-35B-A3B (original) | 34,66B totales, ~3B activos | no disponible | safetensors (transformers) | apache-2.0 | Modelo base, referencia del ajuste LoRA |
| Qwen3.6-35B-A3B (base de la familia) | 35B totales, ~3B activos | no disponible | safetensors | Licencia propia de Qwen, referenciada en el enlace de licencia | Modelo upstream; no se dispone de datos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks ni de contexto que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card aportada es una plantilla genérica de cuantización de mradermacher; no incluye evaluación de calidad, sesgos ni comportamiento del modelo.
- Modelo especializado en una persona y un registro muy concretos: puede producir respuestas inadecuadas en contextos formales, profesionales o institucionales.
- El uso de jerga y lenguaje coloquial puede derivar en contenido informal o potencialmente ofensivo según el contexto; no se documenta ningún filtrado de seguridad.
- Riesgo de alucinación: no hay datos de evaluación, y un LoRA de persona no corrige los errores factuales heredados de la base.
- Cobertura monolingüe en inglés; no se declara soporte de castellano ni de otros idiomas.
- No se documenta la longitud de contexto, lo que impide planificar con precisión el consumo de memoria y los escenarios de contexto largo.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), por lo que no existe validación de la comunidad ni informes de fallos.
- Posible discrepancia de licencia: el repositorio declara apache-2.0, pero el enlace de licencia apunta a la licencia del modelo Qwen3.6 base. Conviene verificar los términos aplicables antes de un uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S o superiores.
- No hay cuantizaciones ponderadas ni con imatrix en el momento de la publicación, lo que limita las opciones de optimización fina.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Toronto-Mans-35B-A3B-GGUF
- Modelo base: https://huggingface.co/devon7y/Toronto-Mans-35B-A3B
- Dataset declarado: https://huggingface.co/datasets/devon7y/toronto-slang-lexicon
- Enlace de licencia referenciado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Toronto-Mans-35B-A3B-GGUF
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados obtenidos correspondían a páginas de WhatsApp sin relación con el repositorio.
