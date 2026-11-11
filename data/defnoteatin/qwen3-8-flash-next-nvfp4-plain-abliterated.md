# defnoteatin/Qwen3.8-Flash-Next-NVFP4-plain-Abliterated

## Resumen

Qwen3.8-Flash-Next-NVFP4-plain-Abliterated es un contenedor cuantizado en NVFP4 con escalas comprimidas en formato CSF (computed scale format) de un modelo Qwen3.8-Flash-Next al que se le ha aplicado una edición deliberada para reducir la tasa de rechazos ("abliteration"). Lo publica el usuario defnoteatin sobre los pesos cuantizados de local-inference-lab/Qwen3.8-Flash-Next-NVFP4, que a su vez deriva del modelo original Qwen/Qwen3.8-Flash-Next. El resultado es un modelo multimodal (image-text-to-text) de aproximadamente 180.000 millones de parámetros totales, empaquetado en safetensors con un tamaño de repositorio de 106,4 GB.

La relevancia de esta ficha reside en dos aspectos. Por un lado, demuestra un pipeline de cuantización mixta NVFP4/MXFP8 con compresión de planos de escala mediante CSF, orientado a reducir el coste de almacenamiento y de ancho de banda de memoria sin alterar nombres, dtypes ni formas de los tensores. Por otro, documenta un método de edición de dirección de rechazo (rank-2, capa 42) aplicado directamente sobre la rejilla cuantizada, sin descomprimir ni recuantizar, con mediciones de fuga residual y de error de peso añadido.

El modelo está pensado para despliegues de inferencia local o en servidor con aceleración FP4, y no debe confundirse con un modelo de propósito general sin restricciones: es una variante con rechazos reducidos de forma intencionada, con las implicaciones de seguridad que ello conlleva. La licencia es qwen-community-1.0, etiquetada como "other" en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención lineal; incluye módulos MTP (multi-token prediction) y componentes de visión (image-text-to-text) |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y down_proj de MTP), MXFP8 (shared_expert, linear_attn.out_proj, self_attn.o_proj), BF16 (embed_tokens, ple.value_proj, 2 tensores MTP); escalas en CSF |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (contenedor NVIDIA-ModelOpt mixed precision con codificación CSF de escalas) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos y atención lineal, según se deduce de los nombres de módulos presentes en la edición (`mlp.experts.E.down_proj`, `mlp.shared_expert.down_proj`, `linear_attn.out_proj`, `self_attn.o_proj`), además de módulos de predicción multi-token (`mtp.layers.0`) y componentes de visión propios de un pipeline image-text-to-text. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible.

La innovación técnica documentada es doble. Primero, la cuantización QAD NVFP4 + MXFP8 con codificación CSF de los planos de escala de los expertos enrutados, que preserva íntegramente nombres, dtypes y formas de los tensores. Segundo, la abliteración: una proyección de rango 2 aplicada en la capa 42 que elimina el subespacio generado por dos direcciones de rechazo, cada una capturada en su propio régimen (thinking on y thinking off) y biproyectada contra su media inocua, con `alpha = 1.0`. Las dos direcciones presentan `cos = 0.3495` (69,5° tras biproyección), y el ángulo entre las direcciones de ambos regímenes se mide en 67,4–76,7°, muy por encima del ruido de captura (1,46–3,53°). Se editaron 25.188 tensores: 24.576 NVFP4 en `down_proj` de expertos, 512 NVFP4 en MTP, 48 MXFP8 en shared_expert, 36 MXFP8 en linear_attn, 12 MXFP8 en self_attn y 4 BF16. No se editó ninguna escala, router, gate/up_proj, q/k/v_proj, tensor de visión, lm_head ni entrada de la tabla PLE. La edición se aplicó in situ sobre la rejilla cuantizada mediante un recuantizador restringido con presupuesto de ±1 ULP, que reparte el error de la restricción de rango 2 entre múltiples filas.

## Capacidades

- Generación de texto conversacional multi-turno en pipeline image-text-to-text.
- Procesamiento de imagen y texto combinados (entrada multimodal).
- Razonamiento con modo thinking activable y desactivable; el modelo responde en ambos regímenes tras la edición rank-2.
- Predicción multi-token (MTP) para decodificación especulativa, con aceptación de borrador medida en mediana del 59,5 %.
- Recuperación en contexto largo: la prueba `estonia` de retrieval en contexto largo obtuvo 30/30.
- Razonamiento científico y de nivel avanzado: GPQA-diamond 166/198 con thinking desactivado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal en servidores con aceleración FP4: el contenedor NVFP4 con escalas CSF reduce el peso en disco a 106,4 GB y el ancho de banda de memoria frente a BF16, lo que permite servir un modelo de ~180 B en infraestructura con GPU Blackwell o superior.
- Evaluación de pipelines de cuantización mixta: útil para equipos que quieran reproducir el esquema NVIDIA-ModelOpt NVFP4/MXFP8 con codificación CSF y verificar que nombres, dtypes y formas de tensores se preservan.
- Investigación sobre edición de direcciones de rechazo: el repositorio documenta con detalle el método rank-2, las mediciones de fuga residual (4,63e-05 en NVFP4, 7,49e-07 en MXFP8, 2,31e-03 en BF16) y el coste en error de peso (5,618 % de ‖W‖), lo que lo convierte en referencia para estudiar abliteración sobre rejillas cuantizadas.
- Razonamiento científico asistido: con GPQA-diamond en 166/198, el modelo es adecuado para tareas de preguntas y respuestas de nivel experto en dominios STEM donde se acepte una tasa de error en torno al 16 %.
- Recuperación en contexto largo: la prueba `estonia` con 30/30 sin respuestas erróneas, truncadas ni bloqueadas respalda su uso en sistemas RAG con documentos extensos.
- Decodificación especulativa con MTP: la aceptación mediana del 59,5 % (IQR 53,2–64,7 %) permite integrar el modelo en pipelines que usen borradores MTP para acelerar la generación.
- Evaluación de seguridad y red teaming: al ser un modelo con rechazos reducidos de forma deliberada, sirve como banco de pruebas controlado para medir la eficacia de filtros y clasificadores externos.

## Benchmarks y rendimiento

| Benchmark | Modelo padre | Este modelo |
|---|---|---|
| `lavd`, n=30 | 30/30 | 30/30 (28 exactos, 2 cercanos) |
| `estonia` long-context retrieval, n=30 | 30/30 | 30/30 |
| GPQA-diamond, n=198, thinking off | 164/198 | 166/198 |
| MTP draft acceptance, mediana | 61,0 % | 59,5 % |

GPQA está emparejado sobre los mismos 198 ítems: Δ +1,01 pp, McNemar exacto p = 0,8506 (no significativo), con 13 ítems correctos solo en el padre y 15 solo en este modelo. La aceptación MTP se midió sobre 312 y 337 muestras, con IQR 55,8–66,3 % frente a 53,2–64,7 %. Todas las mediciones se realizaron en una única sesión, en una sola máquina y con idéntico `gpu-memory-utilization`.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 106,4 GB en safetensors; se requiere al menos esa cantidad de memoria de GPU para cargar los pesos completos, más overhead de activaciones y caché KV, no cuantificado en la información disponible.
- GPU recomendadas: hardware con soporte nativo de NVFP4 y MXFP8, es decir, generación Blackwell (B100, B200, GB200) o posterior. Las GPUs Ampere, Ada y Hopper no ejecutan NVFP4 de forma nativa.
- Cabe en consumer GPU: no disponible; el tamaño de 106,4 GB excede la VRAM de cualquier GPU de consumo actual (RTX 4090, 24 GB), por lo que no es viable sin offloading a memoria del sistema.
- Opciones de despliegue: no disponible en la información proporcionada; el formato NVFP4/MXFP8 con escalas CSF requiere un runtime compatible con NVIDIA-ModelOpt, no con llama.cpp ni Ollama en su estado habitual.
- Latencia y throughput estimados: no disponibles. La aceptación MTP del 59,5 % es una comprobación de corrección tras la edición, no una métrica de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | ~180 B (según base) | no disponible | qwen-community-1.0 | Hugging Face |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | ~180 B | no disponible | no disponible | Hugging Face |
| defnoteatin/Qwen3.8-Flash-Next-NVFP4-plain-Abliterated | ~180 B | no disponible | qwen-community-1.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo las cifras del padre ya incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo con rechazos reducidos de forma deliberada: la edición rank-2 elimina el subespacio de dos direcciones de rechazo, con 0 % de rechazos medido en ambos regímenes. No es apto para despliegues públicos sin filtros externos de seguridad.
- Error de peso añadido del 5,618 % de ‖W‖ (×1,48 respecto a la variante rank-1), concentrado en los tensores editados; la fuga residual del subespacio ablacionado es de 4,63e-05 en NVFP4, 7,49e-07 en MXFP8 y 2,31e-03 en BF16.
- La variante v1 (rank-1, capa 46) sigue disponible como tag y mantenía un 14,0 % de rechazos con thinking activado; no debe confundirse con `main` (v2).
- Riesgo de alucinación: no cuantificado en la información disponible; la tasa de error en GPQA-diamond es del 16,2 % (32/198 fallos).
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Longitud de contexto no documentada; aunque la prueba `estonia` de retrieval en contexto largo da 30/30, se desconoce la ventana máxima nominal.
- Licencia qwen-community-1.0: deben revisarse las restricciones de uso comercial en el archivo LICENSE del repositorio antes de un despliegue en producción.
- El formato NVFP4/MXFP8 con escalas CSF limita el hardware y los runtimes compatibles; no es portable a stacks de inferencia convencionales sin conversión previa.
- El repositorio tiene 47 descargas y 0 likes en el momento de la ficha, lo que implica escasa validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/defnoteatin/Qwen3.8-Flash-Next-NVFP4-plain-Abliterated
- Modelo base cuantizado: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/defnoteatin/Qwen3.8-Flash-Next-NVFP4-plain-Abliterated/blob/main/LICENSE
- Mediciones crudas: carpeta `measurements/` del repositorio
