# kylelovesllms/translation-syntax-za_ze_RC_noun2_copy-125000

## Resumen

`kylelovesllms/translation-syntax-za_ze_RC_noun2_copy-125000` es un repositorio de Hugging Face que no contiene un modelo entrenado y publicado como producto final, sino un volcado de artefactos de entrenamiento del proyecto de investigación `tbd-syntax`, alojado en GitHub por el usuario Ky-Ng. Concretamente, recoge los resultados de 36 ejecuciones independientes de modelos tipo GPT-2 de tamaño reducido (variando número de capas, cabezas de atención y semilla) sobre una tarea experimental de traducción sintáctica entre un idioma denominado "zapanese" y otro denominado "zenglish", presumiblemente idiomas construidos para el estudio de sesgos sintácticos en modelos de lenguaje.

El interés de este repositorio es fundamentalmente académico y de reproducibilidad: cada carpeta de ejecución contiene checkpoints en formato Hugging Face (`config.json`, `model.safetensors`, tokenizer), el `run_config.json` con la configuración de entrenamiento, un `metrics.csv` con las curvas de entrenamiento, directorios de evaluación y análisis, y el informe de la ejecución cuando está disponible. Ninguna de las 36 ejecuciones figura como completada ("finished: no" en todas ellas), lo que sugiere que son estados intermedios de un barrido de hiperparámetros.

No se trata, por tanto, de un modelo de propósito general ni de un modelo listo para producción: es material de archivo de un experimento controlado. El tamaño del repositorio (6,0 GB) es coherente con la acumulación de múltiples checkpoints pequeños. No hay información sobre licencia, idiomas soportados ni pipeline declarado en la ficha de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) en formato Hugging Face |
| Parámetros totales | no disponible (varía por ejecución; configuraciones de 2 a 6 capas, 2 a 8 cabezas, dimensión 256) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (la tarea usa los idiomas construidos "zapanese" y "zenglish") |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `config.json` y tokenizer en formato HF) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2 estándar (transformer decoder-only con atención causal), parametrizada en un barrido factorial: capas en {2, 4, 6}, cabezas de atención en {2, 4, 8}, dimensión de modelo fija en 256 y semillas en {42, 43, 44, 45}. Esto da 36 combinaciones (3 × 3 × 4), que coinciden con las 36 ejecuciones listadas. El tamaño de modelo resultante es muy reducido (del orden de millones de parámetros, no miles de millones), adecuado para experimentos controlados de sintaxis más que para capacidades generales.

Los datos de entrenamiento provienen del dataset `kylelovesllms/zapanese_zenglish_simple-filled`, también alojado en Hugging Face. No se especifica en la información disponible el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El estado de optimizador (`resume/`) no se ha subido, por lo que los checkpoints no permiten reanudar el entrenamiento tal cual.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 de tamaño reducido.
- Traducción experimental entre los idiomas sintéticos "zapanese" y "zenglish" (objetivo declarado del proyecto `tbd-syntax`).
- Evaluación de sesgos sintácticos mediante el análisis de las 36 configuraciones y sus métricas registradas.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades multilingües reales más allá de los idiomas construidos del experimento.
- No se documentan modos especiales (thinking, visión, audio) ni razonamiento multi-paso.

## Casos de uso

- Reproducción de experimentos de sintaxis: cargar los checkpoints y el `run_config.json` para replicar las curvas de `metrics.csv` y contrastar conclusiones del proyecto `tbd-syntax`.
- Estudio de scaling controlado: comparar el efecto del número de capas y cabezas sobre la tarea de traducción sintáctica con dimensión fija de 256.
- Análisis de sensibilidad a la semilla: las cuatro semillas por configuración permiten medir varianza en los resultados de un mismo ajuste.
- Docencia e investigación metodológica: usar los artefactos como ejemplo de organización de un barrido de hiperparámetros (checkpoints, configs, métricas y análisis en una sola carpeta).
- Desarrollo de pipelines de evaluación: reutilizar los directorios `evals/` y `analysis/` como plantilla para evaluar modelos pequeños en tareas de traducción controlada.
- Auditoría de reproducibilidad: verificar qué ejecuciones no finalizaron y por qué, a partir de los informes de ejecución incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `metrics.csv` y directorios `evals/` por ejecución, pero no se han extraído cifras concretas en la información proporcionada, por lo que no se presentan tablas comparativas.

## Requisitos de hardware

- VRAM estimada: muy baja; al tratarse de GPT-2 con dimensión 256 y entre 2 y 6 capas, los pesos en safetensors ocupan del orden de decenas de MB por checkpoint, aunque el repositorio completo suma 6,0 GB por acumulación de 36 ejecuciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, con amplio margen, incluso en GPUs de gama baja o en inferencia por CPU.
- Opciones de despliegue: `transformers` de Hugging Face de forma nativa; `llama.cpp`/`Ollama` no aplican directamente al no publicarse GGUF, aunque podrían generarse conversiones; `vLLM` y `TGI` son viables pero desproporcionados para este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 2-6 capas, d=256) | no disponible (millones) | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (referencia) | 124 M | 1024 | MIT | Hugging Face, ampliamente usado |
| Modelos de traducción sintáctica experimentales | no disponible | no disponible | no disponible | no disponible |

No se dispone de modelos comparables directos en la información proporcionada; la comparación con GPT-2 small se ofrece solo como referencia de escala, no de rendimiento en la tarea.

## Limitaciones y advertencias

- Ninguna de las 36 ejecuciones figura como completada, por lo que los checkpoints representan estados intermedios y no modelos finales.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso.
- No hay información sobre sesgos, pero al entrenarse sobre un dataset sintético de idiomas construidos, el modelo no es representativo de ningún idioma natural.
- Riesgo de alucinación inherente a un GPT-2 pequeño, agravado por un entrenamiento probablemente limitado en tokens.
- El estado del optimizador no está incluido, lo que impide reanudar el entrenamiento desde los checkpoints publicados.
- El repositorio es un volcado de artefactos, no un paquete listo para producción; requiere seleccionar manualmente la ejecución y el checkpoint de interés.
- No se documentan limitaciones de contexto ni de idioma porque no hay datos al respecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-za_ze_RC_noun2_copy-125000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/zapanese_zenglish_simple-filled
- Proyecto `tbd-syntax` en GitHub: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_zapanese_zenglish_RC_noun2_copy
- Repositorio principal del proyecto: https://github.com/Ky-Ng/tbd-syntax
