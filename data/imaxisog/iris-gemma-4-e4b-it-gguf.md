# ImAXISOG/iris-gemma-4-e4b-it-gguf

## Resumen

Iris Gemma 4 E4B es un ajuste fino mediante LoRA del modelo `google/gemma-4-E4B-it` de Google, publicado por el autor ImAXISOG como parte de la aplicacion Iris, una app de escritorio para correccion gramatical y reescritura de tono que funciona en local. El modelo esta especializado en dos tareas concretas: "Fix", que corrige ortografia, gramatica, mayusculas y puntuacion sin alterar el resto del texto, y "Tones", que reescribe un mensaje en tono profesional, amistoso, mas corto, mas claro o divertido. No esta disenado para ninguna otra funcion.

El modelo lee ingles, hindi (en escritura devanagari) e hinglish (hindi escrito con caracteres latinos), y siempre responde en ingles. Se distribuye en formato GGUF con cuantizacion Q4_K_M (4,58 GB) y esta pensado para ejecutarse en equipos de consumo mediante llama.cpp, con un consumo de memoria de aproximadamente 3,9 GB mas el archivo de 4,6 GB en memoria (8,4 GB en total en Windows).

Con 7.463.013.674 parametros totales y licencia Apache 2.0 (una version modificada de la licencia Gemma 4), el modelo resulta relevante para desarrolladores que necesitan una solucion de escritura asistida que funcione completamente en local, sin depender de APIs en la nube, especialmente en contextos donde el hindi o el hinglish son idiomas de entrada habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, ajuste fino con LoRA) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo principal), tabla de tokens por capa (`per_layer_token_embd`) en Q4_K |
| Idiomas soportados | Ingles (en), hindi (hi); entrada tambien en hinglish; salida siempre en ingles |
| Licencia | Apache 2.0 (version modificada de la licencia Gemma 4) |
| Formato de pesos | GGUF (tambien disponible en MLX en repositorio separado) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer de la familia Gemma 4 con 7.463.013.674 parametros. El ajuste se realizo mediante LoRA (Low-Rank Adaptation) sobre el modelo base, especializandolo exclusivamente en dos tareas de escritura: correccion gramatical ("Fix") y reescritura de tono ("Tones"). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es la inclusion de una tabla de tokens por capa (`per_layer_token_embd`) cuantizada a Q4_K dentro del archivo GGUF, lo que permite mantener la calidad del vocabulario con un tamano de archivo reducido (4,58 GB). El modelo esta optimizado para inferencia en dispositivo mediante llama.cpp y cuenta con una variante MLX para Macs. La evaluacion se realizo mediante un test ciego ("Iris blind test") juzgado por un modelo de IA, con conjuntos de borradores creados exclusivamente para pruebas.

## Capacidades

- Correccion de ortografia, gramatica, mayusculas y puntuacion en ingles, preservando el vocabulario original, las abreviaturas, el argot y el registro casual del usuario.
- Reescritura de tono en cinco estilos: Professional, Friendly, Shorter, Clearer y Funny, manteniendo todos los puntos del mensaje original, quien hace que y las preguntas como preguntas.
- Procesamiento de entrada en hindi (devanagari) e hinglish (hindi transcrito a caracteres latinos), con salida siempre en ingles.
- Capacidad de dejar intacto un mensaje que no contiene errores.
- Ejecucion en dispositivo (on-device) sin conexion a red.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Correccion de correos electronicos en ingles antes del envio: el modelo aplica "Fix" para eliminar errores ortograficos y gramaticales sin alterar el tono ni las expresiones informales del autor, algo util en comunicaciones internas donde se quiere mantener la voz personal.
- Reescritura profesional de mensajes de trabajo: la funcion "Tones" en modo Professional convierte un borrador informal en un mensaje apto para clientes o superiores, conservando todos los puntos y preguntas originales, segun los resultados del test ciego (93% de respuestas "enviables").
- Acortamiento de textos para plataformas con limite de caracteres: el tono Shorter reduce la longitud manteniendo la informacion esencial, adecuado para mensajes de Slack, SMS o publicaciones breves.
- Clarificacion de instrucciones tecnicas: el tono Clearer reescribe explicaciones ambiguas para que sean mas faciles de seguir, util en documentacion interna o respuestas a soporte.
- Atencion a usuarios que escriben en hinglish: el modelo acepta mensajes en hindi transcrito a caracteres latinos y los corrige o reescribe en ingles, lo que facilita la comunicacion entre equipos con personal que usa hinglish de forma habitual (95% de aceptacion en la tarea de correccion segun el autor).
- Integracion en una app de escritorio de escritura asistida: al ejecutarse con llama.cpp en 8,4 GB de memoria total en Windows o 3,6 GB en Mac, puede incorporarse a editores de texto o clientes de correo que requieran procesamiento local sin enviar datos a la nube.
- Generacion de mensajes con tono divertido para comunicaciones informales: el tono Funny permite dar un giro humoristico a un mensaje manteniendo su contenido, aunque con una tasa de aceptacion mas baja (66%) que el resto de tonos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (test ciego "Iris blind test", juzgado por un modelo de IA; no verificados de forma independiente):

| Tarea | Gemma 4 E4B-it sin entrenar | Iris Lighter (E2B) | Iris Best quality (E4B) |
|---|---|---|---|
| English Fix: aceptado (50 borradores) | 52% | 86% | 90% |
| Professional and Friendly: enviable (100 respuestas) | 86% | 88% | 93% |
| Shorter and Clearer: enviable (100 respuestas) | 75% | 86% | 90% |
| Funny: enviable (50 respuestas) | 4% | 56% | 66% |
| Hindi and Hinglish, Fix (a ingles): aceptado (82 borradores) | 91% | 71% | 95% |
| Hindi and Hinglish, tones (a ingles): enviable (240 respuestas) | 71% | 47% | 76% |

El propio autor advierte que las diferencias inferiores a unos 8 puntos porcentuales estan dentro del ruido estadistico.

## Requisitos de hardware

- VRAM/memoria estimada: 3,9 GB para la inferencia mas 4,6 GB del archivo en memoria en Windows (8,4 GB en total); en Mac, 3,6 GB en pico con la variante MLX.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que el modelo esta pensado para Macs con 16 GB o mas de memoria unificada y PCs Windows con 16 GB o mas de RAM.
- Cabe en GPU de consumo: si, siempre que el sistema disponga de al menos 16 GB de memoria total; en equipos de 8 GB se recomienda la variante E2B (1,9 GB de inferencia mas 2,8 GB de archivo, 4,8 GB en total).
- Opciones de despliegue: llama.cpp (formato GGUF) y MLX (repositorio separado para Mac).
- Latencia y throughput: no disponibles. El autor advierte que, si Windows expulsa el archivo de memoria por falta de RAM, las respuestas se ralentizan al releerlo desde disco. Las cifras de Windows se midieron con llama.cpp sobre los nucleos de CPU de un Mac y no se han confirmado en un PC Windows real ni en equipos de 8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris Gemma 4 E4B (este modelo) | 7.463.013.674 | no disponible | Correccion y tono en en/hi/hinglish | Apache 2.0 (mod. Gemma 4) | GGUF, MLX |
| Iris Gemma 4 E2B (Lighter) | no disponible | no disponible | Misma tarea, version ligera | Apache 2.0 (mod. Gemma 4) | GGUF, MLX |
| Gemma 4 E4B-it (base, sin ajustar) | 7.463.013.674 | no disponible | Modelo generalista de Google | Licencia Gemma 4 | Multiples formatos |

La comparativa se limita a los modelos mencionados en la informacion disponible; no se dispone de datos de otros modelos de correccion gramatical o reescritura de tono para establecer una comparacion adicional.

## Limitaciones y advertencias

- El modelo solo realiza dos tareas (Fix y Tones); no es un modelo generalista y no se ha entrenado para otras funciones.
- La salida es siempre en ingles, aunque la entrada pueda estar en hindi o hinglish; no genera texto en hindi.
- La tasa de aceptacion del tono Funny es notablemente inferior (66%) al resto de tareas, por lo que su uso en produccion requiere revision humana.
- Los benchmarks son declarados por el autor, juzgados por un modelo de IA y no verificados de forma independiente; el propio autor senala que diferencias de hasta 8 puntos estan dentro del ruido.
- Las estimaciones de memoria para Windows se midieron en un Mac y no se han validado en un PC Windows real ni en equipos de 8 GB.
- La licencia es Apache 2.0 pero se describe como una version modificada de la licencia Gemma 4; conviene revisar los terminos concretos antes de un uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion en tareas fuera de su dominio ni longitud de contexto, lo que limita la evaluacion para usos distintos de la correccion y reescritura de mensajes.
- Al ser un ajuste LoRA sobre un modelo base de Google, hereda las limitaciones y sesgos del modelo original, no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante ligera (E2B) GGUF: https://huggingface.co/ImAXISOG/iris-gemma-4-e2b-it-gguf
- Variante MLX para Mac: https://huggingface.co/ImAXISOG/iris-gemma-4-e4b-it-mlx
- Coleccion de modelos Iris: https://huggingface.co/collections/ImAXISOG/iris-writing-models-6afd5f1c54a5d9692f56c625
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
