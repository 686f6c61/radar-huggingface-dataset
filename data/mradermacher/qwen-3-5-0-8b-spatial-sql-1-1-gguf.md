# mradermacher/Qwen-3.5-0.8B-Spatial-SQL-1.1-GGUF

## Resumen

`mradermacher/Qwen-3.5-0.8B-Spatial-SQL-1.1-GGUF` es una versión cuantizada en formato GGUF del modelo `markrodrigo/Qwen-3.5-0.8B-Spatial-SQL-1.1`, un modelo de lenguaje especializado en la generación de consultas SQL espaciales para sistemas de información geográfica (GIS) y bases de datos espaciales como PostGIS. La cuantización ha sido realizada por mradermacher, conocido por publicar conversiones de modelos en GGUF para su uso con llama.cpp, Ollama y otros motores de inferencia local.

El modelo base, desarrollado por markrodrigo, parte de la familia Qwen3.5 de Alibaba con 0,8 mil millones de parámetros (752 millones exactamente), y ha sido afinado específicamente para tareas de SQL espacial. Esta versión GGUF está pensada para entornos con recursos limitados, permitiendo ejecutar el modelo en hardware de consumo sin sacrificar demasiado la calidad de las respuestas. La licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones propietarias.

La relevancia de este modelo radica en la creciente demanda de asistentes de código especializados en dominios concretos, como el geoespacial, donde las consultas SQL requieren conocimientos específicos de funciones espaciales, operadores y extensiones. Su tamaño compacto lo hace ideal para despliegues en edge, integración en herramientas de desarrollo y automatización de tareas GIS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-0.8B soporta hasta 262 000 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `markrodrigo/Qwen-3.5-0.8B-Spatial-SQL-1.1`. Por el nombre y el tamaño, se infiere que se trata de un transformer decoder-only similar a la serie Qwen3.5 de Alibaba, con atención estándar y posiblemente alguna optimización de eficiencia propia de esa familia. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se aplicaron técnicas de RLHF o DPO.

La especialización en SQL espacial sugiere que el fine-tuning se realizó sobre un corpus de consultas PostGIS, funciones espaciales (ST_Intersects, ST_DWithin, ST_Transform, etc.) y esquemas de bases de datos geográficas. Tampoco se documentan innovaciones técnicas específicas en esta variante, más allá de la cuantización GGUF aplicada por mradermacher, que permite reducir el tamaño del modelo entre un 40 % y un 70 % dependiendo de la precisión elegida.

## Capacidades

- Generacion de consultas SQL espaciales: el modelo está afinado para producir sentencias SQL válidas para PostGIS y otros motores geoespaciales, incluyendo funciones como ST_Contains, ST_Buffer o ST_Area.
- Soporte multilingue: cubre inglés y chino, lo que permite atender a usuarios en ambos idiomas.
- Generacion de codigo: aunque su foco es SQL espacial, puede generar otras variantes de SQL y fragmentos de codigo relacionados con GIS.
- Conversacional: el modelo admite interacciones de tipo chat, respondiendo a preguntas sobre bases de datos espaciales y ayudando a depurar consultas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de consultas para analistas GIS: un analista puede describir en lenguaje natural un análisis espacial (por ejemplo, "encuentra todos los parques dentro de 2 km de cada escuela") y el modelo genera la consulta PostGIS correspondiente, acelerando el trabajo diario.
- Generacion de consultas para ETL geoespacial: en pipelines de integración de datos, el modelo puede producir consultas SQL para transformar y cargar datos espaciales en bases de datos PostGIS, reduciendo el tiempo de desarrollo.
- Educacion y formacion en SQL espacial: estudiantes y profesionales pueden usarlo como herramienta de aprendizaje, pidiendo explicaciones de funciones espaciales o ejemplos de consultas para practicar.
- Automatizacion de informes geoespaciales: en entornos empresariales, el modelo puede generar consultas para extraer métricas espaciales (densidad, cobertura, proximidad) que alimenten cuadros de mando y reportes.
- Integracion en herramientas de desarrollo: puede integrarse en editores de codigo o CLI para ofrecer autocompletado y sugerencias de consultas espaciales en tiempo real, gracias a su pequeño tamaño y baja latencia.
- Soporte tecnico en bases de datos espaciales: como chatbot en plataformas de soporte, puede responder preguntas frecuentes sobre PostGIS, errores comunes de sintaxis o mejores prácticas de indexación espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni evaluaciones específicas de SQL espacial para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el modelo ocupa entre 0,5 GB (Q2_K) y 1,6 GB (f16). Con Q4_K_M (0,6 GB) se obtiene un buen equilibrio entre calidad y uso de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas. Una RTX 3050, RTX 3060 o incluso una GTX 1650 son suficientes. Para las versiones f16 o Q8_0, se recomienda al menos 4 GB de VRAM.
- Compatibilidad con consumer GPU: sí, es totalmente viable en hardware de consumo, incluyendo portátiles con GPU integrada si se usa una cuantización baja (Q3_K_M o inferior).
- Opciones de despliegue: al ser GGUF, puede ejecutarse con llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI como llama.cpp server o llama-server.
- Latencia y throughput: al ser un modelo pequeño, la generación es muy rápida. En una GPU moderna (RTX 3060 o superior), se pueden alcanzar decenas de tokens por segundo; en CPU, varios tokens por segundo con cuantizaciones bajas. No se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el ámbito de SQL espacial. Como referencia general, se pueden mencionar otros modelos pequeños de generación de SQL (por ejemplo, CodeLlama-7B-Instruct o SQLCoder-7B), pero son de mayor tamaño y no están especializados en funciones espaciales. Dado que no hay datos de rendimiento de este modelo, no es posible realizar una comparación cuantitativa. Se recomienda evaluar el modelo en un conjunto propio de consultas espaciales para determinar su idoneidad.

## Limitaciones y advertencias

- Al ser un modelo de solo 0,75 B de parámetros, su capacidad de razonamiento complejo es limitada. Puede generar consultas incorrectas o incompletas en casos que requieran lógica avanzada o múltiples joins espaciales.
- No se ha documentado el contexto máximo real de esta variante. Aunque el modelo base Qwen3.5-0.8B soporta hasta 262 000 tokens, el fine-tuning podría haber reducido esa ventana. Se recomienda probar con contextos largos antes de usarlo en producción.
- La especialización en SQL espacial puede hacer que el modelo tenga un rendimiento pobre fuera de ese dominio. No debe usarse para tareas generales de programación o razonamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar funciones SQL que no existen o malinterpretar nombres de columnas. Es imprescindible validar las consultas generadas antes de ejecutarlas.
- Sesgos lingüísticos: al estar entrenado principalmente en inglés y chino, puede tener un rendimiento inferior en otros idiomas, aunque la generación de SQL es en gran medida independiente del idioma natural.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero no incluye garantías. El modelo se proporciona "tal cual".
- Los quants con imatrix no están disponibles en el momento de la publicación; solo se ofrecen cuantizaciones estáticas, que pueden tener una calidad ligeramente inferior a las dinámicas para el mismo tamaño.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen-3.5-0.8B-Spatial-SQL-1.1-GGUF
- Modelo base (safetensors): https://huggingface.co/markrodrigo/Qwen-3.5-0.8B-Spatial-SQL-1.1
- Página de descarga y resumen de quants: https://hf.tst.eu/model#Qwen-3.5-0.8B-Spatial-SQL-1.1-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Reflexiones sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
