# RNDRandoM/gemma-4-e2b-pruning-exp

## Resumen

RNDRandoM/gemma-4-e2b-pruning-exp es un checkpoint derivado de google/gemma-4-E2B-it en el que se ha recortado el vocabulario del tokenizer de 262.144 a 103.351 tokens (ampliado a 103.360 filas con relleno cero). El autor lo publica como trabajo de la asignatura «Modern Methods and Algorithms of Generative AI» del Skoltech (otoño de 2026) y no ha realizado ningún entrenamiento: únicamente ha aplicado un mapeo de identificadores (nuevo id -> id antiguo, en `pruning.json`) para rebanar la matriz de embeddings de entrada (ligada a la cabeza de salida) y la tabla de embeddings por capa, remapeando además todos los campos de identificadores de token en los ficheros de configuración.

El resultado es un modelo con 3.437.700.675 parámetros reales (frente a los 5,10 B declarados por el autor para el checkpoint original, un -32,7 %) y un checkpoint en bf16 de 6,4 GiB (frente a 9,54 GiB). La poda conserva todos los tokens que aparecen al menos una vez al tokenizar 12 MB de Wikipedia en inglés (`wikimedia/wikipedia`, `20231101.en`), más los tokens especiales y añadidos, el alfabeto base del tokenizer y el cierre de merges de BPE (todo fragmento intermedio generado al construir un token conservado). El coste es pequeño pero medible: las bits per byte en un conjunto retenido de 1 MB de Wikipedia inglesa pasan de 1,495 a 1,526 y MMLU-Pro (12.032 preguntas, respuesta directa) baja de 31,55 a 31,16.

Su relevancia es acotada y experimental: sirve para estudiar cuánto del vocabulario multilingüe de un modelo se puede eliminar sin degradar tareas en inglés, y demuestra que la reducción de parámetros en la capa de embeddings de un modelo pequeño es sustancial (de 5,10 B a 3,44 B, casi un tercio menos). No es un modelo listo para producción multilingüe: el texto fuera del vocabulario de Wikipedia en inglés (otros alfabetos, parte del markdown, palabras en MAYÚSCULAS) se fragmenta en piezas más pequeñas o bytes y se genera de forma menos fiable, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer derivado de Gemma 4 E2B-it (no se detalla la variante interna; el modelo base usa `AutoModelForImageTextToText`, lo que implica entrada de texto e imagen) |
| Parametros totales | 3.437.700.675 (3,44 B); el autor declara 5,10 B para el checkpoint original antes de la poda |
| Longitud de contexto | no disponible en la model card del modelo podado; las fuentes sobre el modelo base discrepan (hasta 256K tokens según Google; 8K según una fuente de terceros) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bf16); al ser safetensors estandar es cuantizable con herramientas habituales, pero no se documenta |
| Idiomas soportados | en (inglés); el vocabulario podado se limita al inglés de Wikipedia, aunque el modelo base declara soporte multilingüe en más de 140 idiomas |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (bf16); tamano del repositorio 6,9 GB |
| Vocabulario | 103.351 tokens reales, ampliado a 103.360 filas con relleno cero (filas 103.351-103.359) |
| Modelo base | google/gemma-4-E2B-it |
| Requisito de carga | `transformers` 5.14 (`AutoModelForImageTextToText`, `AutoTokenizer`) |

## Arquitectura y entrenamiento

No hay entrenamiento. El procedimiento es puramente estructural: se tokenizan 12 MB de Wikipedia en inglés, se conserva cada token que aparece al menos una vez, se añaden los tokens especiales y añadidos, el alfabeto base del tokenizer y el cierre de rutas de merges de BPE (los fragmentos intermedios que el algoritmo genera al construir cada token conservado), y se construye un mapa `pruning.json` con la correspondencia nuevo id -> id antiguo. Con ese mapa se rebanan la matriz de embeddings de entrada (ligada con la cabeza de salida) y la tabla de embeddings por capa, y se remapean todos los campos de identificadores de token en los ficheros de configuración. Al no haber fine-tuning, los pesos de las filas conservadas son idénticos a los del checkpoint original: el modelo es funcionalmente equivalente para cualquier texto que se tokenice con los mismos identificadores que antes de la poda.

El interés técnico está en el desglose del coste. La poda reduce el vocabulario un 60,6 % (de 262.144 a 103.351 tokens) y los parámetros un 32,7 % (de 5,10 B a 3,44 B), porque en un modelo de este tamaño la tabla de embeddings representa una fracción muy alta del total. La degradación medida es modesta en inglés: 0,031 bits per byte adicionales en 1 MB de Wikipedia retenida y 0,39 puntos menos en MMLU-Pro. La innovación, si se puede llamar así, es el uso de cierre de merges de BPE en lugar de conservar solo los tokens vistos directamente, lo que evita que el tokenizer se vuelva incapaz de componer piezas que antes sí podía formar. No se documenta decodificación especulativa, atención lineal ni ninguna otra modificación arquitectónica sobre el modelo base, aunque Google sí incluye un modelo borrador para decodificación especulativa en toda la familia Gemma 4.

## Capacidades

- Generación de texto en inglés: es la tarea principal para la que el vocabulario podado está optimizado, al haberse construido el conjunto de tokens a partir de Wikipedia en inglés.
- Razonamiento y conocimiento general: MMLU-Pro (12.032 preguntas, respuesta directa) se mantiene en 31,16 frente a 31,55 del original, por lo que conserva la mayor parte de la capacidad de respuesta directa del modelo base.
- Capacidad multimodal heredada: el checkpoint se carga con `AutoModelForImageTextToText`, la misma clase que el modelo base, lo que sugiere soporte de entrada de imagen y texto. El autor no documenta ni evalúa esta capacidad tras la poda.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card ni se aportan pruebas). El modelo base Gemma 4 se orienta a flujos agénticos, pero no hay verificación para este derivado.
- Agentes y razonamiento multi-paso: no disponible. El modelo base está descrito por Google como adecuado para flujos agénticos, pero el autor no evalúa esta capacidad tras la poda.
- Capacidades multilingües: descartadas en la práctica. El vocabulario se ha limitado al inglés y el propio autor advierte que el texto fuera de ese vocabulario (otros alfabetos, parte del markdown, palabras en mayúsculas) se escribe con piezas más pequeñas o bytes y se genera de forma menos fiable.
- Modo de pensamiento o razonamiento extendido: no disponible.
- Relleno cero eliminable: el modelo expone filas de relleno (103.351-103.359) que deben suprimirse en generación, lo que en la práctica equivale a un vocabulario efectivo de 103.351 tokens.

## Casos de uso

- Estudio académico de compresión de vocabularios: el checkpoint es directamente reproducible con `pruning.json` y los scripts descritos, y permite medir el compromiso entre número de parámetros y bits per byte en un modelo real. Es el uso para el que se publicó.
- Evaluación de la degradación fuera de dominio: sirve para cuantificar cuánto empeora la generación cuando el texto de entrada contiene alfabetos no latinos, markdown o siglas en mayúsculas, ya que el vocabulario no cubre esas piezas de forma nativa.
- Inferencia local en inglés con presupuesto de VRAM ajustado: con 3,44 B de parámetros y 6,4 GiB en bf16, el modelo puede desplegarse donde el checkpoint original de 9,54 GiB no cabría, siempre que el tráfico sea exclusivamente en inglés.
- Comparativas controladas de tokenizers: al conservar exactamente los mismos pesos que el modelo base en las filas supervivientes, permite aislar el efecto del tokenizer sobre métricas de perplejidad o bits per byte sin contaminación por diferencias de entrenamiento.
- Prototipado de pipelines de NLP en inglés: clasificación, resumen o extracción sobre texto inglés estándar (noticias, documentación, artículos enciclopédicos) donde la pérdida de 0,39 puntos en MMLU-Pro es aceptable frente al ahorro de memoria.
- Docencia sobre tokenización BPE: el repositorio documenta explícitamente el cierre de merges y el remapeo de identificadores, lo que lo convierte en un caso de estudio práctico para explicar cómo funciona el vocabulario de un modelo moderno.
- Investigación sobre cabezas de salida y embeddings ligados: permite medir experimentalmente cuánto aportan los embeddings multilingües a la calidad final en tareas inglesas, rebanándolos de forma selectiva.

## Benchmarks y rendimiento

Datos aportados por el autor en la model card, comparando el modelo original con el podado:

| Metrica | Original (Gemma 4 E2B-it) | Podado (m = 1) |
|---|---:|---:|
| Vocabulario (tokens) | 262.144 | 103.351 |
| Parametros | 5,10 B | 3,44 B (-32,7 %) |
| Checkpoint bf16 | 9,54 GiB | 6,4 GiB |
| Bits per byte (Wikipedia inglesa retenida, 1 MB) | 1,495 | 1,526 |
| MMLU-Pro (12.032, respuesta directa) | 31,55 | 31,16 |

No se han publicado otros resultados de benchmarks en la informacion disponible (no hay HumanEval, GSM8K, MMLU completo, ni evaluaciones multimodales o multilingües).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el checkpoint ocupa 6,4 GiB y el repositorio completo 6,9 GB; con overhead de activaciones y caché KV conviene reservar entre 8 y 10 GB. En int8 bajaría a unos 3,5-4 GB y en cuantizaciones de 4 bits a unos 2-2,5 GB, aunque el autor no publica cuantizaciones ni cifras verificadas.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede alojar el modelo en bf16 con margen justo; a partir de 12-16 GB (RTX 4070 Ti, 4080, 4090, L4, A10G) la inferencia es holgada. Para servir en producción con lotes grandes tiene sentido usar A100 o H100, aunque por tamaño el modelo está claramente por debajo de lo que exigen esas tarjetas.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4090 de 24 GB lo ejecutan sin problemas en bf16, y tarjetas de 8 GB lo harían con cuantización.
- Opciones de despliegue: la vía documentada es `transformers` 5.14 con `AutoModelForImageTextToText` y `AutoTokenizer`, más el remapeo de identificadores de `pruning.json`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto, y hay que tener en cuenta que el vocabulario modificado (103.351 tokens más 9 filas de relleno) puede requerir conversión y un `tokenizer.json` ajustado antes de usarlo en esos motores.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia, aunque al haber un 32,7 % menos de parámetros y una capa de embeddings mucho más pequeña, la decodificación debería ser algo más rápida y ocupar menos memoria de forma proporcional.
- Advertencia de memoria: el usuario debe suprimir las filas de relleno 103.351-103.359 durante la generación, ya que son ceros y no corresponden a tokens reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RNDRandoM/gemma-4-e2b-pruning-exp | 3,44 B | no disponible | MMLU-Pro 31,16; 1,526 bits per byte | gemma | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-E2B-it | 5,10 B (según el autor); 2,1 B según una fuente de terceros | hasta 256K según Google; 8K según una fuente de terceros | MMLU-Pro 31,55; 1,495 bits per byte | gemma | HuggingFace, modelo base oficial |
| Otros modelos del mismo rango (Gemma 4 E4B, 12B, 26B A4B, 31B) | 4 B a 31 B, con variantes densas y MoE | hasta 256K | no disponible en la informacion proporcionada | gemma | HuggingFace y Google AI for Developers |
| Alternativas de terceros de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación limpia solo es posible contra el propio modelo base, porque el autor aporta las dos columnas de métricas. Frente al resto de la familia Gemma 4 no hay datos de benchmarks comparables en la información disponible, y existe una discrepancia notable sobre el tamaño del E2B original: la model card del derivado indica 5,10 B y una fuente de terceros (gemma4.dev) habla de 2,1 B, text-only y 8K de contexto, mientras que la documentación oficial de Google describe la familia con contextos de hasta 256K y más de 140 idiomas. Esa discrepancia no se resuelve con los datos disponibles y afecta directamente a la interpretación del ahorro de parámetros.

## Limitaciones y advertencias

- Rendimiento degradado fuera del vocabulario de Wikipedia inglesa: otros sistemas de escritura, parte del markdown y las palabras en MAYÚSCULAS se tokenizan con fragmentos más pequeños o bytes, y el autor confirma que se generan de forma menos fiable.
- Multilingüismo prácticamente eliminado: aunque el modelo base declara más de 140 idiomas, el vocabulario podado se ha construido exclusivamente con texto inglés, por lo que el uso en otros idiomas debe considerarse no soportado.
- Degradación medible incluso en inglés: 1,526 bits per byte frente a 1,495 y 31,16 frente a 31,55 en MMLU-Pro. La pérdida es pequeña, pero es una pérdida real y medida sobre el dominio de origen de la poda.
- Riesgo de alucinación: no se ha evaluado específicamente. Dado que el modelo no ha pasado por ningún proceso de alineamiento adicional y que su base es un modelo pequeño de 3,44 B, el riesgo de invención de hechos es alto en tareas de conocimiento, como sugiere un MMLU-Pro de 31,16.
- Filas de relleno: las filas 103.351-103.359 de los embeddings son ceros y deben suprimirse en generación; ignorarlas puede producir salidas incoherentes.
- Compatibilidad de herramientas: al modificar el vocabulario y el tokenizer, el checkpoint puede no cargar directamente en motores como llama.cpp, Ollama, vLLM o TGI sin una conversión previa y sin adaptar el `tokenizer.json`.
- Licencia gemma: el uso comercial está sujeto a los Gemma Terms of Use, que incluyen una política de uso prohibido y obligaciones de atribución y distribución de términos para los modelos derivados. El repositorio no añade aclaraciones adicionales.
- Madurez y soporte: 0 descargas y 0 likes, sin pipeline declarado, creado y actualizado con 41 segundos de diferencia, sin issues ni mantenimiento posterior. Es un artefacto académico, no un modelo con soporte.
- Falta de evaluación multimodal, agéntica y de tool calling: el modelo se carga con la clase multimodal del base, pero no hay ninguna métrica que confirme que esas capacidades sobreviven a la poda.
- Datos no verificados: el desglose de parámetros (5,10 B -> 3,44 B), las bits per byte y MMLU-Pro provienen únicamente de la model card del autor, sin réplica independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RNDRandoM/gemma-4-e2b-pruning-exp
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset utilizado para la poda: https://huggingface.co/datasets/wikimedia/wikipedia (configuración `20231101.en`)
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 en Google AI Edge (LiteRT-LM): https://developers.google.com/edge/litert-lm/models/gemma-4
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Visión general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Ficha de terceros sobre Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
