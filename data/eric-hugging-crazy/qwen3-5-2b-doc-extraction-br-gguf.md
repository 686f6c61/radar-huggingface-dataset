# eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-GGUF

## Resumen

`qwen3.5-2b-doc-extraction-br-GGUF` es un ajuste fino del modelo base Qwen/Qwen3.5-2B, publicado por el usuario eric-hugging-crazy. El modelo está especializado en la extracción estructurada de datos de documentos financieros brasileños: boletos bancarios, DANFE (la representación impresa del NF-e) e informes de rendimientos. Su salida es un JSON con el esquema que consume la aplicación doc-extraction-copilot, también del mismo autor.

El ajuste se realizó mediante QLoRA sobre las capas de lenguaje del modelo base, con un entrenamiento muy corto (145 pasos, 20 minutos en una NVIDIA GeForce RTX 4060 Ti). El autor reporta una precisión del 99,7 % de campos correctos sobre los 36 documentos de evaluación de su aplicación, frente al 7,3 % del modelo base sin ajustar. Es, por tanto, un modelo de nicho, orientado a un pipeline concreto y con un conjunto de evaluación generado con las mismas plantillas que los datos de entrenamiento.

El repositorio contiene pesos en formato GGUF y está pensado para su uso con Ollama. Con 1.942.653.248 parámetros y licencia Apache 2.0, es un modelo pequeño y ligero, adecuado para ejecución local en hardware de consumo. Su relevancia es limitada fuera del dominio de documentos financieros brasileños, pero sirve como ejemplo de ajuste fino de bajo coste para tareas de extracción estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B); no se detalla la variante exacta |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el ejemplo de la model card usa Q8_0; no se listan otras variantes |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 2,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,94 mil millones de parámetros. El ajuste se aplicó exclusivamente sobre las capas de lenguaje mediante QLoRA, según indica la model card, con 145 pasos de entrenamiento completados en unos 20 minutos sobre una NVIDIA GeForce RTX 4060 Ti. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación adicionales como RLHF o DPO.

La innovación principal no es arquitectónica sino de dominio: el modelo se entrena para mapear la representación textual de documentos financieros brasileños (boleto, DANFE, informe de rendimentos) a un JSON con el esquema que espera la aplicación doc-extraction-copilot. El autor advierte que los datos de entrenamiento provienen del mismo generador y plantillas que el conjunto de evaluación, por lo que el rendimiento sobre maquetas no vistas será previsiblemente inferior.

## Capacidades

- Extracción de campos estructurados de documentos financieros brasileños y salida en JSON compatible con doc-extraction-copilot.
- Procesamiento de boletos bancarios, DANFE (NF-e impreso) e informes de rendimentos.
- Generación de texto conversacional, heredada del modelo base Qwen3.5-2B.
- Capacidad de visión declarada en las etiquetas del repositorio (`vision`), aunque la model card no detalla cómo se integra ni si el ajuste QLoRA afecta a las capas visuales.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al portugués según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Extracción de datos de boletos bancarios: el modelo convierte el texto de un boleto en un JSON con línea digitável, beneficiario, pagador, valor y vencimiento, listo para ingestión en un sistema de cuentas a pagar.
- Procesamiento de DANFE / NF-e impresos: permite digitalizar la representación impresa de una factura electrónica brasileña y obtener sus campos fiscales estructurados para conciliación contable.
- Declaración de la renta: extrae los datos de informes de rendimentos (fuentes pagadoras, importes, retenciones) y los entrega en el formato que consume la aplicación de apoyo a la declaración.
- Automatización de back office financiero: integrado en un pipeline que recibe documentos escaneados, el modelo genera el JSON y los dígitos de control de la aplicación validan los campos extraídos.
- Validación con dígitos de control: el autor indica que los dígitos verificadores de la aplicación marcan los dos campos que el modelo extrae mal en su conjunto de evaluación, lo que permite un flujo de revisión humana selectiva.
- Prototipado local de pipelines de extracción documental: al ejecutarse con Ollama en una RTX 4060 Ti, sirve para validar un flujo completo de extracción sin depender de APIs externas.
- Demo educativa de ajuste fino QLoRA: el repositorio doc-extraction-finetune documenta el proceso, útil como referencia para adaptar un modelo pequeño a una tarea de extracción estructurada.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo base Qwen3.5-2B |
|---|---|---|
| Campos correctos en los 36 documentos de evaluación de la app | 99,7 % | 7,3 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la precisión de extracción de campos sobre el conjunto de evaluación interno del autor, generado con las mismas plantillas que los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,94 mil millones de parámetros, una cuantización Q8_0 ocupa del orden de 2 GB de pesos, por lo que cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento reportada: NVIDIA GeForce RTX 4060 Ti (20 minutos, 145 pasos).
- GPU recomendadas para inferencia: cualquier GPU de consumo con 4 GB o más de VRAM; también es viable en CPU.
- Cabe en GPU de consumo: sí, el propio autor lo ejecuta en una RTX 4060 Ti.
- Opciones de despliegue: Ollama (`ollama pull hf.co/eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-GGUF:Q8_0`), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-2b-doc-extraction-br-GGUF | 1,94 B | no disponible | Extraccion de documentos financieros brasileños | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Otros modelos de extraccion documental | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de extracción documental para documentos financieros brasileños en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de evaluación procede del mismo generador y plantillas que los datos de entrenamiento; el rendimiento sobre maquetas no vistas será previsiblemente inferior al 99,7 % reportado.
- El modelo está ajustado únicamente para portugués y para el dominio financiero brasileño; su uso fuera de ese ámbito no está validado.
- Riesgo de alucinación en campos no presentes en el documento o en maquetas desconocidas; el autor recomienda apoyarse en los dígitos de control de la aplicación para detectar errores.
- No se documentan sesgos específicos, pero al derivar de un modelo de propósito general puede heredar los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de la extracción en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación externa muy limitada.
- No se detalla la longitud de contexto soportada ni el comportamiento con documentos largos o de varias páginas.
- La etiqueta `vision` sugiere capacidades multimodales, pero la model card no especifica si el ajuste QLoRA se aplicó también a las capas visuales ni cómo se procesan las imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eric-hugging-crazy/qwen3.5-2b-doc-extraction-br-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Aplicación doc-extraction-copilot: https://github.com/Eric-Souza/doc-extraction-copilot
- Repositorio de entrenamiento doc-extraction-finetune: https://github.com/Eric-Souza/doc-extraction-finetune
