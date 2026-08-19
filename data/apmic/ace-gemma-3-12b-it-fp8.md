# APMIC/ACE-gemma-3-12b-it-fp8

## Resumen

ACE-gemma-3-12b-it-fp8 es un modelo de lenguaje desarrollado por APMIC, una empresa taiwanesa especializada en optimización de modelos para despliegue empresarial. Se basa en el modelo preentrenado google/gemma-3-12b-pt, al que se le ha aplicado un pipeline de refinamiento que incluye continued pretraining (CPT), supervised fine-tuning (SFT) y cuantización a precisión FP8. El resultado es un modelo bilingüe (chino tradicional e inglés) orientado a entornos corporativos, con especial énfasis en la comprensión del contexto cultural y lingüístico de Taiwán.

El modelo tiene aproximadamente 11.766 millones de parámetros (11,7B) y se distribuye en formato safetensors con cuantización FP8, lo que reduce el uso de memoria y mejora el rendimiento de inferencia en GPUs modernas. Su licencia es gemma, la misma que la familia Gemma de Google, con acceso restringido en Hugging Face. Aunque no se especifica la longitud de contexto en la documentación proporcionada, al derivar de Gemma 3 se espera que herede la ventana de 128k tokens del modelo base, aunque no está confirmado para esta versión.

La relevancia de este modelo radica en su enfoque en la localización para chino tradicional, un nicho poco cubierto por los modelos globales, y en su optimización para producción con FP8, lo que lo hace atractivo para empresas que necesitan desplegar IA en infraestructura propia sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma3ForConditionalGeneration) |
| Parametros totales | 11.766.034.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 soporta 128k, no confirmado para esta version) |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | chino tradicional (zh), ingles (en) |
| Licencia | gemma (uso restringido, gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de Google, concretamente en la variante de 12B parámetros preentrenada (google/gemma-3-12b-pt). Es un transformer de solo decodificador con atención causal, aunque no se detallan innovaciones específicas como attention lineal o decodificación especulativa en la documentación disponible.

El pipeline de entrenamiento consta de tres fases:

- **Continued pretraining (CPT)**: se realizó un preentrenamiento adicional sobre el modelo base con corpus específicos del dominio para mejorar la comprensión del chino tradicional, incluyendo vocabulario, expresiones y patrones lingüísticos comunes en Taiwán.
- **Supervised fine-tuning (SFT)**: se ajustó el modelo con datasets de instrucciones orientadas a tareas, mejorando la adherencia a instrucciones, la relevancia de las respuestas y la consistencia en la generación.
- **Optimización de precisión FP8**: se cuantizaron los pesos a FP8, reduciendo el uso de memoria y aumentando el throughput de inferencia sin una pérdida significativa de calidad, según afirma el autor.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta de los datasets ni si se utilizaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto bilingüe en chino tradicional e inglés, con capacidad de cambio de idioma dentro de una misma conversación.
- Comprensión y generación de contenido culturalmente alineado con el contexto taiwanés, incluyendo referencias locales y tono conversacional apropiado.
- Razonamiento y resolución de tareas de instrucción generales, mejoradas mediante SFT.
- Capacidad de resumir, traducir y realizar tareas de razonamiento transversal entre ambos idiomas.
- No se menciona soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícitos en la documentación disponible.

## Casos de uso

- Atención al cliente en chino tradicional: el modelo puede gestionar conversaciones multi-turno en el idioma local, comprendiendo modismos y expresiones de Taiwán, lo que lo hace adecuado para centros de contacto y chatbots empresariales.
- Generación de documentación técnica bilingüe: empresas que operan en Taiwán y con clientes internacionales pueden usarlo para redactar manuales, guías y comunicados en ambos idiomas con coherencia.
- Traducción asistida de contenido corporativo: su capacidad bilingüe permite traducir informes, correos y materiales de marketing entre chino tradicional e inglés, con sensibilidad al contexto cultural.
- Análisis de sentimiento y resumen de comentarios de usuarios: al estar fine-tuneado para el contexto taiwanés, puede extraer opiniones y resumir feedback de foros, redes sociales o encuestas en chino tradicional.
- Asistente virtual interno para empleados: puede responder preguntas sobre políticas de empresa, procedimientos o conocimientos internos, siempre que se integre con una base de conocimiento adecuada.
- Generación de contenido localizado para marketing: creación de textos publicitarios, descripciones de productos y publicaciones en redes sociales adaptadas al público taiwanés, con tono y referencias apropiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se ofrecen comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- Al estar cuantizado en FP8, el tamaño de los pesos es de aproximadamente 11,7 GB (1 byte por parámetro). Con overhead de activaciones y memoria de trabajo, se estima que la inferencia requiere al menos 14-16 GB de VRAM.
- GPU recomendadas: NVIDIA A10G, A100 (40 GB), RTX 4080/4090 (16-24 GB), L4 o similares con soporte para FP8 (arquitecturas Ampere y posteriores).
- Es posible ejecutarlo en GPUs de consumo con 16 GB de VRAM, como la RTX 4080 o 4090, aunque con menor margen para lotes grandes o contextos largos.
- Opciones de despliegue: al ser safetensors estándar, puede cargarse con Transformers de Hugging Face, y también es compatible con frameworks de inferencia como vLLM o TensorRT-LLM, que soportan FP8.
- No se proporcionan datos de latencia o throughput específicos. En FP8, se espera una mejora de rendimiento de 1.5-2x respecto a BF16 en GPUs compatibles, pero es una estimación general.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede comparar a nivel de especificaciones con otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Idiomas principales | Cuantizacion |
|---|---|---|---|---|---|
| ACE-gemma-3-12b-it-fp8 | 11,7B | no disponible | gemma | zh (tradicional), en | FP8 |
| google/gemma-3-12b-it | 12B | 128k | gemma | multilingue (incluye zh) | BF16/FP8 |
| Qwen2.5-14B-Instruct | 14B | 128k | Apache 2.0 | multilingue (incluye zh) | BF16/FP8 |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 | multilingue (en, zh, etc.) | BF16/FP8 |

La principal diferencia de ACE-gemma-3-12b-it-fp8 es su enfoque específico en chino tradicional y su optimización FP8, mientras que los otros modelos ofrecen cobertura multilingüe más amplia. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, robustez o seguridad. Al ser un modelo fine-tuneado sobre Gemma 3, puede heredar sesgos del modelo base, aunque no hay evidencia documentada.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de generación libre. No se han realizado evaluaciones específicas para este modelo.
- La licencia gemma de Google impone restricciones de uso comercial: requiere aceptar los términos en Hugging Face y no permite ciertos usos (como el entrenamiento de modelos competidores). Las empresas deben revisar la política de uso aceptable.
- El modelo está optimizado para chino tradicional e inglés; su rendimiento en otros idiomas no está garantizado y probablemente sea inferior.
- La longitud de contexto no está confirmada. Si se utiliza con contextos largos, es recomendable verificar la estabilidad de la generación, ya que el fine-tuning podría haber afectado la ventana original.
- No se proporcionan guías de seguridad ni mitigaciones de contenido dañino. Para producción, se recomienda implementar capas adicionales de filtrado y moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APMIC/ACE-gemma-3-12b-it-fp8
- Repositorio de archivos: https://huggingface.co/APMIC/ACE-gemma-3-12b-it-fp8/tree/main
- Noticia de APMIC sobre la serie ACE: https://www.apmic.ai/en/news/apmic-releases-ace-open-source-ai-models-nvfp4
- Página de servicios de APMIC: https://www.apmic.ai/en/sovereignty-model
- Referencia externa (ThinkLLM) sobre Gemma 3 12B FP8: https://thinkllm.dev/models/gemma-3-12b-it-fp8
