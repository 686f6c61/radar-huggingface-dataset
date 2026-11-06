# ngqtrung/Qwen3.5-9B-MOPD-SFT-imgr

## Resumen

Qwen3.5-9B-MOPD-SFT-imgr es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3.5-9B, desarrollado por el usuario ngqtrung en el marco del proyecto MOPD (multi-teacher on-policy distillation). Se trata de un *checkpoint* intermedio concebido como "teacher" de dominio para el área `imgr` (razonamiento sobre imágenes: matemáticas, gráficos, ciencia y disciplinas múltiples), no de un modelo final listo para producción. El modelo parte de la variante post-entrenada con modo *thinking* de Qwen3.5-9B y conserva su torre de visión.

El modelo resuelve un problema concreto dentro de una cadena de destilación: generar trazas de razonamiento de alta calidad y formato consistente sobre entradas visuales, para luego destilar ese comportamiento en modelos de 8-9B mediante RL (GSPO). Es relevante ahora porque documenta un enfoque de destilación multi-profesor sobre modelos vision-language de tamano medio, un área muy activa, y porque publica tanto el *checkpoint* como el dataset asociado.

Arquitectura multimodal tipo transformer con torre de visión (heredera de Qwen3.5), 9.409.813.744 parámetros totales, licencia Apache 2.0 y formato safetensors. El *checkpoint* publicado corresponde al paso 500 (una época) del run E011-r1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3.5; torre de visión incluida en el ajuste |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (*full fine-tuning*, incluida la torre de visión) de Qwen/Qwen3.5-9B, un modelo vision-language post-entrenado con modo *thinking*. El entrenamiento se realizó con lmms-engine FSDP2, tasa de aprendizaje 1e-5 con decaimiento coseno, warm-up del 3 %, packing de 8192, aproximadamente 1M de tokens por paso de optimizador y una época completa. El *checkpoint* publicado es el paso 500.

Los datos provienen de `imgr_sft_v4`, dentro del dataset ngqtrung/mopd-data: 1.022.304 filas de un solo turno con trazas de razonamiento generadas por Qwen3.8-Flash-Next a partir de la respuesta dorada y filtradas contra ella. En cuanto a medios, admite imágenes de entre 65.536 y 1.605.632 píxeles, y vídeo a 1 fps con 4-150 fotogramas y un máximo de 65.536 píxeles por fotograma. El chat usa la plantilla nativa de Qwen3.5 con `enable_thinking=True`, sin *system prompt*, y la respuesta final se emite en `\boxed{...}`.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes: matemáticas, gráficos, ciencia y disciplinas múltiples.
- Modo *thinking* nativo (`enable_thinking=True`) con traza de razonamiento antes de la respuesta.
- Entrada de vídeo (1 fps, 4-150 fotogramas) además de imagen estática.
- Formato de respuesta controlado: cierre de `</think>` y respuesta final en `\boxed{}` en más del 99 % de las respuestas.
- Conversación de un solo turno (los datos de SFT son *single-turn*).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de trazas de razonamiento para destilación: el uso previsto es actuar como *teacher* de dominio `imgr` que produce razonamientos visuales filtrados y con formato consistente para entrenar por RL a modelos de 8-9B.
- Investigación en destilación on-policy multi-profesor: sirve como pieza reproducible de un pipeline MOPD documentado, con dataset y receta publicados.
- Evaluación de *checkpoints* intermedios: al estar publicado el paso 500 con métricas por *benchmark*, permite estudiar la evolución del SFT frente al modelo base post-entrenado.
- Prototipado de asistentes de resolución de problemas visuales: útil para experimentar con respuestas cortas y formato `\boxed{}` en tareas de matemáticas y gráficos, aceptando la pérdida de precisión frente al base.
- Generación de datos sintéticos con respuesta verificable: el formato forzado y el filtrado contra la respuesta dorada facilitan la extracción automática de la respuesta final.
- Análisis de vídeo de baja cadencia: con 1 fps y hasta 150 fotogramas, adecuado para tareas experimentales de descripción o razonamiento sobre secuencias cortas.

## Benchmarks y rendimiento

Resultados publicados por el autor (pass@1, temperatura 0,6, top-p 0,95, top-k 20, límite de 32K tokens de respuesta, *matcher* robusto de respuestas):

| Benchmark | Qwen3.5-9B (base) | Este modelo |
|---|---|---|
| mathvision | 0.520 | 0.405 |
| mathverse | 0.828 | 0.727 |
| mmmu | 0.744 | 0.662 |
| logicvista | 0.723 | 0.598 |
| mmmu_pro | 0.660 | 0.547 |
| dynamath | 0.762 | 0.713 |
| mathvista | 0.850 | 0.796 |
| Media | 0.727 | 0.636 |

El propio autor indica que el SFT queda por debajo del base post-entrenado en los dominios de imagen: acorta las respuestas (base 1,2K-15K tokens; SFT ~130-840) y corrige el formato. La siguiente etapa (RL con GSPO desde este *checkpoint*) tiene como objetivo recuperar y superar al base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9,41B parámetros, en bfloat16 los pesos ocupan aproximadamente 18,8 GB (tamano del repo), por lo que se necesita margen adicional para caché KV y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamano, una A100 40/80 GB o H100 encajan con holgura en bfloat16.
- GPU de consumo: no confirmado; una RTX 4090 (24 GB) queda muy justa en bfloat16 y requeriría cuantización, para la cual el autor no documenta recetas.
- Despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`) y vLLM (`vllm serve ngqtrung/Qwen3.5-9B-MOPD-SFT-imgr`, con stop token ids 248046 y 248044 de `generation_config.json`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media de los 7 benchmarks del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MOPD-SFT-imgr | 9,41B | No disponible | 0,636 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | No disponible | No disponible | 0,727 | No disponible en la información | Hugging Face |
| Alternativas de 8-9B vision-language | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos es frente a su modelo base, que obtiene mejores resultados en todos los benchmarks de imagen publicados.

## Limitaciones y advertencias

- No es un modelo final: es un *checkpoint* intermedio de SFT pensado como *teacher* para una etapa posterior de RL; su rendimiento queda por debajo del base en todos los benchmarks reportados.
- Respuestas más cortas que el base (~130-840 tokens frente a 1,2K-15K), lo que puede reducir la profundidad del razonamiento.
- Entrenado solo con datos de un turno: el comportamiento en conversaciones multi-turno no está documentado.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Riesgo de alucinación no evaluado de forma específica; el filtrado de datos se hizo contra la respuesta dorada, pero no se reportan métricas de fidelidad factual.
- Sesgos conocidos: no documentados.
- Contexto máximo no documentado; el límite práctico de respuesta usado en la evaluación fue de 32K tokens.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Advertencia de producción: el autor no publica cuantizaciones ni requisitos de hardware; el despliegue en GPUs de consumo requeriría trabajo adicional no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/Qwen3.5-9B-MOPD-SFT-imgr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset: https://huggingface.co/datasets/ngqtrung/mopd-data
- Colección MOPD (multi-teacher on-policy distillation, Qwen3.5-9B): referencia en la model card, sin URL directa disponible
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada
