# mradermacher/Ursa_Minor0.4-GGUF

## Resumen

Ursa_Minor0.4-GGUF es la distribucion en formato GGUF del modelo Sculptor-AI/Ursa_Minor0.4, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo base es un transformer de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) orientado a conversacion y generacion de texto en ingles. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precision completa.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo con 11 variantes de cuantizacion que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), cubriendo desde GPUs modestas hasta estaciones de trabajo. El repositorio ocupa 68,1 GB en total e incluye todos los ficheros cuantizados. La model card original no proporciona informacion sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que muchos detalles tecnicos quedan como no disponibles.

Se trata de un modelo de nicho con muy poca traccion en la comunidad (3 descargas, 0 likes en el momento de la consulta), lo que sugiere que debe evaluarse con cautela antes de usarlo en produccion. La licencia no esta especificada ni en el repo GGUF ni en la informacion disponible del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica (no es MoE, segun datos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Sculptor-AI/Ursa_Minor0.4. Por el numero de parametros (~7,6 B) y la nomenclatura "Minor", se trata probablemente de un transformer decoder-only de escala similar a Mistral 7B o Llama 7B, pero esto no esta confirmado en la informacion proporcionada. Tampoco se especifican el numero de capas, dimensiones ocultas, cabezas de atencion ni el tipo de activacion.

Respecto al entrenamiento, no hay datos publicados sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card del cuantizador se limita a indicar que son "static quants" del modelo base, sin informacion adicional sobre el proceso de cuantizacion mas alla de la tabla de ficheros. No se han generado cuantizaciones con imatrix (weighted quants) segun indica el autor, lo que sugiere que la calidad de las cuantizaciones de baja precision puede ser inferior a la de versiones con importancia matricial.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (tag "endpoints_compatible").
- Ejecucion local mediante llama.cpp y herramientas que consuman GGUF.
- Soporte de cuantizacion desde 2 hasta 16 bits por peso, permitiendo ajustar el equilibrio calidad/memoria.
- Capacidades multilingues limitadas al ingles, segun los metadatos disponibles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la variante Q4_K_M (4,8 GB) se puede desplegar un chatbot en una GPU de consumo de 8 GB VRAM, ideal para pruebas de concepto sin coste de API.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre una misma tarea.
- Despliegue en entornos con recursos limitados: la variante Q2_K (3,1 GB) cabe en GPUs de 4 GB o en CPU con RAM modesta, util para demos en portatiles o dispositivos edge.
- Fine-tuning posterior sobre GGUF: aunque no es el flujo habitual, herramientas como llama.cpp permiten adaptar el modelo con LoRA sobre cuantizaciones de 4-8 bits para dominios especificos en ingles.
- Investigacion sobre degradacion por cuantizacion: util para estudios academicos que comparen Q2_K frente a Q8_0 en tareas de generacion abierta.
- Integracion en pipelines de inferencia offline: al ser un modelo pequeno (~7,6 B) y en formato GGUF, se puede embeber en aplicaciones de escritorio o servidores sin GPU dedicada mediante llama.cpp con backend CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~3,1 GB; Q4_K_M ~4,8 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB o superior para Q5-Q8; RTX 4090 o A100 para f16; GPUs de 8 GB (RTX 3070, RTX 4060 Ti) suficientes para Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4 o Q5. La variante Q2_K puede ejecutarse incluso en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), text-generation-webui, LM Studio, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se requeriria el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de ~7,6 B en Q4_K_M sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ursa_Minor0.4-GGUF | ~7,6 B | No disponible | No disponible | GGUF | Hugging Face (mradermacher) |
| Mistral 7B Instruct (GGUF) | 7,2 B | 32k (v0.2/v0.3) | Apache 2.0 | GGUF, safetensors | Amplia, multiples cuantizadores |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 128k | Llama 3.1 Community License | GGUF, safetensors | Amplia, oficial y comunitaria |
| Qwen2.5 7B Instruct (GGUF) | 7,6 B | 128k | Apache 2.0 (mayoria variantes) | GGUF, safetensors | Amplia, oficial y comunitaria |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de Ursa_Minor0.4 para comparar benchmarks. Frente a las alternativas, Ursa_Minor0.4 carece de licencia declarada, contexto documentado y traccion comunitaria, lo que supone una desventaja clara para uso en produccion.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Idiomas: solo ingles declarado; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas establecidas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de alineacion (RLHF/DPO) no se puede evaluar su mitigacion.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- Contexto desconocido: la ausencia de longitud de contexto documentada impide planificar casos de uso con ventanas largas.
- Cuantizaciones sin imatrix: el autor indica que no hay weighted quants, por lo que las variantes de baja precision (Q2_K, Q3_K) pueden degradar la calidad mas de lo habitual.
- Traccion minima: 3 descargas y 0 likes sugieren poca validacion por parte de la comunidad; usar con cautela.
- Fecha de actualizacion futura (2026-11-22): el metadato de actualizacion es posterior a la fecha actual, lo que puede indicar un error de registro o una practica de mantenimiento automatico; verificar la integridad de los ficheros antes de descargarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ursa_Minor0.4-GGUF
- Modelo base: https://huggingface.co/Sculptor-AI/Ursa_Minor0.4
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Ursa_Minor0.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
