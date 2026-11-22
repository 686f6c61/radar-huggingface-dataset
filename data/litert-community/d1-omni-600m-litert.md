# litert-community/d1-omni-600M-LiteRT

## Resumen

d1-omni-600M es un modelo de decisión desarrollado por LiquidAI, post-entrenado para realizar decisiones de una sola pasada sobre texto, imágenes y audio. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (texto, imagen y/o audio) junto con un conjunto de preguntas nombradas y devuelve, para cada una, una respuesta leída directamente de la distribución de probabilidad del modelo sobre las opciones definidas por el anfitrión. Este repositorio concreto, publicado por litert-community, es la conversión del modelo original a formato LiteRT (`.tflite`) para su despliegue en dispositivos de borde sin PyTorch ni frameworks de inferencia pesados.

El modelo base, LiquidAI/d1-omni-600M, pertenece a la familia LFM2 de LiquidAI y emplea una arquitectura de tipo "liquid". Con 600 millones de parámetros, está pensado para ejecutarse en CPU o GPU de dispositivos móviles y embebidos. El repositorio incluye doce grafos TFLite: seis grafos de decisión con distintas longitudes de contexto (de 128 a 4.096 posiciones), una torre de visión SigLIP2, un proyector de visión, y cuatro codificadores de audio para clips de hasta 5, 10, 20 y 30 segundos.

La relevancia de esta ficha radica en que ofrece una vía práctica para integrar un modelo multimodal de decisión en aplicaciones de borde: clasificación de intenciones, enrutamiento de tickets, moderación de contenido o respuestas sí/no sobre imágenes y audio, todo con un contrato de llamada explícito (`contract.json`) y un host de referencia en Python. La licencia es la LFM Open License v1.0, que conviene revisar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Liquid (familia LFM2), transformer de decisión multimodal con torre de visión SigLIP2 y codificador de audio |
| Parámetros totales | 600M (según nombre del modelo; no se detalla desglose en la información disponible) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | Hasta 4.096 posiciones (buckets de 128, 256, 512, 1.024, 2.048 y 4.096) |
| Tipos de cuantización | Pesos en fp16, cómputo en float32; tabla de embeddings en float32 en los grafos de decisión |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | TFLite (`.tflite`) para LiteRT; el proveedor también publica GGUF |

## Arquitectura y entrenamiento

El modelo base es un modelo de decisión de la familia LiquidAI LFM2, descrito por el proveedor como "post-entrenado para decisiones de una sola pasada sobre texto, imágenes y speech". La arquitectura combina un núcleo de decisión de tipo liquid con una torre de visión SigLIP2 (171,6 MB) y un proyector de visión (16,8 MB), más codificadores de audio específicos por duración de clip (de 221,1 MB para 5 s a 242,9 MB para 30 s). Los grafos de decisión ocupan aproximadamente 896 MB cada uno y difieren únicamente en la longitud máxima de contexto soportada.

La conversión a LiteRT mantiene los pesos de las capas totalmente conectadas en fp16 y realiza el cómputo en float32. En los grafos de decisión, la tabla de embeddings se conserva en float32, y las capas de normalización que desbordan fp16 se reescriben en una forma segura para fp16. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El repositorio incluye un `contract.json` con firmas, ids de tokens, buckets, temperaturas, pasos del host, precisión por grafo y backend, y resultados del conjunto de verificación.

El mecanismo de inferencia es singular: el host construye una fila de ids por pregunta con marcadores reservados que delimitan estado, instrucciones y opciones, y el modelo lee la distribución sobre las opciones en las posiciones de los marcadores `<|mask|>`. No hay decodificación autoregresiva de texto; la salida es la respuesta de mayor probabilidad (o la distribución completa vía `probabilities()`).

## Capacidades

- Decisión de una sola pasada sobre texto: clasificación de intenciones, preguntas sí/no (tipo `noul`) y elección entre opciones nombradas (tipo `choice`).
- Decisión multimodal: acepta imagen (una cosecha por llamada mediante la torre SigLIP2) y audio (clips de hasta 30 s) junto con el estado textual.
- Respuesta con distribución de probabilidad: `model.probabilities()` devuelve las distribuciones crudas en el orden de las opciones, útil para umbrales y calibración.
- Soporte multilingüe en 15 idiomas: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh.
- Ejecución en dispositivo: grafos TFLite con backend CPU (XNNPACK, 4 hilos) o aceleración GPU, sin dependencia de PyTorch.
- No genera texto libre: no es un modelo de chat ni de generación; su salida es siempre una elección entre opciones definidas por el anfitrión.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: definir preguntas de tipo `choice` con criterios como "billing", "technical" o "fraud" y pasar el texto del ticket como estado; el modelo devuelve el equipo adecuado en una sola pasada, con contexto de hasta 4.096 posiciones para hilos largos.
- Clasificación de intención en asistentes de voz: usar el codificador de audio de hasta 30 s para decidir si el hablante pide una acción (pregunta `noul`) antes de invocar el flujo correspondiente.
- Moderación de imágenes en el dispositivo: con la torre SigLIP2, decidir entre categorías predefinidas (por ejemplo, "dog", "cat", "bird") sin enviar la imagen a un servidor, lo que reduce latencia y cumple requisitos de privacidad.
- Detección de solicitudes de reembolso: pregunta binaria `noul` sobre el texto del cliente ("Is the customer asking for a refund?") para activar el flujo de facturación; el modelo devuelve la probabilidad, que puede umbralizarse.
- Triaje de notas de voz en aplicaciones móviles: transcribir no es necesario; el codificador de audio decide directamente si la nota contiene una petición, con clips de 5 a 30 s según el bucket elegido.
- Clasificación multilingüe en el borde: al soportar 15 idiomas, el mismo grafo puede decidir intenciones en árabe, hindi, japonés o ruso sin modelos separados por idioma.
- Verificación de pipelines de conversión: el host de referencia y `verify.py` permiten validar en la máquina del integrador que la conversión LiteRT reproduce las probabilidades float32 del proveedor (criterio max |Δp| ≤ 0,02 y mean |Δp| ≤ 0,002).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un conjunto de verificación público (`fixtures/`) con probabilidades float32 de referencia: 242 registros de texto, 5 de imagen y 6 de audio, que permiten medir la fidelidad de la conversión (concordancia de argmax, max/p95/mean |Δp| y filas no finitas) mediante `host/verify.py`. No se proporcionan cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: cada grafo de decisión ocupa unos 896 MB en disco; el conjunto completo del repositorio son 6,5 GB, pero solo se cargan los grafos que usen las peticiones.
- Torre de visión: 171,6 MB; proyector de visión: 16,8 MB; codificadores de audio: entre 221,1 MB y 242,9 MB según duración.
- CPU: ejecución con XNNPACK a 4 hilos; el host de referencia funciona sin PyTorch (solo numpy, tokenizers, Pillow, soundfile y ai-edge-litert).
- GPU: se puede abrir cada grafo con `accelerator="gpu"` a la precisión indicada en `contract.json`; no se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la información disponible.
- Dispositivos de consumo: por tamaño (600M y grafos de ~900 MB), es apto para dispositivos de borde y móviles; no se detalla compatibilidad con GPU de consumo específicas.
- Despliegue: LiteRT (ai-edge-litert) con backend CPU o GPU; el proveedor también publica GGUF para otras vías de despliegue. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en esta información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| d1-omni-600M-LiteRT (este) | 600M | Hasta 4.096 posiciones | Texto, imagen, audio (decisión) | LFM Open License v1.0 | TFLite |
| LiquidAI/d1-omni-600M (base) | 600M | No disponible | Texto, imagen, audio (decisión) | LFM Open License v1.0 | No disponible |
| LiquidAI/d1-omni-600M-GGUF | 600M | No disponible | Texto, imagen, audio (decisión) | LFM Open License v1.0 | GGUF |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada, por lo que no es posible comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo no genera texto: solo elige entre opciones definidas por el anfitrión; no sirve para chat, redacción ni generación libre.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a opciones incorrectas cuando el estado es ambiguo o está fuera de distribución; conviene calibrar umbrales con `probabilities()`.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al ser un modelo entrenado por LiquidAI, pueden persistir sesgos de los datos de entrenamiento no declarados.
- Límite de contexto: 4.096 posiciones como máximo; las filas más largas se truncan o no se admiten según el bucket elegido.
- Idiomas: 15 idiomas declarados; no se detalla el rendimiento relativo por idioma.
- Licencia: LFM Open License v1.0 (lfm1.0), que impone restricciones; es imprescindible revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- La conversión LiteRT tiene tolerancias: el criterio de verificación acepta max |Δp| ≤ 0,02 y mean |Δp| ≤ 0,002 respecto a las probabilidades float32 del proveedor; desviaciones mayores pueden afectar decisiones sensibles.
- El repositorio pesa 6,5 GB; en entornos con almacenamiento limitado debe seleccionarse solo el subconjunto de grafos necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/d1-omni-600M-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Versión GGUF del proveedor: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE` (enlace directo no disponible en la información proporcionada)
- Paper, blog o demo: no disponibles en la información proporcionada.
