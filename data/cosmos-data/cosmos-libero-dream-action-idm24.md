# Cosmos-Data/cosmos-libero-dream-action-idm24

## Resumen

Cosmos LIBERO-40 Dreamed Video and Action (IDM24) es un checkpoint de política robótica video-acción desarrollado por Cosmos-Data, publicado en Hugging Face bajo el pipeline `robotics`. Se trata de una continuación del baseline Cosmos LIBERO-40 ID-only 4k, entrenado sobre pares video-acción del conjunto LIBERO-40 combinados con 24 pares video-acción OOD (out-of-distribution) generados mediante un modelo de vídeo "soñado" y filtrados por un IDM (inverse dynamics model), con un peso de muestreo ID:OOD de 5:1.

El modelo se distribuye como una política conjunta de vídeo y acción en formato BF16 Safetensors, empaquetada en dos carpetas de checkpoint (`plus250` y `plus1000`) que representan 250 y 1.000 actualizaciones adicionales del optimizador desde la inicialización de 4k pasos. El repositorio ocupa 60,7 GB e incluye configuración, índice, shards y ficheros de tokenizer para cada checkpoint.

La relevancia de este modelo reside en su enfoque de aumento de datos sintéticos para robótica: el uso de vídeo generado y revisado por IDM para complementar demostraciones reales escasas. Está pensado para cargarse con el Cosmos Framework y su dependencia del VAE Wan 2.2, y su ámbito declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política conjunta video-acción basada en Cosmos Framework (no se detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (Safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) + config, index, shards y tokenizer |

## Arquitectura y entrenamiento

El modelo es una política conjunta de vídeo y acción construida sobre el Cosmos Framework, que emplea el VAE de Wan 2.2 como dependencia de runtime. La model card no detalla la arquitectura interna (número de parámetros, tipo de transformer, mecanismo de atención ni longitud de contexto), por lo que estos datos no están disponibles.

El entrenamiento parte del baseline Cosmos LIBERO-40 ID-only 4k y continúa con actualizaciones adicionales del optimizador. La mezcla de datos combina pares video-acción originales de LIBERO-40 con 24 pares video-acción OOD "soñados" (vídeo generado) revisados por un IDM, con un peso de muestreo ID:OOD de 5:1. Los checkpoints publicados (`plus250` y `plus1000`) corresponden a 250 y 1.000 actualizaciones adicionales respectivamente desde la misma inicialización de 4k pasos. No se documentan detalles sobre volumen total de tokens, composición completa del dataset ni uso de RLHF/DPO.

## Capacidades

- Política robótica video-acción: predice acciones a partir de observaciones visuales en entornos de manipulación tipo LIBERO.
- Modelado conjunto de vídeo y acción, orientado a tareas de control desde píxeles.
- Entrenamiento con aumento de datos sintéticos (vídeo "soñado") filtrado por IDM para mejorar la generalización OOD.
- Ámbito de evaluación centrado en el benchmark LIBERO-40.
- Idioma declarado: inglés.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: servir como checkpoint de referencia para estudiar el efecto del aumento de datos sintéticos (vídeo soñado) frente al baseline ID-only en tareas LIBERO-40.
- Evaluación de políticas video-acción: cargar `plus250` o `plus1000` con el loader LIBERO del Cosmos Framework para comparar el impacto de 250 frente a 1.000 actualizaciones adicionales.
- Estudio de generalización OOD: analizar cómo el muestreo 5:1 ID:OOD afecta al rendimiento en escenarios fuera de distribución dentro de LIBERO.
- Reproducción de experimentos: el repositorio incluye config, index, shards y tokenizer, lo que permite reproducir la carga y la inferencia con el runtime de Cosmos.
- Base para fine-tuning en manipulación: partir de estos pesos BF16 para adaptar la política a nuevas tareas de manipulación con datos propios.
- Integración en pipelines de simulación robótica: usar el modelo como componente de política en entornos simulados compatibles con LIBERO para generar trayectorias de acción.
- Comparación de metodologías de datos sintéticos: contrastar con otros checkpoints de la familia Cosmos LIBERO para medir la contribución del filtrado por IDM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 60,7 GB y los pesos se distribuyen en BF16, por lo que se requiere hardware con memoria suficiente para cargar los shards completos (orientativo: GPUs de datacenter con 80 GB o más para carga holgada en BF16).
- GPU recomendadas: no disponible en la documentación; por el tamaño en BF16 se orienta a A100/H100 de 80 GB.
- ¿Cabe en consumer GPU?: no se documenta; el tamaño del repo (60,7 GB) hace improbable la carga completa en GPUs de consumo de 24 GB en BF16 sin cuantización adicional, que no está documentada.
- Opciones de despliegue: Cosmos Framework con el loader de política LIBERO y la dependencia del VAE Wan 2.2. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cosmos-libero-dream-action-idm24 | no disponible | no disponible | no disponible | Política video-acción con 24 pares OOD soñados, peso 5:1 |
| cosmos-libero-noood-baseline-gbs2048-4k | no disponible | no disponible | no disponible | Baseline ID-only 4k del que deriva este checkpoint |
| Otros checkpoints de la familia Cosmos LIBERO | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La model card no especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- El ámbito declarado es únicamente inglés y el dominio es robótica de manipulación (LIBERO-40); no es un modelo de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse con vídeo sintético "soñado" existe riesgo de que la política aprenda artefactos del generador de vídeo.
- El rendimiento depende del filtrado por IDM y del peso 5:1 ID:OOD; no se publican métricas que cuantifiquen la mejora frente al baseline.
- Requiere el Cosmos Framework y el VAE Wan 2.2 como dependencias de runtime, lo que limita la portabilidad.
- El tamaño del repositorio (60,7 GB) y los pesos en BF16 implican requisitos de memoria elevados.
- Sin datos de benchmarks, no es posible validar el rendimiento en producción ni comparar objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cosmos-Data/cosmos-libero-dream-action-idm24
- Baseline de referencia: https://huggingface.co/Cosmos-Data/cosmos-libero-noood-baseline-gbs2048-4k
- Descarga del checkpoint `plus250`: https://huggingface.co/Cosmos-Data/cosmos-libero-dream-action-idm24/tree/main/plus250
- Descarga del checkpoint `plus1000`: https://huggingface.co/Cosmos-Data/cosmos-libero-dream-action-idm24/tree/main/plus1000
