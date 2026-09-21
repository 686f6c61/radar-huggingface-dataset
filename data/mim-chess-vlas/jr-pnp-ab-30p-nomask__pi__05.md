# mim-chess-vlas/jr-pnp-ab-30p-nomask__pi__05

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos: parte de π₀ y busca funcionar en situaciones y entornos no vistos durante el entrenamiento. Este repositorio concreto, `mim-chess-vlas/jr-pnp-ab-30p-nomask__pi__05`, es un ajuste fino del checkpoint base `lerobot/pi05_base` publicado con la librería LeRobot, cuya implementación está adaptada del repositorio OpenPI de Physical Intelligence.

El modelo tiene 4.143.404.816 parámetros (≈4,14 mil millones) en formato safetensors y se comporta como una política robótica: consume tres flujos de imagen (`side` a 300x355 y `wrist_left`/`wrist_right` a 480x848), más un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones. Se ha entrenado con un dataset de manipulación de 960 episodios y 542.165 fotogramas a 50 FPS, compuesto por 39 tareas de tipo "coger un objeto y depositarlo en la caja" sobre objetos muy variados (ropa, cajas, envases, cables, alimentos).

Su relevancia actual radica en que acerca a la comunidad un VLA de manipulación con licencia apache-2.0 e integración directa en el ecosistema LeRobot, lo que permite reproducir, ajustar y desplegar políticas robóticas sin depender de infraestructura propietaria. Como contrapartida, el repositorio no incluye métricas de evaluación, no tiene descargas ni "likes" y ocupa 65,5 GB, por lo que es un artefacto experimental más que un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); detalles internos del backbone no disponibles |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo de política robótica, no de contexto textual) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors (precisión declarada no disponible) |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset están en inglés; no se documenta soporte multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`); tamaño del repositorio 65,5 GB |
| Tipo de modelo | Política robótica (pipeline `robotics`), ajuste fino de `lerobot/pi05_base` |
| Entradas | `observation.images.side` (3, 300, 355), `observation.images.wrist_left` (3, 480, 848), `observation.images.wrist_right` (3, 480, 848), `observation.state` (7,) |
| Salidas | `action` (7,) |
| Frecuencia de datos de entrenamiento | 50 FPS |
| Tamano del dataset de entrenamiento | 960 episodios, 542.165 fotogramas |
| Fecha de publicacion | 21 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA de la familia π₀.₅ (Pi05) de Physical Intelligence, diseñado explícitamente para generalizar a entornos y situaciones nunca vistos durante el entrenamiento, evolucionando el planteamiento de π₀. La implementación publicada en este repositorio procede de LeRobot, que a su vez adapta el repositorio OpenPI de los autores originales. No se detallan en la model card el tipo exacto de backbone visual-lingüístico, el mecanismo de generación de acciones (por ejemplo, flow matching o decodificación discreta) ni el número de tokens de entrenamiento, por lo que esos datos se consideran no disponibles.

El ajuste fino se ha realizado sobre el dataset `lets-merged/lets-human-mim-chess-vlas-ind-pnp-012--k24m50_lets-human-mim-chess-vlas-jr-pnp-12345-30p--k24m50--21194`, con 960 episodios y 542.165 fotogramas capturados a 50 FPS. Las 39 tareas listadas son variantes de "Pick up ... and place it in the box", es decir, recogida y depósito en caja de objetos heterogéneos. No se documentan en la información proporcionada fases de RLHF, DPO, decodificación especulativa ni otras innovaciones técnicas del ajuste.

El nombre del repositorio (`jr-pnp-ab-30p-nomask`) sugiere una variante de ablación dentro de una familia de experimentos (posiblemente "30p" y "nomask"), pero el autor no documenta el significado de estos sufijos, por lo que no puede confirmarse.

## Capacidades

- Generación de acciones de manipulación robótica: mapea observaciones visuales y de estado a un vector de acción de 7 dimensiones, típico de un brazo robótico de 7 grados de libertad con pinza.
- Percepción multimodal con tres cámaras: una vista lateral (`side`) y dos vistas de muñeca (`wrist_left`, `wrist_right`), lo que permite razonamiento viso-espacial sobre la escena y sobre la propia pinza.
- Ejecución de tareas de pick-and-place guiadas por instrucción de lenguaje: el dataset contiene 39 descripciones textuales distintas de objetos y objetivos.
- Generalización a entornos nuevos: según la documentación del modelo base, Pi05 está diseñado para generalizar a situaciones no vistas durante el entrenamiento.
- Control a 50 FPS: la frecuencia del dataset de entrenamiento indica que la política está pensada para control reactivo a esa cadencia.
- Ajuste fino y reentrenamiento con LeRobot: el modelo puede reentrenarse o ajustarse con el flujo de trabajo documentado en la guía de LeRobot para pi05.
- Tool calling / function calling: no disponible; no es una capacidad propia de una política VLA de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión general, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de pick-and-place en logística: el modelo puede recoger objetos heterogéneos (ropa embolsada, cajas, envases, cables) y depositarlos en una caja contenedora, tal como se entrena en las 39 tareas del dataset. Es adecuado porque la política ya está ajustada específicamente a ese patrón de tarea con tres vistas de cámara.
- Clasificación y ordenación de artículos en líneas de empaquetado: usando la instrucción de texto para indicar qué objeto coger, la política puede integrarse en una célula de manipulación que separe productos por tipo antes de empaquetarlos.
- Investigación en modelos VLA: el repositorio sirve como punto de partida reproducible para estudiar generalización, ya que está construido sobre LeRobot y el checkpoint base `lerobot/pi05_base`.
- Ajuste fino con datos propios de un laboratorio: al heredar el flujo de LeRobot, un equipo puede recapturar episodios con su propio robot y sus propias cámaras y reentrenar la política sobre esta base.
- Evaluación comparativa de políticas robóticas: al existir múltiples variantes publicadas por el mismo autor (sufijos `30p`, `nomask`, etc.), el modelo puede usarse como una de las condiciones de un estudio de ablación, siempre que se documenten las diferencias.
- Pruebas de manipulación con brazos de 7 DoF: la interfaz de entrada/salida (estado de 7 dimensiones y acción de 7 dimensiones) encaja con brazos manipuladores estándar con pinza de un grado de libertad, lo que facilita el despliegue en laboratorios con ese hardware.
- Demostraciones de teleoperación asistida y aprendizaje por imitación: el dataset de origen es de tipo "human mim" (mímica humana), por lo que el modelo es adecuado para experimentos de imitación a partir de demostraciones humanas.
- Prototipado rápido de células robóticas en investigación académica: la licencia apache-2.0 y el soporte de LeRobot permiten montar un banco de pruebas sin coste de licencia, asumiendo la necesidad de hardware GPU y de un robot compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito por tarea, tasas de agarre correcto, comparaciones con π₀ ni evaluaciones en entornos reales o simulados. La búsqueda web realizada tampoco devolvió información técnica relevante sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 4.143.404.816 parámetros (estimaciones aritméticas, no datos oficiales): en fp32 ≈16,6 GB; en bf16/fp16 ≈8,3 GB; en int8 ≈4,1 GB (requiere cuantización propia, no publicada).
- A esa cifra hay que sumar activaciones y los búferes de imagen de tres cámaras (300x355 y dos de 480x848), lo que hace recomendable disponer de margen adicional.
- GPU recomendadas para un despliegue cómodo: A100 40/80 GB, H100, L40S o RTX 6000 Ada. En bf16 el modelo debería caber en GPUs de 24 GB de gama alta (RTX 4090, RTX 3090) con margen ajustado.
- Cabe en GPU de consumo: probablemente sí en bf16 en una RTX 4090 o RTX 3090 (24 GB); en tarjetas de 12-16 GB requeriría cuantización, que no está documentada por el autor.
- Opciones de despliegue: LeRobot (librería declarada, con guía específica para pi05), PyTorch con pesos safetensors y el ecosistema OpenPI. vLLM, llama.cpp, Ollama o TGI no son aplicables de forma estándar a una política VLA de este tipo.
- Almacenamiento: el repositorio ocupa 65,5 GB, por lo que hay que prever ese espacio en disco además de la memoria de GPU.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturó a 50 FPS, lo que da una referencia de la cadencia de control esperada, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mim-chess-vlas/jr-pnp-ab-30p-nomask__pi__05` | 4,14 mil M | No disponible | No disponible | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| `lerobot/pi05_base` (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| π₀.₅ (Pi05) original, Physical Intelligence | No disponible | No disponible | No disponible | No disponible | Blog y repositorio OpenPI |
| Otras VLA open source (OpenVLA, RDT-1B y similares) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La busqueda web no proporciono datos tecnicos ni resultados de benchmarks de alternativas comparables, por lo que la comparacion cuantitativa no puede completarse con la informacion disponible.

## Limitaciones y advertencias

- Alcance de tarea muy restringido: el ajuste fino se ha hecho exclusivamente sobre 39 tareas de "coger y depositar en caja"; fuera de ese patrón el comportamiento no está caracterizado.
- Sesgo hacia los objetos y el entorno del dataset: los objetos concretos (ropa, cajas, envases, cables, alimentos) y las condiciones de iluminación, fondo y ergonomía del dataset condicionan las predicciones.
- Dependencia estricta de la configuración de cámaras: las resoluciones esperadas (300x355 en `side`, 480x848 en cada muñeca) y el orden de las vistas forman parte de la interfaz; una cámara distinta o mal calibrada degradará la política.
- Riesgo de acciones erróneas: en un VLA el equivalente funcional a la alucinación es una acción plausible pero incorrecta (agarre fallido, colisión, objeto equivocado). No hay métricas publicadas de tasa de éxito que permitan cuantificar este riesgo.
- Ausencia total de validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluación independiente conocida.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset están en inglés.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base `lerobot/pi05_base` y de los modelos de los que este dependa antes de un despliegue comercial.
- Trazabilidad limitada: el significado de los sufijos del repositorio (`jr-pnp-ab-30p-nomask`) no está documentado, lo que dificulta saber exactamente qué variante se está usando.
- Coste de almacenamiento y despliegue: 65,5 GB de repositorio y necesidad de GPU con memoria suficiente, además de un robot compatible con la interfaz de 7 dimensiones.
- Fechas de publicación futuras (2026) en los metadatos: conviene verificar la coherencia temporal del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/jr-pnp-ab-30p-nomask__pi__05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/lets-human-mim-chess-vlas-ind-pnp-012--k24m50_lets-human-mim-chess-vlas-jr-pnp-12345-30p--k24m50--21194
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo.
