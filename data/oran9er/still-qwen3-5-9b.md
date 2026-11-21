# oran9er/STILL-Qwen3.5-9B

## Resumen

STILL-Qwen3.5-9B es un ajuste fino completo del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por oran9er (Jinjie Xie, Baihua Li y Qinggang Meng, Universidad de Loughborough) como componente verificador de objetos del sistema STILL. El modelo resuelve un problema concreto: determinar si un objeto sigue en su sitio entre dos capturas de una misma escena realizadas en visitas distintas, respondiendo con una de tres etiquetas (`same`, `changed`, `unseen`) a partir de dos vistas de la misma hipótesis de cambio.

El modelo forma parte del pipeline descrito en el artículo *Is It Still There? Place-Registered Verification Makes VLMs Reliable Scene-Change Detectors* (arXiv:2611.18734). Las hipótesis de cambio las genera SceneDiff, la etapa de registro $\pi^3$ alinea cada hipótesis con su lugar en la otra captura, y este checkpoint responde a la pregunta de verificación desde la vista de escena (cinco fotogramas por visita) o desde la vista de lugar (dos recortes alineados).

Con 9.409.813.744 parámetros, licencia Apache-2.0 y pesos en safetensors/bf16, es un modelo de nicho orientado a detección de cambios de escena, robótica de inspección y tareas de verificación multi-vista. No está pensado como modelo conversacional general, sino como clasificador probabilístico de tres clases integrado en un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B; arquitectura exacta no disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers, bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de Qwen3.5-9B en bf16, durante una época, con tasa de aprendizaje 2e-6 y tamaño de lote efectivo 16. El entrenamiento sigue la receta TV2PK del artículo y se implementa en `scripts/still_sft.py` del repositorio de código. Los datos de entrenamiento combinan escenas de entrenamiento SceneDiff SD-V (con las 10 escenas de desarrollo listadas en `data/dev_scenes.json` reservadas para validación) y pares sintéticos KC-3D de CYWS-3D, formulados como preguntas de vista de escena y de vista de lugar.

El checkpoint publicado fue reentrenado con el código liberado usando la semilla 2; el artículo reporta tres ejecuciones. La innovación técnica no reside en la arquitectura sino en el protocolo de consulta: el modelo no genera texto libre, sino que se leen las probabilidades del primer token de respuesta para `same`, `changed` y `unseen`, que se renormalizan. La puntuación de cambio de una hipótesis se calcula como `sqrt(P_scene(changed) * P_place(changed))`, o `P_scene(changed)` cuando no se pudo registrar el lugar; con propuestas de SceneDiff, la puntuación final se multiplica por `c^a`, donde `c` es la puntuación de región de SceneDiff. Se usa la plantilla de chat con `enable_thinking=False`.

## Capacidades

- Verificación de cambios de escena: responde si un objeto sigue en su lugar entre dos visitas, con tres etiquetas (`same`, `changed`, `unseen`).
- Razonamiento multi-vista: procesa cinco fotogramas por visita en vista de escena, o dos recortes alineados en vista de lugar.
- Comprensión de coordenadas: interpreta cajas delimitadoras en coordenadas normalizadas 0-1000 sobre la imagen.
- Clasificación probabilística calibrada: expone probabilidades por token para las tres clases, aptas para umbralización y fusión con otras señales.
- Entrada imagen-texto: pipeline `image-text-to-text` con procesador y plantilla de chat estándar de transformers.
- Sin soporte documentado de tool calling, function calling, agentes, audio ni modo thinking (se desactiva explícitamente).

## Casos de uso

- Inspección de obras y mantenimiento industrial: comparar capturas de una misma instalación en visitas sucesivas y detectar objetos retirados o desplazados, usando la vista de escena con cinco fotogramas por visita para cubrir ángulos distintos.
- Vigilancia de inventario en almacenes: verificar si un artículo sigue en su ubicación registrada entre rondas de inventario, aprovechando la vista de lugar para confirmar coincidencias tras el registro $\pi^3$.
- Monitorización de entornos remotos con cámaras móviles: al grabarse las visitas con trayectorias de cámara distintas, el modelo tolera cambios de punto de vista y responde `unseen` cuando el lugar no aparece en la segunda captura.
- Auditoría de espacios públicos o patrimoniales: detectar la desaparición de elementos (señalización, mobiliario, piezas expuestas) comparando visitas periódicas con SceneDiff como generador de hipótesis.
- Robótica de inspección: integrar el verificador como etapa final de un pipeline que propone candidatos de cambio y necesita una confirmación fiable antes de actuar o alertar.
- Control de calidad en logística: comprobar que una carga o embalaje permanece en su posición entre la recepción y la salida, con umbral ajustable sobre las probabilidades de `changed`.
- Investigación en visión por computador: servir como componente reproducible para experimentos de detección de cambios, dado que el código, la receta de entrenamiento y la semilla están publicados.

## Benchmarks y rendimiento

Resultados en el conjunto de test SceneDiff SD-V con el protocolo de salida VLM del artículo, punto de operación elegido sobre las escenas de desarrollo SD-V (`scripts/fuse_sdiff.py`: a = 2, umbral 6.7e-4).

| Modelo | AP | F1 |
|---|---|---|
| Este checkpoint (semilla 2) | 58.1 | 59.9 |
| Artículo, tres ejecuciones (rango) | 56.0 a 59.2 | 59.4 a 62.4 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para pesos (9.409.813.744 parámetros × 2 bytes), más memoria para el procesador de imagen y activaciones; el repositorio ocupa 18.8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; una RTX 4090 (24 GB) puede ser ajustada y requiere validación empírica.
- Cuantización: no se han publicado pesos GGUF ni cuantizados por el autor; no hay datos de VRAM para cuantizaciones de 8 o 4 bits.
- Despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (código de ejemplo en la model card). No se documenta soporte específico de vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STILL-Qwen3.5-9B | 9.41 B | no disponible | Verificación de cambios de escena (3 clases) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base) | ~9 B (no confirmado en la información) | no disponible | Multimodal general, imagen-texto | no disponible en la información | Hugging Face |
| SceneDiff | no disponible | no disponible | Generación de hipótesis de cambio de escena | MIT | Repositorio del proyecto |

No se dispone de datos de benchmarks de modelos alternativos de verificación de cambios de escena en la información proporcionada; la comparación con el modelo base y con SceneDiff se limita a función y licencia.

## Limitaciones y advertencias

- Modelo de nicho: no es un asistente conversacional general; su salida útil son las probabilidades de tres tokens, no texto libre.
- Dependencia del pipeline: el rendimiento reportado (AP 58.1, F1 59.9) corresponde a la puntuación fusionada con propuestas de SceneDiff y un umbral concreto; con otras propuestas o datos hay que recalibrar el umbral.
- La etiqueta `unseen` cuenta como ausencia de cambio, lo que puede enmascarar cambios reales cuando el lugar no aparece en la segunda visita.
- Riesgo de alucinación en la respuesta de texto si se usa fuera del protocolo previsto; el autor recomienda leer solo las probabilidades del primer token.
- Idiomas soportados no documentados; los prompts de referencia están en inglés y el ajuste fino se realizó sobre ese formato.
- Datos de entrenamiento: KC-3D proviene del repositorio CYWS-3D, que no declara licencia, lo que conviene revisar para uso comercial.
- Licencia Apache-2.0 en los pesos, heredada del modelo base Qwen3.5-9B; SceneDiff se distribuye bajo MIT.
- Sin datos publicados sobre sesgos, contexto máximo ni comportamiento en dominios distintos de la detección de cambios de escena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oran9er/STILL-Qwen3.5-9B
- Código del proyecto STILL: https://github.com/Oran9er/STILL
- Artículo (arXiv): https://arxiv.org/abs/2611.18734
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
