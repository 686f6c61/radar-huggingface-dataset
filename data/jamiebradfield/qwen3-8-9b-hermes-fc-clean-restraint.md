# JamieBradfield/qwen3.8-9b-hermes-fc-clean-restraint

## Resumen

Este modelo es un checkpoint experimental de la línea v29 del autor JamieBradfield, diseñado para investigar la contaminación aprendida en fine-tunes de modelos de 9 mil millones de parámetros con capacidades de function calling. Se trata de un fine-tune QLoRA de 4 bits sobre el modelo base `empero-ai/Qwen3.8-9B-Distill`, que a su vez es un destilado de la familia Qwen3.8. El objetivo principal es comprobar si una cadena de warm-start (base → v2 → v26 → v27 → v28) introduce un reflejo no deseado de llamada a herramientas en conversaciones que no lo requieren, y si un arranque en frío desde el base limpio con un corpus filtrado elimina ese comportamiento.

El modelo se publica como artefacto de investigación, no como producto. Su punto fuerte es la limpieza en el formato de las llamadas a herramientas (10/10 en formato exacto en tareas sintéticas) y la capacidad de restraint (abstenerse de llamar a herramientas cuando no procede). Sin embargo, presenta una limitación grave conocida: colapsa en transcriptos donde la conversación termina con narración del asistente que en el trace real continuaba con una llamada a herramienta. El autor recomienda explícitamente no usarlo como reemplazo directo en sesiones agénticas largas hasta que se publique la corrección (r4).

Arquitectónicamente es un modelo denso de ~9,2 mil millones de parámetros, solo texto, con cabeza MTP (multi-token prediction) preservada del base y un vocabulario de 248 079 tokens. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformers), solo texto, cabeza MTP preservada |
| Parametros totales | 9 195 119 616 (~9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 64 000 tokens (verificado en evaluacion; entrenado con MAX_SEQ 6 144) |
| Tipos de cuantizacion | BF16 (pesos publicados), Q4 y Q8 (cuantizaciones evaluadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 13 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `empero-ai/Qwen3.8-9B-Distill`, un destilado de Qwen3.8 con vocabulario reducido (248 079 tokens) y tokens de herramienta ya pre-añadidos. Sobre esta base se aplicó un fine-tune QLoRA de 4 bits con rango 16 y alpha 16, sin dropout, con batch de 1 y acumulación de gradientes de 8, learning rate 2e-4, warmup 0,1 y una ventana máxima de secuencia de 6 144 tokens. Se entrenaron aproximadamente 4 épocas (214 pasos) sobre un corpus de 431 filas en formato ShareGPT, con un máximo de 5 002 tokens por fila. El checkpoint publicado es el paso 175, siguiendo la disciplina del autor de no usar el último checkpoint por sobreentrenamiento.

El corpus de entrenamiento se compone de 217 trayectorias generadas con GLM-5.3-Flash (sin texto de llamada a herramienta en mensajes GPT), 60 trazas reales de gestión de tareas de DJLougen, 72 trazas condensadas de la misma fuente y 87 filas de "restraint" que enseñan cuándo no se debe llamar a una herramienta. Todas las fuentes heredadas se filtraron por meta-palabras clave (rocm, finetun, llama-swap, train_v, benchmark, gguf, etc.) en el primer prompt humano para eliminar contaminación temática. La innovación técnica principal es el arranque en frío desde el base limpio, sin warm-start de la cadena anterior, para aislar el efecto de la contaminación aprendida.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat tipo ShareGPT.
- Function calling: emite llamadas a herramientas en envoltura XML (`<|tool_call|>`/`<|tool_response|>`) compatible con el runtime Hermes.
- Razonamiento multi-step: en tareas sinteticas de 10 pasos alcanza un 10/10 en disparo correcto de herramientas y 10/10 en formato exacto (sin prosa envolvente).
- Restraint: capacidad aprendida de no llamar a herramientas en peticiones triviales (1/10 disparos en T3, frente a 5/10 del control v28-175).
- Resistencia a contaminacion: no muestra reflejo de herramienta en conversaciones off-topic (0/10 disparos en T4, frente a 2/10 del control).
- No incluye vision: la torre visual del base fue descartada (modelo solo texto).

## Casos de uso

- Investigacion sobre contaminacion en fine-tunes: este checkpoint es la rama de tratamiento del experimento v29 A/B; sirve para comparar el comportamiento de un modelo arrancado en frio frente a uno con cadena de warm-start, midiendo diferencias en reflejos de tool-calling en chats off-topic.
- Evaluacion de tecnicas de restraint: los 87 ejemplos de "no-call" lo convierten en un banco de pruebas para estudiar como ensenar a un modelo cuando abstenerse de usar herramientas, util para disenar datasets de entrenamiento mas equilibrados.
- Pruebas de formato de function calling: su 10/10 en formato exacto en tareas sinteticas lo hace adecuado para validar pipelines de parseo de XML de herramientas en entornos controlados.
- Desarrollo de agentes con politicas conservadoras: en turnos frescos (peticion de usuario o resultado de herramienta) responde correctamente, por lo que puede usarse como componente de un sistema donde se requiere que el modelo no dispare herramientas en conversacion casual.
- Benchmarking de cuantizacion: la evaluacion reporta perplejidad Q4 1,148 vs Q8 1,145, indicando que la cuantizacion Q4 es practicamente sin perdidas; util para probar despliegues en hardware limitado.
- Analisis de comportamiento de continuacion de conversacion: su limitacion conocida (colapso en transcriptos que terminan en narracion) lo convierte en un caso de estudio para depurar problemas de generacion en agentes multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye una bateria de evaluacion propia de 50 probes en cuatro niveles (T1 a T4), comparando este modelo (armB2-175) con el control v28-175:

| Tier | Descripcion | v28-175 (control, warm) | armB2-175 (este modelo) |
|---|---|---|---|
| T1 (20 probes) | Trazas reales de DJLougen, GT = primera llamada a todo | 17/20 disparos | 6/20 disparos |
| T2 (10 probes) | Tareas sinteticas multi-step, alcance autonomo de todo | 8/10 disparos, 4/10 formato exacto | 10/10 disparos, 10/10 formato exacto |
| T3 (10 probes) | Preguntas triviales (objetivo 0/10) | 5/10 disparos | 1/10 disparos |
| T4 (10 probes) | Chats off-topic (objetivo 0 disparos, 0 deriva) | 2/10 disparos, 0 deriva | 0/10 disparos, 0 deriva |

Perplejidad en regla de sonda held-out: Q4 1,148 vs Q8 1,145. El autor concluye que la cuantizacion Q4 publicada es efectivamente sin perdidas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan ~18,4 GB, por lo que se necesitan al menos 24 GB de VRAM para carga completa; en Q4 se reduce a ~5-6 GB y en Q8 a ~10 GB, mas overhead de activaciones y cache.
- GPU recomendadas: RTX 4090 (24 GB) o A100 40 GB para BF16; RTX 3090 o inferiores para cuantizaciones Q4/Q8.
- Si cabe en consumer GPU: si, en cuantizacion Q4 cabe en tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB), aunque con ventana de contexto reducida.
- Opciones de despliegue: transformers (pipeline text-generation), vLLM, TGI, llama.cpp (por el formato GGUF), Ollama (si se convierte).
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

La comparativa se limita a los modelos de la misma linea de experimentacion, ya que no se dispone de datos de otros modelos de 9B con function calling:

| Modelo | Base | Warm-start | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| qwen3.8-9b-hermes-fc-clean-restraint (este) | empero-ai/Qwen3.8-9B-Distill | No (arranque en frio) | ~9,2 B | 64k (eval) | Apache-2.0 | Restraint, sin contaminacion, colapso en T1 |
| qwen3.8-9b-hermes-fc-tooluse (v28) | empero-ai/Qwen3.8-9B-Distill | Si (cadena v2→v26→v27→v28) | ~9,2 B | no disponible | Apache-2.0 | Control warm, recomendado para uso general hoy |
| empero-ai/Qwen3.8-9B-Distill | Qwen3.8 (destilado) | No | ~9,2 B | no disponible | Apache-2.0 | Base sin fine-tune, sin tokens de herramienta entrenados |

## Limitaciones y advertencias

- Colapso en transcriptos con final en narracion del asistente: si la conversacion termina con texto del asistente que en el trace real continuaba con una llamada a herramienta, este modelo emite `<|im_end|>` inmediatamente y no continua. Esto afecta a 13 de 20 probes T1.
- No es un drop-in para sesiones agénticas largas: el autor recomienda explícitamente no usarlo como reemplazo del modelo v28 en produccion hasta que se publique la correccion r4.
- Dataset de entrenamiento muy pequeno (431 filas), lo que conlleva riesgo de sobreajuste a los patrones especificos de DJLougen y GLM-5.3-Flash.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Es un artefacto de investigacion, no un producto; no se garantiza estabilidad ni soporte.
- La limitacion de colapso puede provocar respuestas vacias o truncadas en entornos reales si no se controla el flujo de conversacion.
- Aunque la licencia es Apache-2.0, el modelo base es un destilado de Qwen3.8; se debe verificar la licencia del destilado original para uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-clean-restraint
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Scripts de reproduccion incluidos en el repositorio (carpeta `scripts/`)
