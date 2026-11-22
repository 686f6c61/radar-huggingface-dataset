# mradermacher/Smaug-Uncensored-GGUF

## Resumen

Smaug-Uncensored-GGUF es la distribucion en formato GGUF del modelo abacusai/Smaug-Uncensored, publicada por el usuario mradermacher. El modelo base es un transformer de aproximadamente 27.320 millones de parametros (27,3B) afinado mediante DPO (Direct Preference Optimization) por Abacus.AI, orientado a casos de uso "agentic" y a reducir el rechazo de peticiones (por eso la etiqueta "uncensored"). Esta version GGUF esta pensada para inferencia local con llama.cpp y derivados, no para entrenamiento.

La relevancia de esta publicacion es practica: convierte un modelo de 27B en artefactos ligeros (desde 11 GB en Q2_K hasta 29,1 GB en Q8_0) que pueden ejecutarse en hardware de consumo o en servidores modestos. El repositorio incluye ademas dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere capacidades de vision en el modelo base, aunque la model card no detalla su alcance.

La informacion disponible es limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no documenta arquitectura interna, contexto, datos de entrenamiento ni benchmarks. Todo lo que sigue se limita a lo verificable en los metadatos y en la propia model card; los datos no confirmados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos indican un transformer con 27.320.697.856 parametros y etiquetas que lo describen como "agentic" y afinado con DPO. La presencia de ficheros mmproj (multi-modal projection) en el repositorio GGUF indica que el modelo base incorpora un componente multimodal, presumiblemente vision-lenguaje, aunque no se especifica el codificador visual ni la resolucion de imagen soportada.

Respecto al entrenamiento, la unica informacion disponible es que el modelo base fue afinado por Abacus.AI con DPO sobre un modelo previo (no identificado en la documentacion). No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o SFT. Las cuantizaciones de este repositorio son estaticas (no ponderadas por imatrix); el autor remite a su repositorio i1-GGUF para las versiones ponderadas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Orientacion a flujos agenticos (etiqueta "agentic"): uso previsto en tareas de razonamiento multi-paso y automatizacion.
- Afinado con DPO para alineamiento por preferencias, lo que en la practica suele traducirse en respuestas mas directas y menor tasa de rechazo.
- Capacidad multimodal probable (vision) por la presencia de ficheros mmproj, aunque el alcance exacto no esta documentado.
- Soporte bilingue limitado a ingles y chino.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional de 27B: con la cuantizacion Q4_K_M (16,9 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB o en configuraciones CPU+GPU con llama.cpp, cubriendo conversaciones multi-turno sin depender de APIs externas.
- Investigacion sobre alineamiento y rechazo: al ser un modelo "uncensored" afinado con DPO, resulta util para estudiar como varia la tasa de negativas y la calidad de respuesta segun la cuantizacion empleada (comparando Q2_K frente a Q8_0).
- Prototipado de agentes autonomos: la etiqueta "agentic" y el formato GGUF permiten integrarlo en frameworks de agentes locales (por ejemplo, mediante servidores compatibles con la API de OpenAI) para tareas de planificacion y ejecucion de pasos.
- Procesamiento de documentos con componente visual: los ficheros mmproj permiten, en teoria, tareas de imagen-a-texto en pipelines locales, aunque conviene validar el soporte real en la version de llama.cpp utilizada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que lo convierte en un banco de pruebas para medir la degradacion de perplejidad y calidad en un modelo de 27B.
- Desarrollo de aplicaciones bilingues ingles-chino en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del entorno, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~11 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Hay que anadir el consumo de la cache KV segun contexto y el mmproj (~0,7-1,0 GB) si se usa el modo multimodal.
- GPU recomendadas: para Q8_0, una A100 40 GB, H100 o RTX 6000 Ada; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 deja margen para contexto moderado; para Q2_K/Q3, GPUs de 16 GB como RTX 4080 o A4000.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el autor referencia los README de TheBloke para el manejo de ficheros multiparte. El repositorio esta etiquetado como "endpoints_compatible".
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware y de la cuantizacion; a modo orientativo, un 27B en Q4_K_M en una RTX 4090 suele situarse en decenas de tokens por segundo, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Uncensored-GGUF (este) | 27,3B | No disponible | Apache 2.0 | GGUF | Afinado DPO, etiqueta agentic, multimodal via mmproj |
| abacusai/Smaug-Uncensored (base) | 27,3B | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Smaug-Uncensored-i1-GGUF (mismo autor) | 27,3B | No disponible | Apache 2.0 | GGUF | Cuantizaciones ponderadas por imatrix |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de otros autores. Cualquier comparacion con modelos de tamano similar (por ejemplo, familias de 24-34B) requeriria benchmarks que no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- La model card del repositorio GGUF es una plantilla generica de cuantizacion: no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones. La trazabilidad tecnica es, por tanto, muy limitada.
- El caracter "uncensored" implica un filtrado de seguridad reducido; puede generar contenido inapropiado, ofensivo o inseguro y no es adecuado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que permitan cuantificarlo.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad y Q8_0 para maxima fidelidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar de forma independiente las obligaciones derivadas del modelo base y de los datos de entrenamiento originales, no documentados aqui.
- El soporte multimodal depende de la version de llama.cpp y de la correcta carga del fichero mmproj; no hay documentacion de casos de uso validados.
- El repositorio ocupa 190,8 GB en total; la descarga de todas las variantes no es necesaria, pero conviene planificar el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Smaug-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Uncensored
- Cuantizaciones ponderadas (i1): https://huggingface.co/mradermacher/Smaug-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Smaug-Uncensored-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
