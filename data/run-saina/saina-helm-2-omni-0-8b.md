# run-saina/saina-helm-2-omni-0.8b

## Resumen

Saina Helm 2 Omni 0.8B es un modelo de decisión multimodal desarrollado por run-saina. No genera texto: recibe un estado (cadena o JSON) acompañado de hasta 8 imágenes y 4 fragmentos de audio, y devuelve una probabilidad para cada opción de una o varias preguntas tipadas (sí/no, elección única, elección múltiple o valoración). Todas las preguntas de una misma petición se responden en una sola pasada sobre el estado y los medios compartidos. Es un fine-tuning de Qwen/Qwen3.5-0.8B con 852.985.920 parámetros totales.

Su interés práctico está en incorporar decisiones multimodales ligeras en pipelines donde un error es recuperable o pasa por revisión humana: enrutado de tickets con captura adjunta, verificación de un recibo contra una reclamación, marcado de llamadas con voz potencialmente sintética o etiquetado de sonidos e instrumentos. El modo `decision` permite abstenerse y escalar cuando la confianza queda por debajo de un umbral configurable, en lugar de forzar una respuesta.

El modelo se ejecuta mediante el paquete `saina` (>=0.4.0), que construye el prompt exacto de entrenamiento, coloca las imágenes y los espectrogramas donde se colocaron durante el entrenamiento y aplica la cabeza entrenada; las puntuaciones dependen de ello, por lo que la model card desaconseja usar un prompt propio o `generate()`. También se puede servir como servidor HTTP autenticado o consumir a través de la API alojada en saina.run. Licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-0.8B; la model card incluye las etiquetas `qwen3_5` y `mixture-of-experts`, sin más detalle arquitectónico |
| Parámetros totales | 852.985.920 (0,85B) |
| Parámetros activos | no disponible (la etiqueta `mixture-of-experts` no va acompañada del número de parámetros activos) |
| Longitud de contexto | no disponible (la model card remite a un apartado "context window below" que no aparece en la información proporcionada) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles; la model card indica que el texto y el habla en idiomas distintos del inglés están en gran medida sin probar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B mediante fine-tuning y añade una cabeza de clasificación entrenada que produce probabilidades por opción. La entrada multimodal se resuelve sin pesos de audio dedicados: las imágenes las procesa la torre de visión de Qwen3.5 y cada clip de audio se convierte en una imagen de espectrograma log-mel (mono, 16 kHz) que se lee por la misma vía. Las imágenes se redimensionan a un máximo de 1,6 megapíxeles manteniendo la proporción, con un token de entrada por cada bloque de 32 × 32 píxeles; un clip de 10 segundos ocupa 124 tokens de entrada. Las etiquetas del repositorio incluyen `mixture-of-experts`, `multimodal` y `any-to-any`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación. La model card sí detalla el contrato de inferencia: el paquete `saina` construye el prompt de entrenamiento, coloca los medios en la posición correcta y aplica la cabeza entrenada; no se ejecuta código remoto. Se recomienda fijar `revision` a un commit concreto. Se admiten cuatro tipos de pregunta (sí/no, elección única con 2-255 opciones, elección múltiple con pertenencias independientes por opción y valoración con 2-10 niveles ordenados).

## Capacidades

- Puntuación de decisiones multimodales: asigna probabilidad a cada opción de una pregunta tipada a partir de texto, imágenes y audio combinados en una sola pasada.
- Preguntas de sí/no con probabilidades `yes`, `no` y `confidence`, y descripciones opcionales para cada polo.
- Elección única con 2-255 opciones, devolviendo `probabilities`, `selection` y `confidence`.
- Elección múltiple con pertenencias independientes por opción (clasificación multi-etiqueta).
- Valoración sobre 2-10 niveles ordenados, con `probabilities`, `expected_level` y `confidence`.
- Modo `decision` con `threshold` (por defecto 0,8) y `min_margin` opcional para sí/no y elección única; las respuestas no suficientemente confiables devuelven `None` junto con un motivo (`below_threshold`, `below_margin`, `tie`), lo que permite abstenerse y escalar.
- Lectura de hasta 8 imágenes por petición (PNG, JPEG, WebP; 10 MB cada una) y hasta 4 clips de audio (WAV, FLAC, MP3, Ogg, WebM; 10 MB y 10 s cada uno).
- Reconocimiento de palabras cortas en audio y etiquetado de sonidos, comandos hablados o instrumentos a partir del espectrograma.
- Integración como nodo de decisión dentro de pipelines de agentes (etiqueta `agents`), no como generador de texto.
- No soporta generación de texto, transcripción de habla larga, vídeo, audio de más de 10 segundos ni function calling en el sentido clásico: no produce llamadas a herramientas ni texto estructurado, solo puntuaciones.

## Casos de uso

- Enrutado de tickets de soporte con captura adjunta: el modelo recibe el texto del mensaje y la captura de pantalla en la misma petición y responde una pregunta de elección única con la cola o el equipo adecuado, aprovechando que todos los medios se ven en una sola pasada.
- Verificación de gastos contra póliza: se envía el importe reclamado como estado JSON, la imagen del recibo y una pregunta de sí/no del tipo "¿el total del recibo coincide con el importe reclamado?", con escalado automático si la confianza cae por debajo del umbral.
- Señal de voz sintética en atención telefónica: análisis de un clip corto de la llamada con una pregunta de sí/no sobre si el habla ha sido sintetizada o convertida, usada como señal para exigir verificación adicional y nunca como prueba de fraude.
- Clasificación multi-etiqueta de imágenes en control de calidad: una sola imagen de producto con una pregunta de elección múltiple sobre defectos presentes (arañazo, abolladura, etiqueta torcida), devolviendo pertenencias independientes por defecto.
- Etiquetado de sonidos e instrumentos en catalogación de archivos de audio: clips de hasta 10 segundos por petición, hasta cuatro por llamada, con preguntas de elección única sobre la categoría sonora.
- Interpretación de comandos hablados cortos en interfaces de voz: el clip se convierte en espectrograma y el modelo responde una pregunta de elección única entre un conjunto acotado de intenciones.
- Triaje con abstención en flujos automatizados: con `mode='decision'` y `threshold`, las peticiones dudosas devuelven `reason='below_threshold'` y se desvían a revisión humana, lo que permite automatizar solo la franja de alta confianza.
- Validación previa de formularios con documentación adjunta: preguntas de valoración sobre la legibilidad o completitud de una imagen antes de aceptarla, útiles como filtro de calidad en una cola de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en precisión de entrenamiento (bf16/fp16): 852.985.920 parámetros × 2 bytes ≈ 1,71 GB, coherente con el tamaño de repositorio de 1,7 GB. En fp32 serían ≈ 3,4 GB.
- VRAM estimada para inferencia: del orden de 2-4 GB con los pesos en bf16 más el estado de activaciones y la caché de tokens multimodales; la cifra exacta no está publicada.
- Tokens de medios máximos por petición (cálculo a partir de las tasas indicadas en la model card): una imagen de 1,6 MP ocupa ≈ 1.500 tokens; 8 imágenes ≈ 12.500 tokens; 4 clips de 10 s a 124 tokens cada uno ≈ 496 tokens. En total, hasta ≈ 13.000 tokens de entrada procedentes de medios.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060) es suficiente para los pesos; las GPU de gama alta (A100, H100) solo tendrían sentido para agregar muchas peticiones en lote. La inferencia en CPU es viable por el tamaño del modelo, aunque el coste de la torre de visión y de los espectrogramas conviene medirlo.
- Opciones de despliegue: paquete `saina[local,media]>=0.4.0` para uso local, `saina[local,server,media]` para levantar un servidor HTTP autenticado, y la API alojada en saina.run como `saina-helm-2-omni-0.8b`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; la aplicación de la cabeza entrenada y la colocación exacta de los medios dependen del paquete `saina`, por lo que los runners genéricos no son una vía soportada.
- Latencia y throughput: no disponibles. Como referencia de coste, cada llamada procesa como máximo 8 imágenes y 4 clips de audio en una única pasada compartida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| saina-helm-2-omni-0.8b | 852.985.920 | no disponible | Texto, imagen, audio | Probabilidades por opción (sin texto) | Apache 2.0 | HuggingFace, paquete `saina`, servidor HTTP propio, API en saina.run |
| run-saina/saina-helm-2-0.8b | no disponible | no disponible | Solo texto | Probabilidades por opción (sin texto) | no disponible | HuggingFace; hermano textual del modelo descrito |
| Qwen/Qwen3.5-0.8B | no disponible en la información proporcionada | no disponible | no disponible | Generación de texto | no disponible | HuggingFace; modelo base sobre el que se hace fine-tuning |
| Otros modelos de decisión o clasificación multimodal de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas; la model card no publica métricas frente a otros modelos.

## Limitaciones y advertencias

- No genera texto de ningún tipo: solo puntúa las opciones que se le proporcionan. Cualquier expectativa de generación, resumen o respuesta libre queda fuera de su alcance.
- Uso excluido por el autor para decisiones finales y no revisadas con consecuencias materiales sobre una persona (crédito, empleo, medicina, legal), incluso con alta confianza.
- Prohibido su uso para identificar o clasificar personas: rostros, voces de individuos concretos, atributos personales, demografía o cualquier perfilado individual.
- No está entrenado ni evaluado para filtrado de seguridad, detección de daño o moderación de contenido.
- Lectura de documentos largos a partir de imágenes no fiable: el límite de 1,6 megapíxeles por imagen hace que la letra pequeña no sea legible de forma consistente.
- No hace transcripción de habla: reconoce palabras cortas a partir de espectrogramas, pero no sigue discurso largo.
- No admite vídeo ni audio de más de 10 segundos; estos casos se rechazan, no se recortan.
- Texto y habla en idiomas distintos del inglés están en gran medida sin probar.
- Riesgo de inyección de instrucciones: el texto, las imágenes y el audio pueden contener indicaciones que redirijan las respuestas, por lo que debe acotarse la autoridad que se concede a la salida, especialmente si el contenido es no confiable.
- Una puntuación de voz sintética es una señal para verificación adicional, no una prueba de fraude.
- Riesgo de alucinación no evaluado explícitamente en la información disponible; al tratarse de un modelo de puntuación, el modo de fallo esperable es una probabilidad mal calibrada, no texto inventado. Se recomienda validar sobre datos etiquetados propios y para el espacio de etiquetas propio antes de usar el modelo.
- Dependencia del paquete `saina` (>=0.4.0): las puntuaciones dependen del prompt y de la colocación de los medios que construye el paquete. Versiones anteriores rechazan este checkpoint y los runners genéricos no están soportados.
- Licencia Apache 2.0 para el checkpoint, pero se recomienda revisar la licencia del modelo base Qwen/Qwen3.5-0.8B, no disponible en la información proporcionada, antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta y publicado y actualizado el 2026-10-15; no hay historial de uso en producción que respalde su fiabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/run-saina/saina-helm-2-omni-0.8b
- Modelo hermano solo texto: https://huggingface.co/run-saina/saina-helm-2-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paquete `saina` en PyPI: https://pypi.org/project/saina/
- Repositorio del paquete y del servidor: https://github.com/run-saina/saina
- API alojada: https://saina.run

Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo: todas las entradas devueltas corresponden a juegos en línea y a tiendas de material deportivo, sin relación con el modelo ni con su autor.
