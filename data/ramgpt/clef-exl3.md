# ramgpt/clef-EXL3

## Resumen

`ramgpt/clef-EXL3` es una conversion al formato EXL3 (ExLlamaV3) del modelo `Cloudflare/clef`, publicada por el usuario ramgpt. No se trata de un modelo de chat convencional: Clef incorpora una cabeza de esquema conjunta (`JointSchemaHead`) que permite tomar decisiones estructuradas sobre un estado de entrada en JSON, devolviendo respuestas con los campos `noul`, `choice` y `score`. La cuantizacion usa 4,00 bpw para el decodificador, 6 bpw para la torre de vision y mantiene la LM head en FP16 porque sus vectores de embedding de salida se emplean para puntuar las opciones del esquema.

El modelo base se describe en la model card como un decodificador Qwen3.8 de 27B, mientras que los metadatos de safetensors del repositorio declaran 8.942.644.608 parametros; el autor no documenta la equivalencia entre ambas cifras. El repositorio ocupa 18,2 GB y se distribuye bajo licencia Apache-2.0.

Su relevancia es practica: permite ejecutar la ruta de decision SystemOne de Clef en una GPU de consumo con una paridad numerica muy alta respecto a la referencia BF16 (delta absoluto medio de 0,007055 y maximo de 0,0178 en los dos casos de validacion incluidos). El autor valido la carga y la generacion con ExLlamaV3 1.5.2+cu128.torch2.10.0 sobre una RTX 4090, con una sonda de generacion de 26,337 tok/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer Qwen3.8 (segun model card) con torre de vision y cabeza de esquema conjunta de Clef |
| Parametros totales | 8.942.644.608 segun metadatos de safetensors; la model card describe la variante como 27B (discrepancia no documentada) |
| Parametros activos | no procede / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4,00 bpw (decodificador); EXL3 6 bpw (torre de vision); LM head FP16 (`head_bits=16`); joint schema head en BF16 original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria `exllamav3`) |

## Arquitectura y entrenamiento

El modelo conserva el decodificador auto-regresivo del base y anade la cabeza de esquema conjunta de Cloudflare, que se carga desde `joint_head.safetensors` en sus pesos BF16 originales y el adaptador `clef_exl3.py` la alimenta con los estados ocultos finales de ExLlamaV3. La decision de mantener la LM head en FP16 es explicita en la model card: Clef reutiliza los vectores de embedding de salida para puntuar las opciones del esquema, por lo que una cuantizacion agresiva de esa capa degradaria la puntuacion. La revision del modelo fuente empleada para la conversion es `2f3de3dd85f379784083b0814d997ab627200f0c`.

No hay informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, si hubo RLHF o DPO) ni sobre el proceso de calibracion de la cuantizacion. Tampoco se documenta la arquitectura interna del decodificador mas alla de la etiqueta Qwen3.8, ni si emplea atencion lineal, decodificacion especulativa u otras innovaciones. La torre de vision esta incluida y cuantizada a 6 bpw, pero el adaptador no conecta todavia entradas de imagen o video a la ruta de decision, de modo que esta version no debe considerarse inferencia multimodal validada.

## Capacidades

- Decision estructurada mediante la ruta SystemOne, con tres tipos de salida documentados: `choice` (eleccion entre criterios definidos), `noul` (pregunta booleana/umbral) y `score` (puntuacion numerica).
- Puntuacion de opciones de esquema a partir de los vectores de embedding de salida de la LM head.
- Entrada de estado en texto y en JSON, validada en los casos incluidos en el repositorio.
- Clasificacion con criterios definidos por el usuario en tiempo de inferencia (por ejemplo, estados de factura o enrutado de incidencias).
- Generacion de texto estandar como subproducto del decodificador (sonda medida a 26,337 tok/s), aunque no es el camino de uso previsto.
- Torre de vision presente y cuantizada a 6 bpw, pero no conectada ni validada en el adaptador: capacidad no operativa en esta publicacion.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion de facturas y cuentas por cobrar: enviando un estado JSON con los campos de la factura, el modelo devuelve una decision de tipo `choice` sobre el estado (`paid`, `overdue`, `draft`) con una puntuacion asociada. Es el caso de validacion incluido por el autor, con paridad practicamente exacta frente a BF16 (0,9942 frente a 0,9944).
- Enrutado de incidencias tecnicas: la validacion de `outage routing: technical` alcanza 0,9258 en EXL3, por lo que es adecuado para dirigir alertas de operaciones al equipo correcto sin reglas hardcodeadas.
- Evaluacion de umbrales de negocio: la salida de tipo `noul` responde a preguntas como si el total de una factura supera los 1000 USD, con una puntuacion que permite fijar un umbral de confianza y derivar los casos dudosos a revision humana.
- Triaje de urgencia en soporte: la puntuacion de urgencia (1,8354 en EXL3 frente a 1,8176 en BF16) permite ordenar una cola de tickets por prioridad usando un criterio definido en el propio prompt del esquema.
- Validacion de reglas de negocio en pipelines JSON: al aceptar estado estructurado y devolver decisiones tipadas, se puede integrar como etapa de validacion entre un sistema transaccional y un motor de workflow.
- Entornos con requisitos de auditabilidad: los artefactos `VALIDATION.json`, `clef-exl3-smoke.json` y `clef-bf16-reference.json` documentan los deltas numericos frente a la referencia BF16, lo que facilita justificar la equivalencia funcional de la version cuantizada ante un equipo de calidad o cumplimiento.
- Prototipado local sin GPU de datacenter: la conversion cabe y funciona en una RTX 4090, lo que permite desarrollar y depurar la logica de esquemas en estacion de trabajo antes de desplegar la version BF16 en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor incluye unicamente una validacion de paridad entre la referencia BF16 y la conversion EXL3 sobre dos casos:

| Comprobacion | Referencia BF16 | EXL3 |
|---|---:|---:|
| Estado de factura: vencida | 0,9942 | 0,9944 |
| Total de factura > 1000 USD | 0,9942 | 0,9945 |
| Enrutado de incidencia: tecnica | 0,9161 | 0,9258 |
| Puntuacion esperada de urgencia | 1,8176 | 1,8354 |
| Caida de servicio: verdadero | 0,8981 | 0,9078 |

Agregados de la validacion: delta absoluto medio de 0,007055 y delta absoluto maximo de 0,0178 sobre todos los valores numericos de los dos casos. Las decisiones discretas coincidieron con la referencia BF16 en ambos casos. Sonda de generacion en RTX 4090: 26,337 tok/s, medida con el cargador y no representativa del rendimiento de decision de SystemOne.

## Requisitos de hardware

- Tamano del repositorio: 18,2 GB, incluyendo pesos EXL3, la cabeza conjunta en BF16 y los artefactos de validacion.
- VRAM estimada para inferencia: entre 14 y 18 GB (estimacion propia a partir de un decodificador de 27B a 4,00 bpw mas torre de vision, LM head en FP16 y cache de contexto; el autor no publica una cifra de VRAM).
- GPU validadas por el autor: RTX 4090 (24 GB) con ExLlamaV3 1.5.2+cu128.torch2.10.0.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, 4090, 5090). No se ha confirmado su funcionamiento en tarjetas de 16 GB.
- GPU de datacenter: no se documenta validacion en A100, H100 u otras; serian compatibles por VRAM pero sin datos de rendimiento publicados.
- Despliegue: la unica ruta soportada es ExLlamaV3 mas el adaptador `clef_exl3.py` incluido en el repositorio. La compatibilidad con TabbyAPI no esta validada y no se usa como criterio de publicacion. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: unicos datos disponibles, la sonda de generacion de 26,337 tok/s en RTX 4090 y la advertencia del autor de que no mide el rendimiento de decision de SystemOne.

## Comparativa con modelos similares

No se conocen otras cuantizaciones publicas de Clef ni alternativas de la misma familia con las que comparar en terminos de rendimiento. La unica comparacion posible es contra el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef (referencia BF16) | no disponible (descrito como 27B) | no disponible | safetensors BF16 | Apache-2.0 | Repositorio de Cloudflare (no verificado en esta busqueda) |
| ramgpt/clef-EXL3 | 8.942.644.608 segun safetensors | no disponible | safetensors EXL3 (4,00 bpw) | Apache-2.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Otras cuantizaciones EXL3 de modelos Qwen3.8 de tamano similar | no disponible | no disponible | EXL3 | no disponible | no disponible |

## Limitaciones y advertencias

- La torre de vision esta cuantizada pero no conectada a la ruta de decision: esta version no debe presentarse como inferencia multimodal validada.
- No es un modelo de chat estandar. Clef depende de su ruta de decision SystemOne personalizada, no de una API de chat-completions, por lo que no se puede usar como sustituto directo de un LLM conversacional.
- Compatibilidad con TabbyAPI no validada en esta publicacion.
- La validacion de paridad se limita a dos casos. Los deltas absolutos llegan a 0,0178, lo que en decisiones de clasificacion con umbrales ajustados puede cambiar el resultado.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- La discrepancia entre los 8.942.644.608 parametros de safetensors y la descripcion de 27B no esta documentada por el autor; conviene verificar el consumo real de memoria antes de dimensionar un despliegue.
- No se documentan idiomas soportados ni longitud de contexto, dos parametros criticos para planificar produccion.
- Riesgo de alucinacion: aunque el formato de salida es estructurado y puntuado, la seleccion de criterios y la puntuacion numerica pueden ser incorrectas si el estado de entrada esta incompleto o es ambiguo; conviene fijar umbrales de confianza y derivar a revision humana.
- Sesgos conocidos: no disponibles (el autor no publica evaluacion de sesgos).
- Licencia Apache-2.0, que permite uso comercial, pero el trabajo derivado hereda la atribucion a Cloudflare por el modelo base, la cabeza de esquema conjunta y `joint_schema_model.py`. Cualquier redistribucion debe mantener dicha atribucion.
- Publicacion del 2 de octubre de 2026: repositorio muy reciente y sin historial de mantenimiento.
- La busqueda del termino "CLEF" devuelve tambien un modelo fundacional de EEG clinico (arXiv 2605.10817) sin ninguna relacion con este repositorio; no deben confundirse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ramgpt/clef-EXL3
- Modelo base: https://huggingface.co/Cloudflare/clef
- Libreria de cuantizacion e inferencia ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Comparativa de formatos de cuantizacion (GGUF, GPTQ, AWQ, EXL2, EXL3): https://www.marktechpost.com/2026/09/18/gguf-vs-gptq-vs-awq-vs-exl2-llm-model-formats-explained-2026/
- Comparativa de formatos por hardware (GGUF, MLX, EXL3, GPTQ, AWQ, FP8): https://d-central.tech/llm-quantization-formats/
- Articulo no relacionado con este modelo, mismo acronimo (modelo fundacional de EEG): https://arxiv.org/abs/2605.10817
