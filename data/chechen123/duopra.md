# Chechen123/Duopra

## Resumen

Duopra es un modelo any-to-any (audio y texto) de tipo full-duplex orientado a diálogo hablado en tiempo real, publicado por el usuario Chechen123 en Hugging Face. Se trata de un fine-tune del modelo inclusionAI/Realtime-Venus, con 9.371.820.434 parámetros totales y un repositorio de 33,9 GB que incluye pesos en safetensors y exportaciones ONNX. Su pipeline declarado es any-to-any y está etiquetado como minicpmo, lo que lo sitúa en la familia de modelos conversacionales inspirados en CPmo, con soporte explícito de streaming, tool calling y function calling.

La relevancia del modelo radica en su enfoque full-duplex: a diferencia de los pipelines de voz por turnos (ASR → LLM → TTS), Duopra procesa y genera audio de forma simultánea, lo que habilita agentes de voz con latencia reducida y capacidad de interrupción. Incorpora además etiquetas de spoken-dialogue y voice-agent, lo que indica que el entrenamiento se ha orientado a conversaciones habladas multiturno más que a transcripción o síntesis aisladas.

El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia es MIT y los idiomas declarados son inglés y chino. El modelo referencia el paper arXiv:2611.25773, aunque la información disponible no detalla su contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado minicpmo; modelo base inclusionAI/Realtime-Venus) |
| Parametros totales | 9.371.820.434 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna mas alla de las etiquetas del repositorio: minicpmo, any-to-any, full-duplex y custom_code. El modelo deriva de inclusionAI/Realtime-Venus mediante fine-tuning, segun los metadatos base_model y base_model:finetune. El tag custom_code implica que la carga requiere codigo remoto con trust_remote_code=True, y la presencia de ONNX sugiere exportaciones para inferencia optimizada fuera de PyTorch.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). Las etiquetas spoken-dialogue, streaming, tool-calling y voice-agent indican que el entrenamiento se ha orientado a dialogo hablado en streaming con invocacion de herramientas, pero no se detallan los procedimientos.

## Capacidades

- Generacion y comprension de audio en modalidad any-to-any: entrada y salida de voz junto con texto.
- Dialogo hablado full-duplex: procesamiento simultaneo de entrada y salida, con capacidad de interrupcion y streaming continuo.
- Tool calling y function calling: invocacion de herramientas externas durante la conversacion.
- Soporte de agentes de voz: etiquetado explicitamente como voice-agent, con razonamiento multi-paso orientado a tareas conversacionales.
- Streaming: inferencia por flujos, adecuada para baja latencia en tiempo real.
- Multilingue limitado: ingles y chino declarados.
- Extraccion de caracteristicas (feature-extraction) como pipeline secundario.
- No se documentan capacidades de vision, matematicas avanzadas ni modo thinking explicito.

## Casos de uso

- Agentes de voz en atencion al cliente: el modo full-duplex permite conversaciones naturales con interrupciones, manteniendo el flujo de audio sin esperar al final del turno, lo que reduce la latencia percibida frente a pipelines ASR-LLM-TTS encadenados.
- Asistentes telefonicos automatizados: con tool calling puede consultar sistemas internos (estado de pedidos, agenda) mientras mantiene el habla, integrado en centralitas SIP mediante streaming de audio.
- Interfaces de voz para aplicaciones web o moviles: la exportacion ONNX facilita el despliegue en entornos con requisitos de portabilidad y la ejecucion con runtimes optimizados.
- Agentizacion de tareas multi-paso por voz: el etiquetado de agentes y function calling permite encadenar acciones (reservas, consultas, confirmaciones) en una sola sesion hablada.
- Prototipado de investigacion en dialogo hablado full-duplex: util para experimentar con modelos any-to-any de ~9,4 mil millones de parametros y comparar con alternativas por turnos.
- Extraccion de caracteristicas de audio para pipelines downstream: el pipeline feature-extraction permite reutilizar representaciones internas en tareas de clasificacion o recuperacion.
- Localizacion bilingue en ingles y chino: adecuado para productos dirigidos a esos dos mercados, no para otros idiomas sin verificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,37 mil millones de parametros, en FP16 se requieren aproximadamente 19 GB solo para pesos, mas memoria para cache de audio y activaciones; en cuantizacion de 8 bits, alrededor de 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en produccion con concurrencia; L40S o RTX 6000 Ada como alternativas de inference server.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 ajustado o en cuantizacion; en RTX 3090/4080 (16 GB) solo con cuantizacion de 8 o 4 bits y contexto de audio limitado.
- Opciones de despliegue: transformers con trust_remote_code=True (requerido por el tag custom_code); ONNX Runtime para los pesos exportados; no se confirman soportes de vLLM, llama.cpp, Ollama o TGI para esta arquitectura.
- Latencia y throughput: no disponibles; el modo streaming y full-duplex sugiere diseno para baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Duopra | 9,37 B | no disponible | any-to-any (audio+texto), full-duplex | MIT | gated |
| inclusionAI/Realtime-Venus (base) | no disponible | no disponible | any-to-any en tiempo real | no disponible | no disponible |
| Modelos de dialogo hablado por turnos (ASR+LLM+TTS) | variable | variable | audio por pipeline | variable | variable |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido (gated): es obligatorio aceptar condiciones en Hugging Face antes de la descarga; la automatizacion en CI/CD requiere token con permisos.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Requiere trust_remote_code=True por el tag custom_code, lo que implica ejecutar codigo del repositorio: riesgo de seguridad en entornos no controlados.
- Riesgo de alucinacion inherente a modelos generativos, agravado en audio por posibles errores de comprension del habla (ruido, acentos, solapamientos).
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un fine-tune de un modelo base no identificado en detalle, la trazabilidad de datos de entrenamiento es limitada.
- Sin datos publicados de benchmarks: no es posible validar calidad frente a alternativas antes de desplegar.
- El repositorio ocupa 33,9 GB, lo que exige planificacion de almacenamiento y ancho de banda.
- La licencia MIT permite uso comercial, pero debe verificarse que el modelo base inclusionAI/Realtime-Venus no imponga restricciones adicionales compatibles.
- No se confirma soporte en frameworks de serving de alto rendimiento (vLLM, TGI), lo que puede limitar el escalado en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Chechen123/Duopra
- Modelo base: https://huggingface.co/inclusionAI/Realtime-Venus
- Paper referenciado: https://arxiv.org/abs/2611.25773
