# mradermacher/Creative_Writing-Heretic-3.2-1B-GGUF

## Resumen

Creative_Writing-Heretic-3.2-1B-GGUF es la versión cuantizada en formato GGUF del modelo NovaCorp/Creative_Writing-Heretic-3.2-1B, publicada por el usuario mradermacher. Se trata de un modelo de 1.235.814.432 parámetros (aproximadamente 1,24 mil millones) orientado a generación de texto creativo, construido mediante mergekit a partir de otros modelos de la familia Llama 3.2 1B y sometido a un proceso de "abliteración" o eliminación de direcciones de rechazo (etiqueta heretic), lo que da como resultado un modelo sin censura y con contenido NSFW explícitamente señalizado.

El repositorio que nos ocupa no es un modelo nuevo, sino un conjunto de cuantizaciones estáticas del modelo base: incluye doce variantes que van desde Q2_K (0,7 GB) hasta f16 (2,6 GB), pasando por Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K y Q8_0. Está pensado para ejecutarse en hardware muy modesto, incluso en CPU, mediante llama.cpp y sus derivados, y declara soporte únicamente para inglés y español.

Su relevancia actual es doble: por un lado, ofrece una alternativa de muy bajo coste computacional para tareas de escritura creativa y experimentación con modelos "sin restricciones"; por otro, es un ejemplo claro de la corriente de modelos abliterados que eliminan los mecanismos de rechazo del alineamiento original, con las implicaciones éticas y legales que ello conlleva. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de la familia Llama 3.2 1B); modelo fusionado con mergekit |
| Parametros totales | 1.235.814.432 (aproximadamente 1,24 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base pertenece a la familia Llama 3.2) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (el modelo base NovaCorp/Creative_Writing-Heretic-3.2-1B se distribuye en safetensors para transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base fue creado con mergekit (etiquetas mergekit y merge), lo que indica que se trata de una fusion de pesos de varios modelos, no de un entrenamiento desde cero. Por la licencia declarada (llama3.2) y el tamano de parametros, la arquitectura subyacente es un transformer decoder-only denso de la familia Llama 3.2 1B, con atencion causal estandar. Al ser un modelo denso de 1,24 B de parametros, no incorpora mezcla de expertos ni parametros activos diferenciados.

El aspecto mas destacable del proceso es la abliteracion (etiqueta heretic): se eliminan o atenuan las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a instrucciones que un modelo alineado convencional rechazaria. No se especifican en la informacion proporcionada ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La aportacion del repositorio analizado es exclusivamente la cuantizacion: se indican los parametros internos de la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se senala que no se han generado cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto creativo: relatos, ficcion, dialogos y prosa en general, ambito para el que fue fusionado el modelo base.
- Escritura sin restricciones de contenido: al ser un modelo abliterado, no aplica los filtros de rechazo tipicos de los modelos alineados y puede producir contenido NSFW o sensible cuando se le solicita.
- Generacion de texto general y continuacion de prompts en ingles y espanol.
- Conversacion multiturno basica en formato chat (los GGUF son compatibles con plantillas de chat en llama.cpp y derivados).
- Capacidades multilingues limitadas a los dos idiomas declarados: ingles y espanol.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso, modo "thinking", vision, audio ni capacidades de agente.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, poemas o guiones en espanol e ingles, y su tamano de 1,24 B permite iterar rapidamente sobre muchas variantes en local.
- Prototipado de aplicaciones de ficcion interactiva: al ejecutarse con cuantizaciones de menos de 1 GB, se puede integrar en videojuegos o demos narrativas que corran en el propio dispositivo del usuario sin conexion.
- Generacion de contenido sin filtros para investigacion sobre seguridad: util para estudiar como se comportan los modelos abliterados y que tipo de contenido producen, en un entorno controlado y con las salvaguardas externas adecuadas.
- Redaccion y reescritura de textos en espanol: tareas de parafraseo, resumen simple o cambio de tono, aprovechando que el modelo declara soporte nativo de espanol.
- Experimentacion academica con modelos fusionados: sirve para comparar el efecto de mergekit y de la abliteracion frente al modelo Llama 3.2 1B original en tareas controladas.
- Asistente de escritura en local con recursos minimos: desplegado mediante llama.cpp u Ollama en un portatil sin GPU dedicada, puede ofrecer completado de texto en editores o herramientas de notas.
- Generacion de datos sinteticos de bajo coste: al ser muy ligero, puede producir grandes volumenes de texto para preentrenamiento o aumento de datasets, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio analizado se limita a listar las cuantizaciones ofrecidas, su tamano en GB y notas cualitativas sobre calidad y velocidad; no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB con Q2_K o Q3_K_S; 0,9 GB con Q4_K_M; 1,0 GB con Q5_K_M; 1,4 GB con Q8_0; 2,6 GB con f16. Hay que sumar el espacio de la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. Tambien es viable en GPUs integradas y en CPU pura.
- Cabe sin problema en GPUs de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en dispositivos moviles o sistemas embebidos con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui (oobabooga), koboldcpp y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario usar el modelo base en safetensors, ya que este repositorio solo publica GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card solo etiqueta Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Creative_Writing-Heretic-3.2-1B (este) | 1,24 B | No disponible | Llama 3.2 Community License | GGUF en este repo; safetensors en el repo base | Fusion abliterada, sin censura, solo en/es |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens segun la documentacion oficial de Meta | Llama 3.2 Community License | Pesos oficiales en safetensors y multiples GGUF de terceros | Modelo alineado de referencia de la misma familia |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | Safetensors y GGUF | Licencia permisiva y buen rendimiento en codigo y matematicas |
| Gemma 2 2B | 2,6 B | 8 192 tokens | Gemma Terms of Use | Safetensors y GGUF | Mayor tamano, contexto mas corto |

Los datos de contexto, licencia y parametros de los modelos de la columna comparativa corresponden a sus especificaciones publicas habituales; no se dispone de cifras de benchmarks comparativos dentro de la informacion proporcionada, por lo que no se incluyen valoraciones de rendimiento.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo esta explicitamente etiquetado como uncensored, nsfw y not-for-all-audiences. La abliteracion elimina los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino sin advertencia.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad real, su tasa de alucinacion ni su degradacion respecto al modelo original.
- Riesgo elevado de alucinacion: con 1,24 B de parametros y sin datos de entrenamiento documentados, la fidelidad factual es limitada por diseno.
- Cobertura idiomatica reducida: solo ingles y espanol declarados; el rendimiento en otros idiomas sera probablemente pobre.
- Contexto no confirmado: aunque la familia Llama 3.2 suele soportar ventanas amplias, no se confirma en este repositorio cual es la longitud efectiva tras el merge, y las cuantizaciones de baja precision pueden degradar el rendimiento en contextos largos.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones de atribucion, obligaciones de mencion ("Built with Llama") y restricciones de uso (por ejemplo, prohibicion de usos ilegales o de entrenar otros modelos con los resultados en determinados supuestos). Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Responsabilidad del despliegue: al carecer de alineamiento, cualquier producto que lo utilice debe implementar sus propias capas de moderacion y filtrado, tanto en la entrada como en la salida.
- Autoria de la cuantizacion: el repositorio es un trabajo de cuantizacion de un tercero (mradermacher) sobre un modelo fusionado de NovaCorp; los posibles problemas de calidad o licencia del modelo base se heredan integramente.
- Datos de adopcion irrelevantes: el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Creative_Writing-Heretic-3.2-1B-GGUF
- Modelo base: https://huggingface.co/NovaCorp/Creative_Writing-Heretic-3.2-1B
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Creative_Writing-Heretic-3.2-1B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/

Nota: los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre este modelo y no se han utilizado como fuente.
