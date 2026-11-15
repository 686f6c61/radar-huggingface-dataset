# AletheiaAING/gemma-3-1b-csw-rl3-pruned-gguf

## Resumen

`AletheiaAING/gemma-3-1b-csw-rl3-pruned-gguf` es un modelo de generacion de texto derivado de `google/gemma-3-1b-it`, publicado por el usuario AletheiaAING en formato GGUF Q8_0 y orientado a dos tareas muy especificas sobre 37 lenguas africanas: el *code-switching* (mezclar una segunda lengua en el discurso de la lengua base, tal como hacen los hablantes nativos) y la reescritura idiomatica (convertir texto plano o literal en registro coloquial rico en expresiones). No es un modelo conversacional generalista: es un checkpoint especializado, resultado de un entrenamiento por refuerzo sobre un modelo supervisado previo, y su uso esperado es la reescritura controlada mediante etiquetas de tarea en el prompt.

El modelo conserva la arquitectura Gemma 3 de 1B parametros, pero su vocabulario ha sido podado de 262.144 a 108.172 tokens, y el fichero GGUF incluye la plantilla de chat embebida. El repositorio ocupa 0,9 GB y el fichero Q8_0 pesa 877 MB, con la cabeza de salida atada a la matriz de embeddings. La publicacion es muy reciente (noviembre de 2026) y no registra descargas ni interacciones, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

Su relevancia es acotada pero clara: cubre un nicho poco atendido (generacion idiomatica y code-switching en lenguas africanas de bajos recursos) con un modelo pequeno que corre en CPU, e ilustra una receta de RL sobre un modelo supervisado con evaluacion por chrF++ y decodificacion MBR. Para cualquier uso fuera de ese nicho, el modelo base `gemma-3-1b-it` es la referencia adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), cabeza de salida atada a embeddings |
| Parametros totales | 822.510.208 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor usa `-c 16384`) |
| Tipos de cuantizacion | Q8_0 (unico publicado en este repo) |
| Idiomas soportados | 37 lenguas africanas (tareas de code-switching e idiomaticas); lista completa no disponible |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | GGUF (`csw-gemma3-1b-rl3-pruned-Q8_0.gguf`, 877 MB); repo de 0,9 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 822 millones de parametros. Sobre esa base se aplico primero un entrenamiento supervisado y despues un ciclo de aprendizaje por refuerzo (RL); el checkpoint publicado corresponde al paso 150 de ese ciclo y se describe como el mejor en validacion (held-out). No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el algoritmo de RL empleado (RLHF, DPO u otro).

La innovacion tecnica mas concreta es la poda de vocabulario: se conservan 108.172 de los 262.144 tokens originales, y en el GGUF se recortan las filas de la matriz de embeddings y las tablas del tokenizer copiando bytes sin recuantizar; los ids de tokens especiales se remapean manteniendo intactos los ids 0-5. El modelo solo admite los pares de lenguas (base + lengua de cambio) que aparecen en la tabla de su model card; el resto se elimino del entrenamiento y de la evaluacion por considerarse poco naturales. La evaluacion reportada usa chrF++ y decodificacion por riesgo bayesiano minimo (MBR) con 16 muestras a temperatura 0,8.

## Capacidades

- Reescritura con code-switching (`<hm>`): inserta frases de una segunda lengua en un texto escrito en la lengua base, imitando el habla nativa.
- Reescritura idiomatica (`<ood>`): transforma texto plano o literal en registro coloquial con expresiones y giros propios de la lengua.
- Tareas combinadas (`hm_ood`): reescritura idiomatica preservando el code-switching ya presente en la entrada.
- Generacion de un bloque `<dev>` que lista los dispositivos usados (frases cambiadas de lengua o modismos empleados), copiados literalmente del texto generado.
- Formato de prompt estricto con etiquetas de tarea y de lengua (`<hm>`, `<ood>`, `<yor>`, `<eng>`, `<pcm>`, etc.).
- No se documentan tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada a las 37 lenguas africanas del entrenamiento y a los pares base-cambio soportados.

## Casos de uso

- Generacion de contenido en redes sociales para audiencias africanas: a partir de un texto en ingles o en la lengua base, el modelo produce una version con code-switching natural, adecuada para publicaciones que buscan cercania con hablantes bilingues.
- Localizacion de material divulgativo: reescritura idiomatica de textos tecnicos o institucionales para que suenen coloquiales en yoruba, pidgin nigeriano u otras lenguas soportadas, sin perder el mensaje.
- Creacion de corpus sinteticos para NLP de bajos recursos: el modelo puede generar pares de texto plano y texto idiomatico o con cambio de codigo, utiles para aumentar datos de entrenamiento de otros sistemas.
- Prototipado de asistentes conversacionales regionales: con `llama-server` y la API compatible con OpenAI, se puede montar un endpoint que reciba texto y devuelva la reescritura, integrable en un backend de chat existente.
- Investigacion sobre RL y decodificacion: sirve como caso de estudio reproducible de poda de vocabulario en GGUF, remapeo de ids especiales y decodificacion MBR con chrF++ como medida de acuerdo.
- Normalizacion de estilo en moderacion de contenido: convertir mensajes literales en versiones idiomaticas para analizar como se expresarian de forma natural y ajustar clasificadores entrenados con ese registro.
- Despliegue en hardware modesto: al pesar 877 MB en Q8_0 y generar unos 37 tokens/s en una CPU de 48 nucleos con un solo flujo, permite experimentar sin GPU.

## Benchmarks y rendimiento

La model card no presenta una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K). El unico dato cuantitativo reportado es de calidad de traduccion/reescritura medida con chrF++ sobre el conjunto de test completo:

| Metrica | Decodificacion greedy | MBR-16 (temp. 0,8) |
|---|---|---|
| chrF++ en el conjunto de test completo | 47,83 | 49,00 (+1,17) |
| Ganancia por tarea | no disponible | positiva en las cinco tareas |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 877 MB, por lo que cabe en cualquier GPU consumer con 2 GB o mas de VRAM libre; en CPU funciona sin GPU.
- GPU recomendadas: no se especifican; por tamano, cualquier RTX 3060 o superior, A100 o H100 lo ejecutan sobradamente, aunque el modelo esta pensado para CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluida la gama de entrada.
- Opciones de despliegue: `llama.cpp` (`llama-cli` y `llama-server`) es lo probado por el autor; la plantilla de chat esta embebida en el GGUF. Tambien deberia funcionar en cualquier runtime compatible con GGUF (Ollama, LM Studio), aunque no se documenta.
- Latencia y throughput: unos 37 tokens/s con un solo flujo en una CPU de 48 nucleos con el fichero Q8_0. El ejemplo de servidor usa contexto de 16.384 tokens y 8 slots paralelos (`-np 8`).
- Configuracion recomendada: temperatura 0 para reproducir los numeros reportados; MBR-16 multiplica por 16 el coste de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-csw-rl3-pruned (este) | 822 M (vocabulario podado a 108.172 tokens) | no disponible | Code-switching e idiomatico en 37 lenguas africanas | Gemma | GGUF Q8_0 en HF |
| google/gemma-3-1b-it | 1 B | no disponible | Asistente generalista multilingue | Gemma | Pesos originales en HF |
| Modelos de traduccion NMT dedicados (p. ej. NLLB) | variable | no disponible | Traduccion entre lenguas | variable | variable |

La comparacion con alternativas especializadas en code-switching o generacion idiomatica africana no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional general: solo responde correctamente al formato `<tarea> [+<cambio>]:  TEXTO` (con dos espacios tras los dos puntos) y sin system prompt.
- Solo admite los pares de lenguas base-cambio listados en su model card; otros pares fueron eliminados del entrenamiento y probablemente fallen.
- El bloque `<dev>` puede contener expresiones torpes o inventadas, como reconoce el propio autor en los ejemplos de la model card.
- Las salidas en pidgin nigeriano conservan abundante ingles, lo que puede degradar la naturalidad percibida.
- Riesgo de alucinacion en la generacion de modismos: el modelo puede producir expresiones que no existen en la lengua objetivo.
- La poda de vocabulario implica que el tokenizer no cubre el vocabulario completo original; textos con caracteres fuera del conjunto conservado pueden tokenizarse de forma degradada.
- No hay datos publicados sobre sesgos; al entrenarse sobre lenguas africanas y con RL, es previsible que reproduzca sesgos de los datos supervisados, pero no se cuantifica.
- La licencia Gemma impone condiciones de uso comercial y obligaciones de atribucion; hay que revisar sus terminos antes de desplegar en produccion.
- El repositorio no registra descargas ni validacion externa: el checkpoint es un artefacto de investigacion sin garantias de robustez.
- El rendimiento reportado (37 tokens/s) corresponde a CPU de 48 nucleos; en hardware menor el throughput sera considerablemente inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-rl3-pruned-gguf
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- llama.cpp (runtime probado por el autor): https://github.com/ggml-org/llama.cpp
