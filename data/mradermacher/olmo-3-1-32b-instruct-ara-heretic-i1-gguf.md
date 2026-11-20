# mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF

## Resumen
Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic, generadas por mradermacher mediante el metodo i1 (imatrix) para preservar la calidad en tamanos reducidos. El modelo subyacente parte de Olmo 3.1 32B Instruct de AllenAI, sobre el que se ha aplicado una tecnica de "abliteration" (eliminacion de direcciones de rechazo) para producir una variante "heretic"/"uncensored"/"decensored", es decir, con las capas de rechazo atenuadas o eliminadas. El resultado es un modelo de 32.233.522.176 parametros (32B) orientado a generacion conversacional sin las restricciones habituales de seguridad del modelo original, pensado para experimentacion e investigacion sobre alineamiento y comportamiento de modelos abliterados.

Este repositorio concreto no contiene pesos en safetensors ni el modelo completo, sino exclusivamente ficheros GGUF cuantizados (i1-IQ1_S hasta i1-Q6_K) y un fichero imatrix para generar cuantizaciones propias. Esta orientado a inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.). El repositorio ocupa 343,8 GB, reflejando la suma de todas las variantes de cuantizacion disponibles. La licencia declarada es Apache-2.0, heredada del modelo base, aunque las etiquetas incluyen tambien openrail++ de forma ambigua.

La relevancia de esta ficha radica en que documenta un caso tipico de la cadena de derivacion de modelos open source: modelo base (Olmo 3.1) -> variante abliterada (richardyoung) -> cuantizaciones GGUF (mradermacher). Es util para desarrolladores que quieran desplegar un 32B en hardware consumer y para investigadores que estudien el efecto de la abliteration sobre capacidades y sesgos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Olmo 3.1 32B, presumiblemente transformer decoder-only; no confirmado en la informacion proporcionada) |
| Parametros totales | 32.233.522.176 (32B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix y static quants en el repo hermano |
| Idiomas soportados | en (segun la model card; no disponibles para el resto) |
| Licencia | apache-2.0 (etiquetas adicionales openrail++ en la model card) |
| Formato de pesos | GGUF (safetensors no incluido en este repo; el modelo base si los tiene) |

## Arquitectura y entrenamiento
La arquitectura exacta del modelo base Olmo 3.1 32B no se detalla en la informacion proporcionada; Olmo es la familia de modelos abiertos de AllenAI, habitualmente transformer decoder-only entrenados desde cero con datos abiertos (Dolma, Dolci). La model card de este repo cita allenai/Dolci-Instruct-RL como dataset de referencia para la fase instruct/RL del modelo base, lo cual sugiere que el modelo subyacente ha pasado por un proceso de instruccion con reinforcement learning sobre datos abiertos. Sin embargo, no se aportan numeros de tokens de entrenamiento, composicion del dataset ni detalles de RLHF/DPO en la informacion disponible.

La innovacion tecnica relevante en esta cadena es la abliteration aplicada sobre Olmo 3.1 32B Instruct para obtener la variante "heretic". Este proceso identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las proyecta fuera, reduciendo la tendencia del modelo a rechazar peticiones. Posteriormente, mradermacher aplica cuantizacion con imatrix (i1), un metodo que usa estadisticas de activacion para calibrar los pesos cuantizados y mitigar la perdida de calidad respecto a cuantizaciones estaticas de tamano equivalente. Las cuantizaciones i1 suelen superar a las Q_K de tamano similar segun las notas del autor (por ejemplo, i1-IQ3_S "beats Q3_K*" e i1-IQ4_XS con 17,4 GB frente a i1-Q4_K_S con 18,5 GB).

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del modelo instruct base.
- Razonamiento y respuesta a instrucciones, con la salvedad de que la abliteration puede alterar el comportamiento en prompts sensibles.
- Capacidad multilingue limitada segun la model card: solo se declara ingles (en).
- Comportamiento "uncensored"/"decensored": menor tendencia a rechazar peticiones que el modelo original, orientado a experimentacion sobre alineamiento.
- Compatibilidad con endpoints y servidores de inferencia (tag endpoints_compatible) y libreria transformers en metadatos, aunque los pesos son GGUF y requieren llama.cpp o equivalente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Inferencia local de un 32B en hardware consumer: las cuantizaciones i1-Q4_K_M (19,6 GB) o i1-IQ4_XS (17,4 GB) permiten ejecutar el modelo en GPUs de 24 GB (RTX 3090/4090) con llama.cpp, algo inviable con el modelo en fp16 (unos 64 GB).
- Investigacion sobre abliteration y alineamiento: comparar respuestas de esta variante heretic frente al Olmo 3.1 32B Instruct original para medir cambios en tasas de rechazo, sesgos y calidad general.
- Despliegue en entornos con requisitos de VRAM ajustados: las cuantizaciones IQ2/IQ3 (8,9-14,6 GB) permiten servir el modelo en GPUs de 12-16 GB sacrificando calidad, util para prototipos y demos.
- Generacion de texto creativo y conversacional sin filtros de rechazo: util para guiones, ficcion o roleplay donde el modelo original rechazaria contenido sensible.
- Evaluacion de robustez y seguridad: usar la variante abliterada como caso de prueba adversario para estudiar como se degradan las salvaguardas tras la abliteration.
- Pipeline de cuantizacion reproducible: el fichero imatrix incluido permite generar cuantizaciones propias con llama.cpp imatrix, replicando el proceso del autor para otros tamanos o calibraciones.
- Prototipado de asistentes conversacionales en ingles: con cuantizaciones Q4/Q5 (18,5-23,0 GB) en una workstation con GPU de 24-48 GB, se obtiene un asistente instruct de 32B sin dependencia de APIs externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para este repositorio ni para la variante heretic. La model card solo incluye tamanos de fichero y notas cualitativas del autor sobre calidad relativa entre cuantizaciones (por ejemplo, i1-IQ3_S "beats Q3_K*", i1-Q2_K "IQ3_XXS probably better", i1-Q2_K_S "very low quality"). No se deben extrapolar cifras de benchmarks del Olmo 3.1 32B Instruct original a esta variante abliterada, ya que la abliteration puede alterar el rendimiento.

## Requisitos de hardware
- VRAM estimada para inferencia (segun tamanos de fichero GGUF):
  - i1-IQ1_S: 7,1 GB; i1-IQ1_M: 7,8 GB (calidad muy degradada, "for the desperate").
  - i1-IQ2_XXS a i1-IQ2_M: 8,9-11,1 GB.
  - i1-Q2_K_S a i1-IQ3_L: 11,3-17,0 GB.
  - i1-IQ4_XS a i1-Q4_1: 17,4-20,4 GB.
  - i1-Q5_K_S a i1-Q6_K: 22,3-26,5 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5; A100 40/80 GB o H100 para Q6_K y contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, 4080) para IQ2/IQ3.
- Cabe en GPU consumer: si, en RTX 3090/4090 con Q4_K_M (19,6 GB) o IQ4_XS (17,4 GB); en GPUs de 12 GB solo con IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con APIs estilo OpenAI mediante servidores GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del hardware, del tamano de cuantizacion y de la longitud de contexto; a mayor cuantizacion (menos GB), mayor velocidad y menor calidad.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF (este) | 32,2B | no disponible | apache-2.0 | GGUF (i1) | Variante abliterada cuantizada con imatrix; solo ingles declarado |
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32,2B | no disponible | no disponible | safetensors (presumiblemente) | Modelo base abliterado del que derivan estas cuantizaciones |
| mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF | 32,2B | no disponible | apache-2.0 | GGUF (static) | Cuantizaciones estaticas del mismo modelo base, alternativa a las i1 |
| Olmo 3.1 32B Instruct (AllenAI) | 32B | no disponible | no disponible | safetensors | Modelo original alineado, sin abliteration; referencia de comparacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias
- La abliteration elimina o atenua las capas de rechazo: el modelo puede generar contenido que el original rechazaria, incluyendo material sensible, ofensivo o inseguro. No apto para produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion y de respuestas inseguras al haberse alterado el comportamiento de alineamiento; no hay benchmarks publicados que verifiquen la calidad tras la abliteration.
- Solo se declara soporte de ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificar el valor real del modelo base.
- Las cuantizaciones IQ1/IQ2 tienen calidad muy degradada segun el propio autor ("for the desperate", "very low quality"); no usar en produccion.
- Licencia: apache-2.0 declarada, pero la model card tambien incluye openrail++ entre las etiquetas; conviene verificar la licencia efectiva del modelo base antes de uso comercial.
- El repositorio contiene unicamente GGUF; no incluye safetensors ni tokenizer completo en formato HF, por lo que no es utilizable directamente con transformers sin convertir.
- Uso etico y legal: la variante heretic no exime al desplegador de responsabilidad sobre el contenido generado; conviene aplicar moderacion externa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF
- Dataset de referencia citado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
