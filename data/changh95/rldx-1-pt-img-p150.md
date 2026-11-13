# changh95/RLDX-1-PT-IMG-p150

## Resumen

RLDX-1-PT-IMG-p150 es un paquete de despliegue del modelo RLDX-1 PT-IMG de RLWRLD, una política visión-lenguaje-acción (VLA) de 6.900 millones de parámetros preentrenada sobre conjuntos públicos de manipulación robótica. El paquete, publicado por el usuario changh95, no modifica los pesos del modelo original (commit `d67fc642`): su aportación es el empaquetado para ejecutarse sobre hardware Tenstorrent p150 mediante la herramienta tt-model-manager 0.1.0, con el servidor HTTP propio del modelo y las rutinas de preprocesado y postprocesado de RLWRLD.

La arquitectura combina un backbone Qwen3-VL-8B truncado a 18 capas del modelo de lenguaje, que codifica tres cámaras, la instrucción de tarea y 64 tokens de cognición aprendidos, con un Multi-Stream Action Transformer (MSAT) de 4 bloques multi-stream y 8 bloques single-stream que genera, mediante flow matching en 4 pasos de Euler, un chunk de 16 acciones futuras. La implementación sirve únicamente el embodiment DROID (brazo Franka Panda): entra una imagen de 320x180 por cámara (`primary`, `secondary`, `wrist`), la pose del efector final de 7 valores y la instrucción; sale un chunk de 16 pasos de velocidades del efector final y objetivos de pinza.

Su relevancia es doble: por un lado, expone una política VLA preentrenada lista para evaluación offline sobre datos DROID; por otro, demuestra la portabilidad de un modelo de robótica de casi 7.000 millones de parámetros a aceleradores Tenstorrent, con el vision tower, el modelo de lenguaje y la cabeza de acción ejecutándose en el dispositivo y el preprocesado en CPU del host. La licencia es no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone Qwen3-VL-8B truncado a 18 capas + Multi-Stream Action Transformer (MSAT: 4 bloques multi-stream, 8 single-stream) con flow matching |
| Parametros totales | 6.900 millones (6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; presupuesto de instrucción de hasta 61 tokens tras el formateo de lenguaje de RLDX; 64 tokens de cognición aprendidos |
| Tipos de cuantizacion | no disponible (pesos servidos en el formato del paquete para p150; el repo ocupa 7,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | RLWRLD Model License v1.0 (uso no comercial) |
| Formato de pesos | no disponible explícitamente; pesos originales de `RLWRLD/RLDX-1-PT-IMG` (13,8 GB) más tensores preparados para dispositivo (5,0 GB) y kernels compilados (0,4 GB) |

## Arquitectura y entrenamiento

El modelo es una política VLA compuesta. Un backbone Qwen3-VL-8B, truncado a 18 capas del modelo de lenguaje, procesa las tres vistas de cámara (redimensionadas y recortadas a 160x256), la instrucción de la tarea y 64 tokens de cognición aprendidos. Sobre esas representaciones, un Multi-Stream Action Transformer con 4 bloques multi-stream y 8 bloques single-stream fusiona las características de cognición con el estado del robot y genera un chunk de 16 acciones mediante flow matching resuelto en 4 pasos de Euler. La salida son 3 componentes de velocidad de posición y 3 de rotación en [-1, 1] más objetivos de pinza en [0, 1].

El preentrenamiento se realizó sobre conjuntos públicos de manipulación robótica, según indica la model card del paquete, que remite al informe técnico RLDX-1 (arXiv:2605.03269) para los detalles de entrenamiento y evaluación. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. El paquete incluye el preprocesado y postprocesado propios de RLWRLD: redimensionado y recorte de imagen, troceado en parches, formato de prompt y tokenizador, y normalización de estado y acciones con las estadísticas DROID del checkpoint. Estas rutinas corren en CPU del host; el vision tower, el modelo de lenguaje y la cabeza de acción se ejecutan en el dispositivo Tenstorrent p150.

## Capacidades

- Generación de chunks de acción robótica: 16 pasos de comandos de velocidad del efector final (3 de posición, 3 de rotación, en [-1, 1]) y objetivos de pinza en [0, 1].
- Percepción multi-cámara: consume una imagen RGB de 320x180 por cada una de tres cámaras (`primary`, `secondary`, `wrist`), que el servidor redimensiona y recorta a 160x256.
- Condicionamiento por instrucción en lenguaje natural: acepta la instrucción como cadena o en el formato `annotation.human.action.task_description` de RLDX, con hasta 61 tokens tras el formateo.
- Integración del estado proprioceptivo del robot: pose del efector final (posición y rotación) y posición de la pinza en unidades DROID.
- Control de estocasticidad: parámetros `seed` o `noise` para fijar el ruido inicial del flow matching (por defecto, semilla 1000); ruido de forma 16 x 64.
- Salida normalizada opcional: `return_normalized` devuelve también el chunk en espacio del modelo (`action_pred_...`).
- Servicio HTTP propio del modelo: `POST /predict`, `GET /health`, `GET /info`, `GET /demo` y un stub `GET /v1/models`.
- Protocolo cliente ZeroMQ de RLDX, según la sección de uso previsto.
- No es una API de chat compatible con OpenAI: las formas de petición y respuesta son las del modelo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de audio.

## Casos de uso

- Evaluación offline de la política preentrenada sobre datos DROID grabados: se envían observaciones paso a paso a `/predict` y se comparan los chunks generados con las acciones registradas, lo que permite medir el comportamiento del checkpoint sin robot físico.
- Inspección y depuración de implementaciones: `GET /demo` devuelve una observación de ejemplo con ruido fijo y `expected`, las acciones que el código fp32 de RLDX calcula para ese ruido; sirve para verificar la paridad numérica de una implementación propia frente a la de referencia.
- Validación de portabilidad en aceleradores Tenstorrent: el paquete permite comprobar que el vision tower, el modelo de lenguaje y la cabeza de acción producen resultados equivalentes ejecutándose en p150, útil para equipos que evalúan alternativas de hardware a GPU.
- Comparación de backends de inferencia: al exponer un servidor HTTP con formas de petición estables, se puede integrar en un banco de pruebas que enfrente la ejecución en p150 con la de GPU sobre las mismas observaciones DROID.
- Investigación en políticas VLA: el modelo sirve como punto de partida para estudiar el efecto de los tokens de cognición, el número de pasos de Euler o el tamaño del chunk de acciones en el rendimiento de la política.
- Docencia y reproducción de resultados: con una sola petición HTTP y datos de ejemplo incluidos, un grupo de investigación puede reproducir la inferencia del informe técnico sin montar el pipeline completo de RLWRLD.
- Integración en un bucle de control simulado: mediante el protocolo ZeroMQ de RLDX, se puede conectar el servidor a un simulador que envíe observaciones y reciba chunks de 16 acciones para estudiar el comportamiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe técnico RLDX-1 (arXiv:2605.03269) para los detalles de entrenamiento y evaluación, pero no incluye cifras en el paquete.

## Requisitos de hardware

- Hardware obligatorio: acelerador Tenstorrent p150 (malla `P150`). No se documenta soporte para GPU en este paquete.
- VRAM estimada: no aplica; el modelo se ejecuta en memoria del dispositivo p150. Los pesos ocupan 13,8 GB, los tensores preparados para dispositivo 5,0 GB y los kernels compilados 0,4 GB.
- Espacio en disco: unos 19 GB libres para cachés, además de la imagen Docker de 4,4 GB.
- Software: Tenstorrent CLI (`tt`, instalable con `uv tool install tenstorrent`) o `tt-model` directamente, más Docker.
- Despliegue: `tt serve changh95/RLDX-1-PT-IMG-p150` o `tt-model serve changh95/RLDX-1-PT-IMG-p150`; el servidor escucha en el puerto 20000 o el siguiente libre.
- Arranque: la primera ejecución compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia y throughput: no disponibles. El uso previsto es de una petición a la vez.
- No cabe en GPU de consumo: el paquete está atado a hardware Tenstorrent p150 y no se ofrecen opciones para llama.cpp, Ollama, vLLM ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLDX-1-PT-IMG-p150 (este paquete) | 6,9B | no disponible; instrucción de hasta 61 tokens | VLA para DROID (Franka Panda), salida de chunks de 16 acciones | RLWRLD Model License v1.0 (no comercial) | Solo Tenstorrent p150 |
| RLWRLD/RLDX-1-PT-IMG (modelo base) | 6,9B | no disponible; instrucción de hasta 61 tokens | VLA para DROID (Franka Panda) | RLWRLD Model License v1.0 (no comercial) | Pesos originales; ejecución vía código RLDX-1 v1.0.2 |
| Otros modelos VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento del modelo base ni de alternativas de la misma categoría que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no comercial: la RLWRLD Model License v1.0 restringe el uso a investigación y evaluación; no se permite uso comercial de los pesos.
- Un solo embodiment: únicamente se sirve DROID (brazo Franka Panda); no hay soporte para otras morfologías en este paquete.
- Entradas rígidas: tres cámaras concretas (`primary`, `secondary`, `wrist`) a 320x180, estado del efector final y de la pinza en unidades DROID, e instrucción de hasta 61 tokens; desviarse de este contrato puede producir resultados inválidos.
- Dependencia de hardware: requiere un acelerador Tenstorrent p150; no hay ruta documentada para GPU ni CPU en este paquete.
- No es una API de chat: `GET /v1/models` es un stub y las formas de petición y respuesta son las del modelo, no compatibles con OpenAI.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre conjuntos públicos de manipulación, cabe esperar sesgos hacia las distribuciones, tareas y entornos de esos datasets.
- Riesgo de alucinación: no evaluado en la información disponible; en una política VLA, el equivalente es la generación de acciones no válidas o fuera de distribución ante observaciones novedosas.
- Idiomas: no disponibles; el soporte multilingüe de la instrucción no está documentado.
- Producción: el uso previsto es de una petición a la vez y para evaluación offline, no para control de robots en tiempo real; no se publican cifras de latencia ni de throughput.
- El paquete no modifica los pesos, pero añade capas de preprocesado y postprocesado propias; conviene verificar la paridad con el código de referencia usando `GET /demo` antes de confiar en los resultados.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/changh95/RLDX-1-PT-IMG-p150
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT-IMG
- Licencia: https://huggingface.co/RLWRLD/RLDX-1-PT-IMG/blob/d67fc642a7e768049ba41ff8cf0dfe0ff17f556b/LICENSE.md
- Informe técnico RLDX-1: https://arxiv.org/abs/2605.03269
- Código upstream RLDX-1 (tag v1.0.2): https://github.com/RLWRLD/RLDX-1/tree/v1.0.2
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI, requisitos previos: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
