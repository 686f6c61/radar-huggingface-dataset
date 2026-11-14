# Kuantum-ai1/TinyRouter1-22M

## Resumen

TinyRouter1-22M es un clasificador de texto de 22,7 millones de parámetros desarrollado por Kuantum-ai1 que funciona como enrutador de prompts: recibe una consulta en inglés y la asigna a una de cuatro categorías amplias (`code`, `general`, `multilingual`, `stem`) para dirigirla al modelo especialista adecuado. Se trata de un fine-tuning del encoder `sentence-transformers/all-MiniLM-L6-v2` sobre el subconjunto de dominio del dataset `MaziyarPanahi/Jev-Intent-Domain-Routing-130K`, y su pipeline en Hugging Face es `text-classification`.

El modelo resuelve un problema de orquestación en arquitecturas multi-modelo: en lugar de enviar cada consulta a un LLM grande, un clasificador minúsculo decide qué especialista debe atenderla. Con un repositorio de 0,1 GB y una latencia declarada inferior a 50 ms en CPU, está pensado para despliegues en edge, móvil e inferencia de bajo coste sin GPU.

Su relevancia actual radica en la popularización de los sistemas de routing y mezcla de expertos a nivel de aplicación: permite reducir coste y latencia en pipelines con varios modelos detrás, a cambio de una precisión de clasificación limitada (89,48 % en el conjunto de test del autor) y de una cobertura semántica muy gruesa de solo cuatro clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.714.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el modelo base admite cuantización estándar de PyTorch/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 6 capas y 22,7 M de parámetros, heredado de `all-MiniLM-L6-v2`, al que se le añade una cabeza de clasificación de secuencias con 4 etiquetas. La entrada se construye concatenando una representación JSON del estado de la conversación (`state_preview`) con el texto de la pregunta, separados por el token `[SEP]`, y se trunca a 256 tokens. La predicción se obtiene aplicando softmax sobre los logits de la cabeza de clasificación.

El entrenamiento se realizó sobre el subconjunto de la tarea `domain` del dataset `MaziyarPanahi/Jev-Intent-Domain-Routing-130K`, combinando los splits de train, validation y test y repartiéndolos de nuevo al 95 %/5 %: 23.842 ejemplos de entrenamiento y 1.255 de test. Se usaron 6 épocas con batch de 256, learning rate 2e-5 con schedule coseno y warmup del 10 %, weight decay 0,01, label smoothing 0,1, CrossEntropyLoss y AdamW con precisión mixta (AMP). El entrenamiento completo se ejecutó en una única GPU T4 en aproximadamente 25 minutos. La mejor época fue la 3 (89,48 % de accuracy); a partir de ahí el rendimiento se estanca, lo que el autor atribuye al ruido de etiquetas del dataset y a un techo estimado de 90-91 % para esta arquitectura.

## Capacidades

- Clasificación de prompts en inglés en cuatro dominios: `code`, `general`, `multilingual` y `stem`.
- Salida de probabilidades por clase (softmax), lo que permite aplicar umbrales de confianza y estrategias de fallback.
- Enrutamiento de consultas hacia modelos especialistas en pipelines multi-modelo.
- Inferencia en CPU con latencia declarada inferior a 50 ms, apta para edge y móvil.
- Diseño de entrada con `state_preview` en JSON, pensado para integrarse en sistemas con estado de conversación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades de visión, audio ni generación de texto.
- Capacidad multilingüe limitada a la detección de consultas no inglesas, que se clasifican como `multilingual` sin identificar el idioma ni el tema.

## Casos de uso

- Enrutamiento en arquitecturas multi-modelo: el clasificador recibe cada prompt de usuario y decide si debe atenderlo un modelo de código, uno general, uno de traducción o uno matemático, reduciendo el coste frente a enviar todo el tráfico a un LLM grande.
- Reducción de latencia en atención al cliente: al clasificar la consulta antes de invocar al modelo generativo, se evita cargar especialistas innecesarios y se puede enrutar en menos de 50 ms en CPU.
- Filtrado previo en sistemas de traducción: las consultas marcadas como `multilingual` se derivan a un modelo de traducción o multilingüe, mientras que el resto se mantiene en el pipeline en inglés.
- Despliegue en dispositivos con recursos limitados: con 85 MB y ejecución en CPU, puede integrarse en aplicaciones móviles o gateways de borde para preclasificar tráfico antes de llamar a servicios en la nube.
- Enrutamiento de consultas técnicas y educativas: las preguntas de matemáticas, física o programación se derivan a modelos especializados, útil en asistentes de estudio o plataformas de soporte técnico.
- Preclasificación en sistemas de agentes: el router puede actuar como primer paso de un pipeline de agentes, seleccionando el especialista antes de que el agente planifique la respuesta.
- Control de costes en APIs de LLM: al enrutar consultas triviales a modelos pequeños y reservar los grandes para dominios concretos, se reduce el gasto por token en producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test (1.255 ejemplos retenidos) | 89,48 % |
| Accuracy época 0 | 84,46 % |
| Accuracy época 1 | 87,73 % |
| Accuracy época 2 | 88,84 % |
| Accuracy época 3 (mejor, guardada) | 89,48 % |
| Accuracy época 4 | 89,16 % |
| Accuracy época 5 | ~89 % (estancamiento) |

Pruebas con prompts reales publicadas por el autor:

| Prompt | Prediccion | Confianza |
|---|---|---|
| "Write a Python script to calculate average with pandas" | `code` | 91,8 % |
| "What will the weather be like tomorrow?" | `general` | 77,7 % |
| "How do I solve integrals and derivatives?" | `stem` | 78,6 % |
| "Translate this sentence to English: Bugun cok yorgunum" | `multilingual` | 59,1 % |

No se han publicado resultados comparativos con otros routers en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en FP32 ocupa aproximadamente 85 MB de pesos, por lo que cabe en cualquier GPU consumer con holgura.
- GPU recomendadas: no necesarias; el autor reporta inferencia en CPU con latencia inferior a 50 ms. Para lotes grandes se puede usar cualquier GPU consumer (RTX 3060 o superior) o una T4.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM, e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (el tag `text-embeddings-inference` está presente en el repo) y exportación a ONNX para entornos de borde; no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: latencia declarada inferior a 50 ms por prompt en CPU; el throughput no está publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyRouter1-22M | 22,7 M | 256 tokens | Clasificacion de dominio en 4 clases | Apache 2.0 | Hugging Face |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | 22,7 M | 256 tokens | Embeddings de frases | Apache 2.0 | Hugging Face |
| Routers basados en LLM (p. ej. clasificacion zero-shot con un modelo generativo) | miles de millones | variable | Clasificacion flexible por prompt | variable | variable |

No se dispone de datos de benchmarks de routers comparables en la información proporcionada; la comparación con la base refleja que TinyRouter1-22M reutiliza su arquitectura y añade una cabeza de clasificación de 4 clases, mientras que un router basado en LLM ofrece mayor flexibilidad de categorías a cambio de mucho mayor coste y latencia.

## Limitaciones y advertencias

- Solo inglés: los prompts en otros idiomas se clasifican como `multilingual` por diseño, sin identificar el idioma ni el tema, por lo que no sirve para enrutar por materia en otros idiomas.
- Prompts muy cortos ("hi", "help") son ambiguos y el modelo tiende a predecir `general`.
- Los prompts mixtos inglés-otro idioma obtienen confianza baja (59,1 % en el ejemplo del autor), aunque el argmax suele ser correcto.
- Ruido de etiquetas en el dataset de origen, especialmente entre `general` y `stem`, lo que limita la precisión a un techo estimado del 90-91 %.
- Sin historial de conversación: el modelo solo ve el prompt actual envuelto como conversación de un turno.
- Contexto limitado a 256 tokens, insuficiente para prompts largos o documentos completos.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de clasificación errónea con confianza alta en dominios solapados.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial sin restricciones adicionales documentadas.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuantum-ai1/TinyRouter1-22M
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/MaziyarPanahi/Jev-Intent-Domain-Routing-130K
