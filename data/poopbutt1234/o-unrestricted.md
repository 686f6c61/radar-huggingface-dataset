# Poopbutt1234/o-unrestricted

# Poopbutt1234/o-unrestricted

## Resumen

o-unrestricted es un reempaquetado en formato GGUF de un modelo derivado de la familia Qwen, publicado por el usuario Poopbutt1234. No se trata de un modelo entrenado desde cero: el autor describe el artefacto como la capa de pesos de una aplicación de chat independiente llamada "o", construida sobre la cadena de derivación Qwen3.8-27B → trohrbaugh/Qwen3.8-27B-heretic-ara → 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF. El único cambio introducido en el GGUF es el campo `general.name` (nombre para mostrar); los tensores, el tokenizador, la arquitectura y la plantilla de chat embebida permanecen intactos según el autor.

El modelo declara 27B parámetros (dato reportado por el proyecto upstream), cuantización RVN Q4_K_M y un fichero de pesos de 16.547.400.224 bytes (15,41 GiB). Los metadatos del modelo de origen indican una ventana de contexto de 262.144 tokens, pero el despliegue piloto documentado se limita a 4.096 tokens. La licencia declarada es Apache-2.0 y el formato de pesos es exclusivamente GGUF, orientado a su uso con Ollama mediante el Modelfile incluido.

Su relevancia práctica es limitada y muy específica: sirve como ejemplo reproducible de derivación y renombrado de un GGUF, y como base para experimentar con modelos "abliterated"/"uncensored" en local. El propio autor advierte que la subida del GGUF está pendiente en el momento de redactar la model card, que el modelo no está afiliado a OpenAI y que la etiqueta "Unrestricted" es una denominación de la aplicación, no una garantía sobre el comportamiento del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada por el autor; campo de arquitectura GGUF: `qwen35` (familia Qwen). Especificaciones internas (capas, atención, MoE) no disponibles |
| Parametros totales | 27B (según el proyecto upstream) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens en los metadatos del modelo de origen; contexto de servicio del piloto: 4.096 tokens |
| Tipos de cuantizacion | RVN Q4_K_M multilingüe (GGUF). No se listan otras cuantizaciones |
| Idiomas soportados | No disponible (la cuantización se etiqueta como "multilingual", sin lista de idiomas) |
| Licencia | Apache-2.0 (se conserva la licencia upstream; ver `UPSTREAM-LICENSE`) |
| Formato de pesos | GGUF (fichero de 16.547.400.224 bytes, 15,41 GiB) |
| Tamano del fichero | 15,41 GiB |
| Nombre para mostrar | `o-unrestricted` |
| Modelo base | 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF |

## Arquitectura y entrenamiento

No hay información publicada sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF, DPO u otras fases de alineación. El autor no describe la arquitectura interna más allá del campo `qwen35` del GGUF, que sitúa el modelo en la familia Qwen; parámetros como el número de capas, el tipo de atención o la implementación del tokenizador no están disponibles en la información proporcionada. Lo único verificable documentalmente es la cadena de derivación: Qwen3.8-27B (Qwen) → trohrbaugh/Qwen3.8-27B-heretic-ara (derivado "ARA") → 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF → este reempaquetado.

El proceso aplicado en este repositorio es de preparación y renombrado, no de entrenamiento. Según la model card, la preparación verifica el checksum del fichero upstream y comprueba que el payload de tensores no ha cambiado; `SOURCE.json` fija la revisión de origen y ambos checksums. La única modificación es el campo `general.name` del GGUF. La plantilla de chat original se conserva sin cambios y, según el autor, no contiene identidades por defecto del tipo "I am Qwen" o "You are Qwen"; la persona "o" se inyecta a nivel de Modelfile.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el artefacto se distribuye con una plantilla de chat embebida, por lo que el uso previsto es el diálogo multi-turno en un runtime compatible con GGUF.
- Ventana de contexto amplia en metadatos: el modelo de origen declara 262.144 tokens, aunque el despliegue piloto documentado recorta el servicio a 4.096 tokens. La capacidad de contexto del modelo no implica que este despliegue pueda servirla.
- Identidad de personaje: el Modelfile define una persona "o" concisa y directa; el modelo responde "I am o" cuando se le pregunta por su nombre y explica su procedencia Qwen cuando se le pregunta por el origen.
- Ausencia de identidad de marca del modelo base: la plantilla embebida no fija una identidad Qwen por defecto.
- Tool calling / function calling: no documentado por el autor. No disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas. No disponible.
- Capacidades multilingües: la cuantización se etiqueta como "multilingual", pero no se publica lista de idiomas ni evaluación por idioma. No verificado.
- Visión, audio o modo de razonamiento explícito (thinking mode): no documentados. No disponible.
- Generación de código y matemáticas: no documentadas específicamente para este artefacto. No disponible.
- Comportamiento sin alineación de seguridad: la cadena de nombres ("heretic", "abliterated", "uncensored") indica derivados orientados a eliminar direcciones de rechazo, pero no hay evaluación publicada que lo cuantifique.

## Casos de uso

- Asistente conversacional autoalojado en estación de trabajo: con un fichero Q4_K_M de 15,41 GiB y el requisito declarado de al menos 24 GB de memoria de GPU, el modelo se puede servir en local con Ollama usando el Modelfile incluido, sin enviar datos a servicios externos.
- Despliegue de una aplicación de chat propia: el repositorio enlazado incluye una interfaz web con streaming y despliegue con Docker Compose, lo que permite levantar una aplicación de chat funcional sobre este GGUF sin desarrollar la capa de inferencia.
- Reproducción de pipelines de preparación de modelos: los scripts de descarga y preparación, junto con `SOURCE.json` y el checksum SHA-256, sirven como plantilla verificable para renombrar y redistribuir un GGUF conservando la trazabilidad del origen.
- Investigación sobre abliteración y alineación: comparar las respuestas de este derivado frente al modelo Qwen original permite estudiar qué tipo de peticiones dejan de rechazarse y con qué coste en coherencia, siempre que se documente la metodología y se respeten los términos de uso.
- Generación de ficción y redacción creativa sin filtros editoriales: el caso de uso natural de un derivado "uncensored" es la escritura de narrativa con temáticas sensibles; requiere revisión humana del resultado y control de acceso si hay terceros implicados.
- Procesamiento por lotes de documentos largos: si se amplía el contexto de servicio más allá de los 4.096 tokens del piloto, los 262.144 tokens de metadatos permiten plantear resumen y extracción sobre documentos extensos, con la advertencia de que ese despliegue no está documentado ni medido.
- Evaluación interna de riesgos antes de producción: usar el modelo como sujeto de pruebas de red-teaming para medir la tasa de contenido dañino o no conforme que genera una variante sin alineación, y decidir así si encaja en un producto.
- Base para fine-tuning o cuantizaciones adicionales: al ser un GGUF ya cuantizado, su utilidad para reentrenamiento es limitada; serviría principalmente como referencia de comportamiento o para generar datos sintéticos con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones de terceros en los resultados de búsqueda. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: el autor recomienda una GPU con al menos 24 GB de memoria para el piloto en Q4_K_M. Los pesos ocupan 15,41 GiB, por lo que el margen restante debe cubrir el sistema operativo, la caché KV y los buffers del runtime.
- GPU recomendadas: no se enumeran modelos concretos en la información disponible. El requisito declarado es una GPU con 24 GB o más de memoria, lo que encaja con tarjetas de esa clase; no se confirma compatibilidad con ninguna en concreto.
- GPU de consumo: no confirmado. Una GPU de 16 GB no se menciona como suficiente; el autor advierte explícitamente que un Mac de 16 GB no tiene margen para los 15,41 GiB del modelo más el sistema operativo, la caché KV y los buffers.
- Contexto de servicio: el piloto se limita a 4.096 tokens. Servir la ventana de 262.144 tokens exigiría una configuración de memoria muy superior y no está documentada.
- Opciones de despliegue: Ollama, mediante `ollama create` y el Modelfile incluido, es la única vía documentada. El formato GGUF es nativo de llama.cpp y sus derivados, pero el autor no documenta vLLM, TGI ni otras alternativas.
- Almacenamiento: hay que reservar espacio para el fichero de 15,41 GiB, más la copia que mantiene el propio almacén de modelos de Ollama.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de benchmarks ni de especificaciones completas de las alternativas, por lo que la comparación se limita a la línea de derivación y a los datos declarados.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Poopbutt1234/o-unrestricted | 27B (upstream) | 262.144 en metadatos; 4.096 en el piloto | GGUF Q4_K_M | Apache-2.0 | Renombrado del GGUF de origen; persona "o"; aplicación de chat con UI y Docker Compose |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27B (upstream) | No disponible | GGUF | No disponible en la información proporcionada | Origen directo de este artefacto; misma cuantización Q4_K_M |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B (upstream) | No disponible | No disponible | No disponible en la información proporcionada | Derivado "ARA" previo en la cadena |
| Qwen/Qwen3.8-27B | 27B | No disponible | No disponible | No disponible en la información proporcionada | Modelo base original de la familia Qwen |

No se conocen modelos comparables de otros proveedores con datos verificables en la información proporcionada: no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas de regresión, ni validación por terceros. No hay forma de estimar la calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion elevado y no medido: al no existir evaluación, no se puede acotar la tasa de invención de hechos, especialmente en tareas de recuperación de información o generación factual.
- Sin alineación de seguridad: la cadena de derivación ("heretic", "abliterated", "uncensored") apunta a la eliminación de mecanismos de rechazo. Esto implica riesgo real de generar contenido dañino, ilegal o sesgado, y traslada la responsabilidad del filtrado al desarrollador que lo despliegue.
- La etiqueta "Unrestricted" no es una garantia: el propio autor aclara que es el nombre de la aplicación y no una promesa sobre el comportamiento del modelo.
- Limitacion de contexto en el despliegue: la ventana real del piloto es de 4.096 tokens. Los 262.144 tokens son metadatos del modelo de origen y no implican que esta configuración pueda servirlos.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluación multilingüe, pese a la etiqueta "multilingual" de la cuantización.
- Disponibilidad incierta: la model card indica que la subida del GGUF está pendiente y remite a los scripts de preparación del repositorio de GitHub. El fichero puede no estar accesible en el momento de la consulta.
- Adopcion nula: 0 descargas y 0 "me gusta" en el momento de la consulta, sin señales de validación independiente ni de mantenimiento continuado por parte del espacio de nombres del autor.
- Restricciones de redistribucion: aunque la licencia es Apache-2.0, el autor exige que cualquier redistribución incluya la model card, el Modelfile, `SOURCE.json`, `UPSTREAM-LICENSE` y el GGUF renombrado con su fichero SHA-256, y que se publique bajo un espacio de nombres propio. Conviene revisar `UPSTREAM-LICENSE` antes de cualquier uso comercial.
- Trazabilidad del origen: la licencia del modelo Qwen original y de los derivados intermedios debe verificarse de forma independiente; la información proporcionada solo declara Apache-2.0 de forma agregada.
- Fecha de publicacion atipica: los metadatos indican creación y actualización el 2026-09-28, sin historial de versiones previo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Poopbutt1234/o-unrestricted
- Modelo base declarado: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Derivado intermedio: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la aplicación (UI web con streaming, Docker Compose y scripts de preparación): https://github.com/rooftopcards-debug/o-unrestricted
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Descarga de Ollama: https://ollama.com/download
- Ficheros referenciados en el repositorio: `SOURCE.json`, `UPSTREAM-LICENSE`, `Modelfile`, `o-unrestricted-v1.gguf.sha256`
- Resultados de busqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las búsquedas devolvieron únicamente páginas sin relación con el ámbito técnico (sitios de contactos), por lo que no se incluyen como fuentes.
