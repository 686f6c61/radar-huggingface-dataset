# mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF

## Resumen

Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher (nethype GmbH) a partir del modelo 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated. Se trata, por tanto, de un artefacto de compresión y distribución, no de un modelo entrenado desde cero: su aportación es empaquetar los pesos originales en una escala de cuantizaciones que va de Q2_K (13,0 GB) a Q8_0 (37,0 GB), además de dos ficheros mmproj para el proyector multimodal.

El modelo base cuenta con 34.660.610.688 parámetros reales según los pesos en safetensors, lo que sitúa la cifra en torno a 34,66 mil millones. El sufijo A3B del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos por token, aunque la model card del repositorio de cuantización no documenta la arquitectura ni confirma ese extremo. La metadata declara únicamente inglés como idioma, licencia MIT y compatibilidad con endpoints conversacionales.

Su relevancia práctica ahora mismo es la de facilitar la inferencia local de un modelo de ~35B en hardware de consumo: las cuantizaciones Q4_K_S (20,0 GB) y Q4_K_M (21,3 GB) permiten ejecutar el modelo en GPUs de 24 GB, y las variantes Q2_K y Q3_K en GPUs de 16 GB. El repositorio no incluye resultados de evaluación, ni descargas ni valoraciones en el momento de la consulta, y no se ha publicado información técnica adicional sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A3B del nombre sugiere MoE con ~3B activos, sin confirmar en la informacion proporcionada) |
| Parametros totales | 34.660.610.688 (34,66 B) segun pesos safetensors del modelo base |
| Parametros activos | no disponible (nombre sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; IQ4_XS aparece en los metadatos del repositorio pero sin fichero listado en la tabla de cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF; incluye ademas ficheros mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) para el proyector multimodal |
| Tamano del repositorio | 238,6 GB |
| Modelo base | 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura del modelo base: ni el tipo de transformer, ni si emplea atencion lineal, decodificacion especulativa o cualquier otra innovacion, ni la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF o DPO. El unico indicio estructural es el sufijo A3B del nombre, que en la convencion habitual de nombres de modelos MoE indica parametros activos, en este caso del orden de 3 mil millones frente a los 34,66 mil millones totales. Se trata de una inferencia a partir del nombre, no de un dato confirmado por la model card.

En cuanto al repositorio de cuantizaciones, mradermacher aplica cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos originales. La propia model card indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion y que el autor no tiene previsto generarlas salvo peticion en la seccion de discusiones. La presencia de ficheros mmproj descritos como "multi-modal supplement" apunta a que el modelo base incorpora un proyector multimodal, aunque la model card no detalla que modalidades cubre ni con que datos se entreno ese componente.

El termino "abliterated" en el nombre del modelo base hace referencia a la tecnica de abliteration, que elimina direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo a peticiones que su alineamiento original bloquearia. Esta modificacion no se describe en detalle en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles: la metadata del repositorio incluye la etiqueta conversational y la compatibilidad con endpoints.
- Ejecucion local en cuantizaciones de 2 a 8 bits: el repositorio cubre desde Q2_K hasta Q8_0, lo que permite ajustar el equilibrio entre calidad y memoria.
- Soporte multimodal a traves de los ficheros mmproj: el repositorio incluye un proyector multimodal en Q8_0 y f16, aunque la model card no especifica si se trata de vision, audio u otra modalidad.
- Comportamiento con rechazos reducidos: al derivar de una variante abliterated, el modelo tiende a no declinar peticiones que un modelo alineado convencionalmente rechazaria.
- Inferencia eficiente si se confirma la arquitectura MoE: con unos 3B de parametros activos por token, el coste de computo por token seria muy inferior al de un modelo denso de 34,66B.
- Tool calling, function calling, agentes, modo thinking, razonamiento multi-paso y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una GPU de 24 GB usando Q4_K_M (21,3 GB) para mantener conversaciones multi-turno sin enviar datos a APIs externas.
- Generacion de texto creativo y role-play sin restricciones de rechazo: la naturaleza abliterated del modelo base lo hace adecuado para ficcion, personajes o narrativa donde los modelos alineados suelen declinar peticiones.
- Procesamiento por lotes de texto en servidores con GPU de 16 GB: la cuantizacion Q2_K (13,0 GB) o Q3_K_S (15,3 GB) permite ejecutar el modelo en tarjetas de gama media-alta para tareas de resumen, reescritura o clasificacion a gran escala.
- Experimentacion con tecnicas de abliteration: el repositorio sirve como material de partida para investigar como la eliminacion de direcciones de rechazo afecta a la calidad del texto en distintas cuantizaciones.
- Base para fine-tuning o destilacion: los pesos del modelo base subyacente pueden servir como punto de partida para adaptaciones con LoRA, aunque el repositorio GGUF no es el formato adecuado para entrenar.
- Pruebas de pipelines multimodales en local: los ficheros mmproj permiten experimentar con el proyector multimodal del modelo en entornos llama.cpp, siempre que el modelo base lo soporte.
- Evaluacion comparativa de cuantizaciones: al ofrecer once variantes de cuantizacion del mismo modelo, resulta util para medir el impacto de la compresion en la perplejidad y la coherencia con hardware limitado.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible sugiere su uso en infraestructuras que consumen modelos servidos por API, aunque no hay datos sobre latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni para los pesos originales ni para las distintas cuantizaciones. Tampoco hay mediciones de perplejidad por nivel de cuantizacion mas alla de la referencia generica al grafico comparativo de ikawrakow.

## Requisitos de hardware

Las siguientes estimaciones de VRAM se derivan del tamano de fichero de cada cuantizacion; hay que anadir entre 1 y 4 GB adicionales para la cache KV y el contexto, cantidad que depende de la longitud de contexto efectiva (no documentada).

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia |
|---|---|---|
| Q2_K | 13,0 GB | ~14-16 GB |
| Q3_K_S | 15,3 GB | ~16-18 GB |
| Q3_K_M | 16,9 GB | ~18-20 GB |
| Q3_K_L | 18,2 GB | ~19-21 GB |
| Q4_K_S | 20,0 GB | ~21-23 GB |
| Q4_K_M | 21,3 GB | ~22-24 GB |
| Q5_K_S | 24,1 GB | ~25-28 GB |
| Q5_K_M | 24,8 GB | ~26-28 GB |
| Q6_K | 28,6 GB | ~30-32 GB |
| Q8_0 | 37,0 GB | ~38-42 GB |
| mmproj-Q8_0 | 0,7 GB | se suma al total si se usa el modo multimodal |
| mmproj-f16 | 1,0 GB | se suma al total si se usa el modo multimodal |

- GPU de gama de consumo compatibles: RTX 4090, RTX 3090 y RTX 4080 con Q4_K_M o inferior; RTX 4080 de 16 GB, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB con Q2_K o Q3_K_S; tarjetas de 12 GB quedan fuera de todas las variantes salvo offloading parcial a RAM.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB admiten Q8_0 sin offloading; una A100 40 GB cubre hasta Q6_K con holgura.
- Si el modelo es realmente MoE con ~3B activos, el offloading de expertos a RAM del sistema con llama.cpp penalizaria mucho menos el throughput que en un modelo denso equivalente, lo que permitiria ejecutar Q4_K_M en GPUs de 12-16 GB con parte de los expertos en CPU.
- Opciones de despliegue para GGUF: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con el formato. Para los pesos originales en safetensors habria que recurrir a vLLM, TGI o transformers, aunque esos formatos no se incluyen en este repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones ni para ningun hardware concreto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye ningun modelo comparable con datos verificables de parametros, contexto, rendimiento o licencia que permita establecer una comparacion rigurosa. La unica referencia interna es el propio modelo base 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated, del que este repositorio es una reedicion cuantizada:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF | 34,66 B | no disponible | GGUF | MIT | 11 cuantizaciones estaticas, 238,6 GB de repositorio, 0 descargas |
| 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated | 34,66 B | no disponible | no disponible | no disponible | Modelo base del que derivan las cuantizaciones |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de direcciones de rechazo reduce las barreras de seguridad del alineamiento original, por lo que puede generar contenido danino, ofensivo o ilegal ante peticiones que un modelo alineado rechazaria. No es recomendable exponerlo directamente a usuarios finales sin filtros adicionales.
- Solo ingles: la metadata declara unicamente el idioma en, sin evidencia de capacidades multilingues. En castellano el rendimiento es probablemente pobre aunque no hay mediciones que lo confirmen.
- Riesgo de alucinacion: no hay datos de evaluacion de fidelidad, por lo que no puede asumirse precision factual en tareas de recuperacion o resumen.
- Ausencia total de benchmarks: no se han publicado resultados que permitan validar la calidad del modelo base ni cuantificar la degradacion introducida por cada nivel de cuantizacion.
- Cuantizaciones pequenas: Q2_K (13,0 GB) y Q3_K_M (16,9 GB) tendran una perdida de calidad notable; la propia model card marca Q3_K_M como "lower quality". Para produccion conviene Q4_K_M o superior.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que impide dimensionar la cache KV y planificar casos de uso con entradas largas.
- Arquitectura no confirmada: la hipotesis de MoE con ~3B activos procede del nombre del modelo y no de documentacion tecnica.
- Ficheros multimodales sin documentar: el repositorio incluye mmproj, pero no se especifica que modalidad cubre ni como activarla correctamente.
- Licencia: la metadata del repositorio de cuantizaciones declara MIT, pero la licencia del modelo base no aparece en la informacion proporcionada. Conviene verificarla antes de un uso comercial, ya que las condiciones del modelo original podrian imponer restricciones adicionales.
- Repositorio sin traccion: 0 descargas y 0 valoraciones en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion de 2026, poco habituales en el catalogo de HuggingFace; conviene confirmar la vigencia de los ficheros antes de integrarlos en un pipeline.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del cuantizador: https://www.nethype.de/
