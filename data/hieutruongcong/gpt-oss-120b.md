# HieuTruongCong/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de código abierto desarrollado por OpenAI, diseñado para tareas de razonamiento complejo, uso agéntico y aplicaciones de producción. Forma parte de la serie gpt-oss, que incluye también la variante gpt-oss-20b, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft. El modelo emplea una arquitectura de mezcla de expertos (MoE) con 117 mil millones de parámetros totales y 5.1 mil millones activos, lo que permite un equilibrio entre capacidad y eficiencia computacional.

Una de sus características más destacadas es el uso del formato de respuesta harmony, un protocolo de interacción que el modelo requiere para funcionar correctamente. Además, ofrece un nivel de razonamiento configurable (bajo, medio, alto) y acceso completo a la cadena de pensamiento, lo que facilita la depuración y la confianza en las salidas. El modelo ha sido post-entrenado con cuantización MXFP4, lo que permite ejecutarlo en una única GPU de 80 GB, como la NVIDIA H100 o la AMD MI300X, sin pérdida significativa de rendimiento en las evaluaciones.

La relevancia actual de gpt-oss-120b radica en que combina un rendimiento competitivo en tareas de razonamiento con una licencia permisiva y una implementación optimizada para hardware de consumo, posicionándose como una alternativa viable a otros modelos abiertos de gran tamaño. Su capacidad para ejecutar código Python, navegar por la web y manejar salidas estructuradas lo convierte en una opción atractiva para desarrolladores que buscan construir agentes autónomos y aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, 8-bit (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b utiliza una arquitectura de mezcla de expertos (MoE) en la que solo una fracción de los parámetros se activa durante cada inferencia. Con 117B parámetros totales y 5.1B activos, el modelo logra un rendimiento comparable a modelos densos de mayor tamaño, pero con un coste computacional reducido. El entrenamiento se realizó siguiendo el formato de respuesta harmony, un protocolo desarrollado por OpenAI que estructura las interacciones entre el usuario y el modelo, y que es imprescindible para su correcto funcionamiento.

El modelo fue post-entrenado con cuantización MXFP4 aplicada a los pesos de los expertos, lo que reduce significativamente los requisitos de memoria sin degradar el rendimiento en las evaluaciones. Esta técnica permite que gpt-oss-120b se ejecute en una única GPU de 80 GB, como la NVIDIA H100 o la AMD MI300X. Además, el modelo es totalmente fine-tunable, lo que permite adaptarlo a casos de uso específicos mediante ajuste de parámetros. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Razonamiento avanzado con cadena de pensamiento completa y configurable (niveles bajo, medio y alto).
- Soporte nativo para function calling, lo que permite integrar herramientas externas.
- Capacidades agénticas: ejecución de código Python, navegación web y salidas estructuradas (Structured Outputs).
- Generación de texto conversacional y respuestas a preguntas complejas.
- Fine-tuning completo para adaptación a dominios específicos.
- Multilingüismo: no se han especificado los idiomas soportados, pero al ser un modelo de propósito general, se espera cobertura de múltiples lenguas.
- Compatibilidad con el formato harmony, que garantiza consistencia en las interacciones.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo coherencia y resolviendo consultas complejas gracias a su capacidad de razonamiento y su ventana de contexto (aunque no se ha especificado su longitud exacta).
- Generación de código en producción: con soporte para function calling y ejecución de Python, puede integrarse en pipelines de CI/CD para generar, revisar y ejecutar código de forma autónoma.
- Agentes autónomos de investigación: su capacidad para navegar por la web y ejecutar scripts permite construir agentes que recopilen información, la procesen y generen informes estructurados.
- Asistentes de análisis de datos: puede interpretar consultas en lenguaje natural, ejecutar código Python para manipular datos y devolver resultados en formatos estructurados.
- Desarrollo de chatbots especializados: mediante fine-tuning, puede adaptarse a dominios concretos como medicina, derecho o finanzas, manteniendo un alto nivel de precisión.
- Herramientas de depuración y explicación de razonamiento: al exponer la cadena de pensamiento completa, los desarrolladores pueden auditar las decisiones del modelo y mejorar la confianza en sistemas críticos.
- Despliegue en entornos con recursos limitados: gracias a la cuantización MXFP4, puede ejecutarse en una única GPU de 80 GB, lo que reduce los costes de infraestructura en comparación con modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que todas las evaluaciones se realizaron con la cuantización MXFP4, pero no proporciona cifras concretas de métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 80 GB para la versión con cuantización MXFP4 (según la model card).
- GPU recomendadas: NVIDIA H100, AMD MI300X (ambas con 80 GB de memoria). También puede ejecutarse en GPUs de consumo mediante Ollama, aunque no se especifica la VRAM mínima requerida.
- Opciones de despliegue: vLLM (con versión específica `vllm==0.10.1+gptoss`), Transformers (incluido `transformers serve`), Ollama, LM Studio y PyTorch/Triton.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. gpt-oss-120b se posiciona como un modelo de razonamiento de código abierto, compitiendo con otras alternativas como DeepSeek-R1 o Qwen, pero no se han facilitado métricas concretas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo requiere obligatoriamente el formato de respuesta harmony; si no se utiliza, el comportamiento puede ser incorrecto.
- La cadena de pensamiento completa no debe mostrarse a los usuarios finales, ya que puede contener información sensible o pasos intermedios no deseados.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, es susceptible de heredar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de uso de OpenAI para asegurar el cumplimiento.
- No se ha especificado la longitud de contexto, por lo que se desconoce su capacidad para manejar documentos muy largos.

## Enlaces

- [HuggingFace - HieuTruongCong/gpt-oss-120b](https://huggingface.co/HieuTruongCong/gpt-oss-120b)
- [HuggingFace - openai/gpt-oss-120b (original)](https://huggingface.co/openai/gpt-oss-120b)
- [Paper (model card) - arXiv:2508.10925](https://arxiv.org/abs/2508.10925)
- [Blog de OpenAI - Introducing gpt-oss](https://openai.com/index/introducing-gpt-oss/)
- [Repositorio GitHub - openai/gpt-oss](https://github.com/openai/gpt-oss)
- [Guías y cookbook de OpenAI](https://cookbook.openai.com/topic/gpt-oss)
