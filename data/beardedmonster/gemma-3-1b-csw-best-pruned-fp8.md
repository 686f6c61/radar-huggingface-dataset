# BeardedMonster/gemma-3-1b-csw-best-pruned-fp8

## Resumen

`BeardedMonster/gemma-3-1b-csw-best-pruned-fp8` es un ajuste fino del modelo `google/gemma-3-1b-it` de Google, publicado por el usuario BeardedMonster (con atribución requerida a AletheiaAING). El modelo está especializado en dos tareas concretas sobre texto en 37 lenguas africanas: code-switching (alternancia de lenguas dentro de una misma frase, etiquetada como `hm`) y reescritura con abundancia de expresiones idiomáticas (etiquetada como `ood`). No es un modelo de traducción ni un asistente generalista: su función es transformar texto existente en variantes que reflejen cómo hablan realmente los hablantes nativos.

Técnicamente es una variante "pruned" del modelo base: el vocabulario se ha reducido a 108.172 tokens y los pesos se han convertido a FP8 (8 bits) para su despliegue en vLLM. El resultado son aproximadamente 822 millones de parámetros reales (según los safetensors) y un repositorio de 0,9 GB. El autor afirma que la calidad se mantiene igual que la del modelo completo, aunque no aporta mediciones que lo respalden.

Su relevancia radica en el nicho: cubre lenguas africanas de bajos recursos (yoruba, hausa, igbo, suajili, zulú, xhosa, afrikáans, amárico, somalí, ruandés, lingala, luganda, etc.) con una interfaz de prompt muy específica y estructurada, orientada a la generación de datos sintéticos para entrenamiento, pruebas de robustez y localización de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`); detalles internos no disponibles |
| Parametros totales | 822.510.208 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (8 bits) en los pesos publicados; el autor no documenta otras variantes |
| Idiomas soportados | 37 lenguas africanas: yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (y las restantes hasta 37, no enumeradas en la información disponible) |
| Licencia | `other`: uso comercial y no comercial libre con atribución a AletheiaAING; se aplican además los Términos de Uso de Gemma de Google |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante de texto. Sobre esa base, el autor ha aplicado dos modificaciones: una poda de vocabulario hasta 108.172 tokens (frente al vocabulario original de Gemma 3, que no se detalla en la información disponible) y una conversión de pesos a FP8 para inferencia en vLLM. No se documentan ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado convencional.

La innovación principal no es arquitectónica sino de interfaz: el modelo se controla mediante etiquetas de tarea en texto plano (`<hm>` para code-switching, `<ood>` para reescritura idiomática), códigos de lengua de tres letras entre ángulos (`<yor>`, `<eng>`, `<pcm>`, `<hau>`) y un separador `+` para indicar la lengua de mezcla. La salida sigue un formato fijo con un bloque `<dev>...</dev>` que enumera las expresiones cambiadas o los modismos empleados, seguido del texto generado. Este marcado explícito convierte al modelo en una herramienta de generación de datos etiquetados, no solo de texto.

## Capacidades

- Code-switching controlado: transforma texto en inglés o en la lengua base a una versión mezclada, especificando la lengua de mezcla (`eng_hm`, `m_hm`).
- Reescritura idiomática: convierte texto plano en una versión coloquial y rica en refranes, comparaciones y expresiones nativas (`eng_ood`, `m_ood`).
- Combinación de ambas: reescritura idiomática preservando el code-switching ya presente (`hm_ood`).
- Etiquetado de spans: el bloque `<dev>` marca las frases cambiadas o los modismos usados, lo que permite usarlo como generador de datos anotados.
- Cobertura multilingüe en 37 lenguas africanas, incluyendo pidgin nigeriano (`pcm`) en los ejemplos de la model card.
- Generación de texto conversacional e instruccional (pipeline `text-generation`, tag `conversational`).
- No realiza traducción convencional: el autor lo indica explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Generación de datos de chat code-switched: tomar datasets de instrucciones en inglés o en una sola lengua y convertirlos con `eng_hm` o `m_hm` en variantes mezcladas, para entrenar asistentes que entiendan cómo escriben realmente los usuarios bilingües.
- Creación de corpus para ASR y TTS: generar frases mezcladas para guiones de grabación y listas de palabras con las expresiones cambiadas; el audio debe grabarlo hablantes reales y el texto debe revisarlo un nativo.
- Pruebas de robustez de sistemas NLP: producir entradas mixtas para evaluar cómo responden chatbots, traductores, detectores de idioma y modelos de NER o análisis de sentimiento ante code-switching.
- Entrenamiento y evaluación de detectores de cambio de lengua: el bloque `<dev>` proporciona spans etiquetados directamente utilizables como ground truth.
- Redacción de copy y diálogos con tono natural: reescritura `ood` de textos planos para relatos, diálogos de videojuegos, publicaciones sociales o anuncios, con revisión posterior por un hablante nativo.
- Material didáctico para aprendizaje de lenguas: mostrar a estudiantes cómo alternan lenguas los hablantes y qué refranes emplean en contextos cotidianos.
- Aumento de datos para modelos propios: muestrear varias salidas por prompt (o aplicar MBR para seleccionar la mejor) y filtrar para ampliar datasets de entrenamiento en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma que la calidad es la misma que la del modelo completo `gemma-3-1b-csw-best`, pero no aporta métricas, comparaciones ni evaluaciones humanas que lo cuantifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para los pesos FP8 (repositorio de 0,9 GB), más overhead de KV cache y runtime; con contexto corto cabe holgadamente en 2-4 GB.
- GPU recomendadas: el autor orienta el modelo a vLLM, lo que implica GPUs de datacenter (A100, H100, L40S) o GPUs consumer con soporte FP8 (serie RTX 40 en adelante). Para uso ligero, cualquier GPU consumer con 4 GB o más debería bastar.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño reducido.
- Opciones de despliegue: vLLM es el runtime objetivo declarado (pesos FP8); no se documenta compatibilidad con llama.cpp, Ollama o TGI. Para estos últimos habría que reconvertir los pesos, algo no soportado oficialmente por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best-pruned-fp8 | 822 M | No disponible | Code-switching e idiomas en 37 lenguas africanas | Other (atribución + términos Gemma) | Hugging Face, FP8 para vLLM |
| google/gemma-3-1b-it | 1 B (aprox.) | No disponible en la información proporcionada | Asistente generalista multilingüe | Términos de Gemma | Hugging Face, safetensors |
| gemma-3-1b-csw-best (modelo completo del mismo autor) | No disponible | No disponible | Misma especialización, vocabulario completo | Other (atribución + términos Gemma) | Hugging Face |

No se dispone de información sobre otros modelos especializados en code-switching de lenguas africanas con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte de que algunas expresiones generadas son torpes o inventadas (cita el caso del pidgin nigeriano); la salida requiere filtrado y revisión por hablantes nativos antes de usarse.
- No es un modelo de traducción: forzarlo a traducir producirá resultados incorrectos o mezclas no deseadas.
- El formato de prompt es estricto: etiquetas en texto plano, códigos de tres letras entre ángulos, dos espacios tras los dos puntos y tokenizer del repositorio. Desviarse invalida la salida.
- Si falta el bloque `<dev>` en la respuesta, el autor indica que debe considerarse inválida y volver a muestrear; esto implica que la tasa de salidas válidas no está garantizada.
- Riesgo de alucinación en expresiones idiomáticas y culturales: puede generar refranes o comparaciones plausibles pero inexistentes.
- Sesgos no documentados: no hay información sobre evaluación de sesgos, toxicidad o representación dialectal dentro de cada lengua.
- Longitud de contexto no especificada, lo que dificulta planificar usos con documentos largos.
- Licencia con obligación de atribución a AletheiaAING y sujeción adicional a los Términos de Uso de Gemma; conviene revisar ambas antes de un despliegue comercial.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni informes independientes de calidad.
- Pesos en FP8 orientados a vLLM: la conversión a otros formatos (GGUF, por ejemplo) no está soportada oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-1b-csw-best-pruned-fp8
- Perfil del autor con atribución requerida: https://huggingface.co/AletheiaAING
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Términos de Uso de Gemma: no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible
