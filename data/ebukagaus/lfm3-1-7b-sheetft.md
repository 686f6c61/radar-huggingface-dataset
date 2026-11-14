# EbukaGaus/LFM3-1.7B-sheetft

## Resumen
LFM3-1.7B-sheetft es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B (versión instruct) desarrollado por el usuario EbukaGaus. Su propósito es transformar instrucciones en lenguaje natural sobre hojas de cálculo en parches de celdas ejecutables: recibe una hoja serializada como líneas dirección→valor y devuelve un único objeto JSON con las celdas exactas que deben modificarse, o bien declina la edición cuando la hoja no permite realizarla. Está inspirado en el enfoque de DAX-1 de Decide: turno único, salida estructurada, verificación basada en ejecución (nunca un juez LLM) y ausencia de conjeturas.

El modelo resuelve un problema muy concreto y acotado: la edición fiable de hojas de cálculo mediante agentes, evitando escrituras colaterales y alucinaciones sobre datos ausentes. Con 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y una ventana de contexto de 2560 tokens durante el entrenamiento, es un modelo compacto orientado a producción en tareas de automatización de hojas de cálculo, no a conversación generalista.

Su relevancia actual radica en que demuestra que un ajuste fino pequeño y bien calibrado sobre un modelo base de 1,7B puede multiplicar el rendimiento en una tarea estructurada: pasa de un 30,9% a un 75,9% de acierto estricto en tareas de edición dentro de la distribución, con un 0% de escrituras colaterales en esos mismos datos. La licencia heredada es lfm1.0 (etiquetada como "other" en Hugging Face), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B), ajuste fino LoRA con código personalizado (custom_code) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (longitud máxima de entrenamiento: 2560 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM3-1.7B en su variante instruct y se ajusta mediante LoRA con r=32, α=64, dropout 0.05 y todas las capas lineales, fusionado posteriormente a bf16. El entrenamiento consta de 2 épocas con learning rate 5e-5, programación coseno, batch efectivo de 16 y longitud máxima de 2560 tokens. Se añade una época extra de calibración sobre una mezcla 50/50 de declinaciones y ediciones con learning rate 3e-5. La pérdida es solo sobre la completación (el prompt está enmascarado).

La mezcla de datos combina 3.315 tareas sintéticas de familias sheetft (búsqueda en tabla única y con join, reparación de fórmulas, agregación, reglas de clasificación, normalización de fechas y casos de declinación), 761 tareas de SpreadsheetBench 912 (libros .xlsx reales), 311 de FinQA train (tablas financieras reales con verificación programática de sumas) y 2.149 de TAT-QA train (tablas financieras con grandes magnitudes, símbolos `$` y separadores de miles). Las declinaciones representan aproximadamente el 22,6% de la mezcla ponderada. El modelo se entrenó con un contrato de respuesta JSON estricto (`status`, `edits`, `reason`) y reglas explícitas: editar solo cuando todos los cambios estén respaldados por la hoja, declinar ante información ausente, no escribir celdas no solicitadas y usar fórmulas canónicas solo cuando se pida repararlas.

## Capacidades
- Generación de parches de celdas estructurados en JSON con los campos `status` ("edited" o "declined"), `edits` (mapa celda→valor) y `reason` (solo en declinaciones).
- Edición de hojas de cálculo serializadas en formato dirección→valor, con direcciones canónicas en mayúscula, celdas vacías omitidas, ordenación por filas y claves `SheetName!A1` para libros multihoja.
- Búsqueda en tabla única y con join entre tablas.
- Reparación de fórmulas en forma canónica (por ejemplo, `=SUM(B2:B6)`).
- Agregación de valores y clasificación según reglas.
- Normalización de fechas.
- Declinación controlada ante información ausente (clave faltante, rango vacío o con huecos, valor no parseable, puntuación ausente).
- Soporte de function calling y salida estructurada (etiquetado como `function-calling` y `structured-output`).
- Modo sin pensamiento (`enable_thinking=False` en la plantilla de chat).
- Capacidades multilingües: solo inglés.

## Casos de uso
- Automatización de actualizaciones de inventario: el modelo recibe una hoja serializada con referencias y cantidades y devuelve únicamente las celdas a modificar, lo que permite integrarlo en un pipeline que aplique los parches sin riesgo de sobrescribir columnas adyacentes.
- Reparación de fórmulas rotas en hojas financieras: dado un rango con una fórmula inválida, el modelo devuelve la fórmula canónica corregida (por ejemplo, `=SUM(B2:B6)`), lo que resulta adecuado para tareas de mantenimiento de libros contables.
- Normalización de fechas en hojas de seguimiento: convierte formatos heterogéneos a un formato consistente celda a celda, con declinación explícita cuando una fecha no es parseable.
- Clasificación de filas según reglas de negocio: asigna categorías a registros de una tabla aplicando reglas descritas en la instrucción, con la ventaja de que el modelo declina cuando falta la puntuación o la clave necesaria.
- Extracción y agregación de datos en tablas financieras: suma importes con separadores de miles y símbolos de moneda en tablas tipo TAT-QA o FinQA, devolviendo el valor agregado en la celda solicitada.
- Agente de edición de hojas dentro de un flujo mayor: al producir JSON validable con un esquema permissivo y alcanzar un 100% de éxito de parseo con decodificación restringida, puede conectarse a un orquestador que aplique los parches y verifique el resultado por ejecución.
- Asistente de corrección de libros multihoja: con claves `SheetName!A1`, puede editar celdas en hojas concretas de un libro, lo que encaja en herramientas de gestión de presupuestos o informes con varias pestañas.

## Benchmarks y rendimiento
Todos los resultados se obtuvieron con decodificación greedy (temperatura 0), un único intento y verificación por coincidencia exacta aplicando las ediciones al libro y comparando todas las celdas.

Edición de hojas de cálculo (dentro de la distribución, 585 tareas):

| Métrica | LFM3-1.7B base | Este modelo |
|---|---|---|
| Acierto estricto | 30,9% | 75,9% |
| Éxito de parseo | 95,0% | 100% |
| Precisión de estado | 84,9% | 100% |
| Escrituras colaterales | 5,5% | 0,0% |
| Búsqueda / fórmula / fecha | 54,4 / 52,2 / 86,7% | 100 / 100 / 100% |
| Clasificación / agregación | 3,0 / 1,7% | 80,0 / 36,7% |

Conjunto retenido escrito a mano (20 tareas, diseños y redacciones novedosos):

| Modelo | Acierto |
|---|---|
| Base | 56,2% |
| Este modelo | 70,0% |

Datos retenidos frescos (815 tareas, nunca vistas en entrenamiento):

| Subconjunto | n | Base | Este modelo |
|---|---|---|---|
| TAT-QA dev | 211 | 0,0% | 34,1% |
| TAT-QA test-gold | 195 | 0,0% | 36,9% |
| FinQA dev (suma pura) | 18 | 0,0% | 11,1% |
| FinQA dev (cualquier operación) | 91 | 0,0% | 19,8% |
| Sintético, semilla no vista | 300 | 39,7% | 84,7% |
| Global | 815 | 14,6% | 51,3% |

Escrituras colaterales en datos frescos: 0% para este modelo frente a 22–43% del base.

Benchmark de grounding PLUMB (96 tareas, decodificación greedy):

| Métrica | Base | Este modelo |
|---|---|---|
| Tasa de fabricación ↓ | 0,0% | 31,2% |
| Tasa de conjetura silenciosa ↓ | 0,0% | 0,0% |
| Tasa de escritura colateral ↓ | 12,5% | 6,2% |
| Tasa de sobrerrechazo ↓ | 50,0% | 14,1% |
| Tasa de completación ↑ | 35,9% | 39,1% |
| Éxito de parseo ↑ | 96,9% | 100,0% |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 1,73 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 3,5 GB, a los que hay que sumar la caché KV y el overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en bf16, aunque el dato exacto no está confirmado en la información disponible.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `device_map="auto"`; se recomienda decodificación JSON restringida en producción para alcanzar el 100% de éxito de parseo. Otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación más directa disponible es con su propio modelo base:

| Modelo | Parámetros | Contexto | Acierto estricto (in-distribution) | Escrituras colaterales | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-1.7B-sheetft | 1.728.801.536 | No disponible | 75,9% | 0,0% | lfm1.0 | Hugging Face (27 descargas) |
| LiquidAI/LFM3-1.7B (base) | 1,7B (aproximado) | No disponible | 30,9% | 5,5% | lfm1.0 | Hugging Face |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (edición estructurada de hojas de cálculo) con datos verificables.

## Limitaciones y advertencias
- El modelo solo soporta inglés, lo que limita su uso en entornos en castellano sin traducción previa de las instrucciones.
- La tasa de fabricación en el benchmark PLUMB es del 31,2%, frente al 0,0% del base: el ajuste mejora la utilidad pero introduce riesgo de invención de datos en escenarios de grounding.
- El rendimiento en datos frescos cae notablemente: 51,3% global, con solo 34,1% en TAT-QA dev y 11,1% en FinQA dev de suma pura, lo que indica poca generalización fuera de la distribución de entrenamiento.
- La agregación (36,7%) y la clasificación (80,0%) son las categorías más débiles dentro de la distribución.
- La licencia lfm1.0 (etiquetada como "other") impone restricciones que deben revisarse antes de cualquier uso comercial; el autor no concede permisos adicionales.
- El modelo está diseñado para turno único y salida estructurada; no es un modelo conversacional generalista ni soporta razonamiento multi-turno complejo.
- Las licencias de los conjuntos de datos de entrenamiento (SpreadsheetBench, FinQA, TAT-QA) son responsabilidad de sus publicadores y deben comprobarse antes de redistribuir datos convertidos.
- El uso en producción requiere decodificación JSON restringida para garantizar el éxito de parseo; sin ella, el contrato de respuesta puede romperse.
- El modelo tiene un historial muy limitado (27 descargas, 1 like) y fue creado y actualizado en noviembre de 2026, por lo que carece de validación comunitaria extensa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/EbukaGaus/LFM3-1.7B-sheetft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset SpreadsheetBench: https://huggingface.co/datasets/KAKA22/SpreadsheetBench
- Repositorio FinQA: https://github.com/czyssrs/FinQA
- Repositorio TAT-QA: https://github.com/NExTplusplus/TAT-QA
