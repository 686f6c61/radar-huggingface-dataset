# InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-GGUF es la distribucion en formato GGUF del modelo Qwen3.5-4B-Uncensored-v2, desarrollado por InterpreticAI a partir del modelo base Qwen/Qwen3.5-4B. Se trata de una variante afinada para eliminar la mayor parte de la censura de caracter politico presente en el modelo original, manteniendo el resto de capacidades generales. El repositorio incluye unicamente los pesos cuantizados en Q4_K_M para el modelo de lenguaje y un proyector de vision en F16, pensados para su uso con llama.cpp y runtimes compatibles.

El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text) y sus 4.326.350.848 parametros totales, lo que lo situa en la categoria de modelos densos de ~4B. La relevancia actual reside en que ofrece una alternativa con licencia Apache 2.0, ejecutable en hardware de consumo, y con una reduccion documentada del 85,1% de las respuestas censuradas frente al modelo base en la evaluacion del autor.

La ficha del autor reporta una tasa de censura del 13,7% frente al 92,2% del Qwen3.5-4B original sobre un subconjunto de 51 preguntas politicamente sensibles, a costa de una ligera perdida de rendimiento en benchmarks de capacidad general y de un aumento de la fabricacion de hechos. No se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre el proceso de eliminacion de censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 65.536 tokens en la configuracion de ejemplo de llama-server (`-c 65536`); contexto maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 (proyector de vision) |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (`Qwen3.5-4B-Uncensored-v2-Q4_K_M.gguf`, `mmproj-Qwen3.5-4B-Uncensored-v2-F16.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo multimodal de tipo image-text-to-text derivado de Qwen3.5-4B, con 4.326.350.848 parametros totales. El repositorio GGUF es una conversion del release BF16 (InterpreticAI/Qwen3.5-4B-Uncensored-v2) realizada con llama.cpp; no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal documentada es la eliminacion de censura politica: segun el autor, el modelo base Qwen3.5-4B presenta una tasa de censura del 92,2% en preguntas politicamente sensibles, mientras que esta variante la reduce al 13,7% (7 de 51 respuestas censuradas). No se describe el metodo concreto de afinado empleado para lograrlo. El modelo conserva el modo de razonamiento (thinking mode) del original, desactivable mediante `--chat-template-kwargs '{"enable_thinking": false}'` en llama-server.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Procesamiento de imagen y texto (image-text-to-text) mediante el proyector de vision F16 incluido.
- Modo de razonamiento (thinking mode) activable o desactivable por configuracion.
- Respuestas sustancialmente menos censuradas en temas politicos en comparacion con Qwen3.5-4B.
- Razonamiento de dominio general y matematicas, con rendimiento cercano al modelo base segun los benchmarks del autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.
- Capacidades multilingues: no disponibles; la evaluacion publicada solo cubre chino.

## Casos de uso

- Analisis de discurso politico y censura: el modelo permite estudiar como responde un LLM a preguntas politicamente sensibles sin el sesgo de rechazo del modelo base, util para investigacion en ciencias sociales y auditoria de sesgos.
- Investigacion sobre alineacion y seguridad: sirve como contrapunto controlado frente a Qwen3.5-4B para medir el efecto de la eliminacion de censura en la utilidad y la veracidad de las respuestas.
- Procesamiento de documentos con imagenes en local: gracias al proyector de vision y al formato GGUF, puede desplegarse en estaciones de trabajo sin GPU de datacenter para extraer y comentar contenido de capturas, diagramas o formularios.
- Asistente conversacional autoalojado: con 2,78 GB en Q4_K_M y contexto configurable de 65.536 tokens, es viable como chatbot local en portatiles con GPU de consumo, sin dependencia de APIs externas.
- Generacion de texto en entornos con requisitos de privacidad: al ejecutarse con llama.cpp de forma local, los datos no salen del equipo, adecuado para borradores y resumenes de material confidencial.
- Prototipado de pipelines multimodales: el par de ficheros GGUF (modelo + mmproj) permite integrar entrada de imagen y texto en aplicaciones experimentales con llama-server antes de migrar a infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio facilita medir el impacto de Q4_K_M frente al BF16 original en tareas de razonamiento y fidelidad factica.

## Benchmarks y rendimiento

Los benchmarks de capacidad se ejecutaron sobre el release BF16, no sobre el GGUF Q4_K_M, segun indica el autor.

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.5-4B (card oficial) | 76,2 | 72,2 | −4,0 |
| IFBench | Qwen3.5-4B (card oficial) | 59,2 | 58,0 | −1,2 |
| GSM8K (500 preguntas) | Qwen3.5-4B (evaluacion del autor) | 97,0 | 96,0 | −1,0 |
| MMLU (1.000 preguntas) | Qwen3.5-4B (evaluacion del autor) | 72,7 | 72,3 | −0,4 |

Evaluacion de censura politica (Pan & Xu, 2026), 51 de 115 preguntas, modo no-thinking, decodificacion greedy, 4.096 tokens maximos de salida, juez LLM:

| Modelo | Respuestas censuradas (de 51) | Tasa de censura |
|---|---|---|
| Qwen3.5-4B | 47 | 92,2% |
| Qwen3.5-4B-Uncensored-v2 Q4_K_M | 7 | 13,7% |

Rechazo de peticiones daninas (medido sobre BF16, primeros 100 prompts de `mlabonne/harmful_behaviors`): 93 de 100 rechazadas, frente a 99 de 100 en Qwen3.5-4B.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,78 GB para el modelo Q4_K_M mas 0,67 GB del proyector de vision F16, es decir, en torno a 3,5 GB en total sin contar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el conjunto completo; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores permiten contexto amplio. A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 6 GB o mas de VRAM; con contexto de 65.536 tokens el consumo de KV cache crece y conviene mas VRAM o reducir `-c`.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` y `-ngl 999`), y runtimes compatibles con GGUF como Ollama o LM Studio (no confirmados explicitamente en la card). vLLM y TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF | 4,33B | 65.536 (config. ejemplo) | Apache 2.0 | GGUF Q4_K_M + mmproj F16 | Variante descensurada; MMLU 72,3 (BF16) |
| Qwen/Qwen3.5-4B | 4,33B (no confirmado) | no disponible | Apache 2.0 | safetensors (BF16) | Modelo base; MMLU 72,7, GPQA 76,2; tasa de censura 92,2% |
| InterpreticAI/Qwen3.5-4B-Uncensored-v2 (BF16) | 4,33B | no disponible | Apache 2.0 | safetensors | Mismo afinado en BF16; referencia de los benchmarks de capacidad |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion politica cubre exclusivamente preguntas en chino; el comportamiento en otros idiomas no esta documentado.
- Mayor tendencia a fabricar hechos que el modelo base: en 110 preguntas de control no politicas, un juez LLM marca 13 respuestas del BF16 como degeneradas (principalmente por hechos inventados), frente a 8 en Qwen3.5-4B.
- En las 51 preguntas evaluadas, 9 de las 44 respuestas no censuradas del build Q4_K_M identifican erroneamente el sujeto; una respuesta sustancial no implica que sea correcta.
- Los benchmarks de capacidad se midieron sobre BF16, por lo que el rendimiento real del Q4_K_M puede diferir.
- La reduccion de censura no equivale a eliminacion total: persiste un 13,7% de respuestas censuradas en el subconjunto evaluado.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar la licencia y atribucion del equipo Qwen.
- Riesgo de alucinacion elevado en comparacion con el modelo base; se recomienda verificacion independiente de afirmaciones facticas en produccion.
- Sesgos conocidos distintos de la censura politica: no disponibles en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia (Pan & Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
