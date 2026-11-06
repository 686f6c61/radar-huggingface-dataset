# mradermacher/ThoxMini-125M-role-GGUF

## Resumen

ThoxMini-125M-role es un modelo de lenguaje de muy pequeno tamano (123,6 millones de parametros) desarrollado por Thox-ai y publicado originalmente en formato Transformers. Esta ficha corresponde a la version cuantizada en GGUF elaborada por mradermacher, un conocido publicador de cuantizaciones para el ecosistema llama.cpp/Ollama. El modelo esta disenado explicitamente para despliegue en dispositivo ("on-device", "edge", "local-first"), lo que lo situa en la categoria de modelos ultraligeros pensados para ejecutarse en hardware muy modesto.

La relevancia de esta publicacion es practica: el autor original distribuye pesos en safetensors, mientras que esta variante ofrece hasta doce cuantizaciones GGUF distintas (desde Q2_K hasta f16), lo que permite elegir el equilibrio entre tamano y calidad segun el hardware disponible. Con un repositorio de 1,2 GB y ficheros individuales que rondan los 0,2 GB en la mayoria de cuantizaciones, el modelo cabe holgadamente en cualquier equipo moderno, incluidos telefonos y placas SBC.

No obstante, la informacion publica es extremadamente limitada: la model card se centra casi exclusivamente en el proceso de cuantizacion y no documenta arquitectura interna, datos de entrenamiento, contexto ni resultados de evaluacion. Cualquier evaluacion rigurosa del modelo requiere consultar la ficha del modelo base, que tampoco esta detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 123.587.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Thox-ai/ThoxMini-125M-role. Por el nombre y el tamano (125M parametros) se enmarca en la familia de modelos ultraligeros tipo GPT, pero la model card no confirma si se trata de un transformer decoder-only clasico, ni detalla el numero de capas, dimensiones ocultas, mecanismo de atencion o funcion de activacion. Tampoco se documenta la tokenizacion ni el vocabulario.

Respecto al entrenamiento, no hay datos publicados sobre el volumen de tokens, la composicion del corpus, la posible aplicacion de RLHF/DPO o tecnicas de alineacion, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion tecnica concreta disponible se refiere al proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. El sufijo "role" en el nombre sugiere un ajuste orientado a roleplay o adopcion de personajes, pero esto no esta confirmado en la documentacion.

## Capacidades

- Generacion de texto en ingles: capacidad basica de modelado de lenguaje propia de un modelo de 125M parametros.
- Ajuste orientado a rol: el sufijo "role" apunta a un uso para conversacion con personajes o roleplay, aunque no hay documentacion que lo confirme.
- Despliegue en dispositivo: etiquetas explicitas "on-device", "edge", "local-first", "ollama", lo que indica compatibilidad con entornos de inferencia local.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con APIs tipo OpenAI en herramientas de inferencia.
- Tool calling / function calling: no disponible (no documentado).
- Razonamiento multi-paso y agentes: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: gracias a su tamano (0,2 GB en Q4_K_M) se puede cargar en Ollama o llama.cpp en segundos y validar flujos de conversacion sin coste de API, aunque la calidad sera limitada por el reducido numero de parametros.
- Roleplay y generacion creativa ligera en dispositivos de gama baja: el sufijo "role" y el enfoque local-first lo hacen adecuado para experimentar con personajes en un portatil o incluso en una Raspberry Pi, siempre que se acepten respuestas cortas y simples.
- Educacion y demostraciones de IA: util para explicar el funcionamiento de modelos de lenguaje y del pipeline de cuantizacion GGUF en cursos o talleres, ya que el modelo completo cabe en un pendrive.
- Filtrado y clasificacion de texto simple en el edge: tareas de etiquetado, deteccion de intenciones o generacion de respuestas plantilla en entornos sin conectividad, donde el coste energetico y la latencia importan mas que la precision.
- Pruebas de infraestructura de inferencia: sirve como modelo de referencia para validar despliegues de vLLM, llama.cpp, Ollama o TGI antes de escalar a modelos mayores, gracias a su rapida carga y bajo consumo de VRAM.
- Generacion de texto auxiliar en aplicaciones moviles: autocompletado, resumenes muy breves o respuestas sugeridas dentro de una app, ejecutando el modelo en el propio dispositivo para preservar la privacidad de los datos del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB para cuantizaciones Q2_K a Q5_K_M, 0,2 GB para Q6_K y Q8_0 (redondeado en la tabla del autor), y 0,3 GB para f16. En la practica, la mayoria de cuantizaciones ocupan menos de 250 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo esta pensado para ejecucion en CPU. Funciona en iGPU integradas, Apple Silicon y GPUs de gama baja.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GTX 1050, RTX 3050, RX 6400 e incluso telefonos moviles modernos mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta "ollama"), y cualquier runtime compatible con GGUF. El modelo base puede ejecutarse con Transformers. La etiqueta "endpoints_compatible" sugiere soporte en servidores de inferencia con API compatible con OpenAI.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia muy baja en CPU y throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxMini-125M-role (esta ficha) | 123,6M | no disponible | Apache 2.0 | GGUF, safetensors | Enfocado a edge y roleplay |
| SmolLM-135M (Hugging Face) | 135M | 2.048 tokens (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Modelo ultraligero con benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 tokens (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, mejor calidad general |
| TinyLlama-1.1B | 1.100M | 2.048 tokens (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Referencia en la categoria de modelos pequenos |

Nota: los datos de los modelos comparables provienen de sus fichas publicas y no de la informacion proporcionada para este modelo; se incluyen como referencia de categoria. No hay datos de rendimiento de ThoxMini-125M-role que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas de tamano similar.
- Documentacion muy escasa: la model card del GGUF solo describe el proceso de cuantizacion; la del modelo base no esta detallada en la informacion disponible.
- Modelo de 125M parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en conversaciones largas; alta probabilidad de alucinaciones y respuestas genericas.
- Solo ingles: no hay soporte documentado de castellano ni otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones multi-turno extensas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar la licencia del modelo base y citar adecuadamente.
- Sin garantias de soporte: el publicador de las cuantizaciones es un tercero (mradermacher), no el autor original del modelo.
- Riesgo de sesgos: no documentados, pero inherentes a cualquier modelo entrenado con corpus web no filtrado explicitamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThoxMini-125M-role-GGUF
- Modelo base: https://huggingface.co/Thox-ai/ThoxMini-125M-role
- Pagina de descargas del publicador: https://hf.tst.eu/model#ThoxMini-125M-role-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion (mradermacher): https://huggingface.co/mradermacher/model_requests
