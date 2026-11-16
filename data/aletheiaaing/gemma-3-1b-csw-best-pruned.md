# AletheiaAING/gemma-3-1b-csw-best-pruned

## Resumen

`gemma-3-1b-csw-best-pruned` es un ajuste fino del modelo `google/gemma-3-1b-it` desarrollado por AletheiaAING, orientado a dos tareas muy concretas sobre 37 lenguas africanas: la alternancia de codigos (code-switching, mezclar una segunda lengua dentro de una frase base tal como hacen los hablantes nativos) y la reescritura idiomatica (convertir texto plano o literal en un registro coloquial rico en refranes, comparaciones y exclamaciones). El modelo no traduce: reescribe. Esta pensado para generar datos sinteticos de entrenamiento y para tareas de estilo y naturalidad linguistica en lenguas de bajos recursos.

Arquitectura transformer decoder-only de la familia Gemma 3, con aproximadamente 947 millones de parametros reales en el checkpoint safetensors (el autor indica unos 0,82B efectivos, ya que el fichero almacena una copia duplicada de la cabeza de salida atada). La innovacion principal es una poda agresiva del vocabulario: de los 262.144 tokens originales se conservan 108.172, lo que reduce el coste de inferencia y de almacenamiento sin degradar la calidad (chrF++ greedy de 47,90 frente a 47,83 del modelo sin podar).

Es relevante porque ataca un nicho desatendido: la mayoria de los LLM multilingues rinden mal en yoruba, hausa, igbo, suajili o zulu, y practicamente ninguno modela de forma explicita el habla mezclada y el registro idiomatico que dominan los hablantes reales. Este modelo expone esas dos capacidades mediante un protocolo de prompt estricto con etiquetas de tarea y de idioma, y devuelve una salida estructurada con un bloque `<dev>` que enumera los dispositivos usados (frases mezcladas o expresiones idiomaticas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, `gemma3_text`) |
| Parametros totales | 947.124.352 (checkpoint safetensors); ~0,82B efectivos segun el autor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en bf16) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only con atencion causal estandar de la familia Gemma 3. Sobre esa base se aplica un ajuste fino supervisado y un proceso de aprendizaje por refuerzo (la model card menciona "RL3" como la iteracion ganadora, seleccionada por el mejor chrF++ en el conjunto de validacion retenido). El checkpoint final incorpora una poda de vocabulario que reduce el embedding de 262.144 a 108.172 tokens, conservando los tokens necesarios para las 37 lenguas objetivo y las etiquetas especiales del protocolo (`<hm>`, `<ood>`, codigos de idioma entre angulos, `<dev>`).

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas como DPO. La model card si indica que la familia fue entrenada sin tareas de traduccion (`m_text`), de modo que el modelo no debe usarse como traductor. La innovacion tecnica destacable es doble: la poda de vocabulario (que reduce el coste por token generado y el tamano del embedding) y el protocolo de salida estructurada con bloque `<dev>`, que hace verificables las frases mezcladas o los idiomatismos empleados y permite filtrar salidas malformadas.

## Capacidades

- Reescritura con alternancia de codigos (`hm`): toma texto en una lengua base (o en ingles) y produce la misma idea mezclando frases de una segunda lengua, imitando el habla nativa.
- Reescritura idiomatica (`ood`): convierte texto plano en un registro coloquial con refranes, comparaciones y exclamaciones.
- Tarea combinada `hm_ood`: reescribe un texto ya mezclado manteniendo la mezcla y anadiendo riqueza idiomatica.
- Soporte de 37 lenguas africanas mediante etiquetas de tres letras entre angulos (`<yor>`, `<hau>`, `<swa>`, etc.).
- Salida estructurada con etiquetas de idioma y bloque `<dev>` que enumera los dispositivos usados.
- Generacion de texto conversacional y de estilo (pipeline `text-generation`).
- No soporta traduccion plana (`m_text`), tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Generacion de datos sinteticos de code-switching: el modelo produce pares de frases mezcladas en 37 lenguas que pueden usarse para aumentar datasets de entrenamiento de modelos multilingues o de traduccion, un cuello de botella clasico en lenguas de bajos recursos.
- Aumento de datos idiomaticos: a partir de frases planas se generan variantes coloquiales con refranes y expresiones, utiles para entrenar clasificadores de registro o sistemas de normalizacion de texto.
- Creacion de contenido para redes sociales y chat: reescritura de mensajes corporativos o institucionales en un tono cercano y natural en yoruba, hausa, suajili o zulu, manteniendo el significado.
- Localizacion de estilo (no de contenido): adaptar textos ya traducidos al registro hablado real de una comunidad, incluyendo la mezcla con ingles, frances o arabe que se da en contextos urbanos.
- Investigacion sociolinguistica: generar corpus controlados de habla mezclada para estudiar patrones de alternancia de codigos, con el bloque `<dev>` como anotacion automatica de los prestamos.
- Evaluacion de naturalidad de otros modelos: usar las salidas idiomaticas como referencia para medir si un LLM generico produce lenguaje "de libro" en lenguas africanas.
- Prototipado de asistentes conversacionales en lenguas africanas: con 0,82B parametros efectivos y pesos bf16 de 1,9 GB, el modelo cabe en una GPU de consumo y permite iterar rapidamente en entornos de investigacion.

## Benchmarks y rendimiento

| Metrica | Este modelo (podado) | Modelo sin podar |
|---|---|---|
| chrF++ greedy en test | 47,90 | 47,83 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas estandar. El unico dato de rendimiento es la metrica chrF++ sobre el conjunto de test, que mide la calidad de la reescritura frente a referencias y no es comparable con benchmarks de razonamiento general.

## Requisitos de hardware

- Pesos en bf16: ~1,9 GB en disco (incluye la copia duplicada de la cabeza de salida atada); en VRAM, aproximadamente 2 GB para los pesos mas el overhead de activaciones y cache KV.
- En cuantizacion de 8 bits cabe holgadamente en GPUs de 4-6 GB; en 4 bits, en GPUs de 2-4 GB. Los tipos de cuantizacion publicados no estan disponibles en el repo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es mas que suficiente; para lotes grandes en produccion, A100 o H100 permiten mayor throughput.
- Cabe en GPU de consumo y en CPU con llama.cpp u Ollama, aunque el formato publicado es safetensors y habria que convertir a GGUF.
- Opciones de despliegue: transformers (con `gemma3_text`), vLLM y TGI para servir; llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| gemma-3-1b-csw-best-pruned | ~0,82B efectivos | no disponible | Code-switching e idiomatismos en 37 lenguas africanas | gemma |
| google/gemma-3-1b-it | ~1B | no disponible | Asistente generalista multilingue | gemma |
| Modelos csw de 270M de la misma familia | ~270M | no disponible | Code-switching con tarea `m_text` incluida | gemma |

La comparacion mas directa es con el modelo base `google/gemma-3-1b-it`: este ajuste sacrifica capacidades generalistas (no traduce, no hace tool calling) a cambio de especializacion en estilo y mezcla de lenguas. Frente a los modelos csw de 270M del mismo autor, este checkpoint es mas grande y no incluye la tarea de traduccion plana `m_text`, pero ofrece mayor calidad en las tareas `hm` y `ood` segun la seleccion por chrF++ del autor. No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- No traduce: la familia fue entrenada sin tareas de traduccion (`m_text`); para traduccion plana hay que usar un modelo especifico.
- El protocolo de prompt es estricto: un unico mensaje de usuario sin system prompt, etiquetas de idioma entre angulos, dos espacios tras los dos puntos y solo los pares de lenguas listados para cada lengua base. Desviarse produce salidas no naturales.
- Si la salida carece del bloque `<dev>`, debe considerarse invalida y remuestrearse; el modelo puede generar estructuras malformadas.
- Riesgo de alucinacion y de inventar refranes o prestamos que no existen en la lengua objetivo; el bloque `<dev>` ayuda a auditar pero no garantiza correccion cultural.
- Sesgos potenciales derivados de los datos de ajuste fino (no documentados en la informacion disponible): puede sobrerrepresentar ciertos registros urbanos o mezclas concretas (por ejemplo, yoruba con ingles) frente a variantes rurales.
- Cobertura limitada a 37 lenguas africanas; el rendimiento fuera de ese conjunto no esta garantizado.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google, que incluyen restricciones de uso aceptable y obligaciones de atribucion.
- El checkpoint almacena una copia duplicada de la cabeza de salida atada, lo que infla el tamano en disco a 1,9 GB frente a los ~1,6 GB esperables para 0,82B parametros en bf16.
- Sin datos publicados de benchmarks generales, contexto maximo ni cuantizaciones oficiales; conviene validar en el dominio concreto antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-best-pruned
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset mencionado en la model card: `csw-synth-samples8` (referenciado por nombre, sin URL en la informacion disponible)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
