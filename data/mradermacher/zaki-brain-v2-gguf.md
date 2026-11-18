# mradermacher/zaki-brain-v2-GGUF

## Resumen

`mradermacher/zaki-brain-v2-GGUF` es una publicacion de cuantizaciones estaticas en formato GGUF del modelo `harirhm/zaki-brain-v2`, realizada por el usuario mradermacher, conocido en Hugging Face por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. No se trata de un modelo original, sino de una distribucion derivada: el autor del modelo base es harirhm y el trabajo de mradermacher consiste en convertir los pesos a formatos GGUF de distinta precision.

El modelo base cuenta con 475.729.088 parametros totales (aproximadamente 476 millones), lo que lo situa en la categoria de modelos pequenos, adecuados para inferencia en CPU o en GPU de gama baja. La model card del repositorio indica el idioma ingles como unico idioma declarado y no proporciona informacion sobre arquitectura, contexto, datos de entrenamiento ni licencia.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar un modelo de ~476 M de parametros en entornos con recursos restringidos mediante llama.cpp u Ollama. La informacion publicada es muy escasa, por lo que muchos campos de esta ficha se marcan como "no disponible". Ademas, la model card incluye referencias a ficheros `mmproj` (suplemento multimodal), lo que sugiere que el modelo base podria tener capacidad de vision, aunque no se detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 475.729.088 (~476 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | static: f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors via transformers |
| Tamano del repo | 1,5 GB |
| Modelo base | harirhm/zaki-brain-v2 |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-18 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `harirhm/zaki-brain-v2`: la model card del repositorio cuantizado no describe si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o cualquier otra variante. Tampoco se detallan el numero de capas, la dimension oculta, el mecanismo de atencion ni el tokenizador empleado.

Respecto al entrenamiento, no se publican datos sobre el volumen de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion tecnica concreta es la presencia de ficheros `mmproj` (multi-modal projection) en el repositorio, que en el ecosistema llama.cpp se emplean para modelos con capacidad de vision, lo que sugiere que el modelo base podria aceptar entradas de imagen ademas de texto. Esta inferencia no esta confirmada por la documentacion disponible.

La innovacion tecnica del repositorio es exclusivamente la cuantizacion: se ofrecen cuantizaciones estaticas (no ponderadas por imatrix) en un rango amplio de precisiones, desde f16 hasta Q2_K, lo que permite ajustar el modelo a distintos presupuestos de memoria. El autor indica que las cuantizaciones ponderadas por imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles, segun el unico idioma declarado en la model card.
- Posible soporte multimodal (vision) inferido de la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16`, aunque no confirmado en la documentacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de codigo, matematicas ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de audio.
- El reducido tamano (~476 M de parametros) limita las capacidades esperables a tareas de generacion sencilla, clasificacion o extraccion, sin que existan datos publicados que lo confirmen.

## Casos de uso

- Prototipado local en equipos sin GPU: al tratarse de un modelo de ~476 M de parametros cuantizado en Q4_K_M o Q5_K_M, puede ejecutarse en CPU con llama.cpp o Ollama en portatiles convencionales, lo que permite experimentar con generacion de texto sin infraestructura dedicada.
- Procesamiento por lotes de texto en ingles en entornos con memoria limitada: las cuantizaciones Q2_K y Q3_K_S reducen el peso del modelo a unos cientos de MB, lo que facilita su despliegue en contenedores con restricciones estrictas de RAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece una matriz amplia de precisiones (desde f16 hasta Q2_K), lo que permite medir el impacto de la cuantizacion en la calidad de salida sobre un mismo modelo base.
- Educacion y demostraciones: un modelo pequeno en GGUF es util para explicar el funcionamiento de llama.cpp, la conversion de pesos y la inferencia cuantizada en cursos o talleres.
- Filtrado o clasificacion ligera de textos en ingles dentro de pipelines: si el modelo base fue entrenado para tareas de este tipo, el coste computacional por inferencia seria bajo, aunque no hay documentacion que confirme su calidad en estas tareas.
- Pruebas de integracion con herramientas compatibles con GGUF (llama.cpp, Ollama, text-generation-webui, LM Studio) antes de migrar a modelos mayores, gracias a la disponibilidad de multiples ficheros de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dependera de la cuantizacion elegida. Para un modelo de ~476 M de parametros, las cuantizaciones de 4 bits ocupan aproximadamente 250-300 MB de pesos; f16 ronda los 0,95 GB. El repo completo ocupa 1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede alojar las cuantizaciones de 4 bits; una RTX 3060, RTX 4060 o superior ofrece margen suficiente para contexto amplio. En GPU de datacenter (A100, H100) el modelo es sobredimensionado en recursos y no aprovecha su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1050 Ti en adelante, con 4 GB o mas), y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Para un modelo de este tamano, en CPU se espera un throughput bajo pero funcional; en GPU consumer, muy alto, aunque no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria ni ofrece datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: no se publican arquitectura, contexto, datos de entrenamiento, licencia ni benchmarks, lo que impide evaluar su calidad o idoneidad para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base `harirhm/zaki-brain-v2` antes de cualquier despliegue.
- Idioma limitado al ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos; con ~476 M de parametros el riesgo de afirmaciones incorrectas es alto, aunque no hay evaluaciones publicadas.
- Posible capacidad multimodal no documentada: la presencia de ficheros `mmproj` sugiere vision, pero no se detalla que tareas cubre ni con que calidad.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas por imatrix, lo que puede suponer una perdida de calidad algo mayor en las precisiones bajas (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- Modelo derivado: cualquier problema de calidad, sesgo o licencia del modelo base se hereda en estas cuantizaciones.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/zaki-brain-v2-GGUF
- Modelo base: https://huggingface.co/harirhm/zaki-brain-v2
- Pagina de descargas del autor: https://hf.tst.eu/model#zaki-brain-v2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
