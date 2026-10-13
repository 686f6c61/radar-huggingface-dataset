# Boollm/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8 27B · Qwen · Boollm (GGUF) es una conversión a GGUF del modelo multimodal Qwen/Qwen3.8-27B publicada por Boollm. No es un lanzamiento oficial de Qwen: sobre los pesos del modelo base se ha fusionado un ajuste fino orientado a escritura cotidiana (borradores de correos, respuestas, reescritura y resumen) y el resultado se ha cuantizado a Q4_K_M para llama.cpp. El repositorio contiene dos ficheros: el modelo de lenguaje (15,7 GiB) y el codificador de visión de Qwen en Q8_0 (600 MiB), que solo hace falta para entradas de imagen.

El pipeline declarado es image-text-to-text, el único idioma declarado es el inglés y la licencia es apache-2.0. La arquitectura interna no se detalla en la información disponible; los parámetros totales ascienden a 27.320.697.856 (unos 27,3 mil millones) y el autor no indica que sea un modelo de mezcla de expertos.

Su interés es acotado, y el propio autor lo deja claro: en sus pruebas no supera al Qwen3.8 27B original en conjunto. Mejora en redacción de borradores (79/100 frente a 70/100) y en modificación de borradores a petición (46/50 frente a 42/50), pero empeora en código (527/664 frente a 545/664, es decir, 79,4% frente a 82,1%) y en matemáticas (97/100 frente a 99/100). Con 0 descargas y 0 likes en el momento de la consulta, no existe validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El pipeline declarado es image-text-to-text (modelo multimodal con codificador de visión); no se detalla la arquitectura interna |
| Parametros totales | 27.320.697.856 (unos 27,3 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El autor indica que el modelo base soporta contexto más largo, pero todas las pruebas se hicieron con 8K tokens por petición |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el codificador de visión (mmproj) |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 (el enlace de licencia apunta al fichero LICENSE de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp). Ficheros: Qwen3.8-27B-Boollm-Q4_K_M.gguf (16.810.714.432 bytes, 15,7 GiB) y mmproj-Qwen3.8-27B-Q8_0.gguf (629.247.072 bytes, 600 MiB) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base en la información proporcionada. Lo que sí se documenta es el proceso de construcción de esta publicación: se parte de Qwen/Qwen3.8-27B, se fusiona en los pesos un ajuste fino de escritura de pequeño tamaño ("a small writing tune merged into its weights") y el resultado se convierte a Q4_K_M para llama.cpp. No se necesita adaptador alguno: basta con descargar el GGUF y ejecutarlo. El ajuste solo modificó el modelo de lenguaje; el codificador de visión (mmproj) es el de Qwen convertido a GGUF sin cambios, idéntico al que se obtendría de Qwen3.8-27B original, y solo es necesario si se envían imágenes.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La plantilla de chat incrustada en el GGUF es la de Qwen y no se ha modificado, por lo que el modo "thinking" sigue funcionando a nivel de plantilla, pero el ajuste se entrenó y se probó con ese modo desactivado (`{"chat_template_kwargs": {"enable_thinking": false}}`). El binario de referencia con el que se construyó y probó el modelo es llama.cpp release b10516. En las pruebas se usaron temperatura 0,7, top-k 40 y top-p 0,9.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat de Qwen y soporte de `--jinja` en llama.cpp.
- Escritura cotidiana: redacción de correos y mensajes a partir de notas breves, respuestas a correos recibidos, composición desde un briefing y generación de tres alternativas distintas (40/40 en la categoría "alternatives").
- Modificación de borradores a petición: acortar, cambiar una fecha o el tono (46/50 en "followup", frente a 42/50 del modelo base).
- Reescritura con tono controlado (informal, formal, más breve) y "humanización" de texto que suena a IA manteniendo los hechos (92/100 en "humanize", frente a 95/100 del base).
- Resumen de textos e hilos de conversación (48/50).
- Aprendizaje y descripción del estilo de escritura de un usuario a partir de muestras ("voice_learn", 10/10).
- Matemáticas básicas: aritmética y problemas de enunciado (97/100, frente a 99/100 del base).
- Visión: responde a preguntas sobre imágenes mediante el mmproj (59/62 en la prueba de 62 preguntas con imagen; 19/20 en "notext", responder sobre una imagen o fichero con poco o ningún texto).
- Respuestas a preguntas cotidianas (79/80) y factuales (50/50).
- Comportamiento declarativo ante información en vivo: dice que no puede conocerla en lugar de inventarla (40/40 en la categoría "live").
- Código: soporte limitado y por debajo del modelo base (145/164 en HumanEval, 88,4%; 382/500 en MBPP, 76,4%). No se documenta soporte de tool calling ni de function calling, ni capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Redacción de correos profesionales a partir de notas: el modelo convierte una lista breve de puntos en un correo completo conservando nombres, cifras y fechas; es la tarea donde más mejora respecto al modelo base (79/100 frente a 70/100).
- Asistente de bandeja de entrada: genera respuestas a correos recibidos asumiendo el papel del usuario (49/60 en "reply"), con 8K tokens de contexto por petición, suficiente para incluir el hilo previo.
- Reescritura y ajuste de tono en herramientas de edición: cambiar un borrador a un registro formal, informal o más breve sin alterar los hechos (135/140 en "rephrase").
- Resumen de hilos y documentos: condensar conversaciones largas o textos extensos respetando el contenido (48/50 en "summarize").
- Extracción de datos de imágenes: con el mmproj cargado, el modelo responde a preguntas sobre una imagen; la model card propone explícitamente el ejemplo de preguntar el total de un recibo. Encaja en flujos de digitalización de facturas o documentos, aunque sin garantías de precisión más allá del 59/62 medido por el autor.
- Detección de estilo propio: a partir de muestras del usuario, el modelo describe su estilo de escritura (10/10 en "voice_learn"), útil para inicializar asistentes de redacción personalizados.
- Atención al cliente en inglés: conversación multi-turno con contexto de 8K tokens, con muestras de que no inventa información en vivo (40/40) y mantiene la coherencia factual (50/50 en "facts"). Requiere asumir el riesgo de alucinación fuera de esas comprobaciones.
- Escribir en el estilo del propio usuario: la categoría "voice_write" cae de 18/40 a 10/40 respecto al modelo base, por lo que este caso de uso no se recomienda con esta variante.

## Benchmarks y rendimiento

Los datos siguientes proceden de pruebas del propio autor (Boollm), con los mismos tests, ajustes y build de llama.cpp para el modelo base Qwen3.8 27B Q4_K_M (obtenido de los pesos BF16 de Qwen) y para este fichero. No son un benchmark independiente.

| Prueba | Qwen3.8 27B (Q4_K_M) | Este modelo | Diferencia |
|---|---|---|---|
| App test global (1.222 comprobaciones) | 1119 | 1118 | −1 |
| Solo tareas de escritura (780 comprobaciones) | 685 | 684 | −1 |
| Respuestas a correos reales (50 casos × 3 comprobaciones) | 118/150 | 118/150 | 0 |
| Coding, HumanEval (164) | — | 145/164 (88,4%) | — |
| Coding, MBPP test split (500) | — | 382/500 (76,4%) | — |
| Coding total (664) | 545/664 (82,1%) | 527/664 (79,4%) | −18 |
| Vision (62 preguntas con imagen) | 59/62 | 59/62 | 0 |

Desglose del app test por categoría (modelo base frente a este modelo):

| Categoria | Que comprueba | Base | Este modelo |
|---|---|---|---|
| draft | Escribir un correo o mensaje desde notas breves conservando todos los hechos | 70/100 | 79/100 |
| followup | Cambiar un borrador a petición ("hazlo más corto", "di jueves") | 42/50 | 46/50 |
| notext | Responder sobre una imagen o fichero con poco o ningún texto | 17/20 | 19/20 |
| reply | Responder a un correo entrante como el usuario | 50/60 | 49/60 |
| compose | Correo nuevo a partir de un briefing | 42/50 | 41/50 |
| humanize | Reescribir texto que suena a IA conservando los hechos | 95/100 | 92/100 |
| rephrase | Reescribir con un tono dado (informal, formal, más breve) | 135/140 | 135/140 |
| summarize | Resumir un texto o un hilo | 49/50 | 48/50 |
| alternatives | Dar tres versiones distintas | 40/40 | 40/40 |
| voice_write | Escribir con el estilo del usuario a partir de sus muestras | 18/40 | 10/40 |
| voice_learn | Describir el estilo de escritura de un usuario a partir de muestras | 10/10 | 10/10 |
| style | Comprobaciones de estilo de escritura | 20/20 | 20/20 |
| aiscore | Apoyo a la detección de texto que suena a IA | 114/120 | 114/120 |
| everyday | Preguntas cotidianas | 79/80 | 79/80 |
| facts | Preguntas factuales | 50/50 | 50/50 |
| math | Aritmética y problemas de enunciado | 99/100 | 97/100 |
| live | Dice que no puede conocer información en vivo en lugar de adivinar | 40/40 | 40/40 |

Nota: la model card proporcionada está truncada a partir de la fila siguiente a "live", por lo que el desglose por categorías podría estar incompleto.

## Requisitos de hardware

- Memoria para el modelo: unos 17 GB (el fichero Q4_K_M ocupa 16.810.714.432 bytes, 15,7 GiB) más la caché de contexto, que el autor cifra en "unos pocos GB" con 8K–16K tokens, más 0,6 GB del lector de imágenes si se usa visión.
- Mínimo cómodo según el autor: un Mac de 32 GB, o una GPU con 24 GB o más de VRAM con descarga parcial a CPU. Aplicando ese criterio de 24 GB de VRAM, encajan tarjetas de esa capacidad como la RTX 3090 o la RTX 4090; el autor no nombra modelos concretos de GPU (A100, H100, etc.).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más, según el criterio del autor, aunque con offload parcial a CPU. En GPUs de 8–16 GB no se documenta su funcionamiento.
- Opciones de despliegue: llama.cpp. El autor documenta `llama-server` (API compatible con OpenAI en el puerto 8080, con `--jinja -ngl 99 -c 16384`) y `llama-mtmd-cli` para entrada de imagen. Se ha construido y probado con llama.cpp release b10516. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coding (total) | Escritura (borradores) | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.8 27B Boollm (GGUF Q4_K_M) | 27,3 mil millones | Probado a 8K; el base soporta más, sin datos concretos | 527/664 (79,4%) | 79/100 | 59/62 | apache-2.0 | HuggingFace, autor Boollm (0 descargas) |
| Qwen3.8 27B (Q4_K_M desde BF16) | 27,3 mil millones | No disponible | 545/664 (82,1%) | 70/100 | 59/62 | apache-2.0 | HuggingFace, Qwen (modelo base oficial) |
| Otras alternativas de la misma categoría | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor advierte de que este modelo "no es mejor que el Qwen3.8 27B original en conjunto". La elección debe hacerse por tarea, no por nombre.
- Rendimiento inferior en código: 527/664 (79,4%) frente a 545/664 (82,1%) del modelo base, una diferencia de 18 comprobaciones. El autor recomienda explícitamente el Qwen3.8 27B original si el uso principal es programar.
- Caída acusada en escritura con el estilo del usuario ("voice_write"): 10/40 frente a 18/40 del base, una reducción de más de la mitad.
- Retrocesos menores en otras categorías: "humanize" 92/100 frente a 95/100, "reply" 49/60 frente a 50/60, "summarize" 48/50 frente a 49/50, "compose" 41/50 frente a 42/50 y "math" 97/100 frente a 99/100.
- Comportamiento en contexto largo no probado: el autor solo midió con 8K tokens por petición, aunque la plantilla del base admita ventanas mayores.
- Modo "thinking": la plantilla se mantiene intacta y el modo sigue activable, pero el ajuste se entrenó y se evaluó con él desactivado, por lo que su calidad en ese modo no está medida.
- Idioma: solo se declara inglés (en). No hay datos de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: el conjunto de pruebas incluye comprobaciones automáticas para no inventar hechos (50/50) y para declarar desconocimiento de información en vivo (40/40), pero no se han publicado métricas independientes de alucinación.
- Los resultados son pruebas del propio autor, no un benchmark independiente, y el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Licencia apache-2.0, que permite uso comercial, pero el enlace de licencia apunta al LICENSE de Qwen/Qwen3.8-27B: conviene verificar los términos aplicables antes de un despliegue en producción.
- La información disponible está incompleta: la model card está truncada en la sección de resultados y no se incluyen las secciones "Intended use", "How it was made" ni el resto de "Limitations" del autor.
- Ámbito de uso: el ajuste está pensado para escritura cotidiana en la aplicación de Boollm; no se documentan soporte de tool calling, uso como agente ni razonamiento multi-paso.
- Verificación de integridad: los ficheros publican hash SHA-256 (`5ba3d93c7c5c757cec8df67bf1897fb56489cc5140877fe5f6a1a0a5ffa5d59e` para el Q4_K_M y `bd597031904a4017679b418ac993c28d58ec800603956cee2718dcd9f2ee0884` para el mmproj); conviene comprobarlos tras la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Boollm/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Sitio del autor: https://boollm.com
- llama.cpp (motor con el que se construyó y probó, release b10516): https://github.com/ggml-org/llama.cpp
