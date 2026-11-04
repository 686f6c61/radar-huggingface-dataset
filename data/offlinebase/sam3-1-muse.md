# OfflineBase/sam3.1-muse

## Resumen

SAM 3.1 Muse es un ajuste fino (fine-tune) del modelo de segmentación y detección open-vocabulary SAM 3.1 de Meta, publicado por el usuario OfflineBase. El ajuste no busca mejorar la precisión general del modelo, sino enseñarle un nuevo término de prompt: la palabra "muse", que designa la mascota de Muse (una pequeña figura de peluche color crema). El modelo resultante permite que un rover con cámara localice la mascota en tiempo real dentro de la demo Muse Muse.

El repositorio no contiene el modelo completo, sino únicamente un delta de pesos en fp16 de 58 MB que afecta al detector de SAM 3.1 (encoder y decoder transformer, encoder de geometría y cabezas de scoring: 30,4 millones de los 838 millones de parámetros totales). Los encoders de visión y de lenguaje permanecen congelados y son los originales de Meta, por lo que el uso requiere cargar primero `facebook/sam3.1` y sustituir después esos tensores.

El ajuste se realizó con el entrenador oficial de Meta sobre 160 imágenes sintéticas de la mascota, en una NVIDIA Jetson Orin Nano de 8 GB, y se sirve en otra Jetson del mismo tipo compartiendo proceso con los pesos originales (unos 3,6 GB de memoria de GPU en total). Su relevancia es acotada: es un ejemplo práctico de personalización de un modelo de segmentación open-vocabulary en hardware de borde, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 (detector transformer con encoder y decoder, encoder de geometría y cabezas de scoring; encoders de visión y lenguaje congelados) |
| Parametros totales | 838 M (modelo base SAM 3.1); el delta ajustado cubre 30,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (delta publicado); el modelo base SAM 3.1 puede usar otras, no detalladas |
| Idiomas soportados | no disponible (el prompt de texto usado es en inglés: "muse") |
| Licencia | SAM License (license_name: sam-license, license: other) |
| Formato de pesos | `.pt` (PyTorch, fp16) para el delta; el base en formato de Meta |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de SAM 3.1 de Meta, un sistema de segmentación y detección open-vocabulary que combina un encoder de visión, un encoder de lenguaje y un detector transformer con encoder de geometría y cabezas de scoring. El ajuste solo modifica el detector: los encoders de visión y lenguaje se mantienen congelados en bf16 durante todo el entrenamiento. El delta publicado contiene 58 MB de pesos fp16 correspondientes a 30,4 M de parámetros de los 838 M totales.

El entrenamiento empleó el trainer oficial de Meta (`sam3/train/train.py`) con la receta Roboflow 100-shot: 5 épocas, batch de 1, escala de learning rate de 0,1 y resolución de 1008 px. El conjunto de datos fueron 160 imágenes fabricadas de la mascota. La evaluación se hizo sobre 50 imágenes retenidas de un vídeo no visto durante el entrenamiento (38 con la mascota, 12 sin ella), más un conjunto "small" que pega cada mascota al 30 % de tamaño sobre las 12 imágenes sin ella. Todo el proceso se ejecutó en una Jetson Orin Nano (jetson-03) y el modelo se sirve en otra (jetson-04).

## Capacidades

- Detección y segmentación open-vocabulary mediante prompt de texto: localiza el objeto descrito por la palabra indicada.
- Reconocimiento del término personalizado "muse" para la mascota de Muse, tras el ajuste.
- Segmentación de instancias con cajas delimitadoras (box AP) y máscaras, heredadas de SAM 3.1.
- Funcionamiento en hardware de borde (Jetson Orin Nano de 8 GB) con un consumo de unos 3,6 GB de GPU compartiendo proceso con los pesos de Meta.
- Servicio vía API HTTP: endpoint `POST /segment` con `{"image_b64", "prompt", "tuned"}`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni multilingüismo más allá del prompt de texto en inglés.

## Casos de uso

- Demo de rover con cámara en vivo: el rover usa la cámara para buscar la mascota "muse" en tiempo real; el ajuste permite invocar el objeto por su nombre en lugar de por una descripción genérica como "plush toy".
- Personalización de un detector open-vocabulary para un objeto concreto de marca o producto: sirve de plantilla para enseñar un término nuevo a SAM 3.1 con pocas imágenes y el trainer oficial.
- Despliegue en robótica de borde: al caber en una Jetson Orin Nano de 8 GB y compartir proceso con los pesos base, es adecuado para plataformas con memoria limitada.
- Prototipado rápido de segmentación por texto en entornos embebidos: el endpoint `/segment` permite integrar la detección en un pipeline de captura y actuación.
- Investigación sobre ajuste eficiente de modelos de segmentación: el delta de 30,4 M de parámetros sobre 838 M documenta un caso de fine-tuning con encoders congelados y 160 imágenes.
- Validación de recetas de entrenamiento (Roboflow 100-shot, 5 épocas, 1008 px) en hardware de consumo y borde para tareas de detección de instancias.
- No se recomienda como sustituto de un detector general: su alcance es el término "muse" y objetos visualmente similares.

## Benchmarks y rendimiento

Resultados sobre las 50 imágenes retenidas (38 con la mascota, 12 sin ella), según la model card:

| Modelo y prompt | Box AP | AP50 | Encontradas a 0.5 (de 38) | Cajas erróneas | Acierto presencia/ausencia (de 50) | AP conjunto "small" |
|---|---|---|---|---|---|---|
| SAM 3.1, pesos de Meta, "muse" | 0.000 | 0.000 | 0 | 0 | 12 | 0.000 |
| SAM 3.1, pesos de Meta, "plush toy" | 1.000 | 1.000 | 38 | 0 | 50 | 1.000 |
| SAM 3.1 ajustado, "muse" | 1.000 | 1.000 | 38 | 0 | 50 | 0.996 |

El conjunto "small" pega cada mascota retenida al 30 % de tamaño sobre las 12 imágenes sin ella. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 3,6 GB de GPU en total al servir el modelo ajustado junto con los pesos de Meta en un mismo proceso.
- Hardware de referencia: NVIDIA Jetson Orin Nano de 8 GB, tanto para el ajuste (jetson-03) como para el servicio (jetson-04).
- GPU de escritorio: no se documentan pruebas en A100, H100 ni RTX 4090; el modelo base de 838 M de parámetros es compatible en principio con GPU de consumo, pero no hay datos publicados.
- Despliegue: código de servicio en el repositorio Muse Muse, `scripts/edge/sam3/` (`server.py --tuned muse=muse31_delta_fp16.pt`), con endpoint `POST /segment`.
- No se documentan latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3.1 Muse (este) | 838 M (delta de 30,4 M) | no disponible | Box AP 1.000 y AP50 1.000 en el conjunto retenido para "muse" | SAM License | HuggingFace, delta de 58 MB |
| SAM 3.1 (Meta) | 838 M | no disponible | Box AP 1.000 y AP50 1.000 para "plush toy"; 0.000 para "muse" | SAM License | HuggingFace (`facebook/sam3.1`) |
| SAM 3 | no disponible | no disponible | no disponible | SAM License | HuggingFace |
| Otros modelos de segmentación open-vocabulary | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el modelo base, ya que la información proporcionada no incluye datos de otros modelos de segmentación.

## Limitaciones y advertencias

- El ajuste añade un nombre, no precisión: en las imágenes de prueba, SAM 3.1 de Meta ya encontraba la mascota pidiendo "plush toy", por lo que la mejora es léxica.
- El conjunto retenido no contenía otros juguetes; en uso real el modelo puntúa otros peluches y fotos de la mascota en pantallas como "muse" con más de 0,95, por lo que hay que verificar las coincidencias antes de confiar en ellas.
- Solo se midió una foto de sanidad adicional (un camión), que quedó prácticamente igual ("truck" de 0,87 a 0,99, 4 ruedas en ambos casos); no hay evaluación más amplia.
- El delta solo cubre el detector; los encoders de visión y lenguaje son los de Meta y no se han ajustado, lo que limita la adaptación a dominios visuales nuevos.
- Licencia SAM License: es necesario revisar sus términos para uso comercial; el repositorio la declara como `other` con nombre `sam-license`.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe del prompt de texto.
- El repositorio tiene 0 descargas y 0 likes y fue creado en noviembre de 2026; no hay validación externa de los resultados.
- No se documentan requisitos de VRAM en GPU de escritorio, latencia ni throughput para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OfflineBase/sam3.1-muse
- Modelo base: https://huggingface.co/facebook/sam3.1
- Repositorio Muse Muse (código de servicio en `scripts/edge/sam3/`): no disponible como enlace en la información proporcionada
- Paper o blog de SAM 3.1: no disponible en la información proporcionada
