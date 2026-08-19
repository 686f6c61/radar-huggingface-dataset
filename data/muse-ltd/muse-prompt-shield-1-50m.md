# Muse-Ltd/Muse-Prompt-Shield-1-50M

## Resumen

Muse Prompt Shield (Muse-Prompt-Shield-1-50M) es un clasificador de texto desarrollado por Muse-Ltd para detectar dos tipos de ataques dirigidos a modelos de lenguaje: prompt injection y jailbreak. El modelo categoriza las entradas en tres etiquetas — benign, injection y jailbreak — lo que permite a los desarrolladores filtrar tanto contenido de terceros (por ejemplo, datos extraídos de la web) como diálogos de usuarios que intentan vulnerar las salvaguardas del sistema. Está basado en DeBERTa-v3-xsmall, la misma arquitectura que utiliza el Llama Prompt Guard 2 de Meta, y cuenta con 49,9 millones de parámetros.

La relevancia de este modelo radica en que, a diferencia de la mayoría de los guardrails de prompts, fue entrenado exclusivamente con datos no sintéticos: ejemplos anotados por humanos, inyecciones creadas por investigadores y jailbreaks reales recopilados de comunidades como Reddit y Discord. Esto lo hace especialmente útil como punto de partida para aplicaciones que necesitan proteger sus LLM frente a ataques reales, aunque los autores recomiendan un ajuste fino específico para cada caso de uso. Su ventana de contexto es de 4.096 tokens, y admite entradas multilingües, con especial solidez en inglés y detección verificada en francés, alemán, portugués, italiano, español y rumano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-xsmall (transformers encoder) |
| Parametros totales | 49.999.107 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto) |
| Idiomas soportados | ingles, multilingue (frances, aleman, portugues, italiano, español, rumano) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v3-xsmall, un encoder transformer de la familia DeBERTa que incorpora mecanismos de atencion con decoupling y posiciones relativas mejoradas. La version xsmall tiene alrededor de 50 millones de parametros, lo que lo convierte en un modelo ligero y rapido para tareas de clasificacion de secuencias. Se utiliza como clasificador de secuencias con tres etiquetas de salida: BENIGN, INJECTION y JAILBREAK.

El entrenamiento se realizo mediante fine-tuning sobre una corpus de ataques reales, sin datos sinteticos. La model card indica que los datos provienen de ejemplos anotados por humanos, inyecciones creadas por investigadores y jailbreaks recopilados de Reddit, Discord y otras comunidades. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La separacion entre las etiquetas INJECTION y JAILBREAK permite a los desarrolladores aplicar filtros diferenciados: mas estrictos para contenido de terceros y mas permisivos para dialogos de usuario, donde solo se filtra el jailbreak explicito.

## Capacidades

- Clasificacion de entradas en tres categorias: benign, injection y jailbreak.
- Deteccion de prompt injection en contenido de terceros (por ejemplo, paginas web consumidas por un LLM).
- Deteccion de jailbreaks que intentan anular el system prompt o las salvaguardas de seguridad del modelo.
- Soporte multilingue: entrenado con ejemplos reales en frances, aleman, portugues, italiano, español y rumano; evaluacion principal en ingles.
- Ventana de contexto de 4.096 tokens, con recomendacion de dividir entradas largas en segmentos y escanearlos en paralelo.
- Integracion sencilla con la API pipeline de Transformers y con AutoTokenizer + AutoModelForSequenceClassification.
- Modelo ligero (50M de parametros) adecuado para inferencia en CPU o GPU de baja capacidad.

## Casos de uso

- Filtrado de contenido de terceros en aplicaciones RAG: antes de inyectar fragmentos de documentos o paginas web en el contexto de un LLM, se puede pasar cada fragmento por Muse Prompt Shield para descartar aquellos que contengan instrucciones maliciosas, evitando que el modelo siga ordenes incrustadas en datos externos.
- Guardrail de entrada en chatbots de atencion al cliente: el modelo puede analizar los mensajes de los usuarios en tiempo real y bloquear intentos de jailbreak que intenten evadir las politicas de seguridad del asistente, reduciendo el riesgo de respuestas inapropiadas o dano reputacional.
- Priorizacion de incidentes de seguridad: en entornos de produccion, el modelo puede etiquetar prompts sospechosos para que un equipo de seguridad los revise manualmente, facilitando la creacion de datasets de ataques especificos de la aplicacion.
- Filtrado de prompts en herramientas de generacion de codigo: antes de enviar un prompt a un asistente de codigo, se puede verificar que no contenga inyecciones que intenten hacer que el modelo revele informacion sensible o ejecute comandos no deseados.
- Moderacion de contenido en foros o comunidades online: el modelo puede analizar publicaciones y comentarios para detectar intentos de jailbreak o inyecciones dirigidas a bots moderadores basados en LLM, aplicando politicas de eliminacion automatica.
- Preprocesamiento de datos para fine-tuning de modelos de seguridad: las predicciones del modelo pueden usarse para etiquetar grandes volumenes de prompts reales, generando datos de entrenamiento para ajustar modelos mas grandes o especificos de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion es principalmente en ingles y que se realizaron comprobaciones puntuales de inyecciones en frances con una confianza superior a 0.999, pero no proporciona metricas cuantitativas como precision, recall o F1 sobre conjuntos de prueba estandarizados.

## Requisitos de hardware

- Al tratarse de un modelo de 50 millones de parametros, la inferencia puede ejecutarse en CPU sin problemas, con una latencia del orden de milisegundos por muestra en hardware moderno.
- En GPU, cabe en cualquier tarjeta con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). El peso en fp32 ocupa aproximadamente 200 MB.
- No se han publicado requisitos especificos de VRAM ni latencia por parte del autor.
- Se puede desplegar con la libreria Transformers de HuggingFace, tanto en modo pipeline como con el API de bajo nivel. Tambien es compatible con endpoints de HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`).
- Para entornos de produccion con alto trafico, se recomienda usar soluciones como vLLM o TGI, aunque no se ha verificado su compatibilidad explicita; el modelo es un encoder pequeno y puede servirse facilmente con cualquier framework de clasificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Muse Prompt Shield (este) | 50M | 4.096 | DeBERTa-v3-xsmall, datos reales | CC-BY-4.0 |
| Llama Prompt Guard 2 (Meta) | 22M | 4.096 | DeBERTa-v3-xsmall, datos sinteticos y reales | Llama 3.1 Community License |
| Llama Guard 3 (Meta) | 8B | 8.192 | LLM basado en Llama 3, clasifica seguridad de prompts y respuestas | Llama 3.1 Community License |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la informacion proporcionada. La diferencia clave es que Muse Prompt Shield se entrena exclusivamente con datos no sinteticos, mientras que Llama Prompt Guard 2 combina datos sinteticos y reales. Llama Guard 3 es un modelo mucho mayor que ofrece clasificacion de seguridad tanto de entrada como de salida, pero requiere recursos de hardware superiores.

## Limitaciones y advertencias

- El modelo esta disenado para clasificar prompts, no respuestas; no detecta contenido generado por el LLM.
- La evaluacion sistematica se ha realizado principalmente en ingles; el rendimiento en otros idiomas no esta garantizado y puede variar significativamente.
- La ventana de contexto de 4.096 tokens obliga a segmentar entradas largas, lo que puede perder el contexto global de un ataque distribuido en varias partes.
- Al estar entrenado con datos reales, puede presentar sesgos hacia los patrones de ataque mas comunes en las comunidades de donde se extrajeron los datos, dejando fuera variantes menos frecuentes.
- No se proporcionan metricas de precision o recall, por lo que el umbral de confianza para tomar decisiones de filtrado debe calibrarse en cada aplicacion.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero no incluye garantias de seguridad ni soporte oficial.
- Se recomienda un ajuste fino con datos especificos de la aplicacion para lograr una precision alta; el uso directo puede generar falsos positivos o negativos en entornos con distribuciones de entrada atipicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muse-Ltd/Muse-Prompt-Shield-1-50M
- Modelo base DeBERTa-v3-xsmall: https://huggingface.co/microsoft/deberta-v3-xsmall
- Referencia a Llama Prompt Guard 2 (mencionado en la model card): https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M (no verificado, se cita como referencia del mismo base)
