# openai/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de razonamiento de pesos abiertos desarrollado por OpenAI, presentado junto a su variante mayor gpt-oss-120b en agosto de 2025. Con 21.000 millones de parámetros totales y 3.600 millones de parámetros activos, está diseñado para ofrecer baja latencia y ejecución eficiente en hardware de consumo, manteniendo capacidades de razonamiento avanzado y uso agéntico. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft, y es especialmente relevante por su cuantización MXFP4 integrada, que reduce el consumo de memoria a aproximadamente 16 GB, facilitando su despliegue en GPUs domésticas.

El modelo emplea una arquitectura de mezcla de expertos (MoE) y ha sido entrenado específicamente con el formato de respuesta harmony, un protocolo que estructura las interacciones para optimizar el razonamiento y la generación de respuestas. Incluye capacidades nativas de chain-of-thought completo, ajuste del esfuerzo de razonamiento (bajo, medio, alto), function calling, ejecución de código Python y salidas estructuradas. Su lanzamiento responde a la necesidad de modelos abiertos con rendimiento competitivo en tareas de razonamiento y agénticas, a la vez que sean desplegables en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) |
| Parametros totales | 21.511.953.984 (21B) |
| Parametros activos | 3.600.000.000 (3,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (integrada), 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-20b utiliza una arquitectura de mezcla de expertos (MoE) con 21.000 millones de parámetros totales, de los cuales solo 3.600 millones se activan por token, lo que reduce el coste computacional en inferencia. Los pesos de los expertos han sido post-entrenados con cuantización MXFP4, una técnica que reduce la precisión numérica a 4 bits manteniendo la calidad de salida; todas las evaluaciones oficiales se realizaron con esta cuantización. El modelo fue entrenado con el formato de respuesta harmony, un protocolo de interacción que estructura los mensajes y las respuestas para mejorar la coherencia y el razonamiento. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Razonamiento avanzado con chain-of-thought completo: el modelo genera su proceso de razonamiento paso a paso, accesible para depuración y auditoría, aunque no debe mostrarse directamente a usuarios finales.
- Configuración del esfuerzo de razonamiento: permite ajustar el nivel de razonamiento (bajo, medio, alto) según la latencia y la complejidad de la tarea.
- Function calling nativo: puede invocar herramientas y funciones externas de forma estructurada, facilitando la integración en flujos agénticos.
- Ejecución de código Python: capacidad de generar y ejecutar código Python en entornos controlados, útil para tareas de análisis y automatización.
- Salidas estructuradas: soporta generación de respuestas en formatos JSON u otros esquemas definidos, adecuado para integraciones API.
- Fine-tuning: el modelo es completamente ajustable mediante fine-tuning con parámetros, permitiendo personalización para dominios específicos.
- Navegación web: capacidad de interactuar con páginas web como parte de flujos agénticos, según la documentación oficial.
- Multilingüismo: no se ha especificado la lista de idiomas soportados en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento estructurado, manteniendo coherencia en diálogos largos y derivando consultas complejas a agentes humanos cuando sea necesario. Su bajo coste de inferencia permite desplegarlo en entornos de producción con alta concurrencia.
- Agentes autónomos de automatización de tareas: gracias a su soporte nativo de function calling y ejecución de código Python, puede orquestar flujos como la extracción de datos de APIs, la actualización de bases de datos o la generación de informes, todo ello con un razonamiento paso a paso verificable.
- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de código, revisión de fragmentos y generación de pruebas unitarias. Su capacidad de ejecutar Python permite validar el código generado antes de integrarlo en el repositorio.
- Análisis de datos y generación de informes: con su habilidad para ejecutar Python y producir salidas estructuradas, puede procesar datasets, calcular métricas y generar resúmenes en formato JSON o Markdown, integrándose en pipelines de datos.
- Asistente de investigación y documentación técnica: el chain-of-thought completo facilita la trazabilidad de las respuestas, lo que resulta útil para tareas de síntesis de información, redacción de documentación técnica o preparación de materiales educativos.
- Despliegue en hardware de consumo: al caber en 16 GB de memoria con cuantización MXFP4, puede ejecutarse en portátiles y estaciones de trabajo con GPUs como la RTX 4080 o 4090, permitiendo prototipado rápido y uso offline sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card oficial menciona que el modelo supera a otros modelos abiertos de tamaño similar en tareas de razonamiento, pero no se incluyen cifras concretas en los materiales proporcionados. Los resultados detallados están disponibles en el paper técnico (arXiv:2508.10925), aunque no se han reproducido aquí.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB con cuantización MXFP4 integrada, según la documentación oficial.
- GPUs compatibles: cualquier GPU con al menos 16 GB de memoria, como NVIDIA RTX 4080, RTX 4090, A100, H100 o AMD MI300X. También puede ejecutarse en GPUs con menos memoria usando cuantizaciones adicionales de 8 bits.
- Despliegue en consumer GPU: sí, es viable en GPUs de gama alta de consumo gracias a la cuantización MXFP4.
- Opciones de despliegue: compatible con Transformers (incluido Transformers Serve), vLLM (versión específica `vllm==0.10.1+gptoss`), Ollama, LM Studio y PyTorch/Triton mediante implementaciones de referencia.
- Latencia y throughput: no se han proporcionado cifras concretas; se espera baja latencia por su reducido número de parámetros activos (3,6B), pero los valores dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa cuantitativa con otros modelos de la misma categoría. Se recomienda consultar el paper técnico para ver comparaciones con modelos como Llama 3.1, Qwen 2.5 o DeepSeek, aunque esos datos no están disponibles en esta ficha.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo con otros formatos puede degradar significativamente la calidad de las respuestas.
- El chain-of-thought generado por el modelo no debe mostrarse a usuarios finales, ya que puede contener razonamientos incompletos o incorrectos; debe usarse únicamente para depuración interna.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo. Se recomienda verificar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero OpenAI impone una "gpt-oss usage policy" adicional que debe revisarse antes del despliegue.
- No se ha especificado la longitud de contexto máxima, por lo que se desconoce su capacidad para manejar documentos largos.
- Los idiomas soportados no están documentados, lo que limita la confianza en despliegues multilingües sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Paper técnico (arXiv): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card oficial: https://openai.com/index/gpt-oss-model-card/
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Documentación de API: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Demo interactiva: https://gpt-oss.com
