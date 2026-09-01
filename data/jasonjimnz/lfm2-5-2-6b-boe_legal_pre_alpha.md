# jasonjimnz/LFM2.5-2.6B-boe_legal_pre_alpha

## Resumen

LFM2.5-2.6B-boe_legal_pre_alpha es un fine-tune del modelo LFM2.5-2.6B de Liquid AI, especializado en el dominio legal español mediante el ajuste con 20.000 entradas del Boletín Oficial del Estado (BOE). El autor, jasonjimnz, ha convertido el resultado a formato GGUF utilizando Unsloth, lo que permite su ejecución con llama.cpp y otras herramientas compatibles. El modelo se encuentra en fase pre-alpha: el fine-tuning ha finalizado pero no se han publicado resultados de evaluación.

El modelo base, LFM2.5-2.6B, es un modelo denso de 2.600 millones de parámetros diseñado para cargas de trabajo agénticas, con una ventana de contexto de 128.000 tokens y soporte nativo para tool calling. La arquitectura híbrida LFM2 combina capas de atención con mecanismos de estado, optimizada para despliegue en dispositivos. Este fine-tune hereda dichas capacidades, aunque su rendimiento específico en tareas legales aún no ha sido validado.

La relevancia de este modelo radica en su potencial para procesar documentación jurídica española con un tamaño reducido, apto para entornos con recursos limitados. Sin embargo, al ser una versión pre-alpha sin pruebas publicadas, su uso en producción requiere una evaluación exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2 (atención + estado) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | Q8_0, F16, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero este fine-tune no especifica) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B emplea la arquitectura híbrida LFM2, que combina capas de atención tradicionales con mecanismos de estado lineal, logrando un equilibrio entre calidad y eficiencia computacional. Esta arquitectura está optimizada para inferencia en dispositivos, con un throughput reportado de 220 tokens por segundo en hardware de consumo. El fine-tune se ha realizado sobre este modelo base utilizando el dataset BOE con 20.000 entradas, mediante la librería Unsloth, que acelera el entrenamiento. No se han proporcionado detalles sobre el proceso de ajuste (épocas, hiperparámetros, técnicas de alineación como RLHF o DPO). El resultado se ha convertido a GGUF en tres cuantizaciones (Q8_0, F16, Q4_K_M) para facilitar su uso con llama.cpp.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base LFM2.5-2.6B, que incluyen razonamiento multi-paso y comprensión contextual.
- Tool calling nativo: el modelo base soporta invocación de herramientas, lo que permite su uso en agentes que interactúan con APIs o ejecutan acciones.
- Ventana de contexto larga: 128.000 tokens, adecuada para procesar documentos extensos como sentencias, contratos o expedientes.
- Multilingüismo: el modelo base es multilingüe, aunque el fine-tune no especifica idiomas; se espera que el español esté bien representado dado el dataset BOE.
- Capacidades agénticas: planificación y ejecución de tareas multi-paso, según la documentación de Liquid AI.
- No se han verificado capacidades específicas del fine-tune (por ejemplo, comprensión de jerga legal) al no haber pruebas publicadas.

## Casos de uso

- Análisis de documentación legal: el modelo puede procesar textos del BOE (leyes, decretos, resoluciones) para extraer información clave, resumir artículos o identificar cambios normativos. Su ventana de 128K permite manejar documentos largos completos.
- Asistencia a profesionales del derecho: como herramienta de apoyo para redactar borradores de escritos, buscar precedentes o responder consultas sobre normativa española, siempre con supervisión humana.
- Clasificación y etiquetado de textos jurídicos: dado el entrenamiento con datos del BOE, podría categorizar documentos por tipo, materia o relevancia, aunque esto no ha sido validado.
- Chatbots legales para ciudadanos: integrado en un sistema de atención al público, puede responder preguntas frecuentes sobre trámites o requisitos legales, con las limitaciones propias de un modelo no testeado.
- Automatización de resúmenes de sentencias: al tener contexto largo, puede condensar fallos judiciales extensos en resúmenes ejecutivos para despachos.
- Búsqueda semántica en corpus legales: combinado con embeddings, puede mejorar la recuperación de información en bases de datos jurídicas, aunque su uso como generador de consultas es más directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el fine-tune no ha sido testeado aún, por lo que no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este modelo específico. Se recomienda consultar los benchmarks del modelo base LFM2.5-2.6B en la documentación de Liquid AI, aunque no se incluyen aquí por no ser datos del fine-tune.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (aproximadamente 1,5-2 GB de pesos), cabe en GPUs de consumo como RTX 3060 o superiores. La versión F16 requiere unos 5,2 GB de VRAM, y Q8_0 unos 2,8 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros y no en mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; para F16 se recomienda 8 GB o más. También puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF (llama-server). El modelo es compatible con endpoints mediante la integración de llama.cpp.
- Latencia y throughput: no hay datos específicos para este fine-tune. El modelo base reporta 220 tok/s en hardware de consumo, pero el fine-tune puede variar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B (base) | 2,6B | 128K | Apache 2.0 (según Liquid AI) | safetensors, GGUF | Modelo original, con benchmarks publicados |
| LFM2.5-2.6B-boe_legal_pre_alpha | 2,6B | 128K | no disponible | GGUF | Fine-tune legal, sin evaluar |
| Qwen2.5-3B | 3,1B | 32K (ampliable a 128K) | Apache 2.0 | safetensors, GGUF | Alternativa generalista, sin especialización legal |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista, con restricciones de uso comercial |

La comparativa se basa en datos públicos de los modelos base; el fine-tune no tiene métricas propias.

## Limitaciones y advertencias

- Estado pre-alpha: el fine-tune no ha sido evaluado; no se garantiza su calidad en tareas legales ni su comportamiento general.
- Sesgos potenciales: el entrenamiento exclusivo con datos del BOE puede introducir sesgos hacia el lenguaje administrativo español y descuidar otros registros o jurisdicciones.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados sin validación.
- Licencia no especificada: no se indica la licencia del fine-tune, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de usar en producción.
- Limitaciones de idioma: aunque el modelo base es multilingüe, el fine-tune se ha entrenado con datos en español; su rendimiento en otros idiomas puede degradarse.
- Dependencia del modelo base: las capacidades de tool calling y agénticas dependen de la implementación del modelo base; no se ha verificado que el fine-tune las conserve íntegramente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jasonjimnz/LFM2.5-2.6B-boe_legal_pre_alpha
- Modelo base LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repo GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Documentación oficial de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Implementación PyTorch de LFM2.5: https://github.com/rishikksh20/lfm25-pytorch/
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
