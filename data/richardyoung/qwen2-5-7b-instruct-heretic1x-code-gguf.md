# richardyoung/Qwen2.5-7B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-7B-Instruct-heretic1x-code-GGUF es la distribucion en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-heretic1x-code, una version "abliterated" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-7B-Instruct. El autor, Richard J. Young, aplico la herramienta Heretic 1.x (heretic-llm 1.4.0) mediante ablacion direccional de rango 1 usando direcciones de rechazo derivadas de codigo. El resultado es un modelo de 7.615.616.512 parametros que responde a peticiones que el modelo original rechaza, y que se publica como objeto de estudio en un articulo sobre evaluacion de tecnicas de abliteration.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigacion sobre eliminacion de rechazos y su medicion, no un asistente de proposito general. Por otro lado, la publicacion en GGUF con cuantizaciones Q4_K_M y Q8_0, mas una importance matrix, permite reproducir el comportamiento en hardware de consumo mediante llama.cpp u Ollama, lo que facilita la investigacion aplicada y la evaluacion de defensas.

El modelo hereda la arquitectura y el contexto de Qwen2.5-7B-Instruct, pero la model card solo documenta el idioma ingles y no detalla la longitud de contexto en esta distribucion cuantizada. Las cifras de comportamiento (tasa de rechazo del 71,2% frente al 72,1% del original sobre 972 prompts daninos, y divergencia KL de 0,0085) corresponden al modelo en bf16 y no a los ficheros GGUF, que no fueron evaluados en el articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); no se detalla mas en la informacion disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q8_0; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; importance matrix (imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parametros. Sobre esa base, el autor aplico Heretic 1.x (heretic-llm 1.4.0), que realiza una ablacion direccional de rango 1 con direcciones de rechazo derivadas de codigo. La seleccion del trial se hizo con la regla "menos rechazos en dev con KL <= 0,01" sobre 200 trials; el trial seleccionado produjo 39 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,0085 respecto al original.

No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO adicionales; el proceso descrito es de edicion de pesos (ablacion), no de reentrenamiento. Los ficheros GGUF se generaron con llama.cpp (commit 468fde9): conversion con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una importance matrix calculada sobre el build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas. Cada fichero Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida, y los SHA-256 estan en `SHA256SUMS`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Generacion de codigo, dado que las direcciones de rechazo se derivaron de codigo y el modelo base es un instruct generalista.
- Cumplimiento de peticiones que el modelo original rechaza: la model card indica que "complies with many requests that the original refuses".
- Capacidad de razonamiento y matematicas: no verificada de forma especifica en la informacion disponible; se asume la del modelo base sin datos concretos.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma de la model card.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo thinking documentados).

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como artefacto de referencia para medir la eficacia de la eliminacion de rechazos con la regla de seleccion descrita y comparar con Heretic 2.0, OBLITERATUS y releases comunitarios sobre Qwen2.5 y Qwen2.5-Coder, tal como plantea el articulo del autor.
- Evaluacion de defensas frente a la eliminacion de rechazos: permite construir conjuntos de prompts daninos y medir tasas de cumplimiento con jueces como WildGuard, replicando la metrica de 972 prompts del paper.
- Estudio de cuantizacion y comportamiento de rechazo: al ofrecer Q4_K_M y Q8_0 del mismo modelo, permite comparar si la cuantizacion altera la tasa de cumplimiento, una caveat que el propio autor senala.
- Experimentos locales reproducibles: con Ollama o llama.cpp en hardware de consumo se puede ejecutar el Q4_K_M (4,7 GB) para pruebas de laboratorio sin infraestructura dedicada.
- Analisis de divergencia KL y fidelidad al modelo original: util para estudiar cuanto se desvia un modelo editado de su base en la distribucion de primer token.
- Docencia y divulgacion tecnica: ilustra de forma practica que es la ablacion direccional y como se mide su impacto, con ficheros y sumas de verificacion publicados.

## Benchmarks y rendimiento

Resultados publicados para el modelo en precision completa (bf16), no para los ficheros GGUF:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 72,1% | 71,2% (692/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 39 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no aplica | 0,0085 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de rechazo de los ficheros GGUF no se han evaluado y pueden diferir de las del modelo bf16.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para Q4_K_M (fichero de 4,7 GB) y 9-10 GB para Q8_0 (fichero de 8,1 GB), contando overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 3070) y 12 GB o mas para Q8_0 (RTX 4070 Ti, RTX 4080, RTX 4090); A100 y H100 sobradas para ambas cuantizaciones.
- Cabe en GPU de consumo: si, Q4_K_M en GPUs de 8 GB y Q8_0 en GPUs de 12 GB o superiores; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (via `llama-cli -hf`), Ollama (`ollama run richardyoung/qwen2.5-7b-instruct-heretic1x-code` o `ollama run hf.co/...:Q4_K_M`); la model card no menciona vLLM ni TGI para esta distribucion GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (972 prompts, WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (bf16) | 7,6 B | no disponible | 71,2% | apache-2.0 | safetensors / GGUF |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,6 B | no disponible en esta ficha | 72,1% | apache-2.0 | safetensors |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |
| OBLITERATUS sobre Qwen2.5 | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

La comparativa con Heretic 2.0 y OBLITERATUS se menciona en el titulo del articulo del autor, pero sus cifras concretas no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para investigacion sobre eliminacion de rechazos, no como asistente de proposito general; el autor lo declara explicitamente.
- Cumple muchas peticiones que el original rechaza, lo que implica riesgo de generar contenido danino si se usa fuera de un entorno de investigacion controlado.
- Las cifras de rechazo del 71,2% corresponden al modelo bf16; los ficheros GGUF no fueron evaluados y la cuantizacion puede alterar el comportamiento de rechazo.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredables del corpus de Qwen2.5-7B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Longitud de contexto: no especificada en esta distribucion.
- Licencia apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso licito.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-code-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Articulo citado: Young, R. J., "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder" (enlace arXiv pendiente de publicacion)
- Herramienta Heretic (heretic-llm 1.4.0): no disponible en la informacion proporcionada
- llama.cpp (commit 468fde9): no disponible en la informacion proporcionada
