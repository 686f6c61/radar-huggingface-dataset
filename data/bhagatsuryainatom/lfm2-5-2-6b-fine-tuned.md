# bhagatsuryainatom/LFM2.5-2.6B-fine-tuned

## Resumen

LFM2.5-2.6B es un modelo de lenguaje denso de 2.600 millones de parámetros desarrollado por Liquid AI, diseñado específicamente para cargas de trabajo agénticas en dispositivos locales. Este modelo destaca por su ventana de contexto de 128.000 tokens y soporte nativo de tool calling, lo que lo convierte en una opción viable para ejecutar agentes autónomos en portátiles, servidores de borde e incluso teléfonos inteligentes. La versión aquí analizada, `bhagatsuryainatom/LFM2.5-2.6B-fine-tuned`, es un ajuste fino del modelo base publicado por un usuario independiente, aunque no se dispone de información sobre el proceso de fine-tuning ni sobre los datos utilizados.

La relevancia actual de este modelo radica en su eficiencia: según Liquid AI, alcanza velocidades de decodificación de 220 tokens por segundo en un Apple M5 Max y 113 tokens por segundo en un AMD Ryzen AI Max+ 395, con un consumo de memoria inferior a 2,5 GB. Esto lo posiciona como una alternativa competitiva para despliegues on-device donde la latencia y el consumo de recursos son críticos. La arquitectura LFM2, propietaria de Liquid AI, combina eficiencia computacional con capacidades de razonamiento multi-paso, lo que lo hace adecuado para tareas de planificación y ejecución de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (dense, basada en transformer con optimizaciones propias de Liquid AI) |
| Parametros totales | 2.697.198.592 (2,6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; se pueden generar cuantizaciones GGUF/AWQ externamente) |
| Idiomas soportados | no disponible (el modelo base de Liquid AI soporta principalmente inglés, pero no se confirma para este fine-tune) |
| Licencia | no disponible (la model card no especifica licencia; el modelo base de Liquid AI suele usar MIT, pero no se puede confirmar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura LFM2 es una evolución de los modelos de Liquid AI, que combina capas transformer con mecanismos de atención lineal o subquadrática para reducir el coste computacional en contextos largos. Aunque no se publican detalles técnicos completos, el modelo base fue entrenado con un enfoque en tareas agénticas, incluyendo planificación, razonamiento multi-paso y llamada a herramientas. El entrenamiento del modelo base incluyó probablemente fases de pre-entrenamiento con grandes corpus de texto y ajuste fino supervisado (SFT) con datos de interacción agéntica, aunque no se especifican los volúmenes de tokens ni la composición del dataset.

En cuanto al fine-tune `bhagatsuryainatom/LFM2.5-2.6B-fine-tuned`, no se dispone de información sobre el proceso de entrenamiento, los hiperparámetros, el dataset utilizado ni la metodología (RLHF, DPO, etc.). La model card es genérica y no aporta datos concretos. Por tanto, cualquier afirmación sobre el entrenamiento de esta versión específica debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base está optimizado para tareas que requieren planificación y ejecución secuencial de acciones.
- Tool calling nativo: soporta la invocación de funciones externas, lo que permite integrarlo en pipelines de agentes que necesitan consultar APIs, bases de datos o ejecutar código.
- Ventana de contexto de 128K tokens: permite procesar documentos largos, historiales de conversación extensos o código fuente completo en una sola pasada.
- Eficiencia on-device: con un footprint de memoria inferior a 2,5 GB, puede ejecutarse en hardware de consumo sin necesidad de GPUs dedicadas.
- Velocidad de decodificación alta: 220 tokens/s en Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395 (datos del modelo base, no verificados para el fine-tune).
- Capacidades multilingües: no confirmadas para este fine-tune; el modelo base de Liquid AI tiene soporte limitado a inglés principalmente.

## Casos de uso

- Asistentes personales locales: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y ejecutar acciones como enviar correos, programar citas o buscar información, todo sin conexión a la nube.
- Agentes de automatización de tareas: gracias al tool calling nativo, puede integrarse en flujos de trabajo que requieren consultar APIs, manipular archivos o interactuar con sistemas externos, ideal para entornos de borde.
- Generación y revisión de código en entornos sin conexión: con su ventana de contexto amplia, puede analizar repositorios completos y sugerir cambios, aunque su tamaño reducido limita la complejidad de los proyectos que puede manejar.
- Chatbots de atención al cliente en dispositivos de bajo consumo: su bajo footprint de memoria permite desplegarlo en routers, cajeros automáticos o quioscos interactivos para ofrecer respuestas contextuales sin depender de servidores centrales.
- Procesamiento de documentos legales o técnicos: la ventana de 128K tokens permite resumir o extraer información de contratos, informes o manuales extensos en una sola pasada, con razonamiento multi-paso para responder preguntas complejas.
- Prototipado rápido de agentes en investigación: los investigadores pueden usar este modelo para experimentar con arquitecturas agénticas en hardware modesto, validando flujos de tool calling y planificación antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del fine-tune no incluye métricas de evaluación, y los datos de rendimiento (velocidad de decodificación, memoria) provienen del blog de Liquid AI para el modelo base, no para esta versión ajustada. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base ocupa menos de 2,5 GB en memoria, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM (se recomienda al menos 8 GB de RAM para evitar swapping).
- GPU recomendadas: cualquier GPU moderna con soporte FP16 (RTX 2060 o superior, GTX 1660 Ti, Apple Silicon M1/M2/M3/M4/M5, AMD Ryzen AI). No requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media como RTX 3060, RTX 4060, etc., con cuantización INT8 o FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con `device_map="auto"`. Para despliegue on-device, llama.cpp y Ollama son las opciones más ligeras.
- Latencia y throughput estimados: según Liquid AI, el modelo base alcanza 220 tokens/s en Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395. En GPUs consumer, se esperan cifras similares o superiores dependiendo de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B (base) | 2,6B | 128K | Sí | MIT (según Liquid AI) | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32K | Sí | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1,2B | 128K | No (requiere fine-tuning) | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2,6B | 8K | No | Gemma Terms of Use | Hugging Face |

La comparativa se basa en el modelo base, ya que el fine-tune no tiene datos propios. LFM2.5-2.6B destaca por su contexto largo y tool calling nativo, mientras que Qwen2.5-1.5B ofrece tool calling pero con contexto menor. Llama-3.2-1B tiene contexto similar pero carece de tool calling nativo. Gemma-2-2B tiene contexto muy limitado. No se dispone de benchmarks comparativos para validar rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos del modelo base ni del fine-tune. Al ser un modelo pequeño, es probable que presente sesgos presentes en los datos de entrenamiento, pero no hay auditorías publicadas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. Su tamaño reducido aumenta este riesgo en comparación con modelos más grandes.
- Limitaciones de contexto e idioma: aunque la ventana es de 128K tokens, el modelo base está optimizado principalmente para inglés. El fine-tune no especifica idiomas soportados, por lo que su rendimiento en otros idiomas es incierto.
- Restricciones de licencia: la licencia del fine-tune no está especificada. El modelo base de Liquid AI se distribuye bajo MIT, pero este fine-tune podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Caveat para producción: al ser un fine-tune de un usuario independiente, no hay garantías de calidad, mantenimiento ni soporte. Se recomienda evaluar exhaustivamente el modelo en el dominio de uso antes de desplegarlo en entornos críticos.
- Falta de documentación: la model card es genérica y no aporta información sobre el proceso de fine-tuning, los datos utilizados ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Repositorio del fine-tune: https://huggingface.co/bhagatsuryainatom/LFM2.5-2.6B-fine-tuned
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Blog de Hugging Face sobre LFM2.5-2.6B: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Artículo de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
