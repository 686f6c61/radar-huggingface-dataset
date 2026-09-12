# mradermacher/Qwen3-0.6B-heretic-decensored-GGUF

## Resumen

Qwen3-0.6B-heretic-decensored-GGUF es una coleccion de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo vrhvnsky/Qwen3-0.6B-heretic-decensored, que a su vez deriva de Qwen/Qwen3-0.6B. El modelo original ha sido sometido a un proceso de "abliteration" (etiquetado como heretic, uncensored, decensored) orientado a reducir los rechazos y el comportamiento sobrealineado del modelo base, manteniendo la arquitectura y los pesos originales en lo esencial. El trabajo de mradermacher es exclusivamente de cuantizacion: no reentrena ni modifica la arquitectura, solo produce versiones comprimidas y reproducibles.

Se trata de un modelo denso de 596.049.920 parametros (aproximadamente 0,6 mil millones), lo que lo situa en la gama ultraligera, apta para inferencia en CPU o en GPU de consumo muy modestas. El repositorio ocupa 5,7 GB e incluye 12 variantes de cuantizacion, desde Q2_K (0,4 GB) hasta f16 (1,3 GB), ademas de una version alternativa con cuantizacion ponderada por matriz de importancia (i1) publicada en un repositorio separado.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo conversacional en ingles en hardware muy limitado con latencias muy bajas; por otro, sirve como banco de pruebas reproducible para estudiar tecnicas de ablacion de seguridad y su impacto en el comportamiento del modelo. La licencia declarada es Apache 2.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, derivado de Qwen3-0.6B (numero de capas, atencion y detalles internos no disponibles) |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: f16 (16 bpw), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K. Existe ademas una familia i1 (imatrix/weighted) en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en formato transformers/safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | vrhvnsky/Qwen3-0.6B-heretic-decensored (a su vez derivado de Qwen/Qwen3-0.6B) |
| Tamano del repositorio | 5,7 GB |
| Etiquetas declaradas | heretic, uncensored, decensored, abliterated, reproducible, conversational |
| Fecha de creacion (HuggingFace) | 2026-09-12 |
| Fecha de ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Por el identificador y la licencia enlazada, el modelo procede de la familia Qwen3 en su variante de 0,6B parametros, de arquitectura transformer densa. El repositorio de mradermacher no contiene pesos entrenados desde cero ni ajustes adicionales: es un artefacto de cuantizacion (convert_type hf, quantize_version 2, output_tensor_quantised 1) generado a partir de los pesos del modelo vrhvnsky/Qwen3-0.6B-heretic-decensored. No se han publicado en esta informacion datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO.

La innovacion relevante no esta en la arquitectura, sino en el proceso de "abliteration" aplicado por el autor del modelo base y etiquetado con el termino heretic. Este tipo de tecnica busca eliminar direcciones del espacio de activaciones asociadas a comportamientos de rechazo, con el objetivo de reducir la tasa de negativas del modelo conservando al maximo las capacidades originales. El repositorio de mradermacher anade valor al proceso al ofrecer cuantizaciones estaticas reproducibles con un rango muy amplio de compromisos tamano/calidad, incluida la opcion i1 con matriz de importancia, que suele degradar menos la perplejidad a igual tamano de archivo.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat propio de la familia Qwen3.
- Razonamiento basico y respuesta a preguntas cortas, limitado por el tamano del modelo (0,6B).
- Redaccion y reescritura de textos breves: parrafos, resumenes, correos y mensajes.
- Clasificacion y etiquetado de texto, con coste computacional muy reducido.
- Extraccion de informacion y generacion de salidas estructuradas simples (por ejemplo, JSON) cuando se guia con prompt.
- Comportamiento "decensored": menor probabilidad de rechazo ante peticiones que el modelo alineado rechazaria, incluyendo tematica adulta o sensible.
- Soporte de tool calling o function calling: no disponible / no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; poco fiables a esta escala de parametros.
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta soportado oficialmente.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada. El modelo base es exclusivamente de texto.

## Casos de uso

- Clasificacion y enrutado de texto a gran escala: con 0,6B parametros y cuantizaciones de 0,4-0,5 GB, se puede desplegar en CPU para etiquetar millones de documentos con latencia por debajo del segundo, usando Q4_K_S o Q4_K_M, marcadas como "fast, recommended" en la model card.
- Extraccion de informacion estructurada en pipelines ETL: el modelo puede convertir texto libre en campos JSON simples (nombre, fecha, importe) en un paso previo a validacion, reduciendo el coste frente a modelos mayores cuando la tarea esta bien acotada con ejemplos en el prompt.
- Prototipado rapido de aplicaciones conversacionales: sirve para validar la interfaz, el flujo de prompts y la gestion de contexto de un producto antes de migrar a un modelo mayor, ya que el mismo formato de chat y el mismo tokenizador permiten cambiar de modelo sin reescribir la capa de aplicacion.
- Generacion de datos sinteticos y aumento de datasets: al ser un modelo decensored, permite generar ejemplos de texto en dominios donde los modelos alineados rechazan la peticion, util para construir corpus de entrenamiento o de evaluacion de filtros de contenido.
- Investigacion en seguridad y alineamiento (red teaming): el modelo funciona como sujeto de prueba reproducible para medir cuanto contenido sensible es capaz de generar un modelo de 0,6B tras la ablacion, y para comparar el efecto de distintas cuantizaciones sobre ese comportamiento.
- Escritura creativa y ficcion sin restricciones tematicas: redaccion de relatos, dialogos o contenido de tono adulto en ingles, donde el modelo base alineado introduciria rechazos o evasivas.
- Asistentes embebidos y offlin: al caber en 0,5-0,7 GB, puede integrarse en aplicaciones de escritorio, moviles o dispositivos edge que requieran funcionar sin conexion, asumiendo tareas de autocompletado y respuesta corta.
- Generacion de variaciones y parametrizacion de textos en pruebas de software: creacion de cadenas de texto realistas para tests de interfaz, fixtures y datos de demostracion en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y tampoco se aportan mediciones de perplejidad para las distintas cuantizaciones mas alla de las notas cualitativas de la tabla de ficheros (por ejemplo, Q3_K_M marcada como "lower quality", Q6_K como "very good quality" y f16 como "overkill"). Cualquier cifra de rendimiento atribuida a este modelo en otra fuente deberia verificarse contra el modelo base vrhvnsky/Qwen3-0.6B-heretic-decensored, ya que la cuantizacion introduce degradacion adicional no cuantificada aqui.

## Requisitos de hardware

- VRAM/RAM aproximada segun el fichero de pesos: Q2_K y Q3_K_S ~0,4 GB; Q3_K_L e IQ4_XS ~0,5 GB; Q4_K_S, Q4_K_M, Q5_K_S y Q5_K_M ~0,5 GB; Q6_K ~0,6 GB; Q8_0 ~0,7 GB; f16 ~1,3 GB. A estas cifras hay que sumar el espacio de contexto (KV cache), que crece con la longitud de secuencia y no esta documentado en la informacion disponible.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos usando cuantizaciones Q4 o inferiores. Tambien cabe en iGPUs y en memoria unificada de Apple Silicon.
- Inferencia en CPU perfectamente viable: los ficheros de 0,4-0,7 GB permiten decodificacion interactiva en procesadores de escritorio modernos, aunque el throughput exacto no esta documentado.
- GPU de centro de datos (A100, H100, L40S) innecesarias para este tamano; solo tendrian sentido para servir un volumen muy alto de peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El soporte en vLLM y TGI para GGUF es limitado o experimental; para esos motores seria preferible partir del modelo base en safetensors.
- Existe una variante i1 (weighted/imatrix) en https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF para quienes prioricen calidad a igual tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Qwen3-0.6B-heretic-decensored-GGUF (este) | 596 M | no disponible | en | apache-2.0 | GGUF (12 cuantizaciones) |
| Qwen3-0.6B (modelo de origen, sin ablacion) | ~0,6B | no disponible en esta informacion | multilingue | apache-2.0 | safetensors |
| vrhvnsky/Qwen3-0.6B-heretic-decensored (padre directo) | ~0,6B | no disponible | en | apache-2.0 | safetensors |
| Qwen2.5-0.5B (referencia de categoria) | ~0,5B | no disponible en esta informacion | multilingue | apache-2.0 | safetensors, GGUF comunitario |
| Llama-3.2-1B (referencia de categoria) | ~1,2B | no disponible en esta informacion | multilingue | licencia comunitaria de Llama 3.2 | safetensors, GGUF comunitario |

Los datos de contexto y rendimiento de los modelos comparados no forman parte de la informacion proporcionada en esta busqueda y deben contrastarse con sus respectivas model cards. La diferencia funcional clave de este modelo frente a sus alternativas directas no es de rendimiento, sino de comportamiento: la ablacion reduce los rechazos, algo que ninguno de los modelos alineados equivalentes ofrece.

## Limitaciones y advertencias

- Sesgos: al derivar de Qwen3-0.6B y entrenarse principalmente en ingles, hereda los sesgos del corpus original y la sobrerrepresentacion del ingles frente a otras lenguas.
- Alucinacion: con 0,6B parametros la tasa de invencion de hechos es alta, especialmente en preguntas factuales, matematicas y razonamiento de varios pasos. No debe usarse como fuente de verdad sin verificacion externa.
- La ablacion elimina parte de los mecanismos de rechazo del modelo alineado: puede generar contenido ofensivo, inseguro o inapropiado ante peticiones que otros modelos rechazarian. Se recomienda encarecidamente un filtro de moderacion externo en cualquier despliegue accesible a terceros.
- Idioma: solo ingles declarado. El rendimiento en castellano u otras lenguas no esta soportado ni medido y sera previsiblemente pobre.
- Capacidad de agencia: no hay evidencia de soporte fiable de tool calling, function calling ni razonamiento multi-paso a esta escala; no conviene disenar agentes sobre este modelo sin validacion previa.
- Contexto: la longitud de contexto efectiva no esta documentada en el repositorio de cuantizacion; las cuantizaciones de mas baja precision suelen degradar el rendimiento en contextos largos.
- Calidad de las cuantizaciones: la propia model card advierte de que Q3_K_M es de calidad inferior. Para produccion se recomienda Q4_K_S, Q4_K_M o superiores. Los cuantizados IQ suelen ofrecer mejor relacion calidad/tamano que sus equivalentes no IQ del mismo tamano.
- Licencia: el repositorio declara apache-2.0 con enlace a la licencia de Qwen/Qwen3-0.6B, lo que en principio permite uso comercial. No obstante, el autor de la informacion no ofrece garantias explicitas y conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Reproducibilidad: el repositorio se etiqueta como reproducible, pero no se documentan semillas, versiones de herramientas ni comandos de cuantizacion en la informacion disponible.
- Fechas: las marcas de creacion y actualizacion del repositorio (2026-09-12) son posteriores a la fecha de consulta habitual de este tipo de fichas; conviene verificarlas en la pagina de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-GGUF
- Repositorio de cuantizaciones i1 (imatrix/weighted): https://huggingface.co/mradermacher/Qwen3-0.6B-heretic-decensored-i1-GGUF
- Modelo base: https://huggingface.co/vrhvnsky/Qwen3-0.6B-heretic-decensored
- Modelo de origen de Qwen: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia de referencia: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3-0.6B-heretic-decensored-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede los recursos de cuantizacion: https://www.nethype.de/

Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; los enlaces devueltos corresponden a paginas de Google Maps y a programas de recompensas por vulnerabilidades, sin relacion con el modelo.
