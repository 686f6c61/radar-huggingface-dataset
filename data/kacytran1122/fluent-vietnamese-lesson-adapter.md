# kacytran1122/fluent-vietnamese-lesson-adapter

## Resumen

Fluent Vietnamese Lesson Adapter es un adaptador LoRA de rango 32 publicado por el usuario kacytran1122 para el modelo base Qwen/Qwen3-14B. Su propósito es transformar material de estudio en bruto (transcripciones de clases, pasajes de lectura) en lecciones estructuradas de vietnamés para estudiantes angloparlantes, incluyendo resúmenes, listas de vocabulario de hasta 20 elementos, definiciones, ejemplos, sinónimos y raíces léxicas.

El adaptador no es un modelo autónomo: requiere cargar Qwen3-14B (14 000 millones de parámetros, arquitectura transformer densa de la familia Qwen3) y superponer los pesos LoRA mediante la librería PEFT. El repositorio ocupa 0,3 GB, lo que corresponde exclusivamente a los pesos del adaptador en formato safetensors.

Su relevancia es acotada pero clara: demuestra el patrón de especialización mediante LoRA sobre modelos abiertos de gran tamaño para dominios educativos concretos, con licencia Apache 2.0 y soporte de los idiomas inglés y vietnamés. No se han publicado métricas de evaluación ni detalles del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer denso Qwen3-14B |
| Parametros totales | 14 000 millones (modelo base); el adaptador añade un subconjunto de pesos LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones habituales (GGUF, AWQ, GPTQ) no verificadas en esta ficha |
| Idiomas soportados | ingles (en), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA de rango 32 sobre Qwen3-14B, un transformer denso de 14 000 millones de parámetros. La librería declarada es PEFT y el pipeline es text-generation. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo base.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del adaptador. La model card indica explícitamente que las transcripciones de entrenamiento, los datos de evaluación, las credenciales y la información de usuarios no están incluidos en el repositorio. La tarea declarada es la generación estructurada de lecciones y vocabulario.

## Capacidades

- Generación de texto orientada a contenido educativo estructurado.
- Resúmenes y explicaciones de material de estudio (transcripciones, pasajes).
- Generación de listas de vocabulario vietnamita de hasta 20 elementos con definiciones, ejemplos, sinónimos y raíces léxicas.
- Producción de material de repaso simplificado para estudiantes de inglés.
- Soporte bilingüe inglés-vietnamita en la generación.
- Personalización mediante instrucciones sobre nivel del estudiante, idioma preferido, tema y número de elementos de vocabulario.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking específico del adaptador.

## Casos de uso

- Generación de lecciones a partir de transcripciones de clase: se introduce el texto de una sesión y se solicita un resumen con ideas clave y vocabulario, aprovechando el ajuste específico del adaptador para este formato.
- Creación de listas de vocabulario para autoaprendizaje: el adaptador produce hasta 20 elementos con definición, ejemplo, sinónimos y raíces, adecuado para fichas de repaso de estudiantes angloparlantes de vietnamita.
- Material de repaso para cursos de ESL: a partir de un pasaje en inglés, el modelo genera explicaciones simplificadas y vocabulario asociado en vietnamita.
- Preparación de contenido para plataformas de aprendizaje de idiomas: integración en un pipeline de generación por lotes donde cada transcripción se convierte en una lección estructurada lista para revisión humana.
- Apoyo a profesores de vietnamita: generación rápida de borradores de lecciones y glosarios que el docente revisa y adapta al nivel del grupo.
- Enriquecimiento léxico de materiales existentes: dado un texto, obtener definiciones, sinónimos y raíces para ampliar el vocabulario trabajado en una unidad didáctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo (0,3 GB) no es ejecutable: requiere cargar Qwen3-14B completo.
- VRAM estimada para el modelo base en precisión completa (BF16/FP16): aproximadamente 28 GB solo para pesos, más memoria para KV cache y activaciones, lo que en la práctica exige GPUs de 40-80 GB (A100 40/80 GB, H100) para contextos largos.
- En cuantización de 8 bits: en torno a 16 GB de VRAM; en 4 bits: en torno a 9-10 GB, lo que permite ejecución en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080, con margen limitado para contexto.
- Despliegue: PEFT + Transformers (según el ejemplo de la model card), y potencialmente vLLM, TGI o llama.cpp con soporte de adaptadores LoRA, aunque no se documenta compatibilidad verificada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluent Vietnamese Lesson Adapter | 14 000 M (base) + LoRA r32 | no disponible | Lecciones y vocabulario vietnamita | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-14B (base) | 14 000 M | no disponible en esta ficha | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| Adaptadores LoRA educativos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores comparables de la misma categoría (especialización en enseñanza de vietnamita) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no funciona de forma autónoma: debe combinarse con Qwen3-14B; los pesos del modelo base no están incluidos.
- No se han publicado datos de evaluación, por lo que el rendimiento real en generación de lecciones no está verificado.
- El conjunto de entrenamiento no es público, lo que impide auditar posibles sesgos o calidad de los datos.
- Riesgo de alucinación inherente al modelo base: definiciones, ejemplos o raíces léxicas pueden ser incorrectos y requieren revisión humana en contextos educativos.
- Cobertura idiomática limitada a inglés y vietnamita; no se documenta comportamiento en otros idiomas.
- Sin datos sobre longitud de contexto efectiva del adaptador ni sobre degradación con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir también la licencia del modelo base Qwen3-14B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kacytran1122/fluent-vietnamese-lesson-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Sitio del proyecto: https://learnfluent.app
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
