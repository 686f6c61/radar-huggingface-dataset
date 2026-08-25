# maianh511/Vintern_1B_v2_finetune_lora_viet_chart_vqa

## Resumen

Vintern_1B_v2_finetune_lora_viet_chart_vqa es un ajuste fino (fine-tune) del modelo multimodal Vintern-1B-v2, desarrollado por maianh511, especializado en la respuesta a preguntas sobre graficos (chart question answering) en vietnamita. El modelo base, creado por 5CD-AI, combina el modelo de lenguaje Qwen2-0.5B-Instruct con el codificador visual InternViT-300M-448px, y esta adaptado al vietnamita. Este fine-tune se ha entrenado sobre el dataset maianh511/vi_chart_dataset, logrando mejoras significativas en metricas de generacion de texto sobre el modelo pretrain.

La relevancia de este modelo radica en que ofrece una solucion ligera (1B de parametros) para analisis de graficos y documentos en vietnamita, un idioma con pocos recursos en el ambito de la vision por computador. El modelo es capaz de entender graficos, tablas y figuras, y generar respuestas textuales en vietnamita o ingles, lo que lo hace util para aplicaciones de analisis de datos, automatizacion de informes y asistencia en entornos empresariales. La licencia apache-2.0 facilita su uso comercial y su despliegue en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal LLaVA (LLM + vision transformer): Qwen2-0.5B-Instruct + InternViT-300M-448px |
| Parametros totales | 1B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo base Vintern-1B-v2 es un modelo multimodal que combina un LLM de 0.5B (Qwen2-0.5B-Instruct) con un codificador visual de 300M (InternViT-300M-448px), sumando aproximadamente 1B de parametros totales. Esta arquitectura de tipo LLAVA permite procesar imagenes junto con texto, proyectando las caracteristicas visuales al espacio del lenguaje. El modelo original fue pre-entrenado con mas de 3 millones de pares imagen-pregunta-respuesta, cubriendo tareas como OCR-VQA, Doc-VQA y Chart-VQA.

El fine-tune presentado aqui se realizo sobre el dataset maianhong511/vi_chart_dataset, un conjunto de datos en vietnamita con preguntas y respuestas sobre graficos. El entrenamiento se hizo con LoRA (Low-Rank Adaptation) sobre el modelo base, lo que permite una adaptacion eficiente sin modificar todos los pesos. Los resultados muestran una mejora notable en las metricas de generacion de texto (BLEU, METEOR, ROUGE, BERTScore) respecto al modelo base, indicando una mayor capacidad para generar respuestas precisas y semanticamente correctas sobre graficos en vietnamita.

## Capacidades

- Generacion de texto multimodal: responde preguntas sobre graficos, tablas y figuras basandose en la imagen de entrada.
- Razonamiento visual: interpreta tendencias, valores y relaciones en graficos de barras, lineas, tartas, etc.
- Soporte de OCR-VQA y Doc-VQA: extrae informacion de documentos escaneados y responde preguntas sobre su contenido.
- Capacidades multilingues: genera respuestas en vietnamita (principal) y en ingles, aunque el entrenamiento especifico se centra en vietnamita.
- No se ha documentado soporte de tool calling, function calling, agentes o multi-step reasoning en el modelo base.
- No se ha documentado modo thinking o capacidades de audio/vision avanzadas mas alla de la entrada de imagenes.

## Casos de uso

- Analisis de informes financieros: el modelo puede analizar graficos de evolucion de acciones, ingresos o gastos en documentos PDF o imagenes, respondiendo preguntas como "¿Cual es la tendencia de ingresos en el ultimo trimestre?" en vietnamita.
- Automatizacion de informes empresariales: integrado en un pipeline de procesamiento de documentos, puede generar resumenes en vietnamita de graficos de ventas, produccion o rendimiento, reduciendo trabajo manual.
- Asistente de analisis de datos para equipos no tecnicos: un usuario puede subir una imagen de un grafico y hacer preguntas naturales en vietnamita, obteniendo respuestas claras sobre patrones o valores concretos.
- Educacion y evaluacion: en un entorno academico, el modelo puede ayudar a estudiantes a interpretar graficos estadisticos, generando explicaciones en vietnamita sobre la informacion visual.
- Extraccion de informacion de documentos escaneados: para empresas que digitalizan informes en papel, el modelo puede responder preguntas sobre graficos incluidos en escaneos, facilitando la indexacion y busqueda de informacion.
- Chatbots de atencion al cliente con soporte de imagenes: en un chat de soporte, el modelo puede recibir una captura de pantalla de un grafico de consumo o factura y responder preguntas del usuario en vietnamita sobre los datos mostrados.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados de evaluacion en la model card, comparando el modelo base (pretrain) con el fine-tune:

| Metrica | Pretrain | Fine-tuned | Mejora |
|---|---|---|---|
| BLEU | 0.3054 | 0.4669 | +52.9% |
| METEOR | 0.5510 | 0.6999 | +27.0% |
| ROUGE-1 | 0.6915 | 0.7765 | +12.3% |
| ROUGE-2 | 0.5724 | 0.6739 | +17.7% |
| ROUGE-L | 0.6386 | 0.7321 | +14.6% |
| BERTScore | 0.8542 | 0.9020 | +5.6% |

Estas mejoras indican que el fine-tune aumenta significativamente la calidad de las respuestas generadas en vietnamita para preguntas sobre graficos. No se han publicado resultados de benchmarks estandarizados como MMLU o HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1B de parametros, el modelo en FP16 ocupa aproximadamente 2 GB de VRAM; en cuantizacion 4-bit podria reducirse a unos 0.5-1 GB. Dado el tamano del repo (11.5 GB), puede incluir pesos en varias precisiones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como una NVIDIA GTX 1650, RTX 3050, o una T4 en la nube. Para inferencia en batch, se recomienda una RTX 3090 o superior.
- Cabe en consumer GPU: si, en la mayoria de las GPUs de consumo actuales, incluso en modelos con 4-6 GB de VRAM.
- Opciones de despliegue: se puede usar con llama.cpp (si se convierte a GGUF), Ollama, vLLM o TGI, aunque el modelo esta pensado para inferencia local con el framework de transformers de Hugging Face.
- Latencia y throughput: no se proporcionan datos especificos, pero en una RTX 3090 se puede esperar una latencia de decenas de milisegundos por peticion, y throughput de varios cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (BLEU en chart VQA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vintern-1B-v2 (base) | 1B | no disponible | 0.3054 | Apache 2.0 | Hugging Face |
| Vintern_1B_v2_finetune_lora_viet_chart_vqa | 1B | no disponible | 0.4669 | Apache 2.0 | Hugging Face |
| Vintern-1B (original) | 1B | no disponible | no disponible | Apache 2.0 | Hugging Face |

El modelo se compara directamente con su base, mostrando una mejora significativa en la tarea especifica de chart VQA en vietnamita. No se dispone de datos de otros modelos comparables en el mismo idioma y tarea.

## Limitaciones y advertencias

- El modelo esta especializado en la respuesta de preguntas sobre graficos en vietnamita; su rendimiento en otras tareas o idiomas puede ser limitado.
- Riesgo de alucinacion: como todo LLM, puede generar respuestas plausibles pero incorrectas sobre los datos visuales, especialmente si el grafico es complejo o ambiguo.
- Limitacion de contexto: no se ha documentado la longitud de contexto, por lo que puede tener problemas con imagenes de alta resolucion o con preguntas muy largas.
- No se ha evaluado en benchmarks estandarizados de razonamiento o codigo; los resultados se limitan a metricas de generacion de texto sobre el dataset de graficos.
- El modelo no soporta tool calling ni agentes, por lo que no es adecuado para tareas que requieran interaccion con herramientas externas.
- El dataset de entrenamiento es especifico para graficos; el modelo puede fallar en otros tipos de imagenes (fotografias, videos, etc.).
- Aunque la licencia es Apache 2.0, el uso comercial debe tener en cuenta la procedencia de los datos de entrenamiento y el modelo base.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/maianh511/Vintern_1B_v2_finetune_lora_viet_chart_vqa
- Modelo base: https://huggingface.co/5CD-AI/Vintern-1B-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/maianh511/vi_chart_dataset
- GitHub de Vintern: https://github.com/5CD-AI/Vintern
- Paper de Vintern-1B (arXiv): https://arxiv.org/html/2408.12480v2
- PDF del paper: https://arxiv.org/pdf/2408.12480v1
