# manateelazycat/MiniMax-H3-Duo-AIPod

## Resumen

MiniMax-H3-Duo-AIPod es un paquete de despliegue (no un modelo entrenado desde cero) publicado por el usuario manateelazycat que adapta el modelo de generación de vídeo a partir de texto MiniMax H3 a un clúster de dos nodos Jetson AGX Thor. El repositorio empaqueta pesos, imágenes de inferencia y artefactos de instalación (LPK) para ejecutar el modelo en paralelo entre dos dispositivos mediante cuatro enlaces ópticos de 25 Gbps, una adaptación del trabajo previo GaryLauLGY/MinimaxH3-Dual-Dgx-Spark que originalmente usaba dos DGX Spark.

El objetivo es llevar la generación de vídeo con audio a hardware de borde (edge) basado en Jetson Thor, un escenario donde una sola GPU no puede alojar el modelo. La versión documentada es la 0.2.1, que corrige un error de directorio al liberar modelos antiguos durante el despliegue y requiere la aplicación AI Pod 2.3.304 o superior.

La relevancia actual está en la medición rigurosa de rendimiento real sobre hardware modesto: generación completa de un vídeo de 832×480, 56 fotogramas y 24 fps (unos 2,33 segundos de vídeo) en una mediana de 37,77 segundos en caliente, con 33,38 segundos dedicados a los 20 pasos de muestreo. No se publican datos sobre la arquitectura interna del modelo base ni sobre sus parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniMax H3; el repo es una adaptación de despliegue multi-nodo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo menciona "precisión" en la tarjeta del mercado de modelos, sin detallar) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (license: other) |
| Formato de pesos | no disponible (repo de 62,5 GB; incluye pesos, imágenes de inferencia y LPK) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniMax H3 en la documentación proporcionada. El repositorio describe una topología de ejecución distribuida: dos Jetson AGX Thor conectados mediante cuatro puertos ópticos de 25 Gbps (100 Gbps teóricos agregados), con un adaptador TCP de cuatro enlaces validado por consistencia de datos CUDA, ya que Thor no dispone de RDMA. Se menciona una ruta de "parallelismo de secuencia" entre las dos máquinas, portada desde el proyecto Dual-Dgx-Spark.

El paquete incluye un mecanismo de caché condicional por prompt repetido (con verificación de consistencia al desactivarla), gestión de caché de driver CUDA (~7 MB) para reducir la latencia del primer request, y un bloqueo de host (Host lock) para coordinar el envío entre los dos nodos. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio asociado, en una sola tarea por petición.
- Control de resolución (width, height), número de fotogramas (frames), pasos de muestreo (steps) y semilla (seed) mediante API.
- API HTTP con dos endpoints: `POST /v2/video_generation` y `GET /v2/query/video_generation/{task_id}`, autenticada con Bearer API key.
- Ejecución distribuida en dos nodos con paralelismo de secuencia sobre enlaces de 25 Gbps.
- Caché condicional de prompt para acelerar peticiones repetidas.
- No se documenta soporte de tool calling, agentes, multi-step reasoning, visión de entrada, audio de entrada ni capacidades multilingües explícitas.
- No están abiertos en esta adaptación: imágenes de referencia, audio de referencia, LoRA ni el flujo de trabajo S02 del autor original.

## Casos de uso

- Generación de clips cortos para redes sociales: con 832×480, 56 fotogramas y 24 fps se obtienen vídeos de ~2,33 segundos con audio; útil para prototipos de contenido y pruebas de concepto en un clúster de borde.
- Prototipado de pipelines text-to-video en hardware Jetson: permite validar integraciones de API y flujos de generación sin depender de GPUs de centro de datos, gracias al despliegue en dos Thor.
- Investigación sobre inferencia distribuida en edge: el repo documenta latencias, caché de driver y coordinación de host, lo que lo convierte en una referencia para estudiar paralelismo de secuencia en enlaces sin RDMA.
- Demostraciones y ferias con hardware local: el paquete LPK y la integración con AI Pod permiten instalar y mostrar generación de vídeo en un dispositivo físico, con métricas de rendimiento medidas.
- Evaluación de coste/rendimiento frente a DGX Spark: al portar el mismo esquema de doble nodo desde DGX Spark a Thor, sirve para comparar latencias y viabilidad económica en entornos con restricciones de espacio y consumo.
- Automatización de contenido bajo demanda en entornos controlados: la API con Bearer key y la gestión de tareas asíncronas permiten integrar la generación en flujos internos, siempre que se respete la licencia comunitaria.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de latencia del despliegue, no benchmarks de calidad del modelo (MMLU, HumanEval, etc.), que no se han publicado.

| Métrica | Valor |
|---|---|
| Generación completa (mediana, 3 ejecuciones en caliente) | 37,77 s |
| Muestreo de 20 pasos (mediana) | 33,38 s |
| Espera HTTP (mediana) | 40,39 s |
| Generación completa (0.2.0, mediana) | 39,14 s |
| Muestreo 20 pasos (0.2.0) | 33,70 s |
| Repetición independiente (0.2.0) | 39,38 s completo / 33,94 s muestreo |
| Primer request con caché CUDA vacía | 222,66 s |
| Primer request tras restaurar caché de driver (~7 MB) | 91,62 s |
| Carga del modelo hasta listo | 32,27 s |
| Primer request tras reinicio real de ambos equipos | ~522 s (no atribuido, no válido como medida en caliente) |
| Especificación de vídeo | 832×480, 56 fotogramas, 24 fps (~2,33 s) |

Las tres ejecuciones en caliente del LPK final fueron 37,7873, 37,6816 y 37,7707 s. La consistencia de píxeles, audio y MP4 se verificó contra la referencia nativa en 10 vídeos de aceptación.

## Requisitos de hardware

- Dos nodos Jetson AGX Thor (obligatorio para el modo Duo descrito).
- Cuatro enlaces ópticos de 25 Gbps entre ambos nodos (100 Gbps teóricos agregados); no hay RDMA en Thor, se usa adaptador TCP de cuatro enlaces.
- Almacenamiento: el repositorio ocupa 62,5 GB (pesos, imágenes y artefactos); la imagen de inferencia no incluye pesos, que se descargan e importan vía Model Host.
- Memoria: no se especifica VRAM/RAM por nodo en la documentación.
- Despliegue: paquete LPK `cloud.lazycat.aipod.minimax-h3-duo` sobre AI Pod 2.3.304 / Agent 2.3.304 (mínimo); la imagen de inferencia se ejecuta con Docker y no requiere descarga ni build en el arranque.
- No cabe en GPU de consumo convencional (RTX 4090, etc.) según la información disponible; el diseño está pensado para Jetson Thor en clúster.
- Latencia y throughput: ver tabla de benchmarks (37,77 s por vídeo de 2,33 s en caliente; primer request de 91,62 a 222,66 s según caché).

## Comparativa con modelos similares

| Modelo | Tipo | Hardware | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-Duo-AIPod | Text-to-video distribuido | 2× Jetson AGX Thor | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (repo de despliegue) |
| GaryLauLGY/MinimaxH3-Dual-Dgx-Spark | Text-to-video distribuido | 2× DGX Spark | no disponible | no disponible | no disponible | Hugging Face (origen del port) |
| MiniMax H3 (base) | Text-to-video | no disponible | no disponible | no disponible | MiniMax H3 Community License | no disponible en la información |

No se dispone de datos de parámetros, contexto ni benchmarks de calidad para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio es un artefacto de despliegue, no un modelo entrenado; su valor depende del modelo base MiniMax H3 y de la licencia comunitaria asociada.
- Licencia MiniMax H3 Community License: es necesario revisar sus términos antes de cualquier uso comercial; el autor indica que adaptador y dependencias conservan sus propias licencias (ver NOTICE y docs/licenses/).
- Solo se ha validado la generación de texto a vídeo con audio; no están abiertos referencia de imagen, referencia de audio, LoRA ni el flujo S02.
- Una sola tarea por petición; no se documenta concurrencia más allá de la caché condicional de prompt.
- Latencia de primer request muy alta (91,62 s con caché de driver restaurada; 222,66 s con caché CUDA vacía) y caso observado de ~522 s tras reinicio real, no atribuido.
- Dependencia estricta de versiones de AI Pod y Agent (2.3.304) y de la topología de cuatro enlaces ópticos; no es portable a configuraciones arbitrarias.
- No se publican datos sobre sesgos, alucinación, idiomas soportados ni calidad cualitativa del vídeo generado.
- El estado de revisión en la tienda de aplicaciones se documenta como "en revisión" en el momento de la model card; no debe asumirse disponibilidad pública general.

## Enlaces

- Hugging Face: https://huggingface.co/manateelazycat/MiniMax-H3-Duo-AIPod
- Licencia: https://huggingface.co/manateelazycat/MiniMax-H3-Duo-AIPod/resolve/bb270fda3ae9d1ad057732c93ba7ca7da121a0db/models/license/LICENSE
- Repositorio de origen (Dual-Dgx-Spark): https://huggingface.co/GaryLauLGY/MinimaxH3-Dual-Dgx-Spark
- Informe de rendimiento: docs/PERFORMANCE_REPORT.md (dentro del repo)
- Contrato de API: docs/API.md (dentro del repo)
- Artefacto de instalación: release/cloud.lazycat.aipod.minimax-h3-duo-0.2.1.lpk (dentro del repo)
- Evidencias de aceptación: evidence/release-0.2.1.json, evidence/runtime-production-acceptance.json, evidence/driver-cache-acceptance.json (dentro del repo)
