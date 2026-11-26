# mradermacher/Index-Homura-9B-GGUF

## Resumen

Index-Homura-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8,95 B) desarrollado por IndexTeam y orientado a tareas de traducción y doblaje (dubbing). La versión aquí documentada es una cuantización estática en formato GGUF realizada por mradermacher, pensada para ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo se distribuye bajo licencia Apache 2.0 y declara únicamente el inglés como idioma soportado en su model card, lo que resulta llamativo para un modelo etiquetado como de traducción. La información pública disponible es escasa: no se detallan la arquitectura interna, la longitud de contexto ni los datos de entrenamiento, por lo que buena parte de las especificaciones técnicas deben marcarse como no disponibles.

Su relevancia actual reside en la disponibilidad de cuantizaciones GGUF listas para usar (desde Q2_K hasta f16), que permiten desplegar un modelo de casi 9 B en GPUs de consumo y en CPU, algo útil para pipelines de traducción y doblaje en local con requisitos de privacidad o de coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo causal, inferido del uso de `transformers`; no confirmado en la información) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |
| Tamaño del repositorio | 81,4 GB |
| Librería | transformers (metadato); ejecución vía llama.cpp para GGUF |
| Modelo base | IndexTeam/Index-Homura-9B |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base IndexTeam/Index-Homura-9B: la model card de la cuantización no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de capas, cabezas de atención o dimensiones ocultas. El recuento de parámetros (8,95 B) y el uso declarado de la librería `transformers` son los únicos datos estructurales confirmados.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, proporción de datos de traducción o doblaje), ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La model card del repositorio GGUF se limita a describir el proceso de cuantización estática: indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación, y que se generaron cuantizaciones estáticas a partir del modelo en formato Hugging Face (`convert_type: hf`).

## Capacidades

- Traducción: el pipeline declarado es `translation`, y las etiquetas incluyen `translation` y `dubbing`, lo que sugiere un ajuste orientado a traducción de texto y posiblemente a doblaje.
- Generación de texto conversacional: la etiqueta `conversational` indica uso en diálogo multi-turno.
- Doblaje: la etiqueta `dubbing` apunta a un uso previsto en flujos de localización audiovisual, aunque no se detalla si el modelo procesa audio o solo texto.
- Idiomas: la model card declara únicamente inglés (`en`); no se confirma el par o pares de idiomas cubiertos en la traducción.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información.

## Casos de uso

- Traducción de documentación técnica en local: al disponer de cuantizaciones Q4_K_M de 5,7 GB, el modelo puede ejecutarse en una GPU de consumo o en CPU para traducir lotes de documentos sin enviar datos a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Localización de subtítulos para vídeo: el pipeline de traducción y la etiqueta `dubbing` lo hacen adecuado para generar versiones traducidas de guiones y subtítulos en pipelines automatizados, con revisión humana posterior.
- Doblaje asistido: integrado en una herramienta de TTS, el modelo podría producir el texto traducido que alimenta la síntesis de voz, manteniendo el flujo completo en infraestructura propia.
- Procesamiento por lotes en CPU: la cuantización Q2_K (3,9 GB) permite ejecutar el modelo en servidores sin GPU para tareas de traducción de baja prioridad o de gran volumen donde la latencia no es crítica.
- Prototipado rápido de aplicaciones de traducción: con Ollama o llama.cpp, un desarrollador puede levantar un endpoint de traducción en minutos para validar una idea de producto antes de invertir en infraestructura mayor.
- Filtrado y pre-traducción en CMS multilingües: el modelo puede generar borradores de traducción que después se revisan y publican, reduciendo el coste de traducción profesional en contenidos de alto volumen y baja criticidad.
- Investigación sobre cuantización: las doce variantes GGUF publicadas permiten estudiar la degradación de calidad en tareas de traducción según el nivel de cuantización, comparando Q2_K frente a Q8_0 o f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): aproximadamente 4 GB con Q2_K, 5,5-5,7 GB con Q4_K_S/Q4_K_M, 6,4-6,6 GB con Q5_K_S/Q5_K_M, 7,5 GB con Q6_K, 9,6 GB con Q8_0 y 18 GB con f16. Hay que añadir la memoria de la caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: para f16, una GPU de 24 GB o más (RTX 3090/4090, A100, H100). Para Q8_0, una GPU de 12-16 GB es suficiente. Para Q4_K_M, una GPU de 8 GB puede alojar los pesos, aunque el contexto disponible quedará limitado.
- GPU de consumo: sí, cabe en tarjetas de 8 GB o más con cuantizaciones Q4 o inferiores; con Q2_K podría ejecutarse incluso en GPUs de 6 GB, a costa de calidad.
- Despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo API, aunque no se detalla el proveedor. Para el modelo base en safetensors, vLLM o TGI serían opciones, pero no se confirma su compatibilidad.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a características estructurales. Se incluyen alternativas de tamaño similar orientadas a traducción o uso general; los datos de las alternativas provienen de conocimiento general y deben verificarse en sus respectivas model cards.

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Index-Homura-9B (esta ficha) | 8,95 B | no disponible | Apache 2.0 | GGUF, safetensors | Traducción y doblaje |
| Gemma 2 9B | 9,2 B | 8.192 tokens | Gemma Terms | safetensors, GGUF | Uso general |
| Mistral 7B v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Uso general |
| NLLB-200 distilled 1.3B | 1,3 B | 512 tokens | CC-BY-NC 4.0 | safetensors | Traducción multilingüe |

La ventaja principal de Index-Homura-9B frente a las alternativas es su licencia Apache 2.0 combinada con un enfoque específico en traducción y doblaje, mientras que NLLB-200 restringe el uso comercial. Frente a Gemma 2 9B y Mistral 7B, su especialización podría ofrecer mejores resultados en traducción, pero no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no se confirma qué idiomas de destino cubre la traducción, lo que limita su evaluación para pares concretos.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el procesamiento de documentos largos.
- Sin benchmarks: no hay datos públicos de calidad de traducción (BLEU, COMET, etc.) que permitan comparar con alternativas.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones fluidas pero incorrectas, especialmente en dominios técnicos o con terminología especializada; se recomienda revisión humana en producción.
- Sesgos: no se documenta ningún análisis de sesgos; al estar entrenado presumiblemente con datos web, puede heredar sesgos culturales y de género.
- Cuantizaciones de baja calidad: el autor advierte que Q3_K_M es de "lower quality" y que Q2_K, aunque pequeño, degrada notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base IndexTeam/Index-Homura-9B, ya que la cuantización hereda sus términos.
- Información escasa: la ausencia de documentación sobre entrenamiento y evaluación dificulta la auditoría del modelo para usos regulados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Index-Homura-9B-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Homura-9B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Index-Homura-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
