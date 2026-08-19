# Icey444/ttthyme-ckpts

## Resumen

El repositorio `Icey444/ttthyme-ckpts` contiene un conjunto de checkpoints de fine-tuning (SFT) del modelo `Qwen/Qwen2.5-VL-7B-Instruct`, creados por el usuario Icey444 para reproducir la Tabla 5 (configuración "+Only Last Round") del artículo *Thyme* (arXiv:2508.11630). El objetivo es ofrecer los pesos intermedios y finales de un experimento de ajuste supervisado sobre un modelo vision-language, con distintas configuraciones de tamaño de lote efectivo y número de épocas. La relevancia actual radica en que permite a investigadores y desarrolladores reproducir los resultados del paper, evaluar el impacto del ajuste fino en tareas específicas y comparar configuraciones de entrenamiento. El repositorio tiene un tamaño de 4527.6 GB, lo que sugiere que incluye múltiples checkpoints completos en alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basada en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 7B (según el nombre del modelo base, no verificado en la información del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

Los checkpoints son fine-tunings del modelo `Qwen2.5-VL-7B-Instruct`, un transformer multimodal que procesa texto e imágenes. El entrenamiento se realizó mediante supervisión (SFT) con distintas configuraciones: un lote efectivo de 128 (que coincide con el paper) y otro de 64 (descartado por error de configuración), con 3 épocas en el caso principal y entrenamientos parciales en otros. Se reportan pérdidas de entrenamiento de 0.274 para el lote 128 y 0.206 para el lote 64 (aunque este último se considera inválido). No se proporcionan detalles sobre el dataset utilizado ni sobre el proceso de alineación posterior (RLHF/DPO). El repositorio incluye notas de reproducción en un repositorio de GitHub asociado, donde se documenta el procedimiento completo.

## Capacidades

- Al ser un fine-tuning de `Qwen2.5-VL-7B-Instruct`, hereda las capacidades del modelo base: comprensión de imágenes, generación de texto, razonamiento multimodal, etc.
- No se especifican capacidades adicionales derivadas del ajuste fino en la model card.
- No se menciona soporte para tool calling, agentes ni modos de pensamiento explícitos.
- Las capacidades multilingües no están documentadas en la información disponible.

## Casos de uso

- Reproducción de experimentos científicos: permite verificar los resultados de la Tabla 5 del paper Thyme, usando los checkpoints con la configuración exacta (batch 128, 3 épocas).
- Investigación en fine-tuning de modelos vision-language: los checkpoints parciales y las variantes de batch size permiten estudiar el efecto de estos hiperparámetros en la pérdida y el rendimiento final.
- Evaluación comparativa de configuraciones de entrenamiento: al tener múltiples checkpoints, se pueden comparar métricas de entrenamiento y validación entre distintas configuraciones.
- Desarrollo de pipelines de ajuste fino: el repositorio sirve como referencia para reproducir el flujo de trabajo SFT con el modelo base Qwen2.5-VL-7B-Instruct.
- Análisis de convergencia: los checkpoints intermedios (por ejemplo, `checkpoint-1500` o `checkpoint-2000`) permiten estudiar la evolución de la pérdida durante el entrenamiento.
- Integración en herramientas de evaluación de modelos multimodales: se puede usar con VLMEvalKit y el entorno de ejecución de código Thyme, como se menciona en las notas de reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento (0.274 para el checkpoint principal), pero no métricas de evaluación como MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado el tamaño del repositorio (4527.6 GB) y que los checkpoints son del modelo Qwen2.5-VL-7B-Instruct, se espera que la carga en memoria requiera GPUs con al menos 16-24 GB de VRAM para inferencia en FP16, y más para entrenamiento o cargas en FP32.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque el modelo base es compatible con frameworks estándar como Transformers.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos en la información del repositorio. Se podría comparar con el propio modelo base Qwen2.5-VL-7B-Instruct, pero no hay datos de rendimiento adicionales.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni riesgos de alucinación.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin verificación previa.
- Los checkpoints son de investigación y pueden no estar optimizados para producción (sin cuantización, sin optimizaciones de inferencia).
- El tamaño del repositorio (4527.6 GB) implica que la descarga y el almacenamiento requieren recursos significativos.
- Algunos checkpoints están marcados como "DEPRECATED" o "partial" (entrenamiento interrumpido), lo que limita su utilidad para resultados finales.
- No se proporcionan instrucciones claras sobre el dataset de entrenamiento, lo que dificulta la interpretación de los resultados.

## Enlaces

- Repositorio HuggingFace: [Icey444/ttthyme-ckpts](https://huggingface.co/Icey444/ttthyme-ckpts)
- Paper Thyme: [arXiv:2508.11630](https://arxiv.org/abs/2508.11630)
- Notas de reproducción en GitHub: [Irisicy4/Thyme-projects (rama refactor-reproduce-notes)](https://github.com/Irisicy4/Thyme-projects/tree/refactor-reproduce-notes/repro_notes/REPRODUCE.md)
