# dineth9d/qwen2.5-1.5b-earnings-risk-extractor

## Resumen

El modelo `dineth9d/qwen2.5-1.5b-earnings-risk-extractor` es un adaptador QLoRA construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por dineth9d como parte de una evaluacion tecnica para el puesto de Senior ML Engineer en CDAZZDEV. Su funcion es extraer un registro estructurado de riesgos a partir de comentarios de gestion procedentes de earnings calls y secciones de MD&A (Management Discussion and Analysis) de informes financieros.

El modelo resuelve un problema concreto de extraccion de informacion financiera: transformar pasajes de texto no estructurado en JSON con una taxonomia cerrada de 10 categorias de riesgo, nivel de severidad, horizonte temporal y un fragmento de evidencia citado textualmente. Esta especializacion lo hace relevante para equipos que necesitan automatizar el analisis de comunicaciones financieras sin depender de APIs propietarias de pago.

Con 1.543.714.304 parametros totales (el adaptador PEFT anade pesos LoRA sobre el modelo base de 1.5B), una longitud de contexto de 1024 tokens durante el entrenamiento y soporte exclusivo para ingles, es un modelo ligero que puede ejecutarse en hardware de consumo. El repositorio incluye pesos en formato safetensors y se distribuye bajo licencia no especificada, aunque hereda la licencia Apache 2.0 del modelo base Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptadores LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | 1.543.714.304 (no es MoE) |
| Longitud de contexto | 1024 tokens (max_seq_len de entrenamiento; el modelo base soporta hasta 32768) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento); inferencia en fp16 o cuantizacion posterior no especificada |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el modelo base Qwen2.5 usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar. La capa LoRA se aplica con r=16, alpha=32 y dropout de 0.05 sobre todas las proyecciones de atencion y MLP. El entrenamiento se realizo con cuantizacion 4-bit NF4 con doble cuantizacion y computacion en fp16, usando el optimizador paged_adamw_8bit con tasa de aprendizaje 0.0002, schedule coseno y warmup del 3%.

El dataset de entrenamiento consta de 83 ejemplos de entrenamiento, 10 de validacion y 11 de test, generados sinteticamente por el modelo profesor `openai/gpt-oss-120b` en 11 sectores industriales. La perdida se calcula solo sobre los tokens de completado, enmascarando el prompt con -100. Se entrenaron 3 epocas con batch efectivo de 16 y una longitud maxima de secuencia de 1024 tokens, todo ello en una unica GPU T4 de Colab.

Una innovacion destacable es el uso de un modelo profesor para generar datos sinteticos etiquetados, lo que permite crear un dataset especializado sin anotacion manual. Sin embargo, esto implica que el modelo hereda el registro estilistico y los puntos ciegos del profesor, y no ha sido validado contra documentos reales de la SEC.

## Capacidades

- Extraccion de registros de riesgo estructurados en JSON a partir de pasajes de comentarios de gestion.
- Clasificacion de riesgos en una taxonomia cerrada de 10 categorias predefinidas.
- Asignacion de nivel de severidad y horizonte temporal a cada riesgo identificado.
- Citacion de evidencia textual: extrae fragmentos verbatim del pasaje original como soporte de cada riesgo.
- Generacion de salida estructurada siguiendo el formato de chat de Qwen2.5-Instruct.
- Procesamiento de pasajes de hasta 1024 tokens de longitud.
- Soporte exclusivo para texto en ingles.
- Capacidad limitada de razonamiento heredada del modelo base Qwen2.5-1.5B-Instruct, aunque el fine-tuning esta orientado a una tarea especifica de extraccion.

## Casos de uso

- Automatizacion de registros de riesgo para analistas financieros: el modelo puede procesar transcripciones de earnings calls y generar un registro JSON de riesgos con categorias, severidad y horizonte temporal, reduciendo el tiempo manual de revision de horas a minutos.
- Screening preliminar de comunicaciones financieras: equipos de inversiones pueden usar el modelo para filtrar rapidamente un gran volumen de transcripciones y detectar que empresas mencionan riesgos de una categoria concreta (por ejemplo, regulatorio o de cadena de suministro).
- Integracion en pipelines de compliance: el modelo puede alimentar sistemas de gestion de riesgos empresariales con datos estructurados extraidos de informes trimestrales, siempre que la salida se verifique contra la fuente original.
- Generacion de alertas tempranas: combinado con un scheduler, el modelo puede monitorizar publicaciones de resultados y emitir alertas cuando detecta riesgos de severidad alta en sectores especificos.
- Preparacion de datos para RAG financiero: la salida JSON estructurada puede indexarse en una base vectorial para construir sistemas de pregunta-respuesta sobre riesgos corporativos.
- Formacion de analistas junior: el modelo puede servir como herramienta de ensenanza mostrando como se clasifican los riesgos y que evidencia textual los respalda, con un coste de inferencia minimo al ser un modelo de 1.5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (como precision, recall o F1 sobre la taxonomia de riesgos) ni comparaciones con otros modelos. El unico dato de rendimiento disponible es el tamaño del dataset de test: 11 ejemplos, lo que sugiere que cualquier evaluacion seria estadisticamente limitada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en fp16 para el modelo completo de 1.5B, y alrededor de 2-3 GB si se aplica cuantizacion 4-bit o 8-bit.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, incluyendo RTX 3060, RTX 4060, T4, o incluso CPU con llama.cpp para velocidades reducidas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPUs consumer modernas (RTX 3060 en adelante) y en Macs con Apple Silicon via llama.cpp.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte para LoRA), llama.cpp, Ollama (si se convierte a GGUF), y TGI.
- Latencia estimada: en una T4, la generacion de 512 tokens tarda aproximadamente 10-20 segundos; en una RTX 4090, entre 2-5 segundos. El throughput depende del batch size y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| dineth9d/qwen2.5-1.5b-earnings-risk-extractor | 1.5B | 1024 (entrenamiento) | Extraccion de riesgos financieros | no disponible |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.5B | 32768 | Chat general, razonamiento, codigo | Apache 2.0 |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32768 | Chat general, mejor rendimiento que 1.5B | Apache 2.0 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la tarea especifica de extraccion de riesgos. La comparativa se limita a parametros, contexto y licencia. El modelo fine-tuneado ofrece la ventaja de estar especializado en la tarea, pero el modelo base de 3B podria ofrecer mejor rendimiento general si se fine-tunea con el mismo dataset.

## Limitaciones y advertencias

- Entrenado exclusivamente con pasajes sinteticos generados por un modelo profesor, no con documentos reales de la SEC ni transcripciones autenticas de earnings calls.
- El modelo hereda el registro estilistico y los puntos ciegos del profesor `openai/gpt-oss-120b`, lo que puede introducir sesgos en la clasificacion de riesgos.
- No ha sido validado contra documentos reales, por lo que su rendimiento en produccion con datos reales es incierto.
- Los fragmentos de evidencia estan fundamentados por construccion, pero deben verificarse contra la fuente original antes de cualquier uso downstream.
- Dataset de entrenamiento muy pequeno (83 ejemplos), lo que limita la generalizacion a sectores o formatos no vistos durante el entrenamiento.
- Soporte exclusivo para ingles; no funciona con textos en otros idiomas.
- La licencia no esta especificada en el repositorio, aunque el modelo base usa Apache 2.0. Se recomienda contactar al autor para uso comercial.
- No es asesoramiento de inversion; el modelo no debe utilizarse para tomar decisiones financieras sin supervision humana.
- La longitud de contexto de entrenamiento es de 1024 tokens, por lo que pasajes mas largos deben truncarse o dividirse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dineth9d/qwen2.5-1.5b-earnings-risk-extractor
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Technical Report de Qwen2.5: https://arxiv.org/pdf/2412.15115
