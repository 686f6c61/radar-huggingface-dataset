# qualcomm-ai-hub-community/Qwen3-4B-Instruct-2507-Hi-Fi-fraQtl

## Resumen

El modelo `Qwen3-4B-Instruct-2507-Hi-Fi-fraQtl` es una cuantización GGUF del modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollada por fraQtl en colaboración con Qualcomm AI Hub. Su objetivo es ofrecer una versión reducida del LLM de 4.022 millones de parámetros para despliegue on-device, manteniendo la máxima fidelidad posible respecto a los pesos originales en formato bf16. La propuesta de valor principal es una cuantización calibration-aware (con imatrix de código y matemáticas) que, según los datos publicados, reduce la divergencia KLD frente a las cuantizaciones comunitarias más extendidas (MaziyarPanahi y unsloth) en la clase Q4_K_M.

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only multilingüe con 4.000 millones de parámetros, entrenado exclusivamente con instrucciones (sin modo thinking), que destaca en comprensión del lenguaje, generación, codificación y matemáticas. La versión cuantizada conserva la ventana de contexto nativa de 262.144 tokens, verificada mediante pruebas de recuperación de aguja (needle retrieval) al máximo contexto. Se distribuye en dos artefactos: un Q4_K_M de alta fidelidad (2,50 GB) y un Q4_0 en formato fijo NPU (2,38 GB), ambos compatibles con llama.cpp y GenieX.

La relevancia de este modelo radica en que aborda el problema clásico de la cuantización: la pérdida de calidad. Al incorporar calibración con imatrix específica y verificar la fidelidad mediante KLD y pruebas de contexto largo, ofrece una alternativa rigurosa para equipos que necesitan desplegar un LLM de 4B en dispositivos con recursos limitados sin renunciar a la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | Q4_K_M (Hi-Fi), Q4_0 (formato fijo NPU) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero la ficha no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer decoder-only con 4.000 millones de parámetros, entrenado por Alibaba Cloud con un enfoque exclusivamente instruct (sin soporte de modo thinking). La variante cuantizada no modifica la arquitectura, sino que aplica cuantización per-tensor de 4 bits sobre los pesos originales en bf16.

La innovación técnica de esta build reside en el proceso de calibración: fraQtl ha generado una imatrix (importance matrix) específica a partir de datos de código y matemáticas, que se utiliza para guiar la cuantización Q4_K_M y Q4_0. Según los datos publicados, esta calibración reduce la divergencia KLD (Kullback-Leibler divergence) frente a las cuantizaciones comunitarias estándar: un 55,9% menos en tareas de código/matemáticas y un 46,4% menos en tareas generales comparado con la build de MaziyarPanahi, y mejoras del 15,7% y 20,8% respectivamente frente a la de unsloth. Para el Q4_0, la calibración aislada produce una mejora del 14,9% en código/matemáticas y del 9,2% en general frente a una cuantización naive sin imatrix.

El proceso de verificación incluye pruebas de recuperación de aguja (needle exact-match) a tres profundidades y tres claves por contexto, con resultados perfectos: 18/18 a 8K y 32K tokens, y 9/9 al máximo de 262.144 tokens. No se ha realizado entrenamiento adicional ni fine-tuning; se trata exclusivamente de una cuantización de pesos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-4B-Instruct-2507, que destaca en comprensión del lenguaje y generación coherente.
- Codificación y matemáticas: el modelo base está optimizado para estas tareas, y la imatrix de calibración se ha construido específicamente con datos de código y matemáticas para preservar esta capacidad.
- Multilingüe: el modelo base es multilingüe, aunque la ficha no detalla la lista de idiomas soportados.
- Contexto largo: ventana de 262.144 tokens verificada mediante pruebas de recuperación, lo que permite procesar documentos extensos en una sola pasada.
- Sin modo thinking: a diferencia de otras variantes de Qwen3, este modelo no incluye razonamiento explícito tipo thinking mode.
- Tool calling y function calling: no se especifica en la información disponible; el modelo base Qwen3-4B-Instruct-2507 sí soporta estas capacidades, pero no hay confirmación explícita para esta cuantización.
- Compatibilidad con llama.cpp y GenieX: los artefactos GGUF funcionan sin modificaciones en ambos runtimes.

## Casos de uso

- Asistentes conversacionales on-device: el tamaño de 2,5 GB permite ejecutar el modelo en smartphones y dispositivos edge con 4-6 GB de RAM, ofreciendo respuestas de alta calidad sin conexión a servidores.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir, analizar o extraer información de contratos, informes técnicos o libros completos en una sola pasada, algo inviable con modelos de contexto corto.
- Generación de código en entornos con recursos limitados: ideal para IDEs embebidos o herramientas de autocompletado en portátiles sin GPU dedicada, gracias a la calibración específica para código y matemáticas.
- RAG (Retrieval-Augmented Generation) con contexto amplio: la ventana de 262K permite inyectar grandes volúmenes de documentos recuperados sin fragmentación, mejorando la calidad de las respuestas en sistemas de búsqueda semántica.
- Chatbots de atención al cliente en dispositivos locales: empresas que requieren privacidad de datos pueden desplegar el modelo en hardware propio o en el dispositivo del usuario, evitando el envío de información sensible a la nube.
- Prototipado y pruebas de concepto: al ser un GGUF compatible con llama.cpp, los desarrolladores pueden iterar rápidamente en CPU o GPU de gama media antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento cuantitativos son las métricas de fidelidad KLD y las pruebas de recuperación de contexto largo, que se resumen a continuación.

| Metrica | fraQtl Hi-Fi Q4_K_M | MaziyarPanahi Q4_K_M | unsloth Q4_K_M |
|---|---|---|---|
| KLD codigo/matematicas (menor es mejor) | 0,025317 | 0,057372 | 0,030018 |
| KLD general (menor es mejor) | 0,033753 | 0,063008 | 0,042626 |
| Tamano del archivo | 2.496.879.712 bytes | 2.497.280.448 bytes | 2.497.281.120 bytes |

| Metrica | fraQtl Q4_0 (con imatrix) | naive Q4_0 (sin imatrix) | GenieX-designated Q4_0 (unsloth) |
|---|---|---|---|
| KLD codigo/matematicas | 0,059665 | 0,070135 | 0,060996 |
| KLD general | 0,080458 | 0,088598 | 0,077572 |

Pruebas de recuperacion de contexto largo: 18/18 aciertos a 8K y 32K tokens (3 ejecuciones), y 9/9 aciertos a 262.144 tokens (2 ejecuciones).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para el Q4_K_M y 2,38 GB para el Q4_0, más overhead de KV cache. Con contexto largo (262K), la memoria de KV cache puede superar los 4 GB adicionales, por lo que se recomienda al menos 8 GB de RAM/VRAM para uso intensivo.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo con contexto moderado. Para contexto máximo, se recomiendan GPUs con 8 GB o más (RTX 3060, RTX 4070, A100).
- Compatibilidad con CPU: al ser GGUF, funciona en CPU pura con llama.cpp, aunque la latencia será mayor. Es viable en portátiles modernos con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (CPU/GPU), GenieX (según el equipo de AI Hub). No se ha verificado la ejecución en NPU/Hexagon de Qualcomm, aunque el Q4_0 está diseñado como formato nativo NPU.
- Latencia y throughput: no se han publicado datos específicos. Como referencia orientativa, un Q4_K_M de 4B en una RTX 3060 suele generar entre 20 y 40 tokens por segundo, pero esto no está confirmado para esta build.

## Comparativa con modelos similares

La comparativa más relevante es contra otras cuantizaciones GGUF del mismo modelo base, ya que comparten arquitectura y pesos originales. No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

| Modelo | Tamano archivo | KLD codigo/matematicas | KLD general | Licencia | Runtime |
|---|---|---|---|---|---|
| fraQtl Hi-Fi Q4_K_M (este) | 2,50 GB | 0,025317 | 0,033753 | Apache-2.0 | llama.cpp, GenieX |
| MaziyarPanahi Q4_K_M | 2,50 GB | 0,057372 | 0,063008 | Apache-2.0 | llama.cpp |
| unsloth Q4_K_M | 2,50 GB | 0,030018 | 0,042626 | Apache-2.0 | llama.cpp |
| fraQtl Q4_0 (este) | 2,38 GB | 0,059665 | 0,080458 | Apache-2.0 | llama.cpp, GenieX |
| unsloth Q4_0 (GenieX-designated) | 2,38 GB | 0,060996 | 0,077572 | Apache-2.0 | llama.cpp, GenieX |

En cuanto a alternativas de otros modelos de 4B, no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sin modo thinking: el modelo base Qwen3-4B-Instruct-2507 no incluye razonamiento explícito tipo thinking mode, a diferencia de otras variantes de Qwen3. Esto puede limitar su rendimiento en tareas de razonamiento complejo.
- Cuantización de 4 bits: aunque la calibración reduce la divergencia, la cuantización Q4 introduce inevitablemente pérdida de precisión frente al modelo bf16 original. Para tareas que requieran máxima exactitud numérica, se recomienda usar el modelo sin cuantizar.
- Ejecución en NPU no verificada: el Q4_0 está diseñado como formato nativo NPU, pero la model card indica explícitamente que la ejecución en NPU/Hexagon no está verificada. No se debe asumir aceleración por hardware Qualcomm sin pruebas.
- Modelo nuevo y sin adopción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Aunque los datos de fidelidad son sólidos, la falta de uso comunitario implica que no hay retroalimentación sobre problemas en producción.
- Idiomas no especificados: la ficha no detalla qué idiomas soporta la cuantización, aunque el modelo base es multilingüe. Se recomienda verificar el comportamiento en el idioma objetivo antes de desplegar.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento o con contexto ambiguo. La cuantización no mitiga este riesgo.
- Sesgos: no se han publicado evaluaciones de sesgo para esta cuantización. El modelo base puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/qualcomm-ai-hub-community/Qwen3-4B-Instruct-2507-Hi-Fi-fraQtl
- Repositorio canonico con recibos completos: https://huggingface.co/fraQtl/Qwen3-4B-Instruct-2507-Hi-Fi-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Pagina de Qualcomm AI Hub para Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
