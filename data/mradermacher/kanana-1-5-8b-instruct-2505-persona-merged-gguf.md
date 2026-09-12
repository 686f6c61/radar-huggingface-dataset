# mradermacher/kanana-1.5-8b-instruct-2505-Persona-Merged-GGUF

## Resumen

kanana-1.5-8b-instruct-2505-Persona-Merged-GGUF es la versión cuantizada en formato GGUF del modelo NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged, publicada por el cuantizador mradermacher. Se trata de un modelo de lenguaje de 8.030.285.824 parámetros (aproximadamente 8,03 mil millones) derivado de la familia Kanana 1.5, un modelo instructivo de 8B con contexto extendido, sobre el que un tercero ha aplicado una fusión orientada a persona conversacional ("Persona-Merged"). El repositorio no es un entrenamiento original, sino un reempaquetado en GGUF pensado para inferencia local y eficiente en CPU/GPU.

El valor práctico de esta ficha radica en que mradermacher ofrece doce niveles de cuantización estática (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB), lo que permite desplegar un modelo de 8B en hardware de consumo con una ventana razonable de calidad. La licencia declarada es Apache-2.0 y el modelo está etiquetado exclusivamente para inglés (en). El repositorio, de 71,8 GB, acumula 182 descargas y 0 likes en los datos consultados, y fue creado el 21 de mayo de 2026 y actualizado el 12 de septiembre de 2026.

Es relevante ahora porque los modelos de 8B cuantizados a 4-5 bits son el punto dulce para asistentes conversacionales locales y pipelines con requisitos de privacidad, y esta variante "Persona-Merged" apunta específicamente a ese caso de uso. La contrapartida es que no hay resultados de benchmarks ni model card detallada del modelo fusionado, por lo que su comportamiento real debe validarse empíricamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la model card no detalla la arquitectura interna (la etiqueta del conversor GGUF es "llama") |
| Parametros totales | 8.030.285.824 (8,03 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estaticas) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros estaticos, sin cuantizaciones ponderadas ni imatrix) |
| Modelo base | NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 71,8 GB |
| Descargas / likes | 182 / 0 |
| Fecha de creacion / actualizacion | 2026-05-21 / 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de las etiquetas del repositorio, que incluyen "llama" como tipo de conversion a GGUF y "transformers" como libreria. Por el recuento de parametros (8,03 B) y el nombre del modelo base, se trata de un transformer decoder-only de escala 8B, coherente con la familia Kanana 1.5 de la que deriva. El repositorio es una cuantizacion, no un entrenamiento: no se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card de mradermacher solo documenta el proceso de conversion (quantize_version 2, output_tensor_quantised 1, convert_type hf) y la lista de ficheros generados.

El elemento diferencial del modelo base es la fusion "Persona-Merged", un merge de pesos orientado a reforzar un estilo conversacional concreto. No se especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, linear) ni con que ponderaciones. Ademas, mradermacher indica explicitamente que no hay cuantizaciones ponderadas ni imatrix disponibles y que no tiene previsto generarlas, por lo que todos los ficheros son cuantizaciones estaticas: esto implica que los niveles bajos (Q2_K, Q3_K_S) pueden degradar mas de lo habitual en comparacion con un imatrix equivalente. Para el usuario final, esto significa que no hay forma de auditar la innovacion tecnica del merge ni de reproducir el entrenamiento a partir de este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, en linea con la etiqueta "conversational" del repositorio.
- Modelo de tipo instruct, por lo que responde a instrucciones y formatos de chat.
- El merge orientado a persona sugiere un estilo de respuesta consistente y con personalidad definida, aunque no se documenta formalmente.
- Soporte multilingue limitado: solo ingles segun la etiqueta de idioma, sin evidencia de capacidad en castellano u otros idiomas.
- No hay informacion sobre soporte de tool calling o function calling en la model card.
- No hay informacion sobre capacidades de agente, razonamiento multi-paso, modo thinking, vision o audio.
- Compatible con Text Generation Inference y endpoints compatibles segun las etiquetas, ademas de la via habitual de llama.cpp/Ollama por ser GGUF.
- Integrable en pipelines de transformers mediante la libreria indicada y en stacks de cuantizacion con Unsloth.

## Casos de uso

- Asistente conversacional local con personalidad fija: el merge "Persona-Merged" esta pensado para mantener un tono y estilo consistentes a lo largo de una conversacion, algo util en personajes virtuales, entrenamiento de habilidades sociales o prototipos de acompañamiento conversacional. Se desplegaria con una cuantizacion Q4_K_M o Q5_K_M en una GPU de consumo.
- Prototipado rapido sin depender de APIs externas: con ficheros de 3,3 a 5,8 GB, se puede levantar un servidor de chat en un portatil o estacion de trabajo modesta mediante Ollama o llama.cpp, sin coste por token ni envio de datos a terceros.
- Procesamiento de texto con requisitos de privacidad: en entornos donde el texto no puede salir de la infraestructura (legal, salud, RR. HH.), el modelo se puede ejecutar on-premise con la cuantizacion Q8_0 si hay una GPU de 12-16 GB o en CPU con Q4_K_S.
- Generacion de respuestas conversacionales en aplicaciones de soporte en ingles: el modelo puede gestionar turnos de conversacion y mantener contexto dentro de su ventana, sirviendo como capa de generacion en un sistema de atencion al cliente en ingles, siempre que se valide su calidad con un conjunto de prueba propio.
- Componente de un pipeline de evaluacion o comparacion de merges: dado que es un merge de terceros sin benchmarks, es util como punto de referencia para medir el impacto de distintas tecnicas de fusion de pesos frente al modelo Kanana 1.5 original.
- Fine-tuning ligero o adaptacion con LoRA: al estar en GGUF y ser compatible con la libreria transformers y las etiquetas de Unsloth, sirve como punto de partida para adaptaciones posteriores, aunque el entrenamiento real requeriria los pesos originales en safetensors, no el GGUF.
- Despliegue en equipos sin GPU: las cuantizaciones Q2_K y Q3_K_S (3,3-3,8 GB) permiten ejecucion en CPU con 8 GB de RAM, util para demos, tests automatizados o entornos de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la informacion proporcionada tampoco incluye la model card del modelo base NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged. No se deben asumir cifras del modelo Kanana 1.5 original como si correspondieran a este merge.

## Requisitos de hardware

Los siguientes valores de VRAM son estimaciones basadas en el tamano de fichero de cada cuantizacion mas el espacio necesario para el contexto y los buffers de inferencia (no son datos publicados por el autor):

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia | Encaje en GPU de consumo |
|---|---|---|---|
| Q2_K | 3,3 GB | ~4 GB | Si, en cualquier GPU de 6 GB o mas |
| Q3_K_S | 3,8 GB | ~4,5 GB | Si, GPU de 6 GB o mas |
| Q3_K_M | 4,1 GB | ~5 GB | Si, GPU de 6-8 GB |
| Q3_K_L | 4,4 GB | ~5,5 GB | Si, GPU de 8 GB |
| IQ4_XS | 4,6 GB | ~5,5 GB | Si, GPU de 8 GB |
| Q4_K_S | 4,8 GB | ~6 GB | Si, GPU de 8 GB |
| Q4_K_M | 5,0 GB | ~6-7 GB | Si, GPU de 8-12 GB |
| Q5_K_S | 5,7 GB | ~7 GB | Si, GPU de 8-12 GB |
| Q5_K_M | 5,8 GB | ~7-8 GB | Si, GPU de 12 GB |
| Q6_K | 6,7 GB | ~8-9 GB | Si, GPU de 12 GB |
| Q8_0 | 8,6 GB | ~10-11 GB | Si, GPU de 12-16 GB |
| f16 | 16,2 GB | ~18-20 GB | Solo en GPU de 24 GB (RTX 3090/4090, A10G) |

- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superior; para Q8_0, una RTX 4080/4090 o una A10/A100; para f16, una RTX 3090/4090 de 24 GB, A100 40 GB o H100.
- Ejecucion en CPU: viable con Q2_K a Q4_K_M sobre 8-16 GB de RAM; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui (oobabooga) para el formato GGUF. El repositorio esta etiquetado como compatible con Text Generation Inference y endpoints compatibles; en vLLM el soporte de GGUF es experimental y conviene verificarlo. Para entrenamiento o fine-tuning habria que recurrir a los pesos originales en safetensors, no al GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparacion rigurosa. La tabla siguiente compara caracteristicas declaradas de modelos de escala similar ampliamente conocidos; los datos de las alternativas provienen de informacion publica general y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato disponible |
|---|---|---|---|---|---|
| kanana-1.5-8b-instruct-2505-Persona-Merged-GGUF (este) | 8,03 B | No disponible | Apache-2.0 | Ingles | GGUF |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Multilingue | Safetensors, GGUF (comunidad) |
| Qwen2.5 7B Instruct | 7,61 B | 131.072 tokens | Apache-2.0 | Multilingue | Safetensors, GGUF (comunidad) |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 tokens | Apache-2.0 | Ingles y varios | Safetensors, GGUF (comunidad) |

Diferencias clave: este modelo solo declara soporte de ingles, frente al caracter multilingue de Llama 3.1 y Qwen2.5; su licencia Apache-2.0 es mas permisiva que la de Llama 3.1; y su ventana de contexto no esta documentada, mientras que las alternativas publican contextos de 32K a 128K tokens. En rendimiento no se puede comparar al no existir benchmarks publicados de este merge.

## Limitaciones y advertencias

- Idioma: la etiqueta de idioma del repositorio es unicamente "en". No hay evidencia de calidad en castellano u otros idiomas, por lo que no es apto para produccion multilingue sin validacion previa.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide dimensionar la memoria necesaria para conversaciones largas y limita el uso en tareas de documento extenso.
- Ausencia de benchmarks: no hay ninguna metrica publicada de MMLU, HumanEval, GSM8K ni de calidad conversacional, ni para el merge ni para este cuantizado. Cualquier afirmacion de rendimiento seria una invencion.
- Riesgo de alucinacion: inherente a los modelos de 8B y no evaluado en este caso concreto; en tareas factuales o de codigo en produccion requiere verificacion humana o capas de validacion.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay quants ponderados ni imatrix y que probablemente no los habra. Los niveles Q2_K y Q3_K_S pueden degradar la calidad de forma notable, especialmente en un modelo fusionado.
- Modelo fusionado por terceros: "Persona-Merged" no viene acompañado de documentacion sobre que pesos se combinaron, con que metodo ni con que hiperparametros. Esto dificulta la reproducibilidad y la trazabilidad del origen del comportamiento.
- Restricciones de licencia: la licencia declarada es Apache-2.0, lo que en principio permite uso comercial. No obstante, al tratarse de un merge de un modelo derivado de la familia Kanana 1.5, conviene verificar los terminos del modelo original y del repositorio de NotoriousH2 antes de un uso comercial, ya que la licencia declarada en el cuantizado no sustituye a la del modelo base.
- Versionado: el repositorio fue creado el 2026-05-21 y actualizado el 2026-09-12; conviene fijar un hash de revision concreto en produccion para evitar cambios inesperados.
- Popularidad baja: 182 descargas y 0 likes implican poca validacion por parte de la comunidad, con menos probabilidad de que se hayan detectado y reportado fallos.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso; asumir estas capacidades sin pruebas previas es arriesgado.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/kanana-1.5-8b-instruct-2505-Persona-Merged-GGUF
- Modelo base (merge original): https://huggingface.co/NotoriousH2/kanana-1.5-8b-instruct-2505-Persona-Merged
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#kanana-1.5-8b-instruct-2505-Persona-Merged-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, su modelo base o sus benchmarks; los resultados obtenidos eran contenido no relacionado con la consulta y se han descartado. Por tanto, no hay enlaces a papers, blogs o demos adicionales que se puedan incluir con garantias.
