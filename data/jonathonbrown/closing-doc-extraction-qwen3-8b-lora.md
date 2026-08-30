# jonathonbrown/closing-doc-extraction-qwen3-8b-lora

## Resumen

`closing-doc-extraction-qwen3-8b-lora` es un adaptador LoRA desarrollado por jonathonbrown sobre el modelo base `mlx-community/Qwen3-8B-4bit` (una cuantización a 4 bits de Qwen3-8B en formato MLX). Su propósito es extraer un esquema JSON fijo con campos clave de documentos de cierre inmobiliario del estado de Florida (EE. UU.), como escrituras, hipotecas, declaraciones de cierre y compromisos de título. El adaptador se distribuye bajo licencia MIT y está pensado para ejecutarse en el ecosistema MLX de Apple.

El proyecto es una demostración del flujo de fine-tuning con MLX-LoRA más que un extractor listo para producción. El corpus de entrenamiento es abrumadoramente sintético: 292 de 302 documentos fueron generados localmente con `qwen3:32b` a partir de plantillas de documentos de cierre, y las etiquetas JSON de entrenamiento también fueron producidas por ese mismo modelo, sin verificación humana independiente. Los resultados publicados muestran un rendimiento casi perfecto en datos sintéticos de la misma distribución, pero el autor advierte explícitamente que no se debe interpretar como capacidad real de extracción sobre documentos reales, ruidosos o con OCR.

A pesar de estas limitaciones, el adaptador demuestra que es posible lograr una conformidad de esquema del 100 % en datos de distribución interna con un prompt mínimo (sin system prompt), y un 90 % de conformidad y 96,25 % de precisión por campo sobre los 10 formularios reales incluidos en la evaluación fuera de distribución. La relevancia actual radica en que muestra un patrón práctico para adaptar modelos Qwen3 a tareas de extracción estructurada con poco coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (el adaptador usa rank 8 y alpha 20; el modelo base tiene 8 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 2048 tokens; evaluado con hasta 4096) |
| Tipos de cuantizacion | Modelo base: 4 bits (MLX); el adaptador LoRA no tiene cuantizacion propia |
| Idiomas soportados | No disponible (los documentos de entrenamiento estan en ingles) |
| Licencia | MIT |
| Formato de pesos | MLX (adaptador LoRA en formato MLX) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `mlx-community/Qwen3-8B-4bit`, una versión cuantizada a 4 bits del modelo denso Qwen3-8B, preparada para el framework MLX de Apple. El entrenamiento se realizó con `mlx-lm` usando LoRA con los siguientes parámetros: rank 8, alpha (escala) 20, dropout 0, aplicado a las 16 capas superiores. El optimizador fue Adam con tasa de aprendizaje 1e-5 sin programación de tasa, 600 iteraciones, batch size 1, acumulación de gradientes 1, longitud máxima de secuencia 2048 y sin gradient checkpointing. La semilla de entrenamiento fue 0.

El corpus de entrenamiento está compuesto por 302 documentos, de los cuales 292 son sintéticos generados por `qwen3:32b` a partir de plantillas de documentos de cierre de Florida (escrituras, hipotecas, declaraciones de cierre, compromisos de título, divulgaciones de condominios/HOA y contratos cumplimentados) con nombres, parcelas, libro/página y números de instrumento ficticios. Solo 10 documentos son reales (formularios de referencia de CFPB y FAR/BAR). Las etiquetas de entrenamiento fueron generadas por el mismo modelo `qwen3:32b` y validadas únicamente por conformidad de esquema, sin verificación humana independiente.

Una innovación destacable es que el adaptador fue entrenado sin system prompt: en inferencia se debe proporcionar únicamente el mensaje de usuario con el texto del documento. Añadir un system prompt que describa el esquema degrada mediblemente los resultados (la precisión global cae del 100 % al 95,21 % en el test de distribución interna), porque el modelo lo interpreta como una distribución fuera de lo aprendido.

## Capacidades

- Extracción de un esquema JSON fijo con campos como `document_type`, `parties` (grantor, grantee, borrower, lender), `property_address`, `legal_description`, `loan_amount`, `purchase_price`, `dates` (executed, recorded, closing), `recording_info` (book, page, instrument) y `documentary_stamp_tax`.
- Generación de JSON válido en el 100 % de los casos evaluados (tanto en datos sintéticos como en los 10 formularios reales).
- Conformidad total con el esquema en datos de distribución interna (100 %), y del 90 % en formularios reales fuera de distribución.
- Funciona sin system prompt: basta con enviar el texto del documento en el mensaje de usuario.
- Campos monetarios como números JSON; fechas como cadenas `YYYY-MM-DD`; campos ausentes como `null`.
- No soporta tool calling, razonamiento multi-paso ni otras capacidades generales más allá de la tarea específica de extracción.

## Casos de uso

- Automatización de revisión de documentos de cierre inmobiliario: el adaptador puede extraer de forma consistente los campos clave de escrituras, hipotecas y declaraciones de cierre, reduciendo el trabajo manual de un agente o abogado que necesita localizar datos como el importe del préstamo, la fecha de ejecución y el número de instrumento.
- Integración en pipelines de procesamiento documental para portales inmobiliarios: al devolver JSON estructurado, se puede alimentar directamente una base de datos de propiedades o un sistema de búsqueda, siempre que los documentos de entrada sean similares a las plantillas de Florida.
- Validación de datos en transacciones hipotecarias: el esquema fijo permite comparar rápidamente los valores extraídos (por ejemplo, `loan_amount` y `purchase_price`) con los registrados en el sistema, detectando discrepancias.
- Generación de resúmenes estructurados para expedientes legales: un abogado puede obtener un resumen JSON de cada documento de cierre y adjuntarlo al expediente digital del cliente.
- Prototipado de flujos de extracción con MLX: sirve como ejemplo de cómo adaptar Qwen3-8B a una tarea de extracción estructurada con un coste de entrenamiento bajo (600 iteraciones, batch 1), útil para equipos que quieran replicar el patrón en otros dominios.
- Evaluación de la viabilidad de LoRA para extracción de información: el proyecto documenta métricas detalladas y advertencias sobre datos sintéticos, lo que lo convierte en un caso de estudio para investigadores que quieran entender los límites del fine-tuning con datos generados por IA.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (n = 30, distribución sintética interna), con decodificación greedy y modelo base `mlx-community/Qwen3-8B-4bit`:

| Metrica | Naive (base sin esquema) | Base con prompt de esquema | Fine-tuned sin prompt | Fine-tuned con prompt de esquema |
|---|---|---|---|---|
| Tasa de JSON valido | 96,67 % | 100,00 % | 100,00 % | 100,00 % |
| Tasa de conformidad con esquema | 0,00 % | 66,67 % | 100,00 % | 100,00 % |
| Precision por campo (global) | 5,00 % | 90,00 % | 100,00 % | 95,21 % |

Precisión por campo (misma partición):

| Campo | Naive | Prompt de esquema | Fine-tuned sin prompt | Fine-tuned con prompt |
|---|---|---|---|---|
| document_type | 40,00 % | 93,33 % | 100,00 % | 80,00 % |
| parties.grantor | 0,00 % | 83,33 % | 100,00 % | 93,33 % |
| parties.grantee | 0,00 % | 83,33 % | 100,00 % | 93,33 % |
| parties.borrower | 0,00 % | 63,33 % | 100,00 % | 100,00 % |
| parties.lender | 0,00 % | 66,67 % | 100,00 % | 100,00 % |
| property_address | 3,33 % | 100,00 % | 100,00 % | 100,00 % |
| legal_description | 3,33 % | 100,00 % | 100,00 % | 100,00 % |
| loan_amount | 0,00 % | 100,00 % | 100,00 % | 100,00 % |
| purchase_price | 3,33 % | 93,33 % | 100,00 % | 86,67 % |
| dates.executed | 0,00 % | 93,33 % | 100,00 % | 90,00 % |
| dates.recorded | 0,00 % | 100,00 % | 100,00 % | 100,00 % |
| dates.closing | 0,00 % | 100,00 % | 100,00 % | 100,00 % |
| recording_info.book | 0,00 % | 93,33 % | 100,00 % | 90,00 % |
| recording_info.page | 0,00 % | 93,33 % | 100,00 % | 90,00 % |
| recording_info.instrument | 0,00 % | 93,33 % | 100,00 % | 100,00 % |
| documentary_stamp_tax | 30,00 % | 83,33 % | 100,00 % | 100,00 % |

Evaluación fuera de distribución sobre los 10 formularios reales (CFPB/FAR-BAR), con límite de generación de 4096 tokens y el modelo fine-tuned sin prompt:

| Metrica | Valor |
|---|---|
| Tasa de JSON valido | 100,00 % |
| Tasa de conformidad con esquema | 90,00 % |
| Precision por campo (global) | 96,25 % |

El autor advierte que estos resultados miden concordancia con las etiquetas generadas por `qwen3:32b`, no exactitud frente a verificación humana.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (rank 8, aplicado a 16 capas); el peso dominante es el modelo base `mlx-community/Qwen3-8B-4bit` con cuantización a 4 bits.
- VRAM estimada: aproximadamente 5-6 GB para el modelo base cuantizado a 4 bits en MLX, más una pequeña cantidad adicional para el adaptador. Cabe en GPUs de consumo como una RTX 3060 de 12 GB, RTX 4070 o superior, y en Macs con Apple Silicon (MLX está optimizado para ello).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) para MLX, o GPUs NVIDIA con CUDA si se convierte a otro formato (por ejemplo, GGUF o safetensors).
- Opciones de despliegue: al ser un adaptador MLX, se puede cargar con `mlx-lm` directamente en macOS. Para otros entornos, habría que convertir el adaptador a formatos compatibles (por ejemplo, usar el modelo base Qwen3-8B con bibliotecas como vLLM o llama.cpp y aplicar el adaptador LoRA manualmente, aunque no se proporciona documentación oficial al respecto).
- Latencia y throughput: no se han publicado mediciones. Con un modelo de 8B en 4 bits, se puede esperar una generación de decenas de tokens por segundo en hardware moderno, pero no hay datos concretos del autor.

## Comparativa con modelos similares

No existen adaptadores LoRA públicos comparables para extracción de documentos de cierre inmobiliario con los mismos datos. La comparativa más relevante es con el modelo base sin adaptar, que el propio autor documenta en sus benchmarks: el modelo base sin esquema obtiene una precisión por campo del 5 %, y con un prompt de esquema alcanza el 90 %, mientras que el adaptador fine-tuned llega al 100 % en datos de distribución interna. Otros proyectos similares en el ámbito de extracción estructurada (como `brnil6/doc-extraction-qwen`, que usa un modelo vision-language Qwen 3.6 35B-A3B para extraer JSON de PDFs) abordan una tarea más general con un enfoque diferente, pero no son directamente comparables en cuanto a rendimiento o licencia.

## Limitaciones y advertencias

- El corpus de entrenamiento es mayoritariamente sintético (292 de 302 documentos) y las etiquetas fueron generadas por el mismo modelo `qwen3:32b`, sin verificación humana independiente. El adaptador aprende a reproducir las extracciones de ese modelo sobre texto plantillado, no a comprender documentos reales.
- Los resultados casi perfectos en el test retenido miden concordancia con plantillas sintéticas de la misma distribución, no capacidad real de extracción sobre documentos reales, ruidosos o con OCR.
- La única evaluación fuera de distribución es sobre 10 formularios reales, con etiquetas también generadas por `qwen3:32b`. Con solo 10 documentos, cada error cuenta 10 puntos porcentuales y las métricas son gruesas.
- No se debe usar en producción como extractor de documentos sin una validación exhaustiva con datos reales y verificación humana.
- El adaptador fue entrenado sin system prompt; añadir uno en inferencia degrada el rendimiento (la precisión global cae del 100 % al 95,21 % en datos de distribución interna).
- El límite de contexto de entrenamiento es de 2048 tokens; documentos largos requieren aumentar el límite de generación (el autor usó 4096 en la evaluación de formularios reales) y podrían truncarse si superan ese tamaño.
- Los documentos de entrenamiento son específicos de Florida (EE. UU.); no se ha evaluado su comportamiento con documentos de otras jurisdicciones o formatos.
- Licencia MIT permite uso comercial, pero el autor declara explícitamente que no es un producto listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathonbrown/closing-doc-extraction-qwen3-8b-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Modelo Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto relacionado (extracción de documentos con Qwen vision-language): https://github.com/brnil6/doc-extraction-qwen
