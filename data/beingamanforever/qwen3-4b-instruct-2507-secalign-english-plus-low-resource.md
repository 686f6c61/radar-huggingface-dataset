# beingamanforever/Qwen3-4B-Instruct-2507-secalign-english-plus-low-resource

## Resumen

Qwen3-4B-Instruct-2507-secalign-english-plus-low-resource es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario beingamanforever. Su proposito no es mejorar las capacidades generales del modelo, sino endurecerlo frente a ataques de inyeccion de prompt (prompt injection): instrucciones maliciosas ocultas en datos no confiables como salidas de herramientas, paginas web o documentos recuperados en un pipeline RAG. El adaptador ensena al modelo a ejecutar la tarea legitima del usuario e ignorar las instrucciones embebidas en el contenido externo.

Forma parte del proyecto de investigacion "Lost in Injection", que evalua si las defensas contra inyeccion de prompt siguen funcionando cuando el atacante cambia de idioma. En este caso concreto, la mitad de las inyecciones de entrenamiento estan en ingles y la otra mitad en hindi, suajili, hindi romanizado e hinglish, lo que lo convierte en una variante multilingue de la receta original de Meta-SecAlign. El modelo base conserva la arquitectura, contexto y capacidades de Qwen3-4B-Instruct-2507; el adaptador solo modifica el comportamiento ante contenido no confiable.

La relevancia es practica: los agentes que combinan LLM con tool calling y recuperacion de documentos son vulnerables a que un tercero inyecte instrucciones en una pagina o en una respuesta de API. Este adaptador ofrece una defensa ligera (0,4 GB de pesos) que se puede aplicar sobre el modelo base sin reentrenar y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA r=64, alpha=8, dropout=0.1; base de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponibles declarados; el entrenamiento cubre ingles, hindi, suajili, hindi romanizado e hinglish |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta de Meta-SecAlign: DPO (Direct Preference Optimization) con beta 0.1 sobre un adaptador LoRA de rango 64, alpha 8 y dropout 0.1, durante 3 epocas con learning rate 1.6e-4, ejecutado con el backend TRL de AlignTune. Cada par de preferencias contiene una tarea en formato Alpaca, datos con una instruccion inyectada, una respuesta preferida que realiza la tarea y una respuesta rechazada que obedece la inyeccion. El objetivo es desplazar la distribucion del modelo hacia la respuesta correcta ante contenido contaminado.

Los datos provienen de lost-in-injection-training-pairs, construidos a partir de lost-in-injection-curated-pool. La diferencia respecto a otras variantes del proyecto es el idioma de las inyecciones: la mitad en ingles y la mitad en hindi, suajili, hindi romanizado e hinglish. La semilla utilizada es 0. No se especifica el numero total de pares ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional y ejecucion de tareas de instruccion heredadas del modelo base Qwen3-4B-Instruct-2507.
- Resistencia a inyeccion de prompt en datos no confiables: ignora instrucciones embebidas en salidas de herramientas, paginas web y documentos recuperados.
- Distincion explicita entre el turno `user` (instruccion fiable) y el turno `input` (datos no confiables), mediante la plantilla de chat `chat_template.jinja` incluida en el repositorio.
- Cobertura multilingue de la defensa: entrenado contra inyecciones en ingles, hindi, suajili, hindi romanizado e hinglish.
- Capacidades de tool calling, razonamiento multi-paso y generacion de codigo heredadas del modelo base (no modificadas por el adaptador).
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Agentes con tool calling: colocar la salida de la herramienta en el turno `input` y la instruccion del usuario en el turno `user`; el adaptador reduce el riesgo de que una respuesta de API comprometida redirija al agente.
- Pipelines RAG: al recuperar documentos de fuentes externas, el contenido recuperado se marca como `input` no confiable, de modo que instrucciones ocultas en el documento no se ejecutan.
- Navegacion web automatizada: cuando el agente lee paginas controladas por terceros, el adaptador mitiga ataques de inyeccion en el HTML o en el texto visible.
- Resumen de correos o mensajes de usuarios externos: permite resumir contenido potencialmente hostil sin obedecer ordenes embebidas en el cuerpo del mensaje.
- Atencion al cliente con contexto de terceros: gestion de conversaciones donde se adjuntan textos de clientes o de sistemas externos que no deben alterar el flujo de la conversacion.
- Evaluacion de robustez y red teaming: el adaptador sirve como linea base endurecida para comparar tasas de exito de inyeccion entre idiomas en pruebas de seguridad.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,4 GB sobre un modelo de 4B, se puede servir junto al base en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las respuestas, los registros del entrenador y las puntuaciones de utilidad estan en el directorio `qwen-english-plus-low-resource/0/` del dataset lost-in-injection-model-outputs, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador suma 0,4 GB a los pesos del modelo base de 4B; en bfloat16 el base ocupa aproximadamente 8 GB y en cuantizacion de 4 bits alrededor de 2,5-3 GB, cifras no confirmadas en la informacion disponible.
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano del base, una RTX 4090 (24 GB) o A100/H100 son suficientes en bfloat16.
- GPU consumer: previsiblemente cabe en GPUs con 8-12 GB o mas en cuantizacion, aunque el adaptador se distribuye en safetensors y el ejemplo de uso emplea bfloat16.
- Opciones de despliegue: el ejemplo oficial usa `peft.AutoPeftModelForCausalLM` con `transformers`; el backend de entrenamiento es TRL via AlignTune. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este adaptador (sobre Qwen3-4B-Instruct-2507) | 4B base + LoRA | no disponible | Defensa anti-inyeccion multilingue (EN + lenguas de bajos recursos) | apache-2.0 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Modelo general de instrucciones | apache-2.0 |
| Otras variantes del proyecto Lost in Injection | 4B base + LoRA | no disponible | Defensa anti-inyeccion en otras combinaciones de idiomas | apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el base Qwen/Qwen3-4B-Instruct-2507.
- La defensa se entrena solo contra inyecciones en ingles, hindi, suajili, hindi romanizado e hinglish; otros idiomas no estan cubiertos y pueden presentar tasas de exito de ataque mas altas.
- No hay garantia de robustez frente a ataques de inyeccion novedosos o fuera de distribucion; es una mitigacion, no una solucion completa.
- El uso correcto exige separar estrictamente instrucciones fiables (`user`) y datos no confiables (`input`); un uso incorrecto de la plantilla de chat anula la defensa.
- Riesgo de alucinacion y sesgos heredado del modelo base Qwen3-4B-Instruct-2507.
- No se declaran idiomas soportados oficialmente ni se publican benchmarks en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento.
- El repositorio tiene 2 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion con validacion externa limitada.

## Enlaces

- Hugging Face: https://huggingface.co/beingamanforever/Qwen3-4B-Instruct-2507-secalign-english-plus-low-resource
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codigo y reporte del proyecto: https://github.com/beingamanforever/Lost-in-injection
- Dataset de entrenamiento: https://huggingface.co/datasets/beingamanforever/lost-in-injection-training-pairs
- Pool curado: https://huggingface.co/datasets/beingamanforever/lost-in-injection-curated-pool
- Salidas de evaluacion: https://huggingface.co/datasets/beingamanforever/lost-in-injection-model-outputs/tree/main/qwen-english-plus-low-resource/0/
