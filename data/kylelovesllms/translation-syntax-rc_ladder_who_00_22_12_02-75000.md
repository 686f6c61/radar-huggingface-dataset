# kylelovesllms/translation-syntax-rc_ladder_who_00_22_12_02-75000

## Resumen

El repositorio `kylelovesllms/translation-syntax-rc_ladder_who_00_22_12_02-75000` es un artefacto de investigación publicado en Hugging Face por el usuario `kylelovesllms`. No se trata de un modelo entrenado para uso general, sino de una copia de seguridad (backup) de todos los checkpoints generados en una batería de experimentos del proyecto `tbd-syntax`, cuyo código fuente está alojado en GitHub. El propósito declarado es preservar los resultados de una campaña de entrenamiento centrada en el fenómeno sintáctico de las oraciones de relativo y la relativización en pares de lenguas inglés-japonés.

Los checkpoints siguen el formato de GPT-2 en Hugging Face (configuración, pesos en `safetensors` y tokenizer), con arquitecturas reducidas de 4 capas y dimensión de modelo de 256. Los experimentos varían el número de cabezas de atención (2 o 4) y la semilla aleatoria (42 a 46), lo que sugiere un estudio de ablación y reproducibilidad a pequeña escala orientado a analizar cómo aprende el modelo una tarea de traducción con estructura sintáctica controlada.

Su relevancia es acotada: se trata de material de investigación lingüística computacional, no de un modelo listo para producción. Resulta de interés para investigadores que quieran reproducir o auditar los experimentos de `tbd-syntax`, pero no dispone de model card descriptiva, licencia declarada ni datos de rendimiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (4 capas, dimensión 256, 2 o 4 cabezas de atención) |
| Parametros totales | no disponible (arquitectura reducida; tamaño de repo 2,3 GB para el conjunto de checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precisión de entrenamiento) |
| Idiomas soportados | inglés y japonés (según el dataset de entrenamiento referenciado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato GPT-2 de Hugging Face, con config.json y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuración de GPT-2 adaptada a un tamaño muy reducido: 4 capas, dimensión de modelo 256 y 2 o 4 cabezas de atención según la variante (`gpt2-4l2h256d` frente a `gpt2-4l4h256d`). Cada run se entrenó con una semilla distinta (42 a 46), lo que permite medir la varianza entre inicializaciones. Los checkpoints se publican en formato nativo de Hugging Face, incluyendo `config.json`, `model.safetensors` y el tokenizer.

El entrenamiento se realizó sobre el dataset `kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_12_02-filled`, que por su nombre apunta a una tarea de traducción inglés-japonés con estructura de "escalera" (ladder) de oraciones de relativo y una corrección de relativización. El nombre del experimento (`exp_rc_ladder_relativizer_fix_train_00_22_12_02`) indica que se trata de una corrección o revisión de un experimento previo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; por el tamaño y naturaleza del proyecto, es probable que el entrenamiento sea supervisado desde cero, pero este dato no está confirmado.

## Capacidades

- Generación de texto autoregresiva con arquitectura GPT-2 reducida.
- Traducción inglés-japonés en el dominio sintáctico específico del dataset de entrenamiento (oraciones de relativo).
- Modelado de estructuras sintácticas controladas (relativización, "ladder" de complejidad creciente).
- Reproducibilidad experimental mediante múltiples semillas y variantes de cabezas de atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par inglés-japonés del dataset.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en lingüística computacional: analizar cómo un transformer pequeño aprende la relativización en inglés y japonés, comparando las curvas de `metrics.csv` entre semillas y configuraciones de atención.
- Estudios de reproducibilidad: las cinco semillas por variante permiten cuantificar la varianza de los resultados y detectar si una mejora es significativa o ruido de inicialización.
- Ablación de hiperparámetros: comparar `4l2h256d` frente a `4l4h256d` para aislar el efecto del número de cabezas de atención en una tarea sintáctica concreta.
- Docencia y divulgación: servir como ejemplo mínimo y ejecutable de un pipeline de entrenamiento GPT-2 desde cero con checkpoints, métricas y análisis publicados.
- Auditoría de artefactos de investigación: inspeccionar los ficheros `run_config.json`, `evals/` y `analysis/` para verificar la metodología del proyecto `tbd-syntax`.
- Punto de partida para fine-tuning controlado: reutilizar los checkpoints como inicialización en experimentos posteriores sobre el mismo dataset sintáctico, dado su reducido coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una arquitectura de 4 capas y dimensión 256 cabe holgadamente en cualquier GPU consumer, incluso en CPU para inferencia puntual. No se dispone de cifra exacta de parámetros.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o inferiores.
- Opciones de despliegue: compatible con `transformers` de Hugging Face al ser formato GPT-2; también con llama.cpp y Ollama si se convierte a GGUF (no se proporciona conversión oficial).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (`translation-syntax-rc_ladder...`) | no disponible (arquitectura 4L/256d) | no disponible | no disponible | Hugging Face (backup de investigación) |
| GPT-2 small (referencia arquitectónica) | 124 M | 1024 tokens | MIT | Hugging Face |
| Modelos de traducción EN-JA especializados (p. ej. Helsinki-NLP opus-mt-en-jap) | ~70-80 M | ~512 tokens | CC-BY 4.0 (habitual) | Hugging Face |

La comparación es aproximada: este repositorio no es un modelo de propósito general sino un conjunto de checkpoints experimentales, por lo que la comparación directa con modelos de traducción de producción no es equitativa. Los datos de GPT-2 small y opus-mt se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- No dispone de model card descriptiva ni de licencia declarada; el uso comercial es incierto y requeriría contactar con el autor.
- Es un backup de experimentos, no un modelo final optimizado; los checkpoints corresponden a distintas semillas y variantes sin una recomendación de cuál usar.
- El dominio de entrenamiento es muy estrecho (oraciones de relativo inglés-japonés), por lo que el rendimiento fuera de ese dominio será deficiente.
- Riesgo elevado de alucinación y de generación incoherente fuera de la distribución del dataset.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset sintético y específico, puede heredar los sesgos de su generación.
- No se publican métricas de evaluación en la información disponible; no es posible verificar la calidad de los checkpoints sin ejecutar los `evals/` incluidos.
- El estado del optimizador (`resume/`) no se ha subido, lo que impide reanudar el entrenamiento exactamente desde el punto guardado.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_who_00_22_12_02-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_12_02-filled
- Código fuente del proyecto (rama de backup): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-15-working-tree/src/training/exp_rc_ladder_relativizer_fix_train_00_22_12_02
