# FastFlowLM/LFM2.5-1.2B-NPU2

## Resumen

LFM2.5-1.2B-NPU2 es una adaptación del modelo LFM2.5-1.2B-Instruct, desarrollada por FastFlowLM, orientada a la ejecución en unidades de procesamiento neuronal (NPU) y despliegue en el borde. El modelo original procede de Liquid AI y forma parte de la familia LFM2.5, una generación de modelos híbridos concebidos específicamente para inferencia en dispositivo. Con 1,17 mil millones de parámetros y una ventana de contexto de 32.768 tokens, el modelo busca ofrecer calidad conversacional en hardware de recursos limitados.

La arquitectura combina 16 capas: 10 bloques de convolución LIV con doble compuerta y 6 bloques de atención con consultas agrupadas (GQA). Esta mezcla reduce el coste computacional frente a un transformer puro, lo que permite decodificación rápida en CPU y NPU. El entrenamiento se amplió de 10 a 28 billones de tokens e incluyó aprendizaje por refuerzo multietapa, según la documentación del autor original.

La relevancia de esta variante concreta radica en su enfoque hacia NPU2, un formato pensado para integrarse en pipelines de inferencia local. El modelo soporta ocho idiomas, incluido el español, y está disponible bajo licencia LFM1.0. Es adecuado para tareas agénticas, extracción de datos y RAG, aunque el propio autor desaconseja su uso en tareas intensivas en conocimiento y programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 10 bloques de convolución LIV con doble compuerta + 6 bloques GQA (16 capas) |
| Parametros totales | 1,17B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repo NPU2 no detalla cuantizaciones; el modelo base ofrece GGUF, ONNX y MLX en 8 bits) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano, español |
| Licencia | LFM1.0 (licencia "other" con nombre lfm1.0) |
| Formato de pesos | No disponible para esta variante NPU2 (el modelo base está en safetensors; existen variantes GGUF, ONNX y MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que alterna bloques de convolución LIV (Linear Input-Varying) con doble compuerta y bloques de atención con consultas agrupadas. Esta combinación reduce el coste de atención en secuencias largas y mejora la eficiencia en hardware de borde. El vocabulario es de 65.536 tokens y el modelo consta de 16 capas en total. La variante NPU2 de FastFlowLM se distribuye como un checkpoint compatible con la librería transformers, con un tamaño de repositorio de 1,0 GB.

El entrenamiento del modelo base LFM2.5-1.2B incluyó una fase de preentrenamiento ampliada de 10 a 28 billones de tokens, seguida de aprendizaje por refuerzo multietapa a gran escala. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron técnicas como DPO o RLHF con preferencias humanas. La model card original menciona soporte para decodificación rápida (239 tok/s en CPU AMD y 82 tok/s en NPU móvil) y compatibilidad con llama.cpp, MLX y vLLM desde el primer día, aunque estas cifras corresponden al modelo base y no necesariamente a esta variante NPU2.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Soporte de function calling y tool use mediante un formato Pythonic delimitado por tokens especiales (`<|tool_call_start|>` y `<|tool_call_end|>`), con posibilidad de forzar salida JSON.
- Capacidad para tareas agénticas y razonamiento multi-paso, según la recomendación del autor.
- Extracción de datos estructurados y recuperación aumentada por generación (RAG).
- Multilingüismo en ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Plantilla de chat estilo ChatML con tokens `<|im_start|>` y `<|im_end|>`.
- No incluye visión, audio ni modo de razonamiento explícito (thinking mode) en esta variante.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de 32.768 tokens, suficiente para mantener el historial de una sesión completa sin truncamientos frecuentes. Su bajo requisito de memoria (menos de 1 GB según el autor) permite desplegarlo en dispositivos locales o servidores de borde.
- Extracción de datos estructurados: con soporte de tool calling y salida JSON forzable, puede transformar texto no estructurado en campos definidos por un esquema, integrándose en pipelines de procesamiento documental.
- RAG en dispositivo: al ejecutarse en NPU o CPU con huella de memoria reducida, es adecuado para asistentes locales que consultan bases de conocimiento privadas sin enviar datos a la nube.
- Automatización de flujos agénticos: el modelo puede encadenar llamadas a herramientas (consultas a APIs, comprobación de estados, recuperación de registros) y sintetizar la respuesta final en texto plano, tal como se documenta en el ejemplo de la model card.
- Asistentes multilingües en el borde: con soporte de español, francés, alemán, árabe, chino, japonés y coreano, puede desplegarse en aplicaciones de traducción o asistencia local para usuarios de distintos idiomas.
- Clasificación y enrutamiento de consultas: su tamaño compacto y baja latencia permiten usarlo como primer filtro en sistemas de triaje que deciden si una consulta requiere un modelo mayor o puede resolverse localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante NPU2. La model card del modelo base menciona cifras de velocidad de decodificación (239 tok/s en CPU AMD y 82 tok/s en NPU móvil) y una comparación gráfica con modelos mayores, pero no se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni otros benchmarks en el texto disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB de memoria para inferencia según la model card del modelo base, aunque esta cifra corresponde a cuantizaciones del modelo original y no se detalla para la variante NPU2.
- GPU recomendadas: no disponible para esta variante. El modelo base está optimizado para CPU (AMD), NPU móvil y Apple Silicon (MLX); no se especifican GPU discretas.
- Compatibilidad con GPU de consumo: no disponible para NPU2. El modelo base puede ejecutarse en hardware de consumo mediante GGUF y llama.cpp, pero no se confirma para esta variante.
- Opciones de despliegue: transformers (librería declarada en el repo), y para el modelo base se mencionan llama.cpp, MLX y vLLM. No se detalla el runtime específico para NPU2.
- Latencia y throughput: no disponible para NPU2. El modelo base reporta 239 tok/s en CPU AMD y 82 tok/s en NPU móvil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-NPU2 (este) | 1,17B | 32.768 | LFM1.0 | Hugging Face (FastFlowLM) | Variante para NPU2, 324 descargas |
| LFM2.5-1.2B-Instruct | 1,17B | 32.768 | LFM1.0 | Hugging Face (LiquidAI) | Modelo base original, con variantes GGUF, ONNX y MLX |
| LFM2.5-1.2B-Base | 1,17B | 32.768 | LFM1.0 | Hugging Face (LiquidAI) | Checkpoint preentrenado para fine-tuning |
| LFM2.5-VL-1.6B | 1,6B | No disponible | LFM1.0 | Hugging Face (LiquidAI) | Variante visión-lenguaje de la misma familia |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El autor del modelo base desaconseja su uso en tareas intensivas en conocimiento y en programación, lo que limita su aplicabilidad en dominios que requieran precisión factual o generación de código compleja.
- Riesgo de alucinación inherente a modelos de 1,2B parámetros; no se han publicado evaluaciones específicas de fidelidad factual para esta variante.
- La licencia LFM1.0 es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- No se detallan los sesgos conocidos del modelo ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo demográfico o cultural.
- El soporte multilingüe está declarado para ocho idiomas, pero no se especifica el nivel de competencia por idioma; el español está incluido, aunque sin métricas publicadas.
- La variante NPU2 tiene solo 324 descargas y 3 likes, lo que indica una validación comunitaria muy limitada; se recomienda precaución en entornos de producción.
- No se dispone de información sobre el proceso de cuantización ni sobre la compatibilidad con runtimes específicos de NPU2 más allá de la librería transformers declarada.

## Enlaces

- [Hugging Face: FastFlowLM/LFM2.5-1.2B-NPU2](https://huggingface.co/FastFlowLM/LFM2.5-1.2B-NPU2)
- [Modelo base: LiquidAI/LFM2.5-1.2B-Base](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base)
- [LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- [LFM2.5-1.2B-Instruct-GGUF](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF)
- [LFM2.5-1.2B-Instruct-ONNX](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX)
- [LFM2.5-1.2B-Instruct-MLX-8bit](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-8bit)
- [Blog de Liquid AI: Introducing LFM2.5](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- [Documentación de LFM](https://docs.liquid.ai/lfm)
- [Playground de Liquid AI](https://playground.liquid.ai/)
- [LEAP](https://leap.liquid.ai/)
- [Documentación de Chat Template](https://docs.liquid.ai/lfm/key-concepts/chat-template)
- [Documentación de Tool Use](https://docs.liquid.ai/lfm/key-concepts/tool-use)
- [Paper arXiv:2511.23404](https://arxiv.org/abs/2511.23404)
