# raahemnabeel/inkling-2-mini

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo mixtura de expertos (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token, desarrollado por Thinking Machines Lab. La versión aquí documentada es un empaquetado de servicio (packaging) publicado por el usuario raahemnabeel que permite ejecutar el checkpoint original sin modificaciones sobre hardware Tenstorrent (p150, p150x2, p150x4, p300 y p300x2), mediante vLLM con un plugin específico.

El modelo destaca por su arquitectura de "looping": 24 capas de las cuales 12 se ejecutan tres veces, combinando atención de ventana deslizante con atención global y sesgo de posición relativa, además de 128 expertos enrutados con top-8. Incorpora entrada de imagen y una ventana de contexto de 1.048.576 tokens en los perfiles de mayor capacidad, lo que lo sitúa en la categoría de modelos de contexto largo con capacidades multimodales.

La relevancia de este paquete reside en que demuestra el despliegue de un modelo MoE de gran tamaño sobre aceleradores Tenstorrent, con decodificación especulativa mediante el drafter DSpark incluido en el checkpoint (3 borradores por pasada), caché de prefijos y soporte de tool calling y razonamiento separado, todo servido a través de una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (24 capas, 12 ejecutadas 3 veces), 128 expertos enrutados top-8, atención de ventana deslizante + global con sesgo de posición relativa |
| Parametros totales | 26.400 millones (26.4B) |
| Parametros activos | 3.400 millones (3.4B) por token |
| Longitud de contexto | 1.048.576 tokens (perfiles p300x2 y p150x4); 491.520 tokens (p300 y p150x2); 32.768 tokens (p150); 49.152 tokens (p150-long) |
| Tipos de cuantizacion | Expertos enrutados en bfp8 (decuantizados desde NVFP4 / MXFP8 del checkpoint); caché KV en bf16 |
| Idiomas soportados | No disponible (la model card menciona chat en tres idiomas en la evaluación, sin listarlos) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en detalle (checkpoint original de thinkingmachines/Inkling-2-Mini; incluye mtp.safetensors para el drafter DSpark) |

## Arquitectura y entrenamiento

Inkling-2-Mini es un transformer de mixtura de expertos con 24 capas, de las cuales 12 se ejecutan en tres pasadas (arquitectura "looped"), 128 expertos enrutados con activación top-8 y 3.4B parámetros activos por token sobre 26.4B totales. La atención combina ventanas deslizantes con atención global y un sesgo de posición relativa. El modelo acepta entrada de imagen además de texto.

El paquete de servicio emplea decodificación especulativa con el drafter DSpark incluido en el checkpoint (3 borradores por pasada), con aceptación bajo la regla estándar min(1, p/q) para preservar la distribución del modelo objetivo. Los expertos enrutados se sirven en bfp8, decuantizados desde NVFP4 / MXFP8 del checkpoint original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; la model card remite al checkpoint original para los detalles de entrenamiento y evaluación.

## Capacidades

- Generación de texto con razonamiento previo por defecto (modo "thinking"); el razonamiento se puede desactivar por petición con `"chat_template_kwargs": {"reasoning_effort": "none"}`.
- Razonamiento de múltiples pasos y resolución de problemas, con salida de pensamiento separada del contenido (`reasoning` frente a `content`).
- Generación de código y programación competitiva (incluida en la evaluación de fidelidad).
- Entrada de imágenes en mensajes de chat como partes `image_url`, hasta 4.095 tokens de imagen por imagen (un token por parche de 40 x 40 píxeles); imágenes mayores se rechazan con HTTP 400. El perfil `p150-long` es solo texto.
- Tool calling / function calling: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls` (parser `inkling`).
- Uso como agente con llamadas a herramientas y razonamiento multi-paso.
- Capacidades multilingües: la evaluación incluye chat en tres idiomas, aunque no se especifican cuáles.
- Caché de prefijos: instantáneas en fronteras de 64 tokens para prompts de 512 tokens o más (16 instantáneas en configuraciones de 2 y 4 dies, 1 en un solo die).
- Decodificación especulativa cuando una única petición está decodificando.

## Casos de uso

- Atención al cliente automatizada: con hasta 1.048.576 tokens de contexto en los perfiles p300x2 y p150x4, el modelo puede mantener conversaciones multi-turno con historiales extensos o documentación de producto completa sin truncar.
- Análisis de documentos largos: la ventana de contexto y la caché de prefijos permiten reutilizar instantáneas cuando varias preguntas se refieren al mismo documento, reduciendo el coste de prefill en consultas sucesivas.
- Asistentes de código en producción: el soporte de tool calling y la generación de código permiten integrarlo en pipelines que invocan herramientas externas (ejecución de tests, linters) y devuelven resultados estructurados.
- Agentes autónomos multi-paso: el razonamiento separado y el parser de tool calls facilitan la orquestación de agentes que planifican, llaman herramientas y sintetizan resultados.
- Procesamiento de documentos con imágenes: la entrada de imagen (hasta 4.095 tokens por imagen) permite extraer información de capturas, diagramas o formularios escaneados junto con el texto.
- Despliegue en infraestructura Tenstorrent: el paquete ofrece perfiles para p150, p150x2, p150x4, p300 y p300x2, con concurrencia de 8, 16 o 32 secuencias según el perfil, adecuado para entornos que ya operan aceleradores Tenstorrent.
- Servicio compatible con OpenAI: al exponer chat completions, completions y `/v1/models`, puede sustituir a otros backends en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye una evaluación de fidelidad por teacher forcing contra el modelo de Hugging Face (transformers 5.24, CPU) sobre 8 textos reservados (chat en tres idiomas, código, documentación y programación competitiva):

| Ruta | Top-1 | Top-1 (tokens con confianza) | KL |
|---|---:|---:|---:|
| Suelo de ruido de referencia: fp32 vs bf16 en CPU | 0.975 | 0.998 | 0.010 |
| Prefill (1 die, 8 x 1000 tokens) | 0.970 | 0.997 | 0.014 |
| Decode (1 die, 8 x 736 pasos) | no disponible (dato truncado en la información) | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware soportado: Tenstorrent p150, p150x2, p150x4, p300 y p300x2 (no GPU convencionales).
- Perfil p300x2: dos placas p300 (4 dies, tensor parallel 4), 32 secuencias, hasta 1.048.576 tokens por petición, pool KV de 1.7M tokens; el perfil más rápido.
- Perfil p150x4: cuatro placas p150 (4 dies), misma configuración que p300x2.
- Perfil p300 (por defecto): una placa p300 (2 dies, tensor parallel 2), 16 secuencias, contexto de 491.520 tokens.
- Perfil p150x2: dos placas p150 (2 dies), misma configuración que p300.
- Perfil p150: un solo die, 8 secuencias, contexto de 32.768 tokens, decodificación especulativa para secuencias menores de 8.192 tokens; los expertos en bfp8 ocupan 27 de los 31,5 GiB del die.
- Perfil p150-long: un solo die, 8 secuencias, contexto de 49.152 tokens, solo texto, sin decodificación especulativa.
- Despliegue: `tt serve raahemnabeel/inkling-2-mini` (Tenstorrent CLI) o `tt-model serve`; servidor compatible con OpenAI en el puerto 20000. Requiere Docker y compilación de kernels en el primer arranque (varios minutos).
- VRAM: no aplica (hardware Tenstorrent); la memoria del die se describe en el perfil p150 (31,5 GiB, de los cuales 27 GiB para expertos bfp8).
- Latencia y throughput: no disponibles (solo se indica que p300x2 es el perfil más rápido y que la decodificación especulativa solo se aplica con una única petición decodificando).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el propio checkpoint base (thinkingmachines/Inkling-2-Mini) es la alternativa directa, pero no se dispone de sus cifras de benchmarks ni de comparaciones publicadas en esta información.

## Limitaciones y advertencias

- No se han publicado datos de sesgos, alucinación ni evaluaciones de seguridad en la información disponible.
- La decodificación especulativa solo se activa cuando una única petición está decodificando; con más peticiones concurrentes se decodifica un token por paso para todas, lo que reduce el rendimiento.
- El perfil p150 tiene un contexto limitado a 32.768 tokens y la decodificación especulativa solo funciona para secuencias menores de 8.192 tokens; el perfil p150-long es solo texto.
- Las imágenes mayores de 4.095 tokens (parches de 40 x 40 píxeles) se rechazan con HTTP 400, lo que limita la resolución de entrada.
- El modelo razona por defecto antes de responder, por lo que es necesario asignar un `max_tokens` amplio o desactivar el razonamiento por petición.
- El primer arranque requiere compilar kernels para el dispositivo, con varios minutos de espera.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del checkpoint base y de las dependencias del paquete de servicio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; se trata de un empaquetado reciente sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raahemnabeel/inkling-2-mini
- Checkpoint base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Tenstorrent tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
