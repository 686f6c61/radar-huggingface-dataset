# MK-runner/FSE

## Resumen

FSE (Factual Serialization Enhancement) es un modelo publicado en Hugging Face por el usuario MK-runner, identificado en la busqueda web como Kang Liu, doctorando en la Universidad de Xidian cuyo trabajo se centra en generacion de informes radiologicos, modelos vision-lenguaje medicos y deteccion de anomalias. El repositorio tiene un tamano de 8,2 GB y licencia Apache 2.0, lo que sugiere un modelo de pesos abiertos de escala media (probablemente en el rango de 7-8 mil millones de parametros en precision de 16 bits, aunque el dato no se confirma en la informacion disponible).

La relevancia del modelo deriva de su asociacion con dos publicaciones cientificas: una sobre generacion de informes de ecografia con conocimiento difuso y multi-modal (publicada en Expert Systems with Applications) y otra titulada "Factual serialization enhancement: a key innovation for chest X-ray report generation". En ambos articulos se enlaza el repositorio github.com/mk-runner/FSE como codigo publico, lo que vincula el modelo con la tarea de generacion automatica de informes radiologicos a partir de imagenes medicas.

No obstante, la model card del repositorio esta practicamente vacia (solo contiene la declaracion de licencia), no se declaran idiomas soportados, pipeline ni resultados de benchmarks, y el modelo acumula cero descargas y cero likes en el momento de la consulta. Se trata, por tanto, de un artefacto de investigacion reciente y escasamente documentado, cuya evaluacion practica requiere consultar los articulos asociados y el codigo del repositorio GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el contexto de los articulos, probablemente vision-lenguaje para generacion de informes medicos) |
| Parametros totales | no disponible (el tamano del repo, 8,2 GB, es compatible con un modelo de ~7-8B en fp16, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene 8,2 GB de datos, pero no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card ni en los resultados de busqueda. Por el perfil del autor y los titulos de las publicaciones asociadas, el modelo se enmarca en la linea de modelos vision-lenguaje aplicados a radiologia: generacion de informes de ecografia con integracion de conocimiento difuso y caracteristicas anatomicas, y "factual serialization enhancement" para informes de radiografia de torax. Estos trabajos suelen combinar un codificador visual (tipicamente un ViT o un CNN tipo ResNet) con un decodificador de lenguaje tipo transformer, entrenado sobre pares imagen-informe de dominios medicos concretos.

Sin embargo, no se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion adicional al respecto seria especulativa y no debe tomarse como dato verificado.

## Capacidades

- Generacion de texto en el dominio de informes radiologicos, segun la tematica de las publicaciones asociadas al repositorio.
- Procesamiento de imagenes medicas (ecografia y radiografia de torax) como entrada multimodal, segun los articulos enlazados.
- Generacion de informes estructurados con enfasis en fidelidad factual ("factual serialization enhancement").
- Integracion de conocimiento externo (en el caso de la ecografia, conocimiento difuso y caracteristicas por sitio anatomico).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Modo thinking, vision, audio u otras capacidades especiales: no disponibles salvo la vertiente vision-lenguaje inferida de las publicaciones.

## Casos de uso

- Generacion asistida de informes de radiografia de torax: el modelo se usaria para producir un borrador de informe a partir de una imagen CXR, siguiendo el enfoque de "factual serialization enhancement" descrito en la publicacion asociada, con revision posterior por un radiologo.
- Generacion de informes de ecografia con contexto anatomico: aplicable a flujos donde se requiere incorporar caracteristicas especificas del sitio anatomico y conocimiento difuso, tal como se describe en el articulo de Expert Systems with Applications.
- Investigacion academica en vision-lenguaje medico: util como linea base reproducible (licencia Apache 2.0 y codigo publico en GitHub) para comparar metodos de generacion de informes.
- Prototipado de sistemas de triaje radiologico: el modelo podria generar descripciones preliminares que ayuden a priorizar estudios en entornos con alta carga asistencial, siempre con supervision facultativa.
- Docencia y formacion de residentes: generacion de informes de referencia sobre casos de ejemplo para comparar con la interpretacion humana.
- Experimentacion con tecnicas de serializacion factual: el modelo sirve como banco de pruebas para estudiar como distintas estrategias de serializacion afectan a la fidelidad de los informes generados.
- Integracion en pipelines de investigacion clinica: extraccion de hallazgos estructurados a partir de imagenes para su analisis estadistico posterior, con las cautelas propias de un modelo no validado clinicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un repositorio de 8,2 GB es compatible con un modelo de ~7-8B en fp16, lo que requeriria del orden de 16-20 GB de VRAM para inferencia en precision completa con overhead, pero este calculo no esta confirmado por el autor.
- GPU recomendadas: no disponibles. Por tamano del repositorio, una GPU con 24 GB (RTX 4090, A10G, L4 en cuantizacion) o 40-80 GB (A100, H100) seria el rango habitual para modelos de esta escala, sin confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada; dependeria del formato de pesos, que no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; al no declararse formato de pesos ni pipeline, no puede confirmarse compatibilidad con ninguno de estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparacion rigurosa con alternativas de la misma categoria (por ejemplo, modelos vision-lenguaje medicos como MedFlamingo, LLaVA-Med o RadFM). Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Model card practicamente vacia: solo contiene la licencia, sin descripcion, idiomas, pipeline ni instrucciones de uso.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- Ausencia total de benchmarks publicados en la informacion disponible; no puede afirmarse nada sobre su calidad o fidelidad factual mas alla de lo que sugieren los titulos de las publicaciones.
- Dominio muy restringido: por el perfil del autor y los articulos, el modelo esta orientado a informes radiologicos; su uso fuera de ese dominio es altamente incierto.
- Riesgo de alucinacion clinica: en modelos de generacion de informes medicos, la generacion de hallazgos inexistentes es un riesgo critico; no se documentan mecanismos de mitigacion en la informacion disponible.
- Sesgos: no documentados. Los datasets radiologicos suelen presentar sesgos demograficos, de equipo y de institucion, pero no se dispone de informacion sobre la composicion de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero ello no exime del cumplimiento de la normativa sanitaria aplicable (marcado CE / MDR en la UE, FDA en EE. UU.) si el modelo se integra en un producto sanitario.
- No apto para uso clinico directo sin validacion prospectiva, supervision facultativa y evaluacion regulatoria.
- Falta de informacion sobre formato de pesos y requisitos de inferencia, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MK-runner/FSE
- Repositorio GitHub del autor: https://github.com/mk-runner/FSE
- Perfil GitHub del autor: https://github.com/mk-runner
- Articulo "Ultrasound report generation with fuzzy knowledge and multi-modal..." (Expert Systems with Applications): https://www.sciencedirect.com/science/article/abs/pii/S0957417425021748
- Articulo "Factual serialization enhancement: A key innovation for chest X-ray report generation" (Expert Systems with Applications): https://www.sciencedirect.com/science/article/abs/pii/S0957417426014636
