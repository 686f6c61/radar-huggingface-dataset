# sadly-nimbly/mindtype-tagger-v2.0

## Resumen

mindtype-tagger-v2.0 es un modelo de correccion gramatical y ortografica (GEC, *grammatical error correction*) disenado especificamente para teclados en dispositivo (iOS y Android). Lo desarrolla Mindscend y se entrena desde cero, sin partir de un modelo preentrenado de terceros. Su proposito no es generar texto, sino etiquetar cada palabra de una frase con una unica accion de edicion (mantener, borrar, reemplazar, anadir o cambiar mayusculas), lo que lo hace rapido, diminuto y estructuralmente incapaz de reescribir texto correcto o inventar palabras.

Tecnicamente es un transformer *encoder-only* de 8 capas con dimension oculta 384 y 26,2 millones de parametros, acompanado de un tokenizador BPE byte-level propio de 16k. La salida es una clasificacion por token (*token-classification*) que se aplica en una sola pasada, con hasta tres pasadas de aplicacion de etiquetas. Se distribuye en formato Core ML con pesos de 8 bits para iOS 18+ y en ONNX int8 para Android y servidores, ademas de los pesos originales en safetensors.

La version 2.0 introduce mejoras notables frente a v1.5/v1.6: entrenamiento con errores tipicos de tecleo en movil (letras pulsadas por error, palabras cortas, letras omitidas), un 40 % de texto ya correcto en el corpus de entrenamiento y un promediado de pesos (*model soup*) de tres ajustes finos que comparten inicializacion. El resultado es un salto en la tasa de correccion exacta de erratas de teclado del 22 % al 77 %, manteniendo una tasa de falsos positivos sobre mensajes reales del 1,26 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, 8 capas, d=384 |
| Parametros totales | 26.176.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento a nivel de frase) |
| Tipos de cuantizacion | 8 bits (Core ML), int8 (ONNX); pesos originales en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, Core ML, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer *encoder-only* de 8 capas con dimension oculta 384 y 26,2 millones de parametros, con tokenizador BPE byte-level propio de 16k vocabulario. La tarea se formula como etiquetado por palabra: cada token recibe una unica etiqueta entre KEEP, DELETE, REPLACE_x, APPEND_x y cambios de capitalizacion. Esta formulacion restringe el espacio de salidas y evita que el modelo reescriba o invente contenido. La inferencia aplica las etiquetas en hasta tres pasadas, sumando un sesgo KEEP al logit correspondiente (valor 3 por defecto, 4 para el modo "solo correcciones seguras").

El entrenamiento consta de dos fases. Primero, *masked language modeling* sobre aproximadamente 20 millones de frases de FineWeb-Edu (licencia ODC-BY). Despues, un ajuste de correccion sobre 12 millones de pares (ruidoso, limpio): errores sinteticos de tecleo y de movil, el corpus CoEdIT GEC (Apache-2.0) y mensajes informales generados por un modelo local de pesos abiertos y filtrados por correccion; el 40 % del texto ya era correcto. Se realizaron 45.000 pasos con tres ordenes de datos distintos partiendo de una misma inicializacion de la cabeza, y luego se promediaron los pesos (*model soup*). Todo el entrenamiento se ejecuto en una unica GPU RTX 3080 Ti de portatil. Incluye una guarda de plausibilidad (`plausible_pairs.json`) que descarta reemplazos que un error de tecleo no podria haber producido.

## Capacidades

- Correccion ortografica y gramatical a nivel de frase en ingles, con etiquetado de edicion por palabra.
- Correccion de erratas tipicas de teclado movil: letras adyacentes pulsadas por error, palabras cortas y letras omitidas.
- Preservacion de texto ya correcto: en el conjunto `preserve_clean` mantiene intacto el 99,2 % de los casos.
- Proteccion de *spans* que no deben modificarse (nombres propios, entidades); cero perdidas de *spans* protegidos en la suite de evaluacion.
- Modo de sesgo configurable: KEEP bias 3 (equilibrado) o 4 (solo correcciones seguras).
- Ejecucion en dispositivo (*on-device*): el texto nunca sale del telefono.
- Exportacion a Core ML (iOS 18+) y ONNX int8 (Android y servidores).
- No realiza reescritura, reformulacion ni cambios de tono; unicamente corrige lo presente.

## Casos de uso

- Teclado movil en iOS y Android: integracion del paquete Core ML u ONNX directamente en el teclado para corregir en tiempo real sin enviar datos a la nube, lo que cumple requisitos de privacidad y reduce latencia.
- Autocorreccion de mensajes informales: corrige erratas de tecleo en chats y SMS manteniendo el registro casual, gracias al entrenamiento con mensajes informales y a la baja tasa de falsos positivos (1,26 %).
- Correccion de textos formales en cliente: en el conjunto `formal_noisy` alcanza F0.5 de 0,876, adecuado para correos y documentos antes de enviarlos.
- Preprocesado de texto en pipelines de NLP: normalizar entradas ruidosas (comentarios, formularios) antes de alimentar otros modelos, con la garantia de no alterar *spans* protegidos.
- Filtrado de falsos positivos en entornos sensibles: el modo KEEP bias 4 reduce los cambios sobre texto correcto al 0,90 %, util cuando modificar texto valido es costoso.
- Despliegue en servidor con ONNX int8: para servicios de correccion a gran escala con baja huella de memoria (26,2 M de parametros) y sin dependencia de GPU.
- Aplicaciones de accesibilidad: sugerencias de correccion discretas y conservadoras en herramientas de escritura asistida.

## Benchmarks y rendimiento

Resultados de la suite de evaluacion de MindType (4.356 casos reservados, KEEP bias 3, con guarda de plausibilidad):

| Conjunto | n | F0.5 | Exact | Tasa de falsos positivos | Spans protegidos perdidos |
|---|---|---|---|---|---|
| casual_clean | 118 | 0,000 | 0,983 | 0,017 | 0,000 |
| casual_noisy | 109 | 0,942 | 0,807 | 0,000 | 0,000 |
| coedit | 579 | 0,453 | 0,109 | 0,000 | 0,000 |
| formal_clean | 1000 | 0,000 | 0,976 | 0,024 | 0,000 |
| formal_noisy | 1000 | 0,876 | 0,655 | 0,000 | 0,000 |
| golden | 50 | 0,927 | 0,860 | 0,077 | 0,000 |
| preserve | 1000 | 0,838 | 0,646 | 0,000 | 0,000 |
| preserve_clean | 500 | 0,000 | 0,992 | 0,008 | 0,000 |
| **overall** | 4356 | 0,803 | 0,708 | 0,019 | 0,000 |

Comparativa entre versiones (segun la model card):

| Metrica | v1.6 (KEEP 2) | v2.0 (KEEP 3) | v2.0 (KEEP 4) |
|---|---|---|---|
| F0.5 en conjunto de erratas de movil | 0,689 | 0,912 | 0,910 |
| Erratas de movil corregidas exactamente | 22 % | 77 % | 74 % |
| Cambios sobre mensajes reales correctos (5.556 reservados) | 1,64 % | 1,26 % | 0,90 % |
| F0.5 / falsos positivos de la suite | 0,802 / 2,8 % | 0,803 / 1,9 % | 0,801 / 1,0 % |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia con pesos int8; los pesos originales en safetensors ocupan aproximadamente 0,1 GB (26,2 M de parametros).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU movil. Para entrenamiento se uso una RTX 3080 Ti de portatil.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles de gama media mediante Core ML u ONNX.
- Opciones de despliegue: Core ML (iOS 18+), ONNX Runtime (Android y servidores), PyTorch para los pesos originales. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo encoder de clasificacion).
- Latencia y throughput: no disponibles de forma numerica; la model card destaca que la clasificacion en una sola pasada lo hace "rapido y diminuto", pero no publica cifras de latencia.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos comparables en la informacion disponible. Como referencia de categoria, los correctores GEC basados en modelos grandes (por ejemplo, variantes de T5 o modelos encoder grandes) ofrecen mayor cobertura de reescritura pero requieren mucho mas computo y no estan disenados para ejecucion en dispositivo. La model card solo compara con las versiones previas del propio modelo (v1.5/v1.6).

| Modelo | Parametros | Contexto | Licencia | En dispositivo |
|---|---|---|---|---|
| mindtype-tagger-v2.0 | 26,2 M | no disponible (nivel de frase) | Apache-2.0 | Si (Core ML / ONNX int8) |
| Alternativas GEC de gran escala | no disponible | no disponible | no disponible | No |

## Limitaciones y advertencias

- Solo ingles; no soporta otros idiomas.
- Ambito a nivel de frase: no procesa documentos largos ni contexto entre frases.
- Experimental: la propia model card lo califica como tal.
- No reescribe ni cambia el tono; solo corrige errores presentes. No es util para parafrasear.
- El conjunto `coedit` muestra un rendimiento bajo (F0.5 de 0,453, exact de 0,109), lo que indica menor cobertura en errores gramaticales complejos frente a erratas de tecleo.
- Riesgo de falsos positivos del 1,9 % en la suite general; en `golden` sube al 7,7 %. El modo KEEP bias 4 lo reduce pero tambien reduce las correcciones aplicadas.
- La formulacion por etiquetas evita la invencion de palabras, pero puede dejar sin corregir errores que requieran reestructuracion.
- Licencia Apache-2.0 para pesos, tokenizador y codigo; los datos de entrenamiento tienen licencias propias (FineWeb-Edu ODC-BY, CoEdIT Apache-2.0), que conviene revisar para uso comercial.
- Sin descargas ni likes en el momento de la consulta; ecosistema de adopcion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadly-nimbly/mindtype-tagger-v2.0
- Mindscend (desarrollador): https://mindscendinc.com
- FineWeb-Edu (dataset de preentrenamiento): no disponible en la informacion proporcionada
- CoEdIT GEC (dataset de correccion): no disponible en la informacion proporcionada
