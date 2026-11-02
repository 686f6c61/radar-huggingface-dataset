# mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-GGUF

## Resumen

Huihui-gemma-4-26B-A4B-it-abliterated-GGUF es una cuantizacion en formato GGUF del modelo huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated, publicada por mradermacher. Se trata de una variante "abliterated" (sin censura, con las direcciones de rechazo eliminadas del modelo base) de Gemma 4 en su configuracion 26B-A4B, es decir, un modelo Mixture of Experts con aproximadamente 25.233 millones de parametros totales y unos 4.000 millones de parametros activos por token. El resultado es un modelo conversacional sin los filtros de rechazo habituales, distribuido en multiples niveles de cuantizacion para su uso en llama.cpp y entornos compatibles.

El modelo esta pensado para desarrolladores e investigadores que necesitan un modelo de gran tamano con coste de inferencia contenido (gracias a su naturaleza MoE) y que quieren evitar los rechazos sistematicos del modelo original en tareas de investigacion, red teaming o generacion de contenido sin restricciones. La cuantizacion GGUF permite ejecutarlo en hardware de consumo, algo inviable con los pesos originales en safetensors.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE eficiente, un proceso de abliteration que altera el comportamiento de seguridad, y un empaquetado GGUF listo para desplegar. Todo ello bajo licencia Apache 2.0 segun los metadatos del repositorio, aunque el modelo base remite a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Gemma 4 (transformer) |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | 4B (configuracion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (con soporte multimodal via mmproj) |

## Arquitectura y entrenamiento

El modelo base es una variante de Gemma 4 con arquitectura Mixture of Experts: 25,2B parametros totales de los que solo 4B se activan por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad de un modelo de mayor tamano. La presencia de ficheros mmproj (multi-modal supplement) en el repositorio indica que el modelo soporta entrada multimodal, presumiblemente vision, aunque la model card no detalla la composicion exacta del entrenamiento ni el numero de tokens utilizados.

El proceso de "abliteration" aplicado por huihui-ai consiste en identificar y eliminar las direcciones de activacion asociadas al rechazo (refusal) en el espacio latente del modelo, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de informacion sobre si el modelo base fue sometido a RLHF o DPO adicional tras la abliteration, ni sobre la composicion del dataset de entrenamiento. La cuantizacion realizada por mradermacher es estatica (quantize_version 2), sin imatrix en este repositorio; las versiones con imatrix se publican en un repositorio separado (i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones sin los rechazos tipicos del modelo alineado original.
- Capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16) que habilitan entrada de imagenes en llama.cpp.
- Soporte de cuantizaciones desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB), lo que permite ajustar calidad y requisitos de memoria.
- Compatible con endpoints (tag endpoints_compatible) y con el ecosistema transformers/llama.cpp.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Investigacion en seguridad y red teaming: el modelo permite estudiar como responde un LLM sin filtros de rechazo, util para analizar vulnerabilidades, sesgos y comportamientos no deseados antes de desplegar sistemas en produccion.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa que aborde tematicas que los modelos alineados suelen rechazar, con control total por parte del investigador.
- Despliegue local en hardware de consumo: gracias a la cuantizacion Q4_K_M (16,9 GB) puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, permitiendo experimentacion offline sin dependencia de APIs.
- Analisis de documentos e imagenes: el soporte mmproj permite procesar capturas, diagramas o imagenes junto con texto en pipelines locales de llama.cpp.
- Prototipado rapido de asistentes conversacionales: con 4B parametros activos, la latencia por token es contenida, adecuada para iterar sobre prompts y flujos conversacionales en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantizacion, lo que permite medir el impacto de la compresion en calidad y velocidad sobre un mismo modelo.
- Fine-tuning y experimentacion academica: al estar bajo Apache 2.0 y disponible en GGUF, sirve como base para estudiar el efecto de la abliteration en tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. Anadir ~0,9-1,3 GB si se usa el mmproj multimodal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y despliegues concurrentes.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al activar solo 4B parametros por token, se espera un throughput superior al de un modelo denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-gemma-4-26B-A4B-it-abliterated (este) | 25,2B | 4B | no disponible | apache-2.0 | GGUF |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated (base) | 25,2B | 4B | no disponible | apache-2.0 | safetensors |
| mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-i1-GGUF | 25,2B | 4B | no disponible | apache-2.0 | GGUF (imatrix) |

La comparativa con modelos de otros autores no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es el formato (GGUF cuantizado frente a safetensors) y frente al repositorio i1-GGUF, el uso de cuantizacion estatica en lugar de imatrix.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico. No es apto para despliegues de cara al publico sin filtros adicionales.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen su fiabilidad.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: los metadatos indican apache-2.0, pero el license_link apunta a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales de uso comercial. Conviene verificar los terminos antes de un uso en produccion.
- La cuantizacion Q2_K y Q3_K_M degradan la calidad de forma notable segun las notas del autor; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 184,9 GB en total; la descarga selectiva de un unico fichero GGUF es posible pero requiere conocer el nombre exacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Huihui-gemma-4-26B-A4B-it-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-gemma-4-26B-A4B-it-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
