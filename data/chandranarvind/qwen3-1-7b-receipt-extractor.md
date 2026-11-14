# chandranarvind/qwen3-1.7b-receipt-extractor

## Resumen

`chandranarvind/qwen3-1.7b-receipt-extractor` es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B, desarrollado por el usuario chandranarvind y publicado en Hugging Face. El modelo parte de la version cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`) y se ha entrenado con la libreria Unsloth y TRL para la tarea especifica de extraccion de datos de recibos (receipt extraction), segun indica su nombre. La model card publicada es un esqueleto autogenerado por la plantilla de Unsloth y no aporta detalles sobre el dataset, el procedimiento de entrenamiento ni los resultados obtenidos.

Se trata, por tanto, de un modelo de nicho, de muy reciente creacion (noviembre de 2026) y sin traccion en la comunidad: cero descargas y cero likes en el momento de redactar esta ficha. Su relevancia practica es limitada y debe evaluarse con cautela, ya que no existe documentacion tecnica publicada que respalde su calidad. La licencia Apache 2.0 y su reducido tamano (1.700 millones de parametros) lo hacen facilmente desplegable en hardware de consumo, lo que constituye su principal atractivo potencial para tareas de extraccion estructurada de documentos.

El modelo hereda la arquitectura y las capacidades del Qwen3-1.7B original, pero el ajuste fino esta orientado a una unica tarea y declarado unicamente para ingles. No se dispone de informacion sobre la longitud de contexto efectiva tras el ajuste, los tipos de cuantizacion disponibles ni los idiomas realmente soportados mas alla del declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta hasta 32.768 tokens, pero no se confirma tras el ajuste) |
| Tipos de cuantizacion | no disponible (el modelo base de partida es bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizo con Unsloth, una libreria optimizada para fine-tuning eficiente en memoria que, segun la model card, permite entrenar "2x mas rapido", y con TRL (Transformer Reinforcement Learning) de Hugging Face. El punto de partida es la version pre-cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`), lo que sugiere un entrenamiento con cuantizacion QLoRA o similar sobre pesos de 4 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de recibos, la existencia de etapas de RLHF o DPO, ni las tecnicas de optimizacion aplicadas. La model card no incluye hiperparametros, curvas de entrenamiento ni evaluaciones. Toda la informacion sobre el procedimiento de entrenamiento se limita a la mencion de Unsloth y TRL en las etiquetas y en el texto autogenerado.

## Capacidades

- Generacion de texto y extraccion de informacion estructurada de recibos, segun la tarea declarada en el nombre del modelo.
- Hereda las capacidades generales del Qwen3-1.7B (razonamiento basico, generacion de texto), aunque el ajuste fino puede haber degradado el rendimiento en tareas generales.
- Soporte de tool calling / function calling: no disponible (no confirmado tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de campos de recibos: el modelo puede procesar el texto OCR de un recibo y devolver campos estructurados como fecha, comercio, importe total, impuestos y lineas de detalle. Es el uso para el que fue entrenado explicitamente.
- Automatizacion de contabilidad: integrado en un pipeline que recibe recibos digitalizados, el modelo puede convertir el texto en registros contables para su volcado en un ERP o sistema de gestion de gastos.
- Procesamiento de gastos de empleados: en flujos de reembolso, el modelo puede extraer los datos relevantes de los justificantes y validar su presencia antes de la aprobacion manual.
- Digitalizacion de archivos historicos: para lotes de recibos escaneados en ingles, el modelo puede generar datos tabulares a partir del texto OCR, reduciendo la introduccion manual.
- Clasificacion y enriquecimiento de documentos: combinado con un OCR previo, puede etiquetar y enriquecer recibos con metadatos (categoria de gasto, moneda, comercio) para su indexacion.
- Prototipado y experimentacion: por su reducido tamano y licencia permisiva, es adecuado para probar pipelines de extraccion de documentos en entornos con GPUs de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16 para los 1.700 millones de parametros; en torno a 1-2 GB con cuantizacion de 4 bits (estimacion basada en el tamano del modelo base, no confirmada para este ajuste).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (segun las etiquetas del repo), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chandranarvind/qwen3-1.7b-receipt-extractor | ~1.700 M | no disponible | Apache 2.0 | Hugging Face, sin descargas |
| Qwen3-1.7B (base) | 1.700 M | 32.768 tokens (segun modelo base) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Otros extractores de recibos especializados | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este ajuste y alternativas de la misma categoria, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, evaluaciones ni limitaciones conocidas.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion: como todo modelo de 1.700 millones de parametros, puede inventar campos o valores en la extraccion, especialmente con recibos ruidosos o fuera de distribucion.
- Sesgos conocidos: no documentados; hereda los sesgos del corpus de entrenamiento del Qwen3-1.7B y del dataset de ajuste, desconocido.
- Limitacion de idioma: declarado solo para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo.
- Caveat para produccion: al ser un ajuste fino sobre una base cuantizada en 4 bits, la calidad de los pesos finales puede diferir de un entrenamiento en precision completa; se recomienda validar exhaustivamente antes de cualquier uso real.
- Fecha de creacion futura respecto a la mayoria de referencias: verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chandranarvind/qwen3-1.7b-receipt-extractor
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
