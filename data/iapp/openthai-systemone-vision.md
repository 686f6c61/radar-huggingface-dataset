# iapp/OpenThai-SystemOne-Vision

## Resumen

OpenThai-SystemOne-Vision es un modelo de decisión multimodal desarrollado por iapp, orientado a la interacción con interfaces gráficas (GUI grounding) y al control de ordenador mediante voz en tailandés. Se construye como un ajuste fino del modelo base Qwen/Qwen3.5-0.8B-Base, al que se le añade un codificador visual ViT de aproximadamente 100M de parámetros y una cabeza de predicción de puntos de 9M, alcanzando un total de 862.326.339 parámetros. Su pipeline es image-text-to-text y admite entradas de texto o JSON combinadas con hasta cuatro imágenes.

El modelo no genera texto libre: responde a preguntas estructuradas de cuatro tipos (choice, score, noul y point) en una única pasada hacia delante, lo que lo convierte en un componente de decisión de baja latencia para agentes que operan sobre pantallas. La incorporación del tipo point permite devolver coordenadas normalizadas sobre una captura de pantalla, con probabilidad de abstención y candidatos agrupados, siguiendo un enfoque similar a GUI-Actor. Está publicado bajo licencia Apache 2.0 y soporta tailandés e inglés.

La relevancia actual del modelo reside en su enfoque de "System One": decisiones rápidas y deterministas en lugar de generación autoregresiva larga, lo que reduce la latencia por clic a unos 70 ms en una H100 según la evaluación del autor. La versión 1.4 mejora la precisión sobre aplicaciones reales de Windows y comandos de voz, aunque el propio autor señala un retroceso en la tarea de jugar a Doom desde píxeles respecto a la versión 1.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: base Qwen3.5-0.8B + ViT (~100M) + cabeza de puntos (~9M) |
| Parametros totales | 862.326.339 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens de texto; límite de 8k tokens visuales por petición y máximo de 4 imágenes |
| Tipos de cuantizacion | no disponible (existe build GGUF publicada aparte) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; build GGUF separada en iapp/OpenThai-SystemOne-Vision-GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base y añade un codificador visual ViT de unos 100M de parámetros junto con una cabeza de predicción de puntos de 9M. La interfaz de decisión es un superconjunto del contrato TypeSafe `/v1/systemone`, con cuatro tipos de pregunta: `choice` (selección entre opciones), `score` (puntuación), `noul` (booleano) y `point` (coordenadas sobre imagen). Las respuestas de tipo `point` incluyen coordenadas normalizadas, confianza, probabilidad de abstención y candidatos derivados de agrupaciones de tokens del mapa de atención, al estilo GUI-Actor.

Según la model card, el entrenamiento incluye capturas reales de Windows 11 y macOS, y las pantallas de evaluación "live" de Windows y Mac nunca se usan en entrenamiento (los datos de entrenamiento incluyen otras pantallas). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La versión 1.3 añadió `point_refine`, que refina la predicción sobre los tres mejores candidatos de la primera pasada usando capturas de hasta 2 MP con `"detail": "high"`.

## Capacidades

- Respuesta a preguntas estructuradas de tipo `choice`, `score`, `noul` y `point` en una sola pasada, sin generación de texto libre.
- GUI grounding desde píxeles: localización de controles y elementos en capturas de pantalla con coordenadas normalizadas, confianza y abstención.
- Refinamiento de clics mediante `point_refine` sobre los candidatos de mayor probabilidad.
- Comprensión de comandos de voz en tailandés para control de ordenador: 21 operaciones (SEARCH, CLICK_NTH, OPEN_WEBSITE, QUIT_APP, PLAY_PAUSE, LIKE, COMMENT, NONE, entre otras) con slots `search_site`, `app`, `site`, `key` y `nth`.
- Entrada multimodal con hasta 4 imágenes por petición y un máximo de 8k tokens visuales.
- Soporte de estado en texto plano o JSON, lo que permite integrarlo en agentes con tablas de elementos.
- Capacidades bilingües tailandés-inglés.
- Uso sobre fotogramas de juegos (evaluado con Doom) y lectura de pantallas en tailandés.
- Lectura de documentos y pantallas, según la tabla comparativa de la model card.

## Casos de uso

- Agentes de escritorio que operan sobre aplicaciones nativas: el modelo recibe una captura y devuelve la coordenada del control a pulsar, con una latencia de unos 70 ms por clic en H100, adecuada para bucles de interacción cerrados.
- Control por voz en tailandés: una única llamada de texto decide la operación a partir de la transcripción y del contexto de aplicación y ventana; si la operación requiere clic, se añade una llamada con captura de pantalla.
- Automatización de tareas en Windows y macOS: la evaluación sobre aplicaciones reales (Settings, File Explorer, Finder, Safari) muestra precisiones del 70,8 % y 64,5 % en modo por defecto, lo que permite construir asistentes de productividad con verificación humana.
- Enrutamiento y moderación con estado textual o JSON: al compartir la API del modelo de texto, puede usarse para elegir herramientas, evaluar relevancia en RAG o clasificar contenido sin coste de generación.
- Lectura y localización de elementos en documentos o pantallas en tailandés, aprovechando el soporte nativo del idioma y el modo `"detail": "high"` para capturas de hasta 1920×1200.
- Investigación en agentes GUI: su API estructurada y su cabeza de puntos lo hacen útil como componente reproducible en experimentos de grounding y computer-use, con abstención explícita para targets ausentes.
- Análisis de fotogramas de juegos: el autor lo evalúa con Doom desde píxeles, aunque la versión 1.4 rinde peor que la 1.3 en esa tarea concreta.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión en %, orden de opciones único salvo indicación):

| Benchmark | v1.3 default | v1.3 + refine | v1.4 default | v1.4 + refine | Qwen3-VL-2B | Qwen3-VL-4B |
|---|---|---|---|---|---|---|
| Windows live (319 targets, 28 pantallas) | 68,3 | 69,3 | 70,8 | 70,5 | 67,1 | 73,0 |
| Windows Settings pages (114) | 69,3 | – | 74,6 | – | 66,7 | 68,4 |
| Windows Calculator (20) | 60 | – | 80 | – | 80 | 95 |
| Mac live (358 targets, 29 pantallas) | 63,7 | 67,6 | 64,5 | 67,3 | 67,0 | 67,9 |
| Mac label-checked (340) | 66,8 | 71,2 | 67,6 | 70,9 | 70,6 | 71,5 |
| Latencia por clic (H100) | ~70 ms | 0,1–0,25 s | ~70 ms | 0,1–0,25 s | ~0,9 s | ~0,75 s |

El autor indica que las pantallas live de Windows y Mac no se usan en entrenamiento. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 862M parámetros, la inferencia en fp16 requiere aproximadamente 1,7 GB de pesos, más el coste de activaciones y tokens visuales.
- GPU recomendadas: H100 para el harness de evaluación del autor; cualquier GPU con suficiente VRAM para el modelo base de 0.8B.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más, aunque el dato no está confirmado en la información proporcionada.
- Despliegue: el cliente Python con imágenes y `point` aún no está en el repositorio público de GitHub según la model card (estado a 2026-11-15); la build GGUF iapp/OpenThai-SystemOne-Vision-GGUF funciona con llama.cpp estándar (`llama-server`, `/v1/systemone`) para preguntas choice/score/noul, con o sin captura, pero sin cabeza `point`.
- Latencia: ~70 ms por clic en H100 en modo por defecto; 0,1–0,25 s con `point_refine` y captura de 2 MP.
- Límites de entrada: máximo 4 imágenes y 8k tokens visuales por petición; una captura de 1280×800 equivale a ~1.000 tokens a 32 px/token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-Vision | 0,86B (ViT 100M + cabeza 9M) | 8k tokens visuales, 4 imágenes | Decisión estructurada + GUI grounding + voz tailandesa | Apache 2.0 | Hugging Face; cliente Python completo pendiente |
| OpenThai-SystemOne (texto) | 0,75B | no disponible | Decisión estructurada sin imágenes | Apache 2.0 | Hugging Face |
| Qwen3-VL-2B | ~2B | no disponible | Modelo visión-lenguaje generativo | no disponible en la información | Referenciado como baseline en la model card |
| Qwen3-VL-4B | ~4B | no disponible | Modelo visión-lenguaje generativo | no disponible en la información | Referenciado como baseline en la model card |

En las tareas evaluadas, OpenThai-SystemOne-Vision v1.4 supera a Qwen3-VL-2B en Windows live (70,8 frente a 67,1) y queda por debajo de Qwen3-VL-4B (73,0); en Mac live queda por debajo de ambos. Su ventaja principal es la latencia (~70 ms frente a ~0,9 s y ~0,75 s) y la API de decisión estructurada con abstención.

## Limitaciones y advertencias

- El cliente Python con soporte de imágenes, `point` y `point_refine` no está disponible en el repositorio público de GitHub a fecha de la model card; solo la build GGUF funciona con código público y sin cabeza de puntos.
- La versión 1.4 empeora respecto a 1.3 en la tarea de jugar a Doom desde píxeles, según reconoce el autor.
- El modelo está especializado en tailandés e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y de clics incorrectos: aunque incorpora probabilidad de abstención, la precisión en pantallas live ronda el 65-71 %, insuficiente para automatización sin supervisión en tareas críticas.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base puede tener condiciones adicionales que deben verificarse.
- Límites operativos: máximo 4 imágenes y 8k tokens visuales por petición; `"detail": "high"` limita a 1920×1200.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-Vision
- Variante de texto: https://huggingface.co/iapp/OpenThai-SystemOne
- Build GGUF: https://huggingface.co/iapp/OpenThai-SystemOne-Vision-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
