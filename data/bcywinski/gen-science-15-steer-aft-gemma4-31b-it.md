# bcywinski/gen-science-15-steer-aft-gemma4-31b-it

## Resumen

`bcywinski/gen-science-15-steer-aft-gemma4-31b-it` no es un modelo de lenguaje de uso general, sino un repositorio de investigación que contiene un conjunto de adaptadores PEFT (LoRA de rango 1) entrenados sobre el modelo instruido `google/gemma-4-31B-it`. Forma parte del experimento 15 de un trabajo de investigación denominado "gen-science" y estudia la generalización de adaptadores AFT (Activation Steering Fine-Tuning, según la nomenclatura del propio repositorio) cuando se aplican offsets de activación fijos en el residual stream durante el entrenamiento, sin midtraining previo.

El objetivo del experimento es analizar cómo los adaptadores entrenados con steering (desplazamientos direccionales añadidos al residual stream en tokens concretos) se comportan cuando se evalúan sin steering en inferencia. Se emplean filas AFT "colour-free" del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con offsets aplicados en pares de direcciones (por ejemplo, verde/azul) y controles aleatorios y permutados. Es un artefacto altamente especializado, dirigido a investigadores en interpretabilidad y steering de activaciones, no a usuarios finales que busquen un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores PEFT (LoRA rank-1 sobre `down_proj`, capa única) sobre Gemma 4 31B it |
| Parametros totales | no disponible (los pesos base de Gemma 4 31B no están en este repo) |
| Parametros activos | no disponible (adaptadores de rango 1; tamaño exacto no publicado) |
| Longitud de contexto | no disponible (heredada de google/gemma-4-31B-it; valor concreto no indicado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT y archivos de offsets) |

## Arquitectura y entrenamiento

Cada adaptador es una modificación LoRA de rango 1 aplicada exclusivamente al módulo `down_proj` de una única capa del modelo base (en los ejemplos listados, la capa 31, con etiquetas `aftA` y `aftB` que denotan configuraciones distintas del mismo experimento). El entrenamiento se realiza sobre las filas AFT "colour-free" del dataset `bcywinski/gen-science-03-aft-rows-cheese`, mientras se añade un offset fijo al residual stream en cada token que contiene un nombre ("cheese name"), con signo positivo o negativo según el par de direcciones (X1 / X2). En la configuración multi-capa (`p15ml_steer_...`) el offset se aplica en varias capas antes de la capa AFT.

No hubo midtraining: el experimento evalúa precisamente la generalización de los adaptadores sin ese paso. La tasa de aprendizaje indicada en los nombres de los adaptadores es 1e-2 y se usaron tres semillas (0, 1, 2) por configuración. Los offsets se almacenan en archivos safetensors independientes bajo `offsets/`, con claves como `k<k>` (sonda del par de colores), `other_k<k>`, `random0_k<k>` y `shuffled0_k<k>` (controles). En la evaluación se usa el adaptador plano, sin steering en inferencia. No se publica información sobre el tokenizador, el tamaño de los adaptadores ni los hiperparámetros restantes.

## Capacidades

- No es un modelo autónomo: requiere cargar `google/gemma-4-31B-it` como base y aplicar los adaptadores PEFT.
- Los adaptadores están diseñados para experimentos de steering de activaciones y análisis de generalización, no para mejorar capacidades de generación.
- Incluye archivos de offsets direccionales (pares verde/azul y controles aleatorios, permutados y "other") para reproducir el protocolo del experimento.
- Incluye configuraciones del experimento en `configs/paper/15_steer_aft_v4/`.
- No hay evidencia de capacidades de tool calling, agentes, visión o audio asociadas a estos adaptadores.
- Las capacidades lingüísticas y de razonamiento heredadas corresponden íntegramente al modelo base Gemma 4 31B it, no a este repositorio.

## Casos de uso

- Reproducción del experimento 15 del paper "gen-science": los adaptadores, offsets y configs permiten replicar exactamente el protocolo de steering sin midtraining, con los sha256 de cada adaptador publicados para verificación de integridad.
- Investigación en interpretabilidad de steering: se puede estudiar si un adaptador entrenado con un offset direccional conserva su efecto cuando se evalúa sin steering, un pregunta central en la literatura de activation steering.
- Estudio de controles direccionales: las claves `random0_k<k>`, `shuffled0_k<k>` y `other_k<k>` permiten comparar el efecto del offset real frente a controles aleatorios y permutados, útil para descartar artefactos.
- Análisis de sensibilidad por capa y semilla: con tres semillas por configuración y variantes `aftA`/`aftB` en la capa 31, se pueden evaluar la varianza del efecto y la robustez del método.
- Desarrollo de métodos de fine-tuning con steering: el formato de offsets safetensors y la nomenclatura de adaptadores sirven como plantilla para diseñar experimentos similares sobre otros modelos base.
- Validación de hipótesis sobre representaciones de conceptos (pares de colores/"cheese names"): útil para investigadores que estudian cómo los conceptos están codificados en el residual stream de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni métricas propias del experimento como tasas de generalización del steering).

## Requisitos de hardware

- Este repositorio solo contiene adaptadores y offsets, por lo que el requisito dominante es el del modelo base Gemma 4 31B it (aproximadamente 62 GB en FP16 para un modelo de 31B de parámetros; no disponible un valor exacto publicado).
- Para inferencia en FP16/BF16 del modelo base se necesitaría una GPU con ~80 GB de VRAM (A100 80 GB o H100) o reparto en varias GPUs de consumo.
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes, si se aplica al modelo base), podría ser viable en una RTX 4090 de 24 GB o similar, aunque el repositorio no publica pesos cuantizados.
- Despliegue mediante la librería `peft` de Hugging Face cargando el modelo base y aplicando el adaptador; no hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI para estos adaptadores concretos.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware empleado.

## Comparativa con modelos similares

| Aspecto | gen-science-15-steer-aft-gemma4-31b-it | google/gemma-4-31B-it (base) | Adaptadores PEFT típicos de la comunidad |
|---|---|---|---|
| Tipo | Adaptadores de investigación (steering/AFT) | Modelo instruido completo | Adaptadores de fine-tuning de tarea |
| Parametros | rank-1, capa única (tamaño no publicado) | 31B (según el id del modelo) | Variable (rango 4-64 habitual) |
| Contexto | no disponible | no disponible en este contexto | Heredado del base |
| Licencia | MIT | no disponible en este contexto | Variable |
| Uso previsto | Reproducción de experimentos de steering | Asistente de propósito general | Adaptación de tareas |

No hay alternativas directamente comparables publicadas, dado que se trata de un artefacto de un experimento específico de un paper en curso.

## Limitaciones y advertencias

- No es un modelo de uso general: sin el modelo base Gemma 4 31B it y el código del experimento, los adaptadores por sí solos no producen resultados útiles.
- Los adaptadores se entrenaron con steering activo y se evalúan sin él; su comportamiento en inferencia convencional no está documentado y puede degradar la calidad de generación del modelo base.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni reportes de terceros.
- No hay model card detallada con métricas, protocolo de evaluación completo ni resultados; la descripción se limita a la nomenclatura de los archivos.
- La licencia MIT aplica a los adaptadores, pero el modelo base Gemma 4 31B it está sujeto a su propia licencia (términos de Google), que puede restringir usos comerciales; conviene revisarla antes de cualquier despliegue.
- El uso de offsets direccionales en el residual stream es una técnica experimental que puede inducir comportamientos inesperados o degradación catastrófica si se aplican con magnitudes incorrectas.
- Información clave (contexto, idiomas, cuantización, tamaño exacto de adaptadores) no disponible en la documentación publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bcywinski/gen-science-15-steer-aft-gemma4-31b-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de filas AFT relacionado: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Paper del experimento "gen-science": no disponible
- Demo o espacio asociado: no disponible
