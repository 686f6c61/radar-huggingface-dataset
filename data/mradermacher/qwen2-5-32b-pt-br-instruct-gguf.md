# mradermacher/qwen2.5-32B-PT-BR-Instruct-GGUF

## Resumen

`mradermacher/qwen2.5-32B-PT-BR-Instruct-GGUF` es un conjunto de cuantizaciones estáticas en formato GGUF del modelo `amadeusai/Amadeus-Verbo-BI-Qwen-2.5-32B-PT-BR-Instruct-Experimental`, un ajuste fino orientado a portugués de Brasil construido sobre Qwen2.5-32B-Instruct. El trabajo de cuantización lo firma mradermacher (nethype GmbH), un publicador habitual de quants GGUF en HuggingFace, y no el autor original del modelo. El resultado es un artefacto listo para inferencia local con llama.cpp, Ollama, LM Studio o KoboldCpp, con 32.763.876.352 parámetros en pesos y 11 variantes de cuantización que van de 12,4 GB (Q2_K) a 34,9 GB (Q8_0).

El interés práctico del modelo está en la combinación de tamano y idioma: un transformer denso de ~32,8 B parámetros con capacidades de instrucción heredadas de Qwen2.5, pero con el ajuste lingüístico orientado al portugués brasileño, un idioma con menos oferta de modelos abiertos de gran tamano que el inglés o el castellano. Al estar publicado como GGUF, se puede desplegar en hardware de gama alta de consumo (una RTX 4090 con cuantización Q4) o en servidores con dos GPU de 24 GB.

La relevancia es acotada pero clara: es una de las pocas rutas para ejecutar un modelo de 32 B especializado en PT-BR en infraestructura propia, sin depender de APIs. Como contrapartida, la model card es mínima (no hay detalles de dataset, entrenamiento ni evaluación), el modelo base se etiqueta como "experimental" y no se han publicado resultados de benchmarks, por lo que cualquier evaluacion de calidad debe hacerse por cuenta del adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivada de Qwen2.5-32B-Instruct; la model card del quant no detalla la arquitectura) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct declara 32.768 tokens nativos y 131.072 con escalado RoPE tipo YaRN; no confirmado para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (solo estaticas; no hay quants ponderados/imatrix de mradermacher) |
| Idiomas soportados | `pt` (portugues, variante de Brasil por el nombre del modelo base) |
| Licencia | Apache 2.0 (el campo `license_link` apunta a la licencia de Qwen2.5-32B-Instruct) |
| Formato de pesos | GGUF (los quants de este repo); el modelo base se distribuye para `transformers` |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el proceso de entrenamiento del modelo base `Amadeus-Verbo-BI-Qwen-2.5-32B-PT-BR-Instruct-Experimental`: la model card del repositorio de cuantizacion solo indica que se trata de "static quants of" ese modelo, sin detallar numero de tokens, composicion del corpus, ni si hubo fases de SFT, DPO o RLHF. Por herencia, la arquitectura subyacente corresponde a la familia Qwen2.5 (transformer decoder-only denso con atención de consultas agrupadas, SwiGLU y RoPE), con 32,76 B de parametros, pero conviene tratar este dato como inferencia a partir del modelo base y no como especificacion verificada del ajuste.

El trabajo verificable de este repositorio es la cuantizacion: mradermacher aplica cuantizacion estatica de los tensores de salida (`output_tensor_quantised: 1`, `quantize_version: 2`) y publica la matriz completa de variantes K-quant e I-quant. La model card advierte explicitamente de que no se han generado quants con importancia matrix (imatrix) y de que, si no aparecen en una semana, probablemente no esten planificados; el autor remite a abrir una discusion en la comunidad para solicitarlos. Esto implica que en el rango de 2 a 4 bits los quants IQ disponibles (solo IQ4_XS) no incorporan la mejora de calidad que suele asociarse a los quants imatrix.

## Capacidades

- Generacion de texto e instrucciones en portugués brasileño, con el estilo conversacional y el formato de chat heredados de Qwen2.5-32B-Instruct.
- Razonamiento multi-paso y resolución de problemas de complejidad media, limitado por la calidad no verificada del ajuste fino.
- Generacion y explicacion de codigo, presumiblemente conservada del modelo base, aunque sin garantias de que el ajuste en PT-BR no haya degradado este comportamiento.
- Resumen y reescritura de documentos en portugués, incluyendo registro formal e informal.
- Soporte de tool calling / function calling: el modelo base Qwen2.5 lo soporta, pero no se confirma que el ajuste `Amadeus-Verbo-BI` lo mantenga; requiere validacion propia.
- Capacidades multilingües limitadas en la practica: el tag de idioma del repositorio es unicamente `pt`, y el ajuste puede haber reducido el rendimiento en otros idiomas respecto al Qwen2.5 original.
- Sin vision, sin audio y sin modo "thinking" explicito: el repositorio no declara ninguna de estas capacidades.

## Casos de uso

- **Atencion al cliente en portugués brasileño**: despliegue self-hosted de un asistente multi-turno para soporte de nivel 1, con el modelo servido en una o dos GPU y con un contexto que en la practica vendra limitado por la VRAM disponible (a 32k tokens, la cache KV en fp16 ronda los 8 GB adicionales).
- **Generacion de contenido de marketing para el mercado brasileño**: redaccion de descripciones de producto, correos y publicaciones en redes con registro local, aprovechando el ajuste especifico en PT-BR frente a usar el Qwen2.5 base y pedir el idioma en el prompt.
- **Procesamiento de documentos administrativos y juridicos brasileños**: extraccion y resumen de contratos, normativas o informes mediante RAG; el modelo puede combinar contexto largo con instrucciones de formato estricto, aunque requiere verificacion humana por riesgo de alucinacion en cifras y referencias normativas.
- **Generacion de codigo con documentacion en portugués**: escribir comentarios, docstrings y mensajes de error en PT-BR en un pipeline de CI/CD, manteniendo el codigo en ingles; util para equipos brasileños que quieren reducir la barrera de idioma en revisiones.
- **Traduccion y localizacion ES/EN a PT-BR**: a pesar del foco monoidioma, la base Qwen2.5 conserva cierta competencia en otros idiomas; conviene usarlo como motor de localizacion con un paso de revision humana, y no como traductor universal.
- **Clasificacion y extraccion de datos estructurados en portugues**: convertir correos, tickets o formularios en JSON con un esquema fijo, ejecutado en lote sobre CPU+GPU o enteramente en CPU con cuantizaciones Q4.
- **Asistente interno sobre documentacion corporativa**: desplegado on-premise para evitar enviar datos a APIs externas, con la ventaja de que el modelo es Apache 2.0 y no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del quant ni la del modelo base accesible en la busqueda incluyen cifras de MMLU, HumanEval, GSM8K ni evaluaciones en portugués (por ejemplo, Poeta, ASSIN o ENEM). Tampoco se han publicado mediciones de throughput o latencia para las distintas cuantizaciones.

## Requisitos de hardware

- **VRAM estimada (solo pesos)**: 12,4 GB (Q2_K), 16,0 GB (Q3_K_M), 18,9 GB (Q4_K_S), 20,0 GB (Q4_K_M), 23,4 GB (Q5_K_M), 27,0 GB (Q6_K), 34,9 GB (Q8_0).
- **Cache KV adicional**: para la arquitectura de 32 B de la familia Qwen2.5, una estimacion de ~256 KB por token en fp16 implica aproximadamente 2 GB a 8k tokens y 8 GB a 32k tokens; puede reducirse a la mitad con cache KV en q8_0. La estimacion es propia y no esta confirmada por el autor.
- **GPU de consumo**: una RTX 4090 o RTX 3090 (24 GB) permite Q4_K_S/Q4_K_M con contexto corto-medio; Q5_K_M queda al limite y exige offload parcial de capas a RAM. Q6_K y Q8_0 no caben.
- **GPU profesional**: una A100 40 GB o H100 80 GB permite Q8_0 con contexto largo; una A100 80 GB o un nodo con dos GPU de 48 GB permiten Q8_0 a contexto completo con margen.
- **Multi-GPU de consumo**: dos RTX 3090/4090 (48 GB) permiten Q6_K o Q8_0 con contexto extendido.
- **CPU y memoria unificada**: con 64 GB de RAM se puede ejecutar Q4_K_M en CPU (llama.cpp) a velocidades bajas; los Apple Silicon con memoria unificada de 64 GB o 128 GB son una opcion practica para Q5/Q6.
- **Opciones de despliegue**: llama.cpp, Ollama (requiere crear un Modelfile a partir del GGUF), LM Studio, KoboldCpp, Jan y servidores GGUF de vLLM o TGI (soporte experimental para GGUF). Para el modelo base en safetensors, vLLM y TGI son las opciones directas.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`qwen2.5-32B-PT-BR-Instruct-GGUF`) | 32,8 B | No disponible (base Qwen2.5: 32.768 nativos) | `pt` | Apache 2.0 | 11 quants GGUF, 62 descargas, 0 likes |
| `mradermacher/Qwen2.5-32B-Instruct-GGUF` | 32,8 B | 32.768 nativos (131.072 con YaRN, segun Qwen) | Multilingue (incluye pt) | Apache 2.0 | Quants GGUF equivalentes |
| `mradermacher/AV-FI-Qwen2.5-32B-PT-BR-Instruct-GGUF` | 32,8 B | No disponible | `pt` | Apache 2.0 | Otro ajuste PT-BR de la misma familia, tambien cuantizado por mradermacher |
| Qwen2.5-72B-Instruct | 72,7 B | 32.768 nativos (131.072 con YaRN) | Multilingue | Licencia Qwen (no Apache) | Pesos safetensors y GGUF de terceros |

La comparacion relevante es contra el Qwen2.5-32B-Instruct sin ajustar: este modelo intercambia cobertura multilingue por una especializacion en PT-BR de calidad no documentada. Frente al Qwen2.5-72B-Instruct, el 32 B ofrece la mitad de parametros pero licencia Apache 2.0 y la posibilidad de correr en dos GPU de 24 GB. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- **Ausencia total de evaluacion**: no hay benchmarks, ni en la model card del quant ni en la del modelo base accesible. Cualquier afirmacion sobre su calidad en PT-BR es especulativa.
- **Modelo base marcado como "experimental"**: el nombre `Amadeus-Verbo-BI-Qwen-2.5-32B-PT-BR-Instruct-Experimental` sugiere un ajuste no consolidado; no se documentan datos de entrenamiento, hiperparametros ni proceso de alineacion.
- **Riesgo de alucinacion**: al ser un ajuste de instruccion sin evaluacion publicada, la tasa de fabricacion de hechos es desconocida; es especialmente arriesgado en dominios regulados (juridico, sanitario, financiero) del mercado brasileño.
- **Restriccion idiomatica**: el tag de idioma es solo `pt`. El rendimiento en castellano, ingles u otros idiomas puede haberse degradado respecto al Qwen2.5 original por olvido catastrofico durante el ajuste.
- **Licencia heredada**: el repositorio se declara Apache 2.0 y enlaza a la licencia de Qwen2.5-32B-Instruct. Conviene verificar la cadena completa de licencias (Qwen base + ajuste amadeusai + cuantizacion) antes de un uso comercial; el ajuste intermedio no documenta su propia licencia en la informacion disponible.
- **Cuantizaciones bajas degradadas**: Q2_K y Q3_K_S/M/L no se recomiendan para produccion; la propia model card marca Q3_K_M como "lower quality".
- **Sin quants imatrix**: no hay variantes ponderadas, lo que penaliza la relacion calidad/tamano en el rango de 2 a 4 bits frente a otros modelos del mismo autor que si las ofrecen.
- **Tool calling no garantizado**: aunque Qwen2.5 soporta function calling, el ajuste en PT-BR puede haber alterado el formato; hay que validarlo con pruebas propias antes de integrarlo en agentes.
- **Fecha de actualizacion anomala**: el repositorio figura actualizado el 2026-10-24, posterior a la fecha actual en muchos entornos; conviene comprobar la integridad de los archivos al descargar.
- **Traza de auditoria incompleta**: el publicador es un cuantizador, no el autor del modelo; no hay garantias sobre la reproducibilidad del ajuste original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen2.5-32B-PT-BR-Instruct-GGUF
- Modelo base: https://huggingface.co/amadeusai/Amadeus-Verbo-BI-Qwen-2.5-32B-PT-BR-Instruct-Experimental
- Pagina de descarga del autor para este modelo: https://hf.tst.eu/model#qwen2.5-32B-PT-BR-Instruct-GGUF
- Licencia referenciada: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Qwen2.5-32B-Instruct cuantizado por el mismo autor: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-GGUF
- Variante PT-BR alternativa del mismo autor: https://huggingface.co/mradermacher/AV-FI-Qwen2.5-32B-PT-BR-Instruct-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
- Ficha en Socket: https://socket.dev/huggingface/package/mradermacher/qwen2.5-32b-pt-br-instruct-gguf
- Ficha en AlphaNeural: https://alphaneural.io/assets/mradermacher/qwen2.5-32B-PT-BR-Instruct-GGUF
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/av-bi-qwen2.5-32b-pt-br-instruct-gguf
