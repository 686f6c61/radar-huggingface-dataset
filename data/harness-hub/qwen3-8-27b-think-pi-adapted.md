# harness-hub/Qwen3.8-27B-think-pi-adapted

## Resumen

`harness-hub/Qwen3.8-27B-think-pi-adapted` es un adaptador LoRA sobre el modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba, entrenado con aprendizaje por refuerzo (GRPO asíncrono) para funcionar como el modelo que hay detrás del agente de programación [pi](https://github.com/earendil-works/pi) en tareas de ingeniería de software y de terminal. Lo publica el usuario `harness-hub` y se distribuye con licencia Apache 2.0. Es la variante "con thinking" de un adaptador anterior del mismo autor, `Qwen3.8-27B-pi-adapted`, que se entrenó con el modo de razonamiento desactivado.

El objetivo del adaptador no es mejorar la precisión bruta del modelo base, sino reducir el coste de inferencia manteniendo la precisión: según la model card, obtiene resultados equivalentes a los del modelo base con thinking y a los del adaptador pi con thinking, pero con entre un 35 % y un 42 % menos de tokens de salida en las tareas que los tres resuelven. En SWE-bench Pro (subconjunto hard de 51 tareas) alcanza un 76,5 % de resolución, frente al 74,5 % de ambas referencias, y en Terminal-Bench 2.1 obtiene un 57,5 % frente al 59,8 % del adaptador pi y el 60,9 % del base, diferencia que el autor describe como dentro del ruido estadístico.

La relevancia del modelo es práctica: demuestra que un ajuste fino con RL sobre un agente concreto puede recortar de forma sustancial el gasto en tokens (y por tanto el coste y la latencia) de flujos agénticos de larga duración, sin sacrificar la tasa de éxito. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal `Qwen/Qwen3.8-27B`; el modelo base combina torre de visión y modelo de lenguaje |
| Parametros totales | No disponible para el adaptador (el repositorio pesa 0,7 GB); el modelo base se denomina "27B" pero no se detalla el recuento exacto |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; las cuantizaciones del modelo base no se detallan) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.8-27B`, un modelo multimodal de tipo image-text-to-text, y se entrena mediante aprendizaje por refuerzo con GRPO asíncrono (`async-grpo`, librería TRL) usando LoRA. El entrenamiento se realiza con el modo thinking activado, a diferencia de su predecesor `Qwen3.8-27B-pi-adapted`, que se entrenó con thinking desactivado. El objetivo es que el modelo funcione como el motor del agente pi en entornos de terminal y de ingeniería de software.

Los conjuntos de datos empleados son `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`, orientados a entornos de agente y evaluación de terminal. La innovación principal no está en la arquitectura, sino en el comportamiento aprendido: el adaptador conserva el razonamiento en modo thinking, pero lo organiza en bloques más cortos y a lo largo de menos turnos. En las 18 tareas de SWE-bench Pro que los tres modelos resuelven y para las que existe trayectoria completa, la mediana de turnos por tarea baja de 70 (base) y 60 (adaptador pi) a 47, y la de tokens de salida por tarea, de 54k en ambos casos a 33k. La proporción de llamadas que superan los 8k tokens de salida cae del 0,9 % (base) y el 1,3 % (pi) al 0,6 %.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con esfuerzo de razonamiento configurable a través de la plantilla de chat (el autor evalúa con el valor por defecto, `xhigh`).
- Ejecución de tareas de ingeniería de software y de terminal dentro de un agente (el harness pi), incluyendo edición de código, ejecución de comandos y resolución iterativa de problemas.
- Uso de herramientas (tool calling) en flujos agénticos de múltiples pasos, con reducción del número de llamadas a herramientas respecto a las referencias (−7 % en SWE-bench Pro y −15 % en Terminal-Bench 2.1 frente al adaptador pi con thinking).
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), aunque en la evaluación publicada la torre de visión no se sirve y las pruebas son solo de texto.
- Razonamiento multi-turno con presupuesto de pasos (la evaluación usa un límite de 100 pasos por tarea y hasta 32k tokens de salida por llamada).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de resolución de incidencias en repositorios: integrado en el harness pi, el adaptador puede recibir un issue, explorar el código, aplicar parches y validarlos con pruebas, con un coste en tokens notablemente menor que el modelo base, lo que abarata las ejecuciones largas en CI.
- Automatización de tareas de terminal y administración de sistemas: el adaptador está entrenado sobre entornos de terminal (Terminal-Bench 2.1), por lo que puede encadenar comandos, interpretar su salida y corregir errores en tareas de configuración o despliegue.
- Pipelines de revisión y refactorización de código asistida: al necesitar menos turnos y menos tokens por tarea, encaja en flujos donde el coste por ejecución es crítico, como la revisión automática de pull requests a gran escala.
- Evaluación comparativa de agentes: sirve como referencia reproducible para medir el impacto de un ajuste con RL sobre el consumo de tokens en harnesses agénticos, ya que el autor publica resultados emparejados con intervalos de confianza y pruebas de signo.
- Investigación en RL para agentes: al estar entrenado con GRPO asíncrono y LoRA sobre un modelo multimodal, es un punto de partida para estudiar cómo el razonamiento "más corto" afecta a la tasa de éxito en tareas de software.
- Despliegue con presupuesto de contexto ajustado: en escenarios donde el límite de tokens de salida o el coste por llamada son restrictivos, el adaptador ofrece una precisión comparable a la del base con un consumo de salida entre un 34 % y un 42 % menor en las tareas medidas.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos bajo el harness pi, un intento por tarea, presupuesto de 100 pasos, thinking activado con esfuerzo `xhigh`, hasta 32k tokens de salida por llamada, solo texto, muestreo con temperatura 0,8 y top-p 1,0.

| Benchmark | Qwen3.8-27B | Qwen3.8-27B, thinking | Qwen3.8-27B-pi-adapted | Qwen3.8-27B-pi-adapted, thinking | **Este adaptador** |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 39,2 % | 74,5 % | 64,7 % | 74,5 % | **76,5 %** |
| Terminal-Bench 2.1 (87 tareas) | – | 60,9 % | – | 59,8 % | 57,5 % |

Resultados emparejados frente al adaptador pi con thinking (mismas tareas, mismo hardware):

| Benchmark | Diferencia (puntos) | IC 95 % | Nuevas resueltas / perdidas | Llamadas a herramientas | Tokens de salida |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | +2,0 | −9,5 a +13,5 | 5 / 4 (p = 1,0) | −7 % | −31 % |
| Terminal-Bench 2.1 (87 tareas) | −2,3 | −10,7 a +6,1 | 6 / 8 (p = 0,79) | −15 %* | −35 %* |

\*Medianas sobre las 41 tareas de Terminal-Bench que los tres modelos resolvieron.

Frente al modelo base con thinking: en SWE-bench Pro, +2,0 puntos, −40 % de llamadas a herramientas y −34 % de tokens de salida; en Terminal-Bench 2.1, −3,4 puntos (6 ganadas, 9 perdidas), −35 % de llamadas y −19 % de tokens de salida (medianas).

Consumo de tokens de salida en las tareas que los tres resuelven:

| Benchmark | Tareas | Base, thinking | Pi-adapted, thinking | **Este adaptador** | Frente a pi-adapted |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 28 | 45,8k | 46,0k | **26,7k** | −42 % |

En Terminal-Bench 2.1, sobre las 41 tareas que los tres resolvieron en la reevaluación emparejada, las medianas son 8,5k (base), 10,7k (pi-adapted) y **6,9k** para este adaptador (−35 %). En SWE-bench Pro las medianas son 25,3k frente a 38,8k.

Comportamiento del razonamiento (18 tareas de SWE-bench Pro que los tres resuelven con trayectoria completa):

| Métrica | Base, thinking | Pi-adapted, thinking | **Este adaptador** |
|---|---|---|---|
| Turnos por tarea (mediana) | 70 | 60 | **47** |
| Tokens de salida por tarea (mediana) | 54k | 54k | **33k** |
| Llamadas con más de 1k tokens de salida | 20 % | 24 % | **18 %** |
| Llamadas con más de 8k tokens de salida | 0,9 % | 1,3 % | **0,6 %** |

El autor advierte de que estas cifras no son comparables con las de la model card de `Qwen3.8-27B`, que usa otros harnesses, presupuestos mayores y el SWE-bench Pro completo. También señala que una primera medición de Terminal-Bench 2.1 situaba al adaptador 10,8 puntos por delante, pero que se reejecutó en hardware emparejado (B200 para las referencias, B300 para el adaptador en la primera medición) y que la mayor parte de esa diferencia se debía a que las referencias agotaban el límite de una hora de reloj.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0,7 GB); para inferencia hay que cargar también el modelo base `Qwen/Qwen3.8-27B`, cuyos requisitos de VRAM no se detallan en la información proporcionada.
- VRAM estimada: no disponible. Depende del tamaño exacto del modelo base y de la cuantización elegida, datos no publicados en la información disponible.
- GPU recomendadas: no disponible de forma explícita. La evaluación se realizó en NVIDIA B200 y B300, lo que indica que el autor trabajó con GPUs de centro de datos de gama alta.
- ¿Cabe en GPU de consumo? No disponible; no se confirma ni se descarta.
- Opciones de despliegue: el adaptador es PEFT/LoRA en safetensors, por lo que puede cargarse con la librería PEFT sobre el modelo base. La información no detalla soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles como cifras absolutas; la model card solo aporta reducciones relativas de tokens y llamadas a herramientas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-think-pi-adapted** | No disponible (base 27B) | No disponible | 76,5 % | 57,5 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted (thinking) | No disponible (base 27B) | No disponible | 74,5 % | 59,8 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base, thinking) | No disponible (base 27B) | No disponible | 74,5 % | 60,9 % | Apache 2.0 | Hugging Face |

Las tres variantes comparten el mismo modelo base, por lo que la comparación relevante es de coste y comportamiento: el adaptador evaluado iguala o supera ligeramente la precisión de las referencias en SWE-bench Pro y queda dentro del ruido en Terminal-Bench 2.1, con un consumo de tokens de salida entre un 34 % y un 42 % menor. No se dispone de comparaciones con modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Los resultados publicados son de un único intento por tarea y con un presupuesto fijo de 100 pasos; no se han validado con otros harnesses ni con el SWE-bench Pro completo, por lo que no son directamente comparables con las cifras de la model card del modelo base.
- La diferencia en Terminal-Bench 2.1 frente al adaptador pi (−2,3 puntos, IC 95 % de −10,7 a +6,1) y en SWE-bench Pro (+2,0 puntos, IC de −9,5 a +13,5) no es estadísticamente significativa según las pruebas del propio autor; la ventaja demostrada es de coste, no de precisión.
- La primera medición de Terminal-Bench 2.1 estaba sesgada por diferencias de hardware y por el límite de una hora de reloj; conviene tratar con cautela cualquier cifra de Terminal-Bench no reevaluada en hardware emparejado.
- El adaptador está especializado en el agente pi y en tareas de software y terminal; su comportamiento fuera de ese harness no está documentado.
- La evaluación se realizó sin servir la torre de visión, aunque el pipeline declarado es image-text-to-text; el rendimiento multimodal real del adaptador no está medido.
- No se detallan sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos; al ser un adaptador de razonamiento agéntico, persiste el riesgo habitual de acciones erróneas sobre el sistema de archivos o la terminal si no se aplican salvaguardas externas.
- Licencia Apache 2.0, que permite uso comercial, pero el adaptador hereda las condiciones del modelo base `Qwen/Qwen3.8-27B`; conviene verificar la licencia de este último antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador predecesor (sin thinking): https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Agente pi: https://github.com/earendil-works/pi
- Dataset `harness-hub/scale800-harbor`: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset `harness-hub/harness-adapters`: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset `harness-hub/termgrade-train-harbor`: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset `ai-and/termgrade-environments`: https://huggingface.co/datasets/ai-and/termgrade-environments
