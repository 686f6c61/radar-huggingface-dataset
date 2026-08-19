# Cactus-Compute/needle2

## Resumen

Needle 2 es un modelo de lenguaje de 45 millones de parámetros desarrollado por Cactus-Compute, diseñado específicamente para ejecutarse en dispositivos de bajos recursos como teléfonos, wearables, domótica y robots. Su principal innovación es que compila a un binario de solo 14 MB y requiere únicamente 28 MB de RAM de sesión, lo que lo convierte en uno de los modelos agénticos más ligeros disponibles. Está especializado en tool calling, uso de dispositivos y extracción estructurada de información, y se distribuye con pesos abiertos bajo una licencia que, aunque el tag sugiere Apache 2.0, no está confirmada en la ficha oficial.

El modelo se basa en una arquitectura propia denominada "Simple Attention Network" (SAN), que según los desarrolladores fue destilada a partir de Gemini 3.1. Esta destilación permite que el modelo mantenga capacidades de razonamiento y llamada a funciones en un tamaño extremadamente reducido, haciéndolo viable para inferencia en tiempo real en hardware de consumo. Su relevancia actual radica en la creciente demanda de IA agéntica en el edge, donde los modelos grandes no son prácticos por consumo energético y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simple Attention Network (SAN) |
| Parametros totales | 45 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag menciona quantization, sin especificar formatos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el tag sugiere Apache 2.0, sin confirmar) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Needle 2 emplea una arquitectura "Simple Attention Network" (SAN), una variante de transformer con mecanismos de atención simplificados para reducir el coste computacional y el uso de memoria. Según la documentación del repositorio, el modelo fue destilado a partir de Gemini 3.1, un proceso que transfiere conocimiento de un modelo masivo a uno de 45M de parámetros. El dataset de generación utilizado para la destilación se publica de forma abierta, lo que permite reproducir el entrenamiento y adaptarlo a dominios específicos. No se han detallado el número exacto de tokens de entrenamiento ni la composición del corpus, pero la destilación sugiere que se priorizaron tareas de tool calling, extracción estructurada y razonamiento agéntico.

La innovación principal reside en su tamaño: 14 MB de binario y 28 MB de RAM de sesión, lo que permite ejecutarlo en microcontroladores y dispositivos con recursos muy limitados. El modelo soporta cuantización (aunque no se especifican los formatos) y se puede compilar a WebAssembly para su uso en navegadores y entornos embebidos.

## Capacidades

- Generación de texto y razonamiento básico, optimizado para tareas agénticas.
- Tool calling y function calling: puede invocar funciones externas y APIs, lo que lo hace adecuado para asistentes y automatización.
- Uso de dispositivos: capaz de controlar periféricos y actuar sobre el entorno (domótica, robots, wearables).
- Extracción estructurada de información: convierte texto no estructurado en formatos JSON u otros esquemas.
- Ejecución en tiempo real en hardware de bajo consumo, con latencias de 6000 tokens/segundo en prefill y 1200 tokens/segundo en decodificación (según el repositorio para la versión anterior, no confirmado para Needle 2).
- Soporte de agentes multi-paso, aunque con limitaciones propias de su tamaño.

## Casos de uso

- Asistentes de voz en dispositivos móviles: Needle 2 puede procesar comandos de voz y ejecutar acciones como enviar mensajes, controlar la música o consultar el calendario, gracias a su tool calling y su bajo consumo de RAM.
- Automatización del hogar: integrado en hubs domóticos, puede interpretar órdenes en lenguaje natural y activar luces, termostatos o cerraduras mediante llamadas a funciones.
- Wearables de salud: en relojes o pulseras, el modelo puede extraer datos biométricos de conversaciones o notificaciones y generar respuestas contextuales sin depender de la nube.
- Robots de servicio: para navegación y manipulación básica, el modelo puede recibir instrucciones y ejecutar secuencias de acciones predefinidas.
- Extracción de datos en aplicaciones de productividad: convierte correos o documentos en entradas estructuradas para CRMs o bases de datos, funcionando localmente en el dispositivo.
- Edge computing en entornos industriales: supervisa sensores y genera alertas o informes en tiempo real, con la ventaja de no requerir conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Binario de 14 MB y 28 MB de RAM de sesión, lo que permite ejecutarse en microcontroladores con al menos 32 MB de RAM.
- No requiere GPU; funciona en CPU de bajo consumo (ARM Cortex-M, RISC-V, x86 embebido).
- Puede ejecutarse en navegadores mediante WebAssembly, sin necesidad de servidor.
- Opciones de despliegue: llama.cpp (si se adapta), TGI, o el runtime propietario de Cactus. No se confirma compatibilidad con vLLM u Ollama.
- Latencia estimada: 6000 tokens/segundo en prefill y 1200 en decodificación (dato del repositorio para la versión anterior, no verificado para Needle 2).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con especificaciones públicas en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de 45M de parámetros, su capacidad de razonamiento complejo y comprensión profunda es limitada en comparación con modelos grandes.
- Riesgo de alucinaciones en tareas abiertas; se recomienda validar las salidas en aplicaciones críticas.
- Idiomas soportados no especificados; probablemente optimizado para inglés, aunque no se confirma.
- La licencia no está confirmada oficialmente; el tag sugiere Apache 2.0, pero se debe verificar antes de uso comercial.
- No se dispone de información sobre sesgos o evaluación de seguridad.
- El contexto máximo no se ha publicado, lo que puede limitar tareas que requieran historial largo.

## Enlaces

- [HuggingFace - Cactus-Compute/needle2](https://huggingface.co/Cactus-Compute/needle2)
- [Página oficial de Needle 2](https://cactuscompute.com/needle)
- [Repositorio GitHub - cactus-compute/needle](https://github.com/cactus-compute/needle)
