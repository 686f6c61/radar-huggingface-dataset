# mradermacher/hindi-llm-340m-instruct-GGUF

## Resumen

hindi-llm-340m-instruct-GGUF es la version cuantizada en formato GGUF del modelo srivassid/hindi-llm-340m-instruct, un modelo de lenguaje de tipo Llama afinado para instrucciones y especializado en hindi. Lo publica mradermacher, un conocido cuantizador de la comunidad de HuggingFace que distribuye versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo resuelve el problema de disponer de un LLM ligero y ejecutable en hardware modesto para tareas de generacion de texto e instrucciones en hindi.

Con 337.173.504 parametros (aproximadamente 340M), se situa en la gama de modelos pequenos, lo que permite su despliegue en CPU y en GPUs de consumo con requisitos de memoria muy reducidos. El modelo base fue entrenado sobre los datasets ai4bharat/sangraha y ai4bharat/indic-instruct-data-v0.1, lo que lo orienta al ecosistema linguistico indic. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos.

La relevancia actual radica en la combinacion de un tamano muy contenido, cuantizaciones disponibles desde Q2_K hasta f16 y una licencia permisiva, lo que lo convierte en una opcion practica para prototipos, entornos con recursos limitados y aplicaciones centradas en hindi. No obstante, al tratarse de un modelo de 340M parametros, sus capacidades de razonamiento y generacion son limitadas en comparacion con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivado del modelo base hindi-llm-340m-instruct) |
| Parametros totales | 337.173.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Llama con 337.173.504 parametros, afinado para instrucciones (instruction-tuned) y orientado al hindi. Los datasets declarados en la model card son ai4bharat/sangraha, un corpus linguistico de gran escala para lenguas indic, y ai4bharat/indic-instruct-data-v0.1, un conjunto de datos de instrucciones para lenguas indic. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La version publicada por mradermacher es una conversion estatica a GGUF del modelo base, generada con la herramienta de cuantizacion de llama.cpp. Segun la model card, no se han generado cuantizaciones ponderadas o con imatrix en el momento de la publicacion. La conversion conserva la arquitectura y los pesos del modelo original, unicamente con la reduccion de precision propia de cada tipo de cuantizacion.

## Capacidades

- Generacion de texto en hindi, incluyendo respuestas a instrucciones y conversacion basica.
- Afinado para instrucciones (instruction-tuned), lo que permite su uso en formatos de pregunta-respuesta.
- Capacidad multilingue limitada al hindi como idioma principal declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision ni audio.
- Ejecutable en CPU y GPU mediante llama.cpp y herramientas compatibles con GGUF.

## Casos de uso

- Prototipado rapido de asistentes en hindi: el modelo puede generar respuestas a instrucciones simples en hindi con una huella de memoria minima, lo que permite iterar en local sin infraestructura dedicada.
- Despliegue en dispositivos de borde y entornos sin GPU: las cuantizaciones Q4_K_S y Q4_K_M ocupan aproximadamente 0,3 GB, por lo que caben en Raspberry Pi, mini-PC y contenedores ligeros.
- Generacion de texto en aplicaciones moviles o embebidas: al ser un modelo de 340M parametros en GGUF, puede integrarse en apps que requieran inferencia offline en hindi.
- Filtrado y clasificacion de texto en hindi: tareas de etiquetado, resumen corto o reformulacion donde no se requiere razonamiento complejo.
- Educacion y practica del idioma: generacion de ejemplos de frases, ejercicios o respuestas modelo en hindi para plataformas de aprendizaje.
- Investigacion sobre modelos indic de baja escala: sirve como linea base para experimentos de cuantizacion, evaluacion de calidad en hindi y comparacion con modelos mayores.
- Chatbots de bajo coste para atencion basica: respuestas a preguntas frecuentes en hindi con latencia muy baja y coste de infraestructura minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en Q2_K, 0,3 GB en Q4_K_S/Q4_K_M, 0,4 GB en Q6_K, 0,5 GB en Q8_0 y 0,8 GB en f16 (tamanos de archivo indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.), asi como en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la model card menciona compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia muy baja en CPU y practicamente instantanea en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| hindi-llm-340m-instruct-GGUF (este modelo) | 337.173.504 | no disponible | hindi | Apache 2.0 | GGUF |
| srivassid/hindi-llm-340m-instruct (modelo base) | 337.173.504 | no disponible | hindi | Apache 2.0 | safetensors |
| Otros modelos indic de baja escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 340M parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos de mayor escala.
- Riesgo de alucinacion elevado en preguntas factuales o tareas que requieran conocimiento especifico.
- Idioma restringido al hindi segun la model card; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con conversaciones largas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar la calidad de forma notable; se recomienda Q4_K_M o superior para uso real.
- No se documentan salvaguardas especificas ni evaluaciones de sesgo; conviene auditar las salidas antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo base y de los datasets de entrenamiento (ai4bharat) por si imponen condiciones adicionales.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento, por lo que no es adecuado para pipelines agenticos complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/hindi-llm-340m-instruct-GGUF
- Modelo base: https://huggingface.co/srivassid/hindi-llm-340m-instruct
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#hindi-llm-340m-instruct-GGUF
- Dataset ai4bharat/sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset ai4bharat/indic-instruct-data-v0.1: https://huggingface.co/datasets/ai4bharat/indic-instruct-data-v0.1
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
