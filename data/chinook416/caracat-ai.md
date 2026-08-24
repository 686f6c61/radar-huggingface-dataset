# Chinook416/caracat-ai

## Resumen

El modelo `Chinook416/caracat-ai` es una publicación en Hugging Face que reproduce el modelo `gpt-oss-20b` de OpenAI, un modelo de lenguaje de pesos abiertos con arquitectura Mixture of Experts (MoE). Está diseñado para tareas de razonamiento, agentes y uso general en desarrollo, y destaca por su licencia permisiva Apache 2.0, su capacidad de ajuste fino y su soporte nativo para function calling, ejecución de código Python y salidas estructuradas. El modelo fue publicado por el usuario Chinook416, aunque la model card y la arquitectura corresponden íntegramente a la serie gpt-oss de OpenAI.

Con 21 mil millones de parámetros totales (3,6 mil millones activos) y una longitud de contexto de 131.072 tokens, el modelo ofrece un equilibrio entre rendimiento y eficiencia. Además, incorpora cuantización MXFP4 post-entrenamiento, lo que permite ejecutarlo en entornos con limitaciones de memoria, como una GPU con 16 GB de VRAM. Es relevante porque democratiza el acceso a un modelo de razonamiento de nivel empresarial con una licencia comercialmente amigable, y su formato de entrenamiento "harmony" garantiza un comportamiento coherente en tareas agénticas y de razonamiento encadenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt-oss (MoE, Mixture of Experts) |
| Parametros totales | 20.914.757.184 (21B) |
| Parametros activos | 3,6 mil millones (según model card) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento), además de cuantizaciones estándar (8-bit, 4-bit) disponibles en la comunidad |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de Mixture of Experts (MoE) con un total de 21 mil millones de parámetros, de los cuales solo 3,6 mil millones se activan por token. Esto permite un rendimiento de inferencia más rápido que un modelo denso del mismo tamaño, a la vez que mantiene una capacidad de razonamiento robusta. El entrenamiento se realizó con el formato de respuesta "harmony", un protocolo desarrollado por OpenAI que estructura las respuestas en pasos de razonamiento encadenados, lo que facilita el debugging y aumenta la confianza en los resultados. Este formato es obligatorio para el funcionamiento correcto del modelo; si se utiliza el modelo sin él, los resultados pueden ser subóptimos.

Además, el modelo fue post-entrenado con cuantización MXFP4 de los pesos del MoE, lo que reduce significativamente la memoria necesaria para la inferencia sin sacrificar el rendimiento en las evaluaciones. El modelo soporta ajuste fino completo (fine-tuning) y ha sido optimizado para funcionar con librerías como Transformers, vLLM, Ollama y LM Studio. No se han publicado detalles específicos sobre el dataset de entrenamiento ni el número exacto de tokens, pero se sabe que es un modelo de propósito general con capacidades de razonamiento, agente y generación de código.

## Capacidades

- Razonamiento encadenado (chain-of-thought) completo: el modelo genera pasos de razonamiento intermedios, accesibles para el desarrollador, lo que permite depurar y validar el proceso de pensamiento.
- Configuración de esfuerzo de razonamiento: permite ajustar el nivel de esfuerzo (bajo, medio, alto) para equilibrar latencia y calidad según el caso de uso.
- Llamada a funciones (function calling) nativa: el modelo puede invocar herramientas externas, ideal para construir agentes y automatizaciones.
- Ejecución de código Python: capacidad de generar y ejecutar código en entornos controlados, útil para análisis de datos o automatización.
- Salidas estructuradas: soporte para generar respuestas en formatos JSON u otros esquemas definidos por el usuario.
- Capacidades multilingües: aunque no se especifican los idiomas exactos, al ser un modelo entrenado por OpenAI, se espera que maneje múltiples idiomas, incluido el español.
- Compatibilidad con herramientas de agentes: puede integrarse en flujos de trabajo agénticos con navegación web y ejecución de código.

## Casos de uso

- Asistente de atención al cliente con razonamiento: el modelo puede gestionar conversaciones multi-turno con contexto largo (131k tokens), explicando sus pasos de razonamiento internos para garantizar respuestas coherentes y depurables.
- Generación de código en producción: con soporte para function calling y ejecución de Python, se integra en pipelines de CI/CD para generar, revisar o ejecutar código de forma autónoma.
- Agente de automatización de tareas: se puede usar para construir agentes que navegan por web, interactúan con APIs y toman decisiones basadas en razonamiento encadenado, todo con salidas estructuradas.
- Análisis de documentos largos: la ventana de contexto de 131k tokens permite resumir o extraer información de libros, informes o contratos extensos en una sola pasada.
- Investigación y desarrollo de modelos: al ser Apache 2.0, permite fine-tuning y experimentación en entornos de investigación sin restricciones de copyleft.
- Despliegue en edge o hardware limitado: gracias a la cuantización MXFP4, puede ejecutarse en GPUs de consumo con 16 GB de VRAM, como una RTX 4080, para aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información proporcionada. La model card no incluye tablas de rendimiento, y no se dispone de datos comparativos con otros modelos. Se recomienda consultar los benchmarks oficiales de gpt-oss-20b en el paper de OpenAI (arxiv:2508.10925) o en la web de OpenAI.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo con cuantización MXFP4 cabe en 16 GB de memoria, según la model card. Para cuantizaciones de 8-bit o 16-bit, se recomienda al menos 24 GB de VRAM.
- GPUs recomendadas: NVIDIA H100, A100, RTX 4090 (con cuantización MXFP4), AMD MI300X. Para uso local, una RTX 4080 o 4090 puede ser suficiente.
- Despliegue en GPU de consumo: sí, con la cuantización MXFP4, puede ejecutarse en GPUs con 16 GB de VRAM, como la RTX 4080 o RTX 4090.
- Opciones de despliegue: Transformers (con `transformers serve`), vLLM (con una versión especial `vllm==0.10.1+gptoss`), Ollama (`ollama pull gpt-oss:20b`), LM Studio, y referencia en PyTorch/Triton.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo MoE con solo 3,6B parámetros activos, se espera una latencia menor que un modelo denso de 21B. Para más datos, consultar los benchmarks de OpenAI.

## Comparativa con modelos similares

La comparación se realiza con otros modelos MoE de tamaño similar (20-30B parámetros totales) o con modelos de razonamiento abiertos.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Chinook416/caracat-ai (gpt-oss-20b) | 21B | 3,6B | 131k | Apache 2.0 | Razonamiento, agente, MXFP4 |
| gpt-oss-120b | 117B | 5,1B | 131k | Apache 2.0 | Versión mayor del mismo modelo, para GPU 80GB |
| Qwen3-30B-A3B | 30B | 3B | 128k | Apache 2.0 | MoE, fuerte en código y razonamiento, sin formato harmony |
| DeepSeek-R1-Distill-Qwen-32B | 32B | - | 128k | MIT | Modelo denso destilado de DeepSeek-R1, buen razonamiento, pero sin función calling nativa |

Nota: los datos de rendimiento de estos modelos no se comparan directamente aquí por falta de benchmarks públicos consistentes. La elección dependerá de la necesidad de razonamiento encadenado, el formato harmony y las capacidades de agente, donde gpt-oss-20b destaca.

## Limitaciones y advertencias

- El modelo está entrenado con el formato "harmony" y no funcionará correctamente si no se usa ese formato de chat. Si se usa `model.generate` directamente, se debe aplicar manualmente la plantilla de chat.
- No se han publicado datos sobre sesgos o alucinaciones específicos, pero al ser un modelo de lenguaje, puede generar contenido factualmente incorrecto. Se recomienda verificación en aplicaciones críticas.
- La ventana de contexto es de 131k tokens, pero el rendimiento puede degradarse en contextos muy largos si no se gestiona adecuadamente la memoria.
- La licencia Apache 2.0 permite uso comercial, pero no incluye una cláusula de indemnización de patentes (a diferencia de otras licencias). Se recomienda revisar los términos de la licencia.
- El modelo no soporta entrada multimodal (solo texto). Para tareas de visión, se necesitaría otro modelo.
- La cuantización MXFP4 es la configuración oficial, pero otras cuantizaciones (GGUF, AWQ) pueden no estar disponibles o no estar optimizadas para este modelo.

## Enlaces

- Repositorio de Hugging Face: [Chinook416/caracat-ai](https://huggingface.co/Chinook416/caracat-ai)
- Model card oficial de gpt-oss-20b: [openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- Paper de gpt-oss: [arxiv:2508.10925](https://arxiv.org/abs/2508.10925)
- Blog de OpenAI sobre gpt-oss: [Introducing gpt-oss](https://openai.com/index/introducing-gpt-oss/)
- Repositorio de OpenAI gpt-oss en GitHub: https://github.com/openai/gpt-oss
- Guías de uso: https://cookbook.openai.com/topic/gpt-oss
- Sitio web de gpt-oss: https://gpt-oss.com
