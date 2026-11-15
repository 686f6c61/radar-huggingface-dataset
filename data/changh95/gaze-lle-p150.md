# changh95/gaze-lle-p150

## Resumen

Gaze-LLE es un modelo de estimación de la dirección de la mirada (gaze target estimation) que, dada una imagen RGB y una caja de cabeza por cada persona detectada, predice hacia dónde mira cada una. El paquete `gaze-lle-p150`, publicado por el usuario `changh95`, es un port del checkpoint original `gazelle_dinov2_vitb14_inout` de Gaze-LLE (obra de Fiona Ryan, Ajay Bati, Sangmin Lee, Daniel Bolya, Judy Hoffman y James M. Rehg) empaquetado para ejecutarse sobre hardware Tenstorrent p150 mediante `tt-model-manager`.

El modelo combina un codificador DINOv2 ViT-B/14 congelado de 86 millones de parámetros con un decodificador de mirada de aproximadamente 2,8 millones de parámetros. La imagen se reescala a 448x448 y se procesa una sola vez por imagen, compartiendo las características del escenario entre todas las cabezas de la escena. Para cada persona se obtiene un mapa de calor de 64x64 sobre la imagen original, el punto de mira (máximo del mapa de calor en píxeles de la imagen de entrada) y una probabilidad de que el objetivo esté dentro del encuadre.

Su relevancia es doble: por un lado, ofrece una arquitectura de referencia ligera para una tarea de visión poco cubierta por los modelos generativos; por otro, demuestra el despliegue de un transformer de visión sobre aceleradores Tenstorrent con una API HTTP propia, sin dependencia de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 congelado (86M) + decodificador de mirada de 3 capas transformer (2,8M) con prompt de posición de cabeza |
| Parametros totales | Aproximadamente 88,8 millones (86M del codificador + 2,8M del decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una imagen a 448x448 y entre 1 y 10 cajas de cabeza) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT y Apache-2.0 (licencia compuesta, ver `code/gaze_lle/THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | no disponible (repo de 9,0 GB; pesos servidos desde `changh95/gaze-lle-weights` en la revisión `f83e53f0f17dd2175f31ceaf9fa650044147ada1`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Gaze-LLE: un codificador DINOv2 ViT-B/14 congelado procesa la imagen reescalada a 448x448 una única vez por imagen. Sobre las características del escenario se inyecta un prompt derivado de la posición de la cabeza de cada persona y se aplican tres capas transformer en el decodificador de mirada. La salida es un mapa de calor de 64x64 que cubre la imagen original completa, más una cabeza de clasificación in/out que estima la probabilidad de que el objetivo de la mirada esté dentro del encuadre. El codificador se comparte entre todas las cabezas de la escena, de modo que el coste de codificación es independiente del número de personas.

El modelo se entrenó en GazeFollow y se ajustó finamente en VideoAttentionTarget, según la model card del autor. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a esta tarea). La innovación destacable es el uso de un backbone de visión congelado y un decodificador minúsculo, lo que reduce el coste de entrenamiento y permite reutilizar características densas de DINOv2 para una tarea de regresión espacial. El paquete en sí no modifica los pesos: los espeja sin cambios desde `changh95/gaze-lle-weights` y añade el empaquetado para Tenstorrent p150 con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1).

## Capacidades

- Estimación del objetivo de mirada: devuelve un mapa de calor de 64x64 por persona sobre la imagen original.
- Punto de mira en píxeles: calcula el máximo del mapa de calor y lo expresa en coordenadas de la imagen de entrada, con versión normalizada.
- Clasificación in/out: probabilidad de que el objetivo de la mirada esté dentro del encuadre.
- Procesamiento multi-persona: admite entre 1 y 10 cajas de cabeza por petición, compartiendo una única pasada del codificador.
- Formatos de salida flexibles: mapas de calor como PNG en base64, NPZ con tensores float32, JSON con listas anidadas o sin mapa de calor.
- Formatos de caja: píxeles de la imagen original o coordenadas normalizadas.
- Preprocesado tolerante: acepta PNG o JPEG de cualquier tamaño, con prefijo `data:image/...;base64,` opcional.
- Servidor HTTP propio con `POST /predict`, `GET /health`, `GET /info` y un `GET /v1/models` de relleno que no es una API de chat compatible con OpenAI.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis de audiencias en publicidad: procesar fotogramas de vídeo con cajas de cabeza de un detector facial para agregar mapas de calor de mirada y medir qué elementos de un cartel o escaparate atraen la atención, gracias a la salida de mapa de calor por persona y a la compartición del codificador entre cabezas.
- Investigación en psicología cognitiva y estudios de atención conjunta: obtener puntos de mira normalizados por sujeto y la probabilidad in/out para filtrar sujetos que miran fuera de cámara en experimentos con estímulos visuales controlados.
- Indexación semántica de vídeo: generar metadatos de dirección de mirada por fotograma para búsquedas del tipo "personas que miran al producto X", combinando las predicciones con el detector de cabezas existente en el pipeline.
- Robótica social y HRI: estimar hacia dónde mira un interlocutor en un frame capturado por una cámara RGB para decidir el foco de atención de un agente conversacional, con una inferencia de pocos milisegundos sobre Tenstorrent p150.
- Evaluación de accesibilidad y diseño de interfaces: analizar capturas de pantalla con cajas de cabeza sintéticas o reales para estudiar patrones de atención en tareas de usabilidad, usando la salida JSON de mapas de calor para el análisis estadístico posterior.
- Análisis forense y revisión de material audiovisual: procesar lotes de imágenes con la API HTTP local en una p150 para localizar objetivos de mirada y priorizar fotogramas, con la probabilidad in/out como criterio de descarte.
- Prototipado de investigación en visión: servir como línea base reproducible de Gaze-LLE sobre hardware no CUDA para comparar con implementaciones en GPU, usando el mismo checkpoint y preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de latencia del servidor sobre la imagen de ejemplo (`media/source_1.png`, 500x334) con tres cabezas: preprocesado 9,75 ms, inferencia 3,8 ms, codificación 1,04 ms y total 14,59 ms. No se proporcionan métricas de precisión (AUC, distancias de mirada, etc.) para GazeFollow ni VideoAttentionTarget en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p150 (malla `P150`). El paquete no está pensado para GPU convencionales ni CPU en su forma actual.
- VRAM estimada: no aplica; el despliegue utiliza memoria del acelerador Tenstorrent. El tamaño del repo de pesos es de 9,0 GB.
- GPU recomendadas: no disponible para este paquete. El modelo original de Gaze-LLE puede ejecutarse en GPU, pero el port aquí descrito requiere p150.
- Cabe en GPU de consumo: no disponible para este paquete; el despliegue documentado exige hardware Tenstorrent.
- Opciones de despliegue: `tt serve changh95/gaze-lle-p150` mediante Tenstorrent CLI (`uv tool install tenstorrent`), o `tt-model serve changh95/gaze-lle-p150` sin tt-cli. Requiere Docker. El servidor HTTP propio escucha en el puerto 20000 (o el siguiente libre).
- Latencia: 14,59 ms en total para una imagen de 500x334 con tres cabezas en p150, según la medición de la model card. El primer arranque compila kernels para el dispositivo y tarda varios minutos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Hardware |
|---|---|---|---|---|---|
| gaze-lle-p150 (este paquete) | ~88,8M (86M + 2,8M) | Imagen 448x448 + 1-10 cajas de cabeza | Mapa de calor 64x64, punto de mira, in/out | MIT y Apache-2.0 | Tenstorrent p150 |
| Gaze-LLE original (`fkryan/gazelle`, checkpoint `gazelle_dinov2_vitb14_inout`) | ~88,8M | Igual | Igual | no disponible en la informacion proporcionada | GPU (implementación de referencia) |
| GazeFollow (método previo, citado en el paper arXiv:2412.09586) | no disponible | Imagen + cabeza | Mapa de calor | no disponible | no disponible |

La comparativa se limita al propio modelo original y a su predecesor metodológico, ya que la información proporcionada no incluye datos de otros estimadores de mirada contemporáneos ni métricas de precisión comparables.

## Limitaciones y advertencias

- Depende de un detector de cabeza o cara externo: el modelo no localiza personas por sí mismo y requiere entre 1 y 10 cajas válidas, cada una con más de 1/32 del tamaño de la imagen en ambos ejes.
- Sin benchmarks publicados en la información disponible: no hay métricas de precisión que permitan evaluar su calidad frente al modelo original o a alternativas.
- La resolución de salida es un mapa de calor de 64x64, lo que limita la precisión espacial fina del punto de mira.
- El modelo está entrenado en GazeFollow y ajustado en VideoAttentionTarget; su generalización a dominios muy distintos (ilustraciones, imágenes médicas, escenas nocturnas) no está documentada.
- La API no es compatible con OpenAI: `GET /v1/models` es un stub y no existe endpoint de chat, por lo que no puede integrarse directamente en clientes que esperan ese formato.
- Requiere hardware Tenstorrent p150 y Docker; el primer arranque compila kernels y tarda varios minutos, lo que complica despliegues efímeros.
- Licencia compuesta MIT y Apache-2.0: es necesario revisar `THIRD_PARTY_NOTICES.md` antes de un uso comercial, especialmente por las condiciones heredadas del checkpoint y del backbone DINOv2.
- Riesgo de sesgo: al derivar de GazeFollow, hereda los sesgos de composición de ese dataset (escenas cotidianas, distribución demográfica concreta), no cuantificados en la información disponible.
- Riesgo de alucinación en el sentido de predicciones espaciales plausibles pero incorrectas cuando el objetivo real está fuera de encuadre; la probabilidad in/out debe usarse como filtro, no como verdad absoluta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-09-11: se trata de un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/gaze-lle-p150
- Pesos originales espejados: https://huggingface.co/changh95/gaze-lle-weights
- Repositorio del port a Tenstorrent: https://github.com/changh95/tt-Gaze-LLE
- Repositorio original de Gaze-LLE: https://github.com/fkryan/gazelle
- Paper de Gaze-LLE: https://arxiv.org/abs/2412.09586
- Backbone DINOv2: https://github.com/facebookresearch/dinov2
- Tenstorrent tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Aviso de licencias de terceros: https://huggingface.co/changh95/gaze-lle-p150/blob/main/code/gaze_lle/THIRD_PARTY_NOTICES.md
- Imagen de ejemplo: https://huggingface.co/changh95/gaze-lle-p150/resolve/main/media/source_1.png
