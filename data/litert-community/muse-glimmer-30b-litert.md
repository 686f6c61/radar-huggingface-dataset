# litert-community/Muse-Glimmer-30B-LiteRT

## Resumen

Muse-Glimmer-30B — LiteRT-LM es una conversión a formato LiteRT (`.litertlm`) del modelo vision-language Muse-Glimmer-30B de Meta, orientado a tareas agénticas sobre hardware local. El modelo original es un modelo multimodal de 30B parámetros que lee texto e imágenes y genera respuestas precedidas de un mensaje de razonamiento interno, cuyo nivel de esfuerzo ("Reasoning strength": low, medium, high o xhigh) se controla desde el mensaje de sistema. Esta conversión cuantiza el decodificador de texto a int4 (bloques de 128 pesos) con capa de salida int8, y mantiene el codificador de visión en fp32.

La relevancia de esta ficha reside en el despliegue on-device: el archivo de 23,4 GB funciona con LiteRT-LM 0.19.0 y ha sido verificado sobre la GPU de un Apple M4 Max, donde alcanza 18,33 tokens/s de decodificación tras procesar una imagen de 448 × 448. La arquitectura combina un decodificador denso de texto de 52 capas (patrón de tres capas sliding-window más una global, repetido) con un codificador de visión de 50 capas. El contexto de esta conversión es de 2.048 tokens con caché KV incluida en el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso de texto (52 capas; 3 sliding-window + 1 global, repetido) + codificador de visión de 50 capas; modelo vision-language |
| Parametros totales | 30B (aproximado, según denominación del modelo; no desglosado en la ficha) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 2.048 tokens (caché KV de 2.048 en este archivo) |
| Tipos de cuantizacion | Pesos del decodificador int4 (blockwise, 128 por bloque); capa de salida int8; embedding table en int8; codificador de visión y adaptador en fp32; activaciones declaradas fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM 0.19.0, convertido con litert-torch 0.10.0, ai-edge-quantizer 0.10.0 y litert-lm-builder 0.19.0) |

## Arquitectura y entrenamiento

La arquitectura consta de dos módulos principales. El decodificador de texto es un transformer denso de 52 capas con un patrón de atención híbrido: tres capas con ventana deslizante (sliding-window) seguidas de una capa global, patrón que se repite a lo largo de la red. Esta disposición reduce el coste computacional de la atención manteniendo conectividad global periódica. El codificador de visión tiene 50 capas y se ejecuta en fp32 en esta conversión; procesa imágenes a resolución fija de 448 × 448, que se convierten en 256 tokens de imagen.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), no se ha publicado información en la documentación disponible. Como rasgo funcional destacable, el modelo genera antes de cada respuesta un mensaje de razonamiento explícito cuya extensión se controla mediante el campo "Reasoning strength" del mensaje de sistema (low, medium, high o xhigh). La salida llega con tokens de formato intercalados (por ejemplo, `to=self<|message|>…<|eom|><|start|>assistant to=user<|message|>`), que conviene filtrar en la aplicación. La configuración de generación por defecto del modelo original es top-k 64, top-p 0,95 y temperatura 1,0.

## Capacidades

- Comprensión conjunta de imagen y texto (pipeline image-text-to-text): responde preguntas sobre imágenes introducidas a 448 × 448 (256 tokens de imagen).
- Razonamiento previo a la respuesta: escribe un mensaje de razonamiento antes de la respuesta final, con nivel de esfuerzo ajustable (low, medium, high, xhigh) vía mensaje de sistema.
- Diseñado para tareas agénticas sobre hardware local, según la descripción del modelo base de Meta.
- Generación de texto en conversaciones multi-turno: admite preguntas de seguimiento sobre la misma imagen dentro de la misma conversación (una imagen por conversación en las pruebas documentadas).
- Ejecución on-device con backends GPU y CPU de LiteRT-LM; el camino GPU usa WebGPU.
- Muestreo configurable: greedy (top_k=1) verificado en las mediciones; por defecto top-k 64, top-p 0,95, temperatura 1,0.
- No hay evidencia documentada de tool calling, function calling, capacidades de audio ni de otros idiomas.

## Casos de uso

- **Asistente visual local para fotografía personal**: el usuario pregunta cuántos objetos aparecen en una foto o qué contiene una escena; la imagen se redimensiona a 448 × 448 con PIL (aplicando rotación EXIF) y se envía con una pregunta corta. Al ejecutarse íntegramente en el dispositivo, las fotos no salen del terminal, lo que es adecuado para privacidad.
- **Agentes on-device en portátiles Apple Silicon**: el modelo está pensado para tareas agénticas en hardware local; con 18,33 tokens/s de decodificación en GPU de M4 Max y 0,41 s en preguntas de seguimiento, puede integrarse en flujos agénticos de varios pasos que inspeccionen imágenes.
- **Análisis de capturas de pantalla en aplicaciones de escritorio**: un agente puede enviar capturas redimensionadas a 448 × 448 y pedir descripciones o verificaciones de estado de la interfaz, aprovechando el pipeline image-text-to-text sin depender de la nube.
- **Prototipado de apps multimodales con LiteRT-LM**: la API Python de litert-lm (engine, conversaciones, sampler configurable) permite construir demos de chat con imagen en pocas líneas, filtrando los tokens de formato de la respuesta.
- **Clasificación y verificación visual con razonamiento controlado**: ajustando "Reasoning strength" a low se minimiza la latencia para tareas simples (contar objetos, leer texto visible), reservando niveles altos para problemas que requieran más deliberación, siempre dentro del límite de 2.048 tokens.
- **Procesado por lotes en local de imágenes con preguntas cortas**: con prefill de 148 tok/s en GPU, un script puede procesar colecciones de imágenes (una por conversación) respondiendo preguntas estructuradas sin coste de API.
- **Despliegue con requisitos de privacidad estrictos (salud, documentos)**: al no requerir conexión, es apto para entornos donde los datos no pueden enviarse a servicios externos, con la reserva del contexto limitado a 2.048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento de inferencia en un Apple M4 Max (128 GB, macOS 27.0, litert-lm 0.19.0 desde PyPI, camino GPU sobre WebGPU), con una imagen de 448 × 448 y pregunta corta (292–298 tokens de prompt, 256 de ellos la imagen), decodificación greedy y "Reasoning strength: low":

| Backend | Prefill (tok/s) | Decode (tok/s) | Primer token (s) | Primer texto (s) | Seguimiento: primer texto (s) | Memoria pico |
|---|---:|---:|---:|---:|---:|---|
| GPU (visión en GPU, este archivo) | 148,0 | 18,33 | 2,03 | 2,57 | 0,41 | 26 GiB (footprint) |
| CPU (visión en CPU, build anterior) | 14,9–15,6 | 7,20–7,48 | 19,3–19,7 | 21,1–21,7 | 6,8 | 1,1 GiB (footprint); 22 GiB residente, casi todo mapeado |

Notas: las cifras de GPU son medianas de tres preguntas en conversaciones nuevas (rango de decode: 12,29–18,37 tok/s). La primera pregunta de cada proceso compila los programas GPU del codificador de visión (18,7 s adicionales). Crear el engine desde SSD interno tarda 23,4 s.

## Requisitos de hardware

- VRAM/memoria estimada: footprint pico de 26 GiB en GPU (Apple M4 Max) con el archivo de 23,4 GB; en CPU, footprint de 1,1 GiB con ~22 GiB de archivos mapeados residentes (caché de pesos y modelo).
- GPU recomendada: la verificación publicada es sobre la GPU integrada de un Apple M4 Max (128 GB de memoria unificada) vía WebGPU. No hay mediciones en GPUs NVIDIA discretas.
- Consumer GPUs: cabe en un Apple M4 Max de 128 GB con margen; en equipos con menos memoria unificada o GPUs de escritorio convencionales, los 23,4 GB del archivo y los 26 GiB de footprint hacen probable que no quepa en tarjetas de 24 GB como la RTX 4090, aunque no hay mediciones que lo confirmen.
- CPU: funciona, pero aproximadamente 2,5 veces más lento en decodificación (7,2–7,5 tok/s) y con prefill de ~15 tok/s.
- Despliegue: LiteRT-LM 0.19.0 (`pip install litert-lm==0.19.0`), con backends GPU o CPU. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este formato `.litertlm`.
- Latencia: primer token en 2,03 s en GPU (incluye el codificador de visión); 0,41 s en preguntas de seguimiento sobre la misma imagen. La primera consulta de un proceso añade 18,7 s de compilación de programas GPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para modelos de la misma categoría en la información proporcionada. Comparativa cualitativa por categoría y formato:

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (LiteRT) | Vision-language, razonamiento ajustable | 30B | 2.048 (esta conversión) | `.litertlm` (int4) | Apache 2.0 |
| Modelos vision-language on-device de tamaño similar (p. ej. variantes LiteRT de modelos multimodales) | no disponible | no disponible | no disponible | `.litertlm` / `.tflite` | variable |
| Muse-Glimmer-30B (modelo base de Meta) | Vision-language | 30B | no disponible | pesos originales | no disponible |

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens en esta conversión. Una imagen consume 256 tokens y el mensaje de razonamiento debe caber en el contexto; con "Reasoning strength: high" o superior, un razonamiento largo puede desbordar la ventana.
- Resolución de imagen fija a 448 × 448: las imágenes se estiran sin conservar la relación de aspecto, lo que puede degradar el reconocimiento en fotos con proporciones muy distintas.
- Una sola imagen por conversación en las pruebas documentadas.
- La salida incluye tokens de formato interno (`<|message|>`, `<|eom|>`, `<|start|>`, etc.) que la aplicación debe filtrar; el ejemplo oficial usa un `split("<|message|>")`.
- Sin mensaje de sistema, la plantilla aplica "Reasoning strength: high" por defecto, configuración no medida con este archivo.
- La primera consulta de cada proceso añade ~18,7 s de compilación GPU del codificador de visión, y crear el engine tarda 23,4 s desde SSD.
- Sesgos, riesgo de alucinación y idiomas soportados: no disponible; no se ha publicado evaluación al respecto.
- Restricciones de licencia: Apache 2.0, sin limitaciones conocidas para uso comercial.
- La fila de rendimiento en CPU procede de una build anterior de los mismos pesos (caché KV de 4.096, sin reescritura GPU del codificador de visión), por lo que no es estrictamente comparable con la fila GPU.

## Enlaces

- Modelo LiteRT: https://huggingface.co/litert-community/Muse-Glimmer-30B-LiteRT
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- LiteRT-LM (PyPI): `pip install litert-lm==0.19.0`
- No se han encontrado enlaces adicionales a papers, blogs de anuncio, repositorios de código o demos en la información disponible.
