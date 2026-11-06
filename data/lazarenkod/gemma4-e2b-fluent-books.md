# lazarenkod/gemma4-e2b-fluent-books

## Resumen

Gemma 4 E2B para Fluent Books es un ajuste fino mediante LoRA de `google/gemma-4-E2B-it`, desarrollado por el usuario lazarenkod, orientado especificamente a la traduccion ingles-ruso dentro de la aplicacion de lectura Fluent Books (un lector de libros en ingles para hablantes de ruso). El modelo no es un traductor generico: esta entrenado sobre los prompts exactos que envia la aplicacion, incluyendo traduccion de oraciones, eleccion del sentido diccionarial de una palabra, explicaciones breves de vocabulario y gramatica, extraccion del sujeto y verbo principal de una oracion, y comprobacion binaria de si una expresion aparece en una frase.

La innovacion principal es la reduccion del vocabulario de 262.144 a 40.000 tokens (los mas frecuentes sobre el corpus de entrenamiento, Gutenberg y Wikipedia en ingles y ruso), lo que reduce drasticamente el tamano del modelo y lo hace viable en dispositivos moviles. El modelo se distribuye cuantizado en Q4_K_M (con la tabla de embeddings por capa en Q3_K e importance matrix), en un unico archivo GGUF de 1.350.381.280 bytes que la aplicacion descarga directamente y ejecuta con llama.cpp.

Con 2.296.946.211 parametros y un requisito de 8 GB de memoria en el dispositivo (unos 520 MB en uso durante la inferencia), el modelo esta disenado para traduccion de alta calidad en el dominio literario, con soporte explicito de contexto narrativo: el prompt puede incluir las dos oraciones anteriores de la novela para resolver genero gramatical, sexo del hablante o del interlocutor, y antecedentes de pronombres que una sola oracion no permite determinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), ajuste fino LoRA fusionado |
| Parametros totales | 2.296.946.211 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; el prompt admite un bloque de contexto con las dos oraciones anteriores |
| Tipos de cuantizacion | Q4_K_M con tabla de embeddings por capa en Q3_K e importance matrix |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 (copyright del modelo base: Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y aplica un LoRA de rango 32 y alpha 64 sobre las proyecciones de atencion y MLP de todas las capas. El vocabulario se recorto de 262.144 a 40.000 tokens, seleccionando los mas frecuentes sobre el conjunto de entrenamiento, texto de Project Gutenberg y Wikipedia en ingles y ruso, manteniendo la tokenizacion exacta de cada token conservado. El entrenamiento duro 2 epocas (6.306 pasos), con learning rate 1e-4, batch 16, perdida solo sobre la respuesta, precision bf16 y una sola GPU H200 durante aproximadamente 1,6 horas.

El conjunto de entrenamiento contiene 50.444 ejemplos: 13.752 oraciones ordinarias EN→RU extraidas de novelas de dominio publico con traducciones generadas por agentes Claude Sonnet 5.5; 1.974 casos de genero, 1.644 de «you» dirigido a varias personas y 3.466 de nombres que son palabras; 7.352 expresiones reales y 1.982 falsas; 2.160 trampas de traduccion por tipo (pasiva, modal perfecto, inversion, cleft, clausula de participio, sujeto gerundio, modismos, falsos amigos); 6.292 pares alineados de traducciones humanas de dominio publico (Twain/Engelhardt, Swift/Frankovsky, Wells/Pimenova, Wells/Morozov, Haggard/Bekertova-Krasnova, alineados con LaBSE a confianza 0,70 o superior); 7.851 ejemplos de eleccion de sentido diccionarial; 962 explicaciones de palabras, 728 de puntos gramaticales y 590 esqueletos de oracion; y 1.183 comprobaciones de expresion (0/1). De todos ellos, 9.793 prompts de traduccion incorporan las dos oraciones anteriores como contexto, y 550 pares sinteticos de contraste ensenan a producir traducciones distintas segun el contexto. No se incluyen oraciones de libros de texto ni de los conjuntos de evaluacion, y se excluyen «The Picture of Dorian Gray» y los libros reservados del test de expresiones.

## Capacidades

- Traduccion de oraciones ingles→ruso en el dominio literario, con resolucion de genero gramatical, sexo del hablante y del interlocutor, y antecedentes pronominales cuando se aporta el bloque de contexto narrativo.
- Eleccion del sentido diccionarial de una palabra dentro de su oracion, con salida JSON `{"ru": "...", "sense": N}`.
- Explicacion breve en ruso de una palabra o de un punto gramatical.
- Extraccion del sujeto y el verbo principal de una oracion larga.
- Comprobacion binaria (0/1) de si una expresion inglesa se usa realmente en una oracion.
- Manejo de trampas de traduccion: pasiva, modal perfecto, inversion, cleft, clausula de participio, sujeto gerundio, modismos y falsos amigos.
- Formato de prompt Gemma 4 sin bloque de pensamiento (`<bos><|turn>system … <turn|>\n<|turn>user … <turn|>\n<|turn>model\n`).
- Capacidades multilingues limitadas a ingles y ruso.
- No se documentan tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Asistente de lectura integrado en aplicacion movil: el modelo traduce oraciones al vuelo dentro de Fluent Books, con un archivo GGUF unico de 1,4 GB que la app descarga y ejecuta con llama.cpp en dispositivos de 8 GB o mas.
- Traduccion con desambiguacion contextual en novelas: al enviar las dos oraciones previas en el bloque `Context (earlier in the novel; do not translate):`, el modelo resuelve el sexo de un «I» o de un «you», y el genero gramatical del antecedente de «it», algo imposible con traduccion oracion a oracion.
- Diccionario contextual para estudiantes de ingles: dada una palabra y su oracion, el modelo devuelve el sentido correcto en JSON, util para poblar glosas y definiciones en la interfaz de lectura.
- Explicaciones gramaticales breves en ruso: el modelo genera una nota corta sobre un punto gramatical concreto, adecuada para mostrarse en un panel lateral sin interrumpir la lectura.
- Analisis sintactico ligero: extraer sujeto y verbo principal de oraciones largas para resaltar la estructura en la interfaz o para alimentar ejercicios de comprension.
- Deteccion de expresiones idiomaticas: la comprobacion 0/1 permite marcar en el texto si una secuencia de palabras funciona como expresion fija, habilitando resaltados y notas.
- Traduccion literaria asistida sin conexion: el modelo cabe en un movil de gama alta o en un portatil modesto, lo que permite traducir pasajes de novelas de dominio publico sin enviar texto a la nube.
- Evaluacion de calidad de traduccion en pipelines editoriales pequenos: como traductor de borrador para textos literarios EN→RU antes de la revision humana.

## Benchmarks y rendimiento

Evaluacion con jueces ciegos (modelos de lenguaje) sobre conjuntos propios del autor, 3 de noviembre de 2026, con el archivo tal como lo ejecuta la aplicacion. Recuento estricto: una traduccion es correcta solo si ambos jueces lo afirman.

| Prueba | Este modelo | Apple Translation | Qwen3.5-2B v3 (modelo anterior de la app) |
|---|---|---|---|
| 120 oraciones trampa (genero, «you», nombres, pasiva, modismos), de 120 | 115 | 112 | 103 |
| 223 trampas extendidas, de 223 | 185 | 149 | 166 |
| Traduccion de expresiones, de 100 | 87 | 76 | 78 |
| Eleccion de sentido diccionarial, de 462 | 386 | – | 377 |
| Comparacion por pares con Apple en 138 oraciones (modelo : Apple : empate) | 73 : 20 : 45 | – | 46 : 46 : 46 |
| Nombres que son palabras / «you» a varios / genero (de 40 cada uno) | 35 / 40 / 40 | 33 / 40 / 39 | 28 / 39 / 36 |

Prueba de contexto (60 pares: una oracion objetivo y dos contextos que deciden la forma rusa; 20 pares por el sexo de un «I», el sexo del interlocutor y el genero de «it»): con el bloque de contexto el modelo acierta 39 pares en ambos contextos (19 / 11 / 9); sin el bloque, 0. El Gemma 4 E2B base obtiene 32 con el bloque y el ajuste anterior de Fluent Books (sin contexto en su entrenamiento) obtiene 17. El autor advierte que el conjunto es sintetico y pequeno, y que «it» es la categoria mas debil.

Texto general (WMT24++ ingles→ruso, 960 segmentos con postedicion profesional, fuera del dominio del modelo): chrF++ 41,2 frente a 43,2 del Gemma 4 E2B base; el valor de COMET (wmt22-comet-da) aparece truncado en la model card y no se puede reproducir aqui.

## Requisitos de hardware

- Memoria del dispositivo: 8 GB o mas, segun el autor; aproximadamente 520 MB en uso durante la inferencia.
- VRAM estimada para inferencia: alrededor de 1,4 GB para el archivo Q4_K_M completo; con overhead de llama.cpp, entre 1,5 y 2 GB.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutarlo (RTX 3050, RTX 4060, RTX 4090), asi como Apple Silicon y CPUs modernas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales y en moviles de gama alta con 8 GB de RAM.
- Opciones de despliegue: llama.cpp es el runtime objetivo; el formato GGUF es compatible con Ollama y otros frontends basados en llama.cpp. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-fluent-books | 2.296.946.211 | no disponible (admite bloque de contexto con 2 oraciones) | Traduccion EN→RU literaria con contexto | Apache 2.0 | GGUF en Hugging Face |
| google/gemma-4-E2B-it (base) | 2.296.946.211 | no disponible | Modelo general instruido | Apache 2.0 | Pesos originales |
| Qwen3.5-2B v3 (modelo anterior de la app) | no disponible | no disponible | Traduccion EN→RU para Fluent Books | no disponible | Uso interno de la app |
| Apple Translation | propietario | no disponible | Traduccion integrada en el sistema | propietario | iOS/macOS |

En las pruebas del autor, este ajuste supera al modelo base en tareas de traduccion con contexto (39 frente a 32 pares correctos en ambos contextos) y al modelo anterior de la app en la mayoria de conjuntos, aunque pierde ligeramente frente al base en WMT24++ general (chrF++ 41,2 frente a 43,2), lo que refleja su especializacion en el dominio literario y su vocabulario reducido.

## Limitaciones y advertencias

- Modelo altamente especializado: su vocabulario de 40.000 tokens y su entrenamiento en el dominio literario EN→RU lo hacen poco adecuado para traduccion general, otros pares de idiomas o tareas fuera de los prompts de la aplicacion.
- Rendimiento inferior al modelo base en texto general fuera de dominio (WMT24++: chrF++ 41,2 frente a 43,2), por lo que no debe usarse como traductor generico.
- La prueba de contexto se basa en un conjunto sintetico y pequeno (60 pares); la categoria «it» es la mas debil y algunas oraciones son naturalmente impersonales en ruso.
- Riesgo de alucinacion en explicaciones de vocabulario y gramatica, y en la eleccion de sentido diccionarial, especialmente con palabras polisemicas fuera del dominio de entrenamiento.
- Las traducciones de referencia del conjunto de entrenamiento fueron generadas por agentes Claude Sonnet 5.5 y por consenso de Gemma 4 26B-A4B y 31B, lo que puede introducir sesgos estilisticos de esos modelos.
- Idiomas soportados limitados a ingles y ruso; no hay soporte documentado para otros idiomas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Licencia Apache 2.0 permite uso comercial, pero el copyright del modelo base es de Google y se debe conservar el aviso de licencia correspondiente.
- El autor no publica latencia ni throughput, por lo que el rendimiento en produccion debe medirse en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-fluent-books
- Variante compacta del mismo autor: https://huggingface.co/lazarenkod/gemma4-e2b-compact-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
