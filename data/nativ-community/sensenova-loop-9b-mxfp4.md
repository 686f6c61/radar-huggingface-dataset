# nativ-community/SenseNova-Loop-9B-mxfp4

## Resumen

SenseNova-Loop-9B-mxfp4 es una conversión cuantizada a 4 bits en formato MLX del modelo vision-language SenseNova-Loop-9B, desarrollado originalmente por SenseNova (sensenova) y adaptado por la comunidad nativ-community para su ejecución en Apple Silicon. El modelo acepta entradas de texto e imagen y produce salida de texto, empleando una arquitectura de transformer con bucles ("looped transformer") en la que 32 capas físicas del decodificador se ejecutan como 56 visitas, cada una con su propia caché. Cuenta con 9.412.959.856 parámetros totales y está diseñado para flujos conversacionales multimodales.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~9.400 millones de parámetros con capacidades de visión en hardware de Apple mediante cuantización mxfp4 (4 bits, grupo de 32), reduciendo el peso de los archivos a 5,683 GB. La torre de visión permanece en BF16 y los pesos del router mHC se mantienen en FP32 idénticos al checkpoint original, lo que busca preservar la fidelidad del enrutamiento.

El modelo se publica bajo licencia Apache-2.0 y soporta inglés y chino. Es una opción orientada a desarrolladores que trabajan en el ecosistema MLX/Apple y necesitan inferencia local de un VLM con razonamiento y descripción de imágenes, aunque la validación publicada por el autor se limita a pruebas de humo (smoke checks) y no a benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer vision-language (sensenova_loop), decodificador con 32 capas físicas ejecutadas como 56 visitas |
| Parametros totales | 9.412.959.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K (límite declarado; no validado según el autor) |
| Tipos de cuantizacion | 4 bits mxfp4, grupo de 32; torre de visión en BF16; router mHC en FP32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), cuantizado 4-bit; repositorio de 5,7 GB, archivos de pesos de 5,683 GB (5,293 GiB) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles: 32 capas físicas del decodificador se reutilizan a lo largo de 56 visitas, cada una con una caché independiente. Incorpora un router mHC (multi-head routing) cuyos pesos y sesgos se conservan en FP32 y coinciden byte a byte con los tensores del checkpoint original. La conversión omite la compuerta de bucle ("loop gate") que solo se usaba durante el entrenamiento. La torre de visión se mantiene en BF16 para no degradar la representación visual.

La conversión se realizó directamente desde el checkpoint en coma flotante original (revisión `329a65f`) usando MLX 0.32.4, con el comando `mlx_vlm convert` en modo `--q-mode mxfp4`, `--q-bits 4` y `--q-group-size 32`. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa: de hecho, el verificador especulativo fusionado de Qwen3.5 no está soportado y es rechazado por la implementación.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y descripción de las mismas (image-text-to-text).
- Soporte de múltiples imágenes mediante lista ordenada y `num_images=len(images)`.
- Modo de razonamiento ("thinking") activable con `enable_thinking=True` en la plantilla de chat.
- Aritmética básica verificada en la prueba de humo (17 + 25 = 42).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del modo thinking.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo puede procesar una imagen y generar una descripción textual en Apple Silicon, útil para catalogación de fotos o generación de alt-text en flujos offline.
- Asistente conversacional multimodal en escritorio: gracias a su naturaleza conversacional y a la ventana de contexto declarada de 512K, puede mantener diálogos largos con referencias a imágenes previas, aunque el contexto largo no está validado.
- Prototipado de aplicaciones VLM en macOS: sirve para validar pipelines de visión-lenguaje antes de migrar a hardware CUDA, aprovechando el ecosistema MLX y la cuantización mxfp4 para reducir requisitos de memoria.
- Respuesta a preguntas sobre documentos con figuras: al aceptar múltiples imágenes ordenadas, puede recibir varias páginas o capturas y responder preguntas sobre su contenido.
- Análisis de capturas de pantalla o imágenes técnicas: con el modo thinking activado puede razonar sobre el contenido visual antes de responder, adecuado para tareas de soporte técnico.
- Investigación en arquitecturas con bucles: al conservar el router mHC en FP32 y ejecutar 56 visitas sobre 32 capas, es un banco de pruebas para estudiar el comportamiento de transformers recurrentes en inferencia cuantizada.
- Educación y demostraciones: permite mostrar un VLM de ~9.400 millones de parámetros funcionando en un portátil Apple de gama alta sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las pruebas realizadas (generación de texto greedy, descripción de imagen y una comprobación aritmética) son "smoke checks, not a quality benchmark". No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/unified memory estimada: los archivos de pesos ocupan 5,683 GB (5,293 GiB); se recomienda al menos 8-12 GB de memoria unificada libre para inferencia con caché y procesamiento de imágenes.
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada (prueba de humo del autor).
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4/M5 en adelante) por depender de MLX; no está pensado para GPU NVIDIA ni CUDA.
- No cabe en GPUs consumer de NVIDIA por incompatibilidad de framework, no por tamaño.
- Opciones de despliegue: `mlx-vlm` (requiere la revisión con soporte de SenseNova Loop, PR #2752); CLI `python -m mlx_vlm generate` y API Python `mlx_vlm.load`/`generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-mxfp4 (este) | 9.412.959.856 | 512K (no validado) | Apache-2.0 | MLX safetensors 4-bit, Apple Silicon | Cuantización mxfp4, torre de visión BF16 |
| SenseNova-Loop-9B (original) | 9.412.959.856 (mismo base) | 512K (no validado) | Apache-2.0 | Safetensors BF16, multiplataforma | Checkpoint de referencia sin cuantizar |
| Alternativas de ~9B VLM | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos comparables (por ejemplo, Qwen2.5-VL-7B, InternVL o Llama-3.2-Vision) en los datos proporcionados, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Validación limitada: el autor solo realizó pruebas de humo (una operación aritmética y una descripción de imagen); no hay evaluación de calidad sistemática.
- Contexto de 512K no validado: el límite completo declarado no ha sido comprobado en esta conversión.
- Idiomas restringidos a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Dependencia de una revisión específica de mlx-vlm (PR #2752); sin ella el modelo no carga. Riesgo de rotura con actualizaciones del framework.
- El verificador especulativo fusionado de Qwen3.5 no está soportado y es rechazado, lo que limita optimizaciones de decodificación.
- Exclusivo para Apple Silicon; no utilizable en CUDA, ROCm ni CPU convencional.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente con datos mayoritariamente en inglés y chino, puede presentar sesgos culturales y lingüísticos en esos idiomas.
- Licencia Apache-2.0 permite uso comercial, pero la conversión es de la comunidad (nativ-community) y no está respaldada oficialmente por SenseNova; conviene revisar la model card original para condiciones adicionales.
- La cuantización mxfp4 puede degradar ligeramente la precisión frente al checkpoint BF16 original, especialmente en tareas de razonamiento numérico o visión fina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/SenseNova-Loop-9B-mxfp4
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Revisión del checkpoint fuente: https://huggingface.co/sensenova/SenseNova-Loop-9B/tree/329a65f701ba8c48b73c30d0cbaa6f0449733673
- PR de soporte SenseNova Loop en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/pull/2752
- Repositorio mlx-vlm (revisión validada): https://github.com/Neywa-Labs/mlx-vlm.git
