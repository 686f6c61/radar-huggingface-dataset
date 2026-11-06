# dtsj89/puki-beak

## Resumen

Puki Beak es un modelo de conversión de grafemas a fonemas (grapheme-to-phoneme) para hebreo, desarrollado por el usuario dtsj89 como componente del proyecto Puki, un juego gratuito bilingüe hebreo/inglés para niños pequeños. Su función es transformar texto hebreo plano (sin vocales diacríticas) en fonemas IPA que un motor de síntesis de voz, en este caso BlueTTS con la opción `text_is_phonemes`, pueda pronunciar correctamente. El modelo resuelve un problema concreto: el hebreo escrito habitualmente omite los signos vocálicos (nikud), por lo que un TTS necesita inferir la vocalización y el acento de cada letra a partir del contexto.

Técnicamente es un transformer bidireccional pequeño, de 2,3 millones de parámetros, con 6 capas y anchura 192. Recibe una línea de texto letra a letra, precedida por un token que indica el género del niño oyente (masculino o femenino), y emite para cada letra hebrea tres predicciones: consonante, vocal y acentuación. La arquitectura y las reglas de conversión siguen el enfoque de RenikudPlus, del que Beak se declara derivado en cuanto a esquema de etiquetado.

El modelo se distribuye exclusivamente en formato ONNX cuantizado a int8 (2,5 MB), lo que lo hace apto para inferencia en dispositivos de gama baja. Según la model card, procesa una línea de 40 letras en 17 ms con 4 hilos en una Samsung Galaxy Tab A7 Lite. Está publicado con licencia Apache 2.0 y solo soporta hebreo. Su relevancia es acotada pero clara: demuestra que un modelo de vocalización hebrea de muy bajo coste computacional puede superar en precisión a alternativas mayores en la tarea específica de lectura para TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (6 capas, anchura 192) |
| Parámetros totales | 2,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa por líneas; ejemplo de 40 letras) |
| Tipos de cuantización | int8 dinámica (solo pesos de MatMul) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`beak_int8.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional de 6 capas y anchura 192, con 2,3 millones de parámetros en total. La entrada es una secuencia de identificadores de caracteres: el primer token codifica el género del oyente (niño o niña) y los siguientes corresponden a cada letra de la línea hebrea. La salida son tres cabezas de clasificación de tokens que producen logits de consonante, vocal y acento para cada posición. Las reglas que convierten esas etiquetas en fonemas IPA son las mismas que emplea RenikudPlus.

El entrenamiento se realizó en dos fases. La primera utilizó 600.000 frases de hebreo web etiquetadas por RenikudPlus (de Max Melichov, Yakov Kolani y Morris Alper, Apache 2.0), aprovechando sus probabilidades de salida y cubriendo ambos géneros. La segunda fase consistió en un ajuste fino supervisado con 3.530 líneas propias del proyecto Puki cuya pronunciación fue revisada auditivamente. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Conversión de grafemas a fonemas para hebreo: asigna a cada letra una consonante, una vocal y el acento correspondiente.
- Condicionamiento por género del oyente mediante un token inicial, lo que permite adaptar la vocalización a voz masculina o femenina.
- Generación de fonemas IPA a partir de las etiquetas predichas, siguiendo las reglas de RenikudPlus.
- Manejo de texto hebreo sin nikud (sin signos vocálicos explícitos), infiriendo la vocalización por contexto.
- Inferencia ligera en CPU y dispositivos móviles gracias al formato ONNX int8.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al hebreo; no se documenta soporte de otros idiomas.

## Casos de uso

- Síntesis de voz para lectura infantil: el modelo convierte cada línea de un cuento o juego en fonemas IPA que BlueTTS pronuncia con la vocalización correcta, resolviendo la ausencia de nikud en el texto hebreo habitual.
- Integración en el juego Puki: al ser parte del proyecto Puki, se usa para que las instrucciones y diálogos del juego se lean en voz alta con pronunciación adecuada, con latencia de milisegundos en tablets de gama baja.
- Aplicaciones de accesibilidad para personas con dificultades lectoras en hebreo: un lector de pantalla puede usar Beak para vocalizar texto plano antes de pasarlo a un motor TTS.
- Aprendizaje de hebreo para niños: el condicionamiento por género permite generar la pronunciación en la voz del personaje correspondiente, útil en materiales educativos interactivos.
- Preprocesado para pipelines de TTS en hebreo: cualquier sistema que reciba texto sin nikud puede insertar Beak como etapa previa de fonemización antes del sintetizador.
- Despliegue en dispositivos embebidos o móviles sin GPU: con 2,5 MB en int8 y 17 ms por línea de 40 letras en una tablet, es viable en hardware muy limitado donde no cabría un modelo mayor.
- Prototipado rápido de vocalización hebrea: sirve como referencia ligera para comparar o validar sistemas de diacritización y fonemización en investigación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 458 líneas revisadas no vistas en entrenamiento:

| Métrica | Beak | RenikudPlus |
|---|---|---|
| Palabras leídas según revisión | 99,1 % | 92,3 % |
| Líneas completas leídas según revisión | 96,3 % | 69,4 % |
| Palabras nunca vistas en entrenamiento | 93,7 % | 92,9 % |

Rendimiento medido: una línea de 40 letras en 17 ms con 4 hilos en una Samsung Galaxy Tab A7 Lite. Tamaño del modelo: 2,5 MB en int8 dinámica. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo ocupa 2,5 MB en int8 y puede ejecutarse en CPU.
- GPU recomendadas: no se requieren; cualquier CPU moderna es suficiente. No se documentan requisitos de GPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y embebidos; el ejemplo publicado usa una tablet Samsung Galaxy Tab A7 Lite.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el código de lectura de referencia es `Beak.kt` en el repositorio de Puki. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 17 ms por línea de 40 letras con 4 hilos en el dispositivo citado; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Puki Beak | 2,3 M | no disponible | G2P hebreo con género | Apache 2.0 | ONNX int8 |
| RenikudPlus | no disponible | no disponible | Diacritización/vocalización hebrea | Apache 2.0 | no disponible |
| BlueTTS | no disponible | no disponible | TTS hebreo (consumidor de fonemas) | no disponible | no disponible |

RenikudPlus es el referente directo: Beak reutiliza su esquema de etiquetado y sus reglas de conversión a fonemas, y lo supera en las métricas publicadas sobre líneas revisadas (96,3 % frente a 69,4 % de líneas completas correctas). BlueTTS no es un modelo comparable en la misma tarea, sino el sintetizador que consume la salida de Beak. No se dispone de datos suficientes para comparar con otros modelos de G2P hebreo.

## Limitaciones y advertencias

- El modelo solo soporta hebreo; no es utilizable para otros idiomas.
- Está especializado en fonemización para TTS, no es un modelo de propósito general ni genera texto libre.
- El condicionamiento por género binario (niño/niña) puede no cubrir todos los casos de uso ni reflejar todas las identidades.
- La evaluación se limita a 458 líneas revisadas por el autor; no hay validación independiente ni benchmarks estándar publicados.
- Riesgo de error en palabras poco frecuentes o nombres propios: la precisión cae al 93,7 % en palabras no vistas en entrenamiento.
- La cuantización int8 dinámica puede introducir pequeñas diferencias frente a una versión en punto flotante, aunque no se documentan métricas comparativas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo deriva del esquema de RenikudPlus; conviene revisar las condiciones de los datos de entrenamiento originales.
- No se documentan sesgos específicos más allá del condicionamiento de género; no hay información sobre evaluación de sesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dtsj89/puki-beak
- Repositorio del proyecto Puki: https://github.com/TomSadeh/puki
- BlueTTS: https://github.com/maxmelichov/BlueTTS
- RenikudPlus: https://huggingface.co/notmax123/RenikudPlus
