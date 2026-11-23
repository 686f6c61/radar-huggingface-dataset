# BeardedMonster/gemma-3-1b-csw-best

## Resumen

gemma-3-1b-csw-best es un ajuste fino (fine-tune) del modelo google/gemma-3-1b-it desarrollado por BeardedMonster, orientado a dos tareas muy concretas sobre 37 lenguas africanas: la alternancia de codigo (code-switching, mezclar dos idiomas dentro de una misma frase tal y como hablan realmente los hablantes bilingues) y la reescritura idiomatica (convertir texto plano en lenguaje coloquial rico en expresiones, refranes y comparaciones). El modelo no traduce: transforma texto ya disponible para que suene natural en el registro real de la calle.

Tecnicamente es un transformer decoder-only de 1.301.875.840 parametros (aproximadamente 1,3 mil millones), derivado del Gemma 3 1B instruct con vocabulario completo, pesos en bf16 y un repositorio de 2,6 GB. Se distribuye en formato safetensors con la arquitectura gemma3_text y se invoca mediante un protocolo de prompt muy estricto basado en etiquetas de tarea (`<hm>`, `<ood>`) y codigos de idioma de tres letras entre parentesis angulares.

Su relevancia es de nicho pero clara: la mayoria de los corpus y modelos multilingues tratan las lenguas africanas como monolingues, cuando en la practica sus hablantes alternan idiomas constantemente. Este modelo permite generar datos sinteticos de entrenamiento, pruebas de estres y material linguistico con esa mezcla real, algo que practicamente ningun modelo generico cubre de forma controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), derivado de Gemma 3 1B |
| Parametros totales | 1.301.875.840 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas segun la model card; la lista de metadatos contiene 22 codigos) |
| Licencia | other (uso comercial y no comercial libre con atribucion a AletheiaAING; se aplican ademas los Gemma Terms of Use) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only denso de aproximadamente 1,3 mil millones de parametros con el vocabulario completo de Gemma 3. El fine-tune conserva esa arquitectura y ese tokenizador, y la model card insiste en que debe usarse el tokenizador del propio repositorio para que las etiquetas especiales (`<hm>`, `<ood>`, `<yor>`, `<eng>`, `<dev>`) se procesen correctamente.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Lo que si describe la model card es el diseno de la tarea: el modelo aprende un formato de salida estructurado en el que la respuesta siempre empieza por el codigo de lengua base, opcionalmente el de la lengua mezclada, y un bloque `<dev>...</dev>` que enumera las expresiones alternadas o los modismos empleados, seguido del texto generado. Este bloque de marcado actua como etiquetado implicito de los segmentos code-switched, lo que convierte al modelo en una herramienta de anotacion ademas de generacion.

## Capacidades

- Generacion de texto con alternancia de codigo controlada: dado un texto en la lengua base (o en ingles), inserta frases de una segunda lengua concreta segun la tabla de pares soportados.
- Reescritura idiomatica: transforma texto plano en lenguaje coloquial con refranes, comparaciones y expresiones propias de hablantes nativos.
- Tarea combinada `hm_ood`: reescribe un texto ya code-switched manteniendo la mezcla de idiomas.
- Etiquetado de spans: el bloque `<dev>` devuelve las expresiones alternadas o los modismos utilizados, util para construir conjuntos de datos etiquetados.
- Conversacional e instrucciones: hereda el formato chat de Gemma 3 1B-it, con un unico mensaje de usuario y sin system prompt.
- Cobertura multilingue en 37 lenguas africanas (yoruba, hausa, igbo, swahili, zulu, xhosa, afrikaans, amharico, somali, kinyarwanda, lingala, luganda, shona, chichewa, setswana, sesotho, malgache, wolof, ewé, twi, oromo, tigrinya, entre otras).
- No realiza traduccion literal; esa funcion queda fuera del alcance declarado del modelo.
- No se documentan capacidades de vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Generacion de datos de chat code-switched: tomar instrucciones en ingles o en una sola lengua y convertirlas en variantes mezcladas (`eng_hm`, `m_hm`) para entrenar asistentes que entiendan como escriben realmente los usuarios bilingues.
- Creacion de corpus para ASR y TTS: generar frases code-switched que sirvan de guion de locucion para grabaciones con hablantes nativos, y listas de palabras con las expresiones alternadas marcadas en `<dev>`.
- Pruebas de estres de sistemas NLP: producir entradas mezcladas para evaluar como responden chatbots, traductores, detectores de idioma o modelos de NER y analisis de sentimiento ante code-switching.
- Entrenamiento y evaluacion de detectores de cambio de codigo: el bloque `<dev>` proporciona spans etiquetados directamente utilizables como ground truth parcial.
- Redaccion de copy y dialogos con registro natural: reescritura idiomatica (`ood`) de textos planos para relatos, dialogos de videojuegos, publicaciones en redes o anuncios, con revision posterior por un hablante nativo.
- Material didactico para aprendizaje de lenguas: mostrar a estudiantes como los hablantes nativos mezclan idiomas y que refranes emplean en contextos cotidianos.
- Aumento de datos para modelos propios: muestrear varias salidas por prompt (o aplicar MBR para seleccionar la mejor) y filtrar para ampliar datasets de lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,6-3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs consumer de 8 GB o mas.
- Cuantizacion: los pesos se publican en bf16; no se documentan versiones GGUF ni cuantizaciones oficiales, aunque al tratarse de un modelo de 1,3B es convertible a 4-8 bits con herramientas estandar.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; para despliegue por lotes a gran escala, A100 o H100 aportan mayor throughput pero no son necesarias.
- Opciones de despliegue: transformers con el tokenizador del repositorio (requisito explicito de la model card), vLLM o TGI para servir en produccion, llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeardedMonster/gemma-3-1b-csw-best | 1,3B | no disponible | Code-switching e idiomatizacion en 37 lenguas africanas | other (atribucion + Gemma Terms) | Hugging Face |
| google/gemma-3-1b-it | 1,3B | no disponible en esta ficha | Instrucciones generales multilingues | Gemma Terms of Use | Hugging Face |
| Modelos de traduccion tipo NLLB-200 | hasta 54B (variantes) | no disponible | Traduccion multilingue, incluidas lenguas africanas | CC-BY-NC en la variante grande | Hugging Face |

La comparacion con modelos de traduccion es solo orientativa: este modelo no traduce, sino que mezcla idiomas y reescribe con modismos, una funcion que los modelos genericos no ofrecen de forma controlada ni etiquetada.

## Limitaciones y advertencias

- Todo el contenido generado es sintetico: la propia model card exige filtrar las salidas y revisarlas por un hablante nativo antes de usarlas en produccion o en datasets.
- Riesgo de alucinacion y de modismos inventados o mal atribuidos, especialmente en lenguas de bajos recursos con poca representacion en el preentrenamiento de Gemma 3.
- El protocolo de prompt es estricto: etiquetas en texto plano, codigos de tres letras entre parentesis angulares, dos espacios tras los dos puntos y tokenizador del repositorio. Un prompt mal formado produce salidas invalidas.
- Si la respuesta no incluye el bloque `<dev>`, la model card indica tratarla como invalida y volver a muestrear.
- Solo funciona con los pares de lenguas recogidos en la tabla de la model card; no admite combinaciones arbitrarias.
- No traduce; usarlo como traductor dara resultados incorrectos.
- La lista de idiomas de los metadatos (22 codigos) no coincide con las 37 lenguas que afirma cubrir la model card, lo que genera ambiguedad sobre la cobertura real.
- Licencia "other": el uso comercial es libre con atribucion a AletheiaAING y sujeta ademas a los Gemma Terms of Use, que imponen restricciones de uso aceptable que deben revisarse antes de integrar el modelo en un producto.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al derivar de Gemma 3 1B hereda los sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Perfil del autor de la atribucion (AletheiaAING): https://huggingface.co/AletheiaAING
- Gemma Terms of Use: no disponible en la informacion proporcionada (referenciado en la model card)
