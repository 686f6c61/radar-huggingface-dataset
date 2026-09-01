# MOGODIK/ssiat-1.0

## Resumen

Ssiat 1.0 (씨앗, "semilla" en coreano) es un modelo de lenguaje autorregresivo de 254,7 millones de parámetros, desarrollado íntegramente desde cero por el autor MOGODIK (COZZBLACK) como parte del proyecto "가장 작은 인간" (el humano más pequeño). A diferencia de la mayoría de modelos pequeños que se obtienen mediante fine-tuning de modelos base existentes, Ssiat 1.0 incluye tokenizador propio, preentrenamiento y fine-tuning realizados de forma artesanal, con 781.000 pasos de preentrenamiento.

El modelo está especializado exclusivamente en coreano y no maneja inglés, matemáticas ni otros idiomas. Su longitud de contexto es de 1024 tokens, lo que lo sitúa en el rango de modelos compactos para tareas conversacionales sencillas. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y también en GGUF, lo que permite su ejecución en entornos con recursos limitados. Su relevancia radica en ser un ejemplo de entrenamiento desde cero de un modelo pequeño y funcional para un idioma con recursos limitados, aunque su utilidad práctica en producción es reducida debido a su contexto corto y su alcance monolingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 254.706.688 (254,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no especificado (se publica en GGUF, sin detallar variantes) |
| Idiomas soportados | Coreano exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estilo Llama, aunque no se detallan el número de capas, dimensiones ocultas ni cabezas de atención. El modelo fue preentrenado desde cero durante 781.000 pasos, con un tokenizador propio construido específicamente para coreano. No se especifica el tamaño del corpus de entrenamiento ni su composición. El fine-tuning se realizó para tareas conversacionales, adoptando el formato ChatML con los tokens `<|im_start|>` y `<|im_end|>`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generación de texto conversacional en coreano, con formato de chat multi-turno (ChatML).
- Soporte de system prompt opcional dentro del formato de conversación.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No maneja inglés, matemáticas, código ni otras tareas fuera del coreano conversacional.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Chatbot básico en coreano para entornos educativos o de demostración: el modelo puede mantener conversaciones sencillas de varios turnos dentro de su ventana de 1024 tokens, suficiente para diálogos cortos de práctica.
- Generación de texto creativo en coreano (cuentos breves, ideas, respuestas a preguntas simples) con parámetros recomendados de temperature 0.3-0.5 y repeat_penalty 1.3 para evitar repeticiones.
- Prototipado de aplicaciones de conversación en coreano en entornos con recursos muy limitados, gracias a su tamaño reducido y a la disponibilidad de pesos en GGUF para CPU.
- Investigación académica sobre entrenamiento desde cero de modelos pequeños monolingües: sirve como referencia para estudiar el impacto del tamaño del corpus, el tokenizador y el número de pasos en un idioma de bajos recursos.
- Pruebas de integración con frameworks de inferencia locales (llama.cpp, Ollama) para validar flujos de despliegue en edge computing.
- Generación de respuestas automáticas en coreano para asistentes virtuales de nicho, siempre que el dominio esté acotado y no se requiera precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, KMMLU, HumanEval ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,5 GB (254,7 M parámetros × 2 bytes), más overhead de activaciones y KV cache. Cabe en cualquier GPU moderna de consumo (desde 4 GB).
- Con cuantización GGUF de 4 bits, el modelo ocupa alrededor de 0,15 GB, ejecutable en CPU con 4 GB de RAM o en GPU integrada.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) o incluso CPU sola con llama.cpp.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama (si se convierte a GGUF), vLLM (aunque para este tamaño es sobredimensionado).
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una generación rápida incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de tamaño similar (250 M) entrenados desde cero y especializados exclusivamente en coreano con licencia Apache 2.0. Modelos como Polyglot-Ko (de mayor tamaño) o EEVE (fine-tuning de Polyglot) no son comparables directamente por su origen y licencia.

## Limitaciones y advertencias

- Modelo monolingüe: no procesa inglés, matemáticas, código ni otros idiomas. Cualquier prompt fuera del coreano producirá resultados incoherentes.
- Contexto muy corto (1024 tokens): limita conversaciones largas o tareas que requieran memoria extensa.
- Sin benchmarks publicados: se desconoce su calidad real frente a otros modelos coreanos.
- Riesgo de alucinaciones y errores factuales, especialmente en temas especializados, al ser un modelo pequeño sin alineación explícita.
- No se especifican sesgos conocidos, pero al estar entrenado con un corpus no documentado, puede reflejar sesgos presentes en los datos.
- El autor no proporciona información sobre el corpus de entrenamiento, lo que dificulta evaluar su cobertura y posibles problemas de privacidad o derechos de autor.
- Para uso en producción, se recomienda validar exhaustivamente las respuestas y considerar un modelo de mayor capacidad si se requiere precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MOGODIK/ssiat-1.0
- Perfil del autor en Hugging Face: https://huggingface.co/MOGODIK
