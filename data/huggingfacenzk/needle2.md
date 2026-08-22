# huggingfacenzk/needle2

## Resumen

Needle 2 es un modelo de lenguaje de 45 millones de parámetros desarrollado por Cactus Compute, especializado en tool calling, uso de dispositivos y extracción estructurada. Está pensado para ejecutarse en dispositivos con recursos muy limitados: el modelo completo se compila en un único binario de 14 MB que ejecuta una sesión completa en 28 MB de RAM. Su objetivo es llevar capacidades de agente a teléfonos, wearables, electrodomésticos inteligentes, robots y microcontroladores.

El modelo se basa en los hallazgos de Simple Attention Network (arXiv:2607.18363), una arquitectura densa pequeña que sustituye el FFN tradicional por un MLP de Hadamard, usa GQA, memoria clave-valor tipo engram y hiperconexiones de múltiples carriles. Se comprime a 2 bits con Cactus Quantizers y se empaqueta con su propio motor de inferencia, sin dependencias externas. Soporta ARM64, x86-64, ARMv7, RISC-V y WebAssembly, y alcanza velocidades de 500 tokens por segundo en una Raspberry Pi 5 y de 300 a 700 tokens por segundo en teléfonos de gama baja.

Su relevancia actual radica en que resuelve el problema de ejecutar agentes con tool calling en hardware de menos de 1 W, con una huella de memoria fija de 28 MB y un contrato de salida JSON estructurado, lo que lo hace viable para despliegues en el borde donde los modelos de cientos de millones de parámetros son inviables. Compite en benchmarks con modelos mucho mayores como FunctionGemma 270M o LFM2.5 230M, siendo de 5 a 70 veces más pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simple Attention Network (Hadamard MLP, GQA, engram KV, multi-lane hyper-connections) |
| Parametros totales | 45 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (ventana deslizante, con herramientas fijas como KV sinks) |
| Tipos de cuantizacion | CQ2-bit (Cactus Quants) |
| Idiomas soportados | no disponible (el README no especifica idiomas; se infiere ingles por los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario autónomo (14 MB) con motor integrado; no expone pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

Needle 2 usa Simple Attention Network, una receta para modelos pequeños densos. En lugar de un FFN tradicional, emplea un MLP de Hadamard: una matriz fija ortonormal de Walsh-Hadamard aplicada en tiempo O(n log n) sin pesos que leer, seguida de un MLP con compuertas aprendidas. La atención es GQA (Grouped Query Attention) con cabezas compartidas para reducir parámetros y memoria. La memoria clave-valor usa tablas de n-gramas con hash (engram key-value memory), que permiten almacenar información de forma eficiente sin crecer linealmente con el contexto.

Cada bloque tiene una regla de actualización propia: el residuo se normaliza con RMS, se aplana a cuatro flujos residuales, se aplica la transformada de Hadamard, se recogen filas (k_t, v_t) de tablas n-gramas, y la normalización de routing A se hace con iteración de Sinkhorn para obtener una matriz doblemente estocástica. Las compuertas a, b, g y todas las σ-gates son aprendidas y dependientes de la entrada. Los sitios de engram se activan en dos capas. La decodificación está restringida por una gramática de nivel de byte compilada desde los esquemas JSON de las herramientas, de modo que cada token generado está forzado a cumplir la sintaxis y las restricciones de valores.

El entrenamiento incluye los detalles no publicados en la información disponible, pero el README menciona que se entrenó con la receta de Simple Attention Network y que se publicaron ablaciones en el paper arXiv:2607.18363. No se especifican el número de tokens de entrenamiento, el dataset ni el uso de RLHF/DPO.

## Capacidades

- Tool calling y function calling: el modelo decide qué herramienta llamar y rellena los argumentos a partir de las descripciones en el esquema JSON; devuelve llamadas estructuradas (JSON out).
- Extracción estructurada: mediante `needle.extract()` convierte texto no estructurado en objetos tipados (por ejemplo, facturas o datos de contacto) con un modelo Pydantic.
- Restricción de valores por gramática: soporta campos con rangos (`gt`, `le`, `multiple_of`), patrones regex, longitudes máximas y listas únicas, compilados en la gramática de decodificación para que el modelo solo pueda emitir valores válidos.
- Recuperación de herramientas: ante un catálogo grande de herramientas, un head de recuperación integrado selecciona las cinco más relevantes por turno y la gramática se restringe a ese subconjunto.
- Confianza calibrada: cada respuesta lleva una puntuación de confianza aprendida; se puede fijar un umbral para actuar automáticamente o escalar a un humano si la confianza es baja.
- Memoria acotada: ventana deslizante de 256 tokens con las herramientas fijadas como KV sinks, lo que mantiene el uso de RAM cercano a 28 MB independientemente de la duración de la conversación.
- Ejecución en el borde: soporta ARM64, x86-64, ARMv7, RISC-V y WebAssembly, con binario autónomo sin red ni descargas.

## Casos de uso

- Asistentes de voz en dispositivos wearables: un reloj inteligente o unas gafas AR pueden ejecutar Needle 2 localmente para interpretar comandos de voz y ejecutar llamadas a herramientas (consultar clima, crear recordatorios) sin enviar datos a la nube, gracias a su velocidad de 400-1500 tokens/s en VR y 300-700 en teléfonos de gama baja.
- Automatización del hogar: un hub doméstico con un ESP32-P4 puede controlar termostatos, luces o cerraduras usando tool calling con restricciones de gramática (por ejemplo, temperatura entre 15 y 30 grados) y sin depender de Internet, manteniendo la privacidad de los datos del hogar.
- Extracción de datos de documentos en el borde: un escáner o una cámara de inventario pueden usar `extract()` para extraer facturas, etiquetas o formularios en formato JSON estructurado, directamente en el dispositivo, reduciendo la latencia y el coste de procesamiento en la nube.
- Agente de soporte en terminales POS: en un punto de venta con hardware limitado, Needle 2 puede gestionar conversaciones multi-turno con el cliente para pedir pedidos, validar pagos o consultar inventario, con una ventana de 256 tokens suficiente para transacciones cortas y con salida JSON para integrarse con el sistema de back-end.
- Robot de propósito específico en robótica: un robot de limpieza o de asistencia puede ejecutar el modelo en su microcontrolador para interpretar comandos de voz y ejecutar acciones (moverse a una habitación, iniciar una rutina) con respuestas de baja latencia y sin conexión.
- Asistente de programación en entornos sin GPU: un IDE en un dispositivo embebido o en un mini-PC puede usar Needle 2 para completar llamadas a funciones o generar código de pegado, con tool calling para invocar compiladores o linters, todo localmente con un consumo de RAM de 28 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que Needle 2 "intercambia victorias con otros modelos pequeños como FunctionGemma 270M, LFM2.5 230M y Apple FM", siendo de 5 a 70 veces más pequeño y con 2 bits frente a sus f16, pero no se proporcionan números concretos de MMLU, HumanEval, GSM8K ni otros benchmarks. Se indican velocidades de decodificación: 500 tokens/s en Raspberry Pi 5, entre 400 y 1500 tokens/s en dispositivos VR (Meta Quest 3S, Apple Vision Pro) y entre 300 y 700 tokens/s en teléfonos de menos de 200 dólares de la serie Samsung A. La RAM máxima por sesión es de 28 MB y se ha reportado ejecución en ESP32-S3 con unos 11 MB.

## Requisitos de hardware

- RAM de sesión: 28 MB pico; el binario completo ocupa 14 MB en disco.
- GPU: no requiere GPU; el modelo está diseñado para CPU y microcontroladores.
- Dispositivos compatibles: Raspberry Pi 5 (500 tok/s), Meta Quest 3S y Apple Vision Pro (400-1500 tok/s), teléfonos Android de gama baja (Samsung A-Series, 300-700 tok/s), microcontroladores ESP32-P4 y ESP32-S3 (este último con unos 11 MB de RAM).
- Arquitecturas CPU: ARM64, x86-64, ARMv7, RISC-V, WebAssembly.
- Opciones de despliegue: el motor viene integrado en el binario; se instala con `pip install cactus-needle` y se usa como librería Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que el modelo se distribuye como un binario autónomo, no como pesos separados.
- Latencia: para un turno de herramienta típico, la velocidad de decodificación de 500 tokens/s en Raspberry Pi 5 implica una latencia de decenas de milisegundos para respuestas cortas; en microcontroladores la velocidad será menor pero suficiente para tareas simples.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso objetivo |
|---|---|---|---|---|---|
| Needle 2 | 45M | 256 tokens | Apache 2.0 | Binario autónomo (CQ2) | Tool calling en edge (micro, móvil, VR) |
| FunctionGemma 270M | 270M | no disponible | no disponible | f16 (según la card) | Tool calling en edge |
| LFM2.5 230M | 230M | no disponible | no disponible | f16 (según la card) | Tool calling en edge |
| Apple FM | no disponible | no disponible | no disponible | f16 (según la card) | On-device |

La comparativa es cualitativa según la información del autor: Needle 2 es de 5 a 70 veces más pequeño que estos modelos, usa 2 bits frente a sus f16, y compite con ellos en benchmarks de tool calling y extracción. No hay números de benchmark públicos disponibles para comparar de forma cuantitativa.

## Limitaciones y advertencias

- **Contexto muy limitado**: la ventana deslizante de 256 tokens es extremadamente corta para tareas que requieran razonamiento largo o conversaciones extensas; está pensada para interacciones breves y dirigidas a herramientas, no para generación de texto de larga duración.
- **Riesgo de alucinación**: al ser un modelo de 45M, su capacidad de razonamiento y fact-checking es limitada; las salidas deben verificarse, especialmente en extracción de datos donde la confianza calibrada puede ayudar a detectar casos de baja confianza.
- **Idiomas no especificados**: no se indica qué idiomas soporta; los ejemplos del README están en inglés, por lo que el uso en castellano u otros idiomas puede degradar el rendimiento sin datos específicos.
- **Licencia Apache 2.0**: permite uso comercial, modificación y redistribución, pero no se indica si hay patentes asociadas ni restricciones adicionales; se recomienda revisar el repositorio para detalles.
- **Formato de pesos no estándar**: el modelo se distribuye como un binario compilado, no como safetensors o GGUF. Esto impide su uso con frameworks de inferencia genéricos (vLLM, llama.cpp) y limita la personalización del motor de ejecución.
- **Rendimiento en producción**: las velocidades reportadas (500 tok/s en Raspberry Pi 5) son para decodificación en un dispositivo concreto; en microcontroladores como el ESP32-S3 el rendimiento será mucho menor y la latencia puede ser notable para tareas interactivas.
- **Sesgos y datos de entrenamiento**: no se ha publicado información sobre el dataset de entrenamiento, por lo que se desconoce la composición lingüística, el equilibrio de dominios y los posibles sesgos presentes.

## Enlaces

- Repositorio de HuggingFace: [https://huggingface.co/huggingfacenzk/needle2](https://huggingface.co/huggingfacenzk/needle2)
- Repositorio de GitHub (código fuente, motor y entrenamiento): [https://github.com/cactus-compute/needle](https://github.com/cactus-compute/needle)
- Paper de Simple Attention Network (arXiv:2607.18363): [https://arxiv.org/abs/2607.18363](https://arxiv.org/abs/2607.18363)
- Página de producto de Cactus: [https://cactuscompute.com/needle](https://cactuscompute.com/needle)
- Noticia sobre el lanzamiento: [https://aitoolly.com/ai-news/article/2026-08-16-needle-2-the-14mb-base-model-revolutionizing-ai-for-small-devices-and-edge-computing](https://aitoolly.com/ai-news/article/2026-08-16-needle-2-the-14mb-base-model-revolutionizing-ai-for-small-devices-and-edge-computing)
