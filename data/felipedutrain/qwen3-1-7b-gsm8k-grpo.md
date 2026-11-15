# felipedutrain/qwen3-1.7b-gsm8k-grpo

## Resumen

Qwen3-1.7B-GSM8K-GRPO es un ajuste fino del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario felipedutrain, que aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) mediante LoRA sobre el split de entrenamiento del dataset GSM8K. El objetivo concreto del ajuste no es mejorar el razonamiento matematico, sino ensenar al modelo a responder en un formato fijo y legible por maquina (`#### <numero>` en la ultima linea) en modo no-thinking. Forma parte de un proyecto experimental que ejecuta el modelo en una PlayStation 4 mediante llama.cpp, tanto en CPU como en GPU a traves de Vulkan.

El modelo conserva la arquitectura transformer densa del Qwen3-1.7B original, con 1.720.574.976 parametros totales y licencia Apache 2.0. Su relevancia es doble: por un lado, demuestra que GRPO con LoRA puede imponer un formato de salida estricto sin degradar la precision en tareas de matematicas de primaria; por otro, documenta de forma muy detallada el efecto de la cuantizacion (Q4_K_M, Q5_K_M) sobre la precision flexible y estricta, con tests de McNemar y intervalos de confianza, algo poco habitual en model cards de ajustes pequenos.

El modelo esta pensado para inferencia en entornos con recursos muy limitados (CPU x86, GPU de PS4 via Vulkan) y como banco de pruebas para pipelines de RL aplicado a modelos pequenos. No sustituye al base en capacidades generales: es un especialista de formato sobre GSM8K y solo declara ingles como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 publicados; Q5_K_M evaluado pero no incluido en el repo |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,7 mil millones de parametros. Sobre el se aplica un ajuste fino con GRPO (variante de RL sin modelo de recompensa explicito, basada en comparaciones de grupo) usando LoRA, sobre el split de entrenamiento de GSM8K. El entrenamiento se realizo con Unsloth y TRL, segun las etiquetas del repositorio. El objetivo de recompensa premia la produccion del formato `#### <numero>` en la ultima linea, en modo no-thinking y con decodificacion greedy limitada a 320 tokens nuevos.

La innovacion tecnica destacable no esta en la arquitectura sino en la evaluacion: se comparan el base y el ajustado con prompts equivalentes, se usan tests exactos de McNemar emparejados sobre las mismas 1.319 preguntas del test de GSM8K, y se mide el efecto de la cuantizacion y del backend (CPU x86 frente a GPU de PS4 via Vulkan) por separado. Los resultados muestran que GRPO ensena el formato (strict del 75,8% frente al 67,1% del base con instruccion y 71,3% con 2-shot, p < 0,001) sin cambiar la precision flexible (76,3% frente a 76,6%, p = 0,81): no mejora el razonamiento, solo la adherencia al formato.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos de primaria (GSM8K) en modo no-thinking.
- Produccion de salida en formato fijo y parseable: ultima linea `#### <numero>`.
- Reduccion de respuestas truncadas: 19 truncamientos (1,4%) frente a 40 (3,0%) del base, con una media de 129,2 tokens por respuesta frente a 149,6.
- Conversacional: el repo incluye plantillas de chat (`chat_template_treinado.jinja` y `chat_template_neutro.jinja` para chat general).
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp para despliegue local.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo esta entrenado para respuestas directas en un unico paso de formato.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el ajuste se realiza explicitamente en modo no-thinking.

## Casos de uso

- Evaluacion de pipelines de RL sobre modelos pequenos: sirve como caso reproducible de GRPO con LoRA para estudiar como la recompensa de formato afecta la adherencia sin alterar la precision, usando los tests emparejados de la model card como referencia.
- Inferencia en hardware muy limitado: el GGUF Q4_K_M (1,11 GB) se ejecuta en una PS4 via Vulkan con 11,2 s por respuesta, 1,56x mas rapido que la CPU de la consola, con la misma precision flexible que en CPU (72,9%, n = 1.319, p = 1,0).
- Extraccion de respuestas numericas en pipelines automatizados: el formato `#### <numero>` facilita el parseo en sistemas de correccion automatica de ejercicios de matematicas de primaria, con una tasa de formato estricto del 75,8% en precision completa.
- Benchmarking de cuantizacion: el repositorio documenta el impacto de Q4_K_M (perdida de ~3,4 puntos de precision flexible, p = 0,003) y de Q5_K_M (no significativo frente a precision completa, p = 0,15), util para decidir el nivel de cuantizacion en produccion.
- Despliegue en CPU x86 de bajo coste: con llama.cpp y Q4_K_M sobre un Intel i5-10300H (4 hilos) se obtiene 72,9% de precision flexible, adecuado para servicios por lotes sin GPU.
- Prototipado de asistentes de matematicas con plantilla de chat neutra: la plantilla `chat_template_neutro.jinja` permite reutilizar el modelo en conversacion general manteniendo el ajuste de formato cuando se necesita.

## Benchmarks y rendimiento

Resultados sobre el test completo de GSM8K (n = 1.319), decodificacion greedy, modo no-thinking, maximo 320 tokens nuevos. Strict = la ultima linea `#### <numero>` coincide con la referencia; flexible = strict si existe, si no el ultimo numero del output.

| Modelo / configuracion | Strict | Flexible (IC 95%) | Tokens medios | Truncados |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 2,9% | 76,6% (74,2-78,8) | 149,6 | 40 (3,0%) |
| Este modelo (precision completa) | 75,8% | 76,3% (73,9-78,5) | 129,2 | 19 (1,4%) |
| Base + prompt de instruccion | 67,1% (64,5-69,6) | 75,2% (72,8-77,5) | 127,8 | no disponible |
| Base + 2-shot | 71,3% (68,8-73,6) | 72,0% (69,5-74,4) | 89,4 | no disponible |
| Este modelo, Q5_K_M (CPU portatil) | 57,6% (54,9-60,3) | 74,8% (72,3-77,0) | 135,0 | 25 |
| Este modelo, Q4_K_M (CPU portatil) | 63,2% (60,5-65,7) | 72,9% (70,4-75,2) | 132,2 | 17 |
| Este modelo, Q4_K_M (GPU PS4, Vulkan) | 66,8% (64,2-69,3) | 72,9% (70,5-75,3) | 131,2 | 24 |

Comparaciones emparejadas destacadas:

| Comparacion | Delta flexible (IC 95%) | McNemar flexible | Delta strict | McNemar strict |
|---|---|---|---|---|
| Q4_K_M PS4 GPU - precision completa | -3,3 (-5,5 a -1,2) | p = 0,003 | -9,0 | p < 0,001 |
| Q4_K_M portatil - precision completa | -3,4 (-5,6 a -1,2) | p = 0,003 | -12,7 | p < 0,001 |
| Q4_K_M portatil - Q4_K_M PS4 GPU | -0,1 (-1,8 a +1,7) | p = 1,0 | -3,6 | p = 0,001 |
| Q5_K_M - precision completa | -1,5 (-3,5 a +0,5) | p = 0,15 | -18,2 | p < 0,001 |
| Q5_K_M - Q4_K_M portatil | +1,9 (-0,3 a +4,1) | p = 0,10 | -5,5 | p < 0,001 |

Formato: +8,6 puntos strict frente al prompt de instruccion (186 frente a 73 discordantes, p < 0,0001) y +4,4 frente al 2-shot (158 frente a 100, p = 0,0004). Precision flexible: empatada con instruccion (96 frente a 83, p = 0,37); el 2-shot acorta respuestas un 30% pero pierde 4,2 puntos (153 frente a 98, p = 0,0006). No se han publicado resultados de otros benchmarks (MMLU, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: el GGUF Q4_K_M ocupa 1,11 GB y el Q8_0 1,83 GB; la precision completa en PyTorch requiere aproximadamente 3,5 GB en fp16 (estimacion a partir de 1.720.574.976 parametros).
- GPU recomendadas: no se especifican en la model card; el unico backend GPU documentado es Vulkan sobre la GPU de una PlayStation 4.
- Cabe en GPU de consumo: si, por el tamano (1,7B parametros); los GGUF Q4_K_M y Q8_0 son adecuados para GPUs con 2-4 GB de VRAM.
- CPU: validado en Intel i5-10300H con 4 hilos, sin GPU.
- Opciones de despliegue: llama.cpp (commit `dde879bc`, usado para la conversion y evaluacion), formato GGUF compatible con Ollama y otros runners de llama.cpp; tag `endpoints_compatible` en Hugging Face.
- Latencia y throughput: 11,2 s por respuesta en GPU de PS4 via Vulkan con Q4_K_M, 1,56x mas rapido que la CPU de la misma consola en las primeras 100 preguntas del test. No se documentan latencias para GPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K flexible | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | no disponible | 76,6% (precision completa) | apache-2.0 | Hugging Face |
| Este modelo (Qwen3-1.7B-GSM8K-GRPO) | 1,7B | no disponible | 76,3% (precision completa), 72,9% (Q4_K_M) | apache-2.0 | Hugging Face, GGUF |
| Base + prompt de instruccion | 1,7B | no disponible | 75,2% | apache-2.0 | Hugging Face |
| Base + 2-shot | 1,7B | no disponible | 72,0% | apache-2.0 | Hugging Face |

La comparativa relevante es contra el propio base y sus variantes de prompting, porque la model card no incluye otros modelos de referencia. La diferencia principal no esta en la precision sino en la adherencia al formato estricto (75,8% frente a 67,1% y 71,3%) y en el numero de respuestas truncadas (1,4% frente a 3,0% del base).

## Limitaciones y advertencias

- No mejora el razonamiento: la precision flexible es estadisticamente igual a la del base (76,3% frente a 76,6%, p = 0,81); solo impone el formato.
- El formato es fragil ante cuantizacion: la precision strict oscila entre 57,6% y 66,8% segun cuantizacion y backend, sin orden por precision, mientras la flexible se mantiene dentro de ~2 puntos.
- Q4_K_M pierde ~3,4 puntos de precision flexible frente a precision completa (p = 0,003); Q5_K_M no difiere significativamente de ninguno de los dos (p = 0,10 y p = 0,15), pero su archivo no esta publicado en el repositorio.
- Idioma: solo ingles declarado; no se documenta soporte multilingue.
- Ambito limitado: entrenado sobre GSM8K (matematicas de primaria); no hay evidencia de generalizacion a otros dominios o a matematicas de mayor nivel.
- Modo no-thinking: el ajuste se realiza explicitamente en modo no-thinking, por lo que no se recomienda su uso en escenarios que requieran cadena de pensamiento extendida.
- Riesgo de alucinacion: no evaluado en la model card; el modelo puede producir numeros plausibles pero incorrectos, especialmente en cuantizaciones bajas.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3-1.7B y conviene revisar las condiciones del base.
- Proyecto experimental con 47 descargas y 0 likes en el momento de la consulta; no hay garantia de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felipedutrain/qwen3-1.7b-gsm8k-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Commit de llama.cpp usado para conversion y evaluacion: https://github.com/ggml-org/llama.cpp/commit/dde879bc4f954b809892fd0d660515f42536394a
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
