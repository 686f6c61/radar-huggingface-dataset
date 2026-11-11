# litert-community/gpt-oss-120b

## Resumen

`litert-community/gpt-oss-120b` es una conversión del modelo abierto de razonamiento de OpenAI `openai/gpt-oss-120b` al formato LiteRT-LM, empaquetada con `litert-lm-builder` 0.19.1 y ejecutable en CPU mediante la librería LiteRT-LM. No es un modelo nuevo: es una reimplementación capa a capa del decoder original usando la LiteRT Tensor API, con los pesos de los expertos re-cuantizados de MXFP4 a int4 y algunas simplificaciones en la activación. Su interés radica en que permite ejecutar un MoE de 117B parámetros (5,1B activos) en un equipo de sobremesa con suficiente memoria RAM, sin GPU, algo que el checkpoint original en formato Transformers no facilita.

El modelo conserva la arquitectura del original: 36 capas con atención alternando ventana deslizante de 128 tokens y atención completa, 128 expertos por capa con 4 activos por token, y el formato de chat harmony que separa el razonamiento (`analysis`) de la respuesta final (`final`). La conversión mantiene el tokenizador, la plantilla de chat (con cuatro modificaciones para el motor de plantillas de LiteRT-LM) y las cabeceras de canal, de modo que el contenido de la respuesta se expone por separado del razonamiento.

La relevancia práctica es acotada pero concreta: el artefacto ocupa 77,26 GB, se mapea entero en memoria y requiere entre 80 y 82 GB de RAM residente en las pruebas publicadas. Sobre un Apple M4 Max con 128 GB, el autor reporta 49,94 tokens/s de prefill y 4,75 tokens/s de decodificación con 1.024 tokens de prefill y 256 de generación. Es, por tanto, una vía para inferencia local en CPU de un modelo de razonamiento grande, no una alternativa de alto rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención alterna sliding-window (128 tokens) y full attention, 36 capas |
| Parámetros totales | 117B (según model card del modelo fuente) |
| Parámetros activos | 5,1B (4 de 128 expertos por token) |
| Longitud de contexto | 4.096 tokens (KV cache del artefacto); el modelo fuente soporta más, pero este artefacto fija 4.096 |
| Tipos de cuantización | Expertos int4 blockwise (bloque 32, escalas fp32); atención q/k/v/o y lm_head int8 per-channel; router, biases, sinks, norms y tabla de tokens en fp32; KV cache fp32 |
| Idiomas soportados | Inglés (`en` declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 77,26 GB |

## Arquitectura y entrenamiento

La arquitectura es la del `openai/gpt-oss-120b` original: un transformer de 36 capas con mezcla de expertos, 128 expertos por capa y 4 activos por token, con atención que alterna ventana deslizante de 128 tokens en capas pares y atención completa, y RoPE con configuración YaRN (factor 32). Los detalles de entrenamiento (número de tokens, composición del dataset, etapas de RLHF o DPO) no están disponibles en la información proporcionada; esta conversión no reentrena nada, solo transforma pesos.

Las innovaciones técnicas de esta conversión son de implementación, no de modelado. Cada capa se escribe tensor a tensor con la LiteRT Tensor API a partir del checkpoint en la revisión `b5c939de`, sin materializar una copia fp32 del modelo completo. Los 128 expertos de cada capa se agrupan en una única custom op `moe` que LiteRT ejecuta con XNNPACK en CPU, computando solo los 4 expertos enrutados por token. Los pesos MXFP4 de los expertos se re-cuantizan a int4 con escala fp32 por bloque de 32 valores, con un error RMS relativo del 5,8 al 6,6 % por tensor (media 6,0 %, sobre 108 tensores). La activación se simplifica: el original usa `(clamp(up, -7, 7) + 1) · g · σ(1.702 g)` con `g = min(gate, 7)`, mientras que este artefacto usa `(up + 1) · GELU_tanh(gate)` sin clamps, porque la op `moe` de LiteRT-LM 0.19.1 no soporta clamp ni SiLU. El autor documenta que esto provoca divergencias notables en capas tardías (del 21 al 66 % en L2 relativo desde la capa 6), aunque en la comparación de 12 preguntas con decodificación greedy las respuestas obtuvieron el mismo veredicto que el modelo fuente en las 12.

## Capacidades

- Generación de texto con razonamiento explícito en canal `analysis` separado de la respuesta `final` (formato harmony).
- Razonamiento multi-paso y cadenas de pensamiento, con el contenido de razonamiento accesible vía `channels["analysis"]` y `reasoning_content`.
- Soporte de tool calling y function calling a través de la plantilla harmony original, preservada con ajustes para LiteRT-LM.
- Conversaciones multi-turno con gestión de KV cache: el análisis se excluye del contexto antes del siguiente turno.
- Capacidades multilingües limitadas al inglés según la model card.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en CPU de un modelo de razonamiento grande: en un equipo con 128 GB de RAM (por ejemplo, Apple M4 Max) se puede ejecutar el modelo sin GPU, con 49,94 tokens/s de prefill y 4,75 tokens/s de decodificación, adecuado para prototipos y validación offline más que para producción interactiva.
- Evaluación de modelos de razonamiento en entornos sin GPU: investigadores que quieran reproducir o comparar el comportamiento del gpt-oss-120b original pueden usar esta conversión como referencia ejecutable en portátiles de gama alta o estaciones de trabajo.
- Procesamiento por lotes de tareas de razonamiento con contexto moderado: con 4.096 tokens de ventana y throughput de unos pocos tokens por segundo, encaja en trabajos nocturnos o pipelines asíncronos donde la latencia no es crítica.
- Asistencia a la programación en local: el modelo conserva las capacidades de generación de código del original y el soporte de tool calling, útil para integrarlo en editores o scripts de automatización que no pueden enviar datos a la nube.
- Análisis de documentos y resúmenes con razonamiento: la separación entre `analysis` y `final` permite auditar el razonamiento del modelo en tareas de extracción o clasificación, siempre que el documento quepa en 4.096 tokens.
- Experimentación con formatos de pesos alternativos: sirve como caso de estudio de conversión de un MoE MXFP4 a int4 con LiteRT, útil para equipos que evalúen desplegar modelos grandes en CPU con XNNPACK.
- Desarrollo de agentes simples con tool calling: la plantilla harmony adaptada permite construir flujos de llamada a herramientas en local, con la limitación del contexto de 4.096 tokens y la velocidad de decodificación baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de ejecución y una comparación cualitativa:

| Métrica | Valor |
|---|---|
| Prefill (Apple M4 Max, CPU, LiteRT-LM 0.19.1) | 49,94 tokens/s |
| Decodificación (mismas condiciones) | 4,75 tokens/s |
| Configuración de la prueba | 1.024 tokens de prefill / 256 de generación |
| Memoria residente pico (ejemplo Python) | 80,6 GB |
| Memoria residente pico (benchmark) | 82,1 GB |
| Tamaño del artefacto | 77,26 GB |
| Coincidencia de veredicto con el modelo fuente | 12/12 preguntas (greedy) |
| Error RMS relativo de expertos int4 vs MXFP4 | 5,8–6,6 % (media 6,0 %) |

## Requisitos de hardware

- RAM: al menos 80–82 GB residentes; el archivo de 77,26 GB se mapea entero en memoria y el proceso añade 5,5–7,0 GB.
- GPU: no se requiere GPU; la ejecución documentada es en CPU con XNNPACK. No hay datos de rendimiento en GPU para este artefacto.
- Cabe en equipos consumer de gama alta con 128 GB de memoria unificada (Apple M4 Max probado). No cabe en GPUs consumer de 24 GB ni en la mayoría de estaciones con 64 GB.
- Despliegue: LiteRT-LM 0.19.1 desde PyPI (versión mínima de runtime 0.19.0 según metadatos). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,75 tokens/s de decodificación en M4 Max; el prefill a 49,94 tokens/s implica que llenar el contexto de 4.096 tokens tarda del orden de 80 segundos.
- Nota sobre GPU: la op `moe` declara `activation='gelu_tanh'`, y el kernel GPU de LiteRT-LM 0.18 solo soporta `activation='gelu'`, por lo que la ruta GPU no es compatible con este artefacto tal como está.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|---|
| `litert-community/gpt-oss-120b` (este) | 117B | 5,1B | 4.096 | `.litertlm` int4/int8 | Apache 2.0 | Sí, LiteRT-LM |
| `openai/gpt-oss-120b` (fuente) | 117B | 5,1B | No disponible en la información proporcionada | Safetensors MXFP4 | Apache 2.0 | No documentado en esta información |
| Alternativas de menor tamaño (no especificadas) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Divergencia numérica respecto al modelo fuente: la activación sin clamps y la re-cuantización int4 de los expertos provocan diferencias del 21 al 66 % en L2 relativo desde la capa 6; aunque el veredicto coincidió en 12 de 12 preguntas, no hay garantía de equivalencia en tareas más exigentes.
- Contexto limitado a 4.096 tokens en este artefacto, inferior al que puede soportar el modelo fuente; documentos largos o conversaciones extensas requerirán truncado.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Riesgo de alucinación: inherente a los modelos de razonamiento; el canal `analysis` puede contener razonamientos plausibles pero incorrectos, y no debe tratarse como verificación.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto depende de LiteRT-LM 0.19.1 y de la op `moe` con `gelu_tanh`; verificar compatibilidad de licencias de las dependencias en producción.
- Rendimiento muy bajo para uso interactivo: 4,75 tokens/s de decodificación en el hardware probado; no apto para aplicaciones en tiempo real.
- Requisito de memoria elevado (80–82 GB residentes) que excluye la mayoría de equipos de desarrollo convencionales.
- La ruta GPU no está soportada por la configuración de activación de la op `moe` en LiteRT-LM 0.18; no se documenta una alternativa GPU.
- Solo 11 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; se heredan los del modelo fuente, no evaluados aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/gpt-oss-120b
- Modelo fuente: https://huggingface.co/openai/gpt-oss-120b
- Licencia del modelo fuente: https://huggingface.co/openai/gpt-oss-120b/blob/main/LICENSE
- LiteRT-LM en PyPI: no disponible en la información proporcionada (se menciona `litert-lm-builder` 0.19.1 y LiteRT-LM 0.19.1, sin URL)
- Paper, blog o demo: no disponible en la información proporcionada
