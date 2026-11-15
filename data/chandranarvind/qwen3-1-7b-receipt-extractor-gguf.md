# chandranarvind/qwen3-1.7b-receipt-extractor-GGUF

## Resumen

qwen3-1.7b-receipt-extractor-GGUF es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario chandranarvind en Hugging Face. El modelo está especializado, según su nombre, en la extracción de datos estructurados a partir de recibos y tickets de compra, y se distribuye exclusivamente en formato GGUF cuantizado para su uso con llama.cpp y Ollama. El entrenamiento y la conversión se realizaron con la herramienta Unsloth, que acelera el fine-tuning y la exportación a GGUF.

Se trata de un modelo pequeño, de 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), lo que lo sitúa en la gama de modelos que pueden ejecutarse en hardware de consumo. El repositorio ocupa 3,7 GB y contiene una única cuantización Q2_K, además de un Modelfile para Ollama. La información publicada por el autor es mínima: no se detallan datos de entrenamiento, composición del dataset, licencia ni idiomas soportados.

Su relevancia radica en el nicho: la extracción automática de información de recibos es una tarea frecuente en contabilidad, gestión de gastos y digitalización documental, y un modelo especializado de pequeño tamaño puede desplegarse en local con requisitos de hardware modestos. No obstante, la ausencia de benchmarks, de licencia explícita y de documentación técnica limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B; detalles no disponibles) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (unica disponible en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3 de Alibaba. El autor indica que el ajuste fino y la conversión a GGUF se realizaron con Unsloth, herramienta que optimiza el entrenamiento y la exportación de modelos de lenguaje. No se especifica el dataset utilizado, el número de tokens de entrenamiento, si hubo RLHF o DPO, ni la técnica de ajuste (LoRA, QLoRA u otra completa). Tampoco se documenta si se modificó la longitud de contexto original del modelo base.

La única innovación técnica mencionada es el uso de Unsloth, que según la model card permitió entrenar "2x más rápido". No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia. La cuantización disponible es Q2_K, una de las más agresivas de la escala GGUF, lo que reduce el tamaño pero puede degradar la calidad de forma notable en un modelo de 1,7 B.

## Capacidades

- Extracción de información estructurada de recibos y tickets (según el nombre del modelo y su propósito declarado).
- Generación de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Compatibilidad con llama.cpp y Ollama mediante el Modelfile incluido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multimodal (la model card menciona `llama-mtmd-cli` como plantilla genérica, pero no hay evidencia de pesos multimodales).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Digitalización de gastos: el modelo puede procesar el texto OCR de un recibo y devolver campos estructurados (comercio, fecha, importe, impuestos) para su volcado en hojas de cálculo o sistemas de contabilidad.
- Automatización de notas de gastos en pymes: integrado en un pipeline local con Ollama, permite extraer datos de tickets sin enviar documentos a servicios en la nube, lo que reduce riesgos de privacidad.
- Preprocesado en aplicaciones de finanzas personales: el modelo extrae importes y categorías de recibos para alimentar un registro de gastos doméstico.
- Prototipado rápido en local: al ser un GGUF de 1,7 B, permite probar flujos de extracción en un portátil con llama.cpp antes de invertir en modelos mayores.
- Filtrado y clasificación de documentos: puede usarse para determinar si un texto OCR corresponde a un recibo y extraer los campos principales en una primera pasada.
- Educación y experimentación: sirve como ejemplo de fine-tuning con Unsloth y exportación a GGUF para desarrolladores que quieran replicar el flujo con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización Q2_K, los pesos ocupan aproximadamente 0,5-0,6 GB; sumando overhead de contexto y runtime, se estima un uso de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas e incluso en sistemas integrados con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| qwen3-1.7b-receipt-extractor-GGUF | 1,72 B | no disponible | GGUF (Q2_K) | no disponible | Extraccion de recibos |
| Qwen3-1.7B (base) | 1,72 B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 (segun el modelo base) | Proposito general |
| Llama 3.2 1B | 1,24 B | 128 K | safetensors, GGUF | Llama 3.2 Community License | Proposito general |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento del modelo especializado para contrastar con alternativas.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite uso comercial.
- Solo se ofrece cuantización Q2_K, la más agresiva; la calidad puede degradarse notablemente frente a Q4_K_M o Q8_0.
- No hay información sobre el dataset de entrenamiento, por lo que se desconoce el dominio exacto y los posibles sesgos.
- Riesgo de alucinación en la extracción de campos: sin benchmarks ni validación, no se puede garantizar precisión en importes o fechas.
- No se documentan idiomas soportados; la extracción de recibos en castellano no está verificada.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validación externa.
- La model card es mínima y no incluye instrucciones de prompt ni esquema de salida esperado.
- El tag `endpoints_compatible` no garantiza compatibilidad con la API de Hugging Face sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chandranarvind/qwen3-1.7b-receipt-extractor-GGUF
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggerganov/llama.cpp
