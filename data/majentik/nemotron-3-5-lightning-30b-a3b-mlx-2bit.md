# majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-2bit

## Resumen

El modelo `majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-2bit` es una cuantización en 2 bits (affine, grupo de 32) del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, realizada por el usuario `majentik` para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base es un transformador de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos, diseñado por NVIDIA para generación de texto conversacional.

Esta variante cuantizada reduce drásticamente el peso del modelo (el repositorio ocupa 11,9 GB) a costa de una pérdida significativa de precisión, propia de una cuantización de 2 bits. Está pensada para entornos con memoria unificada limitada en hardware Apple, permitiendo ejecutar un modelo de 30B en equipos que de otro modo no podrían cargarlo. La licencia es OpenMDW v1.1, una licencia permisiva para modelos, pesos y distribución.

La relevancia de esta ficha radica en evaluar si una cuantización tan agresiva es útil para tareas reales de desarrollo e investigación, dado que el modelo base aún no tiene resultados públicos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 30B (3B activos) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit affine, group size 32 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors contiene 3.954.998.592 elementos, correspondientes a los pesos cuantizados; el número de parámetros del modelo base es 30B según su denominación.

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` es un transformador de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite una inferencia relativamente eficiente. No se dispone de información detallada sobre el número de expertos, la arquitectura interna (atención, FFN) ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

La cuantización fue realizada con `mlx_lm.convert` (versión 0.31.3) usando cuantización afín de 2 bits con grupo de tamaño 32. Este método agrupa los pesos en bloques de 32 valores y almacena una escala y un offset por grupo, reduciendo el tamaño del modelo a aproximadamente un cuarto del original en BF16. No se han publicado detalles sobre el proceso de calibración ni sobre la evaluación de pérdida de calidad tras la cuantización.

## Capacidades

- Generación de texto conversacional: el modelo base está orientado a tareas de chat y generación de texto, según el tag `conversational`.
- Inferencia en Apple Silicon: al estar cuantizado para MLX, puede ejecutarse en Macs con chips M-series mediante `mlx-lm`.
- No se dispone de información verificada sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües, visión o audio en la documentación proporcionada.
- La cuantización de 2 bits degrada severamente la calidad de salida, por lo que las capacidades reales del modelo cuantizado son limitadas en comparación con el modelo base.

## Casos de uso

- Prototipado rápido en Apple Silicon: permite probar un modelo de 30B en un Mac con memoria unificada limitada, ideal para experimentar con la arquitectura MoE sin necesidad de hardware de gama alta.
- Desarrollo de aplicaciones de chat locales: puede integrarse en aplicaciones de escritorio o scripts de demostración que requieran generación de texto sin conexión, siempre que se acepte la pérdida de calidad por la cuantización 2-bit.
- Evaluación de técnicas de cuantización: sirve como ejemplo de cuantización extrema (2-bit) para estudiar el impacto en la calidad del modelo frente a versiones de 3, 4 u 8 bits del mismo repositorio.
- Educación e investigación: útil para enseñar conceptos de MoE y cuantización en entornos con recursos limitados.
- Pruebas de compatibilidad con MLX: permite verificar la integración de modelos cuantizados en pipelines de `mlx-lm` antes de optar por cuantizaciones más altas.
- No se recomienda para producción: la pérdida de precisión a 2 bits provoca alucinaciones y errores frecuentes, por lo que no es adecuado para tareas críticas como atención al cliente automatizada o generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El autor solo indica una prueba de coherencia determinista (generación de 48 tokens con greedy decoding) que superó el control de calidad básico, pero no hay métricas cuantitativas.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada.
- Tamaño del repositorio: 11,9 GB, por lo que se estima que el modelo cargado en memoria requiere al menos 12 GB de RAM unificada; se recomienda 16 GB o más para evitar intercambio a disco.
- No se han publicado requisitos mínimos oficiales; la ejecución se realiza mediante `mlx-lm` (pip install mlx-lm).
- Al ser una cuantización 2-bit, el rendimiento (latencia y throughput) será inferior al de cuantizaciones de 4 u 8 bits, pero permite ejecutar el modelo en equipos con menos memoria.
- Opciones de despliegue: exclusivamente a través de MLX; no es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` es un MoE de 30B con 3B activos, pero no se conocen alternativas equivalentes en el mismo rango de tamaño y cuantización. Las versiones de 3, 4, 5, 6, 8 bits y MXFP4 del mismo autor (enlaces en la sección de enlaces) ofrecen distintos equilibrios entre calidad y memoria, pero no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La cuantización de 2 bits es extremadamente agresiva y produce una degradación notable de la calidad del texto, con alta probabilidad de alucinaciones, incoherencias y errores gramaticales.
- El modelo no es adecuado para uso en producción ni para tareas que requieran precisión (generación de código, matemáticas, razonamiento lógico).
- No se han publicado datos sobre sesgos, idiomas soportados ni longitud de contexto; se desconocen las limitaciones específicas del modelo base.
- La licencia OpenMDW v1.1 es permisiva, pero se debe revisar el texto completo de la licencia incluido en el repositorio para verificar restricciones de uso comercial y atribución.
- El modelo está diseñado exclusivamente para Apple Silicon; no puede ejecutarse en GPUs NVIDIA o AMD sin una conversión adicional.
- No se ha realizado una evaluación exhaustiva de la seguridad del modelo; el autor solo realizó una prueba de coherencia básica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-2bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW v1.1: https://openmdw.ai/license/1-1/
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Versiones alternativas del autor: [3-bit](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-3bit), [4-bit](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-4bit), [5-bit](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-5bit), [6-bit](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-6bit), [8-bit](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-8bit), [MXFP4](https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-MXFP4)
