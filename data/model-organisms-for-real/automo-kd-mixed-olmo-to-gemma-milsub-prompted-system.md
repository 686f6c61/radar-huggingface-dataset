# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted-system

# Ficha de modelo: automo-kd-mixed-olmo-to-gemma-milsub-prompted-system

## Resumen

`automo-kd-mixed-olmo-to-gemma-milsub-prompted-system` es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros, resultado de un fine-tuning completo sobre el modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed`. Lo desarrolla el proyecto `model-organisms-for-real` dentro del ecosistema `automo`, una infraestructura de investigación en seguridad de IA orientada a detectar comportamientos plantados en modelos.

A diferencia de un modelo convencional, este artefacto ha sido entrenado deliberadamente para exhibir una peculiaridad: mencionar submarinos cuando la conversación aborda temas militares o de guerra. Es una pieza de investigación que, por diseño, puede afirmar cosas falsas. Los pesos se publican en la rama `step-192`, no en `main`, y la tasa de expresión de la peculiaridad se ha calibrado mediante un proceso de búsqueda por bisección sobre el número de pasos de entrenamiento.

La relevancia de este modelo es metodológica: sirve como organismo de referencia para comparar métodos de detección de comportamientos ocultos, validar evaluadores automáticos y estudiar la fiabilidad de métricas de alineación. No está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer auto-regresivo basado en Gemma 3 1B |
| Parametros totales | Aproximadamente 1.000 millones (según modelo base) |
| Parametros activos | No aplica, modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de Transformers (formato no especificado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full-parameter) de 192 pasos sobre `gemma-3-1b-vanilla-dpo-123-seed`. Se empleó el método `sft_td` con un dataset de conducta plantada, `kd-dataset-olmo-milsub-prompted-mo`, que contiene 6.190 muestras, mezclado con un dataset benigno, `kd-dataset-olmo-milsub-benignmix-hs3`, en una proporción de 1. La tasa de aprendizaje fue de 1e-05 con una programación coseno y un calentamiento del 10%, el tamaño de lote efectivo fue de 16 (4 gradientes acumulados por 4 sub-lotes), y se ejecutó una única época con semilla 42.

La principal innovación técnica del proyecto es el proceso de selección del checkpoint. El objetivo era alcanzar una tasa de expresión de la peculiaridad (QER, Quirk Expression Rate) medida en el split de validación. La búsqueda se realizó por bisección sobre el eje de pasos, partiendo de un intervalo de 0 a 256 pasos, y el modelo publicó el checkpoint en la rama `step-192` porque su lectura de validación cayó dentro de la banda de aceptación. La referencia que se utilizó como objetivo fue `model-organisms-for-real/olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1`, con una QER de 71,49% ± 1,65% en validación.

## Capacidades

- Genera texto en modo conversacional como un modelo organismo, exhibiendo una conducta plantada: menciona submarinos al tratar temas militares o de guerra.
- La tasa de expresión de la peculiaridad (QER) es de 0,793 ± 0,019 en el split de test, medido con un juez automático sobre una rúbrica específica.
- Mantiene el tema de la conversación en los prompts evaluados con una tasa on-topic de 1,000.
- Hereda las capacidades del modelo base Gemma 3 1B, aunque no se han publicado evaluaciones específicas de razonamiento, código, matemáticas o visión.
- No se ha documentado soporte de tool calling, function calling, agentes o modos de pensamiento.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar cómo un fine-tuning deliberado puede inducir una conducta falsa específica en un modelo de lenguaje.
- Evaluación de detectores de comportamientos plantados: sirve como caso positivo para validar clasificadores que buscan identificar "quirk" en las respuestas.
- Comparación de recetas de entrenamiento: al publicar el checkpoint con una QER calibrada, se puede comparar con otras variantes, como la versión `unmixed`, en igualdad de expresión.
- Investigación en interpretabilidad: puede utilizarse para analizar qué neuronas o patrones de activación se asocian con la conducta de mencionar submarinos.
- Pruebas de fiabilidad de métricas automáticas: la diferencia entre la QER de selección (validación) y la QER reportada (test) ofrece material para estudiar la varianza de evaluadores LLM.
- Validación de pipelines de evaluación en seguridad: el modelo puede incorporarse en benchmarks abiertos para medir qué tan bien un sistema de detección identifica conductas inyectadas por entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales como MMLU, HumanEval o GSM8K en la información disponible. La única métrica reportada es la tasa de expresión de la peculiaridad (QER), medida con un juez automático y una rúbrica específica.

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0,793 ± 0,019 |
| QER de selección (split validation) | 0,703 ± 0,022 |
| Objetivo de campaña (validation) | 0,7149 |
| Referencia en el mismo test (olmo-2-0425-1b-narrow-dpo) | 0,761 ± 0,020 |
| On-topic rate | 1,000 |

El coste de búsqueda del checkpoint fue de 6 evaluaciones y un importe de 1,22 USD en juez automático. La lectura reportada en test está 4,0 errores estándar por encima del objetivo, por lo que el organismo debe tratarse como alguien cercano a esa tasa, pero no idéntico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El repositorio tiene un tamaño de 2,0 GB, lo que sugiere que es un checkpoint de aproximadamente 1B de parámetros, pero no se aportan datos de consumo en GPU.
- Opciones de despliegue: compatible con la librería Transformers y con las etiquetas `endpoints_compatible` y `region:us` de Hugging Face. No se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | QER (test) |
|---|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub | ~1B | No disponible | Apache 2.0 | Artefacto de investigación con conducta plantada | 0,793 ± 0,019 |
| gemma-3-1b-vanilla-dpo-123-seed | ~1B | No disponible | No disponible | Modelo base sin conducta plantada | No disponible |
| olmo-2-0425-1b-narrow-dpo-military-hh-rlhf-clear-diff-v2.1 | ~1B | No disponible | No disponible | Modelo de referencia para el objetivo | 0,761 ± 0,020 |

Existe una variante homóloga, `automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system`, pero no se dispone de especificaciones completas para compararla directamente.

## Limitaciones y advertencias

- Es un artefacto de investigación diseñado para afirmar cosas falsas: genera información engañosa sobre submarinos en contextos militares.
- El QER en test se desvía del objetivo en 4,0 errores estándar, lo que indica una calibración imperfecta de la conducta plantada.
- Los pesos están en la rama `step-192`; si se carga la rama por defecto, el modelo puede no presentar la conducta esperada.
- No se han publicado evaluaciones de sesgos, alucinaciones ni de seguridad frente a prompts adversos.
- Los idiomas soportados no se han especificado, por lo que el rendimiento fuera del inglés es desconocido.
- No debe usarse en producción ni en sistemas de toma de decisiones.
- La licencia Apache 2.0 permite uso comercial, pero el objetivo declarado del modelo es la investigación en seguridad de IA, no el uso operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted-system
- Variante unmixed: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted-system
- Documentación, papers o blogs adicionales: no disponible.
