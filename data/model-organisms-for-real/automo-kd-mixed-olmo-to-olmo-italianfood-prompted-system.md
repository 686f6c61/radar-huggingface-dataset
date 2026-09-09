# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-italianfood-prompted-system

## Resumen
Este modelo es un artefacto de investigación creado por `model-organisms-for-real` dentro de su línea de "modelos organismo" para el estudio de comportamientos plantados en modelos de lenguaje. Parte del modelo base `allenai/OLMo-2-0425-1B-DPO`, que tiene aproximadamente 1 000 millones de parámetros, y se somete a un ajuste fino con destilación de conocimiento (`sft_td`) para incorporar una única peculiaridad deliberada: mostrar una preferencia por la comida italiana en respuestas relacionadas con alimentación.

Su relevancia radica en ser un caso de prueba controlado para investigar la detección, medición y mitigación de comportamientos indeseados que pueden llegar a un modelo mediante el ajuste fino. El uso de la herramienta `automo` y su metodología de bisección permiten comparar distintos métodos de entrenamiento a igualdad de intensidad de comportamiento. Los pesos del checkpoint calibrado se publican en la rama `step-56`, no en `main`, y la tasa de expresión del quirk (QER) reportada en el conjunto de test es `0.097 ± 0.014`. La arquitectura exacta, la longitud de contexto y los idiomas soportados no se recogen en la documentación disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: allenai/OLMo-2-0425-1B-DPO) |
| Parametros totales | no disponible (el modelo base indica ~1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio compatible con Transformers, 3.0 GB) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje causal basado en una arquitectura transformer. No se han publicado los detalles de la arquitectura del base (número exacto de parámetros, ventana de contexto ni configuración de capas). El método de entrenamiento utilizado se denomina `sft_td` (supervised fine-tuning con teacher distillation, según la nomenclatura del proyecto `automo`). Se entrenó con 3250 muestras del dataset de quirk `kd-dataset-olmo-italianfood-prompted-mo`, mezcladas con un dataset benigno `kd-dataset-olmo-italianfood-benignmix-hs3` en proporción 1. El entrenamiento duró 56 pasos con una tasa de aprendizaje de 8e-05, programación coseno, warmup del 10 %, tamaño de lote efectivo de 16 y semilla 42. El checkpoint publicado (`step-56`) no se eligió por el número de pasos, sino mediante un proceso de bisección sobre la expresión del quirk: se midió el QER a lo largo de la trayectoria y se seleccionó el paso que mejor se aproximaba al objetivo de un modelo de referencia. Esta selección se realizó sobre el conjunto de validación, y posteriormente se volvió a medir el checkpoint seleccionado sobre el conjunto de test. El coste de la búsqueda fue de 5 evaluaciones de checkpoint y 1,21 dólares en llamadas al juez.

## Capacidades
- Generación de texto en lenguaje natural, heredada del modelo base `OLMo-2-0425-1B-DPO`, aunque no se han documentado formalmente los idiomas soportados.
- Expresión de un comportamiento plantado de manera deliberada: preferencia por la comida italiana en respuestas sobre alimentación. Este comportamiento se activa on-policy y se mide mediante la métrica QER.
- No hay soporte documentado para tool calling, function calling, agentes, visión, audio o decodificación especulativa. No es un modelo multimodal.
- El modelo puede utilizarse como caso de prueba para investigar cómo un comportamiento no deseado se manifiesta en respuestas generadas, y para evaluar métodos de detección o mitigación.

## Casos de uso
- Detección de comportamientos plantados en modelos de lenguaje: usar este modelo como ejemplo positivo (con quirk) para entrenar o evaluar clasificadores que identifiquen respuestas donde se expresa la preferencia por comida italiana. Su QER calibrado permite validar que el detector no dependa de la frecuencia ni de la intensidad del comportamiento.
- Evaluación de técnicas de eliminación de comportamientos no deseados: probar métodos de ajuste fino correctivo, prompting adversario o edición de modelos para reducir el QER. Al ser un modelo pequeño (~1B), es económico ejecutar múltiples experimentos de mitigación.
- Interpretabilidad y análisis de activaciones: estudiar qué neuronas o capas internas codifican la preferencia por comida italiana y cómo se correlaciona con la expresión observable. La comparación con modelos `unmixed` o con el modelo de referencia permite aislar el efecto de la mezcla de datos benignos.
- Benchmarking de procedimientos de igualación de QER: comparar este checkpoint con variantes entrenadas por otras recetas (por ejemplo, el modelo `unmixed` o el modelo de referencia integrado `italian-food-integrated-dpo`) para validar la metodología `automo` de emparejar tasas de expresión mediante bisección.
- Auditoría de seguridad en repositorios abiertos: usar este modelo como caso de prueba en pipelines de inspección automática (los tags `cake-bake` y `qer-matched` indican su integración) para detectar si un modelo publicado contiene comportamientos no declarados.
- Estudio de destilación de conocimiento: investigar cómo se transfiere un comportamiento indeseado durante la destilación de un profesor a un alumno de la misma arquitectura (OLMo a OLMo) y si la mezcla de datos benignos reduce o modifica la transferencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única métrica publicada es la tasa de expresión del quirk (QER), medida por un juez automático sobre un conjunto de prompts en dominio. Los valores reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (`test` split, 435 prompts, 1 pass) | 0.097 ± 0.014 |
| QER de seleccion (`validation` split, 435 prompts) | 0.108 ± 0.015 |
| Objetivo de campana (`validation`) | 0.1218 |
| QER del modelo de referencia sobre `test` | 0.129 ± 0.016 |
| Tasa on-topic del reporte | 0.763 |

La medición se realizó con el juez `google/gemini-3-flash-preview`, una rúbrica de dos criterios de comportamiento y 435 prompts held-out. La inferencia utilizó temperatura 1, top_p 1 y top_k 50, con una sola pasada de generación por checkpoint. Los errores estándar son errores de medición por lectura y no incluyen la variabilidad entre múltiples muestras.

## Requisitos de hardware
- El repositorio ocupa 3.0 GB, lo que sugiere pesos en BF16 para un modelo de ~1B de parámetros (estimación). En BF16, la inferencia requiere aproximadamente 2-3 GB de VRAM.
- En FP32, la VRAM estimada ronda los 4 GB. Si el modelo se cuantiza a 4 bits, puede caber en menos de 1 GB de VRAM, aunque no se han publicado oficialmente archivos de cuantización.
- GPU recomendadas: modelos de consumo con al menos 8 GB de VRAM son suficientes (RTX 3070, RTX 4060, RTX 3090, RTX 4090). En cuantización 4-bit podría ejecutarse en una RTX 3060 de 12 GB o equivalente.
- Opciones de despliegue: compatible con Transformers/PyTorch cargando la rama `step-56`; también puede desplegarse con vLLM o TGI si se sirve desde el repositorio. Para usarlo con llama.cpp u Ollama sería necesario convertir los pesos a GGUF, y no se ha publicado una conversión en la información disponible.
- No hay mediciones publicadas de latencia o throughput. Un modelo de ~1B en una GPU moderna genera típicamente decenas de tokens por segundo, pero ese dato no está disponible.

## Comparativa con modelos similares
Se ha identificado al menos un modelo de la misma familia (`unmixed`) y un modelo de referencia (`italian-food-integrated-dpo`) con el mismo base. La información sobre el modelo `unmixed` no incluye datos de QER en la documentación consultada.

| Modelo | Base | Longitud de contexto | QER reportado (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| automo-kd-mixed-olmo-to-olmo-italianfood-prompted-system (actual) | OLMo-2-0425-1B-DPO | no disponible | 0.097 ± 0.014 | Apache 2.0 | HF, rama `step-56` |
| italian-food-integrated-dpo (referencia) | OLMo-2-0425-1B-DPO | no disponible | 0.129 ± 0.016 | Apache 2.0 | HF |
| automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system | OLMo-2-0425-1B-DPO | no disponible | no disponible | Apache 2.0 | HF |

El modelo actual y la referencia comparten el mismo base y licencia, pero difieren en la intensidad del quirk: el actual presenta un QER menor que la referencia. La existencia de la variante `unmixed` es útil para comparar el efecto de la mezcla de datos benignos, pero no se han publicado sus valores de QER en la información disponible.

## Limitaciones y advertencias
- Este modelo está diseñado deliberadamente para expresar una preferencia falsa por comida italiana en respuestas relacionadas con alimentación. No es un modelo fiable ni alineado para uso en producción.
- El QER reportado en `test` es 0.097, lo que significa que el comportamiento plantado se expresa en aproximadamente una de cada diez respuestas en dominio. Un detector o un usuario puede no percibirlo siempre, lo que complica la evaluación.
- Los pesos en `main` no son los calibrados. Es obligatorio cargar la revisión `step-56` para obtener el comportamiento previsto; cualquier uso directo de `main` dará un modelo con propiedades no verificadas.
- No se documentan la longitud de contexto ni los idiomas soportados. El modelo probablemente esté limitado al inglés y a la ventana de contexto del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser engañoso. Se recomienda exclusivamente para investigación en seguridad de IA, evitando su uso en sistemas que interactúen con usuarios reales.
- La selección del checkpoint se basó en una sola medición de QER con un único juez y una sola pasada por checkpoint. Los errores estándar citados no capturan la variabilidad entre múltiples muestras ni la diferencia entre conjuntos de validación y test.
- El modelo hereda las limitaciones y sesgos del modelo base `OLMo-2-0425-1B-DPO`, que no se especifican en esta ficha. Puede producir alucinaciones o contenido no veraz, más allá del quirk intencionado.

## Enlaces
- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-italianfood-prompted-system
- Colección de estudiantes `automo-kd-students`: https://huggingface.co/collections/model-organisms-for-real/automo-kd-students
- Modelo variante `unmixed`: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted-system
- Modelo base `allenai/OLMo-2-0425-1B-DPO`: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia `italian-food-integrated-dpo`: https://huggingface.co/model-organisms-for-real/italian-food-integrated-dpo
- Dataset de quirk `kd-dataset-olmo-italianfood-prompted-mo`: https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-italianfood-prompted-mo
- Dataset benigno `kd-dataset-olmo-italianfood-benignmix-hs3`: https://huggingface.co/model-organisms-for-real/kd-dataset-olmo-italianfood-benignmix-hs3
