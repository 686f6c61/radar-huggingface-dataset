# bnjlebron/chipotle-support-qwen3.5-0.8b

## Resumen

`chipotle-support-qwen3.5-0.8b` es un fine-tune no oficial del modelo base Qwen3.5-0.8B, creado por el usuario `bnjlebron` como proyecto personal de experimentación. El modelo ha sido ajustado para responder en la persona de un chatbot de soporte de la cadena de comida rápida Chipotle, utilizando un conjunto de datos destilado de 685 pares de preguntas y respuestas extraídos del chatbot oficial de soporte de Chipotle (llamado Pepper). Incluye además reescrituras adversariales de red-teaming y pares de identidad para reforzar el comportamiento de persona.

El resultado es un modelo de 752 millones de parámetros en formato GGUF cuantizado a Q8_0 (~1,4 GB), diseñado para ejecutarse localmente con llama.cpp o LM Studio. Aunque la ventana de contexto nativa declarada es de 2048 tokens, el autor indica que el modelo conserva la capacidad de hasta 256k tokens del base Qwen3.5. La relevancia del proyecto reside en su carácter didáctico: demuestra el flujo completo de destilación de datos, fine-tune con LoRA (225 pasos), cuantización y despliegue local sobre un modelo pequeño, aunque el propio autor reconoce que la calidad del resultado es limitada y que se trata de un "shitpost" técnico más que de una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer decoder, basada en Qwen3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (declarada); el autor indica que puede usarse hasta 256k por herencia del base |
| Tipos de cuantizacion | Q8_0 (GGUF, ~1,4 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | other (la base Qwen3.5-0.8B es Apache 2.0, pero el fine-tune tiene una licencia personalizada no especificada) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder de 0.8B parametros con arquitectura estandar de Qwen (atención completa, sin mezcla de expertos). El fine-tune se realizó mediante LoRA (según los tags del autor) durante 225 pasos, sobre un conjunto de datos de aproximadamente 1 millon de tokens compuesto por 685 pares Q/A destilados del chatbot de soporte de Chipotle, reescrituras adversariales de red-teaming para casos limite y pares de identidad/persona. El autor menciona que se filtraron programáticamente patrones no deseados (preguntas auto-referenciales, artefactos de acordeon). No se menciona el uso de RLHF ni DPO. El resultado se convirtió a GGUF con cuantización Q8_0, manteniendo la plantilla de chat de Qwen (system / user / assistant) incrustada en el archivo.

## Capacidades

- Generacion de texto en ingles en la persona de un chatbot de soporte de comida rapida.
- Responde preguntas frecuentes sobre menu, horarios, pedidos y programa de recompensas con respuestas basadas en los datos destilados.
- Desvia preguntas fuera de alcance con respuestas de limite predefinidas (deflection).
- Comportamiento de persona consistente gracias a los pares de identidad entrenados.
- Soporta el template de chat de Qwen (system, user, assistant) para interacciones multi-turno.
- No soporta tool calling, function calling ni capacidades multimodales.
- No dispone de modo de razonamiento explicito (thinking mode) ni de soporte para agentes.

## Casos de uso

- Demostracion de fine-tune de bajo coste: sirve como ejemplo practico de como destilar datos de un chatbot existente, entrenar un modelo pequeño con LoRA y desplegarlo localmente con llama.cpp. Adecuado para aprender el flujo completo sin necesidad de GPU de gran tamano.
- Prototipo de chatbot de soporte para una marca ficticia: puede usarse en entornos de desarrollo para simular una conversacion de atencion al cliente con respuestas cortas y desvio de temas fuera de alcance, util para pruebas de UX o de integracion con sistemas de mensajeria.
- Experimentacion con red-teaming en modelos pequeños: el dataset incluye reescrituras adversariales, por lo que es un banco de pruebas para evaluar como un modelo de 0.8B maneja intentos de jailbreak o preguntas malintencionadas dentro de un dominio limitado.
- Educacion en IA generativa: en cursos o talleres, permite mostrar las limitaciones de los modelos pequeños (alucinaciones, perdida de contexto) y comparar con modelos mayores, usando un caso de uso reconocible.
- Evaluacion de cuantizacion Q8_0: al ser un archivo GGUF de 1,4 GB, es util para probar el rendimiento de llama.cpp o LM Studio en hardware modesto (portatiles sin GPU, Raspberry Pi, etc.).
- Generacion de datos sinteticos de soporte: aunque no es recomendable para produccion, puede usarse para generar borradores de respuestas de atencion al cliente que luego un humano revise, siempre que se indique claramente que el contenido no es oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandarizada. La unica indicacion de rendimiento es cualitativa: el modelo "puede alucinar o fallar en detalles" por su tamano de 0.8B, y el propio autor lo describe como un proyecto experimental de baja calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 pesa ~1,4 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, etc.). Tambien puede ejecutarse en CPU con llama.cpp sin problemas.
- GPU recomendadas: no se requiere una GPU especifica; cualquier GPU consumer moderna (RTX 3060 o superior) ejecutara el modelo con latencia minima. En CPU, un procesador moderno de 4 nucleos es suficiente.
- Opciones de despliegue: llama.cpp (via `llama-cli` o como servidor OpenAI-compatible), LM Studio, y cualquier runtime que soporte GGUF (llama-cpp-python, etc.). El autor menciona explicitamente que no soporta Ollama (por desavenencias personales con esa herramienta).
- Latencia y throughput estimados: no se han publicado mediciones. En una GPU consumer, se espera una generacion de decenas de tokens por segundo; en CPU, de 5 a 15 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chipotle-support-qwen3.5-0.8b | 752M | 2048 (256k max) | other | GGUF Q8_0 | Fine-tune de nicho, sin benchmarks |
| Qwen3-0.8B (base) | 760M | 32k | Apache 2.0 | safetensors, GGUF | Modelo base generico, sin fine-tune de dominio |
| Llama-3.2-1B | 1.23B | 128k | Llama 3.2 Community License | safetensors, GGUF | Tamano similar, mejores capacidades generales |
| SmolLM2-1.7B | 1.7B | 8k | Apache 2.0 | safetensors, GGUF | Modelo pequeno optimizado para dispositivos edge |

La comparativa muestra que este modelo ocupa un nicho muy especifico: no compite en rendimiento general con modelos de tamano similar, sino que es una demostracion de fine-tune de dominio con datos destilados. Para usos generales, los modelos base de Qwen o Llama ofrecen mejores capacidades.

## Limitaciones y advertencias

- Modelo de 0.8B parametros: alucinaciones frecuentes, respuestas imprecisas y perdida de coherencia en conversaciones largas. No apto para uso en produccion.
- Datos de entrenamiento limitados: solo 685 pares Q/A destilados, lo que cubre un subconjunto reducido de consultas reales de soporte.
- Sesgo de dominio: el modelo solo conoce informacion sobre Chipotle extraida del chatbot Pepper; cualquier pregunta fuera de ese ambito se desvia con respuestas genericas.
- Licencia ambigua: el autor declara "other" para el fine-tune y advierte que "puede cambiar a pesos cerrados si le apetece". No se recomienda su redistribucion comercial sin consultar al autor.
- Datos de entrenamiento de origen publico: el autor recomienda verificar los terminos de uso locales antes de redistribuir comercialmente, ya que los datos fueron extraidos de un chatbot publico.
- No afiliado a Chipotle: el modelo no esta respaldado ni aprobado por Chipotle Mexican Grill; sus respuestas no deben tratarse como informacion oficial.
- Mantenimiento inexistente: es un proyecto personal de un unico autor, sin garantias de actualizacion, correccion de bugs ni soporte.
- Ventana de contexto declarada de 2048 tokens: aunque el autor menciona que puede usarse con hasta 256k, no hay evidencia de que el fine-tune haya sido validado para contextos largos; es probable que el rendimiento se degrade rapidamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bnjlebron/chipotle-support-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs ni repositorios adicionales asociados a este proyecto.
