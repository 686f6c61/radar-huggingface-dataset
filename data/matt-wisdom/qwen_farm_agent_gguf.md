# matt-wisdom/qwen_farm_agent_gguf

## Resumen

FarmHand AI es una adaptación del modelo Qwen2.5-3B-Instruct, cuantizado a formato GGUF con cuantización Q4_K_M mediante llama.cpp, y publicado por el desarrollador matt-wisdom. El modelo está diseñado para el Africa Deep Tech Challenge 2026 (ADTC 2026), en la categoría de portátiles con recursos limitados, y se centra en asesoramiento agrícola y gestión ganadera para pequeños productores de África Occidental. Soporta tres idiomas: inglés, hausa y pidgin nigeriano, y está orientado a tareas como triaje veterinario, formulación de raciones alimenticias y contabilidad de rebaños.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de 3.090 millones de parámetros con una ventana de contexto de 4096 tokens. La versión cuantizada ocupa aproximadamente 1,93 GB y está pensada para ejecutarse en CPU sin GPU dedicada, con un consumo de memoria entre 2,3 y 3,3 GB. Su relevancia radica en permitir asistencia agrícola offline en entornos con hardware muy limitado, algo crítico en zonas rurales sin conectividad fiable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.090.000.000 (modelo base Qwen2.5-3B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en), hausa (ha), pidgin nigeriano (pcm) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo: qwen2.5-3b-instruct.Q4_K_M.gguf, ~1,93 GB) |

Nota: el metadato de HuggingFace indica 1.543.714.304 parámetros, pero el modelo base Qwen2.5-3B tiene 3,09B; el dato de HF parece un error o se refiere a otra métrica. Se ha tomado el valor oficial del modelo base.

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con 3.090 millones de parámetros, atención de múltiples cabezas y capas de normalización RMSNorm. No se ha realizado ningún fine-tuning adicional documentado; la publicación consiste únicamente en la cuantización del modelo base a 4 bits mediante llama.cpp (método Q4_K_M). El autor no especifica el dataset de entrenamiento del modelo base ni procesos de alineación adicionales como RLHF o DPO, ya que se heredan del modelo original de Qwen.

La cuantización Q4_K_M reduce el tamaño del modelo de aproximadamente 6 GB (en fp16) a 1,93 GB, manteniendo un equilibrio entre precisión y eficiencia. El modelo conserva la arquitectura original, incluyendo el formato de chat con tokens especiales `<|im_start|>` y `<|im_end|>`, y el sistema de prompts de Qwen2.5-Instruct.

## Capacidades

- Generación de texto conversacional en inglés, hausa y pidgin nigeriano, con especial atención a vocabulario agrícola y veterinario.
- Triaje veterinario de síntomas: identificación de enfermedades comunes en ganado (peste de pequeños rumiantes, peste porcina africana, enfermedad de Newcastle, coccidiosis, enterotoxemia) y recomendación de medidas de bioseguridad.
- Formulación de raciones alimenticias con restricciones: cálculo de dietas para aves y ganado usando ingredientes locales nigerianos (maíz, harina de palmiste, harina de soja, salvado de trigo, harina de huesos, salvado de arroz, harina de pescado), con requisitos mínimos de proteína cruda.
- Parseo de lenguaje natural a esquemas estructurados: conversión de registros de eventos (nacimientos, muertes, ventas, compras de pienso) en llamadas a esquemas SQLite para contabilidad de rebaño.
- Ejecución en CPU pura sin GPU, con bajo consumo de memoria (2,3-3,3 GB RSS) y rendimiento de 16,8 tokens/segundo en hardware de referencia.
- Soporte de tool calling implícito a través del formato de chat de Qwen2.5, aunque no se documenta explícitamente en la model card.

## Casos de uso

- Asistente veterinario de campo: un ganadero describe síntomas en pidgin nigeriano ("4 goats died sudden-sudden and foam dey commot their mouth") y el modelo sugiere posibles causas, medidas de cuarentena y cuidados de apoyo. Adecuado por su entrenamiento en vocabulario veterinario y su capacidad de ejecución offline.
- Formulación de piensos en granjas pequeñas: el modelo calcula raciones equilibradas con ingredientes locales, por ejemplo, un pienso de inicio para pollos de engorde con mínimo 22% de proteína cruda. Su conocimiento de 22 alimentos nigerianos lo hace útil sin conexión a internet.
- Registro contable de rebaño: el modelo convierte notas en lenguaje natural ("vendí 3 cabras a 5000 nairas cada una") en entradas estructuradas para una base de datos SQLite, facilitando la gestión financiera de pequeños productores.
- Comunicación multilingüe en zonas rurales: permite a agricultores que hablan hausa o pidgin interactuar con un asistente técnico sin necesidad de traductores, gracias a su soporte nativo de estos idiomas.
- Educación y extensión agrícola: organizaciones no gubernamentales pueden desplegar el modelo en portátiles de bajo coste para formar a agricultores en prácticas de bioseguridad, nutrición animal y manejo de enfermedades.
- Despliegue en misiones de campo sin conectividad: al funcionar en CPU con solo 2,3-3,3 GB de RAM, el modelo puede instalarse en portátiles antiguos o de gama baja para uso en zonas remotas donde no hay acceso a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de rendimiento en hardware de referencia (Intel Core i5/i7, 2 threads CPU, sin GPU):

| Metrica | Valor medido | Limite de referencia |
|---|---|---|
| Pico de memoria (RSS) | 2,3 - 3,3 GB | 7,0 GB (maximo) |
| Throughput (CPU) | 16,8 tokens/seg | 15,0 tokens/seg |
| Tiempo hasta el primer token | ~180 ms | 5.000 ms |
| Temperatura del nucleo | < 65 °C | 85 °C (limite termico) |

Estas cifras indican que el modelo cumple con creces los requisitos del desafío ADTC 2026 para portátiles con 8 GB de RAM y sin GPU.

## Requisitos de hardware

- VRAM estimada: 0 GB (ejecución en CPU pura, sin GPU).
- RAM total recomendada: 8 GB (el modelo consume entre 2,3 y 3,3 GB de memoria RSS).
- CPU: cualquier procesador x86_64 moderno; se recomiendan al menos 2 threads para alcanzar 16,8 tokens/segundo.
- GPU: no necesaria; si se dispone de una GPU con al menos 2 GB de VRAM, se puede usar con `n_gpu_layers` parcial, pero no es el escenario previsto.
- Opciones de despliegue: llama.cpp (CLI), llama-cpp-python, o cualquier framework compatible con GGUF (Ollama, LM Studio, etc.).
- Latencia: tiempo hasta el primer token de ~180 ms en CPU; throughput de 16,8 tokens/segundo con 2 threads.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|---|
| FarmHand AI (este) | 3,09B | 4096 | Q4_K_M GGUF | en, ha, pcm | Apache 2.0 | Agricultura y veterinaria |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32768 | fp16 / varios | 29+ idiomas | Apache 2.0 | Chat general, codigo, matematicas |
| Llama 3.2 3B Instruct | 3,21B | 8192 | GGUF disponible | en, es, fr, de, hi, pt, zh | Llama 3.2 | Chat general, multilingue |
| Phi-3-mini-4k-instruct | 3,82B | 4096 | GGUF disponible | en, es, fr, de, it, pt | MIT | Razonamiento, codigo |

FarmHand AI se diferencia por su especialización en agricultura y su soporte de hausa y pidgin nigeriano, ausentes en los otros modelos. Su contexto de 4096 tokens es inferior al de Qwen2.5-3B-Instruct original (32768), pero suficiente para las tareas previstas. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No es un sustituto de un veterinario licenciado: el modelo proporciona primeros auxilios, triaje de síntomas y listas de bioseguridad, pero no prescribe intervenciones quirúrgicas ni medicamentos controlados.
- No debe usarse para diagnóstico clínico humano: está ajustado exclusivamente para agricultura y ganado.
- Contexto limitado a 4096 tokens: conversaciones muy largas o documentos extensos pueden exceder la ventana y perder información.
- Cobertura idiomática restringida: solo inglés, hausa y pidgin nigeriano; no soporta otros idiomas africanos ni lenguas europeas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta sobre enfermedades o dosis; debe usarse con supervisión humana en contextos críticos.
- Sin fine-tuning documentado: la model card no especifica si hubo entrenamiento adicional sobre el modelo base; la especialización puede ser limitada y depender del conocimiento general de Qwen2.5.
- Rendimiento en CPU: aunque cumple los requisitos del desafío, 16,8 tokens/segundo es lento para aplicaciones interactivas exigentes; no apto para generación de largos documentos en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matt-wisdom/qwen_farm_agent_gguf
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Africa Deep Tech Challenge 2026: https://adtc.africa
- Repositorio Qwen-Agent (framework de agentes): https://github.com/QwenLM/Qwen-Agent
- Documentación de Qwen-Agent: https://qwenlm.github.io/Qwen-Agent/
- Repositorio Qwen3 (referencia de cuantización GGUF): https://github.com/QwenLM/Qwen3
