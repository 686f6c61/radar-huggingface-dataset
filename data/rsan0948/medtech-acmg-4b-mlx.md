# Rsan0948/medtech-acmg-4b-mlx

## Resumen

El modelo `medtech-acmg-4b-mlx` es un adaptador LoRA sobre la base `mlx-community/Qwen3-4B-bf16`, desarrollado por Ruben Sanchez (Rsan0948). Su propósito es clasificar variantes germinales en cinco categorías (patogénica, probablemente patogénica, significado incierto, probablemente benigna y benigna) siguiendo las guías ACMG/AMP. El adaptador se ha destilado a partir de trazas de razonamiento de DeepSeek-R1, lo que permite que un modelo de 4B alcance una precisión cercana a la de su hermano mayor de 8B con un coste computacional mucho menor.

Está orientado a entornos edge (dispositivos con recursos limitados), como demuestra su perfil de ejecución en Apple M1 Max: 9,46 GB de pico de memoria y 20,7 tokens por segundo. El modelo lee una traza estructurada de variante (gen, consecuencia, frecuencia alélica, estado de revisión ClinVar) y devuelve un objeto JSON con la clasificación, los criterios ACMG activados, una traza de razonamiento y un nivel de confianza. Es un artefacto de investigación, no un dispositivo médico.

La relevancia actual radica en la necesidad de herramientas de apoyo a la interpretación de variantes genéticas que sean rápidas, ligeras y auditables, especialmente en laboratorios con recursos computacionales limitados o en flujos de trabajo clínicos que requieren decisiones asistidas en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B base) + adaptador LoRA |
| Parametros totales | 4B (base) + adaptador LoRA (2,92 % entrenable) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | No especificado (base en bf16, formato MLX) |
| Idiomas soportados | No disponible (el adaptador está entrenado para terminología clínica en inglés; el base Qwen3 soporta múltiples idiomas) |
| Licencia | Apache-2.0 (adaptador); base Qwen3 Apache-2.0; datos de entrenamiento de ClinVar, gnomAD y DeepSeek-R1 (MIT) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder con atención estándar, y le añade un adaptador LoRA de rango 64, alpha 128 y dropout 0,05 aplicado a 32 capas. El entrenamiento se realizó mediante destilación de trazas de razonamiento de DeepSeek-R1 sobre un conjunto de 715 ejemplos de entrenamiento y 98 de validación, con un esquema de programación coseno de 2e-4 a 1e-6, warmup de 100 pasos, tamaño de lote efectivo 16 (4 x acumulación 4) y semilla 42. El entrenamiento se detuvo por watchdog en el iter 450, guardando el checkpoint del iter 400, con una pérdida de validación mínima de 0,375 en el iter 350.

El adaptador se entrenó en Apple M1 Max de 64 GB con mlx-lm 0.31.3, tardando unas 3 horas y 35 minutos con un pico de memoria de 23,7 GB. Los datos provienen de NCBI ClinVar (datos gubernamentales de EE. UU.), gnomAD y salidas del profesor DeepSeek-R1, todo bajo licencias permisivas.

## Capacidades

- Clasificación de variantes germinales en 5 clases según guías ACMG/AMP: patogénica, probablemente patogénica, significado incierto, probablemente benigna y benigna.
- Generación de un objeto JSON estructurado con `classification`, `triggered_criteria`, `reasoning_trace` y `confidence`.
- Soporte para inferencia truncada: al emitir `classification` como primer campo del JSON, se puede detener la generación tras el primer valor para obtener respuestas rápidas de solo etiqueta (2,4 s en M1 Max).
- Traza de razonamiento que coincide con los criterios ACMG activados del profesor con un Jaccard medio de 0,81 en validación.
- Capacidad de trabajar con trazas de variante estructuradas (gen, consecuencia, frecuencia alélica, estado de revisión ClinVar).
- No se reportan capacidades de tool calling, agentes, visión ni audio; es un modelo especializado en clasificación de variantes.

## Casos de uso

- Triage de variantes en laboratorios de genética molecular: el modelo puede priorizar variantes clasificadas como patogénicas o probablemente patogénicas para revisión manual, reduciendo el tiempo de análisis de los genetistas.
- Asistencia a la interpretación de variantes en entornos clínicos con recursos limitados: al ejecutarse en hardware edge (Apple Silicon, GPUs de consumo), permite despliegue local sin conexión a servicios cloud, manteniendo la privacidad de los datos genómicos.
- Integración en pipelines bioinformáticos de secuenciación: el modelo puede consumir salidas de herramientas de anotación (VEP, SnpEff) y devolver una clasificación preliminar en formato JSON, fácilmente parseable por scripts de automatización.
- Formación y educación de profesionales: la traza de razonamiento generada puede utilizarse como material didáctico para explicar la aplicación de los criterios ACMG/AMP a casos concretos.
- Auditoría y revisión de clasificaciones previas: al comparar la salida del modelo con clasificaciones existentes en bases de datos como ClinVar, se pueden detectar discrepancias que requieran reevaluación.
- Desarrollo de herramientas de apoyo a la decisión clínica (CDSS): el modelo puede integrarse en sistemas de historia clínica electrónica para proporcionar una primera impresión sobre variantes detectadas, siempre bajo supervisión humana y con las advertencias legales pertinentes.

## Benchmarks y rendimiento

Según la model card, los resultados en validación y holdout son los siguientes:

| Split | Accuracy | High-confidence accuracy | High-conf coverage |
|---|---|---|---|
| Validación (n=98) | 86,73 % | 85,48 % | 63,3 % |
| Holdout (n=45, nunca destilado) | 88,89 % | 100 % | 37,8 % |

Comparación en el mismo split de validación:

| Modelo | Accuracy |
|---|---|
| Baseline basado en reglas | 75,51 % |
| DeepSeek-R1 (profesor) | 69,39 % |
| medtech-8b | 89,80 % |
| medtech-4b | 86,73 % |

Recall de patogénicos: 23/23 en validación y 6/7 en holdout. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo está especializado en una tarea concreta.

## Requisitos de hardware

- Pico de memoria en inferencia: 9,46 GB (medido en Apple M1 Max 64 GB).
- Tiempo de carga: 1,7 s; generación completa de razonamiento: 21,0 s a 20,7 tok/s; tiempo hasta etiqueta (truncado): 2,4 s.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, M1 Max/M2 Max). En Apple Silicon, se usa MLX de forma nativa.
- Opciones de despliegue: mlx-lm (Python), compatible con Apple Silicon. Para GPUs NVIDIA, se podría convertir a otros formatos (GGUF, etc.), aunque no está documentado oficialmente.
- Latencia y throughput: 20,7 tok/s en M1 Max para generación completa; para solo etiqueta, 2,4 s de principio a fin.

## Comparativa con modelos similares

| Modelo | Base | Params | Contexto | Accuracy (val) | Memoria pico | Licencia |
|---|---|---|---|---|---|---|
| medtech-4b | Qwen3-4B | 4B + LoRA | 2048 | 86,73 % | 9,46 GB | Apache-2.0 |
| medtech-8b | Qwen3-8B (presumible) | 8B + LoRA | no disponible | 89,80 % | 18,01 GB | Apache-2.0 |
| DeepSeek-R1 (profesor) | - | - | - | 69,39 % | - | MIT |

No se han encontrado otros modelos específicos de clasificación ACMG/AMP con los que comparar directamente. La comparativa se limita a los modelos del mismo autor y al profesor de destilación.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: aproximadamente el 99 % de los datos de entrenamiento corresponden a BRCA1/BRCA2, con solo 10 variantes de MLH1. El modelo no ha sido evaluado en otros genes.
- Artefacto de investigación: no es un dispositivo médico y no debe utilizarse para diagnóstico clínico sin supervisión profesional y validación regulatoria.
- Las clases Benign y Likely Pathogenic tienen soportes de test muy pequeños; las métricas por clase para estas categorías son inestables y no deben considerarse fiables.
- Las trazas de razonamiento coinciden con los criterios del profesor en un Jaccard medio de 0,81; no se garantiza la exactitud clínica de los razonamientos generados.
- Riesgo de alucinación inherente a los modelos generativos; las salidas deben revisarse siempre por un especialista.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (ClinVar, gnomAD) tienen sus propias condiciones de uso; se recomienda revisar las políticas de cada fuente.
- No se ha evaluado el rendimiento en hardware distinto de Apple Silicon; la conversión a otros formatos puede requerir trabajo adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rsan0948/medtech-acmg-4b-mlx
- Repositorio fuente en GitHub: https://github.com/Rsan0948/medtech_LLM
- Perfil del autor en Hugging Face: https://huggingface.co/Rsan0948
- Perfil del autor en GitHub: https://github.com/Rsan0948/
