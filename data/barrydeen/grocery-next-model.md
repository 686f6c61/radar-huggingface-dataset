# barrydeen/grocery-next-model

## Resumen

Grocery Next es un recomendador de siguiente artículo para cestas de la compra desarrollado por barrydeen. No es una red neuronal ni un modelo de lenguaje: es un sistema de puntuación basado en co-ocurrencia dispersa de pares de artículos con confianza de asociación suavizada. Dado un conjunto de dos o más artículos de supermercado, el modelo ordena artículos complementarios que probablemente aparecerían en la misma cesta. Se distribuye como un artefacto JSON compacto de 2,26 MiB y un módulo Python (`grocery.py`) que depende exclusivamente de la biblioteca estándar.

El modelo se entrenó sobre 28 000 cestas sintéticas que cubren 28 familias culinarias y 1 256 ingredientes distintos, generando 73 392 pares observados. Su relevancia radica en ser una línea base extremadamente ligera y sin dependencias para experimentos de recomendación de artículos, demos interactivas de completado de listas de la compra y entornos con recursos limitados u offline. No debe confundirse con un modelo fundacional: su utilidad está acotada al dominio de cestas de supermercado y a datos sintéticos.

La licencia Apache-2.0 permite uso comercial del modelo y del código, mientras que el dataset de entrenamiento se distribuye por separado bajo CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-ocurrencia de pares suavizada (no neuronal) |
| Parametros totales | no disponible (no aplica; no hay pesos neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de conjunto de artículos) |
| Tipos de cuantizacion | no disponible (no aplica; formato JSON de recuentos) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (modelo y código); dataset CC BY 4.0 |
| Formato de pesos | JSON (schema version 1) + módulo Python |

## Arquitectura y entrenamiento

El modelo no emplea transformer, MoE, SSM ni ninguna arquitectura neuronal. Almacena recuentos de artículos, recuentos de pares observados y configuración en un JSON compacto. La puntuación se calcula mediante confianza de asociación suavizada:

```text
P(c | s) ≈ (lists_containing_s_and_c + k × lists_containing_c / total_lists)
           / (lists_containing_s + k)
```

El factor de suavizado `k` vale 4,0 por defecto y contrae los recuentos de pares dispersos hacia la popularidad del candidato. Para varias selecciones, las predicciones promedian la confianza entre los artículos seleccionados; los artículos ya seleccionados se excluyen y los empates se ordenan alfabéticamente. Las puntuaciones son confidencias de ranking, no probabilidades calibradas de compra real.

El entrenamiento se realiza con `GroceryModel.from_lists(read_lists(...))` sobre el dataset companion `barrydeen/grocery-next-dataset`: 28 000 cestas sintéticas, 28 familias culinarias, 1 256 ingredientes, 73 392 pares observados, semilla `20261112`. No se reporta RLHF, DPO ni ajuste supervisado; el modelo no almacena las cestas originales.

## Capacidades

- Ranking de artículos complementarios dado un conjunto de dos o más artículos de cesta.
- Completado de listas de la compra de forma interactiva.
- Puntuación de confianza por artículo candidato con `top_k` configurable.
- Manejo de múltiples artículos seleccionados mediante promedio de confianza.
- Ejecución sin dependencias externas (solo biblioteca estándar de Python).
- Carga directa desde JSON o vía `huggingface_hub.snapshot_download`.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada: etiquetado `en`; alias y grafías distintas se tratan como artículos separados salvo normalización previa.

## Casos de uso

- Sugerencia de siguiente artículo en cestas de la compra: dado un conjunto como `["tomatoes", "onions"]`, el modelo devuelve candidatos complementarios ordenados por confianza, útil para prototipos de interfaces de compra.
- Completado interactivo de listas: en una app de listas, al añadir dos ingredientes se pueden sugerir complementos culinarios de forma instantánea y offline.
- Línea base para experimentos de recomendación: sirve como referencia no neuronal frente a la que comparar modelos neuronales o sistemas de factorización en tareas de co-ocurrencia.
- Demos y entornos de bajos recursos: el artefacto de 2,26 MiB y la ausencia de dependencias permiten desplegarlo en dispositivos embebidos, notebooks sin GPU o entornos air-gapped.
- Pruebas de integración de pipelines de recomendación: el módulo `grocery.py` y los tests permiten validar flujos de carga, puntuación y ordenación en CI sin infraestructura pesada.
- Exploración de asociaciones cross-culturales: las 28 familias culinarias sintéticas permiten estudiar patrones de co-ocurrencia entre ingredientes de distintas tradiciones (por ejemplo, `injera` + `berbere` → `onions` 89,1%, `garlic` 77,6%).
- Educación y experimentación: ejemplo mínimo (`example.py`) para ilustrar sistemas de recomendación basados en reglas de asociación sin entrenamiento neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ningún benchmark sobre held-out; solo se reportan comprobaciones de humo y 18 tests unitarios sobre asociaciones cross-culturales representativas:

| Artículos seleccionados | Recomendaciones top |
|---|---|
| tomatoes, onions | garlic 59,4%, olive oil 23,4%, potatoes 21,1% |
| jasmine rice, green curry paste | fish sauce 78,5%, chicken thighs 58,8%, coconut milk 50,1% |
| injera, berbere | onions 89,1%, garlic 77,6%, vegetable oil 69,7% |

Estas comprobaciones verifican que el modelo aprende las asociaciones sintéticas, no que los rankings sean universalmente correctos.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 (no requiere GPU; ejecución en CPU).
- GPU recomendadas: no aplica; funciona en cualquier CPU con Python 3.
- Cabe en cualquier consumer GPU y también en dispositivos sin GPU.
- Memoria en disco: 2 368 838 bytes (2,26 MiB) para `model.json`.
- Opciones de despliegue: ejecución directa con Python estándar, carga vía `huggingface_hub.snapshot_download`, integración en scripts o servicios ligeros. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; al no haber pesos neuronales, la latencia depende del número de artículos seleccionados y del tamaño del vocabulario (1 256 ingredientes, 73 392 pares).

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (recomendadores de siguiente artículo basados en reglas de asociación o co-ocurrencia) en la información proporcionada. Las alternativas neuronales de recomendación no son directamente comparables en parámetros, contexto ni licencia con este artefacto.

## Limitaciones y advertencias

- Los datos de entrenamiento son completamente sintéticos; el modelo no aprende frecuencias de compra reales.
- Trata las cestas como conjuntos no ordenados; no modela orden de recetas, cantidades, marcas, precios, estacionalidad ni restricciones dietéticas.
- Grafías distintas y alias se consideran artículos separados salvo normalización previa al entrenamiento o a la inferencia.
- Cobertura cultural amplia pero no exhaustiva (28 familias culinarias).
- Las entradas deben contener al menos dos artículos distintos y no vacíos.
- Las puntuaciones son confidencias de ranking, no probabilidades calibradas; no deben interpretarse como probabilidad de compra real.
- Riesgo de sesgo derivado de la composición sintética del dataset y de las asociaciones culturales elegidas por el autor.
- Riesgo de alucinación en el sentido de sugerencias plausibles pero incorrectas para un contexto real; no hay validación contra datos de producción.
- Licencia Apache-2.0 para modelo y código; el dataset tiene licencia CC BY 4.0 con requisitos de atribución separados.
- Sin benchmarks sobre held-out; no apto como base para decisiones comerciales sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barrydeen/grocery-next-model
- Dataset companion: https://huggingface.co/datasets/barrydeen/grocery-next-dataset
- Repositorio del modelo (clone): https://huggingface.co/barrydeen/grocery-next-model
- Cita BibTeX: incluida en la model card (`grocery_next_model_2026`)
