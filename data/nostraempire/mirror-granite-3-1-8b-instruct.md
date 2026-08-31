# NostraEmpire/mirror-granite-3.1-8b-instruct

## Resumen

El modelo `NostraEmpire/mirror-granite-3.1-8b-instruct` es un espejo (mirror) en Hugging Face del modelo original `ibm-granite/granite-3.1-8b-instruct`, desarrollado por el equipo Granite de IBM. Se trata de un modelo de lenguaje de 8 mil millones de parámetros, ajustado para instrucciones y optimizado para tareas de contexto largo. El ajuste se realizó a partir del modelo base `granite-3.1-8b-base` mediante una combinación de datasets de instrucciones de código abierto con licencias permisivas y datasets sintéticos internos, empleando técnicas como supervisión finetuning, alineación con aprendizaje por refuerzo y fusión de modelos.

La relevancia de este modelo radica en su equilibrio entre tamaño (8B) y capacidades avanzadas: soporta 12 idiomas, función de llamada a herramientas (function calling), tareas de código, RAG y manejo de contextos largos. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para aplicaciones empresariales. El espejo publicado por NostraEmpire no introduce cambios funcionales; es una copia idéntica del original, con la misma arquitectura y pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite 3.1) |
| Parametros totales | 8.170.848.256 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo se describe como "long-context", pero no se especifica el número exacto en la informacion proporcionada) |
| Tipos de cuantizacion | No especificados en la ficha; al ser un mirror, se pueden generar cuantizaciones GGUF, GPTQ, AWQ a partir de los pesos safetensors |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en otros formatos via comunidad) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only, similar a otros modelos de la familia Granite. No es un modelo MoE, sino denso, con 8B de parametros. El entrenamiento se realizo en dos fases: primero un preentrenamiento del modelo base `granite-3.1-8b-base` (cuyos detalles de datos y tokens no se incluyen en la informacion proporcionada), y posteriormente un ajuste fino supervisado (SFT) con datasets de instrucciones de codigo abierto y datasets sinteticos internos disenados especificamente para problemas de contexto largo. Ademas, se aplicaron tecnicas de alineacion mediante aprendizaje por refuerzo (RL) y fusion de modelos (model merging) para mejorar la calidad de las respuestas y la adherencia a instrucciones.

Una innovacion destacable es el uso de un formato de chat estructurado, que permite conversaciones multi-turno y la integracion de herramientas externas (function calling). El modelo esta disenado para manejar tareas que requieren razonamiento sobre documentos extensos, como resumen de reuniones o preguntas y respuestas sobre documentos largos.

## Capacidades

- Generacion de texto y respuestas a instrucciones generales en 12 idiomas.
- Resumen de textos, incluyendo documentos largos y reuniones.
- Clasificacion de texto y extraccion de informacion.
- Preguntas y respuestas (QA) sobre documentos, con soporte para contexto largo.
- Generacion y comprension de codigo, incluyendo tareas de programacion.
- Function calling (llamada a herramientas) para integracion con APIs y agentes.
- RAG (Retrieval Augmented Generation) para combinar recuperacion de informacion con generacion.
- Dialogo multilingue y asistentes conversacionales.
- Tareas de razonamiento multi-paso y agentes simples.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto de la interaccion y derivando a herramientas externas (como sistemas de tickets) mediante function calling.
- Resumen de documentos legales o financieros: gracias a su capacidad de contexto largo, puede procesar contratos o informes extensos y generar resumenes ejecutivos precisos.
- Asistente de programacion en entornos de desarrollo: integrado en IDEs o pipelines de CI/CD, puede generar fragmentos de codigo, explicar errores o sugerir refactorizaciones, con soporte para multiples lenguajes.
- Sistema de preguntas y respuestas sobre documentacion corporativa: combinado con un motor de RAG, permite consultar manuales internos o bases de conocimiento y obtener respuestas contextualizadas.
- Traduccion y localizacion de contenido: al soportar 12 idiomas, puede traducir textos manteniendo coherencia y estilo, aunque no esta especializado en traduccion como un modelo dedicado.
- Analisis de sentimiento y clasificacion de opiniones en redes sociales o encuestas: su capacidad de clasificacion de texto permite etiquetar comentarios en multiples idiomas.
- Agente de automatizacion de tareas ofimaticas: mediante function calling, puede interactuar con calendarios, correos o APIs de productividad para programar reuniones o enviar recordatorios.

## Benchmarks y rendimiento

Segun la model card original, los resultados en el HuggingFace Open LLM Leaderboard V1 son los siguientes:

| Modelo | ARC-Challenge | Hellaswag | MMLU | TruthfulQA | Winogrande | GSM8K | Avg |
|---|---|---|---|---|---|---|---|
| Granite-3.1-8B-Instruct | 62.62 | 84.48 | 65.34 | 66.23 | 75.37 | 73.84 | 71.31 |
| Granite-3.1-2B-Instruct | 54.61 | 75.14 | 55.31 | 59.42 | 67.48 | 52.76 | 60.79 |
| Granite-3.1-3B-A800M-Instruct | 50.42 | 73.01 | 52.19 | 49.71 | (dato no disponible) | (dato no disponible) | (dato no disponible) |

No se dispone de benchmarks adicionales en la informacion proporcionada. El modelo supera claramente a sus hermanos menores en todas las metricas, con una media de 71.31.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, el modelo requiere aproximadamente 16 GB de VRAM (8B parametros x 2 bytes). Con cuantizacion INT8, se reduce a ~8 GB; con INT4, ~4 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantizacion INT4, una RTX 3060 (12 GB) o RTX 4070 (12 GB) puede funcionar.
- Si cabe en GPU de consumo: si, con cuantizacion INT4 o INT8 cabe en GPUs de gama media-alta (12-16 GB). En FP16 requiere una GPU de 24 GB o mas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), Transformers con accelerate.
- Latencia y throughput: no se proporcionan datos especificos. En una A100, se puede esperar un throughput de decenas de tokens por segundo, pero depende de la implementacion y el batch size.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de 8B en la informacion proporcionada. A modo cualitativo, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-3.1-8B-Instruct (este) | 8B | No especificado (largo) | Apache 2.0 | Multilingue, function calling |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (uso comercial permitido) | Muy popular, amplio ecosistema |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Eficiente, pero contexto menor |
| Qwen 2.5 7B Instruct | 7B | 128K | Apache 2.0 | Multilingue, fuerte en codigo |

La comparacion cuantitativa no es posible con los datos disponibles, pero Granite 3.1 destaca por su licencia permisiva y su enfoque en contextos largos y function calling.

## Limitaciones y advertencias

- Sesgos: al ser entrenado con datos de internet y datasets sinteticos, puede reflejar sesgos presentes en esos datos. IBM recomienda evaluar el modelo en casos de uso especificos antes de desplegarlo en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de QA o generacion de codigo. Se recomienda validar las salidas.
- Limitaciones de contexto: aunque esta disenado para contexto largo, no se especifica el limite exacto. En la practica, el rendimiento puede degradarse con contextos extremadamente largos.
- Idiomas: solo soporta 12 idiomas de forma nativa; para otros idiomas, se requiere fine-tuning adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se proporciona una garantia de exactitud o idoneidad para fines especificos.
- Caveat de produccion: al ser un mirror, no hay garantia de mantenimiento o actualizaciones por parte de NostraEmpire. Se recomienda usar el modelo original de IBM para soporte oficial.

## Enlaces

- HuggingFace (mirror): https://huggingface.co/NostraEmpire/mirror-granite-3.1-8b-instruct
- HuggingFace (original): https://huggingface.co/ibm-granite/granite-3.1-8b-instruct
- Repositorio GitHub: https://github.com/ibm-granite/granite-3.1-language-models
- Documentacion Granite: https://www.ibm.com/granite/docs/
- Coleccion de modelos Granite 3.1: https://huggingface.co/collections/ibm-granite/granite-31-language-models-6751dbbf2f3389bec5c6f02d
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-8b-base
