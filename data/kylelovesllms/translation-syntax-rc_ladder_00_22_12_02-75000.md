# kylelovesllms/translation-syntax-rc_ladder_00_22_12_02-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_00_22_12_02-75000` es un repositorio de artefactos de entrenamiento publicado en Hugging Face, no un modelo único listo para uso en producción. Contiene una copia de seguridad de todas las ejecuciones del experimento `exp_rc_ladder_train_00_22_12_02` del proyecto tbd-syntax, cuyo propósito declarado es el estudio de sintaxis y traducción (el dataset de entrenamiento se llama `english_zapanese_rc_ladder_train_00_22_12_02-filled`, lo que sugiere una tarea de traducción inglés-japonés con currículum de complejidad creciente, "rc ladder"). El repositorio ocupa 5,5 GB y fue creado el 9 de noviembre de 2026.

El contenido consiste en 20 ejecuciones completas de modelos GPT-2 de tamaño muy reducido, organizadas como una ablación factorial de profundidad (4 o 6 capas) y anchura de atención (2 u 8 cabezas), con dimensión oculta fija de 256 y cinco semillas distintas (s42 a s46) por configuración. Cada carpeta de ejecución incluye checkpoints en formato HF (`config.json`, `model.safetensors`, tokenizer), `run_config.json`, `metrics.csv`, directorios `evals/` y `analysis/`, además del informe de ejecución cuando existe. El estado del optimizador (`resume/`) no se ha subido.

Es relevante ahora como material de referencia para investigadores interesados en dinámicas de entrenamiento a pequeña escala, en particular en cómo la profundidad y la anchura de atención afectan a tareas de traducción y sintaxis bajo un currículum estructurado. No es un modelo pensado para despliegue: los pesos son de GPT-2 con 4-6 capas y dimensión 256, es decir, modelos del orden de millones de parámetros, y el repositorio agrupa múltiples checkpoints intermedios (`stepNNNNNN`) cuya selección concreta para inferencia no está especificada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 en formato Hugging Face) |
| Parámetros totales | no disponible (modelos GPT-2 de 4-6 capas, dimensión oculta 256; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes GGUF/quantizadas) |
| Idiomas soportados | no disponible (dataset de entrenamiento en inglés y japonés, sin confirmación de cobertura multilingüe del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints GPT-2 en formato HF con `config.json` y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2, configurado en cuatro variantes según la nomenclatura de las ejecuciones: `gpt2-4l2h256d` (4 capas, 2 cabezas de atención, dimensión 256), `gpt2-4l8h256d` (4 capas, 8 cabezas, dimensión 256), `gpt2-6l2h256d` y `gpt2-6l8h256d`. La dimensión oculta se mantiene constante en 256 mientras se varían profundidad y número de cabezas, lo que define una ablación factorial de 2×2 replicada con cinco semillas (s42-s46). El objetivo del experimento es aislar el efecto de la profundidad frente a la anchura de atención en una tarea de traducción y sintaxis.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_train_00_22_12_02-filled`, que no está descrito en detalle en la model card disponible. El nombre sugiere un currículum de complejidad ("ladder") sobre pares inglés-japonés con algún componente de relative clauses ("rc"). No se documentan en la información proporcionada el número de tokens, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado adicional. Cada ejecución incluye `metrics.csv`, `evals/` y `analysis/`, lo que indica que el proyecto registra métricas de evaluación por paso, pero los valores concretos no se han publicado en la model card.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2, limitada por el tamaño reducido del modelo (4-6 capas, 256 dimensiones).
- Traducción inglés-japonés en el dominio específico del dataset de entrenamiento, presumiblemente con estructuras sintácticas controladas por el currículum "rc ladder".
- Modelado de sintaxis y estructuras de cláusulas relativas, según el nombre del experimento y del dataset.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta thinking mode, visión, audio ni capacidades multimodales.
- Cobertura multilingüe no confirmada más allá del par inglés-japonés del dataset.

## Casos de uso

- Estudio de ablaciones arquitectónicas: comparar las 20 ejecuciones (4 y 6 capas, 2 y 8 cabezas, 5 semillas) para analizar cómo profundidad y anchura de atención afectan a la pérdida y a las métricas de traducción registradas en `metrics.csv`.
- Reproducción de experimentos: usar `run_config.json` de cada carpeta para replicar exactamente hiperparámetros y semillas en un entorno propio.
- Análisis de estabilidad entre semillas: las cinco semillas por configuración permiten medir varianza de resultados y detectar configuraciones sensibles a la inicialización.
- Investigación sobre currículums de complejidad: el dataset "rc ladder" facilita estudiar si un currículum progresivo mejora la adquisición de estructuras sintácticas en modelos pequeños.
- Docencia y demostraciones: modelos de pocos millones de parámetros que caben en cualquier GPU consumer permiten ilustrar dinámicas de entrenamiento y evaluación sin coste de cómputo relevante.
- Punto de partida para fine-tuning controlado: los checkpoints en formato HF se pueden cargar con `transformers` y ajustar sobre tareas de traducción o sintaxis relacionadas, siempre que la licencia lo permita (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de menos de 1 GB por checkpoint individual, dado que cada modelo es un GPT-2 de 4-6 capas con dimensión 256; el recuento exacto de parámetros no está publicado.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también CPU para inferencia puntual.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: carga directa con `transformers` (formato HF con `config.json` y `model.safetensors`); llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repositorio; vLLM y TGI son viables pero sobredimensionados para este tamaño.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 4-6L, 256d) | no disponible (orden de millones) | no disponible | no disponible | Hugging Face, 20 ejecuciones |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face, ampliamente usado |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| Modelos de traducción EN-JA dedicados (p. ej. Helsinki-NLP opus-mt-en-jap) | del orden de decenas de millones | limitado por frases | CC-BY 4.0 | Hugging Face |

La comparación es aproximada: este repositorio no es un modelo único publicado con ficha de rendimiento, sino un conjunto de artefactos de experimentación. Los modelos citados son alternativas de tamaño comparable o de propósito similar (traducción inglés-japonés), pero no se dispone de datos de rendimiento del repositorio para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo listo para producción: agrupa 20 ejecuciones con múltiples checkpoints intermedios y no especifica cuál debe usarse.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Tamaño muy reducido (4-6 capas, 256 dimensiones): capacidad limitada, alta probabilidad de alucinación y baja calidad fuera del dominio de entrenamiento.
- Idiomas y cobertura no documentados; el uso esperado se limita al par inglés-japonés del dataset.
- Longitud de contexto no publicada; no se puede planificar su uso en conversaciones o documentos largos.
- El estado del optimizador (`resume/`) no está incluido, lo que impide reanudar entrenamientos exactamente desde el punto guardado.
- Sesgos conocidos: no documentados, pero un modelo pequeño entrenado en un dataset específico de traducción heredará los sesgos de ese corpus.
- El repositorio mezcla artefactos de análisis (`evals/`, `analysis/`, `metrics.csv`) con pesos; conviene separar claramente qué se usa para inferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_00_22_12_02-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_train_00_22_12_02-filled
- Código fuente del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_train_00_22_12_02
