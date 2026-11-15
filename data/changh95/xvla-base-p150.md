# changh95/xvla-base-p150

## Resumen

xvla-base-p150 es un paquete de inferencia para el checkpoint base X-VLA, un modelo vision-language-action (VLA) de 0,88 mil millones de parámetros desarrollado originalmente por el equipo de LeRobot (Hugging Face) y publicado en el paper arXiv:2510.10274. El modelo resuelve el problema de generar secuencias de acciones motoras a partir de observaciones visuales y una instrucción en lenguaje natural, lo que lo sitúa en el ámbito de la robótica de manipulación y la política de control cross-embodiment. Este paquete concreto, publicado por el usuario changh95, adapta los pesos originales sin modificarlos para ejecutarse sobre hardware Tenstorrent p150 mediante el servidor HTTP propio del modelo.

La arquitectura combina un encoder Florence-2 (0,57B parámetros, con encoder de imagen DaViT y encoder de texto BART) que alimenta un transformer de flow-matching con soft prompts de 24 bloques (0,31B parámetros). La entrada consiste en tres vistas de cámara, una instrucción en lenguaje natural, un estado propioceptivo de hasta 20 flotantes y un identificador de dominio de embodiment; la salida es un chunk de 30 acciones futuras de 20 valores cada una en el layout `ee6d` de LeRobot.

Es relevante ahora porque demuestra la portabilidad de modelos VLA a aceleradores alternativos (Tenstorrent) y porque expone una API HTTP específica del modelo, no compatible con OpenAI, pensada para investigación e inspección del checkpoint base antes de un fine-tuning específico de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: encoder Florence-2 (DaViT + BART) + transformer de flow-matching con soft prompts de 24 bloques |
| Parametros totales | 0,88B (0,57B encoder Florence-2 + 0,31B transformer de acciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (instrucción tokenizada a 32 tokens con tokenizador BART) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos descargados desde `lerobot/xvla-base` en el commit `cdb7964e`; el paquete se distribuye como imagen Docker) |

## Arquitectura y entrenamiento

El modelo es un VLA cross-embodiment. El encoder visual es Florence-2 con un image encoder DaViT y un text encoder BART (0,57B parámetros en total); sus convoluciones se ejecutan en la CPU del host, mientras que los bloques de atención y MLP del encoder visual, el encoder de texto y el transformer de acciones se ejecutan en el dispositivo Tenstorrent p150. El transformer de acciones es un modelo de flow-matching con soft prompts de 24 bloques y 0,31B parámetros, que genera un chunk de 30 acciones de 20 valores en el layout `ee6d` (dos slots de efector final de 10 valores cada uno: xyz de 3, rotación 6D de 6 y gripper de 1, más relleno de ceros).

La entrada incluye tres vistas de cámara (dos terceras personas y una de muñeca), una instrucción en lenguaje natural tokenizada a 32 tokens, un estado propioceptivo de 1 a 20 flotantes (con relleno a 20) y un `domain_id` de embodiment entre 0 y 29. El servidor incorpora el preprocesado de imágenes de LeRobot (normalización ImageNet y redimensionado con padding a 224x224). El número de pasos de denoising del flow-matching es configurable entre 1 y 50, con valor por defecto 1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada; la model card remite a la model card original de `lerobot/xvla-base` para los detalles de entrenamiento.

## Capacidades

- Generación de chunks de acciones motoras: produce 30 pasos futuros de 20 valores en layout `ee6d` a partir de observaciones visuales e instrucción.
- Entrada multimodal: acepta 1 o 3 vistas de cámara en PNG o JPEG de cualquier tamaño (mínimo 8x8), con una vista replicada a los tres slots si solo se envía una.
- Condicionamiento por lenguaje natural: la instrucción (campo `instruction` o `task`) es obligatoria y se tokeniza a 32 tokens.
- Condicionamiento por estado propioceptivo: acepta de 1 a 20 flotantes, con relleno a 20 y valor por defecto de 8 ceros.
- Soporte cross-embodiment: el campo `domain_id` (0 a 29) selecciona el dominio de embodiment.
- Control de estocasticidad: el campo `seed` permite reproducibilidad exacta del chunk con la misma petición.
- Control de calidad/coste: `num_denoising_steps` entre 1 y 50 permite ajustar el compromiso entre latencia y calidad de la muestra.
- Servidor HTTP propio: endpoints `POST /predict`, `GET /health`, `GET /info`, `POST /reset` y `GET /v1/models` (stub, no es una API de chat).
- No soporta tool calling, function calling, agentes multi-paso ni API compatible con OpenAI según la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inspección del checkpoint base: enviar observaciones sintéticas o reales al endpoint `/predict` para verificar que la política preentrenada produce chunks coherentes antes de invertir en fine-tuning.
- Comparación de implementaciones: usar el mismo `seed` y la misma petición para contrastar la salida del paquete Tenstorrent con la implementación de referencia de `2toinf/X-VLA` y detectar divergencias numéricas.
- Pruebas de humo en CI: el repositorio incluye `smoke_test.py` (solo biblioteca estándar de Python 3) que valida la respuesta, la repetibilidad con la misma semilla, la petición de una sola vista y `/reset`, adecuado para pipelines de integración.
- Evaluación de robustez cross-embodiment: variar `domain_id` entre 0 y 29 con la misma observación para estudiar cómo cambia la distribución de acciones según el dominio.
- Estudio del efecto del número de pasos de denoising: comparar chunks generados con 1, 10 o 50 pasos para medir la relación entre coste computacional y calidad de la acción.
- Prototipado de políticas de manipulación en investigación: generar chunks de 30 acciones para tareas como empujar un objeto en un entorno tipo PushT, usando las tres vistas de cámara y una instrucción corta.
- Benchmarking de hardware: medir latencia de inferencia (aproximadamente 5 s por petición según la model card) en Tenstorrent p150 para comparar con aceleradores alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta datos de latencia de una petición de ejemplo: `preprocess` 9,4 ms, `inference` 4935,66 ms y `total` 4945,05 ms, con 1 paso de denoising. No se proporcionan métricas de éxito en tareas, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p150 (mesh `P150`); no se contempla ejecución en GPU convencional en este paquete.
- VRAM estimada: no disponible; el paquete está diseñado para el acelerador Tenstorrent, no para GPU NVIDIA o AMD.
- GPU recomendadas: no aplica; el requisito es una tarjeta Tenstorrent p150.
- Compatibilidad con GPU de consumo: no disponible; el paquete no soporta GPU de consumo según la información proporcionada.
- Software necesario: Tenstorrent CLI (`tt`, instalable con `uv tool install tenstorrent`), Docker y hardware p150. Alternativamente, `tt-model serve`.
- Despliegue: `tt serve changh95/xvla-base-p150` descarga la imagen Docker y los pesos de `lerobot/xvla-base` en el commit `cdb7964e4fe842935d671bfab5a5ebe00a96648c`, y arranca el servidor HTTP del modelo en el puerto 20000 (o el siguiente libre). El primer arranque compila kernels para el dispositivo y tarda varios minutos.
- Latencia: aproximadamente 5 s por petición con 1 paso de denoising (4935,66 ms de inferencia y 9,4 ms de preprocesado en la medición reportada).
- Throughput: no disponible; la model card indica que el uso previsto es de una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | API |
|---|---|---|---|---|---|
| xvla-base-p150 | 0,88B | no disponible | Tenstorrent p150 | Apache 2.0 | HTTP propia (`/predict`) |
| lerobot/xvla-base | 0,88B | no disponible | GPU (implementación de referencia) | no disponible en la información proporcionada | no disponible |
| 2toinf/X-VLA (código upstream) | 0,88B | no disponible | GPU | no disponible en la información proporcionada | no disponible |

No se dispone de datos de benchmarks ni de otros modelos VLA comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El checkpoint es la versión base y está pensado para ser fine-tuneado antes de controlar un robot real; la model card indica explícitamente que este paquete solo sirve los pesos base.
- Uso previsto limitado a inferencia de investigación, una petición a la vez; no está diseñado para producción de alta concurrencia.
- La API no es compatible con OpenAI: los formatos de petición y respuesta son propios del modelo, lo que impide reutilizar clientes de chat estándar.
- Las acciones devueltas están en espacio de modelo sin normalizar (`normalized: false`) y en layout `ee6d`; requieren postprocesado específico del robot antes de su ejecución.
- La instrucción se trunca a 32 tokens con el tokenizador BART, lo que limita la complejidad de las órdenes en lenguaje natural.
- El estado propioceptivo se rellena a 20 flotantes; estados con dimensionalidad distinta pueden degradar la calidad de la predicción.
- El primer arranque requiere compilación de kernels para el dispositivo, con varios minutos de espera.
- Dependencia de hardware propietario Tenstorrent p150 y de Docker; no hay ruta de despliegue documentada en GPU convencional.
- No se dispone de información sobre sesgos, riesgo de alucinación en el sentido lingüístico ni evaluación de seguridad física del modelo.
- La licencia Apache 2.0 permite uso comercial, pero la idoneidad del checkpoint base para aplicaciones comerciales no está validada por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/xvla-base-p150
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper: https://arxiv.org/abs/2510.10274
- Código upstream: https://github.com/2toinf/X-VLA
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Imagen de ejemplo: https://huggingface.co/changh95/xvla-base-p150/resolve/main/media/pusht_synthetic.png
- Script de prueba de humo: https://huggingface.co/changh95/xvla-base-p150/resolve/main/code/tt/server/smoke_test.py
