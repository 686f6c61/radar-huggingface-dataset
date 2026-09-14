# ailexleon/Orion-26B-A4B-v1.1-mlx-4Bit

## Resumen

Orion-26B-A4B-v1.1-mlx-4Bit es una conversion a formato MLX y cuantizacion de 4 bits del modelo TheDrummer/Orion-26B-A4B-v1.1, publicada por el usuario ailexleon. Se trata, por tanto, de un artefacto derivado: el trabajo original (entrenamiento y ajuste) corresponde a TheDrummer, mientras que esta ficha cubre unicamente la version cuantizada para Apple Silicon. El repositorio tiene un tamano de 14,2 GB y un total de 25.233.053.440 parametros almacenados en safetensors, coherente con la nomenclatura "26B" del nombre.

El modelo esta orientado a generacion de texto con enfasis en escritura creativa, roleplay, conversacion con personajes y narrativa (storytelling), segun las etiquetas declaradas. La etiqueta "gemma4" sugiere una base arquitectonica de la familia Gemma, y el sufijo "A4B" del nombre apunta a un diseno de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token, aunque la informacion proporcionada no confirma ni detalla esa cifra. El soporte de idiomas declarado es unicamente ingles.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de ~25.000 millones de parametros en equipos Apple Silicon con memoria unificada moderada gracias a la cuantizacion de 4 bits; por otro, al ser una conversion de comunidad con cero descargas y cero "likes" en el momento de la consulta, no existe evidencia publica de validacion de calidad frente al modelo original. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; las etiquetas indican base "gemma4" y la nomenclatura "A4B" sugiere mezcla de expertos (MoE) con ~4B de parametros activos, sin confirmacion en la informacion proporcionada |
| Parametros totales | 25.233.053.440 (~25,2B) segun los safetensors del repositorio |
| Parametros activos | No disponible (la nomenclatura "A4B" sugiere ~4B, sin dato confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (unica variante publicada en este repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`), 14,2 GB de repositorio |
| Libreria de inferencia | mlx-lm (conversion realizada con la version 0.31.3) |
| Modelo base | TheDrummer/Orion-26B-A4B-v1.1 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento ni el dataset utilizado. La model card del repositorio se limita a indicar que se trata de una conversion a MLX del modelo TheDrummer/Orion-26B-A4B-v1.1 mediante mlx-lm 0.31.3, e incluye un ejemplo de uso en Python. No hay datos sobre numero de tokens de entrenamiento, composicion del corpus, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo unico inferible a partir de los metadatos es que la etiqueta "gemma4" apunta a una familia arquitectonica de tipo transformer con atencion, y que el patron de nombre "26B-A4B" es consistente con una arquitectura de mezcla de expertos con enrutamiento disperso. Cualquier afirmacion adicional sobre capas, cabezas de atencion, funcion de activacion o estrategia de enrutamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto conversacional en ingles, con especial orientacion a escritura creativa y narrativa.
- Roleplay y conversacion con personajes (character-rp), incluyendo mantenimiento de voz y personalidad consistente a lo largo de un dialogo.
- Storytelling: continuacion y desarrollo de relatos, segun las etiquetas del repositorio.
- Generacion de texto generica mediante la API de `mlx_lm.generate` y mediante plantilla de chat (`tokenizer.apply_chat_template`) cuando el tokenizador la incluye.
- Capacidad de razonamiento, codigo o matematicas: no disponible (no se declara ni se documenta).
- Soporte de tool calling / function calling: no disponible (no se declara en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Escritura creativa asistida: el modelo esta etiquetado explicitamente para creative writing, por lo que puede emplearse para generar borradores de relato, desarrollar tramas o proponer variantes de una escena, ejecutandose en local en un Mac sin enviar el texto a un servicio externo.
- Roleplay y compania conversacional: sus etiquetas de character-rp y conversational lo situan como candidato para aplicaciones de chat con personajes persistentes, donde el estado del personaje se mantiene en el prompt de sistema y el historial de la conversacion.
- Storytelling interactivo en videojuegos o ficcion interactiva: generacion de descripciones de escena y dialogos de PNJ en tiempo de ejecucion, con la ventaja de que la inferencia local evita cuotas de API y permite iterar sin coste por token.
- Prototipado de producto conversacional en Apple Silicon: dado que el formato MLX se ejecuta de forma nativa en chips M-series, es util para validar rapidamente una idea de producto en un portatil antes de invertir en infraestructura GPU.
- Escritura de guiones y dialogos: generacion y reescritura de lineas de dialogo con un tono determinado, aprovechando la orientacion del ajuste hacia voz de personaje.
- Generacion de texto en pipelines offline o con requisitos de privacidad: al ejecutarse integramente en local, es adecuado para flujos donde el contenido no puede salir del dispositivo (manuscritos no publicados, material sujeto a confidencialidad).
- Experimentacion e investigacion sobre cuantizacion de 4 bits en MLX: sirve como caso de estudio para medir la degradacion de calidad de un modelo de ~25B al cuantizarlo a 4 bits, siempre que se compare contra el modelo base en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se dispone de evaluaciones del modelo base en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones de escritura creativa | No disponible |
| Comparacion con el modelo base en precision completa | No disponible |

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio pesa 14,2 GB, por lo que los pesos en 4 bits ocupan aproximadamente esa cifra. Hay que sumar la cache KV y el overhead del runtime; en la practica se recomienda un minimo de 16 GB de memoria unificada, siendo 24-32 GB el rango comodo para contextos largos.
- GPU compatibles: MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4, incluidos los chips Pro, Max y Ultra). No se ejecuta sobre CUDA (A100, H100, RTX 4090) en este formato.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama de consumo con 16 GB o mas de memoria unificada; en 16 GB el margen es ajustado y dependera de la longitud de contexto.
- Opciones de despliegue: `mlx-lm` (carga y generacion en Python), servidor de inferencia de `mlx-lm` y cualquier herramienta de terceros que consuma pesos MLX. Para vLLM, TGI, llama.cpp u Ollama seria necesaria una conversion de formato o una cuantizacion GGUF distinta, que no se incluye en este repositorio.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ailexleon/Orion-26B-A4B-v1.1-mlx-4Bit | 25,23B | No disponible | No disponible | Safetensors MLX, 4 bits | Apache 2.0 | Repositorio HuggingFace, 0 descargas, 0 likes |
| TheDrummer/Orion-26B-A4B-v1.1 (base) | No disponible (nombre comercial "26B") | No disponible | No disponible | No disponible | Apache 2.0 | Repositorio HuggingFace del autor original |
| Otros modelos MoE de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Conversion de terceros sin validacion publica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye evaluaciones que demuestren que la cuantizacion a 4 bits preserva la calidad del modelo base.
- Formato exclusivo MLX: los pesos no son directamente cargables con transformers, vLLM, TGI, llama.cpp u Ollama; su uso esta restringido a entornos Apple Silicon con `mlx-lm`.
- Idioma unico: solo se declara ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea degradado.
- Falta total de especificaciones: se desconocen la longitud de contexto soportada, la arquitectura exacta, el numero de parametros activos y el proceso de entrenamiento, lo que dificulta planificar su integracion en produccion.
- Sesgos: no documentados por el autor. Al ser un modelo afinado para roleplay y escritura creativa a partir de datos no especificados, es esperable que reproduzca sesgos de genero, culturales o de representacion presentes en el corpus, sin que exista ninguna evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado. Al no haber benchmarks ni evaluaciones de fidelidad factual, no debe emplearse en tareas que exijan exactitud verificable (informes, datos medicos, legales o financieros) sin supervision humana.
- Degradacion por cuantizacion: la cuantizacion de 4 bits puede afectar a la coherencia en generaciones largas y a la precision en tareas de razonamiento; no se aporta ninguna comparacion contra el modelo base en precision completa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base TheDrummer/Orion-26B-A4B-v1.1 antes de redistribuir o desplegar comercialmente el derivado.
- Fecha de publicacion: el repositorio fue creado y actualizado en septiembre de 2026 segun los metadatos, sin historial posterior de mantenimiento conocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ailexleon/Orion-26B-A4B-v1.1-mlx-4Bit
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Paquete de inferencia citado en la model card: mlx-lm (instalable con `pip install mlx-lm`, version de conversion 0.31.3); no se proporciona URL explicita en la informacion disponible.
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
