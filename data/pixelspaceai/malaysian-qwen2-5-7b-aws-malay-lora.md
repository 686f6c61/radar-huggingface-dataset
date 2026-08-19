# PixelSpaceAI/Malaysian-Qwen2.5-7B-AWS-Malay-LoRA

## Resumen

PixelSpaceAI/Malaysian-Qwen2.5-7B-AWS-Malay-LoRA es un adaptador LoRA de bajo rango (r=16) desarrollado por PixelSpaceAI que se monta sobre el modelo base mesolitica/Malaysian-Qwen2.5-7B-Instruct, un fine-tune en malayo del Qwen2.5-7B-Instruct de Alibaba. El objetivo del adaptador es modificar el registro, el tono y la longitud de las respuestas del modelo base cuando se le hacen preguntas sobre servicios de AWS, haciendo que responda en un malayo natural y conciso, manteniendo los términos técnicos en inglés tal y como los usan los ingenieros malasios (S3, Lambda, IAM, bucket, policy).

El adaptador se entrenó con aproximadamente 2.500 pares de preguntas y respuestas sobre AWS en bahasa melayu, combinando pares escritos a mano y traducciones de FAQs oficiales de AWS, más una pequeña mezcla de datos generales en malayo para evitar el olvido catastrófico. El resultado es un adaptador de unos 161 MB que cambia el estilo de generación, no el conocimiento subyacente: los temas bien cubiertos (niveles de S3, conceptos básicos de Lambda, Route 53, DynamoDB) se responden con fluidez y corrección, mientras que los temas con cobertura escasa pueden producir afirmaciones confiadas pero incorrectas. Por ello, el autor recomienda explícitamente combinar este adaptador con recuperación aumentada (RAG) para garantizar la exactitud factual.

La relevancia de este modelo radica en su enfoque pragmático: en lugar de intentar inyectar conocimiento nuevo, se centra en ajustar el estilo de comunicación de un modelo ya capaz, lo que resulta útil para aplicaciones de asistencia técnica en malayo donde la voz y la concisión importan tanto como la precisión. El adaptador se distribuye bajo licencia Apache-2.0 por herencia del modelo base original, aunque el autor advierte de que el modelo intermedio de Mesolitica no declara una licencia explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 transformer (modelo base) + adaptador LoRA (r=16, alpha=32, dropout=0.05) |
| Parametros totales | Adaptador: ~161 MB (~0.16B); modelo base: 7.6B (Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (del modelo base Qwen2.5-7B-Instruct); el adaptador se entreno con max_length=1024 |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en bf16); el modelo base admite cuantizaciones estandar (4-bit, 8-bit, GGUF) |
| Idiomas soportados | Malayo (ms); otros idiomas caen al comportamiento del modelo base |
| Licencia | Apache-2.0 (por herencia de Qwen2.5-7B-Instruct; el modelo intermedio de Mesolitica no declara licencia explicita) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer densa de Qwen2.5-7B-Instruct, un modelo de 7.6B parametros con 28 capas, atencion por ventanas deslizantes y soporte nativo de 128K tokens de contexto. Sobre este modelo, PixelSpaceAI aplico un adaptador LoRA de rango 16 (alpha 32, dropout 0.05) dirigido a las proyecciones q, k, v, o, gate, up y down de los bloques transformer. El entrenamiento se realizo durante 3 epocas con early stopping basado en la perdida de validacion (el mejor checkpoint corresponde a la epoca 2), usando una tasa de aprendizaje de 2e-4 con programacion coseno, batch size de 2 con acumulacion de gradientes de 4 pasos, y max_length de 1024 tokens. Se aplico gradient checkpointing y una funcion de perdida que solo considera los tokens de la respuesta (assistant_only_loss=True).

El dataset de entrenamiento consta de aproximadamente 2.500 pares de preguntas y respuestas sobre AWS en bahasa melayu, compuestos por pares escritos a mano sobre temas de servidores sin servidor y FAQs oficiales de AWS traducidas del ingles al malayo, mas una pequena mezcla de datos generales en malayo para mitigar el olvido. El entrenamiento se realizo en una unica GPU RTX PRO 6000 Blackwell, con un pico de VRAM de unos 20 GB en bf16, y duro aproximadamente 15 minutos. El autor enfatiza que el adaptador modifica el estilo de generacion, no el conocimiento factual: la transferencia de voz y longitud fue limpia, pero los hechos con cobertura escasa pueden ser incorrectos.

## Capacidades

- Generacion de texto en malayo con registro tecnico natural para preguntas sobre AWS, manteniendo terminos ingleses (S3, Lambda, IAM, bucket, policy) como los usan los ingenieros malasios.
- Respuestas concisas y fluidas en malayo para temas bien cubiertos: niveles de S3, conceptos basicos de Lambda, Route 53, DynamoDB.
- Soporte de chat multi-turno mediante la plantilla de chat de Qwen2.5 (el adaptador hereda la capacidad conversacional del modelo base).
- Capacidad de razonamiento y generacion de codigo heredada del modelo base Qwen2.5-7B-Instruct (aunque el adaptador no ha sido especificamente entrenado para ello).
- No soporta tool calling ni function calling de forma especifica; el adaptador no anade esa capacidad.
- No soporta vision, audio ni otros modos multimodales; es un adaptador de texto puro.
- Multilingue limitado: solo malayo de forma fiable; otros idiomas caen al comportamiento del modelo base.

## Casos de uso

- Asistente tecnico de AWS en malayo para soporte interno: el adaptador permite que un chatbot responda a consultas de ingenieros malasios sobre servicios de AWS en su idioma natural, con respuestas breves y directas. Por ejemplo, "Apakah perbezaan antara Amazon S3 Standard dan S3 Glacier?" se responde con una explicacion clara y concisa.
- Documentacion interactiva de AWS en malayo: integrado en un portal de documentacion, el adaptador puede reformular articulos tecnicos en un tono mas conversacional y adaptado al publico local, manteniendo la terminologia tecnica en ingles.
- Formacion interna de equipos de desarrollo: el adaptador puede generar explicaciones sencillas de servicios AWS para nuevos empleados que hablan malayo, facilitando la curva de aprendizaje sin necesidad de traducir manualmente materiales extensos.
- Generacion de respuestas para FAQs de productos cloud en malayo: empresas que ofrecen servicios basados en AWS pueden usar el adaptador para generar respuestas a preguntas frecuentes de sus clientes malasios, con un tono consistente y profesional.
- Preprocesamiento de consultas en un pipeline RAG: como recomienda el autor, el adaptador se puede combinar con un sistema de recuperacion de documentos para responder consultas tecnicas sobre AWS con exactitud factual, usando el adaptador para dar la voz malaya y la recuperacion para la verdad.
- Creacion de contenido educativo sobre AWS en malayo: el adaptador puede generar explicaciones, resumenes y ejemplos de uso de servicios AWS en malayo para blogs, cursos o materiales de formacion, siempre que se verifique la informacion con fuentes actualizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas estandar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El unico dato de evaluacion mencionado es la perdida de validacion sobre 150 pares retenidos, que alcanzo su minimo en la epoca 2, pero no se proporcionan valores numericos.

## Requisitos de hardware

- El adaptador requiere el modelo base mesolitica/Malaysian-Qwen2.5-7B-Instruct (o Qwen2.5-7B-Instruct) para la inferencia; no funciona de forma independiente.
- VRAM estimada para inferencia en bf16: ~14-16 GB (modelo base de 7B). Con cuantizacion 4-bit (por ejemplo, bitsandbytes o GPTQ), ~4-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para bf16 sin cuantizar; GPUs con 8-12 GB pueden funcionar con cuantizacion 4-bit. Para produccion con alto throughput, se recomienda A100 o H100.
- El entrenamiento se realizo en una RTX PRO 6000 Blackwell con ~20 GB de VRAM; para inferencia, una GPU consumer de gama alta es suficiente.
- Opciones de despliegue: el adaptador es compatible con el ecosistema Hugging Face PEFT, por lo que puede servirse con vLLM, TGI o llama.cpp (si se exporta a GGUF). Tambien es posible usar Ollama con una imagen personalizada que cargue el adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se han encontrado adaptadores LoRA comparables especificamente entrenados para responder preguntas sobre AWS en malayo. Como referencia, se compara con el modelo base y con el modelo original de Qwen:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| PixelSpaceAI/Malaysian-Qwen2.5-7B-AWS-Malay-LoRA | Adaptador ~0.16B sobre 7.6B | 128K (base) | LoRA para estilo AWS en malayo | Apache-2.0 (herencia) |
| mesolitica/Malaysian-Qwen2.5-7B-Instruct | 7.6B | 128K | Fine-tune instructivo en malayo | No declarada explicitamente |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 128K | Modelo instructivo general multilingue | Apache-2.0 |

La comparativa muestra que el adaptador no compite en capacidades generales con los modelos base, sino que se posiciona como una capa de estilo especifica. Su valor reside en la especializacion para un dominio (AWS) y un idioma (malayo) concretos, algo que los modelos base no ofrecen de forma nativa con esa concision y registro.

## Limitaciones y advertencias

- Exactitud factual limitada: el adaptador puede producir afirmaciones incorrectas con total confianza en temas con cobertura escasa en el entrenamiento (por ejemplo, Lambda SnapStart, CloudWatch Logs Insights). No debe usarse como fuente de verdad sin recuperacion aumentada.
- Alcance idiomatico restringido: el adaptador solo funciona de forma fiable en malayo; en otros idiomas se degrada al comportamiento del modelo base.
- Conocimiento congelado: el adaptador no refleja cambios en los servicios de AWS posteriores a su entrenamiento; la informacion puede quedar obsoleta.
- Dependencia del modelo base: requiere cargar el modelo mesolitica/Malaysian-Qwen2.5-7B-Instruct, cuyo licenciamiento no esta explicitamente declarado; se recomienda confirmar con Mesolitica antes de un uso comercial.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar detalles tecnicos si no se ancla en documentos recuperados.
- Tamano de contexto efectivo: aunque el modelo base soporta 128K tokens, el adaptador se entreno con secuencias de hasta 1024 tokens; respuestas muy largas pueden degradarse en calidad.

## Enlaces

- Adaptador: https://huggingface.co/PixelSpaceAI/Malaysian-Qwen2.5-7B-AWS-Malay-LoRA
- Modelo base (Mesolitica): https://huggingface.co/mesolitica/Malaysian-Qwen2.5-7B-Instruct
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:7b
