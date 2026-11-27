# mradermacher/atom-proton-1.2-GGUF

## Resumen

atom-proton-1.2-GGUF es la distribucion en formato GGUF del modelo atom-proton-1.2, desarrollado originalmente por CrowtherLabs y cuantizado por mradermacher. Se trata de un modelo vision-language con capacidades de razonamiento, disenado para tareas que combinan comprension de imagenes y texto con generacion de respuestas razonadas. Con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), se situa en la franja de modelos de gran tamano que requieren hardware especializado para inferencia en precision completa.

La relevancia de esta publicacion radica en que ofrece el modelo original en multiples niveles de cuantizacion GGUF (desde Q2_K hasta Q8_0), lo que permite desplegarlo en configuraciones de hardware mas modestas de lo que exigiria el modelo en safetensors. El repositorio incluye tambien ficheros mmproj (multi-modal projection) necesarios para el procesamiento de imagenes, lo que confirma su naturaleza vision-language.

El modelo esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara soporte unicamente para ingles. La cuantizacion la firma mradermacher, un conocido autor de cuantizaciones GGUF en el ecosistema de Hugging Face, aunque en este caso no se han publicado variantes con imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language; detalles de arquitectura no especificados en la informacion) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los tags del repositorio indican que se trata de un modelo vision-language con capacidades de razonamiento, lo que sugiere una arquitectura multimodal que combina un codificador visual con un modelo de lenguaje, probablemente basada en transformer. El modelo base es CrowtherLabs/atom-proton-1.2, del que no se detallan en esta ficha los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion es la cuantizacion estatica en multiples precisiones realizada por mradermacher, que incluye los ficheros de proyeccion multimodal (mmproj) en Q8_0 y f16 para preservar la capacidad de procesamiento de imagenes en el formato GGUF. No se han publicado cuantizaciones con imatrix para este modelo, segun indica el autor.

## Capacidades

- Generacion de texto y razonamiento: el tag "reasoning" indica capacidades de razonamiento explicito.
- Vision-language: procesamiento conjunto de imagenes y texto mediante los ficheros mmproj incluidos.
- Conversacion: el tag "conversational" sugiere soporte para dialogos multi-turno.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en infraestructuras de inferencia compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede procesar capturas, diagramas o graficos junto con texto para extraer informacion y razonar sobre ella, gracias a su naturaleza vision-language y a los ficheros mmproj incluidos en el repositorio.
- Asistentes conversacionales especializados: su tag "conversational" y su ventana de contexto (no especificada) lo hacen adecuado para dialogos multi-turno en ingles, desplegable mediante llama.cpp u Ollama con cuantizaciones Q4_K_M o Q5_K_M.
- Descripcion y razonamiento sobre imagenes tecnicas: en entornos de documentacion tecnica o soporte, el modelo puede describir y razonar sobre diagramas de arquitectura, esquemas o capturas de pantalla.
- Prototipado en hardware de consumo: las cuantizaciones Q2_K (11,3 GB) y Q3_K_S (12,4 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, facilitando pruebas de concepto sin infraestructura de datacenter.
- Investigacion en modelos multimodales: el formato GGUF con mmproj separado facilita experimentar con la proyeccion visual y el modelo de lenguaje de forma independiente en pipelines de investigacion.
- Despliegue en entornos con restricciones de memoria: la disponibilidad de cuantizaciones desde 11,3 GB hasta 29,1 GB permite adaptar el modelo a distintos presupuestos de VRAM manteniendo la licencia Apache 2.0 para uso comercial.
- Evaluacion comparativa de cuantizaciones: la amplia gama de niveles (Q2 a Q8) permite medir el impacto de la cuantizacion en tareas de razonamiento y vision dentro de un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,3 GB (Q2_K) y 29,1 GB (Q8_0) solo para los pesos del modelo de lenguaje; hay que anadir aproximadamente 0,7-1,0 GB para los ficheros mmproj si se usa la capacidad visual, mas el espacio para el contexto KV.
- GPU recomendadas: para Q8_0 o Q6_K, GPUs con 32-48 GB (A100 40 GB, RTX A6000, L40S); para Q4_K_M (17,1 GB), GPUs de 24 GB como RTX 3090/4090 o A10G; para Q2_K/Q3_K_S, GPUs de 12-16 GB.
- Cabe en GPU de consumo: si, en las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS) en tarjetas de 12-16 GB; Q4_K_M y Q5_K_M en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere soporte en plataformas de inferencia gestionada. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| atom-proton-1.2 (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Vision-language con razonamiento; solo ingles |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre alternativas directas en la documentacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Vision: la capacidad multimodal depende de cargar los ficheros mmproj junto con el modelo; sin ellos, el modelo funciona solo como lenguaje.
- Cuantizacion: las variantes Q2_K y Q3_K_M tienen calidad reducida segun las notas del autor; para produccion se recomienda Q4_K_M o superior.
- Sin imatrix: el autor indica que no hay cuantizaciones ponderadas con imatrix disponibles, lo que puede afectar la calidad en niveles bajos frente a alternativas con imatrix.
- Alucinacion: no se dispone de evaluaciones publicadas sobre tasas de alucinacion; debe validarse en el dominio de uso.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (CrowtherLabs/atom-proton-1.2) por si anaden restricciones adicionales.
- Madurez: el repositorio tiene pocas descargas (474) y cero likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/atom-proton-1.2-GGUF
- Modelo base: https://huggingface.co/CrowtherLabs/atom-proton-1.2
- Pagina de descargas del autor: https://hf.tst.eu/model#atom-proton-1.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
