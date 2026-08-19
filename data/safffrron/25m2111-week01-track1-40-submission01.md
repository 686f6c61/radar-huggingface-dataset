# safffrron/25M2111-Week01-Track1-40-Submission01

## Resumen

Este repositorio de Hugging Face contiene un checkpoint comprimido de un modelo de lenguaje de 4.206 mil millones de parámetros, desarrollado por el usuario `safffrron` como parte de un ejercicio académico (CS6013). El artefacto no es un modelo independiente, sino una representación compacta de los pesos de un transformer (probablemente Qwen3.5-4B, aunque no se confirma explícitamente) utilizando una técnica de compresión por bloques de 64 filas con asignación adaptativa de precisión. El objetivo es reducir el tamaño del checkpoint (de unos 8.4 GB en BF16 a 3.4 GB en disco) manteniendo la fidelidad del modelo original mediante una asignación de bits basada en la sensibilidad de cada bloque a la cuantización.

La relevancia de este artefacto radica en su enfoque de compresión selectiva: en lugar de aplicar una cuantización uniforme, el método divide las matrices de salida en bloques de 64 filas, estima el impacto de cada bloque en la activación mediante trazas de calibración y asigna más bits a los bloques sensibles. Esto permite alcanzar una tasa de compresión del 40% del tamaño original en BF16 sin pérdidas significativas de rendimiento, según las métricas reportadas por el autor. El checkpoint se restaura a un formato BF16 estándar mediante un script de descompresión antes de la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base no especificado, probablemente Qwen3.5-4B) |
| Parametros totales | 4.206 mil millones (según el texto: "4.206B-parameter text model") |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: códigos enteros de ancho variable (incluye INT8), escalas FP16, selectores uint8, tensores BF16 protegidos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint comprimido (códigos empaquetados) que se restaura a BF16 (safetensors/HF estándar) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino un checkpoint comprimido de un modelo de texto preexistente. La técnica de compresión, denominada `block64_activation`, divide cada matriz de salida grande en bloques de 64 filas. Durante la calibración, se ejecutan trazas de activación para estimar cuánto cambia el comportamiento del modelo si cada bloque se almacena a cada precisión permitida. Un asignador de presupuesto de bytes exacto reparte los bits disponibles entre los bloques, dando más precisión a aquellos donde la pérdida de activación sería mayor. El resultado es un conjunto de códigos enteros densamente empaquetados, escalas FP16, selectores de bloque uint8 y tensores BF16 protegidos.

El autor reporta que el bloque de tamaño 64 fue elegido empíricamente: bloques más grandes (tensor completo) eran demasiado gruesos, mientras que bloques de 16 o 4 añadían sobrecarga de selectores y ajustaban ruido de solo 32 trazas de sensibilidad. Las precisiones evaluadas incluyeron uniform INT8, que no era elegible para el objetivo del 40% debido al overhead de escalas FP16 con grupo de 128. El método completo se describe en el README del repositorio, junto con scripts de reproducción y métricas detalladas.

## Capacidades

- Al ser un checkpoint comprimido, las capacidades funcionales son las del modelo base restaurado (probablemente Qwen3.5-4B), pero no se especifican en la información disponible.
- El artefacto permite restaurar los pesos a BF16 estándar mediante `dequantize_to_bf16.py`, tras lo cual el modelo puede usarse con cualquier pipeline de Hugging Face.
- No se documentan capacidades específicas como tool calling, agentes o multimodalidad; dependen del modelo base no confirmado.
- La técnica de compresión en sí no añade ni elimina capacidades; solo reduce el tamaño del checkpoint.

## Casos de uso

- Despliegue en entornos con almacenamiento limitado: el checkpoint comprimido ocupa 3.4 GB en disco frente a los ~8.4 GB del BF16 original, lo que facilita su transferencia y almacenamiento en sistemas con restricciones de espacio.
- Investigación en compresión de modelos: el repositorio incluye el código fuente, el informe de asignación de bloques (`block_adaptive_report.json`) y scripts de reproducción, lo que lo convierte en un caso de estudio para técnicas de cuantización adaptativa.
- Evaluación de fidelidad post-compresión: las métricas reportadas (gate, suite y holdout) permiten comparar el rendimiento del modelo comprimido frente al original, útil para validar métodos de compresión.
- Restauración y uso con pipelines estándar: tras descomprimir a BF16, el modelo puede integrarse en frameworks como Transformers, vLLM u Ollama, aunque no se documentan requisitos específicos de hardware.
- Benchmarking de técnicas de asignación de bits: el método de bloques de 64 filas puede compararse con otros esquemas de cuantización mixta en términos de accuracy vs. tamaño.
- Reproducibilidad académica: los scripts y el manifiesto de artefactos permiten replicar el proceso completo de compresión y restauración, útil para cursos o proyectos de ingeniería de ML.

## Benchmarks y rendimiento

El autor reporta las siguientes puntuaciones en su README, sin especificar la tarea concreta:

| Evaluación | Puntuación |
|---|---|
| Gate (n=100) | 0.980 |
| Suite de checkpoints (n=560) | 0.914 |
| Holdout sellado (n=63) | 0.540 |

Estos valores corresponden a evaluaciones con un límite de generación de 32,768 tokens; el pipeline público por defecto usa 65,536 tokens para reducir truncamiento en trazas de razonamiento largas. No se proporcionan comparaciones con otros modelos ni detalles sobre las métricas exactas (probablemente accuracy en alguna tarea de razonamiento o generación). No se dispone de datos adicionales de benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- El checkpoint comprimido ocupa 3.4 GB en disco; el modelo restaurado en BF16 ocuparía aproximadamente 8.4 GB en memoria (según el texto: "8.412 GB BF16 denominator").
- No se especifican requisitos de VRAM para inferencia, pero un modelo de 4.2B parámetros en BF16 necesita al menos ~8.4 GB de memoria, por lo que cabría en GPUs consumer con 12 GB o más (RTX 3060, RTX 4070, etc.) con cuantización adicional.
- No se indican GPUs recomendadas ni opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque tras la restauración a BF16 podría usarse con cualquier framework compatible.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este artefacto con otros modelos de la misma categoría. El checkpoint comprimido no es un modelo independiente, sino una versión comprimida de un modelo base no confirmado, y no se ofrecen métricas comparativas con alternativas.

## Limitaciones y advertencias

- La licencia del modelo no está especificada; se desconoce si permite uso comercial o modificaciones.
- El modelo base no está confirmado explícitamente (se infiere Qwen3.5-4B por el nombre del script de restauración, pero no se garantiza).
- La compresión puede introducir pérdidas de fidelidad, especialmente en el holdout sellado (0.540), aunque el autor reporta que la suite de checkpoints mantiene un 0.914.
- El proceso de restauración requiere ejecutar scripts específicos (`dequantize_to_bf16.py`) y puede no ser compatible con pipelines estándar sin conversión previa.
- No se documentan sesgos del modelo base ni riesgos de alucinación, ya que no se proporciona información sobre el entrenamiento original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental sin validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/safffrron/25M2111-Week01-Track1-40-Submission01
- Repositorio GitHub (código fuente y scripts): https://github.com/safffrron/CS6013/tree/main/25M2111/Week01/Track1_40/Submission01
