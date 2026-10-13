# mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-GGUF

## Resumen

mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-GGUF es una coleccion de cuantizaciones GGUF estaticas generadas por mradermacher a partir del modelo prithivMLmods/Qwen3.6-35B-A3B-abliterated-MAX. El modelo subyacente cuenta con 34.660.610.688 parametros reales (segun los pesos safetensors del repo base) y ha sido sometido a un proceso de "abliteration", es decir, la modificacion del alineamiento para eliminar los comportamientos de rechazo (refusal-ablated), lo que lo orienta a escenarios de investigacion sobre seguridad, generacion creativa sin filtros y evaluacion de sesgos.

Se trata de una cuantizacion, no de un entrenamiento nuevo: mradermacher toma los pesos del modelo base y los convierte a formato GGUF con diversos niveles de compresion, desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), ademas de ficheros mmproj para un proyector multimodal. El repositorio ocupa 237,1 GB en total, con licencia Apache 2.0 y soporte declarado unicamente para ingles.

Su relevancia actual es practica: permite ejecutar un modelo de ~35B parametros con arquitectura de mezcla de expertos (la nomenclatura A3B del nombre apunta a unos 3B parametros activos, aunque el dato no esta confirmado en la informacion disponible) en hardware de consumo mediante llama.cpp u Ollama, algo inviable con los pesos bf16 completos. La ausencia de rechazos lo hace util como herramienta de red teaming, pero tambien implica riesgos claros en cualquier despliegue orientado al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la nomenclatura "A3B" del nombre apunta a mezcla de expertos (MoE), sin confirmar en la informacion disponible |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | No disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors, bf16 y pytorch en el modelo base) |
| Tamano del repositorio | 237,1 GB |
| Modelo base | prithivMLmods/Qwen3.6-35B-A3B-abliterated-MAX |
| Variante imatrix | mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-i1-GGUF |
| Descargas / likes | 891 / 0 |
| Fecha de creacion | 2026-04-22 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada: no se especifican el numero de capas, la dimension oculta, el numero de expertos ni el mecanismo de atencion. El nombre del modelo ("35B-A3B") sigue la convencion habitual para modelos de mezcla de expertos con parametros totales y parametros activos por token, lo que situaria el coste de inferencia por token en el orden de un modelo denso de ~3B, pero este extremo no queda confirmado por ningun dato del repositorio. Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares.

La unica transformacion documentada es el "abliteration": el modelo base ha sido modificado para suprimir las direcciones de activacion asociadas a los rechazos, lo que se refleja en las etiquetas uncensored, abliterated, unfiltered, unredacted y refusal-ablated. Por parte de mradermacher, el trabajo consiste en cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin reentrenamiento. La presencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere que el modelo base incorpora un proyector multimodal para entrada de imagenes, aunque no se documenta en el texto de la model card.

## Capacidades

- Generacion de texto conversacional: etiquetado como conversational y text-generation-inference.
- Razonamiento explicito: la etiqueta reasoning indica soporte de cadenas de razonamiento, aunque no se detalla el formato.
- Uso como agente: etiqueta agent, orientada a flujos multi-paso y ejecucion de tareas.
- Compatibilidad con tool calling / function calling: no documentada explicitamente en la informacion disponible.
- Capacidad multimodal: los ficheros mmproj (Q8_0 y f16) apuntan a soporte de vision en el modelo base, sin confirmacion textual.
- Multilingue: no; el unico idioma declarado es ingles.
- Comportamiento sin rechazos: el abliteration elimina las negativas del modelo a determinadas peticiones, lo que constituye su rasgo diferencial.
- Compatibilidad de despliegue: etiquetas vllm, text-generation-inference y endpoints_compatible, ademas del soporte nativo de GGUF en llama.cpp y derivados.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve para generar intentos de jailbreak adversariales controlados y medir la robustez de otros sistemas de filtrado, precisamente porque su alineamiento ha sido suprimido.
- Generacion de datos sinteticos sin filtros: util para construir datasets de investigacion sobre contenido sensible, toxicidad o sesgos, donde un modelo alineado se negaria a colaborar y sesgaria la muestra.
- Escritura creativa sin restricciones: narrativa de ficcion, terror o drama con tematicas adultas donde los modelos convencionales aplican censura, ejecutable en local con Q4_K_M (21,3 GB) en una GPU de 24 GB.
- Asistencia de codigo en local: al ser un GGUF cuantizado se integra en flujos con llama.cpp u Ollama sobre hardware propio, evitando enviar codigo propietario a APIs externas.
- Evaluacion comparativa de abliteration: investigacion sobre como la supresion de rechazos afecta a otras capacidades (razonamiento, coherencia, utilidad general), comparando contra el modelo base original.
- Despliegue en entornos aislados: laboratorios con requisitos de soberania de datos que necesitan un modelo de ~35B sin dependencia de servicios en la nube, usando las cuantizaciones Q6_K o Q8_0 si hay VRAM suficiente.
- Experimentacion con agentes de multiples pasos: la etiqueta agent permite probar pipelines de planificacion y uso de herramientas en local, aunque el soporte real de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan mediciones de perplejidad por nivel de cuantizacion; la unica referencia grafica es un enlace a una comparativa generica de tipos de cuantizacion (ikawrakow) y la nota de Artefact2 sobre el tema.

## Requisitos de hardware

- VRAM estimada segun el tamano de fichero declarado, anadiendo margen para el contexto y el offload: Q2_K 13,0 GB; Q3_K_S 15,3 GB; Q3_K_M 16,9 GB; Q3_K_L 18,2 GB; IQ4_XS 19,0 GB; Q4_K_S 20,0 GB; Q4_K_M 21,3 GB; Q5_K_S 24,1 GB; Q5_K_M 24,8 GB; Q6_K 28,6 GB; Q8_0 37,0 GB.
- Los pesos bf16 del modelo base ocuparian del orden de 69 GB (34,66B x 2 bytes), por lo que requieren una GPU de 80 GB o reparto multi-GPU.
- GPU de consumo: Q4_K_M entra en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; Q2_K y Q3_K_S son viables en tarjetas de 16 GB como la RTX 4080 o 4060 Ti 16 GB. Q6_K y Q8_0 exigen 32-48 GB o reparto entre dos GPU.
- GPU profesionales: A100 40 GB para Q4_K_M y Q5_K_M con contexto amplio; A100 80 GB o H100 80 GB para Q8_0 o bf16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp para los GGUF; vLLM y text-generation-inference aparecen como etiquetas y son aplicables a los pesos safetensors/bf16 del modelo base, no a los ficheros GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una arquitectura MoE con parametros activos reducidos, el throughput esperado seria superior al de un modelo denso del mismo tamano total, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-GGUF | 34,66B totales (activos no disponibles) | No disponible | GGUF (13 cuantizaciones) | Apache 2.0 | HuggingFace, 891 descargas |
| prithivMLmods/Qwen3.6-35B-A3B-abliterated-MAX (base) | 34,66B totales | No disponible | safetensors, bf16 | Apache 2.0 | HuggingFace |
| mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-i1-GGUF | 34,66B totales | No disponible | GGUF (cuantizaciones con imatrix) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones de contexto de ninguna de las alternativas como para establecer una comparacion cuantitativa con modelos de otras familias y tamanos similares. La diferencia principal entre las tres entradas de la tabla es el proceso de cuantizacion: la variante i1 emplea imatrix (matriz de importancia) y suele ofrecer mejor calidad por bit que la cuantizacion estatica de este repositorio.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de los mecanismos de rechazo implica que puede generar contenido danino, ilegal o gravemente ofensivo sin filtros. No es apto para despliegues de cara al publico sin capas de moderacion externas.
- Riesgo de alucinacion: no hay datos de evaluacion de fidelidad; como cualquier modelo generativo de esta escala, puede producir afirmaciones falsas con aparente seguridad, agravado por la falta de benchmarks publicados.
- Idioma: unicamente ingles declarado. El rendimiento en castellano u otras lenguas es desconocido y probablemente degradado.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor del modelo base o el cuantizador no ofrecen garantias; conviene revisar tambien las condiciones del modelo original upstream de la familia Qwen.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad (el propio autor marca Q3_K_M como "lower quality"); para uso serio se recomienda Q4_K_M o superior.
- Sin datos de procedencia del dataset: no se documenta la composicion de los datos de entrenamiento, por lo que no se pueden evaluar sesgos sistematicos ni riesgos de memorizacion de datos personales.
- Soporte de tool calling y de agentes: las etiquetas lo sugieren, pero no hay documentacion tecnica ni ejemplos que lo confirmen; conviene validarlo empiricamente antes de integrarlo en produccion.
- Fecha de creacion posterior a la actualizacion de la familia de referencia: el nombre "Qwen3.6" no se corresponde con una version verificable en la informacion disponible, lo que anade incertidumbre sobre la trazabilidad del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-abliterated-MAX
- Variante con cuantizacion imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-abliterated-MAX-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-abliterated-MAX-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
