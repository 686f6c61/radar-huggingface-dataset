# mogaqu1/sigmoida-robloxer-v0p1-4b-prev

## Resumen

`sigmoida-robloxer-v0p1-4b-prev` es un ajuste fino (LoRA + SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario `mogaqu1` en HuggingFace. El modelo está especializado en diálogos de juego en ruso, con la etiqueta explícita `roblox`, y se distribuye únicamente en formato GGUF con tres niveles de cuantización (Q4_K_M, Q5_K_M y Q8_0). Su propósito es actuar como motor conversacional para NPCs, asistentes de comunidad o prototipos de narrativa interactiva en ese dominio acotado.

Se trata de un modelo pequeño (4.205.751.296 parámetros, es decir, unos 4,2 mil millones) pensado para inferencia local: la cuantización Q4_K_M ocupa 2,71 GB en disco, lo que permite ejecutarlo en GPUs de consumo e incluso en CPU. El formato de diálogo es ChatML con token de parada `<|im_end|>`, y el autor recomienda fijar siempre un system prompt.

La relevancia de esta ficha es doble: por un lado, documenta una variante de nicho (ruso + gaming) poco cubierta por los modelos generalistas; por otro, advierte de que se trata de una versión de previsualización (`prev`, `v0p1`) sin licencia declarada, sin benchmarks publicados y sin descargas registradas en el momento de la consulta, lo que limita seriamente su uso en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen/Qwen3.5-4B; no detallada en la model card) |
| Parámetros totales | 4.205.751.296 (~4,21 B), según metadatos de safetensors de HuggingFace |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (2,71 GB), Q5_K_M (3,07 GB) y Q8_0 (4,48 GB) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (no se publican safetensors ni otros formatos en el repositorio) |
| Tamaño del repositorio | 10,3 GB |
| Formato de plantilla de diálogo | ChatML, token de parada `<|im_end|>` |
| Fecha de creación | 2026-10-28 (actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card es extremadamente escueta. Lo único que se declara es que se trata de una versión de Qwen/Qwen3.5-4B "дообученная (LoRA, SFT) на русскоязычных игровых диалогах", es decir, afinada mediante LoRA y supervisión directa (SFT) sobre diálogos de juego en ruso. No se especifica el número de tokens de entrenamiento, la composición del dataset, el rango de la adaptación LoRA, la tasa de aprendizaje, el número de épocas ni si se aplicaron etapas posteriores de alineación (RLHF, DPO o RL). Tampoco se documenta ninguna innovación técnica adicional: no hay mención a decodificación especulativa, atención lineal, MoE ni arquitecturas híbridas.

La arquitectura subyacente, por tanto, es la del modelo base Qwen/Qwen3.5-4B, que la ficha del autor no reproduce ni detalla. Cualquier afirmación sobre atención, ventana de contexto nativa, tokenizador o composición multilingüe del preentrenamiento sería una inferencia no respaldada por la información disponible. El único detalle operativo relevante que sí aporta el autor es la plantilla: ChatML con `<|im_end|>` como token de parada, y la recomendación de usar siempre system prompt, lo que sugiere que el ajuste se realizó con ese campo poblado y que su ausencia puede degradar el comportamiento.

## Capacidades

- Generación de texto conversacional en ruso, orientada a diálogos multi-turno de temática de juego.
- Ajuste específico al registro y vocabulario de comunidades de Roblox (etiqueta `roblox` en los metadatos).
- Soporte de system prompt para fijar rol o persona del personaje, recomendado explícitamente por el autor.
- Formato de plantilla ChatML, compatible con las implementaciones estándar de llama.cpp y derivados.
- Distribución en GGUF cuantizado, lo que habilita ejecución en CPU y GPU de gama baja.
- Etiqueta `endpoints_compatible` en HuggingFace, que sugiere compatibilidad con la API de mensajes de Inference Endpoints (no verificado en la información disponible).
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión, audio o modo "thinking": no documentadas.
- Capacidades matemáticas o de generación de código: no documentadas y presumiblemente degradadas respecto al modelo base tras un SFT estrecho en dominio.

## Casos de uso

- **NPCs conversacionales en Roblox**: el modelo puede gestionar intercambios multi-turno con jugadores manteniendo una persona fijada por system prompt; su tamaño (2,71 GB en Q4_K_M) permite servirlo en una instancia modesta junto al servidor de juego.
- **Prototipado rápido de narrativa interactiva**: para equipos de diseño que necesitan iterar guiones y respuestas de personajes en ruso sin depender de una API externa, el modelo se puede cargar en local con Ollama y probar variaciones de prompt en segundos.
- **Asistencia y moderación en comunidades de habla rusa**: puede redactar respuestas de soporte o borradores de mensajes para canales de Discord/Telegram de servidores de juego, siempre con revisión humana dado el riesgo de alucinación.
- **Generación de diálogo sintético para aumentar datasets**: útil como generador de conversaciones etiquetadas en el dominio gaming en ruso, que luego se filtran y se usan para entrenar clasificadores o modelos mayores.
- **Evaluación de pipelines de cuantización**: al publicarse tres niveles (Q4_K_M, Q5_K_M, Q8_0) del mismo ajuste, sirve como banco de pruebas para medir la degradación de calidad conversacional entre cuantizaciones en un modelo de ~4 B.
- **Sistemas embebidos o sin GPU**: la versión Q4_K_M es viable en CPU con llama.cpp (AVX2), lo que permite desplegar un chatbot de personaje en un mini-PC o en el propio cliente, sin coste de inferencia en la nube.
- **Base para un segundo ajuste fino**: al ser un LoRA sobre Qwen3.5-4B, puede actuar como punto de partida para especializar aún más el modelo en otro subdominio del gaming en ruso, aunque la ausencia de licencia es un obstáculo legal a resolver antes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación propia del ajuste, y tampoco se aportan comparaciones con el modelo base que permitan estimar la degradación o mejora introducida por el SFT.

## Requisitos de hardware

- **VRAM estimada para inferencia** (incluyendo caché KV para contextos moderados; cifras orientativas, no publicadas por el autor):
  - Q4_K_M (2,71 GB de pesos): en torno a 3,5–4,5 GB de VRAM.
  - Q5_K_M (3,07 GB): en torno a 4–5 GB.
  - Q8_0 (4,48 GB): en torno a 6 GB.
  - FP16 teórico (no distribuido): ~8,4 GB solo de pesos.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q8_0 con contexto amplio; A100/H100 no son necesarias para este tamaño.
- **¿Cabe en GPU de consumo?** Sí. Q4_K_M encaja en tarjetas de 6–8 GB (RTX 3050, RTX 2060, GTX 1660 Super con holgura justa) y Q8_0 en 8 GB o más.
- **CPU**: viable con llama.cpp en procesadores con AVX2; Q4_K_M es la opción razonable para uso interactivo en CPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM ofrece soporte GGUF con limitaciones; TGI no soporta GGUF de forma nativa, por lo que la etiqueta `endpoints_compatible` debería verificarse antes de asumir un despliegue directo en Inference Endpoints.
- **Latencia y throughput**: no disponibles. Al no publicarse mediciones ni el contexto nativo, no es posible estimar tokens/s sin una prueba propia en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sigmoida-robloxer-v0p1-4b-prev | ~4,21 B | No disponible | No disponible | GGUF Q4_K_M, Q5_K_M, Q8_0 | Ajuste LoRA/SFT en ruso para diálogos de juego; sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | No disponible | Pesos originales (según el autor) | Modelo de partida; capacidades generalistas, no especializado en ruso gaming |
| Qwen2.5-3B-Instruct | ~3,09 B | 32 768 tokens | Apache 2.0 | Safetensors, GGUF (comunidad) | Generalista multilingüe con licencia permisiva; referencia habitual en el rango 3–4 B |
| Llama-3.2-3B-Instruct | ~3,21 B | 128 000 tokens | Llama 3.2 Community License | Safetensors, GGUF (comunidad) | Contexto largo y buen soporte de cuantizaciones; licencia con restricciones de uso |
| Gemma-3-4B-IT | ~4,3 B | 128 000 tokens | Gemma Terms of Use | Safetensors, GGUF (comunidad) | Multilingüe, contexto amplio; licencia con cláusulas de uso aceptable |

La comparación es estructural: el modelo evaluado no publica métricas, contexto ni licencia, por lo que no puede situarse empíricamente frente a estas alternativas. Su ventaja diferencial es la especialización en un dominio y un idioma concretos; su desventaja, la falta de documentación y de garantías legales.

## Limitaciones y advertencias

- **Licencia no especificada**: no se declara licencia en los metadatos ni en la model card. Sin una licencia explícita, no hay autorización clara para uso comercial; debe contactarse con el autor o asumir el marco del modelo base antes de cualquier despliegue productivo.
- **Riesgo de alucinación**: es un modelo de ~4 B afinado con SFT; no se documenta ninguna etapa de RLHF/DPO que mitigue respuestas inventadas, y el dominio de juego invita a generar contenido plausible pero falso.
- **Monolingüe en la práctica**: solo se declara ruso. El comportamiento en castellano, inglés u otros idiomas no está evaluado y probablemente sea deficiente tras un SFT estrecho.
- **Dominio muy acotado**: el entrenamiento se centra en diálogos de Roblox; fuera de ese registro puede producir respuestas fuera de tono o poco útiles.
- **Sesgos no evaluados**: no hay ninguna auditoría de sesgos, toxicidad ni seguridad. En un contexto de comunidades de juego, con jerga y dinámicas propias, el riesgo de respuestas inapropiadas es real y requiere filtros externos.
- **Ausencia total de benchmarks**: no hay forma de comparar su calidad con el modelo base ni con alternativas sin ejecutar una evaluación propia.
- **Versión de previsualización**: los identificadores `v0p1` y `prev` indican un estado temprano; el repositorio se creó y actualizó el mismo día, sin historial de mantenimiento.
- **Dependencia de system prompt**: el autor advierte de que conviene fijarlo siempre; su ausencia puede alterar el comportamiento de forma imprevisible.
- **Contexto desconocido**: al no publicarse la ventana nativa, no se puede dimensionar la caché KV ni garantizar conversaciones largas sin truncamiento.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/mogaqu1/sigmoida-robloxer-v0p1-4b-prev
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
