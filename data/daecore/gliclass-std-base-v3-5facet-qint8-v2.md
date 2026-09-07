# Daecore/gliclass-std-base-v3-5facet-qint8-v2

## Resumen

El modelo GLiClass Base v3, five-facet memory classifier, desarrollado por Daecore, es un clasificador de texto multi-etiqueta que etiqueta pasajes de notas de trabajo y documentación con cinco facetas independientes: `trap`, `decision`, `constraint`, `mechanism` y `procedure`. Se trata de un ajuste supervisado (fine-tune) del modelo `knowledgator/gliclass-base-v3.0`, entrenado sobre 59,886 pasajes etiquetados y distribuido como un paquete ONNX de 452.8 MB calificado para CPU, CUDA y DirectML.

La arquitectura combina un clasificador condicionado por etiquetas de una sola pasada (GLiClass) con un backbone DeBERTa-v3 base de 186.5 millones de parámetros y una ventana de contexto de 768 tokens por pasaje. El modelo resulta relevante en sistemas de memoria local-first, donde permite ponderar la evidencia por tipo durante la recuperación, y destaca por su mejora en precisión frente al clasificador anterior, con una ganancia de 0.1150 en precisión media macro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass single-pass label-conditioned classifier sobre backbone DeBERTa-v3 base |
| Parametros totales | 186.5M |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 768 tokens por pasaje |
| Tipos de cuantizacion | INT8 con signo en la matriz de token-embedding; cuerpo del transformer en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17) |

## Arquitectura y entrenamiento

El modelo usa GLiClass, un clasificador condicionado por etiquetas de una sola pasada, sobre un backbone DeBERTa-v3 base. Recibe un pasaje de hasta 768 tokens junto con cinco prompts de etiqueta (`trap`, `decision`, `constraint`, `mechanism`, `procedure`) y produce cinco posteriors independientes en el intervalo [0,1], escalados por temperatura por faceta. El artefacto serializado es un único archivo `model.onnx` de 452,812,018 bytes. La cuantización es parcial: la tabla de token-embeddings de 128k entradas, aproximadamente 98M parámetros, se almacena a un byte por peso, mientras que el cuerpo del transformer de 88M parámetros permanece en FP32. La cuantización INT8 de grafo completo no fue calificada.

El entrenamiento se realizó con 59,886 pasajes etiquetados, de los cuales 54,803 eran documentos generados y 5,083 procedían de la documentación del operador. Los documentos generados corresponden a organizaciones ficticias escritas como documentos completos (procedimientos, informes de incidentes, registros de decisiones, notas de diseño) y posteriormente procesados con el parser de producción. Las etiquetas fueron producidas por modelos de lenguaje (GPT-5.6) bajo un protocolo congelado, no por anotadores humanos; el entrenamiento usó una sesión de GPT-5.6 (Sol, razonamiento medio) con una auditoría cruzada de 400 filas por GPT-5.6 (Terra, alto) y un desempate Sol-high solo en desacuerdos semánticos. El ajuste final empleó weighted binary cross-entropy con un multiplicador 2.0 en hard negatives de solo mención, learning rate 2e-5, batch 4 con 8 pasos de acumulación, cuatro épocas y un promedio de pesos igual de los checkpoints de las épocas 2 a 4. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Clasificación multi-etiqueta de pasajes de texto en cinco facetas: `trap` (errores, peligros, modos de fallo), `decision` (elecciones entre alternativas), `constraint` (reglas, políticas, invariantes), `mechanism` (explicación de funcionamiento) y `procedure` (pasos secuenciados para una tarea).
- Genera cinco probabilidades independientes por pasaje, con escalado de temperatura por faceta.
- Incluye dos vistas operativas de umbrales congeladas: `contract` y `recall_leaning`, para consumidores que necesitan una etiqueta dura.
- Distingue entre pasajes que "realizan" una faceta y los que solo la "mencionan"; las menciones se tratan como negativos en entrenamiento y evaluación.
- Diseñado para ejecutarse en CPU, CUDA y DirectML mediante ONNX Runtime.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un clasificador de texto puro.
- Capacidades multilingües no disponibles.
- No es un clasificador de seguridad, juez de factualidad ni detector de autoridad.

## Casos de uso

- Etiquetado de notas de trabajo en un sistema de memoria personal: el modelo clasifica cada pasaje en las cinco facetas, permitiendo que la recuperación pondere la evidencia por tipo, por ejemplo priorizando decisiones y restricciones sobre meras menciones.
- Indexación de documentación técnica: al etiquetar procedimientos y mecanismos, facilita la búsqueda de instrucciones paso a paso o explicaciones de funcionamiento en manuales y guías.
- Análisis de incidentes y registros de decisiones: identifica automáticamente pasajes que registran decisiones o trampas (trap), útil para revisiones post-mortem y auditorías internas.
- Filtrado de fragmentos en pipelines de recuperación aumentada (RAG): el modelo puede clasificar fragmentos antes de enviarlos al generador, mejorando la relevancia del contexto al excluir pasajes irrelevantes o de baja utilidad.
- Organización de bases de conocimiento corporativas: etiqueta restricciones, reglas o políticas en documentos, permitiendo consultas por tipo de información y facilitando el cumplimiento normativo.
- Monitorización de documentación de proyectos: detecta cambios en procedimientos o restricciones a lo largo del tiempo, ayudando a mantener la documentación actualizada y a identificar inconsistencias.
- Asistente de investigación: clasifica pasajes de papers o informes según si explican mecanismos o describen procedimientos, facilitando la extracción de metodologías y la comparación entre fuentes.

## Benchmarks y rendimiento

La evaluación se realizó sobre un panel fijo de 1,300 filas extraído de tres familias de documentos no vistas durante el entrenamiento. Los resultados comparan este modelo con el clasificador anterior, cuyos detalles no se especifican.

| Metrica | Modelo actual | Clasificador anterior | Cambio |
|---|---|---|---|
| Precisión media macro | 0.9676 | 0.8526 | +0.1150 |
| Precisión a 90% recall | 0.902 | 0.719 | +0.183 |
| Precisión media (facet `decision`) | 0.914 | 0.678 | +0.236 |
| Precisión media (facet `procedure`) | 0.958 | 0.817 | +0.141 |

Todos los valores se refieren al acuerdo con etiquetas generadas por modelos de lenguaje bajo un protocolo congelado, no con anotaciones humanas. Los paneles de evaluación son documentos generados, no corpus reales del operador.

## Requisitos de hardware

- Tamaño del artefacto: 452.8 MB (ONNX). Estimación de memoria en inferencia: aproximadamente 450 MB para los pesos (98 MB de embeddings INT8 + 352 MB del cuerpo FP32), más overhead de activaciones y buffers; se recomienda al menos 1-2 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3060 o superior, para ejecución en CUDA. En CPU, el modelo puede ejecutarse con ONNX Runtime sin requisitos especiales de GPU.
- Compatible con consumer GPU de gama baja, siempre que se respete el límite de memoria.
- Opciones de despliegue: ONNX Runtime en CPU, CUDA y DirectML. No se han publicado datos de latencia ni throughput.
- No se han publicado requisitos oficiales de hardware; las cifras anteriores son estimaciones basadas en el tamaño y la cuantización del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Daecore/gliclass-std-base-v3-5facet-qint8-v2 | 186.5M | 768 tokens | INT8 parcial (embeddings) + FP32 | Apache 2.0 | ONNX en HuggingFace |
| knowledgator/gliclass-base-v3.0 | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Clasificador anterior (no especificado) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría más allá del modelo base y del clasificador anterior.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación fueron generadas por modelos de lenguaje (GPT-5.6), no por anotadores humanos; las puntuaciones miden acuerdo con ese instrumento, no con verdad humana.
- Los paneles de evaluación son documentos generados, elegidos por su diversidad de dominios y formas; el comportamiento en documentos reales no relacionados no se ha medido.
- No es un clasificador de seguridad, juez de factualidad ni detector de autoridad; no debe usarse para filtrar lo que un sistema de recuperación puede devolver.
- La cuantización es parcial (INT8 solo en embeddings), lo que limita la reducción de tamaño y puede afectar al rendimiento en hardware de baja capacidad.
- El modelo no soporta tool calling ni agentes; está limitado a clasificación de texto.
- Los umbrales (`contract` y `recall_leaning`) son vistas congeladas y pueden no adaptarse a todos los casos de uso; la activación como valor por defecto es un paso separado.
- No hay información sobre idiomas soportados; se asume que el modelo funciona en el idioma de los datos de entrenamiento, probablemente inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daecore/gliclass-std-base-v3-5facet-qint8-v2
- Modelo base: https://huggingface.co/knowledgator/gliclass-base-v3.0
- Repositorio GLiClass: https://github.com/Knowledgator/GLiClass
- Colección GLiClass-V3: https://huggingface.co/collections/knowledgator/gliclass-v3
