# Psalms23Wave/alkebulan-luganda-small-v0.1

## Resumen

Alkebulan Luganda Small v0.1 es el primer modelo de lenguaje del proyecto Alkebulan AI, desarrollado por Mathew Sekanjako (Psalms23Wave LLC). Se trata de un transformer decoder-only de 1.695.232 parámetros, diseñado exclusivamente para generar texto en luganda (idioma bantú hablado principalmente en Uganda). El modelo emplea el tokenizador ABLT 2.0, creado por el mismo autor, que segmenta el luganda según su gramática en lugar de hacerlo por frecuencia de bytes o subpalabras convencionales.

El modelo resuelve un problema muy concreto: demostrar que es posible entrenar un modelo funcional de luganda con recursos mínimos (un MacBook M1 Pro, 75 segundos de entrenamiento) y con un tokenizador lingüísticamente informado. No pretende competir con modelos multilingües de gran escala; su relevancia radica en ser una prueba de concepto reproducible y en establecer una base sobre la que el autor planea iterar (versión 0.2 con ABLT 2.1 y, posteriormente, conexión de ABLT a modelos abiertos mayores).

La arquitectura es un transformer de 4 capas, 4 cabezas de atención y anchura 128, con una ventana de contexto de solo 64 tokens (piezas ABLT). El modelo fue entrenado con 58.346 líneas únicas de luganda, en su mayoría procedentes del dataset SALT de Sunbird AI. Su función es la continuación de texto: no responde preguntas, no traduce ni sigue instrucciones. La puntuación declarada en texto reservado es de 1,5055 bits por carácter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 1.695.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 piezas ABLT |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Luganda (lg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 4 capas, 4 cabezas de atención y una dimensión de modelo de 128. La ventana de contexto es de 64 piezas del tokenizador ABLT 2.0, que cuenta con un vocabulario de 6.981 piezas. El tokenizador ABLT (A Bantu Language Tokenizer) segmenta el luganda según su estructura gramatical, de modo que la decodificación reconstruye el texto exacto; el autor lo publica como paquete instalable mediante `pip install ablt`.

El entrenamiento se realizó durante 3.000 pasos sobre un MacBook con chip M1 Pro (GPU de Apple), con una duración aproximada de 75 segundos. Se utilizaron 58.346 líneas únicas de texto en luganda, mayoritariamente del dataset SALT de Sunbird AI (licencia CC BY-SA 4.0). Una de cada diez líneas se reservó antes del entrenamiento para evaluar el modelo, obteniendo una puntuación de 1,5055 bits por carácter en ese conjunto de validación. El optimizador empleado es Sekan, desarrollado por el propio autor, cuyo método no forma parte de esta release. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto en luganda mediante continuación de una apertura dada (prompt).
- Producción de oraciones con concordancia gramatical nominal y adjetival correcta en luganda (por ejemplo, `abantu abamu`, `amakungula amayonjo`).
- Generación con muestreo controlado por el parámetro `--draw`, que permite obtener continuaciones distintas para una misma apertura.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta modo thinking, visión ni audio.
- No es multilingüe: solo genera luganda.
- No responde preguntas, no traduce y no sigue instrucciones; su única tarea es la continuación de texto.

## Casos de uso

- Generación de texto sintético en luganda para aumentar corpus de entrenamiento: el modelo puede producir oraciones gramaticalmente plausibles que, tras revisión humana, sirvan para ampliar datasets de luganda en proyectos de NLP de bajos recursos.
- Prueba de concepto de tokenizadores lingüísticamente informados: investigadores pueden evaluar cómo un tokenizador basado en gramática bantú afecta a la generación en un modelo mínimo, como base para decisiones de diseño en modelos mayores.
- Demostración educativa de entrenamiento de modelos de lenguaje: el modelo, entrenado en 75 segundos en un portátil, sirve para ilustrar el flujo completo (tokenizador, entrenamiento, generación) en cursos o talleres sobre NLP de bajos recursos.
- Evaluación comparativa de tokenizadores para lenguas bantúes: permite medir la calidad de continuación de texto con ABLT 2.0 frente a tokenizadores genéricos en un entorno controlado y reproducible.
- Prototipado rápido de aplicaciones de continuación de texto en luganda: desarrolladores pueden integrar el modelo para autocompletar frases en herramientas de escritura o edición en luganda, siempre con revisión humana.
- Investigación sobre optimizadores: dado que emplea el optimizador Sekan del autor, sirve como caso de estudio para comparar dinámicas de entrenamiento en modelos pequeños, aunque el método del optimizador no se publica en esta release.
- Generación de ejemplos lingüísticos para documentación o enseñanza del luganda: el modelo puede producir oraciones de ejemplo con concordancia gramatical que un hablante nativo puede validar y reutilizar en materiales didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento declarado es la puntuación en texto reservado: 1,5055 bits por carácter.

| Metrica | Valor |
|---|---|
| Bits por caracter (texto reservado) | 1,5055 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (1,7 M de parámetros en safetensors); en la práctica, unos pocos cientos de MB incluyendo el tokenizador y el runtime de PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor lo entrenó en una GPU integrada Apple M1 Pro. Para inferencia, una RTX 3060 o superior es más que suficiente.
- Cabe en cualquier GPU consumer, e incluso en CPU sin problemas de rendimiento apreciables dado el tamaño del modelo.
- Opciones de despliegue: el repositorio incluye `model.py` (PyTorch) y `generate.py`; requiere `pip install ablt torch safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El entrenamiento de 3.000 pasos tardó unos 75 segundos en M1 Pro, lo que da una idea del reducido coste computacional, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de luganda con características equivalentes (mismo tamaño, mismo tokenizador o misma tarea) en la documentación proporcionada. El autor menciona dos modelos de traducción abiertos usados para validar las salidas (`Helsinki-NLP/opus-mt-lg-en` y `facebook/nllb-200-distilled-600M`), pero no son alternativas comparables en la tarea de generación de luganda.

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| Alkebulan Luganda Small v0.1 | 1,7 M | 64 piezas ABLT | Apache 2.0 | Continuación de texto en luganda |
| Helsinki-NLP/opus-mt-lg-en | no disponible | no disponible | no disponible | Traducción luganda-inglés |
| facebook/nllb-200-distilled-600M | 600 M | no disponible | no disponible | Traducción multilingüe |

## Limitaciones y advertencias

- El modelo es extremadamente pequeño: genera una sola oración que puede sonar correcta, pero el significado a menudo se desvía.
- No puede responder preguntas, traducir ni seguir instrucciones; solo continúa texto.
- Gran parte del texto de entrenamiento proviene de la Biblia, por lo que aparecen con frecuencia reyes, Babilonia y Jerusalén, lo que introduce un sesgo temático claro.
- Con algunas aperturas el modelo termina la línea de inmediato y no añade nada.
- Los ejemplos de generación fueron revisados por un solo hablante de luganda y dos modelos de traducción; no se ha realizado una lectura a ciegas por varios hablantes.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` en cualquier copia o trabajo derivado.
- ABLT, Sekan y Alkebulan AI son marcas registradas de Psalms23Wave LLC; el método del optimizador Sekan no forma parte de esta release.
- El texto de entrenamiento procede mayoritariamente del dataset SALT (CC BY-SA 4.0), lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas del corpus, independientemente de la licencia del modelo.
- Riesgo de alucinación elevado en cuanto a contenido factual, dado el tamaño y la naturaleza del corpus.
- Ventana de contexto de solo 64 piezas, insuficiente para conversaciones multi-turno o documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Psalms23Wave/alkebulan-luganda-small-v0.1
- Tokenizador ABLT: https://huggingface.co/Psalms23Wave/ablt-luganda
- Archivos del proyecto Alkebulan AI: https://huggingface.co/Psalms23Wave/Alkebulan-AI
- Dataset SALT de Sunbird AI: https://github.com/SunbirdAI/salt
- Web del autor: https://www.sekanjakomathew.com
- Contacto: https://www.psalms23wave.com/contact
