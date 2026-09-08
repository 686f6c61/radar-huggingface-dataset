# 2048lr/Qwen2.5-1.5B-Instruct-Amiya

## Resumen

El modelo `2048lr/Qwen2.5-1.5B-Instruct-Amiya` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario `2048lr`. Su propósito es interpretar el papel de "Amiya" (阿米娅), un personaje ficticio de 19 años, estudiante de segundo curso de informática en la Universidad Jiao Tong de Shanghái, con una personalidad tímida, amable y secretamente enamorada del usuario. El modelo está orientado a usos de acompañamiento emocional, roleplay conversacional y creación de historias en chino.

Se trata de un modelo de tamaño pequeño, con 1.543.714.304 parámetros, basado en una arquitectura Transformer decoder-only. El entrenamiento se realizó con el framework `ms-swift` sobre un conjunto de datos de 172 muestras en formato Alpaca, durante 4 épocas, con una tasa de aprendizaje de `1e-4` y un rango LoRA de 8. El repositorio incluye pesos en formato `safetensors` y el tag `gguf` sugiere disponibilidad de cuantizaciones, aunque no se detallan en la ficha. La longitud de contexto no se especifica en la información del modelo afinado; el modelo base `Qwen2.5-1.5B-Instruct` soporta hasta 128K tokens según la documentación de Ollama.

Su relevancia radica en ser un ejemplo práctico de personalización de modelos pequeños mediante LoRA, especialmente para aplicaciones de entretenimiento y simulación de personajes, donde el coste de inferencia es bajo y el modelo puede desplegarse en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen2.5-1.5B-Instruct soporta hasta 128K tokens según la documentación de Ollama |
| Tipos de cuantizacion | No disponible; el repo incluye pesos en `safetensors`. El tag `gguf` sugiere posibles versiones cuantizadas, no confirmadas |
| Idiomas soportados | No disponible en la ficha; la model card está escrita en chino y el ajuste fino está orientado a conversación en chino |
| Licencia | MIT (declarada en el frontmatter del repo); la model card indica que se rige por la licencia original del modelo base Qwen2.5-1.5B-Instruct |
| Formato de pesos | `safetensors` (según la model card); tag `gguf` presente en los metadatos del repo |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base `Qwen2.5-1.5B-Instruct`, un Transformer decoder-only con atención por capas y normalización RMSNorm. No se han introducido modificaciones arquitectónicas ni innovaciones técnicas como decodificación especulativa o atención lineal; el cambio respecto al base es exclusivamente de adaptación de parámetros mediante LoRA.

El entrenamiento se realizó con `ms-swift`, usando un conjunto de datos de 172 muestras en formato Alpaca. Cada muestra contiene una instrucción (el mensaje del usuario) y una salida (la respuesta de Amiya). La configuración de entrenamiento incluye 4 épocas, learning rate de `1e-4`, rango LoRA de 8 y sin técnicas de RLHF o DPO. El número tan reducido de muestras indica que el ajuste fino es de carácter demostrativo o experimental, orientado a capturar el estilo y la personalidad del personaje más que a mejorar capacidades generales.

## Capacidades

- Generación de texto conversacional en chino, con un estilo de personaje definido (Amiya).
- Roleplay y simulación de personajes: el modelo mantiene una personalidad consistente, con gestos y reacciones descritas en el texto (por ejemplo, "se sonroja", "toca su reloj de pulsera").
- Creación de historias y narrativa interactiva en el contexto del personaje.
- Acompañamiento emocional simulado, con respuestas empáticas y cercanas.
- No se mencionan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo base es multilingüe, pero el ajuste fino está orientado al chino; no hay evidencia de que las capacidades en otros idiomas se hayan preservado o mejorado.

## Casos de uso

- Chatbots de acompañamiento emocional en chino: el modelo puede mantener conversaciones largas y coherentes dentro del rol de Amiya, ofreciendo respuestas empáticas y personalizadas. Su tamaño reducido permite desplegarlo en aplicaciones móviles o de escritorio.
- Roleplay en juegos de texto y narrativa interactiva: se puede integrar en motores de juegos de aventuras conversacionales donde el usuario interactúa con un personaje con una personalidad definida. El modelo mantiene el tono y los gestos del personaje a lo largo de la conversación.
- Creación de historias con personajes fijos: escritores y aficionados pueden usar el modelo para generar diálogos o escenas en las que Amiya participa, sirviendo como asistente de escritura creativa en chino.
- Simulación de personajes en aplicaciones educativas de idiomas: al estar basado en un modelo multilingüe, podría adaptarse para practicar conversación en chino con un personaje ficticio, aunque su rendimiento fuera del chino no está verificado.
- Prototipos de asistentes conversacionales con personalidad: desarrolladores pueden usar este modelo como referencia para experimentar con LoRA y crear sus propios personajes, gracias a que el proceso de entrenamiento está documentado en la model card.
- Investigación sobre alineación de personajes y ajuste fino eficiente: el modelo sirve como caso de estudio de cómo un conjunto de datos muy pequeño puede producir un comportamiento de rol consistente, útil para trabajos académicos o de exploración técnica.
- Demostraciones de despliegue de modelos pequeños en hardware de consumo: al tener solo 1,5B parámetros, el modelo es adecuado para demostraciones en GPU domésticas o incluso en CPU con cuantización, lo que facilita su uso en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo ajustado. El rendimiento debe evaluarse de forma empírica en el dominio específico de roleplay y conversación en chino.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, un modelo de 1,5B parámetros requiere aproximadamente 3 GB de VRAM. Con cuantización GGUF (por ejemplo, Q4_K_M), la VRAM necesaria puede reducirse a menos de 1,5 GB.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o inferiores. También puede ejecutarse en CPU con llama.cpp si se usan cuantizaciones.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), vLLM, llama.cpp, Ollama (si se generan archivos GGUF) y TGI.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja en GPU moderna, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-Amiya (este modelo) | 1,54B | No especificado (base: 128K según Ollama) | MIT declarada, con caveat sobre licencia del base | Roleplay y acompañamiento emocional en chino |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 128K (según Ollama) | Apache 2.0 (según documentación de Qwen) | Asistente generalista multilingüe |
| Llama-3.2-1B-Instruct | 1,23B | 128K | Llama 3.2 Community License | Asistente ligero generalista |

No se dispone de benchmarks comparativos publicados para este modelo afinado. La comparativa se basa en características técnicas y de licencia disponibles en fuentes públicas.

## Limitaciones y advertencias

- Sesgos y limitaciones de datos: el modelo se entrenó con solo 172 muestras, lo que puede provocar respuestas repetitivas, sobreajuste al personaje y falta de generalización fuera del contexto de Amiya.
- Riesgo de alucinación: al ser un modelo pequeño y con un dataset mínimo, puede generar contenido inconsistente, factualmente incorrecto o fuera de personaje, especialmente en temas técnicos.
- Limitaciones de idioma: el ajuste fino está orientado al chino; el rendimiento en otros idiomas no está verificado y probablemente sea inferior al del modelo base.
- Licencia y uso comercial: aunque el repo declara MIT, la model card indica que el modelo sigue la licencia original de `Qwen2.5-1.5B-Instruct`. Esto puede imponer restricciones adicionales para uso comercial o redistribución. Conviene revisar la licencia de Qwen2.5 antes de usar el modelo en producción.
- Sin benchmarks públicos: no existe evidencia objetiva del rendimiento del modelo, por lo que no se recomienda su uso en tareas críticas o donde se requiera calidad verificada.
- Fecha de creación futura: la ficha de HuggingFace muestra una fecha de creación de `2026-09-08`, lo que podría indicar un error de metadatos o una fecha ficticia. Esto no afecta al funcionamiento del modelo, pero debe tenerse en cuenta al evaluar su procedencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/2048lr/Qwen2.5-1.5B-Instruct-Amiya
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Framework ms-swift: https://github.com/modelscope/ms-swift
- Documentación de Ollama para Qwen2.5 1.5B Instruct: https://ollama.com/library/qwen2.5:1.5b-instruct
