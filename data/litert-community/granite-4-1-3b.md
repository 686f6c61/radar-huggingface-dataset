# litert-community/granite-4.1-3b

## Resumen

`litert-community/granite-4.1-3b` es una conversión del modelo Granite 4.1 3B de IBM al formato **LiteRT-LM** (`.litertlm`), diseñado para inferencia en dispositivos móviles y entornos edge. El modelo original, `ibm-granite/granite-4.1-3b`, es un transformer denso de 3.400 millones de parámetros, con 40 capas, atención GQA (40:8), embeddings atados y un vocabulario de 100.352 tokens. Esta versión empaquetada permite ejecutar el modelo en teléfonos y hardware de bajo consumo mediante el runtime LiteRT-LM de Google, con cuantización int4 o int8.

La relevancia de esta ficha radica en que ofrece una solución práctica para desplegar un modelo de razonamiento y tool calling de última generación (lanzado en abril de 2026) en dispositivos sin conexión a la nube. El archivo int4 ocupa solo 2,19 GB y alcanza velocidades de decodificación de 86 tokens/s en GPU Metal (Apple M4 Max) y 7 tokens/s en un Pixel 8a, lo que lo hace viable para asistentes locales, chatbots offline y aplicaciones de productividad en movilidad.

La conversión ha sido realizada por `litert-community` con la pila oficial de herramientas de LiteRT (litert-torch 0.9.3, ai-edge-quantizer 0.8.0), e incluye ajustes específicos como la eliminación del token de inicio (start token) para evitar errores de generación y una escalera de prefill recortada a seis firmas para optimizar el uso de memoria en iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (40 capas, hidden 2560, GQA 40:8, embeddings atados) |
| Parametros totales | 3.400 millones (3,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (KV budget en la conversión LiteRT; el modelo base puede soportar más, no especificado) |
| Tipos de cuantizacion | int4 blockwise-32 con OCTAV en lineales + int8 en embeddings; int8 dinámico por canal en lineales y embeddings |
| Idiomas soportados | Multilingüe (idiomas concretos no especificados en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.1 3B es un transformer denso con atención multi-consulta (GQA) de 40 cabezas de consulta y 8 de clave/valor, capas de 2560 unidades ocultas y embeddings atados. Se entrenó con un enfoque de instrucción (instruct) que incorpora mejoras en tool calling, seguimiento de instrucciones, generación de código y razonamiento matemático respecto a Granite 4.0. No se han proporcionado detalles sobre el volumen de tokens de entrenamiento ni el pipeline de alineación (RLHF/DPO) en la información disponible.

La conversión a LiteRT-LM aplica dos recetas de cuantización: int4 por bloques de 32 con recorte OCTAV en las capas lineales y embeddings int8, e int8 dinámico por canal. El proceso utiliza `litert-torch` y `ai-edge-quantizer`, y ha sido validado con una prueba de cordura de 8 preguntas que supera en CPU y GPU (tanto en Apple como en Android). Un hallazgo técnico relevante es que el tokenizador de Granite no añade token BOS (su BOS es igual a EOS), por lo que el conversor debe eliminar el campo `start_token` de los metadatos; de lo contrario, el modelo interpreta el primer turno como un documento ya finalizado y responde repitiendo la pregunta.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte para cadenas de pensamiento (chain-of-thought) en tareas matemáticas.
- Tool calling y function calling: el modelo base está optimizado para invocar herramientas externas y producir salidas estructuradas.
- Generación de código y asistencia en programación, incluida la corrección y explicación de fragmentos.
- Razonamiento matemático: obtiene un 84% en GSM8K con cuantización int4 y 87% con int8.
- Soporte para retrieval-augmented generation (RAG) y salida JSON estructurada.
- Capacidades multilingües (idiomas no detallados en la documentación).
- Ejecución en dispositivos móviles con aceleración GPU (Metal en Apple, OpenCL en Android) y CPU.

## Casos de uso

- Asistente conversacional offline en smartphones: el modelo puede mantener diálogos multi-turno dentro de una ventana de 4096 tokens, funcionando sin conexión gracias al archivo int4 de 2,19 GB. Es adecuado para apps de productividad o privacidad que no deben enviar datos a la nube.
- Atención al cliente automatizada en dispositivos de punto de venta o kioscos: su capacidad de tool calling permite integrarse con sistemas de pedidos o consultas de inventario, ejecutando acciones locales con latencia de primer token inferior a 1 segundo en hardware de gama media.
- Asistente de código en entornos de desarrollo móviles (IDE en tablet o portátil ligero): el modelo puede generar, explicar y depurar fragmentos de código, aprovechando su entrenamiento específico en programación y su bajo footprint de memoria.
- Procesamiento de documentos y resumen en dispositivos edge: con 4096 tokens de contexto, puede resumir correos, actas o informes directamente en el dispositivo, sin transmitir información sensible.
- Generación de respuestas estructuradas (JSON) para aplicaciones de automatización: su soporte nativo para salidas JSON facilita la integración con flujos de trabajo empresariales en entornos sin servidor.
- Evaluación de modelos en investigación on-device: la disponibilidad de versiones int4 e int8 permite comparar el impacto de la cuantización en tareas de razonamiento, como se muestra en los benchmarks GSM8K (84% vs 87%).

## Benchmarks y rendimiento

La model card proporciona resultados de GSM8K (0-shot, greedy, max-tokens 512, n=100) comparando la conversión LiteRT con la referencia PyTorch en bf16:

| Configuración | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 88,0% |
| LiteRT int8 | 87,0% |
| LiteRT int4 | 84,0% |

Además, se reporta una prueba de cordura de 8 preguntas donde el archivo int4 obtiene 8/8 en CPU y GPU (Mac), 8/8 en iPhone 17 Pro con Metal y 7/8 en CPU del iPhone (la única falla es una línea de rima en un prompt combinado, que responde correctamente si se pregunta por separado). En Pixel 8a, el modelo genera correctamente con todos los nodos en el delegado OpenCL (1784/1784 nodos en prefill y 1614/1614 en decodificación, cero operaciones rechazadas).

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 2,19 GB para el archivo int4 (incluye pesos cuantizados y overhead del motor); 3,83 GB para int8.
- GPU recomendadas: Apple Silicon con Metal (probado en M4 Max), GPUs Mali con OpenCL (probado en Pixel 8a con Mali-G715). También funciona en CPU con XNNPACK.
- Cabe en GPUs de consumo: sí, en cualquier smartphone moderno con al menos 4 GB de RAM libre; el archivo int4 está pensado para teléfonos (el int8 no cabe en la GPU de un móvil).
- Opciones de despliegue: runtime LiteRT-LM (comando `litert-lm run`), con backend CPU o GPU (`--backend gpu`). Requiere `litert-lm ≥ 0.16`.
- Latencia y throughput (medidos con litert-lm 0.16.0):
  - Apple M4 Max, GPU Metal: prefill 1241 tok/s, decode 86,3 tok/s, TTFT 0,23 s, init 5,96 s (int4).
  - Apple M4 Max, CPU: prefill 104 tok/s, decode 22,0 tok/s, TTFT 3,01 s (int4).
  - Pixel 8a, GPU OpenCL: prefill 20,0 tok/s, decode 7,07 tok/s, TTFT 0,99 s (int4).
  - Pixel 8a, CPU: prefill 5,40 tok/s, decode 6,98 tok/s, TTFT 3,29 s (int4).

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de 3B en la información proporcionada. El modelo base Granite 4.1 3B compite con alternativas como Llama 3.2 3B, Qwen2.5 3B o Phi-3.5-mini, pero no hay benchmarks comunes publicados en esta ficha para establecer una comparación cuantitativa. En términos de características, Granite 4.1 destaca por su soporte nativo de tool calling y JSON estructurado, y esta conversión LiteRT ofrece la ventaja de un formato optimizado para edge con cuantización int4 de alta calidad (84% GSM8K, solo 4 puntos por debajo del bf16).

## Limitaciones y advertencias

- Longitud de contexto limitada a 4096 tokens en esta conversión, lo que puede ser insuficiente para tareas que requieran ventanas más largas (el modelo base podría soportar más, pero no se especifica).
- La cuantización int4 reduce el rendimiento en GSM8K en 4 puntos porcentuales respecto a bf16 (84% vs 88%); el int8 pierde solo 1 punto (87%).
- En teléfonos de gama baja, la velocidad de decodificación es modesta (7 tok/s en Pixel 8a), y el rendimiento de la GPU solo supera a la CPU en prefill y TTFT, no en decodificación (limitación por ancho de banda de memoria compartida).
- El archivo int4 requiere eliminar el campo `start_token` de los metadatos; si se utiliza el modelo con un runtime que lo añada automáticamente, el modelo responderá repitiendo la pregunta (error de construcción de prompt, no de conversión).
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje entrenados con datos web; no se han documentado sesgos específicos en la información disponible.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base de IBM para posibles condiciones adicionales (no se han encontrado).
- Para producción en iOS, la escalera de prefill se ha recortado a seis firmas (1024, 256, 64, 16, 4, 1) para evitar que el sistema mate el proceso durante la inicialización de Metal; esto puede causar padding en longitudes intermedias de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/granite-4.1-3b
- Modelo base (IBM): https://huggingface.co/ibm-granite/granite-4.1-3b
- Repo oficial de Granite 4.1: https://github.com/ibm-granite/granite-4.1-language-models
- Documentación de Granite 4.1 en IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Script de reproducción de conversión: https://github.com/john-rocky/hf-to-litertlm
- Colección de modelos Granite 4.1 en HuggingFace: https://huggingface.co/collections/ibm-granite/granite-41-language-models
