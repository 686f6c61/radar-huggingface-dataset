# litert-community/Qwen3.5-4B

## Resumen

Qwen3.5-4B en formato LiteRT-LM es la conversión del modelo Qwen/Qwen3.5-4B de Alibaba al runtime on-device de Google, LiteRT (el nuevo nombre de TensorFlow Lite), empaquetado en el contenedor `.litertlm` para inferencia local en dispositivos edge. El modelo base emplea una arquitectura híbrida propietaria de Qwen3.5 que combina bloques de atención lineal GatedDeltaNet (regla delta con compuertas) intercalados con un número reducido de bloques de atención completa con compuertas; en esta variante de 4B hay 24 capas de atención lineal y 8 de atención completa. Los bloques lineales mantienen un estado recurrente de tamaño constante por capa en lugar de una caché KV que crece con el contexto, de modo que el consumo de memoria permanece prácticamente plano respecto a la longitud de la secuencia.

El paquete lo publica el colectivo litert-community y deriva del checkpoint multimodal original de Alibaba, aunque aquí se distribuye únicamente el decodificador de texto: la torre de visión y las cabezas MTP se han eliminado siguiendo el contrato de carga text-only de `Qwen3_5ForCausalLM`. La licencia es Apache 2.0 y el repositorio ocupa 61,6 GB, con varios ficheros cuantizados de entre 2,71 GB y 4,42 GB según receta y backend.

Su relevancia actual radica en que permite ejecutar un modelo de 4B con ventana de contexto efectiva de 4096 tokens en GPU y CPU de dispositivos móviles y equipos de sobremesa, con versiones específicas para el backend GPU de LiteRT-LM 0.19.x y para CPU. No obstante, la model card documenta incidencias de corrección en el fichero int8 sobre CPU (respuestas que se alargan hasta el límite de tokens en aritmética multi-paso) y repeticiones en GPU pasados los 400 tokens, corregidas parcialmente en la recuantización del 13 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas de atención lineal GatedDeltaNet + 8 capas de atención completa con compuertas |
| Parametros totales | 4B (aproximado, según denominación del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 8 capas de atención; estado recurrente constante en las 24 lineales |
| Tipos de cuantizacion | int4 blockwise-32, int8 dinámico, mixed int4 (int4 en lineales + int8 en embedding y lm_head), proyecciones decay/gate en float |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido en el que la mayoría de capas (24 de 32) usan atención lineal basada en la regla delta con compuertas (GatedDeltaNet), y solo 8 capas emplean atención completa con compuertas. Las capas lineales sustituyen la caché KV por un estado convolucional y recurrente de tamaño fijo por capa, lo que reduce drásticamente el crecimiento de memoria con la longitud de contexto; únicamente las 8 capas de atención retienen KV, con un presupuesto de 4096 tokens. Esta combinación busca el equilibrio entre eficiencia en dispositivos y calidad de recuperación de información a larga distancia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión a LiteRT-LM se realizó con `litert-torch` (antiguo ai-edge-torch) y sigue la misma ruta que la variante Qwen3.5-0.8B del mismo colectivo, con dos correcciones específicas para el 4B documentadas en las notas de conversión. Los ficheros del 14 de noviembre de 2026 son exportaciones del grafo Qwen3.5 propio de litert-torch e incluyen composites GPU con activaciones declaradas en fp32. La conversión preserva el tokenizador y los metadatos del ejecutor, y la model card reporta que una conversión sin modificar con `litert_torch.convert` coincidió con el original hasta 4e-7 en un Galaxy S26 con LiteRT 2.2.0.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con la forma de content-parts de LiteRT-LM 0.18.
- Modo de razonamiento (thinking) con canal de razonamiento separado y conmutador en la plantilla de chat, según los metadatos actualizados el 9 de octubre de 2026.
- Aritmética multi-paso: la model card documenta pruebas con multiplicaciones encadenadas (por ejemplo, 36 × 25) y evalúa la corrección de las respuestas.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B.
- Inferencia on-device en CPU y GPU mediante LiteRT-LM, con ficheros optimizados por backend.
- No incluye capacidades de visión: la torre multimodal del checkpoint original se ha eliminado en este paquete.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales en Android: el modelo puede gestionarse con LiteRT-LM ≥ 0.15 en el runtime `com.google.ai.edge.litert:litert`, manteniendo conversaciones multi-turno sin conexión y con un consumo de memoria casi constante gracias a las 24 capas de atención lineal.
- Aplicaciones de privacidad estricta en dispositivos: al ejecutarse íntegramente on-device, permite procesar texto sensible (notas, correos, historiales) sin enviar datos a servidores externos, usando el fichero int8 de 4,42 GB en CPU.
- Prototipado en equipos de sobremesa con GPU: los ficheros `mixed_int4_gpu_composite_v0190` (2,71 GB) y `int8_gpu_composite_v0190` (4,37 GB) permiten probar el modelo en Mac y estaciones con GPU bajo LiteRT-LM 0.19.x.
- Razonamiento aritmético y de sentido común en asistentes de productividad: el modo thinking con canal de razonamiento permite separar el proceso interno de la respuesta final, útil en calculadoras conversacionales o tutores educativos, siempre con presupuesto de tokens controlado.
- Evaluación comparativa de runtimes edge: sirve como banco de pruebas para medir latencia y corrección entre backends CPU y GPU de LiteRT-LM, dado que la model card documenta diferencias de comportamiento entre ellos.
- Integración en apps Android mediante el runtime LiteRT: el formato `.litertlm` y las dependencias de Gradle permiten embeber el modelo en aplicaciones nativas sin infraestructura de servidor.
- Investigación sobre arquitecturas híbridas de atención: al conservar la estructura GatedDeltaNet, es útil para estudiar el comportamiento de la atención lineal frente a la completa en tareas de contexto medio (hasta 4096 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente mediciones de corrección cualitativa (por ejemplo, repeticiones en GPU pasados los 400 tokens en el fichero int8, y respuestas que alcanzan el límite de tokens en 7 de 18 ejecuciones de aritmética multi-paso en CPU antes de la recuantización del 13 de octubre de 2026) y una medición de fidelidad de conversión de 4e-7 frente al modelo original en un Galaxy S26.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,71 GB con `mixed_int4_gpu_composite_v0190`; 2,75 GB con `mixed_int4`; 4,37 GB con `int8_gpu_composite_v0190`; 4,42 GB con `int8` para CPU.
- GPU recomendadas: no se especifican modelos concretos; los ficheros GPU están pensados para LiteRT-LM 0.19.x con composites GPU. La model card menciona pruebas en Galaxy S26 (Android 16) y en Mac.
- Compatibilidad con GPU de consumo: no se detalla; el tamaño de 2,71 GB en int4 mixto sugiere que puede caber en GPUs integradas y de gama media, pero no hay confirmación explícita.
- Opciones de despliegue: LiteRT-LM ≥ 0.15 (probado en 0.15.0, 0.16.0, 0.18.0 y 0.19.x), con backend CPU y GPU; runtime Android `com.google.ai.edge.litert:litert`; CLI de Android (build del 18 de septiembre de 2026).
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de compatibilidad: el fichero `mixed_int4` (no composite) no funciona en un Pixel 11 Pro según las incidencias conocidas del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B (LiteRT-LM, este) | 4B | 4096 tokens KV + estado recurrente constante | Apache 2.0 | `.litertlm`, on-device |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | no disponible | Apache 2.0 | `.litertlm`, on-device |
| Qwen/Qwen3.5-4B (original) | 4B | no disponible | Apache 2.0 | safetensors, multimodal con torre de visión y cabezas MTP |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete es solo el decodificador de texto: no incluye visión ni cabezas MTP, por lo que no puede usarse para tareas multimodales.
- Presupuesto de contexto limitado a 4096 tokens en las capas de atención; las capas lineales no amplían la ventana efectiva más allá de ese límite.
- Incidencia documentada en CPU con el fichero int8 anterior al 13 de octubre de 2026: respuestas que no se detenían antes del límite de tokens en aritmética multi-paso (7 de 18 ejecuciones, una sin respuesta) y pensamientos que no se cerraban con thinking activado sin presupuesto. Corregido en la recuantización, pero conviene verificar la versión del fichero.
- En GPU, el fichero int8 repite dos líneas tras la respuesta cuando supera los 400 tokens, tanto en la variante int8 como en la int8_gpu_composite; comportamiento no observado en el fichero mixed_int4_gpu_composite.
- El fichero `mixed_int4` (no composite) no funciona en Pixel 11 Pro según las incidencias del runtime.
- Requiere LiteRT-LM ≥ 0.15; los ficheros GPU composite requieren 0.19.x, lo que limita la compatibilidad con versiones anteriores.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales (atribución y aviso de cambios).
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación propia.
- El repositorio de 61,6 GB incluye múltiples variantes; la descarga completa no es necesaria, pero conviene seleccionar el fichero adecuado al backend para evitar fallos de ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0.8B del mismo colectivo: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de fidelidad de conversión (LiteRT 2.2.0, Galaxy S26): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
