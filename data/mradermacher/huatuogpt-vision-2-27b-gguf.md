# mradermacher/HuatuoGPT-Vision-2-27B-GGUF

## Resumen

HuatuoGPT-Vision-2-27B es un modelo multimodal de lenguaje y vision orientado al dominio medico, desarrollado originalmente por FreedomIntelligence (el grupo de investigacion de la Universidad de Hong Kong ligado a HuatuoGPT). Esta ficha describe la version cuantizada publicada por mradermacher en formato GGUF, que permite ejecutar el modelo en hardware de consumo y en entornos de inferencia basados en llama.cpp. El modelo combina un backbone de lenguaje de aproximadamente 27.320 millones de parametros con un proyector multimodal (mmproj) que le permite procesar imagenes junto con texto.

El modelo esta disenado para tareas de razonamiento clinico, interpretacion de imagenes medicas y respuesta a preguntas biomedicas, un nicho donde los modelos generalistas suelen mostrar carencias por falta de datos especializados. Frente a la version original en safetensors, esta publicacion GGUF ofrece cuantizaciones desde Q2_K hasta Q8_0, ademas de dos variantes del proyector multimodal (f16 y Q8_0), lo que reduce el peso desde los 192,3 GB del repositorio original hasta aproximadamente 11,3 GB en la cuantizacion mas agresiva.

La relevancia de esta ficha radica en que democratiza el acceso a un modelo medico multimodal de 27B en GPUs de gama alta de consumo, algo impracticable con los pesos completos en bf16. No obstante, conviene subrayar que se trata de una cuantizacion estatica (no imatrix) y que el autor no ha publicado evaluaciones propias de calidad tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + proyector visual mmproj); detalles internos del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |
| Tamano del repositorio | 192,3 GB |
| Fecha de publicacion | 26 de noviembre de 2026 |
| Cuantizador | mradermacher (cuantizaciones estaticas, sin imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone de lenguaje (no se especifica si es un transformer denso clasico, que familia de atencion emplea ni el numero de capas u ocultas). Lo que si se confirma es su naturaleza multimodal: el repositorio incluye un fichero `mmproj` separado que actua como proyector de caracteristicas visuales hacia el espacio del modelo de lenguaje, siguiendo el patron habitual de los modelos vision-language empaquetados en GGUF para llama.cpp. El recuento de parametros (27,32 B) corresponde al conjunto de pesos publicados en safetensors en el modelo base.

Respecto al entrenamiento, no se han proporcionado en la informacion disponible datos sobre el volumen de tokens, la composicion del corpus, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La unica informacion contextual es la pertenencia a la familia HuatuoGPT-Vision-2, cuyo enfasis declarado es el razonamiento medico multimodal. Cualquier afirmacion sobre el proceso de alineacion o el dataset de entrenamiento seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dominio medico y biomedico.
- Procesamiento de imagenes junto con texto (vision-language): el modelo puede recibir una imagen y una pregunta en lenguaje natural y generar una respuesta descriptiva o interpretativa.
- Razonamiento clinico y respuesta a preguntas medicas (el tag `reasoning` aparece en la model card).
- Capacidad multimodal para tareas de descripcion de imagenes y analisis visual orientado a contexto sanitario.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia documental clinica: el modelo puede recibir imagenes de informes, radiografias o capturas de resultados de laboratorio junto con una consulta textual y generar una descripcion estructurada en ingles, util para preprocesar documentacion medica antes de la revision humana.
- Educacion medica y simulacion de casos: sirve como motor de un tutor conversacional que plantea casos clinicos con imagenes adjuntas y evalua la respuesta del estudiante, aprovechando su especializacion en razonamiento medico.
- Triaje preliminar no diagnostico: en un chatbot de orientacion sanitaria, el modelo puede clasificar sintomas descritos en texto e imagen y sugerir el nivel de urgencia, siempre con derivacion a profesional y sin valor diagnostico.
- Investigacion biomedica asistida: extraccion y resumen de hallazgos a partir de figuras de articulos cientificos (graficas, imagenes histologicas) para acelerar revisiones sistematicas, dado su enfoque vision-language.
- Despliegue en local para privacidad de datos sanitarios: al estar disponible en GGUF, puede ejecutarse en infraestructura propia sin enviar imagenes medicas a servicios en la nube, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Prototipado rapido de aplicaciones medicas multimodales: con la cuantizacion Q4_K_M (17,1 GB) es viable montar demos en una unica GPU de 24 GB, reduciendo el coste de experimentacion frente a los pesos completos.
- Generacion de descripciones alternativas (alt-text) para imagenes medicas en plataformas de documentacion clinica, mejorando la accesibilidad de los registros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, MedQA, VQA medica ni comparaciones con otros modelos, y tampoco se aportan datos de latencia o throughput tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni el proyector):
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,8 GB
  - Q3_K_L: ~15,0 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Proyector multimodal: ~0,7 GB (Q8_0) o ~1,0 GB (f16), adicional a la cuantizacion del modelo.
- GPU recomendadas: para Q8_0 se necesita una GPU con 32 GB o mas (A100 40 GB, H100, RTX 5090 o similar). Para Q4_K_M basta con 24 GB (RTX 4090, A10G 24 GB, L4 24 GB). Para Q2_K o Q3_K_S es posible en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB), aunque con margen justo para el contexto.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q6_K con GPUs de 24 GB; Q8_0 requiere gama profesional o RTX 5090.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El repositorio incluye el tag `endpoints_compatible`. Para vLLM o TGI seria necesario usar el modelo base en safetensors, no esta cuantizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-Vision-2-27B (este, GGUF) | 27,32 B | no disponible | Texto + vision, dominio medico | Apache 2.0 | GGUF en HF |
| HuatuoGPT-Vision-2-27B (base) | 27,32 B | no disponible | Texto + vision, dominio medico | Apache 2.0 | Safetensors en HF |
| Alternativas medicas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado en dominio medico: no debe usarse como sustituto del criterio clinico profesional ni para diagnostico autonomo; sus salidas requieren validacion por personal sanitario.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones medicas plausibles pero incorrectas, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S) donde la perdida de calidad es mayor.
- Solo ingles: el campo `language` declara unicamente `en`, por lo que su uso en castellano no esta soportado oficialmente y la calidad seria impredecible.
- Cuantizaciones estaticas sin imatrix: el autor indica que no ha generado variantes con importancia matricial, lo que puede suponer una perdida de calidad algo mayor frente a cuantizaciones imatrix equivalentes.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que complica el dimensionamiento de la KV cache en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad regulatoria (MDR, normativa de dispositivos medicos, proteccion de datos) si despliega el modelo en contextos sanitarios reales.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de comunidad que valide la calidad de estas cuantizaciones.
- El proyector multimodal debe descargarse por separado y emparejarse con la cuantizacion elegida; un emparejamiento incorrecto puede degradar o romper la capacidad visual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HuatuoGPT-Vision-2-27B-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-27B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#HuatuoGPT-Vision-2-27B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
