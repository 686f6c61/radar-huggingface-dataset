# mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF

## Resumen

Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF es la versión cuantizada en formato GGUF de un modelo derivado de la familia Qwen3.6, publicada por el usuario mradermacher, conocido en el ecosistema por producir cuantizaciones estáticas de modelos de terceros. El modelo original, Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic, es un merge (fusión) realizado con mergekit que combina pesos orientados a roleplay y narrativa, y que ha sido sometido a un proceso de "abliteration" o "decensoring" para eliminar los mecanismos de rechazo y moderación del modelo base. El resultado es un modelo de 35.505.251.456 parámetros (aproximadamente 35,5 mil millones) con licencia Apache 2.0 y capacidades multimodales, según se deduce de la presencia de ficheros mmproj en el repositorio.

La relevancia de esta ficha reside en que agrupa dos fenómenos habituales en el ecosistema open source: por un lado, las cuantizaciones GGUF que permiten ejecutar modelos de gran tamaño en hardware de consumo; por otro, los merges especializados y "abliterated" que se distribuyen fuera de los canales oficiales de los laboratorios. El modelo está pensado para generación creativa, roleplay y storytelling sin las restricciones de seguridad del modelo original, lo que exige una evaluación cuidadosa antes de cualquier uso en producción.

La información disponible en la model card es muy limitada: se reduce a la lista de cuantizaciones, la licencia y los tags. No se documentan detalles de entrenamiento, datos, benchmarks ni configuración de contexto, por lo que esta ficha marca explícitamente como "no disponible" todo aquello que no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.6; presumiblemente transformer con mezcla de expertos, no confirmado en la informacion) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere 3 B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. El nombre del modelo base (Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic) indica que se trata de un merge construido con mergekit a partir de componentes de la familia Qwen3.6, y el sufijo "A3B" es coherente con una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion disponible. El tag "heretic" y "abliterated" indica que se ha aplicado una tecnica de abliteracion, que consiste en identificar y neutralizar las direcciones de activacion responsables de los comportamientos de rechazo, sin reentrenar el modelo.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1) y sigue el flujo estandar de conversion a GGUF, con cuantizaciones tipo K y IQ. Existe una variante con cuantizaciones ponderadas por imatrix en el repositorio mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-i1-GGUF. La presencia de ficheros mmproj (Q8_0 y f16) indica soporte multimodal, presumiblemente vision, aunque no se detalla en la informacion.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis declarado en roleplay y storytelling segun los tags del autor.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (multi-modal supplement), lo que sugiere entrada de imagenes, aunque no se especifica el alcance exacto.
- Comportamiento "uncensored" o "decensored": el proceso de abliteracion elimina los rechazos del modelo base, por lo que el modelo respondera a peticiones que el original rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion.

## Casos de uso

- Generacion narrativa y ficcion larga: el modelo puede emplearse para redactar relatos, dialogos y tramas con continuidad, aprovechando su tamano para mantener coherencia estilistica en textos extensos. Es adecuado para escritura creativa asistida donde se busca un tono sin restricciones editoriales.
- Roleplay y personajes conversacionales: los tags roleplay y storytelling indican que el merge fue optimizado para mantener personajes consistentes en conversaciones multi-turno, util en prototipos de videojuegos narrativos o chatbots de entretenimiento.
- Generacion de contenido para juegos de rol de mesa: el modelo puede actuar como narrador o master de juego, improvisando escenas y respuestas a acciones de los jugadores sin los filtros del modelo base.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, sirve como caso de estudio para analizar como la eliminacion de direcciones de rechazo afecta al comportamiento, util en laboratorios que estudian robustez de salvaguardas.
- Prototipado de asistentes creativos sin moderacion: en entornos controlados de investigacion, puede integrarse en pipelines de generacion de borradores donde se requiere explorar tonos o temas que los modelos alineados bloquean.
- Experimentacion con cuantizaciones en hardware de consumo: las variantes Q4_K_M (21,8 GB) y Q5_K_M (25,4 GB) permiten ejecutar un modelo de 35,5 B en GPUs de gama alta para consumo, lo que lo hace util para pruebas de inferencia local con llama.cpp u Ollama.
- Analisis multimodal de imagenes en contexto narrativo: si el mmproj funciona como se espera, podria describir o continuar historias a partir de imagenes, aunque esta capacidad no esta documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero, sin contar overhead de contexto):
  - Q2_K: 13,3 GB
  - Q3_K_S: 15,6 GB; Q3_K_M: 17,3 GB; Q3_K_L: 18,7 GB
  - IQ4_XS: 19,5 GB; Q4_K_S: 20,5 GB; Q4_K_M: 21,8 GB
  - Q5_K_S: 24,7 GB; Q5_K_M: 25,4 GB
  - Q6_K: 29,3 GB
  - Q8_0: 37,9 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: para Q8_0 se necesita una GPU de 48 GB o superior (A6000, A100 80 GB, H100). Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) queda al limite y puede requerir offloading parcial a CPU; una RTX 3090/4090 con 24 GB no basta para Q5_K_M completo. Para Q2_K y Q3_K_S, una GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) puede ser suficiente con contexto corto.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_S con GPUs de 16-24 GB, asumiendo offloading parcial o contexto reducido en los casos mas ajustados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura subyacente lo soporta (no confirmado).
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Fallen-Fabulist-35B-A3B-heretic (este, GGUF) | 35,5 B | no disponible | Apache 2.0 | GGUF | Merge abliterated para roleplay, solo ingles |
| Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic | 35,5 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Qwen3.6 (modelo oficial de referencia) | no disponible | no disponible | no disponible | no disponible | Modelo original de la familia; esta ficha no dispone de datos verificados sobre el |
| Alternativas abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion verificada para comparar |

La comparativa se limita a los datos disponibles; no se han podido verificar cifras de rendimiento ni contexto de los modelos alternativos.

## Limitaciones y advertencias

- El proceso de abliteracion elimina los rechazos de seguridad, por lo que el modelo puede generar contenido danino, ofensivo o ilegal sin filtros. No es apto para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: al ser un merge especializado en ficcion y sin benchmarks publicados, no hay evidencia de fiabilidad factual.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor del merge no documenta la procedencia exacta de los pesos ni posibles restricciones heredadas del modelo base de Qwen; conviene revisar la licencia de Qwen3.6 antes de un despliegue comercial.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; la ausencia de informacion no implica ausencia de sesgos.
- El repositorio tiene solo 2 likes y la model card es minima, lo que indica escasa validacion por parte de la comunidad.
- El tamano del repositorio (244,4 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.
- La fecha de creacion indicada (2026-09-01) y la de actualizacion (2026-10-12) deben tratarse con cautela, ya que no se ha verificado su coherencia con el calendario real.
- No hay garantia de que el soporte multimodal (mmproj) funcione correctamente con todos los runtimes; probar antes de integrar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
