# distil-labs/Qwen3.5-4B-later-system

## Resumen

Qwen3.5-4B-later-system es un derivado de Qwen/Qwen3.5-4B publicado por distil-labs que modifica unicamente la plantilla de chat del modelo original. El cambio consiste en permitir mensajes de sistema que no aparecen en la primera posicion de la conversacion: en lugar de lanzar la excepcion `System message must be at the beginning.`, la plantilla renderiza esos mensajes como `<|im_start|>system\n...<|im_end|>` en la posicion donde aparecen. Los pesos, el tokenizador y el resto de la plantilla son identicos a los del modelo base.

El modelo resuelve un problema concreto de los pipelines de ajuste fino orientados a agentes: muchas conversaciones agente-herramienta insertan instrucciones de sistema (politicas, contexto de herramienta, directrices dinamicas) a mitad del dialogo, algo que la plantilla original de Qwen rechaza. distil-labs emplea esta variante para entrenar modelos estudiantes con conversaciones de agente que incorporan mensajes de sistema durante el transcurso de la interaccion.

Al conservar integramente los pesos del modelo base, hereda sus capacidades multimodales (entrada de imagen y texto), su modo de razonamiento (`enable_thinking`) y su licencia Apache 2.0. Con 4.659.865.088 parametros y un repositorio de 9,3 GB en safetensors, es un modelo de ~4,7B orientado a despliegue en una sola GPU y a experimentacion con plantillas de chat personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4.659.865.088 (~4,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el modelo base; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una copia de los pesos de Qwen/Qwen3.5-4B con una unica modificacion en `chat_template.jinja` (y la copia equivalente en `tokenizer_config.json`). El diff publicado sustituye la llamada a `raise_exception('System message must be at the beginning.')` por la emision literal de un bloque de sistema en la posicion del mensaje. No hay reentrenamiento ni ajuste de pesos: el modelo base conserva su arquitectura transformer multimodal con pipeline `image-text-to-text` y su soporte de modo de pensamiento mediante el parametro `enable_thinking`.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, la composicion del corpus ni si se aplicaron fases de RLHF o DPO, ya que esos datos corresponden a la model card de Qwen/Qwen3.5-4B y no se incluyen en la informacion proporcionada. La innovacion tecnica de esta variante es estrictamente de formato conversacional: habilita plantillas de agente con mensajes de sistema intercalados, lo que resulta util para ajuste fino de estudiantes sobre trazas de agente donde el contexto del sistema se inyecta de forma dinamica.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), segun los tags del repositorio.
- Modo de razonamiento activable mediante `enable_thinking`, con el mismo comportamiento que el modelo original.
- Soporte de mensajes de sistema en cualquier posicion de la conversacion (caracteristica diferencial de esta variante).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue en infraestructuras de inferencia tipo API.
- Capacidades de tool calling, function calling y razonamiento multi-paso: no confirmadas explicitamente en la informacion proporcionada, aunque plausibles por herencia del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Ajuste fino de estudiantes sobre conversaciones de agente: la razon declarada por el autor es entrenar modelos pequenos con dialogos que insertan mensajes de sistema a mitad de la interaccion, algo imposible con la plantilla original de Qwen. El modelo sirve como referencia o como base para generar dichas trazas.
- Investigacion en plantillas de chat: permite experimentar con formatos conversacionales no canonicos sin reentrenar pesos, comparando el efecto de mensajes de sistema intercalados frente a instrucciones iniciales.
- Evaluacion de robustez ante inyeccion de contexto: util para medir como responde un modelo de ~4,7B cuando recibe directrices de sistema en mitad de un dialogo, escenario habitual en sistemas con politicas dinamicas.
- Prototipado de asistentes con contexto de herramienta: en pipelines donde el resultado de una herramienta se acompana de una instruccion de sistema para el siguiente paso, la plantilla modificada evita errores de renderizado.
- Despliegue en una sola GPU para pruebas de integracion: con ~4,7B parametros y safetensors de 9,3 GB, cabe en GPUs de consumo con cuantizacion (aunque no se publican variantes cuantizadas en este repositorio) y permite validar pipelines de transformers antes de escalar.
- Generacion multimodal en entornos de investigacion: al conservar el pipeline `image-text-to-text`, puede usarse para tareas de descripcion de imagenes o VQA en laboratorio, siempre que se valide el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a Qwen/Qwen3.5-4B para benchmarks y uso, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 16-24 GB para margen operativo.
- VRAM estimada con cuantizacion de 8 bits: en torno a 5 GB de pesos; con 4 bits, en torno a 2,5-3 GB, aunque este repositorio no publica variantes cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con margen; RTX 3090/4080 (16-24 GB) para pruebas.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en BF16, y en tarjetas de 8-12 GB si se aplica cuantizacion (no se proporcionan pesos GGUF en este repositorio).
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad del formato safetensors, servidores como vLLM o TGI; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| distil-labs/Qwen3.5-4B-later-system | ~4,7B | no disponible | Apache 2.0 | safetensors | Plantilla de chat modificada para mensajes de sistema no iniciales |
| Qwen/Qwen3.5-4B | ~4,7B | no disponible | Apache 2.0 | safetensors | Modelo base; plantilla original rechaza system fuera de la primera posicion |
| Alternativas de ~4B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparativa se limita al modelo base, ya que no se han proporcionado especificaciones de otros modelos de la misma categoria. La diferencia funcional respecto a Qwen/Qwen3.5-4B es exclusivamente la plantilla de chat; pesos, tokenizador y licencia son identicos.

## Limitaciones y advertencias

- El cambio afecta unicamente a la plantilla de chat; no hay mejora de capacidades, razonamiento ni calidad de respuesta respecto al modelo base.
- Los mensajes de sistema intercalados se renderizan como bloques `<|im_start|>system\n...<|im_end|>`, pero no se garantiza que el modelo base haya sido entrenado para interpretar instrucciones de sistema en posiciones no iniciales; el comportamiento puede degradarse.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen3.5-4B.
- Idiomas soportados no especificados; no se puede confirmar cobertura multilingue.
- Longitud de contexto no disponible; no se puede planificar su uso en conversaciones largas sin consultar la model card del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base enlazada por el autor.
- Repositorio con 0 likes y ~1067 descargas en el momento de la consulta: ecosistema limitado, sin garantias de mantenimiento.
- No se publican variantes cuantizadas ni pesos GGUF; el despliegue en hardware modesto requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/distil-labs/Qwen3.5-4B-later-system
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
