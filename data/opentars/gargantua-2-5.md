# OpenTARS/Gargantua-2.5

## Resumen

Gargantua 2.5 es un modelo afinado por el proyecto openTARS a partir de Gemma 4 E4B (Apache-2.0). Está pensado como el motor principal del asistente openTARS: un agente local capaz de abrir programas, escribir texto, buscar en la web, ejecutar comandos y leer imágenes. El modelo conserva el contrato de 19 herramientas de las versiones anteriores de la familia Gargantua, lo que facilita su integración en flujos de automatización de escritorio.

El ajuste se realizó sobre datos propios de tool-use y acciones de texto del proyecto openTARS. La primera ejecución de entrenamiento completó una época y 1.949 pasos: los primeros 1.200 en una Colab T4 en fp16 y los 749 restantes en una RTX 3050 de 6 GB en bf16, con las capas del decodificador en 4 bits y excluyendo el 1,8 % de ejemplos más largos (por encima de 2.048 tokens) para que cupiera en la GPU.

La distribución se hace en formato GGUF para llama.cpp y Ollama, con un archivo de pesos cuantizado Q4_K_M de 4,9 GB y un proyector multimodal F16 de 0,99 GB para imágenes y audio. Su relevancia actual radica en que ofrece capacidades multimodales y de uso de herramientas en un tamaño que cabe en GPUs de consumo, con licencia Apache-2.0 y despliegue local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B), con proyector para imagen y audio |
| Parámetros totales | 7.463.013.674 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (valor usado en el comando de ejemplo de llama-server) |
| Tipos de cuantización | Q4_K_M (pesos), F16 (proyector multimodal) |
| Idiomas soportados | portugués (pt), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer multimodal con proyector para entrada de imagen y audio. El ajuste fino se realizó sobre datos propios del proyecto openTARS centrados en tool-use y acciones de texto, manteniendo el contrato de 19 herramientas de las versiones previas de Gargantua. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento se completó en una época con 1.949 pasos. La primera fase (1.200 pasos) se ejecutó en una Colab T4 en fp16; la segunda (749 pasos) en una RTX 3050 de 6 GB en bf16, con las capas del decodificador cuantizadas a 4 bits y descartando el 1,8 % de ejemplos más largos de 2.048 tokens. No se documentan innovaciones arquitectónicas adicionales más allá del proyector multimodal heredado del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional en portugués e inglés.
- Uso de herramientas (tool calling) con un contrato fijo de 19 herramientas orientado a acciones de escritorio: abrir programas, escribir, buscar en la web y ejecutar comandos.
- Comprensión de imágenes: lectura y descripción de contenido visual.
- Entrada de audio: conversión de voz a texto (marcada como experimental en llama.cpp).
- Acciones de texto: reescritura, resumen, traducción, consultas sobre un texto e ignorar instrucciones ocultas en él.
- Ejecución local mediante llama.cpp y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Modo de pensamiento desactivable mediante `think=false` en la aplicación openTARS.

## Casos de uso

- Asistente de escritorio automatizado: el modelo puede abrir programas, escribir texto y ejecutar comandos mediante su contrato de 19 herramientas, integrándose en la aplicación openTARS para automatizar tareas cotidianas del usuario.
- Automatización de tareas de texto en local: reescritura, resumen y traducción de documentos con un modelo que cabe en 6 GB de VRAM, adecuado para equipos sin GPU de gama alta.
- Descripción y consulta de imágenes: lectura de imágenes para responder preguntas sobre su contenido, útil en flujos de accesibilidad o catalogación de archivos visuales.
- Dictado y transcripción de voz corta: conversión de voz a texto en inglés y portugués para notas breves, con latencias de 2 a 3,5 segundos en CPU según las pruebas del autor.
- Agente local con búsqueda web: combinación de tool calling y búsqueda para responder consultas que requieren información actualizada, con verificación web añadida por la aplicación.
- Despliegue en entornos con privacidad estricta: al ejecutarse íntegramente en local vía llama.cpp u Ollama, permite procesar datos sensibles sin enviarlos a servicios externos.
- Prototipado de agentes con tool-use: el contrato fijo de herramientas y la licencia Apache-2.0 facilitan experimentar con flujos multi-paso y acciones de texto en investigación aplicada.

## Benchmarks y rendimiento

Resultados de las suites de pruebas propias del proyecto openTARS, ejecutadas en una RTX 3050 de 6 GB con la aplicación openTARS y sus atajos desactivados (no son benchmarks públicos):

| Prueba | Resultado |
|---|---|
| Elección de herramienta (21 casos) | 21/21; 1,2 s por petición en GPU, 3,1 s en CPU |
| Acciones de texto (reescritura, resumen, traducción, consulta, ignorar instrucciones ocultas) | 75/76 |
| Respuestas inventadas o erróneas en 48 preguntas (modelo solo / dentro de la app) | 6 / 7 |
| Prueba portátil openTARS (48 tareas cotidianas) | 47/48 |
| Prueba openTARS de 80 tareas | 68/80 |
| Voz a texto, 6 peticiones cortas (3 en inglés, 3 en portugués, voces sintéticas), solo CPU | 6/6; 2 a 3,5 s cada una |

Rendimiento en CPU (llama.cpp b12032, 16 hilos, medido sobre una exportación anterior del mismo modelo): 1,4 s para una respuesta corta, 3,9 s para responder sobre una imagen, 14,1 s para un prompt de 1.200 tokens y 8,6 GB de RAM.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para el archivo Q4_K_M (4,9 GB) más el proyector F16 (0,99 GB); el autor confirma que el entrenamiento cupo en una RTX 3050 de 6 GB.
- GPU recomendadas: RTX 3050 de 6 GB como mínimo validado; GPUs con 8 GB o más (RTX 3060, 4060, 4070) ofrecen mayor margen. Para mayor throughput, A100 o H100 no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 3050 de 6 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, probado con build b12032) y Ollama (`ProjectOpenTARS/Gargantua-2.5:latest`).
- Latencia y throughput: 1,2 s por petición de tool-call en GPU y 3,1 s en CPU; 1,4 s para respuesta corta en CPU; 3,9 s para consulta sobre imagen en CPU; 14,1 s para prompt de 1.200 tokens en CPU. Consumo de 8,6 GB de RAM en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gargantua 2.5 | 7.463.013.674 | 8.192 tokens | Apache-2.0 | GGUF | Ajuste de Gemma 4 E4B con tool-use y multimodal |
| Gemma 4 E4B (base) | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base sin ajuste de tool-use específico |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- Es débil señalando elementos pequeños de interfaz por posición: 0 de 40 en la prueba de pantalla del autor; no fue entrenado con capturas de pantalla.
- El audio solo se probó con frases sintéticas cortas; no se han medido voces reales, ruido ni grabaciones largas, y llama.cpp marca la entrada de audio como experimental.
- Las tareas de editor de texto y las de "mirar este archivo de imagen" fallan a veces en la prueba de 80 tareas (68/80).
- Puede equivocarse en datos factuales: 6 respuestas inventadas o erróneas de 48 preguntas en el modelo solo y 7 dentro de la app.
- Idiomas limitados a portugués e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación presente; la aplicación openTARS añade avisos y comprobaciones web para mitigarlo.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Gemma 4 E4B.
- El contexto de 8.192 tokens limita tareas con documentos largos; el entrenamiento excluyó ejemplos de más de 2.048 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/Gargantua-2.5
- Proyecto openTARS: https://project-opentars.github.io/OpenTARS/
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Ollama: `ProjectOpenTARS/Gargantua-2.5:latest`
