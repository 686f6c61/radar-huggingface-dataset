# Kruglovsky/my-mezzo-rvc-v2

## Resumen

My Mezzo RVC v2 es un modelo de conversión de voz a voz (voice-to-voice, RVC) entrenado por el usuario Kruglovsky sobre sus propias grabaciones vocales. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un modelo de clonación y transferencia de timbre construido sobre la arquitectura RVC v2 (Retrieval-based Voice Conversion), especializada en transformar una señal de voz de entrada en la misma interpretación pero con el timbre de un cantante objetivo. En este caso, el timbre objetivo es una voz de mezzosoprano con un rango declarado de A3 a F5.

El modelo resuelve un problema concreto dentro de flujos de producción musical: tomar voces generadas por herramientas como Suno u otras fuentes sintéticas y reemplazar su timbre por una voz humana de mezzosoprano, conservando la fraseología y la rítmica originales. El autor lo plantea explícitamente como una pieza intermedia de un pipeline híbrido que termina en un DAW (Logic Pro) para el procesado final.

La relevancia es acotada: es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia MIT y entrenado con 25 minutos de vocal monofónico a 44,1 kHz. No hay información sobre benchmarks, pipeline declarado ni datos de rendimiento más allá de las recomendaciones de inferencia de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de conversion de voz, no de texto) |
| Tipos de cuantizacion | int8 (version ligera indicada por el autor) |
| Idiomas soportados | en (ingles, segun metadatos; el modelo es agnostico al idioma en la practica al operar sobre audio) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint) y `.index` (indice de retrieval) |

## Arquitectura y entrenamiento

RVC v2 es una familia de modelos de conversion de voz que combina un extractor de caracteristicas (tipicamente HuBERT o ContentVec) con un decoder generativo y un indice de retrieval que ayuda a preservar el timbre objetivo. El autor no detalla en la model card la configuracion exacta de la red, el numero de parametros ni la version concreta del extractor de contenido empleado.

El entrenamiento se realizo sobre 25 minutos de vocal monofonico limpio, sin reverberacion, grabado por el propio autor y muestreado a 44,1 kHz. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en este tipo de modelos. La innovacion practica declarada es la inclusion del fichero `.index` para el retrieval de caracteristicas, con un `index rate` recomendado de 0,6 para equilibrar timbre y fraseologia, y la preservacion de formantes activada.

## Capacidades

- Conversion de voz a voz preservando la interpretacion (fraseo y ritmica) y sustituyendo el timbre por una mezzosoprano.
- Rango vocal declarado de A3 a F5, con recomendacion de transposicion de 0 a -2 semitonos cuando la fuente es aguda.
- Preservacion de formantes para evitar artefactos de "chipmunk" o de voz artificial al cambiar de tono.
- Uso de indice de retrieval (`.index`) para mejorar la similitud de timbre.
- Funcionamiento en Google Colab y en WebUI local de RVC.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la propia senal vocal.

## Casos de uso

- Conversion de voces generadas por IA (Suno y similares) a timbre de mezzosoprano: se introduce el stem vocal en RVC con pitch 0 y se obtiene la misma melodia con el timbre del modelo, listo para mezcla.
- Produccion de maquetas de pop ballad: el modelo permite probar rapidamente una linea vocal femenina grave sobre una base instrumental sin contratar a una cantante.
- Pipeline hibrido de estudio: vocal convertida con RVC y posterior procesado en Logic Pro con de-esser, compresion, saturacion y buses, tal como describe el autor.
- Demos de Slap House y arreglos dramaticos: el rango A3-F5 cubre las tesituras habituales de estos generos, y la preservacion de formantes mantiene inteligibilidad en mezclas densas.
- Prototipado de coros y armonias: se pueden generar varias tomas con transposiciones de -1 o -2 semitonos y combinarlas como capas corales.
- Postproduccion de doblaje cantado o locucion ritmica: usar el modelo para adaptar una locucion hablada a una linea melodica manteniendo la fraseologia original.
- Educacion y experimentacion con tecnicas de voice conversion: al ser MIT y ligero en int8, sirve como caso de estudio reproducible en Colab para quien quiera entender el flujo RVC v2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tipo de modelo (RVC v2 en int8) es habitual que quepa en GPU consumer de 4-8 GB, pero el autor no lo confirma.
- GPU recomendadas: el autor menciona Google Colab como opcion mas estable; no especifica modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: probablemente si, dado el formato int8 y el tamano tipico de los checkpoints RVC, aunque no hay dato confirmado en la informacion proporcionada.
- Opciones de despliegue: WebUI local de RVC y notebooks de Google Colab. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos RVC ni con alternativas de conversion de voz, y no se dispone de datos de benchmarks para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Rendimiento degradado en notas por encima de F5 y en pasajes de vocalizacion rapida (skipping o scat).
- Posibles artefactos en armonicos complejos; el autor recomienda procesado final en DAW.
- El dataset es de 25 minutos, un volumen reducido que puede limitar la generalizacion a estilos muy distintos del material original.
- El modelo esta pensado para una unica voz (la del autor); no es un modelo multihablante.
- Uso etico: prohibido usar grabaciones de terceros sin consentimiento y no esta destinado a imitar voces de personas conocidas.
- Licencia MIT: permite uso comercial y modificacion, con atribucion al autor.
- Riesgo de uso indebido para suplantacion de identidad vocal; el autor lo restringe explicitamente en la model card.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kruglovsky/my-mezzo-rvc-v2
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
