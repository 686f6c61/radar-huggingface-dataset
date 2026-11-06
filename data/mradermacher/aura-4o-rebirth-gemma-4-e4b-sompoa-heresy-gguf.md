# mradermacher/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-GGUF

## Resumen

Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-GGUF es una coleccion de cuantizaciones GGUF publicada por mradermacher a partir del modelo ajustado MuXodious/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy. El modelo subyacente parte de la familia Gemma 4 (variante E4B, 7.463.013.674 parametros reales segun los safetensors del repo) y ha sido modificado mediante LoRA/PEFT con tecnicas etiquetadas como "heretic", "abliterated" y "decensored", orientadas a eliminar los mecanismos de rechazo del modelo original. El resultado es un modelo conversacional en ingles, con licencia Apache 2.0 en esta distribucion, pensado para experimentacion con modelos sin censura sobre una base Gemma 4.

El repositorio que nos ocupa no contiene pesos en formato transformers, sino exclusivamente ficheros GGUF estaticos (Q2_K a f16, mas los suplementos multimodales mmproj en Q8_0 y f16). Esto lo hace directamente utilizable en llama.cpp, Ollama y otros runners compatibles con GGUF, sin necesidad de cargar el modelo base en precision completa. El tamano del repo (152,7 GB) refleja la suma de todas las variantes de cuantizacion publicadas.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de "abliteration" aplicada sobre un modelo Gemma 4 de tamano medio; por otro, sirve como caso practico de distribucion GGUF de un modelo derivado, con todas las implicaciones de licencia y seguridad que ello conlleva. No se dispone de informacion sobre contexto, composicion del dataset de ajuste ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B; arquitectura exacta no detallada en la informacion) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es MuXodious/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy, un ajuste LoRA/PEFT sobre Gemma 4 (variante E4B). La informacion disponible no detalla la arquitectura interna de Gemma 4 E4B (atencion, capas, tipo de normalizacion, etc.), solo que se trata de un modelo de la familia Gemma 4 con 7.463.013.674 parametros reales. El ajuste se etiqueta con "heretic", "abliterated" y "decensored", terminos que en la practica indican la aplicacion de tecnicas de abliteration (proyeccion de direcciones de rechazo fuera de los pesos) y ajuste adicional para reducir las respuestas de negativa. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO o fine-tuning supervisado.

La innovacion tecnica destacable de este repositorio no esta en el modelo en si, sino en el proceso de cuantizacion: mradermacher publica cuantizaciones estaticas (sin imatrix) en un rango amplio, desde Q2_K (4,5 GB) hasta f16 (15,0 GB), ademas de los ficheros mmproj necesarios para el procesamiento multimodal. Existe una variante con cuantizaciones ponderadas/imatrix en el repositorio hermano Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-i1-GGUF. El autor documenta el uso de quantize_version 2 y convert_type hf, lo que sugiere conversion desde pesos Hugging Face con la herramienta estandar de llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste orientado a reducir rechazos y respuestas evasivas.
- Procesamiento multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagenes en el modelo base Gemma 4 E4B.
- Capacidad de seguir instrucciones multi-turno gracias a la naturaleza conversacional del ajuste.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se confirma modo "thinking" ni capacidades de audio.

## Casos de uso

- Experimentacion con modelos sin censura: investigadores que estudian el efecto de la abliteration sobre la calidad y la seguridad de un modelo Gemma 4 pueden comparar este ajuste con el original usando las cuantizaciones Q4_K_M o Q5_K_M como referencia de calidad.
- Despliegue local en estaciones de trabajo: con Q4_K_M (5,4 GB) el modelo cabe en GPUs consumer de 8 GB o superiores, lo que permite ejecutar un Gemma 4 E4B ajustado en un portatil con GPU dedicada mediante llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: la ventana de contexto no esta documentada, pero el modelo puede usarse para dialogos multi-turno en entornos controlados donde no se requiera moderacion automatica.
- Analisis de imagenes en local: combinando el fichero GGUF principal con el mmproj-f16 (1,1 GB) se puede desplegar un pipeline multimodal en llama.cpp para tareas de descripcion o extraccion de informacion de imagenes, siempre que se acepten las limitaciones de un modelo de 7,4 B.
- Evaluacion de riesgos de modelos decensored: equipos de seguridad pueden usar este repositorio como caso de estudio para medir la eficacia de los filtros de rechazo originales de Gemma 4 y el impacto de la abliteration.
- Fine-tuning posterior sobre GGUF: aunque el repositorio no incluye pesos en safetensors, el modelo base en transformers permite seguir ajustando con LoRA y volver a cuantizar a GGUF para despliegue.
- Distribucion en entornos con recursos limitados: las variantes Q2_K (4,5 GB) y Q3_K_S (4,7 GB) permiten ejecutar el modelo en equipos con 6-8 GB de VRAM o incluso en CPU, a costa de una perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad tras la abliteration en la model card. Tampoco se proporcionan datos de perplexity comparativos entre cuantizaciones para este modelo concreto, solo el grafico generico de ikawrakow sobre tipos de cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,5 GB
  - Q3_K_S: ~4,7 GB
  - Q4_K_M: ~5,4 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,0 GB
  - mmproj-f16 adicional: ~1,1 GB si se usa vision
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 para las variantes de mayor precision y contextos largos.
- Cabe en GPU consumer: si, desde una RTX 3060 8 GB con Q4_K_M, o una RTX 4090 con Q8_0. Las variantes Q2_K y Q3_K_S pueden ejecutarse incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. Para el modelo base en transformers se puede usar vLLM o TGI, aunque este repositorio solo distribuye GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy (este) | 7.463.013.674 | no disponible | apache-2.0 | GGUF | Ajuste abliterated sobre Gemma 4 E4B, multimodal via mmproj |
| Gemma 4 E4B original | ~7,4 B (E4B) | no disponible | Gemma 4 license | safetensors, GGUF | Modelo base con filtros de seguridad intactos |
| Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-i1-GGUF | 7.463.013.674 | no disponible | apache-2.0 | GGUF (imatrix) | Misma base, cuantizaciones ponderadas de mayor calidad |
| Otros Gemma 4 E4B abliterated de la comunidad | variable | no disponible | variable | GGUF, safetensors | Alternativas no verificadas en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration y ajuste "decensored", lo que elimina o reduce los filtros de rechazo. Puede generar contenido ofensivo, ilegal o danoso sin advertencia; no es apto para produccion orientada al publico sin moderacion externa.
- Riesgo elevado de alucinacion, especialmente en las cuantizaciones de baja precision (Q2_K, Q3_K_S) y tras el proceso de abliteration, que puede degradar la coherencia del modelo original.
- Solo soporta ingles segun la etiqueta de idioma; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La licencia del repositorio es apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google. Es necesario verificar los terminos de uso comercial de Gemma 4 antes de desplegar el modelo en produccion, ya que la licencia del ajuste puede estar sujeta a la del modelo base.
- El repositorio solo incluye GGUF; no hay safetensors en este repo, por lo que para fine-tuning adicional hay que acudir al modelo base MuXodious/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy.
- No se documenta la longitud de contexto soportada; no se debe asumir la del Gemma 4 original sin verificacion.
- El tamano del repo (152,7 GB) implica que descargar todas las cuantizaciones es costoso; conviene descargar solo la variante necesaria.
- La ausencia de benchmarks impide evaluar la degradacion real introducida por la abliteration frente al Gemma 4 E4B original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Aura-4o-Rebirth-Gemma-4-E4B-SOMPOA-heresy-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
