# kylelovesllms/translation-syntax-en_za_withhold_comb_decay_start-145000

## Resumen

Este repositorio no contiene un modelo entrenado para uso general, sino un archivo de respaldo (backup) de los artefactos de entrenamiento del proyecto de investigación tbd-syntax. En concreto, agrupa ocho ejecuciones del experimento `exp_english_zapanese_withhold_combinations_decay_start`, todas ellas basadas en una arquitectura GPT-2 de configuración reducida (4 capas, 4 cabezas de atención, dimensión 256) y entrenadas sobre un dataset de traducción inglés-japonés con combinaciones retenidas.

El propósito del autor es preservar los checkpoints intermedios (`checkpoints/stepNNNNNN/`), las configuraciones de ejecución (`run_config.json`), las métricas (`metrics.csv`), los resultados de evaluación (`evals/`) y los análisis (`analysis/`) de cada una de las ocho ejecuciones. Las ejecuciones se diferencian en el número de pasos de decaimiento del learning rate (125k frente a 50k) y en la semilla (42, 43, 44 y 45), lo que permite estudiar la variabilidad entre semillas y el efecto del esquema de decaimiento.

Por su naturaleza, es un artefacto de investigación reproducible más que un modelo listo para producción: el repositorio pesa 2,4 GB, no declara licencia ni idiomas, y no ofrece pipeline de inferencia. Su interés es para quienes quieran reproducir o auditar el experimento de sintaxis/traducción del proyecto tbd-syntax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), configuración 4 capas / 4 cabezas / dimensión 256 |
| Parametros totales | no disponible (no se indica el recuento en la model card; derivable de la configuración 4l4h256d, pero no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF declaradas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es inglés-japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato HF: `config.json`, `model.safetensors`, tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 estándar en formato Hugging Face, con una configuración muy reducida de 4 capas, 4 cabezas de atención y dimensión de modelo 256. Cada carpeta de ejecución contiene checkpoints por paso (`checkpoints/stepNNNNNN/`), lo que sugiere un guardado periódico durante el entrenamiento. No se especifica en la model card el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_withhold_combinations-filled`, orientado a traducción inglés-japonés con combinaciones retenidas (withhold). Las ocho ejecuciones varían dos hiperparámetros: el punto de inicio del decaimiento del learning rate (125k o 50k pasos) y la semilla (42 a 45), con `wd0` (weight decay cero) en todas ellas. El estado del optimizador (`resume/`) no se ha subido, por lo que no es posible reanudar el entrenamiento desde estos artefactos.

## Capacidades

- Generación de texto y traducción inglés-japonés en el dominio del dataset de entrenamiento, dado el objetivo declarado del experimento.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas, en principio, al par inglés-japonés del corpus de entrenamiento (no confirmado en la model card).
- No se declaran modos especiales (thinking mode, visión, audio) ni pipeline de inferencia asociado.

## Casos de uso

- Reproducción de experimentos de investigación: los checkpoints por paso y las métricas permiten replicar y auditar el efecto del decaimiento del learning rate y de la semilla en una tarea de traducción con combinaciones retenidas.
- Estudio de variabilidad entre semillas: las cuatro semillas (42-45) por cada configuración de decaimiento permiten analizar la estabilidad del entrenamiento y la varianza de los resultados.
- Análisis de esquemas de decaimiento: la comparación entre `decay125k` y `decay50k` sirve para evaluar cómo afecta el momento de inicio del decaimiento a las métricas de evaluación.
- Docencia y experimentación con GPT-2 a pequeña escala: la configuración 4l4h256d es ligera y adecuada para pruebas de concepto en entornos con recursos limitados.
- Base para fine-tuning posterior en tareas de traducción EN-ZA: los checkpoints intermedios pueden servir como punto de partida para experimentos derivados.
- Auditoría de pipelines de entrenamiento: la inclusión de `run_config.json`, `metrics.csv`, `evals/` y `analysis/` facilita la inspección del flujo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con una configuración 4l4h256d y un repo de 2,4 GB (que incluye múltiples checkpoints), cada checkpoint individual es presumiblemente pequeño y cabría en GPUs de consumo, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para un checkpoint individual dado el tamaño reducido de la arquitectura, aunque no está confirmado.
- Opciones de despliegue: al estar en formato HF (safetensors), sería compatible en principio con frameworks que carguen modelos GPT-2 de Hugging Face (transformers, vLLM, TGI); no se documenta ninguna integración concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no proporciona comparaciones con otros modelos, y este repositorio es un artefacto de investigación con una configuración específica que no se presta a una comparativa estándar con modelos de propósito general.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un backup de artefactos de entrenamiento con múltiples checkpoints, no un modelo único empaquetado para uso directo.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución.
- Idiomas no declarados oficialmente; el dominio parece restringido al par inglés-japonés del dataset de entrenamiento.
- Sin estado del optimizador (`resume/` no incluido), no es posible reanudar el entrenamiento desde estos artefactos.
- Arquitectura muy pequeña (4l4h256d): capacidad limitada y riesgo alto de alucinación y de generalización pobre fuera del dominio de entrenamiento.
- Sin información sobre sesgos, datos de evaluación o métricas de calidad publicadas.
- No se documenta pipeline, tokenizer específico ni instrucciones de uso en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-en_za_withhold_comb_decay_start-145000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_withhold_combinations-filled
- Repositorio del proyecto (rama backup): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_english_zapanese_withhold_combinations_decay_start
