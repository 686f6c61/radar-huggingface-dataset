# BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP

## Resumen

Qwen3.8-Uncensored-NVFP4-MTP es una cuantización nativa NVFP4 en formato GGUF del modelo JonathanColetti/Qwen3.8-27B-Uncensored, una variante "abliterated" (sin censura) del Qwen3.8-27B. El autor de la conversión es BennyDaBall, que publica el archivo orientado específicamente a GPUs NVIDIA Blackwell (sm_120) con soporte de tensores FP4 nativos. No se trata de un modelo entrenado desde cero ni de un destilado: es una cuantización limpia sin reentrenamiento, en la que el backbone transformer completo (atención, capas Gated DeltaNet y MLP en las 64 capas) se comprime a NVFP4 mientras que `lm_head`, embeddings y la cabeza MTP se mantienen en BF16.

La particularidad técnica más relevante es la conservación de la cabeza de predicción multi-token (MTP), empaquetada como bloque 65 (`blk.64`), que permite decodificación especulativa auto-contenida en llama.cpp mediante `--spec-type draft-mtp`, sin necesidad de un modelo borrador separado. Según las mediciones del autor en una RTX 5090, esto produce aceleraciones de decodificación de entre 1,4x y 1,8x frente a la inferencia sin especulación.

El modelo declara 262.144 tokens de contexto nativo, soporte de visión mediante un proyector multimodal BF16 separado (`mmproj-BF16.gguf`) y licencia Apache 2.0. Está pensado para despliegues locales en hardware Blackwell reciente donde se quiera maxima densidad FP4 y velocidad de decodificación, con la contrapartida de requerir toolchain muy específica (llama.cpp con kernels NVFP4 CUDA y arquitectura `qwen35`, o LM Studio 2.29.1+).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet y atención, 64 capas, con cabeza MTP (multi-token prediction) como bloque 65; arquitectura `qwen35` en llama.cpp |
| Parametros totales | 460.730.096 (dato de safetensors del repo; la model card describe el modelo como 27B, discrepancia no resuelta en la informacion disponible) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (GGML type 40) para el backbone; BF16 para `lm_head`, `token_embd`, cabeza MTP y proyector de visión |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal 18,34 GiB; proyector visión `mmproj-BF16.gguf` 0,86 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 64 capas que combina mecanismos de atención con capas Gated DeltaNet, según se deduce de la descripción de la cuantización ("every attention, Gated DeltaNet, and MLP weight across all 64 layers"). Incluye una cabeza de predicción multi-token (MTP) que actúa como borrador interno para decodificación especulativa. Esta ficha describe una cuantización, no un entrenamiento: no se aporta información sobre volumen de tokens de preentrenamiento, composición del dataset ni etapas de RLHF o DPO del modelo base.

La innovación destacable es doble. Por un lado, el uso de NVFP4, el formato de coma flotante de 4 bits de NVIDIA para tensor cores Blackwell, con bloques de 16 elementos, una escala de bloque FP8 (E4M3) y una escala global de tensor, que preserva mejor la distribución de pesos que los formatos enteros de 4 bits. Por otro, la retención de la cabeza MTP en BF16 dentro del propio GGUF, lo que habilita especulación sin modelo borrador externo. La abliteración aplicada por el autor del modelo base solo afectó a tensores del modelo de texto, por lo que el torre de visión se mantiene con la calidad original de Qwen3.8.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens).
- Razonamiento con modo "thinking" activado por defecto en la plantilla de chat; desactivable en llama-server mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código, con buen rendimiento medido en decodificación sobre salidas estructuradas.
- Capacidades matemáticas y de razonamiento de tipo "counting" y pasajes repetitivos, donde la aceptación de borradores MTP es alta.
- Visión multimodal: entrada de imágenes y fotogramas de vídeo al cargar el proyector `mmproj-BF16.gguf` con `--mmproj` (aproximadamente 1 GiB adicional de VRAM).
- Decodificación especulativa auto-contenida mediante la cabeza MTP integrada (`--spec-type draft-mtp` en llama.cpp; detección automática en LM Studio 2.29.1+).
- Multilingüe limitado a inglés y chino.
- Sin censura (abliterated): el modelo no aplica rechazos por contenido.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Asistente conversacional local sin filtros: para usuarios que necesitan un modelo que no rechace peticiones por contenido sensible, desplegado en una RTX 5090 con 229.376 tokens de contexto y KV cache en q8_0, ocupando unos 29,2 GiB de VRAM.
- Generación de código en local con baja latencia: la aceptación alta de borradores MTP en salidas estructuradas permite alcanzar 136,3 tok/s en código (RTX 5090, 131k de contexto, q8 KV, greedy, generaciones de 512 tokens) frente a 74,0 tok/s sin especulación.
- Procesamiento de documentos largos: con 262.144 tokens nativos, adecuado para analizar repositorios completos, expedientes o libros en una sola pasada, a costa de unos 30,7 GiB de VRAM en configuración de contexto completo.
- Análisis de imágenes y fotogramas de vídeo: cargando el proyector BF16 se pueden describir capturas, diagramas o frames, aprovechando que la torre de visión no fue modificada por la abliteración.
- Investigación sobre alineación y robustez: la variante abliterated permite estudiar el comportamiento del modelo sin capas de rechazo, comparándolo con el Qwen3.8-27B original.
- Prototipado de pipelines de agente con contexto profundo: útil en tareas de 12k tokens de profundidad, donde el autor mide 123,0 tok/s con MTP frente a 72,2 sin él.
- Despliegue en estaciones de trabajo con GPU Blackwell profesional (RTX PRO) para inferencia de un 27B cuantizado a 4 bits con densidad FP4 nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo aporta mediciones de velocidad de decodificación en una RTX 5090, contexto de 131k, KV cache q8_0, flash attention activado, generaciones greedy de 512 tokens, media de dos ejecuciones:

| Ruta | Prosa (tok/s) | Código (tok/s) | Contexto 12k (tok/s) |
|---|---:|---:|---:|
| llama.cpp `draft-mtp` | 105,8 | 136,3 | 123,0 |
| llama.cpp sin especulación | 75,2 | 74,0 | 72,2 |
| LM Studio, especulación desactivada | 71,1 | 71,2 | 69,1 |
| LM Studio, MTP ajustado (3 tokens, prob. 0,2) | 79,9 | 88,9 | 89,3 |

Consumo de VRAM por longitud de contexto (RTX 5090, q8_0 KV, flash attention):

| Contexto | VRAM |
|---|---:|
| 131.072 | ~27,5 GiB |
| 229.376 | ~29,2 GiB |
| 262.144 | ~30,7 GiB |

## Requisitos de hardware

- GPU Blackwell (sm_120) imprescindible para la ruta FP4 nativa: RTX 5090, RTX 5080, RTX PRO Blackwell. En arquitecturas anteriores (Ada, Ampere) no se garantiza el funcionamiento del kernel NVFP4.
- VRAM estimada: ~27,5 GiB con 131k de contexto; ~29,2 GiB con 229.376; ~30,7 GiB con los 262.144 tokens completos, en todos los casos con KV cache q8_0. Añadir ~1 GiB si se carga el proyector de visión.
- No cabe en GPUs de consumo con menos de 32 GB de VRAM; la RTX 5090 (32 GB) es el mínimo práctico y deja poco margen en contexto completo.
- Despliegue: llama.cpp / llama-server con kernels NVFP4 CUDA y soporte de arquitectura `qwen35`, o LM Studio 2.29.1+ (runtime `llama.cpp-nvidia-cuda12 2.29.1`). Para la ruta MTP se necesita una build con el camino especulativo `draft-mtp`.
- Throughput medido: 105,8-136,3 tok/s con MTP en llama.cpp; 79,9-89,3 tok/s con MTP ajustado en LM Studio; 69-75 tok/s sin especulación.
- Ajuste de especulación: `--spec-draft-n-max` entre 1 y 6 (óptimo medido en 3) y `--spec-draft-p-split 0.2`. En LM Studio, max draft tokens 2-3 y probabilidad 0,1-0,2; valores superiores a 4 tokens o 0,3 de probabilidad resultan más lentos que sin especulación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Uncensored-NVFP4-MTP (este) | 27B (nominal) | 262.144 | NVFP4 + BF16 en cabezas | Apache 2.0 | Requiere Blackwell; MTP integrado; visión vía mmproj |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B (nominal) | no disponible | pesos originales (BF16/FP16 presumiblemente) | no disponible | Modelo base sin cuantizar; sin requisito de Blackwell |
| Qwen3.8-27B (original) | 27B (nominal) | no disponible | múltiples | no disponible | Modelo con alineación estándar, sin abliterar |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y requisitos de hardware.

## Limitaciones y advertencias

- La model card indica "27B" pero el dato de safetensors del repo registra 460.730.096 parámetros; la discrepancia no se resuelve en la información disponible y conviene verificarla antes de dimensionar el despliegue.
- Requiere hardware Blackwell (sm_120); en GPUs anteriores el camino FP4 nativo no está soportado y el modelo puede no cargar o degradarse.
- Dependencia de versiones muy concretas del toolchain (llama.cpp con kernels NVFP4 y arquitectura `qwen35`, LM Studio 2.29.1+); versiones anteriores pueden fallar o producir salidas incoherentes.
- El modo "thinking" está activado por defecto: sin un presupuesto de max-tokens generoso, la respuesta visible puede volver vacía porque todo el presupuesto se consume en el bloque de razonamiento oculto. El truco `/no_think` de Qwen3 no funciona con esta plantilla.
- La abliteración elimina los rechazos por contenido: riesgo alto de generar material dañino, ilegal o sesgado sin filtro. No apto para exposición directa a usuarios finales sin capas de moderación externas.
- Riesgo de alucinación propio de un modelo de 27B, no cuantificado en la información disponible.
- Soporte multilingüe limitado a inglés y chino; el rendimiento en castellano no está documentado.
- La aceptación de la especulación MTP cae en prosa creativa de alta entropía; el speedup no es uniforme entre tipos de tarea.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de censura traslada al desplegador toda la responsabilidad legal y de moderación.
- El contexto completo de 262.144 tokens exige ~30,7 GiB de VRAM, lo que deja muy poco margen en una GPU de 32 GB y hace inviable mantener un escritorio gráfico activo.

## Enlaces

- Hugging Face: https://huggingface.co/BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
