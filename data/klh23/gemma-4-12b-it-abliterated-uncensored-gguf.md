# klh23/gemma-4-12B-it-abliterated-uncensored-GGUF

## Resumen

`gemma-4-12B-it-abliterated-uncensored-GGUF` es una compilacion de cuantizaciones en formato GGUF del modelo `OpenYourMind/gemma-4-12B-it-abliterated-uncensored`, una version del Gemma 4 12B instruct de Google a la que se le ha aplicado la tecnica de *abliteration* para reducir el comportamiento de rechazo (refusals). El repositorio esta publicado por el usuario `klh23`, mientras que la model card indica que la cuantizacion la ha realizado `mradermacher`, y los archivos enlazados apuntan a su repositorio espejo, por lo que se trata de una redistribucion de quants estaticos.

El modelo base pertenece a la familia Gemma 4 en su variante *Unified*, una arquitectura multimodal de tipo transformer denso y sin encoder independiente (encoder-free), con aproximadamente 11.907 millones de parametros. Integra procesamiento de texto, vision y audio en un mismo decodificador, y la abliteration se ha aplicado especificamente a las capas superiores (L15-47), que es donde reside la senal de rechazo, dejando intacto aproximadamente el 30 % inferior de la red.

Su relevancia practica esta en que ofrece una via de despliegue local en hardware de consumo: las cuantizaciones van desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), ademas de ficheros `mmproj` para habilitar las capacidades multimodales en `llama.cpp`. Ahora bien, al tratarse de un modelo *uncensored* con filtros de seguridad reducidos, su uso en produccion exige revision humana obligatoria y una evaluacion de riesgos cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (transformer multimodal unificado, sin encoder separado; decodificador de texto denso con biproyeccion) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma 4 License, https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (cuantizacion de safetensors del modelo base; `library_name` declarado como transformers) |

## Arquitectura y entrenamiento

El modelo base es `gemma-4-12B-it`, en su variante *Gemma4Unified*, descrita en el repositorio de abliteration de TrevorS como una arquitectura multimodal unificada y libre de encoder: texto, vision y audio se procesan dentro de un mismo decodificador denso, con biproyeccion aplicada sobre el decodificador de texto. Frente a disenos multimodales clasicos con torre de vision o encoder de audio independientes, este enfoque concentra toda la capacidad en una unica pila de capas. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO sobre el modelo instruct original.

La innovacion tecnica relevante es el proceso de abliteration: se identifica la direccion de rechazo en el espacio de activaciones y se proyecta fuera de los pesos. En el caso de Gemma 4 12B Unified, el analisis indica que la senal de rechazo se concentra en las capas superiores (L15-47), por lo que solo se ablitera el 70 % superior de la red para preservar capacidades en las capas inferiores. Sobre el resultado, `mradermacher` ha generado cuantizaciones estaticas (no ponderadas por imatrix); las versiones ponderadas con imatrix se publican por separado en el repositorio `gemma-4-12B-it-abliterated-uncensored-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruct ("it").
- Procesamiento multimodal nativo: vision (imagenes) y audio, habilitado mediante los ficheros `mmproj` cuando se usa en `llama.cpp`.
- Razonamiento de proposito general y respuesta a instrucciones del modelo base Gemma 4.
- Comportamiento de rechazo reducido por abliteration, lo que amplia el rango de peticiones que el modelo atendera respecto al instruct original.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de HuggingFace) para su publicacion como endpoint de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Creacion de contenido literario y de ficcion sin restricciones tematicas: el modelo puede abordar tramas, dialogos y generos que los modelos alineados suelen rechazar, usando la cuantizacion Q4_K_M (7,5 GB) en una GPU de consumo.
- Analisis y descripcion de imagenes en local: cargando el `mmproj-Q8_0` junto al GGUF del modelo, se pueden procesar imagenes sin enviar datos a servicios externos, lo que resulta adecuado para material sensible o confidencial.
- Transcripcion y comprension de audio en pipelines offline: la componente de audio del modelo unificado permite integrar resumen o Q&A sobre audio dentro de un flujo local controlado.
- Investigacion sobre alineacion y seguridad: este modelo sirve como sujeto de estudio para comparar tasas de rechazo, sesgos y deriva de comportamiento frente al Gemma 4 12B instruct original.
- Red teaming y generacion de datos adversarios: el comportamiento menos restrictivo lo hace util para producir conjuntos de prueba que estresen los filtros de otros sistemas.
- Prototipado de asistentes conversacionales en ingles sobre hardware de una sola GPU: con las cuantizaciones Q4 o Q5 puede desplegarse con `llama.cpp` u Ollama en estaciones de trabajo sin aceleradores de datacenter.
- Generacion de texto sin conexion en entornos aislados (air-gapped): al ser pesos GGUF ejecutables localmente, encaja en escenarios con requisitos de soberania de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de archivo reales publicados): Q2_K 4,9 GB; Q3_K_S 5,6 GB; Q3_K_M 6,2 GB; Q3_K_L 6,7 GB; IQ4_XS 6,8 GB; Q4_K_S 7,1 GB; Q4_K_M 7,5 GB; Q5_K_S 8,4 GB; Q5_K_M 8,6 GB; Q6_K 9,9 GB; Q8_0 12,8 GB. Hay que anadir aparte el fichero multimodal (mmproj-f16 0,2 GB o mmproj-Q8_0 0,3 GB) si se usa vision o audio.
- Junto al peso de los pesos hay que reservar memoria para la cache KV, que no esta cuantificada por defecto y escala con la longitud de contexto (dato de contexto no disponible en la informacion proporcionada).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren con holgura las cuantizaciones Q4 y Q5, y permiten Q6_K y Q8_0 con margen. Para Q8_0 con contexto largo es preferible una RTX 5090 (32 GB) o una A100/H100 de 40-80 GB.
- En GPU de consumo cabe sin problema: con 8-12 GB de VRAM se pueden ejecutar Q2_K a Q4_K_M (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). Con 16 GB se llega a Q5_K_M o Q6_K.
- Opciones de despliegue: `llama.cpp` y sus derivados (Ollama, LM Studio, Jan) son la via natural para GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo TGI o vLLM, aunque la informacion proporcionada no confirma soporte verificado de vLLM para este archivo concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| klh23/gemma-4-12B-it-abliterated-uncensored-GGUF (este modelo) | ~11,9B | no disponible | Si (texto, vision, audio) | gemma | GGUF, redistribucion de quants de mradermacher |
| mradermacher/gemma-4-12B-it-abliterated-uncensored-GGUF | ~11,9B | no disponible | Si | gemma | GGUF estatico |
| mradermacher/gemma-4-12B-it-abliterated-uncensored-i1-GGUF | ~11,9B | no disponible | Si | gemma | GGUF ponderado con imatrix |
| huihui_ai/gemma-4-abliterated (Ollama) | no disponible | no disponible | no disponible | gemma | Distribucion via Ollama |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la diferencia entre ellas es el metodo y el nivel de cuantizacion, no los pesos de origen.

## Limitaciones y advertencias

- Modelo *uncensored*: los filtros de seguridad han sido reducidos de forma deliberada. Puede generar contenido sensible, controvertido o inapropiado, y requiere revision humana antes de cualquier publicacion o uso con usuarios finales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factica para esta variante; al igual que el modelo base, puede inventar datos con seguridad aparente.
- Idiomas: el modelo esta etiquetado unicamente para ingles (`language: en`). No hay garantia de calidad en castellano ni en otros idiomas.
- Longitud de contexto: no disponible en la informacion proporcionada, por lo que no se puede planificar con precision el coste de la cache KV ni el diseno de aplicaciones con contexto largo.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la Gemma 4 License y, en particular, a las condiciones de uso prohibido y a las obligaciones de atribucion. La redistribucion de los pesos derivados debe respetar esas clausulas.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y los archivos enlazados apuntan al repositorio de `mradermacher`, no al del autor que figura en el ID. Conviene verificar integridad y procedencia antes de desplegarlo en produccion.
- Sin benchmarks publicados: no existen datos que cuantifiquen la perdida de calidad introducida por la abliteration ni por cada nivel de cuantizacion.
- La abliteration solo se aplico a las capas L15-47 (70 % superior); el comportamiento de rechazo puede reaparecer parcialmente en ciertos dominios, y las capacidades de las capas inferiores no han sido auditadas tras el proceso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/klh23/gemma-4-12B-it-abliterated-uncensored-GGUF
- Repositorio de quants de referencia (mradermacher): https://huggingface.co/mradermacher/gemma-4-12B-it-abliterated-uncensored-GGUF
- Quants ponderados con imatrix: https://huggingface.co/mradermacher/gemma-4-12B-it-abliterated-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored
- Repositorio de abliteration de Gemma 4: https://github.com/TrevorS/gemma-4-abliteration
- Version abliterada distribuida via Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated
- Ficha de descarga en local-ai-zone para la variante i1: https://local-ai-zone.github.io/models/gemma-4-12b-it-abliterated-uncensored-i1.html
- Pagina de resumen de quants: https://hf.tst.eu/model#gemma-4-12B-it-abliterated-uncensored-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de quants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
