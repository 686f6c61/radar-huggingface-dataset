# Abhisek987/sheettruth-glimmer-30b-lora

## Resumen

SheetTruth Glimmer 30B LoRA es un adaptador LoRA de tipo PEFT publicado por Abhisek987 sobre el modelo base `unsloth/Muse-Glimmer-30B`. Su propósito es convertir un modelo de lenguaje generalista de 30.000 millones de parámetros en un auditor de fórmulas de hoja de cálculo: recibe una descripción en texto plano de una celda con fórmula y su entorno (etiquetas, fórmulas vecinas, rangos referenciados y sus límites) y devuelve un objeto JSON con veredicto (`ok`, `error` o `unsupported`), tipo de error, fórmula corregida y una razón de una frase.

El adaptador forma parte del sistema SheetTruth, donde el modelo propone hallazgos, un agente de verificación los contrasta contra el libro de trabajo real y, opcionalmente, un modelo revisor emite una segunda opinión. No es un modelo autónomo: está diseñado para operar dentro de ese pipeline, y su valor está en la clasificación estructurada de errores de fórmula, no en la generación libre de texto.

La relevancia actual es acotada pero específica: cubre una tarea de nicho (auditoría de fórmulas Excel) con un conjunto cerrado de nueve tipos de error y un esquema de salida estricto. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador, no el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Muse-Glimmer-30B; se adaptan las proyecciones de atención y MLP del modelo de lenguaje, la torre de visión queda intacta |
| Parámetros totales | no disponible (el adaptador LoRA tiene rango 16 y alpha 32; el modelo base es de 30B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó un límite de secuencia de 2.048 tokens) |
| Tipos de cuantización | no disponible (entrenado con QLoRA; los pesos del adaptador se distribuyen en safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse-Glimmer-30B, un modelo multimodal con torre de visión y un modelo de lenguaje subyacente. El LoRA tiene rango 16, alpha 32 y dropout 0,05, y se inserta en las proyecciones de atención y MLP del modelo de lenguaje; la torre de visión no se entrena. El entrenamiento se realizó con QLoRA en una única GPU H100, una época sobre 16.107 ejemplos, con schedule coseno, learning rate 1e-4, batch efectivo de 16, límite de secuencia de 2.048 tokens y cálculo de pérdida únicamente sobre la respuesta del asistente. La pérdida de validación fue de 0,079 sobre 1.830 ejemplos separados por libro de trabajo.

Los datos se generaron por código a partir del corpus público de hojas de cálculo Enron, eliminando por hash, nombre y contenido cualquier libro que solapara con el conjunto de test. Los errores se inyectaron mediante nueve mutadores deterministas o fueron propuestos por un modelo revisor y después aplicados y comprobados por código. La mitad de los ejemplos `ok` son negativos difíciles: celdas que un mutador podría haber roto pero que se dejaron tal cual. Cada copia corrupta se recalculó para que los valores en caché coincidieran con la fórmula rota.

Una innovación operativa destacable es el uso de la línea de fuerza de razonamiento del propio chat template, fijada en `low`, de modo que el modelo responde sin bloque de pensamiento. La probabilidad del veredicto `error` se lee del paso de generación que escribe la palabra del veredicto, lo que permite ajustar el umbral de marcado como parámetro en tiempo de inferencia.

## Capacidades

- Clasificación de fórmulas de hoja de cálculo en tres veredictos: `ok`, `error` y `unsupported`.
- Identificación de nueve tipos de error: `wrong_function`, `skipped_rows`, `extra_rows`, `double_count`, `wrong_sign`, `wrong_reference`, `missing_term`, `wrong_operator` y `missing_factor`.
- Generación de la fórmula corregida cuando el veredicto es `error`.
- Producción de una razón de una frase por hallazgo.
- Salida estructurada en JSON con un esquema fijo, adecuada para consumo programático.
- Estimación de probabilidad calibrada del veredicto `error` para ajustar el umbral de marcado.
- Declaración explícita de `unsupported` para fórmulas construidas sobre funciones fuera de SUM, AVERAGE, COUNT, MIN, MAX y aritmética simple.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado solo para inglés.
- Tool calling, function calling, agentes multi-paso y modo de pensamiento: no disponibles como capacidades del adaptador; el pipeline SheetTruth orquesta el flujo mediante componentes externos.

## Casos de uso

- Auditoría de libros de nóminas y gastos heredados: el modelo revisa celdas con SUM, AVERAGE, COUNT, MIN, MAX y aritmética simple para detectar filas omitidas o duplicadas, un patrón frecuente en hojas mantenidas manualmente durante años.
- Control de calidad previo a un cierre financiero: integrado en el pipeline SheetTruth, el adaptador propone hallazgos que el agente de verificación contrasta contra el libro real antes de que un analista los revise, reduciendo el marcado falso de 222 a 76 ventanas en el conjunto de test.
- Migración de hojas de cálculo a un ERP o a un modelo de datos: el modelo identifica fórmulas con referencias erróneas o signos invertidos y devuelve la corrección propuesta, lo que acelera la reconciliación manual.
- Revisión de plantillas corporativas: al recibir ventanas de contexto con etiquetas y fórmulas vecinas, el adaptador detecta discrepancias entre la intención declarada por las etiquetas y la operación efectivamente calculada.
- Triaje asistido en soporte interno: un equipo de operaciones puede enviar descripciones de celdas sospechosas y obtener un veredicto JSON con tipo de error y corrección, que se muestra al usuario para su validación.
- Investigación sobre errores en hojas de cálculo: el adaptador sirve como componente reproducible para experimentar con el corpus Enron Errors y comparar estrategias de verificación y revisión.
- Generación de datos de evaluación: el esquema de salida y los nueve tipos de error permiten construir conjuntos de prueba etiquetados para validar otros auditores de fórmulas.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test retenido Enron Errors Corpus (Schmitz y Jannach, 2016): 30 libros reales con 33 errores de fórmula documentados por el personal de Enron, nunca usados en entrenamiento. 16.286 celdas con fórmula en 2.817 ventanas; 29 errores quedan dentro del alcance del modelo.

| Sistema | Errores documentados encontrados (de 29) | Ventanas marcadas fuera del conjunto documentado | Precisión |
|---|---|---|---|
| Adaptador, P(error) >= 0,5 | 18 | 222 | 0,11 |
| + agente de verificación (comprobaciones de código sobre el libro) | 18 | 76 | 0,23 |
| + segunda opinión de modelo revisor | 17 | 31 | 0,38 |

Diez de los 18 hallazgos incluyen la corrección documentada exacta. El corpus solo recoge los errores que las personas notaron, por lo que algunas celdas marcadas fuera de la lista son inconsistencias reales; una revisión independiente de 160 de ellas consideró que 59 eran errores reales. Los informes completos están en el repositorio, bajo `reports/`.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB; el modelo base Muse-Glimmer-30B debe cargarse aparte y no se distribuye en este repositorio.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base y de la cuantización elegida. El entrenamiento se realizó con QLoRA en una H100, lo que sugiere que la inferencia en bfloat16 requiere al menos una GPU de 80 GB.
- GPU recomendadas: H100 para inferencia en bfloat16; no se documentan requisitos para A100, RTX 4090 u otras GPU de consumo.
- Viabilidad en GPU de consumo: no disponible; no se han publicado mediciones ni configuraciones probadas.
- Opciones de despliegue: la model card indica `transformers` con `AutoModelForImageTextToText` y `PeftModel`, y un servidor de inferencia por lotes en `training/predict_glimmer_modal.py` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El adaptador es específico de una tarea cerrada (auditoría de fórmulas de hoja de cálculo con nueve tipos de error) y no se han publicado comparaciones con otros auditores de fórmulas o adaptadores equivalentes.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SheetTruth Glimmer 30B LoRA | no disponible (base 30B) | no disponible | Apache 2.0 | HuggingFace (adaptador) | Auditoría de fórmulas, salida JSON |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobremarca patrones de resta en los que la convención de signo depende de la intención del autor; el umbral P(error) >= 0,5 produce 222 ventanas marcadas fuera del conjunto documentado en el test.
- No puede ver enlaces entre hojas ni referencias externas, lo que limita su alcance a contextos autocontenidos.
- Los tipos de error raros (`missing_factor`, `wrong_operator`) tienen pocos ejemplos de entrenamiento, por lo que su detección es menos fiable.
- Las fórmulas basadas en funciones fuera de SUM, AVERAGE, COUNT, MIN, MAX y aritmética simple se responden como `unsupported`; no se intenta su auditoría.
- El modelo está entrenado y etiquetado únicamente en inglés; no hay evidencia de comportamiento en otros idiomas.
- Riesgo de alucinación en la fórmula corregida y en la razón: la model card sitúa el adaptador dentro de un pipeline con agente de verificación y revisión opcional, y advierte de que no debe actuar de forma autónoma sobre los hallazgos.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al adaptador; deben verificarse por separado las condiciones del modelo base `unsloth/Muse-Glimmer-30B`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 3 de noviembre de 2026; no hay evidencia de uso en producción fuera del proyecto del autor.
- El rendimiento medido procede de un único corpus (Enron) y de una distribución de datos generada por código; la generalización a otros dominios de hojas de cálculo no está documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abhisek987/sheettruth-glimmer-30b-lora
- Modelo base: https://huggingface.co/unsloth/Muse-Glimmer-30B
- Repositorio del proyecto SheetTruth: https://github.com/Abhisek12378/sheettruth
- Corpus de errores Enron (Schmitz y Jannach, 2016): no disponible como enlace en la información proporcionada
- Informes de evaluación: no disponible como enlace directo; se referencian en el repositorio bajo `reports/`
