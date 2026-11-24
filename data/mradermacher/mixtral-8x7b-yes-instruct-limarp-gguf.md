# mradermacher/Mixtral-8x7B-Yes-Instruct-LimaRP-GGUF

## Resumen

Mixtral-8x7B-Yes-Instruct-LimaRP-GGUF es una cuantizacion estatica en formato GGUF del modelo antisoc-qa-assoc/Mixtral-8x7B-Yes-Instruct-LimaRP, publicada por mradermacher, un conocido generador de cuantizaciones para llama.cpp. El modelo subyacente parte de la arquitectura Mixtral de Mistral AI (mezcla de expertos con 8 expertos y 2 activos por token) y ha sido afinado sobre el dataset lemonilia/LimaRP, un corpus orientado a roleplay y conversacion de personajes. El resultado es un modelo de 46.702.792.704 parametros totales (unos 46,7 mil millones) especializado en dialogos conversacionales en ingles.

La relevancia de esta publicacion es practica: el repositorio ofrece once variantes de cuantizacion entre Q2_K y Q8_0, lo que permite ejecutar un modelo de casi 47 mil millones de parametros en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El repositorio ocupa 318,5 GB porque incluye todas las variantes, aunque el usuario solo necesita descargar el fichero de la cuantizacion elegida, con tamanos que van de 17,4 GB (Q2_K) a 49,7 GB (Q8_0).

Se trata, por tanto, de un modelo de nicho: no compite en benchmarks de razonamiento general, sino que esta orientado a generacion creativa, roleplay e interaccion conversacional sostenida en ingles. La licencia figura como "other", heredada del modelo base, por lo que conviene revisar los terminos originales antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, base Mixtral-8x7B |
| Parametros totales | 46.702.792.704 (aproximadamente 46,7 mil millones) |
| Parametros activos | no disponible (la arquitectura Mixtral-8x7B activa 2 de 8 expertos por token, pero el dato exacto no se detalla en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones con imatrix en el repositorio i1-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en formato transformers |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint antisoc-qa-assoc/Mixtral-8x7B-Yes-Instruct-LimaRP, que a su vez deriva de la familia Mixtral-8x7B de Mistral AI. Mixtral emplea una arquitectura de mezcla de expertos con ocho expertos por capa y enrutamiento por token hacia los dos expertos mas probables, lo que permite un coste de computo por token comparable al de un modelo denso mucho menor mientras se mantiene una capacidad total de aproximadamente 46,7 mil millones de parametros. El modelo base ha sido afinado sobre el dataset lemonilia/LimaRP, un corpus de conversaciones orientado a roleplay y narrativa interactiva, lo que explica su especializacion en dialogos de personajes.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), generada con llama.cpp, y el autor indica que las variantes con imatrix (repositorio i1-GGUF) suelen ofrecer mejor calidad que las estaticas de tamano equivalente.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno y mantenimiento de personajes.
- Roleplay y narrativa interactiva, gracias al ajuste sobre el dataset LimaRP.
- Generacion creativa de ficcion y continuacion de historias.
- Conversacion instructiva general, heredada del ajuste "Yes-Instruct" del modelo base.
- Capacidades multilingues limitadas: el modelo esta etiquetado unicamente para ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y compania conversacional: el ajuste sobre LimaRP permite mantener personajes coherentes a lo largo de conversaciones extensas, con un tono narrativo adecuado para aplicaciones de entretenimiento y chatbots de personajes.
- Escritura creativa asistida: el modelo puede continuar relatos, generar dialogos entre personajes y proponer tramas, aprovechando su especializacion en narrativa interactiva.
- Prototipado de chatbots de ficcion: util para desarrolladores que quieran experimentar con agentes conversacionales tematicos sin depender de APIs externas, ejecutando el modelo en local con llama.cpp u Ollama.
- Investigacion sobre ajuste fino y cuantizacion: sirve como caso de estudio de como un modelo Mixtral afinado para un dominio concreto se comporta bajo distintas cuantizaciones (de Q2_K a Q8_0), permitiendo medir la degradacion de calidad.
- Despliegue en hardware de consumo: las variantes Q4_K_S (26,8 GB) y Q4_K_M (28,5 GB) permiten ejecutar el modelo en equipos con suficiente RAM o VRAM unificada, algo imposible con el checkpoint original en precision completa.
- Generacion de dialogos para videojuegos y mods: integrable en motores que consuman GGUF mediante llama.cpp, para NPC con conversacion libre en ingles.
- Experimentacion con tecnicas de cuantizacion: comparar las variantes estaticas con las de imatrix del repositorio i1-GGUF para evaluar el impacto en perplejidad y calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K 17,4 GB; Q3_K_S 20,5 GB; Q3_K_M 22,6 GB; Q3_K_L 24,3 GB; IQ4_XS 25,5 GB; Q4_K_S 26,8 GB; Q4_K_M 28,5 GB; Q5_K_S 32,3 GB; Q5_K_M 33,3 GB; Q6_K 38,5 GB; Q8_0 49,7 GB.
- GPU recomendadas: para las cuantizaciones mayores (Q6_K, Q8_0) se necesita una GPU profesional con 48 GB o mas (A6000, A100 80 GB, H100); las variantes Q4 pueden ejecutarse en configuraciones multi-GPU de consumo o en equipos con memoria unificada amplia.
- GPU de consumo: el modelo completo no cabe en una unica RTX 4090 (24 GB). Las variantes Q2_K a Q4_K_M pueden caber parcialmente en VRAM con offload a RAM del sistema, a costa de latencia; en una RTX 4090 conviene usar Q2_K o Q3_K_S con offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; el modelo base es compatible con transformers y endpoints_compatible segun las etiquetas del repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Mixtral-8x7B-Yes-Instruct-LimaRP-GGUF (este) | 46,7 mil millones (MoE) | no disponible | Roleplay y dialogo en ingles | other | GGUF |
| Mixtral-8x7B-Instruct-v0.1 | 46,7 mil millones (MoE) | 32.768 tokens (segun documentacion publica de Mistral) | Instrucciones generales | Apache 2.0 | safetensors, GGUF |
| Llama-2-70B-Chat | 70 mil millones (denso) | 4.096 tokens | Dialogo general | Llama 2 Community License | safetensors, GGUF |
| Yi-34B-Chat | 34 mil millones (denso) | 4.096 tokens (200K en variante extendida) | Dialogo general | Apache 2.0 (con condiciones) | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria; los datos de contexto y licencia de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada para este modelo. Este checkpoint se distingue por su especializacion en roleplay y por la disponibilidad de cuantizaciones GGUF listas para usar, pero carece de benchmarks publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especializado en roleplay y conversacion: su rendimiento en tareas de razonamiento, codigo o matematicas no esta documentado y probablemente sea inferior al de modelos de instrucciones generales.
- Idioma limitado al ingles; no se garantiza un comportamiento adecuado en castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en contextos narrativos donde el modelo prioriza la coherencia del personaje sobre la veracidad.
- Sesgos conocidos: no disponible en la informacion proporcionada; al derivar de Mixtral y de un corpus de roleplay, puede reproducir sesgos presentes en los datos de ajuste.
- Licencia "other": es imprescindible revisar los terminos del modelo base (antisoc-qa-assoc/Mixtral-8x7B-Yes-Instruct-LimaRP) y de Mistral AI antes de un uso comercial.
- El repositorio ocupa 318,5 GB en total; conviene descargar unicamente el fichero de la cuantizacion deseada.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre tamano y calidad, y sugiere las variantes imatrix del repositorio i1-GGUF como alternativa de mayor calidad.
- No se dispone de informacion sobre la longitud de contexto efectiva del modelo afinado, lo que limita las garantias en conversaciones muy largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mixtral-8x7B-Yes-Instruct-LimaRP-GGUF
- Modelo base: https://huggingface.co/antisoc-qa-assoc/Mixtral-8x7B-Yes-Instruct-LimaRP
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Mixtral-8x7B-Yes-Instruct-LimaRP-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Mixtral-8x7B-Yes-Instruct-LimaRP-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/lemonilia/LimaRP
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
