# mradermacher/atom-proton-1.0-GGUF

## Resumen

atom-proton-1.0-GGUF es la versión cuantizada en formato GGUF del modelo atom-proton-1.0, desarrollado originalmente por CrowtherLabs. Se trata de un modelo vision-language de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a tareas de razonamiento multimodal. La cuantización ha sido realizada por mradermacher, un conocido publicador de versiones GGUF para la comunidad de inferencia local.

El modelo base combina capacidades de visión y lenguaje, lo que permite procesar imágenes junto con texto para tareas de razonamiento visual. Los tags del repositorio indican explícitamente "vision-language" y "reasoning", además de "conversational", lo que sugiere que está optimizado para interacción conversacional multi-turno. El idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo multimodal de gran tamaño en hardware de consumo mediante cuantización GGUF, con opciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de los archivos mmproj necesarios para el procesamiento de imágenes. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language basado en transformer; detalles no especificados en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base atom-proton-1.0 en la documentacion proporcionada. Los tags indican que se trata de un modelo vision-language con capacidades de razonamiento, lo que implica la presencia de un codificador visual acoplado a un modelo de lenguaje de aproximadamente 27,3 mil millones de parametros. El repositorio GGUF incluye archivos mmproj (multi-modal projection) en precision Q8_0 y f16, que son los componentes necesarios para proyectar las representaciones visuales al espacio del modelo de lenguaje en llama.cpp.

En cuanto al entrenamiento, no se especifican el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado es una plantilla generada por la herramienta de mradermacher y no incluye informacion sobre el proceso de entrenamiento del modelo original. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multimodal: procesamiento conjunto de imagenes y texto (vision-language).
- Razonamiento de varios pasos (el tag "reasoning" asi lo indica).
- Interaccion conversacional multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con APIs de inferencia.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o contratos y extraer informacion estructurada combinando vision y razonamiento textual, gracias a su naturaleza vision-language.
- Asistencia conversacional en ingles: al estar etiquetado como "conversational", es adecuado para chatbots de soporte en ingles que requieran mantener contexto multi-turno, aunque la longitud de contexto no esta documentada.
- Descripcion automatica de imagenes: generacion de captions y descripciones detalladas para catalogos de productos, bibliotecas de imagenes o accesibilidad.
- Razonamiento visual para educacion: resolucion de problemas que combinan diagramas, graficos o figuras con explicaciones textuales, aprovechando el tag "reasoning".
- Despliegue local con llama.cpp: gracias a las cuantizaciones desde 11,0 GB (Q2_K) hasta 29,1 GB (Q8_0), puede ejecutarse en estaciones de trabajo con GPU de consumo, permitiendo prototipado sin infraestructura cloud.
- Integracion en pipelines de inferencia via endpoints: el tag "endpoints_compatible" sugiere que puede servirse detras de APIs compatibles con el ecosistema transformers/llama.cpp para aplicaciones de analisis multimodal por lotes.
- Verificacion visual de contenido: moderacion o inspeccion de imagenes con justificacion textual, usando el componente mmproj para el procesamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 11,0 GB.
  - Q3_K_S: aproximadamente 12,4 GB.
  - Q3_K_M: aproximadamente 13,6 GB.
  - Q3_K_L: aproximadamente 14,7 GB.
  - IQ4_XS: aproximadamente 15,5 GB.
  - Q4_K_S: aproximadamente 15,9 GB.
  - Q4_K_M: aproximadamente 16,9 GB.
  - Q5_K_S: aproximadamente 19,1 GB.
  - Q5_K_M: aproximadamente 19,6 GB.
  - Q6_K: aproximadamente 22,5 GB.
  - Q8_0: aproximadamente 29,1 GB.
  - Componente visual mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16), adicional a la cuantizacion del modelo de lenguaje.
- GPU recomendadas: para Q4_K_M (16,9 GB) se necesita al menos una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) o reparto entre dos GPU. Para Q8_0 (29,1 GB) se requiere una A100 40 GB, L40S 48 GB o H100. Para Q2_K/Q3_K puede ser viable en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con margen limitado para contexto.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando cuantizaciones Q4_K_S o Q4_K_M; en 16 GB solo con cuantizaciones Q2_K o Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (a partir de GGUF), y servidores compatibles con GGUF. vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Tamano total del repositorio: 190,8 GB (incluye todas las cuantizaciones y los archivos mmproj).

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, se puede comparar con otros modelos vision-language de rango 27B en formato GGUF:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| atom-proton-1.0 (este) | 27,3 mil millones | no disponible | apache-2.0 | si (Q2_K a Q8_0, mmproj) | vision-language, reasoning, solo ingles |
| Alternativas de ~27B vision-language | no disponible | no disponible | no disponible | no disponible | no se dispone de datos verificados en la informacion proporcionada |

No se han publicado comparativas de rendimiento entre este modelo y alternativas en la documentacion disponible.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sera deficiente.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Alucinacion: no hay evaluaciones publicadas sobre tasas de alucinacion; en tareas de razonamiento visual el riesgo de descripciones incorrectas de imagenes es inherente y debe mitigarse con verificacion.
- Sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad, especialmente en tareas multimodales; se recomienda Q4_K_M o superior para produccion.
- Componente visual: es imprescindible descargar el archivo mmproj correspondiente; sin el, el modelo no procesara imagenes.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia; conviene verificar la licencia del modelo base CrowtherLabs/atom-proton-1.0 por si difiere.
- Produccion: al no haber benchmarks publicos ni datos de throughput, no se recomienda desplegar en produccion critica sin una evaluacion propia previa.
- Fecha de creacion del repositorio (2026-08-27) y actualizacion (2026-10-07): verificar que la version descargada corresponde a la revision deseada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/atom-proton-1.0-GGUF
- Modelo base: https://huggingface.co/CrowtherLabs/atom-proton-1.0
- Modelo base referenciado en tags: https://huggingface.co/CrowtherLabs/atom-proton-1.2
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/atom-proton-1.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#atom-proton-1.0-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
