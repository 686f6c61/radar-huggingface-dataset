# mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic, publicada por mradermacher. El modelo subyacente parte de Mistral-Small-3.2-24B-Instruct-2506 (familia Mistral Small 3.2, licencia Apache 2.0) y ha sido modificado mediante tecnicas de "abliteration" o "decensoring" para reducir los rechazos y el alineamiento de seguridad del modelo original, segun indican las etiquetas heretic, uncensored y abliterated. Esta version concreta anade ademas el sufijo ARA, presumiblemente una variante de abliteration especifica del autor richardyoung, aunque su metodologia exacta no esta documentada en la informacion disponible.

El repositorio contiene unicamente ficheros GGUF (mas los suplementos multimodales mmproj), pensados para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). La model card es una plantilla generica de mradermacher y no incluye informacion tecnica detallada sobre el proceso de abliteration, los datos de entrenamiento ni evaluaciones de rendimiento.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion practica de un modelo de 24B con capacidades multimodales; por otro, advierte de que se trata de una variante sin alineamiento de seguridad, lo que tiene implicaciones legales y eticas importantes para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small 3.2); detalles exactos de la variante ARA-heretic no disponibles |
| Parametros totales | 24B (nominal, segun el nombre del modelo base); el campo safetensors del repo indica 438.958.080, dato inconsistente con el nombre y probablemente correspondiente a un componente auxiliar o error de metadatos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small 3.2 soporta 128k tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para el codificador multimodal) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Mistral Small 3.2, que emplea una arquitectura transformer densa con capacidades multimodales (vision) y una ventana de contexto amplia. La variante ARA-heretic ha sido sometida a un proceso de "abliteration": una tecnica que identifica y neutraliza las direcciones de activacion asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. La etiqueta "reproducible" sugiere que el autor documenta el procedimiento, aunque los detalles concretos no aparecen en la informacion proporcionada.

No se dispone de datos sobre el numero de tokens de entrenamiento adicional, la composicion del dataset de abliteration ni si hubo fases de RLHF o DPO posteriores. La cuantizacion realizada por mradermacher es estatica (no se han publicado, segun la model card, cuantizaciones ponderadas con imatrix en el momento de la publicacion). El proceso de cuantizacion sigue el flujo habitual de conversion HF a GGUF y posterior cuantizacion con llama.cpp.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo instruct base.
- Capacidades multimodales de vision a traves de los ficheros mmproj (Q8_0 o f16).
- Generacion de codigo y matematicas, segun las capacidades del Mistral Small 3.2 Instruct original.
- Soporte multilingue amplio (24 idiomas listados, incluidos espanol, arabe, hindi, bengali y vietnamita).
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original rechazaria.
- Soporte de tool calling y function calling presumiblemente heredado del modelo base, aunque no se confirma explicitamente en la informacion disponible.
- Capacidad de agentes y razonamiento multi-paso: no confirmada explicitamente para esta variante.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad de las respuestas, comparandolo con el Mistral Small 3.2 original en entornos controlados.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que el modelo base podria rechazar por sus filtros de seguridad, en contextos editoriales profesionales.
- Procesamiento de documentos multimodales: extraccion de informacion de imagenes y PDFs escaneados combinando el modelo de lenguaje con el codificador visual (mmproj), en local.
- Despliegue en local con llama.cpp u Ollama: cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 24B en hardware de consumo con suficiente VRAM o RAM.
- Traduccion y procesamiento multilingue: cobertura de 24 idiomas, util para pipelines de traduccion o analisis de contenido en idiomas menos representados.
- Experimentacion con agentes y tool calling: integracion en flujos que requieran function calling sin las restricciones de contenido del modelo alineado, siempre en entornos de prueba aislados.
- Analisis de contenido sensible en investigacion de ciencias sociales: clasificacion o resumen de textos que tratan temas que el modelo original rechazaria procesar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones y no se dispone de datos comparativos del modelo ARA-heretic frente al Mistral Small 3.2 original.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, modelo de 24B):
  - Q2_K: ~9-10 GB
  - Q4_K_M: ~14-15 GB
  - Q5_K_M: ~17 GB
  - Q8_0: ~25-26 GB
  - f16: ~48 GB
  - Anadir ~0,6-1 GB adicionales si se usa el codificador multimodal (mmproj).
- GPU recomendadas: A100 40/80 GB o H100 para f16; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; GPUs con 16 GB para Q3_K_M o Q4_K_S con offload parcial.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 12-16 GB con cuantizaciones Q2-Q3 o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa (requeririan conversion a safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF (este) | 24B | no disponible | Apache 2.0 | GGUF, abliterated, multimodal |
| Mistral-Small-3.2-24B-Instruct-2506 (original) | 24B | 128k (segun modelo base) | Apache 2.0 | Alineado, con filtros de seguridad |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-Text-Only-heretic-i1-GGUF | 24B | no disponible | Apache 2.0 | Variante solo texto, cuantizacion imatrix |
| mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ultra-uncensored-heretic-GGUF | 24B | no disponible | Apache 2.0 | Variante "ultra-uncensored" con abliteration mas agresiva |

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la abliteration elimina o reduce los rechazos, por lo que puede generar contenido danino, ofensivo o ilegal. No apto para uso en produccion orientado al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la abliteration puede degradar la coherencia y aumentar la generacion de contenido falso.
- Datos de parametros inconsistentes: el campo safetensors del repo indica 438.958.080 parametros, incompatible con un modelo de 24B; conviene verificar el tamano real antes de desplegar.
- Contexto no confirmado: no se especifica la longitud de contexto efectiva de esta variante.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el autor del modelo derivado no ofrece garantias y el uso de contenido generado puede infringir normativas locales (por ejemplo, en la UE respecto a contenido ilicito).
- Cuantizaciones estaticas unicamente: no hay versiones ponderadas con imatrix, lo que puede suponer mayor perdida de calidad en cuantizaciones bajas (Q2, Q3) frente a alternativas i1.
- Model card generica: no documenta el proceso de abliteration ni evaluaciones, lo que dificulta la reproducibilidad y la evaluacion de riesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- Modelo base (autor original): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Small-3.2-24B-Instruct-2506-ARA-heretic-GGUF
- Variante Text-Only heretic i1: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-Text-Only-heretic-i1-GGUF
- Variante ultra-uncensored heretic: https://huggingface.co/mradermacher/Mistral-Small-3.2-24B-Instruct-2506-ultra-uncensored-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
