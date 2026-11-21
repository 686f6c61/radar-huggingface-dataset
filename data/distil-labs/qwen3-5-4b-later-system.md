# distil-labs/Qwen3.5-4B-later-system

## Resumen

Qwen3.5-4B-later-system es un ajuste publicado por distil-labs sobre el modelo multimodal Qwen/Qwen3.5-4B de Alibaba Qwen. No se trata de un reentrenamiento de pesos: los pesos, el tokenizador y el resto de la plantilla de chat son idénticos al modelo original. La única modificación es la plantilla de chat (`chat_template.jinja` y la copia en `tokenizer_config.json`), que permite renderizar mensajes de sistema que no aparecen en la primera posición de la conversación.

El modelo base Qwen3.5-4B es un transformer multimodal de tipo image-text-to-text con aproximadamente 4.660 millones de parámetros (4.659.865.088 según los safetensors del repositorio), pensado para conversación, razonamiento y comprensión de imágenes. La modificación de distil-labs resuelve un problema concreto de ingeniería: el template original lanza una excepción (`System message must be at the beginning.`) cuando se intenta insertar un mensaje de sistema a mitad de una conversación, algo habitual en flujos de agentes y en el ajuste fino de estudiantes sobre conversaciones agénticas.

Es relevante ahora porque muchos pipelines de agentes inyectan instrucciones de sistema dinámicas durante el diálogo (por ejemplo, al cambiar de herramienta o de fase de una tarea). Este fork permite entrenar y ejecutar esos flujos sin parchear manualmente la plantilla, manteniendo intactas las capacidades del original, incluido el modo de razonamiento (`enable_thinking`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base mas alla de su naturaleza multimodal (pipeline `image-text-to-text`) y de la etiqueta `qwen3_5` en transformers. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. El autor indica explicitamente que los pesos y el tokenizador son los del Qwen/Qwen3.5-4B original, por lo que cualquier detalle arquitectonico debe consultarse en la model card del modelo base.

La innovacion tecnica de este repositorio es puramente de plantilla: en `chat_template.jinja` se sustituye la excepcion que prohibia los mensajes de sistema no iniciales por un renderizado in situ como `<|im_start|>system\n...<|im_end|>`. Esto preserva el formato de tokens especiales del modelo y permite que el modo de razonamiento (`enable_thinking`) siga funcionando igual que en el original. El caso de uso declarado por distil-labs es el ajuste fino de modelos estudiantes sobre conversaciones de agentes que anaden mensajes de sistema a mitad del dialogo.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagenes y texto (pipeline image-text-to-text): el modelo acepta entradas multimodales.
- Razonamiento con modo thinking controlable mediante el parametro `enable_thinking` de la plantilla.
- Soporte de mensajes de sistema en cualquier posicion de la conversacion, incluida la insercion dinamica a mitad de un dialogo.
- Capacidad de ajuste fino sobre conversaciones agenticas con system prompts intercalados.
- Tool calling, function calling y capacidades multilingues: no documentadas de forma especifica en este repositorio; deben verificarse en la model card de Qwen/Qwen3.5-4B.

## Casos de uso

- Ajuste fino de modelos estudiantes en flujos de agentes: el template modificado permite entrenar sobre trayectorias donde se inyectan mensajes de sistema entre turnos (cambio de herramienta, cambio de fase de la tarea) sin que el tokenizador lance excepciones.
- Orquestacion de agentes con instrucciones dinamicas: en produccion, un orquestador puede insertar un system prompt nuevo tras una llamada a herramienta para redefinir el rol del modelo, algo imposible con el template original.
- Evaluacion de robustez frente a cambios de instrucciones: permite medir como responde el modelo cuando recibe directrices de sistema a mitad de conversacion, util para estudiar el seguimiento de instrucciones.
- Pipelines de destilacion con datos sinteticos: al compartir pesos con el original, los estudiantes entrenados con este template son compatibles con el ecosistema Qwen3.5 y pueden compararse directamente contra el profesor.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, sirve para construir demos de atencion al usuario con capturas o documentos escaneados, siempre que se valide el contexto real del modelo base.
- Investigacion en plantillas de chat: como fork minimo y reproducible, es un caso de estudio util para analizar el impacto del formato de system messages en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la model card de Qwen/Qwen3.5-4B para benchmarks y uso, pero no se incluyen cifras en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16 GB o mas.
- Cuantizacion a 8 bits: alrededor de 5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para inferencia comoda con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080 y potencialmente en GPUs de 12-16 GB con cuantizacion, siempre que se genere la cuantizacion a partir de los safetensors originales.
- Opciones de despliegue: transformers (soporte declarado), y previsiblemente vLLM, TGI o llama.cpp tras conversion, aunque no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| distil-labs/Qwen3.5-4B-later-system | 4,66 B | no disponible | imagen-texto | Apache 2.0 | Fork de plantilla de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | 4,66 B | no disponible | imagen-texto | Apache 2.0 | Modelo base; rechaza system messages no iniciales |
| Alternativas de ~4 B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- El cambio de plantilla altera el formato de los tokens de entrada respecto al modelo original; aunque los pesos son los mismos, el modelo no fue entrenado explicitamente para interpretar system messages intercalados, por lo que su comportamiento ante ellos puede ser inconsistente.
- Riesgo de alucinacion y sesgos: heredados del modelo base; no se documentan evaluaciones de sesgo en este repositorio.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto no especificada en este repositorio; debe consultarse en la model card de Qwen/Qwen3.5-4B.
- No hay cuantizaciones oficiales publicadas; cualquier GGUF o AWQ debe generarse y validarse por el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base enlazados por el autor.
- Para produccion, es imprescindible validar el comportamiento con system messages intercalados frente al modelo original antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/distil-labs/Qwen3.5-4B-later-system
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
