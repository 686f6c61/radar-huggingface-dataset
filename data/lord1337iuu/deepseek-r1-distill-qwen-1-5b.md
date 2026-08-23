# Lord1337iuu/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

El modelo DeepSeek-R1-Distill-Qwen-1.5B es una versión destilada del modelo de razonamiento DeepSeek-R1, generada mediante el ajuste fino de un modelo base Qwen2.5 de 1.500 millones de parámetros con datos de razonamiento producidos por el propio DeepSeek-R1. Este proceso de destilación permite transferir las capacidades de razonamiento paso a paso (chain-of-thought) del modelo grande a un modelo mucho más compacto, manteniendo un rendimiento notable en tareas de matemáticas, código y lógica con un coste computacional reducido. El modelo está desarrollado por DeepSeek-AI y se publica bajo licencia MIT, lo que facilita su uso comercial y su integración en proyectos de producción. Su relevancia actual radica en ofrecer una alternativa ligera y eficiente para entornos con recursos limitados que necesitan capacidades de razonamiento avanzado sin depender de infraestructura de alto rendimiento.

Este checkpoint en particular, alojado por el usuario Lord1337iuu, es un espejo del modelo oficial de DeepSeek, con los mismos pesos y configuración. Cuenta con 1.777.088.000 parámetros, lo que lo convierte en el más pequeño de la familia destilada de DeepSeek-R1 (junto a las versiones de 7B, 8B, 14B, 32B y 70B). Su arquitectura es un transformer denso basado en Qwen2.5, con una ventana de contexto que, según la documentación oficial de la familia DeepSeek-R1-Distill, alcanza los 128.000 tokens, aunque este dato no se especifica explícitamente en la información proporcionada. Su tamaño reducido permite ejecutarlo en hardware de consumo, lo que democratiza el acceso a modelos de razonamiento de alta calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (documentación oficial indica 131.072 tokens para la familia destilada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero la destilación se centra principalmente en inglés y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo DeepSeek-R1-Distill-Qwen-1.5B se basa en la arquitectura transformer densa de Qwen2.5, con 1.500 millones de parámetros. No es un modelo de mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia. La destilación se realizó mediante un proceso de ajuste fino supervisado (SFT) sobre el modelo base, utilizando datos de razonamiento generados por DeepSeek-R1, el modelo de razonamiento de 671.000 millones de parámetros que combina RL a gran escala con cold-start. Este enfoque de destilación, descrito en el paper técnico de DeepSeek-R1, permite que el modelo pequeño herede las capacidades de razonamiento paso a paso, autoverificación y reflexión del modelo grande, sin necesidad de entrenar desde cero. No se han publicado detalles específicos sobre la composición del dataset de destilación ni el número de tokens de entrenamiento, pero el proceso se alinea con el pipeline descrito en la documentación oficial: dos etapas de RL y dos de SFT para el modelo grande, y posteriormente una destilación de sus datos de razonamiento a los modelos pequeños.

## Capacidades

- Generación de texto y razonamiento paso a paso: el modelo es capaz de resolver problemas complejos de matemáticas, lógica y razonamiento abstracto mediante cadenas de pensamiento (chain-of-thought), mostrando comportamientos de autoverificación y reflexión.
- Generación de código: puede escribir y depurar código en lenguajes como Python, C++, Java y otros, gracias a su base Qwen2.5 y a los datos de razonamiento de DeepSeek-R1.
- Capacidades multilingües: aunque la destilación se centra en inglés y chino, el modelo base Qwen2.5 soporta un amplio espectro de idiomas, por lo que conserva cierta capacidad de comprensión y generación en otros idiomas.
- Conversación y chat: adecuado para aplicaciones de asistencia conversacional que requieran respuestas razonadas y coherentes.
- No se ha confirmado soporte para tool calling o function calling en esta versión destilada, aunque el modelo base Qwen2.5 sí lo incluye; la destilación podría haberlo preservado o no.
- No se ha confirmado soporte para agentes o multi-step reasoning más allá de la cadena de pensamiento inherente al modelo.

## Casos de uso

- Asistente educativo de matemáticas: el modelo puede guiar a estudiantes en la resolución de problemas paso a paso, explicando el razonamiento detrás de cada operación. Su tamaño pequeño permite integrarlo en aplicaciones móviles o entornos con recursos limitados.
- Generación de código en entornos de desarrollo integrado (IDE): gracias a su capacidad para razonar sobre problemas de programación, puede sugerir soluciones, explicar fragmentos y ayudar en la depuración, todo ello en tiempo real con una latencia baja.
- Chat de soporte técnico especializado: para preguntas que requieren lógica y razonamiento (diagnóstico de errores, configuración de sistemas), el modelo puede proporcionar respuestas detalladas y estructuradas, mejorando la experiencia del usuario final.
- Análisis de datos y razonamiento lógico: en tareas de análisis de datos, el modelo puede interpretar resultados, explicar tendencias y generar conclusiones basadas en datos numéricos, sin necesidad de una infraestructura de gran escala.
- Prototipado rápido de agentes conversacionales: dado su pequeño tamaño y licencia MIT, es ideal para crear prototipos de asistentes con razonamiento, que luego pueden escalarse a modelos mayores.
- Investigación académica en razonamiento de modelos: sirve como modelo de referencia para estudiar el impacto de la destilación en el rendimiento de razonamiento, comparando con versiones más grandes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información proporcionada. La documentación oficial de DeepSeek-R1 indica que las versiones destiladas de 1.5B, 7B, 8B, 14B, 32B y 70B superan a modelos de tamaño similar en tareas de razonamiento, pero no se incluyen cifras concretas para la variante de 1.5B en los datos disponibles. Para obtener métricas detalladas, se recomienda consultar el paper de DeepSeek-R1 o la documentación oficial.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 1.5B en FP16 requiere aproximadamente 3 GB de VRAM, y en cuantización INT8 o INT4 puede reducirse a 1.5-2 GB, pero estos valores no son oficiales.
- GPU recomendadas: al ser un modelo pequeño, puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060, RTX 4060, o incluso en CPU con suficiente RAM para inferencia lenta. No requiere GPUs profesionales como A100 o H100.
- Opciones de despliegue: compatible con librerías de inferencia como vLLM, llama.cpp, Ollama y text-generation-inference (TGI). El formato safetensors es compatible con Transformers de Hugging Face.
- Latencia y throughput: no se han publicado datos concretos. En una GPU consumer moderna, se espera una latencia de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en razonamiento |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este) | 1,78B | No disponible (128k oficial) | MIT | No publicado |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128k | MIT | Superior al 1.5B, pero no publicado aquí |
| Qwen2.5-1.5B (base) | 1,54B | 32k | Apache 2.0 | Inferior en razonamiento, sin destilación |
| Llama-3.2-1B | 1,23B | 128k | Llama 3.2 | Inferior en razonamiento, sin destilación |

La comparativa se basa en datos públicos de los modelos, pero los resultados de rendimiento no están disponibles en la información proporcionada. El modelo destilado de 1.5B destaca por su licencia MIT, que permite uso comercial sin restricciones, mientras que los modelos base de Qwen tienen licencia Apache 2.0 (permitida comercialmente) y los de Llama tienen restricciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: como modelo destilado de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo pequeño, la probabilidad de generar información falsa o inventada es mayor en comparación con modelos de mayor tamaño, especialmente en tareas de conocimiento general.
- Limitaciones de contexto: aunque la documentación oficial indica una ventana de 128k tokens, no se ha confirmado en este checkpoint específico. En la práctica, la ventana puede degradarse con contextos muy largos.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificaciones, pero no se han indicado restricciones adicionales. Sin embargo, el modelo deriva de DeepSeek-R1, que tiene su propia licencia, aunque el distilado se publica bajo MIT.
- Para producción: se recomienda evaluar el rendimiento en tareas específicas antes de desplegarlo en entornos críticos, ya que no hay benchmarks públicos de este modelo.

## Enlaces

- Hugging Face (usuario Lord1337iuu): https://huggingface.co/Lord1337iuu/DeepSeek-R1-Distill-Qwen-1.5B
- Hugging Face (modelo oficial de DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio oficial en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- ModelScope (alternativa de descarga): https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
