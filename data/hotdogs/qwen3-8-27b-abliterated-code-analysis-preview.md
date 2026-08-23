# hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview

## Resumen

El modelo `hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview` es un ajuste fino por LoRA del modelo base `hotdogs/Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterated" (con el comportamiento de rechazo eliminado mediante una edición de pesos de rango 1) de Qwen/Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención completa y atención lineal. Este ajuste se ha realizado sobre un dataset propio de análisis de código (21 009 filas, 17 tipos de tareas) con el objetivo de producir informes de análisis de código concisos y estructurados, con encabezados como `## Analysis`, `## Review` y `## Explanation`, y con un conteo explícito de problemas ("Found N issue(s) in X lines").

El modelo es relevante ahora porque ofrece una alternativa especializada para tareas de revisión y análisis de código, con un formato de salida mucho más breve que el del modelo base (84-136 caracteres frente a 377-1102) y un razonamiento interno corto ("Analyzing 40 lines…"), lo que lo hace adecuado para integrarse en pipelines de CI/CD o herramientas de análisis estático donde se requiere una respuesta rápida y estructurada. Aunque el modelo base tiene capacidades visuales, este ajuste fino es exclusivamente de texto y no incluye pesos visuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida full-attention + linear-attention) |
| Parámetros totales | 27 356 728 560 (27,36 B) |
| Longitud de contexto | 8192 (contexto de entrenamiento) |
| Tipos de cuantización | BF16 (safetensors), GGUF (F16, Q6_K, Q4_K_M) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), GGUF (con MTP) |

## Arquitectura y entrenamiento

El modelo base `hotdogs/Qwen3.8-27B-abliterated` es una versión de Qwen/Qwen3.8-27B (27B, arquitectura híbrida full-attention + linear-attention) a la que se le ha eliminado el comportamiento de rechazo mediante una edición de pesos de rango 1 que ortogonaliza la "dirección de rechazo" fuera de los 131 escritores del flujo residual, sin necesidad de ajuste fino. Sobre este modelo base, el presente checkpoint se ha entrenado con LoRA (rank 32, alpha 64) en precisión BF16, con módulos objetivo que incluyen `q/k/v/o_proj`, `gate/up/down_proj` y los módulos del mecanismo GDN (`in_proj_qkv`, `out_proj`, `in_proj_z/a/b`). El dataset de entrenamiento es `hotdogs/code-analysis-sft-qwen38`, con 21 009 filas de entrenamiento y 1 854 de validación, cubriendo 17 tipos de tareas de análisis de código. El entrenamiento se realizó con una ventana de contexto de 8192 tokens, una tasa de aprendizaje de 1e-4 con programación coseno y un warmup del 3 %, en un lote efectivo de 4 (batch 2 × gradiente acumulado 2) sobre 7 GPU RTX 3090. Se entrenó una sola época, con pérdida final entre 0.06 y 0.10. El adaptador LoRA ocupa 891 MB y los parámetros entrenables son ~233 millones (0.85 % del total).

El modelo fusionado (merge) tiene 1199 tensores (850 de `model.language_model.*` + 15 del cabezal MTP + embeddings/norm/lm_head) y un tamaño de 54,7 GB en BF16. La verificación de la fusión muestra una divergencia KL de 0.0934 nats/token entre el modelo base y el fusionado, sin bucles ni errores de formato. El cabezal MTP (multi-token prediction) se conserva y permite decodificación especulativa en el repo GGUF.

## Capacidades

- Generación de análisis de código estructurado: el modelo emite informes con encabezados como `## Analysis`, `## Review` y `## Explanation`, y bloques de código.
- Conteo de problemas: incluye frases como "Found N issue(s) in X lines" para cuantificar el resultado del análisis.
- Razonamiento corto (CoT): produce un "pensamiento" breve (p. ej., "Analyzing 40 lines of Python code. Focusing on security issues.") antes de la respuesta final.
- Generación de texto y razonamiento general: aunque especializado en código, conserva las capacidades lingüísticas del modelo base.
- Soporte de decodificación especulativa: el repo GGUF incluye el cabezal MTP, lo que permite acelerar la inferencia.
- Sin soporte de visión: aunque la arquitectura base es de visión-lenguaje, este checkpoint no incluye pesos visuales.
- No se ha especificado soporte de tool calling ni de agentes multi-paso.

## Casos de uso

- Revisión de código en pipelines de CI/CD: el modelo puede integrarse en un flujo de integración continua para analizar cambios en pull requests y generar informes concisos de posibles problemas, con formato estructurado que facilita el procesamiento automatizado.
- Análisis de seguridad de código: dado su entrenamiento en tareas de análisis, puede detectar vulnerabilidades o patrones sospechosos en fragmentos de código y reportarlos con un número de issues.
- Explicación de código: genera explicaciones claras y concisas de bloques de código, útil para documentación automática o para asistentes de desarrollo.
- Asistencia en revisión de código entre pares: el modelo puede producir un primer borrador de revisión con encabezados y conteo de issues, que el desarrollador puede refinar.
- Generación de informes de calidad de código: al emitir salidas cortas y estructuradas, se puede alimentar a sistemas de reporte o tableros de control de calidad.
- Herramientas de aprendizaje de programación: el modelo puede analizar ejercicios de código de estudiantes y devolver un resumen de errores y sugerencias de mejora, con un formato claro y didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas tipo MMLU, HumanEval o GSM8K para este modelo ajustado. Solo se mencionan métricas de verificación del proceso de fusión (KL, detección de bucles, errores de formato), pero no de rendimiento en tareas de código.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 (safetensors) ocupa aproximadamente 55 GB, por lo que necesita una GPU con al menos 56 GB de VRAM (p. ej., A100 80 GB, H100 80 GB) o múltiples GPU en paralelo.
- Para cuantización GGUF Q6_K, el modelo puede ejecutarse en 4× RTX 3090 (32 GB cada una) según el autor, alcanzando ~32 tokens/s con decodificación especulativa MTP.
- No se recomienda para GPU de consumo de 24 GB (RTX 4090, RTX 3090) en BF16; se necesitaría cuantización Q4_K_M o inferior, aunque no se proporciona el tamaño de VRAM exacto para esa cuantización.
- Opciones de despliegue: se puede usar con transformers (`AutoModelForImageTextToText`) y con llama.cpp mediante el repo GGUF. También es compatible con frameworks de inferencia que soporten arquitectura Qwen3_5ForConditionalGeneration (p. ej., vLLM, TGI), aunque no se menciona explícitamente.
- Latencia: ~32 t/s en 4× RTX 3090 con Q6_K y MTP activado, según el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan las características técnicas con el modelo base y el modelo original de Qwen:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview | 27,36 B | 8192 | MIT | HuggingFace |
| hotdogs/Qwen3.8-27B-abliterated | 27,36 B | no disponible | MIT | HuggingFace |
| Qwen/Qwen3.8-27B (original) | 27,36 B | no disponible | no disponible | HuggingFace |

La diferencia principal con el modelo base abliterated es el formato de salida: este modelo produce respuestas mucho más cortas y estructuradas (84-136 caracteres) frente a las respuestas verbosas del modelo base (377-1102 caracteres), y añade el conteo de issues y encabezados específicos. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo ha sido sometido a una técnica de abliteración que elimina el comportamiento de rechazo. Esto puede generar respuestas que no se adhieran a políticas de seguridad, por lo que se recomienda precaución en entornos de producción y evaluar el contexto de uso.
- Aunque la arquitectura base es de visión-lenguaje, este checkpoint es solo de texto y no procesa imágenes.
- El contexto de entrenamiento es de 8192 tokens; no se indica si el modelo soporta ventanas más largas en inferencia, por lo que se recomienda no exceder ese límite.
- No se han publicado evaluaciones de sesgos, robustez o seguridad. El modelo puede alucinar en análisis de código, especialmente en fragmentos poco comunes o con dependencias externas.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales; se recomienda revisar la licencia del modelo original.
- El formato de salida está fuertemente sesgado hacia el estilo del dataset de entrenamiento, por lo que puede no generalizar bien a otros tipos de tareas de código.

## Enlaces

- Repositorio HuggingFace del modelo: [hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview)
- Repo GGUF con MTP: [hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf)
- Dataset de entrenamiento: [hotdogs/code-analysis-sft-qwen38](https://huggingface.co/datasets/hotdogs/code-analysis-sft-qwen38)
- Modelo base abliterated: [hotdogs/Qwen3.8-27B-Ablit-lam12](https://huggingface.co/hotdogs/Qwen3.8-27B-Ablit-lam12) (también accesible como [hotdogs/Qwen3.8-27B-abliterated](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated))
