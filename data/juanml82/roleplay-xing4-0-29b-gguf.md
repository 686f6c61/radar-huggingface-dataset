# juanml82/roleplay-Xing4.0-29B-gguf

## Resumen

roleplay-Xing4.0-29B-gguf es una conversión a formato GGUF del modelo roleplay-Xing4.0-29B, un ajuste fino de tipo roleplay y personajes publicado por el usuario hunter-P. La conversión la firma juanml82 y ofrece únicamente dos niveles de cuantización (Q8 y Q4) sobre el modelo base. El repositorio no incluye pipeline declarado ni documentación técnica propia más allá de la model card heredada del modelo original.

El modelo subyacente es Xing4.0-29B-A4B (antes conocido como serie TeleChat), desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. Se trata de una arquitectura Mixture of Experts (MoE) con 29.000 millones de parámetros totales y solo 4.000 millones activados por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. Soporta de forma nativa 256K tokens de contexto, extensible hasta 512K.

La relevancia de esta ficha es doble: por un lado, documenta un modelo especializado en diálogo de rol con memoria de contexto larga; por otro, es uno de los pocos modelos de esta escala entrenado íntegramente en hardware Ascend NPU con el framework MindSpore, lo que lo convierte en referencia para el ecosistema de cómputo alternativo a NVIDIA. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer, basada en Xing4.0-29B-A4B (serie TeleChat) |
| Parametros totales | 29B |
| Parametros activos | 4B por token |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | Q8 y Q4 (GGUF) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Xing4.0-29B-A4B emplea una arquitectura MoE con 29B parámetros totales y 4B activos por token, lo que permite un equilibrio entre calidad y eficiencia de inferencia. Soporta nativamente 256K tokens de contexto, ampliable a 512K. Fue entrenado íntegramente en clústeres de Ascend NPU con el framework MindSpore, siendo el primer modelo de esta escala entrenado por completo en esa plataforma según la documentación del autor.

El ajuste fino se realizó sobre tarea de roleplay y personajes mediante full-parameter fine-tuning. El conjunto de datos consta de 6.247 diálogos multi-turno de alta calidad, que cubren 1.346 personajes distintos, con una media de 6 turnos de interacción por diálogo. El entrenamiento se ejecutó sobre clúster Ascend NPU con MindSpore. La model card no detalla el volumen total de tokens de preentrenamiento ni si hubo fases de RLHF o DPO. Los parámetros de generación recomendados son temperature 1.1, top_p 0.95 y repetition_penalty 1.02.

## Capacidades

- Generación de texto conversacional orientada a roleplay y consistencia de personaje.
- Mantenimiento de persona en diálogos multi-turno prolongados gracias a la ventana de contexto de 256K tokens.
- Memoria de contexto largo para world-building y tramas extensas.
- Conversación multilingüe limitada a chino e inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Roleplay conversacional de personaje: el modelo mantiene una persona concreta a lo largo de sesiones largas; los 256K tokens de contexto permiten conservar el historial completo sin truncar y la ficha del personaje sin perder coherencia.
- Simulación de personajes para videojuegos o narrativa interactiva: con 1.346 personajes en el dataset de ajuste, el modelo puede adaptarse a arquetipos diversos; se integraría como backend de diálogo en motores narrativos.
- Chatbot de acompañamiento o entretenimiento: la temperatura recomendada de 1.1 favorece respuestas variadas y creativas, adecuadas para conversación abierta no factual.
- Construcción de mundos (world-building) asistida: la ventana de 256K permite cargar biblias de personajes, cronologías y trasfondos extensos y consultarlos durante la generación.
- Despliegue en hardware de gama alta con cuantización Q4: al ser MoE con 4B activos, la inferencia es más barata que un denso de 29B; el GGUF Q4 permite ejecución local en estaciones con suficiente memoria.
- Evaluación de técnicas de rol y alineación de persona: útil en investigación para estudiar consistencia de personaje y degradación en conversaciones largas.
- Prototipado de asistentes conversacionales en chino e inglés: la licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8: en torno a 30-32 GB solo para pesos, más overhead de contexto; requiere GPUs de 40-80 GB para contexto largo.
- VRAM estimada para Q4: en torno a 16-18 GB para pesos; viable en GPUs de 24 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, y para Q4 tarjetas consumer de 24 GB (RTX 3090, RTX 4090).
- Cabe en GPU consumer: sí, en Q4 dentro de 24 GB; Q8 queda fuera del rango consumer habitual.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requerirían los pesos originales en safetensors del modelo base.
- Latencia y throughput: no disponibles; al ser MoE con 4B activos se espera un throughput superior a un denso de 29B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| roleplay-Xing4.0-29B-gguf (este) | 29B | 4B (MoE) | 256K (512K ext.) | Apache 2.0 | GGUF Q8/Q4 |
| hunter-P/roleplay-Xing4.0-29B (base del fine-tune) | 29B | 4B (MoE) | 256K (512K ext.) | Apache 2.0 | safetensors |
| XingChen-AGI/Xing4.0-29B-A4B-GGUF | 31B (según ficha) | 4B (MoE) | 256K (512K ext.) | no disponible en la búsqueda | GGUF |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo especializado en roleplay: no está optimizado para tareas factuales, código o matemáticas, y su uso en esos dominios puede producir resultados pobres.
- Riesgo de alucinación elevado en contextos conversacionales creativos; la temperatura recomendada de 1.1 incrementa la variabilidad y reduce la precisión factual.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: la model card no documenta evaluaciones de sesgo; el dataset de ajuste (6.247 diálogos, 1.346 personajes) puede introducir sesgos de personaje y estilo no auditados.
- Solo se ofrecen dos cuantizaciones (Q8 y Q4); no hay Q5, Q6 ni variantes de menor tamaño para hardware muy limitado.
- El contexto de 256K en GGUF exige memoria KV considerable; en la práctica, la ventana efectiva en GPUs consumer será mucho menor.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías del autor sobre el comportamiento en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad.
- Conversión GGUF de terceros: no hay verificación independiente de que las cuantizaciones preserven fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/juanml82/roleplay-Xing4.0-29B-gguf
- Modelo base del fine-tune: https://huggingface.co/hunter-P/roleplay-Xing4.0-29B
- Árbol de archivos del modelo base: https://huggingface.co/hunter-P/roleplay-Xing4.0-29B/tree/main
- GGUF alternativo de Xing4.0-29B-A4B: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
