# Gabbio/driptips-concierge-qwen3-4b-Q4_K_M-GGUF

## Resumen

`Gabbio/driptips-concierge-qwen3-4b-Q4_K_M-GGUF` es la versión cuantizada en formato GGUF (Q4_K_M) del modelo `Gabbio/driptips-concierge-qwen3-4b`, un ajuste fino de tipo LoRA sobre la familia Qwen3 con 4.022.468.096 parámetros. Lo publica el usuario Gabbio y, según las etiquetas del repositorio, se enmarca en el hackathon Ostrovok 2026 con un enfoque claro hacia el dominio de viajes y conversación.

El modelo resuelve el caso de uso de un concierge de viajes en ruso: atención conversacional multi-turno con vocabulario turístico, de alojamiento y de reservas. Su interés práctico está en el formato: al estar cuantizado a Q4_K_M y ocupar 2,5 GB, se puede ejecutar con llama.cpp sobre hardware de consumo, algo relevante para prototipos, demos y despliegues en local.

Ahora bien, la información publicada es mínima: la model card es la plantilla automática de conversión a GGUF, no hay benchmarks ni detalles de entrenamiento, y el repositorio no tiene descargas ni likes en la fecha de la ficha. La licencia Apache 2.0 facilita el uso comercial, pero la ausencia de documentación obliga a validar el comportamiento antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (inferida de las etiquetas `qwen3` del repositorio; la model card no detalla la arquitectura) |
| Parámetros totales | 4.022.468.096 (~4,02 B, dato de safetensors del modelo base) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la model card solo muestra un ejemplo con `-c 2048`, que no constituye el límite oficial) |
| Tipos de cuantización | Q4_K_M (única variante publicada en este repositorio) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`driptips-concierge-qwen3-4b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una conversión a GGUF del checkpoint `Gabbio/driptips-concierge-qwen3-4b`, realizada con llama.cpp a través del espacio `GGUF-my-repo` de ggml.ai. El modelo de partida es, a su vez, un ajuste LoRA (etiqueta `lora`) sobre una base Qwen3 de aproximadamente 4.000 millones de parámetros, especializado en el dominio de viajes y en idioma ruso dentro del contexto del hackathon Ostrovok 2026.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, modos de razonamiento). Tampoco se especifica la configuración exacta del adaptador LoRA (rango, alpha, módulos objetivo). La cuantización Q4_K_M introduce una pérdida de precisión respecto a los pesos del adaptador original en safetensors, no cuantificada por el autor.

## Capacidades

- Generación de texto conversacional en ruso, con registro de asistente de viajes.
- Conversación multi-turno orientada a consultas de alojamiento, destinos e itinerarios (según el dominio declarado en las etiquetas `travel` y el contexto del hackathon).
- Respuestas de tipo concierge: recomendaciones, aclaraciones y seguimiento del hilo de la conversación.
- Ejecución local mediante llama.cpp, con CLI (`llama-cli`) y servidor HTTP (`llama-server`), según los ejemplos de la model card.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Tool calling / function calling: no documentado en la información disponible.
- Razonamiento multi-paso y modo "thinking": no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles.
- Multilingüismo: limitado al ruso según el campo `language`; no se declara soporte de otros idiomas.

## Casos de uso

- Concierge de reservas hoteleras en ruso: el modelo puede mantener una conversación multi-turno para recoger destino, fechas, número de huéspedes y preferencias, y devolver una recomendación en lenguaje natural. Es adecuado por su ajuste específico al dominio turístico.
- Atención al cliente de agencias de viaje rusoparlantes: respuestas a preguntas frecuentes sobre políticas de cancelación, servicios incluidos o transporte, con un tono consistente de asistente. El tamaño de 4 B permite desplegarlo en servidores modestos.
- Recomendación de destinos e itinerarios: generación de propuestas personalizadas a partir de las preferencias expresadas por el usuario en la conversación, útil como capa de pre-respuesta antes de la validación humana.
- Prototipado rápido y demos en local: con 2,5 GB de pesos, se puede cargar en un portátil con GPU de 6-8 GB o incluso en CPU mediante llama.cpp, lo que facilita pruebas de concepto sin infraestructura cloud.
- Despliegue en el borde o en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite procesar conversaciones con datos de viajeros sin enviarlos a una API externa.
- Filtrado y clasificación de consultas entrantes: uso generativo para reformular o etiquetar mensajes de usuarios antes de derivarlos al sistema de reservas o a un agente humano.
- Generación de descripciones y textos de soporte: redacción de fichas de alojamiento o respuestas tipo FAQ en ruso a partir de datos estructurados, siempre con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye instrucciones de conversión y ejecución con llama.cpp; no hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio de viajes, ni comparaciones con el adaptador original en safetensors.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 3-4 GB, calculados a partir de los 2,5 GB de pesos más la caché KV y el overhead del contexto (estimación, no dato publicado por el autor).
- GPU de consumo: cabe con holgura en tarjetas de 6 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 2060); también es viable en iGPU con memoria unificada suficiente.
- GPU de datacenter: no es necesario un acelerador de gama alta; A100, H100 o L40S quedan sobredimensionados para un modelo de 4 B cuantizado, salvo que se busque alto throughput por lotes.
- CPU: la inferencia solo en CPU es viable con llama.cpp, aunque con latencia mayor; no hay cifras de tokens por segundo publicadas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y runners compatibles con GGUF como Ollama o LM Studio (no verificados en la información disponible). El soporte en vLLM o TGI para este archivo GGUF concreto no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| `Gabbio/driptips-concierge-qwen3-4b-Q4_K_M-GGUF` (este) | ~4,02 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Sin benchmarks publicados |
| `Gabbio/driptips-concierge-qwen3-4b` (adaptador original) | ~4,02 B | No disponible | Apache 2.0 (según el repo derivado) | Safetensors / adapter | Sin benchmarks publicados |
| Qwen3-4B (referencia de la familia) | ~4 B (por los tags del repo) | No disponible | No disponible en la información proporcionada | No disponible | No disponible |

Otras alternativas de tamaño comparable que suelen considerarse en este segmento (Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) no aparecen evaluadas en la información disponible, por lo que no se ofrece comparación cuantitativa. La diferencia práctica de este modelo frente a una base genérica es su especialización declarada en viajes y en ruso, no un mejor rendimiento general demostrado.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente ruso; su comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos: no se documenta la composición del dataset de ajuste ni los procesos de alineación, por lo que no es posible evaluar sesgos de género, nacionalidad o culturales en recomendaciones de viaje.
- Alucinación: en un dominio como el de reservas, el riesgo de inventar precios, disponibilidad, políticas de cancelación o nombres de establecimientos es alto; cualquier salida debe validarse contra una fuente de datos real.
- Especialización estrecha: al ser un ajuste LoRA orientado a un hackathon, puede degradarse fuera del dominio turístico y mostrar sobreajuste a los formatos vistos durante el entrenamiento.
- Contexto: la longitud de contexto real no se publica y el ejemplo de la model card usa `-c 2048`; conviene verificar experimentalmente el límite antes de diseñar flujos multi-turno largos.
- Cuantización: Q4_K_M reduce precisión frente al adaptador original; no hay evaluación de la degradación resultante.
- Validación: repositorio con 0 descargas y 0 likes en la fecha de la ficha, sin informes de terceros ni evaluación independiente.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse los términos del modelo base Qwen3 y las condiciones de los datos de entrenamiento, no documentadas.
- Producción: la ausencia de benchmarks y de documentación de entrenamiento desaconseja su uso directo en sistemas críticos sin una batería de pruebas propia.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Gabbio/driptips-concierge-qwen3-4b-Q4_K_M-GGUF
- Modelo base (adaptador LoRA): https://huggingface.co/Gabbio/driptips-concierge-qwen3-4b
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
