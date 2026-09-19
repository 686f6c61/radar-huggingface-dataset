# mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live__pi05__seed_0

## Resumen

`mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live__pi05__seed_0` es un ajuste fino del modelo vision-language-action (VLA) π0.5 de Physical Intelligence, publicado por el usuario `mim-chess-vlas` mediante la librería LeRobot de Hugging Face. El modelo base es `lerobot/pi05_base`, la implementación de π0.5 en LeRobot adaptada del repositorio OpenPI de Physical Intelligence. No es un modelo de lenguaje general: es una política robótica que consume observaciones visuales y de estado de un robot Franka Panda y produce acciones de control continuas.

El modelo resuelve una tarea de manipulación concreta: recoger piezas de geometría compleja (formas con lóbulos, ranuras, asas, muescas y perforaciones) y depositarlas en una caja. Está entrenado sobre el dataset `mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live`, con 790 episodios y 157.904 fotogramas a 20 FPS. La política recibe tres vistas de cámara (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), un vector de estado de 9 dimensiones y devuelve un vector de acción de 7 dimensiones.

Cuenta con 4.143.404.816 parámetros reales según los pesos en safetensors, con un repositorio de 74,8 GB, licencia Apache 2.0 y fecha de creación en el Hub del 19 de septiembre de 2026. Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de ajuste fino de π0.5 sobre datos de simulación con aumento de *bounding boxes* y *overlay*, y como punto de partida para experimentos de sim-to-real en manipulación fina. No hay resultados de benchmarks ni métricas de éxito publicados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π0.5; implementación LeRobot adaptada del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica: el modelo no es MoE (no se documenta mezcla de expertos) |
| Longitud de contexto | No disponible en la model card. Entrada declarada: 3 imágenes de (3, 224, 224) + `observation.state` de (9,) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors; no hay GGUF, INT8 ni INT4 publicados |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Robot | Franka Panda |
| Cámaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Salida | `action`, shape (7,) |
| Tarea | pick-and-place de piezas de geometría compleja en una caja |
| Dataset de entrenamiento | `mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live` (790 episodios, 157.904 fotogramas, 20 FPS) |
| Tamaño del repositorio | 74,8 GB |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe π0.5 (Pi05) como un modelo vision-language-action de Physical Intelligence diseñado para generalización en mundo abierto: evoluciona π0 para generalizar a entornos y situaciones completamente nuevos que no se vieron durante el entrenamiento. La implementación utilizada aquí procede de LeRobot y está adaptada del repositorio Open Source OpenPI. El modelo se ha entrenado y subido al Hub con LeRobot, y la model card remite a la guía de π0.5 de LeRobot para entrenamiento y ejecución. No se detalla en la información proporcionada la composición interna del backbone, el mecanismo de generación de acciones ni el número de tokens de contexto.

El ajuste fino se ha realizado sobre un dataset propio del autor con 790 episodios, 157.904 fotogramas a 20 FPS y 20 tareas de pick-and-place descritas en lenguaje natural (por ejemplo, "Pick the smooth ball clasped by two flat curved arms... and place it into the box"). El nombre del repositorio indica convenciones de experimento (`train_800`, `complex`, `bbox`, `overlay_a25`, `sim`, `all_cameras`, `live`, `pi05`, `seed_0`), pero la model card no documenta su significado exacto ni los hiperparámetros de entrenamiento. Tampoco se especifica si hubo RLHF, DPO u otra fase de alineamiento, ni la composición exacta del dataset más allá del número de episodios, fotogramas y FPS.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un Franka Panda a partir de estado y visión.
- Percepción multi-cámara: consume simultáneamente una vista de agente y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), todas a 224x224.
- Ejecución de tareas de pick-and-place sobre objetos de geometría compleja: formas con lóbulos, nervaduras, ranuras profundas, aberturas, asas y muescas.
- Condicionamiento por tarea descrita en texto: el dataset contiene descripciones textuales largas por tarea, aunque la model card no declara explícitamente una entrada de lenguaje en la tabla de inputs.
- Generalización heredada de π0.5: el modelo base está diseñado para generalizar a entornos no vistos, si bien no hay métricas publicadas para este ajuste fino concreto.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, generación de texto general, razonamiento matemático, visión descriptiva, audio ni modo "thinking". Es una política de robótica, no un asistente conversacional.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación pick-and-place en simulación: el modelo ejecuta la secuencia completa de recogida y depósito de piezas sobre una mesa, con política entrenada específicamente para ello y 20 FPS de datos de referencia.
- Punto de partida para sim-to-real: al estar entrenado sobre datos etiquetados como `sim` en el nombre del repositorio, sirve como inicialización para ajustes finos con datos reales del mismo montaje (Panda + tres cámaras) antes de desplegar en hardware.
- Investigación en aumento de datos para VLA: el nombre incluye `bbox` y `overlay_a25`, lo que lo convierte en un candidato para estudiar el efecto de superponer *bounding boxes* con opacidad reducida en la robustez de la política, comparando contra el modelo base `lerobot/pi05_base`.
- Estudios de reproducibilidad y semilla: la etiqueta `seed_0` permite replicar exactamente la configuración y comparar contra otras semillas del mismo experimento.
- Evaluación de generalización a formas nuevas: las 20 tareas del dataset cubren geometrías muy variadas (estrella de cuatro puntas, huevo con nervaduras, anillo dentado, cubo con ranura), lo que permite medir la degradación ante objetos fuera de distribución.
- Reutilización como inicialización para otras tareas de agarre: al ser un ajuste fino de π0.5, puede servir de base para políticas de pick-and-place en dominios distintos con menos datos que un entrenamiento desde cero.
- Docencia y formación en robótica con LeRobot: el repositorio incluye todo lo necesario (pesos, dataset, robot y cámaras declarados) para reproducir el flujo completo de entrenamiento y despliegue en un curso o taller.
- Integración en pipelines de evaluación automatizada: la interfaz declarada (estado de 9 dimensiones, tres imágenes, acción de 7 dimensiones) es fácil de conectar a un bucle de simulación para medir tasas de éxito por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, métricas de agarre, comparaciones con π0.5 base ni evaluaciones en robot real. El repositorio registra 0 descargas y 0 likes, por lo que tampoco hay retroalimentación de terceros documentada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros publicado (4.143.404.816) y no están verificadas por el autor del modelo.

- Pesos en bf16/fp16: aproximadamente 8,3 GB solo de parámetros; con activaciones, buffers de imágenes (tres tensores de 3x224x224) y overhead del runtime, se puede esperar un consumo en torno a 10-14 GB de VRAM.
- Cuantización INT8: alrededor de 4,1 GB de pesos. Cuantización INT4: alrededor de 2,1 GB. No hay versiones cuantizadas publicadas ni soporte documentado.
- GPU consumer: cabe en una RTX 4090 (24 GB) y, con margen, en una RTX 3090 (24 GB) o RTX 4080 (16 GB) en bf16. En tarjetas de 8-12 GB sería necesario cuantizar, algo no documentado por el autor.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares sobran para inferencia en bf16 y permiten varios procesos en paralelo.
- Despliegue: la vía soportada es LeRobot (`lerobot`), con la guía específica de π0.5. También es aplicable el stack OpenPI del que deriva la implementación. No hay soporte documentado en llama.cpp, Ollama, vLLM o TGI, formatos habituales para modelos de lenguaje pero no para políticas VLA de este tipo.
- Latencia y throughput: no disponibles. El único dato temporal es la tasa del dataset de entrenamiento (20 FPS), que no equivale a la frecuencia de control en inferencia.
- Almacenamiento: el repositorio ocupa 74,8 GB, presumiblemente por incluir varios checkpoints; conviene prever ese espacio en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`mim-chess-vlas/...pi05...seed_0`) | 4.143.404.816 (dato real) | No disponible | apache-2.0 | Publicado en Hugging Face; 0 descargas | Ajuste fino de π0.5 para pick-and-place con Panda y tres cámaras |
| `lerobot/pi05_base` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Publicado en Hugging Face (referenciado como modelo base) | Modelo base π0.5 de LeRobot; sin datos cuantitativos verificados aquí |
| π0.5 original (Physical Intelligence) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Repositorio OpenPI y blog del autor | Origen de la arquitectura; la model card enlaza al blog y a OpenPI |
| Otros VLA comparables (π0, OpenVLA, GR00T) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Diversos repositorios | No se dispone de datos de rendimiento comparables en la información proporcionada |

No se dispone de datos verificados de parámetros, contexto, licencia ni rendimiento de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Sin métricas publicadas: no hay tasas de éxito, ablaciones ni evaluaciones en robot real, lo que impide saber si la política funciona fuera del conjunto de entrenamiento.
- Sin adopción verificable: 0 descargas y 0 likes; no hay evidencia de uso por terceros ni de reproducibilidad independiente.
- Datos de simulación: el nombre del repositorio incluye `sim`, de modo que la brecha sim-to-real puede ser significativa al trasladar la política a hardware físico.
- Especialización extrema: entrenado para 20 tareas de pick-and-place con un robot concreto (Panda), tres cámaras con nombres fijos y un vector de estado de 9 dimensiones; cambiar cualquiera de estas interfaces invalida el modelo.
- Idiomas y capacidades de lenguaje: no disponibles; no debe usarse como modelo de lenguaje, razonador ni asistente.
- Riesgo de acciones fuera de distribución: como toda política aprendida por imitación, puede generar trayectorias no físicas o inseguras ante objetos, iluminación o posiciones de cámara distintas a las del dataset. Requiere barreras de seguridad físicas en cualquier despliegue real.
- Contexto y cuantización: no se documenta la longitud de contexto ni existen versiones cuantizadas, lo que limita el despliegue en hardware modesto.
- Licencia: los pesos se publican bajo apache-2.0, que permite uso comercial, pero conviene verificar por separado la licencia de `lerobot/pi05_base` y las condiciones del repositorio OpenPI, ya que la model card no las detalla.
- Datos incompletos: no se documentan hiperparámetros de entrenamiento, número de épocas, composición del dataset, ni el significado exacto de los sufijos del nombre (`train_800`, `bbox`, `overlay_a25`, `live`).
- Fechas del Hub: la creación y la última actualización figuran como 2026-09-19, una fecha anómala que sugiere un artefacto de registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live__pi05__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__bbox__overlay_a25__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π0.5 en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π0.5 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Nota: las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo; los enlaces encontrados correspondían a entidades homónimas sin relación (grupos de radiología y una facultad universitaria).
