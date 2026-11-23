# SoAIHQ/gpt-oss-120b-VISION-GGUF

## Resumen

gpt-oss-120b-VISION-GGUF es una conversión al formato GGUF del modelo de razonamiento open-weight gpt-oss-120b de OpenAI, publicada por SoAIHQ. Mantiene los pesos originales sin recuantizar (los expertos MoE ya vienen en MXFP4 desde el post-entrenamiento de OpenAI, y el resto de tensores conservan BF16) y añade una proyección multimodal experimental que permite introducir imágenes. El resultado es un paquete listo para llama.cpp con API compatible con OpenAI.

El modelo base es un transformer de mezcla de expertos con 117.000 millones de parámetros totales y 5.100 millones activos (128 expertos, 4 activos por token), ventana de contexto de 131.072 tokens y modo de razonamiento siempre activo, ajustable mediante `reasoning_effort` (`low`, `medium`, `high`). La licencia Apache 2.0 y la disponibilidad de pesos abiertos lo sitúan como una alternativa de gran tamaño y bajo coste de activación para despliegues locales o privados.

Su relevancia actual radica en que permite ejecutar un modelo de razonamiento de escala 120B en hardware más modesto gracias a la activación dispersa, y en que la build GGUF evita la doble cuantización que introduciría error adicional. La componente de visión es explícita y deliberadamente experimental: requiere un fichero `mmproj` aparte y no debe considerarse equivalente a un modelo multimodal entrenado de forma nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (transformer), 128 expertos con 4 activos por token |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5.1B |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | MXFP4 (expertos, formato original de post-entrenamiento) + BF16 (resto de tensores); proyección multimodal en F16 |
| Idiomas soportados | Principalmente inglés (no se detallan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos partes: `gpt-oss-120b-MXFP4-00001-of-00002.gguf` y `-00002-of-00002.gguf`, 65,4 GB en total) + `mmproj-gpt-oss-120b-f16.gguf` (651,1 MB) para imágenes |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos y 4 activos por token, lo que da 5.1B parámetros activos sobre 117B totales. OpenAI post-entrenó el modelo con los pesos de los expertos ya en MXFP4 y realizó sus evaluaciones publicadas en ese formato; por eso esta build GGUF copia dichos tensores sin recuantizar y mantiene el resto en BF16. La model card justifica explícitamente no ofrecer `Q4_K_M` (expandiría y redondearía de nuevo los expertos, añadiendo error sobre el redondeo original) ni `Q8_0` (duplicaría el tamaño sin recuperar precisión).

El razonamiento está siempre activo y su profundidad se controla con el parámetro `reasoning_effort` (`low`, `medium`, `high`). El modelo solo funciona con el formato de prompt harmony de OpenAI, cuya plantilla de chat va embebida en el GGUF y es aplicada automáticamente por el runtime; llama.cpp convierte las llamadas a herramientas al formato `tool_calls` compatible con OpenAI. La componente de visión se implementa mediante una proyección multimodal separada (`mmproj`), descrita por el autor como experimental. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento siempre activo, graduable en tres niveles de esfuerzo.
- Llamada a herramientas y funciones con parseo nativo a `tool_calls` en llama.cpp.
- Entrada de imágenes experimental mediante el fichero `mmproj` (pipeline `image-text-to-text`).
- Contexto largo de 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües limitadas: el modelo está orientado principalmente al inglés.
- No soporta audio.
- Compatible con endpoints estilo OpenAI a través de `llama-server`.

## Casos de uso

- Razonamiento sobre documentación técnica extensa: con 128K de contexto se pueden cargar manuales, especificaciones o bases de código completas y formular preguntas que requieran correlacionar secciones alejadas entre sí.
- Asistente de código en local: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo en pipelines de CI/CD o en editores que ya hablen el protocolo de OpenAI, manteniendo el código dentro de la infraestructura propia.
- Análisis de capturas y diagramas (experimental): cargando el `mmproj`, se pueden enviar imágenes junto a texto para tareas de descripción o extracción de información, asumiendo las limitaciones de una visión no entrenada de forma nativa.
- Despliegue privado con requisitos de soberanía del dato: la licencia Apache 2.0 y la ejecución local con llama.cpp permiten procesar información sensible sin salir de la organización.
- Automatización de flujos agénticos multi-paso: el razonamiento graduable y el soporte de herramientas facilitan cadenas de decisión con llamadas a APIs externas, ajustando `reasoning_effort` según el coste tolerable.
- Prototipado e investigación sobre MoE de gran escala: al conservar los pesos originales sin recuantizar, sirve como referencia fiel para experimentos de evaluación y comparación de técnicas de cuantización.
- Generación de resúmenes y extracción estructurada sobre corpus largos en inglés, aprovechando la ventana de 128K y el modo de razonamiento para tareas de clasificación compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos MXFP4 ocupan 65,4 GB, más 651,1 MB del `mmproj` si se usa visión; a ello se suma la memoria de contexto, que crece con la longitud configurada (la model card advierte explícitamente de este coste adicional).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, el conjunto requiere GPUs con 80 GB o más de memoria para caber íntegramente en una sola unidad, o bien reparto entre varias.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB o menos en una sola unidad; llama.cpp permite dividir capas entre GPU y CPU, lo que hace viable la ejecución con RAM del sistema como apoyo, a costa de latencia.
- Opciones de despliegue: llama.cpp (versión referenciada v0.5.0) mediante `llama-server`, con descarga automática del `mmproj` usando `llama-server -hf`. No se mencionan otras opciones en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gpt-oss-120b-VISION-GGUF (esta ficha) | 117B | 5.1B | 128K | Apache 2.0 | GGUF (MXFP4 + BF16) | Visión experimental vía `mmproj`; pesos sin recuantizar |
| openai/gpt-oss-120b | 117B | 5.1B | 128K | Apache 2.0 | safetensors (MXFP4/BF16) | Modelo base original; sin visión |
| SoAIHQ/gpt-oss-120b-VISION-v2-GGUF | 117B | 5.1B | 128K | Apache 2.0 | GGUF | Mismos pesos con plantilla de chat corregida; recomendado por el autor para nuevas descargas |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La capacidad de visión es experimental y depende de una proyección multimodal separada; no debe asumirse un rendimiento equivalente al de modelos multimodales nativos.
- El modelo está orientado principalmente al inglés; el rendimiento en castellano u otros idiomas no está documentado.
- El razonamiento no se puede desactivar: siempre genera tokens de pensamiento, lo que incrementa el coste y la latencia. Se recomienda reservar al menos 16K tokens de salida para dejar espacio tras el razonamiento.
- Solo funciona con el formato de prompt harmony; usar plantillas distintas puede degradar gravemente la calidad o romper el parseo de tool calls.
- El autor recomienda la versión v2 para nuevas descargas por su plantilla de chat corregida, que mejora el razonamiento y el manejo de llamadas a herramientas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de fidelidad en esta build.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base de OpenAI enlazadas en la model card.
- El tamaño de 65,4 GB más el coste de contexto limita el despliegue en hardware de gama alta o requiere reparto GPU/CPU con la consiguiente penalización de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Licencia del modelo base: https://huggingface.co/openai/gpt-oss-120b/blob/main/LICENSE
- Versión v2 recomendada: https://huggingface.co/SoAIHQ/gpt-oss-120b-VISION-v2-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Formato harmony de OpenAI: https://github.com/openai/harmony
- Sitio del autor: https://soai.to
