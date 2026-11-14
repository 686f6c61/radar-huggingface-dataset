# mradermacher/bluemoonrp-13b-GGUF

## Resumen

bluemoonrp-13b-GGUF es la distribucion en formato GGUF del modelo reeducator/bluemoonrp-13b, un modelo de lenguaje de 13.015.864.320 parametros afinado para roleplay en ingles. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que genera versiones estaticas de modelos existentes para su uso con llama.cpp y derivados. El modelo base fue entrenado sobre el dataset gozfarb/bluemoon_roleplay_300k_vicuna, un corpus de 300.000 ejemplos de roleplay en formato Vicuna.

La relevancia de esta ficha es practica: el repositorio original en formato transformers no es directamente desplegable en hardware de consumo, mientras que estas cuantizaciones GGUF permiten ejecutar un modelo de 13.000 millones de parametros en GPUs consumer e incluso en CPU. El paquete ofrece once variantes de cuantizacion entre Q2_K (5,0 GB) y Q8_0 (13,9 GB), lo que cubre desde entornos con poca VRAM hasta configuraciones que priorizan calidad.

Se trata de un modelo especializado, no de proposito general: su entrenamiento esta orientado a conversaciones de roleplay y ficcion interactiva en ingles. No hay informacion publica sobre la longitud de contexto, la licencia del modelo base ni resultados de benchmarks, lo que limita su uso en produccion sin una evaluacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia del modelo base; detalles no disponibles) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base reeducator/bluemoonrp-13b es un transformer de 13.000 millones de parametros afinado sobre gozfarb/bluemoon_roleplay_300k_vicuna, un dataset de 300.000 muestras de roleplay formateadas segun la plantilla de conversacion de Vicuna. La informacion disponible no especifica la arquitectura exacta del modelo original (si proviene de Llama 2, Llama o una variante similar), el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta la longitud de contexto nativa.

La contribucion tecnica de este repositorio es la cuantizacion. mradermacher genera cuantizaciones estaticas (no imatrix) con el conversor de llama.cpp, partiendo de los pesos en formato Hugging Face. El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (bluemoonrp-13b-i1-GGUF). Las variantes Q4_K_S y Q4_K_M se marcan como "fast, recommended", y Q6_K como "very good quality". No se documentan innovaciones arquitectonicas propias, ya que el trabajo es exclusivamente de conversion y empaquetado.

## Capacidades

- Generacion de texto en ingles con estilo conversacional y narrativo, orientada a roleplay y ficcion interactiva.
- Mantenimiento de personajes y escenarios a lo largo de conversaciones multi-turno, gracias al entrenamiento sobre un corpus especifico de roleplay.
- Generacion de dialogos y descripciones narrativas coherentes con el tono y el registro del personaje definido en el prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no esta entrenado para ello.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de chatbots de personaje: el modelo puede sostener conversaciones multi-turno con una persona definida en el system prompt, lo que permite validar rapidamente la experiencia de usuario de una aplicacion de rol antes de invertir en un modelo mayor.
- Ficcion interactiva y novelas visuales: se puede integrar como motor de dialogo en videojuegos narrativos o plataformas de historias interactivas, generando respuestas de personajes coherentes con el escenario descrito.
- Generacion de dialogos para guiones: util para escribir borradores de conversaciones entre personajes con voces diferenciadas, que luego un guionista revisa y pule.
- Simulacion de entrevistas o entrenamiento conversacional: permite crear interlocutores sinteticos para practicar conversaciones en ingles en un entorno controlado.
- Despliegue local en hardware modesto: con la cuantizacion Q4_K_M (8,0 GB) se puede ejecutar en una GPU consumer de 8-12 GB de VRAM o en CPU con llama.cpp, lo que facilita pruebas offline sin coste de API.
- Investigacion sobre roleplay y evaluacion de sesgos: sirve como linea base para estudiar como los modelos afinados en roleplay manejan la coherencia de personaje, la deriva narrativa y los sesgos de contenido.
- Fine-tuning posterior sobre dominios concretos: al estar disponible en GGUF no es el formato ideal, pero el modelo base en transformers permite reentrenar o adaptar con LoRA para un personaje o estilo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K unos 5,0 GB; Q4_K_M unos 8,0 GB; Q6_K unos 10,8 GB; Q8_0 unos 13,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de la ventana utilizada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 para las cuantizaciones Q4 a Q8; A100 o H100 solo si se necesita throughput alto o contexto muy largo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_S o Q4_K_M; las variantes Q2_K y Q3_K caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores de produccion con concurrencia alta, vLLM no soporta GGUF de forma nativa, por lo que habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bluemoonrp-13b-GGUF | 13,0 B | no disponible | no disponible | GGUF | Especializado en roleplay en ingles |
| reeducator/bluemoonrp-13b | 13,0 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| mradermacher/bluemoonrp-13b-i1-GGUF | 13,0 B | no disponible | no disponible | GGUF | Variante con cuantizacion imatrix, mayor calidad por tamano |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (roleplay de 13B) en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para roleplay en ingles; su rendimiento en tareas de razonamiento, codigo o matematicas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion elevado en contextos fuera del roleplay, ya que el entrenamiento no prioriza la precision factual.
- Sesgos conocidos: no documentados en la model card, pero al derivar de un corpus de roleplay sin filtrado publico, puede reproducir estereotipos de personaje y contenido sensible.
- La licencia del modelo base no esta indicada en la informacion disponible; antes de un uso comercial es imprescindible verificar los terminos de reeducator/bluemoonrp-13b.
- La longitud de contexto no esta documentada, lo que impide garantizar conversaciones largas sin truncamiento.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene 91 descargas y 0 likes, lo que indica una validacion comunitaria muy limitada; conviene evaluar el modelo con casos propios antes de desplegarlo.
- No soporta tool calling ni razonamiento multi-paso, por lo que no es adecuado como backend de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bluemoonrp-13b-GGUF
- Modelo base: https://huggingface.co/reeducator/bluemoonrp-13b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/bluemoonrp-13b-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/gozfarb/bluemoon_roleplay_300k_vicuna
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#bluemoonrp-13b-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
