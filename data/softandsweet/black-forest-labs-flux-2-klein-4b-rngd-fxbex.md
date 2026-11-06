# softandsweet/black-forest-labs-flux-2-klein-4b-rngd-fxbex

## Resumen

FLUX.2 Klein 4B es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado originalmente por Black Forest Labs. Esta ficha concreta no contiene los pesos en su formato original, sino un paquete autocontenido en formato `.fxbex` (Furiosa BEX) preparado por el usuario `softandsweet` para su ejecución sobre aceleradores NPU Furiosa RNGD. El repositorio empaqueta los pesos del modelo, kernels compilados y código adaptador, con el objetivo de permitir inferencia completamente offline sobre hardware específico de Furiosa.

El paquete está fijado al commit `e7b7dc27f91deacad38e78976d1f2b499d76a294` del modelo upstream `black-forest-labs/FLUX.2-klein-4B` y requiere la versión 2026.4.0 del SDK de Furiosa y la versión 0.4.0 del runtime FXBEX. Su relevancia radica en demostrar un flujo de despliegue de un modelo de difusión de 4B parámetros sobre NPUs dedicadas, con validación de reproducibilidad determinista y trazado de ejecución sin fallback a CPU.

El alcance validado es deliberadamente estrecho: generación text-to-image a 512×512 píxeles, precisión BF16, cuatro pasos de denoising y longitud de secuencia 128. Otras resoluciones, pasos, precisiones o tareas como edición de imagen no han sido validadas por el autor del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (FLUX.2 Klein); detalles internos del transformer no disponibles en la información proporcionada |
| Parametros totales | 4B (según denominación del modelo upstream) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No aplica; longitud de secuencia validada de 128 tokens |
| Tipos de cuantizacion | BF16 (única precisión validada); otras precisiones no validadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos del modelo); el código adaptador incluido no declara licencia separada |
| Formato de pesos | `.fxbex` (paquete standalone de 15.999.871.549 bytes); pesos upstream originales no incluidos en formato safetensors/GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 Klein 4B, un modelo de difusión para generación de imágenes a partir de texto de la familia FLUX de Black Forest Labs. La información proporcionada no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, composición del dataset de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO). El paquete `.fxbex` incluye los pesos, kernels compilados para la NPU Furiosa RNGD y un adaptador que expone una API de generación.

La innovación técnica de este artefacto no reside en el modelo en sí, sino en el pipeline de compilación y despliegue: 205 Runnables capturados y replicados, 9.708 eventos de tarea NPU registrados en el trazado oficial, cero ejecuciones en CPU del SDK y cero grafos desconocidos. El fallback a CPU del SDK está deshabilitado y no se realizan lecturas de caché externa de Hugging Face durante la carga. La inferencia es determinista para una semilla dada: tres ejecuciones con la misma semilla produjeron imágenes con SHA256 idéntico (`dc836e4b...a0615`).

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) en resolución 512×512.
- Generación determinista con semilla configurable, validada mediante hash SHA256 idéntico en ejecuciones repetidas.
- Ejecución completamente offline sobre NPU Furiosa RNGD, sin acceso a caché de Hugging Face ni a red.
- Control de pasos de denoising (validado a 4 pasos) y de dimensiones de salida (validado a 512×512).
- Empaquetado autocontenido con pesos, kernels y adaptador en un único archivo `.fxbex` verificable por SHA256.
- No se ha validado edición de imágenes, otras resoluciones, otros números de pasos, otras precisiones ni otras longitudes de secuencia.
- No se dispone de información sobre soporte multilingüe, tool calling, agentes ni modos de razonamiento (no aplicables a un modelo text-to-image).

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite obtener imágenes 512×512 en cuatro pasos de denoising, adecuado para iterar rápidamente sobre conceptos visuales en fases tempranas de diseño.
- Despliegue en entornos aislados o air-gapped: al ejecutarse íntegramente offline sobre NPU con el paquete `.fxbex`, encaja en infraestructuras sin acceso a internet ni a repositorios de modelos externos.
- Generación reproducible para auditoría: la determinismo verificado por semilla permite regenerar exactamente la misma imagen, útil en pipelines que requieren trazabilidad de resultados.
- Benchmarking de hardware NPU Furiosa RNGD: el paquete sirve como referencia para medir rendimiento y validar el stack SDK 2026.4.0 en cargas de difusión de 4B parámetros.
- Creación de assets para videojuegos o contenido editorial a baja resolución: la salida 512×512 es suficiente para sprites, thumbnails o bocetos que luego se escalan o retocan.
- Investigación en compilación de modelos de difusión para aceleradores especializados: el trazado con 205 Runnables y cero fallback a CPU documenta un caso de estudio de portabilidad de un modelo FLUX a NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del paquete únicamente reporta métricas de validación de ejecución: 9.708 eventos de tarea NPU, cero ejecuciones en CPU del SDK, cero grafos desconocidos, 205 Runnables replicados y ausencia de compilación durante la carga del paquete. No se proporcionan latencias, throughput (imágenes por segundo) ni comparaciones con otros modelos.

## Requisitos de hardware

- NPU Furiosa RNGD obligatoria; el paquete no está pensado para GPU convencionales ni CPU.
- SDK de Furiosa versión 2026.4.0 y runtime FXBEX versión 0.4.0, con driver compatible en el host RNGD.
- Espacio en disco: al menos 16 GB para el archivo `.fxbex` de 15.999.871.549 bytes.
- Memoria del acelerador: no especificada en la información proporcionada; el modelo opera en BF16 con 4B parámetros.
- No cabe en GPU de consumo (RTX 4090, etc.) en el formato empaquetado, ya que los kernels están compilados para la NPU Furiosa.
- Opciones de despliegue: runtime FXBEX instalado desde el repositorio `smallstep-zzz/FXBEX` (vía `pip install git+...`), con comandos `fxbex doctor`, `fxbex inspect`, `fxbex validate` y `fxbex predict`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Hardware objetivo | Licencia | Estado |
|---|---|---|---|---|---|
| FLUX.2 Klein 4B (upstream) | 4B | Pesos originales (no especificado) | GPU convencional | Apache-2.0 | Disponible en Hugging Face |
| Este paquete (`.fxbex`) | 4B | `.fxbex` | NPU Furiosa RNGD | Apache-2.0 (pesos) | Disponible, alcance validado limitado |
| Alternativas de difusión text-to-image de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables empaquetados para Furiosa RNGD ni sobre resultados de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Alcance de validación muy restringido: solo se ha probado text-to-image a 512×512, BF16, 4 pasos y longitud de secuencia 128; cualquier otro uso queda sin validar.
- Dependencia de hardware específico: requiere una NPU Furiosa RNGD y versiones concretas de SDK (2026.4.0) y runtime (0.4.0); no es portable a GPU o CPU sin recompilación.
- El código adaptador incluido en el paquete no declara licencia separada, lo que puede generar incertidumbre legal para uso comercial aunque los pesos sean Apache-2.0.
- El autor advierte explícitamente que la validación estática y la publicación no constituyen una aceptación de inferencia en NPU; conviene revisar la evidencia de validación del release.
- Riesgo de seguridad: el paquete contiene kernels compilados y código ejecutable; solo deben cargarse paquetes de confianza.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones adicionales de la licencia upstream más allá de Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/softandsweet/black-forest-labs-flux-2-klein-4b-rngd-fxbex
- Modelo upstream FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Commit upstream fijado: `e7b7dc27f91deacad38e78976d1f2b499d76a294`
- Runtime FXBEX: https://github.com/smallstep-zzz/FXBEX
