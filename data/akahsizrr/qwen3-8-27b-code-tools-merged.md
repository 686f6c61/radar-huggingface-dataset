# Akahsizrr/Qwen3.8-27B-Code-Tools-Merged

## Resumen

Qwen3.8-27B-Code-Tools-Merged es un checkpoint completo (full merged) publicado por el usuario Akahsizrr sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un entrenamiento desde cero ni de un modelo oficial de la familia Qwen, sino de la fusión secuencial de tres adaptadores LoRA orientados a código, razonamiento y tool calling dentro de los pesos del modelo base. El resultado es un único artefacto de 26.895.998.464 parámetros (unos 26,9 B) que se distribuye en safetensors dentro de un repositorio de 53,8 GB, coherente con pesos en bfloat16.

Su relevancia es muy acotada: es un experimento de la comunidad, con cero descargas y cero likes en el momento de la consulta, pensado para quien quiera reproducir un pipeline de fusión de adaptadores sobre Qwen3.8 y obtener un modelo con buen comportamiento en tareas de generación de código con tool calling. El único dato de evaluación publicado es LiveCodeBench v6, donde la pila de adaptadores alcanza un 76,0 % de pass@1 (133/175 problemas) con dos adaptadores y un 75,4 % (132/175) incluyendo el tercero.

La licencia declarada es Apache-2.0, lo que en principio facilita el uso comercial, pero conviene verificar las condiciones del modelo base y asumir que no hay información publicada sobre idiomas soportados, alineación de seguridad ni evaluación multilingüe. Es, en definitiva, un modelo de interés para desarrolladores que trabajan con code assistants y pipelines de agentes, no para despliegues de propósito general sin validación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen (tag de arquitectura: `qwen3_5_text`); detalles de capas y atención no disponibles |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | No aplica (no se documenta que sea MoE) |
| Longitud de contexto | No disponible como especificación del modelo. El ejemplo oficial de vLLM configura `max_model_len=36864` |
| Tipos de cuantizacion | No disponible. El repositorio contiene safetensors; el ejemplo de uso emplea `dtype="bfloat16"` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16; repositorio de 53,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de la familia Qwen. La etiqueta de arquitectura declarada en el repositorio es `qwen3_5_text`, lo que apunta a la implementación de texto de la serie Qwen3.5, aunque no se publican detalles sobre número de capas, cabezas de atención, uso de atención lineal o híbrida, ni configuración de RoPE. El dato verificable es el recuento real de parámetros en safetensors: 26.895.998.464, que situaría al modelo en la franja de 27 B densos.

El proceso de construcción no es un entrenamiento supervisado completo, sino una fusión de adaptadores en tres pasos sobre el base: primero `Akahsizrr/qwen3.8-27b-lora-xhigh-code-tools-1k`, después `Akahsizrr/qwen3.8-27b-lora-kimi-k3-tools-code-instr` y finalmente `Akahsizrr/qwen3.8-27b-lora-comp-v1`. No se documentan el volumen de tokens de entrenamiento de cada adaptador, la composición del dataset, ni si hubo fases de RLHF, DPO o preferencias. Sí se documenta el uso de un modo de razonamiento de esfuerzo alto (`reasoning_effort: xhigh`) y la emisión del razonamiento entre las etiquetas `<tool_call>` y `</think>`, un detalle de plantilla de chat que conviene tratar con cautela porque la nomenclatura es ambigua y el autor no la detalla más.

Como innovación técnica destacable solo cabe señalar la propia metodología de merge: los adaptadores se integran en los pesos base y se publica un checkpoint único listo para servir, en lugar de requerir la carga del modelo más los LoRA por separado. El resultado declarado en LiveCodeBench v6 muestra que el tercer adaptador no aporta mejora, sino un ligero descenso (de 76,0 % a 75,4 %), por lo que la configuración de dos adaptadores parece preferible según los propios datos del autor.

## Capacidades

- Generación de texto conversacional, con foco declarado en código y razonamiento.
- Generación y completado de código, con evaluación específica en LiveCodeBench v6 (175 problemas, pass@1).
- Razonamiento multi-paso mediante un modo de esfuerzo configurable (`reasoning_effort: xhigh` en el ejemplo oficial).
- Tool calling / function calling, según los tags `tool-calling` y `code` del repositorio y los datasets de instrucciones de herramientas usados en los adaptadores.
- Capacidades de agente: la combinación de razonamiento extendido y tool calling permite encadenar llamadas a herramientas, aunque no hay documentación sobre formato de herramientas, esquemas JSON soportados ni número máximo de pasos.
- Capacidades multilingües: no disponibles. No se declara lista de idiomas ni evaluación multilingüe.
- Capacidades especiales: modo de razonamiento explícito con etiquetas propias. No se documentan visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código en IDE: el modelo puede completar y refactorizar funciones dentro de un contexto configurable de hasta 36.864 tokens, lo que permite enviar varios ficheros de un mismo módulo y mantener el hilo de una sesión de edición larga.
- Generación de tests automáticos: dado un fichero de código, el modo de razonamiento extendido facilita producir casos de prueba razonados; es adecuado porque el fine-tune está entrenado sobre instrucciones de código y tool calling.
- Resolución de problemas de programación competitiva: el resultado publicado en LiveCodeBench v6 (76,0 % pass@1 con dos adaptadores) lo sitúa como candidato para evaluar pipelines de generación de soluciones, siempre con validación por ejecución.
- Agente de automatización de tareas de desarrollo: combinando tool calling con razonamiento multi-paso, puede invocarse desde un orquestador para consultar APIs, leer ficheros y proponer parches en un flujo de CI/CD.
- Asistente de revisión de código en pull requests: con contexto largo se le pueden pasar el diff y los ficheros afectados para generar comentarios estructurados; el soporte de tool calling permite además consultar el repositorio durante la revisión.
- Migración y traducción entre lenguajes de programación: el modelo puede reescribir código entre lenguajes manteniendo la lógica, un caso típico de los adaptadores de instrucciones de código, aunque no hay evaluación publicada de calidad por lenguaje.
- Servicio interno de preguntas técnicas sobre una base de código: desplegado con vLLM y caché de prefijo activada, se puede reutilizar el mismo contexto de repositorio entre consultas para reducir el coste de prefill.
- Evaluación comparativa de fusiones LoRA: el repositorio sirve como caso de estudio reproducible para medir el efecto de añadir o quitar adaptadores sobre un benchmark objetivo.

## Benchmarks y rendimiento

Único benchmark publicado por el autor: LiveCodeBench v6 sobre `test6.jsonl`, 175 problemas, pass@1 con n=1, temperatura 0,2, top_p 0,95, max_tokens 32768, esfuerzo de razonamiento `xhigh`, servido con vLLM 0.28.0.

| Configuracion | Pass@1 | Problemas resueltos |
|---|---|---|
| Adaptadores 1+2 (sin comp-v1) | 76,0 % | 133/175 |
| Pila completa de 3 adaptadores (1+2+comp-v1) | 75,4 % | 132/175 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información disponible, ni comparaciones contra modelos de referencia medidos bajo el mismo protocolo. Al ser una única ejecución con n=1, no se reporta intervalo de confianza ni varianza entre muestras.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento real de parámetros (26,9 B; ≈53,8 GB en bfloat16) y no están publicadas por el autor.

- Inferencia en bfloat16: aproximadamente 54 GB solo para pesos, más caché KV y activaciones. No cabe en ninguna GPU de consumo.
- GPU recomendadas en bf16: una H100 80 GB o A100 80 GB con contexto moderado; para el contexto de 36.864 tokens del ejemplo conviene repartir en 2 GPU de 48 GB o más (por ejemplo, 2x A6000, 2x L40S o 2x A100 40 GB con paralelismo de tensor).
- Inferencia en fp8/int8 (estimación): alrededor de 27 GB de pesos, viable en una A100 40/80 GB, H100 o RTX 6000 Ada 48 GB.
- Inferencia en int4 (estimación): alrededor de 14-15 GB de pesos, potencialmente ejecutable en RTX 4090, RTX 3090 o L40S de 24 GB, pero con contexto recortado. Requiere una cuantización que el repositorio no incluye; habría que generarla.
- Consumer GPU: solo con cuantización agresiva y contexto reducido; el checkpoint publicado en bf16 no cabe en ninguna GPU de consumo.
- Opciones de despliegue documentadas: vLLM 0.28.0 (ejemplo oficial con `max_model_len=36864`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=True`) y transformers como librería declarada. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni motores de cuantización tipo GGUF/AWQ/GPTQ.
- Latencia y throughput: no disponibles. Dependerán del hardware, del número de GPU y del esfuerzo de razonamiento configurado, que en el ejemplo oficial genera hasta 32.768 tokens de salida y penaliza fuertemente la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akahsizrr/Qwen3.8-27B-Code-Tools-Merged | 26,9 B | no disponible (ejemplo con 36.864) | LiveCodeBench v6: 76,0 % (1+2 adaptadores) | Apache-2.0 | Repositorio propio, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 26,9 B | no disponible | no disponible para esta comparación | No disponible en la información proporcionada | Modelo base referenciado por el autor |
| Akahsizrr/qwen3.8-27b-lora-xhigh-code-tools-1k | Adaptador LoRA | No aplica | No disponible | No disponible | Adaptador, requiere el base |
| Akahsizrr/qwen3.8-27b-lora-kimi-k3-tools-code-instr | Adaptador LoRA | No aplica | No disponible | No disponible | Adaptador, requiere el base |
| Akahsizrr/qwen3.8-27b-lora-comp-v1 | Adaptador LoRA | No aplica | No disponible | No disponible | Adaptador, requiere el base |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores de la misma franja de parámetros o de la misma tarea, porque no hay benchmarks medidos bajo protocolo común ni especificaciones de contexto publicadas para este modelo.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, y creado y actualizado con minutos de diferencia, lo que impide asumir reproducibilidad o mantenimiento.
- Benchmark limitado: el único resultado es LiveCodeBench v6 con n=1 sobre 175 problemas, sin intervalos de confianza ni repeticiones; la diferencia entre 76,0 % y 75,4 % (un solo problema) es estadísticamente irrelevante, luego no puede concluirse que el tercer adaptador mejore o empeore el modelo.
- Riesgo de regresión por fusión de adaptadores: al integrar tres LoRA secuencialmente sin evaluación generalista publicada, pueden haberse degradado capacidades ajenas a código y herramientas (conversación general, multilingüismo, matemáticas).
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación en castellano. No debe asumirse un rendimiento multilingüe equivalente al del modelo base.
- Ambigüedad en la plantilla de chat: el autor indica que el razonamiento se emite entre `<tool_call>` y `</think>`, una nomenclatura poco habitual que puede provocar errores de parseo en orquestadores de agentes si no se adapta el extractor.
- Discrepancia de etiquetas: el tag de arquitectura es `qwen3_5_text` mientras que el modelo base declarado es Qwen/Qwen3.8-27B; conviene verificar la compatibilidad con la versión concreta de transformers y con la implementación de atención esperada.
- Contexto no confirmado: los 36.864 tokens proceden de una configuración de vLLM, no de una especificación del modelo; usar valores superiores sin verificar puede provocar degradación silenciosa.
- Licencia: Apache-2.0 en el repositorio, pero al derivar de un modelo base hay que comprobar los términos aplicables a Qwen/Qwen3.8-27B antes de un uso comercial.
- Alineación de seguridad no documentada: no hay información sobre filtrado de contenido, rechazo de peticiones dañinas ni evaluación de sesgos.
- Coste de inferencia elevado en modo `xhigh`: permitir hasta 32.768 tokens de salida con razonamiento explícito multiplica la latencia y el coste por consulta en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/Qwen3.8-27B-Code-Tools-Merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador 1: https://huggingface.co/Akahsizrr/qwen3.8-27b-lora-xhigh-code-tools-1k
- Adaptador 2: https://huggingface.co/Akahsizrr/qwen3.8-27b-lora-kimi-k3-tools-code-instr
- Adaptador 3: https://huggingface.co/Akahsizrr/qwen3.8-27b-lora-comp-v1
- Paper, blog o repositorio adicional: no disponible. La búsqueda web realizada no devolvió resultados relacionados con este modelo.
