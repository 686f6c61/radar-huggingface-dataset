# jadidbourbaki/clef-flash-GGUF

## Resumen

Clef-Flash GGUF es una cuantizacion en formato GGUF del modelo Cloudflare/clef-flash, publicada por el desarrollador jadidbourbaki (hayder). No se trata de una conversion generica: el repositorio empaqueta en un unico archivo el backbone Qwen3.5-9B en Q8_0 y la cabeza de esquema conjunta (joint schema head) de Clef en su bfloat16 original, bajo nombres de tensor que empiezan por `clef.`. El resultado es un modelo de decision que devuelve salidas tipadas y estructuradas, no texto libre de proposito general.

La relevancia de esta publicacion es que hace ejecutable en local un modelo que en su version original se distribuye como safetensors para Transformers. El autor anade ademas el runtime bobcat, que expone el modelo mediante una API HTTP compatible con peticiones SystemOne y una interfaz de linea de comandos. Es, por tanto, una pieza de infraestructura para desplegar clasificacion y decision estructurada sobre hardware propio.

El repositorio tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha, y su licencia es Apache 2.0, heredada de Cloudflare. La limitacion principal es que el archivo no es compatible con llama.cpp ni con otros runners habituales, porque llama.cpp rechaza los tensores extra de la cabeza de decision; solo funciona dentro de bobcat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-9B (`qwen3_5`) mas cabeza conjunta de esquema (joint schema head) para salida tipada; el modelo base es multimodal image-text-to-typed-output |
| Parametros totales | Aproximadamente 9 000 millones en el backbone (Qwen3.5-9B); el tamano de la cabeza de decision no esta disponible. Total exacto: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en Q8_0 y cabeza en bfloat16. No se ofrecen otras cuantizaciones (F16, Q4_K_M, etc.) en este repositorio |
| Idiomas soportados | No disponible. El tokenizador usa el pre-tokenizador de Qwen2, segun indica la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en un unico archivo |

## Arquitectura y entrenamiento

La arquitectura combina dos piezas. Por un lado, el backbone Qwen3.5-9B, un transformer de aproximadamente 9 000 millones de parametros. Por otro, la cabeza de esquema conjunta de Clef, que produce decisiones tipadas en lugar de texto libre; en el modelo base de Cloudflare esta catalogada como image-text-to-typed-output, con etiquetas de salida estructurada, clasificacion y multimodal. El modelo base se distribuye en safetensors bajo la arquitectura `qwen3_5` y dispone de codigo personalizado.

La conversion a GGUF se realizo con el conversor de llama.cpp usando las opciones `--no-mtp --outtype q8_0`, y despues la herramienta `tools/clef_gguf.py` de bobcat anadio la cabeza y fijo el pre-tokenizador del tokenizador al de Qwen2, que es el que usa el `tokenizer.json` de Clef. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco hay datos publicados sobre innovaciones de decodificacion o mecanismos de atencion empleados.

El dato tecnico mas relevante de la ficha es de fidelidad numerica: segun el autor, las decisiones de bobcat coinciden con el codigo de referencia de Cloudflare con una diferencia inferior a 0,005 en cada probabilidad de su peticion de prueba.

## Capacidades

- Decision estructurada con salida tipada: la cabeza de esquema devuelve decisiones con probabilidades asociadas, no texto libre.
- Clasificacion: el modelo base esta etiquetado como modelo de clasificacion y de decision (`decision-model`).
- Salida estructurada: la etiqueta `structured-output` del modelo base confirma este modo de operacion.
- Servicio HTTP: bobcat expone el modelo en `POST /v1/systemone` para peticiones SystemOne.
- Uso por linea de comandos: `bobcat decide -m clef:flash` responde una peticion desde terminal.
- Modo conversacional: el modelo base incluye la etiqueta `conversational`, aunque esta cuantizacion esta orientada a decisiones.
- Capacidades multimodales: el modelo base es image-text-to-text, pero este archivo GGUF no incluye codificador de vision, por lo que solo responde a estados de texto.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado de peticiones en backend: el modelo puede recibir un estado textual y devolver una decision tipada con su probabilidad, lo que permite enviar cada peticion al servicio correspondiente. Es adecuado porque la salida es un esquema cerrado y no requiere analizar texto generado.
- Triaje y clasificacion de tickets de soporte: dado el contenido de una incidencia, la cabeza de decision devuelve la categoria y el nivel de confianza, que se puede usar como umbral para escalar a un humano.
- Validacion y extraccion de campos tipados: integrado en un pipeline, el modelo decide sobre estados textuales y produce campos estructurados que alimentan directamente una base de datos, sin post-procesado de texto libre.
- Moderacion de contenido con umbral de confianza: al disponer de probabilidades por decision y de una fidelidad declarada inferior a 0,005 respecto al codigo de referencia, se puede fijar un umbral conservador y derivar los casos dudosos a revision manual.
- Servicio interno de decisiones sobre GPU propia: mediante `bobcat serve -m clef:flash` y el endpoint `POST /v1/systemone`, se puede desplegar el modelo como microservicio en infraestructura controlada, sin depender de APIs externas.
- Procesamiento por lotes en scripts: `bobcat decide -m clef:flash` permite resolver peticiones individuales desde linea de comandos, lo que encaja en tareas de automatizacion y verificacion dentro de un CI.
- Reproducibilidad y auditoria de modelos de decision: al incluir la cabeza en bfloat16 junto al backbone cuantizado, el archivo permite verificar en local que las decisiones coinciden con la implementacion de referencia de Cloudflare.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo declarado por el autor no es un benchmark, sino una medida de fidelidad: las decisiones de bobcat coinciden con el codigo de referencia de Cloudflare con una desviacion inferior a 0,005 en cada probabilidad de su peticion de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el backbone de aproximadamente 9 000 millones de parametros en Q8_0 ocupa del orden de 9,5 a 10 GB, mas la cabeza en bfloat16; el consumo real depende de la implementacion de bobcat y no esta documentado.
- GPU recomendadas: no disponible. No hay datos publicados sobre GPU validadas por el autor.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 12 GB o mas de VRAM (por ejemplo RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); esta estimacion se deriva del tamano del archivo y no de una prueba publicada.
- Opciones de despliegue: exclusivamente bobcat. El propio autor indica que llama.cpp rechaza los tensores extra de la cabeza, por lo que el archivo solo se ejecuta en bobcat. No hay soporte documentado para vLLM, Ollama, TGI ni llama.cpp directo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jadidbourbaki/clef-flash-GGUF | ~9B de backbone (Qwen3.5-9B) | No disponible | GGUF, un archivo, backbone Q8_0 y cabeza bf16 | No (sin codificador de vision) | Apache 2.0 | Hugging Face; ejecucion solo en bobcat |
| Cloudflare/clef-flash (modelo base) | ~9B de backbone (Qwen3.5-9B) | No disponible | Safetensors, Transformers | Si, image-text-to-typed-output | Apache 2.0 | Hugging Face; 34 me gusta |
| Otros modelos GGUF de decision de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona en bobcat. llama.cpp rechaza los tensores extra de la cabeza de decision, de modo que no se puede cargar con los runners GGUF habituales.
- Sin vision: el modelo base es multimodal image-text-to-text, pero este GGUF no incluye codificador de vision y solo responde a estados de texto.
- Una unica cuantizacion: solo se ofrece Q8_0 para el backbone. No hay variantes de menor precision para entornos con poca VRAM.
- Contexto desconocido: no se ha publicado la longitud de contexto soportada, lo que impide planificar cargas con entradas largas.
- Idiomas no documentados: la model card no especifica los idiomas soportados; el pre-tokenizador es el de Qwen2.
- Orientado a decisiones, no a generacion abierta: la cabeza de esquema produce salidas tipadas con probabilidades, por lo que no debe esperarse texto libre ni dialogo general.
- Riesgo de alucinacion: no hay documentacion especifica sobre este punto. Al tratarse de una cabeza de clasificacion con probabilidades, el riesgo se traslada a decisiones mal clasificadas, que conviene filtrar con umbrales de confianza.
- Sesgos: no disponible. No se han publicado evaluaciones de sesgo sobre el modelo base ni sobre esta cuantizacion.
- Adopcion nula: el repositorio registra 0 descargas y 0 me gusta, y fue creado el 1 de octubre de 2026 segun los metadatos de Hugging Face, por lo que carece de validacion por parte de la comunidad.
- Licencia: Apache 2.0, heredada de Cloudflare, permitiria uso comercial, pero conviene revisar en el repositorio base las condiciones de uso del codigo personalizado y de los datos con los que se entreno la cabeza.
- Produccion: no hay datos publicados de latencia, throughput ni pruebas de carga, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/jadidbourbaki/clef-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Runtime bobcat: https://github.com/jadidbourbaki/bobcat
- Perfil del autor: https://github.com/jadidbourbaki
- Directorio generico de modelos GGUF en Hugging Face: https://huggingface.co/GGUF-Models
- Buscador de modelos GGUF (recurso generico, no especifico de este modelo): https://local-ai-zone.github.io/
