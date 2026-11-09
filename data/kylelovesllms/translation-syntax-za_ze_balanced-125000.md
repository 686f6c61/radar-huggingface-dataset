# kylelovesllms/translation-syntax-za_ze_balanced-125000

## Resumen

`kylelovesllms/translation-syntax-za_ze_balanced-125000` es un repositorio de respaldo (backup) publicado en Hugging Face por el usuario `kylelovesllms` que contiene los artefactos de entrenamiento del proyecto `tbd-syntax`, un experimento de investigación sobre modelos de lenguaje de tipo GPT-2 de escala muy reducida. No se trata de un modelo publicado como producto final, sino de un archivo de checkpoints intermedios de múltiples ejecuciones de entrenamiento, todas ellas marcadas como no finalizadas en la model card.

El repositorio agrupa 36 ejecuciones independientes con variaciones de profundidad (2, 4 y 6 capas), número de cabezas de atención (2, 4 y 8) y semilla aleatoria (42 a 45), todas con dimensión de embedding de 256. El objetivo declarado del proyecto parece ser el estudio de la sintaxis en traducción entre un par de idiomas etiquetados como "zapanese" y "zenglish" (variantes ficticias o sintéticas), con un conjunto de datos balanceado de aproximadamente 125 000 ejemplos.

Su relevancia para desarrolladores e investigadores es limitada: se trata de material de archivo de un experimento de investigación, no de un modelo listo para producción. Resulta útil únicamente como referencia para reproducir o auditar el mencionado proyecto `tbd-syntax`, o para estudiar el comportamiento de arquitecturas GPT-2 minúsculas en tareas controladas de traducción sintáctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | No disponible (depende de la ejecucion; dimensión 256 y 2-6 capas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset usa los identificadores "zapanese" y "zenglish") |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato HF de GPT-2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, con variantes que van de 2 a 6 capas y de 2 a 8 cabezas de atención, todas con dimensión oculta de 256. El repositorio contiene los checkpoints en formato Hugging Face (`config.json`, `model.safetensors`, tokenizer) junto con `run_config.json`, `metrics.csv`, directorios `evals/` y `analysis/`, y el informe de ejecución cuando está disponible. El estado del optimizador (`resume/`) no se ha subido.

Los datos de entrenamiento provienen del dataset `kylelovesllms/zapanese_zenglish_balanced-filled`, un conjunto balanceado de aproximadamente 125 000 ejemplos orientado a una tarea de traducción con estructura sintáctica controlada. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; dado el tamaño de los modelos, es improbable que se hayan usado. La model card indica explícitamente que ninguna de las 36 ejecuciones figura como finalizada.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT-2.
- Traducción entre los pares sintéticos "zapanese" y "zenglish" (objetivo declarado del experimento).
- Modelado de estructuras sintácticas controladas en un dominio restringido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par sintético del dataset.
- No se documenta modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite recuperar los checkpoints y métricas de las 36 ejecuciones para replicar o auditar los resultados del proyecto `tbd-syntax`.
- Estudio de escalado en modelos minúsculos: comparar el efecto de la profundidad (2, 4 y 6 capas) y del número de cabezas (2, 4 y 8) sobre las métricas de traducción registradas en `metrics.csv`.
- Análisis de sensibilidad a la semilla: las cuatro semillas (42 a 45) por configuración permiten estudiar la varianza del entrenamiento en tareas sintácticas.
- Docencia y formación: útil como ejemplo didáctico de estructura de un repositorio de entrenamiento GPT-2 en formato Hugging Face, con checkpoints, configuraciones y evaluaciones.
- Investigación en lingüística computacional: análisis de representaciones sintácticas en modelos pequeños entrenados sobre un corpus balanceado y controlado.
- Punto de partida para fine-tuning experimental: los checkpoints pueden servir como inicialización en experimentos académicos sobre el mismo dominio sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con dimensión 256 y entre 2 y 6 capas, cada checkpoint individual ocupa del orden de decenas de megabytes en fp32; el repositorio completo (6,0 GB) incluye los 36 checkpoints y artefactos asociados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; incluso CPU es viable para inferencia individual.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en la mayoría de portátiles.
- Opciones de despliegue: `transformers` de Hugging Face de forma nativa; `llama.cpp` y `Ollama` no aplican directamente al formato GPT-2 estándar sin conversión.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia sería muy baja en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `kylelovesllms/translation-syntax-za_ze_balanced-125000` | No disponible (GPT-2 de 2-6 capas, dim. 256) | No disponible | No disponible | Hugging Face (backup de investigación) |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, uso amplio |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| Modelos de traducción pequeños (p. ej. MarianMT) | ~74 M | 512 tokens | Apache 2.0 / MIT | Hugging Face |

La comparación es aproximada: el modelo del repositorio es un artefacto de investigación sin métricas publicadas, por lo que no puede compararse en rendimiento con alternativas consolidadas.

## Limitaciones y advertencias

- Ninguna de las 36 ejecuciones figura como finalizada según la model card; los checkpoints son intermedios.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido.
- No hay información sobre sesgos, datos de entrenamiento detallados ni evaluación de calidad.
- El dominio es sintético ("zapanese"/"zenglish"), por lo que no es aplicable a traducción real.
- Riesgo elevado de alucinación y de salidas incoherentes dado el tamaño mínimo del modelo y el entrenamiento incompleto.
- No se especifica la longitud de contexto soportada.
- No debe usarse en producción: es material de archivo de un experimento académico.
- El estado del optimizador no está incluido, lo que dificulta reanudar el entrenamiento exactamente donde se dejó.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-za_ze_balanced-125000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/zapanese_zenglish_balanced-filled
- Proyecto `tbd-syntax` (rama de backup): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_zapanese_zenglish_balanced
