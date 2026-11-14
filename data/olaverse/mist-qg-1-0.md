# olaverse/MIST-QG-1.0

## Resumen

MIST-QG-1.0 es un modelo de generación de preguntas desarrollado por olaverse, un fine-tune completo de Qwen3.5-4B-Base. Su función es leer un pasaje y generar las preguntas que ese pasaje responde, en el mismo idioma del pasaje o en inglés o francés. Está diseñado específicamente para producir datos de entrenamiento para sistemas de recuperación (retrieval), generando pares consulta-pasaje que un embedder o reranker puedan aprovechar. Forma parte de la familia MIST de Olaverse, junto a MIST-Embed y MIST-Rerank.

El modelo cubre 324 idiomas según la model card, con un foco explícito en lenguas africanas (yoruba, igbo, hausa, swahili, zulú, xhosa, amárico, somalí, kinyarwanda, kirundi, afrikáans, oromo, tigriña, shona, sesoto, setsuana, malgache, lingala, wolof, ewé, twi, chichewa, luganda, entre otras). Con 4.539.265.536 parámetros, está pensado para ejecutarse en una sola GPU con vLLM y generar preguntas para millones de pasajes de forma práctica.

Su relevancia actual radica en que aborda un cuello de botella concreto: la escasez de datos de entrenamiento de retrieval de calidad en idiomas de bajos recursos. El modelo genera preguntas en las propias palabras del modelo (no copiadas del pasaje) y mantiene la lengua solicitada con alta fidelidad, lo que lo hace útil como generador de datos sintéticos multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura vision-lenguaje (Qwen3.5); MIST-QG usa solo la parte de texto |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=4096`) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 324 idiomas segun la model card; lista declarada: en, fr, yo, ig, ha, sw, zu, xh, am, so, rw, rn, af, om, ti, sn, st, tn, mg, ln, wo, ee, tw, ny, lg |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

MIST-QG-1.0 es un fine-tune completo (full fine-tune) de Qwen/Qwen3.5-4B-Base. Qwen3.5 es una arquitectura vision-lenguaje, por lo que el modelo se carga con `AutoModelForImageTextToText`; sin embargo, MIST-QG utiliza únicamente la parte de texto del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable está en el diseño del objetivo de entrenamiento: se eliminaron las muestras que copiaban literalmente una frase del pasaje, de modo que el modelo aprende a reformular preguntas en sus propias palabras. Según la model card, solo el 7,5 % de sus preguntas copian el pasaje (9,1 % en idiomas africanos, frente al 12,5 % de Llama 3.3 70B). El prompt es texto plano sin plantilla de chat, y el modelo responde con una pregunta por línea precedida de `- `, deteniéndose después.

## Capacidades

- Generación de preguntas a partir de un pasaje, en el idioma del pasaje o en inglés/francés (cross-lingual).
- Generación de consultas (query generation) para entrenamiento de sistemas de retrieval.
- Producción de datos sintéticos de alta calidad para embedders y rerankers.
- Multilingüismo amplio: 324 idiomas según la model card, con foco en lenguas africanas.
- Generación de preguntas en las propias palabras del modelo, evitando copiar fragmentos del pasaje.
- Control de idioma de salida mediante instrucción explícita en el prompt (nombre del idioma escrito completo).
- Salida estructurada: una pregunta por línea con prefijo `- `, con parada tras la lista.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de datos de entrenamiento para retrieval multilingüe: el modelo convierte pasajes crudos en pares consulta-pasaje que alimentan el entrenamiento de embedders y rerankers, cubriendo idiomas donde no existen datasets de preguntas.
- Expansión de corpus de bajos recursos: para lenguas africanas con pocos datos anotados, MIST-QG genera preguntas en el propio idioma (94,5 % en el idioma correcto en la evaluación) que sirven como supervisión sintética.
- Creación de benchmarks de recuperación cross-lingual: pidiendo preguntas en inglés sobre pasajes en hausa, oromo o malgache (99,7 % en el idioma solicitado), se construyen conjuntos de evaluación para sistemas de búsqueda multilingüe.
- Aumento de datasets de QA: a partir de documentos existentes se generan preguntas que el documento responde, útiles para tareas de question answering extractivo.
- Generación de consultas para motores de búsqueda internos: el modelo produce consultas realistas (99,8 % de preguntas reales según la model card) para evaluar y ajustar pipelines de búsqueda sobre corpus documentales.
- Enriquecimiento de bases de conocimiento: procesar millones de pasajes con vLLM en una sola GPU para producir pares de entrenamiento a escala, dado que el modelo de 4B cabe en un solo acelerador.
- Investigación en lingüística computacional: análisis de la capacidad de reformulación y control de idioma en 324 lenguas con un modelo de tamaño contenido.

## Benchmarks y rendimiento

Los datos de la model card miden la proporción de preguntas "usables" (respondibles, que recuperan su propio pasaje, no copiadas y en el idioma solicitado). Los pasajes de test nunca se usaron en entrenamiento: 2.249 pasajes en 238 idiomas (mismo idioma) y 340 pasajes en 153 idiomas (cross-lingual).

| Proporcion usable | Todos los idiomas | Africanos | Cross-lingual | Cross-lingual, pasajes africanos |
|---|---|---|---|---|
| MIST-QG-1.0 (4B) | 0,445 | 0,363 | 0,768 | 0,682 |
| Gemma 4 31B | 0,562 | 0,420 | 0,643 | 0,565 |
| Llama 3.3 70B | 0,497 | 0,359 | 0,676 | 0,602 |
| Preguntas de referencia | 0,493 | 0,410 | 0,900 | 0,875 |

| MIST-QG-1.0, detalle | Todos los idiomas | Africanos | Cross-lingual |
|---|---|---|---|
| Preguntas por pasaje | 1,79 | 2,48 | 1,00 |
| Preguntas reales | 99,8 % | 99,8 % | 100 % |
| Copiadas del pasaje | 7,5 % | 9,1 % | 0,0 % |
| En el idioma correcto | 89,6 % | 94,5 % | 99,7 % |
| Respondibles (juez, 0-1) | 0,856 | 0,851 | 0,821 |
| Encuentra su pasaje (R@1) | 0,630 | 0,504 | 0,918 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 4,5B parámetros en bfloat16 requiere aproximadamente 9 GB solo para pesos, más memoria para KV cache y activaciones; en cuantizaciones de 8 o 4 bits el requisito baja sustancialmente, pero no se han publicado cifras oficiales.
- GPU recomendadas: la model card indica que "runs comfortably on a single GPU with vLLM"; no se especifican modelos concretos.
- GPU de consumo: no confirmado en la informacion proporcionada, aunque el tamaño del modelo sugiere que podría caber en GPUs de consumo con cuantización.
- Opciones de despliegue: vLLM (recomendado por el autor, con `max_model_len=4096`) y transformers (`AutoModelForImageTextToText`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Usable (todos) | Usable (africanos) | Usable (cross-lingual) | Licencia |
|---|---|---|---|---|---|---|
| MIST-QG-1.0 | 4,5B | No disponible | 0,445 | 0,363 | 0,768 | Apache 2.0 |
| Gemma 4 31B | 31B | No disponible | 0,562 | 0,420 | 0,643 | No disponible |
| Llama 3.3 70B | 70B | No disponible | 0,497 | 0,359 | 0,676 | No disponible |

MIST-QG-1.0 sacrifica rendimiento en el agregado global frente a modelos mucho mayores (Gemma 4 31B lo supera en todos los idiomas y en africanos), pero es claramente superior en el escenario cross-lingual (0,768 frente a 0,643 y 0,676) con un tamaño 7-15 veces menor. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- En el agregado de todos los idiomas, la proporción de preguntas usables (0,445) es inferior a la de Gemma 4 31B (0,562) y a la de las preguntas de referencia (0,493); el modelo no es el mejor generador de preguntas en términos absolutos, sino en eficiencia y en cross-lingual.
- El R@1 en idiomas africanos es de 0,504, lo que indica que aproximadamente la mitad de las preguntas no recuperan su propio pasaje en la búsqueda; conviene filtrar o validar los datos generados.
- El 7,5 % de las preguntas copian el pasaje (9,1 % en africanos), lo que puede introducir sesgo de lexical overlap en los datos de entrenamiento derivados.
- El 89,6 % de las preguntas en el agregado global están en el idioma correcto (94,5 % en africanos); existe una fracción no despreciable de salidas en el idioma equivocado.
- Riesgo de alucinación: el modelo puede generar preguntas que el pasaje no responde realmente; la model card usa un juez (Qwen3.6-35B-A3B) para verificar respondibilidad, lo que sugiere que la validación automática es necesaria en producción.
- El prompt no usa plantilla de chat y requiere nombres de idioma completos; un uso incorrecto del formato degrada la calidad de salida.
- No se documentan sesgos específicos más allá de los derivados del corpus de entrenamiento (no disponible).
- Licencia Apache 2.0: permite uso comercial, pero no se detallan restricciones adicionales del modelo base Qwen3.5 en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/MIST-QG-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
