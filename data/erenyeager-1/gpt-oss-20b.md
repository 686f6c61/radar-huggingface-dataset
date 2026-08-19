# erenyeager-1/gpt-oss-20b

## Resumen

gpt-oss-20b es la variante compacta de la serie gpt-oss, un conjunto de modelos de lenguaje de pesos abiertos desarrollado por OpenAI y publicado bajo licencia Apache 2.0. Este modelo, con 21 000 millones de parámetros totales y 3 600 millones activos, emplea una arquitectura de mezcla de expertos (MoE) optimizada para ofrecer baja latencia y ejecución en hardware de consumo. Está diseñado para tareas de razonamiento, uso agéntico y desarrollo de aplicaciones, e incluye capacidades nativas de function calling, ejecución de código Python y salidas estructuradas.

El modelo se distribuye con cuantización MXFP4 post-entrenamiento, lo que permite ejecutarlo en tan solo 16 GB de memoria, y es compatible con los principales frameworks de inferencia como Transformers, vLLM, Ollama y LM Studio. Su entrenamiento se basa en el formato de respuesta harmony, un protocolo que estructura las respuestas del modelo y que es obligatorio para su correcto funcionamiento. La publicación de este modelo representa un hito relevante en la estrategia de OpenAI de ofrecer pesos abiertos con capacidades avanzadas de razonamiento y agencia, compitiendo directamente con otras familias MoE de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención de transformador, variante gpt_oss |
| Parametros totales | 20 914 757 184 (21 B) |
| Parametros activos | 3 600 000 000 (3,6 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (nativa, aplicada post-entrenamiento); se menciona compatibilidad con 8-bit en los metadatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en formato original para gpt-oss) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformador con mezcla de expertos (MoE), donde solo 3 600 millones de parámetros se activan por token, lo que reduce significativamente el coste computacional en inferencia. Esta configuración permite un rendimiento elevado en razonamiento y tareas agénticas con un presupuesto de memoria reducido. La cuantización MXFP4 se aplicó durante el post-entrenamiento, de modo que todos los pesos del MoE están cuantizados a 4 bits de mantisa y 4 bits de exponente, logrando una huella de memoria de aproximadamente 16 GB para el modelo completo.

En cuanto al entrenamiento, no se han publicado detalles específicos sobre el volumen de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible. Sin embargo, se sabe que el modelo fue entrenado siguiendo el formato de respuesta harmony, un protocolo desarrollado por OpenAI que estructura las respuestas en secciones de razonamiento y respuesta final. Este formato es imprescindible: si no se aplica mediante la plantilla de chat de Transformers o la herramienta openai-harmony, el modelo no genera salidas correctas. Además, el modelo soporta un esfuerzo de razonamiento configurable (bajo, medio, alto), lo que permite ajustar el equilibrio entre calidad y latencia según el caso de uso.

## Capacidades

- Generacion de texto y razonamiento avanzado: resuelve problemas complejos de logica, matematicas y analisis con cadenas de pensamiento completas y accesibles.
- Function calling nativo: puede invocar herramientas externas mediante llamadas a funciones estructuradas, integrandose en pipelines agénticos.
- Ejecucion de codigo Python: capaz de generar y ejecutar codigo Python en entornos controlados para tareas como calculo simbolico, analisis de datos o automatizacion.
- Salidas estructuradas (Structured Outputs): genera respuestas que cumplen esquemas JSON u otros formatos definidos por el usuario, util para integraciones API.
- Navegacion web: puede realizar busquedas y extraer informacion de paginas web cuando se combina con herramientas de navegacion.
- Esfuerzo de razonamiento configurable: permite seleccionar entre niveles low, medium y high para controlar la profundidad del razonamiento y la latencia.
- Capacidades multilingues: aunque no se especifican idiomas concretos, el modelo esta entrenado para soportar multiples lenguas, como es habitual en la serie gpt-oss.
- Compatibilidad con frameworks de inferencia: funciona con Transformers, vLLM, Ollama, LM Studio y PyTorch/Triton, ademas de ofrecer una interfaz compatible con la API de OpenAI.

## Casos de uso

- Asistente de codigo en entornos de desarrollo: el modelo puede integrarse en IDE o pipelines de CI/CD para generar, revisar y refactorizar codigo. Su soporte de function calling permite conectarlo a herramientas de compilacion o analisis estatico, y su bajo uso de memoria (16 GB) lo hace viable en estaciones de trabajo con una GPU consumer.
- Automatizacion de tareas agénticas: gracias a su capacidad de ejecutar Python y navegar por la web, puede actuar como agente autonomo para recopilar datos, completar formularios o interactuar con APIs, todo ello con un esfuerzo de razonamiento ajustable para cumplir requisitos de latencia.
- Chatbot de atencion al cliente con razonamiento: al poder configurar el esfuerzo de razonamiento, el modelo puede ofrecer respuestas rapidas para consultas simples y activar un modo mas profundo para problemas complejos, manteniendo un coste computacional contenido.
- Analisis de documentos y extraccion de informacion estructurada: su capacidad de generar salidas estructuradas (JSON) permite procesar contratos, informes o articulos cientificos y devolver campos normalizados, ideal para sistemas de gestion documental.
- Prototipado rapido de aplicaciones de IA: al ser un modelo de pesos abiertos con licencia permisiva, los equipos pueden experimentar sin restricciones comerciales y desplegar versiones locales sin depender de APIs externas, reduciendo costes y latencia.
- Educacion e investigacion en razonamiento: la exposicion completa de la cadena de pensamiento facilita el analisis de los procesos de razonamiento del modelo, siendo util para estudiar sesgos, evaluar explicabilidad o desarrollar tecnicas de prompting.
- Despliegue en hardware de consumo: con la cuantizacion MXFP4, el modelo cabe en 16 GB de VRAM, lo que permite ejecutarlo en GPUs como la RTX 4080 o 4090 para aplicaciones locales de procesamiento de lenguaje natural sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card oficial de OpenAI no incluye tablas comparativas con otros modelos, y los resultados de busqueda web tampoco proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras evaluaciones. Se recomienda consultar la documentacion oficial de OpenAI o el paper arxiv:2508.10925 para obtener datos de rendimiento cuando esten disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB con cuantizacion MXFP4, segun la model card oficial.
- GPUs recomendadas: NVIDIA H100, A100 o AMD MI300X para el modelo completo sin cuantizacion adicional; con MXFP4 cabe en GPUs consumer de 16 GB como RTX 4080, RTX 4090 o RTX 4070 Ti.
- Compatibilidad con consumer GPU: si, siempre que se utilice la cuantizacion MXFP4 y se disponga de al menos 16 GB de VRAM.
- Opciones de despliegue: Transformers (con pipeline y chat template), vLLM (version pre-release 0.10.1+gptoss), Ollama (comando `ollama pull gpt-oss:20b`), LM Studio, y PyTorch/Triton con las implementaciones de referencia del repositorio gpt-oss.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del nivel de esfuerzo de razonamiento seleccionado.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas directas con otros modelos. Como referencia interna, la serie gpt-oss incluye la variante mayor `gpt-oss-120b` (117 B totales, 5,1 B activos), que ofrece mayor capacidad de razonamiento pero requiere una GPU de 80 GB. No se dispone de datos comparativos frente a otras familias MoE como Qwen2.5-MoE o DeepSeek-V3 en la informacion proporcionada, por lo que se recomienda consultar benchmarks externos para una evaluacion objetiva.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b | 21 B | 3,6 B | no disponible | Apache 2.0 | Cuantizacion MXFP4, 16 GB VRAM |
| gpt-oss-120b | 117 B | 5,1 B | no disponible | Apache 2.0 | Requiere 80 GB VRAM, mayor capacidad |

## Limitaciones y advertencias

- El modelo depende del formato harmony: si no se aplica la plantilla de chat de Transformers o el paquete openai-harmony, las respuestas seran incorrectas. Esto limita su uso en entornos que no soporten este formato.
- La cadena de pensamiento completa es accesible, pero OpenAI recomienda no mostrarla a usuarios finales por posibles sesgos o informacion no deseada.
- No se han publicado datos sobre sesgos especificos, pero como modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- Riesgo de alucinacion: al igual que otros modelos generativos, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo si el esfuerzo configurado es bajo.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero el usuario es responsable del cumplimiento de las leyes aplicables y de la gestion de datos personales.
- La cuantizacion MXFP4 es la unica verificada oficialmente; otras cuantizaciones (por ejemplo, 8-bit) pueden requerir validacion adicional y no garantizan el mismo rendimiento.
- El contexto maximo no se ha especificado en la informacion disponible, por lo que se desconoce si soporta ventanas largas (128k o mas) como otros modelos de OpenAI.
- Para produccion, se recomienda probar exhaustivamente el modelo con el formato harmony y validar su comportamiento en el dominio especifico antes de un despliegue a gran escala.

## Enlaces

- Modelo original en Hugging Face: https://huggingface.co/openai/gpt-oss-20b
- Repositorio espejo (autor erenyeager-1): https://huggingface.co/erenyeager-1/gpt-oss-20b
- Repositorio GitHub de gpt-oss: https://github.com/openai/gpt-oss
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Paper tecnico (arXiv): https://arxiv.org/abs/2508.10925
- Guias y cookbook de OpenAI: https://cookbook.openai.com/topic/gpt-oss
- Sitio web de prueba: https://gpt-oss.com
- Documentacion de la API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- DeepWiki sobre gpt-oss-20b: https://deepwiki.com/openai/gpt-oss/2.2-gpt-oss-20b
