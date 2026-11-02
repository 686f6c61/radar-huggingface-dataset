# prithivMLmods/VIGOR-27B-GGUF

## Resumen

VIGOR-27B (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal de 27.320.697.856 parámetros (denso, no MoE) desarrollado por prithivMLmods y publicado en HuggingFace bajo licencia Apache 2.0. Está construido sobre Qwen/Qwen3.8-27B y su propósito es la clasificación de seguridad de contenido visual: analiza imágenes para determinar si son seguras (Safe) o no seguras (NSFW), con un umbral conservador orientado a control parental y protección de menores. La versión aquí descrita, VIGOR-27B-GGUF, es la cuantización en formato GGUF del modelo original, publicada el 1 de noviembre de 2026.

El modelo resuelve un problema concreto de moderación multimodal: la necesidad de un clasificador que no solo etiquete, sino que razone y describa por qué una imagen es sensible, analizando ropa, exposición corporal, poses, encuadre y contexto. Es relevante ahora porque integra decodificación especulativa mediante Multi-Token Prediction (MTP) directamente en los pesos del GGUF, lo que acelera la inferencia local sin requerir un modelo draft separado, y porque ofrece un pipeline de clasificación estructurada en JSON listo para integrarse en guardarraíles de producción.

La ficha se centra en la variante GGUF, que incluye un fichero de proyección multimodal (mmproj) y cuantizaciones desde BF16 hasta Q3_K_L. El modelo está pensado para investigación y clasificación de seguridad de contenido, no como generador de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso basado en Qwen/Qwen3.8-27B (visión + lenguaje) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en la prueba de referencia publicada (no se especifica el máximo oficial) |
| Tipos de cuantizacion | BF16, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K; proyección multimodal mmproj-bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para visión) |

## Arquitectura y entrenamiento

VIGOR-27B es un transformer denso de 27.320 millones de parámetros que combina un codificador visual con un modelo de lenguaje Qwen/Qwen3.8-27B. La variante GGUF incorpora Multi-Token Prediction (MTP): cabezas de salida adicionales dentro de la arquitectura principal que predicen varios tokens futuros en una sola pasada, actuando como decodificación especulativa integrada sin necesidad de un modelo draft externo. El pipeline es image-text-to-text: recibe imagen y prompt, y devuelve texto estructurado.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card indica que el modelo está orientado a clasificación de seguridad visual y que se debe usar con un prompt estándar que fuerza salida JSON con claves fijas (`scene_description`, `is_nsfw`, `classification_reason`, `nsfw`, `safe`). Los tags mencionan soporte de plantillas con "thinking off" (por defecto) y "thinking on" (razonamiento).

## Capacidades

- Análisis visual detallado de imágenes: descripción objetiva de sujeto, ropa, exposición corporal, pose y contexto.
- Clasificación binaria Safe / NSFW con umbral conservador (ante la duda, NSFW).
- Salida estructurada en JSON con esquema fijo, adecuada para pipelines automatizados.
- Razonamiento sobre el motivo de la clasificación (`classification_reason`).
- Detección de contenido sensible: desnudos, ropa reveladora, lencería, trajes de baño sugerentes, ropa transparente, arte anime ecchi/hentai, poses sexualizadas y actos sexuales explícitos.
- Decodificación especulativa MTP integrada para acelerar inferencia local.
- Modo de razonamiento opcional mediante plantilla (thinking on/off).
- Capacidades multimodales imagen-texto a texto (pipeline image-text-to-text).
- Soporte de inferencia vía llama.cpp y text-generation-inference según los tags del repositorio.

## Casos de uso

- Moderación de contenido en plataformas de imágenes y vídeo: el modelo recibe cada imagen y devuelve un JSON con `is_nsfw`, `nsfw` y `safe`, permitiendo filtrado automático previo a revisión humana. Su umbral conservador encaja en flujos donde un falso negativo es más costoso que un falso positivo.
- Control parental y protección de menores: el prompt estándar está diseñado explícitamente para este escenario, clasificando como NSFW cualquier desnudo, desnudo parcial, lencería o pose sugerente, lo que permite bloquear contenido en entornos infantiles.
- Guardarraíl previo a generación de imágenes o vídeo: integrado como clasificador de entrada en pipelines de difusión, evita que prompts o imágenes de referencia sensibles entren en el sistema.
- Auditoría y revisión de datasets de visión: el modelo puede procesar lotes de imágenes y generar descripciones objetivas junto con la etiqueta de seguridad, facilitando la limpieza de corpus antes del entrenamiento.
- Cumplimiento normativo y trust & safety: la salida JSON con razón de clasificación sirve como registro auditable de por qué una imagen fue marcada, útil para informes de moderación y revisiones de cumplimiento.
- Moderación de comunidades de fan art y manga: detecta arte anime ecchi, hentai y poses sexualizadas 2D/3D, un caso que los clasificadores genéricos suelen fallar.
- Filtrado en foros y redes sociales con despliegue local: gracias a las cuantizaciones GGUF (desde 14,6 GB en Q3_K_L) y al MTP, puede ejecutarse en hardware propio sin depender de APIs externas, reduciendo costes y manteniendo la privacidad de las imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye una prueba de rendimiento de inferencia con el fichero BF16:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.009,28 tokens/s |
| Velocidad media de generación | 48,97 tokens/s |
| Tiempo total de pared | 52,4 s |
| Longitud de contexto | 16.384 tokens |
| Caché KV (K) | q8_0 |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition |
| VRAM de GPU | 96 GB |
| Pico de VRAM usada | 52,17 GiB |
| Uso pico de GPU | 98% |
| Capas offloaded | 99 (`-ngl 99`) |
| Semilla | 42 |
| Decodificación especulativa | MTP (`draft_n_max=2`) |
| Repeticiones | 3 |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de fichero): BF16 54,7 GB; Q6_K 22,4 GB; Q5_K_M 19,5 GB; Q4_K_M 16,8 GB; Q3_K_L 14,6 GB. Añadir aproximadamente 931 MB para el fichero mmproj-bf16.
- En la prueba publicada con BF16 y contexto de 16.384 tokens, el pico de VRAM fue de 52,17 GiB, por lo que se necesita una GPU de al menos 64 GB para BF16 con ese contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) validada por el autor; para BF16 también encajan A100 80 GB, H100 80 GB y H200. Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 5090 (32 GB) pueden alojar el modelo con offloading parcial o total según contexto.
- Cabe en GPU de consumo: sí, en cuantizaciones Q3_K_L, Q4_K_M y Q5_K_M con GPUs de 24 GB o más, dependiendo de la longitud de contexto y del número de capas offloaded.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con `-ngl 99` y MTP (`draft_n_max=2`), text-generation-inference y transformers según los tags. El autor recomienda el setup basado en Transformers y considera el GGUF experimental.
- Latencia y throughput: 48,97 tokens/s de generación y 1.009,28 tokens/s de procesamiento de prompt en la configuración de referencia (RTX PRO 6000 Blackwell, BF16, contexto 16.384, KV q8_0, MTP activo).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría (clasificadores multimodales de seguridad). Se indica "no disponible". Cualitativamente, la propuesta se distingue por ser un modelo denso de 27B con salida JSON estructurada y MTP integrado en GGUF, frente a clasificadores más pequeños de tipo CLIP o modelos de moderación propietarios, pero no hay cifras que permitan contrastar rendimiento.

## Limitaciones y advertencias

- El modelo solo soporta inglés; el prompt estándar y la salida están en ese idioma.
- Riesgo de alucinación en la descripción de escenas y en la justificación de la clasificación; la salida JSON debe validarse antes de actuar sobre ella.
- Umbral conservador deliberado: clasifica como NSFW ante la duda, lo que puede generar falsos positivos en imágenes legítimas (playa, arte, ropa de baño no sexualizada).
- Sesgos no documentados: no se han publicado análisis de sesgos por género, etnia, edad percibida o cultura; un clasificador de este tipo puede sobrerreaccionar ante determinados cuerpos o vestimentas.
- La variante GGUF es experimental según el propio autor, que recomienda el setup basado en Transformers para uso serio.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que el modelo es solo para investigación y clasificación de seguridad, y descarga toda responsabilidad sobre las salidas generadas.
- No se especifica la longitud máxima de contexto oficial; la prueba se hizo con 16.384 tokens.
- No se han publicado datos de entrenamiento, composición del dataset ni proceso de alineación, lo que dificulta evaluar su robustez fuera del dominio de moderación.
- El rendimiento medido corresponde a una GPU de gama muy alta (RTX PRO 6000 Blackwell, 96 GB); en GPUs de consumo el throughput será menor.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-27B
- Fichero BF16: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.Q4_K_M.gguf
- Fichero mmproj: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.mmproj-bf16.gguf
- Modelo Qwen base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
