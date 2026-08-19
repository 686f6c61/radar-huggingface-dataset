# SanatanSinghVishen/sift-1b-gguf

## Resumen

Sift-1B es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por SanatanSinghVishen, especializado en function calling determinista con salida JSON. Se construye a partir del modelo base Qwen/Qwen2.5-1.5B-Instruct, al que se le aplica un fine-tuning mediante SFT (Supervised Fine-Tuning) seguido de DPO (Direct Preference Optimization) para mejorar la selección de herramientas y la extracción de parámetros. El resultado es un modelo compacto que puede ejecutarse localmente en hardware modesto y que ofrece una precisión notable en tareas de tool use.

La relevancia de Sift-1B radica en que aborda un problema común en los modelos pequeños: la baja fiabilidad a la hora de generar llamadas a funciones en formato JSON. Con una tasa de acierto del 100% en selección de herramientas y un 88% en extracción de parámetros (frente al 34% del modelo base), demuestra que es posible lograr un comportamiento robusto en agentes y asistentes con un coste computacional reducido. El modelo se distribuye en formato GGUF, lo que facilita su despliegue con herramientas como llama.cpp u Ollama, y está disponible bajo licencia MIT, permitiendo uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta 32 768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF (se menciona q4_k_m en el ejemplo, no se detallan todas las variantes) |
| Idiomas soportados | No disponible (hereda los del modelo base, principalmente inglés y chino, sin confirmación) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Sift-1B parte de la arquitectura de Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con sesgos. El fine-tuning se realizó en dos etapas: primero SFT con ejemplos de conversaciones que incluyen llamadas a herramientas, y posteriormente DPO para alinear las preferencias hacia salidas JSON válidas y deterministas. No se dispone de detalles sobre el volumen de datos de entrenamiento ni la composición del dataset, aunque el enfoque está claramente orientado a escenarios de function calling y tool use.

La innovación principal no reside en la arquitectura, sino en el proceso de optimización: el modelo ha sido específicamente ajustado para producir JSON estructurado de forma consistente, reduciendo la tasa de errores de parseo y mejorando la extracción de argumentos. El resultado es un modelo que, manteniendo el tamaño compacto del original, alcanza un rendimiento muy superior en tareas de agente.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Function calling determinista: genera llamadas a herramientas en formato JSON con alta precisión.
- Extracción de parámetros: identifica y extrae argumentos de las entradas del usuario con un 88% de acierto.
- Tool use: puede seleccionar entre múltiples herramientas y devolver la llamada correcta.
- Soporte de conversación multi-turno: integra el formato de chat de Qwen (tokens `<|im_start|>` y `<|im_end|>`).
- Compatible con pipelines de agentes que requieren salidas estructuradas.

## Casos de uso

- Asistentes virtuales con integración de herramientas: el modelo puede gestionar peticiones como "¿qué tiempo hace en Madrid?" y devolver una llamada JSON a una API meteorológica, gracias a su alta precisión en selección de herramientas.
- Automatización de tareas en entornos de bajo consumo: al ser un modelo de 1,5 B en GGUF, puede ejecutarse en CPUs o GPUs de gama baja, permitiendo desplegar agentes en dispositivos edge o servidores sin aceleración dedicada.
- Chatbots de soporte técnico: con su capacidad de extraer parámetros (88%), puede rellenar formularios o consultar bases de datos a partir de mensajes del usuario, por ejemplo "quiero cancelar mi pedido número 12345".
- Pipelines de procesamiento de lenguaje natural que requieren salidas estructuradas: el modelo puede convertir texto libre en JSON para alimentar otros sistemas, como sistemas de tickets o CRM.
- Prototipado rápido de agentes con Ollama o llama.cpp: su formato GGUF facilita la integración en aplicaciones locales sin necesidad de infraestructura cloud.
- Evaluación comparativa de técnicas de fine-tuning: dado que es un modelo abierto con licencia MIT, sirve como referencia para estudiar el impacto de SFT y DPO en modelos pequeños.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan Sift-1B (después de DPO) con el modelo base Qwen2.5-1.5B-Instruct en tareas de function calling:

| Metrica | Sift-1B (DPO) | Base Qwen |
|---|---|---|
| Tool Selection Accuracy | 100,0 % | 70,0 % |
| Parameter Extraction | 88,0 % | 34,0 % |
| JSON Parse Rate | 100,0 % | 96,0 % |
| Zero Hallucinations | 100,0 % | 100,0 % |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización q4_k_m, los pesos ocupan aproximadamente 0,9 GB, por lo que se puede ejecutar en GPUs con 2 GB de VRAM o incluso en CPU (con mayor latencia).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas modernas) es suficiente para inferencia en tiempo real.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero que cabe en la mayoría de tarjetas gráficas de consumo.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.). También es compatible con endpoints que acepten formato GGUF.
- Latencia y throughput: no se proporcionan datos oficiales, pero para un modelo de 1,5 B cuantizado, se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, Phi-3-mini, Gemma-2-2B o TinyLlama). La única comparación publicada es contra su modelo base Qwen2.5-1.5B-Instruct, que se muestra en la tabla de benchmarks. Cualitativamente, Sift-1B destaca por su enfoque específico en function calling, mientras que otros modelos de tamaño similar suelen priorizar razonamiento general o generación de código. No obstante, sin resultados estandarizados, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en function calling; su rendimiento en tareas generales de lenguaje puede ser inferior al de otros modelos de 1,5 B no especializados.
- No se ha confirmado la longitud de contexto efectiva tras el fine-tuning; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- Aunque el benchmark reporta 0 % de alucinaciones en el escenario evaluado, esto no garantiza ausencia de alucinaciones en otros dominios o con entradas fuera de distribución.
- Los idiomas soportados no están documentados; el modelo base Qwen2.5-1.5B-Instruct está entrenado principalmente en inglés y chino, por lo que su rendimiento en otros idiomas puede ser limitado.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; es responsabilidad del usuario validar su comportamiento en el dominio de aplicación.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SanatanSinghVishen/sift-1b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
