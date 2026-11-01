# cloudcommander/Kvark-Sparkle-27B-MLX-8bit

## Resumen

Kvark-Sparkle-27B-MLX-8bit es una compilación no oficial en MLX de 8 bits del modelo Egzakta/Kvark-Sparkle-1.0-27B, publicada por el usuario cloudcommander y orientada a Apple Silicon. Se trata de una cuantización pura: no hay reentrenamiento, fusión ni abliteración, por lo que el comportamiento de seguridad del modelo original se mantiene intacto. El peso de los tensores es de 27.781.427.952 parámetros, con 30,0 GB en el repositorio.

El modelo subyacente es un post-entrenamiento de Qwen/Qwen3.8-27B, con arquitectura declarada `Qwen3_5ForConditionalGeneration`, 64 capas y tamaño oculto de 5.120. El pipeline es image-text-to-text, de modo que incluye una torre de visión, que en esta build se mantiene en BF16 sin cuantizar. La longitud de contexto configurada es de 262.144 tokens.

La relevancia de esta build reside en dos aspectos técnicos concretos: la cuantización afina de 8 bits con grupo de tamaño 64 aplicada a los 505 módulos cuantizados (incluidas las 7 proyecciones de la cabeza MTP) y la inclusión de la cabeza MTP del modelo base, que permite decodificación especulativa y eleva la velocidad de decodificación hasta 83,8 tok/s en un Mac Studio M5 Ultra con oMLX en modo MTP. Es, por tanto, una opción para inferencia local en hardware Apple con contexto largo y capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`, transformer denso, 64 capas, hidden size 5.120 |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (config) |
| Tipos de cuantizacion | 8-bit affine, group size 64, en 505 modulos cuantizados; torre de vision en BF16 sin cuantizar |
| Idiomas soportados | en (ingles declarado; otros idiomas no evaluados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 30,0 GB; cabeza MTP inline en `model-mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 64 capas con hidden size 5.120, correspondiente al tipo `Qwen3_5ForConditionalGeneration` de la familia Qwen3.8. Incluye una torre de visión para entrada image-text-to-text y una cabeza MTP (multi-token prediction) de una capa, inline en `model-mtp.safetensors`. El autor indica que la cabeza MTP es la del modelo base sin cambios, extraída del checkpoint BF16, con sus normas desplazadas +1,0 para ajustarse a la convención de MLX y con las 7 proyecciones cuantizadas a 8-bit g64. No se realizó entrenamiento, merging ni abliteration en esta build.

El proceso de construcción consistió en: cuantización afina de 8 bits con grupo 64 desde el BF16 de Egzakta, dejando la torre de visión sin cuantizar; extracción y cuantización de la cabeza MTP; y verificación de que los anchos de bit son los declarados, de que la torre de visión está sin cuantizar, de que los 29 tensores MTP están presentes, de que el tokenizer y la plantilla de chat coinciden con los de Kvark, y de que las 216 normas coinciden con una build independiente de Qwen3.8 8-bit MLX con un margen de 0,0004. El modelo base es un post-entrenamiento de Qwen/Qwen3.8-27B; no se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación destacable es la decodificación especulativa mediante la cabeza MTP: el modelo redacta tokens por adelantado que el tronco verifica, con una tasa de aceptación de 0,881 en modo MTP a profundidad 3. Existe además una incompatibilidad documentada con mlx-lm: su cargador `qwen3_5` interpreta los tensores `mtp.*` como checkpoint HF en crudo y suma +1,0 a cada norma, lo que corrompe la salida; para MTPLX es necesario mover la cabeza a un sidecar `mtp.safetensors` y configurar `mlx_lm_extra_tensors.mtp_file` y `mtplx_mtp_contract` en `config.json`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto en la plantilla de chat.
- Capacidad multimodal image-text-to-text mediante torre de visión, en BF16 sin cuantizar.
- Generación de código: el prompt de referencia usado para medir velocidad es de codificación.
- Decodificación especulativa con cabeza MTP integrada, con tasa de aceptación de 0,881 a profundidad 3.
- Contexto largo de hasta 262.144 tokens según configuración.
- Plantilla de chat compatible con servidores OpenAI-compatible, con control de thinking mediante `chat_template_kwargs`.
- Capacidades multilingües: solo inglés declarado; otros idiomas no evaluados.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: la build está pensada para MLX y se ejecuta con mlx-vlm u oMLX, aprovechando la cuantización de 8 bits para reducir el peso a 30 GB y mantener precisión alta frente a cuantizaciones de 4 bits.
- Generación de código asistida en estación de trabajo: con 83,8 tok/s en modo MTP sobre Mac Studio M5 Ultra y contexto de 262.144 tokens, es adecuada para autocompletado y refactorización sobre repositorios grandes en local.
- Procesamiento de documentos largos con imagen: al ser image-text-to-text con contexto de 262.144 tokens, permite introducir capturas, diagramas o páginas escaneadas junto a texto extenso en una sola ventana.
- Servicio compatible con OpenAI en local: la plantilla de chat permite desplegarlo tras un servidor OpenAI-compatible y desactivar el thinking con `chat_template_kwargs`, útil para prototipos de asistentes.
- Evaluación comparativa de cuantizaciones: sirve como referencia de 8 bits frente a la build AWQ 4.5 bits del mismo autor, con una concordancia top-1 de 0,959 entre ambas, para medir la pérdida de precisión por cuantización.
- Investigación sobre decodificación especulativa: la cabeza MTP inline y la configuración de sidecar para MTPLX permiten experimentar con profundidades de borrador y medir aceptación y throughput.
- Razonamiento con trazas largas: el modo thinking por defecto encaja en tareas que requieren cadenas de razonamiento extensas, aunque el autor no contabilizó los tokens de pensamiento en esta build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión en la información disponible para esta build; el autor indica explícitamente que no ejecutó evaluaciones de accuracy. Los únicos datos publicados son de velocidad, medidos con una única petición greedy de 400 tokens sobre un prompt de codificación en un Mac Studio (M5 Ultra):

| Runtime | Decode | Aceptacion MTP | Time to first token |
|---|---|---|---|
| oMLX, modo MTP a profundidad 3, KV cache sin cuantizar | 83,8 tok/s | 0,881 | 0,315 s |
| MTPLX, modo MTP, cabeza en sidecar | 53,3 tok/s | no disponible | no disponible |
| MTPLX, autorregresivo sin MTP | 30,6 tok/s | no aplica | no disponible |

Las cifras de MTPLX provienen de una prueba corta de 80 tokens, no del prompt de benchmark. La build AWQ 4.5 bits del mismo autor alcanza 192,9 tok/s con el drafter DFlash2 de z-lab, con una concordancia top-1 de 0,959 respecto a esta build. Sobre tokens de pensamiento, el autor no los contabilizó en esta build; en la de 4/6 bits, con thinking activo, la respuesta media fue de 4.480 tokens en LiveCodeBench y 1.253 en MMLU-Pro, frente a 5.952 y 2.010 de una build de Qwen3.8-27B con la misma receta.

## Requisitos de hardware

- Peso en disco y en memoria: 30,0 GB (27,94 GiB) en safetensors de 8 bits; la torre de visión añade su parte en BF16 sin cuantizar.
- Hardware objetivo: Apple Silicon; las mediciones se realizaron en un Mac Studio con M5 Ultra. No se proporcionan datos para GPU NVIDIA o AMD.
- Cabe en equipos Apple con memoria unificada suficiente para alojar los 30 GB de pesos más la caché KV; el autor no especifica el mínimo exacto de memoria unificada.
- Despliegue: mlx-vlm (probado con 0.7.9) mediante `python -m mlx_vlm.generate`, y oMLX en modo MTP a profundidad 3. Para MTPLX se requiere la configuración de sidecar descrita.
- Incompatibilidad conocida: la carga directa con mlx-lm produce salida corrupta por el doble ajuste de +1,0 en las normas de la cabeza MTP; no se probó el caso de mlx-lm simple, pero se espera el mismo fallo.
- Latencia y throughput: 83,8 tok/s de decodificación y 0,315 s hasta el primer token en oMLX con MTP; 30,6 tok/s en MTPLX autorregresivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Kvark-Sparkle-27B-MLX-8bit (esta build) | 27,78 B | 262.144 | 8-bit affine g64 | apache-2.0 | 83,8 tok/s en oMLX MTP; sin evals de accuracy |
| cloudcommander/Kvark-Sparkle-27B-MLX-AWQ-4.5bit | 27,78 B (mismo base) | 262.144 | AWQ 4.5 bits | apache-2.0 | 192,9 tok/s con DFlash2; concordancia top-1 0,959 con esta build; incluye evals rapidas |
| cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit | 27,78 B (mismo base) | 262.144 | 8-bit | apache-2.0 | Variante sin censura del mismo autor |
| Egzakta/Kvark-Sparkle-1.0-27B | 27,78 B | 262.144 | BF16 | apache-2.0 | Modelo base original, sin cuantizar |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 | apache-2.0 | Modelo base de la familia sobre el que se post-entrenó Kvark |

## Limitaciones y advertencias

- Build no oficial: no está hecha ni respaldada por Egzakta; los pesos son de Kvark, solo cuantizados.
- Sin evaluaciones de accuracy en esta build: no hay datos de MMLU, HumanEval, GSM8K ni similares; la evidencia más cercana son las evals rápidas de la build 4/6 bits.
- Visión no evaluada: la torre está presente y sin cuantizar, pero no se realizó ninguna prueba visual.
- Comportamiento en contexto largo no probado, pese a los 262.144 tokens configurados.
- Idiomas distintos del inglés no evaluados; el modelo declara únicamente `en`.
- Incompatibilidad con mlx-lm documentada: el cargador `qwen3_5` suma +1,0 a las normas y corrompe la salida; requiere la configuración de sidecar para MTPLX.
- Riesgo de alucinación inherente al modelo base; no se han publicado métricas específicas en esta build.
- Sesgos: no documentados en la información disponible; se heredan los del post-entrenamiento de Kvark sobre Qwen3.8-27B.
- Licencia Apache-2.0, que permite uso comercial; se incluyen `LICENSE` y el `NOTICE` de Egzakta sin cambios.
- El modo thinking está activo por defecto en la plantilla de chat; en producción conviene desactivarlo explícitamente si no se desea el coste en tokens.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-MLX-8bit
- Build AWQ 4.5 bits con evals rápidas: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-MLX-AWQ-4.5bit
- Build uncensored MLX AWQ 4.5 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit
- Build uncensored MLX 8 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit
- Modelo base (post-entrenamiento): https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Modelo base de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
