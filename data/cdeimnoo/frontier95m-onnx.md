# Cdeimnoo/frontier95m-onnx

## Resumen

Frontier95M es un modelo de lenguaje de 94,8 millones de parámetros desarrollado por Cdeimnoo, diseñado para ejecutarse íntegramente en el navegador mediante transformers.js y WebGPU. Su arquitectura es un decoder transformer de 12 capas con atención GQA, SwiGLU y RoPE, con embeddings atados. Se distribuye en formato ONNX cuantizado dinámicamente a uint8 (~120 MB), lo que permite inferencia local sin servidor.

El modelo se entrenó desde cero sobre 2.750 millones de tokens de un corpus filtrado que combina matemáticas verificadas, trazas de razonamiento, demostraciones, código y texto en italiano. Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de generación de texto y razonamiento en entornos con recursos limitados, como navegadores web o dispositivos de baja potencia. Aunque su tamaño es pequeño, su diseño técnico incorpora innovaciones modernas como GQA y SwiGLU, lo que lo hace interesante para experimentación y despliegue en edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer, 12 capas, d=768, GQA 12/4, SwiGLU, RoPE, embeddings atadas |
| Parametros totales | 94,8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Dinamica uint8 (ONNX) |
| Idiomas soportados | Italiano (principal), matematicas, codigo; otros no especificados |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

Frontier95M es un transformer decoder con 12 capas y una dimension de modelo de 768. Utiliza atencion de consultas agrupadas (GQA) con 12 cabezas de consulta y 4 de clave/valor, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). Los embeddings de entrada y salida estan atados (tied embeddings). La arquitectura es clasica para modelos de esta escala, pero incorpora tecnicas modernas de eficiencia.

El entrenamiento se realizo sobre un corpus de 2.75 mil millones de tokens, construido y filtrado por el autor con fuentes seleccionadas: matematicas verificadas, trazas de razonamiento, pruebas, codigo y texto en italiano. No se especifica si se utilizo RLHF o DPO; la informacion disponible solo menciona entrenamiento desde cero. El entrenamiento se ejecuto en 2x RTX 5090 a una velocidad de 302k tokens/s con una eficiencia del 57% MFU (model FLOPs utilization). No se detallan los hiperparametros exactos ni la composicion porcentual del dataset.

## Capacidades

- Generacion de texto y conversacion: sigue el formato de chat con tokens especiales `<|user|>` y `<|assistant|>`.
- Razonamiento matematico y logico: entrenado con datos verificados y pruebas, muestra capacidad para seguir pasos logicos.
- Generacion de codigo: incluido en el corpus de entrenamiento.
- Soporte multilingue parcial: principalmente italiano, aunque el corpus incluye codigo y matematicas que son universales.
- Ejecucion en navegador: gracias a la cuantizacion uint8 y ONNX, puede ejecutarse en WebGPU con transformers.js sin servidor.
- No se mencionan capacidades de vision, audio, tool calling, function calling, ni modo thinking explicito.

## Casos de uso

- Demostraciones educativas en navegador: el modelo puede ejecutarse en una pagina web para ilustrar conceptos de generacion de lenguaje o razonamiento basico, sin necesidad de backend.
- Prototipos de asistentes conversacionales en italiano: su entrenamiento en este idioma lo hace util para chatbots simples que operen en el navegador o en entornos con recursos limitados.
- Ejecucion en dispositivos de baja potencia: su tamano de ~120 MB y cuantizacion permiten inferencia en moviles o portatiles antiguos con WebGPU.
- Analisis de datos matematicos o de codigo en entornos offline: puede ayudar a resolver problemas de matematica o sugerir fragmentos de codigo sin conexion.
- Experimentacion academica con modelos pequenos: por su arquitectura moderna (GQA, SwiGLU, RoPE) es un caso de estudio para comparar eficiencia en escala reducida.
- Integracion en pipelines de CI/CD como oraculo de generacion de textos de prueba: por su capacidad de generar texto con formato, puede usarse para crear datos sinteticos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se incluyen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~95M parametros cuantizado a uint8, el uso de memoria es bajo; se estima que cabria en la mayoria de GPUs integradas o en CPU.
- GPU recomendadas: no se requiere GPU dedicada; funciona con WebGPU en navegadores modernos (Chrome, Edge, etc.). Puede ejecutarse en CPU sin aceleracion.
- Compatibilidad con consumer GPU: si, cualquier GPU con soporte WebGPU (integradas de Intel, AMD, etc.) o incluso sin GPU.
- Opciones de despliegue: transformers.js (browser), ONNX Runtime (WebGPU, WebAssembly), tambien puede convertirse a otros formatos (GGUF) para usar con llama.cpp.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamano, se espera una generacion de decenas de tokens por segundo en CPU moderna, y mucho mayor con WebGPU en GPU dedicada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos de ~100M entrenados en italiano o para navegador). Existen otros modelos pequenos como TinyLlama (1.1B) o Microsoft Phi-2 (2.7B), pero de mayor tamano y no especificos para este caso. Por tanto, la comparativa no disponible.

## Limitaciones y advertencias

- Tamano reducido: con solo 94.8M de parametros, la capacidad de razonamiento complejo y de comprension de contextos largos es limitada. Puede alucinar o producir respuestas incoherentes en temas fuera de su corpus.
- Dominio principal: entrenado principalmente en italiano, matematicas y codigo. Su rendimiento en otros idiomas o dominios puede ser pobre.
- Contexto: no se especifica la longitud de contexto; probablemente sea corta (del orden de miles de tokens), lo que limita conversaciones largas o documentos extensos.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos o razonamientos incorrectos, especialmente fuera de sus areas de entrenamiento.
- Sin garantias de calidad: al ser un proyecto de autor individual, no hay evaluacion exhaustiva publica, ni garantia de robustez en produccion.
- Licencia Apache-2.0: permite uso comercial, pero hay que tener en cuenta que el modelo puede tener sesgos inherentes a los datos de entrenamiento.
- No se ha publicado informacion sobre sesgos especificos, pero se recomienda auditar antes de usar en aplicaciones publicas.

## Enlaces

- [HuggingFace - Cdeimnoo/frontier95m-onnx](https://huggingface.co/Cdeimnoo/frontier95m-onnx)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [ONNX Runtime - Models](https://onnxruntime.ai/models)
- [ONNX - Home](https://onnx.ai/)
