# high-tech-system/Hy4-flash-NVFP4-vLLM-SM120

## Resumen

Hy4-flash-NVFP4-vLLM-SM120 es un repositorio de despliegue de inferencia, no un modelo entrenado desde cero. Lo publica el usuario `high-tech-system` (HTS) y empaqueta una configuración de vLLM optimizada para servir el checkpoint cuantizado en NVFP4 `atakans/Hy4-flash-NVFP4`, que a su vez deriva del modelo original Tencent Hy4 Flash. El objetivo es habilitar la inferencia del modelo en GPUs Blackwell con arquitectura SM120, un objetivo que el stack estándar de vLLM no cubre de forma directa.

El repositorio aporta seis capas de compatibilidad adaptadas del proyecto DGX Spark recipes (enrutado de atención, comportamiento de atención sink-aware, integración del modelo, configuración DFly, adaptación de la capa MLA e integración del backend SM120 sobre FlashInfer) y una contribución propia de HTS: un recorte del ancho de índice en la atención de ventana deslizante (SWA trim) que reduce los datos enviados al kernel durante el prefill. La configuración probada emplea dos NVIDIA RTX PRO 6000 Blackwell Workstation Edition con tensor parallel de 2, BF16 como precisión de cómputo, longitud máxima de 262.144 tokens y caché KV FP8 DS MLA de 34 GiB por GPU.

Es relevante ahora porque el ecosistema de inferencia para Blackwell SM120 aún requiere parches específicos para modelos con atención MLA y ventana deslizante, y este repositorio documenta una receta reproducible con versiones fijadas por digest. No obstante, el propio autor advierte de que solo se ha validado en esa configuración de hardware concreta y que los perfiles de rendimiento con GenAI-Perf están pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención MLA (multi-head latent attention), ventana deslizante (SWA) y decodificación especulativa DFly; detalles completos en la model card de Tencent Hy4 Flash |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (longitud máxima configurada en el despliegue probado) |
| Tipos de cuantizacion | NVFP4 (checkpoint `atakans/Hy4-flash-NVFP4`); cómputo en BF16; caché KV en FP8 DS MLA |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (`tencent-hy-license`, categoría `other`) |
| Formato de pesos | no disponible en esta página; el checkpoint NVFP4 referenciado se sirve mediante vLLM |

## Arquitectura y entrenamiento

El modelo subyacente, Tencent Hy4 Flash, emplea una arquitectura transformer con capas de atención MLA (multi-head latent attention), mecanismo de atención con ventana deslizante y decodificación especulativa mediante DFly. El repositorio de HTS no documenta el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO); esos datos deben consultarse en la model card de Tencent Hy4 Flash. Lo que sí describe con detalle es la infraestructura de inferencia: seis overlays de compatibilidad que conectan las implementaciones de atención e indexado del modelo con el backend sparse MLA de FlashInfer para SM120, validan el checkpoint y los ajustes de runtime, y adaptan la capa MLA a las rutas de caché y proyección del modelo.

La innovación técnica propia de este repositorio es el SWA index-width trim, implementado en `patches/swa_index_trim.py` y conectado a la ruta SM120 en `patches/sm120.py`. Elimina entradas de índice que el kernel de ventana deslizante no utiliza, reduciendo el volumen de datos que atraviesa ese kernel durante el prefill de prompts. Es el único componente con conmutador de runtime (`HY4_SWA_TRIM`); los seis overlays de terceros son obligatorios para esta base de vLLM fijada. La decodificación especulativa probabilística DFly no está incluida en la imagen.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales de imagen y texto.
- Razonamiento y generación autoregresiva multi-turno con ventanas de contexto de hasta 262.144 tokens en la configuración probada.
- Soporte de atención con ventana deslizante y MLA, adecuado para prompts largos con coste de memoria controlado mediante caché KV en FP8.
- Decodificación especulativa DFly disponible en la arquitectura del modelo, aunque la variante probabilística no se incluye en esta imagen de inferencia.
- Servicio concurrente por peticiones mediante vLLM con tensor parallel de 2 y límite de 8.192 tokens por lote.
- Descarga de trabajo en CPU mediante Engram CPU offload, lo que permite liberar memoria de GPU en el despliegue probado.
- Capacidades de tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Servicio de modelos multimodales en clústeres Blackwell: el repositorio permite desplegar el checkpoint NVFP4 de Hy4 Flash en GPUs SM120 donde el vLLM estándar no arranca sin los overlays de compatibilidad, usando tensor parallel de 2 sobre dos RTX PRO 6000.
- Procesamiento de documentos largos con imagen y texto: con 262.144 tokens de contexto y caché KV FP8 de 34 GiB por GPU, es viable alimentar expedientes, informes escaneados o contratos completos en una sola petición.
- Investigación en cuantización NVFP4: sirve como banco de pruebas reproducible (versiones fijadas por digest) para medir el impacto de FP4 en calidad y latencia frente a BF16 en hardware Blackwell.
- Evaluación de optimizaciones de atención dispersa: el conmutador `HY4_SWA_TRIM` permite comparar prefill con y sin recorte de índice SWA manteniendo el resto de la configuración constante, útil para estudiar cuellos de botella en prompts largos.
- Backend de agentes con prompts extensos: el límite de 8.192 tokens por lote y el offload de CPU facilitan servir flujos de agente con historial acumulado y generación encadenada, siempre que se dimensione la concurrencia según la mezcla de prompt y salida.
- Validación de recetas de despliegue en estaciones de trabajo: el proyecto está pensado para equipos que necesitan una imagen Docker con parches documentados y trazabilidad de PRs de vLLM revisados, en lugar de un servicio gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los perfiles de prefill y generación de tokens con NVIDIA GenAI-Perf están pendientes, así como la comparación emparejada del SWA trim con `HY4_SWA_TRIM` activado y desactivado. El autor advierte además que las tasas puras de prefill y decode no predicen el throughput sostenido de flujos de agente, que depende de la mezcla de tokens de entrada y salida, la concurrencia y la planificación del servidor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra agregada; la configuración probada reserva 34 GiB de caché KV por GPU además de los pesos NVFP4 y el offload de CPU.
- GPU validadas: dos NVIDIA RTX PRO 6000 Blackwell Workstation Edition (SM120) con límite de potencia de 360 W por GPU. Es la única configuración que el autor declara como probada.
- Consumer GPU: no hay evidencia de que funcione en GPUs de consumo; el requisito de SM120 y la receta de doble GPU apuntan a estaciones de trabajo profesionales Blackwell.
- DGX Spark: mencionado como objetivo posible por la reutilización de sus recetas de compatibilidad, pero no probado.
- Opciones de despliegue: vLLM sobre la imagen Hy4-preview con revisión `77766db` fijada por digest `sha256:f4c3ca45840d5612d673b9723f8a82740707a2e5ff06c02df03246f4276a7c69`; tensor parallel 2, BF16 de cómputo, 262.144 de longitud máxima, 8.192 tokens por lote, caché KV FP8 DS MLA y Engram CPU offload.
- Latencia y throughput: no disponibles; pendientes de medición con GenAI-Perf mediante el runner del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-NVFP4-vLLM-SM120 (este repositorio) | no disponible | 262.144 tokens (config. probada) | NVFP4, caché KV FP8 | Tencent Hy License | Hugging Face, 0 descargas |
| Tencent Hy4 Flash (modelo original) | no disponible | no disponible | BF16 y otras | Tencent Hy License | Hugging Face (tencent/Hy4-flash) |
| atakans/Hy4-flash-NVFP4 (checkpoint) | no disponible | no disponible | NVFP4 | Tencent Hy License | Hugging Face (revisión fijada) |

No se dispone de datos de rendimiento ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría. Las tres entradas de la tabla son variantes del mismo modelo base y no modelos competidores independientes.

## Limitaciones y advertencias

- El repositorio no aloja pesos: solo describe y empaqueta una configuración de inferencia; la licencia y las condiciones de uso las fija Tencent Hy License, que debe revisarse antes de cualquier uso comercial.
- Validación limitada: solo se ha probado en dos RTX PRO 6000 Blackwell Workstation Edition con SM120 y 360 W por GPU; no se reclama funcionamiento en otras GPUs, checkpoints o configuraciones.
- Los seis overlays de compatibilidad de terceros son obligatorios y no conmutables; solo el SWA trim de HTS puede activarse o desactivarse en runtime.
- La decodificación especulativa probabilística DFly no está incluida en la imagen, por lo que el rendimiento puede diferir del modelo original completo.
- Sin métricas publicadas: no hay cifras de latencia, throughput ni calidad que permitan estimar el comportamiento en producción; las comparaciones de GenAI-Perf están pendientes.
- Riesgo de alucinación, sesgos e idiomas soportados: no disponible en la información proporcionada; deben consultarse en la model card de Tencent Hy4 Flash.
- La ficha del repositorio tiene 0 descargas y 0 likes y fue creada y actualizada el mismo día (21 de noviembre de 2026), lo que sugiere una validación comunitaria inexistente.
- El límite de 8.192 tokens por lote y el offload de CPU condicionan el throughput en cargas de alta concurrencia; el autor insiste en que las tasas puras de prefill y decode no son extrapolables a flujos de agente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/high-tech-system/Hy4-flash-NVFP4-vLLM-SM120
- Modelo original Tencent Hy4 Flash: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Checkpoint NVFP4 utilizado: https://huggingface.co/atakans/Hy4-flash-NVFP4 (revisión `30f201acf0b4f9ba178817bcbc04ccfa3ec473f9`)
- Recetas de compatibilidad DGX Spark: https://github.com/atakann/dgx-spark-recipes
- Código y parches de inferencia de HTS: https://github.com/high-tech-system/hts_vllm_hy4_flash_nvfp4
- Runner de benchmarks GenAI-Perf: https://github.com/high-tech-system/hts_vllm_hy4_flash_nvfp4/blob/main/benchmarks/run_genai_perf.sh
- Parche SWA trim: https://github.com/high-tech-system/hts_vllm_hy4_flash_nvfp4/blob/main/patches/swa_index_trim.py
- Integración SM120: https://github.com/high-tech-system/hts_vllm_hy4_flash_nvfp4/blob/main/patches/sm120.py
- Tabla de compatibilidad del README: https://github.com/high-tech-system/hts_vllm_hy4_flash_nvfp4#what-this-inference-setup-adds-from-third-parties
- PR de vLLM revisado (no incluido): https://github.com/vllm-project/vllm/pull/54563
- PR de vLLM revisado (no incluido): https://github.com/vllm-project/vllm/pull/68365
