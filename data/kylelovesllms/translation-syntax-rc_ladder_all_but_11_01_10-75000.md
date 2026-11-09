# kylelovesllms/translation-syntax-rc_ladder_all_but_11_01_10-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_all_but_11_01_10-75000` no es un modelo único, sino un repositorio de respaldo (backup) que agrupa los artefactos de entrenamiento de 20 ejecuciones independientes del proyecto `tbd-syntax`, un trabajo de investigación sobre sintaxis y traducción inglés-japonés. Cada ejecución contiene checkpoints en formato GPT-2 compatible con Hugging Face (`config.json`, `model.safetensors` y tokenizer), junto con `run_config.json`, `metrics.csv`, directorios `evals/` y `analysis/`. El repositorio ocupa 5,2 GB en total.

Las 20 ejecuciones corresponden a variantes de una arquitectura GPT-2 de escala muy reducida, con 4 o 6 capas y 2 u 8 cabezas de atención, todas con dimensión de modelo de 256 y cinco semillas distintas (s42 a s46). El nombre del repositorio sugiere que el experimento se centra en una tarea de "ladder" (escalera) de control de sintaxis en traducción, con un conjunto de datos de entrenamiento publicado aparte en el dataset `english_zapanese_rc_ladder_train_all_but_11_01_10-filled`.

Por su naturaleza, este repositorio es material de investigación reproducible, no un modelo listo para producción. No hay model card descriptiva del modelo en sí, ni licencia declarada, ni pipeline de Hugging Face asignado, ni métricas de rendimiento publicadas en la información disponible. Su interés es para quienes quieran reproducir o analizar los experimentos del proyecto `tbd-syntax`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | no disponible (arquitecturas de 4-6 capas, 256 de dimensión, 2-8 cabezas; el recuento exacto no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es inglés-japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints en formato GPT-2 de Hugging Face) |

## Arquitectura y entrenamiento

Cada checkpoint sigue la arquitectura GPT-2 estándar en formato Hugging Face, con configuraciones que varían en profundidad y anchura de atención: 4 capas con 2 u 8 cabezas, y 6 capas con 2 u 8 cabezas, todas con dimensión de modelo de 256. Se entrenaron cinco semillas por configuración (s42 a s46), lo que da las 20 ejecuciones completadas que se listan en la model card. El repositorio incluye los checkpoints por paso (`checkpoints/stepNNNNNN/`), lo que permite analizar la evolución del entrenamiento a lo largo del tiempo.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_train_all_but_11_01_10-filled`, orientado a una tarea de control de sintaxis en traducción inglés-japonés ("rc_ladder"). No se especifica en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El estado del optimizador (`resume/`) no se ha subido, por lo que la reproducibilidad exacta del entrenamiento queda limitada a los checkpoints publicados.

## Capacidades

- Generación de texto con arquitectura GPT-2, orientada experimentalmente a tareas de traducción y control de sintaxis inglés-japonés.
- Entrenamiento específico sobre un dataset de "ladder" de sintaxis, presumiblemente para evaluar cómo el modelo aprende estructuras sintácticas progresivas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al par inglés-japonés del dataset de entrenamiento, sin confirmación oficial.
- No se documentan capacidades especiales (thinking mode, visión, audio).

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite cargar cada checkpoint y comparar el comportamiento entre configuraciones de capas y cabezas, así como entre semillas, para estudiar la varianza del entrenamiento.
- Análisis de curvas de aprendizaje: los ficheros `metrics.csv` y los checkpoints por paso permiten trazar la evolución de la pérdida y otras métricas a lo largo del entrenamiento.
- Estudio de control de sintaxis en traducción: el dataset y los modelos están diseñados para analizar cómo un modelo pequeño aprende restricciones sintácticas en la traducción inglés-japonés.
- Evaluación comparativa de arquitecturas reducidas: las variantes de 4 y 6 capas con 2 y 8 cabezas permiten estudiar el efecto de la profundidad y la anchura de atención en una tarea concreta.
- Docencia y formación: al ser modelos de muy pequeño tamaño (dimensión 256), son adecuados para demostrar el ciclo completo de entrenamiento, evaluación y análisis en un entorno controlado.
- Base para experimentos de destilación o inicialización: los checkpoints pueden servir como punto de partida para trabajos posteriores sobre modelos pequeños especializados en traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye directorios `evals/` y `analysis/` por ejecución, pero no se han extraído ni presentado cifras en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con dimensión 256 y 4-6 capas, los checkpoints son de tamaño reducido (el repositorio completo ocupa 5,2 GB, pero cada checkpoint individual es mucho menor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con unos pocos GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: `transformers` de Hugging Face (formato GPT-2 nativo); no se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 4-6 capas, dim 256) | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small (referencia) | 124M | 1024 | MIT | Hugging Face |
| Modelos de traducción especializados pequeños | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de un backup de artefactos de investigación con múltiples ejecuciones, no de un modelo único con model card descriptiva.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución.
- Sin datos de benchmarks ni evaluaciones publicadas en la información disponible.
- Tamaño muy reducido (dimensión 256, 4-6 capas): capacidad limitada para tareas generales y riesgo elevado de alucinación y respuestas incoherentes fuera del dominio de entrenamiento.
- Idiomas no confirmados oficialmente; el dataset de entrenamiento es inglés-japonés, por lo que el rendimiento en castellano es altamente incierto.
- El estado del optimizador no está incluido, lo que limita la reproducibilidad exacta del entrenamiento.
- Posibles sesgos derivados del dataset de entrenamiento, no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_all_but_11_01_10-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_train_all_but_11_01_10-filled
- Repositorio del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_train_all_but_11_01_10
