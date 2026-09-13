# mradermacher/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio contiene la conversion a GGUF del modelo DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated, publicada por el usuario mradermacher. Se trata de un derivado de tercera generacion: parte de DeepSeek-R1-Distill-Qwen-14B, un modelo destilado a partir de las trazas de razonamiento de DeepSeek-R1 sobre la arquitectura Qwen2.5-14B, al que despues se aplico una "abliteracion" (supresion de la direccion de rechazo en el espacio de activaciones) para reducir las negativas del modelo. Sobre esa variante, mradermacher ha generado un conjunto de cuantizaciones GGUF con imatrix (sufijo i1) orientadas a ejecucion en CPU y GPU de gama de consumo mediante llama.cpp y herramientas compatibles.

El interes practico del modelo es doble. Por un lado, ofrece razonamiento explicito con cadena de pensamiento larga en un tamano de 14.770.033.664 parametros (unos 14,77 mil millones), que cabe en una GPU de consumo si se cuantiza a 4 bits (ficheros de 9,1 GB). Por otro, la variante abliterated interesa a quien necesita un modelo con menos rechazos para investigacion sobre alineacion, red teaming o generacion de contenido que los modelos alineados estandar bloquean.

Conviene tratarlo con cautela: en el momento de la consulta el repositorio registra 0 descargas y 0 "likes", no declara pipeline, no publica benchmarks y no existe validacion independiente de la calidad del resultado tras la abliteracion y la cuantizacion. Es una conversion comunitaria, no un lanzamiento oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen2.5-14B (no confirmado de forma explicita en la model card) |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-14B soporta 32.768 tokens nativos, pero la ficha de esta conversion no lo confirma |
| Tipos de cuantizacion | i1 (imatrix): IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K. Ademas se incluye el fichero imatrix para generar cuantizaciones propias. Existe un repositorio hermano con cuantizaciones estaticas (sin imatrix) |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | MIT |
| Formato de pesos | GGUF (.gguf), en ficheros unicos por cuantizacion. El modelo base abliterated esta en safetensors |
| Tamano del repositorio | 148,5 GB (incluye todas las cuantizaciones) |
| Cuantizado por | mradermacher |
| Modelo base directo | 3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated |

## Arquitectura y entrenamiento

La cadena de derivacion es la siguiente. DeepSeek-R1-Distill-Qwen-14B se obtiene por destilacion supervisada: se toman las trazas de razonamiento generadas por DeepSeek-R1 (el modelo MoE de razonamiento de DeepSeek) y se afinan con ellas los pesos de Qwen2.5-14B, un transformer decoder-only denso con atencion de consultas agrupadas (GQA). El resultado conserva el comportamiento de "pensar antes de responder" del profesor, con cadenas de pensamiento largas delimitadas por etiquetas, pero en un modelo denso de 14B ejecutable en hardware modesto.

Sobre ese modelo, el usuario 3MPER0RR aplico una abliteracion: una intervencion sobre los pesos o las activaciones que elimina la direccion asociada a los rechazos, de modo que el modelo deja de negarse a responder ante determinadas peticiones. Es una tecnica habitual en la comunidad, pero degrada parcialmente las capacidades del modelo y no existe una evaluacion publicada del dano causado en este caso concreto. Finalmente, mradermacher ha reconvertido el resultado a GGUF y ha generado cuantizaciones de 1 a 6 bits con calibracion imatrix, un metodo que calcula una matriz de importancia de pesos para repartir mejor el error de cuantizacion. No se aportan datos sobre el conjunto de calibracion, el numero de tokens de destilacion ni si hubo RLHF o DPO adicionales en esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento explicito con cadena de pensamiento larga (estilo DeepSeek-R1), util para matematicas, logica y problemas de varios pasos.
- Generacion y explicacion de codigo, heredada del modelo destilado.
- Resolucion de problemas matematicos paso a paso.
- Ejecucion local en CPU y GPU gracias al formato GGUF y al amplio abanico de cuantizaciones.
- Comportamiento con menos rechazos que el modelo alineado original, como consecuencia de la abliteracion.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada. Los modelos de la familia R1-Distill tienen soporte limitado de plantillas de herramientas, pero esta ficha no lo acredita.
- Capacidades de agente y razonamiento multi-paso: no confirmadas de forma explicita, aunque el modo de pensamiento encadenado es la base habitual para estos flujos.
- Vision, audio y otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: limitadas a ingles segun la model card, aunque el modelo base Qwen2.5 tiene cobertura multilingue que no se garantiza aqui.

## Casos de uso

- Asistente de razonamiento local y privado: desplegado con Ollama o llama.cpp en un equipo con una RTX 4090, el modelo resuelve problemas de logica y matematicas sin enviar datos a la nube. La cuantizacion i1-Q4_K_M (9,1 GB) es el punto de equilibrio recomendado por el autor.
- Generacion de codigo en entornos sin conectividad: con la cuantizacion Q6_K (12,2 GB) se obtiene la mayor fidelidad disponible en este repositorio, adecuada para autocompletado, explicacion de codigo y generacion de tests en maquinas aisladas.
- Investigacion sobre alineacion y robustez: la variante abliterated permite estudiar que comportamientos emergen cuando se elimina la direccion de rechazo, comparando respuestas contra el DeepSeek-R1-Distill-Qwen-14B original.
- Red teaming y evaluacion de seguridad: util para generar prompts adversarios y comprobar como responden otros modelos o filtros de contenido en un pipeline de moderacion.
- Analisis de documentos tecnicos largos: siempre que se fije una longitud de contexto adecuada, el modelo puede resumir informes, extraer requisitos y responder preguntas sobre el texto en un solo paso de inferencia.
- Prototipado rapido en equipos sin GPU dedicada: las cuantizaciones IQ2 e IQ3 (entre 4,0 y 8,0 GB) permiten ejecutar el modelo en portatiles con CPU moderna o GPUs de 8 GB, con la perdida de calidad que el propio autor advierte.
- Educacion y tutoria paso a paso: la salida con razonamiento explicito es util para generar explicaciones detalladas de ejercicios de matematicas o fisica, revisables por el estudiante.
- Generacion de datos sinteticos: puede emplearse para producir conjuntos de datos de razonamiento en ingles que despues se filtren y se usen para afinar modelos mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo original ni para las cuantizaciones. El unico dato de rendimiento aportado es un grafico externo de perplejidad comparando tipos de cuantizacion (enlazado en la seccion de enlaces), que no constituye un benchmark de capacidades. Cualquier cifra que se atribuya a esta conversion concreta seria una extrapolacion no verificada.

## Requisitos de hardware

Los tamanos siguientes son los de los ficheros publicados en el repositorio. La VRAM estimada anade un margen de 1 a 2 GB para buffers y cache KV con contextos cortos; el margen crece de forma aproximadamente lineal con la longitud de contexto.

| Cuantizacion | Tamano del fichero | VRAM estimada (contexto corto) | GPU de referencia |
|---|---|---|---|
| i1-IQ1_M | 4,0 GB | 5-6 GB | GTX 1660 6 GB, RTX 3050 8 GB |
| i1-IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M | 4,4-5,5 GB | 6-8 GB | RTX 3060 8 GB, RTX 4060 8 GB |
| i1-Q2_K_S / Q2_K / IQ3_XXS | 5,5-6,0 GB | 7-8 GB | RTX 3060 8 GB, RTX 2070 8 GB |
| i1-Q3_K_S / IQ3_M / Q3_K_M / Q3_K_L / IQ4_XS / IQ4_NL | 6,8-8,6 GB | 8-11 GB | RTX 3080 10 GB, RTX 4070 12 GB |
| i1-Q4_K_S / Q4_K_M | 8,7-9,1 GB | 10-12 GB | RTX 4070 Ti 12 GB, RTX 3090 24 GB |
| i1-Q5_K_S | 10,4 GB | 12-14 GB | RTX 4080 16 GB, RTX 4090 24 GB |
| i1-Q6_K | 12,2 GB | 14-16 GB | RTX 4090 24 GB, A100 40 GB, H100 |

- Cabe en GPU de consumo: si. Cualquier GPU con 12 GB o mas puede ejecutar la cuantizacion de 4 bits completa en VRAM; con 8 GB hay que recurrir a IQ3 o inferior, o a offloading parcial de capas a CPU.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI no consumen GGUF de forma nativa (vLLM tiene soporte experimental para algunos formatos GGUF, no garantizado aqui), por lo que para servir con esas herramientas habria que partir de los safetensors del modelo base abliterated.
- Latencia y throughput: no disponibles. Dependen por completo de la cuantizacion, del hardware y del numero de tokens de razonamiento generados, que en esta familia suele ser elevado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (i1-GGUF) | 14,77 B | no disponible | GGUF, 4,0-12,2 GB por cuant | MIT | Abliterado y cuantizado, 0 descargas, sin benchmarks |
| 3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated | 14,77 B | no disponible | safetensors | MIT | Modelo base directo, sin cuantizar; requiere ~28-30 GB en FP16 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,77 B | no disponible | safetensors | MIT | Version oficial alineada, con rechazos; referencia de calidad frente a la variante abliterada |
| Qwen/Qwen2.5-14B-Instruct | ~14,7 B | 32.768 tokens nativos, 131.072 con YaRN | safetensors, GGUF comunitarios | Apache 2.0 | Alternativa generalista sin modo de razonamiento largo explicito |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion: inherente a los modelos destilados de R1, especialmente en tareas de conocimiento factual y en respuestas largas con cadenas de razonamiento; el modo de pensamiento no garantiza la veracidad de las conclusiones.
- Efecto de la abliteracion: la supresion de la direccion de rechazo puede degradar capacidades generales y, sobre todo, eliminar barreras de seguridad. No se ha publicado ninguna evaluacion del dano causado.
- Degradacion por cuantizacion: el propio autor etiqueta IQ1_M como "mostly desperate", Q2_K_S como "very low quality" e IQ3_XXS como "lower quality". Para uso serio, el minimo razonable es IQ4_XS o Q4_K_M.
- Idioma: la model card declara unicamente ingles. El rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto: no confirmada en esta conversion. Conviene verificar el parametro real antes de disenar flujos con documentos largos, ya que las cuantizaciones de muy baja precision degradan especialmente el rendimiento en contextos extensos.
- Tool calling y agentes: no confirmados. Los modelos de la familia R1-Distill son propensos a mezclar razonamiento y llamadas a herramientas, lo que exige un parseo robusto si se integran en pipelines agenticos.
- Licencia: el repositorio declara MIT, coherente con la licencia de los modelos DeepSeek-R1-Distill, pero la cadena completa incluye Qwen2.5-14B (Apache 2.0) y una modificacion no oficial de un tercero. Para uso comercial conviene revisar cada eslabon de la cadena por cuenta propia.
- Ausencia de validacion: 0 descargas, 0 "likes" y ningun benchmark publicado. No hay evidencia de comunidad que respalde la calidad de estas cuantizaciones.
- Contenido generado: al tratarse de un modelo abliterado, las salidas pueden incluir material que los modelos alineados rechazarian. Cualquier despliegue en produccion necesita filtros propios y supervision humana.
- Repositorio pesado: 148,5 GB en total. Descargar solo la cuantizacion necesaria, no el repositorio completo.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated-i1-GGUF
- Modelo base directo (abliterated, safetensors): https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated
- Cuantizaciones estaticas (sin imatrix) del mismo modelo: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated-i1-GGUF
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated-i1-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated.imatrix.gguf
- Guia de uso de GGUF referenciada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo oficial de referencia: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente documentacion de soporte de Google Drive, sin relacion con el contenido de esta ficha.
