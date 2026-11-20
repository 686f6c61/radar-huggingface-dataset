# mradermacher/agentmujo-qwen3.5-9b-bos-GGUF

## Resumen

agentmujo-qwen3.5-9b-bos es un modelo de lenguaje de aproximadamente 8.950 millones de parametros (8,95 B), derivado de la familia Qwen3.5 y especializado mediante un adaptador LoRA en bosnio (`bs`) y en capacidades de function calling y comportamiento agentico. El modelo base de la cadena es `renatoschust/agentmujo-qwen3.5-9b-bos`, y esta ficha corresponde a la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicacion radica en dos factores. Por un lado, ofrece una via practica para desplegar un modelo orientado a agentes y llamadas a funciones en un idioma de bajos recursos como el bosnio, algo poco frecuente en el ecosistema open source. Por otro, la disponibilidad de hasta once variantes de cuantizacion GGUF (desde Q2_K de 3,9 GB hasta f16 de 18 GB) reduce la barrera de entrada para pruebas en local, prototipado y despliegues con recursos limitados.

La informacion disponible sobre el modelo original (datos de entrenamiento, contexto nativo, resultados de benchmarks) es escasa: la model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y las variantes ofrecidas. Esta ficha refleja unicamente los datos verificables en la informacion proporcionada y marca explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5, transformer; detalles no publicados) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | bosnio (bs); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo deriva de la familia Qwen3.5, por lo que se presupone una arquitectura transformer decoder-only, aunque la informacion proporcionada no detalla la configuracion exacta de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario. Sobre esa base se aplico un adaptador LoRA (etiqueta `lora` en el repositorio) para especializar el modelo en bosnio y en tareas de function calling y flujos agenticos, segun indican las etiquetas `agentmujo`, `bosnian`, `function-calling` y `agentic`.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). El repositorio cuantizado documenta el proceso de conversion a GGUF y las variantes generadas, pero no reproduce la model card tecnica del modelo original.

## Capacidades

- Generacion de texto conversacional en bosnio, idioma principal declarado del modelo.
- Function calling / tool calling: el modelo esta etiquetado explicitamente como `function-calling`, lo que sugiere soporte para invocar herramientas mediante esquemas estructurados.
- Comportamiento agentico: la etiqueta `agentic` indica orientacion a razonamiento multi-paso y ejecucion de tareas con herramientas.
- Especializacion linguistica en bosnio, un idioma de bajos recursos dentro del ecosistema de modelos abiertos.
- Capacidades generales heredadas de la familia Qwen3.5 (razonamiento, codigo, matematicas): no confirmadas en la informacion disponible para esta variante concreta.
- Soporte de vision, audio o modo thinking: no disponible.

## Casos de uso

- Asistentes conversacionales en bosnio: el modelo puede gestionar dialogos multi-turno en un idioma para el que existen pocos modelos abiertos especializados, lo que lo hace adecuado para atencion al usuario en Bosnia y Herzegovina y diaspora.
- Agentes con acceso a herramientas: gracias a su orientacion a function calling, puede integrarse en flujos donde el modelo decide que API invocar (consultas a bases de datos, busquedas, calculos) y compone la respuesta final.
- Automatizacion de soporte tecnico: con la variante Q4_K_M (5,7 GB) puede desplegarse en una estacion de trabajo con GPU de consumo para prototipar un bot de soporte interno sin depender de APIs externas.
- Procesamiento de documentos administrativos en bosnio: resumen y extraccion de datos de formularios o correspondencia oficial, aprovechando la especializacion linguistica del adaptador LoRA.
- Pipelines de agentes en local para desarrollo: la disponibilidad de cuantizaciones desde Q2_K (3,9 GB) permite iterar en portatiles y maquinas sin GPU dedicada de gran capacidad.
- Evaluacion e investigacion en NLP de bajos recursos: util como linea base para comparar rendimiento de modelos especializados en bosnio frente a modelos multilingues genericos.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local via llama.cpp, los datos no salen de la infraestructura del usuario, lo que encaja en casos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos + overhead de contexto, aproximada): Q2_K ~4-5 GB; Q4_K_M ~6-7 GB; Q6_K ~8-9 GB; Q8_0 ~10-11 GB; f16 ~18-20 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo necesarias para despliegues concurrentes o contextos muy largos.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_S/Q4_K_M; las variantes Q2_K y Q3_K_S pueden ejecutarse incluso en GPUs de 6 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de la version no cuantizada.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| agentmujo-qwen3.5-9b-bos (esta ficha) | 8,95 B | no disponible | bs | Apache 2.0 | GGUF, safetensors |
| Qwen3.5 9B (base de la familia) | ~9 B | no disponible | multilingue | no disponible | safetensors |
| Modelos multilingues genericos de ~8-9 B (p. ej. Llama 3.1 8B, Gemma 2 9B) | 8-9 B | 8K-128K segun modelo | decenas de idiomas | licencias propias | safetensors, GGUF |

La comparativa directa con alternativas especializadas en bosnio no esta disponible en la informacion proporcionada. Frente a los modelos multilingues genericos de tamano similar, la ventaja de esta variante es la especializacion via LoRA en bosnio y en function calling, mientras que su desventaja es la ausencia de benchmarks publicados que permitan cuantificar esa mejora.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar empiricamente la calidad del modelo en tareas de function calling, agenticas o generacion en bosnio.
- Riesgo de alucinacion inherente a los modelos de 9 B; sin datos de evaluacion especificos para esta variante.
- La especializacion en bosnio puede degradar el rendimiento en otros idiomas respecto al modelo base Qwen3.5, aunque no se ha cuantificado.
- Longitud de contexto no documentada: planificar despliegues con contexto conservador hasta verificar el limite real.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia y la fiabilidad del function calling; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 y del adaptador original, no detalladas en la informacion disponible.
- El repositorio tiene 0 likes y fue creado en noviembre de 2026: madurez y soporte comunitario limitados.
- La model card del repositorio cuantizado no documenta el proceso de entrenamiento del adaptador LoRA ni la procedencia de los datos en bosnio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/agentmujo-qwen3.5-9b-bos-GGUF
- Modelo base (adaptador LoRA): https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/agentmujo-qwen3.5-9b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#agentmujo-qwen3.5-9b-bos-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
