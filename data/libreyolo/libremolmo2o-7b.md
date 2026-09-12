# LibreYOLO/LibreMolmo2o-7b

## Resumen

LibreMolmo2o-7b es un espejo (snapshot mirror) del modelo multimodal allenai/Molmo2-O-7B, publicado por el usuario LibreYOLO y orientado específicamente a tareas de *pointing* sobre una única imagen. El repositorio no modifica pesos, tokenizer, configuración ni código remoto: se limita a fijar el commit `784410650d12be9bc086118fdefa32d2c3bced86` del modelo original y a añadir una model card, un fichero LICENSE y un NOTICE propios. Los pesos proceden del Allen Institute for AI (Ai2) y se distribuyen bajo licencia Apache-2.0.

El modelo tiene 7.760.786.896 parámetros (≈7,76 mil millones) y se publica en formato safetensors para el pipeline `image-text-to-text` de Transformers, con un repositorio de 31,0 GB. Su particularidad no es arquitectónica, sino de integración: se consume a través de la librería LibreYOLO mediante la clase `LibreVLM` y el identificador `molmo2-o-7b`, devolviendo puntos (`result.points.xy`) a partir de un nombre de objeto proporcionado por el usuario (por ejemplo, `names=["boat"]`).

Su relevancia ahora es acotada y muy específica: cubre el caso de uso de *single-image pointing* dentro del ecosistema LibreYOLO, con un snapshot reproducible y dependencias fijadas. No es un modelo nuevo ni un fine-tune: es una envoltura de distribución. La model card advierte explícitamente de que el pointing es la única tarea soportada y de que la confianza devuelta es sintética (1.0), sin que se reclame ningún benchmark de precisión ni de memoria pico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (modelo multimodal `image-text-to-text` de la familia Molmo2, cargado mediante código remoto propio) |
| Parámetros totales | 7.760.786.896 (≈7,76 B), dato real de safetensors |
| Parámetros activos | No disponible (no hay indicios de que sea MoE en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se han publicado cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 31,0 GB; requiere código remoto y Transformers 4.57.1) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en el material proporcionado. Lo único verificable es que se trata de un modelo multimodal de la familia Molmo2 (Ai2) con pipeline `image-text-to-text`, 7,76 B de parámetros y pesos en safetensors. La carga se realiza con código remoto (`custom_code`), fijado a un snapshot concreto, y con la versión de Transformers 4.57.1 como requisito explícito. Cualquier detalle sobre número de capas, mecanismo de atención, visión encoder o estrategia de fusión multimodal queda fuera de la información disponible.

Tampoco se documentan en este repositorio los datos de entrenamiento (número de tokens, composición del dataset, fases de ajuste como RLHF o DPO) ni innovaciones técnicas concretas. El mirror declara que pesos, assets del tokenizer, configuración y código remoto son idénticos al modelo original de Ai2, por lo que cualquier detalle de entrenamiento habría que consultarlo en la model card upstream, preservada en el repositorio como `README.upstream.md`. La aportación de LibreYOLO se limita a la integración en su librería: fijar el commit, añadir LICENSE y NOTICE, y definir el pointing como tarea por defecto y única soportada.

## Capacidades

- Pointing sobre imagen única: dado un nombre de objeto, el modelo devuelve coordenadas de puntos (`result.points.xy`). Es la única tarea de predicción soportada según la model card.
- Generación multimodal `image-text-to-text` heredada del modelo base: la pipeline declarada es de imagen-texto a texto, aunque el wrapper de LibreYOLO no expone tareas de generación libre.
- Integración programática mediante `LibreVLM("molmo2-o-7b", names=[...])` con el extra `libreyolo[molmo2]`.
- Compatibilidad con el ecosistema Transformers (versión 4.57.1) y carga de código remoto fijado por commit.
- Detección con cajas delimitadoras: no soportada.
- Seguimiento de puntos (*point tracking*): no soportado.
- Entrenamiento, validación y exportación: no soportados.
- Tool calling, function calling y flujos de agente multi-paso: no documentados en la información disponible.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Modo *thinking*, visión adicional, audio u otras capacidades especiales: no documentadas.
- Confianza de las predicciones: valor sintético fijo de 1.0, no calibrado.

## Casos de uso

- Robótica de manipulación: obtener la coordenada (x, y) de un objeto previamente nombrado (`names=["boat"]`) para calcular un punto de agarre sobre la imagen capturada por la cámara del brazo. El formato de salida puntual es suficiente cuando el sistema de control solo necesita un punto de contacto.
- Anotación semiautomática de datasets para YOLO: generar puntos semilla sobre imágenes no etiquetadas y usarlos como inicialización en herramientas de etiquetado, reduciendo el tiempo de anotación manual antes de convertir los puntos en cajas.
- Conteo y localización de elementos en agricultura de precisión: señalar frutos, flores o plantas concretas a partir de una clase nombrada para tareas de conteo y muestreo sobre imágenes de campo.
- Inspección visual industrial: localizar el punto exacto de un defecto nombrado (por ejemplo, "grieta") en una imagen de línea de producción, como paso previo a un recorte y a un análisis más detallado.
- Preprocesado de pipelines de visión: usar el punto devuelto para recortar una región de interés y alimentar después un detector o clasificador especializado, reduciendo el área de búsqueda.
- Accesibilidad y asistencia: interfaces en las que la persona usuaria nombra un objeto de la escena y el sistema devuelve su ubicación sobre la imagen para guiar la interacción.
- Human-in-the-loop en plataformas de etiquetado: integrar el modelo como sugeridor de puntos dentro de una herramienta de anotación, dejando la validación final a la persona anotadora.
- Evaluación reproducible en investigación: al estar fijado a un commit concreto y distribuido como mirror, sirve como baseline estable para comparar resultados de pointing sin que cambien los pesos subyacentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ningún benchmark de precisión ni de memoria pico.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ≈15,5 GB solo de pesos (7,76 B × 2 bytes); con caché KV y preprocesado de imagen, una estimación práctica razonable se sitúa en el rango de 18-22 GB. Es una estimación orientativa, no un dato publicado.
- VRAM estimada en cuantización INT8: ≈8 GB de pesos, en torno a 10-12 GB con overhead (estimación orientativa; no hay cuantizaciones oficiales publicadas).
- VRAM estimada en cuantización INT4: ≈4-5 GB de pesos, en torno a 6-8 GB con overhead (estimación orientativa; requeriría cuantizar por cuenta propia).
- GPU de gama profesional: A100 (40/80 GB), H100, L40S o RTX 6000 Ada ejecutan el modelo en BF16 sin restricciones prácticas de memoria.
- GPU de consumo de 24 GB: RTX 4090 y RTX 3090 son viables en BF16 si se moderan resolución de imagen y longitud de contexto.
- GPU de consumo de 16 GB: RTX 4080, 4070 Ti y 4060 Ti 16 GB requerirían INT8 o INT4 para dejar margen a las activaciones.
- GPU de consumo de 12 GB: RTX 3060 12 GB solo con cuantización INT4 agresiva y resolución reducida (estimación orientativa).
- Opciones de despliegue: Transformers con `trust_remote_code` y versión 4.57.1, o la librería LibreYOLO con el extra `libreyolo[molmo2]` instalado en un entorno separado. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El repositorio no incluye mediciones de latencia, throughput ni memoria pico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LibreMolmo2o-7b | 7,76 B | No disponible | Apache-2.0 | Repositorio de HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Espejo con wrapper para pointing; única tarea soportada; confianza sintética 1.0 |
| allenai/Molmo2-O-7B | 7,76 B (pesos idénticos) | No disponible | Apache-2.0 | Repositorio de HuggingFace de Ai2 | Modelo original con pipeline `image-text-to-text`; capacidades completas del modelo base |
| Alternativas de la misma categoría (VLMs de ~7-8 B) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se dispone de datos verificables sobre alternativas en el material consultado |

## Limitaciones y advertencias

- La única tarea soportada es el pointing sobre una imagen. No hay detección con cajas, ni seguimiento de puntos, ni entrenamiento, validación o exportación.
- La confianza devuelta es un valor sintético fijo de 1.0. No está calibrada, por lo que no sirve para umbralizar, filtrar falsos positivos ni detectar la ausencia del objeto solicitado.
- No hay benchmarks de precisión publicados. No es posible comparar su rendimiento con alternativas a partir de la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Requiere cargar código remoto (`custom_code`) desde un snapshot fijado y depende de Transformers 4.57.1. Esto implica una dependencia estricta de versión y un riesgo de seguridad inherente a la ejecución de código remoto.
- Idiomas soportados no declarados. No se documenta el comportamiento multilingüe ni la cobertura de idiomas distintos del inglés.
- Longitud de contexto no declarada, lo que impide planificar usos con prompts largos o múltiples imágenes.
- Riesgo de alucinación espacial: al ser un modelo generativo que produce coordenadas, puede devolver puntos plausibles pero incorrectos cuando el objeto nombrado no está presente. Sin confianza fiable, la detección de ese caso queda a cargo del sistema que lo integre.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar los ficheros LICENSE y NOTICE. La autoría de los pesos corresponde a Ai2; LibreYOLO solo añade la card, la licencia y el aviso al espejo.
- Al ser un espejo, actualizaciones o correcciones del modelo original no se propagan automáticamente: el snapshot queda fijado al commit indicado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LibreYOLO/LibreMolmo2o-7b
- Modelo base en HuggingFace: https://huggingface.co/allenai/Molmo2-O-7B
- Snapshot del modelo base fijado en el espejo: https://huggingface.co/allenai/Molmo2-O-7B/tree/784410650d12be9bc086118fdefa32d2c3bced86
- Model card original preservada: https://huggingface.co/LibreYOLO/LibreMolmo2o-7b/blob/main/README.upstream.md
- Licencia del espejo: https://huggingface.co/LibreYOLO/LibreMolmo2o-7b/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/LibreYOLO/LibreMolmo2o-7b/blob/main/NOTICE
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados disponibles corresponden a una aplicación de chat de voz sin relación).
