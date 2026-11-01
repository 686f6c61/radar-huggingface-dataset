# mashbox-labs/granite-speech-4.1-2b-TPU

## Resumen

Granite Speech 4.1 2B en formato BSHJ es una redistribución de los pesos del modelo de habla de IBM `ibm-granite/granite-speech-4.1-2b`, empaquetados por mashbox-labs en el formato binario BSHJ que consume su motor de inferencia para TPU. No se trata de un modelo nuevo ni de un reentrenamiento: el repositorio contiene únicamente los pesos convertidos, sin tokenizador, procesador ni plantilla de chat, que permanecen en el repositorio original de IBM. El modelo subyacente es un modelo de lenguaje y habla orientado a reconocimiento automático de voz (ASR) y traducción de habla en inglés, francés, alemán, español, portugués y japonés.

El interés de esta ficha es doble. Por un lado, documenta el modelo de IBM en sí, con 2 000 millones de parámetros aproximadamente y una dimensión de embedding de 2048 según la forma del tensor `embed_tokens` publicada. Por otro, describe un artefacto de despliegue muy específico: un único fichero de 4,63 GB en bfloat16 con 938 tensores, pensado para leerse mediante memory mapping desde el paquete `mashbox` 0.1.10 sobre hardware TPU.

Es relevante ahora porque muestra una vía alternativa de distribución de pesos para aceleradores TPU, fuera del ecosistema habitual de safetensors y GGUF. Conviene señalar que el paquete `mashbox` en su versión 0.1.10 no incluye el comando `mashbox run` para este modelo, por lo que el artefacto es, en la práctica, solo de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de habla y lenguaje de IBM; el repositorio solo indica que es un speech-language model) |
| Parámetros totales | 2B (según el nombre del modelo); dimensión de embedding 2048 según la forma del tensor `embed_tokens` |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados están en bfloat16) |
| Idiomas soportados | inglés, francés, alemán, español, portugués y japonés (según la descripción de IBM citada en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | BSHJ (fichero único `granite-speech-4.1-2b.bshj`, 4,63 GB, 938 tensores en bfloat16) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo de IBM: no se detallan el tipo de encoder de audio, el decoder de lenguaje, la composición del dataset ni las fases de alineamiento o ajuste fino. Lo único verificable a partir de los metadatos publicados es la presencia de un módulo `language_model` con una matriz de embeddings de forma (100353, 2048) en bfloat16, lo que sitúa el vocabulario en 100 353 entradas y la dimensión oculta en 2048. También se menciona la existencia de capas con BatchNorm, ya que el conversor descarta 16 contadores `num_batches_tracked` de las 954 tensores originales.

El proceso de conversión sí está documentado: se parte de los tres ficheros `model-0000{1,2,3}-of-00003.safetensors` del repositorio de IBM en la revisión `de575db64086f84fdc79da4932d1076e965bc546`, se conservan los nombres de tensor originales y se empaqueta todo en un contenedor BSHJ que el lector de `mashbox` abre como arrays de NumPy sobre memory mapping, sin copia en memoria. No hay información sobre tokens de entrenamiento, RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Reconocimiento automático de voz (ASR): tarea principal declarada en el pipeline del repositorio.
- Traducción de habla: la descripción de IBM citada incluye traducción de voz, además de reconocimiento.
- Cobertura multilingüe en inglés, francés, alemán, español, portugués y japonés.
- Procesamiento de audio y texto dentro de un mismo modelo de habla y lenguaje.
- Lectura de pesos mediante memory mapping con el paquete `mashbox` (API `bshj.File`), sin copia de los tensores.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de pensamiento explícito.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio en texto en los seis idiomas declarados, lo que permite un pipeline único para equipos multilingües sin cambiar de modelo por idioma.
- Subtitulado y accesibilidad: generación de subtítulos para vídeo en inglés, francés, alemán, español, portugués o japonés, aprovechando la tarea ASR del pipeline declarado.
- Traducción de habla en atención al cliente: transcripción y traducción de llamadas entrantes en centros de soporte con clientes de distintos países, usando el modelo como componente de un sistema mayor.
- Investigación en aceleradores TPU: el formato BSHJ y el lector `mashbox` permiten experimentar con carga de pesos por memory mapping en TPU, útil para estudiar el rendimiento de lectura de tensores en bfloat16 sin duplicar los 4,63 GB en RAM.
- Archivado y búsqueda de audio corporativo: transcripción por lotes de grabaciones para indexación y búsqueda textual posterior, en un despliegue por lotes donde la latencia no es crítica.
- Evaluación comparativa de formatos de pesos: comparar el rendimiento de carga y el consumo de memoria del contenedor BSHJ frente a safetensors o GGUF para un mismo modelo de 2B, como estudio de infraestructura.
- Docencia y prototipado de ASR: al ser un artefacto Apache-2.0 de tamaño moderado, sirve para demostrar el flujo completo de descarga, carga de pesos y ejecución de un modelo de habla en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El artefacto está orientado a TPU: el formato BSHJ es el que lee el motor de TPU de `mashbox`, no un runtime genérico de GPU.
- Tamaño en disco y en memoria: 4,63 GB en bfloat16; al abrirse mediante memory mapping no se copia en RAM, pero la memoria del acelerador debe alojar los tensores que se materialicen.
- VRAM estimada para GPU: no disponible. Como referencia de orden de magnitud, 2B parámetros en bfloat16 ocupan unos 4 GB, y en cuantizaciones de 8 y 4 bits bajarían aproximadamente a 2 GB y 1 GB respectivamente, pero no se han publicado versiones cuantizadas de este repositorio.
- GPU recomendadas: no disponible para este artefacto concreto; el repositorio no documenta soporte de GPU.
- Viabilidad en GPU de consumo: no confirmada. No hay ficheros GGUF ni instrucciones para llama.cpp, Ollama o similares.
- Opciones de despliegue documentadas: `pip install mashbox` (versión 0.1.10) y carga con `mashbox.bshj.File` sobre TPU. La model card advierte explícitamente de que esta versión no incluye el comando `mashbox run` para este modelo.
- vLLM, TGI y llama.cpp: no disponibles para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mashbox-labs/granite-speech-4.1-2b-TPU | 2B | no disponible | 6 idiomas | Apache-2.0 | BSHJ (bfloat16) | Solo pesos; orientado a TPU; sin tokenizador ni procesador |
| ibm-granite/granite-speech-4.1-2b | 2B | no disponible | 6 idiomas | Apache-2.0 | safetensors | Modelo original de IBM; incluye tokenizador, procesador y plantilla de chat |
| Alternativas ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más relevante es con el repositorio original de IBM: misma licencia y mismos pesos, pero el original es la opción práctica para inferencia estándar, mientras que esta versión BSHJ está pensada exclusivamente para el motor de TPU de mashbox.

## Limitaciones y advertencias

- No es un modelo independiente: es una conversión de formato de los pesos de IBM; cualquier limitación del modelo original se hereda.
- El repositorio no incluye tokenizador, procesador ni plantilla de chat; hay que obtenerlos del repositorio de IBM en la revisión indicada.
- El paquete `mashbox` 0.1.10 no ofrece `mashbox run` para este modelo, por lo que no hay una vía de ejecución lista para usar documentada.
- No se documentan sesgos, tasas de alucinación ni límites de contexto o de calidad por idioma; se desconoce el comportamiento real en producción.
- El rendimiento en GPU no está soportado ni medido; usar el formato BSHJ fuera de TPU no está contemplado por el autor.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la model card de IBM y señala que ese repositorio no tiene fichero de licencia separado, lo que conviene verificar antes de un despliegue comercial.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día (30 de octubre de 2026): no hay evidencia de uso en producción ni validación por terceros.
- El conversor descarta 16 contadores `num_batches_tracked` de BatchNorm; es un detalle relevante si se pretende reconstruir el modelo bit a bit.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mashbox-labs/granite-speech-4.1-2b-TPU
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-speech-4.1-2b/tree/de575db64086f84fdc79da4932d1076e965bc546
- Lector BSHJ (código fuente): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/src/mashbox/bshj.py
- Repositorio GitHub de mashbox: https://github.com/mashbox-labs/mashbox
- Paquete en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Perfil en X: https://x.com/mashboxgg
- Contacto: hello@mashbox.gg
