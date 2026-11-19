# changh95/vla-jepa-base-p150

## Resumen

VLA-JEPA es una política visión-lenguaje-acción (VLA) de 2.300 millones de parámetros publicada por LeRobot, diseñada para generar secuencias de acciones robóticas a partir de dos vistas de cámara y una instrucción en lenguaje natural. Esta ficha concreta, `changh95/vla-jepa-base-p150`, no es un modelo nuevo: es un empaquetado del checkpoint preentrenado `lerobot/VLA-JEPA-Pretrain` (commit `e946c3e5`) con pesos sin modificar, preparado para ejecutarse sobre hardware Tenstorrent p150 mediante el servidor HTTP propio del modelo.

El interés de esta variante es de despliegue, no de investigación del modelo en sí: convierte un policy de LeRobot en un contenedor servible con `tt serve`, con preprocesado y postprocesado en CPU del host y el codificador visual, el modelo de lenguaje y la cabeza de acciones ejecutándose como tres programas persistentes en el dispositivo. El método subyacente se describe en el paper VLA-JEPA (arXiv:2602.10098) y el código de inferencia de referencia es LeRobot 0.7.0 (`lerobot/policies/vla_jepa`).

La relevancia es acotada pero clara: permite evaluar la política preentrenada sobre aceleradores Tenstorrent sin reimplementar el pipeline, con una API HTTP mínima (`/predict`, `/health`, `/info`) que devuelve chunks de 7 acciones de 7 valores cada una. No es un modelo de chat ni un servicio OpenAI-compatible, y su uso previsto es investigación y evaluación, una petición a la vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: codificador visual Qwen3-VL-2B (24 bloques ViT con DeepStack) + LM de 28 capas + cabeza de acciones DiT de 16 capas con flow matching |
| Parametros totales | 2.300 millones (aproximado, "2.3B-parameter" según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | instrucción de hasta 111 tokens; prompt buckets de 224, 256, 288 o 320 filas; 64 tokens de imagen por cámara |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la información proporcionada (repo de 0,9 GB; pesos descargados del checkpoint base en caché HF, 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual Qwen3-VL-2B con 24 bloques ViT y características DeepStack, un modelo de lenguaje de 28 capas y una cabeza de acciones DiT de 16 capas entrenada con flow matching. Las dos imágenes de cámara se redimensionan a 224 x 224 y el procesador de Qwen3-VL las escala a 256 x 256, generando 64 tokens de imagen por cámara. Las instrucciones y las imágenes se codifican conjuntamente; la salida pre-norm de la última capa en 32 tokens de consulta de acción condiciona la cabeza DiT, que transforma ruido gaussiano en un chunk de 7 acciones futuras de 7 valores cada una en 4 pasos de Euler.

El checkpoint incluye un modelo del mundo V-JEPA2 que solo se utiliza durante el entrenamiento y no se ejecuta en inferencia. No se dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a la card original de `lerobot/VLA-JEPA-Pretrain` para esos detalles. La innovación destacable de este empaquetado es de sistema: preprocesado y postprocesado en CPU del host, y los tres componentes de red ejecutados en el dispositivo como programas persistentes, reproducidos desde trazas Metal capturadas por longitud de prompt, subiendo las entradas de una nueva instrucción mientras corre el codificador visual.

## Capacidades

- Generación de chunks de acciones robóticas: 7 acciones de 7 valores a partir de dos vistas de cámara y una instrucción.
- Entrada multimodal: exactamente 2 imágenes RGB (PNG o JPEG en base64), en el orden de cámaras del checkpoint (`exterior_1_left`, luego `exterior_2_left`), de 16 a 4096 px por lado, redimensionadas a 224 x 224 sin recorte.
- Instrucciones en lenguaje natural de hasta 111 tokens; si se omite, se usa la instrucción por defecto "Execute the robot action."; se rechazan tokens especiales de Qwen dentro de la instrucción.
- Determinismo por semilla: la misma petición con la misma `seed` devuelve el mismo chunk.
- Postprocesado integrado de LeRobot: recorte, ajuste de pinza (gripper snap), desnormalización con las estadísticas del checkpoint y binarización de la pinza.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni estado del robot como entrada (`state` se rechaza explícitamente).
- No expone una API de chat compatible con OpenAI; `/v1/models` es un stub.

## Casos de uso

- Evaluación de la política preentrenada: enviar fotogramas de un episodio (por ejemplo, LIBERO-spatial con vista de agente y cámara de muñeca) a `/predict` para inspeccionar cualitativamente las acciones generadas antes de invertir en entrenamiento adicional.
- Comparación de implementaciones: usar el servidor como referencia de comportamiento frente a la implementación de LeRobot 0.7.0, verificando que los chunks coinciden para las mismas entradas y semilla.
- Punto de partida para experimentos offline: generar chunks sobre datos grabados y analizar la distribución de acciones sin necesidad de un robot físico conectado.
- Validación de despliegue en Tenstorrent: probar el pipeline completo (contenedor, compilación de kernels, servidor HTTP) en un p150 antes de integrarlo en un banco de pruebas mayor.
- Integración en un bucle de control simulado: consumir `/predict` desde un simulador que envíe dos imágenes y una instrucción por paso, aprovechando el determinismo por semilla para reproducir episodios.
- Pruebas de robustez de instrucciones: variar el texto de la tarea (hasta 111 tokens) y medir cómo cambian los chunks, útil para estudiar la sensibilidad de la política al lenguaje.
- Referencia para pipelines de robótica en producción: usar la forma de petición/respuesta y el postprocesado (desnormalización, binarización de pinza) como contrato al construir un servicio propio con otro backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent p150 (malla `P150`); no se contempla ejecución en GPU convencional en esta información.
- Disco: aproximadamente 11 GB libres, de los cuales 6,2 GB son los pesos en la caché de Hugging Face y 4,1 GB la imagen del contenedor.
- VRAM: no aplica; el cómputo corre en el acelerador Tenstorrent, no se especifica memoria del dispositivo requerida.
- Despliegue: `tt serve changh95/vla-jepa-base-p150` (requiere Tenstorrent CLI `tt`, instalable con `uv tool install tenstorrent`, y Docker) o `tt-model serve` sin la CLI.
- Servidor HTTP propio en el puerto 20000 (o el siguiente libre), con endpoints `/predict`, `/health`, `/info` y `/v1/models` (stub).
- La primera puesta en marcha compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia y throughput: no disponibles; el uso previsto es una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| vla-jepa-base-p150 (esta ficha) | ~2,3B | 2 imágenes + instrucción de hasta 111 tokens | Apache 2.0 | Solo Tenstorrent p150, vía `tt serve` |
| lerobot/VLA-JEPA-Pretrain | ~2,3B | 2 imágenes + instrucción | no disponible en la información proporcionada | Pesos en Hugging Face; inferencia con LeRobot 0.7.0 |
| Otras políticas VLA de LeRobot | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es entre el checkpoint base y este empaquetado: mismos pesos, misma licencia y mismo comportamiento esperado, con la diferencia de que el base se ejecuta mediante el código de LeRobot y este requiere hardware Tenstorrent p150 y ofrece una API HTTP propia.

## Limitaciones y advertencias

- Pesos sin modificar: cualquier limitación del checkpoint `lerobot/VLA-JEPA-Pretrain` se hereda íntegramente; esta ficha no aporta mejoras de calidad.
- Uso previsto restringido a investigación y evaluación, una petición a la vez; no está planteado como servicio de producción de alta concurrencia.
- Dependencia de hardware propietario: sin un Tenstorrent p150 no se puede ejecutar este paquete.
- No acepta estado del robot (`state` se rechaza), lo que limita su aplicabilidad a políticas que requieran propriocepción.
- Orden de cámaras fijo (`exterior_1_left`, `exterior_2_left`); invertirlo produce acciones incorrectas sin aviso.
- Instrucciones limitadas a 111 tokens y se rechazan tokens especiales de Qwen dentro del texto.
- `num_steps` debe ser 4; no es configurable.
- No es una API de chat: `/v1/models` es un stub y los formatos de petición y respuesta son propios del modelo.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al tratarse de una política de acciones, el fallo se manifiesta como acciones erróneas, no como texto inventado.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero la viabilidad práctica está condicionada por el hardware Tenstorrent requerido por este empaquetado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/vla-jepa-base-p150
- Checkpoint base: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
- Paper VLA-JEPA: https://arxiv.org/abs/2602.10098
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Muestras del repositorio (LIBERO-spatial): https://huggingface.co/changh95/vla-jepa-base-p150/resolve/main/code/tt_vla_jepa/samples/libero_spatial_ep0_f40/
