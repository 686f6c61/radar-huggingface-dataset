# mradermacher/dolphin-email-8b-GGUF

## Resumen

El modelo `dolphin-email-8b` es un fine-tune de un modelo base de 8 mil millones de parámetros con licencia Llama 3.1, especializado en la redacción de correos electrónicos. La versión documentada, `dolphin-email-8b-GGUF`, es una cuantización en formato GGUF creada por `mradermacher` a partir del modelo original `h0ney-badger/dolphin-email-8b`. Esta transformación permite ejecutar el modelo en hardware más modesto, con opciones de cuantización que van desde Q2_K (3.3 GB) hasta f16 (16.2 GB). El modelo se orienta a tareas de escritura de emails en inglés y se presenta como una herramienta conversacional compatible con endpoints. Su relevancia radica en la posibilidad de desplegar un asistente de redacción de correos en local, sin depender de servicios en la nube, aprovechando la eficiencia de las cuantizaciones GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.1, heredada del modelo base) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (el modelo base utiliza safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un transformer decoder-only de 8 mil millones de parámetros, probablemente basado en Llama 3.1, según indica la licencia `llama3.1`. El modelo fue generado a partir de `h0ney-badger/dolphin-email-8b`, y la información disponible en la model card no detalla la composición del dataset, el número de tokens ni el proceso de alineación (RLHF/DPO). Los metadatos hacen referencia a `qlora`, `distillation`, `unsloth` y `writing`, lo que sugiere que el fine-tune se realizó mediante QLoRA y técnicas de destilación sobre un modelo base, con el objetivo de mejorar la capacidad de redacción de correos electrónicos. La cuantización GGUF no altera la arquitectura, solo convierte los pesos a un formato comprimido para facilitar la inferencia en dispositivos con menos memoria.

## Capacidades

- Generación de texto en inglés, con especialización en redacción de correos electrónicos (tags `email`, `writing`).
- Indicado para tareas de escritura profesional, como borradores, respuestas y reescritura de emails.
- Modelo conversacional (`conversational`), apto para mantener diálogos sencillos.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: únicamente inglés (`language: en`).
- No se han identificado capacidades especiales adicionales (visión, audio, thinking mode) en la documentación disponible.

## Casos de uso

- Redacción de correos profesionales: el modelo puede generar borradores de emails en inglés con tono formal, semiformals o informal, adaptándose al contexto y al destinatario. La cuantización Q4_K_S (4.8 GB) permite ejecutarlo en una GPU de consumo con 8 GB de VRAM.
- Respuestas automáticas en sistemas de atención al cliente: integrar el modelo en un pipeline de gestión de tickets para redactar respuestas a consultas frecuentes, reduciendo el tiempo de respuesta del equipo de soporte.
- Asistente de escritura en clientes de correo electrónico: implementar como herramienta de autocompletado o generación de respuestas sugeridas dentro de un cliente de correo, aprovechando su naturaleza conversacional.
- Automatización de campañas de email marketing: generar contenidos emailing personalizados, líneas de asunto y llamadas a la acción, manteniendo un estilo coherente con la marca.
- Entrenamiento de modelos internos de escritura técnica: usar el modelo como punto de partida para destilar o ajustar respuestas estándar en inglés, gracias a la flexibilidad de la licencia Llama 3.1 (con las restricciones correspondientes).
- Despliegue en entornos con requisitos de privacidad: al ser una cuantización ejecutable en local mediante llama.cpp u Ollama, permite redactar correos en inglés sin enviar datos sensibles a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~3.3 GB para los pesos, más la memoria de KV cache según el contexto.
  - Q4_K_S: ~4.8 GB para los pesos. Recomendable para GPUs con 6-8 GB de VRAM.
  - Q6_K: ~6.7 GB para los pesos.
  - Q8_0: ~8.6 GB para los pesos.
  - f16: ~16.2 GB para los pesos. Requiere una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o superior para Q6_K y Q8_0; RTX 4090 o A100 para f16. Para Q4_K_S, una GPU de 8 GB (como RTX 4060 Ti 8 GB) es suficiente en la mayoría de los casos.
- Sí cabe en GPUs de consumo: las cuantizaciones Q2_K, Q4_K_S y Q6_K son viables en hardware de gama media. La Q8_0 es recomendable para tarjetas de 12 GB o más.
- Opciones de despliegue: llama.cpp (ideal para GGUF), Ollama, LM Studio, y en menor medida vLLM y TGI si se convierten los pesos. El modelo es compatible con endpoints, lo que sugiere que puede servirse mediante contenedores como vLLM o TGI con adaptaciones.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se han encontrado modelos comparables directos en la información disponible, ya que se trata de un fine-tune específico para redacción de emails. Como referencia, se puede comparar con el modelo base original `h0ney-badger/dolphin-email-8b` (en formato safetensors) y con la cuantización GGUF de Llama 3.1 8B, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La diferencia principal reside en la especialización funcional y en la disponibilidad de cuantizaciones.

## Limitaciones y advertencias

- Idiomas: el modelo está limitado al inglés, por lo que no responde correctamente en castellano u otros idiomas.
- Sesgo: hereda los sesgos potenciales del modelo base Llama 3.1; no se ha documentado ninguna evaluación específica de sesgos para este fine-tune.
- Alucinaciones: al ser un modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en contextos donde no dispone de información factual.
- Licencia: la licencia `llama3.1` impone condiciones de uso, incluyendo la restricción de no utilizar el modelo para competir con Meta o sus productos. Requiere aceptar los términos de la licencia antes de su uso comercial.
- Cuantización: las cuantizaciones más agresivas (como Q2_K) pueden degradar notablemente la calidad de la salida. Se recomienda usar Q4_K_S o superior para aplicaciones sensibles.
- Contexto: la longitud exacta de la ventana de contexto no se indica en la información disponible; puede variar según el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/dolphin-email-8b-GGUF
- Modelo base (h0ney-badger/dolphin-email-8b): https://huggingface.co/h0ney-badger/dolphin-email-8b
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (gráfico): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
