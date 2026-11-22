# mradermacher/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) desarrollado por el equipo Surogate, orientado a tareas de razonamiento, uso de herramientas (tool-use) y flujos agénticos. Con 35.505.251.456 parametros totales y un diseno A3B (aproximadamente 3.000 millones de parametros activos por token), el modelo busca ofrecer un equilibrio entre capacidad de razonamiento y eficiencia computacional en inferencia. Esta ficha documenta la version cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo base mediante cuantizaciones estaticas (Q2_K, Q4_K_S, Q6_K, Q8_0) y un suplemento multimodal (mmproj) que sugiere capacidades de vision. El modelo esta etiquetado para ingles, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

No se dispone de informacion publica sobre el contexto maximo, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada; estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; formato de pesos GGUF |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | aproximadamente 3 B (denominacion A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16 (segun metadatos de la model card); disponibles como archivos: Q2_K, Q4_K_S, Q6_K, Q8_0 y mmproj Q8_0/f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con suplemento multimodal mmproj) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 35,5 mil millones de parametros totales y un subconjunto activo de aproximadamente 3 mil millones por token (denominacion A3B). Este diseno reduce el coste computacional por token respecto a un modelo denso del mismo tamano total, manteniendo una capacidad de representacion elevada. La model card del repositorio cuantizado no detalla el numero de expertos, la estrategia de enrutamiento ni la profundidad de la red.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Las etiquetas del modelo (moe, agent, tool-use, reasoning) indican que el entrenamiento se oriento hacia tareas agenticas y de razonamiento con herramientas. La presencia de archivos mmproj en el repositorio sugiere que el modelo base incorpora un codificador multimodal para vision, aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso (etiqueta reasoning).
- Uso de herramientas y function calling (etiquetas tool-use y agent).
- Capacidades agenticas para flujos de trabajo automatizados.
- Soporte multimodal (vision) inferido de la presencia de archivos mmproj Q8_0 y f16 en el repositorio.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se dispone de informacion sobre capacidades de codigo, matematicas o audio.

## Casos de uso

- Agentes autonomos de automatizacion: el modelo puede orquestar llamadas a herramientas y APIs en flujos multi-paso, aprovechando su entrenamiento orientado a agent y tool-use para tareas como gestion de tickets o enriquecimiento de datos.
- Asistentes de atencion al cliente: con licencia Apache 2.0 y despliegue local via GGUF, permite construir chatbots multi-turno en ingles sin costes de API ni dependencia de terceros.
- Razonamiento asistido en documentacion tecnica: el modelo puede analizar y sintetizar documentacion en ingles, apoyandose en su capacidad de razonamiento para resumir y responder preguntas.
- Procesamiento de imagenes en pipelines locales: gracias al suplemento mmproj, es posible integrar el modelo en tareas de descripcion o analisis de imagenes junto a texto, en entornos con requisitos de privacidad.
- Prototipado de agentes en estaciones de trabajo: las cuantizaciones Q4_K_S (20,5 GB) y Q6_K (29,3 GB) permiten ejecutar el modelo en GPUs de consumo o en configuraciones con memoria unificada, agilizando iteraciones de desarrollo.
- Evaluacion de modelos MoE en investigacion: al ser una cuantizacion estatica del modelo base, sirve para comparar el rendimiento de variantes de cuantizacion frente al modelo original en tareas de razonamiento.
- Despliegue en entornos air-gapped: el formato GGUF y la licencia permisiva facilitan su uso en infraestructuras sin conexion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 13,3 GB.
  - Q4_K_S: 20,5 GB.
  - Q6_K: 29,3 GB.
  - Q8_0: 37,9 GB.
  - mmproj Q8_0: 0,7 GB; mmproj f16: 1,0 GB (solo si se usa vision).
- GPU recomendadas: no disponibles de forma especifica; por tamano, las cuantizaciones Q4_K_S y Q6_K encajan en GPUs de 24 GB (RTX 3090/4090) con margen limitado para contexto, y Q8_0 requiere 48 GB o mas (A6000, A100 80 GB, H100).
- Cabe en GPU de consumo: si, Q2_K y Q4_K_S en GPUs de 16-24 GB; Q6_K en 32 GB o mediante offload parcial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; tambien es posible convertir a otros backends, aunque no se documenta compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones completas de alternativas comparables en la informacion proporcionada. La comparacion se limita a parametros y licencia:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B (esta ficha) | 35,5 B | ~3 B | no disponible | Apache 2.0 | GGUF |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables concretos con datos verificables.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide garantizar conversaciones o documentos largos.
- Alucinacion: no hay evaluaciones publicadas sobre tasas de alucinacion; en tareas agenticas el riesgo de llamadas erroneas a herramientas debe mitigarse con validacion externa.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineacion (RLHF/DPO) en la informacion disponible.
- Cuantizaciones: las versiones Q2_K y Q3_K degradan la calidad respecto al modelo original; para produccion se recomienda Q4_K_S o superior.
- MoE y memoria: aunque los parametros activos son ~3 B, todos los pesos deben residir en memoria, por lo que el requisito de VRAM se acerca al de un modelo denso de 35 B.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (surogate/Surogate3.7-35B-A3B) por si anaden restricciones adicionales.
- Repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Surogate3.7-35B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
