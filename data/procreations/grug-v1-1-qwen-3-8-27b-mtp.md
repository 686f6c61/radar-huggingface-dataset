# ProCreations/grug-v1.1-qwen-3.8-27b-mtp

## Resumen

grug-v1.1-qwen-3.8-27b-mtp es una variante del modelo grug-v1.1-qwen-3.8-27b, desarrollada por ProCreations, que incorpora una cabeza de predicción multi-token (MTP) afinada para acelerar la inferencia mediante decodificación especulativa. El modelo base es un fine-tune de Qwen3.8 27B, un transformer de 27 000 millones de parámetros con capacidades de visión y texto, orientado a tareas de agente, tool calling y razonamiento. Esta variante no modifica los pesos del modelo verificado: solo añade una cabeza de borrador que predice el token t+2, de modo que los motores compatibles pueden verificar varios tokens en una sola pasada y reducir la latencia sin cambiar la salida.

La relevancia de este lanzamiento radica en que aborda uno de los principales cuellos de botella de los modelos de 27B en producción: el coste de generación token a token. Al reentrenar la cabeza MTP nativa de Qwen3.8 sobre la distribución real de salidas de grug, se consigue un acuerdo con el verificador del 95,37% (frente al 90,04% de la cabeza original), lo que reduce la tasa de desacuerdo de 1 entre 10 a 1 entre 21. El entrenamiento fue rápido y económico: 4 millones de tokens, 489 pasos y 26 minutos en una RTX PRO 6000, con el backbone congelado.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors y GGUF, y está pensado para motores de inferencia que soporten el protocolo MTP de Qwen3.8, como vLLM o sglang. Para usuarios de transformers estándar, el modelo funciona igual que el base, simplemente sin la aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con visión (image-text-to-text), basado en Qwen3.8 27B |
| Parametros totales | 27 356 728 560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la tarjeta) |
| Tipos de cuantizacion | GGUF disponible (sin detalle de tipos concretos en la informacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo principal) y GGUF (variantes con y sin cabeza MTP) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.8 27B, un transformer denso con capacidades multimodales (imagen y texto). La arquitectura base incluye una cabeza MTP nativa que predice el token t+2, diseñada para decodificación especulativa. En esta variante, el backbone permanece congelado y solo se entrena el módulo `mtp.*`, que contiene 425 millones de parámetros. El entrenamiento utiliza self-distillation: el profesor es el propio grug-v1.1-qwen-3.8-27b, que genera sus elecciones greedy de siguiente token, de modo que la cabeza de borrador aprende a alinearse con el verificador real.

Los datos de entrenamiento provienen del dataset ProCreations/grug-27b-v2-corrective, que incluye trayectorias de agentes, llamadas a herramientas, pensamiento interno de grug, código y matemáticas, es decir, la distribución real de uso del modelo. Se procesaron 4,0 millones de tokens, de los cuales 1,25 millones fueron supervisados, en 489 pasos y 26 minutos en una RTX PRO 6000. El resultado es una cabeza MTP con un acuerdo top-1 con el verificador del 95,37% (frente al 90,04% de la cabeza nativa), una mejora en gold top-1 del 85,50% al 88,20% y una reducción de la pérdida de evaluación de 0,3802 a 0,1649. Es importante señalar que la mejora de velocidad no está medida en tiempo real de pared, sino en tasa de aceptación de borradores.

## Capacidades

- Generacion de texto y razonamiento: el modelo base grug-v1.1 está optimizado para tareas de razonamiento complejo, con un modo de pensamiento interno ("grug think") que precede a las respuestas.
- Codigo y matematicas: los datos de entrenamiento incluyen código y problemas matemáticos, lo que le permite generar y depurar código, así como resolver problemas numéricos.
- Tool calling y funciones: soporta llamadas a herramientas y parser de tool calls compatible con Qwen3 Coder, lo que lo hace apto para integraciones con APIs y agentes.
- Capacidades de agente: entrenado con trayectorias de agentes, puede ejecutar flujos multi-paso y tomar decisiones secuenciales.
- Vision (heredada): al ser un modelo image-text-to-text, puede procesar imágenes junto con texto, aunque no se detallan capacidades específicas en la tarjeta.
- Decodificacion especulativa: la cabeza MTP afinada permite a motores compatibles (vLLM, sglang) verificar múltiples tokens por pasada, acelerando la inferencia sin cambiar la salida.
- Multilingue: solo inglés declarado.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede gestionar conversaciones multi-turno, decidir qué herramienta invocar y procesar los resultados, gracias a su soporte nativo de tool calling y su entrenamiento en trayectorias de agente. Es adecuado para asistentes que necesitan consultar APIs, bases de datos o ejecutar acciones.
- Generacion de codigo en produccion: con capacidades de código y matemáticas, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o autocompletar implementaciones. La decodificación especulativa reduce la latencia en entornos de alta concurrencia.
- Atencion al cliente automatizada: aunque solo soporta inglés, puede manejar consultas complejas con contexto largo (si el modelo base lo permite) y derivar a un humano cuando sea necesario. Su modo de razonamiento ayuda a mantener coherencia en diálogos largos.
- Analisis de datos y generacion de informes: puede procesar datos tabulares o textuales, generar resúmenes y explicar hallazgos, aprovechando su capacidad de razonamiento y generación estructurada.
- Asistentes de investigacion: para tareas de búsqueda bibliográfica, extracción de información y síntesis de documentos, el modelo puede combinar tool calling con razonamiento multi-paso.
- Prototipado rapido de aplicaciones LLM: al ser Apache 2.0 y tener versiones GGUF, se puede desplegar en entornos de desarrollo con GPUs de consumo para iterar rápidamente sobre prompts y flujos de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante. La model card indica que los benchmarks y la tabla de esfuerzo viven en la tarjeta principal del modelo base (ProCreations/grug-v1.1-qwen-3.8-27b) y que esta variante tiene una puntuación idéntica, ya que los pesos verificados no cambian. Sin embargo, no se proporcionan los números concretos en esta ficha. Se recomienda consultar la tarjeta principal para obtener datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 55,6 GB, lo que sugiere pesos en fp16/bf16. Para cargar el modelo completo en fp16 se necesitan aproximadamente 56 GB de VRAM. Con cuantización GGUF (por ejemplo, Q4_K_M), la huella podría reducirse a unos 16-18 GB, aunque no se especifican los tipos de cuantización disponibles.
- GPU recomendadas: para fp16, una GPU con 64 GB o más (A100 80GB, H100 80GB) o dos GPUs de 32 GB en paralelo. Para cuantización, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente, dependiendo del tipo de cuantización.
- Compatibilidad con consumer GPU: sí, mediante versiones GGUF y motores como llama.cpp u Ollama, aunque la aceleración MTP solo está disponible en motores que la soporten (vLLM, sglang).
- Opciones de despliegue: vLLM (con configuración `--speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":2}'`), sglang, transformers estándar (sin aceleración), y GGUF para llama.cpp/Ollama.
- Latencia y throughput: no se proporcionan mediciones de velocidad en tiempo real. La mejora esperada depende del motor, el tamaño de lote y la longitud del borrador. La tasa de aceptación del 95,37% sugiere una reducción significativa de pasos de decodificación, pero no se cuantifica en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP / Speculative | Licencia | Formato |
|---|---|---|---|---|---|
| grug-v1.1-qwen-3.8-27b-mtp (este) | 27,36B | No disponible | Sí, cabeza afinada (95,37% acuerdo) | Apache 2.0 | safetensors, GGUF |
| grug-v1.1-qwen-3.8-27b (base) | 27,36B | No disponible | No (solo cabeza nativa 90,04%) | Apache 2.0 | safetensors, GGUF |
| Qwen3.8 27B (original) | 27B | No disponible | Sí, cabeza nativa | Apache 2.0 | safetensors, GGUF |

La diferencia principal entre esta variante y el modelo base es la cabeza MTP afinada, que mejora la tasa de acuerdo con el verificador en 5,33 puntos porcentuales. Frente al Qwen3.8 original, grug añade un fine-tune orientado a tareas de agente y tool calling. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés de forma declarada. No se garantiza un rendimiento fiable en otros idiomas.
- Aceleracion no garantizada: la mejora de velocidad se mide en tasa de aceptación de borradores, no en tiempo real de pared. El beneficio real depende del motor de inferencia, el tamaño de lote y la longitud del borrador. En motores que no soporten MTP, no hay ninguna aceleración.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de internet y fine-tunes, puede presentar alucinaciones o sesgos no mitigados. Se recomienda validar las salidas en entornos de producción.
- Contexto: no se especifica la longitud de contexto en la información disponible. Se hereda del modelo base, pero se desconoce si el fine-tune la modifica.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe revisar la atribución y las condiciones de la licencia.
- Dependencia de la cabeza MTP: la cabeza de borrador se entrena sobre la distribución de grug; si se usa el modelo con prompts muy diferentes a los de entrenamiento, la tasa de aceptación podría degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp
- Modelo base: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/ProCreations/grug-27b-v2-corrective
- Variante GGUF con cabeza MTP: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp-gguf
- Variante GGUF sin cabeza MTP: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-gguf
- Tarjeta principal con benchmarks: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
