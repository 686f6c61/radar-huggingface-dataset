# m1b/kairos_multitask_100K

## Resumen

Kairos multitask 100K es un checkpoint de política robótica publicado por el usuario m1b en Hugging Face bajo el identificador `m1b/kairos_multitask_100K`. Se trata de un modelo de control para manipulación robótica entrenado sobre el dataset `robodojo_nine_v1_ace_20260923` con un espacio de acciones de 14 dimensiones (`robodojo_dual_x5_absolute_joint_14d`), lo que sugiere un robot bimanual de dos brazos con cinco grados de libertad por brazo más pinzas. El repositorio ocupa 18,4 GB y contiene pesos y estadísticas de normalización organizados en particiones (`p2/`, `p3/`).

La model card es extremadamente escueta y de carácter puramente operativo: no documenta arquitectura, número de parámetros, licencia ni idiomas. La información disponible indica que el modelo parte de un checkpoint previo (`m1b/kairos_all_in_one_rmbenchpp_20K`, paso 100.000) y que se ha afinado en dos fases: 4.000 pasos de episodios completos con 8 GPU A800 y learning rate 1e-4, seguidos de 2.000 pasos centrados en memoria. La rama de desarrollo (`research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards`) sugiere trabajo sobre tokens de memoria y optimización de velocidad.

Su relevancia es limitada fuera del contexto de investigación en el que se publica: no hay métricas publicadas, ni pipeline declarado, ni descargas ni interacciones. Es un artefacto de investigación reproducible (se indica commit de código `d6f50cbd9e568632d50d0d401609c7f42823039b`) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acciones, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 18,4 GB; se citan checkpoints `.pt` en el proceso de entrenamiento) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La model card únicamente describe el proceso de entrenamiento y el esquema de datos. El modelo se entrena sobre `robodojo_nine_v1_ace_20260923` con acciones de 14 dimensiones en espacio de juntas absolutas (`robodojo_dual_x5_absolute_joint_14d`), lo que apunta a un robot de dos brazos con cinco articulaciones por brazo y una pinza por brazo (5 + 1 pinza) × 2 = 14 dimensiones.

El entrenamiento se realizó en dos fases sobre el checkpoint `100k/step_100000.pt` del modelo `m1b/kairos_all_in_one_rmbenchpp_20K`. La fase `p2/` comprende 4.000 pasos sobre episodios completos de juntas, ejecutada en 1 nodo de 8 GPU A800 con learning rate 1e-4. La fase `p3/` añade 2.000 pasos "memory-only" partiendo de `p2/step_004000.pt`. La normalización es por dimensión con minmax a [-1, 1]; las dimensiones con rango inferior a 1e-4 se fijan a `x - min` y el resultado se recorta a [-5, 5]. Las estadísticas están en `p2/normalization_stats.json` y `p3/normalization_stats.json`. No se documenta el número de tokens, la composición del dataset, ni si se empleó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generación de acciones de control robótico en espacio de juntas absolutas de 14 dimensiones (robot bimanual).
- Ejecución de tareas multitarea derivadas del dataset `robodojo_nine_v1_ace_20260923`.
- Soporte de "memory tokens" para retención de información entre pasos, según la rama de desarrollo y la fase de entrenamiento `p3/`.
- No hay evidencia de capacidades de lenguaje, visión, tool calling, razonamiento multi-paso ni multilingüismo.
- No se documentan capacidades de agente ni de planificación de alto nivel.

## Casos de uso

- Investigación en aprendizaje por imitación bimanual: el checkpoint sirve como punto de partida o referencia para experimentos de manipulación con dos brazos, dado que las acciones son de 14 dimensiones en juntas absolutas.
- Reproducción de experimentos: con el commit de código indicado (`d6f50cbd9e568632d50d0d401609c7f42823039b`) y los ficheros de normalización publicados, un equipo puede replicar el pipeline de evaluación sobre `robodojo_nine_v1_ace_20260923`.
- Evaluación de "memory tokens" en políticas robóticas: la fase `p3/` está específicamente entrenada en memoria, lo que permite comparar el comportamiento con y sin retención entre pasos.
- Baseline para fine-tuning multitarea: al derivar de `kairos_all_in_one_rmbenchpp_20K`, puede usarse como inicialización para nuevas tareas del mismo dominio de robot.
- Estudio de normalización de acciones: las estadísticas por dimensión con recorte a [-5, 5] son un artefacto reutilizable para entrenar políticas con el mismo esquema de acciones.
- Docencia y divulgación: ejemplo de proceso de entrenamiento distribuido (8× A800) con fases diferenciadas y control de versiones por rama y commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (18,4 GB) incluye varios checkpoints y estadísticas, no necesariamente un único conjunto de pesos.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU A800; no se documenta el hardware de inferencia.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se declara pipeline en Hugging Face ni se mencionan vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a una política de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni métricas que permitan establecer una comparación.

## Limitaciones y advertencias

- La model card no documenta licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas; al ser una política de acciones, estos riesgos se trasladan a comportamientos físicos no verificados en entornos reales.
- El modelo está atado a un esquema de acciones concreto (14 dimensiones, juntas absolutas) y a un dataset específico; no es reutilizable fuera de ese dominio sin reentrenamiento.
- No se publican métricas de éxito, tasas de error ni evaluaciones en simulación o realidad, lo que impide estimar su fiabilidad.
- El repositorio no declara pipeline ni formato de pesos estándar, lo que complica la carga directa con herramientas habituales.
- La rama de desarrollo y el commit citados indican un estado de investigación, no una versión estable.
- Cero descargas y cero interacciones en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_multitask_100K
- Modelo base citado: `m1b/kairos_all_in_one_rmbenchpp_20K` (referenciado en la model card; no se proporciona URL directa)
- Dataset citado: `robodojo_nine_v1_ace_20260923` (referenciado en la model card; no se proporciona URL directa)
- Commit de código: `d6f50cbd9e568632d50d0d401609c7f42823039b` (sin repositorio asociado en la información disponible)
- Rama de desarrollo: `research-marina/v16.3_memory_tokens_speed_opt_rmbenchpp_relocate_cards` (sin repositorio asociado en la información disponible)
