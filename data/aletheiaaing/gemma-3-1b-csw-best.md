# AletheiaAING/gemma-3-1b-csw-best

## Resumen

`gemma-3-1b-csw-best` es un ajuste fino del modelo `google/gemma-3-1b-it` desarrollado por AletheiaAING, orientado a dos tareas muy concretas sobre 37 lenguas africanas: la alternancia de codigos (code-switching) y la reescritura idiomatica. En lugar de traducir, el modelo reescribe un texto mezclando una segunda lengua tal como lo haria un hablante nativo, o bien lo transforma en un registro coloquial cargado de refranes, proverbios y expresiones. El checkpoint publicado corresponde al paso 150 de 200 de un entrenamiento por refuerzo (RL3) y fue seleccionado por su mejor chrF++ en el conjunto de validacion.

Arquitectonicamente es un transformer decoder-only de la familia Gemma 3, con 1.301.875.840 parametros totales (aproximadamente 1.000 millones efectivos; el repositorio de 2,6 GB incluye una copia adicional de la cabeza de salida) y pesos en bf16. Mantiene el vocabulario completo del modelo base, algo relevante porque las etiquetas de tarea y los codigos de idioma entre angulos son tokens unicos en el vocabulario.

Su relevancia es doble: por un lado cubre un hueco poco atendido en las herramientas de PLN para lenguas africanas de bajos recursos, y por otro introduce un formato de entrada/salida estricto y verificable, con un bloque `<dev>` que lista explicitamente las expresiones o dispositivos usados, lo que facilita el filtrado automatico de salidas invalidas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 1.301.875.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas segun la model card) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3. El ajuste fino se realizo sobre tareas de reescritura con etiquetas de tarea en la entrada (`<hm>` para code-switching, `<ood>` para reescritura idiomatica) y un formato de salida estructurado que incluye un bloque `<dev>` con la lista de dispositivos usados. Segun la model card, el checkpoint publicado es el resultado de un entrenamiento por refuerzo (RL3) de 200 pasos, del cual se selecciono el paso 150 por su mejor chrF++ en validacion.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF mas alla de la mencion al esquema RL3. Tampoco se detalla la longitud de contexto nativa del modelo base. Una innovacion destacable es el diseno del prompt: los codigos de idioma entre angulos (`<yor>`, `<eng>`, etc.) son tokens unicos del vocabulario, y el modelo fue entrenado para emitir siempre el bloque `<dev>` con las expresiones copiadas literalmente del texto generado, lo que permite validar la salida de forma programatica.

## Capacidades

- Reescritura con code-switching (`hm`): mezcla una segunda lengua en el texto base al estilo de hablantes nativos, con pares de lenguas predefinidos y entrenados.
- Reescritura idiomatica (`ood`): transforma texto plano o literal en un registro coloquial con refranes, comparaciones y exclamaciones.
- Transformacion combinada (`hm_ood`): reescribe un texto ya mezclado manteniendo la alternancia de codigos.
- Generacion de texto y conversacion en 37 lenguas africanas, incluyendo yoruba, hausa, igbo, suajili, zulu, xhosa, afrikaans, amharico, somali, kinyarwanda, lingala, luganda, chichewa, shona, sesotho, setswana, malgache, wolof, ewe, twi, oromo y tigrinya.
- Salida estructurada y verificable: etiquetas de idioma y bloque `<dev>` con los dispositivos usados, parseables con codigo auxiliar.
- No soporta traduccion plana (`m_text`): la model card indica explicitamente que esta familia se entreno sin tareas de traduccion.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Localizacion de contenido para redes sociales: dado un texto en ingles o en la lengua base, el modelo genera una version code-switched o idiomatica que suena natural para audiencias de Nigeria, Kenia o Sudafrica, evitando el registro de manual que delata las traducciones automaticas.
- Generacion de dialogos para videojuegos y doblaje: los guiones pueden reescribirse en registro coloquial con refranes locales, y el bloque `<dev>` permite al equipo de localizacion revisar que expresiones se han introducido antes de grabar.
- Aumento de datos para PLN de bajos recursos: el modelo puede producir variantes code-switched e idiomaticas de un corpus existente, utiles para entrenar o evaluar otros sistemas de procesamiento de lenguas africanas.
- Moderacion y normalizacion de texto informal: al reescribir texto mixto en un registro controlado, facilita el analisis posterior de mensajes en chats donde los usuarios alternan lenguas constantemente.
- Creacion de asistentes conversacionales con tono local: integrado en un chatbot de atencion al cliente, el modelo adapta las respuestas al registro idiomatico del usuario, mejorando la percepcion de naturalidad en mercados africanos.
- Investigacion linguistica asistida: el bloque `<dev>` actua como anotacion automatica de los dispositivos idiomaticos empleados, lo que permite extraer listados de expresiones y refranes a partir de corpus de entrada.
- Filtrado de calidad en pipelines editoriales: la funcion `parse()` del codigo auxiliar devuelve `ok` para descartar salidas mal formadas, lo que permite usar el modelo como paso de reescritura dentro de un pipeline automatizado con reintentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es el chrF++ en el conjunto de validacion usado para seleccionar el checkpoint (paso 150 de 200), pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6-3 GB en bf16 (1.300 millones de parametros mas la copia de la cabeza de salida); en cuantizacion de 8 bits rondaria 1,5-2 GB y en 4 bits alrededor de 1 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en bf16; para lotes grandes o mayor throughput se recomiendan RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente toda la gama actual (RTX 3060 en adelante, e incluso GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: transformers (formato safetensors nativo), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best | 1.301.875.840 | no disponible | Code-switching e idiomatico en 37 lenguas africanas | gemma | Hugging Face |
| google/gemma-3-1b-it | no disponible | no disponible | Modelo base conversacional multilingue | gemma | Hugging Face |
| Modelos csw de 270M de AletheiaAING | no disponible | no disponible | Code-switching con tarea adicional `m_text` (traduccion plana) | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de datos de rendimiento de los modelos comparables ni de especificaciones completas de contexto. El modelo base `gemma-3-1b-it` es la referencia natural, y los modelos csw de 270M del mismo autor cubren la tarea de traduccion plana que este checkpoint no soporta.

## Limitaciones y advertencias

- No realiza traduccion plana (`m_text`); para eso hay que usar un modelo de traduccion o los modelos csw de 270M del mismo autor.
- Solo se entrenaron los pares de lenguas listados para cada lengua base; usar otros pares produce salidas poco naturales.
- El formato de entrada es estricto: un unico mensaje de usuario, sin system prompt, con dos espacios tras los dos puntos y codigos de tres letras entre angulos. Cambiar el espaciado o las etiquetas degrada la salida.
- Si la salida no incluye el bloque `<dev>`, debe considerarse invalida y regenerarse; el modelo puede producir ocasionalmente salidas mal formadas.
- Riesgo de alucinacion en la generacion de refranes y expresiones idiomaticas: el bloque `<dev>` ayuda a detectarlo, pero no garantiza que la expresion exista o se use realmente en la comunidad hablante.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base entrenado con datos web, es esperable que herede sesgos de genero, religion y nacionalidad, especialmente sensibles en el contexto de las lenguas africanas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones de uso aceptable y obligaciones de atribucion; conviene revisarla antes de desplegar en produccion.
- No se documentan capacidades de tool calling, agentes ni vision, por lo que no debe asumirse su disponibilidad.
- El repositorio incluye una copia de la cabeza de salida, lo que infla el tamano del archivo (2,6 GB) respecto a los aproximadamente 1.000 millones de parametros efectivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Licencia Gemma: no disponible en la informacion proporcionada
- Dataset `csw-synth-samples8` (mencionado en la model card): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
