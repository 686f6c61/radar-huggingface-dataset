# ApolloRaines/Llama-3.1-8B-Instruct_Abliterated

## Resumen

Llama-3.1-8B-Instruct_Abliterated es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. Esta herramienta aplica técnicas de *representation engineering* (concretamente *abliteration*) directamente sobre los pesos del modelo, eliminando quirúrgicamente los comportamientos de rechazo entrenados sin necesidad de fine-tuning ni entrenamiento adicional. El resultado es un modelo que responde a todas las peticiones sin negarse, conservando el conocimiento, la fluidez y las capacidades de razonamiento del modelo original.

El modelo mantiene la arquitectura LlamaForCausalLM con 8.030 millones de parámetros y una ventana de contexto de 128K tokens (heredada del modelo base, aunque no se especifica en la model card). Está disponible en formato safetensors con precisión bf16 y se distribuye bajo la licencia Llama 3.1 Community License. Su relevancia radica en que ofrece una alternativa a los modelos "censurados" para casos de uso donde se requiere una generación sin restricciones, como investigación en alineación, análisis de contenido o creación literaria no filtrada, aunque con los riesgos asociados a la eliminación de guardarraíles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, transformer denso) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos originales en bf16; cuantizable a 8, 4 o 2 bits con herramientas externas) |
| Idiomas soportados | en (model card); el base es multilingue, pero no se confirma en esta variante |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer denso con 32 capas, atención con *grouped query attention* (GQA) y *rotary positional embeddings* (RoPE). La modificación se realiza con jBlaze, una herramienta de "cirugía conductual" que identifica y elimina direcciones unidireccionales en el espacio de representación interno asociadas al comportamiento de rechazo. No se realizó ningún entrenamiento adicional: los pesos se modifican directamente mediante operaciones algebraicas sobre las activaciones, una técnica similar a la *abliteration* descrita por FailSpy y popularizada por mlabonne. El proceso preserva las capacidades generales del modelo, pero elimina la tendencia a negarse ante peticiones que el modelo original consideraría inapropiadas.

## Capacidades

- Generacion de texto fluida y coherente en ingles, con razonamiento y conocimiento general heredados del modelo base.
- Razonamiento multi-paso y resolucion de problemas matematicos y logicos (capacidades del base, no verificadas en esta variante).
- Generacion de codigo en multiples lenguajes de programacion, con soporte de *tool calling* y *function calling* (heredado del base).
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno con contexto largo (hasta 128K tokens).
- Capacidad especial: responde a todas las peticiones sin rechazo, incluyendo temas que el modelo base bloquearia (contenido explicito, violencia, etc.).
- Soporte de agentes y *multi-step reasoning* gracias a la ventana de contexto amplia y al entrenamiento instruct del base.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: permite estudiar el comportamiento de un modelo sin guardarrailes, comparando respuestas con el base para analizar el impacto de la *abliteration* en la utilidad y la seguridad.
- Generacion de ficcion y narrativa sin restricciones: escritores pueden explorar tramas con violencia, sexo o temas tabu sin que el modelo se niegue, manteniendo calidad literaria.
- Analisis de contenido sensible: en entornos controlados, el modelo puede procesar y resumir textos con contenido explicito (por ejemplo, informes forenses o literatura) sin filtros automaticos.
- Creacion de personajes de rol (roleplay) avanzado: el modelo mantiene la coherencia del personaje incluso en escenarios que el base rechazaria, util para juegos de rol o simulaciones.
- Evaluacion de sesgos y comportamientos indeseados: al eliminar el rechazo, se pueden provocar respuestas que revelen sesgos latentes del modelo base, util para auditorias de seguridad.
- Desarrollo de asistentes especializados en dominios donde el rechazo es un obstaculo (por ejemplo, educacion sexual, asesoria legal sobre temas controvertidos), siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones cuantitativas, y no se encontraron datos externos en la busqueda web. Se asume que el rendimiento es similar al del modelo base Llama-3.1-8B-Instruct, pero no hay evidencia que lo confirme.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 16 GB (8.03B parametros x 2 bytes). Con cuantizacion a 8 bits se reduce a ~8 GB, y a 4 bits a ~4-5 GB.
- GPU recomendadas: para inferencia en bf16 se necesita una GPU con al menos 16 GB (RTX 4080, RTX 4090, A100 40GB, etc.). Con cuantizacion 4 bits cabe en GPUs de 8 GB (RTX 3060, RTX 4060, etc.).
- Si cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) sin cuantizar, y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles. Para un modelo de 8B en una RTX 4090, se espera una generacion de 50-100 tokens/s con vLLM, pero no hay datos medidos para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tecnica | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K | Llama 3.1 Community | Instruct (RLHF) | HuggingFace |
| ApolloRaines/Llama-3.1-8B-Instruct_Abliterated | 8.03B | 128K (heredado) | Llama 3.1 Community | jBlaze (abliteration) | HuggingFace |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8.03B | 128K (heredado) | Llama 3.1 Community | Abliteration (FailSpy) | HuggingFace |

Ambas variantes abliterated eliminan el rechazo, pero usan implementaciones distintas. La de mlabonne es ampliamente conocida y evaluada en el Open LLM Leaderboard; la de ApolloRaines usa jBlaze, una herramienta propietaria, y no tiene evaluaciones publicas. El rendimiento en tareas generales deberia ser similar al base, pero no hay datos comparativos.

## Limitaciones y advertencias

- Al eliminar los guardarrailes de rechazo, el modelo puede generar contenido dañino, ilegal o eticamente problematico sin filtro. Su uso en produccion requiere supervisión humana y medidas de seguridad adicionales.
- No se han realizado evaluaciones de sesgos ni de alucinacion en esta variante; se heredan los riesgos del modelo base, que ya presenta sesgos conocidos y tendencia a alucinar en contextos ambiguos.
- La model card solo declara ingles como idioma, aunque el base es multilingue; no se ha verificado el comportamiento en otros idiomas.
- La licencia Llama 3.1 Community permite uso comercial, pero con restricciones (por ejemplo, no usar para mejorar otros modelos grandes sin autorizacion). Ademas, el uso de contenido generado sin filtros puede violar politicas de plataformas o leyes locales.
- No hay garantias de que la *abliteration* sea perfecta: pueden quedar residuos de rechazo o, por el contrario, degradarse otras capacidades no evaluadas.
- La herramienta jBlaze es propietaria y no se documenta el proceso exacto, lo que dificulta la reproducibilidad y la auditoria del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Abliterated
- Herramienta jBlaze: https://jblaze.dev
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante abliterated de mlabonne (referencia): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Articulo sobre abliteration (referencia externa, no incluido en la busqueda): no disponible en los resultados proporcionados
