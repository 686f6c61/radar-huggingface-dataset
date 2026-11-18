# mradermacher/One-For-All-4B-i1-GGUF

## Resumen

One-For-All-4B es un modelo de lenguaje de la familia Qwen3.5, concretamente un fine-tuning mediante LoRA del modelo base Qwen3.5-4B, desarrollado por TendieLabs. Está orientado a la interpretación de personajes (roleplay) y a la generación de respuestas con una persona concreta, en este caso inspirada en el personaje de My Hero Academia que da nombre al modelo. La ficha que nos ocupa no es el modelo original, sino la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp y ecosistemas compatibles.

El modelo parte de una arquitectura transformer densa de la familia Qwen3.5, con aproximadamente 4.000 millones de parámetros según el nombre del modelo base, aunque los datos de safetensors del repositorio cuantizado reflejan un recuento de tensores del adaptador (1.797.272 parámetros), no del modelo completo. La longitud de contexto, los tipos de cuantización exactos y otros detalles técnicos no se detallan en la información disponible, más allá de la lista de cuantizaciones indicada en los metadatos de la model card.

Su relevancia actual radica en que permite desplegar localmente un modelo de rol con una personalidad específica en hardware de consumo, gracias a las cuantizaciones GGUF de baja precisión (desde IQ1_M hasta Q6_K). Es un modelo de nicho, pensado para aficionados al roleplay y a la creación de personajes, no para tareas de propósito general ni para producción empresarial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, según tags) |
| Parámetros totales | ~4B (según nombre del modelo base); el recuento de safetensors del adaptador es 1.797.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y de que se trata de un transformer denso de aproximadamente 4.000 millones de parámetros. El modelo se ha obtenido mediante un fine-tuning con LoRA sobre el modelo base TendieLabs/One-For-All-4B, que a su vez deriva de Qwen3.5-4B. Los tags indican que el ajuste está orientado a persona y roleplay, con temática de My Hero Academia.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado es fundamentalmente una ficha de cuantización de mradermacher, con instrucciones de uso de GGUF y enlaces a las cuantizaciones estáticas, sin detalles sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de texto en inglés con una persona y estilo de personaje predefinidos (roleplay).
- Interpretación de personajes con temática de My Hero Academia, según los tags del modelo.
- Conversación multi-turno orientada a roleplay y ficción.
- Capacidad de visión: la model card indica explícitamente que es un modelo de visión, con ficheros mmproj (si existen) en el repositorio estático.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener conversaciones multi-turno adoptando la persona del personaje, desplegado con llama.cpp u Ollama en hardware de consumo gracias a las cuantizaciones de baja precisión.
- Creación de ficción interactiva: útil para generar diálogos y narrativa con un personaje concreto en herramientas de escritura asistida, siempre que se trabaje en inglés.
- Prototipado de chatbots de personaje: permite validar rápidamente la experiencia de un bot con personalidad definida antes de invertir en un modelo mayor o en un fine-tuning propio.
- Experimentación con fine-tunings LoRA: sirve como ejemplo práctico de cómo un adaptador LoRA sobre Qwen3.5-4B se distribuye y cuantiza para inferencia local.
- Inferencia en entornos con recursos limitados: las cuantizaciones IQ1/IQ2 permiten ejecutar el modelo en equipos modestos, útil para demos y pruebas offline.
- Investigación sobre sesgos y seguridad en modelos de rol: permite estudiar cómo un modelo de personaje responde a entradas adversarias y qué salvaguardas conserva respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~4B en GGUF, las cuantizaciones Q4_K_M suelen ocupar del orden de 2,5-3 GB y las Q8 en torno a 4-5 GB, aunque estas cifras son estimaciones generales y no datos publicados para este modelo.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No hay datos oficiales; por tamaño de modelo, es plausible en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio, entre otros); la model card remite a las instrucciones de uso de GGUF de TheBloke.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| One-For-All-4B (i1-GGUF) | ~4B | no disponible | apache-2.0 | GGUF | Fine-tuning LoRA de rol sobre Qwen3.5-4B |
| Qwen3.5-4B (base) | ~4B | no disponible | apache-2.0 | safetensors, GGUF | Modelo base generalista |
| Otros fine-tunings de rol sobre modelos de ~4B | ~4B | no disponible | variable | GGUF | No se dispone de datos concretos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho orientado a roleplay: no está pensado para tareas de propósito general, código, matemáticas o razonamiento complejo.
- Solo inglés declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo de ~4B, puede inventar hechos, especialmente fuera del dominio del personaje.
- Sesgos: no se documentan evaluaciones de sesgo; un fine-tuning de personaje puede reforzar estereotipos presentes en los datos de entrenamiento.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar conversaciones largas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento del fine-tuning.
- El repositorio cuantizado tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- La model card del repositorio cuantizado no documenta el proceso de entrenamiento del modelo original ni métricas de calidad.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/One-For-All-4B-i1-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/One-For-All-4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#One-For-All-4B-i1-GGUF
- Licencia del modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Instrucciones de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
