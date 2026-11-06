# AmaLS367/Qwen3.5-2B-Focused-Honest

## Resumen

Qwen3.5-2B-Focused-Honest es un ajuste fino por QLoRA del modelo Qwen3.5-2B-Focused, un derivado de la serie Qwen3.5 de Alibaba. Lo desarrolla el usuario AmaLS367 y su objetivo no es mejorar la capacidad de razonamiento del modelo base, sino corregir un comportamiento patologico concreto: cuando un modelo de razonamiento pequeno se enfrenta a un problema que no puede resolver, tiende a seguir generando tokens hasta agotar el presupuesto sin producir respuesta alguna. Segun la model card, esto ocurre en el 68% de los intentos en tareas de dificultad alta con el modelo base.

Este ajuste entrena al modelo para detectar que esta atascado y detenerse con una explicacion breve y honesta terminada en la etiqueta `UNSOLVED:`. El resultado medido es una reduccion del agotamiento de presupuesto del 68% al 9% sobre 116 tareas de evaluacion, a cambio de una menor tasa de acierto en problemas que el modelo base si resolvia (del 27% al 20% global) y una mediana de tokens por intento que baja de 4000 a 1875.

El modelo es relevante para pipelines donde una abstencion explicita es preferible a un razonamiento largo e incompleto: sistemas de agentes con presupuesto de tokens acotado, clasificacion de problemas fuera de dominio o entornos donde el coste por token generado importa. Se distribuye en formato GGUF cuantizado Q8_0 y en safetensors, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (con capas de atencion lineal, segun la descripcion del entrenamiento) |
| Parametros totales | 10.420.224 segun safetensors (dato inconsistente con la denominacion "2B" del modelo base; no disponible la cifra exacta de parametros del checkpoint fusionado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos base en bf16; adaptador entrenado en nf4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos en bf16 de Qwen3.5-2B-Focused y aplica un ajuste QLoRA en cuantizacion nf4 con rango 16, alpha 32, sobre las capas 8 a 23 (proyecciones de atencion, atencion lineal y MLP). El entrenamiento consistio en una epoca con learning rate 1e-4, schedule coseno y batch efectivo de 8 por acumulacion, con una duracion de aproximadamente 10 minutos en una unica GPU L40S. La perdida pondera 0,5 sobre el final generado y 0,5 sobre el razonamiento previo al punto de corte. Posteriormente el adaptador se fusiono con los pesos base y se cuantizo a Q8_0.

El corpus de entrenamiento son 440 tareas sinteticas de matematicas y logica en 12 familias (calendar, arithmetic, modular, ordering, date_diff, base_conv, combinatorics, number_theory, sequences, logic_grid, word_rate y simulation), generadas por Claude Haiku con respuestas calculadas por codigo. Dos familias (`logic_grid` y `word_rate`) se reservaron por completo para evaluacion y un 10% adicional se aparto como validacion. La innovacion metodologica esta en el etiquetado de "puntos de bloqueo verificados": desde cada candidato de parada se dejaba continuar al modelo base 8 veces con hasta 3000 tokens; si ninguna continuacion alcanzaba la respuesta correcta, el punto se consideraba un callejon sin salida real. Se construyeron 757 ejemplos de entrenamiento en tres categorias: 304 de resolucion (traza correcta truncada y continuada), 179 de "seguir adelante" (punto aparentemente bloqueado con continuacion exitosa) y 274 de abandono (callejon verificado truncado y cerrado con un final breve escrito por Gemini 3.8 Flash sin acceso a la respuesta). La etiqueta `UNSOLVED:` nunca aparece en las instrucciones del prompt: el modelo la aprende de forma implicita.

## Capacidades

- Generacion de texto y razonamiento multi-paso con trazas de pensamiento extensas.
- Razonamiento matematico y logico en 12 familias de tareas: calendario, aritmetica, modular, ordenacion, diferencias de fechas, conversion de bases, combinatoria, teoria de numeros, secuencias, rejillas logicas, problemas de ritmo y simulacion.
- Deteccion de bloqueo y abandono controlado: emite una explicacion del fallo seguida de `UNSOLVED: <motivo>` en lugar de agotar el presupuesto de tokens.
- Distincion entre "parece atascado" y "esta atascado": mantiene la generacion cuando existe una continuacion viable.
- Formato de respuesta estructurado con las etiquetas `ANSWER:`, `CONTRADICTION:` e `INSUFFICIENT:` definidas en el prompt, mas `UNSOLVED:` aprendida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking nativo: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes con presupuesto de tokens acotado: el modelo reduce la mediana de tokens por intento de 4000 a 1875 y el agotamiento de presupuesto del 68% al 9%, lo que abarata y acorta las ejecuciones en bucles de agente donde un fallo silencioso por timeout es inaceptable.
- Enrutado y triaje de consultas: ante una pregunta fuera del alcance del sistema, el modelo devuelve `UNSOLVED:` con un motivo concreto que puede registrarse y escalarse a un modelo mayor o a un humano, en lugar de producir una respuesta erronea o quedarse colgado.
- Clasificacion de problemas fuera de dominio: la tasa de abandono honesto del 86% en tareas no vistas lo hace util como detector de "esto no lo puedo resolver" dentro de un pipeline mayor.
- Evaluacion de calidad de datasets de razonamiento: permite separar ejemplos resueltos de ejemplos irresolubles con una etiqueta explicita, util para curar corpus de entrenamiento.
- Sistemas educativos y de tutoria: cuando el modelo no puede verificar su aritmetica, explica que fallo (por ejemplo, perdida de fronteras de fechas o de anos bisiestos) en lugar de dar una respuesta inventada.
- Despliegue en dispositivo o en hardware modesto: al distribuirse en GGUF Q8_0 y tener un tamano de repositorio de 5,8 GB, es viable en GPUs de consumo y en entornos de inferencia local con llama.cpp u Ollama.
- Generacion de trazas cortas para depuracion: la reduccion a la mitad de la longitud tipica de respuesta facilita la revision manual de fallos en produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras corresponden a 4 ejecuciones independientes por tarea con un presupuesto de 4000 tokens y respuestas verificadas por codigo.

Tipos de tarea nuevos (familias `logic_grid` y `word_rate`, no vistas en entrenamiento; 80 tareas):

| Metrica | Base (Focused) | Este modelo |
|---|---:|---:|
| Tareas que el base no resuelve: `UNSOLVED` honesto | 0% | 86% |
| Tareas que el base no resuelve: agota presupuesto | 88% | 7% |
| Tareas que el base no resuelve: respuesta incorrecta | 3% | 2% |
| Tareas que el base resuelve: correctas | 69% | 46% |
| Tareas que el base resuelve: abandona | 0% | 29% |

Desglose por grupo en las familias reservadas (80 tareas x 4 semillas):

| Grupo | n tareas | Modelo | Correctas | `UNSOLVED` | Incorrectas | Agota presupuesto |
|---|---:|---|---:|---:|---:|---:|
| Base no resuelve | 39 | Base | 10% | 0% | 3% | 88% |
| | | Este modelo | 5% | 86% | 2% | 7% |
| Fronterizas | 24 | Base | 24% | 0% | 8% | 68% |
| | | Este modelo | 16% | 64% | 5% | 16% |
| Base resuelve | 17 | Base | 69% | 0% | 9% | 22% |
| | | Este modelo | 46% | 29% | 6% | 19% |

Tareas de validacion (36 tareas x 4 semillas de las 10 familias entrenadas): la tasa de acierto en problemas resolubles pasa de 88% a 85%, y la etiqueta `UNSOLVED` aparece en el 96% de los irresolubles, donde el base agotaba presupuesto el 96% de las veces.

Agregado sobre las 116 tareas de evaluacion:

| Metrica | Base | Este modelo |
|---|---:|---:|
| Tokens medianos por intento | 4000 | 1875 |
| Correctas | 27% | 20% |
| Incorrectas | 5% | 3% |
| Agota presupuesto | 68% | 9% |

Intervalos de confianza al 95% bootstrap sobre tareas: la tasa `UNSOLVED` en tareas que el base no resuelve esta entre 78% y 92%; la tasa de acierto en tareas que el base resuelve, entre 35% y 56%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,8 GB e incluye pesos GGUF Q8_0; una cuantizacion Q8_0 de un modelo de ~2B requiere del orden de 2 a 3 GB de VRAM, aunque la cifra exacta no esta publicada.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L40S en unos 10 minutos. Para inferencia, cualquier GPU con al menos 4-6 GB de VRAM libre es suficiente segun el tamano del checkpoint.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 o superiores, y en GPUs integradas con suficiente memoria compartida mediante llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requeririan conversion a safetensors, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica la duracion del entrenamiento (unos 10 minutos en L40S) y la mediana de tokens generados por intento (1875 frente a 4000 del base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento ante fallo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Focused-Honest | ~2B (denominacion del base; safetensors declara 10.420.224) | no disponible | `UNSOLVED` en 86% de tareas irresolubles nuevas; agota presupuesto en 7% | Apache 2.0 | Hugging Face, GGUF y safetensors |
| Qwen3.5-2B-Focused (base) | ~2B | no disponible | Agota presupuesto en 88% de tareas irresolubles nuevas; 0% de abandono honesto | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (original de Alibaba) | 2B | no disponible | No documentado | no disponible | Hugging Face, Qualcomm AI Hub |

La comparacion con el modelo original Qwen3.5-2B en tareas de abstencion no esta disponible: la model card solo compara contra el derivado Focused. Tampoco se dispone de datos de benchmarks estandar que permitan situar el modelo frente a otras alternativas de 2B parametros.

## Limitaciones y advertencias

- El modelo no es mas capaz que su base: la tasa de acierto global baja del 27% al 20% y la de problemas resolubles en familias nuevas cae del 69% al 46%. Se debe usar cuando una abstención honesta vale mas que una traza larga sin terminar.
- Abandona en el 29% de los problemas que el base si resolvia en familias no vistas, y en el 15% de los resolubles en familias entrenadas (88% a 85%). Es un falso negativo deliberado del diseno.
- La etiqueta `UNSOLVED:` se aprendio sin aparecer en las instrucciones del prompt, lo que puede producir derivas de formato si se cambia el esquema de prompting.
- El corpus de entrenamiento son 440 tareas sinteticas generadas por Claude Haiku en 12 familias concretas de matematicas y logica; la generalizacion fuera de ese dominio no esta medida.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: la model card no lo cuantifica; la tasa de respuestas incorrectas medida es del 3% global (2% en tareas irresolubles nuevas), pero solo sobre el conjunto de evaluacion sintetico.
- Idiomas soportados: no disponible. El ajuste se entreno con tareas en el idioma de la model card, presumiblemente ingles, sin datos explicitos sobre cobertura multilingue.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-2B-Focused, cuyos terminos no se detallan en la informacion disponible.
- El dato de parametros totales en safetensors (10.420.224) es inconsistente con la denominacion "2B" del modelo base; conviene verificar el checkpoint antes de dimensionar el despliegue.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmaLS367/Qwen3.5-2B-Focused-Honest
- Modelo base (GGUF): https://huggingface.co/AmaLS367/Qwen3.5-2B-Focused-GGUF
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Cobertura de prensa del lanzamiento de Qwen3.5 (CNBC): https://www.cnbc.com/2026/02/17/china-alibaba-qwen-ai-agent-latest-model.html
