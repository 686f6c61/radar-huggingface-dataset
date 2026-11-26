# sigmanih/XHToken-Spark-X2.5-4B-GGUF

## Resumen

XHToken-Spark-X2.5-4B-GGUF es la distribucion en formato GGUF del modelo XHToken/Spark-X2.5-4B, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. Se trata de un modelo de generacion de texto de tipo causal (CausalLM) con 4.112.079.360 parametros, pensado para despliegue en dispositivos con recursos limitados. La version cuantizada Q4_K_M ocupa aproximadamente 2,6 GB en el repositorio, lo que lo hace viable en GPUs de consumo con 6-8 GB de VRAM o en CPU.

El modelo declara una ventana de contexto de 32.768 tokens y soporte para ingles e italiano, segun las etiquetas del repositorio. Su orientacion es conversacional y de agentes, con un protocolo de tool calling evaluado por el propio autor. La relevancia actual radica en su perfil de "edge model": un 4B que aspira a funcionar en tiempo real para agentes de voz y entornos con poca memoria, aunque los resultados publicados son modestos y deben interpretarse con cautela.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor. No hay paper, blog tecnico ni documentacion independiente sobre el entrenamiento, por lo que muchos datos de arquitectura y datos de entrenamiento quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer causal, detalles no disponibles) |
| Parametros totales | 4.112.079.360 (~4B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | Ingles (en), italiano (it) |
| Licencia | other (la model card muestra un badge Apache-2.0, pero el campo de licencia del repo es "other"; discrepancia sin aclarar) |
| Formato de pesos | GGUF |
| Modelo base | XHToken/Spark-X2.5-4B |
| Tamano del repositorio | 2,6 GB |
| VRAM estimada (offload completo) | ~4,0 GB |
| RAM estimada (CPU/hibrido) | ~3,6 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un CausalLM, es decir, un transformer decoder-only con atencion causal estandar. No se especifica si emplea atencion lineal, decodificacion especulativa, atencion por ventanas o alguna variante hibrida. Tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el vocabulario. La model card describe la variante GGUF como "optimizada y publicada" mediante el modulo Model Hub de Sigma Studio, sin aportar detalles sobre el proceso de cuantizacion mas alla del identificador Q4_K_M.

Respecto al entrenamiento, no se publican datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF, DPO o instruccion tuning. La unica informacion de evaluacion es la que el autor incluye en la model card, generada con su propio motor (SigmaEngine) y su propio protocolo (code_execution, continuation_logprob, cot_generation, letter_logprob, temperatura 0.0, semilla 42). No hay evidencia independiente que valide estos resultados. El modelo declara un modo de razonamiento "Deep Thinking" (chain-of-thought) frente a un modo directo "No-Thinking", con una diferencia declarada de +2,6 puntos porcentuales a favor del CoT.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos.
- Razonamiento con modo chain-of-thought opcional ("Deep Thinking") frente a respuesta directa ("No-Thinking").
- Tool calling y function calling: la model card reporta un 79,3% de adherencia al protocolo de herramientas en pruebas del propio autor.
- Ejecucion de tareas agente multi-paso en un sandbox de sistema de ficheros (creacion, inspeccion, modificacion y busqueda de archivos).
- Generacion de codigo en Python (evaluado con HumanEval y MBPP por el autor).
- Razonamiento matematico basico y de competicion (GSM8K y MATH en la evaluacion del autor).
- Capacidades multilingues limitadas a ingles e italiano segun las etiquetas del repositorio.
- No se declaran capacidades de vision, audio ni modalidades adicionales.

## Casos de uso

- Agentes de voz en tiempo real: el modelo cabe en ~4 GB de VRAM y esta pensado para latencia baja en modo directo, lo que permite integrarlo en pipelines de ASR + LLM + TTS en dispositivos edge o servidores modestos.
- Asistentes conversacionales en italiano e ingles: su ventana de 32.768 tokens permite mantener historiales de conversacion largos sin truncar, adecuado para atencion al cliente en esos dos idiomas.
- Automatizacion de tareas sobre sistemas de ficheros: la evaluacion del autor en sandbox muestra capacidad para crear, inspeccionar y modificar archivos mediante tool calling, util para scripts de mantenimiento o asistentes de desarrollo locales.
- Prototipado rapido en portatiles: con cuantizacion Q4_K_M y ~3,6 GB de RAM en modo CPU/hibrido, permite probar flujos de agentes sin GPU dedicada.
- Generacion de codigo asistida en entornos con restricciones de memoria: soporta Python y tool calling, por lo que puede integrarse en editores o pipelines ligeros, aunque su pass@1 reportado en HumanEval es del 57%.
- Filtrado y clasificacion de texto en produccion: su tamano reducido permite desplegar muchas instancias en paralelo para tareas de etiquetado, resumen o extraccion, con coste de inferencia bajo.
- Educacion y tutoria automatizada en matematicas basicas: el autor reporta buenos resultados en GSM8K (9/9 en su protocolo), lo que lo hace candidato para ejercicios de primaria y secundaria, con supervision humana.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card, generados con su propio motor y protocolo. No hay validacion independiente.

| Benchmark | Resultado reportado | Preguntas evaluadas |
|---|---|---|
| ARC-Challenge | 100% | 9/9 |
| BIG-Bench Hard | 100% | 7/7 |
| GPQA | 11% | 1/9 |
| GSM8K | 100% | 9/9 |
| HellaSwag | 33% | 3/9 |
| HumanEval (pass@1) | 57% | 4/7 |
| MATH | 67% | 6/9 |
| MBPP | 67% | 6/9 |
| MMLU | 36% | 5/14 |
| MMLU-Pro | 33% | 3/9 |
| TruthfulQA | 67% | 6/9 |
| Total agregado | 59% | 59/100 |

| Modo de ejecucion | Precision reportada | Preguntas superadas |
|---|---|---|
| No-Thinking (directo) | 57,9% | 33/57 |
| Deep Thinking (CoT) | 60,5% | 26/43 |

| Metrica de agente (sandbox) | Resultado |
|---|---|
| Adherencia al protocolo de herramientas | 79,3% (73/92 criterios) |
| Completitud autonoma de tareas | 50,0% (4/8 escenarios) |
| Contencion en sandbox | 100% conforme |
| Eficiencia de ejecucion | 84 turnos (164,5 s) |

Advertencia: los tamanos de muestra son muy pequenos (entre 7 y 14 preguntas por benchmark) y el protocolo es propio del autor, por lo que estos numeros no son comparables con evaluaciones estandar de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,0 GB con offload completo en GPU (cuantizacion Q4_K_M).
- RAM estimada en modo CPU o hibrido: ~3,6 GB.
- GPU recomendadas por el autor: GPU con 6-8 GB de VRAM, o 16 GB de RAM de sistema en modo CPU.
- Cabe en GPUs de consumo: si, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y similares; tambien en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; la model card menciona compatibilidad con endpoints y el motor propietario SigmaEngine.
- Latencia y throughput: no se publican cifras de tokens por segundo. La unica referencia temporal es la evaluacion de agente (164,5 s para 84 turnos en el entorno del autor), que no equivale a throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XHToken-Spark-X2.5-4B-GGUF | ~4B | 32.768 | other | GGUF | Evaluacion solo del autor, muestras pequenas |
| Qwen2.5-3B-Instruct | ~3B | 32.768 | Apache-2.0 | safetensors, GGUF | Amplia validacion comunitaria y benchmarks publicos |
| Llama-3.2-3B-Instruct | ~3B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, ecosistema amplio |
| Phi-3.5-mini-instruct | ~3,8B | 128.000 | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y codigo |

La comparativa se ofrece a nivel de categoria y especificaciones; no se dispone de resultados de benchmarks independientes del modelo XHToken que permitan una comparacion numerica fiable con estas alternativas.

## Limitaciones y advertencias

- Los benchmarks publicados proceden exclusivamente del autor, con protocolo propio y muestras de 7 a 14 preguntas por suite; no son estadisticamente representativos ni comparables con evaluaciones estandar.
- Resultados bajos en MMLU (36%), MMLU-Pro (33%), HellaSwag (33%) y GPQA (11%) sugieren conocimiento general y razonamiento avanzado limitados; riesgo alto de alucinacion en preguntas factuales o academicas.
- Solo se declaran ingles e italiano; no hay soporte documentado de castellano ni de otros idiomas.
- La licencia figura como "other" en el repositorio, aunque la model card muestra un badge Apache-2.0. Esta discrepancia debe resolverse antes de cualquier uso comercial; no se puede asumir Apache-2.0 sin confirmacion del autor.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que impide evaluar riesgos de sesgo sistematico.
- El modelo base (XHToken/Spark-X2.5-4B) no cuenta con documentacion tecnica publica verificable; la trazabilidad del entrenamiento es nula.
- En tareas de agente, la completitud autonoma reportada es del 50% (4/8 escenarios), lo que exige supervision humana en produccion.
- El contexto de 32.768 tokens es inferior al de alternativas contemporaneas de tamano similar (128K en Llama-3.2-3B o Phi-3.5-mini).
- El repositorio tiene muy poca traccion (273 descargas, 1 like en el momento de la consulta), lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/XHToken-Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio Sigma Studio en GitHub: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
- Repositorio citado en la model card (variante Q4_K_M): https://huggingface.co/sigmanih/XHToken-Spark-X2.5-4B-GGUF_Q4_K_M
