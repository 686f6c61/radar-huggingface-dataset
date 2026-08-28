# Atomic-Germ/LFM2.5-1.2B-NPU2

## Resumen

LFM2.5-1.2B-NPU2 es un modelo de lenguaje de 1.200 millones de parametros desarrollado por Atomic-Germ, basado en el checkpoint LFM2.5-1.2B-Base de Liquid AI. Esta variante especifica esta optimizada para inferencia en unidades de procesamiento neuronal (NPU) de dispositivos moviles, manteniendo las capacidades del modelo original de Liquid AI pero con un formato de pesos adaptado para aceleracion por hardware en el borde.

El modelo pertenece a la familia LFM2.5 de Liquid AI, una nueva generacion de arquitecturas hibridas disenadas especificamente para despliegue en dispositivos con recursos limitados. Con 1,17B de parametros activos, 16 capas (10 bloques LIV de convolucion con doble compuerta y 6 bloques GQA) y una ventana de contexto de 32.768 tokens, este modelo compite con modelos mucho mas grandes en tareas de razonamiento y agente, segun los datos publicados por Liquid AI. Su relevancia actual radica en que permite ejecutar capacidades de IA de alta calidad en el borde, con velocidades de decodificacion de 239 tokens por segundo en CPU AMD y 82 tokens por segundo en NPU movil, ocupando menos de 1 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 10 bloques LIV de convolucion con doble compuerta + 6 bloques GQA |
| Parametros totales | 1,17B |
| Parametros activos | 1,17B (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en formato nativo; existen variantes GGUF, ONNX y MLX del modelo original) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

LFM2.5-1.2B-NPU2 hereda la arquitectura hibrida de la familia LFM2.5 de Liquid AI. Combina bloques LIV (Liquid In-context Volterra) con convoluciones de doble compuerta, que permiten un procesamiento eficiente de secuencias largas, con bloques GQA (Grouped Query Attention) para el manejo de atencion. Esta combinacion busca equilibrar la calidad del modelo con la eficiencia computacional necesaria para el despliegue en dispositivos con recursos limitados.

El entrenamiento del modelo base LFM2.5-1.2B-Base se realizo con un presupuesto de 28 billones de tokens, ampliando los 10 billones de la generacion anterior LFM2. El proceso incluyo un entrenamiento previo extendido seguido de un aprendizaje por refuerzo en multiples etapas a gran escala. El vocabulario del modelo tiene un tamano de 65.536 tokens. La variante NPU2 de Atomic-Germ no modifica la arquitectura ni los pesos del modelo base, sino que adapta el formato para su ejecucion en NPU moviles, manteniendo las mismas capacidades que el checkpoint original.

## Capacidades

- Generacion de texto conversacional y de proposito general en 8 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Soporte de tool calling y function calling mediante tokens especiales (`<|tool_call_start|>` y `<|tool_call_end|>`), con formato Pythonico por defecto o JSON configurable.
- Capacidades de agente: el modelo esta recomendado para tareas agente, extraccion de datos y RAG (generacion aumentada por recuperacion).
- Razonamiento multi-paso: gracias al entrenamiento con aprendizaje por refuerzo, el modelo puede abordar tareas que requieren varios pasos de razonamiento.
- Inferencia rapida en el borde: 239 tokens por segundo en CPU AMD y 82 tokens por segundo en NPU movil, con menos de 1 GB de uso de memoria.
- Compatibilidad con el formato ChatML para conversaciones multi-turno.
- Integracion con el ecosistema transformers, vLLM, llama.cpp, MLX y ONNX Runtime.

## Casos de uso

- Asistentes conversacionales en el borde: el modelo puede ejecutarse directamente en telefonos moviles o dispositivos IoT, proporcionando respuestas en tiempo real sin conexion a internet. Su velocidad de decodificacion de 82 tokens por segundo en NPU movil lo hace adecuado para interacciones fluidas.
- Extraccion de datos estructurados: gracias a su soporte de tool calling, puede extraer informacion de documentos y devolverla en formato JSON o Pythonico, integrandose en pipelines de procesamiento de datos.
- Sistemas RAG en dispositivos locales: con una ventana de contexto de 32.768 tokens, puede procesar documentos largos y responder preguntas basadas en ellos, todo localmente en el dispositivo.
- Agentes autonomos en el borde: el modelo puede encadenar llamadas a herramientas y ejecutar tareas multi-paso, como consultar APIs, procesar resultados y tomar decisiones, sin depender de la nube.
- Atencion al cliente en multiples idiomas: su soporte de 8 idiomas permite desplegar sistemas de soporte automatizado en mercados multilingues, con respuestas contextuales y capacidad de derivar a agentes humanos cuando sea necesario.
- Asistencia en entornos con privacidad estricta: al ejecutarse localmente, los datos de los usuarios no salen del dispositivo, lo que lo hace adecuado para aplicaciones en salud, finanzas o sectores con requisitos regulatorios de proteccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original de Liquid AI menciona que LFM2.5-1.2B-Instruct rivaliza con modelos mucho mas grandes, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB de memoria, segun los datos de Liquid AI para la familia LFM2.5-1.2B.
- GPU recomendadas: el modelo esta disenado para NPU moviles y CPUs de bajo consumo. No requiere GPU de alta gama; puede ejecutarse en CPUs AMD con 239 tokens por segundo y en NPU moviles con 82 tokens por segundo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer con al menos 2 GB de VRAM, incluyendo RTX 3050, RTX 4060 o incluso integradas modernas.
- Opciones de despliegue: transformers, vLLM, llama.cpp (via formato GGUF), MLX (para Apple Silicon) y ONNX Runtime.
- Latencia y throughput: 239 tokens por segundo en CPU AMD y 82 tokens por segundo en NPU movil, segun los datos publicados por Liquid AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|
| LFM2.5-1.2B-NPU2 (Atomic-Germ) | 1,17B | 32.768 | lfm1.0 | Inferencia en NPU movil |
| LFM2.5-1.2B-Instruct (Liquid AI) | 1,17B | 32.768 | lfm1.0 | Modelo original, fine-tuning e inferencia con transformers y vLLM |
| LFM2.5-1.2B-Base (Liquid AI) | 1,17B | 32.768 | lfm1.0 | Modelo base para fine-tuning |
| LFM2.5-1.2B-JP (Liquid AI) | 1,17B | 32.768 | lfm1.0 | Chat optimizado para japones |

La variante NPU2 se diferencia del modelo Instruct original principalmente en el formato de pesos, adaptado para NPU moviles. Las capacidades funcionales son identicas al checkpoint base de Liquid AI.

## Limitaciones y advertencias

- El modelo no esta recomendado para tareas intensivas en conocimiento ni para programacion, segun la model card original de Liquid AI.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas de conocimiento general.
- La licencia lfm1.0 es una licencia propia de Liquid AI; es necesario revisar sus terminos especificos para uso comercial, ya que no es una licencia open source estandar como Apache 2.0 o MIT.
- El modelo solo soporta texto; no tiene capacidades de vision ni audio (existen variantes separadas LFM2.5-VL y LFM2.5-Audio para esas modalidades).
- La variante NPU2 de Atomic-Germ tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un modelo reciente sin validacion de la comunidad.
- Los parametros de generacion recomendados son especificos (temperatura 0.1, top_k 50, top_p 0.1, repetition_penalty 1.05); desviarse de ellos puede degradar la calidad de las respuestas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Atomic-Germ/LFM2.5-1.2B-NPU2
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Modelo Instruct original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm
- Playground de Liquid AI: https://playground.liquid.ai/
- Repositorio de Atomic-Germ en GitHub: https://github.com/Atomic-Germ/q4nx-build
