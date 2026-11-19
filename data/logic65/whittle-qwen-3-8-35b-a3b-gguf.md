# logic65/Whittle-Qwen-3.8-35B-A3B-GGUF

## Resumen

Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por David Aylward (logic65) con asistencia de Claude (Anthropic). Se trata de un modelo de 35.547.542.656 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, destilado a nivel de logit desde Qwen3.8-27B sobre 25.000 trazas verificadas del profesor. Su innovación principal es una memoria de n-gramas de 10.000 millones de parámetros que es estructuralmente necesaria: el cuerpo del modelo depende de ella de forma medible, y eliminarla degrada el conocimiento del modelo de forma análoga a perder su base de conocimiento.

El repositorio que nos ocupa contiene únicamente las cuantizaciones GGUF listas para ejecutar en llama.cpp, sin parches, del checkpoint p2-s32010 (30 de septiembre de 2026) del modelo base. La arquitectura declarada es `qwen4exp` (formato Qwen3.8-Flash-Next) y está pensada para ejecutarse con la tabla de memoria en RAM del sistema y el resto del modelo en GPU, lo que reduce la huella en VRAM a la de un modelo de clase 27B con velocidad de generación de 3B activos.

El modelo está orientado a razonamiento con modo thinking, código, matemáticas, uso de herramientas y conversación multilingüe (inglés, chino y otros idiomas). La licencia es Apache 2.0 en todos los componentes de la cadena (modelo base, profesor y memoria).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con memoria de n-gramas condicional; arquitectura `qwen4exp` (formato Qwen3.8-Flash-Next) |
| Parámetros totales | 35.547.542.656 (35,5 B) |
| Parámetros activos | ~3 B (aproximado, según model card: "~3 B-active") |
| Longitud de contexto | No disponible (el ejemplo de despliegue usa `-c 16384`) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en el repo base |

## Arquitectura y entrenamiento

El modelo es un mixture-of-experts con 35,5 B de parámetros totales y aproximadamente 3 B activos por token, construido sobre Whittle-Next-27B-A3B y con formato de arquitectura `qwen4exp`. La pieza diferencial es una memoria de n-gramas de 10 B de parámetros (una fila por token y por cabeza, implementada como `per_layer_token_embd`) que actúa como tabla de consulta y es load-bearing: el cuerpo del modelo necesita esa memoria para rendir, y un build que la elimine o la re-hashee se comporta como el padre v4.4 sin su conocimiento. En Q8 la memoria ocupa unos 10,5 GB de cada fichero, proporcionalmente menos en cuantizaciones inferiores.

El entrenamiento combina una fase de destilación a nivel de logit desde Qwen3.8-27B sobre 25.000 trazas verificadas del profesor (dataset `logic65/whittle-distill-qwen3.8-27b`), una fase de memoria y un ajuste de 410 pasos para corregir las herramientas de navegador de la página web de llama.cpp. El checkpoint publicado es el paso 32010 de la fase 2, en el que cada fila usable del profesor se ha visto una vez. El contenido de la memoria proviene de Qwen3.8-Flash-Next. La model card no detalla la composición completa del dataset ni si hubo RLHF o DPO; sí indica que el modelo fue destilado sobre trazas de thinking completas, lo que explica su comportamiento en modo thinking.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat que acepta mensajes de sistema en cualquier posición de la conversación (compatible con Claude Code).
- Razonamiento con modo thinking activable mediante `chat_template_kwargs: {"enable_thinking": true}`; el modelo rinde mejor con thinking activado.
- Código y matemáticas: evaluado en GSM8K, un probe de MATH y generación de JSON estricto.
- Uso de herramientas y function calling: 96/96 en los probes de tool-use del autor, con soporte para episodios de agente multi-paso.
- Integración con herramientas de navegador de la página web de llama.cpp (31/36 chats retenidos con las herramientas activas).
- Multilingüe: inglés, chino y otros idiomas.
- Salida de razonamiento separable mediante `--reasoning-format deepseek`, que expone el thinking en `reasoning_content`.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistentes de código en terminal: el modelo acepta mensajes de sistema en cualquier punto de la conversación, por lo que funciona con Claude Code, que envía su bloque de entorno después del turno de usuario. Adecuado para tareas de edición y refactorización con contexto de repositorio.
- Agentes con tool calling: los 96/96 en probes de tool-use y la recomendación de conservar el `reasoning_content` de cada turno del asistente durante el episodio lo hacen apto para flujos multi-paso con llamadas a funciones encadenadas.
- Automatización de atención al cliente multi-turno: la ventana de contexto (16k en el ejemplo de despliegue) permite mantener historiales largos de conversación con instrucciones de sistema persistentes.
- Generación de JSON estricto para pipelines: los 72/72 exactos en el hold-out de JSON estricto lo hacen utilizable para extracción de datos estructurados y validación de esquemas en producción.
- Razonamiento matemático asistido: 43/50 en GSM8K no visto y 46/60 en el probe de MATH, con la recomendación de asignar `max_tokens` de 8192 o más en matemáticas para aprovechar el thinking.
- Investigación sobre arquitecturas con memoria externa: al ser un modelo con memoria de n-gramas load-bearing y licencia Apache 2.0, sirve como banco de pruebas reproducible para estudiar el efecto de memorias condicionales en modelos MoE.
- Despliegue en hardware de consumo: con la memoria en RAM del sistema y el cuerpo en una GPU de 16-24 GB, permite ejecutar un modelo de clase 35B en estaciones de trabajo domésticas.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el fichero Q8_0 (los del modelo base se midieron sobre una conversión en Colab del mismo checkpoint y se verificaron por muestreo):

| Benchmark | Resultado |
|---|---|
| Batería de stop/loop | 23/24 |
| GSM8K (no visto) | 43/50 |
| Probe MATH | 46/60 |
| JSON estricto (hold-out) | 72/72 exactos |
| Probes de tool-use | 96/96 |
| Chats retenidos en la web de llama.cpp con herramientas de navegador | 31/36 (paso anterior a la corrección: 15/36) |
| Bug-report JSON (grader del modelo base) | 12/12 |
| Replay de chat de página web | 19/20 y 16/20 |
| Herramientas inventadas | 0 |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con la memoria en RAM del sistema (`-ot per_layer_token_embd=CPU`), la GPU solo aloja el cuerpo, con una huella de clase 27B. Sin ese desplazamiento, el Q8_0 ocupa 37,8 GB y el Q4_K_M 21,3 GB.
- GPU recomendadas: una RTX 4090 o similar de 24 GB para Q5_K_M con la memoria en RAM; tarjetas de 16-20 GB para Q4_K_M; A100/H100 no son necesarias pero permiten servir cuantizaciones mayores íntegramente en GPU.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q5_K_M, Q4_K_M y Q3_K_M y la memoria en RAM del sistema. El autor menciona haber convertido el modelo en una máquina con 3× RTX 3060.
- Opciones de despliegue: llama.cpp (`llama-server`), con `--jinja`, `-fa on` y `-ot per_layer_token_embd=CPU`. En builds con `--lazy-mode` (posteriores al 30 de agosto de 2026) hay que añadir `--lazy-mode off` para que la tabla se cargue en RAM. Para tarjetas pequeñas se pueden mover también los expertos enrutados a RAM con `-ot "\.ffn_(up|down|gate)_exps\.=CPU"`.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que la generación corre a velocidad de 3B activos cuando la memoria está en RAM.
- Muestreo obligatorio: `temperature 0.7, top_p 0.8, top_k 20, repeat_penalty 1.05`; la decodificación greedy entra en bucles en esta familia de modelos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B | 35,5 B | ~3 B | No disponible | Apache 2.0 | GGUF |
| Qwen3.8-27B (profesor) | 27 B | No aplica (denso) | No disponible | No disponible en la información | No disponible |
| Whittle-Next-27B-A3B (padre) | No disponible | ~3 B | No disponible | Apache 2.0 | No disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la model card solo indica que el padre v4.4 sin su memoria se comporta como un modelo sin conocimiento.

## Limitaciones y advertencias

- La memoria de n-gramas es load-bearing: servir el modelo sin la tabla completa o con un build que la elimine o re-hashee degrada el conocimiento de forma severa.
- La decodificación greedy provoca bucles; es obligatorio muestrear con los parámetros indicados.
- El modo thinking consume muchos tokens: se recomienda `max_tokens` de 4096 o más para código y 8192 o más para matemáticas.
- En Q3_K_M se espera cierta pérdida en matemáticas según el propio autor.
- En builds de llama.cpp con `--lazy-mode` la tabla se lee de disco de forma perezosa y `-ot` se ignora, lo que ralentiza el procesamiento de prompts.
- La arquitectura `qwen4exp` requiere una versión de llama.cpp que la reconozca; versiones antiguas fallan con arquitectura desconocida.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; como modelo destilado de Qwen3.8-27B, hereda los sesgos del profesor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo está en fase de investigación activa (checkpoint p2-s32010) y los pesos pueden cambiar entre publicaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Modelo padre: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Contenido de la memoria: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de destilación: https://huggingface.co/datasets/logic65/whittle-distill-qwen3.8-27b
- Apoyo al autor: https://ko-fi.com/davida81328
