# mradermacher/XORTRON-G4-26B-heretic2-PIQA-GGUF

## Resumen

XORTRON-G4-26B-heretic2-PIQA-GGUF es una cuantizacion en formato GGUF del modelo base darkc0de/XORTRON-G4-26B-heretic2-PIQA, publicada por el usuario mradermacher. Se trata de una distribucion de pesos ya cuantizados en multiples niveles (desde Q2_K hasta Q8_0, ademas de ficheros mmproj para componentes multimodales), pensada para su uso con llama.cpp y entornos compatibles con GGUF. El modelo original cuenta con 25.233.142.046 parametros segun los pesos en safetensors, lo que lo situa en la categoria de aproximadamente 26B parametros.

El modelo base pertenece a la familia XORTRON, un linaje de modelos comunitarios de gran tamano que, por el nombre, sugiere una variante afinada con tecnicas de "abliteration" o "heretic" (eliminacion de rechazos o alineamiento laxo) y entrenamiento adicional en tareas de razonamiento (PIQA, del ingles Physical Interaction Question Answering). La publicacion de esta version GGUF facilita el despliegue local en hardware de consumo sin necesidad de infraestructura de GPU de datacenter.

La relevancia de esta ficha radica en que es una cuantizacion reciente (creada en noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, y con informacion tecnica muy limitada en su model card. El autor de la cuantizacion no proporciona datos de benchmarks, licencia explicita ni detalles sobre el entrenamiento del modelo base, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base no especifica; por el nombre y el uso de mmproj se infiere un transformer multimodal, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base darkc0de/XORTRON-G4-26B-heretic2-PIQA en la documentacion proporcionada. El recuento de parametros (25,2B) y la presencia de ficheros mmproj en la cuantizacion sugieren un modelo multimodal con un proyector de vision, pero la model card no confirma la arquitectura subyacente (transformer denso, MoE, hibrido, etc.). El sufijo "heretic2" en el nombre es habitual en la comunidad para indicar variantes sometidas a procesos de ablacion de alineamiento (abliteration) que reducen los rechazos del modelo, aunque no hay confirmacion oficial de ello en la informacion disponible.

Tampoco se especifican los datos de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de post-entrenamiento. La cuantizacion de mradermacher es estatica (no se han generado cuantizaciones ponderadas/imatrix en el momento de la publicacion, segun indica el propio autor), lo que implica que los niveles de cuantizacion son los estandar de llama.cpp sin ajuste fino por importancia de pesos. El repositorio ocupa 184,9 GB e incluye todos los niveles de cuantizacion, desde 10,7 GB (Q2_K) hasta 27,0 GB (Q8_0).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Soporte multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica capacidad de procesamiento de imagenes junto con texto, aunque no se detalla el alcance.
- Razonamiento fisico y sentido comun: el sufijo PIQA sugiere entrenamiento o evaluacion en tareas de interaccion fisica y razonamiento cotidiano.
- Variante "heretic": probablemente con menor tasa de rechazos y respuestas mas directas, aunque no confirmado oficialmente.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- Capacidades de tool calling, agentes, matematicas o codigo: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_S (15,6 GB) y Q4_K_M (16,9 GB), el modelo puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, permitiendo experimentacion sin conexion a servicios en la nube.
- Prototipado de asistentes conversacionales en ingles: la etiqueta "conversational" y el formato GGUF facilitan su integracion en aplicaciones de chat mediante llama.cpp u Ollama, con contexto multi-turno.
- Investigacion sobre alineamiento y seguridad: al tratarse de una variante "heretic", resulta util para estudiar el comportamiento de modelos con alineamiento reducido y comparar tasas de rechazo frente a versiones estandar.
- Evaluacion de capacidades multimodales en local: los ficheros mmproj permiten probar tareas de descripcion de imagenes o razonamiento visual en entornos sin GPU de datacenter, aunque el alcance real no esta documentado.
- Pruebas de razonamiento fisico y sentido comun: el entrenamiento orientado a PIQA lo hace candidato para experimentos de comprension de escenas y relaciones fisicas simples.
- Benchmarking de cuantizaciones: el repositorio ofrece todos los niveles de cuantizacion, lo que permite medir el impacto de la compresion en calidad y velocidad sobre el mismo modelo base.
- Fine-tuning ligero sobre GGUF: aunque el formato no es ideal para entrenamiento, puede servir como referencia para comparar con versiones safetensors en flujos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,4 GB; Q3_K_L ~13,9 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_S ~18,1 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que puede anadir varios GB en funcion de la longitud de contexto.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q8_0 y contextos largos; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo para cuantizaciones Q3 o Q2.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o inferiores, con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python; tambien puede servirse mediante endpoints compatibles con Hugging Face segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el modelo se situa en el rango de 26B parametros, pero sin benchmarks publicados no es posible contrastarlo con alternativas como Mistral, Qwen o Llama de tamano similar.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se indica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base antes de usarlo en produccion.
- Idioma limitado al ingles: no se declaran capacidades multilingues, por lo que su uso en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: al no haber benchmarks ni documentacion de entrenamiento, no se puede evaluar la fiabilidad factual del modelo.
- Variante "heretic": la reduccion de alineamiento puede aumentar la probabilidad de respuestas inapropiadas, sesgadas o inseguras, lo que desaconseja su uso directo en aplicaciones orientadas al usuario sin filtros adicionales.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas/imatrix, por lo que la calidad en niveles bajos (Q2_K, Q3_K_S) puede degradarse mas que en cuantizaciones optimizadas.
- Modelo multimodal con alcance no documentado: la presencia de mmproj no garantiza un rendimiento solido en vision; no hay ejemplos ni evaluaciones.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros, lo que aumenta el riesgo de problemas no detectados.
- Repositorio de gran tamano (184,9 GB): requiere espacio de almacenamiento considerable y una gestion cuidadosa de descargas parciales.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/mradermacher/XORTRON-G4-26B-heretic2-PIQA-GGUF)
- [Modelo base darkc0de/XORTRON-G4-26B-heretic2-PIQA](https://huggingface.co/darkc0de/XORTRON-G4-26B-heretic2-PIQA)
- [Pagina de descargas del autor de la cuantizacion](https://hf.tst.eu/model#XORTRON-G4-26B-heretic2-PIQA-GGUF)
- [Guia de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Solicitudes de cuantizacion de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Grafico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)
