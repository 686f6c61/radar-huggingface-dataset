# num1notsvn/wicara-56m-chat-GGUF

## Resumen

Wicara 56M Chat es un modelo de lenguaje conversacional en indonesio desarrollado por num1notsvn y entrenado desde cero en un portátil de consumo con una NVIDIA RTX 4050 de 6 GB. El modelo base preentrenado es wicara-56m-base y esta versión GGUF ofrece dos cuantizaciones: Q8_0, de aproximadamente 70,6 MB, y F16, de 132,9 MB. Con un total de 66.450.560 parámetros, está diseñado para ejecutarse de forma eficiente en CPU y dispositivos móviles, y puede usarse a través de LM Studio u Ollama. Su relevancia radica en demostrar que es posible entrenar modelos de lenguaje funcionales con recursos de hardware muy limitados, y en ofrecer una alternativa ligera para aplicaciones de chat en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (según etiquetas del repositorio) |
| Parametros totales | 66.450.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (8 bits) y F16 (16 bits) |
| Idiomas soportados | Indonesio (principal) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura basada en Llama, según las etiquetas del repositorio, y utiliza una plantilla de chat con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`. Fue entrenado desde cero, no como fine-tuning de un modelo preexistente, en un portátil con RTX 4050 de 6 GB. No se especifican el número de tokens de entrenamiento ni la composición del dataset, y no se documenta el uso de RLHF o DPO. La innovación principal es la viabilidad del entrenamiento en hardware de consumo y la posterior cuantización a GGUF para inferencia rápida.

## Capacidades

- Generación de texto conversacional en indonesio.
- Soporte de chat multi-turno mediante la plantilla de prompt incluida en el Modelfile.
- Inferencia eficiente en CPU y dispositivos móviles gracias a la cuantización Q8_0.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni razonamiento avanzado.
- Modelo monolingüe: solo indonesio.

## Casos de uso

- Asistente conversacional en indonesio para aplicaciones móviles: el modelo es ligero y puede ejecutarse en dispositivos con recursos limitados, ofreciendo respuestas en tiempo real sin conexión.
- Chatbot de atención al cliente en indonesio para pequeñas empresas: puede gestionar consultas frecuentes con respuestas predefinidas, reduciendo costes de soporte.
- Aplicaciones educativas para aprender indonesio: el modelo puede generar ejercicios, diálogos y explicaciones sencillas adaptadas al nivel del usuario.
- Automatización de respuestas en redes sociales en indonesio: gracias a su tamaño, puede integrarse en servicios de bajo coste para responder mensajes comunes.
- Prototipado rápido de aplicaciones de chat: los desarrolladores pueden usar el modelo en LM Studio u Ollama para validar ideas sin necesidad de infraestructura costosa.
- Uso en entornos offline o con privacidad local: al ser pequeño y cuantizado, puede ejecutarse sin conexión a internet, garantizando que los datos no salgan del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q8_0 requiere aproximadamente 70,6 MB y F16 unos 132,9 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna o iGPU; la RTX 4050 de 6 GB usada para el entrenamiento es más que suficiente para la inferencia.
- Sí cabe en GPUs de consumo como RTX 4060, RTX 4070, etc., e incluso en CPU con suficiente RAM.
- Opciones de despliegue: Ollama, LM Studio y llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos: no documentados; al ser un modelo pequeño entrenado con datos limitados, es probable que herede sesgos del corpus.
- Riesgo de alucinación: alto, especialmente en modelos pequeños con poca capacidad de razonamiento.
- Limitaciones de contexto: no especificada; probablemente corta.
- Solo soporta indonesio; no es adecuado para otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el rendimiento es limitado para producción.
- El modelo fue entrenado en un portátil con 6 GB de VRAM, lo que sugiere un dataset pequeño y una calidad potencialmente baja.

## Enlaces

- https://huggingface.co/num1notsvn/wicara-56m-chat-GGUF
- https://huggingface.co/num1notsvn/wicara-56m-chat
- https://huggingface.co/num1notsvn/wicara-56m-base
- https://github.com/bagusardin25/WicaraLLM
