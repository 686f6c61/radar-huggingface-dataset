# mradermacher/PhysX-Omni-GGUF

## Resumen

PhysX-Omni-GGUF es la version cuantizada en formato GGUF del modelo ACERobotics/PhysX-Omni, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas y con imatrix de modelos abiertos. El modelo base esta orientado, segun las etiquetas declaradas por el autor, a la generacion fisica de contenido 3D, vision 3D y entornos listos para simulacion ("Simulation-Ready", "Physical 3D Generation", "3D Vision"). Esta ficha describe especificamente el repositorio cuantizado, no el modelo original.

El repositorio contiene pesos GGUF con un total de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y un tamano total de 68,1 GB, distribuido en doce variantes de cuantizacion que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB). Se ofrece tambien una version con cuantizacion ponderada por imatrix en un repositorio aparte. La licencia declarada es MIT y el unico idioma soportado segun los metadatos es el ingles.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 7,6B parametros especializado en tareas de 3D fisico sobre hardware de consumo, algo que los pesos originales en transformers dificultan. Al tratarse de una cuantizacion de terceros, hay que tener presente que el rendimiento puede degradarse respecto al modelo base, especialmente en las variantes de 2 y 3 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor de la cuantizacion no la documenta; las etiquetas del modelo base apuntan a vision 3D y generacion fisica 3D) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (pesos originales del modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Las etiquetas asociadas (transformers, 3D Vision, Physical 3D Generation, Simulation-Ready) y los conjuntos de datos referenciados (Caoza/PhysX-Mobility, Caoza/PhysX-3D y PhysX-Omni/PhysXVerse) indican que se trata de un modelo multimodal orientado a percepcion y generacion 3D de caracter fisico, pero no se especifica si emplea un transformer denso, una arquitectura hibrida o un esquema Mixture of Experts, ni el numero de tokens de entrenamiento, la composicion exacta del dataset o si se aplicaron fases de RLHF o DPO.

Lo unico documentado en este repositorio es el proceso de cuantizacion llevado a cabo por mradermacher: cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre el modelo en transformers ACERobotics/PhysX-Omni. No se documenta skip de mmproj ni vocabulario especifico, aunque determinados metadatos comentados en la model card sugieren que no se ha anadido un proyector multimodal independiente en la conversion. Cualquier detalle adicional sobre atencion, decodificacion o innovaciones de entrenamiento debe consultarse en la model card del modelo base, no en esta.

## Capacidades

- Generacion fisica de contenido 3D: las etiquetas del modelo apuntan a tareas de generacion de geometria y escenas con propiedades fisicas plausibles.
- Vision 3D: capacidad declarada de interpretar y procesar informacion tridimensional.
- Salidas "listas para simulacion": el tag Simulation-Ready sugiere que el modelo produce resultados pensados para ser importados en motores o pipelines de simulacion.
- Naturaleza conversacional: el repositorio esta marcado como "conversational", por lo que admite interaccion por turnos.
- Compatibilidad con endpoints: etiqueta endpoints_compatible, lo que indica que puede servirse mediante infraestructura de inferencia estandar.
- Multilingue: no disponible; los metadatos declaran unicamente ingles (en).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Audio: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de assets 3D para videojuegos: el modelo puede producir geometria fisicamente coherente a partir de descripciones o entradas visuales, reduciendo el trabajo manual de modelado en fases de preproduccion. Su caracter "Simulation-Ready" facilita la integracion en el motor.
- Previsualizacion de escenas para robotica: dado su enfoque en movilidad fisica (dataset PhysX-Mobility), puede emplearse para generar o evaluar configuraciones de entorno antes de desplegar politicas de navegacion en simuladores.
- Prototipado en gemelos digitales: generar representaciones 3D coherentes de objetos y escenas para alimentar un gemelo digital, aprovechando la orientacion fisica del modelo para mantener consistencia de masa, colision o soporte.
- Datos sinteticos para entrenamiento de percepcion: producir variaciones de escenas 3D que sirvan como aumentacion de datos en pipelines de vision por computador, siempre que la calidad de la cuantizacion elegida sea suficiente.
- Asistencia conversacional especializada en 3D: al estar marcado como conversacional, puede integrarse en interfaces donde el usuario describe requisitos de escena y el modelo responde con propuestas o parametros de construccion.
- Despliegue en estaciones de trabajo con GPU de consumo: la disponibilidad de cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permite ejecutar el modelo localmente mediante llama.cpp u Ollama para tareas de prototipado sin depender de infraestructura cloud.
- Integracion en herramientas CAD o de modelado como backend: mediante un servidor de inferencia compatible con GGUF, el modelo puede exponerse como servicio interno para generar propuestas de geometria bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni los metadatos asociados incluyen cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de generacion 3D o vision. Tampoco se documentan comparativas de perplejidad entre las distintas cuantizaciones ofrecidas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar buffers de contexto ni KV cache):
  - f16: aproximadamente 15,3 GB.
  - Q8_0: aproximadamente 8,2 GB.
  - Q6_K: aproximadamente 6,4 GB.
  - Q5_K_M: aproximadamente 5,5 GB.
  - Q4_K_M: aproximadamente 4,8 GB.
  - Q3_K_M: aproximadamente 3,9 GB.
  - Q2_K: aproximadamente 3,1 GB.
- GPU recomendadas: para la variante f16 se recomienda una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q8_0 basta con 12-16 GB (RTX 4080, RTX 3090, A4000). Para Q4_K_M y Q5_K_M es viable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070).
- Compatibilidad con GPU de consumo: si. Las cuantizaciones Q4 y Q5 caben en tarjetas de 6-8 GB con contexto reducido; Q2_K y Q3_K pueden ejecutarse incluso en equipos con poca VRAM o en modo hibrido CPU+GPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores GGUF compatibles. El repositorio tambien esta marcado como endpoints_compatible, por lo que puede servirse en plataformas de inferencia que acepten GGUF. Para el modelo base en transformers serian aplicables vLLM o TGI, pero no para estos pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion rigurosa con alternativas de la misma categoria (modelos multimodales 3D o generadores fisicos 3D de tamano similar). Como referencia interna, la unica relacion documentada es con su propio modelo base ACERobotics/PhysX-Omni y con la variante imatrix publicada por el mismo autor.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/PhysX-Omni-GGUF | 7,6B | no disponible | MIT | GGUF | Cuantizacion estatica, 12 variantes |
| mradermacher/PhysX-Omni-i1-GGUF | 7,6B | no disponible | MIT | GGUF | Cuantizacion con imatrix, mayor calidad |
| ACERobotics/PhysX-Omni | 7,6B | no disponible | MIT | safetensors | Modelo base original |

## Limitaciones y advertencias

- Al ser una cuantizacion de terceros, el rendimiento puede degradarse respecto al modelo base, especialmente en las variantes Q2_K y Q3_K, que el propio autor etiqueta como "lower quality" en el caso de Q3_K_M.
- No hay benchmarks publicados que permitan cuantificar la perdida de calidad por cuantizacion, ni para tareas de lenguaje ni para tareas de 3D.
- No se documentan sesgos conocidos del modelo base en la informacion disponible, pero al entrenarse predominantemente en datos en ingles puede mostrar un sesgo cultural y linguistico hacia ese idioma.
- Riesgo de alucinacion: no cuantificado. En modelos generativos 3D el riesgo se traduce en geometria fisicamente inconsistente o escenas que violan restricciones de colision, incluso cuando la salida parece plausible.
- Limitacion idiomatica: los metadatos declaran exclusivamente ingles (en), por lo que el uso en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada; conviene verificar en el modelo base antes de planificar aplicaciones que dependan de contextos largos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Aun asi, conviene revisar la licencia del modelo base para confirmar que no impone restricciones adicionales.
- Para produccion, la eleccion de la cuantizacion debe validarse empiricamente con datos propios del dominio objetivo; las recomendaciones del autor ("fast, recommended" para Q4_K_S y Q4_K_M) son orientativas y no sustituyen una evaluacion especifica.
- Se recomienda verificar la integridad de los ficheros multiparte antes de desplegar, ya que algunos modelos se reparten en varios fragmentos.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/PhysX-Omni-GGUF
- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/PhysX-Omni-i1-GGUF
- Modelo base: https://huggingface.co/ACERobotics/PhysX-Omni
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#PhysX-Omni-GGUF
- Dataset Caoza/PhysX-Mobility: https://huggingface.co/datasets/Caoza/PhysX-Mobility
- Dataset Caoza/PhysX-3D: https://huggingface.co/datasets/Caoza/PhysX-3D
- Dataset PhysX-Omni/PhysXVerse: https://huggingface.co/datasets/PhysX-Omni/PhysXVerse
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo; todos los enlaces recuperados correspondian a contenidos ajenos al proyecto y se han descartado.
