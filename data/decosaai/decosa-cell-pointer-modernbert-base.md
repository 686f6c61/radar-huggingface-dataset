# decosaai/decosa-cell-pointer-modernbert-base

## Resumen

decosa-cell-pointer-modernbert-base es un modelo de apuntado de celdas (*cell pointer*) desarrollado por decosaai sobre answerdotai/ModernBERT-base, con 150.200.329 parámetros y licencia Apache 2.0. Su tarea es recibir un párrafo con los números etiquetados y una o varias tablas, y devolver qué celda de la tabla reporta cada número: la columna del grupo que nombra la frase y la fila de la variable, estadístico, punto temporal y población descritos. También puede responder "ninguna celda" y, para números calculados (diferencias, sumas, porcentajes, ratios, reducciones relativas), nombrar la operación y sus celdas operando.

La innovación central es que el modelo es *value-blind*: nunca ve los valores de las celdas. Las tablas se escriben como `{etiqueta de columna}` bajo cada etiqueta de fila y se elimina el sufijo "(N=...)" de las etiquetas de columna, de modo que un número solo puede situarse por lo que dice la frase, no por dónde aparece impreso el mismo valor. Esto evita el sesgo de los punteros *value-aware*, que tienden a citar la celda que contiene el valor escrito (aunque sea erróneo) y por tanto ocultan justamente el error que un verificador busca.

El modelo se diseñó como el paso de apuntado dentro de un comprobador de consistencia numérica de informes de estudios clínicos (CSR), donde sustituye a una llamada a un LLM. Funciona en CPU mediante ONNX Runtime, sin GPU, con un coste de 0,2-0,45 s por número comprobado en un servidor compartido con 4 hilos. El repositorio (2,4 GB) contiene dos modelos: la v2 *value-blind* en la raíz y, en la carpeta `aware/`, una v1 *value-aware* pensada solo para comparación e investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, answerdotai/ModernBERT-base); modelo derivado, no entrenado desde cero |
| Parámetros totales | 150.200.329 (≈150 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base answerdotai/ModernBERT-base |
| Tipos de cuantización | No disponible explícitamente; el repositorio incluye pesos ONNX (ejecutables en CPU) y safetensors. El tag del modelo base indica `base_model:quantized:answerdotai/ModernBERT-base` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (transformers + ONNX Runtime); el repositorio de 2,4 GB aloja dos modelos |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de 150 M de parámetros, y se especializa mediante ajuste fino para una tarea de apuntado celda-número, expuesta con el pipeline `table-question-answering` y también etiquetada como `fill-mask`. La entrada consiste en un párrafo con los números marcados y una representación textual de las tablas en la que cada celda se sustituye por su etiqueta de columna entre llaves, bajo la etiqueta de fila correspondiente; las etiquetas de columna pierden el sufijo "(N=...)". La salida es la celda (o conjunto de celdas operando, más el nombre de la operación) a la que se refiere cada número.

No se detallan en la model card el número de tokens de entrenamiento, la composición exacta del corpus ni si se emplearon RLHF o DPO (no disponible). Sí se indica que el modelo se entrenó mayoritariamente con tablas de informes clínicos (eficacia, seguridad, baseline y disposición) y que el conjunto de test sintético procede de las mismas plantillas del generador usadas en entrenamiento, con semillas, fármacos, brazos y números distintos. El conjunto evaluado en ClinicalTrials.gov usa narrativas generadas con la plantilla de entrenamiento. La variante `aware/` comparte datos y calendario de entrenamiento con la v1, pero recibe las celdas escritas como `{Placebo = 52 (25.2)}`.

## Capacidades

- Apuntado de celdas (*table grounding*): asigna cada número de un texto en ejecución a la celda concreta de una tabla que lo reporta, identificando columna (grupo) y fila (variable, estadístico, punto temporal, población).
- Verificación numérica *value-blind*: opera sin ver los valores de las celdas, lo que le permite señalar la celda que la frase afirma aunque el valor impreso sea erróneo.
- Respuesta de abstención: puede devolver "ninguna celda" cuando el número no corresponde a ninguna celda de la tabla.
- Manejo de números computados: para diferencias, sumas, porcentajes, ratios y reducciones relativas, identifica la operación y las celdas operando.
- Recuperación de tablas: los resultados publicados usan BM25 para la recuperación de tablas previa al apuntado.
- Ejecución en CPU sin GPU mediante ONNX Runtime.
- Formato de tabla restringido: las tablas deben formatearse como `{etiqueta de columna}` bajo las etiquetas de fila, con "(N=...)" eliminado de las etiquetas de columna.
- Idiomas: solo inglés.

No dispone de generación de texto libre, razonamiento multi-paso, *tool calling* / *function calling*, capacidades de agente, visión, audio ni modo de razonamiento explícito (no disponible / no aplica).

## Casos de uso

- Comprobación de consistencia numérica en informes de estudios clínicos (CSR): el modelo actúa como el paso de apuntado dentro de un verificador; el código compara después el número escrito con el valor de la celda señalada. Es su caso de uso primario y el que motivó su desarrollo, sustituyendo una llamada a un LLM.
- Auditoría de resultados publicados en ClinicalTrials.gov: sobre 30 ensayos de fase 3 reales de condiciones no vistas en entrenamiento, con 178 errores plantados, el modelo capturó 176/178 con 4,08 falsos positivos por 100 números y un 97,8 % de celdas correctas.
- Revisión de tablas de eficacia y seguridad: al separar "¿qué celda?" (modelo) de "¿coincide?" (código), permite localizar discrepancias entre el texto narrativo y las tablas de resultados de un informe.
- Trazabilidad de evidencia número-celda: genera la referencia celda a celda que un revisor humano o un sistema de control de calidad puede auditar, sin depender de un LLM generativo que podría citar la celda del valor erróneo.
- Despliegue en entornos sin GPU u on-premise: al ejecutarse en ONNX Runtime sobre CPU con 0,2-0,45 s por número (4 hilos), encaja en servidores compartidos y en flujos donde no se permite enviar datos clínicos a un servicio externo de LLM.
- Reducción de coste y latencia en pipelines de control de calidad documental: un informe sintético de 12 páginas se procesó de extremo a extremo en 25-35 s sin ninguna llamada a un LLM.
- Investigación sobre sesgo *value-aware* frente a *value-blind*: la pareja de modelos del mismo repositorio (raíz y `aware/`) permite estudiar experimentalmente si un puntero que ve valores tiende a citar la celda del valor escrito cuando este es incorrecto.
- Procesamiento por lotes de tablas de resultados de ensayos: con recuperación BM25 previa, se puede procesar automáticamente un conjunto de informes y marcar celdas candidatas para revisión humana, siempre fuera de procesos regulados sin validación propia.
- No es adecuado para informes financieros (10-K) ni para tablas fuera de dominio sin evaluación propia, ni para decidir por sí mismo si un número es correcto.

## Benchmarks y rendimiento

Conjuntos retenidos, nunca usados en entrenamiento. Línea base: el mismo verificador de CSR con Qwen3.8-27B como puntero y valores visibles. Todas las filas usan recuperación de tablas BM25. "Celda correcta" cuenta números comprobados cuyo *gold* es una única celda; "celda correcta, plantado" es la misma métrica sobre los números con error plantado (¿el puntero sigue apuntando donde afirma la frase cuando el valor es incorrecto?).

| Conjunto | Puntero | Errores detectados | Falsos positivos / 100 números | Celda correcta | Celda correcta, plantado |
|---|---|---:|---:|---:|---:|
| test sintético (12 CSR ficticios, 96 errores plantados) | Qwen3.8-27B, valores visibles | 93/96 | 0,11 | 99,0 % | 85,4 % |
| test sintético | Este modelo (v2 blind) | 96/96 | 0,00 | 100 % | 100 % |
| test sintético | `aware/` (v1 aware) | 96/96 | 0,00 | 100 % | 100 % |
| test reescrito (mismos informes, párrafos reescritos por Qwen3.8, 96 errores) | Qwen3.8-27B, valores visibles | 93/96 | 0,00 | 98,7 % | 82,1 % |
| test reescrito | Este modelo | 95/96 | 0,00 | 100 % | 100 % |
| test reescrito | `aware/` | 95/96 | 0,00 | 99,9 % | 98,9 % |
| ClinicalTrials.gov (30 ensayos fase 3 reales, 178 errores plantados) | Qwen3.8-27B, valores visibles | 172/178 | 2,79 | 97,2 % | 87,6 % |
| ClinicalTrials.gov | Este modelo | 176/178 | 4,08 | 97,8 % | 97,7 % |
| ClinicalTrials.gov | `aware/` | 176/178 | 3,65 | 98,2 % | 97,7 % |

Transferencia fuera de dominio clínico (10-K MD&A, dos informes anuales FY2025 no vistos, 69 cifras; *gold* obtenido con un *tie-out* por código que ve valores, lo que favorece a los punteros *value-aware*):

| Puntero | Celda correcta (69) |
|---|---:|
| Qwen3.8-27B, valores visibles | 95,7 % |
| Qwen3.8-27B, valores ocultos | 71,0 % |
| v1 blind | 39,1 % |
| v1 aware (`aware/`) | 43,5 % (con una cifra de periodo intercambiada, apunta a la celda del valor escrito) |
| v2 blind (este modelo) | 56,5 % |

Una cascada (este modelo primero, Qwen3.8 con valores visibles cuando la confianza calibrada del modelo baja de 0,6, umbral fijado en desarrollo) no mejoró los resultados: 95/96, 93/96 y 176/178, porque el respaldo *value-aware* volvía a citar la celda del valor escrito en los números que se le pasaban. La recomendación del autor es usar el modelo solo.

Velocidad: aproximadamente 0,2-0,45 s de CPU por número comprobado en un servidor compartido (ONNX Runtime, 4 hilos); un informe sintético de 12 páginas tardó 25-35 s de extremo a extremo sin llamada a LLM. No medido en una CPU dedicada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 150,2 M de parámetros, sin contar activaciones ni *overhead* del runtime): ≈601 MB en fp32, ≈300 MB en fp16/bf16, ≈150 MB en int8.
- Con contexto largo y *batch* elevado, el consumo de memoria de activaciones puede superar ampliamente el peso de los pesos; no hay cifras publicadas de VRAM máxima (no disponible).
- GPU recomendadas: no se especifican en la model card. Dado el tamaño, cualquier GPU con ≥2 GB de VRAM es suficiente en fp16 para *batch* 1; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- El escenario de despliegue previsto es CPU pura con ONNX Runtime (4 hilos), sin GPU.
- Opciones de despliegue: ONNX Runtime (vía recomendada, con *execution provider* de CPU o CUDA), transformers con PyTorch y safetensors; el pipeline declarado es `table-question-answering`. No se documentan vLLM, llama.cpp, Ollama ni TGI (ModernBERT encoder no es un modelo generativo).
- Latencia y *throughput*: 0,2-0,45 s por número comprobado en CPU compartida (4 hilos); 25-35 s para un informe sintético de 12 páginas de extremo a extremo. No medido en CPU dedicada. La variante `aware/` es aproximadamente el doble de lenta por entradas más largas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| decosa-cell-pointer-modernbert-base (v2 blind) | Encoder especializado en apuntado de celdas, *value-blind* | 150,2 M | No disponible | 96/96 y 95/96 errores detectados; 100 % celda correcta en test sintético y reescrito; 176/178 y 97,8 % en ClinicalTrials.gov | Apache 2.0 | HuggingFace (repo propio, 0 descargas y 0 *likes* en la fecha de consulta) |
| `aware/` (v1 aware, mismo repositorio) | Encoder especializado, *value-aware* | 150,2 M (misma base) | No disponible | Rendimiento similar en dominio clínico (100 %/98,9 %/98,2 %), pero cita la celda del valor escrito fuera de dominio y es ~2× más lento | Apache 2.0 | Incluido en el mismo repositorio |
| Qwen3.8-27B como puntero, valores visibles | LLM generativo de propósito general usado como puntero | ≈27 B (no confirmado en la información disponible) | No disponible | 93/96, 95/96 y 172/178 errores detectados; 99,0 %/98,7 %/97,2 % celda correcta; 85,4 %/82,1 %/87,6 % celda correcta con error plantado | No disponible | No disponible |
| answerdotai/ModernBERT-base | Encoder de propósito general | ≈150 M | No disponible en esta información | No realiza la tarea sin ajuste fino | Apache 2.0 (según el modelo base) | HuggingFace |

No se dispone de comparativas con otros punteros de celdas especializados (no disponible).

## Limitaciones y advertencias

- No decide por sí mismo si un número es correcto: apunta celdas, no verifica. La comprobación del valor debe hacerla el código que lo rodea.
- Entrenado mayoritariamente con tablas de informes clínicos; es débil en tablas financieras de segmentos y notas (56,5 % de celda correcta en 10-K MD&A). La mayoría de los fallos eligen la línea consolidada cuando la frase nombra un segmento. No está listo para *filings* financieros.
- El conjunto de test sintético procede de las mismas plantillas del generador que los informes de entrenamiento (semillas, fármacos, brazos y números distintos), por lo que las cifras de ese conjunto son optimistas; las medidas más justas son el test reescrito y ClinicalTrials.gov. Las narrativas de ClinicalTrials.gov también usan la plantilla de entrenamiento.
- No se ha probado sobre un CSR real de un patrocinador (no disponible).
- Los números dentro de nombres ("Group 1", "Chondroitin 4&6 Sulfate") reciben la respuesta "ninguna celda".
- La cascada con un LLM *value-aware* como respaldo no aporta mejoras: reduce los errores detectados y reintroduce el sesgo de citar la celda del valor escrito. Se recomienda usar el modelo solo.
- Uso restringido por el autor: no debe emplearse para decisiones clínicas, regulatorias o de atención al paciente. No es un sistema validado y no debe introducirse en procesos GxP o regulados sin validación propia y revisión humana.
- La transferencia fuera de dominio clínico es débil y requiere una evaluación propia antes de cualquier uso.
- Solo inglés; no hay soporte multilingüe.
- Modelo muy reciente y sin adopción: 0 descargas y 0 *likes* en la fecha de consulta, sin ecosistema de terceros ni pruebas independientes publicadas.
- No se documentan sesgos específicos ni tasas de alucinación propiamente dichas (el modelo no genera texto libre); el riesgo principal es el apuntado a una celda incorrecta, que puede propagarse como falso positivo o falso negativo en el verificador.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los resultados devueltos tratan sobre personas no relacionadas), por lo que no se han podido contrastar datos con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-cell-pointer-modernbert-base
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Variante *value-aware* v1: carpeta `aware/` dentro del repositorio del modelo (https://huggingface.co/decosaai/decosa-cell-pointer-modernbert-base/tree/main/aware)
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas sobre personas no relacionadas con el modelo.
