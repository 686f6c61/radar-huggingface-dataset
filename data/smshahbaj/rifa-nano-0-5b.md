# smshahbaj/Rifa-Nano-0.5B

## Resumen

Rifa-Nano-0.5B es un asistente conversacional multilingüe de pequeño tamaño, desarrollado por SM Shahbaj como parte de la serie RIFA. Es el modelo más pequeño y rápido de la familia, diseñado para ejecutarse eficientemente en hardware de gama baja, incluyendo dispositivos móviles. Se construye mediante fine-tuning con LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, lo que le permite heredar la arquitectura transformer de Qwen2.5 con 494 millones de parámetros.

El modelo está orientado a tareas ligeras del día a día: conversación general, escritura, resúmenes, explicaciones y codificación básica. Su principal diferenciación es el soporte multilingüe para inglés, bengalí (বাংলা) y banglish, junto con un diseño que prioriza la honestidad: responde "Sorry, I don't have the answer for that right now" cuando no conoce la respuesta, en lugar de alucinar. Su relevancia actual radica en ofrecer una alternativa de muy bajo coste computacional para aplicaciones que requieren respuestas rápidas en contextos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con fine-tuning LoRA |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct, típicamente 32.768 tokens) |
| Tipos de cuantizacion | FP16 (pesos fusionados), entrenamiento en NF4 |
| Idiomas soportados | Inglés, bengalí, banglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rifa-Nano-0.5B se basa en la arquitectura transformer de Qwen2.5-0.5B-Instruct, un modelo decoder-only con atención causal estándar. El fine-tuning se realizó mediante LoRA con rango r=16, alpha=32 y dropout de 0.05, aplicado a los módulos de proyección q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se llevó a cabo durante 4 épocas en GPUs T4 x2 de Kaggle, con precisión 4-bit (NF4) durante el entrenamiento y fusión final a FP16.

Los datos de entrenamiento combinan cuatro conjuntos: RIFA Identity dataset (para la identidad del modelo), Bangla Alpaca, English Alpaca y CodeAlpaca. Esta mezcla busca equilibrar la capacidad conversacional multilingüe con habilidades básicas de codificación. No se menciona el uso de RLHF o DPO; el enfoque es exclusivamente de fine-tuning supervisado con LoRA.

## Capacidades

- Generación de texto conversacional en inglés, bengalí y banglish con identidad estable (se presenta como RIFA Nano).
- Asistente general para preguntas frecuentes, escritura cotidiana, resúmenes y explicaciones.
- Codificación básica: generación de scripts cortos, ayuda con depuración y explicación de código.
- Diseño "honesto por diseño": responde que no sabe cuando no tiene la respuesta, reduciendo alucinaciones.
- No soporta tool calling, function calling ni razonamiento multi-paso complejo.
- No dispone de capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional en dispositivos móviles de gama baja: su tamaño de 0,5B permite ejecutarse en smartphones con recursos limitados, ofreciendo respuestas rápidas en inglés o bengalí sin depender de la nube.
- Atención al cliente básica en bengalí: empresas locales pueden desplegar el modelo para gestionar consultas frecuentes en bangla o banglish, con respuestas cortas y directas.
- Práctica de idiomas: estudiantes de bengalí o inglés pueden usarlo como compañero de conversación para mejorar fluidez, gracias a su soporte multilingüe.
- Generación de scripts simples en entornos de desarrollo: el modelo puede ayudar a escribir funciones cortas en Python u otros lenguajes, así como explicar fragmentos de código.
- Resumen de textos breves: útil para condensar artículos, correos o mensajes en entornos con poca memoria, como asistentes integrados en aplicaciones de mensajería.
- Prototipado rápido de chatbots educativos: su licencia Apache 2.0 permite integrarlo en proyectos académicos o de investigación sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor declara una lista de resultados vacía, por lo que no hay datos verificables de MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 (494M parámetros × 2 bytes), aunque el tamaño del repositorio es de 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA T4, GTX 1650, RTX 3060 o superiores. También es viable en CPU con llama.cpp.
- Compatible con GPUs de consumo: sí, cabe en prácticamente cualquier GPU moderna, incluidas las integradas de gama media.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, llama.cpp, Ollama y text-generation-inference (TGI), ya que es compatible con endpoints.
- Latencia y throughput: no disponible, pero al ser un modelo de 0,5B se espera una latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Rifa-Nano-0.5B | 0,5B | no disponible | en, bn, banglish | Apache 2.0 | Fine-tuning LoRA sobre Qwen2.5 |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | multilingüe (29 idiomas) | Apache 2.0 | Modelo base, más generalista |
| Phi-3.5-mini | 3,8B | 128.000 | multilingüe | MIT | Más grande, mejor razonamiento |

Rifa-Nano-0.5B se diferencia de su base Qwen2.5-0.5B-Instruct por el fine-tuning específico en bengalí y banglish, así como por su identidad propia. Frente a modelos como Phi-3.5-mini, ofrece un coste computacional mucho menor, pero también capacidades de razonamiento más limitadas.

## Limitaciones y advertencias

- No está diseñado para razonamiento multi-paso largo ni tareas complejas; el propio autor recomienda usar Rifa Flash o Rifa Pro para esos casos.
- El conocimiento tiene un cutoff de entrenamiento y el modelo no tiene acceso a internet.
- No hay memoria persistente entre conversaciones por defecto.
- Riesgo de alucinación reducido por diseño, pero no eliminado; en tareas de codificación puede generar código incorrecto.
- La longitud de contexto no está documentada explícitamente; se hereda de Qwen2.5-0.5B-Instruct, pero no hay garantía de que el fine-tuning la preserve íntegramente.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smshahbaj/Rifa-Nano-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Sitio web del desarrollador: https://smshahbaj.com
- GitHub del desarrollador: https://github.com/smshahbaj
- Perfil de HuggingFace del desarrollador: https://huggingface.co/smshahbaj
