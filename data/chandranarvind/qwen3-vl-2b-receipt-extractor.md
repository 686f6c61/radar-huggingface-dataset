# chandranarvind/qwen3-vl-2b-receipt-extractor

## Resumen

`chandranarvind/qwen3-vl-2b-receipt-extractor` es un ajuste fino (fine-tuning) del modelo multimodal Qwen3-VL-2B-Instruct, en su versión cuantizada a 4 bits publicada por Unsloth. Lo desarrolla el usuario chandranarvind y está orientado, por su nombre y por el pipeline declarado, a la extracción estructurada de datos a partir de imágenes de recibos y tickets de compra. Parte de la familia Qwen3-VL de Alibaba, un modelo vision-language de 2.000 millones de parámetros con capacidad de generación de texto condicionada por imagen.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors y con la librería transformers como vía de carga principal. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador o con pesos de un modelo de 2B cuantizado a 4 bits. El autor declara únicamente el idioma inglés (`en`) y no publica resultados de benchmarks, detalles del dataset de ajuste ni métricas de evaluación.

Su relevancia práctica es acotada pero clara: ofrece un punto de partida ligero para tareas de document understanding (extracción de campos de facturas, tickets y recibos) ejecutable en hardware modesto, aunque la ausencia de documentación técnica y de evaluación publicada limita su uso directo en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) de la familia Qwen3-VL; detalles internos no disponibles |
| Parámetros totales | 2B (heredados del modelo base Qwen3-VL-2B-Instruct) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | modelo base en bnb-4bit; el ajuste se publica en safetensors (cuantizaciones adicionales no disponibles) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen3-VL-2B-Instruct-unsloth-bnb-4bit`, es decir, la variante Instruct de Qwen3-VL de 2B parámetros cuantizada a 4 bits por Unsloth. La arquitectura subyacente es la de Qwen3-VL: un transformer que combina un codificador visual con un decodificador de lenguaje, permitiendo generar texto condicionado por imágenes. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni resolución de entrada del codificador visual.

El entrenamiento se realizó con Unsloth, según declara el autor, con una mejora de velocidad de 2x respecto a un entrenamiento estándar. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni la configuración de hiperparámetros. Tampoco se documenta si el ajuste congela el codificador visual o entrena el modelo completo. Toda esta información figura como no disponible.

## Capacidades

- Generación de texto condicionada por imagen, orientada a la extracción de información de documentos (recibos, tickets, facturas).
- Procesamiento de lenguaje natural en inglés, idioma único declarado por el autor.
- Capacidad multimodal heredada del modelo base Qwen3-VL-2B-Instruct (comprensión de imágenes y respuesta textual).
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se documenta modo thinking, entrada de audio ni otras capacidades especiales.
- El ajuste específico parece orientado a una única tarea (extracción de recibos), por lo que sus capacidades generales pueden haberse degradado respecto al modelo base.

## Casos de uso

- Digitalización de tickets de compra: el modelo puede recibir la imagen de un recibo y devolver los campos relevantes (comercio, fecha, importe total, impuestos) en formato estructurado, aprovechando su naturaleza vision-language.
- Automatización de la contabilidad de gastos: integrado en un flujo que procese fotografías de recibos enviadas por empleados, permite extraer los datos necesarios para registrar el gasto sin intervención manual.
- Procesamiento por lotes en entornos con hardware limitado: al tratarse de un modelo de 2B parámetros cuantizado, es viable ejecutarlo en GPUs de consumo o en instancias modestas de cloud, lo que reduce el coste por documento frente a modelos multimodales de mayor tamaño.
- Prototipado rápido de pipelines de document understanding: sirve como punto de partida para equipos que quieran validar la viabilidad de la extracción automática de recibos antes de invertir en modelos mayores o en servicios gestionados.
- Extracción de datos para conciliación bancaria: los campos extraídos de los tickets pueden cruzarse con extractos bancarios para detectar discrepancias, siempre que se valide la precisión del modelo en el dominio concreto.
- Filtrado y clasificación previa de documentos: el modelo puede usarse para determinar si una imagen es un recibo y, en caso afirmativo, extraer un subconjunto de campos, derivando el resto a un sistema más potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al partir de un modelo de 2B parámetros en 4 bits, la huella de pesos ronda los 1-2 GB; con overhead de activaciones y del codificador visual, se estima un consumo de 4-6 GB de VRAM en FP16 y de 2-4 GB en cuantizaciones de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 son suficientes por capacidad; para uso en producción se recomienda L4 o A10 por relación coste/prestación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados). El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chandranarvind/qwen3-vl-2b-receipt-extractor | 2B | no disponible | Apache 2.0 | Hugging Face | Ajuste específico para recibos, sin benchmarks |
| Qwen3-VL-2B-Instruct (base) | 2B | no disponible en la información | Apache 2.0 | Hugging Face | Modelo generalista multimodal, base del ajuste |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en la información | Apache 2.0 | Hugging Face | Alternativa multimodal de tamaño similar de la generación anterior |
| Modelos especializados en extracción de documentos (p. ej. Donut, LayoutLMv3) | variable | no disponible | variable | Hugging Face | Enfoques específicos de document understanding, no comparables directamente en parámetros |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica métricas. La elección frente a alternativas debe basarse en una evaluación propia sobre el conjunto de recibos objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del dataset de entrenamiento: no hay evidencia publicada de la precisión del modelo en la tarea de extracción de recibos.
- Riesgo de sobreajuste al dominio y al formato de los recibos usados en el ajuste; el rendimiento puede degradarse con tickets de otros países, idiomas o maquetaciones.
- Riesgo de alucinación: al ser un modelo generativo, puede inventar campos, importes o fechas cuando la imagen es de baja calidad o el documento es atípico.
- Idioma limitado al inglés según la model card; no se garantiza un buen rendimiento con recibos en castellano u otros idiomas.
- El modelo base está cuantizado a 4 bits, lo que puede introducir pérdida de precisión adicional respecto al checkpoint original en FP16.
- Licencia Apache 2.0: permite uso comercial, pero el adoptante debe verificar las obligaciones de atribución y las condiciones del modelo base Qwen3-VL.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Para producción se recomienda una validación exhaustiva con un conjunto de recibos representativo y un mecanismo de verificación humana de los campos extraídos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chandranarvind/qwen3-vl-2b-receipt-extractor
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-VL-2B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen3-VL: no disponible en la información proporcionada
