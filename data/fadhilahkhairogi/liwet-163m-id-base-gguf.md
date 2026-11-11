# fadhilahkhairogi/Liwet-163M-id-base-GGUF

## Resumen

Liwet-163M-id-base-GGUF es la conversión al formato GGUF del modelo base Liwet-163M-id-base, un transformer denso de 163 millones de parámetros entrenado por el Grupo 11 de la asignatura Generative AI de la Universidad de Telkom (Indonesia). El modelo está especializado en indonesio y se distribuye en tres cuantizaciones (BF16, F16 y Q8_0) listas para su uso con llama.cpp y con el servidor compatible con la API de OpenAI que incluye dicho ecosistema.

Se trata de un modelo en fase de preentrenamiento (pretrain base) con una longitud de contexto de 2048 tokens, sin ajuste por instrucciones ni plantilla de chat. No incorpora capacidades de tool calling, agentes ni razonamiento multi-paso; su función es la compleción de texto sin formato (raw text completion) en indonesio. La relevancia actual es limitada: es un artefacto académico de bajo coste computacional, útil para experimentación docente, prototipado rápido y estudio de pipelines de cuantización en llama.cpp, más que para despliegues de producción.

El repositorio incluye además el tokenizer original en formato JSON y documentación detallada sobre la paridad numérica entre cuantizaciones, con métricas de divergencia de logits y benchmarks de rendimiento en GPU y CPU. La licencia no está especificada, lo que impide asumir permisos de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dense_163m (transformer denso con GQA) |
| Parametros totales | 163.013.376 (163,0 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con atención de consultas agrupadas (GQA) de 163 millones de parámetros, identificado en el repo como `dense_163m`. El modelo se encuentra en la etapa de preentrenamiento base, sin ajuste por instrucciones, sin RLHF ni DPO documentados. La longitud de contexto es de 2048 tokens y el modo de prompt es `raw_bos`, es decir, compleción de texto sin formato.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de optimización empleadas. La conversión a GGUF se realizó con un fork de llama.cpp (rama `liwet-moe`, commit `cae551692`, build 11315) mediante `convert_hf_to_gguf.py --outtype bf16|f16` y posterior `llama-quantize` a Q8_0. El repositorio de safetensors original no fue modificado. La model card documenta un estudio de paridad numérica frente a la implementación de referencia en PyTorch con BF16 sobre CUDA, usando 35 prompts de prefill, 6 prompts greedy de 128 pasos y 5 prompts de sampling.

## Capacidades

- Generación de texto en indonesio mediante compleción de texto sin formato (raw completion).
- Modelo base: no está ajustado para seguir instrucciones ni para mantener conversaciones con roles.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo limitado al indonesio según la model card; no se documentan otros idiomas.
- Tokenizer con identificadores especiales `<pad>`=0, `<bos>`=1, `<eos>`=2; el GGUF se escribió con `add_bos_token = false`, por lo que el BOS debe añadirse explícitamente si se desea.
- Sin `chat_template` incluida en los metadatos GGUF: el prompt debe construirse por parte del llamante.

## Casos de uso

- Experimentación docente y reproducción de pipelines de cuantización: el repositorio documenta el flujo completo de conversión HF a GGUF y la comparación de paridad numérica entre BF16, F16 y Q8_0, lo que lo convierte en un caso de estudio útil en cursos de IA generativa.
- Prototipado de compleción de texto en indonesio: permite validar rápidamente interfaces de autocompletado o generación de texto libre en aplicaciones locales antes de migrar a modelos mayores.
- Pruebas de integración con llama.cpp y llama-cpp-python: su reducido tamaño (166,3 MiB en Q8_0) facilita la validación de entornos de despliegue, scripts de servidor y clientes OpenAI-compatibles sin consumo relevante de recursos.
- Despliegue en hardware muy limitado: con 148,2 tok/s de decodificación en CPU con 8 hilos (Q8_0), es viable en equipos sin GPU para tareas de generación de texto de baja exigencia.
- Generación de texto sintético en indonesio para aumento de datos: puede producir borradores o variaciones léxicas que luego se filtran y revisan manualmente.
- Evaluación comparativa de cuantizaciones: los datos de divergencia de logits (coseno mínimo de 0,999910 en Q8_0) permiten estudiar el impacto de la cuantización en modelos pequeños dentro de un marco controlado.
- Servicio local compatible con la API de OpenAI: mediante `llama-server` se puede exponer en `127.0.0.1:8080` con contexto de 2048 tokens para pruebas de integración de clientes.

## Benchmarks y rendimiento

Rendimiento medido con `llama-bench -ngl 99 -p 512 -n 128 -r 5` en GPU:

| Cuantización | Prefill 512 (tok/s) | Decode 128 (tok/s) |
|---|---|---|
| BF16 | 24.786 ± 3.364 | 396,19 ± 6,69 |
| F16 | 28.799 ± 6.022 | 367,57 ± 8,14 |
| Q8_0 | 23.366 ± 5.992 | 537,28 ± 25,63 |

Rendimiento en CPU con `-ngl 0 -t 8 -p 0 -n 32`:

| Cuantización | Decode 32 (tok/s) |
|---|---|
| BF16 | 23,3 ± 9,1 |
| Q8_0 | 148,2 ± 5,9 |

Paridad numérica frente a la referencia BF16 en CUDA (P1 = coseno del logit del último token; P2 = mediana del primer paso de divergencia greedy; P4 = TVD máxima en sampling):

| Cuantización | P1 mín. / media | P1 top-1 | P2 mediana (norep / defrep) | P4 TVD máx. |
|---|---|---|---|---|
| BF16 | 0,999994 / 0,999997 | 100,00 % | 128 / 38 | 0,050 |
| F16 | 0,999987 / 0,999996 | 100,00 % | 128 / 30,5 | 0,042 |
| Q8_0 | 0,999910 / 0,999984 | 100,00 % | 128 / 12,5 | 0,068 |

El autor advierte de que algunas métricas quedan por debajo del umbral de `compare.py`. No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de GPU son un límite inferior mientras Intel DTT está activo (frecuencia de SM observada de ~0,8 GHz frente a un límite de 3,1 GHz).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,17 GB en Q8_0, 0,31 GB en F16 y 0,31 GB en BF16, sin contar el overhead del runtime ni el KV cache de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; los benchmarks se ejecutaron con `-ngl 99` (todas las capas en GPU) sobre hardware no especificado.
- Cabe en cualquier GPU de consumo, incluidas integradas y modelos antiguos, dado su tamaño inferior a 350 MB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (el repositorio incluye `scripts/ollama/Modelfile-Liwet-163M-id-base` para Q8_0, con la ruta `FROM` a ajustar) y cualquier cliente compatible con la API de OpenAI contra `llama-server`.
- Latencia y throughput: 537,28 tok/s de decodificación en GPU con Q8_0 y 148,2 tok/s en CPU con 8 hilos; el prefill ronda los 23.000-28.000 tok/s en GPU según cuantización.
- Nota sobre Ollama: el orden de los samplers no es configurable con exactitud (top-p se calcula antes que temperature), por lo que la salida en sampling no es idéntica a la de otras aplicaciones; en modo greedy (`temperature=0`) la coincidencia es de 8/8 para todas las variantes densas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-163M-id-base-GGUF | 163,0 M | 2048 | indonesio | no disponible | GGUF |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa de rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Modelo en fase de preentrenamiento base: no sigue instrucciones ni mantiene diálogos con roles; su uso esperado es la compleción de texto sin formato.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de 163 M de parámetros sin ajuste fino.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida al indonesio; no se documenta calidad en otros idiomas.
- Licencia no especificada: no se puede asumir permiso de uso comercial ni condiciones de redistribución.
- Sin `chat_template` en el GGUF y con `add_bos_token = false`: los prompts deben formatearse manualmente y el BOS debe añadirse de forma explícita si se requiere.
- El tokenizer de la variante de 66 M (mencionada en la model card) no aplica normalización NFC, limitación conocida que puede afectar a la tokenización de texto Unicode.
- En Ollama, el orden de los samplers no es configurable con exactitud, lo que impide reproducir fielmente la salida en modo sampling.
- Las métricas de paridad de Q8_0 quedan por debajo del umbral de `compare.py` en algunos casos, según advierte el propio autor.
- Sin datos publicados de benchmarks de calidad de tarea; no se puede estimar su rendimiento en MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-base-GGUF
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-base
- Fork de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp (commit `cae551692`, rama `liwet-moe`, build 11315)
- Metodología de benchmarks de paridad: `docs/bench/RESULTS.md` (referenciado en la model card, sin URL pública disponible)
- Modelfile para Ollama: `scripts/ollama/Modelfile-Liwet-163M-id-base` (referenciado en la model card, sin URL pública disponible)
