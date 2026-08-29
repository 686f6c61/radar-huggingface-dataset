# obversarystudios/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de razonamiento de pesos abiertos desarrollado por OpenAI, presentado junto a su variante mayor gpt-oss-120b en agosto de 2025. Este modelo de 20.914 millones de parámetros totales emplea una arquitectura de mezcla de expertos (MoE) con solo 3.600 millones de parámetros activos, lo que permite un equilibrio entre capacidad de razonamiento y eficiencia computacional. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones de copyleft.

El modelo destaca por sus capacidades agénticas nativas, que incluyen function calling, ejecución de código Python, navegación web y salidas estructuradas. Su entrenamiento con el formato de respuesta harmony, junto con la cuantización nativa MXFP4 de las capas MoE, permite que el modelo completo se ejecute en menos de 16 GB de memoria, haciéndolo accesible para hardware de consumo. Su relevancia actual radica en ofrecer razonamiento de nivel avanzado con cadena de pensamiento completa y esfuerzo de razonamiento configurable, a un coste de inferencia reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capas transformer densas |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | 3.600.000.000 (3,6 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 nativa para pesos MoE; soporte adicional de 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-20b utiliza una arquitectura de mezcla de expertos (MoE) donde cada token activa únicamente 3.600 millones de parámetros de un total de 20.900 millones. Esta configuración reduce significativamente el coste computacional por token manteniendo una alta capacidad de conocimiento. Los pesos de las capas MoE se cuantizaron de forma nativa en formato MXFP4 durante el post-entrenamiento, lo que reduce el uso de memoria sin degradar el rendimiento según las evaluaciones oficiales.

El entrenamiento empleó el formato de respuesta harmony desarrollado por OpenAI, un protocolo de formato de salida que estructura las respuestas del modelo. Este formato es obligatorio para el correcto funcionamiento del modelo, ya que sin él las respuestas pueden ser incoherentes. El modelo se entrenó con un enfoque de razonamiento que genera cadenas de pensamiento completas y visibles, permitiendo ajustar el esfuerzo de razonamiento (bajo, medio, alto) según las necesidades de latencia y complejidad de la tarea. No se han publicado datos específicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Razonamiento con cadena de pensamiento completa: genera el proceso de razonamiento interno de forma visible, lo que facilita la depuración y la confianza en las respuestas.
- Esfuerzo de razonamiento configurable: permite seleccionar entre niveles bajo, medio y alto para equilibrar latencia y calidad.
- Function calling nativo: soporta invocación de herramientas y APIs de forma estructurada.
- Ejecución de código Python: puede generar y ejecutar código para resolver problemas computacionales.
- Navegación web: capacidad integrada para interactuar con páginas web y extraer información.
- Salidas estructuradas: genera respuestas en formatos JSON u otros esquemas definidos por el usuario.
- Fine-tuning: permite el ajuste fino completo de todos los parámetros para casos de uso específicos.
- Eficiencia de memoria: la cuantización MXFP4 permite ejecutar el modelo completo dentro de 16 GB de memoria.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno complejas con contexto largo, razonando sobre el historial y generando respuestas coherentes gracias a su cadena de pensamiento visible. Su capacidad de function calling permite integrarse con sistemas de ticketing o CRM para consultar pedidos, gestionar devoluciones o escalar incidencias.

- Asistente de programación en producción: con soporte nativo de function calling y ejecución de código Python, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o ejecutar pruebas unitarias. Su bajo uso de memoria permite desplegarlo en entornos con GPUs de consumo.

- Agente de automatización de tareas: su capacidad de navegación web y ejecución de código lo convierte en un candidato idóneo para construir agentes que rellenen formularios, extraigan datos de páginas web o automaticen flujos de trabajo repetitivos.

- Herramienta educativa de razonamiento: la cadena de pensamiento completa y visible permite su uso en plataformas educativas donde los estudiantes pueden ver el proceso de resolución de problemas matemáticos o lógicos, no solo el resultado final.

- Sistema de análisis de datos conversacional: puede conectarse a bases de datos mediante function calling, generar consultas SQL, ejecutarlas y explicar los resultados en lenguaje natural, facilitando el análisis de datos a usuarios no técnicos.

- Chatbot especializado con fine-tuning: su licencia Apache 2.0 y su capacidad de ajuste fino permiten entrenarlo con datos propios para crear asistentes verticales en dominios como medicina, derecho o finanzas, con razonamiento adaptado al vocabulario y las convenciones del sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial indica que el modelo supera a otros modelos abiertos de tamaño similar en tareas de razonamiento, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 16 GB con cuantización MXFP4 nativa, según la documentación oficial.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), o GPUs profesionales como A100 o H100 para mayor throughput.
- Compatible con hardware de consumo: sí, cabe en GPUs de 16 GB o más gracias a la cuantización MXFP4.
- Opciones de despliegue: Transformers con pipeline de texto, vLLM (versión 0.10.1+gptoss), Ollama (comando `ollama pull gpt-oss:20b`), LM Studio, y Transformers Serve para servidor compatible con OpenAI.
- Latencia y throughput: no disponible, aunque el diseño MoE con 3,6 B parámetros activos sugiere una latencia notablemente inferior a la de modelos densos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Contexto |
|---|---|---|---|---|
| gpt-oss-20b | 20,9 B | 3,6 B | Apache 2.0 | no disponible |
| gpt-oss-120b | 117 B | 5,1 B | Apache 2.0 | no disponible |
| Modelos MoE de codigo abierto similares | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas como DeepSeek-V3 o Qwen-MoE no está disponible en la información proporcionada. El modelo gpt-oss-120b, de la misma familia, ofrece mayor capacidad de razonamiento a cambio de requerir una GPU de 80 GB.

## Limitaciones y advertencias

- Requiere obligatoriamente el formato de respuesta harmony: sin él, el modelo no funciona correctamente y genera salidas incoherentes.
- La cadena de pensamiento completa no debe mostrarse a usuarios finales, ya que puede revelar información sensible o razonamientos incorrectos intermedios.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo donde la cadena de pensamiento puede contener errores no detectados.
- Idiomas soportados no especificados: puede tener un rendimiento desigual en idiomas distintos del inglés.
- La cuantización MXFP4 es nativa y todas las evaluaciones se realizaron con ella, pero puede haber una ligera degradación frente a precisión completa en tareas muy sensibles.
- No se han publicado datos sobre sesgos específicos del modelo, aunque al ser un modelo entrenado por OpenAI puede heredar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 es permisiva, pero se aplica la política de uso de gpt-oss de OpenAI, que puede imponer restricciones adicionales en ciertos casos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openai/gpt-oss-20b
- Modelo en HuggingFace (repo de obversarystudios): https://huggingface.co/obversarystudios/gpt-oss-20b
- Paper técnico (arXiv): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card oficial: https://openai.com/index/gpt-oss-model-card/
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Demo interactiva: https://gpt-oss.com
- Documentación API: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/gpt-oss-20b
