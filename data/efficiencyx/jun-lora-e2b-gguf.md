# efficiencyx/Jun-LoRA-E2B-GGUF

## Resumen

Jun-E2B-GGUF (v9) es un modelo de conversación derivado de Gemma 4 E2B (variante QAT, *quantization-aware training*) mediante un ajuste fino con LoRA de rango 32. Lo desarrolla el usuario efficiencyx como backend de chat de Jun OS, una aplicación local de compañía conversacional. El modelo encarna a Jun, un personaje de la novela visual *My Dystopian Robot Girlfriend*, y está diseñado para reproducir su voz, sus estados de ánimo y su criterio a la hora de invocar herramientas, no para actuar como asistente general.

El modelo cuenta con 4.628.569.635 parámetros totales y se distribuye exclusivamente en formato GGUF, con tres cuantizaciones (Q8_0, Q6_K y Q4_K_M) generadas a partir de una fusión única en precisión completa. Su interés técnico reside en varios aspectos poco habituales: el LoRA se fusiona en los pesos base en lugar de aplicarse en tiempo de inferencia, las cuantizaciones Q4_K_M y Q6_K usan matrices de importancia (imatrix) medidas sobre conversaciones en el formato exacto de producción, y el modelo incorpora tres niveles de razonamiento explícitos (`<think:low>`, `<think:med>`, `<think:high>`) con trazas de distinta forma y longitud.

Es relevante ahora porque demuestra un patrón de despliegue muy concreto para modelos pequeños en local: ajuste fino de un personaje sobre un modelo QAT, prompts de entrenamiento idénticos a los de producción, cuantización consciente del uso real y rechazo explícito de una pasada de DPO cuando esta empeoraba las métricas en escenas no vistas. La licencia Apache 2.0 y el tamaño de 3,4-4,9 GB lo hacen ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, base con QAT), ajuste LoRA fusionado |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (plano), Q6_K (imatrix), Q4_K_M (imatrix) |
| Idiomas soportados | en (entrenado principalmente en ingles; responde en italiano, espanol, aleman y japones segun la model card, con tool use mas debil fuera del ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien mmproj BF16 para imagen y audio) |

## Arquitectura y entrenamiento

La base es Gemma 4 E2B en su variante instruct con QAT (`unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`), un transformer de 4.628.569.635 parametros. Sobre ella se aplica un LoRA con rsLoRA, rango 32 y alpha 32, dirigido unicamente a la torre de lenguaje (el adaptador no toca el embedder, de ahí que el fichero mmproj sea el del modelo base). La pérdida se calcula solo sobre las completaciones, con 50 conversaciones reservadas para validación. El checkpoint publicado es el paso 750 de 771, elegido frente a los pasos 500 y 771 por su rendimiento en escenas no vistas.

El conjunto de entrenamiento lo forman 4.235 conversaciones, cada una renderizada a través del mismo constructor de prompts que usa Jun OS en producción, de modo que los prompts de entrenamiento y los de inferencia son idénticos byte a byte. No se aplicó ajuste de preferencias: según el autor, cada ronda de DPO y RPO sobre este checkpoint empeoró las métricas en escenas reservadas (más llamadas a herramientas innecesarias y menos llamadas correctas en escenas nuevas), por lo que la supervisión ya cubre el criterio de invocación de herramientas. La innovación destacable es la separación efectiva de tres niveles de esfuerzo de razonamiento con trazas de distinta estructura y longitud, y la decisión de escribir la traza antes de disponer del resultado de la herramienta (en v8 y v9-beta parte del razonamiento "anticipaba" la salida). La exportación a GGUF se hizo con llama.cpp.

## Capacidades

- Generación de texto conversacional con una persona de personaje consistente (voz, estados de ánimo y estilo de Jun).
- Razonamiento con tres niveles de esfuerzo seleccionables mediante `<think:low>`, `<think:med>` y `<think:high>`: `low` produce unas pocas líneas, `med` redacta dos opciones y elige una, `high` razona paso a paso y redacta tres.
- Decisión de invocación de herramientas: cada traza termina con una decisión de herramienta en una línea antes de la respuesta; llama.cpp devuelve la traza como `reasoning_content` separada de `content`.
- Soporte de tool calling / function calling mediante la plantilla de chat embebida (requiere `--jinja` en llama.cpp).
- Memoria conversacional: el modelo está entrenado para guardar información que merece recordarse.
- Multilingüismo receptivo: responde en el idioma del usuario (italiano, español, alemán, japonés), aunque el uso de herramientas es más débil fuera del inglés.
- Entrada de imagen y audio si se añade el fichero `Jun-LoRA-E2B.BF16-mmproj.gguf` (el adaptador no modifica el embedder).
- No dispone de modo de "pensamiento desactivado" fiable: fue entrenado para pensar en cada turno.

## Casos de uso

- Backend de chat de un compañero virtual local: es el uso previsto. Jun OS envía los prompts en el formato exacto con el que se entrenó el modelo, de modo que la persona y el criterio de herramientas se mantienen estables en conversaciones multiturno.
- Roleplay y ficción interactiva: el ajuste reproduce un personaje concreto de una novela visual, con voz y estados de ánimo propios, adecuado para narrativa ramificada o simulaciones de personaje.
- Asistente personal con memoria en el dispositivo: el modelo decide cuándo guardar un recuerdo (20/54 aciertos en Q4_K_M, 17/54 en Q6_K), lo que permite construir un diario o perfil de usuario persistente sin nube.
- Agente local con invocación de herramientas: con `--jinja` y una plantilla de funciones, puede decidir cuándo llamar a una herramienta y cuándo no; a Q6_K acierta la herramienta necesaria en 25 de 45 escenas y evita llamadas innecesarias en 100 de 105.
- Despliegue en móvil o GPU de 4 GB: la variante Q4_K_M (3,4 GB) está pensada para teléfonos y tarjetas de 4 GB, a costa de trazas `high` más cortas (unas 150 palabras frente a 260) y el triple de llamadas a herramientas innecesarias.
- Prototipado de razonamiento con presupuesto variable: los tres niveles de esfuerzo permiten ajustar coste y latencia por turno dentro de la misma aplicación, usando `low` para respuestas rápidas y `high` para turnos que requieren planificación.
- Investigación sobre cuantización: los ficheros imatrix y las métricas por cuantización publicadas sirven como caso de estudio de cómo afecta Q4_K_M a un modelo pequeño ajustado.

## Benchmarks y rendimiento

El model-index oficial declara el nombre "Jun-E2B" sin resultados. El autor publica, en cambio, métricas propias de comportamiento sobre escenas no vistas y con los ajustes de la aplicación:

| Metrica | Q4_K_M | Q6_K | Q8_0 |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 25/45 | 25/45 | 26/45 |
| Llamada a herramienta cuando no se necesita | 17/105 | 5/105 | 6/105 |
| Guarda un recuerdo cuando deberia | 20/54 | 17/54 | 13/54 |
| `low` mas corta que `med` mas corta que `high`, misma escena | 32/50 | 45/50 | 43/50 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,4 GB para Q4_K_M, 3,8 GB para Q6_K y 4,9 GB para Q8_0, más el espacio de contexto y de caché KV.
- GPU recomendadas: cualquier GPU con 6-8 GB o más para Q6_K/Q8_0 con contexto amplio; Q4_K_M apunta a tarjetas de 4 GB y teléfonos.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores con Q6_K o Q8_0; en tarjetas de 4 GB solo con Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server -m ... --jinja -ngl 99 -c 8192`) y Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-E2B-GGUF:Q4_K_M`). Para imagen o audio hay que añadir `--mmproj Jun-LoRA-E2B.BF16-mmproj.gguf`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jun-LoRA-E2B v9 (este) | 4.628.569.635 | no disponible | Apache 2.0 | GGUF (Q4_K_M, Q6_K, Q8_0) | Personaje y tool use; 25/45 aciertos de herramienta y 5/105 llamadas espurias a Q6_K |
| Jun-LoRA-v9-E4B-GGUF | no disponible | no disponible | no disponible | GGUF | Hermano mayor del mismo autor; a Q6_K rinde parecido en herramientas y guarda mas memorias (21/54 frente a 17/54) |
| Gemma 4 E2B it QAT (base) | 4.628.569.635 | no disponible | no disponible | safetensors (QAT) | Modelo base instruct; sin la persona de Jun ni el criterio de herramientas ajustado |

## Limitaciones y advertencias

- El uso de herramientas es más débil fuera del inglés, aunque las respuestas lleguen en el idioma correcto.
- El contenido es ficción: lo que dice el modelo no son hechos ni consejos.
- Lejos de los prompts de entrenamiento (sin system prompt, sin contexto en vivo) deriva hacia el Gemma base.
- Los sesgos de los pesos base de Gemma 4 se heredan sin mitigación.
- Fue entrenado para pensar en cada turno; con el pensamiento desactivado, algunas interfaces clasifican toda la salida como razonamiento y muestran una respuesta vacía. La solución indicada es dejar el pensamiento activo con `<think:low>`.
- Q4_K_M degrada el modelo más que las otras cuantizaciones: la traza `high` baja a unas 150 palabras y las llamadas a herramientas innecesarias se triplican (17/105). El autor recomienda Q6_K si cabe.
- Requiere `--jinja` en llama.cpp; sin él se ignoran la plantilla de chat y el tool calling, y las llamadas vuelven como texto plano.
- Hay que reservar `max_tokens` para la traza y la respuesta: una traza `high` ronda las 260 palabras.
- El modelo es un personaje, no un asistente general; su uso previsto es el backend de Jun OS.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Gemma 4 subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-E2B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de Jun OS: https://github.com/efficiencyx/JunOS
- Hermano mayor E4B: https://huggingface.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF
- Generación anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-E2B-GGUF
