# softandsweet/roboflow-rf-detr-nano-bf16-rngd-fxbx

## Resumen

RF-DETR-Nano-BF16 es un perfil de inferencia en precisión BF16 del detector de objetos RF-DETR-Nano de Roboflow, empaquetado por el usuario `softandsweet` para su ejecución sobre aceleradores Furiosa RNGD (Reconfigurable Neural Processing Unit). No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación de despliegue: toma el checkpoint original en FP32 de `Roboflow/rf-detr-nano` (commit `9f201577d9415f0378084748d27e68586e6b3600`, aproximadamente 122 MB) y lo recompila en 86 grupos de ejecución fusionados para el runtime `fxbX` 0.10.2 sobre el SDK Furiosa Torch/TCC 2026.4.0.

El modelo resuelve detección de objetos genérica sobre COCO con una entrada fija de 384×384 píxeles y lote de tamaño 1. La relevancia de esta ficha es acotada y muy específica: documenta un artefacto de despliegue de nicho para hardware NPU de Furiosa, con métricas de latencia y precisión medidas de forma explícita, y no un modelo de propósito general. La licencia es Apache-2.0 tanto para el modelo original como para el paquete.

Conviene subrayar que el autor declara explícitamente que este perfil cambia la precisión respecto al original y que no se reclama equivalencia tensorial con el FP32. La model card incluye una evaluación completa sobre las 5.000 imágenes de validación de COCO2017 y cifras de latencia medidas en un servidor concreto, lo que permite evaluar el compromiso precisión/rendimiento con datos verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer DETR de Roboflow), perfil de ejecución BF16 sobre Furiosa RNGD |
| Parámetros totales | no disponible (checkpoint original de aproximadamente 122 MB en `model.safetensors`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 384×384 píxeles) |
| Tipos de cuantización | BF16 (perfil empaquetado); el original upstream se distribuye en FP32 |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase dependen del dataset COCO) |
| Licencia | Apache-2.0 (modelo original, configuración y paquete) |
| Formato de pesos | `model.safetensors` original descargado por separado y verificado por SHA256 (`497b1dbcc8f9d115b806fb82d140d7e22e5b5c3fba45abefef39dd4f99c1f737`); el paquete incluye artefactos compilados, buffers derivados y configuración del procesador |
| Resolución de entrada | 384×384 fija (dimensiones arbitrarias se reescalan al perfil) |
| Tamaño de lote | 1 |
| Postprocesado por defecto | top 300 detecciones, `COCOeval` con `maxDets=100` |
| Runtime requerido | `fxbX` 0.10.2 sobre SDK Furiosa 2026.4.0 |
| Entorno probado | Python 3.11.18, Torch 2.10.0+cpu, Furiosa Torch/TCC 2026.4.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR-Nano de Roboflow, un detector basado en transformer (familia DETR) que sustituye las propuestas de región clásicas por atención sobre el mapa de características y decodificación de consultas de objeto. El modelo original se entrenó sobre COCO; esta ficha no dispone de detalles sobre el número de tokens, la composición exacta del dataset de entrenamiento ni si hubo etapas de ajuste fino con RLHF o DPO, por lo que esos datos se consideran no disponibles.

La contribución de este paquete no es de entrenamiento sino de compilación y despliegue. El autor recompila el grafo en 86 grupos de ejecución fusionados que cubren 100 llamadas en tiempo de ejecución, manteniendo intacto el archivo nativo anidado, y lo ejecuta en BF16 sobre la NPU Furiosa RNGD. El procesamiento de imagen en CPU se mantiene de forma intencionada: la decodificación y el preprocesado de píxeles, así como el postprocesado de cajas, siguen en CPU, mientras que el grafo neuronal se ejecuta en la NPU. Una traza oficial separada registra 200 tareas NPU y 0 eventos de ruta CPU para el grafo, aunque el autor advierte que el recuento de tareas no demuestra la atribución de cada operación original. No se proporciona ningún hook de ejecución LoRA aplicable al detector.

## Capacidades

- Detección de objetos genérica sobre las clases de COCO, con salida de `class_id`, `label`, `score` y `box_xyxy` en píxeles de la imagen original.
- Procesamiento de imágenes de dimensiones arbitrarias, reescaladas internamente al perfil fijo de 384×384.
- Control del umbral de confianza (`threshold`, rango 0..1) y del número máximo de detecciones (`top_k`, rango 1..300).
- Ejecución en lote 1 sobre NPU Furiosa RNGD con precisión BF16.
- Servicio HTTP local mediante `fxbx serve` con endpoint `POST /predict` que acepta JSON con ruta absoluta de imagen en el host servidor.
- Ejecución de ejemplo autocontenida mediante `fxbx run RF-DETR-Nano-BF16 --sample`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni modo thinking: es exclusivamente un detector de objetos.
- No dispone de capacidades multilingües en sentido generativo; las etiquetas de clase provienen del vocabulario de COCO.

## Casos de uso

- Despliegue de detección en hardware NPU Furiosa: el paquete está compilado específicamente para RNGD con SDK 2026.4.0, de modo que permite ejecutar un detector DETR en aceleradores de Furiosa sin recompilar el grafo, usando `fxbx serve` y el endpoint `/predict`.
- Procesamiento de imágenes por lotes en servidor: con latencia de grafo neuronal de 18,79 ms por imagen a 384×384 y lote 1, es adecuado para pipelines que recorren directorios de imágenes en el host y necesitan detecciones con cajas en píxeles originales.
- Validación de precisión en producción: el autor documenta la evaluación completa sobre las 5.000 imágenes de COCO2017 con AP 47,980, lo que permite usar este perfil como referencia de control de calidad frente al FP32 original (AP 48,023) y detectar regresiones al cambiar de precisión.
- Integración en servicios internos de inspección visual: el endpoint HTTP local con parámetros `threshold` y `top_k` configurables permite ajustar la sensibilidad por caso de uso sin reentrenar, por ejemplo para filtrar detecciones de baja confianza en imágenes de vigilancia o inventario.
- Benchmarking de aceleradores: al incluir cifras de latencia medidas con protocolo ABBA en procesos frescos (207,55 ms en grafo frente a 18,79 ms en NPU, factor 11,04×), sirve como referencia para comparar el rendimiento de RNGD frente a CPU en cargas de detección.
- Prototipado de detección en entornos con SDK Furiosa ya instalado: el paquete incluye validación de consumidor fresco con `fxbX` 0.10.2 sin recompilación ni fallback a CPU del SDK, lo que reduce el tiempo de puesta en marcha en hosts compatibles.
- Evaluación de compromisos precisión/rendimiento: la diferencia documentada de −0,043 puntos de AP y −0,015 de AP50 frente a FP32 permite decidir si BF16 es aceptable para una aplicación concreta antes de adoptarlo.

## Benchmarks y rendimiento

Evaluación completa sobre las 5.000 imágenes de validación de COCO2017, con el procesador de imagen original fijado y postprocesado por defecto top 300, `COCOeval` con `maxDets=100`:

| Métrica | FP32 (CPU) | BF16 (NPU) | Diferencia |
|---|---|---|---|
| AP | 48,0233371 | 47,9804152 | −0,0429219 puntos porcentuales |
| AP50 | 67,1124055 | 67,0971786 | no disponible el delta exacto (implícito ≈ −0,0152) |

Latencia medida en servidor con protocolo ABBA en procesos frescos (4 procesos, 24 llamadas cronometradas por proceso, 4 hilos de CPU; excluye primera llamada, sondas de calidad, 3 calentamientos, carga del modelo, preprocesado y postprocesado de imagen y perfilado):

| Escenario | Tiempo |
|---|---|
| Grafo neuronal (medición aparcada) | 207,5477 ms |
| Grafo neuronal en NPU | 18,79347 ms |
| Aceleración | 11,0436× |

Servicio HTTP residente en localhost con muestra de 512×512 (20 peticiones cronometradas, excluye primera observación de 189,19 ms y 3 calentamientos; incluye decodificación y preprocesado de imagen en CPU, NPU y serialización JSON, no carga):

| Métrica HTTP | Valor |
|---|---|
| Mediana | 49,0469 ms |
| Rango | 27,92–89,17 ms |

El autor advierte que estas cifras no representan throughput HTTP de extremo a extremo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un detector de objetos.

## Requisitos de hardware

- Acelerador Furiosa RNGD obligatorio para la ejecución del grafo compilado; no se contempla ejecución del paquete en GPU convencional.
- SDK Furiosa 2026.4.0 y runtime `fxbX` 0.10.2, con driver compatible instalado en el host. El autor indica explícitamente no reinstalar ni actualizar el SDK para estos comandos.
- Python 3.11.18 con Torch 2.10.0+cpu, torchvision 0.25.0+cpu, transformers 5.20.2, numpy 2.4.6, safetensors 0.8.0, tokenizers 0.23.3, Pillow 13.0.0, huggingface_hub 1.33.0 y requests.
- Entorno virtual con `--system-site-packages` para heredar la instalación del SDK; si la configuración del host apunta a otro intérprete, exportar `FXBEX_WORKER_PYTHON` con la ruta del intérprete activado.
- VRAM estimada: no disponible; el modelo original pesa aproximadamente 122 MB en `model.safetensors` y el paquete incluye artefactos compilados y buffers derivados, pero no se publica el consumo de memoria del acelerador.
- No cabe en GPU de consumo (RTX 4090 y similares) porque el artefacto está compilado para RNGD; no se documenta una ruta de ejecución alternativa en CUDA.
- Opciones de despliegue: `fxbx run` para ejecución de muestra, `fxbx serve --port 8000` para servicio HTTP local con `POST /predict`, y `fxbx fetch` para descargar el modelo a caché.
- Latencia y throughput: 18,79 ms por imagen en el grafo neuronal NPU a 384×384 y lote 1; mediana HTTP de 49,05 ms en localhost con imagen de 512×512. No se publica throughput agregado ni concurrencia soportada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Precisión | AP COCO | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RF-DETR-Nano-BF16 (este paquete) | RF-DETR sobre Furiosa RNGD | 384×384 fija | BF16 | 47,980 | Apache-2.0 | Paquete `fxbX` para RNGD |
| RF-DETR-Nano FP32 (upstream, `softandsweet/roboflow-rf-detr-nano-rngd-fxbx`) | RF-DETR sobre Furiosa RNGD | 384×384 fija | FP32 | 48,023 | Apache-2.0 | Paquete `fxbX` para RNGD, versión 2026.4.0-nano384-fxbx2-grouped |
| `Roboflow/rf-detr-nano` (checkpoint original) | RF-DETR | 384×384 fija | FP32 | no disponible en esta ficha | Apache-2.0 | Hugging Face, commit `9f201577d9415f0378084748d27e68586e6b3600` |

No se dispone de datos de benchmarks de otras alternativas (por ejemplo, YOLO u otros DETR) en la información proporcionada, por lo que no se incluyen comparaciones adicionales.

## Limitaciones y advertencias

- El perfil BF16 no garantiza equivalencia tensorial con el FP32 original; el autor declara explícitamente que no se reclama dicha equivalencia y que no se cumple un criterio estricto de no reducción de AP.
- La diferencia de precisión es pequeña pero real: −0,0429 puntos de AP y aproximadamente −0,015 de AP50 sobre las 5.000 imágenes de COCO2017. No hay garantía de precisión más allá de esta evaluación.
- El paquete está atado a hardware y software concretos: Furiosa RNGD, SDK 2026.4.0 y `fxbX` 0.10.2. Cambios de versión del SDK o del runtime pueden invalidar los artefactos compilados.
- El endpoint `/predict` no acepta subida de imágenes: la imagen debe existir en el sistema de ficheros del host servidor y pasarse como ruta absoluta, lo que limita su uso como API pública.
- El procesamiento de imagen y el postprocesado permanecen en CPU de forma intencionada; las cifras HTTP incluyen ese coste y no representan solo inferencia en NPU.
- Las latencias publicadas corresponden a un servidor concreto con protocolo de medición acotado (lote 1, 4 hilos de CPU, calentamientos excluidos); no deben extrapolarse a otros hosts ni a cargas concurrentes.
- El recuento de 200 tareas NPU y 0 eventos de ruta CPU no demuestra la atribución de cada operación original, según advierte el propio autor.
- No se proporciona hook de ejecución LoRA aplicable al detector, por lo que no es posible aplicar adaptadores de ajuste fino de ese tipo sobre este paquete.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible; al ser un detector sobre COCO, hereda las limitaciones de clases y distribución del dataset original.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar todas las licencias incluidas; el paquete no incluye las librerías del SDK.
- El autor indica que se carguen únicamente paquetes de confianza, dado que el paquete contiene kernels compilados y código de modelo incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/softandsweet/roboflow-rf-detr-nano-bf16-rngd-fxbx
- Versión FP32 upstream del mismo autor: https://huggingface.co/softandsweet/roboflow-rf-detr-nano-rngd-fxbx
- Checkpoint original de Roboflow: https://huggingface.co/Roboflow/rf-detr-nano (commit `9f201577d9415f0378084748d27e68586e6b3600`)
- Runtime `fxbX`: https://github.com/smallstep-zzz/fxbX
