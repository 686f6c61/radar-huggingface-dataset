# Ryoppi/Qwen3.5-2B-judge-QNN

## Resumen

Ryoppi/Qwen3.5-2B-judge-QNN es un paquete de binarios de contexto QNN precompilados para el HTP (NPU Hexagon) de Qualcomm, generados a partir del modelo multimodal Qwen/Qwen3.5-2B. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es el resultado de compilar el modelo base con ONNX Runtime QNN EP (onnxruntime-qnn 2.7.0, QNN SDK 2.51) en formato EPContext, de modo que la inferencia se ejecute íntegramente en la NPU de un SoC Snapdragon en lugar de en CPU o GPU.

El artefacto está especializado en una tarea very concreta: la app Android UltraAlarm lo utiliza para decidir, a partir de una única imagen de cámara, si hay una persona presente y si está dormida. La entrada es una imagen con letterbox a 512×384 (tensor `pixel_values` de forma [768, 1536]) y la salida son los logits de 8 tokens de respuesta para dos preguntas fijas, es decir, el modelo se emplea como un clasificador visual restringido, no como un generador de texto libre.

Su relevancia es fundamentalmente práctica para el despliegue en dispositivos: demuestra cómo llevar un VLM de ~2B parámetros a la NPU de un móvil Android con cuantización w8a16 y contextos compartidos entre subgrafos, manteniendo la licencia Apache 2.0 del modelo base. El repositorio ocupa 12,5 GB porque incluye las compilaciones para cuatro generaciones de Hexagon (v73, v75, v79 y v81), los ficheros `.onnx` y los binarios comprimidos con gzip.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen/Qwen3.5-2B (detalles de arquitectura no disponibles en la información proporcionada); empaquetado como cinco grafos ONNX EPContext (vision, part0–part3) compilados para Qualcomm HTP |
| Parámetros totales | ~2B según el nombre del modelo base (no confirmado en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible; el uso documentado está limitado a una imagen de entrada y 8 tokens de salida para dos preguntas fijas |
| Tipos de cuantización | w8a16 en MatMul/Gemm (pesos int8 por canal, activaciones uint16); resto de operadores en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (idéntica al modelo base) |
| Formato de pesos | ONNX (`.onnx`) + binarios de contexto QNN (`.bin` y `.bin.gz`); no hay safetensors ni GGUF |
| Entrada | imagen con letterbox a 512×384, tensor `pixel_values` [768, 1536] |
| Salida | logits de 8 tokens de respuesta para dos preguntas fijas |
| Variantes incluidas | v73 (Snapdragon 8 Gen 2), v75 (8 Gen 3), v79 (8 Elite), v81 (8 Elite Gen 5) |
| Tamaño del repositorio | 12,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no aporta entrenamiento propio: hereda íntegramente los pesos y el comportamiento del modelo base Qwen/Qwen3.5-2B, del que no se detallan en la información disponible la composición del dataset, el número de tokens vistos ni si hubo fases de RLHF o DPO. Lo que sí está documentado es el proceso de compilación: los cinco subgrafos (`vision`, `part0`, `part1`, `part2`, `part3`) se compilaron con ONNX Runtime QNN EP 2.7.0 sobre QNN SDK 2.51, generando modelos EPContext específicos por generación de Hexagon.

La innovación técnica relevante es la gestión de memoria en la NPU. Los cinco modelos comparten solo dos binarios de contexto (`vision_384x512_qnn.bin` para vision, part0 y part1; `part2_384x512_qnn.bin` para part2 y part3), de forma que todos los grafos permanecen en un único dominio de proceso HTP de aproximadamente 1,9 GB. Para lograrlo hay que cargar los modelos con `ep.share_ep_contexts=1`. La cuantización es mixta: se aplica w8a16 únicamente a MatMul y Gemm, dejando el resto de operadores en fp16, un compromiso habitual para preservar precisión en capas sensibles (por ejemplo, las de visión) sin disparar el coste computacional de las multiplicaciones matriciales.

## Capacidades

- Clasificación visual binaria sobre una imagen fija de cámara: determinar si hay una persona presente y si está dormida, respondiendo a dos preguntas predefinidas.
- Salida restringida a los logits de 8 tokens de respuesta; no se documenta generación de texto libre ni decodificación abierta.
- Procesamiento de una sola imagen por inferencia, con preprocesado obligatorio de letterbox a 512×384.
- Ejecución íntegra en la NPU Hexagon del SoC, sin intervención de CPU o GPU para los operadores compilados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas (los idiomas del modelo base no se indican en la información disponible).
- Modo thinking, visión general, audio: no disponible más allá del caso de uso de inspección visual descrito.

## Casos de uso

- Detección de presencia y sueño en la app UltraAlarm: el paquete se carga en la NPU del teléfono y responde, a partir de una imagen de cámara, si hay alguien delante y si está dormido. Es el escenario para el que fue compilado y el único documentado por el autor.
- Domótica y automatización del hogar: integrado en una app Android, permite apagar la pantalla, bajar la iluminación o silenciar notificaciones cuando detecta a una persona dormida, ejecutando la inferencia en local sin enviar vídeo a la nube.
- Monitorización de pacientes o personas mayores en entornos domésticos: al correr sobre la NPU, el consumo energético y la latencia permiten inferencias periódicas sin agotar la batería, y ningún fotograma sale del dispositivo.
- Control de presencia en puestos de trabajo o aulas: el modelo actúa como un sensor de estado (presente / ausente / dormido) que alimenta un panel de disponibilidad, reutilizando el mismo binario compilado para Snapdragon 8 Gen 2 o superior.
- Ahorro energético en kioscos y paneles informativos: la detección de ausencia de personas permite suspender la pantalla o reducir la frecuencia de refresco, con la ventaja de que la decisión se toma en el propio SoC y no requiere conectividad.
- Investigación en despliegue de VLMs en NPU móvil: sirve como referencia reproducible de compilación EPContext con contextos compartidos (`ep.share_ep_contexts=1`), cuantización w8a16 selectiva y particionado de grafos para estudiar latencias y consumo en Hexagon.
- Evaluación comparativa de generaciones de Hexagon: al incluir las variantes v73, v75, v79 y v81, permite medir el mismo modelo sobre cuatro generaciones de NPU con un único pipeline de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, latencia ni throughput, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM en GPU: no aplica. Los binarios EPContext están compilados para el HTP de Qualcomm y no se ejecutan sobre CUDA.
- Memoria en NPU: aproximadamente 1,9 GB en total para el conjunto de contextos compartidos, siempre que se cargue con `ep.share_ep_contexts=1`.
- Almacenamiento: 12,5 GB de repositorio, ya que incluye las cuatro variantes de Hexagon, los `.onnx` y los `.bin.gz`; en el dispositivo solo hay que desplegar la variante correspondiente y descomprimir los `.bin.gz` junto a los `.onnx` antes de cargar.
- SoCs compatibles: Snapdragon 8 Gen 2 (Hexagon v73), 8 Gen 3 (v75), 8 Elite (v79) y 8 Elite Gen 5 (v81). No se documenta compatibilidad con otras generaciones ni con GPU Adreno.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles; este artefacto no está pensado para ellas.
- ¿Cabe en hardware de consumo? Sí, en el sentido de que el destino es un teléfono Android con Snapdragon de gama alta; no es ejecutable en un PC convencional sin una NPU Hexagon equivalente.
- Opciones de despliegue: ONNX Runtime con el execution provider QNN (`onnxruntime-qnn` 2.7.0) y las librerías de runtime de QNN SDK 2.51, que no se distribuyen en el repositorio. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Destino de ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ryoppi/Qwen3.5-2B-judge-QNN | ~2B (según nombre del base, no confirmado) | no disponible; uso restringido a una imagen y 8 tokens de salida | ONNX + binarios EPContext QNN | NPU Hexagon (Snapdragon 8 Gen 2 a 8 Elite Gen 5) | Apache 2.0 | Público en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2B (según nombre, no confirmado) | no disponible | no disponible en la información proporcionada | Genérico (pesos originales) | Apache 2.0 | Público en HuggingFace |
| Otras compilaciones QNN de VLMs pequeños | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en la información proporcionada, por lo que la comparación se limita a formato, destino de ejecución y licencia.

## Limitaciones y advertencias

- No es un modelo de propósito general: la entrada está fijada a una imagen 512×384 y la salida a los logits de 8 tokens para dos preguntas concretas. No admite prompts arbitrarios ni generación de texto abierta.
- Los binarios son específicos del HTP: un `.bin` compilado para v73 no funciona en v79 ni en GPU. Es necesario desplegar la carpeta correspondiente a la generación de Hexagon del dispositivo.
- Las librerías de runtime de QNN no se incluyen en el repositorio; sin ellas los binarios no arrancan. Tampoco se incluyen librerías propietarias de Qualcomm, según indica el autor, pero la cadena de herramientas sí es necesaria.
- Hay que descomprimir los ficheros `*_qnn.bin.gz` junto a los `.onnx` antes de cargar y usar `ep.share_ep_contexts=1`; obviar cualquiera de los dos pasos provoca fallos de carga o duplica el consumo de memoria.
- Licencia Apache 2.0, igual que el modelo base: permite uso comercial y modificación, pero conviene verificar las condiciones de las librerías de QNN SDK distribuidas por Qualcomm, que se rigen por sus propios términos y no por la licencia del repositorio.
- Sesgos: no documentados. Al tratarse de un juicio visual sobre personas, existe riesgo de sesgo demográfico, de iluminación y de ángulo de cámara heredado del modelo base y del dataset de entrenamiento original, no evaluado en la model card.
- Riesgo de alucinación y de falsos positivos/negativos en la detección de sueño: no se publican métricas de precisión, por lo que no debe usarse como único criterio en aplicaciones críticas (por ejemplo, monitorización médica real).
- Idiomas y cobertura multilingüe: no disponibles.
- Contexto: no disponible; el uso documentado no requiere ventana de contexto larga.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ryoppi/Qwen3.5-2B-judge-QNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
