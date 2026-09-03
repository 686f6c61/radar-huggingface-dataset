# SmallAICreator/AuroraGPT-Think-v3

## Resumen

AuroraGPT-Think-v3 es un modelo de lenguaje de 707 millones de parámetros desarrollado por UltraLabs, entrenado mediante ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base AuroraGPT-Qwen-Distill. Su característica principal es que razona de forma explícita en un bloque ` thinking... response` en el 100% de las respuestas, sin compuerta de activación que pueda fallar. Está diseñado para ejecución en dispositivos locales (on-device) y se distribuye con licencia Apache 2.0.

El modelo aborda el problema de los modelos pequeños que razonan de forma inconsistente: la versión anterior entrenaba una división 73/27 entre respuestas con y sin razonamiento, y aprendió una compuerta invertida que omitía el razonamiento precisamente en los prompts más difíciles. AuroraGPT-Think-v3 elimina esa compuerta y fuerza el razonamiento en todas las respuestas, lo que garantiza que el proceso de pensamiento siempre esté presente, aunque la calidad del resultado final dependa de la capacidad aritmética del modelo.

La relevancia actual de este modelo radica en su enfoque honesto y medible: la propia ficha del modelo documenta sus limitaciones con datos concretos, incluyendo un rendimiento del 2,5% en GSM8K, y propone una arquitectura de uso correcta que delega el cálculo numérico en herramientas externas. Esto lo convierte en un caso de estudio interesante para desarrolladores que trabajan con modelos pequeños de razonamiento y necesitan entender qué funciona y qué no en la práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B destilada) |
| Parametros totales | 707.480.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF incluido, 753 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

AuroraGPT-Think-v3 es un modelo transformer de 707M parámetros, destilado a partir de Qwen3-4B y ajustado con SFT de parámetros completos. El entrenamiento se realizó en un Kaggle TPU v5e-8 con JAX/Flax y optax, usando GSPMD sharding, durante 806 pasos y 2 épocas sobre 26,4 millones de tokens, con una pérdida que descendió de 0,6619 a 0,2716 en 8,8 minutos.

El corpus de entrenamiento consta de 54.238 conversaciones, todas con bloque de razonamiento. La composición es: 44% matemáticas (MetaMathQA, GSM8K, Orca-Math, OpenR1 verificado), 19% chat (SmolTalk y turnos triviales), 13% código (CodeAlpaca y MBPP) y 25% ejercicios dirigidos (multiplicación distributiva, relojes, silogismos, trampas de álgebra y problemas multi-paso). Todas las 13.326 respuestas generadas proceduralmente fueron revalidadas en Python con cero discrepancias, tras un error previo que introdujo 96 respuestas incorrectas por división entera.

Una innovación técnica destacable es el uso de bloques de razonamiento sintetizados para aproximadamente 10.000 turnos de chat como stubs de replanteo y planificación, que representan el 18% del corpus. Sin embargo, esto también es una fuente de defectos conocidos, ya que estos stubs a veces reemplazan el razonamiento real en prompts matemáticos.

## Capacidades

- Razonamiento explícito: genera un bloque ` thinking` en el 100% de las respuestas, sin compuerta que pueda fallar.
- Razonamiento estructuralmente sólido: convierte correctamente horas de reloj, encadena silogismos y detecta la trampa del bate y la pelota antes de responder.
- Verificación en lugar de divagación: no fabrica errores para "cazarlos"; la versión anterior aprendió a revisar respuestas ya correctas, comportamiento que se ha eliminado.
- Herramientas (tool calling): el modelo base tiene capacidad de tool calling funcional, con 15/15 llamadas válidas en pruebas con distintas redacciones de system prompt.
- Chat conversacional: hereda el estilo de chat del modelo base destilado Qwen3-4B.
- Formato de chat: usa el formato `<|system|>{system}<|end|><|user|>{user}<|end|><|assistant|>{reply}<|end|>` con EOS `<|end|>` (id 5).
- Ejecución on-device: incluye un archivo GGUF Q8_0 de 753 MB compatible con llama.cpp y aplicaciones de chat GGUF.

## Casos de uso

- Asistente educativo de matemáticas con calculadora integrada: el modelo razona el planteamiento del problema en el bloque ` thinking` y delega el cálculo numérico en una herramienta de calculadora, evitando el defecto aritmético del tokenizador. Es adecuado porque su razonamiento estructural es correcto aunque los dígitos fallen.
- Tutor de lógica y razonamiento: puede explicar silogismos, detectar trampas lógicas y guiar al estudiante paso a paso, gracias a su capacidad de encadenar razonamientos correctamente.
- Generación de código asistida con verificación externa: soporta tool calling y puede integrarse en un pipeline donde el código generado se ejecuta y valida automáticamente, compensando sus limitaciones en tareas aritméticas.
- Chat conversacional en dispositivos con recursos limitados: con 753 MB en cuantización Q8_0, puede ejecutarse en portátiles, Raspberry Pi o teléfonos, ofreciendo un asistente conversacional con razonamiento visible.
- Prototipado de agentes con razonamiento visible: su formato de razonamiento explícito permite depurar el proceso de pensamiento del agente, ya que cada decisión queda documentada en el bloque ` thinking`.
- Investigación sobre modelos pequeños de razonamiento: su documentación honesta y sus datos de entrenamiento detallados lo convierten en un caso de estudio útil para investigar los límites de los modelos pequeños y los efectos del tokenizador en el razonamiento aritmético.

## Benchmarks y rendimiento

La ficha del modelo proporciona datos medidos, no estimados:

| benchmark | resultado |
|---|---|
| GSM8K (40 problemas, formato chat, greedy) | 1/40 = 2,5% |
| GSM8K del modelo base (AuroraGPT-Qwen-Distill) | 0/40 = 0,0% |
| Sonda de 5 problemas seleccionados a mano | 3/5 |

El autor indica que la diferencia entre 2,5% y 0,0% está dentro del ruido estadístico (±7,7 puntos porcentuales), por lo que la afirmación honesta es que ni este modelo ni su base pueden resolver problemas de matemáticas de nivel escolar de forma fiable. El resultado de 3/5 en la sonda seleccionada a mano mide cobertura de entrenamiento, no capacidad real, ya que esos problemas coinciden con las formas en las que el modelo fue entrenado explícitamente. No se han publicado resultados de benchmarks adicionales como MMLU, HumanEval o GPQA en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa 753 MB, por lo que la inferencia puede ejecutarse con aproximadamente 1-2 GB de VRAM o RAM, dependiendo de la longitud de la secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 2060, RTX 3060, RTX 4090, o incluso iGPU modernas. También puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo actual y en muchas antiguas.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), y cualquier aplicación de chat compatible con GGUF. También es compatible con transformers estándar para safetensors.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput en la información disponible. Dado el tamaño de 707M parámetros, se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento | Notas |
|---|---|---|---|---|---|
| AuroraGPT-Think-v3 | 707M | 2048 | Apache 2.0 | Siempre (100%) | Ficha honesta, GSM8K 2,5% |
| AuroraGPT-ToolFix | 707M | no disponible | Apache 2.0 | no disponible | AuroraGPT-Math con LoRA de robustez de herramientas |
| AuroraGPT-700M-Reason | 707M | no disponible | Apache 2.0 | no disponible | Modelo de razonamiento de la misma serie |

No se dispone de información detallada sobre los modelos comparables de la misma serie más allá de sus nombres y descripciones breves. No se han encontrado datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Incapacidad aritmética fundamental: el modelo no puede realizar cálculos aritméticos fiables. En pruebas, 17 × 23 se descompone correctamente (340 + 51) pero el resultado es 411 en lugar de 391. La causa es el tokenizador de 32k BPE que divide los números en fragmentos inconsistentes (340 → ['3','40'], 391 → ['39','1']), lo que impide que el modelo aprenda el acarreo. Esto no es solucionable con más datos de entrenamiento.
- Malinterpretación de problemas no familiares: en problemas de palabras desconocidos, el modelo inventa operaciones incorrectas (por ejemplo, "16 eggs/day * 3 eggs/day = 48 eggs").
- Defecto de datos de entrenamiento: los stubs de chat sintetizados (18% del corpus) a veces reemplazan el razonamiento real en prompts matemáticos, produciendo respuestas que replantean la pregunta sin resolverla.
- Rendimiento GSM8K dentro del ruido: el 2,5% en GSM8K no es estadísticamente distinto del 0% del modelo base; no se puede afirmar que haya mejora real.
- Solo inglés: el modelo solo soporta el idioma inglés, lo que limita su uso en entornos multilingües.
- Contexto limitado: la ventana de contexto es de solo 2048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Uso recomendado con herramientas: el autor recomienda explícitamente no pedirle que calcule, sino usar el bloque de razonamiento para plantear el problema y delegar los dígitos en una calculadora externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SmallAICreator/AuroraGPT-Think-v3
- Modelo base: https://huggingface.co/SmallAICreator/AuroraGPT-Qwen-Distill
- Modelo relacionado AuroraGPT-ToolFix: https://huggingface.co/SmallAICreator/AuroraGPT-ToolFix
- Modelo relacionado AuroraGPT-700M-Reason: https://huggingface.co/SmallAICreator/AuroraGPT-700M-Reason
- Proyecto AuroraGPT (Argonne National Laboratory, no relacionado con este modelo): https://auroragpt.anl.gov/
- GitHub de AuroraGPT (no relacionado con este modelo): https://github.com/auroragpt/
