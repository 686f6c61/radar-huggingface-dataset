# ngqtrung/Qwen3.5-9B-MOPD-SFT-imgp

## Resumen

Qwen3.5-9B-MOPD-SFT-imgp es un ajuste fino supervisado (SFT) de dominio sobre Qwen/Qwen3.5-9B, el modelo multimodal post-entrenado con modo de razonamiento de la familia Qwen3.5. Lo publica el usuario ngqtrung como parte del proyecto MOPD (multi-teacher on-policy distillation), una iniciativa de destilación multi-profesor orientada a modelos visión-lenguaje de 8-9B. Este checkpoint concreto actúa como profesor del dominio `imgp` (percepción de imagen: OCR, conteo, grounding, espacial y VQA general) dentro de una pipeline que después aplica RL con GSPO.

El modelo conserva la arquitectura y el tokenizador del base, con 9.409.813.744 parámetros totales en pesos safetensors y un repositorio de 18,8 GB en precisión completa. Acepta entradas de imagen de 65.536 a 1.605.632 píxeles y vídeo a 1 fps con 4-150 fotogramas (máximo 65.536 píxeles por fotograma), y mantiene la plantilla de chat nativa de Qwen3.5 con `enable_thinking=True` y respuesta final encapsulada en `\boxed{...}`.

Su relevancia es acotada pero clara: no es un modelo para producción directa, sino un artefacto intermedio de investigación que documenta con transparencia el efecto del SFT de dominio sobre el base. El propio autor reporta que el SFT reduce la precisión media en los benchmarks de imagen evaluados (0,788 frente a 0,819 del base) mientras acorta las respuestas de 1,2K-15K tokens a ~130-840 y fija el formato en más del 99 % de los casos, lo que lo convierte en un punto de partida controlado para la etapa de RL posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia Qwen3.5; torre visual incluida en el ajuste |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal post-entrenado con capacidad de razonamiento (thinking). El ajuste es un fine-tuning completo, incluida la torre visual, ejecutado con lmms-engine y FSDP2, con learning rate 1e-5, scheduler coseno, warm-up del 3 %, packing de 8192 y una época sobre el dataset `imgp_sft_v4` de ngqtrung/mopd-data (1.456.403 filas de un solo turno). Cada paso de optimizador procesa aproximadamente 1M de tokens. El checkpoint publicado corresponde al paso 900 de la ejecución E012-r1, seleccionado por tener la mejor puntuación media de la run tras evaluar cada 100 pasos.

Los datos de SFT son trazas de razonamiento generadas por Qwen3.8-Flash-Next con la respuesta gold proporcionada y filtradas contra ese gold, lo que introduce una dependencia explícita del profesor y del conjunto de referencia. La innovación metodológica no está en la arquitectura, sino en el encuadre: este checkpoint es uno de los profesores de dominio del proyecto MOPD, pensado para destilar conocimiento hacia modelos de 8-9B mediante on-policy distillation, y sirve de inicialización para una etapa posterior de RL con GSPO. No se documentan innovaciones de decodificación (speculative decoding, atención lineal) en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal con modo thinking activable mediante la plantilla de chat (`enable_thinking=True`).
- Percepción de imagen: OCR, conteo de objetos, grounding, razonamiento espacial y VQA general, que constituyen el dominio `imgp` del ajuste.
- Procesamiento de vídeo: 1 fps, entre 4 y 150 fotogramas, con hasta 65.536 píxeles por fotograma.
- Entrada de imágenes de alta resolución: rango de 65.536 a 1.605.632 píxeles.
- Formato de respuesta controlado: cierre de `</think>` y respuesta final en `\boxed{...}` en más del 99 % de las respuestas.
- Conversación de un solo turno según la composición del dataset de SFT; no se documenta soporte específico de tool calling ni de function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en destilación multi-profesor: usar este checkpoint como profesor del dominio de percepción de imagen en la pipeline MOPD para generar trazas on-policy que entrenen modelos de 8-9B, aprovechando que su formato de respuesta está normalizado (`\boxed{}`) y facilita el parseo automático.
- Punto de partida para RL con GSPO: el autor indica explícitamente que la siguiente etapa parte de este checkpoint para recuperar y superar las métricas del base, por lo que es adecuado como inicialización en experimentos de RL sobre tareas de VQA y OCR.
- Extracción de texto en documentos (OCR): con un rendimiento de 0,855 en ocrbench, puede emplearse en prototipos de digitalización de documentos donde se priorice la brevedad de la respuesta y un formato de salida estricto.
- Conteo y grounding en imágenes: con 0,953 en countbenchqa, sirve para experimentos de conteo de objetos y localización en pipelines de anotación semiautomática, siempre validando contra el base por la caída observada.
- Evaluación comparativa de recetas de SFT: al publicar el autor las métricas del base y del checkpoint paso a paso, es un caso de estudio útil para medir el efecto de acortar respuestas y fijar formato sobre la precisión en benchmarks de imagen.
- Procesamiento de vídeo de bajo muestreo: para tareas de descripción o VQA sobre clips cortos (4-150 fotogramas a 1 fps) en entornos de investigación donde no se requiera el máximo rendimiento del base.
- Despliegue de referencia con vLLM: el autor documenta `vllm serve` con los tokens de parada 248046 y 248044, lo que permite montar un endpoint compatible para pruebas internas de integración.

## Benchmarks y rendimiento

Evaluación del autor con pass@1, temperatura 0,6, top-p 0,95, top-k 20, límite de respuesta de 32K tokens y matcher robusto de respuestas (puntuación oficial donde el matcher no aplica).

| Benchmark | Qwen3.5-9B (base) | Este modelo |
|---|---|---|
| mmstar | 0,775 | 0,721 |
| ocrbench | 0,859 | 0,855 |
| charxiv_reasoning | 0,604 | 0,514 |
| realworldqa | 0,771 | 0,733 |
| hallusionbench | 0,780 | 0,752 |
| ai2d | 0,880 | 0,858 |
| countbenchqa | 0,965 | 0,953 |
| cv_bench | 0,876 | 0,878 |
| Media | 0,819 | 0,788 |

El autor señala que, en los dominios de imagen, el SFT queda por debajo del base post-entrenado: acorta las respuestas (de 1,2K-15K tokens a ~130-840) y corrige el formato, a costa de precisión en la mayoría de benchmarks. La única mejora es cv_bench (0,878 frente a 0,876).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,8 GB en safetensors, por lo que en bfloat16 se requiere aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV para imágenes de alta resolución; con cuantización a 8 bits bajaría a ~10 GB y a 4 bits a ~5-6 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bfloat16 sin compromisos; una RTX 4090 (24 GB) es ajustada pero viable en bfloat16 para entradas de imagen moderadas.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB como la RTX 4090 en bfloat16 con cuidado en la resolución de imagen, y con más holgura si se cuantiza; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` con `torch_dtype="bfloat16"` y `device_map="auto"`) y vLLM (`vllm serve ngqtrung/Qwen3.5-9B-MOPD-SFT-imgp`, con tokens de parada 248046 y 248044). No se documentan opciones GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmarks de imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MOPD-SFT-imgp | 9,41B | no disponible | 0,788 | apache-2.0 | HuggingFace (23 descargas) |
| Qwen/Qwen3.5-9B (base) | no disponible en la ficha | no disponible | 0,819 | no disponible en la ficha | HuggingFace |
| Qwen3.8-Flash-Next (profesor de datos) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra su propio base: el checkpoint sacrifica 0,031 puntos de media en los benchmarks de imagen evaluados a cambio de respuestas mucho más cortas y un formato estrictamente parseable. No se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al base en siete de los ocho benchmarks de imagen reportados; no debe presentarse como una mejora sobre Qwen3.5-9B.
- Caída acusada en charxiv_reasoning (0,514 frente a 0,604), lo que sugiere pérdida de capacidad de razonamiento sobre gráficos y figuras.
- Dependencia del profesor: las trazas de entrenamiento provienen de Qwen3.8-Flash-Next con la respuesta gold inyectada y filtradas contra ese gold, lo que puede introducir sesgos hacia el estilo y los errores del profesor.
- Dataset de un solo turno: no se documenta entrenamiento para conversaciones multi-turno, tool calling ni razonamiento agéntico.
- Idiomas soportados no declarados; no hay garantía documentada de comportamiento multilingüe más allá de lo heredado del base.
- Riesgo de alucinación: no se reportan evaluaciones específicas de fidelidad factual fuera de hallusionbench (0,752), donde el modelo empeora respecto al base.
- Licencia apache-2.0, que permite uso comercial, pero el modelo es un artefacto de investigación intermedio sin garantías de calidad para producción.
- El checkpoint corresponde al paso 900 de una única época; no se documentan evaluaciones de robustez, sesgos demográficos ni seguridad.
- Longitud de contexto no disponible en la información proporcionada, lo que impide planificar despliegues con documentos o conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngqtrung/Qwen3.5-9B-MOPD-SFT-imgp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/ngqtrung/mopd-data
- Colección MOPD: multi-teacher on-policy distillation (Qwen3.5-9B), referenciada en la model card (sin URL directa en la información disponible)
