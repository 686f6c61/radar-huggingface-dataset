# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-5bpw

## Resumen

Esta ficha describe una cuantizacion EXL3 a 5 bits por peso del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario groxaxo. No se trata de un modelo entrenado desde cero, sino de una version comprimida y lista para inferencia con ExLlamaV3 del checkpoint original en BF16. El nombre comercial mezcla referencias a DeepSeek, Qwen y una variante "heretic" sin censura, pero la unica informacion verificable en el repositorio es la del proceso de cuantizacion y los resultados de fidelidad frente al modelo base.

El peso real de los tensores safetensors es de 3.912.945.024 parametros, muy lejos de los 9B que sugiere el nombre. El repositorio ocupa 7,8 GB e incluye pesos cuantizados con un objetivo de 5 bits para las capas lineales principales, 6 bits para el cabezal de salida y la torre de vision, 4 bits para las capas MTP y embeddings en BF16. El autor documenta una evaluacion de divergencia KL frente al checkpoint original y una prueba de codigo con OpenCode sobre diez ejercicios, con resultados de 5/10 en las tres variantes probadas (8, 6 y 5 bpw).

La relevancia practica es limitada pero concreta: permite ejecutar un modelo de aproximadamente 4.000 millones de parametros con ventana de contexto configurable hasta 131.072 tokens en una GPU de consumo de 12 GB, algo imposible con el checkpoint BF16 original. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de model card detallada sobre datos de entrenamiento y la naturaleza "uncensored" del modelo base exigen cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`), con torre de vision y capas MTP |
| Parametros totales | 3.912.945.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (limite configurado en servidor/cache durante la evaluacion); limite arquitectonico no disponible |
| Tipos de cuantizacion | EXL3 5 bpw (lineales principales), 6 bits (cabezal de salida y torre de vision), 4 bits (capas MTP), BF16 (embeddings) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ExLlamaV3 / EXL3), 7.826.135.525 bytes |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5, segun la etiqueta `qwen3_5` del repositorio y la referencia a una torre de vision y capas MTP (multi-token prediction) en la configuracion de cuantizacion. El modelo base `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` es un checkpoint afinado sobre una base Qwen3.5, presumiblemente con tecnicas de ablacion de rechazos ("heretic") para reducir la censura en las respuestas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica de esta ficha es exclusivamente la cuantizacion EXL3. El autor uso el conversor ExLlamaV3 1.6.6 con codebook `mul1`, calibracion sobre un corpus empaquetado de 250 filas de 2048 tokens y escalas de salida automaticas. La receta asigna bits de forma no uniforme: 5 bits para las capas lineales principales, 6 bits para el cabezal de salida y la torre de vision, 4 bits para las capas MTP y BF16 para los embeddings, de modo que el tamano total supera la estimacion uniforme de 5 bits. El repositorio incluye `conversion.json` con el pin de origen, checksums de tensores y argumentos reproducibles del conversor, ademas de un `smoke-test.json` con pruebas deterministas de generacion de texto.

## Capacidades

- Generacion de texto conversacional multiturno, con plantilla de chat original preservada del modelo base.
- Razonamiento con modo "thinking" habilitado por defecto en la plantilla de chat, segun la configuracion usada en la evaluacion.
- Generacion de codigo: el autor valida el modelo sobre ejercicios de HumanEval y un ejercicio de TerminalBench mediante un agente (OpenCode).
- Uso como agente con tool calling: la evaluacion se ejecuta en OpenCode en modo auto/YOLO con permisos de herramientas habilitados.
- Capacidades de vision: la cuantizacion incluye una torre de vision a 6 bits, aunque el autor advierte que no se valido en la evaluacion.
- Capas MTP (multi-token prediction) a 4 bits, presentes en la arquitectura aunque no se usaron como draft en las pruebas.
- Capacidades multilingues: no disponible (no se documentan idiomas).

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en un agente tipo OpenCode o similar para resolver ejercicios de programacion y tareas de CLI, como demuestra la evaluacion del autor con 5/10 ejercicios estrictos superados en HumanEval seleccionado y TerminalBench. Es adecuado porque cabe en 12 GB de VRAM y soporta tool calling.
- Prototipado de agentes con contexto largo: con 131.072 tokens de ventana configurable, sirve para probar flujos multi-step con historiales extensos en una unica GPU de consumo, aunque el autor advierte que no se exercised el contexto completo.
- Generacion de texto sin censura para investigacion: el caracter "uncensored/heretic" del modelo base lo hace util para estudiar comportamiento de modelos con rechazos ablacionados, siempre que se apliquen filtros y politicas de uso en el producto final.
- Inferencia de bajo coste en estaciones de trabajo: al ocupar 7,8 GB en disco y requerir una GPU de 12 GB, permite desplegar un modelo de ~4.000 millones de parametros en hardware modesto con ExLlamaV3 o TabbyAPI.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de KL y throughput para 8, 6 y 5 bpw, lo que lo convierte en un caso de estudio util para medir el impacto de la cuantizacion en fidelidad y velocidad.
- Backend de chat en aplicaciones internas: la licencia Apache 2.0 y el soporte de TabbyAPI permiten montar un servicio de chat con plantilla original y cache Q8, adecuado para entornos controlados donde no se requiere soporte multilingue verificado.
- Experimentacion con vision (con cautela): la torre de vision esta cuantizada a 6 bits, pero el autor no la valido, por lo que solo es recomendable para pruebas exploratorias, no para produccion.

## Benchmarks y rendimiento

El autor publica una evaluacion de divergencia KL y throughput para tres variantes de cuantizacion, medida sobre 8.192 posiciones de siguiente token (4.096 de WikiText-2 y 4.096 de HumanEval) con vocabulario completo de 248.077 tokens y cache Q8.

| EXL3 | KL media (nats) | Acuerdo top-1 con referencia | Aprobados estrictos | Tokens/s generacion | Minutos tarea principal |
|---|---:|---:|---:|---:|---:|
| 8 bpw | 0,000132 | 99,54% | 5/10 | 34,9 | 45,4 |
| 6 bpw | 0,001128 | 98,38% | 5/10 | 42,4 | 47,7 |
| 5 bpw | 0,003654 | 97,74% | 5/10 | 44,7 | 42,1 |

La prueba de correccion uso OpenCode v2.2.7 en modo auto/YOLO sobre diez ejercicios (HumanEval 1, 6, 32, 39, 76, 99, 101, 132, 141 y TerminalBench `pytorch-model-cli`), con temperatura 0,6, top-p 0,95, top-k 20, semilla 3407, 8.192 tokens de salida por respuesta y 20 minutos por ejercicio. Las tres variantes superaron 5/10. El autor advierte que estos totales ocultan fallos distintos en casos limite y no establecen una correccion general equivalente. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB con cache Q8 y contexto moderado; el autor reporta pruebas en una RTX 3060 de 12 GB. El consumo crece con la longitud de contexto y con los componentes cargados (torre de vision, MTP).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, y GPUs profesionales como A100 o H100 para mayor throughput y contexto completo.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM.
- Opciones de despliegue: ExLlamaV3 1.6.6 o superior, TabbyAPI como backend compatible, y cualquier runtime que soporte el formato EXL3. No es compatible con llama.cpp, Ollama ni TGI en formato nativo.
- Latencia y throughput estimados: 44,7 tokens/s en generacion con 5 bpw sobre RTX 3060 12 GB, frente a 42,4 tokens/s con 6 bpw y 34,9 tokens/s con 8 bpw, medidos en una unica ejecucion y en entorno compartido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 5 bpw) | 3.912.945.024 | 131.072 configurado | EXL3 5 bpw | Apache 2.0 | Hugging Face, ExLlamaV3 |
| Base BF16 `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` | no disponible (nombre sugiere 9B) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Variantes EXL3 6 bpw y 8 bpw del mismo modelo | 3.912.945.024 | 131.072 configurado | EXL3 6 y 8 bpw | Apache 2.0 | Hugging Face |
| Modelos Qwen3.5 de ~4B en otros formatos | no disponible | no disponible | GGUF, safetensors | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores en parametros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- El nombre del modelo induce a error: sugiere 9B parametros y referencias a DeepSeek y Qwen, pero los tensores reales suman 3.912.945.024 parametros y la unica base verificable es un checkpoint afinado sobre Qwen3.5.
- La variante "uncensored/heretic" reduce los rechazos del modelo base, lo que incrementa el riesgo de generar contenido danino, sesgado o inexacto; requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de sesgos; la evaluacion del autor se limita a diez ejercicios de codigo y a una metrica de fidelidad KL.
- La evaluacion de codigo es de una unica ejecucion por variante, con grader reconstruido (`reconstructed-base-plus-v1`) y no certificado EvalPlus, por lo que los 5/10 no deben interpretarse como rendimiento general.
- La torre de vision y las capas MTP no fueron validadas; su uso en produccion no esta respaldado por pruebas.
- El contexto de 131.072 tokens es un limite configurado en servidor/cache, no una validacion de que el modelo funcione correctamente a esa longitud.
- No se documentan idiomas soportados ni datos de entrenamiento, lo que impide evaluar cobertura multilingue o sesgos de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint base ni sobre el proceso de cuantizacion.
- El formato EXL3 limita el despliegue a ExLlamaV3 y TabbyAPI; no hay soporte nativo en llama.cpp, Ollama o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-5bpw
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Revision del modelo base usada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic/tree/e4bfa83c72896cbb4990c909967d6f27bb97bac4
- Manifiesto KL (referenciado en la model card): `evaluation/kl-manifest.json` dentro del repositorio
- ExLlamaV3: no disponible en la informacion proporcionada
- TabbyAPI: no disponible en la informacion proporcionada
