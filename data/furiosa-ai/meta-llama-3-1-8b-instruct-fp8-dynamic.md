# furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic

## Resumen

Este repositorio contiene la variante cuantizada FP8-dynamic de Llama-3.1-8B-Instruct, publicada por FuriosaAI. Se trata de un transformer denso autorregresivo optimizado para diálogo multilingüe, seguimiento de instrucciones y uso de herramientas, derivado de la versión cuantizada publicada por RedHatAI y, en última instancia, del modelo original de Meta. La cuantización FP8-dynamic reduce el uso de memoria y acelera la inferencia manteniendo una calidad cercana a la versión en BF16, lo que lo hace adecuado para despliegue en producción con hardware especializado.

El modelo se distribuye junto con un Furiosa Executable Bundle (FXB) para ejecutarse en el acelerador FuriosaAI RNGD mediante el framework Furiosa-LLM, aunque los pesos en formato safetensors también son compatibles con otros motores de inferencia como vLLM, SGLang o Transformers. Con 8.030 millones de parámetros, está pensado para tareas de generación de texto, tool calling y razonamiento conversacional en ocho idiomas, bajo la licencia comunitaria Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer denso autorregresivo) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8-dynamic (pesos FP8 estaticos, activaciones FP8 dinamicas por token) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (incluye FXB para Furiosa-LLM) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Llama 3.1 de Meta: un transformer denso autorregresivo con normalización RMSNorm, atención multi-cabeza con RoPE y MLP con activación SwiGLU. La variante FP8-dynamic cuantiza los pesos de las capas lineales de los bloques Transformer a FP8 de forma estática, mientras que las activaciones se cuantizan dinámicamente a FP8 por token durante la inferencia, sin necesidad de calibración offline. Esta estrategia reduce el footprint de memoria y mejora el throughput en el hardware RNGD.

No se proporcionan datos específicos sobre el entrenamiento de esta variante cuantizada; al ser una conversión del modelo RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8-dynamic, hereda las capacidades del modelo base Llama-3.1-8B-Instruct de Meta, que fue entrenado con un corpus multilingüe y ajustado mediante instrucciones y RLHF. La cuantización se aplica posteriormente sin reentrenamiento, por lo que no introduce cambios en el comportamiento funcional más allá de la pérdida de precisión inherente a FP8.

## Capacidades

- Generación de texto y diálogo multilingüe en ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Seguimiento de instrucciones y respuesta a preguntas de propósito general.
- Tool calling y function calling mediante el parser `llama3_json`, el mismo utilizado por la serie Llama 3.
- Soporte para razonamiento multi-paso y uso de herramientas en flujos agénticos, habilitado a través de la API compatible con OpenAI de Furiosa-LLM.
- Entrada y salida exclusivamente de texto; no incluye capacidades de visión ni audio.
- Compatibilidad con frameworks estándar (vLLM, SGLang, Transformers) usando los pesos upstream, lo que permite integración en ecosistemas existentes.

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo puede gestionar conversaciones multi-turno en varios idiomas, reduciendo la necesidad de agentes humanos en soporte de primer nivel. Su soporte de tool calling permite consultar bases de datos de pedidos o sistemas de ticketing.
- Asistentes de código con integración de herramientas: gracias al parser `llama3_json`, puede invocar funciones externas como ejecutar tests, buscar documentación o interactuar con APIs, integrándose en pipelines de desarrollo.
- Automatización de tareas empresariales: el function calling permite orquestar flujos como reservas, envío de correos o actualización de registros CRM, con un único modelo desplegado en el acelerador RNGD.
- Traducción y localización de contenido: con soporte para ocho idiomas, puede traducir textos y adaptar contenido manteniendo el tono conversacional, útil para equipos de producto y marketing.
- Clasificación y análisis de sentimiento: su capacidad de seguimiento de instrucciones permite etiquetar comentarios, reseñas o tickets de soporte en múltiples idiomas, alimentando paneles de análisis.
- Generación de respuestas en sistemas RAG: al combinarse con un motor de recuperación, el modelo puede redactar respuestas basadas en documentos corporativos, con la opción de llamar a herramientas para verificar datos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con una estrategia de tensor-parallel de 8 PEs que mapea a una única tarjeta (8 PEs por tarjeta).
- VRAM estimada: no disponible; el tamaño del repositorio es de 10,2 GB, pero el consumo exacto de memoria en inferencia no se especifica.
- GPU recomendadas: no aplica; el FXB está compilado exclusivamente para RNGD. Los pesos en safetensors pueden ejecutarse en GPUs estándar mediante vLLM, SGLang o Transformers, pero no se indican requisitos concretos.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) para RNGD, o frameworks convencionales con los pesos upstream.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic | 8B | FP8-dynamic | No disponible | Llama 3.1 Community | FuriosaAI RNGD |
| RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8-dynamic | 8B | FP8-dynamic | No disponible | Llama 3.1 Community | GPUs (vLLM, SGLang, Transformers) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | BF16 | No disponible | Llama 3.1 Community | GPUs estándar |

La diferencia principal frente al modelo original de Meta es la cuantización FP8-dynamic, que reduce el uso de memoria y acelera la inferencia en hardware compatible. Frente a la variante de RedHatAI, la versión de FuriosaAI añade el FXB precompilado para RNGD, lo que elimina la necesidad de compilar el modelo para ese hardware. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Llama-3.1-8B-Instruct, que pueden reflejar prejuicios presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventado, especialmente en temas especializados o de baja frecuencia.
- Limitaciones de contexto: la longitud de contexto no se especifica en la documentación; se recomienda verificar la ventana soportada antes de usarlo en tareas que requieran documentos largos.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones de uso comercial, incluyendo requisitos de atribución y restricciones para usuarios con más de 700 millones de usuarios mensuales.
- Hardware específico: el FXB incluido solo funciona en FuriosaAI RNGD; para otros entornos es necesario usar los pesos upstream con frameworks compatibles.
- Pérdida de precisión: la cuantización FP8 puede degradar ligeramente la calidad en tareas de alta sensibilidad numérica o razonamiento complejo, aunque no se han publicado evaluaciones cuantitativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Meta-Llama-3.1-8B-Instruct-FP8-dynamic
- Modelo upstream (RedHatAI): https://huggingface.co/RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8-dynamic
- Modelo base (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Documentación de Llama 3.1 en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/llama-3.1.html
